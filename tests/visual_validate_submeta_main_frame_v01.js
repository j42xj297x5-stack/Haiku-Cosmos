const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const manifestPath = path.join(repoRoot, "assets", "visual", "submeta", "submeta_main_frame_v01_manifest.json");
const previewPath = path.join(repoRoot, "assets", "visual", "preview", "submeta_main_frame_v01_preview.html");

function fail(message) {
  throw new Error(message);
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function assertNoForbiddenSvgContent(svg, relativePath) {
  const checks = [
    { pattern: /<image\b/i, label: "<image>" },
    { pattern: /base64/i, label: "base64" },
    { pattern: /<font\b/i, label: "<font>" },
    { pattern: /@font-face/i, label: "@font-face" },
    { pattern: /<filter\b/i, label: "<filter>" },
    { pattern: /__TECH/i, label: "__TECH" },
    { pattern: /__DEBUG/i, label: "__DEBUG" }
  ];

  for (const check of checks) {
    if (check.pattern.test(svg)) {
      fail(`${relativePath} contains forbidden SVG content: ${check.label}`);
    }
  }
}

const manifest = JSON.parse(readText(manifestPath));
if (manifest.kitId !== "submeta_main_frame_v01") fail("Unexpected kitId");
if (manifest.assetCount !== 16) fail("Manifest assetCount must be 16");
if (!Array.isArray(manifest.assets) || manifest.assets.length !== 16) fail("Manifest assets[] must contain 16 entries");

const logicalNames = new Set();
const files = new Set();
for (const asset of manifest.assets) {
  if (!asset.logicalName) fail("Asset missing logicalName");
  if (!asset.file || !asset.path) fail(`${asset.logicalName} missing file/path`);
  if (logicalNames.has(asset.logicalName)) fail(`Duplicate logicalName: ${asset.logicalName}`);
  logicalNames.add(asset.logicalName);
  files.add(asset.file);

  const absolutePath = path.join(repoRoot, asset.path);
  if (!fs.existsSync(absolutePath)) fail(`${asset.logicalName} file missing: ${asset.path}`);
  const svg = readText(absolutePath);
  if (!/\bviewBox="/.test(svg)) fail(`${asset.path} missing viewBox`);
  assertNoForbiddenSvgContent(svg, asset.path);
}

if (files.size !== 16) fail("Expected 16 unique SVG files");

const preview = readText(previewPath);
if (!preview.includes("/assets/visual/submeta/submeta_main_frame_v01_manifest.json")) {
  fail("Preview does not reference the v01 manifest");
}
for (const logicalName of logicalNames) {
  if (!preview.includes(logicalName)) {
    fail(`Preview does not reference ${logicalName}`);
  }
}

const frameComposer = readText(path.join(repoRoot, "hc.frame_composer.js"));
if (!frameComposer.includes("computeSubmetaMainFrameV01Layout")) fail("FrameComposer missing segmented v01 layout function");
if (!frameComposer.includes("drawSegmentedFrameParts")) fail("FrameComposer missing segmented draw function");

const cards = readText(path.join(repoRoot, "cards.js"));
if (!cards.includes("/assets/visual/submeta/submeta_main_frame_v01_manifest.json")) {
  fail("cards.js does not use the v01 manifest for the SUB-META root frame");
}
if (cards.includes("FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.edges")) {
  fail("cards.js still references one-full-edge SUB-META root part map");
}

console.log(JSON.stringify({
  ok: true,
  kitId: manifest.kitId,
  assetCount: manifest.assets.length,
  status: manifest.status,
  preview: path.relative(repoRoot, previewPath).replace(/\\/g, "/")
}, null, 2));
