console.log("[HC] game.codex.js loaded");
/* =========================================================
   Haiku Cosmos — game.js (MONOLITH SAFE v4.1)
   Part 1/3
   - Event Bus
   - Core: canvas, scaling, input, helpers
   - World params: asteroidDriftMul, pointer tuning
   ========================================================= */

/* =========================================================
   QUICK NAV (use editor search)
// [ANCHOR:UPDATE]
   - [ANCHOR:UPDATE]        function update(dt, nowMs)
// [ANCHOR:RENDER]
   - [ANCHOR:RENDER]        function render()
// [ANCHOR:FRAME]
   - [ANCHOR:FRAME]         function frame(now)
// [ANCHOR:METEORS]
   - [ANCHOR:METEORS]       function updateMeteors(dt)
// [ANCHOR:COLLISIONS]
   - [ANCHOR:COLLISIONS]    function resolveMeteorCollisionsSafe()
// [ANCHOR:ASTEROIDS]
   - [ANCHOR:ASTEROIDS]     function updateAsteroids(dt) / captureMeteorsByAsteroids(...)
// [ANCHOR:PLANETS]
   - [ANCHOR:PLANETS]       function updatePlanets(dt) / captureMeteorsByPlanets(...)
// [ANCHOR:COMETS]
   - [ANCHOR:COMETS]        const Comets = (() => { ... })
   ========================================================= */

/* =========================
   1) WORLD + RENDER CORE
   ========================= */
