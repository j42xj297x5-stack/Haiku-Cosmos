// Haiku Cosmos top HUD PNG overlay and debug-editable DOM layout.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const LAYOUT_VERSION = 1;
  const STORAGE_KEY = "hc.hudTopLayout.v1";
  const ASSET_PATH = "png/hud_top.png";
  const ASSET_ASPECT_RATIO = 253 / 1658;
  const DEFAULT_LAYOUT = Object.freeze({
    hudTopLayoutVersion: LAYOUT_VERSION,
    overlay: Object.freeze({
      scale: 1,
      top: 0,
      centerOffsetX: 0,
      width: 1536,
    }),
    subMetaButton: Object.freeze({
      centerX: 768,
      centerY: 96,
      size: 120,
    }),
    rpText: Object.freeze({
      x: 1463,
      y: 116,
      fontSize: 21,
      letterSpacing: 1,
      align: "center",
    }),
  });

  let layout = cloneLayout(DEFAULT_LAYOUT);
  let stage = null;
  let image = null;
  let subMetaButton = null;
  let rpText = null;
  let initialized = false;

  function cloneLayout(source) {
    return {
      hudTopLayoutVersion: LAYOUT_VERSION,
      overlay: { ...source.overlay },
      subMetaButton: { ...source.subMetaButton },
      rpText: { ...source.rpText },
    };
  }

  function clampNumber(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.max(min, Math.min(max, number));
  }

  function sanitizeLayout(candidate) {
    const source = candidate && typeof candidate === "object" ? candidate : {};
    const overlay = source.overlay && typeof source.overlay === "object" ? source.overlay : {};
    const button = source.subMetaButton && typeof source.subMetaButton === "object" ? source.subMetaButton : {};
    const text = source.rpText && typeof source.rpText === "object" ? source.rpText : {};
    const align = ["left", "center", "right"].includes(text.align) ? text.align : DEFAULT_LAYOUT.rpText.align;

    return {
      hudTopLayoutVersion: LAYOUT_VERSION,
      overlay: {
        scale: clampNumber(overlay.scale, 0.1, 3, DEFAULT_LAYOUT.overlay.scale),
        top: clampNumber(overlay.top, -1000, 2000, DEFAULT_LAYOUT.overlay.top),
        centerOffsetX: clampNumber(overlay.centerOffsetX, -2000, 2000, DEFAULT_LAYOUT.overlay.centerOffsetX),
        width: clampNumber(overlay.width, 320, 4096, DEFAULT_LAYOUT.overlay.width),
      },
      subMetaButton: {
        centerX: clampNumber(button.centerX, -1000, 5000, DEFAULT_LAYOUT.subMetaButton.centerX),
        centerY: clampNumber(button.centerY, -1000, 3000, DEFAULT_LAYOUT.subMetaButton.centerY),
        size: clampNumber(button.size, 16, 1000, DEFAULT_LAYOUT.subMetaButton.size),
      },
      rpText: {
        x: clampNumber(text.x, -1000, 5000, DEFAULT_LAYOUT.rpText.x),
        y: clampNumber(text.y, -1000, 3000, DEFAULT_LAYOUT.rpText.y),
        fontSize: clampNumber(text.fontSize, 8, 240, DEFAULT_LAYOUT.rpText.fontSize),
        letterSpacing: clampNumber(text.letterSpacing, -10, 40, DEFAULT_LAYOUT.rpText.letterSpacing),
        align,
      },
    };
  }

  function publicAssetPath(path) {
    const helper = root.HC && (root.HC.publicAssetPath || root.HC.publicPath);
    return typeof helper === "function" ? helper(path) : path;
  }

  function getViewportWidth() {
    return Math.max(1, Number(root.innerWidth) || Number(document.documentElement?.clientWidth) || layout.overlay.width);
  }

  function applyLayout() {
    if (!stage) return;
    const width = layout.overlay.width;
    const responsiveScale = Math.min(1, getViewportWidth() / width);
    const renderedScale = layout.overlay.scale * responsiveScale;
    const height = width * ASSET_ASPECT_RATIO;

    stage.style.width = `${width}px`;
    stage.style.height = `${height}px`;
    stage.style.top = `${layout.overlay.top}px`;
    stage.style.transform = `translateX(-50%) translateX(${layout.overlay.centerOffsetX}px) scale(${renderedScale})`;

    subMetaButton.style.left = `${layout.subMetaButton.centerX}px`;
    subMetaButton.style.top = `${layout.subMetaButton.centerY}px`;
    subMetaButton.style.width = `${layout.subMetaButton.size}px`;
    subMetaButton.style.height = `${layout.subMetaButton.size}px`;

    rpText.style.left = `${layout.rpText.x}px`;
    rpText.style.top = `${layout.rpText.y}px`;
    rpText.style.fontSize = `${layout.rpText.fontSize}px`;
    rpText.style.letterSpacing = `${layout.rpText.letterSpacing}px`;
    rpText.style.textAlign = layout.rpText.align;
    rpText.style.transform = layout.rpText.align === "center"
      ? "translate(-50%, -50%)"
      : (layout.rpText.align === "right" ? "translate(-100%, -50%)" : "translateY(-50%)");
  }

  function saveLayout() {
    try {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function loadLayout() {
    try {
      const stored = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "null");
      if (stored) layout = sanitizeLayout(stored);
    } catch (_error) {
      layout = cloneLayout(DEFAULT_LAYOUT);
    }
    applyLayout();
    return getLayout();
  }

  function setLayout(nextLayout, options = {}) {
    layout = sanitizeLayout(nextLayout);
    applyLayout();
    if (options.persist !== false) saveLayout();
    return getLayout();
  }

  function getLayout() {
    return cloneLayout(layout);
  }

  function resetLayout() {
    layout = cloneLayout(DEFAULT_LAYOUT);
    applyLayout();
    saveLayout();
    return getLayout();
  }

  function updateField(path, rawValue) {
    const [group, field] = String(path || "").split(".");
    if (!layout[group] || !Object.prototype.hasOwnProperty.call(layout[group], field)) return false;
    const next = getLayout();
    next[group][field] = field === "align" ? String(rawValue) : Number(rawValue);
    setLayout(next);
    return true;
  }

  function getExportJson() {
    return `${JSON.stringify(layout, null, 2)}\n`;
  }

  function downloadLayout() {
    const blob = new Blob([getExportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "hud-top-layout.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function copyLayout() {
    if (root.navigator?.clipboard?.writeText) {
      await root.navigator.clipboard.writeText(getExportJson());
      return true;
    }
    return false;
  }

  function importLayout(rawJson) {
    const parsed = JSON.parse(String(rawJson || ""));
    return setLayout(parsed);
  }

  function setRpValue(value) {
    if (!rpText) return;
    rpText.textContent = String(Math.max(0, Math.floor(Number(value) || 0)));
  }

  function openSubMeta() {
    const World = (root.HC.getWorld && root.HC.getWorld()) || root.World;
    if (!World || World.subMetaOpen) return;
    World.subMetaOpen = true;
    World.paused = true;
  }

  function init() {
    if (initialized) return;
    stage = document.getElementById("hudTopStage");
    image = document.getElementById("hudTopImage");
    subMetaButton = document.getElementById("btnSubMeta");
    rpText = document.getElementById("scoreLabel");
    if (!stage || !image || !subMetaButton || !rpText) return;

    initialized = true;
    image.src = publicAssetPath(ASSET_PATH);
    subMetaButton.addEventListener("click", openSubMeta);
    root.addEventListener("resize", applyLayout);
    loadLayout();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function numberControl(label, path, value, min, max, step) {
    return `<label class="hud-top-debug-row"><span>${label}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${value}" data-hud-top-field="${path}"></label>`;
  }

  function renderDebugHtml(options = {}) {
    const alignOptions = ["left", "center", "right"]
      .map((value) => `<option value="${value}"${layout.rpText.align === value ? " selected" : ""}>${value}</option>`)
      .join("");
    return `
      <details class="hud-top-debug overlay-collapsible" data-runtime-debug-section="hud-top-layout"${options.open === false ? "" : " open"}>
        <summary>HUD Top Layout</summary>
        <div class="overlay-grid">
          ${numberControl("overlay scale", "overlay.scale", layout.overlay.scale, 0.1, 3, 0.01)}
          ${numberControl("overlay top", "overlay.top", layout.overlay.top, -1000, 2000, 1)}
          ${numberControl("overlay center offset X", "overlay.centerOffsetX", layout.overlay.centerOffsetX, -2000, 2000, 1)}
          ${numberControl("overlay width", "overlay.width", layout.overlay.width, 320, 4096, 1)}
          ${numberControl("SUB-META center X", "subMetaButton.centerX", layout.subMetaButton.centerX, -1000, 5000, 1)}
          ${numberControl("SUB-META center Y", "subMetaButton.centerY", layout.subMetaButton.centerY, -1000, 3000, 1)}
          ${numberControl("SUB-META size", "subMetaButton.size", layout.subMetaButton.size, 16, 1000, 1)}
          ${numberControl("RP text X", "rpText.x", layout.rpText.x, -1000, 5000, 1)}
          ${numberControl("RP text Y", "rpText.y", layout.rpText.y, -1000, 3000, 1)}
          ${numberControl("RP font size", "rpText.fontSize", layout.rpText.fontSize, 8, 240, 1)}
          ${numberControl("RP letter spacing", "rpText.letterSpacing", layout.rpText.letterSpacing, -10, 40, 0.1)}
          <label class="hud-top-debug-row"><span>RP align</span><select data-hud-top-field="rpText.align">${alignOptions}</select></label>
          <textarea class="overlay-note hud-top-json" data-hud-top-json aria-label="HUD Top Layout JSON">${escapeHtml(getExportJson())}</textarea>
          <div class="hud-top-debug-actions">
            <button class="overlay-btn" type="button" data-hud-top-action="copy">Copy JSON</button>
            <button class="overlay-btn" type="button" data-hud-top-action="download">Download JSON</button>
            <button class="overlay-btn" type="button" data-hud-top-action="import">Import JSON</button>
            <button class="overlay-btn" type="button" data-hud-top-action="reset">Reset defaults</button>
          </div>
          <div class="overlay-row"><span class="k">localStorage</span><code class="v">${STORAGE_KEY}</code></div>
        </div>
      </details>`;
  }

  function handleDebugControl(target) {
    if (!target) return false;
    const field = target.dataset?.hudTopField;
    if (field) return updateField(field, target.value);

    const action = target.dataset?.hudTopAction;
    if (!action) return false;
    if (action === "copy") void copyLayout();
    else if (action === "download") downloadLayout();
    else if (action === "import") {
      const textarea = target.closest(".hud-top-debug")?.querySelector("[data-hud-top-json]");
      try {
        importLayout(textarea?.value || "");
        if (textarea) textarea.value = getExportJson();
      } catch (error) {
        root.alert(`HUD Top Layout import failed: ${error.message}`);
      }
    } else if (action === "reset") resetLayout();
    return true;
  }

  root.HC.HudTopLayout = {
    LAYOUT_VERSION,
    STORAGE_KEY,
    DEFAULT_LAYOUT: cloneLayout(DEFAULT_LAYOUT),
    init,
    getLayout,
    setLayout,
    resetLayout,
    saveLayout,
    loadLayout,
    importLayout,
    getExportJson,
    setRpValue,
    renderDebugHtml,
    handleDebugControl,
    sanitizeLayout,
  };
})(window);
