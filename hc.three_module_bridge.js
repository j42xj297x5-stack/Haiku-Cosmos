// Local Three.js ESM bridge (Stage 2.75+ diagnostics)
(function initThreeBridgeGlobals() {
  if (typeof window === "undefined") return;
  window.HC_THREE = null;
  window.HC_THREE_READY = false;
  window.HC_THREE_SOURCE = "local_vendor_esm";
  window.HC_THREE_LOAD_STATUS = "loading";
  window.HC_THREE_LOAD_ERROR = null;
})();

if (typeof window !== "undefined" && window.location && window.location.protocol === "file:") {
  window.HC_THREE_LOAD_ERROR = "ESM Three vendor requires local dev server, not file://";
}

import("./vendor/three/three.module.min.js")
  .then((module) => {
    const THREE = module && module.default ? module.default : module;
    window.HC_THREE = THREE;
    window.HC_THREE_READY = true;
    window.HC_THREE_SOURCE = "local_vendor_esm";
    window.HC_THREE_LOAD_STATUS = "ready";
    window.HC_THREE_LOAD_ERROR = null;
    if (typeof window !== "undefined") {
      window.THREE = window.THREE || THREE;
    }
  })
  .catch((error) => {
    window.HC_THREE_READY = false;
    window.HC_THREE_SOURCE = "local_vendor_esm";
    window.HC_THREE_LOAD_STATUS = "failed";
    const message = String(error && (error.message || error));
    const protocolHint = typeof window !== "undefined" && window.location && window.location.protocol === "file:"
      ? " ESM Three vendor requires local dev server, not file://"
      : "";
    window.HC_THREE_LOAD_ERROR = (message + protocolHint).trim();
  });
