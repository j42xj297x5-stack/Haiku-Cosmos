# Haiku Cosmos — mapa funkcji świata (v2)

> Audyt statyczny funkcji + stanów globalnych dla aktualnej gry (wersja modułowa).
> Zakres: `*.codex.js` (HC moduły + boot) oraz `cards*.js`.

---

## Kanon źródeł (ważne)

- **Źródło prawdy = moduły**: `hc.*.codex.js` + `game.boot.codex.js` + `cards.codex.js`.
- Pliki legacy typu `game.js` / kopie monolitu traktujemy jako **historię** i nie używamy ich w projektowaniu ani implementacji.
- Zmiany projektujemy tak, aby dawały się dopiąć przez stabilne punkty integracji (CardEngine/Targets/World params), bez “grzebania w pętli” bez potrzeby.

---

## Spis treści
1. [Lista modułów / plików](#lista-modułów--plików)
2. [Global State Map](#global-state-map)
3. [Modele danych](#modele-danych)
4. [Lifecycle / Game Loop](#lifecycle--game-loop)
5. [Event / Trigger Map](#event--trigger-map)
6. [Extension Points](#extension-points)
7. [Mapa eventów (emit → konsumuje)](#mapa-eventów-emit--konsumuje)
8. [Mapy funkcji wg modułów](#mapy-funkcji-wg-modułów)
   - [game.boot.codex.js](#gamebootcodexjs)
   - [cards.js / cards.codex.js](#cardsjs--cardscodexjs)
   - [hc.core.codex.js](#hccorecodexjs)
   - [hc.util.codex.js](#hcutcodexjs)
   - [hc.view_input.codex.js](#hcview_inputcodexjs)
   - [hc.camera.codex.js](#hccameracodexjs)
   - [hc.world.codex.js](#hcworldcodexjs)
   - [hc.ui_debug.codex.js](#hcui_debugcodexjs)
   - [hc.meteors.codex.js](#hcmeteorscodexjs)
   - [hc.collisions.codex.js](#hccollisionscodexjs)
   - [hc.asteroids.codex.js](#hcasteroidscodexjs)
   - [hc.planets.codex.js](#hcplanetscodexjs)
   - [hc.comets.codex.js](#hccometscodexjs)
   - [hc.stars_epoch.codex.js](#hcstars_epochcodexjs)
   - [hc.render.codex.js](#hcrendercodexjs)
9. [Indeks funkcji (alfabetyczny)](#indeks-funkcji-alfabetyczny)
10. [Open Questions / Gaps](#open-questions--gaps)

---

## Lista modułów / plików

- **index.codex.html** — loader modułów (kolejność ładowania, canvas, UI root).
- **game.boot.codex.js** — bootstrap świata + pętla gry (`frame/update/resetWorld`), wiązanie modułów HC i CardEngine.
- **cards.codex.js** *(+ `cards.js` jako stage/legacy)* — CardEngine: oferty, okno decyzji, efekty, rytuały, render UI kart.
- **hc.core.codex.js** — inicjalizacja `HC` + EventBus (`Events.on/emit`) i wspólne “kleje”.
- **hc.util.codex.js** — utilsy (clamp, lerp, hash, RNG).
- **hc.view_input.codex.js** — canvas/DPR/resize + input pointer (screen ↔ canvas coords).
- **hc.camera.codex.js** — kamera: screen/world, zoom epok, bounds.
- **hc.world.codex.js** — holder `World` + parametry symulacji.
- **hc.ui_debug.codex.js** — UI debug (FPS/score, suwak MPS).
- **hc.meteors.codex.js** — spawner + ruch meteorów + rysowanie.
- **hc.collisions.codex.js** — kolizje meteorów + rezonans/punkty.
- **hc.asteroids.codex.js** — asteroidy: spawn, orbiters, kolaps → planeta.
- **hc.planets.codex.js** — planety: capture, ringi, rocky params, gazowe → gwiazdy.
- **hc.comets.codex.js** — komety: spawner, kolizje, fragmenty, ringi.
- **hc.stars_epoch.codex.js** — epoka gwiazd: przechwyty + “systemy” gwiazd.
- **hc.render.codex.js** — render świata + delegacje do rysowania obiektów.

---

## Global State Map
**Główne obiekty i role:**
- **`World`**: centralny stan symulacji.
  - Listy: `meteors[]`, `asteroids[]`, `planets[]`, `comets[]`, `stars[]`.
  - Parametry sterujące: `spawnInterval`, `spawnIntervalMul`, `maxMeteors`, `pointerRadius`, `pointerStrength`, `pointerGlueDamp`, `meteorCollisionFudge`, `asteroidDriftMul`, `planetCaptureTarget`, progi gwiazd (`STAR_*`), parametry planet skalistych (`ROCKY_*`), wizualne planet (`PLANET_*`).
  - Flagi epok: `epoch`, `epochTriggered`, `epochAt`, `meteorStreams`.
  - Statystyki: `score`, `nowMs`.
- **`Camera`**: zoom i ease + stan zoomu epoki (`epochZoom`).
- **`View`**: rozmiar canvasa, skala świata (`worldScale`), `dpr`.
- **`Input`**: pozycja kursora w ekranie i świecie (`x/y` + `wx/wy`), `pointerDown`.
- **`CardEngine`**: stan kart (hand, queue, cooldowns, timed effects, `engineStats`, targety).
- **`Events`**: globalny EventBus (`on`, `emit`).
- **`HC`**: namespace modułów (Meteors/Comets/Asteroids/Planets/Stars/Render/UI/Camera/...)

---

## Modele danych

> To jest **model koncepcyjny** (ułatwia projektowanie kart/targetów). Pola mogą mieć dokładniejsze nazwy w kodzie — w razie różnic kod wygrywa.

### Meteor
- `id`
- `x, y, vx, vy`
- `r` (radius), `mass` (jeśli wyliczana), `colorKey` / `hue`
- stan: `alive`/`dead`, `isOrbiter`, `orbiterOf` (id/refs)

### Asteroid
- `id`
- `x, y, vx, vy`
- `r`, `mass`
- `orbitRpx` / `gravityR` (promień “zasięgu”)
- `orbiters[]` (meteory/asteroidy w systemie)
- kolaps: `isCollapsing`, `collapseT`, `collapseStartedAt`

### Planet
- `id`
- `x, y`
- `r`, `mass`, `gravityR` / `orbitRpx`
- typ: `isRocky` / `isGasGiant` (lub wyliczany z wag kolorów)
- `rings[]` (ślady po kometach / break ring)
- parametry powierzchni: `rockySurface` / patchwork blobów
- (w przyszłości) cooldown capture: `captureCooldownUntilMs`

### Comet
- `id`
- `x, y, vx, vy`
- `r`, `mass`
- `trail[]` / ślady, `fragments[]` (jeśli rozbijanie)
- sterowanie: “deflection” po impakcie, `lastImpactAt`

### Star
- `id`
- `x, y`
- `r`, `mass`
- `kind` / `colorKey`, `sizeClass`
- system: listy ciał “podpiętych” (planety/asteroidy) lub indeksy/refs
- proces narodzin: `birthT`, `isPreStar` / flagi pulsacji

---

## Lifecycle / Game Loop
1. **Boot** (`game.boot.codex.js`): tworzy `World`, `View`, `Camera`, `Input`, helpery; inicjuje moduły HC; wiąże CardEngine; startuje `frame()`.
2. **Frame loop** (`frame(now)`):
   - oblicza `dt`
   - wywołuje `update(dt, now)`
   - rysuje (`HC.Render.frame`)
   - aktualizuje UI debug (`HC.UI.update`)
3. **Update** (`update(dt, nowMs)`):
   - `Camera.update(dt)`
   - `HC.Meteors.update(dt)`
   - `HC.Comets.update(dt)`
   - `HC.Collisions.resolve(dt)`
   - `HC.Asteroids.capture/update(dt)`
   - `HC.Planets.capture/update(dt)`
   - `HC.Stars.update(dt)`
   - `CardEngine.update(dt, nowMs)`
4. **Render**: tło → obiekty → ring kursora → UI kart.
5. **Reset** (`resetWorld()`): reset list/flag, `CardEngine.resetForNewRun`.

---

## Event / Trigger Map
**Źródła triggerów:**
- **Input**: pointer down/up/move → reakcja PRG (pole przyciągania).
- **Kolizje**: meteor-meteor (harmonia), meteor-asteroid, comet-planet/asteroid.
- **Progi**:
  - asteroida powstaje po odpowiedniej harmonii / masie
  - planeta po kolapsie asteroid
  - gwiazda po spełnieniu progów jakości/ilości (gazowa → star)
- **Timery**:
  - spawn meteorów, spawn komet
  - okno decyzji kart (offer)
  - czasowe efekty kart/rytuałów

---

## Extension Points

> Miejsca, gdzie najbezpieczniej dopinać nowe mechaniki (karty/targety/epoki) bez rozjechania pętli gry.

### Karty / Targety / Rytuały
- **`cards.codex.js` → `CardEngine.addTarget(...)` / `bindWorld(World)`**  
  Najczystsze miejsce na “adresy wpływu” (targety) i ich dostęp do parametrów świata.
- **`CardEngine.applyEffects(effects)`**  
  Wspólny kanał modulacji parametrów (`World.*`) w czasie (timery, cooldowny, modyfikatory).
- **`CardEngine.update(dt, now)`**  
  Tick rytuałów, ofert, cooldownów; tu dopinamy “czasowe” stany świata.

### Spawn i tempo świata
- **`HC.Meteors.update(dt)` / spawn funkcje w `hc.meteors.codex.js`**  
  Spawn meteorów, strumienie, kontrola MPS, przyszłe “roje jako wydarzenia”.
- **`HC.Comets.update(dt)`**  
  Deszcze komet / okna zdarzeń kometowych.

### PRG (Player Reaction Field) / sterowanie
- Parametry w `World`: `pointerRadius`, `pointerStrength`, `pointerGlueDamp`  
  Najlepiej modyfikować przez CardEngine (efekty czasowe) zamiast “na sztywno” w input.
- **`hc.view_input.codex.js` + `hc.camera.codex.js`**  
  Gdy zmienia się skala (epoka gwiazd) albo mapping screen↔world.

### Kolizje i rezonans
- **`HC.Collisions.resolve(...)`**  
  Punkt do: harmonii, punktów, triggerów rytuałów, “harmonicznych trafień”, nowych progu/warunków.

### Asteroidy / Planety / Gwiazdy
- **`hc.asteroids.codex.js`**: `capture/update/collapse`  
  Logika przejścia meteory → asteroidy → planeta.
- **`hc.planets.codex.js`**: `capture/update/transform`  
  Tu wpina się: warunki jakościowe dla gazowych, cooldown capture planet, progi gwiazd, pre-gwiazda.
- **`hc.stars_epoch.codex.js`**: `updateStars/updateStarBirths/capture...`  
  Tu wpina się: LOD meteorów, priorytety “uchwytu” na planetoidy, elipsy, systemy gwiazd.

### Render / UI
- **`hc.render.codex.js`**  
  Tylko wizualizacja (rings, halo, pre-gwiazda pulsacja) — bez logiki.
- **`hc.ui_debug.codex.js`**  
  Debug i suwaki (np. MPS); nie powinno zawierać mechanik.

---

## Mapa eventów (emit → konsumuje)

> Eventy są kanałem do “miękkiego” spinania systemów. Jeśli nazwy eventów różnią się w kodzie — traktuj to jako TODO do ujednolicenia.

| Event (roboczo) | Emituje | Konsumuje / Po co |
|---|---|---|
| `METEOR_SPAWNED` | `hc.meteors` | rytuały/targety spawn, statystyki, tutorial haiku |
| `METEOR_COLLISION` | `hc.collisions` | rezonans points, rytuały harmoniczne, karty “za trafienia” |
| `ASTEROID_BORN` | `hc.asteroids` | packi kart za przejścia epok, UI feedback |
| `PLANET_BORN` | `hc.planets` | targety planet (cooldown, stabilna orbita, odłożony zapłon) |
| `PLANET_CAPTURED_ORBITER` | `hc.planets` | “halo trial”, cooldown, quality gating |
| `COMET_SPAWNED` | `hc.comets` | deszcze komet / wydarzenia |
| `COMET_IMPACT` | `hc.comets`/`hc.collisions` | ringi, halo, rytuały “rozpuszczenie” |
| `PRESTAR_STARTED` | `hc.planets`/`hc.stars_epoch` | okno przerwania, karty “Nie teraz” |
| `STAR_BORN` | `hc.planets`/`hc.stars_epoch` | epoka gwiazd, zoom, nowe packi |
| `EPOCH_CHANGED` | `game.boot`/`hc.stars_epoch` | kamera, LOD, UI “przejście” |
| `CARD_OFFERED` | `CardEngine` | UI kolejki kart, statystyki |
| `CARD_USED` | `CardEngine` | applyEffects, rytuały |
| `RITUAL_STARTED/ENDED` | `CardEngine` | UI/haiku/feedback |

---

## Mapy funkcji wg modułów

## game.boot.codex.js
**Kontekst:** boot + loop, helpery świata.

### `clamp(v, a, b)`
- **Sygnatura:** `(v, a, b)`
- **Zwraca:** number.

### `rand(min, max)`
- **Sygnatura:** `(min, max)`
- **Zwraca:** number.

### `meteorBaseRadius()`
- **Sygnatura:** `()`
- **Zwraca:** number.

### `massFromR(r)`
- **Sygnatura:** `(r)`
- **Zwraca:** number.

### `computeOmega(baseOmega, orbitRpx, Rm)`
- **Sygnatura:** `(baseOmega, orbitRpx, Rm)`
- **Zwraca:** omega.

### `getDirectOrbitersOfBody(body)`
- **Sygnatura:** `(body)`
- **Zwraca:** `orbiters[]`.
- **Wejścia:** `World.meteors`, `World.asteroids`.

### `removeOrbitersConsumed(orbiters)`
- **Sygnatura:** `(orbiters)`
- **Efekty:** usuwa obiekty z `World.meteors/asteroids`.

### `update(dt, nowMs)`
- **Sygnatura:** `(dt, nowMs)`
- **Efekty:** update świata.
- **Wejścia:** `HC.*`, `CardEngine`.
- **Callees:** `Camera.update`, `HC.Meteors.update`, `HC.Comets.update`, `HC.Collisions.resolve`, `HC.Asteroids.capture/update`, `HC.Planets.capture/update`, `HC.Stars.update`, `CardEngine.update`.

### `resetWorld()`
- **Sygnatura:** `()`
- **Efekty:** reset list/flag, `CardEngine.resetForNewRun`.

### `frame(now)`
- **Sygnatura:** `(now)`
- **Efekty:** requestAnimationFrame loop.
- **Callees:** `update`, `HC.Render.frame`, `HC.UI.update`.

---

## cards.js / cards.codex.js
**Kontekst:** samodzielny CardEngine (stage 1).

### CardEngine (IIFE)
*(skrót: funkcje duplikowane między legacy buildem a modułami HC nie są rozwijane osobno; patrz sekcja aliasów i mapy modułów)*

- `normalizeCard(raw)` → alias `cards.js::normalizeCard`
- `normalizePack(json)` → alias `cards.js::normalizePack`
- `clampInt(v,a,b)` → alias `cards.js::clampInt`
- `clampNum(v,a,b)` → alias `cards.js::clampNum`
- `clamp01(x)` → alias `cards.js::clamp01`
- `bindWorld(World)` → alias `cards.js::bindWorld`
- `addTarget(id, meta, access)` → alias `cards.js::bindWorld/addTarget`
- `nowMs()` → alias `cards.js::nowMs`
- `isOnCooldown(cardId, t)` → alias `cards.js::isOnCooldown`
- `setCooldown(card)` → alias `cards.js::setCooldown`
- `enqueueOffer(card)` → alias `cards.js::enqueueOffer`
- `resetForNewRun()` → alias `cards.js::resetForNewRun`
- `applyOp(before, op, value)` → alias `cards.js::applyOp`
- `applyEffects(effects)` → alias `cards.js::applyEffects`
- `startRitual(card)` → alias `cards.js::startRitual`
- `useCard(card)` → alias `cards.js::useCard`
- `update(dt, now)` → alias `cards.js::update`
- `getOfferProgress01()` → alias `cards.js::getOfferProgress01`
- `render(ctx, screenW, screenH)` → alias `cards.js::render`
- `handlePointerDown(mx, my, screenW, screenH)` → alias `cards.js::handlePointerDown`

---

## hc.core.codex.js
### `Events.on(eventName, fn)`
- **Sygnatura:** `(eventName, fn)`
- **Zwraca:** unsub fn.
- **Efekty:** zapis do `listeners`.

### `Events.emit(eventName, payload)`
- **Sygnatura:** `(eventName, payload)`
- **Efekty:** wywołuje listenerów.

---

## hc.util.codex.js
### `hash01(n)`
- **Sygnatura:** `(n)`
- **Zwraca:** float 0..1.

### `hash32(str)`
- **Sygnatura:** `(str)`
- **Zwraca:** 32-bit hash.

### `makeRng(seed)`
- **Sygnatura:** `(seed)`
- **Zwraca:** `rand01()`.
- **Lokalne:** `s`.

### `rand01()` *(nested in makeRng)*
- **Sygnatura:** `()`
- **Zwraca:** float 0..1.
- **Efekty:** modyfikuje `s`.

---

## hc.view_input.codex.js
### `getMaxPixelRatio()`
- **Sygnatura:** `()`
- **Zwraca:** number.

### `resizeCanvas()`
- **Sygnatura:** `()`
- **Efekty:** ustawia rozmiary canvasa, DPR.

### `toCanvasCoords(e)`
- **Sygnatura:** `(e)`
- **Zwraca:** `{x,y}`.

---

## hc.camera.codex.js
### `screenToWorld(x, y)`
- **Sygnatura:** `(x, y)`
- **Zwraca:** `{wx, wy}`.

### `getWorldViewBounds()`
- **Sygnatura:** `()`
- **Zwraca:** bounds w world units.

### `Camera.update(dt)`
- **Sygnatura:** `(dt)`
- **Efekty:** easing zoom/epoch.

---

## hc.world.codex.js
*(holder `World` + parametry; funkcje zależne od aktualnej definicji w pliku)*

---

## hc.ui_debug.codex.js
### `setMeteorsPerSec(mps)`
- **Sygnatura:** `(mps)`
- **Efekty:** ustawia MPS.

### `addScore(points)`
- **Sygnatura:** `(points)`
- **Efekty:** `World.score += points`.

---

## hc.meteors.codex.js
*(spawn/update/draw; funkcje wg aktualnej definicji w pliku)*

---

## hc.collisions.codex.js
*(resolve kolizji; harmonijne trafienia; punkty)*

---

## hc.asteroids.codex.js
### `startAsteroidCollapse(a)`
- **Sygnatura:** `(a)`
- **Efekty:** flagi kolapsu.

### `updateAsteroidCollapse(a, dt)`
- **Sygnatura:** `(a, dt)`
- **Efekty:** animacja kolapsu.

### `finishCollapseToPlanet(a)`
- **Sygnatura:** `(a)`
- **Efekty:** tworzy planetę (`World.planets.push`).

### `updateAsteroids(dt)`
- **Sygnatura:** `(dt)`
- **Efekty:** ruch + bounce + kolaps.

---

## hc.planets.codex.js
### `buildColorWeightsFromOrbiters(orbiters)`
- **Sygnatura:** `(orbiters)`
- **Zwraca:** map wag kolorów.

### `buildBlobPatchwork(planetId, weights, blobCount)`
- **Sygnatura:** `(planetId, weights, blobCount)`
- **Zwraca:** patchwork blobów.

### `computeRockyParamsFromOrbiters(orbiters)`
- **Sygnatura:** `(orbiters)`
- **Zwraca:** `{planetR, planetMass, gravityR}`.

### `countSystemOrbitersForRocky(p)`
- **Sygnatura:** `(p)`
- **Zwraca:** count.
- **Nested:** `add(obj)`.

### `add(obj)` *(nested in countSystemOrbitersForRocky)*
- **Sygnatura:** `(obj)`
- **Efekty:** modyfikuje `seenIds/seenObjs`.

### `countOrbitersInBodySystem(o)`
- **Sygnatura:** `(o)`
- **Zwraca:** count.

### `absorbBodiesIntoRocky(p, bodies)`
- **Sygnatura:** `(p, bodies)`
- **Efekty:** zwiększa `p.mass` i `p.r`.

### `getSystemMeteorsForPlanet(p)`
- **Sygnatura:** `(p)`
- **Zwraca:** lista meteorów.
- **Nested:** `addMeteor(m)`.

### `addMeteor(m)` *(nested in getSystemMeteorsForPlanet)*
- **Sygnatura:** `(m)`
- **Efekty:** modyfikuje listy `seenIds/seenObjs`.

### `classifyMeteorColor(m)`
- **Sygnatura:** `(m)`
- **Zwraca:** `"blue"|"green"|"red"|"yellow"|null`.

### `analyzeSystemMeteors(meteors)`
- **Sygnatura:** `(meteors)`
- **Zwraca:** `{total, counts, dominantKey, monoOk, monoColorKey}`.

### `removeSystemMeteorsFromPlanet(p, meteors)`
- **Sygnatura:** `(p, meteors)`
- **Efekty:** usuwa orbitery z systemu.

### `transformGasPlanetIntoStar(p, info, kind)`
- **Sygnatura:** `(p, info, kind)`
- **Efekty:** tworzy gwiazdę, `World.stars.push`.

### `addPlanetRingMark(p, orbiter, nowMs, source)`
- **Sygnatura:** `(p, orbiter, nowMs, source)`
- **Efekty:** `p.rings.push`.

### `addAsteroidBreakRing(p, asteroid, colors, nowMs)`
- **Sygnatura:** `(p, asteroid, colors, nowMs)`
- **Efekty:** `p.rings.push` (break ring).

---

## hc.comets.codex.js
*(spawn/update/impact/fragmenty; wg pliku)*

---

## hc.stars_epoch.codex.js
### `reconcileStarOwnershipOnBirth(oldPlanet, star)`
- **Sygnatura:** `(oldPlanet, star)`
- **Efekty:** przypisuje obiekty do nowej gwiazdy.

### `captureBodiesByStars(dt)`
- **Sygnatura:** `(dt)`
- **Efekty:** przechwyty planet/asteroid.

### `updateStarBirths(dt)`
- **Sygnatura:** `(dt)`
- **Efekty:** animacja narodzin.

### `updateStars(dt)`
- **Sygnatura:** `(dt)`
- **Efekty:** update gwiazd + `sizeClass`.

---

## hc.render.codex.js
### `hashFloat(str)` / `lerp(a,b,t)` / `easeInOutCubic(t)` / `easeOutQuad(t)`
- **Sygnatury:** `(str)` / `(a,b,t)` / `(t)` / `(t)`
- **Zwraca:** number.

### `makePlanetGradient(cx, cy, r, hueA, hueB)`
- **Sygnatura:** `(cx, cy, r, hueA, hueB)`
- **Zwraca:** gradient.

### `drawBackground()`
- **Sygnatura:** `()`
- **Efekty:** rysuje tło.

### `drawRegularPolygon(x, y, r, sides, angleRad)`
- **Sygnatura:** `(x, y, r, sides, angleRad)`
- **Efekty:** path polygon.

### `drawAsteroidOrbiters(a)` / `drawAsteroid(a)`
- **Sygnatury:** `(a)`
- **Efekty:** rysuje asteroidę + orbitery.

### `drawPlanetRings(p, nowMs)`
- **Sygnatura:** `(p, nowMs)`
- **Efekty:** rysuje ringi.

### `drawRockyPatchwork(p, rockySurface, alpha)`
- **Sygnatura:** `(p, rockySurface, alpha)`
- **Efekty:** rysuje patchwork.

### `drawRockyRimAndCracks(p, rocky, alpha)`
- **Sygnatura:** `(p, rocky, alpha)`
- **Efekty:** rysuje obrzeże/rysy.

### `drawRockyPlanet(p, nowMs)`
- **Sygnatura:** `(p, nowMs)`
- **Efekty:** rysuje planetę skalistą.

### `drawStar(s, nowMs)`
- **Sygnatura:** `(s, nowMs)`
- **Efekty:** rysuje gwiazdę.

### `drawPlanetSoftEdgeAndGrain(p, baseHue)`
- **Sygnatura:** `(p, baseHue)`
- **Efekty:** miękka krawędź planet.

### `drawPlanet(p)`
- **Sygnatura:** `(p)`
- **Efekty:** rysuje planetę.

### `drawPlanetOrbiters(p)`
- **Sygnatura:** `(p)`
- **Efekty:** orbitery planety.

### `drawPointerRing()`
- **Sygnatura:** `()`
- **Efekty:** ring kursora.

### `drawMeteor(m)`
- **Sygnatura:** `(m)`
- **Efekty:** deleguje do `HC.Meteors.drawMeteor`.

### `frame()`
- **Sygnatura:** `()`
- **Efekty:** główny render świata + UI kart.

---

## Indeks funkcji (alfabetyczny)
*(pozostaw jak w Twojej wersji; jeśli generujesz automatycznie — to jest OK)*

---

## Open Questions / Gaps
- Źródło prawdy: **moduły**. Pliki legacy nie są częścią workflow.
- Czy `cards.js` jest już w pełni zastąpione przez `cards.codex.js`, czy trzymamy oba do czasu finalnego uporządkowania?
- Ujednolicić nazwy eventów (jeśli EventBus już emituję konkretne stringi — spisać je 1:1).
- Doprecyzować formalny “schema” obiektów (Meteor/Asteroid/Planet/Comet/Star) jeśli chcemy automatycznie walidować targety/effects.
