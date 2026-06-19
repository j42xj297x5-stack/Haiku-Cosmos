> Status: ROBOCZY
> Obszar: mapa funkcji świata / runtime
> Źródło prawdy: CZĘŚCIOWO — robocza mapa orientacyjna; NIE zastępuje audytu kodu
> Ostatnia aktualizacja: 2026-06-19
> Powiązane dokumenty: ../maps/DEPENDENCY_MAP.md, SPACE_MECHANICS_CONTRACT.md, SEQUENCE_STATE_CONTRACT.md, IMPLEMENTATION_TRACKER.md, LIVE_VALIDATION_PACK.md, ../systems/CARDS_SYSTEM.md, ../systems/PRG_SYSTEM.md, ../ui/UI_WORLD.md

# Haiku Cosmos — MAP_FUNCTIONS_WORLD_vNEXT

> Ten dokument jest roboczą mapą orientacyjną runtime i służy do szybkiego mapowania obszarów kodu.
> Nie jest kanonem technicznym funkcja-po-funkcji i nie zastępuje pełnego audytu runtime.
> Przy zmianach runtime należy aktualizować tę mapę albo `IMPLEMENTATION_TRACKER.md` oraz oznaczać sekcje niepewne jako `DO WERYFIKACJI`.

---


## 0A. Kontrakt ciał kosmicznych (Patch D0)

**Nowy kontrakt techniczny:** `SPACE_MECHANICS_CONTRACT.md`.

Dla meteorów, asteroid, księżyców, planet, gwiazd, `impactFragment` oraz przyszłych orbital bodies obowiązuje model: direct impact/progression w runtime -> wspólny snapshot/view-model -> Canvas2D albo Three.js. Legacy planet capture nie jest live ścieżką: `orbitPx`, `gravityR`, `parentKind`/`parentRef`, `theta`/`omega`/`orbitR` oraz `orbiters` są polami compatibility/deprecated zależnie od kontekstu, a nie nowym źródłem mechaniki planetarnej.

---

## Single Sequence Source of Truth Contract

**Status:** ROBOCZY / kontrakt techniczny do synchronizacji docs↔runtime.

### Canonical expected behavior (wg CARDS/UI)
- Dla sekwencji aktywne źródło prawdy runtime ma być pojedyncze.
- Sekwencja działa w modelu 3-hit (DIR → OPEN → CLOSE) dla każdego kroku.
- Przerwanie przez obcy kolor nie jest „martwym resetem”: to samo trafienie staje się hit1 nowego kierunku.

### Observed runtime behavior (HEAD 2026-04-25)
- Aktywnym źródłem prawdy sekwencji jest **`CardEngine.state.sequence`** (`cards.js`).
- Pola świata pełnią rolę pochodną (derived runtime state), głównie dla HUD/UI:
  - `World.sequencePulseColors`,
  - `World.sequenceFlashColors`,
  - `World.pendingCard`,
  - `World.pendingCardUntilMs`,
  - `World.r1HudPulse` (legacy HUD pulse sygnałowy).
- Event timeline do walidacji zachowania pochodzi z `events_jsonl` (nie z final snapshotu).

### Sequence evidence status (HEAD 2026-04-26)
- A-loop (`R1 -> AA -> AAA -> DS -> IDLE`) potwierdzony: testy automatyczne + live evidence PASS.
- Decision window matrix (left/right/timeout + click-after-TTL dla R1/R2/R3/R4/AA) potwierdzona testowo i audytowo.
- Core sequence engine obsługuje R-track i A-loop zgodnie z kontraktami technicznymi.

### Known stubs / gaps
- `onRunActivateR2` pozostaje stubem (brak gotowej aktywacji runtime).
- PRG toggle/runtime binding pozostaje PARTIAL/MISMATCH.
- Economy chain multipliers pozostają PARTIAL/MISMATCH (osobny patch mechaniki poza fazą docs-only).

## 1. Globalny model RUN (init → update → render → reset)

### 1.1 Inicjalizacja świata (RUN start)
**Źródła:** `index.html`, `game.boot.js`

