(function () {
  "use strict";

  var canvas = document.getElementById("sandboxCanvas");
  var statusPanel = document.getElementById("statusPanel");
  var reloadButton = document.getElementById("btnReload");
  var toggleDebug = document.getElementById("toggleDebug");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  var manifestUrl = "/assets/visual/modular_frame_kit_v01_manifest.json";
  var targetRect = {
    x: 100,
    y: 90,
    w: 760,
    h: 460
  };
  var layoutParams = {
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
    bottomOrnamentOffsetY: 0
  };
  var partMap = {
    corners: {
      tl: "submeta.frame.corner.tl.astrolabe_01",
      tr: "submeta.frame.corner.tr.astrolabe_01",
      bl: "submeta.frame.corner.bl.astrolabe_01",
      br: "submeta.frame.corner.br.astrolabe_01"
    },
    edges: {
      top: "submeta.frame.edge.top_thin.astrolabe_01",
      bottom: "submeta.frame.edge.bottom_thin.astrolabe_01",
      left: "submeta.frame.edge.left_thin.astrolabe_01",
      right: "submeta.frame.edge.right_thin.astrolabe_01"
    },
    ornaments: {
      topCenter: "submeta.frame.center_ornament.top.astrolabe_01",
      bottomCenter: "submeta.frame.center_ornament.bottom.astrolabe_01"
    }
  };

  function printStatus(payload) {
    if (!statusPanel) return;
    statusPanel.textContent = JSON.stringify(payload, null, 2);
  }

  function collectRequestedLogicalNames() {
    return [
      partMap.corners.tl,
      partMap.corners.tr,
      partMap.corners.bl,
      partMap.corners.br,
      partMap.edges.top,
      partMap.edges.bottom,
      partMap.edges.left,
      partMap.edges.right,
      partMap.ornaments.topCenter,
      partMap.ornaments.bottomCenter
    ];
  }

  function findMissingLogicalNames(visualAssets, logicalNames) {
    var missing = [];
    for (var i = 0; i < logicalNames.length; i += 1) {
      var logicalName = logicalNames[i];
      if (!visualAssets.getAsset(logicalName)) {
        missing.push(logicalName);
      }
    }
    return missing;
  }

  async function render() {
    if (!ctx || !window.HC || !window.HC.VisualAssets || !window.HC.FrameComposer) {
      printStatus({ ok: false, error: "HC.VisualAssets / HC.FrameComposer unavailable" });
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var requestedLogicalNames = collectRequestedLogicalNames();
    var manifestResult = await window.HC.VisualAssets.loadManifest(manifestUrl);
    var missingLogicalNames = findMissingLogicalNames(window.HC.VisualAssets, requestedLogicalNames);
    var preloadResult = await window.HC.VisualAssets.preload(requestedLogicalNames);

    var layout = window.HC.FrameComposer.computeSubmetaAstrolabeLayout(targetRect, layoutParams);

    var drawSummary = window.HC.FrameComposer.drawFrameParts(
      ctx,
      window.HC.VisualAssets,
      layout,
      partMap
    );

    if (toggleDebug && toggleDebug.checked) {
      window.HC.FrameComposer.drawDebug(ctx, layout, {
        showRect: true,
        showAnchors: true,
        showLineRect: true,
        showBounds: true,
        showEdgeLineAnchors: true
      });
    }

    var diagnostics = window.HC.VisualAssets.getDiagnostics();
    var cornerTlLogicalName = partMap.corners.tl;

    printStatus({
      ok: true,
      manifestLoaded: !!manifestResult.manifestLoaded,
      assetCount: manifestResult.assetCount,
      manifestUrlRequested: manifestUrl,
      manifestUrlUsed: manifestResult.url,
      preload: {
        loaded: preloadResult.loaded,
        failed: preloadResult.failed,
        skipped: preloadResult.skipped
      },
      drawFrameParts: drawSummary,
      missingLogicalNames: missingLogicalNames,
      sampleCornerTl: {
        logicalName: cornerTlLogicalName,
        assetPath: window.HC.VisualAssets.getAssetPath(cornerTlLogicalName),
        assetUrl: window.HC.VisualAssets.getAssetUrl(cornerTlLogicalName)
      },
      layoutParams: {
        targetRect: targetRect,
        frameLineInsetX: layoutParams.lineRectInset.x,
        frameLineInsetY: layoutParams.lineRectInset.y,
        cornerSize: layoutParams.cornerSize,
        cornerAnchorOffset: layoutParams.anchors.cornerAnchorOffset,
        edgeThickness: layoutParams.edgeThickness,
        edgeLineInset: layoutParams.anchors.edgeLineInset,
        cornerJoinInset: layoutParams.anchors.cornerJoinInset,
        topOrnamentScale: layoutParams.scales.topOrnament,
        bottomOrnamentScale: layoutParams.scales.bottomOrnament,
        topOrnamentOffsetY: layoutParams.topOrnamentOffsetY,
        bottomOrnamentOffsetY: layoutParams.bottomOrnamentOffsetY
      },
      computedLayout: {
        frameLineRect: layout.frameLineRect,
        cornerAnchors: layout.debug.anchorPoints.filter(function (point) {
          return point.type === "corner";
        }),
        ornamentCenters: layout.debug.anchorPoints.filter(function (point) {
          return point.type === "ornament";
        }),
        edgeLineAnchors: layout.debug.edgeLineAnchors,
        boundingBoxes: layout.debug.boundingBoxes
      },
      diagnostics: diagnostics
    });
  }

  if (reloadButton) {
    reloadButton.addEventListener("click", function () {
      render().catch(function (error) {
        printStatus({ ok: false, error: String(error && error.message ? error.message : error) });
      });
    });
  }

  if (toggleDebug) {
    toggleDebug.addEventListener("change", function () {
      render().catch(function (error) {
        printStatus({ ok: false, error: String(error && error.message ? error.message : error) });
      });
    });
  }

  render().catch(function (error) {
    printStatus({ ok: false, error: String(error && error.message ? error.message : error) });
  });
})();
