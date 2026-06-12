const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const warnings = [];
const window = {
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
assert.ok(api, "HC.CardAssets should be registered");

const pairs = [
  ["red", "yellow"],
  ["red", "green"],
  ["red", "blue"],
  ["yellow", "green"],
  ["yellow", "blue"],
  ["green", "blue"]
];
const tiers = [
  ["DR", "dr"],
  ["sDR", "sdr"],
  ["pDR", "pdr"]
];

for (const [colorA, colorB] of pairs) {
  for (const [runtimeTier, filenameTier] of tiers) {
    const card = { kind: "R2", colorA: colorB, colorB: colorA, tier: runtimeTier };
    const expectedPath = `svg/card_r2_${colorA}_${colorB}_${filenameTier}.svg`;
    const asset = api.resolveCardAsset(card);
    assert.equal(asset.path, expectedPath, `R2 ${colorB}/${colorA} ${runtimeTier} should use canonical color order`);
    assert.equal(asset.url, `/Haiku-Cosmos/${expectedPath}`, "R2 URL should preserve the deployment base path");
    assert.equal(asset.format, "svg");
    assert.equal(fs.existsSync(path.join(repoRoot, "public", expectedPath)), true, `${expectedPath} should exist`);
  }
}

assert.equal(
  api.resolveCardAsset({ id: "CARD_R2_YELLOW_RED", tier: "DR" }).path,
  "svg/card_r2_red_yellow_dr.svg",
  "R2 identity parsing should canonicalize reversed colors"
);
assert.equal(
  api.resolveCardAsset({ key: "PRG_R2_pDR_BLUE_GREEN" }).path,
  "svg/card_r2_green_blue_pdr.svg",
  "R2 key parsing should normalize tier casing and color order"
);

const r1Detail = { kind: "R1", color: "red", tier: "DR" };
assert.equal(api.resolveCardAsset(r1Detail, { context: "detail" }).format, "png", "detail should prefer an existing PNG mapping");
const failedPng = api.resolveCardPngAsset(r1Detail);
api.markAssetFailed(failedPng, r1Detail);
assert.equal(api.resolveCardAsset(r1Detail, { context: "detail" }).format, "svg", "detail should fall back to SVG after PNG load failure");

const r2Detail = { kind: "R2", colors: ["blue", "red"], tier: "sDR" };
assert.equal(api.resolveCardPngAsset(r2Detail), null, "R2 detail should not invent a PNG path that is absent from the manifest");
assert.equal(api.resolveCardAsset(r2Detail, { context: "detail" }).path, "svg/card_r2_red_blue_sdr.svg", "R2 detail should use SVG when no PNG exists");

const malformedR2 = { kind: "R2", colorA: "red", tier: "DR", id: "BROKEN_R2" };
assert.equal(api.resolveCardAsset(malformedR2), null, "an incomplete R2 identity should preserve the procedural fallback");
assert.equal(api.resolveCardAsset(malformedR2), null);
assert.equal(warnings.filter(({ message }) => message.includes("could not be resolved")).length, 1, "unresolved warnings should be emitted once, not on every render");
assert.equal(warnings.filter(({ message }) => message.includes("failed to load")).length, 1, "load failure warnings should be emitted once per URL");

const cardsSource = fs.readFileSync(path.join(repoRoot, "cards.js"), "utf8");
const placeholdersSource = fs.readFileSync(path.join(repoRoot, "hc.submeta_placeholders.js"), "utf8");
assert.match(cardsSource, /CardAssets\?\.resolveCardAsset/, "canvas card renderer should use the central resolver");
assert.match(cardsSource, /ctx\.drawImage\(assetImage, x, y, rectW, rectH\)/, "canvas card renderer should draw the resolved SVG image");
assert.match(placeholdersSource, /CardAssets\?\.resolveCardAsset/, "DOM card renderer should use the central resolver");
assert.doesNotMatch(cardsSource, /["'`]\/svg\//, "canvas runtime must not hardcode root-relative SVG paths");
assert.doesNotMatch(placeholdersSource, /["'`]\/svg\//, "DOM runtime must not hardcode root-relative SVG paths");

console.log("card_assets_r2.test.js: OK");
