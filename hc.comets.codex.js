// HC comets subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  window.HC.initComets = () => {
    const World = window.World || (window.HC.getWorld && window.HC.getWorld());
    const Events = window.Events;
    const View = window.View || (window.HC.getView && window.HC.getView());
    const Camera = window.Camera || (window.HC.getCamera && window.HC.getCamera());
    const rand = window.rand;
    const clamp = (window.HC.Util && window.HC.Util.clamp) || window.clamp;
    const meteorBaseRadius = window.meteorBaseRadius;
    const massFromR = window.massFromR;
    const getWorldViewBounds = window.getWorldViewBounds;
    const hueFromName = window.hueFromName;
    const addPlanetRingMark = window.addPlanetRingMark;
    const getDirectOrbitersOfBody = window.getDirectOrbitersOfBody;
    const buildColorWeightsFromOrbiters = window.buildColorWeightsFromOrbiters;
    const computeRockyParamsFromOrbiters = window.computeRockyParamsFromOrbiters;
    const buildBlobPatchwork = window.buildBlobPatchwork;
    const makeRng = (window.HC.Util && window.HC.Util.makeRng) || window.makeRng;
    const hash32 = (window.HC.Util && window.HC.Util.hash32) || window.hash32;
    const removeOrbitersConsumed = window.removeOrbitersConsumed;

    function setBodyOrbitRadius(body, currentRadius) {
      if (!body) return;
      const isAsteroid = body.type === "asteroid";
      const mul = isAsteroid
        ? (typeof World.metaOrbitMulAsteroid === "number" ? World.metaOrbitMulAsteroid : 1)
        : (typeof World.metaOrbitMulPlanet === "number" ? World.metaOrbitMulPlanet : 1);
      const safeMul = Number.isFinite(mul) ? mul : 1;
      const baseRadius = safeMul !== 0 ? (currentRadius / safeMul) : currentRadius;
      body.orbitNativeRadius = baseRadius;
      body.orbitCurrentRadius = currentRadius;
      body.orbitPx = currentRadius;
    }

    /* =========================
       COMETS (MONOLITH) — Part A: Config + State
       ========================= */
    World.comets = [];
    const Comets = (() => {
      const CONFIG = {
        enabled: true,
        spawn: {
          useTime: true,
          timeRangeSec: [30, 60],
          useMeteorCount: true,
          meteorRange: [60, 120],
          hybridMode: "OR", // "OR" / "AND"
        },
        types: [
          { id: "normal", weight: 70, radiusMul: 1.5, massMul: 1.0, speedMul: 1.0 },
          { id: "heavy",  weight: 20, radiusMul: 2.2, massMul: 2.5, speedMul: 0.9 },
          { id: "tiny",   weight: 10, radiusMul: 1.1, massMul: 0.7, speedMul: 1.15 },
        ],
        tail: {
          // placeholder: stars not implemented yet; we keep a small tail always
          baseLenMul: 3.0,
        },
        visual: {
          halo: "rgba(200,220,255,0.18)",
          coreA: "rgba(120,170,255,0.95)",
          coreB: "rgba(170,120,255,0.95)",
          tail: "rgba(140,180,255,0.22)",
        }
      };

      // event override (e.g. comet shower card)
      let event = null; // { endAtMs, override:{types, spawn}, restoreSpawn }

      const spawnState = {
        nextAtMs: 0,
        nextMeteorTrigger: 0,
        meteorsSinceLast: 0,
      };

      function resetSpawner(nowMs) {
        spawnState.meteorsSinceLast = 0;
        const sp = getSpawn();
        spawnState.nextAtMs = nowMs + rand(sp.timeRangeSec[0], sp.timeRangeSec[1]) * 1000;
        spawnState.nextMeteorTrigger = ((Math.random() * (sp.meteorRange[1] - sp.meteorRange[0] + 1)) | 0) + sp.meteorRange[0];
      }

      function onMeteorSpawned() {
        spawnState.meteorsSinceLast++;
      }

      function getTypes() { return (event?.override?.types) || CONFIG.types; }
      function getSpawn() { return (event?.override?.spawn) || CONFIG.spawn; }

      function weightedPick(list) {
        const total = list.reduce((s, t) => s + (t.weight || 1), 0);
        let r = Math.random() * total;
        for (const it of list) {
          r -= (it.weight || 1);
          if (r <= 0) return it;
        }
        return list[list.length - 1];
      }

      function spawnComet() {
        const type = weightedPick(getTypes());
        const baseR = meteorBaseRadius();
        const r = baseR * type.radiusMul;
        const mass = (r * r) * type.massMul;

        // a bit faster than meteor
        const speed = rand(0.18, 0.32) * View.worldScale * type.speedMul;

        const s = spawnFromEdge(speed, r);

        World.comets.push({
          x: s.x, y: s.y,
          vx: s.vx, vy: s.vy,
          r,
          mass,
          typeId: type.id,
          tailLen: r * 2 * CONFIG.tail.baseLenMul,
        });
      }

      function spawnFromEdge(speed, r) {
        const b = getWorldViewBounds();
        const side = (Math.random() * 4) | 0;
        let x = 0, y = 0;

        if (side === 0) { x = rand(b.l, b.r); y = b.t - r * 2; }
        if (side === 1) { x = b.r + r * 2; y = rand(b.t, b.b); }
        if (side === 2) { x = rand(b.l, b.r); y = b.b + r * 2; }
        if (side === 3) { x = b.l - r * 2; y = rand(b.t, b.b); }

        // aim toward a random interior point within the current visible world
        const tx = rand(b.l + (b.r - b.l) * 0.2, b.l + (b.r - b.l) * 0.8);
        const ty = rand(b.t + (b.b - b.t) * 0.2, b.t + (b.b - b.t) * 0.8);
        const dx = tx - x, dy = ty - y;
        const len = Math.hypot(dx, dy) || 1;

        return { x, y, vx: (dx / len) * speed, vy: (dy / len) * speed };
      }

      /* =========================
         COMETS — Part B: Update + Collisions
         ========================= */
      function update(dt, nowMs) {
        if (!CONFIG.enabled) return;

        // end event
        if (event && nowMs >= event.endAtMs) {
          CONFIG.spawn = event.restoreSpawn;
          event = null;
        }

        updateSpawner(nowMs);

        for (let i = World.comets.length - 1; i >= 0; i--) {
          const c = World.comets[i];
          c.hitCooldown = Math.max(0, (c.hitCooldown || 0) - dt);

          // gravity from planets (simple bend)
          for (const p of World.planets) {
            const dx = p.x - c.x, dy = p.y - c.y;
            const d2 = dx*dx + dy*dy;
            if (d2 < 4) continue;
            const inv = 1 / Math.sqrt(d2);
            const ax = dx * inv, ay = dy * inv;
            const G = 0.18; // tuned small
            const acc = (G * (p.mass || (p.r*p.r))) / d2;
            c.vx += ax * acc * dt;
            c.vy += ay * acc * dt;
          }

          c.x += c.vx * dt;
          c.y += c.vy * dt;

          // cleanup far out
          if (c.x < -400 || c.x > View.w + 400 || c.y < -400 || c.y > View.h + 400) {
            World.comets.splice(i, 1);
          }
        }

        handleCollisions(dt, nowMs);
      }

      function updateSpawner(nowMs) {
        const sp = getSpawn();
        const timeReady = sp.useTime ? (nowMs >= spawnState.nextAtMs) : true;
        const meteorReady = sp.useMeteorCount ? (spawnState.meteorsSinceLast >= spawnState.nextMeteorTrigger) : true;

        const should = (sp.hybridMode === "AND") ? (timeReady && meteorReady) : (timeReady || meteorReady);
        if (!should) return;

        spawnComet();

        // reset triggers
        spawnState.meteorsSinceLast = 0;
        spawnState.nextAtMs = nowMs + rand(sp.timeRangeSec[0], sp.timeRangeSec[1]) * 1000;
        spawnState.nextMeteorTrigger = ((Math.random() * (sp.meteorRange[1] - sp.meteorRange[0] + 1)) | 0) + sp.meteorRange[0];
      }

      function handleCollisions(dt, nowMs) {
        // Kometa zawsze ma szansę zniszczyć meteor niezależnie od tego, gdzie on jest.
        // Jedno źródło prawdy: lista kandydatów (WORLD + orbiters ASTEROID/PLANET/(STAR)).
        function isGhostBody(o) {
          return !o || o.dead || o.removeMe || o.absorbingIntoStarId != null || o._beingAbsorbed === true || o.alpha === 0 || o._alpha === 0;
        }
        function getAllMeteorsForCollision() {
          const out = [];

          // WORLD meteors
          for (let i = 0; i < World.meteors.length; i++) {
            out.push({ m: World.meteors[i], ownerType: "WORLD", ownerRef: null, index: i });
          }

          // ASTEROID orbiters
          for (const a of World.asteroids) {
            if (!a.orbiters || !a.orbiters.length) continue;
            for (let i = 0; i < a.orbiters.length; i++) {
              out.push({ m: a.orbiters[i], ownerType: "ASTEROID", ownerRef: a, index: i });
            }
          }

          // PLANET orbiters
          for (const p of World.planets) {
            if (!p.orbiters || !p.orbiters.length) continue;
            for (let i = 0; i < p.orbiters.length; i++) {
              out.push({ m: p.orbiters[i], ownerType: "PLANET", ownerRef: p, index: i });
            }
          }

          // Future: STAR orbiters (keep patch future-proof without requiring stars today)
          if (World.stars && World.stars.length) {
            for (const s of World.stars) {
              if (!s.orbiters || !s.orbiters.length) continue;
              for (let i = 0; i < s.orbiters.length; i++) {
                out.push({ m: s.orbiters[i], ownerType: "STAR", ownerRef: s, index: i });
              }
            }
          }

          return out;
        }

        function getHitWorldPos(hit) {
          const m = hit.m;
          if (hit.ownerType === "WORLD") {
            return { x: m.x, y: m.y };
          }

          const owner = hit.ownerRef;
          const ang = (m.angle || 0);
          const r = (m.orbitR || 0);
          return { x: owner.x + Math.cos(ang) * r, y: owner.y + Math.sin(ang) * r };
        }

        function addRingMark(owner, m, source) {
          if (!owner) return;
          if (!owner.rings) owner.rings = [];
          owner.rings.push({
            source: source || "COMET",
            colorName: m.colorName || "blue",
            hue: (typeof m.hue === "number") ? m.hue : hueFromName(m.colorName || "blue"),
            orbitR: (typeof m.orbitR === "number") ? m.orbitR : (owner.orbitPx || owner.r * 2.4),
            r: Math.max(1, (m.r || meteorBaseRadius()) * 0.55),
            t: nowMs || 0,
          });
        }

        function removeMeteorFromOwner(hit) {
          const m = hit.m;

          if (hit.ownerType === "WORLD") {
            // free meteor: remove from World list (fragmentation handled by caller)
            World.meteors.splice(hit.index, 1);
            return m;
          }

          if (hit.ownerType === "ASTEROID") {
            const a = hit.ownerRef;
            if (!a || !a.orbiters || hit.index < 0 || hit.index >= a.orbiters.length) return null;

            const removed = a.orbiters.splice(hit.index, 1)[0];

            // shrink asteroid gravity orbit (no rings for asteroids)
            const rr = removed.r || meteorBaseRadius();
            const nextOrbit = clamp((a.orbitPx || (a.r * 2.0)) - rr, a.minOrbitPx, a.maxOrbitPx);
            setBodyOrbitRadius(a, nextOrbit);

            // reduce live stats (mirrors releaseAllOrbitersFromAsteroid)
            const colorName = removed.colorName || "green";
            a.liveSumR = Math.max(0, (a.liveSumR || 0) - rr);
            a.liveSumMass = Math.max(0, (a.liveSumMass || 0) - massFromR(rr));
            if (a.liveColorCounts) a.liveColorCounts[colorName] = Math.max(0, (a.liveColorCounts[colorName] || 0) - 1);

            if (window.WorldAPI && window.WorldAPI._clampOrbitersToOrbit) window.WorldAPI._clampOrbitersToOrbit(a);
            return removed;
          }

          if (hit.ownerType === "PLANET") {
            const p = hit.ownerRef;
            if (!p || !p.orbiters || hit.index < 0 || hit.index >= p.orbiters.length) return null;
            const removed = p.orbiters.splice(hit.index, 1)[0];

            // comet hit on planet orbiter -> zapis do ringa, bez natychmiastowej zmiany orbity grawitacyjnej
            addRingMark(p, removed, "COMET");
            return removed;
          }

          if (hit.ownerType === "STAR") {
            const s = hit.ownerRef;
            if (!s || !s.orbiters || hit.index < 0 || hit.index >= s.orbiters.length) return null;
            const removed = s.orbiters.splice(hit.index, 1)[0];
            addRingMark(s, removed, "COMET");
            return removed;
          }

          return null;
        }

        
        // comet vs meteors (WORLD + orbiters)
        for (const c of World.comets) {
          if (c.hitCooldown > 0) continue;
          // 1) WORLD meteors
          for (let mi = World.meteors.length - 1; mi >= 0; mi--) {
            const m = World.meteors[mi];
            const dx = m.x - c.x, dy = m.y - c.y;
            const rr = (m.r || 0) + c.r;
            if (dx*dx + dy*dy > rr*rr) continue;

            // remove meteor
            World.meteors.splice(mi, 1);

            // split meteor into fragments (WORLD meteors only)
            splitMeteorIntoFragments(m);

            // deflect comet by 20/30/40 deg depending on mass ratio
            deflectCometByMass(c, m);
            c.hitCooldown = 0.08;

            // one hit per comet per frame is enough
            break;
          }
          if (c.hitCooldown > 0) continue;

          // 2) ASTEROID orbiters (no rings)
          if (World.asteroids && World.asteroids.length) {
            for (const a of World.asteroids) {
              if (isGhostBody(a)) continue;
              if (!a.orbiters || !a.orbiters.length) continue;

              for (let oi = a.orbiters.length - 1; oi >= 0; oi--) {
                const o = a.orbiters[oi];
                const ox = a.x + Math.cos(o.angle) * o.orbitR;
                const oy = a.y + Math.sin(o.angle) * o.orbitR;
                const dx = ox - c.x, dy = oy - c.y;
                const rr = (o.r || 0) + c.r;
                if (dx*dx + dy*dy > rr*rr) continue;

                // remove orbiter (no drift, no fragments)
                const removed = a.orbiters.splice(oi, 1)[0];

                // shrink asteroid gravity/orbit (no rings on asteroids)
                // (keep it gentle to avoid visual jumps)
                const shrink = Math.max(0, (removed?.r || 0) * 0.9);
                if (typeof a.orbitPx === "number") {
                  const nextOrbit = Math.max(a.r * 1.6, a.orbitPx - shrink);
                  setBodyOrbitRadius(a, nextOrbit);
                }

                deflectCometByMass(c, removed);
                c.hitCooldown = 0.08;
                oi = -1; // break
                break;
              }
              if (c.hitCooldown > 0) break;
            }
          }
          if (c.hitCooldown > 0) continue;

          // 3) PLANET orbiters (ALWAYS create ring mark on hit)
          if (World.planets && World.planets.length) {
            const nowMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

            for (const p of World.planets) {
              if (isGhostBody(p)) continue;
              if (!p.orbiters || !p.orbiters.length) continue;

              for (let oi = p.orbiters.length - 1; oi >= 0; oi--) {
                const o = p.orbiters[oi];
                const ox = p.x + Math.cos(o.angle) * o.orbitR;
                const oy = p.y + Math.sin(o.angle) * o.orbitR;
                const dx = ox - c.x, dy = oy - c.y;
                const rr = (o.r || 0) + c.r;
                if (dx*dx + dy*dy > rr*rr) continue;

                const removed = p.orbiters.splice(oi, 1)[0];

                // add visible ring mark (no RNG)
                addPlanetRingMark(p, removed, nowMs, "COMET");

                // shrink planet gravity/orbit slightly (since orbiter removed)
                const shrink = Math.max(0, (removed?.r || 0) * 0.9);
                if (typeof p.orbitPx === "number") {
                  const nextOrbit = Math.max(p.r * 1.8, p.orbitPx - shrink);
                  setBodyOrbitRadius(p, nextOrbit);
                }

                deflectCometByMass(c, removed);
                c.hitCooldown = 0.08;
                oi = -1; // break
                break;
              }
              if (c.hitCooldown > 0) break;
            }
          }
        }

        function transformAsteroidIntoRockyPlanet(a, comet) {
          const orbiters = getDirectOrbitersOfBody(a);
          const weights = buildColorWeightsFromOrbiters(orbiters);
          const params = computeRockyParamsFromOrbiters(orbiters);
          const planetId = a._id || a.id || 1;
          const patch = buildBlobPatchwork(planetId, weights, World.ROCKY_PATCH_BLOBS_TOTAL);
          const ringRng = makeRng(hash32(`rings:${planetId}`));
          const rings = [];

          a.type = "planet";
          a.planetKind = "rocky";
          a.isRocky = true;
          a.r = params.planetR;
          a.mass = params.planetMass;
          a.gravityR = params.gravityR;
          setBodyOrbitRadius(a, params.gravityR);
          a.hueA = hueFromName(weights.monoColor || "yellow");
          a.hueB = a.hueA;
          a.orbiters = [];
          a.captureCooldown = 0;
          a.captureCount = 0;
          a.captureSumR = 0;
          a.captureSumMass = 0;
          a.captureColorCounts = Object.create(null);
          a.rings = a.rings || [];
          a.capturedAsteroids = [];
          a.rocky = {
            weights,
            patch,
            isMono: patch.isMono,
            monoColor: patch.monoColor || weights.monoColor,
            avgHue: weights.avgHue,
          };
          a.rockySurface = {
            isMono: patch.isMono,
            monoColor: patch.monoColor || weights.monoColor,
            dominantColor: patch.dominantColor || weights.dominantColor,
            blobs: patch.blobs || [],
          };
          for (const o of orbiters) {
            const startR = (typeof o.orbitR === "number" && isFinite(o.orbitR))
              ? o.orbitR
              : Math.hypot((o.x || 0) - a.x, (o.y || 0) - a.y);
            const colorName = o.colorName || o.color || o.col || o.fill || "blue";
            const hue = (typeof o.hue === "number") ? o.hue : hueFromName(colorName);
            const thickness = clamp(Math.max(1, o.r || 1), 1, a.r * 0.12);
            rings.push({
              startR,
              colorName,
              hue,
              thickness,
              dashOffset: ringRng() * 6,
              seed: ringRng() * 1000,
              dashStyle: World.ROCKY_RING_DASH_STYLE,
            });
          }
          rings.sort((r1, r2) => r2.startR - r1.startR);
          const denom = Math.max(1, rings.length - 1);
          for (let i = 0; i < rings.length; i++) {
            rings[i].endR = a.r * (1 - (i / denom));
          }
          a.rockyForm = {
            active: true,
            phase: "shrink",
            t: 0,
            shrinkDur: World.ROCKY_FORM_SHRINK_DUR,
            fadeDur: World.ROCKY_FORM_FADE_DUR,
            weights,
            rings,
          };
          a.rockyLocked = false;
          a.spinLikeAsteroid = false;
          a.spinAngle = 0;
          a.spinOmega = 0;

          removeOrbitersConsumed(orbiters);

          // destroy comet after impact
          const cometIndex = World.comets.indexOf(comet);
          if (cometIndex >= 0) World.comets.splice(cometIndex, 1);
        }

        // comet vs asteroid: IMPACT -> asteroid transforms into rocky planet
        for (let ci = World.comets.length - 1; ci >= 0; ci--) {
          const c = World.comets[ci];
          if (c.hitCooldown > 0) continue;

          for (let ai = World.asteroids.length - 1; ai >= 0; ai--) {
            const a = World.asteroids[ai];
            if (isGhostBody(a)) continue;
            const dx = a.x - c.x, dy = a.y - c.y;
            const rr = a.r + c.r;
            if (dx*dx + dy*dy > rr*rr) continue;

            transformAsteroidIntoRockyPlanet(a, c);
            World.planets.push(a);
            World.asteroids.splice(ai, 1);
            c.hitCooldown = 0.08;
            break;
          }
        }

        // comet vs planet: IMPACT -> seed life (rocky), release half orbiters + destroy comet
        for (let ci = World.comets.length - 1; ci >= 0; ci--) {
          const c = World.comets[ci];
          if (c.hitCooldown > 0) continue;

          for (const p of World.planets) {
            if (isGhostBody(p)) continue;
            const dx = p.x - c.x, dy = p.y - c.y;
            const rr = p.r + c.r;
            if (dx*dx + dy*dy > rr*rr) continue;

            // comet impact: absorb once WITHOUT resetting planet mass model
            p.cometHits = (p.cometHits || 0) + 1;
            p.r = clamp(p.r + c.r * 0.22, meteorBaseRadius() * 8, meteorBaseRadius() * 220);

            // Direct impact in rocky planet: seed life (simple event hook)
            if (p.planetKind === "rocky") {
              p.lifeLevel = (p.lifeLevel || 0) + 1;
              p.life = true;
            }

                      // (disabled) no native orbiter release on comet impact; handled by HALO_TRIAL / card
            // releaseHalfOrbitersFromPlanet(p, nowMs, { shrink:false, orbitAdjust:false });

            // destroy comet after impact
            World.comets.splice(ci, 1);
            c.hitCooldown = 0.08;
            break;
          }
        }

        // comet vs star body: direct hit only
        if (World.stars && World.stars.length) {
          for (let ci = World.comets.length - 1; ci >= 0; ci--) {
            const c = World.comets[ci];
            if (c.hitCooldown > 0) continue;
            for (const s of World.stars) {
              const dx = s.x - c.x, dy = s.y - c.y;
              const rr = s.r + c.r;
              if (dx*dx + dy*dy > rr*rr) continue;
              s.mass = (s.mass || 0) + (c.mass || (c.r * c.r));
              World.comets.splice(ci, 1);
              c.hitCooldown = 0.08;
              break;
            }
          }
        }
      }

      function splitMeteorIntoFragments(m) {
        const n = 3;
        const fr = Math.max(1.6, m.r / 3);

        for (let k = 0; k < n; k++) {
          const ang = (Math.PI * 2 * k) / n + rand(-0.25, 0.25);
          const spd = rand(0.02, 0.06) * View.worldScale;

        World.meteors.push({
          x: m.x + Math.cos(ang) * m.r * 0.2,
          y: m.y + Math.sin(ang) * m.r * 0.2,
          vx: (m.vx || 0) * 0.15 + Math.cos(ang) * spd,
          vy: (m.vy || 0) * 0.15 + Math.sin(ang) * spd,
          r: fr,
          colorName: m.colorName,
          hue: m.hue,
          age: 0,
          life: rand(40, 80),
          trail: [{ x: m.x + Math.cos(ang) * m.r * 0.2, y: m.y + Math.sin(ang) * m.r * 0.2, t: 0 }],
          noAsteroidOrbit: true,
          isFragment: true,
        });
        }
      }

      function deflectCometByMass(c, meteor) {
        const mMass = (meteor.r * meteor.r);
        const ratio = c.mass / Math.max(1, mMass);

        let deg = 40;
        if (ratio >= 2.0) deg = 20;
        else if (ratio >= 1.5) deg = 30;

        const sign = Math.random() < 0.5 ? -1 : 1;
        const ang = sign * deg * Math.PI / 180;

        const vx = c.vx, vy = c.vy;
        c.vx = vx * Math.cos(ang) - vy * Math.sin(ang);
        c.vy = vx * Math.sin(ang) + vy * Math.cos(ang);
      }

      function hardDeflect(c) {
        const ang = rand(-1, 1) * 70 * Math.PI / 180;
        const vx = c.vx, vy = c.vy;
        c.vx = vx * Math.cos(ang) - vy * Math.sin(ang);
        c.vy = vx * Math.sin(ang) + vy * Math.cos(ang);
      }

      function releaseAllOrbitersFromAsteroid(a, nowMs) {
        if (!a.orbiters || !a.orbiters.length) return;
        const orbitPx = (typeof a.orbitPx === 'number' && isFinite(a.orbitPx)) ? a.orbitPx : (a.r * 2.0);
        const worldScale = (typeof View !== 'undefined' && View && typeof View.worldScale === 'number' && isFinite(View.worldScale)) ? View.worldScale : 1;
        for (const o of a.orbiters) {
          const r = o.r ?? 4;
          const colorName = o.colorName ?? "green";
          const hue = o.hue ?? 120;

          // reduce LIVE stats (total captureCount stays as "history marker")
          a.liveSumR = Math.max(0, (a.liveSumR || 0) - r);
          a.liveSumMass = Math.max(0, (a.liveSumMass || 0) - massFromR(r));
          if (a.liveColorCounts) a.liveColorCounts[colorName] = Math.max(0, (a.liveColorCounts[colorName] || 0) - 1);

          // push meteor outwards so it doesn't get immediately re-captured
          const ox = (o.x ?? a.x) - a.x;
          const oy = (o.y ?? a.y) - a.y;
          const len = Math.hypot(ox, oy) || 1;
          const ux = ox / len, uy = oy / len;

          const kick = rand(0.22, 0.42) * worldScale; // tuned for your speed scale
          const m = {
            x: a.x + ux * (orbitPx + r + 2),
            y: a.y + uy * (orbitPx + r + 2),
            vx: (o.vx ?? 0) + ux * kick,
            vy: (o.vy ?? 0) + uy * kick,
            r,
            colorName,
            hue,
            age: 0,
            life: rand(60, 120),
            trail: [],
            // cooldown against the same asteroid
            noAsteroidOrbitUntilMs: (nowMs || performance.now()) + 1400,
            ignoreAsteroidId: a._id,
            // prevent instant meteor-meteor re-aggregation after release
            noMeteorCollisionUntilMs: (nowMs || performance.now()) + 1200,
          };
          World.meteors.push(m);
        }
        a.orbiters.length = 0;
        // shrink orbit roughly (optional)
        const shrunkOrbit = Math.max(a.r * 2.0, orbitPx * 0.7);
        setBodyOrbitRadius(a, shrunkOrbit);
      }
      function releaseHalfOrbitersFromPlanet(p, nowMs, opts) {
        opts = opts || {};
        const shrink = !!opts.shrink;           // default: false for comet impacts
        const orbitAdjust = !!opts.orbitAdjust; // default: false for comet impacts

        let releasedR = 0;
        const half = (p.orbiters.length / 2) | 0;

        for (let i = 0; i < half; i++) {
          const idx = (Math.random() * p.orbiters.length) | 0;
          const o = p.orbiters.splice(idx, 1)[0];
          releasedR += (o.r ?? 4);

          const dx = (o.x ?? p.x) - p.x;
          const dy = (o.y ?? p.y) - p.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len, uy = dy / len;

          const kick = rand(0.12, 0.26) * View.worldScale;

          World.meteors.push({
            x: p.x + ux * (p.r + 2),
            y: p.y + uy * (p.r + 2),
            vx: ux * kick,
            vy: uy * kick,
            r: o.r ?? 4,
            colorName: o.colorName ?? "green",
            hue: o.hue ?? 120,
            age: 0,
            life: rand(60, 120),
            trail: [],
            // prevent instant meteor-meteor re-aggregation after release
            noMeteorCollisionUntilMs: (World.nowMs ?? performance.now()) + 1200,
          });
        }

        // IMPORTANT: comet-planet collision should NOT "shrink planet mass" abruptly.
        // We keep planet radius unless shrink=true (reserved for future mechanics).
        if (releasedR > 0) {
          const Rm = meteorBaseRadius();
          if (shrink) {
            p.r = clamp(p.r - releasedR * 0.06, Rm * 2.0, Rm * 220);
          }

          const minOrbit = p.r * 2.1;
          const maxOrbit = p.r * 9.0;

          if (orbitAdjust) {
            const nextOrbit = clamp((p.orbitPx || minOrbit) - releasedR, minOrbit, maxOrbit);
            setBodyOrbitRadius(p, nextOrbit);
          } else {
            const nextOrbit = clamp((p.orbitPx || minOrbit), minOrbit, maxOrbit);
            setBodyOrbitRadius(p, nextOrbit);
          }
        }
      }


      /* =========================
         COMETS — Part C: Render + Event hooks
         ========================= */
      function draw(ctx) {
        for (const c of World.comets) {
          drawTail(ctx, c);
          drawCore(ctx, c);
        }
      }

      function drawCore(ctx, c) {
        ctx.beginPath();
        ctx.fillStyle = CONFIG.visual.halo;
        ctx.arc(c.x, c.y, c.r * 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = CONFIG.visual.coreB;
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = CONFIG.visual.coreA;
        ctx.arc(c.x - c.vx * 0.01, c.y - c.vy * 0.01, c.r * 0.72, 0, Math.PI * 2);
        ctx.fill();
      }

      function drawTail(ctx, c) {
        const len = c.tailLen;
        if (len <= 1) return;

        const vlen = Math.hypot(c.vx, c.vy) || 1;
        const ux = c.vx / vlen, uy = c.vy / vlen;

        const bx = c.x - ux * len;
        const by = c.y - uy * len;

        const px = -uy, py = ux;
        const w = c.r * 0.9;

        ctx.beginPath();
        ctx.fillStyle = CONFIG.visual.tail;
        ctx.moveTo(c.x + px * w, c.y + py * w);
        ctx.lineTo(c.x - px * w, c.y - py * w);
        ctx.lineTo(bx, by);
        ctx.closePath();
        ctx.fill();
      }

      function activateShower(nowMs, durationMs = 12000) {
        // restore base spawn
        const restoreSpawn = {
          ...CONFIG.spawn,
          timeRangeSec: [...CONFIG.spawn.timeRangeSec],
          meteorRange: [...CONFIG.spawn.meteorRange],
        };

        event = {
          endAtMs: nowMs + durationMs,
          restoreSpawn,
          override: {
            types: [
              { id: "showerTiny", weight: 90, radiusMul: 0.9, massMul: 0.45, speedMul: 1.25 },
              { id: "showerMid",  weight: 10, radiusMul: 1.1, massMul: 0.65, speedMul: 1.10 },
            ],
            spawn: {
              useTime: true,
              timeRangeSec: [0.25, 0.7],
              useMeteorCount: true,
              meteorRange: [6, 14],
              hybridMode: "OR",
            }
          }
        };
      }

      // Event wiring
      Events.on("METEOR_SPAWNED", onMeteorSpawned);
      Events.on("COMET_SHOWER", (payload = {}) => {
        const durationMs = payload.durationMs ?? 12000;
        activateShower(performance.now(), durationMs);
      });

      // init
      resetSpawner(performance.now());

      // expose for console tweaks
      const api = { CONFIG, update, draw, resetSpawner, activateShower };
      window.Comets = api;
      window.Camera = Camera;
      return api;
    })();

    if (window.Comets) {
      window.HC.Comets = window.Comets;
    } else {
      window.HC.Comets = Comets;
    }

    return Comets;
  };
})();
