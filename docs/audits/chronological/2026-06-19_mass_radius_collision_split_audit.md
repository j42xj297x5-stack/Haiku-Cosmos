# Audyt mass/radius model i collision split model — 2026-06-19

## 1. EXECUTIVE SUMMARY

Obecny runtime jest częściowo spójny, ale nie ma jednego globalnego kontraktu `mass -> radius -> collision/view radius` dla wszystkich typów. Najbliżej kontraktu jest `HC.SpaceBodies.radiusFromMass(kind, mass, options)`, ale meteory, asteroidy legacy, planety i pyły mają własne wzory, clampy i mnożniki renderera. Najważniejszy rozjazd: Three.js asteroidy celowo renderuje GLB w skali `0.82` promienia snapshotu, podczas gdy collision używa `a.r`, więc widzialna bryła GLB może być mniejsza niż powierzchnia kolizji. Meteor GLB ma dodatkowy debugowy `meteorGlbVisualScale`, który także może zmienić tylko visual bez zmiany kolizji.

Split kolizji jest mieszany: `HC.CosmicDust.applySplitPolicy` dla większości par live liczy split z masy incoming/lżejszego obiektu i zwykle nie podwaja masy, ale `meteor_meteor` tworzy asteroidę o stałej masie `1` oraz cosmic dust z procentu sumy obu meteorów, więc nie spełnia docelowego modelu „rozkładaj masę lżejszego”. `planet_planet` jest descriptor/foundation i liczy pył oraz fragmenty z sumy obu mas. Dodatkowo istnieją starsze helpery impact (`HC.Impact`) i legacy planet/foundation ścieżki, które są descriptor-only albo nie są aktywną ścieżką bez dodatkowych wywołań.

## 2. LISTA SPRAWDZONYCH PLIKÓW

- `hc.space_bodies.js` — kontrakt pomocniczy kind/mass/radius/collision radius.
- `hc.collisions.js` — live meteor+meteor collision: same-color harmonicDust, different-color asteroid + cosmicDust split.
- `hc.meteors.js` — spawn meteorów, `r`, `mass = r*r`, Canvas2D meteor radius.
- `hc.asteroids.js` — spawn/absorpcja asteroid, asteroid→moon, moon→rocky planet, asteroid+asteroid, moon direct absorptions.
- `hc.planets.js` — legacy/foundation planet helpers, finalize radius/orbit, planet capture/direct impact helpers.
- `hc.impact.js` — pure impact descriptors and impactFragments.
- `hc.cosmic_dust.js` — cosmicDust defaults, mass split policy, cloud radius, optional physical influence.
- `hc.harmonic_dust.js` — harmonicDust creation/merge, mass/radius/density, Canvas2D visual, PRG collection, moon dust rings.
- `hc.world_render_snapshot.js` — shared render snapshot fields: `r`, `radius`, `collisionRadius`, `mass`, `density`, `visual`.
- `hc.render.js` — Canvas2D facade; world drawing calls and fallback planet drawing.
- `hc.world_renderer.js` — Three.js GLB/fallback scale sources for meteors, asteroids, moons, planets, harmonicDust, cosmicDust.
- `game.boot.js` — base helpers, world defaults, thresholds and split percentages.
- `hc.debug.js`, `hc.ui_debug.js` — debug exposure of diagnostics/settings, no active collision-rules editor.
- `tests/cosmic_dust_vm.test.js`, `tests/harmonic_dust_vm.test.js` — VM expectations for split, dust distinction, snapshot fields and visual model.
- `scripts/test_impact_vm.mjs`, `scripts/test_space_patch2_vm.mjs`, `scripts/test_space_patch3_vm.mjs` — impact split, moon/planet progression and snapshot checks.

## 3. MASS MODEL AUDIT

### Meteor

- Creation: `spawnMeteor` and `spawnStreamMeteor` set random `r` around `meteorBaseRadius()` and set `mass: massFromRadius(r)`; `massFromRadius` is `r*r` through `HC.SpaceBodies` or fallback.
- Mutation: normally not grown. In split code, meteor mass is read as source and meteor is removed/dead.
- Notes: gameplay target says meteor mass should be ~`0.5m–1m`, but current runtime mass is pixel-radius squared, so with default base radius it is much larger than unit-meteor semantics.

