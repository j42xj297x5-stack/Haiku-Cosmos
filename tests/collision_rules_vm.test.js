const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const requiredIds = ['meteor_meteor_different','meteor_asteroid','asteroid_asteroid','moon_meteor','moon_asteroid','planet_meteor','planet_asteroid','planet_moon','planet_planet'];
const json = JSON.parse(fs.readFileSync(path.join(root, 'public/settings/collision-rules.json'), 'utf8'));
assert.equal(json.version, 1);
assert.equal(json.profile, 'baseline_safe_v1');
for (const id of requiredIds) assert(json.rules.some((r) => r.id === id), `missing ${id}`);
function buildContext() {
  const context = { console, performance: { now: () => 1000 }, window: {} };
  context.window = context;
  context.HC = { logEvent() {} };
  context.World = { cosmicDust: [], spaceMechanics: {}, nowMs: 1000 };
  vm.createContext(context);
  for (const file of ['hc.space_bodies.js','hc.collision_rules.js','hc.impact.js','hc.cosmic_dust.js','hc.ui_debug.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  return context;
}
let c = buildContext();
let normalized = c.HC.CollisionRules.normalizeRules(json);
let mm = normalized.rules.find((r) => r.id === 'meteor_meteor_different');
let pp = normalized.rules.find((r) => r.id === 'planet_planet');
assert.equal(mm.valid, true);
assert.equal(mm.sumPct, 1);
assert.equal(pp.enabled, true);
assert.equal(pp.valid, true);
c.HC.CollisionRules.applyRulesToWorldMechanics(c.World, json);
normalized = c.HC.CollisionRules.applyRulesToWorldMechanics(c.World, { version: 1, profile: 'invalid_test', rules: [{ ...json.rules[0], dustPct: 0.9, absorbPct: 0.9 }] });
mm = normalized.rules.find((r) => r.id === 'meteor_meteor_different');
assert.equal(mm.replacedInvalidRule, true);
assert.equal(c.World.spaceMechanics.cosmicDustSplitMeteorMeteorDustPct, 0.3);
assert.match(c.World.collisionRulesDiagnostics.collisionRulesLastError, /not applied/);
assert.equal(c.World.collisionRulesDiagnostics.collisionRulesInvalidCount, 1);
c = buildContext();
c.HC.CollisionRules.applyRulesToWorldMechanics(c.World, json);
assert.equal(c.World.collisionRulesDiagnostics.activeCollisionRulesProfile, 'baseline_safe_v1');
const a = { id: 'heavy', type: 'meteor', kind: 'meteor', colorName: 'red', x: 0, y: 0, r: 1, mass: 1.0 };
const b = { id: 'light', type: 'meteor', kind: 'meteor', colorName: 'blue', x: 0, y: 0, r: 1, mass: 0.5 };
const split = c.HC.CosmicDust.applySplitPolicy(c.World, { kind: 'meteor_meteor', primary: a, secondary: b });
assert.equal(split.resultMass, 1.35);
assert.equal(split.cosmicDustMass, 0.15);
assert.equal(c.World.lastMassSplitEvent.sourceMassPolicy, 'lighter_body');
assert.equal(c.World.lastMassSplitEvent.rulePct.dustPct, 0.3);
assert.ok(Math.abs(c.World.lastMassSplitEvent.conservationDelta) < 1e-9);
const exported = c.HC.CollisionRules.exportRules(c.World);
const before = JSON.parse(exported).rules.find((r) => r.id === 'planet_asteroid').orbiterPct;
c.HC.CollisionRules.importRules(c.World, exported);
const after = c.World.collisionRules.rules.find((r) => r.id === 'planet_asteroid').orbiterPct;
assert.equal(after, before);
assert.equal(c.World.spaceMechanics.cosmicDustAffectsBodiesEnabled, false, 'collision rules do not enable cosmic dust physical effects');

// Collision Rules panel draft behavior: edit -> export uses draft state.
c = buildContext();
c.HC.CollisionRules.applyRulesToWorldMechanics(c.World, json);
c.HC.CollisionRules.setDraftRuleset(c.World.collisionRules);
c.HC.CollisionRules.setDraftRuleValue('planet_asteroid', 'orbiterPct', 0.22);
let panelExport = JSON.parse(c.HC.CollisionRules.exportRules(c.World));
assert.equal(panelExport.rules.find((r) => r.id === 'planet_asteroid').orbiterPct, 0.22);

// Collision Rules UI export handler reads current form controls, not stale World.collisionRules.
c = buildContext();
c.HC.CollisionRules.applyRulesToWorldMechanics(c.World, json);
c.HC.CollisionRules.setDraftRuleset(c.World.collisionRules);
const formElements = new Map();
const section = { open: false, dataset: { runtimeDebugSection: 'collision-rules' } };
const textarea = {
  hidden: true,
  style: { display: 'none' },
  value: '',
  closest(selector) {
    return selector === '[data-runtime-debug-section]' ? section : null;
  },
};
formElements.set('dbgCollisionRulesJson', textarea);
for (const rule of c.HC.CollisionRules.getDraftRuleset(c.World).rules) {
  const prefix = `collision-rule-${rule.id}`;
  formElements.set(`${prefix}-enabled`, { checked: rule.id === 'planet_asteroid' ? false : rule.enabled });
  formElements.set(`${prefix}-policy`, { value: rule.sourceMassPolicy });
  formElements.set(`${prefix}-dustPct`, { value: String(rule.id === 'planet_asteroid' ? 0.17 : rule.dustPct) });
  formElements.set(`${prefix}-absorbPct`, { value: String(rule.absorbPct) });
  formElements.set(`${prefix}-fragmentsPct`, { value: String(rule.fragmentsPct) });
  formElements.set(`${prefix}-orbiterPct`, { value: String(rule.orbiterPct) });
}
const fakeDocument = { getElementById(id) { return formElements.get(id) || null; } };
const exportedFromHandler = c.HC.DebugCollisionRules.exportPanel(c.HC.CollisionRules, c.World, fakeDocument);
assert.equal(textarea.value, exportedFromHandler);
assert.equal(textarea.hidden, false);
assert.equal(textarea.style.display, '');
assert.equal(section.open, true);
panelExport = JSON.parse(textarea.value);
assert.equal(panelExport.profile, 'baseline_safe_v1');
assert.equal(panelExport.rules.find((r) => r.id === 'planet_asteroid').dustPct, 0.17);
assert.equal(panelExport.rules.find((r) => r.id === 'planet_asteroid').enabled, false);
assert.equal(c.World.collisionRules.rules.find((r) => r.id === 'planet_asteroid').dustPct, 0.15);

// edit -> apply changes World.spaceMechanics.
c = buildContext();
c.HC.CollisionRules.applyRulesToWorldMechanics(c.World, json);
c.HC.CollisionRules.setDraftRuleset(c.World.collisionRules);
c.HC.CollisionRules.setDraftRuleValue('planet_asteroid', 'orbiterPct', 0.22);
c.HC.CollisionRules.applyRulesToWorldMechanics(c.World, c.HC.CollisionRules.getDraftRuleset(c.World));
assert.equal(c.World.spaceMechanics.cosmicDustSplitPlanetAsteroidOrbiterPct, 0.22);
assert.ok(c.World.collisionRulesDiagnostics.collisionRulesLastAppliedAt);
assert.equal(c.World.collisionRulesDiagnostics.activeCollisionRulesProfile, 'baseline_safe_v1');
assert.equal(c.World.collisionRulesDiagnostics.collisionRulesInvalidCount, 0);

// import JSON -> apply changes active rule only through the draft/form state.
const importedRules = JSON.parse(JSON.stringify(json));
importedRules.profile = 'imported_panel_test';
importedRules.rules.find((r) => r.id === 'moon_meteor').dustPct = 0.40;
importedRules.rules.find((r) => r.id === 'moon_meteor').absorbPct = 0.20;
c.HC.CollisionRules.importRules(c.World, JSON.stringify(importedRules));
assert.notEqual(c.World.spaceMechanics.cosmicDustSplitMoonMeteorDustPct, 0.40);
c.HC.CollisionRules.applyRulesToWorldMechanics(c.World, c.HC.CollisionRules.getDraftRuleset(c.World));
assert.equal(c.World.spaceMechanics.cosmicDustSplitMoonMeteorDustPct, 0.40);
assert.equal(c.World.collisionRulesDiagnostics.activeCollisionRulesProfile, 'imported_panel_test');

// invalid sum > 1 is rejected and stores an error.
const beforeInvalid = c.World.spaceMechanics.cosmicDustSplitMeteorAsteroidDustPct;
c.HC.CollisionRules.setDraftRuleset({ version: 1, profile: 'bad_panel_test', rules: [{ ...json.rules.find((r) => r.id === 'meteor_asteroid'), dustPct: 0.8, absorbPct: 0.8 }] });
c.HC.CollisionRules.applyRulesToWorldMechanics(c.World, c.HC.CollisionRules.getDraftRuleset(c.World));
assert.equal(c.World.spaceMechanics.cosmicDustSplitMeteorAsteroidDustPct, beforeInvalid);
assert.equal(c.World.collisionRulesDiagnostics.collisionRulesStatus, 'invalid_rejected');
assert.match(c.World.collisionRulesDiagnostics.collisionRulesLastError, /not applied/);
assert.equal(c.World.collisionRulesDiagnostics.collisionRulesInvalidCount, 1);

// reset defaults restores baseline_safe_v1 in panel draft.
c.HC.CollisionRules.resetDraftToDefaults();
assert.equal(c.HC.CollisionRules.getDraftRuleset(c.World).profile, 'baseline_safe_v1');

const sources = ['hc.cosmic_dust.js', 'hc.collision_rules.js'].map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
assert.doesNotMatch(sources, /gas planet condensation/i);
assert.equal(fs.readFileSync(path.join(root, 'hc.comets.js'), 'utf8').length > 0, true, 'comet runtime exists but collision rules test does not load or change it');
console.log('collision rules vm ok');
