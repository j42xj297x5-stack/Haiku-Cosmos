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
      selectedSlotKey: null,
      selectedCardKey: null,
      selectedForge: null,
      showRemoveForSlotKey: null
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
  const SUB_META_TIERS = ["DR", "sDR", "pDR"];
  const SUB_META_R2_PAIRS = [
    ["red", "yellow"],
    ["red", "green"],
    ["red", "blue"],
    ["yellow", "green"],
    ["yellow", "blue"],
    ["green", "blue"]
  ];
  const SUB_META_ASSIGN_COST = 10;
  const SUB_META_FORGE_COSTS = { sDR: 10, pDR: 20 };
  const SUB_META_FORGE_CONSUMES = { sDR: 3, pDR: 9 };
  const SUB_META_SCALE = 1.0;
  const SUB_META_CARD_W = 20;
  const SUB_META_CARD_H = 26;
  const SUB_META_CARD_GAP_X = 12;
  const SUB_META_CARD_GAP_Y = 10;
  const SUB_META_COUNT_PAD = 8;
  const SUB_META_SLOT_COLORS = {
    forma: "red",
    intencja: "yellow",
    czas: "green",
    cisza: "blue"
  };
  const SUB_META_META_EFFECTS = {
    forma: {
      DR: ["Planetoidy + planety: orbity -15%."],
      sDR: ["Planetoidy + planety: orbity -30%.", "Gwiazdy: orbity -15%."],
      pDR: ["Wszystkie obiekty: orbity -30%.", "Podslot: Ekspansja."]
    },
    intencja: {
      DR: ["Odbicie od planetoid 15%, od planet 10%."],
      sDR: ["Planetoidy 30%, planety 15%."],
      pDR: ["Planetoidy + planety 35%.", "Podslot: Ekspansja."]
    },
    czas: {
      DR: ["+1 minuta do czasu kart aktywowanych."],
      sDR: ["+2 minuty do czasu kart aktywowanych."],
      pDR: ["+3 minuty do czasu kart aktywowanych.", "Podslot: Ekspansja."]
    },
    cisza: {
      DR: ["Po aktywacji karty respawnują tylko jej kolory przez 5 s."],
      sDR: ["Po aktywacji karty respawnują tylko jej kolory przez 10 s."],
      pDR: ["Po aktywacji karty respawnują tylko jej kolory przez 15 s.", "Podslot: Ekspansja."]
    }
  };
  const SUB_META_FORMA_REDUCTION = {
    DR: 0.15,
    sDR: 0.30,
    pDR: 0.30
  };
  // TODO: Align FORMA duration with CARDS_SYSTEM when duration is defined.
  const SUB_META_FORMA_DURATION_MS = {
    DR: 60000,
    sDR: 60000,
    pDR: 60000
  };
  const SUB_META_FORMA_FALLBACK_DURATION_MS = 60000;
  const SUB_META_CARD_LIBRARY = buildSubMetaCardLibrary();

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
    ensureCardBank(World);
    ensureRunSequences(World);
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
    if (World.formaActiveUntilMs === undefined) World.formaActiveUntilMs = 0;
    if (World.formaStrengthMul === undefined) World.formaStrengthMul = 1;
    if (World.formaOrbitReduction === undefined) World.formaOrbitReduction = 0;
    if (World.formaOrbitReductionBase === undefined) World.formaOrbitReductionBase = 0;
    const runTimers = window.HC && window.HC.RunTimers;
    if (runTimers && typeof runTimers.ensure === "function") {
      runTimers.ensure(World);
    }

    applyFormaToWorld(World);

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
        const colorKey = String(color);
        handleTrialColorPick(colorKey);
        handleRunCardCollision(colorKey);
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
    state.subMeta = {
      selectedSlotKey: null,
      selectedCardKey: null,
      selectedForge: null,
      showRemoveForSlotKey: null
    };
    if (state.world) {
      resetCardBank(state.world);
      resetRunSequences(state.world);
      bindWorld(state.world);
    }
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
    addCardCount(World, "R1", [key], "DR", 1);
  }

  function activatePack01Target(color) {
    const World = state.world;
    const key = normalizePack01Color(color);
    if (!World || !key) return;
    const t = nowMs();
    World.pack01ReleaseBlockColor = key;
    World.pack01ReleaseBlockUntilMs = t + config.pack01TargetDurationMs;
    onRunActivateR1({ baseDurationMs: config.pack01TargetDurationMs, colorKey: key, tierKey: "DR" });
  }

  function onRunActivateR1({ baseDurationMs, colorKey, tierKey } = {}) {
    const World = state.world;
    if (!World) return false;
    const t = nowMs();
    const bonusMs = getFormaTimeBonusMs(World);
    const durationMs = computeActivationDurationMs(baseDurationMs, bonusMs, "R1");
    const normalizedColor = normalizePack01Color(colorKey);
    const tier = normalizeSubMetaTier(tierKey || "DR");
    if (normalizedColor && !consumeCardCount(World, "R1", [normalizedColor], tier)) return false;
    if (normalizedColor) {
      startRunTimerForColor(World, normalizedColor, durationMs, t, 1);
    }
    return startFormaEffect(World, t, "R1", baseDurationMs);
  }

  function onRunActivateR2({ baseDurationMs, colorKeys, tierKey } = {}) {
    const World = state.world;
    if (!World) return false;
    const t = nowMs();
    const bonusMs = getFormaTimeBonusMs(World);
    const durationMs = computeActivationDurationMs(baseDurationMs, bonusMs, "R2");
    const colors = Array.isArray(colorKeys) ? colorKeys.map(normalizePack01Color).filter(Boolean) : [];
    const tier = normalizeSubMetaTier(tierKey || "DR");
    const pairKey = colors.length >= 2 ? getCanonicalPairKey(colors[0], colors[1]) : null;
    if (pairKey && !consumeCardCount(World, "R2", [colors[0], colors[1]], tier)) return false;
    colors.forEach((color) => {
      startRunTimerForColor(World, color, durationMs, t, 2);
    });
    return startFormaEffect(World, t, "R2", baseDurationMs);
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
      const runTimers = window.HC && window.HC.RunTimers;
      if (runTimers && typeof runTimers.updateWorldActiveUntil === "function") {
        runTimers.updateWorldActiveUntil(World, t);
      }
      syncFormaActiveUntil(World, t);
      applyFormaToWorld(World);

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
    if (!World) return;

    const order = ["red", "yellow", "green", "blue"];
    const pad = 12;
    const rectW = 10;
    const rectH = 24;
    const gap = 14;
    const x = Math.floor(screenW - pad - rectW);
    const y0 = Math.floor(pad + 6);
    const nowTime = nowMs();
    const runTimers = World.runColorTimers || {};
    const runDurations = World.runColorDurations || {};

    ctx.save();
    ctx.font = "11px system-ui";
    ctx.textAlign = "right";
    for (let i = 0; i < order.length; i++) {
      const key = order[i];
      const count = getCardCount(World, "R1", [key], "DR");
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
      const activeUntil = Number(runTimers[key] || 0);
      const durationMs = Number(runDurations[key] || 0);
      if (activeUntil > nowTime && Number.isFinite(durationMs) && durationMs > 0) {
        const remainingRatio = clamp01((activeUntil - nowTime) / durationMs);
        if (remainingRatio > 0) {
          const barW = 3;
          const barH = Math.max(1, Math.floor(rectH * remainingRatio));
          const barX = x - 6;
          const barY = y + rectH - barH;
          ctx.globalAlpha = 0.95;
          ctx.fillStyle = PACK01_COLOR_HEX[key] || "#FFFFFF";
          ctx.fillRect(barX, barY, barW, barH);
        }
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
    state.subMeta.selectedCardKey = null;
    state.subMeta.selectedForge = null;
    state.subMeta.showRemoveForSlotKey = null;
    applyFormaToWorld(World);
  }

  function assignSubMetaSlot(World, slotKey, assignment) {
    if (!World || !World.metaSlots || !assignment) return;
    const colorKey = assignment.color;
    if (!colorKey) return;
    const tierKey = normalizeSubMetaTier(assignment.tier);
    const available = getCardCount(World, "R1", [colorKey], tierKey);
    if (available <= 0) return;
    if ((World.score || 0) < SUB_META_ASSIGN_COST) return;

    if (World.metaSlots[slotKey]) return;
    addCardCount(World, "R1", [colorKey], tierKey, -1);
    World.metaSlots[slotKey] = assignment;
    World.score = Math.max(0, (World.score || 0) - SUB_META_ASSIGN_COST);
  }

  function removeSubMetaSlot(World, slotKey) {
    if (!World || !World.metaSlots) return;
    const assignment = World.metaSlots[slotKey];
    if (!assignment || !assignment.color) return;
    if ((World.score || 0) < SUB_META_ASSIGN_COST) return;
    World.score = Math.max(0, (World.score || 0) - SUB_META_ASSIGN_COST);
    addCardCount(World, "R1", [assignment.color], assignment.tier, 1);
    World.metaSlots[slotKey] = null;
  }

  function normalizeSubMetaTier(tier) {
    const key = String(tier || "DR").toUpperCase();
    if (key === "SDR") return "sDR";
    if (key === "PDR") return "pDR";
    if (key === "DR") return "DR";
    return "DR";
  }

  function buildSubMetaCardLibrary() {
    const slotMap = {
      red: ["forma"],
      yellow: ["intencja"],
      green: ["czas"],
      blue: ["cisza"]
    };
    const library = [];
    SUB_META_COLORS.forEach((color) => {
      const allowedSlots = slotMap[color] || [];
      SUB_META_TIERS.forEach((tier) => {
        library.push({
          key: `R1_${tier}_${color}`,
          title: "R1",
          tier,
          color,
          allowedSlots,
          haiku: null
        });
      });
    });
    return library;
  }

  function getCanonicalPairKey(colorA, colorB) {
    const a = String(colorA || "");
    const b = String(colorB || "");
    const idxA = SUB_META_COLORS.indexOf(a);
    const idxB = SUB_META_COLORS.indexOf(b);
    if (idxA === -1 || idxB === -1) return `${a}-${b}`;
    if (idxA <= idxB) return `${a}-${b}`;
    return `${b}-${a}`;
  }

  function createTierBucket() {
    return { DR: 0, sDR: 0, pDR: 0 };
  }

  function buildCardBank() {
    const bank = { R1: {}, R2: {} };
    SUB_META_COLORS.forEach((color) => {
      bank.R1[color] = createTierBucket();
    });
    SUB_META_R2_PAIRS.forEach((pair) => {
      const key = getCanonicalPairKey(pair[0], pair[1]);
      bank.R2[key] = createTierBucket();
    });
    return bank;
  }

  function ensureCardBank(World) {
    if (!World) return;
    if (!World.cardBank || typeof World.cardBank !== "object") {
      World.cardBank = buildCardBank();
    }
    if (!World.cardBank.R1 || typeof World.cardBank.R1 !== "object") {
      World.cardBank.R1 = {};
    }
    if (!World.cardBank.R2 || typeof World.cardBank.R2 !== "object") {
      World.cardBank.R2 = {};
    }
    SUB_META_COLORS.forEach((color) => {
      if (!World.cardBank.R1[color] || typeof World.cardBank.R1[color] !== "object") {
        World.cardBank.R1[color] = createTierBucket();
      }
    });
    SUB_META_R2_PAIRS.forEach((pair) => {
      const key = getCanonicalPairKey(pair[0], pair[1]);
      if (!World.cardBank.R2[key] || typeof World.cardBank.R2[key] !== "object") {
        World.cardBank.R2[key] = createTierBucket();
      }
    });

    if (!World._cardBankMigrated) {
      let hasStock = false;
      SUB_META_COLORS.forEach((color) => {
        const bucket = World.cardBank.R1[color];
        SUB_META_TIERS.forEach((tier) => {
          if (bucket?.[tier]) hasStock = true;
        });
      });
      SUB_META_R2_PAIRS.forEach((pair) => {
        const key = getCanonicalPairKey(pair[0], pair[1]);
        const bucket = World.cardBank.R2[key];
        SUB_META_TIERS.forEach((tier) => {
          if (bucket?.[tier]) hasStock = true;
        });
      });
      if (!hasStock) {
        if (World.cardStock) {
          SUB_META_COLORS.forEach((color) => {
            const bucket = World.cardStock.R1?.[color];
            SUB_META_TIERS.forEach((tier) => {
              const count = Math.max(0, Math.floor(bucket?.[tier] || 0));
              if (count > 0) World.cardBank.R1[color][tier] += count;
            });
          });
          SUB_META_R2_PAIRS.forEach((pair) => {
            const key = getCanonicalPairKey(pair[0], pair[1]);
            const bucket = World.cardStock.R2?.[key];
            SUB_META_TIERS.forEach((tier) => {
              const count = Math.max(0, Math.floor(bucket?.[tier] || 0));
              if (count > 0) World.cardBank.R2[key][tier] += count;
            });
          });
        }
        if (World.collectedCardsByColor) {
          SUB_META_COLORS.forEach((color) => {
            const count = Math.max(0, Math.floor(World.collectedCardsByColor[color] || 0));
            if (count > 0) World.cardBank.R1[color].DR += count;
          });
        }
        const comboCounts = World.collectedCardsByCombo || World.collectedCardsByPair;
        if (comboCounts) {
          SUB_META_R2_PAIRS.forEach((pair) => {
            const count = getSubMetaComboCount(comboCounts, pair[0], pair[1]);
            if (count > 0) {
              const key = getCanonicalPairKey(pair[0], pair[1]);
              World.cardBank.R2[key].DR += Math.max(0, Math.floor(count));
            }
          });
        }
      }
      World._cardBankMigrated = true;
      recomputeTotalCards(World);
    }
    if (typeof World.totalCards !== "number") {
      recomputeTotalCards(World);
    }
  }

  function resetCardBank(World) {
    if (!World) return;
    World.cardBank = buildCardBank();
    World._cardBankMigrated = true;
    recomputeTotalCards(World);
    if (!World.collectedCardsByColor) {
      World.collectedCardsByColor = { red: 0, yellow: 0, green: 0, blue: 0 };
    } else {
      SUB_META_COLORS.forEach((color) => {
        World.collectedCardsByColor[color] = 0;
      });
    }
  }

  function getCardBankBucket(World, kind, colors) {
    if (!World) return null;
    ensureCardBank(World);
    if (kind === "R1") {
      const color = colors?.[0];
      return World.cardBank.R1[color] || null;
    }
    if (kind === "R2") {
      const key = getCanonicalPairKey(colors?.[0], colors?.[1]);
      return World.cardBank.R2[key] || null;
    }
    return null;
  }

  function getCardCount(World, kind, colors, tier) {
    const bucket = getCardBankBucket(World, kind, colors);
    if (!bucket) return 0;
    const tierKey = normalizeSubMetaTier(tier);
    return Math.max(0, Math.floor(bucket[tierKey] || 0));
  }

  function convertDrBucket(bucket) {
    if (!bucket) return;
    let dr = Math.max(0, Math.floor(bucket.DR || 0));
    if (dr >= 9) {
      const pdrGain = Math.floor(dr / 9);
      dr -= pdrGain * 9;
      bucket.pDR = Math.max(0, Math.floor(bucket.pDR || 0)) + pdrGain;
    }
    if (dr >= 3) {
      const sdrGain = Math.floor(dr / 3);
      dr -= sdrGain * 3;
      bucket.sDR = Math.max(0, Math.floor(bucket.sDR || 0)) + sdrGain;
    }
    bucket.DR = Math.max(0, Math.floor(dr));
  }

  function addCardCount(World, kind, colors, tier, delta) {
    const bucket = getCardBankBucket(World, kind, colors);
    if (!bucket) return;
    const tierKey = normalizeSubMetaTier(tier);
    const deltaNum = Number(delta || 0);
    const next = Math.max(0, Math.floor((bucket[tierKey] || 0) + deltaNum));
    bucket[tierKey] = next;
    if (kind === "R1" && tierKey === "DR") {
      if (!World.collectedCardsByColor) {
        World.collectedCardsByColor = { red: 0, yellow: 0, green: 0, blue: 0 };
      }
      const color = colors?.[0];
      if (color) World.collectedCardsByColor[color] = next;
    }
    if (tierKey === "DR" && deltaNum > 0 && (kind === "R1" || kind === "R2")) {
      convertDrBucket(bucket);
      if (kind === "R1" && colors?.[0]) {
        World.collectedCardsByColor[colors[0]] = bucket.DR;
      }
    }
    recomputeTotalCards(World);
  }

  function consumeCardCount(World, kind, colors, tier) {
    const available = getCardCount(World, kind, colors, tier);
    if (available <= 0) return false;
    addCardCount(World, kind, colors, tier, -1);
    return true;
  }

  function getTotalCardCount(World) {
    if (!World) return 0;
    if (typeof World.totalCards === "number") return World.totalCards;
    return recomputeTotalCards(World);
  }

  function recomputeTotalCards(World) {
    let total = 0;
    if (!World) return 0;
    if (!World.cardBank) {
      World.totalCards = 0;
      return 0;
    }

    if (World.cardBank.R1) {
      for (const colorKey in World.cardBank.R1) {
        const tiers = World.cardBank.R1[colorKey];
        if (!tiers) continue;
        for (const tierKey in tiers) total += (tiers[tierKey] || 0);
      }
    }

    if (World.cardBank.R2) {
      for (const pairKey in World.cardBank.R2) {
        const tiers = World.cardBank.R2[pairKey];
        if (!tiers) continue;
        for (const tierKey in tiers) total += (tiers[tierKey] || 0);
      }
    }

    World.totalCards = total;
    return total;
  }

  function ensureRunSequences(World) {
    if (!World) return;
    if (!World.r1Seq || typeof World.r1Seq !== "object") {
      World.r1Seq = { color: null, streak: 0, windowOpen: false };
    }
    if (!World.r2Seq || typeof World.r2Seq !== "object") {
      World.r2Seq = { active: false, colorA: null, colorB: null, phase: "", needBdr: 0 };
    }
  }

  function resetRunSequences(World) {
    if (!World) return;
    World.r1Seq = { color: null, streak: 0, windowOpen: false };
    World.r2Seq = { active: false, colorA: null, colorB: null, phase: "", needBdr: 0 };
  }

  function resetR2Sequence(seq) {
    if (!seq) return;
    seq.active = false;
    seq.colorA = null;
    seq.colorB = null;
    seq.phase = "";
    seq.needBdr = 0;
  }

  function findR2StartColor(World, excludeColor) {
    for (const color of SUB_META_COLORS) {
      if (color === excludeColor) continue;
      if (getCardCount(World, "R1", [color], "DR") >= 2) return color;
    }
    return null;
  }

  function handleR1Sequence(World, colorKey) {
    const seq = World.r1Seq;
    if (!seq.color) {
      seq.color = colorKey;
      seq.streak = 1;
      seq.windowOpen = false;
      return;
    }
    if (colorKey === seq.color) {
      seq.streak += 1;
      if (seq.streak === 2) seq.windowOpen = true;
      if (seq.streak === 3) {
        addCardCount(World, "R1", [colorKey], "DR", 1);
        seq.color = null;
        seq.streak = 0;
        seq.windowOpen = false;
      }
      return;
    }
    if (seq.windowOpen && seq.streak === 2) {
      const addScore = window.addScore;
      if (typeof addScore === "function") addScore(3);
    }
    seq.color = colorKey;
    seq.streak = 1;
    seq.windowOpen = false;
  }

  function handleR2Sequence(World, colorKey) {
    const seq = World.r2Seq;
    if (!seq.active) {
      const colorA = findR2StartColor(World, colorKey);
      if (colorA) {
        seq.active = true;
        seq.colorA = colorA;
        seq.colorB = colorKey;
        seq.phase = "COLLECT_B";
        seq.needBdr = 2;
      }
    } else if (colorKey !== seq.colorA && colorKey !== seq.colorB) {
      resetR2Sequence(seq);
      return;
    }

    if (!seq.active || seq.phase !== "COLLECT_B") return;
    const countA = getCardCount(World, "R1", [seq.colorA], "DR");
    const countB = getCardCount(World, "R1", [seq.colorB], "DR");
    if (countA >= 2 && countB >= 2) {
      addCardCount(World, "R1", [seq.colorA], "DR", -2);
      addCardCount(World, "R1", [seq.colorB], "DR", -2);
      addCardCount(World, "R2", [seq.colorA, seq.colorB], "DR", 1);
      resetR2Sequence(seq);
    }
  }

  function handleRunCardCollision(color) {
    const World = state.world;
    const colorKey = normalizePack01Color(color);
    if (!World || !colorKey) return;
    ensureRunSequences(World);
    handleR1Sequence(World, colorKey);
    handleR2Sequence(World, colorKey);
  }

  function getFormaDurationMs(assignment) {
    if (!assignment) return 0;
    const explicit = Number(assignment.durationMs);
    if (Number.isFinite(explicit) && explicit > 0) return explicit;
    const tierKey = normalizeSubMetaTier(assignment.tier);
    const mapped = SUB_META_FORMA_DURATION_MS[tierKey];
    const fallback = SUB_META_FORMA_FALLBACK_DURATION_MS;
    return Math.max(0, Number.isFinite(mapped) ? mapped : fallback);
  }

  function getFormaReductionForTier(tier) {
    const tierKey = normalizeSubMetaTier(tier);
    return Number(SUB_META_FORMA_REDUCTION[tierKey] || SUB_META_FORMA_REDUCTION.DR || 0);
  }

  function getFormaTimeBonusMs(_World) {
    // TODO: integrate CZAS slot bonus.
    return 0;
  }

  function getFormaEffectColor(World) {
    if (!World) return null;
    const assignment = World.metaSlots?.forma;
    const assignmentColor = normalizePack01Color(assignment?.color);
    return assignmentColor || null;
  }

  function computeActivationDurationMs(baseDurationMs, timeBonusMs, runKind) {
    const baseDuration = Number(baseDurationMs);
    const bonus = Number(timeBonusMs || 0);
    if (!Number.isFinite(baseDuration) || baseDuration <= 0) return 0;
    const total = baseDuration + (Number.isFinite(bonus) ? bonus : 0);
    return runKind === "R2" ? 2 * total : total;
  }

  function startRunTimerForColor(World, colorKey, durationMs, nowMs, strengthMul) {
    const runTimers = window.HC && window.HC.RunTimers;
    if (runTimers && typeof runTimers.startOrRefresh === "function") {
      runTimers.startOrRefresh(World, colorKey, durationMs, nowMs, strengthMul);
    }
  }

  function syncFormaActiveUntil(World, nowMs) {
    const runTimers = window.HC && window.HC.RunTimers;
    if (runTimers && typeof runTimers.updateWorldActiveUntil === "function") {
      const activeUntil = runTimers.updateWorldActiveUntil(World, nowMs);
      World.formaActiveUntilMs = activeUntil > nowMs ? activeUntil : 0;
      if (!World.formaActiveUntilMs) {
        World.formaStrengthMul = 1;
        World.formaOrbitReduction = 0;
        World.formaOrbitReductionBase = 0;
      }
      return;
    }
    if (World.formaActiveUntilMs && nowMs >= World.formaActiveUntilMs) {
      World.formaActiveUntilMs = 0;
      World.formaStrengthMul = 1;
      World.formaOrbitReduction = 0;
      World.formaOrbitReductionBase = 0;
    }
  }

  function isFormaActive(World, now) {
    if (!World) return false;
    const runTimers = window.HC && window.HC.RunTimers;
    if (runTimers && typeof runTimers.isWorldSlotsActive === "function") {
      return runTimers.isWorldSlotsActive(World, now);
    }
    const untilMs = Number(World.formaActiveUntilMs || 0);
    return untilMs > 0 && now < untilMs;
  }

  function syncOrbitRadiusForBody(body, kind, mul) {
    if (!body) return;
    const multiplier = Number.isFinite(mul) ? mul : 1;
    const computeGravityFromPlanetRadius = window.computeGravityFromPlanetRadius;
    let baseRadius = body.orbitNativeRadius;
    if (!Number.isFinite(baseRadius)) {
      if (kind === "star") {
        baseRadius = body.gravityR;
        if (!Number.isFinite(baseRadius) && typeof computeGravityFromPlanetRadius === "function") {
          baseRadius = computeGravityFromPlanetRadius(body.r);
        }
      } else {
        baseRadius = body.orbitPx;
      }
    }
    if (!Number.isFinite(baseRadius)) return;
    body.orbitNativeRadius = baseRadius;
    body.orbitCurrentRadius = baseRadius * multiplier;
    if (kind === "star") {
      body.gravityR = body.orbitCurrentRadius;
    } else {
      body.orbitPx = body.orbitCurrentRadius;
    }
  }

  function applyFormaToWorld(World) {
    if (!World) return;
    const t = nowMs();
    const active = isFormaActive(World, t);
    const baseReduction = clampNum(World.formaOrbitReductionBase || World.formaOrbitReduction || 0, 0, 0.95);
    const strengthMul = active ? (Number(World.runWorldStrengthMul) || World.formaStrengthMul || 1) : 1;
    const reduction = active ? clampNum(baseReduction * strengthMul, 0, 0.95) : 0;
    const multiplier = 1 - reduction;

    World.formaStrengthMul = strengthMul;
    World.formaOrbitReduction = reduction;

    World.metaOrbitMulAsteroid = multiplier;
    World.metaOrbitMulPlanet = multiplier;
    World.metaOrbitMulStar = multiplier;

    if (World.asteroids && World.asteroids.length) {
      for (const a of World.asteroids) syncOrbitRadiusForBody(a, "asteroid", multiplier);
    }
    if (World.planets && World.planets.length) {
      for (const p of World.planets) syncOrbitRadiusForBody(p, "planet", multiplier);
    }
    if (World.stars && World.stars.length) {
      for (const s of World.stars) syncOrbitRadiusForBody(s, "star", multiplier);
    }
  }

  function startFormaEffect(World, now, runKind, baseDurationMs) {
    if (!World) return false;
    const assignment = World.metaSlots?.forma;
    if (!assignment) return false;
    const tierKey = normalizeSubMetaTier(assignment.tier);
    const baseReduction = getFormaReductionForTier(tierKey);
    if (!(baseReduction > 0)) return false;
    const timeBonus = getFormaTimeBonusMs(World);
    const durationMs = computeActivationDurationMs(baseDurationMs, timeBonus, runKind);
    if (!Number.isFinite(durationMs) || durationMs <= 0) return false;

    World.formaOrbitReductionBase = baseReduction;
    World.formaOrbitReduction = baseReduction;
    World.formaStrengthMul = runKind === "R2" ? 2 : 1;
    World.formaActiveUntilMs = now + durationMs;
    World.formaColorKey = getFormaEffectColor(World);
    applyFormaToWorld(World);
    return true;
  }

  function getSubMetaCardByKey(cardKey) {
    return SUB_META_CARD_LIBRARY.find((card) => card.key === cardKey) || null;
  }

  function buildForgeCandidate(kind, colors, tierTarget) {
    const tierKey = normalizeSubMetaTier(tierTarget);
    const key = `forge_${kind}_${colors.join("_")}_${tierKey}`;
    return {
      key,
      kind,
      colors,
      tierTarget: tierKey,
      label: `${tierKey} ${kind}`,
      costRp: SUB_META_FORGE_COSTS[tierKey] || 0,
      consumes: SUB_META_FORGE_CONSUMES[tierKey] || 0
    };
  }

  function getSubMetaForgeList(World) {
    if (!World) return [];
    const list = [];
    SUB_META_COLORS.forEach((color) => {
      const drCount = getCardCount(World, "R1", [color], "DR");
      if (drCount >= 3) list.push(buildForgeCandidate("R1", [color], "sDR"));
      if (drCount >= 9) list.push(buildForgeCandidate("R1", [color], "pDR"));
    });
    SUB_META_R2_PAIRS.forEach((pair) => {
      const drCount = getCardCount(World, "R2", pair, "DR");
      if (drCount >= 3) list.push(buildForgeCandidate("R2", pair, "sDR"));
      if (drCount >= 9) list.push(buildForgeCandidate("R2", pair, "pDR"));
    });
    return list;
  }

  function getSubMetaForgeByKey(World, forgeKey) {
    if (!forgeKey) return null;
    const list = getSubMetaForgeList(World);
    return list.find((forge) => forge.key === forgeKey) || null;
  }

  function canCraftForge(World, forge) {
    if (!World || !forge) return false;
    const rpValue = Math.max(0, Math.floor(World.score || 0));
    const totalCards = getTotalCardCount(World);
    const drAvailable = getCardCount(World, forge.kind, forge.colors, "DR");
    return rpValue >= (forge.costRp || 0) && drAvailable >= (forge.consumes || 0);
  }

  function craftSubMetaForge(World, forge) {
    if (!canCraftForge(World, forge)) return false;
    const cost = Math.max(0, Math.floor(forge.costRp || 0));
    const consume = Math.max(0, Math.floor(forge.consumes || 0));
    World.score = Math.max(0, Math.floor((World.score || 0) - cost));
    addCardCount(World, forge.kind, forge.colors, "DR", -consume);
    addCardCount(World, forge.kind, forge.colors, forge.tierTarget, 1);
    return true;
  }

  function getSubMetaComboCount(comboCounts, colorA, colorB) {
    if (!comboCounts) return 0;
    const key = `${colorA}_${colorB}`;
    const alt = `${colorA}-${colorB}`;
    const alt2 = `${colorA}${colorB}`;
    return comboCounts[key] || comboCounts[alt] || comboCounts[alt2] || 0;
  }

  function getSubMetaInventoryEntries(World) {
    if (!World) return [];
    const entries = [];
    SUB_META_COLORS.forEach((color) => {
      SUB_META_TIERS.forEach((tier) => {
        const count = getCardCount(World, "R1", [color], tier);
        if (count > 0) {
          entries.push({
            kind: "R1",
            label: `R1 ${tier}`,
            tier,
            colors: [color],
            count
          });
        }
      });
    });
    SUB_META_R2_PAIRS.forEach((pair) => {
      SUB_META_TIERS.forEach((tier) => {
        const count = getCardCount(World, "R2", pair, tier);
        if (count > 0) {
          entries.push({
            kind: "R2",
            label: `R2 ${tier}`,
            tier,
            colors: pair,
            count
          });
        }
      });
    });
    return entries;
  }

  function getSubMetaAvailableCards(World, slotKey) {
    if (!World || !slotKey) return [];
    const slotColor = SUB_META_SLOT_COLORS[slotKey];
    return SUB_META_CARD_LIBRARY.filter((card) => {
      if (!card || card.color !== slotColor) return false;
      if (!Array.isArray(card.allowedSlots) || !card.allowedSlots.includes(slotKey)) return false;
      return getCardCount(World, "R1", [card.color], card.tier) > 0;
    });
  }

  function getSubMetaEffectLines(slotKey, tier) {
    const tierKey = normalizeSubMetaTier(tier);
    const slotMap = SUB_META_META_EFFECTS[slotKey];
    if (!slotMap) return [];
    return slotMap[tierKey] || slotMap.DR || [];
  }

  function getSubMetaSlotLabel(slotKey) {
    const slot = SUB_META_SLOTS.find((item) => item.key === slotKey);
    return slot ? slot.label : String(slotKey || "");
  }

  function getSubMetaCardTitle(card) {
    if (card && card.title) return card.title;
    const tierLabel = normalizeSubMetaTier(card?.tier);
    const colorLabel = PACK01_COLOR_LABEL[card?.color] || card?.color || "KOLOR";
    return `KARTA ${colorLabel.toUpperCase()} / ${tierLabel}`;
  }

  function getSubMetaCardFromAssignment(slotKey, assignment) {
    if (!assignment) return null;
    const tierKey = normalizeSubMetaTier(assignment.tier);
    const match = SUB_META_CARD_LIBRARY.find((card) => {
      if (!card) return false;
      if (card.color !== assignment.color) return false;
      if (normalizeSubMetaTier(card.tier) !== tierKey) return false;
      return Array.isArray(card.allowedSlots) && card.allowedSlots.includes(slotKey);
    });
    return match || {
      key: `assigned:${slotKey}:${assignment.color}:${tierKey}`,
      title: "R1",
      tier: tierKey,
      color: assignment.color,
      allowedSlots: [slotKey],
      haiku: null
    };
  }

  function getSubMetaHaikuLines(card) {
    const haiku = card?.haiku;
    if (Array.isArray(haiku)) return haiku.map(String).filter(Boolean);
    if (typeof haiku === "string" && haiku.trim()) return [haiku.trim()];
    return [];
  }

  function wrapTextLines(ctx, text, maxWidth) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    const lines = [];
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const next = `${line} ${words[i]}`;
      if (ctx.measureText(next).width <= maxWidth) {
        line = next;
      } else {
        lines.push(line);
        line = words[i];
      }
    }
    lines.push(line);
    return lines;
  }

  function getSubMetaCardGrid(rect) {
    const cellW = SUB_META_CARD_W + SUB_META_CARD_GAP_X;
    const cellH = SUB_META_CARD_H + SUB_META_COUNT_PAD + SUB_META_CARD_GAP_Y;
    const cols = Math.max(1, Math.floor((rect.w + SUB_META_CARD_GAP_X) / cellW));
    const rows = Math.max(1, Math.floor((rect.h + SUB_META_CARD_GAP_Y) / cellH));
    return { cols, rows, cellW, cellH };
  }

  function getSubMetaCardRect(rect, grid, index) {
    const col = index % grid.cols;
    const row = Math.floor(index / grid.cols);
    return {
      x: rect.x + col * grid.cellW,
      y: rect.y + row * grid.cellH,
      w: SUB_META_CARD_W,
      h: SUB_META_CARD_H
    };
  }

  function renderMetaCard(ctx, x, y, card, options = {}) {
    const color = card?.color || "#FFFFFF";
    const typeLabel = String(card?.type || "R1");
    const tierLabel = normalizeSubMetaTier(card?.tier);
    const count = Math.max(0, Math.floor(Number(card?.count || 0)));
    const showCount = options.showCount && count > 0;
    const isSelected = !!options.isSelected;
    const isDisabled = !!options.isDisabled;
    const rectW = SUB_META_CARD_W;
    const rectH = SUB_META_CARD_H;
    ctx.save();
    ctx.globalAlpha = isDisabled ? 0.35 : 1.0;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, rectW, rectH);

    if (tierLabel === "sDR") {
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.5, y + 0.5, rectW - 1, rectH - 1);
    } else if (tierLabel === "pDR") {
      ctx.strokeStyle = "rgba(255,215,120,0.9)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 0.5, y + 0.5, rectW - 1, rectH - 1);
    }

    if (isSelected) {
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 1, y - 1, rectW + 2, rectH + 2);
    }

    const textSquare = rectW - 4;
    const textSquareX = x + Math.floor((rectW - textSquare) / 2);
    const textSquareY = y + Math.floor((rectH - textSquare) / 2);
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.textAlign = "center";
    ctx.font = "8px system-ui";
    ctx.fillText(typeLabel, textSquareX + textSquare / 2, textSquareY + 6);
    ctx.font = "8px system-ui";
    ctx.fillText(tierLabel, textSquareX + textSquare / 2, textSquareY + 14);
    ctx.textAlign = "left";

    if (showCount) {
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "11px system-ui";
      ctx.fillText(String(count), x - SUB_META_COUNT_PAD, y + rectH + SUB_META_COUNT_PAD);
    }

    ctx.restore();
  }

  function renderSubMetaSlotFrame(ctx, slot, labelText, color, isSelected) {
    const labelX = slot.x + 10;
    const notchPad = 6;
    const lineWidth = isSelected ? 2 : 1;
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = isSelected ? 0.95 : 0.45;
    ctx.strokeStyle = color;
    ctx.font = "11px system-ui";
    const labelWidth = ctx.measureText(labelText).width;
    const notchStart = Math.max(slot.x + 6, labelX - notchPad);
    const notchEnd = Math.min(slot.x + slot.w - 6, labelX + labelWidth + notchPad);
    const leftX = slot.x + 0.5;
    const rightX = slot.x + slot.w - 0.5;
    const topY = slot.y + 0.5;
    const bottomY = slot.y + slot.h - 0.5;
    ctx.beginPath();
    ctx.moveTo(leftX, topY);
    ctx.lineTo(notchStart, topY);
    ctx.moveTo(notchEnd, topY);
    ctx.lineTo(rightX, topY);
    ctx.lineTo(rightX, bottomY);
    ctx.lineTo(leftX, bottomY);
    ctx.lineTo(leftX, topY);
    ctx.stroke();

    ctx.globalAlpha = isSelected ? 0.95 : 0.75;
    ctx.fillStyle = color;
    ctx.fillText(labelText, labelX, slot.y + slot.headerH - 2);
    ctx.restore();
  }

  function getSubMetaLayout(screenW, screenH) {
    const panelW = Math.min(720, Math.floor(screenW * 0.92));
    const panelH = Math.min(440, Math.floor(screenH * 0.88));
    const panelX = Math.floor((screenW - panelW) / 2);
    const panelY = Math.floor((screenH - panelH) / 2);
    const pad = 18;
    const headerH = 26;
    const columnGap = 24;
    const rowGap = 16;
    const columnW = Math.floor((panelW - pad * 2 - columnGap) / 2);
    const leftX = panelX + pad;
    const rightX = leftX + columnW + columnGap;
    const columnTop = panelY + pad + headerH;
    const contentH = panelH - pad * 2 - headerH;
    const rowH = Math.floor((contentH - rowGap) / 2);
    const slotsRect = { x: leftX, y: columnTop, w: columnW, h: rowH };
    const inventoryRect = { x: rightX, y: columnTop, w: columnW, h: rowH };
    const pickerRect = { x: leftX, y: columnTop + rowH + rowGap, w: columnW, h: rowH };
    const cardInfoRect = { x: rightX, y: columnTop + rowH + rowGap, w: columnW, h: rowH };
    const slotGap = 8;
    const slotH = Math.floor((slotsRect.h - slotGap * (SUB_META_SLOTS.length - 1)) / SUB_META_SLOTS.length);
    const slotHeaderH = Math.max(12, Math.floor(slotH * 0.3));
    const slots = SUB_META_SLOTS.map((slot, index) => ({
      ...slot,
      x: slotsRect.x,
      y: slotsRect.y + index * (slotH + slotGap),
      w: slotsRect.w,
      h: slotH,
      headerH: slotHeaderH,
      bodyH: slotH - slotHeaderH
    }));
    const pickerInset = 8;
    const pickerGap = 10;
    const pickerInnerH = pickerRect.h - pickerInset * 2;
    const pickerBandH = Math.floor((pickerInnerH - pickerGap) / 2);
    const pickerAssignRect = {
      x: pickerRect.x + pickerInset,
      y: pickerRect.y + pickerInset,
      w: pickerRect.w - pickerInset * 2,
      h: pickerBandH
    };
    const pickerForgeRect = {
      x: pickerRect.x + pickerInset,
      y: pickerRect.y + pickerInset + pickerBandH + pickerGap,
      w: pickerRect.w - pickerInset * 2,
      h: pickerBandH
    };
    const inventoryInset = 8;
    const inventoryInnerRect = {
      x: inventoryRect.x + inventoryInset,
      y: inventoryRect.y + inventoryInset,
      w: inventoryRect.w - inventoryInset * 2,
      h: inventoryRect.h - inventoryInset * 2
    };
    const closeW = 88;
    const closeH = 26;
    const closeButton = {
      x: panelX + panelW - pad - closeW,
      y: panelY + pad - 4,
      w: closeW,
      h: closeH
    };
    const assignW = 100;
    const assignH = 26;
    const assignButton = {
      x: cardInfoRect.x + cardInfoRect.w - assignW - 12,
      y: cardInfoRect.y + cardInfoRect.h - assignH - 10,
      w: assignW,
      h: assignH
    };
    const activateW = 100;
    const activateH = 26;
    const activateButton = {
      x: cardInfoRect.x + cardInfoRect.w - activateW - 12,
      y: assignButton.y - activateH - 8,
      w: activateW,
      h: activateH
    };
    const infoBackW = 70;
    const infoBackH = 26;
    const infoBackButton = {
      x: cardInfoRect.x + 12,
      y: cardInfoRect.y + cardInfoRect.h - infoBackH - 10,
      w: infoBackW,
      h: infoBackH
    };
    return {
      panel: { x: panelX, y: panelY, w: panelW, h: panelH },
      pad,
      headerY: panelY + pad + 12,
      slotsRect,
      inventoryRect,
      inventoryInnerRect,
      pickerRect,
      pickerAssignRect,
      pickerForgeRect,
      cardInfoRect,
      slots,
      assignButton,
      activateButton,
      infoBackButton,
      closeButton
    };
  }

  function renderSubMetaOverlay(ctx, screenW, screenH) {
    const World = state.world;
    if (!World || !World.subMetaOpen) return;

    const layout = getSubMetaLayout(screenW, screenH);
    const {
      panel,
      pad,
      headerY,
      slots,
      slotsRect,
      inventoryRect,
      inventoryInnerRect,
      pickerRect,
      pickerAssignRect,
      pickerForgeRect,
      cardInfoRect,
      assignButton,
      infoBackButton,
      closeButton
    } = layout;
    const rpValue = Math.max(0, Math.floor(World.score || 0));
    const selectedSlotKey = state.subMeta.selectedSlotKey;
    const selectedCard = getSubMetaCardByKey(state.subMeta.selectedCardKey);
    const selectedSlotAssignment = selectedSlotKey ? World.metaSlots?.[selectedSlotKey] : null;
    const selectedForge = getSubMetaForgeByKey(World, state.subMeta.selectedForge?.key);
    const activeCard = selectedCard || getSubMetaCardFromAssignment(selectedSlotKey, selectedSlotAssignment);
    const hasEnoughAssignRp = rpValue >= SUB_META_ASSIGN_COST;
    const forgeRpCost = selectedForge?.costRp || 0;
    const hasEnoughForgeRp = rpValue >= forgeRpCost;
    const scaleCenterX = panel.x + panel.w / 2;
    const scaleCenterY = panel.y + panel.h / 2;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, screenW, screenH);

    ctx.translate(scaleCenterX, scaleCenterY);
    ctx.scale(SUB_META_SCALE, SUB_META_SCALE);
    ctx.translate(-scaleCenterX, -scaleCenterY);

    ctx.globalAlpha = 0.95;
    ctx.fillStyle = "rgba(20,20,20,0.92)";
    ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.strokeRect(panel.x, panel.y, panel.w, panel.h);

    ctx.font = "14px system-ui";
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.textAlign = "center";
    ctx.fillText("SUB-META", panel.x + panel.w / 2, headerY);
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(`Punkty Rezonansu: ${rpValue}`, panel.x + pad, headerY);
    ctx.textAlign = "left";

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.strokeRect(slotsRect.x, slotsRect.y, slotsRect.w, slotsRect.h);
    ctx.strokeRect(inventoryRect.x, inventoryRect.y, inventoryRect.w, inventoryRect.h);
    ctx.strokeRect(pickerRect.x, pickerRect.y, pickerRect.w, pickerRect.h);
    ctx.strokeRect(cardInfoRect.x, cardInfoRect.y, cardInfoRect.w, cardInfoRect.h);
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.moveTo(pickerRect.x + 4, pickerForgeRect.y - 5);
    ctx.lineTo(pickerRect.x + pickerRect.w - 4, pickerForgeRect.y - 5);
    ctx.stroke();
    ctx.restore();

    for (const slot of slots) {
      const isSelected = state.subMeta.selectedSlotKey === slot.key;
      const assignment = World.metaSlots?.[slot.key];
      const slotColorKey = SUB_META_SLOT_COLORS[slot.key];
      const slotColorHex = PACK01_COLOR_HEX[slotColorKey] || "#FFFFFF";
      renderSubMetaSlotFrame(ctx, slot, slot.label.toUpperCase(), slotColorHex, isSelected);

      const bodyY = slot.y + slot.headerH;
      const bodyH = slot.h - slot.headerH;
      if (assignment) {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(slot.x + 6, bodyY + 6, slot.w - 12, bodyH - 12);
      }

      if (assignment) {
        const cardX = slot.x + 12;
        const cardY = bodyY + Math.floor((bodyH - SUB_META_CARD_H) / 2);
        renderMetaCard(ctx, cardX, cardY, {
          type: "R1",
          tier: assignment.tier,
          color: PACK01_COLOR_HEX[assignment.color] || "#FFFFFF",
          count: 0
        }, { showCount: false });

        if (state.subMeta.showRemoveForSlotKey === slot.key) {
          const removeW = 16;
          const removeH = 16;
          const removeX = slot.x + slot.w - removeW - 10;
          const removeY = bodyY + bodyH / 2 - removeH / 2;
          ctx.save();
          ctx.globalAlpha = hasEnoughAssignRp ? 0.9 : 0.35;
          ctx.fillStyle = "rgba(255,80,80,0.2)";
          ctx.fillRect(removeX, removeY, removeW, removeH);
          ctx.strokeStyle = "rgba(255,120,120,0.8)";
          ctx.strokeRect(removeX, removeY, removeW, removeH);
          ctx.fillStyle = "rgba(255,180,180,0.95)";
          ctx.fillText("-", removeX + 5, removeY + 12);
          ctx.restore();
        }
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.fillText("(pusto)", slot.x + 14, bodyY + bodyH / 2 + 5);
      }
    }

    const inventoryEntries = getSubMetaInventoryEntries(World);
    const inventoryGrid = getSubMetaCardGrid(inventoryInnerRect);
    const firstTimerRectByColor = {};
    inventoryEntries.forEach((entry, index) => {
      const row = Math.floor(index / inventoryGrid.cols);
      if (row >= inventoryGrid.rows) return;
      const rect = getSubMetaCardRect(inventoryInnerRect, inventoryGrid, index);
      const colorA = PACK01_COLOR_HEX[entry.colors[0]] || "#FFFFFF";
      renderMetaCard(ctx, rect.x, rect.y, {
        type: entry.kind,
        tier: entry.tier,
        color: colorA,
        count: entry.count
      }, { showCount: true });
      entry.colors.forEach((colorKey) => {
        if (!firstTimerRectByColor[colorKey]) {
          firstTimerRectByColor[colorKey] = rect;
        }
      });
    });
    const nowTime = nowMs();
    const timerDurationMap = World.runColorDurations || {};
    const timerListMap = World.runColorTimers || {};
    Object.keys(firstTimerRectByColor).forEach((colorKey) => {
      const rect = firstTimerRectByColor[colorKey];
      const activeUntil = Number(timerListMap[colorKey] || 0);
      const durationMs = Number(timerDurationMap[colorKey] || 0);
      if (!Number.isFinite(activeUntil) || !Number.isFinite(durationMs) || durationMs <= 0) return;
      const remainingRatio = clamp01((activeUntil - nowTime) / durationMs);
      if (remainingRatio <= 0) return;
      const barW = 3;
      const fullH = SUB_META_CARD_H;
      const barH = Math.max(1, Math.floor(fullH * remainingRatio));
      const barX = rect.x + rect.w + 3;
      const barY = rect.y + fullH - barH;
      ctx.save();
      ctx.fillStyle = PACK01_COLOR_HEX[colorKey] || "#FFFFFF";
      ctx.fillRect(barX, barY, barW, barH);
      ctx.restore();
    });

    if (state.subMeta.selectedSlotKey) {
      const available = getSubMetaAvailableCards(World, state.subMeta.selectedSlotKey);
      const assignGrid = getSubMetaCardGrid(pickerAssignRect);
      available.forEach((card, index) => {
        const row = Math.floor(index / assignGrid.cols);
        if (row >= assignGrid.rows) return;
        const rect = getSubMetaCardRect(pickerAssignRect, assignGrid, index);
        const count = getCardCount(World, "R1", [card.color], card.tier);
        renderMetaCard(ctx, rect.x, rect.y, {
          type: "R1",
          tier: card.tier,
          color: PACK01_COLOR_HEX[card.color] || "#FFFFFF",
          count
        }, {
          isSelected: state.subMeta.selectedCardKey === card.key,
          isDisabled: !hasEnoughAssignRp,
          showCount: true
        });
      });
      if (!available.length) {
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.fillText("Brak kart dla slotu.", pickerAssignRect.x + 6, pickerAssignRect.y + 16);
      }
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText("Wybierz slot, aby zobaczyć karty.", pickerAssignRect.x + 6, pickerAssignRect.y + 16);
    }

    const forgeList = getSubMetaForgeList(World);
    const forgeGrid = getSubMetaCardGrid(pickerForgeRect);
    forgeList.forEach((forge, index) => {
      const row = Math.floor(index / forgeGrid.cols);
      if (row >= forgeGrid.rows) return;
      const rect = getSubMetaCardRect(pickerForgeRect, forgeGrid, index);
      const colorA = PACK01_COLOR_HEX[forge.colors[0]] || "#FFFFFF";
      renderMetaCard(ctx, rect.x, rect.y, {
        type: forge.kind,
        tier: forge.tierTarget,
        color: colorA,
        count: 0
      }, {
        isSelected: state.subMeta.selectedForge?.key === forge.key,
        showCount: false
      });
    });

    ctx.save();
    ctx.fillStyle = "rgb(12,12,12)";
    ctx.fillRect(cardInfoRect.x, cardInfoRect.y, cardInfoRect.w, cardInfoRect.h);
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.strokeRect(cardInfoRect.x, cardInfoRect.y, cardInfoRect.w, cardInfoRect.h);

    if (selectedForge) {
      const tierLabel = normalizeSubMetaTier(selectedForge.tierTarget);
      const typeLabel = selectedForge.kind || "R1";
      const colorLabel = selectedForge.colors.length === 2
        ? `${PACK01_COLOR_LABEL[selectedForge.colors[0]] || selectedForge.colors[0]} + ${PACK01_COLOR_LABEL[selectedForge.colors[1]] || selectedForge.colors[1]}`
        : `${PACK01_COLOR_LABEL[selectedForge.colors[0]] || selectedForge.colors[0]}`;
      const drNeeded = selectedForge.consumes || 0;
      const drAvailable = getCardCount(World, selectedForge.kind, selectedForge.colors, "DR");
      const canCraft = hasEnoughForgeRp && drAvailable >= drNeeded;
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "15px system-ui";
      ctx.fillText(`Kuźnia: ${tierLabel}`, cardInfoRect.x + 12, cardInfoRect.y + 22);
      ctx.font = "12px system-ui";
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText(`Typ: ${typeLabel}`, cardInfoRect.x + 12, cardInfoRect.y + 42);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText(`Kolor: ${colorLabel}`, cardInfoRect.x + 12, cardInfoRect.y + 58);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(`Koszt RP: ${forgeRpCost}`, cardInfoRect.x + 12, cardInfoRect.y + 76);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText(`Składniki: ${drNeeded} × DR`, cardInfoRect.x + 12, cardInfoRect.y + 94);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(`Magazyn DR: ${drAvailable}`, cardInfoRect.x + 12, cardInfoRect.y + 110);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillText("Zamienia DR w wyższy tier.", cardInfoRect.x + 12, cardInfoRect.y + 128);
      ctx.save();
      ctx.globalAlpha = canCraft ? 1.0 : 0.35;
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(assignButton.x, assignButton.y, assignButton.w, assignButton.h);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.strokeRect(assignButton.x, assignButton.y, assignButton.w, assignButton.h);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText("Potwierdź", assignButton.x + 12, assignButton.y + 17);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(infoBackButton.x, infoBackButton.y, infoBackButton.w, infoBackButton.h);
      ctx.strokeStyle = "rgba(180,180,180,0.5)";
      ctx.strokeRect(infoBackButton.x, infoBackButton.y, infoBackButton.w, infoBackButton.h);
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText("Wróć", infoBackButton.x + 14, infoBackButton.y + 17);
      ctx.restore();
    } else if (activeCard && selectedSlotKey) {
      const tierLabel = normalizeSubMetaTier(activeCard.tier);
      const effectLines = getSubMetaEffectLines(selectedSlotKey, tierLabel);
      const effectHeader = `Efekt w slocie ${getSubMetaSlotLabel(selectedSlotKey).toUpperCase()}`;
      const cardTitle = getSubMetaCardTitle(activeCard);
      const haikuLines = getSubMetaHaikuLines(activeCard);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "15px system-ui";
      ctx.fillText(cardTitle, cardInfoRect.x + 12, cardInfoRect.y + 22);
      ctx.font = "12px system-ui";
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText(effectHeader, cardInfoRect.x + 12, cardInfoRect.y + 42);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`R1 ${tierLabel}`, cardInfoRect.x + 12, cardInfoRect.y + 58);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      effectLines.slice(0, 5).forEach((line, index) => {
        ctx.fillText(line, cardInfoRect.x + 12, cardInfoRect.y + 76 + index * 16);
      });
      const haikuTop = cardInfoRect.y + 76 + Math.min(5, effectLines.length) * 16 + 12;
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText("Haiku", cardInfoRect.x + 12, haikuTop);
      ctx.fillStyle = "rgba(255,255,255,0.88)";
      ctx.font = "12px system-ui";
      const haikuStartY = haikuTop + 16;
      const haikuMaxWidth = cardInfoRect.w - 24;
      let haikuCursorY = haikuStartY;
      if (haikuLines.length) {
        haikuLines.forEach((line) => {
          const wrapped = wrapTextLines(ctx, line, haikuMaxWidth);
          wrapped.forEach((wrappedLine) => {
            ctx.fillText(wrappedLine, cardInfoRect.x + 12, haikuCursorY);
            haikuCursorY += 14;
          });
        });
      } else {
        ctx.fillText("(brak haiku)", cardInfoRect.x + 12, haikuCursorY);
      }
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "12px system-ui";
      ctx.fillText("Kliknij kartę, aby zobaczyć opis.", cardInfoRect.x + 12, cardInfoRect.y + 24);
    }

    if (!selectedForge) {
      const slotOccupied = selectedSlotKey && World.metaSlots?.[selectedSlotKey];
      const canAssign = Boolean(selectedSlotKey && activeCard && hasEnoughAssignRp && !slotOccupied);
      ctx.globalAlpha = canAssign ? 1.0 : 0.35;
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(assignButton.x, assignButton.y, assignButton.w, assignButton.h);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.strokeRect(assignButton.x, assignButton.y, assignButton.w, assignButton.h);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fillText("Potwierdź", assignButton.x + 12, assignButton.y + 17);
      ctx.restore();

    } else {
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fillRect(closeButton.x, closeButton.y, closeButton.w, closeButton.h);
    ctx.strokeStyle = "rgba(120,200,255,0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(closeButton.x, closeButton.y, closeButton.w, closeButton.h);
    ctx.strokeStyle = "rgba(120,200,255,0.25)";
    ctx.lineWidth = 4;
    ctx.strokeRect(closeButton.x - 2, closeButton.y - 2, closeButton.w + 4, closeButton.h + 4);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillText("Wróć", closeButton.x + 22, closeButton.y + 18);
    ctx.restore();

    ctx.restore();
  }

  function getSubMetaScaledPointer(mx, my, layout) {
    const scale = SUB_META_SCALE;
    const centerX = layout.panel.x + layout.panel.w / 2;
    const centerY = layout.panel.y + layout.panel.h / 2;
    return {
      x: (mx - centerX) / scale + centerX,
      y: (my - centerY) / scale + centerY
    };
  }

  function handleSubMetaPointerDown(mx, my, screenW, screenH) {
    const World = state.world;
    if (!World || !World.subMetaOpen) return false;

    const layout = getSubMetaLayout(screenW, screenH);
    const {
      panel,
      slots,
      pickerAssignRect,
      pickerForgeRect,
      closeButton,
      assignButton,
      cardInfoRect,
      infoBackButton
    } = layout;
    const hasEnoughAssignRp = (World.score || 0) >= SUB_META_ASSIGN_COST;
    const scaledPointer = getSubMetaScaledPointer(mx, my, layout);
    mx = scaledPointer.x;
    my = scaledPointer.y;

    if (mx >= closeButton.x && mx <= closeButton.x + closeButton.w
      && my >= closeButton.y && my <= closeButton.y + closeButton.h) {
      closeSubMeta(World);
      return true;
    }

    const selectedForge = getSubMetaForgeByKey(World, state.subMeta.selectedForge?.key);
    const activeCard = getSubMetaCardByKey(state.subMeta.selectedCardKey)
      || getSubMetaCardFromAssignment(state.subMeta.selectedSlotKey, World.metaSlots?.[state.subMeta.selectedSlotKey]);
    const slotOccupied = state.subMeta.selectedSlotKey && World.metaSlots?.[state.subMeta.selectedSlotKey];
    if (mx >= assignButton.x && mx <= assignButton.x + assignButton.w
      && my >= assignButton.y && my <= assignButton.y + assignButton.h) {
      if (selectedForge) {
        craftSubMetaForge(World, selectedForge);
        return true;
      }
      const canAssign = Boolean(state.subMeta.selectedSlotKey && activeCard && hasEnoughAssignRp && !slotOccupied);
      if (!canAssign) return true;
      assignSubMetaSlot(World, state.subMeta.selectedSlotKey, {
        kind: "R1",
        color: activeCard.color,
        tier: normalizeSubMetaTier(activeCard.tier)
      });
      state.subMeta.showRemoveForSlotKey = null;
      return true;
    }
    if (selectedForge
      && mx >= infoBackButton.x && mx <= infoBackButton.x + infoBackButton.w
      && my >= infoBackButton.y && my <= infoBackButton.y + infoBackButton.h) {
      state.subMeta.selectedForge = null;
      return true;
    }

    if (mx >= panel.x && mx <= panel.x + panel.w && my >= panel.y && my <= panel.y + panel.h) {
      for (const slot of slots) {
        if (mx >= slot.x && mx <= slot.x + slot.w && my >= slot.y && my <= slot.y + slot.h) {
          const bodyY = slot.y + slot.headerH;
          const bodyH = slot.h - slot.headerH;
          const assignment = World.metaSlots?.[slot.key];
          state.subMeta.selectedSlotKey = slot.key;
          const assignmentCard = getSubMetaCardFromAssignment(slot.key, assignment);
          state.subMeta.selectedCardKey = assignmentCard?.key || null;
          state.subMeta.selectedForge = null;
          state.subMeta.showRemoveForSlotKey = null;
          if (assignment && my >= bodyY && my <= bodyY + bodyH) {
            state.subMeta.showRemoveForSlotKey = slot.key;
            const removeW = 16;
            const removeH = 16;
            const removeX = slot.x + slot.w - removeW - 10;
            const removeY = bodyY + bodyH / 2 - removeH / 2;
            if (mx >= removeX && mx <= removeX + removeW && my >= removeY && my <= removeY + removeH) {
              if (!hasEnoughAssignRp) return true;
              removeSubMetaSlot(World, slot.key);
              state.subMeta.showRemoveForSlotKey = null;
              state.subMeta.selectedCardKey = null;
            }
          }
          return true;
        }
      }

      if (state.subMeta.selectedSlotKey) {
        const available = getSubMetaAvailableCards(World, state.subMeta.selectedSlotKey);
        const assignGrid = getSubMetaCardGrid(pickerAssignRect);
        for (let i = 0; i < available.length; i++) {
          const row = Math.floor(i / assignGrid.cols);
          if (row >= assignGrid.rows) break;
          const card = available[i];
          const rect = getSubMetaCardRect(pickerAssignRect, assignGrid, i);
          if (mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h) {
            state.subMeta.selectedCardKey = card.key;
            state.subMeta.showRemoveForSlotKey = null;
            state.subMeta.selectedForge = null;
            return true;
          }
        }
      }
      const forgeList = getSubMetaForgeList(World);
      const forgeGrid = getSubMetaCardGrid(pickerForgeRect);
      for (let i = 0; i < forgeList.length; i++) {
        const row = Math.floor(i / forgeGrid.cols);
        if (row >= forgeGrid.rows) break;
        const forge = forgeList[i];
        const rect = getSubMetaCardRect(pickerForgeRect, forgeGrid, i);
        if (mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h) {
          state.subMeta.selectedForge = forge;
          state.subMeta.selectedCardKey = null;
          state.subMeta.showRemoveForSlotKey = null;
          return true;
        }
      }
      if (mx >= cardInfoRect.x && mx <= cardInfoRect.x + cardInfoRect.w
        && my >= cardInfoRect.y && my <= cardInfoRect.y + cardInfoRect.h) {
        return true;
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
    onRunActivateR1,
    onRunActivateR2,
    getTotalCardCount,
    recomputeTotalCards,
    resetCardBank,

    // Hooks for future systems
    onRitualTrigger,
    openResetCardHub,
  };
})();

if (typeof window !== "undefined") {
  // expose globally for boot + modules
  window.CardEngine = window.CardEngine || CardEngine;
}
