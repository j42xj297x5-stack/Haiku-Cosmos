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

  // ---------- View / scaling ----------
  function getMaxPixelRatio() {
    const dpr = window.devicePixelRatio || 1;
    const isMobile = matchMedia("(pointer: coarse)").matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    return Math.min(dpr, isMobile ? 1.5 : 2.0);
  }

  const View = { w: 0, h: 0, dpr: 1, worldScale: 1 };

  // ---------- Camera (render-only zoom, lightweight) ----------
  const Camera = {
    scale: 1.0,
    target: 1.0,
    min: 0.35,
    max: 1.0,
    ease: 0.06,
    epochZoom: { active: false, t: 0, dur: 2.0, fromZoom: 1.0, toZoom: 1.0, targetX: 0, targetY: 0 },
  };

  function screenToWorld(x, y) {
    const cx = View.w / 2;
    const cy = View.h / 2;
    const s = Camera.scale || 1;
    return { x: (x - cx) / s + cx, y: (y - cy) / s + cy };
  }


  
  function getWorldViewBounds() {
    // When Camera.scale < 1, the visible world extends beyond 0..View.w / 0..View.h.
    const cx = View.w / 2;
    const cy = View.h / 2;
    const s = Camera.scale || 1;
    const halfW = (View.w / 2) / s;
    const halfH = (View.h / 2) / s;
    return { l: cx - halfW, r: cx + halfW, t: cy - halfH, b: cy + halfH, cx, cy };
  }

