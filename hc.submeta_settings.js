(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const SETTINGS_PATHS = Object.freeze({
    placeholders: "settings/submeta-placeholders.json",
    panels: "settings/submeta-placeholders-panels.json",
    pngLayout: "settings/submeta-png-layout.json",
    uiTypography: "settings/ui-typography.json"
  });

  function getLogicalPath(settingKey) {
    return SETTINGS_PATHS[settingKey] || null;
  }

  function resolveSettingUrl(logicalPath) {
    const resolvePublicPath = root.HC?.publicPath || root.HC?.publicAssetPath;
    if (typeof resolvePublicPath !== "function") {
      throw new Error("HC.publicPath is unavailable");
    }
    const resolved = resolvePublicPath(logicalPath);
    return typeof root.HC?.withBuildVersion === "function" ? root.HC.withBuildVersion(resolved) : resolved;
  }

  function failureResult(failureKind, error, context) {
    const result = {
      ok: false,
      payload: null,
      logicalPath: context.logicalPath,
      resolvedUrl: context.resolvedUrl,
      status: context.status,
      success: false,
      fallbackUsed: true,
      failureKind,
      error
    };
    console.warn(`[HC.SubMetaSettings] ${failureKind}; fallback used`, result);
    return result;
  }

  async function loadJsonSetting(logicalPath, options = {}) {
    let resolvedUrl = null;
    let status = null;

    try {
      resolvedUrl = resolveSettingUrl(logicalPath);
    } catch (error) {
      return failureResult("public path unavailable", error, { logicalPath, resolvedUrl, status });
    }

    let response;
    try {
      response = await root.fetch(resolvedUrl, { cache: "no-cache", ...options.fetchOptions });
      status = response.status;
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    } catch (error) {
      return failureResult("fetch failed", error, { logicalPath, resolvedUrl, status });
    }

    let payload;
    try {
      payload = JSON.parse(await response.text());
    } catch (error) {
      return failureResult("invalid JSON", error, { logicalPath, resolvedUrl, status });
    }

    if (typeof options.validate === "function" && !options.validate(payload)) {
      const error = new Error(options.invalidMessage || "Runtime setting JSON has an invalid structure");
      return failureResult("invalid JSON structure", error, { logicalPath, resolvedUrl, status });
    }

    const result = {
      ok: true,
      payload,
      logicalPath,
      resolvedUrl,
      status,
      success: true,
      fallbackUsed: false,
      failureKind: null
    };
    console.info("[HC.SubMetaSettings] settings loaded successfully", {
      logicalPath,
      resolvedUrl,
      status,
      success: true,
      fallbackUsed: false
    });
    return result;
  }

  root.HC.SubMetaSettings = Object.freeze({
    paths: SETTINGS_PATHS,
    SETTINGS_PATHS,
    getLogicalPath,
    loadJson: loadJsonSetting,
    loadJsonSetting
  });

  console.info("[HC.SubMetaSettings] loaded", {
    available: !!root.HC.SubMetaSettings,
    publicPathAvailable: typeof root.HC.publicPath === "function",
    paths: SETTINGS_PATHS
  });
})(window);
