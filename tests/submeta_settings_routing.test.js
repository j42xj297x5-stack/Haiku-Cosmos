const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const htmlSource = fs.readFileSync("index.html", "utf8");
const publicPathSource = fs.readFileSync("hc.public_path.js", "utf8");
const settingsSource = fs.readFileSync("hc.submeta_settings.js", "utf8");
const pngSource = fs.readFileSync("hc.submeta_png.js", "utf8");
const placeholdersSource = fs.readFileSync("hc.submeta_placeholders.js", "utf8");
const panelsSource = fs.readFileSync("hc.submeta_panels.js", "utf8");

const expectedPaths = [
  "settings/submeta-placeholders.json",
  "settings/submeta-placeholders-panels.json",
  "settings/submeta-png-layout-export.json"
];

for (const logicalPath of expectedPaths) {
  assert.ok(settingsSource.includes(`"${logicalPath}"`), `missing logical settings path: ${logicalPath}`);
  assert.equal(fs.existsSync(`public/${logicalPath}`), true, `missing public runtime setting: public/${logicalPath}`);
}

function scriptTag(filename) {
  const match = htmlSource.match(new RegExp(`<script([^>]*)src=["'][^"']*${filename.replaceAll(".", "\\.")}["'][^>]*><\\/script>`));
  assert.ok(match, `missing script tag for ${filename}`);
  return { tag: match[0], attributes: match[1], index: match.index };
}

const publicPathTag = scriptTag("hc.public_path.js");
const settingsTag = scriptTag("hc.submeta_settings.js");
const pngTag = scriptTag("hc.submeta_png.js");
const placeholdersTag = scriptTag("hc.submeta_placeholders.js");
const panelsTag = scriptTag("hc.submeta_panels.js");

assert.ok(publicPathTag.index < settingsTag.index, "public path helper must load before settings");
assert.ok(settingsTag.index < pngTag.index, "settings must load before the PNG layout loader");
assert.ok(settingsTag.index < placeholdersTag.index, "settings must load before placeholders");
assert.ok(settingsTag.index < panelsTag.index, "settings must load before panels");
assert.doesNotMatch(publicPathTag.tag, /type=["']module["']/, "public path helper must be a classic script");
assert.doesNotMatch(settingsTag.tag, /type=["']module["']/, "settings loader must be a classic script");
assert.doesNotMatch(publicPathSource, /^\s*(?:import|export)\s/m, "public path helper must not use ESM syntax");
assert.doesNotMatch(settingsSource, /^\s*(?:import|export)\s/m, "settings loader must not use ESM syntax");
assert.doesNotMatch(settingsSource, /import\.meta/, "settings loader must not depend on import.meta");

const infoLogs = [];
const context = {
  URL,
  console: { info: (...args) => infoLogs.push(args), warn: () => {} },
  document: {
    baseURI: "https://example.test/Haiku-Cosmos/",
    currentScript: { src: "https://example.test/Haiku-Cosmos/runtime/hc.public_path.js" }
  },
  location: { href: "https://example.test/Haiku-Cosmos/" },
  fetch: async () => ({ ok: true, status: 200, statusText: "OK", text: async () => "{}" })
};
context.window = context;
vm.createContext(context);
vm.runInContext(publicPathSource, context, { filename: "hc.public_path.js" });
context.document.currentScript = { src: "https://example.test/Haiku-Cosmos/runtime/hc.submeta_settings.js" };
vm.runInContext(settingsSource, context, { filename: "hc.submeta_settings.js" });

assert.equal(typeof context.HC.publicPath, "function");
assert.equal(context.HC.publicPath("settings/test.json"), "/Haiku-Cosmos/settings/test.json");
assert.ok(context.HC.SubMetaSettings, "settings script must synchronously register window.HC.SubMetaSettings");
assert.equal(typeof context.HC.SubMetaSettings.loadJsonSetting, "function");
assert.equal(context.HC.SubMetaSettings.getLogicalPath("panels"), expectedPaths[1]);
assert.ok(infoLogs.some(([message]) => message === "[HC.SubMetaSettings] loaded"), "settings init probe must run once");

for (const source of [pngSource, placeholdersSource, panelsSource]) {
  assert.match(source, /root\.HC\?\.SubMetaSettings/, "SUB-META consumers must use the shared HC.SubMetaSettings namespace");
}

assert.match(pngSource, /SETTING_KEY = "pngLayout"/);
assert.match(placeholdersSource, /SETTING_KEY = "placeholders"/);
assert.match(panelsSource, /SETTING_KEY = "panels"/);

console.log("submeta_settings_routing.test.js: OK");
