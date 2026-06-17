// HC world render snapshot builder (Stage 1)
(function () {
  window.HC = window.HC || {};

  function toNumber(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function pickArray(value) {
    return Array.isArray(value) ? value : [];
  }

  const PLANET_BASE_VISUAL = Object.freeze({
    visualKind: "planet",
    visualVariant: "planet_01",
    assetId: "planet_01.glb",
  });
  const ROCKY_PLANET_BASE_VISUAL = Object.freeze({
    visualKind: "planet",
    visualVariant: "rocky_planet_01",
    assetId: "rocky_planet_01.glb",
  });

  function getPlanetKind(body) {
    if (!body || typeof body !== "object") return null;
    if (body.planetKind === "rocky" || body.planetKind === "gas") return body.planetKind;
    if (body.isRocky === true) return "rocky";
    if (body.isGas === true || body.isRocky === false) return "gas";
    return null;
  }

  let nextRenderBodyId = 1;
  const renderBodyIds = typeof WeakMap === "function" ? new WeakMap() : null;

  function getStableRenderBodyId(body, fallbackKind) {
    if (!body || typeof body !== "object") return null;
    if (body.renderKey || body.id || body._id) return body.renderKey || body.id || body._id;
    if (!renderBodyIds) return null;
    let id = renderBodyIds.get(body);
    if (!id) {
      id = `${fallbackKind}:visual:${nextRenderBodyId++}`;
      renderBodyIds.set(body, id);
    }
    return id;
  }

  function mapBody(body, fallbackKind, index) {
    if (!body || typeof body !== "object") return null;
    const radius = toNumber(body.r, toNumber(body.radius, toNumber(body.collisionRadius, undefined)));
    const scale = toNumber(body.scale, undefined);
    const stableRenderKey = getStableRenderBodyId(body, fallbackKind) || `${fallbackKind}:snapshot:${index}`;
    const isPlanet = fallbackKind === "planet";
    const planetKind = isPlanet ? getPlanetKind(body) : null;
    return {
      renderKey: stableRenderKey,
      id: body.id || body._id || stableRenderKey,
      type: body.type || fallbackKind,
      kind: body.kind || body.type || fallbackKind,
      planetKind,
      isRocky: isPlanet ? planetKind === "rocky" : undefined,
      isGas: isPlanet ? planetKind === "gas" : undefined,
      x: toNumber(body.x, 0),
      y: toNumber(body.y, 0),
      z: toNumber(body.z, undefined),
      radius,
      r: radius,
      collisionRadius: toNumber(body.collisionRadius, toNumber(body.physicalRadius, radius)),
      scale,
      color: body.color || body.fill || body.colorName || body.gradientOuterColor || null,
      colorName: body.colorName || body.colorKey || null,
      colorMix: body.colorMix || body.palette || null,
      colorKey: body.colorKey || body.colorName || body.dominantKey || null,
      visualKind: body.visualKind || (isPlanet ? PLANET_BASE_VISUAL.visualKind : null),
      visualVariant: body.visualVariant || (isPlanet ? (planetKind === "rocky" ? ROCKY_PLANET_BASE_VISUAL.visualVariant : PLANET_BASE_VISUAL.visualVariant) : null),
      assetId: body.assetId || body.asset || (isPlanet ? (planetKind === "rocky" ? ROCKY_PLANET_BASE_VISUAL.assetId : PLANET_BASE_VISUAL.assetId) : null),
      asset: body.asset || body.assetId || (isPlanet ? (planetKind === "rocky" ? ROCKY_PLANET_BASE_VISUAL.assetId : PLANET_BASE_VISUAL.assetId) : null),
      source: body.source || null,
      sourceMoonId: body.sourceMoonId || null,
      visualRotationSeed: isPlanet ? toNumber(body.visualRotationSeed, undefined) : undefined,
      visualRotationX: isPlanet ? toNumber(body.visualRotationX, undefined) : undefined,
      visualRotationY: isPlanet ? toNumber(body.visualRotationY, undefined) : undefined,
      visualRotationZ: isPlanet ? toNumber(body.visualRotationZ, undefined) : undefined,
      visualRotationSpeedX: isPlanet ? toNumber(body.visualRotationSpeedX, undefined) : undefined,
      visualRotationSpeedY: isPlanet ? toNumber(body.visualRotationSpeedY, undefined) : undefined,
      visualRotationSpeedZ: isPlanet ? toNumber(body.visualRotationSpeedZ, undefined) : undefined,
      alpha: toNumber(body.alpha, undefined),
      sides: toNumber(body.sides, undefined),
      angle: toNumber(body.angle, undefined),
      grayLight: toNumber(body.grayLight, undefined),
      orbitCurrentRadius: toNumber(body.orbitCurrentRadius, toNumber(body.orbitPx, undefined)),
      orbitNativeRadius: toNumber(body.orbitNativeRadius, undefined),
      orbitPx: toNumber(body.orbitPx, undefined),
      orbiterCount: Array.isArray(body.orbiters) ? body.orbiters.length : undefined,
      absorbedMeteorCount: toNumber(body.absorbedMeteorCount, undefined),
      growthLevel: toNumber(body.growthLevel, undefined),
      mass: toNumber(body.mass, undefined),
      density: toNumber(body.density, undefined),
      dustKind: body.dustKind || null,
      collectible: body.collectible === true,
      isCosmicGrayDust: body.isCosmicGrayDust === true,
      collectProgressMs: toNumber(body.collectProgressMs, undefined),
      collectRequiredMs: toNumber(body.collectRequiredMs, undefined),
      collectDecayMs: toNumber(body.collectDecayMs, undefined),
      lastMergedAt: toNumber(body.lastMergedAt, undefined),
      age: toNumber(body.age, undefined),
      baseR: toNumber(body.baseR, toNumber(body.massOneRadius, undefined)),
      sourceColors: Array.isArray(body.sourceColors) ? body.sourceColors.slice() : undefined,
      collapseVisualScale: toNumber(body.collapseVisualScale, undefined),
      state: body.state || body.phase || (body.isCollapsing ? "collapsing" : null),
      parentId: body.parentId || body.parentRef?.id || body.parentRef?._id || null,
      orbit: body.orbitState || null,
      orbitState: body.orbitState || null,
      visual: {
        isCollapsing: !!body.isCollapsing,
        absorbingIntoStarId: body.absorbingIntoStarId || null,
        parentKind: body.parentKind || null,
      },
      velocity: {
        vx: toNumber(body.vx, 0),
        vy: toNumber(body.vy, 0),
      },
      flags: {
        dead: !!body._dead,
        active: !!body.active,
      },
    };
  }

  function mapCollection(items, kind) {
    const result = [];
    const src = pickArray(items);
    for (let i = 0; i < src.length; i += 1) {
      const mapped = mapBody(src[i], kind, i);
      if (mapped && !mapped.flags?.dead) result.push(mapped);
    }
    return result;
  }

  function build(options) {
    const opts = options || {};
    const World = opts.World || {};
    const Camera = opts.Camera || {};
    const View = opts.View || {};

    let worldBounds = null;
    let worldBoundsSource = "fallback_null";
    if (typeof opts.getWorldViewBounds === "function") {
      try {
        worldBounds = opts.getWorldViewBounds() || null;
        worldBoundsSource = worldBounds ? "getWorldViewBounds" : "fallback_null";
      } catch (_err) {
        worldBounds = null;
        worldBoundsSource = "getWorldViewBounds_error";
      }
    } else if (World.bounds && typeof World.bounds === "object") {
      worldBounds = World.bounds;
      worldBoundsSource = "world.bounds";
    }

    const sourcePlanets = pickArray(World.planets);
    const snapshotPlanets = mapCollection(sourcePlanets, "planet");
    const rockyPlanetCount = sourcePlanets.filter((planet) => getPlanetKind(planet) === "rocky").length;
    const gasPlanetCount = sourcePlanets.filter((planet) => getPlanetKind(planet) === "gas").length;

    const snapshot = {
      version: "world-render-snapshot-v1",
      nowMs: toNumber(opts.nowMs, 0),
      dt: toNumber(opts.dt, 0),
      camera: {
        x: toNumber(Camera.x, toNumber(Camera.centerX, 0)),
        y: toNumber(Camera.y, toNumber(Camera.centerY, 0)),
        centerX: toNumber(Camera.centerX, toNumber(Camera.x, 0)),
        centerY: toNumber(Camera.centerY, toNumber(Camera.y, 0)),
        zoom: toNumber(Camera.zoom, toNumber(Camera.scale, 1)),
        viewport: {
          width: toNumber(View.w, 0),
          height: toNumber(View.h, 0),
        },
        worldBounds,
      },
      world: {
        meteors: mapCollection(World.meteors, "meteor"),
        comets: mapCollection(World.comets, "comet"),
        asteroids: mapCollection(World.asteroids, "asteroid"),
        planets: snapshotPlanets,
        moons: mapCollection(World.moons, "moon"),
        dustClouds: mapCollection(World.dustClouds, "dustCloud"),
        dustParticles: mapCollection(World.dustParticles, "dustParticle"),
        impactFragments: mapCollection(World.impactFragments, "impactFragment"),
        harmonicDust: mapCollection(World.harmonicDust, "harmonic_dust"),
        stars: mapCollection(World.stars, "star"),
        prg: World.prg || null,
        background: World.background || null,
        sequenceVisualSignals: World.sequenceVisualSignals || null,
        debug: World.debug || null,
      },
      renderSettings: opts.renderSettings || null,
      debugSettings: opts.debugSettings || null,
      diagnostics: {
        version: "world-render-snapshot-v1",
        worldBoundsSource,
        objectCounts: {
          meteors: pickArray(World.meteors).length,
          comets: pickArray(World.comets).length,
          asteroids: pickArray(World.asteroids).length,
          planets: sourcePlanets.length,
          rockyPlanets: rockyPlanetCount,
          gasPlanets: gasPlanetCount,
          planetsInThreeSnapshot: snapshotPlanets.length,
          moons: pickArray(World.moons).length,
          dustClouds: pickArray(World.dustClouds).length,
          dustParticles: pickArray(World.dustParticles).length,
          impactFragments: pickArray(World.impactFragments).length,
          harmonicDust: pickArray(World.harmonicDust).length,
          stars: pickArray(World.stars).length,
        },
        harmonicDustCount: pickArray(World.harmonicDust).filter((dust) => dust && !dust._dead).length,
        collectibleDustCount: pickArray(World.harmonicDust).filter((dust) => dust && !dust._dead && dust.collectible === true).length,
        harmonicDustMassByColor: pickArray(World.harmonicDust).reduce((acc, dust) => {
          if (!dust || dust._dead) return acc;
          const key = String(dust.colorName || "UNKNOWN").toUpperCase();
          acc[key] = (acc[key] || 0) + (Number.isFinite(Number(dust.mass)) ? Number(dust.mass) : 0);
          return acc;
        }, {}),
        harmonicDustCollected: Object.assign({}, World.harmonicDustCollected || {}),
        cameraAvailability: {
          hasCamera: !!opts.Camera,
          hasView: !!opts.View,
          hasWorldBounds: !!worldBounds,
          worldBoundsSource,
        },
        hasWorldBounds: !!worldBounds,
      },
    };

    return snapshot;
  }

  window.HC.WorldRenderSnapshot = {
    build,
  };
})();
