# Haiku Cosmos — Space Runtime Baseline After Legacy Cut

> Status: CURRENT RUNTIME BASELINE / POST-LEGACY-CUT / SOURCE OF TRUTH FOR NEXT PATCHES
> Obszar: aktywna mechanika kosmosu / runtime world / progression bodies
> Źródło prawdy: TAK, dla bieżącego stanu aktywnego runtime kosmosu po legacy-cut; TAK, jako punkt startowy dla następnych patchy mechaniki kosmosu; NIE, jako opis docelowych komet/orbit/gwiazd
> Ostatnia aktualizacja: 2026-06-20
> Powiązane dokumenty: `../maps/PROJECT_INDEX.md`, `../maps/DEPENDENCY_MAP.md`, `COSMIC_IMPACT_ORBIT_SYSTEM.md`, `DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`, `COMETS_SYSTEM.md`, `../technical/SPACE_MECHANICS_CONTRACT.md`, `../technical/WORLD_RENDERING_MODEL.md`

---

## 1. Executive summary

Po legacy-cut aktywny runtime kosmosu ma jeden gameplayowy łańcuch progresji ciał:

```text
meteor + meteor różnych kolorów -> asteroid -> moon -> rocky planet
```

Rocky planet jest legalna tylko jako wynik `moon_to_rocky_planet` z pełnym canonical origin evidence. Aktywny `hc.planets.js` nie tworzy planet; jest pasywnym walidatorem i fail-fast guardem przeciw legacy origin. Comets, stars/epoch, gas planets, planet capture/orbit, direct asteroid -> planet i collapse -> planet są legacy-disabled albo descriptor-only/future. Ten dokument zapisuje obecny baseline razem ze znanymi blockerami.

---

## 2. Active canonical runtime flow

### 2.1. Meteor + meteor różnych kolorów -> asteroid

Aktywna ścieżka:

1. `HC.Meteors.update()` utrzymuje pulę meteorów.
2. `HC.Collisions.resolve()` obsługuje meteor-meteor collisions.
3. Różnokolorowe meteory tworzą asteroid przez `spawnAsteroidFromCollision(...)`.
4. Split policy może równolegle utworzyć cosmic dust evidence według `public/settings/collision-rules.json`.

Ta ścieżka jest active runtime.

### 2.2. Asteroid >= asteroidToMoonMassThreshold -> moon

Aktywna ścieżka:

1. Asteroid rośnie przez aktywne kontakty/split/absorb logic.
2. `checkAsteroidMoonThreshold(...)` sprawdza `World.spaceMechanics.asteroidToMoonMassThreshold`.
3. Po przekroczeniu progu `transformAsteroidToMoon(...)` tworzy moon.
4. Moon dostaje `sourcePath: "asteroid_to_moon"`, `allowedProgressionPath: true`, `progressionMode: "free"`, `isOrbitalBody: false`, `canBecomePlanet: true`.

Ta ścieżka jest active runtime.

### 2.3. Moon >= moonToRockyPlanetMassThreshold -> rocky planet

Aktywna ścieżka docelowa w obecnym runtime:

1. `checkMoonRockyPlanetThreshold(...)` sprawdza `World.spaceMechanics.moonToRockyPlanetMassThreshold`.
2. `canMoonBecomeRockyPlanet(...)` musi przepuścić moon.
3. `transformMoonToRockyPlanet(...)` tworzy rocky planet przez `createRockyPlanetFromMoon(...)`.
4. Jedyny legalny gameplay push planety to guarded `World.planets.push(planet)` w transformacji moon -> rocky planet.

Ta ścieżka jest active runtime, ale ma znany bug opisany w sekcji 10.

---

## 3. Current implemented thresholds vs next design target

### 3.1. CURRENT IMPLEMENTED BASELINE

Obecnie zaimplementowane/fallback runtime:

```text
asteroidToMoonMassThreshold = 10
moonToRockyPlanetMassThreshold = 20
```

Te wartości są bieżącym stanem kodu i testów po legacy-cut. Dokumentacja nie powinna sugerować, że runtime już działa na wartościach `5 / 10`.

### 3.2. NEXT CANONICAL DESIGN TARGET

Następny patch projektowo ma przejść na:

```text
asteroid >= 5m -> moon
moon >= 10m -> rocky planet
```

