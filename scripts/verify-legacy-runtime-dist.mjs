import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { legacyRuntimeFiles } from "./legacy-runtime-files.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(repoRoot, "dist");
const sourceHtml = await readFile(path.join(repoRoot, "index.html"), "utf8");
const distHtml = await readFile(path.join(distRoot, "index.html"), "utf8");
const scriptPattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
const runtimeEntries = (html) => Array.from(html.matchAll(scriptPattern), (match) => match[1])
  .filter((src) => /(?:^|\/)runtime\/[^/]+\.js(?:[?#]|$)/i.test(src));
const runtimeFile = (src) => decodeURIComponent(src.split(/[?#]/, 1)[0]).split("/").at(-1);

const sourceRuntime = runtimeEntries(sourceHtml);
const distRuntime = runtimeEntries(distHtml);
const sourceFiles = sourceRuntime.map(runtimeFile);
const distFiles = distRuntime.map(runtimeFile);

if (JSON.stringify(sourceFiles) !== JSON.stringify(legacyRuntimeFiles)) {
  throw new Error("index.html runtime scripts differ from legacy-runtime-files.mjs or their order changed");
}
if (JSON.stringify(distFiles) !== JSON.stringify(sourceFiles)) {
  throw new Error("dist/index.html changed the classic runtime script list or order");
}

const versions = distRuntime.map((src) => new URL(src, "https://example.test/Haiku-Cosmos/").searchParams.get("v"));
if (versions.some((version) => !version)) throw new Error("Every dist runtime script must have a non-empty v parameter");
if (new Set(versions).size !== 1) throw new Error("All dist runtime scripts must use one Build ID");

const unresolvedPattern = /%(?:VITE_[A-Z0-9_]*BUILD[A-Z0-9_]*|BUILD_ID|BUILD_SHA)%/i;
if (unresolvedPattern.test(distHtml)) throw new Error("dist/index.html contains an unresolved build placeholder");
if (!/<script\b[^>]*data-hc-build-info[^>]*>[\s\S]*HC_BUILD_INFO/.test(distHtml)) {
  throw new Error("BuildInfo is missing from dist/index.html");
}
const buildInfoId = distHtml.match(/"id":"([^"]+)"/)?.[1];
if (!buildInfoId || buildInfoId !== versions[0]) throw new Error("BuildInfo id does not match runtime script versions");

const moduleTag = Array.from(distHtml.matchAll(/<script\b[^>]*\btype=["']module["'][^>]*\bsrc=["']([^"']+)["'][^>]*>/gi))[0];
const moduleSrc = moduleTag?.[1];
if (!moduleSrc || !/\/assets\/[A-Za-z0-9_.-]+-[A-Za-z0-9_-]+\.js$/.test(moduleSrc.split(/[?#]/, 1)[0]) || /[?&]v=/.test(moduleSrc)) {
  throw new Error("Vite Three module bridge must remain a hashed dist/assets module without v");
}
const moduleFile = path.join(distRoot, moduleSrc.split(/[?#]/, 1)[0].replace(/^\/Haiku-Cosmos\//, ""));
if (!(await readFile(moduleFile, "utf8")).includes("HC_THREE_BRIDGE_VERSION")) {
  throw new Error("Hashed Vite module entry does not contain the Three module bridge");
}

const requiredDistFiles = [
  ...distFiles.map((file) => path.join("runtime", file)),
  path.join("vendor", "three", "three.module.min.js"),
  path.join("vendor", "loaders", "GLTFLoader.js")
];
const missing = [];
for (const relativeFile of requiredDistFiles) {
  try {
    if (!(await stat(path.join(distRoot, relativeFile))).isFile()) missing.push(relativeFile);
  } catch {
    missing.push(relativeFile);
  }
}
if (missing.length) throw new Error(`Missing required files in dist/: ${missing.join(", ")}`);

console.log(`Verified ${distFiles.length} ordered runtime scripts with Build ID ${versions[0]}, BuildInfo, hashed Three bridge, and physical dist files.`);
