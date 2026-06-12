import { publicPath } from "./hc.public_path.js";

export const SUBMETA_LAYOUT_SETTING_PATHS = Object.freeze({
  placeholders: "settings/submeta-placeholders.json",
  panels: "settings/submeta-placeholders-panels.json",
  pngLayout: "settings/submeta-png-layout-export.json"
});

export async function loadSubMetaLayoutSetting(logicalPath, options = {}) {
  const resolvedUrl = publicPath(logicalPath);
  let status = null;

  try {
    const response = await fetch(resolvedUrl, { cache: "no-cache", ...options.fetchOptions });
    status = response.status;
    if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());

    const payload = await response.json();
    if (typeof options.validate === "function" && !options.validate(payload)) {
      throw new Error(options.invalidMessage || "Runtime setting JSON has an invalid structure");
    }
    console.info("[HC.SubMetaSettings] runtime setting loaded", {
      logicalPath,
      resolvedUrl,
      status,
      success: true,
      fallbackUsed: false
    });
    return { ok: true, payload, logicalPath, resolvedUrl, status, fallbackUsed: false };
  } catch (error) {
    console.warn("[HC.SubMetaSettings] runtime setting load failed; using fallback", {
      logicalPath,
      resolvedUrl,
      status,
      success: false,
      fallbackUsed: true,
      error
    });
    return { ok: false, payload: null, logicalPath, resolvedUrl, status, fallbackUsed: true, error };
  }
}

if (typeof window !== "undefined") {
  window.HC = window.HC || {};
  window.HC.SubMetaSettings = Object.freeze({
    paths: SUBMETA_LAYOUT_SETTING_PATHS,
    loadJson: loadSubMetaLayoutSetting
  });
}
