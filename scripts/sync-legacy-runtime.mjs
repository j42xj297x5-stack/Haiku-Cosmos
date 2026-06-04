import { copyFile, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { legacyRuntimeFiles } from "./legacy-runtime-files.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeDir = path.join(repoRoot, "public", "runtime");
const expectedFiles = new Set(legacyRuntimeFiles);

async function assertSourceFilesExist() {
  const missing = [];
  for (const file of legacyRuntimeFiles) {
    try {
      const fileStat = await stat(path.join(repoRoot, file));
      if (!fileStat.isFile()) missing.push(file);
    } catch {
      missing.push(file);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing legacy runtime source files: ${missing.join(", ")}`);
  }
}

async function removeStaleRuntimeFiles() {
  let entries = [];
  try {
    entries = await readdir(runtimeDir, { withFileTypes: true });
  } catch {
    return;
  }

  await Promise.all(entries.map(async (entry) => {
    if (entry.name === ".gitkeep") return;
    if (entry.isFile() && !expectedFiles.has(entry.name)) {
      await rm(path.join(runtimeDir, entry.name));
    }
  }));
}

await mkdir(runtimeDir, { recursive: true });
await assertSourceFilesExist();
await removeStaleRuntimeFiles();

for (const file of legacyRuntimeFiles) {
  await copyFile(path.join(repoRoot, file), path.join(runtimeDir, file));
}

console.log(`Synced ${legacyRuntimeFiles.length} legacy runtime JS files to public/runtime/.`);
