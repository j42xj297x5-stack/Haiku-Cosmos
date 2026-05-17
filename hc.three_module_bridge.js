// Local Three.js ESM bridge (Stage 2.75+ diagnostics)
(function initThreeBridgeGlobals() {
  if (typeof window === "undefined") return;
  window.HC_THREE = null;
  window.HC_THREE_READY = false;
  window.HC_THREE_SOURCE = "local_vendor_esm";
  window.HC_THREE_LOAD_STATUS = "loading";
  window.HC_THREE_LOAD_ERROR = null;
  window.HC_THREE_MODULE_URL = new URL("./vendor/three/three.module.min.js", import.meta.url).href;
})();

if (typeof window !== "undefined" && window.location && window.location.protocol === "file:") {
  window.HC_THREE_LOAD_ERROR = "ESM Three vendor requires local dev server, not file://";
}

(async function loadThreeModule() {
  try {
    const preflight = await fetch(window.HC_THREE_MODULE_URL, { method: "GET" });
    if (!preflight.ok) {
      window.HC_THREE_READY = false;
      window.HC_THREE_SOURCE = "local_vendor_esm_failed";
      window.HC_THREE_LOAD_STATUS = "failed";
      window.HC_THREE_LOAD_ERROR = "Three module fetch failed: HTTP " + preflight.status + " " + preflight.statusText + " " + window.HC_THREE_MODULE_URL;
      return;
    }

    const module = await import(window.HC_THREE_MODULE_URL);
    const THREE = module && module.default ? module.default : module;
    window.HC_THREE = THREE;
    window.HC_THREE_READY = true;
    window.HC_THREE_SOURCE = "local_vendor_esm";
    window.HC_THREE_LOAD_STATUS = "ready";
    window.HC_THREE_LOAD_ERROR = null;
    if (typeof window !== "undefined") {
      window.THREE = window.THREE || THREE;
    }
  } catch (error) {
    window.HC_THREE_READY = false;
    window.HC_THREE_SOURCE = "local_vendor_esm_failed";
    window.HC_THREE_LOAD_STATUS = "failed";
    window.HC_THREE_LOAD_ERROR = String(error && (error.stack || error.message || error));
  }
})();
