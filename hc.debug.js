// HC debug/session foundation
(function () {
  window.HC = window.HC || {};

  const EVENT_TYPES = Object.freeze({
    SESSION_STARTED: "session.started",
    SESSION_CONFIG_APPLIED: "session.config_applied",
    SESSION_ENDED: "session.ended",
    SESSION_ABORTED: "session.aborted",

    WORLD_OBJECT_SPAWNED: "world.object_spawned",
    WORLD_OBJECT_DESPAWNED: "world.object_despawned",
    WORLD_OBJECT_TRANSFORMED: "world.object_transformed",
    WORLD_THRESHOLD_PROGRESS: "world.threshold_progress",
    WORLD_THRESHOLD_REACHED: "world.threshold_reached",
    WORLD_TRANSFORMATION_STARTED: "world.transformation_started",
    WORLD_TRANSFORMATION_COMPLETED: "world.transformation_completed",
    WORLD_TRANSFORMATION_BLOCKED: "world.transformation_blocked",
    WORLD_CLEANUP_STARTED: "world.cleanup_started",
    WORLD_CLEANUP_COMPLETED: "world.cleanup_completed",

    SEQUENCE_STARTED: "sequence.started",
    SEQUENCE_DIRECTION_LOCKED: "sequence.direction_locked",
    SEQUENCE_EXPECTED_COLOR_CHANGED: "sequence.expected_color_changed",
    SEQUENCE_HIT_REGISTERED: "sequence.hit_registered",
    SEQUENCE_HIT_REJECTED: "sequence.hit_rejected",
    SEQUENCE_STEP_STARTED: "sequence.step_started",
    SEQUENCE_STEP_PROGRESS: "sequence.step_progress",
    SEQUENCE_STEP_COMPLETED: "sequence.step_completed",
    SEQUENCE_FAIL_DETECTED: "sequence.fail_detected",
    SEQUENCE_FAIL_RESOLVED: "sequence.fail_resolved",
    SEQUENCE_FAILED: "sequence.failed",
    SEQUENCE_CASHOUT_STARTED: "sequence.cashout_started",
    SEQUENCE_CASHOUT_COMPLETED: "sequence.cashout_completed",
    SEQUENCE_CASHOUT: "sequence.cashout",
    SEQUENCE_RESET: "sequence.reset",
    SEQUENCE_DECISION_WINDOW_OPENED: "sequence.decision_window_opened",
    SEQUENCE_DECISION_WINDOW_TIMEOUT: "sequence.decision_window_timeout",
    SEQUENCE_DECISION_WINDOW_CLOSED: "sequence.decision_window_closed",
    SEQUENCE_A_LOOP_ENTERED: "sequence.a_loop_entered",
    SEQUENCE_CONTINUATION_RESOLVED: "sequence.continuation_resolved",
    SEQUENCE_RESET_TO_IDLE: "sequence.reset_to_idle",
    SEQUENCE_LOOP_AA_STARTED: "sequence.loop_aa_started",
    SEQUENCE_LOOP_AA_COMPLETED: "sequence.loop_aa_completed",
    SEQUENCE_LOOP_AAA_STARTED: "sequence.loop_aaa_started",
    SEQUENCE_LOOP_AAA_COMPLETED: "sequence.loop_aaa_completed",
    SEQUENCE_DS_GRANTED: "sequence.ds_granted",
    SEQUENCE_R1_ACTIVATED: "sequence.r1_activated",

    CARD_CREATED: "card.created",
    CARD_COLLECTED: "card.collected",
    CARD_ACTIVATED: "card.activated",

    RP_GAINED: "rp.gained",
    RP_SPENT: "rp.spent",
    RP_SET_INITIAL: "rp.set_initial",

    DEBUG_OVERRIDE_APPLIED: "debug.override_applied",
    DEBUG_CONFIG_SECTION_APPLIED: "debug.config_section_applied",
    DEBUG_FLUSH: "debug.flush",
    DEBUG_SNAPSHOT_WRITTEN: "debug.snapshot_written",
    DEBUG_ERROR: "debug.error",
  });

  const DEFAULT_INITIAL_CARDS = Object.freeze({
    R1_DR_RED: 0,
    R1_DR_YELLOW: 0,
    R1_DR_GREEN: 0,
    R1_DR_BLUE: 0,
    DS_DR_RED: 0,
    DS_DR_YELLOW: 0,
    DS_DR_GREEN: 0,
    DS_DR_BLUE: 0,
    R1_SDR_RED: 0,
    R1_PDR_RED: 0,
    R1_SDR_YELLOW: 0,
    R1_PDR_YELLOW: 0,
    R1_SDR_GREEN: 0,
    R1_PDR_GREEN: 0,
    R1_SDR_BLUE: 0,
    R1_PDR_BLUE: 0,
  });

  const DEFAULT_INITIAL_WORLD_STATE = Object.freeze({
    asteroidCount: 0,
    rockyPlanetCount: 0,
    gasPlanetCount: 0,
    starCount: 0,
  });

  const CARD_BOOTSTRAP_MAP = Object.freeze({
    R1_DR_RED: { kind: "R1", tier: "DR", colorA: "red" },
    R1_DR_YELLOW: { kind: "R1", tier: "DR", colorA: "yellow" },
    R1_DR_GREEN: { kind: "R1", tier: "DR", colorA: "green" },
    R1_DR_BLUE: { kind: "R1", tier: "DR", colorA: "blue" },
    DS_DR_RED: { kind: "DS", tier: "DR", colorA: "red" },
    DS_DR_YELLOW: { kind: "DS", tier: "DR", colorA: "yellow" },
    DS_DR_GREEN: { kind: "DS", tier: "DR", colorA: "green" },
    DS_DR_BLUE: { kind: "DS", tier: "DR", colorA: "blue" },
    R1_SDR_RED: { kind: "R1", tier: "sDR", colorA: "red" },
    R1_PDR_RED: { kind: "R1", tier: "pDR", colorA: "red" },
    R1_SDR_YELLOW: { kind: "R1", tier: "sDR", colorA: "yellow" },
    R1_PDR_YELLOW: { kind: "R1", tier: "pDR", colorA: "yellow" },
    R1_SDR_GREEN: { kind: "R1", tier: "sDR", colorA: "green" },
    R1_PDR_GREEN: { kind: "R1", tier: "pDR", colorA: "green" },
    R1_SDR_BLUE: { kind: "R1", tier: "sDR", colorA: "blue" },
    R1_PDR_BLUE: { kind: "R1", tier: "pDR", colorA: "blue" },
  });

  const SCENARIO_PRESETS = Object.freeze({
    r1_success: Object.freeze({
      id: "r1_success",
      label: "R1 success",
      scenarioLabel: "r1_success",
      config: {
        initialRP: 0,
        initialCards: { R1_DR_RED: 1, R1_DR_GREEN: 1, R1_DR_BLUE: 1, R1_DR_YELLOW: 1 },
        initialWorldState: { asteroidCount: 2, rockyPlanetCount: 0, gasPlanetCount: 0, starCount: 0 },
      },
    }),
    sequence_fail: Object.freeze({
      id: "sequence_fail",
      label: "Sequence fail",
      scenarioLabel: "sequence_fail",
      config: {
        initialRP: 0,
        initialCards: { R1_DR_RED: 2, R1_DR_GREEN: 2, R1_DR_BLUE: 2, R1_DR_YELLOW: 2 },
        initialWorldState: { asteroidCount: 1, rockyPlanetCount: 0, gasPlanetCount: 0, starCount: 0 },
      },
    }),
    cashout_r2: Object.freeze({
      id: "cashout_r2",
      label: "Cash-out R2",
      scenarioLabel: "cashout_r2",
      config: {
        initialRP: 24,
        initialCards: { R1_DR_RED: 4, R1_DR_GREEN: 4, R1_DR_BLUE: 4, R1_DR_YELLOW: 4 },
        initialWorldState: { asteroidCount: 4, rockyPlanetCount: 1, gasPlanetCount: 0, starCount: 0 },
      },
    }),
    aa_aaa_ds: Object.freeze({
      id: "aa_aaa_ds",
      label: "AA / AAA / DS",
      scenarioLabel: "aa_aaa_ds",
      config: {
        initialRP: 10,
        initialCards: { R1_DR_RED: 6, DS_DR_RED: 2, R1_SDR_RED: 1, R1_PDR_RED: 1 },
        initialWorldState: { asteroidCount: 2, rockyPlanetCount: 0, gasPlanetCount: 0, starCount: 0 },
      },
    }),
    asteroid_to_planet: Object.freeze({
      id: "asteroid_to_planet",
      label: "Asteroid -> Planet",
      scenarioLabel: "asteroid_to_planet",
      config: {
        initialRP: 6,
        initialCards: { R1_DR_RED: 2, R1_DR_BLUE: 2 },
        initialWorldState: { asteroidCount: 5, rockyPlanetCount: 0, gasPlanetCount: 0, starCount: 0 },
        thresholdOverrides: { asteroidToPlanet: 3, planetToStar: null },
      },
    }),
    planet_to_star: Object.freeze({
      id: "planet_to_star",
      label: "Planet -> Star",
      scenarioLabel: "planet_to_star",
      config: {
        initialRP: 12,
        initialCards: { R1_DR_RED: 3, R1_DR_BLUE: 3, R1_DR_GREEN: 3, R1_DR_YELLOW: 3 },
        initialWorldState: { asteroidCount: 0, rockyPlanetCount: 2, gasPlanetCount: 2, starCount: 0 },
        thresholdOverrides: { asteroidToPlanet: null, planetToStar: 4 },
      },
    }),
    normal_regression: Object.freeze({
      id: "normal_regression",
      label: "Normal regression",
      scenarioLabel: "normal_regression",
      config: createDebugConfig("normal"),
    }),
  });

  function clampInt(value, fallback = 0) {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n) || n < 0) return fallback;
    return n;
  }

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeParseJsonl(raw) {
    if (!raw) return [];
    return String(raw)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch (_e) {
          return null;
        }
      })
      .filter(Boolean);
  }

  function createDefaultPrgFrameProbeConfig() {
    return {
      enabled: false,
      mode: "sourceCutRectFitProbe",
      goldTint: true,
      showOverlay: false,
      showBounds: false,
      showAnchors: false,
      showLabels: false,
      showMetadata: false,
    };
  }

  function createDebugConfig(mode, partial = {}) {
    const isDebug = mode === "debug";
    const initialCards = { ...DEFAULT_INITIAL_CARDS, ...(partial.initialCards || {}) };
    const initialWorldState = { ...DEFAULT_INITIAL_WORLD_STATE, ...(partial.initialWorldState || {}) };
    const defaultProbe = createDefaultPrgFrameProbeConfig();
    const visualCfg = partial.visual || {};
    const prgProbePartial = visualCfg.prgFrameProbe || {};
    const meteorGlbVisualScale = Number(visualCfg.meteorGlbVisualScale);
    const meteorGlbDepthScale = Number(visualCfg.meteorGlbDepthScale);
    const cameraModel = ["absolute_bounds", "stage_normalized"].includes(String(visualCfg.cameraModel)) ? String(visualCfg.cameraModel) : "stage_normalized";
    const materialCfg = visualCfg.threeMaterials || {};
    const lightsCfg = visualCfg.threeLights || {};
    return {
      enabled: isDebug,
      mode: isDebug ? "debug" : "normal",
      scenarioLabel: String(partial.scenarioLabel || "manual_session"),
      loggingEnabled: isDebug,
      batchSizeEvents: clampInt(partial.batchSizeEvents, 20),
      flushIntervalMs: clampInt(partial.flushIntervalMs, 1000),
      includeSnapshots: partial.includeSnapshots !== false,
      logFileStrategy: "single_session_file",
      initialRP: clampInt(partial.initialRP, 0),
      initialCards,
      initialWorldState: {
        asteroidCount: clampInt(initialWorldState.asteroidCount, 0),
        rockyPlanetCount: clampInt(initialWorldState.rockyPlanetCount, 0),
        gasPlanetCount: clampInt(initialWorldState.gasPlanetCount, 0),
        starCount: clampInt(initialWorldState.starCount, 0),
      },
      thresholdOverrides: {
        asteroidToPlanet: partial.thresholdOverrides?.asteroidToPlanet == null ? null : clampInt(partial.thresholdOverrides.asteroidToPlanet, 0),
        planetToStar: partial.thresholdOverrides?.planetToStar == null ? null : clampInt(partial.thresholdOverrides.planetToStar, 0),
      },
      visual: {
        meteorGlbVisualScale: Number.isFinite(meteorGlbVisualScale) ? Math.max(0.25, Math.min(4.0, meteorGlbVisualScale)) : 1.0,
        meteorGlbDepthScale: Number.isFinite(meteorGlbDepthScale) ? Math.max(0.25, Math.min(3.0, meteorGlbDepthScale)) : 1.0,
        cameraModel,
        threeMaterials: {
          enabled: materialCfg.enabled === true,
          envIntensity: Number.isFinite(Number(materialCfg.envIntensity)) ? Math.max(0, Math.min(1.5, Number(materialCfg.envIntensity))) : 0.38,
          toneExposure: Number.isFinite(Number(materialCfg.toneExposure)) ? Math.max(0.5, Math.min(1.8, Number(materialCfg.toneExposure))) : 1.0,
          forceAuditLog: materialCfg.forceAuditLog === true,
          materialMode: ["imported", "standard_test", "normal_debug", "clay_lit", "diagnostic_unlit"].includes(String(materialCfg.materialMode)) ? String(materialCfg.materialMode) : "imported",
        },
        threeLights: {
          enabled: lightsCfg.enabled !== false,
          pointIntensity: Number.isFinite(Number(lightsCfg.pointIntensity)) ? Math.max(0, Math.min(2.5, Number(lightsCfg.pointIntensity))) : 0.9,
          distanceMultiplier: Number.isFinite(Number(lightsCfg.distanceMultiplier)) ? Math.max(0.25, Math.min(4.0, Number(lightsCfg.distanceMultiplier))) : 1.55,
          decay: Number.isFinite(Number(lightsCfg.decay)) ? Math.max(0, Math.min(3.0, Number(lightsCfg.decay))) : 1.35,
          zOffsetMultiplier: Number.isFinite(Number(lightsCfg.zOffsetMultiplier)) ? Math.max(0.05, Math.min(2.0, Number(lightsCfg.zOffsetMultiplier))) : 0.45,
          ambientIntensity: Number.isFinite(Number(lightsCfg.ambientIntensity)) ? Math.max(0, Math.min(0.75, Number(lightsCfg.ambientIntensity))) : 0,
          ambientIsolate: lightsCfg.ambientIsolate === true,
          debugKeyLightEnabled: lightsCfg.debugKeyLightEnabled === true,
          debugKeyLightIntensity: Number.isFinite(Number(lightsCfg.debugKeyLightIntensity)) ? Math.max(0, Math.min(5.0, Number(lightsCfg.debugKeyLightIntensity))) : 2.2,
          debugRimLightEnabled: lightsCfg.debugRimLightEnabled === true,
          debugRimLightIntensity: Number.isFinite(Number(lightsCfg.debugRimLightIntensity)) ? Math.max(0, Math.min(2.5, Number(lightsCfg.debugRimLightIntensity))) : 0.65,
          forceHeadlightEnabled: lightsCfg.forceHeadlightEnabled === true,
          forceHeadlightIntensity: Number.isFinite(Number(lightsCfg.forceHeadlightIntensity)) ? Math.max(0, Math.min(8.0, Number(lightsCfg.forceHeadlightIntensity))) : 4.5,
          legacyCornerLightsEnabled: lightsCfg.legacyCornerLightsEnabled === true,
          mainStageSpotEnabled: (lightsCfg.mainStageSpotEnabled ?? lightsCfg.debugSpotLightEnabled ?? true) !== false,
          mainStageSpotIntensity: Number.isFinite(Number(lightsCfg.mainStageSpotIntensity ?? lightsCfg.debugSpotLightIntensity)) ? Math.max(0, Math.min(25.0, Number(lightsCfg.mainStageSpotIntensity ?? lightsCfg.debugSpotLightIntensity))) : 6.5,
          mainStageSpotAngle: Number.isFinite(Number(lightsCfg.mainStageSpotAngle ?? lightsCfg.debugSpotLightAngle)) ? Math.max(Math.PI / 24, Math.min(Math.PI / 2, Number(lightsCfg.mainStageSpotAngle ?? lightsCfg.debugSpotLightAngle))) : Math.PI / 2.8,
          mainStageSpotPenumbra: Number.isFinite(Number(lightsCfg.mainStageSpotPenumbra ?? lightsCfg.debugSpotLightPenumbra)) ? Math.max(0, Math.min(1, Number(lightsCfg.mainStageSpotPenumbra ?? lightsCfg.debugSpotLightPenumbra))) : 0.72,
          mainStageSpotDistance: Number.isFinite(Number(lightsCfg.mainStageSpotDistance ?? lightsCfg.debugSpotLightDistance)) ? Math.max(0, Math.min(100000, Number(lightsCfg.mainStageSpotDistance ?? lightsCfg.debugSpotLightDistance))) : 0,
          mainStageSpotDecay: Number.isFinite(Number(lightsCfg.mainStageSpotDecay ?? lightsCfg.debugSpotLightDecay)) ? Math.max(0, Math.min(3, Number(lightsCfg.mainStageSpotDecay ?? lightsCfg.debugSpotLightDecay))) : 0,
          mainStageSpotXOffset: Number.isFinite(Number(lightsCfg.mainStageSpotXOffset)) ? Math.max(-2, Math.min(2, Number(lightsCfg.mainStageSpotXOffset))) : -0.65,
          mainStageSpotYOffset: Number.isFinite(Number(lightsCfg.mainStageSpotYOffset)) ? Math.max(-2, Math.min(2, Number(lightsCfg.mainStageSpotYOffset))) : -0.55,
          mainStageSpotZHeight: Number.isFinite(Number(lightsCfg.mainStageSpotZHeight)) ? Math.max(0.25, Math.min(4, Number(lightsCfg.mainStageSpotZHeight))) : 1.55,
          mainStageSpotTargetMode: ["center", "sampleObject"].includes(String(lightsCfg.mainStageSpotTargetMode ?? lightsCfg.debugSpotLightTargetMode)) ? String(lightsCfg.mainStageSpotTargetMode ?? lightsCfg.debugSpotLightTargetMode) : "center",
          showLightHelpers: lightsCfg.showLightHelpers === true,
        },
        prgFrameProbe: {
          enabled: prgProbePartial.enabled === true,
          mode: typeof prgProbePartial.mode === "string" ? prgProbePartial.mode : defaultProbe.mode,
          goldTint: prgProbePartial.goldTint !== false,
          showOverlay: prgProbePartial.showOverlay === true,
          showBounds: prgProbePartial.showBounds === true,
          showAnchors: prgProbePartial.showAnchors === true,
          showLabels: prgProbePartial.showLabels === true,
          showMetadata: prgProbePartial.showMetadata === true,
        },
      },
    };
  }


  function cloneEvidenceValue(value) {
    if (value == null) return value;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (_e) {
      return null;
    }
  }

  function pickThreeLightSetting(settings, key, fallback = null) {
    const value = settings && Object.prototype.hasOwnProperty.call(settings, key) ? settings[key] : fallback;
    return value == null ? fallback : value;
  }

  function buildThreeRendererEvidenceVisual() {
    const getDiagnostics = window.HC?.WorldRenderer?.getDiagnostics;
    const diagnostics = typeof getDiagnostics === "function" ? cloneEvidenceValue(getDiagnostics()) : null;
    const fallbackLights = window.HC?.WorldRenderer?.getThreeLightsSettings?.() || window.HC?.WorldRendererDebug?.threeLights || null;
    const fallbackMaterials = window.HC?.WorldRenderer?.getThreeMaterialSettings?.() || window.HC?.WorldRendererDebug?.materials || null;
    const lights = diagnostics?.threeLights || fallbackLights || {};
    const materials = diagnostics?.threeMaterialSettings || fallbackMaterials || {};
    const materialOverride = diagnostics?.threeMaterialOverrideStatus || {};
    const lightDiagnostics = diagnostics?.threeLightDiagnostics || null;
    const helper = diagnostics?.threeLightHelpers || {};
    const activeMaterialMode = materials.materialMode || materialOverride.currentMaterialMode || "imported";
    const materialAuditEntries = Array.isArray(diagnostics?.glbMaterialAudit)
      ? diagnostics.glbMaterialAudit.slice(-8).map((entry) => ({
          asset: entry?.asset || null,
          assetName: entry?.assetName || null,
          meshCount: entry?.meshCount ?? null,
          materialCount: entry?.materialCount ?? null,
          importedPbrCount: entry?.importedPbrCount ?? null,
          fallbackCount: entry?.fallbackCount ?? null,
          lightReactiveCount: entry?.lightReactiveCount ?? null,
          hasMaps: entry?.hasMaps === true,
          hasNormalMaps: entry?.hasNormalMaps === true,
          hasMetalness: entry?.hasMetalness === true,
          materials: Array.isArray(entry?.materials) ? entry.materials.slice(0, 6).map((material) => ({
            meshName: material?.meshName || null,
            materialName: material?.name || null,
            source: material?.source || null,
            type: material?.type || null,
            reactsToLight: material?.reactsToLight === true,
            hasMaps: !!(material?.map || material?.metalnessMap || material?.roughnessMap || material?.emissiveMap || material?.aoMap),
            hasNormalMap: material?.normalMap === true,
            metalness: material?.metalness ?? null,
            roughness: material?.roughness ?? null,
          })) : [],
        }))
      : [];
    return {
      renderer: {
        requested: diagnostics?.requestedMode || null,
        effective: diagnostics?.effectiveMode || diagnostics?.mode || null,
        fallback: diagnostics ? { used: diagnostics.fallbackUsed === true, reason: diagnostics.fallbackReason || null } : null,
      },
      dependency: {
        hasThreeImplementation: diagnostics?.hasThreeImplementation === true,
        hasThreeDependency: diagnostics?.hasThreeDependency === true,
        source: diagnostics?.threeDependencySource || diagnostics?.threeSource || null,
        ready: diagnostics?.threeReady === true,
        loadStatus: diagnostics?.threeLoadStatus || null,
        loadError: diagnostics?.threeLoadError || null,
      },
      activeMaterialMode,
      materialMode: activeMaterialMode,
      threeMaterials: {
        enabled: materials.enabled === true,
        materialMode: activeMaterialMode,
        envIntensity: materials.envIntensity ?? null,
        toneExposure: materials.toneExposure ?? null,
        forceAuditLog: materials.forceAuditLog === true,
      },
      envIntensity: materials.envIntensity ?? null,
      toneExposure: materials.toneExposure ?? null,
      forceAuditLog: materials.forceAuditLog === true,
      meteorGlbDepthScale: diagnostics?.meteorGlbDepthScale ?? null,
      firstGlbScale: diagnostics?.firstMeteorMesh?.scale || null,
      scaleUniform: diagnostics?.firstMeteorMesh?.scaleUniform ?? null,
      zScaleRatio: diagnostics?.firstMeteorMesh?.zScaleRatio ?? null,
      localBoundingBox: diagnostics?.firstMeteorMesh?.localBoundingBox || null,
      worldBoundingBox: diagnostics?.firstMeteorMesh?.worldBoundingBox || null,
      worldSize: diagnostics?.firstMeteorMesh?.worldSize || null,
      objectDepthVisibleEstimate: diagnostics?.firstMeteorMesh?.objectDepthVisibleEstimate ?? null,
      glbScaleWarning: diagnostics?.glbScaleWarning || diagnostics?.firstMeteorMesh?.warning || null,
      cameraModel: diagnostics?.cameraModel || diagnostics?.threeCameraModel || null,
      stageModelEnabled: diagnostics?.stageModelEnabled === true,
      ambientIsolate: lights.ambientIsolate === true,
      ambientEffectiveIntensity: lightDiagnostics?.effectiveAmbientIntensity ?? null,
      threeLights: {
        enabled: lights.enabled === true,
        cornerLightIntensity: pickThreeLightSetting(lights, "pointIntensity"),
        lightRangeXView: pickThreeLightSetting(lights, "distanceMultiplier"),
        lightZXHeight: pickThreeLightSetting(lights, "zOffsetMultiplier"),
        decay: pickThreeLightSetting(lights, "decay"),
        ambientIntensity: pickThreeLightSetting(lights, "ambientIntensity"),
        ambientIsolate: lights.ambientIsolate === true,
        debugKeyLightEnabled: lights.debugKeyLightEnabled === true,
        debugKeyLightIntensity: pickThreeLightSetting(lights, "debugKeyLightIntensity"),
        debugRimLightEnabled: lights.debugRimLightEnabled === true,
        debugRimLightIntensity: pickThreeLightSetting(lights, "debugRimLightIntensity"),
        forceHeadlightEnabled: lights.forceHeadlightEnabled === true,
        forceHeadlightIntensity: pickThreeLightSetting(lights, "forceHeadlightIntensity"),
        legacyCornerLightsEnabled: lights.legacyCornerLightsEnabled === true,
        legacyCornerLightsAffectScene: lightDiagnostics?.legacyCornerLightsAffectScene === true,
        mainStageSpotEnabled: lights.mainStageSpotEnabled === true,
        mainStageSpotIntensity: pickThreeLightSetting(lights, "mainStageSpotIntensity"),
        mainStageSpotAngle: pickThreeLightSetting(lights, "mainStageSpotAngle"),
        mainStageSpotPenumbra: pickThreeLightSetting(lights, "mainStageSpotPenumbra"),
        mainStageSpotDistance: pickThreeLightSetting(lights, "mainStageSpotDistance"),
        mainStageSpotDecay: pickThreeLightSetting(lights, "mainStageSpotDecay"),
        mainStageSpotTargetMode: pickThreeLightSetting(lights, "mainStageSpotTargetMode", "center"),
        showLightHelpers: lights.showLightHelpers === true,
      },
      debugKeyLight: {
        enabled: lights.debugKeyLightEnabled === true,
        intensity: pickThreeLightSetting(lights, "debugKeyLightIntensity"),
        position: lightDiagnostics?.debugKeyLight?.position || null,
      },
      debugRimLight: {
        enabled: lights.debugRimLightEnabled === true,
        intensity: pickThreeLightSetting(lights, "debugRimLightIntensity"),
        position: lightDiagnostics?.debugRimLight?.position || null,
      },
      forceHeadlight: {
        enabled: lights.forceHeadlightEnabled === true,
        intensity: pickThreeLightSetting(lights, "forceHeadlightIntensity"),
        position: lightDiagnostics?.forceHeadlight?.position || null,
      },
      mainStageSpot: {
        enabled: lights.mainStageSpotEnabled === true,
        intensity: pickThreeLightSetting(lights, "mainStageSpotIntensity"),
        angle: pickThreeLightSetting(lights, "mainStageSpotAngle"),
        penumbra: pickThreeLightSetting(lights, "mainStageSpotPenumbra"),
        distance: pickThreeLightSetting(lights, "mainStageSpotDistance"),
        decay: pickThreeLightSetting(lights, "mainStageSpotDecay"),
        targetMode: pickThreeLightSetting(lights, "mainStageSpotTargetMode", "center"),
        position: diagnostics?.mainStageSpot?.position || lightDiagnostics?.mainStageSpot?.position || null,
        targetPosition: diagnostics?.mainStageSpot?.targetPosition || lightDiagnostics?.mainStageSpot?.targetPosition || null,
        helperVisible: diagnostics?.mainStageSpot?.helperVisible === true || lightDiagnostics?.debugSpotLightHelperVisible === true,
        targetInScene: diagnostics?.mainStageSpot?.targetInScene === true,
        castShadow: diagnostics?.mainStageSpot?.castShadow === true,
        sampleObjectProjected: lightDiagnostics?.sampleObjectProjected || diagnostics?.firstMeteorScreenEstimate || null,
        sampleObjectFrustumVisible: lightDiagnostics?.sampleObjectFrustumVisible ?? diagnostics?.firstMeteorInCameraBounds ?? null,
      },
      debugSpotLight: null,
      showLightHelpers: lights.showLightHelpers === true,
      helper: {
        mode: helper.mode || null,
        count: Number(helper.count || 0),
        visible: helper.visible === true,
        enabled: helper.enabled === true || lights.showLightHelpers === true,
      },
      materials: {
        activeGlbObjectCount: materialOverride.activeGlbObjects ?? diagnostics?.activeGlbInstances ?? null,
        activeGlbMeshCount: materialOverride.activeGlbMeshCount ?? null,
        meshesUsingCurrentMaterialMode: materialOverride.meshesUsingCurrentMaterialMode ?? null,
        currentMaterialMode: materialOverride.currentMaterialMode || activeMaterialMode,
        lastMaterialOverrideFrame: materialOverride.lastAppliedFrame ?? null,
        lastMaterialOverrideTimestamp: materialOverride.lastAppliedAtMs ?? null,
        restoredImportedMaterialCount: materialOverride.restoredImportedMaterials ?? null,
        auditStatus: diagnostics?.glbMaterialAuditStatus || null,
        auditEntries: materialAuditEntries,
      },
      lights: {
        sampleObject: lightDiagnostics?.sampleObject || null,
        positions: diagnostics?.threeLightPositions || [],
        cornerLights: lightDiagnostics?.cornerLights || [],
        debugKeyLight: lightDiagnostics?.debugKeyLight || null,
        debugRimLight: lightDiagnostics?.debugRimLight || null,
        forceHeadlight: lightDiagnostics?.forceHeadlight || null,
        mainStageSpot: lightDiagnostics?.mainStageSpot || diagnostics?.mainStageSpot || null,
        debugSpotLight: lightDiagnostics?.debugSpotLight || diagnostics?.debugSpotLight || null,
        mainStageSpotTargetMode: lightDiagnostics?.mainStageSpotTargetMode || lights.mainStageSpotTargetMode || "center",
        legacyCornerLightsEnabled: lightDiagnostics?.legacyCornerLightsEnabled === true || diagnostics?.legacyCornerLights?.enabled === true,
        legacyCornerLightsAffectScene: lightDiagnostics?.legacyCornerLightsAffectScene === true || diagnostics?.legacyCornerLights?.affectScene === true,
        debugSpotLightTargetMode: lightDiagnostics?.debugSpotLightTargetMode || lights.mainStageSpotTargetMode || "center",
        debugSpotLightHelperVisible: lightDiagnostics?.debugSpotLightHelperVisible === true || diagnostics?.mainStageSpot?.helperVisible === true,
        sampleObjectProjected: lightDiagnostics?.sampleObjectProjected || diagnostics?.firstMeteorScreenEstimate || null,
        sampleObjectFrustumVisible: lightDiagnostics?.sampleObjectFrustumVisible ?? diagnostics?.firstMeteorInCameraBounds ?? null,
        distanceDiagnostics: lightDiagnostics || null,
      },
      worldRendererDiagnostics: diagnostics,
    };
  }

  function buildVisualEvidenceSnapshot(debugVisualConfig = null) {
    const prgFrameProbe = debugVisualConfig?.prgFrameProbe || null;
    const three = buildThreeRendererEvidenceVisual();
    return {
      prgFrameProbe,
      three,
      threeRenderer: three,
      worldRendererDiagnostics: three.worldRendererDiagnostics,
    };
  }

  function slugifyLabel(value, fallback = "scenario") {
    const base = String(value || "").trim().toLowerCase();
    const normalized = base
      .replace(/[^a-z0-9]+/gi, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 42);
    return normalized || fallback;
  }

  function formatSessionTimestamp(date = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}_${pad(date.getUTCHours())}-${pad(date.getUTCMinutes())}-${pad(date.getUTCSeconds())}`;
  }

  const DebugFileBridge = {
    rootDirHandle: null,
    rootDirLabel: "debug-sessions",

    supportsPhysicalFiles() {
      return typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
    },

    async pickRootDirectory() {
      if (!this.supportsPhysicalFiles()) {
        return { ok: false, reason: "api_unavailable", message: "Physical file backend unavailable, fallback to browser download mode." };
      }
      try {
        const handle = await window.showDirectoryPicker({ id: "haiku-cosmos-debug-sessions", mode: "readwrite" });
        this.rootDirHandle = handle;
        this.rootDirLabel = handle?.name ? `${handle.name}/debug-sessions` : "debug-sessions";
        return { ok: true, label: this.rootDirLabel };
      } catch (err) {
        if (err && err.name === "AbortError") {
          return { ok: false, reason: "aborted", message: "Directory selection canceled. Using fallback backend." };
        }
        return { ok: false, reason: "picker_failed", message: String(err?.message || err || "Failed to pick directory") };
      }
    },

    async ensureSessionDirectory(sessionFolderName) {
      if (!this.rootDirHandle) return null;
      const debugRoot = await this.rootDirHandle.getDirectoryHandle("debug-sessions", { create: true });
      const sessionDir = await debugRoot.getDirectoryHandle(sessionFolderName, { create: true });
      return { debugRoot, sessionDir };
    },
  };

  class SessionArtifactBackend {
    constructor(sessionInfo) {
      this.sessionInfo = sessionInfo;
      this.key = `hc_debug_session_${sessionInfo.sessionId}.jsonl`;
      this.metaKey = "hc_debug_latest_session_key";
      this.inMemoryFallback = "";
      this.eventsBuffer = "";
      this.sessionDir = null;
      this.debugRootDir = null;
      this.mode = "initializing";
      this.message = "Initializing log backend...";
      this.queue = Promise.resolve();
      this.wrotePhysicalData = false;
      this.artifactPaths = {};
      try {
        localStorage.setItem(this.metaKey, this.key);
      } catch (_e) {}
      this.readyPromise = this.init();
    }

    getStatus() {
      const mainLog = this.artifactPaths.events || `${this.key} (localStorage fallback)`;
      return {
        mode: this.mode,
        message: this.message,
        sessionFolder: this.artifactPaths.sessionFolder || null,
        filesSavedTo: this.artifactPaths.sessionFolder || (this.mode === "fallback" ? "browser localStorage/download" : null),
        mainLog,
        summary: this.artifactPaths.summary || null,
      };
    }

    async init() {
      const bridge = window.HC?.DebugFileBridge;
      if (!bridge || !bridge.supportsPhysicalFiles()) {
        this.mode = "fallback";
        this.message = "Physical file backend unavailable, fallback to browser download mode.";
        return;
      }
      if (!bridge.rootDirHandle) {
        this.mode = "fallback";
        this.message = "No directory selected. Use Select Log Folder to enable physical files.";
        return;
      }
      try {
        const dirs = await bridge.ensureSessionDirectory(this.sessionInfo.sessionFolderName);
        if (!dirs || !dirs.sessionDir) {
          this.mode = "fallback";
          this.message = "Unable to prepare debug-sessions directory. Using fallback.";
          return;
        }
        this.debugRootDir = dirs.debugRoot;
        this.sessionDir = dirs.sessionDir;
        this.mode = "physical";
        this.message = `Writing to ${bridge.rootDirLabel}/${this.sessionInfo.sessionFolderName}`;
        this.artifactPaths.sessionFolder = `${bridge.rootDirLabel}/${this.sessionInfo.sessionFolderName}`;
        this.artifactPaths.events = `${this.artifactPaths.sessionFolder}/events.jsonl`;
      } catch (err) {
        this.mode = "fallback";
        this.message = `Physical backend failed: ${String(err?.message || err)}`;
      }
    }

    enqueue(task) {
      this.queue = this.queue.then(task).catch((err) => {
        this.mode = "fallback";
        this.message = `Write failed, switched to fallback: ${String(err?.message || err)}`;
      });
      return this.queue;
    }

    appendLines(lines) {
      if (!Array.isArray(lines) || !lines.length) return;
      const chunk = `${lines.join("\n")}\n`;
      this.eventsBuffer += chunk;
      this.enqueue(async () => {
        await this.readyPromise;
        if (this.mode === "physical" && this.sessionDir) {
          const file = await this.sessionDir.getFileHandle("events.jsonl", { create: true });
          const prev = await file.getFile();
          const writable = await file.createWritable({ keepExistingData: true });
          await writable.seek(prev.size);
          await writable.write(chunk);
          await writable.close();
          this.wrotePhysicalData = true;
        } else {
          try {
            const prev = localStorage.getItem(this.key) || "";
            localStorage.setItem(this.key, prev + chunk);
          } catch (_e) {
            this.inMemoryFallback += chunk;
          }
        }
      });
    }

    async writeJsonFile(name, payload) {
      await this.readyPromise;
      if (this.mode === "physical" && this.sessionDir) {
        const file = await this.sessionDir.getFileHandle(name, { create: true });
        const writable = await file.createWritable();
        await writable.write(`${JSON.stringify(payload, null, 2)}\n`);
        await writable.close();
        this.artifactPaths[name.replace(/\.json$/,'')] = `${this.artifactPaths.sessionFolder}/${name}`;
        return;
      }
      const key = `hc_debug_${this.sessionInfo.sessionId}_${name}`;
      try {
        localStorage.setItem(key, JSON.stringify(payload));
      } catch (_e) {}
    }

    async finalize(artifacts) {
      await this.queue;
      const sessionMeta = {
        sessionId: this.sessionInfo.sessionId,
        mode: this.sessionInfo.mode,
        scenarioLabel: this.sessionInfo.scenarioLabel,
        timestamp: this.sessionInfo.timestamp,
        folderName: this.sessionInfo.sessionFolderName,
        backendMode: this.mode,
        backendMessage: this.message,
        mainLogFile: this.mode === "physical" ? "events.jsonl" : this.key,
      };
      await this.writeJsonFile("session_meta.json", { ...sessionMeta, config: artifacts.config || {} });
      await this.writeJsonFile("final_snapshot.json", artifacts.finalSnapshot || {});
      await this.writeJsonFile("summary.json", artifacts.summary || {});
      await this.writeJsonFile("issues.json", { issues: Array.isArray(artifacts.issues) ? artifacts.issues : [] });

      if (this.mode !== "physical") {
        const blob = new Blob([
          JSON.stringify({
            session_meta: { ...sessionMeta, note: "Fallback bundle generated because physical backend is unavailable." },
            summary: artifacts.summary || {},
            final_snapshot: artifacts.finalSnapshot || {},
            issues: Array.isArray(artifacts.issues) ? artifacts.issues : [],
            events_jsonl: this.eventsBuffer || this.inMemoryFallback,
          }, null, 2)
        ], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${this.sessionInfo.filePrefix}__fallback_evidence_pack.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }

      return this.getStatus();
    }
  }

  class RuntimeEventLogger {
    constructor(config, sessionId) {
      this.config = config;
      this.sessionId = sessionId;
      this.buffer = [];
      this.frame = 0;
      this.sessionStartedAt = performance.now();
      this.backend = new SessionArtifactBackend({
        sessionId,
        mode: config.mode || "debug",
        scenarioLabel: config.scenarioLabel || "scenario",
        timestamp: formatSessionTimestamp(new Date()),
        sessionFolderName: config.sessionFolderName || `${formatSessionTimestamp(new Date())}__sess_${sessionId.slice(-6)}__${config.mode || "debug"}__${slugifyLabel(config.scenarioLabel || "scenario")}` ,
        filePrefix: config.filePrefix || `${formatSessionTimestamp(new Date())}__sess_${sessionId.slice(-6)}__${config.mode || "debug"}__${slugifyLabel(config.scenarioLabel || "scenario")}`
      });
      this.flushTimer = null;
      this.active = false;
      this.lastEventByThrottleKey = new Map();
      this.lastWorldProgressBySource = new Map();
      this.lastExpectedColorEvent = null;
      this.recentEvents = [];
      this.maxRecentEvents = 10;
    }

    start() {
      if (!this.config.loggingEnabled || this.active) return;
      this.active = true;
      this.flushTimer = setInterval(() => this.flush("interval"), this.config.flushIntervalMs);
    }

    buildSnapshot() {
      const World = window.HC.getWorld ? window.HC.getWorld() : window.World;
      if (!World) return null;
      const sequence = window.CardEngine?.state?.sequence || null;
      const cardBreakdown = {};
      const pool = Array.isArray(World.cardsPool) ? World.cardsPool : [];
      for (const card of pool) {
        if (!card || !card.kind || !card.tier || !card.colorA) continue;
        const key = `${String(card.kind).toUpperCase()}_${String(card.tier)}_${String(card.colorA).toUpperCase()}`;
        cardBreakdown[key] = (cardBreakdown[key] || 0) + 1;
      }
      return {
        rp: Math.max(0, Math.floor(Number(World.score || 0))),
        worldObjects: {
          meteors: Array.isArray(World.meteors) ? World.meteors.length : 0,
          asteroids: Array.isArray(World.asteroids) ? World.asteroids.length : 0,
          planets: Array.isArray(World.planets) ? World.planets.length : 0,
          stars: Array.isArray(World.stars) ? World.stars.length : 0,
          rockyPlanets: Array.isArray(World.planets) ? World.planets.filter((p) => p && p.isRocky).length : 0,
          gasPlanets: Array.isArray(World.planets) ? World.planets.filter((p) => p && !p.isRocky).length : 0,
        },
        sequence: sequence ? {
          active: Boolean(sequence.active),
          track: sequence.track || null,
          stepIndex: Number(sequence.stepIndex || 0),
          stage: sequence.stage || null,
          expectedColor: sequence.expectedColor || null,
          hitCount: Number(sequence.hitCount || sequence.hits || 0),
          chainColors: Array.isArray(sequence.chainColors) ? sequence.chainColors.slice() : [],
          loopMode: sequence.loopMode || null,
          lastResolution: sequence.lastResolution || null,
        } : null,
        cards: {
          total: pool.length,
          temp: Array.isArray(World.cardsTemp) ? World.cardsTemp.length : 0,
          breakdown: cardBreakdown,
        },
        thresholdOverrides: World.__debugThresholdOverrides || null,
        visual: buildVisualEvidenceSnapshot(this.config?.visual || window.HC?.Session?.debugConfig?.visual || null),
      };
    }

    buildThrottleKey(type, payload = {}) {
      if (type === EVENT_TYPES.WORLD_TRANSFORMATION_BLOCKED) {
        return [
          type,
          payload.sourceType || "unknown",
          payload.sourceId || "none",
          payload.reason || "none",
          payload.thresholdType || "none",
        ].join("|");
      }
      return null;
    }

    shouldEmitEvent(type, payload = {}, eventFrame = this.frame) {
      if (type === EVENT_TYPES.WORLD_THRESHOLD_PROGRESS) {
        const sourceKey = [
          payload.sourceType || "unknown",
          payload.sourceId || "none",
          payload.thresholdType || "none",
        ].join("|");
        const current = Number.isFinite(Number(payload.current)) ? Number(payload.current) : null;
        const target = Number.isFinite(Number(payload.target)) ? Number(payload.target) : null;
        const dominantKey = payload.dominantKey || null;
        const signature = `${current}|${target}|${dominantKey}`;
        const previous = this.lastWorldProgressBySource.get(sourceKey);
        if (previous && previous.signature === signature) {
          const frameDelta = Math.max(0, eventFrame - previous.frame);
          if (frameDelta < 30) return false;
        }
        this.lastWorldProgressBySource.set(sourceKey, { signature, frame: eventFrame });
        return true;
      }

      if (type === EVENT_TYPES.WORLD_TRANSFORMATION_BLOCKED) {
        const key = this.buildThrottleKey(type, payload);
        const previous = key ? this.lastEventByThrottleKey.get(key) : null;
        if (previous && (eventFrame - previous.frame) < 45) return false;
        if (key) this.lastEventByThrottleKey.set(key, { frame: eventFrame });
        return true;
      }

      if (type === EVENT_TYPES.SEQUENCE_EXPECTED_COLOR_CHANGED) {
        const signature = `${payload.previous || "null"}|${payload.current || "null"}|${payload.stage || "IDLE"}|${payload.hitCount || 0}`;
        if (this.lastExpectedColorEvent === signature) return false;
        this.lastExpectedColorEvent = signature;
        return true;
      }

      return true;
    }

    rememberRecentEvent(event) {
      this.recentEvents.push({
        ts: event.ts,
        sessionTimeMs: event.sessionTimeMs,
        frame: event.frame,
        category: event.category,
        type: event.type,
        payload: event.payload,
      });
      if (this.recentEvents.length > this.maxRecentEvents) {
        this.recentEvents.splice(0, this.recentEvents.length - this.maxRecentEvents);
      }
    }

    emit(category, type, payload = {}, opts = {}) {
      if (!this.config.loggingEnabled) return;
      const eventFrame = Number.isFinite(opts.frame) ? opts.frame : this.frame;
      if (!this.shouldEmitEvent(type, payload, eventFrame)) return;
      const event = {
        id: `${this.sessionId}:${Date.now()}:${Math.random().toString(16).slice(2, 8)}`,
        ts: new Date().toISOString(),
        sessionTimeMs: Math.max(0, Math.floor(performance.now() - this.sessionStartedAt)),
        frame: eventFrame,
        category,
        type,
        severity: opts.severity || "info",
        source: opts.source || "runtime",
        payload: payload && typeof payload === "object" ? payload : {},
      };
      if (this.config.includeSnapshots && opts.snapshot) {
        event.snapshot = this.buildSnapshot();
        this.buffer.push({
          id: `${event.id}:snapshot`,
          ts: new Date().toISOString(),
          sessionTimeMs: event.sessionTimeMs,
          frame: event.frame,
          category: "debug",
          type: EVENT_TYPES.DEBUG_SNAPSHOT_WRITTEN,
          severity: "trace",
          source: opts.source || "runtime",
          payload: { triggerType: type },
        });
      }
      this.buffer.push(event);
      this.rememberRecentEvent(event);
      if (this.buffer.length >= this.config.batchSizeEvents) {
        this.flush("batch");
      }
    }

    setFrame(frame) {
      this.frame = frame;
    }

    flush(reason = "manual") {
      if (!this.config.loggingEnabled || !this.buffer.length) return;
      const lines = this.buffer.map((entry) => JSON.stringify(entry));
      this.buffer.length = 0;
      try {
        this.backend.appendLines(lines);
        this.backend.appendLines([
          JSON.stringify({
            ts: new Date().toISOString(),
            category: "debug",
            type: EVENT_TYPES.DEBUG_FLUSH,
            source: "RuntimeEventLogger",
            payload: { reason, count: lines.length }
          })
        ]);
      } catch (err) {
        this.backend.appendLines([
          JSON.stringify({
            ts: new Date().toISOString(),
            category: "debug",
            type: EVENT_TYPES.DEBUG_ERROR,
            severity: "error",
            source: "RuntimeEventLogger",
            payload: { reason: "flush_failed", detail: String(err && err.message ? err.message : err) }
          })
        ]);
      }
    }

    async shutdown(reason = "shutdown", artifacts = null) {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }
      this.flush(reason);
      this.active = false;
      if (artifacts && this.backend && typeof this.backend.finalize === "function") {
        return this.backend.finalize(artifacts);
      }
      return this.backend?.getStatus ? this.backend.getStatus() : null;
    }
  }

  function randomPosition() {
    const getBounds = window.getWorldViewBounds;
    const b = typeof getBounds === "function" ? getBounds() : { l: 120, r: 900, t: 120, b: 700 };
    return {
      x: b.l + Math.random() * Math.max(1, (b.r - b.l)),
      y: b.t + Math.random() * Math.max(1, (b.b - b.t)),
    };
  }

  function createAsteroidSeed() {
    const p = randomPosition();
    const Rm = typeof window.meteorBaseRadius === "function" ? window.meteorBaseRadius() : 6;
    return {
      type: "asteroid",
      _id: `debug_ast_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      x: p.x,
      y: p.y,
      vx: 0,
      vy: 0,
      r: Rm * (2.8 + Math.random() * 1.6),
      sides: 6,
      angle: Math.random() * Math.PI * 2,
      spin: 0,
      grayLight: 54,
      orbitPx: Rm * 12,
      orbitNativeRadius: Rm * 12,
      orbitCurrentRadius: Rm * 12,
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
      liveSumR: 0,
      liveSumMass: 0,
      liveColorCounts: { blue: 0, green: 0, red: 0, yellow: 0 },
      captureColorCounts: { blue: 0, green: 0, red: 0, yellow: 0 },
      cometHits: 0,
      isCollapsing: false,
      collapseT: 0,
      collapseDuration: 0.9,
    };
  }

  function createPlanetSeed(isRocky) {
    const p = randomPosition();
    const Rm = typeof window.meteorBaseRadius === "function" ? window.meteorBaseRadius() : 6;
    const radius = Rm * (7 + Math.random() * 2);
    const gravity = typeof window.computeGravityFromPlanetRadius === "function"
      ? window.computeGravityFromPlanetRadius(radius)
      : radius * 2.2;
    return {
      type: "planet",
      id: `debug_pl_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      x: p.x,
      y: p.y,
      vx: 0,
      vy: 0,
      r: radius,
      mass: radius * radius,
      gravityR: gravity,
      orbitPx: gravity,
      orbitNativeRadius: gravity,
      orbitCurrentRadius: gravity,
      hueA: isRocky ? 25 : 210,
      hueB: isRocky ? 45 : 120,
      fixedR: radius,
      lockRadius: true,
      orbiters: [],
      captureCooldown: 0,
      captureCount: 0,
      captureSumR: 0,
      captureSumMass: 0,
      captureColorCounts: { blue: 0, green: 0, red: 0, yellow: 0 },
      isRocky,
      rockyLocked: Boolean(isRocky),
      rockyForm: isRocky ? { active: false, phase: "done", t: 0, shrinkDur: 0, fadeDur: 0 } : null,
      planetKind: isRocky ? "rocky" : "gas",
      cometHits: isRocky ? 1 : 0,
      rings: [],
    };
  }

  function createStarSeed() {
    const p = randomPosition();
    const Rm = typeof window.meteorBaseRadius === "function" ? window.meteorBaseRadius() : 6;
    const radius = Rm * 14;
    return {
      type: "star",
      id: `debug_st_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      x: p.x,
      y: p.y,
      r: radius,
      mass: radius * radius,
      gravityR: radius * 1.3,
      orbitNativeRadius: radius * 1.3,
      orbitCurrentRadius: radius * 1.3,
      orbiters: [],
      starKind: "normal",
      dominantKey: "yellow",
      monoColorKey: null,
      starBirth: { phase: "done" },
      birth: { active: false, phase: "done", t: 0, duration: 0, fadeOut: 0, timeAbs: 0, absorb: [] },
      baseColor: "yellow",
      shimmer: null,
      sizeClass: "small",
      gradientOuterColor: "yellow",
    };
  }

  const Session = {
    started: false,
    mode: "normal",
    sessionId: null,
    debugConfig: createDebugConfig("normal"),
    logger: null,
    sessionInputConfig: null,
    baseThresholds: null,
    issues: [],
    issueLedger: [],
    finalizeState: {
      status: "idle",
      message: "",
      filesSavedTo: null,
      mainLog: null,
      summary: null,
    },

    startedAtIso: null,
    endedAtIso: null,
    scenarioLabel: "unspecified",
    scenarioPresetId: "custom",
    evidenceNote: "",

    ensureBaseThresholds(World) {
      if (this.baseThresholds || !World) return;
      this.baseThresholds = {
        asteroidToPlanet: Number(World.planetCaptureTarget || 13),
        planetToStar: {
          blue: Number(World.STAR_REQ_BLUE || 30),
          green: Number(World.STAR_REQ_GREEN || 30),
          red: Number(World.STAR_REQ_RED || 30),
          yellow: Number(World.STAR_REQ_YELLOW || 30),
        },
      };
    },

    restoreSessionThresholdDefaults(World) {
      this.ensureBaseThresholds(World);
      if (!World || !this.baseThresholds) return;
      World.planetCaptureTarget = this.baseThresholds.asteroidToPlanet;
      World.STAR_REQ_BLUE = this.baseThresholds.planetToStar.blue;
      World.STAR_REQ_GREEN = this.baseThresholds.planetToStar.green;
      World.STAR_REQ_RED = this.baseThresholds.planetToStar.red;
      World.STAR_REQ_YELLOW = this.baseThresholds.planetToStar.yellow;
      World.__debugThresholdOverrides = null;
    },

    applyThresholdOverrides(World) {
      if (!World) return;
      this.restoreSessionThresholdDefaults(World);
      const overrides = this.debugConfig.thresholdOverrides || {};
      const applied = {};
      if (overrides.asteroidToPlanet != null) {
        World.planetCaptureTarget = clampInt(overrides.asteroidToPlanet, World.planetCaptureTarget);
        applied.asteroidToPlanet = World.planetCaptureTarget;
      }
      if (overrides.planetToStar != null) {
        const next = clampInt(overrides.planetToStar, 0);
        World.STAR_REQ_BLUE = next;
        World.STAR_REQ_GREEN = next;
        World.STAR_REQ_RED = next;
        World.STAR_REQ_YELLOW = next;
        applied.planetToStar = next;
      }
      World.__debugThresholdOverrides = Object.keys(applied).length ? applied : null;
      this.emit("debug", EVENT_TYPES.DEBUG_OVERRIDE_APPLIED, {
        source: "debug panel / session bootstrap",
        section: "thresholdOverrides",
        applied: World.__debugThresholdOverrides || {},
      }, { source: "Session.applyThresholdOverrides" });
      this.emit("debug", EVENT_TYPES.DEBUG_CONFIG_SECTION_APPLIED, {
        section: "thresholdOverrides",
        applied: World.__debugThresholdOverrides || {},
      }, { source: "Session.applyThresholdOverrides" });
    },

    applyInitialRP(World) {
      if (!World) return;
      const before = clampInt(World.score, 0);
      const after = clampInt(this.debugConfig.initialRP, 0);
      World.score = after;
      this.emit("rp", EVENT_TYPES.RP_SET_INITIAL, {
        before,
        after,
        source: "session bootstrap",
      }, { source: "Session.applyInitialRP" });
      this.emit("debug", EVENT_TYPES.DEBUG_CONFIG_SECTION_APPLIED, {
        section: "initialRP",
        value: after,
      }, { source: "Session.applyInitialRP" });
    },

    applyInitialCards(World) {
      if (!World || !window.CardEngine || typeof window.CardEngine.onCardCollected !== "function") return;
      let added = 0;
      const cfg = this.debugConfig.initialCards || {};
      Object.entries(CARD_BOOTSTRAP_MAP).forEach(([key, payload]) => {
        const count = clampInt(cfg[key], 0);
        for (let i = 0; i < count; i++) {
          const entity = window.CardEngine.onCardCollected(payload);
          if (entity) added += 1;
        }
      });
      this.emit("debug", EVENT_TYPES.DEBUG_OVERRIDE_APPLIED, {
        source: "debug panel / session bootstrap",
        section: "initialCards",
        configured: cfg,
        added,
      }, { source: "Session.applyInitialCards" });
      this.emit("debug", EVENT_TYPES.DEBUG_CONFIG_SECTION_APPLIED, {
        section: "initialCards",
        configured: cfg,
        added,
      }, { source: "Session.applyInitialCards" });
    },

    applyInitialWorldState(World) {
      if (!World) return;
      const cfg = this.debugConfig.initialWorldState || DEFAULT_INITIAL_WORLD_STATE;
      const asteroids = clampInt(cfg.asteroidCount, 0);
      const rocky = clampInt(cfg.rockyPlanetCount, 0);
      const gas = clampInt(cfg.gasPlanetCount, 0);
      const stars = clampInt(cfg.starCount, 0);

      for (let i = 0; i < asteroids; i++) {
        const asteroid = createAsteroidSeed();
        World.asteroids.push(asteroid);
        this.emit("world", EVENT_TYPES.WORLD_OBJECT_SPAWNED, { objectType: "asteroid", source: "debug.session.bootstrap" }, { source: "Session.applyInitialWorldState" });
      }
      for (let i = 0; i < rocky; i++) {
        const planet = createPlanetSeed(true);
        World.planets.push(planet);
        this.emit("world", EVENT_TYPES.WORLD_OBJECT_SPAWNED, { objectType: "planet", planetKind: "rocky", source: "debug.session.bootstrap" }, { source: "Session.applyInitialWorldState" });
      }
      for (let i = 0; i < gas; i++) {
        const planet = createPlanetSeed(false);
        World.planets.push(planet);
        this.emit("world", EVENT_TYPES.WORLD_OBJECT_SPAWNED, { objectType: "planet", planetKind: "gas", source: "debug.session.bootstrap" }, { source: "Session.applyInitialWorldState" });
      }
      for (let i = 0; i < stars; i++) {
        const star = createStarSeed();
        World.stars.push(star);
        this.emit("world", EVENT_TYPES.WORLD_OBJECT_SPAWNED, { objectType: "star", source: "debug.session.bootstrap" }, { source: "Session.applyInitialWorldState" });
      }

      this.emit("debug", EVENT_TYPES.DEBUG_CONFIG_SECTION_APPLIED, {
        section: "initialWorldState",
        configured: { asteroidCount: asteroids, rockyPlanetCount: rocky, gasPlanetCount: gas, starCount: stars },
      }, { source: "Session.applyInitialWorldState" });
    },

    applyDebugBootstrap(World) {
      this.applyThresholdOverrides(World);
      this.applyInitialRP(World);
      this.applyInitialCards(World);
      this.applyInitialWorldState(World);
      this.emit("debug", EVENT_TYPES.DEBUG_CONFIG_SECTION_APPLIED, {
        section: "bootstrap_complete",
      }, { source: "Session.applyDebugBootstrap", snapshot: true });
    },

    getScenarioPresets() {
      return Object.values(SCENARIO_PRESETS).map((preset) => ({
        id: preset.id,
        label: preset.label,
        scenarioLabel: preset.scenarioLabel,
        config: cloneJson(preset.config || {}),
      }));
    },

    getPresetById(presetId) {
      return SCENARIO_PRESETS[presetId] || null;
    },

    getSessionLogKey() {
      return this.logger?.backend?.key || (this.sessionId ? `hc_debug_session_${this.sessionId}.jsonl` : null);
    },

    getSessionEvents() {
      const key = this.getSessionLogKey();
      if (!key) return [];
      let raw = "";
      try {
        raw = localStorage.getItem(key) || "";
      } catch (_e) {}
      if (!raw && this.logger?.backend) {
        raw = this.logger.backend.eventsBuffer || this.logger.backend.inMemoryFallback || "";
      }
      return safeParseJsonl(raw).filter((entry) => entry && entry.type !== EVENT_TYPES.DEBUG_FLUSH);
    },

    getSessionDurationMs() {
      if (!this.startedAtIso) return 0;
      const started = Date.parse(this.startedAtIso);
      const ended = this.endedAtIso ? Date.parse(this.endedAtIso) : Date.now();
      if (!Number.isFinite(started) || !Number.isFinite(ended)) return 0;
      return Math.max(0, ended - started);
    },

    buildSessionSummary(events, finalSnapshot) {
      const summary = {
        sequenceStarted: 0,
        stepCompleted: 0,
        failDetected: 0,
        failResolved: 0,
        cashoutCompleted: 0,
        dsGranted: 0,
        transformationStarted: 0,
        transformationCompleted: 0,
        transformationBlocked: 0,
        rpGained: 0,
        rpSpent: 0,
        rpSetInitial: 0,
        cardCollected: 0,
        cardCreated: 0,
        warningEvents: 0,
        errorEvents: 0,
        eventsByCategory: {},
        eventsByType: {},
        finalSequenceState: finalSnapshot?.sequence || null,
        finalWorldCounts: finalSnapshot?.worldCounts || null,
        finalRp: finalSnapshot?.economy?.rp ?? 0,
        finalCardCounts: finalSnapshot?.economy?.cards || {},
      };
      const bump = (field) => {
        summary[field] = (summary[field] || 0) + 1;
      };
      for (const event of events) {
        if (!event) continue;
        const category = event.category || "unknown";
        const type = event.type || "unknown";
        summary.eventsByCategory[category] = (summary.eventsByCategory[category] || 0) + 1;
        summary.eventsByType[type] = (summary.eventsByType[type] || 0) + 1;
        if (event.severity === "warn" || event.severity === "warning") summary.warningEvents += 1;
        if (event.severity === "error" || event.severity === "critical") summary.errorEvents += 1;
        if (type === EVENT_TYPES.SEQUENCE_STARTED) bump("sequenceStarted");
        if (type === EVENT_TYPES.SEQUENCE_STEP_COMPLETED) bump("stepCompleted");
        if (type === EVENT_TYPES.SEQUENCE_FAIL_DETECTED) bump("failDetected");
        if (type === EVENT_TYPES.SEQUENCE_FAIL_RESOLVED) bump("failResolved");
        if (type === EVENT_TYPES.SEQUENCE_CASHOUT_COMPLETED) bump("cashoutCompleted");
        if (type === EVENT_TYPES.SEQUENCE_DS_GRANTED) bump("dsGranted");
        if (type === EVENT_TYPES.WORLD_TRANSFORMATION_STARTED) bump("transformationStarted");
        if (type === EVENT_TYPES.WORLD_TRANSFORMATION_COMPLETED) bump("transformationCompleted");
        if (type === EVENT_TYPES.WORLD_TRANSFORMATION_BLOCKED) bump("transformationBlocked");
        if (type === EVENT_TYPES.RP_GAINED) bump("rpGained");
        if (type === EVENT_TYPES.RP_SPENT) bump("rpSpent");
        if (type === EVENT_TYPES.RP_SET_INITIAL) bump("rpSetInitial");
        if (type === EVENT_TYPES.CARD_COLLECTED) bump("cardCollected");
        if (type === EVENT_TYPES.CARD_CREATED) bump("cardCreated");
      }
      return summary;
    },

    buildEvidencePack(note = "") {
      this.flush("evidence_pack");
      const finalSnapshot = this.getRuntimeSnapshot();
      const events = this.getSessionEvents();
      const sessionMeta = {
        sessionId: this.sessionId,
        mode: this.mode,
        scenarioLabel: this.scenarioLabel,
        scenarioPresetId: this.scenarioPresetId,
        startedAt: this.startedAtIso,
        endedAt: this.endedAtIso || new Date().toISOString(),
        durationMs: this.getSessionDurationMs(),
        build: window.HC_BUILD_VERSION || null,
        debugConfig: this.debugConfig,
        logKey: this.getSessionLogKey(),
      };
      const summary = this.buildSessionSummary(events, finalSnapshot);
      return {
        session_meta: sessionMeta,
        final_snapshot: finalSnapshot,
        summary,
        notes: String(note || this.evidenceNote || "").trim(),
        events_jsonl: events.map((event) => JSON.stringify(event)).join("\n"),
        issues: this.issueLedger.filter((issue) => issue.sessionId === this.sessionId),
      };
    },

    downloadTextFile(filename, text, mime = "application/json") {
      const blob = new Blob([text], { type: `${mime};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    },

    exportEvidence(note = "") {
      if (!this.sessionId) return null;
      const pack = this.buildEvidencePack(note);
      const safeId = String(this.sessionId).replace(/[^a-zA-Z0-9._-]+/g, "_");
      this.downloadTextFile(`hc_evidence_${safeId}.json`, JSON.stringify(pack, null, 2));
      this.downloadTextFile(`hc_evidence_${safeId}.events.jsonl`, pack.events_jsonl || "", "text/plain");
      try {
        localStorage.setItem(`hc_evidence_pack_${this.sessionId}`, JSON.stringify(pack));
      } catch (_e) {}
      return pack;
    },

    markIssue(partial = {}) {
      if (!this.sessionId) return null;
      const now = new Date().toISOString();
      const issue = {
        issueId: `issue_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
        sessionId: this.sessionId,
        scenarioLabel: this.scenarioLabel,
        title: partial.title || "Untitled issue",
        category: partial.category || "regression",
        severity: partial.severity || "medium",
        expected: partial.expected || "",
        observed: partial.observed || "",
        reproSteps: partial.reproSteps || "",
        timestamp: now,
        relatedEventIds: Array.isArray(partial.relatedEventIds) ? partial.relatedEventIds : [],
        relatedSnapshot: partial.relatedSnapshot || "runtime_snapshot",
      };
      this.issueLedger.push(issue);
      this.issues.push(issue);
      try {
        const prev = JSON.parse(localStorage.getItem("hc_issue_ledger_v1") || "[]");
        const next = Array.isArray(prev) ? prev.concat(issue) : [issue];
        localStorage.setItem("hc_issue_ledger_v1", JSON.stringify(next, null, 2));
      } catch (_e) {}
      return issue;
    },

    start(mode, uiConfig = null) {
      this.mode = mode === "debug" ? "debug" : "normal";
      const rawInput = uiConfig && typeof uiConfig === "object" ? uiConfig : {};
      const scenarioLabelRaw = String(rawInput.scenarioLabel || "").trim();
      this.scenarioLabel = scenarioLabelRaw || (this.mode === "debug" ? "debug_custom" : "normal_regression");
      this.scenarioPresetId = String(rawInput.scenarioPresetId || "custom");
      this.evidenceNote = String(rawInput.note || "").trim();
      const runtimeConfig = { ...rawInput };
      delete runtimeConfig.scenarioLabel;
      delete runtimeConfig.scenarioPresetId;
      delete runtimeConfig.note;
      this.sessionInputConfig = rawInput;
      this.sessionId = `s_${new Date().toISOString().replace(/[:.]/g, "-")}`;
      this.debugConfig = createDebugConfig(this.mode, this.mode === "debug" ? runtimeConfig : {});
      this.debugConfig.scenarioLabel = this.scenarioLabel;
      const ts = formatSessionTimestamp(new Date());
      const shortId = this.sessionId.slice(-6);
      const scenario = slugifyLabel(this.debugConfig.scenarioLabel || "manual_session");
      this.debugConfig.filePrefix = `${ts}__sess_${shortId}__${this.mode}__${scenario}`;
      this.debugConfig.sessionFolderName = `${ts}__sess_${shortId}__${this.mode}__${scenario}`;

      this.startedAtIso = new Date().toISOString();
      this.endedAtIso = null;
      this.logger = new RuntimeEventLogger(this.debugConfig, this.sessionId);
      this.logger.start();
      this.started = true;
      this.issues = [];
      this.issueLedger = [];
      this.finalizeState = {
        status: "active",
        message: "Session active",
        filesSavedTo: null,
        mainLog: null,
        summary: null,
      };

      this.emit("session", EVENT_TYPES.SESSION_CONFIG_APPLIED, {
        config: this.debugConfig,
      }, { source: "Session", snapshot: false });

      if (window.HC && typeof window.HC.resetWorld === "function") {
        window.HC.resetWorld();
      } else if (typeof window.resetWorld === "function") {
        window.resetWorld();
      }
      const World = window.HC.getWorld ? window.HC.getWorld() : window.World;

      if (this.mode === "debug") {
        this.applyDebugBootstrap(World);
      } else {
        this.restoreSessionThresholdDefaults(World);
      }

      this.emit("session", EVENT_TYPES.SESSION_STARTED, {
        mode: this.mode,
        sessionId: this.sessionId,
        scenarioLabel: this.scenarioLabel,
        scenarioPresetId: this.scenarioPresetId,
      }, { source: "Session", snapshot: true });

      if (World) World.paused = false;
      if (window.HC.UI && typeof window.HC.UI.applySessionMode === "function") {
        window.HC.UI.applySessionMode(this.mode);
      }
    },

    restart() {
      if (!this.started) return;
      this.emit("session", EVENT_TYPES.SESSION_ENDED, { reason: "restart" }, { source: "Session", snapshot: true });
      this.logger?.shutdown("restart");
      this.start(this.mode, this.sessionInputConfig);
    },

    async finalize(reason = "ended", aborted = false) {
      if (!this.started) return this.finalizeState;
      this.finalizeState.status = "flushing";
      this.finalizeState.message = "Flushing and finalizing session files...";
      this.endedAtIso = new Date().toISOString();
      const endingType = aborted ? EVENT_TYPES.SESSION_ABORTED : EVENT_TYPES.SESSION_ENDED;
      this.emit("session", endingType, { reason }, { source: "Session", snapshot: true, severity: aborted ? "warn" : "info" });
      const finalSnapshot = this.getRuntimeSnapshot();
      const summary = {
        sessionId: this.sessionId,
        mode: this.mode,
        endedAt: this.endedAtIso,
        reason,
        mainLogFile: "events.jsonl",
        scenarioLabel: this.scenarioLabel || "manual_session",
        counts: {
          recentEventsTracked: Array.isArray(this.logger?.recentEvents) ? this.logger.recentEvents.length : 0,
          pendingBuffer: this.logger?.buffer?.length || 0,
          issues: this.issueLedger.length,
        },
      };
      const status = await this.logger?.shutdown(reason, {
        config: this.debugConfig,
        finalSnapshot,
        summary,
        issues: this.issueLedger.slice(),
      });
      this.started = false;
      this.finalizeState = {
        status: "finalized",
        message: "Session saved",
        filesSavedTo: status?.filesSavedTo || null,
        mainLog: status?.mainLog || "events.jsonl",
        summary: status?.summary || "summary.json",
      };
      return this.finalizeState;
    },

    end(reason = "ended") {
      if (!this.started) return;
      void this.finalize(reason, false);
    },

    abort(reason = "aborted") {
      if (!this.started) return;
      void this.finalize(reason, true);
    },

    emit(category, type, payload = {}, opts = {}) {
      if (!this.logger) return;
      this.logger.emit(category, type, payload, opts);
    },

    setFrame(frame) {
      this.logger?.setFrame(frame);
    },

    flush(reason) {
      this.logger?.flush(reason || "manual");
    },

    reportIssue(issuePayload = {}) {
      if (!this.started) return;
      const issue = {
        id: `issue_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
        ts: new Date().toISOString(),
        ...issuePayload,
      };
      this.issueLedger.push(issue);
      this.emit("debug", EVENT_TYPES.DEBUG_ERROR, {
        reason: "issue_reported",
        issue,
      }, { source: "Session.reportIssue", severity: "warn" });
    },

    getRuntimeSnapshot() {
      const World = window.HC.getWorld ? window.HC.getWorld() : window.World;
      const seq = window.CardEngine?.state?.sequence || null;
      const logger = this.logger;
      const cardPool = Array.isArray(World?.cardsPool) ? World.cardsPool : [];
      const cardKeys = [
        "R1_DR_RED", "R1_DR_YELLOW", "R1_DR_GREEN", "R1_DR_BLUE",
        "DS_DR_RED", "DS_DR_YELLOW", "DS_DR_GREEN", "DS_DR_BLUE",
        "R1_SDR_RED", "R1_SDR_YELLOW", "R1_SDR_GREEN", "R1_SDR_BLUE",
        "R1_PDR_RED", "R1_PDR_YELLOW", "R1_PDR_GREEN", "R1_PDR_BLUE",
      ];
      const cardBreakdown = {};
      for (const key of cardKeys) cardBreakdown[key] = 0;
      for (const c of cardPool) {
        if (!c || !c.kind || !c.tier || !c.colorA) continue;
        const key = `${String(c.kind).toUpperCase()}_${String(c.tier)}_${String(c.colorA).toUpperCase()}`;
        if (Object.prototype.hasOwnProperty.call(cardBreakdown, key)) {
          cardBreakdown[key] += 1;
        }
      }
      const lastByCategory = { sequence: null, world: null, rp: null };
      const recent = Array.isArray(logger?.recentEvents) ? logger.recentEvents : [];
      for (let i = recent.length - 1; i >= 0; i -= 1) {
        const entry = recent[i];
        if (!lastByCategory.sequence && entry.category === "sequence") lastByCategory.sequence = entry;
        if (!lastByCategory.world && entry.category === "world") lastByCategory.world = entry;
        if (!lastByCategory.rp && entry.category === "rp") lastByCategory.rp = entry;
      }
      return {
        mode: this.mode,
        started: this.started,
        sessionId: this.sessionId,
        scenarioLabel: this.scenarioLabel,
        scenarioPresetId: this.scenarioPresetId,
        sessionTimeMs: logger ? Math.max(0, Math.floor(performance.now() - logger.sessionStartedAt)) : 0,
        frame: logger?.frame || 0,
        loggingEnabled: Boolean(this.debugConfig?.loggingEnabled),
        loggingStatus: this.logger?.backend?.getStatus ? this.logger.backend.getStatus() : null,
        pendingLogBufferSize: logger?.buffer?.length || 0,
        finalizeState: this.finalizeState,
        sequence: seq ? {
          active: Boolean(seq.active),
          stage: seq.stage || "IDLE",
          phase: seq.phase || null,
          track: seq.track || null,
          stepIndex: Number(seq.stepIndex || 0),
          currentColor: seq.currentColor || null,
          expectedColor: seq.expectedColor || null,
          hitCount: Number(seq.hitCount || seq.hits || 0),
          chainColors: Array.isArray(seq.chainColors) ? seq.chainColors.slice() : [],
          loopMode: seq.loopMode || null,
          lastResolution: seq.lastResolution || null,
          resolutionLock: Boolean(seq.resolutionLock),
        } : null,
        economy: {
          rp: Math.max(0, Math.floor(Number(World?.score || 0))),
          cards: cardBreakdown,
        },
        worldCounts: {
          asteroids: Array.isArray(World?.asteroids) ? World.asteroids.length : 0,
          rockyPlanets: Array.isArray(World?.planets) ? World.planets.filter((p) => p && p.isRocky).length : 0,
          gasPlanets: Array.isArray(World?.planets) ? World.planets.filter((p) => p && !p.isRocky).length : 0,
          stars: Array.isArray(World?.stars) ? World.stars.length : 0,
        },
        thresholds: {
          asteroidToPlanet: {
            current: Number(World?.planetCaptureTarget || 0),
            source: World?.__debugThresholdOverrides?.asteroidToPlanet == null ? "default" : "override",
          },
          planetToStar: {
            current: Number(World?.STAR_REQ_BLUE || 0),
            source: World?.__debugThresholdOverrides?.planetToStar == null ? "default" : "override",
          },
        },
        lastByCategory,
        recentEvents: recent.slice(-10),
        visual: buildVisualEvidenceSnapshot(this.debugConfig?.visual || null),
      };
    }
  };

  window.HC.DebugEventTypes = EVENT_TYPES;
  window.HC.createDebugConfig = createDebugConfig;
  window.HC.DebugFileBridge = DebugFileBridge;
  window.HC.Session = Session;
  window.HC.logEvent = (category, type, payload, opts) => Session.emit(category, type, payload, opts);
  window.HC.reportDebugIssue = (issuePayload) => Session.reportIssue(issuePayload);
  window.HC.selectDebugLogFolder = async () => DebugFileBridge.pickRootDirectory();
  window.HC.finalizeDebugSession = async () => Session.finalize("user_finalize", false);

  window.addEventListener("beforeunload", () => Session.abort("beforeunload"));
  window.addEventListener("pagehide", () => Session.flush("pagehide"));
})();
