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
assert.equal(context.World.spaceMechanics.harmonicDustManualCollectionEnabled, true, 'manual PRG collection is enabled by default');
assert.equal(context.World.spaceMechanics.harmonicDustAutoTestCollectionEnabled, false, 'auto/test collection is disabled by default');
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
assert.equal(context.World.harmonicDustReservoir.fillPercent, 0, 'fourth clean 50% sample auto-deposits and resets reservoir');
assert.equal(context.World.harmonicDustDeposits.RED, 1, 'full clean RED reservoir creates one RED deposit');
assert.equal(context.Events.emitted.some((e) => e.type === 'HARMONIC_DUST_RESERVOIR_DEPOSITED' && e.payload.colorName === 'RED'), true, 'RED deposit emits event evidence');

context = buildContext();
collide(context, 'red', 100, 0, 0);
collectAll(context);
collide(context, 'blue', 200, 200, 0);
collectAll(context);
assert.equal(context.World.harmonicDustReservoir.fillPercent, 20, 'foreign color adds only 10% to existing RED reservoir');
assert.equal(context.World.harmonicDustReservoir.isMixedGray, true, 'foreign color flips reservoir to mixed gray');
assert.equal(context.World.harmonicDustReservoir.activeColorName, 'GRAY');
assert.equal(context.Events.emitted.some((e) => e.type === 'HARMONIC_DUST_RESERVOIR_MIXED' && e.payload.addedPercent === 10), true, 'mixed transition emits event evidence');
for (let i = 0; i < 8; i += 1) collide(context, 'blue', 300 + i * 100, 400 + i * 200, 0);
collectAll(context);
assert.equal(context.World.harmonicDustReservoir.fillPercent, 0, 'full mixed/GRAY reservoir resets after deposit');
assert.equal(context.World.harmonicDustDeposits.GRAY, 1, 'mixed reservoir deposits to GRAY');

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
assert.equal(merged.isBeingCollected, true, 'PRG overlap marks dust as being collected');
const progressed = merged.collectProgressMs;
context.Input.pointerDown = false;
context.HC.HarmonicDust.update(0.5, 1800);
assert(merged.collectProgressMs < progressed, 'missing PRG overlap decays progress');

