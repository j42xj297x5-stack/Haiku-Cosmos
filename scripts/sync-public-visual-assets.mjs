import { cp, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = "assets/visual/submeta/submeta_main_frame_v01_manifest.json";
const publicRoot = path.join(repoRoot, "public");

function isExternal(value) { return /^(?:https?:|data:|blob:|\/\/)/i.test(String(value || "")); }
function clean(value) { return String(value || "").split(/[?#]/, 1)[0].replace(/^\.\//, "").replace(/^\/+/, ""); }
async function existsFile(file) { try { return (await stat(file)).isFile(); } catch { return false; } }
function fail(lines) { throw new Error(["Visual asset sync failed:", ...lines].join("\n")); }

export async function collectVisualAssetPaths({ root = repoRoot, manifest = manifestPath } = {}) {
  const absoluteManifest = path.join(root, manifest);
  let parsed;
  try { parsed = JSON.parse(await readFile(absoluteManifest, "utf8")); }
  catch (error) { fail([`manifest: ${manifest}`, `missing or invalid JSON: ${error.message}`]); }
  if (!parsed || !Array.isArray(parsed.assets)) fail([`manifest: ${manifest}`, "expected assets[] array"]);
  const paths = new Set([manifest]);
  const missing = [];
  parsed.assets.forEach((asset, index) => {
    if (!asset || typeof asset !== "object") missing.push(`assets[${index}] is not an object`);
    const logicalPath = clean(asset?.path);
    if (!logicalPath) missing.push(`assets[${index}].path is missing`);
    if (!logicalPath || isExternal(logicalPath)) return;
    if (!logicalPath.startsWith("assets/visual/")) missing.push(`${logicalPath} is outside assets/visual/`);
    paths.add(logicalPath);
  });
  if (missing.length) fail([`manifest: ${manifest}`, ...missing]);
  return { manifest: parsed, paths: [...paths] };
}

export async function syncPublicVisualAssets({ root = repoRoot } = {}) {
  const { paths } = await collectVisualAssetPaths({ root });
  const missing = [];
  for (const relativePath of paths) if (!(await existsFile(path.join(root, relativePath)))) missing.push(relativePath);
  if (missing.length) fail(missing.map((file) => `missing source: ${file}`));
  for (const relativePath of paths) {
    const destination = path.join(root, "public", relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(path.join(root, relativePath), destination);
  }
  console.log(`Synced ${paths.length} visual runtime assets to ${path.relative(root, publicRoot)}/assets/visual/`);
  return paths.length;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await syncPublicVisualAssets();
