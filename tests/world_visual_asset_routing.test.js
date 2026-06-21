const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = { console, Math, window: { HC: {} } };
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, "hc.asteroids.js"), "utf8"), context, { filename: "hc.asteroids.js" });
vm.runInContext(fs.readFileSync(path.join(root, "hc.world_render_snapshot.js"), "utf8"), context, { filename: "hc.world_render_snapshot.js" });
vm.runInContext(fs.readFileSync(path.join(root, "hc.world_renderer.js"), "utf8"), context, { filename: "hc.world_renderer.js" });

const assets = context.window.HC.WorldVisualAssets;
assert.deepEqual(Array.from(assets.asteroidVariants), Array.from({ length: 10 }, (_, index) => `asteroid_${String(index + 1).padStart(2, "0")}`));
assert.deepEqual(Array.from(assets.moonVariants), Array.from({ length: 6 }, (_, index) => `moon_${String(index + 1).padStart(2, "0")}`));

const first = assets.assignAsteroidVisual({}, 0);
const second = assets.assignAsteroidVisual({}, 0.34);
const third = assets.assignAsteroidVisual({}, 0.99);
assert.deepEqual(
  [first.visualVariant, second.visualVariant, third.visualVariant],
  ["asteroid_01", "asteroid_04", "asteroid_10"]
);
assert.deepEqual(
  [first.assetId, second.assetId, third.assetId],
  ["asteroid_01.glb", "asteroid_04.glb", "asteroid_10.glb"]
);

assert.equal(second.modelId, "asteroid_04");
assert.equal(second.glbId, "asteroid_04");
const stableVariant = second.visualVariant;
second.mass = 12;
second.r = 42;
assets.assignAsteroidVisual(second, 0.99);
assert.equal(second.visualVariant, stableVariant, "growth/reassignment must not reroll the visual variant");
assert.equal(second.modelId, stableVariant);
assert.equal(second.glbId, stableVariant);

const moon = assets.assignMoonVisual({}, 0.5);
assert.equal(moon.visualKind, "moon");
assert.equal(moon.visualVariant, "moon_04");
assert.equal(moon.modelId, "moon_04");
assert.equal(moon.glbId, "moon_04");
assert.equal(moon.assetId, "moon_04.glb");
assets.assignMoonVisual(moon, 0.99);
assert.equal(moon.visualVariant, "moon_04", "moon reassignment must not reroll the visual variant");

const rockyPlanet = assets.assignPlanetVisual({ type: "planet", planetKind: "rocky", isRocky: true, x: 10, y: 20, r: 30 }, 0.125);
const gasPlanet = assets.assignPlanetVisual({ type: "planet", planetKind: "gas", isRocky: false, x: 40, y: 50, radius: 60 }, 0.875);
const planetRotationFields = [
  "visualRotationSeed",
  "visualRotationX",
  "visualRotationY",
  "visualRotationZ",
  "visualRotationSpeedX",
  "visualRotationSpeedY",
  "visualRotationSpeedZ",
];
for (const planet of [rockyPlanet, gasPlanet]) {
  assert.equal(planet.visualKind, "planet");
  if (planet.planetKind === "rocky") {
    assert.match(planet.visualVariant, /^rocky_planet_0[1-4]$/);
    assert.match(planet.assetId, /^rocky_planet_0[1-4]\.glb$/);
  } else {
    assert.equal(planet.visualVariant, "planet_01");
    assert.equal(planet.assetId, "planet_01.glb");
  }
  assert.equal(context.window.HC.WorldRenderer.isPlanetVisualCandidate(planet), true);
  for (const field of planetRotationFields) assert.equal(Number.isFinite(planet[field]), true, `${field} must be finite`);
  assert.ok(Math.abs(planet.visualRotationSpeedY) >= 0.03 && Math.abs(planet.visualRotationSpeedY) <= 0.12);
  assert.ok(Math.abs(planet.visualRotationSpeedX) >= 0.005 && Math.abs(planet.visualRotationSpeedX) <= 0.03);
  assert.ok(Math.abs(planet.visualRotationSpeedZ) >= 0.005 && Math.abs(planet.visualRotationSpeedZ) <= 0.03);
}
assert.notEqual(rockyPlanet.visualRotationSeed, gasPlanet.visualRotationSeed, "planets may receive distinct stable rotation seeds");
const stableRockyRotation = Object.fromEntries(planetRotationFields.map((field) => [field, rockyPlanet[field]]));
assets.assignPlanetVisual(rockyPlanet, 0.999);
assert.deepEqual(
  Object.fromEntries(planetRotationFields.map((field) => [field, rockyPlanet[field]])),
  stableRockyRotation,
  "reassigning visual metadata must not reroll an existing planet rotation"
);

