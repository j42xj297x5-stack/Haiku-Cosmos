> Status: DO AKTUALIZACJI
> Obszar: mapa funkcji świata / runtime
> Źródło prawdy: NIE / CZĘŚCIOWO
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: ../README.md, ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md, ../systems/CARDS_SYSTEM.md, ../ui/UI_WORLD.md

# Haiku Cosmos — MAP_FUNCTIONS_WORLD_vNEXT

> Ten dokument jest aktywną mapą techniczną do przyszłej synchronizacji, ale nie jest jeszcze pełnym źródłem prawdy runtime.
> Wymaga osobnego audytu względem aktualnego kodu.
> W tym kroku utrzymano mapę merytoryczną bez pełnego przepisywania.

---

## 1. Globalny model RUN (init → update → render → reset)

### 1.1 Inicjalizacja świata (RUN start)
**Źródła:** `index.codex.html`, `game.boot.codex.js`

1) Ładowanie skryptów (kolejność w `index.codex.html`):
- `cards.codex.js` → `hc.core` → `hc.util` → `hc.world` → `hc.view_input` → `hc.camera` → `hc.comets` → `hc.meteors` → `hc.render` → `hc.collisions` → `hc.asteroids` → `hc.planets` → `hc.stars_epoch` → `hc.ui_debug` → `game.boot`.

2) Boot (IIFE w `game.boot.codex.js`):
- Tworzy `canvas/ctx`, `View`, `Input`, `Camera` oraz helpery globalne (`rand`, `clamp`, `screenToWorld`, `getWorldViewBounds`, itp.).
- Tworzy obiekt `World` (listy obiektów + parametry) i eksportuje go globalnie.
- Próbuje `CardEngine.bindWorld(World)` (gdy `CardEngine` już istnieje).
- Uruchamia moduły świata przez `HC.init*` (jeśli nie zainicjalizowane): `Stars`, `Planets`, `Comets`, `Meteors`, `Render`, `Asteroids`, `Collisions`.
- Inicjuje UI (`HC.UI.init()`), a następnie wywołuje `resetWorld()`.

3) Wrap reset w `hc.world.codex.js` (po `load`):
- Nadpisuje `resetWorld` tak, aby po bazowym resecie ustawić:
  - multiplikatory orbit (`metaOrbitMul*`),
  - stan slotów/forma (`resetFormaEffectState`),
  - wyczyścić `cardsPool/pending` i przeliczyć `totalCards`.

### 1.2 Pętla update (kolejność wywołań)
**Źródło:** `game.boot.codex.js::update(dt, nowMs)`

1) `Camera.update(dt)`.
2) `Input` → współrzędne świata (`screenToWorld`).
3) Zoom startowy po pierwszej planecie (`World.flags.firstPlanetZoomed`).
4) Moduły świata:
   - `HC.Meteors.update(dt, nowMs)`
   - `HC.Comets.update(dt, nowMs)`
   - `HC.Collisions.resolve(dt, nowMs)`
   - `HC.Asteroids.capture(dt, nowMs)`
   - `HC.Planets.capture(dt, nowMs)`
   - `HC.Asteroids.update(dt, nowMs)`
   - `HC.Planets.update(dt, nowMs)`
   - `HC.Stars.update(dt, nowMs)`
5) `CardEngine.update(dt, nowMs)` (oferty, timery, pending, forma, rytuały).

### 1.3 Render + UI
**Źródło:** `game.boot.codex.js::frame(now)`

- `HC.Render.frame(now, dt)` rysuje świat.
- `HC.UI.update(dt, now)`:
  - FPS + HUD RP + slider MPS.
  - `CardEngine.render(ctx, view.w, view.h)` (HUD kart + SUB-META).

### 1.4 Reset RUN (HARD RESET)
**Źródło:** `game.boot.codex.js::resetWorld()` + wrapper w `hc.world.codex.js`

