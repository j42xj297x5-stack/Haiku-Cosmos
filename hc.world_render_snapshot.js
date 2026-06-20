// HC world render snapshot builder (Stage 1)
(function () {
  window.HC = window.HC || {};

  function toNumber(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function pickArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function totalMass(items) {
    return pickArray(items).reduce((sum, item) => sum + (item && !item._dead ? toNumber(Number(item.mass), 0) : 0), 0);
  }

  function compactMassSplitEvent(event) {
    if (!event) return null;
    return {
      ruleId: event.ruleId || event.kind || null,
      sourceMassPolicy: event.sourceMassPolicy || null,
      inputMass: toNumber(Number(event.inputMass ?? event.conservationInputMass), 0),
      outputMass: toNumber(Number(event.outputMass ?? event.conservationOutputMass), 0),
      conservationDelta: toNumber(Number(event.conservationDelta ?? event.delta), 0),
      cosmicDustMass: toNumber(Number(event.cosmicDustMass), 0),
      absorbedMass: toNumber(Number(event.absorbedMass), 0),
      fragmentMass: toNumber(Number(event.fragmentMass), 0),
    };
  }

  function pushBoundedUnique(list, warning, limit) {
    const target = Array.isArray(list) ? list : [];
    const key = warning && (warning.key || `${warning.type}:${warning.id || ""}:${warning.kind || ""}`);
    if (!key || !target.some((entry) => entry && entry.key === key)) target.push(warning);
    while (target.length > (limit || 8)) target.shift();
    return target;
  }

  function recordSnapshotWarnings(World, snapshotWorld, nowMs) {
    if (!World || typeof World !== "object") return;
    const warnings = Array.isArray(World.radiusMismatchWarnings) ? World.radiusMismatchWarnings : [];
    const allBodies = ["meteors", "asteroids", "moons", "planets", "impactFragments"].flatMap((key) => pickArray(snapshotWorld[key]));
    for (const body of allBodies) {
      const collisionRadius = Number(body?.collisionRadius);
      const viewRadius = Number(body?.viewRadius ?? body?.visual?.radius);
      if (!(collisionRadius > 0) || !(viewRadius > 0)) continue;
      const mismatchRatio = Math.abs(collisionRadius - viewRadius) / Math.max(collisionRadius, viewRadius);
      if (mismatchRatio > 0.10) {
        World.radiusMismatchWarnings = pushBoundedUnique(warnings, {
          type: "render_collision_radius_mismatch",
          key: `render_collision_radius_mismatch:${body.id || body.renderKey}`,
          id: body.id || body.renderKey || null,
          kind: body.kind || body.type || null,
          collisionRadius,
          viewRadius,
          renderBodyRadius: Number(body?.renderBodyRadius ?? body?.visual?.radius ?? viewRadius) || null,
          bodySurfaceRadius: Number(body?.bodySurfaceRadius ?? body?.renderBodyRadius ?? viewRadius) || null,
          mismatchRatio,
          at: nowMs,
        }, 8);
      }
    }

    const bodyCountByKind = {
      meteor: pickArray(World.meteors).filter((b) => b && !b._dead).length,
      asteroid: pickArray(World.asteroids).filter((b) => b && !b._dead).length,
      moon: pickArray(World.moons).filter((b) => b && !b._dead).length,
      planet: pickArray(World.planets).filter((b) => b && !b._dead).length,
      cosmicDust: pickArray(World.cosmicDust).filter((b) => b && !b._dead).length,
      harmonicDust: pickArray(World.harmonicDust).filter((b) => b && !b._dead).length,
      impactFragment: pickArray(World.impactFragments).filter((b) => b && !b._dead).length,
    };
    const prev = World.__bodyCountGrowthSample;
    if (prev && nowMs - prev.at <= 2000) {
      for (const kind of ["asteroid", "moon", "planet"]) {
        const delta = bodyCountByKind[kind] - (prev.counts[kind] || 0);
        if (delta > 8) {
          World.bodyCountGrowthWarnings = pushBoundedUnique(World.bodyCountGrowthWarnings, {
            type: "rapid_body_count_growth",
            key: `rapid_body_count_growth:${kind}:${Math.floor(nowMs / 2000)}`,
            kind,
            previousCount: prev.counts[kind] || 0,
            currentCount: bodyCountByKind[kind],
            delta,
            windowMs: nowMs - prev.at,
            at: nowMs,
          }, 8);
        }
      }
    }
    World.__bodyCountGrowthSample = { at: nowMs, counts: bodyCountByKind };
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

  function hasValidPlanetOrigin(body) {
    if (!body || typeof body !== "object") return false;
    if (body.debugSpawn === true && body.sourcePath === "debug_bootstrap" && body.allowedProgressionPath === false) return true;
    const kind = getPlanetKind(body);
    if (kind === "rocky") {
      return body.sourcePath === "moon_to_rocky_planet"
        && body.allowedProgressionPath === true
        && Array.isArray(body.sourceBodyIds)
        && body.sourceBodyIds.length > 0;
    }
    return Boolean(body.sourcePath && body.sourceFunction);
  }

  function planetOriginKey(body) {
    if (!body || typeof body !== "object") return "unknown";
    if (body.debugSpawn === true || body.sourcePath === "debug_bootstrap") return "debug_bootstrap";
    if (!hasValidPlanetOrigin(body)) return "invalid";
    return body.sourcePath || "unknown";
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
    // Patch D0 body contract boundary:
    // - canonical mechanics fields are copied for a shared Canvas2D/Three.js VM;
    // - visualKind/assetId/model routing fields are render-only;
    // - orbitPx/orbitCurrentRadius/orbiters/parentKind are compatibility evidence
    //   and must not reactivate legacy planet capture.
    const SpaceBodies = window.HC?.SpaceBodies;
    const kindForRadius = body.kind || body.type || fallbackKind;
    const massForRadius = toNumber(Number(body.mass), undefined);
    const radiusOptions = {
      baseRadius: body.massOneRadius ?? body.baseR ?? body.radiusBase ?? body.r ?? body.radius,
      minRadius: body.minR ?? body.minRadius,
      maxRadius: body.maxR ?? body.maxRadius,
      density: body.density,
    };
    const contractRadius = Number.isFinite(massForRadius) && SpaceBodies?.radiusFromMass
      ? SpaceBodies.radiusFromMass(kindForRadius, massForRadius, radiusOptions)
      : undefined;
    const radius = toNumber(contractRadius, toNumber(body.r, toNumber(body.radius, toNumber(body.collisionRadius, undefined))));
    const collisionRadius = Number.isFinite(massForRadius) && SpaceBodies?.collisionRadiusFromMass
      ? SpaceBodies.collisionRadiusFromMass(kindForRadius, massForRadius, radiusOptions)
      : toNumber(body.collisionRadius, toNumber(body.physicalRadius, radius));
    const viewRadius = Number.isFinite(massForRadius) && SpaceBodies?.viewRadiusFromMass
      ? SpaceBodies.viewRadiusFromMass(kindForRadius, massForRadius, radiusOptions)
      : toNumber(body.viewRadius, radius);
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
      massRadiusContractRadius: toNumber(body.massRadiusContractRadius, radius),
      collisionRadius,
      viewRadius,
      renderBodyRadius: toNumber(body.renderBodyRadius, viewRadius),
      renderRingRadius: toNumber(body.renderRingRadius, Math.max(viewRadius * 1.18, toNumber(body.ringRadius, 0))),
      visualHaloRadius: toNumber(body.visualHaloRadius, viewRadius),
      bodySurfaceRadius: toNumber(body.bodySurfaceRadius, toNumber(body.renderBodyRadius, viewRadius)),
      absorptionRadius: toNumber(body.absorptionRadius, collisionRadius),
      absorptionBufferRatio: toNumber(body.absorptionBufferRatio, 1),
      glbVisualScale: toNumber(body.glbVisualScale, undefined),
      meshWorldRadius: toNumber(body.meshWorldRadius, toNumber(body.renderBodyRadius, viewRadius)),
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
      sourcePath: body.sourcePath || null,
      sourceRuleId: body.sourceRuleId || null,
      sourceFunction: body.sourceFunction || null,
      sourceBodyIds: Array.isArray(body.sourceBodyIds) ? body.sourceBodyIds.slice() : [],
      sourceMassBefore: toNumber(body.sourceMassBefore, undefined),
      sourceMassAfter: toNumber(body.sourceMassAfter, undefined),
      createdObjectType: body.createdObjectType || null,
      createdObjectId: body.createdObjectId || null,
      allowedProgressionPath: body.allowedProgressionPath === true,
      blockedLegacyPath: body.blockedLegacyPath === true,
      debugSpawn: body.debugSpawn === true,
      invalidPlanetOrigin: isPlanet ? (body.invalidPlanetOrigin === true || !hasValidPlanetOrigin(body)) : undefined,
      progressionMode: body.progressionMode || null,
      isOrbitalBody: body.isOrbitalBody === true,
      canBecomePlanet: body.canBecomePlanet === false ? false : (body.canBecomePlanet === true ? true : undefined),
      parentPlanetId: body.parentPlanetId || null,
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
      lastImpact: body.lastImpact ? {
        kind: body.lastImpact.kind || null,
        mode: body.lastImpact.mode || null,
        source: body.lastImpact.source || null,
        reason: body.lastImpact.reason || null,
        absorbedMass: toNumber(body.lastImpact.absorbedMass, 0),
        splitMass: body.lastImpact.splitMass ? Object.assign({}, body.lastImpact.splitMass) : null,
        orbiterMass: toNumber(body.lastImpact.orbiterMass, 0),
        createdFragments: toNumber(body.lastImpact.createdFragments, 0),
        createsDust: body.lastImpact.createsDust === true,
      } : null,
      dustKind: body.dustKind || null,
      collectible: body.collectible === true,
      isCosmicGrayDust: body.isCosmicGrayDust === true,
      collectProgressMs: toNumber(body.collectProgressMs, undefined),
      collectRequiredMs: toNumber(body.collectRequiredMs, undefined),
      collectDecayMs: toNumber(body.collectDecayMs, undefined),
      dustSequenceStep: toNumber(body.dustSequenceStep, undefined),
      reservoirPercentValue: toNumber(body.reservoirPercentValue, undefined),
      reservoirColorName: body.reservoirColorName || null,
      lastMergedAt: toNumber(body.lastMergedAt, undefined),
      age: toNumber(body.age, undefined),
      ttlMs: toNumber(body.ttlMs, undefined),
      createdAt: toNumber(body.createdAt, undefined),
      sourceImpactKind: body.sourceImpactKind || null,
      baseR: toNumber(body.baseR, toNumber(body.massOneRadius, undefined)),
      sourceColors: Array.isArray(body.sourceColors) ? body.sourceColors.slice() : undefined,
      collapseVisualScale: toNumber(body.collapseVisualScale, undefined),
      state: body.state || body.phase || (body.isCollapsing ? "collapsing" : null),
      parentId: body.parentId || body.parentRef?.id || body.parentRef?._id || null,
      orbit: body.orbitState || null,
      orbitState: body.orbitState || null,
      dustRings: mapDustRings(body),
      dustRingCount: mapDustRings(body).length,
      visual: {
        radius: viewRadius,
        glbScale: toNumber(body.visual?.glbScale ?? body.glbScale, undefined),
        dustRings: mapDustRings(body),
        dustRingCount: mapDustRings(body).length,
        isCollapsing: !!body.isCollapsing,
        absorbingIntoStarId: body.absorbingIntoStarId || null,
        parentKind: body.parentKind || null,
      },
      velocity: {
        vx: toNumber(body.vx, 0),
        vy: toNumber(body.vy, 0),
      },
      cosmicDustStopped: body.cosmicDustStopped === true,
      cosmicDustDragRatioLast: toNumber(body.cosmicDustDragRatioLast, undefined),
      flags: {
        dead: !!body._dead,
        active: !!body.active,
      },
    };
  }


  function normalizeDustColorName(value) {
    const upper = String(value || "").trim().toUpperCase();
    return ["RED", "YELLOW", "GREEN", "BLUE", "GRAY"].includes(upper) ? upper : null;
  }

  function mapDustRings(body) {
    return pickArray(body?.dustRings).map((ring, index) => ({
      id: ring?.id || `dust_ring:${index}`,
      colorName: normalizeDustColorName(ring?.colorName) || String(ring?.colorName || "UNKNOWN").toUpperCase(),
      mass: toNumber(Number(ring?.mass), 0),
      density: toNumber(Number(ring?.density), 0),
      radius: toNumber(Number(ring?.radius), 0),
      source: ring?.source || null,
      createdAt: toNumber(Number(ring?.createdAt), undefined),
      updatedAt: toNumber(Number(ring?.updatedAt), undefined),
    }));
  }

  function clamp01(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function mapHarmonicDust(dust, index) {
    if (!dust || typeof dust !== "object" || dust._dead) return null;
    const colorName = normalizeDustColorName(dust.colorName || dust.reservoirColorName) || String(dust.colorName || dust.reservoirColorName || "UNKNOWN").toUpperCase();
    const grayMixRatio = clamp01(dust.grayMixRatio);
    const collectRequiredMs = Math.max(1, toNumber(Number(dust.collectRequiredMs), 1));
    const collectProgressMs = Math.max(0, toNumber(Number(dust.collectProgressMs), 0));
    const collectRatio = clamp01(collectProgressMs / collectRequiredMs);
    const mass = toNumber(Number(dust.mass), undefined);
    const density = toNumber(Number(dust.density), undefined);
    const radius = toNumber(Number(dust.r ?? dust.radius), Math.max(1, Math.sqrt(Math.max(1, Number(mass) || 1))));
    const densityAlpha = Number.isFinite(Number(density)) ? Number(density) * 0.55 : 0.24;
    const massAlpha = Number.isFinite(Number(mass)) ? Math.min(0.22, Math.sqrt(Math.max(0, Number(mass))) / 70) : 0.12;
    const alpha = Math.max(0.18, Math.min(0.72, toNumber(Number(dust.visualAlpha), densityAlpha + massAlpha + 0.22)));
    return {
      id: dust.id || dust._id || `harmonic_dust:${index}`,
      type: "harmonic_dust",
      dustKind: "harmonic",
      colorName,
      originalColorName: normalizeDustColorName(dust.originalColorName) || normalizeDustColorName(dust.reservoirColorName) || (colorName !== "GRAY" ? colorName : null),
      grayExposureMs: toNumber(Number(dust.grayExposureMs), 0),
      grayRecoveryMs: toNumber(Number(dust.grayRecoveryMs), 0),
      lastGrayExposureAt: toNumber(Number(dust.lastGrayExposureAt), undefined),
      futureCosmicCandidate: dust.futureCosmicCandidate === true,
      x: toNumber(Number(dust.x), 0),
      y: toNumber(Number(dust.y), 0),
      z: toNumber(Number(dust.z), undefined),
      r: radius,
      mass,
      density,
      collectible: true,
      transformState: dust.transformState || (grayMixRatio > 0 ? (colorName === "GRAY" ? "gray_locked" : "recovering") : "harmonic"),
      grayMixRatio,
      collectProgressMs,
      collectRequiredMs,
      collectRatio,
      reservoirPercentValue: toNumber(Number(dust.reservoirPercentValue), 10),
      dustSequenceStep: toNumber(Number(dust.dustSequenceStep), 1),
      isBeingCollected: dust.isBeingCollected === true,
      visual: {
        model: "dust_cloud",
        alpha,
        particleCountHint: Math.max(8, Math.min(36, Math.round(radius * 1.4))),
        radius,
        colorName,
        originalColorName: normalizeDustColorName(dust.originalColorName) || normalizeDustColorName(dust.reservoirColorName) || (colorName !== "GRAY" ? colorName : null),
        grayMixRatio,
      },
    };
  }


  function positive(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  function buildPrgIndicator(World) {
    const sm = World?.spaceMechanics || {};
    const enabled = sm.prgIndicatorEnabled !== false;
    const style = {
      kind: "dashed_circle",
      opacity: Math.max(0.01, Math.min(1, positive(sm.prgIndicatorOpacity, 0.45))),
      lineWidth: positive(sm.prgIndicatorLineWidth, 1),
      dashCount: Math.max(1, Math.floor(positive(sm.prgIndicatorDashCount, 48))),
      color: typeof sm.prgIndicatorColor === "string" ? sm.prgIndicatorColor : "rgba(255,245,210,0.72)",
    };
    let field = null;
    if (window.HC?.HarmonicDust?.getPrgActionField) field = window.HC.HarmonicDust.getPrgActionField(World);
    if (!field) {
      const Input = window.Input;
      if (Input?.pointerDown && Number.isFinite(Number(Input.wx)) && Number.isFinite(Number(Input.wy))) {
        const View = (window.HC?.getView && window.HC.getView()) || window.View || {};
        const CE = window.CardEngine;
        const mul = CE?.state?.engineStats?.pointer_radius_mul || 1;
        const radius = positive(View.worldScale, 1) * positive(World?.pointerRadius, 0.2) * positive(mul, 1);
        field = { x: Number(Input.wx), y: Number(Input.wy), z: 0, radius, r: radius };
      }
    }
    const radius = positive(field?.radius ?? field?.r, 0);
    const active = enabled && !!field && radius > 0;
    return {
      active,
      x: active ? toNumber(Number(field.x), 0) : 0,
      y: active ? toNumber(Number(field.y), 0) : 0,
      z: active ? toNumber(Number(field.z), 0) : 0,
      radius: active ? radius : 0,
      mode: "prg",
      style,
    };
  }


  function mapCosmicDust(dust) {
    if (!dust || dust._dead) return null;
    const mass = toNumber(dust.mass, 0);
    const density = toNumber(dust.density, 1);
    const radius = toNumber(dust.r, 6);
    const alpha = Math.max(0.10, Math.min(0.42, 0.14 + Math.sqrt(Math.max(0, mass)) * 0.025 + density * 0.03));
    return {
      id: dust.id || dust._id || null,
      type: "cosmic_dust",
      dustKind: "cosmic",
      collectible: false,
      x: toNumber(dust.x, 0),
      y: toNumber(dust.y, 0),
      z: toNumber(dust.z, 0),
      r: radius,
      mass,
      density,
      state: dust.state || "cold",
      source: dust.source || null,
      sourceBodyIds: Array.isArray(dust.sourceBodyIds) ? dust.sourceBodyIds.slice() : [],
      ageMs: toNumber(dust.ageMs, 0),
      visual: { model: "cosmic_dust_cloud", colorName: "GRAY", alpha, radius, density },
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
    const invalidPlanetOriginSamples = [];
    const missingEvidenceSamples = [];
    const planetCountByOrigin = {};
    const planetCreationPathCounts = {};
    for (const planet of sourcePlanets) {
      if (!planet || planet._dead) continue;
      const origin = planetOriginKey(planet);
      planetCountByOrigin[origin] = (planetCountByOrigin[origin] || 0) + 1;
      planetCreationPathCounts[origin] = (planetCreationPathCounts[origin] || 0) + 1;
      if (origin === "invalid") {
        planet.invalidPlanetOrigin = true;
        planet.validProgressionOrigin = false;
        const missingEvent = {
          type: "planet_missing_creation_evidence",
          planetId: planet.id || planet._id || null,
          planetKind: getPlanetKind(planet),
          mass: toNumber(planet.mass, null),
          radius: toNumber(planet.r ?? planet.radius, null),
          detectedAtFrame: toNumber(World.frame, null),
          suspectedSource: planet.sourceFunction || null,
          sourcePath: planet.sourcePath || null,
          sourceFunction: planet.sourceFunction || null,
          allowedProgressionPath: planet.allowedProgressionPath === true,
        };
        invalidPlanetOriginSamples.push(Object.assign({ type: "invalid_planet_origin" }, missingEvent));
        missingEvidenceSamples.push(missingEvent);
      }
    }
    if (invalidPlanetOriginSamples.length) {
      World.invalidPlanetOriginSamples = invalidPlanetOriginSamples.slice(0, 8);
      World.invalidPlanetOriginCount = invalidPlanetOriginSamples.length;
      World.lastInvalidPlanetOriginEvent = invalidPlanetOriginSamples[invalidPlanetOriginSamples.length - 1];
      window.HC?.logEvent?.("world", "invalid_planet_origin", World.lastInvalidPlanetOriginEvent, { source: "WorldRenderSnapshot.build", snapshot: true });
    }
    if (missingEvidenceSamples.length) {
      World.planetMissingCreationEvidenceSamples = missingEvidenceSamples.slice(0, 8);
      World.planetMissingCreationEvidenceCount = missingEvidenceSamples.length;
      World.lastPlanetMissingCreationEvidenceEvent = missingEvidenceSamples[missingEvidenceSamples.length - 1];
      window.HC?.logEvent?.("world", "planet_missing_creation_evidence", World.lastPlanetMissingCreationEvidenceEvent, { source: "WorldRenderSnapshot.build", snapshot: true });
    }
    const snapshotPlanets = mapCollection(sourcePlanets, "planet");
    const rockyPlanetCount = sourcePlanets.filter((planet) => getPlanetKind(planet) === "rocky").length;
    const gasPlanetCount = sourcePlanets.filter((planet) => getPlanetKind(planet) === "gas").length;
    const snapshotMeteors = mapCollection(World.meteors, "meteor");
    const snapshotAsteroids = mapCollection(World.asteroids, "asteroid");
    const snapshotMoons = mapCollection(World.moons, "moon");
    const snapshotImpactFragments = mapCollection(World.impactFragments, "impactFragment");
    const snapshotCosmicDust = pickArray(World.cosmicDust).map(mapCosmicDust).filter(Boolean);
    const bodyCountByKind = {
      meteor: snapshotMeteors.length,
      asteroid: snapshotAsteroids.length,
      moon: snapshotMoons.length,
      planet: snapshotPlanets.length,
      cosmicDust: snapshotCosmicDust.length,
      harmonicDust: pickArray(World.harmonicDust).filter((dust) => dust && !dust._dead).length,
      impactFragment: snapshotImpactFragments.length,
    };

    const prgIndicator = buildPrgIndicator(World);
    const snapshotWorldForWarnings = { meteors: snapshotMeteors, asteroids: snapshotAsteroids, moons: snapshotMoons, planets: snapshotPlanets, impactFragments: snapshotImpactFragments };
    recordSnapshotWarnings(World, snapshotWorldForWarnings, toNumber(opts.nowMs, 0));

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
        meteors: snapshotMeteors,
        comets: mapCollection(World.comets, "comet"),
        asteroids: snapshotAsteroids,
        planets: snapshotPlanets,
        moons: snapshotMoons,
        dustClouds: mapCollection(World.dustClouds, "dustCloud"),
        dustParticles: mapCollection(World.dustParticles, "dustParticle"),
        impactFragments: snapshotImpactFragments,
        cosmicDust: snapshotCosmicDust,
        harmonicDust: pickArray(World.harmonicDust).map(mapHarmonicDust).filter(Boolean),
        harmonicDustSequence: World.harmonicDustSequence ? Object.assign({}, World.harmonicDustSequence) : null,
        harmonicDustReservoir: World.harmonicDustReservoir ? Object.assign({}, World.harmonicDustReservoir) : null,
        harmonicDustDeposits: Object.assign({}, World.harmonicDustDeposits || {}),
        harmonicDustReservoirVisual: World.harmonicDustReservoirVisual ? Object.assign({}, World.harmonicDustReservoirVisual) : (window.HC?.HarmonicDust?.getReservoirVisualState ? window.HC.HarmonicDust.getReservoirVisualState(World) : null),
        planetImpactCount: toNumber(World.planetImpactCount, 0),
        lastPlanetImpact: World.lastPlanetImpact ? Object.assign({}, World.lastPlanetImpact) : null,
        stars: mapCollection(World.stars, "star"),
        prg: World.prg || null,
        prgIndicator,
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
          activeImpactFragments: pickArray(World.impactFragments).filter((fragment) => fragment && !fragment._dead).length,
          impactFragmentsCount: pickArray(World.impactFragments).length,
          activeImpactFragmentsCount: pickArray(World.impactFragments).filter((fragment) => fragment && !fragment._dead).length,
          impactFragmentDescriptorsCount: pickArray(World.impactFragmentDescriptors).length,
          orbiterCandidateDescriptorCount: pickArray(World.orbiterCandidateDescriptors).length,
          cosmicDust: pickArray(World.cosmicDust).length,
          harmonicDust: pickArray(World.harmonicDust).length,
          harmonicDustGrayShifting: pickArray(World.harmonicDust).filter((dust) => dust && !dust._dead && dust.transformState === "gray_shifting").length,
          harmonicDustRecovering: pickArray(World.harmonicDust).filter((dust) => dust && !dust._dead && dust.transformState === "recovering").length,
          harmonicDustGrayLocked: pickArray(World.harmonicDust).filter((dust) => dust && !dust._dead && dust.transformState === "gray_locked").length,
          stars: pickArray(World.stars).length,
        },
        cosmicDustEnabled: World.spaceMechanics?.cosmicDustEnabled !== false,
        activeCollisionRulesProfile: World?.collisionRulesDiagnostics?.activeCollisionRulesProfile || World?.collisionRules?.profile || window.HC?.CollisionRules?._active?.profile || null,
        cosmicDustVisualEnabled: World.spaceMechanics?.cosmicDustVisualEnabled !== false,
        cosmicDustAffectsBodiesEnabled: World.spaceMechanics?.cosmicDustAffectsBodiesEnabled === true,
        cosmicDustAffectedBodiesCount: toNumber(World.cosmicDustAffectedBodiesCount, 0),
        cosmicDustStoppedBodiesCount: toNumber(World.cosmicDustStoppedBodiesCount, 0),
        lastCosmicDustInfluenceEvent: World.lastCosmicDustInfluenceEvent ? Object.assign({}, World.lastCosmicDustInfluenceEvent) : null,
        cosmicDustCount: pickArray(World.cosmicDust).filter((dust) => dust && !dust._dead).length,
        cosmicDustTotalMass: totalMass(World.cosmicDust),
        cosmicDustMaxDensity: pickArray(World.cosmicDust).reduce((max, dust) => Math.max(max, dust && !dust._dead ? toNumber(dust.density, 0) : 0), 0),
        lastCosmicDustEvent: World.lastCosmicDustEvent ? Object.assign({}, World.lastCosmicDustEvent) : null,
        lastMassSplitEvent: World.lastMassSplitEvent ? Object.assign({}, World.lastMassSplitEvent) : null,
        lastMassSplitEventCompact: compactMassSplitEvent(World.lastMassSplitEvent),
        lastLiveCollisionProbe: World.lastLiveCollisionProbe ? Object.assign({}, World.lastLiveCollisionProbe) : null,
        lastRadiusRefreshEvent: World.lastRadiusRefreshEvent ? Object.assign({}, World.lastRadiusRefreshEvent) : null,
        lastMoonRadiusRefreshEvent: World.lastMoonRadiusRefreshEvent ? Object.assign({}, World.lastMoonRadiusRefreshEvent) : null,
        lastRockyPlanetRadiusRefreshEvent: World.lastRockyPlanetRadiusRefreshEvent ? Object.assign({}, World.lastRockyPlanetRadiusRefreshEvent) : null,
        collisionRulesStatus: World?.collisionRulesDiagnostics?.collisionRulesStatus || null,
        collisionRulesSource: World?.collisionRulesDiagnostics?.collisionRulesSource || (World?.collisionRules ? "runtime_world" : null),
        collisionRulesProfile: World?.collisionRulesDiagnostics?.activeCollisionRulesProfile || World?.collisionRules?.profile || window.HC?.CollisionRules?._active?.profile || null,
        collisionRulesVersion: World?.collisionRulesDiagnostics?.collisionRulesVersion ?? World?.collisionRules?.version ?? window.HC?.CollisionRules?._active?.version ?? null,
        activeCollisionRulesVersion: World?.collisionRulesDiagnostics?.collisionRulesVersion ?? World?.collisionRules?.version ?? window.HC?.CollisionRules?._active?.version ?? null,
        collisionRulesValidCount: World?.collisionRulesDiagnostics?.collisionRulesValidCount ?? 0,
        collisionRulesInvalidCount: World?.collisionRulesDiagnostics?.collisionRulesInvalidCount ?? 0,
        collisionRulesLastAppliedAt: World?.collisionRulesDiagnostics?.collisionRulesLastAppliedAt || null,
        collisionRulesLastError: World?.collisionRulesDiagnostics?.collisionRulesLastError || World?.collisionRulesDiagnostics?.collisionRulesError || null,
        activeCollisionRulesSummary: window.HC?.CollisionRules?.activeCollisionRulesSummary ? window.HC.CollisionRules.activeCollisionRulesSummary(World) : [],
        progressionBlockedSameFrameCount: toNumber(World.progressionBlockedSameFrameCount, 0),
        planetToStarEnabled: World.spaceMechanics?.planetToStarEnabled === true,
        massRadiusContractVersion: window.HC?.SpaceBodies?.massRadiusContract?.version || null,
        firstMeteorMass: toNumber(Number(snapshotMeteors[0]?.mass), null),
        firstMeteorRadius: toNumber(Number(snapshotMeteors[0]?.radius ?? snapshotMeteors[0]?.r), null),
        firstAsteroidMass: toNumber(Number(snapshotAsteroids[0]?.mass), null),
        firstAsteroidRadius: toNumber(Number(snapshotAsteroids[0]?.radius ?? snapshotAsteroids[0]?.r), null),
        bodyCountByKind,
        bodyRadiusClampEnabled: World.spaceMechanics?.bodyRadiusClampEnabled !== false,
        lastBodyRadiusClampEvent: World.lastBodyRadiusClampEvent ? Object.assign({}, World.lastBodyRadiusClampEvent) : null,
        lastRadiusClampEvent: World.lastRadiusClampEvent ? Object.assign({}, World.lastRadiusClampEvent) : (World.lastBodyRadiusClampEvent ? Object.assign({}, World.lastBodyRadiusClampEvent) : null),
        radiusClampCount: toNumber(World.radiusClampCount, 0),
        moonRadiusClampCount: toNumber(World.moonRadiusClampCount, 0),
        rockyPlanetRadiusClampCount: toNumber(World.rockyPlanetRadiusClampCount, 0),
        moonRadiusContinuityWarnings: Array.isArray(World.moonRadiusContinuityWarnings) ? World.moonRadiusContinuityWarnings.slice(-8) : [],
        rockyPlanetRadiusContinuityWarnings: Array.isArray(World.rockyPlanetRadiusContinuityWarnings) ? World.rockyPlanetRadiusContinuityWarnings.slice(-8) : [],
        asteroidOverThresholdCount: toNumber(World.asteroidOverThresholdCount, 0),
        asteroidOverThresholdSamples: Array.isArray(World.asteroidOverThresholdSamples) ? World.asteroidOverThresholdSamples.slice(-8) : [],
        lastThresholdProgressionEvent: World.lastThresholdProgressionEvent ? Object.assign({}, World.lastThresholdProgressionEvent) : null,
        lastMoonToRockyPlanetThresholdEvent: World.lastMoonToRockyPlanetThresholdEvent ? Object.assign({}, World.lastMoonToRockyPlanetThresholdEvent) : null,
        lastMoonToRockyPlanetBlockedEvent: World.lastMoonToRockyPlanetBlockedEvent ? Object.assign({}, World.lastMoonToRockyPlanetBlockedEvent) : null,
        lastProgressionBlockedEvent: World.lastProgressionBlockedEvent ? Object.assign({}, World.lastProgressionBlockedEvent) : null,
        lastMoonCreatedEvent: World.lastMoonCreatedEvent ? Object.assign({}, World.lastMoonCreatedEvent) : null,
        asteroidTargetMassToMoon: toNumber(Number(World.spaceMechanics?.asteroidToMoonMassThreshold ?? 10), 10),
        moonTargetMassToRockyPlanet: toNumber(Number(World.spaceMechanics?.moonToRockyPlanetMassThreshold), 20),
        moonsCount: pickArray(World.moons).length,
        freeMoonsCount: pickArray(World.moons).filter((moon) => moon && !moon._dead && moon.progressionMode !== "orbital" && moon.isOrbitalBody !== true).length,
        orbitalMoonsCount: pickArray(World.moons).filter((moon) => moon && !moon._dead && (moon.progressionMode === "orbital" || moon.isOrbitalBody === true)).length,
        lastLegacyAsteroidToPlanetBlockedEvent: World.lastLegacyAsteroidToPlanetBlockedEvent ? Object.assign({}, World.lastLegacyAsteroidToPlanetBlockedEvent) : null,
        progressionChainSummary: {
          target: "meteor -> asteroid -> moon -> rocky planet",
          directAsteroidToRockyPlanetEnabled: false,
          moonCreated: !!World.lastMoonCreatedEvent,
          rockyPlanetCreatedFromMoon: World.lastRockyPlanetCreatedEvent?.sourcePath === "moon_to_rocky_planet",
          legacyAsteroidToPlanetBlockedCount: toNumber(World.legacyAsteroidToPlanetBlockedCount, 0),
        },
        planetCountByOrigin,
        planetCreationPathCounts,
        invalidPlanetOriginCount: invalidPlanetOriginSamples.length || toNumber(World.invalidPlanetOriginCount, 0),
        invalidPlanetOriginSamples: invalidPlanetOriginSamples.length ? invalidPlanetOriginSamples.slice(0, 8) : (Array.isArray(World.invalidPlanetOriginSamples) ? World.invalidPlanetOriginSamples.slice(-8) : []),
        lastPlanetCreatedEvent: World.lastPlanetCreatedEvent ? Object.assign({}, World.lastPlanetCreatedEvent) : null,
        lastPlanetMissingCreationEvidenceEvent: World.lastPlanetMissingCreationEvidenceEvent ? Object.assign({}, World.lastPlanetMissingCreationEvidenceEvent) : null,
        lastPlanetSpawnBlockedEvent: World.lastPlanetSpawnBlockedEvent ? Object.assign({}, World.lastPlanetSpawnBlockedEvent) : null,
        lastRockyPlanetCreatedEvent: World.lastRockyPlanetCreatedEvent ? Object.assign({}, World.lastRockyPlanetCreatedEvent) : null,
        lastRockyPlanetCreationFailedEvent: World.lastRockyPlanetCreationFailedEvent ? Object.assign({}, World.lastRockyPlanetCreationFailedEvent) : null,
        lastLegacyPlanetSpawnBlockedEvent: World.lastLegacyPlanetSpawnBlockedEvent ? Object.assign({}, World.lastLegacyPlanetSpawnBlockedEvent) : null,
        legacyPlanetSpawnBlockedCount: toNumber(World.legacyPlanetSpawnBlockedCount, 0),
        lastImpactFragmentDescriptor: World.lastImpactFragmentDescriptor ? Object.assign({}, World.lastImpactFragmentDescriptor) : null,
        impactFragmentDescriptorCount: pickArray(World.impactFragmentDescriptors).length,
        lastOrbiterCandidateDescriptor: World.lastOrbiterCandidateDescriptor ? Object.assign({}, World.lastOrbiterCandidateDescriptor) : null,
        orbiterCandidateDescriptorCount: pickArray(World.orbiterCandidateDescriptors).length,
        planetMissingCreationEvidenceCount: toNumber(World.planetMissingCreationEvidenceCount, 0),
        planetMissingCreationEvidenceSamples: Array.isArray(World.planetMissingCreationEvidenceSamples) ? World.planetMissingCreationEvidenceSamples.slice(-8) : [],
        lastMoonMeteorSplitEvent: World.lastMoonMeteorSplitEvent ? Object.assign({}, World.lastMoonMeteorSplitEvent) : null,
        lastMoonRenderRadiusEvidence: snapshotMoons[0] ? { type: "render_radius_evidence", bodyKind: "moon", bodyId: snapshotMoons[0].id, massRadiusContractRadius: snapshotMoons[0].massRadiusContractRadius, collisionRadius: snapshotMoons[0].collisionRadius, viewRadius: snapshotMoons[0].viewRadius, renderBodyRadius: snapshotMoons[0].renderBodyRadius, renderRingRadius: snapshotMoons[0].renderRingRadius, visualHaloRadius: snapshotMoons[0].visualHaloRadius, bodySurfaceRadius: snapshotMoons[0].bodySurfaceRadius, absorptionRadius: snapshotMoons[0].absorptionRadius, absorptionBufferRatio: snapshotMoons[0].absorptionBufferRatio, meshWorldRadius: snapshotMoons[0].meshWorldRadius, glbVisualScale: snapshotMoons[0].glbVisualScale } : null,
        lastRockyPlanetRenderRadiusEvidence: snapshotPlanets.find((p) => p && p.planetKind === "rocky") ? (() => { const rp = snapshotPlanets.find((p) => p && p.planetKind === "rocky"); return { type: "render_radius_evidence", bodyKind: "rocky_planet", bodyId: rp.id, massRadiusContractRadius: rp.massRadiusContractRadius, collisionRadius: rp.collisionRadius, viewRadius: rp.viewRadius, renderBodyRadius: rp.renderBodyRadius, renderRingRadius: rp.renderRingRadius, visualHaloRadius: rp.visualHaloRadius, bodySurfaceRadius: rp.bodySurfaceRadius, absorptionRadius: rp.absorptionRadius, absorptionBufferRatio: rp.absorptionBufferRatio, meshWorldRadius: rp.meshWorldRadius, glbVisualScale: rp.glbVisualScale }; })() : null,
        renderCollisionRadiusMismatchWarnings: Array.isArray(World.radiusMismatchWarnings) ? World.radiusMismatchWarnings.slice(-8) : [],
        radiusMismatchWarnings: Array.isArray(World.radiusMismatchWarnings) ? World.radiusMismatchWarnings.slice(-8) : [],
        radiusMismatchWarningsCount: Array.isArray(World.radiusMismatchWarnings) ? World.radiusMismatchWarnings.length : 0,
        bodyCountGrowthWarnings: Array.isArray(World.bodyCountGrowthWarnings) ? World.bodyCountGrowthWarnings.slice(-8) : [],
        massSplitConservationWarnings: Array.isArray(World.massSplitConservationWarnings) ? World.massSplitConservationWarnings.slice(-8) : [],
        harmonicDustManualCollectionEnabled: World.spaceMechanics?.harmonicDustManualCollectionEnabled !== false,
        harmonicDustAutoTestCollectionEnabled: World.spaceMechanics?.harmonicDustAutoTestCollectionEnabled === true,
        harmonicDustElasticGrayEnabled: World.spaceMechanics?.harmonicDustElasticGrayEnabled !== false,
        lastGrayShiftEvent: World.lastGrayShiftEvent ? Object.assign({}, World.lastGrayShiftEvent) : null,
        averageGrayMixRatio: (() => { const dust = pickArray(World.harmonicDust).filter((d) => d && !d._dead); return dust.length ? dust.reduce((sum, d) => sum + clamp01(d.grayMixRatio), 0) / dust.length : 0; })(),
        maxGrayMixRatio: pickArray(World.harmonicDust).reduce((max, d) => Math.max(max, d && !d._dead ? clamp01(d.grayMixRatio) : 0), 0),
        harmonicDustCount: pickArray(World.harmonicDust).filter((dust) => dust && !dust._dead).length,
        harmonicDustBodyTransformEnabled: World.spaceMechanics?.harmonicDustBodyTransformEnabled !== false,
        harmonicDustAsteroidGrayEnabled: World.spaceMechanics?.harmonicDustAsteroidGrayEnabled !== false,
        harmonicDustMoonRingAbsorbEnabled: World.spaceMechanics?.harmonicDustMoonRingAbsorbEnabled !== false,
        harmonicDustGrayMixedCount: pickArray(World.harmonicDust).filter((dust) => dust && !dust._dead && (dust.colorName === "GRAY" || Number(dust.grayMixRatio) > 0)).length,
        moonsWithDustRingsCount: pickArray(World.moons).filter((moon) => Array.isArray(moon?.dustRings) && moon.dustRings.length > 0).length,
        lastDustTransformEvent: World.lastDustTransformEvent ? Object.assign({}, World.lastDustTransformEvent) : null,
        harmonicDustBeingCollectedCount: pickArray(World.harmonicDust).filter((dust) => dust && !dust._dead && dust.isBeingCollected === true).length,
        collectibleDustCount: pickArray(World.harmonicDust).filter((dust) => dust && !dust._dead && dust.collectible === true).length,
        harmonicDustMassByColor: pickArray(World.harmonicDust).reduce((acc, dust) => {
          if (!dust || dust._dead) return acc;
          const key = String(dust.colorName || "UNKNOWN").toUpperCase();
          acc[key] = (acc[key] || 0) + (Number.isFinite(Number(dust.mass)) ? Number(dust.mass) : 0);
          return acc;
        }, {}),
        harmonicDustPercentByColor: pickArray(World.harmonicDust).reduce((acc, dust) => {
          if (!dust || dust._dead) return acc;
          const key = String(dust.reservoirColorName || dust.colorName || "UNKNOWN").toUpperCase();
          acc[key] = (acc[key] || 0) + (Number.isFinite(Number(dust.reservoirPercentValue)) ? Number(dust.reservoirPercentValue) : 0);
          return acc;
        }, {}),
        harmonicDustSequence: World.harmonicDustSequence ? Object.assign({}, World.harmonicDustSequence) : null,
        harmonicDustReservoir: World.harmonicDustReservoir ? Object.assign({}, World.harmonicDustReservoir) : null,
        harmonicDustDeposits: Object.assign({}, World.harmonicDustDeposits || {}),
        harmonicDustReservoirVisual: World.harmonicDustReservoirVisual ? Object.assign({}, World.harmonicDustReservoirVisual) : (window.HC?.HarmonicDust?.getReservoirVisualState ? window.HC.HarmonicDust.getReservoirVisualState(World) : null),
        harmonicDustCollected: Object.assign({}, World.harmonicDustCollected || {}),
        prgIndicatorActive: prgIndicator.active,
        prgIndicatorRadius: prgIndicator.radius,
        prgIndicatorEnabled: World.spaceMechanics?.prgIndicatorEnabled !== false,
        planetImpactCount: toNumber(World.planetImpactCount, 0),
        lastPlanetImpact: World.lastPlanetImpact ? Object.assign({}, World.lastPlanetImpact) : null,
        cameraAvailability: {
          hasCamera: !!opts.Camera,
          hasView: !!opts.View,
          hasWorldBounds: !!worldBounds,
          worldBoundsSource,
        },
        hasWorldBounds: !!worldBounds,
      },
    };

    // Compact physics alias for filtered debug exports. It deliberately reuses
    // existing diagnostics data and does not change mechanics or collision rules.
    snapshot.physics = Object.assign({
      worldCounts: snapshot.diagnostics?.objectCounts || null,
      thresholds: {
        asteroidToMoon: { current: toNumber(Number(World.spaceMechanics?.asteroidToMoonMassThreshold ?? 10), 10), source: "spaceMechanics" },
        moonToRockyPlanet: { current: toNumber(Number(World.spaceMechanics?.moonToRockyPlanetMassThreshold), 20), source: "spaceMechanics" },
      },
    }, snapshot.diagnostics || {});

    return snapshot;
  }

  window.HC.WorldRenderSnapshot = {
    build,
  };
})();
