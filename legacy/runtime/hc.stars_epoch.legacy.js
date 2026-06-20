// HC stars + epoch subsystem (extracted)
(function () {
  window.HC = window.HC || {};

  window.HC.initStarsEpoch = () => {
    const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;
    const Events = window.Events;
    const util = (window.HC && window.HC.Util) || window.HC?.Util;
    const clamp = (util && util.clamp) || window.clamp;
    const rand = window.rand;
    const meteorBaseRadius = window.meteorBaseRadius;
    const computeGravityFromPlanetRadius = window.computeGravityFromPlanetRadius;
    const computeOmega = window.computeOmega;
    const hueFromName = window.hueFromName;
    const getDirectOrbitersOfBody = window.getDirectOrbitersOfBody;
    const removeOrbitersConsumed = window.removeOrbitersConsumed;
    const WorldAPI = window.WorldAPI;
    const cam = (window.HC.getCamera && window.HC.getCamera()) || window.Camera;
    const view = (window.HC.getView && window.HC.getView()) || window.View;

    function startStarEpochZoomOut(star, screenW, screenH) {
      if (!star) return;
      if (star._epochZoomStarted) return;
      const margin = 0.88;
      const minHalf = Math.min(screenW, screenH) * 0.5 * margin;
      const desiredFit = minHalf / Math.max(1e-6, (star.gravityR || (star.r * 1.30)));
      const nudge = cam.scale * 0.86;
      const toZoom = Math.min(desiredFit, nudge);

      cam.epochZoom.active = true;
      cam.epochZoom.t = 0;
      cam.epochZoom.dur = 2.0;
      cam.epochZoom.fromZoom = cam.scale;
      cam.epochZoom.toZoom = toZoom;
      cam.epochZoom.targetX = star.x;
      cam.epochZoom.targetY = star.y;

      if (!World.epochTriggered) {
        World.epoch = "STAR";
        World.epochTriggered = true;
        World.epochAt = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
      }
      star._epochZoomStarted = true;
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

    function attachBodyToStarSystem(o, s) {
      if (o.starBoundId != null && o.starBoundId !== (s.id || s._id)) return;
      const dx = o.x - s.x;
      const dy = o.y - s.y;
      const d = Math.hypot(dx, dy) || 1;
      const minR = Math.max(1, s.r + o.r + 2);
      const maxR = Math.max(1, (s.gravityR || (s.r * 1.30)) - o.r - 2);
      const baseOrbitRadius = clamp(d, minR, maxR);
      const orbitR = baseOrbitRadius * ((typeof World.metaOrbitMulStar === "number") ? World.metaOrbitMulStar : 1);
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
        const gravityR = s.gravityR || (s.r * 1.30);
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

    function updateStars(dt) {
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

    window.startStarEpochZoomOut = startStarEpochZoomOut;
    window.reconcileStarOwnershipOnBirth = reconcileStarOwnershipOnBirth;

    window.HC.Stars = {
      update(dt, nowMs) {
        updateStars(dt);
      },
      transformGasPlanetIntoStar: window.transformGasPlanetIntoStar,
    };
  };
})();
