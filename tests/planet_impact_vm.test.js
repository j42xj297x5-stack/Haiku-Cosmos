const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function buildContext() {
  const context = { console, performance: { now: () => 1000 }, window: {} };
  context.window = context;
  context.HC = {
    Util: { clamp: (v, a, b) => Math.max(a, Math.min(b, v)) },
    getWorld: () => context.World,
    logEvent() {},
  };
  context.Events = { on() {}, emit() {} };
  context.CardEngine = { isColorR1Active() { return false; } };
  context.rand = (a, b) => (a + b) / 2;
  context.meteorBaseRadius = () => 4;
  context.getMeteorCollisionRadius = (m) => Number(m.r) || 1;
  context.massFromR = (r) => r * r;
  context.computeGravityFromPlanetRadius = (r) => r * 1.2;
  context.computeOmega = (base) => base;
  context.getWorldViewBounds = () => ({ l: -1000, r: 1000, t: -1000, b: 1000 });
  context.hueFromName = () => 0;
  context.makeRng = () => () => 0.5;
  context.hash32 = () => 1;
  context.getDirectOrbitersOfBody = (body) => Array.isArray(body.orbiters) ? body.orbiters.slice() : [];
  context.removeOrbitersConsumed = () => {};
  context.View = { w: 800, h: 600 };
  context.World = {
    meteors: [], asteroids: [], planets: [], moons: [], stars: [], impactFragments: [], harmonicDust: [],
    harmonicDustReservoir: { activeColorName: null, isMixedGray: false, fillPercent: 33 },
    harmonicDustDeposits: { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0, GRAY: 0 },
    ROCKY_MAX_SYSTEM_ORBITERS: 4,
    metaOrbitMulPlanet: 1,
    spaceMechanics: {
      planetImpactAbsorbPercent: 0.22,
      planetImpactExplosionPercent: 0.28,
      planetImpactEjectaPercent: 0.35,
      planetImpactOrbiterPercent: 0.15,
      planetImpactFirstOrbiterChance: 0,
      impactEjectaMinMass: 0.01,
      impactEjectaMaxPieces: 3,
    },
  };
  vm.createContext(context);
  const root = path.resolve(__dirname, '..');
  for (const file of ['hc.space_bodies.js', 'hc.impact.js', 'hc.world_render_snapshot.js', 'hc.planets.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  context.HC.initPlanets();
  return context;
}

function planet() { return { id: 'p1', type: 'planet', planetKind: 'gas', x: 0, y: 0, r: 10, mass: 100, orbitPx: 40, orbiters: [], captureCooldown: 0 }; }
function meteor(id, x) { return { id, type: 'meteor', kind: 'meteor', colorName: 'red', x, y: 0, vx: 0, vy: 0, r: 2, age: 1 }; }

let context = buildContext();
context.World.planets = [planet()];
context.World.meteors = [meteor('direct', 11)];
let called = 0;
const originalResolve = context.HC.Impact.resolvePlanetImpact;
context.HC.Impact = Object.assign({}, context.HC.Impact, { resolvePlanetImpact(input) { called += 1; return originalResolve(input); } });
context.HC.Planets.capture(0.016, 1234);
assert.equal(called, 1, 'direct planet impact calls resolvePlanetImpact');
assert.equal(context.World.meteors.length, 0, 'direct impact consumes meteor');
assert.equal(context.World.planets[0].orbiters.length, 0, 'direct impact does not also create a legacy orbiter');
assert.equal(context.World.planets[0].lastImpact.kind, 'planetImpact');
assert.equal(context.World.planets[0].lastImpact.mode, 'direct');
assert.equal(context.World.planets[0].lastImpact.createsDust, false);
assert.equal(context.World.harmonicDust.length, 0, 'planet impact creates no harmonic dust');
assert.equal(context.World.harmonicDustReservoir.fillPercent, 33, 'planet impact does not touch harmonicDustReservoir');
assert.equal(context.World.planetImpactCount, 1, 'world tracks planet impact count');
const snapshot = context.HC.WorldRenderSnapshot.build({ World: context.World, Camera: {}, View: {}, nowMs: 1234, dt: 0.016 });
assert.equal(snapshot.world.planets[0].lastImpact.kind, 'planetImpact', 'snapshot exposes planet.lastImpact');
assert.equal(snapshot.world.planetImpactCount, 1, 'snapshot exposes planet impact counter');

context = buildContext();
context.World.planets = [planet()];
context.World.meteors = [meteor('legacy', 35)];
context.HC.Planets.capture(0.016, 1234);
assert.equal(context.World.meteors.length, 0, 'legacy capture still consumes non-direct meteor inside orbit radius');
assert.equal(context.World.planets[0].orbiters.length, 1, 'legacy capture still creates an orbiter');
assert.equal(context.World.planets[0].lastImpact, undefined, 'legacy capture does not set direct impact evidence');
assert.equal(context.World.planetImpactCount || 0, 0, 'legacy capture does not increment direct impact counter');

context = buildContext();
context.World.planets = [planet()];
context.World.asteroids = [{ id: 'a1', type: 'asteroid', kind: 'asteroid', x: 11, y: 0, vx: 0, vy: 0, r: 2, age: 1, mass: 16 }];
context.HC.Planets.capture(0.016, 1234);
assert.equal(context.World.asteroids.length, 0, 'direct asteroid impact consumes asteroid');
assert.equal(context.World.planets[0].lastImpact.source, 'asteroid', 'asteroid direct impact evidence is recorded');
assert.equal(context.World.harmonicDust.length, 0, 'asteroid planet impact creates no harmonic dust');
assert.equal(context.World.harmonicDustReservoir.fillPercent, 33, 'asteroid planet impact does not touch reservoir');

console.log('planet_impact_vm.test.js: OK');