context = buildContext();
d1 = collide(context, 'yellow', 100, 0, 0);
const noContactProgress = d1.collectProgressMs;
context.Input.pointerDown = false;
context.HC.HarmonicDust.update(1, 1100);
assert.equal(d1.collectProgressMs, noContactProgress, 'dust does not collect without active PRG contact by default');
context.Input.pointerDown = true;
context.Input.wx = d1.x;
context.Input.wy = d1.y;
context.HC.HarmonicDust.update(0.25, 1350);
assert(d1.collectProgressMs > noContactProgress, 'dust collects during active PRG contact');
context.Input.pointerDown = false;
let snapshot = context.HC.WorldRenderSnapshot.build({ World: context.World, Camera: {}, View: context.View, nowMs: 12000, dt: 0.016 });
assert.equal(snapshot.world.prgIndicator.active, false, 'PRG indicator is inactive by default without pointerDown');
assert.equal(snapshot.diagnostics.prgIndicatorEnabled, true, 'diagnostics expose PRG indicator enabled flag');
context.CardEngine.state.engineStats.pointer_radius_mul = 1.5;
context.Input.pointerDown = true;
context.Input.wx = 123;
context.Input.wy = 456;
snapshot = context.HC.WorldRenderSnapshot.build({ World: context.World, Camera: {}, View: context.View, nowMs: 12000, dt: 0.016 });
const expectedPrgRadius = context.HC.HarmonicDust.getPrgActionField(context.World).radius;
assert.equal(snapshot.world.prgIndicator.active, true, 'PRG indicator is active on pointerDown');
assert.equal(snapshot.world.prgIndicator.x, 123, 'PRG indicator x follows world pointer x');
assert.equal(snapshot.world.prgIndicator.y, 456, 'PRG indicator y follows world pointer y');
assert.equal(snapshot.world.prgIndicator.radius, expectedPrgRadius, 'PRG indicator radius matches harmonic dust PRG action field');
assert(snapshot.world.prgIndicator.radius > 0, 'PRG indicator radius is positive');
assert.equal(snapshot.world.prgIndicator.style.kind, 'dashed_circle', 'PRG indicator uses dashed circle style');
assert(snapshot.world.prgIndicator.style.opacity > 0, 'PRG indicator style opacity is positive');
assert(snapshot.world.prgIndicator.style.dashCount > 0, 'PRG indicator style dash count is positive');
assert.equal(snapshot.diagnostics.prgIndicatorActive, true, 'diagnostics expose active PRG indicator');
assert.equal(snapshot.diagnostics.prgIndicatorRadius, expectedPrgRadius, 'diagnostics expose PRG indicator radius');
assert(Array.isArray(snapshot.world.harmonicDust), 'snapshot exposes harmonicDust array');
assert.equal(snapshot.world.harmonicDust[0].type, 'harmonic_dust', 'snapshot exposes harmonic dust type');
assert.equal(snapshot.world.harmonicDust[0].dustKind, 'harmonic', 'snapshot exposes harmonic dust kind');
assert.equal(snapshot.world.harmonicDust[0].collectible, true, 'snapshot marks harmonic dust collectible');
assert.equal(snapshot.world.harmonicDust[0].originalColorName, 'YELLOW', 'snapshot exposes original harmonic color');
assert.equal(snapshot.world.harmonicDust[0].transformState, 'harmonic', 'snapshot defaults harmonic transform state');
assert.equal(typeof snapshot.world.harmonicDust[0].collectRatio, 'number', 'snapshot exposes collectRatio');
assert.equal(snapshot.world.harmonicDust[0].visual.model, 'dust_cloud', 'snapshot exposes dust_cloud visual model');
assert.notEqual(snapshot.world.harmonicDust[0].dustKind, 'ordinary_colored', 'snapshot never emits ordinary colored dust kind');
assert.equal(snapshot.world.harmonicDust[0].reservoirPercentValue, 10, 'snapshot exposes dust reservoir percent value');
assert.equal(snapshot.world.harmonicDustSequence.step, 1, 'snapshot exposes harmonic dust sequence');
assert.equal(snapshot.world.harmonicDustReservoir.fillPercent, 0, 'snapshot exposes reservoir placeholder');
assert.equal(JSON.stringify(snapshot.world.harmonicDustDeposits), JSON.stringify({ RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0, GRAY: 0 }), 'snapshot exposes harmonic dust deposits');
assert.equal(snapshot.world.harmonicDustReservoirVisual.displayColorName, 'EMPTY', 'snapshot exposes visual reservoir state');
assert.equal(snapshot.diagnostics.harmonicDustManualCollectionEnabled, true, 'diagnostics expose manual collection flag');
assert.equal(snapshot.diagnostics.harmonicDustAutoTestCollectionEnabled, false, 'diagnostics expose auto/test collection flag');
assert.equal(snapshot.diagnostics.harmonicDustCount, 1, 'diagnostics expose harmonicDustCount');
assert.equal(snapshot.diagnostics.collectibleDustCount, 1, 'diagnostics expose collectibleDustCount');
context = buildContext();
context.World.asteroids = [{ id: 'ast_gray_1', type: 'asteroid', x: 0, y: 0, vx: 4, vy: 0, r: 12, mass: 9 }];
context.World.harmonicDust = [{ id: 'dust_red_gray', type: 'harmonic_dust', dustKind: 'harmonic', collectible: true, colorName: 'RED', reservoirColorName: 'RED', x: 0, y: 0, r: 14, mass: 10, density: 0.42, collectProgressMs: 0, collectRequiredMs: 999999, reservoirPercentValue: 10 }];
context.HC.HarmonicDust.updateBodyTransformations(context.World, 4, 16000);
assert(context.World.harmonicDust[0].grayMixRatio > 0, 'asteroid exposure increases grayMixRatio');
assert.equal(context.World.harmonicDust[0].transformState, 'gray_shifting', 'active asteroid exposure marks gray_shifting');
assert.equal(context.World.harmonicDust[0].type, 'harmonic_dust', 'asteroid-gray dust keeps harmonic dust type');
assert.equal(context.World.harmonicDust[0].dustKind, 'harmonic', 'asteroid-gray dust remains harmonic');
assert.equal(context.World.cosmicDust, undefined, 'asteroid-gray path does not create cosmic dust');