1) Ładowanie skryptów (kolejność w `index.html`):
- `hc.public_path.js` → `hc.card_assets.js` → `hc.asset_loader.js` → `hc.save_system.js` → `hc.submeta_settings.js` → `hc.debug.js` → `hc.visual_assets.js` → `hc.frame_composer.js` → `hc.card_visuals.js` → `hc.submeta_layout.js` → `hc.submeta_png.js` → `hc.submeta_placeholders.js` → `hc.submeta_panels.js` → `hc.prg_frame_probe.js` → `cards.js` → `hc.hud_v2.js` → `hc.hud_top_layout.js` → `hc.core.js` → `hc.util.js` → `hc.world.js` → `hc.space_bodies.js` → `hc.impact.js` → `hc.view_input.js` → `hc.camera.js` → `hc.comets.js` → `hc.meteors.js` → `hc.render.js` → `hc.harmonic_dust.js` → `hc.collisions.js` → `hc.asteroids.js` → `hc.planets.js` → `hc.stars_epoch.js` → `hc.world_render_snapshot.js` → `hc.three_module_bridge.js` → `hc.world_renderer.js` → `hc.ui_debug.js` → `game.boot.js`.

2) Boot (IIFE w `game.boot.js`):
- Tworzy `canvas/ctx`, `View`, `Input`, `Camera` oraz helpery globalne (`rand`, `clamp`, `screenToWorld`, `getWorldViewBounds`, itp.).
- Tworzy obiekt `World` (listy obiektów + parametry) i eksportuje go globalnie.
- Próbuje `CardEngine.bindWorld(World)` (gdy `CardEngine` już istnieje).
- Uruchamia moduły świata przez `HC.init*` (jeśli nie zainicjalizowane): `Stars`, `Planets`, `Comets`, `Meteors`, `Render`, `Asteroids`, `Collisions`.
- Inicjuje UI (`HC.UI.init()`), a następnie wywołuje `resetWorld()`.

3) Wrap reset w `hc.world.js` (po `load`):
- Nadpisuje `resetWorld` tak, aby po bazowym resecie ustawić:
  - multiplikatory orbit (`metaOrbitMul*`),
  - stan slotów/forma (`resetFormaEffectState`),
  - wyczyścić `cardsPool`/`pending` i przeliczyć `totalCards`.

### 1.2 Pętla update (kolejność wywołań)
**Źródło:** `game.boot.js::update(dt, nowMs)`

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
**Źródło:** `game.boot.js::frame(now)`

- `HC.Render.frame(now, dt)` rysuje świat.
- `HC.UI.update(dt, now)`:
  - FPS + HUD RP + slider MPS.
  - `CardEngine.render(ctx, view.w, view.h)` (HUD kart + SUB-META).

**Notka migracyjna (Three adapter):**
- Historycznie `HC.Render.frame` rysuje world na `canvas2d`.
- Nowy adapter świata może przejąć world rendering w trybie `three`, bez zmiany pętli update.
- `HC.UI.update` i `CardEngine.render` pozostają po renderze świata jako warstwa overlay UI.
- Mechanika update loop i kolejność systemów pozostają bez zmian.

### 1.4 Reset RUN (HARD RESET)
**Źródło:** `game.boot.js::resetWorld()` + wrapper w `hc.world.js`

- Czyści listy obiektów (meteory/asteroidy/planety/gwiazdy/komety).
- Resetuje parametry runu (`epoch*`, `score`, `spawnTimer`, `color streak`, `flags`, `metaSlots`, `paused`, itd.).
- Resetuje R1/R2 stany oraz bank kart (`cardBank` → zera).
- Czyści timery runu i efekty slotów (`RunTimers.reset`, `resetFormaEffectState`).
- Resetuje `CardEngine` (`resetForNewRun`) i czyści `cardsPool`/`pending`.

---

## 2. Global State Map (stan i zasoby)

### 2.1 World (globalny stan runtime)
**Listy obiektów:**
- `World.meteors[]`, `World.asteroids[]`, `World.moons[]`, `World.planets[]`, `World.stars[]`, `World.comets[]`.
- Patch A/A2 space state: `World.harmonicDust[]`, `World.harmonicDustReservoir`, `World.harmonicDustDeposits`, `World.impactFragments[]`.

**Flagi/stan runu:**
- `World.flags.firstPlanetZoomed`, `World.flags.firstStarZoomed`.
- `World.epoch`, `World.epochTriggered`, `World.epochAt`.
- `World.score` (RP).
- `World.paused` (zamyka update przez `dtWorld = 0`).