const snapshot = context.window.HC.WorldRenderSnapshot.build({
  World: { meteors: [], comets: [], asteroids: [second], moons: [moon], planets: [rockyPlanet, gasPlanet], stars: [] },
  Camera: {},
  View: {},
});
assert.equal(snapshot.world.asteroids[0].visualVariant, "asteroid_04");
assert.equal(snapshot.world.asteroids[0].assetId, "asteroid_04.glb");
assert.equal(snapshot.world.asteroids[0].modelId, "asteroid_04");
assert.equal(snapshot.world.asteroids[0].glbId, "asteroid_04");
assert.equal(snapshot.world.moons[0].visualVariant, "moon_04");
assert.equal(snapshot.world.moons[0].assetId, "moon_04.glb");
assert.equal(snapshot.world.moons[0].modelId, "moon_04");
assert.equal(snapshot.world.moons[0].glbId, "moon_04");
const snapshotAgain = context.window.HC.WorldRenderSnapshot.build({
  World: { meteors: [], comets: [], asteroids: [second], moons: [moon], planets: [], stars: [] },
  Camera: {},
  View: {},
});
assert.equal(snapshotAgain.world.asteroids[0].glbId, snapshot.world.asteroids[0].glbId, "asteroid model remains stable between snapshots");
assert.equal(snapshotAgain.world.moons[0].glbId, snapshot.world.moons[0].glbId, "moon model remains stable between snapshots");
assert.equal(snapshot.world.planets.length, 2, "snapshot must retain rocky and gas planets");
assert.deepEqual(Array.from(snapshot.world.planets, (planet) => planet.planetKind), ["rocky", "gas"]);
assert.match(snapshot.world.planets[0].visualVariant, /^rocky_planet_0[1-4]$/);
assert.match(snapshot.world.planets[0].assetId, /^rocky_planet_0[1-4]\.glb$/);
assert.equal(snapshot.world.planets[1].visualVariant, "planet_01");
assert.equal(snapshot.world.planets[1].assetId, "planet_01.glb");
for (let index = 0; index < snapshot.world.planets.length; index += 1) {
  for (const field of planetRotationFields) {
    assert.equal(snapshot.world.planets[index][field], [rockyPlanet, gasPlanet][index][field], `snapshot must preserve ${field}`);
    assert.equal(Number.isFinite(snapshot.world.planets[index][field]), true, `snapshot ${field} must be finite`);
  }
}
assert.deepEqual(Array.from(snapshot.world.planets, (planet) => [planet.x, planet.y, planet.radius]), [[10, 20, 30], [40, 50, 60]]);
assert.equal(snapshot.diagnostics.objectCounts.rockyPlanets, 1);
assert.equal(snapshot.diagnostics.objectCounts.gasPlanets, 1);
assert.equal(snapshot.diagnostics.objectCounts.planetsInThreeSnapshot, 2);

const legacyGasSnapshot = context.window.HC.WorldRenderSnapshot.build({
  World: { meteors: [], comets: [], asteroids: [], planets: [{ type: "planet", planetKind: "gas", isRocky: false, x: 1, y: 2, r: 3 }], stars: [] },
  Camera: {},
  View: {},
});
assert.equal(legacyGasSnapshot.world.planets[0].visualKind, "planet");
assert.equal(legacyGasSnapshot.world.planets[0].visualVariant, "planet_01");
assert.equal(legacyGasSnapshot.world.planets[0].assetId, "planet_01.glb");
assert.equal(context.window.HC.WorldRenderer.isPlanetVisualCandidate(legacyGasSnapshot.world.planets[0]), true);

const asteroidSource = fs.readFileSync(path.join(root, "hc.asteroids.js"), "utf8");
assert.match(asteroidSource, /const primary = massA >= massB \? a : b;/, "merge must retain the larger asteroid, or the first asteroid on equal mass");
const rendererSource = fs.readFileSync(path.join(root, "hc.world_renderer.js"), "utf8");
assert.doesNotMatch(rendererSource, /Math\.random\(\).*asteroid_0[1-9]/s, "renderer must not reroll asteroid assets");
assert.match(rendererSource, /Array\.from\(\{ length: 10 \}[\s\S]*`glb\/\$\{variant\}\.glb`/, "asteroid GLB routing must generate asteroid_01..asteroid_10 public paths");
assert.match(rendererSource, /Array\.from\(\{ length: 6 \}[\s\S]*`glb\/\$\{variant\}\.glb`/, "moon GLB routing must generate moon_01..moon_06 public paths");
const assetLoaderSource = fs.readFileSync(path.join(root, "hc.asset_loader.js"), "utf8");
for (const variant of [...assets.asteroidVariants, ...assets.moonVariants]) {
  assert.match(assetLoaderSource, new RegExp(`logicalPath: "glb/${variant}\\.glb"`), `${variant} must be present in preload routing`);
}
for (const file of [...assets.asteroidVariants, ...assets.moonVariants].map((variant) => `${variant}.glb`)) {
  assert.equal(fs.existsSync(path.join(root, "public", "glb", file)), true, `${file} must exist under public/glb to avoid 404`);
}
assert.match(rendererSource, /applyPlanetVisualRotation\(visual, planet, rotationNowMs\)/, "Three planet pass must animate snapshot rotation metadata");
assert.doesNotMatch(rendererSource, /function applyPlanetVisualRotation[\s\S]*?Math\.random\(/, "planet renderer must not reroll rotation per frame");

assert.equal((rendererSource.match(/syncMoonDustRings\(THREE, visual, moon, renderRadius\);/g) || []).length, 1, 'only the moon pass invokes moon dust rings with an in-scope moon variable');
assert.match(rendererSource, /threeObjectRenderPasses: \["meteors", "asteroids", "moons", "planets", "harmonicDust", "cosmicDust", "prgIndicator"\]/, 'Three render pass diagnostics includes cosmicDust and prgIndicator');
assert.match(rendererSource, /debugMarkerReason/, 'debug marker diagnostics exposes visibility reason');
const bootSource = fs.readFileSync(path.join(root, 'game.boot.js'), 'utf8');
const planetsSource = fs.readFileSync(path.join(root, 'hc.planets.js'), 'utf8');
assert.match(bootSource, /planetToStarEnabled: false/, 'planet-to-star progression is disabled by default');
assert.match(planetsSource, /Legacy star\/gas\/capture system disabled/, 'planet-to-star update path remains legacy-disabled');

console.log("world visual asset routing contract ok");
