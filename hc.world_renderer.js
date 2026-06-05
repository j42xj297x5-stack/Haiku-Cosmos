// HC world renderer adapter facade (Stage 4 - Three.js meteor + asteroid passes)
(function () {
  window.HC = window.HC || {};

  const ALLOWED_MODES = { canvas2d: true, three: true };
  const THREE_METEOR_RADIUS_SCALE = 1.8;
  const THREE_METEOR_MIN_RADIUS = 2.4;
  const THREE_ASTEROID_MIN_RADIUS = 4.0;
  const THREE_ASTEROID_DEFAULT_SIDES = 7;
  const ASTEROID_GLB_ASSET = "glb/asteroid_01.glb";
  const ASTEROID_GLB_RADIUS_SCALE = 0.82;
  const ASTEROID_GLB_DEPTH_SCALE = 1.0;
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
  const METEOR_GLB_LOAD_TIMEOUT_MS = 10000;
  const ASTEROID_GLB_LOAD_TIMEOUT_MS = 30000;
  const GLTF_LOAD_TIMEOUT_MS = 30000;
  const GLTF_LOADER_BROWSER_PROBE_ASSET = "glb/meteor_red_form_core_01.glb";
  const GLTF_DEBUG_EVENT_LOG_LIMIT = 40;
  const METEOR_GLB_VARIANTS_PER_COLOR = 5;
  const METEOR_TEXTURE_PALETTES = Object.freeze({
    red: Object.freeze({
      map: Object.freeze([
        "/png/texture_meteor_red_01.png",
        "/png/texture_meteor_red_02.png",
        "/png/texture_meteor_red_03.png",
        "/png/texture_meteor_red_04.png",
        "/png/texture_meteor_red_05.png",
      ]),
      emissiveMap: Object.freeze([
        "/png/texture_meteor_red_emission_01.png",
        "/png/texture_meteor_red_emission_02.png",
        "/png/texture_meteor_red_emission_03.png",
        "/png/texture_meteor_red_emission_04.png",
        "/png/texture_meteor_red_emission_05.png",
      ]),
      baseColor: 0xffffff,
      emissiveColor: 0xff2f18,
      emissiveIntensity: 1.2,
      roughness: 0.86,
      metalness: 0.04,
    }),
    yellow: Object.freeze({
      map: Object.freeze([
        "/png/texture_meteor_yellow_01.png",
        "/png/texture_meteor_yellow_02.png",
        "/png/texture_meteor_yellow_03.png",
        "/png/texture_meteor_yellow_04.png",
        "/png/texture_meteor_yellow_05.png",
      ]),
      emissiveMap: Object.freeze([
        "/png/texture_meteor_yellow_emission_01.png",
        "/png/texture_meteor_yellow_emission_02.png",
        "/png/texture_meteor_yellow_emission_03.png",
        "/png/texture_meteor_yellow_emission_04.png",
        "/png/texture_meteor_yellow_emission_05.png",
      ]),
      baseColor: 0xffffff,
      emissiveColor: 0xffb12a,
      emissiveIntensity: 1.1,
      roughness: 0.78,
      metalness: 0.08,
    }),
  });
  const THREE_LIGHTS_DEFAULTS = Object.freeze({
    enabled: true,
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
    meteorPngTexturesEnabled: false,
    redMeteorTexturesEnabled: false,
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
    debugKeyLight: null,
    debugRimLight: null,
    forceHeadlight: null,
    mainStageSpot: null,
    mainStageSpotTarget: null,
    lightHelpersGroup: null,
    lightHelpers: [],
    lightsSettings: Object.assign({}, THREE_LIGHTS_DEFAULTS),
    materialSettings: Object.assign({}, THREE_MATERIAL_DEBUG_DEFAULTS),
    materialOverrideStatus: { activeGlbObjects: 0, activeGlbMeshCount: 0, meshesUsingCurrentMaterialMode: 0, currentMaterialMode: "imported", lastAppliedFrame: null, lastAppliedAtMs: null, restoredImportedMaterials: 0 },
    lightHelperStatus: { mode: "none", count: 0, visible: false },
    environment: null,
    environmentCanvas: null,
    glbBlobUrls: new Set(),
    glbMaterialAudit: [],
    gltfLoaderDiagnostics: createGltfLoaderDiagnostics(),
    gltfLoaderDebugEvents: [],
    gltfLoaderWarnedFailures: new Set(),
    gltfDebugProbe: createGltfDebugProbeDiagnostics(),
    glbMaterialAuditLoggedUrls: new Set(),
    glbMaterialAuditLogCount: 0,
    meteorGeometry: null,
    asteroidGeometries: new Map(),
    meteorMaterials: new Map(),
    asteroidMaterials: new Map(),
    meteorMeshes: new Map(),
    meteorGlbCache: new Map(),
    glbTemplateCache: new Map(),
    meteorGlbWarnings: new Set(),
    asteroidGlbCache: new Map(),
    asteroidGlbWarnings: new Set(),
    textureLoader: null,
    meteorTextureCache: new Map(),
    meteorTextureWarnings: new Set(),
    meteorTextureUsage: new Map(),
    meteorTextureDiagnostics: createMeteorTextureDiagnostics(),
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
    asteroidGlbCacheStats: { loading: 0, ready: 0, failed: 0 },
    asteroidGlbTextureDiagnostics: createAsteroidGlbTextureDiagnostics(),
    asteroidGlbInstanceCreates: 0,
    asteroidGroupChildrenCount: 0,
    firstMeteorScreenEstimate: null,
    firstMeteorInCameraBounds: null,
    firstMeteorMarker: null,
    glbScaleWarning: null,
    glbLoaderMode: "gltf_loader",
    glbLoaderPrimary: "GLTFLoader",
    glbLoaderFallbackUsed: false,
    glbLoaderFallbackReason: null,
    meteorGlbLoaderMode: "gltf_loader",
    meteorGlbLoaderPrimary: "GLTFLoader",
    meteorGlbGltfSceneMeshCount: 0,
    meteorGlbGltfSceneMaterialCount: 0,
    meteorGlbGltfSceneTextureCount: 0,
    meteorGlbValidatedVisibleCount: 0,
    meteorGlbValidationFailedCount: 0,
    asteroidGlbLoaderMode: "gltf_loader",
    asteroidGlbLoaderPrimary: "GLTFLoader",
    asteroidGlbGltfSceneMeshCount: 0,
    asteroidGlbGltfSceneMaterialCount: 0,
    asteroidGlbGltfSceneTextureCount: 0,
    asteroidGlbValidatedVisibleCount: 0,
    asteroidGlbValidationFailedCount: 0,
    asteroidFallbackKeptDueToInvalidGlbCount: 0,
    firstAsteroidSample: null,
    firstAsteroidMeshSample: null,
    firstAsteroidScreenEstimate: null,
    firstAsteroidInCameraBounds: null,
  };



  function createGltfLoaderDiagnostics() {
    const loader = typeof window !== "undefined" ? (window.HC_GLTFLoader || window.GLTFLoader || null) : null;
    return {
      gltfLoaderAvailable: typeof loader === "function",
      gltfLoaderType: loader ? typeof loader : "undefined",
      gltfLoaderImportUrl: (typeof window !== "undefined" && window.HC_GLTF_LOADER_MODULE_URL) || null,
      gltfLoaderImportStatus: (typeof window !== "undefined" && (window.HC_GLTF_LOADER_IMPORT_STATUS || window.HC_THREE_LOAD_STATUS)) || "unknown",
      gltfLoaderLastImportError: (typeof window !== "undefined" && (window.HC_GLTF_LOADER_IMPORT_ERROR || window.HC_THREE_LOAD_ERROR)) || null,
      gltfLoaderRequestCount: 0,
      gltfLoaderProgressCount: 0,
      gltfLoaderSuccessCount: 0,
      gltfLoaderErrorCount: 0,
      gltfLoaderTimeoutCount: 0,
      gltfLoaderLastRequestedUrl: null,
      gltfLoaderLastRequestedUrlRaw: null,
      gltfLoaderLastRequestedUrlResolved: null,
      gltfLoaderLastRequestedBaseUrl: null,
      gltfLoaderUrlNormalizeError: null,
      gltfLoaderLastProgressUrl: null,
      gltfLoaderLastCompletedUrl: null,
      gltfLoaderLastFailedUrl: null,
      gltfLoaderLastTimedOutUrl: null,
      gltfLoaderLastProgressLoaded: null,
      gltfLoaderLastProgressTotal: null,
      gltfLoaderLastDurationMs: null,
      gltfLoaderLastErrorName: null,
      gltfLoaderLastErrorMessage: null,
      gltfLoaderLastErrorStack: null,
      gltfLoaderPendingUrls: [],
      gltfLoaderFailedUrls: [],
      gltfLoaderTimedOutUrls: [],
    };
  }

  function createGltfDebugProbeDiagnostics() {
    return {
      enabled: true,
      asset: GLTF_LOADER_BROWSER_PROBE_ASSET,
      url: null,
      status: "idle",
      startedAt: null,
      durationMs: null,
      meshCount: 0,
      materialCount: 0,
      textureCount: 0,
      errorMessage: null,
    };
  }

  function getGlbLoadTimeoutMs(assetKind) {
    if (assetKind === "meteor" || assetKind === "debug_probe") return METEOR_GLB_LOAD_TIMEOUT_MS;
    if (assetKind === "asteroid") return ASTEROID_GLB_LOAD_TIMEOUT_MS;
    return GLTF_LOAD_TIMEOUT_MS;
  }

  function isWorldRendererDebugMode() {
    return window.HC?.Session?.mode === "debug" || window.HC?.Session?.debugConfig?.mode === "debug" || window.HC?.WorldRendererDebug?.gltfDebugProbeEnabled === true;
  }

  function refreshGltfLoaderAvailabilityDiagnostics() {
    const diagnostics = threeState.gltfLoaderDiagnostics || createGltfLoaderDiagnostics();
    const loader = getGltfLoaderClass();
    diagnostics.gltfLoaderAvailable = typeof loader === "function";
    diagnostics.gltfLoaderType = loader ? typeof loader : "undefined";
    diagnostics.gltfLoaderImportUrl = window.HC_GLTF_LOADER_MODULE_URL || diagnostics.gltfLoaderImportUrl || null;
    diagnostics.gltfLoaderImportStatus = window.HC_GLTF_LOADER_IMPORT_STATUS || window.HC_THREE_LOAD_STATUS || diagnostics.gltfLoaderImportStatus || "unknown";
    diagnostics.gltfLoaderLastImportError = window.HC_GLTF_LOADER_IMPORT_ERROR || window.HC_THREE_LOAD_ERROR || null;
    threeState.gltfLoaderDiagnostics = diagnostics;
    return diagnostics;
  }

  function formatGlbError(error) {
    if (!error) return "Unknown GLTFLoader error";
    if (typeof error === "string") return error;
    return error.message || error.statusText || error.type || String(error);
  }

  function safeGlbErrorStack(error) {
    const stack = typeof error?.stack === "string" ? error.stack : null;
    return stack ? stack.slice(0, 4000) : null;
  }

  function safeGlbErrorName(error) {
    return error?.name || error?.type || (error ? typeof error : null);
  }

  function pushUniqueLimited(list, value, limit = 20) {
    if (!value || !Array.isArray(list)) return list;
    const existingIndex = list.indexOf(value);
    if (existingIndex >= 0) list.splice(existingIndex, 1);
    list.push(value);
    while (list.length > limit) list.shift();
    return list;
  }

  function removeFromList(list, value) {
    if (!value || !Array.isArray(list)) return list;
    const index = list.indexOf(value);
    if (index >= 0) list.splice(index, 1);
    return list;
  }

  function syncGltfLoaderUrlDiagnostics() {
    const diagnostics = threeState.gltfLoaderDiagnostics || createGltfLoaderDiagnostics();
    diagnostics.gltfLoaderPendingUrls = Array.from(threeState.glbTemplateCache.values()).filter((entry) => entry?.status === "loading").map((entry) => entry.resolvedUrl || entry.url);
    diagnostics.gltfLoaderFailedUrls = Array.from(threeState.glbTemplateCache.values()).filter((entry) => entry?.status === "failed").map((entry) => entry.resolvedUrl || entry.url);
    diagnostics.gltfLoaderTimedOutUrls = Array.from(new Set((diagnostics.gltfLoaderTimedOutUrls || []).filter(Boolean)));
    threeState.gltfLoaderDiagnostics = diagnostics;
    return diagnostics;
  }

  function makeGlbEventPayload(type, { assetKind, url, cacheKey, startedAt, durationMs = null, loaded = null, total = null, error = null, status = null, readyState = null, meshCount = null, materialCount = null, textureCount = null } = {}) {
    const elapsedMs = Number.isFinite(durationMs) ? durationMs : (Number.isFinite(startedAt) ? performance.now() - startedAt : null);
    const errorMessage = error ? formatGlbError(error) : null;
    return {
      assetKind,
      url,
      loaderMode: "gltf_loader",
      cacheKey: cacheKey || url || null,
      durationMs: Number.isFinite(elapsedMs) ? elapsedMs : null,
      loaded,
      total,
      errorName: error ? safeGlbErrorName(error) : null,
      errorMessage,
      errorStack: error ? safeGlbErrorStack(error) : null,
      readyState,
      status,
      meshCount,
      materialCount,
      textureCount,
      eventKind: type,
    };
  }

  function emitGlbDebugEvent(type, payload = {}) {
    const eventPayload = Object.assign({ type, atMs: Date.now() }, payload);
    threeState.gltfLoaderDebugEvents.push(eventPayload);
    if (threeState.gltfLoaderDebugEvents.length > GLTF_DEBUG_EVENT_LOG_LIMIT) threeState.gltfLoaderDebugEvents.shift();
    try { window.dispatchEvent?.(new CustomEvent(type, { detail: eventPayload })); } catch (_) {}
    return eventPayload;
  }

  function warnGlbLoadFailureOnce(url, message, payload = {}) {
    const key = `${url}::${message}`;
    if (threeState.gltfLoaderWarnedFailures.has(key)) return;
    threeState.gltfLoaderWarnedFailures.add(key);
    if (window.console?.warn) window.console.warn(`[HC.WorldRenderer] GLTFLoader failed for ${url}: ${message}`, payload);
  }

  function createAsteroidGlbTextureDiagnostics() {
    return {
      asteroidGlbEmbeddedTextureCount: 0,
      asteroidGlbTextureReadyCount: 0,
      asteroidGlbTextureMissingImageCount: 0,
      asteroidGlbTextureFallbackMaterialCount: 0,
      asteroidGlbLoaderMode: "gltf_loader",
      imageBufferViewCount: 0,
      imageUriCount: 0,
      imageDataUriCount: 0,
      imagePngCount: 0,
      imageJpegCount: 0,
      imageUnsupportedMimeCount: 0,
      lastAssetUrl: null,
      lastError: null,
    };
  }

  function createMeteorTextureDiagnostics() {
    return {
      enabled: true,
      materialMode: "imported",
      eligibleInstances: 0,
      applyAttempts: 0,
      applySkippedAlreadyCurrent: 0,
      reapplyDueToMissingMap: 0,
      reapplyDueToMaterialModeChange: 0,
      reapplyDueToToggleChange: 0,
      reapplyDueToNewEntry: 0,
      textureLoadRequests: 0,
      cacheLoading: 0,
      cacheReady: 0,
      cacheFailed: 0,
      sceneMeshesVisited: 0,
      redYellowSceneMeshesVisited: 0,
      materialSlotsVisited: 0,
      materialSlotsWithMap: 0,
      materialSlotsWithEmissiveMap: 0,
      materialSlotsWithMapImage: 0,
      materialSlotsWithEmissiveImage: 0,
      materialsVisited: 0,
      materialsConvertedToStandard: 0,
      materialConversions: 0,
      appliedThisFrame: 0,
      mapApplied: 0,
      emissiveMapApplied: 0,
      activeGlbEntries: 0,
      activeGlbEntriesWithSceneObject: 0,
      activeGlbEntriesWithColor: 0,
      activeGlbEntriesMissingColor: 0,
      activeGlbEntriesUnsupportedColor: 0,
      activeGlbEntriesEligibleRedYellow: 0,
      sourceMeteorColorSamples: [],
      entryColorFieldSamples: [],
      skippedMissingColor: 0,
      skippedUnsupportedColor: 0,
      syncActiveEntriesCalls: 0,
      mapLostAfterApply: 0,
      emissiveMapLostAfterApply: 0,
      strippedAfterApply: 0,
      lastAppliedColor: null,
      lastAppliedMapUrl: null,
      lastAppliedEmissiveMapUrl: null,
      lastFallbackReason: null,
    };
  }

  function resetMeteorTextureFrameDiagnostics() {
    const diagnostics = threeState.meteorTextureDiagnostics || createMeteorTextureDiagnostics();
    diagnostics.eligibleInstances = 0;
    diagnostics.appliedThisFrame = 0;
    diagnostics.sceneMeshesVisited = 0;
    diagnostics.redYellowSceneMeshesVisited = 0;
    diagnostics.materialSlotsVisited = 0;
    diagnostics.materialSlotsWithMap = 0;
    diagnostics.materialSlotsWithEmissiveMap = 0;
    diagnostics.materialSlotsWithMapImage = 0;
    diagnostics.materialSlotsWithEmissiveImage = 0;
    diagnostics.materialsVisited = 0;
    diagnostics.materialsConvertedToStandard = 0;
    diagnostics.mapApplied = 0;
    diagnostics.emissiveMapApplied = 0;
    diagnostics.activeGlbEntries = 0;
    diagnostics.activeGlbEntriesWithSceneObject = 0;
    diagnostics.activeGlbEntriesWithColor = 0;
    diagnostics.activeGlbEntriesMissingColor = 0;
    diagnostics.activeGlbEntriesUnsupportedColor = 0;
    diagnostics.activeGlbEntriesEligibleRedYellow = 0;
    diagnostics.sourceMeteorColorSamples = [];
    diagnostics.entryColorFieldSamples = [];
    diagnostics.skippedMissingColor = 0;
    diagnostics.skippedUnsupportedColor = 0;
    const cacheStats = getMeteorTextureCacheStats();
    diagnostics.cacheLoading = cacheStats.loading;
    diagnostics.cacheReady = cacheStats.ready;
    diagnostics.cacheFailed = cacheStats.failed;
    diagnostics.mapLostAfterApply = 0;
    diagnostics.emissiveMapLostAfterApply = 0;
    diagnostics.strippedAfterApply = 0;
    threeState.meteorTextureDiagnostics = diagnostics;
  }

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
    threeState.asteroidGlbTextureDiagnostics = createAsteroidGlbTextureDiagnostics();
    threeState.asteroidGlbInstanceCreates = 0;
    threeState.glbMaterialAudit = [];
    threeState.gltfLoaderDiagnostics = createGltfLoaderDiagnostics();
    threeState.gltfLoaderDebugEvents = [];
    threeState.gltfLoaderWarnedFailures = new Set();
    threeState.gltfDebugProbe = createGltfDebugProbeDiagnostics();
    threeState.glbMaterialAuditLogCount = 0;
    threeState.meteorTextureUsage = new Map();
    threeState.meteorTextureDiagnostics = { enabled: true, applyAttempts: 0, mapApplied: 0, emissiveMapApplied: 0, materialConversions: 0, lastFallbackReason: null };
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
      ambientIntensity: clampNumber(merged.ambientIntensity, THREE_LIGHTS_DEFAULTS.ambientIntensity, THREE_LIGHTS_LIMITS.ambientIntensity.min, THREE_LIGHTS_LIMITS.ambientIntensity.max),
      ambientIsolate: merged.ambientIsolate === true,
      debugKeyLightEnabled: merged.debugKeyLightEnabled === true,
      debugKeyLightIntensity: clampNumber(merged.debugKeyLightIntensity, THREE_LIGHTS_DEFAULTS.debugKeyLightIntensity, THREE_LIGHTS_LIMITS.debugKeyLightIntensity.min, THREE_LIGHTS_LIMITS.debugKeyLightIntensity.max),
      debugRimLightEnabled: merged.debugRimLightEnabled === true,
      debugRimLightIntensity: clampNumber(merged.debugRimLightIntensity, THREE_LIGHTS_DEFAULTS.debugRimLightIntensity, THREE_LIGHTS_LIMITS.debugRimLightIntensity.min, THREE_LIGHTS_LIMITS.debugRimLightIntensity.max),
      forceHeadlightEnabled: merged.forceHeadlightEnabled === true,
      forceHeadlightIntensity: clampNumber(merged.forceHeadlightIntensity, THREE_LIGHTS_DEFAULTS.forceHeadlightIntensity, THREE_LIGHTS_LIMITS.forceHeadlightIntensity.min, THREE_LIGHTS_LIMITS.forceHeadlightIntensity.max),
      mainStageSpotEnabled: (merged.mainStageSpotEnabled ?? THREE_LIGHTS_DEFAULTS.mainStageSpotEnabled) !== false,
      mainStageSpotIntensity: clampNumber(merged.mainStageSpotIntensity, THREE_LIGHTS_DEFAULTS.mainStageSpotIntensity, THREE_LIGHTS_LIMITS.mainStageSpotIntensity.min, THREE_LIGHTS_LIMITS.mainStageSpotIntensity.max),
      mainStageSpotAngle: clampNumber(merged.mainStageSpotAngle, THREE_LIGHTS_DEFAULTS.mainStageSpotAngle, THREE_LIGHTS_LIMITS.mainStageSpotAngle.min, THREE_LIGHTS_LIMITS.mainStageSpotAngle.max),
      mainStageSpotPenumbra: clampNumber(merged.mainStageSpotPenumbra, THREE_LIGHTS_DEFAULTS.mainStageSpotPenumbra, THREE_LIGHTS_LIMITS.mainStageSpotPenumbra.min, THREE_LIGHTS_LIMITS.mainStageSpotPenumbra.max),
      mainStageSpotDistance: clampNumber(merged.mainStageSpotDistance, THREE_LIGHTS_DEFAULTS.mainStageSpotDistance, THREE_LIGHTS_LIMITS.mainStageSpotDistance.min, THREE_LIGHTS_LIMITS.mainStageSpotDistance.max),
      mainStageSpotDecay: clampNumber(merged.mainStageSpotDecay, THREE_LIGHTS_DEFAULTS.mainStageSpotDecay, THREE_LIGHTS_LIMITS.mainStageSpotDecay.min, THREE_LIGHTS_LIMITS.mainStageSpotDecay.max),
      mainStageSpotXOffset: clampNumber(merged.mainStageSpotXOffset, THREE_LIGHTS_DEFAULTS.mainStageSpotXOffset, THREE_LIGHTS_LIMITS.mainStageSpotXOffset.min, THREE_LIGHTS_LIMITS.mainStageSpotXOffset.max),
      mainStageSpotYOffset: clampNumber(merged.mainStageSpotYOffset, THREE_LIGHTS_DEFAULTS.mainStageSpotYOffset, THREE_LIGHTS_LIMITS.mainStageSpotYOffset.min, THREE_LIGHTS_LIMITS.mainStageSpotYOffset.max),
      mainStageSpotZHeight: clampNumber(merged.mainStageSpotZHeight, THREE_LIGHTS_DEFAULTS.mainStageSpotZHeight, THREE_LIGHTS_LIMITS.mainStageSpotZHeight.min, THREE_LIGHTS_LIMITS.mainStageSpotZHeight.max),
      mainStageSpotTargetMode: isThreeSpotLightTargetMode(merged.mainStageSpotTargetMode) ? String(merged.mainStageSpotTargetMode) : THREE_LIGHTS_DEFAULTS.mainStageSpotTargetMode,
      showLightHelpers: merged.showLightHelpers === true,
    };
  }

  function setThreeLightsDebugSetting(key, value) {
    const current = getThreeLightsSettings();
    const next = Object.assign({}, current);
    if (key === "enabled") next.enabled = value !== false && value !== "false" && value !== "0";
    else if (key === "ambientIntensity") next.ambientIntensity = clampNumber(value, current.ambientIntensity, THREE_LIGHTS_LIMITS.ambientIntensity.min, THREE_LIGHTS_LIMITS.ambientIntensity.max);
    else if (key === "ambientIsolate") next.ambientIsolate = value === true || value === "true" || value === "1";
    else if (key === "debugKeyLightEnabled") next.debugKeyLightEnabled = value === true || value === "true" || value === "1";
    else if (key === "debugKeyLightIntensity") next.debugKeyLightIntensity = clampNumber(value, current.debugKeyLightIntensity, THREE_LIGHTS_LIMITS.debugKeyLightIntensity.min, THREE_LIGHTS_LIMITS.debugKeyLightIntensity.max);
    else if (key === "debugRimLightEnabled") next.debugRimLightEnabled = value !== false && value !== "false" && value !== "0";
    else if (key === "debugRimLightIntensity") next.debugRimLightIntensity = clampNumber(value, current.debugRimLightIntensity, THREE_LIGHTS_LIMITS.debugRimLightIntensity.min, THREE_LIGHTS_LIMITS.debugRimLightIntensity.max);
    else if (key === "forceHeadlightEnabled") next.forceHeadlightEnabled = value === true || value === "true" || value === "1";
    else if (key === "forceHeadlightIntensity") next.forceHeadlightIntensity = clampNumber(value, current.forceHeadlightIntensity, THREE_LIGHTS_LIMITS.forceHeadlightIntensity.min, THREE_LIGHTS_LIMITS.forceHeadlightIntensity.max);
    else if (key === "mainStageSpotEnabled") next.mainStageSpotEnabled = value === true || value === "true" || value === "1";
    else if (key === "mainStageSpotIntensity") next.mainStageSpotIntensity = clampNumber(value, current.mainStageSpotIntensity, THREE_LIGHTS_LIMITS.mainStageSpotIntensity.min, THREE_LIGHTS_LIMITS.mainStageSpotIntensity.max);
    else if (key === "mainStageSpotAngle") next.mainStageSpotAngle = clampNumber(value, current.mainStageSpotAngle, THREE_LIGHTS_LIMITS.mainStageSpotAngle.min, THREE_LIGHTS_LIMITS.mainStageSpotAngle.max);
    else if (key === "mainStageSpotPenumbra") next.mainStageSpotPenumbra = clampNumber(value, current.mainStageSpotPenumbra, THREE_LIGHTS_LIMITS.mainStageSpotPenumbra.min, THREE_LIGHTS_LIMITS.mainStageSpotPenumbra.max);
    else if (key === "mainStageSpotDistance") next.mainStageSpotDistance = clampNumber(value, current.mainStageSpotDistance, THREE_LIGHTS_LIMITS.mainStageSpotDistance.min, THREE_LIGHTS_LIMITS.mainStageSpotDistance.max);
    else if (key === "mainStageSpotDecay") next.mainStageSpotDecay = clampNumber(value, current.mainStageSpotDecay, THREE_LIGHTS_LIMITS.mainStageSpotDecay.min, THREE_LIGHTS_LIMITS.mainStageSpotDecay.max);
    else if (key === "mainStageSpotXOffset") next.mainStageSpotXOffset = clampNumber(value, current.mainStageSpotXOffset, THREE_LIGHTS_LIMITS.mainStageSpotXOffset.min, THREE_LIGHTS_LIMITS.mainStageSpotXOffset.max);
    else if (key === "mainStageSpotYOffset") next.mainStageSpotYOffset = clampNumber(value, current.mainStageSpotYOffset, THREE_LIGHTS_LIMITS.mainStageSpotYOffset.min, THREE_LIGHTS_LIMITS.mainStageSpotYOffset.max);
    else if (key === "mainStageSpotZHeight") next.mainStageSpotZHeight = clampNumber(value, current.mainStageSpotZHeight, THREE_LIGHTS_LIMITS.mainStageSpotZHeight.min, THREE_LIGHTS_LIMITS.mainStageSpotZHeight.max);
    else if (key === "mainStageSpotTargetMode") next.mainStageSpotTargetMode = isThreeSpotLightTargetMode(value) ? String(value) : current.mainStageSpotTargetMode;
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
      meteorPngTexturesEnabled: merged.meteorPngTexturesEnabled === true || merged.redMeteorTexturesEnabled === true,
      redMeteorTexturesEnabled: merged.redMeteorTexturesEnabled === true || merged.meteorPngTexturesEnabled === true,
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
    else if (key === "meteorPngTexturesEnabled") {
      next.meteorPngTexturesEnabled = value === true || value === "true" || value === "1";
      next.redMeteorTexturesEnabled = next.meteorPngTexturesEnabled;
    }
    else if (key === "redMeteorTexturesEnabled") {
      next.redMeteorTexturesEnabled = value === true || value === "true" || value === "1";
      next.meteorPngTexturesEnabled = next.redMeteorTexturesEnabled;
    }
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
    const mainStageSpotTarget = new THREE.Object3D();
    mainStageSpotTarget.name = "hc_main_stage_spot_target";
    mainStageSpotTarget.position.set(0, 0, 0);
    const mainStageSpot = new THREE.SpotLight(0xffffff, THREE_LIGHTS_DEFAULTS.mainStageSpotIntensity, THREE_LIGHTS_DEFAULTS.mainStageSpotDistance, THREE_LIGHTS_DEFAULTS.mainStageSpotAngle, THREE_LIGHTS_DEFAULTS.mainStageSpotPenumbra, THREE_LIGHTS_DEFAULTS.mainStageSpotDecay);
    mainStageSpot.name = "hc_main_stage_spot";
    mainStageSpot.castShadow = false;
    mainStageSpot.visible = true;
    mainStageSpot.target = mainStageSpotTarget;
    lightsGroup.add(ambientLight);
    lightsGroup.add(debugKeyLight);
    lightsGroup.add(debugRimLight);
    lightsGroup.add(forceHeadlight);
    lightsGroup.add(mainStageSpotTarget);
    lightsGroup.add(mainStageSpot);
    Object.assign(threeState, { lightsGroup, ambientLight, debugKeyLight, debugRimLight, forceHeadlight, mainStageSpot, mainStageSpotTarget });
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
    if (threeState.debugKeyLight) entries.push({ name: "debugKey", light: threeState.debugKeyLight, color: 0xfff0d8, role: "debug_key", diagnostic: true });
    if (threeState.debugRimLight) entries.push({ name: "debugRim", light: threeState.debugRimLight, color: 0xcfe2ff, role: "debug_rim", diagnostic: true });
    if (threeState.forceHeadlight) entries.push({ name: "forceHeadlight", light: threeState.forceHeadlight, color: 0xffffff, role: "force_headlight", diagnostic: true });
    if (threeState.mainStageSpot) entries.push({ name: "mainStageSpot", light: threeState.mainStageSpot, target: threeState.mainStageSpotTarget, color: 0xffffff, role: "main_stage_spot", diagnostic: false });
    return entries;
  }

  function isLightActivelyAffectingScene(light) {
    return !!light?.visible && Number(light?.intensity || 0) > 0;
  }

  function getStageLightCounts() {
    const lights = getAllDiagnosticLights();
    return {
      activeLightCount: lights.filter((entry) => isLightActivelyAffectingScene(entry.light)).length,
      diagnosticLightCount: lights.filter((entry) => entry.diagnostic === true).length,
      totalLightObjects: lights.length,
    };
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
    if (!threeState.ambientLight) return;
    const settings = getThreeLightsSettings();
    threeState.lightsSettings = settings;
    const bounds = threeState.cameraBounds || { left: 0, right: 1, top: 0, bottom: 1, cx: 0.5, cy: 0.5 };
    const width = Math.max(1, Math.abs(bounds.right - bounds.left));
    const height = Math.max(1, Math.abs(bounds.bottom - bounds.top));
    const maxDim = Math.max(width, height);
    const effectiveAmbient = settings.ambientIsolate ? 0 : settings.ambientIntensity;
    threeState.ambientLight.intensity = settings.enabled ? effectiveAmbient : 0;
    threeState.ambientLight.visible = settings.enabled && effectiveAmbient > 0;
    const debugKeyDistance = Math.max(maxDim, maxDim * 1.1);
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
    if (threeState.mainStageSpotTarget) {
      threeState.mainStageSpotTarget.position.set(spotTargetX, spotTargetY, spotTargetZ);
      threeState.mainStageSpotTarget.updateMatrixWorld?.();
    }
    if (threeState.mainStageSpot) {
      threeState.mainStageSpot.position.set(
        bounds.cx + width * settings.mainStageSpotXOffset,
        bounds.cy + height * settings.mainStageSpotYOffset,
        Math.max(24, height * settings.mainStageSpotZHeight)
      );
      threeState.mainStageSpot.intensity = settings.mainStageSpotEnabled ? settings.mainStageSpotIntensity : 0;
      threeState.mainStageSpot.angle = settings.mainStageSpotAngle;
      threeState.mainStageSpot.penumbra = settings.mainStageSpotPenumbra;
      threeState.mainStageSpot.distance = settings.mainStageSpotDistance;
      threeState.mainStageSpot.decay = settings.mainStageSpotDecay;
      threeState.mainStageSpot.castShadow = false;
      threeState.mainStageSpot.visible = settings.mainStageSpotEnabled && settings.mainStageSpotIntensity > 0;
      if (threeState.mainStageSpotTarget) threeState.mainStageSpot.target = threeState.mainStageSpotTarget;
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


  function getBrowserAssetBaseUrl() {
    if (typeof document !== "undefined" && document.baseURI) return document.baseURI;
    if (typeof window !== "undefined" && window.location?.href) return window.location.href;
    return "";
  }

  function normalizeBrowserAssetUrl(url) {
    if (!url) return "";
    const raw = String(url);
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) {
      const origin = (typeof window !== "undefined" && window.location?.origin) || "";
      return origin ? `${origin}${raw}` : raw;
    }
    return new URL(raw, getBrowserAssetBaseUrl() || window.location.href).href;
  }

  function resolvePublicAssetPath(path) {
    const rawPath = String(path || "");
    if (/^https?:\/\//i.test(rawPath) || rawPath.startsWith("/")) return rawPath;
    const cleanPath = rawPath.replace(/^\/+/, "");
    const helper = window.HC?.publicAssetPath || window.HC?.publicPath;
    if (typeof helper === "function") return helper(cleanPath);
    try { return new URL(cleanPath, getBrowserAssetBaseUrl() || window.location.href).href; }
    catch { return cleanPath; }
  }

  function normalizeMeteorColorKey(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "neutral";
    const aliases = {
      red: "red",
      czerwony: "red",
      czerwona: "red",
      form: "red",
      yellow: "yellow",
      zolty: "yellow",
      zolta: "yellow",
      żółty: "yellow",
      żółta: "yellow",
      bond: "yellow",
      green: "green",
      zielony: "green",
      flow: "green",
      blue: "blue",
      niebieski: "blue",
      silence: "blue",
    };
    return aliases[raw] || raw;
  }

  function getMeteorColorFields(source) {
    if (!source || typeof source !== "object") return {};
    return {
      meteorColorKey: source.meteorColorKey ?? null,
      colorKey: source.colorKey ?? null,
      colorName: source.colorName ?? null,
      color: source.color ?? null,
      col: source.col ?? null,
      fill: source.fill ?? null,
      dominantKey: source.dominantKey ?? null,
      type: source.type ?? null,
      kind: source.kind ?? null,
      assetKey: source.assetKey ?? source.modelKey ?? source.glbAssetKey ?? null,
      assetUrl: source.assetUrl ?? source.glbAssetUrl ?? source.root?.userData?.glbAssetUrl ?? null,
      rootUserDataColorKey: source.root?.userData?.colorKey ?? source.root?.userData?.meteorColorKey ?? null,
      glbUserDataColorKey: source.glb?.userData?.colorKey ?? source.glb?.userData?.meteorColorKey ?? null,
    };
  }

  function extractMeteorColorFromAssetKey(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return null;
    const match = raw.match(/(?:^|[_\-/])(red|yellow|green|blue|form|bond|flow|silence)(?:$|[_\-.])/);
    return match ? normalizeMeteorColorKey(match[1]) : null;
  }

  function firstMeteorColorCandidate(fields) {
    const directKeys = ["meteorColorKey", "colorKey", "colorName", "dominantKey", "rootUserDataColorKey", "glbUserDataColorKey", "color", "col", "fill"];
    for (const key of directKeys) {
      const normalized = normalizeMeteorColorKey(fields?.[key]);
      if (normalized && normalized !== "neutral") return normalized;
    }
    const typeKey = normalizeMeteorColorKey(fields?.type);
    if (["red", "yellow", "green", "blue"].includes(typeKey)) return typeKey;
    const kindKey = normalizeMeteorColorKey(fields?.kind);
    if (["red", "yellow", "green", "blue"].includes(kindKey)) return kindKey;
    return null;
  }

  function getMeteorColorKey(source, fallback = "neutral") {
    if (source && typeof source === "object") {
      const fields = getMeteorColorFields(source);
      const direct = firstMeteorColorCandidate(fields);
      if (direct) return direct;
      const nestedSource = source.sourceMeteor || source.meteor || source.source || null;
      if (nestedSource && nestedSource !== source) {
        const nested = getMeteorColorKey(nestedSource, null);
        if (nested && nested !== "neutral") return nested;
      }
      const assetFallback = extractMeteorColorFromAssetKey(fields?.assetKey) || extractMeteorColorFromAssetKey(fields?.assetUrl);
      if (assetFallback) return assetFallback;
      return normalizeMeteorColorKey(fallback);
    }
    return normalizeMeteorColorKey(source || fallback);
  }

  function getMeteorTextureConfig(colorKey) {
    return METEOR_TEXTURE_PALETTES[normalizeMeteorColorKey(colorKey)] || null;
  }

  function buildMeteorTexturePalette(colorKey, kind) {
    const normalizedColorKey = normalizeMeteorColorKey(colorKey);
    const paths = getMeteorTextureConfig(normalizedColorKey)?.[kind] || [];
    return paths.map((path) => ({ colorKey: normalizedColorKey, kind, path, url: resolvePublicAssetPath(path) }));
  }

  function chooseMeteorTexture(colorKey, kind) {
    const palette = buildMeteorTexturePalette(colorKey, kind);
    if (!palette.length) return null;
    const index = Math.floor(Math.random() * palette.length) % palette.length;
    return Object.assign({ index }, palette[index]);
  }

  function warnMeteorTextureOnce(url, message) {
    if (threeState.meteorTextureWarnings.has(url)) return;
    threeState.meteorTextureWarnings.add(url);
    if (window.console?.warn) window.console.warn(`[HC.WorldRenderer] Meteor texture fallback for ${url}: ${message}`);
  }

  function configureMeteorTexture(THREE, texture, kind) {
    if (!texture) return texture;
    const colorSpace = THREE.SRGBColorSpace || null;
    if (colorSpace && "colorSpace" in texture) texture.colorSpace = colorSpace;
    else if (THREE.sRGBEncoding && "encoding" in texture) texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;
    texture.userData = Object.assign({}, texture.userData, { hcMeteorTextureKind: kind });
    texture.needsUpdate = true;
    return texture;
  }

  function markMeteorTextureMaterialsForUpdate(entry) {
    if (!entry?.materials) return;
    entry.materials.forEach((material) => {
      if (material) material.needsUpdate = true;
    });
  }

  function loadMeteorTexture(THREE, assignment) {
    if (!assignment?.url || !THREE?.TextureLoader) return null;
    let entry = threeState.meteorTextureCache.get(assignment.url);
    if (entry) return entry;
    if (!threeState.textureLoader) threeState.textureLoader = new THREE.TextureLoader();
    entry = {
      status: "loading",
      texture: null,
      error: null,
      url: assignment.url,
      path: assignment.path,
      name: assignment.path?.split("/").pop() || assignment.url,
      kind: assignment.kind,
      colorKey: assignment.colorKey,
      materials: new Set(),
    };
    threeState.meteorTextureCache.set(assignment.url, entry);
    threeState.meteorTextureDiagnostics.textureLoadRequests += 1;
    const texture = threeState.textureLoader.load(
      assignment.url,
      (loadedTexture) => {
        entry.texture = configureMeteorTexture(THREE, loadedTexture || texture, assignment.kind);
        const image = entry.texture?.image || loadedTexture?.image || null;
        entry.imageWidth = Number(image?.naturalWidth || image?.videoWidth || image?.width) || null;
        entry.imageHeight = Number(image?.naturalHeight || image?.videoHeight || image?.height) || null;
        entry.status = "ready";
        if (entry.texture) entry.texture.needsUpdate = true;
        markMeteorTextureMaterialsForUpdate(entry);
      },
      undefined,
      (error) => {
        entry.status = "failed";
        entry.error = error?.message || String(error || "load error");
        threeState.meteorTextureDiagnostics.lastFallbackReason = `texture_failed:${entry.name}`;
        markMeteorTextureMaterialsForUpdate(entry);
        warnMeteorTextureOnce(assignment.url, entry.error);
      }
    );
    entry.texture = configureMeteorTexture(THREE, texture, assignment.kind);
    return entry;
  }

  function getMeteorTextureCacheStats() {
    const stats = { loading: 0, ready: 0, failed: 0, total: threeState.meteorTextureCache.size };
    for (const entry of threeState.meteorTextureCache.values()) {
      if (entry?.status === "ready") stats.ready += 1;
      else if (entry?.status === "failed") stats.failed += 1;
      else stats.loading += 1;
    }
    return stats;
  }

  function getTextureImageSize(texture) {
    const image = texture?.image || null;
    return {
      width: Number(image?.naturalWidth || image?.videoWidth || image?.width) || null,
      height: Number(image?.naturalHeight || image?.videoHeight || image?.height) || null,
    };
  }

  function textureHasLoadedImage(texture) {
    const size = getTextureImageSize(texture);
    return size.width > 0 && size.height > 0;
  }

  function countMeteorTextureUsage() {
    const counts = {};
    for (const colorKey of Object.keys(METEOR_TEXTURE_PALETTES)) {
      counts[colorKey] = { map: {}, emissiveMap: {} };
      for (const kind of ["map", "emissiveMap"]) {
        for (const paletteEntry of buildMeteorTexturePalette(colorKey, kind)) counts[colorKey][kind][paletteEntry.path] = 0;
      }
    }
    for (const entry of threeState.meteorMeshes.values()) {
      const colorKey = entry?.colorKey;
      if (!counts[colorKey]) continue;
      for (const kind of ["map", "emissiveMap"]) {
        const path = entry?.meteorTextureAssignments?.[kind]?.path;
        if (path) counts[colorKey][kind][path] = (counts[colorKey][kind][path] || 0) + 1;
      }
    }
    return counts;
  }

  function getMeteorTextureEvidence() {
    const settings = threeState.materialSettings || getThreeMaterialSettings();
    const cacheStats = getMeteorTextureCacheStats();
    const diagnostics = threeState.meteorTextureDiagnostics || createMeteorTextureDiagnostics();
    const evidence = Object.assign(createMeteorTextureDiagnostics(), diagnostics, {
      enabled: getMeteorTexturePassEnabled(settings),
      materialMode: settings.materialMode || "imported",
      eligibleInstances: 0,
      sceneMeshesVisited: 0,
      redYellowSceneMeshesVisited: 0,
      materialSlotsVisited: 0,
      materialSlotsWithMap: 0,
      materialSlotsWithEmissiveMap: 0,
      materialSlotsWithMapImage: 0,
      materialSlotsWithEmissiveImage: 0,
      cacheLoading: cacheStats.loading,
      cacheReady: cacheStats.ready,
      cacheFailed: cacheStats.failed,
      cache: cacheStats,
      activeGlbEntries: 0,
      activeGlbEntriesWithSceneObject: 0,
      activeGlbEntriesWithColor: 0,
      activeGlbEntriesMissingColor: 0,
      activeGlbEntriesUnsupportedColor: 0,
      activeGlbEntriesEligibleRedYellow: 0,
    });
    for (const entry of threeState.meteorMeshes.values()) {
      if (!entry?.glb) continue;
      evidence.activeGlbEntries += 1;
      if (getEntryScenePresence(entry)) evidence.activeGlbEntriesWithSceneObject += 1;
      const colorKey = getMeteorEntryColorKey(entry);
      const hasColor = !!colorKey && colorKey !== "neutral";
      const supported = !!getMeteorTextureConfig(colorKey);
      if (hasColor) evidence.activeGlbEntriesWithColor += 1;
      else evidence.activeGlbEntriesMissingColor += 1;
      if (hasColor && !supported) evidence.activeGlbEntriesUnsupportedColor += 1;
      if (!supported) continue;
      evidence.activeGlbEntriesEligibleRedYellow += 1;
      evidence.eligibleInstances += 1;
      entry.glb?.traverse?.((object) => {
        if (!object.isMesh || !isObjectInThreeScene(object)) return;
        evidence.sceneMeshesVisited += 1;
        evidence.redYellowSceneMeshesVisited += 1;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          evidence.materialSlotsVisited += 1;
          if (material?.map) evidence.materialSlotsWithMap += 1;
          if (material?.emissiveMap) evidence.materialSlotsWithEmissiveMap += 1;
          if (textureHasLoadedImage(material?.map)) evidence.materialSlotsWithMapImage += 1;
          if (textureHasLoadedImage(material?.emissiveMap)) evidence.materialSlotsWithEmissiveImage += 1;
        });
      });
    }
    evidence.lastFallbackReason = diagnostics.lastFallbackReason || null;
    return evidence;
  }

  function rememberOriginalMeteorMaterialState(material) {
    if (!material) return;
    material.userData = material.userData || {};
    if (!Object.prototype.hasOwnProperty.call(material.userData, "hcMeteorOriginalMap")) material.userData.hcMeteorOriginalMap = material.map || null;
    if (!Object.prototype.hasOwnProperty.call(material.userData, "hcMeteorOriginalEmissiveMap")) material.userData.hcMeteorOriginalEmissiveMap = material.emissiveMap || null;
    if (!Object.prototype.hasOwnProperty.call(material.userData, "hcMeteorOriginalColor")) material.userData.hcMeteorOriginalColor = material.color?.clone ? material.color.clone() : null;
    if (!Object.prototype.hasOwnProperty.call(material.userData, "hcMeteorOriginalEmissive")) material.userData.hcMeteorOriginalEmissive = material.emissive?.clone ? material.emissive.clone() : null;
    if (!Object.prototype.hasOwnProperty.call(material.userData, "hcMeteorOriginalEmissiveIntensity")) material.userData.hcMeteorOriginalEmissiveIntensity = Number.isFinite(material.emissiveIntensity) ? material.emissiveIntensity : null;
    if (!Object.prototype.hasOwnProperty.call(material.userData, "hcMeteorOriginalRoughness")) material.userData.hcMeteorOriginalRoughness = Number.isFinite(material.roughness) ? material.roughness : null;
    if (!Object.prototype.hasOwnProperty.call(material.userData, "hcMeteorOriginalMetalness")) material.userData.hcMeteorOriginalMetalness = Number.isFinite(material.metalness) ? material.metalness : null;
  }

  function restoreMeteorMaterialTextures(material) {
    if (!material) return;
    rememberOriginalMeteorMaterialState(material);
    const data = material.userData || {};
    let changed = false;
    if (material.map !== (data.hcMeteorOriginalMap || null)) { material.map = data.hcMeteorOriginalMap || null; changed = true; }
    if (material.emissiveMap !== (data.hcMeteorOriginalEmissiveMap || null)) { material.emissiveMap = data.hcMeteorOriginalEmissiveMap || null; changed = true; }
    if (material.color && data.hcMeteorOriginalColor?.isColor && !material.color.equals(data.hcMeteorOriginalColor)) { material.color.copy(data.hcMeteorOriginalColor); changed = true; }
    if (material.emissive && data.hcMeteorOriginalEmissive?.isColor && !material.emissive.equals(data.hcMeteorOriginalEmissive)) { material.emissive.copy(data.hcMeteorOriginalEmissive); changed = true; }
    if (Number.isFinite(data.hcMeteorOriginalEmissiveIntensity) && material.emissiveIntensity !== data.hcMeteorOriginalEmissiveIntensity) { material.emissiveIntensity = data.hcMeteorOriginalEmissiveIntensity; changed = true; }
    if (Number.isFinite(data.hcMeteorOriginalRoughness) && "roughness" in material && material.roughness !== data.hcMeteorOriginalRoughness) { material.roughness = data.hcMeteorOriginalRoughness; changed = true; }
    if (Number.isFinite(data.hcMeteorOriginalMetalness) && "metalness" in material && material.metalness !== data.hcMeteorOriginalMetalness) { material.metalness = data.hcMeteorOriginalMetalness; changed = true; }
    if (data.hcMeteorTextureAppliedMapUrl || data.hcMeteorTextureAppliedEmissiveUrl || data.hcMeteorTextureBoostBaseColor != null) {
      data.hcMeteorTextureAppliedMapUrl = null;
      data.hcMeteorTextureAppliedEmissiveUrl = null;
      data.hcMeteorTextureBoostBaseColor = null;
      changed = true;
    }
    if (changed) material.needsUpdate = true;
  }

  function materialSupportsMeteorEmission(material) {
    return !!material && !!material.emissive && "emissiveIntensity" in material;
  }

  function copyMaterialValue(target, source, key) {
    if (!source || !(key in source) || source[key] == null) return;
    try {
      if (source[key]?.clone) target[key] = source[key].clone();
      else target[key] = source[key];
    } catch (_err) {
      target[key] = source[key];
    }
  }

  function createMeteorTextureCompatibleMaterial(THREE, sourceMaterial, colorKey) {
    if (!THREE?.MeshStandardMaterial) return sourceMaterial;
    const config = getMeteorTextureConfig(colorKey) || {};
    const material = new THREE.MeshStandardMaterial({
      name: sourceMaterial?.name || "hc_meteor_texture_material",
      color: sourceMaterial?.color?.clone ? sourceMaterial.color.clone() : 0xffffff,
      roughness: Number.isFinite(sourceMaterial?.roughness) ? sourceMaterial.roughness : (config.roughness ?? 0.82),
      metalness: Number.isFinite(sourceMaterial?.metalness) ? sourceMaterial.metalness : (config.metalness ?? 0.0),
      transparent: !!sourceMaterial?.transparent,
      opacity: Number.isFinite(sourceMaterial?.opacity) ? sourceMaterial.opacity : 1,
      alphaTest: Number.isFinite(sourceMaterial?.alphaTest) ? sourceMaterial.alphaTest : 0,
      side: sourceMaterial?.side ?? THREE.FrontSide,
      depthTest: sourceMaterial?.depthTest !== false,
      depthWrite: sourceMaterial?.depthWrite !== false,
      vertexColors: !!sourceMaterial?.vertexColors,
    });
    ["map", "normalMap", "aoMap", "metalnessMap", "roughnessMap", "bumpMap", "alphaMap"].forEach((key) => copyMaterialValue(material, sourceMaterial, key));
    if (sourceMaterial?.normalScale?.clone) material.normalScale = sourceMaterial.normalScale.clone();
    material.userData = Object.assign({}, sourceMaterial?.userData, {
      hcMaterialSource: "meteor_texture_compatible_standard",
      hcMeteorSourceMaterialType: sourceMaterial?.type || null,
    });
    rememberOriginalMeteorMaterialState(material);
    threeState.meteorTextureDiagnostics.materialConversions += 1;
    threeState.meteorTextureDiagnostics.materialsConvertedToStandard += 1;
    return material;
  }

  function ensureMeteorTextureCompatibleMaterial(THREE, material, colorKey) {
    if (!material) return material;
    if (materialSupportsMeteorEmission(material)) return material;
    return createMeteorTextureCompatibleMaterial(THREE, material, colorKey);
  }

  function registerMeteorTextureMaterial(textureEntry, material) {
    if (textureEntry?.materials && material) textureEntry.materials.add(material);
  }

  function applyMeteorTexturesToMaterial(THREE, material, colorKey, mapTextureEntry, emissiveTextureEntry) {
    if (!material) return { material, changed: false, hasMap: false, hasEmissiveMap: false };
    const config = getMeteorTextureConfig(colorKey);
    if (!config) return { material, changed: false, hasMap: false, hasEmissiveMap: false };
    const targetMaterial = ensureMeteorTextureCompatibleMaterial(THREE, material, colorKey) || material;
    rememberOriginalMeteorMaterialState(targetMaterial);
    let changed = targetMaterial !== material;
    const mapTexture = mapTextureEntry?.status !== "failed" ? mapTextureEntry?.texture : null;
    const emissiveTexture = emissiveTextureEntry?.status !== "failed" ? emissiveTextureEntry?.texture : null;
    if (mapTexture && targetMaterial.map !== mapTexture) {
      targetMaterial.map = mapTexture;
      targetMaterial.userData.hcMeteorTextureAppliedMapUrl = mapTextureEntry.url;
      registerMeteorTextureMaterial(mapTextureEntry, targetMaterial);
      changed = true;
    }
    if (emissiveTexture && targetMaterial.emissiveMap !== emissiveTexture) {
      targetMaterial.emissiveMap = emissiveTexture;
      targetMaterial.userData.hcMeteorTextureAppliedEmissiveUrl = emissiveTextureEntry.url;
      registerMeteorTextureMaterial(emissiveTextureEntry, targetMaterial);
      changed = true;
    }
    if (targetMaterial.color && config.baseColor != null && targetMaterial.color.getHex?.() !== config.baseColor) {
      targetMaterial.color.setHex(config.baseColor);
      targetMaterial.userData.hcMeteorTextureBoostBaseColor = `#${config.baseColor.toString(16).padStart(6, "0")}`;
      changed = true;
    }
    if (targetMaterial.emissive && config.emissiveColor != null && targetMaterial.emissive.getHex?.() !== config.emissiveColor) {
      targetMaterial.emissive.setHex(config.emissiveColor);
      changed = true;
    }
    if ("emissiveIntensity" in targetMaterial && targetMaterial.emissiveIntensity !== config.emissiveIntensity) {
      targetMaterial.emissiveIntensity = config.emissiveIntensity;
      changed = true;
    }
    if ("roughness" in targetMaterial && Number.isFinite(config.roughness) && targetMaterial.roughness !== config.roughness) { targetMaterial.roughness = config.roughness; changed = true; }
    if ("metalness" in targetMaterial && Number.isFinite(config.metalness) && targetMaterial.metalness !== config.metalness) { targetMaterial.metalness = config.metalness; changed = true; }
    if (changed) targetMaterial.needsUpdate = true;
    return { material: targetMaterial, changed, hasMap: !!targetMaterial.map, hasEmissiveMap: !!targetMaterial.emissiveMap };
  }

  function restoreMeteorTextureStateForEntry(entry) {
    if (!entry?.glb) return;
    entry.glb.traverse?.((object) => {
      if (!object.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const originalMaterials = Array.isArray(object.userData?.hcOriginalMaterial) ? object.userData.hcOriginalMaterial : [object.userData?.hcOriginalMaterial];
      Array.from(new Set(materials.concat(originalMaterials).filter(Boolean))).forEach(restoreMeteorMaterialTextures);
    });
    entry.meteorTextureAppliedUrls = { map: null, emissiveMap: null };
    entry.meteorTextureApplySignature = null;
    entry.meteorTextureRestorePending = false;
    entry.root.userData.meteorTextureMapUrl = null;
    entry.root.userData.meteorTextureMapName = null;
    entry.root.userData.meteorTextureEmissiveUrl = null;
    entry.root.userData.meteorTextureEmissiveName = null;
  }

  function getMeteorTexturePassEnabled(settings) {
    return settings.meteorPngTexturesEnabled !== false && settings.redMeteorTexturesEnabled !== false && (settings.materialMode || "imported") === "imported";
  }

  function isObjectInThreeScene(object) {
    let cursor = object || null;
    while (cursor) {
      if (cursor === threeState.scene) return true;
      cursor = cursor.parent || null;
    }
    return false;
  }

  function buildMeteorTextureApplySignature(entry, colorKey, settings) {
    return JSON.stringify({
      normalizedColor: normalizeMeteorColorKey(colorKey),
      selectedMapUrl: entry?.meteorTextureAssignments?.map?.url || null,
      selectedEmissiveMapUrl: entry?.meteorTextureAssignments?.emissiveMap?.url || null,
      materialMode: settings?.materialMode || "imported",
      meteorPngTexturesEnabled: getMeteorTexturePassEnabled(settings),
    });
  }

  function getMeteorTextureMaterialCoverage(entry, expectedMapUrl, expectedEmissiveUrl) {
    const coverage = {
      materialSlots: 0,
      materialSlotsWithMap: 0,
      materialSlotsWithEmissiveMap: 0,
      materialSlotsWithMapImage: 0,
      materialSlotsWithEmissiveImage: 0,
      missingExpectedMap: 0,
      missingExpectedEmissiveMap: 0,
    };
    entry?.glb?.traverse?.((object) => {
      if (!object.isMesh || !isObjectInThreeScene(object)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        coverage.materialSlots += 1;
        const appliedMapUrl = material?.userData?.hcMeteorTextureAppliedMapUrl || null;
        const appliedEmissiveUrl = material?.userData?.hcMeteorTextureAppliedEmissiveUrl || null;
        if (material?.map) coverage.materialSlotsWithMap += 1;
        if (material?.emissiveMap) coverage.materialSlotsWithEmissiveMap += 1;
        if (textureHasLoadedImage(material?.map)) coverage.materialSlotsWithMapImage += 1;
        if (textureHasLoadedImage(material?.emissiveMap)) coverage.materialSlotsWithEmissiveImage += 1;
        if (expectedMapUrl && (!material?.map || appliedMapUrl !== expectedMapUrl)) coverage.missingExpectedMap += 1;
        if (expectedEmissiveUrl && (!material?.emissiveMap || appliedEmissiveUrl !== expectedEmissiveUrl)) coverage.missingExpectedEmissiveMap += 1;
      });
    });
    return coverage;
  }

  function addMeteorTextureCoverageToDiagnostics(coverage) {
    const diagnostics = threeState.meteorTextureDiagnostics || createMeteorTextureDiagnostics();
    diagnostics.materialSlotsVisited += coverage.materialSlots;
    diagnostics.materialSlotsWithMap += coverage.materialSlotsWithMap;
    diagnostics.materialSlotsWithEmissiveMap += coverage.materialSlotsWithEmissiveMap;
    diagnostics.materialSlotsWithMapImage += coverage.materialSlotsWithMapImage;
    diagnostics.materialSlotsWithEmissiveImage += coverage.materialSlotsWithEmissiveImage;
    return diagnostics;
  }

  function meteorTextureEntryAlreadyCurrent(entry, signature) {
    if (!entry?.glb || entry.meteorTextureApplySignature !== signature) return false;
    const expectedMapUrl = entry?.meteorTextureAssignments?.map?.url || null;
    const expectedEmissiveUrl = entry?.meteorTextureAssignments?.emissiveMap?.url || null;
    if (!expectedMapUrl || !expectedEmissiveUrl) return false;
    const coverage = getMeteorTextureMaterialCoverage(entry, expectedMapUrl, expectedEmissiveUrl);
    addMeteorTextureCoverageToDiagnostics(coverage);
    if (coverage.materialSlots <= 0) return false;
    return coverage.missingExpectedMap <= 0 && coverage.missingExpectedEmissiveMap <= 0;
  }

  function countMeteorTextureReapplyReason(entry, signature, settings, enabled) {
    const diagnostics = threeState.meteorTextureDiagnostics || createMeteorTextureDiagnostics();
    const mode = settings?.materialMode || "imported";
    if (entry.meteorTextureLastMaterialMode != null && entry.meteorTextureLastMaterialMode !== mode) diagnostics.reapplyDueToMaterialModeChange += 1;
    else if (entry.meteorTextureLastToggleEnabled != null && entry.meteorTextureLastToggleEnabled !== enabled) diagnostics.reapplyDueToToggleChange += 1;
    else if (!entry.meteorTextureApplySignature) diagnostics.reapplyDueToNewEntry += 1;
    else if (entry.meteorTextureApplySignature === signature) diagnostics.reapplyDueToMissingMap += 1;
    entry.meteorTextureLastMaterialMode = mode;
    entry.meteorTextureLastToggleEnabled = enabled;
  }

  function auditMeteorTextureSceneMaterialsForEntry(entry) {
    const diagnostics = threeState.meteorTextureDiagnostics || createMeteorTextureDiagnostics();
    const expectedMapUrl = entry?.meteorTextureAppliedUrls?.map || null;
    const expectedEmissiveUrl = entry?.meteorTextureAppliedUrls?.emissiveMap || null;
    entry?.glb?.traverse?.((object) => {
      if (!object.isMesh || !isObjectInThreeScene(object)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (material?.map) diagnostics.materialSlotsWithMap += 1;
        if (material?.emissiveMap) diagnostics.materialSlotsWithEmissiveMap += 1;
        if (textureHasLoadedImage(material?.map)) diagnostics.materialSlotsWithMapImage += 1;
        if (textureHasLoadedImage(material?.emissiveMap)) diagnostics.materialSlotsWithEmissiveImage += 1;
        const appliedMapUrl = material?.userData?.hcMeteorTextureAppliedMapUrl || null;
        const appliedEmissiveUrl = material?.userData?.hcMeteorTextureAppliedEmissiveUrl || null;
        if (expectedMapUrl && appliedMapUrl === expectedMapUrl && !material?.map) diagnostics.mapLostAfterApply += 1;
        if (expectedEmissiveUrl && appliedEmissiveUrl === expectedEmissiveUrl && !material?.emissiveMap) diagnostics.emissiveMapLostAfterApply += 1;
        if ((expectedMapUrl && appliedMapUrl === expectedMapUrl && !material?.map) || (expectedEmissiveUrl && appliedEmissiveUrl === expectedEmissiveUrl && !material?.emissiveMap)) diagnostics.strippedAfterApply += 1;
      });
    });
  }


  function countGlbChildMeshes(entry) {
    let count = 0;
    entry?.glb?.traverse?.((object) => { if (object?.isMesh) count += 1; });
    return count;
  }

  function getEntryScenePresence(entry) {
    return !!entry?.glb && isObjectInThreeScene(entry.glb);
  }

  function getMeteorEntryColorKey(entry) {
    return getMeteorColorKey(entry, null) || getMeteorColorKey(entry?.sourceMeteor, null) || getMeteorColorKey(entry?.meteor, null) || "neutral";
  }

  function ensureMeteorEntryColorBinding(entry) {
    if (!entry) return "neutral";
    const colorKey = getMeteorEntryColorKey(entry);
    const normalized = normalizeMeteorColorKey(colorKey);
    if (normalized && normalized !== "neutral" && entry.colorKey !== normalized) {
      assignMeteorGlbAsset(entry, normalized, { countReassignment: true });
    }
    entry.meteorColorKey = normalized;
    if (entry.root?.userData) entry.root.userData.meteorColorKey = normalized;
    if (entry.glb?.userData) entry.glb.userData.meteorColorKey = normalized;
    return normalized;
  }

  function appendLimitedSample(target, sample, limit = 8) {
    if (!Array.isArray(target) || target.length >= limit) return;
    target.push(sample);
  }

  function updateMeteorTextureActiveEntryDiagnostics(entry, colorKey, skipReason = null) {
    const diagnostics = threeState.meteorTextureDiagnostics || createMeteorTextureDiagnostics();
    const hasGlb = !!entry?.glb;
    if (!hasGlb) return diagnostics;
    diagnostics.activeGlbEntries += 1;
    if (getEntryScenePresence(entry)) diagnostics.activeGlbEntriesWithSceneObject += 1;
    const normalizedColor = normalizeMeteorColorKey(colorKey || getMeteorEntryColorKey(entry));
    const hasColor = !!normalizedColor && normalizedColor !== "neutral";
    const supported = !!getMeteorTextureConfig(normalizedColor);
    if (hasColor) diagnostics.activeGlbEntriesWithColor += 1;
    else {
      diagnostics.activeGlbEntriesMissingColor += 1;
      diagnostics.skippedMissingColor += 1;
      diagnostics.lastFallbackReason = "missing_color_key";
    }
    if (hasColor && !supported) {
      diagnostics.activeGlbEntriesUnsupportedColor += 1;
      diagnostics.skippedUnsupportedColor += 1;
    }
    if (supported) diagnostics.activeGlbEntriesEligibleRedYellow += 1;
    appendLimitedSample(diagnostics.entryColorFieldSamples, {
      visualId: entry?.visualId ?? null,
      colorKey: entry?.colorKey ?? null,
      meteorColorKey: entry?.meteorColorKey ?? null,
      rootUserDataColorKey: entry?.root?.userData?.colorKey ?? null,
      rootUserDataMeteorColorKey: entry?.root?.userData?.meteorColorKey ?? null,
      assetUrl: entry?.assetUrl ?? null,
      normalizedColor,
      skipReason,
    });
    appendLimitedSample(diagnostics.sourceMeteorColorSamples, Object.assign({
      visualId: entry?.visualId ?? null,
      normalizedColor,
    }, getMeteorColorFields(entry?.sourceMeteor || entry?.meteor)));
    return diagnostics;
  }

  function buildActiveGlbEntryAuditRows(limit = 8) {
    const rows = [];
    for (const [entryKey, entry] of threeState.meteorMeshes.entries()) {
      if (rows.length >= limit) break;
      if (!entry?.glb) continue;
      const normalizedColor = getMeteorEntryColorKey(entry);
      const hasColor = !!normalizedColor && normalizedColor !== "neutral";
      const isEligibleRedYellow = !!getMeteorTextureConfig(normalizedColor);
      const skipReason = isEligibleRedYellow ? null : (hasColor ? "unsupported_color" : "missing_color_key");
      rows.push({
        entryKey,
        visualId: entry.visualId ?? null,
        hasGlb: !!entry.glb,
        inScene: getEntryScenePresence(entry),
        entryColorFields: JSON.stringify(getMeteorColorFields(entry)),
        sourceMeteorColorFields: JSON.stringify(getMeteorColorFields(entry.sourceMeteor || entry.meteor)),
        normalizedColor,
        isEligibleRedYellow,
        skipReason,
        glbChildMeshCount: countGlbChildMeshes(entry),
      });
    }
    return rows;
  }

  function syncMeteorTexturePaletteForEntry(THREE, entry) {
    if (!entry?.glb) return;
    const settings = threeState.materialSettings || getThreeMaterialSettings();
    const enabled = getMeteorTexturePassEnabled(settings);
    const diagnostics = threeState.meteorTextureDiagnostics || createMeteorTextureDiagnostics();
    diagnostics.enabled = enabled;
    diagnostics.materialMode = settings.materialMode || "imported";
    const colorKey = ensureMeteorEntryColorBinding(entry);
    const config = getMeteorTextureConfig(colorKey);
    const hasColor = !!colorKey && colorKey !== "neutral";
    const skipReason = config ? null : (hasColor ? "unsupported_color" : "missing_color_key");
    updateMeteorTextureActiveEntryDiagnostics(entry, colorKey, skipReason);
    if (config) diagnostics.eligibleInstances += 1;
    const signature = buildMeteorTextureApplySignature(entry, colorKey, settings);
    if (!config || !enabled || !entry.meteorTextureAssignments?.map || !entry.meteorTextureAssignments?.emissiveMap) {
      if (entry.meteorTextureRestorePending || entry.meteorTextureAppliedUrls?.map || entry.meteorTextureAppliedUrls?.emissiveMap) restoreMeteorTextureStateForEntry(entry);
      entry.meteorTextureLastMaterialMode = settings.materialMode || "imported";
      entry.meteorTextureLastToggleEnabled = enabled;
      entry.meteorTextureStatus = config ? "disabled" : skipReason;
      diagnostics.lastFallbackReason = !config ? skipReason : "disabled";
      return;
    }
    if (meteorTextureEntryAlreadyCurrent(entry, signature)) {
      diagnostics.applySkippedAlreadyCurrent += 1;
      entry.meteorTextureLastMaterialMode = settings.materialMode || "imported";
      entry.meteorTextureLastToggleEnabled = enabled;
      entry.meteorTextureStatus = { map: "current", emissiveMap: "current" };
      diagnostics.lastFallbackReason = null;
      return;
    }
    countMeteorTextureReapplyReason(entry, signature, settings, enabled);
    diagnostics.applyAttempts += 1;
    const mapEntry = loadMeteorTexture(THREE, entry.meteorTextureAssignments.map);
    const emissiveEntry = loadMeteorTexture(THREE, entry.meteorTextureAssignments.emissiveMap);
    entry.meteorTextureStatus = { map: mapEntry?.status || "unavailable", emissiveMap: emissiveEntry?.status || "unavailable" };
    if (!mapEntry?.texture && !emissiveEntry?.texture) {
      diagnostics.lastFallbackReason = "texture_unavailable";
      return;
    }
    const currentMapUrl = mapEntry?.texture && mapEntry.status !== "failed" ? mapEntry.url : null;
    const currentEmissiveUrl = emissiveEntry?.texture && emissiveEntry.status !== "failed" ? emissiveEntry.url : null;
    let materialsWithMap = 0;
    let materialsWithEmissiveMap = 0;
    entry.glb.traverse?.((object) => {
      if (!object.isMesh) return;
      const inScene = isObjectInThreeScene(object);
      if (inScene) diagnostics.sceneMeshesVisited += 1;
      if (inScene && config) diagnostics.redYellowSceneMeshesVisited += 1;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const nextMaterials = materials.map((material) => {
        diagnostics.materialSlotsVisited += 1;
        diagnostics.materialsVisited += 1;
        if (entry.meteorTextureRestorePending && entry.meteorTextureAppliedUrls?.map && !material?.map) {
          diagnostics.mapLostAfterApply += 1;
          diagnostics.strippedAfterApply += 1;
        }
        if (entry.meteorTextureRestorePending && entry.meteorTextureAppliedUrls?.emissiveMap && !material?.emissiveMap) {
          diagnostics.emissiveMapLostAfterApply += 1;
          diagnostics.strippedAfterApply += 1;
        }
        const result = applyMeteorTexturesToMaterial(THREE, material, colorKey, mapEntry, emissiveEntry);
        if (result.hasMap) materialsWithMap += 1;
        if (result.hasEmissiveMap) materialsWithEmissiveMap += 1;
        return result.material || material;
      });
      object.material = Array.isArray(object.material) ? nextMaterials : nextMaterials[0];
    });
    entry.meteorTextureAppliedUrls = { map: currentMapUrl, emissiveMap: currentEmissiveUrl };
    entry.meteorTextureApplySignature = currentMapUrl && currentEmissiveUrl ? signature : null;
    entry.meteorTextureLastMaterialMode = settings.materialMode || "imported";
    entry.meteorTextureLastToggleEnabled = enabled;
    entry.meteorTextureRestorePending = true;
    entry.root.userData.meteorTextureMapUrl = currentMapUrl;
    entry.root.userData.meteorTextureMapName = currentMapUrl ? mapEntry?.name || null : null;
    entry.root.userData.meteorTextureEmissiveUrl = currentEmissiveUrl;
    entry.root.userData.meteorTextureEmissiveName = currentEmissiveUrl ? emissiveEntry?.name || null : null;
    if (currentMapUrl) diagnostics.mapApplied += 1;
    if (currentEmissiveUrl) diagnostics.emissiveMapApplied += 1;
    if (materialsWithMap > 0 || materialsWithEmissiveMap > 0) diagnostics.appliedThisFrame += 1;
    diagnostics.lastAppliedColor = colorKey || null;
    diagnostics.lastAppliedMapUrl = currentMapUrl;
    diagnostics.lastAppliedEmissiveMapUrl = currentEmissiveUrl;
    auditMeteorTextureSceneMaterialsForEntry(entry);
    if (!currentMapUrl || !currentEmissiveUrl) {
      diagnostics.lastFallbackReason = !currentMapUrl ? "map_texture_missing" : "emissive_texture_missing";
    } else if (materialsWithMap <= 0 || materialsWithEmissiveMap <= 0) {
      diagnostics.lastFallbackReason = "material_application_empty";
    } else {
      diagnostics.lastFallbackReason = null;
    }
  }

  function chooseMeteorGlbAsset(colorKey, visualId) {
    colorKey = normalizeMeteorColorKey(colorKey);
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
    colorKey = normalizeMeteorColorKey(colorKey);
    const assignment = chooseMeteorGlbAsset(colorKey, entry.visualId);
    const previousUrl = entry.assetUrl || null;
    entry.colorKey = colorKey;
    entry.meteorColorKey = colorKey;
    entry.root.userData.colorKey = colorKey;
    entry.root.userData.meteorColorKey = colorKey;
    if (entry.glb?.userData) entry.glb.userData.meteorColorKey = colorKey;
    if (getMeteorTextureConfig(colorKey)) {
      const assignmentColorKey = entry.meteorTextureAssignments?.map?.colorKey || entry.meteorTextureAssignments?.emissiveMap?.colorKey || null;
      if (assignmentColorKey && assignmentColorKey !== colorKey && entry.meteorTextureRestorePending) restoreMeteorTextureStateForEntry(entry);
      if (assignmentColorKey !== colorKey) entry.meteorTextureAssignments = null;
      entry.meteorTextureAssignments = entry.meteorTextureAssignments || {};
      if (!entry.meteorTextureAssignments.map) entry.meteorTextureAssignments.map = chooseMeteorTexture(colorKey, "map");
      if (!entry.meteorTextureAssignments.emissiveMap) entry.meteorTextureAssignments.emissiveMap = chooseMeteorTexture(colorKey, "emissiveMap");
    } else {
      if (entry.meteorTextureRestorePending) restoreMeteorTextureStateForEntry(entry);
      entry.meteorTextureAssignments = null;
      entry.meteorTextureAppliedUrls = { map: null, emissiveMap: null };
      entry.meteorTextureApplySignature = null;
      entry.meteorTextureLastMaterialMode = null;
      entry.meteorTextureLastToggleEnabled = null;
      entry.meteorTextureStatus = "unsupported_color";
      entry.root.userData.meteorTextureMapUrl = null;
      entry.root.userData.meteorTextureMapName = null;
      entry.root.userData.meteorTextureEmissiveUrl = null;
      entry.root.userData.meteorTextureEmissiveName = null;
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


  function warnAsteroidGlbOnce(url, message) {
    if (threeState.asteroidGlbWarnings.has(url)) return;
    threeState.asteroidGlbWarnings.add(url);
    if (window.console?.warn) window.console.warn(`[HC.WorldRenderer] Asteroid GLB fallback for ${url}: ${message}`);
  }


  function summarizeGlbCacheEntries(cache, limit = 12) {
    const rows = [];
    for (const [key, entry] of cache.entries()) {
      if (rows.length >= limit) break;
      rows.push({
        key,
        status: entry?.status || "unknown",
        url: entry?.url || key,
        assetKind: entry?.assetKind || null,
        loaderMode: entry?.loaderMode || null,
        startedAt: entry?.startedAt || null,
        durationMs: entry?.durationMs || null,
        progressLoaded: entry?.progressLoaded ?? null,
        progressTotal: entry?.progressTotal ?? null,
        errorMessage: entry?.errorMessage || entry?.error || null,
        hasTemplate: !!entry?.template,
      });
    }
    return rows;
  }

  function getAsteroidGlbAssetUrl() {
    return resolvePublicAssetPath(ASTEROID_GLB_ASSET);
  }

  function getAsteroidGlbCacheStats() {
    const stats = { loading: 0, ready: 0, failed: 0, total: threeState.asteroidGlbCache.size };
    for (const entry of threeState.asteroidGlbCache.values()) {
      if (entry?.status === "ready") stats.ready += 1;
      else if (entry?.status === "failed") stats.failed += 1;
      else stats.loading += 1;
    }
    return stats;
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

  function imageHasUsableSourceData(image) {
    if (!image) return false;
    if ((Number(image.width) > 0 && Number(image.height) > 0) || (Number(image.naturalWidth) > 0 && Number(image.naturalHeight) > 0)) return true;
    if (Number(image.videoWidth) > 0 && Number(image.videoHeight) > 0) return true;
    if (image.data || image.buffer || image.src || image.currentSrc) return true;
    return false;
  }

  function glbTextureHasImageData(texture) {
    return imageHasUsableSourceData(texture?.image) || imageHasUsableSourceData(texture?.source?.data);
  }

  function getGlbTextureLoadPromises(root) {
    const promises = [];
    root?.traverse?.((object) => {
      if (!object?.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        for (const slot of ["map", "metalnessMap", "roughnessMap", "normalMap", "aoMap", "emissiveMap"]) {
          const texture = material?.[slot];
          const promise = texture?.userData?.hcGlbTextureReadyPromise;
          if (promise && !promises.includes(promise)) promises.push(promise);
        }
      }
    });
    return promises;
  }

  function classifyGlbImages(gltf) {
    const counts = { embedded: 0, bufferView: 0, uri: 0, dataUri: 0, png: 0, jpeg: 0, unsupportedMime: 0 };
    for (const imageDef of gltf.images || []) {
      const mimeType = String(imageDef?.mimeType || "").toLowerCase();
      const hasBufferView = imageDef?.bufferView != null;
      const hasUri = typeof imageDef?.uri === "string" && imageDef.uri.length > 0;
      if (hasBufferView || (hasUri && /^data:/i.test(imageDef.uri))) counts.embedded += 1;
      if (hasBufferView) counts.bufferView += 1;
      if (hasUri) counts.uri += 1;
      if (hasUri && /^data:/i.test(imageDef.uri)) counts.dataUri += 1;
      if (mimeType === "image/png" || (!mimeType && hasUri && /\.png(?:$|[?#])/i.test(imageDef.uri))) counts.png += 1;
      else if (mimeType === "image/jpeg" || mimeType === "image/jpg" || (!mimeType && hasUri && /\.jpe?g(?:$|[?#])/i.test(imageDef.uri))) counts.jpeg += 1;
      else if (mimeType) counts.unsupportedMime += 1;
    }
    return counts;
  }

  function collectGlbTextureReadiness(root) {
    const textures = new Set();
    root?.traverse?.((object) => {
      if (!object?.isMesh) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        for (const slot of ["map", "metalnessMap", "roughnessMap", "normalMap", "aoMap", "emissiveMap"]) {
          if (material?.[slot]) textures.add(material[slot]);
        }
      }
    });
    let ready = 0;
    let missing = 0;
    for (const texture of textures) {
      if (glbTextureHasImageData(texture)) ready += 1;
      else missing += 1;
    }
    return { total: textures.size, ready, missing };
  }

  function applyAsteroidFallbackMaterialsForMissingTextures(THREE, root) {
    let fallbackCount = 0;
    root?.traverse?.((object) => {
      if (!object?.isMesh) return;
      const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
      let changed = false;
      const nextMaterials = sourceMaterials.map((material, slotIndex) => {
        if (!material) return material;
        const textureSlots = ["map", "metalnessMap", "roughnessMap", "normalMap", "aoMap", "emissiveMap"];
        const expectedTexture = textureSlots.some((slot) => !!material[slot]);
        const missingTexture = textureSlots.some((slot) => material[slot] && !glbTextureHasImageData(material[slot]));
        if (!expectedTexture || !missingTexture) return material;
        const fallback = createFallbackPbrMaterial(THREE, material.userData?.hcGlbMaterialIndex ?? slotIndex, "asteroid_embedded_texture_missing_image");
        fallback.name = `hc_asteroid_fallback_material_${slotIndex}`;
        fallback.userData = Object.assign({}, fallback.userData, {
          hcMaterialSource: "fallback",
          hcFallbackReason: "asteroid_embedded_texture_missing_image",
          hcOriginalMaterialName: material.name || null,
        });
        changed = true;
        fallbackCount += 1;
        return fallback;
      });
      if (changed) object.material = Array.isArray(object.material) ? nextMaterials : nextMaterials[0];
    });
    return fallbackCount;
  }

  function finalizeGlbTextureDiagnostics(THREE, root, gltf, { assetKind = "generic", assetUrl = null } = {}) {
    const imageCounts = classifyGlbImages(gltf);
    const readinessBeforeFallback = collectGlbTextureReadiness(root);
    let fallbackMaterialCount = 0;
    if (assetKind === "asteroid" && readinessBeforeFallback.missing > 0) {
      fallbackMaterialCount = applyAsteroidFallbackMaterialsForMissingTextures(THREE, root);
    }
    const readiness = collectGlbTextureReadiness(root);
    root.userData.hcGlbEmbeddedTextureCount = imageCounts.embedded;
    root.userData.hcGlbTextureReadyCount = readiness.ready;
    root.userData.hcGlbTextureMissingImageCount = readinessBeforeFallback.missing;
    root.userData.hcGlbTextureFallbackMaterialCount = fallbackMaterialCount;
    root.userData.hcGlbLoaderMode = "gltf_loader";
    if (assetKind === "asteroid") {
      threeState.asteroidGlbTextureDiagnostics = {
        asteroidGlbEmbeddedTextureCount: imageCounts.embedded,
        asteroidGlbTextureReadyCount: readiness.ready,
        asteroidGlbTextureMissingImageCount: readinessBeforeFallback.missing,
        asteroidGlbTextureFallbackMaterialCount: fallbackMaterialCount,
        asteroidGlbLoaderMode: "gltf_loader",
        imageBufferViewCount: imageCounts.bufferView,
        imageUriCount: imageCounts.uri,
        imageDataUriCount: imageCounts.dataUri,
        imagePngCount: imageCounts.png,
        imageJpegCount: imageCounts.jpeg,
        imageUnsupportedMimeCount: imageCounts.unsupportedMime,
        lastAssetUrl: assetUrl,
        lastError: null,
      };
    }
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
    const sampler = gltf.samplers?.[textureDef.sampler] || {};
    const texture = new THREE.Texture();
    texture.flipY = false;
    if (colorSpace && "colorSpace" in texture) texture.colorSpace = colorSpace;
    else if (colorSpace && "encoding" in texture && THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = getThreeWrapping(THREE, sampler.wrapS);
    texture.wrapT = getThreeWrapping(THREE, sampler.wrapT);
    texture.magFilter = getThreeFilter(THREE, sampler.magFilter, THREE.LinearFilter);
    texture.minFilter = getThreeFilter(THREE, sampler.minFilter, THREE.LinearMipmapLinearFilter);
    texture.userData = Object.assign({}, texture.userData, {
      hcGlbTextureIndex: textureIndex,
      hcGlbImageSource: textureDef.source,
      hcGlbImageName: imageDef.name || null,
      hcGlbImageMimeType: imageDef.mimeType || null,
      hcGlbImageEmbedded: imageDef.bufferView != null || /^data:/i.test(imageDef.uri || ""),
      hcGlbTextureUrl: url,
      hcTexCoord: textureInfo.texCoord || 0,
      hcGlbTextureStatus: "loading",
    });
    texture.userData.hcGlbTextureReadyPromise = new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        url,
        (loadedTexture) => {
          const image = loadedTexture?.image || loadedTexture?.source?.data || null;
          if (imageHasUsableSourceData(image)) {
            texture.image = image;
            texture.source = loadedTexture.source || texture.source;
            texture.userData.hcGlbTextureStatus = "ready";
            texture.needsUpdate = true;
          } else {
            texture.userData.hcGlbTextureStatus = "missing_image";
          }
          resolve(texture);
        },
        undefined,
        (error) => {
          texture.userData.hcGlbTextureStatus = "failed";
          texture.userData.hcGlbTextureError = error?.message || String(error || "texture_load_failed");
          resolve(texture);
        }
      );
    });
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

  /* Deprecated legacy GLB parser. Kept only for forensic comparison; runtime GLB loading uses vendor/loaders/GLTFLoader.js exclusively. */
  function parseGlbToObject3D(THREE, arrayBuffer, options = {}) {
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
    root.userData.hcGlbTextureReadyPromises = getGlbTextureLoadPromises(root);
    root.userData.hcGlbTextureFinalize = () => finalizeGlbTextureDiagnostics(THREE, root, json, options);
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
      importedPbrCount: materials.filter((m) => m.source === "glb_imported_pbr" || m.source === "gltf_loader_imported_pbr").length,
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
    logMeteorTextureEvidenceAudit({ force });
  }

  function getTextureDebugUrl(texture) {
    return texture?.userData?.hcMeteorTextureKind ? (texture.source?.data?.src || texture.image?.src || null) : (texture?.image?.src || null);
  }

  function collectMeteorTextureAuditRows(limit = 8) {
    const rows = [];
    for (const entry of threeState.meteorMeshes.values()) {
      const colorKey = getMeteorEntryColorKey(entry);
      if (!entry || !getMeteorTextureConfig(colorKey) || !entry.glb) continue;
      entry.glb.traverse?.((object) => {
        if (!object.isMesh || rows.length >= limit) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          if (rows.length >= limit) return;
          rows.push({
            colorKey: normalizeMeteorColorKey(colorKey),
            meshName: object.name || object.parent?.name || "mesh",
            materialType: material?.type || "missing",
            color: material?.color?.getHexString ? `#${material.color.getHexString()}` : null,
            emissive: material?.emissive?.getHexString ? `#${material.emissive.getHexString()}` : null,
            emissiveIntensity: Number.isFinite(material?.emissiveIntensity) ? material.emissiveIntensity : null,
            hasMap: !!material?.map,
            mapUrl: material?.userData?.hcMeteorTextureAppliedMapUrl || getTextureDebugUrl(material?.map) || null,
            hasEmissiveMap: !!material?.emissiveMap,
            emissiveMapUrl: material?.userData?.hcMeteorTextureAppliedEmissiveUrl || getTextureDebugUrl(material?.emissiveMap) || null,
            needsUpdate: !!material?.needsUpdate,
            inScene: isObjectInThreeScene(object),
            cloneInRendererEntry: object.parent != null && entry.glb.parent === entry.root && entry.root.parent === threeState.meteorGroup,
          });
        });
      });
    }
    return rows;
  }

  function logMeteorTextureEvidenceAudit({ force = false } = {}) {
    const settings = threeState.materialSettings || getThreeMaterialSettings();
    if (!force && !settings.forceAuditLog) return;
    const entryRows = buildActiveGlbEntryAuditRows(8);
    const materialRows = collectMeteorTextureAuditRows(8);
    const evidence = getMeteorTextureEvidence();
    if (window.console?.debug) window.console.debug("[HC.WorldRenderer] Meteor texture evidence", evidence);
    else if (window.console?.log) window.console.log("[HC.WorldRenderer] Meteor texture evidence", evidence);
    if (entryRows.length && window.console?.table) window.console.table(entryRows);
    else if (entryRows.length && window.console?.log) window.console.log("[HC.WorldRenderer] Active GLB meteor entries", entryRows);
    if (materialRows.length && window.console?.table) window.console.table(materialRows);
    else if (materialRows.length && window.console?.log) window.console.log("[HC.WorldRenderer] Meteor texture material rows", materialRows);
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

  function syncMeteorTexturePalettesForActiveEntries(THREE) {
    if (!THREE) return;
    const diagnostics = threeState.meteorTextureDiagnostics || createMeteorTextureDiagnostics();
    diagnostics.syncActiveEntriesCalls += 1;
    threeState.meteorTextureDiagnostics = diagnostics;
    for (const entry of threeState.meteorMeshes.values()) {
      if (entry?.glb) syncMeteorTexturePaletteForEntry(THREE, entry);
    }
  }

  function collectActiveGlbRoots() {
    const roots = [];
    for (const entry of threeState.meteorMeshes.values()) {
      if (entry?.glb) roots.push(entry.glb);
    }
    for (const entry of threeState.asteroidMeshes.values()) {
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
    for (const cacheEntry of threeState.asteroidGlbCache.values()) {
      cacheEntry?.template?.traverse?.((object) => {
        if (!object.isMesh) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(applyImportedMaterialRuntimeSettings);
      });
    }
    refreshMaterialOverrideStatus(THREE);
    syncMeteorTexturePalettesForActiveEntries(THREE);
  }


  function getGltfLoaderClass() {
    return window.HC_GLTFLoader || window.GLTFLoader || null;
  }

  function collectGltfSceneStats(root) {
    const materials = new Set();
    const textures = new Set();
    let meshCount = 0;
    root?.traverse?.((object) => {
      if (!object?.isMesh) return;
      meshCount += 1;
      const materialList = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materialList) {
        if (!material) continue;
        materials.add(material);
        for (const slot of ["map", "metalnessMap", "roughnessMap", "normalMap", "aoMap", "emissiveMap", "roughnessMap", "alphaMap", "bumpMap"]) {
          if (material[slot]) textures.add(material[slot]);
        }
      }
    });
    return { meshCount, materialCount: materials.size, textureCount: textures.size };
  }

  function normalizeGltfTemplate(THREE, root) {
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
      root.userData.hcLocalBoundingBox = null;
      root.userData.hcLocalSize = null;
    }
    root.traverse?.((object) => {
      if (!object.isMesh) return;
      object.frustumCulled = false;
      object.renderOrder = 1000;
      const materialList = Array.isArray(object.material) ? object.material : [object.material];
      materialList.forEach((material, index) => {
        if (material) material.userData = Object.assign({}, material.userData, { hcMaterialSource: material.userData?.hcMaterialSource || "gltf_loader_imported_pbr", hcGlbMaterialIndex: material.userData?.hcGlbMaterialIndex ?? index });
        applyImportedMaterialRuntimeSettings(material);
      });
    });
    return root;
  }

  function finalizeGltfLoaderDiagnostics(THREE, root, gltf, { assetKind = "generic", assetUrl = null } = {}) {
    const stats = collectGltfSceneStats(root);
    const imageCounts = classifyGlbImages(gltf?.parser?.json || {});
    const readiness = collectGlbTextureReadiness(root);
    root.userData.hcGlbLoaderMode = "gltf_loader";
    root.userData.hcGlbLoaderPrimary = "GLTFLoader";
    root.userData.hcGlbEmbeddedTextureCount = imageCounts.embedded;
    root.userData.hcGlbTextureReadyCount = readiness.ready;
    root.userData.hcGlbTextureMissingImageCount = readiness.missing;
    root.userData.hcGlbTextureFallbackMaterialCount = 0;
    root.userData.hcGltfSceneMeshCount = stats.meshCount;
    root.userData.hcGltfSceneMaterialCount = stats.materialCount;
    root.userData.hcGltfSceneTextureCount = stats.textureCount;
    if (assetKind === "meteor") {
      threeState.meteorGlbLoaderMode = "gltf_loader";
      threeState.meteorGlbLoaderPrimary = "GLTFLoader";
      threeState.meteorGlbGltfSceneMeshCount = stats.meshCount;
      threeState.meteorGlbGltfSceneMaterialCount = stats.materialCount;
      threeState.meteorGlbGltfSceneTextureCount = stats.textureCount;
    } else if (assetKind === "asteroid") {
      threeState.asteroidGlbLoaderMode = "gltf_loader";
      threeState.asteroidGlbLoaderPrimary = "GLTFLoader";
      threeState.asteroidGlbGltfSceneMeshCount = stats.meshCount;
      threeState.asteroidGlbGltfSceneMaterialCount = stats.materialCount;
      threeState.asteroidGlbGltfSceneTextureCount = stats.textureCount;
      threeState.asteroidGlbTextureDiagnostics = Object.assign(createAsteroidGlbTextureDiagnostics(), {
        asteroidGlbEmbeddedTextureCount: imageCounts.embedded,
        asteroidGlbTextureReadyCount: readiness.ready,
        asteroidGlbTextureMissingImageCount: readiness.missing,
        asteroidGlbTextureFallbackMaterialCount: 0,
        asteroidGlbLoaderMode: "gltf_loader",
        imageBufferViewCount: imageCounts.bufferView,
        imageUriCount: imageCounts.uri,
        imageDataUriCount: imageCounts.dataUri,
        imagePngCount: imageCounts.png,
        imageJpegCount: imageCounts.jpeg,
        imageUnsupportedMimeCount: imageCounts.unsupportedMime,
        lastAssetUrl: assetUrl,
        lastError: null,
      });
    }
    return stats;
  }

  function loadGltfSceneWithDiagnostics(THREE, GLTFLoader, url, assetKind, cacheEntry = null) {
    const startedAt = performance.now();
    const rawUrl = String(url || "");
    const baseUrl = getBrowserAssetBaseUrl();
    let resolvedUrl = rawUrl;
    const timeoutMs = getGlbLoadTimeoutMs(assetKind);
    const diagnostics = refreshGltfLoaderAvailabilityDiagnostics();
    diagnostics.gltfLoaderRequestCount += 1;
    diagnostics.gltfLoaderLastRequestedUrlRaw = rawUrl;
    diagnostics.gltfLoaderLastRequestedBaseUrl = baseUrl;
    diagnostics.gltfLoaderUrlNormalizeError = null;
    try {
      resolvedUrl = normalizeBrowserAssetUrl(rawUrl);
    } catch (error) {
      diagnostics.gltfLoaderUrlNormalizeError = formatGlbError(error);
      resolvedUrl = rawUrl;
    }
    const cacheKey = cacheEntry?.cacheKey || resolvedUrl || rawUrl;
    diagnostics.gltfLoaderLastRequestedUrl = resolvedUrl;
    diagnostics.gltfLoaderLastRequestedUrlResolved = resolvedUrl;
    diagnostics.gltfLoaderLastProgressLoaded = null;
    diagnostics.gltfLoaderLastProgressTotal = null;
    diagnostics.gltfLoaderLastErrorName = null;
    diagnostics.gltfLoaderLastErrorMessage = null;
    diagnostics.gltfLoaderLastErrorStack = null;
    pushUniqueLimited(diagnostics.gltfLoaderPendingUrls, resolvedUrl);
    removeFromList(diagnostics.gltfLoaderFailedUrls, resolvedUrl);
    emitGlbDebugEvent("world.glb_load_started", makeGlbEventPayload("started", { assetKind, url: resolvedUrl, cacheKey, startedAt, status: "loading" }));
    if (cacheEntry) {
      cacheEntry.status = "loading";
      cacheEntry.url = resolvedUrl;
      cacheEntry.rawUrl = rawUrl;
      cacheEntry.resolvedUrl = resolvedUrl;
      cacheEntry.baseUrl = baseUrl;
      cacheEntry.cacheKey = cacheKey;
      cacheEntry.assetKind = assetKind;
      cacheEntry.startedAt = startedAt;
      cacheEntry.durationMs = null;
      cacheEntry.progressLoaded = null;
      cacheEntry.progressTotal = null;
      cacheEntry.progressEventEmitted = false;
      cacheEntry.error = null;
      cacheEntry.errorMessage = null;
      cacheEntry.errorStack = null;
      cacheEntry.loaderMode = "gltf_loader";
      cacheEntry.timeoutMs = timeoutMs;
    }
    syncGltfLoaderUrlDiagnostics();

    return new Promise((resolve, reject) => {
      let settled = false;
      let timeoutId = null;
      const markFailure = (error, durationMs, timedOut = false) => {
        const message = formatGlbError(error);
        diagnostics.gltfLoaderLastFailedUrl = resolvedUrl;
        diagnostics.gltfLoaderLastDurationMs = durationMs;
        diagnostics.gltfLoaderLastErrorName = safeGlbErrorName(error);
        diagnostics.gltfLoaderLastErrorMessage = message;
        diagnostics.gltfLoaderLastErrorStack = safeGlbErrorStack(error);
        removeFromList(diagnostics.gltfLoaderPendingUrls, resolvedUrl);
        pushUniqueLimited(diagnostics.gltfLoaderFailedUrls, resolvedUrl);
        if (timedOut) {
          diagnostics.gltfLoaderLastTimedOutUrl = resolvedUrl;
          pushUniqueLimited(diagnostics.gltfLoaderTimedOutUrls, resolvedUrl);
        }
        if (cacheEntry) {
          cacheEntry.status = "failed";
          cacheEntry.durationMs = durationMs;
          cacheEntry.error = message;
          cacheEntry.errorMessage = message;
          cacheEntry.errorStack = safeGlbErrorStack(error);
        }
        syncGltfLoaderUrlDiagnostics();
      };
      const settle = (kind, value) => {
        if (settled) return;
        settled = true;
        if (timeoutId != null) window.clearTimeout(timeoutId);
        if (kind === "resolve") resolve(value);
        else reject(value);
      };

      try {
        if (typeof GLTFLoader !== "function") throw new Error(`GLTFLoader is not a constructor/function (type: ${typeof GLTFLoader})`);
        const loader = new GLTFLoader();
        const resourcePath = new URL("./", resolvedUrl).href;
        if (typeof loader.setResourcePath === "function") loader.setResourcePath(resourcePath);
        if (typeof loader.setPath === "function") loader.setPath("");
        timeoutId = window.setTimeout(() => {
          const durationMs = performance.now() - startedAt;
          const error = new Error(`GLTFLoader timeout after ${timeoutMs} ms`);
          error.name = "GLTFLoaderTimeoutError";
          error.hcGlbTimeout = true;
          error.hcDurationMs = durationMs;
          diagnostics.gltfLoaderTimeoutCount += 1;
          diagnostics.gltfLoaderErrorCount += 1;
          markFailure(error, durationMs, true);
          emitGlbDebugEvent("world.glb_load_timeout", makeGlbEventPayload("timeout", {
            assetKind,
            url: resolvedUrl,
            cacheKey,
            startedAt,
            durationMs,
            loaded: cacheEntry?.progressLoaded ?? null,
            total: cacheEntry?.progressTotal ?? null,
            error,
            status: "failed",
          }));
          settle("reject", error);
        }, timeoutMs);

        loader.load(
          resolvedUrl,
          (gltf) => {
            if (settled) return;
            try {
              const durationMs = performance.now() - startedAt;
              const root = gltf?.scene || gltf?.scenes?.[0] || new THREE.Group();
              const template = normalizeGltfTemplate(THREE, root);
              const stats = finalizeGltfLoaderDiagnostics(THREE, template, gltf, { assetKind, assetUrl: resolvedUrl });
              diagnostics.gltfLoaderSuccessCount += 1;
              diagnostics.gltfLoaderLastCompletedUrl = resolvedUrl;
              diagnostics.gltfLoaderLastDurationMs = durationMs;
              diagnostics.gltfLoaderLastErrorName = null;
              diagnostics.gltfLoaderLastErrorMessage = null;
              diagnostics.gltfLoaderLastErrorStack = null;
              removeFromList(diagnostics.gltfLoaderPendingUrls, resolvedUrl);
              if (cacheEntry) {
                cacheEntry.status = "ready";
                cacheEntry.template = template;
                cacheEntry.durationMs = durationMs;
                cacheEntry.error = null;
                cacheEntry.errorMessage = null;
                cacheEntry.errorStack = null;
              }
              syncGltfLoaderUrlDiagnostics();
              emitGlbDebugEvent("world.glb_load_ready", makeGlbEventPayload("ready", {
                assetKind,
                url: resolvedUrl,
                cacheKey,
                startedAt,
                durationMs,
                loaded: cacheEntry?.progressLoaded ?? null,
                total: cacheEntry?.progressTotal ?? null,
                status: "ready",
                meshCount: stats.meshCount,
                materialCount: stats.materialCount,
                textureCount: stats.textureCount,
              }));
              settle("resolve", { gltf, template, durationMs, stats });
            } catch (error) {
              const durationMs = performance.now() - startedAt;
              diagnostics.gltfLoaderErrorCount += 1;
              markFailure(error, durationMs, false);
              error.hcGlbEventEmitted = true;
              emitGlbDebugEvent("world.glb_load_failed", makeGlbEventPayload("failed", {
                assetKind,
                url: resolvedUrl,
                cacheKey,
                startedAt,
                durationMs,
                loaded: cacheEntry?.progressLoaded ?? null,
                total: cacheEntry?.progressTotal ?? null,
                error,
                status: "failed",
              }));
              settle("reject", error);
            }
          },
          (event) => {
            if (settled) return;
            const loaded = Number.isFinite(event?.loaded) ? event.loaded : null;
            const total = Number.isFinite(event?.total) ? event.total : null;
            diagnostics.gltfLoaderProgressCount += 1;
            diagnostics.gltfLoaderLastProgressUrl = resolvedUrl;
            diagnostics.gltfLoaderLastProgressLoaded = loaded;
            diagnostics.gltfLoaderLastProgressTotal = total;
            if (cacheEntry) {
              cacheEntry.progressLoaded = loaded;
              cacheEntry.progressTotal = total;
            }
            const shouldEmitProgress = !cacheEntry || !cacheEntry.progressEventEmitted || (total != null && loaded === total);
            if (cacheEntry) cacheEntry.progressEventEmitted = true;
            if (shouldEmitProgress) {
              emitGlbDebugEvent("world.glb_load_progress", makeGlbEventPayload("progress", {
                assetKind,
                url: resolvedUrl,
                cacheKey,
                startedAt,
                loaded,
                total,
                readyState: event?.target?.readyState ?? event?.currentTarget?.readyState ?? null,
                status: event?.target?.status ?? event?.currentTarget?.status ?? null,
              }));
            }
          },
          (error) => {
            if (settled) return;
            const normalizedError = error || new Error(`GLTFLoader onError for ${resolvedUrl}`);
            const durationMs = performance.now() - startedAt;
            diagnostics.gltfLoaderErrorCount += 1;
            markFailure(normalizedError, durationMs, false);
            normalizedError.hcGlbEventEmitted = true;
            emitGlbDebugEvent("world.glb_load_failed", makeGlbEventPayload("failed", {
              assetKind,
              url: resolvedUrl,
              cacheKey,
              startedAt,
              durationMs,
              loaded: cacheEntry?.progressLoaded ?? null,
              total: cacheEntry?.progressTotal ?? null,
              error: normalizedError,
              readyState: error?.target?.readyState ?? error?.currentTarget?.readyState ?? null,
              status: error?.target?.status ?? error?.currentTarget?.status ?? null,
            }));
            settle("reject", normalizedError);
          }
        );
      } catch (error) {
        const durationMs = performance.now() - startedAt;
        diagnostics.gltfLoaderErrorCount += 1;
        markFailure(error, durationMs, false);
        error.hcGlbEventEmitted = true;
        emitGlbDebugEvent("world.glb_load_failed", makeGlbEventPayload("failed", {
          assetKind,
          url: resolvedUrl,
          cacheKey,
          startedAt,
          durationMs,
          loaded: cacheEntry?.progressLoaded ?? null,
          total: cacheEntry?.progressTotal ?? null,
          error,
          status: "failed",
        }));
        settle("reject", error);
      }
    }).catch((error) => {
      const durationMs = Number.isFinite(error?.hcDurationMs) ? error.hcDurationMs : performance.now() - startedAt;
      const message = formatGlbError(error);
      if (cacheEntry && cacheEntry.status !== "failed") {
        cacheEntry.status = "failed";
        cacheEntry.durationMs = durationMs;
        cacheEntry.error = message;
        cacheEntry.errorMessage = message;
        cacheEntry.errorStack = safeGlbErrorStack(error);
      }
      syncGltfLoaderUrlDiagnostics();
      throw error;
    });
  }

  function parseGlbWithGltfLoader(THREE, url, assetKind, cacheEntry = null) {
    const LoaderClass = getGltfLoaderClass();
    if (!LoaderClass) return Promise.reject(new Error("GLTFLoader is unavailable"));
    return loadGltfSceneWithDiagnostics(THREE, LoaderClass, url, assetKind, cacheEntry).then((result) => result.template);
  }

  function loadGlbWithGltfLoader(THREE, assetPath, assetKind = "generic") {
    const url = resolvePublicAssetPath(assetPath);
    let entry = threeState.glbTemplateCache.get(url);
    if (entry) {
      if (entry.status === "loading") syncGltfLoaderUrlDiagnostics();
      return entry;
    }
    const startedAt = performance.now();
    entry = { status: "loading", url, rawUrl: String(assetPath || ""), resolvedUrl: url, baseUrl: getBrowserAssetBaseUrl(), cacheKey: url, assetKind, loaderMode: "gltf_loader", loaderPrimary: "GLTFLoader", template: null, error: null, errorMessage: null, errorStack: null, startedAt, durationMs: null, timeoutMs: getGlbLoadTimeoutMs(assetKind), progressLoaded: null, progressTotal: null, progressEventEmitted: false, materialAudit: null, promise: null };
    threeState.glbTemplateCache.set(url, entry);
    entry.promise = parseGlbWithGltfLoader(THREE, url, assetKind, entry)
      .then((template) => {
        entry.template = template;
        entry.materialAudit = collectGlbMaterialAudit(template, url);
        logGlbMaterialAudit();
        entry.status = "ready";
        return template;
      })
      .catch((error) => {
        entry.status = "failed";
        entry.durationMs = Number.isFinite(entry.durationMs) ? entry.durationMs : performance.now() - startedAt;
        entry.error = entry.errorMessage || formatGlbError(error);
        entry.errorMessage = entry.error;
        entry.errorStack = entry.errorStack || safeGlbErrorStack(error);
        const diagnostics = refreshGltfLoaderAvailabilityDiagnostics();
        diagnostics.gltfLoaderLastFailedUrl = url;
        diagnostics.gltfLoaderLastDurationMs = entry.durationMs;
        diagnostics.gltfLoaderLastErrorName = safeGlbErrorName(error);
        diagnostics.gltfLoaderLastErrorMessage = entry.error;
        diagnostics.gltfLoaderLastErrorStack = entry.errorStack;
        pushUniqueLimited(diagnostics.gltfLoaderFailedUrls, url);
        removeFromList(diagnostics.gltfLoaderPendingUrls, url);
        syncGltfLoaderUrlDiagnostics();
        if (!error?.hcGlbTimeout && !error?.hcGlbEventEmitted) emitGlbDebugEvent("world.glb_load_failed", makeGlbEventPayload("failed", { assetKind, url, cacheKey: entry.cacheKey, durationMs: entry.durationMs, loaded: entry.progressLoaded, total: entry.progressTotal, error, status: "failed" }));
        warnGlbLoadFailureOnce(url, entry.error, { assetKind, durationMs: entry.durationMs, progressLoaded: entry.progressLoaded, progressTotal: entry.progressTotal });
        if (assetKind === "asteroid") {
          threeState.asteroidGlbTextureDiagnostics = Object.assign(createAsteroidGlbTextureDiagnostics(), {
            asteroidGlbLoaderMode: "gltf_loader",
            lastAssetUrl: url,
            lastError: entry.error,
          });
        }
        return null;
      });
    return entry;
  }

  function loadMeteorGlb(THREE, url) {
    const entry = loadGlbWithGltfLoader(THREE, url, "meteor");
    threeState.meteorGlbCache.set(url, entry);
    if (entry.status === "failed") warnMeteorGlbOnce(url, entry.error || "GLTFLoader failed");
    return entry;
  }

  function runGltfDebugProbe(THREE) {
    const probe = threeState.gltfDebugProbe || createGltfDebugProbeDiagnostics();
    if (probe.status === "loading" || probe.status === "ready" || probe.status === "failed" || probe.status === "timeout") return probe;
    if (window.HC?.WorldRendererDebug?.gltfDebugProbeEnabled === false || !isWorldRendererDebugMode()) {
      probe.enabled = false;
      probe.status = "idle";
      threeState.gltfDebugProbe = probe;
      return probe;
    }
    const url = resolvePublicAssetPath(GLTF_LOADER_BROWSER_PROBE_ASSET);
    const LoaderClass = getGltfLoaderClass();
    Object.assign(probe, { enabled: true, asset: GLTF_LOADER_BROWSER_PROBE_ASSET, url, status: "loading", startedAt: performance.now(), durationMs: null, meshCount: 0, materialCount: 0, textureCount: 0, errorMessage: null });
    threeState.gltfDebugProbe = probe;
    if (!LoaderClass) {
      probe.status = "failed";
      probe.errorMessage = "GLTFLoader is unavailable";
      return probe;
    }
    loadGltfSceneWithDiagnostics(THREE, LoaderClass, url, "debug_probe", null)
      .then((result) => {
        const stats = result?.stats || collectGltfSceneStats(result?.template);
        probe.status = "ready";
        probe.durationMs = result?.durationMs ?? (performance.now() - probe.startedAt);
        probe.meshCount = stats?.meshCount || 0;
        probe.materialCount = stats?.materialCount || 0;
        probe.textureCount = stats?.textureCount || 0;
        probe.errorMessage = null;
      })
      .catch((error) => {
        probe.status = error?.hcGlbTimeout === true ? "timeout" : "failed";
        probe.durationMs = performance.now() - probe.startedAt;
        probe.errorMessage = formatGlbError(error);
      });
    return probe;
  }

  function cloneMeteorGlbTemplate(template) {
    const clone = template.clone(true);
    clone.userData.hcUnitRadius = template.userData?.hcUnitRadius || 1;
    clone.userData.hcLocalBoundingBox = template.userData?.hcLocalBoundingBox || null;
    clone.userData.hcLocalSize = template.userData?.hcLocalSize || null;
    clone.userData.hcGlbEmbeddedTextureCount = template.userData?.hcGlbEmbeddedTextureCount || 0;
    clone.userData.hcGlbTextureReadyCount = template.userData?.hcGlbTextureReadyCount || 0;
    clone.userData.hcGlbTextureMissingImageCount = template.userData?.hcGlbTextureMissingImageCount || 0;
    clone.userData.hcGlbTextureFallbackMaterialCount = template.userData?.hcGlbTextureFallbackMaterialCount || 0;
    clone.userData.hcGlbLoaderMode = template.userData?.hcGlbLoaderMode || "gltf_loader";
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
    colorKey = normalizeMeteorColorKey(colorKey);
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
    const entry = { root, fallback, glb: null, visualId, colorKey: null, meteorColorKey: colorKey, sourceMeteor: null, meteor: null, assetUrl: null, variantIndex: null, glbStatus: "fallback", rotationState, meteorTextureAssignments: null, meteorTextureAppliedUrls: { map: null, emissiveMap: null }, meteorTextureApplySignature: null, meteorTextureLastMaterialMode: null, meteorTextureLastToggleEnabled: null, meteorTextureStatus: "idle", meteorTextureRestorePending: false };
    assignMeteorGlbAsset(entry, colorKey);
    return entry;
  }

  function removeMeteorVisual(entry) {
    const root = entry?.root || entry;
    threeState.meteorGroup?.remove(root);
    disposeMeteorGlbInstance(entry);
  }


  function isFinitePositiveScale(object) {
    return [object?.scale?.x, object?.scale?.y, object?.scale?.z].every((value) => Number.isFinite(value) && Math.abs(value) > 1e-8);
  }

  function materialBlocksVisibility(material) {
    if (!material) return false;
    return material.visible === false || (material.transparent === true && Number(material.opacity) <= 0);
  }

  function getFirstMeshMaterialSummary(root) {
    let summary = null;
    root?.traverse?.((object) => {
      if (summary || !object?.isMesh) return;
      const material = Array.isArray(object.material) ? object.material[0] : object.material;
      summary = summarizeMaterial(material, { meshName: object.name || null, normalAttributePresent: !!object.geometry?.attributes?.normal });
    });
    return summary;
  }

  function estimateScreenPosition(object) {
    const bounds = threeState.worldCameraBounds || threeState.cameraBounds;
    const viewport = { width: Number(threeState.renderer?.domElement?.width || 0), height: Number(threeState.renderer?.domElement?.height || 0) };
    if (!object || !bounds) return { estimate: null, inCameraBounds: null };
    const x = Number(object.position?.x) || 0;
    const y = Number(object.position?.y) || 0;
    const inCameraBounds = x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
    const sx = ((x - bounds.left) / Math.max(1e-6, bounds.right - bounds.left)) * viewport.width;
    const sy = ((y - bounds.top) / Math.max(1e-6, bounds.bottom - bounds.top)) * viewport.height;
    const estimate = Number.isFinite(sx) && Number.isFinite(sy) ? { x: roundDiagnosticNumber(sx), y: roundDiagnosticNumber(sy) } : null;
    return { estimate, inCameraBounds };
  }

  function validateGlbInstanceVisibility(THREE, entry, kind) {
    const root = entry?.root;
    const glb = entry?.glb;
    const reasons = [];
    let meshCount = 0;
    let validMeshCount = 0;
    let materialZeroOpacity = false;
    if (!root) reasons.push("missing_root");
    if (!glb) reasons.push("missing_glb");
    if (root?.visible === false) reasons.push("root_hidden");
    if (glb && !isFinitePositiveScale(glb)) reasons.push("invalid_scale");
    glb?.traverse?.((object) => {
      if (!object?.isMesh) return;
      meshCount += 1;
      const position = object.geometry?.attributes?.position;
      if (position && Number(position.count) > 0 && object.visible !== false) validMeshCount += 1;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      if (materials.some(materialBlocksVisibility)) materialZeroOpacity = true;
    });
    if (meshCount <= 0) reasons.push("missing_mesh");
    if (validMeshCount <= 0) reasons.push("missing_position_attribute");
    if (materialZeroOpacity) reasons.push("transparent_or_hidden_material");
    const world = getObjectWorldBoundsDiagnostic(THREE, glb);
    const worldSize = world?.size || null;
    const finiteWorldSize = worldSize && [worldSize.x, worldSize.y, worldSize.z].every((value) => Number.isFinite(Number(value)));
    const positiveWorldSize = finiteWorldSize && Math.max(Math.abs(worldSize.x), Math.abs(worldSize.y), Math.abs(worldSize.z)) > 1e-8;
    if (!world?.box || !finiteWorldSize) reasons.push("non_finite_world_bounds");
    if (!positiveWorldSize) reasons.push("zero_world_size");
    const screen = estimateScreenPosition(root);
    if (screen.inCameraBounds === false) reasons.push("outside_camera_bounds");
    if (!screen.estimate) reasons.push("missing_screen_estimate");
    const visible = reasons.length === 0;
    const diagnostics = {
      visible,
      validationReasons: reasons,
      meshCount,
      validMeshCount,
      worldBoundingBox: world?.box || null,
      worldSize,
      screenEstimate: screen.estimate,
      inCameraBounds: screen.inCameraBounds,
      materialSummary: getFirstMeshMaterialSummary(glb),
    };
    if (kind === "meteor") {
      if (visible) threeState.meteorGlbValidatedVisibleCount += 1;
      else threeState.meteorGlbValidationFailedCount += 1;
    } else if (kind === "asteroid") {
      if (visible) threeState.asteroidGlbValidatedVisibleCount += 1;
      else {
        threeState.asteroidGlbValidationFailedCount += 1;
        threeState.asteroidFallbackKeptDueToInvalidGlbCount += 1;
      }
    }
    return diagnostics;
  }

  function applyGlbVisibilityGate(THREE, entry, kind) {
    const diagnostics = validateGlbInstanceVisibility(THREE, entry, kind);
    const shouldShowGlb = diagnostics.visible && entry?.root?.visible !== false;
    if (entry?.glb) entry.glb.visible = shouldShowGlb;
    if (entry?.fallback) entry.fallback.visible = !shouldShowGlb;
    if (entry?.root?.userData) {
      entry.root.userData.glbStatus = shouldShowGlb ? "validated_visible" : "invalid_glb_fallback";
      entry.root.userData.glbValidation = diagnostics;
    }
    entry.glbStatus = shouldShowGlb ? "validated_visible" : "invalid_glb_fallback";
    return diagnostics;
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
      entry.glb.userData.meteorColorKey = entry.meteorColorKey || entry.colorKey || null;
      entry.glb.userData.colorKey = entry.colorKey || null;
      applyDebugMaterialMode(THREE, entry.glb);
      syncMeteorTexturePaletteForEntry(THREE, entry);
      entry.root.add(entry.glb);
      threeState.meteorGlbInstanceCreates += 1;
    }
    syncMeteorTexturePaletteForEntry(THREE, entry);
    entry.glbStatus = "ready_pending_validation";
    entry.root.userData.glbStatus = entry.glbStatus;
    entry.fallback.visible = true;
    entry.glb.visible = false;
    return true;
  }


  function loadAsteroidGlb(THREE, url) {
    const entry = loadGlbWithGltfLoader(THREE, url, "asteroid");
    threeState.asteroidGlbCache.set(url, entry);
    if (entry.status === "failed") warnAsteroidGlbOnce(url, entry.error || "GLTFLoader failed");
    return entry;
  }

  function cloneAsteroidGlbTemplate(template) {
    const clone = cloneMeteorGlbTemplate(template);
    clone.userData.hcObjectType = "asteroid";
    clone.traverse?.((object) => {
      if (object.isMesh) object.renderOrder = 900;
    });
    return clone;
  }

  function createAsteroidVisual(THREE, asteroid, key) {
    const root = new THREE.Group();
    root.userData.hcObjectType = "asteroid";
    root.userData.asteroidKey = key;
    root.userData.glbAssetUrl = getAsteroidGlbAssetUrl();
    root.frustumCulled = false;
    const fallback = new THREE.Mesh(getAsteroidGeometry(THREE, asteroid?.sides), getAsteroidMaterial(THREE, asteroid));
    fallback.frustumCulled = false;
    fallback.renderOrder = 900;
    root.add(fallback);
    const rotationState = createMeteorGlbRotationState(`asteroid:${key}`);
    rotationState.rotationSpeed.x *= 0.42;
    rotationState.rotationSpeed.y *= 0.42;
    rotationState.rotationSpeed.z *= 0.42;
    root.userData.rotationSeed = rotationState.rotationSeed;
    root.userData.rotationBase = rotationState.rotationBase;
    root.userData.rotationSpeed = rotationState.rotationSpeed;
    root.userData.rotationDominantAxis = rotationState.dominantAxis;
    return { root, fallback, glb: null, key, assetUrl: getAsteroidGlbAssetUrl(), glbStatus: "assigned", rotationState, asteroid: null };
  }

  function disposeAsteroidGlbInstance(entry) {
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

  function removeAsteroidVisual(entry) {
    const root = entry?.root || entry;
    threeState.asteroidGroup?.remove(root);
    disposeAsteroidGlbInstance(entry);
  }

  function updateAsteroidGlbVisual(THREE, entry) {
    if (!entry) return false;
    const assetUrl = entry.assetUrl || getAsteroidGlbAssetUrl();
    const cacheEntry = loadAsteroidGlb(THREE, assetUrl);
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
      entry.glb = cloneAsteroidGlbTemplate(cacheEntry.template);
      entry.glb.userData.hcAssetUrl = assetUrl;
      entry.glb.userData.hcObjectType = "asteroid";
      applyDebugMaterialMode(THREE, entry.glb);
      entry.root.add(entry.glb);
      threeState.asteroidGlbInstanceCreates += 1;
    }
    entry.glbStatus = "ready_pending_validation";
    entry.root.userData.glbStatus = entry.glbStatus;
    entry.fallback.visible = true;
    entry.glb.visible = false;
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
      if (threeState.mainStageSpotTarget) scene.add(threeState.mainStageSpotTarget);
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
      refreshGltfLoaderAvailabilityDiagnostics();
      runGltfDebugProbe(THREE);
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
    resetMeteorTextureFrameDiagnostics();
    const rotationNowMs = getMeteorRotationNowMs(renderSnapshot, nowMs);
    const meteorGlbVisualScale = getMeteorGlbVisualScale();
    const meteorGlbDepthScale = getMeteorGlbDepthScale();
    threeState.glbScaleWarning = null;
    threeState.meteorGlbValidatedVisibleCount = 0;
    threeState.meteorGlbValidationFailedCount = 0;
    const seen = new Set();
    for (let i = 0; i < meteors.length; i += 1) {
      const m = meteors[i] || {};
      const colorKey = getMeteorColorKey(m);
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
      visual.sourceMeteor = m;
      visual.meteor = m;
      visual.meteorColorKey = colorKey;
      if (visual.root?.userData) visual.root.userData.meteorColorKey = colorKey;
      if (visual.glb?.userData) visual.glb.userData.meteorColorKey = colorKey;
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
        if (hasGlbVisual) applyGlbVisibilityGate(THREE, visual, "meteor");
        else visual.fallback.visible = true;
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
          meteorTextureMapUrl: visual.meteorTextureAppliedUrls?.map || visual.meteorTextureAssignments?.map?.url || null,
          meteorTextureMapName: visual.meteorTextureAssignments?.map?.path?.split("/").pop() || null,
          meteorTextureEmissiveUrl: visual.meteorTextureAppliedUrls?.emissiveMap || visual.meteorTextureAssignments?.emissiveMap?.url || null,
          meteorTextureEmissiveName: visual.meteorTextureAssignments?.emissiveMap?.path?.split("/").pop() || null,
          meteorTextureStatus: visual.meteorTextureStatus || null,
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

  function getStableAsteroidSnapshotKey(a, index) {
    const key = a?.renderKey || a?.id || a?._id || null;
    if (key != null && key !== "") return `asteroid:${key}`;
    return `asteroid:${index}:${Math.round(Number(a?.x) || 0)}:${Math.round(Number(a?.y) || 0)}`;
  }

  function syncAsteroidPass(renderSnapshot, nowMs) {
    const THREE = window.HC_THREE || window.THREE;
    const asteroids = Array.isArray(renderSnapshot?.world?.asteroids) ? renderSnapshot.world.asteroids : [];
    threeState.threeAsteroidCount = asteroids.length;
    threeState.asteroidGroupChildrenCount = 0;
    threeState.asteroidGlbValidatedVisibleCount = 0;
    threeState.asteroidGlbValidationFailedCount = 0;
    threeState.asteroidFallbackKeptDueToInvalidGlbCount = 0;
    threeState.firstAsteroidSample = null;
    threeState.firstAsteroidMeshSample = null;
    threeState.firstAsteroidScreenEstimate = null;
    threeState.firstAsteroidInCameraBounds = null;
    const rotationNowMs = getMeteorRotationNowMs(renderSnapshot, nowMs);
    const seen = new Set();
    for (let i = 0; i < asteroids.length; i += 1) {
      const a = asteroids[i] || {};
      const key = getStableAsteroidSnapshotKey(a, i);
      seen.add(key);
      let visual = threeState.asteroidMeshes.get(key);
      if (!visual) {
        visual = createAsteroidVisual(THREE, a, key);
        threeState.asteroidGroup.add(visual.root);
        threeState.asteroidMeshes.set(key, visual);
      } else {
        visual.fallback.geometry = getAsteroidGeometry(THREE, a.sides);
        visual.fallback.material = getAsteroidMaterial(THREE, a);
      }
      visual.asteroid = a;
      const sourceRadius = Number(a.radius ?? a.r ?? a.scale) || THREE_ASTEROID_MIN_RADIUS;
      const radius = Math.max(THREE_ASTEROID_MIN_RADIUS, sourceRadius);
      const renderRadius = applyRenderSpaceToRadius(radius);
      const renderPosition = applyRenderSpaceToVector(Number(a.x) || 0, Number(a.y) || 0, -0.1);
      const hasGlbVisual = updateAsteroidGlbVisual(THREE, visual);
      visual.root.position.set(renderPosition.x, renderPosition.y, renderPosition.z);
      visual.root.renderOrder = 900;
      const collapseOpacity = a.visual?.isCollapsing || a.state === "collapsing" || a.isCollapsing ? 0.86 : 1;
      const opacity = Number.isFinite(a.alpha) ? Math.max(0.25, Math.min(1, a.alpha)) : collapseOpacity;
      visual.root.visible = !a.flags?.dead && !a.visual?.absorbingIntoStarId;
      visual.fallback.scale.set(renderRadius, renderRadius, 1);
      visual.fallback.rotation.z = Number.isFinite(a.angle) ? a.angle : 0;
      visual.fallback.material.opacity = opacity;
      if (visual.glb) {
        const unitRadius = Math.max(0.0001, Number(visual.glb.userData?.hcUnitRadius) || 1);
        const glbScale = ((renderRadius * ASTEROID_GLB_RADIUS_SCALE) / unitRadius);
        visual.glb.scale.set(glbScale, glbScale, glbScale * ASTEROID_GLB_DEPTH_SCALE);
        applyMeteorGlbRotation(visual, rotationNowMs);
        if (Number.isFinite(a.angle)) visual.glb.rotation.z += a.angle;
        visual.root.userData.rotationPhase = visual.rotationState?.rotationPhase || 0;
        if (hasGlbVisual) {
          const asteroidValidation = applyGlbVisibilityGate(THREE, visual, "asteroid");
          if (i === 0) {
            threeState.firstAsteroidScreenEstimate = asteroidValidation.screenEstimate;
            threeState.firstAsteroidInCameraBounds = asteroidValidation.inCameraBounds;
            threeState.firstAsteroidMeshSample = {
              position: { x: visual.root.position.x, y: visual.root.position.y, z: visual.root.position.z },
              sourcePosition: { x: Number(a.x) || 0, y: Number(a.y) || 0, z: -0.1 },
              fallbackScale: { x: visual.fallback.scale.x, y: visual.fallback.scale.y, z: visual.fallback.scale.z },
              visible: visual.root.visible,
              glbAssetUrl: visual.assetUrl || null,
              glbVisible: !!visual.glb?.visible,
              glbStatus: visual.glbStatus,
              worldBoundingBox: asteroidValidation.worldBoundingBox,
              worldSize: asteroidValidation.worldSize,
              materialSummary: asteroidValidation.materialSummary,
              validationReasons: asteroidValidation.validationReasons,
            };
          }
        } else {
          visual.fallback.visible = true;
        }
      }
      if (i === 0) {
        threeState.firstAsteroidSample = {
          x: Number(a.x) || 0,
          y: Number(a.y) || 0,
          radius: sourceRadius,
          alpha: Number.isFinite(a.alpha) ? a.alpha : null,
          renderedPosition: { x: visual.root.position.x, y: visual.root.position.y, z: visual.root.position.z },
        };
        if (!threeState.firstAsteroidMeshSample) {
          const screen = estimateScreenPosition(visual.root);
          threeState.firstAsteroidScreenEstimate = screen.estimate;
          threeState.firstAsteroidInCameraBounds = screen.inCameraBounds;
          threeState.firstAsteroidMeshSample = {
            position: { x: visual.root.position.x, y: visual.root.position.y, z: visual.root.position.z },
            sourcePosition: { x: Number(a.x) || 0, y: Number(a.y) || 0, z: -0.1 },
            fallbackScale: { x: visual.fallback.scale.x, y: visual.fallback.scale.y, z: visual.fallback.scale.z },
            visible: visual.root.visible,
            glbAssetUrl: visual.assetUrl || null,
            glbVisible: !!visual.glb?.visible,
            glbStatus: visual.glbStatus,
            worldBoundingBox: null,
            worldSize: null,
            materialSummary: null,
            validationReasons: hasGlbVisual ? [] : [visual.glbStatus || "loading"],
          };
        }
      }
    }
    for (const [key, visual] of threeState.asteroidMeshes.entries()) {
      if (seen.has(key)) continue;
      removeAsteroidVisual(visual);
      threeState.asteroidMeshes.delete(key);
    }
    threeState.asteroidGroupChildrenCount = threeState.asteroidGroup?.children?.length || 0;
    threeState.asteroidGlbCacheStats = getAsteroidGlbCacheStats();
  }

  function destroyThree() {
    if (threeState.renderer?.dispose) threeState.renderer.dispose();
    threeState.meteorMeshes.forEach((entry) => { removeMeteorVisual(entry); });
    threeState.meteorMeshes.clear();
    threeState.nextMeteorVisualId = 1;
    threeState.asteroidMeshes.forEach((entry) => { removeAsteroidVisual(entry); });
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
    threeState.asteroidGlbCache.clear();
    threeState.glbTemplateCache.clear();
    threeState.asteroidGlbWarnings.clear();
    threeState.glbBlobUrls.forEach((url) => { try { URL.revokeObjectURL(url); } catch (_) {} });
    threeState.glbBlobUrls.clear();
    if (threeState.canvas) { threeState.canvas.style.display = "none"; threeState.canvas.style.visibility = "hidden"; }
    if (threeState.debugMarker?.parent) threeState.debugMarker.parent.remove(threeState.debugMarker);
    if (threeState.firstMeteorMarker?.parent) threeState.firstMeteorMarker.parent.remove(threeState.firstMeteorMarker);
    Object.assign(threeState, { renderer: null, scene: null, camera: null, orthographicCamera: null, perspectiveCamera: null, meteorGroup: null, asteroidGroup: null, lightsGroup: null, ambientLight: null, debugKeyLight: null, debugRimLight: null, forceHeadlight: null, mainStageSpot: null, mainStageSpotTarget: null, lightHelpersGroup: null, lightHelpers: [], meteorGeometry: null, debugMarker: null, firstMeteorMarker: null, initialized: false, cameraBounds: null, rendererSize: null, environment: null, environmentCanvas: null });
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
        if (isWorldRendererDebugMode()) runGltfDebugProbe(THREE);
        try {
          if (threeState.threeMeteorRenderEnabled) syncMeteorPass(renderSnapshot || {}, nowMs);
          threeState.threeMeteorLastError = null;
        } catch (err) {
          threeState.threeMeteorLastError = err?.message || String(err);
          threeState.threeMeteorCount = 0;
        }
        try {
          if (threeState.threeAsteroidRenderEnabled) syncAsteroidPass(renderSnapshot || {}, nowMs);
          threeState.threeAsteroidLastError = null;
        } catch (err) {
          threeState.threeAsteroidLastError = err?.message || String(err);
          threeState.threeAsteroidCount = 0;
        }
        threeState.renderCalls += 1;
        refreshMaterialOverrideStatus(THREE);
        syncMeteorTexturePalettesForActiveEntries(THREE);
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
    for (const entry of threeState.asteroidMeshes.values()) {
      if (!entry?.root?.visible) continue;
      return {
        kind: entry.glb?.visible ? "asteroid_glb" : "asteroid_fallback",
        assetName: entry.assetUrl ? getAssetNameFromUrl(entry.assetUrl) : null,
        asset: entry.assetUrl || null,
        colorKey: null,
        glbStatus: entry.glbStatus || null,
        position: vectorToDiagnostic(entry.root.position),
      };
    }
    return null;
  }


  function getFirstAsteroidLightSample() {
    for (const entry of threeState.asteroidMeshes.values()) {
      if (!entry?.root?.visible) continue;
      return {
        kind: entry.glb?.visible ? "asteroid_glb" : "asteroid_fallback",
        assetName: entry.assetUrl ? getAssetNameFromUrl(entry.assetUrl) : null,
        asset: entry.assetUrl || null,
        glbStatus: entry.glbStatus || null,
        glbVisible: !!entry.glb?.visible,
        fallbackVisible: !!entry.fallback?.visible,
        position: vectorToDiagnostic(entry.root.position),
      };
    }
    return null;
  }

  function getLightDistanceDiagnostics() {
    const sample = getFirstActiveGlbLightSample();
    const asteroidSample = getFirstAsteroidLightSample();
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
      asteroidSampleObject: asteroidSample,
      effectiveAmbientIntensity: settings.enabled && !settings.ambientIsolate ? roundDiagnosticNumber(settings.ambientIntensity) : 0,
      keyEnabled: !!settings.debugKeyLightEnabled,
      rimEnabled: !!(settings.debugKeyLightEnabled && settings.debugRimLightEnabled),
      headlightEnabled: !!settings.forceHeadlightEnabled,
      lights: lightEntries,
      debugKeyLight: lightEntries.find((entry) => entry.role === "debug_key") || null,
      debugRimLight: lightEntries.find((entry) => entry.role === "debug_rim") || null,
      forceHeadlight: lightEntries.find((entry) => entry.role === "force_headlight") || null,
      mainStageSpot: lightEntries.find((entry) => entry.role === "main_stage_spot") || null,
      mainStageSpotTargetMode: settings.mainStageSpotTargetMode || "center",
      mainStageSpotHelperVisible: !!threeState.lightHelpers.find((entry) => entry.name === "mainStageSpot" && entry.mode === "spotLightHelper" && entry.helper?.visible),
      sampleObjectProjected: threeState.firstMeteorScreenEstimate || null,
      asteroidSampleObjectProjected: threeState.firstAsteroidScreenEstimate || null,
      asteroidSampleObjectFrustumVisible: threeState.firstAsteroidInCameraBounds == null ? null : !!threeState.firstAsteroidInCameraBounds,
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
    const lightSettings = threeState.lightsSettings || getThreeLightsSettings();
    const lightDiagnostics = getLightDistanceDiagnostics();
    const mainStageSpotSnapshot = {
      enabled: !!lightSettings.mainStageSpotEnabled,
      intensity: roundDiagnosticNumber(threeState.mainStageSpot?.intensity),
      angle: roundDiagnosticNumber(threeState.mainStageSpot?.angle),
      penumbra: roundDiagnosticNumber(threeState.mainStageSpot?.penumbra),
      distance: roundDiagnosticNumber(threeState.mainStageSpot?.distance),
      decay: roundDiagnosticNumber(threeState.mainStageSpot?.decay),
      position: vectorToDiagnostic(threeState.mainStageSpot?.position),
      targetPosition: vectorToDiagnostic(threeState.mainStageSpotTarget?.position),
      targetMode: lightSettings.mainStageSpotTargetMode || "center",
      helperVisible: !!threeState.lightHelpers.find((entry) => entry.name === "mainStageSpot" && entry.mode === "spotLightHelper" && entry.helper?.visible),
      targetInScene: !!threeState.mainStageSpotTarget?.parent,
      castShadow: !!threeState.mainStageSpot?.castShadow,
    };
    const stageLightingEnabled = lightSettings.mainStageSpotEnabled !== false && mainStageSpotSnapshot.enabled === true;
    const stageLightCounts = getStageLightCounts();
    const gltfLoaderDiagnostics = syncGltfLoaderUrlDiagnostics();
    refreshGltfLoaderAvailabilityDiagnostics();
    return {
      requestedMode, effectiveMode, mode: effectiveMode, fallbackUsed, fallbackReason, lastError, initialized, renderCalls, fallbackCalls, snapshotVersion: "1",
      glbLoaderMode: "gltf_loader", glbLoaderPrimary: "GLTFLoader", glbLoaderFallbackUsed: !!threeState.glbLoaderFallbackUsed, glbLoaderFallbackReason: threeState.glbLoaderFallbackReason,
      gltfLoaderAvailable: gltfLoaderDiagnostics.gltfLoaderAvailable,
      gltfLoaderType: gltfLoaderDiagnostics.gltfLoaderType,
      gltfLoaderImportUrl: gltfLoaderDiagnostics.gltfLoaderImportUrl,
      gltfLoaderImportStatus: gltfLoaderDiagnostics.gltfLoaderImportStatus,
      gltfLoaderLastImportError: gltfLoaderDiagnostics.gltfLoaderLastImportError,
      gltfLoaderRequestCount: gltfLoaderDiagnostics.gltfLoaderRequestCount,
      gltfLoaderProgressCount: gltfLoaderDiagnostics.gltfLoaderProgressCount,
      gltfLoaderSuccessCount: gltfLoaderDiagnostics.gltfLoaderSuccessCount,
      gltfLoaderErrorCount: gltfLoaderDiagnostics.gltfLoaderErrorCount,
      gltfLoaderTimeoutCount: gltfLoaderDiagnostics.gltfLoaderTimeoutCount,
      gltfLoaderLastRequestedUrl: gltfLoaderDiagnostics.gltfLoaderLastRequestedUrl,
      gltfLoaderLastRequestedUrlRaw: gltfLoaderDiagnostics.gltfLoaderLastRequestedUrlRaw,
      gltfLoaderLastRequestedUrlResolved: gltfLoaderDiagnostics.gltfLoaderLastRequestedUrlResolved,
      gltfLoaderLastRequestedBaseUrl: gltfLoaderDiagnostics.gltfLoaderLastRequestedBaseUrl,
      gltfLoaderUrlNormalizeError: gltfLoaderDiagnostics.gltfLoaderUrlNormalizeError,
      gltfLoaderLastProgressUrl: gltfLoaderDiagnostics.gltfLoaderLastProgressUrl,
      gltfLoaderLastCompletedUrl: gltfLoaderDiagnostics.gltfLoaderLastCompletedUrl,
      gltfLoaderLastFailedUrl: gltfLoaderDiagnostics.gltfLoaderLastFailedUrl,
      gltfLoaderLastTimedOutUrl: gltfLoaderDiagnostics.gltfLoaderLastTimedOutUrl,
      gltfLoaderLastProgressLoaded: gltfLoaderDiagnostics.gltfLoaderLastProgressLoaded,
      gltfLoaderLastProgressTotal: gltfLoaderDiagnostics.gltfLoaderLastProgressTotal,
      gltfLoaderLastDurationMs: gltfLoaderDiagnostics.gltfLoaderLastDurationMs,
      gltfLoaderLastErrorName: gltfLoaderDiagnostics.gltfLoaderLastErrorName,
      gltfLoaderLastErrorMessage: gltfLoaderDiagnostics.gltfLoaderLastErrorMessage,
      gltfLoaderLastErrorStack: gltfLoaderDiagnostics.gltfLoaderLastErrorStack,
      gltfLoaderPendingUrls: (gltfLoaderDiagnostics.gltfLoaderPendingUrls || []).slice(),
      gltfLoaderFailedUrls: (gltfLoaderDiagnostics.gltfLoaderFailedUrls || []).slice(),
      gltfLoaderTimedOutUrls: (gltfLoaderDiagnostics.gltfLoaderTimedOutUrls || []).slice(),
      gltfLoaderDebugEvents: threeState.gltfLoaderDebugEvents.slice(-12),
      glbVisualFallbackActiveCount: Array.from(threeState.meteorMeshes.values()).filter((entry) => !!entry.fallback?.visible).length + Array.from(threeState.asteroidMeshes.values()).filter((entry) => !!entry.fallback?.visible).length,
      gltfProbeStarted: !!threeState.gltfDebugProbe?.startedAt,
      gltfProbeStatus: threeState.gltfDebugProbe?.status || "idle",
      gltfProbeUrl: threeState.gltfDebugProbe?.url || null,
      gltfProbeDurationMs: threeState.gltfDebugProbe?.durationMs ?? null,
      gltfProbeMeshCount: threeState.gltfDebugProbe?.meshCount || 0,
      gltfProbeMaterialCount: threeState.gltfDebugProbe?.materialCount || 0,
      gltfProbeTextureCount: threeState.gltfDebugProbe?.textureCount || 0,
      gltfProbeErrorMessage: threeState.gltfDebugProbe?.errorMessage || null,
      gltfDebugProbe: Object.assign({}, threeState.gltfDebugProbe || createGltfDebugProbeDiagnostics()),
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
      asteroidGlbAsset: ASTEROID_GLB_ASSET,
      asteroidGlbAssetUrl: getAsteroidGlbAssetUrl(),
      asteroidGlbCacheStats: getAsteroidGlbCacheStats(),
      glbTemplateCacheEntries: summarizeGlbCacheEntries(threeState.glbTemplateCache),
      meteorGlbCacheEntries: summarizeGlbCacheEntries(threeState.meteorGlbCache),
      asteroidGlbCacheEntries: summarizeGlbCacheEntries(threeState.asteroidGlbCache),
      glbTemplateCacheSize: threeState.glbTemplateCache.size,
      asteroidGlbCacheSize: threeState.asteroidGlbCache.size,
      asteroidGlbStatus: threeState.asteroidGlbCache.get(getAsteroidGlbAssetUrl())?.status || "not_requested",
      asteroidGlbInstanceCreates: threeState.asteroidGlbInstanceCreates,
      asteroidGlbEmbeddedTextureCount: threeState.asteroidGlbTextureDiagnostics?.asteroidGlbEmbeddedTextureCount || 0,
      asteroidGlbTextureReadyCount: threeState.asteroidGlbTextureDiagnostics?.asteroidGlbTextureReadyCount || 0,
      asteroidGlbTextureMissingImageCount: threeState.asteroidGlbTextureDiagnostics?.asteroidGlbTextureMissingImageCount || 0,
      asteroidGlbTextureFallbackMaterialCount: threeState.asteroidGlbTextureDiagnostics?.asteroidGlbTextureFallbackMaterialCount || 0,
      asteroidGlbLoaderMode: "gltf_loader",
      asteroidGlbLoaderPrimary: "GLTFLoader",
      asteroidGlbGltfSceneMeshCount: threeState.asteroidGlbGltfSceneMeshCount,
      asteroidGlbGltfSceneMaterialCount: threeState.asteroidGlbGltfSceneMaterialCount,
      asteroidGlbGltfSceneTextureCount: threeState.asteroidGlbGltfSceneTextureCount,
      asteroidGlbValidatedVisibleCount: threeState.asteroidGlbValidatedVisibleCount,
      asteroidGlbValidationFailedCount: threeState.asteroidGlbValidationFailedCount,
      asteroidFallbackKeptDueToInvalidGlbCount: threeState.asteroidFallbackKeptDueToInvalidGlbCount,
      asteroidGlbTextureDiagnostics: Object.assign({}, threeState.asteroidGlbTextureDiagnostics || createAsteroidGlbTextureDiagnostics()),
      activeAsteroidGlbInstances: Array.from(threeState.asteroidMeshes.values()).filter((entry) => !!entry.glb).length,
      activeFallbackAsteroidVisuals: Array.from(threeState.asteroidMeshes.values()).filter((entry) => !!entry.fallback?.visible).length,
      firstAsteroid: threeState.firstAsteroidSample,
      firstAsteroidMesh: threeState.firstAsteroidMeshSample,
      firstAsteroidScreenEstimate: threeState.firstAsteroidScreenEstimate,
      firstAsteroidInCameraBounds: threeState.firstAsteroidInCameraBounds,
      firstAsteroidGlbVisible: !!threeState.firstAsteroidMeshSample?.glbVisible,
      firstAsteroidFallbackVisible: threeState.firstAsteroidMeshSample ? !!Array.from(threeState.asteroidMeshes.values())[0]?.fallback?.visible : null,
      firstAsteroidWorldBoundingBox: threeState.firstAsteroidMeshSample?.worldBoundingBox || null,
      firstAsteroidWorldSize: threeState.firstAsteroidMeshSample?.worldSize || null,
      firstAsteroidMaterialSummary: threeState.firstAsteroidMeshSample?.materialSummary || null,
      meteorGlbVisualScale: getMeteorGlbVisualScale(),
      meteorGlbDepthScale: getMeteorGlbDepthScale(),
      meteorGlbScaleLiveControl: true,
      meteorGlbDepthScaleLiveControl: true,
      glbScaleWarning: threeState.glbScaleWarning,
      globalHelpersEnabled: getGlobalHelpersEnabled(),
      threeLightsLiveControl: true,
      threeMaterialDebugLiveControl: true,
      threeMaterialSettings: Object.assign({}, threeState.materialSettings || getThreeMaterialSettings()),
      meteorTexturePalettes: {
        red: { map: buildMeteorTexturePalette("red", "map"), emissiveMap: buildMeteorTexturePalette("red", "emissiveMap") },
        yellow: { map: buildMeteorTexturePalette("yellow", "map"), emissiveMap: buildMeteorTexturePalette("yellow", "emissiveMap") },
      },
      meteorTexturePaletteEnabled: getMeteorTexturePassEnabled(getThreeMaterialSettings()),
      meteorTextureCacheStats: getMeteorTextureCacheStats(),
      meteorTextureUsage: countMeteorTextureUsage(),
      meteorTextureEvidence: getMeteorTextureEvidence(),
      meteorTextureWarnings: threeState.meteorTextureWarnings.size,
      redMeteorTexturePalette: buildMeteorTexturePalette("red", "map"),
      redMeteorTexturePaletteEnabled: getMeteorTexturePassEnabled(getThreeMaterialSettings()),
      redMeteorTextureCacheStats: getMeteorTextureCacheStats(),
      redMeteorTextureUsage: countMeteorTextureUsage()?.red?.map || {},
      redMeteorTextureWarnings: threeState.meteorTextureWarnings.size,
      glbMaterialAudit: threeState.glbMaterialAudit.slice(-8),
      glbMaterialAuditStatus: getMaterialAuditOverlayStatus(),
      sceneEnvironmentEnabled: !!threeState.scene?.environment,
      rendererOutputColorSpace: threeState.renderer?.outputColorSpace || threeState.renderer?.outputEncoding || null,
      rendererToneMapping: threeState.renderer?.toneMapping ?? null,
      rendererToneMappingExposure: threeState.renderer?.toneMappingExposure ?? null,
      threeLights: Object.assign({}, threeState.lightsSettings || getThreeLightsSettings()),
      mainStageSpot: mainStageSpotSnapshot,
      threeLightDiagnostics: lightDiagnostics,
      threeLightHelpers: { globalEnabled: getGlobalHelpersEnabled(), enabled: !!lightSettings.showLightHelpers, visible: !!threeState.lightHelpersGroup?.visible, count: threeState.lightHelpers.length, mode: threeState.lightHelperStatus?.mode || "none" },
      threeMaterialOverrideStatus: Object.assign({}, threeState.materialOverrideStatus),
      activeLightCount: stageLightCounts.activeLightCount,
      diagnosticLightCount: stageLightCounts.diagnosticLightCount,
      totalLightObjects: stageLightCounts.totalLightObjects,
      threeLightCount: stageLightCounts.totalLightObjects,
      threeLightCountSemantics: "deprecated_totalLightObjects",
      lightingModelVersion: "stage_spot_v1",
      removedLegacyCornerLights: true,
      stageLighting: {
        enabled: stageLightingEnabled,
        stageLightingEnabled,
        model: "stage_spot",
        lightingModelVersion: "stage_spot_v1",
        removedLegacyCornerLights: true,
        ambientEffectiveIntensity: lightDiagnostics.effectiveAmbientIntensity,
        mainStageSpot: mainStageSpotSnapshot,
      },
      meteorGlbLoaderMode: "gltf_loader",
      meteorGlbLoaderPrimary: "GLTFLoader",
      meteorGlbGltfSceneMeshCount: threeState.meteorGlbGltfSceneMeshCount,
      meteorGlbGltfSceneMaterialCount: threeState.meteorGlbGltfSceneMaterialCount,
      meteorGlbGltfSceneTextureCount: threeState.meteorGlbGltfSceneTextureCount,
      meteorGlbValidatedVisibleCount: threeState.meteorGlbValidatedVisibleCount,
      meteorGlbValidationFailedCount: threeState.meteorGlbValidationFailedCount,
      meteorGlbCacheStats: getMeteorGlbCacheStats(),
      meteorGlbAssignmentsCount: Array.from(threeState.meteorMeshes.values()).filter((entry) => !!entry.assetUrl).length,
      meteorGlbCacheSize: threeState.meteorGlbCache.size,
      activeGlbInstances: Array.from(threeState.meteorMeshes.values()).filter((entry) => !!entry.glb).length,
      activeMeteorGlbInstances: Array.from(threeState.meteorMeshes.values()).filter((entry) => !!entry.glb).length,
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