**Sekwencja runtime (single source of truth + pola pochodne):**
- **Canonical runtime SoT:** `CardEngine.state.sequence` (w `cards.js`).
- Pochodne pola świata (derived): `World.sequencePulseColors`, `World.sequenceFlashColors`, `World.pendingCard`, `World.pendingCardUntilMs`, `World.r1HudPulse`.
- Historyczne/legacy inicjalizowane przy resecie: `World.r1Seq`, `World.r2Seq` (nie są aktywnym SoT sekwencji).

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
- `state.engineStats` (mnożniki PRG/pointer) → używane w `hc.meteors.js`.
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

### 3.1 `hc.world.js` — WorldEvents + Timery + Sloty
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

### 3.2 `hc.meteors.js` — Meteory
**STATE:**
- `World.meteors[]`.

**PARAMS:**
- Spawny: `World.spawnInterval`, `World.spawnIntervalMul`, `World.maxMeteors`.
- Bazowa wielkość: `METEOR_BASE_SCALE = 2` / `World.meteorBaseScale`; `meteorBaseRadius()` zawiera ten mnożnik już przy spawnie.
- PRG: `World.pointerRadius`, `World.pointerStrength`, `World.pointerGlueDamp`.
- CardEngine: `engineStats.pointer_*`, `engineStats.meteor_mouse_control`.

**Funkcje kluczowe:**
- `spawnMeteor` i `spawnStreamMeteor`.
- `getMeteorCollisionRadius(meteor)` i `getMeteorRenderScale(meteor)` są wspólnym kontraktem efektywnego rozmiaru: Canvas2D fallback, Three snapshot/render oraz kolizje nie powinny powielać lokalnych wzorów promienia meteoru.
- `updateMeteors(dt, nowMs)`:
  - spawn zwykły i strumieniowy (tylko gdy `epoch=STAR` i `meteorStreams.enabled`),
  - filtruje kolor na bazie `RunTimers.isColorDisabled` i `fxSilenceOnlyColors*`,
  - PRG (ciągnięcie meteorów kursorem).

**Eventy:**
- Emituje: `METEOR_SPAWNED`.

---

### 3.3 `hc.collisions.js` — Kolizje meteorów + R1
**STATE:**
- `World.r1 = { color, streak }` (runtime sekwencji R1).

**PARAMS:**
- `World.meteorCollisionFudge` — drobna tolerancja kontaktu; nie jest źródłem bazowego powiększenia meteorów.
- Kolizje meteor–meteor liczą kontakt jako suma `getMeteorCollisionRadius(...)` obu meteorów, więc bazowy mnożnik 2× rośnie razem z fizycznym promieniem.

**Funkcje kluczowe:**
- `resolveMeteorCollisionsSafe()`:
  - ten sam kolor → `addScore(1)`, emit `METEOR_SAME_COLOR_COLLISION` + `handleR1SameColorCollision`.
  - różny kolor → `spawnAsteroidFromCollision`, emit `METEOR_DIFF_COLOR_COLLISION`.
- `handleR1SameColorCollision(colorName)`:
  - 2x ten sam kolor → emit `R1_OPEN`.
  - 3x ten sam kolor → emit `R1_SUCCESS` i reset stanu.
  - zmiana koloru po streak==2 → `addScore(3)` + emit `R1_FAIL`.

---


### 3.3A `hc.space_bodies.js` / `hc.impact.js` / `hc.harmonic_dust.js` — Space foundation po Patch A2

**STATE / helpers:**
- `HC.SpaceBodies` dostarcza wspólny kontrakt masy, promienia, rodzaju ciała, direct impact i future `orbitState`; Patch D1 dodaje side-effect-free helper klasyfikacji pól body contract (`classifyBodyField`, `classifyBodyFields`, `getBodyContractFields`) do audytu/testów/refaktorów bez zmiany runtime flow.
- `HC.Impact` jest foundation helperem: `splitMass`, `resolvePlanetImpact`, `resolveMoonImpact`, `spawnEjecta`, `updateFragments`.
- Patch C1: `resolvePlanetImpact` jest jedyną aktualną live ścieżką dla bezpośredniego kontaktu meteor/asteroida → planeta w `captureMeteorsByPlanets` i `captureAsteroidsByPlanets`. Legacy planet capture przez `orbitPx` / `gravityR` / `capR` / `orbiters` został fizycznie usunięty z live path.
- `resolveMoonImpact` jest częściowo live dla direct moon absorption w `hc.asteroids.js`; moon dostaje tylko masę wchłoniętą z impact split, a `moonImpactDust` pozostaje deskryptorem/evidence, nie fizycznym `harmonicDust`.
- `World.impactFragments[]` przechowuje lekkie descriptor fragments z TTL; `HC.Impact.updateFragments(World, nowMs, dt)` usuwa wygasłe wpisy.
- `hc.harmonic_dust.js` obsługuje same-color meteor collision dust jako jedyny zbieralny kolorowy pył: `harmonicDust` / chmura po harmonicznym zderzeniu meteorów tego samego koloru.
- Docelowy model collection to ręcznie przez PRG; obecny auto/test collection jest tymczasowy i nie jest target runtime.
- HUD reservoir / `GRAY/mixed reservoir` jest stanem zasobnika po pomieszaniu kolorów, nie `cosmic dust`.
- `hc.harmonic_dust.js` utrzymuje reservoir `10/20/50`, mixed `GRAY` i `World.harmonicDustDeposits`.
- `cosmic dust` / future fizyczny `dustCloud` jest niezbieralnym systemem świata i **nie istnieje jeszcze jako runtime**.

