import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { legacyRuntimeFiles } from "./legacy-runtime-files.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRuntimeDir = path.join(repoRoot, "dist", "runtime");
const missing = [];

for (const file of legacyRuntimeFiles) {
  try {
    const fileStat = await stat(path.join(distRuntimeDir, file));
    if (!fileStat.isFile()) missing.push(file);
  } catch {
    missing.push(file);
  }
}

if (missing.length > 0) {
  console.error(`Missing legacy runtime files in dist/runtime/: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`Verified ${legacyRuntimeFiles.length} legacy runtime JS files in dist/runtime/.`);
