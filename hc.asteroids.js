// HC asteroids subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  const ASTEROID_VISUAL_VARIANTS = Object.freeze([
    "asteroid_01",
    "asteroid_02",
    "asteroid_03",
    "asteroid_04",
    "asteroid_05",
    "asteroid_06",
    "asteroid_07",
    "asteroid_08",
    "asteroid_09",
    "asteroid_10",
  ]);
  const ASTEROID_ASSET_IDS = Object.freeze(Object.fromEntries(
    ASTEROID_VISUAL_VARIANTS.map((variant) => [variant, `${variant}.glb`])
  ));
  const PLANET_BASE_VISUAL_VARIANT = "planet_01";
  const PLANET_BASE_ASSET_ID = "planet_01.glb";
  const ROCKY_PLANET_VISUAL_VARIANTS = Object.freeze([
    "rocky_planet_01",
    "rocky_planet_02",
    "rocky_planet_03",
    "rocky_planet_04",
  ]);
  const ROCKY_PLANET_ASSET_IDS = Object.freeze({
    rocky_planet_01: "rocky_planet_01.glb",
    rocky_planet_02: "rocky_planet_02.glb",
    rocky_planet_03: "rocky_planet_03.glb",
    rocky_planet_04: "rocky_planet_04.glb",
  });
  const PLANET_VISUAL_ROTATION_TWO_PI = Math.PI * 2;
  const MOON_VISUAL_VARIANTS = Object.freeze([
    "moon_01",
    "moon_02",
    "moon_03",
    "moon_04",
    "moon_05",
    "moon_06",
  ]);
  const MOON_ASSET_IDS = Object.freeze(Object.fromEntries(
    MOON_VISUAL_VARIANTS.map((variant) => [variant, `${variant}.glb`])
  ));
  const MOON_ASSET_ID = MOON_ASSET_IDS.moon_01;

  function planetRotationUnit(seed, offset) {
    const value = Math.sin((seed + offset) * 43758.5453123) * 143758.5453;
    return value - Math.floor(value);
  }

  function planetRotationSpeed(seed, offset, min, max) {
    const unit = planetRotationUnit(seed, offset);
    const magnitude = min + ((max - min) * unit);
    const direction = planetRotationUnit(seed, offset + 0.5) < 0.5 ? -1 : 1;
    return magnitude * direction;
  }

  function pickVisualVariant(variants, assetIds, body, randomValue) {
    const requested = String(body?.glbId || body?.modelId || body?.visualVariant || body?.assetId || body?.asset || "").replace(/\.glb$/i, "");
    if (assetIds[requested]) return requested;
    const roll = Number.isFinite(randomValue) ? randomValue : Math.random();
    const index = Math.max(0, Math.min(variants.length - 1, Math.floor(roll * variants.length)));
    return variants[index];
  }

  function applyRenderOnlyModelMetadata(body, visualKind, visualVariant, assetId) {
    body.visualKind = visualKind;
    body.visualVariant = visualVariant;
    body.modelId = visualVariant;
    body.glbId = visualVariant;
    body.assetId = assetId;
    body.asset = assetId;
    return body;
  }

  function assignAsteroidVisual(body, randomValue) {
    if (!body || typeof body !== "object") return body;
    const visualVariant = pickVisualVariant(ASTEROID_VISUAL_VARIANTS, ASTEROID_ASSET_IDS, body, randomValue);
    return applyRenderOnlyModelMetadata(body, "asteroid", visualVariant, ASTEROID_ASSET_IDS[visualVariant]);
  }

  function assignMoonVisual(body, randomValue) {
    if (!body || typeof body !== "object") return body;
    const visualVariant = pickVisualVariant(MOON_VISUAL_VARIANTS, MOON_ASSET_IDS, body, randomValue);
    return applyRenderOnlyModelMetadata(body, "moon", visualVariant, MOON_ASSET_IDS[visualVariant]);
  }

  function isRockyPlanet(body) {
    return body?.planetKind === "rocky" || body?.isRocky === true;
  }

  function normalizeRockyPlanetVariant(value) {
    const variant = String(value || "").replace(/\.glb$/i, "");
    return ROCKY_PLANET_ASSET_IDS[variant] ? variant : null;
  }

  function stableUnitFromString(value) {
    const text = String(value || "");
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return ((hash >>> 0) % 1000000) / 1000000;
  }

  function assignPlanetVisual(body, randomValue) {
    if (!body || typeof body !== "object") return body;
    const roll = Number.isFinite(randomValue) ? randomValue : (body.sourceMoonId ? stableUnitFromString(body.sourceMoonId) : Math.random());
    const rockyVariant = normalizeRockyPlanetVariant(body.visualVariant || body.assetId);
    const shouldUseRockyPool = isRockyPlanet(body);
    const visualVariant = shouldUseRockyPool
      ? (rockyVariant || ROCKY_PLANET_VISUAL_VARIANTS[Math.max(0, Math.min(ROCKY_PLANET_VISUAL_VARIANTS.length - 1, Math.floor(roll * ROCKY_PLANET_VISUAL_VARIANTS.length)))])
      : PLANET_BASE_VISUAL_VARIANT;

    body.visualKind = "planet";
    body.visualVariant = visualVariant;
    body.assetId = shouldUseRockyPool ? ROCKY_PLANET_ASSET_IDS[visualVariant] : PLANET_BASE_ASSET_ID;

    const existingSeed = Number(body.visualRotationSeed);
    const seed = Number.isFinite(existingSeed)
      ? existingSeed
      : (Number.isFinite(randomValue) ? randomValue : Math.random());
    body.visualRotationSeed = seed;
    if (!Number.isFinite(body.visualRotationX)) body.visualRotationX = planetRotationUnit(seed, 1) * PLANET_VISUAL_ROTATION_TWO_PI;
    if (!Number.isFinite(body.visualRotationY)) body.visualRotationY = planetRotationUnit(seed, 2) * PLANET_VISUAL_ROTATION_TWO_PI;
    if (!Number.isFinite(body.visualRotationZ)) body.visualRotationZ = planetRotationUnit(seed, 3) * PLANET_VISUAL_ROTATION_TWO_PI;
    if (!Number.isFinite(body.visualRotationSpeedX)) body.visualRotationSpeedX = planetRotationSpeed(seed, 4, 0.005, 0.03);
    if (!Number.isFinite(body.visualRotationSpeedY)) body.visualRotationSpeedY = planetRotationSpeed(seed, 5, 0.03, 0.12);
    if (!Number.isFinite(body.visualRotationSpeedZ)) body.visualRotationSpeedZ = planetRotationSpeed(seed, 6, 0.005, 0.03);
    return body;
  }

  window.HC.WorldVisualAssets = Object.freeze({
    asteroidVariants: ASTEROID_VISUAL_VARIANTS,
    asteroidAssetIds: ASTEROID_ASSET_IDS,
    planetVariant: PLANET_BASE_VISUAL_VARIANT,
    planetAssetId: PLANET_BASE_ASSET_ID,
    rockyPlanetVariants: ROCKY_PLANET_VISUAL_VARIANTS,
    rockyPlanetAssetIds: ROCKY_PLANET_ASSET_IDS,
    moonVariants: MOON_VISUAL_VARIANTS,
    moonAssetIds: MOON_ASSET_IDS,
    moonAssetId: MOON_ASSET_ID,
    assignAsteroidVisual,
    assignMoonVisual,
    assignPlanetVisual,
  });

  window.HC.initAsteroids = () => {
    const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
    const Events = window.Events;
    const clamp = (window.HC.Util && window.HC.Util.clamp) || window.clamp;
    const rand = window.rand;
    const meteorBaseRadius = window.meteorBaseRadius;
    const getMeteorCollisionRadius = window.getMeteorCollisionRadius || ((m) => Number(m && m.r) || meteorBaseRadius());
    const SpaceBodies = window.HC && window.HC.SpaceBodies;
    const massFromR = SpaceBodies?.massFromRadius || window.massFromR || ((r) => r * r);
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

    function asteroidMassValue(a) {
      if (SpaceBodies?.getBodyMass) return SpaceBodies.getBodyMass(a);
      const mass = Number(a && a.mass);
      return Number.isFinite(mass) && mass > 0 ? mass : 1;
    }

    function asteroidBaseRadius(a, fallbackRadius) {
      const explicitBase = Number(a && (a.baseR ?? a.massOneRadius));
      if (Number.isFinite(explicitBase) && explicitBase > 0) return explicitBase;
      const r = Number(fallbackRadius ?? a?.r);
      const mass = asteroidMassValue(a);
      if (Number.isFinite(r) && r > 0) return r / Math.sqrt(Math.max(1, mass));
      return meteorBaseRadius() * 2.7;
    }

    function asteroidRadiusForMass(mass, baseR, minR, maxR) {
      return SpaceBodies?.radiusFromMass
        ? SpaceBodies.radiusFromMass("asteroid", mass, { baseRadius: baseR, minRadius: minR || 0.9 * meteorBaseRadius(), maxRadius: maxR || 80.0 * meteorBaseRadius() })
        : clamp((Number.isFinite(baseR) && baseR > 0 ? baseR : meteorBaseRadius() * 2.7) * Math.sqrt(Number.isFinite(mass) && mass > 0 ? mass : 1), Number.isFinite(minR) && minR > 0 ? minR : 0.9 * meteorBaseRadius(), Number.isFinite(maxR) && maxR > 0 ? maxR : 80.0 * meteorBaseRadius());
    }

    function refreshRadius(body, kind, sourceFunction) {
      if (SpaceBodies?.refreshBodyRadiusFromMass) return SpaceBodies.refreshBodyRadiusFromMass(body, { kind, sourceFunction });
      return body;
    }


    function radiusEvidenceFor(body) {
      const ev = body?.lastRadiusRefresh || {};
      return {
        rawRadiusFromMass: Number(ev.rawRadiusFromMass ?? ev.unclampedRadius) || null,
        finalRadius: Number(ev.finalRadius ?? ev.radius ?? body?.r ?? body?.radius) || null,
        clampApplied: ev.clampApplied === true,
        clampReason: ev.clampReason || null,
      };
    }

    function recordRadiusContinuity(kind, event) {
      const ratio = Number(event?.radiusContinuityRatio);
      if (!Number.isFinite(ratio) || ratio >= 0.75) return;
      const key = kind === "rocky_planet" ? "rockyPlanetRadiusContinuityWarnings" : "moonRadiusContinuityWarnings";
      World[key] = Array.isArray(World[key]) ? World[key] : [];
      World[key].push(Object.assign({ type: `${kind}_radius_continuity_warning`, threshold: 0.75 }, event));
      if (World[key].length > 8) World[key].shift();
    }

    function attachSourceEvidence(target, sourcePath, sourceRuleId, sourceFunction, bodies, before, after) {
      if (!target) return target;
      const objectType = target.planetKind === "rocky" ? "rocky_planet" : (target.kind || target.type || "object");
      target.sourcePath = sourcePath;
      target.sourceRuleId = sourceRuleId || sourcePath;
      target.sourceFunction = sourceFunction;
      target.sourceBodyIds = (bodies || []).map((body) => body?.id || body?._id).filter(Boolean);
      target.sourceMassBefore = before;
      target.sourceMassAfter = after;
      target.createdObjectType = objectType;
      target.createdObjectId = target.id || target._id || null;
      target.allowedProgressionPath = sourcePath === "asteroid_to_moon" || sourcePath === "moon_to_rocky_planet";
      target.blockedLegacyPath = false;
      return target;
    }

    function addColorCount(map, colorName, amount = 1) {
      if (!map || !colorName) return;
      map[colorName] = (map[colorName] || 0) + amount;
    }

    function mergeColorCounts(target, source) {
      if (!target || !source) return target;
      for (const [colorName, count] of Object.entries(source)) {
        addColorCount(target, colorName, Number(count) || 0);
      }
      return target;
    }

    function isAsteroidToMoonEnabled() {
      return World.spaceMechanics?.asteroidToMoonEnabled !== false;
    }

    function asteroidToMoonMassThreshold() {
      const target = Number(World.spaceMechanics?.asteroidToMoonMassThreshold ?? 10);
      return Number.isFinite(target) && target > 0 ? target : 10;
    }

    function checkAsteroidMoonThreshold(a, source) {
      if (!isAsteroidToMoonEnabled()) return;
      const target = asteroidToMoonMassThreshold();
      const currentMass = asteroidMassValue(a);
      const progressEvent = {
        sourceType: "asteroid",
        sourceId: a._id || a.id || null,
        thresholdType: "asteroid_to_moon_mass",
        current: currentMass,
        target: Number.isFinite(target) ? target : 0,
        thresholdSource: "spaceMechanics",
        sourceMass: currentMass,
        sourceRadius: Number(a.r ?? a.radius) || null,
        overThreshold: currentMass >= target,
        triggeredProgression: currentMass >= target,
        resultingObjectType: currentMass >= target ? "moon" : null,
        resultingObjectId: null,
      };
      World.lastThresholdProgressionEvent = progressEvent;
      if (progressEvent.overThreshold) {
        World.asteroidOverThresholdCount = (Number(World.asteroidOverThresholdCount) || 0) + 1;
        World.asteroidOverThresholdSamples = Array.isArray(World.asteroidOverThresholdSamples) ? World.asteroidOverThresholdSamples : [];
        World.asteroidOverThresholdSamples.push(Object.assign({}, progressEvent));
        if (World.asteroidOverThresholdSamples.length > 8) World.asteroidOverThresholdSamples.shift();
      }
      if (currentMass >= target) {
        window.HC?.logEvent?.("world", (window.HC.DebugEventTypes?.WORLD_THRESHOLD_REACHED || "world.threshold_reached"), {
          sourceType: "asteroid",
          sourceId: a._id || a.id || null,
          thresholdType: "asteroid_to_moon_mass",
          current: currentMass,
          target: Number.isFinite(target) ? target : 0,
          thresholdSource: "spaceMechanics",
        }, { source, snapshot: true });
        const moon = transformAsteroidToMoon(a, source);
        if (moon) progressEvent.resultingObjectId = moon.id || moon._id || null;
        else { progressEvent.triggeredProgression = false; progressEvent.creationFailed = true; progressEvent.failureReason = "moon_creation_failed"; }
      }
      window.HC?.logEvent?.("world", (window.HC.DebugEventTypes?.WORLD_THRESHOLD_PROGRESS || "world.threshold_progress"), progressEvent, { source, snapshot: true });
    }

    function cloneColorCounts(source) {
      const result = { blue: 0, green: 0, red: 0, yellow: 0 };
      if (!source || typeof source !== "object") return result;
      for (const [colorName, count] of Object.entries(source)) {
        result[colorName] = Number(count) || 0;
      }
      return result;
    }

    function createMoonFromAsteroid(a) {
      const mass = asteroidMassValue(a);
      const currentFrame = Number(World.frame) || 0;
      const moon = {
        id: `moon:${a._id || a.id || Date.now()}:${World.moons.length + 1}`,
        type: "moon",
        kind: "moon",
        x: Number(a.x) || 0,
        y: Number(a.y) || 0,
        vx: Number(a.vx) || 0,
        vy: Number(a.vy) || 0,
        r: Number(a.r) || asteroidRadiusForMass(mass, asteroidBaseRadius(a, a.r), a.minR, a.maxR),
        mass,
        colorMix: a.colorMix || null,
        colorCounts: cloneColorCounts(a.liveColorCounts || a.growthColorCounts || a.captureColorCounts),
        source: "asteroid_mass_threshold",
        createdAt: World.nowMs ?? ((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()),
        age: 0,
        progressionMode: "free",
        isOrbitalBody: false,
        canBecomePlanet: true,
        bornAtFrame: currentFrame,
        progressionLockFrame: currentFrame,
        progressionCooldownUntilFrame: currentFrame + 2,
        parentPlanetId: null,
        orbitState: null,
        sourceAsteroidId: a._id || a.id || null,
        visualKind: "moon",
        sourceColors: Array.isArray(a.sourceColors) ? a.sourceColors.slice() : [],
      };
      assignMoonVisual(moon);
      moon.baseR = moon.massOneRadius || moon.baseR || (Number(a.massOneRadius || a.baseR) || (moon.r / Math.sqrt(Math.max(1, mass))));
      moon.massOneRadius = moon.baseR;
      refreshRadius(moon, "moon", "Asteroids.createMoonFromAsteroid");
      attachSourceEvidence(moon, "asteroid_to_moon", "asteroid_to_moon_mass", "Asteroids.transformAsteroidToMoon", [a], asteroidMassValue(a), moonMassValue ? moonMassValue(moon) : moon.mass);
      return moon;
    }

    function transformAsteroidToMoon(a, source) {
      if (!a || a.__transformationInProgress) return null;
      a.__transformationInProgress = true;
      const moon = createMoonFromAsteroid(a);
      World.moons = Array.isArray(World.moons) ? World.moons : [];
      World.moons.push(moon);
      a._dead = true;
      const moonRadiusEvidence = radiusEvidenceFor(moon);
      const sourceAsteroidRadius = Number(a.r ?? a.radius) || null;
      const moonContinuityRatio = sourceAsteroidRadius ? moonRadiusEvidence.finalRadius / sourceAsteroidRadius : null;
      World.lastMoonCreatedEvent = {
        type: "moon_created",
        sourcePath: "asteroid_to_moon",
        sourceFunction: moon.sourceFunction,
        sourceAsteroidId: a._id || a.id || null,
        sourceAsteroidMass: asteroidMassValue(a),
        sourceAsteroidRadius,
        sourceMassBefore: moon.sourceMassBefore,
        sourceMassAfter: moon.sourceMassAfter,
        createdMoonId: moon.id,
        createdMoonMass: moon.mass,
        createdMoonRawRadiusFromMass: moonRadiusEvidence.rawRadiusFromMass,
        createdMoonFinalRadius: moonRadiusEvidence.finalRadius,
        radiusContinuityRatio: moonContinuityRatio,
        clampApplied: moonRadiusEvidence.clampApplied,
        clampReason: moonRadiusEvidence.clampReason,
        createdMoonRadius: moon.r,
        progressionMode: "free",
        canBecomePlanet: true,
        createdObjectType: "moon",
        createdObjectId: moon.id,
        sourceBodyIds: moon.sourceBodyIds,
        allowedProgressionPath: true,
        blockedLegacyPath: false,
        sourceType: "asteroid",
        sourceId: a._id || a.id || null,
        resultingObjectType: "moon",
        resultingObjectId: moon.id,
        mass: moon.mass,
        radius: moon.r,
      };
      recordRadiusContinuity("moon", World.lastMoonCreatedEvent);
      window.HC?.logEvent?.("world", "moon_created", World.lastMoonCreatedEvent, { source: source || "Asteroids.transformAsteroidToMoon", snapshot: true });
      if (World.lastThresholdProgressionEvent?.sourceId === (a._id || a.id || null)) {
        World.lastThresholdProgressionEvent.resultingObjectId = moon.id;
      }
      window.HC?.logEvent?.("world", (window.HC.DebugEventTypes?.WORLD_OBJECT_TRANSFORMED || "world.object_transformed"), {
        fromType: "asteroid",
        toType: "moon",
        asteroidId: a._id || a.id || null,
        moonId: moon.id,
        mass: moon.mass,
        radius: moon.r,
        progressionLockFrame: moon.progressionLockFrame,
        progressionCooldownUntilFrame: moon.progressionCooldownUntilFrame,
      }, { snapshot: true, source: source || "Asteroids.transformAsteroidToMoon" });
      window.HC?.logEvent?.("world", (window.HC.DebugEventTypes?.WORLD_TRANSFORMATION_COMPLETED || "world.transformation_completed"), {
        sourceType: "asteroid",
        sourceId: a._id || a.id || null,
        targetType: "moon",
        targetId: moon.id,
      }, { source: source || "Asteroids.transformAsteroidToMoon", snapshot: true });
      Events.emit("MOON_CREATED", { moon, source: "asteroid_mass_threshold" });
      return moon;
    }

    function spawnAsteroidFromCollision(a, b) {
      const x = (a.x + b.x) * 0.5;
      const y = (a.y + b.y) * 0.5;

      const sides = sidesFromColors(a.colorName, b.colorName);
      const baseR = (a.r + b.r) * 1.35;
      const maForSplit = SpaceBodies?.getBodyMass ? SpaceBodies.getBodyMass(a) : massFromR(a.r);
      const mbForSplit = SpaceBodies?.getBodyMass ? SpaceBodies.getBodyMass(b) : massFromR(b.r);
      const heavierMass = Math.max(maForSplit, mbForSplit);
      const lighterMass = Math.min(maForSplit, mbForSplit);
      const absorbPct = Number.isFinite(Number(World.spaceMechanics?.cosmicDustSplitMeteorMeteorAbsorbPct)) ? Number(World.spaceMechanics.cosmicDustSplitMeteorMeteorAbsorbPct) : 0.20;
      const initialMass = heavierMass + Math.max(0, Math.min(1, absorbPct)) * lighterMass;
      const r = SpaceBodies?.radiusFromMass ? SpaceBodies.radiusFromMass("asteroid", initialMass, { baseRadius: baseR, minRadius: 0.9 * meteorBaseRadius(), maxRadius: 80.0 * meteorBaseRadius() }) : asteroidRadiusForMass(initialMass, baseR, 0.9 * meteorBaseRadius(), 80.0 * meteorBaseRadius());
      const spin = rand(0.08, 0.25) * (Math.random() < 0.5 ? -1 : 1);
      const light = rand(42, 62);

      const Rm = meteorBaseRadius();

      // Drift from conservation of momentum (mass ~ r^2), then scaled by World.asteroidDriftMul
      const ma = maForSplit;
      const mb = mbForSplit;
      const msum = ma + mb;

      let vx = (a.vx * ma + b.vx * mb) / (msum || 1);
      let vy = (a.vy * ma + b.vy * mb) / (msum || 1);

      vx *= World.asteroidDriftMul;
      vy *= World.asteroidDriftMul;

      const asteroid = assignAsteroidVisual({
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
        baseR,
        massOneRadius: baseR,

        // Legacy arrays/counters kept for older comet/debug code; new asteroids do not fill orbiters.
        orbiters: [],
        orbiterMinGapPx: 0,
        orbiterGapStepPx: 0,
        captureCooldown: 0,

        absorbedMeteorCount: 0,
        growthLevel: initialMass,
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
        sourceColors: Array.from(new Set([a.colorName, b.colorName].filter(Boolean))),
        cometHits: 0,

        isCollapsing: false,
        collapseT: 0,
        collapseDuration: 0.9,
      });

      addColorCount(asteroid.growthColorCounts, a.colorName);
      addColorCount(asteroid.growthColorCounts, b.colorName);
      addColorCount(asteroid.liveColorCounts, a.colorName);
      addColorCount(asteroid.liveColorCounts, b.colorName);
      addColorCount(asteroid.captureColorCounts, a.colorName);
      addColorCount(asteroid.captureColorCounts, b.colorName);

      World.asteroids.push(asteroid);
      Events.emit("ASTEROID_CREATED", { sides, from: [a.colorName, b.colorName], mass: asteroid.mass });
    }


    function liveCollisionNowMs() {
      return Number(World.nowMs ?? ((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()));
    }

    function liveCollisionFrame() {
      return Number(World.frame ?? World.frameCount ?? World.tick ?? 0) || 0;
    }

    function liveCollisionBodyId(body) {
      return body?.id || body?._id || body?.uid || null;
    }

    function liveCollisionMass(body) {
      return SpaceBodies?.getBodyMass ? SpaceBodies.getBodyMass(body) : (Number(body?.mass) || 0);
    }

    function liveCollisionRadius(body) {
      return Number(body?.r ?? body?.radius) || 0;
    }

    function liveCollisionCollisionRadius(body) {
      return SpaceBodies?.getCollisionRadius ? SpaceBodies.getCollisionRadius(body) : (Number(body?.collisionRadius ?? body?.physicalRadius ?? body?.r ?? body?.radius) || 0);
    }

    function liveCollisionViewRadius(body) {
      return Number(body?.viewRadius ?? body?.visualRadius ?? body?.r ?? body?.radius) || 0;
    }

    function captureLiveCollisionTargetState(target) {
      return {
        mass: liveCollisionMass(target),
        radius: liveCollisionRadius(target),
        collisionRadius: liveCollisionCollisionRadius(target),
        viewRadius: liveCollisionViewRadius(target),
      };
    }

    function recordLiveCollisionProbe(kind, bodyA, bodyB, target, beforeTarget, evidence, options = {}) {
      const afterTarget = captureLiveCollisionTargetState(target);
      const probe = {
        ruleId: evidence?.ruleId || (kind === "meteor_asteroid" ? "meteor_asteroid" : "asteroid_asteroid"),
        sourceFunction: options.sourceFunction || "Asteroids.unknown",
        frame: liveCollisionFrame(),
        timeMs: liveCollisionNowMs(),
        sessionTimeMs: liveCollisionNowMs(),
        bodyAType: bodyA?.type || bodyA?.kind || null,
        bodyBType: bodyB?.type || bodyB?.kind || null,
        bodyAKind: bodyA?.kind || bodyA?.type || null,
        bodyBKind: bodyB?.kind || bodyB?.type || null,
        bodyAId: liveCollisionBodyId(bodyA),
        bodyBId: liveCollisionBodyId(bodyB),
        bodyAMassBefore: Number(options.bodyAMassBefore ?? liveCollisionMass(bodyA)) || 0,
        bodyBMassBefore: Number(options.bodyBMassBefore ?? liveCollisionMass(bodyB)) || 0,
        targetId: liveCollisionBodyId(target),
        targetKind: target?.kind || target?.type || kind || null,
        targetMassBefore: beforeTarget.mass,
        targetMassAfter: afterTarget.mass,
        targetRadiusBefore: beforeTarget.radius,
        targetRadiusAfter: afterTarget.radius,
        targetCollisionRadiusBefore: beforeTarget.collisionRadius,
        targetCollisionRadiusAfter: afterTarget.collisionRadius,
        targetViewRadiusBefore: beforeTarget.viewRadius,
        targetViewRadiusAfter: afterTarget.viewRadius,
        dustMass: Number(evidence?.dustMass ?? evidence?.cosmicDustMass) || 0,
        absorbMass: Number(evidence?.absorbMass ?? evidence?.absorbedMass) || 0,
        fragmentsMass: Number(evidence?.fragmentsMass ?? evidence?.fragmentMass) || 0,
        orbiterMass: Number(evidence?.orbiterMass ?? evidence?.orbiterCandidate?.mass) || 0,
        conservationDelta: Number(evidence?.conservationDelta ?? evidence?.delta) || 0,
        rawRadiusFromMass: Number(target?.lastRadiusRefresh?.rawRadiusFromMass ?? target?.lastRadiusRefresh?.unclampedRadius) || null,
        unclampedRadius: Number(target?.lastRadiusRefresh?.unclampedRadius ?? target?.lastRadiusRefresh?.rawRadiusFromMass) || null,
        finalRadius: Number(target?.lastRadiusRefresh?.finalRadius ?? target?.lastRadiusRefresh?.radius) || null,
        minClampApplied: target?.lastRadiusRefresh?.minClampApplied === true,
        maxClampApplied: target?.lastRadiusRefresh?.maxClampApplied === true,
        clampApplied: target?.lastRadiusRefresh?.clampApplied === true,
        clampReason: target?.lastRadiusRefresh?.clampReason || null,
        usedCollisionRules: options.usedCollisionRules === true,
        usedMassRadiusContract: Boolean(SpaceBodies?.massRadiusContract || target?.massRadiusContractVersion),
      };
      if (options.bypassedSplitPolicy) {
        probe.bypassedSplitPolicy = true;
        probe.bypassReason = options.bypassReason || "unknown";
        World.splitPolicyBypassCount = (Number(World.splitPolicyBypassCount) || 0) + 1;
      }
      if (afterTarget.radius === beforeTarget.radius) {
        probe.radiusDidNotChange = true;
        World.radiusNoChangeCount = (Number(World.radiusNoChangeCount) || 0) + 1;
      }
      if (kind === "meteor_asteroid") World.liveMeteorAsteroidCollisionCount = (Number(World.liveMeteorAsteroidCollisionCount) || 0) + 1;
      if (kind === "asteroid_asteroid") World.liveAsteroidAsteroidCollisionCount = (Number(World.liveAsteroidAsteroidCollisionCount) || 0) + 1;
      World.lastLiveCollisionProbe = probe;
      return probe;
    }

    function asteroidGrowthTarget() {
      const target = Number(World.asteroidGrowthTarget ?? World.planetCaptureTarget ?? 0);
      return Number.isFinite(target) && target > 0 ? target : Infinity;
    }

    function absorbMeteorIntoAsteroid(a, m) {
      const Rm = meteorBaseRadius();
      const oldR = Number.isFinite(a.r) ? a.r : Rm;
      const maxR = Number.isFinite(a.maxR) ? a.maxR : (80.0 * Rm);
      const meteorR = getMeteorCollisionRadius(m);
      const meteorMass = 1;
      a.baseR = asteroidBaseRadius(a, oldR);
      a.massOneRadius = a.baseR;
      a.mass = asteroidMassValue(a) + meteorMass;
      a.r = asteroidRadiusForMass(a.mass, a.baseR, a.minR || (0.9 * Rm), maxR);

      a.absorbedMeteorCount = (a.absorbedMeteorCount || 0) + 1;
      a.growthLevel = a.mass;
      const rEff = (typeof m.orbitContributionR === "number") ? m.orbitContributionR : (meteorR * 0.5);
      a.growthSumR = (a.growthSumR || 0) + rEff;
      a.growthSumMass = (a.growthSumMass || 0) + meteorMass;
      addColorCount(a.growthColorCounts, m.colorName);

      // Compatibility aliases for existing threshold/debug/planet-composition code.
      a.captureCount = a.absorbedMeteorCount;
      a.captureSumR = a.growthSumR;
      a.captureSumMass = a.growthSumMass;
      addColorCount(a.captureColorCounts, m.colorName);
      a.liveSumR = a.growthSumR;
      a.liveSumMass = a.growthSumMass;
      addColorCount(a.liveColorCounts, m.colorName);
      if (Array.isArray(a.sourceColors) && m.colorName && !a.sourceColors.includes(m.colorName)) a.sourceColors.push(m.colorName);
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
      const push = (Number(radius) || 0) + getMeteorCollisionRadius(meteor) + 0.5;
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
          const contactR = (Number(a.r) || 0) + getMeteorCollisionRadius(m);
          if (d2 <= contactR * contactR) {
            const runTimers = window.HC && window.HC.RunTimers;
            const worldActive = runTimers && typeof runTimers.isWorldSlotsActive === "function"
              && runTimers.isWorldSlotsActive(World, nowMs);
            const bouncePct = Number(World.fxIntentBounceAsteroidPct || 0);
            if (worldActive && Number.isFinite(bouncePct) && bouncePct > 0 && Math.random() < bouncePct) {
              bounceMeteorFromBody(m, a, a.r);
              continue;
            }

            const beforeTarget = captureLiveCollisionTargetState(a);
            const meteorMassBefore = liveCollisionMass(m) || 1;
            const asteroidMassBefore = beforeTarget.mass;
            meteors.splice(mi, 1);
            let splitEvidence = null;
            if (window.HC?.CosmicDust?.applySplitPolicy) {
              splitEvidence = window.HC.CosmicDust.applySplitPolicy(World, { kind: "meteor_asteroid", meteor: m, asteroid: a, source: "Asteroids.resolveMeteorAsteroidContacts" });
              recordLiveCollisionProbe("meteor_asteroid", m, a, a, beforeTarget, splitEvidence, {
                sourceFunction: "Asteroids.resolveMeteorAsteroidContacts",
                bodyAMassBefore: meteorMassBefore,
                bodyBMassBefore: asteroidMassBefore,
                usedCollisionRules: true,
              });
            } else {
              absorbMeteorIntoAsteroid(a, m);
              recordLiveCollisionProbe("meteor_asteroid", m, a, a, beforeTarget, { absorbedMass: 1 }, {
                sourceFunction: "Asteroids.resolveMeteorAsteroidContacts",
                bodyAMassBefore: meteorMassBefore,
                bodyBMassBefore: asteroidMassBefore,
                usedCollisionRules: false,
                bypassedSplitPolicy: true,
                bypassReason: "HC.CosmicDust.applySplitPolicy unavailable; used absorbMeteorIntoAsteroid fallback",
              });
            }

            checkAsteroidMoonThreshold(a, "Asteroids.resolveMeteorAsteroidContacts");
            break;
          }
        }
      }
    }

    function startAsteroidCollapse(a) {
      recordLegacyAsteroidToPlanetBlocked(a, "Asteroids.startAsteroidCollapse");
      throw new Error("LEGACY_ASTEROID_TO_PLANET_DISABLED");
    }

    function recordLegacyAsteroidToPlanetBlocked(a, sourceFunction) {
      if (a) {
        a.legacyPlanetCollapseBlocked = true;
        a.isCollapsing = false;
        a.__transformationInProgress = false;
      }
      World.legacyAsteroidToPlanetBlockedCount = (Number(World.legacyAsteroidToPlanetBlockedCount) || 0) + 1;
      World.legacyPlanetSpawnBlockedCount = (Number(World.legacyPlanetSpawnBlockedCount) || 0) + 1;
      World.lastLegacyAsteroidToPlanetBlockedEvent = {
        type: "legacy_planet_spawn_blocked",
        sourceFunction,
        sourcePath: "legacy_asteroid_to_planet",
        sourceBodyIds: [a?._id || a?.id].filter(Boolean),
        sourceAsteroidId: a?._id || a?.id || null,
        sourceMass: asteroidMassValue(a),
      };
      World.lastLegacyPlanetSpawnBlockedEvent = World.lastLegacyAsteroidToPlanetBlockedEvent;
      window.HC?.logEvent?.("world", "legacy_planet_spawn_blocked", World.lastLegacyAsteroidToPlanetBlockedEvent, { source: sourceFunction, snapshot: true });
      return null;
    }

    function finishCollapseToPlanet(a) {
      recordLegacyAsteroidToPlanetBlocked(a, "Asteroids.finishCollapseToPlanet");
      throw new Error("LEGACY_COLLAPSE_TO_PLANET_DISABLED");
    }


    function mergeAsteroidPair(primary, secondary) {
      const massA = asteroidMassValue(primary);
      const massB = asteroidMassValue(secondary);
      const smallerMass = Math.min(massA, massB);
      const absorbedMass = window.HC?.CosmicDust ? smallerMass * (Number(World.spaceMechanics?.cosmicDustSplitAsteroidAsteroidAbsorbPct) || 0.50) : (primary === secondary ? 0 : (primary === arguments[0] ? massB : massA));
      const newMass = massA + absorbedMass;
      const totalMass = newMass || 1;
      const baseA = asteroidBaseRadius(primary, primary.r);
      const baseB = asteroidBaseRadius(secondary, secondary.r);
      const mergedBaseR = ((baseA * massA) + (baseB * massB)) / totalMass;

      primary.x = ((primary.x || 0) * massA + (secondary.x || 0) * massB) / totalMass;
      primary.y = ((primary.y || 0) * massA + (secondary.y || 0) * massB) / totalMass;
      primary.vx = ((primary.vx || 0) * massA + (secondary.vx || 0) * massB) / totalMass;
      primary.vy = ((primary.vy || 0) * massA + (secondary.vy || 0) * massB) / totalMass;
      primary.mass = newMass;
      primary.baseR = mergedBaseR;
      primary.massOneRadius = mergedBaseR;
      refreshRadius(primary, "asteroid", "Asteroids.mergeAsteroidPair");
      primary.absorbedMeteorCount = (primary.absorbedMeteorCount || 0) + (secondary.absorbedMeteorCount || 0);
      primary.growthLevel = newMass;
      primary.growthSumR = (primary.growthSumR || 0) + (secondary.growthSumR || 0);
      primary.growthSumMass = newMass;
      primary.captureCount = primary.absorbedMeteorCount;
      primary.captureSumR = primary.growthSumR;
      primary.captureSumMass = newMass;
      primary.liveSumR = (primary.liveSumR || 0) + (secondary.liveSumR || 0);
      primary.liveSumMass = newMass;
      mergeColorCounts(primary.growthColorCounts, secondary.growthColorCounts);
      mergeColorCounts(primary.captureColorCounts, secondary.captureColorCounts);
      mergeColorCounts(primary.liveColorCounts, secondary.liveColorCounts);
      if (Array.isArray(primary.sourceColors) || Array.isArray(secondary.sourceColors)) {
        primary.sourceColors = Array.from(new Set([
          ...(Array.isArray(primary.sourceColors) ? primary.sourceColors : []),
          ...(Array.isArray(secondary.sourceColors) ? secondary.sourceColors : []),
        ].filter(Boolean)));
      }
      // TODO: future asteroid visual composition model. Current merge keeps the larger asteroid's stable GLB variant (the first asteroid on equal mass).
      primary.cometHits = (primary.cometHits || 0) + (secondary.cometHits || 0);
      primary.captureCooldown = Math.max(primary.captureCooldown || 0, secondary.captureCooldown || 0, 0.045);
      secondary._dead = true;
      if (window.HC?.CosmicDust?.createFromCollision) window.HC.CosmicDust.createFromCollision(World, { primary, secondary, source: "asteroid_asteroid", mass: smallerMass * (Number(World.spaceMechanics?.cosmicDustSplitAsteroidAsteroidDustPct) || 0.50) });
      Events.emit("ASTEROID_MERGED", { mass: primary.mass || newMass, fromMass: [massA, massB] });
      checkAsteroidMoonThreshold(primary, "Asteroids.resolveAsteroidAsteroidContacts");
    }

    function resolveAsteroidAsteroidContacts() {
      const asteroids = World.asteroids;
      if (!asteroids || asteroids.length < 2) return;
      const consumed = new Set();
      for (let i = 0; i < asteroids.length; i++) {
        if (consumed.has(i)) continue;
        const a = asteroids[i];
        if (!a || a._dead || a.isCollapsing || a.absorbingIntoStarId || a.parentKind) continue;
        for (let j = i + 1; j < asteroids.length; j++) {
          if (consumed.has(j)) continue;
          const b = asteroids[j];
          if (!b || b._dead || b.isCollapsing || b.absorbingIntoStarId || b.parentKind) continue;
          const dx = (b.x || 0) - (a.x || 0);
          const dy = (b.y || 0) - (a.y || 0);
          const contactR = (Number(a.r) || 0) + (Number(b.r) || 0);
          if ((dx * dx + dy * dy) <= contactR * contactR) {
            const massA = asteroidMassValue(a);
            const massB = asteroidMassValue(b);
            const primary = massA >= massB ? a : b;
            const secondary = primary === a ? b : a;
            const beforeTarget = captureLiveCollisionTargetState(primary);
            mergeAsteroidPair(primary, secondary);
            recordLiveCollisionProbe("asteroid_asteroid", a, b, primary, beforeTarget, {
              ruleId: "asteroid_asteroid",
              cosmicDustMass: Math.min(massA, massB) * (Number(World.spaceMechanics?.cosmicDustSplitAsteroidAsteroidDustPct) || 0.50),
              absorbedMass: Math.min(massA, massB) * (Number(World.spaceMechanics?.cosmicDustSplitAsteroidAsteroidAbsorbPct) || 0.50),
            }, {
              sourceFunction: "Asteroids.resolveAsteroidAsteroidContacts",
              bodyAMassBefore: massA,
              bodyBMassBefore: massB,
              usedCollisionRules: false,
              bypassedSplitPolicy: true,
              bypassReason: "Asteroids.mergeAsteroidPair legacy path; HC.CosmicDust.applySplitPolicy not called",
            });
            consumed.add(primary === a ? j : i);
            consumed.add(primary === a ? i : j);
            break;
          }
        }
      }
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


    function ensureMoonProgressionMechanics() {
      World.spaceMechanics = World.spaceMechanics || {};
      const rawThreshold = Number(World.spaceMechanics.moonToRockyPlanetMassThreshold);
      if (!Number.isFinite(rawThreshold) || rawThreshold <= 0) World.spaceMechanics.moonToRockyPlanetMassThreshold = 20;
      if (World.spaceMechanics.moonToRockyPlanetEnabled !== false) World.spaceMechanics.moonToRockyPlanetEnabled = true;
      return World.spaceMechanics;
    }

    function isMoonToRockyPlanetEnabled() {
      return ensureMoonProgressionMechanics().moonToRockyPlanetEnabled !== false;
    }

    function moonToRockyPlanetMassThreshold() {
      const target = Number(ensureMoonProgressionMechanics().moonToRockyPlanetMassThreshold);
      return Number.isFinite(target) && target > 0 ? target : 20;
    }

    function moonMassValue(moon) {
      if (SpaceBodies?.getBodyMass) return SpaceBodies.getBodyMass(moon);
      const mass = Number(moon && moon.mass);
      return Number.isFinite(mass) && mass > 0 ? mass : 1;
    }

    function updateMoonRadius(moon) {
      const nextR = SpaceBodies?.radiusFromMass?.("moon", moon.mass, {
        baseRadius: Number(moon.massOneRadius || moon.baseR) || 1,
        minRadius: Number(moon.minR) || 0.1,
        maxRadius: Number(moon.maxR) || Number(World.spaceMechanics?.maxMoonRadius) || Infinity,
      });
      if (Number.isFinite(nextR) && nextR > 0) {
        moon.r = nextR;
        moon.radius = nextR;
      }
    }

    function isAbsorbableByMoon(body) {
      if (!body || body._dead || body.absorbingIntoStarId) return false;
      if (body.parentKind === "planet" || body.parentRef || Number.isFinite(Number(body.orbitR)) || body.orbitState) return false;
      return true;
    }

    function createRockyPlanetFromMoon(moon, reason, options) {
      const opts = options || {};
      const mass = moonMassValue(moon);
      const sourcePath = opts.sourcePath || "moon_to_rocky_planet";
      const target = moonToRockyPlanetMassThreshold();
      if (sourcePath !== "moon_to_rocky_planet" || !(mass >= target)) {
        World.legacyPlanetSpawnBlockedCount = (Number(World.legacyPlanetSpawnBlockedCount) || 0) + 1;
        World.lastLegacyPlanetSpawnBlockedEvent = { type: "legacy_planet_spawn_blocked", sourcePath, sourceFunction: opts.sourceFunction || "Asteroids.createRockyPlanetFromMoon", sourceMoonId: moon?.id || moon?._id || null, sourceMoonMass: mass, target, blockedLegacyPath: true, allowedProgressionPath: false, fatal: true };
        window.HC?.logEvent?.("world", "legacy_planet_spawn_blocked", World.lastLegacyPlanetSpawnBlockedEvent, { source: reason || "Asteroids.createRockyPlanetFromMoon", snapshot: true, severity: "fatal" });
        throw new Error("LEGACY_ASTEROID_TO_PLANET_DISABLED");
      }
      const radius = SpaceBodies?.radiusFromMass?.("planet", mass, { baseRadius: Number(moon.massOneRadius || moon.baseR) || 1, minRadius: Number(moon.r) || 1 }) || Number(moon.r) || 1;
      const planet = {
        id: `rocky_planet:${moon.id || Date.now()}:${World.planets.length + 1}`,
        type: "planet",
        kind: "planet",
        planetKind: "rocky",
        isRocky: true,
        isGas: false,
        source: "moon_mass_threshold",
        sourceMoonId: moon.id || moon._id || null,
        transformReason: reason || "moon_mass_threshold",
        x: Number(moon.x) || 0,
        y: Number(moon.y) || 0,
        vx: 0,
        vy: 0,
        mass,
        r: radius,
        radius,
        fixedR: radius,
        lockRadius: true,
        stationary: true,
        orbiters: [],
        rings: [],
        createdAt: World.nowMs ?? ((typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now()),
        age: 0,
      };
      window.HC?.WorldVisualAssets?.assignPlanetVisual?.(planet);
      planet.asset = planet.assetId;
      attachSourceEvidence(planet, "moon_to_rocky_planet", "moon_to_rocky_planet_mass", "Asteroids.transformMoonToRockyPlanet", [moon], moonMassValue(moon), mass);
      planet.sourceMoonEvidence = moon.sourcePath === "asteroid_to_moon" && moon.allowedProgressionPath === true;
      planet.allowedProgressionPath = true;
      planet.validProgressionOrigin = true;
      refreshRadius(planet, "planet", "Asteroids.createRockyPlanetFromMoon");
      planet.fixedR = planet.r;
      return planet;
    }

    function transformMoonToRockyPlanet(moon, reason) {
      if (!moon || moon.__transformationInProgress) return null;
      moon.__transformationInProgress = true;
      let planet = null;
      try {
        planet = createRockyPlanetFromMoon(moon, reason);
      } catch (error) {
        World.lastRockyPlanetCreationFailedEvent = { type: "rocky_planet_creation_failed", sourceMoonId: moon.id || moon._id || null, sourceMoonMass: moonMassValue(moon), reason: `helper_exception:${error?.message || String(error || "unknown")}`, stack: error?.stack || null, sourceFunction: "Asteroids.transformMoonToRockyPlanet" };
        window.HC?.logEvent?.("world", "rocky_planet_creation_failed", World.lastRockyPlanetCreationFailedEvent, { source: reason || "Asteroids.transformMoonToRockyPlanet", snapshot: true });
        moon.__transformationInProgress = false;
        return null;
      }
      if (!planet || !(planet.id || planet._id)) {
        World.lastRockyPlanetCreationFailedEvent = { type: "rocky_planet_creation_failed", sourceMoonId: moon.id || moon._id || null, sourceMoonMass: moonMassValue(moon), reason: "missing_created_planet_id", sourceFunction: "Asteroids.transformMoonToRockyPlanet" };
        window.HC?.logEvent?.("world", "rocky_planet_creation_failed", World.lastRockyPlanetCreationFailedEvent, { source: reason || "Asteroids.transformMoonToRockyPlanet", snapshot: true });
        moon.__transformationInProgress = false;
        return null;
      }
      World.planets = Array.isArray(World.planets) ? World.planets : [];
      if (!planet || planet.sourcePath !== "moon_to_rocky_planet" || planet.allowedProgressionPath !== true || planet.validProgressionOrigin !== true || !planet.sourceMoonId) {
        World.lastRockyPlanetCreationFailedEvent = { type: "rocky_planet_creation_failed", sourceMoonId: moon.id || moon._id || null, sourceMoonMass: moonMassValue(moon), reason: "planet_origin_guard_failed", sourceFunction: "Asteroids.transformMoonToRockyPlanet" };
        window.HC?.logEvent?.("world", "rocky_planet_creation_failed", World.lastRockyPlanetCreationFailedEvent, { source: reason || "Asteroids.transformMoonToRockyPlanet", snapshot: true });
        moon.__transformationInProgress = false;
        return null;
      }
      World.planets.push(planet);
      moon._dead = true;
      moon.progressed = true;
      moon.progressedTo = "rocky_planet";
      const planetRadiusEvidence = radiusEvidenceFor(planet);
      const sourceMoonRadius = Number(moon.r ?? moon.radius) || null;
      const planetContinuityRatio = sourceMoonRadius ? planetRadiusEvidence.finalRadius / sourceMoonRadius : null;
      World.lastRockyPlanetCreatedEvent = {
        type: "rocky_planet_created",
        sourcePath: "moon_to_rocky_planet",
        sourceFunction: planet.sourceFunction,
        sourceMoonId: moon.id || moon._id || null,
        sourceMoonMass: moonMassValue(moon),
        sourceMoonRadius,
        sourceMassBefore: planet.sourceMassBefore,
        sourceMassAfter: planet.sourceMassAfter,
        createdPlanetId: planet.id,
        createdPlanetMass: planet.mass,
        createdPlanetRawRadiusFromMass: planetRadiusEvidence.rawRadiusFromMass,
        createdPlanetFinalRadius: planetRadiusEvidence.finalRadius,
        radiusContinuityRatio: planetContinuityRatio,
        clampApplied: planetRadiusEvidence.clampApplied,
        clampReason: planetRadiusEvidence.clampReason,
        createdPlanetRadius: planet.r,
        createdObjectType: "rocky_planet",
        createdObjectId: planet.id,
        sourceBodyIds: planet.sourceBodyIds,
        allowedProgressionPath: planet.allowedProgressionPath === true,
        blockedLegacyPath: false,
        sourceType: "moon",
        sourceId: moon.id || moon._id || null,
        resultingObjectType: "rocky_planet",
        resultingObjectId: planet.id,
        mass: planet.mass,
        radius: planet.r,
        consumedMoon: true,
        massRadiusContractRadius: planet.massRadiusContractRadius ?? planet.r,
        collisionRadius: planet.collisionRadius ?? planet.r,
        viewRadius: planet.viewRadius ?? planet.r,
        renderBodyRadius: planet.renderBodyRadius ?? planet.viewRadius ?? planet.r,
        renderRingRadius: planet.renderRingRadius ?? null,
        visualHaloRadius: planet.visualHaloRadius ?? null,
      };
      recordRadiusContinuity("rocky_planet", World.lastRockyPlanetCreatedEvent);
      World.lastPlanetCreatedEvent = Object.assign({ type: "planet_created" }, World.lastRockyPlanetCreatedEvent);
      window.HC?.logEvent?.("world", "planet_created", World.lastPlanetCreatedEvent, { source: reason || "Asteroids.transformMoonToRockyPlanet", snapshot: true });
      window.HC?.logEvent?.("world", "rocky_planet_created", World.lastRockyPlanetCreatedEvent, { source: reason || "Asteroids.transformMoonToRockyPlanet", snapshot: true });
      window.HC?.logEvent?.("world", (window.HC.DebugEventTypes?.WORLD_OBJECT_TRANSFORMED || "world.object_transformed"), {
        event: "MOON_TO_ROCKY_PLANET_CREATED",
        fromType: "moon",
        toType: "planet",
        planetKind: "rocky",
        moonId: moon.id || moon._id || null,
        planetId: planet.id,
        source: "moon_mass_threshold",
        sourceMoonId: planet.sourceMoonId,
        mass: planet.mass,
        radius: planet.r,
        asset: planet.asset,
      }, { snapshot: true, source: reason || "Asteroids.transformMoonToRockyPlanet" });
      Events.emit("MOON_TO_ROCKY_PLANET_CREATED", { planet, moon, source: "moon_mass_threshold" });
      return planet;
    }

    function getMoonToRockyPlanetBlockReason(moon) {
      if (!moon) return "invalid_moon";
      if (moon._dead) return "moon_dead";
      const currentFrame = Number(World.frame) || 0;
      if (moon.progressionLockFrame === currentFrame) return "progression_same_frame";
      const cooldownUntil = Number(moon.progressionCooldownUntilFrame);
      if (Number.isFinite(cooldownUntil) && currentFrame < cooldownUntil) return "progression_cooldown";
      if (moon.progressionMode === "orbital" || moon.isOrbitalBody === true) return "orbital_moon";
      if (moon.parentPlanetId || moon.parentKind || moon.parentRef) return "parented_moon";
      if (moon.canBecomePlanet === false) return "can_become_planet_false";
      return null;
    }

    function recordMoonToRockyPlanetBlocked(moon, reason, source) {
      const current = moon ? moonMassValue(moon) : 0;
      const target = moonToRockyPlanetMassThreshold();
      const event = {
        sourceId: moon?.id || moon?._id || null,
        current,
        target,
        reason: reason || "invalid_moon",
        frame: Number(World.frame) || 0,
        sourceFunction: source || "Asteroids.checkMoonRockyPlanetThreshold",
      };
      World.progressionBlockedSameFrameCount = (Number(World.progressionBlockedSameFrameCount) || 0) + 1;
      World.lastMoonToRockyPlanetBlockedEvent = event;
      World.lastProgressionBlockedEvent = event;
      if (moon && current >= target) moon.pendingMoonToRockyPlanetProgression = true;
      return event;
    }

    function canMoonBecomeRockyPlanet(moon) {
      return getMoonToRockyPlanetBlockReason(moon) === null;
    }

    function checkMoonRockyPlanetThreshold(moon, source) {
      if (!isMoonToRockyPlanetEnabled()) return null;
      const target = moonToRockyPlanetMassThreshold();
      const current = moon ? moonMassValue(moon) : 0;
      const overThreshold = !!moon && current >= target;
      const progressEvent = {
        sourceType: "moon",
        sourceId: moon?.id || moon?._id || null,
        thresholdType: "moon_to_rocky_planet_mass",
        current,
        target,
        thresholdSource: "spaceMechanics",
        sourceMass: current,
        sourceRadius: Number(moon?.r ?? moon?.radius) || null,
        overThreshold,
        triggeredProgression: false,
        resultingObjectType: overThreshold ? "rocky_planet" : null,
        resultingObjectId: null,
      };
      World.lastThresholdProgressionEvent = progressEvent;
      if (!overThreshold) {
        window.HC?.logEvent?.("world", (window.HC.DebugEventTypes?.WORLD_THRESHOLD_PROGRESS || "world.threshold_progress"), progressEvent, { source: source || "Asteroids.checkMoonRockyPlanetThreshold", snapshot: true });
        return null;
      }
      const blockReason = getMoonToRockyPlanetBlockReason(moon);
      if (blockReason) {
        const blockedEvent = recordMoonToRockyPlanetBlocked(moon, blockReason, source || "Asteroids.checkMoonRockyPlanetThreshold");
        progressEvent.progressionBlocked = true;
        progressEvent.creationBlocked = true;
        progressEvent.failureReason = blockReason;
        progressEvent.blockReason = blockReason;
        progressEvent.blockedEvent = blockedEvent;
        World.lastMoonToRockyPlanetThresholdEvent = Object.assign({ type: "moon_to_rocky_planet_threshold" }, progressEvent);
        window.HC?.logEvent?.("world", (window.HC.DebugEventTypes?.WORLD_THRESHOLD_PROGRESS || "world.threshold_progress"), progressEvent, { source: source || "Asteroids.checkMoonRockyPlanetThreshold", snapshot: true });
        return null;
      }
      const planet = transformMoonToRockyPlanet(moon, source || "moon_mass_threshold");
      if (planet && (planet.id || planet._id)) {
        progressEvent.triggeredProgression = true;
        progressEvent.resultingObjectId = planet.id || planet._id || null;
        moon.pendingMoonToRockyPlanetProgression = false;
      } else {
        progressEvent.creationFailed = true;
        progressEvent.failureReason = World.lastRockyPlanetCreationFailedEvent?.reason || "missing_created_planet_id";
      }
      World.lastMoonToRockyPlanetThresholdEvent = Object.assign({ type: "moon_to_rocky_planet_threshold" }, progressEvent);
      window.HC?.logEvent?.("world", (window.HC.DebugEventTypes?.WORLD_THRESHOLD_PROGRESS || "world.threshold_progress"), progressEvent, { source: source || "Asteroids.checkMoonRockyPlanetThreshold", snapshot: true });
      return planet;
    }

    function absorbBodyIntoMoon(moon, body, source) {
      const bodyKind = body?.kind || body?.type || source;
      const cosmicKind = bodyKind === "asteroid" ? "moon_asteroid" : "moon_meteor";
      const split = window.HC?.CosmicDust?.applySplitPolicy
        ? window.HC.CosmicDust.applySplitPolicy(World, { kind: cosmicKind, moon, [bodyKind === "asteroid" ? "asteroid" : "meteor"]: body, source: "Asteroids.absorbBodyIntoMoon" })
        : null;
      const impact = split ? { kind: cosmicKind, createsDust: true, createsOrbiter: false, masses: { absorbed: split.absorbedMass || 0, ejecta: split.fragmentMass || 0, dust: split.cosmicDustMass || 0 }, dust: { kind: "cosmic_dust", color: "GRAY" } }
        : (window.HC?.Impact?.resolveMoonImpact ? window.HC.Impact.resolveMoonImpact({ moon, incoming: body, mechanics: World.spaceMechanics }) : null);
      const absorbedMass = impact?.masses?.absorbed ?? (SpaceBodies?.getBodyMass ? SpaceBodies.getBodyMass(body) : (Number(body.mass) || massFromR(Number(body.r) || 1)));
      moon.lastImpact = impact || null;
      if (!split) { moon.mass = moonMassValue(moon) + absorbedMass; updateMoonRadius(moon); if (impact && window.HC?.Impact?.spawnEjecta) window.HC.Impact.spawnEjecta(World, impact, moon); body._dead = true; }
      if (impact && window.HC?.Impact?.logImpactEvidence) window.HC.Impact.logImpactEvidence(World, impact, "Asteroids.absorbBodyIntoMoon");
      const moonProgressEvent = {
        sourceType: "moon",
        sourceId: moon.id || moon._id || null,
        absorbedType: body.kind || body.type || source,
        absorbedId: body.id || body._id || null,
        absorbedMass,
        impactDust: impact?.dust || null,
        current: moon.mass,
        target: moonToRockyPlanetMassThreshold(),
        thresholdType: "moon_to_rocky_planet_mass",
        thresholdSource: "spaceMechanics",
        sourceMass: moon.mass,
        sourceRadius: Number(moon.r ?? moon.radius) || null,
        overThreshold: moon.mass >= moonToRockyPlanetMassThreshold(),
        triggeredProgression: false,
        resultingObjectType: moon.mass >= moonToRockyPlanetMassThreshold() ? "rocky_planet" : null,
        resultingObjectId: null,
      };
      World.lastThresholdProgressionEvent = moonProgressEvent;
      const createdPlanet = checkMoonRockyPlanetThreshold(moon, "moon_absorb_contact");
      if (createdPlanet && (createdPlanet.id || createdPlanet._id)) {
        moonProgressEvent.triggeredProgression = true;
        moonProgressEvent.resultingObjectId = createdPlanet.id || createdPlanet._id || null;
      } else if (moonProgressEvent.overThreshold) {
        const thresholdEvent = World.lastMoonToRockyPlanetThresholdEvent || null;
        const blockReason = thresholdEvent?.blockReason || thresholdEvent?.failureReason || World.lastProgressionBlockedEvent?.reason || null;
        if (blockReason && (thresholdEvent?.progressionBlocked || thresholdEvent?.creationBlocked)) {
          moonProgressEvent.progressionBlocked = true;
          moonProgressEvent.creationBlocked = true;
          moonProgressEvent.failureReason = blockReason;
          moonProgressEvent.blockReason = blockReason;
        } else {
          moonProgressEvent.creationFailed = true;
          moonProgressEvent.failureReason = World.lastRockyPlanetCreationFailedEvent?.reason || "missing_created_planet_id";
        }
      }
      World.lastMoonToRockyPlanetThresholdEvent = Object.assign({ type: "moon_to_rocky_planet_threshold" }, moonProgressEvent);
      window.HC?.logEvent?.("world", (window.HC.DebugEventTypes?.WORLD_THRESHOLD_PROGRESS || "world.threshold_progress"), moonProgressEvent, { source: "Asteroids.absorbBodyIntoMoon", snapshot: true });
    }

    function resolveMoonDirectAbsorptions() {
      ensureMoonProgressionMechanics();
      if (!Array.isArray(World.moons) || !World.moons.length) return;
      const isImpact = SpaceBodies?.isDirectImpact || ((a, b) => {
        const dx = (Number(b.x) || 0) - (Number(a.x) || 0);
        const dy = (Number(b.y) || 0) - (Number(a.y) || 0);
        const r = (Number(a.r) || 1) + (Number(b.r) || 1);
        return dx * dx + dy * dy <= r * r;
      });
      for (const moon of World.moons) {
        if (!moon || moon._dead) continue;
        checkMoonRockyPlanetThreshold(moon, "moon_update_threshold");
        if (moon._dead) continue;
        for (const m of (Array.isArray(World.meteors) ? World.meteors : [])) {
          if (isAbsorbableByMoon(m) && isImpact(moon, m)) absorbBodyIntoMoon(moon, m, "meteor");
          if (moon._dead) break;
        }
        if (moon._dead) continue;
        for (const a of (Array.isArray(World.asteroids) ? World.asteroids : [])) {
          if (isAbsorbableByMoon(a) && isImpact(moon, a)) absorbBodyIntoMoon(moon, a, "asteroid");
          if (moon._dead) break;
        }
      }
    }

    function updateMoons(dt) {
      if (!Array.isArray(World.moons)) return;
      for (const moon of World.moons) {
        moon.age = (Number(moon.age) || 0) + dt;
        moon.x += (Number(moon.vx) || 0) * dt;
        moon.y += (Number(moon.vy) || 0) * dt;
      }
      resolveMoonDirectAbsorptions();
      for (let i = World.moons.length - 1; i >= 0; i--) {
        if (World.moons[i]._dead) World.moons.splice(i, 1);
      }
    }

    function updateAsteroids(dt) {
      updateMoons(dt);
      const bounceLoss = 0.90;
      const b = getWorldViewBounds();

      for (const a of World.asteroids) {
        if (a.absorbingIntoStarId) continue;
        if (a.parentKind === "planet" || a.parentRef) {
          throw new Error("LEGACY_CAPTURE_ORBIT_DISABLED");
        }
        if (!a.isCollapsing) {
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

      resolveAsteroidAsteroidContacts();

      for (let i = World.asteroids.length - 1; i >= 0; i--) {
        if (World.asteroids[i]._dead) World.asteroids.splice(i, 1);
      }
    }

    window.spawnAsteroidFromCollision = spawnAsteroidFromCollision;
    window.HC.Planets = window.HC.Planets || {};
    window.HC.Planets.createRockyPlanetFromMoon = createRockyPlanetFromMoon;

    window.HC.Asteroids = {
      update(dt, now) {
        updateAsteroids(dt);
      },
      capture(dt, now) {
        captureMeteorsByAsteroids(dt, now);
      },
      createMoonFromAsteroid,
      transformAsteroidToMoon,
      transformMoonToRockyPlanet,
      resolveMoonDirectAbsorptions,
      canMoonBecomeRockyPlanet,
      getMoonToRockyPlanetBlockReason,
      checkAsteroidMoonThreshold,
      checkMoonRockyPlanetThreshold,
    };

    return window.HC.Asteroids;
  };
})();
