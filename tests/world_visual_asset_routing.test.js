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
assert.deepEqual(Array.from(assets.asteroidVariants), ["asteroid_01", "asteroid_02", "asteroid_03"]);

const first = assets.assignAsteroidVisual({}, 0);
const second = assets.assignAsteroidVisual({}, 0.34);
const third = assets.assignAsteroidVisual({}, 0.99);
assert.deepEqual(
  [first.visualVariant, second.visualVariant, third.visualVariant],
  ["asteroid_01", "asteroid_02", "asteroid_03"]
);
assert.deepEqual(
  [first.assetId, second.assetId, third.assetId],
  ["asteroid_01.glb", "asteroid_02.glb", "asteroid_03.glb"]
);

const stableVariant = second.visualVariant;
second.mass = 12;
second.r = 42;
assert.equal(second.visualVariant, stableVariant, "growth must not reroll the visual variant");

const rockyPlanet = assets.assignPlanetVisual({ type: "planet", planetKind: "rocky", isRocky: true, x: 10, y: 20, r: 30 });
const gasPlanet = assets.assignPlanetVisual({ type: "planet", planetKind: "gas", isRocky: false, x: 40, y: 50, radius: 60 });
for (const planet of [rockyPlanet, gasPlanet]) {
  assert.equal(planet.visualKind, "planet");
  assert.equal(planet.visualVariant, "planet_01");
  assert.equal(planet.assetId, "planet_01.glb");
  assert.equal(context.window.HC.WorldRenderer.isPlanetVisualCandidate(planet), true);
}

const snapshot = context.window.HC.WorldRenderSnapshot.build({
  World: { meteors: [], comets: [], asteroids: [second], planets: [rockyPlanet, gasPlanet], stars: [] },
  Camera: {},
  View: {},
});
assert.equal(snapshot.world.asteroids[0].visualVariant, "asteroid_02");
assert.equal(snapshot.world.asteroids[0].assetId, "asteroid_02.glb");
assert.equal(snapshot.world.planets.length, 2, "snapshot must retain rocky and gas planets");
assert.deepEqual(Array.from(snapshot.world.planets, (planet) => planet.planetKind), ["rocky", "gas"]);
assert.deepEqual(Array.from(snapshot.world.planets, (planet) => planet.visualVariant), ["planet_01", "planet_01"]);
assert.deepEqual(Array.from(snapshot.world.planets, (planet) => planet.assetId), ["planet_01.glb", "planet_01.glb"]);
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
assert.doesNotMatch(fs.readFileSync(path.join(root, "hc.world_renderer.js"), "utf8"), /Math\.random\(\).*asteroid_0[123]/s, "renderer must not reroll asteroid assets");

console.log("world visual asset routing contract ok");