context = buildContext();
context.World.harmonicDust = [{ id: 'dust_gray_collect', type: 'harmonic_dust', dustKind: 'harmonic', collectible: true, colorName: 'GRAY', reservoirColorName: 'GRAY', x: 0, y: 0, r: 14, mass: 10, density: 0.42, collectProgressMs: 0, collectRequiredMs: 1, reservoirPercentValue: 10 }];
context.Input.pointerDown = true;
context.Input.wx = 0;
context.Input.wy = 0;
context.HC.HarmonicDust.update(1, 17000);
assert.equal(context.World.harmonicDustReservoir.activeColorName, 'GRAY', 'GRAY harmonicDust collection routes to GRAY reservoir');
assert.equal(context.World.harmonicDustReservoir.isMixedGray, true, 'GRAY harmonicDust collection marks mixed gray reservoir');
assert.equal(context.World.cosmicDust, undefined, 'GRAY collection does not create cosmic dust');

context = buildContext();
context.World.moons = [{ id: 'moon_blue_ring', type: 'moon', x: 0, y: 0, r: 10, mass: 5 }];
context.World.harmonicDust = [{ id: 'dust_blue_ring', type: 'harmonic_dust', dustKind: 'harmonic', collectible: true, colorName: 'BLUE', reservoirColorName: 'BLUE', x: 0, y: 0, r: 14, mass: 10, density: 0.42, collectProgressMs: 0, collectRequiredMs: 999999, reservoirPercentValue: 10 }];
const beforeMoonDustMass = context.World.harmonicDust[0].mass;
context.HC.HarmonicDust.updateBodyTransformations(context.World, 1, 18000);
assert(Array.isArray(context.World.moons[0].dustRings), 'moon gains dustRings array');
assert.equal(context.World.moons[0].dustRings[0].colorName, 'BLUE', 'moon mini-ring keeps absorbed dust color');
assert(context.World.harmonicDust[0].mass < beforeMoonDustMass, 'moon absorption decreases dust mass');
assert.equal(context.World.moons[0].dustRings[0].source, 'harmonic_dust_absorption', 'moon mini-ring records harmonic absorption source');
assert.equal(context.World.moons[0].orbiters, undefined, 'moon dust ring does not create moon orbiters');
assert.equal(context.World.moons[0].dustRings[0].parentKind, undefined, 'moon dust ring does not create parentKind');
assert.equal(context.World.moons[0].dustRings[0].parentRef, undefined, 'moon dust ring does not create parentRef');

context = buildContext();
context.World.moons = [{ id: 'moon_gray_ignore', type: 'moon', x: 0, y: 0, r: 10, mass: 5 }];
context.World.harmonicDust = [{ id: 'dust_gray_ignore', type: 'harmonic_dust', dustKind: 'harmonic', collectible: true, colorName: 'GRAY', reservoirColorName: 'GRAY', x: 0, y: 0, r: 14, mass: 10, density: 0.42, collectProgressMs: 0, collectRequiredMs: 999999, reservoirPercentValue: 10 }];
context.HC.HarmonicDust.updateBodyTransformations(context.World, 1, 19000);
assert.equal(context.World.moons[0].dustRings, undefined, 'GRAY harmonicDust is ignored by moon mini-ring path in this patch');

snapshot = context.HC.WorldRenderSnapshot.build({ World: {
  harmonicDust: [{ id: 'snapshot_gray', type: 'harmonic_dust', dustKind: 'harmonic', colorName: 'GRAY', x: 1, y: 2, r: 3, mass: 4, density: 0.4, transformState: 'gray_mixed_by_asteroid', grayMixRatio: 1 }],
  moons: [{ id: 'snapshot_moon', type: 'moon', x: 4, y: 5, r: 6, dustRings: [{ id: 'ring1', colorName: 'BLUE', mass: 1, density: 0.1, radius: 8, source: 'harmonic_dust_absorption' }] }],
  spaceMechanics: {},
}, Camera: {}, View: context.View, nowMs: 20000, dt: 0.016 });
assert.equal(snapshot.world.harmonicDust[0].transformState, 'gray_mixed_by_asteroid', 'snapshot exposes harmonicDust transformState');
assert.equal(snapshot.world.harmonicDust[0].originalColorName, null, 'snapshot tolerates missing originalColorName on legacy GRAY dust');
assert.equal(snapshot.world.harmonicDust[0].grayMixRatio, 1, 'snapshot exposes harmonicDust grayMixRatio');
assert.equal(snapshot.world.harmonicDust[0].visual.grayMixRatio, 1, 'snapshot visual exposes grayMixRatio');
assert.equal(snapshot.world.moons[0].dustRings[0].colorName, 'BLUE', 'snapshot exposes moon dustRings');
assert.equal(snapshot.world.moons[0].dustRingCount, 1, 'snapshot exposes moon dust ring count');
assert.equal(snapshot.world.harmonicDust.some((dust) => dust.dustKind === 'ordinary_colored'), false, 'snapshot never emits ordinary_colored dust');
assert.equal(Array.isArray(snapshot.world.cosmicDust) && snapshot.world.cosmicDust.length, 0, 'snapshot exposes empty cosmic dust foundation without mixing it into harmonic dust');