- Czyści listy obiektów (meteory/asteroidy/planety/gwiazdy/komety).
- Resetuje parametry runu (`epoch*`, `score`, `spawnTimer`, `color streak`, `flags`, `metaSlots`, `paused`, itd.).
- Resetuje R1/R2 stany oraz bank kart (`cardBank` → zera).
- Czyści timery runu i efekty slotów (`RunTimers.reset`, `resetFormaEffectState`).
- Resetuje `CardEngine` (`resetForNewRun`) i czyści `cardsPool/pending`.

---

## 2. Global State Map (stan i zasoby)

### 2.1 World (globalny stan runtime)
**Listy obiektów:**
- `World.meteors[]`, `World.asteroids[]`, `World.planets[]`, `World.stars[]`, `World.comets[]`.

**Flagi/stan runu:**
- `World.flags.firstPlanetZoomed`, `World.flags.firstStarZoomed`.
- `World.epoch`, `World.epochTriggered`, `World.epochAt`.
- `World.score` (RP).
- `World.paused` (zamyka update przez `dtWorld = 0`).

**R1/R2 sekwencje (różne źródła):**
- Aktualnie używane: `World.r1 = { color, streak }` (w `hc.collisions.codex.js`).
- Zainicjalizowane w resecie, ale bez użycia: `World.r1Seq`, `World.r2Seq`.

**Karty / META:**
- `World.cardsPool[]` — pojedyncza pula kart (R1/R2, wszystkie tiery).
- `World.pendingCard`, `World.pendingCardUntilMs` — okno aktywacji (3s).
- `World.totalCards` — licznik (render/HUD).
- `World.cardBank` — stan „banku” kart (reset do 0, używany tylko do migracji).
- `World.metaSlots = { forma, intencja, czas, cisza }`.
- `World.subMetaOpen`, `World.subMetaShownThisRun`.

**Timery i efekty slotów:**
- `World.runColorTimers`, `World.runColorDurations`, `World.runWorldActiveUntilMs`, `World.runWorldStrengthMul`, `World.runActiveColors`.
- `World.effectTimersByColor`, `World.effectTimerDurationMsByColor` (system efektów kolorów).
- `World.formaActiveUntilMs`, `World.formaStrengthMul`, `World.formaOrbitReduction`, `World.formaOrbitReductionBase`, `World.formaColorKey`.
- `World.fxIntentBounceAsteroidPct`, `World.fxIntentBouncePlanetPct`.
- `World.fxSilenceOnlyColors`, `World.fxSilenceOnlyColorsUntilMs`.
- `World.fxTimeBonusMs`, `World.fxLastActivation`.

**Blokady/okna specjalne:**
- `World.pack01ReleaseBlockColor`, `World.pack01ReleaseBlockUntilMs` (blokada koloru w przechwytywaniu).
- `World.r1HudPulse` (puls obwódki HUD po otwarciu R1).

### 2.2 CardEngine (stan UI/offerów/overlay)
- `state.hand`, `state.queue`, `state.activeOffer`, `state.cooldowns`.
- `state.timed[]` (efekty czasowe targetów), `state.ritual` (karty rytuałów).
- `state.engineStats` (mnożniki PRG/pointer) → używane w `hc.meteors`.
- `state.targets` + `state.targetLibrary` (system targetów parametrów świata).
- `state.r1Overlay` (OPEN/FAIL/SUCCESS/ACTIVATED + TTL).
- `state.subMeta.*` (nawigacja overlay SUB-META).

### 2.3 Jedna pula kart (source of truth)
**Struktura `World.cardsPool[]`:**
- Każda karta to obiekt: `{ id, kind: "R1"|"R2", tier: "DR"|"sDR"|"pDR", colorA, colorB?, inSlotKey? }`.
- Pula służy jednocześnie HUD, SUB-META, pickerowi i kuźni.

### 2.4 Timery aktywacji (kolory / UI / spawn)
- `RunTimers.startOrRefresh(World, color, durationMs, nowMs, strengthMul)` zapisuje:
  - `runColorTimers[color] = now + durationMs`,
  - `runColorDurations[color] = durationMs`,
  - `runWorldStrengthMul` (max z aktywacji).
