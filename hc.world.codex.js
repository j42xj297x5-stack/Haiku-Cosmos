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

  const EFFECT_TIMER_COLORS = ["red", "yellow", "green", "blue"];
  const RUN_TIMER_COLORS = ["red", "yellow", "green", "blue"];

  function buildEffectTimerState() {
    const timersByColor = {};
    const durationMsByColor = {};
    EFFECT_TIMER_COLORS.forEach((color) => {
      timersByColor[color] = [];
      durationMsByColor[color] = 0;
    });
    return { timersByColor, durationMsByColor };
  }

  function resetEffectTimers(World) {
    if (!World) return;
    const state = buildEffectTimerState();
    World.effectTimersByColor = state.timersByColor;
    World.effectTimerDurationMsByColor = state.durationMsByColor;
  }

  function buildRunTimerState() {
    const timersByColor = {};
    const durationMsByColor = {};
    RUN_TIMER_COLORS.forEach((color) => {
      timersByColor[color] = 0;
      durationMsByColor[color] = 0;
    });
    return { timersByColor, durationMsByColor };
  }

  function resetRunTimers(World) {
    if (!World) return;
    const state = buildRunTimerState();
    World.runColorTimers = state.timersByColor;
    World.runColorDurations = state.durationMsByColor;
    World.runWorldActiveUntilMs = 0;
    World.runWorldStrengthMul = 1;
  }

  function ensureEffectTimers(World) {
    if (!World) return;
    if (!World.effectTimersByColor || typeof World.effectTimersByColor !== "object") {
      resetEffectTimers(World);
      return;
    }
    if (!World.effectTimerDurationMsByColor || typeof World.effectTimerDurationMsByColor !== "object") {
      World.effectTimerDurationMsByColor = {};
    }
    EFFECT_TIMER_COLORS.forEach((color) => {
      if (!Array.isArray(World.effectTimersByColor[color])) {
        World.effectTimersByColor[color] = [];
      }
      if (typeof World.effectTimerDurationMsByColor[color] !== "number") {
        World.effectTimerDurationMsByColor[color] = 0;
      }
    });
  }

  function ensureRunTimers(World) {
    if (!World) return;
    if (!World.runColorTimers || typeof World.runColorTimers !== "object") {
      resetRunTimers(World);
      return;
    }
    if (!World.runColorDurations || typeof World.runColorDurations !== "object") {
      World.runColorDurations = {};
    }
    RUN_TIMER_COLORS.forEach((color) => {
      if (typeof World.runColorTimers[color] !== "number") {
        World.runColorTimers[color] = 0;
      }
      if (typeof World.runColorDurations[color] !== "number") {
        World.runColorDurations[color] = 0;
      }
    });
    if (typeof World.runWorldActiveUntilMs !== "number") World.runWorldActiveUntilMs = 0;
    if (typeof World.runWorldStrengthMul !== "number") World.runWorldStrengthMul = 1;
  }

  function pruneExpiredTimers(World, nowMs) {
    if (!World) return;
    ensureEffectTimers(World);
    const t = Number(nowMs);
    if (!Number.isFinite(t)) return;
    EFFECT_TIMER_COLORS.forEach((color) => {
      const list = World.effectTimersByColor[color];
      if (!list || !list.length) return;
      World.effectTimersByColor[color] = list.filter((untilMs) => untilMs > t);
    });
  }

  function updateRunWorldActiveUntil(World, nowMs) {
    if (!World) return 0;
    ensureRunTimers(World);
    const maxUntil = Math.max(...RUN_TIMER_COLORS.map((color) => Number(World.runColorTimers[color] || 0)));
    World.runWorldActiveUntilMs = Number.isFinite(maxUntil) ? maxUntil : 0;
    const t = Number(nowMs);
    if (Number.isFinite(t) && World.runWorldActiveUntilMs <= t) {
      World.runWorldActiveUntilMs = 0;
      World.runWorldStrengthMul = 1;
    }
    return World.runWorldActiveUntilMs;
  }

  function isRunColorDisabled(World, nowMs, color) {
    if (!World || !color) return false;
    ensureRunTimers(World);
    const t = Number(nowMs);
    if (!Number.isFinite(t)) return false;
    return Number(World.runColorTimers[color] || 0) > t;
  }

  function isWorldSlotsActive(World, nowMs) {
    if (!World) return false;
    const t = Number(nowMs);
    if (!Number.isFinite(t)) return false;
    updateRunWorldActiveUntil(World, t);
    return World.runWorldActiveUntilMs > t;
  }

  function startOrRefreshRunColorTimer(World, color, durationMs, nowMs, strengthMul) {
    if (!World || !color) return false;
    ensureRunTimers(World);
    const dur = Number(durationMs);
    const t = Number(nowMs);
    if (!Number.isFinite(dur) || dur <= 0 || !Number.isFinite(t)) return false;
    const untilMs = t + dur;
    World.runColorTimers[color] = untilMs;
    World.runColorDurations[color] = dur;
    const strength = Number(strengthMul);
    if (Number.isFinite(strength) && strength > World.runWorldStrengthMul) {
      World.runWorldStrengthMul = strength;
    }
    updateRunWorldActiveUntil(World, t);
    return true;
  }

  function getColorActiveUntil(World, color) {
    if (!World || !color) return 0;
    ensureEffectTimers(World);
    const list = World.effectTimersByColor[color] || [];
    if (!list.length) return 0;
    return Math.max(...list);
  }

  function isColorEffectActive(World, nowMs, color) {
    if (!World || !color) return false;
    const untilMs = getColorActiveUntil(World, color);
    const t = Number(nowMs);
    return Number.isFinite(untilMs) && Number.isFinite(t) && untilMs > t;
  }

  function startOrRefreshColorTimer(World, color, durationMs, nowMs) {
    if (!World || !color) return false;
    ensureEffectTimers(World);
    const dur = Number(durationMs);
    const t = Number(nowMs);
    if (!Number.isFinite(dur) || dur <= 0 || !Number.isFinite(t)) return false;
    const untilMs = t + dur;
    const list = World.effectTimersByColor[color] || [];
    list.length = 0;
    list.push(untilMs);
    World.effectTimersByColor[color] = list;
    World.effectTimerDurationMsByColor[color] = dur;
    return true;
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
    World.formaColorKey = null;
    resetEffectTimers(World);
    resetRunTimers(World);
  }

  function ensureFormaEffectState(World) {
    if (!World) return;
    if (typeof World.formaActiveUntilMs !== "number") World.formaActiveUntilMs = 0;
    if (typeof World.formaStrengthMul !== "number") World.formaStrengthMul = 1;
    if (typeof World.formaOrbitReduction !== "number") World.formaOrbitReduction = 0;
    if (typeof World.formaOrbitReductionBase !== "number") World.formaOrbitReductionBase = 0;
    if (typeof World.formaColorKey !== "string") World.formaColorKey = null;
    ensureEffectTimers(World);
    ensureRunTimers(World);
  }

  window.HC.WorldEvents = window.HC.WorldEvents || {};
  window.HC.EffectTimers = window.HC.EffectTimers || {};
  window.HC.EffectTimers.ensure = ensureEffectTimers;
  window.HC.EffectTimers.reset = resetEffectTimers;
  window.HC.EffectTimers.pruneExpired = pruneExpiredTimers;
  window.HC.EffectTimers.startOrRefresh = startOrRefreshColorTimer;
  window.HC.EffectTimers.getColorActiveUntil = getColorActiveUntil;
  window.HC.EffectTimers.isColorActive = isColorEffectActive;
  window.HC.RunTimers = window.HC.RunTimers || {};
  window.HC.RunTimers.ensure = ensureRunTimers;
  window.HC.RunTimers.reset = resetRunTimers;
  window.HC.RunTimers.updateWorldActiveUntil = updateRunWorldActiveUntil;
  window.HC.RunTimers.isColorDisabled = isRunColorDisabled;
  window.HC.RunTimers.isWorldSlotsActive = isWorldSlotsActive;
  window.HC.RunTimers.startOrRefresh = startOrRefreshRunColorTimer;
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
