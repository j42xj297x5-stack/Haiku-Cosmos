import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectVisualAssetPaths } from "./sync-public-visual-assets.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const settingsFiles = ["public/settings/ui-typography.json", "public/settings/hud-top-layout.json", "public/settings/submeta-png-layout.json", "public/settings/submeta-placeholders.json", "public/settings/submeta-placeholders-panels.json"];
const assetExt = /\.(?:png|svg|webp|jpe?g|json|glb|gltf|bin|ttf|woff2?)(?:[?#].*)?$/i;
function isExternal(value) { return /^(?:https?:|data:|blob:|\/\/|#)/i.test(String(value || "")); }
function clean(value) { return String(value || "").split(/[?#]/, 1)[0].replace(/^\.\//, "").replace(/^\/+/, "").replace(/^Haiku-Cosmos\//, ""); }
async function existsFile(file) { try { return (await stat(file)).isFile(); } catch { return false; } }
function publicPathFor(logical, document) {
  const value = clean(logical);
  if (value.startsWith("png/")) return `public/${value}`;
  if (value.startsWith("settings/")) return `public/${value}`;
  if (value.startsWith("assets/visual/")) return `public/${value}`;
  if (document.endsWith("submeta-png-layout.json") && !value.includes("/")) return `public/png/submeta/${value}`;
  return value.startsWith("public/") ? value : `public/${value}`;
}
function walk(value, visit, pointer = "$", active = true) {
  if (!active) return;
  if (Array.isArray(value)) value.forEach((item, index) => walk(item, visit, `${pointer}[${index}]`, active));
  else if (value && typeof value === "object") {
    const nextActive = value.visible !== false;
    for (const [key, child] of Object.entries(value)) walk(child, visit, `${pointer}.${key}`, nextActive);
  } else if (typeof value === "string") visit(value, pointer);
}
async function readJson(relativePath) { return JSON.parse(await readFile(path.join(repoRoot, relativePath), "utf8")); }
export async function verifyRuntimeAssets() {
  const missing = [];
  let checked = 0;
  const submeta = await readJson("public/settings/submeta-png-layout.json");
  for (const element of submeta.elements || []) {
    if (element?.visible === false || !element?.src) continue;
    checked++;
    const logical = `png/submeta/${clean(element.src)}`;
    const file = path.join(repoRoot, "public", logical);
    if (!(await existsFile(file))) missing.push({ logical, document: "public/settings/submeta-png-layout.json", missing: `public/${logical}` });
  }
  const visual = await collectVisualAssetPaths({ root: repoRoot });
  for (const logical of visual.paths) {
    checked++;
    if (!(await existsFile(path.join(repoRoot, logical)))) missing.push({ logical, document: "assets/visual/submeta/submeta_main_frame_v01_manifest.json", missing: logical });
    if (!(await existsFile(path.join(repoRoot, "public", logical)))) missing.push({ logical, document: "assets/visual/submeta/submeta_main_frame_v01_manifest.json", missing: `public/${logical}` });
  }
  for (const document of settingsFiles) {
    const json = await readJson(document);
    walk(json, (value, pointer) => {
      if (!assetExt.test(value) || isExternal(value)) return;
      checked++;
      const missingPath = publicPathFor(value, document);
      if (!existsFileSync(path.join(repoRoot, missingPath))) missing.push({ logical: value, document: `${document}${pointer}`, missing: missingPath });
    });
  }
  if (missing.length) {
    console.error(`Runtime asset verification failed: ${missing.length} missing of ${checked} checked references.`);
    for (const item of missing) console.error(`- logical: ${item.logical}\n  document: ${item.document}\n  missing: ${item.missing}`);
    process.exitCode = 1;
    return { checked, missing };
  }
  console.log(`Runtime asset verification passed: ${checked} references checked, 0 missing files.`);
  return { checked, missing };
}
import { existsSync as existsFileSync } from "node:fs";
if (process.argv[1] === fileURLToPath(import.meta.url)) await verifyRuntimeAssets();
