// HC world renderer adapter facade (Stage 4 - Three.js meteor + asteroid passes)
(function () {
  window.HC = window.HC || {};

  const ALLOWED_MODES = { canvas2d: true, three: true };
  const THREE_METEOR_RADIUS_SCALE = 1.8;
  const THREE_METEOR_MIN_RADIUS = 2.4;
  const THREE_ASTEROID_MIN_RADIUS = 4.0;
  const THREE_ASTEROID_DEFAULT_SIDES = 7;
  const THREE_DEBUG_MARKER_ENABLED = true;
  const THREE_DEBUG_MARKER_SIZE = 12;
  const METEOR_GLB_RADIUS_SCALE = 1.0;
  const METEOR_GLB_VISUAL_SCALE_DEFAULT = 1.0;
  const METEOR_GLB_VISUAL_SCALE_MIN = 0.25;
  const METEOR_GLB_VISUAL_SCALE_MAX = 4.0;
  const METEOR_GLB_DEPTH_SCALE_DEFAULT = 1.0;
  const METEOR_GLB_DEPTH_SCALE_MIN = 0.25;
  const METEOR_GLB_DEPTH_SCALE_MAX = 3.0;
  const THREE_CAMERA_MODELS = Object.freeze(["absolute_bounds", "stage_normalized"]);
  const THREE_STAGE_SIZE_DEFAULT = 220;
  const THREE_STAGE_SIZE_MIN = 180;
  const THREE_STAGE_SIZE_MAX = 240;
  const THREE_STAGE_CAMERA_FOV = 45;
  const METEOR_GLB_ROTATION_TWO_PI = Math.PI * 2;
  const METEOR_GLB_ROTATION_MIN_SPEED = 0.08;
  const METEOR_GLB_ROTATION_SPEED_RANGES = Object.freeze({ x: 0.9, y: 1.1, z: 0.7 });
  const METEOR_GLB_VARIANTS_PER_COLOR = 5;
  const RED_METEOR_TEXTURE_PATHS = Object.freeze([
    "png/texture_meteor_red_01.png",
    "png/texture_meteor_red_02.png",
    "png/texture_meteor_red_03.png",
    "png/texture_meteor_red_04.png",
    "png/texture_meteor_red_05.png",
  ]);
  const RED_METEOR_TEXTURE_ROUGHNESS = 0.86;
  const RED_METEOR_TEXTURE_METALNESS = 0.04;
  const THREE_LIGHTS_DEFAULTS = Object.freeze({
    enabled: true,
    legacyCornerLightsEnabled: false,
    pointIntensity: 0.9,
    distanceMultiplier: 1.55,
    decay: 1.35,
    zOffsetMultiplier: 0.45,
    ambientIntensity: 0.0,
    ambientIsolate: false,
    debugKeyLightEnabled: false,
    debugKeyLightIntensity: 2.2,
    debugRimLightEnabled: false,
    debugRimLightIntensity: 0.65,
    forceHeadlightEnabled: false,
    forceHeadlightIntensity: 4.5,
    mainStageSpotEnabled: true,
    mainStageSpotIntensity: 6.5,
    mainStageSpotAngle: Math.PI / 2.8,
    mainStageSpotPenumbra: 0.72,
    mainStageSpotDistance: 0,
    mainStageSpotDecay: 0,
    mainStageSpotXOffset: -0.65,
    mainStageSpotYOffset: -0.55,
    mainStageSpotZHeight: 1.55,
    mainStageSpotTargetMode: "center",
    showLightHelpers: false,
  });
  const THREE_LIGHTS_LIMITS = Object.freeze({
    pointIntensity: { min: 0, max: 2.5 },
    distanceMultiplier: { min: 0.25, max: 4.0 },
    decay: { min: 0, max: 3.0 },
    zOffsetMultiplier: { min: 0.05, max: 2.0 },
    ambientIntensity: { min: 0, max: 0.75 },
    debugKeyLightIntensity: { min: 0, max: 5.0 },
    debugRimLightIntensity: { min: 0, max: 2.5 },
    forceHeadlightIntensity: { min: 0, max: 8.0 },
    mainStageSpotIntensity: { min: 0, max: 25.0 },
    mainStageSpotAngle: { min: Math.PI / 24, max: Math.PI / 2 },
    mainStageSpotPenumbra: { min: 0, max: 1 },
    mainStageSpotDistance: { min: 0, max: 100000 },
    mainStageSpotDecay: { min: 0, max: 3 },
    mainStageSpotXOffset: { min: -2, max: 2 },
    mainStageSpotYOffset: { min: -2, max: 2 },
    mainStageSpotZHeight: { min: 0.25, max: 4 },
  });
  const THREE_SPOTLIGHT_TARGET_MODES = Object.freeze(["center", "sampleObject"]);
  function isThreeSpotLightTargetMode(value) { return THREE_SPOTLIGHT_TARGET_MODES.includes(String(value)); }
  const THREE_MATERIAL_DEBUG_DEFAULTS = Object.freeze({
    enabled: false,
    envIntensity: 0.38,
    toneExposure: 1.0,
    forceAuditLog: false,
    materialMode: "imported",
    redMeteorTexturesEnabled: true,
  });
  const THREE_MATERIAL_DEBUG_LIMITS = Object.freeze({
    envIntensity: { min: 0, max: 1.5 },
    toneExposure: { min: 0.5, max: 1.8 },
  });
  const THREE_MATERIAL_AUDIT_LOG_LIMIT = 8;
  const THREE_MATERIAL_MODES = Object.freeze(["imported", "standard_test", "normal_debug", "clay_lit", "diagnostic_unlit"]);
  function isThreeMaterialMode(value) { return THREE_MATERIAL_MODES.includes(String(value)); }
  function buildMeteorGlbAssetPool(fileStem) {
    return Object.freeze(Array.from(
      { length: METEOR_GLB_VARIANTS_PER_COLOR },
      (_, index) => `glb/${fileStem}_${String(index + 1).padStart(2, "0")}.glb`
    ));
  }
  const METEOR_GLB_ASSETS = Object.freeze({
    red: buildMeteorGlbAssetPool("meteor_red_form_core"),
    yellow: buildMeteorGlbAssetPool("meteor_yellow_bond_resin"),
    green: buildMeteorGlbAssetPool("meteor_green_flow_shard"),
    blue: buildMeteorGlbAssetPool("meteor_blue_silence_crystal"),
  });
  let requestedMode = "canvas2d";
  let effectiveMode = "canvas2d";
  let initialized = false;
  let fallbackUsed = false;
  let fallbackReason = null;
  let lastError = null;
  let renderCalls = 0;
  let fallbackCalls = 0;
  let threeWarned = false;
  let threeModeActive = false;
  let threeDependencySource = "unknown";

  window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
  if (window.HC.WorldRendererDebug.globalHelpersEnabled !== false) {
    window.HC.WorldRendererDebug.globalHelpersEnabled = true;
  }
  if (!Number.isFinite(Number(window.HC.WorldRendererDebug.meteorGlbVisualScale))) {
    window.HC.WorldRendererDebug.meteorGlbVisualScale = METEOR_GLB_VISUAL_SCALE_DEFAULT;
  }
  if (!Number.isFinite(Number(window.HC.WorldRendererDebug.meteorGlbDepthScale))) {
    window.HC.WorldRendererDebug.meteorGlbDepthScale = METEOR_GLB_DEPTH_SCALE_DEFAULT;
  }
  if (!THREE_CAMERA_MODELS.includes(String(window.HC.WorldRendererDebug.cameraModel))) {
    window.HC.WorldRendererDebug.cameraModel = "stage_normalized";
  }
  window.HC.WorldRendererDebug.threeLights = Object.assign(
    {},
    THREE_LIGHTS_DEFAULTS,
    window.HC.WorldRendererDebug.threeLights || {}
  );
  window.HC.WorldRendererDebug.materials = Object.assign(
    {},
    THREE_MATERIAL_DEBUG_DEFAULTS,
    window.HC.WorldRendererDebug.materials || {}
  );

  const threeState = {
    initialized: false,
    hasDependency: false,
    canvas: null,
    renderer: null,
    scene: null,
    camera: null,
    orthographicCamera: null,
    perspectiveCamera: null,
    lastError: null,
    renderCalls: 0,
    resizeCalls: 0,
    meteorGroup: null,
    asteroidGroup: null,
    lightsGroup: null,
    ambientLight: null,
    cornerLights: [],
    debugKeyLight: null,
    debugRimLight: null,
    forceHeadlight: null,
    debugSpotLight: null,
    debugSpotLightTarget: null,
    lightHelpersGroup: null,
    lightHelpers: [],
    lightsSettings: Object.assign({}, THREE_LIGHTS_DEFAULTS),
    materialSettings: Object.assign({}, THREE_MATERIAL_DEBUG_DEFAULTS),
    materialOverrideStatus: { activeGlbObjects: 0, activeGlbMeshCount: 0, meshesUsingCurrentMaterialMode: 0, currentMaterialMode: "imported", lastAppliedFrame: null, lastAppliedAtMs: null, restoredImportedMaterials: 0 },
    lightHelperStatus: { mode: "none", count: 0, visible: false },
    lightsPositions: [],
    environment: null,
    environmentCanvas: null,
    glbBlobUrls: new Set(),
    glbMaterialAudit: [],
    glbMaterialAuditLoggedUrls: new Set(),
    glbMaterialAuditLogCount: 0,
    meteorGeometry: null,
    asteroidGeometries: new Map(),
    meteorMaterials: new Map(),
    asteroidMaterials: new Map(),
    meteorMeshes: new Map(),
    meteorGlbCache: new Map(),
    meteorGlbWarnings: new Set(),
    textureLoader: null,
    redMeteorTextureCache: new Map(),
    redMeteorTextureWarnings: new Set(),
    redMeteorTextureUsage: new Map(),
    nextMeteorVisualId: 1,
    meteorGlbVariantReassignments: 0,
    meteorGlbInstanceCreates: 0,
    asteroidMeshes: new Map(),
    threeMeteorRenderEnabled: true,
    threeAsteroidRenderEnabled: true,
    threeMeteorCount: 0,
    threeAsteroidCount: 0,
    threeMeteorLastError: null,
    threeAsteroidLastError: null,
    threeObjectRenderPasses: ["meteors", "asteroids"],
    debugMarker: null,
    debugMarkerEnabled: THREE_DEBUG_MARKER_ENABLED,
    threeMeteorRadiusScale: THREE_METEOR_RADIUS_SCALE,
    threeMeteorMinRadius: THREE_METEOR_MIN_RADIUS,
    firstMeteorSample: null,
    firstMeshSample: null,
    cameraBounds: null,
    worldCameraBounds: null,
    rendererSize: null,
    threeCameraModel: "stage_normalized",
    stageModelEnabled: false,
    stageSettings: { size: THREE_STAGE_SIZE_DEFAULT, scale: 1, cameraDistance: null, renderBounds: null },
    cameraSnapshotCenter: null,
    cameraSnapshotZoom: null,
    cameraSnapshotWorldBounds: null,
    worldBoundsSource: "unknown",
    meteorGroupChildrenCount: 0,
    meteorGlbCacheStats: { loading: 0, ready: 0, failed: 0 },
    asteroidGroupChildrenCount: 0,
    firstMeteorScreenEstimate: null,
    firstMeteorInCameraBounds: null,
    firstMeteorMarker: null,
    glbScaleWarning: null,
  };

  function resetDiagnostics() {
    fallbackUsed = false;
    fallbackReason = null;
    lastError = null;
    renderCalls = 0;
    fallbackCalls = 0;
    threeWarned = false;
    threeModeActive = false;
    effectiveMode = "canvas2d";
    threeState.lastError = null;
    threeState.renderCalls = 0;
    threeState.resizeCalls = 0;
    threeState.threeMeteorCount = 0;
    threeState.threeAsteroidCount = 0;
    threeState.threeMeteorLastError = null;
    threeState.threeAsteroidLastError = null;
    threeDependencySource = "unknown";
    threeState.cameraSnapshotCenter = null;
    threeState.cameraSnapshotZoom = null;
    threeState.cameraSnapshotWorldBounds = null;
    threeState.stageModelEnabled = false;
    threeState.stageSettings = { size: THREE_STAGE_SIZE_DEFAULT, scale: 1, cameraDistance: null, renderBounds: null };
    threeState.glbScaleWarning = null;
    threeState.worldBoundsSource = "unknown";
    threeState.firstMeteorScreenEstimate = null;
    threeState.firstMeteorInCameraBounds = null;
    threeState.meteorGroupChildrenCount = 0;
    threeState.asteroidGroupChildrenCount = 0;
    threeState.meteorGlbCacheStats = getMeteorGlbCacheStats();
    threeState.meteorGlbVariantReassignments = 0;
    threeState.meteorGlbInstanceCreates = 0;
    threeState.glbMaterialAudit = [];
    threeState.glbMaterialAuditLogCount = 0;
    threeState.redMeteorTextureUsage = new Map();
  }

  function setMode(nextMode) {
    requestedMode = ALLOWED_MODES[nextMode] ? nextMode : "canvas2d";
    if (window.HC) window.HC.RENDER_MODE = requestedMode;
    return requestedMode;
  }

  function getMode() {
    return requestedMode;
  }

  function callCanvasFallback(nowMs, dt) {
    const render = window.HC && window.HC.Render;
    if (!render || typeof render.frame !== "function") throw new Error("HC.Render.frame is unavailable");
    render.frame(nowMs, dt);
  }

  function init(options) {
    initialized = true;
    resetDiagnostics();
    const opts = options || {};
    setMode(opts.mode || (window.HC && window.HC.RENDER_MODE) || "canvas2d");
  }

  function ensureThreeCanvas() {
    let canvas = document.getElementById("hc-three-world-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "hc-three-world-canvas";
      canvas.setAttribute("aria-hidden", "true");
      canvas.style.position = "fixed";
      canvas.style.inset = "0";
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "0";
      canvas.style.display = "none";
      canvas.style.visibility = "hidden";
      const app = document.getElementById("app");
      if (app && app.parentNode) app.parentNode.insertBefore(canvas, app);
      else document.body.appendChild(canvas);
    }
    return canvas;
  }

  function detectThreeDependency() {
    const bridgeVersion = window.HC_THREE_BRIDGE_VERSION;
    const loadStatus = window.HC_THREE_LOAD_STATUS;
    const esmReady = window.HC_THREE_READY === true && window.HC_THREE;
    if (esmReady) {
      const dep = window.HC_THREE;
      if (dep && dep.WebGLRenderer && dep.Scene && dep.OrthographicCamera) {
        threeState.hasDependency = true;
        threeDependencySource = "local_vendor_esm";
        threeState.lastError = null;
        return dep;
      }
    }
    if (!bridgeVersion) { threeState.hasDependency = false; threeDependencySource = "bridge_missing"; return null; }
    if (loadStatus === "loading") { threeState.hasDependency = false; threeDependencySource = "local_vendor_esm_loading"; return null; }
    if (loadStatus === "failed") {
      threeState.hasDependency = false;
      threeDependencySource = "local_vendor_esm_failed";
      threeState.lastError = window.HC_THREE_LOAD_ERROR || null;
      return null;
    }
    const dep = window.THREE;
    if (dep && dep.WebGLRenderer && dep.Scene && dep.OrthographicCamera) {
      threeState.hasDependency = true;
      threeDependencySource = "window.THREE_legacy";
      threeState.lastError = null;
      return dep;
    }
    threeState.hasDependency = false;
    threeDependencySource = loadStatus ? "local_vendor_esm_" + loadStatus : "local_vendor_esm_unknown";
    return null;
  }

  function clampNumber(value, fallback, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, n));
  }

  function getGlobalHelpersEnabled() {
    const debugValue = window.HC?.WorldRendererDebug?.globalHelpersEnabled;
    const sessionValue = window.HC?.Session?.debugConfig?.visual?.globalHelpersEnabled;
    return debugValue !== false && sessionValue !== false;
  }

  function setGlobalHelpersEnabled(value) {
    const enabled = value !== false && value !== "false" && value !== "0";
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.globalHelpersEnabled = enabled;
    if (window.HC.Session?.debugConfig?.visual) window.HC.Session.debugConfig.visual.globalHelpersEnabled = enabled;
    syncDebugMarkerPosition();
    updateFirstMeteorDiagnostics();
    syncLightHelpers();
    return enabled;
  }

  function getThreeLightsSettings() {
    const debugLights = window.HC?.WorldRendererDebug?.threeLights || {};
    const sessionLights = window.HC?.Session?.debugConfig?.visual?.threeLights || {};
    const merged = Object.assign({}, THREE_LIGHTS_DEFAULTS, sessionLights, debugLights);
    return {
      enabled: merged.enabled !== false,
      legacyCornerLightsEnabled: merged.legacyCornerLightsEnabled === true,
      pointIntensity: clampNumber(merged.pointIntensity, THREE_LIGHTS_DEFAULTS.pointIntensity, THREE_LIGHTS_LIMITS.pointIntensity.min, THREE_LIGHTS_LIMITS.pointIntensity.max),
      distanceMultiplier: clampNumber(merged.distanceMultiplier ?? merged.distanceRange, THREE_LIGHTS_DEFAULTS.distanceMultiplier, THREE_LIGHTS_LIMITS.distanceMultiplier.min, THREE_LIGHTS_LIMITS.distanceMultiplier.max),
      decay: clampNumber(merged.decay, THREE_LIGHTS_DEFAULTS.decay, THREE_LIGHTS_LIMITS.decay.min, THREE_LIGHTS_LIMITS.decay.max),
      zOffsetMultiplier: clampNumber(merged.zOffsetMultiplier ?? merged.zOffset, THREE_LIGHTS_DEFAULTS.zOffsetMultiplier, THREE_LIGHTS_LIMITS.zOffsetMultiplier.min, THREE_LIGHTS_LIMITS.zOffsetMultiplier.max),
      ambientIntensity: clampNumber(merged.ambientIntensity, THREE_LIGHTS_DEFAULTS.ambientIntensity, THREE_LIGHTS_LIMITS.ambientIntensity.min, THREE_LIGHTS_LIMITS.ambientIntensity.max),
      ambientIsolate: merged.ambientIsolate === true,
      debugKeyLightEnabled: merged.debugKeyLightEnabled === true,
      debugKeyLightIntensity: clampNumber(merged.debugKeyLightIntensity, THREE_LIGHTS_DEFAULTS.debugKeyLightIntensity, THREE_LIGHTS_LIMITS.debugKeyLightIntensity.min, THREE_LIGHTS_LIMITS.debugKeyLightIntensity.max),
      debugRimLightEnabled: merged.debugRimLightEnabled !== false,
      debugRimLightIntensity: clampNumber(merged.debugRimLightIntensity, THREE_LIGHTS_DEFAULTS.debugRimLightIntensity, THREE_LIGHTS_LIMITS.debugRimLightIntensity.min, THREE_LIGHTS_LIMITS.debugRimLightIntensity.max),
      forceHeadlightEnabled: merged.forceHeadlightEnabled === true,
      forceHeadlightIntensity: clampNumber(merged.forceHeadlightIntensity, THREE_LIGHTS_DEFAULTS.forceHeadlightIntensity, THREE_LIGHTS_LIMITS.forceHeadlightIntensity.min, THREE_LIGHTS_LIMITS.forceHeadlightIntensity.max),
      mainStageSpotEnabled: (merged.mainStageSpotEnabled ?? merged.debugSpotLightEnabled ?? THREE_LIGHTS_DEFAULTS.mainStageSpotEnabled) !== false,
      mainStageSpotIntensity: clampNumber(merged.mainStageSpotIntensity ?? merged.debugSpotLightIntensity, THREE_LIGHTS_DEFAULTS.mainStageSpotIntensity, THREE_LIGHTS_LIMITS.mainStageSpotIntensity.min, THREE_LIGHTS_LIMITS.mainStageSpotIntensity.max),
      mainStageSpotAngle: clampNumber(merged.mainStageSpotAngle ?? merged.debugSpotLightAngle, THREE_LIGHTS_DEFAULTS.mainStageSpotAngle, THREE_LIGHTS_LIMITS.mainStageSpotAngle.min, THREE_LIGHTS_LIMITS.mainStageSpotAngle.max),
      mainStageSpotPenumbra: clampNumber(merged.mainStageSpotPenumbra ?? merged.debugSpotLightPenumbra, THREE_LIGHTS_DEFAULTS.mainStageSpotPenumbra, THREE_LIGHTS_LIMITS.mainStageSpotPenumbra.min, THREE_LIGHTS_LIMITS.mainStageSpotPenumbra.max),
      mainStageSpotDistance: clampNumber(merged.mainStageSpotDistance ?? merged.debugSpotLightDistance, THREE_LIGHTS_DEFAULTS.mainStageSpotDistance, THREE_LIGHTS_LIMITS.mainStageSpotDistance.min, THREE_LIGHTS_LIMITS.mainStageSpotDistance.max),
      mainStageSpotDecay: clampNumber(merged.mainStageSpotDecay ?? merged.debugSpotLightDecay, THREE_LIGHTS_DEFAULTS.mainStageSpotDecay, THREE_LIGHTS_LIMITS.mainStageSpotDecay.min, THREE_LIGHTS_LIMITS.mainStageSpotDecay.max),
      mainStageSpotXOffset: clampNumber(merged.mainStageSpotXOffset, THREE_LIGHTS_DEFAULTS.mainStageSpotXOffset, THREE_LIGHTS_LIMITS.mainStageSpotXOffset.min, THREE_LIGHTS_LIMITS.mainStageSpotXOffset.max),
      mainStageSpotYOffset: clampNumber(merged.mainStageSpotYOffset, THREE_LIGHTS_DEFAULTS.mainStageSpotYOffset, THREE_LIGHTS_LIMITS.mainStageSpotYOffset.min, THREE_LIGHTS_LIMITS.mainStageSpotYOffset.max),
      mainStageSpotZHeight: clampNumber(merged.mainStageSpotZHeight, THREE_LIGHTS_DEFAULTS.mainStageSpotZHeight, THREE_LIGHTS_LIMITS.mainStageSpotZHeight.min, THREE_LIGHTS_LIMITS.mainStageSpotZHeight.max),
      mainStageSpotTargetMode: isThreeSpotLightTargetMode(merged.mainStageSpotTargetMode ?? merged.debugSpotLightTargetMode) ? String(merged.mainStageSpotTargetMode ?? merged.debugSpotLightTargetMode) : THREE_LIGHTS_DEFAULTS.mainStageSpotTargetMode,
      debugSpotLightEnabled: (merged.mainStageSpotEnabled ?? merged.debugSpotLightEnabled ?? THREE_LIGHTS_DEFAULTS.mainStageSpotEnabled) !== false,
      debugSpotLightIntensity: clampNumber(merged.mainStageSpotIntensity ?? merged.debugSpotLightIntensity, THREE_LIGHTS_DEFAULTS.mainStageSpotIntensity, THREE_LIGHTS_LIMITS.mainStageSpotIntensity.min, THREE_LIGHTS_LIMITS.mainStageSpotIntensity.max),
      debugSpotLightAngle: clampNumber(merged.mainStageSpotAngle ?? merged.debugSpotLightAngle, THREE_LIGHTS_DEFAULTS.mainStageSpotAngle, THREE_LIGHTS_LIMITS.mainStageSpotAngle.min, THREE_LIGHTS_LIMITS.mainStageSpotAngle.max),
      debugSpotLightPenumbra: clampNumber(merged.mainStageSpotPenumbra ?? merged.debugSpotLightPenumbra, THREE_LIGHTS_DEFAULTS.mainStageSpotPenumbra, THREE_LIGHTS_LIMITS.mainStageSpotPenumbra.min, THREE_LIGHTS_LIMITS.mainStageSpotPenumbra.max),
      debugSpotLightDistance: clampNumber(merged.mainStageSpotDistance ?? merged.debugSpotLightDistance, THREE_LIGHTS_DEFAULTS.mainStageSpotDistance, THREE_LIGHTS_LIMITS.mainStageSpotDistance.min, THREE_LIGHTS_LIMITS.mainStageSpotDistance.max),
      debugSpotLightDecay: clampNumber(merged.mainStageSpotDecay ?? merged.debugSpotLightDecay, THREE_LIGHTS_DEFAULTS.mainStageSpotDecay, THREE_LIGHTS_LIMITS.mainStageSpotDecay.min, THREE_LIGHTS_LIMITS.mainStageSpotDecay.max),
      debugSpotLightTargetMode: isThreeSpotLightTargetMode(merged.mainStageSpotTargetMode ?? merged.debugSpotLightTargetMode) ? String(merged.mainStageSpotTargetMode ?? merged.debugSpotLightTargetMode) : THREE_LIGHTS_DEFAULTS.mainStageSpotTargetMode,
      showLightHelpers: merged.showLightHelpers === true,
    };
  }

  function setThreeLightsDebugSetting(key, value) {
    const current = getThreeLightsSettings();
    const next = Object.assign({}, current);
    if (key === "enabled") next.enabled = value !== false && value !== "false" && value !== "0";
    else if (key === "legacyCornerLightsEnabled") next.legacyCornerLightsEnabled = value === true || value === "true" || value === "1";
    else if (key === "pointIntensity") next.pointIntensity = clampNumber(value, current.pointIntensity, THREE_LIGHTS_LIMITS.pointIntensity.min, THREE_LIGHTS_LIMITS.pointIntensity.max);
    else if (key === "distanceMultiplier") next.distanceMultiplier = clampNumber(value, current.distanceMultiplier, THREE_LIGHTS_LIMITS.distanceMultiplier.min, THREE_LIGHTS_LIMITS.distanceMultiplier.max);
    else if (key === "decay") next.decay = clampNumber(value, current.decay, THREE_LIGHTS_LIMITS.decay.min, THREE_LIGHTS_LIMITS.decay.max);
    else if (key === "zOffsetMultiplier") next.zOffsetMultiplier = clampNumber(value, current.zOffsetMultiplier, THREE_LIGHTS_LIMITS.zOffsetMultiplier.min, THREE_LIGHTS_LIMITS.zOffsetMultiplier.max);
    else if (key === "ambientIntensity") next.ambientIntensity = clampNumber(value, current.ambientIntensity, THREE_LIGHTS_LIMITS.ambientIntensity.min, THREE_LIGHTS_LIMITS.ambientIntensity.max);
    else if (key === "ambientIsolate") next.ambientIsolate = value === true || value === "true" || value === "1";
    else if (key === "debugKeyLightEnabled") next.debugKeyLightEnabled = value === true || value === "true" || value === "1";
    else if (key === "debugKeyLightIntensity") next.debugKeyLightIntensity = clampNumber(value, current.debugKeyLightIntensity, THREE_LIGHTS_LIMITS.debugKeyLightIntensity.min, THREE_LIGHTS_LIMITS.debugKeyLightIntensity.max);
    else if (key === "debugRimLightEnabled") next.debugRimLightEnabled = value !== false && value !== "false" && value !== "0";
    else if (key === "debugRimLightIntensity") next.debugRimLightIntensity = clampNumber(value, current.debugRimLightIntensity, THREE_LIGHTS_LIMITS.debugRimLightIntensity.min, THREE_LIGHTS_LIMITS.debugRimLightIntensity.max);
    else if (key === "forceHeadlightEnabled") next.forceHeadlightEnabled = value === true || value === "true" || value === "1";
    else if (key === "forceHeadlightIntensity") next.forceHeadlightIntensity = clampNumber(value, current.forceHeadlightIntensity, THREE_LIGHTS_LIMITS.forceHeadlightIntensity.min, THREE_LIGHTS_LIMITS.forceHeadlightIntensity.max);
    else if (key === "mainStageSpotEnabled" || key === "debugSpotLightEnabled") next.mainStageSpotEnabled = value === true || value === "true" || value === "1";
    else if (key === "mainStageSpotIntensity" || key === "debugSpotLightIntensity") next.mainStageSpotIntensity = clampNumber(value, current.mainStageSpotIntensity, THREE_LIGHTS_LIMITS.mainStageSpotIntensity.min, THREE_LIGHTS_LIMITS.mainStageSpotIntensity.max);
    else if (key === "mainStageSpotAngle" || key === "debugSpotLightAngle") next.mainStageSpotAngle = clampNumber(value, current.mainStageSpotAngle, THREE_LIGHTS_LIMITS.mainStageSpotAngle.min, THREE_LIGHTS_LIMITS.mainStageSpotAngle.max);
    else if (key === "mainStageSpotPenumbra" || key === "debugSpotLightPenumbra") next.mainStageSpotPenumbra = clampNumber(value, current.mainStageSpotPenumbra, THREE_LIGHTS_LIMITS.mainStageSpotPenumbra.min, THREE_LIGHTS_LIMITS.mainStageSpotPenumbra.max);
    else if (key === "mainStageSpotDistance" || key === "debugSpotLightDistance") next.mainStageSpotDistance = clampNumber(value, current.mainStageSpotDistance, THREE_LIGHTS_LIMITS.mainStageSpotDistance.min, THREE_LIGHTS_LIMITS.mainStageSpotDistance.max);
    else if (key === "mainStageSpotDecay" || key === "debugSpotLightDecay") next.mainStageSpotDecay = clampNumber(value, current.mainStageSpotDecay, THREE_LIGHTS_LIMITS.mainStageSpotDecay.min, THREE_LIGHTS_LIMITS.mainStageSpotDecay.max);
    else if (key === "mainStageSpotXOffset") next.mainStageSpotXOffset = clampNumber(value, current.mainStageSpotXOffset, THREE_LIGHTS_LIMITS.mainStageSpotXOffset.min, THREE_LIGHTS_LIMITS.mainStageSpotXOffset.max);
    else if (key === "mainStageSpotYOffset") next.mainStageSpotYOffset = clampNumber(value, current.mainStageSpotYOffset, THREE_LIGHTS_LIMITS.mainStageSpotYOffset.min, THREE_LIGHTS_LIMITS.mainStageSpotYOffset.max);
    else if (key === "mainStageSpotZHeight") next.mainStageSpotZHeight = clampNumber(value, current.mainStageSpotZHeight, THREE_LIGHTS_LIMITS.mainStageSpotZHeight.min, THREE_LIGHTS_LIMITS.mainStageSpotZHeight.max);
    else if (key === "mainStageSpotTargetMode" || key === "debugSpotLightTargetMode") next.mainStageSpotTargetMode = isThreeSpotLightTargetMode(value) ? String(value) : current.mainStageSpotTargetMode;
    else if (key === "showLightHelpers") next.showLightHelpers = value === true || value === "true" || value === "1";
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.threeLights = next;
    if (window.HC.Session?.debugConfig?.visual) window.HC.Session.debugConfig.visual.threeLights = Object.assign({}, next);
    syncThreeLights();
    return next;
  }

  function getThreeMaterialSettings() {
    const debugMaterials = window.HC?.WorldRendererDebug?.materials || {};
    const sessionMaterials = window.HC?.Session?.debugConfig?.visual?.threeMaterials || {};
    const merged = Object.assign({}, THREE_MATERIAL_DEBUG_DEFAULTS, sessionMaterials, debugMaterials);
    const mode = String(merged.materialMode || "imported");
    return {
      enabled: merged.enabled === true,
      envIntensity: clampNumber(merged.envIntensity, THREE_MATERIAL_DEBUG_DEFAULTS.envIntensity, THREE_MATERIAL_DEBUG_LIMITS.envIntensity.min, THREE_MATERIAL_DEBUG_LIMITS.envIntensity.max),
      toneExposure: clampNumber(merged.toneExposure, THREE_MATERIAL_DEBUG_DEFAULTS.toneExposure, THREE_MATERIAL_DEBUG_LIMITS.toneExposure.min, THREE_MATERIAL_DEBUG_LIMITS.toneExposure.max),
      forceAuditLog: merged.forceAuditLog === true,
      materialMode: isThreeMaterialMode(mode) ? mode : "imported",
      redMeteorTexturesEnabled: merged.redMeteorTexturesEnabled !== false,
    };
  }

  function setThreeMaterialDebugSetting(key, value) {
    const current = getThreeMaterialSettings();
    const next = Object.assign({}, current);
    if (key === "enabled") next.enabled = value === true || value === "true" || value === "1";
    else if (key === "envIntensity") next.envIntensity = clampNumber(value, current.envIntensity, THREE_MATERIAL_DEBUG_LIMITS.envIntensity.min, THREE_MATERIAL_DEBUG_LIMITS.envIntensity.max);
    else if (key === "toneExposure") next.toneExposure = clampNumber(value, current.toneExposure, THREE_MATERIAL_DEBUG_LIMITS.toneExposure.min, THREE_MATERIAL_DEBUG_LIMITS.toneExposure.max);
    else if (key === "forceAuditLog") next.forceAuditLog = value === true || value === "true" || value === "1";
    else if (key === "materialMode") next.materialMode = isThreeMaterialMode(value) ? String(value) : "imported";
    else if (key === "redMeteorTexturesEnabled") next.redMeteorTexturesEnabled = value === true || value === "true" || value === "1";
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.materials = next;
    if (window.HC.Session?.debugConfig?.visual) window.HC.Session.debugConfig.visual.threeMaterials = Object.assign({}, next);
    threeState.materialSettings = Object.assign({}, next);
    applyRendererPbrSettings();
    applyMaterialSettingsToLoadedGlbs();
    if (next.forceAuditLog) logGlbMaterialAudit({ force: true });
    return next;
  }

  function createThreeLights(THREE) {
    const lightsGroup = new THREE.Group();
    lightsGroup.name = "hc_three_stage_lighting";
    const ambientLight = new THREE.AmbientLight(0xffffff, THREE_LIGHTS_DEFAULTS.ambientIntensity);
    ambientLight.name = "hc_three_fill_ambient";
    const lightColors = [0xfff3df, 0xe8f1ff, 0xdff7ff, 0xffead6];
    const cornerLights = lightColors.map((color, index) => {
      const light = new THREE.PointLight(color, 0, 1, THREE_LIGHTS_DEFAULTS.decay);
      light.name = ["hc_legacy_corner_light_top_left", "hc_legacy_corner_light_top_right", "hc_legacy_corner_light_bottom_left", "hc_legacy_corner_light_bottom_right"][index];
      light.castShadow = false;
      light.visible = false;
      return light;
    });
    const debugKeyLight = new THREE.PointLight(0xfff0d8, THREE_LIGHTS_DEFAULTS.debugKeyLightIntensity, 1, 1.05);
    debugKeyLight.name = "hc_debug_key_light_front_left_top";
    debugKeyLight.castShadow = false;
    debugKeyLight.visible = false;
    const debugRimLight = new THREE.PointLight(0xcfe2ff, THREE_LIGHTS_DEFAULTS.debugRimLightIntensity, 1, 1.1);
    debugRimLight.name = "hc_debug_rim_light_back_right";
    debugRimLight.castShadow = false;
    debugRimLight.visible = false;
    const forceHeadlight = new THREE.PointLight(0xffffff, THREE_LIGHTS_DEFAULTS.forceHeadlightIntensity, 0, 0.85);
    forceHeadlight.name = "hc_debug_force_headlight_camera_center";
    forceHeadlight.castShadow = false;
    forceHeadlight.visible = false;
    const debugSpotLightTarget = new THREE.Object3D();
    debugSpotLightTarget.name = "hc_main_stage_spot_target";
    debugSpotLightTarget.position.set(0, 0, 0);
    const debugSpotLight = new THREE.SpotLight(0xffffff, THREE_LIGHTS_DEFAULTS.mainStageSpotIntensity, THREE_LIGHTS_DEFAULTS.mainStageSpotDistance, THREE_LIGHTS_DEFAULTS.mainStageSpotAngle, THREE_LIGHTS_DEFAULTS.mainStageSpotPenumbra, THREE_LIGHTS_DEFAULTS.mainStageSpotDecay);
    debugSpotLight.name = "hc_main_stage_spot";
    debugSpotLight.castShadow = false;
    debugSpotLight.visible = true;
    debugSpotLight.target = debugSpotLightTarget;
    lightsGroup.add(ambientLight);
    cornerLights.forEach((light) => lightsGroup.add(light));
    lightsGroup.add(debugKeyLight);
    lightsGroup.add(debugRimLight);
    lightsGroup.add(forceHeadlight);
    lightsGroup.add(debugSpotLightTarget);
    lightsGroup.add(debugSpotLight);
    Object.assign(threeState, { lightsGroup, ambientLight, cornerLights, debugKeyLight, debugRimLight, forceHeadlight, debugSpotLight, debugSpotLightTarget });
    return lightsGroup;
  }

  function ensureLightHelpers(THREE) {
    if (!threeState.scene) return null;
    if (threeState.lightHelpersGroup) return threeState.lightHelpersGroup;
    const helpersGroup = new THREE.Group();
    helpersGroup.name = "hc_three_light_debug_helpers";
    helpersGroup.renderOrder = 9998;
    threeState.scene.add(helpersGroup);
    threeState.lightHelpersGroup = helpersGroup;
    return helpersGroup;
  }

  function rebuildLightHelpers(THREE) {
    const helpersGroup = ensureLightHelpers(THREE);
    if (!helpersGroup) return;
    while (helpersGroup.children.length) helpersGroup.remove(helpersGroup.children[0]);
    threeState.lightHelpers = [];
    const markerGeometry = THREE.SphereGeometry ? new THREE.SphereGeometry(10, 16, 10) : null;
    const allLights = getAllDiagnosticLights();
    allLights.forEach((entry) => {
      const light = entry.light;
      if (!light) return;
      if (THREE.PointLightHelper && light.isPointLight) {
        const pointHelper = new THREE.PointLightHelper(light, 18, entry.color || light.color?.getHex?.());
        pointHelper.name = `hc_helper_${entry.name}`;
        pointHelper.userData = Object.assign({}, pointHelper.userData, { hcIsPointLightHelper: true, hcHelperMode: "pointLightHelper" });
        pointHelper.renderOrder = 9998;
        helpersGroup.add(pointHelper);
        threeState.lightHelpers.push({ name: entry.name, light, helper: pointHelper, mode: "pointLightHelper" });
      }
      if (THREE.SpotLightHelper && light.isSpotLight) {
        const spotHelper = new THREE.SpotLightHelper(light, entry.color || light.color?.getHex?.());
        spotHelper.name = `hc_helper_${entry.name}`;
        spotHelper.userData = Object.assign({}, spotHelper.userData, { hcIsSpotLightHelper: true, hcHelperMode: "spotLightHelper" });
        spotHelper.renderOrder = 9998;
        helpersGroup.add(spotHelper);
        threeState.lightHelpers.push({ name: entry.name, light, helper: spotHelper, mode: "spotLightHelper" });
      }
      if (markerGeometry && THREE.MeshBasicMaterial) {
        const marker = new THREE.Mesh(markerGeometry, new THREE.MeshBasicMaterial({ color: entry.color || 0xffffff, depthTest: false, depthWrite: false, transparent: true, opacity: 1 }));
        marker.name = `hc_marker_${entry.name}`;
        marker.position.copy(light.position);
        marker.renderOrder = 9999;
        marker.userData = Object.assign({}, marker.userData, { hcHelperMode: "fallbackMarkers", hcTracksLightTarget: false });
        helpersGroup.add(marker);
        threeState.lightHelpers.push({ name: entry.name, light, helper: marker, mode: "fallbackMarkers", tracks: "light" });
        if (entry.target) {
          const targetMarker = new THREE.Mesh(markerGeometry, new THREE.MeshBasicMaterial({ color: 0x66ffcc, depthTest: false, depthWrite: false, transparent: true, opacity: 0.9 }));
          targetMarker.name = `hc_marker_${entry.name}_target`;
          targetMarker.position.copy(entry.target.position);
          targetMarker.renderOrder = 9999;
          targetMarker.userData = Object.assign({}, targetMarker.userData, { hcHelperMode: "fallbackMarkers", hcTracksLightTarget: true });
          helpersGroup.add(targetMarker);
          threeState.lightHelpers.push({ name: `${entry.name}Target`, light, target: entry.target, helper: targetMarker, mode: "fallbackMarkers", tracks: "target" });
        }
      }
    });
  }

  function syncLightHelpers() {
    const THREE = window.HC_THREE || window.THREE;
    const settings = threeState.lightsSettings || getThreeLightsSettings();
    if (!THREE || !threeState.scene) return;
    if (!getGlobalHelpersEnabled() || !settings.showLightHelpers) {
      if (threeState.lightHelpersGroup) threeState.lightHelpersGroup.visible = false;
      threeState.lightHelperStatus = { mode: getGlobalHelpersEnabled() ? "off" : "global_off", count: threeState.lightHelpers.length, visible: false };
      return;
    }
    if (!threeState.lightHelpersGroup || !threeState.lightHelpers.length) rebuildLightHelpers(THREE);
    if (!threeState.lightHelpersGroup) return;
    threeState.lightHelpersGroup.visible = getGlobalHelpersEnabled();
    threeState.lightHelpers.forEach((entry) => {
      if (!entry?.helper || !entry.light) return;
      entry.helper.visible = getGlobalHelpersEnabled() && !!entry.light.visible;
      if (entry.helper.position && !entry.helper.userData?.hcIsPointLightHelper && !entry.helper.userData?.hcIsSpotLightHelper) {
        const trackedPosition = entry.tracks === "target" ? entry.target?.position : entry.light.position;
        if (trackedPosition) entry.helper.position.copy(trackedPosition);
      }
      if (typeof entry.helper.update === "function") entry.helper.update();
    });
    const modes = Array.from(new Set(threeState.lightHelpers.map((entry) => entry.mode).filter(Boolean)));
    threeState.lightHelperStatus = { mode: modes.join("+") || "none", count: threeState.lightHelpers.length, visible: !!threeState.lightHelpersGroup.visible };
  }

  function getAllDiagnosticLights() {
    const entries = [];
    const names = ["topLeft", "topRight", "bottomLeft", "bottomRight"];
    const colors = [0xfff3df, 0xe8f1ff, 0xdff7ff, 0xffead6];
    (threeState.cornerLights || []).forEach((light, index) => entries.push({ name: names[index] || `corner${index}`, light, color: colors[index] || 0xffffff, role: "corner" }));
    if (threeState.debugKeyLight) entries.push({ name: "debugKey", light: threeState.debugKeyLight, color: 0xfff0d8, role: "debug_key" });
    if (threeState.debugRimLight) entries.push({ name: "debugRim", light: threeState.debugRimLight, color: 0xcfe2ff, role: "debug_rim" });
    if (threeState.forceHeadlight) entries.push({ name: "forceHeadlight", light: threeState.forceHeadlight, color: 0xffffff, role: "force_headlight" });
    if (threeState.debugSpotLight) entries.push({ name: "mainStageSpot", light: threeState.debugSpotLight, target: threeState.debugSpotLightTarget, color: 0xffffff, role: "main_stage_spot" });
    return entries;
  }


  function getFirstActiveGlbLightTargetObject() {
    for (const entry of threeState.meteorMeshes.values()) {
      if (!entry?.glb?.visible && !entry?.fallback?.visible) continue;
      const object = entry.root || (entry.glb?.visible ? entry.glb : null);
      if (object?.position) return object;
    }
    for (const mesh of threeState.asteroidMeshes.values()) {
      if (mesh?.visible && mesh.position) return mesh;
    }
    return null;
  }

  function syncThreeLights() {
    if (!threeState.ambientLight || !Array.isArray(threeState.cornerLights)) return;
    const settings = getThreeLightsSettings();
    threeState.lightsSettings = settings;
    const bounds = threeState.cameraBounds || { left: 0, right: 1, top: 0, bottom: 1, cx: 0.5, cy: 0.5 };
    const width = Math.max(1, Math.abs(bounds.right - bounds.left));
    const height = Math.max(1, Math.abs(bounds.bottom - bounds.top));
    const maxDim = Math.max(width, height);
    const z = Math.max(12, height * settings.zOffsetMultiplier);
    const distance = Math.max(maxDim, maxDim * settings.distanceMultiplier);
    const marginX = width * 0.08;
    const marginY = height * 0.08;
    const positions = [
      { name: "topLeft", x: bounds.left + marginX, y: bounds.top + marginY, z },
      { name: "topRight", x: bounds.right - marginX, y: bounds.top + marginY, z },
      { name: "bottomLeft", x: bounds.left + marginX, y: bounds.bottom - marginY, z },
      { name: "bottomRight", x: bounds.right - marginX, y: bounds.bottom - marginY, z },
    ];
    const effectiveAmbient = settings.ambientIsolate ? 0 : settings.ambientIntensity;
    threeState.ambientLight.intensity = settings.enabled ? effectiveAmbient : 0;
    threeState.ambientLight.visible = settings.enabled && effectiveAmbient > 0;
    threeState.lightsPositions = positions;
    threeState.cornerLights.forEach((light, index) => {
      const pos = positions[index];
      if (!light || !pos) return;
      light.position.set(pos.x, pos.y, pos.z);
      light.intensity = settings.enabled && settings.legacyCornerLightsEnabled ? settings.pointIntensity : 0;
      light.distance = distance;
      light.decay = settings.decay;
      light.visible = settings.enabled && settings.legacyCornerLightsEnabled && settings.pointIntensity > 0;
    });
    const debugKeyDistance = Math.max(maxDim, maxDim * Math.max(1.1, settings.distanceMultiplier));
    if (threeState.debugKeyLight) {
      threeState.debugKeyLight.position.set(bounds.left + width * 0.28, bounds.top + height * 0.22, Math.max(18, height * 0.72));
      threeState.debugKeyLight.intensity = settings.debugKeyLightEnabled ? settings.debugKeyLightIntensity : 0;
      threeState.debugKeyLight.distance = debugKeyDistance;
      threeState.debugKeyLight.decay = 1.05;
      threeState.debugKeyLight.visible = settings.debugKeyLightEnabled && settings.debugKeyLightIntensity > 0;
    }
    if (threeState.debugRimLight) {
      threeState.debugRimLight.position.set(bounds.right - width * 0.18, bounds.bottom - height * 0.18, Math.max(16, height * 0.55));
      threeState.debugRimLight.intensity = settings.debugKeyLightEnabled && settings.debugRimLightEnabled ? settings.debugRimLightIntensity : 0;
      threeState.debugRimLight.distance = debugKeyDistance;
      threeState.debugRimLight.decay = 1.1;
      threeState.debugRimLight.visible = settings.debugKeyLightEnabled && settings.debugRimLightEnabled && settings.debugRimLightIntensity > 0;
    }
    if (threeState.forceHeadlight) {
      threeState.forceHeadlight.position.set(bounds.cx, bounds.cy, Math.max(24, height * 0.82));
      threeState.forceHeadlight.intensity = settings.forceHeadlightEnabled ? settings.forceHeadlightIntensity : 0;
      threeState.forceHeadlight.distance = 0;
      threeState.forceHeadlight.decay = 0.85;
      threeState.forceHeadlight.visible = settings.forceHeadlightEnabled && settings.forceHeadlightIntensity > 0;
    }
    const spotTargetObject = settings.mainStageSpotTargetMode === "sampleObject" ? getFirstActiveGlbLightTargetObject() : null;
    const spotTargetX = spotTargetObject?.position ? spotTargetObject.position.x : bounds.cx;
    const spotTargetY = spotTargetObject?.position ? spotTargetObject.position.y : bounds.cy;
    const spotTargetZ = spotTargetObject?.position ? spotTargetObject.position.z : 0;
    if (threeState.debugSpotLightTarget) {
      threeState.debugSpotLightTarget.position.set(spotTargetX, spotTargetY, spotTargetZ);
      threeState.debugSpotLightTarget.updateMatrixWorld?.();
    }
    if (threeState.debugSpotLight) {
      threeState.debugSpotLight.position.set(
        bounds.cx + width * settings.mainStageSpotXOffset,
        bounds.cy + height * settings.mainStageSpotYOffset,
        Math.max(24, height * settings.mainStageSpotZHeight)
      );
      threeState.debugSpotLight.intensity = settings.mainStageSpotEnabled ? settings.mainStageSpotIntensity : 0;
      threeState.debugSpotLight.angle = settings.mainStageSpotAngle;
      threeState.debugSpotLight.penumbra = settings.mainStageSpotPenumbra;
      threeState.debugSpotLight.distance = settings.mainStageSpotDistance;
      threeState.debugSpotLight.decay = settings.mainStageSpotDecay;
      threeState.debugSpotLight.castShadow = false;
      threeState.debugSpotLight.visible = settings.mainStageSpotEnabled && settings.mainStageSpotIntensity > 0;
      if (threeState.debugSpotLightTarget) threeState.debugSpotLight.target = threeState.debugSpotLightTarget;
    }
    syncLightHelpers();
  }

  function useThreeCamera(camera) {
    if (!camera || threeState.camera === camera) return;
    threeState.camera = camera;
  }

  function applyThreeCameraSnapshot(renderSnapshot) {
    const cam = renderSnapshot?.camera || {};
    const diag = renderSnapshot?.diagnostics || {};
    const viewport = cam.viewport || {};
    const width = Math.max(1, Number(viewport.width) || 1);
    const height = Math.max(1, Number(viewport.height) || 1);
    const bounds = cam.worldBounds || null;
    let left = 0; let right = width; let top = 0; let bottom = height;
    if (bounds && Number.isFinite(bounds.l) && Number.isFinite(bounds.r) && Number.isFinite(bounds.t) && Number.isFinite(bounds.b)) {
      left = bounds.l; right = bounds.r; top = bounds.t; bottom = bounds.b;
    } else {
      const cxFallback = Number.isFinite(cam.x) ? cam.x : (Number.isFinite(cam.centerX) ? cam.centerX : width * 0.5);
      const cyFallback = Number.isFinite(cam.y) ? cam.y : (Number.isFinite(cam.centerY) ? cam.centerY : height * 0.5);
      const zoom = Math.max(0.001, Number(cam.zoom) || 1);
      const halfW = (width * 0.5) / zoom;
      const halfH = (height * 0.5) / zoom;
      left = cxFallback - halfW;
      right = cxFallback + halfW;
      top = cyFallback - halfH;
      bottom = cyFallback + halfH;
    }
    const cx = (left + right) * 0.5;
    const cy = (top + bottom) * 0.5;
    const worldBounds = { left, right, top, bottom, cx, cy };
    threeState.worldCameraBounds = worldBounds;
    threeState.cameraSnapshotCenter = { x: Number.isFinite(cam.centerX) ? cam.centerX : (Number.isFinite(cam.x) ? cam.x : cx), y: Number.isFinite(cam.centerY) ? cam.centerY : (Number.isFinite(cam.y) ? cam.y : cy) };
    threeState.cameraSnapshotZoom = Math.max(0.001, Number(cam.zoom) || 1);
    threeState.cameraSnapshotWorldBounds = bounds && Number.isFinite(bounds.l) ? { l: bounds.l, r: bounds.r, t: bounds.t, b: bounds.b } : null;
    threeState.worldBoundsSource = diag.worldBoundsSource || diag.cameraAvailability?.worldBoundsSource || "unknown";

    const cameraModel = getThreeCameraModel();
    if (cameraModel === "stage_normalized" && threeState.perspectiveCamera) {
      const sourceWidth = Math.max(1, Math.abs(right - left));
      const sourceHeight = Math.max(1, Math.abs(bottom - top));
      const stageSize = getThreeStageSize();
      const stageScale = stageSize / Math.max(sourceWidth, sourceHeight);
      const stageWidth = sourceWidth * stageScale;
      const stageHeight = sourceHeight * stageScale;
      const stageBounds = { left: -stageWidth * 0.5, right: stageWidth * 0.5, top: stageHeight * 0.5, bottom: -stageHeight * 0.5, cx: 0, cy: 0 };
      const aspect = width / Math.max(1, height);
      const fov = THREE_STAGE_CAMERA_FOV;
      const tan = Math.tan((fov * Math.PI / 180) * 0.5);
      const fitHeightDistance = (stageHeight * 0.5) / Math.max(1e-6, tan);
      const fitWidthDistance = (stageWidth * 0.5) / Math.max(1e-6, tan * aspect);
      const cameraDistance = Math.max(fitHeightDistance, fitWidthDistance, stageSize) * 1.08;
      useThreeCamera(threeState.perspectiveCamera);
      threeState.perspectiveCamera.fov = fov;
      threeState.perspectiveCamera.aspect = aspect;
      threeState.perspectiveCamera.near = 0.1;
      threeState.perspectiveCamera.far = Math.max(1000, cameraDistance + stageSize * 4);
      threeState.perspectiveCamera.position.set(0, 0, cameraDistance);
      threeState.perspectiveCamera.up.set(0, 1, 0);
      threeState.perspectiveCamera.lookAt(0, 0, 0);
      threeState.perspectiveCamera.updateProjectionMatrix();
      threeState.threeCameraModel = "stage_normalized";
      threeState.stageModelEnabled = true;
      threeState.stageSettings = { size: stageSize, scale: stageScale, cameraDistance, renderBounds: stageBounds };
      threeState.cameraBounds = stageBounds;
    } else {
      useThreeCamera(threeState.orthographicCamera || threeState.camera);
      if (threeState.camera?.isOrthographicCamera) {
        threeState.camera.left = left;
        threeState.camera.right = right;
        threeState.camera.top = top;
        threeState.camera.bottom = bottom;
        threeState.camera.near = 0.1;
        threeState.camera.far = 1000;
        threeState.camera.position.set(0, 0, 10);
        threeState.camera.updateProjectionMatrix();
      }
      threeState.threeCameraModel = "absolute_bounds";
      threeState.stageModelEnabled = false;
      threeState.stageSettings = { size: THREE_STAGE_SIZE_DEFAULT, scale: 1, cameraDistance: null, renderBounds: null };
      threeState.cameraBounds = worldBounds;
    }
    syncDebugMarkerPosition();
    syncThreeLights();
  }

  function createDebugMarker(THREE) {
    if (!threeState.debugMarkerEnabled || threeState.debugMarker) return;
    const marker = new THREE.Group();
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthTest: false, depthWrite: false });
    const half = THREE_DEBUG_MARKER_SIZE * 0.5;
    const pointsA = [new THREE.Vector3(-half, 0, 0), new THREE.Vector3(half, 0, 0)];
    const pointsB = [new THREE.Vector3(0, -half, 0), new THREE.Vector3(0, half, 0)];
    marker.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsA), material));
    marker.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsB), material));
    marker.renderOrder = 9999;
    threeState.scene.add(marker);
    threeState.debugMarker = marker;
  }


  function createFirstMeteorMarker(THREE) {
    if (threeState.firstMeteorMarker) return;
    const marker = new THREE.Group();
    const material = new THREE.LineBasicMaterial({ color: 0xff4d7a, transparent: true, opacity: 0.95, depthTest: false, depthWrite: false });
    const half = THREE_DEBUG_MARKER_SIZE * 0.35;
    const pointsA = [new THREE.Vector3(-half, -half, 0), new THREE.Vector3(half, half, 0)];
    const pointsB = [new THREE.Vector3(-half, half, 0), new THREE.Vector3(half, -half, 0)];
    marker.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsA), material));
    marker.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pointsB), material));
    marker.renderOrder = 10000;
    threeState.scene.add(marker);
    threeState.firstMeteorMarker = marker;
  }

  function updateFirstMeteorDiagnostics() {
    const first = threeState.firstMeteorSample;
    const bounds = threeState.worldCameraBounds || threeState.cameraBounds;
    const viewport = { width: Number(threeState.renderer?.domElement?.width || 0), height: Number(threeState.renderer?.domElement?.height || 0) };
    if (!first || !bounds) {
      threeState.firstMeteorInCameraBounds = null;
      threeState.firstMeteorScreenEstimate = null;
      if (threeState.firstMeteorMarker) threeState.firstMeteorMarker.visible = false;
      return;
    }
    const inBounds = first.x >= bounds.left && first.x <= bounds.right && first.y >= bounds.top && first.y <= bounds.bottom;
    const sx = ((first.x - bounds.left) / Math.max(1e-6, bounds.right - bounds.left)) * viewport.width;
    const sy = ((first.y - bounds.top) / Math.max(1e-6, bounds.bottom - bounds.top)) * viewport.height;
    threeState.firstMeteorInCameraBounds = inBounds;
    threeState.firstMeteorScreenEstimate = { x: sx, y: sy };
    if (threeState.firstMeteorMarker) {
      const markerPos = first.renderedPosition || applyRenderSpaceToVector(first.x, first.y, 2);
      threeState.firstMeteorMarker.position.set(markerPos.x, markerPos.y, 2);
      threeState.firstMeteorMarker.visible = getGlobalHelpersEnabled() && !!threeState.debugMarkerEnabled;
    }
  }

  function syncDebugMarkerPosition() {
    if (!threeState.debugMarker || !threeState.cameraBounds) return;
    threeState.debugMarker.position.set(threeState.cameraBounds.cx, threeState.cameraBounds.cy, 2);
    threeState.debugMarker.visible = getGlobalHelpersEnabled() && !!threeState.debugMarkerEnabled;
  }

  function resize(renderSnapshot) {
    if (!threeState.initialized || !threeState.renderer || !threeState.camera || !threeState.canvas) return;
    const view = renderSnapshot?.camera?.viewport || (window.HC?.getView?.() || window.View);
    if (!view || !view.width && !view.w) return;
    const w = Number(view.width || view.w) || 1;
    const h = Number(view.height || view.h) || 1;
    const dpr = Math.max(1, Number((window.HC?.getView?.() || window.View || {}).dpr) || 1);
    const cssW = Math.max(1, w / dpr);
    const cssH = Math.max(1, h / dpr);
    threeState.resizeCalls += 1;
    threeState.canvas.style.width = cssW + "px";
    threeState.canvas.style.height = cssH + "px";
    threeState.renderer.setPixelRatio(dpr);
    threeState.renderer.setSize(cssW, cssH, false);
    applyThreeCameraSnapshot(renderSnapshot || {});
  }

  function getMeteorMaterial(THREE, colorKey) {
    const key = colorKey || "neutral";
    const existing = threeState.meteorMaterials.get(key);
    if (existing) return existing;
    const colorMap = { red: 0xff6b6b, yellow: 0xffd166, green: 0x6ee7a8, blue: 0x7dbdff, neutral: 0xb6bfd2 };
    const mat = new THREE.MeshStandardMaterial({
      color: colorMap[key] || colorMap.neutral,
      roughness: 0.72,
      metalness: key === "yellow" || key === "blue" ? 0.18 : 0.08,
      envMapIntensity: getThreeMaterialSettings().envIntensity,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    threeState.meteorMaterials.set(key, mat);
    return mat;
  }


  function resolvePublicAssetPath(path) {
    const cleanPath = String(path || "").replace(/^\/+/, "");
    const helper = window.HC?.publicAssetPath || window.HC?.publicPath;
    if (typeof helper === "function") return helper(cleanPath);
    try { return new URL(cleanPath, document.baseURI || window.location.href).href; }
    catch { return cleanPath; }
  }

  function buildRedMeteorTexturePalette() {
    return RED_METEOR_TEXTURE_PATHS.map((path) => ({ path, url: resolvePublicAssetPath(path) }));
  }

  function chooseRedMeteorTexture() {
    const palette = buildRedMeteorTexturePalette();
    if (!palette.length) return null;
    const index = Math.floor(Math.random() * palette.length) % palette.length;
    return Object.assign({ index }, palette[index]);
  }

  function warnRedMeteorTextureOnce(url, message) {
    if (threeState.redMeteorTextureWarnings.has(url)) return;
    threeState.redMeteorTextureWarnings.add(url);
    if (window.console?.warn) window.console.warn(`[HC.WorldRenderer] Red meteor texture fallback for ${url}: ${message}`);
  }

  function configureRedMeteorTexture(THREE, texture) {
    if (!texture) return texture;
    if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
    else if (THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;
    texture.needsUpdate = true;
    return texture;
  }

  function loadRedMeteorTexture(THREE, assignment) {
    if (!assignment?.url || !THREE?.TextureLoader) return null;
    let entry = threeState.redMeteorTextureCache.get(assignment.url);
    if (entry) return entry;
    if (!threeState.textureLoader) threeState.textureLoader = new THREE.TextureLoader();
    entry = { status: "loading", texture: null, error: null, url: assignment.url, path: assignment.path, name: assignment.path?.split("/").pop() || assignment.url };
    threeState.redMeteorTextureCache.set(assignment.url, entry);
    threeState.textureLoader.load(
      assignment.url,
      (texture) => {
        entry.texture = configureRedMeteorTexture(THREE, texture);
        entry.status = "ready";
      },
      undefined,
      (error) => {
        entry.status = "failed";
        entry.error = error?.message || String(error || "load error");
        warnRedMeteorTextureOnce(assignment.url, entry.error);
      }
    );
    return entry;
  }

  function getRedMeteorTextureCacheStats() {
    const stats = { loading: 0, ready: 0, failed: 0, total: threeState.redMeteorTextureCache.size };
    for (const entry of threeState.redMeteorTextureCache.values()) {
      if (entry?.status === "ready") stats.ready += 1;
      else if (entry?.status === "failed") stats.failed += 1;
      else stats.loading += 1;
    }
    return stats;
  }

  function countRedMeteorTextureUsage() {
    const counts = {};
    for (const paletteEntry of buildRedMeteorTexturePalette()) counts[paletteEntry.path] = 0;
    for (const entry of threeState.meteorMeshes.values()) {
      const path = entry?.redTextureAssignment?.path;
      if (entry?.colorKey === "red" && path) counts[path] = (counts[path] || 0) + 1;
    }
    return counts;
  }

  function rememberOriginalMaterialMap(material) {
    if (!material) return;
    material.userData = material.userData || {};
    if (!Object.prototype.hasOwnProperty.call(material.userData, "hcRedMeteorOriginalMap")) {
      material.userData.hcRedMeteorOriginalMap = material.map || null;
    }
  }

  function restoreRedMeteorMaterialMap(material) {
    if (!material) return;
    rememberOriginalMaterialMap(material);
    const originalMap = material.userData.hcRedMeteorOriginalMap || null;
    if (material.map !== originalMap || material.userData.hcRedMeteorTextureAppliedUrl) {
      material.map = originalMap;
      material.userData.hcRedMeteorTextureAppliedUrl = null;
      material.needsUpdate = true;
    }
  }

  function applyRedMeteorTextureToMaterial(material, texture, textureUrl) {
    if (!material || !texture) return;
    rememberOriginalMaterialMap(material);
    if (material.map !== texture) {
      material.map = texture;
      material.needsUpdate = true;
    }
    if ("roughness" in material) material.roughness = RED_METEOR_TEXTURE_ROUGHNESS;
    if ("metalness" in material) material.metalness = RED_METEOR_TEXTURE_METALNESS;
    material.userData.hcRedMeteorTextureAppliedUrl = textureUrl;
  }

  function syncRedMeteorTexturePaletteForEntry(THREE, entry) {
    if (!entry?.glb) return;
    const settings = threeState.materialSettings || getThreeMaterialSettings();
    const enabled = settings.redMeteorTexturesEnabled !== false && (settings.materialMode || "imported") === "imported";
    if (entry.colorKey !== "red" || !enabled || !entry.redTextureAssignment) {
      if (entry.redTextureAppliedUrl || entry.redTextureRestorePending) {
        entry.glb.traverse?.((object) => {
          if (!object.isMesh) return;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          const originalMaterials = Array.isArray(object.userData?.hcOriginalMaterial) ? object.userData.hcOriginalMaterial : [object.userData?.hcOriginalMaterial];
          Array.from(new Set(materials.concat(originalMaterials).filter(Boolean))).forEach(restoreRedMeteorMaterialMap);
        });
        entry.redTextureAppliedUrl = null;
        entry.redTextureRestorePending = false;
      }
      return;
    }
    const textureEntry = loadRedMeteorTexture(THREE, entry.redTextureAssignment);
    entry.redTextureStatus = textureEntry?.status || "unavailable";
    if (textureEntry?.status !== "ready" || !textureEntry.texture) return;
    if (entry.redTextureAppliedUrl === textureEntry.url) return;
    entry.glb.traverse?.((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => applyRedMeteorTextureToMaterial(material, textureEntry.texture, textureEntry.url));
    });
    entry.redTextureAppliedUrl = textureEntry.url;
    entry.redTextureRestorePending = true;
    entry.root.userData.redMeteorTextureUrl = textureEntry.url;
    entry.root.userData.redMeteorTextureName = textureEntry.name;
  }

  function chooseMeteorGlbAsset(colorKey, visualId) {
    const pool = METEOR_GLB_ASSETS[colorKey];
    if (!pool || !pool.length) return null;
    const numericId = Math.max(1, Math.floor(Number(visualId) || 1));
    const variantIndex = (numericId - 1) % pool.length;
    const path = pool[variantIndex];
    return { path, url: resolvePublicAssetPath(path), variantIndex };
  }

  function disposeMeteorGlbInstance(entry) {
    if (!entry?.glb) return;
    entry.root?.remove?.(entry.glb);
    entry.glb.traverse?.((object) => {
      if (!object.isMesh) return;
      const currentMaterials = Array.isArray(object.material) ? object.material : [object.material];
      const originalMaterials = Array.isArray(object.userData?.hcOriginalMaterial) ? object.userData.hcOriginalMaterial : [object.userData?.hcOriginalMaterial];
      Array.from(new Set(currentMaterials.concat(originalMaterials).filter(Boolean))).forEach((material) => {
        if (typeof material.dispose === "function") material.dispose();
      });
    });
    entry.glb = null;
  }

  function assignMeteorGlbAsset(entry, colorKey, { countReassignment = false } = {}) {
    if (!entry) return null;
    const assignment = chooseMeteorGlbAsset(colorKey, entry.visualId);
    const previousUrl = entry.assetUrl || null;
    entry.colorKey = colorKey;
    entry.root.userData.colorKey = colorKey;
    if (colorKey === "red" && !entry.redTextureAssignment) entry.redTextureAssignment = chooseRedMeteorTexture();
    if (colorKey !== "red") {
      entry.redTextureAssignment = null;
      entry.redTextureAppliedUrl = null;
      entry.redTextureStatus = "disabled";
      entry.root.userData.redMeteorTextureUrl = null;
      entry.root.userData.redMeteorTextureName = null;
    }
    if (!assignment) {
      if (previousUrl) disposeMeteorGlbInstance(entry);
      entry.assetUrl = null;
      entry.variantIndex = null;
      entry.glbStatus = "fallback";
      entry.root.userData.glbAssetUrl = null;
      entry.root.userData.glbVariantIndex = null;
      entry.root.userData.glbStatus = entry.glbStatus;
      if (entry.glb) entry.glb.visible = false;
      entry.fallback.visible = true;
      return null;
    }
    if (previousUrl && previousUrl !== assignment.url) disposeMeteorGlbInstance(entry);
    entry.assetUrl = assignment.url;
    entry.variantIndex = assignment.variantIndex;
    entry.glbStatus = "assigned";
    entry.root.userData.glbAssetUrl = assignment.url;
    entry.root.userData.glbVariantIndex = assignment.variantIndex;
    entry.root.userData.glbStatus = entry.glbStatus;
    if (countReassignment && previousUrl && previousUrl !== assignment.url) {
      threeState.meteorGlbVariantReassignments += 1;
    }
    return assignment;
  }

  function warnMeteorGlbOnce(url, message) {
    if (threeState.meteorGlbWarnings.has(url)) return;
    threeState.meteorGlbWarnings.add(url);
    if (window.console?.warn) window.console.warn(`[HC.WorldRenderer] Meteor GLB fallback for ${url}: ${message}`);
  }

  function clampMeteorGlbVisualScale(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return METEOR_GLB_VISUAL_SCALE_DEFAULT;
    return Math.max(METEOR_GLB_VISUAL_SCALE_MIN, Math.min(METEOR_GLB_VISUAL_SCALE_MAX, n));
  }

  function getMeteorGlbVisualScale() {
    const debugValue = window.HC?.WorldRendererDebug?.meteorGlbVisualScale;
    const sessionValue = window.HC?.Session?.debugConfig?.visual?.meteorGlbVisualScale;
    return clampMeteorGlbVisualScale(debugValue ?? sessionValue ?? METEOR_GLB_VISUAL_SCALE_DEFAULT);
  }

  function setMeteorGlbVisualScale(value) {
    const scale = clampMeteorGlbVisualScale(value);
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.meteorGlbVisualScale = scale;
    if (window.HC.Session?.debugConfig?.visual) {
      window.HC.Session.debugConfig.visual.meteorGlbVisualScale = scale;
    }
    return scale;
  }



  function clampMeteorGlbDepthScale(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return METEOR_GLB_DEPTH_SCALE_DEFAULT;
    return Math.max(METEOR_GLB_DEPTH_SCALE_MIN, Math.min(METEOR_GLB_DEPTH_SCALE_MAX, n));
  }

  function getMeteorGlbDepthScale() {
    const debugValue = window.HC?.WorldRendererDebug?.meteorGlbDepthScale;
    const sessionValue = window.HC?.Session?.debugConfig?.visual?.meteorGlbDepthScale;
    return clampMeteorGlbDepthScale(debugValue ?? sessionValue ?? METEOR_GLB_DEPTH_SCALE_DEFAULT);
  }

  function setMeteorGlbDepthScale(value) {
    const scale = clampMeteorGlbDepthScale(value);
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.meteorGlbDepthScale = scale;
    if (window.HC.Session?.debugConfig?.visual) {
      window.HC.Session.debugConfig.visual.meteorGlbDepthScale = scale;
    }
    return scale;
  }

  function isThreeCameraModel(value) { return THREE_CAMERA_MODELS.includes(String(value)); }

  function getThreeCameraModel() {
    const debugValue = window.HC?.WorldRendererDebug?.cameraModel;
    const sessionValue = window.HC?.Session?.debugConfig?.visual?.cameraModel;
    const model = String(debugValue || sessionValue || "stage_normalized");
    return isThreeCameraModel(model) ? model : "stage_normalized";
  }

  function setThreeCameraModel(value) {
    const model = isThreeCameraModel(value) ? String(value) : "absolute_bounds";
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.cameraModel = model;
    if (window.HC.Session?.debugConfig?.visual) window.HC.Session.debugConfig.visual.cameraModel = model;
    return model;
  }

  function getThreeStageSize() {
    const debugValue = window.HC?.WorldRendererDebug?.stageSize;
    const sessionValue = window.HC?.Session?.debugConfig?.visual?.stageSize;
    return clampNumber(debugValue ?? sessionValue, THREE_STAGE_SIZE_DEFAULT, THREE_STAGE_SIZE_MIN, THREE_STAGE_SIZE_MAX);
  }

  function applyRenderSpaceToVector(sourceX, sourceY, z = 0) {
    if (!threeState.stageModelEnabled) return { x: Number(sourceX) || 0, y: Number(sourceY) || 0, z };
    const bounds = threeState.worldCameraBounds || threeState.cameraBounds || { cx: 0, cy: 0 };
    const stageScale = Number(threeState.stageSettings?.scale) || 1;
    return {
      x: ((Number(sourceX) || 0) - (Number(bounds.cx) || 0)) * stageScale,
      y: ((Number(bounds.cy) || 0) - (Number(sourceY) || 0)) * stageScale,
      z,
    };
  }

  function applyRenderSpaceToRadius(radius) {
    return Math.max(0.0001, (Number(radius) || 0) * (threeState.stageModelEnabled ? (Number(threeState.stageSettings?.scale) || 1) : 1));
  }

  function getMeteorGlbCacheStats() {
    const stats = { loading: 0, ready: 0, failed: 0 };
    for (const entry of threeState.meteorGlbCache.values()) {
      if (entry?.status === "ready") stats.ready += 1;
      else if (entry?.status === "failed") stats.failed += 1;
      else stats.loading += 1;
    }
    return stats;
  }

  function countMeteorVisualsByColor(predicate) {
    const counts = {};
    for (const colorKey of Object.keys(METEOR_GLB_ASSETS)) counts[colorKey] = 0;
    for (const entry of threeState.meteorMeshes.values()) {
      if (!entry || !predicate(entry)) continue;
      const colorKey = METEOR_GLB_ASSETS[entry.colorKey] ? entry.colorKey : "unknown";
      counts[colorKey] = (counts[colorKey] || 0) + 1;
    }
    return counts;
  }

  function randomMeteorRotationSpeed(axis, isDominantAxis) {
    const max = METEOR_GLB_ROTATION_SPEED_RANGES[axis] || 1;
    const minRatio = isDominantAxis ? 0.55 : 0.18;
    const maxRatio = isDominantAxis ? 1.0 : 0.72;
    const magnitude = max * (minRatio + (Math.random() * (maxRatio - minRatio)));
    const speed = magnitude * (Math.random() < 0.5 ? -1 : 1);
    if (Math.abs(speed) >= METEOR_GLB_ROTATION_MIN_SPEED) return speed;
    return METEOR_GLB_ROTATION_MIN_SPEED * (speed < 0 ? -1 : 1);
  }

  function createMeteorGlbRotationState(visualId) {
    const dominantAxis = ["x", "y", "z"][Math.floor(Math.random() * 3)] || "y";
    const rotationSeed = Math.random();
    return {
      rotationSeed,
      dominantAxis,
      rotationBase: {
        x: Math.random() * METEOR_GLB_ROTATION_TWO_PI,
        y: Math.random() * METEOR_GLB_ROTATION_TWO_PI,
        z: Math.random() * METEOR_GLB_ROTATION_TWO_PI,
      },
      rotationSpeed: {
        x: randomMeteorRotationSpeed("x", dominantAxis === "x"),
        y: randomMeteorRotationSpeed("y", dominantAxis === "y"),
        z: randomMeteorRotationSpeed("z", dominantAxis === "z"),
      },
      rotationPhase: 0,
      visualId,
      startMs: null,
    };
  }

  function getMeteorRotationNowMs(renderSnapshot, nowMs) {
    const snapshotNow = Number(renderSnapshot?.time?.nowMs);
    if (Number.isFinite(snapshotNow)) return snapshotNow;
    const frameNow = Number(nowMs);
    if (Number.isFinite(frameNow)) return frameNow;
    if (typeof performance !== "undefined" && typeof performance.now === "function") return performance.now();
    return 0;
  }

  function applyMeteorGlbRotation(entry, nowMs) {
    const glb = entry?.glb;
    const state = entry?.rotationState;
    if (!glb || !state) return;
    if (!Number.isFinite(state.startMs)) state.startMs = Number(nowMs) || 0;
    const elapsedSeconds = Math.max(0, ((Number(nowMs) || 0) - state.startMs) / 1000);
    state.rotationPhase = elapsedSeconds;
    glb.rotation.set(
      state.rotationBase.x + (state.rotationSpeed.x * elapsedSeconds),
      state.rotationBase.y + (state.rotationSpeed.y * elapsedSeconds),
      state.rotationBase.z + (state.rotationSpeed.z * elapsedSeconds)
    );
  }

  function getAccessorItemSize(type) {
    return ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 })[type] || 1;
  }

  function getComponentArrayType(componentType) {
    return ({ 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array })[componentType] || Float32Array;
  }

  function getComponentByteSize(componentType) {
    const ArrayType = getComponentArrayType(componentType);
    return ArrayType.BYTES_PER_ELEMENT || 4;
  }

  function readAccessorAttribute(THREE, gltf, binaryChunk, accessorIndex) {
    const accessor = gltf.accessors?.[accessorIndex];
    if (!accessor) return null;
    const bufferView = gltf.bufferViews?.[accessor.bufferView];
    if (!bufferView) return null;
    const itemSize = getAccessorItemSize(accessor.type);
    const ArrayType = getComponentArrayType(accessor.componentType);
    const componentBytes = getComponentByteSize(accessor.componentType);
    const componentOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    const count = accessor.count || 0;
    const packedStride = itemSize * componentBytes;
    const stride = bufferView.byteStride || packedStride;
    let array;
    if (stride === packedStride) {
      array = new ArrayType(binaryChunk, componentOffset, count * itemSize);
    } else {
      array = new ArrayType(count * itemSize);
      const source = new DataView(binaryChunk, componentOffset, Math.max(0, (count - 1) * stride + packedStride));
      const readers = {
        5120: (offset) => source.getInt8(offset),
        5121: (offset) => source.getUint8(offset),
        5122: (offset) => source.getInt16(offset, true),
        5123: (offset) => source.getUint16(offset, true),
        5125: (offset) => source.getUint32(offset, true),
        5126: (offset) => source.getFloat32(offset, true),
      };
      const read = readers[accessor.componentType] || readers[5126];
      for (let row = 0; row < count; row += 1) {
        for (let col = 0; col < itemSize; col += 1) {
          array[row * itemSize + col] = read(row * stride + col * componentBytes);
        }
      }
    }
    return new THREE.BufferAttribute(array, itemSize, !!accessor.normalized);
  }

  function getThreeWrapping(THREE, value) {
    if (value === 33071) return THREE.ClampToEdgeWrapping;
    if (value === 33648) return THREE.MirroredRepeatWrapping;
    return THREE.RepeatWrapping;
  }

  function getThreeFilter(THREE, value, fallback) {
    const filters = {
      9728: THREE.NearestFilter,
      9729: THREE.LinearFilter,
      9984: THREE.NearestMipmapNearestFilter,
      9985: THREE.LinearMipmapNearestFilter,
      9986: THREE.NearestMipmapLinearFilter,
      9987: THREE.LinearMipmapLinearFilter,
    };
    return filters[value] || fallback;
  }

  function readGlbBufferViewBytes(gltf, binaryChunk, bufferViewIndex) {
    const view = gltf.bufferViews?.[bufferViewIndex];
    if (!view || view.buffer != null && view.buffer !== 0) return null;
    const start = view.byteOffset || 0;
    const length = view.byteLength || 0;
    if (!length) return null;
    return binaryChunk.slice(start, start + length);
  }

  function createGlbTexture(THREE, gltf, binaryChunk, textureInfo, colorSpace) {
    const textureIndex = textureInfo?.index;
    const textureDef = gltf.textures?.[textureIndex];
    const imageDef = gltf.images?.[textureDef?.source];
    if (!textureDef || !imageDef) return null;
    let url = null;
    if (imageDef.bufferView != null) {
      const bytes = readGlbBufferViewBytes(gltf, binaryChunk, imageDef.bufferView);
      if (!bytes) return null;
      const mimeType = imageDef.mimeType || "image/png";
      url = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
      threeState.glbBlobUrls.add(url);
    } else if (imageDef.uri && !/^data:/i.test(imageDef.uri)) {
      url = resolvePublicAssetPath(imageDef.uri);
    } else if (imageDef.uri) {
      url = imageDef.uri;
    }
    if (!url || !THREE.TextureLoader) return null;
    const texture = new THREE.TextureLoader().load(url, () => { texture.needsUpdate = true; });
    texture.flipY = false;
    if (colorSpace && "colorSpace" in texture) texture.colorSpace = colorSpace;
    else if (colorSpace && "encoding" in texture && THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
    const sampler = gltf.samplers?.[textureDef.sampler] || {};
    texture.wrapS = getThreeWrapping(THREE, sampler.wrapS);
    texture.wrapT = getThreeWrapping(THREE, sampler.wrapT);
    texture.magFilter = getThreeFilter(THREE, sampler.magFilter, THREE.LinearFilter);
    texture.minFilter = getThreeFilter(THREE, sampler.minFilter, THREE.LinearMipmapLinearFilter);
    texture.userData = Object.assign({}, texture.userData, { hcGlbTextureIndex: textureIndex, hcTexCoord: textureInfo.texCoord || 0 });
    return texture;
  }

  function getFallbackMeteorColor(THREE, materialIndex) {
    const fallbackColors = [0xb6bfd2, 0xff6b6b, 0xffd166, 0x6ee7a8, 0x7dbdff];
    return new THREE.Color(fallbackColors[Math.max(0, Number(materialIndex) || 0) % fallbackColors.length]);
  }

  function isMaterialUsable(material) {
    return !!material && (material.isMaterial || typeof material.type === "string") && material.type !== "MeshBasicMaterial";
  }

  function createFallbackPbrMaterial(THREE, materialIndex, reason) {
    const mat = new THREE.MeshStandardMaterial({
      color: getFallbackMeteorColor(THREE, materialIndex),
      roughness: 0.72,
      metalness: 0.12,
      transparent: false,
      opacity: 1,
      side: THREE.FrontSide,
      depthTest: true,
      depthWrite: true,
    });
    mat.name = `hc_glb_fallback_${reason || "missing"}`;
    mat.userData = Object.assign({}, mat.userData, { hcMaterialSource: "fallback", hcFallbackReason: reason || "missing" });
    return mat;
  }

  function applyImportedMaterialRuntimeSettings(material) {
    if (!material) return material;
    const settings = threeState.materialSettings || getThreeMaterialSettings();
    if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
      const source = material.userData?.hcMaterialSource || "";
      material.envMapIntensity = source.startsWith("debug_") ? 0 : settings.envIntensity;
    }
    material.needsUpdate = true;
    return material;
  }

  function createGlbMaterial(THREE, gltf, binaryChunk, materialIndex) {
    if (materialIndex == null || !gltf.materials?.[materialIndex]) return createFallbackPbrMaterial(THREE, materialIndex, "missing_material");
    const materialDef = gltf.materials[materialIndex] || {};
    const pbr = materialDef.pbrMetallicRoughness || {};
    const base = Array.isArray(pbr.baseColorFactor) ? pbr.baseColorFactor : [1, 1, 1, 1];
    const color = new THREE.Color(base[0] ?? 1, base[1] ?? 1, base[2] ?? 1);
    const alpha = Number(base[3]);
    const material = new THREE.MeshStandardMaterial({
      name: materialDef.name || `glb_material_${materialIndex}`,
      color,
      roughness: Number.isFinite(pbr.roughnessFactor) ? pbr.roughnessFactor : 0.82,
      metalness: Number.isFinite(pbr.metallicFactor) ? pbr.metallicFactor : 0.0,
      transparent: materialDef.alphaMode === "BLEND" || (Number.isFinite(alpha) && alpha < 1),
      opacity: Number.isFinite(alpha) ? alpha : 1,
      alphaTest: materialDef.alphaMode === "MASK" ? (Number.isFinite(materialDef.alphaCutoff) ? materialDef.alphaCutoff : 0.5) : 0,
      side: materialDef.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
      depthTest: true,
      depthWrite: materialDef.alphaMode !== "BLEND",
    });
    const srgb = THREE.SRGBColorSpace || THREE.LinearSRGBColorSpace || null;
    material.map = createGlbTexture(THREE, gltf, binaryChunk, pbr.baseColorTexture, srgb);
    material.metalnessMap = createGlbTexture(THREE, gltf, binaryChunk, pbr.metallicRoughnessTexture, null);
    material.roughnessMap = material.metalnessMap;
    material.normalMap = createGlbTexture(THREE, gltf, binaryChunk, materialDef.normalTexture, null);
    if (material.normalMap && materialDef.normalTexture && Number.isFinite(materialDef.normalTexture.scale)) {
      material.normalScale = new THREE.Vector2(materialDef.normalTexture.scale, materialDef.normalTexture.scale);
    }
    material.aoMap = createGlbTexture(THREE, gltf, binaryChunk, materialDef.occlusionTexture, null);
    if (material.aoMap && materialDef.occlusionTexture && Number.isFinite(materialDef.occlusionTexture.strength)) {
      material.aoMapIntensity = materialDef.occlusionTexture.strength;
    }
    const emissive = Array.isArray(materialDef.emissiveFactor) ? materialDef.emissiveFactor : [0, 0, 0];
    material.emissive = new THREE.Color(emissive[0] || 0, emissive[1] || 0, emissive[2] || 0);
    material.emissiveMap = createGlbTexture(THREE, gltf, binaryChunk, materialDef.emissiveTexture, srgb);
    material.userData = Object.assign({}, material.userData, {
      hcMaterialSource: "glb_imported_pbr",
      hcGlbMaterialIndex: materialIndex,
      hcGlbMaterialName: materialDef.name || null,
    });
    return applyImportedMaterialRuntimeSettings(material);
  }

  function applyGlbNodeTransform(THREE, target, nodeDef) {
    if (Array.isArray(nodeDef.matrix) && nodeDef.matrix.length === 16) {
      const matrix = new THREE.Matrix4();
      matrix.fromArray(nodeDef.matrix);
      target.applyMatrix4(matrix);
      return;
    }
    if (Array.isArray(nodeDef.translation)) target.position.fromArray(nodeDef.translation);
    if (Array.isArray(nodeDef.rotation)) target.quaternion.fromArray(nodeDef.rotation);
    if (Array.isArray(nodeDef.scale)) target.scale.fromArray(nodeDef.scale);
  }

  function parseGlbToObject3D(THREE, arrayBuffer) {
    const header = new DataView(arrayBuffer, 0, 12);
    if (header.getUint32(0, true) !== 0x46546c67) throw new Error("Invalid GLB magic");
    if (header.getUint32(4, true) !== 2) throw new Error("Only GLB v2 is supported");
    let offset = 12;
    let json = null;
    let binaryChunk = null;
    while (offset + 8 <= arrayBuffer.byteLength) {
      const chunkLength = new DataView(arrayBuffer, offset, 4).getUint32(0, true);
      const chunkType = new DataView(arrayBuffer, offset + 4, 4).getUint32(0, true);
      const chunkStart = offset + 8;
      if (chunkType === 0x4e4f534a) {
        const text = new TextDecoder("utf-8").decode(new Uint8Array(arrayBuffer, chunkStart, chunkLength));
        json = JSON.parse(text.trim());
      } else if (chunkType === 0x004e4942) {
        binaryChunk = arrayBuffer.slice(chunkStart, chunkStart + chunkLength);
      }
      offset = chunkStart + chunkLength;
    }
    if (!json || !binaryChunk) throw new Error("GLB JSON or BIN chunk is missing");
    const meshCache = new Map();
    const materialCache = new Map();
    const buildMesh = (meshIndex) => {
      if (meshCache.has(meshIndex)) return meshCache.get(meshIndex).clone(true);
      const meshDef = json.meshes?.[meshIndex];
      const group = new THREE.Group();
      group.name = meshDef?.name || `glb_mesh_${meshIndex}`;
      for (const primitive of meshDef?.primitives || []) {
        if (primitive.mode != null && primitive.mode !== 4) continue;
        const geometry = new THREE.BufferGeometry();
        const attrs = primitive.attributes || {};
        const attrMap = { POSITION: "position", NORMAL: "normal", TEXCOORD_0: "uv", COLOR_0: "color" };
        for (const [gltfName, threeName] of Object.entries(attrMap)) {
          if (attrs[gltfName] == null) continue;
          const attr = readAccessorAttribute(THREE, json, binaryChunk, attrs[gltfName]);
          if (attr) geometry.setAttribute(threeName, attr);
        }
        if (primitive.indices != null) {
          const indexAttr = readAccessorAttribute(THREE, json, binaryChunk, primitive.indices);
          if (indexAttr) geometry.setIndex(indexAttr);
        }
        geometry.computeBoundingSphere();
        if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
        let material = materialCache.get(primitive.material);
        if (!material) {
          material = createGlbMaterial(THREE, json, binaryChunk, primitive.material);
          materialCache.set(primitive.material, material);
        }
        if (!isMaterialUsable(material)) material = createFallbackPbrMaterial(THREE, primitive.material, "unusable_material");
        if (geometry.getAttribute("color") && material.vertexColors !== true) {
          material = material.clone();
          material.vertexColors = true;
          material.userData = Object.assign({}, material.userData, { hcVertexColorsEnabled: true });
        }
        if (material.aoMap && geometry.getAttribute("uv") && !geometry.getAttribute("uv2")) {
          geometry.setAttribute("uv2", geometry.getAttribute("uv"));
        }
        const mesh = new THREE.Mesh(geometry, applyImportedMaterialRuntimeSettings(material));
        mesh.frustumCulled = false;
        group.add(mesh);
      }
      meshCache.set(meshIndex, group);
      return group.clone(true);
    };
    const buildNode = (nodeIndex) => {
      const nodeDef = json.nodes?.[nodeIndex] || {};
      const object = nodeDef.mesh != null ? buildMesh(nodeDef.mesh) : new THREE.Group();
      object.name = nodeDef.name || object.name || `glb_node_${nodeIndex}`;
      applyGlbNodeTransform(THREE, object, nodeDef);
      for (const childIndex of nodeDef.children || []) object.add(buildNode(childIndex));
      return object;
    };
    const sceneDef = json.scenes?.[json.scene || 0] || json.scenes?.[0] || {};
    const root = new THREE.Group();
    for (const nodeIndex of sceneDef.nodes || []) root.add(buildNode(nodeIndex));
    const box = new THREE.Box3().setFromObject(root);
    const sphere = new THREE.Sphere();
    if (!box.isEmpty()) {
      box.getBoundingSphere(sphere);
      root.position.sub(sphere.center);
      root.userData.hcUnitRadius = Math.max(0.0001, sphere.radius);
      const centeredBox = new THREE.Box3().setFromObject(root);
      const centeredSize = new THREE.Vector3();
      centeredBox.getSize(centeredSize);
      root.userData.hcLocalBoundingBox = {
        min: { x: centeredBox.min.x, y: centeredBox.min.y, z: centeredBox.min.z },
        max: { x: centeredBox.max.x, y: centeredBox.max.y, z: centeredBox.max.z },
      };
      root.userData.hcLocalSize = { x: centeredSize.x, y: centeredSize.y, z: centeredSize.z };
    } else {
      root.userData.hcUnitRadius = 1;
    }
    root.traverse((object) => {
      if (!object.isMesh) return;
      object.renderOrder = 1000;
    });
    return root;
  }

  function materialRespondsToLight(material) {
    return !!material && material.type !== "MeshBasicMaterial" && material.type !== "MeshNormalMaterial";
  }

  function summarizeMaterial(material, meshInfo = {}) {
    const color = material?.color;
    const emissive = material?.emissive;
    const reactsToLight = materialRespondsToLight(material);
    return {
      meshName: meshInfo.meshName || null,
      type: material?.type || "missing",
      source: material?.userData?.hcMaterialSource || "unknown",
      materialSource: material?.userData?.hcMaterialSource || "unknown",
      color: color && typeof color.getHexString === "function" ? `#${color.getHexString()}` : null,
      metalness: Number.isFinite(material?.metalness) ? material.metalness : null,
      roughness: Number.isFinite(material?.roughness) ? material.roughness : null,
      emissive: emissive && typeof emissive.getHexString === "function" ? `#${emissive.getHexString()}` : null,
      map: !!material?.map,
      normalMap: !!material?.normalMap,
      metalnessMap: !!material?.metalnessMap,
      roughnessMap: !!material?.roughnessMap,
      emissiveMap: !!material?.emissiveMap,
      aoMap: !!material?.aoMap,
      vertexColors: !!material?.vertexColors,
      flatShading: !!material?.flatShading,
      normalAttributePresent: meshInfo.normalAttributePresent === true,
      transparent: !!material?.transparent,
      opacity: Number.isFinite(material?.opacity) ? material.opacity : null,
      reactsToLight,
      respondsToLight: reactsToLight,
    };
  }

  function getAssetNameFromUrl(url) {
    const text = String(url || "");
    try {
      const parsed = new URL(text, document.baseURI || window.location.href);
      return parsed.pathname.split("/").filter(Boolean).pop() || text;
    } catch {
      return text.split("/").filter(Boolean).pop() || text;
    }
  }

  function collectGlbMaterialAudit(root, url) {
    const materials = [];
    let meshCount = 0;
    root.traverse((object) => {
      if (!object.isMesh) return;
      meshCount += 1;
      const normalAttributePresent = !!object.geometry?.getAttribute?.("normal");
      const meshName = object.name || object.parent?.name || `mesh_${meshCount}`;
      const materialList = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materialList) materials.push(summarizeMaterial(material, { normalAttributePresent, meshName }));
    });
    const audit = {
      asset: url,
      assetName: getAssetNameFromUrl(url),
      meshCount,
      materialCount: materials.length,
      materials: materials.slice(0, 12),
      importedPbrCount: materials.filter((m) => m.source === "glb_imported_pbr").length,
      fallbackCount: materials.filter((m) => m.source === "fallback").length,
      lightReactiveCount: materials.filter((m) => m.reactsToLight).length,
      hasMaps: materials.some((m) => m.map || m.metalnessMap || m.roughnessMap || m.emissiveMap || m.aoMap),
      hasNormalMaps: materials.some((m) => m.normalMap),
      hasMetalness: materials.some((m) => Number(m.metalness) > 0),
      normalAttributePresent: materials.some((m) => m.normalAttributePresent),
    };
    threeState.glbMaterialAudit.push(audit);
    if (threeState.glbMaterialAudit.length > 16) threeState.glbMaterialAudit.shift();
    return audit;
  }

  function logGlbMaterialAudit({ force = false } = {}) {
    const settings = threeState.materialSettings || getThreeMaterialSettings();
    if (!force && !settings.enabled && !settings.forceAuditLog) return;
    for (const audit of threeState.glbMaterialAudit) {
      if (!audit?.asset) continue;
      if (!force && threeState.glbMaterialAuditLoggedUrls.has(audit.asset)) continue;
      if (!force && threeState.glbMaterialAuditLogCount >= THREE_MATERIAL_AUDIT_LOG_LIMIT) continue;
      threeState.glbMaterialAuditLoggedUrls.add(audit.asset);
      threeState.glbMaterialAuditLogCount += 1;
      if (window.console?.debug) window.console.debug("[HC.WorldRenderer] GLB material audit", audit);
      else if (window.console?.log) window.console.log("[HC.WorldRenderer] GLB material audit", audit);
    }
  }

  function rememberOriginalMeshMaterial(mesh) {
    if (!mesh?.isMesh) return;
    mesh.userData = mesh.userData || {};
    if (mesh.userData.hcOriginalMaterial == null) {
      mesh.userData.hcOriginalMaterial = Array.isArray(mesh.material) ? mesh.material.slice() : mesh.material;
    }
  }

  function disposeDebugMaterial(material) {
    if (!material) return;
    const materials = Array.isArray(material) ? material : [material];
    materials.forEach((mat) => {
      if (!mat?.userData?.hcDebugMaterialOverride) return;
      if (typeof mat.dispose === "function") mat.dispose();
    });
  }

  function createDebugMaterialForMode(THREE, mode) {
    if (mode === "normal_debug") {
      return new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
    }
    if (mode === "standard_test") {
      return new THREE.MeshStandardMaterial({
        color: 0xd2d5d8,
        roughness: 0.45,
        metalness: 0.0,
        envMap: null,
        envMapIntensity: 0.0,
        emissive: 0x000000,
        emissiveMap: null,
        vertexColors: false,
        side: THREE.DoubleSide,
      });
    }
    if (mode === "clay_lit") {
      return new THREE.MeshStandardMaterial({
        color: 0xcfc8bc,
        roughness: 0.65,
        metalness: 0.0,
        envMap: null,
        envMapIntensity: 0.0,
        emissive: 0x000000,
        emissiveMap: null,
        vertexColors: false,
        side: THREE.DoubleSide,
      });
    }
    if (mode === "diagnostic_unlit") {
      return new THREE.MeshBasicMaterial({
        color: 0x00f5ff,
        map: null,
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: true,
      });
    }
    return null;
  }

  function applyDebugMaterialModeToMesh(THREE, mesh, mode, status) {
    if (!mesh?.isMesh) return;
    rememberOriginalMeshMaterial(mesh);
    if (mesh.userData?.hcMaterialMode === mode && mode !== "imported") {
      mesh.userData.hcMaterialModeFrame = threeState.renderCalls;
      return;
    }
    if (mesh.userData?.hcMaterialMode === "imported" && mode === "imported") {
      mesh.userData.hcMaterialModeFrame = threeState.renderCalls;
      return;
    }
    const previousMaterial = mesh.material;
    if (mode === "imported") {
      mesh.material = mesh.userData.hcOriginalMaterial || mesh.material;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach(applyImportedMaterialRuntimeSettings);
      mesh.userData.hcMaterialMode = "imported";
      mesh.userData.hcMaterialModeFrame = threeState.renderCalls;
      status.restoredImportedMaterials += materials.length;
      disposeDebugMaterial(previousMaterial);
      return;
    }
    const nextMaterial = createDebugMaterialForMode(THREE, mode);
    if (!nextMaterial) return;
    nextMaterial.name = `hc_debug_${mode}`;
    nextMaterial.userData = Object.assign({}, nextMaterial.userData, {
      hcMaterialSource: `debug_${mode}`,
      hcDebugMaterialOverride: true,
      hcMaterialMode: mode,
    });
    mesh.material = nextMaterial;
    mesh.userData.hcMaterialMode = mode;
    mesh.userData.hcMaterialModeFrame = threeState.renderCalls;
    disposeDebugMaterial(previousMaterial);
  }

  function applyDebugMaterialMode(THREE, root, status = null) {
    const settings = threeState.materialSettings || getThreeMaterialSettings();
    const mode = settings.materialMode || "imported";
    const localStatus = status || { activeGlbObjects: 0, activeGlbMeshCount: 0, meshesUsingCurrentMaterialMode: 0, currentMaterialMode: mode, lastAppliedFrame: threeState.renderCalls, lastAppliedAtMs: Date.now(), restoredImportedMaterials: 0 };
    root?.traverse?.((object) => {
      if (!object.isMesh) return;
      localStatus.activeGlbMeshCount += 1;
      applyDebugMaterialModeToMesh(THREE, object, mode, localStatus);
      if (object.userData?.hcMaterialMode === mode) localStatus.meshesUsingCurrentMaterialMode += 1;
    });
    if (!status) threeState.materialOverrideStatus = localStatus;
    return localStatus;
  }

  function collectActiveGlbRoots() {
    const roots = [];
    for (const entry of threeState.meteorMeshes.values()) {
      if (entry?.glb) roots.push(entry.glb);
    }
    return roots;
  }

  function refreshMaterialOverrideStatus(THREE) {
    const settings = threeState.materialSettings || getThreeMaterialSettings();
    const status = {
      activeGlbObjects: 0,
      activeGlbMeshCount: 0,
      meshesUsingCurrentMaterialMode: 0,
      currentMaterialMode: settings.materialMode || "imported",
      lastAppliedFrame: threeState.renderCalls,
      lastAppliedAtMs: Date.now(),
      restoredImportedMaterials: 0,
    };
    collectActiveGlbRoots().forEach((root) => {
      status.activeGlbObjects += 1;
      applyDebugMaterialMode(THREE, root, status);
      root.userData = Object.assign({}, root.userData, { hcMaterialMode: status.currentMaterialMode, hcMaterialModeFrame: threeState.renderCalls });
    });
    threeState.materialOverrideStatus = status;
    return status;
  }

  function applyMaterialSettingsToLoadedGlbs() {
    const THREE = window.HC_THREE || window.THREE;
    if (!THREE) return;
    threeState.meteorMaterials.forEach(applyImportedMaterialRuntimeSettings);
    threeState.asteroidMaterials.forEach(applyImportedMaterialRuntimeSettings);
    for (const cacheEntry of threeState.meteorGlbCache.values()) {
      cacheEntry?.template?.traverse?.((object) => {
        if (!object.isMesh) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(applyImportedMaterialRuntimeSettings);
      });
    }
    refreshMaterialOverrideStatus(THREE);
  }

  function loadMeteorGlb(THREE, url) {
    let entry = threeState.meteorGlbCache.get(url);
    if (entry) return entry;
    entry = { status: "loading", template: null, error: null, promise: null };
    entry.promise = fetch(url, { cache: "force-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
        return response.arrayBuffer();
      })
      .then((buffer) => {
        entry.template = parseGlbToObject3D(THREE, buffer);
        entry.materialAudit = collectGlbMaterialAudit(entry.template, url);
        logGlbMaterialAudit();
        entry.status = "ready";
        return entry.template;
      })
      .catch((error) => {
        entry.status = "failed";
        entry.error = error?.message || String(error);
        warnMeteorGlbOnce(url, entry.error);
        return null;
      });
    threeState.meteorGlbCache.set(url, entry);
    return entry;
  }

  function cloneMeteorGlbTemplate(template) {
    const clone = template.clone(true);
    clone.userData.hcUnitRadius = template.userData?.hcUnitRadius || 1;
    clone.userData.hcLocalBoundingBox = template.userData?.hcLocalBoundingBox || null;
    clone.userData.hcLocalSize = template.userData?.hcLocalSize || null;
    clone.traverse((object) => {
      if (!object.isMesh) return;
      if (Array.isArray(object.material)) object.material = object.material.map((material) => material?.clone ? material.clone() : material);
      else if (object.material?.clone) object.material = object.material.clone();
      rememberOriginalMeshMaterial(object);
      object.frustumCulled = false;
    });
    return clone;
  }


  function getStableMeteorSnapshotKey(m) {
    const key = m?.renderKey || m?.id || m?._id || null;
    return key == null || key === "" ? null : String(key);
  }

  function findReusableUnkeyedMeteorVisual(colorKey, x, y, seenKeys) {
    let bestKey = null;
    let bestEntry = null;
    let bestDistanceSq = Infinity;
    for (const [key, entry] of threeState.meteorMeshes.entries()) {
      if (seenKeys.has(key) || !entry?.isUnkeyedMeteorVisual) continue;
      if (entry.colorKey !== colorKey) continue;
      const dx = (Number(entry.root?.position?.x) || 0) - x;
      const dy = (Number(entry.root?.position?.y) || 0) - y;
      const distanceSq = dx * dx + dy * dy;
      if (distanceSq < bestDistanceSq) {
        bestDistanceSq = distanceSq;
        bestKey = key;
        bestEntry = entry;
      }
    }
    return bestEntry ? { key: bestKey, visual: bestEntry } : null;
  }

  function createMeteorVisual(THREE, colorKey) {
    const visualId = threeState.nextMeteorVisualId++;
    const root = new THREE.Group();
    root.userData.hcMeteorVisualId = visualId;
    const fallback = new THREE.Mesh(threeState.meteorGeometry, getMeteorMaterial(THREE, colorKey));
    fallback.frustumCulled = false;
    fallback.renderOrder = 1000;
    root.add(fallback);
    root.frustumCulled = false;
    const rotationState = createMeteorGlbRotationState(visualId);
    root.userData.rotationSeed = rotationState.rotationSeed;
    root.userData.rotationBase = rotationState.rotationBase;
    root.userData.rotationSpeed = rotationState.rotationSpeed;
    root.userData.rotationPhase = rotationState.rotationPhase;
    root.userData.rotationDominantAxis = rotationState.dominantAxis;
    const entry = { root, fallback, glb: null, visualId, colorKey: null, assetUrl: null, variantIndex: null, glbStatus: "fallback", rotationState, redTextureAssignment: null, redTextureAppliedUrl: null, redTextureStatus: "idle", redTextureRestorePending: false };
    assignMeteorGlbAsset(entry, colorKey);
    return entry;
  }

  function removeMeteorVisual(entry) {
    const root = entry?.root || entry;
    threeState.meteorGroup?.remove(root);
    disposeMeteorGlbInstance(entry);
  }

  function updateMeteorGlbVisual(THREE, entry) {
    if (!entry) return false;
    const assetUrl = entry.assetUrl || null;
    if (!assetUrl) {
      entry.glbStatus = "fallback";
      entry.root.userData.glbStatus = entry.glbStatus;
      entry.fallback.visible = true;
      if (entry.glb) entry.glb.visible = false;
      return false;
    }
    const cacheEntry = loadMeteorGlb(THREE, assetUrl);
    if (cacheEntry.status === "failed") {
      entry.glbStatus = "failed";
      entry.root.userData.glbStatus = entry.glbStatus;
      entry.fallback.visible = true;
      if (entry.glb) entry.glb.visible = false;
      return false;
    }
    if (cacheEntry.status !== "ready" || !cacheEntry.template) {
      entry.glbStatus = "loading";
      entry.root.userData.glbStatus = entry.glbStatus;
      entry.fallback.visible = true;
      if (entry.glb) entry.glb.visible = false;
      return false;
    }
    if (!entry.glb) {
      entry.glb = cloneMeteorGlbTemplate(cacheEntry.template);
      entry.glb.userData.hcAssetUrl = assetUrl;
      applyDebugMaterialMode(THREE, entry.glb);
      syncRedMeteorTexturePaletteForEntry(THREE, entry);
      entry.root.add(entry.glb);
      threeState.meteorGlbInstanceCreates += 1;
    }
    syncRedMeteorTexturePaletteForEntry(THREE, entry);
    entry.glbStatus = "ready";
    entry.root.userData.glbStatus = entry.glbStatus;
    entry.fallback.visible = false;
    entry.glb.visible = true;
    return true;
  }

  function sanitizeAsteroidSides(value) {
    const n = Math.round(Number(value) || THREE_ASTEROID_DEFAULT_SIDES);
    return Math.max(5, Math.min(12, n));
  }

  function getAsteroidGeometry(THREE, sides) {
    const safeSides = sanitizeAsteroidSides(sides);
    const existing = threeState.asteroidGeometries.get(safeSides);
    if (existing) return existing;
    const geometry = new THREE.CircleGeometry(1, safeSides);
    threeState.asteroidGeometries.set(safeSides, geometry);
    return geometry;
  }

  function getAsteroidMaterial(THREE, asteroid) {
    const grayLight = Math.round(Math.max(28, Math.min(74, Number(asteroid?.grayLight) || 52)));
    const colorKey = asteroid?.colorKey ? String(asteroid.colorKey).toLowerCase() : "neutral";
    const key = `${colorKey}:${grayLight}`;
    const existing = threeState.asteroidMaterials.get(key);
    if (existing) return existing;
    const channel = Math.round((grayLight / 100) * 255);
    const color = (channel << 16) | (channel << 8) | channel;
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8,
      metalness: 0.05,
      envMapIntensity: getThreeMaterialSettings().envIntensity,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
    });
    threeState.asteroidMaterials.set(key, mat);
    return mat;
  }

  function createNeutralEnvironmentTexture(THREE) {
    if (!THREE.CanvasTexture || typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 8;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const gradient = ctx.createLinearGradient(0, 0, 16, 8);
    gradient.addColorStop(0, "#20304a");
    gradient.addColorStop(0.42, "#58616f");
    gradient.addColorStop(0.68, "#1a2234");
    gradient.addColorStop(1, "#080b12");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,246,224,0.9)";
    ctx.fillRect(1, 1, 2, 1);
    ctx.fillStyle = "rgba(180,215,255,0.45)";
    ctx.fillRect(11, 2, 3, 1);
    const texture = new THREE.CanvasTexture(canvas);
    if (THREE.EquirectangularReflectionMapping) texture.mapping = THREE.EquirectangularReflectionMapping;
    if (THREE.SRGBColorSpace && "colorSpace" in texture) texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    threeState.environmentCanvas = canvas;
    return texture;
  }

  function applyRendererPbrSettings() {
    const THREE = window.HC_THREE || window.THREE;
    const renderer = threeState.renderer;
    if (!THREE || !renderer) return;
    const settings = getThreeMaterialSettings();
    threeState.materialSettings = Object.assign({}, settings);
    if (THREE.ColorManagement) THREE.ColorManagement.enabled = true;
    if (THREE.SRGBColorSpace && "outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    else if (THREE.sRGBEncoding && "outputEncoding" in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
    if (THREE.ACESFilmicToneMapping) renderer.toneMapping = THREE.ACESFilmicToneMapping;
    else if (THREE.NeutralToneMapping) renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = settings.toneExposure;
    if (threeState.scene && !threeState.environment) threeState.environment = createNeutralEnvironmentTexture(THREE);
    if (threeState.scene && threeState.environment) threeState.scene.environment = threeState.environment;
  }

  function initThree() {
    if (threeState.initialized) return true;
    const THREE = detectThreeDependency() || window.HC_THREE || window.THREE;
    if (!THREE || !THREE.WebGLRenderer || !THREE.Scene || !THREE.OrthographicCamera) return false;
    try {
      const canvas = ensureThreeCanvas();
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
      renderer.setClearColor(0x071126, 1);
      const scene = new THREE.Scene();
      const orthographicCamera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 1000);
      const perspectiveCamera = THREE.PerspectiveCamera ? new THREE.PerspectiveCamera(THREE_STAGE_CAMERA_FOV, 1, 0.1, 1000) : null;
      const camera = orthographicCamera;
      const meteorGroup = new THREE.Group();
      const asteroidGroup = new THREE.Group();
      const lightsGroup = createThreeLights(THREE);
      scene.add(lightsGroup);
      if (threeState.debugSpotLightTarget) scene.add(threeState.debugSpotLightTarget);
      scene.add(asteroidGroup);
      scene.add(meteorGroup);
      scene.background = new THREE.Color(0x05070a);
      canvas.style.display = "block";
      canvas.style.visibility = "visible";
      Object.assign(threeState, { canvas, renderer, scene, camera, orthographicCamera, perspectiveCamera, meteorGroup, asteroidGroup, lightsGroup, meteorGeometry: new THREE.CircleGeometry(1, 16) });
      applyRendererPbrSettings();
      syncThreeLights();
      createDebugMarker(THREE);
      createFirstMeteorMarker(THREE);
      threeState.initialized = true;
      threeState.lastError = null;
      resize();
      return true;
    } catch (err) { threeState.lastError = err?.message || String(err); return false; }
  }

  function syncMeteorPass(renderSnapshot, nowMs) {
    const THREE = window.HC_THREE || window.THREE;
    const meteors = Array.isArray(renderSnapshot?.world?.meteors) ? renderSnapshot.world.meteors : [];
    threeState.threeMeteorCount = meteors.length;
    threeState.firstMeteorSample = null;
    threeState.firstMeshSample = null;
    threeState.meteorGroupChildrenCount = 0;
    const rotationNowMs = getMeteorRotationNowMs(renderSnapshot, nowMs);
    const meteorGlbVisualScale = getMeteorGlbVisualScale();
    const meteorGlbDepthScale = getMeteorGlbDepthScale();
    threeState.glbScaleWarning = null;
    const seen = new Set();
    for (let i = 0; i < meteors.length; i += 1) {
      const m = meteors[i] || {};
      const colorKey = String(m.colorKey || m.colorName || m.color || "neutral").toLowerCase();
      const stableKey = getStableMeteorSnapshotKey(m);
      const x = Number(m.x) || 0;
      const y = Number(m.y) || 0;
      let key = stableKey;
      let visual = key ? threeState.meteorMeshes.get(key) : null;
      if (!visual && !key) {
        const reusable = findReusableUnkeyedMeteorVisual(colorKey, x, y, seen);
        key = reusable?.key || null;
        visual = reusable?.visual || null;
      }
      if (!visual) {
        visual = createMeteorVisual(THREE, colorKey);
        key = key || `meteor:visual:${visual.visualId}`;
        visual.isUnkeyedMeteorVisual = !stableKey;
        threeState.meteorGroup.add(visual.root);
        threeState.meteorMeshes.set(key, visual);
      } else if (stableKey && visual.isUnkeyedMeteorVisual) {
        visual.isUnkeyedMeteorVisual = false;
      }
      seen.add(key);
      if (visual.colorKey !== colorKey) {
        visual.fallback.material = getMeteorMaterial(THREE, colorKey);
        assignMeteorGlbAsset(visual, colorKey, { countReassignment: true });
      }
      const sourceRadius = Number(m.radius ?? m.r ?? m.size) || 2;
      const radius = Math.max(THREE_METEOR_MIN_RADIUS, sourceRadius * THREE_METEOR_RADIUS_SCALE);
      const renderRadius = applyRenderSpaceToRadius(radius);
      const renderPosition = applyRenderSpaceToVector(x, y, 0);
      const hasGlbVisual = updateMeteorGlbVisual(THREE, visual);
      visual.root.position.set(renderPosition.x, renderPosition.y, renderPosition.z);
      visual.root.renderOrder = 1000;
      visual.root.visible = !m.flags?.dead;
      visual.fallback.scale.set(renderRadius, renderRadius, 1);
      visual.fallback.material.opacity = Number.isFinite(m.alpha) ? Math.max(0.9, m.alpha) : 1;
      if (visual.glb) {
        const unitRadius = Math.max(0.0001, Number(visual.glb.userData?.hcUnitRadius) || 1);
        const glbScale = ((renderRadius * METEOR_GLB_RADIUS_SCALE) / unitRadius) * meteorGlbVisualScale;
        visual.glb.scale.set(glbScale, glbScale, glbScale * meteorGlbDepthScale);
        applyMeteorGlbRotation(visual, rotationNowMs);
        visual.root.userData.rotationPhase = visual.rotationState?.rotationPhase || 0;
        visual.glb.visible = hasGlbVisual && visual.root.visible;
      }
      if (i === 0) {
        const glbDiagnostics = buildGlbScaleDiagnostics(THREE, visual.glb);
        if (glbDiagnostics?.warning) threeState.glbScaleWarning = glbDiagnostics.warning;
        threeState.firstMeteorSample = {
          x: Number(m.x) || 0,
          y: Number(m.y) || 0,
          radius: sourceRadius,
          color: m.color || m.colorKey || null,
          alpha: Number.isFinite(m.alpha) ? m.alpha : null,
          renderedPosition: { x: visual.root.position.x, y: visual.root.position.y, z: visual.root.position.z },
        };
        threeState.firstMeshSample = {
          position: { x: visual.root.position.x, y: visual.root.position.y, z: visual.root.position.z },
          sourcePosition: { x, y, z: 0 },
          fallbackScale: { x: visual.fallback.scale.x, y: visual.fallback.scale.y, z: visual.fallback.scale.z },
          scale: glbDiagnostics?.scale || { x: visual.fallback.scale.x, y: visual.fallback.scale.y, z: visual.fallback.scale.z },
          visible: visual.root.visible,
          glbAssetUrl: visual.assetUrl || null,
          glbVariantIndex: visual.variantIndex,
          glbVisible: !!visual.glb?.visible,
          glbScale: visual.glb ? visual.glb.scale.x : null,
          meteorGlbVisualScale,
          glbDepthScale: meteorGlbDepthScale,
          scaleUniform: glbDiagnostics?.scaleUniform ?? false,
          zScaleRatio: glbDiagnostics?.zScaleRatio ?? null,
          localBoundingBox: glbDiagnostics?.localBoundingBox || null,
          localSize: glbDiagnostics?.localSize || null,
          worldBoundingBox: glbDiagnostics?.worldBoundingBox || null,
          worldSize: glbDiagnostics?.worldSize || null,
          objectDepthVisibleEstimate: glbDiagnostics?.objectDepthVisibleEstimate ?? null,
          warning: glbDiagnostics?.warning || null,
          glbStatus: visual.glbStatus,
          redMeteorTextureUrl: visual.redTextureAppliedUrl || visual.redTextureAssignment?.url || null,
          redMeteorTextureName: visual.redTextureAssignment?.path?.split("/").pop() || null,
          redMeteorTextureStatus: visual.redTextureStatus || null,
        };
      }
    }
    for (const [key, mesh] of threeState.meteorMeshes.entries()) {
      if (seen.has(key)) continue;
      removeMeteorVisual(mesh);
      threeState.meteorMeshes.delete(key);
    }
    threeState.meteorGroupChildrenCount = threeState.meteorGroup?.children?.length || 0;
    updateFirstMeteorDiagnostics();
  }

  function syncAsteroidPass(renderSnapshot) {
    const THREE = window.HC_THREE || window.THREE;
    const asteroids = Array.isArray(renderSnapshot?.world?.asteroids) ? renderSnapshot.world.asteroids : [];
    threeState.threeAsteroidCount = asteroids.length;
    threeState.asteroidGroupChildrenCount = 0;
    const seen = new Set();
    for (let i = 0; i < asteroids.length; i += 1) {
      const a = asteroids[i] || {};
      const key = String(a.renderKey || a.id || `asteroid:${i}:${Math.round(a.x||0)}:${Math.round(a.y||0)}`);
      seen.add(key);
      let mesh = threeState.asteroidMeshes.get(key);
      const geometry = getAsteroidGeometry(THREE, a.sides);
      if (!mesh) {
        mesh = new THREE.Mesh(geometry, getAsteroidMaterial(THREE, a));
        mesh.frustumCulled = false;
        threeState.asteroidGroup.add(mesh);
        threeState.asteroidMeshes.set(key, mesh);
      } else {
        mesh.geometry = geometry;
        mesh.material = getAsteroidMaterial(THREE, a);
      }
      const sourceRadius = Number(a.radius ?? a.r ?? a.scale) || THREE_ASTEROID_MIN_RADIUS;
      const radius = Math.max(THREE_ASTEROID_MIN_RADIUS, sourceRadius);
      const renderRadius = applyRenderSpaceToRadius(radius);
      const renderPosition = applyRenderSpaceToVector(Number(a.x) || 0, Number(a.y) || 0, -0.1);
      mesh.position.set(renderPosition.x, renderPosition.y, renderPosition.z);
      mesh.scale.set(renderRadius, renderRadius, 1);
      mesh.rotation.z = Number.isFinite(a.angle) ? a.angle : 0;
      const collapseOpacity = a.visual?.isCollapsing || a.state === "collapsing" ? 0.86 : 1;
      mesh.material.opacity = Number.isFinite(a.alpha) ? Math.max(0.25, Math.min(1, a.alpha)) : collapseOpacity;
      mesh.renderOrder = 900;
      mesh.visible = !a.flags?.dead && !a.visual?.absorbingIntoStarId;
    }
    for (const [key, mesh] of threeState.asteroidMeshes.entries()) {
      if (seen.has(key)) continue;
      threeState.asteroidGroup?.remove(mesh);
      threeState.asteroidMeshes.delete(key);
    }
    threeState.asteroidGroupChildrenCount = threeState.asteroidGroup?.children?.length || 0;
  }

  function destroyThree() {
    if (threeState.renderer?.dispose) threeState.renderer.dispose();
    threeState.meteorMeshes.forEach((entry) => { removeMeteorVisual(entry); });
    threeState.meteorMeshes.clear();
    threeState.nextMeteorVisualId = 1;
    threeState.asteroidMeshes.forEach((mesh) => { threeState.asteroidGroup?.remove(mesh); });
    threeState.asteroidMeshes.clear();
    threeState.meteorMaterials.forEach((mat) => mat?.dispose?.());
    threeState.meteorMaterials.clear();
    threeState.asteroidMaterials.forEach((mat) => mat?.dispose?.());
    threeState.asteroidMaterials.clear();
    threeState.asteroidGeometries.forEach((geometry) => geometry?.dispose?.());
    threeState.asteroidGeometries.clear();
    threeState.meteorGeometry?.dispose?.();
    threeState.environment?.dispose?.();
    threeState.environment = null;
    threeState.environmentCanvas = null;
    threeState.glbBlobUrls.forEach((url) => { try { URL.revokeObjectURL(url); } catch (_) {} });
    threeState.glbBlobUrls.clear();
    if (threeState.canvas) { threeState.canvas.style.display = "none"; threeState.canvas.style.visibility = "hidden"; }
    if (threeState.debugMarker?.parent) threeState.debugMarker.parent.remove(threeState.debugMarker);
    if (threeState.firstMeteorMarker?.parent) threeState.firstMeteorMarker.parent.remove(threeState.firstMeteorMarker);
    Object.assign(threeState, { renderer: null, scene: null, camera: null, orthographicCamera: null, perspectiveCamera: null, meteorGroup: null, asteroidGroup: null, lightsGroup: null, ambientLight: null, cornerLights: [], debugKeyLight: null, debugRimLight: null, forceHeadlight: null, debugSpotLight: null, debugSpotLightTarget: null, lightHelpersGroup: null, lightHelpers: [], lightsPositions: [], meteorGeometry: null, debugMarker: null, firstMeteorMarker: null, initialized: false, cameraBounds: null, rendererSize: null, environment: null, environmentCanvas: null });
  }

  function render(renderSnapshot, nowMs, dt) {
    renderCalls += 1;
    try {
      if (requestedMode === "three") {
        if (!initThree()) {
          effectiveMode = "canvas2d"; fallbackUsed = true; fallbackReason = threeDependencySource.includes("loading") ? "three_loading" : "three_loading_or_missing"; fallbackCalls += 1;
          lastError = threeState.lastError || window.HC_THREE_LOAD_ERROR || null; callCanvasFallback(nowMs, dt); return;
        }
        threeModeActive = true; effectiveMode = "three"; fallbackUsed = false; fallbackReason = null; lastError = null;
        resize(renderSnapshot);
        try {
          if (threeState.threeMeteorRenderEnabled) syncMeteorPass(renderSnapshot || {}, nowMs);
          threeState.threeMeteorLastError = null;
        } catch (err) {
          threeState.threeMeteorLastError = err?.message || String(err);
          threeState.threeMeteorCount = 0;
        }
        try {
          if (threeState.threeAsteroidRenderEnabled) syncAsteroidPass(renderSnapshot || {});
          threeState.threeAsteroidLastError = null;
        } catch (err) {
          threeState.threeAsteroidLastError = err?.message || String(err);
          threeState.threeAsteroidCount = 0;
        }
        threeState.renderCalls += 1;
        refreshMaterialOverrideStatus(THREE);
        threeState.rendererSize = {
          width: threeState.renderer?.domElement?.width || 0,
          height: threeState.renderer?.domElement?.height || 0,
        };
        threeState.renderer.render(threeState.scene, threeState.camera);
        return;
      }
      if (threeModeActive) { destroyThree(); threeModeActive = false; }
      effectiveMode = "canvas2d"; fallbackUsed = false; fallbackReason = null; lastError = null;
      callCanvasFallback(nowMs, dt);
    } catch (err) {
      fallbackUsed = true; fallbackReason = "adapter_error"; fallbackCalls += 1; lastError = err?.message || String(err); effectiveMode = "canvas2d"; callCanvasFallback(nowMs, dt);
    }
  }


  function getGameCanvasDiagnostics() {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return { present: false };
    const styles = window.getComputedStyle ? window.getComputedStyle(canvas) : canvas.style;
    return {
      present: true,
      display: styles.display || canvas.style.display || "block",
      visibility: styles.visibility || canvas.style.visibility || "visible",
      opacity: styles.opacity || canvas.style.opacity || "1",
      zIndex: styles.zIndex || canvas.style.zIndex || "auto",
      background: styles.backgroundColor || styles.background || canvas.style.background || "transparent",
      pointerEvents: styles.pointerEvents || canvas.style.pointerEvents || "auto",
      rect: { left: canvas.offsetLeft || 0, top: canvas.offsetTop || 0, width: canvas.clientWidth || 0, height: canvas.clientHeight || 0 },
    };
  }

  function getLayerProbe() {
    const view = (window.HC?.getView?.() || window.View || {});
    const cx = Math.max(0, Math.floor((Number(view.w) || window.innerWidth || 0) / 2));
    const cy = Math.max(0, Math.floor((Number(view.h) || window.innerHeight || 0) / 2));
    const topEl = document.elementFromPoint ? document.elementFromPoint(cx, cy) : null;
    const threeCanvas = document.getElementById("hc-three-world-canvas");
    const gameCanvas = document.getElementById("gameCanvas");
    return {
      center: { x: cx, y: cy },
      threeCanvasRect: threeCanvas ? { left: threeCanvas.offsetLeft || 0, top: threeCanvas.offsetTop || 0, width: threeCanvas.clientWidth || 0, height: threeCanvas.clientHeight || 0 } : null,
      gameCanvasRect: gameCanvas ? { left: gameCanvas.offsetLeft || 0, top: gameCanvas.offsetTop || 0, width: gameCanvas.clientWidth || 0, height: gameCanvas.clientHeight || 0 } : null,
      elementFromPointAtCenterTag: topEl?.tagName || null,
      elementFromPointAtCenterId: topEl?.id || null,
      elementFromPointAtCenterClass: topEl?.className || null,
    };
  }

  function getCanvasDiagnostics() {
    const canvas = document.getElementById("hc-three-world-canvas");
    if (!canvas) return { present: false, visible: false, display: "none", visibility: "hidden", opacity: "0", zIndex: "n/a", pointerEvents: "n/a" };
    const styles = window.getComputedStyle ? window.getComputedStyle(canvas) : canvas.style;
    const visible = styles.display !== "none" && styles.visibility !== "hidden" && Number(styles.opacity || 1) > 0;
    return { present: true, visible, display: styles.display || canvas.style.display || "block", visibility: styles.visibility || canvas.style.visibility || "visible", opacity: styles.opacity || canvas.style.opacity || "1", zIndex: styles.zIndex || canvas.style.zIndex || "auto", pointerEvents: styles.pointerEvents || canvas.style.pointerEvents || "auto" };
  }


  function roundDiagnosticNumber(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 100) / 100;
  }

  function vectorToDiagnostic(position) {
    if (!position) return null;
    return { x: roundDiagnosticNumber(position.x), y: roundDiagnosticNumber(position.y), z: roundDiagnosticNumber(position.z) };
  }


  function boundsToDiagnostic(bounds) {
    if (!bounds) return null;
    return {
      min: bounds.min ? vectorToDiagnostic(bounds.min) : (bounds.min && bounds.min.x != null ? bounds.min : null),
      max: bounds.max ? vectorToDiagnostic(bounds.max) : (bounds.max && bounds.max.x != null ? bounds.max : null),
    };
  }

  function sizeToDiagnostic(size) {
    if (!size) return null;
    return { x: roundDiagnosticNumber(size.x), y: roundDiagnosticNumber(size.y), z: roundDiagnosticNumber(size.z) };
  }

  function getObjectWorldBoundsDiagnostic(THREE, object) {
    if (!THREE?.Box3 || !object) return null;
    object.updateMatrixWorld?.(true);
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return null;
    const size = new THREE.Vector3();
    box.getSize(size);
    return { box: boundsToDiagnostic(box), size: sizeToDiagnostic(size) };
  }

  function buildGlbScaleDiagnostics(THREE, glb) {
    if (!glb) return null;
    const scale = { x: glb.scale.x, y: glb.scale.y, z: glb.scale.z };
    const zScaleRatio = Math.abs(scale.x) > 1e-6 ? scale.z / scale.x : null;
    const scaleUniform = Math.abs(scale.x - scale.y) < 1e-4 && Math.abs(scale.x - scale.z) < 1e-4;
    const world = getObjectWorldBoundsDiagnostic(THREE, glb);
    const localSize = glb.userData?.hcLocalSize || null;
    const worldSize = world?.size || null;
    const objectDepthVisibleEstimate = worldSize && Math.max(Math.abs(worldSize.x || 0), Math.abs(worldSize.y || 0)) > 1e-6
      ? roundDiagnosticNumber(Math.abs(worldSize.z || 0) / Math.max(Math.abs(worldSize.x || 0), Math.abs(worldSize.y || 0)))
      : null;
    const warning = zScaleRatio != null && zScaleRatio < 0.25 ? "GLB appears flattened in Z; lighting may not reveal 3D facets." : null;
    return {
      scale: { x: roundDiagnosticNumber(scale.x), y: roundDiagnosticNumber(scale.y), z: roundDiagnosticNumber(scale.z) },
      scaleUniform,
      zScaleRatio: roundDiagnosticNumber(zScaleRatio),
      localBoundingBox: glb.userData?.hcLocalBoundingBox || null,
      localSize: localSize ? sizeToDiagnostic(localSize) : null,
      worldBoundingBox: world?.box || null,
      worldSize,
      objectDepthVisibleEstimate,
      warning,
    };
  }

  function getFirstActiveGlbLightSample() {
    for (const entry of threeState.meteorMeshes.values()) {
      if (!entry?.glb?.visible && !entry?.fallback?.visible) continue;
      const object = entry.glb?.visible ? entry.glb : entry.root;
      if (!object || !entry.root) continue;
      return {
        kind: entry.glb?.visible ? "meteor_glb" : "meteor_fallback",
        assetName: entry.assetUrl ? getAssetNameFromUrl(entry.assetUrl) : null,
        asset: entry.assetUrl || null,
        colorKey: entry.colorKey || null,
        glbStatus: entry.glbStatus || null,
        position: vectorToDiagnostic(entry.root.position),
      };
    }
    for (const mesh of threeState.asteroidMeshes.values()) {
      if (!mesh?.visible) continue;
      return {
        kind: "asteroid_mesh",
        assetName: null,
        asset: null,
        colorKey: null,
        glbStatus: null,
        position: vectorToDiagnostic(mesh.position),
      };
    }
    return null;
  }

  function getLightDistanceDiagnostics() {
    const sample = getFirstActiveGlbLightSample();
    const samplePosition = sample?.position;
    const lightEntries = getAllDiagnosticLights().map((entry) => {
      const light = entry.light;
      const distanceRange = Number(light?.distance) || 0;
      let objectDistance = null;
      if (samplePosition && light?.position) {
        const dx = (Number(samplePosition.x) || 0) - light.position.x;
        const dy = (Number(samplePosition.y) || 0) - light.position.y;
        const dz = (Number(samplePosition.z) || 0) - light.position.z;
        objectDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      }
      return {
        name: entry.name,
        role: entry.role,
        visible: !!light?.visible,
        intensity: roundDiagnosticNumber(light?.intensity),
        position: vectorToDiagnostic(light?.position),
        distance: roundDiagnosticNumber(distanceRange),
        decay: roundDiagnosticNumber(light?.decay),
        angle: light?.isSpotLight ? roundDiagnosticNumber(light.angle) : null,
        penumbra: light?.isSpotLight ? roundDiagnosticNumber(light.penumbra) : null,
        targetPosition: entry.target ? vectorToDiagnostic(entry.target.position) : null,
        objectDistance: roundDiagnosticNumber(objectDistance),
        objectInRange: objectDistance == null ? null : (distanceRange <= 0 ? true : objectDistance <= distanceRange),
      };
    });
    const settings = threeState.lightsSettings || getThreeLightsSettings();
    return {
      sampleObject: sample,
      effectiveAmbientIntensity: settings.enabled && !settings.ambientIsolate ? roundDiagnosticNumber(settings.ambientIntensity) : 0,
      keyEnabled: !!settings.debugKeyLightEnabled,
      rimEnabled: !!(settings.debugKeyLightEnabled && settings.debugRimLightEnabled),
      headlightEnabled: !!settings.forceHeadlightEnabled,
      lights: lightEntries,
      cornerLights: lightEntries.filter((entry) => entry.role === "corner"),
      debugKeyLight: lightEntries.find((entry) => entry.role === "debug_key") || null,
      debugRimLight: lightEntries.find((entry) => entry.role === "debug_rim") || null,
      forceHeadlight: lightEntries.find((entry) => entry.role === "force_headlight") || null,
      mainStageSpot: lightEntries.find((entry) => entry.role === "main_stage_spot") || null,
      debugSpotLight: lightEntries.find((entry) => entry.role === "main_stage_spot") || null,
      mainStageSpotTargetMode: settings.mainStageSpotTargetMode || "center",
      debugSpotLightTargetMode: settings.mainStageSpotTargetMode || "center",
      legacyCornerLightsEnabled: !!settings.legacyCornerLightsEnabled,
      legacyCornerLightsAffectScene: !!(settings.enabled && settings.legacyCornerLightsEnabled && settings.pointIntensity > 0),
      debugSpotLightHelperVisible: !!threeState.lightHelpers.find((entry) => entry.name === "mainStageSpot" && entry.mode === "spotLightHelper" && entry.helper?.visible),
      sampleObjectProjected: threeState.firstMeteorScreenEstimate || null,
      sampleObjectFrustumVisible: threeState.firstMeteorInCameraBounds == null ? null : !!threeState.firstMeteorInCameraBounds,
    };
  }

  function getMaterialAuditOverlayStatus() {
    const settings = threeState.materialSettings || getThreeMaterialSettings();
    const auditedAssets = threeState.glbMaterialAudit.length;
    const consoleWrites = threeState.glbMaterialAuditLogCount;
    return {
      enabled: !!settings.enabled,
      forceAuditLog: !!settings.forceAuditLog,
      auditedAssets,
      consoleWrites,
      message: (settings.enabled || settings.forceAuditLog) ? `audit written to console (${consoleWrites}/${auditedAssets})` : "audit idle",
    };
  }

  function getDiagnostics() {
    const canvasDiag = getCanvasDiagnostics();
    const gameCanvasDiag = getGameCanvasDiagnostics();
    const layerProbe = getLayerProbe();
    const canvasLayerMode = effectiveMode === "three" ? "three_with_transparent_2d_overlay" : "canvas2d";
    return {
      requestedMode, effectiveMode, mode: effectiveMode, fallbackUsed, fallbackReason, lastError, initialized, renderCalls, fallbackCalls, snapshotVersion: "1",
      hasThreeImplementation: true, hasThreeDependency: !!threeState.hasDependency, threeDependencySource, threeBridgeVersion: window.HC_THREE_BRIDGE_VERSION || null,
      threeReady: window.HC_THREE_READY === true, threeSource: window.HC_THREE_SOURCE || null, threeModuleUrl: window.HC_THREE_MODULE_URL || null,
      threeVendorUrls: Array.isArray(window.HC_THREE_VENDOR_URLS) ? window.HC_THREE_VENDOR_URLS.slice() : [], threeLoadStatus: window.HC_THREE_LOAD_STATUS || "missing",
      threeLoadError: window.HC_THREE_LOAD_ERROR || null, threeInitialized: !!threeState.initialized, threeCanvasPresent: canvasDiag.present,
      threeCanvasVisible: canvasDiag.visible, threeCanvasDisplay: canvasDiag.display, threeCanvasVisibility: canvasDiag.visibility, threeCanvasOpacity: canvasDiag.opacity, threeCanvasZIndex: canvasDiag.zIndex, threeCanvasPointerEvents: canvasDiag.pointerEvents, threeLastError: threeState.lastError,
      gameCanvasDisplay: gameCanvasDiag.display || "missing", gameCanvasVisibility: gameCanvasDiag.visibility || "missing", gameCanvasOpacity: gameCanvasDiag.opacity || "missing", gameCanvasZIndex: gameCanvasDiag.zIndex || "missing", gameCanvasBackground: gameCanvasDiag.background || "missing", gameCanvasPointerEvents: gameCanvasDiag.pointerEvents || "missing",
      canvasLayerMode, layerProbe,
      threeRenderCalls: threeState.renderCalls, threeResizeCalls: threeState.resizeCalls, threeSceneReady: !!threeState.scene, threeCameraReady: !!threeState.camera, threeRendererReady: !!threeState.renderer,
      threeMeteorRenderEnabled: !!threeState.threeMeteorRenderEnabled, threeMeteorCount: threeState.threeMeteorCount, threeMeteorMeshes: threeState.meteorMeshes.size,
      threeAsteroidRenderEnabled: !!threeState.threeAsteroidRenderEnabled, threeAsteroidCount: threeState.threeAsteroidCount, threeAsteroidMeshes: threeState.asteroidMeshes.size, asteroidMeshCount: threeState.asteroidMeshes.size,
      threeMeteorLastError: threeState.threeMeteorLastError, threeAsteroidLastError: threeState.threeAsteroidLastError, threeObjectRenderPasses: threeState.threeObjectRenderPasses.slice(),
      threeMeteorRadiusScale: threeState.threeMeteorRadiusScale,
      threeMeteorMinRadius: threeState.threeMeteorMinRadius,
      meteorGlbAssets: METEOR_GLB_ASSETS,
      meteorGlbVisualScale: getMeteorGlbVisualScale(),
      meteorGlbDepthScale: getMeteorGlbDepthScale(),
      meteorGlbScaleLiveControl: true,
      meteorGlbDepthScaleLiveControl: true,
      glbScaleWarning: threeState.glbScaleWarning,
      globalHelpersEnabled: getGlobalHelpersEnabled(),
      threeLightsLiveControl: true,
      threeMaterialDebugLiveControl: true,
      threeMaterialSettings: Object.assign({}, threeState.materialSettings || getThreeMaterialSettings()),
      redMeteorTexturePalette: buildRedMeteorTexturePalette(),
      redMeteorTexturePaletteEnabled: getThreeMaterialSettings().redMeteorTexturesEnabled !== false,
      redMeteorTextureCacheStats: getRedMeteorTextureCacheStats(),
      redMeteorTextureUsage: countRedMeteorTextureUsage(),
      redMeteorTextureWarnings: threeState.redMeteorTextureWarnings.size,
      glbMaterialAudit: threeState.glbMaterialAudit.slice(-8),
      glbMaterialAuditStatus: getMaterialAuditOverlayStatus(),
      sceneEnvironmentEnabled: !!threeState.scene?.environment,
      rendererOutputColorSpace: threeState.renderer?.outputColorSpace || threeState.renderer?.outputEncoding || null,
      rendererToneMapping: threeState.renderer?.toneMapping ?? null,
      rendererToneMappingExposure: threeState.renderer?.toneMappingExposure ?? null,
      threeLights: Object.assign({}, threeState.lightsSettings || getThreeLightsSettings()),
      threeLightPositions: Array.isArray(threeState.lightsPositions) ? threeState.lightsPositions.map((pos) => Object.assign({}, pos)) : [],
      legacyCornerLights: {
        enabled: !!(threeState.lightsSettings || getThreeLightsSettings()).legacyCornerLightsEnabled,
        affectScene: !!((threeState.lightsSettings || getThreeLightsSettings()).enabled && (threeState.lightsSettings || getThreeLightsSettings()).legacyCornerLightsEnabled && (threeState.lightsSettings || getThreeLightsSettings()).pointIntensity > 0),
        count: Array.isArray(threeState.cornerLights) ? threeState.cornerLights.length : 0,
      },
      mainStageSpot: {
        enabled: !!(threeState.lightsSettings || getThreeLightsSettings()).mainStageSpotEnabled,
        intensity: roundDiagnosticNumber(threeState.debugSpotLight?.intensity),
        angle: roundDiagnosticNumber(threeState.debugSpotLight?.angle),
        penumbra: roundDiagnosticNumber(threeState.debugSpotLight?.penumbra),
        distance: roundDiagnosticNumber(threeState.debugSpotLight?.distance),
        decay: roundDiagnosticNumber(threeState.debugSpotLight?.decay),
        position: vectorToDiagnostic(threeState.debugSpotLight?.position),
        targetPosition: vectorToDiagnostic(threeState.debugSpotLightTarget?.position),
        targetMode: (threeState.lightsSettings || getThreeLightsSettings()).mainStageSpotTargetMode || "center",
        helperVisible: !!threeState.lightHelpers.find((entry) => entry.name === "mainStageSpot" && entry.mode === "spotLightHelper" && entry.helper?.visible),
        targetInScene: !!threeState.debugSpotLightTarget?.parent,
        castShadow: !!threeState.debugSpotLight?.castShadow,
      },
      debugSpotLight: threeState.debugSpotLight ? {
        enabled: !!(threeState.lightsSettings || getThreeLightsSettings()).mainStageSpotEnabled,
        targetMode: (threeState.lightsSettings || getThreeLightsSettings()).mainStageSpotTargetMode || "center",
        castShadow: !!threeState.debugSpotLight.castShadow,
      } : null,
      threeLightDiagnostics: getLightDistanceDiagnostics(),
      threeLightHelpers: { globalEnabled: getGlobalHelpersEnabled(), enabled: !!(threeState.lightsSettings || getThreeLightsSettings()).showLightHelpers, visible: !!threeState.lightHelpersGroup?.visible, count: threeState.lightHelpers.length, mode: threeState.lightHelperStatus?.mode || "none" },
      threeMaterialOverrideStatus: Object.assign({}, threeState.materialOverrideStatus),
      threeLightCount: Array.isArray(threeState.cornerLights) ? threeState.cornerLights.length : 0,
      meteorGlbCacheStats: getMeteorGlbCacheStats(),
      meteorGlbAssignmentsCount: Array.from(threeState.meteorMeshes.values()).filter((entry) => !!entry.assetUrl).length,
      meteorGlbCacheSize: threeState.meteorGlbCache.size,
      activeGlbInstances: Array.from(threeState.meteorMeshes.values()).filter((entry) => !!entry.glb).length,
      activeFallbackMeteorVisuals: Array.from(threeState.meteorMeshes.values()).filter((entry) => !!entry.fallback?.visible).length,
      activeGlbInstancesByColor: countMeteorVisualsByColor((entry) => !!entry.glb),
      fallbackVisualsByColor: countMeteorVisualsByColor((entry) => !!entry.fallback?.visible),
      glbVariantReassignments: threeState.meteorGlbVariantReassignments,
      meteorGlbInstanceCreates: threeState.meteorGlbInstanceCreates,
      firstMeteor: threeState.firstMeteorSample,
      firstMeteorMesh: threeState.firstMeshSample,
      threeDebugMarker: { globalEnabled: getGlobalHelpersEnabled(), enabled: !!threeState.debugMarkerEnabled, visible: !!threeState.debugMarker?.visible },
      cameraBounds: threeState.cameraBounds,
      worldCameraBounds: threeState.worldCameraBounds,
      rendererSize: threeState.rendererSize,
      sceneChildrenCount: threeState.scene?.children?.length || 0,
      meteorGroupChildrenCount: threeState.meteorGroupChildrenCount,
      asteroidGroupChildrenCount: threeState.asteroidGroupChildrenCount,
      cameraSnapshotCenter: threeState.cameraSnapshotCenter,
      cameraSnapshotZoom: threeState.cameraSnapshotZoom,
      cameraSnapshotWorldBounds: threeState.cameraSnapshotWorldBounds,
      worldBoundsSource: threeState.worldBoundsSource,
      threeCameraModel: threeState.threeCameraModel,
      cameraModel: threeState.threeCameraModel,
      stageModelEnabled: !!threeState.stageModelEnabled,
      stageSettings: Object.assign({}, threeState.stageSettings || {}),
      firstMeteorScreenEstimate: threeState.firstMeteorScreenEstimate,
      firstMeteorInCameraBounds: threeState.firstMeteorInCameraBounds,
    };
  }

  function destroy() { destroyThree(); initialized = false; resetDiagnostics(); }

  window.HC.WorldRenderer = { init, resize, render, destroy, getDiagnostics, setMode, getMode, getMeteorGlbVisualScale, setMeteorGlbVisualScale, getMeteorGlbDepthScale, setMeteorGlbDepthScale, getThreeCameraModel, setThreeCameraModel, getGlobalHelpersEnabled, setGlobalHelpersEnabled, getThreeLightsSettings, setThreeLightsDebugSetting, getThreeMaterialSettings, setThreeMaterialDebugSetting };
})();