- HUD rysuje paski czasu na bazie `runColorTimers` + `runColorDurations`.
- Spawn meteorów filtruje kolory przez `RunTimers.isColorDisabled`.
- Efekty slotów (intencja/cisza/forma/czas) są aktywowane tylko w trakcie aktywacji RUN (R1/R2).

---

## 3. Moduły świata (każdy osobno)

### 3.1 `hc.world.codex.js` — WorldEvents + Timery + Sloty
**STATE:**
- `World.meteorStreams`, `World.runColorTimers`, `World.effectTimersByColor`.
- `World.fx*` (slot effects), `World.metaOrbitMul*`, `World.forma*`.
- Reset wrapper (`resetWorld` → czyszczenie meta/kart).

**PARAMS:**
- `DEFAULT_METEOR_STREAMS` (spawn/shift/streams).
- Kolory timerów: `RUN_TIMER_COLORS`, `EFFECT_TIMER_COLORS`.

**Funkcje kluczowe:**
- `ensureMeteorStreams`, `resetRunTimers`, `resetEffectTimers`, `ensureWorldSlotEffects`.
- `RunTimers.startOrRefresh`, `RunTimers.isWorldSlotsActive`, `RunTimers.isColorDisabled`.
- `WorldEvents.startMeteorShower/stopMeteorShower` (emituje `EVENT_METEOR_SHOWER_*`).
- `WorldEvents.interruptPreStar` (emituje `PRESTAR_INTERRUPTED`).

**Eventy/hooki:**
- Emituje: `EVENT_METEOR_SHOWER_START`, `EVENT_METEOR_SHOWER_END`, `PRESTAR_INTERRUPTED`.

---

### 3.2 `hc.meteors.codex.js` — Meteory
**STATE:**
- `World.meteors[]`.

**PARAMS:**
- Spawny: `World.spawnInterval`, `World.spawnIntervalMul`, `World.maxMeteors`.
- PRG: `World.pointerRadius`, `World.pointerStrength`, `World.pointerGlueDamp`.
- CardEngine: `engineStats.pointer_*`, `engineStats.meteor_mouse_control`.

**Funkcje kluczowe:**
- `spawnMeteor` i `spawnStreamMeteor`.
- `updateMeteors(dt, nowMs)`:
  - spawn zwykły i strumieniowy (tylko gdy `epoch=STAR` i `meteorStreams.enabled`),
  - filtruje kolor na bazie `RunTimers.isColorDisabled` i `fxSilenceOnlyColors*`,
  - PRG (ciągnięcie meteorów kursorem).

**Eventy:**
- Emituje: `METEOR_SPAWNED`.

---

### 3.3 `hc.collisions.codex.js` — Kolizje meteorów + R1
**STATE:**
- `World.r1 = { color, streak }` (runtime sekwencji R1).

**PARAMS:**
- `World.meteorCollisionFudge`.

**Funkcje kluczowe:**
- `resolveMeteorCollisionsSafe()`:
  - ten sam kolor → `addScore(1)`, emit `METEOR_SAME_COLOR_COLLISION` + `handleR1SameColorCollision`.
  - różny kolor → `spawnAsteroidFromCollision`, emit `METEOR_DIFF_COLOR_COLLISION`.
- `handleR1SameColorCollision(colorName)`:
  - 2x ten sam kolor → emit `R1_OPEN`.
  - 3x ten sam kolor → emit `R1_SUCCESS` i reset stanu.
  - zmiana koloru po streak==2 → `addScore(3)` + emit `R1_FAIL`.

---

### 3.4 `hc.asteroids.codex.js` — Asteroidy
**STATE:**
- `World.asteroids[]` + per-asteroid `orbiters`, `capture*`, `live*`, `isCollapsing`.

