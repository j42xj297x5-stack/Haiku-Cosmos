const assert = require('assert');
const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'cards.js'), 'utf8');

for (const assetName of [
  'dust_pile_empty',
  'dust_pile_red_full',
  'dust_pile_yellow_full',
  'dust_pile_green_full',
  'dust_pile_blue_full',
  'dust_pile_grey_full',
]) {
  assert(source.includes(assetName), `${assetName} should be wired into the HUD dust pile loader`);
}

assert(source.includes('const DUST_PILE_THRESHOLDS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]'), 'all 0-90 mask thresholds should be wired');
for (const typeName of ['NONE', 'RED', 'YELLOW', 'GREEN', 'BLUE', 'GREY']) {
  assert(source.includes(typeName), `${typeName} should be supported by dust pile HUD/debug state`);
}

for (const threshold of [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) {
  assert(source.includes(String(threshold)), `${threshold}% should be supported by dust pile HUD/debug state`);
}

assert(source.includes('`dust_pile_mask_${threshold}`'), 'mask asset names should be generated only from 10% thresholds');
assert(!source.includes('ctx.drawImage(emptyEntry.image'), 'HUD dust pile should not draw the empty/base background layer');
assert(!source.includes('drawDustPileFallback(ctx, x, y, w, h, { activeType: "NONE"'), 'HUD dust pile fallback should not draw an empty/base background layer');

for (const forbidden of [
  'dust_pile_red_yellow',
  'dust_pile_green_blue',
  'dust_pile_red_yellow_green',
]) {
  assert(!source.includes(forbidden), `${forbidden} must not be used by the base HUD`);
}

assert(source.includes('window.HC.publicAssetPath'), 'dust pile URLs should prefer HC.publicAssetPath');
assert(source.includes('window.HC.publicPath'), 'dust pile URLs should fall back to HC.publicPath');
assert(!source.includes('/Haiku-Cosmos/png/dust'), 'dust pile URLs must not hardcode the GitHub Pages project path');
assert(source.includes('floorDustPileMaskThreshold'), 'intermediate percentages should floor to 10% mask thresholds');
assert(source.includes('activeType !== type && pile.activeType !== "GREY"'), 'wrong color should switch the active layer to GREY');
assert(source.includes('pile.percent = Math.max(0, Math.min(100'), 'grey transition should preserve and clamp existing fill instead of resetting');
assert(source.includes('!model.usesMask'), '100% state should render the full pile without a mask');
assert(source.includes('setDustPileDebugState'), 'debug/probe setter should be exposed for the dust pile');
assert(source.includes('setDebugState(debugState)'), 'HC.DustPileHud.setDebugState should be wired');
assert(source.includes('dustPileMountRect') && source.includes('positionX') && source.includes('positionY') && source.includes('width') && source.includes('height'), 'dust pile position/size should come from the normalized HUD TOP mount and be evidenced');
assert(!source.includes('.dustPileHud'), 'dust pile should not use legacy px-only dustPileHud x/y/scale');

console.log('dust_pile_hud_static.test.js: OK');
