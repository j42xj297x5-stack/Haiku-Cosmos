// Haiku Cosmos SUB-META layout extraction v0.1.
// Pure geometry + semantic mount points; no mechanics and no rendering.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  var DEFAULT_SLOTS = [
    { key: "forma", label: "Forma" },
    { key: "intencja", label: "Intencja" },
    { key: "czas", label: "Czas" },
    { key: "cisza", label: "Cisza" }
  ];

  var DEFAULT_PRG_BRANCHES = [
    { key: "radius", color: "red" },
    { key: "glue", color: "yellow" },
    { key: "speed", color: "green" },
    { key: "objects", color: "blue" }
  ];

  var DEFAULT_CARD_METRICS = {
    w: 20,
    h: 26,
    gapX: 12,
    gapY: 10,
    countPad: 8
  };

  var IMPORTANT_MOUNT_POINTS = [
    "submeta.root_frame",
    "submeta.header_frame",
    "submeta.prg_panel_frame",
    "submeta.world_slots_panel_frame",
    "submeta.inventory_panel_frame",
    "submeta.picker_panel_frame",
    "submeta.forge_panel_frame",
    "submeta.card_detail_panel_frame",
    "submeta.button.back",
    "submeta.button.confirm"
  ];

  function numberOrFallback(value, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function rectOrNull(rect) {
    if (!rect || typeof rect !== "object") return null;
    var x = Number(rect.x);
    var y = Number(rect.y);
    var w = Number(rect.w);
    var h = Number(rect.h);
    if (!Number.isFinite(w)) w = Number(rect.width);
    if (!Number.isFinite(h)) h = Number(rect.height);
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) return null;
    return { x: x, y: y, w: w, h: h };
  }

  function cloneRect(rect) {
    return rectOrNull(rect);
  }

  function cloneList(list, fallback) {
    var source = Array.isArray(list) && list.length ? list : fallback;
    return source.map(function (item) {
      return Object.assign({}, item);
    });
  }

  function getMetrics(options) {
    var source = options.cardMetrics || options.card || {};
    return {
      w: numberOrFallback(source.w, DEFAULT_CARD_METRICS.w),
      h: numberOrFallback(source.h, DEFAULT_CARD_METRICS.h),
      gapX: numberOrFallback(source.gapX, DEFAULT_CARD_METRICS.gapX),
      gapY: numberOrFallback(source.gapY, DEFAULT_CARD_METRICS.gapY),
      countPad: numberOrFallback(source.countPad, DEFAULT_CARD_METRICS.countPad)
    };
  }

  function computeDensity(width, height) {
    if (width < 900 || height < 600) return "small";
    if (width < 1400) return "medium";
    return "large";
  }

  function compute(width, height, inputOptions) {
    var options = inputOptions && typeof inputOptions === "object" ? inputOptions : {};
    var screenW = numberOrFallback(width, 0);
    var screenH = numberOrFallback(height, 0);
    var slots = cloneList(options.slots, DEFAULT_SLOTS);
    var prgBranchesSource = cloneList(options.prgBranches, DEFAULT_PRG_BRANCHES);
    var metrics = getMetrics(options);
    var density = computeDensity(screenW, screenH);

    var panelW = Math.min(780, Math.floor(screenW * 0.94));
    var panelH = Math.min(640, Math.floor(screenH * 0.92));
    var panelX = Math.floor((screenW - panelW) / 2);
    var panelY = Math.floor((screenH - panelH) / 2);
    var pad = 18;
    var headerH = 28;
    var columnGap = 16;
    var rowGap = 14;
    var contentW = panelW - pad * 2;
    var leftW = Math.floor(contentW * 0.48);
    var rightW = contentW - leftW - columnGap;
    var leftX = panelX + pad;
    var rightX = leftX + leftW + columnGap;
    var columnTop = panelY + pad + headerH;
    var contentH = panelH - pad * 2 - headerH;
    var prgPanelH = Math.min(160, Math.max(130, Math.floor(contentH * 0.26)));
    var prgRect = {
      x: leftX,
      y: columnTop,
      w: leftW,
      h: prgPanelH
    };
    var pickerInset = 8;
    var closeW = 88;
    var closeH = 26;
    var closeButton = {
      x: panelX + panelW - pad - closeW,
      y: panelY + pad - 4,
      w: closeW,
      h: closeH
    };
    var prgInset = 10;
    var prgInner = {
      x: prgRect.x + prgInset,
      y: prgRect.y + prgInset,
      w: prgRect.w - prgInset * 2,
      h: prgRect.h - prgInset * 2
    };
    var prgBranchRowH = Math.max(56, prgInner.h);
    var prgBranchGap = 10;
    var branchCount = Math.max(1, prgBranchesSource.length);
    var prgBranchW = Math.floor((prgInner.w - prgBranchGap * (branchCount - 1)) / branchCount);
    var prgSlotPad = 6;
    var prgSlotW = metrics.w + prgSlotPad * 2;
    var prgSlotH = metrics.h + prgSlotPad * 2;
    var prgSlotGap = 6;
    var prgBranches = prgBranchesSource.map(function (branch, index) {
      var colX = prgInner.x + index * (prgBranchW + prgBranchGap);
      var colY = prgInner.y;
      var slotsW = prgSlotW * 2 + prgSlotGap;
      var slotsX = colX + Math.floor((prgBranchW - slotsW) / 2);
      var slotY = colY + Math.floor((prgBranchRowH - prgSlotH) / 2);
      var r1Slot = {
        x: slotsX,
        y: slotY,
        w: prgSlotW,
        h: prgSlotH
      };
      var odbSlot = {
        x: slotsX + prgSlotW + prgSlotGap,
        y: slotY,
        w: prgSlotW,
        h: prgSlotH
      };
      return {
        key: branch.key,
        color: branch.color,
        column: { x: colX, y: colY, w: prgBranchW, h: prgBranchRowH },
        r1Slot: r1Slot,
        odbSlot: odbSlot
      };
    });
    var prgR2RowH = Math.max(prgSlotH + 8, Math.floor(prgSlotH * 1.25));
    var prgR2Rect = {
      x: leftX,
      y: prgRect.y + prgRect.h + rowGap,
      w: leftW,
      h: prgR2RowH
    };
    var prgR2Gap = 12;
    var prgR2SlotW = Math.min(prgSlotW + 6, Math.floor((prgR2Rect.w - prgInset * 2 - prgR2Gap * 2) / 3));
    var prgR2SlotH = prgSlotH;
    var prgR2StartX = prgR2Rect.x + prgInset;
    var prgR2RowY = prgR2Rect.y + Math.floor((prgR2Rect.h - prgR2SlotH) / 2);
    var prgR2Slots = [0, 1, 2].map(function (index) {
      return {
        x: prgR2StartX + index * (prgR2SlotW + prgR2Gap),
        y: prgR2RowY,
        w: prgR2SlotW,
        h: prgR2SlotH,
        index: index
      };
    });
    var worldR2Rect = {
      x: leftX,
      y: prgR2Rect.y + prgR2Rect.h + rowGap,
      w: leftW,
      h: Math.max(prgSlotH + 10, prgR2RowH)
    };
    var worldPad = 10;
    var worldGridGap = 12;
    var worldRect = {
      x: leftX,
      y: worldR2Rect.y + worldR2Rect.h + rowGap,
      w: leftW,
      h: Math.max(160, panelY + panelH - pad - (worldR2Rect.y + worldR2Rect.h + rowGap))
    };
    var worldInner = {
      x: worldRect.x + worldPad,
      y: worldRect.y + worldPad,
      w: worldRect.w - worldPad * 2,
      h: worldRect.h - worldPad * 2
    };
    var worldCellW = Math.floor((worldInner.w - worldGridGap) / 2);
    var worldCellH = Math.floor((worldInner.h - worldGridGap) / 2);
    var worldGridW = worldCellW * 2 + worldGridGap;
    var worldGridH = worldCellH * 2 + worldGridGap;
    var worldGridX = worldInner.x + Math.floor((worldInner.w - worldGridW) / 2);
    var worldGridY = worldInner.y + Math.floor((worldInner.h - worldGridH) / 2);
    var worldSocketGap = 8;
    var worldSocketW = prgSlotW;
    var worldSocketH = prgSlotH;
    var worldSlots = slots.map(function (slot, index) {
      var row = Math.floor(index / 2);
      var col = index % 2;
      var x = worldGridX + col * (worldCellW + worldGridGap);
      var y = worldGridY + row * (worldCellH + worldGridGap);
      var socketsW = worldSocketW * 3 + worldSocketGap * 2;
      var socketsX = x + Math.floor((worldCellW - socketsW) / 2);
      var socketsY = y + Math.floor((worldCellH - worldSocketH) / 2);
      var sockets = [0, 1, 2].map(function (socketIndex) {
        return {
          x: socketsX + socketIndex * (worldSocketW + worldSocketGap),
          y: socketsY,
          w: worldSocketW,
          h: worldSocketH,
          index: socketIndex
        };
      });
      return Object.assign({}, slot, {
        x: x,
        y: y,
        w: worldCellW,
        h: worldCellH,
        sockets: sockets
      });
    });
    var worldR2Gap = 12;
    var worldR2SlotW = Math.min(prgSlotW + 6, Math.floor((worldR2Rect.w - worldPad * 2 - worldR2Gap * 2) / 3));
    var worldR2SlotH = prgSlotH;
    var worldR2StartX = worldR2Rect.x + worldPad;
    var worldR2RowY = worldR2Rect.y + Math.floor((worldR2Rect.h - worldR2SlotH) / 2);
    var worldR2Slots = [0, 1, 2].map(function (index) {
      return {
        x: worldR2StartX + index * (worldR2SlotW + worldR2Gap),
        y: worldR2RowY,
        w: worldR2SlotW,
        h: worldR2SlotH,
        index: index
      };
    });
    var hitRects = [];
    prgR2Slots.forEach(function (slot) {
      hitRects.push({ type: "prg-r2", index: slot.index, x: slot.x, y: slot.y, w: slot.w, h: slot.h });
    });
    prgBranches.forEach(function (branch) {
      hitRects.push({ type: "prg-r1", branchKey: branch.key, x: branch.r1Slot.x, y: branch.r1Slot.y, w: branch.r1Slot.w, h: branch.r1Slot.h });
    });
    worldR2Slots.forEach(function (slot) {
      hitRects.push({ type: "world-r2", index: slot.index, x: slot.x, y: slot.y, w: slot.w, h: slot.h });
    });
    worldSlots.forEach(function (slot) {
      slot.sockets.forEach(function (socket) {
        hitRects.push({
          type: "world-r1",
          slotKey: slot.key,
          slotIndex: socket.index,
          x: socket.x,
          y: socket.y,
          w: socket.w,
          h: socket.h
        });
      });
    });
    var inventoryRect = { x: rightX, y: columnTop, w: rightW, h: prgRect.h };
    var pickerBandY = prgR2Rect.y;
    var pickerBandH = worldR2Rect.y + worldR2Rect.h - prgR2Rect.y;
    var pickerSplitGap = 12;
    var minAssignW = 4 * (metrics.w + metrics.gapX) - metrics.gapX;
    var minForgeW = 7 * (metrics.w + metrics.gapX) - metrics.gapX;
    var assignPanelW = Math.max(minAssignW, Math.floor(rightW * 0.35));
    var forgePanelW = rightW - assignPanelW - pickerSplitGap;
    if (forgePanelW < minForgeW) {
      forgePanelW = minForgeW;
      assignPanelW = rightW - forgePanelW - pickerSplitGap;
    }
    if (assignPanelW < minAssignW) {
      assignPanelW = minAssignW;
      forgePanelW = rightW - assignPanelW - pickerSplitGap;
    }
    var pickerRect = { x: rightX, y: pickerBandY, w: assignPanelW, h: pickerBandH };
    var pickerAssignRect = {
      x: pickerRect.x + pickerInset,
      y: pickerRect.y + pickerInset,
      w: pickerRect.w - pickerInset * 2,
      h: pickerRect.h - pickerInset * 2
    };
    var pickerForgeFrameRect = {
      x: pickerRect.x + pickerRect.w + pickerSplitGap,
      y: pickerBandY,
      w: forgePanelW,
      h: pickerBandH
    };
    var pickerForgeRect = {
      x: pickerForgeFrameRect.x + pickerInset,
      y: pickerForgeFrameRect.y + pickerInset,
      w: pickerForgeFrameRect.w - pickerInset * 2,
      h: pickerForgeFrameRect.h - pickerInset * 2
    };
    var inventoryInset = 8;
    var inventoryInnerRect = {
      x: inventoryRect.x + inventoryInset,
      y: inventoryRect.y + inventoryInset,
      w: inventoryRect.w - inventoryInset * 2,
      h: inventoryRect.h - inventoryInset * 2
    };
    var cardInfoRect = {
      x: rightX,
      y: worldRect.y,
      w: rightW,
      h: worldRect.h
    };
    var assignW = 100;
    var assignH = 26;
    var assignButton = {
      x: cardInfoRect.x + cardInfoRect.w - assignW - 12,
      y: cardInfoRect.y + cardInfoRect.h - assignH - 10,
      w: assignW,
      h: assignH
    };
    var activateW = 100;
    var activateH = 26;
    var activateButton = {
      x: cardInfoRect.x + cardInfoRect.w - activateW - 12,
      y: assignButton.y - activateH - 8,
      w: activateW,
      h: activateH
    };
    var infoBackW = 70;
    var infoBackH = 26;
    var infoBackButton = {
      x: cardInfoRect.x + 12,
      y: cardInfoRect.y + cardInfoRect.h - infoBackH - 10,
      w: infoBackW,
      h: infoBackH
    };
    var prgGroupRect = {
      x: prgRect.x,
      y: prgRect.y,
      w: prgRect.w,
      h: prgR2Rect.y + prgR2Rect.h - prgRect.y
    };
    var worldGroupRect = {
      x: worldR2Rect.x,
      y: worldR2Rect.y,
      w: worldR2Rect.w,
      h: worldRect.y + worldRect.h - worldR2Rect.y
    };
    return {
      panel: { x: panelX, y: panelY, w: panelW, h: panelH },
      pad: pad,
      headerY: panelY + pad + 12,
      prgGroupRect: prgGroupRect,
      prgRect: prgRect,
      prgBranches: prgBranches,
      prgR2Slots: prgR2Slots,
      worldGroupRect: worldGroupRect,
      worldRect: worldRect,
      worldSlots: worldSlots,
      worldR2Rect: worldR2Rect,
      worldR2Slots: worldR2Slots,
      hitRects: hitRects,
      inventoryRect: inventoryRect,
      inventoryInnerRect: inventoryInnerRect,
      pickerRect: pickerRect,
      pickerAssignRect: pickerAssignRect,
      pickerForgeFrameRect: pickerForgeFrameRect,
      pickerForgeRect: pickerForgeRect,
      cardInfoRect: cardInfoRect,
      assignButton: assignButton,
      activateButton: activateButton,
      infoBackButton: infoBackButton,
      closeButton: closeButton,
      density: density,
      viewport: { w: screenW, h: screenH }
    };
  }

  function makeAnchor(key, rect, role, visualType, density, extra) {
    var normalizedRect = rectOrNull(rect);
    if (!normalizedRect) return null;
    return Object.assign({
      key: key,
      rect: normalizedRect,
      role: role,
      visualType: visualType,
      density: density
    }, extra || {});
  }

  function makeHeaderRect(layout) {
    var panel = rectOrNull(layout && layout.panel);
    if (!panel || !Number.isFinite(layout.headerY)) return null;
    var pad = Number.isFinite(layout.pad) ? layout.pad : 18;
    var top = layout.closeButton && Number.isFinite(layout.closeButton.y)
      ? layout.closeButton.y
      : layout.headerY - 18;
    var bottom = layout.prgRect && Number.isFinite(layout.prgRect.y)
      ? layout.prgRect.y - 6
      : layout.headerY + 12;
    return {
      x: panel.x + pad,
      y: top,
      w: Math.max(1, panel.w - pad * 2),
      h: Math.max(1, bottom - top)
    };
  }

  function computeAnchors(layout, inputOptions) {
    var options = inputOptions && typeof inputOptions === "object" ? inputOptions : {};
    var density = options.density || (layout && layout.density) || computeDensity(
      layout && layout.viewport ? layout.viewport.w : 0,
      layout && layout.viewport ? layout.viewport.h : 0
    );
    var viewport = layout && layout.viewport ? { w: layout.viewport.w, h: layout.viewport.h } : null;
    var byName = {};

    function add(key, rect, role, visualType, extra) {
      byName[key] = makeAnchor(key, rect, role, visualType, density, extra);
      return byName[key];
    }

    add("submeta.root_frame", layout && layout.panel, "root_overlay", "frame_full");
    add("submeta.header_frame", makeHeaderRect(layout || {}), "header", "frame_or_separator", { derived: true });
    add("submeta.prg_panel_frame", layout && layout.prgGroupRect, "prg_panel", "frame_full");
    add("submeta.world_slots_panel_frame", layout && layout.worldGroupRect, "world_slots_panel", "frame_full");
    add("submeta.inventory_panel_frame", layout && layout.inventoryRect, "inventory_panel", "frame_full");
    add("submeta.picker_panel_frame", layout && layout.pickerRect, "picker_panel", "frame_full");
    add("submeta.forge_panel_frame", layout && layout.pickerForgeFrameRect, "forge_panel", "frame_full");
    add("submeta.card_detail_panel_frame", layout && layout.cardInfoRect, "card_detail_panel", "frame_full");
    add("submeta.button.back", layout && layout.closeButton, "back_button", "button_frame");
    add("submeta.button.confirm", layout && layout.assignButton, "confirm_button", "button_frame");
    add("submeta.button.info_back", layout && layout.infoBackButton, "info_back_button", "button_frame");

    var slots = [];
    if (layout && Array.isArray(layout.prgBranches)) {
      layout.prgBranches.forEach(function (branch) {
        slots.push(makeAnchor("submeta.prg_branch." + branch.key, branch.column, "prg_branch", "slot_group_frame", density, {
          sourceKey: branch.key,
          color: branch.color
        }));
        slots.push(makeAnchor("submeta.prg_branch." + branch.key + ".r1", branch.r1Slot, "prg_r1_slot", "slot_frame", density, {
          sourceKey: branch.key,
          slotType: "r1",
          color: branch.color
        }));
        slots.push(makeAnchor("submeta.prg_branch." + branch.key + ".odb", branch.odbSlot, "prg_odb_slot", "slot_frame", density, {
          sourceKey: branch.key,
          slotType: "odb",
          color: branch.color,
          future: true
        }));
      });
    }
    if (layout && Array.isArray(layout.prgR2Slots)) {
      layout.prgR2Slots.forEach(function (slot) {
        slots.push(makeAnchor("submeta.prg_binding_socket." + slot.index, slot, "prg_r2_binding_socket", "resonance_socket_frame", density, {
          index: slot.index
        }));
      });
    }
    if (layout && Array.isArray(layout.worldSlots)) {
      layout.worldSlots.forEach(function (slot) {
        slots.push(makeAnchor("submeta.world_category." + slot.key, slot, "world_category", "slot_group_frame", density, {
          sourceKey: slot.key,
          label: slot.label
        }));
        if (Array.isArray(slot.sockets)) {
          slot.sockets.forEach(function (socket) {
            slots.push(makeAnchor("submeta.world_slot." + slot.key + "." + socket.index, socket, socket.index === 2 ? "world_ds_socket" : "world_r1_socket", "slot_frame", density, {
              sourceKey: slot.key,
              index: socket.index
            }));
          });
        }
      });
    }
    if (layout && Array.isArray(layout.worldR2Slots)) {
      layout.worldR2Slots.forEach(function (slot) {
        slots.push(makeAnchor("submeta.world_binding_socket." + slot.index, slot, "world_r2_binding_socket", "resonance_socket_frame", density, {
          index: slot.index
        }));
      });
    }

    var missingImportantAnchors = IMPORTANT_MOUNT_POINTS.filter(function (key) {
      return !byName[key];
    });

    return {
      version: 1,
      density: density,
      viewport: viewport,
      byName: byName,
      rootFrame: byName["submeta.root_frame"],
      header: byName["submeta.header_frame"],
      prgPanel: byName["submeta.prg_panel_frame"],
      worldSlotsPanel: byName["submeta.world_slots_panel_frame"],
      inventoryPanel: byName["submeta.inventory_panel_frame"],
      pickerPanel: byName["submeta.picker_panel_frame"],
      forgePanel: byName["submeta.forge_panel_frame"],
      cardDetailPanel: byName["submeta.card_detail_panel_frame"],
      buttons: {
        back: byName["submeta.button.back"],
        infoBack: byName["submeta.button.info_back"],
        confirm: byName["submeta.button.confirm"]
      },
      slots: slots.filter(Boolean),
      bridges: [],
      missingImportantAnchors: missingImportantAnchors
    };
  }

  function computeWithAnchors(width, height, options) {
    var layout = compute(width, height, options);
    return {
      layout: layout,
      anchors: computeAnchors(layout, options)
    };
  }

  function getDiagnostics(layout, anchors) {
    var anchorData = anchors || computeAnchors(layout || null);
    var byName = anchorData && anchorData.byName ? anchorData.byName : {};
    var mountCount = Object.keys(byName).filter(function (key) {
      return !!byName[key];
    }).length;
    var slotCount = Array.isArray(anchorData && anchorData.slots) ? anchorData.slots.length : 0;
    return {
      density: anchorData ? anchorData.density : "small",
      anchorCount: mountCount + slotCount,
      missingImportantAnchors: anchorData && Array.isArray(anchorData.missingImportantAnchors)
        ? anchorData.missingImportantAnchors.slice()
        : IMPORTANT_MOUNT_POINTS.slice(),
      layoutKeys: layout && typeof layout === "object" ? Object.keys(layout) : []
    };
  }

  root.HC.SubMetaLayout = {
    version: "0.1.0",
    status: "extracted_not_integrated",
    compute: compute,
    computeAnchors: computeAnchors,
    computeWithAnchors: computeWithAnchors,
    computeDensity: computeDensity,
    getDiagnostics: getDiagnostics
  };
})(typeof window !== "undefined" ? window : globalThis);
