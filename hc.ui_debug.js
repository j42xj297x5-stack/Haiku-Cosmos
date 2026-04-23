// HC UI/debug glue (extracted)
(function () {
  window.HC = window.HC || {};

  let fpsLabel = null;
  let btnRestart = null;
  let btnSubMeta = null;
  let scoreLabel = null;
  let topBar = null;
  let debugBadge = null;
  let startOverlay = null;
  let btnStartNormal = null;
  let btnStartDebug = null;
  let btnStartDebugSession = null;
  let btnDebugBack = null;
  let btnDebugResetDefaults = null;
  let debugConfigPanel = null;
  let fpsAcc = 0;
  let fpsFrames = 0;
  let initialized = false;
  let lastScore = null;

  function updateScoreLabel(World, force) {
    if (!scoreLabel || !World) return;
    if (force || World.score !== lastScore) {
      lastScore = World.score;
      scoreLabel.textContent = `RP: ${World.score}`;
    }
  }

  function getTotalCards(World) {
    const CardEngine = window.CardEngine;
    if (CardEngine && typeof CardEngine.getTotalCardCount === "function") {
      return CardEngine.getTotalCardCount(World);
    }
    if (Array.isArray(World?.cardsPool)) return World.cardsPool.length;
    return 0;
  }

  function addScore(points) {
    const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
    if (!World) return;
    World.score += points;
    updateScoreLabel(World, true);
  }

  window.addScore = addScore;

  function ensureScoreLabel() {
    if (!topBar) return null;
    const el = document.createElement("div");
    el.className = "pill";
    el.id = "scoreLabel";
    el.textContent = "RP: 0";
    topBar.appendChild(el);
    return el;
  }

  function sanitizeNonNegativeInt(value) {
    const n = Math.floor(Number(value));
    if (!Number.isFinite(n) || n < 0) return 0;
    return n;
  }

  function readOptionalThreshold(value) {
    const trimmed = String(value ?? "").trim();
    if (!trimmed) return null;
    const n = Math.floor(Number(trimmed));
    if (!Number.isFinite(n) || n < 0) return null;
    return n;
  }

  function getDebugDefaults() {
    if (window.HC?.createDebugConfig) {
      return window.HC.createDebugConfig("debug");
    }
    return {
      initialRP: 0,
      initialCards: {},
      initialWorldState: { asteroidCount: 0, rockyPlanetCount: 0, gasPlanetCount: 0, starCount: 0 },
      thresholdOverrides: { asteroidToPlanet: null, planetToStar: null },
    };
  }

  function applyDebugDefaultsToUi() {
    const defaults = getDebugDefaults();
    const setValue = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = String(v ?? "");
    };
    setValue("cfgInitialRP", defaults.initialRP || 0);
    const cards = defaults.initialCards || {};
    setValue("cfgCardR1RedDR", sanitizeNonNegativeInt(cards.R1_DR_RED || 0));
    setValue("cfgCardR1YellowDR", sanitizeNonNegativeInt(cards.R1_DR_YELLOW || 0));
    setValue("cfgCardR1GreenDR", sanitizeNonNegativeInt(cards.R1_DR_GREEN || 0));
    setValue("cfgCardR1BlueDR", sanitizeNonNegativeInt(cards.R1_DR_BLUE || 0));
    setValue("cfgCardDSRedDR", sanitizeNonNegativeInt(cards.DS_DR_RED || 0));
    setValue("cfgCardDSYellowDR", sanitizeNonNegativeInt(cards.DS_DR_YELLOW || 0));
    setValue("cfgCardDSGreenDR", sanitizeNonNegativeInt(cards.DS_DR_GREEN || 0));
    setValue("cfgCardDSBlueDR", sanitizeNonNegativeInt(cards.DS_DR_BLUE || 0));
    setValue("cfgCardR1RedSDR", sanitizeNonNegativeInt(cards.R1_SDR_RED || 0));
    setValue("cfgCardR1RedPDR", sanitizeNonNegativeInt(cards.R1_PDR_RED || 0));
    setValue("cfgCardR1YellowSDR", sanitizeNonNegativeInt(cards.R1_SDR_YELLOW || 0));
    setValue("cfgCardR1YellowPDR", sanitizeNonNegativeInt(cards.R1_PDR_YELLOW || 0));
    setValue("cfgCardR1GreenSDR", sanitizeNonNegativeInt(cards.R1_SDR_GREEN || 0));
    setValue("cfgCardR1GreenPDR", sanitizeNonNegativeInt(cards.R1_PDR_GREEN || 0));
    setValue("cfgCardR1BlueSDR", sanitizeNonNegativeInt(cards.R1_SDR_BLUE || 0));
    setValue("cfgCardR1BluePDR", sanitizeNonNegativeInt(cards.R1_PDR_BLUE || 0));
    const worldState = defaults.initialWorldState || {};
    setValue("cfgAsteroidCount", sanitizeNonNegativeInt(worldState.asteroidCount || 0));
    setValue("cfgRockyPlanetCount", sanitizeNonNegativeInt(worldState.rockyPlanetCount || 0));
    setValue("cfgGasPlanetCount", sanitizeNonNegativeInt(worldState.gasPlanetCount || 0));
    setValue("cfgStarCount", sanitizeNonNegativeInt(worldState.starCount || 0));
    const thresholds = defaults.thresholdOverrides || {};
    setValue("cfgThresholdAsteroidToPlanet", thresholds.asteroidToPlanet ?? "");
    setValue("cfgThresholdPlanetToStar", thresholds.planetToStar ?? "");
  }

  function buildDebugConfigFromUi() {
    const getInt = (id) => sanitizeNonNegativeInt(document.getElementById(id)?.value);
    const cards = {
      R1_DR_RED: getInt("cfgCardR1RedDR"),
      R1_DR_YELLOW: getInt("cfgCardR1YellowDR"),
      R1_DR_GREEN: getInt("cfgCardR1GreenDR"),
      R1_DR_BLUE: getInt("cfgCardR1BlueDR"),
      DS_DR_RED: getInt("cfgCardDSRedDR"),
      DS_DR_YELLOW: getInt("cfgCardDSYellowDR"),
      DS_DR_GREEN: getInt("cfgCardDSGreenDR"),
      DS_DR_BLUE: getInt("cfgCardDSBlueDR"),
      R1_SDR_RED: getInt("cfgCardR1RedSDR"),
      R1_PDR_RED: getInt("cfgCardR1RedPDR"),
      R1_SDR_YELLOW: getInt("cfgCardR1YellowSDR"),
      R1_PDR_YELLOW: getInt("cfgCardR1YellowPDR"),
      R1_SDR_GREEN: getInt("cfgCardR1GreenSDR"),
      R1_PDR_GREEN: getInt("cfgCardR1GreenPDR"),
      R1_SDR_BLUE: getInt("cfgCardR1BlueSDR"),
      R1_PDR_BLUE: getInt("cfgCardR1BluePDR"),
    };
    return {
      initialRP: getInt("cfgInitialRP"),
      initialCards: cards,
      initialWorldState: {
        asteroidCount: getInt("cfgAsteroidCount"),
        rockyPlanetCount: getInt("cfgRockyPlanetCount"),
        gasPlanetCount: getInt("cfgGasPlanetCount"),
        starCount: getInt("cfgStarCount"),
      },
      thresholdOverrides: {
        asteroidToPlanet: readOptionalThreshold(document.getElementById("cfgThresholdAsteroidToPlanet")?.value),
        planetToStar: readOptionalThreshold(document.getElementById("cfgThresholdPlanetToStar")?.value),
      },
    };
  }

  window.HC.UI = {
    init() {
      if (initialized) return;
      initialized = true;

      const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
      fpsLabel = document.getElementById("fpsLabel");
      btnRestart = document.getElementById("btnRestart");
      btnSubMeta = document.getElementById("btnSubMeta");
      topBar = document.getElementById("topBar");
      debugBadge = document.getElementById("debugBadge");
      startOverlay = document.getElementById("startOverlay");
      btnStartNormal = document.getElementById("btnStartNormal");
      btnStartDebug = document.getElementById("btnStartDebug");
      btnStartDebugSession = document.getElementById("btnStartDebugSession");
      btnDebugBack = document.getElementById("btnDebugBack");
      btnDebugResetDefaults = document.getElementById("btnDebugResetDefaults");
      debugConfigPanel = document.getElementById("debugConfigPanel");

      scoreLabel = ensureScoreLabel();

      if (World && World.r1HudPulse === undefined) {
        World.r1HudPulse = null;
      }

      if (btnRestart && window.resetWorld) {
        btnRestart.addEventListener("click", () => {
          if (window.HC?.Session?.restart) {
            window.HC.Session.restart();
          } else {
            window.resetWorld();
          }
          const refreshedWorld = (window.HC.getWorld && window.HC.getWorld()) || window.World;
          updateScoreLabel(refreshedWorld, true);
        });
      }
      if (btnSubMeta) {
        btnSubMeta.addEventListener("click", () => {
          const currentWorld = (window.HC.getWorld && window.HC.getWorld()) || window.World;
          if (!currentWorld || currentWorld.subMetaOpen) return;
          currentWorld.subMetaOpen = true;
          currentWorld.paused = true;
        });
      }
      if (btnStartNormal) {
        btnStartNormal.addEventListener("click", () => {
          if (window.HC?.Session?.start) window.HC.Session.start("normal");
          if (startOverlay) startOverlay.hidden = true;
        });
      }
      if (btnStartDebug) {
        btnStartDebug.addEventListener("click", () => {
          if (debugConfigPanel) debugConfigPanel.hidden = false;
        });
      }
      if (btnDebugBack) {
        btnDebugBack.addEventListener("click", () => {
          if (debugConfigPanel) debugConfigPanel.hidden = true;
        });
      }
      if (btnDebugResetDefaults) {
        btnDebugResetDefaults.addEventListener("click", () => applyDebugDefaultsToUi());
      }
      if (btnStartDebugSession) {
        btnStartDebugSession.addEventListener("click", () => {
          const config = buildDebugConfigFromUi();
          if (window.HC?.Session?.start) window.HC.Session.start("debug", config);
          if (startOverlay) startOverlay.hidden = true;
        });
      }
      applyDebugDefaultsToUi();
      updateScoreLabel(World, true);
    },
    applySessionMode(mode) {
      if (debugBadge) debugBadge.hidden = mode !== "debug";
    },
    update(dt, nowMs) {
      fpsAcc += dt;
      fpsFrames += 1;
      if (fpsAcc >= 0.5) {
        const fps = Math.round(fpsFrames / fpsAcc);
        if (fpsLabel) fpsLabel.textContent = `FPS: ${fps}`;
        fpsAcc = 0;
        fpsFrames = 0;
      }
      const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
      updateScoreLabel(World, false);
      const CE = window.CardEngine;
      const view = window.HC.getView && window.HC.getView();
      if (CE && typeof CE.render === "function" && view && window.ctx) {
        CE.render(window.ctx, view.w, view.h);
      }
    },
  };
})();
