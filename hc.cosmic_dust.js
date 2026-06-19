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
    cosmicDustDragStrength: 0,
    cosmicDustStopSpeedThreshold: 0,
    cosmicDustCondensationEnabled: false,
    cosmicDustCloudToGasPlanetMassThreshold: 999999,
    cosmicDustSplitMeteorMeteorDustPct: 0.25,
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
  function addMass(body, amount) { if (body && amount > 0) body.mass = bodyMass(body) + amount; }
  function resizeAsteroid(World, a) { if (window.HC?.SpaceBodies?.radiusFromMass && a) a.r = window.HC.SpaceBodies.radiusFromMass("asteroid", a.mass, { baseRadius: a.massOneRadius || a.baseR || a.r || 1, minRadius: a.minR || 1, maxRadius: a.maxR || Infinity }); }
  function resizeMoon(World, m) { if (window.HC?.SpaceBodies?.radiusFromMass && m) { m.r = window.HC.SpaceBodies.radiusFromMass("moon", m.mass, { baseRadius: m.massOneRadius || m.baseR || m.r || 1, minRadius: m.minR || 0.1, maxRadius: m.maxR || Infinity }); m.radius = m.r; } }
  function spawnFragments(World, mass, origin, kind) { const result = { kind: kind || "cosmicDustImpact", masses: { ejecta: Math.max(0, mass) } }; return window.HC?.Impact?.spawnEjecta ? window.HC.Impact.spawnEjecta(World, result, origin) : []; }
  function descriptor(kind, mass, target, incoming) { return { kind, descriptorOnly: true, mass: Math.max(0, mass), targetId: bodyId(target), sourceBodyId: bodyId(incoming) }; }
  function applySplitPolicy(World, spec) {
    const world = ensureWorldState(World); if (!world) return null; const s = spec || {}; const kind = s.kind || s.collisionKind;
    const a = s.primary || s.a || s.target; const b = s.secondary || s.b || s.incoming; const source = kind || "collision";
    const evidence = { kind, source, cosmicDustMass: 0, absorbedMass: 0, fragmentMass: 0, orbiterCandidate: null, cloud: null, descriptorOnly: false };
    function dust(m, primary, secondary) { evidence.cosmicDustMass = Math.max(0, m); evidence.cloud = createFromCollision(world, { primary, secondary, source, mass: evidence.cosmicDustMass }); return evidence.cloud; }
    if (kind === "meteor_meteor") { if (a?.colorName === b?.colorName) return null; dust((bodyMass(a) + bodyMass(b)) * pct(world, "cosmicDustSplitMeteorMeteorDustPct"), a, b); }
    else if (kind === "meteor_asteroid") { const meteor = s.meteor || (a?.type === "meteor" ? a : b); const asteroid = s.asteroid || (a?.type === "asteroid" ? a : b); const m = bodyMass(meteor); dust(m * pct(world, "cosmicDustSplitMeteorAsteroidDustPct"), asteroid, meteor); evidence.absorbedMass = m * pct(world, "cosmicDustSplitMeteorAsteroidAbsorbPct"); addMass(asteroid, evidence.absorbedMass); resizeAsteroid(world, asteroid); if (meteor) meteor._dead = true; }
    else if (kind === "asteroid_asteroid") { const primary = s.primary || (bodyMass(a) >= bodyMass(b) ? a : b); const secondary = s.secondary || (primary === a ? b : a); const m = bodyMass(secondary); dust(m * pct(world, "cosmicDustSplitAsteroidAsteroidDustPct"), primary, secondary); evidence.absorbedMass = m * pct(world, "cosmicDustSplitAsteroidAsteroidAbsorbPct"); addMass(primary, evidence.absorbedMass); resizeAsteroid(world, primary); if (secondary) secondary._dead = true; }
    else if (kind === "moon_meteor") { const moon = s.moon || a; const meteor = s.meteor || b; const m = bodyMass(meteor); dust(m * pct(world, "cosmicDustSplitMoonMeteorDustPct"), moon, meteor); evidence.absorbedMass = m * pct(world, "cosmicDustSplitMoonMeteorAbsorbPct"); addMass(moon, evidence.absorbedMass); resizeMoon(world, moon); if (meteor) meteor._dead = true; }
    else if (kind === "moon_asteroid") { const moon = s.moon || a; const asteroid = s.asteroid || b; const m = bodyMass(asteroid); dust(m * pct(world, "cosmicDustSplitMoonAsteroidDustPct"), moon, asteroid); evidence.absorbedMass = m * pct(world, "cosmicDustSplitMoonAsteroidAbsorbPct"); evidence.fragmentMass = m * pct(world, "cosmicDustSplitMoonAsteroidFragmentsPct"); addMass(moon, evidence.absorbedMass); resizeMoon(world, moon); evidence.fragments = spawnFragments(world, evidence.fragmentMass, moon, "moonAsteroidImpact"); if (asteroid) asteroid._dead = true; }
    else if (kind === "planet_meteor") { const planet = s.planet || a; const meteor = s.meteor || b; const m = bodyMass(meteor); dust(m * pct(world, "cosmicDustSplitPlanetMeteorDustPct"), planet, meteor); evidence.absorbedMass = m * pct(world, "cosmicDustSplitPlanetMeteorAbsorbPct"); evidence.fragmentMass = m * pct(world, "cosmicDustSplitPlanetMeteorFragmentsPct"); addMass(planet, evidence.absorbedMass); evidence.fragments = spawnFragments(world, evidence.fragmentMass, planet, "planetMeteorImpact"); if (meteor) meteor._dead = true; }
    else if (kind === "planet_asteroid") { const planet = s.planet || a; const asteroid = s.asteroid || b; const m = bodyMass(asteroid); dust(m * pct(world, "cosmicDustSplitPlanetAsteroidDustPct"), planet, asteroid); evidence.fragmentMass = m * pct(world, "cosmicDustSplitPlanetAsteroidFragmentsPct"); evidence.orbiterCandidate = descriptor("orbital_asteroid_candidate", m * pct(world, "cosmicDustSplitPlanetAsteroidOrbiterPct"), planet, asteroid); evidence.fragments = spawnFragments(world, evidence.fragmentMass, planet, "planetAsteroidImpact"); if (asteroid) asteroid._dead = true; }
    else if (kind === "planet_moon") { const planet = s.planet || a; const moon = s.moon || b; const m = bodyMass(moon); dust(m * pct(world, "cosmicDustSplitPlanetMoonDustPct"), planet, moon); evidence.fragmentMass = m * pct(world, "cosmicDustSplitPlanetMoonFragmentsPct"); evidence.orbiterCandidate = descriptor("orbital_moon_candidate", m * pct(world, "cosmicDustSplitPlanetMoonOrbiterPct"), planet, moon); evidence.fragments = spawnFragments(world, evidence.fragmentMass, planet, "planetMoonImpact"); if (moon) moon._dead = true; }
    else if (kind === "planet_planet") { const m = bodyMass(a) + bodyMass(b); dust(m * pct(world, "cosmicDustSplitPlanetPlanetDustPct"), a, b); evidence.fragmentMass = m * pct(world, "cosmicDustSplitPlanetPlanetFragmentsPct"); evidence.fragments = spawnFragments(world, evidence.fragmentMass, a, "planetPlanetImpact"); if (a) a._dead = true; if (b) b._dead = true; evidence.descriptorOnly = true; }
    world.lastCosmicDustEvent = Object.assign({ type: "cosmic_dust_split", at: nowMs(world) }, evidence, { cloudId: evidence.cloud?.id || null });
    return evidence;
  }
  function mergeNearbyClouds(World) {
    const world = ensureWorldState(World); if (!world || world.spaceMechanics.cosmicDustMergeEnabled === false) return [];
    const clouds = world.cosmicDust.filter((c) => c && !c._dead); const merged = [];
    for (let i = 0; i < clouds.length; i++) for (let j = i + 1; j < clouds.length; j++) { const a = clouds[i], b = clouds[j]; if (b._dead) continue; const dx = b.x - a.x, dy = b.y - a.y; const maxD = (a.r + b.r) * finite(world.spaceMechanics.cosmicDustMergeDistanceMul, 1.25); if (dx * dx + dy * dy <= maxD * maxD) { const total = a.mass + b.mass; a.x = (a.x * a.mass + b.x * b.mass) / total; a.y = (a.y * a.mass + b.y * b.mass) / total; a.mass = total; a.density = Math.max(a.density, b.density); a.r = radiusForMass(world, a.mass, a.density); a.sourceBodyIds = Array.from(new Set([...(a.sourceBodyIds || []), ...(b.sourceBodyIds || [])])); b._dead = true; merged.push([a.id, b.id]); } }
    world.cosmicDust = clouds.filter((c) => !c._dead).sort((a, b) => b.mass - a.mass).slice(0, Math.max(0, Math.floor(finite(world.spaceMechanics.cosmicDustMaxClouds, 80))));
    return merged;
  }
  function update(World, dt, now) { const world = ensureWorldState(World); if (!world) return []; const n = nowMs(world, now); for (const c of world.cosmicDust) { c.updatedAt = n; c.ageMs = Math.max(0, n - finite(c.createdAt, n)); c.affectsBodies = false; } if (world.spaceMechanics.cosmicDustMergeEnabled !== false) mergeNearbyClouds(world); return world.cosmicDust; }
  window.HC.CosmicDust = Object.freeze({ DEFAULTS, ensureWorldState, createCloud, createFromCollision, applySplitPolicy, mergeNearbyClouds, update });
})();
