(function (root) {
  "use strict";

  root.HC = root.HC || {};

  function detectPublicBaseUrl() {
    const currentScript = root.document?.currentScript;
    if (currentScript?.src) {
      const scriptUrl = new URL(currentScript.src, root.document.baseURI);
      const runtimeMarker = "/runtime/hc.public_path.js";
      const markerIndex = scriptUrl.pathname.lastIndexOf(runtimeMarker);
      if (markerIndex >= 0) return `${scriptUrl.pathname.slice(0, markerIndex + 1)}`;
    }

    const baseUrl = new URL(root.document?.baseURI || root.location?.href || "/", root.location?.href || "http://localhost/");
    return baseUrl.pathname.endsWith("/") ? baseUrl.pathname : `${baseUrl.pathname}/`;
  }

  const publicBaseUrl = detectPublicBaseUrl();

  function publicPath(path = "") {
    const cleanPath = String(path)
      .replace(/^\/+/, "")
      .replace(/^public\//, "");

    return `${publicBaseUrl}${cleanPath}`;
  }

  root.HC.publicPath = publicPath;
  root.HC.publicAssetPath = publicPath;
  root.HC.publicBaseUrl = publicBaseUrl;
})(window);
