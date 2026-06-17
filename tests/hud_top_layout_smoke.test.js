import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('hc.hud_top_layout.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const layout = JSON.parse(fs.readFileSync('public/settings/hud-top-layout.json', 'utf8'));

const required = [
  'hud_top_right',
  'hud_top_rp',
  'hud_top_submeta',
  'hud_top_haiku_cosmos_settings',
  'hud_top_haiku_cosmos_logo',
  'hud_top_haiku_cosmos_info',
  'hud_top_dust_rp_background',
  'hud_top_dust_pile',
];

assert.equal(layout.baseWidth, 1920, 'HUD TOP layout baseWidth should be 1920');
assert.equal(layout.baseHeight, 403, 'HUD TOP layout baseHeight should be 403');
assert.equal(layout.elements.length, required.length, 'HUD TOP layout should define the required element count');

const byId = new Map(layout.elements.map((element) => [element.id, element]));
for (const id of required) {
  assert(byId.has(id), `missing HUD TOP element: ${id}`);
  const element = byId.get(id);
  assert.equal(typeof element.zIndex, 'number', `${id} should have zIndex`);
  assert(('scale' in element) || ('width' in element && 'height' in element), `${id} should have scale or explicit size`);
  assert(!String(element.asset).startsWith('/Haiku-Cosmos/'), `${id} should not hardcode GitHub Pages base`);
  assert(!String(element.asset).startsWith('/'), `${id} should use public-relative asset path`);
}

for (const id of ['hud_top_submeta', 'hud_top_haiku_cosmos_settings', 'hud_top_haiku_cosmos_logo']) {
  const rect = byId.get(id).interactiveRect;
  assert(rect?.id && rect?.role, `${id} should expose an interactive role/id`);
}

assert(source.includes('publicAssetPath(el.asset)') || source.includes('publicPath(el.asset)'), 'HUD TOP assets should be resolved through publicPath/publicAssetPath');
assert(source.includes('getHudTopScale()') && source.includes('/ BASE_WIDTH'), 'HUD TOP should scale from viewport width and baseWidth');
assert(indexHtml.includes('id="hudTopLayer"'), 'new layered HUD TOP mount should exist');
assert(!indexHtml.includes('id="hudTopImage"'), 'legacy single full HUD TOP image should not render in parallel');
assert(!indexHtml.includes('id="btnSubMeta"'), 'legacy separate SUB-META hitbox should not render in parallel');
assert(indexHtml.includes('id="scoreLabel"'), 'RP text should exist in the DOM');
assert(indexHtml.includes('id="hudTopSettingsPopup"'), 'minimal settings popup should exist');
