# Haiku Cosmos — MAP_FUNCTIONS_WORLD_vNEXT

> Aktualna mapa funkcji świata (stan kodu + dokumentacja kanoniczna).
> Zakres źródeł: `*.codex.js` oraz `md/*.md` (zgodnie z instrukcją ETAP 0).
> Brak refaktoru/zmian logiki — wyłącznie mapowanie.

---

## 1. Globalny model RUN

### 1.1 Inicjalizacja świata (RUN start)
**Źródło:** `game.boot.codex.js`

1) Tworzenie i ekspozycja singletonów:
- `World`, `View`, `Camera`, `Input`, helpery globalne (`rand`, `clamp`, itd.).
- `window.HC.getWorld()` (fallback do `window.World`).
- Powiązanie `CardEngine` z `World` przez `CardEngine.bindWorld`.

2) Inicjalizacja modułów świata (`HC.init*`):
- `hc.stars_epoch.codex.js`, `hc.planets.codex.js`, `hc.comets.codex.js`,
  `hc.meteors.codex.js`, `hc.render.codex.js`, `hc.asteroids.codex.js`,
  `hc.collisions.codex.js`.

3) Reset RUN:
- `resetWorld()` czyści listy obiektów, flagi epok, stany kart, itd.
- `CardEngine.resetForNewRun()` kasuje timed effects, cooldowny, trial itd.

4) Start pętli `requestAnimationFrame(frame)`.

### 1.2 Pętla update
**Źródło:** `game.boot.codex.js::update(dt, nowMs)`

Kolejność kluczowa:
1) `Camera.update(dt)` (zoom/epoka).
2) Input → współrzędne świata (`screenToWorld`).
3) Moduły świata:
   - `HC.Meteors.update(dt, nowMs)`
   - `HC.Comets.update(dt, nowMs)`
   - `HC.Collisions.resolve(dt, nowMs)`
   - `HC.Asteroids.capture(dt, nowMs)`
   - `HC.Planets.capture(dt, nowMs)`
   - `HC.Asteroids.update(dt, nowMs)`
   - `HC.Planets.update(dt, nowMs)`
   - `HC.Stars.update(dt, nowMs)`
4) `CardEngine.update(dt, nowMs)` (oferty, efekty czasowe, rytuały).

### 1.3 Render i UI
**Źródło:** `game.boot.codex.js::frame(now)`

- `HC.Render.frame(now, dt)` rysuje tło + obiekty świata.
- `HC.UI.update(dt, now)` rysuje HUD oraz `CardEngine.render(...)`.

### 1.4 RUN → RUN+1
**Źródło:** `game.boot.codex.js::resetWorld()`

Reset następuje wyłącznie przez `resetWorld()` (np. przycisk UI). Reset:
- czyści listy obiektów (meteory/asteroidy/planety/gwiazdy/komety),
- resetuje parametry runu (`epoch*`, `score`, `meteorStreams`, trial, metaSlots),
- resetuje stan kart (`CardEngine.resetForNewRun()`).

---

## 2. Moduły świata (każdy osobno)

### 2.1 `game.boot.codex.js` — World Core / Loop
**STATE:**
- `World.meteors[]`, `World.asteroids[]`, `World.planets[]`, `World.stars[]`.
- `World.flags` (np. `firstPlanetZoomed`).
- `World.meteorStreams` (obiekt sterujący strumieniami meteorów).
- `World.epoch`, `World.epochTriggered`, `World.epochAt`.
- `World.score`, `World.colorStreakKey`, `World.colorStreakCount`.
- `World.trialPack01*`, `World.collectedCardsByColor`.
- `World.metaSlots`, `World.subMetaOpen`, `World.subMetaShownThisRun`.
- `World.paused`, `World.pack01ReleaseBlockColor`, `World.pack01ReleaseBlockUntilMs`.
- `World.meteorBounceEnabled`.

**PARAMS:**
- Spawnowanie: `spawnInterval`, `spawnIntervalMul`, `maxMeteors`.
- PRG/pointer: `pointerRadius`, `pointerStrength`, `pointerGlueDamp`.
- Kolizje: `meteorCollisionFudge`.
- Asteroidy: `asteroidDriftMul`, `planetCaptureTarget`.
- Gwiazdy / epoki: `STAR_*`, `starDominancePctBase`, `starThresholdMultiplierThisRun`, `PRESTAR_*`, `STAR_BIRTH_*`.
- Planety skaliste i wizualne: `ROCKY_*`, `PLANET_*`.

