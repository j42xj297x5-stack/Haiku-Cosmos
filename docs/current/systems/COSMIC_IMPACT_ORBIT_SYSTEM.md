# COSMIC_IMPACT_ORBIT_SYSTEM — kontrakt impact/orbit

> Status: FUTURE DESIGN / KONTRAKT PROJEKTOWY / ACTIVE RUNTIME HAS DESCRIPTOR-ONLY ORBITERS
> Obszar: impact planetarny / impact księżycowy / orbity / pyły impactowe
> Źródło prawdy: TAK, dla zasad projektowych opisanych w tym dokumencie; NIE jest opisem istniejącej implementacji runtime
> Ostatnia aktualizacja: 2026-06-20
> Powiązane dokumenty: ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md, ../technical/WORLD_FUNCTION_MAP.md, COMETS_SYSTEM.md, DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md, PRG_SYSTEM.md, CARDS_SYSTEM.md, SUB_META_SYSTEM.md


## 0. Runtime status after legacy-cut (2026-06-20)

Active space runtime source-of-truth is `SPACE_RUNTIME_BASELINE_AFTER_LEGACY_CUT.md`. This document remains a future design contract for impact/orbit behavior. It is not evidence that capture/orbit is active.

Current active baseline:

- Rocky planets can only be created by canonical `moon_to_rocky_planet`.
- Planet capture/orbit runtime is legacy-disabled.
- Runtime orbiters are not implemented; orbiter candidates are descriptor-only evidence.
- Live orbital movement is not active gameplay.
- Direct asteroid -> planet and asteroid collapse -> planet are hard-blocked.
- Planet impacts/capture/orbit require a new design/implementation pass before returning.

Do not restore `legacy/runtime/hc.planets.legacy.js`, comet legacy runtime, star/epoch legacy runtime, or capture/orbit code to satisfy this document.

## 1. Cel i granice dokumentu

Ten dokument spisuje kontrakt projektowy dla kolejnego systemu kosmicznego:

- impactu na planetę skalistą,
- impactu na księżyc,
- powstawania orbiterów planetarnych,
- ograniczeń progresji orbitalnej,
- różnicy między jednym zbieralnym kolorowym pyłem (`harmonicDust`), `GRAY/mixed reservoir` i przyszłym niezbieralnym `cosmic dust`.

To jest dokument projektowy. Nie oznacza, że opisane mechaniki są już zaimplementowane w runtime.

Ten dokument nie zastępuje `COMETS_SYSTEM.md`. Komety pozostają osobnym systemem interwencji i przemiany świata.

Ten dokument nie zastępuje `CARDS_SYSTEM.md`, `PRG_SYSTEM.md`, `SUB_META_SYSTEM.md` ani dokumentów HUD/Kuźni. Integracja zbierania pyłu, reservoir, Magazynu i Kuźni wymaga osobnych decyzji projektowych.

## 2. Dwa łańcuchy progresji ciał

### 2.1. Wolna przestrzeń

Podstawowy łańcuch narodzin ciał w wolnej przestrzeni:

```text
meteor → asteroida → księżyc → planeta skalista
```

Zasady:

- tylko księżyc powstały w wolnej przestrzeni może przejść w planetę skalistą,
- wolny księżyc jest etapem pośrednim bazowej ścieżki narodzin planet skalistych,
- planeta skalista powstała tą ścieżką staje się centrum dalszych reguł impact/orbit opisanych niżej.

Rekomendowany przyszły kontrakt pól dla wolnego księżyca:

```js
progressionMode: "free"
isOrbitalBody: false
canBecomePlanet: true
parentPlanetId: null
orbitState: null
```

### 2.2. Orbita planety

Osobny łańcuch na orbicie planety:

```text
asteroida orbitalna → księżyc orbitalny → STOP
```

Zasady:

- asteroida na orbicie planety może urosnąć albo przejść w księżyc orbitalny,
- księżyc orbitalny jest ostatnim obiektem tej ścieżki,
- księżyc orbitalny NIE może przejść w planetę skalistą,
- księżyc orbitalny NIE tworzy własnej orbity,
- nie ma księżyców księżyca,
- nie ma planet powstających na orbitach planet.

Rekomendowany przyszły kontrakt pól dla księżyca orbitalnego:

```js
progressionMode: "orbital"
isOrbitalBody: true
canBecomePlanet: false
parentPlanetId: "<planet-id>"
orbitState: { /* future orbit contract */ }
```

Rekomendowane przyszłe pola runtime dla obiektów biorących udział w progresji:

- `progressionMode: "free" | "orbital"`,
- `isOrbitalBody: boolean`,
- `canBecomePlanet: boolean`,
- `parentPlanetId`,
- `orbitState`.

## 3. Impact na planetę skalistą

Od momentu powstania planety skalistej każdy obiekt uderzający w planetę powinien przechodzić przez losowy/procentowy podział masy:

