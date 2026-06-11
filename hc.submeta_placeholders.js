// Haiku Cosmos minimal DOM placeholder layer for the PNG/CSS SUB-META overlay.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const VERSION = "submeta-placeholders-v0.1";
  const LAYER_ID = "subMetaPlaceholderLayer";
  const PLACEHOLDERS = Object.freeze([
    placeholder("prg.forma.r1.1", "prg.forma", "card", "free_active", 0.276, 0.160, 0.054, 0.082, 10, true, true, "Forma R1 / 1"),
    placeholder("prg.forma.r1.2", "prg.forma", "card", "free_inactive", 0.350, 0.160, 0.054, 0.082, 11, true, true, "Forma R1 / 2"),
    placeholder("prg.forma.dust", "prg.forma", "dust", "free_active", 0.395, 0.205, 0.025, 0.025, 12, true, true, "Pył Forma"),
    placeholder("world.red.r1", "world.red", "card", "free_active", 0.128, 0.575, 0.050, 0.075, 20, true, true, "Świat czerwony R1"),
    placeholder("world.red.special", "world.red", "special", "hidden", 0.173, 0.575, 0.027, 0.027, 21, false, true, "Świat czerwony specjalny"),
    placeholder("world.red.dust", "world.red", "dust", "free_inactive", 0.128, 0.635, 0.024, 0.024, 22, true, true, "Pył świata czerwonego"),
    placeholder("world.red.artifact", "world.red", "artifact", "occupied", 0.173, 0.635, 0.030, 0.022, 23, true, true, "Artefakt świata czerwonego"),
    placeholder("core.r4.main", "core.r4", "card", "free_inactive", 0.500, 0.500, 0.058, 0.086, 30, true, true, "Rdzeń R4")
  ]);

  let initialized = false;
  let enabled = true;
  let actuallyVisible = false;
  let selectedPlaceholderId = null;
  let layer = null;
  let stage = null;

  function placeholder(id, group, kind, state, x, y, w, h, zIndex, visibleInGame, visibleInDebug, label) {
    return Object.freeze({ id, group, kind, state, x, y, w, h, zIndex, visibleInGame, visibleInDebug, label });
  }

  function isDebugMode() {
    return root.HC?.Session?.mode === "debug";
  }

  function shouldRenderPlaceholder(item) {
    if (item.state === "occupied") return false;
    if (item.state === "hidden" && !isDebugMode()) return false;
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
        position: absolute;
        box-sizing: border-box;
        display: grid;
        place-items: center;
        transform: translate(-50%, -50%);
        border: 1px solid rgba(244, 228, 187, 0.58);
        background: rgba(232, 218, 180, 0.18);
        color: rgba(255, 247, 225, 0.9);
        font: 600 clamp(7px, 0.72vw, 11px)/1 sans-serif;
        letter-spacing: 0.02em;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.9);
        cursor: pointer;
        pointer-events: auto;
        user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .submeta-placeholder--card { border-radius: 18%; }
      .submeta-placeholder--dust,
      .submeta-placeholder--special { border-radius: 50%; }
      .submeta-placeholder--artifact { border-radius: 999px; }
      .submeta-placeholder--free-inactive {
        border-color: rgba(190, 194, 202, 0.42);
        background: rgba(132, 138, 148, 0.16);
        color: rgba(220, 223, 228, 0.72);
      }
      .submeta-placeholder--hidden {
        border-style: dashed;
        border-color: rgba(151, 205, 255, 0.55);
        background: rgba(75, 135, 190, 0.14);
      }
      .submeta-placeholder.is-selected {
        border-color: rgba(255, 239, 186, 0.96);
        background: rgba(255, 226, 151, 0.28);
        box-shadow: 0 0 0 1px rgba(255, 242, 204, 0.25), 0 0 12px rgba(255, 214, 117, 0.72);
      }
      .submeta-placeholder:focus-visible {
        outline: 2px solid rgba(255, 239, 186, 0.92);
        outline-offset: 2px;
      }
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

  function selectPlaceholder(id) {
    if (!PLACEHOLDERS.some((item) => item.id === id && shouldRenderPlaceholder(item))) return false;
    selectedPlaceholderId = id;
    syncSelection();
    if (isDebugMode()) console.debug("[HC.SubMetaPlaceholders] selected", id);
    return true;
  }

  function handlePointerDown(event) {
    const target = event.target.closest?.("[data-submeta-placeholder-id]");
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    selectPlaceholder(target.dataset.submetaPlaceholderId);
  }

  function handleKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const target = event.target.closest?.("[data-submeta-placeholder-id]");
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    selectPlaceholder(target.dataset.submetaPlaceholderId);
  }

  function syncSelection() {
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

    for (const item of PLACEHOLDERS) {
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
      node.textContent = item.kind === "card" ? item.label.replace(/^.*?([Rr]\d.*|\/ \d)$/u, "$1") : "";
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
    if (actuallyVisible && !nextVisible) clearSelection();
    actuallyVisible = nextVisible;
    layer.hidden = !actuallyVisible;
    layer.setAttribute("aria-hidden", actuallyVisible ? "false" : "true");
  }

  function init() {
    if (initialized) return;
    initialized = true;
    createStyle();
    if (createLayer()) syncDom();
    update();
  }

  function setVisible(nextEnabled) {
    enabled = nextEnabled === true;
    if (!enabled) clearSelection();
    update();
  }

  function isVisible() {
    return actuallyVisible;
  }

  function getSelectedPlaceholderId() {
    return selectedPlaceholderId;
  }

  function clearSelection() {
    selectedPlaceholderId = null;
    syncSelection();
  }

  function hitTest(clientX, clientY) {
    if (!actuallyVisible || !stage) return null;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    const hits = PLACEHOLDERS
      .filter(shouldRenderPlaceholder)
      .filter((item) => Math.abs(x - item.x) <= item.w / 2 && Math.abs(y - item.y) <= item.h / 2)
      .sort((a, b) => b.zIndex - a.zIndex);
    return hits[0]?.id || null;
  }

  function getDebugState() {
    return {
      version: VERSION,
      initialized,
      enabled,
      visible: actuallyVisible,
      overlayVisible: overlayIsVisible(),
      selectedPlaceholderId,
      configuredCount: PLACEHOLDERS.length,
      renderedCount: layer?.querySelectorAll("[data-submeta-placeholder-id]").length || 0,
      stageMounted: !!(stage && stage.isConnected),
      layerMounted: !!(layer && layer.isConnected),
      debugMode: isDebugMode()
    };
  }

  root.HC.SubMetaPlaceholders = {
    VERSION,
    init,
    update,
    render: syncDom,
    syncDom,
    setVisible,
    isVisible,
    getSelectedPlaceholderId,
    clearSelection,
    hitTest,
    getDebugState,
    getPlaceholders: () => PLACEHOLDERS.map((item) => ({ ...item }))
  };

  Object.defineProperty(root, "showSubMetaPlaceholders", {
    configurable: true,
    enumerable: true,
    get: () => enabled,
    set: (value) => setVisible(value)
  });
})(window);