**PARAMS:**
- `World.asteroidDriftMul`, `World.planetCaptureTarget`.
- `World.metaOrbitMulAsteroid` (forma).

**Funkcje kluczowe:**
- `spawnAsteroidFromCollision(a, b)` (kolizje meteorów).
- `captureMeteorsByAsteroids(dt, nowMs)`:
  - blokada koloru `pack01ReleaseBlockColor`,
  - odbicie meteorów wg `fxIntentBounceAsteroidPct` gdy aktywne sloty.
- `startAsteroidCollapse` → `finishCollapseToPlanet` (emituje `ASTEROID_COLLAPSE_START`, `PLANET_CREATED`).

---

### 3.5 `hc.planets.codex.js` — Planety
**STATE:**
- `World.planets[]`, per-planet `orbiters`, `rings`, `preStar`, `rocky*`.

**PARAMS:**
- `STAR_REQ_*`, `starDominancePctBase`, `STAR_RARE_MONO_MIN`, `PRESTAR_DURATION_*`.
- `ROCKY_*`, `GAS_GRAVITY_CONTACT_EPS`, `PLANET_*`.

**Funkcje kluczowe:**
- `captureMeteorsByPlanets` i `captureAsteroidsByPlanets`:
  - blokada koloru `pack01ReleaseBlockColor`,
  - odbicie meteorów wg `fxIntentBouncePlanetPct` gdy aktywne sloty.
- `transformGasPlanetIntoStar` (przejście do gwiazdy).
- `Events.on("PLANET_CREATED")` → otwarcie SUB-META (`World.subMetaOpen`, `World.paused`).

---

### 3.6 `hc.comets.codex.js` — Komety
**STATE:**
- `World.comets[]`, `Comets.CONFIG`, `spawnState`, `event`.

**PARAMS:**
- `Comets.CONFIG.spawn.*`, `Comets.CONFIG.types`, `Comets.CONFIG.tail.*`.

**Funkcje kluczowe:**
- `update(dt, nowMs)` — spawn/motion/kolizje.
- Obsługa eventu `COMET_SHOWER` (przyspieszony spawn tymczasowy).

---

### 3.7 `hc.stars_epoch.codex.js` — Gwiazdy + epoka
**STATE:**
- `World.stars[]`, `World.epoch`, `World.epochTriggered`, `World.epochAt`.
- `star.birth`, `star.sizeClass`, `star.gradientOuterColor`.

**PARAMS:**
- `STAR_SIZE_*`, `STAR_RARE_MONO_MIN`, `STAR_THRESHOLD_INTERRUPT_MULT`.
- `World.metaOrbitMulStar` (forma).

**Funkcje kluczowe:**
- `startStarEpochZoomOut(star, screenW, screenH)`:
  - ustawia `World.epoch = "STAR"` + aktywuje `Camera.epochZoom`.
- `captureBodiesByStars(dt)` i `reconcileStarOwnershipOnBirth`.
- `updateStars(dt)` → klasy gwiazd (`small/big/very_big`).

---

### 3.8 `hc.render.codex.js` — Render
**STATE:**
- Brak stanu świata (odczyt `World/Camera/View`).

**PARAMS:**
- Wyłącznie parametry wizualne (kolory, alfy, style).

**Funkcje kluczowe:**
- `HC.Render.frame(now, dt)` — rysuje tło, meteory, asteroidy, planety, gwiazdy, pierścienie itp.

---

### 3.9 `hc.ui_debug.codex.js` — HUD RP + UI
**STATE:**
- `scoreLabel`, `mpsUI` (slider), `btnRestart`, `btnSubMeta`.

**PARAMS:**
- MPS slider → `World.spawnInterval`.

**Funkcje kluczowe:**
- `addScore(points)` — jedyny globalny licznik RP (używany w kolizjach R1).
- `HC.UI.init()` — buduje top bar + podpina kliknięcia.
- `HC.UI.update(dt, now)` — aktualizuje FPS, RP i wywołuje `CardEngine.render`.

---