Tego targetu nie wolno traktować jako obecnie zaimplementowanego baseline. Patch musi osobno zmienić wartości/fallbacki, debug labels i ewentualne oczekiwania testowe.

---

## 4. Active systems

- **Meteors:** active.
- **Meteor collisions:** active.
- **Asteroids:** active.
- **Moons:** active.
- **Rocky planets:** active only through canonical `moon_to_rocky_planet`; flow ma znany bug.
- **Harmonic dust:** active.
- **Cosmic dust creation/split:** active foundation.
- **Impact fragments:** foundation active / descriptors; nie traktować jako pełny docelowy moving-fragment system bez osobnej weryfikacji `HC.Impact`.
- **Orbiter candidates:** descriptor-only.
- **Canvas2D / Three render:** active renderer/view layers only.
- **WorldRenderSnapshot:** active shared snapshot boundary dla Canvas2D/Three/debug.

---

## 5. Legacy-disabled / not active systems

- **Comets runtime:** legacy-disabled. Stary `hc.comets.js` jest zachowany jako `legacy/runtime/hc.comets.legacy.js` tylko dla forensic/reference.
- **Stars / epoch runtime:** legacy-disabled. Stary runtime jest zachowany jako `legacy/runtime/hc.stars_epoch.legacy.js` tylko dla forensic/reference.
- **Full legacy planets runtime:** legacy-disabled. Stary runtime jest zachowany jako `legacy/runtime/hc.planets.legacy.js` tylko dla forensic/reference.
- **Gas planets:** legacy-disabled in active gameplay baseline.
- **Planet capture/orbit:** legacy-disabled.
- **Runtime orbiters:** not implemented; descriptor-only.
- **Live orbital movement:** not implemented as active gameplay.
- **Cosmic dust drag/stop:** not active as gameplay baseline; treat as future/disabled unless a future patch explicitly enables and documents it.
- **Direct asteroid -> rocky planet:** removed / hard-blocked / fail-fast.
- **Asteroid collapse -> planet:** removed / hard-blocked / fail-fast.
- **Planet -> star:** legacy-disabled.

`legacy/runtime/*` is preserved for forensic/reference purposes only. Legacy runtime files are not source of truth for active gameplay and must not be restored to bypass the current baseline.

---

## 6. Current update loop order

Active order in `game.boot.js`:

1. `HC.Meteors.update(dt, nowMs)`
2. `HC.Collisions.resolve(dt, nowMs)`
3. `HC.HarmonicDust.update(dt, nowMs)`
4. `HC.CosmicDust.update(World, dt, nowMs)`
5. `HC.Impact.updateFragments(World, nowMs, dt)`
6. `HC.Asteroids.capture(dt, nowMs)`
7. `HC.Asteroids.update(dt, nowMs)`
8. `HC.Planets.update(dt, nowMs)` — passive canonical validator
9. `HC.WorldRenderSnapshot.build(...)`
10. `HC.WorldRenderer.render(renderSnapshot, now, dt)`

Renderer and snapshot code must not mutate gameplay progression.

---

## 7. Planet creation rules

Rocky planet may be created only through moon progression and must carry canonical evidence:

```text
sourcePath: "moon_to_rocky_planet"
sourceMoonId: present
allowedProgressionPath: true
validProgressionOrigin: true
planetKind: "rocky" or isRocky: true
```

`HC.Planets.update()` is a passive validator. It does not create planets. It may fail-fast on gas/star/capture/orbit legacy fields or invalid rocky origin.

Forbidden planet origins:

- direct asteroid -> rocky planet,
- asteroid collapse -> planet,
- capture/orbit accumulation -> planet,
- gas planet -> star,
- renderer-created gameplay planet,
- legacy helper restoration.

---

## 8. Shared World / snapshot / radius contract

Canvas2D and Three.js must use the same active `World`, `WorldRenderSnapshot`, and `HC.SpaceBodies` radius contract. Renderer-side asset choice, GLB scale, material state or debug visuals must not change gameplay mass, threshold, origin evidence, or progression.

Current mass/radius formula baseline:

```text
radius = baseRadius * sqrt(mass / density)
```

Default density for meteor/asteroid/moon/planet is currently `1` unless a body overrides it.

---

## 9. Descriptor-only orbiters/fragments status

