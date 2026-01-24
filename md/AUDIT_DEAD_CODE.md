# Haiku Cosmos — Dead-Code Audit (Phase 1, analysis only)

> Scope: `*.codex.js`, `*.codex.html`, `md/*.md` (no generated JS).  
> Goal: map runtime call graph, entrypoints, and identify likely-dead symbols + zombie state.

---

## A) Runtime call graph (boot → update → render → UI → CardEngine)

**Script load order (from `index.codex.html`):**
1. `cards.codex.js`
2. `hc.core.codex.js`
3. `hc.util.codex.js`
4. `hc.world.codex.js`
5. `hc.view_input.codex.js`
6. `hc.camera.codex.js`
7. `hc.comets.codex.js`
8. `hc.meteors.codex.js`
9. `hc.render.codex.js`
10. `hc.collisions.codex.js`
11. `hc.asteroids.codex.js`
12. `hc.planets.codex.js`
13. `hc.stars_epoch.codex.js`
14. `hc.ui_debug.codex.js`
15. `game.boot.codex.js`

**Runtime order (from boot + MAP_FUNCTIONS_WORLD_vNEXT):**
```
init (game.boot.codex.js IIFE)
  ├─ HC.initViewInput → resizeCanvas + input handlers
  ├─ World/Camera/View/Input setup
  ├─ HC.init* modules (Stars, Planets, Comets, Meteors, Render, Asteroids, Collisions)
  ├─ HC.UI.init() → binds DOM + triggers resetWorld()
  └─ resetWorld() (then hc.world wraps resetWorld on window.load)

update(dt, nowMs)  [game.boot.codex.js]
  ├─ Camera.update
  ├─ Input → screenToWorld
  ├─ HC.Meteors.update
  ├─ HC.Comets.update
  ├─ HC.Collisions.resolve
  ├─ HC.Asteroids.capture → HC.Planets.capture
  ├─ HC.Asteroids.update → HC.Planets.update
  ├─ HC.Stars.update
  └─ CardEngine.update

frame(now) [requestAnimationFrame loop]
  ├─ HC.Render.frame
  └─ HC.UI.update → CardEngine.render
```

---

## B) Runtime entrypoints and who calls them

### Core loop (boot)
- **`update(dt, nowMs)`** — called by `frame(now)` inside `game.boot.codex.js`.
- **`frame(now)`** — called by `requestAnimationFrame(frame)` in `game.boot.codex.js`.
- **`resetWorld()`** — called on boot (`HC.UI.init` → `resetWorld`) and exposed to UI button + console.

### Module init entrypoints
- **`HC.initViewInput`** — called by `game.boot.codex.js`.
- **`HC.initRender`** — called by `game.boot.codex.js`.
- **`HC.initMeteors`** — called by `game.boot.codex.js`.
- **`HC.initComets`** — called by `game.boot.codex.js`.
- **`HC.initAsteroids`** — called by `game.boot.codex.js`.
- **`HC.initPlanets`** — called by `game.boot.codex.js`.
- **`HC.initStarsEpoch`** — called by `game.boot.codex.js`.
- **`HC.initCollisions`** — called by `game.boot.codex.js`.

### Render/UI entrypoints
- **`HC.Render.frame(now, dt)`** — called by `frame` in boot.
- **`HC.UI.init()` / `HC.UI.update(dt, now)`** — called by boot.
- **`CardEngine.render(ctx, w, h)`** — called by UI + render module.

### CardEngine entrypoints
- **`CardEngine.bindWorld(World)`** — called by boot during init (and during reset/rebind).
- **`CardEngine.update(dt, nowMs)`** — called each frame in `update`.
- **`CardEngine.handlePointerDown(...)`** — called by view input pointer handler.
- **`CardEngine.resetForNewRun()`** — called in `resetWorld()`.

---

## C) Module-by-module runtime audit

> For each module: public API/globals, World reads/writes, events, DOM handlers, timers.

### `index.codex.html`
- **Globals/DOM:** `#gameCanvas`, `#fpsLabel`, `#btnRestart`, `#btnSubMeta`.
- **Script order:** listed above.
- **Events/DOM:** none directly (DOM elements wired by JS).

### `game.boot.codex.js`
- **Public API/globals:** `window.World`, `window.View`, `window.Camera`, `window.Input`, `window.ctx`, plus helpers: `rand`, `clamp`, `meteorBaseRadius`, `massFromR`, `computeGravityFromPlanetRadius`, `computeOmega`, `getWorldViewBounds`, `hueFromName`, `sidesFromColors`, `getDirectOrbitersOfBody`, `makeRng`, `hash32`, `removeOrbitersConsumed`, `WorldAPI`, `resetWorld`.
- **Reads/Writes:** Creates and resets all `World` state; updates `World.nowMs`, `World.flags`, `World.*` in update loop.
- **Events:** none.
- **DOM handlers:** none.
- **Timers:** `requestAnimationFrame(frame)`.

