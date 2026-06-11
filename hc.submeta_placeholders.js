// Haiku Cosmos DOM placeholder layer for the PNG/CSS SUB-META overlay.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const VERSION = "submeta-placeholders-v0.3";
  const STORAGE_KEY = "hc.submetaPlaceholders.preset.v1";
  const LAYER_ID = "subMetaPlaceholderLayer";
  const FLOATING_EDITOR_ID = "subMetaPlaceholderFloatingEditor";
  const STATES = Object.freeze(["free_active", "free_inactive", "hidden", "occupied"]);
  const GROUPS = Object.freeze(["PRG R1", "PRG R2", "R3", "R4", "Świat", "Świat R2"]);
  const EDITABLE_FIELDS = Object.freeze(["x", "y", "w", "h", "zIndex", "state", "visibleInGame", "visibleInDebug"]);

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
  let enabled = true;
  let showLabels = false;
  let showHidden = false;
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

  function shouldRenderPlaceholder(item) {
    if (item.state === "occupied") return false;
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
        savePreset();
        closeFloatingEditor();
      }
    });
    syncFloatingEditorFromPlaceholder(id);
    syncDebugPanelSelection(id);
    positionFloatingEditor(anchorRect || getPlaceholderNode(id)?.getBoundingClientRect());
    floatingEditor.querySelector('[data-submeta-floating-field="x"]')?.focus();
    return true;
  }

  function selectPlaceholder(id) {
    const item = placeholders.find((candidate) => candidate.id === id);
    if (!item || !shouldRenderPlaceholder(item)) return false;
    selectedPlaceholderId = id;
    syncSelection();
    root.HC?.SubMetaPanels?.selectPlaceholder?.({
      id: item.id,
      group: item.group,
      subgroup: item.subgroup,
      kind: item.kind,
      state: item.state,
      label: item.label
    });
    if (isDebugMode()) console.debug("[HC.SubMetaPlaceholders] selected", id);
    return true;
  }

  function handlePointerDown(event) {
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
  }

  function syncDom() {
    if (!createLayer()) return false;
    const renderedIds = new Set();
    for (const item of placeholders) {
      if (!shouldRenderPlaceholder(item)) continue;
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
    if (initialized) return;
    initialized = true;
    createStyle();
    loadPreset();
    if (createLayer()) syncDom();
    update();
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
      settings: { showSubMetaPlaceholders: enabled, showPlaceholderLabels: showLabels, showHiddenPlaceholders: showHidden },
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
    }
    if (!placeholders.some((item) => item.id === selectedPlaceholderId && shouldRenderPlaceholder(item))) clearSelection();
    syncDom();
    update();
    return true;
  }

  function savePreset() {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(getExportPayload()));
      return true;
    } catch (error) {
      console.warn("[HC.SubMetaPlaceholders] preset save failed", error);
      return false;
    }
  }

  function loadPreset() {
    try {
      const raw = root.localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      return applyPayload(JSON.parse(raw));
    } catch (error) {
      console.warn("[HC.SubMetaPlaceholders] preset load failed", error);
      return false;
    }
  }

  function resetAll() {
    placeholders = cloneDefaults();
    enabled = true;
    showLabels = false;
    showHidden = false;
    clearSelection();
    try { root.localStorage.removeItem(STORAGE_KEY); } catch (_error) { /* storage is optional */ }
    syncDom();
    update();
    return true;
  }

  function importJson(json) {
    try {
      const payload = typeof json === "string" ? JSON.parse(json) : json;
      const applied = applyPayload(payload);
      if (applied) savePreset();
      return applied;
    } catch (error) {
      console.warn("[HC.SubMetaPlaceholders] JSON import failed", error);
      return false;
    }
  }

  function exportJson() {
    const json = JSON.stringify(getExportPayload(), null, 2);
    console.info("[HC.SubMetaPlaceholders] preset JSON\n" + json);
    return json;
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
      <details class="submeta-png-debug" data-runtime-debug-section="submeta-placeholders"${options.open === false ? "" : " open"}>
        <summary>SUB-META Placeholders</summary>
        <div class="submeta-png-debug-row"><span>showSubMetaPlaceholders</span><input id="dbgSubMetaPlaceholdersVisible" type="checkbox" data-submeta-placeholder-setting="enabled"${enabled ? " checked" : ""}></div>
        <div class="submeta-png-debug-row"><span>showPlaceholderLabels</span><input id="dbgSubMetaPlaceholderLabels" type="checkbox" data-submeta-placeholder-setting="labels"${showLabels ? " checked" : ""}></div>
        <div class="submeta-png-debug-row"><span>showHiddenPlaceholders</span><input id="dbgSubMetaPlaceholderHidden" type="checkbox" data-submeta-placeholder-setting="hidden"${showHidden ? " checked" : ""}></div>
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
          <button class="overlay-btn" type="button" data-submeta-placeholder-action="save">Save preset</button>
          <button class="overlay-btn" type="button" data-submeta-placeholder-action="reset">Reset defaults</button>
          <button class="overlay-btn" type="button" data-submeta-placeholder-action="export">Export JSON</button>
          <button class="overlay-btn" type="button" data-submeta-placeholder-action="import">Import JSON</button>
        </div>
        <textarea id="dbgSubMetaPlaceholderJson" class="overlay-note submeta-placeholder-json" spellcheck="false" placeholder="Exported JSON appears here; paste JSON here before Import."></textarea>
        <div class="submeta-png-diagnostics">
          <div class="overlay-row"><span class="k">configured</span><span class="v">${placeholders.length}</span></div>
          <div class="overlay-row"><span class="k">rendered</span><span class="v">${layer?.querySelectorAll("[data-submeta-placeholder-id]").length || 0}</span></div>
          <div class="overlay-row"><span class="k">selected</span><code class="v">${escapeHtml(selectedPlaceholderId || "none")}</code></div>
          <div class="overlay-row"><span class="k">storage</span><code class="v">${STORAGE_KEY}</code></div>
        </div>
      </details>`;
  }

  function handleDebugControl(target) {
    if (!target) return false;
    const setting = target.dataset?.submetaPlaceholderSetting;
    if (setting === "enabled") { setVisible(target.checked); return true; }
    if (setting === "labels") { setShowLabels(target.checked); return true; }
    if (setting === "hidden") { setShowHidden(target.checked); return true; }
    const field = target.dataset?.submetaPlaceholderField;
    if (field) return updateSelectedField(field, ["visibleInGame", "visibleInDebug"].includes(field) ? target.checked : target.value);
    const action = target.dataset?.submetaPlaceholderAction;
    if (!action) return false;
    if (action === "select") return selectPlaceholder(target.value);
    if (action === "clear-selection") { clearSelection(); return true; }
    if (action === "save") return savePreset();
    if (action === "reset") return resetAll();
    const textarea = document.getElementById("dbgSubMetaPlaceholderJson");
    if (action === "export") { if (textarea) textarea.value = exportJson(); return true; }
    if (action === "import") return importJson(textarea?.value || "");
    return false;
  }

  function getDebugState() {
    return {
      version: VERSION, initialized, enabled, visible: actuallyVisible, overlayVisible: overlayIsVisible(),
      showLabels, showHidden, selectedPlaceholderId, configuredCount: placeholders.length,
      renderedCount: layer?.querySelectorAll("[data-submeta-placeholder-id]").length || 0,
      groups: Object.fromEntries(GROUPS.map((group) => [group, placeholders.filter((item) => item.group === group).length])),
      stageMounted: !!(stage && stage.isConnected), layerMounted: !!(layer && layer.isConnected), debugMode: isDebugMode()
    };
  }

  root.HC.SubMetaPlaceholders = {
    VERSION, STORAGE_KEY, STATES, GROUPS, init, update, render: syncDom, syncDom,
    setVisible, isVisible: () => actuallyVisible, setShowLabels, setShowHidden,
    selectPlaceholder, getSelectedPlaceholderId: () => selectedPlaceholderId, clearSelection, hitTest,
    openFloatingEditor, closeFloatingEditor, syncFloatingEditorFromPlaceholder, applyFloatingEditorValues, syncDebugPanelSelection,
    getDebugState, getPlaceholders: () => placeholders.map((item) => ({ ...item })), getExportPayload,
    savePreset, loadPreset, resetAll, importJson, exportJson, updateSelectedField, renderDebugHtml, handleDebugControl
  };

  Object.defineProperties(root, {
    showSubMetaPlaceholders: { configurable: true, enumerable: true, get: () => enabled, set: setVisible },
    showPlaceholderLabels: { configurable: true, enumerable: true, get: () => showLabels, set: setShowLabels },
    showHiddenPlaceholders: { configurable: true, enumerable: true, get: () => showHidden, set: setShowHidden },
    clearPlaceholderSelection: { configurable: true, enumerable: true, value: clearSelection }
  });
})(window);
