const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function buildContext() {
  const context = { console, performance: { now: () => context.window.World?.nowMs || 0 }, window: {} };
  context.window = context;
  context.HC = { getWorld: () => context.World };
  context.Events = { emitted: [], emit(type, payload) { this.emitted.push({ type, payload }); } };
  context.CardEngine = { state: { engineStats: {} }, onHitColor() {}, isColorR1Active() { return false; } };
  context.spawnAsteroidFromCollision = (a, b) => { context.World.asteroids.push({ type: 'asteroid', sourceColors: [a.colorName, b.colorName] }); };
  context.getMeteorCollisionRadius = (m) => Number(m.r) || 1;
  context.View = { worldScale: 100 };
  context.Input = { pointerDown: false, wx: 0, wy: 0 };
  context.World = {
    meteors: [], asteroids: [], harmonicDust: [], pointerRadius: 0.2, meteorCollisionFudge: 1, nowMs: 0,
    spaceMechanics: { harmonicDustBaseCollectMs: 2400, harmonicDustPercentCollectMsMul: 55, harmonicDustMaxCollectMs: 8000, harmonicDustMergeRadiusMul: 2.0 },
  };
  vm.createContext(context);
  const root = path.resolve(__dirname, '..');
  for (const file of ['hc.space_bodies.js', 'hc.harmonic_dust.js', 'hc.collisions.js', 'hc.world_render_snapshot.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  context.HC.initHarmonicDust();
  context.HC.initCollisions();
  return context;
}

function meteor(id, colorName, x, y) { return { id, colorName, x, y, z: 0, vx: 0, vy: 0, r: 4, mass: 1, age: 1 }; }
function collide(context, color, nowMs, x = nowMs, y = 0) {
  context.World.nowMs = nowMs;
  context.World.meteors = [meteor(`${color}${nowMs}a`, color, x, y), meteor(`${color}${nowMs}b`, color, x + 1, y)];
  context.HC.Collisions.resolve(0.016, nowMs);
  assert.equal(context.World.meteors.length, 0, 'same-color meteors are consumed');
  return context.World.harmonicDust.at(-1);
}
function collectAll(context) {
  for (const dust of context.World.harmonicDust) dust.collectRequiredMs = 1;
  context.Input.pointerDown = true;
  while (context.World.harmonicDust.length) {
    context.Input.wx = context.World.harmonicDust[0].x;
    context.Input.wy = context.World.harmonicDust[0].y;
    context.HC.HarmonicDust.update(1, (context.World.nowMs += 1000));
  }
}

let context = buildContext();
let d1 = collide(context, 'red', 100, 0, 0);
assert.equal(d1.dustSequenceStep, 1, 'first same-color collision uses sequence step 1');
assert.equal(d1.reservoirPercentValue, 10, 'first same-color collision is worth 10%');
assert.equal(d1.reservoirColorName, 'RED');
assert.equal(d1.source, 'same_color_meteor_collision');
const firstRequired = d1.collectRequiredMs;
let d2 = collide(context, 'red', 200, 200, 0);
assert.equal(d2.dustSequenceStep, 2, 'second same-color collision uses sequence step 2');
assert.equal(d2.reservoirPercentValue, 20, 'second same-color collision is worth 20%');
let d3 = collide(context, 'red', 300, 400, 0);
assert.equal(d3.dustSequenceStep, 3, 'third same-color collision uses sequence step 3');
assert.equal(d3.reservoirPercentValue, 50, 'third same-color collision is worth 50%');
let d4 = collide(context, 'red', 400, 600, 0);
assert.equal(d4.dustSequenceStep, 3, 'fourth uninterrupted same-color collision stays at max step 3');
assert.equal(d4.reservoirPercentValue, 50, 'fourth uninterrupted same-color collision stays worth 50%');
assert.equal(context.World.harmonicDust.length, 4, 'distant dust samples do not merge');

context = buildContext();
collide(context, 'red', 100, 0, 0);
collide(context, 'red', 200, 200, 0);
collide(context, 'red', 300, 400, 0);
collectAll(context);
assert.equal(context.World.harmonicDustReservoir.fillPercent, 80, '10+20+50 fills reservoir to 80%, not 100%');
assert.equal(context.World.harmonicDustReservoir.activeColorName, 'RED');
assert.equal(context.World.harmonicDustReservoir.isMixedGray, false);
collide(context, 'red', 400, 600, 0);
collectAll(context);
assert.equal(context.World.harmonicDustReservoir.fillPercent, 100, 'fourth clean 50% sample clamps and closes reservoir to 100%');

context = buildContext();
collide(context, 'red', 100, 0, 0);
collectAll(context);
collide(context, 'blue', 200, 200, 0);
collectAll(context);
assert.equal(context.World.harmonicDustReservoir.fillPercent, 20, 'foreign color adds only 10% to existing RED reservoir');
assert.equal(context.World.harmonicDustReservoir.isMixedGray, true, 'foreign color flips reservoir to mixed gray');
assert.equal(context.World.harmonicDustReservoir.activeColorName, 'GRAY');
assert.equal(context.Events.emitted.some((e) => e.type === 'HARMONIC_DUST_RESERVOIR_MIXED' && e.payload.addedPercent === 10), true, 'mixed transition emits event evidence');

context = buildContext();
d1 = collide(context, 'green', 100, 0, 0);
d2 = collide(context, 'green', 200, 1, 1);
assert.equal(context.World.harmonicDust.length, 1, 'nearby same-color collision merges into existing dust');
const merged = context.World.harmonicDust[0];
assert.equal(merged.reservoirPercentValue, 30, 'merged dust sums percent values');
assert(merged.collectRequiredMs > firstRequired, 'merged dust collection time increases with percent value');
assert.equal(merged.dustSequenceStep, 2, 'merged dust keeps latest sequence step evidence');

context.Input.pointerDown = true;
context.Input.wx = merged.x;
context.Input.wy = merged.y;
const beforeProgress = merged.collectProgressMs;
context.HC.HarmonicDust.update(1, 1300);
assert(merged.collectProgressMs > beforeProgress, 'PRG overlap increases collection progress');
const progressed = merged.collectProgressMs;
context.Input.pointerDown = false;
context.HC.HarmonicDust.update(0.5, 1800);
assert(merged.collectProgressMs < progressed, 'missing PRG overlap decays progress');

const snapshot = context.HC.WorldRenderSnapshot.build({ World: context.World, Camera: {}, View: {}, nowMs: 12000, dt: 0.016 });
assert(Array.isArray(snapshot.world.harmonicDust), 'snapshot exposes harmonicDust array');
assert.equal(snapshot.world.harmonicDust[0].reservoirPercentValue, 30, 'snapshot exposes dust reservoir percent value');
assert.equal(snapshot.world.harmonicDustSequence.step, 2, 'snapshot exposes harmonic dust sequence');
assert.equal(snapshot.world.harmonicDustReservoir.fillPercent, 0, 'snapshot exposes reservoir placeholder');
assert.equal(snapshot.diagnostics.harmonicDustCount, 1, 'diagnostics expose harmonicDustCount');
assert.equal(snapshot.diagnostics.collectibleDustCount, 1, 'diagnostics expose collectibleDustCount');
console.log('harmonic_dust_vm.test.js: OK');
