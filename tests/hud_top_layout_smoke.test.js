const fs = require('fs');
const path = require('path');
const vm = require('vm');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const storage = new Map();
const window = {
  HC: {},
  innerWidth: 1536,
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
  },
};
const context = vm.createContext({ window, console, Blob, URL, setTimeout });
const source = fs.readFileSync(path.join(__dirname, '..', 'hc.hud_top_layout.js'), 'utf8');
vm.runInContext(source, context, { filename: 'hc.hud_top_layout.js' });

const HudTopLayout = window.HC.HudTopLayout;
assert(HudTopLayout, 'HC.HudTopLayout should be registered');
assert(HudTopLayout.LAYOUT_VERSION === 1, 'layout contract version should be 1');

const applied = HudTopLayout.setLayout({
  overlay: { scale: 1.25, top: 12, centerOffsetX: -18, width: 1658 },
  subMetaButton: { centerX: 820, centerY: 100, size: 144 },
  rpText: { x: 1400, y: 92, fontSize: 31, letterSpacing: 1.5, align: 'right' },
});
assert(applied.overlay.scale === 1.25, 'overlay scale should update');
assert(applied.subMetaButton.size === 144, 'SUB-META hitbox size should update');
assert(applied.rpText.align === 'right', 'RP alignment should update');
assert(storage.has(HudTopLayout.STORAGE_KEY), 'layout should persist to localStorage');

const imported = HudTopLayout.importLayout(JSON.stringify({
  overlay: { scale: 99, width: 10 },
  subMetaButton: { size: -5 },
  rpText: { align: 'unsupported' },
}));
assert(imported.overlay.scale === 3, 'overlay scale should be clamped');
assert(imported.overlay.width === 320, 'overlay width should be clamped');
assert(imported.subMetaButton.size === 16, 'hitbox size should be clamped');
assert(imported.rpText.align === 'left', 'invalid RP alignment should fall back');

const html = HudTopLayout.renderDebugHtml();
assert(html.includes('HUD Top Layout'), 'debug section should be rendered');
assert(html.includes('data-hud-top-field="overlay.scale"'), 'live overlay control should be rendered');
assert(html.includes('data-hud-top-action="import"'), 'JSON import action should be rendered');
assert(html.includes('data-hud-top-action="download"'), 'JSON export action should be rendered');

const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.codex.html'), 'utf8');
assert(indexHtml.includes('id="hudTopImage"'), 'top HUD image should exist in the DOM');
assert(indexHtml.includes('runtime/hc.hud_top_layout.js'), 'top HUD runtime module should be loaded');
assert(indexHtml.includes('id="btnSubMeta"'), 'SUB-META hitbox should exist in the DOM');
assert(indexHtml.includes('id="scoreLabel"'), 'RP text should exist in the DOM');
assert(indexHtml.includes('pointer-events: none;'), 'HUD CSS should include non-blocking pointer behavior');

console.log('hud_top_layout_smoke.test.js: OK');
