const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function readGlbJson(filePath) {
  const bytes = fs.readFileSync(filePath);
  assert.equal(bytes.toString("ascii", 0, 4), "glTF", `${filePath} must be a binary glTF`);
  const jsonLength = bytes.readUInt32LE(12);
  const jsonType = bytes.toString("ascii", 16, 20);
  assert.equal(jsonType, "JSON", `${filePath} must start with a JSON chunk`);
  return JSON.parse(bytes.toString("utf8", 20, 20 + jsonLength).replace(/[\u0000\s]+$/u, ""));
}

const rendererSource = fs.readFileSync("hc.world_renderer.js", "utf8");
const bridgeSource = fs.readFileSync("hc.three_module_bridge.js", "utf8");

assert.match(rendererSource, /new THREE\.LoadingManager\(\)/, "GLTFLoader must use a dedicated LoadingManager");
assert.match(rendererSource, /manager\.setURLModifier/, "GLTF dependencies must pass through a base-safe URL modifier");
assert.match(rendererSource, /gltfFailedDependencyUrls/, "failed dependency URLs must be exposed in diagnostics");
assert.match(rendererSource, /loader\.setResourcePath\(resourcePath\)/, "resourcePath must be anchored to the resolved model URL");
assert.doesNotMatch(bridgeSource, /new URL\("\.\/vendor\/three\/three\.core\.min\.js"/, "three.core must not be a redundant preflight hard gate");

const glbDir = path.join("public", "glb");
const glbFiles = fs.readdirSync(glbDir).filter((name) => name.endsWith(".glb")).sort();
assert.ok(glbFiles.length > 0, "expected public GLB assets");

for (const fileName of glbFiles) {
  const json = readGlbJson(path.join(glbDir, fileName));
  const externalImages = (json.images || []).map((entry) => entry.uri).filter((uri) => uri && !uri.startsWith("data:"));
  const externalBuffers = (json.buffers || []).map((entry) => entry.uri).filter((uri) => uri && !uri.startsWith("data:"));
  assert.deepEqual(externalImages, [], `${fileName} must not depend on external image URIs`);
  assert.deepEqual(externalBuffers, [], `${fileName} must not depend on external buffer URIs`);
}

console.log(`GLB web loader path contract passed for ${glbFiles.length} self-contained assets.`);
