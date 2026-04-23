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
  let runtimeOverlayCompact = true;
  let runtimeOverlayLastRenderMs = 0;
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
      scenarioLabel: String(document.getElementById("cfgScenarioLabel")?.value || "manual_session").trim() || "manual_session",
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
      runtimeDebugOverlay = document.getElementById("runtimeDebugOverlay");
      runtimeDebugOverlayBody = document.getElementById("runtimeDebugOverlayBody");
      btnDebugOverlayToggle = document.getElementById("btnDebugOverlayToggle");
      btnDebugSelectFolder = document.getElementById("btnDebugSelectFolder");
      btnDebugFinalizeSession = document.getElementById("btnDebugFinalizeSession");
      btnDebugCopyPath = document.getElementById("btnDebugCopyPath");

      if (btnDebugOverlayToggle) {
        btnDebugOverlayToggle.addEventListener("click", () => {
          runtimeOverlayCompact = !runtimeOverlayCompact;
          if (runtimeDebugOverlay) runtimeDebugOverlay.classList.toggle("compact", runtimeOverlayCompact);
          btnDebugOverlayToggle.textContent = runtimeOverlayCompact ? "Expand" : "Compact";
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

      if (runtimeDebugOverlay && !runtimeDebugOverlay.hidden && nowMs - runtimeOverlayLastRenderMs > 120) {
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

  function summarizeEvent(event) {
    if (!event) return "—";
    const payload = event.payload || {};
    const core = payload.sourceId || payload.reason || payload.thresholdType || payload.current || "";
    return `${event.type}${core ? ` · ${core}` : ""}`;
  }

  function renderRuntimeOverlayHtml(snap, compact) {
    if (!snap) return `<div class="overlay-row"><span class="k">status</span><span class="v">no snapshot</span></div>`;
    const seq = snap.sequence || {};
    const cards = snap.economy?.cards || {};
    const wc = snap.worldCounts || {};
    const thr = snap.thresholds || {};
    const ls = snap.loggingStatus || {};
    const fs = snap.finalizeState || {};
    const recent = Array.isArray(snap.recentEvents) ? snap.recentEvents.slice(-5) : [];
    const sections = [];

    sections.push(`
      <section class="overlay-section">
        <h4>Session</h4>
        <div class="overlay-grid">${renderRows([
          ["mode", snap.mode || "-"],
          ["sessionId", snap.sessionId || "-"],
          ["time", fmtMs(snap.sessionTimeMs)],
          ["frame", snap.frame ?? 0],
          ["logging", snap.loggingEnabled ? "on" : "off"],
          ["log status", fs.status || "idle"],
          ["backend", ls.mode || "-"],
          ["buffer", snap.pendingLogBufferSize ?? 0],
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
        <h4>Sequence</h4>
        <div class="overlay-grid">${renderRows([
          ["active", seq.active ? "yes" : "no"],
          ["stage", seq.stage || "IDLE"],
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
        <h4>Economy / Cards</h4>
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
        <h4>World / Thresholds</h4>
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
        <h4>Last events</h4>
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
          <h4>Mini tail</h4>
          <ul class="overlay-tail">
            ${recent.reverse().map((e) => `<li>[${fmtMs(e.sessionTimeMs)}] ${e.type}</li>`).join("") || "<li>—</li>"}
          </ul>
        </section>
      `);
    }
    return sections.join("");
  }
})();