### Asteroid

- Creation from different-color meteors: `spawnAsteroidFromCollision` uses `initialMass = 1`, independent of input meteor masses; drift momentum uses both meteor masses.
- Growth from meteor+asteroid: live path uses `HC.CosmicDust.applySplitPolicy('meteor_asteroid')`; asteroid gets `20%` of meteor mass by default. Fallback `absorbMeteorIntoAsteroid` adds fixed `meteorMass = 1`.
- Asteroid+asteroid: live path sorts heavier/lighter in `resolveAsteroidAsteroidContacts`, then `mergeAsteroids(primary, secondary)`; when cosmic dust is present, primary gets `50%` of secondary mass and dust gets `50%` of secondary mass.
- Threshold: asteroid→moon default threshold is `spaceMechanics.asteroidToMoonMassThreshold = 13`.

### Moon

- Creation: `createMoonFromAsteroid` copies asteroid mass and `r` into a free moon.
- Growth: `moon_meteor` adds `70%` meteor mass; `moon_asteroid` adds `30%` asteroid mass and spawns fragments with `40%` asteroid mass; legacy/no-cosmic fallback via `HC.Impact.resolveMoonImpact` caps absorbed mass at `moonImpactAbsorbMassMax`.
- Threshold: moon→rocky planet default threshold is `spaceMechanics.moonToRockyPlanetMassThreshold = 34`.

### Rocky planet

- Creation: live current path is free moon threshold; `transformMoonToRockyPlanet` copies moon mass and derives planet radius via `SpaceBodies.radiusFromMass('planet', mass, ...)` with min current moon radius and `maxRockyPlanetRadius`.
- Mutation: planet+meteor adds `50%` meteor mass in `HC.CosmicDust.applySplitPolicy`. Planet+asteroid and planet+moon currently do not add absorb mass in cosmic split; they produce dust/fragments/orbiterCandidate descriptor only.

### Gas planet

- Foundation/defaults exist via `dustCloudToGasPlanetMassThreshold = 55` and `cosmicDustCloudToGasPlanetMassThreshold = 999999`, but cosmicDust condensation is disabled. No audited live gas planet creation path is active in this task.

### Star

- Star objects are present in world arrays and planet-to-star is disabled by default. This audit did not find a live mass/radius growth path in the required files; star mass/radius is outside the active collision split.

### harmonicDust

- Creation: same-color meteor collision calls `HC.HarmonicDust.createOrMergeFromMeteorCollision`; mass is from input body masses, radius uses `radiusForMass(World, mass, fallback)` and density defaults around harmonic dust settings.
- Mutation: merge increases mass/density; collection decreases progress state and reservoir values; asteroid gray-shift changes transform state, not mass; moon mini-ring absorption subtracts `absorbedMass` from dust mass and updates radius from remaining mass.

### cosmicDust

- Creation: `HC.CosmicDust.createCloud` clamps mass to `cosmicDustMinMass`, sets `density`, and derives `r` from `sqrt(mass/density) * cosmicDustRadiusMassMul` clamped between `cosmicDustMinVisualRadius` and `cosmicDustMaxVisualRadius`.
- Mutation: merge combines masses and max density, then recomputes radius; optional physical influence changes velocities only when enabled, not mass.

### impactFragments

- Creation: `HC.Impact.spawnEjecta` splits ejecta mass evenly across pieces and sets `mass: total/count`. In cosmic split paths, `spawnFragments` forwards `fragmentMass` as ejecta.
- Mutation: `updateFragments` only ages/expires fragments; no mass growth.

## 4. RADIUS MODEL AUDIT

