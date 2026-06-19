console.log("[HC] game.boot.js loaded");
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
  const ctx = canvas.getContext("2d", { alpha: true });
  window.HC = window.HC || {};
  if (!window.HC.RENDER_MODE) window.HC.RENDER_MODE = "three";
  // UI/DEBUG moved to hc.ui_debug.js

  const CardEngine = window.CardEngine;
  const bootState = {
    cardBound: false,
  };

  function tryBindCardEngine() {
    const CE = window.CardEngine;
    const world = (window.HC && HC.getWorld) ? HC.getWorld() : window.World;
    if (!CE || typeof CE.bindWorld !== "function") return false;
    if (!world) return false;
    CE.bindWorld(world);
    return true;
  }

  if (window.HC && window.HC.initViewInput) {
    window.HC.initViewInput({ canvas, ctx, CardEngine });
  }
  if (window.resizeCanvas) window.resizeCanvas();

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
    zoom: 1.0,
    x: 0,
    y: 0,
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
    const zoom = Camera.zoom || Camera.scale || 1;
    const camX = Number.isFinite(Camera.x) ? Camera.x : cx;
    const camY = Number.isFinite(Camera.y) ? Camera.y : cy;
    return { x: (x - cx) / zoom + camX, y: (y - cy) / zoom + camY };
  };
  const getWorldViewBounds = (window.HC && window.HC.getWorldViewBounds) || window.getWorldViewBounds || function getWorldViewBoundsFallback() {
    const cx = View.w / 2;
    const cy = View.h / 2;
    const zoom = Camera.zoom || Camera.scale || 1;
    const camX = Number.isFinite(Camera.x) ? Camera.x : cx;
    const camY = Number.isFinite(Camera.y) ? Camera.y : cy;
    const halfW = (View.w / 2) / zoom;
    const halfH = (View.h / 2) / zoom;
    return { l: camX - halfW, r: camX + halfW, t: camY - halfH, b: camY + halfH, cx: camX, cy: camY };
  };

  // ---------- Helpers ----------
  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  const METEOR_BASE_SCALE = 2;

  function meteorBaseScale() {
    const worldScale = Number(window.World?.meteorBaseScale ?? METEOR_BASE_SCALE);
    return Number.isFinite(worldScale) && worldScale > 0 ? worldScale : METEOR_BASE_SCALE;
  }

  function meteorBaseRadius() {
    return View.worldScale * 0.008 * meteorBaseScale();
  }

  function getMeteorCollisionRadius(meteor) {
    const r = Number(meteor && (meteor.collisionRadius ?? meteor.physicalRadius ?? meteor.r ?? meteor.radius ?? meteor.size));
    return Number.isFinite(r) && r > 0 ? r : meteorBaseRadius();
  }

  function getMeteorRenderScale(meteor) {
    return getMeteorCollisionRadius(meteor);
  }

  function massFromR(r) { return r * r; }

  // ---------- World state ----------
  const World = {
    meteors: [],
    asteroids: [],
    planets: [],
    moons: [],
    dustClouds: [],
    dustParticles: [],
    impactFragments: [],
    harmonicDust: [],
    harmonicDustCollected: { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0 },
    harmonicDustDeposits: { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0, GRAY: 0 },
    harmonicDustSequence: { colorName: null, step: 0, lastCollisionAt: 0 },
    harmonicDustReservoir: { activeColorName: null, isMixedGray: false, fillPercent: 0, pureFillPercent: 0, grayFillPercent: 0, lastCollectedColorName: null, samplesCollected: 0 },

    // Space mechanics runtime contract: direct HC.Impact contact is the live planet impact path.
    spaceMechanics: {
      asteroidToMoonMassThreshold: 13,
      asteroidToMoonEnabled: true,
      moonToRockyPlanetMassThreshold: 34,
      moonToRockyPlanetEnabled: true,
      dustCloudToGasPlanetMassThreshold: 55,
      dustDragStrength: 0.15,
      dustStopSpeedThreshold: 0.02,
      dustMergeDistanceMul: 1.0,
      cometIgnitionEnabled: true,
      dustBurnDurationMs: 8000,
      orbitMinSafeDistanceMul: 1.2,
      gasPlanetRotationXSpeed: 0.12,
      harmonicDustMergeRadiusMul: 2.0,
      harmonicDustStepPercents: [10, 20, 50],
      harmonicDustSequenceMaxStep: 3,
      harmonicDustBaseCollectMs: 2400,
      harmonicDustPercentCollectMsMul: 55,
      harmonicDustMaxReservoirPercentValue: 100,
      harmonicDustMixedIncomingPercent: 10,
      harmonicDustMassCollectMsMul: 850,
      harmonicDustCollectDecayMul: 0.35,
      harmonicDustPrgCollectRateMul: 1.0,
      harmonicDustMaxCollectMs: 8000,
      planetImpactAbsorbPercent: 0.22,
      planetImpactExplosionPercent: 0.28,
      planetImpactEjectaPercent: 0.35,
      planetImpactOrbiterPercent: 0.15,
      planetImpactFirstOrbiterChance: 0.55,
      planetImpactNextOrbiterChanceWhenExistingOrbiterMax: 0.25,
      planetImpactAbsorbMassMaxWhenOrbiterExists: 0.30,
      moonImpactAbsorbMassMax: 0.30,
      moonImpactAbsorbPercent: 0.24,
      moonImpactExplosionPercent: 0.26,
      moonImpactEjectaPercent: 0.32,
      moonImpactDustPercent: 0.18,
      moonCanCreateOrbiters: false,
      impactEjectaMinMass: 0.08,
      impactEjectaMaxPieces: 5,
      impactFragmentTtlMs: 6000
    },

    flags: { firstPlanetZoomed: false, firstStarZoomed: false },

    spawnTimer: 0,
    spawnInterval: 1.0,
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
meteorBaseScale: METEOR_BASE_SCALE,


    // Difficulty knobs (cards / runs):
    asteroidDriftMul: 0.55,   // <- drift multiplier for new asteroids

    // Legacy aliases for asteroid mass progression. The active Patch 2 path reads
    // World.spaceMechanics.asteroidToMoonMassThreshold and transforms into a moon.
    asteroidGrowthTarget: 13,
    planetCaptureTarget: 13,

    // Star size thresholds (cards can tune)
    STAR_SIZE_SMALL_MAX_ORBITERS: 23,
    STAR_SIZE_BIG_MAX_ORBITERS: 66,
    STAR_RARE_MONO_MIN: 13,
    STAR_REQ_BLUE: 30,
    STAR_REQ_GREEN: 30,
    STAR_REQ_RED: 30,
    STAR_REQ_YELLOW: 30,
    STAR_COLOR_KEY_BLUE: "blue",
    STAR_COLOR_KEY_GREEN: "green",
    STAR_COLOR_KEY_RED: "red",
    STAR_COLOR_KEY_YELLOW: "yellow",
    starDominancePctBase: 0.30,
    starThresholdMultiplierThisRun: 1.0,
    STAR_THRESHOLD_INTERRUPT_MULT: 1.3,
    PRESTAR_DURATION_MIN: 10.0,
    PRESTAR_DURATION_MAX: 20.0,
    PRESTAR_PULSE_FREQ: 0.22,
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
    collectedCardsByColor: { red: 0, yellow: 0, green: 0, blue: 0 },
    metaSlots: { forma: null, intencja: null, czas: null, cisza: null },
    subMetaOpen: false,
    subMetaShownThisRun: false,
    paused: true,
    pack01ReleaseBlockColor: null,
    pack01ReleaseBlockUntilMs: 0,
    meteorBounceEnabled: false,
  };
  // Bind CardEngine to World (foundation under Card Editor)
  bootState.cardBound = tryBindCardEngine();



  // COMETS moved to hc.comets.js

  // ---------- API (future cards) ----------
  function setAsteroidOrbitRadius(asteroid, currentRadius) {
    // Legacy compatibility no-op: asteroids no longer have capture/orbit radii.
    if (!asteroid) return;
    asteroid.orbitNativeRadius = null;
    asteroid.orbitCurrentRadius = null;
    asteroid.orbitPx = null;
  }

  const WorldAPI = {
    adjustAsteroidOrbitByMeteorRadii(asteroid, deltaCount) {
      // Legacy compatibility no-op: asteroid orbit radius was retired in favor of direct-contact growth.
      setAsteroidOrbitRadius(asteroid, null);
    },

    removeOrbiters(asteroid, count) {
      // Legacy compatibility: new asteroids do not own meteor orbiters.
      return [];
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
      // Legacy compatibility no-op: asteroids no longer maintain meteor orbiters.
    }
  };

  /* =========================================================
     Part 2/3
     - Meteors: spawn
     - Asteroids: creation mapping + drift (vx/vy) + direct-contact growth stats
     - Planets: gradient helper
     - Rendering helpers
     ========================================================= */

  // ---------- Meteor palette ----------
  const MeteorColors = window.MeteorColors;
  function hueFromName(name) {
    const c = MeteorColors.find(x => x.name === name);
    return c ? c.hue : 0;
  }
  // METEORS moved to hc.meteors.js

  // STARS+EPOCH moved to hc.stars_epoch.js

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
    // KANON v1: planeta = r + 20%
    return r * 1.20;
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

  // STARS+EPOCH moved to hc.stars_epoch.js

  // ASTEROIDS moved to hc.asteroids.js

  // RENDER moved to hc.render.js

  // PLANETS moved to hc.planets.js


   /* =========================================================
     Part 3/3
     - Collisions meteor-meteor
     - Direct growth -> asteroid mass increments; no asteroid capture/orbit radius
     - Asteroid drift/bounce + collapse -> planet
     - Update/render loop + restart + FPS
     ========================================================= */

  // COLLISIONS moved to hc.collisions.js

  // omega ~ 1/sqrt(r)
  function computeOmega(baseOmega, orbitRpx, Rm) {
    const rNorm = Math.max(0.25, orbitRpx / (6 * Rm));
    return baseOmega / Math.sqrt(rNorm);
  }

  // ASTEROIDS moved to hc.asteroids.js

  // PLANETS moved to hc.planets.js

  // STARS+EPOCH moved to hc.stars_epoch.js

  // METEORS moved to hc.meteors.js

  if (window.HC && window.HC.Camera && !window.HC.Camera.update) {
    window.HC.Camera.update = (dt, view) => {
      if (Camera.epochZoom && Camera.epochZoom.active) {
        Camera.epochZoom.t += dt;
        const u = Math.min(1, Camera.epochZoom.t / Math.max(0.001, Camera.epochZoom.dur));
        const e = (u < 0.5) ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
        Camera.zoom = Camera.epochZoom.fromZoom + (Camera.epochZoom.toZoom - Camera.epochZoom.fromZoom) * e;
        if (u >= 1) Camera.epochZoom.active = false;
      } else {
        Camera.target = clamp(Camera.target, Camera.min, Camera.max);
        Camera.zoom += (Camera.target - Camera.zoom) * Camera.ease;
      }
      Camera.scale = Camera.zoom;
    };
  }

  function update(dt, nowMs) {
    World.nowMs = nowMs;
    if (!bootState.cardBound) bootState.cardBound = tryBindCardEngine();

    if (window.HC && window.HC.Camera && window.HC.Camera.update) {
      window.HC.Camera.update(dt, (window.HC.getView && window.HC.getView()) || View);
    }

    // input -> world coords (because render uses Camera.zoom)
    const wp = screenToWorld(Input.x, Input.y);
    Input.wx = wp.x;
    Input.wy = wp.y;

    // epoch zoom triggers
    if (!World.flags.firstPlanetZoomed && World.planets.length >= 1) {
      World.flags.firstPlanetZoomed = true;
      Camera.target = 0.65;
    }

    if (HC.Meteors) HC.Meteors.update(dt, nowMs);
    if (HC.Comets) HC.Comets.update(dt, nowMs);
    if (HC.Collisions) HC.Collisions.resolve(dt, nowMs);
    if (HC.HarmonicDust) HC.HarmonicDust.update(dt, nowMs);
    if (HC.Impact?.updateFragments) HC.Impact.updateFragments(World, nowMs, dt);
    if (HC.Asteroids) HC.Asteroids.capture(dt, nowMs);
    if (HC.Planets) HC.Planets.capture(dt, nowMs);
    if (HC.Asteroids) HC.Asteroids.update(dt, nowMs);
    if (HC.Planets) HC.Planets.update(dt, nowMs);
    if (HC.Stars) HC.Stars.update(dt, nowMs);

    // CardEngine runtime (offers, timed effects, rituals)
    const CE = window.CardEngine;
    if (CE && typeof CE.update === "function") {
      CE.update(dt, nowMs);
    }
  }

  // RENDER moved to hc.render.js

  window.World = World;
  window.View = View;
  window.Camera = Camera;
  window.ctx = ctx;
  window.Input = Input;
  window.CardEngine = window.CardEngine || CardEngine;
  window.rand = rand;
  window.clamp = clamp;
  window.METEOR_BASE_SCALE = METEOR_BASE_SCALE;
  window.meteorBaseScale = meteorBaseScale;
  window.meteorBaseRadius = meteorBaseRadius;
  window.getMeteorCollisionRadius = getMeteorCollisionRadius;
  window.getMeteorRenderScale = getMeteorRenderScale;
  window.massFromR = massFromR;
  window.computeGravityFromPlanetRadius = computeGravityFromPlanetRadius;
  window.computeOmega = computeOmega;
  window.getWorldViewBounds = getWorldViewBounds;
  window.hueFromName = hueFromName;
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
  if (window.HC && window.HC.initHarmonicDust && !window.HC.HarmonicDust) {
    window.HC.initHarmonicDust();
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
    const buildCardBank = () => ({
      R1: {
        red: { DR: 0, sDR: 0, pDR: 0 },
        yellow: { DR: 0, sDR: 0, pDR: 0 },
        green: { DR: 0, sDR: 0, pDR: 0 },
        blue: { DR: 0, sDR: 0, pDR: 0 },
      },
      R2: {
        "red-yellow": { DR: 0, sDR: 0, pDR: 0 },
        "red-green": { DR: 0, sDR: 0, pDR: 0 },
        "red-blue": { DR: 0, sDR: 0, pDR: 0 },
        "yellow-green": { DR: 0, sDR: 0, pDR: 0 },
        "yellow-blue": { DR: 0, sDR: 0, pDR: 0 },
        "green-blue": { DR: 0, sDR: 0, pDR: 0 },
      }
    });
    World.meteors = [];
    World.asteroids = [];
    World.planets = [];
    World.moons = [];
    World.spaceMechanics = Object.assign({}, World.spaceMechanics, {
      asteroidToMoonMassThreshold: Number(World.spaceMechanics?.asteroidToMoonMassThreshold) || 13,
      asteroidToMoonEnabled: World.spaceMechanics?.asteroidToMoonEnabled !== false,
      moonToRockyPlanetMassThreshold: Number(World.spaceMechanics?.moonToRockyPlanetMassThreshold) || 34,
      moonToRockyPlanetEnabled: World.spaceMechanics?.moonToRockyPlanetEnabled !== false,
      harmonicDustMergeRadiusMul: Number(World.spaceMechanics?.harmonicDustMergeRadiusMul) || 2.0,
      harmonicDustStepPercents: Array.isArray(World.spaceMechanics?.harmonicDustStepPercents) ? World.spaceMechanics.harmonicDustStepPercents.slice(0, 3) : [10, 20, 50],
      harmonicDustSequenceMaxStep: Number(World.spaceMechanics?.harmonicDustSequenceMaxStep) || 3,
      harmonicDustBaseCollectMs: Number(World.spaceMechanics?.harmonicDustBaseCollectMs) || 2400,
      harmonicDustPercentCollectMsMul: Number(World.spaceMechanics?.harmonicDustPercentCollectMsMul) || 55,
      harmonicDustMaxReservoirPercentValue: Number(World.spaceMechanics?.harmonicDustMaxReservoirPercentValue) || 100,
      harmonicDustMixedIncomingPercent: Number(World.spaceMechanics?.harmonicDustMixedIncomingPercent) || 10,
      harmonicDustMassCollectMsMul: Number(World.spaceMechanics?.harmonicDustMassCollectMsMul) || 850,
      harmonicDustCollectDecayMul: Number(World.spaceMechanics?.harmonicDustCollectDecayMul) || 0.35,
      harmonicDustPrgCollectRateMul: Number(World.spaceMechanics?.harmonicDustPrgCollectRateMul) || 1.0,
      harmonicDustMaxCollectMs: Number(World.spaceMechanics?.harmonicDustMaxCollectMs) || 8000,
      planetImpactAbsorbPercent: Number(World.spaceMechanics?.planetImpactAbsorbPercent) || 0.22,
      planetImpactExplosionPercent: Number(World.spaceMechanics?.planetImpactExplosionPercent) || 0.28,
      planetImpactEjectaPercent: Number(World.spaceMechanics?.planetImpactEjectaPercent) || 0.35,
      planetImpactOrbiterPercent: Number(World.spaceMechanics?.planetImpactOrbiterPercent) || 0.15,
      planetImpactFirstOrbiterChance: Number(World.spaceMechanics?.planetImpactFirstOrbiterChance) || 0.55,
      planetImpactNextOrbiterChanceWhenExistingOrbiterMax: Number(World.spaceMechanics?.planetImpactNextOrbiterChanceWhenExistingOrbiterMax) || 0.25,
      planetImpactAbsorbMassMaxWhenOrbiterExists: Number(World.spaceMechanics?.planetImpactAbsorbMassMaxWhenOrbiterExists) || 0.30,
      moonImpactAbsorbMassMax: Number(World.spaceMechanics?.moonImpactAbsorbMassMax) || 0.30,
      moonImpactAbsorbPercent: Number(World.spaceMechanics?.moonImpactAbsorbPercent) || 0.24,
      moonImpactExplosionPercent: Number(World.spaceMechanics?.moonImpactExplosionPercent) || 0.26,
      moonImpactEjectaPercent: Number(World.spaceMechanics?.moonImpactEjectaPercent) || 0.32,
      moonImpactDustPercent: Number(World.spaceMechanics?.moonImpactDustPercent) || 0.18,
      moonCanCreateOrbiters: World.spaceMechanics?.moonCanCreateOrbiters === true,
      impactEjectaMinMass: Number(World.spaceMechanics?.impactEjectaMinMass) || 0.08,
      impactEjectaMaxPieces: Number(World.spaceMechanics?.impactEjectaMaxPieces) || 5,
      impactFragmentTtlMs: Number(World.spaceMechanics?.impactFragmentTtlMs) || 6000,
    });
    World.dustClouds = [];
    World.dustParticles = [];
    World.impactFragments = [];
    World.harmonicDust = [];
    World.harmonicDustCollected = { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0 };
    World.harmonicDustDeposits = { RED: 0, YELLOW: 0, GREEN: 0, BLUE: 0, GRAY: 0 };
    World.harmonicDustSequence = { colorName: null, step: 0, lastCollisionAt: 0 };
    if (window.HC?.HarmonicDust?.resetHarmonicDustReservoir) window.HC.HarmonicDust.resetHarmonicDustReservoir(World);
    else World.harmonicDustReservoir = { activeColorName: null, isMixedGray: false, fillPercent: 0, pureFillPercent: 0, grayFillPercent: 0, lastCollectedColorName: null, samplesCollected: 0 };
    World.stars = [];
    World.spawnTimer = 0;
    World.meteorBaseScale = METEOR_BASE_SCALE;
    World.score = 0;
    World.epoch = null;
    World.epochTriggered = false;
    World.epochAt = 0;
    World.meteorStreams = null;
    World.starThresholdMultiplierThisRun = 1.0;
    World.collectedCardsByColor = { red: 0, yellow: 0, green: 0, blue: 0 };
    World.cardBank = buildCardBank();
    World._cardBankMigrated = true;
    World.r1ColorTimers = {};
    World.pack01ReleaseBlockColor = null;
    World.pack01ReleaseBlockUntilMs = 0;
    World.meteorBounceEnabled = false;
    World.metaSlots = { forma: null, intencja: null, czas: null, cisza: null };
    World.subMetaOpen = false;
    World.subMetaShownThisRun = false;
    World.paused = false;
    if (Camera.epochZoom) {
      Camera.epochZoom.active = false;
      Camera.epochZoom.t = 0;
      Camera.epochZoom.fromZoom = Camera.zoom || Camera.scale || 1;
      Camera.epochZoom.toZoom = Camera.zoom || Camera.scale || 1;
      Camera.epochZoom.targetX = 0;
      Camera.epochZoom.targetY = 0;
    }

    // Reset epoch/zoom state
    World.flags = { firstPlanetZoomed: false, firstStarZoomed: false };
    Camera.zoom = 1.0;
    Camera.scale = 1.0;
    Camera.target = 1.0;

    if (window.CardEngine && typeof window.CardEngine.resetForNewRun === "function") {
      window.CardEngine.resetForNewRun();
    }
    if (window.HC?.RunTimers?.reset) {
      window.HC.RunTimers.reset(World);
    }
  }
  window.resetWorld = resetWorld;
  if (window.HC) window.HC.resetWorld = resetWorld;

  if (window.HC && window.HC.UI && window.HC.UI.init) {
    window.HC.UI.init();
  }
  if (window.HC && window.HC.WorldRenderer && typeof window.HC.WorldRenderer.init === "function") {
    window.HC.WorldRenderer.init({ mode: window.HC.RENDER_MODE || "three" });
  }
  bootState.cardBound = tryBindCardEngine();


  function syncCanvasLayerMode() {
    const rendererDiag = window.HC?.WorldRenderer?.getDiagnostics ? window.HC.WorldRenderer.getDiagnostics() : null;
    const effectiveMode = rendererDiag?.effectiveMode || window.HC?.RENDER_MODE || "canvas2d";
    if (effectiveMode === "three") {
      canvas.style.background = "transparent";
      canvas.style.opacity = "1";
      canvas.style.visibility = "visible";
      if (ctx && typeof ctx.clearRect === "function") {
        ctx.clearRect(0, 0, View.w || canvas.width || 0, View.h || canvas.height || 0);
      }
    } else {
      canvas.style.background = "#000";
      canvas.style.opacity = "1";
      canvas.style.visibility = "visible";
    }
  }

  let last = performance.now();
  let frameIndex = 0;

  function frame(now) {
    frameIndex += 1;
    const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
    last = now;
    if (window.HC?.Session?.setFrame) window.HC.Session.setFrame(frameIndex);

    const dtWorld = World.paused ? 0 : dt;
    update(dtWorld, now);
    const renderSnapshot = (window.HC && window.HC.WorldRenderSnapshot && typeof window.HC.WorldRenderSnapshot.build === "function")
      ? window.HC.WorldRenderSnapshot.build({
        World,
        Camera,
        View,
        Input,
        getWorldViewBounds,
        nowMs: now,
        dt,
      })
      : null;

    let renderedByAdapter = false;
    if (window.HC && window.HC.WorldRenderer && typeof window.HC.WorldRenderer.render === "function") {
      try {
        window.HC.WorldRenderer.render(renderSnapshot, now, dt);
        renderedByAdapter = true;
      } catch (err) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn("[HC] WorldRenderer render failed, falling back to HC.Render.frame", err);
        }
      }
    }
    if (!renderedByAdapter && HC.Render && typeof HC.Render.frame === "function") {
      HC.Render.frame(now, dt);
    }

    syncCanvasLayerMode();

    if (window.HC && window.HC.UI && window.HC.UI.update) {
      window.HC.UI.update(dt, now);
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

})(); // end IIFE
