// Haiku Cosmos FrameComposer v0.1 (pure layout calculations + optional debug helpers).
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  function clampMin(value, minValue) {
    var number = Number(value);
    if (!Number.isFinite(number)) return minValue;
    return Math.max(minValue, number);
  }

  function clampRange(value, minValue, maxValue) {
    var number = Number(value);
    if (!Number.isFinite(number)) return minValue;
    return Math.min(Math.max(number, minValue), maxValue);
  }

  function numberOrFallback(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function resolveRect(rect) {
    var source = rect && typeof rect === "object" ? rect : {};
    var x = Number(source.x);
    var y = Number(source.y);
    var w = Number(source.w);
    var h = Number(source.h);

    if (!Number.isFinite(w)) w = Number(source.width);
    if (!Number.isFinite(h)) h = Number(source.height);

    return {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0,
      w: clampMin(w, 1),
      h: clampMin(h, 1)
    };
  }

  function asPoint(value, fallbackX, fallbackY) {
    var source = value && typeof value === "object" ? value : {};
    return {
      x: Number.isFinite(source.x) ? source.x : fallbackX,
      y: Number.isFinite(source.y) ? source.y : fallbackY
    };
  }

  function asSize(value, fallbackW, fallbackH) {
    var source = value && typeof value === "object" ? value : {};
    return {
      w: clampMin(numberOrFallback(source.w !== undefined ? source.w : source.width, fallbackW), 1),
      h: clampMin(numberOrFallback(source.h !== undefined ? source.h : source.height, fallbackH), 1)
    };
  }

  function resolveLineRectInset(options, fallbackX, fallbackY) {
    var lineRectInset = options.lineRectInset && typeof options.lineRectInset === "object"
      ? options.lineRectInset
      : {};

    var x = Number.isFinite(lineRectInset.x)
      ? lineRectInset.x
      : numberOrFallback(options.frameLineInsetX, fallbackX);
    var y = Number.isFinite(lineRectInset.y)
      ? lineRectInset.y
      : numberOrFallback(options.frameLineInsetY, fallbackY);

    return { x: x, y: y };
  }

  function computeFrameLineRect(rect, inset) {
    var insetX = clampRange(inset.x, 0, Math.max(0, (rect.w - 1) / 2));
    var insetY = clampRange(inset.y, 0, Math.max(0, (rect.h - 1) / 2));

    return {
      x: rect.x + insetX,
      y: rect.y + insetY,
      w: clampMin(rect.w - insetX * 2, 1),
      h: clampMin(rect.h - insetY * 2, 1),
      insetX: insetX,
      insetY: insetY
    };
  }

  function asBounds(id, type, box) {
    return {
      id: id,
      type: type,
      x: box.x,
      y: box.y,
      w: box.w,
      h: box.h
    };
  }

  function composeOptions(inputOptions) {
    var options = inputOptions && typeof inputOptions === "object" ? inputOptions : {};
    var rect = resolveRect(options.rect);
    var cornerSize = clampMin(numberOrFallback(options.cornerSize, 80), 1);
    var edgeThickness = clampMin(numberOrFallback(options.edgeThickness, 28), 1);

    var anchors = options.anchors && typeof options.anchors === "object" ? options.anchors : {};
    var scales = options.scales && typeof options.scales === "object" ? options.scales : {};

    var cornerAnchorOffset = asPoint(anchors.cornerAnchorOffset, 16, 16);
    var edgeLineInset = clampMin(Number.isFinite(anchors.edgeLineInset) ? anchors.edgeLineInset : 10, 0);
    var defaultCornerJoinInset = clampMin(cornerSize - cornerAnchorOffset.x - 12, 0);
    var cornerJoinInset = clampMin(Number.isFinite(anchors.cornerJoinInset)
      ? anchors.cornerJoinInset
      : numberOrFallback(options.cornerJoinInset, defaultCornerJoinInset), 0);
    var lineRectInset = resolveLineRectInset(options, 0, 0);
    var ornamentSize = asSize(options.ornamentSize, 220, 64);

    var topOrnamentScale = Number.isFinite(scales.topOrnament) ? scales.topOrnament : 0.78;
    var bottomOrnamentScale = Number.isFinite(scales.bottomOrnament) ? scales.bottomOrnament : 0.84;
    var topOrnamentOffsetY = numberOrFallback(options.topOrnamentOffsetY, 0);
    var bottomOrnamentOffsetY = numberOrFallback(options.bottomOrnamentOffsetY, 0);

    var showCenterOrnaments = options.showCenterOrnaments !== false;

    return {
      rect: rect,
      cornerSize: cornerSize,
      edgeThickness: edgeThickness,
      lineRectInset: lineRectInset,
      ornamentSize: ornamentSize,
      anchors: {
        cornerAnchorOffset: cornerAnchorOffset,
        edgeLineInset: edgeLineInset,
        cornerJoinInset: cornerJoinInset
      },
      scales: {
        topOrnament: topOrnamentScale,
        bottomOrnament: bottomOrnamentScale
      },
      topOrnamentOffsetY: topOrnamentOffsetY,
      bottomOrnamentOffsetY: bottomOrnamentOffsetY,
      showCenterOrnaments: showCenterOrnaments
    };
  }

  function computeFrameLayout(options) {
    var cfg = composeOptions(options);
    var rect = cfg.rect;
    var cornerSize = cfg.cornerSize;
    var edgeThickness = cfg.edgeThickness;
    var cornerAnchorOffset = cfg.anchors.cornerAnchorOffset;
    var edgeLineInset = cfg.anchors.edgeLineInset;
    var cornerJoinInset = cfg.anchors.cornerJoinInset;
    var frameLineRect = computeFrameLineRect(rect, cfg.lineRectInset);

    var centerX = frameLineRect.x + frameLineRect.w / 2;
    var centerY = frameLineRect.y + frameLineRect.h / 2;

    var cornerFarAnchorX = cornerSize - cornerAnchorOffset.x;
    var cornerFarAnchorY = cornerSize - cornerAnchorOffset.y;
    var horizontalStartX = frameLineRect.x + cornerJoinInset;
    var horizontalEndX = frameLineRect.x + frameLineRect.w - cornerJoinInset;
    var horizontalVisualWidth = clampMin(horizontalEndX - horizontalStartX, 1);
    var horizontalAssetWidth = horizontalVisualWidth + edgeLineInset * 2;
    var verticalStartY = frameLineRect.y + cornerJoinInset;
    var verticalEndY = frameLineRect.y + frameLineRect.h - cornerJoinInset;
    var verticalVisualHeight = clampMin(verticalEndY - verticalStartY, 1);
    var verticalAssetHeight = verticalVisualHeight + edgeLineInset * 2;

    var corners = {
      tl: {
        x: frameLineRect.x - cornerAnchorOffset.x,
        y: frameLineRect.y - cornerAnchorOffset.y,
        w: cornerSize,
        h: cornerSize,
        anchorX: frameLineRect.x,
        anchorY: frameLineRect.y,
        anchorLocalX: cornerAnchorOffset.x,
        anchorLocalY: cornerAnchorOffset.y
      },
      tr: {
        x: frameLineRect.x + frameLineRect.w - cornerFarAnchorX,
        y: frameLineRect.y - cornerAnchorOffset.y,
        w: cornerSize,
        h: cornerSize,
        anchorX: frameLineRect.x + frameLineRect.w,
        anchorY: frameLineRect.y,
        anchorLocalX: cornerFarAnchorX,
        anchorLocalY: cornerAnchorOffset.y
      },
      bl: {
        x: frameLineRect.x - cornerAnchorOffset.x,
        y: frameLineRect.y + frameLineRect.h - cornerFarAnchorY,
        w: cornerSize,
        h: cornerSize,
        anchorX: frameLineRect.x,
        anchorY: frameLineRect.y + frameLineRect.h,
        anchorLocalX: cornerAnchorOffset.x,
        anchorLocalY: cornerFarAnchorY
      },
      br: {
        x: frameLineRect.x + frameLineRect.w - cornerFarAnchorX,
        y: frameLineRect.y + frameLineRect.h - cornerFarAnchorY,
        w: cornerSize,
        h: cornerSize,
        anchorX: frameLineRect.x + frameLineRect.w,
        anchorY: frameLineRect.y + frameLineRect.h,
        anchorLocalX: cornerFarAnchorX,
        anchorLocalY: cornerFarAnchorY
      }
    };

    var edges = {
      top: {
        x: horizontalStartX - edgeLineInset,
        y: frameLineRect.y - edgeThickness / 2,
        w: horizontalAssetWidth,
        h: edgeThickness,
        stretchAxis: "x",
        lineStartX: horizontalStartX,
        lineEndX: horizontalStartX + horizontalVisualWidth,
        lineY: frameLineRect.y
      },
      bottom: {
        x: horizontalStartX - edgeLineInset,
        y: frameLineRect.y + frameLineRect.h - edgeThickness / 2,
        w: horizontalAssetWidth,
        h: edgeThickness,
        stretchAxis: "x",
        lineStartX: horizontalStartX,
        lineEndX: horizontalStartX + horizontalVisualWidth,
        lineY: frameLineRect.y + frameLineRect.h
      },
      left: {
        x: frameLineRect.x - edgeThickness / 2,
        y: verticalStartY - edgeLineInset,
        w: edgeThickness,
        h: verticalAssetHeight,
        stretchAxis: "y",
        lineX: frameLineRect.x,
        lineStartY: verticalStartY,
        lineEndY: verticalStartY + verticalVisualHeight
      },
      right: {
        x: frameLineRect.x + frameLineRect.w - edgeThickness / 2,
        y: verticalStartY - edgeLineInset,
        w: edgeThickness,
        h: verticalAssetHeight,
        stretchAxis: "y",
        lineX: frameLineRect.x + frameLineRect.w,
        lineStartY: verticalStartY,
        lineEndY: verticalStartY + verticalVisualHeight
      }
    };

    var topOrnamentBaseW = cfg.ornamentSize.w;
    var topOrnamentBaseH = cfg.ornamentSize.h;
    var bottomOrnamentBaseW = cfg.ornamentSize.w;
    var bottomOrnamentBaseH = cfg.ornamentSize.h;
    var topOrnamentW = topOrnamentBaseW * cfg.scales.topOrnament;
    var topOrnamentH = topOrnamentBaseH * cfg.scales.topOrnament;
    var bottomOrnamentW = bottomOrnamentBaseW * cfg.scales.bottomOrnament;
    var bottomOrnamentH = bottomOrnamentBaseH * cfg.scales.bottomOrnament;
    var topOrnamentCenterY = frameLineRect.y + cfg.topOrnamentOffsetY;
    var bottomOrnamentCenterY = frameLineRect.y + frameLineRect.h + cfg.bottomOrnamentOffsetY;

    var ornaments = {
      topCenter: {
        x: centerX - topOrnamentW / 2,
        y: topOrnamentCenterY - topOrnamentH / 2,
        w: topOrnamentW,
        h: topOrnamentH,
        scale: cfg.scales.topOrnament,
        anchorX: centerX,
        anchorY: topOrnamentCenterY
      },
      bottomCenter: {
        x: centerX - bottomOrnamentW / 2,
        y: bottomOrnamentCenterY - bottomOrnamentH / 2,
        w: bottomOrnamentW,
        h: bottomOrnamentH,
        scale: cfg.scales.bottomOrnament,
        anchorX: centerX,
        anchorY: bottomOrnamentCenterY
      }
    };

    if (!cfg.showCenterOrnaments) {
      ornaments.topCenter.hidden = true;
      ornaments.bottomCenter.hidden = true;
    }

    var anchorPoints = [
      { id: "corner.tl", type: "corner", x: corners.tl.anchorX, y: corners.tl.anchorY },
      { id: "corner.tr", type: "corner", x: corners.tr.anchorX, y: corners.tr.anchorY },
      { id: "corner.bl", type: "corner", x: corners.bl.anchorX, y: corners.bl.anchorY },
      { id: "corner.br", type: "corner", x: corners.br.anchorX, y: corners.br.anchorY },
      { id: "ornament.top", type: "ornament", x: ornaments.topCenter.anchorX, y: ornaments.topCenter.anchorY },
      { id: "ornament.bottom", type: "ornament", x: ornaments.bottomCenter.anchorX, y: ornaments.bottomCenter.anchorY }
    ];
    var boundingBoxes = [
      asBounds("corner.tl", "corner", corners.tl),
      asBounds("corner.tr", "corner", corners.tr),
      asBounds("corner.bl", "corner", corners.bl),
      asBounds("corner.br", "corner", corners.br),
      asBounds("edge.top", "edge", edges.top),
      asBounds("edge.bottom", "edge", edges.bottom),
      asBounds("edge.left", "edge", edges.left),
      asBounds("edge.right", "edge", edges.right),
      asBounds("ornament.top", "ornament", ornaments.topCenter),
      asBounds("ornament.bottom", "ornament", ornaments.bottomCenter)
    ];
    var edgeLineAnchors = [
      { id: "edge.top.start", x: edges.top.lineStartX, y: edges.top.lineY },
      { id: "edge.top.end", x: edges.top.lineEndX, y: edges.top.lineY },
      { id: "edge.bottom.start", x: edges.bottom.lineStartX, y: edges.bottom.lineY },
      { id: "edge.bottom.end", x: edges.bottom.lineEndX, y: edges.bottom.lineY },
      { id: "edge.left.start", x: edges.left.lineX, y: edges.left.lineStartY },
      { id: "edge.left.end", x: edges.left.lineX, y: edges.left.lineEndY },
      { id: "edge.right.start", x: edges.right.lineX, y: edges.right.lineStartY },
      { id: "edge.right.end", x: edges.right.lineX, y: edges.right.lineEndY }
    ];

    return {
      rect: rect,
      frameLineRect: frameLineRect,
      corners: corners,
      edges: edges,
      ornaments: ornaments,
      debug: {
        targetRect: rect,
        anchorPoints: anchorPoints,
        edgeLineAnchors: edgeLineAnchors,
        boundingBoxes: boundingBoxes,
        lineRect: {
          x: frameLineRect.x,
          y: frameLineRect.y,
          w: frameLineRect.w,
          h: frameLineRect.h,
          centerX: centerX,
          centerY: centerY,
          insetX: frameLineRect.insetX,
          insetY: frameLineRect.insetY
        }
      }
    };
  }

  function getDefaultSubmetaAstrolabeOptions(rect) {
    return {
      rect: resolveRect(rect),
      cornerSize: 80,
      edgeThickness: 28,
      lineRectInset: { x: 32, y: 32 },
      ornamentSize: { w: 220, h: 64 },
      anchors: {
        cornerAnchorOffset: { x: 16, y: 16 },
        edgeLineInset: 10,
        cornerJoinInset: 52
      },
      scales: {
        topOrnament: 0.78,
        bottomOrnament: 0.84
      },
      topOrnamentOffsetY: 0,
      bottomOrnamentOffsetY: 0,
      showCenterOrnaments: true
    };
  }

  function computeSubmetaAstrolabeLayout(rect, overrides) {
    var base = getDefaultSubmetaAstrolabeOptions(rect);
    var patch = overrides && typeof overrides === "object" ? overrides : {};
    var hasLineInsetOverride = !!patch.lineRectInset ||
      patch.frameLineInsetX !== undefined ||
      patch.frameLineInsetY !== undefined;

    var options = {
      rect: patch.rect || base.rect,
      cornerSize: Number.isFinite(patch.cornerSize) ? patch.cornerSize : base.cornerSize,
      edgeThickness: Number.isFinite(patch.edgeThickness) ? patch.edgeThickness : base.edgeThickness,
      lineRectInset: resolveLineRectInset(
        hasLineInsetOverride ? patch : base,
        base.lineRectInset.x,
        base.lineRectInset.y
      ),
      ornamentSize: asSize(patch.ornamentSize, base.ornamentSize.w, base.ornamentSize.h),
      anchors: {
        cornerAnchorOffset: asPoint(
          patch.anchors && patch.anchors.cornerAnchorOffset,
          base.anchors.cornerAnchorOffset.x,
          base.anchors.cornerAnchorOffset.y
        ),
        edgeLineInset: Number.isFinite(patch.anchors && patch.anchors.edgeLineInset)
          ? patch.anchors.edgeLineInset
          : base.anchors.edgeLineInset,
        cornerJoinInset: Number.isFinite(patch.anchors && patch.anchors.cornerJoinInset)
          ? patch.anchors.cornerJoinInset
          : numberOrFallback(patch.cornerJoinInset, base.anchors.cornerJoinInset)
      },
      scales: {
        topOrnament: Number.isFinite(patch.scales && patch.scales.topOrnament)
          ? patch.scales.topOrnament
          : base.scales.topOrnament,
        bottomOrnament: Number.isFinite(patch.scales && patch.scales.bottomOrnament)
          ? patch.scales.bottomOrnament
          : base.scales.bottomOrnament
      },
      topOrnamentOffsetY: numberOrFallback(patch.topOrnamentOffsetY, base.topOrnamentOffsetY),
      bottomOrnamentOffsetY: numberOrFallback(patch.bottomOrnamentOffsetY, base.bottomOrnamentOffsetY),
      showCenterOrnaments: patch.showCenterOrnaments !== undefined
        ? !!patch.showCenterOrnaments
        : base.showCenterOrnaments
    };

    return computeFrameLayout(options);
  }

  function drawDebug(ctx, layout, options) {
    if (!ctx || typeof ctx.save !== "function" || !layout) return false;

    var cfg = options && typeof options === "object" ? options : {};
    var showRect = cfg.showRect !== false;
    var showAnchors = cfg.showAnchors !== false;
    var showLineRect = cfg.showLineRect !== false;
    var showBounds = cfg.showBounds !== false;
    var showEdgeLineAnchors = cfg.showEdgeLineAnchors !== false;

    ctx.save();
    try {
      if (showRect) {
        ctx.strokeStyle = cfg.rectColor || "rgba(90, 200, 255, 0.45)";
        ctx.lineWidth = cfg.rectWidth || 1;
        ctx.strokeRect(layout.rect.x, layout.rect.y, layout.rect.w, layout.rect.h);
      }

      if (showLineRect && layout.debug && layout.debug.lineRect) {
        ctx.strokeStyle = cfg.lineRectColor || "rgba(214, 185, 120, 0.55)";
        ctx.lineWidth = cfg.lineRectWidth || 1;
        var lineRect = layout.debug.lineRect;
        if (typeof ctx.setLineDash === "function") ctx.setLineDash([6, 4]);
        ctx.strokeRect(lineRect.x, lineRect.y, lineRect.w, lineRect.h);
        if (typeof ctx.setLineDash === "function") ctx.setLineDash([]);
      }

      if (showBounds && layout.debug && Array.isArray(layout.debug.boundingBoxes)) {
        var boxColors = {
          corner: cfg.cornerBoxColor || "rgba(205, 132, 255, 0.5)",
          edge: cfg.edgeBoxColor || "rgba(90, 200, 255, 0.35)",
          ornament: cfg.ornamentBoxColor || "rgba(120, 206, 170, 0.42)"
        };
        ctx.lineWidth = cfg.boxWidth || 1;
        for (var b = 0; b < layout.debug.boundingBoxes.length; b += 1) {
          var box = layout.debug.boundingBoxes[b];
          ctx.strokeStyle = boxColors[box.type] || "rgba(255, 255, 255, 0.35)";
          ctx.strokeRect(box.x, box.y, box.w, box.h);
        }
      }

      if (showAnchors && layout.debug && Array.isArray(layout.debug.anchorPoints)) {
        for (var i = 0; i < layout.debug.anchorPoints.length; i += 1) {
          var anchor = layout.debug.anchorPoints[i];
          ctx.fillStyle = anchor.type === "ornament"
            ? (cfg.ornamentAnchorColor || "rgba(255, 220, 120, 0.95)")
            : (cfg.anchorColor || "rgba(120, 206, 170, 0.95)");
          ctx.beginPath();
          ctx.arc(anchor.x, anchor.y, cfg.anchorRadius || 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (showEdgeLineAnchors && layout.debug && Array.isArray(layout.debug.edgeLineAnchors)) {
        ctx.fillStyle = cfg.edgeLineAnchorColor || "rgba(90, 200, 255, 0.95)";
        for (var j = 0; j < layout.debug.edgeLineAnchors.length; j += 1) {
          var lineAnchor = layout.debug.edgeLineAnchors[j];
          ctx.fillRect(
            lineAnchor.x - (cfg.edgeAnchorHalfSize || 2),
            lineAnchor.y - (cfg.edgeAnchorHalfSize || 2),
            (cfg.edgeAnchorHalfSize || 2) * 2,
            (cfg.edgeAnchorHalfSize || 2) * 2
          );
        }
      }

      return true;
    } catch (_error) {
      return false;
    } finally {
      ctx.restore();
    }
  }

  function drawFrameParts(ctx, visualAssets, layout, partMap, options) {
    if (!ctx || !visualAssets || !layout || !partMap) return false;

    var summary = { drawn: 0, missing: 0, failed: 0, total: 0 };
    var map = partMap;

    function drawPart(logicalName, box) {
      if (!logicalName || !box || box.hidden) {
        summary.missing += 1;
        return;
      }
      summary.total += 1;
      var ok = !!visualAssets.drawImage(ctx, logicalName, box.x, box.y, box.w, box.h, options);
      if (ok) summary.drawn += 1;
      else summary.failed += 1;
    }

    drawPart(map.corners && map.corners.tl, layout.corners.tl);
    drawPart(map.corners && map.corners.tr, layout.corners.tr);
    drawPart(map.corners && map.corners.bl, layout.corners.bl);
    drawPart(map.corners && map.corners.br, layout.corners.br);

    drawPart(map.edges && map.edges.top, layout.edges.top);
    drawPart(map.edges && map.edges.bottom, layout.edges.bottom);
    drawPart(map.edges && map.edges.left, layout.edges.left);
    drawPart(map.edges && map.edges.right, layout.edges.right);

    drawPart(map.ornaments && map.ornaments.topCenter, layout.ornaments.topCenter);
    drawPart(map.ornaments && map.ornaments.bottomCenter, layout.ornaments.bottomCenter);

    return summary;
  }

  root.HC.FrameComposer = {
    version: "0.1.0",
    status: "layout_ready",
    computeFrameLayout: computeFrameLayout,
    getDefaultSubmetaAstrolabeOptions: getDefaultSubmetaAstrolabeOptions,
    computeSubmetaAstrolabeLayout: computeSubmetaAstrolabeLayout,
    drawDebug: drawDebug,
    drawFrameParts: drawFrameParts
  };
})(typeof window !== "undefined" ? window : globalThis);