**Free progression:**
- Aktywny wolny łańcuch progresji to `meteor → asteroid → moon → rocky_planet`.
- Moon z wolnej asteroidy dostaje pola `progressionMode: "free"`, `isOrbitalBody: false`, `canBecomePlanet: true`, `parentPlanetId: null`, `orbitState: null`.
- Guard moon → rocky planet blokuje przyszłe orbital moon przez `canBecomePlanet === false`, `progressionMode === "orbital"`, `isOrbitalBody === true`, `parentPlanetId`, `parentKind` lub `parentRef`.
- Orbital moon STOP jest zabezpieczonym kontraktem runtime, ale orbital moon creation nadal nie istnieje.

---

**Comets sync:** basic/neutral comet / Kometa podstawowa is deprecated, legacy idea and not target runtime; target model has only four comet types and should wait for dust/orbit/state foundations.

### 3.4 `hc.asteroids.js` — Asteroidy
**STATE:**
- `World.asteroids[]` + per-asteroid material body fields: `r`, `baseR` / `massOneRadius`, liniowe `mass`, `absorbedMeteorCount`, `growthLevel`, `growth*`, `sourceColors`, `isCollapsing`.
- Legacy `orbiters` / `capture*` / `live*` fields may still exist for compatibility, but are not an active asteroid-orbit system.

**PARAMS:**
- `World.asteroidDriftMul`, `World.asteroidGrowthTarget ?? World.planetCaptureTarget` jako próg masy asteroidy do planety.
- Asteroids do **not** use `captureRadius`, `orbitRadius`, `gravityRadius`, `orbitPx` or `World.metaOrbitMulAsteroid` for meteor capture.

**Funkcje kluczowe:**
- `spawnAsteroidFromCollision(a, b)` (kolizje dwóch meteorów różnych kolorów nadal tworzą asteroidę `mass = 1`).
- `captureMeteorsByAsteroids(dt, nowMs)`:
  - nazwa pozostaje wrapperem kompatybilności dla boot order,
  - nie przechwytuje meteorów na orbitę i nie tworzy asteroidowych orbiterów,
  - rozwiązuje bezpośredni kontakt meteor–asteroida przez `resolveMeteorAsteroidContacts`.
- `absorbMeteorIntoAsteroid(a, m)` zwiększa `absorbedMeteorCount`, liniową masę o `+1` i realny promień bryły asteroidy.
- `resolveAsteroidAsteroidContacts()` rozwiązuje bezpośrednie kolizje bryła–bryła między asteroidami; scalona asteroida ma `newMass = massA + massB`, pozycję środka masy i prędkość ważoną masą.
- Skala/promień wizualny asteroidy wynika z masy łagodnie (`baseR * sqrt(mass)`), więc masa logiczna pozostaje addytywna, ale wzrost obrazu nie jest agresywny.
- `startAsteroidCollapse` → `finishCollapseToPlanet` (legacy gas/rocky path), a wolna progresja Patch A używa także `asteroid.mass >= World.spaceMechanics.asteroidToMoonMassThreshold` do `transformAsteroidToMoon`.
- `resolveMoonDirectAbsorptions()` obsługuje direct meteor/asteroid → moon przez `HC.Impact.resolveMoonImpact` jeśli moduł istnieje, aktualizuje `moon.lastImpact`, promień i próg moon → rocky planet.

