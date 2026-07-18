import test from "node:test";
import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec = promisify(execFile);
const root = new URL("..", import.meta.url).pathname;
const sha = "abc1234567890";
async function build(id) {
  await exec("npm", ["run", "build"], { cwd: root, env: { ...process.env, VITE_BUILD_SHA: sha, VITE_BUILD_ID: id } });
  return JSON.parse(await readFile(`${root}dist/build-meta.json`, "utf8"));
}
test("workflow assigns one immutable BUILD_ID to every deployment run", async () => {
  const workflow = await readFile(`${root}.github/workflows/deploy_pages.yml`, "utf8");
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /VITE_BUILD_SHA:\s*\$\{\{ github\.sha \}\}/);
  assert.match(workflow, /VITE_BUILD_ID:\s*\$\{\{ github\.sha \}\}-\$\{\{ github\.run_id \}\}-\$\{\{ github\.run_attempt \}\}/);
  assert.doesNotMatch(workflow, /VITE_BUILD_ID:\s*\$\{\{ github\.sha \}\}\s*$/m);
});
test("same SHA with different workflow attempts has isolated immutable URLs", async () => {
  await rm(`${root}dist`, { recursive: true, force: true });
  const a = await build(`${sha}-100-1`);
  const aApp = await readFile(`${root}dist/builds/${a.id}/index.html`, "utf8");
  const b = await build(`${sha}-100-2`);
  const bApp = await readFile(`${root}dist/builds/${b.id}/index.html`, "utf8");
  assert.notEqual(a.appPath, b.appPath); assert.notEqual(a.assetBase, b.assetBase);
  assert.equal(b.id, `${sha}-100-2`); assert(!bApp.includes(a.id)); assert(aApp.includes(a.id));
});
