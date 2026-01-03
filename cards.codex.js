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
      ritual: { targetId: "RITUAL_RELEASE_SINGLE_COLOR" }
    },
    {
      id: "RITUAL_RELEASE_DUAL_COLOR",
      title: "Puszczanie Złączone",
      desc: "Uwolnienie dwóch kolorów jednocześnie.",
      color: "#B28DFF",
      type: "RITUAL",
      ritual: { targetId: "RITUAL_RELEASE_DUAL_COLOR" }
    },
    {
      id: "RITUAL_PDR",
      title: "Przenikające Doświadczenie",
      desc: "Globalna jakość świata spowalniająca eskalację.",
      color: "#FFC857",
      type: "RITUAL",
      ritual: { targetId: "PDR" }
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
    offerH: 120,
    trialW: 320,
    trialH: 150,
    trialGap: 12,
    trialResultMs: 5000,
    pack01TargetDurationMs: 180000,
    trialFailBasePoints: 1,
    trialFailComboMul: 2
  };

  const state = {
    hand: [],
    queue: [],
    activeOffer: null, // { card, offeredAt, expiresAt }

    cooldowns: new Map(), // cardId -> readyAtMs
    memory: { used: new Set(), collected: new Set() },

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

    ui: { enabled: true },

    trialUI: {
      lastState: "idle",
      resultUntilMs: 0,
      resultState: null,
      clicked: false,
      collected: false,
      resultPoints: 0
    },

    subMeta: {
      selectedSlotKey: null
    }
  };

  const PACK01_TRIAL = {
    id: "RITUAL_RELEASE_SINGLE_COLOR",
    title: "Puszczanie (pojedynczy kolor)",
    desc: "Utrzymaj 3× harmonijną kolizję jednego koloru.",
    haiku: [
      "Próżnia ma barwę",
      "Kolor odrywa się od kręgu",
      "I leci poza kadr"
    ]
  };

  const PACK01_COLOR_HEX = {
    red: "#FF5E5E",
    yellow: "#FFD66B",
    green: "#7DFF9A",
    blue: "#7BCBFF"
  };

  const PACK01_COLOR_LABEL = {
    red: "Czerwony",
    yellow: "Żółty",
    green: "Zielony",
    blue: "Niebieski"
  };

  const SUB_META_SLOTS = [
    { key: "forma", label: "Forma" },
    { key: "intencja", label: "Intencja" },
    { key: "czas", label: "Czas" },
    { key: "cisza", label: "Cisza" }
  ];

  const SUB_META_COLORS = ["red", "yellow", "green", "blue"];

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
    if (World.colorStreakKey === undefined) World.colorStreakKey = null;
    if (World.colorStreakCount === undefined) World.colorStreakCount = 0;
    if (World.trialPack01Active === undefined) World.trialPack01Active = false;
    if (World.trialPack01Color === undefined) World.trialPack01Color = null;
    if (World.trialPack01State === undefined) World.trialPack01State = "idle";
    if (!World.collectedCardsByColor) {
      World.collectedCardsByColor = { red: 0, yellow: 0, green: 0, blue: 0 };
    }
    if (!World.metaSlots || typeof World.metaSlots !== "object") {
      World.metaSlots = { forma: null, intencja: null, czas: null, cisza: null };
    } else {
      for (const slot of SUB_META_SLOTS) {
        if (!(slot.key in World.metaSlots)) World.metaSlots[slot.key] = null;
      }
    }
    if (World.subMetaOpen === undefined) World.subMetaOpen = false;
    if (World.subMetaShownThisRun === undefined) World.subMetaShownThisRun = false;
    if (World.paused === undefined) World.paused = false;
    if (World.pack01ReleaseBlockColor === undefined) World.pack01ReleaseBlockColor = null;
    if (World.pack01ReleaseBlockUntilMs === undefined) World.pack01ReleaseBlockUntilMs = 0;

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

    if (!state._trialListenerBound) {
      state._trialListenerBound = true;
      Events.on("METEOR_SAME_COLOR_COLLISION", (payload = {}) => {
        const color = payload.color;
        if (!color || !state.world) return;
        handleTrialColorPick(String(color));
      });
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
    state.timed = [];
    state.ritual = null;
    state.engineStats = {
      meteor_mouse_control: 1.0,
      pointer_radius_mul: 1.0,
      pointer_strength_mul: 1.0,
    };
    state.trialUI = {
      lastState: "idle",
      resultUntilMs: 0,
      resultState: null,
      clicked: false,
      collected: false,
      resultPoints: 0
    };
    state.subMeta = { selectedSlotKey: null };
    if (state.world) bindWorld(state.world);
  }

  function normalizePack01Color(color) {
    if (!color) return null;
    const key = String(color).toLowerCase();
    if (PACK01_COLOR_HEX[key]) return key;
    return null;
  }

  function collectPack01Card(color) {
    const World = state.world;
    const key = normalizePack01Color(color);
    if (!World || !key) return;
    if (!World.collectedCardsByColor) {
      World.collectedCardsByColor = { red: 0, yellow: 0, green: 0, blue: 0 };
    }
    World.collectedCardsByColor[key] = (World.collectedCardsByColor[key] || 0) + 1;
  }

  function activatePack01Target(color) {
    const World = state.world;
    const key = normalizePack01Color(color);
    if (!World || !key) return;
    const t = nowMs();
    World.pack01ReleaseBlockColor = key;
    World.pack01ReleaseBlockUntilMs = t + config.pack01TargetDurationMs;
  }

  function setTrialState(stateName) {
    const World = state.world;
    if (!World) return;
    World.trialPack01State = stateName;
    World.trialPack01Active = stateName === "active";
  }

  function resetTrialToIdle() {
    const World = state.world;
    if (!World) return;
    World.trialPack01State = "idle";
    World.trialPack01Active = false;
    World.trialPack01Color = null;
  }

  function handleTrialColorPick(color) {
    const World = state.world;
    if (!World) return;

    const pickColor = normalizePack01Color(color);
    if (!pickColor) return;

    const prevKey = World.colorStreakKey;
    const prevCount = World.colorStreakCount || 0;

    if (pickColor === prevKey) {
      World.colorStreakCount = prevCount + 1;
    } else {
      if (World.trialPack01State === "active" && prevCount >= 2) {
        setTrialState("fail");
        const basePoints = config.trialFailBasePoints;
        const comboMul = config.trialFailComboMul;
        const finalPoints = Math.max(0, Math.floor(basePoints * comboMul));
        const addScore = window.addScore;
        if (typeof addScore === "function") addScore(finalPoints);
        state.trialUI.resultPoints = finalPoints;
      }
      World.colorStreakKey = pickColor;
      World.colorStreakCount = 1;
    }

    if (World.trialPack01State === "idle" && World.colorStreakCount === 2) {
      World.trialPack01Active = true;
      World.trialPack01Color = pickColor;
      World.trialPack01State = "active";
    }

    if (World.trialPack01State === "active"
      && World.trialPack01Color === pickColor
      && World.colorStreakCount === 3) {
      setTrialState("success");
    }
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

    if (card.type === "RITUAL" && card.ritual) {
      startRitual(card);
      return;
    }
    applyEffects(card.effects || []);
  }

  function update(_dt, now) {
    const t = (typeof now === "number") ? now : nowMs();

    if (state.activeOffer && t >= state.activeOffer.expiresAt) {
      const c = state.activeOffer.card;
      state.memory.collected.add(c.id);
      setCooldown(c);
      state.activeOffer = null;
    }

    if (!state.activeOffer && state.queue.length) {
      const c = state.queue.shift();
      state.activeOffer = { card: c, offeredAt: t, expiresAt: t + c.windowMs };
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

    const World = state.world;
    if (World) {
      const trialState = World.trialPack01State;
      if (trialState !== state.trialUI.lastState) {
        if (trialState === "success" || trialState === "fail") {
          state.trialUI.resultUntilMs = t + config.trialResultMs;
          state.trialUI.resultState = trialState;
          state.trialUI.clicked = false;
          state.trialUI.collected = false;
          if (trialState === "success") state.trialUI.resultPoints = 0;
        }
        state.trialUI.lastState = trialState;
      }

      if (state.trialUI.resultUntilMs && t >= state.trialUI.resultUntilMs) {
        if (state.trialUI.resultState === "success" && !state.trialUI.collected) {
          collectPack01Card(World.trialPack01Color);
          state.trialUI.collected = true;
        }
        state.trialUI.resultUntilMs = 0;
        state.trialUI.resultState = null;
        state.trialUI.resultPoints = 0;
        resetTrialToIdle();
        state.trialUI.lastState = "idle";
      }

      if (World.pack01ReleaseBlockColor
        && t >= (World.pack01ReleaseBlockUntilMs || 0)) {
        World.pack01ReleaseBlockColor = null;
      }
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
    if (state.activeOffer) {
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

    renderTrialPack01(ctx, screenW, screenH);
    renderPack01Collection(ctx, screenW, screenH);
    renderSubMetaOverlay(ctx, screenW, screenH);
  }

  function getTrialRect(screenW) {
    const w = config.trialW;
    const h = config.trialH;
    const x = Math.floor(screenW - w - config.offerXPad);
    const y = Math.floor(config.offerYPad + (state.activeOffer ? (config.offerH + config.trialGap) : 0));
    return { x, y, w, h };
  }

  function renderTrialPack01(ctx, screenW, screenH) {
    const World = state.world;
    if (!World) return;

    const now = nowMs();
    const showResult = state.trialUI.resultUntilMs && now <= state.trialUI.resultUntilMs;
    const active = World.trialPack01State === "active";
    if (!active && !showResult) return;

    const trialColor = normalizePack01Color(World.trialPack01Color);
    const colorHex = (trialColor && PACK01_COLOR_HEX[trialColor]) || "#FFFFFF";
    const colorLabel = (trialColor && PACK01_COLOR_LABEL[trialColor]) || "—";

    const { x, y, w, h } = getTrialRect(screenW);

    ctx.save();
    ctx.textAlign = "left";
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(18,18,18,0.9)";
    ctx.fillRect(x, y, w, h);

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "14px system-ui";
    if (active) {
      ctx.fillText(`TRIAL · ${PACK01_TRIAL.title}`, x + 12, y + 24);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("2× ten sam kolor uruchamia. 3× kończy.", x + 12, y + 44);
      ctx.fillText(`Kolor: ${colorLabel}`, x + 12, y + 64);
      ctx.fillStyle = colorHex;
      ctx.fillRect(x + 12, y + h - 24, 54, 6);
    } else if (showResult) {
      const isSuccess = state.trialUI.resultState === "success";
      if (isSuccess) {
        ctx.fillText("SUKCES", x + 12, y + 24);
      } else {
        ctx.fillText("Nie udało się — combo x2", x + 12, y + 24);
      }
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`Kolor: ${colorLabel}`, x + 12, y + 44);

      if (isSuccess) {
        ctx.fillStyle = "rgba(255,255,255,0.78)";
        ctx.fillText(PACK01_TRIAL.haiku[0], x + 12, y + 70);
        ctx.fillText(PACK01_TRIAL.haiku[1], x + 12, y + 88);
        ctx.fillText(PACK01_TRIAL.haiku[2], x + 12, y + 106);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        const hint = state.trialUI.clicked ? "Nagroda aktywna." : "Kliknij, aby aktywować efekt.";
        ctx.fillText(hint, x + 12, y + h - 18);
      } else {
        const points = Math.max(0, Math.floor(state.trialUI.resultPoints || 0));
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(`+${points} pkt`, x + 12, y + 70);
      }

      ctx.fillStyle = colorHex;
      ctx.fillRect(x + 12, y + h - 30, 54, 6);
    }

    ctx.restore();
  }

  function renderPack01Collection(ctx, screenW, screenH) {
    const World = state.world;
    if (!World || !World.collectedCardsByColor) return;

    const order = ["red", "yellow", "green", "blue"];
    const pad = 12;
    const rectW = 10;
    const rectH = 24;
    const gap = 14;
    const x = Math.floor(screenW - pad - rectW);
    const y0 = Math.floor(pad + 6);

    ctx.save();
    ctx.font = "11px system-ui";
    ctx.textAlign = "right";
    for (let i = 0; i < order.length; i++) {
      const key = order[i];
      const count = World.collectedCardsByColor[key] || 0;
      const y = y0 + i * (rectH + gap);
      if (count > 0) {
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = PACK01_COLOR_HEX[key];
        ctx.fillRect(x, y, rectW, rectH);
      } else {
        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(x, y, rectW, rectH);
      }
      if (count > 1) {
        ctx.globalAlpha = 0.85;
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.strokeText(String(count), x - 4, y + rectH - 2);
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillText(String(count), x - 4, y + rectH - 2);
      }
    }
    ctx.restore();
  }

  function closeSubMeta(World) {
    if (!World) return;
    World.subMetaOpen = false;
    World.paused = false;
    state.subMeta.selectedSlotKey = null;
  }

  function assignSubMetaSlot(World, slotKey, assignment) {
    if (!World || !World.metaSlots || !assignment) return;
    const colorKey = assignment.color;
    if (!colorKey) return;
    const counts = World.collectedCardsByColor || {};
    const available = counts[colorKey] || 0;
    if (available <= 0) return;

    const prev = World.metaSlots[slotKey];
    if (prev && prev.color) {
      counts[prev.color] = (counts[prev.color] || 0) + 1;
    }
    counts[colorKey] = Math.max(0, available - 1);
    World.metaSlots[slotKey] = assignment;
  }

  function getSubMetaLayout(screenW, screenH) {
    const panelW = Math.min(560, Math.floor(screenW * 0.88));
    const panelH = Math.min(360, Math.floor(screenH * 0.8));
    const panelX = Math.floor((screenW - panelW) / 2);
    const panelY = Math.floor((screenH - panelH) / 2);
    const pad = 20;
    const headerH = 26;
    const columnGap = 26;
    const columnW = Math.floor((panelW - pad * 2 - columnGap) / 2);
    const leftX = panelX + pad;
    const rightX = leftX + columnW + columnGap;
    const columnTop = panelY + pad + headerH;
    const slotH = 44;
    const slotGap = 10;
    const slots = SUB_META_SLOTS.map((slot, index) => ({
      ...slot,
      x: leftX,
      y: columnTop + index * (slotH + slotGap),
      w: columnW,
      h: slotH
    }));
    const pickerTop = columnTop + SUB_META_SLOTS.length * (slotH + slotGap) + 6;
    const pickerItemH = 32;
    const pickerGap = 8;
    const picker = {
      x: leftX,
      y: pickerTop,
      w: columnW,
      h: pickerItemH,
      gap: pickerGap,
      itemH: pickerItemH
    };
    const cardH = 36;
    const cardGap = 10;
    const cards = SUB_META_COLORS.map((color, index) => ({
      color,
      x: rightX,
      y: columnTop + index * (cardH + cardGap),
      w: columnW,
      h: cardH
    }));
    const closeW = 92;
    const closeH = 28;
    const closeButton = {
      x: panelX + panelW - pad - closeW,
      y: panelY + panelH - pad - closeH,
      w: closeW,
      h: closeH
    };
    return {
      panel: { x: panelX, y: panelY, w: panelW, h: panelH },
      pad,
      headerY: panelY + pad + 12,
      columnW,
      slots,
      picker,
      cards,
      closeButton
    };
  }

  function renderSubMetaOverlay(ctx, screenW, screenH) {
    const World = state.world;
    if (!World || !World.subMetaOpen) return;

    const layout = getSubMetaLayout(screenW, screenH);
    const { panel, pad, headerY, slots, picker, cards, closeButton, columnW } = layout;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, screenW, screenH);

    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "rgba(20,20,20,0.92)";
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);

    ctx.font = "14px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.fillText("SUB-META", panel.x + pad, headerY);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText("Sloty meta", panel.x + pad, headerY + 18);
    ctx.fillText("Wolne karty", panel.x + pad + columnW + 26, headerY + 18);

    for (const slot of slots) {
      const isSelected = state.subMeta.selectedSlotKey === slot.key;
      const assignment = World.metaSlots?.[slot.key];
      if (assignment) {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
      } else {
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
      }
      if (isSelected) {
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 2;
        ctx.strokeRect(slot.x + 1, slot.y + 1, slot.w - 2, slot.h - 2);
        ctx.lineWidth = 1;
      }

      if (assignment) {
        const colorHex = PACK01_COLOR_HEX[assignment.color] || "#FFFFFF";
        ctx.fillStyle = colorHex;
        ctx.fillRect(slot.x + 10, slot.y + slot.h / 2 - 6, 12, 12);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillText("R1", slot.x + 30, slot.y + slot.h / 2 + 5);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(slot.label, slot.x + 60, slot.y + slot.h / 2 + 5);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(slot.label, slot.x + 12, slot.y + slot.h / 2 + 5);
      }
    }

    if (state.subMeta.selectedSlotKey) {
      const available = SUB_META_COLORS.filter((color) => (World.collectedCardsByColor?.[color] || 0) > 0);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("Wybierz:", picker.x, picker.y - 6);
      available.forEach((color, index) => {
        const y = picker.y + index * (picker.itemH + picker.gap);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(picker.x, y, picker.w, picker.itemH);
        const colorHex = PACK01_COLOR_HEX[color] || "#FFFFFF";
        ctx.fillStyle = colorHex;
        ctx.fillRect(picker.x + 10, y + picker.itemH / 2 - 6, 12, 12);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        const label = PACK01_COLOR_LABEL[color] || color;
        const count = World.collectedCardsByColor?.[color] || 0;
        ctx.fillText(`R1 · ${label}`, picker.x + 30, y + picker.itemH / 2 + 5);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText(`×${count}`, picker.x + picker.w - 34, y + picker.itemH / 2 + 5);
      });
    }

    for (const card of cards) {
      const count = World.collectedCardsByColor?.[card.color] || 0;
      const colorHex = PACK01_COLOR_HEX[card.color] || "#FFFFFF";
      ctx.globalAlpha = count > 0 ? 1.0 : 0.35;
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.fillRect(card.x, card.y, card.w, card.h);
      ctx.fillStyle = colorHex;
      ctx.fillRect(card.x + 10, card.y + card.h / 2 - 8, 16, 16);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillText(PACK01_COLOR_LABEL[card.color] || card.color, card.x + 34, card.y + card.h / 2 + 5);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`×${count}`, card.x + card.w - 28, card.y + card.h / 2 + 5);
      ctx.globalAlpha = 1.0;
    }

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(closeButton.x, closeButton.y, closeButton.w, closeButton.h);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.strokeRect(closeButton.x, closeButton.y, closeButton.w, closeButton.h);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText("Wróć", closeButton.x + 24, closeButton.y + 19);

    ctx.restore();
  }

  function handleSubMetaPointerDown(mx, my, screenW, screenH) {
    const World = state.world;
    if (!World || !World.subMetaOpen) return false;

    const layout = getSubMetaLayout(screenW, screenH);
    const { panel, slots, picker, closeButton } = layout;

    if (mx >= closeButton.x && mx <= closeButton.x + closeButton.w
      && my >= closeButton.y && my <= closeButton.y + closeButton.h) {
      closeSubMeta(World);
      return true;
    }

    if (mx >= panel.x && mx <= panel.x + panel.w && my >= panel.y && my <= panel.y + panel.h) {
      for (const slot of slots) {
        if (mx >= slot.x && mx <= slot.x + slot.w && my >= slot.y && my <= slot.y + slot.h) {
          state.subMeta.selectedSlotKey = slot.key;
          return true;
        }
      }

      if (state.subMeta.selectedSlotKey) {
        const available = SUB_META_COLORS.filter((color) => (World.collectedCardsByColor?.[color] || 0) > 0);
        for (let i = 0; i < available.length; i++) {
          const color = available[i];
          const y = picker.y + i * (picker.itemH + picker.gap);
          if (mx >= picker.x && mx <= picker.x + picker.w && my >= y && my <= y + picker.itemH) {
            assignSubMetaSlot(World, state.subMeta.selectedSlotKey, { kind: "R1", color });
            return true;
          }
        }
      }
      return true;
    }

    return true;
  }

  function handlePointerDown(mx, my, screenW, screenH) {
    const World = state.world;
    if (World && World.subMetaOpen) {
      return handleSubMetaPointerDown(mx, my, screenW, screenH);
    }

    if (state.activeOffer) {
      const w = config.offerW, h = config.offerH;
      const x = Math.floor(screenW - w - config.offerXPad);
      const y = Math.floor(config.offerYPad);

      const inside = mx >= x && mx <= x + w && my >= y && my <= y + h;
      if (inside) {
        const c = state.activeOffer.card;
        useCard(c);
        state.activeOffer = null;
        return true;
      }
    }

    return handleTrialPointerDown(mx, my, screenW, screenH);
  }

  function handleTrialPointerDown(mx, my, screenW, screenH) {
    const World = state.world;
    if (!World) return false;

    const now = nowMs();
    const showResult = state.trialUI.resultUntilMs && now <= state.trialUI.resultUntilMs;
    if (!showResult || state.trialUI.resultState !== "success") return false;

    const { x, y, w, h } = getTrialRect(screenW);
    const inside = mx >= x && mx <= x + w && my >= y && my <= y + h;
    if (!inside) return false;

    if (!state.trialUI.collected) {
      collectPack01Card(World.trialPack01Color);
      state.trialUI.collected = true;
    }
    if (!state.trialUI.clicked) {
      activatePack01Target(World.trialPack01Color);
      state.trialUI.clicked = true;
    }
    return true;
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

    // Hooks for future systems
    onRitualTrigger,
    openResetCardHub,
  };
})();

if (typeof window !== "undefined") {
  // expose globally for boot + modules
  window.CardEngine = window.CardEngine || CardEngine;
}