### 3.10 `cards.codex.js` — CardEngine + SUB-META
**STATE:**
- `state.activeOffer/queue/hand`, `state.cooldowns`, `state.timed`, `state.ritual`.
- `state.targets` + `engineStats`.
- `state.r1Overlay`, `state.subMeta.*`.

**PARAMS:**
- `config.pack01TargetDurationMs = 180000` (czas aktywacji R1/R2).
- Koszty META: `SUB_META_ASSIGN_COST = 10`, kuźnia `SUB_META_FORGE_COSTS`, zużycie `SUB_META_FORGE_CONSUMES`.

**Funkcje kluczowe:**
- `bindWorld(World)` — inicjalizuje `cardsPool`, timery, sloty i rejestruje listenerów R1.
- `onCardCollected` → tworzy `pendingCard` (3s okno aktywacji).
- `flushPendingCard` → po czasie odkłada do `cardsPool`.
- `onRunActivateR1/R2` → aktywacja runu i slotów + timery kolorów.
- `render()` → HUD kart + SUB-META (sloty, magazyn, picker, kuźnia, panel info).
- `handlePointerDown()` → obsługa kliknięć (R1 activation, oferty, SUB-META).

---

## 4. Punkty ingerencji kart (CRITICAL)

### 4.1 Gdzie powstaje karta R1 DR
- `hc.collisions.codex.js::handleR1SameColorCollision` emituje `R1_SUCCESS` po 3 kolizjach tego samego koloru.
- `cards.codex.js` nasłuchuje `R1_SUCCESS` i wywołuje `onCardCollected({ kind: "R1", tier: "DR", colorA })`.

### 4.2 Gdzie powstaje pending 3s
- `cards.codex.js::onCardCollected` ustawia:
  - `World.pendingCard = <R1 entity>`,
  - `World.pendingCardUntilMs = now + 3000`.
- Jeśli inna karta wpada w trakcie, poprzednia pending jest natychmiast dodawana do `cardsPool`.

### 4.3 Aktywacja (klik) i skutki
- `cards.codex.js::handlePointerDown`:
  - gdy `r1Overlay.mode === "SUCCESS"` i klik w overlay,
  - wywołuje `onRunActivateR1({ baseDurationMs: 180000, colorKey, tierKey: "DR" })`.
- `onRunActivateR1`:
  - `consumePendingCard` (musi być w oknie 3s),
  - `applyWorldSlotEffectsOnRunActivation` (czas/intencja/cisza + `runWorldStrengthMul`),
  - `startRunTimerForColor` (kolorowe timery aktywacji),
  - `startFormaEffect` (redukcja orbit z meta slotu `forma`).
- UI: `showR1Overlay("ACTIVATED", colorKey, 1000)` = toast 1s.

### 4.4 “Nieaktywowane = zebrane”
- `CardEngine.update` → `flushPendingCard` po upływie 3s:
  - `addCardToPool(World, pendingCard)`.
  - karta staje się „zebrana”, dostępna dla HUD/SUB-META.

### 4.5 RP (Punkty Rezonansu)
- `hc.ui_debug.codex.js::addScore` modyfikuje `World.score`.
- Wywołania:
  - `hc.collisions.codex.js`: +1 za kolizję tego samego koloru.
  - `hc.collisions.codex.js`: +3 za „fail” R1 (zmiana koloru po streak==2).

### 4.6 HUD kart (DR + timery)
- `cards.codex.js::renderPack01Collection`:
  - pobiera ilość DR z `World.cardsPool` (`getCardCount(..., { availableOnly: true })`),
  - rysuje pionowe paski czasu z `World.runColorTimers/runColorDurations`.
- Puls obwódki HUD: `World.r1HudPulse` ustawiane po `R1_OPEN`.

---

## 5. SUB-META / META (relacja do świata)

