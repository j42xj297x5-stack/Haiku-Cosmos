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

const planet = assets.assignPlanetVisual({ type: "planet" });
assert.equal(planet.visualKind, "planet");
assert.equal(planet.visualVariant, "planet_01");
assert.equal(planet.assetId, "planet_01.glb");

const snapshot = context.window.HC.WorldRenderSnapshot.build({
  World: { meteors: [], comets: [], asteroids: [second], planets: [planet], stars: [] },
  Camera: {},
  View: {},
});
assert.equal(snapshot.world.asteroids[0].visualVariant, "asteroid_02");
assert.equal(snapshot.world.asteroids[0].assetId, "asteroid_02.glb");
assert.equal(snapshot.world.planets[0].visualVariant, "planet_01");
assert.equal(snapshot.world.planets[0].assetId, "planet_01.glb");

const asteroidSource = fs.readFileSync(path.join(root, "hc.asteroids.js"), "utf8");
assert.match(asteroidSource, /const primary = massA >= massB \? a : b;/, "merge must retain the larger asteroid, or the first asteroid on equal mass");
assert.doesNotMatch(fs.readFileSync(path.join(root, "hc.world_renderer.js"), "utf8"), /Math\.random\(\).*asteroid_0[123]/s, "renderer must not reroll asteroid assets");

console.log("world visual asset routing contract ok");
