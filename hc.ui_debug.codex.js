// HC UI/debug glue (extracted)
(function () {
  window.HC = window.HC || {};

  let fpsLabel = null;
  let btnRestart = null;
  let btnSubMeta = null;
  let scoreLabel = null;
  let topBar = null;
  let mpsUI = null;
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
    const bank = World?.cardBank;
    if (!bank) return 0;
    let total = 0;
    Object.values(bank.R1 || {}).forEach((bucket) => {
      if (!bucket) return;
      total += Math.max(0, Math.floor(bucket.DR || 0));
      total += Math.max(0, Math.floor(bucket.sDR || 0));
      total += Math.max(0, Math.floor(bucket.pDR || 0));
    });
    Object.values(bank.R2 || {}).forEach((bucket) => {
      if (!bucket) return;
      total += Math.max(0, Math.floor(bucket.DR || 0));
      total += Math.max(0, Math.floor(bucket.sDR || 0));
      total += Math.max(0, Math.floor(bucket.pDR || 0));
    });
    return total;
  }

  function updateMpsUI(World) {
    if (!mpsUI || !World) return;
    const current = Math.max(1, Math.round(1 / World.spawnInterval));
    mpsUI.value.textContent = String(current);
    mpsUI.slider.value = String(current);
  }

  function addScore(points) {
    const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
    if (!World) return;
    World.score += points;
    updateScoreLabel(World, true);
  }

  window.addScore = addScore;

  function setMeteorsPerSec(mps, World, clamp) {
    const v = clamp(mps, 1, 60);
    World.spawnInterval = 1 / v;
    if (mpsUI) {
      mpsUI.value.textContent = String(Math.round(v));
      mpsUI.slider.value = String(Math.round(v));
    }
  }

  function ensureScoreLabel() {
    if (!topBar) return null;
    const el = document.createElement("div");
    el.className = "pill";
    el.id = "scoreLabel";
    el.textContent = "RP: 0";
    topBar.appendChild(el);
    return el;
  }

  function ensureMpsUI() {
    if (!topBar) return null;

    const wrap = document.createElement("div");
    wrap.className = "pill";
    wrap.style.display = "flex";
    wrap.style.alignItems = "center";
    wrap.style.gap = "10px";
    wrap.style.padding = "6px 10px";

    const label = document.createElement("span");
    label.textContent = "Meteors/s:";
    label.style.opacity = "0.9";

    const value = document.createElement("span");
    value.id = "mpsValue";
    value.style.minWidth = "34px";
    value.style.textAlign = "right";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "1";
    slider.max = "20";
    slider.step = "1";
    slider.value = "5";
    slider.style.width = "140px";

    wrap.appendChild(label);
    wrap.appendChild(value);
    wrap.appendChild(slider);
    topBar.appendChild(wrap);

    return { wrap, label, value, slider };
  }

  window.HC.UI = {
    init() {
      if (initialized) return;
      initialized = true;

      const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
      const clamp = (window.HC && window.HC.Util && window.HC.Util.clamp) || window.clamp;

      fpsLabel = document.getElementById("fpsLabel");
      btnRestart = document.getElementById("btnRestart");
      btnSubMeta = document.getElementById("btnSubMeta");
      topBar = document.getElementById("topBar");

      scoreLabel = ensureScoreLabel();
      mpsUI = ensureMpsUI();

      if (mpsUI && World) {
        updateMpsUI(World);
        mpsUI.slider.addEventListener("input", () => {
          const v = parseInt(mpsUI.slider.value, 10) || 1;
          setMeteorsPerSec(v, World, clamp);
        });
      }

      if (btnRestart && window.resetWorld) {
        btnRestart.addEventListener("click", () => {
          window.resetWorld();
          const refreshedWorld = (window.HC.getWorld && window.HC.getWorld()) || window.World;
          updateScoreLabel(refreshedWorld, true);
          updateMpsUI(refreshedWorld);
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
      if (window.resetWorld) window.resetWorld();
      updateScoreLabel(World, true);
      updateMpsUI(World);
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
