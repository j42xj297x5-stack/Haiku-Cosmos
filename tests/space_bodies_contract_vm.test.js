const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function buildContext() {
  const context = { console, window: {} };
  context.window = context;
  context.HC = {};
  vm.createContext(context);
  vm.runInContext(
    fs.readFileSync(path.join(path.resolve(__dirname, '..'), 'hc.space_bodies.js'), 'utf8'),
    context,
    { filename: 'hc.space_bodies.js' }
  );
  return context;
}

const context = buildContext();
const SpaceBodies = context.HC.SpaceBodies;

assert.equal(SpaceBodies.classifyBodyField('mass').status, 'canonical');
assert.equal(SpaceBodies.classifyBodyField('modelId').status, 'renderOnly');
assert.equal(SpaceBodies.classifyBodyField('glbId').status, 'renderOnly');
assert.equal(SpaceBodies.classifyBodyField('orbitPx').status, 'compatibility');
assert.equal(SpaceBodies.classifyBodyField('capR').status, 'deprecated');
assert.equal(SpaceBodies.classifyBodyField('planetCaptureMode').status, 'deprecated');
assert.equal(SpaceBodies.classifyBodyField('legacy_capture').status, 'deprecated');
assert.equal(SpaceBodies.classifyBodyField('someUnknownField').status, 'unknown');

const body = {
  id: 'p1',
  kind: 'planet',
  x: 10,
  y: 20,
  mass: 100,
  visualKind: 'rocky',
  modelId: 'planet_rocky_a',
  orbitPx: 120,
  gravityR: 150,
  capR: 90,
  someNewField: true,
};
const before = JSON.stringify(body);
const grouped = SpaceBodies.classifyBodyFields(body);
assert.deepEqual(Array.from(grouped.canonical), ['id', 'kind', 'x', 'y', 'mass']);
assert.deepEqual(Array.from(grouped.renderOnly), ['visualKind', 'modelId']);
assert.deepEqual(Array.from(grouped.compatibility), ['orbitPx', 'gravityR']);
assert.deepEqual(Array.from(grouped.deprecated), ['capR']);
assert.deepEqual(Array.from(grouped.unknown), ['someNewField']);
assert.equal(JSON.stringify(body), before, 'classifyBodyFields does not mutate the body');

const fields = SpaceBodies.getBodyContractFields();
assert.ok(fields.canonical.includes('mass'));
fields.canonical.push('mutatedCopyOnly');
assert.equal(SpaceBodies.classifyBodyField('mutatedCopyOnly').status, 'unknown');

assert.equal(typeof context.document, 'undefined', 'VM has no DOM document');
assert.equal(typeof context.THREE, 'undefined', 'VM has no Three.js');
assert.equal(typeof context.CanvasRenderingContext2D, 'undefined', 'VM has no Canvas2D');
assert.equal(SpaceBodies.classifyBodyField('mass').status, 'canonical');

console.log('space_bodies_contract_vm.test.js: OK');