(() => {
  // ---------- DOM ----------
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const fpsLabel = document.getElementById("fpsLabel");
  const btnRestart = document.getElementById("btnRestart");
  const topBar = document.getElementById("topBar");

  const scoreLabel = (() => {
    if (!topBar) return null;
    const el = document.createElement("div");
    el.className = "pill";
    el.id = "scoreLabel";
    el.textContent = "Score: 0";
    topBar.appendChild(el);
    return el;
  })();


  // ---------- UI: Meteors per second slider (debug / balancing) ----------
  const mpsUI = (() => {
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
  })();

  const CardEngine = window.CardEngine;

  if (window.HC && window.HC.initViewInput) {
    window.HC.initViewInput({ canvas, ctx, CardEngine });
  }

  const View = (window.HC && window.HC.getView && window.HC.getView()) || window.View || {
    w: 0,
    h: 0,
    dpr: 1,
    worldScale: 1,
  };
  const Input = (window.HC && window.HC.getInput && window.HC.getInput()) || window.Input || {
    pointerDown: false,
    x: 0,
    y: 0,
    wx: 0,
    wy: 0,
  };
  const Camera = (window.HC && window.HC.getCamera && window.HC.getCamera()) || window.Camera || {
    scale: 1.0,
    target: 1.0,
    min: 0.35,
    max: 1.0,
    ease: 0.06,
    epochZoom: { active: false, t: 0, dur: 2.0, fromZoom: 1.0, toZoom: 1.0, targetX: 0, targetY: 0 },
  };
  const screenToWorld = (window.HC && window.HC.screenToWorld) || window.screenToWorld || function screenToWorldFallback(x, y) {
    const cx = View.w / 2;
    const cy = View.h / 2;
    const s = Camera.scale || 1;
    return { x: (x - cx) / s + cx, y: (y - cy) / s + cy };
  };
  const getWorldViewBounds = (window.HC && window.HC.getWorldViewBounds) || window.getWorldViewBounds || function getWorldViewBoundsFallback() {
    const cx = View.w / 2;
    const cy = View.h / 2;
    const s = Camera.scale || 1;
    const halfW = (View.w / 2) / s;
    const halfH = (View.h / 2) / s;
    return { l: cx - halfW, r: cx + halfW, t: cy - halfH, b: cy + halfH, cx, cy };
  };

  // ---------- Helpers ----------
  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function meteorBaseRadius() {
    return View.worldScale * 0.008;
  }

  function massFromR(r) { return r * r; }

  // ---------- World state ----------
  const World = {
    meteors: [],
    asteroids: [],
    planets: [],

    flags: { firstPlanetZoomed: false, firstStarZoomed: false },

    spawnTimer: 0,
    spawnInterval: 0.22,
    maxMeteors: 60,

  // Pointer tuning (base) — cards modify with multipliers:
// engineStats.pointer_radius_mul / pointer_strength_mul
pointerRadius: 0.20,       // ring size
pointerStrength: 1.15,     // stronger pull (łatwiej łączyć meteory)

// "Klejenie" w obrębie ring-u (stabilizacja prędkości)
// większa wartość = meteory mniej "uciekają bokiem" gdy są w ring-u
pointerGlueDamp: 0.22,     // 0.0..0.6 (polecam 0.18–0.30)

// Pomoc w kolizjach meteorów (większa strefa kontaktu)
// 1.00 = fizycznie dokładnie, 1.08–1.18 = łatwiej trafić
meteorCollisionFudge: 1.12,


    // Difficulty knobs (cards / runs):
    asteroidDriftMul: 0.55,   // <- drift multiplier for new asteroids

    planetCaptureTarget: 13,

    // Star size thresholds (cards can tune)
    STAR_SIZE_SMALL_MAX_ORBITERS: 23,
    STAR_SIZE_BIG_MAX_ORBITERS: 66,
    STAR_RARE_MONO_MIN: 13,
    STAR_REQ_BLUE: 103,
    STAR_REQ_GREEN: 66,
    STAR_REQ_RED: 36,
    STAR_REQ_YELLOW: 23,
    STAR_COLOR_KEY_BLUE: "blue",
    STAR_COLOR_KEY_GREEN: "green",
    STAR_COLOR_KEY_RED: "red",
    STAR_COLOR_KEY_YELLOW: "yellow",
    STAR_BIRTH_RADIUS_FROM_OLD_GRAVITY: 0.18,
    STAR_BIRTH_RADIUS_MIN_MULT_OF_OLD_R: 2.6,
    STAR_BIRTH_RADIUS_MAX_FRACTION: 0.35,
    PLANET_SOFT_EDGE_ALPHA: 0.10,
    PLANET_SOFT_EDGE_WIDTH: 2.0,
    PLANET_SOFT_INNER_ALPHA: 0.06,
    PLANET_EDGE_GRAIN_COUNT: 18,
    PLANET_EDGE_GRAIN_ALPHA: 0.12,
    PLANET_EDGE_GRAIN_JITTER: 0.18,
    PLANET_EDGE_GRAIN_R_JITTER: 0.06,
    PLANET_EDGE_GRAIN_SIZE_MIN: 0.6,
    PLANET_EDGE_GRAIN_SIZE_MAX: 1.6,

    // Rocky planet (from comet impact) tuning
    ROCKY_FROM_AST_ORBITER_R_WEIGHT: 1.0,
    ROCKY_FROM_AST_BASE_R: 6.0,
    ROCKY_FROM_AST_KR: 0.35,
    ROCKY_FROM_AST_BASE_MASS: 1.0,
    ROCKY_FROM_AST_KM: 1.0,
    ROCKY_FORM_SHRINK_DUR: 5.0,
    ROCKY_FORM_FADE_DUR: 2.0,
    ROCKY_RING_OPACITY: 0.5,
    ROCKY_RING_DASH_STYLE: "useExisting",
    ROCKY_PATCH_BLOBS_TOTAL: 55,
    ROCKY_PATCH_BLOB_R_MIN: 0.10,
    ROCKY_PATCH_BLOB_R_MAX: 0.35,
    ROCKY_RIM_ALPHA: 0.18,
    ROCKY_CRACK_COUNT: 10,
    ROCKY_CRACK_ALPHA: 0.12,
    ROCKY_MAX_SYSTEM_ORBITERS: 13,
    GAS_GRAVITY_CONTACT_EPS: 3.0,
    ROCKY_SPIN_OMEGA_MIN: 0.08,
    ROCKY_SPIN_OMEGA_MAX: 0.25,

    meteorStreams: null,
    epoch: null,
    epochTriggered: false,
    epochAt: 0,
    score: 0,
  };
  // Bind CardEngine to World (foundation under Card Editor)
  CardEngine.bindWorld(World);



  // ---------- Spawn rate helpers ----------
  function setMeteorsPerSec(mps) {
    const v = clamp(mps, 1, 60);
    World.spawnInterval = 1 / v;
    if (mpsUI) {
      mpsUI.value.textContent = String(Math.round(v));
      mpsUI.slider.value = String(Math.round(v));
    }
  }

  // init slider from current spawnInterval
  if (mpsUI) {
    const current = Math.max(1, Math.round(1 / World.spawnInterval));
    mpsUI.value.textContent = String(current);
    mpsUI.slider.value = String(current);
    mpsUI.slider.addEventListener("input", () => {
      const v = parseInt(mpsUI.slider.value, 10) || 1;
      setMeteorsPerSec(v);
    });
  }

  // COMETS moved to hc.comets.codex.js


  function addScore(points) {
    World.score += points;
    if (scoreLabel) scoreLabel.textContent = `Score: ${World.score}`;
  }

  // ---------- API (future cards) ----------
  const WorldAPI = {
    adjustAsteroidOrbitByMeteorRadii(asteroid, deltaCount) {
      const Rm = meteorBaseRadius();
      asteroid.orbitPx = clamp(
        asteroid.orbitPx + deltaCount * Rm,
        asteroid.minOrbitPx,
        asteroid.maxOrbitPx
      );
      this._clampOrbitersToOrbit(asteroid);
    },

    removeOrbiters(asteroid, count) {
      const removed = [];
      while (count > 0 && asteroid.orbiters.length > 0) {
        removed.push(asteroid.orbiters.pop());
        count--;
      }
      this._clampOrbitersToOrbit(asteroid);
      return removed;
    },

    countStarSystemOrbiters(star, opts = {}) {
      const cap = Object.prototype.hasOwnProperty.call(opts, "cap") ? opts.cap : 50;
      const limit = Number.isFinite(cap) ? cap : Infinity;
      const seenIds = new Set();
      const seenObjs = new Set();
      let count = 0;

      function mark(obj) {
        if (!obj) return;
        const id = obj.id ?? obj._id;
        if (id !== undefined && id !== null) {
          if (seenIds.has(id)) return;
          seenIds.add(id);
        } else {
          if (seenObjs.has(obj)) return;
          seenObjs.add(obj);
        }
        count++;
      }

      if (star && star.orbiters && star.orbiters.length) {
        for (const o of star.orbiters) {
          mark(o);
          if (count >= limit) return count;
        }
      }

      if (World.asteroids && World.asteroids.length) {
        for (const a of World.asteroids) {
          if (a.parentKind !== "star" || a.parentRef !== star) continue;
          mark(a);
          if (count >= limit) return count;
          if (a.orbiters && a.orbiters.length) {
            for (const o of a.orbiters) {
              mark(o);
              if (count >= limit) return count;
            }
          }
        }
      }

      if (star && star.planetoids && star.planetoids.length) {
        for (const a of star.planetoids) {
          mark(a);
          if (count >= limit) return count;
          if (a && a.orbiters && a.orbiters.length) {
            for (const o of a.orbiters) {
              mark(o);
              if (count >= limit) return count;
            }
          }
        }
      }

      return count;
    },

    _clampOrbitersToOrbit(asteroid) {
      const margin = asteroid.r + asteroid.orbiterMinGapPx;
      for (const o of asteroid.orbiters) {
        const maxAllowed = Math.max(margin, asteroid.orbitPx - o.r);
        o.orbitR = clamp(o.orbitR, margin, maxAllowed);
      }
    }
  };

  /* =========================================================
     Part 2/3
     - Meteors: spawn
     - Asteroids: creation mapping + drift (vx/vy) + orbiters + capture stats
     - Planets: gradient helper
     - Rendering helpers
     ========================================================= */

  // ---------- Meteor palette ----------
  const MeteorColors = window.MeteorColors;
  function hueFromName(name) {
    const c = MeteorColors.find(x => x.name === name);
    return c ? c.hue : 0;
  }
  // METEORS moved to hc.meteors.codex.js

  // STARS+EPOCH moved to hc.stars_epoch.codex.js

  // ---------- Asteroid mapping ----------
  function pairKey(a, b) { return [a, b].sort().join("+"); }
  function sidesFromColors(c1, c2) {
    const key = pairKey(c1, c2);
    if (key === "blue+green") return 5;
    if (key === "red+yellow") return 6;
    if (key === "blue+red") return 7;
    if (key === "blue+yellow") return 8;
    if (key === "green+red") return 8;
    if (key === "green+yellow") return 9;
    return 7;
  }

  function computeGravityFromPlanetRadius(r) {
    return r * 2.6;
  }

  function hash01(n) {
    const s = Math.sin(n) * 43758.5453;
    return s - Math.floor(s);
  }

  function hash32(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function makeRng(seed) {
    let s = seed >>> 0;
    return function rand01() {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17; s >>>= 0;
      s ^= s << 5;  s >>>= 0;
      return (s >>> 0) / 4294967296;
    };
  }

  function getDirectOrbitersOfBody(body) {
    if (!body) return [];
    if (Array.isArray(body.orbiters)) return body.orbiters.slice();
    if (Array.isArray(body.meteors)) return body.meteors.slice();
    const out = [];
    if (Array.isArray(World.meteors)) {
      for (const m of World.meteors) {
        if (m.parentId === body.id && m.parentKind === body.type) out.push(m);
      }
    }
    if (Array.isArray(World.asteroids)) {
      for (const a of World.asteroids) {
        if (a.parentId === body.id && a.parentKind === body.type) out.push(a);
      }
    }
    return out;
  }

  function removeOrbitersConsumed(orbiters) {
    if (!orbiters || !orbiters.length) return;
    for (let i = World.meteors.length - 1; i >= 0; i--) {
      if (orbiters.includes(World.meteors[i])) World.meteors.splice(i, 1);
    }
    for (let i = World.asteroids.length - 1; i >= 0; i--) {
      if (orbiters.includes(World.asteroids[i])) World.asteroids.splice(i, 1);
    }
  }

  // STARS+EPOCH moved to hc.stars_epoch.codex.js

  // ASTEROIDS moved to hc.asteroids.codex.js

  // RENDER moved to hc.render.codex.js

  // PLANETS moved to hc.planets.codex.js


   /* =========================================================
     Part 3/3
     - Collisions meteor-meteor
     - Capture -> add orbiter (full size) + orbit speed by radius
     - Asteroid drift/bounce + collapse -> planet
     - Update/render loop + restart + FPS
     ========================================================= */

  // COLLISIONS moved to hc.collisions.codex.js

  // omega ~ 1/sqrt(r)
  function computeOmega(baseOmega, orbitRpx, Rm) {
    const rNorm = Math.max(0.25, orbitRpx / (6 * Rm));
    return baseOmega / Math.sqrt(rNorm);
  }

  // ASTEROIDS moved to hc.asteroids.codex.js

  // PLANETS moved to hc.planets.codex.js

  // STARS+EPOCH moved to hc.stars_epoch.codex.js

  // METEORS moved to hc.meteors.codex.js

  function update(dt) {
    const nowMs = performance.now();
    World.nowMs = nowMs;
    // CardEngine runtime (offers, timed effects, rituals)
    CardEngine.update(dt, nowMs);


    // camera ease
    if (Camera.epochZoom && Camera.epochZoom.active) {
      Camera.epochZoom.t += dt;
      const u = Math.min(1, Camera.epochZoom.t / Math.max(0.001, Camera.epochZoom.dur));
      const e = (u < 0.5) ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      Camera.scale = Camera.epochZoom.fromZoom + (Camera.epochZoom.toZoom - Camera.epochZoom.fromZoom) * e;
      if (u >= 1) Camera.epochZoom.active = false;
    } else {
      Camera.target = clamp(Camera.target, Camera.min, Camera.max);
      Camera.scale += (Camera.target - Camera.scale) * Camera.ease;
    }

    // input -> world coords (because render uses Camera.scale)
    const wp = screenToWorld(Input.x, Input.y);
    Input.wx = wp.x;
    Input.wy = wp.y;

    // epoch zoom triggers
    if (!World.flags.firstPlanetZoomed && World.planets.length >= 1) {
      World.flags.firstPlanetZoomed = true;
      Camera.target = 0.65;
    }

    HC.Meteors.update(dt);
    HC.Comets.update(dt, nowMs);
    HC.Collisions.resolve(dt, nowMs);
    HC.Asteroids.capture(dt, nowMs);
    HC.Planets.capture(dt, nowMs);
    HC.Asteroids.update(dt, nowMs);
    HC.Planets.update(dt, nowMs);
    HC.Stars.update(dt, nowMs);
  }

  // RENDER moved to hc.render.codex.js

  window.World = World;
  window.View = View;
  window.Camera = Camera;
  window.ctx = ctx;
  window.Input = Input;
  window.CardEngine = CardEngine;
  window.rand = rand;
  window.clamp = clamp;
  window.meteorBaseRadius = meteorBaseRadius;
  window.massFromR = massFromR;
  window.computeGravityFromPlanetRadius = computeGravityFromPlanetRadius;
  window.computeOmega = computeOmega;
  window.getWorldViewBounds = getWorldViewBounds;
  window.hueFromName = hueFromName;
  window.addScore = addScore;
  window.sidesFromColors = sidesFromColors;
  window.getDirectOrbitersOfBody = getDirectOrbitersOfBody;
  window.makeRng = makeRng;
  window.hash32 = hash32;
  window.removeOrbitersConsumed = removeOrbitersConsumed;
  window.WorldAPI = WorldAPI;
  if (window.HC && window.HC.initStarsEpoch && !window.HC.Stars) {
    window.HC.initStarsEpoch();
  }
  if (window.HC && window.HC.initPlanets && !window.HC.Planets) {
    window.HC.initPlanets();
  }
  if (window.HC && window.HC.initComets && !window.HC.Comets) {
    window.HC.initComets();
  }
  if (window.HC && window.HC.initMeteors && !window.HC.Meteors) {
    window.HC.initMeteors();
  }
  if (window.HC && window.HC.initRender && !window.HC.Render) {
    window.HC.initRender();
  }
  if (window.HC && window.HC.initAsteroids && !window.HC.Asteroids) {
    window.HC.initAsteroids();
  }
  if (window.HC && window.HC.initCollisions && !window.HC.Collisions) {
    window.HC.initCollisions();
  }

  function resetWorld() {
    World.meteors = [];
    World.asteroids = [];
    World.planets = [];
    World.stars = [];
    World.spawnTimer = 0;
    World.score = 0;
    World.epoch = null;
    World.epochTriggered = false;
    World.epochAt = 0;
    World.meteorStreams = null;
    if (Camera.epochZoom) {
      Camera.epochZoom.active = false;
      Camera.epochZoom.t = 0;
      Camera.epochZoom.fromZoom = Camera.scale;
      Camera.epochZoom.toZoom = Camera.scale;
      Camera.epochZoom.targetX = 0;
      Camera.epochZoom.targetY = 0;
    }

    // Reset epoch/zoom state
    World.flags = { firstPlanetZoomed: false, firstStarZoomed: false };
    Camera.scale = 1.0;
    Camera.target = 1.0;

    if (scoreLabel) scoreLabel.textContent = "Score: 0";
    CardEngine.resetForNewRun();
  }

  if (btnRestart) btnRestart.addEventListener("click", resetWorld);
  resetWorld();

  let last = performance.now();
  let fpsAcc = 0;
  let fpsFrames = 0;

  function frame(now) {
    const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
    last = now;

    update(dt);
    HC.Render.frame(now, dt);

    fpsAcc += dt;
    fpsFrames += 1;
    if (fpsAcc >= 0.5) {
      const fps = Math.round(fpsFrames / fpsAcc);
      if (fpsLabel) fpsLabel.textContent = `FPS: ${fps}`;
      fpsAcc = 0;
      fpsFrames = 0;
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

})(); // end IIFE