**Funkcje kluczowe:**
- `update(dt, nowMs)` – główny tick.
- `resetWorld()` – reset runu.

---

### 2.2 `hc.world.codex.js` — WorldEvents / meteor streams
**STATE:**
- `World.meteorStreams` (alokowane na żądanie).

**PARAMS:**
- `meteorStreams.baseSpawnRate`, `meteorStreams.spawnRate`.
- `meteorStreams.baseStreams`, `meteorStreams.streams`.
- `meteorStreams.shiftEvery`, `shiftAmount`, `driftSpeed`.

**Wejścia:**
- `HC.WorldEvents.startMeteorShower({durationMs, intensity})`.
- `HC.WorldEvents.stopMeteorShower()`.
- `HC.WorldEvents.interruptPreStar(planetId)`.

**Skutki:**
- Aktywacja strumieni meteorów w epoce `STAR`.
- Przerwanie `preStar` na planecie + podniesienie progu `starThresholdMultiplierThisRun`.

---

### 2.3 `hc.meteors.codex.js` — meteory
**STATE:**
- `World.meteors[]` (obiekty meteorów).

**PARAMS (World/Engine):**
- Spawn: `World.spawnInterval`, `World.spawnIntervalMul`, `World.maxMeteors`.
- PRG: `World.pointerRadius`, `World.pointerStrength`, `World.pointerGlueDamp`.
- Modyfikatory kart: `CardEngine.state.engineStats.*`.
- Epocha: `World.epoch`, `World.meteorStreams`.

**Punkty logiki:**
- `spawnMeteor()`, `spawnStreamMeteor()`.
- `updateMeteors(dt, nowMs)`:
  - spawnowanie meteorów i strumieni,
  - przyciąganie kursorem (PRG),
  - star capture (meteory wpadają do gwiazd),
  - opcjonalne odbicia (`World.meteorBounceEnabled`).

---

### 2.4 `hc.collisions.codex.js` — kolizje meteorów
**STATE:**
- Modyfikacje na `World.meteors[]`.

**PARAMS:**
- `World.meteorCollisionFudge` (ułatwienie kontaktu).

**Punkty logiki:**
- `resolveMeteorCollisionsSafe()`:
  - ten sam kolor → `METEOR_SAME_COLOR_COLLISION` + `addScore(1)`
  - różny kolor → `spawnAsteroidFromCollision`.

---

### 2.5 `hc.asteroids.codex.js` — asteroidy
**STATE:**
- `World.asteroids[]`.
- Dane w asteroidzie: `orbiters[]`, `captureCount`, `liveSumR`, `liveSumMass`, itd.

**PARAMS:**
- `World.asteroidDriftMul` (skalowanie vx/vy po kolizji).
- `World.planetCaptureTarget` (próg kolapsu → planeta).

**Punkty logiki:**
- `spawnAsteroidFromCollision(a, b)` (kolizje meteorów).
- `captureMeteorsByAsteroids(dt, nowMs)`:
  - przechwytywanie meteorów na orbity,
  - blokada koloru przez `pack01ReleaseBlockColor`.
- `startAsteroidCollapse` → `finishCollapseToPlanet` (emit `PLANET_CREATED`).

---

### 2.6 `hc.planets.codex.js` — planety
**STATE:**
- `World.planets[]`.
- W planetach: `orbiters[]`, `rings[]`, `rocky*`, `preStar`, `planetKind`, itd.

**PARAMS:**
- Star thresholds: `STAR_REQ_*`, `starDominancePctBase`, `starThresholdMultiplierThisRun`.
- Rocky tuning: `ROCKY_*`, `GAS_GRAVITY_CONTACT_EPS`.
- Orbital/visual: `PLANET_*`.

**Punkty logiki:**
- `captureMeteorsByPlanets()` / `captureAsteroidsByPlanets()`.
- `preStar` (gazowa planeta wchodzi w fazę PRESTAR).
- `transformGasPlanetIntoStar(...)` (tworzy gwiazdę i wywołuje epokę).
- `Events.on("PLANET_CREATED")` → otwarcie SUB-META (`World.subMetaOpen = true`).

---

### 2.7 `hc.comets.codex.js` — komety
**STATE:**
- `World.comets[]`.
- `Comets.CONFIG`, `spawnState`, `event`.

**PARAMS:**
- `Comets.CONFIG.spawn` (czas/ilosć meteorów jako trigger).
- `Comets.CONFIG.types` (różne typy komet).
- `Comets.CONFIG.tail` (wizualny ogon).

