import * as THREE from "./vendor/three/three.module.min.js";

// Local Three.js ESM bridge (Stage 2.75+ diagnostics)
(function initThreeBridgeGlobals() {
  if (typeof window === "undefined") return;
  window.HC_THREE = THREE;
  window.HC_THREE_READY = true;
  window.HC_THREE_SOURCE = "local_vendor_esm";
  window.HC_THREE_LOAD_STATUS = "ready";
  window.HC_THREE_LOAD_ERROR = null;
  window.HC_THREE_MODULE_URL = new URL("./vendor/three/three.module.min.js", import.meta.url).href;
  window.HC_THREE_BRIDGE_VERSION = "esm_static_import_v1";
  window.THREE = window.THREE || THREE;

  if (window.location && window.location.protocol === "file:") {
    window.HC_THREE_LOAD_ERROR = "ESM Three vendor requires local dev server, not file://";
  }
})();
