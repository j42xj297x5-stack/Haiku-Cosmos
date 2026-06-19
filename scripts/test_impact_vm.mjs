import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context = {
  window: {},
  Math,
  console,
};
context.window = context;
context.World = {
  impactFragments: [],
  spaceMechanics: {
    planetImpactAbsorbPercent: 0.6,
    planetImpactExplosionPercent: 0.2,
    planetImpactEjectaPercent: 0.2,
    planetImpactOrbiterPercent: 0.1,
    planetImpactFirstOrbiterChance: 1,
    planetImpactNextOrbiterChanceWhenExistingOrbiterMax: 0.25,
    planetImpactAbsorbMassMaxWhenOrbiterExists: 0.30,
    moonImpactAbsorbMassMax: 0.30,
    moonImpactAbsorbPercent: 0.8,
    moonImpactExplosionPercent: 0.2,
    moonImpactEjectaPercent: 0.2,
    moonImpactDustPercent: 0.2,
    impactEjectaMinMass: 1,
    impactEjectaMaxPieces: 3,
  },
};
context.HC = {
  SpaceBodies: { getBodyMass: (body) => Number(body?.mass) || 1 },
  logEvent: (...args) => { context.lastLog = args; },
};

vm.createContext(context);
vm.runInContext(fs.readFileSync('hc.impact.js', 'utf8'), context, { filename: 'hc.impact.js' });

const { Impact } = context.HC;
assert.equal(Impact.clampPercent(-1), 0);
assert.equal(Impact.clampPercent(2), 1);
assert.equal(Impact.rollChance(0.5, () => 0.49), true);
assert.equal(Impact.rollChance(0.5, () => 0.5), false);
assert.deepEqual(JSON.parse(JSON.stringify(Impact.splitMass(10, { a: 0.2, b: 0.3 }))), { a: 2, b: 3, remainder: 5 });

const planetImpact = Impact.resolvePlanetImpact({
  planet: { orbiters: [{}] },
  incoming: { type: 'asteroid', mass: 10 },
  mechanics: context.World.spaceMechanics,
  rng: () => 0.1,
});
assert.equal(planetImpact.kind, 'planetImpact');
assert.equal(planetImpact.createsDust, false);
assert.equal(planetImpact.createsOrbiter, true);
assert.equal(planetImpact.orbiterChance, 0.25);
assert.equal(planetImpact.masses.absorbed, 3);

const moonMeteorImpact = Impact.resolveMoonImpact({
  moon: { id: 'moon:test' },
  incoming: { type: 'meteor', colorName: 'RED', mass: 10 },
  mechanics: context.World.spaceMechanics,
});
assert.equal(moonMeteorImpact.kind, 'moonImpact');
assert.equal(moonMeteorImpact.createsDust, true);
assert.equal(moonMeteorImpact.createsOrbiter, false);
assert.equal(moonMeteorImpact.dust.kind, 'moonImpactDust');
assert.equal(moonMeteorImpact.dust.color, 'RED');
assert.equal(moonMeteorImpact.masses.absorbed, 3);

const moonAsteroidImpact = Impact.resolveMoonImpact({ incoming: { type: 'asteroid', mass: 5 }, mechanics: context.World.spaceMechanics });
assert.equal(moonAsteroidImpact.dust.color, 'moonImpactGray');

const pieces = Impact.spawnEjecta(context.World, moonMeteorImpact, { x: 7, y: 9 });
assert.equal(pieces.length, 3);
assert.equal(context.World.impactFragments.length, 3);
assert.equal(pieces[0].visualReady, false);
assert.equal(pieces[0].x, 7);

Impact.logImpactEvidence(context.World, moonMeteorImpact, 'vm_test');
assert.equal(context.lastLog[1], 'WORLD_IMPACT_RESOLVED');
assert.equal(context.lastLog[2].impactKind, 'moonImpact');
assert.equal(context.lastLog[3].snapshot, true);

console.log('impact vm tests passed');
