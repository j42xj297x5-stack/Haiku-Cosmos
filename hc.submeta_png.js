// Haiku Cosmos experimental PNG/CSS SUB-META overlay with debug-editable layout.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const VERSION = "submeta-png-layout-v0.1";
  const DESIGN_SIZE = Object.freeze({ width: 1536, height: 1024 });
  const ENABLED_STORAGE_KEY = "hc.submetaPng.enabled.v1";
  const LAYOUT_STORAGE_KEY = "hc.submetaPng.layout.v1";
  const ASSET_DIR = "png/submeta/";
  const BACKGROUND_FIT_MODE = "contain";

  const element = (id, src, x, y, scaleX = 1, scaleY = 1, zIndex = 10, visible = true, mode = "image") => ({
    id, src, x, y, scaleX, scaleY, opacity: 1, zIndex, visible, mode
  });

  const DEFAULT_ELEMENTS = Object.freeze([
    element("background", "submeta_background.png", 0.5, 0.5, 1, 1, 0, true, "background"),
    element("submeta-logo", "submeta_logo.png", 0.497, 0.095, 0.74, 0.74, 30),
    element("back", "submeta_wroc.png", 0.86, 0.067, 0.82, 0.82, 40),
    element("prg-frame", "submeta_prg-ramka.png", 0.253, 0.268, 1.05, 1.05, 10),
    element("prg-label", "submeta_prg.png", 0.245, 0.112, 1, 1, 25),
    element("prg-forma-label", "submeta_prg-forma.png", 0.2, 0.16, 1.2, 1.2, 25),
    element("prg-forma-logo", "submeta_prg-forma-logo.png", 0.12, 0.16, 1.3, 1.3, 25),
    element("prg-intencja-label", "submeta_prg-intencja.png", 0.2, 0.235, 1.2, 1.2, 25),
    element("prg-intencja-logo", "submeta_prg-intencja-logo.png", 0.12, 0.234, 1.3, 1.3, 25),
    element("prg-czas-label", "submeta_prg-czas.png", 0.198, 0.311, 1.2, 1.2, 25),
    element("prg-czas-logo", "submeta_prg-czas-logo.png", 0.12, 0.311, 1.3, 1.3, 25),
    element("prg-cisza-label", "submeta_prg-cisza.png", 0.2, 0.386, 1.2, 1.2, 25),
    element("prg-cisza-logo", "submeta_prg-cisza-logo.png", 0.12, 0.386, 1.3, 1.3, 25),
    element("prg-card-1", "submeta_prg-karta_1.png", 0.276, 0.16, 1, 1, 24),
    element("prg-card-2", "submeta_prg-karta_2.png", 0.35, 0.16, 1, 1, 24),
    element("r2", "submeta_r2.png", 0.34, 0.27, 0.8, 0.8, 25),
    element("r4", "submeta_R4.png", 0.5, 0.5, 0.7, 0.7, 22),
    element("r3", "submeta_r3.png", 0.5, 0.25, 1, 1, 14),
    element("inventory-panel", "submeta_magazyn-panel.png", 0.745, 0.235, 0.84, 0.92, 10),
    element("inventory-label", "submeta_magazyn.png", 0.744, 0.113, 1, 1, 25),
    element("possible-cards-panel", "submeta_mozliwe-karty-panel.png", 0.692, 0.5, 0.9, 0.9, 10),
    element("possible-cards-label", "submeta_mozliwe-karty.png", 0.695, 0.395, 1, 1, 25),
    element("forge-panel", "submeta_kuznia-panel.png", 0.83, 0.5, 0.9, 0.9, 10),
    element("forge-label", "submeta_kuznia.png", 0.83, 0.395, 1, 1, 25),
    element("card-description-panel", "submeta-opis_karty-panel.png", 0.739, 0.795, 1, 1, 10),
    element("card-description-label", "submeta-opis_karty.png", 0.739, 0.649, 1, 1, 25),
    element("world-forma", "submeta_forma_ramka.png", 0.16, 0.6, 0.8, 0.8, 12),
    element("world-intencja", "submeta_intencja_ramka.png", 0.3, 0.6, 0.8, 0.8, 12),
    element("world-czas", "submeta_czas_ramka.png", 0.16, 0.83, 0.8, 0.8, 12),
    element("world-cisza", "submeta_cisza_ramka.png", 0.3, 0.83, 0.78, 0.78, 12),
    element("r2-world", "submeta_r2-swiat.png", 0.46, 0.68, 1, 1, 13),
    element("confirm", "subemeta-button-potwierdz.png", 0.5, 0.9, 1, 1, 10)
  ]);

  const defaultsById = new Map(DEFAULT_ELEMENTS.map((item) => [item.id, item]));
  let elements = cloneDefaults();
  let enabled = readStoredEnabled();
  let selectedId = DEFAULT_ELEMENTS[0].id;
  let overlay = null;
  let stage = null;
  let initialized = false;
  let previewEnabled = false;

  function cloneElement(item) {
    return { ...item };
  }

  function cloneDefaults() {
    return DEFAULT_ELEMENTS.map(cloneElement);
  }

  function publicAssetPath(path) {
    const helper = root.HC && (root.HC.publicAssetPath || root.HC.publicPath);
    return typeof helper === "function" ? helper(path) : path;
  }

  function resolvedAssetUrl(path) {
    const assetPath = publicAssetPath(path);
    try {
      return new URL(assetPath, root.location?.href || document.baseURI).href;
    } catch (_error) {
      return assetPath;
    }
  }

  function readStoredEnabled() {
    try {
      return root.localStorage.getItem(ENABLED_STORAGE_KEY) === "true";
    } catch (_error) {
      return false;
    }
  }

  function normalizeElement(candidate, fallback) {
    if (!candidate || !fallback) return cloneElement(fallback);
    return {
      ...cloneElement(fallback),
      x: clampNumber(candidate.x, 0, 1, fallback.x),
      y: clampNumber(candidate.y, 0, 1, fallback.y),
      scaleX: clampNumber(candidate.scaleX, 0.05, 5, fallback.scaleX),
      scaleY: clampNumber(candidate.scaleY, 0.05, 5, fallback.scaleY),
      opacity: clampNumber(candidate.opacity, 0, 1, fallback.opacity),
      zIndex: Math.round(clampNumber(candidate.zIndex, -100, 1000, fallback.zIndex)),
      visible: candidate.visible !== false
    };
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function getWorld() {
    return (root.HC.getWorld && root.HC.getWorld()) || root.World || null;
  }

  function isActive() {
    return enabled === true;
  }

  function isDebugMode() {
    return root.HC?.Session?.mode === "debug";
  }

  function isPreviewEnabled() {
    return previewEnabled === true && isDebugMode();
  }

  function shouldShow() {
    return (isActive() && getWorld()?.subMetaOpen === true) || isPreviewEnabled();
  }

  function createDom() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.id = "subMetaPngOverlay";
    overlay.hidden = true;
    overlay.setAttribute("aria-label", "SUB-META PNG preview");

    stage = document.createElement("div");
    stage.id = "subMetaPngStage";
    stage.setAttribute("role", "presentation");
    overlay.appendChild(stage);

    for (const item of elements) {
      const image = document.createElement("img");
      image.className = "submeta-png-element";
      image.dataset.submetaPngId = item.id;
      image.alt = "";
      image.draggable = false;
      image.decoding = "async";
      if (item.id === "back") {
        image.classList.add("submeta-png-action");
        image.setAttribute("role", "button");
        image.setAttribute("tabindex", "0");
        image.setAttribute("aria-label", "Wróć");
        image.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          closeSubMeta();
        });
        image.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            closeSubMeta();
          }
        });
      }
      stage.appendChild(image);
    }
    document.body.appendChild(overlay);
    renderElements();
  }

  function closeSubMeta() {
    previewEnabled = false;
    const world = getWorld();
    const wasOpen = world?.subMetaOpen === true;
    if (wasOpen && root.CardEngine && typeof root.CardEngine.closeSubMeta === "function") {
      root.CardEngine.closeSubMeta(world);
    } else if (wasOpen && world) {
      world.subMetaOpen = false;
      world.paused = false;
    } else if (world) {
      world.subMetaOpen = false;
    }
    update();
    root.HC?.SubMetaPlaceholders?.closeFloatingEditor?.();
    root.HC?.SubMetaPanels?.closeFloatingPanelEditor?.();
    root.HC?.SubMetaPlaceholders?.update?.();
    root.HC?.SubMetaPanels?.update?.();
  }

  function hidePreview() {
    setPreviewEnabled(false);
  }

  function renderElements() {
    if (!stage) return;
    for (const item of elements) {
      const image = stage.querySelector(`[data-submeta-png-id="${item.id}"]`);
      if (!image) continue;
      image.src = publicAssetPath(`${ASSET_DIR}${item.src}`);
      image.hidden = !item.visible;
      image.style.zIndex = String(item.zIndex);
      image.style.opacity = String(item.opacity);
      if (item.mode === "background") {
        image.classList.add("submeta-png-background");
        image.style.objectFit = BACKGROUND_FIT_MODE;
        image.style.left = "0";
        image.style.top = "0";
        image.style.width = "100%";
        image.style.height = "100%";
        image.style.transform = `scale(${item.scaleX}, ${item.scaleY})`;
      } else {
        image.classList.remove("submeta-png-background");
        image.style.left = `${item.x * 100}%`;
        image.style.top = `${item.y * 100}%`;
        image.style.width = `calc(var(--submeta-natural-width, 0) / ${DESIGN_SIZE.width} * 100%)`;
        image.style.height = "auto";
        image.style.transform = `translate(-50%, -50%) scale(${item.scaleX}, ${item.scaleY})`;
        if (!image.dataset.naturalWidthListener) {
          image.dataset.naturalWidthListener = "true";
          image.addEventListener("load", () => {
            image.style.setProperty("--submeta-natural-width", String(image.naturalWidth || 0));
          });
        }
        if (image.naturalWidth) image.style.setProperty("--submeta-natural-width", String(image.naturalWidth));
      }
    }
  }

  function update() {
    if (!initialized) init();
    if (!overlay) return;
    const normalVisible = isActive() && getWorld()?.subMetaOpen === true;
    const previewVisible = !normalVisible && isPreviewEnabled();
    const visible = normalVisible || previewVisible;
    overlay.hidden = !visible;
    overlay.setAttribute("aria-hidden", visible ? "false" : "true");
    document.documentElement.classList.toggle("submeta-png-open", visible);
    document.documentElement.classList.toggle("submeta-png-preview", previewVisible);
  }

  function setPreviewEnabled(nextEnabled) {
    previewEnabled = nextEnabled === true && isDebugMode();
    update();
  }

  function setEnabled(nextEnabled) {
    enabled = nextEnabled === true;
    try {
      root.localStorage.setItem(ENABLED_STORAGE_KEY, String(enabled));
    } catch (_error) {
      // localStorage can be unavailable in privacy modes; runtime state still works.
    }
    update();
  }

  function getSelected() {
    return elements.find((item) => item.id === selectedId) || elements[0];
  }

  function saveLayout() {
    const payload = getExportPayload();
    try {
      root.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function applyPayload(payload) {
    if (!payload || !Array.isArray(payload.elements)) return false;
    const incomingById = new Map(payload.elements.map((item) => [item && item.id, item]));
    elements = DEFAULT_ELEMENTS.map((fallback) => normalizeElement(incomingById.get(fallback.id), fallback));
    if (!elements.some((item) => item.id === selectedId)) selectedId = elements[0].id;
    renderElements();
    return true;
  }

  function loadLayout() {
    try {
      const raw = root.localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (!raw) return false;
      return applyPayload(JSON.parse(raw));
    } catch (_error) {
      return false;
    }
  }

  function resetSelected() {
    const fallback = defaultsById.get(selectedId);
    if (!fallback) return;
    elements = elements.map((item) => item.id === selectedId ? cloneElement(fallback) : item);
    renderElements();
    saveLayout();
  }

  function resetAll() {
    elements = cloneDefaults();
    selectedId = elements[0].id;
    renderElements();
    saveLayout();
  }

  function getExportPayload() {
    return {
      version: VERSION,
      designSize: { ...DESIGN_SIZE },
      elements: elements.map(cloneElement)
    };
  }

  function exportLayout() {
    const blob = new Blob([`${JSON.stringify(getExportPayload(), null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "submeta-png-layout-export.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function updateSelectedField(field, rawValue) {
    const selected = getSelected();
    if (!selected) return;
    const next = cloneElement(selected);
    if (field === "visible") next.visible = rawValue === true;
    else if (field === "zIndex") next.zIndex = Math.round(clampNumber(rawValue, -100, 1000, next.zIndex));
    else if (field === "x" || field === "y" || field === "opacity") next[field] = clampNumber(rawValue, 0, 1, next[field]);
    else if (field === "scaleX" || field === "scaleY") next[field] = clampNumber(rawValue, 0.05, 5, next[field]);
    else return;
    elements = elements.map((item) => item.id === next.id ? next : item);
    renderElements();
    saveLayout();
  }

  function handleDebugControl(target) {
    if (!target) return false;
    if (target.id === "dbgSubMetaPngEnabled") {
      setEnabled(target.checked);
      return true;
    }
    if (target.id === "dbgSubMetaPngPreview") {
      setPreviewEnabled(target.checked);
      return true;
    }
    if (target.id === "dbgSubMetaPngElement") {
      selectedId = target.value;
      return true;
    }
    const field = target.dataset && target.dataset.submetaPngField;
    if (field) {
      updateSelectedField(field, field === "visible" ? target.checked : target.value);
      return true;
    }
    const action = target.dataset && target.dataset.submetaPngAction;
    if (!action) return false;
    if (action === "close-submeta") closeSubMeta();
    else if (action === "hide-preview") hidePreview();
    else if (action === "reset-selected") resetSelected();
    else if (action === "reset-all") resetAll();
    else if (action === "save") saveLayout();
    else if (action === "load") loadLayout();
    else if (action === "export") exportLayout();
    return true;
  }

  function option(value, label, selected) {
    return `<option value="${value}"${selected ? " selected" : ""}>${label}</option>`;
  }

  function renderNumberControl(label, field, value, min, max, step) {
    return `<label class="submeta-png-debug-row"><span>${label}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${Number(value).toFixed(step < 0.01 ? 3 : 2)}" data-submeta-png-field="${field}"></label>`;
  }

  function getDiagnostics() {
    const renderedElements = stage ? stage.querySelectorAll("[data-submeta-png-id]").length : 0;
    const stageRect = stage?.getBoundingClientRect?.();
    const stageWidth = Math.round(stageRect?.width || 0);
    const stageHeight = Math.round(stageRect?.height || 0);
    const scaleX = stageWidth / DESIGN_SIZE.width;
    const scaleY = stageHeight / DESIGN_SIZE.height;
    return {
      moduleLoaded: true,
      enabled: isActive(),
      preview: isPreviewEnabled(),
      worldSubMetaOpen: getWorld()?.subMetaOpen === true,
      overlayMounted: !!(overlay && overlay.isConnected),
      elementsConfigured: elements.length,
      elementsRendered: renderedElements,
      stageSize: `${stageWidth} × ${stageHeight}`,
      viewportSize: `${Math.round(root.innerWidth || 0)} × ${Math.round(root.innerHeight || 0)}`,
      backgroundFitMode: BACKGROUND_FIT_MODE,
      stageScale: `${scaleX.toFixed(4)} × ${scaleY.toFixed(4)}`,
      sampleBackgroundPath: resolvedAssetUrl(`${ASSET_DIR}submeta_background.png`)
    };
  }

  function renderDebugHtml(options = {}) {
    const selected = getSelected();
    if (!selected) return "";
    const diagnostics = getDiagnostics();
    const elementOptions = elements.map((item) => option(item.id, item.id, item.id === selected.id)).join("");
    return `
      <details class="submeta-png-debug overlay-collapsible" data-runtime-debug-section="submeta-png-layout"${options.open === false ? "" : " open"}>
        <summary>SUB-META PNG Layout</summary>
        <div class="overlay-grid">
          <label class="overlay-select-row" for="dbgSubMetaPngEnabled">Use new PNG SUB-META <input id="dbgSubMetaPngEnabled" type="checkbox"${enabled ? " checked" : ""}></label>
          <label class="overlay-select-row" for="dbgSubMetaPngPreview">Show PNG layout preview <input id="dbgSubMetaPngPreview" type="checkbox"${diagnostics.preview ? " checked" : ""}></label>
          <label class="submeta-png-debug-row" for="dbgSubMetaPngElement"><span>Element</span><select id="dbgSubMetaPngElement">${elementOptions}</select></label>
          ${renderNumberControl("x", "x", selected.x, 0, 1, 0.001)}
          ${renderNumberControl("y", "y", selected.y, 0, 1, 0.001)}
          ${renderNumberControl("scaleX", "scaleX", selected.scaleX, 0.05, 5, 0.01)}
          ${renderNumberControl("scaleY", "scaleY", selected.scaleY, 0.05, 5, 0.01)}
          ${renderNumberControl("opacity", "opacity", selected.opacity, 0, 1, 0.01)}
          <label class="submeta-png-debug-row"><span>visible</span><input type="checkbox" data-submeta-png-field="visible"${selected.visible ? " checked" : ""}></label>
          ${renderNumberControl("zIndex", "zIndex", selected.zIndex, -100, 1000, 1)}
          <div class="submeta-png-debug-actions submeta-png-emergency-actions">
            <button class="overlay-btn" type="button" data-submeta-png-action="close-submeta">Close SUB-META</button>
            <button class="overlay-btn" type="button" data-submeta-png-action="hide-preview">Hide PNG preview</button>
          </div>
          <div class="submeta-png-debug-actions">
            <button class="overlay-btn" type="button" data-submeta-png-action="reset-selected">Reset selected</button>
            <button class="overlay-btn" type="button" data-submeta-png-action="reset-all">Reset all</button>
            <button class="overlay-btn" type="button" data-submeta-png-action="save">Save layout to localStorage</button>
            <button class="overlay-btn" type="button" data-submeta-png-action="load">Load layout from localStorage</button>
            <button class="overlay-btn" type="button" data-submeta-png-action="export">Export layout JSON</button>
          </div>
          <div class="submeta-png-diagnostics">
            <div class="overlay-row"><span class="k">module loaded</span><span class="v">yes</span></div>
            <div class="overlay-row"><span class="k">enabled</span><span class="v">${diagnostics.enabled ? "yes" : "no"}</span></div>
            <div class="overlay-row"><span class="k">preview</span><span class="v">${diagnostics.preview ? "yes" : "no"}</span></div>
            <div class="overlay-row"><span class="k">World.subMetaOpen</span><span class="v">${diagnostics.worldSubMetaOpen ? "yes" : "no"}</span></div>
            <div class="overlay-row"><span class="k">overlay mounted</span><span class="v">${diagnostics.overlayMounted ? "yes" : "no"}</span></div>
            <div class="overlay-row"><span class="k">elements configured</span><span class="v">${diagnostics.elementsConfigured}</span></div>
            <div class="overlay-row"><span class="k">elements rendered</span><code class="v">${diagnostics.elementsRendered}</code></div>
            <div class="overlay-row"><span class="k">stage size</span><code class="v">${diagnostics.stageSize}</code></div>
            <div class="overlay-row"><span class="k">viewport size</span><code class="v">${diagnostics.viewportSize}</code></div>
            <div class="overlay-row"><span class="k">background fit</span><code class="v">${diagnostics.backgroundFitMode}</code></div>
            <div class="overlay-row"><span class="k">stage scale</span><code class="v">${diagnostics.stageScale}</code></div>
            <div class="overlay-row"><span class="k">sample background path</span><code class="v">${diagnostics.sampleBackgroundPath}</code></div>
            <div class="overlay-row"><span class="k">storage</span><code class="v">${LAYOUT_STORAGE_KEY}</code></div>
          </div>
        </div>
      </details>`;
  }

  function init() {
    if (initialized) return;
    initialized = true;
    createDom();
    loadLayout();
    update();
  }

  root.HC.SubMetaPngLayout = {
    VERSION,
    DESIGN_SIZE,
    ENABLED_STORAGE_KEY,
    LAYOUT_STORAGE_KEY,
    BACKGROUND_FIT_MODE,
    init,
    update,
    isActive,
    isPreviewEnabled,
    shouldShow,
    setEnabled,
    setPreviewEnabled,
    closeSubMeta,
    hidePreview,
    getDiagnostics,
    getElements: () => elements.map(cloneElement),
    getExportPayload,
    saveLayout,
    loadLayout,
    resetSelected,
    resetAll,
    exportLayout,
    renderDebugHtml,
    handleDebugControl
  };
})(window);
