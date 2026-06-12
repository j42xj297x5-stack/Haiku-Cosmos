const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..");
const rendererSource = fs.readFileSync(path.join(repoRoot, "hc.world_renderer.js"), "utf8");
const viteConfigSource = fs.readFileSync(path.join(repoRoot, "vite.config.js"), "utf8");
const baseMatch = viteConfigSource.match(/base:\s*["']([^"']+)["']/);
assert.ok(baseMatch, "vite.config.js must declare a public base");
const base = baseMatch[1];
const publicPathCalls = [];
const window = {
  HC: {
    publicPath(logicalPath = "") {
      const cleanPath = String(logicalPath).replace(/^\/+/, "").replace(/^public\//, "");
      publicPathCalls.push(cleanPath);
      return `${base}${cleanPath}`;
    },
  },
  location: {
    href: "https://example.test/Haiku-Cosmos/",
    origin: "https://example.test",
  },
  addEventListener() {},
  dispatchEvent() {},
};
window.HC.publicAssetPath = window.HC.publicPath;

const context = vm.createContext({
  window,
  console,
  performance: { now: () => 0 },
  URL,
  Map,
  Set,
  WeakMap,
  Math,
  Date,
  Object,
  Array,
  Number,
  String,
  Boolean,
});

vm.runInContext(rendererSource, context, { filename: "hc.world_renderer.js" });

const urls = Array.from(window.HC.WorldRenderer.getThreeAssetUrlContract(), (row) => ({ ...row }));
assert.deepEqual(urls.map((row) => row.kind), [
  "meteorGlb",
  "meteorTexture",
  "meteorEmissiveMap",
  "asteroidGlb",
]);
assert.deepEqual(urls.map((row) => row.logicalPath), [
  "glb/meteor_red_form_core_01.glb",
  "png/texture_meteor_red_01.png",
  "png/texture_meteor_red_emission_01.png",
  "glb/asteroid_01.glb",
]);
assert.deepEqual(urls.map((row) => row.resolvedUrl), urls.map((row) => `${base}${row.logicalPath}`));

for (const { logicalPath, resolvedUrl } of urls) {
  assert.ok(!logicalPath.startsWith(base), `${logicalPath} must remain a logical path`);
  assert.ok(resolvedUrl.startsWith(base), `${resolvedUrl} must use the deployed base`);
  assert.ok(!resolvedUrl.includes(`${base}${base.slice(1)}`), `${resolvedUrl} must not contain a doubled base`);
}
assert.deepEqual(publicPathCalls, urls.map((row) => row.logicalPath), "each contract URL must be resolved from its logical path exactly once");

assert.match(rendererSource, /loader\.load\(\s*resolvedUrl,/s, "GLTFLoader must receive the final resolved URL");
assert.match(rendererSource, /textureLoader\.loadAsync\(resolvedUrl\)/, "TextureLoader must receive the final resolved URL");
assert.match(rendererSource, /loadMeteorGlb\(THREE, logicalPath\)/, "meteor GLB loading must pass the logical path into the resolving loader");
assert.match(rendererSource, /loadAsteroidGlb\(THREE, logicalPath\)/, "asteroid GLB loading must pass the logical path into the resolving loader");
assert.doesNotMatch(rendererSource, /resolvePublicAssetPath\(assignment\.url\s*\|\|\s*assignment\.path\)/, "resolved texture URLs must not re-enter publicPath");

console.log("Three asset URL pipeline contract ok");
