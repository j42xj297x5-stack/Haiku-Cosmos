// Haiku Cosmos layered top HUD PNG overlay and debug-editable DOM layout.
(function (root) {
  "use strict";

  root.HC = root.HC || {};

  const LAYOUT_VERSION = 2;
  const STORAGE_KEY = "hc.hudTopLayout.v2";
  const SETTINGS_PATH = "settings/hud-top-layout.json";
  const BASE_WIDTH = 1920;
  const BASE_HEIGHT = 403;
  const REQUIRED_IDS = [
    "hud_top_right", "hud_top_rp", "hud_top_submeta", "hud_top_haiku_cosmos_settings",
    "hud_top_haiku_cosmos_logo", "hud_top_haiku_cosmos_info", "hud_top_dust_rp_background", "hud_top_dust_pile"
  ];
  const DEFAULT_LAYOUT = {
    baseWidth: BASE_WIDTH,
    baseHeight: BASE_HEIGHT,
    elements: [
      { id: "hud_top_right", asset: "png/hud/hud_top_right.png", x: 1450, y: 0, scale: 1, zIndex: 10, visible: true },
      { id: "hud_top_dust_rp_background", asset: "png/hud/hud_top_dust_rp_background.png", x: 1330, y: 14, scale: 1, zIndex: 20, visible: true },
      { id: "hud_top_rp", asset: "png/hud/hud_top_rp.png", x: 1545, y: 82, scale: 1, zIndex: 35, visible: true, mountRole: "rpText" },
      { id: "hud_top_dust_pile", asset: "png/hud/hud_top_dust_pile.png", x: 1390, y: 52, scale: 1, zIndex: 32, visible: true, mountRole: "dustPile", interactiveRect: { id: "dustPile", role: "dust-pile", x: 0, y: 0, width: 180, height: 180 } },
      { id: "hud_top_submeta", asset: "png/hud/hud_top_submeta.png", x: 795, y: 0, scale: 1, zIndex: 40, visible: true, interactiveRect: { id: "openSubMeta", role: "button", x: 0, y: 0, width: 330, height: 170 } },
      { id: "hud_top_haiku_cosmos_info", asset: "png/hud/hud_top_haiku_cosmos_info.png", x: 430, y: 6, scale: 1, zIndex: 25, visible: true, mountRole: "info" },
      { id: "hud_top_haiku_cosmos_logo", asset: "png/hud/hud_top_haiku_cosmos_logo.png", x: 40, y: 0, scale: 1, zIndex: 42, visible: true, interactiveRect: { id: "openSettings", role: "button", x: 0, y: 0, width: 250, height: 160 } },
      { id: "hud_top_haiku_cosmos_settings", asset: "png/hud/hud_top_haiku_cosmos_settings.png", x: 298, y: 10, scale: 1, zIndex: 45, visible: true, interactiveRect: { id: "openSettings", role: "button", x: 0, y: 0, width: 130, height: 130 } }
    ]
  };
  let layout = cloneLayout(DEFAULT_LAYOUT);
  let stage = null, layer = null, rpText = null, settingsPopup = null, initialized = false, selectedHudTopElement = "hud_top_submeta", lastAction = "defaults";

  function cloneLayout(source) { return JSON.parse(JSON.stringify(source)); }
  function publicAssetPath(path) { const h = root.HC && (root.HC.publicAssetPath || root.HC.publicPath); return typeof h === "function" ? h(path) : path; }
  function n(value, min, max, fallback) { const x = Number(value); return Number.isFinite(x) ? Math.max(min, Math.min(max, x)) : fallback; }
  function normalizeElement(candidate, fallback) {
    const c = candidate && typeof candidate === "object" ? candidate : {};
    return {
      ...fallback,
      ...c,
      id: fallback.id,
      asset: String(c.asset || fallback.asset).replace(/^\/+/, "").replace(/^public\//, ""),
      x: n(c.x, -4000, 8000, fallback.x), y: n(c.y, -4000, 4000, fallback.y),
      scale: n(c.scale, 0.05, 8, fallback.scale || 1), zIndex: Math.round(n(c.zIndex, -1000, 10000, fallback.zIndex || 0)),
      visible: c.visible !== false,
      interactiveRect: c.interactiveRect || fallback.interactiveRect
    };
  }
  function sanitizeLayout(candidate) {
    const byId = new Map((candidate?.elements || []).map((e) => [e?.id, e]));
    return { baseWidth: BASE_WIDTH, baseHeight: BASE_HEIGHT, elements: DEFAULT_LAYOUT.elements.map((fallback) => normalizeElement(byId.get(fallback.id), fallback)) };
  }
  function getHudTopScale() { return Math.max(1, Number(root.innerWidth) || document.documentElement?.clientWidth || BASE_WIDTH) / BASE_WIDTH; }
  function getElement(id) { return layout.elements.find((e) => e.id === id) || null; }
  function baseRect(el) { return { x: el.x, y: el.y, width: Number(el.interactiveRect?.width) || 160, height: Number(el.interactiveRect?.height) || 80 }; }
  function screenRect(el) { const s = getHudTopScale(); const r = baseRect(el); return { x: r.x * s, y: r.y * s, width: r.width * el.scale * s, height: r.height * el.scale * s, scale: el.scale * s }; }
  function mountFor(role) { const el = layout.elements.find((item) => item.mountRole === role) || null; return el ? screenRect(el) : null; }
  function ensureNode(el) {
    let node = layer.querySelector(`[data-hud-top-element-id="${el.id}"]`);
    if (!node) {
      node = document.createElement(el.interactiveRect ? "button" : "img");
      node.dataset.hudTopElementId = el.id;
      if (node.tagName === "BUTTON") { node.type = "button"; node.addEventListener("click", onElementClick); }
      else { node.alt = ""; node.draggable = false; }
      layer.appendChild(node);
    }
    return node;
  }
  function onElementClick(event) {
    const id = event.currentTarget?.dataset?.hudTopElementId;
    const el = getElement(id);
    if (el?.interactiveRect?.id === "openSubMeta") openSubMeta();
    if (el?.interactiveRect?.id === "openSettings") toggleSettingsPopup(el);
  }
  function applyLayout() {
    if (!stage || !layer) return;
    const s = getHudTopScale();
    stage.style.width = `${BASE_WIDTH}px`; stage.style.height = `${BASE_HEIGHT}px`;
    stage.style.transform = `scale(${s})`;
    stage.style.setProperty("--hud-top-scale", String(s));
    stage.style.pointerEvents = "none";
    for (const el of layout.elements) {
      const node = ensureNode(el);
      node.className = `hud-top-layer hud-top-layer--${el.interactiveRect ? "button" : "image"}`;
      if (node.tagName === "IMG") node.src = publicAssetPath(el.asset);
      else node.style.backgroundImage = `url("${publicAssetPath(el.asset)}")`;
      node.style.left = `${el.x}px`; node.style.top = `${el.y}px`; node.style.transform = `scale(${el.scale})`;
      if (el.interactiveRect) {
        node.style.width = `${Number(el.interactiveRect.width) || 160}px`;
        node.style.height = `${Number(el.interactiveRect.height) || 80}px`;
      }
      node.style.zIndex = String(el.zIndex); node.hidden = !el.visible;
      node.setAttribute("aria-label", el.id);
    }
    if (rpText) {
      const r = mountFor("rpText") || { x: 1545 * s, y: 82 * s, scale: s };
      rpText.style.left = `${r.x + r.width * 0.54}px`; rpText.style.top = `${r.y + r.height * 0.46}px`; rpText.style.fontSize = `${Math.max(14, 34 * r.scale)}px`; rpText.style.zIndex = "80";
    }
  }
  function openSubMeta() { const World = (root.HC.getWorld && root.HC.getWorld()) || root.World; if (World && !World.subMetaOpen) { World.subMetaOpen = true; World.paused = true; } }
  function toggleSettingsPopup(el) {
    if (!settingsPopup) settingsPopup = document.getElementById("hudTopSettingsPopup");
    if (!settingsPopup) return;
    const r = screenRect(el); settingsPopup.hidden = !settingsPopup.hidden;
    settingsPopup.style.left = `${Math.max(8, r.x)}px`; settingsPopup.style.top = `${r.y + r.height + 8}px`;
  }
  async function loadRuntimeLayout() {
    try { const res = await fetch(publicAssetPath(SETTINGS_PATH), { cache: "no-store" }); if (res.ok) { layout = sanitizeLayout(await res.json()); lastAction = "loaded settings/hud-top-layout.json"; } } catch (_e) { lastAction = "settings fallback"; }
    try { const stored = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "null"); if (stored) { layout = sanitizeLayout(stored); lastAction = "loaded localStorage"; } } catch (_e) {}
    applyLayout();
  }
  function setLayout(next, options = {}) { layout = sanitizeLayout(next); applyLayout(); if (options.persist !== false) root.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); return getLayout(); }
  function getLayout() { const out = cloneLayout(layout); const dust = mountFor("dustPile"); out.dustPileHud = dust ? { x: dust.x, y: dust.y, scale: dust.scale } : { x: 0, y: 0, scale: getHudTopScale() }; out.rpMountRect = mountFor("rpText"); out.dustPileMountRect = dust; return out; }
  function resetLayout() { root.localStorage.removeItem(STORAGE_KEY); layout = cloneLayout(DEFAULT_LAYOUT); lastAction = "reset defaults"; applyLayout(); return getLayout(); }
  function importLayout(raw) { lastAction = "imported JSON"; return setLayout(JSON.parse(String(raw || "{}"))); }
  function getExportJson() { return `${JSON.stringify(layout, null, 2)}\n`; }
  function setRpValue(value) { if (rpText) rpText.textContent = String(Math.max(0, Math.min(9999, Math.floor(Number(value) || 0)))); }
  function init() {
    if (initialized) return; stage = document.getElementById("hudTopStage"); layer = document.getElementById("hudTopLayer"); rpText = document.getElementById("scoreLabel"); settingsPopup = document.getElementById("hudTopSettingsPopup"); if (!stage || !layer || !rpText) return;
    initialized = true; root.addEventListener("resize", applyLayout); document.getElementById("hudTopSettingsClose")?.addEventListener("click", () => { settingsPopup.hidden = true; }); void loadRuntimeLayout();
  }
  function updateField(field, raw) { const el = getElement(selectedHudTopElement); if (!el) return false; if (field === "visible") el.visible = !!raw; else el[field] = field === "zIndex" ? Math.round(Number(raw)) : Number(raw); setLayout(layout); return true; }
  function renderDebugHtml(options = {}) {
    const selected = getElement(selectedHudTopElement) || layout.elements[0];
    const opts = layout.elements.map((e) => `<option value="${e.id}"${e.id === selected.id ? " selected" : ""}>${e.id}</option>`).join("");
    const row = (label, field, min, max, step) => `<label class="hud-top-debug-row"><span>${label}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${selected[field]}" data-hud-top-field="${field}"></label>`;
    return `<details class="hud-top-debug overlay-collapsible" data-runtime-debug-section="hud-top-layout"${options.open === false ? "" : " open"}><summary>HUD Top Layout</summary><div class="overlay-grid">
      <div class="overlay-row"><span class="k">hudTop.enabled</span><span class="v">true</span></div><div class="overlay-row"><span class="k">hudTop.scale</span><span class="v">${getHudTopScale().toFixed(4)}</span></div>
      <div class="overlay-row"><span class="k">base</span><span class="v">${BASE_WIDTH}×${BASE_HEIGHT}</span></div><div class="overlay-row"><span class="k">elements</span><span class="v">${layout.elements.length}</span></div>
      <label class="hud-top-debug-row"><span>element</span><select data-hud-top-action="select">${opts}</select></label>${row("x", "x", -4000, 8000, 1)}${row("y", "y", -4000, 4000, 1)}${row("scale", "scale", 0.05, 8, 0.01)}${row("zIndex", "zIndex", -1000, 10000, 1)}
      <label class="hud-top-debug-row"><span>visible</span><input type="checkbox" data-hud-top-field="visible"${selected.visible ? " checked" : ""}></label>
      <textarea class="overlay-note hud-top-json" data-hud-top-json>${getExportJson().replaceAll("&","&amp;").replaceAll("<","&lt;")}</textarea><div class="hud-top-debug-actions"><button class="overlay-btn" type="button" data-hud-top-action="copy">Copy JSON</button><button class="overlay-btn" type="button" data-hud-top-action="download">Download JSON</button><button class="overlay-btn" type="button" data-hud-top-action="import">Import JSON</button><button class="overlay-btn" type="button" data-hud-top-action="reset">Reset defaults</button></div><div class="overlay-row"><span class="k">selectedHudTopElement</span><code class="v">${selected.id}</code></div><div class="overlay-row"><span class="k">last action</span><code class="v">${lastAction}</code></div></div></details>`;
  }
  function handleDebugControl(target) {
    if (!target) return false; const action = target.dataset?.hudTopAction; const field = target.dataset?.hudTopField;
    if (action === "select") { selectedHudTopElement = target.value; return true; }
    if (field) return updateField(field, target.type === "checkbox" ? target.checked : target.value);
    if (action === "copy") void root.navigator?.clipboard?.writeText?.(getExportJson());
    else if (action === "download") { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([getExportJson()], { type: "application/json" })); a.download = "hud-top-layout.json"; a.click(); }
    else if (action === "import") importLayout(target.closest(".hud-top-debug")?.querySelector("[data-hud-top-json]")?.value || "{}");
    else if (action === "reset") resetLayout(); else return false; return true;
  }
  function getDebugState() { return { enabled: true, scale: getHudTopScale(), baseWidth: BASE_WIDTH, baseHeight: BASE_HEIGHT, elementsCount: layout.elements.length, selectedHudTopElement, dustPileMountRect: mountFor("dustPile"), rpMountRect: mountFor("rpText") }; }

  root.HC.HudTopLayout = { LAYOUT_VERSION, STORAGE_KEY, SETTINGS_PATH, REQUIRED_IDS, DEFAULT_LAYOUT: cloneLayout(DEFAULT_LAYOUT), init, getLayout, setLayout, resetLayout, importLayout, getExportJson, setRpValue, renderDebugHtml, handleDebugControl, sanitizeLayout, getDebugState };
})(window);
