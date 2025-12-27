console.log("[HC] game.codex.js loaded");
/* =========================================================
   Haiku Cosmos — game.js (MONOLITH SAFE v4.1)
   Part 1/3
   - Event Bus
   - Core: canvas, scaling, input, helpers
   - World params: asteroidDriftMul, pointer tuning
   ========================================================= */

/* =========================================================
   QUICK NAV (use editor search)
// [ANCHOR:UPDATE]
   - [ANCHOR:UPDATE]        function update(dt, nowMs)
// [ANCHOR:RENDER]
   - [ANCHOR:RENDER]        function render()
// [ANCHOR:FRAME]
   - [ANCHOR:FRAME]         function frame(now)
// [ANCHOR:METEORS]
   - [ANCHOR:METEORS]       function updateMeteors(dt)
// [ANCHOR:COLLISIONS]
   - [ANCHOR:COLLISIONS]    function resolveMeteorCollisionsSafe()
// [ANCHOR:ASTEROIDS]
   - [ANCHOR:ASTEROIDS]     function updateAsteroids(dt) / captureMeteorsByAsteroids(...)
// [ANCHOR:PLANETS]
   - [ANCHOR:PLANETS]       function updatePlanets(dt) / captureMeteorsByPlanets(...)
// [ANCHOR:COMETS]
   - [ANCHOR:COMETS]        const Comets = (() => { ... })
   ========================================================= */

/* =========================
   1) WORLD + RENDER CORE
   ========================= */
