console.log("[HC] cards.codex.js loaded");
/* =========================================================
   Haiku Cosmos — cards.codex.js
   Stage 1: single source of truth for CardEngine + Card UI
   - No random dealing
   - No preset packs
   - Hooks only (dead but technically complete)
   ========================================================= */

/* =========================
   1) EVENT BUS (shared with game.codex.js)
   ========================= */
var Events = (typeof window !== "undefined" && window.Events)
  ? window.Events
  : (() => {
    const listeners = Object.create(null);
    function on(eventName, fn) {
      if (!listeners[eventName]) listeners[eventName] = new Set();
      listeners[eventName].add(fn);
      return () => listeners[eventName].delete(fn);
    }
    function emit(eventName, payload = {}) {
      const set = listeners[eventName];
      if (!set) return;
      for (const fn of set) fn(payload);
    }
    return { on, emit };
  })();

if (typeof window !== "undefined") {
  window.Events = window.Events || Events;
}

/* =========================
   2) CARD ENGINE + UI
   ========================= */
const CardEngine = (() => {
  const CARD_DEFS = [
    {
      id: "RITUAL_RELEASE_SINGLE_COLOR",
      title: "Puszczanie (pojedynczy kolor)",
      desc: "Uwolnienie materii jednego koloru z logiki orbit.",
      color: "#7BDFF2",
      type: "RITUAL",
      ritual: {
        targetId: "COLOR_SINGLE",
        durationMs: 180000
      }
    }
  ];

  function normalizeCard(raw) {
    if (!raw || typeof raw !== "object") return null;
    if (!raw.id || !raw.title) return null;
    return {
      id: String(raw.id),
      title: String(raw.title),
      desc: String(raw.desc || ""),
      color: String(raw.color || "#FFFFFF"),
      type: raw.type || "DIRECT",
      rarity: raw.rarity || "COMMON",
      windowMs: clampInt(raw.windowMs ?? 4500, 1000, 20000),
      cooldownMs: clampInt(raw.cooldownMs ?? 10000, 0, 600000),
      tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
      ui: raw.ui && typeof raw.ui === "object" ? raw.ui : {},
      effects: Array.isArray(raw.effects) ? raw.effects : [],
      ritual: raw.ritual && typeof raw.ritual === "object" ? raw.ritual : null
    };
  }

  function normalizePack(json) {
    const pack = { version: Number(json?.version ?? 1), cards: [] };
    const arr = Array.isArray(json?.cards) ? json.cards : [];
    for (const raw of arr) {
      const c = normalizeCard(raw);
      if (c) pack.cards.push(c);
    }
    return pack;
  }

  const PACK = normalizePack({ version: 1, cards: CARD_DEFS });

  const config = {
    offerXPad: 18,
    // UI: push card panel below top HUD (meteor rate slider/value)
    offerYPad: 64,
    offerW: 320,
    offerH: 120
  };

  const state = {
    hand: [],
    queue: [],
    activeOffer: null, // { card, offeredAt, expiresAt }

    cooldowns: new Map(), // cardId -> readyAtMs
    memory: { used: new Set(), collected: new Set() },
    collection: new Map(),

    timed: [], // { endsAtMs, restoreFn }
    ritual: null, // { card, endsAtMs, failed }

    // tunables used by game code (already referenced elsewhere)
    engineStats: {
      meteor_mouse_control: 1.0,
      pointer_radius_mul: 1.0,
      pointer_strength_mul: 1.0,
    },

    world: null,
    targets: new Map(),

    targetLibrary: [],
    targetMeta: new Map(),

    ui: { enabled: true }
  };

  function clampInt(v, a, b) {
    v = Number(v);
    if (!Number.isFinite(v)) v = a;
    v = Math.floor(v);
    return Math.max(a, Math.min(b, v));
  }
  function clampNum(v, a, b) {
    v = Number(v);
    if (!Number.isFinite(v)) return a;
    return Math.max(a, Math.min(b, v));
  }
  function clamp01(x) {
    x = Number(x);
    if (!Number.isFinite(x)) return 0;
    return Math.max(0, Math.min(1, x));
  }

  function bindWorld(World) {
    state.world = World;

    if (World.spawnIntervalMul === undefined) World.spawnIntervalMul = 1.0;
    if (World.score === undefined) World.score = 0;

    state.targets = new Map();
    state.targetLibrary = [];
    state.targetMeta = new Map();

    function addTarget(id, meta, access) {
      state.targets.set(id, access);
      const m = {
        id,
        label: meta.label || id,
        group: meta.group || "misc",
        desc: meta.desc || "",
        kind: meta.kind || "number",
        min: meta.min,
        max: meta.max,
        step: meta.step,
        unit: meta.unit || "",
      };
      state.targetLibrary.push(m);
      state.targetMeta.set(id, m);
    }

    addTarget(
      "engine.meteor_mouse_control",
      { label: "Meteor mouse control", group: "engine", desc: "Sterowanie meteorami myszą (1=domyślnie).", kind: "number", min: 0.1, max: 3.0, step: 0.05 },
      {
        get: () => state.engineStats.meteor_mouse_control,
        set: (v) => { state.engineStats.meteor_mouse_control = clampNum(v, 0.1, 3.0); }
      }
    );

    addTarget(
      "engine.pointer_radius_mul",
      { label: "Pointer radius ×", group: "engine", desc: "Mnożnik promienia ring-u kursora.", kind: "number", min: 0.4, max: 3.0, step: 0.05 },
      {
        get: () => state.engineStats.pointer_radius_mul,
        set: (v) => { state.engineStats.pointer_radius_mul = clampNum(v, 0.4, 3.0); }
      }
    );

    addTarget(
      "engine.pointer_strength_mul",
      { label: "Pointer strength ×", group: "engine", desc: "Mnożnik siły przyciągania kursora.", kind: "number", min: 0.2, max: 4.0, step: 0.05 },
      {
        get: () => state.engineStats.pointer_strength_mul,
        set: (v) => { state.engineStats.pointer_strength_mul = clampNum(v, 0.2, 4.0); }
      }
    );

    addTarget(
      "world.spawn_interval_mul",
      { label: "Spawn interval ×", group: "spawn", desc: "Mnożnik odstępu spawnu meteorów (większe = mniej meteorów).", kind: "number", min: 0.25, max: 6.0, step: 0.05 },
      {
        get: () => World.spawnIntervalMul,
        set: (v) => { World.spawnIntervalMul = clampNum(v, 0.25, 6.0); }
      }
    );

    addTarget(
      "world.spawn_interval_sec",
      { label: "Spawn interval (s)", group: "spawn", desc: "Bezpośrednio ustawia World.spawnInterval (s). Slider w UI nadal działa.", kind: "number", min: 0.02, max: 2.5, step: 0.01 },
      {
        get: () => World.spawnInterval,
        set: (v) => { World.spawnInterval = clampNum(v, 0.02, 2.5); }
      }
    );

    addTarget(
      "world.max_meteors",
      { label: "Max meteors", group: "spawn", desc: "Limit meteorów na ekranie.", kind: "number", min: 10, max: 240, step: 1 },
      {
        get: () => World.maxMeteors,
        set: (v) => { World.maxMeteors = clampInt(v, 10, 240); }
      }
    );

    addTarget(
      "world.pointer_radius",
      { label: "Pointer radius (base)", group: "pointer", desc: "Bazowy promień ring-u (przed mnożnikiem z kart).", kind: "number", min: 0.05, max: 0.75, step: 0.005 },
      {
        get: () => World.pointerRadius,
        set: (v) => { World.pointerRadius = clampNum(v, 0.05, 0.75); }
      }
    );

    addTarget(
      "world.pointer_strength",
      { label: "Pointer strength (base)", group: "pointer", desc: "Bazowa siła przyciągania (przed mnożnikiem z kart).", kind: "number", min: 0.2, max: 4.0, step: 0.01 },
      {
        get: () => World.pointerStrength,
        set: (v) => { World.pointerStrength = clampNum(v, 0.2, 4.0); }
      }
    );

    addTarget(
      "world.pointer_glue_damp",
      { label: "Pointer glue damp", group: "pointer", desc: "Tłumienie prędkości w ring-u (klejenie).", kind: "number", min: 0.0, max: 0.6, step: 0.01 },
      {
        get: () => World.pointerGlueDamp,
        set: (v) => { World.pointerGlueDamp = clampNum(v, 0.0, 0.6); }
      }
    );

    addTarget(
      "world.meteor_collision_fudge",
      { label: "Meteor collision fudge", group: "collision", desc: "Ułatwienie trafienia w kolizjach meteorów (1=real).", kind: "number", min: 1.0, max: 1.25, step: 0.005 },
      {
        get: () => World.meteorCollisionFudge,
        set: (v) => { World.meteorCollisionFudge = clampNum(v, 1.0, 1.25); }
      }
    );

    addTarget(
      "world.asteroid_drift_mul",
      { label: "Asteroid drift ×", group: "asteroids", desc: "Mnożnik driftu asteroid (mniejsze = spokojniej).", kind: "number", min: 0.1, max: 2.0, step: 0.01 },
      {
        get: () => World.asteroidDriftMul,
        set: (v) => { World.asteroidDriftMul = clampNum(v, 0.1, 2.0); }
      }
    );

    addTarget(
      "world.planet_capture_target",
      { label: "Planet capture target", group: "planets", desc: "Docelowa liczba meteorów do przejścia etapu/capture (wg Twojej logiki).", kind: "number", min: 3, max: 60, step: 1 },
      {
        get: () => World.planetCaptureTarget,
        set: (v) => { World.planetCaptureTarget = clampInt(v, 3, 60); }
      }
    );

    addTarget(
      "world.score",
      { label: "Score", group: "meta", desc: "Punkty runu.", kind: "number", min: 0, max: 999999, step: 1 },
      {
        get: () => World.score,
        set: (v) => { World.score = Math.max(0, Math.floor(Number(v) || 0)); }
      }
    );

    const CometsAPI = (typeof window !== "undefined") ? window.Comets : null;
    if (CometsAPI && CometsAPI.CONFIG) {
      addTarget(
        "comets.enabled",
        { label: "Comets enabled", group: "comets", desc: "Włącza/wyłącza system komet.", kind: "bool" },
        {
          get: () => !!CometsAPI.CONFIG.enabled,
          set: (v) => { CometsAPI.CONFIG.enabled = !!v; }
        }
      );

      addTarget(
        "comets.spawn_time_min",
        { label: "Comet spawn time min", group: "comets", desc: "Minimalny czas do spawnu komety.", kind: "number", min: 0.2, max: 180, step: 0.1, unit: "s" },
        {
          get: () => CometsAPI.CONFIG.spawn.timeRangeSec[0],
          set: (v) => { CometsAPI.CONFIG.spawn.timeRangeSec[0] = clampNum(v, 0.2, 180); }
        }
      );

      addTarget(
        "comets.spawn_time_max",
        { label: "Comet spawn time max", group: "comets", desc: "Maksymalny czas do spawnu komety.", kind: "number", min: 0.2, max: 300, step: 0.1, unit: "s" },
        {
          get: () => CometsAPI.CONFIG.spawn.timeRangeSec[1],
          set: (v) => { CometsAPI.CONFIG.spawn.timeRangeSec[1] = clampNum(v, 0.2, 300); }
        }
      );

      addTarget(
        "comets.tail_len_mul",
        { label: "Comet tail length ×", group: "comets", desc: "Mnożnik długości ogona (wizualny).", kind: "number", min: 1.0, max: 10.0, step: 0.1 },
        {
          get: () => CometsAPI.CONFIG.tail.baseLenMul,
          set: (v) => { CometsAPI.CONFIG.tail.baseLenMul = clampNum(v, 1.0, 10.0); }
        }
      );

      addTarget(
        "comets.trigger_shower",
        { label: "Trigger comet shower", group: "comets", desc: "Wyzwala zdarzenie: COMET_SHOWER (akcja).", kind: "action" },
        {
          get: () => 0,
          set: (_v) => { try { Events.emit("COMET_SHOWER", { durationMs: 12000 }); } catch (e) {} }
        }
      );
    }
  }

  function nowMs() {
    return (state.world && state.world.nowMs) ? state.world.nowMs : performance.now();
  }

  function isOnCooldown(cardId, t) {
    const readyAt = state.cooldowns.get(cardId) ?? 0;
    return t < readyAt;
  }

  function setCooldown(card) {
    const t = nowMs();
    state.cooldowns.set(card.id, t + (card.cooldownMs || 0));
  }

  function enqueueOffer(card) {
    const t = nowMs();
    if (isOnCooldown(card.id, t)) return false;
    state.queue.push(card);
    return true;
  }

  function offerCardById(cardId) {
    const base = PACK.cards.find((c) => c.id === cardId);
    if (!base) return false;
    const clone = (typeof structuredClone === "function")
      ? structuredClone(base)
      : JSON.parse(JSON.stringify(base));
    clone._instanceId = `${clone.id}::${Math.random().toString(16).slice(2)}`;
    return enqueueOffer(clone);
  }

  function resetForNewRun() {
    state.hand = [];
    state.queue = [];
    state.activeOffer = null;
    state.cooldowns = new Map();
    state.memory = { used: new Set(), collected: new Set() };
    state.collection = new Map();
    state.timed = [];
    state.ritual = null;
    state.engineStats = {
      meteor_mouse_control: 1.0,
      pointer_radius_mul: 1.0,
      pointer_strength_mul: 1.0,
    };
    if (state.world) bindWorld(state.world);
    state.testOffer = {
      armed: true,
      offered: false,
      atMs: nowMs() + 12000,
      cardId: CARD_DEFS[0]?.id || null,
    };
  }

  function applyOp(before, op, value) {
    const b = Number(before);
    const v = Number(value);
    if (!Number.isFinite(b) || !Number.isFinite(v)) return before;
    if (op === "SET") return v;
    if (op === "ADD") return b + v;
    if (op === "MUL") return b * v;
    return before;
  }

  function applyEffects(effects) {
    const t = nowMs();
    for (const ef of effects) {
      const op = ef?.op;
      const target = ef?.target;
      const value = ef?.value;
      const dur = Number(ef?.durationMs || 0);

      const access = state.targets.get(target);
      if (!access) continue;

      const before = access.get();
      const after = applyOp(before, op, value);

      if (dur > 0) {
        access.set(after);
        const restoreFn = () => access.set(before);
        state.timed.push({ endsAtMs: t + dur, restoreFn });
      } else {
        access.set(after);
      }
    }
  }

  function startRitual(card) {
    const dur = Math.max(1000, Number(card?.ritual?.durationMs || 8000));
    state.ritual = { card, endsAtMs: nowMs() + dur, failed: false };
  }

  function useCard(card) {
    state.memory.used.add(card.id);
    setCooldown(card);

    Events.emit("CARD_USED", { id: card.id, card });
    if (!card.effects?.length && (!card.ritual || !card.ritual.onComplete?.length)) {
      console.log(`[HC] Card used (placeholder): ${card.id}`);
    }

    if (card.type === "RITUAL" && card.ritual) {
      startRitual(card);
      return;
    }
    applyEffects(card.effects || []);
  }

  function collectCard(card) {
    const prev = state.collection.get(card.id) || 0;
    state.collection.set(card.id, prev + 1);
    state.memory.collected.add(card.id);
    setCooldown(card);
    Events.emit("CARD_COLLECTED", { id: card.id, card, count: prev + 1 });
    console.log(`[HC] Card collected: ${card.id} (x${prev + 1})`);
  }

  function update(_dt, now) {
    const t = (typeof now === "number") ? now : nowMs();

    if (state.activeOffer && t >= state.activeOffer.expiresAt) {
      const c = state.activeOffer.card;
      collectCard(c);
      state.activeOffer = null;
    }

    if (!state.activeOffer && state.queue.length) {
      const c = state.queue.shift();
      state.activeOffer = { card: c, offeredAt: t, expiresAt: t + c.windowMs };
    }

    if (state.testOffer?.armed && !state.testOffer.offered && state.testOffer.cardId && t >= state.testOffer.atMs) {
      if (offerCardById(state.testOffer.cardId)) {
        state.testOffer.offered = true;
      }
    }

    for (let i = state.timed.length - 1; i >= 0; i--) {
      const e = state.timed[i];
      if (t >= e.endsAtMs) {
        if (e.restoreFn) e.restoreFn();
        state.timed.splice(i, 1);
      }
    }

    if (state.ritual && t >= state.ritual.endsAtMs) {
      const r = state.ritual;
      if (!r.failed) applyEffects(r.card.ritual?.onComplete || []);
      else applyEffects(r.card.ritual?.onFail || []);
      state.ritual = null;
    }
  }

  function getOfferProgress01() {
    if (!state.activeOffer) return 0;
    const t = nowMs();
    const { offeredAt, expiresAt } = state.activeOffer;
    return clamp01((t - offeredAt) / Math.max(1, (expiresAt - offeredAt)));
  }

  function render(ctx, screenW, screenH) {
    if (!state.ui.enabled) return;
    if (!state.activeOffer) return;

    const card = state.activeOffer.card;
    const p = getOfferProgress01();

    const w = config.offerW, h = config.offerH;
    const x = Math.floor(screenW - w - config.offerXPad);
    const y = Math.floor(config.offerYPad);

    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "rgba(18,18,18,0.88)";
    ctx.fillRect(x, y, w, h);

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(card.title, x + 12, y + 26);

    ctx.fillStyle = "rgba(255,255,255,0.72)";
    if (card.desc) ctx.fillText(card.desc, x + 12, y + 48);

    ctx.fillStyle = card.color || "#FFFFFF";
    ctx.fillRect(x + 12, y + h - 24, 48, 6);

    ctx.fillStyle = "rgba(255,255,255,0.9)";
    if (card.type) ctx.fillText(card.type, x + 70, y + h - 18);

    const barW = Math.floor((1 - p) * (w - 24));
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(x + 12, y + h - 12, barW, 4);

    if (state.ritual) {
      const left = Math.max(0, state.ritual.endsAtMs - nowMs());
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText(`Rytuał: ${(left / 1000).toFixed(1)}s`, x + 12, y + h - 34);
    }

    ctx.restore();
  }

  function handlePointerDown(mx, my, screenW, screenH) {
    if (!state.activeOffer) return false;

    const w = config.offerW, h = config.offerH;
    const x = Math.floor(screenW - w - config.offerXPad);
    const y = Math.floor(config.offerYPad);

    const inside = mx >= x && mx <= x + w && my >= y && my <= y + h;
    if (!inside) return false;

    const c = state.activeOffer.card;
    useCard(c);
    state.activeOffer = null;
    return true;
  }

  function debugOfferFirstPack01Card() {
    const cardId = CARD_DEFS[0]?.id;
    if (!cardId) return false;
    return offerCardById(cardId);
  }

  // ---- HOOKS (Stage 1 placeholders) ----
  function onRitualTrigger(_payload) {
    // TODO: hook for ritual triggers (e.g. harmonic collisions)
  }

  function openResetCardHub() {
    // TODO: hook for mini-hub on RESET
  }

  return {
    config,
    state,
    bindWorld,

    getTargetLibrary: () => state.targetLibrary.slice(),
    getTargetMeta: (id) => state.targetMeta.get(id) || null,

    resetForNewRun,
    offerCardById,
    update,
    render,
    handlePointerDown,
    collectCard,
    debugOfferFirstPack01Card,

    // Hooks for future systems
    onRitualTrigger,
    openResetCardHub,
  };
})();

if (typeof window !== "undefined") {
  // expose globally for boot + modules
  window.CardEngine = window.CardEngine || CardEngine;
  window.HC = window.HC || {};
  window.HC.Cards = window.HC.Cards || {};
  window.HC.Cards.debugOfferFirstPack01Card = function debugOfferFirstPack01Card() {
    return CardEngine.debugOfferFirstPack01Card();
  };
}
