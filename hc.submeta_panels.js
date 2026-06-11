// Haiku Cosmos debug layout layer for SUB-META working panels.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const VERSION = "submeta-panels-layout-v0.1";
  const STORAGE_KEY = "hc.submetaPanels.layout.v1";
  const PRESET_URL = "public/png/submeta/submeta-panels-layout-export.json";
  const LAYER_ID = "subMetaPanelsLayer";
  const GRID_PANEL_IDS = Object.freeze(["panel.inventory", "panel.possibilities", "panel.forge"]);
  const PANEL_IDS = Object.freeze([...GRID_PANEL_IDS, "panel.detail"]);
  const INVENTORY_CONTROL_IDS = Object.freeze([
    "inventory.filter.normal", "inventory.filter.special", "inventory.filter.resources",
    "inventory.scroll.up", "inventory.scroll.down"
  ]);
  const DETAIL_RECT_IDS = Object.freeze(["detail.preview_card", "detail.description", "detail.haiku"]);
  const BASE_FIELDS = Object.freeze(["x", "y", "w", "h", "zIndex", "visibleInDebug", "visibleInGame"]);
  const GRID_FIELDS = Object.freeze([
    "gridColumns", "gridRowsVisible", "cardRatioW", "cardRatioH", "gapX", "gapY", "paddingX", "paddingY"
  ]);

  const rect = (id, type, label, x, y, w, h, zIndex, visibleInDebug = true, visibleInGame = false) =>
    Object.freeze({ id, type, label, x, y, w, h, zIndex, visibleInDebug, visibleInGame });
  const gridPanel = (id, label, x, y, w, h, zIndex, gridColumns, gridRowsVisible, gapX, gapY, paddingX, paddingY, pageStepRows) =>
    Object.freeze({
      id, type: "grid-panel", label, x, y, w, h, zIndex, visibleInDebug: true, visibleInGame: false,
      gridColumns, gridRowsVisible, cardRatioW: 1.3, cardRatioH: 2.3, gapX, gapY, paddingX, paddingY,
      ...(pageStepRows == null ? {} : { pageStepRows })
    });

  const DEFAULT_ITEMS = Object.freeze([
    gridPanel("panel.inventory", "Magazyn", 0.745, 0.235, 0.285, 0.205, 210, 7, 3, 0.006, 0.008, 0.018, 0.024, 3),
    rect("inventory.filter.normal", "control", "Normalne", 0.675, 0.147, 0.055, 0.025, 212),
    rect("inventory.filter.special", "control", "Specjalne", 0.745, 0.147, 0.055, 0.025, 212),
    rect("inventory.filter.resources", "control", "Zasoby", 0.815, 0.147, 0.055, 0.025, 212),
    rect("inventory.scroll.up", "control", "Scroll ↑", 0.888, 0.205, 0.022, 0.035, 212),
    rect("inventory.scroll.down", "control", "Scroll ↓", 0.888, 0.275, 0.022, 0.035, 212),
    gridPanel("panel.possibilities", "Możliwości", 0.692, 0.500, 0.125, 0.135, 210, 3, 2, 0.007, 0.009, 0.012, 0.014),
    gridPanel("panel.forge", "Kuźnia", 0.830, 0.500, 0.125, 0.135, 210, 3, 2, 0.007, 0.009, 0.012, 0.014),
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
      normalized.gapX = clampNumber(source.gapX, 0, 0.25, fallback.gapX);
      normalized.gapY = clampNumber(source.gapY, 0, 0.25, fallback.gapY);
      normalized.paddingX = clampNumber(source.paddingX, 0, 0.45, fallback.paddingX);
      normalized.paddingY = clampNumber(source.paddingY, 0, 0.45, fallback.paddingY);
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
      .submeta-panel-item.is-selected { border-color:rgba(255,219,112,.95); box-shadow:0 0 0 1px rgba(255,219,112,.3) inset; }
      .submeta-panel-label { position:absolute; left:2px; top:2px; max-width:calc(100% - 4px); padding:1px 3px; overflow:hidden; color:rgba(225,247,255,.9); background:rgba(3,15,23,.72); font:9px/1.2 var(--hc-font-mono, monospace); white-space:nowrap; pointer-events:none; }
      .submeta-panel-grid { position:absolute; inset:0; pointer-events:none; }
      .submeta-panel-grid-slot { position:absolute; box-sizing:border-box; border:1px solid rgba(140,225,255,.35); background:rgba(80,185,220,.035); pointer-events:auto; cursor:crosshair; }
      .submeta-panel-grid-slot:hover { border-color:rgba(190,240,255,.75); }
      .submeta-panel-grid-slot.is-selected { border-color:rgba(255,219,112,.95); background:rgba(255,219,112,.12); }
      .submeta-panel-control { border-style:dashed !important; pointer-events:auto; cursor:crosshair; }
      .submeta-panel-detail-rect { border-color:rgba(206,165,255,.52) !important; background:rgba(160,90,220,.035) !important; pointer-events:auto; cursor:crosshair; }
      .submeta-panels-json { min-height:92px; width:100%; box-sizing:border-box; }
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

  function computeGrid(panel) {
    const columns = Math.max(1, panel.gridColumns);
    const rows = Math.max(1, panel.gridRowsVisible);
    const innerW = Math.max(0.001, panel.w - (2 * panel.paddingX));
    const innerH = Math.max(0.001, panel.h - (2 * panel.paddingY));
    const maxSlotW = Math.max(0.001, (innerW - ((columns - 1) * panel.gapX)) / columns);
    const maxSlotH = Math.max(0.001, (innerH - ((rows - 1) * panel.gapY)) / rows);
    const stageRect = stage?.getBoundingClientRect();
    const stageAspect = stageRect?.width && stageRect?.height ? stageRect.width / stageRect.height : 1.5;
    const targetHeightForWidth = maxSlotW * stageAspect * (panel.cardRatioH / panel.cardRatioW);
    const slotH = Math.min(maxSlotH, targetHeightForWidth);
    const slotW = Math.min(maxSlotW, slotH / stageAspect * (panel.cardRatioW / panel.cardRatioH));
    const usedW = (columns * slotW) + ((columns - 1) * panel.gapX);
    const usedH = (rows * slotH) + ((rows - 1) * panel.gapY);
    const left = panel.x - (usedW / 2);
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

  function applyBox(node, item) {
    node.style.left = `${item.x * 100}%`;
    node.style.top = `${item.y * 100}%`;
    node.style.width = `${item.w * 100}%`;
    node.style.height = `${item.h * 100}%`;
    node.style.zIndex = String(item.zIndex);
  }

  function syncDom() {
    if (!createLayer()) return false;
    layer.replaceChildren();
    for (const item of items) {
      if (!shouldRender(item)) continue;
      const node = document.createElement("div");
      node.className = "submeta-panel-item";
      if (isDebugMode()) node.classList.add("is-debug-visible");
      if (item.type === "control") node.classList.add("submeta-panel-control");
      if (item.type === "detail-rect") node.classList.add("submeta-panel-detail-rect");
      if (item.id === selectedPanelId) node.classList.add("is-selected");
      node.dataset.submetaPanelId = item.id;
      applyBox(node, item);
      if (showLabels && isDebugMode()) {
        const label = document.createElement("span");
        label.className = "submeta-panel-label";
        label.textContent = item.label || item.id;
        node.appendChild(label);
      }
      layer.appendChild(node);

      if (item.type === "grid-panel" && isDebugMode()) {
        for (const slot of computeGrid(item)) {
          const slotNode = document.createElement("button");
          slotNode.type = "button";
          slotNode.className = "submeta-panel-grid-slot";
          if (slot.id === selectedSlotId) slotNode.classList.add("is-selected");
          slotNode.dataset.submetaPanelId = item.id;
          slotNode.dataset.submetaPanelSlotId = slot.id;
          slotNode.title = `${item.label}: rząd ${slot.row}, kolumna ${slot.column}`;
          slotNode.setAttribute("aria-label", slotNode.title);
          applyBox(slotNode, { ...slot, zIndex: item.zIndex + 1 });
          layer.appendChild(slotNode);
        }
      }
    }
    return true;
  }

  function handlePointerDown(event) {
    const target = event.target.closest?.("[data-submeta-panel-id]");
    if (!target || !isDebugMode()) return;
    event.preventDefault();
    event.stopPropagation();
    selectedPanelId = target.dataset.submetaPanelId || null;
    selectedSlotId = target.dataset.submetaPanelSlotId || null;
    syncDom();
    syncDebugPanelSelection();
  }

  function update() {
    if (!initialized) init();
    if (!layer || layer.parentElement !== getStage()) createLayer();
    if (!layer) return;
    actuallyVisible = enabled && overlayIsVisible() && items.some(shouldRender);
    layer.hidden = !actuallyVisible;
    layer.setAttribute("aria-hidden", actuallyVisible ? "false" : "true");
    if (actuallyVisible) syncDom();
  }

  function init() {
    if (initialized) return;
    initialized = true;
    createStyle();
    loadLayout();
    createLayer();
    update();
  }

  function setVisible(nextEnabled) {
    enabled = nextEnabled === true;
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
      return raw ? applyPayload(JSON.parse(raw)) : false;
    } catch (error) {
      console.warn("[HC.SubMetaPanels] layout load failed", error);
      return false;
    }
  }

  function resetToDefault() {
    items = cloneDefaults();
    enabled = true;
    showLabels = true;
    clearSelection();
    try { root.localStorage.removeItem(STORAGE_KEY); } catch (_error) { /* storage is optional */ }
    syncDom();
    update();
    return true;
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

  function updateSelectedField(field, rawValue) {
    const item = items.find((candidate) => candidate.id === selectedPanelId);
    const fallback = defaultsById.get(selectedPanelId);
    if (!item || !fallback) return false;
    const allowed = new Set([...BASE_FIELDS, ...(item.type === "grid-panel" ? GRID_FIELDS : []), ...(item.id === "panel.inventory" ? ["pageStepRows"] : [])]);
    if (!allowed.has(field)) return false;
    if (field === "visibleInDebug" || field === "visibleInGame") item[field] = rawValue === true;
    else if (["zIndex", "gridColumns", "gridRowsVisible", "pageStepRows"].includes(field)) {
      const min = field === "zIndex" ? -100 : 1;
      const max = field === "zIndex" ? 1000 : 20;
      item[field] = Math.round(clampNumber(rawValue, min, max, fallback[field]));
    } else if (["cardRatioW", "cardRatioH"].includes(field)) item[field] = clampNumber(rawValue, 0.1, 10, fallback[field]);
    else if (["gapX", "gapY"].includes(field)) item[field] = clampNumber(rawValue, 0, 0.25, fallback[field]);
    else if (["paddingX", "paddingY"].includes(field)) item[field] = clampNumber(rawValue, 0, 0.45, fallback[field]);
    else item[field] = clampNumber(rawValue, field === "w" || field === "h" ? 0.005 : 0, 1, fallback[field]);
    syncDom();
    syncDebugPanelSelection();
    return true;
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
      ["Panele", PANEL_IDS], ["Magazyn / kontrolki", INVENTORY_CONTROL_IDS], ["Opis / recty", DETAIL_RECT_IDS]
    ].map(([label, ids]) => `<optgroup label="${label}">${ids.map((id) => {
      const item = items.find((candidate) => candidate.id === id);
      return item ? `<option value="${escapeHtml(id)}"${id === selectedPanelId ? " selected" : ""}>${escapeHtml(id)}</option>` : "";
    }).join("")}</optgroup>`).join("");
    const gridControls = selected.type === "grid-panel" ? `
      ${renderNumberControl("gridColumns", selected.gridColumns, 1, 20, 1, disabled)}
      ${renderNumberControl("gridRowsVisible", selected.gridRowsVisible, 1, 20, 1, disabled)}
      ${renderNumberControl("gapX", selected.gapX, 0, 0.25, 0.001, disabled)}
      ${renderNumberControl("gapY", selected.gapY, 0, 0.25, 0.001, disabled)}
      ${renderNumberControl("paddingX", selected.paddingX, 0, 0.45, 0.001, disabled)}
      ${renderNumberControl("paddingY", selected.paddingY, 0, 0.45, 0.001, disabled)}
      ${renderNumberControl("cardRatioW", selected.cardRatioW, 0.1, 10, 0.1, disabled)}
      ${renderNumberControl("cardRatioH", selected.cardRatioH, 0.1, 10, 0.1, disabled)}
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
      showPanelLabels: showLabels, selectedPanelId, selectedSlotId, configuredCount: items.length,
      renderedPanelCount: layer?.querySelectorAll("[data-submeta-panel-id]:not([data-submeta-panel-slot-id])").length || 0,
      renderedSlotCount: layer?.querySelectorAll("[data-submeta-panel-slot-id]").length || 0,
      stageMounted: !!(stage && stage.isConnected), layerMounted: !!(layer && layer.isConnected), debugMode: isDebugMode()
    };
  }

  root.HC.SubMetaPanels = {
    VERSION, STORAGE_KEY, PRESET_URL, init, update, syncDom, setVisible, isVisible: () => actuallyVisible,
    getSelectedPanelId: () => selectedPanelId, getDebugState, resetToDefault, exportLayout, importLayout, saveLayout, loadLayout,
    setShowLabels, selectPanel, clearSelection, getPanels: () => items.map((item) => ({ ...item })), getExportPayload,
    updateSelectedField, renderDebugHtml, handleDebugControl
  };

  Object.defineProperties(root, {
    showSubMetaPanelsDebug: { configurable: true, enumerable: true, get: () => enabled, set: setVisible },
    showPanelLabels: { configurable: true, enumerable: true, get: () => showLabels, set: setShowLabels }
  });
})(window);
