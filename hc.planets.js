// HC planets subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  window.HC.initPlanets = () => {
    const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
    const Events = window.Events;
    const util = (window.HC && window.HC.Util) || window.HC?.Util;
    const clamp = (util && util.clamp) || window.clamp;
    const rand = window.rand;
    const meteorBaseRadius = window.meteorBaseRadius;
    const massFromR = window.massFromR;
    const computeGravityFromPlanetRadius = window.computeGravityFromPlanetRadius;
    const computeOmega = window.computeOmega;
    const getWorldViewBounds = window.getWorldViewBounds;
    const hueFromName = window.hueFromName;
    const makeRng = window.makeRng;
    const hash32 = window.hash32;
    const getDirectOrbitersOfBody = window.getDirectOrbitersOfBody;
    const removeOrbitersConsumed = window.removeOrbitersConsumed;
    const reconcileStarOwnershipOnBirth = window.reconcileStarOwnershipOnBirth;
    const startStarEpochZoomOut = window.startStarEpochZoomOut;
    const transformAsteroidIntoRockyPlanet = window.transformAsteroidIntoRockyPlanet;
    const View = (window.HC.getView && window.HC.getView()) || window.View;

    function setPlanetOrbitRadius(p, currentRadius) {
      const mul = (typeof World.metaOrbitMulPlanet === "number") ? World.metaOrbitMulPlanet : 1;
      const safeMul = Number.isFinite(mul) ? mul : 1;
      const baseRadius = safeMul !== 0 ? (currentRadius / safeMul) : currentRadius;
      p.orbitNativeRadius = baseRadius;
      p.orbitCurrentRadius = currentRadius;
      p.orbitPx = currentRadius;
    }

    function finalizePlanetSpawn(parentBody, planet, opts) {
      const safeOpts = opts || {};
      const orbitR = parentBody?.gravOrbitR
        ?? parentBody?.orbitR
        ?? parentBody?.orbitCurrentRadius
        ?? parentBody?.orbitPx
        ?? parentBody?.gravR
        ?? null;
      let resolvedOrbitR = orbitR;
      if (!Number.isFinite(resolvedOrbitR)) {
        const fallbackBase = (typeof meteorBaseRadius === "function") ? meteorBaseRadius() : 120;
        resolvedOrbitR = fallbackBase * 40;
        if (typeof console !== "undefined" && console.warn) {
          console.warn("Planet spawn fallback orbit radius used.", { parentBody, planet, opts: safeOpts, resolvedOrbitR });
        }
      }

      planet.r = resolvedOrbitR * 0.5;
      if ("radius" in planet) planet.radius = planet.r;
      if ("baseR" in planet) planet.baseR = planet.r;
      planet.fixedR = planet.r;
      planet.lockRadius = true;

      if (typeof console !== "undefined" && console.warn) {
        if (planet.r < 5 || planet.r < resolvedOrbitR * 0.4 || planet.r > resolvedOrbitR * 0.6) {
          console.warn("Planet radius suspiciously small or scaled incorrectly.", { parentBody, planet, opts: safeOpts, orbitR: resolvedOrbitR });
        }
      }

      return planet;
    }

    function buildColorWeightsFromOrbiters(orbiters) {
      const map = new Map();
      let total = 0;
      for (const o of orbiters) {
        const colorName = o.color || o.col || o.fill || o.colorName || "#888";
        const hue = (typeof o.hue === "number") ? o.hue : hueFromName(colorName);
        const weight = Math.max(0.01, (o.r || 1)) * World.ROCKY_FROM_AST_ORBITER_R_WEIGHT;
        const prev = map.get(colorName);
        if (prev) {
          prev.w += weight;
        } else {
          map.set(colorName, { colorName, hue, w: weight });
        }
        total += weight;
      }
      if (!map.size || total <= 0) {
        return {
          colors: [],
          isMono: true,
          monoColor: "#888",
          dominantColor: "#888",
          totalWeight: 0,
          avgHue: hueFromName("blue"),
        };
      }
      const colors = [];
      for (const entry of map.values()) {
        colors.push({ ...entry, wn: entry.w / Math.max(1e-9, total) });
      }
      colors.sort((a, b) => b.w - a.w);
      let avgHue = hueFromName("yellow");
      if (colors.length) {
        let hueSum = 0;
        for (const c of colors) hueSum += c.hue * c.wn;
        avgHue = hueSum;
      }
      const isMono = colors.length === 1;
      const monoColor = colors[0]?.colorName || "#888";
      const dominantColor = isMono ? monoColor : (colors[0]?.colorName || monoColor);
      return {
        colors,
        isMono,
        monoColor,
        dominantColor,
        totalWeight: total,
        avgHue,
      };
    }

    function buildBlobPatchwork(planetId, weights, blobCount) {
      if (!weights || !weights.colors || weights.colors.length === 0) {
        return {
          isMono: true,
          monoColor: (weights && (weights.dominantColor || weights.monoColor)) || "#888",
          dominantColor: (weights && (weights.dominantColor || weights.monoColor)) || "#888",
          blobs: [],
        };
      }
      if (weights.isMono) {
        return { isMono: true, monoColor: weights.monoColor, dominantColor: weights.dominantColor, blobs: [] };
      }
      const seed = hash32(`rocky:${planetId}`);
      const rnd = makeRng(seed);
      const target = Math.max(8, blobCount | 0);
      const colorBuckets = [];
      const colorMap = new Map();
      for (const c of weights.colors) {
        const count = Math.max(1, Math.round(c.wn * target));
        for (let i = 0; i < count; i++) colorBuckets.push(c.colorName);
        colorMap.set(c.colorName, c);
      }
      while (colorBuckets.length < target) colorBuckets.push(weights.colors[0].colorName);
      while (colorBuckets.length > target) colorBuckets.pop();

      const blobs = [];
      for (let i = 0; i < target; i++) {
        const colorName = colorBuckets[i];
        let x = 0, y = 0;
        for (let tries = 0; tries < 10; tries++) {
          x = rnd() * 2 - 1;
          y = rnd() * 2 - 1;
          if (x * x + y * y <= 1) break;
        }
        const rN = World.ROCKY_PATCH_BLOB_R_MIN
          + (World.ROCKY_PATCH_BLOB_R_MAX - World.ROCKY_PATCH_BLOB_R_MIN) * rnd();
        const jag = 0.15 + 0.35 * rnd();
        const entry = colorMap.get(colorName);
        blobs.push({
          xN: x,
          yN: y,
          rN,
          colorName,
          hue: entry ? entry.hue : hueFromName(colorName || "blue"),
          jag,
          seed: hash32(`blob:${planetId}:${i}`),
        });
      }
      return { isMono: false, monoColor: null, dominantColor: weights.dominantColor, blobs };
    }

    function computeRockyParamsFromOrbiters(orbiters) {
      let sumR = 0;
      let sumMassProxy = 0;
      for (const o of orbiters) {
        const r = o.r || 0;
        sumR += r;
        sumMassProxy += (typeof o.mass === "number") ? o.mass : (r * r);
      }
      const Rm = meteorBaseRadius();
      const planetR = (World.ROCKY_FROM_AST_BASE_R * Rm) + (World.ROCKY_FROM_AST_KR * sumR);
      const planetMass = (World.ROCKY_FROM_AST_BASE_MASS * (Rm * Rm)) + (World.ROCKY_FROM_AST_KM * sumMassProxy);
      const gravityR = computeGravityFromPlanetRadius(planetR);
      return { planetR, planetMass, gravityR };
    }

    function countSystemOrbitersForRocky(p) {
      const seenIds = new Set();
      const seenObjs = new Set();
      let count = 0;

      function add(obj) {
        if (!obj) return;
        const id = obj.id ?? obj._id;
        if (id !== undefined && id !== null) {
          if (seenIds.has(id)) return;
          seenIds.add(id);
        } else {
          if (seenObjs.has(obj)) return;
          seenObjs.add(obj);
        }
        count += 1;
      }

      if (p.orbiters && p.orbiters.length) {
        for (const o of p.orbiters) add(o);
      }

      if (World.asteroids && World.asteroids.length) {
        for (const a of World.asteroids) {
          if (a.parentKind !== "planet" || a.parentRef !== p) continue;
          add(a);
          if (a.orbiters && a.orbiters.length) {
            for (const o of a.orbiters) add(o);
          }
        }
      }

      return count;
    }

    function countOrbitersInBodySystem(o) {
      let count = 0;
      if (o) count += 1;
      if (o && o.orbiters && o.orbiters.length) count += o.orbiters.length;
      return count;
    }

    function absorbBodiesIntoRocky(p, bodies) {
      if (!bodies || !bodies.length) return;
      for (const b of bodies) {
        const r = b?.r || 0;
        p.mass = (p.mass || 0) + massFromR(r);
      }
    }

    function getSystemMeteorsForPlanet(p) {
      const out = [];
      const seenIds = new Set();
      const seenObjs = new Set();

      function addMeteor(m) {
        if (!m) return;
        const id = m.id ?? m._id;
        if (id !== undefined && id !== null) {
          if (seenIds.has(id)) return;
          seenIds.add(id);
        } else {
          if (seenObjs.has(m)) return;
          seenObjs.add(m);
        }
        out.push(m);
      }

      if (p.orbiters && p.orbiters.length) {
        for (const m of p.orbiters) addMeteor(m);
      }

      if (World.asteroids && World.asteroids.length) {
        for (const a of World.asteroids) {
          if (a.parentKind !== "planet" || a.parentRef !== p) continue;
          if (a.orbiters && a.orbiters.length) {
            for (const m of a.orbiters) addMeteor(m);
          }
        }
      }

      return out;
    }

    function classifyMeteorColor(m) {
      const name = (m.colorName || m.color || m.col || m.fill || "").toString().toLowerCase();
      const keys = {
        blue: World.STAR_COLOR_KEY_BLUE,
        green: World.STAR_COLOR_KEY_GREEN,
        red: World.STAR_COLOR_KEY_RED,
        yellow: World.STAR_COLOR_KEY_YELLOW,
      };
      if (name === keys.blue) return "blue";
      if (name === keys.green) return "green";
      if (name === keys.red) return "red";
      if (name === keys.yellow) return "yellow";

      const hue = (typeof m.hue === "number") ? m.hue : null;
      if (hue === null) return null;
      const base = {
        blue: hueFromName(keys.blue),
        green: hueFromName(keys.green),
        red: hueFromName(keys.red),
        yellow: hueFromName(keys.yellow),
      };
      let bestKey = null;
      let bestDist = Infinity;
      for (const [key, h] of Object.entries(base)) {
        const d = Math.min(Math.abs(hue - h), 360 - Math.abs(hue - h));
        if (d < bestDist) {
          bestDist = d;
          bestKey = key;
        }
      }
      return bestKey;
    }

    function analyzeSystemMeteors(meteors) {
      const counts = { blue: 0, green: 0, red: 0, yellow: 0 };
      let total = 0;
      let monoColorKey = null;
      let monoOk = true;

      for (const m of meteors) {
        const key = classifyMeteorColor(m);
        if (!key) continue;
        total += 1;
        counts[key] += 1;
        if (monoColorKey === null) monoColorKey = key;
        else if (monoColorKey !== key) monoOk = false;
      }

      const order = ["blue", "green", "red", "yellow"];
      let dominantKey = null;
      let maxCount = -1;
      for (const key of order) {
        if (counts[key] > maxCount) {
          maxCount = counts[key];
          dominantKey = key;
        }
      }
      return { total, counts, dominantKey, monoOk, monoColorKey };
    }

    function getBaseStarThresholdForColor(colorKey) {
      if (colorKey === "blue") return World.STAR_REQ_BLUE;
      if (colorKey === "green") return World.STAR_REQ_GREEN;
      if (colorKey === "red") return World.STAR_REQ_RED;
      if (colorKey === "yellow") return World.STAR_REQ_YELLOW;
      return Infinity;
    }

    function getStarThresholdForColor(colorKey) {
      const base = getBaseStarThresholdForColor(colorKey);
      if (!Number.isFinite(base)) return base;
      const mult = (typeof World.starThresholdMultiplierThisRun === "number")
        ? World.starThresholdMultiplierThisRun
        : 1.0;
      return Math.ceil(base * Math.max(0.01, mult));
    }

    function qualifiesForPreStar(info) {
      if (!info || !info.dominantKey || info.total <= 0) return false;
      const dominantCount = info.counts?.[info.dominantKey] || 0;
      const dominantPct = dominantCount / Math.max(1, info.total);
      const requiredPct = (typeof World.starDominancePctBase === "number")
        ? World.starDominancePctBase
        : 0.60;
      if (dominantPct < requiredPct) return false;
      const requiredCount = getStarThresholdForColor(info.dominantKey);
      return dominantCount >= requiredCount;
    }

    function removeSystemMeteorsFromPlanet(p, meteors) {
      if (!meteors || !meteors.length) return;
      const set = new Set(meteors);

      if (p.orbiters && p.orbiters.length) {
        for (let i = p.orbiters.length - 1; i >= 0; i--) {
          if (set.has(p.orbiters[i])) p.orbiters.splice(i, 1);
        }
      }

      if (World.asteroids && World.asteroids.length) {
        for (const a of World.asteroids) {
          if (a.parentKind !== "planet" || a.parentRef !== p) continue;
          if (!a.orbiters || !a.orbiters.length) continue;
          for (let i = a.orbiters.length - 1; i >= 0; i--) {
            if (set.has(a.orbiters[i])) a.orbiters.splice(i, 1);
          }
        }
      }
    }

    function clearSystemOrbitersForStar(p) {
      const meteors = getSystemMeteorsForPlanet(p);
      removeSystemMeteorsFromPlanet(p, meteors);
      return meteors;
    }

    function transformGasPlanetIntoStar(p, info, kind) {
      const oldGravityR = p.gravityR || computeGravityFromPlanetRadius(p.r);
      clearSystemOrbitersForStar(p);

      if (!World.stars) World.stars = [];
      const starOrbitMul = (typeof World.metaOrbitMulStar === "number") ? World.metaOrbitMulStar : 1;
      const star = {
        type: "star",
        x: p.x,
        y: p.y,
        r: p.r,
        mass: p.mass,
        gravityR: 0,
        orbitNativeRadius: 0,
        orbitCurrentRadius: 0,
        orbiters: [],
        starKind: kind,
        dominantKey: info.dominantKey,
        monoColorKey: info.monoColorKey,
        starBirth: { phase: "done" },
        birth: {
          active: true,
          phase: "collapse",
          t: 0,
          duration: 5.0,
          fadeOut: 2.0,
          timeAbs: 0,
          absorb: [],
        },
        baseColor: info.monoColorKey || info.dominantKey || "yellow",
        shimmer: kind === "rare" ? { active: true, seed: (p._id || p.id || 1) } : null,
        sizeClass: kind === "rare" ? "small" : null,
        gradientOuterColor: kind === "rare" ? (info.monoColorKey || info.dominantKey || "yellow") : null,
      };
      star.r = Math.max(1, oldGravityR * 0.5);
      const updatedBaseGravity = star.r * 1.30;
      star.orbitNativeRadius = updatedBaseGravity;
      star.orbitCurrentRadius = updatedBaseGravity * starOrbitMul;
      star.gravityR = star.orbitCurrentRadius;
      World.stars.push(star);
      window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_OBJECT_TRANSFORMED, {
        fromType: "planet",
        toType: "star",
        planetId: p.id || p._id || null,
        starKind: kind || null,
      }, { snapshot: true, source: "Planets.transformGasPlanetIntoStar" });
      if (reconcileStarOwnershipOnBirth) reconcileStarOwnershipOnBirth(p, star);
      if (startStarEpochZoomOut) startStarEpochZoomOut(star, View.w, View.h);

      if (Events && typeof Events.emit === "function") {
        Events.emit("STAR_BORN", { starId: star.id || star._id, fromPlanetId: p.id || p._id });
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

    function addOrbiterToPlanet(p, meteor) {
      if (!p.orbiters) p.orbiters = [];
      const Rm = meteorBaseRadius();
      const orbR = meteor.r;

      const idx = p.orbiters.length;
      const minOrbit = p.r + (Rm * 0.9) + orbR;

      const step = (Rm * 1.2) + orbR * 0.85;
      const candidate = minOrbit + idx * step;

      const maxOrbit = Math.max(minOrbit, (p.orbitPx || (p.r * 2.4)) - orbR);
      const baseOrbitRadius = clamp(candidate, minOrbit, maxOrbit);
      const orbitR = baseOrbitRadius * ((typeof World.metaOrbitMulPlanet === "number") ? World.metaOrbitMulPlanet : 1);

      const baseOmega = rand(0.35, 0.95);
      const direction = Math.random() < 0.5 ? -1 : 1;
      const omega = direction * computeOmega(baseOmega, orbitR, Rm);

      const renderMul = 0.5;
      p.orbiters.push({
        hue: meteor.hue,
        colorName: meteor.colorName,
        r: orbR,
        renderMul,
        orbitContributionR: orbR * renderMul,
        orbitR,
        angle: rand(0, Math.PI * 2),
        omega,
      });
    }

    function bounceMeteorFromBody(meteor, body, radius) {
      const dx = meteor.x - body.x;
      const dy = meteor.y - body.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;
      const dot = (meteor.vx || 0) * nx + (meteor.vy || 0) * ny;
      meteor.vx = (meteor.vx || 0) - 2 * dot * nx;
      meteor.vy = (meteor.vy || 0) - 2 * dot * ny;
      const push = (Number(radius) || 0) + meteor.r + 0.5;
      meteor.x = body.x + nx * push;
      meteor.y = body.y + ny * push;
    }

    function isR1ColorActive(colorName, nowMs) {
      const CE = window.CardEngine;
      if (!CE || typeof CE.isColorR1Active !== "function") return false;
      return CE.isColorR1Active(colorName, nowMs);
    }

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
        // TODO: pack01ReleaseBlockColor/UntilMs are read here but not set in SOURCE.
        if (World.pack01ReleaseBlockColor
          && nowMs < (World.pack01ReleaseBlockUntilMs || 0)
          && m.colorName === World.pack01ReleaseBlockColor) {
          continue;
        }
        if (isR1ColorActive(m.colorName, nowMs)) continue;

        for (let pi = 0; pi < World.planets.length; pi++) {
          const p = World.planets[pi];
          if (p.captureCooldown > 0) continue;

          const dx = m.x - p.x;
          const dy = m.y - p.y;
          const d2 = dx * dx + dy * dy;
          const collideR = p.r + m.r;

          if (p.isRocky) {
            const currentCount = countSystemOrbitersForRocky(p);
            if (p.rockyLocked || currentCount >= World.ROCKY_MAX_SYSTEM_ORBITERS) {
              p.rockyLocked = true;
              if (d2 <= collideR * collideR) {
                meteors.splice(mi, 1);
                absorbBodiesIntoRocky(p, [m]);
                p.captureCooldown = 0.04;
                break;
              }
              continue;
            }
            if (currentCount + 1 > World.ROCKY_MAX_SYSTEM_ORBITERS) {
              p.rockyLocked = true;
              if (d2 <= collideR * collideR) {
                meteors.splice(mi, 1);
                absorbBodiesIntoRocky(p, [m]);
                p.captureCooldown = 0.04;
                break;
              }
              continue;
            }
          }

          const capR = (p.orbitPx || (p.r * 2.4)) + m.r;
          if (d2 <= capR * capR) {
            const runTimers = window.HC && window.HC.RunTimers;
            const worldActive = runTimers && typeof runTimers.isWorldSlotsActive === "function"
              && runTimers.isWorldSlotsActive(World, nowMs);
            const bouncePct = Number(World.fxIntentBouncePlanetPct || 0);
            if (worldActive && Number.isFinite(bouncePct) && bouncePct > 0 && Math.random() < bouncePct) {
              bounceMeteorFromBody(m, p, capR);
              continue;
            }
            meteors.splice(mi, 1);

            const rEff = (typeof m.orbitContributionR === "number") ? m.orbitContributionR : (m.r * 0.5);
            p.captureCount = (p.captureCount || 0) + 1;
            p.captureSumR = (p.captureSumR || 0) + rEff;
            p.captureSumMass = (p.captureSumMass || 0) + massFromR(m.r);
            if (!p.captureColorCounts) p.captureColorCounts = Object.create(null);
            p.captureColorCounts[m.colorName] = (p.captureColorCounts[m.colorName] || 0) + 1;

            const baseOrbit = Math.max(p.orbitPx || (p.r * 2.4), p.r * 2.4);
            const nextOrbit = clamp(baseOrbit + rEff * 0.9, baseOrbit, meteorBaseRadius() * 420);
            setPlanetOrbitRadius(p, nextOrbit);
            const baseGravity = computeGravityFromPlanetRadius(p.r);
            p.gravityR = Math.max((p.gravityR || 0), baseGravity, nextOrbit);

            addOrbiterToPlanet(p, m);

            if (p.isRocky && countSystemOrbitersForRocky(p) >= World.ROCKY_MAX_SYSTEM_ORBITERS) {
              p.rockyLocked = true;
            }
            p.captureCooldown = 0.035;
            break;
          }
        }
      }
    }

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
          const collideR = p.r + a.r;

          const capR = (p.orbitPx || (p.r * 2.6)) + a.r;
          if (d2 <= capR * capR) {
            if (p.isRocky) {
              const currentCount = countSystemOrbitersForRocky(p);
              const incomingCount = countOrbitersInBodySystem(a);
              if (p.rockyLocked || currentCount >= World.ROCKY_MAX_SYSTEM_ORBITERS) {
                p.rockyLocked = true;
                if (d2 <= collideR * collideR) {
                  const absorbed = getDirectOrbitersOfBody(a);
                  absorbBodiesIntoRocky(p, absorbed);
                  removeOrbitersConsumed(absorbed);
                  absorbBodiesIntoRocky(p, [a]);
                  World.asteroids.splice(ai, 1);
                  p.captureCooldown = 0.06;
                  break;
                }
                continue;
              }
              if (currentCount + 1 > World.ROCKY_MAX_SYSTEM_ORBITERS) {
                p.rockyLocked = true;
                if (d2 <= collideR * collideR) {
                  const absorbed = getDirectOrbitersOfBody(a);
                  absorbBodiesIntoRocky(p, absorbed);
                  removeOrbitersConsumed(absorbed);
                  absorbBodiesIntoRocky(p, [a]);
                  World.asteroids.splice(ai, 1);
                  p.captureCooldown = 0.06;
                  break;
                }
                continue;
              }
              if (currentCount + incomingCount > World.ROCKY_MAX_SYSTEM_ORBITERS) {
                const absorbed = getDirectOrbitersOfBody(a);
                absorbBodiesIntoRocky(p, absorbed);
                removeOrbitersConsumed(absorbed);
                a.orbiters = [];
                p.rockyLocked = true;
              }
            }
            const Rm = meteorBaseRadius();
            const baseOrbit = Math.max(p.orbitPx || (p.r * 2.4), p.r * 2.4);
            const orbitR = baseOrbit + a.r;
            const theta = Math.atan2(dy, dx);
            const baseOmega = rand(0.35, 0.95);
            const direction = Math.random() < 0.5 ? -1 : 1;
            const omega = direction * computeOmega(baseOmega, orbitR, Rm);

            a.parentKind = "planet";
            a.parentRef = p;
            a.orbitR = orbitR;
            a.theta = theta;
            a.omega = omega;

            const nextOrbit = clamp(baseOrbit + a.r, baseOrbit, meteorBaseRadius() * 420);
            setPlanetOrbitRadius(p, nextOrbit);
            const baseGravity = computeGravityFromPlanetRadius(p.r);
            p.gravityR = Math.max((p.gravityR || 0), baseGravity, nextOrbit);

            if (p.isRocky && countSystemOrbitersForRocky(p) >= World.ROCKY_MAX_SYSTEM_ORBITERS) {
              p.rockyLocked = true;
            }
            p.captureCooldown = 0.06;
            break;
          }
        }
      }
    }

    function updatePlanets(dt) {
      const bounceLoss = 0.94;
      const b = getWorldViewBounds();
      for (let pi = 0; pi < World.planets.length; pi++) {
        const p = World.planets[pi];
        if (p.parentKind === "planet" && p.parentRef) {
          const parent = p.parentRef;
          p.theta = (p.theta || 0) + (p.omega || 0) * dt;
          const orbitR = (typeof p.orbitR === "number" && isFinite(p.orbitR)) ? p.orbitR : (parent.orbitPx || (parent.r * 2.6));
          p.x = parent.x + Math.cos(p.theta) * orbitR;
          p.y = parent.y + Math.sin(p.theta) * orbitR;
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          p.vx *= (1 - 0.01 * dt);
          p.vy *= (1 - 0.01 * dt);

          if (p.x - p.r < b.l) { p.x = b.l + p.r; p.vx = Math.abs(p.vx) * bounceLoss; }
          if (p.x + p.r > b.r) { p.x = b.r - p.r; p.vx = -Math.abs(p.vx) * bounceLoss; }
          if (p.y - p.r < b.t) { p.y = b.t + p.r; p.vy = Math.abs(p.vy) * bounceLoss; }
          if (p.y + p.r > b.b) { p.y = b.b - p.r; p.vy = -Math.abs(p.vy) * bounceLoss; }
        }

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

        if (p.isRocky && p.rockyForm && p.rockyForm.active) {
          p.rockyForm.t += dt;
          if (p.rockyForm.phase === "shrink") {
            if (p.rockyForm.t >= p.rockyForm.shrinkDur) {
              p.rockyForm.phase = "fade";
              p.rockyForm.t = 0;
            }
          } else if (p.rockyForm.phase === "fade") {
            if (p.rockyForm.t >= p.rockyForm.fadeDur) {
              p.rockyForm.active = false;
              p.rockyForm.phase = "done";
            }
          }
        }

        // Manual test:
        // 1) Utwórz planetę gazową i doprowadź do sytuacji, gdzie wcześniej natychmiast robiła się gwiazdą.
        // 2) Potwierdź wejście w PRESTAR (wolna pulsacja) i brak natychmiastowej transformacji.
        // 3) Sprawdź, że po zakończeniu PRESTAR następuje kolaps do gwiazdy przy spełnionych progach.
        // 4) Sprawdź różne dominujące kolory (np. yellow/blue) i różne progi.
        // 5) Wywołaj HC.WorldEvents.interruptPreStar(planetId), potwierdź powrót do planety
        //    oraz wzrost progu o +30% w tym samym runie.
        if (p.planetKind === "gas") {
          if (p.preStar && p.preStar.active) {
            p.preStar.t += dt;
            p.preStar.timeAbs = (p.preStar.timeAbs || 0) + dt;
            if (p.preStar.t >= p.preStar.duration) {
              transformGasPlanetIntoStar(p, p.preStar.info, p.preStar.kind);
              World.planets.splice(pi, 1);
              pi -= 1;
              continue;
            }
          } else {
            const meteors = getSystemMeteorsForPlanet(p);
            const info = analyzeSystemMeteors(meteors);
            if (qualifiesForPreStar(info)) {
              const isRare = info.total >= World.STAR_RARE_MONO_MIN && info.monoOk && info.monoColorKey;
              const infoForStar = isRare ? { ...info, dominantKey: info.monoColorKey } : info;
              const kind = isRare ? "rare" : "normal";
              const minDur = (typeof World.PRESTAR_DURATION_MIN === "number") ? World.PRESTAR_DURATION_MIN : 10.0;
              const maxDur = (typeof World.PRESTAR_DURATION_MAX === "number") ? World.PRESTAR_DURATION_MAX : 20.0;
              const duration = rand(Math.min(minDur, maxDur), Math.max(minDur, maxDur));
              p.preStar = {
                active: true,
                t: 0,
                timeAbs: 0,
                duration,
                kind,
                info: infoForStar,
              };
              if (Events && typeof Events.emit === "function") {
                Events.emit("PRESTAR_STARTED", { planetId: p.id || p._id });
              }
            }
          }
        }

        const baseGravity = computeGravityFromPlanetRadius(p.r);
        p.gravityR = Math.max((p.gravityR || 0), baseGravity);

        if (p.isRocky && !p.spinLikeAsteroid) {
          for (const g of World.planets) {
            if (g === p || g.planetKind !== "gas") continue;
            const gravityR = (typeof g.gravityR === "number") ? g.gravityR : computeGravityFromPlanetRadius(g.r);
            const d = Math.hypot(g.x - p.x, g.y - p.y);
            const eps = Math.max(World.GAS_GRAVITY_CONTACT_EPS, p.r * 0.15);
            if (Math.abs(d - gravityR) <= eps) {
              p.spinLikeAsteroid = true;
              const sign = Math.random() < 0.5 ? -1 : 1;
              p.spinOmega = sign * rand(World.ROCKY_SPIN_OMEGA_MIN, World.ROCKY_SPIN_OMEGA_MAX);
              p.spinAngle = p.spinAngle || 0;
              break;
            }
          }
        }

        if (p.spinLikeAsteroid) {
          p.spinAngle = (p.spinAngle || 0) + (p.spinOmega || 0) * dt;
        }
      }
    }

    window.buildColorWeightsFromOrbiters = buildColorWeightsFromOrbiters;
    window.buildBlobPatchwork = buildBlobPatchwork;
    window.computeRockyParamsFromOrbiters = computeRockyParamsFromOrbiters;
    window.addPlanetRingMark = addPlanetRingMark;
    window.finalizePlanetSpawn = finalizePlanetSpawn;

    if (Events && typeof Events.on === "function") {
      Events.on("PLANET_CREATED", () => {
        if (!World.subMetaShownThisRun) {
          World.subMetaShownThisRun = true;
          World.subMetaOpen = true;
          World.paused = true;
        }
      });
    }

    window.HC.Planets = {
      capture(dt, nowMs) {
        captureMeteorsByPlanets(dt, nowMs);
        captureAsteroidsByPlanets(dt, nowMs);
      },
      update(dt, nowMs) {
        updatePlanets(dt);
      },
      transformAsteroidIntoRockyPlanet,
    };
  };
})();
