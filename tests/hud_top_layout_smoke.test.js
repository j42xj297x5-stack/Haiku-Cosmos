import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('hc.hud_top_layout.js', 'utf8');
const cardsSource = fs.readFileSync('cards.js', 'utf8');
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

assert.equal(layout.version, 2, 'HUD TOP layout should be version 2');
assert.equal(layout.coordinateSystem, 'viewport_normalized', 'HUD TOP layout should use normalized viewport rects');
assert.equal(layout.elements.length, required.length, 'HUD TOP layout should define the required element count');

const byId = new Map(layout.elements.map((element) => [element.id, element]));
for (const id of required) {
  assert(byId.has(id), `missing HUD TOP element: ${id}`);
  const element = byId.get(id);
  for (const field of ['x', 'y', 'w', 'h']) {
    assert.equal(typeof element[field], 'number', `${id} should have numeric ${field}`);
    assert(element[field] >= 0 && element[field] <= 1, `${id}.${field} should be normalized 0..1`);
  }
  assert.equal(typeof element.zIndex, 'number', `${id} should have zIndex`);
  assert.equal(typeof element.visible, 'boolean', `${id} should have visible`);
  assert.equal(typeof element.preserveAspect, 'boolean', `${id} should have preserveAspect`);
  assert(!('scale' in element), `${id} should not use legacy scale`);
  assert(!String(element.asset).startsWith('/Haiku-Cosmos/'), `${id} should not hardcode GitHub Pages base`);
  assert(!String(element.asset).startsWith('/'), `${id} should use public-relative asset path`);
}

for (const id of ['hud_top_submeta', 'hud_top_haiku_cosmos_settings', 'hud_top_haiku_cosmos_logo', 'hud_top_dust_pile']) {
  const element = byId.get(id);
  assert.equal(element.interactive, true, `${id} should be interactive`);
  assert(element.interactiveRect?.id && element.interactiveRect?.role, `${id} should expose an interactive role/id`);
}

assert.equal(byId.get('hud_top_rp').mountRole, 'rpText', 'RP should have a normalized mount rect');
assert.equal(byId.get('hud_top_dust_pile').mountRole, 'dustPile', 'dust pile should have a normalized mount rect');

assert(source.includes('COORDINATE_SYSTEM = "viewport_normalized"'), 'runtime should declare the normalized coordinate system');
assert(source.includes('el.x * v.width') && source.includes('el.h * v.height'), 'runtime should convert normalized rects to viewport pixels');
assert(!source.includes('function getHudTopScale'), 'runtime should not expose global HUD TOP scale as source of truth');
assert(!source.includes('/ BASE_WIDTH'), 'runtime should not scale all HUD TOP by base width');
for (const field of ['x', 'y', 'w', 'h']) {
  assert(source.includes(`row("${field}", "${field}", 0, 1, 0.001)`), `debug editor should expose normalized ${field}`);
}
assert(source.includes('preserveAspect'), 'debug/runtime should expose per-element preserveAspect');
assert(source.includes('publicAssetPath(el.asset)') || source.includes('publicPath(el.asset)'), 'HUD TOP assets should be resolved through publicPath/publicAssetPath');
assert(source.includes('SETTINGS_PATH = "settings/hud-top-layout.json"'), 'HUD TOP should declare public/settings logical path');
assert(source.includes('resolveSettingsUrl()'), 'HUD TOP settings URL should be resolved through publicPath/publicAssetPath helper');
assert(source.includes('data-hud-top-action="export"') && source.includes('Export JSON'), 'HUD TOP debug mini panel should expose Export JSON');
assert(source.includes('data-hud-top-action="import"') && source.includes('Import JSON'), 'HUD TOP debug mini panel should expose Import JSON beside export');
assert(!source.includes('data-hud-top-action="download"'), 'HUD TOP should not keep a separate download export mechanism');
assert(!source.includes('loaded localStorage'), 'HUD TOP public settings should not be overridden by legacy localStorage defaults');
assert(!source.includes('root.localStorage.setItem(STORAGE_KEY'), 'HUD TOP debug edits should stay runtime-only until exported to public/settings JSON');

assert(cardsSource.includes('dustPileMountRect'), 'dust pile render should consume normalized HUD TOP mount rect');
assert(!cardsSource.includes('.dustPileHud'), 'dust pile render should not use legacy dustPileHud x/y/scale');
assert(!/dustPileHud\s*=\s*\{\s*x\s*:/.test(source), 'runtime should not recreate px-only dustPileHud');

assert(indexHtml.includes('id="hudTopLayer"'), 'new layered HUD TOP mount should exist');
assert(!indexHtml.includes('id="hudTopImage"'), 'legacy single full HUD TOP image should not render in parallel');
assert(!indexHtml.includes('id="btnSubMeta"'), 'legacy separate SUB-META hitbox should not render in parallel');
assert(indexHtml.includes('id="scoreLabel"'), 'RP text should exist in the DOM');
assert(indexHtml.includes('id="hudTopSettingsPopup"'), 'minimal settings popup should exist');

console.log('hud_top_layout_smoke.test.js: OK');