context = buildContext();
context.World.spaceMechanics.harmonicDustGrayRecoveryTimeMul = 2.0;
context.World.asteroids = [{ id: 'ast_recover', type: 'asteroid', x: 0, y: 0, vx: 4, vy: 0, r: 12, mass: 9 }];
context.World.harmonicDust = [{ id: 'dust_recover', type: 'harmonic_dust', dustKind: 'harmonic', collectible: true, originalColorName: 'RED', colorName: 'RED', reservoirColorName: 'RED', x: 0, y: 0, r: 14, mass: 10, density: 1, collectProgressMs: 0, collectRequiredMs: 999999, reservoirPercentValue: 10 }];
context.HC.HarmonicDust.updateBodyTransformations(context.World, 1, 21000);
const disturbedRatio = context.World.harmonicDust[0].grayMixRatio;
assert(disturbedRatio > 0, 'exposure created recoverable gray shift');
context.World.asteroids = [];
context.HC.HarmonicDust.updateBodyTransformations(context.World, 0.5, 21500);
assert(context.World.harmonicDust[0].grayMixRatio < disturbedRatio, 'no exposure triggers recovery and lowers grayMixRatio');
assert(['recovering', 'harmonic'].includes(context.World.harmonicDust[0].transformState), 'recovering dust reports recovering or harmonic after full recovery');

context = buildContext();
context.World.spaceMechanics.harmonicDustGrayRecoveryTimeMul = 2.0;
context.World.asteroids = [{ id: 'ast_recover_2x', type: 'asteroid', x: 0, y: 0, vx: 0, vy: 0, r: 12, mass: 9 }];
context.World.harmonicDust = [{ id: 'dust_recover_2x', type: 'harmonic_dust', dustKind: 'harmonic', collectible: true, originalColorName: 'GREEN', colorName: 'GREEN', reservoirColorName: 'GREEN', x: 0, y: 0, r: 14, mass: 10, density: 1, grayMixRatio: 0.5, grayExposureMs: 1000, collectProgressMs: 0, collectRequiredMs: 999999, reservoirPercentValue: 10 }];
context.World.asteroids = [];
context.HC.HarmonicDust.updateBodyTransformations(context.World, 0.5, 22500);
assert(context.World.harmonicDust[0].grayMixRatio > 0, '2x recovery is not immediate after half the recovery window');
context.HC.HarmonicDust.updateBodyTransformations(context.World, 2.0, 24500);
assert.equal(context.World.harmonicDust[0].grayMixRatio, 0, '2x recovery window returns grayMixRatio to 0');
assert.equal(context.World.harmonicDust[0].transformState, 'harmonic', 'fully recovered dust returns to harmonic state');
assert.equal(context.World.harmonicDust[0].colorName, 'GREEN', 'fully recovered dust restores original color');

context = buildContext();
context.World.spaceMechanics.harmonicDustGrayBaseRate = 4;
context.World.spaceMechanics.harmonicDustGrayConversionThreshold = 1.0;
context.World.asteroids = [{ id: 'ast_lock', type: 'asteroid', x: 0, y: 0, vx: 10, vy: 0, r: 12, mass: 9 }];
context.World.harmonicDust = [{ id: 'dust_lock', type: 'harmonic_dust', dustKind: 'harmonic', collectible: true, originalColorName: 'BLUE', colorName: 'BLUE', reservoirColorName: 'BLUE', x: 0, y: 0, r: 14, mass: 10, density: 1, collectProgressMs: 0, collectRequiredMs: 999999, reservoirPercentValue: 10 }];
context.HC.HarmonicDust.updateBodyTransformations(context.World, 1, 25000);
assert.equal(context.World.harmonicDust[0].transformState, 'gray_locked', 'threshold locks gray state');
assert.equal(context.World.harmonicDust[0].colorName, 'GRAY', 'locked dust colorName becomes GRAY');
assert.equal(context.World.harmonicDust[0].futureCosmicCandidate, true, 'locked gray dust is only marked as future cosmic candidate');
assert.equal(context.World.cosmicDust, undefined, 'gray lock does not create World.cosmicDust');

