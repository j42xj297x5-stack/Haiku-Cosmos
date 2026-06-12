console.log("[HC] cards.js loaded");
/* =========================================================
   Haiku Cosmos — cards.js
   Stage 1: single source of truth for CardEngine + Card UI
   - No random dealing
   - No preset packs
   - Hooks only (dead but technically complete)
   ========================================================= */

/* =========================
   1) EVENT BUS (shared with game.js)
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
    pack01TargetDurationMs: 180000,
  };

  function createSequenceState(overrides = {}) {
    return {
      active: false,
      chainColors: [],
      stage: "IDLE",
      expectedColor: null,
      hitCount: 0,
      loopMode: null,
      lastResolution: null,
      resolutionLock: false,
      resolutionId: 0,
      lastHitSignature: null,
      mode: "IDLE",
      track: null,
      stepIndex: 0,
      A: null,
      B: null,
      C: null,
      D: null,
      currentColor: null,
      hits: 0,
      phase: null,
      committedKeys: new Set(),
      earned: [],
      lastHitSnapshot: null,
      opened: false,
      colorsClosed: [],
      chainIndex: 0,
      chainPattern: [],
      baseColor: null,
      tempCards: [],
      commitDuplicateLogged: false,
      rpStart: 0,
      continuationMode: null,
      continuationFromStage: null,
      continuationFromTrack: null,
      ...overrides
    };
  }

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

    sequence: createSequenceState(),
    sequenceOverlay: {
      visible: false,
      level: 0,
      colors: [],
      colorKey: null,
      shownAtMs: 0,
      ttlMs: 0,
      mode: "sequence"
    },
    sequenceToast: {
      visible: false,
      title: "",
      subtitle: "",
      colorKey: null,
      colors: [],
      cards: [],
      rp: null,
      shownAtMs: 0,
      ttlMs: 0,
      mode: "text"
    },

    subMeta: {
      selectedSlotKey: null,
      selectedSlotIndex: null,
      selectedCardKey: null,
      selectedForge: null,
      showRemoveForSlotKey: null,
      showRemoveForSlotIndex: null,
      selectedPrgSlotType: null,
      selectedPrgBranchKey: null,
      selectedPrgBindingIndex: null,
      selectedWorldSlotType: null,
      selectedWorldBindingIndex: null
    }
  };

  function logRuntimeEvent(category, type, payload, opts) {
    if (typeof window === "undefined" || !window.HC || typeof window.HC.logEvent !== "function" || !type) return;
    window.HC.logEvent(category, type, payload || {}, opts || {});
  }

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

  const SVG_MANIFEST_PATH = "assets/visual/submeta/submeta_svg_manifest.json";
  // Legacy style_correction SVG assets are disabled until a new modular FrameComposer pass exists.
  const LEGACY_SVG_FRAME_ASSETS_ENABLED = false;
  let svgManifestPromise = null;
  let svgManifestMap = null;
  const svgImageCache = new Map();

  function publicAssetPath(path) {
    if (window.HC && typeof window.HC.publicPath === "function") return window.HC.publicPath(path);
    const cleanBase = String(window.HC_PUBLIC_BASE_URL || "/").replace(/\/+$/, "/");
    const cleanPath = String(path || "").replace(/^\/+/, "");
    return cleanBase + cleanPath;
  }

  function ensureSvgManifestLoaded() {
    if (!LEGACY_SVG_FRAME_ASSETS_ENABLED) {
      svgManifestMap = {};
      return Promise.resolve(svgManifestMap);
    }
    if (svgManifestMap) return Promise.resolve(svgManifestMap);
    if (svgManifestPromise) return svgManifestPromise;
    if (typeof fetch !== "function") return Promise.resolve(null);
    svgManifestPromise = fetch(publicAssetPath(SVG_MANIFEST_PATH))
      .then((resp) => (resp && resp.ok ? resp.json() : null))
      .then((json) => {
        svgManifestMap = json && typeof json === "object" ? json : {};
        return svgManifestMap;
      })
      .catch(() => {
        svgManifestMap = {};
        return svgManifestMap;
      });
    return svgManifestPromise;
  }

  function getSvgPath(logicalName) {
    if (!logicalName || !svgManifestMap || typeof svgManifestMap !== "object") return null;
    const path = svgManifestMap[logicalName];
    return typeof path === "string" && path ? path : null;
  }

  function drawManifestSvg(ctx, logicalName, x, y, w, h, alpha = 1) {
    if (!LEGACY_SVG_FRAME_ASSETS_ENABLED) return false;
    if (!ctx || !logicalName || !Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return false;
    if (svgManifestMap === null) {
      ensureSvgManifestLoaded();
      return false;
    }
    const src = getSvgPath(logicalName);
    if (!src || typeof Image === "undefined") return false;
    let entry = svgImageCache.get(logicalName);
    if (!entry) {
      const img = new Image();
      entry = { img, loaded: false, failed: false };
      img.onload = () => { entry.loaded = true; };
      img.onerror = () => { entry.failed = true; };
      img.src = src;
      svgImageCache.set(logicalName, entry);
    }
    if (!entry.loaded || entry.failed) return false;
    ctx.save();
    ctx.globalAlpha = clamp01(alpha);
    ctx.drawImage(entry.img, x, y, w, h);
    ctx.restore();
    return true;
  }

  const SUB_META_SLOTS = [
    { key: "forma", label: "Forma" },
    { key: "intencja", label: "Intencja" },
    { key: "czas", label: "Czas" },
    { key: "cisza", label: "Cisza" }
  ];
  const SUB_META_PRG_BRANCHES = [
    { key: "radius", color: "red" },
    { key: "glue", color: "yellow" },
    { key: "speed", color: "green" },
    { key: "objects", color: "blue" }
  ];
  const SUB_META_PRG_BINDINGS = [
    { from: "radius", to: "speed" },
    { from: "radius", to: "objects" },
    { from: "glue", to: "objects" }
  ];
  const SUB_META_PRG_COLORS = SUB_META_PRG_BRANCHES.reduce((acc, branch) => {
    acc[branch.key] = branch.color;
    return acc;
  }, {});

  const SUB_META_COLORS = ["red", "yellow", "green", "blue"];
  const CARD_KEY_ORDER = ["red", "yellow", "green", "blue"];
  const CARD_KEY_LETTER = {
    red: "A",
    yellow: "B",
    green: "C",
    blue: "D"
  };
  const SUB_META_TIERS = ["DR", "sDR", "pDR"];
  const SUB_META_R2_PAIRS = [
    ["red", "yellow"],
    ["red", "green"],
    ["red", "blue"],
    ["yellow", "green"],
    ["yellow", "blue"],
    ["green", "blue"]
  ];
  const SUB_META_R3_COMBOS = buildSubMetaComboList(3);
  const SUB_META_R4_COMBOS = buildSubMetaComboList(4);
  const SUB_META_ASSIGN_COST = 10;
  const SUB_META_FORGE_ENABLED = true;
  const SUB_META_SCALE = 1.0;
  const SUB_META_CARD_ASPECT = window.HC?.SubMetaCardGeometry?.aspect;
  if (!Number.isFinite(SUB_META_CARD_ASPECT)) throw new Error("[HC.CardEngine] SubMetaCardGeometry must load before cards");
  const SUB_META_CARD_H = 32;
  const SUB_META_CARD_W = SUB_META_CARD_H * SUB_META_CARD_ASPECT;
  const SUB_META_CARD_GAP_X = 12;
  const SUB_META_CARD_GAP_Y = 10;
  const SUB_META_COUNT_PAD = 8;
  const FRAME_COMPOSER_SUBMETA_ROOT_ENABLED = true;
  const FRAME_COMPOSER_SUBMETA_ROOT_DEBUG = false;
  const FRAME_COMPOSER_SUBMETA_ROOT_MANIFEST_URL = "/assets/visual/submeta/submeta_main_frame_v01_manifest.json";
  const FRAME_COMPOSER_SUBMETA_ROOT_VISUAL_OUTSET_X = 44;
  const FRAME_COMPOSER_SUBMETA_ROOT_VISUAL_OUTSET_Y = 54;
  const FRAME_COMPOSER_SUBMETA_ROOT_LAYOUT_OVERRIDES = {
    lineRectInset: {
      x: FRAME_COMPOSER_SUBMETA_ROOT_VISUAL_OUTSET_X,
      y: FRAME_COMPOSER_SUBMETA_ROOT_VISUAL_OUTSET_Y
    },
    contentSafeInset: { x: 42, y: 42 }
  };
  const FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP = {
    corners: {
      tl: "submeta.frame.corner.tl.main_01",
      tr: "submeta.frame.corner.tr.main_01",
      bl: "submeta.frame.corner.bl.main_01",
      br: "submeta.frame.corner.br.main_01"
    },
    segments: {
      topLeft: "submeta.frame.edge.top_left_segment.main_01",
      topRight: "submeta.frame.edge.top_right_segment.main_01",
      bottomLeft: "submeta.frame.edge.bottom_left_segment.main_01",
      bottomRight: "submeta.frame.edge.bottom_right_segment.main_01",
      leftTop: "submeta.frame.edge.left_top_segment.main_01",
      leftBottom: "submeta.frame.edge.left_bottom_segment.main_01",
      rightTop: "submeta.frame.edge.right_top_segment.main_01",
      rightBottom: "submeta.frame.edge.right_bottom_segment.main_01"
    },
    ornaments: {
      topCenter: "submeta.frame.ornament.top_center.main_01",
      bottomCenter: "submeta.frame.ornament.bottom_center.main_01",
      leftCenter: "submeta.frame.ornament.left_center.main_01",
      rightCenter: "submeta.frame.ornament.right_center.main_01"
    }
  };
  const FRAME_COMPOSER_SUBMETA_ROOT_PARTS = [
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.corners.tl,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.corners.tr,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.corners.bl,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.corners.br,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.segments.topLeft,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.segments.topRight,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.segments.bottomLeft,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.segments.bottomRight,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.segments.leftTop,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.segments.leftBottom,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.segments.rightTop,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.segments.rightBottom,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.ornaments.topCenter,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.ornaments.bottomCenter,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.ornaments.leftCenter,
    FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP.ornaments.rightCenter
  ];
  const subMetaRootFrameVisualState = {
    requested: false,
    manifestLoaded: false,
    preloadStatus: "idle",
    preloadSummary: null,
    rootFrameDrawn: false,
    fallbackUsed: true,
    lastLogKey: ""
  };
  const HC_DEBUG_PRG_FRAME_PROBE = !!(typeof window !== "undefined" && window.HC_DEBUG_PRG_FRAME_PROBE);
  const SUB_META_SLOT_COLORS = {
    forma: "red",
    intencja: "yellow",
    czas: "green",
    cisza: "blue"
  };
  const SUB_META_WORLD_BINDINGS = [
    { from: "forma", to: "intencja" },
    { from: "intencja", to: "czas" },
    { from: "czas", to: "cisza" }
  ];
  const SUB_META_META_EFFECTS = {
    forma: {
      DR: ["Planetoidy: orbity -20%.", "Planety: orbity -10%."],
      sDR: ["Planetoidy: orbity -40%.", "Planety + gwiazdy: orbity -20%."],
      pDR: ["Planetoidy: orbity -60%.", "Planety + gwiazdy: orbity -40%."]
    },
    intencja: {
      DR: ["Odbicie od orbity: 30%."],
      sDR: ["Odbicie od orbity: 60%."],
      pDR: ["Odbicie od orbity: 80%."]
    },
    czas: {
      DR: ["+30 sekund do czasu kart aktywowanych."],
      sDR: ["+1 minuta do czasu kart aktywowanych."],
      pDR: ["+2 minuty do czasu kart aktywowanych."]
    },
    cisza: {
      DR: ["Globalny respawn meteorów -20%."],
      sDR: ["Globalny respawn meteorów -40%."],
      pDR: ["Globalny respawn meteorów -60%."]
    }
  };
  const SUB_META_FORGE_RP_COSTS = {
    R1: { sDR: 30, pDR: 90 },
    R2: { sDR: 60, pDR: 180 },
    R3: { sDR: 90, pDR: 270 },
    R4: { sDR: 120, pDR: 360 }
  };
  const SUB_META_FORMA_REDUCTION = {
    DR: { asteroid: 0.20, planet: 0.10, star: 0.0 },
    sDR: { asteroid: 0.40, planet: 0.20, star: 0.20 },
    pDR: { asteroid: 0.60, planet: 0.40, star: 0.40 }
  };
  // TODO: Align FORMA duration with CARDS_SYSTEM when duration is defined.
  const SUB_META_FORMA_DURATION_MS = {
    DR: 60000,
    sDR: 60000,
    pDR: 60000
  };
  const SUB_META_FORMA_FALLBACK_DURATION_MS = 60000;
  const SUB_META_CARD_LIBRARY = buildSubMetaCardLibrary();

  function buildSubMetaComboList(size) {
    const combos = [];
    const colors = SUB_META_COLORS;
    const total = colors.length;
    if (!Number.isFinite(size) || size < 1 || size > total) return combos;
    if (size === total) {
      const key = getCardKey(`R${size}`, colors);
      if (key) combos.push({ key, colors: [...colors] });
      return combos;
    }
    for (let i = 0; i < total - 2; i++) {
      for (let j = i + 1; j < total - 1; j++) {
        for (let k = j + 1; k < total; k++) {
          const comboColors = [colors[i], colors[j], colors[k]];
          const key = getCardKey(`R${size}`, comboColors);
          if (key) combos.push({ key, colors: comboColors });
        }
      }
    }
    return combos;
  }

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

  function ensureSubMetaPrg(World) {
    if (!World) return null;
    if (!World.submeta || typeof World.submeta !== "object") {
      World.submeta = {};
    }
    if (!World.submeta.prg || typeof World.submeta.prg !== "object") {
      World.submeta.prg = {
        activeTab: "radius",
        branches: {
          radius: { r1CardId: null, odbCardId: null },
          glue: { r1CardId: null, odbCardId: null },
          speed: { r1CardId: null, odbCardId: null },
          objects: { r1CardId: null, odbCardId: null }
        },
        bindings: [
          { r2CardId: null, from: null, to: null, active: false },
          { r2CardId: null, from: null, to: null, active: false },
          { r2CardId: null, from: null, to: null, active: false }
        ]
      };
      return World.submeta.prg;
    }
    const prg = World.submeta.prg;
    if (!SUB_META_PRG_COLORS[prg.activeTab]) prg.activeTab = "radius";
    if (!prg.branches || typeof prg.branches !== "object") prg.branches = {};
    SUB_META_PRG_BRANCHES.forEach((branch) => {
      if (!prg.branches[branch.key] || typeof prg.branches[branch.key] !== "object") {
        prg.branches[branch.key] = { r1CardId: null, odbCardId: null };
        return;
      }
      if (!("r1CardId" in prg.branches[branch.key])) prg.branches[branch.key].r1CardId = null;
      if (!("odbCardId" in prg.branches[branch.key])) prg.branches[branch.key].odbCardId = null;
    });
    if (!Array.isArray(prg.bindings)) prg.bindings = [];
    while (prg.bindings.length < 3) {
      prg.bindings.push({ r2CardId: null, from: null, to: null, active: false });
    }
    if (prg.bindings.length > 3) prg.bindings = prg.bindings.slice(0, 3);
    let activeSeen = false;
    prg.bindings.forEach((binding, index) => {
      if (!binding || typeof binding !== "object") return;
      if (!("r2CardId" in binding)) binding.r2CardId = null;
      const fixedBinding = SUB_META_PRG_BINDINGS[index];
      binding.from = fixedBinding ? fixedBinding.from : null;
      binding.to = fixedBinding ? fixedBinding.to : null;
      if (!("active" in binding)) binding.active = false;
      if (binding.active && !activeSeen) {
        activeSeen = true;
      } else if (binding.active) {
        binding.active = false;
      }
    });
    return prg;
  }

  function ensureSubMetaWorld(World) {
    if (!World) return null;
    if (!World.submeta || typeof World.submeta !== "object") {
      World.submeta = {};
    }
    if (!World.submeta.world || typeof World.submeta.world !== "object") {
      World.submeta.world = {
        slots: {
          forma: { cards: [null, null, null], dsUnlocked: false },
          intencja: { cards: [null, null, null], dsUnlocked: false },
          czas: { cards: [null, null, null], dsUnlocked: false },
          cisza: { cards: [null, null, null], dsUnlocked: false }
        },
        bindings: [
          { r2CardId: null, from: null, to: null, active: false },
          { r2CardId: null, from: null, to: null, active: false },
          { r2CardId: null, from: null, to: null, active: false }
        ]
      };
      return World.submeta.world;
    }
    const worldState = World.submeta.world;
    if (!worldState.slots || typeof worldState.slots !== "object") worldState.slots = {};
    SUB_META_SLOTS.forEach((slot) => {
      if (!worldState.slots[slot.key] || typeof worldState.slots[slot.key] !== "object") {
        worldState.slots[slot.key] = { cards: [null, null, null], dsUnlocked: false };
        return;
      }
      const entry = worldState.slots[slot.key];
      if (!Array.isArray(entry.cards)) entry.cards = [];
      while (entry.cards.length < 3) entry.cards.push(null);
      if (entry.cards.length > 3) entry.cards = entry.cards.slice(0, 3);
      if (typeof entry.dsUnlocked !== "boolean") entry.dsUnlocked = false;
    });
    if (!Array.isArray(worldState.bindings)) worldState.bindings = [];
    while (worldState.bindings.length < 3) {
      worldState.bindings.push({ r2CardId: null, from: null, to: null, active: false });
    }
    if (worldState.bindings.length > 3) worldState.bindings = worldState.bindings.slice(0, 3);
    let activeSeen = false;
    worldState.bindings.forEach((binding, index) => {
      if (!binding || typeof binding !== "object") return;
      if (!("r2CardId" in binding)) binding.r2CardId = null;
      const fixedBinding = SUB_META_WORLD_BINDINGS[index];
      binding.from = fixedBinding ? fixedBinding.from : null;
      binding.to = fixedBinding ? fixedBinding.to : null;
      if (!("active" in binding)) binding.active = false;
      if (binding.active && !activeSeen) {
        activeSeen = true;
      } else if (binding.active) {
        binding.active = false;
      }
    });
    return worldState;
  }

  function bindWorld(World) {
    state.world = World;

    if (World.spawnIntervalMul === undefined) World.spawnIntervalMul = 1.0;
    if (World.spawnIntervalMulBase === undefined) World.spawnIntervalMulBase = World.spawnIntervalMul;
    if (World.fxSpawnIntervalMul === undefined) World.fxSpawnIntervalMul = 1.0;
    if (World.score === undefined) World.score = 0;
    if (World.r1HudPulse === undefined) World.r1HudPulse = null;
    if (!Array.isArray(World.sequencePulseColors)) World.sequencePulseColors = [];
    ensureCardsPool(World);
    if (!World.metaSlots || typeof World.metaSlots !== "object") {
      World.metaSlots = { forma: null, intencja: null, czas: null, cisza: null };
    } else {
      for (const slot of SUB_META_SLOTS) {
        if (!(slot.key in World.metaSlots)) World.metaSlots[slot.key] = null;
      }
    }
    ensureSubMetaPrg(World);
    const submetaWorld = ensureSubMetaWorld(World);
    if (submetaWorld) {
      SUB_META_SLOTS.forEach((slot) => {
        const entry = submetaWorld.slots?.[slot.key];
        if (!entry) return;
        if (World.metaSlots?.[slot.key]) {
          entry.cards[0] = World.metaSlots[slot.key];
        } else if (entry.cards?.[0]) {
          World.metaSlots[slot.key] = entry.cards[0];
        }
      });
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
    if (World.formaOrbitReductionAsteroidBase === undefined) World.formaOrbitReductionAsteroidBase = 0;
    if (World.formaOrbitReductionPlanetBase === undefined) World.formaOrbitReductionPlanetBase = 0;
    if (World.formaOrbitReductionStarBase === undefined) World.formaOrbitReductionStarBase = 0;
    requestSubMetaRootFrameAssets();
    if (!Array.isArray(state.sequence.tempCards)) state.sequence.tempCards = [];
    World.cardsTemp = state.sequence.tempCards;
    const runTimers = window.HC && window.HC.RunTimers;
    if (runTimers && typeof runTimers.ensure === "function") {
      runTimers.ensure(World);
    }
    const worldSlots = window.HC && window.HC.WorldSlots;
    if (worldSlots && typeof worldSlots.ensure === "function") {
      worldSlots.ensure(World);
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
      { label: "Asteroid mass → planet", group: "planets", desc: "Docelowa masa asteroidy do przejścia w planetę; legacy alias planetCaptureTarget pozostaje zsynchronizowany.", kind: "number", min: 3, max: 60, step: 1 },
      {
        get: () => World.asteroidGrowthTarget ?? World.planetCaptureTarget,
        set: (v) => {
          const next = clampInt(v, 3, 60);
          World.asteroidGrowthTarget = next;
          World.planetCaptureTarget = next;
        }
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

    if (!state._sequenceListenerBound) {
      state._sequenceListenerBound = true;
    }
  }

  function nowMs() {
    return (state.world && state.world.nowMs) ? state.world.nowMs : performance.now();
  }

  function startR1TimerForColor(World, colorKey, durationMs, nowMsValue) {
    if (!World || !colorKey) return;
    const t = Number(nowMsValue);
    const dur = Number(durationMs);
    if (!Number.isFinite(t) || !Number.isFinite(dur) || dur <= 0) return;
    if (!World.r1ColorTimers || typeof World.r1ColorTimers !== "object") {
      World.r1ColorTimers = {};
    }
    World.r1ColorTimers[colorKey] = t + dur;
  }

  function isColorR1Active(colorKey, nowMsValue) {
    const World = state.world;
    const key = normalizePack01Color(colorKey);
    if (!World || !key) return false;
    const timers = World.r1ColorTimers;
    if (!timers || typeof timers !== "object") return false;
    const t = Number((typeof nowMsValue === "number") ? nowMsValue : nowMs());
    if (!Number.isFinite(t)) return false;
    return Number(timers[key] || 0) > t;
  }

  function addScoreToWorld(World, bonus) {
    const amount = Math.max(0, Math.floor(Number(bonus || 0)));
    if (!World || !amount) return;
    if (typeof window !== "undefined" && typeof window.addScore === "function") {
      window.addScore(amount);
    } else {
      World.score = Math.max(0, Math.floor((World.score || 0) + amount));
    }
  }

  function emitResetToIdle(reason, previous, extras) {
    const payload = {
      reason: reason || "reset",
      previousTrack: previous.track || null,
      previousStage: previous.stage || "IDLE",
      previousChainColors: Array.isArray(previous.chainColors) ? previous.chainColors.slice() : [],
      finalReward: extras?.finalReward || null,
      sequenceAfterReset: {
        active: Boolean(state.sequence?.active),
        stage: state.sequence?.stage || "IDLE",
        track: state.sequence?.track || null,
        stepIndex: Number(state.sequence?.stepIndex || 0),
        chainColors: Array.isArray(state.sequence?.chainColors) ? state.sequence.chainColors.slice() : [],
      }
    };
    emitSequenceEvent("sequence.reset_to_idle", payload, { source: "CardEngine.resetSequenceState", snapshot: true });
  }

  function resetSequenceState(reason = "reset", extras = null) {
    const previous = state.sequence || createSequenceState();
    const previousSnapshot = {
      track: previous.track || null,
      stage: previous.stage || getSequenceStage(previous) || "IDLE",
      chainColors: Array.isArray(previous.chainColors) ? previous.chainColors.slice() : [],
    };
    state.sequence = createSequenceState({
      resolutionId: Number(previous.resolutionId || 0) + 1,
      lastResolution: previous.lastResolution || null,
    });
    if (state.sequenceOverlay) state.sequenceOverlay.visible = false;
    if (state.world) {
      state.world.cardsTemp = state.sequence.tempCards;
      state.world.sequencePulseColors = [];
      state.world.sequenceDirectionColor = null;
      state.world.sequenceFlashColors = [];
    }
    emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_RESET, {
      reason,
      previousResolution: previous.lastResolution || null,
    }, { source: "CardEngine.resetSequenceState", snapshot: true });
    emitResetToIdle(reason, previousSnapshot, extras);
    traceSeqHit("reset", null, { reason: "resetSequenceState" });
  }

  function shouldTraceSeq() {
    return typeof window !== "undefined" && window.HC && window.HC.debugSeq;
  }

  function pushSeqTrace(entry) {
    if (!shouldTraceSeq()) return;
    if (!window.HC) window.HC = {};
    if (!Array.isArray(window.HC.seqTrace)) window.HC.seqTrace = [];
    window.HC.seqTrace.push(entry);
  }

  function getSeqTraceSnapshot(seq) {
    return {
      active: Boolean(seq.active),
      currentColor: seq.currentColor,
      hits: Number(seq.hits || 0),
      colorsClosed: Array.isArray(seq.colorsClosed) ? seq.colorsClosed.slice() : [],
      track: seq.track,
      baseColor: seq.baseColor,
      stepIndex: Number(seq.stepIndex || 0),
      phase: seq.phase
    };
  }

  function getHitSnapshot(seq) {
    return {
      phase: seq.phase,
      hits: Number(seq.hits || 0),
      currentColor: seq.currentColor,
      track: seq.track,
      stepIndex: Number(seq.stepIndex || 0),
      expectedColor: seq.expectedColor || null,
      stage: seq.stage || "IDLE",
      chainColors: Array.isArray(seq.chainColors) ? seq.chainColors.slice() : [],
    };
  }

  function getSequenceStage(seq) {
    if (seq && seq.continuationMode === "choose_on_next_color") return "CHOOSE";
    if (!seq.track) return "R1";
    if (seq.track === "A") {
      if (seq.stepIndex <= 0) return "R1";
      if (seq.stepIndex === 1) return "AA";
      return "AAA";
    }
    if (seq.stepIndex <= 0) return "R1";
    if (seq.stepIndex === 1) return "R2";
    if (seq.stepIndex === 2) return "R3";
    return "R4";
  }

  function emitSequenceEvent(type, payload = {}, opts = {}) {
    logRuntimeEvent("sequence", type, payload, opts);
  }

  function syncSequenceDerivedState(seq, reason, opts = {}) {
    const prevExpected = seq.expectedColor || null;
    const prevStage = seq.stage || "IDLE";
    const expectedColor = seq.mode === "IN_STEP" ? normalizePack01Color(seq.currentColor) : null;
    seq.expectedColor = expectedColor;
    seq.hitCount = Number(seq.hits || 0);
    seq.chainColors = Array.isArray(seq.colorsClosed) ? seq.colorsClosed.slice() : [];
    seq.stage = seq.active ? getSequenceStage(seq) : "IDLE";
    seq.loopMode = seq.track === "A" ? (seq.stepIndex >= 2 ? "AAA" : (seq.stepIndex >= 1 ? "AA" : "AA")) : null;
    if (prevExpected !== seq.expectedColor) {
      emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_EXPECTED_COLOR_CHANGED, {
        reason: reason || "sync",
        previous: prevExpected,
        current: seq.expectedColor,
        stage: seq.stage,
        hitCount: seq.hitCount,
        chainColors: seq.chainColors.slice(),
      }, { source: "CardEngine.syncSequenceDerivedState", snapshot: Boolean(opts.snapshot) });
    }
    if (prevStage !== seq.stage && opts.emitStageEvent) {
      emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_STEP_STARTED, {
        reason: reason || "sync",
        previousStage: prevStage,
        stage: seq.stage,
        expectedColor: seq.expectedColor,
        chainColors: seq.chainColors.slice(),
      }, { source: "CardEngine.syncSequenceDerivedState" });
    }
  }

  function traceSeqHit(action, normalizedColor, details) {
    if (!shouldTraceSeq()) return;
    const seq = state.sequence;
    const entry = {
      t: nowMs(),
      action,
      color: normalizedColor,
      ...getSeqTraceSnapshot(seq),
      ...(details && typeof details === "object" ? details : {})
    };
    pushSeqTrace(entry);
    console.log("[SEQ_TRACE]", entry);
  }

  function showSequenceOverlay(level, colors, colorKey, ttlMs) {
    const options = arguments.length > 4 ? arguments[4] : null;
    const now = nowMs();
    const overlayLevel = Math.max(1, Math.min(4, Number(level || 1)));
    const overlayColors = Array.isArray(colors) ? colors.slice() : [];
    const trackKey = options && options.mode ? String(options.mode) : "sequence";
    const overlayColor = colorKey || null;
    state.sequenceOverlay = {
      visible: true,
      level: overlayLevel,
      colors: overlayColors,
      colorKey: overlayColor,
      shownAtMs: now,
      ttlMs: Math.max(0, Number(ttlMs || 0)),
      mode: trackKey
    };
    const seq = state.sequence || createSequenceState();
    const continuationTarget = getOverlayContinuationTarget(state.sequenceOverlay);
    emitSequenceEvent("sequence.decision_window_opened", {
      track: seq.track || trackKey || null,
      stage: seq.stage || getSequenceStage(seq) || null,
      stepIndex: Number(seq.stepIndex || 0),
      chainColors: Array.isArray(seq.chainColors) ? seq.chainColors.slice() : [],
      currentColor: seq.currentColor || null,
      completedColor: overlayColor || null,
      offeredActions: {
        activateR1Color: overlayColor || null,
        cashoutTarget: getDecisionLabelForLevel(overlayLevel, seq.track),
        timeoutContinuationTarget: continuationTarget,
      },
      pendingUntilMs: now + Math.max(0, Number(ttlMs || 0)),
      ttlMs: Math.max(0, Number(ttlMs || 0)),
      sessionTimeMs: Math.max(0, Math.floor(performance.now() - (window.HC?.Session?.logger?.sessionStartedAt || performance.now()))),
      frame: Number(window.HC?.Session?.logger?.frame ?? -1),
    }, { source: "CardEngine.showSequenceOverlay" });
  }

  function getDecisionLabelForLevel(level, track) {
    const cappedLevel = Math.max(1, Math.min(4, Number(level || 1)));
    if (track === "A") return ["A", "AA", "AAA"][cappedLevel - 1] || `A${cappedLevel}`;
    return `R${cappedLevel}`;
  }

  function getOverlayContinuationTarget(overlay) {
    if (!overlay) return null;
    const rawMode = overlay.mode;
    const mode = rawMode === "A" ? "A" : (rawMode === "CHOOSE" ? "CHOOSE" : "R");
    const level = Math.max(1, Math.min(4, Number(overlay.level || 1)));
    if (mode === "CHOOSE") {
      return "choose_on_next_color";
    }
    if (mode === "A") {
      if (level <= 1) return "AA";
      if (level === 2) return "AAA";
      return "IDLE";
    }
    if (level >= 4) return "IDLE";
    return `R${level + 1}`;
  }

  function showSequenceToast(title, subtitle, colorKey, ttlMs) {
    const options = arguments.length > 4 ? arguments[4] : null;
    const now = nowMs();
    state.sequenceToast = {
      visible: true,
      title: String(title || ""),
      subtitle: String(subtitle || ""),
      colorKey: colorKey || null,
      colors: [],
      cards: Array.isArray(options?.cards) ? options.cards.slice() : [],
      rp: Number.isFinite(options?.rp) ? options.rp : null,
      shownAtMs: now,
      ttlMs: Math.max(0, Number(ttlMs || 0)),
      mode: "text"
    };
  }

  function showSequenceFailToast(pointsLabel, colors, ttlMs) {
    const options = arguments.length > 3 ? arguments[3] : null;
    const now = nowMs();
    state.sequenceToast = {
      visible: true,
      title: String(pointsLabel || "+RP"),
      subtitle: "",
      colorKey: null,
      colors: Array.isArray(colors) ? colors.slice() : [],
      cards: Array.isArray(options?.cards) ? options.cards.slice() : [],
      rp: Number.isFinite(options?.rp) ? options.rp : null,
      shownAtMs: now,
      ttlMs: Math.max(0, Number(ttlMs || 0)),
      mode: "fail"
    };
  }

  function showSequenceDsToast(colorKey, ttlMs) {
    const options = arguments.length > 2 ? arguments[2] : null;
    const now = nowMs();
    state.sequenceToast = {
      visible: true,
      title: "",
      subtitle: "",
      colorKey: colorKey || null,
      colors: [],
      cards: Array.isArray(options?.cards) ? options.cards.slice() : [],
      rp: Number.isFinite(options?.rp) ? options.rp : null,
      shownAtMs: now,
      ttlMs: Math.max(0, Number(ttlMs || 0)),
      mode: "ds"
    };
  }

  function getSequenceMultiplier(level, chainIndex) {
    const idx = Math.max(1, Math.min(4, Number(level || 1)));
    const chain = Number(chainIndex || 0) >= 1 ? 5 : 1;
    return idx + chain;
  }

  function getPoolCardCountsByKind(World, kind, color) {
    const pool = Array.isArray(World?.cardsPool) ? World.cardsPool : [];
    const kindKey = String(kind || "").toUpperCase();
    const colorKey = normalizePack01Color(color);
    let total = 0;
    let colorTotal = 0;
    for (const card of pool) {
      if (!card) continue;
      const cardKind = String(card.kind || card.type || "").toUpperCase();
      if (cardKind !== kindKey) continue;
      total += 1;
      if (colorKey && normalizePack01Color(card.colorA) === colorKey) colorTotal += 1;
    }
    return { kind: kindKey, total, color: colorKey, colorTotal };
  }

  function startSequenceSession() {
    const seq = state.sequence;
    Object.assign(seq, createSequenceState({
      active: true,
      rpStart: Math.floor(Number(state.world?.score || 0)),
      resolutionId: Number(seq.resolutionId || 0) + 1,
    }));
    if (state.world) {
      state.world.cardsTemp = seq.tempCards;
    }
    syncSequenceDerivedState(seq, "start-session", { emitStageEvent: true });
    logRuntimeEvent("sequence", window.HC?.DebugEventTypes?.SEQUENCE_STARTED, {
      rpStart: seq.rpStart,
    }, { source: "CardEngine.startSequenceSession", snapshot: true });
  }

  function setSequencePhase(seq, phase) {
    seq.phase = phase;
    if (phase === "OPEN") {
      seq.opened = true;
    }
    syncSequenceDerivedState(seq, `phase-${phase}`);
    logRuntimeEvent("sequence", window.HC?.DebugEventTypes?.SEQUENCE_STEP_PROGRESS, {
      phase,
      stepIndex: seq.stepIndex,
      track: seq.track || null,
      expectedColor: seq.expectedColor || null,
      stage: seq.stage || null,
      chainColors: seq.chainColors || [],
    }, { source: "CardEngine.setSequencePhase" });
  }

  function commitSequenceNewRewards(World, seq, cards) {
    if (!World || !Array.isArray(cards) || !cards.length) return 0;
    const pending = [];
    cards.forEach((card) => {
      if (!card) return;
      const rewardKey = getRewardDedupeKey(card);
      if (rewardKey && !card._allowSequenceDuplicate) {
        if (!seq.committedKeys) seq.committedKeys = new Set();
        if (seq.committedKeys.has(rewardKey)) return;
        seq.committedKeys.add(rewardKey);
      }
      pending.push(card);
    });
    if (!pending.length) return 0;
    return commitSequenceRewards(World, pending, { enforceUnique: true });
  }

  function pushSequenceReward(World, seq, payload, { setPending = false, allowDuplicate = false } = {}) {
    if (!payload) return null;
    if (!Array.isArray(seq.tempCards)) seq.tempCards = [];
    const entity = createCardEntity(payload);
    if (!entity) return null;
    const rewardKey = getRewardDedupeKey(entity);
    if (rewardKey && !allowDuplicate) {
      const existing = seq.tempCards.find((card) => getRewardDedupeKey(card) === rewardKey);
      if (existing) {
        if (setPending) {
          const now = nowMs();
          World.pendingCard = existing;
          World.pendingCardUntilMs = now + 3000;
        }
        return existing;
      }
    }
    if (allowDuplicate) entity._allowSequenceDuplicate = true;
    seq.tempCards.push(entity);
    if (setPending) {
      const now = nowMs();
      World.pendingCard = entity;
      World.pendingCardUntilMs = now + 3000;
    }
    return entity;
  }

  function awardSequenceStep(World, seq) {
    if (!World) return null;
    const level = seq.stepIndex;
    const baseColor = normalizePack01Color(seq.A || seq.baseColor);
    if (!baseColor) return null;
    let reward = null;
    if (level === 1) {
      reward = pushSequenceReward(World, seq, { kind: "R1", tier: "DR", colorA: baseColor }, { setPending: true });
    } else if (seq.track === "R") {
      if (level === 2) {
        reward = pushSequenceReward(World, seq, { kind: "R2", tier: "DR", colorA: seq.A, colorB: seq.B });
      } else if (level === 3) {
        reward = pushSequenceReward(World, seq, { kind: "R3", tier: "DR", colorA: seq.A, colorB: seq.B, colorC: seq.C });
      } else if (level === 4) {
        reward = pushSequenceReward(World, seq, {
          kind: "R4",
          tier: "DR",
          colorA: seq.A,
          colorB: seq.B,
          colorC: seq.C,
          colorD: seq.D
        });
      }
    } else if (seq.track === "A") {
      if (level === 2) {
        reward = pushSequenceReward(World, seq, { kind: "R1", tier: "DR", colorA: baseColor }, { allowDuplicate: true });
      } else if (level === 3) {
        reward = pushSequenceReward(World, seq, { kind: "DS", tier: "DR", colorA: baseColor });
      }
    }
    if (reward) {
      commitSequenceNewRewards(World, seq, [reward]);
      seq.earned.push(reward);
    }
    return reward;
  }

  function closeSequenceStep(World) {
    const seq = state.sequence;
    const colorKey = seq.currentColor;
    seq.stepIndex += 1;
    if (seq.stepIndex === 1 && colorKey) {
      seq.A = colorKey;
      seq.baseColor = colorKey;
    }
    if (seq.track === "R") {
      if (seq.stepIndex === 2 && colorKey) {
        seq.B = seq.B || colorKey;
      } else if (seq.stepIndex === 3 && colorKey) {
        seq.C = seq.C || colorKey;
      } else if (seq.stepIndex === 4 && colorKey) {
        seq.D = seq.D || colorKey;
      }
    } else if (seq.track === "A" && colorKey) {
      if (!seq.A) seq.A = colorKey;
      if (!seq.baseColor) seq.baseColor = colorKey;
    }
    const rewardCard = awardSequenceStep(World, seq);
    syncSequenceDerivedState(seq, "step-completed");
    logRuntimeEvent("sequence", window.HC?.DebugEventTypes?.SEQUENCE_STEP_COMPLETED, {
      stepIndex: seq.stepIndex,
      track: seq.track || null,
      color: colorKey || null,
      rewardCardId: rewardCard?.id || null,
      stage: seq.stage || null,
      chainColors: seq.chainColors || [],
    }, { source: "CardEngine.closeSequenceStep", snapshot: true });
    handleSequenceStepClosed(World, rewardCard);
  }

  function canStartStepWithColor(seq, normalized) {
    if (seq.track === "A") {
      const baseColor = normalizePack01Color(seq.A || seq.baseColor);
      if (baseColor && normalized !== baseColor) {
        return { ok: false, reason: "a-track-mismatch" };
      }
      return { ok: true };
    }
    if (seq.track === "R") {
      if (seq.stepIndex === 2) {
        if (normalized === seq.A || normalized === seq.B) {
          return { ok: false, reason: "r-track-invalid-c" };
        }
        return { ok: true };
      }
      if (seq.stepIndex === 3) {
        if (normalized === seq.A || normalized === seq.B || normalized === seq.C) {
          return { ok: false, reason: "r-track-invalid-d" };
        }
        return { ok: true };
      }
    }
    return { ok: true };
  }

  function applyDirectionSelection(seq, normalized) {
    if (seq.stepIndex === 1 && !seq.track) {
      if (normalized === seq.A) {
        seq.track = "A";
      } else {
        seq.track = "R";
        seq.B = normalized;
      }
    }
    if (seq.track === "R") {
      if (seq.stepIndex === 2) {
        seq.C = normalized;
      } else if (seq.stepIndex === 3) {
        seq.D = normalized;
      }
    }
  }

  function handleSequenceStepClosed(World, rewardCard) {
    const seq = state.sequence;
    const colorKey = seq.currentColor;
    if (colorKey) {
      seq.colorsClosed.push(colorKey);
    }
    if (!seq.baseColor && colorKey) {
      seq.baseColor = colorKey;
    }
    syncSequenceDerivedState(seq, "step-closed");
    const level = seq.stepIndex;
    const colors = seq.colorsClosed.slice(0, level);
    const normalizedColors = colors.map((color) => normalizePack01Color(color)).filter(Boolean);
    const overlayMode = !seq.track && level === 1 ? "CHOOSE" : (seq.track === "A" ? "A" : "R");
    const maxLevel = seq.track === "A" ? 3 : 4;
    const isTerminal = seq.track && level >= maxLevel;
    if (seq.track === "A" && level === 2) {
      emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_LOOP_AA_COMPLETED, {
        stage: "AA",
        chainColors: seq.chainColors || [],
        color: seq.baseColor || seq.A || colorKey || null,
      }, { source: "CardEngine.handleSequenceStepClosed" });
      emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_LOOP_AAA_STARTED, {
        stage: "AAA",
        chainColors: seq.chainColors || [],
        color: seq.baseColor || seq.A || colorKey || null,
      }, { source: "CardEngine.handleSequenceStepClosed" });
    }
    if (!isTerminal) {
      showSequenceOverlay(level, colors, colorKey, 3000, { mode: overlayMode });
    }
    if (World && colorKey) {
      const flashColors = normalizedColors.slice(0, level);
      flashColors.startedAtMs = nowMs();
      flashColors.durationMs = 450;
      World.sequenceFlashColors = flashColors;
    }
    if (level >= 4 && seq.chainPattern.length === 0) {
      seq.chainPattern = seq.colorsClosed.slice(0, 4);
    }
    if (seq.chainPattern.length && seq.chainIndex === 1) {
      const expected = seq.chainPattern;
      const mismatch = seq.colorsClosed.some((closedColor, idx) => closedColor !== expected[idx]);
      if (mismatch) {
        seq.chainIndex = 0;
        seq.chainPattern = [];
      } else if (level >= 4) {
        seq.chainIndex = 0;
        seq.chainPattern = [];
      }
    }
    seq.currentColor = null;
    seq.hits = 0;
    seq.opened = false;
    seq.phase = null;
    seq.mode = "IDLE";
    syncSequenceDerivedState(seq, "post-step-reset", { snapshot: true });
    if (World) {
      World.sequencePulseColors = [];
    }
    if (isTerminal) {
      finalizeSequence(World, level, colors, rewardCard);
    }
  }

  function rewardSequenceFail(World) {
    const seq = state.sequence;
    if (!World || !Array.isArray(seq.tempCards) || !seq.tempCards.length) return;
    ensureCardsPool(World);
    commitSequenceNewRewards(World, seq, seq.tempCards);
    seq.tempCards.length = 0;
    if (World.cardsTemp) World.cardsTemp.length = 0;
  }

  function failSequence(World) {
    const seq = state.sequence;
    if (seq.resolutionLock) return;
    seq.resolutionLock = true;
    const completedColors = seq.colorsClosed.slice();
    const awardedCards = Array.isArray(seq.tempCards) ? seq.tempCards.slice() : [];
    const rpDelta = Math.floor(Number(World?.score || 0)) - Math.floor(Number(seq.rpStart || 0));
    const interruptedColor = normalizePack01Color(seq.currentColor);
    const interruptedStage = seq.stage || getSequenceStage(seq) || null;
    const interruptedStepIndex = Number(seq.stepIndex || 0);
    emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_FAIL_DETECTED, {
      expectedColor: seq.expectedColor || null,
      stage: interruptedStage,
      interruptedColor: interruptedColor || null,
      interruptedStepIndex,
      completedColors,
      reason: "color-mismatch-or-invalid-start",
    }, { source: "CardEngine.failSequence", severity: "warn" });
    rewardSequenceFail(World);
    if (completedColors.length) {
      showSequenceFailToast(`${rpDelta} RP`, completedColors, 2000, { cards: awardedCards, rp: rpDelta });
    }
    logRuntimeEvent("sequence", window.HC?.DebugEventTypes?.SEQUENCE_FAILED, {
      completedColors,
      rpDelta,
      awardedCards: awardedCards.map((card) => card?.id).filter(Boolean),
    }, { source: "CardEngine.failSequence", snapshot: true, severity: "warn" });
    emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_FAIL_RESOLVED, {
      completedColors,
      rpDelta,
      awardedCards: awardedCards.map((card) => card?.id).filter(Boolean),
      stage: interruptedStage,
      interruptedColor: interruptedColor || null,
      interruptedStepIndex,
      autoResolved: true,
    }, { source: "CardEngine.failSequence", snapshot: true, severity: "warn" });
    seq.lastResolution = "failed";
    resetSequenceState("fail", { finalReward: awardedCards.map((card) => card?.id).filter(Boolean) });
  }

  function finalizeSequence(World, level, colors, rewardCard) {
    const seq = state.sequence;
    if (seq.resolutionLock) return;
    seq.resolutionLock = true;
    if (!World) {
      resetSequenceState("reset");
      return;
    }
    const cappedLevel = Math.max(1, Math.min(4, Number(level || 1)));
    const seqColors = (Array.isArray(colors) ? colors : []).map(normalizePack01Color).filter(Boolean);
    const label = seq.track === "A"
      ? (["A", "AA", "AAA"][cappedLevel - 1] || `A${cappedLevel}`)
      : `R${cappedLevel}`;
    const rpDelta = Math.floor(Number(World?.score || 0)) - Math.floor(Number(seq.rpStart || 0));
    const awardedCards = rewardCard ? [rewardCard] : [];
    if (seq.track === "A" && cappedLevel >= 3) {
      if (Array.isArray(seq.earned) && seq.earned.length) {
        for (let i = World.cardsPool.length - 1; i >= 0; i--) {
          const poolCard = World.cardsPool[i];
          const shouldRemove = seq.earned.some((earnedCard) => earnedCard === poolCard
            && String(poolCard?.kind || poolCard?.type || "").toUpperCase() !== "DS");
          if (shouldRemove) World.cardsPool.splice(i, 1);
        }
      }
      recomputeTotalCards(World);
      showSequenceDsToast(seq.baseColor || seq.A, 1500, { cards: awardedCards, rp: rpDelta });
      const dsCountsBefore = getPoolCardCountsByKind(World, "DS", seq.baseColor || seq.A || null);
      emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_DS_GRANTED, {
        color: seq.baseColor || seq.A || null,
        stage: "AAA",
        cardId: rewardCard?.id || null,
        source: "AAA",
        sequenceBeforeReset: {
          track: seq.track || null,
          stage: seq.stage || null,
          stepIndex: Number(seq.stepIndex || 0),
          chainColors: Array.isArray(seq.chainColors) ? seq.chainColors.slice() : [],
        },
        cardCountsBefore: dsCountsBefore,
        cardCountsAfter: getPoolCardCountsByKind(World, "DS", seq.baseColor || seq.A || null),
        rpDelta,
      }, { source: "CardEngine.finalizeSequence", snapshot: true });
      World.pendingCard = null;
      World.pendingCardUntilMs = 0;
      if (state.sequenceOverlay) state.sequenceOverlay.visible = false;
      if (Array.isArray(seq.earned)) seq.earned.length = 0;
    } else {
      showSequenceToast(
        `Kolekcja ${label}`,
        `Sekwencja zamknięta. ${rpDelta} RP`,
        seqColors[cappedLevel - 1] || seqColors[0],
        1500,
        { cards: awardedCards, rp: rpDelta }
      );
    }
    if (seq.tempCards) seq.tempCards.length = 0;
    if (World.cardsTemp) World.cardsTemp.length = 0;
    seq.lastResolution = "completed";
    resetSequenceState(seq.track === "A" && cappedLevel >= 3 ? "aaa_completed" : "completed", {
      finalReward: awardedCards.map((card) => card?.id).filter(Boolean)
    });
  }

  function onHitColor(colorKey, collisionContext = null) {
    const World = state.world;
    const normalized = normalizePack01Color(colorKey);
    const debugSeq = typeof window !== "undefined" && window.HC && window.HC.debugSeq;
    const logIgnored = (reason, details) => {
      if (!debugSeq) return;
      if (details) {
        console.log("[SEQ_HIT_IGNORED]", reason, details);
        return;
      }
      console.log("[SEQ_HIT_IGNORED]", reason);
    };
    if (!World || !normalized) {
      logIgnored("invalid-world-or-color", { colorKey, normalized });
      traceSeqHit("ignored", normalized, { reason: "invalid-world-or-color" });
      return { action: "ignored", snapshot: null };
    }
    const frame = Number(window.HC?.Session?.logger?.frame ?? -1);
    const hitSignature = `${normalized}:${frame}`;
    if (state.sequence.lastHitSignature === hitSignature) {
      emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_HIT_REJECTED, {
        color: normalized,
        reason: "duplicate-hit-signature",
        sourceObject: collisionContext?.sourceObject || null,
        context: collisionContext || null,
      }, { source: "CardEngine.onHitColor" });
      return { action: "ignored", snapshot: getHitSnapshot(state.sequence) };
    }
    state.sequence.lastHitSignature = hitSignature;
    if (debugSeq) {
      const overlayVisible = Boolean(state.sequenceOverlay && state.sequenceOverlay.visible);
      const hasPending = Boolean(World.pendingCard);
      if (overlayVisible || hasPending) {
        console.log("[SEQ_HIT_INFO] overlay/pending present; continuing hit processing.", {
          overlayVisible,
          hasPending
        });
      }
    }

    const seq = state.sequence;
    if (!seq.active) {
      startSequenceSession();
    }
    emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_HIT_REGISTERED, {
      color: normalized,
      expectedColor: seq.expectedColor || null,
      hitCount: seq.hitCount || seq.hits || 0,
      stage: seq.stage || null,
      chainColors: seq.chainColors || [],
      sourceObject: collisionContext?.sourceObject || null,
      context: collisionContext || null,
    }, { source: "CardEngine.onHitColor" });

    if (seq.mode === "IDLE") {
      const continuationMode = seq.continuationMode || null;
      const continuationFromStage = seq.continuationFromStage || seq.stage || null;
      const continuationFromTrack = seq.continuationFromTrack || seq.track || null;
      const gate = canStartStepWithColor(seq, normalized);
      if (!gate.ok) {
        if (continuationMode === "timeout_after_AA") {
          emitSequenceEvent("sequence.continuation_resolved", {
            fromStage: continuationFromStage,
            fromTrack: continuationFromTrack,
            toStage: "R1",
            toTrack: null,
            reason: "mismatch_after_timeout",
            color: normalized,
            baseColor: seq.baseColor || seq.A || null,
            route: "FAIL_TAKEOVER",
          }, { source: "CardEngine.onHitColor", snapshot: true });
        }
        emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_HIT_REJECTED, {
          color: normalized,
          expectedColor: seq.expectedColor || null,
          stage: seq.stage || null,
          reason: gate.reason,
          chainColors: seq.chainColors || [],
        }, { source: "CardEngine.onHitColor", severity: "warn" });
        traceSeqHit("fail", normalized, { reason: gate.reason });
        failSequence(World);
        if (continuationMode === "timeout_after_AA") {
          if (!state.sequence.active) {
            startSequenceSession();
          }
          const restarted = state.sequence;
          applyDirectionSelection(restarted, normalized);
          restarted.currentColor = normalized;
          restarted.hits = 1;
          restarted.opened = false;
          restarted.mode = "IN_STEP";
          restarted.continuationMode = null;
          restarted.continuationFromStage = null;
          restarted.continuationFromTrack = null;
          setSequencePhase(restarted, "DIR");
          emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_DIRECTION_LOCKED, {
            currentColor: normalized,
            expectedColor: normalized,
            hitCount: 1,
            stage: restarted.stage || null,
            takeoverAfterFail: true,
            reason: "post-fail-direction-takeover",
            sourceObject: collisionContext?.sourceObject || null,
          }, { source: "CardEngine.onHitColor", snapshot: true });
          {
            const level = restarted.stepIndex + 1;
            addScoreToWorld(World, getSequenceMultiplier(level, restarted.chainIndex));
          }
          traceSeqHit("dir", normalized, { reason: "post-fail-direction-takeover" });
          const restartedSnapshot = getHitSnapshot(restarted);
          restarted.lastHitSnapshot = restartedSnapshot;
          return { action: "dir", snapshot: restartedSnapshot };
        }
        const snapshot = getHitSnapshot(state.sequence);
        state.sequence.lastHitSnapshot = snapshot;
        return { action: "fail", snapshot };
      }
      if (seq.chainPattern.length) {
        const expectedStart = normalizePack01Color(seq.chainPattern[0]);
        if (expectedStart && normalized === expectedStart) {
          seq.chainIndex = 1;
        } else {
          seq.chainIndex = 0;
          seq.chainPattern = [];
        }
      }
      applyDirectionSelection(seq, normalized);
      if (continuationMode === "choose_on_next_color") {
        const route = seq.track === "A" ? "A_LOOP_AA" : "R_TRACK_R2";
        const toStage = seq.track === "A" ? "AA" : "R2";
        emitSequenceEvent("sequence.continuation_resolved", {
          fromStage: continuationFromStage,
          fromTrack: continuationFromTrack,
          toStage,
          toTrack: seq.track || null,
          reason: "color_selected_after_timeout",
          color: normalized,
          baseColor: seq.baseColor || seq.A || null,
          route,
        }, { source: "CardEngine.onHitColor", snapshot: true });
        if (route === "A_LOOP_AA") {
          emitSequenceEvent("sequence.a_loop_entered", {
            loopLevel: "AA",
            color: seq.baseColor || seq.A || normalized,
            source: "timeout_after_R1",
            chainColors: seq.chainColors || [],
            expectedColor: seq.expectedColor || null,
          }, { source: "CardEngine.onHitColor", snapshot: true });
        }
      } else if (continuationMode === "timeout_after_AA") {
        emitSequenceEvent("sequence.continuation_resolved", {
          fromStage: continuationFromStage,
          fromTrack: continuationFromTrack,
          toStage: "AAA",
          toTrack: "A",
          reason: "color_selected_after_timeout",
          color: normalized,
          baseColor: seq.baseColor || seq.A || null,
          route: "A_LOOP_AAA",
        }, { source: "CardEngine.onHitColor", snapshot: true });
        emitSequenceEvent("sequence.a_loop_entered", {
          loopLevel: "AAA",
          color: seq.baseColor || seq.A || normalized,
          source: "timeout_after_AA",
          chainColors: seq.chainColors || [],
          expectedColor: seq.expectedColor || null,
        }, { source: "CardEngine.onHitColor", snapshot: true });
      }
      seq.currentColor = normalized;
      seq.hits = 1;
      seq.opened = false;
      seq.mode = "IN_STEP";
      seq.continuationMode = null;
      seq.continuationFromStage = null;
      seq.continuationFromTrack = null;
      setSequencePhase(seq, "DIR");
      emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_DIRECTION_LOCKED, {
        currentColor: normalized,
        expectedColor: seq.expectedColor || normalized,
        hitCount: seq.hitCount || seq.hits,
        stage: seq.stage || null,
        chainColors: seq.chainColors || [],
        sourceObject: collisionContext?.sourceObject || null,
      }, { source: "CardEngine.onHitColor", snapshot: true });
      if (seq.track === "A" && seq.stepIndex >= 1) {
        const loopLevel = seq.stepIndex >= 2 ? "AAA" : "AA";
        emitSequenceEvent("sequence.a_loop_entered", {
          loopLevel,
          color: seq.baseColor || seq.A || normalized,
          source: "continuation_after_timeout",
          chainColors: seq.chainColors || [],
          expectedColor: seq.expectedColor || null,
        }, { source: "CardEngine.onHitColor", snapshot: true });
      }
      emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_STEP_STARTED, {
        currentColor: normalized,
        expectedColor: seq.expectedColor || normalized,
        stage: seq.stage || null,
        track: seq.track || null,
      }, { source: "CardEngine.onHitColor" });
      const level = seq.stepIndex + 1;
      addScoreToWorld(World, getSequenceMultiplier(level, seq.chainIndex));
      traceSeqHit("dir", normalized);
      const snapshot = getHitSnapshot(seq);
      seq.lastHitSnapshot = snapshot;
      return { action: "dir", snapshot };
    }

    if (normalized !== seq.currentColor) {
      if (seq.stepIndex === 0) {
        emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_DIRECTION_LOCKED, {
          currentColor: normalized,
          expectedColor: normalized,
          previousColor: seq.currentColor || null,
          hitCount: 1,
          stage: seq.stage || null,
          reason: "first-step-direction-switch",
          chainColors: seq.chainColors || [],
          sourceObject: collisionContext?.sourceObject || null,
        }, { source: "CardEngine.onHitColor", snapshot: true });
        seq.currentColor = normalized;
        seq.hits = 1;
        seq.opened = false;
        seq.mode = "IN_STEP";
        setSequencePhase(seq, "DIR");
        {
          const level = seq.stepIndex + 1;
          addScoreToWorld(World, getSequenceMultiplier(level, seq.chainIndex));
        }
        traceSeqHit("dir", normalized, { reason: "first-step-direction-switch" });
        const snapshot = getHitSnapshot(seq);
        seq.lastHitSnapshot = snapshot;
        return { action: "dir", snapshot };
      }
      emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_HIT_REJECTED, {
        color: normalized,
        expectedColor: seq.currentColor || seq.expectedColor || null,
        stage: seq.stage || null,
        reason: "color-mismatch",
        chainColors: seq.chainColors || [],
      }, { source: "CardEngine.onHitColor", severity: "warn" });
      traceSeqHit("fail", normalized, { reason: "color-mismatch", continueAsNewDirection: true });
      failSequence(World);
      if (!state.sequence.active) {
        startSequenceSession();
      }
      const restarted = state.sequence;
      applyDirectionSelection(restarted, normalized);
      restarted.currentColor = normalized;
      restarted.hits = 1;
      restarted.opened = false;
      restarted.mode = "IN_STEP";
      setSequencePhase(restarted, "DIR");
      emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_DIRECTION_LOCKED, {
        currentColor: normalized,
        expectedColor: normalized,
        previousColor: seq.currentColor || null,
        hitCount: 1,
        stage: restarted.stage || null,
        takeoverFromStage: seq.stage || null,
        takeoverFromStepIndex: Number(seq.stepIndex || 0),
        takeoverAfterFail: true,
        reason: "post-fail-direction-takeover",
        sourceObject: collisionContext?.sourceObject || null,
      }, { source: "CardEngine.onHitColor", snapshot: true });
      {
        const level = restarted.stepIndex + 1;
        addScoreToWorld(World, getSequenceMultiplier(level, restarted.chainIndex));
      }
      traceSeqHit("dir", normalized, { reason: "post-fail-direction-takeover" });
      const snapshot = getHitSnapshot(restarted);
      restarted.lastHitSnapshot = snapshot;
      return { action: "dir", snapshot };
    }

    seq.hits += 1;
    syncSequenceDerivedState(seq, "hit-registered");
    {
      const level = seq.stepIndex + 1;
      addScoreToWorld(World, getSequenceMultiplier(level, seq.chainIndex));
    }
    if (seq.hits === 2) {
      setSequencePhase(seq, "OPEN");
      emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_STEP_PROGRESS, {
        currentColor: normalized,
        expectedColor: seq.expectedColor || null,
        hitCount: seq.hitCount || seq.hits,
        stage: seq.stage || null,
        chainColors: seq.chainColors || [],
      }, { source: "CardEngine.onHitColor" });
      const nextLevel = seq.stepIndex + 1;
      const isATrackStep = seq.track === "A"
        || (seq.track === null
          && seq.stepIndex === 1
          && normalizePack01Color(seq.A) === normalizePack01Color(seq.currentColor));
      const label = isATrackStep
        ? (["A", "AA", "AAA"][nextLevel - 1] || `A${nextLevel}`)
        : `R${nextLevel}`;
      showSequenceToast(`Sekwencja ${label} rozpoczęta`, "", seq.currentColor, 1500);
      if (World) {
        const sequenceColors = new Set();
        const closed = Array.isArray(seq.colorsClosed) ? seq.colorsClosed : [];
        closed.forEach((color) => {
          const normalizedClosed = normalizePack01Color(color);
          if (normalizedClosed) sequenceColors.add(normalizedClosed);
        });
        const current = normalizePack01Color(seq.currentColor);
        if (current) sequenceColors.add(current);
        World.sequencePulseColors = [...sequenceColors];
      }
      traceSeqHit("open", normalized);
      const snapshot = getHitSnapshot(seq);
      seq.lastHitSnapshot = snapshot;
      return { action: "open", snapshot };
    }

    if (seq.hits === 3) {
      setSequencePhase(seq, "CLOSE");
      traceSeqHit("close", normalized);
      const snapshot = getHitSnapshot(seq);
      seq.lastHitSnapshot = snapshot;
      closeSequenceStep(World);
      return { action: "close", snapshot };
    }
    return { action: "noop", snapshot: getHitSnapshot(seq) };
  }

  function seqProbeSimAAA(colorKey) {
    const normalized = normalizePack01Color(colorKey) || "yellow";
    const hits = [normalized, normalized, normalized, normalized, normalized, normalized, normalized, normalized, normalized];
    const sim = seqSim(hits) || {};
    const poolKeys = Array.isArray(state.world?.cardsPool)
      ? state.world.cardsPool.map((card) => getRewardDedupeKey(card)).filter(Boolean)
      : [];
    return {
      ...sim,
      poolKeys,
      pending: state.world?.pendingCard ? getRewardDedupeKey(state.world.pendingCard) : null
    };
  }

  function seqSim(hitsArray) {
    if (typeof window === "undefined") return null;
    const hc = window.HC || (window.HC = {});
    const previousDebug = hc.debugSeq;
    const previousTrace = hc.seqTrace;
    const trace = [];
    hc.seqTrace = trace;
    hc.debugSeq = false;
    resetSequenceState("cashout", { finalReward: cardsAwarded.map((card) => card?.id).filter(Boolean) });
    if (state.world) {
      state.world.pendingCard = null;
      state.world.pendingCardUntilMs = 0;
    }
    const inputs = Array.isArray(hitsArray) ? hitsArray : [];
    inputs.forEach((hit, i) => {
      const normalizedHit = normalizePack01Color(hit);
      const result = onHitColor(hit);
      const seq = state.sequence;
      const action = result?.action || "noop";
      const snapshot = result?.snapshot || seq.lastHitSnapshot || getHitSnapshot(seq);
      trace.push({
        i,
        color: normalizedHit,
        phase: snapshot.phase,
        hits: snapshot.hits,
        currentColor: snapshot.currentColor,
        track: snapshot.track,
        stepIndex: snapshot.stepIndex,
        action
      });
    });
    const poolKeys = Array.isArray(state.world?.cardsPool)
      ? state.world.cardsPool.map((card) => card?.id || getCommitKey(card)).filter(Boolean)
      : [];
    const committedKeys = state.sequence?.committedKeys
      ? Array.from(state.sequence.committedKeys)
      : [];
    const result = { cardsPool: poolKeys, committedKeys, trace: trace.slice() };
    hc.debugSeq = previousDebug;
    hc.seqTrace = previousTrace;
    return result;
  }

  function seqSimTests() {
    const y = "yellow";
    const b = "blue";
    const r = "red";
    const g = "green";
    const tests = [
      {
        name: "A-track DS success",
        hits: [y, y, y, y, y, y, y, y, y],
        expectFailIndex: null,
        expectFinalAction: "close"
      },
      {
        name: "A-track fail immediately",
        hits: [y, y, y, y, b],
        expectFailIndex: 4
      },
      {
        name: "R-track R4 success",
        hits: [y, y, y, b, b, b, r, r, r, g, g, g],
        expectFailIndex: null,
        expectFinalAction: "close"
      },
      {
        name: "R-track fail after 3B close (A)",
        hits: [y, y, y, b, b, b, y],
        expectFailIndex: 6
      },
      {
        name: "R-track fail after 3B close (B)",
        hits: [y, y, y, b, b, b, b],
        expectFailIndex: 6
      },
      {
        name: "R-track fail after 3C close (A)",
        hits: [y, y, y, b, b, b, r, r, r, y],
        expectFailIndex: 9
      },
      {
        name: "R-track fail after 3C close (B)",
        hits: [y, y, y, b, b, b, r, r, r, b],
        expectFailIndex: 9
      },
      {
        name: "R-track fail after 3C close (C)",
        hits: [y, y, y, b, b, b, r, r, r, r],
        expectFailIndex: 9
      }
    ];
    const results = tests.map((test) => {
      const sim = seqSim(test.hits);
      const failIndex = sim.trace.findIndex((entry) => entry.action === "fail");
      const finalAction = sim.trace.length ? sim.trace[sim.trace.length - 1].action : null;
      const failOk = test.expectFailIndex === null
        ? failIndex === -1
        : failIndex === test.expectFailIndex;
      const finalOk = test.expectFinalAction
        ? finalAction === test.expectFinalAction
        : true;
      return {
        name: test.name,
        passed: failOk && finalOk,
        expectFailIndex: test.expectFailIndex,
        actualFailIndex: failIndex,
        expectFinalAction: test.expectFinalAction || null,
        actualFinalAction: finalAction,
        committedKeys: sim.committedKeys
      };
    });
    return {
      passed: results.every((entry) => entry.passed),
      results
    };
  }

  function handleSequenceOverlayTimeout(World, t) {
    const overlay = state.sequenceOverlay;
    if (!overlay || !overlay.visible || overlay.ttlMs <= 0) return;
    if (t - overlay.shownAtMs < overlay.ttlMs) return;
    overlay.visible = false;
    const level = Math.max(1, Math.min(4, Number(overlay.level || 1)));
    const colorsClosed = Array.isArray(overlay.colors) ? overlay.colors.slice() : [];
    const previousTrack = state.sequence.track || (overlay.mode === "A" ? "A" : null);
    const previousStage = state.sequence.stage || getSequenceStage(state.sequence);
    const continuationTarget = getOverlayContinuationTarget(overlay);
    emitSequenceEvent("sequence.decision_window_timeout", {
      previousTrack,
      previousStage,
      continuationTarget,
      chainColors: Array.isArray(state.sequence.chainColors) ? state.sequence.chainColors.slice() : [],
      nextExpectedColor: state.sequence.A || state.sequence.baseColor || overlay.colorKey || null,
      nextStage: continuationTarget,
      nextTrack: overlay.mode === "A" ? "A" : (overlay.mode === "CHOOSE" ? null : "R"),
    }, { source: "CardEngine.handleSequenceOverlayTimeout", snapshot: true });
    if (level >= 4) {
      state.sequence.active = true;
      state.sequence.mode = "IDLE";
      state.sequence.phase = null;
      state.sequence.stepIndex = 0;
      state.sequence.colorsClosed = [];
      state.sequence.track = null;
      state.sequence.A = null;
      state.sequence.B = null;
      state.sequence.C = null;
      state.sequence.D = null;
      state.sequence.baseColor = null;
      state.sequence.currentColor = null;
      state.sequence.hits = 0;
      state.sequence.opened = false;
      state.sequence.continuationMode = null;
      state.sequence.continuationFromStage = null;
      state.sequence.continuationFromTrack = null;
      syncSequenceDerivedState(state.sequence, "overlay-timeout-terminal", { snapshot: true });
      emitSequenceEvent("sequence.continuation_resolved", {
        fromStage: previousStage,
        fromTrack: previousTrack,
        toStage: "IDLE",
        toTrack: null,
        reason: "decision_timeout",
        expectedColor: state.sequence.expectedColor || null,
        chainColors: Array.isArray(state.sequence.chainColors) ? state.sequence.chainColors.slice() : [],
        note: "timeout_after_R4",
      }, { source: "CardEngine.handleSequenceOverlayTimeout", snapshot: true });
      return;
    }
    state.sequence.active = true;
    state.sequence.mode = "IDLE";
    state.sequence.phase = null;
    state.sequence.stepIndex = colorsClosed.length;
    state.sequence.colorsClosed = colorsClosed;
    state.sequence.track = overlay.mode === "A" ? "A" : (overlay.mode === "R" ? "R" : state.sequence.track);
    state.sequence.A = colorsClosed[0] || null;
    state.sequence.B = colorsClosed[1] || null;
    state.sequence.C = colorsClosed[2] || null;
    state.sequence.D = colorsClosed[3] || null;
    state.sequence.baseColor = state.sequence.A;
    state.sequence.currentColor = null;
    state.sequence.hits = 0;
    state.sequence.opened = false;
    state.sequence.continuationMode = null;
    state.sequence.continuationFromStage = previousStage || null;
    state.sequence.continuationFromTrack = previousTrack || null;
    if (continuationTarget === "choose_on_next_color") {
      state.sequence.track = null;
      state.sequence.continuationMode = "choose_on_next_color";
    } else if (overlay.mode === "A" && continuationTarget === "AAA") {
      state.sequence.continuationMode = "timeout_after_AA";
    }
    syncSequenceDerivedState(state.sequence, "overlay-timeout-continue", { snapshot: true });
    if (overlay.mode === "A" && (continuationTarget === "AA" || continuationTarget === "AAA")) {
      emitSequenceEvent("sequence.a_loop_entered", {
        loopLevel: continuationTarget,
        color: state.sequence.baseColor || state.sequence.A || null,
        source: continuationTarget === "AA" ? "timeout_after_R1" : "timeout_after_AA",
        chainColors: Array.isArray(state.sequence.chainColors) ? state.sequence.chainColors.slice() : [],
        expectedColor: state.sequence.expectedColor || null,
      }, { source: "CardEngine.handleSequenceOverlayTimeout", snapshot: true });
    } else {
      const route = continuationTarget === "R2"
        ? "R_TRACK_R2"
        : (continuationTarget === "R3"
          ? "R_TRACK_R3"
          : (continuationTarget === "R4" ? "R_TRACK_R4" : null));
      emitSequenceEvent("sequence.continuation_resolved", {
        fromStage: previousStage,
        fromTrack: previousTrack,
        toStage: state.sequence.stage || null,
        toTrack: state.sequence.track || null,
        reason: "decision_timeout",
        expectedColor: state.sequence.expectedColor || null,
        chainColors: Array.isArray(state.sequence.chainColors) ? state.sequence.chainColors.slice() : [],
        route,
        note: continuationTarget === "R2" ? "continuation_to_r_track" : null,
      }, { source: "CardEngine.handleSequenceOverlayTimeout", snapshot: true });
    }
  }

  function activateSequenceR1(colorKey, options = {}) {
    const normalized = normalizePack01Color(colorKey);
    if (!normalized) return false;
    const activated = onRunActivateR1({
      baseDurationMs: config.pack01TargetDurationMs,
      colorKey: normalized,
      tierKey: "DR",
      keepSequence: Boolean(options.keepSequence)
    });
    if (activated) {
      logRuntimeEvent("sequence", window.HC?.DebugEventTypes?.SEQUENCE_R1_ACTIVATED, {
        color: normalized,
      }, { source: "CardEngine.activateSequenceR1" });
    }
    return activated;
  }

  function cashOutSequence(level, colors) {
    const World = state.world;
    const seq = state.sequence;
    if (seq.resolutionLock) return false;
    if (!World || !Array.isArray(seq.tempCards) || !seq.tempCards.length) return false;
    seq.resolutionLock = true;
    ensureCardsPool(World);
    const cappedLevel = Math.max(1, Math.min(4, Number(level || 1)));
    const isDsSuccess = seq.track === "A" && cappedLevel >= 3;
    const cardsAwarded = seq.tempCards.filter((card) => card && !card._committed);
    commitSequenceNewRewards(World, seq, seq.tempCards);
    const seqColors = (Array.isArray(colors) ? colors : []).map(normalizePack01Color).filter(Boolean);
    const label = seq.track === "A"
      ? (["A", "AA", "AAA"][cappedLevel - 1] || `A${cappedLevel}`)
      : `R${cappedLevel}`;
    const rpDelta = Math.floor(Number(World?.score || 0)) - Math.floor(Number(seq.rpStart || 0));
    emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_CASHOUT_STARTED, {
      level: cappedLevel,
      colors: seqColors,
      stage: seq.stage || null,
      expectedColor: seq.expectedColor || null,
    }, { source: "CardEngine.cashOutSequence" });
    logRuntimeEvent("sequence", window.HC?.DebugEventTypes?.SEQUENCE_CASHOUT, {
      level: cappedLevel,
      colors: seqColors,
      rpDelta,
      isDsSuccess,
    }, { source: "CardEngine.cashOutSequence", snapshot: true });
    if (seq.track === "A" && cappedLevel >= 3) {
      const dsCards = seq.tempCards.filter((card) => String(card?.kind || card?.type || "").toUpperCase() === "DS");
      showSequenceDsToast(seq.baseColor || seq.A, 1500, { cards: dsCards, rp: rpDelta });
      if (World.pendingCard && String(World.pendingCard?.kind || World.pendingCard?.type || "").toUpperCase() === "R1") {
        World.pendingCard = null;
        World.pendingCardUntilMs = 0;
      }
    } else {
      showSequenceToast(
        `Kolekcja ${label}`,
        `Sekwencja zamknięta. ${rpDelta} RP`,
        seqColors[cappedLevel - 1] || seqColors[0],
        1500,
        { cards: cardsAwarded, rp: rpDelta }
      );
    }
    seq.tempCards.length = 0;
    if (World.cardsTemp) World.cardsTemp.length = 0;
    emitSequenceEvent(window.HC?.DebugEventTypes?.SEQUENCE_CASHOUT_COMPLETED, {
      level: cappedLevel,
      colors: seqColors,
      rpDelta,
      isDsSuccess,
    }, { source: "CardEngine.cashOutSequence", snapshot: true });
    seq.lastResolution = "cashout";
    resetSequenceState("cashout");
    return true;
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
    state.sequence = createSequenceState();
    state.sequenceOverlay = {
      visible: false,
      level: 0,
      colors: [],
      colorKey: null,
      shownAtMs: 0,
      ttlMs: 0,
      mode: "sequence"
    };
    state.sequenceToast = {
      visible: false,
      title: "",
      subtitle: "",
      colorKey: null,
      colors: [],
      cards: [],
      rp: null,
      shownAtMs: 0,
      ttlMs: 0,
      mode: "text"
    };
    state.subMeta = {
      selectedSlotKey: null,
      selectedSlotIndex: null,
      selectedCardKey: null,
      selectedForge: null,
      showRemoveForSlotKey: null,
      showRemoveForSlotIndex: null,
      selectedPrgSlotType: null,
      selectedPrgBranchKey: null,
      selectedPrgBindingIndex: null,
      selectedWorldSlotType: null,
      selectedWorldBindingIndex: null
    };
    if (state.world) {
      state.world.r1HudPulse = null;
      state.world.cardsTemp = state.sequence.tempCards;
      state.world.sequencePulseColors = [];
      state.world.sequenceDirectionColor = null;
      state.world.sequenceFlashColors = [];
      resetCardPool(state.world);
      bindWorld(state.world);
    }
  }

  function normalizePack01Color(color) {
    if (!color) return null;
    const key = String(color).toLowerCase();
    if (PACK01_COLOR_HEX[key]) return key;
    return null;
  }

  function getCanonicalPairColors(colorA, colorB) {
    const a = normalizePack01Color(colorA);
    const b = normalizePack01Color(colorB);
    if (!a || !b) return [a, b];
    const idxA = SUB_META_COLORS.indexOf(a);
    const idxB = SUB_META_COLORS.indexOf(b);
    if (idxA === -1 || idxB === -1) return [a, b];
    if (idxA <= idxB) return [a, b];
    return [b, a];
  }

  function getCanonicalColors(colors) {
    if (!Array.isArray(colors)) return [];
    const normalized = colors.map((color) => normalizePack01Color(color));
    if (normalized.some((color) => !color)) return [];
    return [...normalized].sort((a, b) => CARD_KEY_ORDER.indexOf(a) - CARD_KEY_ORDER.indexOf(b));
  }

  function canonicalizeColors(colors) {
    if (!Array.isArray(colors)) return [];
    const normalized = colors.map((color) => normalizePack01Color(color)).filter(Boolean);
    if (!normalized.length) return [];
    const ordered = getCanonicalColors(normalized);
    return ordered.length ? ordered : normalized;
  }

  function isSameColorPair(colorsA, colorsB) {
    if (!Array.isArray(colorsA) || !Array.isArray(colorsB)) return false;
    return colorsA.length === 2
      && colorsB.length === 2
      && colorsA[0] === colorsB[0]
      && colorsA[1] === colorsB[1];
  }

  function getPrgBindingPair(bindingIndex) {
    const binding = SUB_META_PRG_BINDINGS[bindingIndex];
    if (!binding) return null;
    const colorA = SUB_META_PRG_COLORS[binding.from];
    const colorB = SUB_META_PRG_COLORS[binding.to];
    if (!colorA || !colorB) return null;
    return getCanonicalPairColors(colorA, colorB);
  }

  function getWorldBindingPair(bindingIndex) {
    const binding = SUB_META_WORLD_BINDINGS[bindingIndex];
    if (!binding) return null;
    const colorA = SUB_META_SLOT_COLORS[binding.from];
    const colorB = SUB_META_SLOT_COLORS[binding.to];
    if (!colorA || !colorB) return null;
    return getCanonicalPairColors(colorA, colorB);
  }

  function getCardKey(kind, colors) {
    const kindKey = String(kind || "").toUpperCase();
    const required = { R1: 1, R2: 2, R3: 3, R4: 4, DS: 1 }[kindKey];
    if (!required) return null;
    const ordered = getCanonicalColors(colors);
    if (ordered.length < required) return null;
    const letters = ordered.slice(0, required).map((color) => CARD_KEY_LETTER[color]).join("");
    if (!letters) return null;
    return `${kindKey}:${letters}`;
  }

  function getCardColorsForKind(kind, colors) {
    const kindKey = String(kind || "").toUpperCase();
    const required = { R1: 1, R2: 2, R3: 3, R4: 4, DS: 1 }[kindKey] || colors.length;
    const ordered = getCanonicalColors(colors);
    return ordered.slice(0, required);
  }

  function getEntityColors(entity) {
    if (!entity) return [];
    const kindKey = String(entity.kind || entity.type || "R1").toUpperCase();
    let rawColors = Array.isArray(entity.colors) ? entity.colors : [];
    if (!rawColors.length) {
      rawColors = [
        entity.colorA,
        entity.colorB,
        entity.colorC,
        entity.colorD
      ].filter(Boolean);
    }
    if (!rawColors.length && kindKey === "R1" && entity.color) {
      rawColors = [entity.color];
    }
    const normalized = rawColors.map((color) => normalizePack01Color(color)).filter(Boolean);
    if (!normalized.length) return [];
    return getCardColorsForKind(kindKey, normalized);
  }

  function showActivationToast(colorKey) {
    showSequenceToast("R1 DR aktywowany", "Sekwencja przerwana.", colorKey, 1500);
  }

  function onRunActivateR1({ baseDurationMs, colorKey, tierKey, keepSequence } = {}) {
    const World = state.world;
    if (!World) return false;
    const t = nowMs();
    const normalizedColor = normalizePack01Color(colorKey);
    const tier = normalizeSubMetaTier(tierKey || "DR");
    let consumed = consumePendingCard(World, { kind: "R1", tier, colors: [normalizedColor] }, t);
    if (!consumed && state.sequence && Array.isArray(state.sequence.tempCards)) {
      const idx = state.sequence.tempCards.findIndex((card) => cardMatches(card, "R1", [normalizedColor], tier));
      if (idx >= 0) {
        state.sequence.tempCards.splice(idx, 1);
        consumed = true;
      }
    }
    if (!consumed) return false;
    if (Array.isArray(World.cardsPool) && state.sequence && Array.isArray(state.sequence.earned)) {
      const activatedRewardIds = new Set(
        state.sequence.earned
          .filter((card) => String(card?.kind || card?.type || "").toUpperCase() !== "DS")
          .map((card) => card?.id)
          .filter(Boolean)
      );
      if (activatedRewardIds.size) {
        for (let i = World.cardsPool.length - 1; i >= 0; i -= 1) {
          const poolCard = World.cardsPool[i];
          if (poolCard && activatedRewardIds.has(poolCard.id)) {
            World.cardsPool.splice(i, 1);
          }
        }
        recomputeTotalCards(World);
      }
    }
    if (state.sequence && Array.isArray(state.sequence.tempCards)) state.sequence.tempCards.length = 0;
    if (World.cardsTemp) World.cardsTemp.length = 0;
    if (keepSequence) {
      if (state.sequenceOverlay) state.sequenceOverlay.visible = false;
    } else {
      resetSequenceState("activation");
    }
    applyWorldSlotEffectsOnRunActivation(World, t, [normalizedColor], "R1");
    const bonusMs = getFormaTimeBonusMs(World);
    const durationMs = computeActivationDurationMs(baseDurationMs, bonusMs, "R1");
    if (normalizedColor) {
      startRunTimerForColor(World, normalizedColor, durationMs, t, 1);
      startR1TimerForColor(World, normalizedColor, durationMs, t);
    }
    showActivationToast(normalizedColor);
    return startFormaEffect(World, t, "R1", baseDurationMs);
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
      logRuntimeEvent("cards", window.HC?.DebugEventTypes?.CARD_ACTIVATED, {
        cardId: card.id,
        kind: card.kind || card.type,
        mode: "ritual",
      }, { source: "CardEngine.useCard" });
      return;
    }
    applyEffects(card.effects || []);
    logRuntimeEvent("cards", window.HC?.DebugEventTypes?.CARD_ACTIVATED, {
      cardId: card.id,
      kind: card.kind || card.type,
      mode: "direct",
    }, { source: "CardEngine.useCard" });
  }

  function update(_dt, now) {
    const t = (typeof now === "number") ? now : nowMs();
    const scoreBefore = Math.floor(Number(state.world?.score || 0));

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
      flushPendingCard(World, t);
      handleSequenceOverlayTimeout(World, t);
      if (state.sequenceToast?.visible && state.sequenceToast.ttlMs > 0) {
        if (t - state.sequenceToast.shownAtMs >= state.sequenceToast.ttlMs) {
          state.sequenceToast.visible = false;
        }
      }

      // TODO: pack01ReleaseBlockColor/UntilMs are read here but not set in SOURCE.
      if (World.pack01ReleaseBlockColor
        && t >= (World.pack01ReleaseBlockUntilMs || 0)) {
        World.pack01ReleaseBlockColor = null;
      }

      const sequenceColors = new Set();
      if (state.sequence && state.sequence.opened) {
        const closed = Array.isArray(state.sequence.colorsClosed) ? state.sequence.colorsClosed : [];
        closed.forEach((color) => {
          const normalized = normalizePack01Color(color);
          if (normalized) sequenceColors.add(normalized);
        });
        const current = normalizePack01Color(state.sequence.currentColor);
        if (current) sequenceColors.add(current);
      }
      World.sequencePulseColors = [...sequenceColors];
      if (state.sequence
        && state.sequence.phase === "DIR"
        && state.sequence.hits === 1
        && state.sequence.currentColor
        && !state.sequence.opened) {
        World.sequenceDirectionColor = state.sequence.currentColor;
      } else {
        World.sequenceDirectionColor = null;
      }
      if (Array.isArray(World.sequenceFlashColors) && World.sequenceFlashColors.length) {
        const startedAtMs = Number(World.sequenceFlashColors.startedAtMs || 0);
        const durationMs = Number(World.sequenceFlashColors.durationMs || 0);
        if (durationMs > 0 && t - startedAtMs >= durationMs) {
          World.sequenceFlashColors = [];
        }
      }
    }
    const scoreAfter = Math.floor(Number(state.world?.score || 0));
    const delta = scoreAfter - scoreBefore;
    if (delta > 0) {
      logRuntimeEvent("rp", window.HC?.DebugEventTypes?.RP_GAINED, { amount: delta, after: scoreAfter }, { source: "CardEngine.update" });
    } else if (delta < 0) {
      logRuntimeEvent("rp", window.HC?.DebugEventTypes?.RP_SPENT, { amount: Math.abs(delta), after: scoreAfter }, { source: "CardEngine.update" });
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

    renderSequenceOverlay(ctx, screenW, screenH);
    renderSequenceToast(ctx, screenW, screenH);
    renderPack01Collection(ctx, screenW, screenH);
    if (!window.HC?.SubMetaPngLayout?.isActive?.()) {
      renderSubMetaOverlay(ctx, screenW, screenH);
    }
  }

  function getSequenceOverlayLayout(screenW) {
    const w = 420;
    const h = 124;
    const x = Math.floor(screenW / 2 - w / 2);
    const y = Math.max(12, Math.floor(config.offerYPad - 6));
    const buttonH = 32;
    const buttonW = Math.floor((w - 60) / 2);
    const buttonY = y + h - buttonH - 12;
    const leftX = x + 20;
    const rightX = x + w - 20 - buttonW;
    return {
      x,
      y,
      w,
      h,
      leftButton: { x: leftX, y: buttonY, w: buttonW, h: buttonH },
      rightButton: { x: rightX, y: buttonY, w: buttonW, h: buttonH }
    };
  }

  function formatSequenceLabel(colors) {
    const labels = (Array.isArray(colors) ? colors : [])
      .map((color) => PACK01_COLOR_LABEL[color] || color)
      .filter(Boolean);
    return labels.join(" → ");
  }

  function renderSequenceOverlay(ctx, screenW) {
    const overlay = state.sequenceOverlay;
    if (!overlay || !overlay.visible) return;

    const now = nowMs();
    const elapsed = now - overlay.shownAtMs;
    if (overlay.ttlMs > 0 && elapsed >= overlay.ttlMs) return;

    const layout = getSequenceOverlayLayout(screenW);
    const level = Math.max(1, Math.min(4, Number(overlay.level || 1)));
    const colors = Array.isArray(overlay.colors) ? overlay.colors : [];
    const title = (overlay.mode === "A")
      ? `Sekwencja ${["A", "AA", "AAA"][level - 1] || `A${level}`}`
      : `Sekwencja R${level}`;
    const subtitle = formatSequenceLabel(colors);
    const colorKey = normalizePack01Color(overlay.colorKey);
    const barColor = (colorKey && PACK01_COLOR_HEX[colorKey]) || "rgba(255,255,255,0.8)";
    const mode = overlay.mode || "sequence";
    const leftLabel = `Aktywuj R1 ${PACK01_COLOR_LABEL[colorKey] || ""}`.trim();
    const rightLabel = mode === "A"
      ? `Kolekcja ${["A", "AA", "AAA"][level - 1] || `A${level}`}`
      : `Kolekcja R${level}`;

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(18,18,18,0.6)";
    ctx.fillRect(layout.x, layout.y, layout.w, layout.h);

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(title, layout.x + layout.w / 2, layout.y + 26);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    if (subtitle) ctx.fillText(subtitle, layout.x + layout.w / 2, layout.y + 46);

    const chipY = layout.y + 62;
    const chipW = 14;
    const chipH = 10;
    const chipGap = 6;
    let chipX = layout.x + layout.w / 2 - ((chipW + chipGap) * colors.length - chipGap) / 2;
    colors.forEach((color) => {
      const hex = PACK01_COLOR_HEX[color] || "rgba(255,255,255,0.8)";
      ctx.fillStyle = hex;
      ctx.fillRect(chipX, chipY, chipW, chipH);
      chipX += chipW + chipGap;
    });

    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(layout.leftButton.x, layout.leftButton.y, layout.leftButton.w, layout.leftButton.h);
    ctx.fillRect(layout.rightButton.x, layout.rightButton.y, layout.rightButton.w, layout.rightButton.h);

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "13px system-ui";
    ctx.fillText(
      leftLabel,
      layout.leftButton.x + layout.leftButton.w / 2,
      layout.leftButton.y + 21
    );
    ctx.fillText(
      rightLabel,
      layout.rightButton.x + layout.rightButton.w / 2,
      layout.rightButton.y + 21
    );

    const ratio = overlay.ttlMs > 0 ? clamp01(1 - (elapsed / overlay.ttlMs)) : 0;
    const barW = Math.floor(layout.w * 0.7);
    const barX = Math.floor(layout.x + (layout.w - barW) / 2);
    const barY = layout.y + layout.h - 6;
    ctx.fillStyle = barColor;
    ctx.fillRect(barX, barY, Math.floor(barW * ratio), 4);

    ctx.restore();
  }

  function renderSequenceToast(ctx, screenW) {
    const toast = state.sequenceToast;
    if (!toast || !toast.visible) return;

    const now = nowMs();
    const elapsed = now - toast.shownAtMs;
    if (toast.ttlMs > 0 && elapsed >= toast.ttlMs) return;

    const colors = Array.isArray(toast.colors) ? toast.colors : [];
    const cards = Array.isArray(toast.cards) ? toast.cards : [];
    const showCards = cards.length > 0;
    const cardW = SUB_META_CARD_W;
    const cardH = SUB_META_CARD_H;
    const cardGap = SUB_META_CARD_GAP_X;
    const cardsRowW = showCards
      ? (cards.length * cardW + Math.max(0, cards.length - 1) * cardGap)
      : 0;
    const w = Math.max(320, cardsRowW + 32);
    const baseH = colors.length ? 68 : 56;
    const h = showCards ? baseH + cardH + 16 : baseH;
    const x = Math.floor(screenW / 2 - w / 2);
    const y = Math.max(12, Math.floor(config.offerYPad - 6));
    const colorKey = normalizePack01Color(toast.colorKey);
    const barColor = (colorKey && PACK01_COLOR_HEX[colorKey]) || "rgba(255,255,255,0.9)";
    const rpLabel = Number.isFinite(toast.rp) ? `${toast.rp} RP` : "";

    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = "rgba(18,18,18,0.6)";
    ctx.fillRect(x, y, w, h);

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = "13px system-ui";
    ctx.textAlign = "left";

    ctx.fillStyle = barColor;
    ctx.fillRect(x + 12, y + 20, 14, 10);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillText(toast.title, x + 34, y + 24);
    if (toast.subtitle) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText(toast.subtitle, x + 34, y + 42);
    } else if (colors.length) {
      const chipW = 14;
      const chipH = 10;
      const chipGap = 6;
      let chipX = x + 34;
      const chipY = y + 40;
      colors.forEach((color) => {
        const normalized = normalizePack01Color(color);
        const hex = (normalized && PACK01_COLOR_HEX[normalized]) || "rgba(255,255,255,0.85)";
        ctx.fillStyle = hex;
        ctx.fillRect(chipX, chipY, chipW, chipH);
        chipX += chipW + chipGap;
      });
    } else if (rpLabel) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText(rpLabel, x + 34, y + 42);
    }

    if (showCards) {
      const cardsY = y + h - cardH - 12;
      let cardX = x + w / 2 - cardsRowW / 2;
      cards.forEach((card) => {
        renderMetaCard(ctx, cardX, cardsY, card);
        cardX += cardW + cardGap;
      });
    }

    ctx.restore();
  }

  function renderPack01Collection(ctx, screenW, screenH) {
    const World = state.world;
    if (!World) return;

    const order = ["red", "yellow", "green", "blue"];
    const pad = 12;
    const hudRootStyle = typeof window !== "undefined" && window.getComputedStyle
      ? window.getComputedStyle(window.document.documentElement)
      : null;
    const readHudCssNumber = (name, fallback) => {
      const value = hudRootStyle ? parseFloat(hudRootStyle.getPropertyValue(name)) : NaN;
      return Number.isFinite(value) ? value : fallback;
    };
    const hudAssetScale = readHudCssNumber("--hud-asset-scale", 0.5);
    const hudNativeHeight = readHudCssNumber("--hud-native-height", 130);
    const hudSafeMargin = readHudCssNumber("--hud-safe-margin", 18);
    const hudTopSafeY = hudNativeHeight * hudAssetScale + hudSafeMargin;
    const rectW = 10;
    const rectH = 24;
    const gap = 14;
    const x = Math.floor(screenW - pad - rectW);
    const y0 = Math.floor(Math.max(pad + 6, hudTopSafeY));
    const frameH = rectH * order.length + gap * (order.length - 1) + 10;
    // TODO(FrameComposer): replace this simple HUD fallback frame with modular static frame parts.
    drawManifestSvg(ctx, "hud.frame.color_counter_axis_01", x - 16, y0 - 6, 44, frameH, 0.95);
    const nowTime = nowMs();
    const runTimers = World.runColorTimers || {};
    const runDurations = World.runColorDurations || {};
    const sequencePulseColors = Array.isArray(World.sequencePulseColors) ? World.sequencePulseColors : [];
    const directionColor = normalizePack01Color(World.sequenceDirectionColor);
    const flashColors = Array.isArray(World.sequenceFlashColors) ? World.sequenceFlashColors : [];
    const pulseDuration = 2000;
    const hexToRgb = (hex) => {
      const value = String(hex || "").replace("#", "");
      if (value.length === 3) {
        const r = parseInt(value[0] + value[0], 16);
        const g = parseInt(value[1] + value[1], 16);
        const b = parseInt(value[2] + value[2], 16);
        return { r, g, b };
      }
      if (value.length === 6) {
        const r = parseInt(value.slice(0, 2), 16);
        const g = parseInt(value.slice(2, 4), 16);
        const b = parseInt(value.slice(4, 6), 16);
        return { r, g, b };
      }
      return { r: 255, g: 255, b: 255 };
    };
    const mixRgb = (a, b, t) => {
      const r = Math.round(a.r + (b.r - a.r) * t);
      const g = Math.round(a.g + (b.g - a.g) * t);
      const bVal = Math.round(a.b + (b.b - a.b) * t);
      return `rgb(${r},${g},${bVal})`;
    };
    const whiteRgb = { r: 255, g: 255, b: 255 };
    const blackRgb = { r: 0, g: 0, b: 0 };

    ctx.save();
    ctx.font = "11px system-ui";
    ctx.textAlign = "right";
    for (let i = 0; i < order.length; i++) {
      const key = order[i];
      const count = getCardCount(World, "R1", [key], "DR", { availableOnly: true });
      const y = y0 + i * (rectH + gap);
      const isPulsing = sequencePulseColors.includes(key);
      if (isPulsing) {
        const pulsePhase = ((nowTime % pulseDuration) / pulseDuration) * Math.PI * 2;
        const pulse01 = 0.5 + 0.5 * Math.sin(pulsePhase);
        const baseRgb = hexToRgb(PACK01_COLOR_HEX[key] || "#FFFFFF");
        const mixTarget = count > 0 ? whiteRgb : baseRgb;
        const mixSource = count > 0 ? baseRgb : blackRgb;
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = mixRgb(mixSource, mixTarget, pulse01);
        ctx.fillRect(x, y, rectW, rectH);
      } else if (count > 0) {
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
      if (isPulsing) {
        const pulsePhase = ((nowTime % pulseDuration) / pulseDuration) * Math.PI * 2;
        const pulseAlpha = 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(pulsePhase));
        ctx.save();
        ctx.globalAlpha = clamp01(pulseAlpha);
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 2, y - 2, rectW + 4, rectH + 4);
        ctx.restore();
      }
      if (directionColor && directionColor === key) {
        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 3, y - 3, rectW + 6, rectH + 6);
        ctx.restore();
      }
      if (flashColors.length && flashColors.includes(key)) {
        const startedAtMs = Number(flashColors.startedAtMs || 0);
        const durationMs = Number(flashColors.durationMs || 0);
        const elapsed = nowTime - startedAtMs;
        const t = durationMs > 0 ? clamp01(elapsed / durationMs) : 1;
        if (t >= 1) {
          World.sequenceFlashColors = [];
        } else {
          const alpha = 0.6 * (1 - t);
          ctx.save();
          ctx.globalAlpha = clamp01(alpha);
          ctx.strokeStyle = "rgba(255,255,255,0.95)";
          ctx.lineWidth = 3;
          ctx.strokeRect(x - 5, y - 5, rectW + 10, rectH + 10);
          ctx.restore();
        }
      }
      const pulse = World.r1HudPulse;
      if (pulse && normalizePack01Color(pulse.colorKey) === key) {
        const pulseDuration = Number(pulse.durationMs || 0);
        const elapsed = nowTime - Number(pulse.startedAtMs || 0);
        const t = pulseDuration > 0 ? clamp01(elapsed / pulseDuration) : 1;
        if (t >= 1) {
          World.r1HudPulse = null;
        } else {
          const alpha = t < 0.5 ? (t / 0.5) : ((1 - t) / 0.5);
          ctx.globalAlpha = clamp01(alpha);
          ctx.strokeStyle = "rgba(255,255,255,0.95)";
          ctx.lineWidth = 2;
          ctx.strokeRect(x - 2, y - 2, rectW + 4, rectH + 4);
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
    state.subMeta.selectedSlotIndex = null;
    state.subMeta.selectedCardKey = null;
    state.subMeta.selectedForge = null;
    state.subMeta.showRemoveForSlotKey = null;
    state.subMeta.showRemoveForSlotIndex = null;
    state.subMeta.selectedPrgSlotType = null;
    state.subMeta.selectedPrgBranchKey = null;
    state.subMeta.selectedPrgBindingIndex = null;
    state.subMeta.selectedWorldSlotType = null;
    state.subMeta.selectedWorldBindingIndex = null;
    applyFormaToWorld(World);
  }

  function assignSubMetaSlot(World, slotKey, assignment) {
    if (!World || !World.metaSlots || !assignment) return;
    const colorKey = assignment.color;
    if (!colorKey) return;
    const tierKey = normalizeSubMetaTier(assignment.tier);
    const available = getCardCount(World, "R1", [colorKey], tierKey, { availableOnly: true });
    if (available <= 0) return;
    if ((World.score || 0) < SUB_META_ASSIGN_COST) return;

    if (World.metaSlots[slotKey]) return;
    const card = getFirstAvailableCard(World, "R1", [colorKey], tierKey);
    if (!card) return;
    card.inSlotKey = slotKey;
    World.metaSlots[slotKey] = assignment;
    World.score = Math.max(0, (World.score || 0) - SUB_META_ASSIGN_COST);
  }

  function removeSubMetaSlot(World, slotKey) {
    if (!World || !World.metaSlots) return;
    const assignment = World.metaSlots[slotKey];
    if (!assignment || !assignment.color) return;
    if ((World.score || 0) < SUB_META_ASSIGN_COST) return;
    World.score = Math.max(0, (World.score || 0) - SUB_META_ASSIGN_COST);
    ensureCardsPool(World);
    const card = World.cardsPool.find((entry) => entry && entry.inSlotKey === slotKey) || null;
    if (card) card.inSlotKey = null;
    World.metaSlots[slotKey] = null;
  }

  function assignPrgBranchCard(World, branchKey, prgCard) {
    if (!World || !branchKey || !prgCard) return false;
    const prg = ensureSubMetaPrg(World);
    const branch = prg?.branches?.[branchKey];
    if (!branch || branch.r1CardId) return false;
    const colorKey = prgCard.colors?.[0];
    if (!colorKey) return false;
    const tierKey = normalizeSubMetaTier(prgCard.tier);
    const available = getCardCount(World, "R1", [colorKey], tierKey, { availableOnly: true });
    if (available <= 0) return false;
    if ((World.score || 0) < SUB_META_ASSIGN_COST) return false;
    const card = getFirstAvailableCard(World, "R1", [colorKey], tierKey);
    if (!card) return false;
    card.inSlotKey = `prg:r1:${branchKey}`;
    branch.r1CardId = prgCard.key;
    World.score = Math.max(0, (World.score || 0) - SUB_META_ASSIGN_COST);
    return true;
  }

  function assignPrgBindingCard(World, bindingIndex, prgCard) {
    if (!World || !Number.isInteger(bindingIndex) || !prgCard) return false;
    const prg = ensureSubMetaPrg(World);
    const binding = prg?.bindings?.[bindingIndex];
    if (!binding || binding.r2CardId) return false;
    const colors = Array.isArray(prgCard.colors) ? prgCard.colors : [];
    if (colors.length < 2) return false;
    const fixedPair = getPrgBindingPair(bindingIndex);
    const cardPair = getCanonicalPairColors(colors[0], colors[1]);
    if (!fixedPair || !isSameColorPair(cardPair, fixedPair)) return false;
    const tierKey = normalizeSubMetaTier(prgCard.tier);
    const available = getCardCount(World, "R2", fixedPair, tierKey, { availableOnly: true });
    if (available <= 0) return false;
    if ((World.score || 0) < SUB_META_ASSIGN_COST) return false;
    const card = getFirstAvailableCard(World, "R2", fixedPair, tierKey);
    if (!card) return false;
    card.inSlotKey = `prg:r2:${bindingIndex}`;
    binding.r2CardId = prgCard.key;
    binding.active = false;
    World.score = Math.max(0, (World.score || 0) - SUB_META_ASSIGN_COST);
    return true;
  }

  function toggleActiveBinding(bindings, bindingIndex) {
    if (!Array.isArray(bindings) || !Number.isInteger(bindingIndex)) return;
    const wasActive = Boolean(bindings[bindingIndex]?.active);
    bindings.forEach((binding) => {
      if (!binding) return;
      binding.active = false;
    });
    if (!wasActive && bindings[bindingIndex]) {
      bindings[bindingIndex].active = true;
    }
  }

  function setActivePrgBinding(prg, bindingIndex) {
    if (!prg || !Array.isArray(prg.bindings)) return;
    prg.bindings.forEach((binding, index) => {
      if (!binding) return;
      binding.active = index === bindingIndex;
    });
  }

  function assignWorldSlotCard(World, slotKey, slotIndex, card) {
    if (!World || !slotKey || !Number.isInteger(slotIndex) || !card) return false;
    const worldState = ensureSubMetaWorld(World);
    const entry = worldState?.slots?.[slotKey];
    if (!entry || !Array.isArray(entry.cards)) return false;
    if (slotIndex < 0 || slotIndex > 2) return false;
    if (slotIndex === 2 && !entry.dsUnlocked) return false;
    if (entry.cards[slotIndex]) return false;
    const colorKey = card.color || card.colors?.[0];
    if (!colorKey) return false;
    const tierKey = normalizeSubMetaTier(card.tier);
    const available = getCardCount(World, "R1", [colorKey], tierKey, { availableOnly: true });
    if (available <= 0) return false;
    if ((World.score || 0) < SUB_META_ASSIGN_COST) return false;
    const poolCard = getFirstAvailableCard(World, "R1", [colorKey], tierKey);
    if (!poolCard) return false;
    const slotKeyForPool = slotIndex === 0 ? slotKey : `world:${slotKey}:${slotIndex}`;
    poolCard.inSlotKey = slotKeyForPool;
    entry.cards[slotIndex] = { kind: "R1", color: colorKey, tier: tierKey };
    if (slotIndex === 0 && World.metaSlots) {
      World.metaSlots[slotKey] = { kind: "R1", color: colorKey, tier: tierKey };
    }
    World.score = Math.max(0, (World.score || 0) - SUB_META_ASSIGN_COST);
    return true;
  }

  function unlockWorldDsSlot(World, slotKey, card) {
    if (!World || !slotKey || !card) return false;
    const worldState = ensureSubMetaWorld(World);
    const entry = worldState?.slots?.[slotKey];
    if (!entry || entry.dsUnlocked) return false;
    const colorKey = card.color || card.colors?.[0];
    if (!colorKey) return false;
    const tierKey = normalizeSubMetaTier(card.tier);
    const available = getCardCount(World, "DS", [colorKey], tierKey, { availableOnly: true });
    if (available <= 0) return false;
    if ((World.score || 0) < SUB_META_ASSIGN_COST) return false;
    const poolCard = getFirstAvailableCard(World, "DS", [colorKey], tierKey);
    if (!poolCard) return false;
    poolCard.inSlotKey = `world:ds:${slotKey}`;
    entry.dsUnlocked = true;
    World.score = Math.max(0, (World.score || 0) - SUB_META_ASSIGN_COST);
    return true;
  }

  function removeWorldSlotCard(World, slotKey, slotIndex) {
    if (!World || !slotKey || !Number.isInteger(slotIndex)) return;
    const worldState = ensureSubMetaWorld(World);
    const entry = worldState?.slots?.[slotKey];
    if (!entry || !Array.isArray(entry.cards)) return;
    const assignment = entry.cards[slotIndex];
    if (!assignment) return;
    if ((World.score || 0) < SUB_META_ASSIGN_COST) return;
    World.score = Math.max(0, (World.score || 0) - SUB_META_ASSIGN_COST);
    ensureCardsPool(World);
    const poolKey = slotIndex === 0 ? slotKey : `world:${slotKey}:${slotIndex}`;
    const card = World.cardsPool.find((item) => item && item.inSlotKey === poolKey) || null;
    if (card) card.inSlotKey = null;
    entry.cards[slotIndex] = null;
    if (slotIndex === 0 && World.metaSlots) {
      World.metaSlots[slotKey] = null;
    }
  }

  function assignWorldBindingCard(World, bindingIndex, prgCard) {
    if (!World || !Number.isInteger(bindingIndex) || !prgCard) return false;
    const worldState = ensureSubMetaWorld(World);
    const binding = worldState?.bindings?.[bindingIndex];
    if (!binding || binding.r2CardId) return false;
    const colors = Array.isArray(prgCard.colors) ? prgCard.colors : [];
    if (colors.length < 2) return false;
    const fixedPair = getWorldBindingPair(bindingIndex);
    const cardPair = getCanonicalPairColors(colors[0], colors[1]);
    if (!fixedPair || !isSameColorPair(cardPair, fixedPair)) return false;
    const tierKey = normalizeSubMetaTier(prgCard.tier);
    const available = getCardCount(World, "R2", fixedPair, tierKey, { availableOnly: true });
    if (available <= 0) return false;
    if ((World.score || 0) < SUB_META_ASSIGN_COST) return false;
    const card = getFirstAvailableCard(World, "R2", fixedPair, tierKey);
    if (!card) return false;
    card.inSlotKey = `world:r2:${bindingIndex}`;
    binding.r2CardId = prgCard.key;
    binding.active = false;
    World.score = Math.max(0, (World.score || 0) - SUB_META_ASSIGN_COST);
    return true;
  }

  function setActiveWorldBinding(worldState, bindingIndex) {
    if (!worldState || !Array.isArray(worldState.bindings)) return;
    worldState.bindings.forEach((binding, index) => {
      if (!binding) return;
      binding.active = index === bindingIndex;
    });
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
    const bank = { R1: {}, R2: {}, R3: {}, R4: {} };
    SUB_META_COLORS.forEach((color) => {
      bank.R1[color] = createTierBucket();
    });
    SUB_META_R2_PAIRS.forEach((pair) => {
      const key = getCanonicalPairKey(pair[0], pair[1]);
      bank.R2[key] = createTierBucket();
    });
    SUB_META_R3_COMBOS.forEach((combo) => {
      if (!combo.key) return;
      bank.R3[combo.key] = createTierBucket();
    });
    SUB_META_R4_COMBOS.forEach((combo) => {
      if (!combo.key) return;
      bank.R4[combo.key] = createTierBucket();
    });
    return bank;
  }

  function createCardEntity({ kind, tier, colors, colorA, colorB, colorC, colorD, inSlotKey } = {}) {
    if (!kind) return null;
    const kindKey = String(kind).toUpperCase();
    const tierKey = normalizeSubMetaTier(tier || "DR");
    const requiredCount = { R1: 1, R2: 2, R3: 3, R4: 4, DS: 1 }[kindKey];
    if (!requiredCount) return null;
    const inputColors = (Array.isArray(colors) && colors.length)
      ? colors
      : [colorA, colorB, colorC, colorD];
    const normalizedColors = inputColors.map((color) => (color ? normalizePack01Color(color) : null));
    const pickedColors = normalizedColors.slice(0, requiredCount);
    if (pickedColors.some((color) => !color)) return null;
    const orderedColors = getCardColorsForKind(kindKey, pickedColors);
    const cardKey = getCardKey(kindKey, orderedColors);
    if (!cardKey) return null;
    return {
      id: cardKey,
      kind: kindKey,
      tier: tierKey,
      colorA: orderedColors[0],
      colorB: orderedColors[1] || null,
      colorC: orderedColors[2] || null,
      colorD: orderedColors[3] || null,
      inSlotKey: inSlotKey || null
    };
  }

  function getCommitKey(card) {
    if (!card) return null;
    if (card.id) return String(card.id);
    const colors = getEntityColors(card);
    if (!colors.length) return null;
    return `${String(card.kind || card.type || "").toUpperCase()}:${colors.join("-")}`;
  }

  function getRewardDedupeKey(card) {
    if (!card) return null;
    const kindKey = String(card.kind || card.type || "").toUpperCase();
    if (!kindKey) return null;
    const colorA = normalizePack01Color(
      card.colorA || (Array.isArray(card.colors) ? card.colors[0] : null) || card.color
    );
    const colorB = normalizePack01Color(
      card.colorB || (Array.isArray(card.colors) ? card.colors[1] : null)
    );
    return `${kindKey}|${colorA || ""}|${colorB || ""}`;
  }

  function commitSequenceRewards(World, cards, { enforceUnique = true } = {}) {
    if (!World || !Array.isArray(cards) || !cards.length) return 0;
    ensureCardsPool(World);
    if (shouldTraceSeq()) {
      const rewardKeys = cards.map((card) => getRewardDedupeKey(card)).filter(Boolean);
      console.log("[SEQ_COMMIT_TRACE]", {
        enforceUnique,
        rewardKeys
      });
    }
    if (typeof state.sequence.commitDuplicateLogged !== "boolean") {
      state.sequence.commitDuplicateLogged = false;
    }
    const localSeen = new Set();
    const localRewardSeen = new Set();
    const poolRewardSeen = new Set();
    if (Array.isArray(World.cardsPool)) {
      for (const entry of World.cardsPool) {
        const key = getRewardDedupeKey(entry);
        if (key) poolRewardSeen.add(key);
      }
    }
    let added = 0;
    for (const card of cards) {
      if (!card) continue;
      if (card._committed) continue;
      const rewardKey = getRewardDedupeKey(card);
      const allowDuplicate = Boolean(card._allowSequenceDuplicate);
      if (rewardKey && !allowDuplicate) {
        if (localRewardSeen.has(rewardKey) || poolRewardSeen.has(rewardKey)) {
          if (!state.sequence.commitDuplicateLogged) {
            console.warn("[SEQ_COMMIT_DUPLICATE] duplicate reward commit skipped", rewardKey);
            state.sequence.commitDuplicateLogged = true;
          }
          continue;
        }
        localRewardSeen.add(rewardKey);
      }
      const commitKey = getCommitKey(card);
      if (!commitKey) continue;
      if (enforceUnique) {
        if (localSeen.has(commitKey)) {
          if (!state.sequence.commitDuplicateLogged) {
            console.warn("[SEQ_COMMIT_DUPLICATE] duplicate reward in same step", commitKey);
            state.sequence.commitDuplicateLogged = true;
          }
          continue;
        }
        localSeen.add(commitKey);
      }
      World.cardsPool.push(card);
      card._committed = true;
      added += 1;
    }
    if (added) recomputeTotalCards(World);
    return added;
  }

  function ensureCardsPool(World) {
    if (!World) return;
    if (!Array.isArray(World.cardsPool)) {
      World.cardsPool = [];
    }
    if (World.pendingCard === undefined) World.pendingCard = null;
    if (typeof World.pendingCardUntilMs !== "number") World.pendingCardUntilMs = 0;

    if (World._cardsPoolMigrated) return;

    const hasPoolStock = Array.isArray(World.cardsPool) && World.cardsPool.length > 0;
    if (hasPoolStock) {
      World._cardsPoolMigrated = true;
      recomputeTotalCards(World);
      return;
    }

    const pushCards = (kind, colors, tier, count) => {
      const total = Math.max(0, Math.floor(count || 0));
      for (let i = 0; i < total; i++) {
        const card = createCardEntity({
          kind,
          tier,
          colorA: colors[0],
          colorB: colors[1] || null,
          colorC: colors[2] || null,
          colorD: colors[3] || null,
          inSlotKey: null
        });
        if (card) World.cardsPool.push(card);
      }
    };

    const bank = World.cardBank || World.cardStock;
    if (bank) {
      SUB_META_COLORS.forEach((color) => {
        const bucket = bank.R1?.[color];
        SUB_META_TIERS.forEach((tier) => {
          const count = Math.max(0, Math.floor(bucket?.[tier] || 0));
          if (count > 0) pushCards("R1", [color], tier, count);
        });
      });
      Object.keys(bank.R2 || {}).forEach((pairKey) => {
        const colors = pairKey.split("-");
        if (colors.length < 2) return;
        const bucket = bank.R2?.[pairKey];
        SUB_META_TIERS.forEach((tier) => {
          const count = Math.max(0, Math.floor(bucket?.[tier] || 0));
          if (count > 0) pushCards("R2", colors, tier, count);
        });
      });
      Object.keys(bank.R3 || {}).forEach((cardKey) => {
        const combo = SUB_META_R3_COMBOS.find((entry) => entry.key === cardKey);
        if (!combo) return;
        const bucket = bank.R3?.[cardKey];
        SUB_META_TIERS.forEach((tier) => {
          const count = Math.max(0, Math.floor(bucket?.[tier] || 0));
          if (count > 0) pushCards("R3", combo.colors, tier, count);
        });
      });
      Object.keys(bank.R4 || {}).forEach((cardKey) => {
        const combo = SUB_META_R4_COMBOS.find((entry) => entry.key === cardKey);
        if (!combo) return;
        const bucket = bank.R4?.[cardKey];
        SUB_META_TIERS.forEach((tier) => {
          const count = Math.max(0, Math.floor(bucket?.[tier] || 0));
          if (count > 0) pushCards("R4", combo.colors, tier, count);
        });
      });
    }

    if (!World.cardsPool.length && World.collectedCardsByColor) {
      SUB_META_COLORS.forEach((color) => {
        const count = Math.max(0, Math.floor(World.collectedCardsByColor[color] || 0));
        if (count > 0) pushCards("R1", [color], "DR", count);
      });
    }
    if (!World.cardsPool.length) {
      const comboCounts = World.collectedCardsByCombo || World.collectedCardsByPair;
      if (comboCounts) {
        SUB_META_R2_PAIRS.forEach((pair) => {
          const count = getSubMetaComboCount(comboCounts, pair[0], pair[1]);
          if (count > 0) pushCards("R2", pair, "DR", count);
        });
      }
    }

    World._cardsPoolMigrated = true;
    recomputeTotalCards(World);
  }

  function resetCardPool(World) {
    if (!World) return;
    World.cardsPool = [];
    World.pendingCard = null;
    World.pendingCardUntilMs = 0;
    World._cardsPoolMigrated = true;
    recomputeTotalCards(World);
  }

  function applyDebugCardPreset(World, countPerCard = 13) {
    if (!World) return null;
    ensureCardsPool(World);
    const targetCount = Math.max(0, Math.floor(Number(countPerCard) || 0));
    const specs = [];
    const addSpecs = (kind, combos) => {
      combos.forEach((colors) => {
        SUB_META_TIERS.forEach((tier) => specs.push({ kind, tier, colors }));
      });
    };
    addSpecs("R1", SUB_META_COLORS.map((color) => [color]));
    addSpecs("R2", SUB_META_R2_PAIRS);
    addSpecs("R3", SUB_META_R3_COMBOS.map((combo) => combo.colors));
    addSpecs("R4", SUB_META_R4_COMBOS.map((combo) => combo.colors));

    let added = 0;
    let removed = 0;
    specs.forEach((spec) => {
      const available = World.cardsPool.filter((card) => !card?.inSlotKey
        && cardMatches(card, spec.kind, spec.colors, spec.tier));
      for (let i = targetCount; i < available.length; i += 1) {
        const index = World.cardsPool.lastIndexOf(available[i]);
        if (index >= 0) {
          World.cardsPool.splice(index, 1);
          removed += 1;
        }
      }
      for (let i = available.length; i < targetCount; i += 1) {
        const card = createCardEntity({ kind: spec.kind, tier: spec.tier, colors: spec.colors });
        if (card) {
          World.cardsPool.push(card);
          added += 1;
        }
      }
    });
    World._cardsPoolMigrated = true;
    recomputeTotalCards(World);
    return { targetCount, stackCount: specs.length, added, removed, totalCards: World.totalCards };
  }

  function cardMatches(card, kind, colors, tier) {
    if (!card) return false;
    const kindKey = String(kind || "").toUpperCase();
    if (card.kind !== kindKey) return false;
    const tierKey = normalizeSubMetaTier(tier || "DR");
    if (card.tier !== tierKey) return false;
    const ordered = getCardColorsForKind(kindKey, Array.isArray(colors) ? colors : []);
    if (!ordered.length) return false;
    if (kindKey === "R1") {
      return card.colorA === ordered[0];
    }
    if (kindKey === "R2") {
      return card.colorA === ordered[0] && card.colorB === ordered[1];
    }
    if (kindKey === "R3") {
      return card.colorA === ordered[0] && card.colorB === ordered[1] && card.colorC === ordered[2];
    }
    if (kindKey === "R4") {
      return card.colorA === ordered[0]
        && card.colorB === ordered[1]
        && card.colorC === ordered[2]
        && card.colorD === ordered[3];
    }
    if (kindKey === "DS") {
      return card.colorA === ordered[0];
    }
    return false;
  }

  function getCardCount(World, kind, colors, tier, { availableOnly = false } = {}) {
    if (!World) return 0;
    ensureCardsPool(World);
    let count = 0;
    for (const card of World.cardsPool) {
      if (!cardMatches(card, kind, colors, tier)) continue;
      if (availableOnly && card.inSlotKey) continue;
      count += 1;
    }
    return count;
  }

  function getFirstAvailableCard(World, kind, colors, tier) {
    if (!World) return null;
    ensureCardsPool(World);
    return World.cardsPool.find((card) => cardMatches(card, kind, colors, tier) && !card.inSlotKey) || null;
  }

  function consumeAvailableCards(World, kind, colors, tier, count) {
    if (!World) return 0;
    ensureCardsPool(World);
    let remaining = Math.max(0, Math.floor(count || 0));
    if (!remaining) return 0;
    for (let i = World.cardsPool.length - 1; i >= 0 && remaining > 0; i--) {
      const card = World.cardsPool[i];
      if (!cardMatches(card, kind, colors, tier)) continue;
      if (card.inSlotKey) continue;
      World.cardsPool.splice(i, 1);
      remaining -= 1;
    }
    recomputeTotalCards(World);
    return count - remaining;
  }

  function removeCardsById(World, cardIds) {
    if (!World || !Array.isArray(cardIds) || !cardIds.length) return 0;
    ensureCardsPool(World);
    const targetIds = new Set(cardIds.map(String));
    let removed = 0;
    for (let i = World.cardsPool.length - 1; i >= 0; i--) {
      const card = World.cardsPool[i];
      if (!card || !card.id) continue;
      if (!targetIds.has(String(card.id))) continue;
      World.cardsPool.splice(i, 1);
      removed += 1;
    }
    if (removed) recomputeTotalCards(World);
    return removed;
  }

  function getRecentCardIds(World, kind, colors, tier, count) {
    if (!World) return [];
    ensureCardsPool(World);
    const wanted = Math.max(0, Math.floor(count || 0));
    if (!wanted) return [];
    const ids = [];
    for (let i = World.cardsPool.length - 1; i >= 0 && ids.length < wanted; i--) {
      const card = World.cardsPool[i];
      if (!cardMatches(card, kind, colors, tier)) continue;
      ids.push(String(card.id));
    }
    return ids;
  }

  function addCardToPool(World, payload) {
    if (!World) return null;
    ensureCardsPool(World);
    let entity = null;
    if (payload && payload.id && payload.kind && payload.tier && payload.colorA) {
      const kindKey = String(payload.kind).toUpperCase();
      const normalizedA = normalizePack01Color(payload.colorA);
      const normalizedB = payload.colorB ? normalizePack01Color(payload.colorB) : null;
      const normalizedC = payload.colorC ? normalizePack01Color(payload.colorC) : null;
      const normalizedD = payload.colorD ? normalizePack01Color(payload.colorD) : null;
      const orderedColors = getCardColorsForKind(kindKey, [normalizedA, normalizedB, normalizedC, normalizedD].filter(Boolean));
      const cardKey = getCardKey(kindKey, orderedColors);
      entity = {
        id: cardKey || String(payload.id),
        kind: kindKey,
        tier: normalizeSubMetaTier(payload.tier),
        colorA: orderedColors[0],
        colorB: orderedColors[1] || null,
        colorC: orderedColors[2] || null,
        colorD: orderedColors[3] || null,
        inSlotKey: payload.inSlotKey || null
      };
    } else {
      entity = createCardEntity(payload);
    }
    const debugCards = typeof window !== "undefined" && window.HC && window.HC.debugCards;
    if (!entity || !entity.colorA || (entity.kind === "R2" && !entity.colorB)) {
      if (debugCards) console.warn("addCardToPool rejected", payload);
      return null;
    }
    if (entity.kind === "R3" && (!entity.colorB || !entity.colorC)) {
      if (debugCards) console.warn("addCardToPool rejected", payload);
      return null;
    }
    if (entity.kind === "R4" && (!entity.colorB || !entity.colorC || !entity.colorD)) {
      if (debugCards) console.warn("addCardToPool rejected", payload);
      return null;
    }
    World.cardsPool.push(entity);
    recomputeTotalCards(World);
    logRuntimeEvent("cards", window.HC?.DebugEventTypes?.CARD_CREATED, {
      cardId: entity.id,
      kind: entity.kind,
      tier: entity.tier,
      colors: [entity.colorA, entity.colorB, entity.colorC, entity.colorD].filter(Boolean),
    }, { source: "CardEngine.addCardToPool" });
    return entity;
  }

  function setPendingChoiceCard(World, payload) {
    if (!World) return null;
    ensureCardsPool(World);
    const entity = createCardEntity(payload);
    if (!entity) return null;
    const now = nowMs();
    World.pendingCard = entity;
    World.pendingCardUntilMs = now + 3000;
    return entity;
  }

  function flushPendingCard(World, nowMs) {
    if (!World || !World.pendingCard) return false;
    const now = Number(nowMs);
    if (!Number.isFinite(now)) return false;
    if (now < (World.pendingCardUntilMs || 0)) return false;
    World.pendingCard = null;
    World.pendingCardUntilMs = 0;
    return true;
  }

  function consumePendingCard(World, { kind, tier, colors } = {}, nowMs) {
    if (!World) return false;
    ensureCardsPool(World);
    const pending = World.pendingCard;
    const now = Number(nowMs);
    if (!pending || !Number.isFinite(now) || now > (World.pendingCardUntilMs || 0)) return false;
    if (!cardMatches(pending, kind, colors, tier)) return false;
    World.pendingCard = null;
    World.pendingCardUntilMs = 0;
    if (state.sequence && Array.isArray(state.sequence.tempCards)) {
      const idx = state.sequence.tempCards.findIndex((card) => cardMatches(card, kind, colors, tier));
      if (idx >= 0) state.sequence.tempCards.splice(idx, 1);
    }
    if (state.sequenceOverlay) state.sequenceOverlay.visible = false;
    return true;
  }

  function onCardCollected(payload) {
    const World = state.world;
    if (!World) return null;
    ensureCardsPool(World);
    if (World.pendingCard) {
      World.pendingCard = null;
      World.pendingCardUntilMs = 0;
    }
    const entity = addCardToPool(World, payload);
    if (!entity) {
      const debugCards = typeof window !== "undefined" && window.HC && window.HC.debugCards;
      if (debugCards) console.warn("[CARD_COLLECT_FAIL]", payload);
      return null;
    }
    logRuntimeEvent("cards", window.HC?.DebugEventTypes?.CARD_COLLECTED, {
      cardId: entity.id,
      kind: entity.kind,
    }, { source: "CardEngine.onCardCollected" });
    return entity;
  }

  function getTotalCardCount(World) {
    if (!World) return 0;
    if (typeof World.totalCards === "number") return World.totalCards;
    return recomputeTotalCards(World);
  }

  function recomputeTotalCards(World) {
    if (!World) return 0;
    if (!Array.isArray(World.cardsPool)) {
      World.cardsPool = [];
    }
    const total = Array.isArray(World.cardsPool) ? World.cardsPool.length : 0;
    World.totalCards = total;
    return total;
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
    return SUB_META_FORMA_REDUCTION[tierKey] || SUB_META_FORMA_REDUCTION.DR || null;
  }

  function applyWorldSlotEffectsOnRunActivation(World, nowMs, activatedColors, cardKind) {
    if (!World) return;
    const strengthMul = cardKind === "R2" ? 2 : 1;
    World.runWorldStrengthMul = strengthMul;
    World.runActiveColors = Array.isArray(activatedColors) ? activatedColors.filter(Boolean) : [];

    const worldSlots = window.HC && window.HC.WorldSlots;
    const getMetaTier = (slotKey) => {
      if (worldSlots && typeof worldSlots.getMetaTier === "function") {
        return worldSlots.getMetaTier(slotKey);
      }
      const assignment = World.metaSlots?.[slotKey];
      return assignment ? normalizeSubMetaTier(assignment.tier) : null;
    };

    const timeTier = getMetaTier("czas");
    const timeBonusMap = { DR: 30000, sDR: 60000, pDR: 120000 };
    const timeBonus = timeTier ? (timeBonusMap[timeTier] || 0) : 0;
    World.fxTimeBonusMs = Math.max(0, timeBonus);

    const intentTier = getMetaTier("intencja");
    const intentBase = {
      DR: { asteroid: 0.30, planet: 0.30 },
      sDR: { asteroid: 0.60, planet: 0.60 },
      pDR: { asteroid: 0.80, planet: 0.80 }
    };
    const intent = intentTier ? (intentBase[intentTier] || null) : null;
    World.fxIntentBounceAsteroidPct = intent
      ? clampNum(intent.asteroid * strengthMul, 0, 0.95)
      : 0;
    World.fxIntentBouncePlanetPct = intent
      ? clampNum(intent.planet * strengthMul, 0, 0.95)
      : 0;

    const silenceTier = getMetaTier("cisza");
    const silenceRateMap = { DR: 0.20, sDR: 0.40, pDR: 0.60 };
    const baseReduction = silenceTier ? (silenceRateMap[silenceTier] || 0) : 0;
    const reduction = clampNum(baseReduction * strengthMul, 0, 0.95);
    const mul = reduction > 0 ? (1 / (1 - reduction)) : 1;
    const spawnBase = Number.isFinite(World.spawnIntervalMulBase) ? World.spawnIntervalMulBase : 1;
    World.fxSpawnIntervalMul = mul;
    World.spawnIntervalMul = clampNum(spawnBase * mul, 0.25, 6.0);
    World.fxSilenceOnlyColors = [];
    World.fxSilenceOnlyColorsUntilMs = 0;

    World.fxLastActivation = {
      cardKind,
      activatedColors: Array.isArray(activatedColors) ? activatedColors.slice() : [],
      strengthMul,
      timeTier,
      intentTier,
      silenceTier,
      atMs: nowMs
    };
  }

  function getFormaTimeBonusMs(World) {
    if (!World) return 0;
    const bonus = Number(World.fxTimeBonusMs || 0);
    return Number.isFinite(bonus) ? bonus : 0;
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
        World.formaOrbitReductionAsteroidBase = 0;
        World.formaOrbitReductionPlanetBase = 0;
        World.formaOrbitReductionStarBase = 0;
      }
      return;
    }
    if (World.formaActiveUntilMs && nowMs >= World.formaActiveUntilMs) {
      World.formaActiveUntilMs = 0;
      World.formaStrengthMul = 1;
      World.formaOrbitReduction = 0;
      World.formaOrbitReductionBase = 0;
      World.formaOrbitReductionAsteroidBase = 0;
      World.formaOrbitReductionPlanetBase = 0;
      World.formaOrbitReductionStarBase = 0;
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
    const baseFallback = clampNum(World.formaOrbitReductionBase || World.formaOrbitReduction || 0, 0, 0.95);
    const baseAsteroid = clampNum(Number.isFinite(World.formaOrbitReductionAsteroidBase)
      ? World.formaOrbitReductionAsteroidBase
      : baseFallback, 0, 0.95);
    const basePlanet = clampNum(Number.isFinite(World.formaOrbitReductionPlanetBase)
      ? World.formaOrbitReductionPlanetBase
      : baseFallback, 0, 0.95);
    const baseStar = clampNum(Number.isFinite(World.formaOrbitReductionStarBase)
      ? World.formaOrbitReductionStarBase
      : baseFallback, 0, 0.95);
    const strengthMul = active ? (Number(World.runWorldStrengthMul) || World.formaStrengthMul || 1) : 1;
    const reductionAsteroid = active ? clampNum(baseAsteroid * strengthMul, 0, 0.95) : 0;
    const reductionPlanet = active ? clampNum(basePlanet * strengthMul, 0, 0.95) : 0;
    const reductionStar = active ? clampNum(baseStar * strengthMul, 0, 0.95) : 0;
    const multiplierAsteroid = 1 - reductionAsteroid;
    const multiplierPlanet = 1 - reductionPlanet;
    const multiplierStar = 1 - reductionStar;

    World.formaStrengthMul = strengthMul;
    World.formaOrbitReduction = reductionAsteroid;

    World.metaOrbitMulAsteroid = multiplierAsteroid;
    World.metaOrbitMulPlanet = multiplierPlanet;
    World.metaOrbitMulStar = multiplierStar;

    if (World.asteroids && World.asteroids.length) {
      for (const a of World.asteroids) syncOrbitRadiusForBody(a, "asteroid", multiplierAsteroid);
    }
    if (World.planets && World.planets.length) {
      for (const p of World.planets) syncOrbitRadiusForBody(p, "planet", multiplierPlanet);
    }
    if (World.stars && World.stars.length) {
      for (const s of World.stars) syncOrbitRadiusForBody(s, "star", multiplierStar);
    }
  }

  function startFormaEffect(World, now, runKind, baseDurationMs) {
    if (!World) return false;
    const assignment = World.metaSlots?.forma;
    if (!assignment) return false;
    const tierKey = normalizeSubMetaTier(assignment.tier);
    const baseReduction = getFormaReductionForTier(tierKey);
    if (!baseReduction) return false;
    const baseAsteroid = clampNum(Number(baseReduction.asteroid || 0), 0, 0.95);
    const basePlanet = clampNum(Number(baseReduction.planet || 0), 0, 0.95);
    const baseStar = clampNum(Number(baseReduction.star || 0), 0, 0.95);
    if (!(baseAsteroid > 0 || basePlanet > 0 || baseStar > 0)) return false;
    const timeBonus = getFormaTimeBonusMs(World);
    const durationMs = computeActivationDurationMs(baseDurationMs, timeBonus, runKind);
    if (!Number.isFinite(durationMs) || durationMs <= 0) return false;

    World.formaOrbitReductionBase = baseAsteroid;
    World.formaOrbitReduction = baseAsteroid;
    World.formaOrbitReductionAsteroidBase = baseAsteroid;
    World.formaOrbitReductionPlanetBase = basePlanet;
    World.formaOrbitReductionStarBase = baseStar;
    World.formaStrengthMul = runKind === "R2" ? 2 : 1;
    World.formaActiveUntilMs = now + durationMs;
    World.formaColorKey = getFormaEffectColor(World);
    applyFormaToWorld(World);
    return true;
  }

  function getSubMetaCardByKey(cardKey) {
    if (!cardKey) return null;
    if (cardKey.startsWith("DS_")) {
      const parts = cardKey.split("_");
      if (parts.length >= 3) {
        const tier = normalizeSubMetaTier(parts[1]);
        const color = normalizePack01Color(parts[2]);
        if (color) {
          return {
            key: cardKey,
            title: "DS",
            tier,
            color,
            kind: "DS",
            allowedSlots: []
          };
        }
      }
      return null;
    }
    return SUB_META_CARD_LIBRARY.find((card) => card.key === cardKey) || null;
  }

  function getPrgR2CardKey(tier, colors) {
    const tierKey = normalizeSubMetaTier(tier);
    const [colorA, colorB] = getCanonicalPairColors(colors?.[0], colors?.[1]);
    if (!colorA || !colorB) return null;
    return `PRG_R2_${tierKey}_${colorA}_${colorB}`;
  }

  function getPrgCardByKey(cardKey) {
    if (!cardKey) return null;
    if (cardKey.startsWith("PRG_R2_")) {
      const parts = cardKey.split("_");
      if (parts.length >= 5) {
        const tier = normalizeSubMetaTier(parts[2]);
        const colorA = normalizePack01Color(parts[3]);
        const colorB = normalizePack01Color(parts[4]);
        if (colorA && colorB) {
          return {
            key: cardKey,
            kind: "R2",
            tier,
            colors: [colorA, colorB]
          };
        }
      }
      return null;
    }
    const card = getSubMetaCardByKey(cardKey);
    if (card) {
      return {
        key: card.key,
        kind: "R1",
        tier: card.tier,
        colors: [card.color]
      };
    }
    return null;
  }

  function getForgeCostRp(kind, toTier) {
    const kindKey = String(kind || "").toUpperCase();
    const tierKey = normalizeSubMetaTier(toTier);
    const costs = SUB_META_FORGE_RP_COSTS[kindKey];
    if (!costs) return 0;
    return Math.max(0, Math.floor(costs[tierKey] || 0));
  }

  function getForgeStackKey(card) {
    if (!card || !card.id) return null;
    const tierKey = normalizeSubMetaTier(card.tier);
    return `${card.id}:${tierKey}`;
  }

  function getForgeAvailableStacks(World) {
    if (!World) return new Map();
    ensureCardsPool(World);
    const stacks = new Map();
    for (const card of World.cardsPool) {
      if (!card || card.inSlotKey != null) continue;
      const stackKey = getForgeStackKey(card);
      if (!stackKey) continue;
      const existing = stacks.get(stackKey);
      if (existing) {
        existing.count += 1;
        continue;
      }
      stacks.set(stackKey, {
        stackKey,
        baseId: card.id,
        kind: card.kind,
        fromTier: normalizeSubMetaTier(card.tier),
        colors: getEntityColors(card),
        count: 1
      });
    }
    return stacks;
  }

  function buildForgeCandidateFromStack(stack) {
    if (!stack) return null;
    const fromTier = normalizeSubMetaTier(stack.fromTier);
    const toTier = fromTier === "DR" ? "sDR" : (fromTier === "sDR" ? "pDR" : null);
    if (!toTier) return null;
    if (stack.count < 3) return null;
    const key = `forge_${stack.baseId}_${fromTier}_${toTier}`;
    return {
      key,
      kind: stack.kind,
      baseId: stack.baseId,
      colors: stack.colors,
      fromTier,
      toTier,
      requiredCount: 3,
      costRp: getForgeCostRp(stack.kind, toTier)
    };
  }

  function getSubMetaForgeList(World) {
    if (!World) return [];
    if (!SUB_META_FORGE_ENABLED) return [];
    const list = [];
    const stacks = getForgeAvailableStacks(World);
    stacks.forEach((stack) => {
      const candidate = buildForgeCandidateFromStack(stack);
      if (candidate) list.push(candidate);
    });
    return list;
  }

  function getSubMetaForgeByKey(World, forgeKey) {
    if (!forgeKey) return null;
    const list = getSubMetaForgeList(World);
    return list.find((forge) => forge.key === forgeKey) || null;
  }

  function getForgeAvailableCount(World, baseId, fromTier) {
    if (!World || !baseId) return 0;
    ensureCardsPool(World);
    const tierKey = normalizeSubMetaTier(fromTier);
    let count = 0;
    for (const card of World.cardsPool) {
      if (!card || card.inSlotKey != null) continue;
      if (card.id !== baseId) continue;
      if (normalizeSubMetaTier(card.tier) !== tierKey) continue;
      count += 1;
    }
    return count;
  }

  function canCraftForge(World, forge) {
    if (!World || !forge) return false;
    const rpValue = Math.max(0, Math.floor(World.score || 0));
    const available = getForgeAvailableCount(World, forge.baseId, forge.fromTier);
    return rpValue >= (forge.costRp || 0) && available >= (forge.requiredCount || 0);
  }

  function consumeAvailableCardsByIdAndTier(World, baseId, fromTier, count) {
    if (!World || !baseId) return 0;
    ensureCardsPool(World);
    let remaining = Math.max(0, Math.floor(count || 0));
    if (!remaining) return 0;
    const tierKey = normalizeSubMetaTier(fromTier);
    for (let i = World.cardsPool.length - 1; i >= 0 && remaining > 0; i--) {
      const card = World.cardsPool[i];
      if (!card || card.inSlotKey) continue;
      if (card.id !== baseId) continue;
      if (normalizeSubMetaTier(card.tier) !== tierKey) continue;
      World.cardsPool.splice(i, 1);
      remaining -= 1;
    }
    recomputeTotalCards(World);
    return count - remaining;
  }

  function craftSubMetaForge(World, forge) {
    if (!SUB_META_FORGE_ENABLED) return false;
    if (!canCraftForge(World, forge)) return false;
    const cost = Math.max(0, Math.floor(forge.costRp || 0));
    const consume = Math.max(0, Math.floor(forge.requiredCount || 0));
    const available = getForgeAvailableCount(World, forge.baseId, forge.fromTier);
    if (available < consume) return false;
    if ((World.score || 0) < cost) return false;
    const removed = consumeAvailableCardsByIdAndTier(World, forge.baseId, forge.fromTier, consume);
    if (removed !== consume) return false;
    World.score = Math.max(0, Math.floor((World.score || 0) - cost));
    addCardToPool(World, {
      kind: forge.kind,
      tier: forge.toTier,
      colorA: forge.colors[0],
      colorB: forge.colors[1] || null,
      colorC: forge.colors[2] || null,
      colorD: forge.colors[3] || null,
      id: forge.baseId
    });
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
        const count = getCardCount(World, "R1", [color], tier, { availableOnly: true });
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
    SUB_META_COLORS.forEach((color) => {
      SUB_META_TIERS.forEach((tier) => {
        const count = getCardCount(World, "DS", [color], tier, { availableOnly: true });
        if (count > 0) {
          entries.push({
            kind: "DS",
            label: `DS ${tier}`,
            tier,
            colors: [color],
            count
          });
        }
      });
    });
    SUB_META_R2_PAIRS.forEach((pair) => {
      SUB_META_TIERS.forEach((tier) => {
        const count = getCardCount(World, "R2", pair, tier, { availableOnly: true });
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
    SUB_META_R3_COMBOS.forEach((combo) => {
      SUB_META_TIERS.forEach((tier) => {
        const count = getCardCount(World, "R3", combo.colors, tier, { availableOnly: true });
        if (count > 0) {
          entries.push({
            kind: "R3",
            label: `R3 ${tier}`,
            tier,
            colors: combo.colors,
            count
          });
        }
      });
    });
    SUB_META_R4_COMBOS.forEach((combo) => {
      SUB_META_TIERS.forEach((tier) => {
        const count = getCardCount(World, "R4", combo.colors, tier, { availableOnly: true });
        if (count > 0) {
          entries.push({
            kind: "R4",
            label: `R4 ${tier}`,
            tier,
            colors: combo.colors,
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
      return getCardCount(World, "R1", [card.color], card.tier, { availableOnly: true }) > 0;
    });
  }

  function getWorldAvailableCards(World, slotKey, slotIndex, worldState) {
    if (!World || !slotKey || !Number.isInteger(slotIndex)) return [];
    const slotColor = SUB_META_SLOT_COLORS[slotKey];
    const entry = worldState?.slots?.[slotKey];
    if (!slotColor || !entry) return [];
    if (slotIndex === 2 && !entry.dsUnlocked) {
      const list = [];
      SUB_META_TIERS.forEach((tier) => {
        const count = getCardCount(World, "DS", [slotColor], tier, { availableOnly: true });
        if (count <= 0) return;
        list.push({
          key: `DS_${normalizeSubMetaTier(tier)}_${slotColor}`,
          kind: "DS",
          tier,
          colors: [slotColor],
          count
        });
      });
      return list;
    }
    return SUB_META_CARD_LIBRARY.filter((card) => {
      if (!card || card.color !== slotColor) return false;
      if (!Array.isArray(card.allowedSlots) || !card.allowedSlots.includes(slotKey)) return false;
      return getCardCount(World, "R1", [card.color], card.tier, { availableOnly: true }) > 0;
    });
  }

  function getPrgAvailableCards(World, selection) {
    if (!World || !selection) return [];
    if (selection.type === "r1") {
      const colorKey = SUB_META_PRG_COLORS[selection.branchKey];
      if (!colorKey) return [];
      return SUB_META_CARD_LIBRARY.filter((card) => {
        if (!card || card.color !== colorKey) return false;
        return getCardCount(World, "R1", [card.color], card.tier, { availableOnly: true }) > 0;
      });
    }
    if (selection.type === "r2") {
      const list = [];
      const pair = getPrgBindingPair(selection.bindingIndex);
      if (!pair) return [];
      SUB_META_TIERS.forEach((tier) => {
        const count = getCardCount(World, "R2", pair, tier, { availableOnly: true });
        if (count <= 0) return;
        const key = getPrgR2CardKey(tier, pair);
        if (!key) return;
        list.push({
          key,
          kind: "R2",
          tier,
          colors: pair,
          count
        });
      });
      return list;
    }
    return [];
  }

  function getWorldBindingAvailableCards(World, bindingIndex) {
    if (!World || !Number.isInteger(bindingIndex)) return [];
    const pair = getWorldBindingPair(bindingIndex);
    if (!pair) return [];
    const list = [];
    SUB_META_TIERS.forEach((tier) => {
      const count = getCardCount(World, "R2", pair, tier, { availableOnly: true });
      if (count <= 0) return;
      const key = getPrgR2CardKey(tier, pair);
      if (!key) return;
      list.push({
        key,
        kind: "R2",
        tier,
        colors: pair,
        count
      });
    });
    return list;
  }

  function ensurePlaceholderAssignments(World) {
    if (!World) return null;
    if (!World.submeta || typeof World.submeta !== "object") World.submeta = {};
    if (!World.submeta.placeholderAssignments || typeof World.submeta.placeholderAssignments !== "object" || Array.isArray(World.submeta.placeholderAssignments)) {
      World.submeta.placeholderAssignments = {};
    }
    return World.submeta.placeholderAssignments;
  }

  function getPlaceholderAvailableCards(World, target) {
    if (!World || !target) return [];
    if (target.type === "prg-r1" || target.type === "prg-r2") {
      return getPrgAvailableCards(World, target.selection);
    }
    if (target.type === "world-r1") {
      return getWorldAvailableCards(World, target.slotKey, target.slotIndex, ensureSubMetaWorld(World));
    }
    if (target.type === "world-r2") {
      return getWorldBindingAvailableCards(World, target.bindingIndex);
    }
    return [];
  }

  function assignmentCardMatches(candidate, card) {
    if (!candidate || !card) return false;
    const candidateKind = String(candidate.kind || (candidate.color ? "R1" : "")).toUpperCase();
    const cardKind = String(card.kind || "").toUpperCase();
    if (!candidateKind || candidateKind !== cardKind) return false;
    if (normalizeSubMetaTier(candidate.tier) !== normalizeSubMetaTier(card.tier)) return false;
    const candidateColors = getCardColorsForKind(candidateKind, candidate.colors || [candidate.color].filter(Boolean));
    const cardColors = getCardColorsForKind(cardKind, card.colors || [card.color].filter(Boolean));
    return candidateColors.length === cardColors.length
      && candidateColors.every((color, index) => color === cardColors[index]);
  }

  function assignPlaceholderCard(World, placeholderId, target, card) {
    if (!World || !placeholderId || !target || !card) return { ok: false, reason: "missing-data" };
    const assignments = ensurePlaceholderAssignments(World);
    if (!assignments) return { ok: false, reason: "missing-state" };
    if (assignments[placeholderId]) return { ok: false, reason: "occupied" };
    const availableCard = getPlaceholderAvailableCards(World, target).find((candidate) => assignmentCardMatches(candidate, card));
    if (!availableCard) return { ok: false, reason: "incompatible" };
    const kind = String(availableCard.kind || (availableCard.color ? "R1" : "")).toUpperCase();
    const tier = normalizeSubMetaTier(availableCard.tier);
    const colors = getCardColorsForKind(kind, availableCard.colors || [availableCard.color].filter(Boolean));
    const poolCard = getFirstAvailableCard(World, kind, colors, tier);
    if (!poolCard) return { ok: false, reason: "unavailable" };
    const inSlotKey = `submeta:placeholder:${placeholderId}`;
    poolCard.inSlotKey = inSlotKey;
    const assignment = {
      placeholderId,
      cardKey: availableCard.key || card.key || getCardKey(kind, colors),
      poolCardId: poolCard.id || null,
      inSlotKey,
      kind,
      tier,
      colors: colors.slice()
    };
    assignments[placeholderId] = assignment;
    return { ok: true, assignment: { ...assignment, colors: assignment.colors.slice() } };
  }

  function getPlaceholderAssignments(World) {
    const assignments = ensurePlaceholderAssignments(World);
    if (!assignments) return {};
    return Object.fromEntries(Object.entries(assignments).map(([placeholderId, assignment]) => [
      placeholderId,
      assignment ? { ...assignment, colors: Array.isArray(assignment.colors) ? assignment.colors.slice() : [] } : assignment
    ]));
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

  const subMetaCardAssetImages = new Map();

  function getSubMetaCardAssetImage(card) {
    const asset = window.HC?.CardAssets?.resolveCardAsset?.(card, { context: "card" }) || null;
    if (!asset || typeof window.Image !== "function") return null;
    const cached = subMetaCardAssetImages.get(asset.url);
    if (cached) return cached.status === "loaded" ? cached.image : null;

    const entry = { image: new window.Image(), status: "loading" };
    subMetaCardAssetImages.set(asset.url, entry);
    entry.image.decoding = "async";
    entry.image.onload = () => { entry.status = "loaded"; };
    entry.image.onerror = () => {
      entry.status = "failed";
      window.HC?.CardAssets?.markAssetFailed?.(asset, card);
    };
    entry.image.src = asset.url;
    return null;
  }

  function renderMetaCard(ctx, x, y, card, options = {}) {
    const typeLabel = String(card?.type || card?.kind || "R1");
    const tierLabel = normalizeSubMetaTier(card?.tier);
    const count = Math.max(0, Math.floor(Number(card?.count || 0)));
    const showCount = options.showCount && count > 0;
    const isSelected = !!options.isSelected;
    const isDisabled = !!options.isDisabled;
    const rectW = SUB_META_CARD_W;
    const rectH = SUB_META_CARD_H;
    const normalizedColors = getEntityColors({ ...card, kind: typeLabel });
    const paintColors = normalizedColors.map((color) => PACK01_COLOR_HEX[color] || color || "#FFFFFF");
    ctx.save();
    ctx.globalAlpha = isDisabled ? 0.35 : 1.0;
    const assetImage = getSubMetaCardAssetImage({ ...card, kind: typeLabel, tier: tierLabel, colors: normalizedColors });
    if (assetImage) {
      ctx.drawImage(assetImage, x, y, rectW, rectH);
    } else if (paintColors.length <= 1 || typeLabel === "R1") {
      ctx.fillStyle = paintColors[0] || "#FFFFFF";
      ctx.fillRect(x, y, rectW, rectH);
    } else if (paintColors.length === 2 || typeLabel === "R2") {
      const halfH = rectH / 2;
      ctx.fillStyle = paintColors[0] || "#FFFFFF";
      ctx.fillRect(x, y, rectW, halfH);
      ctx.fillStyle = paintColors[1] || "#FFFFFF";
      ctx.fillRect(x, y + halfH, rectW, rectH - halfH);
    } else if (paintColors.length === 3 || typeLabel === "R3") {
      const stripeH = rectH / 3;
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = paintColors[i] || "#FFFFFF";
        const stripeY = y + i * stripeH;
        const height = i === 2 ? rectH - stripeH * 2 : stripeH;
        ctx.fillRect(x, stripeY, rectW, height);
      }
    } else {
      const halfW = rectW / 2;
      const halfH = rectH / 2;
      ctx.fillStyle = paintColors[0] || "#FFFFFF";
      ctx.fillRect(x, y, halfW, halfH);
      ctx.fillStyle = paintColors[1] || "#FFFFFF";
      ctx.fillRect(x + halfW, y, rectW - halfW, halfH);
      ctx.fillStyle = paintColors[2] || "#FFFFFF";
      ctx.fillRect(x, y + halfH, halfW, rectH - halfH);
      ctx.fillStyle = paintColors[3] || "#FFFFFF";
      ctx.fillRect(x + halfW, y + halfH, rectW - halfW, rectH - halfH);
    }

    if (!assetImage && tierLabel === "sDR") {
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.5, y + 0.5, rectW - 1, rectH - 1);
    } else if (!assetImage && tierLabel === "pDR") {
      ctx.strokeStyle = "rgba(255,215,120,0.9)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 0.5, y + 0.5, rectW - 1, rectH - 1);
    }

    if (isSelected) {
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 1, y - 1, rectW + 2, rectH + 2);
    }

    if (!assetImage) {
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
    }

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

  function getSubMetaVisualRuntime() {
    const root = typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null);
    const hc = root && root.HC;
    return {
      visualAssets: hc && hc.VisualAssets,
      frameComposer: hc && hc.FrameComposer,
      layoutEngine: hc && hc.SubMetaLayout
    };
  }

  function logSubMetaRootFrameDiagnostic(status, details = {}) {
    if (!FRAME_COMPOSER_SUBMETA_ROOT_DEBUG || typeof console === "undefined" || typeof console.debug !== "function") return;
    const key = `${status}:${JSON.stringify(details)}`;
    if (subMetaRootFrameVisualState.lastLogKey === key) return;
    subMetaRootFrameVisualState.lastLogKey = key;
    console.debug("[HC.SubMetaRootFrame]", status, details);
  }

  function requestSubMetaRootFrameAssets() {
    if (!FRAME_COMPOSER_SUBMETA_ROOT_ENABLED || subMetaRootFrameVisualState.requested) return false;

    const { visualAssets } = getSubMetaVisualRuntime();
    if (!visualAssets
      || typeof visualAssets.loadManifest !== "function"
      || typeof visualAssets.preload !== "function") {
      subMetaRootFrameVisualState.preloadStatus = "visual_assets_unavailable";
      return false;
    }

    subMetaRootFrameVisualState.requested = true;
    subMetaRootFrameVisualState.preloadStatus = "loading_manifest";
    const currentManifest = typeof visualAssets.getManifest === "function" ? visualAssets.getManifest() : null;
    const manifestReady = typeof visualAssets.isReady === "function"
      && visualAssets.isReady()
      && currentManifest?.kitId === "submeta_main_frame_v01";
    const manifestPromise = manifestReady
      ? Promise.resolve({ ok: true, manifestLoaded: true, skipped: true })
      : visualAssets.loadManifest(FRAME_COMPOSER_SUBMETA_ROOT_MANIFEST_URL);

    manifestPromise
      .then((manifestResult) => {
        if (!manifestResult || !manifestResult.ok) {
          subMetaRootFrameVisualState.manifestLoaded = false;
          subMetaRootFrameVisualState.preloadStatus = "manifest_error";
          logSubMetaRootFrameDiagnostic("manifest_error", manifestResult || {});
          return null;
        }

        subMetaRootFrameVisualState.manifestLoaded = true;
        subMetaRootFrameVisualState.preloadStatus = "preloading";
        return visualAssets.preload(FRAME_COMPOSER_SUBMETA_ROOT_PARTS);
      })
      .then((preloadSummary) => {
        if (!preloadSummary) return;
        subMetaRootFrameVisualState.preloadSummary = preloadSummary;
        subMetaRootFrameVisualState.preloadStatus = preloadSummary.failed > 0 ? "preload_partial" : "ready";
        logSubMetaRootFrameDiagnostic(subMetaRootFrameVisualState.preloadStatus, preloadSummary);
      })
      .catch((error) => {
        subMetaRootFrameVisualState.manifestLoaded = false;
        subMetaRootFrameVisualState.preloadStatus = "preload_error";
        subMetaRootFrameVisualState.preloadSummary = { error: String(error && (error.message || error)) };
        logSubMetaRootFrameDiagnostic("preload_error", subMetaRootFrameVisualState.preloadSummary);
      });

    return true;
  }

  function areSubMetaRootFrameAssetsReady(visualAssets) {
    if (!visualAssets
      || typeof visualAssets.isReady !== "function"
      || typeof visualAssets.getAsset !== "function"
      || typeof visualAssets.getImage !== "function"
      || !visualAssets.isReady()) {
      return false;
    }
    return FRAME_COMPOSER_SUBMETA_ROOT_PARTS.every((logicalName) => (
      !!visualAssets.getAsset(logicalName) && !!visualAssets.getImage(logicalName)
    ));
  }

  function getSubMetaRootFrameAnchor(layout) {
    const { layoutEngine } = getSubMetaVisualRuntime();
    if (layoutEngine && typeof layoutEngine.computeAnchors === "function") {
      try {
        const anchors = layoutEngine.computeAnchors(layout);
        return anchors?.byName?.["submeta.root_frame"] || anchors?.["submeta.root_frame"] || anchors?.rootFrame || null;
      } catch (_error) {
        return null;
      }
    }
    return null;
  }

  function getSubMetaRootFrameVisualMountRect(layout) {
    const anchor = getSubMetaRootFrameAnchor(layout);
    const rect = anchor?.rect || layout?.panel;
    if (!rect) return null;

    return {
      x: rect.x - FRAME_COMPOSER_SUBMETA_ROOT_VISUAL_OUTSET_X,
      y: rect.y - FRAME_COMPOSER_SUBMETA_ROOT_VISUAL_OUTSET_Y,
      w: rect.w + FRAME_COMPOSER_SUBMETA_ROOT_VISUAL_OUTSET_X * 2,
      h: rect.h + FRAME_COMPOSER_SUBMETA_ROOT_VISUAL_OUTSET_Y * 2
    };
  }


  function getPrgFrameProbeConfig() {
    const sessionCfg = window.HC?.Session?.debugConfig?.visual?.prgFrameProbe;
    if (sessionCfg && typeof sessionCfg === "object") return sessionCfg;
    const worldCfg = window.HC?.getWorld?.()?.debug?.visual?.prgFrameProbe;
    if (worldCfg && typeof worldCfg === "object") return worldCfg;
    if (HC_DEBUG_PRG_FRAME_PROBE) {
      return {
        enabled: true,
        mode: "frameRectHeightMountProbe",
        goldTint: true,
        showOverlay: false,
        showBounds: false,
        showAnchors: false,
        showLabels: false,
        showMetadata: false,
      };
    }
    return null;
  }
  function drawPrgFrameRuntimeProbe(ctx, prgRect) {
    const probeCfg = getPrgFrameProbeConfig();
    if (!probeCfg || probeCfg.enabled !== true || !ctx || !prgRect) return;
    const probe = (typeof window !== "undefined" && window.HC && window.HC.PrgFrameProbe)
      ? window.HC.PrgFrameProbe
      : null;
    if (!probe || typeof probe.draw !== "function") return;
    probe.draw(ctx, prgRect, {
      mode: probeCfg.mode || "frameRectHeightMountProbe",
      debugGoldTint: probeCfg.goldTint === false ? null : "#d4af37",
      temporaryPrgFrameTint: probeCfg.goldTint === false ? null : "#d4af37",
      debugOverlay: probeCfg.showOverlay === true,
      showBounds: probeCfg.showBounds === true,
      showAnchors: probeCfg.showAnchors === true,
      showLabels: probeCfg.showLabels === true,
      showMetadata: probeCfg.showMetadata === true,
      tintAlpha: 0.88
    });
  }

  function drawSubMetaRootFrameWithComposer(ctx, layout) {
    if (!FRAME_COMPOSER_SUBMETA_ROOT_ENABLED) {
      subMetaRootFrameVisualState.rootFrameDrawn = false;
      subMetaRootFrameVisualState.fallbackUsed = true;
      return false;
    }

    const { visualAssets, frameComposer } = getSubMetaVisualRuntime();
    if (!visualAssets || !frameComposer
      || typeof frameComposer.computeSubmetaMainFrameV01Layout !== "function"
      || typeof frameComposer.drawSegmentedFrameParts !== "function") {
      requestSubMetaRootFrameAssets();
      subMetaRootFrameVisualState.rootFrameDrawn = false;
      subMetaRootFrameVisualState.fallbackUsed = true;
      return false;
    }

    requestSubMetaRootFrameAssets();
    if (!areSubMetaRootFrameAssetsReady(visualAssets)) {
      subMetaRootFrameVisualState.rootFrameDrawn = false;
      subMetaRootFrameVisualState.fallbackUsed = true;
      return false;
    }

    const visualRect = getSubMetaRootFrameVisualMountRect(layout);
    if (!visualRect) {
      subMetaRootFrameVisualState.rootFrameDrawn = false;
      subMetaRootFrameVisualState.fallbackUsed = true;
      return false;
    }

    const frameLayout = frameComposer.computeSubmetaMainFrameV01Layout(
      visualRect,
      FRAME_COMPOSER_SUBMETA_ROOT_LAYOUT_OVERRIDES
    );
    const summary = frameComposer.drawSegmentedFrameParts(
      ctx,
      visualAssets,
      frameLayout,
      FRAME_COMPOSER_SUBMETA_ROOT_PART_MAP,
      { alpha: 0.92 }
    );
    const expectedCount = FRAME_COMPOSER_SUBMETA_ROOT_PARTS.length;
    const drawn = !!summary
      && summary.drawn === expectedCount
      && summary.total === expectedCount
      && summary.failed === 0;

    subMetaRootFrameVisualState.rootFrameDrawn = drawn;
    subMetaRootFrameVisualState.fallbackUsed = !drawn;
    logSubMetaRootFrameDiagnostic(drawn ? "root_frame_drawn" : "root_frame_fallback", summary || {});
    return drawn;
  }

  function getSubMetaLayout(screenW, screenH) {
    const root = typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null);
    const layoutEngine = root && root.HC && root.HC.SubMetaLayout;
    if (layoutEngine && typeof layoutEngine.compute === "function") {
      const layout = layoutEngine.compute(screenW, screenH, {
        slots: SUB_META_SLOTS,
        prgBranches: SUB_META_PRG_BRANCHES,
        scale: SUB_META_SCALE,
        cardMetrics: {
          w: SUB_META_CARD_W,
          h: SUB_META_CARD_H,
          gapX: SUB_META_CARD_GAP_X,
          gapY: SUB_META_CARD_GAP_Y,
          countPad: SUB_META_COUNT_PAD
        }
      });
      if (layout && layout.panel && Array.isArray(layout.hitRects)) return layout;
    }

    const panelW = Math.min(780, Math.floor(screenW * 0.94));
    const panelH = Math.min(640, Math.floor(screenH * 0.92));
    const panelX = Math.floor((screenW - panelW) / 2);
    const panelY = Math.floor((screenH - panelH) / 2);
    const pad = 18;
    const headerH = 28;
    const columnGap = 16;
    const rowGap = 14;
    const contentW = panelW - pad * 2;
    const leftW = Math.floor(contentW * 0.48);
    const rightW = contentW - leftW - columnGap;
    const leftX = panelX + pad;
    const rightX = leftX + leftW + columnGap;
    const columnTop = panelY + pad + headerH;
    const contentH = panelH - pad * 2 - headerH;
    const prgPanelH = Math.min(160, Math.max(130, Math.floor(contentH * 0.26)));
    const prgRect = {
      x: leftX,
      y: columnTop,
      w: leftW,
      h: prgPanelH
    };
    const pickerInset = 8;
    const pickerGap = 10;
    const closeW = 88;
    const closeH = 26;
    const closeButton = {
      x: panelX + panelW - pad - closeW,
      y: panelY + pad - 4,
      w: closeW,
      h: closeH
    };
    const prgInset = 10;
    const prgInner = {
      x: prgRect.x + prgInset,
      y: prgRect.y + prgInset,
      w: prgRect.w - prgInset * 2,
      h: prgRect.h - prgInset * 2
    };
    const prgBranchRowH = Math.max(56, prgInner.h);
    const prgBranchGap = 10;
    const prgBranchW = Math.floor((prgInner.w - prgBranchGap * (SUB_META_PRG_BRANCHES.length - 1)) / SUB_META_PRG_BRANCHES.length);
    const prgSlotPad = 6;
    const prgSlotW = SUB_META_CARD_W + prgSlotPad * 2;
    const prgSlotH = SUB_META_CARD_H + prgSlotPad * 2;
    const prgSlotGap = 6;
    const prgBranches = SUB_META_PRG_BRANCHES.map((branch, index) => {
      const colX = prgInner.x + index * (prgBranchW + prgBranchGap);
      const colY = prgInner.y;
      const slotsW = prgSlotW * 2 + prgSlotGap;
      const slotsX = colX + Math.floor((prgBranchW - slotsW) / 2);
      const slotY = colY + Math.floor((prgBranchRowH - prgSlotH) / 2);
      const r1Slot = {
        x: slotsX,
        y: slotY,
        w: prgSlotW,
        h: prgSlotH
      };
      const odbSlot = {
        x: slotsX + prgSlotW + prgSlotGap,
        y: slotY,
        w: prgSlotW,
        h: prgSlotH
      };
      return {
        key: branch.key,
        color: branch.color,
        column: { x: colX, y: colY, w: prgBranchW, h: prgBranchRowH },
        r1Slot,
        odbSlot
      };
    });
    const prgR2RowH = Math.max(prgSlotH + 8, Math.floor(prgSlotH * 1.25));
    const prgR2Rect = {
      x: leftX,
      y: prgRect.y + prgRect.h + rowGap,
      w: leftW,
      h: prgR2RowH
    };
    const prgR2Gap = 12;
    const prgR2SlotW = Math.min(prgSlotW + 6, Math.floor((prgR2Rect.w - prgInset * 2 - prgR2Gap * 2) / 3));
    const prgR2SlotH = prgSlotH;
    const prgR2StartX = prgR2Rect.x + prgInset;
    const prgR2RowY = prgR2Rect.y + Math.floor((prgR2Rect.h - prgR2SlotH) / 2);
    const prgR2Slots = [0, 1, 2].map((index) => ({
      x: prgR2StartX + index * (prgR2SlotW + prgR2Gap),
      y: prgR2RowY,
      w: prgR2SlotW,
      h: prgR2SlotH,
      index
    }));
    const worldR2Rect = {
      x: leftX,
      y: prgR2Rect.y + prgR2Rect.h + rowGap,
      w: leftW,
      h: Math.max(prgSlotH + 10, prgR2RowH)
    };
    const worldPad = 10;
    const worldGridGap = 12;
    const worldRect = {
      x: leftX,
      y: worldR2Rect.y + worldR2Rect.h + rowGap,
      w: leftW,
      h: Math.max(160, panelY + panelH - pad - (worldR2Rect.y + worldR2Rect.h + rowGap))
    };
    const worldInner = {
      x: worldRect.x + worldPad,
      y: worldRect.y + worldPad,
      w: worldRect.w - worldPad * 2,
      h: worldRect.h - worldPad * 2
    };
    const worldCellW = Math.floor((worldInner.w - worldGridGap) / 2);
    const worldCellH = Math.floor((worldInner.h - worldGridGap) / 2);
    const worldGridW = worldCellW * 2 + worldGridGap;
    const worldGridH = worldCellH * 2 + worldGridGap;
    const worldGridX = worldInner.x + Math.floor((worldInner.w - worldGridW) / 2);
    const worldGridY = worldInner.y + Math.floor((worldInner.h - worldGridH) / 2);
    const worldSocketGap = 8;
    const worldSocketW = prgSlotW;
    const worldSocketH = prgSlotH;
    const worldSlots = SUB_META_SLOTS.map((slot, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = worldGridX + col * (worldCellW + worldGridGap);
      const y = worldGridY + row * (worldCellH + worldGridGap);
      const socketsW = worldSocketW * 3 + worldSocketGap * 2;
      const socketsX = x + Math.floor((worldCellW - socketsW) / 2);
      const socketsY = y + Math.floor((worldCellH - worldSocketH) / 2);
      const sockets = [0, 1, 2].map((socketIndex) => ({
        x: socketsX + socketIndex * (worldSocketW + worldSocketGap),
        y: socketsY,
        w: worldSocketW,
        h: worldSocketH,
        index: socketIndex
      }));
      return {
        ...slot,
        x,
        y,
        w: worldCellW,
        h: worldCellH,
        sockets
      };
    });
    const worldR2Gap = 12;
    const worldR2SlotW = Math.min(prgSlotW + 6, Math.floor((worldR2Rect.w - worldPad * 2 - worldR2Gap * 2) / 3));
    const worldR2SlotH = prgSlotH;
    const worldR2StartX = worldR2Rect.x + worldPad;
    const worldR2RowY = worldR2Rect.y + Math.floor((worldR2Rect.h - worldR2SlotH) / 2);
    const worldR2Slots = [0, 1, 2].map((index) => ({
      x: worldR2StartX + index * (worldR2SlotW + worldR2Gap),
      y: worldR2RowY,
      w: worldR2SlotW,
      h: worldR2SlotH,
      index
    }));
    const hitRects = [];
    prgR2Slots.forEach((slot) => {
      hitRects.push({ type: "prg-r2", index: slot.index, x: slot.x, y: slot.y, w: slot.w, h: slot.h });
    });
    prgBranches.forEach((branch) => {
      hitRects.push({ type: "prg-r1", branchKey: branch.key, x: branch.r1Slot.x, y: branch.r1Slot.y, w: branch.r1Slot.w, h: branch.r1Slot.h });
    });
    worldR2Slots.forEach((slot) => {
      hitRects.push({ type: "world-r2", index: slot.index, x: slot.x, y: slot.y, w: slot.w, h: slot.h });
    });
    worldSlots.forEach((slot) => {
      slot.sockets.forEach((socket) => {
        hitRects.push({
          type: "world-r1",
          slotKey: slot.key,
          slotIndex: socket.index,
          x: socket.x,
          y: socket.y,
          w: socket.w,
          h: socket.h
        });
      });
    });
    const inventoryRect = { x: rightX, y: columnTop, w: rightW, h: prgRect.h };
    const pickerBandY = prgR2Rect.y;
    const pickerBandH = worldR2Rect.y + worldR2Rect.h - prgR2Rect.y;
    const pickerSplitGap = 12;
    const minAssignW = 4 * (SUB_META_CARD_W + SUB_META_CARD_GAP_X) - SUB_META_CARD_GAP_X;
    const minForgeW = 7 * (SUB_META_CARD_W + SUB_META_CARD_GAP_X) - SUB_META_CARD_GAP_X;
    let assignPanelW = Math.max(minAssignW, Math.floor(rightW * 0.35));
    let forgePanelW = rightW - assignPanelW - pickerSplitGap;
    if (forgePanelW < minForgeW) {
      forgePanelW = minForgeW;
      assignPanelW = rightW - forgePanelW - pickerSplitGap;
    }
    if (assignPanelW < minAssignW) {
      assignPanelW = minAssignW;
      forgePanelW = rightW - assignPanelW - pickerSplitGap;
    }
    const pickerRect = { x: rightX, y: pickerBandY, w: assignPanelW, h: pickerBandH };
    const pickerAssignRect = {
      x: pickerRect.x + pickerInset,
      y: pickerRect.y + pickerInset,
      w: pickerRect.w - pickerInset * 2,
      h: pickerRect.h - pickerInset * 2
    };
    const pickerForgeFrameRect = {
      x: pickerRect.x + pickerRect.w + pickerSplitGap,
      y: pickerBandY,
      w: forgePanelW,
      h: pickerBandH
    };
    const pickerForgeRect = {
      x: pickerForgeFrameRect.x + pickerInset,
      y: pickerForgeFrameRect.y + pickerInset,
      w: pickerForgeFrameRect.w - pickerInset * 2,
      h: pickerForgeFrameRect.h - pickerInset * 2
    };
    const inventoryInset = 8;
    const inventoryInnerRect = {
      x: inventoryRect.x + inventoryInset,
      y: inventoryRect.y + inventoryInset,
      w: inventoryRect.w - inventoryInset * 2,
      h: inventoryRect.h - inventoryInset * 2
    };
    const cardInfoRect = {
      x: rightX,
      y: worldRect.y,
      w: rightW,
      h: worldRect.h
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
    const prgGroupRect = {
      x: prgRect.x,
      y: prgRect.y,
      w: prgRect.w,
      h: prgR2Rect.y + prgR2Rect.h - prgRect.y
    };
    const worldGroupRect = {
      x: worldR2Rect.x,
      y: worldR2Rect.y,
      w: worldR2Rect.w,
      h: worldRect.y + worldRect.h - worldR2Rect.y
    };
    return {
      panel: { x: panelX, y: panelY, w: panelW, h: panelH },
      pad,
      headerY: panelY + pad + 12,
      prgGroupRect,
      prgRect,
      prgBranches,
      prgR2Slots,
      worldGroupRect,
      worldRect,
      worldSlots,
      worldR2Rect,
      worldR2Slots,
      hitRects,
      inventoryRect,
      inventoryInnerRect,
      pickerRect,
      pickerAssignRect,
      pickerForgeFrameRect,
      pickerForgeRect,
      cardInfoRect,
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
      prgGroupRect,
      prgRect,
      prgBranches,
      prgR2Slots,
      worldGroupRect,
      worldRect,
      worldSlots,
      worldR2Rect,
      worldR2Slots,
      inventoryRect,
      inventoryInnerRect,
      pickerRect,
      pickerAssignRect,
      pickerForgeFrameRect,
      pickerForgeRect,
      cardInfoRect,
      assignButton,
      infoBackButton,
      closeButton
    } = layout;
    const rpValue = Math.max(0, Math.floor(World.score || 0));
    const selectedSlotKey = state.subMeta.selectedSlotKey;
    const selectedSlotIndex = state.subMeta.selectedSlotIndex;
    const selectedPrgSlotType = state.subMeta.selectedPrgSlotType;
    const selectedPrgBranchKey = state.subMeta.selectedPrgBranchKey;
    const selectedPrgBindingIndex = state.subMeta.selectedPrgBindingIndex;
    const selectedWorldSlotType = state.subMeta.selectedWorldSlotType;
    const selectedWorldBindingIndex = state.subMeta.selectedWorldBindingIndex;
    const selectedCardKey = state.subMeta.selectedCardKey;
    const selectedCard = getSubMetaCardByKey(selectedCardKey);
    const selectedPrgCard = getPrgCardByKey(selectedCardKey);
    const worldState = ensureSubMetaWorld(World);
    const selectedSlotAssignment = selectedSlotKey ? worldState?.slots?.[selectedSlotKey]?.cards?.[selectedSlotIndex] : null;
    const selectedForge = getSubMetaForgeByKey(World, state.subMeta.selectedForge?.key);
    const activeCard = selectedCard || getSubMetaCardFromAssignment(selectedSlotKey, selectedSlotAssignment);
    const activePrgCard = selectedPrgCard;
    const hasEnoughAssignRp = rpValue >= SUB_META_ASSIGN_COST;
    const forgeRpCost = selectedForge?.costRp || 0;
    const hasEnoughForgeRp = rpValue >= forgeRpCost;
    const prgState = ensureSubMetaPrg(World);
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
    const rootFrameDrawn = drawSubMetaRootFrameWithComposer(ctx, layout);
    if (!rootFrameDrawn) {
      // TODO(FrameComposer): keep this readable fallback until modular root frame assets are ready.
      drawManifestSvg(ctx, "submeta.frame.panel.ritual_gate_01", panel.x, panel.y, panel.w, panel.h, 0.9);
    }
    drawManifestSvg(ctx, "submeta.line.separator.altar_scale_01", panel.x + 12, headerY + 8, panel.w - 24, 14, 0.8);
    drawPrgFrameRuntimeProbe(ctx, prgRect);

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
    ctx.strokeRect(prgGroupRect.x, prgGroupRect.y, prgGroupRect.w, prgGroupRect.h);
    ctx.strokeRect(worldGroupRect.x, worldGroupRect.y, worldGroupRect.w, worldGroupRect.h);
    ctx.strokeRect(prgRect.x, prgRect.y, prgRect.w, prgRect.h);
    ctx.strokeRect(worldRect.x, worldRect.y, worldRect.w, worldRect.h);
    ctx.strokeRect(worldR2Rect.x, worldR2Rect.y, worldR2Rect.w, worldR2Rect.h);
    ctx.strokeRect(inventoryRect.x, inventoryRect.y, inventoryRect.w, inventoryRect.h);
    ctx.strokeRect(pickerRect.x, pickerRect.y, pickerRect.w, pickerRect.h);
    ctx.strokeRect(pickerForgeFrameRect.x, pickerForgeFrameRect.y, pickerForgeFrameRect.w, pickerForgeFrameRect.h);
    ctx.strokeRect(cardInfoRect.x, cardInfoRect.y, cardInfoRect.w, cardInfoRect.h);
    ctx.restore();

    const activeBindingIndex = prgState.bindings.findIndex((binding) => binding?.active);
    const activeBindingPair = SUB_META_PRG_BINDINGS[activeBindingIndex] || null;
    const activeBranchKeys = new Set(activeBindingPair ? [activeBindingPair.from, activeBindingPair.to] : []);
    prgBranches.forEach((branch) => {
      const branchState = prgState.branches?.[branch.key];
      const branchColor = PACK01_COLOR_HEX[branch.color] || "#FFFFFF";
      const isActiveBranch = activeBranchKeys.has(branch.key);
      const isSelectedBranch = selectedPrgSlotType === "r1" && selectedPrgBranchKey === branch.key;
      const isTabActive = prgState.activeTab === branch.key;
      if (isActiveBranch || isTabActive) {
        ctx.save();
        ctx.globalAlpha = isActiveBranch ? 0.12 : 0.06;
        ctx.fillStyle = branchColor;
        ctx.fillRect(branch.column.x, branch.column.y, branch.column.w, branch.column.h);
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = branchColor;
      ctx.lineWidth = isSelectedBranch ? 2 : 1;
      ctx.globalAlpha = isSelectedBranch ? 0.95 : (isActiveBranch ? 0.85 : 0.45);
      ctx.strokeRect(branch.r1Slot.x, branch.r1Slot.y, branch.r1Slot.w, branch.r1Slot.h);
      ctx.restore();
      const r1Card = branchState?.r1CardId ? getPrgCardByKey(branchState.r1CardId) : null;
      if (r1Card) {
        const cardX = branch.r1Slot.x + Math.floor((branch.r1Slot.w - SUB_META_CARD_W) / 2);
        const cardY = branch.r1Slot.y + Math.floor((branch.r1Slot.h - SUB_META_CARD_H) / 2);
        renderMetaCard(ctx, cardX, cardY, {
          type: "R1",
          tier: r1Card.tier,
          colors: r1Card.colors,
          count: 0
        }, { showCount: false });
      } else {
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(branch.r1Slot.x + 2, branch.r1Slot.y + 2, branch.r1Slot.w - 4, branch.r1Slot.h - 4);
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.strokeRect(branch.odbSlot.x, branch.odbSlot.y, branch.odbSlot.w, branch.odbSlot.h);
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(branch.odbSlot.x + 2, branch.odbSlot.y + 2, branch.odbSlot.w - 4, branch.odbSlot.h - 4);
      ctx.restore();
    });

    prgR2Slots.forEach((slot) => {
      const binding = prgState.bindings?.[slot.index];
      const isSelectedBinding = selectedPrgSlotType === "r2" && selectedPrgBindingIndex === slot.index;
      const isActiveBinding = Boolean(binding?.active);
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
      ctx.strokeStyle = isActiveBinding ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)";
      ctx.lineWidth = isActiveBinding ? 2 : 1;
      ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
      if (isSelectedBinding) {
        ctx.strokeStyle = "rgba(120,200,255,0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(slot.x - 2, slot.y - 2, slot.w + 4, slot.h + 4);
      }
      ctx.restore();
      const bindingCard = binding?.r2CardId ? getPrgCardByKey(binding.r2CardId) : null;
      if (bindingCard) {
        const cardX = slot.x + Math.floor((slot.w - SUB_META_CARD_W) / 2);
        const cardY = slot.y + Math.floor((slot.h - SUB_META_CARD_H) / 2);
        renderMetaCard(ctx, cardX, cardY, {
          type: "R2",
          tier: bindingCard.tier,
          colors: bindingCard.colors,
          count: 0
        }, { showCount: false });
      }
    });

    const activeWorldBindingIndex = worldState.bindings.findIndex((binding) => binding?.active);
    const activeWorldBindingPair = SUB_META_WORLD_BINDINGS[activeWorldBindingIndex] || null;
    const activeWorldKeys = new Set(activeWorldBindingPair ? [activeWorldBindingPair.from, activeWorldBindingPair.to] : []);
    worldSlots.forEach((slot) => {
      const entry = worldState.slots?.[slot.key];
      const slotColorKey = SUB_META_SLOT_COLORS[slot.key];
      const slotColorHex = PACK01_COLOR_HEX[slotColorKey] || "#FFFFFF";
      const isSelectedCategory = selectedWorldSlotType === "r1" && selectedSlotKey === slot.key;
      const isActiveCategory = activeWorldKeys.has(slot.key);
      if (isActiveCategory) {
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = slotColorHex;
        ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
        ctx.restore();
      }
      ctx.save();
      ctx.strokeStyle = slotColorHex;
      ctx.globalAlpha = isSelectedCategory ? 0.9 : 0.4;
      ctx.lineWidth = isSelectedCategory ? 2 : 1;
      ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
      ctx.fillStyle = slotColorHex;
      ctx.globalAlpha = 0.75;
      ctx.font = "11px system-ui";
      ctx.fillText(slot.label.toUpperCase(), slot.x + 8, slot.y + 14);
      const glyphName = `submeta.glyph.${slot.key}_01`;
      drawManifestSvg(ctx, glyphName, slot.x + slot.w - 22, slot.y + 4, 16, 16, 0.95);
      ctx.restore();
      slot.sockets.forEach((socket) => {
        const assignment = entry?.cards?.[socket.index] || null;
        const isLocked = socket.index === 2 && !entry?.dsUnlocked;
        const isSelectedSocket = selectedWorldSlotType === "r1"
          && selectedSlotKey === slot.key
          && selectedSlotIndex === socket.index;
        ctx.save();
        ctx.fillStyle = isLocked ? "rgba(40,40,40,0.85)" : "rgba(255,255,255,0.08)";
        ctx.fillRect(socket.x, socket.y, socket.w, socket.h);
        ctx.strokeStyle = isSelectedSocket ? "rgba(120,200,255,0.9)" : "rgba(255,255,255,0.35)";
        ctx.lineWidth = isSelectedSocket ? 2 : 1;
        ctx.strokeRect(socket.x, socket.y, socket.w, socket.h);
        const frameLogicalName = socket.index === 2
          ? "submeta.frame.card.ds_ether_plus_01"
          : "submeta.frame.card.r1_ritual_red_01";
        drawManifestSvg(ctx, frameLogicalName, socket.x, socket.y, socket.w, socket.h, 0.35);
        if (isLocked) {
          const lockW = 10;
          const lockH = 8;
          const lockX = socket.x + socket.w / 2 - lockW / 2;
          const lockY = socket.y + socket.h / 2 - lockH / 2 + 2;
          ctx.strokeStyle = "rgba(255,255,255,0.55)";
          ctx.lineWidth = 1;
          ctx.strokeRect(lockX, lockY, lockW, lockH);
          ctx.beginPath();
          ctx.arc(lockX + lockW / 2, lockY, lockW / 2.2, Math.PI, 0);
          ctx.stroke();
        }
        ctx.restore();
        if (!assignment && !isLocked) {
          ctx.save();
          ctx.globalAlpha = 0.18;
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillRect(socket.x + 2, socket.y + 2, socket.w - 4, socket.h - 4);
          ctx.restore();
        }
        if (assignment) {
          const cardX = socket.x + Math.floor((socket.w - SUB_META_CARD_W) / 2);
          const cardY = socket.y + Math.floor((socket.h - SUB_META_CARD_H) / 2);
          renderMetaCard(ctx, cardX, cardY, {
            type: "R1",
            tier: assignment.tier,
            colors: [assignment.color],
            count: 0
          }, { showCount: false });
          if (state.subMeta.showRemoveForSlotKey === slot.key
            && state.subMeta.showRemoveForSlotIndex === socket.index) {
            const removeW = 12;
            const removeH = 12;
            const removeX = socket.x + socket.w - removeW - 4;
            const removeY = socket.y + 4;
            ctx.save();
            ctx.globalAlpha = hasEnoughAssignRp ? 0.9 : 0.35;
            ctx.fillStyle = "rgba(255,80,80,0.2)";
            ctx.fillRect(removeX, removeY, removeW, removeH);
            ctx.strokeStyle = "rgba(255,120,120,0.8)";
            ctx.strokeRect(removeX, removeY, removeW, removeH);
            ctx.fillStyle = "rgba(255,180,180,0.95)";
            ctx.fillText("-", removeX + 3, removeY + 10);
            ctx.restore();
          }
        }
      });
    });

    worldR2Slots.forEach((slot) => {
      const binding = worldState.bindings?.[slot.index];
      const isSelectedBinding = selectedWorldSlotType === "r2" && selectedWorldBindingIndex === slot.index;
      const isActiveBinding = Boolean(binding?.active);
      ctx.save();
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);
      ctx.strokeStyle = isActiveBinding ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)";
      ctx.lineWidth = isActiveBinding ? 2 : 1;
      ctx.strokeRect(slot.x, slot.y, slot.w, slot.h);
      if (isSelectedBinding) {
        ctx.strokeStyle = "rgba(120,200,255,0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(slot.x - 2, slot.y - 2, slot.w + 4, slot.h + 4);
      }
      ctx.restore();
      const bindingCard = binding?.r2CardId ? getPrgCardByKey(binding.r2CardId) : null;
      if (bindingCard) {
        const cardX = slot.x + Math.floor((slot.w - SUB_META_CARD_W) / 2);
        const cardY = slot.y + Math.floor((slot.h - SUB_META_CARD_H) / 2);
        renderMetaCard(ctx, cardX, cardY, {
          type: "R2",
          tier: bindingCard.tier,
          colors: bindingCard.colors,
          count: 0
        }, { showCount: false });
      }
    });

    const inventoryEntries = getSubMetaInventoryEntries(World);
    const inventoryGrid = getSubMetaCardGrid(inventoryInnerRect);
    const firstTimerRectByColor = {};
    inventoryEntries.forEach((entry, index) => {
      const row = Math.floor(index / inventoryGrid.cols);
      if (row >= inventoryGrid.rows) return;
      const rect = getSubMetaCardRect(inventoryInnerRect, inventoryGrid, index);
      renderMetaCard(ctx, rect.x, rect.y, {
        type: entry.kind,
        tier: entry.tier,
        colors: entry.colors,
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

    const hasWorldSlotSelection = selectedWorldSlotType === "r1"
      && selectedSlotKey
      && Number.isInteger(selectedSlotIndex);
    const hasWorldBindingSelection = selectedWorldSlotType === "r2"
      && Number.isInteger(selectedWorldBindingIndex);
    if (hasWorldSlotSelection || hasWorldBindingSelection || selectedPrgSlotType) {
      const available = hasWorldSlotSelection
        ? getWorldAvailableCards(World, selectedSlotKey, selectedSlotIndex, worldState)
        : (hasWorldBindingSelection
          ? getWorldBindingAvailableCards(World, selectedWorldBindingIndex)
          : getPrgAvailableCards(World, {
            type: selectedPrgSlotType,
            branchKey: selectedPrgBranchKey,
            bindingIndex: selectedPrgBindingIndex
          }));
      const assignGrid = getSubMetaCardGrid(pickerAssignRect);
      available.forEach((card, index) => {
        const row = Math.floor(index / assignGrid.cols);
        if (row >= assignGrid.rows) return;
        const rect = getSubMetaCardRect(pickerAssignRect, assignGrid, index);
        const count = card.kind === "R2"
          ? getCardCount(World, "R2", card.colors, card.tier, { availableOnly: true })
          : (card.kind === "DS"
            ? getCardCount(World, "DS", card.colors, card.tier, { availableOnly: true })
            : getCardCount(World, "R1", [card.color], card.tier, { availableOnly: true }));
        renderMetaCard(ctx, rect.x, rect.y, {
          type: card.kind || "R1",
          tier: card.tier,
          colors: card.colors || [card.color],
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
      renderMetaCard(ctx, rect.x, rect.y, {
        type: forge.kind,
        tier: forge.toTier,
        colors: forge.colors,
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
      const tierLabel = normalizeSubMetaTier(selectedForge.toTier);
      const typeLabel = selectedForge.kind || "R1";
      const colorLabel = selectedForge.colors.length === 2
        ? `${PACK01_COLOR_LABEL[selectedForge.colors[0]] || selectedForge.colors[0]} + ${PACK01_COLOR_LABEL[selectedForge.colors[1]] || selectedForge.colors[1]}`
        : `${PACK01_COLOR_LABEL[selectedForge.colors[0]] || selectedForge.colors[0]}`;
      const fromTierLabel = normalizeSubMetaTier(selectedForge.fromTier);
      const needed = selectedForge.requiredCount || 0;
      const available = getForgeAvailableCount(World, selectedForge.baseId, selectedForge.fromTier);
      const canCraft = hasEnoughForgeRp && available >= needed;
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
      ctx.fillText(`Składniki: ${needed} × ${fromTierLabel}`, cardInfoRect.x + 12, cardInfoRect.y + 94);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(`Magazyn ${fromTierLabel}: ${available}`, cardInfoRect.x + 12, cardInfoRect.y + 110);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillText(`Zamienia ${fromTierLabel} w wyższy tier.`, cardInfoRect.x + 12, cardInfoRect.y + 128);
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
    } else if (activeCard && selectedSlotKey && Number.isInteger(selectedSlotIndex)) {
      const tierLabel = normalizeSubMetaTier(activeCard.tier);
      const showEffects = selectedSlotIndex === 0 && activeCard.kind !== "DS";
      const effectLines = showEffects ? getSubMetaEffectLines(selectedSlotKey, tierLabel) : [];
      const effectHeader = showEffects
        ? `Efekt w slocie ${getSubMetaSlotLabel(selectedSlotKey).toUpperCase()}`
        : "Slot dodatkowy";
      const cardTitle = getSubMetaCardTitle(activeCard);
      const haikuLines = showEffects ? getSubMetaHaikuLines(activeCard) : [];
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "15px system-ui";
      ctx.fillText(cardTitle, cardInfoRect.x + 12, cardInfoRect.y + 22);
      ctx.font = "12px system-ui";
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText(effectHeader, cardInfoRect.x + 12, cardInfoRect.y + 42);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.fillText(`${activeCard.kind === "DS" ? "DS" : "R1"} ${tierLabel}`, cardInfoRect.x + 12, cardInfoRect.y + 58);
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      if (showEffects) {
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
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.fillText("Brak efektu (slot dodatkowy).", cardInfoRect.x + 12, cardInfoRect.y + 80);
      }
    } else {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "12px system-ui";
      ctx.fillText("Kliknij kartę, aby zobaczyć opis.", cardInfoRect.x + 12, cardInfoRect.y + 24);
    }

    if (!selectedForge) {
      const worldEntry = selectedSlotKey ? worldState.slots?.[selectedSlotKey] : null;
      const worldSlotOccupied = selectedSlotKey && Number.isInteger(selectedSlotIndex)
        ? Boolean(worldEntry?.cards?.[selectedSlotIndex])
        : false;
      const worldSlotLocked = selectedSlotKey && Number.isInteger(selectedSlotIndex)
        ? (selectedSlotIndex === 2 && !worldEntry?.dsUnlocked)
        : false;
      const prgBranch = selectedPrgBranchKey ? prgState.branches?.[selectedPrgBranchKey] : null;
      const prgBinding = Number.isInteger(selectedPrgBindingIndex) ? prgState.bindings?.[selectedPrgBindingIndex] : null;
      const prgSlotOccupied = selectedPrgSlotType === "r1"
        ? Boolean(prgBranch?.r1CardId)
        : Boolean(prgBinding?.r2CardId);
      const worldBinding = Number.isInteger(selectedWorldBindingIndex)
        ? worldState.bindings?.[selectedWorldBindingIndex]
        : null;
      const worldBindingOccupied = Boolean(worldBinding?.r2CardId);
      const canUnlockWorld = Boolean(selectedSlotKey
        && Number.isInteger(selectedSlotIndex)
        && worldSlotLocked
        && activeCard?.kind === "DS"
        && hasEnoughAssignRp);
      const canAssignWorld = Boolean(selectedSlotKey
        && Number.isInteger(selectedSlotIndex)
        && activeCard
        && activeCard.kind !== "DS"
        && hasEnoughAssignRp
        && !worldSlotOccupied
        && !worldSlotLocked);
      const canAssignPrg = Boolean(selectedPrgSlotType && activePrgCard && hasEnoughAssignRp && !prgSlotOccupied);
      const canAssignWorldBinding = Boolean(selectedWorldSlotType === "r2"
        && activePrgCard
        && hasEnoughAssignRp
        && !worldBindingOccupied);
      const canAssign = canAssignWorld || canAssignPrg || canUnlockWorld || canAssignWorldBinding;
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
      hitRects,
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
    const prgState = ensureSubMetaPrg(World);
    const worldState = ensureSubMetaWorld(World);

    if (mx >= closeButton.x && mx <= closeButton.x + closeButton.w
      && my >= closeButton.y && my <= closeButton.y + closeButton.h) {
      closeSubMeta(World);
      return true;
    }

    const selectedForge = getSubMetaForgeByKey(World, state.subMeta.selectedForge?.key);
    const activeCard = getSubMetaCardByKey(state.subMeta.selectedCardKey)
      || getSubMetaCardFromAssignment(
        state.subMeta.selectedSlotKey,
        worldState?.slots?.[state.subMeta.selectedSlotKey]?.cards?.[state.subMeta.selectedSlotIndex]
      );
    const activePrgCard = getPrgCardByKey(state.subMeta.selectedCardKey);
    const slotOccupied = state.subMeta.selectedSlotKey
      && Number.isInteger(state.subMeta.selectedSlotIndex)
      && worldState?.slots?.[state.subMeta.selectedSlotKey]?.cards?.[state.subMeta.selectedSlotIndex];
    const selectedPrgSlotType = state.subMeta.selectedPrgSlotType;
    const selectedPrgBranchKey = state.subMeta.selectedPrgBranchKey;
    const selectedPrgBindingIndex = state.subMeta.selectedPrgBindingIndex;
    const selectedWorldSlotType = state.subMeta.selectedWorldSlotType;
    const selectedWorldBindingIndex = state.subMeta.selectedWorldBindingIndex;
    if (mx >= assignButton.x && mx <= assignButton.x + assignButton.w
      && my >= assignButton.y && my <= assignButton.y + assignButton.h) {
      if (selectedForge) {
        craftSubMetaForge(World, selectedForge);
        return true;
      }
      if (selectedWorldSlotType === "r1"
        && state.subMeta.selectedSlotKey
        && Number.isInteger(state.subMeta.selectedSlotIndex)) {
        const worldEntry = worldState?.slots?.[state.subMeta.selectedSlotKey];
        const isLocked = state.subMeta.selectedSlotIndex === 2 && !worldEntry?.dsUnlocked;
        if (isLocked) {
          if (!activeCard || activeCard.kind !== "DS" || !hasEnoughAssignRp) return true;
          unlockWorldDsSlot(World, state.subMeta.selectedSlotKey, activeCard);
          state.subMeta.selectedCardKey = null;
          return true;
        }
        const canAssign = Boolean(activeCard && hasEnoughAssignRp && !slotOccupied);
        if (!canAssign) return true;
        assignWorldSlotCard(World, state.subMeta.selectedSlotKey, state.subMeta.selectedSlotIndex, {
          kind: "R1",
          color: activeCard.color,
          tier: normalizeSubMetaTier(activeCard.tier)
        });
        state.subMeta.showRemoveForSlotKey = null;
        state.subMeta.showRemoveForSlotIndex = null;
        return true;
      }
      if (selectedPrgSlotType === "r1" && selectedPrgBranchKey) {
        const branch = prgState.branches?.[selectedPrgBranchKey];
        if (!branch || branch.r1CardId || !activePrgCard || !hasEnoughAssignRp) return true;
        assignPrgBranchCard(World, selectedPrgBranchKey, activePrgCard);
        return true;
      }
      if (selectedPrgSlotType === "r2" && Number.isInteger(selectedPrgBindingIndex)) {
        const binding = prgState.bindings?.[selectedPrgBindingIndex];
        if (!binding || binding.r2CardId || !activePrgCard || !hasEnoughAssignRp) return true;
        assignPrgBindingCard(World, selectedPrgBindingIndex, activePrgCard);
        return true;
      }
      if (selectedWorldSlotType === "r2" && Number.isInteger(selectedWorldBindingIndex)) {
        const binding = worldState.bindings?.[selectedWorldBindingIndex];
        if (!binding || binding.r2CardId || !activePrgCard || !hasEnoughAssignRp) return true;
        assignWorldBindingCard(World, selectedWorldBindingIndex, activePrgCard);
        return true;
      }
      return true;
    }
    if (selectedForge
      && mx >= infoBackButton.x && mx <= infoBackButton.x + infoBackButton.w
      && my >= infoBackButton.y && my <= infoBackButton.y + infoBackButton.h) {
      state.subMeta.selectedForge = null;
      return true;
    }

    if (mx >= panel.x && mx <= panel.x + panel.w && my >= panel.y && my <= panel.y + panel.h) {
      const hit = hitRects.find((rect) => mx >= rect.x && mx <= rect.x + rect.w
        && my >= rect.y && my <= rect.y + rect.h);
      if (hit) {
        if (hit.type === "prg-r2") {
          const binding = prgState.bindings?.[hit.index];
          state.subMeta.selectedPrgSlotType = "r2";
          state.subMeta.selectedPrgBindingIndex = hit.index;
          state.subMeta.selectedPrgBranchKey = null;
          state.subMeta.selectedSlotKey = null;
          state.subMeta.selectedSlotIndex = null;
          state.subMeta.selectedForge = null;
          state.subMeta.showRemoveForSlotKey = null;
          state.subMeta.showRemoveForSlotIndex = null;
          state.subMeta.selectedWorldSlotType = null;
          state.subMeta.selectedWorldBindingIndex = null;
          state.subMeta.selectedCardKey = binding?.r2CardId || null;
          toggleActiveBinding(prgState.bindings, hit.index);
          return true;
        }
        if (hit.type === "prg-r1") {
          const branchState = prgState.branches?.[hit.branchKey];
          state.subMeta.selectedPrgSlotType = "r1";
          state.subMeta.selectedPrgBranchKey = hit.branchKey;
          state.subMeta.selectedPrgBindingIndex = null;
          state.subMeta.selectedSlotKey = null;
          state.subMeta.selectedSlotIndex = null;
          state.subMeta.selectedForge = null;
          state.subMeta.showRemoveForSlotKey = null;
          state.subMeta.showRemoveForSlotIndex = null;
          state.subMeta.selectedWorldSlotType = null;
          state.subMeta.selectedWorldBindingIndex = null;
          state.subMeta.selectedCardKey = branchState?.r1CardId || null;
          prgState.activeTab = hit.branchKey;
          return true;
        }
        if (hit.type === "world-r2") {
          const binding = worldState.bindings?.[hit.index];
          state.subMeta.selectedWorldSlotType = "r2";
          state.subMeta.selectedWorldBindingIndex = hit.index;
          state.subMeta.selectedSlotKey = null;
          state.subMeta.selectedSlotIndex = null;
          state.subMeta.selectedForge = null;
          state.subMeta.showRemoveForSlotKey = null;
          state.subMeta.showRemoveForSlotIndex = null;
          state.subMeta.selectedPrgSlotType = null;
          state.subMeta.selectedPrgBranchKey = null;
          state.subMeta.selectedPrgBindingIndex = null;
          state.subMeta.selectedCardKey = binding?.r2CardId || null;
          toggleActiveBinding(worldState.bindings, hit.index);
          return true;
        }
        if (hit.type === "world-r1") {
          const assignment = worldState.slots?.[hit.slotKey]?.cards?.[hit.slotIndex] || null;
          state.subMeta.selectedWorldSlotType = "r1";
          state.subMeta.selectedSlotKey = hit.slotKey;
          state.subMeta.selectedSlotIndex = hit.slotIndex;
          state.subMeta.selectedWorldBindingIndex = null;
          state.subMeta.selectedPrgSlotType = null;
          state.subMeta.selectedPrgBranchKey = null;
          state.subMeta.selectedPrgBindingIndex = null;
          state.subMeta.selectedForge = null;
          state.subMeta.showRemoveForSlotKey = null;
          state.subMeta.showRemoveForSlotIndex = null;
          const assignmentCard = getSubMetaCardFromAssignment(hit.slotKey, assignment);
          state.subMeta.selectedCardKey = assignmentCard?.key || null;
          if (assignment) {
            state.subMeta.showRemoveForSlotKey = hit.slotKey;
            state.subMeta.showRemoveForSlotIndex = hit.slotIndex;
            const removeW = 12;
            const removeH = 12;
            const removeX = hit.x + hit.w - removeW - 4;
            const removeY = hit.y + 4;
            if (mx >= removeX && mx <= removeX + removeW && my >= removeY && my <= removeY + removeH) {
              if (!hasEnoughAssignRp) return true;
              removeWorldSlotCard(World, hit.slotKey, hit.slotIndex);
              state.subMeta.showRemoveForSlotKey = null;
              state.subMeta.showRemoveForSlotIndex = null;
              state.subMeta.selectedCardKey = null;
            }
          }
          return true;
        }
      }

      const hasWorldSlotSelection = state.subMeta.selectedWorldSlotType === "r1"
        && state.subMeta.selectedSlotKey
        && Number.isInteger(state.subMeta.selectedSlotIndex);
      const hasWorldBindingSelection = state.subMeta.selectedWorldSlotType === "r2"
        && Number.isInteger(state.subMeta.selectedWorldBindingIndex);
      if (hasWorldSlotSelection || hasWorldBindingSelection || state.subMeta.selectedPrgSlotType) {
        const available = hasWorldSlotSelection
          ? getWorldAvailableCards(World, state.subMeta.selectedSlotKey, state.subMeta.selectedSlotIndex, worldState)
          : (hasWorldBindingSelection
            ? getWorldBindingAvailableCards(World, state.subMeta.selectedWorldBindingIndex)
            : getPrgAvailableCards(World, {
              type: state.subMeta.selectedPrgSlotType,
              branchKey: state.subMeta.selectedPrgBranchKey,
              bindingIndex: state.subMeta.selectedPrgBindingIndex
            }));
        const assignGrid = getSubMetaCardGrid(pickerAssignRect);
        for (let i = 0; i < available.length; i++) {
          const row = Math.floor(i / assignGrid.cols);
          if (row >= assignGrid.rows) break;
          const card = available[i];
          const rect = getSubMetaCardRect(pickerAssignRect, assignGrid, i);
          if (mx >= rect.x && mx <= rect.x + rect.w && my >= rect.y && my <= rect.y + rect.h) {
            state.subMeta.selectedCardKey = card.key;
            state.subMeta.showRemoveForSlotKey = null;
            state.subMeta.showRemoveForSlotIndex = null;
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
          state.subMeta.showRemoveForSlotIndex = null;
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
      if (window.HC?.SubMetaPngLayout?.isActive?.()) return true;
      return handleSubMetaPointerDown(mx, my, screenW, screenH);
    }

    if (state.sequenceOverlay && state.sequenceOverlay.visible) {
      const layout = getSequenceOverlayLayout(screenW);
      const inOverlay = mx >= layout.x && mx <= layout.x + layout.w
        && my >= layout.y && my <= layout.y + layout.h;
      const inLeft = mx >= layout.leftButton.x && mx <= layout.leftButton.x + layout.leftButton.w
        && my >= layout.leftButton.y && my <= layout.leftButton.y + layout.leftButton.h;
      const inRight = mx >= layout.rightButton.x && mx <= layout.rightButton.x + layout.rightButton.w
        && my >= layout.rightButton.y && my <= layout.rightButton.y + layout.rightButton.h;
      if (inLeft || inRight) {
        const overlay = state.sequenceOverlay;
        const level = Math.max(1, Math.min(4, Number(overlay.level || 1)));
        const colors = Array.isArray(overlay.colors) ? overlay.colors : [];
        const reason = inLeft ? "activate" : "cashout";
        if (inLeft) {
          const pendingCard = World?.pendingCard;
          const pendingColor = pendingCard?.colorA || (Array.isArray(pendingCard?.colors) ? pendingCard.colors[0] : null);
          const selectedColor = pendingColor || overlay.colorKey;
          const activated = activateSequenceR1(selectedColor);
          emitSequenceEvent("sequence.decision_window_closed", {
            reason,
            clickedSide: "left",
            selectedAction: `activate:R1:${selectedColor || "unknown"}`,
            resultingTrack: activated ? null : state.sequence.track || null,
            resultingStage: activated ? "IDLE" : state.sequence.stage || null,
            rewardPreview: null,
            rewardGranted: activated ? "R1_ACTIVATION" : null,
          }, { source: "CardEngine.handlePointerDown", snapshot: true });
          if (activated) {
            state.sequenceOverlay.visible = false;
          }
        } else if (inRight) {
          emitSequenceEvent("sequence.decision_window_closed", {
            reason,
            clickedSide: "right",
            selectedAction: `cashout:${getDecisionLabelForLevel(level, state.sequence.track)}`,
            resultingTrack: null,
            resultingStage: "IDLE",
            rewardPreview: Array.isArray(state.sequence.tempCards) ? state.sequence.tempCards.map((card) => card?.id).filter(Boolean) : [],
            rewardGranted: null,
          }, { source: "CardEngine.handlePointerDown", snapshot: true });
          cashOutSequence(level, colors);
        }
        return true;
      }
      if (inOverlay) return true;
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

    return false;
  }

  // DEAD_CODE_QUARANTINE
  // ---- HOOKS (Stage 1 placeholders) ----
  function onRunActivateR2(_payload = {}) {
    return false;
  }

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
    isColorR1Active,

    getTargetLibrary: () => state.targetLibrary.slice(),
    getTargetMeta: (id) => state.targetMeta.get(id) || null,

    resetForNewRun,
    offerCardById,
    update,
    render,
    handlePointerDown,
    closeSubMeta,
    onRunActivateR1,
    onRunActivateR2,
    onHitColor,
    seqSim,
    seqSimTests,
    seqProbeSimAAA,
    getTotalCardCount,
    recomputeTotalCards,
    resetCardPool,
    applyDebugCardPreset,
    onCardCollected,

    // Narrow bridge for the DOM SUB-META layer. Stage-one placeholder assignment
    // is exposed explicitly; crafting and legacy cost-based mutations remain private.
    subMetaView: Object.freeze({
      ensureCardsPool,
      getInventoryEntries: getSubMetaInventoryEntries,
      getWorldAvailableCards: (World, slotKey, slotIndex) =>
        getWorldAvailableCards(World, slotKey, slotIndex, ensureSubMetaWorld(World)),
      getWorldBindingAvailableCards,
      getPrgAvailableCards,
      assignPlaceholderCard,
      getPlaceholderAssignments,
      getForgeAvailableStacks,
      getCardByKey: (cardKey) => getSubMetaCardByKey(cardKey) || getPrgCardByKey(cardKey),
      getCardTitle: getSubMetaCardTitle,
      getEffectLines: getSubMetaEffectLines,
      getHaikuLines: getSubMetaHaikuLines,
    }),

    // Hooks for future systems
    onRitualTrigger,
    openResetCardHub,
  };
})();

if (typeof window !== "undefined") {
  // expose globally for boot + modules
  window.CardEngine = window.CardEngine || CardEngine;
  window.HC = window.HC || {};
  if (!window.HC.seqSim) window.HC.seqSim = CardEngine.seqSim || null;
  if (!window.HC.seqSimTests) window.HC.seqSimTests = CardEngine.seqSimTests || null;
  window.HC_SEQ_PROBE = window.HC_SEQ_PROBE || {};
  window.HC_SEQ_PROBE.simAAA = CardEngine.seqProbeSimAAA || null;
}
