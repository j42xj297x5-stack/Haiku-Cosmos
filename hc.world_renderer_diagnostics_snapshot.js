// HC world renderer diagnostics snapshot helpers (debug/optional)
(function () {
  window.HC = window.HC || {};

  function copyList(value) {
    return Array.isArray(value) ? value.slice() : [];
  }

  function buildGltfLoaderDiagnosticsSnapshot(diagnostics, debugEvents) {
    const source = diagnostics || {};
    return {
      gltfLoaderAvailable: !!source.gltfLoaderAvailable,
      gltfLoaderType: source.gltfLoaderType || "undefined",
      gltfLoaderImportUrl: source.gltfLoaderImportUrl || null,
      gltfLoaderImportStatus: source.gltfLoaderImportStatus || "unknown",
      gltfLoaderLastImportError: source.gltfLoaderLastImportError || null,
      gltfLoaderRequestCount: source.gltfLoaderRequestCount || 0,
      gltfLoaderProgressCount: source.gltfLoaderProgressCount || 0,
      gltfLoaderSuccessCount: source.gltfLoaderSuccessCount || 0,
      gltfLoaderErrorCount: source.gltfLoaderErrorCount || 0,
      gltfLoaderTimeoutCount: source.gltfLoaderTimeoutCount || 0,
      gltfLoaderLastRequestedUrl: source.gltfLoaderLastRequestedUrl || null,
      gltfLoaderLastRequestedUrlRaw: source.gltfLoaderLastRequestedUrlRaw || null,
      gltfLoaderLastRequestedUrlResolved: source.gltfLoaderLastRequestedUrlResolved || null,
      gltfLoaderLastRequestedBaseUrl: source.gltfLoaderLastRequestedBaseUrl || null,
      gltfLoaderUrlNormalizeError: source.gltfLoaderUrlNormalizeError || null,
      gltfLoaderLastProgressUrl: source.gltfLoaderLastProgressUrl || null,
      gltfLoaderLastCompletedUrl: source.gltfLoaderLastCompletedUrl || null,
      gltfLoaderLastFailedUrl: source.gltfLoaderLastFailedUrl || null,
      gltfLoaderLastTimedOutUrl: source.gltfLoaderLastTimedOutUrl || null,
      gltfLoaderLastProgressLoaded: source.gltfLoaderLastProgressLoaded ?? null,
      gltfLoaderLastProgressTotal: source.gltfLoaderLastProgressTotal ?? null,
      gltfLoaderLastDurationMs: source.gltfLoaderLastDurationMs ?? null,
      gltfLoaderLastErrorName: source.gltfLoaderLastErrorName || null,
      gltfLoaderLastErrorMessage: source.gltfLoaderLastErrorMessage || null,
      gltfLoaderLastErrorStack: source.gltfLoaderLastErrorStack || null,
      gltfLoaderPendingUrls: copyList(source.gltfLoaderPendingUrls),
      gltfLoaderFailedUrls: copyList(source.gltfLoaderFailedUrls),
      gltfLoaderTimedOutUrls: copyList(source.gltfLoaderTimedOutUrls),
      gltfLoaderLastResourcePath: source.gltfLoaderLastResourcePath || null,
      gltfLoaderUrlModifierCount: source.gltfLoaderUrlModifierCount || 0,
      gltfManagerItemStartCount: source.gltfManagerItemStartCount || 0,
      gltfManagerItemEndCount: source.gltfManagerItemEndCount || 0,
      gltfManagerItemErrorCount: source.gltfManagerItemErrorCount || 0,
      gltfManagerLastStartedUrl: source.gltfManagerLastStartedUrl || null,
      gltfManagerLastCompletedUrl: source.gltfManagerLastCompletedUrl || null,
      gltfManagerLastFailedUrl: source.gltfManagerLastFailedUrl || null,
      gltfDependencyRequestedUrls: copyList(source.gltfDependencyRequestedUrls),
      gltfDependencyCompletedUrls: copyList(source.gltfDependencyCompletedUrls),
      gltfFailedDependencyUrls: copyList(source.gltfFailedDependencyUrls),
      gltfLoaderDebugEvents: copyList(debugEvents).slice(-12),
    };
  }

  function buildWorldRendererDiagnosticsSnapshot(context) {
    const c = context || {};
    const fns = c.fns || {};
    const emptyMap = new Map();
    const emptySet = new Set();
    const threeState = Object.assign({
      meteorMeshes: emptyMap, asteroidMeshes: emptyMap, planetMeshes: emptyMap, cosmicDustMeshes: emptyMap,
      glbTemplateCache: emptyMap, meteorGlbCache: emptyMap, asteroidGlbCache: emptyMap, planetGlbCache: emptyMap,
      meteorTextureWarnings: emptySet, threeObjectRenderPasses: [], glbMaterialAudit: [], lightHelpers: [],
    }, c.threeState || {});
    const constants = c.constants || {};
    const requestedMode = c.requestedMode;
    const effectiveMode = c.effectiveMode;
    const fallbackUsed = !!c.fallbackUsed;
    const fallbackReason = c.fallbackReason || null;
    const lastError = c.lastError || null;
    const initialized = !!c.initialized;
    const renderCalls = c.renderCalls || 0;
    const fallbackCalls = c.fallbackCalls || 0;
    const threeDependencySource = c.threeDependencySource || null;
    const gltfLoaderDiagnostics = c.gltfLoaderDiagnostics || {};
    const windowState = c.windowState || {};
    const METEOR_GLB_ASSETS = constants.METEOR_GLB_ASSETS || {};
    const ASTEROID_GLB_ASSETS = constants.ASTEROID_GLB_ASSETS || {};
    const ASTEROID_GLB_DEFAULT_VARIANT = constants.ASTEROID_GLB_DEFAULT_VARIANT || "asteroid_01";
    const PLANET_GLB_ASSETS = constants.PLANET_GLB_ASSETS || {};
    const PLANET_GLB_DEFAULT_VARIANT = constants.PLANET_GLB_DEFAULT_VARIANT || "planet_01";
    const ASTEROID_GLB_RADIUS_SCALE = constants.ASTEROID_GLB_RADIUS_SCALE ?? 1;
    const MOON_GLB_ASSETS = constants.MOON_GLB_ASSETS || {};
    const noopObj = () => ({});
    const noopArr = () => [];
    const getCanvasDiagnostics = fns.getCanvasDiagnostics || noopObj;
    const getGameCanvasDiagnostics = fns.getGameCanvasDiagnostics || noopObj;
    const getLayerProbe = fns.getLayerProbe || noopObj;
    const getThreeLightsSettings = fns.getThreeLightsSettings || noopObj;
    const getLightDistanceDiagnostics = fns.getLightDistanceDiagnostics || noopObj;
    const roundDiagnosticNumber = fns.roundDiagnosticNumber || ((value) => Number.isFinite(Number(value)) ? Number(value) : null);
    const vectorToDiagnostic = fns.vectorToDiagnostic || (() => null);
    const getStageLightCounts = fns.getStageLightCounts || (() => ({ activeLightCount: 0, diagnosticLightCount: 0, totalLightObjects: 0 }));
    const createGltfDebugProbeDiagnostics = fns.createGltfDebugProbeDiagnostics || noopObj;
    const resolvePublicAssetPath = fns.resolvePublicAssetPath || ((asset) => asset || null);
    const getAsteroidGlbAssetUrl = fns.getAsteroidGlbAssetUrl || (() => null);
    const getPlanetGlbAssetUrl = fns.getPlanetGlbAssetUrl || (() => null);
    const getAsteroidGlbCacheStats = fns.getAsteroidGlbCacheStats || noopObj;
    const summarizeGlbCacheEntries = fns.summarizeGlbCacheEntries || noopArr;
    const getPlanetGlbAssetPath = fns.getPlanetGlbAssetPath || (() => PLANET_GLB_ASSETS[PLANET_GLB_DEFAULT_VARIANT]);
    const createAsteroidGlbTextureDiagnostics = fns.createAsteroidGlbTextureDiagnostics || noopObj;
    const getMeteorGlbVisualScale = fns.getMeteorGlbVisualScale || (() => 1);
    const getMeteorGlbDepthScale = fns.getMeteorGlbDepthScale || (() => 1);
    const getGlobalHelpersEnabled = fns.getGlobalHelpersEnabled || (() => false);
    const getThreeMaterialSettings = fns.getThreeMaterialSettings || noopObj;
    const buildMeteorTexturePalette = fns.buildMeteorTexturePalette || noopArr;
    const getMeteorTexturePassEnabled = fns.getMeteorTexturePassEnabled || (() => false);
    const isMeteorTextureColorEnabled = fns.isMeteorTextureColorEnabled || (() => false);
    const getMeteorTextureCacheStats = fns.getMeteorTextureCacheStats || noopObj;
    const countMeteorTextureUsage = fns.countMeteorTextureUsage || noopObj;
    const countMeteorTextureAssignmentsByColor = fns.countMeteorTextureAssignmentsByColor || noopObj;
    const getMeteorTextureReadinessByColor = fns.getMeteorTextureReadinessByColor || noopObj;
    const getMeteorTextureEvidence = fns.getMeteorTextureEvidence || noopObj;
    const getMaterialAuditOverlayStatus = fns.getMaterialAuditOverlayStatus || noopObj;
    const getMeteorGlbCacheStats = fns.getMeteorGlbCacheStats || noopObj;
    const countMeteorVisualsByColor = fns.countMeteorVisualsByColor || noopObj;
    const getSceneFrameVisible = fns.getSceneFrameVisible || (() => false);

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
      sceneBounds: Object.assign({}, threeState.stageSpotSceneRect || {}),
      screenOffset: { x: lightSettings.mainStageSpotXOffset, y: lightSettings.mainStageSpotYOffset, zHeight: lightSettings.mainStageSpotZHeight },
      computedFrom: "camera_sceneRect_screenSpace",
      helperVisible: !!threeState.lightHelpers.find((entry) => entry.name === "mainStageSpot" && entry.mode === "spotLightHelper" && entry.helper?.visible),
      targetInScene: !!threeState.mainStageSpotTarget?.parent,
      castShadow: !!threeState.mainStageSpot?.castShadow,
    };
    const stageLightingEnabled = lightSettings.mainStageSpotEnabled !== false && mainStageSpotSnapshot.enabled === true;
    const stageLightCounts = getStageLightCounts();
    const rendererCanvas = threeState.renderer?.domElement || threeState.canvas || null;
    const threeRendererWidth = rendererCanvas ? Number(rendererCanvas.width || 0) : 0;
    const threeRendererHeight = rendererCanvas ? Number(rendererCanvas.height || 0) : 0;
    const threeCameraAspect = threeState.camera?.isOrthographicCamera
      ? Math.abs(Number(threeState.camera.right || 0) - Number(threeState.camera.left || 0)) / Math.max(1e-6, Math.abs(Number(threeState.camera.top || 0) - Number(threeState.camera.bottom || 0)))
      : null;
    const threeCameraBounds = threeState.cameraBounds ? Object.assign({}, threeState.cameraBounds) : null;
    return {
      requestedMode, effectiveMode, mode: effectiveMode, fallbackUsed, fallbackReason, lastError, initialized, renderCalls, fallbackCalls, snapshotVersion: "1", diagnosticsSnapshotFallbackUsed: false,
      threeRendererWidth, threeRendererHeight, threeCameraAspect, threeCameraBounds,
      glbLoaderMode: "gltf_loader", glbLoaderPrimary: "GLTFLoader", glbLoaderFallbackUsed: !!threeState.glbLoaderFallbackUsed, glbLoaderFallbackReason: threeState.glbLoaderFallbackReason,
      ...buildGltfLoaderDiagnosticsSnapshot(gltfLoaderDiagnostics, threeState.gltfLoaderDebugEvents),
      glbVisualFallbackActiveCount: Array.from(threeState.meteorMeshes.values()).filter((entry) => !!entry.fallback?.visible).length + Array.from(threeState.asteroidMeshes.values()).filter((entry) => !!entry.fallback?.visible).length + Array.from(threeState.planetMeshes.values()).filter((entry) => !!entry.fallback?.visible).length,
      gltfProbeStarted: !!threeState.gltfDebugProbe?.startedAt,
      gltfProbeStatus: threeState.gltfDebugProbe?.status || "idle",
      gltfProbeUrl: threeState.gltfDebugProbe?.url || null,
      gltfProbeDurationMs: threeState.gltfDebugProbe?.durationMs ?? null,
      gltfProbeMeshCount: threeState.gltfDebugProbe?.meshCount || 0,
      gltfProbeMaterialCount: threeState.gltfDebugProbe?.materialCount || 0,
      gltfProbeTextureCount: threeState.gltfDebugProbe?.textureCount || 0,
      gltfProbeErrorMessage: threeState.gltfDebugProbe?.errorMessage || null,
      gltfDebugProbe: Object.assign({}, threeState.gltfDebugProbe || createGltfDebugProbeDiagnostics()),
      hasThreeImplementation: true, hasThreeDependency: !!threeState.hasDependency, threeDependencySource, threeBridgeVersion: windowState.threeBridgeVersion,
      threeReady: windowState.threeReady, threeSource: windowState.threeSource, threeModuleUrl: windowState.threeModuleUrl,
      threeVendorUrls: copyList(windowState.threeVendorUrls), threeLoadStatus: windowState.threeLoadStatus || "missing",
      threeLoadError: windowState.threeLoadError || null, threeInitialized: !!threeState.initialized, threeCanvasPresent: canvasDiag.present,
      threeCanvasVisible: canvasDiag.visible, threeCanvasDisplay: canvasDiag.display, threeCanvasVisibility: canvasDiag.visibility, threeCanvasOpacity: canvasDiag.opacity, threeCanvasZIndex: canvasDiag.zIndex, threeCanvasPointerEvents: canvasDiag.pointerEvents, threeLastError: threeState.lastError,
      gameCanvasDisplay: gameCanvasDiag.display || "missing", gameCanvasVisibility: gameCanvasDiag.visibility || "missing", gameCanvasOpacity: gameCanvasDiag.opacity || "missing", gameCanvasZIndex: gameCanvasDiag.zIndex || "missing", gameCanvasBackground: gameCanvasDiag.background || "missing", gameCanvasPointerEvents: gameCanvasDiag.pointerEvents || "missing",
      canvasLayerMode, layerProbe,
      threeRenderCalls: threeState.renderCalls, threeResizeCalls: threeState.resizeCalls, threeSceneReady: !!threeState.scene, threeCameraReady: !!threeState.camera, threeRendererReady: !!threeState.renderer,
      threeMeteorRenderEnabled: !!threeState.threeMeteorRenderEnabled, threeMeteorCount: threeState.threeMeteorCount, threeMeteorMeshes: threeState.meteorMeshes.size,
      threeAsteroidRenderEnabled: !!threeState.threeAsteroidRenderEnabled, threeAsteroidCount: threeState.threeAsteroidCount, threeAsteroidMeshes: threeState.asteroidMeshes.size, asteroidMeshCount: threeState.asteroidMeshes.size,
      threePlanetCount: threeState.threePlanetCount, threePlanetSnapshotCount: threeState.threePlanetCount, threePlanetMeshes: threeState.planetMeshes.size,
      rockyPlanetCount: threeState.threeRockyPlanetCount, gasPlanetCount: threeState.threeGasPlanetCount,
      lastRendererError: threeState.lastRendererError || null, threeMeteorLastError: threeState.threeMeteorLastError, threeAsteroidLastError: threeState.threeAsteroidLastError, threePlanetLastError: threeState.threePlanetLastError, threeMoonLastError: threeState.threeMoonLastError || null, threeCosmicDustLastError: threeState.threeCosmicDustLastError || null, threePrgIndicatorLastError: threeState.threePrgIndicatorLastError || null, threeObjectRenderPasses: threeState.threeObjectRenderPasses.slice(),
      threeMeteorRadiusScale: threeState.threeMeteorRadiusScale,
      threeMeteorMinRadius: threeState.threeMeteorMinRadius,
      meteorGlbAssets: METEOR_GLB_ASSETS,
      asteroidGlbAssets: ASTEROID_GLB_ASSETS,
      asteroidGlbAssetUrls: Object.fromEntries(Object.entries(ASTEROID_GLB_ASSETS).map(([variant, asset]) => [variant, resolvePublicAssetPath(asset)])),
      asteroidGlbAsset: ASTEROID_GLB_ASSETS[ASTEROID_GLB_DEFAULT_VARIANT],
      asteroidGlbAssetUrl: getAsteroidGlbAssetUrl(),
      planetGlbAssets: PLANET_GLB_ASSETS,
      planetGlbAsset: PLANET_GLB_ASSETS[PLANET_GLB_DEFAULT_VARIANT],
      planetGlbAssetUrl: getPlanetGlbAssetUrl(),
      asteroidGlbCacheStats: getAsteroidGlbCacheStats(),
      glbTemplateCacheEntries: summarizeGlbCacheEntries(threeState.glbTemplateCache),
      meteorGlbCacheEntries: summarizeGlbCacheEntries(threeState.meteorGlbCache),
      asteroidGlbCacheEntries: summarizeGlbCacheEntries(threeState.asteroidGlbCache),
      glbTemplateCacheSize: threeState.glbTemplateCache.size,
      asteroidGlbCacheSize: threeState.asteroidGlbCache.size,
      asteroidGlbStatuses: Object.fromEntries(Array.from(threeState.asteroidGlbCache.entries()).map(([url, entry]) => [url, entry?.status || "unknown"])),
      asteroidGlbInstanceCreates: threeState.asteroidGlbInstanceCreates,
      planetGlbCacheEntries: summarizeGlbCacheEntries(threeState.planetGlbCache),
      planetGlbCacheSize: threeState.planetGlbCache.size,
      planetGlbStatus: threeState.planetGlbCache.get(getPlanetGlbAssetPath())?.status || "not_requested",
      planetGlbInstanceCreates: threeState.planetGlbInstanceCreates,
      activePlanetGlbInstances: Array.from(threeState.planetMeshes.values()).filter((entry) => !!entry.glb).length,
      activePlanetFallbacks: Array.from(threeState.planetMeshes.values()).filter((entry) => !!entry.fallback?.visible).length,
      activeFallbackPlanetVisuals: Array.from(threeState.planetMeshes.values()).filter((entry) => !!entry.fallback?.visible).length,
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
      firstMeteorCollisionRadius: threeState.firstMeteorSample?.collisionRadius ?? null,
      firstMeteorViewRadius: threeState.firstMeteorSample?.viewRadius ?? null,
      firstAsteroidCollisionRadius: threeState.firstAsteroidSample?.collisionRadius ?? null,
      firstAsteroidViewRadius: threeState.firstAsteroidSample?.viewRadius ?? null,
      firstAsteroidGlbScale: ASTEROID_GLB_RADIUS_SCALE,
      radiusMismatchWarnings: [
        ...(getMeteorGlbVisualScale() !== 1 ? ["meteor_glb_visual_scale_is_visual_only"] : []),
        ...(ASTEROID_GLB_RADIUS_SCALE !== 1 ? ["asteroid_glb_radius_scale_mismatch"] : []),
      ],
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
        blue: { map: buildMeteorTexturePalette("blue", "map"), emissiveMap: buildMeteorTexturePalette("blue", "emissiveMap") },
      },
      meteorTexturePaletteEnabled: getMeteorTexturePassEnabled(getThreeMaterialSettings()),
      redMeteorTexturePaletteEnabled: isMeteorTextureColorEnabled("red", getThreeMaterialSettings()) && getMeteorTexturePassEnabled(getThreeMaterialSettings()),
      yellowMeteorTexturePaletteEnabled: isMeteorTextureColorEnabled("yellow", getThreeMaterialSettings()) && getMeteorTexturePassEnabled(getThreeMaterialSettings()),
      meteorTextureCacheStats: getMeteorTextureCacheStats(),
      meteorTextureUsage: countMeteorTextureUsage(),
      meteorTextureAssignmentsByColor: countMeteorTextureAssignmentsByColor(),
      meteorTextureMapReadyByColor: getMeteorTextureReadinessByColor("map"),
      meteorTextureEmissiveReadyByColor: getMeteorTextureReadinessByColor("emissiveMap"),
      meteorTextureLastError: threeState.meteorTextureDiagnostics?.meteorTextureLastError || null,
      meteorTexturePendingApplyCount: threeState.meteorTextureDiagnostics?.meteorTexturePendingApplyCount || 0,
      meteorTextureInstancesWithExternalMap: threeState.meteorTextureDiagnostics?.meteorTextureInstancesWithExternalMap || 0,
      meteorTextureInstancesWithExternalEmissiveMap: threeState.meteorTextureDiagnostics?.meteorTextureInstancesWithExternalEmissiveMap || 0,
      meteorTextureInstancesSkippedBecauseGlbHadMap: threeState.meteorTextureDiagnostics?.meteorTextureInstancesSkippedBecauseGlbHadMap || 0,
      meteorTextureInstancesSkippedBecauseGlbHadEmissiveMap: threeState.meteorTextureDiagnostics?.meteorTextureInstancesSkippedBecauseGlbHadEmissiveMap || 0,
      meteorTextureEvidence: getMeteorTextureEvidence(),
      meteorTextureWarnings: threeState.meteorTextureWarnings.size,
      redMeteorTexturePalette: buildMeteorTexturePalette("red", "map"),
      redMeteorTexturePaletteEnabled: isMeteorTextureColorEnabled("red", getThreeMaterialSettings()) && getMeteorTexturePassEnabled(getThreeMaterialSettings()),
      redMeteorTextureCacheStats: getMeteorTextureCacheStats(),
      redMeteorTextureUsage: countMeteorTextureUsage()?.red?.map || {},
      redMeteorTextureWarnings: threeState.meteorTextureWarnings.size,
      yellowMeteorTexturePalette: buildMeteorTexturePalette("yellow", "map"),
      yellowMeteorTextureCacheStats: getMeteorTextureCacheStats(),
      yellowMeteorTextureUsage: countMeteorTextureUsage()?.yellow?.map || {},
      blueMeteorTexturePalette: buildMeteorTexturePalette("blue", "map"),
      blueMeteorTexturePaletteEnabled: isMeteorTextureColorEnabled("blue", getThreeMaterialSettings()) && getMeteorTexturePassEnabled(getThreeMaterialSettings()),
      blueMeteorTextureUsage: countMeteorTextureUsage()?.blue?.map || {},
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
      threeLightCountSemantics: "ambient_plus_mainStageSpot_only",
      lightingModelVersion: "stage_spot_v1_absolute",
      stageLighting: {
        enabled: stageLightingEnabled,
        stageLightingEnabled,
        model: "stage_spot_v1_absolute",
        lightingModelVersion: "stage_spot_v1_absolute",
        screenSpaceOffsets: true,
        yOffsetSemantic: "positive_is_screen_down",
        autoAngle: false,
        bodyBoundsUsedForLight: false,
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
      debugMarkerVisible: !!threeState.debugMarker?.visible,
      debugMarkerEnabled: !!threeState.debugMarkerEnabled,
      debugMarkerReason: threeState.debugMarker?.visible ? "global_helpers_and_marker_enabled" : "hidden_by_default_or_debug_disabled",
      cameraBounds: threeState.cameraBounds,
      worldCameraBounds: threeState.worldCameraBounds,
      sceneRect: threeState.sceneRect ? Object.assign({}, threeState.sceneRect) : null,
      cameraPosition: threeState.cameraPosition ? Object.assign({}, threeState.cameraPosition) : vectorToDiagnostic(threeState.camera?.position),
      cameraClip: threeState.cameraClip ? Object.assign({}, threeState.cameraClip) : null,
      activeCameraModel: "absolute_bounds",
      showSceneFrame: getSceneFrameVisible(),
      sceneFrame: { visible: !!threeState.sceneFrame?.visible, helper: "red_dashed_world_space_rect" },
      rendererSize: threeState.rendererSize,
      sceneChildrenCount: threeState.scene?.children?.length || 0,
      meteorGroupChildrenCount: threeState.meteorGroupChildrenCount,
      asteroidGroupChildrenCount: threeState.asteroidGroupChildrenCount,
      planetGroupChildrenCount: threeState.planetGroupChildrenCount,
      moonGroupChildrenCount: threeState.moonGroupChildrenCount,
      harmonicDustGroupChildrenCount: threeState.harmonicDustGroupChildrenCount,
      threeHarmonicDustCount: threeState.threeHarmonicDustCount,
      cosmicDustGroupChildrenCount: threeState.cosmicDustGroupChildrenCount || 0,
      threeCosmicDustMeshes: threeState.cosmicDustMeshes.size,
      prgIndicatorActive: threeState.prgIndicatorActive,
      prgIndicatorRadius: threeState.prgIndicatorRadius,
      prgIndicatorEnabled: threeState.prgIndicatorEnabled,
      threeMoonCount: threeState.threeMoonCount,
      moonGlbAssets: MOON_GLB_ASSETS,
      cameraSnapshotCenter: threeState.cameraSnapshotCenter,
      cameraSnapshotZoom: threeState.cameraSnapshotZoom,
      cameraSnapshotWorldBounds: threeState.cameraSnapshotWorldBounds,
      worldBoundsSource: threeState.worldBoundsSource,
      absoluteBoundsViewport: threeState.absoluteBoundsViewport ? Object.assign({}, threeState.absoluteBoundsViewport) : null,
      threeCameraModel: threeState.threeCameraModel,
      cameraModel: threeState.threeCameraModel,
      stageModelEnabled: !!threeState.stageModelEnabled,
      stageSettings: Object.assign({}, threeState.stageSettings || {}),
      firstMeteorScreenEstimate: threeState.firstMeteorScreenEstimate,
      firstMeteorInCameraBounds: threeState.firstMeteorInCameraBounds,
    };
  }



  window.HC.WorldRendererDiagnosticsSnapshot = { buildGltfLoaderDiagnosticsSnapshot, buildWorldRendererDiagnosticsSnapshot };
}());
