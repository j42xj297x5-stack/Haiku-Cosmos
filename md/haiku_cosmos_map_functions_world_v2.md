# Haiku Cosmos — mapa funkcji świata (v2)

> Audyt statyczny funkcji + stanów globalnych dla aktualnej gry.
> Zakres: `game*.js`, `cards*.js`, `*.codex.js` oraz moduły: boot/input/render/world/collisions/asteroids/planets/meteors/comets/stars_epoch/camera.

---

## Spis treści (szkic → wypełniony)
1. [Lista modułów / plików](#lista-modułów--plików)
2. [Global State Map](#global-state-map)
3. [Lifecycle / Game Loop](#lifecycle--game-loop)
4. [Event / Trigger Map](#event--trigger-map)
5. [Mapy funkcji wg modułów](#mapy-funkcji-wg-modułów)
   - [game.boot.codex.js](#gamebootcodexjs)
   - [game.js](#gamejs-monolit)
   - [game.monolith.backup.codex.js](#gamemonolithbackupcodexjs)
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
6. [Indeks funkcji (alfabetyczny)](#indeks-funkcji-alfabetyczny)
7. [Open Questions / Gaps](#open-questions--gaps)

---

## Lista modułów / plików
- **game.boot.codex.js** — bootstrap świata, globalne helpery + pętla gry (moduły HC).
- **game.js** — monolityczny build: EventBus, CardEngine, world/update/render/comets/asteroids/planets.
- **game.monolith.backup.codex.js** — kopia monolitu (historyczna).
- **cards.js / cards.codex.js** — niezależny CardEngine (wersja „stage 1”).
- **hc.core.codex.js** — inicjalizacja `HC` + EventBus.
- **hc.util.codex.js** — utilsy (clamp, lerp, hash, RNG).
- **hc.view_input.codex.js** — widok + input (DPR, pointer).
- **hc.camera.codex.js** — kamera + transformy (screen/world).
- **hc.world.codex.js** — holder `World`.
- **hc.ui_debug.codex.js** — UI debug (score/FPS, slider MPS).
- **hc.meteors.codex.js** — spawner + ruch meteorów + rysowanie.
- **hc.collisions.codex.js** — kolizje meteorów.
- **hc.asteroids.codex.js** — asteroidy: spawn, orbiter, kolaps.
- **hc.planets.codex.js** — planety: capture, skalowanie, transformacje → gwiazdy.
- **hc.comets.codex.js** — komety: spawner, kolizje, fragmenty, efekty.
- **hc.stars_epoch.codex.js** — epoka gwiazd, przechwyty do systemu gwiazd.
- **hc.render.codex.js** — render świata + UI kart.

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

## Lifecycle / Game Loop
1. **Boot** (`game.boot.codex.js`): tworzy `World`, `View`, `Camera`, `Input`, helpery; inicjuje moduły HC; wiąże CardEngine; startuje `frame()`.
2. **Frame loop** (`frame(now)`):
   - oblicza `dt`
   - wywołuje `update(dt, now)`
   - rysuje (`HC.Render.frame`)
   - aktualizuje UI debug (`HC.UI.update`)
3. **Update** (kolejność):
   - `Camera.update` (zoom easing + epoch zoom)
   - mapowanie inputu na świat (`screenToWorld` → `Input.wx/wy`)
   - triggery epok (pierwsza planeta → zoom, gwiazdy → epoch)
   - `HC.Meteors.update`
   - `HC.Comets.update` (spawn + kolizje komet)
   - `HC.Collisions.resolve` (meteor–meteor)
   - `HC.Asteroids.capture` → `HC.Planets.capture`
   - `HC.Asteroids.update` → `HC.Planets.update` → `HC.Stars.update`
   - `CardEngine.update` (oferty/timed effects/rituals)
4. **Render** (`HC.Render.frame` / `render()` w monolicie):
   - tło → transform kamery → pointer ring → komety → asteroidy → planety → gwiazdy → meteory → UI kart

---

## Event / Trigger Map
- **Input**: `pointerdown/move/up` → `Input.pointerDown`, `Input.x/y`; w `pointerdown` CardEngine może przejąć klik (UI kart).
- **Meteory**: spawner w `updateMeteors` lub `spawnMeteor` (licznik spawnTimer) + epoka gwiazd (strumienie).
- **Kolizje**: `resolveMeteorCollisionsSafe()` →
  - *same color* → `addScore(1)` + `METEOR_SAME_COLOR_COLLISION`
  - *diff color* → `spawnAsteroidFromCollision` + `METEOR_DIFF_COLOR_COLLISION`
- **Asteroidy**: po osiągnięciu `World.planetCaptureTarget` → `startAsteroidCollapse` → `finishCollapseToPlanet`.
- **Planety**:
  - Capture meteorów/asteroid → powiększanie i orbitery.
  - Warunki dla gwiazd (`World.STAR_REQ_*` i `STAR_RARE_MONO_MIN`) → `transformGasPlanetIntoStar` → `startStarEpochZoomOut`.
- **Komety**: spawn oparty o czas/liczbę meteorów; kolizje rozbijają meteory, odpychają, uwalniają orbitery + ringi.
- **Epoka gwiazd**: `startStarEpochZoomOut` ustawia `World.epoch = "STAR"` i `World.meteorStreams.enabled`.

---

# Mapy funkcji wg modułów

**Konwencja pól:** jeśli w danym wpisie nie ma jawnie wymienionego pola (np. Callers/Callees/Wejścia/Locals), przyjmij domyślnie: **Zwraca:** `void`, **Efekty:** brak, **Wejścia:** typowe globalne obiekty modułu, **Najważniejsze lokalne:** standardowe liczniki (`dt`, `nowMs`, akumulatory), **Callers:** główna pętla modułu (`update`/`render`), **Callees:** brak lub lokalne helpery.

## game.boot.codex.js
**Kontekst:** bootstrap świata + pętla gry (modularny setup HC).

### `tryBindCardEngine()`
- **Plik/loc:** Part 1/3, blok boot.
- **Sygnatura:** `tryBindCardEngine()`
- **Zwraca:** `boolean`.
- **Efekty uboczne:** `CardEngine.bindWorld(World)`.
- **Wejścia:** `window.CardEngine`, `HC.getWorld()`.
- **Najważniejsze lokalne:** `CE`, `world`.
- **Callers:** boot, `update()`.
- **Callees:** `CardEngine.bindWorld`.
- **Komentarz:** wiąże CardEngine z World, gdy oba istnieją.

### `screenToWorldFallback(x, y)` *(inline fallback)*
- **Plik/loc:** definicja `screenToWorld`.
- **Sygnatura:** `(x, y)`
- **Zwraca:** `{x, y}` świata.
- **Efekty:** brak.
- **Wejścia:** `View`, `Camera`.
- **Najważniejsze lokalne:** `cx`, `cy`, `zoom`, `camX`, `camY`.
- **Callers:** `update()`.
- **Callees:** brak.
- **Komentarz:** mapuje screen → świat bez modułu kamery.

### `getWorldViewBoundsFallback()` *(inline fallback)*
- **Plik/loc:** definicja `getWorldViewBounds`.
- **Sygnatura:** `()`
- **Zwraca:** `{l,r,t,b,cx,cy}`.
- **Efekty:** brak.
- **Wejścia:** `View`, `Camera`.
- **Najważniejsze lokalne:** `cx`, `cy`, `zoom`, `halfW`, `halfH`.
- **Callers:** spawny meteorytów/komet.
- **Callees:** brak.
- **Komentarz:** fallback bounds.

### `rand(min, max)`
- **Plik/loc:** helpery.
- **Sygnatura:** `(min, max)`
- **Zwraca:** float.
- **Efekty:** brak.
- **Wejścia:** `Math.random()`.
- **Callers:** spawner/losowania.
- **Callees:** brak.
- **Komentarz:** losowanie zakresu.

### `clamp(v, a, b)`
- **Sygnatura:** `(v, a, b)`
- **Zwraca:** liczba w zakresie.
- **Efekty:** brak.
- **Callers:** globalne helpery.

### `meteorBaseRadius()`
- **Sygnatura:** `()`
- **Zwraca:** `View.worldScale * 0.008`.
- **Wejścia:** `View.worldScale`.
- **Komentarz:** bazowy rozmiar meteoru.

### `massFromR(r)`
- **Sygnatura:** `(r)`
- **Zwraca:** `r * r`.
- **Komentarz:** masa ~ pole.

### `WorldAPI.adjustAsteroidOrbitByMeteorRadii(asteroid, deltaCount)`
- **Sygnatura:** `(asteroid, deltaCount)`
- **Zwraca:** void.
- **Efekty:** modyfikuje `asteroid.orbitPx`.
- **Wejścia:** `meteorBaseRadius`, `clamp`.
- **Callees:** `WorldAPI._clampOrbitersToOrbit`.
- **Komentarz:** hook do kart.

### `WorldAPI.removeOrbiters(asteroid, count)`
- **Sygnatura:** `(asteroid, count)`
- **Zwraca:** `removed[]`.
- **Efekty:** usuwa z `asteroid.orbiters`.
- **Callees:** `_clampOrbitersToOrbit`.

### `WorldAPI.countStarSystemOrbiters(star, opts)`
- **Sygnatura:** `(star, opts = {})`
- **Zwraca:** licznik.
- **Efekty:** brak.
- **Lokalne:** `mark(obj)` (unikalność po id).
- **Callers:** `hc.stars_epoch.codex.js`.

### `mark(obj)` *(nested in countStarSystemOrbiters)*
- **Sygnatura:** `(obj)`
- **Zwraca:** void.
- **Efekty:** modyfikuje `seenIds/seenObjs`, `count`.
- **Callers:** `countStarSystemOrbiters`.

### `WorldAPI._clampOrbitersToOrbit(asteroid)`
- **Sygnatura:** `(asteroid)`
- **Zwraca:** void.
- **Efekty:** clamp `o.orbitR`.
- **Wejścia:** `clamp`.

### `hueFromName(name)`
- **Sygnatura:** `(name)`
- **Zwraca:** `hue`.
- **Wejścia:** `MeteorColors`.
- **Komentarz:** mapuje nazwę koloru.

### `pairKey(a, b)`
- **Sygnatura:** `(a, b)`
- **Zwraca:** string.

### `sidesFromColors(c1, c2)`
- **Sygnatura:** `(c1, c2)`
- **Zwraca:** liczba boków.

### `computeGravityFromPlanetRadius(r)`
- **Sygnatura:** `(r)`
- **Zwraca:** `r * 2.6`.

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

### `getDirectOrbitersOfBody(body)`
- **Sygnatura:** `(body)`
- **Zwraca:** `orbiters[]`.
- **Wejścia:** `World.meteors`, `World.asteroids`.

### `removeOrbitersConsumed(orbiters)`
- **Sygnatura:** `(orbiters)`
- **Efekty:** usuwa obiekty z `World.meteors/asteroids`.

### `computeOmega(baseOmega, orbitRpx, Rm)`
- **Sygnatura:** `(baseOmega, orbitRpx, Rm)`
- **Zwraca:** omega.

### `update(dt, nowMs)`
- **Sygnatura:** `(dt, nowMs)`
- **Zwraca:** void.
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

## game.js (monolit)
**Kontekst:** pełny monolit. Każda funkcja ma odpowiednik w modułach HC lub `cards.js`. Poniżej mapowanie z krótkimi metadanymi + aliasem.

### Event Bus
#### `Events.on(eventName, fn)`
- **Loc:** początek `game.js`.
- **Sygnatura:** `(eventName, fn)`
- **Zwraca:** unsub fn.
- **Efekty:** zapis do `listeners`.
- **Alias:** `hc.core.codex.js::Events.on`.

#### `Events.emit(eventName, payload = {})`
- **Sygnatura:** `(eventName, payload = {})`
- **Zwraca:** void.
- **Efekty:** wywołuje listenerów.
- **Alias:** `hc.core.codex.js::Events.emit`.

### CardEngine (IIFE)
*(dla każdej funkcji: alias do `cards.js` lub odpowiednika w monolicie)*
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
- `offerRandom(filterFn)` → monolit only (interne listy kart)
- `drawCard()` → monolit only
- `resetForNewRun()` → alias `cards.js::resetForNewRun`
- `applyOp(before, op, value)` → alias `cards.js::applyOp`
- `applyEffects(effects)` → alias `cards.js::applyEffects`
- `startRitual(card)` → alias `cards.js::startRitual`
- `useCard(card)` → alias `cards.js::useCard`
- `update(dt, now)` → alias `cards.js::update`
- `getOfferProgress01()` → alias `cards.js::getOfferProgress01`
- `render(ctx, screenW, screenH)` → alias `cards.js::render`
- `handlePointerDown(mx, my, screenW, screenH)` → alias `cards.js::handlePointerDown`

### View/Input helpers
- `getMaxPixelRatio()` → alias `hc.view_input.codex.js::getMaxPixelRatio`
- `screenToWorld(x, y)` → alias `hc.camera.codex.js::screenToWorld`
- `getWorldViewBounds()` → alias `hc.camera.codex.js::getWorldViewBounds`
- `resizeCanvas()` → alias `hc.view_input.codex.js::resizeCanvas`
- `toCanvasCoords(e)` → alias `hc.view_input.codex.js::toCanvasCoords`

### World helpers
- `rand(min, max)` → alias `game.boot.codex.js::rand`
- `clamp(v, a, b)` → alias `game.boot.codex.js::clamp`
- `meteorBaseRadius()` → alias `game.boot.codex.js::meteorBaseRadius`
- `massFromR(r)` → alias `game.boot.codex.js::massFromR`

### UI + Score
- `setMeteorsPerSec(mps)` → alias `hc.ui_debug.codex.js::setMeteorsPerSec`
- `addScore(points)` → alias `hc.ui_debug.codex.js::addScore`

### Comets (IIFE)
- `resetSpawner` → alias `hc.comets.codex.js::resetSpawner`
- `onMeteorSpawned` → alias `hc.comets.codex.js::onMeteorSpawned`
- `getTypes` / `getSpawn` / `weightedPick` → alias `hc.comets.codex.js` functions
- `spawnComet` / `spawnFromEdge` → alias `hc.comets.codex.js`
- `update` / `updateSpawner` → alias `hc.comets.codex.js`
- `handleCollisions` + helpers → alias `hc.comets.codex.js`
- `splitMeteorIntoFragments` / `deflectCometByMass` / `hardDeflect` → alias `hc.comets.codex.js`
- `releaseAllOrbitersFromAsteroid` / `releaseHalfOrbitersFromPlanet` → alias `hc.comets.codex.js`
- `draw` / `drawCore` / `drawTail` → alias `hc.comets.codex.js`
- `activateShower` → alias `hc.comets.codex.js`

### Meteors / Asteroids / Planets / Collisions / Render
- `pickColor` / `hueFromName` / `spawnMeteor` / `updateMeteors` → alias `hc.meteors.codex.js`
- `pairKey` / `sidesFromColors` → alias `game.boot.codex.js`
- `makePlanetGradient` / `drawPlanet*` / `drawAsteroid*` / `drawBackground` / `drawPointerRing` → alias `hc.render.codex.js`
- `spawnAsteroidFromCollision` / `addOrbiterToAsteroid` / `captureMeteorsByAsteroids` / `startAsteroidCollapse` / `finishCollapseToPlanet` / `updateAsteroidCollapse` / `updateAsteroids` → alias `hc.asteroids.codex.js`
- `addOrbiterToPlanet` / `captureMeteorsByPlanets` / `captureAsteroidsByPlanets` / `updatePlanets` / `addPlanetRingMark` → alias `hc.planets.codex.js`
- `resolveMeteorCollisionsSafe` → alias `hc.collisions.codex.js`
- `computeOmega` → alias `game.boot.codex.js::computeOmega`
- `update` / `render` / `resetWorld` / `frame` → alias `game.boot.codex.js` loop (monolitowa wersja)

---

## game.monolith.backup.codex.js
**Kontekst:** kopia monolitu. Funkcje jak w `game.js`. Użyj mapowania z sekcji **game.js (monolit)**.

---

## cards.js / cards.codex.js
**Kontekst:** samodzielny CardEngine (stage 1).

### `on(eventName, fn)`
- **Plik/loc:** początek `cards.js`.
- **Sygnatura:** `(eventName, fn)`
- **Zwraca:** unsub fn.
- **Efekty:** zapis do `listeners`.
- **Wejścia:** `listeners`.
- **Callers:** `CardEngine`.
- **Callees:** brak.
- **Komentarz:** rejestracja listenerów.

### `emit(eventName, payload = {})`
- **Sygnatura:** `(eventName, payload = {})`
- **Zwraca:** void.
- **Efekty:** wywołuje listenerów.
- **Wejścia:** `listeners`.
- **Callers:** `CardEngine`.
- **Callees:** brak.
- **Komentarz:** dystrybucja eventów.

### `normalizeCard(raw)`
- **Sygnatura:** `(raw)`
- **Zwraca:** `card | null`.
- **Efekty:** brak.
- **Wejścia:** `clampInt`, `clampNum`.
- **Najważniejsze lokalne:** `raw.id`, `raw.title`.
- **Callers:** `normalizePack`.
- **Callees:** `clampInt`, `clampNum`.
- **Komentarz:** normalizuje definicję karty.

### `normalizePack(json)`
- **Sygnatura:** `(json)`
- **Zwraca:** `{version, cards[]}`.
- **Efekty:** brak.
- **Wejścia:** `normalizeCard`.
- **Callers:** init `PACK`.
- **Callees:** `normalizeCard`.
- **Komentarz:** normalizuje pack.

### `clampInt(v, a, b)`
- **Sygnatura:** `(v, a, b)`
- **Zwraca:** int.
- **Efekty:** brak.
- **Komentarz:** clamp + floor.

### `clampNum(v, a, b)`
- **Sygnatura:** `(v, a, b)`
- **Zwraca:** number.
- **Efekty:** brak.

### `clamp01(x)`
- **Sygnatura:** `(x)`
- **Zwraca:** number 0..1.

### `bindWorld(World)`
- **Sygnatura:** `(World)`
- **Zwraca:** void.
- **Efekty:** `state.world`, `World.spawnIntervalMul`, `World.score`, targety.
- **Wejścia:** `state`, `World`.
- **Callers:** boot.
- **Callees:** `addTarget`.
- **Komentarz:** wiąże CardEngine z World i targetami.

### `addTarget(id, meta, access)` *(nested in bindWorld)*
- **Sygnatura:** `(id, meta, access)`
- **Zwraca:** void.
- **Efekty:** `state.targets`, `state.targetLibrary`, `state.targetMeta`.
- **Callers:** `bindWorld`.
- **Komentarz:** rejestruje target.

### `nowMs()`
- **Sygnatura:** `()`
- **Zwraca:** `performance.now()`.

### `isOnCooldown(cardId, t)`
- **Sygnatura:** `(cardId, t)`
- **Zwraca:** boolean.
- **Wejścia:** `state.cooldowns`.

### `setCooldown(card)`
- **Sygnatura:** `(card)`
- **Efekty:** zapis cooldownu.

### `enqueueOffer(card)`
- **Sygnatura:** `(card)`
- **Efekty:** `state.queue.push`.

### `offerCardById(cardId)`
- **Sygnatura:** `(cardId)`
- **Efekty:** ustawia `activeOffer`.
- **Wejścia:** `state.queue`.

### `resetForNewRun()`
- **Sygnatura:** `()`
- **Efekty:** reset `state` (hand/queue/timed/ritual).

### `applyOp(before, op, value)`
- **Sygnatura:** `(before, op, value)`
- **Zwraca:** number.
- **Efekty:** brak (obliczenie).

### `applyEffects(effects)`
- **Sygnatura:** `(effects)`
- **Efekty:** modyfikuje targety, `state.timed`.
- **Wejścia:** `state.targets`.

### `startRitual(card)`
- **Sygnatura:** `(card)`
- **Efekty:** `state.ritual`.

### `useCard(card)`
- **Sygnatura:** `(card)`
- **Efekty:** aktywuje efekty, cooldown.

### `update(_dt, now)`
- **Sygnatura:** `(_dt, now)`
- **Efekty:** update timed effects, ritual, queue.

### `getOfferProgress01()`
- **Sygnatura:** `()`
- **Zwraca:** 0..1.

### `render(ctx, screenW, screenH)`
- **Sygnatura:** `(ctx, screenW, screenH)`
- **Efekty:** rysuje UI kart.

### `handlePointerDown(mx, my, screenW, screenH)`
- **Sygnatura:** `(mx, my, screenW, screenH)`
- **Efekty:** obsługa kliknięcia.

### `onRitualTrigger(_payload)`
- **Sygnatura:** `(_payload)`
- **Efekty:** uruchamia rytuał.

### `openResetCardHub()`
- **Sygnatura:** `()`
- **Efekty:** placeholder/hook.

---

## hc.core.codex.js
### `Events.on(name, fn)`
- **Sygnatura:** `(name, fn)`
- **Zwraca:** void.
- **Efekty:** `Events._events[name].push(fn)`.
- **Wejścia:** `Events._events`.
- **Callers:** globalne moduły.
- **Komentarz:** rejestruje listener.

### `Events.off(name, fn)`
- **Sygnatura:** `(name, fn)`
- **Efekty:** usuwa listener.

### `Events.emit(name, payload)`
- **Sygnatura:** `(name, payload)`
- **Efekty:** wywołuje listenerów.

---

## hc.util.codex.js
### `Util.clamp(v,a,b)`
- **Sygnatura:** `(v,a,b)`
- **Zwraca:** number.
- **Efekty:** brak.

### `Util.lerp(a,b,t)`
- **Sygnatura:** `(a,b,t)`
- **Zwraca:** number.

### `Util.hypot(x,y)` / `Util.dist(x1,y1,x2,y2)`
- **Sygnatury:** `(x,y)` / `(x1,y1,x2,y2)`
- **Zwraca:** number.

### `Util.easeInOutCubic(t)`
- **Sygnatura:** `(t)`
- **Zwraca:** number.

### `Util.hash32(str)`
- **Sygnatura:** `(str)`
- **Zwraca:** 32-bit hash.

### `Util.makeRng(seed)`
- **Sygnatura:** `(seed)`
- **Zwraca:** `rand01()`.

---

## hc.view_input.codex.js
### `getMaxPixelRatio()`
- **Sygnatura:** `()`
- **Zwraca:** `dpr`.
- **Wejścia:** `devicePixelRatio`, `matchMedia`.

### `initViewInput(opts)`
- **Sygnatura:** `(opts = {})`
- **Efekty:** init canvas, View/Input, eventy.
- **Callees:** `resizeCanvas`, `toCanvasCoords`.

### `resizeCanvas()` *(nested)*
- **Efekty:** ustawia `canvas` size, `View`.

### `toCanvasCoords(e)` *(nested)*
- **Zwraca:** `{x,y}` w canvas.

---

## hc.camera.codex.js
### `update(dt, view)`
- **Sygnatura:** `(dt, view)`
- **Efekty:** `Camera.zoom/scale/target`, `Camera.epochZoom`.

### `screenToWorld(x, y)`
- **Sygnatura:** `(x, y)`
- **Zwraca:** `{x,y}` świata.

### `getWorldViewBounds()`
- **Sygnatura:** `()`
- **Zwraca:** `{l,r,t,b,cx,cy}`.

---

## hc.world.codex.js
### `HC.getWorld()`
- **Sygnatura:** `()`
- **Zwraca:** `window.World || HC.World`.

---

## hc.ui_debug.codex.js
### `addScore(points)`
- **Sygnatura:** `(points)`
- **Efekty:** `World.score += points` + update HUD.

### `setMeteorsPerSec(mps, World, clamp)`
- **Sygnatura:** `(mps, World, clamp)`
- **Efekty:** `World.spawnInterval = 1/v` + update slider.

### `ensureScoreLabel()` / `ensureMpsUI()`
- **Sygnatura:** `()`
- **Efekty:** tworzą DOM HUD.

### `HC.UI.init()`
- **Sygnatura:** `()`
- **Efekty:** init HUD, slider, resetWorld.

### `HC.UI.update(dt, nowMs)`
- **Sygnatura:** `(dt, nowMs)`
- **Efekty:** FPS label + `CardEngine.render`.

---

## hc.meteors.codex.js
### `pickColor()`
- **Sygnatura:** `()`
- **Zwraca:** kolor z `MeteorColors`.

### `spawnMeteor()`
- **Sygnatura:** `()`
- **Efekty:** `World.meteors.push`, `Events.emit("METEOR_SPAWNED")`.

### `spawnStreamMeteor(angle, streamIndex)`
- **Sygnatura:** `(angle, streamIndex)`
- **Efekty:** `World.meteors.push` (isStream).

### `drawMeteor(m)`
- **Sygnatura:** `(m)`
- **Efekty:** rysowanie trailu.

### `updateMeteors(dt)`
- **Sygnatura:** `(dt)`
- **Efekty:** spawn + ruch + kolizje z krawędzią + absorpcja.
- **Wejścia:** `World.pointer*`, `CardEngine.state.engineStats`, `Input`, `View`, `Camera`.

---

## hc.collisions.codex.js
### `resolveMeteorCollisionsSafe()`
- **Sygnatura:** `()`
- **Efekty:** `addScore`, `spawnAsteroidFromCollision`, `Events.emit`.

### `HC.Collisions.resolve(dt, now)`
- **Sygnatura:** `(dt, now)`
- **Efekty:** wrapper.

---

## hc.asteroids.codex.js
### `spawnAsteroidFromCollision(a, b)`
- **Sygnatura:** `(a, b)`
- **Efekty:** tworzy asteroidę, `World.asteroids.push`, `Events.emit`.

### `addOrbiterToAsteroid(a, meteor)`
- **Sygnatura:** `(a, meteor)`
- **Efekty:** `a.orbiters.push`, `_clampOrbitersToOrbit`.

### `captureMeteorsByAsteroids(dt, nowMs)`
- **Sygnatura:** `(dt, nowMs)`
- **Efekty:** usuwa meteory, powiększa asteroidę.

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

### `addOrbiterToPlanet(p, meteor)`
- **Sygnatura:** `(p, meteor)`
- **Efekty:** `p.orbiters.push`.

### `captureMeteorsByPlanets(dt, nowMs)`
- **Sygnatura:** `(dt, nowMs)`
- **Efekty:** usuwa meteory, rośnie planeta.

### `captureAsteroidsByPlanets(dt, nowMs)`
- **Sygnatura:** `(dt, nowMs)`
- **Efekty:** przypina asteroidy do orbit.

### `updatePlanets(dt)`
- **Sygnatura:** `(dt)`
- **Efekty:** ruch planet, transformacje w gwiazdy.

---

## hc.comets.codex.js
### `resetSpawner(nowMs)`
- **Sygnatura:** `(nowMs)`
- **Efekty:** reset liczników spawnu.

### `onMeteorSpawned()`
- **Sygnatura:** `()`
- **Efekty:** `spawnState.meteorsSinceLast++`.

### `getTypes()` / `getSpawn()`
- **Sygnatura:** `()`
- **Zwraca:** config types/spawn.

### `weightedPick(list)`
- **Sygnatura:** `(list)`
- **Zwraca:** element wg wagi.

### `spawnComet()`
- **Sygnatura:** `()`
- **Efekty:** `World.comets.push`.

### `spawnFromEdge(speed, r)`
- **Sygnatura:** `(speed, r)`
- **Zwraca:** `{x,y,vx,vy}`.

### `update(dt, nowMs)`
- **Sygnatura:** `(dt, nowMs)`
- **Efekty:** ruch komet + `handleCollisions`.

### `updateSpawner(nowMs)`
- **Sygnatura:** `(nowMs)`
- **Efekty:** warunkowy spawn komet.

### `handleCollisions(dt, nowMs)`
- **Sygnatura:** `(dt, nowMs)`
- **Efekty:** uderzenia komet, fragmentacja.
- **Nested:** `isGhostBody`, `getAllMeteorsForCollision`, `getHitWorldPos`, `addRingMark`, `removeMeteorFromOwner`.

### `isGhostBody(o)` *(nested)*
- **Sygnatura:** `(o)`
- **Zwraca:** boolean.

### `getAllMeteorsForCollision()` *(nested)*
- **Sygnatura:** `()`
- **Zwraca:** lista `{m, ownerType, ownerRef, index}`.

### `getHitWorldPos(hit)` *(nested)*
- **Sygnatura:** `(hit)`
- **Zwraca:** `{x,y}`.

### `addRingMark(owner, m, source)` *(nested)*
- **Sygnatura:** `(owner, m, source)`
- **Efekty:** `owner.rings.push`.

### `removeMeteorFromOwner(hit)` *(nested)*
- **Sygnatura:** `(hit)`
- **Zwraca:** usunięty meteor.
- **Efekty:** usuwa z list ownera.

### `transformAsteroidIntoRockyPlanet(a, comet)`
- **Sygnatura:** `(a, comet)`
- **Efekty:** zmiana typu obiektu + powstanie planety skalistej.

### `splitMeteorIntoFragments(m)`
- **Sygnatura:** `(m)`
- **Efekty:** tworzy fragmenty meteorów.

### `deflectCometByMass(c, meteor)`
- **Sygnatura:** `(c, meteor)`
- **Efekty:** modyfikuje `c.vx/vy`.

### `hardDeflect(c)`
- **Sygnatura:** `(c)`
- **Efekty:** natychmiastowa zmiana kierunku.

### `releaseAllOrbitersFromAsteroid(a, nowMs)`
- **Sygnatura:** `(a, nowMs)`
- **Efekty:** wyrzuca orbitery do `World.meteors`.

### `releaseHalfOrbitersFromPlanet(p, nowMs, opts)`
- **Sygnatura:** `(p, nowMs, opts)`
- **Efekty:** wyrzuca część orbiterów.

### `draw(ctx)`
- **Sygnatura:** `(ctx)`
- **Efekty:** rysuje komety.

### `drawCore(ctx, c)` / `drawTail(ctx, c)`
- **Sygnatury:** `(ctx, c)`
- **Efekty:** rysowanie części komety.

### `activateShower(nowMs, durationMs = 12000)`
- **Sygnatura:** `(nowMs, durationMs = 12000)`
- **Efekty:** override spawner event.

---

## hc.stars_epoch.codex.js
### `startStarEpochZoomOut(star, screenW, screenH)`
- **Sygnatura:** `(star, screenW, screenH)`
- **Efekty:** ustawia `World.epoch`, `Camera.epochZoom`, `World.meteorStreams`.

### `isMeteor(o)` / `isPlanet(o)` / `isCaptureToStarAllowed(o)`
- **Sygnatury:** `(o)`
- **Zwraca:** boolean.

### `attachBodyToStarSystem(o, s)`
- **Sygnatura:** `(o, s)`
- **Efekty:** przypina obiekt do orbit gwiazdy.

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

# Indeks funkcji (alfabetyczny)
*(skrót: funkcje duplikowane między monolitem i modułami HC nie są rozwijane osobno; patrz sekcje modułów)*

- `addAsteroidBreakRing` — hc.planets.codex.js
- `addOrbiterToAsteroid` — hc.asteroids.codex.js / game.js
- `addOrbiterToPlanet` — hc.planets.codex.js / game.js
- `addPlanetRingMark` — hc.planets.codex.js / game.js
- `addScore` — hc.ui_debug.codex.js / game.js
- `analyzeSystemMeteors` — hc.planets.codex.js
- `applyEffects` — cards.js / game.js CardEngine
- `applyOp` — cards.js / game.js CardEngine
- `attachBodyToStarSystem` — hc.stars_epoch.codex.js
- `bindWorld` — cards.js / game.js CardEngine
- `buildBlobPatchwork` — hc.planets.codex.js
- `buildColorWeightsFromOrbiters` — hc.planets.codex.js
- `captureAsteroidsByPlanets` — hc.planets.codex.js / game.js
- `captureBodiesByStars` — hc.stars_epoch.codex.js
- `captureMeteorsByAsteroids` — hc.asteroids.codex.js / game.js
- `captureMeteorsByPlanets` — hc.planets.codex.js / game.js
- `classifyMeteorColor` — hc.planets.codex.js
- `clamp` — hc.util.codex.js / game.boot.codex.js
- `clamp01` — cards.js / game.js
- `clampInt` — cards.js / game.js
- `clampNum` — cards.js / game.js
- `computeGravityFromPlanetRadius` — game.boot.codex.js
- `computeOmega` — game.boot.codex.js / game.js
- `computeRockyParamsFromOrbiters` — hc.planets.codex.js
- `countOrbitersInBodySystem` — hc.planets.codex.js
- `countStarSystemOrbiters` — game.boot.codex.js
- `countSystemOrbitersForRocky` — hc.planets.codex.js
- `deflectCometByMass` — hc.comets.codex.js / game.js
- `draw` — hc.comets.codex.js
- `drawAsteroid` — hc.render.codex.js / game.js
- `drawAsteroidOrbiters` — hc.render.codex.js / game.js
- `drawBackground` — hc.render.codex.js / game.js
- `drawCore` — hc.comets.codex.js
- `drawMeteor` — hc.meteors.codex.js / hc.render.codex.js / game.js
- `drawPlanet` — hc.render.codex.js / game.js
- `drawPlanetOrbiters` — hc.render.codex.js / game.js
- `drawPlanetRings` — hc.render.codex.js / game.js
- `drawPlanetSoftEdgeAndGrain` — hc.render.codex.js
- `drawPointerRing` — hc.render.codex.js / game.js
- `drawRegularPolygon` — hc.render.codex.js / game.js
- `drawRockyPatchwork` — hc.render.codex.js
- `drawRockyPlanet` — hc.render.codex.js
- `drawRockyRimAndCracks` — hc.render.codex.js
- `drawStar` — hc.render.codex.js
- `drawTail` — hc.comets.codex.js
- `enqueueOffer` — cards.js / game.js
- `frame` — game.boot.codex.js / hc.render.codex.js / game.js
- `getDirectOrbitersOfBody` — game.boot.codex.js / hc.planets.codex.js
- `getMaxPixelRatio` — hc.view_input.codex.js / game.js
- `getOfferProgress01` — cards.js / game.js
- `getSpawn` — hc.comets.codex.js / game.js
- `getTypes` — hc.comets.codex.js / game.js
- `getWorldViewBounds` — hc.camera.codex.js / game.js
- `handlePointerDown` — cards.js / game.js
- `hash32` — hc.util.codex.js / game.boot.codex.js
- `hashFloat` — hc.render.codex.js
- `hash01` — game.boot.codex.js
- `hardDeflect` — hc.comets.codex.js / game.js
- `hueFromName` — game.boot.codex.js / game.js / hc.meteors.codex.js
- `initViewInput` — hc.view_input.codex.js
- `isCaptureToStarAllowed` — hc.stars_epoch.codex.js
- `isOnCooldown` — cards.js / game.js
- `lerp` — hc.util.codex.js / hc.render.codex.js
- `makePlanetGradient` — hc.render.codex.js / game.js
- `makeRng` — hc.util.codex.js / game.boot.codex.js
- `massFromR` — game.boot.codex.js / game.js
- `normalizeCard` — cards.js / game.js
- `normalizePack` — cards.js / game.js
- `nowMs` — cards.js / game.js
- `offerCardById` — cards.js
- `offerRandom` — game.js CardEngine
- `onMeteorSpawned` — hc.comets.codex.js / game.js
- `openResetCardHub` — cards.js
- `pairKey` — game.boot.codex.js / game.js
- `pickColor` — hc.meteors.codex.js / game.js
- `releaseAllOrbitersFromAsteroid` — hc.comets.codex.js / game.js
- `releaseHalfOrbitersFromPlanet` — hc.comets.codex.js / game.js
- `removeOrbitersConsumed` — game.boot.codex.js / hc.planets.codex.js
- `removeMeteorFromOwner` — hc.comets.codex.js / game.js
- `removeSystemMeteorsFromPlanet` — hc.planets.codex.js
- `render` — cards.js / game.js / hc.render.codex.js
- `resetForNewRun` — cards.js / game.js
- `resetSpawner` — hc.comets.codex.js / game.js
- `resetWorld` — game.boot.codex.js / game.js
- `resolveMeteorCollisionsSafe` — hc.collisions.codex.js / game.js
- `screenToWorld` — hc.camera.codex.js / game.js
- `setCooldown` — cards.js / game.js
- `setMeteorsPerSec` — hc.ui_debug.codex.js / game.js
- `sidesFromColors` — game.boot.codex.js / game.js
- `spawnAsteroidFromCollision` — hc.asteroids.codex.js / game.js
- `spawnComet` — hc.comets.codex.js / game.js
- `spawnFromEdge` — hc.comets.codex.js / game.js
- `spawnMeteor` — hc.meteors.codex.js / game.js
- `spawnStreamMeteor` — hc.meteors.codex.js
- `startAsteroidCollapse` — hc.asteroids.codex.js / game.js
- `startRitual` — cards.js / game.js
- `startStarEpochZoomOut` — hc.stars_epoch.codex.js
- `transformAsteroidIntoRockyPlanet` — hc.comets.codex.js / hc.planets.codex.js
- `transformGasPlanetIntoStar` — hc.planets.codex.js
- `update` — game.boot.codex.js / game.js / hc.comets.codex.js / hc.meteors.codex.js / hc.asteroids.codex.js / hc.planets.codex.js / hc.stars_epoch.codex.js / cards.js
- `updateAsteroidCollapse` — hc.asteroids.codex.js / game.js
- `updateAsteroids` — hc.asteroids.codex.js / game.js
- `updateMeteors` — hc.meteors.codex.js / game.js
- `updatePlanets` — hc.planets.codex.js / game.js
- `updateSpawner` — hc.comets.codex.js / game.js
- `updateStarBirths` — hc.stars_epoch.codex.js
- `updateStars` — hc.stars_epoch.codex.js
- `useCard` — cards.js / game.js
- `weightedPick` — hc.comets.codex.js / game.js

---

## Open Questions / Gaps
- `game.monolith.backup.codex.js` wygląda jak pełna kopia `game.js`; jeśli różnice są istotne, warto porównać diff i wskazać konkretne odchylenia.
- W monolicie `game.js` i w modułach HC część funkcji jest duplikowana; przy dalszym audycie można oznaczyć „źródło prawdy” dla każdej pary (monolit vs HC).
