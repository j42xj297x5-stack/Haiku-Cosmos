const assert = require("node:assert/strict");
const fs = require("node:fs");

const settingsSource = fs.readFileSync("hc.submeta_settings.js", "utf8");
const pngSource = fs.readFileSync("hc.submeta_png.js", "utf8");
const placeholdersSource = fs.readFileSync("hc.submeta_placeholders.js", "utf8");
const panelsSource = fs.readFileSync("hc.submeta_panels.js", "utf8");
const viteSource = fs.readFileSync("vite.config.js", "utf8");

const expectedPaths = [
  "settings/submeta-placeholders.json",
  "settings/submeta-placeholders-panels.json",
  "settings/submeta-png-layout-export.json"
];

for (const logicalPath of expectedPaths) {
  assert.ok(settingsSource.includes(`"${logicalPath}"`), `missing logical settings path: ${logicalPath}`);
  assert.equal(fs.existsSync(`public/${logicalPath}`), true, `missing public runtime setting: public/${logicalPath}`);
}

assert.match(settingsSource, /const resolvedUrl = publicPath\(logicalPath\)/, "settings loader must resolve each logical path through publicPath");
assert.equal((settingsSource.match(/publicPath\(logicalPath\)/g) || []).length, 1, "settings loader must apply publicPath exactly once");
assert.match(settingsSource, /logicalPath[\s\S]*resolvedUrl[\s\S]*status[\s\S]*success[\s\S]*fallbackUsed/, "diagnostics must expose the settings routing contract");

const viteBase = viteSource.match(/base:\s*"([^"]+)"/)?.[1];
assert.equal(viteBase, "/Haiku-Cosmos/");
for (const logicalPath of expectedPaths) {
  const resolvedUrl = `${viteBase}${logicalPath}`;
  assert.equal(resolvedUrl.startsWith("/Haiku-Cosmos/settings/"), true);
  assert.equal(resolvedUrl.includes("/Haiku-Cosmos/Haiku-Cosmos/"), false);
}

for (const source of [pngSource, placeholdersSource, panelsSource]) {
  for (const fileName of expectedPaths.map((item) => item.split("/").at(-1))) {
    assert.equal(source.includes(`png/submeta/${fileName}`), false, `${fileName} must not route through png/submeta`);
  }
}

assert.match(pngSource, /SETTING_KEY = "pngLayout"/);
assert.match(placeholdersSource, /SETTING_KEY = "placeholders"/);
assert.match(panelsSource, /SETTING_KEY = "panels"/);

console.log("submeta_settings_routing.test.js: OK");