```text
uderzający obiekt → częściowe wchłonięcie przez planetę + eksplozja + wyrzut drobin + opcjonalne powstanie orbitera
```

Efekty impactu planetarnego:

- część masy zostaje wchłonięta przez planetę,
- część masy idzie w efekt eksplozji / energię uderzenia,
- część masy zostaje wyrzucona na zewnątrz jako drobiny,
- drobiny mogą być meteorami albo mniejszymi asteroidami,
- część masy może przejść na orbitę jako mniejsza asteroida orbitalna.

Najważniejsza zasada:

**Uderzenie w planetę NIE wytwarza pyłu.**

Planeta może tworzyć:

- absorpcję masy,
- eksplozję,
- wyrzut drobin,
- opcjonalnego orbitera.

Planeta w tym pathie nie tworzy pyłu zbieralnego, nie tworzy `moonImpactDust` i nie tworzy fizycznego szarego pyłu kosmicznego.

## 4. Ograniczenie powstawania kolejnych orbiterów

Jeśli planeta nie ma jeszcze orbitera:

- powstanie pierwszego orbitera może być bazową ścieżką z impact split,
- dokładny procent powstania pierwszego orbitera pozostaje do balansu.

Jeśli planeta ma już przynajmniej jednego orbitera:

- powstanie kolejnego orbitera jest ograniczone do maksymalnie `25%` szansy,
- przejęcie/absorpcja masy przez planetę wynosi maksymalnie `30%`,
- reszta masy idzie w wyrzut drobin i/lub eksplozję.

Obowiązujące limity projektowe:

```js
nextOrbiterChanceWhenExistingOrbiterMax = 0.25
planetImpactAbsorbMassMaxWhenOrbiterExists = 0.30
```

Te wartości nie są finalnym balansem. Są górnymi limitami projektowymi dla przyszłej implementacji.

## 5. Orbitery i kolizje na orbicie

Obiekty na orbicie planety mogą wchodzić w kolizje z innymi obiektami świata. To jest zgodne z kierunkiem mechaniki, w którym orbitery są fizycznymi uczestnikami świata, a nie wyłącznie dekoracją.

Docelowa zasada front/back orbit:

- obiekty orbitujące mogą kolidować tylko wtedy, gdy są na aktywnej/przedniej części orbity,
- tylna część orbity jest wizualna / głębiowa i nie powinna dawać pełnej kolizji,
- front/back orbit będzie osobnym późniejszym patchem.

Na teraz kontrakt oznacza tylko, że:

- orbitery mogą zderzać się z obiektami świata,
- docelowo kolizje orbitalne będą zależne od `orbitPhase` / front arc,
- front/back orbit nie jest wymagane w najbliższym patchu runtime.

## 6. Impact na księżyc

Księżyc działa podobnie do planety, ale słabiej i bez tworzenia orbit.

Gdy obiekt uderza w księżyc:

- część masy zostaje wchłonięta przez księżyc,
- powstaje eksplozja,
- część masy zostaje wyrzucona jako drobiny,
- powstaje pył.

Ograniczenia:

- księżyc może wchłonąć maksymalnie `30%` masy uderzającego obiektu,
- uderzenie w księżyc NIE tworzy orbitera księżyca,
- księżyc nie może mieć własnych satelitów,
- księżyc nie staje się centrum nowego układu.

Obowiązujące limity projektowe:

```js
moonImpactAbsorbMassMax = 0.30
moonCanCreateOrbiters = false
```

## 7. Kontrakt pyłu: `harmonicDust`, `GRAY/mixed reservoir`, gray-shifted harmonicDust, `cosmic dust`

### 7.1. A) `harmonicDust`

- `harmonicDust` jest jedynym zbieralnym kolorowym pyłem: powstaje po harmonicznej kolizji dwóch meteorów tego samego koloru.
- Jest wysokoenergetyczny, zbieralny ręcznie przez PRG i trafia do HUD reservoir / stosiku.
- Reservoir działa przez model `10/20/50` opisany w `DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`.
- `harmonicDust` nie spowalnia, nie zatrzymuje i nie wywołuje drag na obiektach świata.
- Chmura `harmonicDust` może czasowo szarzeć (`grayMixRatio`) pod wpływem przechodzących obiektów i odzyskiwać kolor, jeśli ekspozycja była zbyt krótka.

### 7.2. B) `GRAY/mixed reservoir`

- `GRAY/mixed reservoir` jest stanem HUD reservoir po pomieszaniu kolorów w zasobniku.
- Może być błędem gracza albo celową decyzją przy zbieraniu kolorowego pyłu.
- Nie jest fizyczną chmurą świata, nie ma drag/stop i nie jest `cosmic dust`.

### 7.3. C) `gray_shifting` / `gray_locked harmonicDust`

