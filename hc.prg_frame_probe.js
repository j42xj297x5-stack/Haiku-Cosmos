(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const DEFAULTS = {
    manifestUrl: "assets/visual/prg/prg_frame_manifest.json",
    assetBaseUrl: "assets/visual/prg/svg/frame_parts/",
    mode: "frameRectHeightMountProbe",
    debugGoldTint: "#d4af37",
    tintAlpha: 0.88,
    layoutMetadataUrl: "assets/visual/prg/prg_frame_layout_metadata.json",
    stretchFillCenterToTargetWidth: true,
    fillCenterMode: "rotate_left_fit_width"
  };

  const state = {
    requested: false,
    status: "idle",
    assets: [],
    imageById: new Map(),
    loaded: 0,
    failed: 0,
    warnings: [],
    lastManifestError: null,
    layoutMetadata: null,
    layoutMetadataStatus: "idle",
    layoutMetadataError: null,
    manifestVersion: null,
    cacheBustToken: null,
    firstResolvedAssetUrl: null,
    cacheBustActive: false
  };

  function toNum(value) { return Number(value); }
  function finite(value) { return Number.isFinite(value); }

  function publicPath(path) {
    if (root.HC && typeof root.HC.publicPath === "function") return root.HC.publicPath(path);
    const cleanBase = String(root.HC_PUBLIC_BASE_URL || "/").replace(/\/+$/, "/");
    const cleanPath = String(path || "").replace(/^\/+/, "");
    return cleanBase + cleanPath;
  }

  function joinAssetUrl(baseUrl, file) {
    if (!baseUrl || !file) return null;
    return String(baseUrl).replace(/\/+$/, "") + "/" + String(file).replace(/^\/+/, "");
  }

  function isValidRect(rect) {
    return !!rect && finite(rect.x) && finite(rect.y) && finite(rect.w) && finite(rect.h) && rect.w > 0 && rect.h > 0;
  }

  function computeLayout(manifest, targetRect, options, layoutMetadata) {
    const opts = options && typeof options === "object" ? options : {};
    const requestedMode = typeof opts.mode === "string" ? opts.mode : DEFAULTS.mode;
    const warnings = [];
    const assets = Array.isArray(manifest && manifest.assets) ? manifest.assets : [];
    const mode = requestedMode === "frameLineAnchors"
      ? "frameLineAnchors"
      : (requestedMode === "frameRectHeightMountProbe" ? "frameRectHeightMountProbe" : "sourceCutRectFitProbe");

    if (!isValidRect(targetRect)) {
      warnings.push("invalid rect: targetRect");
      return { mode, targetRect: targetRect || null, parts: [], warnings, fallbackMode: null, bounds: null };
    }

    const diagnostics = buildMetadataDiagnostics(assets, layoutMetadata);
    const fillCenterMode = typeof opts.fillCenterMode === "string" ? opts.fillCenterMode : DEFAULTS.fillCenterMode;
    const stretchFillCenterToTargetWidth = opts.stretchFillCenterToTargetWidth !== false;
    let fillCenterProbeInfo = null;

    if (mode === "frameLineAnchors") {
      if (!diagnostics.loaded) {
        warnings.push("missing layout metadata sidecar");
      }
      if (diagnostics.missingMetadataParts.length) warnings.push(`missing metadata parts:${diagnostics.missingMetadataParts.join("|")}`);
      diagnostics.missingRequiredFields.forEach((entry) => warnings.push(`missing metadata fields:${entry.part}:${entry.fields.join("+")}`));
      if (!diagnostics.readyForFrameLineAnchors) warnings.push("fallback to sourceCutRectFitProbe");
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
    const baseScale = Math.min(targetRect.w / srcW, targetRect.h / srcH);
    const mountW = srcW * baseScale;
    const mountH = srcH * baseScale;
    const mountX = targetRect.x + (targetRect.w - mountW) / 2;
    const mountY = targetRect.y;
    const frameLineRect = { x: targetRect.x, y: targetRect.y, w: targetRect.w, h: targetRect.h };

    function inferRole(asset, file) {
      const meta = layoutMetadata && layoutMetadata.parts && layoutMetadata.parts[file];
      if (meta && typeof meta.role === "string") return meta.role;
      const id = String(asset && (asset.id || file || "")).toLowerCase();
      if (id.includes("corner_lu")) return "corner_lu";
      if (id.includes("corner_ru")) return "corner_ru";
      if (id.includes("corner_ld")) return "corner_ld";
      if (id.includes("corner_rd")) return "corner_rd";
      if (id.includes("line_hlu")) return "line_hlu";
      if (id.includes("line_hru")) return "line_hru";
      if (id.includes("line_hld")) return "line_hld";
      if (id.includes("line_hrd")) return "line_hrd";
      if (id.includes("line_vlu")) return "line_vlu";
      if (id.includes("line_vru")) return "line_vru";
      if (id.includes("line_vld")) return "line_vld";
      if (id.includes("line_vrd")) return "line_vrd";
      if (id.includes("ornament_l")) return "ornament_l";
      if (id.includes("ornament_u")) return "ornament_u";
      if (id.includes("ornament_r")) return "ornament_r";
      if (id.includes("ornament_d")) return "ornament_d";
      if (id.includes("fill_center")) return "fill_center";
      return "unknown";
    }

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
      const file = asset && asset.file;
      const role = inferRole(asset, file);
      const isTopLeftEdge = role === "line_hlu";
      const isTopRightEdge = role === "line_hru";
      const isBottomLeftEdge = role === "line_hld";
      const isBottomRightEdge = role === "line_hrd";
      const isLeftTopEdge = role === "line_vlu";
      const isRightTopEdge = role === "line_vru";
      const isLeftBottomEdge = role === "line_vld";
      const isRightBottomEdge = role === "line_vrd";
      const xFit = mountX + (sx - minX) * baseScale;
      const yFit = mountY + (sy - minY) * baseScale;
      const wFit = sw * baseScale;
      const hFit = sh * baseScale;
      let x = xFit;
      let y = yFit;
      let w = wFit;
      let h = hFit;
      const xLeft = frameLineRect.x;
      const xRight = frameLineRect.x + frameLineRect.w - wFit;
      const yTop = frameLineRect.y;
      const yBottom = frameLineRect.y + frameLineRect.h - hFit;
      if (role === "corner_lu") { x = xLeft; y = yTop; }
      if (role === "corner_ru") { x = xRight; y = yTop; }
      if (role === "corner_ld") { x = xLeft; y = yBottom; }
      if (role === "corner_rd") { x = xRight; y = yBottom; }
      if (role === "ornament_l") { x = xLeft; y = frameLineRect.y + (frameLineRect.h - hFit) * 0.5; }
      if (role === "ornament_r") { x = xRight; y = frameLineRect.y + (frameLineRect.h - hFit) * 0.5; }
      if (role === "ornament_u") { x = frameLineRect.x + (frameLineRect.w - wFit) * 0.5; y = yTop; }
      if (role === "ornament_d") { x = frameLineRect.x + (frameLineRect.w - wFit) * 0.5; y = yBottom; }
      if (role === "fill_center") {
        if (fillCenterMode === "rotate_left_fit_width") {
          const rotatedNaturalWidth = sh;
          const rotatedNaturalHeight = sw;
          const scale = rotatedNaturalWidth > 0 ? targetRect.w / rotatedNaturalWidth : 1;
          const destW = targetRect.w;
          const destH = rotatedNaturalHeight * scale;
          const centerX = targetRect.x + targetRect.w * 0.5;
          const centerY = targetRect.y + targetRect.h * 0.5;
          x = centerX - destW * 0.5;
          y = centerY - destH * 0.5;
          w = destW;
          h = destH;
          fillCenterProbeInfo = {
            mode: "fill_center_rotate_left_fit_width_probe",
            naturalSize: { w: sw, h: sh },
            rotatedNaturalSize: { w: rotatedNaturalWidth, h: rotatedNaturalHeight },
            scale,
            center: { x: centerX, y: centerY },
            destRect: { x, y, w, h },
            rotationRad: -Math.PI / 2
          };
          warnings.push("fill_center_rotated_left_fit_width_probe");
        } else if (stretchFillCenterToTargetWidth) {
          x = targetRect.x;
          y = frameLineRect.y + (frameLineRect.h - hFit) * 0.5;
          w = targetRect.w;
          h = hFit;
          fillCenterProbeInfo = {
            mode: "x-only-full-target-width",
            naturalSize: { w: sw, h: sh },
            fittedSizeBeforeStretch: { w: wFit, h: hFit },
            destRect: { x, y, w, h }
          };
          warnings.push("fill_center_x_stretch_probe");
        } else {
          x = frameLineRect.x + (frameLineRect.w - wFit) * 0.5;
          y = frameLineRect.y + (frameLineRect.h - hFit) * 0.5;
        }
      }
      if (isTopLeftEdge || isTopRightEdge || isBottomLeftEdge || isBottomRightEdge) {
        y = (isTopLeftEdge || isTopRightEdge) ? yTop : yBottom;
        const leftCap = Math.max(1, frameLineRect.w * 0.5 - wFit * 0.5);
        x = (isTopLeftEdge || isBottomLeftEdge) ? frameLineRect.x : frameLineRect.x + frameLineRect.w - leftCap;
        w = leftCap;
      }
      if (isLeftTopEdge || isRightTopEdge || isLeftBottomEdge || isRightBottomEdge) {
        x = (isLeftTopEdge || isLeftBottomEdge) ? xLeft : xRight;
        const topCap = Math.max(1, frameLineRect.h * 0.5 - hFit * 0.5);
        y = (isLeftTopEdge || isRightTopEdge) ? frameLineRect.y : frameLineRect.y + frameLineRect.h - topCap;
        h = topCap;
      }
      if (!finite(x) || !finite(y) || !finite(w) || !finite(h) || w <= 0 || h <= 0) partWarnings.push("NaN/zero size");
      const outsideTarget = x + w < targetRect.x || y + h < targetRect.y || x > targetRect.x + targetRect.w || y > targetRect.y + targetRect.h;
      if (outsideTarget) partWarnings.push("outside target rect");

      const anchors = {};
      const srcAnchors = asset && asset.anchors && typeof asset.anchors === "object" ? asset.anchors : null;
      if (srcAnchors) {
        Object.keys(srcAnchors).forEach((key) => {
          const a = srcAnchors[key] || {};
          anchors[key] = { x: x + toNum(a.x || 0) * baseScale, y: y + toNum(a.y || 0) * baseScale };
        });
      }
      return { id, file: asset && asset.file, role, asset, sourceCutRect, destRect: { x, y, w, h }, anchors, warnings: partWarnings, outsideTarget };
    });

    return {
      mode: "runtime_probe_layout_v2",
      requestedMode,
      fallbackMode: mode === "frameLineAnchors" ? "sourceCutRectFitProbe" : null,
      targetRect,
      frameLineRect,
      bounds: { minX, minY, maxX, maxY, srcW, srcH, baseScale, mountX, mountY, mountW, mountH },
      center: { x: targetRect.x + targetRect.w / 2, y: targetRect.y + targetRect.h / 2 },
      parts,
      warnings,
      metadataDiagnostics: diagnostics,
      fillCenterProbeInfo
    };
  }



  const REQUIRED_METADATA_FIELDS = ["role", "anchorType", "anchorOffset", "lineInset", "cornerRun", "stretchAxis", "defaultScale", "safeMinSize", "densityBehavior", "metadataStatus"];

  function buildMetadataDiagnostics(manifestAssets, layoutMetadata) {
    const assets = Array.isArray(manifestAssets) ? manifestAssets : [];
    const metaParts = layoutMetadata && layoutMetadata.parts && typeof layoutMetadata.parts === "object" ? layoutMetadata.parts : null;
    const partKeys = metaParts ? Object.keys(metaParts) : [];
    const statusCounts = {};
    const missingRequiredFields = [];
    const missingPerPart = {};
    const missingMetadataParts = [];

    partKeys.forEach((key) => {
      const part = metaParts[key] || {};
      const status = typeof part.metadataStatus === "string" ? part.metadataStatus : "missing";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      const missing = [];
      REQUIRED_METADATA_FIELDS.forEach((field) => {
        if (!(field in part)) missing.push(field);
      });
      if (missing.length) {
        missingPerPart[key] = missing;
        missingRequiredFields.push({ part: key, fields: missing });
      }
    });

    assets.forEach((asset, i) => {
      const key = asset && (asset.file || asset.id || `part_${i}`);
      if (!key || !metaParts || !metaParts[key]) missingMetadataParts.push(key || `part_${i}`);
    });

    const readyForFrameLineAnchors = !!metaParts && assets.length > 0 && missingMetadataParts.length === 0 && missingRequiredFields.length === 0 && !Object.keys(statusCounts).some((k) => k === "missing");

    return {
      loaded: !!metaParts,
      partsCount: partKeys.length,
      statusCounts,
      missingRequiredFields,
      missingPerPart,
      missingMetadataParts,
      readyForFrameLineAnchors
    };
  }

  function appendCacheBust(url, token) {
    if (!url || !token) return url;
    return url + (String(url).includes("?") ? "&" : "?") + "prgProbeVersion=" + encodeURIComponent(String(token));
  }

  function requestAssets(options) {
    const opts = Object.assign({}, DEFAULTS, options || {});
    if (state.requested || typeof root.fetch !== "function" || typeof root.Image === "undefined") return;
    state.requested = true;
    state.status = "loading_manifest";
    const manifestUrl = appendCacheBust(publicPath(opts.manifestUrl), Date.now());
    root.fetch(manifestUrl, { cache: "no-store" })
      .then((resp) => (resp && resp.ok ? resp.json() : null))
      .then((manifest) => {
        state.status = "loading_assets";
        state.assets = Array.isArray(manifest && manifest.assets) ? manifest.assets : [];
        state.manifestVersion = manifest && (manifest.generatedAt || manifest.updatedAt || manifest.version || null);
        state.cacheBustToken = state.manifestVersion || Date.now();
        state.cacheBustActive = true;
        state.layoutMetadataStatus = "loading";
        root.fetch(appendCacheBust(publicPath(opts.layoutMetadataUrl), state.cacheBustToken), { cache: "no-store" })
          .then((resp) => (resp && resp.ok ? resp.json() : null))
          .then((json) => {
            state.layoutMetadata = json && typeof json === "object" ? json : null;
            state.layoutMetadataStatus = state.layoutMetadata ? "ready" : "missing";
            if (!state.layoutMetadata) state.warnings.push("missing layout metadata sidecar");
          })
          .catch((error) => {
            state.layoutMetadata = null;
            state.layoutMetadataStatus = "error";
            state.layoutMetadataError = String(error && (error.message || error));
            state.warnings.push("missing layout metadata sidecar");
          });
        state.assets.forEach((asset) => {
          const img = new root.Image();
          img.onload = () => { state.loaded += 1; };
          img.onerror = () => { state.failed += 1; state.warnings.push(`failed:${asset && asset.file}`); };
          const resolvedAssetUrl = appendCacheBust(joinAssetUrl(publicPath(opts.assetBaseUrl), asset && asset.file), state.cacheBustToken);
          img.src = resolvedAssetUrl;
          if (!state.firstResolvedAssetUrl) state.firstResolvedAssetUrl = resolvedAssetUrl;
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



  function createHorizontalFillCenterGradient(ctx, w) {
    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, "#ff0000");
    gradient.addColorStop(0.33333, "#ffd400");
    gradient.addColorStop(0.66666, "#00b050");
    gradient.addColorStop(1, "#0066ff");
    return gradient;
  }

  function drawFillCenterGradientMasked(ctx, img, rect, rotateLeft) {
    if (!ctx || !img || !rect) return false;
    const offW = Math.max(1, Math.round(rect.w));
    const offH = Math.max(1, Math.round(rect.h));
    const offscreen = (typeof root.OffscreenCanvas === "function")
      ? new root.OffscreenCanvas(offW, offH)
      : (typeof root.document !== "undefined" ? root.document.createElement("canvas") : null);
    if (!offscreen) return false;
    if (offscreen.width !== offW) offscreen.width = offW;
    if (offscreen.height !== offH) offscreen.height = offH;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return false;
    offCtx.clearRect(0, 0, offW, offH);

    if (rotateLeft) {
      offCtx.save();
      offCtx.translate(offW * 0.5, offH * 0.5);
      offCtx.rotate(-Math.PI / 2);
      offCtx.drawImage(img, -offH * 0.5, -offW * 0.5, offH, offW);
      offCtx.restore();
    } else {
      offCtx.drawImage(img, 0, 0, offW, offH);
    }

    offCtx.globalCompositeOperation = "source-in";
    offCtx.fillStyle = createHorizontalFillCenterGradient(offCtx, offW);
    offCtx.fillRect(0, 0, offW, offH);
    offCtx.globalCompositeOperation = "source-over";

    ctx.drawImage(offscreen, rect.x, rect.y, rect.w, rect.h);
    return true;
  }

  function draw(ctx, prgRect, options) {
    if (!ctx || !prgRect) return null;
    const opts = Object.assign({}, DEFAULTS, options || {});
    requestAssets(opts);
    if (!state.assets.length) return null;
    const layout = computeLayout({ assets: state.assets }, prgRect, { mode: opts.mode, fillCenterMode: opts.fillCenterMode }, state.layoutMetadata);

    layout.parts.forEach((part) => {
      if (!part.destRect) return;
      const { x, y, w, h } = part.destRect;
      const img = state.imageById.get(part.id);
      if (img && img.complete && img.naturalWidth > 0) {
        const useRotateLeftProbe = part.role === "fill_center"
          && layout.fillCenterProbeInfo
          && layout.fillCenterProbeInfo.mode === "fill_center_rotate_left_fit_width_probe";
        const isFillCenter = part.role === "fill_center" || part.file === "fill_center.svg";
        if (isFillCenter) {
          drawFillCenterGradientMasked(ctx, img, part.destRect, useRotateLeftProbe);
        } else if (useRotateLeftProbe) {
          const centerX = x + w * 0.5;
          const centerY = y + h * 0.5;
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(-Math.PI / 2);
          ctx.drawImage(img, -h * 0.5, -w * 0.5, h, w);
          ctx.restore();
        } else {
          ctx.drawImage(img, x, y, w, h);
        }
        if (!isFillCenter && (opts.debugGoldTint || opts.temporaryPrgFrameTint)) {
          ctx.save();
          ctx.globalCompositeOperation = "source-atop";
          ctx.globalAlpha = finite(opts.tintAlpha) ? opts.tintAlpha : DEFAULTS.tintAlpha;
          ctx.fillStyle = opts.temporaryPrgFrameTint || opts.debugGoldTint || DEFAULTS.debugGoldTint;
          ctx.fillRect(x, y, w, h);
          ctx.restore();
        }
      }
      if (opts.debugOverlay !== false && (opts.showBounds !== false || opts.showLabels !== false || opts.showAnchors !== false)) {
        ctx.save();
        ctx.strokeStyle = "rgba(255,215,0,0.75)";
        ctx.lineWidth = 1;
        if (opts.showBounds !== false) ctx.strokeRect(x + 0.5, y + 0.5, Math.max(0, w - 1), Math.max(0, h - 1));
        if (opts.showLabels === true) {
          ctx.fillStyle = "rgba(255,220,140,0.95)";
          ctx.font = "10px ui-monospace, monospace";
          ctx.fillText(`${part.role || "part"}:${part.file || part.id}`, x + 2, y + 10);
        }
        if (opts.showAnchors !== false && part.anchors) {
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
      if (layout.frameLineRect) {
        ctx.strokeStyle = "rgba(255, 80, 80, 0.9)";
        ctx.strokeRect(layout.frameLineRect.x + 0.5, layout.frameLineRect.y + 0.5, layout.frameLineRect.w - 1, layout.frameLineRect.h - 1);
      }
      ctx.beginPath();
      ctx.moveTo(layout.center.x - 7, layout.center.y); ctx.lineTo(layout.center.x + 7, layout.center.y);
      ctx.moveTo(layout.center.x, layout.center.y - 7); ctx.lineTo(layout.center.x, layout.center.y + 7);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "11px ui-monospace, monospace";
      ctx.fillText(`PRG probe loaded=${state.loaded} failed=${state.failed} dpr=${(root.devicePixelRatio || 1).toFixed(2)}`, prgRect.x, prgRect.y - 8);
      ctx.fillText(`manifestLoaded=${(state.status === "ready" || state.status === "loading_assets") ? "yes" : "no"} cacheBust=${state.cacheBustActive ? "yes" : "no"}`, prgRect.x, prgRect.y + prgRect.h + 84);
      if (state.firstResolvedAssetUrl) ctx.fillText(`assetUrl=${state.firstResolvedAssetUrl}`, prgRect.x, prgRect.y + prgRect.h + 98);
      if (layout.bounds && finite(layout.bounds.baseScale)) {
        ctx.fillText(`baseScale=${layout.bounds.baseScale.toFixed(4)} mode=${layout.mode}`, prgRect.x, prgRect.y + prgRect.h + 14);
      }
      ctx.fillText(`fill_center_gradient_probe=on gradientTarget=fill_only strokeUsed=false affectFrameParts=false`, prgRect.x, prgRect.y + prgRect.h + 168);
      if (layout.fillCenterProbeInfo) {
        const fc = layout.fillCenterProbeInfo;
        const d = fc.destRect;
        ctx.fillText(`fill_center mode=${fc.mode} natural=${fc.naturalSize.w.toFixed(2)}x${fc.naturalSize.h.toFixed(2)}`, prgRect.x, prgRect.y + prgRect.h + 126);
        if (fc.rotatedNaturalSize) {
          ctx.fillText(`fill_center rotatedNatural=${fc.rotatedNaturalSize.w.toFixed(2)}x${fc.rotatedNaturalSize.h.toFixed(2)} scale=${finite(fc.scale) ? fc.scale.toFixed(4) : "n/a"}`, prgRect.x, prgRect.y + prgRect.h + 140);
          ctx.strokeStyle = "rgba(0, 255, 120, 0.95)";
          ctx.strokeRect(d.x + 0.5, d.y + 0.5, Math.max(0, d.w - 1), Math.max(0, d.h - 1));
        }
        ctx.fillText(`fill_center destRect x=${d.x.toFixed(2)} y=${d.y.toFixed(2)} w=${d.w.toFixed(2)} h=${d.h.toFixed(2)}`, prgRect.x, prgRect.y + prgRect.h + 154);
      }
      const md = layout.metadataDiagnostics || buildMetadataDiagnostics(state.assets, state.layoutMetadata);
      if (opts.showMetadata !== false) {
        const mdStatus = state.layoutMetadataStatus === "ready" && md.loaded ? "yes" : "no";
        const statusLine = Object.keys(md.statusCounts).sort().map((k) => `${k}:${md.statusCounts[k]}`).join(" ");
        ctx.fillText(`metadata loaded=${mdStatus} parts=${md.partsCount} readyForFrameLineAnchors=${md.readyForFrameLineAnchors ? "yes" : "no"}`, prgRect.x, prgRect.y + prgRect.h + 28);
        ctx.fillText(`metadataStatus ${statusLine || "none"}`, prgRect.x, prgRect.y + prgRect.h + 42);
        if (md.missingRequiredFields.length) ctx.fillText(`missing fields ${md.missingRequiredFields.length}`, prgRect.x, prgRect.y + prgRect.h + 56);
      }
      if (warnings.length) ctx.fillText(`WARN ${warnings.join(",")}`, prgRect.x, prgRect.y + prgRect.h + 112);
      ctx.restore();
    }
    return layout;
  }

  root.HC.PrgFrameProbe = {
    version: "0.5.0-fill_center_gradient_probe",
    requestAssets,
    draw,
    computeLayout,
    getState: function () { return state; },
    getStatus: function () {
      const md = buildMetadataDiagnostics(state.assets, state.layoutMetadata);
      return {
        manifestLoaded: state.status === "ready" || state.status === "loading_assets",
        metadataLoaded: state.layoutMetadataStatus === "ready" && md.loaded,
        assetsLoaded: state.loaded,
        assetsFailed: state.failed,
        readyForFrameLineAnchors: md.readyForFrameLineAnchors,
        warnings: state.warnings.slice(-8),
        currentMode: DEFAULTS.mode,
        fallbackMode: "sourceCutRectFitProbe",
        firstResolvedAssetUrl: state.firstResolvedAssetUrl,
        cacheBustActive: state.cacheBustActive,
        fill_center_gradient_probe: "on",
        gradientTarget: "fill_only",
        strokeUsed: false,
        affectFrameParts: false
      };
    },
    defaults: Object.assign({}, DEFAULTS)
  };
})(typeof window !== "undefined" ? window : globalThis);
