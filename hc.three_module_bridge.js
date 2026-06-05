// Local Three.js ESM vendor bridge with preflight diagnostics (v5 + GLTFLoader)
(function initThreeBridgeGlobals() {
  if (typeof window === "undefined") return;

  window.HC_THREE_BRIDGE_VERSION = "esm_vendor_probe_v5_gltf_loader";
  window.HC_THREE_SOURCE = "local_vendor_esm";
  window.HC_THREE_READY = false;
  window.HC_THREE_LOAD_STATUS = "loading";
  window.HC_THREE_LOAD_ERROR = null;
  window.HC_THREE_MODULE_URL = new URL("./vendor/three/three.module.min.js", import.meta.url).href;
  window.HC_GLTF_LOADER_MODULE_URL = new URL("./vendor/loaders/GLTFLoader.js", import.meta.url).href;
  window.HC_THREE_VENDOR_URLS = [
    window.HC_THREE_MODULE_URL,
    new URL("./vendor/three/three.core.min.js", import.meta.url).href,
    window.HC_GLTF_LOADER_MODULE_URL
  ];

  if (window.location && window.location.protocol === "file:") {
    window.HC_THREE_LOAD_STATUS = "failed";
    window.HC_THREE_LOAD_ERROR = "ESM Three vendor requires local dev server, not file://";
    return;
  }

  (async function loadThreeModule() {
    try {
      for (const url of window.HC_THREE_VENDOR_URLS) {
        const response = await fetch(url, { method: "GET", cache: "no-store" });
        if (!response.ok) {
          window.HC_THREE_LOAD_STATUS = "failed";
          window.HC_THREE_LOAD_ERROR = `Three vendor preflight failed: HTTP ${response.status} ${response.statusText} ${url}`;
          window.HC_THREE_READY = false;
          return;
        }
      }

      const moduleNs = await import(window.HC_THREE_MODULE_URL);
      const loaderNs = await import(window.HC_GLTF_LOADER_MODULE_URL);
      window.HC_THREE = moduleNs;
      window.HC_GLTFLoader = loaderNs.GLTFLoader;
      window.THREE = window.THREE || moduleNs;
      window.HC_THREE_READY = true;
      window.HC_THREE_LOAD_STATUS = "ready";
      window.HC_THREE_LOAD_ERROR = null;
      window.HC_THREE_SOURCE = "local_vendor_esm";
    } catch (error) {
      window.HC_THREE_READY = false;
      window.HC_THREE_LOAD_STATUS = "failed";
      window.HC_THREE_LOAD_ERROR = String(error && (error.stack || error.message || error));
    }
  })();
})();
