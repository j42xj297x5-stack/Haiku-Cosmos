// HC impact subsystem: pure data impact split helpers + lightweight ejecta prep.
(function () {
  window.HC = window.HC || {};

  const DEFAULT_MECHANICS = Object.freeze({
    planetImpactAbsorbPercent: 0.22,
    planetImpactExplosionPercent: 0.28,
    planetImpactEjectaPercent: 0.35,
    planetImpactOrbiterPercent: 0.15,
    planetImpactFirstOrbiterChance: 0.55,
    planetImpactNextOrbiterChanceWhenExistingOrbiterMax: 0.25,
    planetImpactAbsorbMassMaxWhenOrbiterExists: 0.30,
    moonImpactAbsorbMassMax: 0.30,
    moonImpactAbsorbPercent: 0.24,
    moonImpactExplosionPercent: 0.26,
    moonImpactEjectaPercent: 0.32,
    moonImpactDustPercent: 0.18,
    moonCanCreateOrbiters: false,
    impactEjectaMinMass: 0.08,
    impactEjectaMaxPieces: 5,
  });

  function finiteNumber(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clampPercent(value, fallback = 0) {
    return Math.max(0, Math.min(1, finiteNumber(value, fallback)));
  }

  function rollChance(chance, rng) {
    const random = typeof rng === "function" ? rng() : Math.random();
    return finiteNumber(random, 1) < clampPercent(chance, 0);
  }

  function splitMass(totalMass, parts) {
    const mass = Math.max(0, finiteNumber(totalMass, 0));
    const entries = Object.entries(parts || {});
    const result = {};
    let percentSum = 0;
    for (const [key, percent] of entries) {
      const safePercent = clampPercent(percent, 0);
      percentSum += safePercent;
      result[key] = mass * safePercent;
    }
    if (percentSum > 1 && percentSum > 0) {
      for (const key of Object.keys(result)) result[key] /= percentSum;
    }
    result.remainder = Math.max(0, mass - Object.values(result).reduce((sum, value) => sum + value, 0));
    return result;
  }

  function mechanicsFromWorld(world) {
    return Object.assign({}, DEFAULT_MECHANICS, (world && world.spaceMechanics) || {});
  }

  function bodyMass(body) {
    if (window.HC?.SpaceBodies?.getBodyMass) return window.HC.SpaceBodies.getBodyMass(body);
    const mass = Number(body && body.mass);
    if (Number.isFinite(mass) && mass > 0) return mass;
    const r = Number(body && (body.r ?? body.radius ?? body.collisionRadius));
    return Number.isFinite(r) && r > 0 ? r * r : 1;
  }

  function orbiterCountForPlanet(planet) {
    if (!planet) return 0;
    const explicit = Number(planet.orbiterCount);
    if (Number.isFinite(explicit) && explicit >= 0) return explicit;
    return Array.isArray(planet.orbiters) ? planet.orbiters.length : 0;
  }

  function resolvePlanetImpact(input) {
    const safe = input || {};
    const mechanics = Object.assign({}, DEFAULT_MECHANICS, safe.mechanics || {});
    const incoming = safe.incoming || {};
    const incomingMass = Math.max(0, finiteNumber(safe.incomingMass, bodyMass(incoming)));
    const existingOrbiters = Math.max(0, finiteNumber(safe.existingOrbiters, orbiterCountForPlanet(safe.planet)), 0);
    const hasExistingOrbiter = existingOrbiters > 0;
    const absorbPercent = hasExistingOrbiter
      ? Math.min(clampPercent(mechanics.planetImpactAbsorbPercent), clampPercent(mechanics.planetImpactAbsorbMassMaxWhenOrbiterExists, 0.30))
      : clampPercent(mechanics.planetImpactAbsorbPercent);
    const orbiterChance = hasExistingOrbiter
      ? Math.min(clampPercent(mechanics.planetImpactFirstOrbiterChance), clampPercent(mechanics.planetImpactNextOrbiterChanceWhenExistingOrbiterMax, 0.25))
      : clampPercent(mechanics.planetImpactFirstOrbiterChance, 0.55);
    const createsOrbiter = rollChance(orbiterChance, safe.rng);
    const masses = splitMass(incomingMass, {
      absorbed: absorbPercent,
      explosion: mechanics.planetImpactExplosionPercent,
      ejecta: mechanics.planetImpactEjectaPercent,
      orbiter: createsOrbiter ? mechanics.planetImpactOrbiterPercent : 0,
    });
    masses.ejecta += masses.remainder;
    masses.remainder = 0;
    return {
      kind: "planetImpact",
      createsDust: false,
      createsOrbiter,
      orbiterChance,
      existingOrbiters,
      incomingMass,
      masses,
      evidence: { noDust: true, absorbLimitedByExistingOrbiter: hasExistingOrbiter },
    };
  }

  function resolveMoonImpact(input) {
    const safe = input || {};
    const mechanics = Object.assign({}, DEFAULT_MECHANICS, safe.mechanics || {});
    const incoming = safe.incoming || {};
    const incomingMass = Math.max(0, finiteNumber(safe.incomingMass, bodyMass(incoming)));
    const absorbPercent = Math.min(clampPercent(mechanics.moonImpactAbsorbPercent), clampPercent(mechanics.moonImpactAbsorbMassMax, 0.30));
    const masses = splitMass(incomingMass, {
      absorbed: absorbPercent,
      explosion: mechanics.moonImpactExplosionPercent,
      ejecta: mechanics.moonImpactEjectaPercent,
      dust: mechanics.moonImpactDustPercent,
    });
    masses.ejecta += masses.remainder;
    masses.remainder = 0;
    const incomingKind = incoming.kind || incoming.type || "unknown";
    const dustColor = incomingKind === "meteor" ? (incoming.colorName || incoming.color || "GRAY") : "moonImpactGray";
    return {
      kind: "moonImpact",
      createsDust: true,
      createsOrbiter: false,
      incomingMass,
      masses,
      dust: { kind: "moonImpactDust", color: dustColor, sourceBodyType: incomingKind },
      evidence: { moonCanCreateOrbiters: false, absorbMax: clampPercent(mechanics.moonImpactAbsorbMassMax, 0.30) },
    };
  }

  function spawnEjecta(world, impactResult, origin, options) {
    const safeWorld = world || window.World || {};
    const safeOptions = options || {};
    const mechanics = mechanicsFromWorld(safeWorld);
    const total = Math.max(0, finiteNumber(impactResult?.masses?.ejecta, 0));
    const minMass = Math.max(0.001, finiteNumber(safeOptions.minMass, mechanics.impactEjectaMinMass));
    const maxPieces = Math.max(0, Math.floor(finiteNumber(safeOptions.maxPieces, mechanics.impactEjectaMaxPieces)));
    const count = total > 0 ? Math.max(1, Math.min(maxPieces, Math.ceil(total / minMass))) : 0;
    const pieces = [];
    for (let i = 0; i < count; i += 1) {
      const angle = ((Math.PI * 2) / Math.max(1, count)) * i;
      pieces.push({
        type: "impactFragment",
        kind: "impactFragment",
        sourceImpactKind: impactResult?.kind || "impact",
        x: finiteNumber(origin?.x, 0),
        y: finiteNumber(origin?.y, 0),
        vx: Math.cos(angle) * 8,
        vy: Math.sin(angle) * 8,
        mass: total / Math.max(1, count),
        visualReady: false,
      });
    }
    if (safeOptions.commit !== false) {
      safeWorld.impactFragments = Array.isArray(safeWorld.impactFragments) ? safeWorld.impactFragments : [];
      safeWorld.impactFragments.push(...pieces);
    }
    return pieces;
  }

  function logImpactEvidence(world, result, source) {
    window.HC?.logEvent?.("world", "WORLD_IMPACT_RESOLVED", {
      impactKind: result?.kind || "impact",
      createsDust: Boolean(result?.createsDust),
      createsOrbiter: Boolean(result?.createsOrbiter),
      incomingMass: result?.incomingMass || 0,
      masses: result?.masses || {},
      dust: result?.dust || null,
    }, { source: source || "HC.Impact", snapshot: true });
  }

  window.HC.Impact = Object.freeze({
    DEFAULT_MECHANICS,
    clampPercent,
    rollChance,
    splitMass,
    mechanicsFromWorld,
    bodyMass,
    resolvePlanetImpact,
    resolveMoonImpact,
    spawnEjecta,
    logImpactEvidence,
  });
})();