### 5.1 Co zapisuje
- Sloty: `World.metaSlots.{forma,intencja,czas,cisza}`.
- Magazyn/Inventory: opiera się o `World.cardsPool`.
- Kuźnia: `craftSubMetaForge` usuwa DR z `cardsPool` i dodaje `sDR/pDR` do tej samej puli.
- Koszty RP: `SUB_META_ASSIGN_COST`, `SUB_META_FORGE_COSTS` odejmują `World.score`.

### 5.2 Co NIE wykonuje
- Nie aktywuje runu ani nie odpala efektów bez kliknięcia w overlay R1.
- Nie wpływa na update świata poza `World.paused = true` podczas otwarcia.
- Brak bezpośredniej aktywacji „R2” lub panelu aktywacji z SUB-META (tylko assign/forge).

### 5.3 Jak działa UI (sloty/magazyn/picker/kuźnia/info)
- Render: `CardEngine.render` → `renderSubMetaOverlay`.
- Sloty (lewa kolumna): `World.metaSlots` + assign/remove.
- Magazyn (prawa góra): `getSubMetaInventoryEntries` z `cardsPool`.
- Picker (lewa dół):
  - assign: `getSubMetaAvailableCards` (karty zgodne z kolorem slotu).
  - forge: `getSubMetaForgeList` (progi 3× DR → sDR, 9× DR → pDR).
- Panel info (prawa dół): opis slotu/karty lub kuźni (koszty, dostępność).

### 5.4 Trigger otwarcia
- `hc.planets.codex.js`: `Events.on("PLANET_CREATED")` → `World.subMetaOpen = true`, `World.paused = true`.
- UI: `btnSubMeta` w `hc.ui_debug.codex.js` otwiera overlay ręcznie.

---

## 6. Epoki / zoom / star epoch

### 6.1 Przejście do epoki STAR
- Warunek: gazowa planeta spełnia progi dominacji → `preStar` → `transformGasPlanetIntoStar`.
- `startStarEpochZoomOut` ustawia `World.epoch = "STAR"` + `Camera.epochZoom`.

### 6.2 Zmiany reguł w STAR
- `World.meteorStreams` aktywne tylko w `epoch=STAR`.
- `HC.WorldEvents.startMeteorShower` może włączyć tymczasowe strumienie.
- Gwiazdy przechwytują planety/asteroidy (`captureBodiesByStars`).

---

## 7. Open Gaps / Rozjazdy / TODO

1) **`World.r1Seq` / `World.r2Seq`**
   - Pola resetowane w `resetWorld`, ale nieużywane w logice.
   - Aktualny stan R1 jest w `World.r1` (moduł `hc.collisions`).

2) **`pack01ReleaseBlockColor`**
   - Używane w `hc.asteroids` i `hc.planets` do blokowania przechwytu meteorów,
   - brak miejsca w kodzie, które ustawia `pack01ReleaseBlockColor`/`UntilMs`.

3) **RunTimers vs spawn kolorów**
   - `RunTimers.isColorDisabled` blokuje kolor w spawnie.
   - Aktywacja R1 uruchamia `runColorTimers` dla tego koloru, więc efekt w praktyce „wyłącza” ten kolor w spawnie (może być sprzeczne z intencją aktywacji).

4) **R2 flow**
   - Istnieje `onRunActivateR2`, ale brak mechanizmu generowania kart R2 i overlay aktywacji R2 (brak eventów/sekwencji).

5) **EffectTimers**
   - System `EffectTimers` istnieje w `hc.world`, ale nie jest używany w runtime.

6) **SUB-META aktywacja**
   - Layout zawiera `activateButton`, ale brak render/click logic dla aktywacji z SUB-META.

7) **CardEngine offers vs R1**
   - `CARD_DEFS` i system ofert/rituali istnieją, ale nie są sprzężone z sekwencją R1/R2.

8) **Dokumentacja vs kod (PRG/Meta)**
   - Dokumenty opisują dodatkowe tryby PRG i pełną progresję R1/R2.
   - Kod zawiera tylko minimalny flow R1 + META sloty/kuźnię (brak reszty kanonu).

---
