(function (root) {
  "use strict";

  root.HC = root.HC || {};

  function isUntouchedUrl(value) {
    return /^(?:data:|blob:|https?:|\/\/)/i.test(value);
  }

  function splitUrlSuffix(value) {
    const hashIndex = value.indexOf("#");
    const beforeHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
    const hash = hashIndex >= 0 ? value.slice(hashIndex) : "";
    const queryIndex = beforeHash.indexOf("?");
    return {
      pathname: queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash,
      query: queryIndex >= 0 ? beforeHash.slice(queryIndex) : "",
      hash
    };
  }

  function normalizeBase(base) {
    const value = String(base || "");
    return value.endsWith("/") ? value : `${value}/`;
  }

  function detectPublicBaseUrl() {
    const buildAssetBase = root.HC_BUILD_INFO?.assetBase;
    if (buildAssetBase) return normalizeBase(buildAssetBase);

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
    const value = String(path || "");
    if (!value || isUntouchedUrl(value)) return value;
    const parts = splitUrlSuffix(value);
    const cleanPath = parts.pathname.replace(/^\/+/, "").replace(/^public\//, "");
    return `${publicBaseUrl}${cleanPath}${parts.query}${parts.hash}`;
  }

  function withBuildVersion(url) {
    const value = String(url || "");
    if (!value || isUntouchedUrl(value)) return value;
    const buildId = root.HC_BUILD_INFO?.id;
    const assetBase = root.HC_BUILD_INFO?.assetBase || "";
    if (!buildId || (assetBase && assetBase.includes(buildId))) return value;
    try {
      const baseHref = root.document?.baseURI || root.location?.href || "http://localhost/";
      const parsed = new URL(value, baseHref);
      const baseOrigin = new URL(baseHref).origin;
      if (parsed.origin !== baseOrigin || parsed.searchParams.has("v")) return value;
      parsed.searchParams.set("v", buildId);
      if (/^[./]/.test(value)) return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      return `${parsed.pathname.replace(publicBaseUrl, "")}${parsed.search}${parsed.hash}`;
    } catch (_error) {
      return value;
    }
  }

  root.HC.publicPath = publicPath;
  root.HC.publicAssetPath = publicPath;
  root.HC.publicBaseUrl = publicBaseUrl;
  root.HC.withBuildVersion = withBuildVersion;
})(window);
