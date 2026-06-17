import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const sourcesToScan = [
  'hc.submeta_settings.js',
  'hc.submeta_png.js',
  'hc.hud_top_layout.js',
  'tests/submeta_settings_routing.test.js',
  'tests/submeta_png_layout_smoke.test.js',
  'docs/current/README.md',
  'docs/current/maps/PROJECT_INDEX.md',
  'docs/current/maps/DEPENDENCY_MAP.md',
  'docs/current/ui/SUB_META_RUNTIME_SNAPSHOT.md',
  'docs/current/technical/DEBUG_SETTINGS_STANDARD.md',
  'docs/current/technical/README.md',
];

assert.equal(fs.existsSync('public/settings/submeta-png-layout.json'), true, 'renamed SUB-META PNG layout settings should exist');
assert.equal(fs.existsSync('public/settings/hud-top-layout.json'), true, 'HUD TOP settings should exist');
assert.equal(fs.existsSync('public/settings/submeta-png-layout-export.json'), false, 'old export-named SUB-META PNG layout source should not remain');

for (const file of sourcesToScan) {
  const source = fs.readFileSync(file, 'utf8');
  assert(!source.includes('submeta-png-layout-export.json'), `${file} should not actively reference the old export-named settings file`);
}

const settingsSource = fs.readFileSync('hc.submeta_settings.js', 'utf8');
assert(settingsSource.includes('pngLayout: "settings/submeta-png-layout.json"'), 'SUB-META settings registry should use neutral PNG layout name');
assert.match(settingsSource, /root\.HC\?\.publicPath \|\| root\.HC\?\.publicAssetPath/, 'settings loader should use publicPath/publicAssetPath');
assert(!settingsSource.includes('/Haiku-Cosmos/'), 'settings loader should not hardcode GitHub Pages base');
assert(settingsSource.includes('logicalPath') && settingsSource.includes('resolvedUrl') && settingsSource.includes('status') && settingsSource.includes('fallbackUsed'), 'settings loader should report path/url/status/fallback diagnostics');

const hudSource = fs.readFileSync('hc.hud_top_layout.js', 'utf8');
assert(hudSource.includes('SETTINGS_PATH = "settings/hud-top-layout.json"'), 'HUD TOP should load default settings from public/settings logical path');
assert(hudSource.includes('data-hud-top-action="export"') && hudSource.includes('data-hud-top-action="import"'), 'HUD TOP mini panel should contain import/export actions');
assert(!hudSource.includes('data-hud-top-action="download"'), 'HUD TOP should not duplicate export through a separate download action');

for (const file of fs.readdirSync('public/settings')) {
  if (!file.endsWith('.json')) continue;
  JSON.parse(fs.readFileSync(path.join('public/settings', file), 'utf8'));
}

console.log('debug_settings_standard_static.test.js: OK');