### `hc.core.codex.js`
- **Public API/globals:** `window.Events` (on/off/emit), `window.HC.TAU`.
- **Reads/Writes:** none.
- **Events:** event bus implementation.
- **DOM/Timers:** none.

### `hc.util.codex.js`
- **Public API/globals:** `window.HC.Util.{clamp,lerp,hypot,dist,easeInOutCubic,hash32,makeRng}`.
- **Reads/Writes:** none.
- **Events/DOM/Timers:** none.

### `hc.world.codex.js`
- **Public API/globals:**
  - `HC.getWorld`, `HC.WorldEvents.{startMeteorShower,stopMeteorShower,interruptPreStar}`
  - `HC.EffectTimers.*`, `HC.RunTimers.*`, `HC.WorldSlots.*`, `HC.resetMetaOrbitMultipliers`
  - Wraps `resetWorld()` on `window.load` (adds run/slot resets + card pool reset).
- **Reads/Writes:**
  - Writes: `World.meteorStreams`, `World.runColorTimers`, `World.effectTimersByColor`, `World.fx*`, `World.forma*`, `World.metaOrbitMul*`, `World.cardsPool`, `World.totalCards`.
  - Reads: same fields to validate/ensure.
- **Events:** emits `EVENT_METEOR_SHOWER_START`, `EVENT_METEOR_SHOWER_END`, `PRESTAR_INTERRUPTED`.
- **DOM handlers:** `window.addEventListener("load", ...)`.
- **Timers:** none.

### `hc.view_input.codex.js`
- **Public API/globals:** `HC.View`, `HC.Input`, `HC.getView`, `HC.getInput`, `HC.initViewInput`, plus `window.getMaxPixelRatio`, `window.resizeCanvas`, `window.View`, `window.Input`.
- **Reads/Writes:** updates `Input`, `View` and pointer state.
- **Events:** none.
- **DOM handlers:** `pointerdown/pointermove/pointerup` on canvas; `resize` on window.
- **Timers:** none.

### `hc.camera.codex.js`
- **Public API/globals:** `HC.Camera`, `HC.getCamera`, `HC.screenToWorld`, `HC.getWorldViewBounds`, plus `window.Camera`, `window.screenToWorld`, `window.getWorldViewBounds`.
- **Reads/Writes:** updates camera zoom/epoch zoom; reads `View` dimensions.
- **Events/DOM/Timers:** none.

### `hc.render.codex.js`
- **Public API/globals:** `HC.Render.{frame,drawMeteor,drawPlanet,drawStar}`.
- **Reads/Writes:** reads `World` arrays (meteors/asteroids/planets/stars), `CardEngine.state.engineStats`, `View`, `Camera`, `Input`.
- **Events/DOM/Timers:** none.

### `hc.meteors.codex.js`
- **Public API/globals:** `HC.Meteors.{update,drawMeteor,spawnMeteor,spawnStreamMeteor}` + `window.MeteorColors`.
- **Reads/Writes:** `World.meteors`, `World.spawnTimer`, `World.spawnInterval`, `World.epoch`, `World.meteorStreams`, `World.pointerRadius/Strength/GlueDamp`, `World.meteorBounceEnabled`.
- **Events:** emits `METEOR_SPAWNED`.
- **DOM/Timers:** none.

### `hc.collisions.codex.js`
- **Public API/globals:** `HC.Collisions.resolve`.
- **Reads/Writes:** reads `World.meteors`, removes colliding meteors.
- **Events:** emits `METEOR_SAME_COLOR_COLLISION`, `METEOR_DIFF_COLOR_COLLISION`.
- **DOM/Timers:** none.

### `hc.asteroids.codex.js`
- **Public API/globals:** `HC.Asteroids.{capture,update}`, `window.spawnAsteroidFromCollision`.
- **Reads/Writes:** `World.asteroids`, `World.meteors`, `World.planets`, `World.pack01ReleaseBlock*`, `World.fxIntentBounceAsteroidPct`.
- **Events:** emits `ASTEROID_CREATED`, `ASTEROID_COLLAPSE_START`, `PLANET_CREATED`.
- **DOM/Timers:** none.