- `gray_shifting` i `gray_locked` opisują stan chmury `harmonicDust` w świecie, a nie stan HUD.
- Mogą powstać przez przechodzące obiekty; zakłócenie zależy od `dust.density`, `body.speed`, `overlapRatio` i `exposureTime`.
- `grayMixRatio` opisuje utratę harmoniczności; przed progiem pełnej przemiany chmura może przejść w `recovering`.
- Recovery trwa około `2× exposureTime`.
- `gray_locked` jest `futureCosmicCandidate`, ale w obecnym runtime nadal nie jest `cosmic dust` i nadal nie trafia do HUD jako cosmic resource.

### 7.4. D) `cosmic dust`

- `cosmic dust` jest przyszłym, osobnym i niezbieralnym systemem świata.
- Wpływa fizycznie na świat: może spowalniać albo zatrzymywać lekkie/wolne obiekty.
- Może prowadzić do kondensacji / future gas planet.
- Później może mieć reakcje z kometami, ale dopiero po osobnym comet system foundation.
- Nie trafia do HUD reservoir, nie jest zbierany PRG i nie jest `GRAY/mixed reservoir`.

### 7.5. Pył z impactu księżycowego

Uderzenie w księżyc może pozostać przyszłym źródłem pyłowych efektów świata, ale nie tworzy drugiego zbieralnego typu kolorowego pyłu bez osobnej decyzji projektowej. Kolorowy `moonImpactDust` i szary `moonImpactDust` pozostają osobną decyzją i nie mogą być automatycznie mieszane z `harmonicDust` ani `cosmic dust`.

## 8. Plan przyszłego wdrożenia `cosmic dust`

1. Patch 1 — dokumentacja elastic gray / future cosmic dust sync.
2. Patch 2 — elastic gray runtime, jeśli jeszcze nie zostało wdrożone.
3. Patch 3 — cosmic dust data foundation: `World.cosmicDust` albo `World.dustClouds`, `dustKind:"cosmic"`, `collectible:false`, `mass`, `density`, `r`, `state:"cold"`, `source`, `createdAt`.
4. Patch 4 — cosmic dust visual Canvas2D + Three.js: jeden snapshot/view-model, proceduralny visual, brak assetów na start.
5. Patch 5 — cosmic dust physical influence: drag/spowolnienie, stop threshold dla lekkich/wolnych obiektów, bez wpływu na HUD.
6. Patch 6 — merge/kondensacja: `dustMergeDistanceMul`, `dustCloudToGasPlanetMassThreshold`, `state:"condensing"`, future gas planet.
7. Patch 7 — konwersja `gray_locked harmonicDust` → `cosmic dust`: tylko po osiągnięciu progu, bez mieszania z HUD reservoir.
8. Patch 8 — `moonImpactDust` integration decision: kolorowy `moonImpactDust` i szary `moonImpactDust` nadal osobna decyzja.
9. Patch 9 — comet interactions with cosmic dust: dopiero po osobnym comet system foundation.

## 8A. NIE MYLIĆ

- `GRAY/mixed reservoir` po zmieszaniu kolorów w HUD ≠ `cosmic dust`.
- `gray_locked harmonicDust` / `futureCosmicCandidate` ≠ `cosmic dust` do czasu jawnej konwersji.
- `harmonicDust` z `10/20/50` = jedyny zbieralny kolorowy pył.
- `cosmic dust` = przyszły niezbieralny pył świata.
- księżyc wolny ≠ księżyc orbitalny.
- księżyc orbitalny ≠ zalążek planety.
- impact planety ≠ źródło pyłu.
- orbiter planety może rosnąć do księżyca, ale nie dalej.

## 9. Relacje z istniejącymi systemami

### 9.1. Relacje wymagane

Ten kontrakt zależy od:

- `WORLD_FUNCTION_MAP.md`, bo przyszła implementacja musi wejść w istniejące punkty update/collision/capture świata,
- fundamentu `HC.SpaceBodies`, bo pola masy, promienia, rodzaju ciała i future `orbitState` powinny być spójne z helperami ciał kosmicznych,
- obecnej progresji `meteor → asteroida → księżyc → planeta skalista`, bo impact/orbit rozdziela wolny księżyc od księżyca orbitalnego.

### 9.2. Relacje powiązane

Ten kontrakt jest powiązany z:

- `DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md` i harmonic dust reservoir, ale nie rozstrzyga automatycznego zbierania `moonImpactDust`,
- przyszłym fizycznym `cosmicGrayDust`, ale go nie implementuje,
- `COMETS_SYSTEM.md`, ale nie zastępuje komet i nie zmienia ich wyjątkowych efektów,
- `CARDS_SYSTEM.md`, ale nie zastępuje kart ani nie dodaje nowej ścieżki aktywacji kart.

## 10. Proponowana kolejność przyszłych patchy

Kolejność patchy dla `cosmic dust` jest kanonicznie opisana w sekcji 8. Rotacje planet, orbity i komety pozostają osobnymi torami, poza pierwszymi patchami `cosmic dust`.
