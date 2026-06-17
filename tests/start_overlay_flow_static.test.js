const fs = require("fs");
const assert = require("assert");

const ui = fs.readFileSync("hc.ui_debug.js", "utf8");
const loader = fs.readFileSync("hc.asset_loader.js", "utf8");
const html = fs.readFileSync("index.html", "utf8");
const codexHtml = fs.readFileSync("index.codex.html", "utf8");

for (const id of ["playerAliasInput", "loaderProgressLabel", "startStatus", "startSaveFileInput", "btnStartNormal", "btnLoadSave", "btnStartDebug"]) {
  assert(html.includes(`id="${id}"`), `index.html missing ${id}`);
  assert(codexHtml.includes(`id="${id}"`), `index.codex.html missing ${id}`);
}

assert(ui.includes("btnStartNormal.addEventListener"), "new game click handler is missing");
assert(ui.includes("btnLoadSave.addEventListener"), "load save click handler is missing");
assert(ui.includes("startSaveFileInput.addEventListener"), "save file change handler is missing");
assert(ui.includes("currentAlias().trim() === \"debug\""), "debug alias gate is missing");
assert(ui.includes("window.HC.StartOverlayDebug"), "start overlay evidence object is missing");

for (const field of ["aliasPresent", "isDebugAlias", "phase1Status", "newGameEnabled", "loadSaveEnabled", "lastError"]) {
  assert(ui.includes(field), `start overlay evidence missing ${field}`);
}

assert(ui.includes("isPhase1Ready()"), "button state must depend on Phase 1 readiness");
assert(ui.includes("startOverlayEvidence.newGameEnabled = !!(ready && hasAlias)"), "new game enabled state must require alias and ready Phase 1");
assert(ui.includes("startOverlayEvidence.loadSaveEnabled = !!(ready && hasAlias)"), "load save enabled state must require alias and ready Phase 1");
assert(ui.includes("Nie wybrano pliku save."), "load save without file must report controlled error");
assert(ui.includes("await window.HC.SaveSystem.importFile(currentAlias().trim(), file); rememberAliasAndSession"), "load save should import before starting session");

assert(loader.includes("status: \"start\""), "loader progress should expose start status");
assert(loader.includes("progress.status = \"loading\""), "loader progress should expose loading status");
assert(loader.includes("failed-with-fallback"), "loader should resolve with fallback status when assets fail");
assert(loader.includes("LOAD_TIMEOUT_MS"), "loader should timeout hung Phase 1 assets");

console.log("start overlay flow static checks passed");
