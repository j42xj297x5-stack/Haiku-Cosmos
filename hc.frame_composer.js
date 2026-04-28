// Haiku Cosmos FrameComposer v0.1 (pure layout calculations + optional debug helpers).
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  function clampMin(value, minValue) {
    var number = Number(value);
    if (!Number.isFinite(number)) return minValue;
    return Math.max(minValue, number);
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

  function composeOptions(inputOptions) {
    var options = inputOptions && typeof inputOptions === "object" ? inputOptions : {};
    var rect = resolveRect(options.rect);
    var cornerSize = clampMin(options.cornerSize, 1);
    var edgeThickness = clampMin(options.edgeThickness, 1);

    var anchors = options.anchors && typeof options.anchors === "object" ? options.anchors : {};
    var scales = options.scales && typeof options.scales === "object" ? options.scales : {};

    var cornerAnchorOffset = asPoint(anchors.cornerAnchorOffset, 32, 32);
    var edgeLineInset = Number.isFinite(anchors.edgeLineInset) ? anchors.edgeLineInset : 10;

    var topOrnamentScale = Number.isFinite(scales.topOrnament) ? scales.topOrnament : 0.78;
    var bottomOrnamentScale = Number.isFinite(scales.bottomOrnament) ? scales.bottomOrnament : 0.84;

    var showCenterOrnaments = options.showCenterOrnaments !== false;

    return {
      rect: rect,
      cornerSize: cornerSize,
      edgeThickness: edgeThickness,
      anchors: {
        cornerAnchorOffset: cornerAnchorOffset,
        edgeLineInset: edgeLineInset
      },
      scales: {
        topOrnament: topOrnamentScale,
        bottomOrnament: bottomOrnamentScale
      },
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

    var centerX = rect.x + rect.w / 2;
    var centerY = rect.y + rect.h / 2;

    var cornerRunX = clampMin(cornerSize - cornerAnchorOffset.x, 0);
    var cornerRunY = clampMin(cornerSize - cornerAnchorOffset.y, 0);

    var edgeWidth = clampMin(rect.w - (cornerRunX * 2), 1);
    var edgeHeight = clampMin(rect.h - (cornerRunY * 2), 1);

    var corners = {
      tl: {
        x: rect.x - cornerAnchorOffset.x,
        y: rect.y - cornerAnchorOffset.y,
        w: cornerSize,
        h: cornerSize,
        anchorX: rect.x,
        anchorY: rect.y
      },
      tr: {
        x: rect.x + rect.w - (cornerSize - cornerAnchorOffset.x),
        y: rect.y - cornerAnchorOffset.y,
        w: cornerSize,
        h: cornerSize,
        anchorX: rect.x + rect.w,
        anchorY: rect.y
      },
      bl: {
        x: rect.x - cornerAnchorOffset.x,
        y: rect.y + rect.h - (cornerSize - cornerAnchorOffset.y),
        w: cornerSize,
        h: cornerSize,
        anchorX: rect.x,
        anchorY: rect.y + rect.h
      },
      br: {
        x: rect.x + rect.w - (cornerSize - cornerAnchorOffset.x),
        y: rect.y + rect.h - (cornerSize - cornerAnchorOffset.y),
        w: cornerSize,
        h: cornerSize,
        anchorX: rect.x + rect.w,
        anchorY: rect.y + rect.h
      }
    };

    var edges = {
      top: {
        x: rect.x + cornerRunX,
        y: rect.y - edgeLineInset,
        w: edgeWidth,
        h: edgeThickness,
        stretchAxis: "x"
      },
      bottom: {
        x: rect.x + cornerRunX,
        y: rect.y + rect.h - edgeThickness + edgeLineInset,
        w: edgeWidth,
        h: edgeThickness,
        stretchAxis: "x"
      },
      left: {
        x: rect.x - edgeLineInset,
        y: rect.y + cornerRunY,
        w: edgeThickness,
        h: edgeHeight,
        stretchAxis: "y"
      },
      right: {
        x: rect.x + rect.w - edgeThickness + edgeLineInset,
        y: rect.y + cornerRunY,
        w: edgeThickness,
        h: edgeHeight,
        stretchAxis: "y"
      }
    };

    var topOrnamentBaseW = clampMin(rect.w * 0.24, cornerSize * 1.8);
    var topOrnamentBaseH = clampMin(edgeThickness * 2.2, edgeThickness);
    var bottomOrnamentBaseW = topOrnamentBaseW;
    var bottomOrnamentBaseH = topOrnamentBaseH;

    var ornaments = {
      topCenter: {
        x: centerX - (topOrnamentBaseW * cfg.scales.topOrnament) / 2,
        y: rect.y - edgeLineInset - (topOrnamentBaseH * cfg.scales.topOrnament) / 2,
        w: topOrnamentBaseW * cfg.scales.topOrnament,
        h: topOrnamentBaseH * cfg.scales.topOrnament,
        scale: cfg.scales.topOrnament,
        anchorX: centerX,
        anchorY: rect.y
      },
      bottomCenter: {
        x: centerX - (bottomOrnamentBaseW * cfg.scales.bottomOrnament) / 2,
        y: rect.y + rect.h - edgeLineInset - (bottomOrnamentBaseH * cfg.scales.bottomOrnament) / 2,
        w: bottomOrnamentBaseW * cfg.scales.bottomOrnament,
        h: bottomOrnamentBaseH * cfg.scales.bottomOrnament,
        scale: cfg.scales.bottomOrnament,
        anchorX: centerX,
        anchorY: rect.y + rect.h
      }
    };

    if (!cfg.showCenterOrnaments) {
      ornaments.topCenter.hidden = true;
      ornaments.bottomCenter.hidden = true;
    }

    var anchorPoints = [
      { id: "corner.tl", x: corners.tl.anchorX, y: corners.tl.anchorY },
      { id: "corner.tr", x: corners.tr.anchorX, y: corners.tr.anchorY },
      { id: "corner.bl", x: corners.bl.anchorX, y: corners.bl.anchorY },
      { id: "corner.br", x: corners.br.anchorX, y: corners.br.anchorY },
      { id: "ornament.top", x: ornaments.topCenter.anchorX, y: ornaments.topCenter.anchorY },
      { id: "ornament.bottom", x: ornaments.bottomCenter.anchorX, y: ornaments.bottomCenter.anchorY }
    ];

    return {
      rect: rect,
      corners: corners,
      edges: edges,
      ornaments: ornaments,
      debug: {
        anchorPoints: anchorPoints,
        lineRect: {
          x: rect.x,
          y: rect.y,
          w: rect.w,
          h: rect.h,
          centerX: centerX,
          centerY: centerY
        }
      }
    };
  }

  function getDefaultSubmetaAstrolabeOptions(rect) {
    return {
      rect: resolveRect(rect),
      cornerSize: 80,
      edgeThickness: 28,
      anchors: {
        cornerAnchorOffset: { x: 32, y: 32 },
        edgeLineInset: 10
      },
      scales: {
        topOrnament: 0.78,
        bottomOrnament: 0.84
      },
      showCenterOrnaments: true
    };
  }

  function computeSubmetaAstrolabeLayout(rect, overrides) {
    var base = getDefaultSubmetaAstrolabeOptions(rect);
    var patch = overrides && typeof overrides === "object" ? overrides : {};

    var options = {
      rect: patch.rect || base.rect,
      cornerSize: Number.isFinite(patch.cornerSize) ? patch.cornerSize : base.cornerSize,
      edgeThickness: Number.isFinite(patch.edgeThickness) ? patch.edgeThickness : base.edgeThickness,
      anchors: {
        cornerAnchorOffset: asPoint(
          patch.anchors && patch.anchors.cornerAnchorOffset,
          base.anchors.cornerAnchorOffset.x,
          base.anchors.cornerAnchorOffset.y
        ),
        edgeLineInset: Number.isFinite(patch.anchors && patch.anchors.edgeLineInset)
          ? patch.anchors.edgeLineInset
          : base.anchors.edgeLineInset
      },
      scales: {
        topOrnament: Number.isFinite(patch.scales && patch.scales.topOrnament)
          ? patch.scales.topOrnament
          : base.scales.topOrnament,
        bottomOrnament: Number.isFinite(patch.scales && patch.scales.bottomOrnament)
          ? patch.scales.bottomOrnament
          : base.scales.bottomOrnament
      },
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
        ctx.strokeRect(lineRect.x, lineRect.y, lineRect.w, lineRect.h);
      }

      if (showAnchors && layout.debug && Array.isArray(layout.debug.anchorPoints)) {
        ctx.fillStyle = cfg.anchorColor || "rgba(120, 206, 170, 0.95)";
        for (var i = 0; i < layout.debug.anchorPoints.length; i += 1) {
          var anchor = layout.debug.anchorPoints[i];
          ctx.beginPath();
          ctx.arc(anchor.x, anchor.y, cfg.anchorRadius || 2, 0, Math.PI * 2);
          ctx.fill();
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
