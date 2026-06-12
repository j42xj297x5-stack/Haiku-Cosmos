// HC UI/debug glue (extracted)
(function () {
  window.HC = window.HC || {};

  let fpsLabel = null;
  let btnRestart = null;
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
  let runtimeDebugOverlay = null;
  let runtimeDebugOverlayBody = null;
  let runtimeDebugOverlayPanel = null;
  let btnDebugOverlayToggle = null;
  let runtimeOverlayCollapsed = false;
  let btnDebugSelectFolder = null;
  let btnDebugFinalizeSession = null;
  let btnDebugCopyPath = null;

  let btnExportEvidence = null;
  let btnMarkIssue = null;
  let debugSessionNote = null;
  let cfgScenarioPreset = null;
  let cfgScenarioLabel = null;
  let runtimeOverlayCompact = true;
  let runtimeOverlayTab = "session";
  let runtimeOverlayLastRenderMs = 0;
  let fpsAcc = 0;
  let fpsFrames = 0;
  let initialized = false;
  let lastScore = null;
  const lastDebugControlEventAt = new Map();
  let warnedMissingSubMetaPngLayout = false;
  let warnedMissingSubMetaPlaceholders = false;
  let warnedMissingSubMetaPanels = false;
  let warnedMissingHudTopLayout = false;
  let runtimeDebugSectionState = {};

  const DEBUG_UI_TEXT = Object.freeze({
    "common.back": "Back",
    "common.resetDefaults": "Reset to defaults",
    "start.startDebugSession": "Start Debug Session",
    "start.chooseMode": "Choose mode for this session.",
    "start.normalGame": "Normal Game",
    "start.debugMode": "Debug Mode",
    "cfg.scenario": "Scenario",
    "cfg.scenarioPreset": "Preset",
    "cfg.customScenarioLabel": "Custom label",
    "overlay.runtimeDebug": "Runtime Debug",
    "overlay.expand": "Expand",
    "overlay.compact": "Compact",
    "overlay.debugExpanded": "DEBUG ▾",
    "overlay.debugCollapsed": "DEBUG ▸",
    "overlay.exportEvidence": "Export evidence",
    "overlay.markIssue": "Mark issue",
    "overlay.notePlaceholder": "Session note (optional)",
    "overlay.section.session": "Session",
    "overlay.section.sequence": "Sequence",
    "overlay.section.worldThresholds": "World / Thresholds",
    "overlay.section.lastEvents": "Last events",
    "overlay.section.economy": "Economy / Cards",
    "overlay.section.tail": "Mini tail",
    "overlay.loggingOn": "on",
    "overlay.loggingOff": "off",
    "overlay.na": "—",
  });

  function t(key) {
    return DEBUG_UI_TEXT[key] || key;
  }

  window.HC.DebugI18n = {
    t,
    keys: DEBUG_UI_TEXT,
  };

  function updateScoreLabel(World, force) {
    if (!scoreLabel || !World) return;
    if (force || World.score !== lastScore) {
      lastScore = World.score;
      const scoreText = String(Math.max(0, Math.floor(Number(World.score || 0))));
      window.HC?.HudTopLayout?.setRpValue?.(scoreText);
      if (!window.HC?.HudTopLayout?.setRpValue) scoreLabel.textContent = scoreText;
      scoreLabel.setAttribute("aria-label", `Punkty Rezonansu: ${scoreText}`);
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
    const existing = document.getElementById("scoreLabel");
    const el = existing || document.createElement("div");
    el.id = "scoreLabel";
    el.className = "";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.textContent = "0";
    if (!existing) topBar.appendChild(el);
    return el;
  }

  function applyHudSkin() {
    // The top HUD decoration is owned by HC.HudTopLayout; this glue only keeps shared controls labeled.
    if (btnRestart) btnRestart.textContent = "Restart";
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

  function getMeteorGlbVisualScaleForUi() {
    if (window.HC?.WorldRenderer?.getMeteorGlbVisualScale) return window.HC.WorldRenderer.getMeteorGlbVisualScale();
    const n = Number(window.HC?.WorldRendererDebug?.meteorGlbVisualScale ?? window.HC?.Session?.debugConfig?.visual?.meteorGlbVisualScale);
    if (!Number.isFinite(n)) return 1.0;
    return Math.max(0.25, Math.min(4.0, n));
  }

  function setMeteorGlbVisualScaleFromUi(value) {
    const before = getMeteorGlbVisualScaleForUi();
    const scale = window.HC?.WorldRenderer?.setMeteorGlbVisualScale
      ? window.HC.WorldRenderer.setMeteorGlbVisualScale(value)
      : Math.max(0.25, Math.min(4.0, Number(value) || 1.0));
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.meteorGlbVisualScale = scale;
    if (window.HC.Session?.debugConfig?.visual) window.HC.Session.debugConfig.visual.meteorGlbVisualScale = scale;
    const valueNode = document.getElementById("dbgMeteorGlbScaleValue");
    if (valueNode) valueNode.textContent = scale.toFixed(2);
    const input = document.getElementById("dbgMeteorGlbScale");
    if (input && Number(input.value) !== scale) input.value = String(scale);
    if (before !== scale) emitThreeDebugControlEvent("debug.glb_visual_scale_changed", { before, after: scale });
    return scale;
  }


  function getMeteorGlbDepthScaleForUi() {
    if (window.HC?.WorldRenderer?.getMeteorGlbDepthScale) return window.HC.WorldRenderer.getMeteorGlbDepthScale();
    const n = Number(window.HC?.WorldRendererDebug?.meteorGlbDepthScale ?? window.HC?.Session?.debugConfig?.visual?.meteorGlbDepthScale);
    if (!Number.isFinite(n)) return 1.0;
    return Math.max(0.25, Math.min(3.0, n));
  }

  function setMeteorGlbDepthScaleFromUi(value) {
    const before = getMeteorGlbDepthScaleForUi();
    const scale = window.HC?.WorldRenderer?.setMeteorGlbDepthScale
      ? window.HC.WorldRenderer.setMeteorGlbDepthScale(value)
      : Math.max(0.25, Math.min(3.0, Number(value) || 1.0));
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.meteorGlbDepthScale = scale;
    if (window.HC.Session?.debugConfig?.visual) window.HC.Session.debugConfig.visual.meteorGlbDepthScale = scale;
    const valueNode = document.getElementById("dbgMeteorGlbDepthScaleValue");
    if (valueNode) valueNode.textContent = scale.toFixed(2);
    const input = document.getElementById("dbgMeteorGlbDepthScale");
    if (input && Number(input.value) !== scale) input.value = String(scale);
    if (before !== scale) emitThreeDebugControlEvent("debug.glb_depth_scale_changed", { before, after: scale });
    return scale;
  }

  function getThreeCameraModelForUi() {
    if (window.HC?.WorldRenderer?.getThreeCameraModel) return window.HC.WorldRenderer.getThreeCameraModel();
    const model = String(window.HC?.WorldRendererDebug?.cameraModel || window.HC?.Session?.debugConfig?.visual?.cameraModel || "stage_normalized");
    return model === "stage_normalized" ? model : "absolute_bounds";
  }

  function setThreeCameraModelFromUi(value) {
    const before = getThreeCameraModelForUi();
    const model = window.HC?.WorldRenderer?.setThreeCameraModel
      ? window.HC.WorldRenderer.setThreeCameraModel(value)
      : (String(value) === "stage_normalized" ? "stage_normalized" : "absolute_bounds");
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.cameraModel = model;
    if (window.HC.Session?.debugConfig?.visual) window.HC.Session.debugConfig.visual.cameraModel = model;
    const input = document.getElementById("dbgThreeCameraModel");
    if (input && input.value !== model) input.value = model;
    if (before !== model) emitThreeDebugControlEvent("debug.camera_model_changed", { before, after: model });
    return model;
  }

  function getGlobalHelpersEnabledForUi() {
    if (window.HC?.WorldRenderer?.getGlobalHelpersEnabled) return window.HC.WorldRenderer.getGlobalHelpersEnabled();
    const debugValue = window.HC?.WorldRendererDebug?.globalHelpersEnabled;
    const sessionValue = window.HC?.Session?.debugConfig?.visual?.globalHelpersEnabled;
    return (debugValue === true || sessionValue === true) && debugValue !== false && sessionValue !== false;
  }

  function setGlobalHelpersEnabledFromUi(value) {
    const before = getGlobalHelpersEnabledForUi();
    const enabled = value !== false && value !== "false" && value !== "0";
    const after = window.HC?.WorldRenderer?.setGlobalHelpersEnabled
      ? window.HC.WorldRenderer.setGlobalHelpersEnabled(enabled)
      : enabled;
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.globalHelpersEnabled = after;
    if (window.HC.Session?.debugConfig?.visual) window.HC.Session.debugConfig.visual.globalHelpersEnabled = after;
    const input = document.getElementById("dbgGlobalHelpersEnabled");
    if (input) input.checked = after !== false;
    if (before !== after) {
      emitThreeDebugControlEvent("debug.global_helper_visibility_changed", {
        key: "globalHelpersEnabled",
        before,
        after,
      });
    }
    return after;
  }

  function emitThreeDebugControlEvent(type, payload) {
    if (!window.HC?.Session?.started || typeof window.HC.Session.emit !== "function") return;
    const throttleKey = `${type}:${payload?.key || "global"}`;
    const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    const previous = lastDebugControlEventAt.get(throttleKey);
    if (previous != null && now - previous < 1000) return;
    lastDebugControlEventAt.set(throttleKey, now);
    window.HC.Session.emit("debug", type, Object.assign({ source: "ui_debug" }, payload || {}), {
      source: "ui_debug",
      snapshot: true,
      fullSnapshot: true,
    });
  }

  function normalizeDebugControlValue(value) {
    if (typeof value === "number" || typeof value === "boolean" || value == null) return value;
    const n = Number(value);
    return Number.isFinite(n) && String(value).trim() !== "" ? n : String(value);
  }

  function getThreeLightsSettingsForUi() {
    if (window.HC?.WorldRenderer?.getThreeLightsSettings) return window.HC.WorldRenderer.getThreeLightsSettings();
    const defaults = { enabled: true, ambientIntensity: 0.13, ambientIsolate: false, debugKeyLightEnabled: false, debugKeyLightIntensity: 2.2, debugRimLightEnabled: false, debugRimLightIntensity: 0.65, forceHeadlightEnabled: false, forceHeadlightIntensity: 4.5, mainStageSpotEnabled: true, mainStageSpotIntensity: 3.9, mainStageSpotAngle: Math.PI / 2.8, mainStageSpotPenumbra: 0.72, mainStageSpotDistance: 0, mainStageSpotDecay: 0, mainStageSpotXOffset: -0.65, mainStageSpotYOffset: -0.55, mainStageSpotZHeight: 1.55, mainStageSpotTargetMode: "center", showLightHelpers: false };
    return Object.assign({}, defaults, window.HC?.WorldRendererDebug?.threeLights || window.HC?.Session?.debugConfig?.visual?.threeLights || {});
  }

  function setThreeLightsSettingFromUi(key, value) {
    const before = getThreeLightsSettingsForUi();
    const next = window.HC?.WorldRenderer?.setThreeLightsDebugSetting
      ? window.HC.WorldRenderer.setThreeLightsDebugSetting(key, value)
      : Object.assign({}, before, { [key]: value });
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.threeLights = Object.assign({}, next);
    if (window.HC.Session?.debugConfig?.visual) window.HC.Session.debugConfig.visual.threeLights = Object.assign({}, next);
    const valueMap = {
      ambientIntensity: "dbgThreeAmbientValue",
      debugKeyLightIntensity: "dbgThreeDebugKeyIntensityValue",
      debugRimLightIntensity: "dbgThreeDebugRimIntensityValue",
      forceHeadlightIntensity: "dbgThreeForceHeadlightIntensityValue",
      mainStageSpotIntensity: "dbgThreeMainStageSpotIntensityValue",
      mainStageSpotAngle: "dbgThreeMainStageSpotAngleValue",
      mainStageSpotPenumbra: "dbgThreeMainStageSpotPenumbraValue",
      mainStageSpotDistance: "dbgThreeMainStageSpotDistanceValue",
      mainStageSpotDecay: "dbgThreeMainStageSpotDecayValue",
      mainStageSpotXOffset: "dbgThreeMainStageSpotXOffsetValue",
      mainStageSpotYOffset: "dbgThreeMainStageSpotYOffsetValue",
      mainStageSpotZHeight: "dbgThreeMainStageSpotZHeightValue",
    };
    const valueNode = document.getElementById(valueMap[key]);
    if (valueNode && Number.isFinite(Number(next[key]))) valueNode.textContent = Number(next[key]).toFixed(2);
    const inputMap = {
      enabled: "dbgThreeLightsEnabled",
      ambientIntensity: "dbgThreeAmbient",
      ambientIsolate: "dbgThreeAmbientIsolate",
      debugKeyLightEnabled: "dbgThreeDebugKeyEnabled",
      debugKeyLightIntensity: "dbgThreeDebugKeyIntensity",
      debugRimLightEnabled: "dbgThreeDebugRimEnabled",
      debugRimLightIntensity: "dbgThreeDebugRimIntensity",
      forceHeadlightEnabled: "dbgThreeForceHeadlightEnabled",
      forceHeadlightIntensity: "dbgThreeForceHeadlightIntensity",
      showLightHelpers: "dbgThreeShowLightHelpers",
    };
    const input = document.getElementById(inputMap[key]);
    if (input) {
      if (input.type === "checkbox") input.checked = !!next[key];
      else if (Number(input.value) !== Number(next[key])) input.value = String(next[key]);
    }
    const beforeValue = normalizeDebugControlValue(before[key]);
    const afterValue = normalizeDebugControlValue(next[key]);
    if (beforeValue !== afterValue) {
      const eventType = key === "ambientIsolate"
        ? "debug.three_ambient_isolate_changed"
        : (key === "showLightHelpers" ? "debug.three_helper_visibility_changed" : "debug.three_light_setting_changed");
      emitThreeDebugControlEvent(eventType, {
        key,
        before: beforeValue,
        after: afterValue,
        beforeSettings: before,
        afterSettings: next,
      });
    }
    return next;
  }

  function getThreeMaterialSettingsForUi() {
    if (window.HC?.WorldRenderer?.getThreeMaterialSettings) return window.HC.WorldRenderer.getThreeMaterialSettings();
    const defaults = { enabled: false, envIntensity: 0.38, toneExposure: 1.0, forceAuditLog: false, materialMode: "imported", meteorPngTexturesEnabled: true, redMeteorTexturesEnabled: true };
    return Object.assign({}, defaults, window.HC?.WorldRendererDebug?.materials || window.HC?.Session?.debugConfig?.visual?.threeMaterials || {});
  }

  function setThreeMaterialSettingFromUi(key, value) {
    const before = getThreeMaterialSettingsForUi();
    const next = window.HC?.WorldRenderer?.setThreeMaterialDebugSetting
      ? window.HC.WorldRenderer.setThreeMaterialDebugSetting(key, value)
      : Object.assign({}, before, { [key]: value });
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.materials = Object.assign({}, next);
    if (window.HC.Session?.debugConfig?.visual) window.HC.Session.debugConfig.visual.threeMaterials = Object.assign({}, next);
    const valueMap = {
      envIntensity: "dbgThreeEnvIntensityValue",
      toneExposure: "dbgThreeToneExposureValue",
    };
    const valueNode = document.getElementById(valueMap[key]);
    if (valueNode && Number.isFinite(Number(next[key]))) valueNode.textContent = Number(next[key]).toFixed(2);
    const inputMap = {
      enabled: "dbgThreeMaterialDebugEnabled",
      envIntensity: "dbgThreeEnvIntensity",
      toneExposure: "dbgThreeToneExposure",
      forceAuditLog: "dbgThreeForceMaterialAuditLog",
      materialMode: "dbgThreeMaterialMode",
      meteorPngTexturesEnabled: "dbgRedMeteorTexturesEnabled",
      redMeteorTexturesEnabled: "dbgRedMeteorTexturesEnabled",
    };
    const input = document.getElementById(inputMap[key]);
    if (input) {
      if (input.type === "checkbox") input.checked = !!next[key];
      else if (String(input.value) !== String(next[key])) input.value = String(next[key]);
    }
    const beforeValue = normalizeDebugControlValue(before[key]);
    const afterValue = normalizeDebugControlValue(next[key]);
    if (beforeValue !== afterValue) {
      emitThreeDebugControlEvent(key === "materialMode" ? "debug.three_material_mode_changed" : "debug.three_material_setting_changed", {
        key,
        before: beforeValue,
        after: afterValue,
        beforeSettings: before,
        afterSettings: next,
      });
    }
    return next;
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

  function getScenarioPresetOptions() {
    if (window.HC?.Session?.getScenarioPresets) return window.HC.Session.getScenarioPresets();
    return [];
  }

  function populateScenarioPresetSelect() {
    if (!cfgScenarioPreset) return;
    const presets = getScenarioPresetOptions();
    const options = [{ id: "custom", label: "Custom", scenarioLabel: "debug_custom" }, ...presets];
    cfgScenarioPreset.innerHTML = options
      .map((preset) => `<option value="${preset.id}">${preset.label}</option>`)
      .join("");
    cfgScenarioPreset.value = "custom";
  }

  function applyDebugDefaultsToUi() {
    const defaults = getDebugDefaults();
    const setValue = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = String(v ?? "");
    };
    setValue("cfgInitialRP", defaults.initialRP || 0);
    setValue("cfgScenarioLabel", defaults.scenarioLabel || "manual_session");
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
    if (cfgScenarioPreset) cfgScenarioPreset.value = "custom";
    if (cfgScenarioLabel) cfgScenarioLabel.value = "";
  }

  function applyPresetToUi(presetId) {
    if (!presetId || presetId === "custom") return applyDebugDefaultsToUi();
    const preset = window.HC?.Session?.getPresetById ? window.HC.Session.getPresetById(presetId) : null;
    if (!preset || !preset.config) return;
    const merged = window.HC?.createDebugConfig
      ? window.HC.createDebugConfig("debug", preset.config)
      : preset.config;
    const setValue = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = String(v ?? "");
    };
    setValue("cfgInitialRP", merged.initialRP || 0);
    const cards = merged.initialCards || {};
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
    const world = merged.initialWorldState || {};
    setValue("cfgAsteroidCount", sanitizeNonNegativeInt(world.asteroidCount || 0));
    setValue("cfgRockyPlanetCount", sanitizeNonNegativeInt(world.rockyPlanetCount || 0));
    setValue("cfgGasPlanetCount", sanitizeNonNegativeInt(world.gasPlanetCount || 0));
    setValue("cfgStarCount", sanitizeNonNegativeInt(world.starCount || 0));
    const thresholds = merged.thresholdOverrides || {};
    setValue("cfgThresholdAsteroidToPlanet", thresholds.asteroidToPlanet ?? "");
    setValue("cfgThresholdPlanetToStar", thresholds.planetToStar ?? "");
    if (cfgScenarioLabel && !cfgScenarioLabel.value.trim()) cfgScenarioLabel.value = preset.scenarioLabel || preset.id;
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
    const presetId = cfgScenarioPreset?.value || "custom";
    const preset = window.HC?.Session?.getPresetById ? window.HC.Session.getPresetById(presetId) : null;
    const scenarioLabel = String(cfgScenarioLabel?.value || "").trim() || preset?.scenarioLabel || presetId || "debug_custom";
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
      scenarioPresetId: presetId,
      scenarioLabel,
      note: String(debugSessionNote?.value || "").trim(),
    };
  }


  function isRuntimeDebugSectionOpen(sectionId) {
    return runtimeDebugSectionState[sectionId] === true;
  }

  function saveRuntimeDebugSectionState(sectionId, open) {
    if (!sectionId) return;
    runtimeDebugSectionState = { ...runtimeDebugSectionState, [sectionId]: open === true };
  }

  function updateRuntimeOverlayCollapseUi() {
    if (!runtimeDebugOverlay) return;
    runtimeDebugOverlay.classList.toggle("collapsed", runtimeOverlayCollapsed);
    if (runtimeDebugOverlayPanel) runtimeDebugOverlayPanel.hidden = runtimeOverlayCollapsed;
    if (btnDebugOverlayToggle) {
      btnDebugOverlayToggle.textContent = runtimeOverlayCollapsed ? t("overlay.debugCollapsed") : t("overlay.debugExpanded");
      btnDebugOverlayToggle.setAttribute("title", runtimeOverlayCollapsed ? "Show debug overlay" : "Hide debug overlay");
      btnDebugOverlayToggle.setAttribute("aria-label", runtimeOverlayCollapsed ? "Show debug overlay" : "Hide debug overlay");
      btnDebugOverlayToggle.setAttribute("aria-expanded", runtimeOverlayCollapsed ? "false" : "true");
    }
  }

  function applyStaticI18nText() {
    const nodes = document.querySelectorAll("[data-debug-i18n]");
    nodes.forEach((node) => {
      const key = node.getAttribute("data-debug-i18n");
      if (!key) return;
      node.textContent = t(key);
    });
    const placeholderNodes = document.querySelectorAll("[data-debug-i18n-placeholder]");
    placeholderNodes.forEach((node) => {
      const key = node.getAttribute("data-debug-i18n-placeholder");
      if (!key) return;
      node.setAttribute("placeholder", t(key));
    });
  }

  window.HC.UI = {
    init() {
      if (initialized) return;
      initialized = true;

      const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
      fpsLabel = document.getElementById("fpsLabel");
      btnRestart = document.getElementById("btnRestart");
      topBar = document.getElementById("topBar");
      debugBadge = document.getElementById("debugBadge");
      startOverlay = document.getElementById("startOverlay");
      btnStartNormal = document.getElementById("btnStartNormal");
      btnStartDebug = document.getElementById("btnStartDebug");
      btnStartDebugSession = document.getElementById("btnStartDebugSession");
      btnDebugBack = document.getElementById("btnDebugBack");
      btnDebugResetDefaults = document.getElementById("btnDebugResetDefaults");
      debugConfigPanel = document.getElementById("debugConfigPanel");
      runtimeDebugOverlay = document.getElementById("runtimeDebugOverlay");
      runtimeDebugOverlayBody = document.getElementById("runtimeDebugOverlayBody");
      runtimeDebugOverlayPanel = document.getElementById("runtimeDebugOverlayPanel");
      if (runtimeDebugOverlayBody) {
        runtimeDebugOverlayBody.addEventListener("click", async (event) => {
          const interactiveControl = event.target && event.target.closest
            ? event.target.closest("input, select, textarea, button, label, option")
            : null;
          if (interactiveControl) event.stopPropagation();
          const hudTopControl = event.target && event.target.closest ? event.target.closest("[data-hud-top-action]") : null;
          if (hudTopControl && window.HC?.HudTopLayout?.handleDebugControl?.(hudTopControl)) {
            const snap = window.HC?.Session?.getRuntimeSnapshot ? window.HC.Session.getRuntimeSnapshot() : null;
            runtimeDebugOverlayBody.innerHTML = renderRuntimeOverlayHtml(snap, runtimeOverlayCompact);
            return;
          }
          const panelControl = event.target && event.target.closest ? event.target.closest("[data-submeta-panel-action]") : null;
          if (panelControl) {
            const action = panelControl.dataset.submetaPanelAction;
            const json = document.getElementById("dbgSubMetaPanelsJson")?.value || "";
            if (window.HC?.SubMetaPanels?.handleDebugControl?.(panelControl)) {
              if (["clear-selection", "reset", "import", "select"].includes(action)) {
                const snap = window.HC?.Session?.getRuntimeSnapshot ? window.HC.Session.getRuntimeSnapshot() : null;
                runtimeDebugOverlayBody.innerHTML = renderRuntimeOverlayHtml(snap, runtimeOverlayCompact);
                const textarea = document.getElementById("dbgSubMetaPanelsJson");
                if (textarea) textarea.value = json;
              }
              return;
            }
          }
          const placeholderControl = event.target && event.target.closest ? event.target.closest("[data-submeta-placeholder-action]") : null;
          if (placeholderControl) {
            const action = placeholderControl.dataset.submetaPlaceholderAction;
            const json = document.getElementById("dbgSubMetaPlaceholderJson")?.value || "";
            if (window.HC?.SubMetaPlaceholders?.handleDebugControl?.(placeholderControl)) {
              if (["clear-selection", "reset", "import"].includes(action)) {
                const snap = window.HC?.Session?.getRuntimeSnapshot ? window.HC.Session.getRuntimeSnapshot() : null;
                runtimeDebugOverlayBody.innerHTML = renderRuntimeOverlayHtml(snap, runtimeOverlayCompact);
                const textarea = document.getElementById("dbgSubMetaPlaceholderJson");
                if (textarea) textarea.value = json;
              }
              return;
            }
          }
          const subMetaControl = event.target && event.target.closest ? event.target.closest("[data-submeta-png-action]") : null;
          if (subMetaControl) {
            const handled = await window.HC?.SubMetaPngLayout?.handleDebugControl?.(subMetaControl);
            if (handled) {
              const json = document.getElementById("dbgSubMetaPngJson")?.value || "";
              const snap = window.HC?.Session?.getRuntimeSnapshot ? window.HC.Session.getRuntimeSnapshot() : null;
              runtimeDebugOverlayBody.innerHTML = renderRuntimeOverlayHtml(snap, runtimeOverlayCompact);
              const textarea = document.getElementById("dbgSubMetaPngJson");
              if (textarea) textarea.value = json;
              return;
            }
          }
          const cardsPresetBtn = event.target && event.target.closest
            ? event.target.closest("[data-debug-cards-preset]")
            : null;
          if (cardsPresetBtn) {
            const presetWorld = (window.HC.getWorld && window.HC.getWorld()) || window.World;
            const result = window.CardEngine?.applyDebugCardPreset?.(presetWorld, 13);
            if (presetWorld && result) {
              presetWorld.score = 500;
              updateScoreLabel(presetWorld, true);
              window.HC?.SubMetaPanels?.syncDom?.();
              window.HC?.SubMetaPlaceholders?.syncDom?.();
              window.HC?.logEvent?.("debug", "cards_test_preset_applied", {
                targetCount: result.targetCount,
                stackCount: result.stackCount,
                totalCards: result.totalCards,
                rp: presetWorld.score,
              });
              const snap = window.HC?.Session?.getRuntimeSnapshot ? window.HC.Session.getRuntimeSnapshot() : null;
              runtimeDebugOverlayBody.innerHTML = renderRuntimeOverlayHtml(snap, runtimeOverlayCompact);
            }
            return;
          }
          const tabBtn = event.target && event.target.closest ? event.target.closest("[data-debug-tab]") : null;
          const forceBtn = event.target && event.target.closest ? event.target.closest("#dbgForceFullDiagnostics") : null;
          if (forceBtn) {
            window.HC?.forceFullDiagnostics?.("ui_debug_button");
            return;
          }
          if (!tabBtn) return;
          runtimeOverlayTab = tabBtn.getAttribute("data-debug-tab") === "prg" ? "prg" : "session";
        });
        runtimeDebugOverlayBody.addEventListener("toggle", (event) => {
          const section = event.target;
          if (!(section instanceof HTMLDetailsElement)) return;
          const sectionId = section.dataset.runtimeDebugSection;
          if (sectionId) saveRuntimeDebugSectionState(sectionId, section.open);
        }, true);
        const handleRuntimeDebugControl = (event) => {
          const target = event.target;
          if (!target) return;
          if (window.HC?.HudTopLayout?.handleDebugControl?.(target)) return;
          if (window.HC?.SubMetaPanels?.handleDebugControl?.(target)) {
            if (target.id === "dbgSubMetaPanelId") {
              const snap = window.HC?.Session?.getRuntimeSnapshot ? window.HC.Session.getRuntimeSnapshot() : null;
              runtimeDebugOverlayBody.innerHTML = renderRuntimeOverlayHtml(snap, runtimeOverlayCompact);
            }
            return;
          }
          if (window.HC?.SubMetaPlaceholders?.handleDebugControl?.(target)) {
            if (target.id === "dbgSubMetaPlaceholderId" || target.dataset?.submetaPlaceholderField === "state") {
              const snap = window.HC?.Session?.getRuntimeSnapshot ? window.HC.Session.getRuntimeSnapshot() : null;
              runtimeDebugOverlayBody.innerHTML = renderRuntimeOverlayHtml(snap, runtimeOverlayCompact);
            }
            return;
          }
          if (window.HC?.SubMetaPngLayout?.handleDebugControl?.(target)) {
            if (["dbgSubMetaPngEnabled", "dbgSubMetaPngPreview", "dbgSubMetaPngElement"].includes(target.id)) {
              const snap = window.HC?.Session?.getRuntimeSnapshot ? window.HC.Session.getRuntimeSnapshot() : null;
              runtimeDebugOverlayBody.innerHTML = renderRuntimeOverlayHtml(snap, runtimeOverlayCompact);
            }
            return;
          }
          if (!target.id) return;
          if (target.id === "dbgMeteorGlbScale") {
            setMeteorGlbVisualScaleFromUi(target.value);
            return;
          }
          if (target.id === "dbgMeteorGlbDepthScale") {
            setMeteorGlbDepthScaleFromUi(target.value);
            return;
          }
          if (target.id === "dbgThreeCameraModel") {
            setThreeCameraModelFromUi(target.value);
            return;
          }
          if (target.id === "dbgGlobalHelpersEnabled") {
            setGlobalHelpersEnabledFromUi(target.checked);
            return;
          }
          if (target.id === "dbgForceFullDiagnostics") {
            window.HC?.forceFullDiagnostics?.("ui_debug_button");
            return;
          }
          if (target.id === "dbgVerboseDiagnostics") {
            const nextMode = window.HC?.Session?.setLoggingMode
              ? window.HC.Session.setLoggingMode(target.checked ? "verbose" : "compact")
              : (target.checked ? "verbose" : "compact");
            emitThreeDebugControlEvent("debug.logging_mode_changed", { after: nextMode });
            return;
          }
          if (target.id === "dbgHeartbeatIntervalMs") {
            const nextInterval = Math.max(1000, Math.floor(Number(target.value) || 5000));
            const appliedInterval = window.HC?.Session?.setHeartbeatIntervalMs
              ? window.HC.Session.setHeartbeatIntervalMs(nextInterval)
              : nextInterval;
            const valueNode = document.getElementById("dbgHeartbeatIntervalMsValue");
            if (valueNode) valueNode.textContent = `${appliedInterval} ms`;
            emitThreeDebugControlEvent("debug.heartbeat_interval_changed", { after: appliedInterval });
            return;
          }
          if (target.id === "dbgRendererMode") {
            const nextMode = target.value === "three" ? "three" : "canvas2d";
            window.HC = window.HC || {};
            const before = window.HC.RENDER_MODE || window.HC?.WorldRenderer?.getMode?.() || "three";
            window.HC.RENDER_MODE = nextMode;
            if (window.HC.Session?.debugConfig?.visual) {
              window.HC.Session.debugConfig.visual.rendererMode = nextMode;
              window.HC.Session.debugConfig.visual.worldRendererMode = nextMode;
              window.HC.Session.debugConfig.visual.defaultRenderer = nextMode;
            }
            if (window.HC.WorldRenderer && typeof window.HC.WorldRenderer.setMode === "function") {
              window.HC.WorldRenderer.setMode(nextMode);
            }
            if (before !== nextMode) emitThreeDebugControlEvent("debug.renderer_mode_changed", { before, after: nextMode });
            return;
          }
          const threeLightControls = {
            dbgThreeLightsEnabled: "enabled",
            dbgThreeAmbient: "ambientIntensity",
            dbgThreeAmbientIsolate: "ambientIsolate",
            dbgThreeDebugKeyEnabled: "debugKeyLightEnabled",
            dbgThreeDebugKeyIntensity: "debugKeyLightIntensity",
            dbgThreeDebugRimEnabled: "debugRimLightEnabled",
            dbgThreeDebugRimIntensity: "debugRimLightIntensity",
            dbgThreeForceHeadlightEnabled: "forceHeadlightEnabled",
            dbgThreeForceHeadlightIntensity: "forceHeadlightIntensity",
            dbgThreeMainStageSpotEnabled: "mainStageSpotEnabled",
            dbgThreeMainStageSpotIntensity: "mainStageSpotIntensity",
            dbgThreeMainStageSpotAngle: "mainStageSpotAngle",
            dbgThreeMainStageSpotPenumbra: "mainStageSpotPenumbra",
            dbgThreeMainStageSpotDistance: "mainStageSpotDistance",
            dbgThreeMainStageSpotDecay: "mainStageSpotDecay",
            dbgThreeMainStageSpotXOffset: "mainStageSpotXOffset",
            dbgThreeMainStageSpotYOffset: "mainStageSpotYOffset",
            dbgThreeMainStageSpotZHeight: "mainStageSpotZHeight",
            dbgThreeMainStageSpotTargetMode: "mainStageSpotTargetMode",
            dbgThreeShowLightHelpers: "showLightHelpers",
          };
          if (threeLightControls[target.id]) {
            setThreeLightsSettingFromUi(threeLightControls[target.id], target.type === "checkbox" ? target.checked : target.value);
            return;
          }
          const threeMaterialControls = {
            dbgThreeMaterialDebugEnabled: "enabled",
            dbgThreeEnvIntensity: "envIntensity",
            dbgThreeToneExposure: "toneExposure",
            dbgThreeForceMaterialAuditLog: "forceAuditLog",
            dbgThreeMaterialMode: "materialMode",
            dbgRedMeteorTexturesEnabled: "meteorPngTexturesEnabled",
          };
          if (threeMaterialControls[target.id]) {
            setThreeMaterialSettingFromUi(threeMaterialControls[target.id], target.type === "checkbox" ? target.checked : target.value);
            return;
          }
          const cfg = window.HC?.Session?.debugConfig?.visual?.prgFrameProbe;
          if (!cfg) return;
          const boolMap = {
            dbgPrgEnabled: "enabled",
            dbgPrgGoldTint: "goldTint",
            dbgPrgOverlay: "showOverlay",
            dbgPrgBounds: "showBounds",
            dbgPrgAnchors: "showAnchors",
            dbgPrgLabels: "showLabels",
            dbgPrgMetadata: "showMetadata",
          };
          if (boolMap[target.id]) cfg[boolMap[target.id]] = !!target.checked;
          if (target.id === "dbgPrgMode") cfg.mode = String(target.value || "sourceCutRectFitProbe");
        };
        runtimeDebugOverlayBody.addEventListener("input", handleRuntimeDebugControl);
        runtimeDebugOverlayBody.addEventListener("change", handleRuntimeDebugControl);
      }
      btnDebugOverlayToggle = document.getElementById("btnDebugOverlayToggle");
      btnDebugSelectFolder = document.getElementById("btnDebugSelectFolder");
      btnDebugFinalizeSession = document.getElementById("btnDebugFinalizeSession");
      btnDebugCopyPath = document.getElementById("btnDebugCopyPath");

      btnExportEvidence = document.getElementById("btnExportEvidence");
      btnMarkIssue = document.getElementById("btnMarkIssue");
      debugSessionNote = document.getElementById("debugSessionNote");
      cfgScenarioPreset = document.getElementById("cfgScenarioPreset");
      cfgScenarioLabel = document.getElementById("cfgScenarioLabel");

      window.HC?.HudTopLayout?.init?.();
      window.HC?.SubMetaPngLayout?.init?.();
      window.HC?.SubMetaPlaceholders?.init?.();
      window.HC?.SubMetaPanels?.init?.();
      applyStaticI18nText();
      populateScenarioPresetSelect();

      if (btnDebugOverlayToggle) {
        btnDebugOverlayToggle.style.cursor = "pointer";
        btnDebugOverlayToggle.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          runtimeOverlayCollapsed = !runtimeOverlayCollapsed;
          updateRuntimeOverlayCollapseUi();
        });
      }
      if (btnDebugSelectFolder) {
        btnDebugSelectFolder.addEventListener("click", async () => {
          if (!window.HC?.selectDebugLogFolder) return;
          await window.HC.selectDebugLogFolder();
        });
      }
      if (btnDebugFinalizeSession) {
        btnDebugFinalizeSession.addEventListener("click", async () => {
          if (!window.HC?.finalizeDebugSession) return;
          const info = await window.HC.finalizeDebugSession();
          if (info) {
            const msg = [
              "Session saved",
              `sessionId: ${window.HC?.Session?.sessionId || "n/a"}`,
              `files saved to: ${info.filesSavedTo || "fallback storage"}`,
              `main log: ${info.mainLog || "events.jsonl"}`,
              `summary: ${info.summary || "summary.json"}`,
            ].join("\\n");
            window.alert(msg);
          }
        });
      }
      if (btnDebugCopyPath) {
        btnDebugCopyPath.addEventListener("click", async () => {
          const snap = window.HC?.Session?.getRuntimeSnapshot ? window.HC.Session.getRuntimeSnapshot() : null;
          const path = snap?.loggingStatus?.filesSavedTo || "";
          if (!path) return;
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(path);
          }
        });
      }

      if (btnExportEvidence) {
        btnExportEvidence.addEventListener("click", () => {
          const note = String(debugSessionNote?.value || "").trim();
          window.HC?.Session?.exportEvidence?.(note);
        });
      }
      if (btnMarkIssue) {
        btnMarkIssue.addEventListener("click", () => {
          const title = window.prompt("Issue title?");
          if (!title) return;
          const category = window.prompt("Category (sequence|reward|transform|ui|logging|regression)?", "regression") || "regression";
          const severity = window.prompt("Severity (low|medium|high|critical)?", "medium") || "medium";
          const expected = window.prompt("Expected behavior?", "");
          const observed = window.prompt("Observed behavior?", "");
          const reproSteps = window.prompt("Repro steps?", "");
          const issue = window.HC?.Session?.markIssue?.({
            title,
            category,
            severity,
            expected,
            observed,
            reproSteps,
          });
          if (issue) window.alert(`Issue saved: ${issue.issueId}`);
        });
      }
      if (cfgScenarioPreset) {
        cfgScenarioPreset.addEventListener("change", () => applyPresetToUi(cfgScenarioPreset.value));
      }

      scoreLabel = ensureScoreLabel();
      applyHudSkin();

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
      if (runtimeDebugOverlay) runtimeDebugOverlay.classList.toggle("compact", runtimeOverlayCompact);
      updateRuntimeOverlayCollapseUi();
      updateScoreLabel(World, true);
    },
    applySessionMode(mode) {
      if (mode !== "debug") window.HC?.SubMetaPngLayout?.setPreviewEnabled?.(false);
      if (debugBadge) debugBadge.hidden = mode !== "debug";
      if (runtimeDebugOverlay) {
        runtimeDebugOverlay.hidden = mode !== "debug";
      }
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
      window.HC?.SubMetaPngLayout?.update?.();
      window.HC?.SubMetaPlaceholders?.update?.();
      window.HC?.SubMetaPanels?.update?.();
      const CE = window.CardEngine;
      const view = window.HC.getView && window.HC.getView();
      if (CE && typeof CE.render === "function" && view && window.ctx) {
        CE.render(window.ctx, view.w, view.h);
      }

      const activeInRuntimeOverlay = !!(runtimeDebugOverlayBody && document.activeElement && runtimeDebugOverlayBody.contains(document.activeElement));
      if (runtimeDebugOverlay && !runtimeDebugOverlay.hidden && !activeInRuntimeOverlay && nowMs - runtimeOverlayLastRenderMs > 120) {
        runtimeOverlayLastRenderMs = nowMs;
        const snap = window.HC?.Session?.getRuntimeSnapshot ? window.HC.Session.getRuntimeSnapshot() : null;
        if (runtimeDebugOverlayBody) runtimeDebugOverlayBody.innerHTML = renderRuntimeOverlayHtml(snap, runtimeOverlayCompact);
      }
    },
  };

  function fmtMs(ms) {
    const total = Math.max(0, Math.floor(Number(ms || 0) / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function renderRows(rows) {
    return rows.map((row) => `<div class="overlay-row"><span class="k">${row[0]}</span><code class="v">${row[1]}</code></div>`).join("");
  }

  function renderPrgCheckboxRow(id, label, checked) {
    return `<div class="overlay-checkbox-row">
      <input id="${id}" class="overlay-checkbox" type="checkbox"${checked ? " checked" : ""}>
      <label for="${id}" class="overlay-checkbox-label">${label}</label>
    </div>`;
  }

  function summarizeEvent(event) {
    if (!event) return t("overlay.na");
    const payload = event.payload || {};
    const core = payload.sourceId || payload.reason || payload.thresholdType || payload.current || "";
    return `${event.type}${core ? ` · ${core}` : ""}`;
  }

  function renderRuntimeOverlayHtml(snap, compact) {
    if (!snap) return `<div class="overlay-row"><span class="k">status</span><span class="v">no snapshot</span></div>`;
    const tabsHtml = `
      <section class="overlay-section">
        <div class="overlay-actions">
          <button class="overlay-btn" data-debug-tab="session" type="button">Session / Logi</button>
          <button class="overlay-btn" data-debug-tab="prg" type="button">PRG frame</button>
        </div>
      </section>
    `;
    if (runtimeOverlayTab === "prg") {
      const cfg = snap.visual?.prgFrameProbe || window.HC?.Session?.debugConfig?.visual?.prgFrameProbe || {};
      const status = window.HC?.PrgFrameProbe?.getStatus ? window.HC.PrgFrameProbe.getStatus() : null;
      const mode = String(cfg.mode || "sourceCutRectFitProbe");
      const modeOptions = [
        `<option value="sourceCutRectFitProbe"${mode === "sourceCutRectFitProbe" ? " selected" : ""}>sourceCutRectFitProbe</option>`,
        `<option value="frameLineAnchors"${mode === "frameLineAnchors" ? " selected" : ""}>frameLineAnchorsCandidate</option>`,
        `<option value="compare" disabled>compare (not implemented)</option>`
      ].join("");
      return `${tabsHtml}
        <section class="overlay-section">
          <h4>Legacy PRG frame probe — unrelated to SUB-META PNG Layout</h4>
          <div class="overlay-grid">
            ${renderPrgCheckboxRow("dbgPrgEnabled", "Enable PRG frame probe", cfg.enabled)}
            ${renderPrgCheckboxRow("dbgPrgGoldTint", "Temporary gold tint", cfg.goldTint !== false)}
            ${renderPrgCheckboxRow("dbgPrgOverlay", "Show debug overlay", cfg.showOverlay === true)}
            ${renderPrgCheckboxRow("dbgPrgBounds", "Show part bounds", cfg.showBounds === true)}
            ${renderPrgCheckboxRow("dbgPrgAnchors", "Show anchors / join points", cfg.showAnchors === true)}
            ${renderPrgCheckboxRow("dbgPrgLabels", "Show labels", cfg.showLabels === true)}
            ${renderPrgCheckboxRow("dbgPrgMetadata", "Show metadata readiness", cfg.showMetadata === true)}
            <label class="overlay-select-row" for="dbgPrgMode">Probe mode <select id="dbgPrgMode">${modeOptions}</select></label>
          </div>
        </section>
        <section class="overlay-section">
          <h4>Status</h4>
          <div class="overlay-grid">${renderRows([
            ["probe", cfg.enabled ? "ON" : "OFF"],
            ["current mode", mode],
            ["manifest loaded", status?.manifestLoaded ? "yes" : "no"],
            ["assets loaded/failed", `${status?.assetsLoaded ?? 0}/${status?.assetsFailed ?? 0}`],
            ["metadata loaded", status?.metadataLoaded ? "yes" : "no"],
            ["readyForFrameLineAnchors", status?.readyForFrameLineAnchors ? "yes" : "no"],
            ["warnings", Array.isArray(status?.warnings) ? (status.warnings.join(" | ") || "-") : "-"],
          ])}</div>
        </section>`;
    }
    const seq = snap.sequence || {};
    const cards = snap.economy?.cards || {};
    const wc = snap.worldCounts || {};
    const thr = snap.thresholds || {};
    const ls = snap.loggingStatus || {};
    const fs = snap.finalizeState || {};
    const recent = Array.isArray(snap.recentEvents) ? snap.recentEvents.slice(-5) : [];
    const sections = [];

    const rendererDiag = window.HC?.WorldRenderer?.getDiagnostics ? window.HC.WorldRenderer.getDiagnostics() : null;
    const requestedMode = rendererDiag?.requestedMode || window.HC?.RENDER_MODE || "three";
    const modeOptions = [
      `<option value="three"${requestedMode === "three" ? " selected" : ""}>Three.js — default / recommended</option>`,
      `<option value="canvas2d"${requestedMode === "canvas2d" ? " selected" : ""}>Canvas2D — legacy mechanics verification / fallback</option>`,
    ].join("");
    const threeLights = getThreeLightsSettingsForUi();
    const threeMaterials = getThreeMaterialSettingsForUi();
    const materialModeOptions = ["imported", "standard_test", "clay_lit", "normal_debug", "diagnostic_unlit"].map((mode) =>
      `<option value="${mode}"${threeMaterials.materialMode === mode ? " selected" : ""}>${mode}</option>`
    ).join("");

    const loggingCounters = snap.loggingCounters || {};
    const lightHelperStatus = rendererDiag?.threeLightHelpers || {};
    const globalHelpersEnabled = getGlobalHelpersEnabledForUi();
    const openAttr = (isOpen) => isOpen ? " open" : "";
    const renderSection = (sectionId, title, rows, controls = "", options = {}) => `
      <details class="overlay-section overlay-collapsible${options.advanced ? " overlay-expanded-only" : ""}" data-runtime-debug-section="${sectionId}"${openAttr(isRuntimeDebugSectionOpen(sectionId, options.open === true))}>
        <summary>${title}</summary>
        ${controls ? `<div class="overlay-grid">${controls}</div>` : ""}
        <div class="overlay-grid">${renderRows(rows)}</div>
        ${options.extra || ""}
      </details>
    `;

    sections.push(renderSection("renderer-scene", "Renderer / Scene", [
      ["renderer mode", `${rendererDiag?.requestedMode || requestedMode} / ${rendererDiag?.effectiveMode || "three"}`],
      ["cameraModel", rendererDiag?.threeCameraModel || getThreeCameraModelForUi()],
      ["fallback status", rendererDiag?.fallbackUsed ? (rendererDiag?.fallbackReason || "fallback") : "none"],
      ["canvas layer", rendererDiag?.canvasLayerMode || "canvas2d"],
      ["stage status", rendererDiag?.stageModelEnabled ? JSON.stringify(rendererDiag.stageSettings || {}) : "absolute/canvas"],
      ["Three dependency", rendererDiag?.hasThreeDependency ? "yes" : "no"],
      ["Three initialized", rendererDiag?.threeInitialized ? "yes" : "no"],
    ], `
      <label class="overlay-select-row" for="dbgRendererMode">Renderer <select id="dbgRendererMode">${modeOptions}</select></label>
      <label class="overlay-select-row" for="dbgThreeCameraModel">Camera model
        <select id="dbgThreeCameraModel">
          <option value="absolute_bounds"${getThreeCameraModelForUi() === "absolute_bounds" ? " selected" : ""}>absolute_bounds</option>
          <option value="stage_normalized"${getThreeCameraModelForUi() === "stage_normalized" ? " selected" : ""}>stage_normalized</option>
        </select>
      </label>
    `, { open: true }));

    sections.push(renderSection("lighting", "Lighting", [
      ["Main Stage Spot", `${threeLights.mainStageSpotEnabled !== false ? "ON" : "OFF"} / ${Number(threeLights.mainStageSpotIntensity).toFixed(2)}`],
      ["ambient fill", Number(threeLights.ambientIntensity || 0).toFixed(2)],
      ["helpers global", globalHelpersEnabled ? "enabled" : "HIDE ALL"],
      ["local light helpers", threeLights.showLightHelpers ? "enabled" : "off"],
      ["compact status", rendererDiag?.mainStageSpot ? `target=${rendererDiag.mainStageSpot.targetMode || "center"}` : "no spot diagnostics"],
    ], `
      <label class="overlay-select-row" for="dbgGlobalHelpersEnabled">Helpers enabled / Hide all helpers
        <input id="dbgGlobalHelpersEnabled" type="checkbox"${globalHelpersEnabled ? " checked" : ""}>
      </label>
      <label class="overlay-select-row" for="dbgThreeLightsEnabled">Stage lighting enabled
        <input id="dbgThreeLightsEnabled" type="checkbox"${threeLights.enabled !== false ? " checked" : ""}>
      </label>
      <label class="overlay-select-row" for="dbgThreeMainStageSpotEnabled">Main Stage Spot
        <input id="dbgThreeMainStageSpotEnabled" type="checkbox"${threeLights.mainStageSpotEnabled !== false ? " checked" : ""}>
      </label>
      <label class="overlay-select-row" for="dbgThreeMainStageSpotIntensity">Main Stage Spot intensity
        <input id="dbgThreeMainStageSpotIntensity" type="range" min="0" max="25" step="0.1" value="${threeLights.mainStageSpotIntensity}">
        <span id="dbgThreeMainStageSpotIntensityValue">${Number(threeLights.mainStageSpotIntensity).toFixed(2)}</span>
      </label>
      <label class="overlay-select-row" for="dbgThreeAmbient">Ambient fill
        <input id="dbgThreeAmbient" type="range" min="0" max="0.75" step="0.01" value="${threeLights.ambientIntensity}">
        <span id="dbgThreeAmbientValue">${Number(threeLights.ambientIntensity).toFixed(2)}</span>
      </label>
      <label class="overlay-select-row" for="dbgThreeShowLightHelpers">Local light helpers
        <input id="dbgThreeShowLightHelpers" type="checkbox"${threeLights.showLightHelpers === true ? " checked" : ""}>
      </label>
    `, { open: true }));

    sections.push(renderSection("lighting-advanced", "Lighting Advanced", [
      ["lighting model", rendererDiag?.lightingModelVersion || rendererDiag?.stageLighting?.lightingModelVersion || "stage_spot_v1"],
      ["optional diagnostic lights", `debugKey=${threeLights.debugKeyLightEnabled ? "on" : "off"}, debugRim=${threeLights.debugRimLightEnabled ? "on" : "off"}, headlight=${threeLights.forceHeadlightEnabled ? "on" : "off"}`],
      ["helper counts", `${lightHelperStatus.count ?? 0} / ${lightHelperStatus.mode || "none"}`],
      ["Main Stage Spot diagnostics", rendererDiag?.threeLightDiagnostics?.mainStageSpot ? JSON.stringify(rendererDiag.threeLightDiagnostics.mainStageSpot) : "none"],
    ], `
      <label class="overlay-select-row" for="dbgThreeMainStageSpotAngle">Main Stage Spot angle
        <input id="dbgThreeMainStageSpotAngle" type="range" min="${Math.PI / 24}" max="${Math.PI / 2}" step="0.01" value="${threeLights.mainStageSpotAngle}">
        <span id="dbgThreeMainStageSpotAngleValue">${Number(threeLights.mainStageSpotAngle).toFixed(2)}</span>
      </label>
      <label class="overlay-select-row" for="dbgThreeMainStageSpotPenumbra">Main Stage Spot penumbra
        <input id="dbgThreeMainStageSpotPenumbra" type="range" min="0" max="1" step="0.01" value="${threeLights.mainStageSpotPenumbra}">
        <span id="dbgThreeMainStageSpotPenumbraValue">${Number(threeLights.mainStageSpotPenumbra).toFixed(2)}</span>
      </label>
      <label class="overlay-select-row" for="dbgThreeMainStageSpotTargetMode">Main Stage Spot target
        <select id="dbgThreeMainStageSpotTargetMode"><option value="center"${threeLights.mainStageSpotTargetMode === "center" ? " selected" : ""}>center</option><option value="sampleObject"${threeLights.mainStageSpotTargetMode === "sampleObject" ? " selected" : ""}>sampleObject</option></select>
      </label>
      <label class="overlay-select-row" for="dbgThreeDebugKeyEnabled">Debug key (optional diagnostic) <input id="dbgThreeDebugKeyEnabled" type="checkbox"${threeLights.debugKeyLightEnabled === true ? " checked" : ""}></label>
      <label class="overlay-select-row" for="dbgThreeDebugRimEnabled">Debug rim (optional diagnostic) <input id="dbgThreeDebugRimEnabled" type="checkbox"${threeLights.debugRimLightEnabled === true ? " checked" : ""}></label>
      <label class="overlay-select-row" for="dbgThreeForceHeadlightEnabled">Force headlight (optional diagnostic) <input id="dbgThreeForceHeadlightEnabled" type="checkbox"${threeLights.forceHeadlightEnabled === true ? " checked" : ""}></label>
      <label class="overlay-select-row" for="dbgThreeMainStageSpotXOffset">Main Stage Spot X offset <input id="dbgThreeMainStageSpotXOffset" type="range" min="-2" max="2" step="0.01" value="${threeLights.mainStageSpotXOffset}"><span id="dbgThreeMainStageSpotXOffsetValue">${Number(threeLights.mainStageSpotXOffset).toFixed(2)}</span></label>
      <label class="overlay-select-row" for="dbgThreeMainStageSpotYOffset">Main Stage Spot Y offset <input id="dbgThreeMainStageSpotYOffset" type="range" min="-2" max="2" step="0.01" value="${threeLights.mainStageSpotYOffset}"><span id="dbgThreeMainStageSpotYOffsetValue">${Number(threeLights.mainStageSpotYOffset).toFixed(2)}</span></label>
      <label class="overlay-select-row" for="dbgThreeMainStageSpotZHeight">Main Stage Spot Z offset <input id="dbgThreeMainStageSpotZHeight" type="range" min="0.25" max="4" step="0.05" value="${threeLights.mainStageSpotZHeight}"><span id="dbgThreeMainStageSpotZHeightValue">${Number(threeLights.mainStageSpotZHeight).toFixed(2)}</span></label>
    `, { open: false, advanced: true }));

    sections.push(renderSection("glb-materials", "GLB / Materials", [
      ["materialMode", rendererDiag?.threeMaterialOverrideStatus?.currentMaterialMode || threeMaterials.materialMode || "imported"],
      ["GLB visual-only scale", rendererDiag?.meteorGlbVisualScale ?? getMeteorGlbVisualScaleForUi()],
      ["GLB depth scale", rendererDiag?.meteorGlbDepthScale ?? getMeteorGlbDepthScaleForUi()],
      ["material audit", rendererDiag?.glbMaterialAuditStatus ? JSON.stringify(rendererDiag.glbMaterialAuditStatus) : "audit idle"],
      ["meteor texture evidence", rendererDiag?.meteorTextureEvidence ? JSON.stringify(rendererDiag.meteorTextureEvidence) : "evidence unavailable"],
      ["modes", "imported / clay_lit / normal_debug / diagnostic_unlit"],
      ["active GLB meshes", rendererDiag?.threeMaterialOverrideStatus?.activeGlbMeshCount ?? 0],
    ], `
      <label class="overlay-select-row" for="dbgMeteorGlbScale">GLB visual-only scale <input id="dbgMeteorGlbScale" type="range" min="0.25" max="4" step="0.05" value="${getMeteorGlbVisualScaleForUi()}"><span id="dbgMeteorGlbScaleValue">${getMeteorGlbVisualScaleForUi().toFixed(2)}</span><small>debug only; collision radius stays on meteorBaseScale</small></label>
      <label class="overlay-select-row" for="dbgMeteorGlbDepthScale">GLB depth scale <input id="dbgMeteorGlbDepthScale" type="range" min="0.25" max="3" step="0.05" value="${getMeteorGlbDepthScaleForUi()}"><span id="dbgMeteorGlbDepthScaleValue">${getMeteorGlbDepthScaleForUi().toFixed(2)}</span></label>
      <label class="overlay-select-row" for="dbgThreeMaterialMode">Material mode <select id="dbgThreeMaterialMode">${materialModeOptions}</select></label>
      <label class="overlay-select-row" for="dbgThreeMaterialDebugEnabled">Material debug log <input id="dbgThreeMaterialDebugEnabled" type="checkbox"${threeMaterials.enabled === true ? " checked" : ""}></label>
      <label class="overlay-select-row" for="dbgThreeForceMaterialAuditLog">Force material audit log <input id="dbgThreeForceMaterialAuditLog" type="checkbox"${threeMaterials.forceAuditLog === true ? " checked" : ""}></label>
      <label class="overlay-select-row" for="dbgRedMeteorTexturesEnabled">Meteor PNG textures RED/YELLOW <input id="dbgRedMeteorTexturesEnabled" type="checkbox"${threeMaterials.meteorPngTexturesEnabled !== false && threeMaterials.redMeteorTexturesEnabled !== false ? " checked" : ""}></label>
    `, { open: false }));

    sections.push(renderSection("world-mechanics", "World / Mechanics", [
      ["meteors", rendererDiag?.threeMeteorCount ?? 0],
      ["asteroids", wc.asteroids ?? 0],
      ["asteroid mass", `${wc.asteroidMassTotal ?? 0} total / ${wc.asteroidMassMax ?? 0} max`],
      ["target mass → planet", wc.asteroidTargetMassToPlanet ?? thr.asteroidToPlanet?.current ?? 0],
      ["planets", `${wc.rockyPlanets ?? 0} rocky / ${wc.gasPlanets ?? 0} gas`],
      ["stars", wc.stars ?? 0],
      ["A→P mass threshold", `${thr.asteroidToPlanet?.current ?? 0} (${thr.asteroidToPlanet?.source || "-"})`],
      ["P→S threshold", `${thr.planetToStar?.current ?? 0} (${thr.planetToStar?.source || "-"})`],
    ], "", { open: false }));

    sections.push(renderSection("cards-sequence-economy", "Cards / Sequence / Economy", [
      ["RP", snap.economy?.rp ?? 0],
      ["active sequence", seq.active ? `${seq.stage || "ACTIVE"} ${seq.track || ""}` : "no"],
      ["expected color", seq.expectedColor || "null"],
      ["hit count", seq.hitCount ?? 0],
      ["cards R1 DR", `${cards.R1_DR_RED || 0}/${cards.R1_DR_YELLOW || 0}/${cards.R1_DR_GREEN || 0}/${cards.R1_DR_BLUE || 0}`],
      ["cards DS DR", `${cards.DS_DR_RED || 0}/${cards.DS_DR_YELLOW || 0}/${cards.DS_DR_GREEN || 0}/${cards.DS_DR_BLUE || 0}`],
      ["last sequence event", summarizeEvent(snap.lastByCategory?.sequence)],
      ["last RP event", summarizeEvent(snap.lastByCategory?.rp)],
    ], `
      <div class="overlay-actions">
        <button class="overlay-btn" type="button" data-debug-cards-preset>Preset: karty ×13 + 500 RP</button>
      </div>
    `, { open: false }));

    const hudTopLayout = window.HC?.HudTopLayout;
    if (hudTopLayout?.renderDebugHtml) {
      sections.push(hudTopLayout.renderDebugHtml({
        open: isRuntimeDebugSectionOpen("hud-top-layout", true),
      }));
    } else if (!warnedMissingHudTopLayout) {
      warnedMissingHudTopLayout = true;
      console.warn("[HC Runtime Debug] hc.hud_top_layout.js is unavailable; window.HC.HudTopLayout was not found.");
    }

    const subMetaPngLayout = window.HC?.SubMetaPngLayout;
    let subMetaPngDebugHtml = "";
    if (subMetaPngLayout?.renderDebugHtml) {
      subMetaPngDebugHtml = subMetaPngLayout.renderDebugHtml({
        open: isRuntimeDebugSectionOpen("submeta-png-layout", true),
      });
    } else {
      if (!warnedMissingSubMetaPngLayout) {
        warnedMissingSubMetaPngLayout = true;
        console.warn("[HC Runtime Debug] hc.submeta_png.js is unavailable; window.HC.SubMetaPngLayout was not found.");
      }
      subMetaPngDebugHtml = `
        <div class="submeta-png-debug submeta-png-debug-missing">
          <h5>SUB-META PNG Layout</h5>
          <div class="overlay-grid">
            <div class="overlay-row"><span class="k">module loaded</span><span class="v">no</span></div>
            <div class="overlay-row"><span class="k">status</span><span class="v">hc.submeta_png.js unavailable</span></div>
          </div>
        </div>`;
    }

    const subMetaPlaceholders = window.HC?.SubMetaPlaceholders;
    let subMetaPlaceholderDebugHtml = "";
    if (subMetaPlaceholders?.renderDebugHtml) {
      subMetaPlaceholderDebugHtml = subMetaPlaceholders.renderDebugHtml({
        open: isRuntimeDebugSectionOpen("submeta-placeholders", true),
      });
    } else if (!warnedMissingSubMetaPlaceholders) {
      warnedMissingSubMetaPlaceholders = true;
      console.warn("[HC Runtime Debug] hc.submeta_placeholders.js is unavailable; window.HC.SubMetaPlaceholders was not found.");
    }

    const subMetaPanels = window.HC?.SubMetaPanels;
    let subMetaPanelsDebugHtml = "";
    if (subMetaPanels?.renderDebugHtml) {
      subMetaPanelsDebugHtml = subMetaPanels.renderDebugHtml({
        open: isRuntimeDebugSectionOpen("submeta-panels", true),
      });
    } else if (!warnedMissingSubMetaPanels) {
      warnedMissingSubMetaPanels = true;
      console.warn("[HC Runtime Debug] hc.submeta_panels.js is unavailable; window.HC.SubMetaPanels was not found.");
    }

    sections.push(renderSection("submeta-prg", "SUB-META / PRG", [
      ["status", "PNG overlay + gameplay placeholders + working panel layout"],
      ["SUB-META events", "opened, closed, slot_*, card_*, inventory_changed, prg_binding_changed, purchase, error"],
      ["snapshot policy", "full snapshot on open/close/finalize/force evidence only"],
    ], "", { open: true, extra: subMetaPngDebugHtml + subMetaPlaceholderDebugHtml + subMetaPanelsDebugHtml }));

    sections.push(renderSection("logging-evidence", "Logging / Evidence", [
      ["logging mode", snap.loggingMode || "compact"],
      ["heartbeat interval", `${snap.heartbeatIntervalMs || 5000} ms`],
      ["compact/verbose", snap.verboseDiagnostics ? "verbose" : "compact"],
      ["buffer", snap.pendingLogBufferSize ?? 0],
      ["events/heartbeats", `${loggingCounters.events ?? 0}/${loggingCounters.heartbeats ?? 0}`],
      ["full/compact snapshots", `${loggingCounters.fullSnapshots ?? 0}/${loggingCounters.compactSnapshots ?? 0}`],
      ["suppressed", loggingCounters.suppressed ?? 0],
      ["backend", ls.mode || "-"],
      ["files", ls.filesSavedTo || fs.filesSavedTo || "fallback/localStorage"],
    ], `
      <label class="overlay-select-row" for="dbgVerboseDiagnostics">Verbose diagnostics
        <input id="dbgVerboseDiagnostics" type="checkbox"${snap.verboseDiagnostics ? " checked" : ""}>
      </label>
      <label class="overlay-select-row" for="dbgHeartbeatIntervalMs">Heartbeat interval
        <input id="dbgHeartbeatIntervalMs" type="range" min="1000" max="30000" step="1000" value="${snap.heartbeatIntervalMs || 5000}">
        <span id="dbgHeartbeatIntervalMsValue">${snap.heartbeatIntervalMs || 5000} ms</span>
      </label>
      <button id="dbgForceFullDiagnostics" type="button">Force full diagnostics</button>
    `, { open: true }));

    if (!compact) {
      sections.push(`
        <section class="overlay-section overlay-expanded-only">
          <h4>${t("overlay.section.tail")}</h4>
          <ul class="overlay-tail">
            ${recent.reverse().map((e) => `<li>[${fmtMs(e.sessionTimeMs)}] ${e.type}</li>`).join("") || "<li>—</li>"}
          </ul>
        </section>
      `);
    }
    return `${tabsHtml}${sections.join("")}`;
  }
})();
