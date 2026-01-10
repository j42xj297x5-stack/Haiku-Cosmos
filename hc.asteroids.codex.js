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
      const baseOrbitPx = Math.max(r * 1.10, r + 2.2 * Rm);
      const orbitMul = (typeof World.metaOrbitMulAsteroid === "number") ? World.metaOrbitMulAsteroid : 1;
      const orbitPx = baseOrbitPx * orbitMul;

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
        orbitNativeRadius: baseOrbitPx,
        orbitCurrentRadius: orbitPx,
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

    function addOrbiterToAsteroid(a, meteor) {
      const Rm = meteorBaseRadius();
      const orbR = meteor.r;

      const idx = a.orbiters.length;
      const minOrbit = a.r + a.orbiterMinGapPx + orbR;

      const step = a.orbiterGapStepPx + orbR * 0.8;
      const candidate = minOrbit + idx * step;

      const maxOrbit = Math.max(minOrbit, a.orbitPx - orbR);
      const baseOrbitRadius = clamp(candidate, minOrbit, maxOrbit);
      const orbitR = baseOrbitRadius * ((typeof World.metaOrbitMulAsteroid === "number") ? World.metaOrbitMulAsteroid : 1);

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
        if (World.pack01ReleaseBlockColor
          && nowMs < (World.pack01ReleaseBlockUntilMs || 0)
          && m.colorName === World.pack01ReleaseBlockColor) {
          continue;
        }

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
            const Rm2 = meteorBaseRadius();
            const baseOrbit = Math.max(a.r * 1.10, a.r + 2.2 * Rm2);
            const nextOrbit = clamp(baseOrbit, a.minOrbitPx, a.maxOrbitPx);
            setAsteroidOrbitRadius(a, nextOrbit);

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

      const baseOrbit = Math.max(r0 * 1.20, r0 + 2.8 * Rm);
      const orbit0 = clamp(baseOrbit, baseOrbit, 420.0 * Rm);

      const planetMass = sumM + massFromR(a.r);

      const orbitMul = (typeof World.metaOrbitMulPlanet === "number") ? World.metaOrbitMulPlanet : 1;
      const currentOrbit = orbit0 * orbitMul;
      const p = {
        type: "planet",
        x: a.x,
        y: a.y,
        vx: a.vx,
        vy: a.vy,
        r: r0,
        orbitPx: currentOrbit,
        orbitNativeRadius: orbit0,
        orbitCurrentRadius: currentOrbit,
        gravityR: computeGravityFromPlanetRadius(r0),
        hueA,
        hueB,
        mass: planetMass,
        planetKind: (a.cometHits && a.cometHits > 0) ? "rocky" : "gas",
        cometHits: a.cometHits || 0,
        rockyLocked: false,

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

      const collapseOrbit = a.orbitPx + (Math.max(a.r * 1.2, a.orbitPx * 0.75) - a.orbitPx) * (0.05 + 0.25 * ease);
      setAsteroidOrbitRadius(a, collapseOrbit);

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