Orbiter candidates can be recorded as descriptors/evidence. They are not live runtime orbiters and do not reactivate capture/orbit. Planet/asteroid/moon impact rules may carry `orbiterPct`, but active movement, stable orbital ownership and capture gameplay are future work.

Impact fragments have an active foundation/update hook, but this baseline does not treat them as a finished moving-fragment gameplay system unless a future patch documents the exact active behavior.

---

## 10. Known bug: moon -> rocky planet can fail after threshold

Observed state after legacy-cut:

```text
moon sourceId: "moon:3:1"
current: about 32
moonToRockyPlanet target: 20
overThreshold: true
creationFailed: true or triggeredProgression true
resultingObjectId: null
worldCounts.planets: 0
```

Most likely current cause:

- `canMoonBecomeRockyPlanet(...)` blocks transformation via `progressionCooldownUntilFrame`, `progressionLockFrame`, or same-frame lock.
- `absorbBodyIntoMoon(...)` logs threshold progress too optimistically before the actual transform succeeds.
- When transform is blocked before object creation, `failureReason` may fall back to the too-generic `"creation_failed"`.

Important distinction:

- This is not evidence that `HC.Planets.update()` creates or removes planets.
- This is not evidence that the renderer failed to draw a created planet.
- This is primarily a progression semantics / cooldown / debug event ordering problem until a future patch proves otherwise.

---

## 11. Known mass/radius scaling issue

The current radius scale is too aggressive for the desired readability:

```text
radius = baseRadius * sqrt(mass / density)
asteroid baseR = (meteorA.r + meteorB.r) * 1.35
moon inherits asteroid baseR / massOneRadius
```

Therefore a moon with mass around `32` can legitimately reach radius around `428` if its inherited base radius is around `75`. This follows the current formula and inherited per-kind base scale. It is not a hidden planet/capture mechanic.

Future tuning should reduce asteroid baseR and/or introduce per-kind radius multipliers/density for asteroid, moon and rocky planet. Do not change MassRadiusContract in documentation-only work.

---

## 12. Known debug/export issue

Debug/full export still grows quickly because:

- full export keeps all events,
- many collision/progression/radius events include snapshots,
- collisions export may still carry heavy snapshot payloads even when event filtering is narrower.

Future mechanics tests should use compact event payloads focused on thresholds, body counts, origin evidence, creation/failure reason and radius evidence.

---

## 13. What must not be reintroduced

Do not reintroduce as active runtime by restoring legacy code:

- comets runtime,
- stars / epoch runtime,
- gas planet progression,
- planet capture/orbit,
- direct asteroid -> planet,
- asteroid collapse -> planet,
- planet -> star,
- renderer-side gameplay mutation.

Future comets/orbits/stars/gas systems must be implemented as new systems with new docs/tests, not by wiring `legacy/runtime/*` back into the loop.

---

## 14. Next patch plan

Order for next mechanics work:

1. Fix moon -> rocky planet cooldown/failure semantics.
2. Change thresholds to `5 / 10` after the moon progression fix is clear.
3. Reduce radius scale so asteroid/moon/rocky planet sizes are readable.
4. Compact mechanics export for collision/progression tests.
5. Rename debug `asteroidToPlanet` label/field to `asteroidToMoon` or add a compatibility alias with explicit deprecation.
6. Only after stabilization, design future comets/orbits/stars as new systems.

---

## 15. Open questions

1. Should moon progression cooldown block only same-frame asteroid -> moon -> planet, or also later absorb events during the cooldown window?
2. Should `creationFailed` mean only object creation failure, while temporary cooldown/progression block uses another field?
3. Should rocky planet preserve moon radius continuity, or start smaller for readability?
4. Should debug UI remove historical `asteroidToPlanet` naming entirely, or keep a deprecated alias?
5. Should `moon >= 10` transform immediately, or after an animation/stabilization step?

---

## 16. Current canonical starting point for next Codex work

1. Do not re-enable legacy comets/star/capture/orbit.
2. Do not add direct asteroid -> planet.
3. Do not let renderer mutate gameplay.
4. Fix moon -> rocky planet first.
5. Then change thresholds to `5 / 10`.
6. Then tune radius scale.
7. Then compact mechanics export.
8. Future comets/orbits/stars must be implemented as new systems, not by restoring legacy files.