**Punkty logiki:**
- `update(dt, nowMs)` spawn + ruch + kolizje.
- `COMET_SHOWER` event (zmienia parametry spawnu tymczasowo).
- Kolizje:
  - comet vs meteor → fragmenty, defleksja,
  - comet vs asteroid → transformacja w planetę skalistą,
  - comet vs planet → wzrost masy, ewentualne "life".

---

### 2.8 `hc.stars_epoch.codex.js` — gwiazdy + epoka
**STATE:**
- `World.stars[]`.
- `World.epoch`, `World.epochTriggered`, `World.epochAt`.

**PARAMS:**
- Progi rozmiaru gwiazd: `STAR_SIZE_*`.

**Punkty logiki:**
- `startStarEpochZoomOut(star, screenW, screenH)`:
  - ustawia `World.epoch = "STAR"` i zoom epoki.
- `reconcileStarOwnershipOnBirth(...)`: przechwytywanie planet/asteroid.
- `captureBodiesByStars(dt)`.
- `updateStars(dt)`:
  - klasy rozmiaru gwiazdy (`small` / `big` / `very_big`).

---

### 2.9 `cards.codex.js` — CardEngine
**STATE:**
- `CardEngine.state`:
  - `hand`, `queue`, `activeOffer`, `cooldowns`, `timed`, `ritual`.
  - `engineStats` (modyfikatory PRG).
  - `world` (link do World), `targets`, `targetLibrary`.
  - `trialUI` (R1 trial), `subMeta.selectedSlotKey`.

**PARAMS (targets):**
- `engine.*`: `meteor_mouse_control`, `pointer_radius_mul`, `pointer_strength_mul`.
- `world.*`: `spawn_interval_mul`, `spawn_interval_sec`, `max_meteors`,
  `pointer_radius`, `pointer_strength`, `pointer_glue_damp`,
  `meteor_collision_fudge`, `asteroid_drift_mul`, `planet_capture_target`, `score`.
- `comets.*` jeśli `Comets.CONFIG` istnieje.

**Punkty logiki:**
- `applyEffects(effects)` → zapis targetów (SET/ADD/MUL) + timed restore.
- `offerCardById`, `useCard`, `update` (okna ofert, rytuały, timed effects).
- Trial pack01: nasłuch `METEOR_SAME_COLOR_COLLISION`.

---

### 2.10 `hc.view_input.codex.js` — Input
**STATE:**
- `Input.pointerDown`, `Input.x/y`, `Input.wx/wy`.

**PARAMS:**
- Brak.

**Punkty logiki:**
- PointerDown → `CardEngine.handlePointerDown(...)` (obsługa kart/submeta).

---

### 2.11 `hc.ui_debug.codex.js` — HUD + UI kart
**STATE:**
- HUD score (`World.score`) + slider meteors/s.

**PARAMS:**
- MPS → `World.spawnInterval` (ustawiany przez UI suwak).

**Punkty logiki:**
- `HC.UI.update` rysuje `CardEngine.render`.

---

### 2.12 `hc.camera.codex.js` — Camera
**STATE:**
- `Camera.zoom/scale`, `Camera.epochZoom`.

**PARAMS:**
- `Camera.min/max/target/ease`.

---

### 2.13 `hc.render.codex.js` — Render
**STATE:**
- Brak stanu świata (tylko odczyt World/Camera/View).

**PARAMS:**
- Tylko parametry wizualne (kolory, alfy), brak logiki świata.

---

## 3. Punkty ingerencji kart (CRITICAL)

### 3.1 Targety CardEngine (runtime)
**Źródło:** `cards.codex.js::bindWorld` + `applyEffects`.

Karty ingerują przez:
- `targets.get(id).set(value)` w `applyEffects`.
- Efekty czasowe: `state.timed` z `restoreFn` (timer).

**Miejsca wpływu:**
- PRG/pointer: `engine.pointer_*` (mnożniki) + `world.pointer_*` (baza).
- Spawn: `world.spawn_interval_mul`, `world.spawn_interval_sec`, `world.max_meteors`.
- Kolizje: `world.meteor_collision_fudge`.
- Asteroidy/planety: `world.asteroid_drift_mul`, `world.planet_capture_target`.
- Comets: `comets.*` (jeśli system komet aktywny).

### 3.2 Rytuały i triale
**Źródło:** `cards.codex.js` + `hc.collisions.codex.js`.

- Event `METEOR_SAME_COLOR_COLLISION` → `handleTrialColorPick`.
- Sukces/porazka triala generuje:
  - kolekcję kart (`collectPack01Card`),
  - blokadę koloru `World.pack01ReleaseBlockColor`.

