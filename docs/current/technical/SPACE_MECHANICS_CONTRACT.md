# SPACE_MECHANICS_CONTRACT — kontrakt nowej mechaniki ciał kosmicznych

> Status: ROBOCZY / KONTRAKT TECHNICZNY  
> Obszar: runtime świata / ciała kosmiczne / snapshot renderingu  
> Źródło prawdy: TAK, dla Patch D0 i kolejnych małych refaktorów pól ciał kosmicznych  
> Ostatnia aktualizacja: 2026-06-19  
> Powiązane dokumenty: WORLD_FUNCTION_MAP.md, WORLD_RENDERING_MODEL.md, ../systems/COSMIC_IMPACT_ORBIT_SYSTEM.md, ../maps/DEPENDENCY_MAP.md

## 1. Cel Patch D0

Ten dokument ustanawia wspólny kontrakt techniczny dla nowej mechaniki ciał kosmicznych używanej przez Canvas2D i Three.js. Celem D0 jest zatrzymanie mieszania starego modelu `capture/orbiters` z nowym modelem `direct impact -> progression -> snapshot/view-model`, bez dużej przebudowy runtime.

Patch D0 nie implementuje nowych orbiterów planetarnych, nie dodaje pyłu z planet impact i nie przenosi mechaniki do renderera. Dokument wyznacza granice dla kolejnych małych patchy runtime.

## 2. Twarde zakazy kontraktu

1. Nie wolno przywracać legacy planet capture jako live mechaniki.
2. Nie wolno dodawać `planetCaptureMode`, `legacy_capture`, `hybrid_debug` ani flag, które wybierają starą ścieżkę przechwytywania planet.
3. Planety nie przechwytują meteorów/asteroid przez `orbitPx`, `gravityR`, `capR` ani `orbiters`.
4. Jedyną aktualną ścieżką planet impact/capture w live runtime jest direct collision obsłużona przez `HC.Impact.resolvePlanetImpact`.
5. Renderer Canvas2D ani renderer Three.js nie mogą tworzyć osobnej mechaniki progresji.
6. Wybór assetu (`visualKind`, `assetId`, `modelId`, `glbId`) nie może zmieniać progression, masy, progu ani relacji orbitalnej.

## 3. Wspólny snapshot/view-model dla Canvas2D i Three.js

Canvas2D i Three.js mają konsumować ten sam snapshot/view-model budowany przez `hc.world_render_snapshot.js` albo jego następcę. Snapshot jest warstwą odczytu i normalizacji pól dla renderingu, debugowania oraz testów VM.

Zasady:

- mechanika aktualizuje stan świata przed snapshotem;
- snapshot nie decyduje o progression;
- Three.js nie wymusza osobnego modelu danych;
- Canvas2D fallback i Three.js renderer powinny różnić się wyłącznie sposobem prezentacji;
- obiekt zachowuje tę samą mechanikę niezależnie od tego, czy jest rysowany jako Canvas2D shape, sprite, mesh proceduralny czy GLB.

## 4. Odpowiedzialności modułów

### `HC.SpaceBodies` (`hc.space_bodies.js`)

Miejsce przyszłej normalizacji body contract. Obecnie dostarcza bezpieczne helpery typu `getBodyKind`, `getBodyMass`, `getBodyRadius`, `getCollisionRadius`, `isDirectImpact`, `createOrbitState` i `isOrbiting`. W kolejnych patchach powinien przejmować małe, czyste helpery klasyfikacji pól bez side effectów.

### `HC.Impact` (`hc.impact.js`)

Jedyny moduł rozstrzygania splitu masy dla impactów planet i księżyców. `resolvePlanetImpact` zwraca wynik planet impact bez tworzenia pyłu, a `spawnEjecta` tworzy `impactFragment`. `HC.Impact` nie powinien czytać pól visual assetów.

### `hc.planets.js`

Runtime bridge dla direct planet impact: wykrywa kontakt meteoru/asteroidy z planetą, woła `HC.Impact.resolvePlanetImpact`, zapisuje `planet.lastImpact` i `World.lastPlanetImpact`, aktualizuje masę/promień planety oraz tworzy impact fragments. Stare `planet.orbiters` mogą być tylko stanem compatibility/debug, nie live relation.

### `hc.asteroids.js`

