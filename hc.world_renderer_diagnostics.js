// HC world renderer diagnostics helpers (debug/optional)
(function () {
  window.HC = window.HC || {};

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
      gltfLoaderLastResourcePath: null,
      gltfLoaderUrlModifierCount: 0,
      gltfManagerItemStartCount: 0,
      gltfManagerItemEndCount: 0,
      gltfManagerItemErrorCount: 0,
      gltfManagerLastStartedUrl: null,
      gltfManagerLastCompletedUrl: null,
      gltfManagerLastFailedUrl: null,
      gltfDependencyRequestedUrls: [],
      gltfDependencyCompletedUrls: [],
      gltfFailedDependencyUrls: [],
    };
  }

  function createGltfDebugProbeDiagnostics(asset = "glb/meteor_red_form_core_01.glb") {
    return { enabled: true, asset, url: null, status: "idle", startedAt: null, durationMs: null, meshCount: 0, materialCount: 0, textureCount: 0, errorMessage: null };
  }

  function createAsteroidGlbTextureDiagnostics() {
    return { asteroidGlbEmbeddedTextureCount: 0, asteroidGlbTextureReadyCount: 0, asteroidGlbTextureMissingImageCount: 0, asteroidGlbTextureFallbackMaterialCount: 0, asteroidGlbLoaderMode: "gltf_loader", imageBufferViewCount: 0, imageUriCount: 0, imageDataUriCount: 0, imagePngCount: 0, imageJpegCount: 0, imageUnsupportedMimeCount: 0, lastAssetUrl: null, lastError: null };
  }

  function createMeteorTextureDiagnostics() {
    return {
      enabled: true, materialMode: "imported", eligibleInstances: 0, applyAttempts: 0, applySkippedAlreadyCurrent: 0,
      reapplyDueToMissingMap: 0, reapplyDueToMaterialModeChange: 0, reapplyDueToToggleChange: 0, reapplyDueToNewEntry: 0,
      textureLoadRequests: 0, cacheLoading: 0, cacheReady: 0, cacheFailed: 0, sceneMeshesVisited: 0, redYellowSceneMeshesVisited: 0,
      materialSlotsVisited: 0, materialSlotsWithMap: 0, materialSlotsWithEmissiveMap: 0, materialSlotsWithMapImage: 0,
      materialSlotsWithEmissiveImage: 0, materialsVisited: 0, materialsConvertedToStandard: 0, materialConversions: 0,
      appliedThisFrame: 0, mapApplied: 0, emissiveMapApplied: 0, activeGlbEntries: 0, activeGlbEntriesWithSceneObject: 0,
      activeGlbEntriesWithColor: 0, activeGlbEntriesMissingColor: 0, activeGlbEntriesUnsupportedColor: 0, activeGlbEntriesEligibleRedYellow: 0,
      sourceMeteorColorSamples: [], entryColorFieldSamples: [], skippedMissingColor: 0, skippedUnsupportedColor: 0, syncActiveEntriesCalls: 0,
      mapLostAfterApply: 0, emissiveMapLostAfterApply: 0, strippedAfterApply: 0, lastAppliedColor: null, lastAppliedMapUrl: null,
      lastAppliedEmissiveMapUrl: null, lastFallbackReason: null, meteorTextureAssignmentsByColor: {}, meteorTextureMapReadyByColor: {},
      meteorTextureEmissiveReadyByColor: {}, meteorTextureLastError: null, meteorTexturePendingApplyCount: 0,
      meteorTextureInstancesWithExternalMap: 0, meteorTextureInstancesWithExternalEmissiveMap: 0,
      meteorTextureInstancesSkippedBecauseGlbHadMap: 0, meteorTextureInstancesSkippedBecauseGlbHadEmissiveMap: 0,
    };
  }

  function formatGlbError(error) { if (!error) return "Unknown GLTFLoader error"; if (typeof error === "string") return error; return error.message || error.statusText || error.type || String(error); }
  function safeGlbErrorStack(error) { const stack = typeof error?.stack === "string" ? error.stack : null; return stack ? stack.slice(0, 4000) : null; }
  function safeGlbErrorName(error) { return error?.name || error?.type || (error ? typeof error : null); }
  function pushUniqueLimited(list, value, limit = 20) { if (!value || !Array.isArray(list)) return list; const existingIndex = list.indexOf(value); if (existingIndex >= 0) list.splice(existingIndex, 1); list.push(value); while (list.length > limit) list.shift(); return list; }
  function removeFromList(list, value) { if (!value || !Array.isArray(list)) return list; const index = list.indexOf(value); if (index >= 0) list.splice(index, 1); return list; }

  window.HC.WorldRendererDiagnostics = { createGltfLoaderDiagnostics, createGltfDebugProbeDiagnostics, createAsteroidGlbTextureDiagnostics, createMeteorTextureDiagnostics, formatGlbError, safeGlbErrorStack, safeGlbErrorName, pushUniqueLimited, removeFromList };
}());
