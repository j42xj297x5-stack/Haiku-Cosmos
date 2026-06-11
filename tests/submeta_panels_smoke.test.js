const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const storage = new Map();
const document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  head: { appendChild() {} },
  createElement: () => ({
    style: {}, dataset: {}, classList: { add() {} }, appendChild() {}, addEventListener() {},
    remove() {}, setAttribute() {}
  })
};
const window = {
  HC: {}, document, console,
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key)
  }
};

vm.runInNewContext(fs.readFileSync(path.join(repoRoot, "hc.submeta_panels.js"), "utf8"), { window, document, console });

const panels = window.HC.SubMetaPanels;
const requiredApi = [
  "init", "syncDom", "setVisible", "isVisible", "getSelectedPanelId", "getDebugState",
  "resetToDefault", "exportLayout", "importLayout", "saveLayout", "loadLayout"
];
for (const method of requiredApi) assert.equal(typeof panels[method], "function", `missing ${method}()`);

const preset = JSON.parse(fs.readFileSync(path.join(repoRoot, "public/png/submeta/submeta-panels-layout-export.json"), "utf8"));
assert.deepEqual(JSON.parse(JSON.stringify(panels.getExportPayload())), preset, "runtime defaults must match the checked-in panel preset");

const byId = new Map(preset.panels.map((item) => [item.id, item]));
for (const id of [
  "panel.inventory", "panel.possibilities", "panel.forge", "panel.detail",
  "inventory.filter.normal", "inventory.filter.special", "inventory.filter.resources",
  "inventory.scroll.up", "inventory.scroll.down",
  "detail.preview_card", "detail.description", "detail.haiku"
]) assert.ok(byId.has(id), `missing ${id}`);

assert.equal(byId.get("panel.inventory").gridRowsVisible, 3);
assert.equal(byId.get("panel.inventory").pageStepRows, 3);
assert.equal(byId.get("panel.inventory").cardRatioW, 1.3);
assert.equal(byId.get("panel.inventory").cardRatioH, 2.3);

const imported = structuredClone(preset);
imported.panels.find((item) => item.id === "panel.forge").gapX = 0.02;
assert.equal(panels.importLayout(imported), true);
assert.equal(panels.getPanels().find((item) => item.id === "panel.forge").gapX, 0.02);
assert.equal(panels.saveLayout(), true);
assert.ok(storage.has(panels.STORAGE_KEY));
assert.equal(panels.resetToDefault(), true);
assert.equal(panels.getPanels().find((item) => item.id === "panel.forge").gapX, byId.get("panel.forge").gapX);

console.log("submeta_panels_smoke.test.js: OK");
