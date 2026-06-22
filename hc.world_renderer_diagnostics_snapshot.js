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

  window.HC.WorldRendererDiagnosticsSnapshot = { buildGltfLoaderDiagnosticsSnapshot };
}());
