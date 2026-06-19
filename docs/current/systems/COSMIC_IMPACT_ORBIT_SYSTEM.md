# COSMIC_IMPACT_ORBIT_SYSTEM — kontrakt impact/orbit

> Status: ROBOCZY / KONTRAKT PROJEKTOWY / PRZED RUNTIME
> Obszar: impact planetarny / impact księżycowy / orbity / pyły impactowe
> Źródło prawdy: TAK, dla zasad projektowych opisanych w tym dokumencie; NIE jest opisem istniejącej implementacji runtime
> Ostatnia aktualizacja: 2026-06-19
> Powiązane dokumenty: ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md, ../technical/WORLD_FUNCTION_MAP.md, COMETS_SYSTEM.md, DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md, PRG_SYSTEM.md, CARDS_SYSTEM.md, SUB_META_SYSTEM.md

## 1. Cel i granice dokumentu

Ten dokument spisuje kontrakt projektowy dla kolejnego systemu kosmicznego:

- impactu na planetę skalistą,
- impactu na księżyc,
- powstawania orbiterów planetarnych,
- ograniczeń progresji orbitalnej,
- różnicy między pyłem harmonicznym, pyłem z uderzenia w księżyc i przyszłym fizycznym szarym pyłem kosmicznym.

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

## 7. Pył z uderzenia w księżyc

Uderzenie w księżyc tworzy pył. To jest najważniejsza różnica względem impactu planetarnego.

Zasady:

- meteor koloru A uderza w księżyc → powstaje pył koloru A,
- asteroida uderza w księżyc → powstaje szary pył,
- uderzenie innego księżyca albo większego obiektu w księżyc zostaje do późniejszej decyzji.

Pył z impactu księżycowego NIE jest tym samym co harmonic dust z kolizji dwóch meteorów tego samego koloru.

### 7.1. `harmonicDust`

- Powstaje z kolizji dwóch meteorów tego samego koloru.
- Jest zbierany przez PRG.
- Zasila HUD reservoir / depozyt, zgodnie z aktualnym kierunkiem HUD TOP reservoir.
- Działa przez model `10/20/50`: pierwszy zgodny hit daje `10%`, drugi `20%`, trzeci i kolejne `50%`.
- Obcy kolor miesza bieżący zasobnik do `GRAY` zgodnie z aktualnym kontraktem harmonic dust reservoir.

### 7.2. Kolorowy `moonImpactDust`

- Powstaje, gdy meteor koloru A uderza w księżyc.
- Kolor wynika z koloru meteoru.
- Sposób zbierania i ewentualna integracja z reservoir pozostają do decyzji w przyszłym patchu.
- Nie wolno automatycznie mieszać go z `harmonicDust` bez osobnej decyzji projektowej.

### 7.3. Szary `moonImpactDust`

- Powstaje, gdy asteroida uderza w księżyc.
- Jest szarym pyłem impactowym.
- Nie jest tym samym co `GRAY` / mixed reservoir.
- Nie jest jeszcze pełnym systemem fizycznego `cosmicGrayDust` / `dustCloud`, chyba że późniejszy patch tak zdecyduje.

### 7.4. Przyszły `cosmicGrayDust` / `dustCloud`

- To przyszły fizyczny szary pył kosmiczny.
- Jest niezależny od HUD reservoir.
- Nie jest zbieralny w zwykły sposób.
- Spowalnia obiekty.
- Może prowadzić do powstawania gazowych planet.
- Nie jest implementowany przez ten dokument.

## 8. NIE MYLIĆ

- `GRAY` reservoir po zmieszaniu kolorów w HUD ≠ fizyczny szary pył kosmiczny.
- `harmonicDust` z `10/20/50` ≠ pył z impactu księżyca.
- księżyc wolny ≠ księżyc orbitalny.
- księżyc orbitalny ≠ zalążek planety.
- impact planety ≠ źródło pyłu.
- impact księżyca = źródło pyłu.
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

## 10. Priorytet przyszłych patchy

### Patch A — impact resolver foundation

- Dodać `HC.Impact` albo podobny moduł.
- Dodać `splitMass`.
- Dodać `resolvePlanetImpact`.
- Dodać `resolveMoonImpact`.
- Dodać `spawnEjecta`.
- Bez pełnych efektów visual.

### Patch B — planet impact bez pyłu

- Uderzenie w planetę:
  - absorpcja,
  - eksplozja,
  - wyrzut drobin,
  - opcjonalna asteroida orbitalna,
  - brak pyłu.

### Patch C — orbital asteroid → orbital moon STOP

- Asteroida orbitalna może stać się księżycem orbitalnym.
- Księżyc orbitalny nie może przejść w planetę.

### Patch D — moon impact + pył

- Meteor w księżyc → kolorowy pył.
- Asteroida w księżyc → szary pył.
- Absorpcja przez księżyc max `30%`.
- Brak orbiterów księżyca.

### Patch E — orbit front/back

- `orbitState`.
- Front arc collisions.
- Back arc visual only.

### Patch F — cosmic gray dust foundation

- Fizyczne `dustClouds`.
- Drag / spowolnienie.
- Kondensacja.
- Później gas planet.