**Zasada orbitalna:**
- Aktywny promień orbitalny/grawitacyjny pozostaje tylko dla planet i gwiazd.
- Asteroida jest ciałem materialnym rosnącym przez kontakt meteor–asteroida oraz scalanie asteroid–asteroid, bez rysowanego ringa i bez asteroidowego przechwytywania.

---

### 3.5 `hc.planets.js` — Planety
**STATE:**
- `World.planets[]`, per-planet `rings`, `preStar`, `rocky*`, `captureCooldown` oraz aktywne pola promienia orbity/progresji (`orbitNativeRadius`, `orbitCurrentRadius`, `orbitPx`, `gravityR`). `orbitPx` i `gravityR` nie są już zasięgiem planet capture; pozostają potrzebne dla spawn/finalize, render/snapshot oraz progresji star/rocky spin.
- Nowo tworzone planety nie inicjalizują już legacy capture pól `orbiters`, `captureCount`, `captureSumR`, `captureSumMass` ani `captureColorCounts`.
- `World.spaceMechanics` nie dopuszcza runtime trybów planet capture. `planetCaptureMode`, `legacy_capture` i `hybrid_debug` nie są aktywnym kontraktem gry po Patch C2.

**PARAMS:**
- `STAR_REQ_*`, `starDominancePctBase`, `STAR_RARE_MONO_MIN`, `PRESTAR_DURATION_*`.
- `ROCKY_*`, `GAS_GRAVITY_CONTACT_EPS`, `PLANET_*`.

**Funkcje kluczowe:**
- `captureMeteorsByPlanets` i `captureAsteroidsByPlanets` uruchamiają tylko direct `HC.Impact.resolvePlanetImpact` dla fizycznego kontaktu z planetą. Non-direct meteor/asteroida znajdująca się w dawnym zasięgu `capR` / `orbitPx` nie jest przechwytywana jako planetarny orbiter.
- Blokada koloru `pack01ReleaseBlockColor` nadal poprzedza meteor impact.
- `transformGasPlanetIntoStar` (przejście do gwiazdy).
- `resolvePlanetImpact` z `HC.Impact` jest jedyną aktualną mechaniką planet impact/capture. Po direct impact obiekt jest zużywany i usuwany, więc nie może stać się legacy orbiterem w tym samym przebiegu.
- Planet rotation/orbit axis consistency jest future contract: planety po utworzeniu są positionally stationary, mogą rotować, a future debug powinien dostać `orbitPlaneAngleRange`; elliptical front/back orbit pozostaje future pass.

**Audit C2 — cleanup compatibility/deprecated po legacy planet capture:**
- Bloki `LEGACY_PLANET_CAPTURE_START/END`, helper `addOrbiterToPlanet`, planetarny `bounceMeteorFromBody` oraz nieużywane helpery systemu orbitowego planet zostały usunięte z `hc.planets.js`; legacy capture nie istnieje jako importowana/wykonywalna ścieżka gry.
- `legacy_capture`, `hybrid_debug` i `planetCaptureMode` nie są dopuszczonymi runtime mode.
- Nowe planety z asteroid collapse i debug seed nie dostają już `orbiters` ani statystyk `captureCount` / `captureSumR` / `captureSumMass` / `captureColorCounts`. Testy oczekują braku tych pól na nowych planetach.
- Zachowane compatibility/deprecated odczyty `planet.orbiters` obsługują wyłącznie stare/debugowe stany dla renderu, comet ring marks i historycznej pre-star analizy; live planet impact C2 nie tworzy nowych planetarnych orbiterów.
- `parentKind === "planet"` w `captureAsteroidsByPlanets` jest tylko transitional stale-state guardem. Live runtime C2 nie ustawia nowego `parentKind: "planet"`, `parentRef`, `orbitR`, `theta` ani `omega` dla planet capture.
- `orbitPx` i `gravityR` pozostają na nowych planetach jako pola promienia orbity/grawitacji dla finalize/spawn, snapshot/render i star/rocky progression; nie są używane do non-direct capture i nie tworzą `capR`.
- Dokumentacja starego systemu pozostaje w `docs/legacy/technical/LEGACY_PLANET_CAPTURE.md`; nie jest source-of-truth dla bieżącego runtime.
- Następny etap: zaprojektować spójny future kontrakt planet/moon/star orbit/impact dla Canvas2D i Three.js bez reaktywowania legacy range capture.
- `Events.on("PLANET_CREATED")` → otwarcie SUB-META (`World.subMetaOpen`, `World.paused`).

