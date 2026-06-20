// HC canonical planets subsystem: rocky planets are passive bodies only.
(function () {
  window.HC = window.HC || {};

  window.HC.initPlanets = () => {
    const World = (window.HC.getWorld && window.HC.getWorld()) || window.World;

    function legacyDisabled(message) {
      throw new Error(message || "Legacy star/gas/capture system disabled");
    }

    function isDebugPlanet(p) {
      return p?.debugSpawn === true && p?.sourcePath === "debug_bootstrap";
    }

    function isCanonicalRockyPlanet(p) {
      return !!p
        && (p.type === "planet" || p.kind === "planet")
        && (p.planetKind === "rocky" || p.isRocky === true)
        && p.sourcePath === "moon_to_rocky_planet"
        && p.allowedProgressionPath === true
        && p.validProgressionOrigin === true
        && !!p.sourceMoonId;
    }

    function assertCanonicalPlanetRuntime(p) {
      if (!p || p._dead) return;
      if (p.planetKind === "gas" || p.isGas === true || p.starKind || p.preStar) {
        legacyDisabled("Legacy star/gas/capture system disabled");
      }
      if ((Array.isArray(p.orbiters) && p.orbiters.length > 0) || p.parentKind || p.parentRef || Number(p.captureCooldown) > 0) {
        legacyDisabled("LEGACY_CAPTURE_ORBIT_DISABLED");
      }
      if ((p.planetKind === "rocky" || p.isRocky === true) && !isCanonicalRockyPlanet(p) && !isDebugPlanet(p)) {
        p.invalidPlanetOrigin = true;
        legacyDisabled("LEGACY_ASTEROID_TO_PLANET_DISABLED");
      }
      if (window.HC?.SpaceBodies?.refreshBodyRadiusFromMass && Number(p.mass) > 0) {
        window.HC.SpaceBodies.refreshBodyRadiusFromMass(p, { kind: "planet", sourceFunction: "Planets.assertCanonicalPlanetRuntime" });
      }
      p.vx = 0;
      p.vy = 0;
      p.stationary = true;
    }

    window.finalizePlanetSpawn = function legacyFinalizePlanetSpawn() { legacyDisabled("LEGACY_ASTEROID_TO_PLANET_DISABLED"); };
    window.transformGasPlanetIntoStar = function legacyTransformGasPlanetIntoStar() { legacyDisabled("Legacy star/gas/capture system disabled"); };
    window.buildColorWeightsFromOrbiters = function legacyBuildColorWeightsFromOrbiters() { legacyDisabled("LEGACY_CAPTURE_ORBIT_DISABLED"); };
    window.computeRockyParamsFromOrbiters = function legacyComputeRockyParamsFromOrbiters() { legacyDisabled("LEGACY_CAPTURE_ORBIT_DISABLED"); };
    window.addPlanetRingMark = function legacyAddPlanetRingMark() { legacyDisabled("LEGACY_CAPTURE_ORBIT_DISABLED"); };

    window.HC.Planets = Object.assign(window.HC.Planets || {}, {
      capture() { legacyDisabled("LEGACY_CAPTURE_ORBIT_DISABLED"); },
      update() {
        if (!Array.isArray(World?.planets)) return;
        for (const p of World.planets) assertCanonicalPlanetRuntime(p);
      },
      transformAsteroidIntoRockyPlanet() { legacyDisabled("LEGACY_ASTEROID_TO_PLANET_DISABLED"); },
      transformGasPlanetIntoStar() { legacyDisabled("Legacy star/gas/capture system disabled"); },
      assertCanonicalPlanetRuntime,
      isCanonicalRockyPlanet,
    });
  };
})();
