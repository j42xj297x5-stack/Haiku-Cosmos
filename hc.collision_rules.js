// HC collision rules runtime settings: configurable split percentages without new mechanics.
(function (root) {
  "use strict";
  root.HC = root.HC || {};

  const SETTINGS_PATH = "settings/collision-rules.json";
  const PCTS = ["dustPct", "absorbPct", "fragmentsPct", "orbiterPct"];
  const MECHANIC_KEYS = Object.freeze({
    meteor_meteor_different: ["cosmicDustSplitMeteorMeteorDustPct", "cosmicDustSplitMeteorMeteorAbsorbPct", null, null],
    meteor_asteroid: ["cosmicDustSplitMeteorAsteroidDustPct", "cosmicDustSplitMeteorAsteroidAbsorbPct", null, null],
    asteroid_asteroid: ["cosmicDustSplitAsteroidAsteroidDustPct", "cosmicDustSplitAsteroidAsteroidAbsorbPct", null, null],
    moon_meteor: ["cosmicDustSplitMoonMeteorDustPct", "cosmicDustSplitMoonMeteorAbsorbPct", null, null],
    moon_asteroid: ["cosmicDustSplitMoonAsteroidDustPct", "cosmicDustSplitMoonAsteroidAbsorbPct", "cosmicDustSplitMoonAsteroidFragmentsPct", null],
    planet_meteor: ["cosmicDustSplitPlanetMeteorDustPct", "cosmicDustSplitPlanetMeteorAbsorbPct", "cosmicDustSplitPlanetMeteorFragmentsPct", null],
    planet_asteroid: ["cosmicDustSplitPlanetAsteroidDustPct", null, "cosmicDustSplitPlanetAsteroidFragmentsPct", "cosmicDustSplitPlanetAsteroidOrbiterPct"],
    planet_moon: ["cosmicDustSplitPlanetMoonDustPct", null, "cosmicDustSplitPlanetMoonFragmentsPct", "cosmicDustSplitPlanetMoonOrbiterPct"],
    planet_planet: ["cosmicDustSplitPlanetPlanetDustPct", null, "cosmicDustSplitPlanetPlanetFragmentsPct", null],
  });
  const DEFAULT_RULES = Object.freeze({ version: 1, rules: Object.freeze([
    { id: "meteor_meteor_different", enabled: true, sourceMassPolicy: "lighter_body", dustPct: 0.80, absorbPct: 0.20, fragmentsPct: 0, orbiterPct: 0, createsBaseProgressionObject: true, notes: "Different-color meteors still create asteroid; split lighter meteor only." },
    { id: "meteor_asteroid", enabled: true, sourceMassPolicy: "incoming_body", dustPct: 0.80, absorbPct: 0.20, fragmentsPct: 0, orbiterPct: 0, createsBaseProgressionObject: false, notes: "Incoming meteor split." },
    { id: "asteroid_asteroid", enabled: true, sourceMassPolicy: "lighter_body", dustPct: 0.50, absorbPct: 0.50, fragmentsPct: 0, orbiterPct: 0, createsBaseProgressionObject: false, notes: "Heavier asteroid survives." },
    { id: "moon_meteor", enabled: true, sourceMassPolicy: "incoming_body", dustPct: 0.30, absorbPct: 0.70, fragmentsPct: 0, orbiterPct: 0, createsBaseProgressionObject: false, notes: "Moon absorbs part of meteor." },
    { id: "moon_asteroid", enabled: true, sourceMassPolicy: "incoming_body", dustPct: 0.30, absorbPct: 0.30, fragmentsPct: 0.40, orbiterPct: 0, createsBaseProgressionObject: false, notes: "Moon impact with surface ejecta." },
    { id: "planet_meteor", enabled: true, sourceMassPolicy: "incoming_body", dustPct: 0.25, absorbPct: 0.50, fragmentsPct: 0.25, orbiterPct: 0, createsBaseProgressionObject: false, notes: "Planet absorbs part of meteor." },
    { id: "planet_asteroid", enabled: true, sourceMassPolicy: "incoming_body", dustPct: 0.35, absorbPct: 0, fragmentsPct: 0.35, orbiterPct: 0.30, createsBaseProgressionObject: false, notes: "Orbiter is descriptor-only until orbital runtime patch." },
    { id: "planet_moon", enabled: true, sourceMassPolicy: "incoming_body", dustPct: 0.35, absorbPct: 0, fragmentsPct: 0.35, orbiterPct: 0.30, createsBaseProgressionObject: false, notes: "Orbiter candidate descriptor-only." },
    { id: "planet_planet", enabled: false, sourceMassPolicy: "descriptor_only", dustPct: 0.50, absorbPct: 0, fragmentsPct: 0.50, orbiterPct: 0, createsBaseProgressionObject: false, notes: "Foundation only; disabled until explicit planet+planet runtime decision." },
  ]) });
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function clamp01(v) { const n = Number(v); return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0; }
  function validateRule(rule) {
    const errors = [];
    const out = Object.assign({}, rule || {});
    if (!out.id) errors.push("missing id");
    if (typeof out.enabled !== "boolean") errors.push("enabled must be boolean");
    if (!out.sourceMassPolicy) errors.push("missing sourceMassPolicy");
    for (const key of PCTS) { if (!Object.prototype.hasOwnProperty.call(out, key)) errors.push(`missing ${key}`); out[key] = clamp01(out[key]); }
    const sum = PCTS.reduce((s, k) => s + out[k], 0);
    if (sum > 1 + 1e-9) errors.push(`pct sum exceeds 1 (${sum.toFixed(4)})`);
    out.sumPct = sum; out.valid = errors.length === 0; out.errors = errors;
    return out;
  }
  function normalizeRules(raw, previous) {
    const source = raw && typeof raw === "object" ? raw : DEFAULT_RULES;
    const defaults = new Map(DEFAULT_RULES.rules.map((r) => [r.id, r]));
    const prev = new Map(((previous && previous.rules) || []).filter((r) => r?.valid).map((r) => [r.id, r]));
    const incoming = new Map(Array.isArray(source.rules) ? source.rules.map((r) => [r && r.id, r]) : []);
    const rules = [];
    let invalidCount = 0;
    for (const id of defaults.keys()) {
      const candidate = incoming.get(id) || defaults.get(id);
      const validated = validateRule(Object.assign({}, defaults.get(id), candidate));
      if (!validated.valid) {
        invalidCount += 1;
        const fallback = clone(prev.get(id) || defaults.get(id));
        const marked = validateRule(fallback);
        marked.replacedInvalidRule = true; marked.invalidCandidate = validated;
        rules.push(marked);
      } else rules.push(validated);
    }
    return { version: Number(source.version) || 1, rules, validCount: rules.length - invalidCount, invalidCount };
  }
  function diagnosticsFor(World) { if (!World) return null; World.collisionRulesDiagnostics = World.collisionRulesDiagnostics || {}; return World.collisionRulesDiagnostics; }
  function applyRulesToWorldMechanics(World, ruleset) {
    if (!World) return null; World.spaceMechanics = World.spaceMechanics || {};
    const normalized = normalizeRules(ruleset || DEFAULT_RULES, World.collisionRules);
    World.collisionRules = normalized;
    for (const rule of normalized.rules) if (rule.enabled && rule.valid !== false) {
      const keys = MECHANIC_KEYS[rule.id] || [];
      [rule.dustPct, rule.absorbPct, rule.fragmentsPct, rule.orbiterPct].forEach((value, i) => { if (keys[i]) World.spaceMechanics[keys[i]] = value; });
    }
    const d = diagnosticsFor(World); if (d) Object.assign(d, { collisionRulesStatus: normalized.invalidCount ? "loaded_with_invalid_fallback" : "loaded", collisionRulesVersion: normalized.version, collisionRulesValidCount: normalized.validCount, collisionRulesInvalidCount: normalized.invalidCount, collisionRulesLastAppliedAt: Date.now(), collisionRulesLastError: normalized.invalidCount ? "one or more rules invalid; fallback used" : null });
    return normalized;
  }
  function getRule(id, World) { const rules = ((World || root.World)?.collisionRules?.rules || root.HC.CollisionRules?._active?.rules || []); return rules.find((r) => r.id === id && r.enabled && r.valid !== false) || validateRule((DEFAULT_RULES.rules.find((r) => r.id === id) || {})); }
  function exportRules(World) { return JSON.stringify((World?.collisionRules || root.World?.collisionRules || normalizeRules(DEFAULT_RULES)), null, 2); }
  function importRules(World, rawJson) { const parsed = typeof rawJson === "string" ? JSON.parse(rawJson) : rawJson; return applyRulesToWorldMechanics(World || root.World, parsed); }
  async function loadDefaultRules(World) {
    const target = World || root.World; let raw = null; let source = "fallback_defaults"; let err = null;
    try {
      const url = (root.HC.publicPath || root.HC.publicAssetPath)(SETTINGS_PATH);
      const res = await root.fetch(url, { cache: "no-cache" }); if (!res.ok) throw new Error(`HTTP ${res.status}`);
      raw = JSON.parse(await res.text()); source = SETTINGS_PATH;
    } catch (error) { err = error; raw = DEFAULT_RULES; }
    const normalized = applyRulesToWorldMechanics(target, raw); root.HC.CollisionRules._active = normalized;
    const d = diagnosticsFor(target); if (d) Object.assign(d, { collisionRulesSource: source, collisionRulesError: err ? String(err.message || err) : null, collisionRulesLoadedAt: Date.now() });
    return normalized;
  }
  function activeCollisionRulesSummary(World) { return ((World || root.World)?.collisionRules?.rules || []).map((r) => ({ id: r.id, enabled: r.enabled, sourceMassPolicy: r.sourceMassPolicy, dustPct: r.dustPct, absorbPct: r.absorbPct, fragmentsPct: r.fragmentsPct, orbiterPct: r.orbiterPct, sumPct: r.sumPct, valid: r.valid !== false })); }
  root.HC.CollisionRules = { SETTINGS_PATH, DEFAULT_RULES, MECHANIC_KEYS, loadDefaultRules, normalizeRules, validateRule, getRule, applyRulesToWorldMechanics, exportRules, importRules, activeCollisionRulesSummary, _active: normalizeRules(DEFAULT_RULES) };
})(window);
