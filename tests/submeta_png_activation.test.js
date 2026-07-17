const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(repoRoot, "hc.submeta_png.js"), "utf8");

function loadLayout(storedValue, mode) {
  const storage = new Map();
  if (storedValue !== undefined) storage.set("hc.submetaPng.enabled.v1", storedValue);
  const document = {
    baseURI: "https://example.test/Haiku-Cosmos/",
    querySelector: () => null,
    getElementById: () => null,
    head: { appendChild() {} },
    createElement: () => ({ style: {} })
  };
  const window = {
    HC: { Session: { mode } }, document,
    location: { href: document.baseURI },
    localStorage: {
      getItem(key) { return storage.has(key) ? storage.get(key) : null; },
      setItem(key, value) { storage.set(key, String(value)); }
    }
  };
  vm.runInContext(source, vm.createContext({ window, document, console, Blob, URL, setTimeout }), { filename: "hc.submeta_png.js" });
  return window.HC.SubMetaPngLayout;
}

assert.equal(loadLayout(undefined, "normal").isActive(), true, "empty storage defaults to PNG in normal mode");
assert.equal(loadLayout("false", "normal").isActive(), true, "stored debug false cannot disable normal mode");
assert.equal(loadLayout("false", "debug").isActive(), false, "stored false enables legacy fallback in debug");
assert.equal(loadLayout("true", "debug").isActive(), true, "stored true enables PNG in debug");

const cardsSource = fs.readFileSync(path.join(repoRoot, "cards.js"), "utf8");
assert.match(cardsSource, /if \(!window\.HC\?\.SubMetaPngLayout\?\.isActive\?\.\(\)\)\s*\{[\s\S]*?handleSubMetaPointerDown/, "legacy pointer path must be guarded by inactive PNG layout");

console.log("submeta_png_activation.test.js: OK");