### `hc.planets.codex.js`
- **Public API/globals:** `HC.Planets.{capture,update,transformAsteroidIntoRockyPlanet}`, plus `window.buildColorWeightsFromOrbiters`, `window.buildBlobPatchwork`, `window.computeRockyParamsFromOrbiters`, `window.addPlanetRingMark`, `window.finalizePlanetSpawn`.
- **Reads/Writes:** `World.planets`, `World.asteroids`, `World.meteors`, `World.stars`, `World.pack01ReleaseBlock*`, `World.subMetaOpen`, `World.paused`, `World.subMetaShownThisRun`.
- **Events:** emits `STAR_BORN`, `PRESTAR_STARTED`; listens on `PLANET_CREATED`.
- **DOM/Timers:** none.

### `hc.stars_epoch.codex.js`
- **Public API/globals:** `window.startStarEpochZoomOut`, `window.reconcileStarOwnershipOnBirth`, `HC.Stars.update`, `HC.Stars.transformGasPlanetIntoStar` (delegates to planets).
- **Reads/Writes:** `World.stars`, `World.planets`, `World.asteroids`, `World.epoch*`, `World.metaOrbitMulStar`.
- **Events:** none.
- **DOM/Timers:** none.

### `hc.comets.codex.js`
- **Public API/globals:** `HC.Comets` + `window.Comets` API `{CONFIG, update, draw, resetSpawner, activateShower}`.
- **Reads/Writes:** `World.comets`, `World.meteors`, `World.asteroids`, `World.planets`, `World.stars`.
- **Events:** listens to `METEOR_SPAWNED`, `COMET_SHOWER`.
- **DOM/Timers:** none.

### `hc.ui_debug.codex.js`
- **Public API/globals:** `HC.UI.{init,update}`, `window.addScore`.
- **Reads/Writes:** `World.score`, `World.subMetaOpen`, `World.paused`.
- **Events:** none.
- **DOM handlers:** `click` on `#btnRestart`, `#btnSubMeta`.
- **Timers:** none.

### `cards.codex.js` (CardEngine)
- **Public API/globals:** `window.CardEngine` exposing `bindWorld`, `update`, `render`, `handlePointerDown`, `resetForNewRun`, `offerCardById`, `getTotalCardCount`, `recomputeTotalCards`, `resetCardPool`, `onCardCollected`, `onRunActivateR1`, `onRunActivateR2`, `onHitColor`, `getTargetLibrary`, `getTargetMeta`, etc.
- **Reads/Writes:** heavy writes to `World.cardsPool`, `World.pendingCard*`, `World.runColorTimers`, `World.forma*`, `World.metaSlots`, `World.subMetaOpen`, `World.sequence*`, `World.pack01ReleaseBlock*`.
- **Events:** emits `COMET_SHOWER` (via target handler).
- **DOM handlers:** none (pointer handled in view_input).
- **Timers:** none (uses time deltas only).

---

## D) Dead-code candidates (static analysis)

> Categories:
> 1) Directly used
> 2) Indirectly used (event/handler/console/global)
> 3) Probably dead
> 4) Uncertain/dynamic

| file | symbol | category | why dead | what could still call it | risk | wave |
| --- | --- | --- | --- | --- | --- | --- |
| hc.core.codex.js | `Events.off` | 3 | No call sites in source; `Events.on/emit` are used but `off` never referenced. | External console use or future code. | L | 1 |
| hc.util.codex.js | `Util.lerp` | 3 | No references outside `hc.util` (render has its own `lerp`). | External console use. | L | 1 |
| hc.util.codex.js | `Util.hypot` | 3 | No references outside `hc.util` (native `Math.hypot` used elsewhere). | External console use. | L | 1 |
| hc.util.codex.js | `Util.dist` | 3 | No references outside `hc.util`. | External console use. | L | 1 |
| hc.util.codex.js | `Util.easeInOutCubic` | 3 | No references outside `hc.util` (render has its own easing helpers). | External console use. | L | 1 |
| hc.world.codex.js | `HC.EffectTimers.*` | 3 | No call sites in source (only declared + internal helpers). | Future card effects / console debug. | M | 2 |
| hc.world.codex.js | `HC.WorldEvents.startMeteorShower` | 2 | Not called by runtime; only mentioned in manual test comment. | Console / debug tools. | M | 2 |
| hc.world.codex.js | `HC.WorldEvents.interruptPreStar` | 2 | Not called in runtime; only mentioned in manual test comment. | Console / debug tools. | M | 2 |
| cards.codex.js | `CardEngine.onRunActivateR2` | 3 | Exported but never referenced; body returns `false`. | Future UI or debug console. | M | 1 |
| cards.codex.js | `CardEngine.onRitualTrigger` | 3 | Stub with TODO, never referenced. | Future ritual system. | M | 2 |
| cards.codex.js | `CardEngine.openResetCardHub` | 3 | Stub with TODO, never referenced. | Future UI/flow. | M | 2 |
| hc.collisions.codex.js | Event `METEOR_SAME_COLOR_COLLISION` | 4 | Emitted but no listeners in source. | External listeners / future. | M | 2 |
| hc.collisions.codex.js | Event `METEOR_DIFF_COLOR_COLLISION` | 4 | Emitted but no listeners in source. | External listeners / future. | M | 2 |
| hc.asteroids.codex.js | Event `ASTEROID_CREATED` | 4 | Emitted but no listeners in source. | External listeners / future. | M | 2 |
| hc.asteroids.codex.js | Event `ASTEROID_COLLAPSE_START` | 4 | Emitted but no listeners in source. | External listeners / future. | M | 2 |
| hc.planets.codex.js | Event `PRESTAR_STARTED` | 4 | Emitted but no listeners in source. | External listeners / future. | M | 2 |
| hc.planets.codex.js | Event `STAR_BORN` | 4 | Emitted but no listeners in source. | External listeners / future. | M | 2 |
| hc.world.codex.js | Events `EVENT_METEOR_SHOWER_START/END`, `PRESTAR_INTERRUPTED` | 4 | Emitted but no listeners in source. | External listeners / future. | M | 2 |

