const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const code = fs.readFileSync(path.join(repoRoot, "hc.debug.js"), "utf8");
const window = {
  HC: {},
  addEventListener() {},
  localStorage: { getItem() { return null; }, setItem() {} },
};
const context = vm.createContext({
  window,
  localStorage: window.localStorage,
  console,
  setInterval() { return 1; },
  clearInterval() {},
  Date,
  Math,
  JSON,
  Object,
  Array,
  Number,
  String,
  Boolean,
});

vm.runInContext(code, context, { filename: "hc.debug.js" });

const normal = window.HC.createDebugConfig("normal");
assert.equal(normal.visual.rendererMode, "three");
assert.equal(normal.visual.worldRendererMode, "three");
assert.equal(normal.visual.defaultRenderer, "three");
assert.equal(normal.visual.cameraModel, "stage_normalized");

const debug = window.HC.createDebugConfig("debug");
assert.equal(debug.visual.rendererMode, "three");
assert.equal(debug.visual.worldRendererMode, "three");
assert.equal(debug.visual.defaultRenderer, "three");
assert.equal(debug.visual.cameraModel, "stage_normalized");

const legacyDebug = window.HC.createDebugConfig("debug", { visual: { rendererMode: "canvas2d" } });
assert.equal(legacyDebug.visual.rendererMode, "canvas2d");
assert.equal(legacyDebug.visual.worldRendererMode, "canvas2d");
assert.equal(legacyDebug.visual.defaultRenderer, "canvas2d");


const rendererSource = fs.readFileSync(path.join(repoRoot, "hc.world_renderer.js"), "utf8");
assert.match(rendererSource, /const DEFAULT_RENDER_MODE = "three"/);
assert.match(rendererSource, /let requestedMode = DEFAULT_RENDER_MODE/);

const bootSource = fs.readFileSync(path.join(repoRoot, "game.boot.js"), "utf8");
assert.match(bootSource, /window\.HC\.RENDER_MODE = "three"/);
assert.match(bootSource, /WorldRenderer\.init\(\{ mode: window\.HC\.RENDER_MODE \|\| "three" \}\)/);

const uiSource = fs.readFileSync(path.join(repoRoot, "hc.ui_debug.js"), "utf8");
assert.match(uiSource, /Three\.js — default \/ recommended/);
assert.match(uiSource, /Canvas2D — legacy mechanics verification \/ fallback/);

console.log("default renderer Three config contract ok");
