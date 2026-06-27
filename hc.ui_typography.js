(function (root) {
  "use strict";

  root.HC = root.HC || {};
  const VERSION = "submeta-ui-typography-v0.1";
  const SETTING_KEY = "uiTypography";
  const LOGICAL_PATH = "settings/ui-typography.json";
  const ROLE_IDS = Object.freeze([
    "submeta_h1", "submeta_h2", "submeta_body", "submeta_small", "submeta_card_title",
    "submeta_card_meta", "submeta_card_body", "submeta_haiku_title", "submeta_haiku_body"
  ]);
  const DISPLAY = "Marcellus";
  const BODY = "Questrial";
  const FALLBACKS = Object.freeze({ Marcellus: '"Marcellus", Georgia, "Times New Roman", serif', Questrial: '"Questrial", system-ui, -apple-system, "Segoe UI", sans-serif' });
  const DEFAULTS = Object.freeze({
    version: VERSION,
    globalScale: 1,
    roles: {
      submeta_h1: role(DISPLAY, 22, 16, 34, 1.18, 0.035, "#f4dfad", "0 1px 4px rgba(0,0,0,.55)", 400),
      submeta_h2: role(DISPLAY, 17, 13, 27, 1.22, 0.03, "#ead59f", "0 1px 3px rgba(0,0,0,.50)", 400),
      submeta_body: role(BODY, 14, 11, 21, 1.42, 0.01, "#e6f0f2", "0 1px 3px rgba(0,0,0,.42)", 400),
      submeta_small: role(BODY, 11, 9, 16, 1.32, 0.025, "#bfd3d8", "0 1px 2px rgba(0,0,0,.38)", 400),
      submeta_card_title: role(DISPLAY, 15, 12, 24, 1.18, 0.026, "#ffe6a6", "0 1px 4px rgba(0,0,0,.52)", 400),
      submeta_card_meta: role(BODY, 11, 9, 16, 1.26, 0.035, "#bad4dc", "0 1px 2px rgba(0,0,0,.38)", 400),
      submeta_card_body: role(BODY, 13.5, 11, 20, 1.44, 0.012, "#eaf3f4", "0 1px 3px rgba(0,0,0,.42)", 400),
      submeta_haiku_title: role(DISPLAY, 16, 12, 25, 1.2, 0.035, "#f6dfaa", "0 1px 4px rgba(0,0,0,.48)", 400),
      submeta_haiku_body: role(BODY, 14.5, 11.5, 22, 1.55, 0.018, "#edf6f6", "0 1px 3px rgba(0,0,0,.42)", 400)
    }
  });
  let settings = clone(DEFAULTS);
  let jsonDefaults = clone(DEFAULTS);
  let initialized = false;
  let dataSource = "fallback";
  let lastAction = "startup";
  let lastError = "";
  let lastUrl = LOGICAL_PATH;

  function role(fontFamily, baseSize, minSize, maxSize, lineHeight, letterSpacing, color, shadow, weight) { return { fontFamily, baseSize, minSize, maxSize, lineHeight, letterSpacing, color, shadow, weight }; }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function clampNumber(value, min, max, fallback) { const n = Number(value); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback; }
  function cssName(id, field) { return `--hc-${id.replaceAll("_", "-")}-${field}`; }
  function publicPath(path) { const fn = root.HC?.publicPath || root.HC?.publicAssetPath; return typeof fn === "function" ? fn(path) : path; }
  function registerFonts() {
    if (document.getElementById("hcUiTypographyFonts")) return;
    const style = document.createElement("style");
    style.id = "hcUiTypographyFonts";
    style.textContent = `@font-face{font-family:"Marcellus";src:url("${publicPath("fonts/marcellus.ttf")}") format("truetype");font-display:swap;}@font-face{font-family:"Questrial";src:url("${publicPath("fonts/questrial.ttf")}") format("truetype");font-display:swap;}`;
    document.head.appendChild(style);
    if (document.fonts?.ready) document.fonts.ready.then(() => root.HC?.SubMetaPanels?.syncDom?.()).catch(() => {});
  }
  function getLayoutScale() { return clampNumber(root.HC?.SubMetaPngLayout?.getRootScale?.(), 0.4, 3, 1); }
  function normalizeRole(candidate, fallback) { return { fontFamily: candidate?.fontFamily === DISPLAY ? DISPLAY : (candidate?.fontFamily === BODY ? BODY : fallback.fontFamily), baseSize: clampNumber(candidate?.baseSize, 6, 72, fallback.baseSize), minSize: clampNumber(candidate?.minSize, 5, 72, fallback.minSize), maxSize: clampNumber(candidate?.maxSize, 5, 96, fallback.maxSize), lineHeight: clampNumber(candidate?.lineHeight, 0.9, 2.2, fallback.lineHeight), letterSpacing: clampNumber(candidate?.letterSpacing, -0.12, 0.25, fallback.letterSpacing), color: typeof candidate?.color === "string" ? candidate.color : fallback.color, shadow: typeof candidate?.shadow === "string" ? candidate.shadow : fallback.shadow, weight: clampNumber(candidate?.weight, 100, 900, fallback.weight) }; }
  function normalizePayload(payload) { if (!payload || typeof payload !== "object") throw new Error("Typography payload must be an object"); const next = clone(DEFAULTS); next.globalScale = clampNumber(payload.globalScale, 0.6, 1.8, DEFAULTS.globalScale); for (const id of ROLE_IDS) next.roles[id] = normalizeRole(payload.roles?.[id], DEFAULTS.roles[id]); return next; }
  function computedRole(id) { const raw = settings.roles[id] || DEFAULTS.roles[id]; const size = clampNumber(raw.baseSize * getLayoutScale() * settings.globalScale, raw.minSize, raw.maxSize, raw.baseSize); return { ...raw, size, fontStack: FALLBACKS[raw.fontFamily] || FALLBACKS[BODY], font: `${raw.weight} ${size.toFixed(2)}px/${raw.lineHeight} ${FALLBACKS[raw.fontFamily] || FALLBACKS[BODY]}` }; }
  function applyCssVars() { const target = document.documentElement; for (const id of ROLE_IDS) { const c = computedRole(id); target.style.setProperty(cssName(id, "font-family"), c.fontStack); target.style.setProperty(cssName(id, "font-size"), `${c.size.toFixed(2)}px`); target.style.setProperty(cssName(id, "line-height"), String(c.lineHeight)); target.style.setProperty(cssName(id, "letter-spacing"), `${c.letterSpacing}em`); target.style.setProperty(cssName(id, "color"), c.color); target.style.setProperty(cssName(id, "shadow"), c.shadow); target.style.setProperty(cssName(id, "weight"), String(c.weight)); } target.style.setProperty("--hc-submeta-typography-global-scale", String(settings.globalScale)); }
  async function loadRuntimeSetting() { registerFonts(); const loader = root.HC?.SubMetaSettings; const logicalPath = loader?.paths?.[SETTING_KEY] || LOGICAL_PATH; try { if (!loader?.loadJson) throw new Error("settings loader unavailable"); const result = await loader.loadJson(logicalPath, { validate: (payload) => { try { normalizePayload(payload); return true; } catch (_e) { return false; } } }); lastUrl = result.resolvedUrl || logicalPath; if (!result.ok) throw result.error || new Error(result.failureKind || "load failed"); settings = normalizePayload(result.payload); jsonDefaults = clone(settings); dataSource = "settings JSON"; lastAction = "loaded settings JSON"; lastError = ""; } catch (error) { settings = clone(DEFAULTS); jsonDefaults = clone(DEFAULTS); dataSource = "fallback"; lastAction = "fallback defaults"; lastError = String(error?.message || error); } applyCssVars(); root.HC?.SubMetaPanels?.syncDom?.(); return dataSource === "settings JSON"; }
  function init() { if (initialized) return; initialized = true; registerFonts(); applyCssVars(); loadRuntimeSetting(); root.addEventListener?.("resize", () => { applyCssVars(); root.HC?.SubMetaPanels?.syncDom?.(); }); }
  function importSettings(json) { try { settings = normalizePayload(typeof json === "string" ? JSON.parse(json) : json); dataSource = "imported runtime"; lastAction = "imported"; lastError = ""; applyCssVars(); root.HC?.SubMetaPanels?.syncDom?.(); return true; } catch (error) { lastAction = "error"; lastError = String(error?.message || error); return false; } }
  async function resetToDefault() { settings = clone(jsonDefaults); lastAction = "reset from settings JSON"; lastError = ""; applyCssVars(); root.HC?.SubMetaPanels?.syncDom?.(); return true; }
  function updateRole(id, field, value) { if (!ROLE_IDS.includes(id) || !(field in settings.roles[id])) return false; const candidate = { ...settings.roles[id], [field]: value }; settings.roles[id] = normalizeRole(candidate, settings.roles[id]); applyCssVars(); root.HC?.SubMetaPanels?.syncDom?.(); return true; }
  function setGlobalScale(value) { settings.globalScale = clampNumber(value, 0.6, 1.8, settings.globalScale); applyCssVars(); root.HC?.SubMetaPanels?.syncDom?.(); return settings.globalScale; }
  function exportSettings() { lastAction = "exported"; return JSON.stringify(settings, null, 2); }
  function escapeHtml(v) { return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
  function renderDebugHtml(options = {}) { const roleId = ROLE_IDS.includes(options.selectedRole) ? options.selectedRole : ROLE_IDS[0]; const r = settings.roles[roleId]; const ctrl = (f, min, max, step) => `<label class="submeta-png-debug-row"><span>${f}</span><input type="number" min="${min}" max="${max}" step="${step}" value="${escapeHtml(r[f])}" data-submeta-typography-field="${f}"></label>`; return `<details class="submeta-png-debug" data-runtime-debug-section="submeta-typography"${options.open === true ? " open" : ""}><summary>SUB-META Typography</summary><label class="submeta-png-debug-row"><span>role</span><select id="dbgSubMetaTypographyRole">${ROLE_IDS.map((id) => `<option value="${id}"${id === roleId ? " selected" : ""}>${id}</option>`).join("")}</select></label><label class="submeta-png-debug-row"><span>globalScale</span><input type="number" min="0.6" max="1.8" step="0.01" value="${settings.globalScale}" data-submeta-typography-global-scale></label>${ctrl("baseSize", 6, 72, 0.5)}${ctrl("minSize", 5, 72, 0.5)}${ctrl("maxSize", 5, 96, 0.5)}${ctrl("lineHeight", 0.9, 2.2, 0.01)}${ctrl("letterSpacing", -0.12, 0.25, 0.001)}<label class="submeta-png-debug-row"><span>color</span><input type="text" value="${escapeHtml(r.color)}" data-submeta-typography-field="color"></label><label class="submeta-png-debug-row"><span>shadow</span><input type="text" value="${escapeHtml(r.shadow)}" data-submeta-typography-field="shadow"></label><div class="submeta-png-debug-actions"><button class="overlay-btn" type="button" data-submeta-typography-action="reset">Reset defaults</button><button class="overlay-btn" type="button" data-submeta-typography-action="export">Export JSON</button><button class="overlay-btn" type="button" data-submeta-typography-action="import">Import JSON</button></div><textarea id="dbgSubMetaTypographyJson" class="overlay-note submeta-panels-json" spellcheck="false"></textarea><div class="submeta-png-diagnostics"><div class="overlay-row"><span class="k">source</span><code class="v">${escapeHtml(dataSource)}</code></div><div class="overlay-row"><span class="k">settings URL</span><code class="v">${escapeHtml(lastUrl)}</code></div><div class="overlay-row"><span class="k">last action</span><code class="v">${escapeHtml(lastAction)}</code></div>${lastError ? `<div class="overlay-row"><span class="k">error</span><code class="v">${escapeHtml(lastError)}</code></div>` : ""}</div></details>`; }
  function handleDebugControl(target) { if (!target) return false; const role = document.getElementById("dbgSubMetaTypographyRole")?.value || ROLE_IDS[0]; if (target.id === "dbgSubMetaTypographyRole") return true; if (target.dataset?.submetaTypographyGlobalScale != null) return !!setGlobalScale(target.value); if (target.dataset?.submetaTypographyField) return updateRole(role, target.dataset.submetaTypographyField, target.value); const action = target.dataset?.submetaTypographyAction; const textarea = document.getElementById("dbgSubMetaTypographyJson"); if (action === "export") { if (textarea) textarea.value = exportSettings(); return true; } if (action === "import") return importSettings(textarea?.value || ""); if (action === "reset") { resetToDefault(); return true; } return false; }
  root.HC.UITypography = { VERSION, SETTING_KEY, ROLE_IDS, init, loadRuntimeSetting, resetToDefault, exportSettings, importSettings, updateRole, setGlobalScale, getSettings: () => clone(settings), getExportPayload: () => clone(settings), getComputedRole: computedRole, applyCssVars, renderDebugHtml, handleDebugControl };
  init();
})(window);