Obsługuje asteroid progression, direct growth oraz aktualne moon/free progression fields. Każda relacja orbitalna przyszłego modelu powinna przechodzić przez jawne pola `parentPlanetId` + `orbitState`, a nie przez żywe `parentRef` jako relation.

### `hc.world_render_snapshot.js`

Buduje wspólny view-model dla Canvas2D/Three.js/debug/testów. Może przepisywać pola compatibility jako evidence (`orbitPx`, `orbitCurrentRadius`, `orbiterCount`, `compatibility.parentKind`), ale nie może aktywować legacy capture.

### Renderer Canvas2D (`hc.render.js`)

Renderuje stan/snapshot i może pokazywać historyczne/debug orbit rings tylko jako wizualizację. Nie może tworzyć ani utrzymywać relacji capture.

### Renderer Three.js / visual asset routing

Konsumuje snapshot/view-model. Wybiera mesh, GLB, materiał, teksturę, skalę i rotację. Nie może zmieniać progression, masy, promieni kolizji ani statusu orbitalnego na podstawie `assetId`, `modelId` lub `glbId`.

## 5. Aktualne typy ciał w live runtime

| Typ | Status live | Kolekcja / źródło | Uwagi |
| --- | --- | --- | --- |
| `meteor` | live | `World.meteors[]` | Obiekt incoming dla direct impactów, kolizji meteorów, pyłu harmonicznego i progression asteroid. |
| `asteroid` | live | `World.asteroids[]` | Material body; nie ma live capture/orbit radius dla meteorów. Może być źródłem direct planet impact. |
| `moon` | live/progression | `World.moons[]` | Aktualny obiekt progression/impact księżycowy; nie powinien tworzyć orbiterów. |
| `planet` rocky | live | `World.planets[]` + `planetKind="rocky"` / `isRocky` | Planeta skalista; direct impacts przez `HC.Impact.resolvePlanetImpact`. |
| `planet` gas | live | `World.planets[]` + `planetKind="gas"` / default visual | Planeta gazowa; direct impacts przez tę samą ścieżkę co rocky, jeśli istnieje w świecie. |
| `star` | live | `World.stars[]` | Docelowy etap progression po planetach; historyczne orbiters mogą istnieć w starych ścieżkach/debugu. |
| `impactFragment` | live/ejecta | `World.impactFragments[]` | Krótkotrwały fragment po impact; render/snapshot/debug. |
| future orbital body | kontrakt przyszły | przyszłe kolekcje lub znormalizowane body registry | Ma używać `isOrbitalBody`, `parentPlanetId`, `orbitState`; nie `parentRef` jako live relation. |

## 6. Pola kanoniczne

Pola kanoniczne są wspólne dla mechaniki i snapshotu. Jeśli istnieje konflikt z polem compatibility, wygrywa pole kanoniczne.

- `id` — stabilny identyfikator obiektu, docelowo wymagany dla body registry i render cache.
- `kind` / `type` — typ mechaniczny (`meteor`, `asteroid`, `moon`, `planet`, `star`, `impactFragment`).
- `x`, `y` — pozycja świata.
- `vx`, `vy` — prędkość świata, jeśli typ jest dynamiczny.
- `r` / `radius` — promień mechaniczny/collision baseline; snapshot może expose’ować oba.
- `mass` — masa mechaniczna, z fallbackiem przez `HC.SpaceBodies.getBodyMass` tam, gdzie historyczne obiekty jej nie mają.
- `color` / `material` — mechaniczna lub semantyczna właściwość ciała; nie jest modelem 3D.
- `progressionMode` — jawny tryb progression (`moon`, `free`, future), jeśli obiekt uczestniczy w progression.
- `isOrbitalBody` — jawna flaga przyszłego orbital body.
- `canBecomePlanet` — jawna flaga progression do planety.
- `parentPlanetId` — docelowa relacja orbital/progression bez trzymania referencji obiektu.
- `orbitState` — docelowy opis orbity (`parentId`, `parentKind`, `semiMajorAxis`, `semiMinorAxis`, `angle`, `angularSpeed`, itd.).
- `lastImpact` — ostatni zwarty zapis impact evidence na obiekcie, np. `planet.lastImpact` lub `moon.lastImpact`.

## 7. Pola render-only / snapshot-only / debug-only

Te pola mogą wpływać na wygląd, ale nie na progression ani outcome impactów:

