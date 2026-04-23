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

    SEQUENCE_STARTED: "sequence.started",
    SEQUENCE_STEP_PROGRESS: "sequence.step_progress",
    SEQUENCE_STEP_COMPLETED: "sequence.step_completed",
    SEQUENCE_FAILED: "sequence.failed",
    SEQUENCE_CASHOUT: "sequence.cashout",
    SEQUENCE_R1_ACTIVATED: "sequence.r1_activated",

    CARD_CREATED: "card.created",
    CARD_COLLECTED: "card.collected",
    CARD_ACTIVATED: "card.activated",

    RP_GAINED: "rp.gained",
    RP_SPENT: "rp.spent",

    DEBUG_FLUSH: "debug.flush",
    DEBUG_SNAPSHOT_WRITTEN: "debug.snapshot_written",
    DEBUG_ERROR: "debug.error",
  });

  function createDebugConfig(mode) {
    const isDebug = mode === "debug";
    return {
      enabled: isDebug,
      mode: isDebug ? "debug" : "normal",
      loggingEnabled: isDebug,
      batchSizeEvents: 20,
      flushIntervalMs: 1000,
      includeSnapshots: true,
      logFileStrategy: "single_session_file",
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
      return {
        rp: Math.max(0, Math.floor(Number(World.score || 0))),
        worldObjects: {
          meteors: Array.isArray(World.meteors) ? World.meteors.length : 0,
          asteroids: Array.isArray(World.asteroids) ? World.asteroids.length : 0,
          planets: Array.isArray(World.planets) ? World.planets.length : 0,
          stars: Array.isArray(World.stars) ? World.stars.length : 0,
        },
        sequence: sequence ? {
          active: Boolean(sequence.active),
          track: sequence.track || null,
          stepIndex: Number(sequence.stepIndex || 0),
        } : null,
        cards: {
          total: Array.isArray(World.cardsPool) ? World.cardsPool.length : 0,
          temp: Array.isArray(World.cardsTemp) ? World.cardsTemp.length : 0,
        }
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

  const Session = {
    started: false,
    mode: "normal",
    sessionId: null,
    debugConfig: createDebugConfig("normal"),
    logger: null,

    start(mode) {
      this.mode = mode === "debug" ? "debug" : "normal";
      this.sessionId = `s_${new Date().toISOString().replace(/[:.]/g, "-")}`;
      this.debugConfig = createDebugConfig(this.mode);
      this.logger = new RuntimeEventLogger(this.debugConfig, this.sessionId);
      this.logger.start();
      this.started = true;
      this.emit("session", EVENT_TYPES.SESSION_CONFIG_APPLIED, { config: this.debugConfig }, { source: "Session", snapshot: true });
      this.emit("session", EVENT_TYPES.SESSION_STARTED, { mode: this.mode, sessionId: this.sessionId }, { source: "Session", snapshot: true });
      if (window.HC && typeof window.HC.resetWorld === "function") {
        window.HC.resetWorld();
      } else if (typeof window.resetWorld === "function") {
        window.resetWorld();
      }
      const World = window.HC.getWorld ? window.HC.getWorld() : window.World;
      if (World) World.paused = false;
      if (window.HC.UI && typeof window.HC.UI.applySessionMode === "function") {
        window.HC.UI.applySessionMode(this.mode);
      }
    },

    restart() {
      if (!this.started) return;
      this.emit("session", EVENT_TYPES.SESSION_ENDED, { reason: "restart" }, { source: "Session", snapshot: true });
      this.logger?.shutdown("restart");
      this.start(this.mode);
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
