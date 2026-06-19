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

## 7. Kontrakt pyłu: `harmonicDust`, `GRAY/mixed reservoir`, `cosmic dust`

### 7.1. Jeden zbieralny kolorowy pył

Kolorowy pył zbieralny = `harmonicDust` / pył po harmonicznym zderzeniu meteorów tego samego koloru.

Zasady:

- `harmonicDust` powstaje z kolizji dwóch meteorów tego samego koloru.
- Pojawia się w świecie jako chmura/obiekt kolorowego pyłu.
- Docelowo jest zbierany ręcznie przez PRG; obecny auto/test collection jest tymczasowy i nie jest target modelem.
- HUD reservoir przyjmuje ten pył jako stosik koloru.
- Reservoir działa przez model `10/20/50` opisany w `DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`.
- Nie istnieje osobny drugi zbieralny typ „ordinary colored dust clouds” obok `harmonicDust`.

### 7.2. `GRAY/mixed reservoir`

- Pomieszanie kolorów w reservoir tworzy `GRAY/mixed reservoir`.
- `GRAY/mixed reservoir` może być błędem gracza albo celową decyzją przy zbieraniu kolorowego pyłu.
- `GRAY/mixed reservoir` jest stanem zasobnika HUD, nie fizyczną chmurą świata.
- `GRAY/mixed reservoir` nie jest `cosmic dust`.

### 7.3. `cosmic dust`

- `cosmic dust` jest osobnym przyszłym systemem fizycznym świata kosmosu.
- `cosmic dust` jest niezbieralny w bazowym modelu.
- `cosmic dust` wpływa tylko na świat kosmosu i obiekty świata.
- Przykładowe przyszłe efekty to spowolnienie, kondensacja albo inne efekty środowiskowe.
- `cosmic dust` nie trafia do HUD reservoir.
- `cosmic dust` nie jest materiałem zbieranym PRG w bazowym modelu.
- `cosmic dust` nie jest `GRAY/mixed reservoir` i nie jest kolorowym `harmonicDust`.

### 7.4. Pył z impactu księżycowego

Uderzenie w księżyc może pozostać przyszłym źródłem pyłowych efektów świata, ale nie tworzy drugiego zbieralnego typu kolorowego pyłu bez osobnej decyzji projektowej. Jeśli późniejszy patch utrzyma pył impactowy, musi jawnie zdecydować, czy jest to wariant `harmonicDust`, niezbieralny efekt świata, czy inny nie-HUD descriptor.

## 8. Planowane transformacje kolorowego pyłu przez obiekty

Te reguły są future contract i nie opisują istniejącej implementacji runtime:

- Komety nie reagują z kolorowym pyłem tak jak z `cosmic dust`.
- Komety docelowo kolorują/przepisują kolor pyłu harmonicznego / chmury kolorowego pyłu.
- Asteroidy przechodzące przez kolorowy pył mogą przekształcać go w `GRAY/mixed reservoir` albo w przyszły szary stan według osobnej decyzji.
- Księżyce przejmują kolorowy pył i formują z niego kolorowe mini-pierścienie.
- Integracja tych transformacji wymaga osobnych przyszłych patchy runtime.

## 8A. NIE MYLIĆ

- `GRAY/mixed reservoir` po zmieszaniu kolorów w HUD ≠ `cosmic dust`.
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

1. Patch 1 — documentation sync dust/comets/orbit axes.
2. Patch 2 — harmonicDust manual collection foundation:
   - usunąć docelowo automat/test collection,
   - zostawić ręczne zbieranie PRG,
   - utrzymać `10/20/50` i HUD reservoir.
3. Patch 3 — Canvas2D + Three.js visual model dla kolorowego pyłu:
   - jeden snapshot/view-model,
   - Canvas2D fallback,
   - Three.js visual,
   - brak zmiany mechaniki.
4. Patch 4 — colored dust transformations by passing bodies:
   - comet colors/recolors dust,
   - asteroid can gray/mix dust,
   - moon absorbs colored dust into mini-rings.
5. Patch 5 — planet rotation axis + orbit plane debug controls.
6. Patch 6 — orbital asteroid / orbital moon STOP if not already complete.
7. Patch 7 — elliptical front/back orbit.
8. Patch 8 — cosmic dust foundation:
   - niezbieralny,
   - wpływa na świat,
   - nie trafia do HUD reservoir.
9. Patch 9 — gas planet from cosmic dust condensation.
10. Patch 10 — four-type comet system.
