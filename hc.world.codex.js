// HC world placeholder
(function () {
  window.HC = window.HC || {};
  window.HC.World = window.HC.World || {};
  window.HC.getWorld = () => (window.World || window.HC.World);

  const DEFAULT_METEOR_STREAMS = {
    enabled: false,
    t: 0,
    baseAngle: 0,
    driftSpeed: 0.06,
    shiftTimer: 0,
    shiftEvery: 4.5,
    shiftAmount: 0.35,
    streams: 3,
    spawnRate: 6,
    acc: 0,
    untilMs: null,
    baseSpawnRate: 6,
    baseStreams: 3,
  };

  function ensureMeteorStreams(world) {
    if (!world.meteorStreams) {
      world.meteorStreams = { ...DEFAULT_METEOR_STREAMS };
    } else {
      world.meteorStreams.baseSpawnRate = world.meteorStreams.baseSpawnRate || world.meteorStreams.spawnRate || DEFAULT_METEOR_STREAMS.spawnRate;
      world.meteorStreams.baseStreams = world.meteorStreams.baseStreams || world.meteorStreams.streams || DEFAULT_METEOR_STREAMS.streams;
    }
    return world.meteorStreams;
  }

  function getNowMs() {
    if (typeof performance !== "undefined" && performance.now) return performance.now();
    return Date.now();
  }

  function resetMetaOrbitMultipliers(World) {
    if (!World) return;
    World.metaOrbitMulAsteroid = 1;
    World.metaOrbitMulPlanet = 1;
    World.metaOrbitMulStar = 1;
  }

  function ensureMetaOrbitMultipliers(World) {
    if (!World) return;
    if (typeof World.metaOrbitMulAsteroid !== "number") World.metaOrbitMulAsteroid = 1;
    if (typeof World.metaOrbitMulPlanet !== "number") World.metaOrbitMulPlanet = 1;
    if (typeof World.metaOrbitMulStar !== "number") World.metaOrbitMulStar = 1;
  }

  function resetFormaEffectState(World) {
    if (!World) return;
    World.formaActiveUntilMs = 0;
    World.formaStrengthMul = 1;
    World.formaOrbitReduction = 0;
    World.formaOrbitReductionBase = 0;
  }

  function ensureFormaEffectState(World) {
    if (!World) return;
    if (typeof World.formaActiveUntilMs !== "number") World.formaActiveUntilMs = 0;
    if (typeof World.formaStrengthMul !== "number") World.formaStrengthMul = 1;
    if (typeof World.formaOrbitReduction !== "number") World.formaOrbitReduction = 0;
    if (typeof World.formaOrbitReductionBase !== "number") World.formaOrbitReductionBase = 0;
  }

  window.HC.WorldEvents = window.HC.WorldEvents || {};
  window.HC.WorldEvents.startMeteorShower = ({ durationMs, intensity } = {}) => {
    const World = window.HC.getWorld && window.HC.getWorld();
    if (!World) return;
    const ms = ensureMeteorStreams(World);
    const nowMs = World.nowMs ?? getNowMs();
    const intensityMul = (typeof intensity === "number" && Number.isFinite(intensity)) ? intensity : 1;

    ms.spawnRate = ms.baseSpawnRate * Math.max(0.1, intensityMul);
    ms.streams = ms.baseStreams;
    ms.enabled = true;
    ms.untilMs = (typeof durationMs === "number" && durationMs > 0) ? (nowMs + durationMs) : null;

    const Events = window.Events;
    if (Events && typeof Events.emit === "function") {
      Events.emit("EVENT_METEOR_SHOWER_START", { durationMs, intensity: intensityMul });
    }
  };

  window.HC.WorldEvents.stopMeteorShower = () => {
    const World = window.HC.getWorld && window.HC.getWorld();
    if (!World || !World.meteorStreams) return;
    const ms = ensureMeteorStreams(World);

    ms.enabled = false;
    ms.untilMs = null;
    ms.spawnRate = ms.baseSpawnRate;
    ms.streams = ms.baseStreams;

    const Events = window.Events;
    if (Events && typeof Events.emit === "function") {
      Events.emit("EVENT_METEOR_SHOWER_END", {});
    }
  };

  window.HC.WorldEvents.interruptPreStar = (planetId) => {
    const World = window.HC.getWorld && window.HC.getWorld();
    if (!World || !World.planets || planetId === undefined || planetId === null) return false;
    const planet = World.planets.find((p) => (p?.id ?? p?._id) === planetId);
    if (!planet || !planet.preStar || !planet.preStar.active) return false;

    planet.preStar.active = false;
    planet.preStar = null;

    const penalty = World.STAR_THRESHOLD_INTERRUPT_MULT || 1.3;
    const currentMul = (typeof World.starThresholdMultiplierThisRun === "number")
      ? World.starThresholdMultiplierThisRun
      : 1.0;
    World.starThresholdMultiplierThisRun = Math.max(currentMul, penalty);

    const Events = window.Events;
    if (Events && typeof Events.emit === "function") {
      Events.emit("PRESTAR_INTERRUPTED", { planetId });
    }
    return true;
  };

  window.HC.resetMetaOrbitMultipliers = resetMetaOrbitMultipliers;

  let resetWorldWrapped = false;
  window.addEventListener("load", () => {
    const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
    ensureMetaOrbitMultipliers(World);
    ensureFormaEffectState(World);

    if (resetWorldWrapped) return;
    const baseResetWorld = window.resetWorld;
    if (typeof baseResetWorld !== "function") return;
    window.resetWorld = function (...args) {
      const result = baseResetWorld.apply(this, args);
      const worldNow = (window.HC.getWorld && window.HC.getWorld()) || window.World;
      resetMetaOrbitMultipliers(worldNow);
      resetFormaEffectState(worldNow);
      return result;
    };
    if (window.HC) window.HC.resetWorld = window.resetWorld;
    resetWorldWrapped = true;
  });

  // Manual test:
  // 1) Utwórz pierwszą gwiazdę i potwierdź brak automatycznego deszczu meteorów.
  // 2) W konsoli: HC.WorldEvents.startMeteorShower({ durationMs: 5000 }).
  // 3) Sprawdź start eventu, automatyczne wyłączenie po czasie i powrót do normalnego spawnu.
})();
