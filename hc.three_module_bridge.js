const publicPath = window.HC?.publicPath;
if (typeof publicPath !== "function") {
  throw new Error(`HC_BOOT_PUBLIC_PATH_ORDER: hc.publicPath missing (build=${window.HC_BUILD_INFO?.id || "unknown"}, appPath=${window.HC_BUILD_INFO?.appPath || "unknown"}, assetBase=${window.HC_BUILD_INFO?.assetBase || "unknown"}, manifestBridgeIndex=${window.HC_RELEASE_BOOTSTRAP?.manifestBridgeIndex ?? "unknown"}, HC=${Boolean(window.HC)}, publicPath=${typeof window.HC?.publicPath})`);
}

const THREE_MODULE_PUBLIC_PATH = "vendor/three/three.module.min.js";
const GLTF_LOADER_PUBLIC_PATH = "vendor/loaders/GLTFLoader.js";

// Local Three.js ESM vendor bridge with base-aware public URLs and preflight diagnostics.
(function initThreeBridgeGlobals() {
  if (typeof window === "undefined") return;

  window.HC_THREE_BRIDGE_VERSION = "esm_public_vendor_v7_base_aware";
  window.HC_THREE_SOURCE = "public_vendor_esm";
  window.HC_THREE_READY = false;
  window.HC_THREE_LOAD_STATUS = "loading";
  window.HC_THREE_LOAD_ERROR = null;
  window.HC_THREE_MODULE_PATH = THREE_MODULE_PUBLIC_PATH;
  window.HC_GLTF_LOADER_MODULE_PATH = GLTF_LOADER_PUBLIC_PATH;
  window.HC_THREE_MODULE_URL = publicPath(THREE_MODULE_PUBLIC_PATH);
  window.HC_GLTF_LOADER_MODULE_URL = publicPath(GLTF_LOADER_PUBLIC_PATH);
  window.HC_GLTF_LOADER_IMPORT_STATUS = "loading";
  window.HC_GLTF_LOADER_IMPORT_ERROR = null;
  window.HC_THREE_VENDOR_URLS = [window.HC_THREE_MODULE_URL, window.HC_GLTF_LOADER_MODULE_URL];

  if (window.location && window.location.protocol === "file:") {
    window.HC_THREE_LOAD_STATUS = "failed";
    window.HC_THREE_LOAD_ERROR = "ESM Three vendor requires local dev server, not file://";
    window.HC_GLTF_LOADER_IMPORT_STATUS = "failed";
    window.HC_GLTF_LOADER_IMPORT_ERROR = window.HC_THREE_LOAD_ERROR;
    return;
  }

  window.HC_THREE_BRIDGE_READY = (async function loadThreeModule() {
    try {
      for (const url of window.HC_THREE_VENDOR_URLS) {
        const response = await fetch(url, { method: "GET", cache: "no-store" });
        if (!response.ok) {
          window.HC_THREE_LOAD_STATUS = "failed";
          window.HC_THREE_LOAD_ERROR = `Three vendor preflight failed: HTTP ${response.status} ${response.statusText} ${url}`;
          window.HC_GLTF_LOADER_IMPORT_STATUS = url === window.HC_GLTF_LOADER_MODULE_URL ? "failed" : window.HC_GLTF_LOADER_IMPORT_STATUS;
          window.HC_GLTF_LOADER_IMPORT_ERROR = url === window.HC_GLTF_LOADER_MODULE_URL ? window.HC_THREE_LOAD_ERROR : window.HC_GLTF_LOADER_IMPORT_ERROR;
          window.HC_THREE_READY = false;
          return;
        }
      }

      const moduleNs = await import(/* @vite-ignore */ window.HC_THREE_MODULE_URL);
      const loaderNs = await import(/* @vite-ignore */ window.HC_GLTF_LOADER_MODULE_URL);
      window.HC_THREE = moduleNs;
      window.HC_GLTFLoader = loaderNs.GLTFLoader;
      window.HC_GLTF_LOADER_IMPORT_STATUS = typeof loaderNs.GLTFLoader === "function" ? "ready" : "failed";
      window.HC_GLTF_LOADER_IMPORT_ERROR = typeof loaderNs.GLTFLoader === "function" ? null : "GLTFLoader export is not a function";
      window.THREE = window.THREE || moduleNs;
      window.HC_THREE_READY = true;
      window.HC_THREE_LOAD_STATUS = "ready";
      window.HC_THREE_LOAD_ERROR = null;
    } catch (error) {
      window.HC_THREE_READY = false;
      window.HC_THREE_LOAD_STATUS = "failed";
      window.HC_THREE_LOAD_ERROR = String(error && (error.stack || error.message || error));
      window.HC_GLTF_LOADER_IMPORT_STATUS = "failed";
      window.HC_GLTF_LOADER_IMPORT_ERROR = window.HC_THREE_LOAD_ERROR;
    }
  })();
})();
