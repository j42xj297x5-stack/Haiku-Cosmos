// HC asteroids subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  window.HC.initAsteroids = () => {
    const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
    const Events = window.Events;
    const clamp = (window.HC.Util && window.HC.Util.clamp) || window.clamp;
    const rand = window.rand;
    const meteorBaseRadius = window.meteorBaseRadius;
    const massFromR = window.massFromR;
    const hueFromName = window.hueFromName;
    const computeGravityFromPlanetRadius = window.computeGravityFromPlanetRadius;
    const computeOmega = window.computeOmega;
    const getWorldViewBounds = window.getWorldViewBounds;
    const sidesFromColors = window.sidesFromColors;
    const WorldAPI = window.WorldAPI;
    const finalizePlanetSpawn = window.finalizePlanetSpawn;

    // Internal ids (used for comet-release cooldown / ignore)
    let ASTEROID_ID_SEQ = 1;

    function setAsteroidOrbitRadius(a, currentRadius) {
      const mul = (typeof World.metaOrbitMulAsteroid === "number") ? World.metaOrbitMulAsteroid : 1;
      const safeMul = Number.isFinite(mul) ? mul : 1;
      const baseRadius = safeMul !== 0 ? (currentRadius / safeMul) : currentRadius;
      a.orbitNativeRadius = baseRadius;
      a.orbitCurrentRadius = currentRadius;
      a.orbitPx = currentRadius;
    }

    function spawnAsteroidFromCollision(a, b) {
      const x = (a.x + b.x) * 0.5;
      const y = (a.y + b.y) * 0.5;

      const sides = sidesFromColors(a.colorName, b.colorName);
      const r = (a.r + b.r) * 1.35;
      const spin = rand(0.08, 0.25) * (Math.random() < 0.5 ? -1 : 1);
      const light = rand(42, 62);

      const Rm = meteorBaseRadius();
      const initialMass = massFromR(a.r) + massFromR(b.r);

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

        // Legacy compatibility only: asteroids no longer expose an active capture/orbit radius.
        orbitPx: null,
        orbitNativeRadius: null,
        orbitCurrentRadius: null,
        minOrbitPx: 0,
        maxOrbitPx: 0,

        minR: 0.9 * Rm,
        maxR: 80.0 * Rm,

        // Legacy arrays/counters kept for older comet/debug code; new asteroids do not fill orbiters.
        orbiters: [],
        orbiterMinGapPx: 0,
        orbiterGapStepPx: 0,
        captureCooldown: 0,

        absorbedMeteorCount: 0,
        growthLevel: 0,
        mass: initialMass,
        growthSumR: 0,
        growthSumMass: initialMass,
        growthColorCounts: { blue: 0, green: 0, red: 0, yellow: 0 },
        // Legacy aliases: interpreted as direct-growth stats, not captured orbiters.
        captureCount: 0,
        captureSumR: 0,
        captureSumMass: initialMass,
        liveSumR: 0,
        liveSumMass: initialMass,
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

    function asteroidGrowthTarget() {
      const target = Number(World.asteroidGrowthTarget ?? World.planetCaptureTarget ?? 0);
      return Number.isFinite(target) && target > 0 ? target : Infinity;
    }

    function absorbMeteorIntoAsteroid(a, m) {
      const Rm = meteorBaseRadius();
      const oldR = Number.isFinite(a.r) ? a.r : Rm;
      const maxR = Number.isFinite(a.maxR) ? a.maxR : (80.0 * Rm);
      const meteorR = Number.isFinite(m.r) ? m.r : Rm;
      const growthAreaFactor = Number.isFinite(World.asteroidGrowthAreaFactor)
        ? clamp(World.asteroidGrowthAreaFactor, 0.05, 1.0)
        : 0.45;
      const nextR = Math.sqrt(oldR * oldR + meteorR * meteorR * growthAreaFactor);
      a.r = clamp(nextR, a.minR || (0.9 * Rm), maxR);

      a.absorbedMeteorCount = (a.absorbedMeteorCount || 0) + 1;
      a.growthLevel = a.absorbedMeteorCount;
      const rEff = (typeof m.orbitContributionR === "number") ? m.orbitContributionR : (meteorR * 0.5);
      const meteorMass = massFromR(meteorR);
      a.mass = (Number.isFinite(a.mass) ? a.mass : massFromR(oldR)) + meteorMass;
      a.growthSumR = (a.growthSumR || 0) + rEff;
      a.growthSumMass = (a.growthSumMass || 0) + meteorMass;
      a.growthColorCounts[m.colorName] = (a.growthColorCounts[m.colorName] || 0) + 1;

      // Compatibility aliases for existing threshold/debug/planet-composition code.
      a.captureCount = a.absorbedMeteorCount;
      a.captureSumR = a.growthSumR;
      a.captureSumMass = a.growthSumMass;
      a.captureColorCounts[m.colorName] = (a.captureColorCounts[m.colorName] || 0) + 1;
      a.liveSumR = a.growthSumR;
      a.liveSumMass = a.growthSumMass;
      a.liveColorCounts[m.colorName] = (a.liveColorCounts[m.colorName] || 0) + 1;
      a.captureCooldown = 0.045;
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

  // [ANCHOR:ASTEROIDS]
    function captureMeteorsByAsteroids(dt, nowMs) {
      // Migration 2026-06-05: compatibility wrapper name retained for boot order,
      // but asteroids no longer capture meteors into orbit or use an orbit radius.
      resolveMeteorAsteroidContacts(dt, nowMs);
    }

    function resolveMeteorAsteroidContacts(dt, nowMs) {
      if (!World.asteroids.length || !World.meteors.length) return;

      for (const a of World.asteroids) {
        a.captureCooldown = Math.max(0, a.captureCooldown - dt);
      }

      const meteors = World.meteors;
      const target = asteroidGrowthTarget();

      for (let mi = meteors.length - 1; mi >= 0; mi--) {
        const m = meteors[mi];
        if (m.age < 0.15) continue;
        if (World.pack01ReleaseBlockColor
          && nowMs < (World.pack01ReleaseBlockUntilMs || 0)
          && m.colorName === World.pack01ReleaseBlockColor) {
          continue;
        }
        if (isR1ColorActive(m.colorName, nowMs)) continue;

        for (let ai = 0; ai < World.asteroids.length; ai++) {
          const a = World.asteroids[ai];
          if (a.captureCooldown > 0) continue;
          if (a.isCollapsing) continue;
          if (a.absorbingIntoStarId) continue;

          const dx = m.x - a.x;
          const dy = m.y - a.y;
          const d2 = dx * dx + dy * dy;
          const contactR = (Number(a.r) || 0) + (Number(m.r) || 0);
          if (d2 <= contactR * contactR) {
            const runTimers = window.HC && window.HC.RunTimers;
            const worldActive = runTimers && typeof runTimers.isWorldSlotsActive === "function"
              && runTimers.isWorldSlotsActive(World, nowMs);
            const bouncePct = Number(World.fxIntentBounceAsteroidPct || 0);
            if (worldActive && Number.isFinite(bouncePct) && bouncePct > 0 && Math.random() < bouncePct) {
              bounceMeteorFromBody(m, a, a.r);
              continue;
            }

            meteors.splice(mi, 1);
            absorbMeteorIntoAsteroid(a, m);

            window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_THRESHOLD_PROGRESS, {
              sourceType: "asteroid",
              sourceId: a._id || a.id || null,
              thresholdType: "asteroid_to_planet_growth",
              current: a.absorbedMeteorCount,
              target: Number.isFinite(target) ? target : 0,
              thresholdSource: World.__debugThresholdOverrides?.asteroidToPlanet == null ? "default" : "debug_override",
            }, { source: "Asteroids.resolveMeteorAsteroidContacts" });

            if (a.absorbedMeteorCount >= target) {
              window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_THRESHOLD_REACHED, {
                sourceType: "asteroid",
                sourceId: a._id || a.id || null,
                thresholdType: "asteroid_to_planet_growth",
                current: a.absorbedMeteorCount,
                target: Number.isFinite(target) ? target : 0,
                thresholdSource: World.__debugThresholdOverrides?.asteroidToPlanet == null ? "default" : "debug_override",
              }, { source: "Asteroids.resolveMeteorAsteroidContacts", snapshot: true });
              startAsteroidCollapse(a);
            }
            break;
          }
        }
      }
    }

  function startAsteroidCollapse(a) {
      if (a.__transformationInProgress) return;
      a.__transformationInProgress = true;
      a.isCollapsing = true;
      a.collapseT = 0;
      a.captureCooldown = 0.25;
      window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_TRANSFORMATION_STARTED, {
        sourceType: "asteroid",
        sourceId: a._id || a.id || null,
        targetType: "planet",
      }, { source: "Asteroids.startAsteroidCollapse", snapshot: true });
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
      const sumM = (typeof a.liveSumMass === 'number') ? a.liveSumMass : a.growthSumMass;

      const planetMass = sumM + massFromR(a.r);
      const r0 = Math.max(a.r * 1.35, Math.sqrt(Math.max(planetMass, 1)) * 0.75);

      const orbitMul = (typeof World.metaOrbitMulPlanet === "number") ? World.metaOrbitMulPlanet : 1;
      const currentOrbit = 0;
      const p = {
        type: "planet",
        x: a.x,
        y: a.y,
        vx: a.vx,
        vy: a.vy,
        r: r0,
        orbitPx: currentOrbit,
        orbitNativeRadius: 0,
        orbitCurrentRadius: currentOrbit,
        gravityR: 0,
        hueA,
        hueB,
        mass: planetMass,
        planetKind: (a.cometHits && a.cometHits > 0) ? "rocky" : "gas",
        cometHits: a.cometHits || 0,
        rockyLocked: false,
        lockRadius: true,
        fixedR: r0,

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

      if (typeof finalizePlanetSpawn === "function") {
        finalizePlanetSpawn(a, p, { kind: "gas" });
      }
      if (!p.lockRadius) {
        p.lockRadius = true;
      }
      if (!Number.isFinite(p.fixedR)) {
        p.fixedR = p.r;
      }
      const baseOrbit = Math.max(p.r * 1.20, p.r + 2.8 * Rm);
      const orbit0 = clamp(baseOrbit, baseOrbit, 420.0 * Rm);
      const currentOrbitFinal = orbit0 * orbitMul;
      p.orbitNativeRadius = orbit0;
      p.orbitCurrentRadius = currentOrbitFinal;
      p.orbitPx = currentOrbitFinal;
      const baseGravity = computeGravityFromPlanetRadius(p.r);
      p.gravityR = Math.max(baseGravity, p.orbitCurrentRadius || 0);

      World.planets.push(p);
      window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_CLEANUP_STARTED, {
        sourceType: "asteroid",
        sourceId: a._id || a.id || null,
        targetType: "planet",
        targetId: p._id || p.id || null,
      }, { source: "Asteroids.finishCollapseToPlanet" });
      window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_OBJECT_TRANSFORMED, {
        fromType: "asteroid",
        toType: "planet",
        asteroidId: a._id || null,
      }, { snapshot: true, source: "Asteroids.finishCollapseToPlanet" });
      window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_TRANSFORMATION_COMPLETED, {
        sourceType: "asteroid",
        sourceId: a._id || a.id || null,
        targetType: "planet",
        targetId: p._id || p.id || null,
      }, { source: "Asteroids.finishCollapseToPlanet", snapshot: true });

      a.orbiters = [];
      window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_CLEANUP_COMPLETED, {
        sourceType: "asteroid",
        sourceId: a._id || a.id || null,
        removed: true,
      }, { source: "Asteroids.finishCollapseToPlanet" });
      Events.emit("PLANET_CREATED", { hueA, hueB, top1, top2 });
    }

    function updateAsteroidCollapse(a, dt) {
      a.collapseT += dt;
      const t = clamp(a.collapseT / a.collapseDuration, 0, 1);
      const ease = t * t * (3 - 2 * t);

      a.collapseVisualScale = 1 + 0.08 * Math.sin(ease * Math.PI);

      if (t >= 1) {
        finishCollapseToPlanet(a);
        a._dead = true;
      }
    }

    function updateAsteroids(dt) {
      const bounceLoss = 0.90;
      const b = getWorldViewBounds();

      for (const a of World.asteroids) {
        if (a.absorbingIntoStarId) continue;
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

        if (a.isCollapsing) updateAsteroidCollapse(a, dt);
      }

      for (let i = World.asteroids.length - 1; i >= 0; i--) {
        if (World.asteroids[i]._dead) World.asteroids.splice(i, 1);
      }
    }

    window.spawnAsteroidFromCollision = spawnAsteroidFromCollision;

    window.HC.Asteroids = {
      update(dt, now) {
        updateAsteroids(dt);
      },
      capture(dt, now) {
        captureMeteorsByAsteroids(dt, now);
      }
    };

    return window.HC.Asteroids;
  };
})();
