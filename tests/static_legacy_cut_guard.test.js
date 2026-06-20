import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

assert.equal(fs.existsSync(path.join(root, 'hc.comets.js')), false, 'hc.comets.js must not exist in active runtime root');
assert.equal(fs.existsSync(path.join(root, 'legacy/runtime/hc.comets.legacy.js')), true, 'legacy comet source is preserved outside active runtime');
assert.equal(fs.existsSync(path.join(root, 'public/runtime/hc.comets.js')), false, 'published runtime must not contain stale comets');
assert.equal(fs.existsSync(path.join(root, 'legacy/runtime/hc.stars_epoch.legacy.js')), true, 'legacy star epoch source is preserved outside active runtime');

const index = read('index.html');
assert.doesNotMatch(index, /runtime\/hc\.comets\.js/, 'index.html must not load active comets runtime');
assert.doesNotMatch(read('scripts/legacy-runtime-files.mjs'), /hc\.comets\.js/, 'runtime sync list must not publish comets');

const boot = read('game.boot.js');
assert.doesNotMatch(boot, /HC\.Comets\.update|initComets\(/, 'game loop must not update/init comets');
assert.match(boot, /HC\.Comets is legacy-disabled in current runtime/, 'runtime must fail fast on HC.Comets access');
assert.doesNotMatch(boot, /HC\.Stars\) HC\.Stars\.update|initStarsEpoch\(/, 'game loop must not update/init star runtime');
assert.doesNotMatch(index, /runtime\/hc\.stars_epoch\.js/, 'index.html must not load star epoch runtime');
assert.doesNotMatch(read('scripts/legacy-runtime-files.mjs'), /hc\.stars_epoch\.js/, 'runtime sync list must not publish star epoch runtime');
assert.doesNotMatch(boot, /HC\.Planets\) HC\.Planets\.capture/, 'game loop must not run legacy planet capture');

const rendererFiles = ['hc.render.js', 'hc.world_renderer.js'];
for (const file of rendererFiles) {
  const source = read(file);
  assert.doesNotMatch(source, /World\.(planets|asteroids|moons)\.push/, `${file} must not push gameplay bodies`);
  assert.doesNotMatch(source, /\.(?:mass)\s*=/, `${file} must not assign gameplay mass`);
  assert.doesNotMatch(source, /\btype\s*=\s*["']planet["']/, `${file} must not mutate body type to planet`);
  assert.doesNotMatch(source, /\._dead\s*=\s*true/, `${file} must not kill gameplay bodies`);
}

const asteroidSource = read('hc.asteroids.js');
const planetPushes = [...asteroidSource.matchAll(/World\.planets\.push/g)].map((m) => m.index);
assert.equal(planetPushes.length, 1, 'only canonical moon_to_rocky_planet helper may push planets in asteroids runtime');
assert.match(asteroidSource, /sourcePath !== "moon_to_rocky_planet"/, 'direct asteroid-to-planet helper calls must be blocked');
assert.match(asteroidSource, /LEGACY_COLLAPSE_TO_PLANET_DISABLED/, 'collapse-to-planet must fail fast');
assert.doesNotMatch(asteroidSource, /sourcePath:\s*"legacy_asteroid_collapse_to_planet"[\s\S]*World\.planets\.push/, 'legacy collapse must not retain planet push path');

const planets = read('hc.planets.js');
assert.match(planets, /LEGACY_CAPTURE_ORBIT_DISABLED/, 'legacy capture/orbit must fail fast');
assert.match(planets, /Legacy star\/gas\/capture system disabled/, 'legacy star/gas system must fail fast');
assert.doesNotMatch(planets, /World\.planets\.push/, 'planets runtime must not create planets');
assert.doesNotMatch(planets.slice(planets.indexOf('window.HC.Planets =')), /transformGasPlanetIntoStar\(p,/, 'active star transform call must be removed from public update path');

const debug = read('hc.debug.js');
const debugPlanetPushes = [...debug.matchAll(/World\.planets\.push/g)].length;
assert.ok(debugPlanetPushes <= 2, 'planet pushes are only tolerated in explicit debug bootstrap');

console.log('static legacy cut guards passed');