function resizeCanvas() {
    View.dpr = getMaxPixelRatio();
    const cssW = Math.max(1, window.innerWidth);
    const cssH = Math.max(1, window.innerHeight);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.floor(cssW * View.dpr);
    canvas.height = Math.floor(cssH * View.dpr);
    View.w = canvas.width;
    View.h = canvas.height;
    View.worldScale = Math.min(View.w, View.h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();

  // ---------- Input ----------
  const Input = { pointerDown: false, x: 0, y: 0, wx: 0, wy: 0 };

  function toCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * View.dpr,
      y: (e.clientY - rect.top) * View.dpr,
    };
  }

  canvas.addEventListener("pointerdown", (e) => {
    const p = toCanvasCoords(e);
    Input.x = p.x; Input.y = p.y;

    // If a card offer was clicked, consume the click (do not start pointer control)
    if (CardEngine.handlePointerDown(p.x, p.y, View.w, View.h)) return;

    Input.pointerDown = true;
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    const p = toCanvasCoords(e);
    Input.x = p.x; Input.y = p.y;
  });

  canvas.addEventListener("pointerup", (e) => {
    Input.pointerDown = false;
    try { canvas.releasePointerCapture(e.pointerId); } catch {}
  });

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

  function startStarEpochZoomOut(star, screenW, screenH) {
    if (!star) return;
    if (star._epochZoomStarted) return;
    const margin = 0.88;
    const minHalf = Math.min(screenW, screenH) * 0.5 * margin;
    const desiredFit = minHalf / Math.max(1e-6, (star.gravityR || computeGravityFromPlanetRadius(star.r)));
    const nudge = Camera.scale * 0.86;
    const toZoom = Math.min(desiredFit, nudge);

    Camera.epochZoom.active = true;
    Camera.epochZoom.t = 0;
    Camera.epochZoom.dur = 2.0;
    Camera.epochZoom.fromZoom = Camera.scale;
    Camera.epochZoom.toZoom = toZoom;
    Camera.epochZoom.targetX = star.x;
    Camera.epochZoom.targetY = star.y;

    if (!World.epochTriggered) {
      World.epoch = "STAR";
      World.epochTriggered = true;
      World.epochAt = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
    }
    if (!World.meteorStreams) {
      World.meteorStreams = {
        enabled: true,
        t: 0,
        baseAngle: 0,
        driftSpeed: 0.06,
        shiftTimer: 0,
        shiftEvery: 4.5,
        shiftAmount: 0.35,
        streams: 3,
        spawnRate: 6,
        acc: 0,
      };
    } else {
      World.meteorStreams.enabled = true;
    }
    star._epochZoomStarted = true;
  }

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

  function buildColorWeightsFromOrbiters(orbiters) {
    const map = new Map();
    let total = 0;
    for (const o of orbiters) {
      const colorName = o.color || o.col || o.fill || o.colorName || "#888";
      const hue = (typeof o.hue === "number") ? o.hue : hueFromName(colorName);
      const weight = Math.max(0.01, (o.r || 1)) * World.ROCKY_FROM_AST_ORBITER_R_WEIGHT;
      const prev = map.get(colorName);
      if (prev) {
        prev.w += weight;
      } else {
        map.set(colorName, { colorName, hue, w: weight });
      }
      total += weight;
    }
    if (!map.size || total <= 0) {
      return {
        colors: [],
        isMono: true,
        monoColor: "#888",
        dominantColor: "#888",
        totalWeight: 0,
        avgHue: hueFromName("blue"),
      };
    }
    const colors = [];
    for (const entry of map.values()) {
      colors.push({ ...entry, wn: entry.w / Math.max(1e-9, total) });
    }
    colors.sort((a, b) => b.w - a.w);
    let avgHue = hueFromName("yellow");
    if (colors.length) {
      let hueSum = 0;
      for (const c of colors) hueSum += c.hue * c.wn;
      avgHue = hueSum;
    }
    const isMono = colors.length === 1;
    const monoColor = colors[0]?.colorName || "#888";
    const dominantColor = isMono ? monoColor : (colors[0]?.colorName || monoColor);
    return {
      colors,
      isMono,
      monoColor,
      dominantColor,
      totalWeight: total,
      avgHue,
    };
  }

  function buildBlobPatchwork(planetId, weights, blobCount) {
    if (!weights || !weights.colors || weights.colors.length === 0) {
      return {
        isMono: true,
        monoColor: (weights && (weights.dominantColor || weights.monoColor)) || "#888",
        dominantColor: (weights && (weights.dominantColor || weights.monoColor)) || "#888",
        blobs: [],
      };
    }
    if (weights.isMono) {
      return { isMono: true, monoColor: weights.monoColor, dominantColor: weights.dominantColor, blobs: [] };
    }
    const seed = hash32(`rocky:${planetId}`);
    const rnd = makeRng(seed);
    const target = Math.max(8, blobCount | 0);
    const colorBuckets = [];
    const colorMap = new Map();
    for (const c of weights.colors) {
      const count = Math.max(1, Math.round(c.wn * target));
      for (let i = 0; i < count; i++) colorBuckets.push(c.colorName);
      colorMap.set(c.colorName, c);
    }
    while (colorBuckets.length < target) colorBuckets.push(weights.colors[0].colorName);
    while (colorBuckets.length > target) colorBuckets.pop();

    const blobs = [];
    for (let i = 0; i < target; i++) {
      const colorName = colorBuckets[i];
      let x = 0, y = 0;
      for (let tries = 0; tries < 10; tries++) {
        x = rnd() * 2 - 1;
        y = rnd() * 2 - 1;
        if (x * x + y * y <= 1) break;
      }
      const rN = World.ROCKY_PATCH_BLOB_R_MIN
        + (World.ROCKY_PATCH_BLOB_R_MAX - World.ROCKY_PATCH_BLOB_R_MIN) * rnd();
      const jag = 0.15 + 0.35 * rnd();
      const entry = colorMap.get(colorName);
      blobs.push({
        xN: x,
        yN: y,
        rN,
        colorName,
        hue: entry ? entry.hue : hueFromName(colorName || "blue"),
        jag,
        seed: hash32(`blob:${planetId}:${i}`),
      });
    }
    return { isMono: false, monoColor: null, dominantColor: weights.dominantColor, blobs };
  }

  function computeRockyParamsFromOrbiters(orbiters) {
    let sumR = 0;
    let sumMassProxy = 0;
    for (const o of orbiters) {
      const r = o.r || 0;
      sumR += r;
      sumMassProxy += (typeof o.mass === "number") ? o.mass : (r * r);
    }
    const Rm = meteorBaseRadius();
    const planetR = (World.ROCKY_FROM_AST_BASE_R * Rm) + (World.ROCKY_FROM_AST_KR * sumR);
    const planetMass = (World.ROCKY_FROM_AST_BASE_MASS * (Rm * Rm)) + (World.ROCKY_FROM_AST_KM * sumMassProxy);
    const gravityR = computeGravityFromPlanetRadius(planetR);
    return { planetR, planetMass, gravityR };
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

  function isMeteor(o) {
    return !!(o && (o.type === "meteor" || o.kind === "meteor" || o.isMeteor));
  }

  function isPlanet(o) {
    return !!(o && (o.type === "planet" || o.kind === "planet"));
  }

  function isCaptureToStarAllowed(o) {
    if (!o || isMeteor(o)) return false;
    return isPlanet(o);
  }

  function countSystemOrbitersForRocky(p) {
    const seenIds = new Set();
    const seenObjs = new Set();
    let count = 0;

    function add(obj) {
      if (!obj) return;
      const id = obj.id ?? obj._id;
      if (id !== undefined && id !== null) {
        if (seenIds.has(id)) return;
        seenIds.add(id);
      } else {
        if (seenObjs.has(obj)) return;
        seenObjs.add(obj);
      }
      count += 1;
    }

    if (p.orbiters && p.orbiters.length) {
      for (const o of p.orbiters) add(o);
    }

    if (World.asteroids && World.asteroids.length) {
      for (const a of World.asteroids) {
        if (a.parentKind !== "planet" || a.parentRef !== p) continue;
        add(a);
        if (a.orbiters && a.orbiters.length) {
          for (const o of a.orbiters) add(o);
        }
      }
    }

    return count;
  }

  function countOrbitersInBodySystem(o) {
    let count = 0;
    if (o) count += 1;
    if (o && o.orbiters && o.orbiters.length) count += o.orbiters.length;
    return count;
  }

  function absorbBodiesIntoRocky(p, bodies) {
    if (!bodies || !bodies.length) return;
    const Rm = meteorBaseRadius();
    for (const b of bodies) {
      const r = b?.r || 0;
      p.mass = (p.mass || 0) + massFromR(r);
      p.r = clamp(p.r + r * 0.06, Rm * 2.0, Rm * 220);
    }
    p.gravityR = computeGravityFromPlanetRadius(p.r);
  }

  function attachBodyToStarSystem(o, s) {
    if (o.starBoundId != null && o.starBoundId !== (s.id || s._id)) return;
    const dx = o.x - s.x;
    const dy = o.y - s.y;
    const d = Math.hypot(dx, dy) || 1;
    const minR = Math.max(1, s.r + o.r + 2);
    const maxR = Math.max(1, (s.gravityR || computeGravityFromPlanetRadius(s.r)) - o.r - 2);
    const orbitR = clamp(d, minR, maxR);
    const theta = Math.atan2(dy, dx);
    const Rm = meteorBaseRadius();
    const baseOmega = rand(0.25, 0.75);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const omega = direction * computeOmega(baseOmega, orbitR, Rm);

    if (o.starBoundId == null) o.starBoundId = s.id || s._id;
    o.parentKind = "star";
    o.parentRef = s;
    o.parentId = s.id || s._id;
    o.orbitR = orbitR;
    o.theta = theta;
    o.omega = omega;
  }

  function reconcileStarOwnershipOnBirth(oldPlanet, star) {
    const captureR = oldPlanet.gravityR || computeGravityFromPlanetRadius(oldPlanet.r);
    if (World.planets && World.planets.length) {
      for (const p of World.planets) {
        if (p === oldPlanet) continue;
        if (!isPlanet(p)) continue;
        const d = Math.hypot(p.x - star.x, p.y - star.y);
        if (d <= captureR + p.r) {
          attachBodyToStarSystem(p, star);
          p.starBoundId = star.id || star._id;
        }
      }
    }

    if (World.asteroids && World.asteroids.length) {
      for (const a of World.asteroids) {
        if (a.parentKind !== "planet" || a.parentRef !== oldPlanet) continue;
        const dx = a.x - star.x;
        const dy = a.y - star.y;
        const d = Math.hypot(dx, dy);
        const theta = Math.atan2(dy, dx);
        if (star.birth && star.birth.absorb) {
          star.birth.absorb.push({
            ref: a,
            r: d,
            theta,
            hue: (typeof a.hue === "number") ? a.hue : hueFromName(a.colorName || "blue"),
            alpha: 1,
            startR: d,
          });
        }
        a.absorbingIntoStarId = star.id || star._id;
        const absorbed = getDirectOrbitersOfBody(a);
        removeOrbitersConsumed(absorbed);
        a.orbiters = [];
      }
    }
  }

  function captureBodiesByStars(dt) {
    if (!World.stars || !World.stars.length) return;
    for (const s of World.stars) {
      const gravityR = s.gravityR || computeGravityFromPlanetRadius(s.r);
      if (World.asteroids && World.asteroids.length) {
        for (const a of World.asteroids) {
          if (!isCaptureToStarAllowed(a)) continue;
          if (a.starBoundId != null && a.starBoundId !== (s.id || s._id)) continue;
          if (a.parentKind === "star" && a.parentRef === s) continue;
          const d = Math.hypot(a.x - s.x, a.y - s.y);
          if (d <= gravityR + a.r) {
            attachBodyToStarSystem(a, s);
          }
        }
      }
      if (World.planets && World.planets.length) {
        for (const p of World.planets) {
          if (!isCaptureToStarAllowed(p)) continue;
          if (p.starBoundId != null && p.starBoundId !== (s.id || s._id)) continue;
          if (p.parentKind === "star" && p.parentRef === s) continue;
          const d = Math.hypot(p.x - s.x, p.y - s.y);
          if (d <= gravityR + p.r) {
            attachBodyToStarSystem(p, s);
          }
        }
      }
    }
  }

  function getSystemMeteorsForPlanet(p) {
    const out = [];
    const seenIds = new Set();
    const seenObjs = new Set();

    function addMeteor(m) {
      if (!m) return;
      const id = m.id ?? m._id;
      if (id !== undefined && id !== null) {
        if (seenIds.has(id)) return;
        seenIds.add(id);
      } else {
        if (seenObjs.has(m)) return;
        seenObjs.add(m);
      }
      out.push(m);
    }

    if (p.orbiters && p.orbiters.length) {
      for (const m of p.orbiters) addMeteor(m);
    }

    if (World.asteroids && World.asteroids.length) {
      for (const a of World.asteroids) {
        if (a.parentKind !== "planet" || a.parentRef !== p) continue;
        if (a.orbiters && a.orbiters.length) {
          for (const m of a.orbiters) addMeteor(m);
        }
      }
    }

    return out;
  }

  function classifyMeteorColor(m) {
    const name = (m.colorName || m.color || m.col || m.fill || "").toString().toLowerCase();
    const keys = {
      blue: World.STAR_COLOR_KEY_BLUE,
      green: World.STAR_COLOR_KEY_GREEN,
      red: World.STAR_COLOR_KEY_RED,
      yellow: World.STAR_COLOR_KEY_YELLOW,
    };
    if (name === keys.blue) return "blue";
    if (name === keys.green) return "green";
    if (name === keys.red) return "red";
    if (name === keys.yellow) return "yellow";

    const hue = (typeof m.hue === "number") ? m.hue : null;
    if (hue === null) return null;
    const base = {
      blue: hueFromName(keys.blue),
      green: hueFromName(keys.green),
      red: hueFromName(keys.red),
      yellow: hueFromName(keys.yellow),
    };
    let bestKey = null;
    let bestDist = Infinity;
    for (const [key, h] of Object.entries(base)) {
      const d = Math.min(Math.abs(hue - h), 360 - Math.abs(hue - h));
      if (d < bestDist) {
        bestDist = d;
        bestKey = key;
      }
    }
    return bestKey;
  }

  function analyzeSystemMeteors(meteors) {
    const counts = { blue: 0, green: 0, red: 0, yellow: 0 };
    let total = 0;
    let monoColorKey = null;
    let monoOk = true;

    for (const m of meteors) {
      const key = classifyMeteorColor(m);
      if (!key) continue;
      total += 1;
      counts[key] += 1;
      if (monoColorKey === null) monoColorKey = key;
      else if (monoColorKey !== key) monoOk = false;
    }

    const order = ["blue", "green", "red", "yellow"];
    let dominantKey = null;
    let maxCount = -1;
    for (const key of order) {
      if (counts[key] > maxCount) {
        maxCount = counts[key];
        dominantKey = key;
      }
    }
    return { total, counts, dominantKey, monoOk, monoColorKey };
  }

  function removeSystemMeteorsFromPlanet(p, meteors) {
    if (!meteors || !meteors.length) return;
    const set = new Set(meteors);

    if (p.orbiters && p.orbiters.length) {
      for (let i = p.orbiters.length - 1; i >= 0; i--) {
        if (set.has(p.orbiters[i])) p.orbiters.splice(i, 1);
      }
    }

    if (World.asteroids && World.asteroids.length) {
      for (const a of World.asteroids) {
        if (a.parentKind !== "planet" || a.parentRef !== p) continue;
        if (!a.orbiters || !a.orbiters.length) continue;
        for (let i = a.orbiters.length - 1; i >= 0; i--) {
          if (set.has(a.orbiters[i])) a.orbiters.splice(i, 1);
        }
      }
    }
  }

  function transformGasPlanetIntoStar(p, info, kind) {
    const oldGravityR = p.gravityR || computeGravityFromPlanetRadius(p.r);
    const meteors = getSystemMeteorsForPlanet(p);
    removeSystemMeteorsFromPlanet(p, meteors);

    if (!World.stars) World.stars = [];
    const star = {
      type: "star",
      x: p.x,
      y: p.y,
      r: p.r,
      mass: p.mass,
      gravityR: computeGravityFromPlanetRadius(p.r),
      orbiters: [],
      starKind: kind,
      dominantKey: info.dominantKey,
      monoColorKey: info.monoColorKey,
      starBirth: { phase: "done" },
      birth: {
        active: true,
        phase: "collapse",
        t: 0,
        duration: 5.0,
        fadeOut: 2.0,
        timeAbs: 0,
        absorb: [],
      },
      baseColor: info.monoColorKey || info.dominantKey || "yellow",
      shimmer: kind === "rare" ? { active: true, seed: (p._id || p.id || 1) } : null,
      sizeClass: kind === "rare" ? "small" : null,
      gradientOuterColor: kind === "rare" ? (info.monoColorKey || info.dominantKey || "yellow") : null,
    };
    const targetFromGravity = oldGravityR * World.STAR_BIRTH_RADIUS_FROM_OLD_GRAVITY;
    const targetFromOldR = p.r * World.STAR_BIRTH_RADIUS_MIN_MULT_OF_OLD_R;
    let newR = Math.max(star.r, targetFromGravity, targetFromOldR);
    const maxR = oldGravityR * World.STAR_BIRTH_RADIUS_MAX_FRACTION;
    newR = Math.min(newR, maxR);
    star.r = newR;
    star.gravityR = computeGravityFromPlanetRadius(star.r);
    World.stars.push(star);
    for (const m of meteors) {
      World.meteors.push(m);
    }
    reconcileStarOwnershipOnBirth(p, star);
    startStarEpochZoomOut(star, View.w, View.h);
  }

  // ASTEROIDS moved to hc.asteroids.codex.js

  // RENDER moved to hc.render.codex.js

  function addPlanetRingMark(p, orbiter, nowMs, source) {
    if (!p) return;
    if (!p.rings) p.rings = [];
    const baseR = (typeof orbiter?.orbitR === "number" && isFinite(orbiter.orbitR)) ? orbiter.orbitR : (p.orbitPx || (p.r * 2.4));
   const bandWidth = Math.max(1, orbiter?.r || meteorBaseRadius());
    const hue = (typeof orbiter?.hue === "number") ? orbiter.hue : hueFromName(orbiter?.colorName || "blue");
    p.rings.push({
      r: baseR,
      bandWidth,
      t0: nowMs,
      hue,
      colorName: orbiter?.colorName || "blue",
      palette: [{ hue, colorName: orbiter?.colorName || "blue" }],
      dashBase: 6,
      gapBase: 10,
      dashOffset: rand(0, 6),
      seed: Math.random() * 1000,
      source: source || "COMET",
    });
  }

  function addAsteroidBreakRing(p, asteroid, colors, nowMs) {
    if (!p || !asteroid) return;
    if (!p.rings) p.rings = [];
    const baseR = (typeof asteroid.orbitR === "number" && isFinite(asteroid.orbitR)) ? asteroid.orbitR : (p.orbitPx || (p.r * 2.6));
    const bandWidth = Math.max(1, asteroid.r);
    const palette = (colors && colors.length) ? colors : [{
      hue: (typeof p.hueA === "number") ? p.hueA : hueFromName("blue"),
      colorName: "blue",
    }];
    p.rings.push({
      kind: "asteroidBreak",
      r: baseR,
      bandWidth,
      t0: nowMs,
      palette,
      theta0: (typeof asteroid.theta === "number") ? asteroid.theta : 0,
      dashBase: 6,
      gapBase: 10,
      dashOffset: rand(0, 6),
      seed: Math.random() * 1000,
      source: "COMET",
    });
  }


  function addOrbiterToPlanet(p, meteor) {
    if (!p.orbiters) p.orbiters = [];
    const Rm = meteorBaseRadius();
    const orbR = meteor.r;

    const idx = p.orbiters.length;
    const minOrbit = p.r + (Rm * 0.9) + orbR;

    const step = (Rm * 1.2) + orbR * 0.85;
    const candidate = minOrbit + idx * step;

    const maxOrbit = Math.max(minOrbit, (p.orbitPx || (p.r * 2.4)) - orbR);
    const orbitR = clamp(candidate, minOrbit, maxOrbit);

    const baseOmega = rand(0.35, 0.95);
    const direction = Math.random() < 0.5 ? -1 : 1;
    const omega = direction * computeOmega(baseOmega, orbitR, Rm);

    p.orbiters.push({
      hue: meteor.hue,
      colorName: meteor.colorName,
      r: orbR,
      orbitR,
      angle: rand(0, Math.PI * 2),
      omega,
    });
  }

// [ANCHOR:PLANETS]
  function captureMeteorsByPlanets(dt, nowMs) {
    if (!World.planets.length || !World.meteors.length) return;

    for (const p of World.planets) {
      p.captureCooldown = Math.max(0, (p.captureCooldown || 0) - dt);
    }

    const meteors = World.meteors;

    for (let mi = meteors.length - 1; mi >= 0; mi--) {
      const m = meteors[mi];
      if (m.age < 0.15) continue;

      // You may later add cards that mark m.noPlanetOrbit
      if (m.noPlanetOrbit) continue;

      for (let pi = 0; pi < World.planets.length; pi++) {
        const p = World.planets[pi];
        if (p.captureCooldown > 0) continue;

        const dx = m.x - p.x;
        const dy = m.y - p.y;
        const d2 = dx * dx + dy * dy;
        const collideR = p.r + m.r;

        if (p.isRocky) {
          const currentCount = countSystemOrbitersForRocky(p);
          if (p.rockyLocked || currentCount >= World.ROCKY_MAX_SYSTEM_ORBITERS) {
            p.rockyLocked = true;
            if (d2 <= collideR * collideR) {
              meteors.splice(mi, 1);
              absorbBodiesIntoRocky(p, [m]);
              p.captureCooldown = 0.04;
              break;
            }
            continue;
          }
          if (currentCount + 1 > World.ROCKY_MAX_SYSTEM_ORBITERS) {
            p.rockyLocked = true;
            if (d2 <= collideR * collideR) {
              meteors.splice(mi, 1);
              absorbBodiesIntoRocky(p, [m]);
              p.captureCooldown = 0.04;
              break;
            }
            continue;
          }
        }

        const capR = (p.orbitPx || (p.r * 2.4)) + m.r;
        if (d2 <= capR * capR) {
          meteors.splice(mi, 1);

          p.captureCount = (p.captureCount || 0) + 1;
          p.captureSumR = (p.captureSumR || 0) + m.r;
          p.captureSumMass = (p.captureSumMass || 0) + massFromR(m.r);
          if (!p.captureColorCounts) p.captureColorCounts = Object.create(null);
          p.captureColorCounts[m.colorName] = (p.captureColorCounts[m.colorName] || 0) + 1;

          // Planet grows a bit and its orbit expands by meteor size (visual clarity)
          p.r = clamp(p.r + m.r * 0.06, meteorBaseRadius() * 2.0, meteorBaseRadius() * 180);
          const minOrbit = p.r * 2.1;
          const maxOrbit = meteorBaseRadius() * 420;
          p.orbitPx = clamp((p.orbitPx || minOrbit) + m.r, minOrbit, maxOrbit);

          addOrbiterToPlanet(p, m);

          if (p.isRocky && countSystemOrbitersForRocky(p) >= World.ROCKY_MAX_SYSTEM_ORBITERS) {
            p.rockyLocked = true;
          }
          p.captureCooldown = 0.035;
          break;
        }
      }
    }
  }

// [ANCHOR:PLANETS]
  function captureAsteroidsByPlanets(dt, nowMs) {
    if (!World.planets.length || !World.asteroids.length) return;

    const asteroids = World.asteroids;

    for (let ai = asteroids.length - 1; ai >= 0; ai--) {
      const a = asteroids[ai];
      // don't immediately re-capture just-spawned bodies
      if (a.age && a.age < 0.25) continue;
      if (a.parentKind === "planet") continue;

      for (let pi = 0; pi < World.planets.length; pi++) {
        const p = World.planets[pi];
        if (p.captureCooldown > 0) continue;

        const dx = a.x - p.x;
        const dy = a.y - p.y;
        const d2 = dx*dx + dy*dy;
        const collideR = p.r + a.r;

        const capR = (p.orbitPx || (p.r * 2.6)) + a.r;
        if (d2 <= capR * capR) {
          if (p.isRocky) {
            const currentCount = countSystemOrbitersForRocky(p);
            const incomingCount = countOrbitersInBodySystem(a);
            if (p.rockyLocked || currentCount >= World.ROCKY_MAX_SYSTEM_ORBITERS) {
              p.rockyLocked = true;
              if (d2 <= collideR * collideR) {
                const absorbed = getDirectOrbitersOfBody(a);
                absorbBodiesIntoRocky(p, absorbed);
                removeOrbitersConsumed(absorbed);
                absorbBodiesIntoRocky(p, [a]);
                World.asteroids.splice(ai, 1);
                p.captureCooldown = 0.06;
                break;
              }
              continue;
            }
            if (currentCount + 1 > World.ROCKY_MAX_SYSTEM_ORBITERS) {
              p.rockyLocked = true;
              if (d2 <= collideR * collideR) {
                const absorbed = getDirectOrbitersOfBody(a);
                absorbBodiesIntoRocky(p, absorbed);
                removeOrbitersConsumed(absorbed);
                absorbBodiesIntoRocky(p, [a]);
                World.asteroids.splice(ai, 1);
                p.captureCooldown = 0.06;
                break;
              }
              continue;
            }
            if (currentCount + incomingCount > World.ROCKY_MAX_SYSTEM_ORBITERS) {
              const absorbed = getDirectOrbitersOfBody(a);
              absorbBodiesIntoRocky(p, absorbed);
              removeOrbitersConsumed(absorbed);
              a.orbiters = [];
              p.rockyLocked = true;
            }
          }
          const baseOrbit = (p.orbitPx || (p.r * 2.6));
          const orbitR = baseOrbit + a.r;
          const theta = Math.atan2(dy, dx);
          const Rm = meteorBaseRadius();
          const baseOmega = rand(0.35, 0.95);
          const direction = Math.random() < 0.5 ? -1 : 1;
          const omega = direction * computeOmega(baseOmega, orbitR, Rm);

          a.parentKind = "planet";
          a.parentRef = p;
          a.orbitR = orbitR;
          a.theta = theta;
          a.omega = omega;

          // Orbit expands only by the asteroid size (as per design)
          const minOrbit = p.r * 2.1;
          const maxOrbit = p.r * 10.0;
          p.orbitPx = clamp(baseOrbit + a.r, minOrbit, maxOrbit);

          if (p.isRocky && countSystemOrbitersForRocky(p) >= World.ROCKY_MAX_SYSTEM_ORBITERS) {
            p.rockyLocked = true;
          }
          p.captureCooldown = 0.06;
          break;
        }
      }
    }
  }


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

  function updatePlanets(dt) {
    const bounceLoss = 0.94;
    const b = getWorldViewBounds();
    for (let pi = 0; pi < World.planets.length; pi++) {
      const p = World.planets[pi];
      if (p.parentKind === "planet" && p.parentRef) {
        const parent = p.parentRef;
        p.theta = (p.theta || 0) + (p.omega || 0) * dt;
        const orbitR = (typeof p.orbitR === "number" && isFinite(p.orbitR)) ? p.orbitR : (parent.orbitPx || (parent.r * 2.6));
        p.x = parent.x + Math.cos(p.theta) * orbitR;
        p.y = parent.y + Math.sin(p.theta) * orbitR;
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        p.vx *= (1 - 0.01 * dt);
        p.vy *= (1 - 0.01 * dt);

        if (p.x - p.r < b.l) { p.x = b.l + p.r; p.vx = Math.abs(p.vx) * bounceLoss; }
        if (p.x + p.r > b.r) { p.x = b.r - p.r; p.vx = -Math.abs(p.vx) * bounceLoss; }
        if (p.y - p.r < b.t) { p.y = b.t + p.r; p.vy = Math.abs(p.vy) * bounceLoss; }
        if (p.y + p.r > b.b) { p.y = b.b - p.r; p.vy = -Math.abs(p.vy) * bounceLoss; }
      }

      // orbiters update
      if (p.orbiters && p.orbiters.length) {
        const Rm = meteorBaseRadius();
        for (const o of p.orbiters) {
          const absBase = Math.min(1.8, Math.max(0.18, Math.abs(o.omega)));
          const sign = o.omega >= 0 ? 1 : -1;
          const omegaDyn = sign * computeOmega(absBase, o.orbitR, Rm);
          o.angle += omegaDyn * dt;
        }
      }

      if (p.isRocky && p.rockyForm && p.rockyForm.active) {
        p.rockyForm.t += dt;
        if (p.rockyForm.phase === "shrink") {
          if (p.rockyForm.t >= p.rockyForm.shrinkDur) {
            p.rockyForm.phase = "fade";
            p.rockyForm.t = 0;
          }
        } else if (p.rockyForm.phase === "fade") {
          if (p.rockyForm.t >= p.rockyForm.fadeDur) {
            p.rockyForm.active = false;
            p.rockyForm.phase = "done";
          }
        }
      }

      if (p.planetKind === "gas") {
        const meteors = getSystemMeteorsForPlanet(p);
        const info = analyzeSystemMeteors(meteors);
        if (info.total >= World.STAR_RARE_MONO_MIN && info.monoOk && info.monoColorKey) {
          transformGasPlanetIntoStar(p, { ...info, dominantKey: info.monoColorKey }, "rare");
          World.planets.splice(pi, 1);
          pi -= 1;
          continue;
        }

        let req = Infinity;
        if (info.dominantKey === "blue") req = World.STAR_REQ_BLUE;
        else if (info.dominantKey === "green") req = World.STAR_REQ_GREEN;
        else if (info.dominantKey === "red") req = World.STAR_REQ_RED;
        else if (info.dominantKey === "yellow") req = World.STAR_REQ_YELLOW;

        if (info.total >= req) {
          transformGasPlanetIntoStar(p, info, "normal");
          World.planets.splice(pi, 1);
          pi -= 1;
          continue;
        }
      }

      p.gravityR = computeGravityFromPlanetRadius(p.r);

      if (p.isRocky && !p.spinLikeAsteroid) {
        for (const g of World.planets) {
          if (g === p || g.planetKind !== "gas") continue;
          const gravityR = (typeof g.gravityR === "number") ? g.gravityR : computeGravityFromPlanetRadius(g.r);
          const d = Math.hypot(g.x - p.x, g.y - p.y);
          const eps = Math.max(World.GAS_GRAVITY_CONTACT_EPS, p.r * 0.15);
          if (Math.abs(d - gravityR) <= eps) {
            p.spinLikeAsteroid = true;
            const sign = Math.random() < 0.5 ? -1 : 1;
            p.spinOmega = sign * rand(World.ROCKY_SPIN_OMEGA_MIN, World.ROCKY_SPIN_OMEGA_MAX);
            p.spinAngle = p.spinAngle || 0;
            break;
          }
        }
      }

      if (p.spinLikeAsteroid) {
        p.spinAngle = (p.spinAngle || 0) + (p.spinOmega || 0) * dt;
      }
    }
  }

  function updateStarBirths(dt) {
    if (!World.stars || !World.stars.length) return;
    for (const s of World.stars) {
      const birth = s.birth;
      if (!birth || !birth.active) continue;
      birth.t += dt;
      birth.timeAbs += dt;
      if (birth.phase === "collapse") {
        const u = clamp(birth.t / Math.max(0.001, birth.duration), 0, 1);
        for (const ab of birth.absorb) {
          ab.theta += (0.9 + u) * dt * 2.5;
          ab.r = ab.startR * (1 - u);
          ab.alpha = 1 - u;
        }
        if (birth.t >= birth.duration) {
          birth.phase = "fade";
          birth.t = 0;
        }
      } else if (birth.phase === "fade") {
        const v = clamp(birth.t / Math.max(0.001, birth.fadeOut), 0, 1);
        for (const ab of birth.absorb) {
          ab.alpha = 1 - v;
        }
        if (birth.t >= birth.fadeOut) {
          birth.active = false;
          for (const ab of birth.absorb) {
            if (ab.ref) ab.ref._dead = true;
          }
          birth.absorb = [];
        }
      }
    }
  }

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
    captureMeteorsByPlanets(dt, nowMs);
    captureAsteroidsByPlanets(dt, nowMs);
    HC.Asteroids.update(dt, nowMs);
    updatePlanets(dt);
    updateStarBirths(dt);
    captureBodiesByStars(dt);

    if (World.stars && World.stars.length) {
      for (const star of World.stars) {
        const birth = star?.starBirth || star?.birth;
        if (!birth || birth.phase !== "done") continue;
        if (star.starKind === "rare") {
          if (!star.sizeClass) star.sizeClass = "small";
          if (!star.gradientOuterColor) {
            star.gradientOuterColor = star.monoColorKey || star.dominantKey || "yellow";
          }
          continue;
        }
        if (star.sizeClass) continue;

        const orbitersCount = WorldAPI.countStarSystemOrbiters(star, { cap: Infinity });
        if (orbitersCount <= World.STAR_SIZE_SMALL_MAX_ORBITERS) {
          star.sizeClass = "small";
          star.gradientOuterColor = "yellow";
        } else if (orbitersCount <= World.STAR_SIZE_BIG_MAX_ORBITERS) {
          star.sizeClass = "big";
          star.gradientOuterColor = "blue";
        } else {
          star.sizeClass = "very_big";
          star.gradientOuterColor = "orangered";
        }
      }
    }
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
  window.addPlanetRingMark = addPlanetRingMark;
  window.getDirectOrbitersOfBody = getDirectOrbitersOfBody;
  window.buildColorWeightsFromOrbiters = buildColorWeightsFromOrbiters;
  window.computeRockyParamsFromOrbiters = computeRockyParamsFromOrbiters;
  window.buildBlobPatchwork = buildBlobPatchwork;
  window.makeRng = makeRng;
  window.hash32 = hash32;
  window.removeOrbitersConsumed = removeOrbitersConsumed;
  window.WorldAPI = WorldAPI;
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
