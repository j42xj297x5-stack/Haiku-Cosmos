# Haiku Cosmos — MAP_FUNCTIONS_WORLD.md

> Mapa funkcji i zależności dla `game.js` (mechanika świata + pętla gry).
> Cel: szybkie odnajdywanie miejsc w kodzie po opisie zachowania.

---

## 0. Szybka orientacja

**Główne byty / stany:**
- `World` — globalny stan symulacji (tablice obiektów + parametry „gałki” do kart)
- `Camera` — skala widzenia (zoom) i easing
- `View` — rozmiar canvasu
- `Comets` — moduł (IIFE) z własnym configiem i spawnerem

**Pętla gry:**
- `frame()` → liczy `dt` i woła `update(dt)` oraz `render()`.

---

## 1. Struktury danych (World)

`World` trzyma m.in.:
- `World.meteors[]`
- `World.asteroids[]`
- `World.planets[]`
- `World.comets[]` (doklejane w module Comets)

Parametry-API pod karty (przykłady):
- `World.pointerRadius`
- `World.pointerStrength`
- `World.pointerGlueDamp`
- `World.meteorCollisionFudge`
- `World.asteroidDriftMul`
- `World.planetCaptureTarget`

Flagi kamery/epok (obecnie):
- `World.flags.firstPlanetZoomed`
- `World.flags.firstStarZoomed` *(gwiazdy jeszcze nie ma, ale flaga już jest)*

---

## 2. Pętla gry (core)

### 2.1 `frame()`
**Rola:** scheduler (requestAnimationFrame), liczy delta-time.

**Woła:**
- `update(dt)`
- `render()`

### 2.2 `update(dt)` *(global game update)*
**Rola:** jedna klatka symulacji.

**Kolejność (kluczowa):**
1) aktualizacja kamery (`Camera.scale` → `Camera.target` easing)
2) input → world coords (`screenToWorld`, `World.pointerX/Y`)
3) „epoch zoom triggers” (np. pierwszy planet zoom)
4) mechanika:
   - `updateMeteors(dt)`
   - `Comets.update(dt, nowMs)`
   - `resolveMeteorCollisionsSafe()`
   - `captureMeteorsByAsteroids(dt, nowMs)`
   - `captureMeteorsByPlanets(dt, nowMs)`
   - `captureAsteroidsByPlanets(dt, nowMs)`
   - `updateAsteroids(dt)`
   - `updatePlanets(dt)`

> Uwaga: kolejność jest ważna dla „feel”: najpierw ruch, potem kolizje, potem przechwyty.

### 2.3 `render()`
**Rola:** rysowanie świata.

**Woła (w kolejności):**
- `drawBackground()`
- transform kamery (`translate/scale`)
- `drawPointerRing()`
- `Comets.draw(ctx)`
- `drawAsteroid(a)` (pętla)
- `drawPlanet(p)` (pętla)
- `drawMeteor(m)` (pętla)

---

## 3. Spawner meteorów (bazowy)

### 3.1 `setMeteorsPerSec(mps)`
**Rola:** ustawia `World.spawnInterval` + synchronizacja UI suwaka.

### 3.2 `updateSpawner(dt/nowMs)`
**Rola:** tick spawnera.

**Woła:**
- `spawnMeteor()` lub `spawnFromEdge(...)` (zależnie od implementacji)

### 3.3 `spawnMeteor()` / `spawnFromEdge()`
**Rola:** tworzy meteory i wrzuca do `World.meteors`.

### 3.4 `onMeteorSpawned(m)`
**Rola:** hook do dodatkowych efektów (np. przyszłe karty / eventy).

---

## 4. Meteory — ruch, kolizje, punkty

### 4.1 `updateMeteors(dt)`
**Rola:**
- ruch meteorów
- wpływ kursora (pull/klejenie)
- TTL / wygaszanie (jeśli jest)

**Używa:**
- `World.pointerRadius/Strength/GlueDamp`
- `toCanvasCoords`, `screenToWorld` (pośrednio)

### 4.2 `resolveMeteorCollisionsSafe()` / `handleCollisions()`
**Rola:** wykrywanie kolizji meteor–meteor.

**Efekty (koncept):**
- dwa meteory **tego samego koloru** → `addScore()` (punkt rezonansu)
- różne kolory → `spawnAsteroidFromCollision()`