context = buildContext();
context.World.harmonicDust = [{ id: 'dust_partial_collect', type: 'harmonic_dust', dustKind: 'harmonic', collectible: true, originalColorName: 'RED', colorName: 'RED', reservoirColorName: 'RED', transformState: 'recovering', grayMixRatio: 0.4, x: 0, y: 0, r: 14, mass: 10, density: 0.42, collectProgressMs: 0, collectRequiredMs: 1, reservoirPercentValue: 10 }];
context.Input.pointerDown = true;
context.Input.wx = 0;
context.Input.wy = 0;
context.HC.HarmonicDust.update(1, 26000);
assert.equal(context.World.harmonicDustReservoir.activeColorName, 'RED', 'recoverable pre-threshold dust collection uses original harmonic color');
assert.equal(context.World.harmonicDustReservoir.isMixedGray, false, 'recoverable pre-threshold collection does not become cosmic or mixed gray');
assert.equal(context.World.cosmicDust, undefined, 'recoverable collection does not create cosmic dust');

context = buildContext();
context.World.harmonicDust = [{ id: 'dust_locked_collect', type: 'harmonic_dust', dustKind: 'harmonic', collectible: true, originalColorName: 'YELLOW', colorName: 'GRAY', reservoirColorName: 'GRAY', transformState: 'gray_locked', futureCosmicCandidate: true, grayMixRatio: 1, x: 0, y: 0, r: 14, mass: 10, density: 0.42, collectProgressMs: 0, collectRequiredMs: 1, reservoirPercentValue: 10 }];
context.Input.pointerDown = true;
context.Input.wx = 0;
context.Input.wy = 0;
context.HC.HarmonicDust.update(1, 27000);
assert.equal(context.World.harmonicDustReservoir.activeColorName, 'GRAY', 'locked GRAY dust collection routes to GRAY reservoir');
assert.equal(context.World.harmonicDustReservoir.isMixedGray, true, 'locked GRAY dust collection marks mixed gray reservoir');
assert.equal(context.World.cosmicDust, undefined, 'locked GRAY collection does not create cosmic dust');

snapshot = context.HC.WorldRenderSnapshot.build({ World: {
  harmonicDust: [{ id: 'snapshot_elastic', type: 'harmonic_dust', dustKind: 'harmonic', originalColorName: 'RED', colorName: 'RED', x: 1, y: 2, r: 3, mass: 4, density: 0.4, transformState: 'recovering', grayMixRatio: 0.25, grayExposureMs: 1000, grayRecoveryMs: 500 }],
  spaceMechanics: {},
}, Camera: {}, View: context.View, nowMs: 28000, dt: 0.016 });
assert.equal(snapshot.world.harmonicDust[0].originalColorName, 'RED', 'elastic snapshot exposes originalColorName');
assert.equal(snapshot.world.harmonicDust[0].grayMixRatio, 0.25, 'elastic snapshot exposes grayMixRatio');
assert.equal(snapshot.world.harmonicDust[0].grayExposureMs, 1000, 'elastic snapshot exposes grayExposureMs');
assert.equal(snapshot.world.harmonicDust[0].grayRecoveryMs, 500, 'elastic snapshot exposes grayRecoveryMs');
assert.equal(snapshot.world.harmonicDust[0].transformState, 'recovering', 'elastic snapshot exposes transformState');
assert.equal(snapshot.world.harmonicDust[0].visual.originalColorName, 'RED', 'elastic snapshot visual exposes originalColorName');
assert.equal(snapshot.world.harmonicDust.some((dust) => dust.dustKind === 'cosmic'), false, 'snapshot never emits cosmic dust kind');
assert.equal(Array.isArray(snapshot.world.cosmicDust) && snapshot.world.cosmicDust.length, 0, 'snapshot contract exposes empty World.cosmicDust foundation');

console.log('harmonic_dust_vm.test.js: OK');
