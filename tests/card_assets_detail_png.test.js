const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const warnings = [];
const createdImages = [];
class FakeImage {
  constructor() {
    createdImages.push(this);
    this.onload = null;
    this.onerror = null;
  }
  set src(value) { this._src = value; }
  get src() { return this._src; }
}
const window = {
  Image: FakeImage,
  HC: {
    publicPath(logicalPath) {
      return `/Haiku-Cosmos/${String(logicalPath).replace(/^\/+/, "").replace(/^public\//, "")}`;
    }
  }
};
const context = vm.createContext({
  window,
  console: { ...console, warn(message, details) { warnings.push({ message, details }); } }
});
vm.runInContext(fs.readFileSync(path.join(repoRoot, "hc.card_assets.js"), "utf8"), context, {
  filename: "hc.card_assets.js"
});

const api = window.HC.CardAssets;
const detailCases = [
  [{ kind: "R1", colors: ["yellow"], tier: "DR" }, "png/cards/card_r1_yellow_dr.png"],
  [{ kind: "R2", colors: ["blue", "yellow"], tier: "sDR" }, "png/cards/card_r2_yellow_blue_sdr.png"],
  [{ kind: "R3", colors: ["blue", "red", "green"], tier: "pDR" }, "png/cards/card_r3_red_green_blue_pdr.png"],
  [{ kind: "R4", colors: ["blue", "green", "yellow", "red"], tier: "DR" }, "png/cards/card_r4_red_yellow_green_blue_dr.png"]
];

for (const [card, expectedPath] of detailCases) {
  const detailAsset = api.resolveCardAsset(card, { context: "detail" });
  assert.equal(detailAsset.path, expectedPath);
  assert.equal(detailAsset.url, `/Haiku-Cosmos/${expectedPath}`);
  assert.equal(detailAsset.format, "png");
}

const r4 = detailCases[3][0];
assert.equal(api.resolveCardAsset(r4), null, "R4 should remain procedural outside the detail reader");
assert.equal(api.normalizeKind({ id: "CARD_R4_BLUE_GREEN_YELLOW_RED" }), "R4");

const cachedAsset = api.resolveCardAsset(detailCases[1][0], { context: "detail" });
const firstEntry = api.getCachedImage(cachedAsset, detailCases[1][0]);
const secondEntry = api.getCachedImage(cachedAsset, detailCases[1][0]);
assert.equal(firstEntry, secondEntry, "detail image cache should reuse one entry per base-aware URL");
assert.equal(createdImages.length, 1, "cached detail PNG should not allocate a new Image on each render");

firstEntry.image.onerror();
assert.equal(api.resolveCardAsset(detailCases[1][0], { context: "detail" }).format, "svg", "failed PNG should fall back to the existing SVG renderer");
firstEntry.image.onerror();
assert.equal(warnings.filter(({ message }) => message.includes("failed to load")).length, 1, "failed PNG should warn only once per URL");

const placeholdersSource = fs.readFileSync(path.join(repoRoot, "hc.submeta_placeholders.js"), "utf8");
assert.match(placeholdersSource, /context === "detail"[\s\S]*getCachedImage/, "only detail rendering should opt into the shared image cache");
assert.match(placeholdersSource, /object-fit:contain/, "detail card assets should preserve their aspect ratio");

console.log("card_assets_detail_png.test.js: OK");