- Global helper: `SpaceBodies.getBodyRadius` prefers `radius`, `r`, `visualRadius`, `physicalRadius`, `size`; `getCollisionRadius` prefers `collisionRadius`, `physicalRadius`, `r`, `radius`, `visualRadius`, `size`; `radiusFromMass(kind,mass)` uses `sqrt(mass/density) * baseRadius` and world clamps for asteroid/moon/planet.
- Meteor: `r` is random from `meteorBaseRadius`; mass is `r*r`, so radius is source, mass is derivative, not the reverse. Collision and Canvas radius use `getMeteorCollisionRadius` / `getMeteorRenderScale`, both resolving to `r` by default. Snapshot `radius/r` copies body `r`; Three fallback/GLB uses `getMeteorRenderScale(snapshot)` or `m.radius/r` and GLB radius scale/debug visual scale.
- Asteroid: `r = baseR * sqrt(mass)` clamped by min/max in local asteroid helper, or later by `SpaceBodies.radiusFromMass` in cosmic split. Collision uses `a.r`; snapshot `radius/r` copies `a.r`; Canvas/fallback uses `r`; Three GLB uses snapshot radius multiplied by `ASTEROID_GLB_RADIUS_SCALE = 0.82`.
- Moon: initial `r` is copied from asteroid; after mass absorption, `resizeMoon` uses `SpaceBodies.radiusFromMass('moon', mass, baseRadius=moon.massOneRadius/baseR/r)`. Collision uses `moon.r`; snapshot copies it; Three GLB uses snapshot radius without extra radius shrink.
- Rocky planet: moon→planet radius uses `SpaceBodies.radiusFromMass('planet', mass, baseRadius, minRadius=currentMoonR, maxRadius=maxRockyPlanetRadius)`. Some legacy/foundation planet paths use orbit radius or color/orbiter formulas instead. Three planet GLB uses snapshot radius without extra scale.
- Gas planet/star: no single active audited formula; legacy/foundation paths use object fields, orbit/fixed radius and settings. Not globally mass-derived in the active code.
- harmonicDust: radius is mass/density-derived in its subsystem, then Canvas expands visual to `r * pulse * valueScale` and draws gradient to `1.35r` plus rings/progress arcs up to `1.55r`. Snapshot exposes dust `r` and visual fields; Three uses `visual.radius ?? r` with a collection bump.
- cosmicDust: `r` is mass/density-derived and clamped in `HC.CosmicDust`; snapshot exposes `r`, `mass`, `density` and `visual.model = cosmic_dust_cloud`; Three uses `visual.radius ?? r` as a flat cloud mesh.
- impactFragments: fragments have mass but no `r` assigned at creation; snapshot radius falls back through `r/radius/collisionRadius` and may be undefined/compat. Renderer support is limited/foundation.

## 5. CANVAS VS THREE RADIUS MISMATCH

- Meteor Canvas source: `getMeteorRenderScale(m)` which equals collision radius by default. Three source: snapshot radius through `getMeteorRenderScale(snapshot)` then `METEOR_GLB_RADIUS_SCALE` and debug `meteorGlbVisualScale`; if debug scale < 1, GLB becomes smaller than collision radius.
- Asteroid Canvas/collision source: `a.r`. Snapshot source: `a.r`. Three GLB source: snapshot radius × `ASTEROID_GLB_RADIUS_SCALE = 0.82`; this is the clearest current case where collision can happen before visible GLB surfaces touch.
- Moon/planet Three GLB source: snapshot radius / GLB unit radius with no hardcoded shrink, so they are closer to Canvas/collision as long as snapshot `r` is correct.
- harmonicDust Canvas visual is richer and larger than base `r` because of pulse/value scale and gradient/rings/progress arcs; Three uses one translucent flat mesh and collection bump, so it does not match Canvas ring/progress richness.
- cosmicDust Canvas is not drawn by `hc.harmonic_dust.js`; Three has a simple cosmicDust mesh pass. If Canvas fallback does not have a dedicated cosmicDust draw path, cosmicDust is snapshot/Three-visible but Canvas-incomplete.

## 6. COLLISION SPLIT AUDIT