> Note: many “exported” APIs are used via globals (`window.*`, `HC.*`) — they are treated as **indirectly used** even if not referenced by name within the same file.

---

## E) “Zombie state” list (reset but unused, or used but never set)

### Reset but unused (no reads in source)
- `World.r1Seq`, `World.r2Seq` — initialized in `resetWorld`, but no read sites.
- `World.colorStreakKey`, `World.colorStreakCount` — reset, never read.
- `World.trialPack01Active`, `World.trialPack01Color`, `World.trialPack01State` — reset, never read.

### Used but never set (or only set to defaults)
- `World.meteorBounceEnabled` — read by meteors update but only ever set to `false` in reset.
- `World.pack01ReleaseBlockColor`, `World.pack01ReleaseBlockUntilMs` — read by asteroid/planet capture; only defaulted/reset to null/0 in source. No runtime setter.
- `World.collectedCardsByColor`, `World.cardBank` — used only for migration in `CardEngine.ensureCardsPool`, but only initialized to empty defaults in reset. (Likely intended to be populated by external persistence.)

---

## F) Removal plan (3 waves, quarantine-first)

> **Rule:** do NOT delete now. If removing, quarantine first (move to clearly marked section or add tripwire logs/asserts at dispatch points). Only after explicit request.

### Wave 1 — 100% dead (no events/strings)
- `Events.off` in `hc.core.codex.js`.
- `HC.Util.lerp/hypot/dist/easeInOutCubic` in `hc.util.codex.js`.
- `CardEngine.onRunActivateR2` (stub returning `false`).

### Wave 2 — event/string/targets, quarantine first
- `HC.EffectTimers.*` (exposed API but no call sites).
- `HC.WorldEvents.startMeteorShower` + `HC.WorldEvents.interruptPreStar` (console/debug only).
- Event emissions with no listeners: `METEOR_*_COLLISION`, `ASTEROID_*`, `PRESTAR_STARTED`, `STAR_BORN`, `EVENT_METEOR_SHOWER_*`, `PRESTAR_INTERRUPTED`.
- `CardEngine.onRitualTrigger`, `CardEngine.openResetCardHub` (stubs).

### Wave 3 — high-risk (near boot/update loops or global state)
- Any removal touching boot helpers, `World` defaults, or card-migration fields (e.g., `World.cardBank`, `World.collectedCardsByColor`) without verifying persistence path.
- Any `World.*` field used by runtime but only defaulted in reset (e.g., `meteorBounceEnabled`) — requires runtime instrumentation first.

---

## G) Minimal manual test checklist (post-removal)

1. **Boot + render:** page loads, canvas visible, `FPS` updates.
2. **Input:** pointer drag still attracts meteors; no input errors.
3. **Core loop:** meteors spawn, collisions still create asteroids/planets, planets orbit.
4. **UI:** restart button works, META button opens overlay, card HUD renders.
5. **CardEngine:** R1 activations still trigger timers and overlays.
6. **Star epoch:** create a star; camera zoom + epoch flags set.
7. **Comets:** verify comet spawns + tails render; `COMET_SHOWER` still triggers via target.

