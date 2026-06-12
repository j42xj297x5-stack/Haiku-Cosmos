// Haiku Cosmos debug layout layer for SUB-META working panels.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const VERSION = "submeta-panels-layout-v0.3";
  const STORAGE_KEY = "hc.submetaPanels.layout.v1";
  const PRESET_PATH = "png/submeta/submeta-placeholders-panels.json";
  const PRESET_URL = resolvePublicAssetUrl(PRESET_PATH);
  const LAYER_ID = "subMetaPanelsLayer";
  const FLOATING_EDITOR_ID = "subMetaPanelsFloatingEditor";
  const GRID_PANEL_IDS = Object.freeze(["panel.inventory", "panel.possibilities", "panel.forge"]);
  const PANEL_IDS = Object.freeze([...GRID_PANEL_IDS, "panel.detail"]);
  const INVENTORY_CONTROL_IDS = Object.freeze([
    "inventory.filter.normal", "inventory.filter.special", "inventory.filter.resources",
    "inventory.scroll.up", "inventory.scroll.down"
  ]);
  const GRID_CONTROL_IDS = Object.freeze([
    ...INVENTORY_CONTROL_IDS,
    "possibilities.scroll.up", "possibilities.scroll.down",
    "forge.scroll.up", "forge.scroll.down"
  ]);
  const DETAIL_RECT_IDS = Object.freeze(["detail.preview_card", "detail.description", "detail.haiku"]);
  const BASE_FIELDS = Object.freeze(["x", "y", "w", "h", "zIndex", "visibleInDebug", "visibleInGame"]);
  const GRID_FIELDS = Object.freeze([
    "gridColumns", "gridRowsVisible", "cardRatioW", "cardRatioH", "cardScale",
    "gap", "gapX", "gapY", "paddingX", "paddingY", "gridOffsetX", "filterTopMargin", "arrowRightMargin"
  ]);

  const rect = (id, type, label, x, y, w, h, zIndex, visibleInDebug = true, visibleInGame = false) =>
    Object.freeze({ id, type, label, x, y, w, h, zIndex, visibleInDebug, visibleInGame });
  const gridPanel = (id, label, x, y, w, h, zIndex, gridColumns, gridRowsVisible, gap, paddingX, paddingY, pageStepRows, filterTopMargin = 0.002, arrowRightMargin = 0.008, gridOffsetX = 0) =>
    Object.freeze({
      id, type: "grid-panel", label, x, y, w, h, zIndex, visibleInDebug: true, visibleInGame: false,
      gridColumns, gridRowsVisible, cardRatioW: 9, cardRatioH: 16, cardScale: 1,
      gap, gapX: gap, gapY: gap, paddingX, paddingY, gridOffsetX, filterTopMargin, arrowRightMargin,
      ...(pageStepRows == null ? {} : { pageStepRows })
    });

  const DEFAULT_ITEMS = Object.freeze([
    gridPanel("panel.inventory", "Magazyn", 0.745, 0.235, 0.285, 0.205, 210, 7, 3, 0.007, 0.018, 0.024, 3, 0.002, 0.008),
    rect("inventory.filter.normal", "control", "Normalne", 0.675, 0.147, 0.055, 0.025, 212),
    rect("inventory.filter.special", "control", "Specjalne", 0.745, 0.147, 0.055, 0.025, 212),
    rect("inventory.filter.resources", "control", "Zasoby", 0.815, 0.147, 0.055, 0.025, 212),
    rect("inventory.scroll.up", "control", "Scroll ↑", 0.888, 0.205, 0.022, 0.035, 212),
    rect("inventory.scroll.down", "control", "Scroll ↓", 0.888, 0.275, 0.022, 0.035, 212),
    gridPanel("panel.possibilities", "Możliwości", 0.692, 0.500, 0.125, 0.135, 210, 3, 2, 0.008, 0.012, 0.014, null, 0.018, 0.006),
    rect("possibilities.scroll.up", "control", "Scroll ↑", 0.746, 0.475, 0.016, 0.026, 212),
    rect("possibilities.scroll.down", "control", "Scroll ↓", 0.746, 0.525, 0.016, 0.026, 212),
    gridPanel("panel.forge", "Kuźnia", 0.830, 0.500, 0.125, 0.135, 210, 3, 2, 0.008, 0.012, 0.014, null, 0.018, 0.006),
    rect("forge.scroll.up", "control", "Scroll ↑", 0.884, 0.475, 0.016, 0.026, 212),
    rect("forge.scroll.down", "control", "Scroll ↓", 0.884, 0.525, 0.016, 0.026, 212),
    rect("panel.detail", "detail-panel", "Opis", 0.739, 0.795, 0.310, 0.205, 210),
    rect("detail.preview_card", "detail-rect", "Podgląd karty", 0.620, 0.790, 0.050, 0.133, 212),
    rect("detail.description", "detail-rect", "Opis", 0.755, 0.750, 0.145, 0.070, 212),
    rect("detail.haiku", "detail-rect", "Haiku", 0.755, 0.842, 0.145, 0.060, 212)
  ]);

  const defaultsById = new Map(DEFAULT_ITEMS.map((item) => [item.id, item]));
  let items = cloneDefaults();
  let initialized = false;
  let enabled = true;
  let showLabels = true;
  let actuallyVisible = false;
  let selectedPanelId = null;
  let selectedSlotId = null;
  let layer = null;
  let stage = null;
  let floatingEditor = null;
  let floatingEditorTargetId = null;
  let dataSource = "DEFAULT_ITEMS fallback";
  let presetRequestId = 0;
  let initializationPromise = null;
  let inventoryFilter = "normal";
  const cardSelection = {
    selectedPlaceholderId: null,
    selectedPlaceholder: null,
    selectedInventoryEntryKey: null,
    selectedPossibleEntryKey: null,
    selectedCardRef: null,
    selectedSource: null,
    assignmentMessage: null
  };
  let pendingAssignment = null;

  function resolvePublicAssetUrl(path) {
    const helper = root.HC && (root.HC.publicAssetPath || root.HC.publicPath);
    if (typeof helper === "function") return helper(path);
    try {
      const configuredBase = typeof root.HC_PUBLIC_BASE_URL === "string" && !root.HC_PUBLIC_BASE_URL.includes("%")
        ? root.HC_PUBLIC_BASE_URL
        : document.baseURI;
      const baseUrl = new URL(configuredBase, root.location?.origin || document.baseURI);
      return new URL(path, baseUrl).href;
    } catch (_error) {
      return path;
    }
  }

  function debugLog(message, details) {
    if (!isDebugMode()) return;
    if (details === undefined) console.info(`[HC.SubMetaPanels] ${message}`);
    else console.info(`[HC.SubMetaPanels] ${message}`, details);
  }

  function cloneDefaults() {
    return DEFAULT_ITEMS.map((item) => ({ ...item }));
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function isDebugMode() {
    return root.HC?.Session?.mode === "debug";
  }

  function getStage() {
    return document.getElementById("subMetaPngStage");
  }

  function overlayIsVisible() {
    const overlay = document.getElementById("subMetaPngOverlay");
    return root.HC?.SubMetaPngLayout?.shouldShow?.() === true && !!overlay && overlay.hidden !== true;
  }

  function shouldRender(item) {
    return isDebugMode() ? item.visibleInDebug : item.visibleInGame;
  }

  function normalizeItem(candidate, fallback) {
    const source = candidate && typeof candidate === "object" ? candidate : {};
    const normalized = { ...fallback };
    normalized.x = clampNumber(source.x, 0, 1, fallback.x);
    normalized.y = clampNumber(source.y, 0, 1, fallback.y);
    normalized.w = clampNumber(source.w, 0.005, 1, fallback.w);
    normalized.h = clampNumber(source.h, 0.005, 1, fallback.h);
    normalized.zIndex = Math.round(clampNumber(source.zIndex, -100, 1000, fallback.zIndex));
    normalized.visibleInDebug = source.visibleInDebug == null ? fallback.visibleInDebug : source.visibleInDebug === true;
    normalized.visibleInGame = source.visibleInGame == null ? fallback.visibleInGame : source.visibleInGame === true;
    if (fallback.type === "grid-panel") {
      normalized.gridColumns = Math.round(clampNumber(source.gridColumns, 1, 20, fallback.gridColumns));
      normalized.gridRowsVisible = Math.round(clampNumber(source.gridRowsVisible, 1, 20, fallback.gridRowsVisible));
      normalized.cardRatioW = clampNumber(source.cardRatioW, 0.1, 10, fallback.cardRatioW);
      normalized.cardRatioH = clampNumber(source.cardRatioH, 0.1, 10, fallback.cardRatioH);
      normalized.cardScale = clampNumber(source.cardScale ?? source.cardSizeScale, 0.1, 2, fallback.cardScale);
      normalized.gap = clampNumber(source.gap ?? source.gapX ?? source.gapY, 0, 0.25, fallback.gap);
      normalized.gapX = normalized.gap;
      normalized.gapY = normalized.gap;
      normalized.paddingX = clampNumber(source.paddingX ?? source.gridPaddingX ?? source.innerMarginX, 0, 0.45, fallback.paddingX);
      normalized.paddingY = clampNumber(source.paddingY ?? source.gridPaddingY ?? source.innerMarginY, 0, 0.45, fallback.paddingY);
      normalized.gridOffsetX = clampNumber(source.gridOffsetX, -1, 1, fallback.gridOffsetX);
      normalized.filterTopMargin = clampNumber(source.filterTopMargin, 0, 0.25, fallback.filterTopMargin);
      normalized.arrowRightMargin = clampNumber(source.arrowRightMargin, 0, 0.25, fallback.arrowRightMargin);
      if (fallback.id === "panel.inventory") {
        normalized.pageStepRows = Math.round(clampNumber(source.pageStepRows, 1, 20, fallback.pageStepRows));
      }
    }
    return normalized;
  }

  function createStyle() {
    if (document.getElementById("subMetaPanelsStyle")) return;
    const style = document.createElement("style");
    style.id = "subMetaPanelsStyle";
    style.textContent = `
      #${LAYER_ID} { position:absolute; inset:0; z-index:205; pointer-events:none; }
      #${LAYER_ID}[hidden] { display:none; }
      .submeta-panel-item { position:absolute; box-sizing:border-box; transform:translate(-50%, -50%); pointer-events:none; }
      .submeta-panel-item.is-debug-visible { border:1px solid rgba(112,220,255,.42); background:rgba(40,150,190,.035); }
      .submeta-panel-item.is-debug-clickable { pointer-events:auto; cursor:crosshair; }
      .submeta-panel-item.is-selected { border-color:rgba(255,219,112,.95); box-shadow:0 0 0 1px rgba(255,219,112,.3) inset; }
      .submeta-panel-label { position:absolute; left:2px; top:2px; max-width:calc(100% - 4px); padding:1px 3px; overflow:hidden; color:rgba(225,247,255,.9); background:rgba(3,15,23,.72); font:9px/1.2 var(--hc-font-mono, monospace); white-space:nowrap; pointer-events:none; }
      .submeta-panel-grid { position:absolute; inset:0; pointer-events:none; }
      .submeta-panel-grid-slot { position:absolute; box-sizing:border-box; transform:translate(-50%,-50%); border:1px solid rgba(140,225,255,.35); background:rgba(80,185,220,.035); pointer-events:auto; cursor:crosshair; }
      .submeta-panel-grid-slot:hover { border-color:rgba(190,240,255,.75); }
      .submeta-panel-grid-slot.is-selected { border-color:rgba(255,219,112,.95); background:rgba(255,219,112,.12); }
      .submeta-panel-control { border-style:dashed !important; pointer-events:auto; cursor:crosshair; }
      .submeta-panel-detail-rect { border-color:rgba(206,165,255,.52) !important; background:rgba(160,90,220,.035) !important; pointer-events:auto; cursor:crosshair; }
      .submeta-panel-control.is-view-control { display:grid; place-items:center; border:1px solid rgba(183,205,214,.42); border-radius:3px; background:rgba(7,17,24,.72); color:#c8d7dc; font:600 clamp(6px,.55vw,10px)/1 system-ui,sans-serif; cursor:pointer; pointer-events:auto; }
      .submeta-panel-control.is-view-control:hover, .submeta-panel-control.is-view-control.is-active { border-color:rgba(255,219,112,.92); color:#fff2c7; background:rgba(91,72,27,.62); }
      .submeta-card-view { position:absolute; box-sizing:border-box; transform:translate(-50%,-50%); display:flex; flex-direction:column; justify-content:space-between; overflow:hidden; padding:3px; border:1px solid rgba(203,220,226,.48); border-radius:9%; background:linear-gradient(160deg,rgba(23,30,36,.96),rgba(4,8,12,.98)); color:#eef5f7; box-shadow:0 2px 5px rgba(0,0,0,.45); font:600 clamp(5px,.48vw,9px)/1 system-ui,sans-serif; pointer-events:auto; cursor:pointer; }
      .submeta-card-view:hover { border-color:rgba(234,245,248,.9); transform:translate(-50%,-50%) scale(1.04); }
      .submeta-card-view.is-selected { border-color:#ffdc72; box-shadow:0 0 0 1px rgba(255,220,114,.38),0 0 9px rgba(255,195,57,.58); }
      .submeta-card-view.is-preview { position:relative; left:auto!important; top:auto!important; width:min(100%,58px)!important; height:auto!important; aspect-ratio:9/16; transform:none; cursor:default; pointer-events:none; }
      .submeta-panel-empty { position:absolute; inset:4px; display:grid; place-items:center; padding:5px; color:rgba(210,225,230,.72); font:clamp(7px,.6vw,11px)/1.25 system-ui,sans-serif; text-align:center; pointer-events:none; }
      .submeta-detail-content { position:absolute; inset:3px; overflow:hidden; color:#e7f0f3; font:clamp(6px,.52vw,10px)/1.25 system-ui,sans-serif; pointer-events:none; }
      .submeta-detail-content strong { display:block; margin-bottom:2px; color:#ffe39a; font-size:1.08em; }
      .submeta-detail-content p { margin:2px 0; }
      .submeta-detail-content code { color:#b8dbe7; font:inherit; overflow-wrap:anywhere; }
      .submeta-panels-json { min-height:92px; width:100%; box-sizing:border-box; }
      #${FLOATING_EDITOR_ID} {
        position:fixed; z-index:10001; width:246px; max-height:calc(100vh - 16px); overflow:auto;
        box-sizing:border-box; padding:10px; border:1px solid rgba(112,220,255,.45); border-radius:4px;
        background:rgba(12,18,24,.97); color:#eef8fb; box-shadow:0 5px 18px rgba(0,0,0,.6);
        font:11px/1.3 system-ui,sans-serif; pointer-events:auto;
      }
      #${FLOATING_EDITOR_ID}[hidden] { display:none; }
      .submeta-panel-floating-header { position:sticky; top:-10px; z-index:1; display:flex; align-items:flex-start; gap:6px; margin:-10px -10px 8px; padding:10px; background:rgba(12,18,24,.98); border-bottom:1px solid rgba(112,220,255,.22); }
      .submeta-panel-floating-title { flex:1; min-width:0; font-weight:700; overflow-wrap:anywhere; }
      .submeta-panel-floating-subtitle { color:#9fcbd8; font:10px/1.3 var(--hc-font-mono,monospace); }
      .submeta-panel-floating-close { border:0; padding:0 2px; background:transparent; color:#ddd; font:18px/1 sans-serif; cursor:pointer; }
      .submeta-panel-floating-section { margin:8px 0 3px; color:#9fdbea; font-weight:700; letter-spacing:.04em; text-transform:uppercase; }
      .submeta-panel-floating-row { display:grid; grid-template-columns:92px 1fr; align-items:center; gap:7px; margin-top:4px; }
      .submeta-panel-floating-row input { width:100%; min-width:0; box-sizing:border-box; border:1px solid #4c5960; border-radius:2px; padding:3px 5px; background:#222b30; color:#fff; font:inherit; }
      .submeta-panel-floating-row input[type="checkbox"] { justify-self:start; width:auto; }
      .submeta-panel-floating-actions { position:sticky; bottom:-10px; display:flex; justify-content:flex-end; gap:6px; margin:9px -10px -10px; padding:9px 10px; background:rgba(12,18,24,.98); border-top:1px solid rgba(112,220,255,.22); }
      .submeta-panel-floating-actions button { border:0; border-radius:2px; padding:5px 9px; background:#43515a; color:#fff; font:inherit; cursor:pointer; }
      .submeta-panel-floating-actions [data-submeta-panel-floating-action="save"] { background:#536f52; }
    `;
    document.head.appendChild(style);
  }

  function createLayer() {
    stage = getStage();
    if (!stage) return false;
    if (layer && layer.parentElement === stage) return true;
    layer?.remove();
    layer = document.createElement("div");
    layer.id = LAYER_ID;
    layer.setAttribute("aria-label", "SUB-META panel layout debug layer");
    layer.addEventListener("pointerdown", handlePointerDown);
    stage.appendChild(layer);
    return true;
  }

  function getItem(id) {
    return items.find((item) => item.id === id) || null;
  }

  function getWorld() {
    return root.HC?.getWorld?.() || root.World || root.CardEngine?.state?.world || null;
  }

  function getCardApi() {
    return root.CardEngine?.subMetaView || null;
  }

  function getEntryColors(entry) {
    if (Array.isArray(entry?.colors)) return entry.colors.filter(Boolean).map(String);
    return [entry?.color, entry?.colorA, entry?.colorB, entry?.colorC, entry?.colorD].filter(Boolean).map(String);
  }

  function getEntryKey(entry) {
    if (entry?.viewKey) return String(entry.viewKey);
    const colors = getEntryColors(entry);
    return entry?.key || `${String(entry?.kind || "card").toUpperCase()}:${entry?.tier || "DR"}:${colors.join("-")}`;
  }

  function normalizeEntry(entry) {
    if (!entry) return null;
    const colors = getEntryColors(entry);
    const kind = String(entry.kind || (entry.color ? "R1" : "CARD")).toUpperCase();
    const tier = String(entry.tier || entry.fromTier || "DR");
    return {
      ...entry,
      kind,
      tier,
      colors,
      count: Math.max(1, Math.floor(Number(entry.count) || 1)),
      viewKey: getEntryKey({ ...entry, kind, tier, colors })
    };
  }

  function resolveCardRef(entry) {
    const normalized = normalizeEntry(entry);
    if (!normalized) return null;
    const api = getCardApi();
    const libraryKey = normalized.key || (normalized.kind === "R1" && normalized.colors[0]
      ? `R1_${normalized.tier}_${normalized.colors[0]}`
      : null);
    const libraryCard = libraryKey ? api?.getCardByKey?.(libraryKey) : null;
    return {
      ...normalized,
      ...(libraryCard || {}),
      kind: normalized.kind,
      tier: normalized.tier,
      colors: normalized.colors,
      color: libraryCard?.color || normalized.colors[0] || null,
      viewKey: normalized.viewKey
    };
  }

  function getInventoryEntries() {
    const World = getWorld();
    const api = getCardApi();
    if (!World || !api) return [];
    api.ensureCardsPool?.(World);
    return (api.getInventoryEntries?.(World) || []).map(normalizeEntry).filter(Boolean);
  }

  function classifyInventoryEntry(entry) {
    const kind = String(entry?.kind || "").toUpperCase();
    if (["R1", "R2", "R3", "R4"].includes(kind)) return "normal";
    if (["RESOURCE", "RESOURCES", "DUST", "PYL", "PYŁ"].includes(kind)) return "resources";
    return "special";
  }

  function mapPlaceholderContext(placeholder) {
    if (!placeholder?.id) return { type: "unsupported", message: "Brak kontekstu placeholdera." };
    const prgR1 = placeholder.id.match(/^prg\.(forma|intencja|czas|cisza)\.r1\.(\d+)$/);
    if (prgR1) {
      const branchBySubgroup = { forma: "radius", intencja: "glue", czas: "speed", cisza: "objects" };
      return { type: "prg-r1", selection: { type: "r1", branchKey: branchBySubgroup[prgR1[1]] }, slotKey: prgR1[1] };
    }
    const worldR1 = placeholder.id.match(/^world\.slot\.(\d+)\.r1$/);
    if (worldR1) {
      const slotKey = placeholder.subgroup || ["forma", "intencja", "czas", "cisza"][Number(worldR1[1]) - 1];
      return { type: "world-r1", slotKey, slotIndex: 0 };
    }
    const prgR2 = placeholder.id.match(/^prg\.r2\.(\d+)\.card$/);
    if (prgR2) return { type: "prg-r2", selection: { type: "r2", bindingIndex: Number(prgR2[1]) - 1 }, slotKey: placeholder.subgroup };
    const worldR2 = placeholder.id.match(/^world\.r2\.(\d+)\.card$/);
    if (worldR2) return { type: "world-r2", bindingIndex: Number(worldR2[1]) - 1, slotKey: placeholder.subgroup };
    if (/r3/i.test(placeholder.id)) return { type: "pending", message: "R3: filtrowanie kart do podpięcia później." };
    if (/r4/i.test(placeholder.id)) return { type: "pending", message: "R4: filtrowanie kart do podpięcia później." };
    return { type: "unsupported", message: placeholder.kind === "card" ? "Ten typ miejsca nie ma jeszcze mapowania kart." : "To miejsce nie przyjmuje kart w tym etapie." };
  }

  function getPossibleEntries() {
    const World = getWorld();
    const api = getCardApi();
    const context = mapPlaceholderContext(cardSelection.selectedPlaceholder);
    if (!World || !api || !cardSelection.selectedPlaceholder) return { entries: [], context };
    if (api.getPlaceholderAssignments?.(World)?.[cardSelection.selectedPlaceholderId]) {
      return { entries: [], context: { ...context, message: "Ten placeholder jest już zajęty." } };
    }
    let entries = [];
    if (context.type === "prg-r1" || context.type === "prg-r2") entries = api.getPrgAvailableCards?.(World, context.selection) || [];
    if (context.type === "world-r1") entries = api.getWorldAvailableCards?.(World, context.slotKey, context.slotIndex) || [];
    if (context.type === "world-r2") entries = api.getWorldBindingAvailableCards?.(World, context.bindingIndex) || [];
    return { entries: entries.map(normalizeEntry).filter(Boolean), context };
  }

  function getAssignmentMessage(reason) {
    return ({
      "missing-data": "Brak wybranego placeholdera albo danych karty.",
      "missing-state": "Stan SUB-META nie jest dostępny.",
      occupied: "Ten placeholder jest już zajęty.",
      incompatible: "Ta karta nie pasuje do wybranego placeholdera.",
      unavailable: "Ta karta nie jest już dostępna w Magazynie."
    })[reason] || "Nie udało się przypisać karty.";
  }

  function clonePendingAssignment() {
    if (!pendingAssignment) return null;
    return {
      ...pendingAssignment,
      cardRef: pendingAssignment.cardRef ? {
        ...pendingAssignment.cardRef,
        colors: Array.isArray(pendingAssignment.cardRef.colors) ? pendingAssignment.cardRef.colors.slice() : []
      } : null
    };
  }

  function getConfirmButtonState() {
    return pendingAssignment?.valid === true ? "ready" : "inactive";
  }

  function refreshAssignmentViews() {
    root.HC?.SubMetaPlaceholders?.syncDom?.();
    root.HC?.SubMetaPngLayout?.refreshConfirmButton?.();
  }

  function clearPendingAssignment(options = {}) {
    const previous = pendingAssignment;
    pendingAssignment = null;
    if (previous && cardSelection.selectedSource === "pending") {
      cardSelection.selectedPossibleEntryKey = null;
      cardSelection.selectedCardRef = null;
      cardSelection.selectedSource = cardSelection.selectedPlaceholder ? "placeholder" : null;
      if (options.keepMessage !== true) cardSelection.assignmentMessage = null;
    }
    if (options.message) cardSelection.assignmentMessage = options.message;
    if (options.render !== false) {
      refreshAssignmentViews();
      syncDom();
    }
    if (previous) debugLog("pending assignment cleared", { reason: options.reason || "unspecified", placeholderId: previous.placeholderId });
    return Boolean(previous);
  }

  function selectAssignedCard(placeholderId, assignment) {
    const clearedPending = pendingAssignment && pendingAssignment.placeholderId !== placeholderId;
    if (clearedPending) clearPendingAssignment({ reason: "assigned-placeholder-selected", render: false });
    const placeholder = root.HC?.SubMetaPlaceholders?.getPlaceholders?.().find((item) => item.id === placeholderId);
    const card = resolveCardRef({ ...assignment, key: assignment?.cardKey });
    if (!placeholder || !card) return false;
    cardSelection.selectedPlaceholderId = placeholderId;
    cardSelection.selectedPlaceholder = { ...placeholder };
    cardSelection.selectedInventoryEntryKey = null;
    cardSelection.selectedPossibleEntryKey = null;
    cardSelection.selectedCardRef = card;
    cardSelection.selectedSource = "assigned";
    cardSelection.assignmentMessage = "Karta przypisana do tego placeholdera.";
    root.HC?.SubMetaPlaceholders?.selectPlaceholder?.(placeholderId, { allowOccupied: true, notifyPanels: false });
    if (clearedPending) refreshAssignmentViews();
    syncDom();
    return true;
  }

  function stagePossibleCard(card) {
    const World = getWorld();
    const api = getCardApi();
    const placeholderId = cardSelection.selectedPlaceholderId;
    const target = mapPlaceholderContext(cardSelection.selectedPlaceholder);
    const stillAvailable = getPossibleEntries().entries.some((entry) => resolveCardRef(entry)?.viewKey === card.viewKey);
    if (!World || !api?.assignPlaceholderCard || !placeholderId) {
      cardSelection.assignmentMessage = getAssignmentMessage("missing-data");
      return false;
    }
    if (!stillAvailable) {
      cardSelection.assignmentMessage = getAssignmentMessage("incompatible");
      debugLog("pending assignment rejected", { placeholderId, cardKey: card.key || card.viewKey, reason: "incompatible" });
      return false;
    }
    pendingAssignment = {
      placeholderId,
      cardRef: { ...card, colors: card.colors.slice() },
      cardKey: card.key || card.viewKey,
      cardId: card.id || null,
      target: { ...target, selection: target.selection ? { ...target.selection } : undefined },
      source: "possibilities",
      createdAt: Date.now(),
      valid: true
    };
    cardSelection.selectedCardRef = card;
    cardSelection.selectedSource = "pending";
    cardSelection.selectedInventoryEntryKey = null;
    cardSelection.selectedPossibleEntryKey = card.viewKey;
    cardSelection.assignmentMessage = "Zmiana oczekuje na potwierdzenie.";
    refreshAssignmentViews();
    debugLog("pending assignment staged", { placeholderId, cardKey: pendingAssignment.cardKey });
    return true;
  }

  function confirmPendingAssignment() {
    const pending = pendingAssignment;
    const World = getWorld();
    const api = getCardApi();
    if (!pending || pending.valid !== true || !World || !api?.assignPlaceholderCard) return false;
    const placeholder = root.HC?.SubMetaPlaceholders?.getPlaceholders?.().find((item) => item.id === pending.placeholderId);
    if (!placeholder || cardSelection.selectedPlaceholderId !== pending.placeholderId) {
      clearPendingAssignment({ reason: "placeholder-changed", message: getAssignmentMessage("missing-data") });
      return false;
    }
    const result = api.assignPlaceholderCard(World, pending.placeholderId, pending.target, pending.cardRef);
    if (!result?.ok) {
      const message = getAssignmentMessage(result?.reason);
      debugLog("pending assignment confirmation rejected", { placeholderId: pending.placeholderId, cardKey: pending.cardKey, reason: result?.reason });
      clearPendingAssignment({ reason: result?.reason || "validation-failed", message });
      return false;
    }
    pendingAssignment = null;
    const assignedCard = resolveCardRef({ ...result.assignment, key: result.assignment.cardKey });
    cardSelection.selectedCardRef = assignedCard || pending.cardRef;
    cardSelection.selectedSource = "assigned";
    cardSelection.selectedInventoryEntryKey = null;
    cardSelection.selectedPossibleEntryKey = null;
    cardSelection.assignmentMessage = "Karta została przypisana do placeholdera.";
    cardSelection.selectedPlaceholder = { ...placeholder, state: "occupied" };
    refreshAssignmentViews();
    syncDom();
    debugLog("card assignment confirmed", { placeholderId: pending.placeholderId, assignment: result.assignment });
    return true;
  }

  function selectCard(entry, source) {
    const card = resolveCardRef(entry);
    if (!card) return false;
    if (source === "possibilities") {
      const staged = stagePossibleCard(card);
      syncDom();
      return staged;
    }
    cardSelection.selectedCardRef = card;
    cardSelection.selectedSource = source;
    cardSelection.selectedInventoryEntryKey = source === "inventory" ? card.viewKey : null;
    cardSelection.selectedPossibleEntryKey = null;
    cardSelection.assignmentMessage = null;
    syncDom();
    return true;
  }

  function selectPlaceholder(context) {
    if (!context?.id) return false;
    const retainedPending = pendingAssignment?.placeholderId === context.id ? pendingAssignment : null;
    const clearedPending = pendingAssignment && !retainedPending;
    if (clearedPending) clearPendingAssignment({ reason: "placeholder-changed", render: false });
    cardSelection.selectedPlaceholderId = context.id;
    cardSelection.selectedPlaceholder = { ...context };
    cardSelection.selectedInventoryEntryKey = null;
    cardSelection.selectedPossibleEntryKey = retainedPending?.cardRef?.viewKey || null;
    cardSelection.selectedCardRef = retainedPending?.cardRef || null;
    cardSelection.selectedSource = retainedPending ? "pending" : "placeholder";
    cardSelection.assignmentMessage = retainedPending ? "Zmiana oczekuje na potwierdzenie." : null;
    if (clearedPending) refreshAssignmentViews();
    syncDom();
    return true;
  }

  function clearPlaceholderSelection() {
    clearPendingAssignment({ reason: "placeholder-selection-cleared", render: false });
    cardSelection.selectedPlaceholderId = null;
    cardSelection.selectedPlaceholder = null;
    if (["placeholder", "pending"].includes(cardSelection.selectedSource)) cardSelection.selectedSource = null;
    syncDom();
    refreshAssignmentViews();
  }

  function renderSubMetaCard(node, card, options = {}) {
    const renderer = root.HC?.SubMetaPlaceholders?.renderSubMetaCard;
    if (typeof renderer !== "function") return null;
    return renderer(node, card, options);
  }

  function createCardNode(entry, source, slot, panelZ, preview = false) {
    const card = resolveCardRef(entry);
    if (!card) return null;
    const node = document.createElement(preview ? "div" : "button");
    if (!preview) node.type = "button";
    node.className = `submeta-card-view${preview ? " is-preview" : ""}`;
    const selectedKey = source === "inventory" ? cardSelection.selectedInventoryEntryKey : cardSelection.selectedPossibleEntryKey;
    const selected = !preview && selectedKey === card.viewKey;
    if (!preview) {
      node.dataset.submetaCardSource = source;
      node.dataset.submetaCardKey = card.viewKey;
      node.title = `${card.kind} ${card.tier} · ${card.colors.join(" + ")}`;
      node.setAttribute("aria-label", node.title);
      applyBox(node, { ...slot, zIndex: panelZ + 2 });
    }
    renderSubMetaCard(node, card, {
      context: preview ? "detail" : source,
      selected,
      pending: source === "possibilities" && cardSelection.selectedSource === "pending" && selected,
      showCount: source === "inventory"
    });
    return node;
  }

  function renderGridEntries(panelId, entries, source, emptyMessage, slotRectsByPanelId) {
    const panel = getItem(panelId);
    if (!panel || !shouldRender(panel)) return;
    const slots = slotRectsByPanelId.get(panelId) || [];
    entries.slice(0, slots.length).forEach((entry, index) => {
      const node = createCardNode(entry, source, slots[index], panel.zIndex);
      if (node) layer.appendChild(node);
    });
    if (!entries.length) {
      const panelNode = getPanelNode(panelId);
      if (!panelNode) return;
      const empty = document.createElement("div");
      empty.className = "submeta-panel-empty";
      empty.textContent = emptyMessage;
      panelNode.appendChild(empty);
    }
  }

  function getDetailModel() {
    const api = getCardApi();
    const card = cardSelection.selectedCardRef;
    if (card && cardSelection.selectedSource !== "placeholder") {
      const placeholderMap = mapPlaceholderContext(cardSelection.selectedPlaceholder);
      const slotByColor = { red: "forma", yellow: "intencja", green: "czas", blue: "cisza" };
      const effectSlot = placeholderMap.slotKey && ["forma", "intencja", "czas", "cisza"].includes(placeholderMap.slotKey)
        ? placeholderMap.slotKey
        : slotByColor[card.colors[0]];
      const title = card.kind === "R1" ? api?.getCardTitle?.(card) : `${card.kind} / ${card.tier}`;
      return {
        type: "card", card, title,
        meta: `${card.kind} · ${card.tier} · ${card.colors.join(" + ") || "brak koloru"}${card.count > 1 ? ` · ×${card.count}` : ""}`,
        effectLines: effectSlot ? (api?.getEffectLines?.(effectSlot, card.tier) || []) : [],
        haikuLines: api?.getHaikuLines?.(card) || []
      };
    }
    const placeholder = cardSelection.selectedPlaceholder;
    if (placeholder) {
      const mapping = mapPlaceholderContext(placeholder);
      return { type: "placeholder", placeholder, mapping };
    }
    return { type: "empty" };
  }

  function appendText(parent, tag, text, className) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text;
    parent.appendChild(node);
  }

  function renderDetail() {
    const model = getDetailModel();
    const preview = getPanelNode("detail.preview_card");
    const description = getPanelNode("detail.description");
    const haiku = getPanelNode("detail.haiku");
    if (!preview || !description || !haiku) return;
    if (model.type === "card") {
      const previewCard = createCardNode(model.card, cardSelection.selectedSource, null, 0, true);
      if (previewCard) preview.appendChild(previewCard);
      const desc = document.createElement("div");
      desc.className = "submeta-detail-content";
      appendText(desc, "strong", model.title);
      appendText(desc, "p", model.meta);
      for (const line of model.effectLines) appendText(desc, "p", line);
      if (!model.effectLines.length) appendText(desc, "p", "Brak roboczego opisu efektu dla tego kontekstu.");
      if (cardSelection.assignmentMessage) appendText(desc, "p", cardSelection.assignmentMessage);
      description.appendChild(desc);
      const poem = document.createElement("div");
      poem.className = "submeta-detail-content";
      appendText(poem, "strong", "Haiku");
      for (const line of model.haikuLines) appendText(poem, "p", line);
      if (!model.haikuLines.length) appendText(poem, "p", "Brak danych haiku.");
      haiku.appendChild(poem);
      return;
    }
    const desc = document.createElement("div");
    desc.className = "submeta-detail-content";
    if (model.type === "placeholder") {
      appendText(desc, "strong", model.placeholder.label || "Placeholder");
      appendText(desc, "code", model.placeholder.id);
      appendText(desc, "p", `${model.placeholder.group} · ${model.placeholder.subgroup} · ${model.placeholder.kind}`);
      appendText(desc, "p", `Stan: ${model.placeholder.state}`);
      appendText(desc, "p", cardSelection.assignmentMessage || model.mapping.message || "Wybierz kartę z Możliwości.");
    } else {
      appendText(desc, "strong", "Opis");
      appendText(desc, "p", "Wybierz kartę w Magazynie albo placeholder gameplayowy.");
    }
    description.appendChild(desc);
  }

  function renderCardView(slotRectsByPanelId) {
    const inventory = getInventoryEntries().filter((entry) => classifyInventoryEntry(entry) === inventoryFilter);
    const possible = getPossibleEntries();
    const inventoryEmpty = inventoryFilter === "normal" ? "Brak dostępnych kart R1–R4."
      : (inventoryFilter === "special" ? "Brak kart specjalnych." : "Brak zasobów w danych kart.");
    renderGridEntries("panel.inventory", inventory, "inventory", inventoryEmpty, slotRectsByPanelId);
    const possibleEmpty = !cardSelection.selectedPlaceholder
      ? "Kliknij placeholder gameplayowy."
      : (possible.context.message || "Brak pasujących dostępnych kart.");
    renderGridEntries("panel.possibilities", possible.entries, "possibilities", possibleEmpty, slotRectsByPanelId);
    renderDetail();
  }

  function syncAutomaticControls() {
    const inventory = getItem("panel.inventory");
    if (inventory) {
      const filters = INVENTORY_CONTROL_IDS.slice(0, 3).map(getItem).filter(Boolean);
      const availableWidth = Math.max(0.03, inventory.w - (2 * inventory.paddingX));
      const filterWidth = Math.min(0.07, availableWidth / 3.6);
      const spacing = filters.length > 1 ? (availableWidth - (filters.length * filterWidth)) / (filters.length - 1) : 0;
      const left = inventory.x - (availableWidth / 2);
      filters.forEach((control, index) => {
        control.w = filterWidth;
        control.x = left + (filterWidth / 2) + (index * (filterWidth + Math.max(0, spacing)));
        control.y = inventory.y - (inventory.h / 2) + inventory.filterTopMargin + (control.h / 2);
      });
    }

    const arrowGroups = [
      ["panel.inventory", "inventory.scroll.up", "inventory.scroll.down"],
      ["panel.possibilities", "possibilities.scroll.up", "possibilities.scroll.down"],
      ["panel.forge", "forge.scroll.up", "forge.scroll.down"]
    ];
    for (const [panelId, upId, downId] of arrowGroups) {
      const panel = getItem(panelId);
      const up = getItem(upId);
      const down = getItem(downId);
      if (!panel || !up || !down) continue;
      const x = panel.x + (panel.w / 2) - panel.arrowRightMargin - (up.w / 2);
      const verticalOffset = Math.min(panel.h * 0.28, Math.max(up.h, panel.h / Math.max(4, panel.gridRowsVisible + 2)));
      for (const control of [up, down]) control.x = x;
      up.y = panel.y - verticalOffset;
      down.y = panel.y + verticalOffset;
    }
  }

  function computePanelGridSlots(panel) {
    const columns = Math.max(1, panel.gridColumns);
    const rows = Math.max(1, panel.gridRowsVisible);
    const innerW = Math.max(0.001, panel.w - (2 * panel.paddingX));
    const innerH = Math.max(0.001, panel.h - (2 * panel.paddingY));
    const maxSlotW = Math.max(0.001, (innerW - ((columns - 1) * panel.gapX)) / columns);
    const maxSlotH = Math.max(0.001, (innerH - ((rows - 1) * panel.gapY)) / rows);
    const stageRect = stage?.getBoundingClientRect();
    const stageAspect = stageRect?.width && stageRect?.height ? stageRect.width / stageRect.height : 1.5;
    const targetHeightForWidth = maxSlotW * stageAspect * (panel.cardRatioH / panel.cardRatioW);
    const fittedSlotH = Math.min(maxSlotH, targetHeightForWidth);
    const fittedSlotW = Math.min(maxSlotW, fittedSlotH / stageAspect * (panel.cardRatioW / panel.cardRatioH));
    const slotW = fittedSlotW * panel.cardScale;
    const slotH = fittedSlotH * panel.cardScale;
    const usedW = (columns * slotW) + ((columns - 1) * panel.gapX);
    const usedH = (rows * slotH) + ((rows - 1) * panel.gapY);
    const left = panel.x - (usedW / 2) + panel.gridOffsetX;
    const top = panel.y - (usedH / 2);
    const slots = [];
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        slots.push({
          id: `${panel.id}.slot.${row + 1}.${column + 1}`,
          row: row + 1, column: column + 1,
          x: left + (slotW / 2) + (column * (slotW + panel.gapX)),
          y: top + (slotH / 2) + (row * (slotH + panel.gapY)),
          w: slotW, h: slotH
        });
      }
    }
    return slots;
  }

  function renderDebugGridSlots(panel, slotRects) {
    for (const slot of slotRects) {
      const slotNode = document.createElement("button");
      slotNode.type = "button";
      slotNode.className = "submeta-panel-grid-slot";
      if (slot.id === selectedSlotId) slotNode.classList.add("is-selected");
      slotNode.dataset.submetaPanelId = panel.id;
      slotNode.dataset.submetaPanelSlotId = slot.id;
      slotNode.title = `${panel.label}: rząd ${slot.row}, kolumna ${slot.column}`;
      slotNode.setAttribute("aria-label", slotNode.title);
      applyBox(slotNode, { ...slot, zIndex: panel.zIndex + 1 });
      layer.appendChild(slotNode);
    }
  }

  function applyBox(node, item) {
    node.style.left = `${item.x * 100}%`;
    node.style.top = `${item.y * 100}%`;
    node.style.width = `${item.w * 100}%`;
    node.style.height = `${item.h * 100}%`;
    node.style.zIndex = String(item.zIndex);
  }

  function syncDom() {
    if (!createLayer()) return false;
    syncAutomaticControls();
    layer.replaceChildren();
    const slotRectsByPanelId = new Map(
      items
        .filter((item) => item.type === "grid-panel" && shouldRender(item))
        .map((panel) => [panel.id, computePanelGridSlots(panel)])
    );
    for (const item of items) {
      if (!shouldRender(item)) continue;
      const node = document.createElement("div");
      node.className = "submeta-panel-item";
      if (isDebugMode()) node.classList.add("is-debug-visible");
      if (item.type === "control") node.classList.add("submeta-panel-control");
      if (item.id.startsWith("inventory.filter.")) {
        node.classList.add("is-view-control");
        const filter = item.id.slice("inventory.filter.".length);
        node.classList.toggle("is-active", inventoryFilter === filter);
        node.dataset.submetaInventoryFilter = filter;
        node.setAttribute("role", "button");
        node.setAttribute("tabindex", "0");
        node.textContent = item.label;
      }
      if (item.type === "detail-rect") node.classList.add("submeta-panel-detail-rect");
      if (isDebugMode() && (PANEL_IDS.includes(item.id) || DETAIL_RECT_IDS.includes(item.id))) node.classList.add("is-debug-clickable");
      if (item.id === selectedPanelId) node.classList.add("is-selected");
      node.dataset.submetaPanelId = item.id;
      applyBox(node, item);
      if (showLabels && isDebugMode() && !item.id.startsWith("inventory.filter.")) {
        const label = document.createElement("span");
        label.className = "submeta-panel-label";
        label.textContent = item.label || item.id;
        node.appendChild(label);
      }
      layer.appendChild(node);

      if (item.type === "grid-panel" && isDebugMode()) {
        renderDebugGridSlots(item, slotRectsByPanelId.get(item.id) || []);
      }
    }
    renderCardView(slotRectsByPanelId);
    root.HC?.SubMetaPngLayout?.refreshConfirmButton?.();
    return true;
  }

  function getOwnerPanelId(itemId) {
    if (typeof itemId !== "string") return null;
    if (PANEL_IDS.includes(itemId)) return itemId;
    if (itemId.startsWith("inventory.")) return "panel.inventory";
    if (itemId.startsWith("possibilities.")) return "panel.possibilities";
    if (itemId.startsWith("forge.")) return "panel.forge";
    if (itemId.startsWith("detail.")) return "panel.detail";
    return null;
  }

  function getPanelNode(id) {
    if (!layer || !id) return null;
    return Array.from(layer.querySelectorAll("[data-submeta-panel-id]")).find((node) =>
      node.dataset.submetaPanelId === id && !node.dataset.submetaPanelSlotId) || null;
  }

  function positionFloatingPanelEditor(anchorRect) {
    if (!floatingEditor || floatingEditor.hidden || !anchorRect) return;
    const gap = 10;
    const margin = 8;
    const editorRect = floatingEditor.getBoundingClientRect();
    let left = anchorRect.left - editorRect.width - gap;
    let top = anchorRect.top;
    if (left < margin) left = margin;
    if (top + editorRect.height > root.innerHeight - margin) top = anchorRect.bottom - editorRect.height;
    const maxLeft = Math.max(margin, root.innerWidth - editorRect.width - margin);
    const maxTop = Math.max(margin, root.innerHeight - editorRect.height - margin);
    floatingEditor.style.left = `${Math.max(margin, Math.min(left, maxLeft))}px`;
    floatingEditor.style.top = `${Math.max(margin, Math.min(top, maxTop))}px`;
  }

  function closeFloatingPanelEditor() {
    if (floatingEditor) floatingEditor.remove();
    floatingEditor = null;
    floatingEditorTargetId = null;
  }

  function floatingNumberControl(itemId, field, label, value, min, max, step) {
    return `<label class="submeta-panel-floating-row"><span>${label}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${value}" data-submeta-panel-floating-item="${escapeHtml(itemId)}" data-submeta-panel-floating-field="${field}"></label>`;
  }

  function floatingCheckboxControl(itemId, field, label, checked) {
    return `<label class="submeta-panel-floating-row"><span>${label}</span><input type="checkbox" data-submeta-panel-floating-item="${escapeHtml(itemId)}" data-submeta-panel-floating-field="${field}"${checked ? " checked" : ""}></label>`;
  }

  function renderFloatingBaseControls(item) {
    return `
      <div class="submeta-panel-floating-section">Panel</div>
      ${floatingNumberControl(item.id, "x", "x", item.x, 0, 1, 0.001)}
      ${floatingNumberControl(item.id, "y", "y", item.y, 0, 1, 0.001)}
      ${floatingNumberControl(item.id, "w", "w", item.w, 0.005, 1, 0.001)}
      ${floatingNumberControl(item.id, "h", "h", item.h, 0.005, 1, 0.001)}
      ${floatingNumberControl(item.id, "zIndex", "zIndex", item.zIndex, -100, 1000, 1)}
      ${floatingCheckboxControl(item.id, "visibleInDebug", "visibleInDebug", item.visibleInDebug)}
      ${floatingCheckboxControl(item.id, "visibleInGame", "visibleInGame", item.visibleInGame)}`;
  }

  function renderFloatingGridControls(panel) {
    return `
      <div class="submeta-panel-floating-section">Siatka kart</div>
      ${floatingNumberControl(panel.id, "gridColumns", "gridColumns", panel.gridColumns, 1, 20, 1)}
      ${floatingNumberControl(panel.id, "gridRowsVisible", "gridRowsVisible", panel.gridRowsVisible, 1, 20, 1)}
      ${floatingNumberControl(panel.id, "cardScale", "cardScale", panel.cardScale, 0.1, 2, 0.01)}
      ${floatingNumberControl(panel.id, "gap", "gap", panel.gap, 0, 0.25, 0.001)}
      ${floatingNumberControl(panel.id, "paddingX", "gridPaddingX", panel.paddingX, 0, 0.45, 0.001)}
      ${floatingNumberControl(panel.id, "paddingY", "gridPaddingY", panel.paddingY, 0, 0.45, 0.001)}
      ${floatingNumberControl(panel.id, "gridOffsetX", "gridOffsetX", panel.gridOffsetX, -1, 1, 0.001)}
      ${panel.id === "panel.inventory" ? `
        <div class="submeta-panel-floating-section">Filtry</div>
        ${floatingNumberControl(panel.id, "filterTopMargin", "filterTopMargin", panel.filterTopMargin, 0, 0.25, 0.001)}` : ""}
      <div class="submeta-panel-floating-section">Strzałki</div>
      ${floatingNumberControl(panel.id, "arrowRightMargin", "arrowRightMargin", panel.arrowRightMargin, 0, 0.25, 0.001)}
      ${panel.id === "panel.inventory" ? floatingNumberControl(panel.id, "pageStepRows", "pageStepRows", panel.pageStepRows, 1, 20, 1) : ""}`;
  }

  function renderFloatingDetailControls() {
    const groups = [
      ["detail.preview_card", "Podgląd karty", ["previewX", "previewY", "previewW", "previewH"]],
      ["detail.description", "Opis", ["descriptionX", "descriptionY", "descriptionW", "descriptionH"]],
      ["detail.haiku", "Haiku", ["haikuX", "haikuY", "haikuW", "haikuH"]]
    ];
    return groups.map(([id, title, labels]) => {
      const item = getItem(id);
      return item ? `
        <div class="submeta-panel-floating-section" data-submeta-panel-floating-section="${id}">${title}</div>
        ${floatingNumberControl(id, "x", labels[0], item.x, 0, 1, 0.001)}
        ${floatingNumberControl(id, "y", labels[1], item.y, 0, 1, 0.001)}
        ${floatingNumberControl(id, "w", labels[2], item.w, 0.005, 1, 0.001)}
        ${floatingNumberControl(id, "h", labels[3], item.h, 0.005, 1, 0.001)}` : "";
    }).join("");
  }

  function syncFloatingPanelEditor(panelId = getOwnerPanelId(floatingEditorTargetId || selectedPanelId)) {
    if (!floatingEditor || !panelId) return false;
    const panel = getItem(panelId);
    if (!panel) { closeFloatingPanelEditor(); return false; }
    const title = floatingEditor.querySelector(".submeta-panel-floating-title");
    const subtitle = floatingEditor.querySelector(".submeta-panel-floating-subtitle");
    if (title) title.textContent = `${panel.label} · ${panel.id}`;
    if (subtitle) subtitle.textContent = floatingEditorTargetId && floatingEditorTargetId !== panelId ? floatingEditorTargetId : "współrzędne normalized względem SUB-META";
    for (const control of floatingEditor.querySelectorAll("[data-submeta-panel-floating-field]")) {
      const item = getItem(control.dataset.submetaPanelFloatingItem);
      if (!item || !(control.dataset.submetaPanelFloatingField in item)) continue;
      if (control.type === "checkbox") control.checked = item[control.dataset.submetaPanelFloatingField] === true;
      else control.value = String(item[control.dataset.submetaPanelFloatingField]);
    }
    return true;
  }

  function applyFloatingPanelEditorValues() {
    if (!floatingEditor) return false;
    for (const control of floatingEditor.querySelectorAll("[data-submeta-panel-floating-field]")) {
      updateItemField(
        control.dataset.submetaPanelFloatingItem,
        control.dataset.submetaPanelFloatingField,
        control.type === "checkbox" ? control.checked : control.value,
        { syncMain: false }
      );
    }
    syncFloatingPanelEditor();
    syncDebugPanelSelection();
    return true;
  }

  function openFloatingPanelEditor(targetId, anchorRect) {
    const panelId = getOwnerPanelId(targetId);
    const panel = getItem(panelId);
    if (!isDebugMode() || !enabled || !actuallyVisible || !panel) return false;
    root.HC?.SubMetaPlaceholders?.closeFloatingEditor?.();
    closeFloatingPanelEditor();
    selectedPanelId = DETAIL_RECT_IDS.includes(targetId) ? targetId : panelId;
    selectedSlotId = null;
    floatingEditorTargetId = targetId;
    syncDom();
    syncDebugPanelSelection();
    floatingEditor = document.createElement("div");
    floatingEditor.id = FLOATING_EDITOR_ID;
    floatingEditor.setAttribute("role", "dialog");
    floatingEditor.setAttribute("aria-label", `Edytor panelu ${panel.id}`);
    floatingEditor.innerHTML = `
      <div class="submeta-panel-floating-header">
        <div><div class="submeta-panel-floating-title"></div><div class="submeta-panel-floating-subtitle"></div></div>
        <button class="submeta-panel-floating-close" type="button" data-submeta-panel-floating-action="close" aria-label="Zamknij">×</button>
      </div>
      ${renderFloatingBaseControls(panel)}
      ${panel.type === "grid-panel" ? renderFloatingGridControls(panel) : renderFloatingDetailControls()}
      <div class="submeta-panel-floating-actions">
        <button type="button" data-submeta-panel-floating-action="close">Zamknij</button>
        <button type="button" data-submeta-panel-floating-action="save">Zapisz</button>
      </div>`;
    document.body.appendChild(floatingEditor);
    const applyControl = (control) => {
      if (!control?.dataset?.submetaPanelFloatingField) return;
      updateItemField(
        control.dataset.submetaPanelFloatingItem,
        control.dataset.submetaPanelFloatingField,
        control.type === "checkbox" ? control.checked : control.value,
        { syncMain: false }
      );
      syncDebugPanelSelection();
      root.requestAnimationFrame?.(() => positionFloatingPanelEditor(getPanelNode(floatingEditorTargetId)?.getBoundingClientRect() || getPanelNode(panelId)?.getBoundingClientRect()));
    };
    floatingEditor.addEventListener("input", (event) => applyControl(event.target));
    floatingEditor.addEventListener("change", (event) => { applyControl(event.target); syncFloatingPanelEditor(panelId); });
    floatingEditor.addEventListener("click", (event) => {
      const action = event.target?.dataset?.submetaPanelFloatingAction;
      if (action === "close") closeFloatingPanelEditor();
      if (action === "save") {
        applyFloatingPanelEditorValues();
        saveLayout();
        closeFloatingPanelEditor();
      }
    });
    syncFloatingPanelEditor(panelId);
    const preferredAnchor = DETAIL_RECT_IDS.includes(targetId) ? getPanelNode(targetId) : getPanelNode(panelId);
    positionFloatingPanelEditor(preferredAnchor?.getBoundingClientRect() || anchorRect);
    const focusItemId = DETAIL_RECT_IDS.includes(targetId) ? targetId : panelId;
    floatingEditor.querySelector(`[data-submeta-panel-floating-item="${focusItemId}"]`)?.focus();
    return true;
  }

  function handlePointerDown(event) {
    const cardTarget = event.target.closest?.("[data-submeta-card-key]");
    if (cardTarget) {
      event.preventDefault();
      event.stopPropagation();
      const source = cardTarget.dataset.submetaCardSource;
      const entries = source === "inventory" ? getInventoryEntries() : getPossibleEntries().entries;
      const entry = entries.find((candidate) => candidate.viewKey === cardTarget.dataset.submetaCardKey);
      selectCard(entry, source);
      return;
    }
    const filterTarget = event.target.closest?.("[data-submeta-inventory-filter]");
    if (filterTarget) {
      event.preventDefault();
      event.stopPropagation();
      inventoryFilter = filterTarget.dataset.submetaInventoryFilter;
      cardSelection.selectedInventoryEntryKey = null;
      if (cardSelection.selectedSource === "inventory") {
        cardSelection.selectedCardRef = null;
        cardSelection.selectedSource = cardSelection.selectedPlaceholder ? "placeholder" : null;
      }
      syncDom();
      return;
    }
    const target = event.target.closest?.("[data-submeta-panel-id]");
    if (!target || !isDebugMode()) return;
    event.preventDefault();
    event.stopPropagation();
    const targetId = target.dataset.submetaPanelId || null;
    selectedSlotId = target.dataset.submetaPanelSlotId || null;
    openFloatingPanelEditor(targetId, target.getBoundingClientRect());
  }

  function update() {
    if (!initialized) init();
    if (!layer || layer.parentElement !== getStage()) createLayer();
    if (!layer) return;
    actuallyVisible = enabled && overlayIsVisible() && items.some(shouldRender);
    if (!actuallyVisible || !isDebugMode()) closeFloatingPanelEditor();
    layer.hidden = !actuallyVisible;
    layer.setAttribute("aria-hidden", actuallyVisible ? "false" : "true");
    if (actuallyVisible) syncDom();
  }

  function init() {
    if (initialized) return initializationPromise;
    initialized = true;
    createStyle();
    createLayer();
    if (loadLayout()) {
      update();
      initializationPromise = Promise.resolve(true);
    } else {
      initializationPromise = restorePresetOrFallback("init");
    }
    return initializationPromise;
  }

  function setVisible(nextEnabled) {
    enabled = nextEnabled === true;
    if (!enabled) closeFloatingPanelEditor();
    update();
  }

  function setShowLabels(nextValue) {
    showLabels = nextValue === true;
    syncDom();
  }

  function selectPanel(id) {
    if (!items.some((item) => item.id === id)) return false;
    selectedPanelId = id;
    selectedSlotId = null;
    syncDom();
    syncDebugPanelSelection();
    return true;
  }

  function clearSelection() {
    closeFloatingPanelEditor();
    selectedPanelId = null;
    selectedSlotId = null;
    syncDom();
  }

  function getExportPayload() {
    return {
      version: VERSION,
      settings: { showSubMetaPanelsDebug: enabled, showPanelLabels: showLabels },
      panels: items.map((item) => ({ ...item }))
    };
  }

  function applyPayload(payload) {
    if (!payload || !Array.isArray(payload.panels)) return false;
    const candidatesById = new Map(payload.panels.map((item) => [item?.id, item]));
    items = DEFAULT_ITEMS.map((fallback) => normalizeItem(candidatesById.get(fallback.id), fallback));
    if (payload.settings && typeof payload.settings === "object") {
      enabled = payload.settings.showSubMetaPanelsDebug !== false;
      showLabels = payload.settings.showPanelLabels !== false;
    }
    if (!items.some((item) => item.id === selectedPanelId)) clearSelection();
    syncDom();
    update();
    return true;
  }

  function saveLayout() {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(getExportPayload()));
      return true;
    } catch (error) {
      console.warn("[HC.SubMetaPanels] layout save failed", error);
      return false;
    }
  }

  function loadLayout() {
    try {
      const raw = root.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const applied = applyPayload(JSON.parse(raw));
      if (applied) {
        dataSource = "localStorage";
        debugLog("panel preset loaded from localStorage", { storageKey: STORAGE_KEY });
      }
      return applied;
    } catch (error) {
      debugLog("localStorage panel preset could not be loaded; trying JSON", error);
      return false;
    }
  }

  async function restorePresetOrFallback(reason) {
    const requestId = ++presetRequestId;
    debugLog("loading panel preset JSON", { url: PRESET_URL, reason });
    try {
      const response = await root.fetch(PRESET_URL, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
      const payload = await response.json();
      if (requestId !== presetRequestId) return false;
      if (!applyPayload(payload)) throw new Error("Preset JSON does not contain a panels array");
      dataSource = "JSON preset";
      debugLog("panel preset loaded from JSON", { url: PRESET_URL, reason });
      return true;
    } catch (error) {
      if (requestId !== presetRequestId) return false;
      items = cloneDefaults();
      enabled = true;
      showLabels = true;
      dataSource = "DEFAULT_ITEMS fallback";
      clearSelection();
      syncDom();
      update();
      debugLog("panel preset JSON unavailable; using DEFAULT_ITEMS fallback", { url: PRESET_URL, reason, error });
      return false;
    }
  }

  function resetToDefault() {
    try { root.localStorage.removeItem(STORAGE_KEY); } catch (_error) { /* storage is optional */ }
    items = cloneDefaults();
    enabled = true;
    showLabels = true;
    dataSource = "DEFAULT_ITEMS fallback";
    clearSelection();
    syncDom();
    update();
    return restorePresetOrFallback("reset");
  }

  function importLayout(json) {
    try {
      const payload = typeof json === "string" ? JSON.parse(json) : json;
      const applied = applyPayload(payload);
      if (applied) saveLayout();
      return applied;
    } catch (error) {
      console.warn("[HC.SubMetaPanels] JSON import failed", error);
      return false;
    }
  }

  function exportLayout() {
    const json = JSON.stringify(getExportPayload(), null, 2);
    console.info("[HC.SubMetaPanels] layout JSON\n" + json);
    return json;
  }

  function updateItemField(itemId, field, rawValue, options = {}) {
    const item = getItem(itemId);
    const fallback = defaultsById.get(itemId);
    if (!item || !fallback) return false;
    const allowed = new Set([...BASE_FIELDS, ...(item.type === "grid-panel" ? GRID_FIELDS : []), ...(item.id === "panel.inventory" ? ["pageStepRows"] : [])]);
    if (!allowed.has(field)) return false;
    if (field === "visibleInDebug" || field === "visibleInGame") item[field] = rawValue === true;
    else if (["zIndex", "gridColumns", "gridRowsVisible", "pageStepRows"].includes(field)) {
      const min = field === "zIndex" ? -100 : 1;
      const max = field === "zIndex" ? 1000 : 20;
      item[field] = Math.round(clampNumber(rawValue, min, max, fallback[field]));
    } else if (["cardRatioW", "cardRatioH"].includes(field)) item[field] = clampNumber(rawValue, 0.1, 10, fallback[field]);
    else if (field === "cardScale") item[field] = clampNumber(rawValue, 0.1, 2, fallback[field]);
    else if (["gap", "gapX", "gapY", "filterTopMargin", "arrowRightMargin"].includes(field)) {
      const value = clampNumber(rawValue, 0, 0.25, fallback[field] ?? fallback.gap);
      if (["gap", "gapX", "gapY"].includes(field)) item.gap = item.gapX = item.gapY = value;
      else item[field] = value;
    } else if (["paddingX", "paddingY"].includes(field)) item[field] = clampNumber(rawValue, 0, 0.45, fallback[field]);
    else if (field === "gridOffsetX") item[field] = clampNumber(rawValue, -1, 1, fallback[field]);
    else item[field] = clampNumber(rawValue, field === "w" || field === "h" ? 0.005 : 0, 1, fallback[field]);
    syncDom();
    if (options.syncMain !== false) syncDebugPanelSelection();
    return true;
  }

  function updateSelectedField(field, rawValue) {
    const updated = updateItemField(selectedPanelId, field, rawValue);
    if (updated) syncFloatingPanelEditor();
    return updated;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function renderNumberControl(field, value, min, max, step, disabled = false) {
    return `<label class="submeta-png-debug-row"><span>${field}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${value}" data-submeta-panel-field="${field}"${disabled ? " disabled" : ""}></label>`;
  }

  function renderDebugHtml(options = {}) {
    const selectedItem = items.find((item) => item.id === selectedPanelId) || null;
    const selected = selectedItem || items[0];
    const disabled = !selectedItem;
    const optionGroups = [
      ["Panele", PANEL_IDS], ["Kontrolki gridów", GRID_CONTROL_IDS], ["Opis / recty", DETAIL_RECT_IDS]
    ].map(([label, ids]) => `<optgroup label="${label}">${ids.map((id) => {
      const item = items.find((candidate) => candidate.id === id);
      return item ? `<option value="${escapeHtml(id)}"${id === selectedPanelId ? " selected" : ""}>${escapeHtml(id)}</option>` : "";
    }).join("")}</optgroup>`).join("");
    const gridControls = selected.type === "grid-panel" ? `
      ${renderNumberControl("gridColumns", selected.gridColumns, 1, 20, 1, disabled)}
      ${renderNumberControl("gridRowsVisible", selected.gridRowsVisible, 1, 20, 1, disabled)}
      ${renderNumberControl("cardScale", selected.cardScale, 0.1, 2, 0.01, disabled)}
      ${renderNumberControl("gap", selected.gap, 0, 0.25, 0.001, disabled)}
      ${renderNumberControl("paddingX", selected.paddingX, 0, 0.45, 0.001, disabled)}
      ${renderNumberControl("paddingY", selected.paddingY, 0, 0.45, 0.001, disabled)}
      ${renderNumberControl("gridOffsetX", selected.gridOffsetX, -1, 1, 0.001, disabled)}
      ${renderNumberControl("arrowRightMargin", selected.arrowRightMargin, 0, 0.25, 0.001, disabled)}
      ${selected.id === "panel.inventory" ? renderNumberControl("filterTopMargin", selected.filterTopMargin, 0, 0.25, 0.001, disabled) : ""}
      ${selected.id === "panel.inventory" ? renderNumberControl("pageStepRows", selected.pageStepRows, 1, 20, 1, disabled) : ""}` : "";
    return `
      <details class="submeta-png-debug" data-runtime-debug-section="submeta-panels"${options.open === false ? "" : " open"}>
        <summary>SUB-META Panels</summary>
        <div class="submeta-png-debug-row"><span>showSubMetaPanelsDebug</span><input id="dbgSubMetaPanelsVisible" type="checkbox" data-submeta-panel-setting="enabled"${enabled ? " checked" : ""}></div>
        <div class="submeta-png-debug-row"><span>showPanelLabels</span><input id="dbgSubMetaPanelLabels" type="checkbox" data-submeta-panel-setting="labels"${showLabels ? " checked" : ""}></div>
        <label class="submeta-png-debug-row"><span>panel / rect</span><select id="dbgSubMetaPanelId" data-submeta-panel-action="select"><option value=""${selectedItem ? "" : " selected"}>— select —</option>${optionGroups}</select></label>
        ${renderNumberControl("x", selected.x, 0, 1, 0.001, disabled)}
        ${renderNumberControl("y", selected.y, 0, 1, 0.001, disabled)}
        ${renderNumberControl("w", selected.w, 0.005, 1, 0.001, disabled)}
        ${renderNumberControl("h", selected.h, 0.005, 1, 0.001, disabled)}
        ${renderNumberControl("zIndex", selected.zIndex, -100, 1000, 1, disabled)}
        <label class="submeta-png-debug-row"><span>visibleInDebug</span><input type="checkbox" data-submeta-panel-field="visibleInDebug"${selected.visibleInDebug ? " checked" : ""}${disabled ? " disabled" : ""}></label>
        <label class="submeta-png-debug-row"><span>visibleInGame</span><input type="checkbox" data-submeta-panel-field="visibleInGame"${selected.visibleInGame ? " checked" : ""}${disabled ? " disabled" : ""}></label>
        ${gridControls}
        <div class="submeta-png-debug-actions">
          <button class="overlay-btn" type="button" data-submeta-panel-action="clear-selection">Clear selection</button>
          <button class="overlay-btn" type="button" data-submeta-panel-action="save">Save layout</button>
          <button class="overlay-btn" type="button" data-submeta-panel-action="reset">Reset preset</button>
          <button class="overlay-btn" type="button" data-submeta-panel-action="export">Export JSON</button>
          <button class="overlay-btn" type="button" data-submeta-panel-action="import">Import JSON</button>
        </div>
        <textarea id="dbgSubMetaPanelsJson" class="overlay-note submeta-panels-json" spellcheck="false" placeholder="Exported JSON appears here; paste panel JSON here before Import."></textarea>
        <div class="submeta-png-diagnostics">
          <div class="overlay-row"><span class="k">preset</span><code class="v">${PRESET_URL}</code></div>
          <div class="overlay-row"><span class="k">selected slot</span><code class="v">${escapeHtml(selectedSlotId || "none")}</code></div>
          <div class="overlay-row"><span class="k">selected placeholder</span><code class="v">${escapeHtml(cardSelection.selectedPlaceholderId || "none")}</code></div>
          <div class="overlay-row"><span class="k">selected card</span><code class="v">${escapeHtml(cardSelection.selectedCardRef?.key || cardSelection.selectedCardRef?.cardKey || "none")}</code></div>
          <div class="overlay-row"><span class="k">storage</span><code class="v">${STORAGE_KEY}</code></div>
        </div>
      </details>`;
  }

  function syncDebugPanelSelection() {
    const select = document.getElementById("dbgSubMetaPanelId");
    if (select) select.value = selectedPanelId || "";
    const item = items.find((candidate) => candidate.id === selectedPanelId);
    if (!item) return;
    document.querySelectorAll("[data-submeta-panel-field]").forEach((control) => {
      const field = control.dataset.submetaPanelField;
      if (!(field in item)) return;
      if (control.type === "checkbox") control.checked = item[field] === true;
      else control.value = String(item[field]);
    });
  }

  function handleDebugControl(target) {
    if (!target) return false;
    const setting = target.dataset?.submetaPanelSetting;
    if (setting === "enabled") { setVisible(target.checked); return true; }
    if (setting === "labels") { setShowLabels(target.checked); return true; }
    const field = target.dataset?.submetaPanelField;
    if (field) return updateSelectedField(field, ["visibleInDebug", "visibleInGame"].includes(field) ? target.checked : target.value);
    const action = target.dataset?.submetaPanelAction;
    if (!action) return false;
    if (action === "select") return selectPanel(target.value);
    if (action === "clear-selection") { clearSelection(); return true; }
    if (action === "save") return saveLayout();
    if (action === "reset") return resetToDefault();
    const textarea = document.getElementById("dbgSubMetaPanelsJson");
    if (action === "export") { if (textarea) textarea.value = exportLayout(); return true; }
    if (action === "import") return importLayout(textarea?.value || "");
    return false;
  }

  function getDebugState() {
    return {
      version: VERSION, initialized, enabled, visible: actuallyVisible, overlayVisible: overlayIsVisible(),
      showPanelLabels: showLabels, dataSource, presetUrl: PRESET_URL, selectedPanelId, selectedSlotId, configuredCount: items.length,
      inventoryFilter, cardSelection: { ...cardSelection }, selectedPlaceholderId: cardSelection.selectedPlaceholderId,
      pendingAssignment: clonePendingAssignment(), confirmButtonState: getConfirmButtonState(),
      assignedPlaceholders: getCardApi()?.getPlaceholderAssignments?.(getWorld()) || {}, inventoryEntryCount: getInventoryEntries().length,
      possibleEntryCount: getPossibleEntries().entries.length,
      renderedPanelCount: layer?.querySelectorAll("[data-submeta-panel-id]:not([data-submeta-panel-slot-id])").length || 0,
      renderedSlotCount: layer?.querySelectorAll("[data-submeta-panel-slot-id]").length || 0,
      stageMounted: !!(stage && stage.isConnected), layerMounted: !!(layer && layer.isConnected), debugMode: isDebugMode()
    };
  }

  root.HC.SubMetaPanels = {
    VERSION, STORAGE_KEY, PRESET_URL, init, update, syncDom, setVisible, isVisible: () => actuallyVisible,
    getSelectedPanelId: () => selectedPanelId, getDebugState, resetToDefault, exportLayout, importLayout, saveLayout, loadLayout,
    setShowLabels, selectPanel, clearSelection, getPanels: () => items.map((item) => ({ ...item })), getExportPayload,
    selectPlaceholder, clearPlaceholderSelection, selectCard, selectAssignedCard, mapPlaceholderContext,
    getCardViewState: () => ({ inventoryFilter, ...cardSelection, pendingAssignment: clonePendingAssignment(), confirmButtonState: getConfirmButtonState() }),
    getPendingAssignment: clonePendingAssignment, getConfirmButtonState, confirmPendingAssignment, clearPendingAssignment,
    getInventoryEntries, getPossibleEntries, getDetailModel,
    resolveCardAsset: (card) => root.HC?.SubMetaPlaceholders?.resolveCardAsset?.(card) || null,
    renderSubMetaCard,
    openFloatingPanelEditor, closeFloatingPanelEditor, syncFloatingPanelEditor, applyFloatingPanelEditorValues,
    updateSelectedField, renderDebugHtml, handleDebugControl
  };

  Object.defineProperties(root, {
    showSubMetaPanelsDebug: { configurable: true, enumerable: true, get: () => enabled, set: setVisible },
    showPanelLabels: { configurable: true, enumerable: true, get: () => showLabels, set: setShowLabels }
  });
})(window);