| Pair | Live/foundation | Source mass | Split and conservation | Risk |
|---|---|---|---|---|
| meteor+meteor different | Live in `hc.collisions.js`; asteroid spawn + cosmic split | Current cosmic dust uses sum of both meteor masses; asteroid uses fixed mass `1` | dust = 25% of sum by default; target asteroid mass is not `heavier + absorb(lighter)` | High: violates target model and can pump/lose mass depending pixel masses |
| meteor+asteroid | Live in `hc.asteroids.js` contact | meteor mass | dust 80%, asteroid absorb 20%; sums to meteor mass | Low in cosmic path; fallback fixed +1 is legacy risk if cosmic module absent |
| asteroid+asteroid | Live in `hc.asteroids.js` | lighter/secondary asteroid mass | dust 50%, primary absorb 50%; secondary dead | Low; also positions/velocity weighted by total original masses for momentum |
| moon+meteor | Live in moon direct absorption | meteor mass | dust 30%, moon absorb 70%; meteor dead | Low; target gets only absorbMass |
| moon+asteroid | Live in moon direct absorption | asteroid mass | dust 30%, moon absorb 30%, fragments 40%; asteroid dead | Low; sums to asteroid mass |
| planet+meteor | Foundation/live if caller invokes cosmic split; legacy planet code also has HC.Impact descriptor | meteor mass | dust 25%, planet absorb 50%, fragments 25%; meteor dead | Low in cosmic split; HC.Impact helper uses different descriptor percentages and no cosmicDust |
| planet+asteroid | Foundation/cosmic split descriptor path | asteroid mass | dust 35%, fragments 35%, orbiterCandidate 30%; asteroid dead, planet does not absorb | Medium: sums conserve source, but no absorbPct field for target growth |
| planet+moon | Foundation/cosmic split descriptor path | moon mass | dust 35%, fragments 35%, orbiterCandidate 30%; moon dead, planet does not absorb | Medium: descriptor-only progression not implemented |
| planet+planet | Foundation/descriptor-only | sum of both planet masses | dust 50%, fragments 50%; both dead; descriptorOnly true | High vs target if future expects lighter-body split |

## 7. HARMONIC DUST VISUAL AUDIT

Canvas2D harmonicDust visual is strong and semantically useful: it draws a colored radial gradient sphere fading outward, increases perceived value by reservoir percent, overlays a soft ring for high-value dust, and draws a collection progress ring when `collectRatio > 0`. It is based on runtime dust/view-model fields: `x`, `y`, `r` or `visual.radius`, `mass`, `density`, `colorName`, `originalColorName`, `grayMixRatio`, `reservoirPercentValue`, `collectProgressMs`, `collectRequiredMs`, `collectRatio`, `isBeingCollected`, `visualAlpha`, `visualPulse`.

Fields that Three.js needs to mirror the Canvas effect: base `radius`, expanded gradient radius factors (`1.35`, ring `1.42`, progress `1.55`), `alpha`, hue/color, `grayMixRatio`, `reservoirPercentValue`, `collectRatio`, `isBeingCollected`, pulse phase and optional ring eligibility threshold.

## 8. COSMIC DUST VISUAL AUDIT

Cosmic dust is distinct from harmonicDust in data and tests: `type: cosmic_dust`, `dustKind: cosmic`, `collectible: false`; harmonicDust remains collectible/color-reservoir oriented. Cosmic dust has `mass`, `density`, and `r` in runtime and snapshot. Its cloud radius derives from mass/density with min/max visual clamps. Three.js renders cosmicDust with a flat cloud mesh from snapshot radius and opacity. Canvas2D has no equivalent rich draw path identified in the required files, so Canvas fallback likely does not visually represent cosmicDust at parity with Three.js.

## 9. PROPOZYCJA COLLISION RULES CONFIG

Future `public/settings/collision-rules.json` schema, not implemented in this audit:

