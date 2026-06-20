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
    dustClouds: [], dustParticles: [], impactFragments: [], harmonicDust: [],
    harmonicDustReservoir: { activeColorName: null, isMixedGray: false, fillPercent: 0, pureFillPercent: 0, grayFillPercent: 0, lastCollectedColorName: null, samplesCollected: 0 },
    harmonicDustDeposits: { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0, GRAY: 0 },
    nowMs: 1000,
    spaceMechanics: { asteroidToMoonMassThreshold: 2, asteroidToMoonEnabled: true, moonToRockyPlanetMassThreshold: 5, moonToRockyPlanetEnabled: true, moonImpactAbsorbMassMax: 0.30, moonImpactAbsorbPercent: 0.8, moonImpactExplosionPercent: 0.2, moonImpactEjectaPercent: 0.2, moonImpactDustPercent: 0.2, impactEjectaMinMass: 1, impactEjectaMaxPieces: 3, impactFragmentTtlMs: 100 },
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
for (const file of ['hc.space_bodies.js', 'hc.impact.js', 'hc.meteors.js', 'hc.asteroids.js', 'hc.world_render_snapshot.js', 'hc.world_renderer.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}
context.HC.initAsteroids();

const moon = { id: 'moon:test', type: 'moon', kind: 'moon', x: 0, y: 0, vx: 0, vy: 0, r: 1, mass: 3, progressionMode: 'free', isOrbitalBody: false, canBecomePlanet: true, parentPlanetId: null, source: 'asteroid_mass_threshold' };
context.World.moons.push(moon);
context.HC.Asteroids.resolveMoonDirectAbsorptions();
assert.equal(context.World.planets.length, 0, 'moon below threshold stays moon');
assert.equal(context.World.moons.length, 1);

context.World.meteors.push({ id: 'meteor:test', type: 'meteor', kind: 'meteor', colorName: 'RED', x: 0.5, y: 0, r: 1, mass: 10 });
context.HC.Asteroids.resolveMoonDirectAbsorptions();
context.World.moons = context.World.moons.filter((m) => !m._dead);
context.World.meteors = context.World.meteors.filter((m) => !m._dead);
assert.equal(context.World.moons.length, 0, 'moon removed after transform');
assert.equal(context.World.meteors.length, 0, 'absorbed meteor removed');
assert.equal(context.World.planets.length, 1, 'rocky planet created');
assert.ok(context.World.lastRockyPlanetCreatedEvent.createdPlanetRawRadiusFromMass > 0, 'rocky_planet_created stores raw radius evidence');
assert.equal(context.World.lastRockyPlanetCreatedEvent.createdPlanetFinalRadius, context.World.lastRockyPlanetCreatedEvent.createdPlanetRadius, 'rocky_planet_created stores final radius evidence');
assert.ok(context.World.lastRockyPlanetCreatedEvent.radiusContinuityRatio >= 0.75, 'rocky planet creation is visually continuous');
assert.notEqual(context.World.lastRockyPlanetCreatedEvent.clampReason, 'maxRockyPlanetRadius:72', 'rocky planet does not use legacy max clamp');
assert.equal(moon.lastImpact.kind, 'moonImpact');
assert.equal(moon.lastImpact.masses.absorbed, 3, 'HC.Impact caps moon absorbed mass to 30%');
assert.equal(context.World.harmonicDust.length, 0, 'moonImpactDust is descriptor evidence, not harmonicDust');
assert.equal(context.World.harmonicDustReservoir.fillPercent, 0, 'moonImpactDust does not fill harmonic reservoir');
assert.deepEqual(context.World.harmonicDustDeposits, { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0, GRAY: 0 });
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
assert.ok(snapshot.physics.lastRockyPlanetCreatedEvent, 'physics snapshot exposes rocky_planet_created event');
assert.ok(snapshot.physics.lastRockyPlanetRadiusRefreshEvent, 'physics snapshot exposes rocky planet radius refresh event');

context.World.planets = [];
context.World.moons = [{ id: 'moon:orbital', type: 'moon', kind: 'moon', x: 0, y: 0, vx: 0, vy: 0, r: 1, mass: 99, progressionMode: 'orbital', isOrbitalBody: true, canBecomePlanet: false, parentPlanetId: 'planet-test', parentKind: 'planet', orbitState: { parentId: 'planet-test' } }];
context.HC.Asteroids.resolveMoonDirectAbsorptions();
assert.equal(context.World.planets.length, 0, 'orbital moon cannot become rocky planet');
assert.equal(context.World.moons[0]._dead, undefined, 'orbital moon is not consumed by threshold guard');


// Scenario A — cooldown/same-frame block stores pending progression and retries after cooldown.
context.World.planets = [];
context.World.moons = [];
context.HC.events = [];
context.Events.emitted = [];
context.World.frame = 10;
const pendingMoon = { id: 'moon:pending', type: 'moon', kind: 'moon', x: 3, y: 0, r: 2, mass: 8, progressionMode: 'free', isOrbitalBody: false, canBecomePlanet: true, progressionLockFrame: 10, progressionCooldownUntilFrame: 12, sourcePath: 'asteroid_to_moon', allowedProgressionPath: true };
context.World.moons.push(pendingMoon);
let pendingPlanet = context.HC.Asteroids.checkMoonRockyPlanetThreshold(pendingMoon, 'vm_pending_same_frame');
assert.equal(pendingPlanet, null, 'same-frame/cooldown check does not create a planet immediately');
assert.equal(context.World.planets.length, 0, 'blocked pending moon leaves planets unchanged');
assert.notEqual(context.World.lastMoonToRockyPlanetThresholdEvent.failureReason, 'creation_failed', 'blocked progression is not a creation_failed event');
assert.equal(context.World.lastMoonToRockyPlanetThresholdEvent.creationFailed, undefined, 'blocked progression does not set creationFailed');
assert.ok(['progression_same_frame', 'progression_cooldown'].includes(context.World.lastMoonToRockyPlanetBlockedEvent.reason), 'blocked event stores concrete same-frame/cooldown reason');
assert.equal(pendingMoon.pendingMoonToRockyPlanetProgression, true, 'blocked over-threshold moon stores pending progression');
context.World.frame = 13;
context.HC.Asteroids.resolveMoonDirectAbsorptions();
assert.equal(context.World.planets.length, 1, 'pending over-threshold moon creates planet after cooldown');
assert.equal(context.World.planets[0].sourcePath, 'moon_to_rocky_planet');
assert.equal(context.World.planets[0].sourceMoonId, 'moon:pending');
assert.equal(context.World.lastMoonToRockyPlanetThresholdEvent.triggeredProgression, true, 'successful threshold event triggers only after creation');
assert.ok(context.World.lastMoonToRockyPlanetThresholdEvent.resultingObjectId, 'successful threshold event stores resultingObjectId');
assert.ok(context.HC.events.some((evt) => evt.event === 'rocky_planet_created'), 'rocky_planet_created exists after pending retry');

// Scenario B — legal free moon over threshold transforms immediately and remains canonical.
context.World.planets = [];
context.World.moons = [];
context.World.frame = 20;
const freeMoon = { id: 'moon:free', type: 'moon', kind: 'moon', x: -3, y: 0, r: 2, mass: 7, progressionMode: 'free', isOrbitalBody: false, canBecomePlanet: true, sourcePath: 'asteroid_to_moon', allowedProgressionPath: true };
context.World.moons.push(freeMoon);
const freePlanet = context.HC.Asteroids.checkMoonRockyPlanetThreshold(freeMoon, 'vm_free_threshold');
assert.ok(freePlanet, 'free over-threshold moon creates rocky planet immediately');
assert.equal(freePlanet.sourcePath, 'moon_to_rocky_planet');
assert.equal(freePlanet.allowedProgressionPath, true);
assert.equal(freePlanet.validProgressionOrigin, true);
assert.equal(freePlanet.sourceMoonId, 'moon:free');
assert.equal(context.World.lastMoonToRockyPlanetThresholdEvent.triggeredProgression, true);
assert.equal(context.World.lastMoonToRockyPlanetThresholdEvent.resultingObjectId, freePlanet.id);

// Scenario C/D — orbital over-threshold moon is blocked, not failed, and never reports triggered progression.
context.World.planets = [];
context.World.moons = [];
context.World.frame = 30;
const blockedOrbitalMoon = { id: 'moon:orbital-threshold', type: 'moon', kind: 'moon', x: 0, y: 0, r: 2, mass: 8, progressionMode: 'orbital', isOrbitalBody: true, canBecomePlanet: true, sourcePath: 'asteroid_to_moon', allowedProgressionPath: true };
context.World.moons.push(blockedOrbitalMoon);
const orbitalPlanet = context.HC.Asteroids.checkMoonRockyPlanetThreshold(blockedOrbitalMoon, 'vm_orbital_threshold');
assert.equal(orbitalPlanet, null, 'orbital moon does not create rocky planet');
assert.equal(context.World.planets.length, 0);
assert.equal(context.World.lastMoonToRockyPlanetBlockedEvent.reason, 'orbital_moon');
assert.equal(context.World.lastMoonToRockyPlanetThresholdEvent.triggeredProgression, false, 'blocked threshold does not report triggered progression');
assert.equal(context.World.lastMoonToRockyPlanetThresholdEvent.creationFailed, undefined, 'blocked orbital moon is not a creation failure');
assert.equal(context.World.lastMoonToRockyPlanetThresholdEvent.progressionBlocked, true);

context.World.impactFragments = [{ type: 'impactFragment', kind: 'impactFragment', createdAt: 0, ttlMs: 100, age: 0 }];
context.HC.Impact.updateFragments(context.World, 101, 0.101);
assert.equal(context.World.impactFragments.length, 0, 'expired impact fragments are cleaned up');


assert.throws(() => context.HC.Planets.createRockyPlanetFromMoon({ id: 'moon:block', type: 'moon', kind: 'moon', mass: 99, r: 2 }, 'vm_block', { sourcePath: 'asteroid_to_rocky_planet', sourceFunction: 'vm.direct' }), /LEGACY_ASTEROID_TO_PLANET_DISABLED/, 'direct asteroid -> rocky planet helper call hard-fails');
assert.ok(context.World.lastLegacyPlanetSpawnBlockedEvent, 'blocked legacy planet spawn is logged');

context.World.planets = [{ id: 'planet:legacy', type: 'planet', kind: 'planet', planetKind: 'rocky', isRocky: true, x: 0, y: 0, r: 4, mass: 9 }];
const invalidSnapshot = context.HC.WorldRenderSnapshot.build({ World: context.World, Camera: context.Camera, View: context.View, nowMs: 1032, dt: 0.016 });
assert.equal(invalidSnapshot.physics.planetMissingCreationEvidenceCount, 1, 'snapshot records missing rocky planet creation evidence');
assert.equal(context.World.planets[0].invalidPlanetOrigin, true, 'snapshot marks invalid direct rocky planet origin');
assert.ok(context.HC.events.some((evt) => evt.event === 'planet_missing_creation_evidence'), 'missing evidence is logged for export');

assert.equal(typeof context.HC.WorldRenderer?.getDiagnostics, 'function', 'Three renderer module loads with moon support');
console.log('Patch 3 VM assertions passed');