### 3.3 Blokady/odblokowania zachowań świata
**Źródło:** `cards.codex.js`, `hc.planets.codex.js`, `hc.asteroids.codex.js`.

- `World.pack01ReleaseBlockColor` blokuje wejście meteorów na orbity
  (asteroidy/planety). To jest runtime'owa ingerencja typu "block".

---

## 4. SUB-META — relacja do świata

### 4.1 Co SUB-META zapisuje (runtime)
**Źródło:** `cards.codex.js`.

- `World.metaSlots` (sloty: `forma`, `intencja`, `czas`, `cisza`).
- Zmiany w `World.collectedCardsByColor` przy przypisaniu kart.
- `World.subMetaOpen` + `World.paused` (pauza świata).

### 4.2 Czego SUB-META NIE wykonuje
- Nie modyfikuje bezpośrednio parametrów świata (brak sprzężenia z targetami).
- Nie aktywuje PRG/trybów — tylko zapisuje konfigurację.
- Nie ma wpływu na update loop poza pauzą (dt=0).

### 4.3 Trigger otwarcia
**Źródło:** `hc.planets.codex.js`.

- `PLANET_CREATED` → jeśli `World.subMetaShownThisRun === false`,
  to `World.subMetaOpen = true` i `World.paused = true`.

---

## 5. PRG — relacja do świata

### 5.1 PRG jako parametr świata (kod)
**Źródło:** `hc.meteors.codex.js`, `cards.codex.js`.

- PRG wpływa dziś wyłącznie na:
  - `pointerRadius`, `pointerStrength`, `pointerGlueDamp`,
  - mnożniki `engineStats` z CardEngine.

### 5.2 PRG jako tryb (doc)
**Źródła:** `md/Player Reaction Field PRG.md`, `md/SUB META SYSTEM.md`, `md/UI_WORLD.md`.

- Dokumenty opisują tryby PRG, odpychanie, przyśpieszanie, oddziaływanie na planetoidy/planety.
- W kodzie brak systemu toggle PRG oraz brak trybu repel/speed-up.

---

## 6. Epoki — zmiany reguł

### 6.1 Epoka `STAR`
**Źródło:** `hc.planets.codex.js` + `hc.stars_epoch.codex.js` + `hc.meteors.codex.js`.

**Trigger przejścia:**
- Gazowa planeta wchodzi w `preStar` (po spełnieniu progów dominacji i liczby meteorów).
- Po czasie `preStar.duration` → `transformGasPlanetIntoStar`.
- `startStarEpochZoomOut` ustawia `World.epoch = "STAR"`.

**Zmiana reguł (paradygmat):**
- Aktywacja strumieni meteorów (`World.meteorStreams`) tylko w epoce `STAR`.
- Nowa reguła przechwytywania przez gwiazdy (orbitowanie planet/asteroid).
- Zoom kamery dopasowany do zasięgu gwiazdy.

---

## 7. Open Gaps / Braki / Niejawne zależności

1) **SUB-META (dok) vs kod**
   - Dokumentacja przewiduje ręczne otwieranie, koszty RP, sloty z wieloma miejscami, PRG zakupy.
   - Kod zawiera tylko prosty overlay i zapis `metaSlots` bez kosztów i bez PRG.

2) **PRG (dok) vs kod**
   - Brak repel/odwrócenia siły, brak przyśpieszania świata, brak oddziaływania na planetoidy/planety.
   - Brak UI toggle PRG i brak integracji z `SUB-META` poza definicją slotów.

3) **Karty R1/R2 (dok) vs kod**
   - Kod ma jedynie minimalny pack trial (kolory) i nie implementuje pełnych sekwencji R1/R2.
   - Brak logiki `allowedSlots`, RP kosztów, progresji DR/sDR/pDR.

4) **TARGETS_SYSTEM (dok) vs kod**
   - W kodzie targety istnieją, ale są ograniczone do podstawowych parametrów.
   - Rytuały opisane w dok nie mają odpowiedników (poza pack01 trial).

5) **Epochi/progi (karty) vs kod**
   - Brak mechanizmów kart modyfikujących epokę poza targetami, brak explicit "EPOCH_CHANGED" eventu.

6) **SUB-META jako konfiguracja RUN**
   - Konfiguracja w `World.metaSlots` nigdzie nie jest odczytywana przez logikę świata.
   - Nie ma przełożenia na `CardEngine.targets` ani zachowania obiektów.

---