---

### 3.6 `hc.comets.js` — Komety
**STATE:**
- `World.comets[]`, `Comets.CONFIG`, `spawnState`, `event`.

**PARAMS:**
- `Comets.CONFIG.spawn.*`, `Comets.CONFIG.types`, `Comets.CONFIG.tail.*`.

**Funkcje kluczowe:**
- `update(dt, nowMs)` — spawn/motion/kolizje.
- Obsługa eventu `COMET_SHOWER` (przyspieszony spawn tymczasowy).

---

### 3.7 `hc.stars_epoch.js` — Gwiazdy + epoka
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

### 3.8 `hc.render.js` — Render
**STATE:**
- Brak stanu świata (odczyt `World/Camera/View`).

**PARAMS:**
- Wyłącznie parametry wizualne (kolory, alfy, style).

**Funkcje kluczowe:**
- `HC.Render.frame(now, dt)` — rysuje tło, meteory, asteroidy, planety, gwiazdy, pierścienie itp.
- Pozostaje pełną ścieżką `canvas2d` i fallbackiem dla adaptera świata.

### 3.8a `hc.world_render_snapshot.js` + `hc.world_renderer.js` — World rendering adapter
**STATE:**
- `HC.WorldRenderer` utrzymuje tylko stan prezentacyjny adaptera: tryb `canvas2d|three`, osobny canvas Three, scene/camera/renderer, cache meshów meteorów i asteroidów, cache GLB template per URL oraz cache tekstur meteorów.
- `HC.WorldRenderSnapshot.build(...)` tworzy read-only snapshot prezentacyjny na bazie `World/Camera/View`; nie mutuje świata.
- Meteor GLB visual state jest per wrapper: stabilny wariant GLB, rotacja XYZ, prędkość rotacji oraz losowy przydział zewnętrznej tekstury/emissiveMap są przypisywane raz na visual lifetime.

**Funkcje kluczowe:**
- `HC.WorldRenderSnapshot.build({ World, Camera, View, ... })` mapuje kolekcje świata do `renderSnapshot.world.*`, w tym `meteors[]`, `asteroids[]`, `moons[]`, `impactFragments[]`, `harmonicDust[]`, `harmonicDustReservoir` i `harmonicDustDeposits` z minimalnymi polami renderowymi/evidence.
- `HC.WorldRenderer.render(renderSnapshot, now, dt)` wybiera `canvas2d` fallback albo `three`.
- W trybie `three` adapter renderuje meteory i asteroidy wyłącznie ze snapshotu; planety/gwiazdy/PRG pozostają poza Three. Meteory pobierają efektywny rozmiar przez `getMeteorRenderScale(...)`, który jest sprzężony z `getMeteorCollisionRadius(...)` i bazowym `meteorBaseScale = 2`.
- GLB pass ładuje aktywne pule `public/glb/` przez `publicAssetPath` / `publicPath`, pokazuje fallback visual podczas `loading`/`failed` i zachowuje Canvas2D jako fallback renderer/overlay. GLB meteory i asteroidy ładują się przez lokalny `GLTFLoader`; custom parser nie jest aktywną ścieżką runtime.
- GLB cache ma lifecycle `loading` / `ready` / `failed`, przechowuje template per URL i klonuje go na instancje runtime. Po naprawie pipeline materiały GLB pozostają PBR/`MeshStandardMaterial`; `MeshBasicMaterial` nie jest fallbackiem dla obiektów, które mają reagować na światło.
- Zewnętrzne PNG palety meteorów (`red`, `yellow`) są ładowane osobno przez `THREE.TextureLoader`, cache’owane i losowane stabilnie per instancja dla slotów `map` oraz `emissiveMap`. `green`/`blue` nie mają jeszcze palet i brak palety nie jest błędem.
- Runtime nie nadpisuje imported GLB materials: zewnętrzne PNG uzupełniają tylko brakujące sloty; istniejące `material.map` lub `material.emissiveMap` z obrazem pozostają nietknięte.
- Live debug scale meteorów GLB ma zakres `0.25`–`4.0`, działa bez reloadu i jest oznaczony jako visual-only: nie zmienia promienia logicznego, kolizji, spawnu, kart, RP, HUD ani SUB-META; nie wolno traktować go jako gameplay collision scale bez równoległej aktualizacji fizyki.
- Diagnostics raportują tryb/fallback, stan lokalnego Three ESM bridge, liczniki `GLTFLoader` (`gltfLoaderAvailable`, `gltfLoaderType`, request/success/error/timeout, pending/failed/timedOut URLs), cache GLB (`meteorGlbCacheStats`, `asteroidGlbCacheStats`), aktywne instancje/fallbacki (`activeMeteorGlbInstances`, `activeAsteroidGlbInstances`, `activeFallbackMeteorVisuals`, `activeFallbackAsteroidVisuals`), stan PBR/material debug oraz texture evidence (`meteorTexturePaletteEnabled`, `redMeteorTexturePaletteEnabled`, `yellowMeteorTexturePaletteEnabled`, `meteorTextureCacheStats`, `meteorTextureEvidence.*`, skip counters dla imported map/emissiveMap).

