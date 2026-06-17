import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = {
  console,
  window: {},
  performance: { now: () => 1000 },
  Events: { emitted: [], emit(name, payload) { this.emitted.push({ name, payload }); } },
  Camera: { x: 0, y: 0 },
  View: { w: 800, h: 600 },
  World: {
    meteors: [], asteroids: [], planets: [], moons: [], comets: [], stars: [],
    dustClouds: [], dustParticles: [], impactFragments: [],
    nowMs: 1000,
    spaceMechanics: { asteroidToMoonMassThreshold: 2, asteroidToMoonEnabled: true, moonToRockyPlanetMassThreshold: 5, moonToRockyPlanetEnabled: true },
    meteorCollisionFudge: 1,
    metaOrbitMulAsteroid: 1,
  },
  HC: { logEvent(type, event, payload) { context.HC.events.push({ type, event, payload }); }, events: [], DebugEventTypes: { WORLD_THRESHOLD_PROGRESS: 'progress', WORLD_OBJECT_TRANSFORMED: 'transformed', WORLD_TRANSFORMATION_COMPLETED: 'completed', WORLD_THRESHOLD_REACHED: 'reached' } },
  meteorBaseRadius: () => 1,
  getMeteorCollisionRadius: (m) => Number(m.r) || 1,
  massFromR: (r) => r * r,
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  rand: (a, b) => a + (b - a) * 0.5,
  hueFromName: () => 0,
  sidesFromColors: () => 7,
  computeGravityFromPlanetRadius: (r) => r * 3,
  computeOmega: () => 1,
  getWorldViewBounds: () => ({ l: -100, r: 100, t: -100, b: 100 }),
  WorldAPI: {},
};
context.window = context;
vm.createContext(context);
for (const file of ['hc.space_bodies.js', 'hc.meteors.js', 'hc.asteroids.js', 'hc.world_render_snapshot.js', 'hc.world_renderer.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}
context.HC.initAsteroids();

const moon = { id: 'moon:test', type: 'moon', kind: 'moon', x: 0, y: 0, vx: 0, vy: 0, r: 1, mass: 3, source: 'asteroid_mass_threshold' };
context.World.moons.push(moon);
context.HC.Asteroids.resolveMoonDirectAbsorptions();
assert.equal(context.World.planets.length, 0, 'moon below threshold stays moon');
assert.equal(context.World.moons.length, 1);

context.World.meteors.push({ id: 'meteor:test', type: 'meteor', kind: 'meteor', x: 0.5, y: 0, r: 1, mass: 3 });
context.HC.Asteroids.resolveMoonDirectAbsorptions();
context.World.moons = context.World.moons.filter((m) => !m._dead);
context.World.meteors = context.World.meteors.filter((m) => !m._dead);
assert.equal(context.World.moons.length, 0, 'moon removed after transform');
assert.equal(context.World.meteors.length, 0, 'absorbed meteor removed');
assert.equal(context.World.planets.length, 1, 'rocky planet created');
const planet = context.World.planets[0];
assert.equal(planet.planetKind, 'rocky');
assert.equal(planet.source, 'moon_mass_threshold');
assert.equal(planet.sourceMoonId, 'moon:test');
assert.match(planet.asset, /^rocky_planet_0[1-4]\.glb$/);
assert.equal(planet.vx, 0);
assert.equal(planet.vy, 0);
assert.equal(planet.stationary, true);
assert.ok(context.Events.emitted.some((evt) => evt.name === 'MOON_TO_ROCKY_PLANET_CREATED'));
assert.ok(context.HC.events.some((evt) => evt.payload?.source === 'moon_mass_threshold'));

const snapshot = context.HC.WorldRenderSnapshot.build({ World: context.World, Camera: context.Camera, View: context.View, nowMs: 1016, dt: 0.016 });
assert.equal(snapshot.world.planets.length, 1);
assert.equal(snapshot.world.planets[0].planetKind, 'rocky');
assert.equal(snapshot.world.planets[0].source, 'moon_mass_threshold');
assert.equal(snapshot.world.planets[0].sourceMoonId, 'moon:test');
assert.match(snapshot.world.planets[0].asset, /^rocky_planet_0[1-4]\.glb$/);
assert.equal(snapshot.world.moons.length, 0);
assert.equal(snapshot.diagnostics.objectCounts.moons, 0);
assert.equal(snapshot.diagnostics.objectCounts.planets, 1);
assert.equal(snapshot.diagnostics.objectCounts.rockyPlanets, 1);

assert.equal(typeof context.HC.WorldRenderer?.getDiagnostics, 'function', 'Three renderer module loads with moon support');
console.log('Patch 3 VM assertions passed');
