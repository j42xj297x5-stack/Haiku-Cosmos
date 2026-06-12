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

const triples = [
  ["red", "yellow", "green"],
  ["red", "yellow", "blue"],
  ["red", "green", "blue"],
  ["yellow", "green", "blue"]
];
const tiers = [
  ["DR", "dr"],
  ["sDR", "sdr"],
  ["pDR", "pdr"]
];

for (const colors of triples) {
  for (const [runtimeTier, filenameTier] of tiers) {
    const card = { kind: "R3", colors: colors.slice().reverse(), tier: runtimeTier };
    const expectedPath = `svg/card_r3_${colors.join("_")}_${filenameTier}.svg`;
    const asset = api.resolveCardAsset(card);
    assert.equal(asset.path, expectedPath, `R3 ${colors.join("/")} ${runtimeTier} should use canonical color order`);
    assert.equal(asset.url, `/Haiku-Cosmos/${expectedPath}`, "R3 URL should preserve the deployment base path");
    assert.equal(asset.format, "svg");
  }
}

assert.equal(
  api.resolveCardAsset({ id: "CARD_R3_BLUE_RED_YELLOW", tier: "DR" }).path,
  "svg/card_r3_red_yellow_blue_dr.svg",
  "R3 identity parsing should canonicalize reversed colors"
);
assert.equal(
  api.resolveCardAsset({ key: "PRG_R3_pDR_BLUE_GREEN_RED" }).path,
  "svg/card_r3_red_green_blue_pdr.svg",
  "R3 key parsing should normalize tier casing and color order"
);

const detailCard = { kind: "R3", colorA: "blue", colorB: "yellow", colorC: "green", tier: "sDR" };
assert.equal(api.resolveCardPngAsset(detailCard), null, "R3 detail should not invent an absent PNG path");
assert.equal(
  api.resolveCardAsset(detailCard, { context: "detail" }).path,
  "svg/card_r3_yellow_green_blue_sdr.svg",
  "R3 detail should safely use SVG when no PNG mapping exists"
);

const missingAsset = api.resolveCardAsset({ kind: "R3", colors: ["red", "green", "blue"], tier: "DR" });
api.markAssetFailed(missingAsset, { id: "CARD_R3_RED_GREEN_BLUE", tier: "DR" });
assert.equal(
  api.resolveCardAsset({ kind: "R3", colors: ["red", "green", "blue"], tier: "DR" }),
  null,
  "a failed R3 URL should resolve to the procedural fallback on later renders"
);
api.markAssetFailed(missingAsset, { id: "CARD_R3_RED_GREEN_BLUE", tier: "DR" });
assert.equal(warnings.filter(({ message }) => message.includes("failed to load")).length, 1, "R3 load failure warnings should be emitted once per URL");

const unresolvedWarningCountBeforeMalformed = warnings.filter(({ message }) => message.includes("could not be resolved")).length;
const malformedR3 = { kind: "R3", colors: ["red", "yellow"], tier: "DR", id: "BROKEN_R3" };
assert.equal(api.resolveCardAsset(malformedR3), null, "an incomplete R3 identity should preserve the procedural fallback");
assert.equal(api.resolveCardAsset(malformedR3), null);
assert.equal(
  warnings.filter(({ message }) => message.includes("could not be resolved")).length,
  unresolvedWarningCountBeforeMalformed + 1,
  "each unresolved R3 identity should warn once, not on every render"
);

const existingR3Files = fs.readdirSync(path.join(repoRoot, "public", "svg")).filter((name) => /^card_r3_.*\.svg$/.test(name));
for (const fileName of existingR3Files) {
  const expectedNames = new Set(triples.flatMap((colors) => tiers.map(([, tier]) => `card_r3_${colors.join("_")}_${tier}.svg`)));
  assert.equal(expectedNames.has(fileName), true, `existing R3 asset should use a canonical runtime filename: ${fileName}`);
}

console.log(`card_assets_r3.test.js: OK (${existingR3Files.length}/12 R3 SVG files present)`);
