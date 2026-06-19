import assert from 'node:assert/strict';
import fs from 'node:fs';
import { legacyRuntimeFiles } from './legacy-runtime-files.mjs';

const indexHtml = fs.readFileSync('index.html', 'utf8');
const loadedRuntimeFiles = Array.from(indexHtml.matchAll(/<script\s+src="runtime\/([^"]+\.js)"><\/script>/g), (match) => match[1]);
const syncSet = new Set(legacyRuntimeFiles);

for (const file of loadedRuntimeFiles) {
  assert(syncSet.has(file), `${file} is loaded from runtime/ in index.html but missing from legacyRuntimeFiles`);
}

assert(syncSet.has('hc.impact.js'), 'hc.impact.js must be synced to public/runtime');
assert(syncSet.has('hc.harmonic_dust.js'), 'hc.harmonic_dust.js must be synced to public/runtime');

console.log('runtime sync list covers index.html runtime scripts');
