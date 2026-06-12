import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(repoRoot, "vendor");
const targetDir = path.join(repoRoot, "public", "vendor");
const sourceStat = await stat(sourceDir);

if (!sourceStat.isDirectory()) throw new Error(`Vendor source is not a directory: ${sourceDir}`);

await rm(targetDir, { recursive: true, force: true });
await mkdir(path.dirname(targetDir), { recursive: true });
await cp(sourceDir, targetDir, { recursive: true });
console.log("Synced vendor/ to public/vendor/ for base-aware dev and build delivery.");
