// HC UI/debug glue (extracted)
(function () {
  window.HC = window.HC || {};

  let fpsLabel = null;
  let btnRestart = null;
  let btnSubMeta = null;
  let hudLogo = null;
  let hudSubMetaImage = null;
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
      const valueEl = scoreLabel.querySelector(".rp-value");
      const scoreText = String(Math.max(0, Math.floor(Number(World.score || 0))));
      if (valueEl) valueEl.textContent = scoreText;
      else scoreLabel.textContent = scoreText;
      scoreLabel.setAttribute("aria-label", `Punkty Rezonansu: ${scoreText}`);
    }
  }

  function resolvePublicAssetPath(path) {
    if (window.HC && typeof window.HC.publicAssetPath === "function") return window.HC.publicAssetPath(path);
    if (window.HC && typeof window.HC.publicPath === "function") return window.HC.publicPath(path);
    return String(path || "").replace(/^\/+/, "");
  }

  function applyHudRasterAssets() {
    const logoUrl = resolvePublicAssetPath("png/hud_haiku_cosmos_logo.png");
    const subMetaUrl = resolvePublicAssetPath("png/hud_submeta_top.png");
    const rpUrl = resolvePublicAssetPath("png/hud_rp.png");
    if (hudLogo) hudLogo.src = logoUrl;
    if (hudSubMetaImage) hudSubMetaImage.src = subMetaUrl;
    if (scoreLabel) scoreLabel.style.backgroundImage = `url("${rpUrl}")`;
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
    el.innerHTML = '<span class="rp-value">0</span>';
    if (!existing) topBar.appendChild(el);
    return el;
  }

  function applyHudSvgSkin() {
    // Legacy SVG/text HUD skins are intentionally disabled for the raster HUD pass.
    if (btnRestart) btnRestart.textContent = "Restart";
    applyHudRasterAssets();
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
    return scale;
  }


  function getMeteorGlbDepthScaleForUi() {
    if (window.HC?.WorldRenderer?.getMeteorGlbDepthScale) return window.HC.WorldRenderer.getMeteorGlbDepthScale();
    const n = Number(window.HC?.WorldRendererDebug?.meteorGlbDepthScale ?? window.HC?.Session?.debugConfig?.visual?.meteorGlbDepthScale);
    if (!Number.isFinite(n)) return 1.0;
    return Math.max(0.25, Math.min(3.0, n));
  }

  function setMeteorGlbDepthScaleFromUi(value) {
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
    return scale;
  }

  function getThreeCameraModelForUi() {
    if (window.HC?.WorldRenderer?.getThreeCameraModel) return window.HC.WorldRenderer.getThreeCameraModel();
    const model = String(window.HC?.WorldRendererDebug?.cameraModel || window.HC?.Session?.debugConfig?.visual?.cameraModel || "absolute_bounds");
    return model === "stage_normalized" ? model : "absolute_bounds";
  }

  function setThreeCameraModelFromUi(value) {
    const model = window.HC?.WorldRenderer?.setThreeCameraModel
      ? window.HC.WorldRenderer.setThreeCameraModel(value)
      : (String(value) === "stage_normalized" ? "stage_normalized" : "absolute_bounds");
    window.HC = window.HC || {};
    window.HC.WorldRendererDebug = window.HC.WorldRendererDebug || {};
    window.HC.WorldRendererDebug.cameraModel = model;
    if (window.HC.Session?.debugConfig?.visual) window.HC.Session.debugConfig.visual.cameraModel = model;
    const input = document.getElementById("dbgThreeCameraModel");
    if (input && input.value !== model) input.value = model;
    return model;
  }


  function emitThreeDebugControlEvent(type, payload) {
    if (!window.HC?.Session?.started || typeof window.HC.Session.emit !== "function") return;
    window.HC.Session.emit("debug", type, Object.assign({ source: "ui_debug" }, payload || {}), {
      source: "ui_debug",
      snapshot: true,
    });
  }

  function normalizeDebugControlValue(value) {
    if (typeof value === "number" || typeof value === "boolean" || value == null) return value;
    const n = Number(value);
    return Number.isFinite(n) && String(value).trim() !== "" ? n : String(value);
  }

  function getThreeLightsSettingsForUi() {
    if (window.HC?.WorldRenderer?.getThreeLightsSettings) return window.HC.WorldRenderer.getThreeLightsSettings();
    const defaults = { enabled: true, legacyCornerLightsEnabled: false, pointIntensity: 0.9, distanceMultiplier: 1.55, zOffsetMultiplier: 0.45, ambientIntensity: 0, ambientIsolate: false, debugKeyLightEnabled: false, debugKeyLightIntensity: 2.2, debugRimLightEnabled: false, debugRimLightIntensity: 0.65, forceHeadlightEnabled: false, forceHeadlightIntensity: 4.5, mainStageSpotEnabled: true, mainStageSpotIntensity: 6.5, mainStageSpotAngle: Math.PI / 2.8, mainStageSpotPenumbra: 0.72, mainStageSpotDistance: 0, mainStageSpotDecay: 0, mainStageSpotXOffset: -0.65, mainStageSpotYOffset: -0.55, mainStageSpotZHeight: 1.55, mainStageSpotTargetMode: "center", showLightHelpers: false };
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
      pointIntensity: "dbgThreeLightIntensityValue",
      distanceMultiplier: "dbgThreeLightDistanceValue",
      zOffsetMultiplier: "dbgThreeLightZValue",
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
      pointIntensity: "dbgThreeLightIntensity",
      distanceMultiplier: "dbgThreeLightDistance",
      zOffsetMultiplier: "dbgThreeLightZ",
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
    const defaults = { enabled: false, envIntensity: 0.38, toneExposure: 1.0, forceAuditLog: false, materialMode: "imported", redMeteorTexturesEnabled: true };
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
      btnSubMeta = document.getElementById("btnSubMeta");
      hudLogo = document.getElementById("hudLogo");
      hudSubMetaImage = document.getElementById("hudSubMetaImage");
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
        runtimeDebugOverlayBody.addEventListener("click", (event) => {
          const tabBtn = event.target && event.target.closest ? event.target.closest("[data-debug-tab]") : null;
          if (!tabBtn) return;
          runtimeOverlayTab = tabBtn.getAttribute("data-debug-tab") === "prg" ? "prg" : "session";
        });
        const handleRuntimeDebugControl = (event) => {
          const target = event.target;
          if (!target || !target.id) return;
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
          const threeLightControls = {
            dbgThreeLightsEnabled: "enabled",
            dbgThreeLightIntensity: "pointIntensity",
            dbgThreeLightDistance: "distanceMultiplier",
            dbgThreeLightZ: "zOffsetMultiplier",
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
            dbgThreeLegacyCornerLightsEnabled: "legacyCornerLightsEnabled",
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
            dbgRedMeteorTexturesEnabled: "redMeteorTexturesEnabled",
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
          if (target.id === "dbgRendererMode") {
            const nextMode = target.value === "three" ? "three" : "canvas2d";
            window.HC = window.HC || {};
            window.HC.RENDER_MODE = nextMode;
            if (window.HC.WorldRenderer && typeof window.HC.WorldRenderer.setMode === "function") {
              window.HC.WorldRenderer.setMode(nextMode);
            }
          }
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
      applyHudSvgSkin();

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
      if (runtimeDebugOverlay) runtimeDebugOverlay.classList.toggle("compact", runtimeOverlayCompact);
      updateRuntimeOverlayCollapseUi();
      updateScoreLabel(World, true);
    },
    applySessionMode(mode) {
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
    return rows.map((row) => `<div class="overlay-row"><span class="k">${row[0]}</span><span class="v">${row[1]}</span></div>`).join("");
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
          <h4>PRG frame</h4>
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
    const requestedMode = rendererDiag?.requestedMode || window.HC?.RENDER_MODE || "canvas2d";
    const modeOptions = [
      `<option value="canvas2d"${requestedMode === "canvas2d" ? " selected" : ""}>canvas2d</option>`,
      `<option value="three"${requestedMode === "three" ? " selected" : ""}>three</option>`,
    ].join("");
    const threeLights = getThreeLightsSettingsForUi();
    const threeMaterials = getThreeMaterialSettingsForUi();
    const materialModeOptions = ["imported", "standard_test", "clay_lit", "normal_debug", "diagnostic_unlit"].map((mode) =>
      `<option value="${mode}"${threeMaterials.materialMode === mode ? " selected" : ""}>${mode}</option>`
    ).join("");

    sections.push(`
      <section class="overlay-section">
        <h4>${t("overlay.section.session")}</h4>
        <div class="overlay-grid">${renderRows([
          ["mode", snap.mode || "-"],
          ["sessionId", snap.sessionId || "-"],
          ["time", fmtMs(snap.sessionTimeMs)],
          ["frame", snap.frame ?? 0],
          ["logging", snap.loggingEnabled ? t("overlay.loggingOn") : t("overlay.loggingOff")],
          ["log status", fs.status || "idle"],
          ["backend", ls.mode || "-"],
          ["scenario", snap.scenarioLabel || "-"],
          ["buffer", snap.pendingLogBufferSize ?? 0],
        ])}</div>
        <div class="overlay-grid">
          <label class="overlay-select-row" for="dbgRendererMode">Renderer: canvas2d / three <select id="dbgRendererMode">${modeOptions}</select></label>
          <label class="overlay-select-row" for="dbgMeteorGlbScale">GLB meteor XY/uniform scale
            <input id="dbgMeteorGlbScale" type="range" min="0.25" max="4" step="0.05" value="${getMeteorGlbVisualScaleForUi()}">
            <span id="dbgMeteorGlbScaleValue">${getMeteorGlbVisualScaleForUi().toFixed(2)}</span>
          </label>
          <label class="overlay-select-row" for="dbgMeteorGlbDepthScale">GLB depth scale Z
            <input id="dbgMeteorGlbDepthScale" type="range" min="0.25" max="3" step="0.05" value="${getMeteorGlbDepthScaleForUi()}">
            <span id="dbgMeteorGlbDepthScaleValue">${getMeteorGlbDepthScaleForUi().toFixed(2)}</span>
          </label>
          <label class="overlay-select-row" for="dbgThreeCameraModel">Camera model
            <select id="dbgThreeCameraModel">
              <option value="absolute_bounds"${getThreeCameraModelForUi() === "absolute_bounds" ? " selected" : ""}>absolute_bounds (legacy comparison)</option>
              <option value="stage_normalized"${getThreeCameraModelForUi() === "stage_normalized" ? " selected" : ""}>stage_normalized (recommended GLB)</option>
            </select>
          </label>
        </div>
        <details class="overlay-collapsible" id="dbgThreeLightingPanel">
          <summary>Three lighting / Stage light</summary>
          <div class="overlay-grid">
            <label class="overlay-select-row" for="dbgThreeLightsEnabled">Three lighting enabled
              <input id="dbgThreeLightsEnabled" type="checkbox"${threeLights.enabled !== false ? " checked" : ""}>
            </label>
            <label class="overlay-select-row" for="dbgThreeMainStageSpotEnabled">Main stage SpotLight
              <input id="dbgThreeMainStageSpotEnabled" type="checkbox"${threeLights.mainStageSpotEnabled !== false ? " checked" : ""}>
            </label>
            <label class="overlay-select-row" for="dbgThreeMainStageSpotIntensity">Spot intensity
              <input id="dbgThreeMainStageSpotIntensity" type="range" min="0" max="25" step="0.1" value="${threeLights.mainStageSpotIntensity}">
              <span id="dbgThreeMainStageSpotIntensityValue">${Number(threeLights.mainStageSpotIntensity).toFixed(1)}</span>
            </label>
            <label class="overlay-select-row" for="dbgThreeMainStageSpotAngle">Spot angle
              <input id="dbgThreeMainStageSpotAngle" type="range" min="${Math.PI / 24}" max="${Math.PI / 2}" step="0.01" value="${threeLights.mainStageSpotAngle}">
              <span id="dbgThreeMainStageSpotAngleValue">${Number(threeLights.mainStageSpotAngle).toFixed(2)}</span>
            </label>
            <label class="overlay-select-row" for="dbgThreeMainStageSpotPenumbra">Spot penumbra
              <input id="dbgThreeMainStageSpotPenumbra" type="range" min="0" max="1" step="0.01" value="${threeLights.mainStageSpotPenumbra}">
              <span id="dbgThreeMainStageSpotPenumbraValue">${Number(threeLights.mainStageSpotPenumbra).toFixed(2)}</span>
            </label>
            <label class="overlay-select-row" for="dbgThreeAmbient">Ambient fill only
              <input id="dbgThreeAmbient" type="range" min="0" max="0.75" step="0.01" value="${threeLights.ambientIntensity}">
              <span id="dbgThreeAmbientValue">${Number(threeLights.ambientIntensity).toFixed(2)}</span>
            </label>
            <label class="overlay-select-row" for="dbgThreeShowLightHelpers">Helpers
              <input id="dbgThreeShowLightHelpers" type="checkbox"${threeLights.showLightHelpers === true ? " checked" : ""}>
            </label>
          </div>
          <details class="overlay-collapsible overlay-collapsible-nested" id="dbgThreeLightingAdvanced">
            <summary>Advanced debug / legacy corner lights</summary>
            <div class="overlay-grid">
              <label class="overlay-select-row" for="dbgThreeMainStageSpotXOffset">Spot X offset x stageWidth
                <input id="dbgThreeMainStageSpotXOffset" type="range" min="-2" max="2" step="0.01" value="${threeLights.mainStageSpotXOffset}">
                <span id="dbgThreeMainStageSpotXOffsetValue">${Number(threeLights.mainStageSpotXOffset).toFixed(2)}</span>
              </label>
              <label class="overlay-select-row" for="dbgThreeMainStageSpotYOffset">Spot Y offset x stageHeight
                <input id="dbgThreeMainStageSpotYOffset" type="range" min="-2" max="2" step="0.01" value="${threeLights.mainStageSpotYOffset}">
                <span id="dbgThreeMainStageSpotYOffsetValue">${Number(threeLights.mainStageSpotYOffset).toFixed(2)}</span>
              </label>
              <label class="overlay-select-row" for="dbgThreeMainStageSpotZHeight">Spot Z x stageHeight
                <input id="dbgThreeMainStageSpotZHeight" type="range" min="0.25" max="4" step="0.05" value="${threeLights.mainStageSpotZHeight}">
                <span id="dbgThreeMainStageSpotZHeightValue">${Number(threeLights.mainStageSpotZHeight).toFixed(2)}</span>
              </label>
              <label class="overlay-select-row" for="dbgThreeMainStageSpotTargetMode">Spot target
                <select id="dbgThreeMainStageSpotTargetMode">
                  <option value="center"${threeLights.mainStageSpotTargetMode === "center" ? " selected" : ""}>center</option>
                  <option value="sampleObject"${threeLights.mainStageSpotTargetMode === "sampleObject" ? " selected" : ""}>sampleObject</option>
                </select>
              </label>
              <label class="overlay-select-row" for="dbgThreeLegacyCornerLightsEnabled">Legacy corner lights enabled
                <input id="dbgThreeLegacyCornerLightsEnabled" type="checkbox"${threeLights.legacyCornerLightsEnabled === true ? " checked" : ""}>
              </label>
              <label class="overlay-select-row" for="dbgThreeLightIntensity">Legacy corner intensity
                <input id="dbgThreeLightIntensity" type="range" min="0" max="2.5" step="0.05" value="${threeLights.pointIntensity}">
                <span id="dbgThreeLightIntensityValue">${Number(threeLights.pointIntensity).toFixed(2)}</span>
              </label>
              <label class="overlay-select-row" for="dbgThreeLightDistance">Legacy range x view
                <input id="dbgThreeLightDistance" type="range" min="0.25" max="4" step="0.05" value="${threeLights.distanceMultiplier}">
                <span id="dbgThreeLightDistanceValue">${Number(threeLights.distanceMultiplier).toFixed(2)}</span>
              </label>
              <label class="overlay-select-row" for="dbgThreeLightZ">Legacy Z x height
                <input id="dbgThreeLightZ" type="range" min="0.05" max="2" step="0.05" value="${threeLights.zOffsetMultiplier}">
                <span id="dbgThreeLightZValue">${Number(threeLights.zOffsetMultiplier).toFixed(2)}</span>
              </label>
              <label class="overlay-select-row" for="dbgThreeAmbientIsolate">Ambient fill = 0 quick test
                <input id="dbgThreeAmbientIsolate" type="checkbox"${threeLights.ambientIsolate === true ? " checked" : ""}>
              </label>
              <label class="overlay-select-row" for="dbgThreeDebugKeyEnabled">Debug key light enabled
                <input id="dbgThreeDebugKeyEnabled" type="checkbox"${threeLights.debugKeyLightEnabled === true ? " checked" : ""}>
              </label>
              <label class="overlay-select-row" for="dbgThreeDebugKeyIntensity">Debug key intensity
                <input id="dbgThreeDebugKeyIntensity" type="range" min="0" max="5" step="0.05" value="${threeLights.debugKeyLightIntensity}">
                <span id="dbgThreeDebugKeyIntensityValue">${Number(threeLights.debugKeyLightIntensity).toFixed(2)}</span>
              </label>
              <label class="overlay-select-row" for="dbgThreeDebugRimEnabled">Debug rim light enabled
                <input id="dbgThreeDebugRimEnabled" type="checkbox"${threeLights.debugRimLightEnabled !== false ? " checked" : ""}>
              </label>
              <label class="overlay-select-row" for="dbgThreeDebugRimIntensity">Debug rim intensity
                <input id="dbgThreeDebugRimIntensity" type="range" min="0" max="2.5" step="0.05" value="${threeLights.debugRimLightIntensity}">
                <span id="dbgThreeDebugRimIntensityValue">${Number(threeLights.debugRimLightIntensity).toFixed(2)}</span>
              </label>
              <label class="overlay-select-row" for="dbgThreeForceHeadlightEnabled">Force headlight
                <input id="dbgThreeForceHeadlightEnabled" type="checkbox"${threeLights.forceHeadlightEnabled === true ? " checked" : ""}>
              </label>
              <label class="overlay-select-row" for="dbgThreeForceHeadlightIntensity">Force headlight intensity
                <input id="dbgThreeForceHeadlightIntensity" type="range" min="0" max="8" step="0.05" value="${threeLights.forceHeadlightIntensity}">
                <span id="dbgThreeForceHeadlightIntensityValue">${Number(threeLights.forceHeadlightIntensity).toFixed(2)}</span>
              </label>
              <label class="overlay-select-row" for="dbgThreeMainStageSpotDistance">Spot distance
                <input id="dbgThreeMainStageSpotDistance" type="range" min="0" max="5000" step="25" value="${threeLights.mainStageSpotDistance}">
                <span id="dbgThreeMainStageSpotDistanceValue">${Number(threeLights.mainStageSpotDistance).toFixed(0)}</span>
              </label>
              <label class="overlay-select-row" for="dbgThreeMainStageSpotDecay">Spot decay
                <input id="dbgThreeMainStageSpotDecay" type="range" min="0" max="3" step="0.05" value="${threeLights.mainStageSpotDecay}">
                <span id="dbgThreeMainStageSpotDecayValue">${Number(threeLights.mainStageSpotDecay).toFixed(2)}</span>
              </label>
            </div>
          </details>
        </details>
        <div class="overlay-grid">
          <label class="overlay-select-row" for="dbgThreeMaterialDebugEnabled">Material debug log
            <input id="dbgThreeMaterialDebugEnabled" type="checkbox"${threeMaterials.enabled === true ? " checked" : ""}>
          </label>
          <label class="overlay-select-row" for="dbgThreeEnvIntensity">PBR env intensity
            <input id="dbgThreeEnvIntensity" type="range" min="0" max="1.5" step="0.01" value="${threeMaterials.envIntensity}">
            <span id="dbgThreeEnvIntensityValue">${Number(threeMaterials.envIntensity).toFixed(2)}</span>
          </label>
          <label class="overlay-select-row" for="dbgThreeToneExposure">Tone exposure
            <input id="dbgThreeToneExposure" type="range" min="0.5" max="1.8" step="0.01" value="${threeMaterials.toneExposure}">
            <span id="dbgThreeToneExposureValue">${Number(threeMaterials.toneExposure).toFixed(2)}</span>
          </label>
          <label class="overlay-select-row" for="dbgThreeForceMaterialAuditLog">Force material audit log
            <input id="dbgThreeForceMaterialAuditLog" type="checkbox"${threeMaterials.forceAuditLog === true ? " checked" : ""}>
          </label>
          <label class="overlay-select-row" for="dbgThreeMaterialMode">Material mode
            <select id="dbgThreeMaterialMode">${materialModeOptions}</select>
          </label>
          <label class="overlay-select-row" for="dbgRedMeteorTexturesEnabled">Red meteor textures enabled
            <input id="dbgRedMeteorTexturesEnabled" type="checkbox"${threeMaterials.redMeteorTexturesEnabled !== false ? " checked" : ""}>
          </label>
        </div>
        <div class="overlay-grid">${renderRows([
          ["Renderer requested", rendererDiag?.requestedMode || "canvas2d"],
          ["Renderer effective", rendererDiag?.effectiveMode || "canvas2d"],
          ["Renderer fallback", rendererDiag?.fallbackReason || "none"],
          ["Three dependency", rendererDiag?.hasThreeDependency ? "yes" : "no"],
          ["Three bridge version", String(rendererDiag?.threeBridgeVersion || "bridge_missing")],
          ["Three module URL", String(rendererDiag?.threeModuleUrl || "bridge_missing")],
          ["Three vendor URLs", Array.isArray(rendererDiag?.threeVendorUrls) && rendererDiag.threeVendorUrls.length ? rendererDiag.threeVendorUrls.join("\n") : "bridge_missing"],
          ["Three load status", rendererDiag?.threeBridgeVersion ? (rendererDiag?.threeLoadStatus || "unknown") : "bridge_missing"],
          ["Three source", rendererDiag?.threeSource || "unknown"],
          ["Three dependency source", rendererDiag?.threeDependencySource || "unknown"],
          ["Three load error", String(rendererDiag?.threeLoadError || "none")],
          ["Three initialized", rendererDiag?.threeInitialized ? "yes" : "no"],
          ["Three canvas", rendererDiag?.threeCanvasPresent ? "yes" : "no"],
          ["Three visible", rendererDiag?.threeCanvasVisible ? "yes" : "no"],
          ["Canvas layer mode", rendererDiag?.canvasLayerMode || "canvas2d"],
          ["Game canvas opacity/z", `${rendererDiag?.gameCanvasOpacity ?? "-"} / ${rendererDiag?.gameCanvasZIndex ?? "-"}`],
          ["Three canvas opacity/z", `${rendererDiag?.threeCanvasOpacity ?? "-"} / ${rendererDiag?.threeCanvasZIndex ?? "-"}`],
          ["Game canvas background", rendererDiag?.gameCanvasBackground || "-"],
          ["Layer probe center top", rendererDiag?.layerProbe ? `${rendererDiag.layerProbe.elementFromPointAtCenterTag || "-"}#${rendererDiag.layerProbe.elementFromPointAtCenterId || ""}` : "none"],
          ["Three meteors", rendererDiag?.threeMeteorCount ?? 0],
          ["Three meteor meshes", rendererDiag?.threeMeteorMeshes ?? 0],
          ["Three asteroids", rendererDiag?.threeAsteroidCount ?? 0],
          ["Three asteroid meshes", rendererDiag?.threeAsteroidMeshes ?? rendererDiag?.asteroidMeshCount ?? 0],
          ["Three asteroid pass error", String(rendererDiag?.threeAsteroidLastError || "none")],
          ["Three radius scale", rendererDiag?.threeMeteorRadiusScale ?? "-"],
          ["GLB meteor scale", rendererDiag?.meteorGlbVisualScale ?? getMeteorGlbVisualScaleForUi()],
          ["GLB depth scale Z", rendererDiag?.meteorGlbDepthScale ?? getMeteorGlbDepthScaleForUi()],
          ["GLB scale warning", rendererDiag?.glbScaleWarning || rendererDiag?.firstMeteorMesh?.warning || "none"],
          ["Three lights", rendererDiag?.threeLights ? JSON.stringify(rendererDiag.threeLights) : JSON.stringify(threeLights)],
          ["Light range/distance diag", rendererDiag?.threeLightDiagnostics ? JSON.stringify(rendererDiag.threeLightDiagnostics) : "none"],
          ["Main stage SpotLight", rendererDiag?.mainStageSpot ? JSON.stringify(rendererDiag.mainStageSpot) : (rendererDiag?.debugSpotLight ? JSON.stringify(rendererDiag.debugSpotLight) : "none")],
          ["Spot sample projected", rendererDiag?.threeLightDiagnostics?.sampleObjectProjected ? JSON.stringify(rendererDiag.threeLightDiagnostics.sampleObjectProjected) : "none"],
          ["Spot sample frustum", rendererDiag?.threeLightDiagnostics?.sampleObjectFrustumVisible == null ? "n/a" : String(rendererDiag.threeLightDiagnostics.sampleObjectFrustumVisible)],
          ["Light helpers", rendererDiag?.threeLightHelpers ? JSON.stringify(rendererDiag.threeLightHelpers) : "none"],
          ["Helper mode", rendererDiag?.threeLightHelpers?.mode || "none"],
          ["Helpers count", rendererDiag?.threeLightHelpers?.count ?? 0],
          ["Helpers visible", rendererDiag?.threeLightHelpers?.visible ? "true" : "false"],
          ["Three material settings", rendererDiag?.threeMaterialSettings ? JSON.stringify(rendererDiag.threeMaterialSettings) : JSON.stringify(threeMaterials)],
          ["Red texture palette", rendererDiag?.redMeteorTexturePaletteEnabled ? "enabled" : "disabled"],
          ["Red texture cache", rendererDiag?.redMeteorTextureCacheStats ? JSON.stringify(rendererDiag.redMeteorTextureCacheStats) : "none"],
          ["Red texture usage", rendererDiag?.redMeteorTextureUsage ? JSON.stringify(rendererDiag.redMeteorTextureUsage) : "none"],
          ["Red texture warnings", rendererDiag?.redMeteorTextureWarnings ?? 0],
          ["Material override", rendererDiag?.threeMaterialOverrideStatus ? JSON.stringify(rendererDiag.threeMaterialOverrideStatus) : "none"],
          ["Scene environment", rendererDiag?.sceneEnvironmentEnabled ? "enabled" : "off"],
          ["Tone mapping/exposure", `${rendererDiag?.rendererToneMapping ?? "-"} / ${rendererDiag?.rendererToneMappingExposure ?? "-"}`],
          ["GLB material audit status", rendererDiag?.glbMaterialAuditStatus ? JSON.stringify(rendererDiag.glbMaterialAuditStatus) : "audit idle"],
          ["GLB material audit", rendererDiag?.glbMaterialAudit ? JSON.stringify(rendererDiag.glbMaterialAudit.slice(-3)) : "[]"],
          ["Legacy corner lights", rendererDiag?.legacyCornerLights ? JSON.stringify(rendererDiag.legacyCornerLights) : (rendererDiag?.threeLightCount ?? 0)],
          ["Three light positions", rendererDiag?.threeLightPositions ? JSON.stringify(rendererDiag.threeLightPositions) : "none"],
          ["Active GLB objects", rendererDiag?.threeMaterialOverrideStatus?.activeGlbObjects ?? rendererDiag?.activeGlbInstances ?? 0],
          ["Active GLB mesh count", rendererDiag?.threeMaterialOverrideStatus?.activeGlbMeshCount ?? 0],
          ["Meshes using material mode", rendererDiag?.threeMaterialOverrideStatus?.meshesUsingCurrentMaterialMode ?? 0],
          ["Current material mode", rendererDiag?.threeMaterialOverrideStatus?.currentMaterialMode || threeMaterials.materialMode || "imported"],
          ["Material applied frame/time", rendererDiag?.threeMaterialOverrideStatus ? `${rendererDiag.threeMaterialOverrideStatus.lastAppliedFrame ?? "-"}/${rendererDiag.threeMaterialOverrideStatus.lastAppliedAtMs ?? "-"}` : "-"],
          ["Restored imported materials", rendererDiag?.threeMaterialOverrideStatus?.restoredImportedMaterials ?? 0],
          ["Active GLB instances", rendererDiag?.activeGlbInstances ?? 0],
          ["Active GLB by color", rendererDiag?.activeGlbInstancesByColor ? JSON.stringify(rendererDiag.activeGlbInstancesByColor) : "-"],
          ["Fallback GLB by color", rendererDiag?.fallbackVisualsByColor ? JSON.stringify(rendererDiag.fallbackVisualsByColor) : "-"],
          ["Three min radius", rendererDiag?.threeMeteorMinRadius ?? "-"],
          ["Three debug marker", rendererDiag?.threeDebugMarker?.visible ? "visible" : (rendererDiag?.threeDebugMarker?.enabled ? "enabled_hidden" : "off")],
          ["First meteor", rendererDiag?.firstMeteor ? JSON.stringify(rendererDiag.firstMeteor) : "none"],
          ["First mesh", rendererDiag?.firstMeteorMesh ? JSON.stringify(rendererDiag.firstMeteorMesh) : "none"],
          ["First meteor screen est", rendererDiag?.firstMeteorScreenEstimate ? JSON.stringify(rendererDiag.firstMeteorScreenEstimate) : "none"],
          ["First meteor in bounds", rendererDiag?.firstMeteorInCameraBounds == null ? "n/a" : (rendererDiag.firstMeteorInCameraBounds ? "true" : "false")],
          ["Camera model", rendererDiag?.threeCameraModel || "unknown"],
          ["Stage model enabled", rendererDiag?.stageModelEnabled ? "true" : "false"],
          ["Stage settings", rendererDiag?.stageSettings ? JSON.stringify(rendererDiag.stageSettings) : "none"],
          ["Camera snapshot center", rendererDiag?.cameraSnapshotCenter ? JSON.stringify(rendererDiag.cameraSnapshotCenter) : "none"],
          ["Camera snapshot zoom", rendererDiag?.cameraSnapshotZoom ?? "none"],
          ["Camera snapshot bounds", rendererDiag?.cameraSnapshotWorldBounds ? JSON.stringify(rendererDiag.cameraSnapshotWorldBounds) : "none"],
          ["World bounds source", rendererDiag?.worldBoundsSource || "unknown"],
          ["Camera bounds", rendererDiag?.cameraBounds ? JSON.stringify(rendererDiag.cameraBounds) : "none"],
          ["Renderer size", rendererDiag?.rendererSize ? JSON.stringify(rendererDiag.rendererSize) : "none"],
          ["Scene children", rendererDiag?.sceneChildrenCount ?? 0],
          ["Meteor group children", rendererDiag?.meteorGroupChildrenCount ?? 0],
        ])}</div>
      </section>
    `);

    sections.push(`
      <section class="overlay-section">
        <h4>Log files</h4>
        <div class="overlay-grid">${renderRows([
          ["folder", ls.filesSavedTo || fs.filesSavedTo || "-"],
          ["main", ls.mainLog || fs.mainLog || "events.jsonl"],
          ["summary", ls.summary || fs.summary || "summary.json"],
          ["hint", "send events.jsonl for analysis"],
        ])}</div>
      </section>
    `);

    sections.push(`
      <section class="overlay-section">
        <h4>${t("overlay.section.sequence")}</h4>
        <div class="overlay-grid">${renderRows([
          ["active", seq.active ? "yes" : "no"],
          ["stage", seq.stage || "IDLE"],
          ["phase", seq.phase || "null"],
          ["track", seq.track || "null"],
          ["stepIndex", Number.isFinite(seq.stepIndex) ? seq.stepIndex : 0],
          ["current", seq.currentColor || "null"],
          ["expected", seq.expectedColor || "null"],
          ["hitCount", seq.hitCount ?? 0],
          ["chain", Array.isArray(seq.chainColors) ? seq.chainColors.join(",") || "-" : "-"],
          ["loop", seq.loopMode || "null"],
          ["lastRes", seq.lastResolution || "null"],
          ["resLock", seq.resolutionLock ? "on" : "off"],
        ])}</div>
      </section>
    `);

    sections.push(`
      <section class="overlay-section overlay-expanded-only">
        <h4>${t("overlay.section.economy")}</h4>
        <div class="overlay-grid">${renderRows([
          ["RP", snap.economy?.rp ?? 0],
          ["R1 DR", `${cards.R1_DR_RED || 0}/${cards.R1_DR_YELLOW || 0}/${cards.R1_DR_GREEN || 0}/${cards.R1_DR_BLUE || 0}`],
          ["DS DR", `${cards.DS_DR_RED || 0}/${cards.DS_DR_YELLOW || 0}/${cards.DS_DR_GREEN || 0}/${cards.DS_DR_BLUE || 0}`],
          ["R1 sDR", `${cards.R1_SDR_RED || 0}/${cards.R1_SDR_YELLOW || 0}/${cards.R1_SDR_GREEN || 0}/${cards.R1_SDR_BLUE || 0}`],
          ["R1 pDR", `${cards.R1_PDR_RED || 0}/${cards.R1_PDR_YELLOW || 0}/${cards.R1_PDR_GREEN || 0}/${cards.R1_PDR_BLUE || 0}`],
        ])}</div>
      </section>
    `);

    sections.push(`
      <section class="overlay-section">
        <h4>${t("overlay.section.worldThresholds")}</h4>
        <div class="overlay-grid">${renderRows([
          ["asteroids", wc.asteroids ?? 0],
          ["rocky", wc.rockyPlanets ?? 0],
          ["gas", wc.gasPlanets ?? 0],
          ["stars", wc.stars ?? 0],
          ["A→P", `${thr.asteroidToPlanet?.current ?? 0} (${thr.asteroidToPlanet?.source || "-"})`],
          ["P→S", `${thr.planetToStar?.current ?? 0} (${thr.planetToStar?.source || "-"})`],
        ])}</div>
      </section>
    `);

    sections.push(`
      <section class="overlay-section">
        <h4>${t("overlay.section.lastEvents")}</h4>
        <div class="overlay-grid">${renderRows([
          ["sequence", summarizeEvent(snap.lastByCategory?.sequence)],
          ["world", summarizeEvent(snap.lastByCategory?.world)],
          ["reward/rp", summarizeEvent(snap.lastByCategory?.rp)],
        ])}</div>
      </section>
    `);

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
