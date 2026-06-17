const fs = require("fs");
const path = require("path");
const assert = require("assert");

const repoRoot = process.cwd();
const html = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
const uiDebug = fs.readFileSync(path.join(repoRoot, "hc.ui_debug.js"), "utf8");
const legacyRuntimeFiles = fs.readFileSync(path.join(repoRoot, "scripts", "legacy-runtime-files.mjs"), "utf8");

function scriptSrcs(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/g)].map((match) => match[1]);
}

const srcs = scriptSrcs(html);
const saveSrc = srcs.find((src) => src.includes("hc.save_system.js"));
assert(saveSrc, "index.html must load hc.save_system.js");
assert(!saveSrc.includes("/Haiku-Cosmos/"), "hc.save_system.js script src must not hardcode /Haiku-Cosmos/");

const runtimePath = saveSrc.replace(/^%BASE_URL%/, "").replace(/^\.\//, "");
assert.strictEqual(runtimePath, "runtime/hc.save_system.js", "hc.save_system.js should use the runtime/ path convention");
assert(fs.existsSync(path.join(repoRoot, "hc.save_system.js")), "hc.save_system.js source file must exist at repo root");
assert(legacyRuntimeFiles.includes('"hc.save_system.js"'), "legacy runtime sync must include hc.save_system.js for public/runtime and dist/runtime");

const assetLoaderIndex = srcs.findIndex((src) => src.includes("hc.asset_loader.js"));
const saveIndex = srcs.findIndex((src) => src.includes("hc.save_system.js"));
const uiIndex = srcs.findIndex((src) => src.includes("hc.ui_debug.js"));
const bootIndex = srcs.findIndex((src) => src.includes("game.boot.js"));
assert(assetLoaderIndex !== -1, "index.html must load hc.asset_loader.js before start overlay code");
assert(assetLoaderIndex < saveIndex, "hc.asset_loader.js should load before hc.save_system.js");
assert(saveIndex < uiIndex, "hc.save_system.js must load before hc.ui_debug.js");
assert(uiIndex < bootIndex, "hc.ui_debug.js must load before game.boot.js");

if (uiDebug.includes("HC.SaveSystem") || uiDebug.includes("SaveSystem")) {
  assert(saveIndex < uiIndex, "ui_debug uses HC.SaveSystem, so save system must be loaded first");
}
assert(uiDebug.includes("System zapisu nie został załadowany."), "ui_debug should expose a controlled missing SaveSystem message");

console.log("save system runtime static checks passed");
