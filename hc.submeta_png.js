// Haiku Cosmos experimental PNG/CSS SUB-META overlay with debug-editable layout.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const VERSION = "submeta-png-layout-v0.1";
  const DESIGN_SIZE = Object.freeze({ width: 1536, height: 1024 });
  const ENABLED_STORAGE_KEY = "hc.submetaPng.enabled.v1";
  const ASSET_DIR = "png/submeta/";
  const LAYOUT_JSON_PATH = "settings/submeta-png-layout.json";
  const SETTING_KEY = "pngLayout";
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
  let debugEnabled = readStoredEnabled();
  let selectedId = DEFAULT_ELEMENTS[0].id;
  let overlay = null;
  let stage = null;
  let initialized = false;
  let previewEnabled = false;
  let initializationPromise = null;
  let dataSource = "fallback";
  let lastAction = "startup";
  let lastError = "";
  let lastLayoutUrl = resolvedAssetUrl(LAYOUT_JSON_PATH);

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
      return root.localStorage.getItem(ENABLED_STORAGE_KEY) !== "false";
    } catch (_error) {
      return true;
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
    return !isDebugMode() || debugEnabled === true;
  }

  function isDebugMode() {
    return root.HC?.Session?.mode === "debug";
  }

  function debugLog(message, details = {}) {
    if (!isDebugMode()) return;
    console.info(`[HC.SubMetaPngLayout] ${message}`, details);
  }

  function isPreviewEnabled() {
    return previewEnabled === true && isDebugMode();
  }

  function shouldShow() {
    return (isActive() && getWorld()?.subMetaOpen === true) || isPreviewEnabled();
  }

  function createActionStyle() {
    if (document.getElementById("subMetaPngActionStyles")) return;
    const style = document.createElement("style");
    style.id = "subMetaPngActionStyles";
    style.textContent = `
      .submeta-png-confirm { transition:opacity 140ms ease,filter 140ms ease; }
      .submeta-png-confirm.is-inactive { opacity:.42!important; filter:saturate(.55) brightness(.72); cursor:default; }
      .submeta-png-confirm.is-ready { opacity:1!important; pointer-events:auto; cursor:pointer; filter:brightness(1.13) drop-shadow(0 0 7px rgba(255,211,112,.58)); }
      .submeta-png-confirm.is-ready:hover, .submeta-png-confirm.is-ready:focus-visible { filter:brightness(1.27) drop-shadow(0 0 10px rgba(255,220,132,.78)); }
      .submeta-png-confirm.is-ready:active { filter:brightness(.94) drop-shadow(0 0 4px rgba(255,211,112,.45)); }
    `;
    document.head.appendChild(style);
  }

  function activateConfirm(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (root.HC?.SubMetaPanels?.getConfirmButtonState?.() !== "ready") return false;
    return root.HC.SubMetaPanels.confirmPendingAssignment?.() === true;
  }

  function refreshConfirmButton() {
    const image = stage?.querySelector?.('[data-submeta-png-id="confirm"]');
    if (!image) return "inactive";
    const state = root.HC?.SubMetaPanels?.getConfirmButtonState?.() === "ready" ? "ready" : "inactive";
    image.classList.toggle("is-ready", state === "ready");
    image.classList.toggle("is-inactive", state !== "ready");
    image.setAttribute("aria-disabled", state === "ready" ? "false" : "true");
    image.setAttribute("tabindex", state === "ready" ? "0" : "-1");
    image.style.zIndex = String(Math.max(320, Number(elements.find((item) => item.id === "confirm")?.zIndex) || 0));
    return state;
  }

  function createDom() {
    if (overlay) return;
    createActionStyle();
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
      if (item.id === "confirm") {
        image.classList.add("submeta-png-action", "submeta-png-confirm", "is-inactive");
        image.setAttribute("role", "button");
        image.setAttribute("tabindex", "-1");
        image.setAttribute("aria-label", "Potwierdź zmianę konfiguracji");
        image.setAttribute("aria-disabled", "true");
        image.addEventListener("click", activateConfirm);
        image.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") activateConfirm(event);
        });
      }
      stage.appendChild(image);
    }
    document.body.appendChild(overlay);
    renderElements();
  }

  function closeSubMeta() {
    previewEnabled = false;
    root.HC?.SubMetaPanels?.clearPendingAssignment?.({ reason: "submeta-closed", render: false });
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
    refreshConfirmButton();
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
      image.style.zIndex = String(item.id === "confirm" ? Math.max(320, item.zIndex) : item.zIndex);
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
    if (!visible && root.HC?.SubMetaPanels?.getPendingAssignment?.()) {
      root.HC.SubMetaPanels.clearPendingAssignment?.({ reason: "submeta-hidden", render: false });
    }
    overlay.hidden = !visible;
    overlay.setAttribute("aria-hidden", visible ? "false" : "true");
    document.documentElement.classList.toggle("submeta-png-open", visible);
    document.documentElement.classList.toggle("submeta-png-preview", previewVisible);
    refreshConfirmButton();
  }

  function setPreviewEnabled(nextEnabled) {
    previewEnabled = nextEnabled === true && isDebugMode();
    update();
  }

  function setEnabled(nextEnabled) {
    if (!isDebugMode()) return isActive();
    debugEnabled = nextEnabled === true;
    try {
      root.localStorage.setItem(ENABLED_STORAGE_KEY, String(debugEnabled));
    } catch (_error) {
      // localStorage can be unavailable in privacy modes; runtime state still works.
    }
    update();
    return isActive();
  }


  function getRootScale() {
    const rect = stage?.getBoundingClientRect?.();
    if (!rect || !rect.width || !rect.height) return 1;
    const scaleX = rect.width / DESIGN_SIZE.width;
    const scaleY = rect.height / DESIGN_SIZE.height;
    const scale = Math.min(scaleX, scaleY);
    return Number.isFinite(scale) && scale > 0 ? scale : 1;
  }

  function getSelected() {
    return elements.find((item) => item.id === selectedId) || elements[0];
  }

  function validatePayload(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("PNG layout must be a JSON object");
    }
    if (payload.version !== VERSION) {
      throw new Error(`PNG layout version must be ${VERSION}`);
    }
    if (payload.designSize?.width !== DESIGN_SIZE.width || payload.designSize?.height !== DESIGN_SIZE.height) {
      throw new Error(`PNG layout designSize must be ${DESIGN_SIZE.width} × ${DESIGN_SIZE.height}`);
    }
    if (!Array.isArray(payload.elements) || payload.elements.length !== DEFAULT_ELEMENTS.length) {
      throw new Error(`PNG layout elements must contain exactly ${DEFAULT_ELEMENTS.length} entries`);
    }

    const seenIds = new Set();
    for (const item of payload.elements) {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        throw new Error("Every PNG layout element must be an object");
      }
      if (!defaultsById.has(item.id)) throw new Error(`Unknown PNG layout element id: ${String(item.id)}`);
      if (seenIds.has(item.id)) throw new Error(`Duplicate PNG layout element id: ${item.id}`);
      seenIds.add(item.id);
      const fallback = defaultsById.get(item.id);
      if (item.src !== fallback.src || item.mode !== fallback.mode) {
        throw new Error(`PNG layout element ${item.id} has an incompatible src or mode`);
      }
      for (const field of ["x", "y", "scaleX", "scaleY", "opacity", "zIndex"]) {
        if (typeof item[field] !== "number" || !Number.isFinite(item[field])) {
          throw new Error(`PNG layout element ${item.id} has invalid ${field}`);
        }
      }
      if (item.x < 0 || item.x > 1 || item.y < 0 || item.y > 1 || item.opacity < 0 || item.opacity > 1) {
        throw new Error(`PNG layout element ${item.id} has a position or opacity outside 0..1`);
      }
      if (item.scaleX < 0.05 || item.scaleX > 5 || item.scaleY < 0.05 || item.scaleY > 5) {
        throw new Error(`PNG layout element ${item.id} has a scale outside 0.05..5`);
      }
      if (!Number.isInteger(item.zIndex) || item.zIndex < -100 || item.zIndex > 1000) {
        throw new Error(`PNG layout element ${item.id} has an invalid zIndex`);
      }
      if (typeof item.visible !== "boolean") {
        throw new Error(`PNG layout element ${item.id} has invalid visible`);
      }
    }

    for (const fallback of DEFAULT_ELEMENTS) {
      if (!seenIds.has(fallback.id)) throw new Error(`Missing PNG layout element id: ${fallback.id}`);
    }
    return true;
  }

  function applyPayload(payload) {
    validatePayload(payload);
    const incomingById = new Map(payload.elements.map((item) => [item.id, item]));
    const nextElements = DEFAULT_ELEMENTS.map((fallback) => normalizeElement(incomingById.get(fallback.id), fallback));
    elements = nextElements;
    if (!elements.some((item) => item.id === selectedId)) selectedId = elements[0].id;
    renderElements();
    refreshConfirmButton();
    return true;
  }

  async function restoreJsonDefaultOrFallback(reason = "reset") {
    const settings = root.HC?.SubMetaSettings;
    const logicalPath = settings?.paths?.[SETTING_KEY] || LAYOUT_JSON_PATH;
    const resolvedUrl = resolvedAssetUrl(logicalPath);
    lastLayoutUrl = resolvedUrl;

    try {
      if (!settings || typeof settings.loadJson !== "function") {
        throw new Error("SUB-META settings loader is unavailable");
      }
      const result = await settings.loadJson(logicalPath, {
        validate: (payload) => {
          try {
            return validatePayload(payload);
          } catch (_error) {
            return false;
          }
        },
        invalidMessage: "Runtime PNG layout setting has an invalid structure"
      });
      lastLayoutUrl = result.resolvedUrl || resolvedUrl;
      if (!result.ok || !applyPayload(result.payload)) {
        throw result.error || new Error(result.failureKind || "PNG layout settings load failed");
      }
      dataSource = "settings JSON";
      lastAction = reason === "startup"
        ? `loaded settings JSON, elements: ${elements.length}`
        : `reset from settings JSON, elements: ${elements.length}`;
      lastError = "";
      updateSettingsStatus("png", lastAction);
      debugLog("layout loaded from settings JSON", { logicalPath, resolvedUrl: lastLayoutUrl });
      return true;
    } catch (error) {
      elements = cloneDefaults();
      selectedId = elements[0].id;
      dataSource = "fallback";
      lastAction = "error";
      lastError = String(error?.message || error);
      updateSettingsStatus("png", `error: ${lastError}`);
      renderElements();
      debugLog("layout loaded from DEFAULT_ELEMENTS fallback", {
        logicalPath,
        resolvedUrl: lastLayoutUrl,
        error: lastError
      });
      return false;
    }
  }

  function importLayout(json) {
    try {
      const payload = typeof json === "string" ? JSON.parse(json) : json;
      applyPayload(payload);
      dataSource = "imported runtime";
      lastAction = `imported PNG layout, elements: ${elements.length}`;
      lastError = "";
      updateSettingsStatus("png", lastAction);
      return true;
    } catch (error) {
      lastAction = "error";
      lastError = String(error?.message || error);
      updateSettingsStatus("png", `error: ${lastError}`);
      console.warn("[HC.SubMetaPngLayout] JSON import failed", error);
      return false;
    }
  }

  function resetSelected() {
    const fallback = defaultsById.get(selectedId);
    if (!fallback) return;
    elements = elements.map((item) => item.id === selectedId ? cloneElement(fallback) : item);
    renderElements();
  }

  async function resetAll() {
    const restored = await restoreJsonDefaultOrFallback();
    update();
    const textarea = document.getElementById("dbgSubMetaPngJson");
    if (textarea) textarea.value = JSON.stringify(getExportPayload(), null, 2);
    return restored;
  }

  function getExportPayload() {
    return {
      version: VERSION,
      designSize: { ...DESIGN_SIZE },
      elements: elements.map(cloneElement)
    };
  }

  function exportLayout() {
    lastAction = `exported current PNG layout, elements: ${elements.length}`;
    lastError = "";
    updateSettingsStatus("png", lastAction);
    return JSON.stringify(getExportPayload(), null, 2);
  }

  function updateSettingsStatus(section, text) {
    const node = document.querySelector(`[data-submeta-settings-status="${section}"]`);
    if (node) node.textContent = text;
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
    if (action === "reset-selected") resetSelected();
    else if (action === "reset-all") return resetAll().then(() => true);
    else {
      const textarea = document.getElementById("dbgSubMetaPngJson");
      if (action === "export") { if (textarea) textarea.value = exportLayout(); }
      else if (action === "import") importLayout(textarea?.value || "");
    }
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
      confirmButtonState: refreshConfirmButton(),
      stageScale: `${scaleX.toFixed(4)} × ${scaleY.toFixed(4)}`,
      sampleBackgroundPath: resolvedAssetUrl(`${ASSET_DIR}submeta_background.png`),
      layoutSource: dataSource,
      layoutUrl: lastLayoutUrl
    };
  }

  function renderDebugHtml(options = {}) {
    const selected = getSelected();
    if (!selected) return "";
    const diagnostics = getDiagnostics();
    const elementOptions = elements.map((item) => option(item.id, item.id, item.id === selected.id)).join("");
    return `
      <details class="submeta-png-debug overlay-collapsible" data-runtime-debug-section="submeta-png-layout"${options.open === true ? " open" : ""}>
        <summary>SUB-META PNG Layout</summary>
        <div class="overlay-grid">
          <label class="overlay-select-row" for="dbgSubMetaPngEnabled">Use new PNG SUB-META <input id="dbgSubMetaPngEnabled" type="checkbox"${isActive() ? " checked" : ""}></label>
          <label class="submeta-png-debug-row" for="dbgSubMetaPngElement"><span>Element</span><select id="dbgSubMetaPngElement">${elementOptions}</select></label>
          ${renderNumberControl("x", "x", selected.x, 0, 1, 0.001)}
          ${renderNumberControl("y", "y", selected.y, 0, 1, 0.001)}
          ${renderNumberControl("scaleX", "scaleX", selected.scaleX, 0.05, 5, 0.01)}
          ${renderNumberControl("scaleY", "scaleY", selected.scaleY, 0.05, 5, 0.01)}
          ${renderNumberControl("opacity", "opacity", selected.opacity, 0, 1, 0.01)}
          <label class="submeta-png-debug-row"><span>visible</span><input type="checkbox" data-submeta-png-field="visible"${selected.visible ? " checked" : ""}></label>
          ${renderNumberControl("zIndex", "zIndex", selected.zIndex, -100, 1000, 1)}
          <div class="submeta-png-debug-actions">
            <button class="overlay-btn" type="button" data-submeta-png-action="reset-selected">Reset selected</button>
            <button class="overlay-btn" type="button" data-submeta-png-action="reset-all">Reset defaults</button>
            <button class="overlay-btn" type="button" data-submeta-png-action="export">Export JSON</button>
            <button class="overlay-btn" type="button" data-submeta-png-action="import">Import JSON</button>
          </div>
          <textarea id="dbgSubMetaPngJson" class="overlay-note submeta-settings-json" spellcheck="false" placeholder="Exported JSON appears here; paste PNG layout JSON here before Import."></textarea>
          <div class="submeta-png-diagnostics">
            <div class="overlay-row"><span class="k">source</span><code class="v">${diagnostics.layoutSource}</code></div>
            <div class="overlay-row"><span class="k">elements</span><span class="v">${diagnostics.elementsConfigured}</span></div>
            <div class="overlay-row"><span class="k">last action</span><code class="v" data-submeta-settings-status="png">${lastAction}</code></div>
            <div class="overlay-row"><span class="k">settings URL</span><code class="v">${diagnostics.layoutUrl}</code></div>
            ${lastError ? `<div class="overlay-row"><span class="k">error</span><code class="v">${lastError}</code></div>` : ""}
          </div>
        </div>
      </details>`;
  }

  function init() {
    if (initialized) return initializationPromise;
    initialized = true;
    createDom();
    initializationPromise = restoreJsonDefaultOrFallback("startup").finally(update);
    return initializationPromise;
  }

  root.HC.SubMetaPngLayout = {
    VERSION,
    DESIGN_SIZE,
    ENABLED_STORAGE_KEY,
    BACKGROUND_FIT_MODE,
    SETTING_KEY,
    LAYOUT_JSON_PATH,
    init,
    update,
    isActive,
    isPreviewEnabled,
    shouldShow,
    setEnabled,
    setPreviewEnabled,
    closeSubMeta,
    hidePreview,
    refreshConfirmButton,
    getRootScale,
    getDiagnostics,
    getElements: () => elements.map(cloneElement),
    getExportPayload,
    validatePayload,
    loadRuntimeSetting: restoreJsonDefaultOrFallback,
    loadJsonDefault: restoreJsonDefaultOrFallback,
    importLayout,
    resetSelected,
    resetAll,
    exportLayout,
    renderDebugHtml,
    handleDebugControl
  };
})(window);
