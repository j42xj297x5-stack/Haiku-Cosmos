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

  var SUBMETA_MAIN_FRAME_V01_REFERENCE = {
    frameLineRect: { w: 1600, h: 900 },
    corners: {
      tl: {
        size: { w: 213.775, h: 199.365 },
        pivot: { x: 14.347, y: 12.805 },
        horizontalJoin: { x: 213.183, y: 12.805 },
        verticalJoin: { x: 14.347, y: 192.36 }
      },
      tr: {
        size: { w: 213.775, h: 199.365 },
        pivot: { x: 199.259, y: 12.805 },
        horizontalJoin: { x: 0.422, y: 12.805 },
        verticalJoin: { x: 199.259, y: 192.36 }
      },
      bl: {
        size: { w: 213.775, h: 199.365 },
        pivot: { x: 14.346, y: 186.56 },
        horizontalJoin: { x: 213.183, y: 186.56 },
        verticalJoin: { x: 14.346, y: 7.005 }
      },
      br: {
        size: { w: 213.775, h: 199.365 },
        pivot: { x: 199.429, y: 186.56 },
        horizontalJoin: { x: 0.592, y: 186.56 },
        verticalJoin: { x: 199.429, y: 7.005 }
      }
    },
    ornaments: {
      topCenter: {
        size: { w: 323.452, h: 81.125 },
        center: { x: 160.233, y: 36.863 },
        leftJoin: { x: 26.972, y: 36.863 },
        rightJoin: { x: 293.494, y: 36.863 }
      },
      bottomCenter: {
        size: { w: 397.823, h: 43.518 },
        center: { x: 198.621, y: 14.077 },
        leftJoin: { x: 32.632, y: 14.077 },
        rightJoin: { x: 364.609, y: 14.077 }
      },
      leftCenter: {
        size: { w: 52.158, h: 257.516 },
        center: { x: 26.079, y: 131.045 },
        topJoin: { x: 26.079, y: 4.586 },
        bottomJoin: { x: 26.079, y: 257.503 }
      },
      rightCenter: {
        size: { w: 52.158, h: 257.516 },
        center: { x: 26.079, y: 131.045 },
        topJoin: { x: 26.079, y: 4.586 },
        bottomJoin: { x: 26.079, y: 257.503 }
      }
    },
    segmentSources: {
      top: {
        size: { w: 324.279, h: 14.335 },
        lineStart: { x: 24.194, y: 1.354 },
        lineEnd: { x: 300.085, y: 1.354 }
      },
      bottom: {
        size: { w: 324.279, h: 14.529 },
        lineStart: { x: 68.932, y: 6.986 },
        lineEnd: { x: 252.139, y: 6.986 }
      },
      vertical: {
        size: { w: 23.685, h: 388.188 },
        lineStart: { x: 11.784, y: 11.595 },
        lineEnd: { x: 11.784, y: 375.621 }
      }
    }
  };

  function getDefaultSubmetaMainFrameV01Options(rect) {
    return {
      rect: resolveRect(rect),
      lineRectInset: { x: 0, y: 0 },
      contentSafeInset: null,
      referenceFrameLineRect: SUBMETA_MAIN_FRAME_V01_REFERENCE.frameLineRect,
      showCenterOrnaments: true
    };
  }

  function placeAssetByAnchor(part, anchor, target, scale) {
    return {
      x: target.x - anchor.x * scale,
      y: target.y - anchor.y * scale,
      w: part.size.w * scale,
      h: part.size.h * scale,
      scale: scale,
      anchorX: target.x,
      anchorY: target.y,
      anchorLocalX: anchor.x,
      anchorLocalY: anchor.y
    };
  }

  function localToWorld(box, point, scale) {
    return {
      x: box.x + point.x * scale,
      y: box.y + point.y * scale
    };
  }

  function buildHorizontalSegment(source, start, end, scaleY) {
    var lineLength = clampMin(source.lineEnd.x - source.lineStart.x, 1);
    var targetLength = clampMin(end.x - start.x, 1);
    var scaleX = targetLength / lineLength;
    return {
      x: start.x - source.lineStart.x * scaleX,
      y: start.y - source.lineStart.y * scaleY,
      w: source.size.w * scaleX,
      h: source.size.h * scaleY,
      stretchAxis: "x",
      scaleX: scaleX,
      scaleY: scaleY,
      lineStartX: start.x,
      lineEndX: end.x,
      lineY: start.y
    };
  }

  function buildVerticalSegment(source, start, end, scaleX) {
    var lineLength = clampMin(source.lineEnd.y - source.lineStart.y, 1);
    var targetLength = clampMin(end.y - start.y, 1);
    var scaleY = targetLength / lineLength;
    return {
      x: start.x - source.lineStart.x * scaleX,
      y: start.y - source.lineStart.y * scaleY,
      w: source.size.w * scaleX,
      h: source.size.h * scaleY,
      stretchAxis: "y",
      scaleX: scaleX,
      scaleY: scaleY,
      lineX: start.x,
      lineStartY: start.y,
      lineEndY: end.y
    };
  }

  function computeSubmetaMainFrameV01Layout(rect, overrides) {
    var base = getDefaultSubmetaMainFrameV01Options(rect);
    var patch = overrides && typeof overrides === "object" ? overrides : {};
    var targetRect = resolveRect(patch.rect || rect || base.rect);
    var inset = resolveLineRectInset(
      patch.lineRectInset || patch.frameLineInsetX !== undefined || patch.frameLineInsetY !== undefined
        ? patch
        : base,
      base.lineRectInset.x,
      base.lineRectInset.y
    );
    var frameLineRect = computeFrameLineRect(targetRect, inset);
    var refLineRect = SUBMETA_MAIN_FRAME_V01_REFERENCE.frameLineRect;
    var scaleX = frameLineRect.w / refLineRect.w;
    var scaleY = frameLineRect.h / refLineRect.h;
    var uniformScale = Number.isFinite(patch.uniformScale)
      ? clampMin(patch.uniformScale, 0.01)
      : clampMin(Math.min(scaleX, scaleY), 0.01);
    var centerX = frameLineRect.x + frameLineRect.w / 2;
    var centerY = frameLineRect.y + frameLineRect.h / 2;
    var ref = SUBMETA_MAIN_FRAME_V01_REFERENCE;

    var corners = {
      tl: placeAssetByAnchor(ref.corners.tl, ref.corners.tl.pivot, { x: frameLineRect.x, y: frameLineRect.y }, uniformScale),
      tr: placeAssetByAnchor(ref.corners.tr, ref.corners.tr.pivot, { x: frameLineRect.x + frameLineRect.w, y: frameLineRect.y }, uniformScale),
      bl: placeAssetByAnchor(ref.corners.bl, ref.corners.bl.pivot, { x: frameLineRect.x, y: frameLineRect.y + frameLineRect.h }, uniformScale),
      br: placeAssetByAnchor(ref.corners.br, ref.corners.br.pivot, { x: frameLineRect.x + frameLineRect.w, y: frameLineRect.y + frameLineRect.h }, uniformScale)
    };

    var ornaments = {
      topCenter: placeAssetByAnchor(ref.ornaments.topCenter, ref.ornaments.topCenter.center, { x: centerX, y: frameLineRect.y }, uniformScale),
      bottomCenter: placeAssetByAnchor(ref.ornaments.bottomCenter, ref.ornaments.bottomCenter.center, { x: centerX, y: frameLineRect.y + frameLineRect.h }, uniformScale),
      leftCenter: placeAssetByAnchor(ref.ornaments.leftCenter, ref.ornaments.leftCenter.center, { x: frameLineRect.x, y: centerY }, uniformScale),
      rightCenter: placeAssetByAnchor(ref.ornaments.rightCenter, ref.ornaments.rightCenter.center, { x: frameLineRect.x + frameLineRect.w, y: centerY }, uniformScale)
    };

    if (patch.showCenterOrnaments === false) {
      ornaments.topCenter.hidden = true;
      ornaments.bottomCenter.hidden = true;
      ornaments.leftCenter.hidden = true;
      ornaments.rightCenter.hidden = true;
    }

    var joins = {
      cornerTlHorizontal: localToWorld(corners.tl, ref.corners.tl.horizontalJoin, uniformScale),
      cornerTrHorizontal: localToWorld(corners.tr, ref.corners.tr.horizontalJoin, uniformScale),
      cornerBlHorizontal: localToWorld(corners.bl, ref.corners.bl.horizontalJoin, uniformScale),
      cornerBrHorizontal: localToWorld(corners.br, ref.corners.br.horizontalJoin, uniformScale),
      cornerTlVertical: localToWorld(corners.tl, ref.corners.tl.verticalJoin, uniformScale),
      cornerTrVertical: localToWorld(corners.tr, ref.corners.tr.verticalJoin, uniformScale),
      cornerBlVertical: localToWorld(corners.bl, ref.corners.bl.verticalJoin, uniformScale),
      cornerBrVertical: localToWorld(corners.br, ref.corners.br.verticalJoin, uniformScale),
      ornamentTopLeft: localToWorld(ornaments.topCenter, ref.ornaments.topCenter.leftJoin, uniformScale),
      ornamentTopRight: localToWorld(ornaments.topCenter, ref.ornaments.topCenter.rightJoin, uniformScale),
      ornamentBottomLeft: localToWorld(ornaments.bottomCenter, ref.ornaments.bottomCenter.leftJoin, uniformScale),
      ornamentBottomRight: localToWorld(ornaments.bottomCenter, ref.ornaments.bottomCenter.rightJoin, uniformScale),
      ornamentLeftTop: localToWorld(ornaments.leftCenter, ref.ornaments.leftCenter.topJoin, uniformScale),
      ornamentLeftBottom: localToWorld(ornaments.leftCenter, ref.ornaments.leftCenter.bottomJoin, uniformScale),
      ornamentRightTop: localToWorld(ornaments.rightCenter, ref.ornaments.rightCenter.topJoin, uniformScale),
      ornamentRightBottom: localToWorld(ornaments.rightCenter, ref.ornaments.rightCenter.bottomJoin, uniformScale)
    };

    var segments = {
      topLeft: buildHorizontalSegment(ref.segmentSources.top, joins.cornerTlHorizontal, joins.ornamentTopLeft, uniformScale),
      topRight: buildHorizontalSegment(ref.segmentSources.top, joins.ornamentTopRight, joins.cornerTrHorizontal, uniformScale),
      bottomLeft: buildHorizontalSegment(ref.segmentSources.bottom, joins.cornerBlHorizontal, joins.ornamentBottomLeft, uniformScale),
      bottomRight: buildHorizontalSegment(ref.segmentSources.bottom, joins.ornamentBottomRight, joins.cornerBrHorizontal, uniformScale),
      leftTop: buildVerticalSegment(ref.segmentSources.vertical, joins.cornerTlVertical, joins.ornamentLeftTop, uniformScale),
      leftBottom: buildVerticalSegment(ref.segmentSources.vertical, joins.ornamentLeftBottom, joins.cornerBlVertical, uniformScale),
      rightTop: buildVerticalSegment(ref.segmentSources.vertical, joins.cornerTrVertical, joins.ornamentRightTop, uniformScale),
      rightBottom: buildVerticalSegment(ref.segmentSources.vertical, joins.ornamentRightBottom, joins.cornerBrVertical, uniformScale)
    };

    var contentSafeInset = patch.contentSafeInset
      ? asPoint(patch.contentSafeInset, 0, 0)
      : { x: 84 * uniformScale, y: 64 * uniformScale };
    var contentSafeRect = {
      x: frameLineRect.x + contentSafeInset.x,
      y: frameLineRect.y + contentSafeInset.y,
      w: clampMin(frameLineRect.w - contentSafeInset.x * 2, 1),
      h: clampMin(frameLineRect.h - contentSafeInset.y * 2, 1)
    };

    var anchorPoints = [
      { id: "corner.tl", type: "corner", x: frameLineRect.x, y: frameLineRect.y },
      { id: "corner.tr", type: "corner", x: frameLineRect.x + frameLineRect.w, y: frameLineRect.y },
      { id: "corner.bl", type: "corner", x: frameLineRect.x, y: frameLineRect.y + frameLineRect.h },
      { id: "corner.br", type: "corner", x: frameLineRect.x + frameLineRect.w, y: frameLineRect.y + frameLineRect.h },
      { id: "ornament.top_center", type: "ornament", x: centerX, y: frameLineRect.y },
      { id: "ornament.bottom_center", type: "ornament", x: centerX, y: frameLineRect.y + frameLineRect.h },
      { id: "ornament.left_center", type: "ornament", x: frameLineRect.x, y: centerY },
      { id: "ornament.right_center", type: "ornament", x: frameLineRect.x + frameLineRect.w, y: centerY }
    ];
    var segmentJoinPoints = [
      { id: "top_left.start", x: joins.cornerTlHorizontal.x, y: joins.cornerTlHorizontal.y },
      { id: "top_left.end", x: joins.ornamentTopLeft.x, y: joins.ornamentTopLeft.y },
      { id: "top_right.start", x: joins.ornamentTopRight.x, y: joins.ornamentTopRight.y },
      { id: "top_right.end", x: joins.cornerTrHorizontal.x, y: joins.cornerTrHorizontal.y },
      { id: "bottom_left.start", x: joins.cornerBlHorizontal.x, y: joins.cornerBlHorizontal.y },
      { id: "bottom_left.end", x: joins.ornamentBottomLeft.x, y: joins.ornamentBottomLeft.y },
      { id: "bottom_right.start", x: joins.ornamentBottomRight.x, y: joins.ornamentBottomRight.y },
      { id: "bottom_right.end", x: joins.cornerBrHorizontal.x, y: joins.cornerBrHorizontal.y },
      { id: "left_top.start", x: joins.cornerTlVertical.x, y: joins.cornerTlVertical.y },
      { id: "left_top.end", x: joins.ornamentLeftTop.x, y: joins.ornamentLeftTop.y },
      { id: "left_bottom.start", x: joins.ornamentLeftBottom.x, y: joins.ornamentLeftBottom.y },
      { id: "left_bottom.end", x: joins.cornerBlVertical.x, y: joins.cornerBlVertical.y },
      { id: "right_top.start", x: joins.cornerTrVertical.x, y: joins.cornerTrVertical.y },
      { id: "right_top.end", x: joins.ornamentRightTop.x, y: joins.ornamentRightTop.y },
      { id: "right_bottom.start", x: joins.ornamentRightBottom.x, y: joins.ornamentRightBottom.y },
      { id: "right_bottom.end", x: joins.cornerBrVertical.x, y: joins.cornerBrVertical.y }
    ];
    var boundingBoxes = [
      asBounds("segment.top_left", "segment", segments.topLeft),
      asBounds("segment.top_right", "segment", segments.topRight),
      asBounds("segment.bottom_left", "segment", segments.bottomLeft),
      asBounds("segment.bottom_right", "segment", segments.bottomRight),
      asBounds("segment.left_top", "segment", segments.leftTop),
      asBounds("segment.left_bottom", "segment", segments.leftBottom),
      asBounds("segment.right_top", "segment", segments.rightTop),
      asBounds("segment.right_bottom", "segment", segments.rightBottom),
      asBounds("corner.tl", "corner", corners.tl),
      asBounds("corner.tr", "corner", corners.tr),
      asBounds("corner.bl", "corner", corners.bl),
      asBounds("corner.br", "corner", corners.br),
      asBounds("ornament.top_center", "ornament", ornaments.topCenter),
      asBounds("ornament.bottom_center", "ornament", ornaments.bottomCenter),
      asBounds("ornament.left_center", "ornament", ornaments.leftCenter),
      asBounds("ornament.right_center", "ornament", ornaments.rightCenter)
    ];

    return {
      rect: targetRect,
      frameLineRect: frameLineRect,
      contentSafeRect: contentSafeRect,
      corners: corners,
      ornaments: ornaments,
      segments: segments,
      debug: {
        targetRect: targetRect,
        lineRect: {
          x: frameLineRect.x,
          y: frameLineRect.y,
          w: frameLineRect.w,
          h: frameLineRect.h,
          centerX: centerX,
          centerY: centerY,
          insetX: frameLineRect.insetX,
          insetY: frameLineRect.insetY
        },
        contentSafeRect: contentSafeRect,
        anchorPoints: anchorPoints,
        segmentJoinPoints: segmentJoinPoints,
        edgeLineAnchors: segmentJoinPoints,
        boundingBoxes: boundingBoxes,
        scale: {
          referenceW: refLineRect.w,
          referenceH: refLineRect.h,
          scaleX: scaleX,
          scaleY: scaleY,
          uniformScale: uniformScale
        }
      }
    };
  }

  function drawDebug(ctx, layout, options) {
    if (!ctx || typeof ctx.save !== "function" || !layout) return false;

    var cfg = options && typeof options === "object" ? options : {};
    var showRect = cfg.showRect !== false;
    var showAnchors = cfg.showAnchors !== false;
    var showLineRect = cfg.showLineRect !== false;
    var showContentSafeRect = cfg.showContentSafeRect !== false;
    var showBounds = cfg.showBounds !== false;
    var showEdgeLineAnchors = cfg.showEdgeLineAnchors !== false;
    var showSegmentJoinPoints = cfg.showSegmentJoinPoints !== false;

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

      if (showContentSafeRect && layout.debug && layout.debug.contentSafeRect) {
        ctx.strokeStyle = cfg.contentSafeRectColor || "rgba(120, 206, 170, 0.35)";
        ctx.lineWidth = cfg.contentSafeRectWidth || 1;
        var contentSafe = layout.debug.contentSafeRect;
        if (typeof ctx.setLineDash === "function") ctx.setLineDash([3, 4]);
        ctx.strokeRect(contentSafe.x, contentSafe.y, contentSafe.w, contentSafe.h);
        if (typeof ctx.setLineDash === "function") ctx.setLineDash([]);
      }

      if (showBounds && layout.debug && Array.isArray(layout.debug.boundingBoxes)) {
        var boxColors = {
          corner: cfg.cornerBoxColor || "rgba(205, 132, 255, 0.5)",
          edge: cfg.edgeBoxColor || "rgba(90, 200, 255, 0.35)",
          segment: cfg.segmentBoxColor || "rgba(90, 200, 255, 0.35)",
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

      if (showSegmentJoinPoints && layout.debug && Array.isArray(layout.debug.segmentJoinPoints)) {
        ctx.fillStyle = cfg.segmentJoinColor || "rgba(255, 209, 13, 0.95)";
        for (var k = 0; k < layout.debug.segmentJoinPoints.length; k += 1) {
          var joinPoint = layout.debug.segmentJoinPoints[k];
          ctx.beginPath();
          ctx.arc(joinPoint.x, joinPoint.y, cfg.segmentJoinRadius || 2, 0, Math.PI * 2);
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

  function drawSegmentedFrameParts(ctx, visualAssets, layout, partMap, options) {
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

    drawPart(map.segments && map.segments.topLeft, layout.segments && layout.segments.topLeft);
    drawPart(map.segments && map.segments.topRight, layout.segments && layout.segments.topRight);
    drawPart(map.segments && map.segments.bottomLeft, layout.segments && layout.segments.bottomLeft);
    drawPart(map.segments && map.segments.bottomRight, layout.segments && layout.segments.bottomRight);
    drawPart(map.segments && map.segments.leftTop, layout.segments && layout.segments.leftTop);
    drawPart(map.segments && map.segments.leftBottom, layout.segments && layout.segments.leftBottom);
    drawPart(map.segments && map.segments.rightTop, layout.segments && layout.segments.rightTop);
    drawPart(map.segments && map.segments.rightBottom, layout.segments && layout.segments.rightBottom);

    drawPart(map.corners && map.corners.tl, layout.corners && layout.corners.tl);
    drawPart(map.corners && map.corners.tr, layout.corners && layout.corners.tr);
    drawPart(map.corners && map.corners.bl, layout.corners && layout.corners.bl);
    drawPart(map.corners && map.corners.br, layout.corners && layout.corners.br);

    drawPart(map.ornaments && map.ornaments.topCenter, layout.ornaments && layout.ornaments.topCenter);
    drawPart(map.ornaments && map.ornaments.bottomCenter, layout.ornaments && layout.ornaments.bottomCenter);
    drawPart(map.ornaments && map.ornaments.leftCenter, layout.ornaments && layout.ornaments.leftCenter);
    drawPart(map.ornaments && map.ornaments.rightCenter, layout.ornaments && layout.ornaments.rightCenter);

    return summary;
  }

  root.HC.FrameComposer = {
    version: "0.2.0",
    status: "layout_ready",
    computeFrameLayout: computeFrameLayout,
    getDefaultSubmetaAstrolabeOptions: getDefaultSubmetaAstrolabeOptions,
    computeSubmetaAstrolabeLayout: computeSubmetaAstrolabeLayout,
    getDefaultSubmetaMainFrameV01Options: getDefaultSubmetaMainFrameV01Options,
    computeSubmetaMainFrameV01Layout: computeSubmetaMainFrameV01Layout,
    drawDebug: drawDebug,
    drawFrameParts: drawFrameParts,
    drawSegmentedFrameParts: drawSegmentedFrameParts
  };
})(typeof window !== "undefined" ? window : globalThis);
