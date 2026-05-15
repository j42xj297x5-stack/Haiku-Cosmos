(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const DEFAULTS = {
    manifestUrl: "/assets/visual/prg/prg_frame_manifest.json",
    assetBaseUrl: "/assets/visual/prg/svg/frame_parts/",
    mode: "sourceCutRectFitProbe",
    debugGoldTint: "#d4af37",
    tintAlpha: 0.88
  };

  const state = {
    requested: false,
    status: "idle",
    assets: [],
    imageById: new Map(),
    loaded: 0,
    failed: 0,
    warnings: [],
    lastManifestError: null
  };

  function toNum(value) { return Number(value); }
  function finite(value) { return Number.isFinite(value); }

  function joinAssetUrl(baseUrl, file) {
    if (!baseUrl || !file) return null;
    return String(baseUrl).replace(/\/+$/, "") + "/" + String(file).replace(/^\/+/, "");
  }

  function isValidRect(rect) {
    return !!rect && finite(rect.x) && finite(rect.y) && finite(rect.w) && finite(rect.h) && rect.w > 0 && rect.h > 0;
  }

  function computeLayout(manifest, targetRect, options) {
    const opts = options && typeof options === "object" ? options : {};
    const requestedMode = typeof opts.mode === "string" ? opts.mode : DEFAULTS.mode;
    const warnings = [];
    const assets = Array.isArray(manifest && manifest.assets) ? manifest.assets : [];
    const mode = requestedMode === "frameLineAnchors" ? "frameLineAnchors" : "sourceCutRectFitProbe";

    if (!isValidRect(targetRect)) {
      warnings.push("invalid rect: targetRect");
      return { mode, targetRect: targetRect || null, parts: [], warnings, fallbackMode: null, bounds: null };
    }

    if (mode === "frameLineAnchors") {
      warnings.push("missing anchorOffset/lineInset/cornerRun metadata for final mode");
      warnings.push("fallback to sourceCutRectFitProbe");
    }

    const validRects = [];
    for (let i = 0; i < assets.length; i += 1) {
      const rect = assets[i] && assets[i].sourceCutRect;
      if (!rect) {
        warnings.push(`missing sourceCutRect:${assets[i] && (assets[i].id || assets[i].file || i)}`);
        continue;
      }
      const x = toNum(rect.x); const y = toNum(rect.y); const w = toNum(rect.w); const h = toNum(rect.h);
      if (!finite(x) || !finite(y) || !finite(w) || !finite(h) || w <= 0 || h <= 0) {
        warnings.push(`invalid sourceCutRect:${assets[i] && (assets[i].id || assets[i].file || i)}`);
        continue;
      }
      validRects.push({ x, y, w, h });
    }

    if (!validRects.length) {
      warnings.push("no valid sourceCutRect parts");
      return { mode: "sourceCutRectFitProbe", targetRect, parts: [], warnings, fallbackMode: mode === "frameLineAnchors" ? "sourceCutRectFitProbe" : null, bounds: null };
    }

    const minX = Math.min.apply(null, validRects.map((r) => r.x));
    const minY = Math.min.apply(null, validRects.map((r) => r.y));
    const maxX = Math.max.apply(null, validRects.map((r) => r.x + r.w));
    const maxY = Math.max.apply(null, validRects.map((r) => r.y + r.h));
    const srcW = Math.max(1, maxX - minX);
    const srcH = Math.max(1, maxY - minY);
    const scale = Math.min(targetRect.w / srcW, targetRect.h / srcH);
    const mountW = srcW * scale;
    const mountH = srcH * scale;
    const mountX = targetRect.x + (targetRect.w - mountW) / 2;
    const mountY = targetRect.y + (targetRect.h - mountH) / 2;

    const parts = assets.map((asset, index) => {
      const id = asset && (asset.id || asset.file || `part_${index}`);
      const sourceCutRect = asset && asset.sourceCutRect;
      const partWarnings = [];
      if (!sourceCutRect) {
        partWarnings.push("missing sourceCutRect");
        return { id, file: asset && asset.file, asset, sourceCutRect: null, destRect: null, anchors: null, warnings: partWarnings, outsideTarget: false };
      }
      const sx = toNum(sourceCutRect.x); const sy = toNum(sourceCutRect.y); const sw = toNum(sourceCutRect.w); const sh = toNum(sourceCutRect.h);
      if (!finite(sx) || !finite(sy) || !finite(sw) || !finite(sh) || sw <= 0 || sh <= 0) {
        partWarnings.push("invalid sourceCutRect");
        return { id, file: asset && asset.file, asset, sourceCutRect, destRect: null, anchors: null, warnings: partWarnings, outsideTarget: false };
      }
      const x = mountX + (sx - minX) * scale;
      const y = mountY + (sy - minY) * scale;
      const w = sw * scale;
      const h = sh * scale;
      if (!finite(x) || !finite(y) || !finite(w) || !finite(h) || w <= 0 || h <= 0) partWarnings.push("NaN/zero size");
      const outsideTarget = x + w < targetRect.x || y + h < targetRect.y || x > targetRect.x + targetRect.w || y > targetRect.y + targetRect.h;
      if (outsideTarget) partWarnings.push("outside target rect");

      const anchors = {};
      const srcAnchors = asset && asset.anchors && typeof asset.anchors === "object" ? asset.anchors : null;
      if (srcAnchors) {
        Object.keys(srcAnchors).forEach((key) => {
          const a = srcAnchors[key] || {};
          anchors[key] = { x: x + toNum(a.x || 0) * scale, y: y + toNum(a.y || 0) * scale };
        });
      }
      return { id, file: asset && asset.file, asset, sourceCutRect, destRect: { x, y, w, h }, anchors, warnings: partWarnings, outsideTarget };
    });

    return {
      mode: "sourceCutRectFitProbe",
      requestedMode,
      fallbackMode: mode === "frameLineAnchors" ? "sourceCutRectFitProbe" : null,
      targetRect,
      bounds: { minX, minY, maxX, maxY, srcW, srcH, scale, mountX, mountY, mountW, mountH },
      center: { x: targetRect.x + targetRect.w / 2, y: targetRect.y + targetRect.h / 2 },
      parts,
      warnings
    };
  }

  function requestAssets(options) {
    const opts = Object.assign({}, DEFAULTS, options || {});
    if (state.requested || typeof root.fetch !== "function" || typeof root.Image === "undefined") return;
    state.requested = true;
    state.status = "loading_manifest";
    root.fetch(opts.manifestUrl, { cache: "no-store" })
      .then((resp) => (resp && resp.ok ? resp.json() : null))
      .then((manifest) => {
        state.status = "loading_assets";
        state.assets = Array.isArray(manifest && manifest.assets) ? manifest.assets : [];
        state.assets.forEach((asset) => {
          const img = new root.Image();
          img.onload = () => { state.loaded += 1; };
          img.onerror = () => { state.failed += 1; state.warnings.push(`failed:${asset && asset.file}`); };
          img.src = joinAssetUrl(opts.assetBaseUrl, asset && asset.file);
          state.imageById.set(asset && asset.id, img);
        });
        state.status = "ready";
      })
      .catch((error) => {
        state.status = "error";
        state.lastManifestError = String(error && (error.message || error));
        state.warnings.push(state.lastManifestError);
      });
  }

  function draw(ctx, prgRect, options) {
    if (!ctx || !prgRect) return null;
    const opts = Object.assign({}, DEFAULTS, options || {});
    requestAssets(opts);
    if (!state.assets.length) return null;
    const layout = computeLayout({ assets: state.assets }, prgRect, { mode: opts.mode });

    layout.parts.forEach((part) => {
      if (!part.destRect) return;
      const { x, y, w, h } = part.destRect;
      const img = state.imageById.get(part.id);
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, x, y, w, h);
        if (opts.debugGoldTint || opts.temporaryPrgFrameTint) {
          ctx.save();
          ctx.globalCompositeOperation = "source-atop";
          ctx.globalAlpha = finite(opts.tintAlpha) ? opts.tintAlpha : DEFAULTS.tintAlpha;
          ctx.fillStyle = opts.temporaryPrgFrameTint || opts.debugGoldTint || DEFAULTS.debugGoldTint;
          ctx.fillRect(x, y, w, h);
          ctx.restore();
        }
      }
      if (opts.debugOverlay !== false) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,215,0,0.75)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, w - 1), Math.max(0, h - 1));
        ctx.fillStyle = "rgba(255,220,140,0.95)";
        ctx.font = "10px ui-monospace, monospace";
        ctx.fillText(part.file || part.id, x + 2, y + 10);
        if (part.anchors) {
          Object.keys(part.anchors).forEach((k) => {
            const a = part.anchors[k];
            if (!a || !finite(a.x) || !finite(a.y)) return;
            ctx.fillRect(a.x - 1, a.y - 1, 3, 3);
          });
        }
        ctx.restore();
      }
    });

    if (opts.debugOverlay !== false) {
      const warnings = layout.warnings.concat(state.warnings);
      ctx.save();
      ctx.strokeStyle = "rgba(0,255,255,0.85)";
      ctx.lineWidth = 1.25;
      ctx.strokeRect(prgRect.x + 0.5, prgRect.y + 0.5, prgRect.w - 1, prgRect.h - 1);
      ctx.beginPath();
      ctx.moveTo(layout.center.x - 7, layout.center.y); ctx.lineTo(layout.center.x + 7, layout.center.y);
      ctx.moveTo(layout.center.x, layout.center.y - 7); ctx.lineTo(layout.center.x, layout.center.y + 7);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "11px ui-monospace, monospace";
      ctx.fillText(`PRG probe loaded=${state.loaded} failed=${state.failed} dpr=${(root.devicePixelRatio || 1).toFixed(2)}`, prgRect.x, prgRect.y - 8);
      if (warnings.length) ctx.fillText(`WARN ${warnings.join(",")}`, prgRect.x, prgRect.y + prgRect.h + 14);
      ctx.restore();
    }
    return layout;
  }

  root.HC.PrgFrameProbe = {
    version: "0.2.0-probe",
    requestAssets,
    draw,
    computeLayout,
    getState: function () { return state; },
    defaults: Object.assign({}, DEFAULTS)
  };
})(typeof window !== "undefined" ? window : globalThis);
