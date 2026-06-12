import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { legacyRuntimeFiles } from "./legacy-runtime-files.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredDistFiles = [
  ...legacyRuntimeFiles.map((file) => path.join("runtime", file)),
  path.join("vendor", "three", "three.module.min.js"),
  path.join("vendor", "loaders", "GLTFLoader.js"),
];
const missing = [];

for (const relativeFile of requiredDistFiles) {
  try {
    const fileStat = await stat(path.join(repoRoot, "dist", relativeFile));
    if (!fileStat.isFile()) missing.push(relativeFile);
  } catch {
    missing.push(relativeFile);
  }
}

if (missing.length > 0) {
  console.error(`Missing required files in dist/: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`Verified ${legacyRuntimeFiles.length} legacy runtime files and public Three/GLTFLoader vendor files in dist/.`);
