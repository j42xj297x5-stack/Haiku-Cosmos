// Local Three.js ESM bridge with always-on diagnostics (v3)
(function initThreeBridgeGlobals() {
  if (typeof window === "undefined") return;

  window.HC_THREE_BRIDGE_VERSION = "esm_dynamic_diagnostic_v4";
  window.HC_THREE_SOURCE = "local_vendor_esm";
  window.HC_THREE_READY = false;
  window.HC_THREE_LOAD_STATUS = "loading";
  window.HC_THREE_LOAD_ERROR = null;
  window.HC_THREE_MODULE_URL = new URL("./vendor/three/three.module.min.js", import.meta.url).href;
  window.HC_THREE_CORE_URL = new URL("./vendor/three/three.core.min.js", import.meta.url).href;

  const moduleUrl = window.HC_THREE_MODULE_URL;
  const coreUrl = window.HC_THREE_CORE_URL;

  if (window.location && window.location.protocol === "file:") {
    window.HC_THREE_LOAD_STATUS = "failed";
    window.HC_THREE_LOAD_ERROR = "ESM Three vendor requires local dev server, not file://";
    return;
  }

  (async function loadThreeModule() {
    try {
      const targets = [
        { label: "three.module.min.js", url: moduleUrl },
        { label: "three.core.min.js", url: coreUrl },
      ];

      for (const target of targets) {
        const preflight = await fetch(target.url, { method: "GET", cache: "no-store" });
        if (!preflight.ok) {
          window.HC_THREE_LOAD_STATUS = "failed";
          window.HC_THREE_LOAD_ERROR = `Three vendor preflight failed: ${target.label} HTTP ${preflight.status} ${preflight.statusText} ${target.url}`;
          return;
        }
      }

      const moduleNs = await import(moduleUrl);
      window.HC_THREE = moduleNs;
      window.THREE = window.THREE || moduleNs;
      window.HC_THREE_READY = true;
      window.HC_THREE_LOAD_STATUS = "ready";
      window.HC_THREE_LOAD_ERROR = null;
    } catch (error) {
      window.HC_THREE_READY = false;
      window.HC_THREE_LOAD_STATUS = "failed";
      window.HC_THREE_LOAD_ERROR = String(error && (error.stack || error.message || error));
    }
  })();
})();