---

### 3.9 `hc.ui_debug.js` — HUD RP + UI
**STATE:**
- `scoreLabel`, `mpsUI` (slider), `btnRestart`, `btnSubMeta`.

**PARAMS:**
- MPS slider → `World.spawnInterval`.

**Funkcje kluczowe:**
- `addScore(points)` — jedyny globalny licznik RP (używany w kolizjach R1).
- `HC.UI.init()` — buduje top bar + podpina kliknięcia.
- `HC.UI.update(dt, now)` — aktualizuje FPS, RP i wywołuje `CardEngine.render`.

---

### 3.10 `cards.js` — CardEngine + SUB-META
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
- `hc.collisions.js::handleR1SameColorCollision` emituje `R1_SUCCESS` po 3 kolizjach tego samego koloru.
- `cards.js` nasłuchuje `R1_SUCCESS` i wywołuje `onCardCollected({ kind: "R1", tier: "DR", colorA })`.

### 4.2 Gdzie powstaje pending 3s
- `cards.js::onCardCollected` ustawia:
  - `World.pendingCard = <R1 entity>`,
  - `World.pendingCardUntilMs = now + 3000`.
- Jeśli inna karta wpada w trakcie, poprzednia pending jest natychmiast dodawana do `cardsPool`.

### 4.3 Aktywacja (klik) i skutki
- `cards.js::handlePointerDown`:
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
- `hc.ui_debug.js::addScore` modyfikuje `World.score`.
- Wywołania:
  - `hc.collisions.js`: +1 za kolizję tego samego koloru.
  - `hc.collisions.js`: +3 za „fail” R1 (zmiana koloru po streak==2).

### 4.6 HUD kart (DR + timery)
- `cards.js::renderPack01Collection`:
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
- `hc.planets.js`: `Events.on("PLANET_CREATED")` → `World.subMetaOpen = true`, `World.paused = true`.
- UI: `btnSubMeta` w `hc.ui_debug.js` otwiera overlay ręcznie.

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

## 7. Open Gaps / Rozjazdy / TODO (DO WERYFIKACJI)

1) **`World.r1Seq` / `World.r2Seq`**
   - Pola resetowane w `resetWorld`, ale nieużywane w logice.
   - Aktualny stan R1 jest w `World.r1` (moduł `hc.collisions.js`).

2) **`pack01ReleaseBlockColor`**
   - Używane w `hc.asteroids.js` do blokowania direct-contact absorpcji oraz w `hc.planets.js` do blokowania przechwytu meteorów,
   - brak miejsca w kodzie, które ustawia `pack01ReleaseBlockColor`/`UntilMs`.

3) **RunTimers vs spawn kolorów**
   - `RunTimers.isColorDisabled` blokuje kolor w spawnie.
   - Aktywacja R1 uruchamia `runColorTimers` dla tego koloru, więc efekt w praktyce „wyłącza” ten kolor w spawnie (może być sprzeczne z intencją aktywacji).

4) **R2 runtime activation effects**
   - `onRunActivateR2` pozostaje stubem i nie realizuje docelowych efektów RUN (gap pozostaje poza etapem sequence core docs sync).

5) **EffectTimers**
   - System `EffectTimers` istnieje w `hc.world.js`, ale nie jest używany w runtime.

6) **SUB-META aktywacja**
   - Layout zawiera `activateButton`, ale brak render/click logic dla aktywacji z SUB-META.

7) **CardEngine offers vs R1**
   - `CARD_DEFS` i system ofert/rituali istnieją, ale nie są sprzężone z sekwencją R1/R2.

