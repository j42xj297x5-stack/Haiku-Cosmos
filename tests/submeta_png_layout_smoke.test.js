const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(repoRoot, "public/settings/submeta-png-layout-export.json");
const expectedDefault = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

assert.equal(expectedDefault.version, "submeta-png-layout-v0.1");
assert.deepEqual(expectedDefault.designSize, { width: 1536, height: 1024 });
assert.ok(Array.isArray(expectedDefault.elements));
assert.ok(expectedDefault.elements.length > 0);

const ids = expectedDefault.elements.map((item) => item.id);
assert.equal(new Set(ids).size, ids.length, "exported layout element ids should be unique");

const storage = new Map();
const window = {
  HC: { SubMetaSettings: {
    paths: { pngLayout: "settings/submeta-png-layout-export.json" },
    async loadJson(logicalPath) {
      assert.equal(logicalPath, "settings/submeta-png-layout-export.json");
      return { ok: true, payload: expectedDefault, resolvedUrl: `/Haiku-Cosmos/${logicalPath}` };
    }
  } },
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  },
};
const context = vm.createContext({ window, console, Blob, URL, setTimeout });
const runtimeSource = fs.readFileSync(path.join(repoRoot, "hc.submeta_png.js"), "utf8");
vm.runInContext(runtimeSource, context, { filename: "hc.submeta_png.js" });

const layout = window.HC.SubMetaPngLayout;
assert.ok(layout, "HC.SubMetaPngLayout should be registered");
assert.equal(layout.VERSION, expectedDefault.version);
assert.deepEqual({ ...layout.DESIGN_SIZE }, expectedDefault.designSize);
assert.equal(layout.LAYOUT_STORAGE_KEY, "hc.submetaPng.layout.v1");
assert.equal(typeof layout.loadRuntimeSetting, "function");

async function main() {
  assert.equal(await layout.loadRuntimeSetting(), true);
  assert.deepEqual(
    JSON.parse(JSON.stringify(layout.getExportPayload())),
    expectedDefault,
    "runtime setting should apply the checked-in layout export",
  );

const savedOverride = {
  version: expectedDefault.version,
  designSize: expectedDefault.designSize,
  elements: [
    { ...expectedDefault.elements[0], x: 0.25, opacity: 0.5 },
    { id: "unknown-legacy-element", x: 0.1, y: 0.2 },
  ],
};
storage.set(layout.LAYOUT_STORAGE_KEY, JSON.stringify(savedOverride));
assert.equal(layout.loadLayout(), true, "a valid saved layout should load");

const merged = JSON.parse(JSON.stringify(layout.getExportPayload()));
assert.equal(merged.elements.length, expectedDefault.elements.length);
assert.equal(merged.elements[0].x, 0.25, "saved localStorage values should override defaults by id");
assert.equal(merged.elements[0].opacity, 0.5, "saved localStorage opacity should override the default");
assert.ok(
  merged.elements.some((item) => item.id === expectedDefault.elements.at(-1).id),
  "elements missing from older localStorage should be restored from the default",
);
assert.equal(
  merged.elements.some((item) => item.id === "unknown-legacy-element"),
  false,
  "unknown legacy elements should not crash or replace known defaults",
);

assert.equal(await layout.resetAll(), true);
assert.deepEqual(
  JSON.parse(JSON.stringify(layout.getExportPayload())),
  expectedDefault,
  "Reset all should restore the checked-in default export",
);
assert.equal(
  storage.has(layout.LAYOUT_STORAGE_KEY),
  false,
  "Reset all should clear localStorage so the public runtime setting remains authoritative",
);

const r2World = expectedDefault.elements.find((item) => item.src === "submeta_r2-swiat.png");
if (r2World) {
  assert.deepEqual(
    JSON.parse(JSON.stringify(layout.getElements().find((item) => item.id === r2World.id))),
    r2World,
    "R2 Świat should retain the exact exported id, src, transform, and zIndex",
  );
}

  console.log("submeta_png_layout_smoke.test.js: OK");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
