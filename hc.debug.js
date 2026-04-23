// HC debug/session foundation
(function () {
  window.HC = window.HC || {};

  const EVENT_TYPES = Object.freeze({
    SESSION_STARTED: "session.started",
    SESSION_CONFIG_APPLIED: "session.config_applied",
    SESSION_ENDED: "session.ended",
    SESSION_ABORTED: "session.aborted",

    WORLD_OBJECT_SPAWNED: "world.object_spawned",
    WORLD_OBJECT_DESPAWNED: "world.object_despawned",
    WORLD_OBJECT_TRANSFORMED: "world.object_transformed",
    WORLD_THRESHOLD_PROGRESS: "world.threshold_progress",
    WORLD_THRESHOLD_REACHED: "world.threshold_reached",
    WORLD_TRANSFORMATION_STARTED: "world.transformation_started",
    WORLD_TRANSFORMATION_COMPLETED: "world.transformation_completed",
    WORLD_TRANSFORMATION_BLOCKED: "world.transformation_blocked",
    WORLD_CLEANUP_STARTED: "world.cleanup_started",
    WORLD_CLEANUP_COMPLETED: "world.cleanup_completed",

    SEQUENCE_STARTED: "sequence.started",
    SEQUENCE_DIRECTION_LOCKED: "sequence.direction_locked",
    SEQUENCE_EXPECTED_COLOR_CHANGED: "sequence.expected_color_changed",
    SEQUENCE_HIT_REGISTERED: "sequence.hit_registered",
    SEQUENCE_HIT_REJECTED: "sequence.hit_rejected",
    SEQUENCE_STEP_STARTED: "sequence.step_started",
    SEQUENCE_STEP_PROGRESS: "sequence.step_progress",
    SEQUENCE_STEP_COMPLETED: "sequence.step_completed",
    SEQUENCE_FAIL_DETECTED: "sequence.fail_detected",
    SEQUENCE_FAIL_RESOLVED: "sequence.fail_resolved",
    SEQUENCE_FAILED: "sequence.failed",
    SEQUENCE_CASHOUT_STARTED: "sequence.cashout_started",
    SEQUENCE_CASHOUT_COMPLETED: "sequence.cashout_completed",
    SEQUENCE_CASHOUT: "sequence.cashout",
    SEQUENCE_RESET: "sequence.reset",
    SEQUENCE_LOOP_AA_STARTED: "sequence.loop_aa_started",
    SEQUENCE_LOOP_AA_COMPLETED: "sequence.loop_aa_completed",
    SEQUENCE_LOOP_AAA_STARTED: "sequence.loop_aaa_started",
    SEQUENCE_LOOP_AAA_COMPLETED: "sequence.loop_aaa_completed",
    SEQUENCE_DS_GRANTED: "sequence.ds_granted",
    SEQUENCE_R1_ACTIVATED: "sequence.r1_activated",

    CARD_CREATED: "card.created",
    CARD_COLLECTED: "card.collected",
    CARD_ACTIVATED: "card.activated",

    RP_GAINED: "rp.gained",
    RP_SPENT: "rp.spent",
    RP_SET_INITIAL: "rp.set_initial",

    DEBUG_OVERRIDE_APPLIED: "debug.override_applied",
    DEBUG_CONFIG_SECTION_APPLIED: "debug.config_section_applied",
    DEBUG_FLUSH: "debug.flush",
    DEBUG_SNAPSHOT_WRITTEN: "debug.snapshot_written",
    DEBUG_ERROR: "debug.error",
  });

  const DEFAULT_INITIAL_CARDS = Object.freeze({
    R1_DR_RED: 0,
    R1_DR_YELLOW: 0,
    R1_DR_GREEN: 0,
    R1_DR_BLUE: 0,
    DS_DR_RED: 0,
    DS_DR_YELLOW: 0,
    DS_DR_GREEN: 0,
    DS_DR_BLUE: 0,
    R1_SDR_RED: 0,
    R1_PDR_RED: 0,
    R1_SDR_YELLOW: 0,
    R1_PDR_YELLOW: 0,
    R1_SDR_GREEN: 0,
    R1_PDR_GREEN: 0,
    R1_SDR_BLUE: 0,
    R1_PDR_BLUE: 0,
  });

  const DEFAULT_INITIAL_WORLD_STATE = Object.freeze({
    asteroidCount: 0,
    rockyPlanetCount: 0,
    gasPlanetCount: 0,
    starCount: 0,
  });

  const CARD_BOOTSTRAP_MAP = Object.freeze({
    R1_DR_RED: { kind: "R1", tier: "DR", colorA: "red" },
    R1_DR_YELLOW: { kind: "R1", tier: "DR", colorA: "yellow" },
    R1_DR_GREEN: { kind: "R1", tier: "DR", colorA: "green" },
    R1_DR_BLUE: { kind: "R1", tier: "DR", colorA: "blue" },
    DS_DR_RED: { kind: "DS", tier: "DR", colorA: "red" },
    DS_DR_YELLOW: { kind: "DS", tier: "DR", colorA: "yellow" },
    DS_DR_GREEN: { kind: "DS", tier: "DR", colorA: "green" },
    DS_DR_BLUE: { kind: "DS", tier: "DR", colorA: "blue" },
    R1_SDR_RED: { kind: "R1", tier: "sDR", colorA: "red" },
    R1_PDR_RED: { kind: "R1", tier: "pDR", colorA: "red" },
    R1_SDR_YELLOW: { kind: "R1", tier: "sDR", colorA: "yellow" },
    R1_PDR_YELLOW: { kind: "R1", tier: "pDR", colorA: "yellow" },
    R1_SDR_GREEN: { kind: "R1", tier: "sDR", colorA: "green" },
    R1_PDR_GREEN: { kind: "R1", tier: "pDR", colorA: "green" },
    R1_SDR_BLUE: { kind: "R1", tier: "sDR", colorA: "blue" },
    R1_PDR_BLUE: { kind: "R1", tier: "pDR", colorA: "blue" },
  });

  function clampInt(value, fallback = 0) {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n) || n < 0) return fallback;
    return n;
  }

  function createDebugConfig(mode, partial = {}) {
    const isDebug = mode === "debug";
    const initialCards = { ...DEFAULT_INITIAL_CARDS, ...(partial.initialCards || {}) };
    const initialWorldState = { ...DEFAULT_INITIAL_WORLD_STATE, ...(partial.initialWorldState || {}) };
    return {
      enabled: isDebug,
      mode: isDebug ? "debug" : "normal",
      loggingEnabled: isDebug,
      batchSizeEvents: clampInt(partial.batchSizeEvents, 20),
      flushIntervalMs: clampInt(partial.flushIntervalMs, 1000),
      includeSnapshots: partial.includeSnapshots !== false,
      logFileStrategy: "single_session_file",
      initialRP: clampInt(partial.initialRP, 0),
      initialCards,
      initialWorldState: {
        asteroidCount: clampInt(initialWorldState.asteroidCount, 0),
        rockyPlanetCount: clampInt(initialWorldState.rockyPlanetCount, 0),
        gasPlanetCount: clampInt(initialWorldState.gasPlanetCount, 0),
        starCount: clampInt(initialWorldState.starCount, 0),
      },
      thresholdOverrides: {
        asteroidToPlanet: partial.thresholdOverrides?.asteroidToPlanet == null ? null : clampInt(partial.thresholdOverrides.asteroidToPlanet, 0),
        planetToStar: partial.thresholdOverrides?.planetToStar == null ? null : clampInt(partial.thresholdOverrides.planetToStar, 0),
      },
    };
  }

  class LocalStorageJsonlBackend {
    constructor(sessionId) {
      this.key = `hc_debug_session_${sessionId}.jsonl`;
      this.metaKey = "hc_debug_latest_session_key";
      this.inMemoryFallback = "";
      try {
        localStorage.setItem(this.metaKey, this.key);
      } catch (_e) {}
    }
    appendLines(lines) {
      if (!lines.length) return;
      const chunk = `${lines.join("\n")}\n`;
      try {
        const prev = localStorage.getItem(this.key) || "";
        localStorage.setItem(this.key, prev + chunk);
      } catch (_e) {
        this.inMemoryFallback += chunk;
      }
    }
  }

  class RuntimeEventLogger {
    constructor(config, sessionId) {
      this.config = config;
      this.sessionId = sessionId;
      this.buffer = [];
      this.frame = 0;
      this.sessionStartedAt = performance.now();
      this.backend = new LocalStorageJsonlBackend(sessionId);
      this.flushTimer = null;
      this.active = false;
    }

    start() {
      if (!this.config.loggingEnabled || this.active) return;
      this.active = true;
      this.flushTimer = setInterval(() => this.flush("interval"), this.config.flushIntervalMs);
    }

    buildSnapshot() {
      const World = window.HC.getWorld ? window.HC.getWorld() : window.World;
      if (!World) return null;
      const sequence = window.CardEngine?.state?.sequence || null;
      const cardBreakdown = {};
      const pool = Array.isArray(World.cardsPool) ? World.cardsPool : [];
      for (const card of pool) {
        if (!card || !card.kind || !card.tier || !card.colorA) continue;
        const key = `${String(card.kind).toUpperCase()}_${String(card.tier)}_${String(card.colorA).toUpperCase()}`;
        cardBreakdown[key] = (cardBreakdown[key] || 0) + 1;
      }
      return {
        rp: Math.max(0, Math.floor(Number(World.score || 0))),
        worldObjects: {
          meteors: Array.isArray(World.meteors) ? World.meteors.length : 0,
          asteroids: Array.isArray(World.asteroids) ? World.asteroids.length : 0,
          planets: Array.isArray(World.planets) ? World.planets.length : 0,
          stars: Array.isArray(World.stars) ? World.stars.length : 0,
          rockyPlanets: Array.isArray(World.planets) ? World.planets.filter((p) => p && p.isRocky).length : 0,
          gasPlanets: Array.isArray(World.planets) ? World.planets.filter((p) => p && !p.isRocky).length : 0,
        },
        sequence: sequence ? {
          active: Boolean(sequence.active),
          track: sequence.track || null,
          stepIndex: Number(sequence.stepIndex || 0),
          stage: sequence.stage || null,
          expectedColor: sequence.expectedColor || null,
          hitCount: Number(sequence.hitCount || sequence.hits || 0),
          chainColors: Array.isArray(sequence.chainColors) ? sequence.chainColors.slice() : [],
          loopMode: sequence.loopMode || null,
          lastResolution: sequence.lastResolution || null,
        } : null,
        cards: {
          total: pool.length,
          temp: Array.isArray(World.cardsTemp) ? World.cardsTemp.length : 0,
          breakdown: cardBreakdown,
        },
        thresholdOverrides: World.__debugThresholdOverrides || null,
      };
    }

    emit(category, type, payload = {}, opts = {}) {
      if (!this.config.loggingEnabled) return;
      const event = {
        id: `${this.sessionId}:${Date.now()}:${Math.random().toString(16).slice(2, 8)}`,
        ts: new Date().toISOString(),
        sessionTimeMs: Math.max(0, Math.floor(performance.now() - this.sessionStartedAt)),
        frame: Number.isFinite(opts.frame) ? opts.frame : this.frame,
        category,
        type,
        severity: opts.severity || "info",
        source: opts.source || "runtime",
        payload: payload && typeof payload === "object" ? payload : {},
      };
      if (this.config.includeSnapshots && opts.snapshot) {
        event.snapshot = this.buildSnapshot();
        this.buffer.push({
          id: `${event.id}:snapshot`,
          ts: new Date().toISOString(),
          sessionTimeMs: event.sessionTimeMs,
          frame: event.frame,
          category: "debug",
          type: EVENT_TYPES.DEBUG_SNAPSHOT_WRITTEN,
          severity: "trace",
          source: opts.source || "runtime",
          payload: { triggerType: type },
        });
      }
      this.buffer.push(event);
      if (this.buffer.length >= this.config.batchSizeEvents) {
        this.flush("batch");
      }
    }

    setFrame(frame) {
      this.frame = frame;
    }

    flush(reason = "manual") {
      if (!this.config.loggingEnabled || !this.buffer.length) return;
      const lines = this.buffer.map((entry) => JSON.stringify(entry));
      this.buffer.length = 0;
      try {
        this.backend.appendLines(lines);
        this.backend.appendLines([
          JSON.stringify({
            ts: new Date().toISOString(),
            category: "debug",
            type: EVENT_TYPES.DEBUG_FLUSH,
            source: "RuntimeEventLogger",
            payload: { reason, count: lines.length }
          })
        ]);
      } catch (err) {
        this.backend.appendLines([
          JSON.stringify({
            ts: new Date().toISOString(),
            category: "debug",
            type: EVENT_TYPES.DEBUG_ERROR,
            severity: "error",
            source: "RuntimeEventLogger",
            payload: { reason: "flush_failed", detail: String(err && err.message ? err.message : err) }
          })
        ]);
      }
    }

    shutdown(reason = "shutdown") {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }
      this.flush(reason);
      this.active = false;
    }
  }

  function randomPosition() {
    const getBounds = window.getWorldViewBounds;
    const b = typeof getBounds === "function" ? getBounds() : { l: 120, r: 900, t: 120, b: 700 };
    return {
      x: b.l + Math.random() * Math.max(1, (b.r - b.l)),
      y: b.t + Math.random() * Math.max(1, (b.b - b.t)),
    };
  }

  function createAsteroidSeed() {
    const p = randomPosition();
    const Rm = typeof window.meteorBaseRadius === "function" ? window.meteorBaseRadius() : 6;
    return {
      type: "asteroid",
      _id: `debug_ast_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      x: p.x,
      y: p.y,
      vx: 0,
      vy: 0,
      r: Rm * (2.8 + Math.random() * 1.6),
      sides: 6,
      angle: Math.random() * Math.PI * 2,
      spin: 0,
      grayLight: 54,
      orbitPx: Rm * 12,
      orbitNativeRadius: Rm * 12,
      orbitCurrentRadius: Rm * 12,
      minOrbitPx: 1.5 * Rm,
      maxOrbitPx: 120.0 * Rm,
      minR: 0.9 * Rm,
      maxR: 80.0 * Rm,
      orbiters: [],
      orbiterMinGapPx: 0.9 * Rm,
      orbiterGapStepPx: 0.7 * Rm,
      captureCooldown: 0,
      captureCount: 0,
      captureSumR: 0,
      captureSumMass: 0,
      liveSumR: 0,
      liveSumMass: 0,
      liveColorCounts: { blue: 0, green: 0, red: 0, yellow: 0 },
      captureColorCounts: { blue: 0, green: 0, red: 0, yellow: 0 },
      cometHits: 0,
      isCollapsing: false,
      collapseT: 0,
      collapseDuration: 0.9,
    };
  }

  function createPlanetSeed(isRocky) {
    const p = randomPosition();
    const Rm = typeof window.meteorBaseRadius === "function" ? window.meteorBaseRadius() : 6;
    const radius = Rm * (7 + Math.random() * 2);
    const gravity = typeof window.computeGravityFromPlanetRadius === "function"
      ? window.computeGravityFromPlanetRadius(radius)
      : radius * 2.2;
    return {
      type: "planet",
      id: `debug_pl_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      x: p.x,
      y: p.y,
      vx: 0,
      vy: 0,
      r: radius,
      mass: radius * radius,
      gravityR: gravity,
      orbitPx: gravity,
      orbitNativeRadius: gravity,
      orbitCurrentRadius: gravity,
      hueA: isRocky ? 25 : 210,
      hueB: isRocky ? 45 : 120,
      fixedR: radius,
      lockRadius: true,
      orbiters: [],
      captureCooldown: 0,
      captureCount: 0,
      captureSumR: 0,
      captureSumMass: 0,
      captureColorCounts: { blue: 0, green: 0, red: 0, yellow: 0 },
      isRocky,
      rockyLocked: Boolean(isRocky),
      rockyForm: isRocky ? { active: false, phase: "done", t: 0, shrinkDur: 0, fadeDur: 0 } : null,
      planetKind: isRocky ? "rocky" : "gas",
      cometHits: isRocky ? 1 : 0,
      rings: [],
    };
  }

  function createStarSeed() {
    const p = randomPosition();
    const Rm = typeof window.meteorBaseRadius === "function" ? window.meteorBaseRadius() : 6;
    const radius = Rm * 14;
    return {
      type: "star",
      id: `debug_st_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      x: p.x,
      y: p.y,
      r: radius,
      mass: radius * radius,
      gravityR: radius * 1.3,
      orbitNativeRadius: radius * 1.3,
      orbitCurrentRadius: radius * 1.3,
      orbiters: [],
      starKind: "normal",
      dominantKey: "yellow",
      monoColorKey: null,
      starBirth: { phase: "done" },
      birth: { active: false, phase: "done", t: 0, duration: 0, fadeOut: 0, timeAbs: 0, absorb: [] },
      baseColor: "yellow",
      shimmer: null,
      sizeClass: "small",
      gradientOuterColor: "yellow",
    };
  }

  const Session = {
    started: false,
    mode: "normal",
    sessionId: null,
    debugConfig: createDebugConfig("normal"),
    logger: null,
    sessionInputConfig: null,
    baseThresholds: null,

    ensureBaseThresholds(World) {
      if (this.baseThresholds || !World) return;
      this.baseThresholds = {
        asteroidToPlanet: Number(World.planetCaptureTarget || 13),
        planetToStar: {
          blue: Number(World.STAR_REQ_BLUE || 30),
          green: Number(World.STAR_REQ_GREEN || 30),
          red: Number(World.STAR_REQ_RED || 30),
          yellow: Number(World.STAR_REQ_YELLOW || 30),
        },
      };
    },

    restoreSessionThresholdDefaults(World) {
      this.ensureBaseThresholds(World);
      if (!World || !this.baseThresholds) return;
      World.planetCaptureTarget = this.baseThresholds.asteroidToPlanet;
      World.STAR_REQ_BLUE = this.baseThresholds.planetToStar.blue;
      World.STAR_REQ_GREEN = this.baseThresholds.planetToStar.green;
      World.STAR_REQ_RED = this.baseThresholds.planetToStar.red;
      World.STAR_REQ_YELLOW = this.baseThresholds.planetToStar.yellow;
      World.__debugThresholdOverrides = null;
    },

    applyThresholdOverrides(World) {
      if (!World) return;
      this.restoreSessionThresholdDefaults(World);
      const overrides = this.debugConfig.thresholdOverrides || {};
      const applied = {};
      if (overrides.asteroidToPlanet != null) {
        World.planetCaptureTarget = clampInt(overrides.asteroidToPlanet, World.planetCaptureTarget);
        applied.asteroidToPlanet = World.planetCaptureTarget;
      }
      if (overrides.planetToStar != null) {
        const next = clampInt(overrides.planetToStar, 0);
        World.STAR_REQ_BLUE = next;
        World.STAR_REQ_GREEN = next;
        World.STAR_REQ_RED = next;
        World.STAR_REQ_YELLOW = next;
        applied.planetToStar = next;
      }
      World.__debugThresholdOverrides = Object.keys(applied).length ? applied : null;
      this.emit("debug", EVENT_TYPES.DEBUG_OVERRIDE_APPLIED, {
        source: "debug panel / session bootstrap",
        section: "thresholdOverrides",
        applied: World.__debugThresholdOverrides || {},
      }, { source: "Session.applyThresholdOverrides" });
      this.emit("debug", EVENT_TYPES.DEBUG_CONFIG_SECTION_APPLIED, {
        section: "thresholdOverrides",
        applied: World.__debugThresholdOverrides || {},
      }, { source: "Session.applyThresholdOverrides" });
    },

    applyInitialRP(World) {
      if (!World) return;
      const before = clampInt(World.score, 0);
      const after = clampInt(this.debugConfig.initialRP, 0);
      World.score = after;
      this.emit("rp", EVENT_TYPES.RP_SET_INITIAL, {
        before,
        after,
        source: "session bootstrap",
      }, { source: "Session.applyInitialRP" });
      this.emit("debug", EVENT_TYPES.DEBUG_CONFIG_SECTION_APPLIED, {
        section: "initialRP",
        value: after,
      }, { source: "Session.applyInitialRP" });
    },

    applyInitialCards(World) {
      if (!World || !window.CardEngine || typeof window.CardEngine.onCardCollected !== "function") return;
      let added = 0;
      const cfg = this.debugConfig.initialCards || {};
      Object.entries(CARD_BOOTSTRAP_MAP).forEach(([key, payload]) => {
        const count = clampInt(cfg[key], 0);
        for (let i = 0; i < count; i++) {
          const entity = window.CardEngine.onCardCollected(payload);
          if (entity) added += 1;
        }
      });
      this.emit("debug", EVENT_TYPES.DEBUG_OVERRIDE_APPLIED, {
        source: "debug panel / session bootstrap",
        section: "initialCards",
        configured: cfg,
        added,
      }, { source: "Session.applyInitialCards" });
      this.emit("debug", EVENT_TYPES.DEBUG_CONFIG_SECTION_APPLIED, {
        section: "initialCards",
        configured: cfg,
        added,
      }, { source: "Session.applyInitialCards" });
    },

    applyInitialWorldState(World) {
      if (!World) return;
      const cfg = this.debugConfig.initialWorldState || DEFAULT_INITIAL_WORLD_STATE;
      const asteroids = clampInt(cfg.asteroidCount, 0);
      const rocky = clampInt(cfg.rockyPlanetCount, 0);
      const gas = clampInt(cfg.gasPlanetCount, 0);
      const stars = clampInt(cfg.starCount, 0);

      for (let i = 0; i < asteroids; i++) {
        const asteroid = createAsteroidSeed();
        World.asteroids.push(asteroid);
        this.emit("world", EVENT_TYPES.WORLD_OBJECT_SPAWNED, { objectType: "asteroid", source: "debug.session.bootstrap" }, { source: "Session.applyInitialWorldState" });
      }
      for (let i = 0; i < rocky; i++) {
        const planet = createPlanetSeed(true);
        World.planets.push(planet);
        this.emit("world", EVENT_TYPES.WORLD_OBJECT_SPAWNED, { objectType: "planet", planetKind: "rocky", source: "debug.session.bootstrap" }, { source: "Session.applyInitialWorldState" });
      }
      for (let i = 0; i < gas; i++) {
        const planet = createPlanetSeed(false);
        World.planets.push(planet);
        this.emit("world", EVENT_TYPES.WORLD_OBJECT_SPAWNED, { objectType: "planet", planetKind: "gas", source: "debug.session.bootstrap" }, { source: "Session.applyInitialWorldState" });
      }
      for (let i = 0; i < stars; i++) {
        const star = createStarSeed();
        World.stars.push(star);
        this.emit("world", EVENT_TYPES.WORLD_OBJECT_SPAWNED, { objectType: "star", source: "debug.session.bootstrap" }, { source: "Session.applyInitialWorldState" });
      }

      this.emit("debug", EVENT_TYPES.DEBUG_CONFIG_SECTION_APPLIED, {
        section: "initialWorldState",
        configured: { asteroidCount: asteroids, rockyPlanetCount: rocky, gasPlanetCount: gas, starCount: stars },
      }, { source: "Session.applyInitialWorldState" });
    },

    applyDebugBootstrap(World) {
      this.applyThresholdOverrides(World);
      this.applyInitialRP(World);
      this.applyInitialCards(World);
      this.applyInitialWorldState(World);
      this.emit("debug", EVENT_TYPES.DEBUG_CONFIG_SECTION_APPLIED, {
        section: "bootstrap_complete",
      }, { source: "Session.applyDebugBootstrap", snapshot: true });
    },

    start(mode, uiConfig = null) {
      this.mode = mode === "debug" ? "debug" : "normal";
      this.sessionInputConfig = uiConfig;
      this.sessionId = `s_${new Date().toISOString().replace(/[:.]/g, "-")}`;
      this.debugConfig = createDebugConfig(this.mode, this.mode === "debug" ? (uiConfig || {}) : {});
      this.logger = new RuntimeEventLogger(this.debugConfig, this.sessionId);
      this.logger.start();
      this.started = true;

      this.emit("session", EVENT_TYPES.SESSION_CONFIG_APPLIED, {
        config: this.debugConfig,
      }, { source: "Session", snapshot: false });

      if (window.HC && typeof window.HC.resetWorld === "function") {
        window.HC.resetWorld();
      } else if (typeof window.resetWorld === "function") {
        window.resetWorld();
      }
      const World = window.HC.getWorld ? window.HC.getWorld() : window.World;

      if (this.mode === "debug") {
        this.applyDebugBootstrap(World);
      } else {
        this.restoreSessionThresholdDefaults(World);
      }

      this.emit("session", EVENT_TYPES.SESSION_STARTED, {
        mode: this.mode,
        sessionId: this.sessionId,
      }, { source: "Session", snapshot: true });

      if (World) World.paused = false;
      if (window.HC.UI && typeof window.HC.UI.applySessionMode === "function") {
        window.HC.UI.applySessionMode(this.mode);
      }
    },

    restart() {
      if (!this.started) return;
      this.emit("session", EVENT_TYPES.SESSION_ENDED, { reason: "restart" }, { source: "Session", snapshot: true });
      this.logger?.shutdown("restart");
      this.start(this.mode, this.sessionInputConfig);
    },

    end(reason = "ended") {
      if (!this.started) return;
      this.emit("session", EVENT_TYPES.SESSION_ENDED, { reason }, { source: "Session", snapshot: true });
      this.logger?.shutdown(reason);
      this.started = false;
    },

    abort(reason = "aborted") {
      if (!this.started) return;
      this.emit("session", EVENT_TYPES.SESSION_ABORTED, { reason }, { source: "Session", snapshot: true, severity: "warn" });
      this.logger?.shutdown(reason);
      this.started = false;
    },

    emit(category, type, payload = {}, opts = {}) {
      if (!this.logger) return;
      this.logger.emit(category, type, payload, opts);
    },

    setFrame(frame) {
      this.logger?.setFrame(frame);
    },

    flush(reason) {
      this.logger?.flush(reason || "manual");
    }
  };

  window.HC.DebugEventTypes = EVENT_TYPES;
  window.HC.createDebugConfig = createDebugConfig;
  window.HC.Session = Session;
  window.HC.logEvent = (category, type, payload, opts) => Session.emit(category, type, payload, opts);

  window.addEventListener("beforeunload", () => Session.abort("beforeunload"));
  window.addEventListener("pagehide", () => Session.flush("pagehide"));
})();
