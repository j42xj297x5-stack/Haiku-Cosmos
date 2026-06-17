// HC space body helper contract (future mechanics foundation)
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
    return finitePositive(
      body.radius ?? body.r ?? body.visualRadius ?? body.physicalRadius ?? body.size,
      DEFAULT_RADIUS
    );
  }

  function getCollisionRadius(body) {
    if (!body || typeof body !== "object") return DEFAULT_RADIUS;
    return finitePositive(
      body.collisionRadius ?? body.physicalRadius ?? body.r ?? body.radius ?? body.visualRadius ?? body.size,
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
    return Math.max(minRadius, Math.min(maxRadius, radius));
  }

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

  function isOrbiting(body) {
    if (!body || typeof body !== "object") return false;
    if (body.orbitState && typeof body.orbitState === "object") return true;
    return Boolean(body.parentKind && body.parentRef) || Number.isFinite(Number(body.orbitR));
  }

  root.HC.SpaceBodies = Object.freeze({
    getBodyKind,
    getBodyMass,
    setBodyMass,
    getBodyRadius,
    getCollisionRadius,
    radiusFromMass,
    massFromRadius,
    isDirectImpact,
    createOrbitState,
    isOrbiting,
  });
})(window);
