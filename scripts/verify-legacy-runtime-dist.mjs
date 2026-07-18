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
const runtimeEntries = (html) => Array.from(html.matchAll(scriptPattern), (match) => match[1])
  .filter((src) => /(?:^|\/)runtime\/[^/]+\.js(?:[?#]|$)/i.test(src));
const runtimeFile = (src) => decodeURIComponent(src.split(/[?#]/, 1)[0]).split("/").at(-1);
const requiredMeta = ["id", "sha", "shortSha", "builtAt", "mode", "latestPath", "assetBase"];
for (const field of requiredMeta) if (!meta[field]) throw new Error(`build-meta.json missing ${field}`);
if (meta.assetBase !== `/Haiku-Cosmos/builds/${meta.id}/`) throw new Error("assetBase must point at immutable build directory");
if (meta.latestPath !== "/Haiku-Cosmos/latest/") throw new Error("latestPath must be /Haiku-Cosmos/latest/");
if (Number.isNaN(Date.parse(meta.builtAt))) throw new Error("builtAt must be ISO date");

if (runtimeEntries(rootHtml).length) throw new Error("dist/index.html must be bootstrap without game runtime");
if (!rootHtml.includes("build-meta.json?ts=") || !rootHtml.includes("Date.now()") || !rootHtml.includes('cache: "no-store"') || !rootHtml.includes("location.replace")) {
  throw new Error("dist/index.html must no-store fetch build-meta.json with a Date.now cache buster and location.replace");
}
if (!(await stat(buildRoot)).isDirectory()) throw new Error(`Missing dist/builds/${meta.id}/`);

const sourceFiles = runtimeEntries(sourceHtml).map(runtimeFile);
if (JSON.stringify(sourceFiles) !== JSON.stringify(legacyRuntimeFiles)) throw new Error("index.html runtime scripts differ from legacy-runtime-files.mjs or order changed");
const latestRuntime = runtimeEntries(latestHtml);
const latestFiles = latestRuntime.map(runtimeFile);
if (JSON.stringify(latestFiles) !== JSON.stringify(sourceFiles)) throw new Error("latest runtime script order changed");

const embedded = JSON.parse(latestHtml.match(/window\.HC_BUILD_INFO\s*=\s*Object\.freeze\((\{[\s\S]*?\})\);/)?.[1] || "null");
if (JSON.stringify(embedded) !== JSON.stringify(meta)) throw new Error("HC_BUILD_INFO in latest/index.html does not match build-meta.json");
const firstRuntimeIndex = latestHtml.search(/<script\b[^>]*\bsrc=["'][^"']*runtime\//i);
if (!/data-hc-update-preflight/.test(latestHtml) || firstRuntimeIndex < 0 || latestHtml.indexOf("data-hc-update-preflight") > firstRuntimeIndex) {
  throw new Error("latest/index.html must contain update preflight before runtime");
}
if (!/sessionStorage\.getItem\(guardKey\)/.test(latestHtml)) throw new Error("latest/index.html missing reload loop guard");
if (!/history\.replaceState/.test(latestHtml)) throw new Error("latest/index.html missing query cleanup");
if (!/id="buildVersionLabel"/.test(latestHtml)) throw new Error("buildVersionLabel missing");
if (!/formatBuildVersionLabel\(window\.HC_BUILD_INFO\)/.test(latestHtml) || /Build 4b5a775/.test(latestHtml)) throw new Error("Build version label must be generated from HC_BUILD_INFO");

const versions = latestRuntime.map((src) => new URL(src, "https://example.test/Haiku-Cosmos/latest/").searchParams.get("v"));
if (versions.some((version) => version !== meta.id)) throw new Error("Every runtime script must use the Build ID as v");
for (const src of latestRuntime) if (!src.startsWith(meta.assetBase)) throw new Error(`Runtime src outside build directory: ${src}`);

const requiredDistFiles = [
  ...latestFiles.map((file) => path.join("runtime", file)),
  path.join("vendor", "three", "three.module.min.js"),
  path.join("vendor", "loaders", "GLTFLoader.js")
];
for (const relativeFile of requiredDistFiles) {
  try { if (!(await stat(path.join(buildRoot, relativeFile))).isFile()) throw new Error(); }
  catch { throw new Error(`Missing required build file: ${relativeFile}`); }
}
const moduleTag = Array.from(latestHtml.matchAll(/<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']([^"']+)["'][^>]*>/gi))[0];
const moduleSrc = moduleTag?.[1];
if (!moduleSrc?.startsWith(meta.assetBase) || !/\/assets\/[A-Za-z0-9_.-]+-[A-Za-z0-9_-]+\.js$/.test(moduleSrc.split(/[?#]/, 1)[0])) throw new Error("Three bridge module must be a hashed build asset");
if (!(await readFile(path.join(buildRoot, moduleSrc.replace(meta.assetBase, "")), "utf8")).includes("HC_THREE_BRIDGE_VERSION")) throw new Error("Three bridge module content missing");

for (const [, attr, url] of latestHtml.matchAll(/\b(src|href)=["']([^"']+)["']/gi)) {
  if (/^(?:https?:|data:|blob:|\/\/|#)/i.test(url)) continue;
  if (attr && !url.startsWith(meta.assetBase)) throw new Error(`Local ${attr} does not point to build directory: ${url}`);
}
if (/\/(?:runtime|png|textures|glb)\//.test(latestHtml.replaceAll(meta.assetBase, ""))) throw new Error("latest references old runtime/png/textures/glb outside build dir");
if (/%(?:VITE_[A-Z0-9_]*BUILD[A-Z0-9_]*|BUILD_ID|BUILD_SHA)%/i.test(rootHtml + latestHtml)) throw new Error("Unresolved build placeholder found");
if (/navigator\.serviceWorker|serviceWorker\.register|workbox|caches\.open|caches\.match|CacheStorage/.test(rootHtml + latestHtml)) throw new Error("Active Service Worker registration/cache code found");
const latestEntries = await readdir(path.join(distRoot, "latest"));
if (latestEntries.some((entry) => entry !== "index.html")) throw new Error("dist/latest must contain only bootstrap entry document");
console.log(`Verified release layout for Build ID ${meta.id}: bootstrap root, latest preflight, immutable build assets, ordered runtime, Three bridge, no Service Worker.`);