(() => {
  // ---------- DOM ----------
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const fpsLabel = document.getElementById("fpsLabel");
  const btnRestart = document.getElementById("btnRestart");
  const topBar = document.getElementById("topBar");

  const scoreLabel = (() => {
    if (!topBar) return null;
    const el = document.createElement("div");
    el.className = "pill";
    el.id = "scoreLabel";
    el.textContent = "Score: 0";
    topBar.appendChild(el);
    return el;
  })();


  // ---------- UI: Meteors per second slider (debug / balancing) ----------
  const mpsUI = (() => {
    if (!topBar) return null;

    const wrap = document.createElement("div");
    wrap.className = "pill";
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "10px";
    wrap.style.padding = "6px 10px";

    const label = document.createElement("span");
    label.textContent = "Meteors/s:";
    label.style.opacity = "0.9";

    const value = document.createElement("span");
    value.id = "mpsValue";
    value.style.minWidth = "34px";
    value.style.textAlign = "right";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "1";
    slider.max = "20";
    slider.step = "1";
    slider.value = "5";
    slider.style.width = "140px";

    wrap.appendChild(label);
    wrap.appendChild(value);
    wrap.appendChild(slider);
    topBar.appendChild(wrap);

    return { wrap, label, value, slider };
  })();

  // ---------- View / scaling ----------
  function getMaxPixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    const isMobile = matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return Math.min(dpr, isMobile ? 1.5 : 2.0);
  }

  const View = { w: 0, h: 0, dpr: 1, worldScale: 1 };

  // ---------- Camera (render-only zoom, lightweight) ----------
  const Camera = {
    scale: 1.0,
    target: 1.0,
    min: 0.35,
    max: 1.0,
    ease: 0.06,
  };

  function screenToWorld(x, y) {
    const cx = View.w / 2;
    const cy = View.h / 2;
    const s = Camera.scale || 1;
    return { x: (x - cx) / s + cx, y: (y - cy) / s + cy };
  }


  
  function getWorldViewBounds() {
    // When Camera.scale < 1, the visible world extends beyond 0..View.w / 0..View.h.
    const cx = View.w / 2;
    const cy = View.h / 2;
    const s = Camera.scale || 1;
    const halfW = (View.w / 2) / s;
    const halfH = (View.h / 2) / s;
    return { l: cx - halfW, r: cx + halfW, t: cy - halfH, b: cy + halfH, cx, cy };
  }

function resizeCanvas() {
    View.dpr = getMaxPixelRatio();
    const cssW = Math.max(1, window.innerWidth);
    const cssH = Math.max(1, window.innerHeight);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.floor(cssW * View.dpr);
    canvas.height = Math.floor(cssH * View.dpr);
    View.w = canvas.width;
    View.h = canvas.height;
    View.worldScale = Math.min(View.w, View.h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();

  // ---------- Input ----------
  const Input = { pointerDown: false, x: 0, y: 0, wx: 0, wy: 0 };

  function toCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * View.dpr,
      y: (e.clientY - rect.top) * View.dpr,
    };
  }

  canvas.addEventListener("pointerdown", (e) => {
    const p = toCanvasCoords(e);
    Input.x = p.x; Input.y = p.y;

    // If a card offer was clicked, consume the click (do not start pointer control)
    if (CardEngine.handlePointerDown(p.x, p.y, View.w, View.h)) return;

    Input.pointerDown = true;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    const p = toCanvasCoords(e);
    Input.x = p.x; Input.y = p.y;
  });

  canvas.addEventListener("pointerup", (e) => {
    Input.pointerDown = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch {}
  });

  // ---------- Helpers ----------
  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function meteorBaseRadius() {
    return View.worldScale * 0.008;
  }

  function massFromR(r) { return r * r; }

  // ---------- World state ----------
  const World = {
    meteors: [],
    asteroids: [],
    planets: [],

    flags: { firstPlanetZoomed: false, firstStarZoomed: false },

    spawnTimer: 0,
    spawnInterval: 0.22,
    maxMeteors: 60,

  // Pointer tuning (base) — cards modify with multipliers:
// engineStats.pointer_radius_mul / pointer_strength_mul
pointerRadius: 0.20,       // ring size
pointerStrength: 1.15,     // stronger pull (łatwiej łączyć meteory)

// "Klejenie" w obrębie ring-u (stabilizacja prędkości)
// większa wartość = meteory mniej "uciekają bokiem" gdy są w ring-u
pointerGlueDamp: 0.22,     // 0.0..0.6 (polecam 0.18–0.30)

// Pomoc w kolizjach meteorów (większa strefa kontaktu)
// 1.00 = fizycznie dokładnie, 1.08–1.18 = łatwiej trafić
meteorCollisionFudge: 1.12,


    // Difficulty knobs (cards / runs):
    asteroidDriftMul: 0.55,   // <- drift multiplier for new asteroids

    planetCaptureTarget: 13,

    // Star size thresholds (cards can tune)
    STAR_SIZE_SMALL_MAX_ORBITERS: 23,
    STAR_SIZE_BIG_MAX_ORBITERS: 66,

    score: 0,
  };
  // Bind CardEngine to World (foundation under Card Editor)
  CardEngine.bindWorld(World);



  // ---------- Spawn rate helpers ----------
  function setMeteorsPerSec(mps) {
    const v = clamp(mps, 1, 60);
    World.spawnInterval = 1 / v;
    if (mpsUI) {
      mpsUI.value.textContent = String(Math.round(v));
      mpsUI.slider.value = String(Math.round(v));
    }
  }

  // init slider from current spawnInterval
  if (mpsUI) {
    const current = Math.max(1, Math.round(1 / World.spawnInterval));
    mpsUI.value.textContent = String(current);
    mpsUI.slider.value = String(current);
    mpsUI.slider.addEventListener("input", () => {
      const v = parseInt(mpsUI.slider.value, 10) || 1;
      setMeteorsPerSec(v);
    });
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
          a.orbitPx = clamp((a.orbitPx || (a.r * 2.0)) - rr, a.minOrbitPx, a.maxOrbitPx);

          // reduce live stats (mirrors releaseAllOrbitersFromAsteroid)
          const colorName = removed.colorName || "green";
          a.liveSumR = Math.max(0, (a.liveSumR || 0) - rr);
          a.liveSumMass = Math.max(0, (a.liveSumMass || 0) - massFromR(rr));
          if (a.liveColorCounts) a.liveColorCounts[colorName] = Math.max(0, (a.liveColorCounts[colorName] || 0) - 1);

          if (WorldAPI && WorldAPI._clampOrbitersToOrbit) WorldAPI._clampOrbitersToOrbit(a);
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

          // one hit per comet per frame is enough
          break;
        }

        // 2) ASTEROID orbiters (no rings)
        if (World.asteroids && World.asteroids.length) {
          for (const a of World.asteroids) {
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
              if (typeof a.orbitPx === "number") a.orbitPx = Math.max(a.r * 1.6, a.orbitPx - shrink);

              deflectCometByMass(c, removed);
              oi = -1; // break
              break;
            }
          }
        }

        // 3) PLANET orbiters (ALWAYS create ring mark on hit)
        if (World.planets && World.planets.length) {
          const nowMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

          for (const p of World.planets) {
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
              if (typeof p.orbitPx === "number") p.orbitPx = Math.max(p.r * 1.8, p.orbitPx - shrink);

              deflectCometByMass(c, removed);
              oi = -1; // break
              break;
            }
          }
        }
      }

      // comet vs asteroid: IMPACT -> asteroid breaks into ring if orbiting planet
      for (let ci = World.comets.length - 1; ci >= 0; ci--) {
        const c = World.comets[ci];

        for (let ai = World.asteroids.length - 1; ai >= 0; ai--) {
          const a = World.asteroids[ai];
          const dx = a.x - c.x, dy = a.y - c.y;
          const rr = a.r + c.r;
          if (dx*dx + dy*dy > rr*rr) continue;

          const ringOwner = (a.parentKind === "planet" && a.parentRef) ? a.parentRef : null;
          let ringColors = [];
          if (a.orbiters && a.orbiters.length) {
            for (const o of a.orbiters) {
              ringColors.push({
                hue: (typeof o.hue === "number") ? o.hue : hueFromName(o.colorName || "blue"),
                colorName: o.colorName || "blue",
              });
            }
          }
          if (ringOwner && !ringColors.length) {
            const fallbackHue = (typeof ringOwner.hueA === "number") ? ringOwner.hueA : hueFromName("blue");
            ringColors = [{ hue: fallbackHue, colorName: "blue" }];
          }

          // TODO: future — if comet hits asteroid with rotating meteors, create multicolor ring (thickness = asteroid radius).
          if (ringOwner) {
            addAsteroidBreakRing(ringOwner, a, ringColors, nowMs);
          }

          // remove asteroid and its orbiters (no release as meteors)
          if (a.orbiters) a.orbiters.length = 0;
          World.asteroids.splice(ai, 1);

          // destroy comet after impact
          World.comets.splice(ci, 1);
          break;
        }
      }

      // comet vs planet: IMPACT -> seed life (rocky), release half orbiters + destroy comet
      for (let ci = World.comets.length - 1; ci >= 0; ci--) {
        const c = World.comets[ci];

        for (const p of World.planets) {
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
          break;
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
          trail: [],
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
      a.orbitPx = Math.max(a.r * 2.0, orbitPx * 0.7);
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
          p.orbitPx = clamp((p.orbitPx || minOrbit) - releasedR, minOrbit, maxOrbit);
        } else {
          p.orbitPx = clamp((p.orbitPx || minOrbit), minOrbit, maxOrbit);
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


  function addScore(points) {
    World.score += points;
    if (scoreLabel) scoreLabel.textContent = `Score: ${World.score}`;
  }

  // ---------- API (future cards) ----------
  const WorldAPI = {
    adjustAsteroidOrbitByMeteorRadii(asteroid, deltaCount) {
      const Rm = meteorBaseRadius();
      asteroid.orbitPx = clamp(
        asteroid.orbitPx + deltaCount * Rm,
        asteroid.minOrbitPx,
        asteroid.maxOrbitPx
      );
      this._clampOrbitersToOrbit(asteroid);
    },

    removeOrbiters(asteroid, count) {
      const removed = [];
      while (count > 0 && asteroid.orbiters.length > 0) {
        removed.push(asteroid.orbiters.pop());
        count--;
      }
      this._clampOrbitersToOrbit(asteroid);
      return removed;
    },

    countStarSystemOrbiters(star, opts = {}) {
      const cap = Object.prototype.hasOwnProperty.call(opts, "cap") ? opts.cap : 50;
      const limit = Number.isFinite(cap) ? cap : Infinity;
      const seenIds = new Set();
      const seenObjs = new Set();
      let count = 0;

      function mark(obj) {
        if (!obj) return;
        const id = obj.id ?? obj._id;
        if (id !== undefined && id !== null) {
          if (seenIds.has(id)) return;
          seenIds.add(id);
        } else {
          if (seenObjs.has(obj)) return;
          seenObjs.add(obj);
        }
        count++;
      }

      if (star && star.orbiters && star.orbiters.length) {
        for (const o of star.orbiters) {
          mark(o);
          if (count >= limit) return count;
        }
      }

      if (World.asteroids && World.asteroids.length) {
        for (const a of World.asteroids) {
          if (a.parentKind !== "star" || a.parentRef !== star) continue;
          mark(a);
          if (count >= limit) return count;
          if (a.orbiters && a.orbiters.length) {
            for (const o of a.orbiters) {
              mark(o);
              if (count >= limit) return count;
            }
          }
        }
      }

      if (star && star.planetoids && star.planetoids.length) {
        for (const a of star.planetoids) {
          mark(a);
          if (count >= limit) return count;
          if (a && a.orbiters && a.orbiters.length) {
            for (const o of a.orbiters) {
              mark(o);
              if (count >= limit) return count;
            }
          }
        }
      }

      return count;
    },

    _clampOrbitersToOrbit(asteroid) {
      const margin = asteroid.r + asteroid.orbiterMinGapPx;
      for (const o of asteroid.orbiters) {
        const maxAllowed = Math.max(margin, asteroid.orbitPx - o.r);
        o.orbitR = clamp(o.orbitR, margin, maxAllowed);
      }
    }
  };

  /* =========================================================
     Part 2/3
     - Meteors: spawn
     - Asteroids: creation mapping + drift (vx/vy) + orbiters + capture stats
     - Planets: gradient helper
     - Rendering helpers
     ========================================================= */

  // ---------- Meteor palette ----------
  const MeteorColors = [
    { name: "blue", hue: 210 },
    { name: "green", hue: 120 },
    { name: "red", hue: 10 },
    { name: "yellow", hue: 45 },
  ];
  function pickColor() {
    return MeteorColors[(Math.random() * MeteorColors.length) | 0];
  }
  function hueFromName(name) {
    const c = MeteorColors.find(x => x.name === name);
    return c ? c.hue : 0;
  }

  function spawnMeteor() {
    const c = pickColor();
    const Rm = meteorBaseRadius();
    const r = rand(0.75, 1.35) * Rm;

    const b = getWorldViewBounds();
    const side = (Math.random() * 4) | 0;
    let x = 0, y = 0;
    if (side === 0) { x = rand(b.l, b.r); y = b.t - r * 2; }
    if (side === 1) { x = b.r + r * 2; y = rand(b.t, b.b); }
    if (side === 2) { x = rand(b.l, b.r); y = b.b + r * 2; }
    if (side === 3) { x = b.l - r * 2; y = rand(b.t, b.b); }

    // random through-screen direction (not to center)
    let angle = 0;
    if (side === 0) angle = rand(Math.PI * 0.25, Math.PI * 0.75);
    if (side === 2) angle = rand(-Math.PI * 0.75, -Math.PI * 0.25);
    if (side === 1) angle = rand(Math.PI * 0.75, Math.PI * 1.25);
    if (side === 3) angle = rand(-Math.PI * 0.25, Math.PI * 0.25);
    angle += rand(-0.35, 0.35);

    const speed = rand(0.08, 0.22) * View.worldScale;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    World.meteors.push({
      x, y, vx, vy,
      r,
      colorName: c.name,
      hue: c.hue,
      age: 0,
      life: rand(60, 120),
      trail: [],
          // prevent instant meteor-meteor re-aggregation after release
          noMeteorCollisionUntilMs: (World.nowMs ?? performance.now()) + 1200,
        });

    Events.emit("METEOR_SPAWNED", {});
  }

  // ---------- Asteroid mapping ----------
  function pairKey(a, b) { return [a, b].sort().join("+"); }
  function sidesFromColors(c1, c2) {
    const key = pairKey(c1, c2);
    if (key === "blue+green") return 5;
    if (key === "red+yellow") return 6;
    if (key === "blue+red") return 7;
    if (key === "blue+yellow") return 8;
    if (key === "green+red") return 8;
    if (key === "green+yellow") return 9;
    return 7;
  }

  // ---------- Planet gradient helper (simple for now) ----------
  function makePlanetGradient(cx, cy, r, hueA, hueB) {
    const gx = cx - r * 0.35;
    const gy = cy - r * 0.35;
    const grad = ctx.createRadialGradient(gx, gy, r * 0.15, cx, cy, r);
    grad.addColorStop(0, `hsl(${hueA} 85% 62%)`);
    grad.addColorStop(1, `hsl(${hueB} 85% 45%)`);
    return grad;
  }

  // Internal ids (used for comet-release cooldown / ignore)
  let ASTEROID_ID_SEQ = 1;

  function spawnAsteroidFromCollision(a, b) {
    const x = (a.x + b.x) * 0.5;
    const y = (a.y + b.y) * 0.5;

    const sides = sidesFromColors(a.colorName, b.colorName);
    const r = (a.r + b.r) * 1.35;
    const spin = rand(0.08, 0.25) * (Math.random() < 0.5 ? -1 : 1);
    const light = rand(42, 62);

    const Rm = meteorBaseRadius();
    const orbitPx = 3.0 * Rm;

    // Drift from conservation of momentum (mass ~ r^2), then scaled by World.asteroidDriftMul
    const ma = massFromR(a.r);
    const mb = massFromR(b.r);
    const msum = ma + mb;

    let vx = (a.vx * ma + b.vx * mb) / (msum || 1);
    let vy = (a.vy * ma + b.vy * mb) / (msum || 1);

    vx *= World.asteroidDriftMul;
    vy *= World.asteroidDriftMul;

    const asteroid = {
      type: "asteroid",
      _id: ASTEROID_ID_SEQ++,
      x, y,
      vx, vy,
      r,
      sides,
      angle: rand(0, Math.PI * 2),
      spin,
      grayLight: light,

      orbitPx,
      minOrbitPx: 1.5 * Rm,
      maxOrbitPx: 120.0 * Rm,

      minR: 0.9 * Rm,
      maxR: 80.0 * Rm,

      orbiters: [],
      orbiterMinGapPx: 0.9 * Rm,
      orbiterGapStepPx: 0.7 * Rm,
      captureCooldown: 0,

      captureCount: 0,
      captureSumR: 0,
      captureSumMass: 0,
      // "Live" capture stats (reduced when orbiters are released/removed)
      liveSumR: 0,
      liveSumMass: 0,
      liveColorCounts: { blue: 0, green: 0, red: 0, yellow: 0 },
      captureColorCounts: { blue: 0, green: 0, red: 0, yellow: 0 },
      cometHits: 0,

      isCollapsing: false,
      collapseT: 0,
      collapseDuration: 0.9,
    };

    World.asteroids.push(asteroid);
    Events.emit("ASTEROID_CREATED", { sides, from: [a.colorName, b.colorName] });
  }

  // ---------- Rendering helpers ----------
  function drawBackground() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, View.w, View.h);

    const count = Math.floor(View.worldScale * 0.04);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#fff";
    for (let i = 0; i < count; i++) {
      const x = (Math.random() * View.w) | 0;
      const y = (Math.random() * View.h) | 0;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.globalAlpha = 1;
  }

  function drawMeteor(m) {
    const maxTrail = 10;
    m.trail.push({ x: m.x, y: m.y });
    if (m.trail.length > maxTrail) m.trail.shift();

    ctx.globalAlpha = 0.18;
    for (let i = 0; i < m.trail.length; i++) {
      const t = m.trail[i];
      const k = (i + 1) / m.trail.length;
      const rr = m.r * (0.6 + 0.8 * k);
      ctx.beginPath();
      ctx.fillStyle = `hsl(${m.hue} 90% 70%)`;
      ctx.arc(t.x, t.y, rr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.fillStyle = `hsl(${m.hue} 90% 70%)`;
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.65;
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(m.x - m.r * 0.25, m.y - m.r * 0.25, m.r * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawRegularPolygon(x, y, r, sides, angleRad) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const t = angleRad + (i * Math.PI * 2) / sides;
      const px = x + Math.cos(t) * r;
      const py = y + Math.sin(t) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawAsteroidOrbiters(a) {
    for (const o of a.orbiters) {
      const ox = a.x + Math.cos(o.angle) * o.orbitR;
      const oy = a.y + Math.sin(o.angle) * o.orbitR;

      ctx.beginPath();
      ctx.fillStyle = `hsl(${o.hue} 90% 70%)`;
      ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(ox - o.r * 0.25, oy - o.r * 0.25, o.r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawAsteroid(a) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.orbitPx, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 215, 0, 0.65)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.restore();

    drawAsteroidOrbiters(a);

    ctx.save();
    drawRegularPolygon(a.x, a.y, a.r, a.sides, a.angle);
    ctx.fillStyle = `hsl(0 0% ${a.grayLight}%)`;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.globalAlpha = 0.35;
    drawRegularPolygon(a.x - a.r * 0.12, a.y - a.r * 0.12, a.r * 0.55, a.sides, a.angle);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  
  // Visual rings created by comet impacts on planet orbiters
  function drawPlanetRings(p, nowMs) {
    if (!p.rings || !p.rings.length) return;

    for (const rg of p.rings) {
      const bandWidth = (typeof rg.bandWidth === "number" && isFinite(rg.bandWidth))
        ? rg.bandWidth
        : ((typeof rg.w === "number" && isFinite(rg.w)) ? rg.w : meteorBaseRadius());
      const bands = clamp(Math.round(bandWidth / 2), 2, 16);
      const lineW = Math.max(0.8, bandWidth / (bands * 1.35));
      const palette = (rg.palette && rg.palette.length) ? rg.palette : (rg.colors || []);
      const baseHue = (typeof rg.hue === "number") ? rg.hue : hueFromName(rg.colorName || "blue");
      const seed = (typeof rg.seed === "number") ? rg.seed : 0.0;

      ctx.save();
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < bands; i++) {
        const t = (bands === 1) ? 0.5 : (i / (bands - 1));
        const r = rg.r - bandWidth * 0.5 + t * bandWidth;
        const jitter = Math.sin((seed + i * 13.1) * 3.7) * 0.5 + 0.5;
        const dash = Math.max(3, (rg.dashBase || 6) + jitter * 3);
        const gap = Math.max(3, (rg.gapBase || 10) + (1 - jitter) * 4);
        const paletteColor = palette.length ? palette[i % palette.length] : null;
        const hue = paletteColor
          ? ((typeof paletteColor.hue === "number") ? paletteColor.hue : hueFromName(paletteColor.colorName || "blue"))
          : baseHue;
        ctx.setLineDash([dash, gap]);
        ctx.lineWidth = lineW;
        ctx.strokeStyle = `hsla(${hue} 85% 60% / 0.6)`;
        ctx.lineDashOffset = (rg.dashOffset || 0) + jitter * 6 + i * 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, r), 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      ctx.setLineDash([]);
    }
  }

  function addPlanetRingMark(p, orbiter, nowMs, source) {
    if (!p) return;
    if (!p.rings) p.rings = [];
    const baseR = (typeof orbiter?.orbitR === "number" && isFinite(orbiter.orbitR)) ? orbiter.orbitR : (p.orbitPx || (p.r * 2.4));
   const bandWidth = Math.max(1, orbiter?.r || meteorBaseRadius());
    const hue = (typeof orbiter?.hue === "number") ? orbiter.hue : hueFromName(orbiter?.colorName || "blue");
    p.rings.push({
      r: baseR,
      bandWidth,
      t0: nowMs,
      hue,
      colorName: orbiter?.colorName || "blue",
      palette: [{ hue, colorName: orbiter?.colorName || "blue" }],
      dashBase: 6,
      gapBase: 10,
      dashOffset: rand(0, 6),
      seed: Math.random() * 1000,
      source: source || "COMET",
    });
  }

  function addAsteroidBreakRing(p, asteroid, colors, nowMs) {
    if (!p || !asteroid) return;
    if (!p.rings) p.rings = [];
    const baseR = (typeof asteroid.orbitR === "number" && isFinite(asteroid.orbitR)) ? asteroid.orbitR : (p.orbitPx || (p.r * 2.6));
    const bandWidth = Math.max(1, asteroid.r);
    const palette = (colors && colors.length) ? colors : [{
      hue: (typeof p.hueA === "number") ? p.hueA : hueFromName("blue"),
      colorName: "blue",
    }];
    p.rings.push({
      kind: "asteroidBreak",
      r: baseR,
      bandWidth,
      t0: nowMs,
      palette,
      theta0: (typeof asteroid.theta === "number") ? asteroid.theta : 0,
      dashBase: 6,
      gapBase: 10,
      dashOffset: rand(0, 6),
      seed: Math.random() * 1000,
      source: "COMET",
    });
  }
function drawPlanet(p) {
    const nowMs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.orbitPx, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 215, 0, 0.55)";
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 10]);
    ctx.stroke();
    ctx.restore();

    drawPlanetRings(p, nowMs);
ctx.beginPath();
    drawPlanetOrbiters(p);

    ctx.beginPath();
    ctx.fillStyle = makePlanetGradient(p.x, p.y, p.r, p.hueA, p.hueB);
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }


// Draw orbiters (captured meteors) around a planet
  function drawPlanetOrbiters(p) {
    if (!p.orbiters || !p.orbiters.length) return;

    for (const o of p.orbiters) {
      const ox = p.x + Math.cos(o.angle) * o.orbitR;
      const oy = p.y + Math.sin(o.angle) * o.orbitR;

      ctx.beginPath();
      ctx.fillStyle = `hsl(${o.hue} 95% 70%)`;
      ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.fillStyle = "white";
      ctx.arc(ox - o.r * 0.25, oy - o.r * 0.25, o.r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function addOrbiterToPlanet(p, meteor) {
    if (!p.orbiters) p.orbiters = [];
    const Rm = meteorBaseRadius();
    const orbR = meteor.r;

    const idx = p.orbiters.length;
    const minOrbit = p.r + (Rm * 0.9) + orbR;

    const step = (Rm * 1.2) + orbR * 0.85;
    const candidate = minOrbit + idx * step;

    const maxOrbit = Math.max(minOrbit, (p.orbitPx || (p.r * 2.4)) - orbR);
    const orbitR = clamp(candidate, minOrbit, maxOrbit);

    const baseOmega = rand(0.35, 0.95);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const omega = direction * computeOmega(baseOmega, orbitR, Rm);

    p.orbiters.push({
      hue: meteor.hue,
      colorName: meteor.colorName,
      r: orbR,
      orbitR,
      angle: rand(0, Math.PI * 2),
      omega,
    });
  }

// [ANCHOR:PLANETS]
  function captureMeteorsByPlanets(dt, nowMs) {
    if (!World.planets.length || !World.meteors.length) return;

    for (const p of World.planets) {
      p.captureCooldown = Math.max(0, (p.captureCooldown || 0) - dt);
    }

    const meteors = World.meteors;

    for (let mi = meteors.length - 1; mi >= 0; mi--) {
      const m = meteors[mi];
      if (m.age < 0.15) continue;

      // You may later add cards that mark m.noPlanetOrbit
      if (m.noPlanetOrbit) continue;

      for (let pi = 0; pi < World.planets.length; pi++) {
        const p = World.planets[pi];
        if (p.captureCooldown > 0) continue;

        const dx = m.x - p.x;
        const dy = m.y - p.y;
        const d2 = dx * dx + dy * dy;

        const capR = (p.orbitPx || (p.r * 2.4)) + m.r;
        if (d2 <= capR * capR) {
          meteors.splice(mi, 1);

          p.captureCount = (p.captureCount || 0) + 1;
          p.captureSumR = (p.captureSumR || 0) + m.r;
          p.captureSumMass = (p.captureSumMass || 0) + massFromR(m.r);
          if (!p.captureColorCounts) p.captureColorCounts = Object.create(null);
          p.captureColorCounts[m.colorName] = (p.captureColorCounts[m.colorName] || 0) + 1;

          // Planet grows a bit and its orbit expands by meteor size (visual clarity)
          p.r = clamp(p.r + m.r * 0.06, meteorBaseRadius() * 2.0, meteorBaseRadius() * 180);
          const minOrbit = p.r * 2.1;
          const maxOrbit = meteorBaseRadius() * 420;
          p.orbitPx = clamp((p.orbitPx || minOrbit) + m.r, minOrbit, maxOrbit);

          addOrbiterToPlanet(p, m);

          p.captureCooldown = 0.035;
          break;
        }
      }
    }
  }

// [ANCHOR:PLANETS]
  function captureAsteroidsByPlanets(dt, nowMs) {
    if (!World.planets.length || !World.asteroids.length) return;

    const asteroids = World.asteroids;

    for (let ai = asteroids.length - 1; ai >= 0; ai--) {
      const a = asteroids[ai];
      // don't immediately re-capture just-spawned bodies
      if (a.age && a.age < 0.25) continue;
      if (a.parentKind === "planet") continue;

      for (let pi = 0; pi < World.planets.length; pi++) {
        const p = World.planets[pi];
        if (p.captureCooldown > 0) continue;

        const dx = a.x - p.x;
        const dy = a.y - p.y;
        const d2 = dx*dx + dy*dy;

        const capR = (p.orbitPx || (p.r * 2.6)) + a.r;
        if (d2 <= capR * capR) {
          const baseOrbit = (p.orbitPx || (p.r * 2.6));
          const orbitR = baseOrbit + a.r;
          const theta = Math.atan2(dy, dx);
          const Rm = meteorBaseRadius();
          const baseOmega = rand(0.35, 0.95);
          const direction = Math.random() < 0.5 ? -1 : 1;
          const omega = direction * computeOmega(baseOmega, orbitR, Rm);

          a.parentKind = "planet";
          a.parentRef = p;
          a.orbitR = orbitR;
          a.theta = theta;
          a.omega = omega;

          // Orbit expands only by the asteroid size (as per design)
          const minOrbit = p.r * 2.1;
          const maxOrbit = p.r * 10.0;
          p.orbitPx = clamp(baseOrbit + a.r, minOrbit, maxOrbit);

          p.captureCooldown = 0.06;
          break;
        }
      }
    }
  }


  function drawPointerRing() {
    if (!Input.pointerDown) return;

    const pointerRadiusMul = CardEngine.state.engineStats.pointer_radius_mul || 1.0;
    const r = View.worldScale * World.pointerRadius * pointerRadiusMul;

    ctx.save();
    ctx.beginPath();
    ctx.arc(Input.wx, Input.wy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = Math.max(1.5, View.worldScale * 0.0015);
    ctx.setLineDash([6, 8]);
    ctx.stroke();
    ctx.restore();
  }

   /* =========================================================
     Part 3/3
     - Collisions meteor-meteor
     - Capture -> add orbiter (full size) + orbit speed by radius
     - Asteroid drift/bounce + collapse -> planet
     - Update/render loop + restart + FPS
     ========================================================= */

  function resolveMeteorCollisionsSafe() {
    const arr = World.meteors;
    if (arr.length < 2) return;

    const nowMs = (World.nowMs ?? performance.now());
    const toRemove = new Set();
    for (let i = 0; i < arr.length; i++) {
      if (toRemove.has(i)) continue;
      const a = arr[i];
      if (a.age < 0.25) continue;

      for (let j = i + 1; j < arr.length; j++) {
        if (toRemove.has(j)) continue;
        const b = arr[j];
        if (b.age < 0.25) continue;

        if ((a.noMeteorCollisionUntilMs && nowMs < a.noMeteorCollisionUntilMs) || (b.noMeteorCollisionUntilMs && nowMs < b.noMeteorCollisionUntilMs)) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist2 = dx * dx + dy * dy;
       const minDist = (a.r + b.r) * World.meteorCollisionFudge;

if (dist2 <= minDist * minDist) {

          if (a.colorName === b.colorName) {
            addScore(1);
            Events.emit("METEOR_SAME_COLOR_COLLISION", { color: a.colorName });
            toRemove.add(i);
            toRemove.add(j);
            break;
          } else {
            spawnAsteroidFromCollision(a, b);
            Events.emit("METEOR_DIFF_COLOR_COLLISION", {
              a: { color: a.colorName },
              b: { color: b.colorName }
            });
            toRemove.add(i);
            toRemove.add(j);
            break;
          }
        }
      }
    }

    if (toRemove.size) {
      const idxs = Array.from(toRemove).sort((x, y) => y - x);
      for (const idx of idxs) arr.splice(idx, 1);
    }
  }

  // omega ~ 1/sqrt(r)
  function computeOmega(baseOmega, orbitRpx, Rm) {
    const rNorm = Math.max(0.25, orbitRpx / (6 * Rm));
    return baseOmega / Math.sqrt(rNorm);
  }

  function addOrbiterToAsteroid(a, meteor) {
    const Rm = meteorBaseRadius();
    const orbR = meteor.r;

    const idx = a.orbiters.length;
    const minOrbit = a.r + a.orbiterMinGapPx + orbR;

    const step = a.orbiterGapStepPx + orbR * 0.8;
    const candidate = minOrbit + idx * step;

    const maxOrbit = Math.max(minOrbit, a.orbitPx - orbR);
    const orbitR = clamp(candidate, minOrbit, maxOrbit);

    const typeMul = (a.sides <= 6) ? 0.85 : 1.0;
    const baseOmega = rand(0.8, 1.35) * typeMul;
    const direction = Math.random() < 0.5 ? -1 : 1;
    const omega = direction * computeOmega(baseOmega, orbitR, Rm);

    a.orbiters.push({
      hue: meteor.hue,
      colorName: meteor.colorName,
      r: orbR,
      orbitR,
      angle: rand(0, Math.PI * 2),
      omega,
    });

    WorldAPI._clampOrbitersToOrbit(a);
  }

// [ANCHOR:ASTEROIDS]
  function captureMeteorsByAsteroids(dt, nowMs) {
    if (!World.asteroids.length || !World.meteors.length) return;

    for (const a of World.asteroids) {
      a.captureCooldown = Math.max(0, a.captureCooldown - dt);
    }

    const meteors = World.meteors;

    for (let mi = meteors.length - 1; mi >= 0; mi--) {
      const m = meteors[mi];
      if (m.noAsteroidOrbit) continue;
      if (m.age < 0.15) continue;

      for (let ai = 0; ai < World.asteroids.length; ai++) {
        const a = World.asteroids[ai];
        if (a.captureCooldown > 0) continue;
        if (a.isCollapsing) continue;

        // After comet release, prevent immediate re-capture by the same asteroid
        if (m.noAsteroidOrbitUntilMs && nowMs < m.noAsteroidOrbitUntilMs) {
          if (m.ignoreAsteroidId === a._id) continue;
        }

        const dx = m.x - a.x;
        const dy = m.y - a.y;
        const d2 = dx * dx + dy * dy;

        const capR = a.orbitPx + m.r;
        if (d2 <= capR * capR) {
          meteors.splice(mi, 1);

          a.captureCount += 1;
          a.captureSumR += m.r;
          a.captureSumMass += massFromR(m.r);
          a.captureColorCounts[m.colorName] = (a.captureColorCounts[m.colorName] || 0) + 1;

          // live stats (used for final planet size / composition)
          a.liveSumR += m.r;
          a.liveSumMass += massFromR(m.r);
          a.liveColorCounts[m.colorName] = (a.liveColorCounts[m.colorName] || 0) + 1;

          a.r = clamp(a.r + m.r * 0.12, a.minR, a.maxR);
          a.orbitPx = clamp(a.orbitPx + m.r, a.minOrbitPx, a.maxOrbitPx);

          addOrbiterToAsteroid(a, m);

          a.captureCooldown = 0.045;

          if (a.captureCount >= World.planetCaptureTarget) {
            startAsteroidCollapse(a);
          }
          break;
        }
      }
    }
  }

  function startAsteroidCollapse(a) {
    a.isCollapsing = true;
    a.collapseT = 0;
    a.captureCooldown = 0.25;
    Events.emit("ASTEROID_COLLAPSE_START", { sides: a.sides });
  }

  function finishCollapseToPlanet(a) {
    const entries = Object.entries(a.liveColorCounts || a.captureColorCounts);
    entries.sort((p, q) => (q[1] - p[1]));
    const top1 = entries[0]?.[0] || "blue";
    const top2 = entries[1]?.[0] || top1;

    const hueA = hueFromName(top1);
    const hueB = hueFromName(top2);

    const Rm = meteorBaseRadius();
    const sumR = (typeof a.liveSumR === 'number') ? a.liveSumR : a.captureSumR;
    const sumM = (typeof a.liveSumMass === 'number') ? a.liveSumMass : a.captureSumMass;

    const r0 = clamp(
      (sumR * 0.55) + Math.sqrt(sumM) * 0.18,
      1.6 * Rm,
      90.0 * Rm
    );

    const orbit0 = clamp(
      r0 * 2.1 + sumR * 0.35,
      4.0 * Rm,
      160.0 * Rm
    );

    const planetMass = sumM + massFromR(a.r);

    const p = {
      type: "planet",
      x: a.x,
      y: a.y,
      vx: a.vx,
      vy: a.vy,
      r: r0,
      orbitPx: orbit0,
      hueA,
      hueB,
      mass: planetMass,
      planetKind: (a.cometHits && a.cometHits > 0) ? "rocky" : "gas",
      cometHits: a.cometHits || 0,

      // Planet orbital system
      orbiters: [],
      captureCooldown: 0,
      captureCount: 0,
      captureSumR: 0,
      captureSumMass: 0,
      captureColorCounts: Object.create(null),
      // For future: captured asteroids with their systems
            rings: [],
      capturedAsteroids: [],
    };

    World.planets.push(p);

    a.orbiters = [];
    Events.emit("PLANET_CREATED", { hueA, hueB, top1, top2 });
  }

  function updateAsteroidCollapse(a, dt) {
    a.collapseT += dt;
    const t = clamp(a.collapseT / a.collapseDuration, 0, 1);
    const ease = t * t * (3 - 2 * t);

    for (const o of a.orbiters) {
      const target = a.r + o.r * 0.25;
      o.orbitR = o.orbitR + (target - o.orbitR) * (0.12 + 0.55 * ease);
      o.omega *= (1.0 + 0.8 * dt);
    }

    a.orbitPx = a.orbitPx + (Math.max(a.r * 1.2, a.orbitPx * 0.75) - a.orbitPx) * (0.05 + 0.25 * ease);

    if (t >= 1) {
      finishCollapseToPlanet(a);
      a._dead = true;
    }
  }

  function updateAsteroids(dt) {
    const bounceLoss = 0.90;
    const b = getWorldViewBounds();

    for (const a of World.asteroids) {
      if (a.parentKind === "planet") {
        const p = a.parentRef;
        if (p) {
          a.theta = (a.theta || 0) + (a.omega || 0) * dt;
          const orbitR = (typeof a.orbitR === "number" && isFinite(a.orbitR)) ? a.orbitR : (p.orbitPx || (p.r * 2.6));
          a.x = p.x + Math.cos(a.theta) * orbitR;
          a.y = p.y + Math.sin(a.theta) * orbitR;
        } else {
          a.parentKind = null;
          a.parentRef = null;
        }
      } else if (!a.isCollapsing) {
        a.x += a.vx * dt;
        a.y += a.vy * dt;

        a.vx *= (1 - 0.02 * dt);
        a.vy *= (1 - 0.02 * dt);

        if (a.x - a.r < b.l) { a.x = b.l + a.r; a.vx = Math.abs(a.vx) * bounceLoss; }
        if (a.x + a.r > b.r) { a.x = b.r - a.r; a.vx = -Math.abs(a.vx) * bounceLoss; }
        if (a.y - a.r < b.t) { a.y = b.t + a.r; a.vy = Math.abs(a.vy) * bounceLoss; }
        if (a.y + a.r > b.b) { a.y = b.b - a.r; a.vy = -Math.abs(a.vy) * bounceLoss; }
      }

      a.angle += a.spin * dt;

      const Rm = meteorBaseRadius();
      for (const o of a.orbiters) {
        const absBase = Math.min(2.2, Math.max(0.35, Math.abs(o.omega)));
        const sign = o.omega >= 0 ? 1 : -1;
        const omegaDyn = sign * computeOmega(absBase, o.orbitR, Rm);
        o.angle += omegaDyn * dt;
      }

      if (a.isCollapsing) updateAsteroidCollapse(a, dt);
    }

    for (let i = World.asteroids.length - 1; i >= 0; i--) {
      if (World.asteroids[i]._dead) World.asteroids.splice(i, 1);
    }
  }

  function updatePlanets(dt) {
    const bounceLoss = 0.94;
    const b = getWorldViewBounds();
    for (const p of World.planets) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      p.vx *= (1 - 0.01 * dt);
      p.vy *= (1 - 0.01 * dt);

      if (p.x - p.r < b.l) { p.x = b.l + p.r; p.vx = Math.abs(p.vx) * bounceLoss; }
      if (p.x + p.r > b.r) { p.x = b.r - p.r; p.vx = -Math.abs(p.vx) * bounceLoss; }
      if (p.y - p.r < b.t) { p.y = b.t + p.r; p.vy = Math.abs(p.vy) * bounceLoss; }
      if (p.y + p.r > b.b) { p.y = b.b - p.r; p.vy = -Math.abs(p.vy) * bounceLoss; }

      // orbiters update
      if (p.orbiters && p.orbiters.length) {
        const Rm = meteorBaseRadius();
        for (const o of p.orbiters) {
          const absBase = Math.min(1.8, Math.max(0.18, Math.abs(o.omega)));
          const sign = o.omega >= 0 ? 1 : -1;
          const omegaDyn = sign * computeOmega(absBase, o.orbitR, Rm);
          o.angle += omegaDyn * dt;
        }
      }
    }
  }

  function updateMeteors(dt) {
    World.spawnTimer += dt;
    while (World.spawnTimer >= (World.spawnInterval * (World.spawnIntervalMul || 1.0))) {
      World.spawnTimer -= (World.spawnInterval * (World.spawnIntervalMul || 1.0));
      if (World.meteors.length < World.maxMeteors) spawnMeteor();
    }

    const controlMul = CardEngine.state.engineStats.meteor_mouse_control || 1.0;
    const pointerRadiusMul = CardEngine.state.engineStats.pointer_radius_mul || 1.0;
    const pointerStrengthMul = CardEngine.state.engineStats.pointer_strength_mul || 1.0;

    const pointerRadiusPx = View.worldScale * World.pointerRadius * pointerRadiusMul;
    const pointerRadiusSq = pointerRadiusPx * pointerRadiusPx;

    const attract = Input.pointerDown;
    const ax = Input.wx;
    const ay = Input.wy;

    const attractionStrength = World.pointerStrength * controlMul * pointerStrengthMul;

    for (let i = World.meteors.length - 1; i >= 0; i--) {
      const m = World.meteors[i];
      m.age += dt;

      if (attract) {
        const dx = ax - m.x;
        const dy = ay - m.y;
        const d2 = dx * dx + dy * dy;

        if (d2 <= pointerRadiusSq) {
  const d = Math.sqrt(d2) || 1;
  const t = 1 - (d / pointerRadiusPx);
  const falloff = t * t * (3 - 2 * t);

  // 1) przyciąganie do kursora
  const pull = attractionStrength * falloff * (View.worldScale / 800);
  m.vx += (dx / d) * pull * View.worldScale * dt;
  m.vy += (dy / d) * pull * View.worldScale * dt;

  // 2) "klejenie": tłumienie prędkości gdy meteor jest w ring-u
  // (mniej mijania, bardziej kontrolowalne zderzenia)
  const glue = World.pointerGlueDamp * falloff; // mocniej bliżej środka ring-u
  m.vx *= (1 - glue);
  m.vy *= (1 - glue);
}

      }

      m.x += m.vx * dt;
      m.y += m.vy * dt;

      m.vx *= (1 - 0.06 * dt);
      m.vy *= (1 - 0.06 * dt);

      const bounceLoss = 0.92;
      const b = getWorldViewBounds();
      if (m.x - m.r < b.l) { m.x = b.l + m.r; m.vx = Math.abs(m.vx) * bounceLoss; }
      if (m.x + m.r > b.r) { m.x = b.r - m.r; m.vx = -Math.abs(m.vx) * bounceLoss; }
      if (m.y - m.r < b.t) { m.y = b.t + m.r; m.vy = Math.abs(m.vy) * bounceLoss; }
      if (m.y + m.r > b.b) { m.y = b.b - m.r; m.vy = -Math.abs(m.vy) * bounceLoss; }

      m.life -= dt;
      if (m.life <= 0) World.meteors.splice(i, 1);
    }
  }

  function update(dt) {
    const nowMs = performance.now();
    World.nowMs = nowMs;
    // CardEngine runtime (offers, timed effects, rituals)
    CardEngine.update(dt, nowMs);


    // camera ease
    Camera.target = clamp(Camera.target, Camera.min, Camera.max);
    Camera.scale += (Camera.target - Camera.scale) * Camera.ease;

    // input -> world coords (because render uses Camera.scale)
    const wp = screenToWorld(Input.x, Input.y);
    Input.wx = wp.x;
    Input.wy = wp.y;

    // epoch zoom triggers
    if (!World.flags.firstPlanetZoomed && World.planets.length >= 1) {
      World.flags.firstPlanetZoomed = true;
      Camera.target = 0.65;
    }

    updateMeteors(dt);
    Comets.update(dt, nowMs);
    resolveMeteorCollisionsSafe();
    captureMeteorsByAsteroids(dt, nowMs);
    captureMeteorsByPlanets(dt, nowMs);
    captureAsteroidsByPlanets(dt, nowMs);
    updateAsteroids(dt);
    updatePlanets(dt);

    if (World.stars && World.stars.length) {
      for (const star of World.stars) {
        const birth = star?.starBirth || star?.birth;
        if (!birth || birth.phase !== "done") continue;
        if (star.sizeClass) continue;

        const orbitersCount = WorldAPI.countStarSystemOrbiters(star, { cap: Infinity });
        if (orbitersCount <= World.STAR_SIZE_SMALL_MAX_ORBITERS) {
          star.sizeClass = "small";
          star.gradientOuterColor = "yellow";
        } else if (orbitersCount <= World.STAR_SIZE_BIG_MAX_ORBITERS) {
          star.sizeClass = "big";
          star.gradientOuterColor = "blue";
        } else {
          star.sizeClass = "very_big";
          star.gradientOuterColor = "orangered";
        }
      }
    }
  }

  function render() {
    drawBackground();

    // world render with camera zoom
    ctx.save();
    const cx = View.w / 2;
    const cy = View.h / 2;
    ctx.translate(cx, cy);
    ctx.scale(Camera.scale, Camera.scale);
    ctx.translate(-cx, -cy);

    drawPointerRing();
    Comets.draw(ctx);
    for (const a of World.asteroids) drawAsteroid(a);
    for (const p of World.planets) drawPlanet(p);
    for (const m of World.meteors) drawMeteor(m);

    ctx.restore();

    // UI: card offer (foundation)
    ctx.save();
    ctx.font = ctx.font || "14px sans-serif";
    ctx.fillStyle = "rgba(20,20,20,0.85)";
    // CardEngine.render will draw panel; it will switch fillStyle for text internally
    CardEngine.render(ctx, View.w, View.h);
    ctx.restore();

  }

  function resetWorld() {
    World.meteors = [];
    World.asteroids = [];
    World.planets = [];
    World.spawnTimer = 0;
    World.score = 0;

    // Reset epoch/zoom state
    World.flags = { firstPlanetZoomed: false, firstStarZoomed: false };
    Camera.scale = 1.0;
    Camera.target = 1.0;

    if (scoreLabel) scoreLabel.textContent = "Score: 0";
    CardEngine.resetForNewRun();
  }

  if (btnRestart) btnRestart.addEventListener("click", resetWorld);
  resetWorld();

  let last = performance.now();
  let fpsAcc = 0;
  let fpsFrames = 0;

  function frame(now) {
    const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
    last = now;

    update(dt);
    render();

    fpsAcc += dt;
    fpsFrames += 1;
    if (fpsAcc >= 0.5) {
      const fps = Math.round(fpsFrames / fpsAcc);
      if (fpsLabel) fpsLabel.textContent = `FPS: ${fps}`;
      fpsAcc = 0;
      fpsFrames = 0;
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

})(); // end IIFE
