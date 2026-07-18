import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(repoRoot, "dist");
const projectBase = "/Haiku-Cosmos/";

function extractBuildInfo(html) {
  const match = html.match(/window\.HC_BUILD_INFO\s*=\s*Object\.freeze\((\{[\s\S]*?\})\);/);
  if (!match) throw new Error("HC_BUILD_INFO not found in built index.html");
  return JSON.parse(match[1]);
}

function buildRootBootstrap() {
  return `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Haiku Cosmos</title><style>html,body{margin:0;height:100%;background:#000;color:#ddd;font:14px system-ui;display:grid;place-items:center}</style><script>
(function(){
  var base = ${JSON.stringify(projectBase)};
  var metaUrl = base + "build-meta.json?ts=" + encodeURIComponent(Date.now());
  fetch(metaUrl, { cache: "no-store" }).then(function(r){ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); }).then(function(meta){
    if (!meta || !meta.id) throw new Error("Missing build id");
    location.replace(base + "latest/?v=" + encodeURIComponent(meta.id));
  }).catch(function(error){ document.body.textContent = "Nie można sprawdzić aktualnej wersji Haiku Cosmos. Odśwież stronę. " + (error && error.message ? error.message : ""); });
})();
</script></head><body>Sprawdzanie aktualizacji…</body></html>\n`;
}

function buildPreflight(info) {
  const latestPath = info.latestPath;
  return `<script data-hc-update-preflight>
(function(){
  var embedded = window.HC_BUILD_INFO;
  var guardKey = "hc:update-redirect:" + (embedded && embedded.id ? embedded.id : "unknown");
  var metaUrl = ${JSON.stringify(projectBase + "build-meta.json")} + "?ts=" + encodeURIComponent(Date.now());
  function fail(message){ document.documentElement.innerHTML = '<body style="margin:0;background:#000;color:#f2d6b3;font:14px system-ui;display:grid;place-items:center;min-height:100vh;padding:24px;text-align:center">' + message + '</body>'; throw new Error(message); }
  var xhr = new XMLHttpRequest();
  xhr.open("GET", metaUrl, false);
  xhr.setRequestHeader("Cache-Control", "no-store");
  try { xhr.send(null); } catch (error) { fail("Nie można sprawdzić aktualnej wersji Haiku Cosmos. Odśwież stronę."); }
  if (xhr.status < 200 || xhr.status >= 300) fail("Nie można pobrać metadanych aktualnego buildu Haiku Cosmos.");
  var meta;
  try { meta = JSON.parse(xhr.responseText); } catch (error) { fail("Metadane aktualnego buildu Haiku Cosmos są nieczytelne."); }
  if (!embedded || !meta || embedded.id !== meta.id || embedded.sha !== meta.sha || embedded.assetBase !== meta.assetBase) {
    var count = Number(sessionStorage.getItem(guardKey) || "0");
    if (count >= 1) fail("Aktualizacja Haiku Cosmos zatrzymana, aby uniknąć pętli przeładowań. Odśwież stronę za chwilę.");
    sessionStorage.setItem(guardKey, String(count + 1));
    location.replace(${JSON.stringify(latestPath)} + "?v=" + encodeURIComponent(meta && meta.id ? meta.id : Date.now()));
    throw new Error("Redirecting to current build");
  }
  sessionStorage.removeItem(guardKey);
  if (location.search) history.replaceState(null, "", location.pathname + location.hash);
})();
</script>`;
}

function rewriteLocalRefs(html, assetBase) {
  return html.replace(/\b(src|href)=(['"])([^'"]+)\2/gi, (all, attr, quote, url) => {
    if (/^(?:https?:|data:|blob:|\/\/|#)/i.test(url)) return all;
    let clean = url.replace(/^\.\//, "").replace(/^\/+/, "");
    clean = clean.replace(/^Haiku-Cosmos\//, "");
    return `${attr}=${quote}${assetBase}${clean}${quote}`;
  });
}

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
html = rewriteLocalRefs(html, info.assetBase);
html = html.replace("</head>", `${buildPreflight(info)}\n</head>`);
await mkdir(path.join(distRoot, "latest"), { recursive: true });
await writeFile(path.join(distRoot, "latest", "index.html"), html);
await writeFile(path.join(distRoot, "build-meta.json"), JSON.stringify(info, null, 2) + "\n");
await writeFile(path.join(distRoot, "index.html"), buildRootBootstrap());
await rm(path.join(distRoot, "__app_index.html"), { force: true });
console.log(`Prepared release layout for ${info.id}`);
