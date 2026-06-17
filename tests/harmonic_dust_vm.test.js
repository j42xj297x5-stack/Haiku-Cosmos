const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = {
  console,
  performance: { now: () => context.window.World?.nowMs || 0 },
  window: {},
};
context.window = context;
context.HC = { getWorld: () => context.World };
context.Events = { emitted: [], emit(type, payload) { this.emitted.push({ type, payload }); } };
context.CardEngine = { state: { engineStats: {} }, onHitColor() {}, isColorR1Active() { return false; } };
context.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
context.spawnAsteroidFromCollision = (a, b) => { context.World.asteroids.push({ type: 'asteroid', sourceColors: [a.colorName, b.colorName] }); };
context.getMeteorCollisionRadius = (m) => Number(m.r) || 1;
context.View = { worldScale: 100 };
context.Input = { pointerDown: false, wx: 0, wy: 0 };
context.World = {
  meteors: [],
  asteroids: [],
  harmonicDust: [],
  pointerRadius: 0.2,
  meteorCollisionFudge: 1,
  nowMs: 0,
  spaceMechanics: {
    harmonicDustBaseCollectMs: 2400,
    harmonicDustMassCollectMsMul: 850,
    harmonicDustMaxCollectMs: 8000,
  },
};
vm.createContext(context);
for (const file of ['hc.space_bodies.js', 'hc.harmonic_dust.js', 'hc.collisions.js', 'hc.world_render_snapshot.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
context.HC.initHarmonicDust();
context.HC.initCollisions();

function meteor(id, colorName, x, y) {
  return { id, colorName, x, y, z: 0, vx: 0, vy: 0, r: 4, mass: 1, age: 1 };
}

context.World.meteors = [meteor('r1', 'red', 0, 0), meteor('r2', 'red', 2, 0)];
context.HC.Collisions.resolve(0.016, 100);
assert.equal(context.World.meteors.length, 0, 'same-color meteors are consumed');
assert.equal(context.World.harmonicDust.length, 1, 'same-color collision creates harmonic dust');
let dust = context.World.harmonicDust[0];
assert.equal(dust.type, 'harmonic_dust');
assert.equal(dust.dustKind, 'harmonic');
assert.equal(dust.collectible, true);
assert.equal(dust.isCosmicGrayDust, false);
assert.equal(dust.colorName, 'RED');
assert.equal(dust.source, 'same_color_meteor_collision');
assert(dust.collectRequiredMs >= 2400 && dust.collectRequiredMs <= 8000);
const firstRequired = dust.collectRequiredMs;

context.World.meteors = [meteor('b1', 'blue', 50, 0), meteor('g1', 'green', 52, 0)];
context.HC.Collisions.resolve(0.016, 200);
assert.equal(context.World.asteroids.length, 1, 'different-color collision still creates asteroid');
assert.equal(context.World.harmonicDust.length, 1, 'different-color collision does not create harmonic dust');

context.World.meteors = [meteor('r3', 'red', 1, 1), meteor('r4', 'red', 2, 1)];
context.HC.Collisions.resolve(0.016, 300);
assert.equal(context.World.harmonicDust.length, 1, 'nearby same-color collision merges into existing dust');
dust = context.World.harmonicDust[0];
assert(dust.mass > 1, 'merged dust mass increases');
assert(dust.collectRequiredMs > firstRequired, 'merged dust collection time increases');

context.Input.pointerDown = true;
context.Input.wx = dust.x;
context.Input.wy = dust.y;
const beforeProgress = dust.collectProgressMs;
context.HC.HarmonicDust.update(1, 1300);
assert(dust.collectProgressMs > beforeProgress, 'PRG overlap increases collection progress');
const progressed = dust.collectProgressMs;
context.Input.pointerDown = false;
context.HC.HarmonicDust.update(0.5, 1800);
assert(dust.collectProgressMs < progressed, 'missing PRG overlap decays progress');

context.Input.pointerDown = true;
context.Input.wx = dust.x;
context.Input.wy = dust.y;
for (let i = 0; i < 10 && context.World.harmonicDust.length; i += 1) context.HC.HarmonicDust.update(1, 3000 + i * 1000);
assert.equal(context.World.harmonicDust.length, 0, 'collected dust disappears');
assert(context.World.harmonicDustCollected.RED > 0, 'placeholder reservoir increases collected RED');

const snapshot = context.HC.WorldRenderSnapshot.build({ World: context.World, Camera: {}, View: {}, nowMs: 12000, dt: 0.016 });
assert(Array.isArray(snapshot.world.harmonicDust), 'snapshot exposes harmonicDust array');
assert.equal(snapshot.diagnostics.harmonicDustCount, 0, 'diagnostics expose harmonicDustCount');
assert.equal(snapshot.diagnostics.collectibleDustCount, 0, 'diagnostics expose collectibleDustCount');
console.log('harmonic_dust_vm.test.js: OK');
