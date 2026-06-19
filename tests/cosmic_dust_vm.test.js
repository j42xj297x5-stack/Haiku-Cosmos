const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function buildContext() {
  const context = { console, performance: { now: () => context.World?.nowMs || 0 }, window: {} };
  context.window = context;
  context.HC = { getWorld: () => context.World, logEvent() {} };
  context.Events = { emitted: [], emit(type, payload) { this.emitted.push({ type, payload }); } };
  context.CardEngine = { onHitColor() {}, isColorR1Active() { return false; }, state: { engineStats: {} } };
  context.rand = (a, b) => (a + b) / 2;
  context.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  context.meteorBaseRadius = () => 4;
  context.massFromR = (r) => r * r;
  context.sidesFromColors = () => 7;
  context.hueFromName = () => 0;
  context.World = { meteors: [], asteroids: [], moons: [], planets: [], impactFragments: [], harmonicDust: [], cosmicDust: [], meteorCollisionFudge: 1, asteroidDriftMul: 1, nowMs: 1000, spaceMechanics: {} };
  vm.createContext(context);
  const root = path.resolve(__dirname, '..');
  for (const file of ['hc.space_bodies.js', 'hc.impact.js', 'hc.harmonic_dust.js', 'hc.cosmic_dust.js', 'hc.collisions.js', 'hc.asteroids.js', 'hc.world_render_snapshot.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  context.HC.initHarmonicDust();
  context.HC.initAsteroids();
  context.HC.initCollisions();
  return context;
}
function meteor(id, colorName, mass = 10) { return { id, type: 'meteor', kind: 'meteor', colorName, x: 0, y: 0, vx: 0, vy: 0, r: 4, mass, age: 1 }; }
function asteroid(id, mass, x = 0) { return { id, type: 'asteroid', kind: 'asteroid', x, y: 0, vx: 0, vy: 0, r: 8, baseR: 8, massOneRadius: 8, minR: 1, maxR: 999, mass }; }
function moon(id, mass = 20) { return { id, type: 'moon', kind: 'moon', x: 0, y: 0, r: 10, radius: 10, mass, dustRings: [] }; }
function planet(id, mass = 100) { return { id, type: 'planet', kind: 'planet', x: 0, y: 0, r: 20, mass, orbiters: [] }; }
function totalCosmic(world) { return world.cosmicDust.reduce((sum, d) => sum + d.mass, 0); }

let c = buildContext();
c.World.meteors = [meteor('m1', 'red', 10), meteor('m2', 'blue', 10)];
c.HC.Collisions.resolve(0.016, 1000);
assert.equal(c.World.asteroids.length, 1, 'different-color meteor collision still creates asteroid');
assert.equal(c.World.cosmicDust.length, 1, 'different-color meteor collision also creates cosmic dust');
assert.equal(c.World.harmonicDust.length, 0, 'different-color meteor collision does not create harmonicDust');
assert.equal(c.World.cosmicDust[0].collectible, false);

c = buildContext();
c.World.meteors = [meteor('m1', 'red', 10), meteor('m2', 'red', 10)];
c.HC.Collisions.resolve(0.016, 1000);
assert.equal(c.World.harmonicDust.length, 1, 'same-color meteor collision creates harmonicDust');
assert.equal(c.World.cosmicDust.length, 0, 'same-color meteor collision does not create cosmic dust');

c = buildContext();
let m = meteor('m', 'yellow', 10), a = asteroid('a', 30);
c.HC.CosmicDust.applySplitPolicy(c.World, { kind: 'meteor_asteroid', meteor: m, asteroid: a });
assert.equal(totalCosmic(c.World), 8, 'meteor+asteroid sends 80% meteor mass to cosmic dust');
assert.equal(a.mass, 32, 'meteor+asteroid absorbs 20% meteor mass into asteroid');
assert.equal(m._dead, true, 'meteor+asteroid kills meteor');

c = buildContext();
let big = asteroid('big', 40), small = asteroid('small', 10);
c.HC.CosmicDust.applySplitPolicy(c.World, { kind: 'asteroid_asteroid', primary: big, secondary: small });
assert.equal(big.mass, 45, 'asteroid+asteroid grows larger by 50% smaller mass');
assert.equal(totalCosmic(c.World), 5, 'asteroid+asteroid sends 50% smaller mass to cosmic dust');
assert.equal(small._dead, true, 'asteroid+asteroid kills smaller asteroid');

c = buildContext();
let mo = moon('moon', 20), mm = meteor('met', 'green', 10);
c.HC.CosmicDust.applySplitPolicy(c.World, { kind: 'moon_meteor', moon: mo, meteor: mm });
assert.equal(totalCosmic(c.World), 3, 'moon+meteor sends 30% meteor mass to cosmic dust');
assert.equal(mo.mass, 27, 'moon+meteor absorbs 70% meteor mass');
assert.equal(mm._dead, true, 'moon+meteor kills meteor');

c = buildContext();
mo = moon('moon', 20); a = asteroid('ast', 10);
const moonAst = c.HC.CosmicDust.applySplitPolicy(c.World, { kind: 'moon_asteroid', moon: mo, asteroid: a });
assert.equal(totalCosmic(c.World), 3, 'moon+asteroid sends 30% asteroid mass to cosmic dust');
assert.equal(mo.mass, 23, 'moon+asteroid absorbs 30% asteroid mass');
assert.equal(Math.round(moonAst.fragmentMass), 4, 'moon+asteroid sends 40% asteroid mass to impact fragments');
assert.equal(a._dead, true, 'moon+asteroid kills asteroid');
assert.equal(mo.orbiters, undefined, 'moon+asteroid does not create moon orbiters');

c = buildContext();
let p = planet('p', 100); m = meteor('met', 'blue', 20);
const beforeReservoir = JSON.stringify(c.World.harmonicDustReservoir || null);
const pm = c.HC.CosmicDust.applySplitPolicy(c.World, { kind: 'planet_meteor', planet: p, meteor: m });
assert.equal(pm.cosmicDustMass, 5, 'planet+meteor creates 25% cosmic dust');
assert.equal(p.mass, 110, 'planet+meteor absorbs 50% meteor mass');
assert.equal(pm.fragmentMass, 5, 'planet+meteor creates 25% fragments');
assert.equal(m._dead, true, 'planet+meteor kills meteor');
assert.equal(JSON.stringify(c.World.harmonicDustReservoir || null), beforeReservoir, 'cosmic dust does not change HUD reservoir');

c = buildContext();
p = planet('p', 100); a = asteroid('ast', 20);
const pa = c.HC.CosmicDust.applySplitPolicy(c.World, { kind: 'planet_asteroid', planet: p, asteroid: a });
assert.equal(pa.cosmicDustMass, 7, 'planet+asteroid creates 35% cosmic dust');
assert.equal(pa.fragmentMass, 7, 'planet+asteroid creates 35% fragments');
assert.equal(pa.orbiterCandidate.mass, 6, 'planet+asteroid records 30% orbiterCandidate descriptor');
assert.equal(a._dead, true, 'planet+asteroid kills asteroid');
assert.equal(p.orbiters.length, 0, 'planet+asteroid does not restore legacy capture/orbiters');

const snap = c.HC.WorldRenderSnapshot.build({ World: c.World });
assert.ok(Array.isArray(snap.world.cosmicDust), 'snapshot exposes world.cosmicDust');
assert.equal(snap.world.cosmicDust[0].dustKind, 'cosmic');
assert.equal(snap.world.cosmicDust[0].collectible, false);
assert.equal(snap.world.cosmicDust[0].visual.model, 'cosmic_dust_cloud');
assert.equal(c.World.spaceMechanics.cosmicDustAffectsBodiesEnabled, false, 'physical effects default off for stabilization');
assert.ok(c.World.lastMassSplitEvent, 'mass split evidence is recorded');
assert.ok(Math.abs((pm.absorbedMass + pm.cosmicDustMass + pm.fragmentMass) - 20) < 1e-9, 'planet+meteor split conserves incoming meteor mass');


function cloud(id, x = 0, y = 0, r = 30, density = 1) { return { id, type: 'cosmic_dust', dustKind: 'cosmic', x, y, r, mass: 10, density, collectible: false }; }
function speed(body) { return Math.sqrt(body.vx * body.vx + body.vy * body.vy); }

c = buildContext();
m = meteor('drag-meteor', 'red', 4); m.vx = 1; m.vy = 0; c.World.meteors = [m]; c.World.cosmicDust = [cloud('c1')];
const beforeDrag = speed(m); c.HC.CosmicDust.update(c.World, 1, 2000);
assert.equal(speed(m), beforeDrag, 'cosmic dust has no physical influence by default');
c.World.spaceMechanics.cosmicDustAffectsBodiesEnabled = true; c.World.spaceMechanics.cosmicDustStopEnabled = true;
c.HC.CosmicDust.update(c.World, 1, 2000);
assert.ok(speed(m) < beforeDrag, 'explicit legacy/debug opt-in cosmic dust drag slows meteor');

c = buildContext();
c.World.spaceMechanics.cosmicDustAffectsBodiesEnabled = true;
m = meteor('far-meteor', 'red', 4); m.vx = 1; m.vy = 0; c.World.meteors = [m]; c.World.cosmicDust = [cloud('far', 999, 999)];
c.HC.CosmicDust.update(c.World, 1, 2000);
assert.equal(m.vx, 1, 'no overlap means no drag vx');
assert.equal(m.vy, 0, 'no overlap means no drag vy');

c = buildContext();
m = meteor('disabled-meteor', 'red', 4); m.vx = 1; c.World.meteors = [m]; c.World.cosmicDust = [cloud('c2')]; c.World.spaceMechanics.cosmicDustAffectsBodiesEnabled = false;
c.HC.CosmicDust.update(c.World, 1, 2000);
assert.equal(m.vx, 1, 'disabled cosmic dust influence means no drag');

c = buildContext();
m = meteor('harmonic-only', 'red', 4); m.vx = 1; c.World.meteors = [m]; c.World.harmonicDust = [{ id: 'hd', type: 'harmonic_dust', dustKind: 'harmonic', x: 0, y: 0, r: 40, mass: 10, density: 3 }];
c.HC.CosmicDust.update(c.World, 1, 2000);
assert.equal(m.vx, 1, 'harmonicDust does not drag through cosmic dust update');

c = buildContext();
c.World.spaceMechanics.cosmicDustAffectsBodiesEnabled = true;
const light = meteor('light', 'red', 2); light.vx = 1;
const heavy = asteroid('heavy', 40); heavy.vx = 1;
c.World.meteors = [light]; c.World.asteroids = [heavy]; c.World.cosmicDust = [cloud('c3', 0, 0, 40, 2)];
c.HC.CosmicDust.update(c.World, 1, 2000);
assert.ok(speed(light) < speed(heavy), 'heavy body resists cosmic dust drag more than light body');

c = buildContext();
c.World.spaceMechanics.cosmicDustAffectsBodiesEnabled = true; c.World.spaceMechanics.cosmicDustStopEnabled = true;
m = meteor('slow-light', 'red', 2); m.vx = 0.01; m.vy = 0; c.World.meteors = [m]; c.World.cosmicDust = [cloud('c4', 0, 0, 40, 5)];
c.HC.CosmicDust.update(c.World, 1, 2000);
assert.equal(m.vx, 0, 'stop threshold zeros vx for light slow body');
assert.equal(m.vy, 0, 'stop threshold zeros vy for light slow body');
assert.equal(m.cosmicDustStopped, true, 'stop threshold marks body stopped');

c = buildContext();
c.World.spaceMechanics.cosmicDustAffectsBodiesEnabled = true;
m = meteor('fast-light', 'red', 2); m.vx = 1; c.World.meteors = [m]; c.World.cosmicDust = [cloud('c5', 0, 0, 40, 2)];
c.HC.CosmicDust.update(c.World, 1, 2000);
assert.ok(m.vx > 0 && m.vx < 1, 'fast body is slowed but not zeroed');
assert.notEqual(m.cosmicDustStopped, true, 'fast body is not stopped immediately');

c = buildContext();
c.World.spaceMechanics.cosmicDustAffectsBodiesEnabled = true;
p = planet('stationary-planet', 100); p.vx = 1; p.vy = 0; c.World.planets = [p]; c.World.cosmicDust = [cloud('c6', 0, 0, 60, 5)]; c.World.spaceMechanics.cosmicDustAffectsPlanets = false;
c.HC.CosmicDust.update(c.World, 1, 2000);
assert.equal(p.vx, 1, 'planets are not affected when cosmicDustAffectsPlanets is false');
assert.equal(p.cosmicDustDragRatioLast, undefined, 'planet has no cosmic dust drag evidence');

c = buildContext();
c.World.spaceMechanics.cosmicDustAffectsBodiesEnabled = true;
m = meteor('snapshot-drag', 'red', 2); m.vx = 1; c.World.meteors = [m]; c.World.cosmicDust = [cloud('c7', 0, 0, 40, 2)];
c.HC.CosmicDust.update(c.World, 1, 2000);
const dragSnap = c.HC.WorldRenderSnapshot.build({ World: c.World });
assert.equal(dragSnap.diagnostics.cosmicDustAffectedBodiesCount, 1, 'snapshot diagnostics exposes affected count');
assert.equal(dragSnap.diagnostics.cosmicDustStoppedBodiesCount, 0, 'snapshot diagnostics exposes stopped count');
assert.ok(dragSnap.diagnostics.lastCosmicDustInfluenceEvent, 'snapshot diagnostics exposes last influence event');

c = buildContext();
c.World.spaceMechanics.cosmicDustCondensationEnabled = false;
c.World.cosmicDust = [cloud('no-condense', 0, 0, 80, 10)];
c.HC.CosmicDust.update(c.World, 1, 2000);
assert.equal(c.World.spaceMechanics.cosmicDustCondensationEnabled, false, 'cosmic dust condensation remains disabled');
assert.equal(c.World.planets.filter((body) => body.planetKind === 'gas').length, 0, 'cosmic dust update does not create gas planets');

const index = fs.readFileSync(path.resolve(__dirname, '..', 'index.html'), 'utf8');
assert.ok(index.indexOf('hc.cosmic_dust.js') > index.indexOf('hc.harmonic_dust.js'), 'cosmic dust loads after harmonic dust');
assert.ok(index.indexOf('hc.cosmic_dust.js') < index.indexOf('hc.collisions.js'), 'cosmic dust loads before collisions');
const runtimeList = fs.readFileSync(path.resolve(__dirname, '..', 'scripts/legacy-runtime-files.mjs'), 'utf8');
assert.ok(runtimeList.includes('hc.cosmic_dust.js'), 'legacy runtime sync includes cosmic dust file');
console.log('cosmic_dust_vm.test.js: ok');
