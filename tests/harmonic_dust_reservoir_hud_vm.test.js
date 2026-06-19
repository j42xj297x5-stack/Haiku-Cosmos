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
  context.getMeteorCollisionRadius = (m) => Number(m.r) || 1;
  context.View = { worldScale: 100 };
  context.Input = { pointerDown: false, wx: 0, wy: 0 };
  context.World = { meteors: [], asteroids: [], harmonicDust: [], pointerRadius: 0.2, meteorCollisionFudge: 1, nowMs: 0, spaceMechanics: { harmonicDustMergeRadiusMul: 2.0 } };
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
}
function collectAll(context) {
  for (const dust of context.World.harmonicDust) dust.collectRequiredMs = 1;
  context.Input.pointerDown = true;
  while (context.World.harmonicDust.length) {
    context.Input.wx = context.World.harmonicDust[0].x;
    context.Input.wy = context.World.harmonicDust[0].y;
    context.HC.HarmonicDust.update(1, (context.World.nowMs += 1000));
  }
  context.Input.pointerDown = false;
}

let context = buildContext();
collide(context, 'red', 100, 0, 0);
collectAll(context);
assert.equal(context.World.harmonicDustReservoir.activeColorName, 'RED');
assert.equal(context.World.harmonicDustReservoir.fillPercent, 10);
assert.equal(context.World.harmonicDustReservoir.isMixedGray, false);
assert.equal(context.World.dustPile.activeType, 'RED');
assert.equal(context.World.dustPile.percent, 10);

collide(context, 'red', 200, 200, 0);
collide(context, 'red', 300, 400, 0);
collectAll(context);
assert.equal(context.World.harmonicDustReservoir.fillPercent, 80);
assert.equal(context.World.harmonicDustReservoirVisual.displayColorName, 'RED');
assert.equal(context.World.harmonicDustReservoirVisual.displayFillPercent, 80);

collide(context, 'red', 400, 600, 0);
collectAll(context);
assert.equal(context.World.harmonicDustDeposits.RED, 1);
assert.equal(context.World.harmonicDustReservoir.fillPercent, 0);
assert.equal(context.World.dustPile.activeType, 'NONE');
assert.equal(context.Events.emitted.some((e) => e.type === 'HARMONIC_DUST_RESERVOIR_DEPOSITED' && e.payload.colorName === 'RED'), true);

context = buildContext();
collide(context, 'red', 100, 0, 0);
collectAll(context);
collide(context, 'blue', 200, 200, 0);
collectAll(context);
assert.equal(context.World.harmonicDustReservoir.fillPercent, 20);
assert.equal(context.World.harmonicDustReservoir.isMixedGray, true);
assert.equal(context.World.harmonicDustReservoir.activeColorName, 'GRAY');
assert.equal(context.World.dustPile.activeType, 'GREY');
for (let i = 0; i < 8; i += 1) collide(context, 'blue', 300 + i * 100, 400 + i * 200, 0);
collectAll(context);
assert.equal(context.World.harmonicDustDeposits.GRAY, 1);
assert.equal(context.World.harmonicDustReservoir.fillPercent, 0);

const snapshot = context.HC.WorldRenderSnapshot.build({ World: context.World, View: { w: 800, h: 600 } });
assert.equal(snapshot.world.harmonicDustDeposits.GRAY, 1);
assert.equal(snapshot.world.harmonicDustReservoirVisual.displayColorName, 'EMPTY');

const layout = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../public/settings/hud-top-layout.json'), 'utf8'));
assert(layout.elements.some((element) => element.id === 'hud_top_dust_reservoir' && element.mountRole === 'dustReservoir'));
assert.equal(JSON.stringify(layout).includes('fillPercent'), false, 'HUD TOP layout settings must not persist runtime fillPercent');

console.log('harmonic_dust_reservoir_hud_vm.test.js: OK');
