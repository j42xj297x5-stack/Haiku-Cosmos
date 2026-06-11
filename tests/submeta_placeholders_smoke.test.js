const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const presetPath = path.join(repoRoot, "public/png/submeta/submeta-placeholders.json");
const expectedDefault = JSON.parse(fs.readFileSync(presetPath, "utf8"));
const storage = new Map();
const headChildren = [];
const document = {
  head: { appendChild(node) { headChildren.push(node); } },
  getElementById() { return null; },
  querySelector() { return null; },
  createElement(tagName) {
    return { tagName, id: "", style: {}, dataset: {}, textContent: "", setAttribute() {}, appendChild() {}, addEventListener() {}, remove() {} };
  },
};
const cardsPool = [{ key: "sentinel-card" }];
const window = {
  HC: { Session: { mode: "debug" } },
  World: { cardsPool },
  document,
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  },
};
const quietConsole = { ...console, debug() {}, info() {} };
const context = vm.createContext({ window, document, console: quietConsole });
const runtimeSource = fs.readFileSync(path.join(repoRoot, "hc.submeta_placeholders.js"), "utf8");
vm.runInContext(runtimeSource, context, { filename: "hc.submeta_placeholders.js" });

const api = window.HC.SubMetaPlaceholders;
assert.ok(api, "HC.SubMetaPlaceholders should be registered");
assert.equal(api.VERSION, "submeta-placeholders-v0.3");
assert.deepEqual(Array.from(api.GROUPS), ["PRG R1", "PRG R2", "R3", "R4", "Świat", "Świat R2"]);

api.init();
const placeholders = api.getPlaceholders();
assert.deepEqual(
  JSON.parse(api.exportJson()),
  expectedDefault,
  "fresh runtime default should exactly match the checked-in v0.3 preset",
);
assert.equal(placeholders.length, 55, "the complete gameplay preset should contain 55 stable sockets");
assert.equal(new Set(placeholders.map((item) => item.id)).size, placeholders.length, "placeholder ids should be unique");
assert.deepEqual(
  Object.fromEntries(Array.from(api.GROUPS, (group) => [group, placeholders.filter((item) => item.group === group).length])),
  { "PRG R1": 12, "PRG R2": 6, R3: 6, R4: 9, "Świat": 16, "Świat R2": 6 },
);

const requiredFields = ["id", "group", "subgroup", "kind", "state", "x", "y", "w", "h", "zIndex", "visibleInGame", "visibleInDebug", "selected", "label"];
for (const item of placeholders) {
  for (const field of requiredFields) assert.ok(Object.hasOwn(item, field), `${item.id} should contain ${field}`);
}

for (const id of [
  "prg.forma.r1.1", "prg.cisza.dust", "prg.r2.3.card", "core.r3.3.dust", "core.r4.main",
  "core.r4.special.4", "core.r4.dust.4", "world.slot.4.artifact", "world.r2.3.dust",
]) assert.ok(placeholders.some((item) => item.id === id), `${id} should exist`);

assert.ok(placeholders.filter((item) => item.id.startsWith("core.r4.special.") || item.id.startsWith("core.r4.dust.")).every((item) => item.state === "hidden"));
assert.equal(api.selectPlaceholder("prg.forma.r1.1"), true);
assert.equal(api.getSelectedPlaceholderId(), "prg.forma.r1.1");
assert.equal(api.getPlaceholders().find((item) => item.id === "prg.forma.r1.1").selected, true);
assert.equal(api.updateSelectedField("x", 0.321), true);
assert.equal(api.updateSelectedField("w", 0.061), true);
assert.equal(api.getPlaceholders().find((item) => item.id === "prg.forma.r1.1").x, 0.321);
assert.equal(api.getPlaceholders().find((item) => item.id === "prg.forma.r1.1").w, 0.061);
assert.deepEqual(window.World.cardsPool, cardsPool, "placeholder selection and tuning must not mutate the card pool");

assert.equal(api.savePreset(), true);
const saved = JSON.parse(storage.get(api.STORAGE_KEY));
assert.equal(saved.placeholders.find((item) => item.id === "prg.forma.r1.1").x, 0.321);
assert.equal(api.importJson(JSON.stringify({ ...saved, placeholders: saved.placeholders.map((item) => item.id === "prg.forma.r1.1" ? { ...item, y: 0.222 } : item) })), true);
assert.equal(api.getPlaceholders().find((item) => item.id === "prg.forma.r1.1").y, 0.222);
assert.equal(api.updateSelectedField("y", 0.333), true);
assert.equal(api.loadPreset(), true, "localStorage preset should take precedence when explicitly loaded");
assert.equal(api.getPlaceholders().find((item) => item.id === "prg.forma.r1.1").y, 0.222);
assert.equal(JSON.parse(api.exportJson()).version, "submeta-placeholders-v0.3");
assert.match(api.exportJson(), /"world\.r2\.3\.dust"/);

api.resetAll();
assert.deepEqual(
  JSON.parse(api.exportJson()),
  expectedDefault,
  "reset should restore the checked-in v0.3 preset exactly",
);
assert.equal(storage.has(api.STORAGE_KEY), false, "reset should remove the saved tuning preset");
assert.deepEqual(window.World.cardsPool, cardsPool, "reset must not mutate the card pool");

console.log("submeta_placeholders_smoke.test.js: OK");
