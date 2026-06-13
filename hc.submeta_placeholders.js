// Haiku Cosmos DOM placeholder layer for the PNG/CSS SUB-META overlay.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const VERSION = "submeta-placeholders-v0.4";
  const SETTING_KEY = "placeholders";
  const LAYER_ID = "subMetaPlaceholderLayer";
  const FLOATING_EDITOR_ID = "subMetaPlaceholderFloatingEditor";
  const STATES = Object.freeze(["free_active", "free_inactive", "hidden", "occupied"]);
  const GROUPS = Object.freeze(["PRG R1", "PRG R2", "R3", "R4", "Świat", "Świat R2"]);
  const EDITABLE_FIELDS = Object.freeze(["x", "y", "w", "h", "zIndex", "state", "visibleInGame", "visibleInDebug"]);
  const SUBMETA_CARD_GEOMETRY = root.HC.SubMetaCardGeometry || Object.freeze({
    ratioW: 9,
    ratioH: 16,
    aspect: 9 / 16,
    fitNormalized(maxW, maxH, stageAspect, scale = 1) {
      const safeStageAspect = Number.isFinite(stageAspect) && stageAspect > 0 ? stageAspect : 1.5;
      const safeScale = Number.isFinite(scale) && scale > 0 ? scale : 1;
      const fittedH = Math.min(maxH, maxW * safeStageAspect / this.aspect);
      const fittedW = Math.min(maxW, fittedH * this.aspect / safeStageAspect);
      return { w: fittedW * safeScale, h: fittedH * safeScale };
    }
  });
  root.HC.SubMetaCardGeometry = SUBMETA_CARD_GEOMETRY;
  const SLOT_CARD_RATIO = Object.freeze({ width: SUBMETA_CARD_GEOMETRY.ratioW, height: SUBMETA_CARD_GEOMETRY.ratioH });
  const SLOT_CARD_BASE_HEIGHT = 0.0644;
  const SLOT_CARD_BASE_UNIT = 0.028;
  const DEFAULT_SLOT_CARD_SCALE = 1;

  const placeholder = (id, group, subgroup, kind, state, x, y, w, h, zIndex, visibleInGame, visibleInDebug, label) =>
    Object.freeze({ id, group, subgroup, kind, state, x, y, w, h, zIndex, visibleInGame, visibleInDebug, selected: false, label });

  const DEFAULT_PLACEHOLDERS = Object.freeze([
    // PRG R1: four axes, two card slots and one resource slot per axis.
    placeholder("prg.forma.r1.1", "PRG R1", "forma", "card", "free_active", 0.264, 0.161, 0.013, 0.023, 110, true, true, "Forma R1 / 1"),
    placeholder("prg.forma.r1.2", "PRG R1", "forma", "card", "free_inactive", 0.289, 0.161, 0.013, 0.023, 111, true, true, "Forma R1 / 2"),
    placeholder("prg.forma.dust", "PRG R1", "forma", "dust", "free_inactive", 0.313, 0.161, 0.013, 0.023, 112, true, true, "Pył Forma"),
    placeholder("prg.intencja.r1.1", "PRG R1", "intencja", "card", "free_active", 0.265, 0.235, 0.013, 0.023, 110, true, true, "Intencja R1 / 1"),
    placeholder("prg.intencja.r1.2", "PRG R1", "intencja", "card", "free_inactive", 0.29, 0.235, 0.013, 0.023, 111, true, true, "Intencja R1 / 2"),
    placeholder("prg.intencja.dust", "PRG R1", "intencja", "dust", "free_inactive", 0.314, 0.235, 0.013, 0.023, 112, true, true, "Pył Intencja"),
    placeholder("prg.czas.r1.1", "PRG R1", "czas", "card", "free_active", 0.265, 0.31, 0.013, 0.023, 110, true, true, "Czas R1 / 1"),
    placeholder("prg.czas.r1.2", "PRG R1", "czas", "card", "free_inactive", 0.291, 0.31, 0.013, 0.023, 111, true, true, "Czas R1 / 2"),
    placeholder("prg.czas.dust", "PRG R1", "czas", "dust", "free_inactive", 0.315, 0.31, 0.013, 0.023, 112, true, true, "Pył Czas"),
    placeholder("prg.cisza.r1.1", "PRG R1", "cisza", "card", "free_active", 0.265, 0.387, 0.013, 0.023, 110, true, true, "Cisza R1 / 1"),
    placeholder("prg.cisza.r1.2", "PRG R1", "cisza", "card", "free_inactive", 0.292, 0.387, 0.013, 0.023, 111, true, true, "Cisza R1 / 2"),
    placeholder("prg.cisza.dust", "PRG R1", "cisza", "dust", "free_inactive", 0.316, 0.387, 0.013, 0.0230023, 112, true, true, "Pył Cisza"),

    // PRG R2.
    placeholder("prg.r2.1.card", "PRG R2", "slot.1", "card", "free_inactive", 0.425, 0.155, 0.042, 0.064, 115, true, true, "PRG R2 / 1"),
    placeholder("prg.r2.1.dust", "PRG R2", "slot.1", "dust", "free_inactive", 0.452, 0.185, 0.017, 0.025, 116, true, true, "Pył PRG R2 / 1"),
    placeholder("prg.r2.2.card", "PRG R2", "slot.2", "card", "free_inactive", 0.460, 0.245, 0.042, 0.064, 115, true, true, "PRG R2 / 2"),
    placeholder("prg.r2.2.dust", "PRG R2", "slot.2", "dust", "free_inactive", 0.487, 0.275, 0.017, 0.025, 116, true, true, "Pył PRG R2 / 2"),
    placeholder("prg.r2.3.card", "PRG R2", "slot.3", "card", "free_inactive", 0.425, 0.335, 0.042, 0.064, 115, true, true, "PRG R2 / 3"),
    placeholder("prg.r2.3.dust", "PRG R2", "slot.3", "dust", "free_inactive", 0.452, 0.365, 0.017, 0.025, 116, true, true, "Pył PRG R2 / 3"),

    // Core R3.
    placeholder("core.r3.1.card", "R3", "slot.1", "card", "free_inactive", 0.470, 0.270, 0.043, 0.066, 120, true, true, "R3 / 1"),
    placeholder("core.r3.1.dust", "R3", "slot.1", "dust", "free_inactive", 0.497, 0.300, 0.017, 0.025, 121, true, true, "Pył R3 / 1"),
    placeholder("core.r3.2.card", "R3", "slot.2", "card", "free_inactive", 0.530, 0.270, 0.043, 0.066, 120, true, true, "R3 / 2"),
    placeholder("core.r3.2.dust", "R3", "slot.2", "dust", "free_inactive", 0.557, 0.300, 0.017, 0.025, 121, true, true, "Pył R3 / 2"),
    placeholder("core.r3.3.card", "R3", "slot.3", "card", "free_inactive", 0.500, 0.350, 0.043, 0.066, 120, true, true, "R3 / 3"),
    placeholder("core.r3.3.dust", "R3", "slot.3", "dust", "free_inactive", 0.527, 0.380, 0.017, 0.025, 121, true, true, "Pył R3 / 3"),
    placeholder("core.r3.4.card", "R3", "slot.4", "card", "free_inactive", 0.560, 0.350, 0.043, 0.066, 120, true, true, "R3 / 4"),
    placeholder("core.r3.4.dust", "R3", "slot.4", "dust", "free_inactive", 0.587, 0.380, 0.017, 0.025, 121, true, true, "Pył R3 / 4"),

    // Core R4. Special and dust sockets are intentionally hidden until their gameplay rules exist.
    placeholder("core.r4.main", "R4", "main", "card", "free_inactive", 0.500, 0.500, 0.050, 0.076, 130, true, true, "Rdzeń R4"),
    placeholder("core.r4.special.1", "R4", "special", "special", "hidden", 0.455, 0.468, 0.020, 0.030, 131, false, true, "R4 specjalna / 1"),
    placeholder("core.r4.special.2", "R4", "special", "special", "hidden", 0.545, 0.468, 0.020, 0.030, 131, false, true, "R4 specjalna / 2"),
    placeholder("core.r4.special.3", "R4", "special", "special", "hidden", 0.455, 0.532, 0.020, 0.030, 131, false, true, "R4 specjalna / 3"),
    placeholder("core.r4.special.4", "R4", "special", "special", "hidden", 0.545, 0.532, 0.020, 0.030, 131, false, true, "R4 specjalna / 4"),
    placeholder("core.r4.dust.1", "R4", "dust", "dust", "hidden", 0.475, 0.440, 0.016, 0.024, 132, false, true, "Pył R4 / 1"),
    placeholder("core.r4.dust.2", "R4", "dust", "dust", "hidden", 0.525, 0.440, 0.016, 0.024, 132, false, true, "Pył R4 / 2"),
    placeholder("core.r4.dust.3", "R4", "dust", "dust", "hidden", 0.475, 0.560, 0.016, 0.024, 132, false, true, "Pył R4 / 3"),
    placeholder("core.r4.dust.4", "R4", "dust", "dust", "hidden", 0.525, 0.560, 0.016, 0.024, 132, false, true, "Pył R4 / 4"),

    // World: four fields matching Forma, Intencja, Czas and Cisza frames.
    ...worldSlot(1, "forma", 0.160, 0.600),
    ...worldSlot(2, "intencja", 0.300, 0.600),
    ...worldSlot(3, "czas", 0.160, 0.830),
    ...worldSlot(4, "cisza", 0.300, 0.830),

    // World R2: restored PNG frame remains owned by hc.submeta_png.js; these are overlay sockets only.
    placeholder("world.r2.1.card", "Świat R2", "slot.1", "card", "free_inactive", 0.430, 0.625, 0.043, 0.066, 125, true, true, "Świat R2 / 1"),
    placeholder("world.r2.1.dust", "Świat R2", "slot.1", "dust", "free_inactive", 0.457, 0.655, 0.017, 0.025, 126, true, true, "Pył Świat R2 / 1"),
    placeholder("world.r2.2.card", "Świat R2", "slot.2", "card", "free_inactive", 0.490, 0.705, 0.043, 0.066, 125, true, true, "Świat R2 / 2"),
    placeholder("world.r2.2.dust", "Świat R2", "slot.2", "dust", "free_inactive", 0.517, 0.735, 0.017, 0.025, 126, true, true, "Pył Świat R2 / 2"),
    placeholder("world.r2.3.card", "Świat R2", "slot.3", "card", "free_inactive", 0.430, 0.785, 0.043, 0.066, 125, true, true, "Świat R2 / 3"),
    placeholder("world.r2.3.dust", "Świat R2", "slot.3", "dust", "free_inactive", 0.457, 0.815, 0.017, 0.025, 126, true, true, "Pył Świat R2 / 3")
  ]);

  function worldSlot(index, subgroup, x, y) {
    return [
      placeholder(`world.slot.${index}.r1`, "Świat", subgroup, "card", "free_active", x - 0.026, y - 0.020, 0.042, 0.064, 120, true, true, `Świat ${index} R1`),
      placeholder(`world.slot.${index}.special`, "Świat", subgroup, "special", "hidden", x + 0.028, y - 0.020, 0.020, 0.030, 121, false, true, `Świat ${index} specjalna`),
      placeholder(`world.slot.${index}.dust`, "Świat", subgroup, "dust", "free_inactive", x - 0.020, y + 0.052, 0.017, 0.025, 122, true, true, `Pył Świat ${index}`),
      placeholder(`world.slot.${index}.artifact`, "Świat", subgroup, "artifact", "hidden", x + 0.028, y + 0.052, 0.026, 0.022, 123, false, true, `Artefakt Świat ${index}`)
    ];
  }

  const defaultsById = new Map(DEFAULT_PLACEHOLDERS.map((item) => [item.id, item]));
  let placeholders = cloneDefaults();
  let initialized = false;
  let initializationPromise = null;
  let dataSource = "fallback";
  let lastAction = "startup";
  let lastError = "";
  let lastSettingsUrl = null;
  let enabled = true;
  let showLabels = false;
  let showHidden = false;
  let slotCardScale = DEFAULT_SLOT_CARD_SCALE;
  let actuallyVisible = false;
  let selectedPlaceholderId = null;
  let layer = null;
  let stage = null;
  let floatingEditor = null;

  function cloneDefaults() {
    return DEFAULT_PLACEHOLDERS.map((item) => ({ ...item }));
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function normalizePlaceholder(candidate, fallback) {
    return {
      ...fallback,
      x: clampNumber(candidate?.x, 0, 1, fallback.x),
      y: clampNumber(candidate?.y, 0, 1, fallback.y),
      w: clampNumber(candidate?.w, 0.005, 0.5, fallback.w),
      h: clampNumber(candidate?.h, 0.005, 0.5, fallback.h),
      zIndex: Math.round(clampNumber(candidate?.zIndex, -100, 1000, fallback.zIndex)),
      state: STATES.includes(candidate?.state) ? candidate.state : fallback.state,
      visibleInGame: typeof candidate?.visibleInGame === "boolean" ? candidate.visibleInGame : fallback.visibleInGame,
      visibleInDebug: typeof candidate?.visibleInDebug === "boolean" ? candidate.visibleInDebug : fallback.visibleInDebug,
      selected: false
    };
  }

  function isDebugMode() {
    return root.HC?.Session?.mode === "debug";
  }

  function getWorld() {
    return root.HC?.getWorld?.() || root.World || root.CardEngine?.state?.world || null;
  }

  function getAssignedCards() {
    const World = getWorld();
    return World ? (root.CardEngine?.subMetaView?.getPlaceholderAssignments?.(World) || {}) : {};
  }

  function getPendingAssignment() {
    return root.HC?.SubMetaPanels?.getPendingAssignment?.() || null;
  }

  function isOccupied(item, assignments = getAssignedCards()) {
    return item?.state === "occupied" || Boolean(item?.id && assignments[item.id]);
  }

  function shouldRenderPlaceholder(item, assignments = getAssignedCards()) {
    if (isOccupied(item, assignments)) return false;
    if (item.state === "hidden" && !(isDebugMode() && showHidden)) return false;
    return isDebugMode() ? item.visibleInDebug === true : item.visibleInGame === true;
  }

  function getStage() {
    return document.getElementById("subMetaPngStage");
  }

  function createStyle() {
    if (document.getElementById("subMetaPlaceholderStyles")) return;
    const style = document.createElement("style");
    style.id = "subMetaPlaceholderStyles";
    style.textContent = `
      #${LAYER_ID} { position: absolute; inset: 0; z-index: 100; pointer-events: none; }
      #${LAYER_ID}[hidden] { display: none; }
      .submeta-placeholder {
        position: absolute; box-sizing: border-box; display: grid; place-items: center;
        transform: translate(-50%, -50%); border: 1px solid rgba(244, 228, 187, 0.58);
        background: rgba(232, 218, 180, 0.16); color: rgba(255, 247, 225, 0.9);
        font: 600 clamp(7px, 0.68vw, 10px)/1 sans-serif; letter-spacing: 0.02em;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9); cursor: pointer; pointer-events: auto;
        user-select: none; -webkit-tap-highlight-color: transparent;
      }
      .submeta-placeholder--card { border-radius: 18%; }
      .submeta-placeholder--dust, .submeta-placeholder--special { border-radius: 50%; }
      .submeta-placeholder--artifact { border-radius: 999px; }
      .submeta-placeholder--free-active { border-color: rgba(255, 235, 184, 0.62); background: rgba(235, 213, 158, 0.17); }
      .submeta-placeholder--free-inactive { border-color: rgba(190, 194, 202, 0.38); background: rgba(132, 138, 148, 0.13); color: rgba(220, 223, 228, 0.68); }
      .submeta-placeholder--hidden { border-style: dashed; border-color: rgba(151, 205, 255, 0.52); background: rgba(75, 135, 190, 0.12); }
      .submeta-placeholder.is-selected { border-color: rgba(255, 239, 186, 0.96); background: rgba(255, 226, 151, 0.24); box-shadow: 0 0 0 1px rgba(255, 242, 204, 0.22), 0 0 10px rgba(255, 214, 117, 0.66); }
      .submeta-placeholder:focus-visible { outline: 2px solid rgba(255, 239, 186, 0.92); outline-offset: 2px; }
      .submeta-placeholder-label { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 1px 2px; }
      .submeta-assigned-card {
        position:absolute; box-sizing:border-box; aspect-ratio:${SUBMETA_CARD_GEOMETRY.ratioW}/${SUBMETA_CARD_GEOMETRY.ratioH}; transform:translate(-50%,-50%); display:flex; flex-direction:column;
        justify-content:space-between; overflow:hidden; padding:3px; border:1px solid rgba(238,226,190,.8);
        border-radius:9%; background:linear-gradient(160deg,rgba(29,34,38,.98),rgba(5,8,11,.99)); color:#f4f0e5;
        box-shadow:0 3px 8px rgba(0,0,0,.58); font:600 clamp(5px,.48vw,9px)/1 system-ui,sans-serif;
        pointer-events:auto; cursor:pointer; user-select:none;
      }
      .submeta-assigned-card:hover { border-color:#fff0b7; }
      .submeta-assigned-card.is-selected { border-color:#ffdc72; box-shadow:0 0 0 1px rgba(255,220,114,.38),0 0 9px rgba(255,195,57,.58); }
      .submeta-placeholder.is-pending { opacity:.38; }
      .submeta-assigned-card.is-pending {
        opacity:.85; pointer-events:none; border-color:rgba(255,226,151,.9);
        box-shadow:0 0 0 1px rgba(255,226,151,.22),0 0 8px rgba(255,205,105,.34),0 3px 8px rgba(0,0,0,.58);
        animation:submeta-pending-card-pulse 1.8s ease-in-out infinite;
      }
      @keyframes submeta-pending-card-pulse {
        0%,100% { opacity:.78; filter:brightness(.96); }
        50% { opacity:.9; filter:brightness(1.08); }
      }
      @media (prefers-reduced-motion: reduce) { .submeta-assigned-card.is-pending { animation:none; } }
      .submeta-card-render-stripes { display:flex; width:100%; height:23%; min-height:4px; overflow:hidden; border-radius:2px; }
      .submeta-card-render-stripe { flex:1; }
      .submeta-card-render-kind { align-self:flex-start; padding:1px 2px; border-radius:2px; background:rgba(0,0,0,.58); }
      .submeta-card-render-tier { color:#dfecf1; }
      .submeta-card-render-count {
        position:absolute; right:0; top:0; z-index:2; display:grid; place-items:center; box-sizing:border-box;
        height:25%; min-width:25%; padding:0 .3em; color:#fff;
        font-size:clamp(6px,.58vw,11px); line-height:1; text-align:center; text-shadow:0 1px 2px rgba(0,0,0,.72);
        pointer-events:none;
      }
      .submeta-card-render-count::before {
        content:""; position:absolute; inset:0; z-index:-1; border-radius:0 28% 0 36%;
        background:var(--submeta-count-badge-color,#66737a); box-shadow:0 1px 3px rgba(0,0,0,.45);
        transform:scale(var(--submeta-count-badge-scale,1)); transform-origin:top right;
      }
      .submeta-card-render-count-text {
        display:block; transform:scale(var(--submeta-count-text-scale,1)); transform-origin:center;
      }
      .submeta-card-render { aspect-ratio:${SUBMETA_CARD_GEOMETRY.ratioW}/${SUBMETA_CARD_GEOMETRY.ratioH}; }
      .submeta-card-render.has-card-asset { overflow:visible; padding:0; border-color:transparent; background:transparent; box-shadow:none; }
      .submeta-card-render-asset { display:block; width:100%; height:100%; box-sizing:border-box; border-radius:8%; object-fit:contain; pointer-events:none; }
      .submeta-card-view.has-card-asset:hover, .submeta-assigned-card.has-card-asset:hover { border-color:rgba(235,245,248,.7); box-shadow:0 0 0 1px rgba(235,245,248,.28); }
      .submeta-card-render.has-card-asset.is-selected { border-color:rgba(255,220,114,.9); box-shadow:0 0 0 1px rgba(255,220,114,.48),0 0 7px rgba(255,195,57,.38); }
      .submeta-card-render.has-card-asset.is-pending { border-color:rgba(255,226,151,.82); box-shadow:0 0 0 1px rgba(255,226,151,.34),0 0 7px rgba(255,205,105,.3); }
      .submeta-card-render.has-card-asset:focus-visible { border-color:rgba(220,241,248,.92); outline:1px solid rgba(220,241,248,.82); outline-offset:2px; }
      #${FLOATING_EDITOR_ID} {
        position: fixed; z-index: 10000; width: 190px; box-sizing: border-box; padding: 10px;
        border: 0; border-radius: 4px; background: rgba(18, 20, 24, 0.96); color: #f2f2f2;
        box-shadow: 0 5px 18px rgba(0, 0, 0, 0.55); font: 12px/1.3 system-ui, sans-serif;
        pointer-events: auto;
      }
      #${FLOATING_EDITOR_ID}[hidden] { display: none; }
      .submeta-placeholder-floating-header { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 8px; }
      .submeta-placeholder-floating-title { flex: 1; min-width: 0; font-weight: 700; overflow-wrap: anywhere; }
      .submeta-placeholder-floating-close { border: 0; padding: 0 2px; background: transparent; color: #ddd; font: 18px/1 sans-serif; cursor: pointer; }
      .submeta-placeholder-floating-row { display: grid; grid-template-columns: 52px 1fr; align-items: center; gap: 7px; margin-top: 5px; }
      .submeta-placeholder-floating-row input, .submeta-placeholder-floating-row select {
        width: 100%; min-width: 0; box-sizing: border-box; border: 1px solid #555; border-radius: 2px;
        padding: 3px 5px; background: #292c31; color: #fff; font: inherit;
      }
      .submeta-placeholder-floating-actions { display: flex; justify-content: flex-end; gap: 6px; margin-top: 9px; }
      .submeta-placeholder-floating-actions button { border: 0; border-radius: 2px; padding: 5px 9px; background: #4a4f58; color: #fff; font: inherit; cursor: pointer; }
      .submeta-placeholder-floating-actions [data-submeta-floating-action="save"] { background: #536f52; }
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
    layer.hidden = true;
    layer.setAttribute("aria-label", "SUB-META placeholders");
    stage.appendChild(layer);
    layer.addEventListener("pointerdown", handlePointerDown);
    layer.addEventListener("keydown", handleKeyDown);
    return true;
  }

  function getPlaceholderNode(id) {
    if (!layer || !id) return null;
    return Array.from(layer.querySelectorAll("[data-submeta-placeholder-id]")).find((node) => node.dataset.submetaPlaceholderId === id) || null;
  }

  function syncDebugPanelSelection(id = selectedPlaceholderId) {
    const item = placeholders.find((candidate) => candidate.id === id);
    if (!item) return false;
    const select = document.getElementById("dbgSubMetaPlaceholderId");
    if (select) select.value = item.id;
    for (const field of EDITABLE_FIELDS) {
      const control = document.querySelector(`[data-submeta-placeholder-field="${field}"]`);
      if (!control) continue;
      if (control.type === "checkbox") control.checked = item[field] === true;
      else control.value = String(item[field]);
      control.disabled = false;
    }
    return true;
  }

  function positionFloatingEditor(anchorRect) {
    if (!floatingEditor || floatingEditor.hidden || !anchorRect) return;
    const gap = 8;
    const margin = 8;
    const editorRect = floatingEditor.getBoundingClientRect();
    let left = anchorRect.right + gap;
    let top = anchorRect.top;
    if (left + editorRect.width > root.innerWidth - margin) left = anchorRect.left - editorRect.width - gap;
    if (top + editorRect.height > root.innerHeight - margin) top = anchorRect.bottom - editorRect.height;
    floatingEditor.style.left = `${Math.max(margin, Math.min(left, root.innerWidth - editorRect.width - margin))}px`;
    floatingEditor.style.top = `${Math.max(margin, Math.min(top, root.innerHeight - editorRect.height - margin))}px`;
  }

  function closeFloatingEditor() {
    if (!floatingEditor) return;
    floatingEditor.hidden = true;
    floatingEditor.remove();
    floatingEditor = null;
  }

  function floatingNumberControl(field, value, min, max, step) {
    return `<label class="submeta-placeholder-floating-row"><span>${field}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${value}" data-submeta-floating-field="${field}"></label>`;
  }

  function syncFloatingEditorFromPlaceholder(id = selectedPlaceholderId) {
    if (!floatingEditor || floatingEditor.hidden) return false;
    const item = placeholders.find((candidate) => candidate.id === id);
    if (!item) { closeFloatingEditor(); return false; }
    const title = floatingEditor.querySelector(".submeta-placeholder-floating-title");
    if (title) title.textContent = item.label ? `${item.label} · ${item.id}` : item.id;
    for (const control of floatingEditor.querySelectorAll("[data-submeta-floating-field]")) {
      control.value = String(item[control.dataset.submetaFloatingField]);
    }
    return true;
  }

  function applyFloatingEditorValues() {
    if (!floatingEditor || !selectedPlaceholderId) return false;
    for (const control of floatingEditor.querySelectorAll("[data-submeta-floating-field]")) {
      updateSelectedField(control.dataset.submetaFloatingField, control.value, { syncFloating: false });
    }
    syncFloatingEditorFromPlaceholder();
    syncDebugPanelSelection();
    return true;
  }

  function openFloatingEditor(id, anchorRect) {
    if (!isDebugMode() || !enabled || !actuallyVisible || !selectPlaceholder(id)) return false;
    root.HC?.SubMetaPanels?.closeFloatingPanelEditor?.();
    closeFloatingEditor();
    const item = placeholders.find((candidate) => candidate.id === id);
    if (!item) return false;
    floatingEditor = document.createElement("div");
    floatingEditor.id = FLOATING_EDITOR_ID;
    floatingEditor.setAttribute("role", "dialog");
    floatingEditor.setAttribute("aria-label", `Edytor placeholdera ${item.id}`);
    const stateOptions = STATES.map((state) => `<option value="${state}"${item.state === state ? " selected" : ""}>${state}</option>`).join("");
    floatingEditor.innerHTML = `
      <div class="submeta-placeholder-floating-header">
        <div class="submeta-placeholder-floating-title"></div>
        <button class="submeta-placeholder-floating-close" type="button" data-submeta-floating-action="close" aria-label="Zamknij">×</button>
      </div>
      ${floatingNumberControl("x", item.x, 0, 1, 0.001)}
      ${floatingNumberControl("y", item.y, 0, 1, 0.001)}
      ${floatingNumberControl("w", item.w, 0.005, 0.5, 0.001)}
      ${floatingNumberControl("h", item.h, 0.005, 0.5, 0.001)}
      ${floatingNumberControl("zIndex", item.zIndex, -100, 1000, 1)}
      <label class="submeta-placeholder-floating-row"><span>state</span><select data-submeta-floating-field="state">${stateOptions}</select></label>
      <div class="submeta-placeholder-floating-actions">
        <button type="button" data-submeta-floating-action="close">Zamknij</button>
        <button type="button" data-submeta-floating-action="save">Zapisz</button>
      </div>`;
    document.body.appendChild(floatingEditor);
    floatingEditor.addEventListener("input", (event) => {
      const field = event.target?.dataset?.submetaFloatingField;
      if (!field) return;
      updateSelectedField(field, event.target.value, { syncFloating: false });
      syncDebugPanelSelection();
      const node = getPlaceholderNode(selectedPlaceholderId);
      if (node) positionFloatingEditor(node.getBoundingClientRect());
    });
    floatingEditor.addEventListener("change", (event) => {
      const field = event.target?.dataset?.submetaFloatingField;
      if (!field) return;
      updateSelectedField(field, event.target.value, { syncFloating: false });
      syncFloatingEditorFromPlaceholder();
      syncDebugPanelSelection();
    });
    floatingEditor.addEventListener("click", (event) => {
      const action = event.target?.dataset?.submetaFloatingAction;
      if (action === "close") closeFloatingEditor();
      if (action === "save") {
        applyFloatingEditorValues();
        closeFloatingEditor();
      }
    });
    syncFloatingEditorFromPlaceholder(id);
    syncDebugPanelSelection(id);
    positionFloatingEditor(anchorRect || getPlaceholderNode(id)?.getBoundingClientRect());
    floatingEditor.querySelector('[data-submeta-floating-field="x"]')?.focus();
    return true;
  }

  function selectPlaceholder(id, options = {}) {
    const item = placeholders.find((candidate) => candidate.id === id);
    if (!item || (!options.allowOccupied && !shouldRenderPlaceholder(item))) return false;
    selectedPlaceholderId = id;
    syncSelection();
    if (options.notifyPanels !== false) {
      root.HC?.SubMetaPanels?.selectPlaceholder?.({
        id: item.id,
        group: item.group,
        subgroup: item.subgroup,
        kind: item.kind,
        state: isOccupied(item) ? "occupied" : item.state,
        label: item.label
      });
    }
    if (isDebugMode()) console.debug("[HC.SubMetaPlaceholders] selected", id);
    return true;
  }

  function handlePointerDown(event) {
    const assignedTarget = event.target.closest?.("[data-submeta-assigned-placeholder-id]");
    if (assignedTarget) {
      event.preventDefault();
      event.stopPropagation();
      const placeholderId = assignedTarget.dataset.submetaAssignedPlaceholderId;
      root.HC?.SubMetaPanels?.selectAssignedCard?.(placeholderId, getAssignedCards()[placeholderId]);
      return;
    }
    const target = event.target.closest?.("[data-submeta-placeholder-id]");
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    const id = target.dataset.submetaPlaceholderId;
    if (isDebugMode()) openFloatingEditor(id, target.getBoundingClientRect());
    else selectPlaceholder(id);
  }

  function handleKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const assignedTarget = event.target.closest?.("[data-submeta-assigned-placeholder-id]");
    if (assignedTarget) {
      event.preventDefault();
      event.stopPropagation();
      const placeholderId = assignedTarget.dataset.submetaAssignedPlaceholderId;
      root.HC?.SubMetaPanels?.selectAssignedCard?.(placeholderId, getAssignedCards()[placeholderId]);
      return;
    }
    const target = event.target.closest?.("[data-submeta-placeholder-id]");
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    const id = target.dataset.submetaPlaceholderId;
    if (isDebugMode()) openFloatingEditor(id, target.getBoundingClientRect());
    else selectPlaceholder(id);
  }

  function syncSelection() {
    for (const item of placeholders) item.selected = item.id === selectedPlaceholderId;
    if (!layer) return;
    for (const node of layer.querySelectorAll("[data-submeta-placeholder-id]")) {
      const selected = node.dataset.submetaPlaceholderId === selectedPlaceholderId;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    }
    for (const node of layer.querySelectorAll("[data-submeta-assigned-placeholder-id]")) {
      const selected = node.dataset.submetaAssignedPlaceholderId === selectedPlaceholderId;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    }
  }

  function assignedCardColorCss(color) {
    return ({ red: "#b8453d", yellow: "#c9a83b", green: "#4d9b62", blue: "#477eb7" })[String(color || "").toLowerCase()] || "#66737a";
  }

  function inventoryCountBadgeColorCss(color) {
    return ({ red: "#ff0f0fff", yellow: "#e9d51bff", green: "#279a15ff", blue: "#2b2bfaff" })[String(color || "").toLowerCase()] || "#66737a";
  }

  function resolveCardSvgAsset(card) {
    return root.HC.CardAssets?.resolveCardSvgAsset?.(card) || null;
  }

  function resolveCardPngAsset(card) {
    return root.HC.CardAssets?.resolveCardPngAsset?.(card) || null;
  }

  function resolveCardAsset(card, options = {}) {
    return root.HC.CardAssets?.resolveCardAsset?.(card, options) || null;
  }

  function getCardCountSignature(card, options) {
    return options.showCount === true
      ? `${card?.count || 1}:${options.countTextScale ?? 1}:${options.countBadgeScale ?? 1}`
      : "0";
  }

  function getProceduralCardSignature(card, options) {
    const colors = Array.isArray(card?.colors) ? card.colors : [card?.color, card?.colorA, card?.colorB].filter(Boolean);
    return `procedural:${card?.kind || "CARD"}:${card?.tier || "DR"}:${colors.join(",")}:${getCardCountSignature(card, options)}`;
  }

  function renderProceduralCard(node, card, options = {}) {
    node.dataset.cardRenderSignature = getProceduralCardSignature(card, options);
    node.classList.remove("has-card-asset");
    node.classList.add("is-procedural-card");
    node.replaceChildren();
    const colors = Array.isArray(card?.colors) && card.colors.length
      ? card.colors
      : [card?.color, card?.colorA, card?.colorB].filter(Boolean);
    const stripes = document.createElement("span");
    stripes.className = "submeta-card-render-stripes";
    for (const color of colors.length ? colors : [null]) {
      const stripe = document.createElement("span");
      stripe.className = "submeta-card-render-stripe";
      stripe.style.background = assignedCardColorCss(color);
      stripes.appendChild(stripe);
    }
    const kind = document.createElement("span");
    kind.className = "submeta-card-render-kind";
    kind.textContent = card?.kind || "CARD";
    const tier = document.createElement("span");
    tier.className = "submeta-card-render-tier";
    tier.textContent = card?.tier || "DR";
    node.append(stripes, kind, tier);
    appendCardCount(node, card, options);
  }

  function appendCardCount(node, card, options) {
    const countValue = Math.max(1, Math.floor(Number(card?.count) || 1));
    if (options.showCount !== true || countValue <= 1) return;
    const primaryColor = Array.isArray(card?.colors) && card.colors.length
      ? card.colors[0]
      : (card?.color || card?.colorA);
    const count = document.createElement("span");
    count.className = "submeta-card-render-count";
    count.style.setProperty("--submeta-count-badge-color", inventoryCountBadgeColorCss(primaryColor));
    count.style.setProperty("--submeta-count-text-scale", String(options.countTextScale ?? 1));
    count.style.setProperty("--submeta-count-badge-scale", String(options.countBadgeScale ?? 1));
    count.style.color = String(primaryColor || "").toLowerCase() === "yellow" ? "#17120a" : "#fff";
    const text = document.createElement("span");
    text.className = "submeta-card-render-count-text";
    text.textContent = String(countValue);
    count.appendChild(text);
    node.appendChild(count);
  }

  function renderSubMetaCard(node, card, options = {}) {
    if (!node || !card) return { asset: null, mode: "empty" };
    const context = options.context || "slot";
    node.classList.add("submeta-card-render", `submeta-card-render--${context}`);
    for (const className of Array.from(node.classList)) {
      if (className.startsWith("tier-")) node.classList.remove(className);
      if (className.startsWith("submeta-card-render--") && className !== `submeta-card-render--${context}`) node.classList.remove(className);
    }
    node.classList.toggle("is-selected", options.selected === true);
    node.classList.toggle("is-pending", options.pending === true);
    const asset = resolveCardAsset(card, { context });
    const signature = asset
      ? `asset:${asset.url}:${getCardCountSignature(card, options)}`
      : getProceduralCardSignature(card, options);
    if (node.dataset.cardRenderSignature === signature && node.childElementCount > 0) {
      return { asset, mode: asset ? "asset" : "procedural" };
    }
    if (!asset) {
      renderProceduralCard(node, card, options);
      return { asset: null, mode: "procedural" };
    }
    node.dataset.cardRenderSignature = signature;
    node.classList.add("has-card-asset");
    node.classList.remove("is-procedural-card");
    node.replaceChildren();
    const cachedEntry = context === "detail"
      ? root.HC.CardAssets?.getCachedImage?.(asset, card)
      : null;
    const image = cachedEntry?.image || document.createElement("img");
    image.className = "submeta-card-render-asset";
    image.alt = "";
    image.draggable = false;
    image.addEventListener("error", () => {
      root.HC.CardAssets?.markAssetFailed?.(asset, card);
      delete node.dataset.cardRenderSignature;
      renderSubMetaCard(node, card, options);
    }, { once: true });
    if (!cachedEntry) image.src = asset.url;
    node.appendChild(image);
    appendCardCount(node, card, options);
    return { asset, mode: "asset" };
  }

  function getAssignedCardBox(item) {
    // Placeholder coordinates are center anchors only. Slot cards use one global
    // normalized size and may extend beyond the placeholder rectangle.
    const stageRect = getStage()?.getBoundingClientRect();
    const stageAspect = stageRect?.width && stageRect?.height ? stageRect.width / stageRect.height : 1.5;
    const cardSize = SUBMETA_CARD_GEOMETRY.fitNormalized(1, SLOT_CARD_BASE_HEIGHT, stageAspect, slotCardScale);
    return {
      x: item.x,
      y: item.y,
      w: cardSize.w,
      h: cardSize.h,
      zIndex: item.zIndex + 10
    };
  }

  function renderAssignedCardContent(node, assignment, pending = false) {
    return renderSubMetaCard(node, assignment, {
      context: pending ? "pending" : "slot",
      selected: !pending && selectedPlaceholderId === node.dataset.submetaAssignedPlaceholderId,
      pending
    });
  }

  function syncAssignedCardNode(item, assignment, pending = false) {
    const dataAttribute = pending ? "submetaPendingPlaceholderId" : "submetaAssignedPlaceholderId";
    const selector = pending ? "[data-submeta-pending-placeholder-id]" : "[data-submeta-assigned-placeholder-id]";
    let node = Array.from(layer.querySelectorAll(selector)).find((candidate) => candidate.dataset[dataAttribute] === item.id);
    if (!node) {
      node = document.createElement("button");
      node.type = "button";
      node.className = "submeta-assigned-card";
      node.dataset[dataAttribute] = item.id;
      layer.appendChild(node);
    }
    node.classList.toggle("is-selected", !pending && selectedPlaceholderId === item.id);
    node.classList.toggle("is-pending", pending);
    node.tabIndex = pending ? -1 : 0;
    node.setAttribute("aria-disabled", pending ? "true" : "false");
    node.title = `${assignment.kind} ${assignment.tier} · ${item.label}${pending ? " · oczekuje na potwierdzenie" : ""}`;
    node.setAttribute("aria-label", node.title);
    const box = getAssignedCardBox(item);
    node.style.left = `${box.x * 100}%`;
    node.style.top = `${box.y * 100}%`;
    node.style.width = `${box.w * 100}%`;
    node.style.height = `${box.h * 100}%`;
    node.style.zIndex = String(box.zIndex);
    renderAssignedCardContent(node, assignment, pending);
  }

  function syncDom() {
    if (!createLayer()) return false;
    const assignments = getAssignedCards();
    const pending = getPendingAssignment();
    const renderedIds = new Set();
    const renderedAssignedIds = new Set();
    const renderedPendingIds = new Set();
    for (const item of placeholders) {
      const assignment = assignments[item.id];
      const pendingCard = !assignment && pending?.valid === true && pending.placeholderId === item.id ? pending.cardRef : null;
      if (assignment) {
        renderedAssignedIds.add(item.id);
        syncAssignedCardNode(item, assignment);
      } else if (pendingCard) {
        renderedPendingIds.add(item.id);
        syncAssignedCardNode(item, pendingCard, true);
      }
      if (!shouldRenderPlaceholder(item, assignments)) continue;
      renderedIds.add(item.id);
      let node = layer.querySelector(`[data-submeta-placeholder-id="${item.id}"]`);
      if (!node) {
        node = document.createElement("div");
        node.dataset.submetaPlaceholderId = item.id;
        node.setAttribute("role", "button");
        node.setAttribute("tabindex", "0");
        layer.appendChild(node);
      }
      node.className = `submeta-placeholder submeta-placeholder--${item.kind} submeta-placeholder--${item.state.replaceAll("_", "-")}`;
      node.classList.toggle("is-pending", pendingCard !== null);
      node.title = `${item.label} (${item.id})`;
      node.setAttribute("aria-label", item.label);
      node.innerHTML = showLabels ? `<span class="submeta-placeholder-label">${escapeHtml(item.id)}</span>` : "";
      node.style.left = `${item.x * 100}%`;
      node.style.top = `${item.y * 100}%`;
      node.style.width = `${item.w * 100}%`;
      node.style.height = `${item.h * 100}%`;
      node.style.zIndex = String(item.zIndex);
    }
    for (const node of layer.querySelectorAll("[data-submeta-placeholder-id]")) {
      if (!renderedIds.has(node.dataset.submetaPlaceholderId)) node.remove();
    }
    for (const node of layer.querySelectorAll("[data-submeta-assigned-placeholder-id]")) {
      if (!renderedAssignedIds.has(node.dataset.submetaAssignedPlaceholderId)) node.remove();
    }
    for (const node of layer.querySelectorAll("[data-submeta-pending-placeholder-id]")) {
      if (!renderedPendingIds.has(node.dataset.submetaPendingPlaceholderId)) node.remove();
    }
    syncSelection();
    return true;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function overlayIsVisible() {
    const pngLayout = root.HC?.SubMetaPngLayout;
    const overlay = document.getElementById("subMetaPngOverlay");
    return pngLayout?.shouldShow?.() === true && !!overlay && overlay.hidden !== true;
  }

  function update() {
    if (!initialized) init();
    if (!layer || layer.parentElement !== getStage()) syncDom();
    if (!layer) return;
    syncDom();
    const nextVisible = enabled && overlayIsVisible();
    if (!nextVisible || !isDebugMode()) closeFloatingEditor();
    actuallyVisible = nextVisible;
    layer.hidden = !actuallyVisible;
    layer.setAttribute("aria-hidden", actuallyVisible ? "false" : "true");
  }

  function init() {
    if (initialized) return initializationPromise;
    initialized = true;
    createStyle();
    if (createLayer()) syncDom();
    initializationPromise = restoreRuntimeSettingOrFallback("startup").finally(update);
    return initializationPromise;
  }

  function setVisible(nextEnabled) {
    enabled = nextEnabled === true;
    if (!enabled) closeFloatingEditor();
    update();
  }

  function setShowLabels(nextValue) {
    showLabels = nextValue === true;
    syncDom();
  }

  function setShowHidden(nextValue) {
    showHidden = nextValue === true;
    syncDom();
  }

  function setSlotCardScale(nextValue, options = {}) {
    slotCardScale = clampNumber(nextValue, 0.25, 3, DEFAULT_SLOT_CARD_SCALE);
    syncDom();
    return slotCardScale;
  }

  function clearSelection() {
    closeFloatingEditor();
    selectedPlaceholderId = null;
    syncSelection();
    root.HC?.SubMetaPanels?.clearPlaceholderSelection?.();
  }

  function hitTest(clientX, clientY) {
    if (!actuallyVisible || !stage) return null;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    const hits = placeholders
      .filter(shouldRenderPlaceholder)
      .filter((item) => Math.abs(x - item.x) <= item.w / 2 && Math.abs(y - item.y) <= item.h / 2)
      .sort((a, b) => b.zIndex - a.zIndex);
    return hits[0]?.id || null;
  }

  function getExportPayload() {
    return {
      version: VERSION,
      settings: {
        showSubMetaPlaceholders: enabled,
        showPlaceholderLabels: showLabels,
        showHiddenPlaceholders: showHidden,
        slotCardScale
      },
      placeholders: placeholders.map(({ selected: _selected, ...item }) => ({ ...item }))
    };
  }

  function applyPayload(payload) {
    if (!payload || !Array.isArray(payload.placeholders)) return false;
    const candidatesById = new Map(payload.placeholders.map((item) => [item?.id, item]));
    placeholders = DEFAULT_PLACEHOLDERS.map((fallback) => normalizePlaceholder(candidatesById.get(fallback.id), fallback));
    if (payload.settings && typeof payload.settings === "object") {
      enabled = payload.settings.showSubMetaPlaceholders !== false;
      showLabels = payload.settings.showPlaceholderLabels === true;
      showHidden = payload.settings.showHiddenPlaceholders === true;
      slotCardScale = clampNumber(payload.settings.slotCardScale, 0.25, 3, DEFAULT_SLOT_CARD_SCALE);
    }
    if (!placeholders.some((item) => item.id === selectedPlaceholderId && shouldRenderPlaceholder(item))) clearSelection();
    syncDom();
    update();
    return true;
  }

  async function restoreRuntimeSettingOrFallback(reason = "reset") {
    const settings = root.HC?.SubMetaSettings;
    const logicalPath = settings?.paths?.[SETTING_KEY];
    if (!settings || typeof settings.loadJson !== "function") {
      console.warn("[HC.SubMetaPlaceholders] runtime settings loader unavailable; using fallback", {
        logicalPath: logicalPath || null,
        resolvedUrl: null,
        status: null,
        success: false,
        fallbackUsed: true
      });
      return false;
    }
    if (!logicalPath) {
      console.warn("[HC.SubMetaPlaceholders] runtime settings path unavailable; using fallback", {
        logicalPath: null,
        resolvedUrl: null,
        status: null,
        success: false,
        fallbackUsed: true
      });
      return false;
    }

    const result = await settings.loadJson(logicalPath, {
      validate: (payload) => !!payload && Array.isArray(payload.placeholders),
      invalidMessage: "Runtime setting JSON does not contain a placeholders array"
    });
    lastSettingsUrl = result.resolvedUrl || null;
    if (result.ok && applyPayload(result.payload)) {
      dataSource = "settings JSON";
      lastAction = reason === "startup" ? "loaded" : "reset";
      lastError = "";
      updateSettingsStatus("placeholders", lastAction);
      return true;
    }
    console.warn("[HC.SubMetaPlaceholders] runtime setting fallback used", {
      logicalPath: result.logicalPath,
      resolvedUrl: result.resolvedUrl,
      status: result.status,
      failureKind: result.failureKind,
      fallbackUsed: true
    });
    placeholders = cloneDefaults();
    enabled = true;
    showLabels = false;
    showHidden = false;
    slotCardScale = DEFAULT_SLOT_CARD_SCALE;
    dataSource = "fallback";
    lastAction = "error";
    lastError = String(result.error?.message || result.failureKind || "settings load failed");
    updateSettingsStatus("placeholders", `error: ${lastError}`);
    syncDom();
    update();
    return false;
  }

  function resetAll() {
    clearSelection();
    return restoreRuntimeSettingOrFallback("reset");
  }

  function importJson(json) {
    try {
      const payload = typeof json === "string" ? JSON.parse(json) : json;
      if (!applyPayload(payload)) throw new Error("JSON does not contain a valid placeholders array");
      dataSource = "imported runtime";
      lastAction = "imported";
      lastError = "";
      updateSettingsStatus("placeholders", lastAction);
      return true;
    } catch (error) {
      lastAction = "error";
      lastError = String(error?.message || error);
      updateSettingsStatus("placeholders", `error: ${lastError}`);
      console.warn("[HC.SubMetaPlaceholders] JSON import failed", error);
      return false;
    }
  }

  function exportJson() {
    const json = JSON.stringify(getExportPayload(), null, 2);
    console.info("[HC.SubMetaPlaceholders] preset JSON\n" + json);
    lastAction = "exported";
    lastError = "";
    updateSettingsStatus("placeholders", lastAction);
    return json;
  }

  function updateSettingsStatus(section, text) {
    const node = document.querySelector(`[data-submeta-settings-status="${section}"]`);
    if (node) node.textContent = text;
  }

  function updateSelectedField(field, rawValue, options = {}) {
    if (!EDITABLE_FIELDS.includes(field)) return false;
    const item = placeholders.find((candidate) => candidate.id === selectedPlaceholderId);
    const fallback = defaultsById.get(selectedPlaceholderId);
    if (!item || !fallback) return false;
    if (["visibleInGame", "visibleInDebug"].includes(field)) item[field] = rawValue === true;
    else if (field === "state") item.state = STATES.includes(rawValue) ? rawValue : item.state;
    else if (field === "zIndex") item.zIndex = Math.round(clampNumber(rawValue, -100, 1000, fallback.zIndex));
    else item[field] = clampNumber(rawValue, field === "w" || field === "h" ? 0.005 : 0, field === "w" || field === "h" ? 0.5 : 1, fallback[field]);
    if (!shouldRenderPlaceholder(item)) clearSelection();
    syncDom();
    syncDebugPanelSelection();
    if (options.syncFloating !== false) syncFloatingEditorFromPlaceholder();
    return true;
  }

  function renderNumberControl(field, value, min, max, step, disabled = false) {
    return `<label class="submeta-png-debug-row"><span>${field}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${value}" data-submeta-placeholder-field="${field}"${disabled ? " disabled" : ""}></label>`;
  }

  function renderDebugHtml(options = {}) {
    const selectedItem = placeholders.find((item) => item.id === selectedPlaceholderId) || null;
    const selected = selectedItem || placeholders[0];
    const controlsDisabled = !selectedItem;
    const groupOptions = GROUPS.map((group) => {
      const optionsHtml = placeholders.filter((item) => item.group === group).map((item) =>
        `<option value="${escapeHtml(item.id)}"${item.id === selectedPlaceholderId ? " selected" : ""}>${escapeHtml(item.id)}</option>`).join("");
      return `<optgroup label="${escapeHtml(group)}">${optionsHtml}</optgroup>`;
    }).join("");
    const stateOptions = STATES.map((state) => `<option value="${state}"${selected.state === state ? " selected" : ""}>${state}</option>`).join("");
    const groupCounts = GROUPS.map((group) => `${group}: ${placeholders.filter((item) => item.group === group).length}`).join(" · ");
    return `
      <details class="submeta-png-debug" data-runtime-debug-section="submeta-placeholders"${options.open === true ? " open" : ""}>
        <summary>SUB-META Placeholders</summary>
        <div class="submeta-png-debug-row"><span>showSubMetaPlaceholders</span><input id="dbgSubMetaPlaceholdersVisible" type="checkbox" data-submeta-placeholder-setting="enabled"${enabled ? " checked" : ""}></div>
        <div class="submeta-png-debug-row"><span>showPlaceholderLabels</span><input id="dbgSubMetaPlaceholderLabels" type="checkbox" data-submeta-placeholder-setting="labels"${showLabels ? " checked" : ""}></div>
        <div class="submeta-png-debug-row"><span>showHiddenPlaceholders</span><input id="dbgSubMetaPlaceholderHidden" type="checkbox" data-submeta-placeholder-setting="hidden"${showHidden ? " checked" : ""}></div>
        <label class="submeta-png-debug-row"><span>slotCardScale</span><input id="dbgSubMetaSlotCardScale" type="number" min="0.25" max="3" step="0.05" value="${slotCardScale}" data-submeta-placeholder-setting="slot-card-scale"></label>
        <label class="submeta-png-debug-row"><span>placeholder</span><select id="dbgSubMetaPlaceholderId" data-submeta-placeholder-action="select"><option value=""${selectedItem ? "" : " selected"}>— select —</option>${groupOptions}</select></label>
        <div class="submeta-png-diagnostics"><code>${escapeHtml(groupCounts)}</code></div>
        ${renderNumberControl("x", selected.x, 0, 1, 0.001, controlsDisabled)}
        ${renderNumberControl("y", selected.y, 0, 1, 0.001, controlsDisabled)}
        ${renderNumberControl("w", selected.w, 0.005, 0.5, 0.001, controlsDisabled)}
        ${renderNumberControl("h", selected.h, 0.005, 0.5, 0.001, controlsDisabled)}
        ${renderNumberControl("zIndex", selected.zIndex, -100, 1000, 1, controlsDisabled)}
        <label class="submeta-png-debug-row"><span>state</span><select data-submeta-placeholder-field="state"${controlsDisabled ? " disabled" : ""}>${stateOptions}</select></label>
        <label class="submeta-png-debug-row"><span>visibleInGame</span><input type="checkbox" data-submeta-placeholder-field="visibleInGame"${selected.visibleInGame ? " checked" : ""}${controlsDisabled ? " disabled" : ""}></label>
        <label class="submeta-png-debug-row"><span>visibleInDebug</span><input type="checkbox" data-submeta-placeholder-field="visibleInDebug"${selected.visibleInDebug ? " checked" : ""}${controlsDisabled ? " disabled" : ""}></label>
        <div class="submeta-png-debug-actions">
          <button class="overlay-btn" type="button" data-submeta-placeholder-action="clear-selection">Clear selection</button>
          <button class="overlay-btn" type="button" data-submeta-placeholder-action="reset">Reset defaults</button>
          <button class="overlay-btn" type="button" data-submeta-placeholder-action="export">Export JSON</button>
          <button class="overlay-btn" type="button" data-submeta-placeholder-action="import">Import JSON</button>
        </div>
        <textarea id="dbgSubMetaPlaceholderJson" class="overlay-note submeta-placeholder-json" spellcheck="false" placeholder="Exported JSON appears here; paste JSON here before Import."></textarea>
        <div class="submeta-png-diagnostics">
          <div class="overlay-row"><span class="k">source</span><code class="v">${dataSource}</code></div>
          <div class="overlay-row"><span class="k">configured</span><span class="v">${placeholders.length}</span></div>
          <div class="overlay-row"><span class="k">last action</span><code class="v" data-submeta-settings-status="placeholders">${lastAction}</code></div>
          <div class="overlay-row"><span class="k">settings URL</span><code class="v">${escapeHtml(lastSettingsUrl || root.HC?.SubMetaSettings?.paths?.[SETTING_KEY] || "unavailable")}</code></div>
          ${lastError ? `<div class="overlay-row"><span class="k">error</span><code class="v">${escapeHtml(lastError)}</code></div>` : ""}
        </div>
      </details>`;
  }

  function handleDebugControl(target) {
    if (!target) return false;
    const setting = target.dataset?.submetaPlaceholderSetting;
    if (setting === "enabled") { setVisible(target.checked); return true; }
    if (setting === "labels") { setShowLabels(target.checked); return true; }
    if (setting === "hidden") { setShowHidden(target.checked); return true; }
    if (setting === "slot-card-scale") { setSlotCardScale(target.value); return true; }
    const field = target.dataset?.submetaPlaceholderField;
    if (field) return updateSelectedField(field, ["visibleInGame", "visibleInDebug"].includes(field) ? target.checked : target.value);
    const action = target.dataset?.submetaPlaceholderAction;
    if (!action) return false;
    if (action === "select") return selectPlaceholder(target.value);
    if (action === "clear-selection") { clearSelection(); return true; }
    if (action === "reset") return resetAll();
    const textarea = document.getElementById("dbgSubMetaPlaceholderJson");
    if (action === "export") { if (textarea) textarea.value = exportJson(); return true; }
    if (action === "import") return importJson(textarea?.value || "");
    return false;
  }

  function getDebugState() {
    return {
      version: VERSION, initialized, enabled, visible: actuallyVisible, overlayVisible: overlayIsVisible(),
      showLabels, showHidden, slotCardScale, slotCardRatio: { ...SLOT_CARD_RATIO }, selectedPlaceholderId, configuredCount: placeholders.length,
      assignedCards: getAssignedCards(), pendingAssignment: getPendingAssignment(),
      confirmButtonState: root.HC?.SubMetaPanels?.getConfirmButtonState?.() || "inactive",
      renderedCount: layer?.querySelectorAll("[data-submeta-placeholder-id]").length || 0,
      renderedAssignedCardCount: layer?.querySelectorAll("[data-submeta-assigned-placeholder-id]").length || 0,
      renderedPendingCardCount: layer?.querySelectorAll("[data-submeta-pending-placeholder-id]").length || 0,
      groups: Object.fromEntries(GROUPS.map((group) => [group, placeholders.filter((item) => item.group === group).length])),
      stageMounted: !!(stage && stage.isConnected), layerMounted: !!(layer && layer.isConnected), debugMode: isDebugMode()
    };
  }

  root.HC.SubMetaPlaceholders = {
    VERSION, SETTING_KEY, STATES, GROUPS, SLOT_CARD_RATIO, SLOT_CARD_BASE_UNIT, SLOT_CARD_BASE_HEIGHT, DEFAULT_SLOT_CARD_SCALE, init, update, render: syncDom, syncDom,
    setVisible, isVisible: () => actuallyVisible, setShowLabels, setShowHidden, setSlotCardScale, getSlotCardScale: () => slotCardScale,
    resolveCardAsset, resolveCardSvgAsset, resolveCardPngAsset, renderSubMetaCard,
    selectPlaceholder, getSelectedPlaceholderId: () => selectedPlaceholderId, clearSelection, hitTest,
    openFloatingEditor, closeFloatingEditor, syncFloatingEditorFromPlaceholder, applyFloatingEditorValues, syncDebugPanelSelection,
    getDebugState, getPlaceholders: () => placeholders.map((item) => ({ ...item })), getExportPayload,
    loadRuntimeSetting: restoreRuntimeSettingOrFallback, resetAll, importJson, exportJson, updateSelectedField, renderDebugHtml, handleDebugControl
  };

  Object.defineProperties(root, {
    showSubMetaPlaceholders: { configurable: true, enumerable: true, get: () => enabled, set: setVisible },
    showPlaceholderLabels: { configurable: true, enumerable: true, get: () => showLabels, set: setShowLabels },
    showHiddenPlaceholders: { configurable: true, enumerable: true, get: () => showHidden, set: setShowHidden },
    clearPlaceholderSelection: { configurable: true, enumerable: true, value: clearSelection }
  });
})(window);
