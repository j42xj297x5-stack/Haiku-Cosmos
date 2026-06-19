// HC space body helper contract (future mechanics foundation).
// Patch D0 status: this module is the future home for side-effect-free body
// contract normalization (canonical/render-only/compatibility/deprecated fields).
// It must not reintroduce legacy planet capture or make visual assets drive
// progression; see docs/current/technical/SPACE_MECHANICS_CONTRACT.md.
(function (root) {
  root.HC = root.HC || {};

  const DEFAULT_MASS = 1;
  const DEFAULT_RADIUS = 1;
  const KIND_ALIASES = Object.freeze({
    dustcloud: "dustCloud",
    dust_cloud: "dustCloud",
    dustparticle: "dustParticle",
    dust_particle: "dustParticle",
    impactfragment: "impactFragment",
    impact_fragment: "impactFragment",
  });

  const BODY_CONTRACT_FIELDS = Object.freeze({
    canonical: Object.freeze([
      "id", "kind", "type", "x", "y", "vx", "vy", "r", "radius", "mass",
      "color", "material", "progressionMode", "isOrbitalBody", "canBecomePlanet",
      "parentPlanetId", "orbitState", "lastImpact",
    ]),
    renderOnly: Object.freeze([
      "visualKind", "visualVariant", "assetId", "asset", "modelId", "glbId",
      "rotation", "visualRotationSeed", "visualRotationX", "visualRotationY",
      "visualRotationZ", "visualRotationSpeedX", "visualRotationSpeedY",
      "visualRotationSpeedZ", "scale", "alpha", "sides", "angle", "grayLight",
      "rings", "aura", "renderKey", "source", "sourceMoonId",
    ]),
    compatibility: Object.freeze([
      "orbitPx", "orbitCurrentRadius", "gravityR", "parentKind", "parentRef",
      "theta", "omega", "orbitR", "orbiters", "World.lastPlanetImpact",
      "World.impactFragments", "World.moons",
    ]),
    deprecated: Object.freeze([
      "capR", "captureCooldown", "captureCount", "captureSumR", "captureSumMass",
      "captureColorCounts", "planetCaptureMode", "legacy_capture", "hybrid_debug",
      "LEGACY_PLANET_CAPTURE", "parentKind=planet", "legacy planet.orbiters",
    ]),
  });

  const BODY_CONTRACT_REASONS = Object.freeze({
    canonical: "canonical mechanics/snapshot body field",
    renderOnly: "render/snapshot/debug presentation field; not progression mechanics",
    compatibility: "transitional compatibility/debug field; not planet capture",
    deprecated: "deprecated legacy planet capture or stale live-relation field",
    unknown: "field is not classified by the current body contract",
  });

  const BODY_CONTRACT_LOOKUP = (() => {
    const lookup = Object.create(null);
    for (const status of Object.keys(BODY_CONTRACT_FIELDS)) {
      for (const field of BODY_CONTRACT_FIELDS[status]) lookup[field] = status;
    }
    return Object.freeze(lookup);
  })();

  const RADIUS_FROM_MASS_DEFAULTS = Object.freeze({
    meteor: { density: 1, minRadius: 0.1 },
    asteroid: { density: 1, minRadius: 0.1 },
    moon: { density: 1, minRadius: 0.1 },
    planet: { density: 1, minRadius: 0.1 },
    dustCloud: { density: 0.35, minRadius: 0.5 },
    dustParticle: { density: 1.4, minRadius: 0.05 },
    impactFragment: { density: 1.2, minRadius: 0.05 },
    body: { density: 1, minRadius: 0.1 },
  });

  function finitePositive(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : fallback;
  }

  function normalizeKind(kind) {
    const raw = String(kind || "").trim();
    if (!raw) return "body";
    const compact = raw.replace(/[\s-]+/g, "_").toLowerCase();
    return KIND_ALIASES[compact] || raw;
  }

  function getBodyKind(body) {
    if (!body || typeof body !== "object") return "body";
    if (body.planetKind === "rocky" || body.planetKind === "gas") return "planet";
    return normalizeKind(body.kind || body.type || body.bodyKind || body.visualKind);
  }

  function massFromRadius(radius) {
    const r = finitePositive(radius, DEFAULT_RADIUS);
    return r * r;
  }

  function getBodyRadius(body) {
    if (!body || typeof body !== "object") return DEFAULT_RADIUS;
    const mass = Number(body.mass);
    if (Number.isFinite(mass) && mass > 0) {
      return radiusFromMass(getBodyKind(body), mass, {
        baseRadius: body.massOneRadius ?? body.baseR ?? body.radiusBase ?? body.r ?? body.radius ?? DEFAULT_RADIUS,
        minRadius: body.minR ?? body.minRadius,
        maxRadius: body.maxR ?? body.maxRadius,
        density: body.density,
      });
    }
    return finitePositive(
      body.radius ?? body.r ?? body.visualRadius ?? body.physicalRadius ?? body.size,
      DEFAULT_RADIUS
    );
  }

  function getCollisionRadius(body) {
    if (!body || typeof body !== "object") return DEFAULT_RADIUS;
    return finitePositive(
      body.collisionRadius ?? body.physicalRadius ?? getBodyRadius(body),
      getBodyRadius(body)
    );
  }

  function getBodyMass(body) {
    if (!body || typeof body !== "object") return DEFAULT_MASS;
    const explicitMass = Number(body.mass);
    if (Number.isFinite(explicitMass) && explicitMass > 0) return explicitMass;

    const kind = getBodyKind(body);
    if (kind === "asteroid" && Number.isFinite(Number(body.growthLevel)) && Number(body.growthLevel) > 0) {
      return Number(body.growthLevel);
    }

    // Current meteors do not carry explicit mass; keep the legacy-safe fallback
    // used by the runtime in places that need a mass proxy: radius squared.
    const radius = getCollisionRadius(body);
    return massFromRadius(radius);
  }

  function setBodyMass(body, mass) {
    if (!body || typeof body !== "object") return body;
    const nextMass = finitePositive(mass, null);
    if (nextMass != null) body.mass = nextMass;
    return body;
  }

  function radiusFromMass(kind, mass, options) {
    const bodyKind = normalizeKind(kind);
    const defaults = RADIUS_FROM_MASS_DEFAULTS[bodyKind] || RADIUS_FROM_MASS_DEFAULTS.body;
    const opts = options || {};
    const density = finitePositive(opts.density, defaults.density);
    const minRadius = finitePositive(opts.minRadius, defaults.minRadius);
    const maxRadius = finitePositive(opts.maxRadius, Infinity);
    const baseRadius = finitePositive(opts.baseRadius, 1);
    const safeMass = finitePositive(mass, DEFAULT_MASS);
    const radius = baseRadius * Math.sqrt(safeMass / density);
    const world = root.World || null;
    let clampMax = maxRadius;
    if (world?.spaceMechanics?.bodyRadiusClampEnabled !== false) {
      const key = bodyKind === "asteroid" ? "maxAsteroidRadius" : bodyKind === "moon" ? "maxMoonRadius" : bodyKind === "planet" ? "maxRockyPlanetRadius" : null;
      const configured = key ? Number(world.spaceMechanics[key]) : NaN;
      if (Number.isFinite(configured) && configured > 0) clampMax = Math.min(clampMax, configured);
    }
    const clamped = Math.max(minRadius, Math.min(clampMax, radius));
    if (clamped !== radius && world) {
      world.lastBodyRadiusClampEvent = { kind: bodyKind, mass: safeMass, rawRadius: radius, clampedRadius: clamped, minRadius, maxRadius: clampMax, atFrame: Number(world.frame) || 0 };
      world.radiusClampCount = (Number(world.radiusClampCount) || 0) + 1;
    }
    return clamped;
  }

  function refreshBodyRadiusFromMass(body, options) {
    if (!body || typeof body !== "object") return body;
    const kind = normalizeKind(options?.kind || getBodyKind(body));
    const mass = getBodyMass(body);
    const radius = radiusFromMass(kind, mass, {
      baseRadius: body.massOneRadius ?? body.baseR ?? body.radiusBase ?? body.r ?? body.radius ?? DEFAULT_RADIUS,
      minRadius: body.minR ?? body.minRadius,
      maxRadius: body.maxR ?? body.maxRadius,
      density: body.density,
    });
    body.r = radius;
    body.radius = radius;
    body.collisionRadius = massRadiusContract.collisionRadiusFromMass(kind, mass, {
      baseRadius: body.massOneRadius ?? body.baseR ?? body.radiusBase ?? radius,
      minRadius: body.minR ?? body.minRadius,
      maxRadius: body.maxR ?? body.maxRadius,
      density: body.density,
    });
    body.viewRadius = massRadiusContract.viewRadiusFromMass(kind, mass, {
      baseRadius: body.massOneRadius ?? body.baseR ?? body.radiusBase ?? radius,
      minRadius: body.minR ?? body.minRadius,
      maxRadius: body.maxR ?? body.maxRadius,
      density: body.density,
    });
    body.massRadiusContractVersion = massRadiusContract.version;
    body.lastRadiusRefresh = { kind, mass, radius, sourceFunction: options?.sourceFunction || "HC.SpaceBodies.refreshBodyRadiusFromMass" };
    return body;
  }

  const massRadiusContract = Object.freeze({
    version: 1,
    baseMeteorMass: 1,
    meteorMassMin: 0.5,
    meteorMassMax: 1.0,
    radiusFromMass,
    collisionRadiusFromMass(kind, mass, options) { return radiusFromMass(kind, mass, options); },
    viewRadiusFromMass(kind, mass, options) { return radiusFromMass(kind, mass, options); },
  });

  function isDirectImpact(a, b) {
    if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
    const ax = Number(a.x);
    const ay = Number(a.y);
    const bx = Number(b.x);
    const by = Number(b.y);
    if (!Number.isFinite(ax) || !Number.isFinite(ay) || !Number.isFinite(bx) || !Number.isFinite(by)) return false;
    const dx = bx - ax;
    const dy = by - ay;
    const impactRadius = getCollisionRadius(a) + getCollisionRadius(b);
    return (dx * dx + dy * dy) <= impactRadius * impactRadius;
  }

  function createOrbitState(options) {
    const opts = options || {};
    const semiMajorAxis = finitePositive(opts.semiMajorAxis ?? opts.orbitR ?? opts.radius, 0);
    const semiMinorAxis = finitePositive(opts.semiMinorAxis, semiMajorAxis || 0);

    // Future orbit contract only: update/render systems do not consume this yet.
    // The frontOnlyCollision flag is reserved for later front-arc collision rules.
    return {
      parentId: opts.parentId ?? null,
      parentKind: opts.parentKind ?? null,
      semiMajorAxis,
      semiMinorAxis,
      angle: Number.isFinite(Number(opts.angle)) ? Number(opts.angle) : 0,
      angularSpeed: Number.isFinite(Number(opts.angularSpeed)) ? Number(opts.angularSpeed) : 0,
      inclination: Number.isFinite(Number(opts.inclination)) ? Number(opts.inclination) : 0,
      phase: Number.isFinite(Number(opts.phase)) ? Number(opts.phase) : 0,
      frontOnlyCollision: opts.frontOnlyCollision === true,
      minSafeDistance: finitePositive(opts.minSafeDistance, 0),
      source: opts.source || "future_contract",
    };
  }


  function getBodyContractFields() {
    return {
      canonical: BODY_CONTRACT_FIELDS.canonical.slice(),
      renderOnly: BODY_CONTRACT_FIELDS.renderOnly.slice(),
      compatibility: BODY_CONTRACT_FIELDS.compatibility.slice(),
      deprecated: BODY_CONTRACT_FIELDS.deprecated.slice(),
    };
  }

  function classifyBodyField(fieldName) {
    const field = String(fieldName || "");
    const status = BODY_CONTRACT_LOOKUP[field] || "unknown";
    const result = {
      field,
      status,
      reason: BODY_CONTRACT_REASONS[status],
    };
    if (field === "parentKind") {
      result.note = "contextual; parentKind=planet must not be used as an active live planet relation";
    }
    if (field === "orbiters") {
      result.note = "contextual; compatibility/debug only, not legacy planet.orbiters as a live relation";
    }
    if (field === "captureCooldown") {
      result.note = "deprecated when used exclusively for legacy planet capture";
    }
    return result;
  }

  function classifyBodyFields(body) {
    const grouped = { canonical: [], renderOnly: [], compatibility: [], deprecated: [], unknown: [] };
    if (!body || typeof body !== "object") return grouped;
    for (const field of Object.keys(body)) {
      const classification = classifyBodyField(field);
      grouped[classification.status].push(field);
    }
    return grouped;
  }

  function getBodyContractStatus(body) {
    return classifyBodyFields(body);
  }

  function isOrbiting(body) {
    if (!body || typeof body !== "object") return false;
    if (body.orbitState && typeof body.orbitState === "object") return true;
    return Boolean(body.parentKind && body.parentRef) || Number.isFinite(Number(body.orbitR));
  }

  root.HC.SpaceBodies = Object.freeze({
    getBodyContractFields,
    classifyBodyField,
    classifyBodyFields,
    getBodyContractStatus,
    getBodyKind,
    getBodyMass,
    setBodyMass,
    refreshBodyRadiusFromMass,
    getBodyRadius,
    getCollisionRadius,
    radiusFromMass,
    collisionRadiusFromMass: massRadiusContract.collisionRadiusFromMass,
    viewRadiusFromMass: massRadiusContract.viewRadiusFromMass,
    massRadiusContract,
    massFromRadius,
    isDirectImpact,
    createOrbitState,
    isOrbiting,
  });
})(window);