8) **Dokumentacja vs kod (PRG/SUB-META/economy)**
   - Gapy dotyczą głównie PRG runtime binding/toggle, ekonomii multiplikatorów oraz części wiązań SUB-META.
   - Sequence core (R-track + A-loop + AAA/DS reset) jest potwierdzony i nie jest już gapem.

---


## 9. World GLB asset routing checkpoint (2026-06-06)

- `hc.asteroids.js` przypisuje nowej asteroidzie `visualKind = "asteroid"`, stabilny `visualVariant` oraz odpowiadający mu `assetId` podczas `spawnAsteroidFromCollision(...)`; dostępne warianty to `asteroid_01.glb`, `asteroid_02.glb` i `asteroid_03.glb`.
- Wzrost przez absorpcję meteoru nie zmienia pól visual. Merge asteroid zachowuje obiekt o większej masie, a przy równych masach pierwszy obiekt pary, więc zachowuje też jego wariant bez ponownego losowania.
- Każda tworzona lub transformowana planeta otrzymuje obecnie stały kontrakt `visualKind = "planet"`, `visualVariant = "planet_01"`, `assetId = "planet_01.glb"`; ten sam bazowy model Three jest tymczasowo używany dla planet skalistych (`planetKind = "rocky"`) i gazowych (`planetKind = "gas"`), bez losowania klas ani wariantów planet.
- `hc.world_render_snapshot.js` przenosi `visualKind`, `visualVariant`, `assetId`, `planetKind`, flagi rocky/gas, pozycję i promień do snapshotu oraz uzupełnia bazowy routing `planet_01` dla starszych planet bez metadanych visual. `hc.world_renderer.js` nie filtruje planet po rocky/gas: odczytuje cały planetarny snapshot, rozwiązuje asset przez `publicAssetPath` / `publicPath`, korzysta ze wspólnego cache template GLB i klonuje instancję dla obiektu.
- Skala asteroid nadal pochodzi z istniejącego promienia zależnego od masy, a skala planet z istniejącego promienia planety. Canvas2D zachowuje dotychczasowy symboliczny fallback.

## Planet visual rotation checkpoint (2026-06-06)

- Każda planeta otrzymuje przy przypisaniu planetarnego visualu stabilny `visualRotationSeed`, pełną orientację startową XYZ oraz spokojne prędkości obrotu zapisane na obiekcie świata. Ponowne wywołanie helpera nie przelosowuje istniejących pól.
- Główna prędkość dotyczy osi Y (`0.03–0.12 rad/s` ze stabilnie wybranym kierunkiem), a osie X/Z mają słabszy drift (`0.005–0.03 rad/s`). Ta sama logika obejmuje planety `rocky` i `gas`, także planetę powstałą z asteroidy.
- `hc.world_render_snapshot.js` propaguje seed, rotację bazową i prędkości do snapshotu. Pass planetarny `hc.world_renderer.js` nie losuje wartości: utrzymuje czas startu stabilnej instancji Three i ustawia rotację grupy jako `base + elapsed * speed`, dzięki czemu obraca się zarówno GLB, jak i prosty fallback.
- Metadane oraz animacja są visual-only: nie zmieniają pozycji, promienia, skali gameplayowej, orbit, grawitacji, kolizji ani mechaniki planet; Canvas2D pozostaje bez zmian.

## 10. GLTFLoader dependency routing and evidence checkpoint (2026-06-06)

- `hc.world_renderer.js` rozwiązuje URL modelu przez `HC.publicAssetPath`, a następnie tworzy dedykowany `THREE.LoadingManager` dla każdego ładowania template GLB.
- `GLTFLoader.resourcePath` wskazuje katalog rozwiązanego URL-u modelu. Manager URL modifier zachowuje URI osadzone/cross-origin, usuwa błędny segment `public/` i dopina Vite/GitHub Pages base do rootowych ścieżek publicznych zależności.
- LoadingManager dostarcza evidence request/complete/error zależności do `HC.WorldRenderer.getDiagnostics()` i zdarzeń `world.glb_dependency_*`; nie zmienia snapshotu, mechaniki ani routingu wariantów asteroid/planet.
- Aktualne `public/glb/*.glb` są self-contained względem obrazów i buforów. Zewnętrzne czerwone/żółte PNG meteorów są nadal ładowane niezależnie przez istniejący cache `TextureLoader`.
