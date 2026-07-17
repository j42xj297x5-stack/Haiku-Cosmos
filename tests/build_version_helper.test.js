const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const document = {
  baseURI: "https://example.test/Haiku-Cosmos/",
  currentScript: { src: "https://example.test/Haiku-Cosmos/runtime/hc.public_path.js?v=build-1" }
};
const window = {
  document,
  location: { href: document.baseURI },
  HC_BUILD_INFO: { id: "build-1" }
};
const source = fs.readFileSync(path.resolve(__dirname, "..", "hc.public_path.js"), "utf8");
vm.runInContext(source, vm.createContext({ window, URL, URLSearchParams }), { filename: "hc.public_path.js" });

const version = window.HC.withBuildVersion;
assert.equal(version("settings/test.json"), "settings/test.json?v=build-1");
assert.equal(version("settings/test.json?lang=pl#section"), "settings/test.json?lang=pl&v=build-1#section");
assert.equal(version("/Haiku-Cosmos/data/test.json"), "/Haiku-Cosmos/data/test.json?v=build-1");
assert.equal(version("data/test.json?v=old"), "data/test.json?v=old");
assert.equal(version("https://example.test/data/test.json"), "https://example.test/data/test.json");
assert.equal(version("data:application/json,{}"), "data:application/json,{}");
assert.equal(version("blob:https://example.test/id"), "blob:https://example.test/id");

console.log("build_version_helper.test.js: OK");
