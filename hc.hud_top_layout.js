// Haiku Cosmos layered top HUD PNG overlay and debug-editable stage layout.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const LAYOUT_VERSION = 3;
  const COORDINATE_SYSTEM = "stage_rect";
  const SETTINGS_PATH = "settings/hud-top-layout.json";
  const DEFAULT_STAGE = Object.freeze({ width: 1920, height: 150 });
  const STORAGE_KEY = "hc.hudTopLayout.v3.stageRuntimeOverride";
  const LEGACY_STORAGE_KEY = "hc.hudTopLayout.v2.normalized";
  const LEGACY_BASE_WIDTH = 1920;
  const LEGACY_BASE_HEIGHT = 403;
  const REQUIRED_IDS = [
    "hud_top_haiku_cosmos_logo",
    "hud_top_haiku_cosmos_settings",
    "hud_top_button_settings",
    "hud_top_submeta",
    "hud_top_button_submeta",
    "hud_top_rp_background",
    "hud_top_rp_value",
    "hud_top_dust_pile",
    "hud_top_dust_pile_button",
    "hud_top_active_hud_icon_background",
    "hud_top_active_hud_icon_button"
  ];

  const DEFAULT_LAYOUT = {
    version: LAYOUT_VERSION,
    coordinateSystem: COORDINATE_SYSTEM,
    stage: { width: DEFAULT_STAGE.width, height: DEFAULT_STAGE.height },
    elements: [
      { id: "hud_top_haiku_cosmos_logo", asset: "png/hud/hud_top_haiku_cosmos_logo.png", kind: "image", visible: true, x: 0, y: 0, width: 250, height: 77, scale: 1, opacity: 1, zIndex: 42, interactive: false, preserveAspect: true },
      { id: "hud_top_haiku_cosmos_settings", asset: "png/hud/hud_top_haiku_cosmos_settings.png", kind: "image", visible: true, x: 238, y: 8, width: 130, height: 63, scale: 1, opacity: 1, zIndex: 45, interactive: false, preserveAspect: true },
      { id: "hud_top_button_settings", asset: null, kind: "hitbox", visible: true, x: 238, y: 8, width: 130, height: 63, scale: 1, opacity: 1, zIndex: 145, interactive: true, debugPreview: true, preserveAspect: false, visualFor: "hud_top_haiku_cosmos_settings", interactiveRect: { id: "openSettings", role: "button" } },
      { id: "hud_top_haiku_cosmos_info", asset: "png/hud/hud_top_haiku_cosmos_info.png", kind: "image", visible: true, x: 436, y: 4, width: 320, height: 70, scale: 1, opacity: 1, zIndex: 25, interactive: false, preserveAspect: true, mountRole: "info" },
      { id: "hud_top_submeta", asset: "png/hud/hud_top_submeta.png", kind: "image", visible: true, x: 795, y: 0, width: 330, height: 63, scale: 1, opacity: 1, zIndex: 40, interactive: false, preserveAspect: true },
      { id: "hud_top_button_submeta", asset: null, kind: "hitbox", visible: true, x: 795, y: 0, width: 330, height: 63, scale: 1, opacity: 1, zIndex: 140, interactive: true, debugPreview: true, preserveAspect: false, visualFor: "hud_top_submeta", interactiveRect: { id: "openSubMeta", role: "button" } },
      // The old reservoir-named asset is kept as compatibility only; this rect is the future active-HUD-icon background, not final resource storage.
      { id: "hud_top_active_hud_icon_background", asset: "png/hud/hud_top_dust_pile.png", kind: "image", visible: true, x: 1286, y: 8, width: 158, height: 70, scale: 1, opacity: 1, zIndex: 31, interactive: false, preserveAspect: true, mountRole: "activeHudIconBackground", legacyIds: ["hud_top_dust_reservoir"] },
      { id: "hud_top_active_hud_icon_button", asset: null, kind: "hitbox", visible: false, x: 1286, y: 8, width: 158, height: 70, scale: 1, opacity: 1, zIndex: 142, interactive: true, debugPreview: true, preserveAspect: false, visualFor: "hud_top_active_hud_icon_background", interactiveRect: { id: "activeHudIconButton", role: "future-active-hud-icon" } },
      { id: "hud_top_dust_rp_background", asset: "png/hud/hud_top_dust_rp_background.png", kind: "image", visible: false, x: 1230, y: 1, width: 550, height: 70, scale: 1, opacity: 1, zIndex: 20, interactive: false, preserveAspect: false },
      { id: "hud_top_dust_pile", asset: null, kind: "hitbox", visible: true, x: 1469, y: 1, width: 77, height: 39, scale: 1, opacity: 1, zIndex: 32, interactive: false, debugPreview: true, preserveAspect: false, mountRole: "dustPile", interactiveRect: { id: "dustPile", role: "dust-pile-visual-rect" } },
      { id: "hud_top_dust_pile_button", asset: null, kind: "hitbox", visible: false, x: 1469, y: 1, width: 77, height: 39, scale: 1, opacity: 1, zIndex: 141, interactive: true, debugPreview: true, preserveAspect: false, visualFor: "hud_top_dust_pile", interactiveRect: { id: "dustPileButton", role: "future-dust-pile" } },
      { id: "hud_top_rp_background", asset: "png/hud/hud_top_rp.png", kind: "image", visible: true, x: 1620, y: 4, width: 220, height: 77, scale: 1, opacity: 1, zIndex: 35, interactive: false, preserveAspect: true, mountRole: "rpBackground" },
      { id: "hud_top_rp_value", asset: null, kind: "text", visible: true, x: 1732, y: 13, width: 68, height: 23, scale: 1, opacity: 1, zIndex: 80, interactive: false, preserveAspect: true, mountRole: "rpText" },
      { id: "hud_top_right", asset: "png/hud/hud_top_right.png", kind: "image", visible: true, x: 1780, y: 0, width: 140, height: 73, scale: 1, opacity: 1, zIndex: 10, interactive: false, preserveAspect: false }
    ]
  };

  let layout = cloneLayout(DEFAULT_LAYOUT);
  let stage = null;
  let layer = null;
  let rpText = null;
  let settingsPopup = null;
  let initialized = false;
  let selectedHudTopElement = "hud_top_button_submeta";
  let lastAction = "defaults";
  let lastError = "";
  let lastSettingsUrl = SETTINGS_PATH;

  function cloneLayout(source) { return JSON.parse(JSON.stringify(source)); }
  function publicAssetPath(path) { const h = root.HC && (root.HC.publicAssetPath || root.HC.publicPath); return typeof h === "function" ? h(path) : path; }
  function resolveSettingsUrl() { return publicAssetPath(SETTINGS_PATH); }
  function viewportSize() { return { width: Math.max(1, Number(root.innerWidth) || document.documentElement?.clientWidth || LEGACY_BASE_WIDTH), height: Math.max(1, Number(root.innerHeight) || document.documentElement?.clientHeight || DEFAULT_STAGE.height) }; }
  function clampNumber(value, min, max, fallback) { const x = Number(value); return Number.isFinite(x) ? Math.max(min, Math.min(max, x)) : fallback; }
  function isObject(value) { return value && typeof value === "object" && !Array.isArray(value); }
  function getStage(source = layout) {
    const width = clampNumber(source?.stage?.width ?? source?.root?.width ?? source?.designSize?.width, 320, 7680, DEFAULT_STAGE.width);
    const height = clampNumber(source?.stage?.height ?? source?.root?.height ?? source?.designSize?.height, 64, 2160, DEFAULT_STAGE.height);
    return { width, height };
  }
  function getStageScale() {
    const v = viewportSize();
    const s = getStage();
    return Math.max(0.05, Math.min(v.width / s.width, v.height / s.height));
  }
  function legacyPixelValue(candidate, normalizedKey, pixelKey, stageSize, legacyBase, fallback) {
    if (Number.isFinite(Number(candidate?.[pixelKey]))) return Number(candidate[pixelKey]);
    if (Number.isFinite(Number(candidate?.[normalizedKey]))) {
      const value = Number(candidate[normalizedKey]);
      return value <= 1 ? value * stageSize : value;
    }
    if (Number.isFinite(Number(candidate?.interactiveRect?.[pixelKey]))) return Number(candidate.interactiveRect[pixelKey]) * (stageSize / legacyBase);
    return fallback;
  }
  function normalizeElement(candidate, fallback, stageSize) {
    const c = isObject(candidate) ? candidate : {};
    const isLegacyNormalized = c.w !== undefined || c.h !== undefined || c.coordinateSystem === "viewport_normalized";
    const width = legacyPixelValue(c, "w", "width", stageSize.width, LEGACY_BASE_WIDTH, fallback.width);
    const height = legacyPixelValue(c, "h", "height", stageSize.height, LEGACY_BASE_HEIGHT, fallback.height);
    const x = legacyPixelValue(c, "x", "x", stageSize.width, LEGACY_BASE_WIDTH, fallback.x);
    const y = legacyPixelValue(c, "y", "y", stageSize.height, LEGACY_BASE_HEIGHT, fallback.y);
    const normalized = {
      ...fallback,
      ...c,
      id: fallback.id,
      asset: c.asset === null || fallback.asset === null ? null : String(c.asset || fallback.asset || "").replace(/^\/+/, "").replace(/^public\//, ""),
      kind: c.kind || c.type || fallback.kind || "image",
      visible: c.visible !== false,
      x: clampNumber(isLegacyNormalized ? x : x, -stageSize.width, stageSize.width * 2, fallback.x),
      y: clampNumber(isLegacyNormalized ? y : y, -stageSize.height, stageSize.height * 2, fallback.y),
      width: clampNumber(width, 0, stageSize.width * 2, fallback.width),
      height: clampNumber(height, 0, stageSize.height * 4, fallback.height),
      scale: clampNumber(c.scale, 0.05, 5, fallback.scale ?? 1),
      opacity: clampNumber(c.opacity, 0, 1, fallback.opacity ?? 1),
      zIndex: Math.round(clampNumber(c.zIndex, -1000, 10000, fallback.zIndex || 0)),
      interactive: c.interactive !== undefined ? c.interactive !== false : !!(c.interactiveRect || fallback.interactiveRect),
      preserveAspect: c.preserveAspect !== undefined ? c.preserveAspect !== false : fallback.preserveAspect !== false,
      debugPreview: c.debugPreview !== undefined ? c.debugPreview !== false : fallback.debugPreview === true,
      interactiveRect: c.interactiveRect || fallback.interactiveRect
    };
    delete normalized.w;
    delete normalized.h;
    delete normalized.type;
    return normalized;
  }
  function buildIncomingMap(candidate) {
    const byId = new Map();
    for (const item of Array.isArray(candidate?.elements) ? candidate.elements : []) {
      if (item?.id) byId.set(item.id, item);
    }
    if (!byId.has("hud_top_rp_background") && byId.has("hud_top_rp")) byId.set("hud_top_rp_background", byId.get("hud_top_rp"));
    if (!byId.has("hud_top_rp_value") && byId.has("hud_top_rp")) byId.set("hud_top_rp_value", byId.get("hud_top_rp"));
    if (!byId.has("hud_top_active_hud_icon_background") && byId.has("hud_top_dust_reservoir")) byId.set("hud_top_active_hud_icon_background", byId.get("hud_top_dust_reservoir"));
    return byId;
  }
  function sanitizeLayout(candidate) {
    const stageSize = getStage(candidate);
    const byId = buildIncomingMap(candidate);
    const next = {
      version: LAYOUT_VERSION,
      coordinateSystem: COORDINATE_SYSTEM,
      stage: stageSize,
      elements: DEFAULT_LAYOUT.elements.map((fallback) => normalizeElement(byId.get(fallback.id), fallback, stageSize))
    };
    for (const item of next.elements) {
      if (item.visualFor) {
        const visual = next.elements.find((candidateElement) => candidateElement.id === item.visualFor);
        if (visual && !byId.has(item.id)) {
          item.x = visual.x; item.y = visual.y; item.width = visual.width; item.height = visual.height; item.scale = visual.scale;
        }
      }
    }
    return next;
  }
  function validateLayoutPayload(candidate) {
    if (!isObject(candidate)) throw new Error("HUD top layout must be a JSON object");
    if (!Array.isArray(candidate.elements)) throw new Error("HUD top layout elements must be an array");
    const migrated = sanitizeLayout(candidate);
    const stageSize = getStage(migrated);
    if (!Number.isFinite(stageSize.width) || !Number.isFinite(stageSize.height)) throw new Error("HUD top layout stage is invalid");
    const ids = new Set(migrated.elements.map((item) => item?.id).filter(Boolean));
    for (const id of REQUIRED_IDS) if (!ids.has(id)) throw new Error(`HUD top layout is missing element after migration: ${id}`);
    for (const item of candidate.elements) {
      if (!isObject(item) || !item.id) throw new Error("Every HUD top element must have an id");
      for (const field of ["x", "y"]) if (item[field] !== undefined && !Number.isFinite(Number(item[field]))) throw new Error(`HUD top element ${item.id} has invalid ${field}`);
      const hasWidth = item.width === undefined || Number.isFinite(Number(item.width));
      const hasLegacyWidth = item.w === undefined || Number.isFinite(Number(item.w));
      const hasHeight = item.height === undefined || Number.isFinite(Number(item.height));
      const hasLegacyHeight = item.h === undefined || Number.isFinite(Number(item.h));
      if (!hasWidth || !hasLegacyWidth || !hasHeight || !hasLegacyHeight) throw new Error(`HUD top element ${item.id} has invalid width/height`);
    }
    return true;
  }
  function getElement(id) { return layout.elements.find((e) => e.id === id) || null; }
  function stageRect(el) { const scale = getStageScale(); const itemScale = clampNumber(el.scale, 0.05, 5, 1); return { x: el.x * scale, y: el.y * scale, width: el.width * itemScale * scale, height: el.height * itemScale * scale }; }
  function mountFor(role) { const el = layout.elements.find((item) => item.mountRole === role) || null; return el ? stageRect(el) : null; }
  function shouldShowDebugPreview() { return root.HC?.Session?.mode === "debug" || root.HC?.Session?.debugConfig?.mode === "debug" || document.getElementById("debugBadge")?.hidden === false; }
  function ensureNode(el) {
    if (el.kind === "text") return rpText;
    let node = layer.querySelector(`[data-hud-top-element-id="${el.id}"]`);
    if (!node) {
      node = document.createElement(el.interactive || el.kind === "hitbox" ? "button" : "img");
      node.dataset.hudTopElementId = el.id;
      if (node.tagName === "BUTTON") { node.type = "button"; node.addEventListener("click", onElementClick); }
      else { node.alt = ""; node.draggable = false; }
      layer.appendChild(node);
    }
    return node;
  }
  function onElementClick(event) {
    const el = getElement(event.currentTarget?.dataset?.hudTopElementId);
    if (!el?.interactive) return;
    if (el?.interactiveRect?.id === "openSubMeta") openSubMeta();
    if (el?.interactiveRect?.id === "openSettings") toggleSettingsPopup(el);
  }
  function applyLayout() {
    if (!stage || !layer) return;
    const scale = getStageScale();
    const s = getStage();
    stage.style.width = `${s.width * scale}px`;
    stage.style.height = `${s.height * scale}px`;
    stage.style.transform = "none";
    stage.style.pointerEvents = "none";
    for (const el of layout.elements) {
      if (el.kind === "text") continue;
      const node = ensureNode(el);
      const r = stageRect(el);
      const isHitbox = el.kind === "hitbox";
      node.className = `hud-top-layer hud-top-layer--${el.interactive ? "button" : "image"}${isHitbox ? " hud-top-layer--hitbox" : ""}${isHitbox && el.debugPreview && shouldShowDebugPreview() ? " is-debug-preview" : ""}`;
      if (node.tagName === "IMG") { node.src = publicAssetPath(el.asset); node.style.objectFit = el.preserveAspect ? "contain" : "fill"; }
      else if (el.asset) { node.style.backgroundImage = `url("${publicAssetPath(el.asset)}")`; node.style.backgroundSize = el.preserveAspect ? "contain" : "100% 100%"; }
      else { node.style.backgroundImage = "none"; node.style.backgroundSize = "auto"; }
      node.style.left = `${r.x}px`; node.style.top = `${r.y}px`; node.style.width = `${r.width}px`; node.style.height = `${r.height}px`; node.style.transform = "none";
      node.style.opacity = String(el.opacity);
      node.style.zIndex = String(el.zIndex);
      node.hidden = !el.visible;
      node.setAttribute("aria-label", el.id);
    }
    if (rpText) {
      const rpEl = getElement("hud_top_rp_value");
      const r = mountFor("rpText") || stageRect(rpEl || getElement("hud_top_rp_background") || DEFAULT_LAYOUT.elements[11]);
      rpText.style.left = `${r.x}px`;
      rpText.style.top = `${r.y}px`;
      rpText.style.fontSize = `${Math.max(10, Math.min(r.width, r.height))}px`;
      rpText.style.opacity = String(rpEl?.opacity ?? 1);
      rpText.style.zIndex = String(rpEl?.zIndex ?? 80);
      rpText.hidden = rpEl?.visible === false;
    }
  }
  function openSubMeta() { const World = (root.HC.getWorld && root.HC.getWorld()) || root.World; if (World && !World.subMetaOpen) { World.subMetaOpen = true; World.paused = true; } }
  function toggleSettingsPopup(el) { if (!settingsPopup) settingsPopup = document.getElementById("hudTopSettingsPopup"); if (!settingsPopup) return; const r = stageRect(el); settingsPopup.hidden = !settingsPopup.hidden; settingsPopup.style.left = `${Math.max(8, r.x)}px`; settingsPopup.style.top = `${r.y + r.height + 8}px`; updateSettingsPanel(); }
  function updateSettingsPanel() { const alias = root.HC.PlayerAlias || "—"; const aliasNode = document.getElementById("hudActiveAlias"); if (aliasNode) aliasNode.textContent = alias; const renderer = document.getElementById("hudRendererMode"); if (renderer) renderer.value = root.HC.RENDER_MODE === "canvas2d" ? "canvas2d" : "three"; }
  async function exportSaveFromHud() { const status = document.getElementById("hudSettingsStatus"); if (!root.HC?.SaveSystem?.exportToDownload) { if (status) status.textContent = "System zapisu nie został załadowany."; return; } try { await root.HC.SaveSystem.exportToDownload(root.HC.PlayerAlias || ""); if (status) status.textContent = "Save pobrany."; } catch (error) { if (status) status.textContent = error?.message || "Nie udało się zapisać gry."; console.warn("[HC.SaveSystem] HUD export failed", error); } }
  async function importSaveFromHud(file) { const status = document.getElementById("hudSettingsStatus"); if (!root.HC?.SaveSystem?.importFile) { if (status) status.textContent = "System zapisu nie został załadowany."; return; } try { await root.HC.SaveSystem.importFile(root.HC.PlayerAlias || "", file); if (status) status.textContent = "Save wczytany."; } catch (error) { if (status) status.textContent = root.HC.SaveSystem?.ERROR_MESSAGE || String(error?.message || error); console.warn("[HC.SaveSystem] HUD import failed", error); } }
  async function loadRuntimeLayout() {
    const logicalPath = SETTINGS_PATH;
    const resolvedUrl = resolveSettingsUrl();
    lastSettingsUrl = resolvedUrl;
    let status = null;
    try {
      const res = await fetch(resolvedUrl, { cache: "no-store" });
      status = res.status;
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`.trim());
      const payload = await res.json();
      validateLayoutPayload(payload);
      layout = sanitizeLayout(payload);
      lastAction = `loaded ${logicalPath}`;
      lastError = "";
      console.info("[HC.HudTopLayout] settings loaded successfully", { logicalPath, resolvedUrl, status, fallbackUsed: false });
    } catch (error) {
      layout = cloneLayout(DEFAULT_LAYOUT);
      lastAction = "settings fallback";
      lastError = String(error?.message || error);
      console.warn("[HC.HudTopLayout] settings load failed; fallback used", { logicalPath, resolvedUrl, status, fallbackUsed: true, error });
    }
    applyLayout();
  }
  function setLayout(next) { layout = sanitizeLayout(next); if (!layout.elements.some((item) => item.id === selectedHudTopElement)) selectedHudTopElement = layout.elements[0]?.id || ""; lastError = ""; applyLayout(); return getLayout(); }
  function getLayout() { const out = cloneLayout(layout); out.stageScale = getStageScale(); out.rpMountRect = mountFor("rpText"); out.rpBackgroundMountRect = mountFor("rpBackground"); out.dustPileMountRect = mountFor("dustPile"); out.activeHudIconMountRect = mountFor("activeHudIconBackground"); return out; }
  function resetLayout() { lastAction = "reset settings defaults"; void loadRuntimeLayout(); return getLayout(); }
  function importLayout(raw) {
    try {
      const payload = typeof raw === "string" ? JSON.parse(raw || "{}") : raw;
      validateLayoutPayload(payload);
      setLayout(payload);
      lastAction = "imported JSON runtime override";
      lastError = "";
      return true;
    } catch (error) {
      lastAction = "import failed";
      lastError = String(error?.message || error);
      console.warn("[HC.HudTopLayout] JSON import failed", error);
      return false;
    }
  }
  function getExportJson() { return `${JSON.stringify({ version: layout.version, coordinateSystem: layout.coordinateSystem, stage: layout.stage, elements: layout.elements }, null, 2)}\n`; }
  function setRpValue(value) { if (rpText) rpText.textContent = String(Math.max(0, Math.min(9999, Math.floor(Number(value) || 0)))); }
  function init() { if (initialized) return; stage = document.getElementById("hudTopStage"); layer = document.getElementById("hudTopLayer"); rpText = document.getElementById("scoreLabel"); settingsPopup = document.getElementById("hudTopSettingsPopup"); if (!stage || !layer || !rpText) return; initialized = true; root.addEventListener("resize", applyLayout); document.getElementById("hudTopSettingsClose")?.addEventListener("click", () => { settingsPopup.hidden = true; }); document.getElementById("hudSaveGame")?.addEventListener("click", exportSaveFromHud); document.getElementById("hudLoadGame")?.addEventListener("click", () => document.getElementById("hudSaveFileInput")?.click()); document.getElementById("hudSaveFileInput")?.addEventListener("change", (e) => { const file = e.target.files?.[0]; if (file) void importSaveFromHud(file); e.target.value = ""; }); document.getElementById("hudRendererMode")?.addEventListener("change", (e) => { const mode = e.target.value === "canvas2d" ? "canvas2d" : "three"; root.HC.RENDER_MODE = mode; root.HC.WorldRenderer?.setMode?.(mode); updateSettingsPanel(); }); void loadRuntimeLayout(); }
  function updateField(field, raw) { const el = getElement(selectedHudTopElement); if (!el) return false; if (field === "visible" || field === "preserveAspect" || field === "interactive" || field === "debugPreview") el[field] = !!raw; else if (field === "zIndex") el[field] = Math.round(Number(raw)); else el[field] = Number(raw); setLayout(layout); lastAction = `edited ${selectedHudTopElement}.${field}`; return true; }
  function escapeHtml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
  function renderDebugHtml(options = {}) {
    const selected = getElement(selectedHudTopElement) || layout.elements[0];
    const opts = layout.elements.map((e) => `<option value="${escapeHtml(e.id)}"${e.id === selected.id ? " selected" : ""}>${escapeHtml(e.id)}</option>`).join("");
    const row = (label, field, min, max, step) => `<label class="hud-top-debug-row"><span>${label}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${Number(selected[field] ?? 0).toFixed(step < 1 ? 3 : 0)}" data-hud-top-field="${field}"></label>`;
    const px = stageRect(selected);
    const s = getStage();
    return `<details class="hud-top-debug overlay-collapsible" data-runtime-debug-section="hud-top-layout"${options.open === false ? "" : " open"}><summary>HUD Top Layout</summary><div class="overlay-grid">
      <div class="overlay-row"><span class="k">coordinateSystem</span><span class="v">${COORDINATE_SYSTEM}</span></div><div class="overlay-row"><span class="k">stage</span><span class="v">${Math.round(s.width)}×${Math.round(s.height)} @ ${getStageScale().toFixed(4)}</span></div>
      <label class="hud-top-debug-row"><span>element</span><select data-hud-top-action="select">${opts}</select></label>${row("x", "x", -s.width, s.width * 2, 1)}${row("y", "y", -s.height, s.height * 2, 1)}${row("width", "width", 0, s.width * 2, 1)}${row("height", "height", 0, s.height * 4, 1)}${row("scale", "scale", 0.05, 5, 0.01)}${row("opacity", "opacity", 0, 1, 0.01)}${row("zIndex", "zIndex", -1000, 10000, 1)}
      <label class="hud-top-debug-row"><span>visible</span><input type="checkbox" data-hud-top-field="visible"${selected.visible ? " checked" : ""}></label><label class="hud-top-debug-row"><span>interactive</span><input type="checkbox" data-hud-top-field="interactive"${selected.interactive ? " checked" : ""}></label><label class="hud-top-debug-row"><span>debugPreview</span><input type="checkbox" data-hud-top-field="debugPreview"${selected.debugPreview ? " checked" : ""}></label><label class="hud-top-debug-row"><span>preserveAspect</span><input type="checkbox" data-hud-top-field="preserveAspect"${selected.preserveAspect ? " checked" : ""}></label>
      <div class="overlay-row"><span class="k">selected viewport px</span><code class="v">${Math.round(px.x)}, ${Math.round(px.y)}, ${Math.round(px.width)}×${Math.round(px.height)}</code></div><textarea class="overlay-note hud-top-json" data-hud-top-json>${escapeHtml(getExportJson())}</textarea><div class="hud-top-debug-actions"><button class="overlay-btn" type="button" data-hud-top-action="export">Export JSON</button><button class="overlay-btn" type="button" data-hud-top-action="import">Import JSON</button><button class="overlay-btn" type="button" data-hud-top-action="reset">Reset defaults</button></div><div class="overlay-row"><span class="k">settings source</span><code class="v">${escapeHtml(lastSettingsUrl || SETTINGS_PATH)}</code></div><div class="overlay-row"><span class="k">last action</span><code class="v">${escapeHtml(lastAction)}</code></div>${lastError ? `<div class="overlay-row"><span class="k">last error</span><code class="v">${escapeHtml(lastError)}</code></div>` : ""}</div></details>`;
  }
  function handleDebugControl(target) { if (!target) return false; const action = target.dataset?.hudTopAction; const field = target.dataset?.hudTopField; if (action === "select") { selectedHudTopElement = target.value; return true; } if (field) return updateField(field, target.type === "checkbox" ? target.checked : target.value); const textarea = target.closest(".hud-top-debug")?.querySelector("[data-hud-top-json]"); if (action === "export") { if (textarea) textarea.value = getExportJson(); lastAction = "exported JSON"; } else if (action === "import") importLayout(textarea?.value || "{}"); else if (action === "reset") resetLayout(); else return false; return true; }
  function getDebugState() { return { enabled: true, coordinateSystem: COORDINATE_SYSTEM, stage: getStage(), stageScale: getStageScale(), elementsCount: layout.elements.length, selectedHudTopElement, dustPileMountRect: mountFor("dustPile"), activeHudIconMountRect: mountFor("activeHudIconBackground"), rpMountRect: mountFor("rpText"), rpBackgroundMountRect: mountFor("rpBackground"), lastAction, lastError }; }

  root.HC.HudTopLayout = { LAYOUT_VERSION, COORDINATE_SYSTEM, STORAGE_KEY, LEGACY_STORAGE_KEY, SETTINGS_PATH, REQUIRED_IDS, DEFAULT_LAYOUT: cloneLayout(DEFAULT_LAYOUT), init, getLayout, setLayout, resetLayout, importLayout, getExportJson, setRpValue, renderDebugHtml, handleDebugControl, sanitizeLayout, validateLayoutPayload, getDebugState };
})(window);