```json
{
  "version": 1,
  "sourceMassPolicies": ["lighter_body", "incoming_body", "sum_bodies", "descriptor_only"],
  "rules": [
    { "id": "meteor_meteor_different", "enabled": true, "sourceMassPolicy": "lighter_body", "dustPct": 0.80, "absorbPct": 0.20, "fragmentsPct": 0, "orbiterPct": 0, "createsBaseProgressionObject": true, "notes": "Heavier meteor becomes/anchors asteroid; split lighter meteor only." },
    { "id": "meteor_asteroid", "enabled": true, "sourceMassPolicy": "incoming_body", "dustPct": 0.80, "absorbPct": 0.20, "fragmentsPct": 0, "orbiterPct": 0, "createsBaseProgressionObject": false, "notes": "Incoming meteor split." },
    { "id": "asteroid_asteroid", "enabled": true, "sourceMassPolicy": "lighter_body", "dustPct": 0.50, "absorbPct": 0.50, "fragmentsPct": 0, "orbiterPct": 0, "createsBaseProgressionObject": false, "notes": "Heavier asteroid survives." },
    { "id": "moon_meteor", "enabled": true, "sourceMassPolicy": "incoming_body", "dustPct": 0.30, "absorbPct": 0.70, "fragmentsPct": 0, "orbiterPct": 0, "createsBaseProgressionObject": false, "notes": "Moon absorbs part of meteor." },
    { "id": "moon_asteroid", "enabled": true, "sourceMassPolicy": "incoming_body", "dustPct": 0.30, "absorbPct": 0.30, "fragmentsPct": 0.40, "orbiterPct": 0, "createsBaseProgressionObject": false, "notes": "Moon absorbs part; ejecta fragments get fragmentsPct." },
    { "id": "planet_meteor", "enabled": true, "sourceMassPolicy": "incoming_body", "dustPct": 0.25, "absorbPct": 0.50, "fragmentsPct": 0.25, "orbiterPct": 0, "createsBaseProgressionObject": false, "notes": "Planet absorbs part of meteor." },
    { "id": "planet_asteroid", "enabled": true, "sourceMassPolicy": "incoming_body", "dustPct": 0.35, "absorbPct": 0, "fragmentsPct": 0.35, "orbiterPct": 0.30, "createsBaseProgressionObject": false, "notes": "Orbiter is descriptor-only until orbit system patch." },
    { "id": "planet_moon", "enabled": true, "sourceMassPolicy": "incoming_body", "dustPct": 0.35, "absorbPct": 0, "fragmentsPct": 0.35, "orbiterPct": 0.30, "createsBaseProgressionObject": false, "notes": "Orbital moon candidate descriptor-only." },
    { "id": "planet_planet", "enabled": false, "sourceMassPolicy": "descriptor_only", "dustPct": 0.50, "absorbPct": 0, "fragmentsPct": 0.50, "orbiterPct": 0, "createsBaseProgressionObject": false, "notes": "Foundation only; future rule should choose lighter-body or special cataclysm policy." }
  ]
}
```

Future debug panel: separate `Collision Rules` panel in debug UI, editable percentage controls with validation that `dustPct + absorbPct + fragmentsPct + orbiterPct <= 1`, mini text import/export window, and load/save against `public/settings/collision-rules.json` following the existing `public/settings` debug settings pattern.

## 10. RYZYKA / NAJWAŻNIEJSZE BUGI

1. Meteor+meteor different-color split is not based on lighter meteor mass and asteroid mass is fixed `1`, so it is the top mass-contract bug.
2. Asteroid GLB visual is hard-shrunk to `82%` of snapshot radius while collision remains at `a.r`.
3. Meteor GLB debug `meteorGlbVisualScale` can silently make visual radius smaller/larger than collision radius.
4. There are multiple radius formulas: meteor `r -> mass`, asteroid local `baseR*sqrt(mass)`, SpaceBodies `sqrt(mass/density)*baseRadius`, cosmicDust mass/density clamp, harmonicDust visual inflation.
5. `planet_asteroid`, `planet_moon`, and `planet_planet` are foundation/descriptor paths with no unified heavier/lighter policy.
6. Canvas2D lacks cosmicDust parity while Three.js renders cosmicDust.
7. Impact helper percentages (`HC.Impact`) and cosmic split percentages can diverge, making future callers easy to wire incorrectly.

## 11. REKOMENDOWANY NASTĘPNY PATCH

Recommended next patch: introduce a central `MassRadiusContract` that defines canonical mass units, `radiusFromMass`, collision radius and view radius; migrate meteor/asteroid/moon/planet/dust snapshot construction to expose one shared radius view-model; rewrite collision split foundation so every rule chooses target/source explicitly, defaults to `lighter_body` where required, and records conservation evidence; then add a non-invasive Collision Rules panel foundation that can view/edit/import/export rule percentages without changing runtime balance until explicitly enabled.
