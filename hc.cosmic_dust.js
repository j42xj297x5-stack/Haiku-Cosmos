// HC cosmic dust subsystem: non-collectible collision/impact residue foundation.
(function () {
  window.HC = window.HC || {};

  let nextCosmicDustId = 1;
  const DEFAULTS = Object.freeze({
    cosmicDustEnabled: true,
    cosmicDustVisualEnabled: true,
    cosmicDustMergeEnabled: true,
    cosmicDustMergeDistanceMul: 1.25,
    cosmicDustMaxClouds: 80,
    cosmicDustDensityBase: 1.0,
    cosmicDustRadiusMassMul: 1.0,
    cosmicDustMinMass: 0.1,
    cosmicDustMinVisualRadius: 6,
    cosmicDustMaxVisualRadius: 120,
    cosmicDustAffectsBodiesEnabled: false,
    cosmicDustDragStrength: 0.35,
    cosmicDustDensityDragMul: 1.0,
    cosmicDustOverlapDragMul: 1.0,
    cosmicDustMassResistanceMul: 1.0,
    cosmicDustStopEnabled: false,
    cosmicDustStopSpeedThreshold: 0.025,
    cosmicDustLightBodyMassThreshold: 8,
    cosmicDustStopOverlapThreshold: 0.25,
    cosmicDustAffectsMeteors: true,
    cosmicDustAffectsAsteroids: true,
    cosmicDustAffectsMoons: true,
    cosmicDustAffectsImpactFragments: true,
    cosmicDustAffectsPlanets: false,
    cosmicDustCondensationEnabled: false,
    cosmicDustCloudToGasPlanetMassThreshold: 999999,
    cosmicDustSplitMeteorMeteorDustPct: 0.80,
    cosmicDustSplitMeteorMeteorAbsorbPct: 0.20,
    cosmicDustSplitMeteorAsteroidDustPct: 0.80,
    cosmicDustSplitMeteorAsteroidAbsorbPct: 0.20,
    cosmicDustSplitAsteroidAsteroidDustPct: 0.50,
    cosmicDustSplitAsteroidAsteroidAbsorbPct: 0.50,
    cosmicDustSplitMoonMeteorDustPct: 0.30,
    cosmicDustSplitMoonMeteorAbsorbPct: 0.70,
    cosmicDustSplitMoonAsteroidDustPct: 0.30,
    cosmicDustSplitMoonAsteroidAbsorbPct: 0.30,
    cosmicDustSplitMoonAsteroidFragmentsPct: 0.40,
    cosmicDustSplitPlanetMeteorDustPct: 0.25,
    cosmicDustSplitPlanetMeteorAbsorbPct: 0.50,
    cosmicDustSplitPlanetMeteorFragmentsPct: 0.25,
    cosmicDustSplitPlanetAsteroidDustPct: 0.35,
    cosmicDustSplitPlanetAsteroidFragmentsPct: 0.35,
    cosmicDustSplitPlanetAsteroidOrbiterPct: 0.30,
    cosmicDustSplitPlanetMoonDustPct: 0.35,
    cosmicDustSplitPlanetMoonFragmentsPct: 0.35,
    cosmicDustSplitPlanetMoonOrbiterPct: 0.30,
    cosmicDustSplitPlanetPlanetDustPct: 0.50,
    cosmicDustSplitPlanetPlanetFragmentsPct: 0.50,
  });

  function finite(v, f) { const n = Number(v); return Number.isFinite(n) ? n : f; }
  function pct(world, key) { return Math.max(0, Math.min(1, finite(world?.spaceMechanics?.[key], DEFAULTS[key] || 0))); }
  const RULE_BY_KIND = Object.freeze({ meteor_meteor: "meteor_meteor_different", meteor_asteroid: "meteor_asteroid", asteroid_asteroid: "asteroid_asteroid", moon_meteor: "moon_meteor", moon_asteroid: "moon_asteroid", planet_meteor: "planet_meteor", planet_asteroid: "planet_asteroid", planet_moon: "planet_moon", planet_planet: "planet_planet" });
  function ruleFor(world, kind) { const id = RULE_BY_KIND[kind] || kind; return window.HC?.CollisionRules?.getRule ? window.HC.CollisionRules.getRule(id, world) : null; }
  function rulePct(world, rule, pctName, fallbackKey) { return rule && rule.enabled !== false && rule.valid !== false ? Math.max(0, Math.min(1, finite(rule[pctName], pct(world, fallbackKey)))) : pct(world, fallbackKey); }
  function attachRuleEvidence(evidence, world, rule) { if (!rule) return evidence; evidence.ruleId = rule.id || evidence.ruleId; evidence.ruleSource = world?.collisionRulesDiagnostics?.collisionRulesSource || "runtime_table"; evidence.sourceMassPolicy = rule.sourceMassPolicy || null; evidence.ruleVersion = world?.collisionRules?.version || window.HC?.CollisionRules?._active?.version || 1; evidence.rulePct = { dustPct: rule.dustPct, absorbPct: rule.absorbPct, fragmentsPct: rule.fragmentsPct, orbiterPct: rule.orbiterPct }; return evidence; }
  function bodyMass(body) { return window.HC?.Impact?.bodyMass ? window.HC.Impact.bodyMass(body) : Math.max(0, finite(body?.mass, finite(body?.r, 1) * finite(body?.r, 1))); }
  function bodyId(body) { return body?.id || body?._id || null; }
  function nowMs(world, explicit) { return finite(explicit, finite(world?.nowMs, (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now())); }
  function radiusForMass(world, mass, density) {
    const sm = ensureWorldState(world).spaceMechanics;
    const raw = Math.sqrt(Math.max(0, mass) / Math.max(0.001, density)) * finite(sm.cosmicDustRadiusMassMul, 1);
    return Math.max(finite(sm.cosmicDustMinVisualRadius, 6), Math.min(finite(sm.cosmicDustMaxVisualRadius, 120), raw));
  }
  function ensureWorldState(World) {
    if (!World) return null;
    if (!Array.isArray(World.cosmicDust)) World.cosmicDust = [];
    World.spaceMechanics = Object.assign({}, DEFAULTS, World.spaceMechanics || {});
    if (!World.lastCosmicDustEvent) World.lastCosmicDustEvent = null;
    if (!World.lastCosmicDustInfluenceEvent) World.lastCosmicDustInfluenceEvent = null;
    if (!Number.isFinite(Number(World.cosmicDustAffectedBodiesCount))) World.cosmicDustAffectedBodiesCount = 0;
    if (!Number.isFinite(Number(World.cosmicDustStoppedBodiesCount))) World.cosmicDustStoppedBodiesCount = 0;
    return World;
  }
  function centerOf(spec) {
    const bodies = [spec?.primary, spec?.secondary, spec?.a, spec?.b, spec?.target, spec?.incoming].filter(Boolean);
    if (!bodies.length) return { x: finite(spec?.x, 0), y: finite(spec?.y, 0), z: finite(spec?.z, 0) };
    return { x: bodies.reduce((s, b) => s + finite(b.x, 0), 0) / bodies.length, y: bodies.reduce((s, b) => s + finite(b.y, 0), 0) / bodies.length, z: bodies.reduce((s, b) => s + finite(b.z, 0), 0) / bodies.length };
  }
  function createCloud(World, options) {
    const world = ensureWorldState(World); if (!world || world.spaceMechanics.cosmicDustEnabled === false) return null;
    const opts = options || {}; const createdAt = nowMs(world, opts.createdAt);
    const mass = Math.max(finite(world.spaceMechanics.cosmicDustMinMass, 0.1), finite(opts.mass, 0));
    const density = Math.max(0.001, finite(opts.density, finite(world.spaceMechanics.cosmicDustDensityBase, 1)));
    const r = Math.max(finite(world.spaceMechanics.cosmicDustMinVisualRadius, 6), Math.min(finite(world.spaceMechanics.cosmicDustMaxVisualRadius, 120), finite(opts.r, radiusForMass(world, mass, density))));
    const cloud = { id: opts.id || `cosmic_dust:${nextCosmicDustId++}`, type: "cosmic_dust", dustKind: "cosmic", collectible: false,
      x: finite(opts.x, 0), y: finite(opts.y, 0), z: finite(opts.z, 0), r, mass, density, state: opts.state || "cold",
      source: opts.source || "collision", sourceBodyIds: Array.isArray(opts.sourceBodyIds) ? opts.sourceBodyIds.filter(Boolean) : [],
      createdAt, updatedAt: createdAt, ageMs: 0, visualReady: true, affectsBodies: false };
    world.cosmicDust.push(cloud);
    world.lastCosmicDustEvent = { type: "cosmic_dust_created", id: cloud.id, source: cloud.source, mass: cloud.mass, sourceBodyIds: cloud.sourceBodyIds.slice(), createdAt };
    window.HC?.logEvent?.("world", "COSMIC_DUST_CREATED", world.lastCosmicDustEvent, { source: "HC.CosmicDust", snapshot: true });
    return cloud;
  }
  function createFromCollision(World, collisionSpec) {
    const c = centerOf(collisionSpec); const bodies = [collisionSpec?.primary, collisionSpec?.secondary, collisionSpec?.a, collisionSpec?.b, collisionSpec?.target, collisionSpec?.incoming].filter(Boolean);
    return createCloud(World, Object.assign({}, collisionSpec, { x: finite(collisionSpec?.x, c.x), y: finite(collisionSpec?.y, c.y), z: finite(collisionSpec?.z, c.z), sourceBodyIds: collisionSpec?.sourceBodyIds || bodies.map(bodyId).filter(Boolean) }));
  }
  function refreshRadius(body, kind, sourceFunction) { if (window.HC?.SpaceBodies?.refreshBodyRadiusFromMass && body) window.HC.SpaceBodies.refreshBodyRadiusFromMass(body, { kind, sourceFunction }); return body; }
  function addMass(body, amount, kind, sourceFunction) { if (body && amount > 0) { body.mass = bodyMass(body) + amount; refreshRadius(body, kind, sourceFunction); } }
  function recordMassSplit(world, evidence, inputMass, outputOverride) {
    const output = Number.isFinite(Number(outputOverride)) ? Number(outputOverride) : ((evidence.cosmicDustMass || 0) + (evidence.absorbedMass || 0) + (evidence.fragmentMass || 0) + (evidence.orbiterCandidate?.mass || 0));
    const input = Math.max(0, inputMass || 0);
    const delta = output - input;
    world.lastMassSplitEvent = Object.assign({
      type: "mass_split", ruleId: evidence.ruleId || evidence.kind,
      inputMass: input, outputMass: output, delta,
      conservationInputMass: input, conservationOutputMass: output, conservationDelta: delta,
      at: nowMs(world)
    }, evidence);
    if (Math.abs(delta) > 0.001) {
      world.massSplitConservationWarnings = Array.isArray(world.massSplitConservationWarnings) ? world.massSplitConservationWarnings : [];
      world.massSplitConservationWarnings.push({ ruleId: world.lastMassSplitEvent.ruleId, inputMass: input, outputMass: output, conservationDelta: delta, at: nowMs(world) });
      if (world.massSplitConservationWarnings.length > 8) world.massSplitConservationWarnings.shift();
      world.lastMassSplitConservationWarning = world.massSplitConservationWarnings[world.massSplitConservationWarnings.length - 1];
    }
  }
  function resizeAsteroid(World, a) { refreshRadius(a, "asteroid", "HC.CosmicDust.applySplitPolicy"); }
  function resizeMoon(World, m) { refreshRadius(m, "moon", "HC.CosmicDust.applySplitPolicy"); }
  function spawnFragments(World, mass, origin, kind) { const result = { kind: kind || "cosmicDustImpact", masses: { ejecta: Math.max(0, mass) } }; return window.HC?.Impact?.spawnEjecta ? window.HC.Impact.spawnEjecta(World, result, origin) : []; }
  function sourceEvidence(path, rule, fn, bodies, before, after) { return { sourcePath: path, sourceRuleId: rule?.id || path, sourceFunction: fn, sourceBodyIds: bodies.map(bodyId).filter(Boolean), sourceMassBefore: before, sourceMassAfter: after }; }
  function descriptor(kind, mass, target, incoming, rule, before, after) { return Object.assign({ kind, descriptorOnly: true, mass: Math.max(0, mass), targetId: bodyId(target), sourceBodyId: bodyId(incoming) }, sourceEvidence(kind, rule, "HC.CosmicDust.applySplitPolicy", [target, incoming], before, after)); }
  function applySplitPolicy(World, spec) {
    const world = ensureWorldState(World); if (!world) return null; const s = spec || {}; const kind = s.kind || s.collisionKind;
    const a = s.primary || s.a || s.target; const b = s.secondary || s.b || s.incoming; const source = kind || "collision";
    const rule = ruleFor(world, kind);
    const evidence = attachRuleEvidence({ kind, source, cosmicDustMass: 0, absorbedMass: 0, fragmentMass: 0, orbiterCandidate: null, cloud: null, descriptorOnly: false }, world, rule);
    function dust(m, primary, secondary) { evidence.cosmicDustMass = Math.max(0, m); evidence.cloud = createFromCollision(world, { primary, secondary, source, mass: evidence.cosmicDustMass }); return evidence.cloud; }
    if (kind === "meteor_meteor") {
      if (a?.colorName === b?.colorName) return null;
      const massA = bodyMass(a); const massB = bodyMass(b);
      const heavier = massA >= massB ? a : b; const lighter = heavier === a ? b : a;
      const heavierMass = bodyMass(heavier); const sourceMass = bodyMass(lighter);
      evidence.ruleId = "meteor_meteor_different";
      evidence.heavierBodyId = bodyId(heavier); evidence.lighterBodyId = bodyId(lighter);
      evidence.heavierMass = heavierMass; evidence.sourceMass = sourceMass;
      evidence.cosmicDustMass = evidence.dustMass = sourceMass * rulePct(world, rule, "dustPct", "cosmicDustSplitMeteorMeteorDustPct");
      evidence.absorbedMass = evidence.absorbMass = sourceMass * rulePct(world, rule, "absorbPct", "cosmicDustSplitMeteorMeteorAbsorbPct");
      evidence.fragmentsMass = 0; evidence.orbiterMass = 0;
      evidence.resultMass = heavierMass + evidence.absorbedMass;
      evidence.cloud = createFromCollision(world, { primary: heavier, secondary: lighter, source, mass: evidence.cosmicDustMass });
    }
    else if (kind === "meteor_asteroid") { const meteor = s.meteor || (a?.type === "meteor" ? a : b); const asteroid = s.asteroid || (a?.type === "asteroid" ? a : b); const m = bodyMass(meteor); dust(m * rulePct(world, rule, "dustPct", "cosmicDustSplitMeteorAsteroidDustPct"), asteroid, meteor); evidence.absorbedMass = m * rulePct(world, rule, "absorbPct", "cosmicDustSplitMeteorAsteroidAbsorbPct"); addMass(asteroid, evidence.absorbedMass, "asteroid", "HC.CosmicDust.applySplitPolicy:meteor_asteroid"); resizeAsteroid(world, asteroid); if (meteor) meteor._dead = true; }
    else if (kind === "asteroid_asteroid") { const primary = s.primary || (bodyMass(a) >= bodyMass(b) ? a : b); const secondary = s.secondary || (primary === a ? b : a); const m = bodyMass(secondary); dust(m * rulePct(world, rule, "dustPct", "cosmicDustSplitAsteroidAsteroidDustPct"), primary, secondary); evidence.absorbedMass = m * rulePct(world, rule, "absorbPct", "cosmicDustSplitAsteroidAsteroidAbsorbPct"); addMass(primary, evidence.absorbedMass, "asteroid", "HC.CosmicDust.applySplitPolicy:asteroid_asteroid"); resizeAsteroid(world, primary); if (secondary) secondary._dead = true; }
    else if (kind === "moon_meteor") { const moon = s.moon || a; const meteor = s.meteor || b; const m = bodyMass(meteor); dust(m * rulePct(world, rule, "dustPct", "cosmicDustSplitMoonMeteorDustPct"), moon, meteor); evidence.absorbedMass = m * rulePct(world, rule, "absorbPct", "cosmicDustSplitMoonMeteorAbsorbPct"); addMass(moon, evidence.absorbedMass, "moon", "HC.CosmicDust.applySplitPolicy:moon_meteor"); resizeMoon(world, moon); if (meteor) meteor._dead = true; }
    else if (kind === "moon_asteroid") { const moon = s.moon || a; const asteroid = s.asteroid || b; const m = bodyMass(asteroid); dust(m * rulePct(world, rule, "dustPct", "cosmicDustSplitMoonAsteroidDustPct"), moon, asteroid); evidence.absorbedMass = m * rulePct(world, rule, "absorbPct", "cosmicDustSplitMoonAsteroidAbsorbPct"); evidence.fragmentMass = m * rulePct(world, rule, "fragmentsPct", "cosmicDustSplitMoonAsteroidFragmentsPct"); addMass(moon, evidence.absorbedMass, "moon", "HC.CosmicDust.applySplitPolicy:moon_asteroid"); resizeMoon(world, moon); evidence.fragments = spawnFragments(world, evidence.fragmentMass, moon, "moonAsteroidImpact"); if (asteroid) asteroid._dead = true; }
    else if (kind === "planet_meteor") { const planet = s.planet || a; const meteor = s.meteor || b; const m = bodyMass(meteor); dust(m * rulePct(world, rule, "dustPct", "cosmicDustSplitPlanetMeteorDustPct"), planet, meteor); evidence.absorbedMass = m * rulePct(world, rule, "absorbPct", "cosmicDustSplitPlanetMeteorAbsorbPct"); evidence.fragmentMass = m * rulePct(world, rule, "fragmentsPct", "cosmicDustSplitPlanetMeteorFragmentsPct"); addMass(planet, evidence.absorbedMass, "planet", "HC.CosmicDust.applySplitPolicy:planet_meteor"); evidence.fragments = spawnFragments(world, evidence.fragmentMass, planet, "planetMeteorImpact"); if (meteor) meteor._dead = true; }
    else if (kind === "planet_asteroid") { const planet = s.planet || a; const asteroid = s.asteroid || b; const m = bodyMass(asteroid); dust(m * rulePct(world, rule, "dustPct", "cosmicDustSplitPlanetAsteroidDustPct"), planet, asteroid); evidence.fragmentMass = m * rulePct(world, rule, "fragmentsPct", "cosmicDustSplitPlanetAsteroidFragmentsPct"); evidence.orbiterCandidate = descriptor("orbital_asteroid_candidate", m * rulePct(world, rule, "orbiterPct", "cosmicDustSplitPlanetAsteroidOrbiterPct"), planet, asteroid, rule, bodyMass(planet), bodyMass(planet)); evidence.fragments = spawnFragments(world, evidence.fragmentMass, planet, "planetAsteroidImpact"); if (asteroid) asteroid._dead = true; }
    else if (kind === "planet_moon") { const planet = s.planet || a; const moon = s.moon || b; const m = bodyMass(moon); dust(m * rulePct(world, rule, "dustPct", "cosmicDustSplitPlanetMoonDustPct"), planet, moon); evidence.fragmentMass = m * rulePct(world, rule, "fragmentsPct", "cosmicDustSplitPlanetMoonFragmentsPct"); evidence.orbiterCandidate = descriptor("orbital_moon_candidate", m * rulePct(world, rule, "orbiterPct", "cosmicDustSplitPlanetMoonOrbiterPct"), planet, moon, rule, bodyMass(planet), bodyMass(planet)); evidence.fragments = spawnFragments(world, evidence.fragmentMass, planet, "planetMoonImpact"); if (moon) moon._dead = true; }
    else if (kind === "planet_planet") { const m = bodyMass(a) + bodyMass(b); dust(m * rulePct(world, rule, "dustPct", "cosmicDustSplitPlanetPlanetDustPct"), a, b); evidence.fragmentMass = m * rulePct(world, rule, "fragmentsPct", "cosmicDustSplitPlanetPlanetFragmentsPct"); evidence.fragments = spawnFragments(world, evidence.fragmentMass, a, "planetPlanetImpact"); if (a) a._dead = true; if (b) b._dead = true; evidence.descriptorOnly = true; }
    recordMassSplit(world, evidence, (kind === "meteor_meteor" || kind === "planet_planet") ? bodyMass(a) + bodyMass(b) : bodyMass(s.meteor || s.asteroid || s.moon || s.secondary || s.b || s.incoming), kind === "meteor_meteor" ? ((evidence.resultMass || 0) + (evidence.cosmicDustMass || 0)) : undefined);
    world.lastCosmicDustEvent = Object.assign({ type: "cosmic_dust_split", at: nowMs(world) }, evidence, { cloudId: evidence.cloud?.id || null });
    return evidence;
  }

  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function bodyRadius(body) {
    if (window.HC?.SpaceBodies?.getCollisionRadius) return Math.max(0, finite(window.HC.SpaceBodies.getCollisionRadius(body), finite(body?.r, 1)));
    return Math.max(0, finite(body?.collisionRadius, finite(body?.physicalRadius, finite(body?.r, finite(body?.radius, 1)))));
  }
  function getCloudBodyOverlap(cloud, body) {
    if (!cloud || !body || cloud._dead || body._dead) return 0;
    const cx = finite(cloud.x, NaN), cy = finite(cloud.y, NaN), bx = finite(body.x, NaN), by = finite(body.y, NaN);
    if (![cx, cy, bx, by].every(Number.isFinite)) return 0;
    const cloudR = Math.max(0, finite(cloud.r, 0));
    const contactR = cloudR + bodyRadius(body);
    if (contactR <= 0) return 0;
    const dx = bx - cx, dy = by - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return clamp((contactR - distance) / contactR, 0, 1);
  }
  function eligibleBodies(World) {
    const sm = World.spaceMechanics || {};
    const groups = [];
    if (sm.cosmicDustAffectsMeteors !== false) groups.push(...(Array.isArray(World.meteors) ? World.meteors : []));
    if (sm.cosmicDustAffectsAsteroids !== false) groups.push(...(Array.isArray(World.asteroids) ? World.asteroids : []));
    if (sm.cosmicDustAffectsMoons === true) groups.push(...(Array.isArray(World.moons) ? World.moons : []));
    if (sm.cosmicDustAffectsImpactFragments !== false) groups.push(...(Array.isArray(World.impactFragments) ? World.impactFragments : []));
    if (sm.cosmicDustAffectsPlanets === true) groups.push(...(Array.isArray(World.planets) ? World.planets : []));
    return groups;
  }
  function canAffectBody(body) {
    if (!body || body._dead) return false;
    const kind = window.HC?.SpaceBodies?.getBodyKind ? window.HC.SpaceBodies.getBodyKind(body) : String(body.kind || body.type || "").toLowerCase();
    if (kind === "planet" || kind === "star" || body.planetKind === "rocky" || body.planetKind === "gas") return false;
    return Number.isFinite(Number(body.x)) && Number.isFinite(Number(body.y)) && Number.isFinite(Number(body.vx)) && Number.isFinite(Number(body.vy));
  }
  function applyPhysicalInfluence(World, dt, now) {
    const world = ensureWorldState(World); if (!world || world.spaceMechanics.cosmicDustEnabled === false || world.spaceMechanics.cosmicDustAffectsBodiesEnabled !== true) return { affected: 0, stopped: 0 };
    const sm = world.spaceMechanics;
    const dtSeconds = Math.max(0, finite(dt, 0));
    const clouds = world.cosmicDust.filter((cloud) => cloud && !cloud._dead);
    let affected = 0, stopped = 0, lastEvent = null;
    for (const body of eligibleBodies(world)) {
      if (!canAffectBody(body)) continue;
      const beforeSpeed = Math.sqrt(finite(body.vx, 0) * finite(body.vx, 0) + finite(body.vy, 0) * finite(body.vy, 0));
      if (beforeSpeed <= 0) { body.cosmicDustDragRatioLast = 1; body.cosmicDustOverlapLast = 0; continue; }
      let maxOverlap = 0;
      let multiplier = 1;
      for (const cloud of clouds) {
        const overlap = getCloudBodyOverlap(cloud, body);
        if (overlap <= 0) continue;
        maxOverlap = Math.max(maxOverlap, overlap);
        const densityFactor = Math.max(0, finite(cloud.density, 1)) * Math.max(0, finite(sm.cosmicDustDensityDragMul, 1));
        const overlapFactor = Math.max(0, overlap * finite(sm.cosmicDustOverlapDragMul, 1));
        const massResistance = Math.max(0.001, 1 + Math.max(0, bodyMass(body)) * Math.max(0, finite(sm.cosmicDustMassResistanceMul, 1)));
        const dragAmount = dtSeconds * Math.max(0, finite(sm.cosmicDustDragStrength, 0)) * densityFactor * overlapFactor / massResistance;
        multiplier *= clamp(1 - dragAmount, 0, 1);
      }
      body.cosmicDustOverlapLast = maxOverlap;
      body.cosmicDustDragRatioLast = multiplier;
      if (maxOverlap <= 0 || multiplier >= 1) continue;
      body.vx = finite(body.vx, 0) * multiplier;
      body.vy = finite(body.vy, 0) * multiplier;
      affected += 1;
      const afterSpeed = Math.sqrt(body.vx * body.vx + body.vy * body.vy);
      if (sm.cosmicDustStopEnabled === true && bodyMass(body) <= finite(sm.cosmicDustLightBodyMassThreshold, 8) && afterSpeed <= finite(sm.cosmicDustStopSpeedThreshold, 0.025) && maxOverlap >= finite(sm.cosmicDustStopOverlapThreshold, 0.25)) {
        body.vx = 0; body.vy = 0; body.cosmicDustStopped = true; body.stoppedByCosmicDustAt = nowMs(world, now); stopped += 1;
      }
      lastEvent = { type: "cosmic_dust_influence", bodyId: bodyId(body), bodyKind: body.kind || body.type || null, overlap: maxOverlap, dragRatio: multiplier, speedBefore: beforeSpeed, speedAfter: Math.sqrt(finite(body.vx, 0) ** 2 + finite(body.vy, 0) ** 2), stopped: body.cosmicDustStopped === true, at: nowMs(world, now) };
    }
    world.cosmicDustAffectedBodiesCount = affected;
    world.cosmicDustStoppedBodiesCount = stopped;
    if (lastEvent) world.lastCosmicDustInfluenceEvent = lastEvent;
    return { affected, stopped, lastEvent };
  }
  function mergeNearbyClouds(World) {
    const world = ensureWorldState(World); if (!world || world.spaceMechanics.cosmicDustMergeEnabled === false) return [];
    const clouds = world.cosmicDust.filter((c) => c && !c._dead); const merged = [];
    for (let i = 0; i < clouds.length; i++) for (let j = i + 1; j < clouds.length; j++) { const a = clouds[i], b = clouds[j]; if (b._dead) continue; const dx = b.x - a.x, dy = b.y - a.y; const maxD = (a.r + b.r) * finite(world.spaceMechanics.cosmicDustMergeDistanceMul, 1.25); if (dx * dx + dy * dy <= maxD * maxD) { const total = a.mass + b.mass; a.x = (a.x * a.mass + b.x * b.mass) / total; a.y = (a.y * a.mass + b.y * b.mass) / total; a.mass = total; a.density = Math.max(a.density, b.density); a.r = radiusForMass(world, a.mass, a.density); a.sourceBodyIds = Array.from(new Set([...(a.sourceBodyIds || []), ...(b.sourceBodyIds || [])])); b._dead = true; merged.push([a.id, b.id]); } }
    world.cosmicDust = clouds.filter((c) => !c._dead).sort((a, b) => b.mass - a.mass).slice(0, Math.max(0, Math.floor(finite(world.spaceMechanics.cosmicDustMaxClouds, 80))));
    return merged;
  }
  function update(World, dt, now) { const world = ensureWorldState(World); if (!world) return []; const n = nowMs(world, now); for (const c of world.cosmicDust) { c.updatedAt = n; c.ageMs = Math.max(0, n - finite(c.createdAt, n)); c.affectsBodies = false; } if (world.spaceMechanics.cosmicDustEnabled !== false && world.spaceMechanics.cosmicDustAffectsBodiesEnabled === true) applyPhysicalInfluence(world, dt, n); else { world.cosmicDustAffectedBodiesCount = 0; world.cosmicDustStoppedBodiesCount = 0; } if (world.spaceMechanics.cosmicDustMergeEnabled !== false) mergeNearbyClouds(world); return world.cosmicDust; }
  window.HC.CosmicDust = Object.freeze({ DEFAULTS, ensureWorldState, createCloud, createFromCollision, applySplitPolicy, getCloudBodyOverlap, applyPhysicalInfluence, mergeNearbyClouds, update });
})();