### 4.3 `addScore(n)`
**Rola:** zwiększa `World.score`.

> Ten licznik jest zaczepem pod: „pierwsze pary punktów → karty”.

---

## 5. Planetoidy / asteroidy — przechwyty i kolaps

### 5.1 `spawnAsteroidFromCollision(m1, m2)`
**Rola:** tworzy planetoidę z dwóch meteorów różnych kolorów.

**Używa:**
- `World.asteroidDriftMul` (początkowy drift)

### 5.2 `updateAsteroids(dt)`
**Rola:** ruch planetoid + aktualizacja ich stref wpływu.

### 5.3 `captureMeteorsByAsteroids(dt, nowMs)`
**Rola:** meteory wchodzą w strefę planetoidy → przechwyty.

**Woła (pośrednio):**
- `addOrbiterToAsteroid(...)` *(historycznie — obecnie orbitery mogą być wygaszone jako kierunek)*
- logika akumulacji do kolapsu

### 5.4 Kolaps planetoidy
- `startAsteroidCollapse(a)`
- `updateAsteroidCollapse(a, dt)`
- `finishCollapseToPlanet(a)`

**Docelowo:** kolaps tworzy planetę (lub dalej gwiazdę, gdy dojdą gwiazdy).

---

## 6. Planety — przechwyty, pierścienie, rozwój

### 6.1 `updatePlanets(dt)`
**Rola:** aktualizacja planet (ruch, strefy wpływu, orbitale jeśli istnieją).

### 6.2 `captureMeteorsByPlanets(dt, nowMs)`
**Rola:** przechwyty meteorów przez planety.

### 6.3 `captureAsteroidsByPlanets(dt, nowMs)`
**Rola:** przechwyty planetoid przez planety.

> Uwaga koncepcyjna (z dokumentów): fragmenty meteorów mają iść w **pierścienie**, nie w masę.

---

## 7. Komety — moduł `Comets`

### 7.1 Public API
`Comets = { CONFIG, update, draw, resetSpawner, activateShower }`

### 7.2 `Comets.update(dt, nowMs)`
**Rola:**
- zarządzanie eventem komet (czas / meteorCount)
- spawn komet (`spawnComet`) i ich ruch
- kolizje kometa vs meteor / kometa vs planetoida

**Woła m.in.:**
- `updateSpawner(nowMs)` *(spawner komet)*
- `splitMeteorIntoFragments(m)`
- `deflectCometByMass(c, m)`

### 7.3 `Comets.draw(ctx)`
**Rola:** render komet + ogon (`drawTail`).

### 7.4 Fragmentacja meteoru
- `splitMeteorIntoFragments(m)` — rozbija meteor na odłamki

### 7.5 Defleksja
- `deflectCometByMass(c, m)`
- `hardDeflect(...)`

---

## 8. Rysowanie (draw*)

Najważniejsze:
- `drawBackground()`
- `drawPointerRing()`
- `drawMeteor(m)`
- `drawAsteroid(a)`
- `drawPlanet(p)`
- `drawTail(...)`
- `drawCard(...)` *(UI karty — jeśli wróci w jakiejś formie)*

---

## 9. Utility / math

- `clamp(x, a, b)`
- `rand(a, b)`
- `weightedPick(items)`
- `massFromR(r)`
- `computeOmega(...)`
- `pairKey(...)` (hash par do kolizji)

---

## 10. „Gdzie dopinać karty” (hooki w kodzie)

Najbezpieczniejsze punkty zaczepu (bez rozjeżdżania mechaniki):
- **na wejściu** `update(dt)` → modyfikacja parametrów `World.*` (multipliery)
- **po kolizjach** `resolveMeteorCollisionsSafe()` → naliczanie punktów / trigger karty
- **w spawnerach** `updateSpawner()` (bazowy) oraz `Comets.CONFIG.spawn` (komety)
- **przy przejściu epoki** (gdy wprowadzimy `onEpochChange`) → zmiana profilu

---

## 11. Plan na dalszą mapę

Następny krok (gdy zechcesz):
- dopisać **line anchors** (przybliżone zakresy linii) dla każdej funkcji
- zrobić drugą mapę: `MAP_FUNCTIONS_CARDS.md` (gdy wdrożymy edytor i runtime kart)

