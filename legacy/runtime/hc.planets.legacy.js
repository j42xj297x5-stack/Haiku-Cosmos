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
    const getMeteorCollisionRadius = window.getMeteorCollisionRadius || ((m) => Number(m && m.r) || meteorBaseRadius());
    const massFromR = window.massFromR;
    const computeGravityFromPlanetRadius = window.computeGravityFromPlanetRadius;
    const computeOmega = window.computeOmega;
    const getWorldViewBounds = window.getWorldViewBounds;
    const hueFromName = window.hueFromName;
    const makeRng = window.makeRng;
    const hash32 = window.hash32;
    const reconcileStarOwnershipOnBirth = window.reconcileStarOwnershipOnBirth;
    const startStarEpochZoomOut = window.startStarEpochZoomOut;
    const transformAsteroidIntoRockyPlanet = window.transformAsteroidIntoRockyPlanet;
    const View = (window.HC.getView && window.HC.getView()) || window.View;

    function legacyDisabled(message) {
      throw new Error(message || "Legacy star/gas/capture system disabled");
    }

    function isValidCanonicalRockyPlanet(p) {
      if (!p || !(p.type === "planet" || p.kind === "planet")) return false;
      if (!(p.planetKind === "rocky" || p.isRocky === true)) return false;
      if (p.debugSpawn === true && p.sourcePath === "debug_bootstrap") return true;
      return p.sourcePath === "moon_to_rocky_planet"
        && p.allowedProgressionPath === true
        && p.validProgressionOrigin === true
        && !!p.sourceMoonId;
    }

    function assertCanonicalPlanetRuntime(p) {
      if (!p || p._dead) return;
      if (p.planetKind === "gas" || p.isGas === true) legacyDisabled("Legacy star/gas/capture system disabled");
      if (p.preStar || p.starKind) legacyDisabled("Legacy star/gas/capture system disabled");
      if (Array.isArray(p.orbiters) && p.orbiters.length > 0) legacyDisabled("LEGACY_CAPTURE_ORBIT_DISABLED");
      if (p.parentKind || p.parentRef || p.captureCooldown > 0) legacyDisabled("LEGACY_CAPTURE_ORBIT_DISABLED");
      if ((p.planetKind === "rocky" || p.isRocky === true) && !isValidCanonicalRockyPlanet(p)) {
        p.invalidPlanetOrigin = true;
        legacyDisabled("LEGACY_ASTEROID_TO_PLANET_DISABLED");
      }
      if (window.HC?.SpaceBodies?.refreshBodyRadiusFromMass && Number(p.mass) > 0) {
        window.HC.SpaceBodies.refreshBodyRadiusFromMass(p, { kind: "planet", sourceFunction: "Planets.assertCanonicalPlanetRuntime" });
      }
    }

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
      window.HC?.WorldVisualAssets?.assignPlanetVisual?.(planet);
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
      if (p.__starTransformationInProgress) {
        window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_TRANSFORMATION_BLOCKED, {
          sourceType: "planet",
          sourceId: p.id || p._id || null,
          reason: "transformation_in_progress",
        }, { source: "Planets.transformGasPlanetIntoStar", severity: "warn" });
        return;
      }
      p.__starTransformationInProgress = true;
      window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_TRANSFORMATION_STARTED, {
        sourceType: "planet",
        sourceId: p.id || p._id || null,
        targetType: "star",
        thresholdSource: World.__debugThresholdOverrides?.planetToStar == null ? "default" : "debug_override",
      }, { source: "Planets.transformGasPlanetIntoStar", snapshot: true });
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
      window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_CLEANUP_STARTED, {
        sourceType: "planet",
        sourceId: p.id || p._id || null,
        targetType: "star",
        targetId: star.id || star._id || null,
      }, { source: "Planets.transformGasPlanetIntoStar" });
      window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_OBJECT_TRANSFORMED, {
        fromType: "planet",
        toType: "star",
        planetId: p.id || p._id || null,
        starKind: kind || null,
      }, { snapshot: true, source: "Planets.transformGasPlanetIntoStar" });
      window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_TRANSFORMATION_COMPLETED, {
        sourceType: "planet",
        sourceId: p.id || p._id || null,
        targetType: "star",
        targetId: star.id || star._id || null,
        starKind: kind || null,
      }, { source: "Planets.transformGasPlanetIntoStar", snapshot: true });
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

    function compactPlanetImpact(impact, fragments, source) {
      const masses = impact?.masses || {};
      return {
        kind: impact?.kind || "planetImpact",
        mode: "direct",
        source: source || null,
        createsDust: impact?.createsDust === true,
        createsOrbiter: impact?.createsOrbiter === true,
        absorbedMass: Number(masses.absorbed) || 0,
        splitMass: {
          absorbed: Number(masses.absorbed) || 0,
          explosion: Number(masses.explosion) || 0,
          ejecta: Number(masses.ejecta) || 0,
          orbiter: Number(masses.orbiter) || 0,
        },
        orbiterMass: Number(masses.orbiter) || 0,
        createdFragments: Array.isArray(fragments) ? fragments.length : 0,
        reason: "direct_contact",
      };
    }

    function applyPlanetImpactToPlanet(p, body, impact, nowMs, source) {
      const absorbedMass = Number(impact?.masses?.absorbed) || 0;
      if (absorbedMass > 0) p.mass = (Number(p.mass) || massFromR(Number(p.r) || 1)) + absorbedMass;
      const fragments = window.HC?.Impact?.spawnEjecta
        ? window.HC.Impact.spawnEjecta(World, impact, p, { nowMs })
        : [];
      p.lastImpact = compactPlanetImpact(impact, fragments, source);
      World.planetImpactCount = (World.planetImpactCount || 0) + 1;
      World.lastPlanetImpact = p.lastImpact;
      if (window.HC?.Impact?.logImpactEvidence) window.HC.Impact.logImpactEvidence(World, impact, "Planets.directPlanetImpact");
      const baseGravity = computeGravityFromPlanetRadius(p.r);
      p.gravityR = Math.max((p.gravityR || 0), baseGravity, p.orbitCurrentRadius || p.orbitPx || 0);
      body._dead = true;
      body.absorbed = true;
      body.absorbedBy = "planet";
      body.absorbedById = p.id || p._id || null;
      return p.lastImpact;
    }

    function resolveDirectPlanetImpact(p, body, nowMs, source) {
      if (!p || !body || body._dead) return false;
      if (!window.HC?.Impact?.resolvePlanetImpact) return false;
      const isImpact = window.HC?.SpaceBodies?.isDirectImpact || ((a, b) => {
        const dx = (Number(b.x) || 0) - (Number(a.x) || 0);
        const dy = (Number(b.y) || 0) - (Number(a.y) || 0);
        const r = (Number(a.r) || 1) + (Number(b.r) || 1);
        return dx * dx + dy * dy <= r * r;
      });
      if (!isImpact(p, body)) return false;
      if (window.HC?.CosmicDust?.applySplitPolicy) {
        const bodyKind = body.kind || body.type || source;
        const cosmicKind = bodyKind === "asteroid" ? "planet_asteroid" : (bodyKind === "moon" ? "planet_moon" : "planet_meteor");
        const split = window.HC.CosmicDust.applySplitPolicy(World, { kind: cosmicKind, planet: p, [bodyKind === "asteroid" ? "asteroid" : (bodyKind === "moon" ? "moon" : "meteor")]: body, source: "Planets.directPlanetImpact" });
        const fragments = split?.fragments || [];
        p.lastImpact = {
          kind: cosmicKind,
          mode: "direct",
          source: source || null,
          createsDust: true,
          createsOrbiter: false,
          absorbedMass: Number(split?.absorbedMass) || 0,
          splitMass: { absorbed: Number(split?.absorbedMass) || 0, explosion: 0, ejecta: Number(split?.fragmentMass) || 0, orbiter: Number(split?.orbiterCandidate?.mass) || 0, cosmicDust: Number(split?.cosmicDustMass) || 0 },
          orbiterMass: Number(split?.orbiterCandidate?.mass) || 0,
          orbiterCandidate: split?.orbiterCandidate || null,
          createdFragments: Array.isArray(fragments) ? fragments.length : 0,
          reason: "direct_contact",
        };
        World.planetImpactCount = (World.planetImpactCount || 0) + 1;
        World.lastPlanetImpact = p.lastImpact;
      } else {
        const impact = window.HC.Impact.resolvePlanetImpact({
          planet: p,
          incoming: body,
          mechanics: World.spaceMechanics,
          existingOrbiters: Array.isArray(p.orbiters) ? p.orbiters.length : 0,
        });
        applyPlanetImpactToPlanet(p, body, impact, nowMs, source);
      }
      p.captureCooldown = Math.max(p.captureCooldown || 0, source === "asteroid" ? 0.06 : 0.04);
      return true;
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
          const meteorCollisionR = getMeteorCollisionRadius(m);
          const collideR = p.r + meteorCollisionR;

          if (d2 <= collideR * collideR && resolveDirectPlanetImpact(p, m, nowMs, "meteor")) {
            meteors.splice(mi, 1);
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
        // Transitional stale-state guard: live runtime no longer assigns parentKind="planet".
        if (a.parentKind === "planet") continue;

        for (let pi = 0; pi < World.planets.length; pi++) {
          const p = World.planets[pi];
          if (p.captureCooldown > 0) continue;

          const dx = a.x - p.x;
          const dy = a.y - p.y;
          const d2 = dx*dx + dy*dy;
          const collideR = p.r + a.r;

          if (d2 <= collideR * collideR && resolveDirectPlanetImpact(p, a, nowMs, "asteroid")) {
            World.asteroids.splice(ai, 1);
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
        if (!p.stationary && p.source !== "moon_mass_threshold") {
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          p.vx *= (1 - 0.01 * dt);
          p.vy *= (1 - 0.01 * dt);

          if (p.x - p.r < b.l) { p.x = b.l + p.r; p.vx = Math.abs(p.vx) * bounceLoss; }
          if (p.x + p.r > b.r) { p.x = b.r - p.r; p.vx = -Math.abs(p.vx) * bounceLoss; }
          if (p.y - p.r < b.t) { p.y = b.t + p.r; p.vy = Math.abs(p.vy) * bounceLoss; }
          if (p.y + p.r > b.b) { p.y = b.b - p.r; p.vy = -Math.abs(p.vy) * bounceLoss; }
        } else {
          p.vx = 0;
          p.vy = 0;
        }

        // Compatibility/deprecated: animate planet.orbiters only for stale/debug states; live C2 planet impact does not create them.
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
          if (World.spaceMechanics?.planetToStarEnabled !== true) {
            if (p.preStar) p.preStar.active = false;
            World.planetToStarEnabled = false;
          } else if (p.preStar && p.preStar.active) {
            p.preStar.t += dt;
            p.preStar.timeAbs = (p.preStar.timeAbs || 0) + dt;
            if (p.preStar.t >= p.preStar.duration) {
              transformGasPlanetIntoStar(p, p.preStar.info, p.preStar.kind);
              window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_CLEANUP_COMPLETED, {
                sourceType: "planet",
                sourceId: p.id || p._id || null,
                removed: true,
              }, { source: "Planets.updatePlanets", snapshot: true });
              World.planets.splice(pi, 1);
              pi -= 1;
              continue;
            }
          } else {
            const meteors = getSystemMeteorsForPlanet(p);
            const info = analyzeSystemMeteors(meteors);
            const dominantKey = info?.dominantKey || null;
            const dominantCount = dominantKey ? Number(info?.counts?.[dominantKey] || 0) : 0;
            const thresholdTarget = dominantKey ? Number(getStarThresholdForColor(dominantKey) || 0) : 0;
            window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_THRESHOLD_PROGRESS, {
              sourceType: "planet",
              sourceId: p.id || p._id || null,
              thresholdType: "planet_to_star",
              dominantKey,
              current: dominantCount,
              target: thresholdTarget,
              thresholdSource: World.__debugThresholdOverrides?.planetToStar == null ? "default" : "debug_override",
            }, { source: "Planets.updatePlanets" });
            if (qualifiesForPreStar(info)) {
              window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_THRESHOLD_REACHED, {
                sourceType: "planet",
                sourceId: p.id || p._id || null,
                thresholdType: "planet_to_star",
                dominantKey,
                current: dominantCount,
                target: thresholdTarget,
                thresholdSource: World.__debugThresholdOverrides?.planetToStar == null ? "default" : "debug_override",
              }, { source: "Planets.updatePlanets", snapshot: true });
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
            } else if (dominantKey) {
              window.HC?.logEvent?.("world", window.HC.DebugEventTypes.WORLD_TRANSFORMATION_BLOCKED, {
                sourceType: "planet",
                sourceId: p.id || p._id || null,
                reason: "threshold_not_met",
                dominantKey,
                current: dominantCount,
                target: thresholdTarget,
              }, { source: "Planets.updatePlanets" });
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

    window.buildColorWeightsFromOrbiters = function legacyBuildColorWeightsFromOrbiters() { legacyDisabled("LEGACY_CAPTURE_ORBIT_DISABLED"); };
    window.buildBlobPatchwork = buildBlobPatchwork;
    window.computeRockyParamsFromOrbiters = function legacyComputeRockyParamsFromOrbiters() { legacyDisabled("LEGACY_CAPTURE_ORBIT_DISABLED"); };
    window.addPlanetRingMark = function legacyAddPlanetRingMark() { legacyDisabled("LEGACY_CAPTURE_ORBIT_DISABLED"); };
    window.finalizePlanetSpawn = function legacyFinalizePlanetSpawn() { legacyDisabled("LEGACY_ASTEROID_TO_PLANET_DISABLED"); };
    window.transformGasPlanetIntoStar = function legacyTransformGasPlanetIntoStar() { legacyDisabled("Legacy star/gas/capture system disabled"); };

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
      capture() {
        legacyDisabled("LEGACY_CAPTURE_ORBIT_DISABLED");
      },
      update() {
        if (!Array.isArray(World.planets)) return;
        for (const p of World.planets) assertCanonicalPlanetRuntime(p);
      },
      transformAsteroidIntoRockyPlanet() {
        legacyDisabled("LEGACY_ASTEROID_TO_PLANET_DISABLED");
      },
      transformGasPlanetIntoStar() {
        legacyDisabled("Legacy star/gas/capture system disabled");
      },
      assertCanonicalPlanetRuntime,
    };

  };
})();
