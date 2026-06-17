const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const preset = JSON.parse(fs.readFileSync(path.join(repoRoot, "public/settings/submeta-placeholders-panels.json"), "utf8"));
const storage = new Map();
const document = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  head: { appendChild() {} },
  createElement: () => ({
    style: {}, dataset: {}, classList: { add() {} }, appendChild() {}, addEventListener() {},
    remove() {}, setAttribute() {}
  })
};
const window = {
  HC: { SubMetaCardGeometry: { aspect: 9 / 16, ratioW: 9, ratioH: 16 }, SubMetaSettings: {
    paths: { panels: "settings/submeta-placeholders-panels.json" },
    async loadJson(logicalPath) {
      assert.equal(logicalPath, "settings/submeta-placeholders-panels.json");
      return { ok: true, payload: preset, resolvedUrl: `/Haiku-Cosmos/${logicalPath}` };
    }
  } }, document, console,
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
  "resetToDefault", "exportLayout", "importLayout"
];
for (const method of requiredApi) assert.equal(typeof panels[method], "function", `missing ${method}()`);

async function main() {
assert.equal(await panels.loadRuntimeSetting("test"), true);
const runtimePreset = panels.getExportPayload();
assert.equal(runtimePreset.panels.find((item) => item.id === "panel.inventory").gridColumns, preset.panels[0].gridColumns);
assert.equal(runtimePreset.panels.find((item) => item.id === "panel.inventory").w, preset.panels[0].w);

const byId = new Map(preset.panels.map((item) => [item.id, item]));
for (const id of [
  "panel.inventory", "panel.possibilities", "panel.forge", "panel.detail",
  "inventory.filter.normal", "inventory.filter.special", "inventory.filter.resources",
  "inventory.scroll.up", "inventory.scroll.down",
  "detail.preview_card", "detail.description", "detail.haiku"
]) assert.ok(byId.has(id), `missing ${id}`);

assert.equal(byId.get("panel.inventory").gridRowsVisible, 3);
assert.equal(byId.get("panel.inventory").pageStepRows, 3);
assert.equal(byId.get("panel.inventory").cardRatioW, 9);
assert.equal(byId.get("panel.inventory").cardRatioH, 16);

const imported = structuredClone(preset);
imported.panels.find((item) => item.id === "panel.forge").gap = 0.02;
assert.equal(panels.importLayout(imported), true);
assert.equal(panels.getPanels().find((item) => item.id === "panel.forge").gapX, 0.02);
assert.match(panels.exportLayout(), /"panel\.forge"/);
assert.equal(storage.size, 0, "panel layout tuning should not use localStorage as source of truth");
assert.equal(await panels.resetToDefault(), true);
assert.equal(panels.getPanels().find((item) => item.id === "panel.forge").gapX, byId.get("panel.forge").gapX);

console.log("submeta_panels_smoke.test.js: OK");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