- `visualKind`, `visualVariant`;
- `assetId`, `asset`, `modelId`, `glbId`;
- `rotation`, `visualRotationSeed`, `visualRotationX/Y/Z`, `visualRotationSpeedX/Y/Z`;
- `scale`, `alpha`, `sides`, `angle`, `grayLight`;
- `rings`, `aura`, glow/debug visual markers;
- `renderKey`, `source`, `sourceMoonId` jako pola snapshot/debug, jeśli nie są używane przez mechanikę.

## 8. Pola transitional compatibility

Te pola mogą nadal występować w runtime, snapshotach albo debugu, lecz nie mogą być podstawą nowej mechaniki planet capture:

- `orbitPx` — historyczny promień orbit/capture; może zostać pokazany jako evidence ring albo fallback snapshot.
- `orbitCurrentRadius` — pochodny/promieniowy stan orbit visual/debug; nie decyduje o planet capture.
- `gravityR` — historyczny radius wpływu; może być utrzymany dla wizualizacji lub starych kart, ale nie dla planet capture.
- `parentKind` — stale-state guard; `parentKind="planet"` nie jest live relacją planetarną.
- `parentRef` — stale-state guard/reference historyczny; docelowo zastąpić przez ID.
- `theta`, `omega`, `orbitR` — transitional orbital/progression fields dla starych lub moon/free ścieżek; docelowo migrować do `orbitState`.
- `orbiters` — tylko compatibility/debug/historyczne stany; live C2/D0 planet impact nie tworzy `planet.orbiters`.
- `World.lastPlanetImpact` — snapshot/debug evidence ostatniego planet impact.
- `World.impactFragments` — live/ejecta collection, ale jej pola wizualne pozostają render-only.
- `World.moons` — live collection, częściowo transitional do przyszłego body registry.

## 9. Pola deprecated do usunięcia w kolejnych patchach

- dawne `capture*` związane z planet capture, np. `captureCooldown`, `captureCount`, `captureSumR`, `captureSumMass`, `captureColorCounts`, gdy pełnią wyłącznie rolę legacy planet capture;
- `capR` i inne aliasy z dawnego range capture;
- `legacy planet orbiters` jako live relation (`planet.orbiters[]` dla meteorów/asteroid);
- `parentKind="planet"` jako aktywna relacja live;
- `planetCaptureMode`, `legacy_capture`, `LEGACY_PLANET_CAPTURE`, `hybrid_debug` — nie wolno ich dodawać ani reaktywować;
- logika, w której `orbitPx`/`gravityR` samoistnie oznacza możliwość przechwycenia obiektu przez planetę.

## 10. Docelowy przepływ mechaniki

```text
meteor/asteroid direct impact
  -> HC.SpaceBodies.isDirectImpact / collision radius helpers
  -> HC.Impact.resolvePlanetImpact lub resolveMoonImpact
  -> planet/moon/free progression fields
  -> future orbital body przez isOrbitalBody + parentPlanetId + orbitState
  -> star progression
  -> hc.world_render_snapshot.js view-model
  -> Canvas2D renderer i Three.js renderer / visual asset routing
```

Szczegóły:

1. Incoming `meteor` albo `asteroid` może trafić w planetę tylko przez direct impact.
2. `HC.Impact.resolvePlanetImpact` rozdziela masę i zwraca evidence; planet impact nie tworzy harmonic dust ani reservoir dust.
3. `hc.planets.js` zapisuje compact evidence w `planet.lastImpact` i `World.lastPlanetImpact`.
4. Moon/free/future orbital progression używa jawnych pól progression, nie legacy planet capture.
5. Star progression czyta stan mechaniczny, nie assety renderera.
6. Snapshot/view-model jest wspólną warstwą wejściową dla Canvas2D i Three.js.
7. Visual asset routing dobiera tylko prezentację.

## 11. Checklist dla kolejnych patchy runtime

1. D1: mały helper w `HC.SpaceBodies` klasyfikujący pola body jako `canonical`, `renderOnly`, `compatibility`, `deprecated` + test VM.
2. D2: przenieść snapshot fallbacki orbitalne do jawnej sekcji `compatibility` bez usuwania danych.
3. D3: usunąć albo odseparować `planet.orbiters` z live render/update poza debug stale-state path.
4. D4: migracja `parentKind`/`parentRef` planetarnych stanów do `parentPlanetId` + `orbitState`.
5. D5: body registry / normalized collection, jeśli nadal potrzebne dla Canvas2D i Three.js.
