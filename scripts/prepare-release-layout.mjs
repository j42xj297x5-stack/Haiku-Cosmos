import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(repoRoot, "dist");
const projectBase = "/Haiku-Cosmos/";
const sourceRuntimePrefixes = ["runtime/", "assets/", "png/", "textures/", "glb/", "settings/", "fonts/", "svg/", "vendor/", "data/", "models/"];

export function extractBuildInfo(html) {
  const match = html.match(/window\.HC_BUILD_INFO\s*=\s*Object\.freeze\((\{[\s\S]*?\})\);/);
  if (!match) throw new Error("HC_BUILD_INFO not found in built index.html");
  return JSON.parse(match[1]);
}

function isExternalUrl(url) { return /^(?:https?:|data:|blob:|\/\/|#)/i.test(url); }
function cleanLocalPath(url) { return url.split(/[?#]/, 1)[0].replace(/^\.\//, "").replace(new RegExp("^/+"), "").replace(/^Haiku-Cosmos\//, ""); }
function isAppLocalUrl(url) { return !isExternalUrl(url) && (sourceRuntimePrefixes.some((prefix) => cleanLocalPath(url).startsWith(prefix)) || cleanLocalPath(url) === "hc.three_module_bridge.js"); }
function escapeScriptJson(value) { return JSON.stringify(value).replace(/</g, "\\u003c"); }

export function collectReleaseManifest(html) {
  const manifest = [];
  html = html.replace(/<link\b([^>]*?)>/gi, (tag, attrs) => {
    const rel = attrs.match(/\brel=(['"])(.*?)\1/i)?.[2] || "";
    const href = attrs.match(/\bhref=(['"])(.*?)\1/i)?.[2] || "";
    if (/\bstylesheet\b/i.test(rel) && isAppLocalUrl(href)) {
      manifest.push({ kind: "style", href: cleanLocalPath(href) });
      return "";
    }
    return tag;
  });
  html = html.replace(/<script\b([^>]*)\bsrc=(['"])([^'"]+)\2([^>]*)><\/script>/gi, (tag, before, _q, src, after) => {
    if (!isAppLocalUrl(src)) return tag;
    const type = `${before} ${after}`.match(/\btype=(['"])(.*?)\1/i)?.[2] || "classic";
    manifest.push({ kind: "script", type: type === "module" ? "module" : "classic", src: cleanLocalPath(src) });
    return "";
  });
  return { html, manifest };
}

export function buildRootBootstrap() {
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Haiku Cosmos</title><style>html,body{margin:0;height:100%;background:#000;color:#ddd;font:14px system-ui;display:grid;place-items:center}</style><script>
(function(){
  var base = ${JSON.stringify(projectBase)};
  var metaUrl = base + "build-meta.json?t=" + encodeURIComponent(Date.now());
  fetch(metaUrl, { cache: "no-store", credentials: "same-origin" }).then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); }).then(function(meta){
    if (!meta || !meta.id) throw new Error("Missing build id");
    location.replace(base + "latest/?v=" + encodeURIComponent(meta.id));
  }).catch(function(error){ document.body.textContent = "Nie można sprawdzić aktualnej wersji Haiku Cosmos. Odśwież stronę. " + (error && error.message ? error.message : ""); });
})();
</script></head><body>Sprawdzanie wersji…</body></html>\n`;
}

export function buildReleaseBootstrap(manifest) {
  return `<script data-hc-release-manifest type="application/json">${escapeScriptJson(manifest)}</script>
<script data-hc-release-bootstrap>
(async function(){
  "use strict";
  var PROJECT_BASE = ${JSON.stringify(projectBase)};
  var MARKER_KEY = "hc:release-build-id";
  var REDIRECT_KEY = "hc:release-redirect-count";
  var embedded = window.HC_BUILD_INFO;
  var overlay = document.getElementById("startOverlay");
  var statusEl = document.getElementById("startStatus");
  var progressEl = document.getElementById("loaderProgressLabel");
  var labelEl = document.getElementById("buildVersionLabel");
  function setStatus(text){ if (statusEl) statusEl.textContent = text; if (progressEl) progressEl.textContent = text; }
  function fail(message){ setStatus("Błąd aktualizacji — gra nie została uruchomiona."); if (statusEl) statusEl.textContent = message || "Błąd aktualizacji — gra nie została uruchomiona."; if (console && console.error) console.error(message); return false; }
  function completeMeta(meta){ return !!(meta && meta.id && meta.sha && meta.shortSha && meta.builtAt && meta.assetBase && meta.latestPath); }
  function fmt(info){ return window.HC && typeof window.HC.formatBuildVersionLabel === "function" ? window.HC.formatBuildVersionLabel(info) : "Build " + info.shortSha; }
  function projectKey(k){ return k === MARKER_KEY || k.indexOf("hc:") === 0 || k.indexOf("hc.") === 0 || k.indexOf("haiku-cosmos") === 0; }
  function removeProjectStorage(storage){ if (!storage) return; var keys = []; for (var i=0;i<storage.length;i++) keys.push(storage.key(i)); keys.forEach(function(k){ if (projectKey(k)) storage.removeItem(k); }); }
  async function deleteIdb(name){ return new Promise(function(resolve){ var req = indexedDB.deleteDatabase(name); req.onsuccess = req.onerror = req.onblocked = function(){ resolve(); }; }); }
  async function resetStorage(buildId){
    removeProjectStorage(localStorage); removeProjectStorage(sessionStorage);
    if (window.caches && caches.keys) { var names = await caches.keys(); await Promise.all(names.map(async function(name){ var cache = await caches.open(name); if (projectKey(name)) return caches.delete(name); if (cache.keys) { var reqs = await cache.keys(); await Promise.all(reqs.filter(function(r){ return r && r.url && r.url.indexOf(PROJECT_BASE) >= 0; }).map(function(r){ return cache.delete(r); })); } })); }
    if (window.indexedDB) { var dbs = indexedDB.databases ? await indexedDB.databases() : [{ name: "haiku-cosmos" }]; await Promise.all(dbs.map(function(db){ return db && db.name && projectKey(db.name) ? deleteIdb(db.name) : null; })); }
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) { var regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.filter(function(r){ return r.scope && r.scope.indexOf(PROJECT_BASE) >= 0; }).map(function(r){ return r.unregister(); })); }
    localStorage.setItem(MARKER_KEY, buildId);
  }
  async function loadTag(entry){ return new Promise(function(resolve, reject){ var el; var attr; if (entry.kind === "style") { el = document.createElement("link"); el.rel = "stylesheet"; attr = "href"; } else { el = document.createElement("script"); el.async = false; if (entry.type === "module") el.type = "module"; attr = "src"; } el.onload = resolve; el.onerror = function(){ reject(new Error("Failed to load " + (entry.src || entry.href))); }; el[attr] = new RegExp("^(?:https?:|data:|blob:|//)", "i").test(entry.src || entry.href) ? (entry.src || entry.href) : window.HC_BUILD_INFO.assetBase + (entry.src || entry.href).replace(new RegExp("^/+"), ""); document.head.appendChild(el); }); }
  try {
    if (overlay) overlay.hidden = false;
    setStatus("Sprawdzanie wersji…");
    var requestedId = new URLSearchParams(location.search).get("v");
    var response = await fetch(PROJECT_BASE + "build-meta.json?t=" + encodeURIComponent(Date.now()), { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) return fail("Błąd aktualizacji — gra nie została uruchomiona.");
    var meta = await response.json();
    if (!completeMeta(meta)) return fail("Błąd aktualizacji — niepoprawne metadane buildu.");
    if (labelEl) labelEl.textContent = fmt(meta);
    if (requestedId !== meta.id || !embedded || embedded.id !== meta.id) {
      var redirects = Number(sessionStorage.getItem(REDIRECT_KEY) || "0");
      if (redirects >= 2) return fail("Błąd aktualizacji — zatrzymano pętlę przekierowań.");
      sessionStorage.setItem(REDIRECT_KEY, String(redirects + 1));
      location.replace(meta.latestPath + "?v=" + encodeURIComponent(meta.id));
      return;
    }
    sessionStorage.removeItem(REDIRECT_KEY);
    window.HC_BUILD_INFO = Object.freeze(meta);
    var previous = localStorage.getItem(MARKER_KEY);
    var storageResetPerformed = previous !== meta.id;
    if (storageResetPerformed) { setStatus("Czyszczenie danych poprzedniej wersji…"); await resetStorage(meta.id); }
    window.HC_RELEASE_BOOTSTRAP = { buildId: meta.id, storageResetPerformed: storageResetPerformed, preflightComplete: true };
    setStatus("Ładowanie aktualnej wersji…");
    var manifest = JSON.parse(document.querySelector("script[data-hc-release-manifest]").textContent);
    for (var i = 0; i < manifest.length; i++) await loadTag(manifest[i]);
  } catch (error) { if (!/Redirecting/.test(String(error && error.message))) fail(error && error.message ? error.message : "Błąd aktualizacji — gra nie została uruchomiona."); }
})();
</script>`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let html = await readFile(path.join(distRoot, "index.html"), "utf8");
  const info = extractBuildInfo(html);
  const buildDir = path.join(distRoot, "builds", info.id);
  const tmpDir = path.join(distRoot, `.build-${info.id}`);
  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(path.dirname(tmpDir), { recursive: true });
  await rename(path.join(distRoot, "index.html"), path.join(distRoot, "__app_index.html"));
  for (const entry of ["assets", "data", "fonts", "glb", "models", "png", "runtime", "settings", "svg", "textures", "vendor", "manifest.json"]) {
    const source = path.join(distRoot, entry);
    try { await cp(source, path.join(tmpDir, entry), { recursive: true }); await rm(source, { recursive: true, force: true }); } catch {}
  }
  await rm(buildDir, { recursive: true, force: true });
  await mkdir(path.dirname(buildDir), { recursive: true });
  await rename(tmpDir, buildDir);
  html = await readFile(path.join(distRoot, "__app_index.html"), "utf8");
  const builtCollected = collectReleaseManifest(html);
  const sourceCollected = collectReleaseManifest(await readFile(path.join(repoRoot, "index.html"), "utf8"));
  const builtModule = builtCollected.manifest.find((entry) => entry.type === "module" && /^assets\//.test(entry.src));
  const manifest = sourceCollected.manifest.map((entry) => (
    entry.type === "module" && /hc\.three_module_bridge/.test(entry.src) && builtModule
      ? { ...entry, src: builtModule.src }
      : entry
  ));
  html = builtCollected.html.replace("</head>", `${buildReleaseBootstrap(manifest)}\n</head>`);
  await mkdir(path.join(distRoot, "latest"), { recursive: true });
  await writeFile(path.join(distRoot, "latest", "index.html"), html);
  await writeFile(path.join(distRoot, "build-meta.json"), JSON.stringify(info, null, 2) + "\n");
  await writeFile(path.join(distRoot, "index.html"), buildRootBootstrap());
  await rm(path.join(distRoot, "__app_index.html"), { force: true });
  console.log(`Prepared release layout for ${info.id}`);
}
