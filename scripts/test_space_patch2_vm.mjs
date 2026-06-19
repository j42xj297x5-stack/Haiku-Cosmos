import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const context = vm.createContext({
  console,
  performance: { now: () => 1000 },
  Math,
  Date,
});
context.window = context;
context.HC = { DebugEventTypes: {}, logEvent() {} };
context.Events = { emit() {} };
context.MeteorColors = [{ name: 'blue', hue: 210 }];
context.View = { w: 800, h: 600, worldScale: 1000 };
context.Camera = { scale: 1, zoom: 1, x: 400, y: 300 };
context.Input = { pointerDown: false, wx: 0, wy: 0 };
context.CardEngine = { state: { engineStats: {} }, isColorR1Active: () => false };
context.rand = (min, max) => (min + max) / 2;
context.meteorBaseRadius = () => 16;
context.getMeteorCollisionRadius = (m) => Number(m?.collisionRadius ?? m?.r) || 16;
context.getMeteorRenderScale = context.getMeteorCollisionRadius;
context.getWorldViewBounds = () => ({ l: 0, r: 800, t: 0, b: 600 });
context.ctx = new Proxy({}, { get: () => () => {} });
context.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
context.hueFromName = () => 210;
context.sidesFromColors = () => 7;
context.computeGravityFromPlanetRadius = (r) => r * 2;
context.computeOmega = () => 0;
context.WorldAPI = {};
context.finalizePlanetSpawn = null;
context.World = {
  meteors: [], asteroids: [], planets: [], moons: [], comets: [], stars: [],
  dustClouds: [], dustParticles: [], impactFragments: [],
  spawnTimer: 1, spawnInterval: 1, spawnIntervalMul: 1, maxMeteors: 1,
  pointerRadius: 0.2, pointerStrength: 1, pointerGlueDamp: 0,
  meteorCollisionFudge: 1, asteroidDriftMul: 1, nowMs: 1000,
  spaceMechanics: { asteroidToMoonMassThreshold: 2, asteroidToMoonEnabled: true },
};

for (const file of ['hc.space_bodies.js', 'hc.meteors.js', 'hc.asteroids.js', 'hc.world_render_snapshot.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}

context.HC.initMeteors();
context.HC.Meteors.update(1, 1000);
assert.equal(context.World.meteors.length, 1);
const meteor = context.World.meteors[0];
assert.equal(typeof meteor.mass, 'number');
assert.equal(context.HC.SpaceBodies.getBodyMass(meteor), meteor.mass);
assert.equal(meteor.mass, meteor.r * meteor.r);

context.HC.initAsteroids();
const asteroid = { _id: 1, type: 'asteroid', x: 10, y: 10, vx: 1, vy: 2, r: 5, mass: 2, liveColorCounts: { blue: 2 }, sourceColors: ['blue'] };
context.World.asteroids.push(asteroid);
const moon = context.HC.Asteroids.transformAsteroidToMoon(asteroid, 'vm_test');
assert.equal(context.World.moons.length, 1);
assert.equal(moon.type, 'moon');
assert.equal(moon.mass, 2);
assert.equal(moon.r, 5);
assert.equal(moon.progressionMode, 'free');
assert.equal(moon.isOrbitalBody, false);
assert.equal(moon.canBecomePlanet, true);
assert.equal(moon.parentPlanetId, null);
assert.equal(moon.progressionLockFrame, 0);
assert.equal(moon.progressionCooldownUntilFrame, 2);
assert.equal(asteroid._dead, true);
context.World.spaceMechanics.moonToRockyPlanetMassThreshold = 2;
context.HC.Asteroids.update(0.016, 1016);
assert.equal(context.World.asteroids.length, 0);
assert.equal(context.World.planets.length, 0, 'new moon does not become planet in same/cooldown frame');
assert.ok(context.World.progressionBlockedSameFrameCount >= 1, 'cooldown evidence increments');
context.World.frame = 2;
context.HC.Asteroids.update(0.016, 1032);
assert.equal(context.World.planets.length, 1, 'moon can become rocky planet after cooldown');
context.World.planets = [];
context.World.moons = [moon];
moon._dead = false;
moon.__transformationInProgress = false;

const snapshot = context.HC.WorldRenderSnapshot.build({ World: context.World, Camera: context.Camera, View: context.View, nowMs: 1016, dt: 0.016 });
assert.equal(snapshot.world.moons.length, 1);
assert.equal(snapshot.world.moons[0].type, 'moon');
assert.equal(snapshot.world.moons[0].mass, 2);
assert.equal(snapshot.world.moons[0].progressionMode, 'free');
assert.equal(snapshot.world.moons[0].isOrbitalBody, false);
assert.equal(snapshot.world.moons[0].canBecomePlanet, true);
context.World.spaceMechanics.bodyRadiusClampEnabled = true;
context.World.spaceMechanics.maxMoonRadius = 10;
const clampedRadius = context.HC.SpaceBodies.radiusFromMass('moon', 10000, { baseRadius: 1, minRadius: 1 });
assert.equal(clampedRadius, 10, 'large moon radius is clamped');
assert.equal(context.World.lastBodyRadiusClampEvent.kind, 'moon');
assert.equal(snapshot.world.moons[0].parentPlanetId, null);
assert.equal(snapshot.diagnostics.objectCounts.moons, 1);

console.log('space patch 2 vm checks passed');
