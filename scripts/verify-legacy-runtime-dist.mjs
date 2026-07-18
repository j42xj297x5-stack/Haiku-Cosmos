import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { legacyRuntimeFiles } from "./legacy-runtime-files.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(repoRoot, "dist");
const sourceHtml = await readFile(path.join(repoRoot, "index.html"), "utf8");
const rootHtml = await readFile(path.join(distRoot, "index.html"), "utf8");
const meta = JSON.parse(await readFile(path.join(distRoot, "build-meta.json"), "utf8"));
const latestHtml = await readFile(path.join(distRoot, "latest", "index.html"), "utf8");
const buildRoot = path.join(distRoot, "builds", meta.id);
const scriptPattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
const runtimeEntries = (html) => Array.from(html.matchAll(scriptPattern), (match) => match[1]).filter((src) => /(?:^|\/)runtime\/[^/]+\.js(?:[?#]|$)/i.test(src));
const runtimeFile = (src) => decodeURIComponent(src.split(/[?#]/, 1)[0]).split("/").at(-1);
const requiredMeta = ["id", "sha", "shortSha", "builtAt", "mode", "latestPath", "assetBase"];
for (const field of requiredMeta) if (!meta[field]) throw new Error(`build-meta.json missing ${field}`);
if (meta.assetBase !== `/Haiku-Cosmos/builds/${meta.id}/`) throw new Error("assetBase must point at immutable build directory");
if (meta.latestPath !== "/Haiku-Cosmos/latest/") throw new Error("latestPath must be /Haiku-Cosmos/latest/");
if (Number.isNaN(Date.parse(meta.builtAt))) throw new Error("builtAt must be ISO date");
if (runtimeEntries(rootHtml).length || /<script\b[^>]*type=["']module["'][^>]*src=/i.test(rootHtml)) throw new Error("dist/index.html must not load game runtime");
if (!rootHtml.includes("build-meta.json?t=") || !rootHtml.includes("Date.now()") || !rootHtml.includes('cache: "no-store"') || !rootHtml.includes('credentials: "same-origin"') || !rootHtml.includes(`location.replace(base + "latest/?v="`)) throw new Error("dist/index.html must no-store fetch build-meta.json?t=Date.now and location.replace to latest ?v");
if (!(await stat(buildRoot)).isDirectory()) throw new Error(`Missing dist/builds/${meta.id}/`);
const sourceFiles = runtimeEntries(sourceHtml).map(runtimeFile);
if (JSON.stringify(sourceFiles) !== JSON.stringify(legacyRuntimeFiles)) throw new Error("index.html runtime scripts differ from legacy-runtime-files.mjs or order changed");
if (runtimeEntries(latestHtml).length || /<script\b[^>]*type=["']module["'][^>]*src=/i.test(latestHtml)) throw new Error("latest/index.html must not contain static runtime/module src");
if (/<link\b[^>]*rel=["']stylesheet["'][^>]*href=/i.test(latestHtml)) throw new Error("latest/index.html must not contain static app stylesheet href");
const embedded = JSON.parse(latestHtml.match(/window\.HC_BUILD_INFO\s*=\s*Object\.freeze\((\{[\s\S]*?\})\);/)?.[1] || "null");
if (JSON.stringify(embedded) !== JSON.stringify(meta)) throw new Error("HC_BUILD_INFO in latest/index.html does not match build-meta.json");
const manifest = JSON.parse(latestHtml.match(/<script data-hc-release-manifest type="application\/json">([\s\S]*?)<\/script>/)?.[1] || "null");
const manifestScripts = manifest.filter((entry) => entry.kind === "script").map((entry) => runtimeFile(entry.src)).filter(Boolean);
if (JSON.stringify(manifestScripts.filter((file) => sourceFiles.includes(file))) !== JSON.stringify(sourceFiles)) throw new Error("release manifest must preserve source runtime script order");
for (const entry of manifest) if ((entry.src || entry.href || "").startsWith("/Haiku-Cosmos/") || /\/builds\//.test(entry.src || entry.href || "")) throw new Error("manifest must store source-relative paths only; bootstrap applies assetBase");
const boot = latestHtml.match(/<script data-hc-release-bootstrap>([\s\S]*?)<\/script>/)?.[1] || "";
for (const needle of ["build-meta.json?t=", 'cache: "no-store"', 'credentials: "same-origin"', "new URLSearchParams(location.search).get(\"v\")", "location.replace(meta.latestPath + \"?v=\"", "hc:release-redirect-count", "HC_RELEASE_BOOTSTRAP", "preflightComplete: true", "hc:release-build-id", "await resetStorage", "await loadTag", "document.createElement(\"script\")", "el.async = false", "window.HC_BUILD_INFO.assetBase", "navigator.serviceWorker.getRegistrations", "r.unregister()", "buildVersionLabel"])
  if (!boot.includes(needle)) throw new Error(`latest bootstrap missing ${needle}`);
if (/history\.replaceState/.test(rootHtml + latestHtml)) throw new Error("production bootstrap must not remove ?v with history.replaceState");
if (/localStorage\.clear\s*\(|sessionStorage\.clear\s*\(/.test(latestHtml)) throw new Error("release storage reset must not clear entire origin storage");
if (!/k\.indexOf\("hc:"\).*k\.indexOf\("hc\."\).*k\.indexOf\("haiku-cosmos"\)/s.test(boot)) throw new Error("storage reset must be limited to Haiku Cosmos keys");
if (!/setStatus\("Sprawdzanie wersji…"\)/.test(boot) || !/Czyszczenie danych poprzedniej wersji…/.test(boot) || !/Ładowanie aktualnej wersji…/.test(boot) || !/Błąd aktualizacji — gra nie została uruchomiona\./.test(boot)) throw new Error("latest bootstrap missing required overlay states");
if (boot.indexOf("window.HC_RELEASE_BOOTSTRAP") > boot.indexOf("await loadTag")) throw new Error("runtime can start before preflight marker");
const forbiddenBare = /(?:src|href)=["'](?:\/Haiku-Cosmos\/)?(?:runtime|png|textures|glb|settings|fonts|svg|vendor)\//i;
if (forbiddenBare.test(latestHtml)) throw new Error("latest contains static local runtime/asset URL outside build assetBase");
for (const relativeFile of [...sourceFiles.map((file) => path.join("runtime", file)), path.join("vendor", "three", "three.module.min.js"), path.join("vendor", "loaders", "GLTFLoader.js")]) {
  try { if (!(await stat(path.join(buildRoot, relativeFile))).isFile()) throw new Error(); }
  catch { throw new Error(`Missing required build file: ${relativeFile}`); }
}
const debugRuntime = await readFile(path.join(buildRoot, "runtime", "hc.debug.js"), "utf8");
for (const needle of ["isDebugModeActive", "hasActiveDebugSession", "isManualExportInProgress", "cleanupLegacyDebugStorageForNormalMode", "hc:debug-normal-cleanup-v1"]) {
  if (!debugRuntime.includes(needle)) throw new Error(`debug runtime missing normal/debug separation guard: ${needle}`);
}
if (/addEventListener\(["'](?:beforeunload|pagehide|visibilitychange)["']/.test(debugRuntime)) throw new Error("debug runtime must not register unload/visibility finalization listeners");
if (/localStorage\.clear\s*\(|sessionStorage\.clear\s*\(/.test(debugRuntime)) throw new Error("debug runtime must not clear entire origin storage");
const bridgeEntry = manifest.find((entry) => entry.type === "module" && /^assets\//.test(entry.src));
if (!bridgeEntry) throw new Error("Three bridge module missing from dynamic manifest");
if (!(await readFile(path.join(buildRoot, bridgeEntry.src), "utf8")).includes("HC_THREE_BRIDGE_VERSION")) throw new Error("Three bridge module content missing");
const latestEntries = await readdir(path.join(distRoot, "latest"));
if (latestEntries.some((entry) => entry !== "index.html")) throw new Error("dist/latest must contain only bootstrap entry document");
console.log(`Verified release layout for Build ID ${meta.id}: root redirect, inline latest preflight, scoped storage reset, dynamic ordered runtime from assetBase, no static runtime.`);
