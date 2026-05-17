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
  let runtimeDebugOverlay = null;
  let runtimeDebugOverlayBody = null;
  let btnDebugOverlayToggle = null;
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

  function applyHudSvgSkin() {
    // Legacy style_correction SVG HUD skins are disabled; keep readable DOM fallback until FrameComposer/HUD kit lands.
    const skinMap = [
      { el: scoreLabel, text: null },
      { el: btnSubMeta, text: "SUB-META" },
      { el: btnRestart, text: "Wróć" }
    ];
    skinMap.forEach((entry) => {
      const el = entry.el;
      if (!el) return;
      el.style.backgroundImage = "none";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundColor = "rgba(6,10,16,0.35)";
      el.style.border = "1px solid rgba(180,210,255,0.35)";
      el.style.borderRadius = "10px";
      el.style.minHeight = "30px";
      el.style.padding = "6px 12px";
      if (entry.text) el.textContent = entry.text;
    });
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
      if (runtimeDebugOverlayBody) {
        runtimeDebugOverlayBody.addEventListener("click", (event) => {
          const tabBtn = event.target && event.target.closest ? event.target.closest("[data-debug-tab]") : null;
          if (!tabBtn) return;
          runtimeOverlayTab = tabBtn.getAttribute("data-debug-tab") === "prg" ? "prg" : "session";
        });
        runtimeDebugOverlayBody.addEventListener("change", (event) => {
          const target = event.target;
          const cfg = window.HC?.Session?.debugConfig?.visual?.prgFrameProbe;
          if (!cfg || !target || !target.id) return;
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
        });
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
        btnDebugOverlayToggle.addEventListener("click", () => {
          runtimeOverlayCompact = !runtimeOverlayCompact;
          if (runtimeDebugOverlay) runtimeDebugOverlay.classList.toggle("compact", runtimeOverlayCompact);
          btnDebugOverlayToggle.textContent = runtimeOverlayCompact ? t("overlay.expand") : t("overlay.compact");
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
        </div>
        <div class="overlay-grid">${renderRows([
          ["Renderer requested", rendererDiag?.requestedMode || "canvas2d"],
          ["Renderer effective", rendererDiag?.effectiveMode || "canvas2d"],
          ["Renderer fallback", rendererDiag?.fallbackReason || "none"],
          ["Three dependency", rendererDiag?.hasThreeDependency ? "yes" : "no"],
          ["Three initialized", rendererDiag?.threeInitialized ? "yes" : "no"],
          ["Three canvas", rendererDiag?.threeCanvasPresent ? "yes" : "no"],
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
