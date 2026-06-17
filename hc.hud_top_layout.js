// Haiku Cosmos layered top HUD PNG overlay and debug-editable normalized viewport layout.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const LAYOUT_VERSION = 2;
  const COORDINATE_SYSTEM = "viewport_normalized";
  const STORAGE_KEY = "hc.hudTopLayout.v2.normalized";
  const LEGACY_STORAGE_KEY = "hc.hudTopLayout.v2";
  const SETTINGS_PATH = "settings/hud-top-layout.json";
  const LEGACY_BASE_WIDTH = 1920;
  const LEGACY_BASE_HEIGHT = 403;
  const REQUIRED_IDS = [
    "hud_top_right", "hud_top_rp", "hud_top_submeta", "hud_top_haiku_cosmos_settings",
    "hud_top_haiku_cosmos_logo", "hud_top_haiku_cosmos_info", "hud_top_dust_rp_background", "hud_top_dust_pile"
  ];
  const DEFAULT_LAYOUT = {
    version: LAYOUT_VERSION,
    coordinateSystem: COORDINATE_SYSTEM,
    legacyReference: { baseWidth: LEGACY_BASE_WIDTH, baseHeight: LEGACY_BASE_HEIGHT },
    elements: [
      { id: "hud_top_right", asset: "png/hud/hud_top_right.png", x: 0.755208, y: 0, w: 0.244792, h: 1, zIndex: 10, visible: true, interactive: false, preserveAspect: false },
      { id: "hud_top_dust_rp_background", asset: "png/hud/hud_top_dust_rp_background.png", x: 0.692708, y: 0.034739, w: 0.223958, h: 0.471464, zIndex: 20, visible: true, interactive: false, preserveAspect: false },
      { id: "hud_top_rp", asset: "png/hud/hud_top_rp.png", x: 0.804688, y: 0.203474, w: 0.114583, h: 0.198511, zIndex: 35, visible: true, interactive: false, preserveAspect: true, mountRole: "rpText" },
      { id: "hud_top_dust_pile", asset: "png/hud/hud_top_dust_pile.png", x: 0.723958, y: 0.129032, w: 0.09375, h: 0.44665, zIndex: 32, visible: true, interactive: true, preserveAspect: true, mountRole: "dustPile", interactiveRect: { id: "dustPile", role: "dust-pile" } },
      { id: "hud_top_submeta", asset: "png/hud/hud_top_submeta.png", x: 0.414062, y: 0, w: 0.171875, h: 0.421836, zIndex: 40, visible: true, interactive: true, preserveAspect: true, interactiveRect: { id: "openSubMeta", role: "button" } },
      { id: "hud_top_haiku_cosmos_info", asset: "png/hud/hud_top_haiku_cosmos_info.png", x: 0.223958, y: 0.014888, w: 0.1875, h: 0.347395, zIndex: 25, visible: true, interactive: false, preserveAspect: true, mountRole: "info" },
      { id: "hud_top_haiku_cosmos_logo", asset: "png/hud/hud_top_haiku_cosmos_logo.png", x: 0.020833, y: 0, w: 0.130208, h: 0.397022, zIndex: 42, visible: true, interactive: true, preserveAspect: true, interactiveRect: { id: "openSettings", role: "button" } },
      { id: "hud_top_haiku_cosmos_settings", asset: "png/hud/hud_top_haiku_cosmos_settings.png", x: 0.155208, y: 0.024814, w: 0.067708, h: 0.322581, zIndex: 45, visible: true, interactive: true, preserveAspect: true, interactiveRect: { id: "openSettings", role: "button" } }
    ]
  };
  let layout = cloneLayout(DEFAULT_LAYOUT);
  let stage = null, layer = null, rpText = null, settingsPopup = null, initialized = false, selectedHudTopElement = "hud_top_submeta", lastAction = "defaults";

  function cloneLayout(source) { return JSON.parse(JSON.stringify(source)); }
  function publicAssetPath(path) { const h = root.HC && (root.HC.publicAssetPath || root.HC.publicPath); return typeof h === "function" ? h(path) : path; }
  function resolveSettingsUrl() {
    return publicAssetPath(SETTINGS_PATH);
  }
  function viewportSize() { return { width: Math.max(1, Number(root.innerWidth) || document.documentElement?.clientWidth || LEGACY_BASE_WIDTH), height: Math.max(1, Number(root.innerHeight) || document.documentElement?.clientHeight || LEGACY_BASE_HEIGHT) }; }
  function clampNumber(value, min, max, fallback) { const x = Number(value); return Number.isFinite(x) ? Math.max(min, Math.min(max, x)) : fallback; }
  function normalize01(value, fallback) { return clampNumber(value, 0, 1, fallback); }
  function legacyDimension(candidate, axis, fallback) {
    const base = axis === "x" ? LEGACY_BASE_WIDTH : LEGACY_BASE_HEIGHT;
    if (Number.isFinite(Number(candidate?.[axis === "x" ? "width" : "height"]))) return Number(candidate[axis === "x" ? "width" : "height"]) / base;
    if (Number.isFinite(Number(candidate?.[axis === "x" ? "w" : "h"]))) return Number(candidate[axis === "x" ? "w" : "h"]);
    if (Number.isFinite(Number(candidate?.interactiveRect?.[axis === "x" ? "width" : "height"]))) return Number(candidate.interactiveRect[axis === "x" ? "width" : "height"]) / base;
    return fallback;
  }
  function normalizeElement(candidate, fallback) {
    const c = candidate && typeof candidate === "object" ? candidate : {};
    const isLegacyPx = c.scale !== undefined || Number(c.x) > 1 || Number(c.y) > 1;
    const x = isLegacyPx ? Number(c.x || 0) / LEGACY_BASE_WIDTH : c.x;
    const y = isLegacyPx ? Number(c.y || 0) / LEGACY_BASE_HEIGHT : c.y;
    return {
      ...fallback,
      ...c,
      id: fallback.id,
      asset: String(c.asset || fallback.asset).replace(/^\/+/, "").replace(/^public\//, ""),
      x: normalize01(x, fallback.x),
      y: normalize01(y, fallback.y),
      w: normalize01(isLegacyPx ? legacyDimension(c, "x", fallback.w) : c.w, fallback.w),
      h: normalize01(isLegacyPx ? legacyDimension(c, "y", fallback.h) : c.h, fallback.h),
      zIndex: Math.round(clampNumber(c.zIndex, -1000, 10000, fallback.zIndex || 0)),
      visible: c.visible !== false,
      interactive: c.interactive !== undefined ? c.interactive !== false : !!(c.interactiveRect || fallback.interactiveRect),
      preserveAspect: c.preserveAspect !== undefined ? c.preserveAspect !== false : fallback.preserveAspect !== false,
      interactiveRect: c.interactiveRect || fallback.interactiveRect
    };
  }
  function sanitizeLayout(candidate) {
    const byId = new Map((candidate?.elements || []).map((e) => [e?.id, e]));
    return { version: LAYOUT_VERSION, coordinateSystem: COORDINATE_SYSTEM, legacyReference: { baseWidth: LEGACY_BASE_WIDTH, baseHeight: LEGACY_BASE_HEIGHT }, elements: DEFAULT_LAYOUT.elements.map((fallback) => normalizeElement(byId.get(fallback.id), fallback)) };
  }
  function getElement(id) { return layout.elements.find((e) => e.id === id) || null; }
  function screenRect(el) { const v = viewportSize(); return { x: el.x * v.width, y: el.y * v.height, width: el.w * v.width, height: el.h * v.height }; }
  function mountFor(role) { const el = layout.elements.find((item) => item.mountRole === role) || null; return el ? screenRect(el) : null; }
  function ensureNode(el) {
    let node = layer.querySelector(`[data-hud-top-element-id="${el.id}"]`);
    if (!node) {
      node = document.createElement(el.interactive ? "button" : "img");
      node.dataset.hudTopElementId = el.id;
      if (node.tagName === "BUTTON") { node.type = "button"; node.addEventListener("click", onElementClick); }
      else { node.alt = ""; node.draggable = false; }
      layer.appendChild(node);
    }
    return node;
  }
  function onElementClick(event) { const el = getElement(event.currentTarget?.dataset?.hudTopElementId); if (el?.interactiveRect?.id === "openSubMeta") openSubMeta(); if (el?.interactiveRect?.id === "openSettings") toggleSettingsPopup(el); }
  function applyLayout() {
    if (!stage || !layer) return;
    const v = viewportSize();
    stage.style.width = `${v.width}px`; stage.style.height = `${v.height}px`; stage.style.transform = "none"; stage.style.pointerEvents = "none";
    for (const el of layout.elements) {
      const node = ensureNode(el); const r = screenRect(el);
      node.className = `hud-top-layer hud-top-layer--${el.interactive ? "button" : "image"}`;
      if (node.tagName === "IMG") { node.src = publicAssetPath(el.asset); node.style.objectFit = el.preserveAspect ? "contain" : "fill"; }
      else { node.style.backgroundImage = `url("${publicAssetPath(el.asset)}")`; node.style.backgroundSize = el.preserveAspect ? "contain" : "100% 100%"; }
      node.style.left = `${r.x}px`; node.style.top = `${r.y}px`; node.style.width = `${r.width}px`; node.style.height = `${r.height}px`; node.style.transform = "none";
      node.style.zIndex = String(el.zIndex); node.hidden = !el.visible; node.setAttribute("aria-label", el.id);
    }
    if (rpText) {
      const r = mountFor("rpText") || screenRect(getElement("hud_top_rp") || DEFAULT_LAYOUT.elements[2]);
      rpText.style.left = `${r.x + r.width * 0.54}px`; rpText.style.top = `${r.y + r.height * 0.46}px`; rpText.style.fontSize = `${Math.max(14, Math.min(r.width, r.height) * 0.48)}px`; rpText.style.zIndex = "80";
    }
  }
  function openSubMeta() { const World = (root.HC.getWorld && root.HC.getWorld()) || root.World; if (World && !World.subMetaOpen) { World.subMetaOpen = true; World.paused = true; } }
  function toggleSettingsPopup(el) { if (!settingsPopup) settingsPopup = document.getElementById("hudTopSettingsPopup"); if (!settingsPopup) return; const r = screenRect(el); settingsPopup.hidden = !settingsPopup.hidden; settingsPopup.style.left = `${Math.max(8, r.x)}px`; settingsPopup.style.top = `${r.y + r.height + 8}px`; updateSettingsPanel(); }

  function updateSettingsPanel() {
    const alias = root.HC.PlayerAlias || "—";
    const aliasNode = document.getElementById("hudActiveAlias"); if (aliasNode) aliasNode.textContent = alias;
    const renderer = document.getElementById("hudRendererMode"); if (renderer) renderer.value = root.HC.RENDER_MODE === "canvas2d" ? "canvas2d" : "three";
  }
  async function exportSaveFromHud() {
    const status = document.getElementById("hudSettingsStatus");
    try { await root.HC.SaveSystem.exportToDownload(root.HC.PlayerAlias || ""); if (status) status.textContent = "Save pobrany."; }
    catch (error) { if (status) status.textContent = error?.message || "Nie udało się zapisać gry."; console.warn("[HC.SaveSystem] HUD export failed", error); }
  }
  async function importSaveFromHud(file) {
    const status = document.getElementById("hudSettingsStatus");
    try { await root.HC.SaveSystem.importFile(root.HC.PlayerAlias || "", file); if (status) status.textContent = "Save wczytany."; }
    catch (error) { if (status) status.textContent = root.HC.SaveSystem?.ERROR_MESSAGE || String(error?.message || error); console.warn("[HC.SaveSystem] HUD import failed", error); }
  }

  async function loadRuntimeLayout() {
    const logicalPath = SETTINGS_PATH;
    const resolvedUrl = resolveSettingsUrl();
    let status = null;
    try {
      const res = await fetch(resolvedUrl, { cache: "no-store" });
      status = res.status;
      if (res.ok) {
        layout = sanitizeLayout(await res.json());
        lastAction = `loaded ${logicalPath}`;
        console.info("[HC.HudTopLayout] settings loaded successfully", { logicalPath, resolvedUrl, status, fallbackUsed: false });
      } else {
        lastAction = "settings fallback";
        console.warn("[HC.HudTopLayout] settings fetch failed; fallback used", { logicalPath, resolvedUrl, status, fallbackUsed: true });
      }
    } catch (error) {
      lastAction = "settings fallback";
      console.warn("[HC.HudTopLayout] settings load failed; fallback used", { logicalPath, resolvedUrl, status, fallbackUsed: true, error });
    }
    applyLayout();
  }
  function setLayout(next) { layout = sanitizeLayout(next); applyLayout(); return getLayout(); }
  function getLayout() { const out = cloneLayout(layout); out.rpMountRect = mountFor("rpText"); out.dustPileMountRect = mountFor("dustPile"); return out; }
  function resetLayout() { layout = cloneLayout(DEFAULT_LAYOUT); lastAction = "reset fallback defaults"; void loadRuntimeLayout(); applyLayout(); return getLayout(); }
  function importLayout(raw) { lastAction = "imported JSON"; return setLayout(JSON.parse(String(raw || "{}"))); }
  function getExportJson() { return `${JSON.stringify(layout, null, 2)}\n`; }
  function setRpValue(value) { if (rpText) rpText.textContent = String(Math.max(0, Math.min(9999, Math.floor(Number(value) || 0)))); }
  function init() { if (initialized) return; stage = document.getElementById("hudTopStage"); layer = document.getElementById("hudTopLayer"); rpText = document.getElementById("scoreLabel"); settingsPopup = document.getElementById("hudTopSettingsPopup"); if (!stage || !layer || !rpText) return; initialized = true; root.addEventListener("resize", applyLayout); document.getElementById("hudTopSettingsClose")?.addEventListener("click", () => { settingsPopup.hidden = true; }); document.getElementById("hudSaveGame")?.addEventListener("click", exportSaveFromHud); document.getElementById("hudLoadGame")?.addEventListener("click", () => document.getElementById("hudSaveFileInput")?.click()); document.getElementById("hudSaveFileInput")?.addEventListener("change", (e) => { const file = e.target.files?.[0]; if (file) void importSaveFromHud(file); e.target.value = ""; }); document.getElementById("hudRendererMode")?.addEventListener("change", (e) => { const mode = e.target.value === "canvas2d" ? "canvas2d" : "three"; root.HC.RENDER_MODE = mode; root.HC.WorldRenderer?.setMode?.(mode); updateSettingsPanel(); }); void loadRuntimeLayout(); }
  function updateField(field, raw) { const el = getElement(selectedHudTopElement); if (!el) return false; if (field === "visible" || field === "preserveAspect") el[field] = !!raw; else el[field] = field === "zIndex" ? Math.round(Number(raw)) : Number(raw); setLayout(layout); return true; }
  function renderDebugHtml(options = {}) {
    const selected = getElement(selectedHudTopElement) || layout.elements[0]; const opts = layout.elements.map((e) => `<option value="${e.id}"${e.id === selected.id ? " selected" : ""}>${e.id}</option>`).join("");
    const row = (label, field, min, max, step) => `<label class="hud-top-debug-row"><span>${label}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${selected[field]}" data-hud-top-field="${field}"></label>`;
    const px = screenRect(selected);
    return `<details class="hud-top-debug overlay-collapsible" data-runtime-debug-section="hud-top-layout"${options.open === false ? "" : " open"}><summary>HUD Top Layout</summary><div class="overlay-grid">
      <div class="overlay-row"><span class="k">coordinateSystem</span><span class="v">${COORDINATE_SYSTEM}</span></div><div class="overlay-row"><span class="k">viewport px</span><span class="v">${Math.round(viewportSize().width)}×${Math.round(viewportSize().height)}</span></div>
      <label class="hud-top-debug-row"><span>element</span><select data-hud-top-action="select">${opts}</select></label>${row("x", "x", 0, 1, 0.001)}${row("y", "y", 0, 1, 0.001)}${row("w", "w", 0, 1, 0.001)}${row("h", "h", 0, 1, 0.001)}${row("zIndex", "zIndex", -1000, 10000, 1)}
      <label class="hud-top-debug-row"><span>visible</span><input type="checkbox" data-hud-top-field="visible"${selected.visible ? " checked" : ""}></label><label class="hud-top-debug-row"><span>preserveAspect</span><input type="checkbox" data-hud-top-field="preserveAspect"${selected.preserveAspect ? " checked" : ""}></label>
      <div class="overlay-row"><span class="k">selected px</span><code class="v">${Math.round(px.x)}, ${Math.round(px.y)}, ${Math.round(px.width)}×${Math.round(px.height)}</code></div><textarea class="overlay-note hud-top-json" data-hud-top-json>${getExportJson().replaceAll("&","&amp;").replaceAll("<","&lt;")}</textarea><div class="hud-top-debug-actions"><button class="overlay-btn" type="button" data-hud-top-action="export">Export JSON</button><button class="overlay-btn" type="button" data-hud-top-action="import">Import JSON</button><button class="overlay-btn" type="button" data-hud-top-action="reset">Reset defaults</button></div><div class="overlay-row"><span class="k">settings source</span><code class="v">${SETTINGS_PATH}</code></div><div class="overlay-row"><span class="k">last action</span><code class="v">${lastAction}</code></div></div></details>`;
  }
  function handleDebugControl(target) { if (!target) return false; const action = target.dataset?.hudTopAction; const field = target.dataset?.hudTopField; if (action === "select") { selectedHudTopElement = target.value; return true; } if (field) return updateField(field, target.type === "checkbox" ? target.checked : target.value); if (action === "export") { const textarea = target.closest(".hud-top-debug")?.querySelector("[data-hud-top-json]"); if (textarea) textarea.value = getExportJson(); lastAction = "exported JSON"; } else if (action === "import") importLayout(target.closest(".hud-top-debug")?.querySelector("[data-hud-top-json]")?.value || "{}"); else if (action === "reset") resetLayout(); else return false; return true; }
  function getDebugState() { return { enabled: true, coordinateSystem: COORDINATE_SYSTEM, viewport: viewportSize(), elementsCount: layout.elements.length, selectedHudTopElement, dustPileMountRect: mountFor("dustPile"), rpMountRect: mountFor("rpText") }; }

  root.HC.HudTopLayout = { LAYOUT_VERSION, COORDINATE_SYSTEM, STORAGE_KEY, SETTINGS_PATH, REQUIRED_IDS, DEFAULT_LAYOUT: cloneLayout(DEFAULT_LAYOUT), init, getLayout, setLayout, resetLayout, importLayout, getExportJson, setRpValue, renderDebugHtml, handleDebugControl, sanitizeLayout, getDebugState };
})(window);
