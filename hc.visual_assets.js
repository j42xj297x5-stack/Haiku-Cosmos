// Haiku Cosmos visual asset loader v0.1 (manifest + cache + safe draw helpers).
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  var DEFAULT_MANIFEST_URL = "assets/visual/modular_frame_kit_v01_manifest.json";
  var manifest = null;
  var assetsByName = new Map();
  var imageCache = new Map();
  var failedAssets = new Set();
  var lastError = null;

  function toStringSafe(value) {
    return typeof value === "string" ? value : "";
  }

  function setError(error) {
    lastError = error ? String(error.message || error) : null;
  }

  function normalizeAsset(asset) {
    if (!asset || typeof asset !== "object") return null;
    var logicalName = toStringSafe(asset.logicalName).trim();
    var path = toStringSafe(asset.path).trim();
    if (!logicalName || !path) return null;
    return Object.assign({}, asset, { logicalName: logicalName, path: path });
  }

  function canUseImage() {
    return typeof root.Image === "function";
  }

  function normalizeAssetUrl(path) {
    var value = toStringSafe(path).trim();
    if (!value) return null;
    if (/^https?:\/\//i.test(value)) return value;
    if (value.charAt(0) === "/") return value;
    if (value.indexOf("assets/") === 0) return "/" + value;
    return value;
  }

  function loadImage(url) {
    return new Promise(function (resolve) {
      if (!canUseImage()) {
        resolve({ ok: false, error: "Image constructor unavailable" });
        return;
      }
      if (!url) {
        resolve({ ok: false, error: "Image URL unavailable" });
        return;
      }

      var image = new root.Image();
      var settled = false;

      function finish(result) {
        if (settled) return;
        settled = true;
        resolve(result);
      }

      image.onload = function () {
        finish({ ok: true, image: image });
      };

      image.onerror = function () {
        finish({ ok: false, error: "Image failed to load" });
      };

      image.src = url;
      if (image.complete && image.naturalWidth > 0) {
        finish({ ok: true, image: image });
      }
    });
  }

  var VisualAssets = {
    version: "0.1.0",
    status: "idle",

    async loadManifest(url) {
      var manifestUrl = toStringSafe(url).trim() || DEFAULT_MANIFEST_URL;
      this.status = "loading_manifest";
      setError(null);

      try {
        if (typeof root.fetch !== "function") {
          throw new Error("fetch unavailable");
        }

        var response = await root.fetch(manifestUrl, { cache: "no-store" });
        if (!response || !response.ok) {
          throw new Error("manifest request failed: " + (response ? response.status : "unknown"));
        }

        var parsed = await response.json();
        var nextMap = new Map();
        var list = Array.isArray(parsed && parsed.assets) ? parsed.assets : [];

        for (var i = 0; i < list.length; i += 1) {
          var normalized = normalizeAsset(list[i]);
          if (!normalized) continue;
          nextMap.set(normalized.logicalName, normalized);
        }

        manifest = parsed;
        assetsByName = nextMap;
        this.status = "manifest_ready";
        return {
          ok: true,
          manifestLoaded: true,
          assetCount: nextMap.size,
          url: manifestUrl
        };
      } catch (error) {
        manifest = null;
        assetsByName = new Map();
        this.status = "manifest_error";
        setError(error);
        return {
          ok: false,
          manifestLoaded: false,
          assetCount: 0,
          url: manifestUrl,
          error: lastError
        };
      }
    },

    getManifest() {
      return manifest;
    },

    getAsset(logicalName) {
      return assetsByName.get(toStringSafe(logicalName)) || null;
    },

    getAssetPath(logicalName) {
      var asset = this.getAsset(logicalName);
      return asset ? asset.path : null;
    },

    getAssetUrl(logicalName) {
      return normalizeAssetUrl(this.getAssetPath(logicalName));
    },

    async preload(logicalNames) {
      var summary = { loaded: 0, failed: 0, skipped: 0 };

      if (!manifest || assetsByName.size === 0) {
        summary.skipped += 1;
        return summary;
      }

      var names;
      if (Array.isArray(logicalNames) && logicalNames.length > 0) {
        names = logicalNames.slice();
      } else {
        names = Array.from(assetsByName.keys());
      }

      this.status = "preloading";
      for (var i = 0; i < names.length; i += 1) {
        var logicalName = toStringSafe(names[i]).trim();
        if (!logicalName) {
          summary.skipped += 1;
          continue;
        }

        var asset = assetsByName.get(logicalName);
        if (!asset || !asset.path) {
          summary.skipped += 1;
          continue;
        }

        if (imageCache.has(logicalName)) {
          summary.skipped += 1;
          continue;
        }

        var assetUrl = this.getAssetUrl(logicalName);
        if (!assetUrl) {
          summary.failed += 1;
          failedAssets.add(logicalName);
          setError("asset URL unavailable");
          continue;
        }

        var result = await loadImage(assetUrl);
        if (result.ok && result.image) {
          imageCache.set(logicalName, result.image);
          failedAssets.delete(logicalName);
          summary.loaded += 1;
        } else {
          failedAssets.add(logicalName);
          summary.failed += 1;
          setError(result.error || "unknown preload failure");
        }
      }

      this.status = "manifest_ready";
      return summary;
    },

    getImage(logicalName) {
      return imageCache.get(toStringSafe(logicalName)) || null;
    },

    drawImage(ctx, logicalName, x, y, w, h, options) {
      if (!ctx || typeof ctx.drawImage !== "function") return false;

      var image = this.getImage(logicalName);
      if (!image) return false;

      var width = Number.isFinite(w) ? w : image.naturalWidth || image.width || 0;
      var height = Number.isFinite(h) ? h : image.naturalHeight || image.height || 0;
      if (!(width > 0) || !(height > 0)) return false;

      var drawOptions = options && typeof options === "object" ? options : {};
      var alpha = Number.isFinite(drawOptions.alpha) ? drawOptions.alpha : 1;
      var composite = toStringSafe(drawOptions.composite);
      var sourceRect = drawOptions.sourceRect && typeof drawOptions.sourceRect === "object" ? drawOptions.sourceRect : null;

      ctx.save();
      try {
        if (alpha !== 1) ctx.globalAlpha = alpha;
        if (composite) ctx.globalCompositeOperation = composite;

        if (sourceRect) {
          var sx = Number.isFinite(sourceRect.x) ? sourceRect.x : 0;
          var sy = Number.isFinite(sourceRect.y) ? sourceRect.y : 0;
          var sw = Number.isFinite(sourceRect.w) ? sourceRect.w : image.naturalWidth || image.width;
          var sh = Number.isFinite(sourceRect.h) ? sourceRect.h : image.naturalHeight || image.height;
          ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
        } else {
          ctx.drawImage(image, x, y, width, height);
        }

        return true;
      } catch (error) {
        setError(error);
        return false;
      } finally {
        ctx.restore();
      }
    },

    isReady() {
      return !!manifest;
    },

    getDiagnostics() {
      return {
        manifestLoaded: !!manifest,
        assetCount: assetsByName.size,
        cachedCount: imageCache.size,
        failedCount: failedAssets.size,
        lastError: lastError,
        normalizeAssetUrl: true
      };
    }
  };

  root.HC.VisualAssets = VisualAssets;
})(typeof window !== "undefined" ? window : globalThis);
