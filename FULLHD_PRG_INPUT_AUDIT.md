# Executive Summary

Audyt lokalnego checkoutu nie potwierdził ładowania innego runtime dla Full HD: `index.html` ma statyczną, jedną listę runtime JS, a Vite dopina ten sam `?v=<BUILD_ID>` do lokalnych skryptów `runtime/*.js`. WERSJONOWANIE WYKLUCZONE JAKO BEZPOŚREDNIA PRZYCZYNA na podstawie audytu statycznego oraz kontraktu bootstrapu.

Nie udało się automatycznie wykonać pomiarów live A-D ani wyszukiwania progu: środowisko nie ma przeglądarki, `playwright`/`puppeteer` nie są zainstalowane, a instalacja Playwright z registry zakończyła się `403 Forbidden`. Dlatego końcowy wynik to **G. BRAK WYSTARCZAJĄCYCH DOWODÓW** dla reprodukcji viewportowej.

Najbardziej podejrzany tor PRG jest jednak jednoznaczny w kodzie: `hc.view_input.js::toCanvasCoords()` zapisuje `clientY` w backing-store canvas, `game.boot.js::update()` mapuje `Input.y` przez `screenToWorld()`, `hc.world_render_snapshot.js::buildPrgIndicator()` tworzy logical PRG field, a `hc.world_renderer.js::syncPrgIndicatorPass()` renderuje go w Three bez dodatkowej korekty Y. Oświetlenie nie wybiera innego renderera; zależy od tych samych world/camera bounds używanych przez Three camera i stage spot, więc może mieć wspólny rozmiarowy stan wejściowy, ale nie zostało to potwierdzone live.

# Potwierdzone objawy

Źródło objawów: opis użytkownika. Audyt lokalny potwierdził miejsca, które mogą dawać objaw zależny od rozmiaru:

- PRG/input używa rozmiaru backing-store (`view.w`, `view.h`) oraz `view.dpr` obliczanego przy resize.
- Three camera i światło używają snapshot bounds zależnych od `View.w`, `View.h`, `Camera.zoom` i viewport aspect.
- Brak w aktywnych wskazanych plikach jawnego breakpointu `1920x1080`, który wybierałby legacy input, legacy layout lub inny renderer.

# Czy ładowany jest ten sam runtime

## Statyczna lista runtime

`index.html` ładuje jedną, nie-warunkową sekwencję lokalnych runtime JS:

- `runtime/hc.public_path.js`
- `runtime/hc.card_assets.js`
- `runtime/hc.content_data.js`
- `runtime/hc.asset_loader.js`
- `runtime/hc.save_system.js`
- `runtime/hc.submeta_settings.js`
- `runtime/hc.ui_typography.js`
- `runtime/hc.debug.js`
- `runtime/hc.visual_assets.js`
- `runtime/hc.frame_composer.js`
- `runtime/hc.card_visuals.js`
- `runtime/hc.submeta_layout.js`
- `runtime/hc.submeta_png.js`
- `runtime/hc.submeta_placeholders.js`
- `runtime/hc.submeta_panels.js`
- `runtime/hc.prg_frame_probe.js`
- `runtime/cards.js`
- `runtime/hc.hud_v2.js`
- `runtime/hc.hud_top_layout.js`
- `runtime/hc.core.js`
- `runtime/hc.util.js`
- `runtime/hc.world.js`
- `runtime/hc.space_bodies.js`
- `runtime/hc.collision_rules.js`
- `runtime/hc.impact.js`
- `runtime/hc.view_input.js`
- `runtime/hc.camera.js`
- `runtime/hc.meteors.js`
- `runtime/hc.render.js`
- `runtime/hc.harmonic_dust.js`
- `runtime/hc.cosmic_dust.js`
- `runtime/hc.collisions.js`
- `runtime/hc.asteroids.js`
- `runtime/hc.planets.js`
- `runtime/hc.world_render_snapshot.js`
- `./hc.three_module_bridge.js`
- `runtime/hc.world_renderer_diagnostics.js`
- `runtime/hc.world_renderer_diagnostics_snapshot.js`
- `runtime/hc.world_renderer.js`
- `runtime/hc.ui_debug.js`
- `runtime/game.boot.js`

## BUILD_ID / query

`vite.config.js` tworzy jeden `buildInfo.id` per uruchomienie dev servera i plugin `versionRuntimeScripts()` dopina `?v=<buildId>` do każdego `runtime/*.js`. To nie zależy od viewportu. Moduł `./hc.three_module_bridge.js` nie pasuje do regexu `runtime/*.js`, więc nie dostaje tego query tą funkcją.

## Wniosek

Nie ma w `index.html` ani `vite.config.js` ścieżki rozmiarowej wybierającej inną listę skryptów. Jeżeli pomiary live A i B pokażą identyczne `window.HC_BUILD_INFO.id` oraz identyczne URL-e runtime, należy traktować cache/stary plik jako wykluczone bez dalszych dowodów.

**WERSJONOWANIE WYKLUCZONE JAKO BEZPOŚREDNIA PRZYCZYNA** na podstawie aktywnego HTML/Vite contractu.

# Macierz testowa A–D

Automatyczne sterowanie viewportem nie było dostępne w tym kontenerze. Lokalne Vite uruchomiono przez `npm run dev` pod `http://localhost:5173/Haiku-Cosmos/`, ale brak przeglądarki uniemożliwił zebranie live `window.*`, computed styles i eventów pointer.

| Scenariusz | Status | Dane zebrane | Wniosek |
|---|---:|---|---|
| A: start 1280×720 | nie wykonano live | statyczny runtime/layout | brak potwierdzenia kierunku PRG |
| B: start 1920×1080 | nie wykonano live | statyczny runtime/layout | brak potwierdzenia progu |
| C: start 1280×720 → 1920×1080 | nie wykonano live | resize path w kodzie | `resizeCanvas()` i `WorldRenderer.resize()` istnieją |
| D: start 1920×1080 → 1280×720 | nie wykonano live | resize path w kodzie | brak dowodu cache wymiarów po starcie |

## Instrukcja ręcznego wykonania testu live

W konsoli DevTools po pełnej inicjalizacji wkleić snippet:

```js
(() => {
  const rectOf = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { rect: { x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,right:r.right,bottom:r.bottom,left:r.left }, offsetWidth: el.offsetWidth, offsetHeight: el.offsetHeight, clientWidth: el.clientWidth, clientHeight: el.clientHeight, scrollWidth: el.scrollWidth, scrollHeight: el.scrollHeight, transform: cs.transform, scale: cs.scale, position: cs.position, inset: cs.inset, top: cs.top, right: cs.right, bottom: cs.bottom, left: cs.left };
  };
  const canvasMetrics = [...document.querySelectorAll('canvas')].map((canvas) => ({ id: canvas.id, width: canvas.width, height: canvas.height, clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight, rect: rectOf(canvas), computed: { width: getComputedStyle(canvas).width, height: getComputedStyle(canvas).height, transform: getComputedStyle(canvas).transform, transformOrigin: getComputedStyle(canvas).transformOrigin }}));
  return {
    viewport: { innerWidth, innerHeight, outerWidth, outerHeight, docClientWidth: document.documentElement.clientWidth, docClientHeight: document.documentElement.clientHeight },
    visualViewport: window.visualViewport ? { width: visualViewport.width, height: visualViewport.height, scale: visualViewport.scale } : null,
    dpr: devicePixelRatio,
    screen: { width: screen.width, height: screen.height, availWidth: screen.availWidth, availHeight: screen.availHeight },
    buildInfo: window.HC_BUILD_INFO || null,
    releaseBootstrap: window.HC_RELEASE_BOOTSTRAP || null,
    documentUrl: location.href,
    loadedScripts: performance.getEntriesByType('resource').filter(e => /\/runtime\/|hc\.three_module_bridge/.test(e.name)).map(e => e.name),
    renderMode: window.HC?.RENDER_MODE || null,
    renderer: window.HC?.WorldRenderer?.getDiagnostics?.() || null,
    subMetaMode: { png: !!window.HC?.SubMetaPng, placeholders: !!window.HC?.SubMetaPlaceholders, panels: !!window.HC?.SubMetaPanels },
    hudMode: { hudTop: !!window.HC?.HUDTopLayout, hudV2: !!window.HC?.HUDV2 },
    prgMode: { harmonicDust: !!window.HC?.HarmonicDust?.getPrgActionField, snapshot: window.HC?.WorldRenderSnapshot?.build?.({World:window.World, Camera:window.Camera, View:window.View, Input:window.Input})?.world?.prgIndicator || null },
    activeMediaQueries: ['(pointer: coarse)','(min-width: 1280px)','(min-width: 1366px)','(min-width: 1536px)','(min-width: 1920px)','(min-height: 1080px)','(aspect-ratio: 16/9)'].map(q => [q, matchMedia(q).matches]),
    domClasses: { html: document.documentElement.className, body: document.body.className },
    canvasMetrics,
    prgMetrics: rectOf(document.querySelector('[data-prg], #prg, .prg, #gameCanvas')),
    hudMetrics: rectOf(document.getElementById('hudTopStage') || document.getElementById('topBar')),
    subMetaMetrics: rectOf(document.getElementById('subMetaPngStage') || document.getElementById('subMetaPngOverlay')),
    camera: window.Camera || null,
    lights: window.HC?.WorldRenderer?.getDiagnostics?.()?.threeLights || window.HC?.WorldRenderer?.getDiagnostics?.()?.lightDistanceDiagnostics || null,
    pointerTransform: window.Input || null,
    cachedLayoutValues: { View: window.View, lastViewportDiagnostics: window.HC?.lastViewportDiagnostics || null }
  };
})()
```

# Próg wystąpienia błędu

Nie potwierdzono progu live. Statyczne progi znalezione w aktywnych plikach nie wskazują jednoznacznego przełącznika błędu przy `1920×1080`:

- `hc.hud_top_layout.js`: stage HUD `1920×150`, skala `min(viewport.width / stage.width, viewport.height / stage.height)`; przy szerokości 1920 skala osiąga 1.
- `index.html`: SUB-META stage `aspect-ratio: 1536 / 1024` oraz `width: min(100vw, 150vh)`; przy 1920×1080 szerokość stage to 1620, nie 1920.
- `hc.view_input.js`: DPR cap `Math.min(dpr, 2.0)` desktop / `1.5` mobile, bez progu Full HD.
- `hc.world_renderer.js`: camera scene rect dopasowywany do viewport aspect, bez progów 1200–1920.

Wynik progu: **nieustalony**. Minimalny wymiar wywołujący błąd wymaga ręcznego lub browser-automated testu live według macierzy użytkownika.

# Breakpointy i warunki rozmiaru

| Plik:linia | Warunek / wartość | Obszar | Init-only? | Resize? | Wpływ runtime |
|---|---|---|---:|---:|---|
| `hc.view_input.js:20-23` | `devicePixelRatio`, `matchMedia('(pointer: coarse)')`, mobile UA, cap 1.5/2.0 | input/canvas | nie | tak, przez `applyResize()` | zmienia backing-store i `view.dpr`; nie odwraca Y |
| `hc.view_input.js:118-129` | `canvas.getBoundingClientRect()`, fallback `innerWidth/innerHeight/clientWidth/clientHeight` | input/canvas/worldScale | nie | tak | przelicza `canvas.width/height`, `view.w/h`, `worldScale` |
| `hc.view_input.js:161-167` | `resize`, `ResizeObserver` | canvas/input | init listener | tak | ponownie odpala `applyResize()` |
| `hc.camera.js:52-60` | `view.w/h`, `Camera.zoom`, `Camera.x/y` | camera/input/world | nie | pośrednio | mapuje screen/backing-store → world, Y bez negacji |
| `game.boot.js:591-598` | `screenToWorld(Input.x, Input.y)` per update | PRG/input | nie | tak po zmianie View | aktualizuje `Input.wx/wy` co frame |
| `hc.world_render_snapshot.js:387-410` | `View.worldScale`, `Input.wx/wy`, `Input.pointerDown` | PRG snapshot | nie | tak | PRG field w world coords |
| `hc.world_renderer.js:941-979` | `viewportAspect` vs scene aspect | renderer/camera/light | nie | tak | dopasowuje scene rect do aspect; może zmienić światło |
| `hc.world_renderer.js:1050-1083` | scene rect width/height + light offsets | oświetlenie | nie | tak przez `syncThreeLights()` | pozycja światła zależy od bounds |
| `hc.world_renderer.js:1257-1278` | canvas rect / `innerWidth/innerHeight` / DPR | renderer/canvas | nie | tak, każdy render | przelicza Three canvas i kamerę |
| `index.html:467-476` | SUB-META CSS `width:min(100vw,150vh)`, aspect 1536/1024 | SUB-META | CSS | automatycznie | tylko overlay; nie powinno wpływać na PRG world |
| `hc.hud_top_layout.js:119-124` | `innerWidth/innerHeight`, stage 1920×150 | HUD | nie | tak przez applyLayout listener | HUD scale, nie PRG world |

Nie znaleziono aktywnego `@media`, `@container`, `matchMedia` ani `1920/1080` przełączającego renderer, PRG mode, legacy input lub fallback mechaniki.

# Przepływ współrzędnych PRG

1. **Browser event → client space**  
   `pointermove/pointerdown` dostarcza `e.clientX`, `e.clientY` w CSS px.

2. **Client space → element-local CSS space**  
   `toCanvasCoords(e)`:
   - `localX_css = e.clientX - rect.left`
   - `localY_css = e.clientY - rect.top`

3. **Element-local CSS space → canvas backing-store space**  
   `toCanvasCoords(e)`:
   - `Input.x = localX_css * view.dpr`
   - `Input.y = localY_css * view.dpr`

4. **Canvas backing-store space → world space**  
   `screenToWorld(x,y)`:
   - `sx = view.w * 0.5`
   - `sy = view.h * 0.5`
   - `wx = (x - sx) / zoom + camX`
   - `wy = (y - sy) / zoom + camY`
   Brak `height - y`, `1 - y`, `-y` w input path.

5. **World space → PRG logical field**  
   `buildPrgIndicator()` / `HarmonicDust.getPrgActionField()`:
   - `field = { x: Input.wx, y: Input.wy, radius: View.worldScale * World.pointerRadius * pointer_radius_mul }`

6. **PRG logical field → Three render**  
   `syncPrgIndicatorPass()`:
   - `pos = applyRenderSpaceToVector(indicator.x, indicator.y, z)`
   - `line.position = pos`
   - `line.scale = radius`
   `applyRenderSpaceToVector()` zwraca Y bez negacji.

7. **PRG logical field → Canvas2D render**  
   `drawPointerRing()`:
   - `ctx.arc(indicator.x, indicator.y, indicator.radius, 0, TAU)`

## Operacje odwracające Y

Znalezione istotne odwrócenia/kontrakty Y:

- `hc.world_renderer.js:1146-1177`: OrthographicCamera dostaje `top` i `bottom` z world bounds. Ponieważ world bounds są w osi ekranowej Y-down (`top < bottom`), kamera Three celowo pracuje na odwróconym pionie względem standardowego Three Y-up.
- `hc.world_renderer.js:1240-1242` i `3939-3942`: diagnostyczne screen estimate używa `sy = (bounds.top - y) / abs(top-bottom) * viewport.height`. Przy Y-down bounds to daje malejące `sy` dla rosnącego `y`; to jest odwrócenie w diagnostyce, nie w PRG render path.
- Brak odwrócenia w `toCanvasCoords`, `screenToWorld`, `buildPrgIndicator`, `syncPrgIndicatorPass`.

Nie potwierdzono podwójnego odwrócenia osi Y w aktywnym PRG path. Potencjalne ryzyko: mieszanie world Y-down z Three camera/projection oraz diagnostycznymi wzorami Y-up.

# Porównanie viewport/canvas/stage

## Zależności

- `gameCanvas` CSS: `position: fixed; inset:0; width:100vw; height:100vh`.
- Backing-store: `canvas.width = floor(cssW * view.dpr)`, `canvas.height = floor(cssH * view.dpr)`.
- `View.worldScale = min(view.w, view.h)` zależy od backing-store, nie CSS px.
- Three canvas rozmiar: `setPixelRatio(dpr)`, `setSize(cssW, cssH, false)`.
- HUD top stage: stage 1920×150 skalowany do viewportu.
- SUB-META stage: CSS aspect 3:2, ograniczony przez `100vw` i `150vh`.

## Możliwe mieszanie przestrzeni

- Input używa CSS rect × DPR → backing-store.
- Camera używa backing-store `view.w/h`.
- Three renderer używa CSS size i DPR, ale kamera używa world bounds z backing-store snapshotu.
- Light uses fitted scene rect from camera/world bounds, więc rozmiar backing-store i aspect mogą zmieniać pozycję światła bez zmiany renderer mode.

# Kolejność inicjalizacji i resize

Ustalona kolejność z aktywnego kodu:

1. `index.html` tworzy `<canvas id="gameCanvas">`.
2. `hc.view_input.js` definiuje `HC.initViewInput`.
3. `hc.camera.js` definiuje `screenToWorld` i `Camera`.
4. `hc.world_renderer.js` definiuje adapter.
5. `game.boot.js` pobiera canvas/ctx i ustawia `HC.RENDER_MODE='three'`, jeśli brak.
6. `game.boot.js` wywołuje `HC.initViewInput({canvas, ctx, CardEngine})`.
7. `initViewInput()` rejestruje pointer/resize/ResizeObserver i natychmiast wykonuje `applyResize()`.
8. `game.boot.js` dodatkowo wywołuje `window.resizeCanvas()`, jeśli istnieje, co planuje kolejny resize przez RAF.
9. `game.boot.js` inicjalizuje UI.
10. `game.boot.js` inicjalizuje `WorldRenderer.init({mode: HC.RENDER_MODE || 'three'})`.
11. `WorldRenderer.initThree()` przy pierwszym renderze tworzy Three canvas/camera/lights i wywołuje `resize()` bez snapshotu.
12. W każdym RAF: camera update → input world coords → snapshot → `WorldRenderer.render()` → `WorldRenderer.resize(renderSnapshot)` → passy świata/PRG → UI update.

## Cache wymiarów

Nie znaleziono wartości PRG zależnych od viewportu cache’owanych tylko raz i używanych po resize bez aktualizacji. `Input.x/y` są aktualizowane przez pointer event, `Input.wx/wy` co frame, `View.w/h/dpr/worldScale` przez resize. Podejrzany stan init-only dotyczy jedynie pierwszego `WorldRenderer.resize()` bez snapshotu, ale kolejne render calls powinny nadpisać bounds snapshotem.

# Porównanie oświetlenia

Stałe domyślne Three lights:

- ambient: `0.10`
- main stage spot intensity: `4.2`
- angle: `Math.PI / 2.8`
- penumbra: `0.72`
- distance: `0`
- decay: `0`
- X offset: `-0.35`
- Y offset: `0.35`
- Z height: `0.75`

Oświetlenie nie ma warunku `1920×1080`, ale jego pozycja zależy od scene rect:

- `lightX = centerX + xRightSign * width * offsetX`
- `lightY = centerY + yDownSign * height * offsetY`
- `lightZ = max(32, height * zHeight)`

`sceneRect` pochodzi z camera/world bounds i jest dopasowywany do viewport aspect. To oznacza, że wizualna różnica światła może być skutkiem innego rozmiaru/backing-store/fit scene rect, nie innego runtime. **WSPÓLNA PRZYCZYNA** z PRG pozostaje hipotezą, ponieważ oba tory czytają `View`/camera bounds, ale brak pomiaru live uniemożliwia potwierdzenie.

# Wpływ DevTools

Nie wykonano live wariantów DevTools. Mechanizm prawdopodobny do sprawdzenia: zadokowane DevTools zmieniają `innerWidth`, `innerHeight`, `visualViewport.width/height`, a kod reaguje przez `resize` i `ResizeObserver`. Nie ma dowodu, że otwarcie DevTools działa przez cache.

Ręczny test: porównać snapshot z instrukcji przy DevTools zadokowanych po prawej, na dole, w osobnym oknie i zamkniętych. Jeżeli zmieniają się tylko viewport/visualViewport, a runtime URL/BUILD_ID pozostaje identyczny, poprawa wynika ze zmiany rozmiaru.

# Jednoznaczna przyczyna

**Wynik: G. BRAK WYSTARCZAJĄCYCH DOWODÓW.**

Powód: brak live reprodukcji A-D i brak potwierdzonego minimalnego progu viewportu. Audyt kodu wyklucza jawny rozmiarowy wybór legacy runtime/renderer, ale nie wystarcza do wskazania kategorii A-F bez pomiarów browserowych.

Najbliższe techniczne podejrzenie do następnego passu: **E/B jako hipoteza robocza**, czyli niespójność CSS/backing-store/world/camera bounds albo stan pierwszej inicjalizacji Three/camera/light. Nie oznaczono jako wynik końcowy, bo nie zostało zmierzone.

# Dokładne miejsca do późniejszej poprawki

| Plik | Funkcja | Linie | Obecne zachowanie | Oczekiwane zachowanie |
|---|---|---:|---|---|
| `hc.view_input.js` | `toCanvasCoords` | 140-146 | klient CSS px mnożony przez `view.dpr`; brak diagnostyki źródła rect/DPR | zachować jeden kontrakt CSS→backing; dodać przyszłe testy/asserty bez zmiany mechaniki |
| `hc.camera.js` | `screenToWorld` | 52-60 | Y rośnie w dół, brak negacji | jawnie udokumentować Y-down world albo wprowadzić jeden adapter dla Three |
| `game.boot.js` | `update` | 587-598 | co frame zapisuje `Input.wx/wy` z aktualnego `View`/Camera | po poprawce upewnić się, że po resize nie zostaje stary `Input`/Camera state |
| `hc.world_render_snapshot.js` | `buildPrgIndicator` | 387-410 | PRG bierze `Input.wx/wy` i `View.worldScale` | dodać debug snapshot transformu PRG, bez zmiany runtime w tym audycie |
| `hc.world_renderer.js` | `applyThreeCameraSnapshot` | 1140-1195 | Three camera używa world bounds z Y-down top/bottom | potwierdzić, czy projection i PRG visual mają ten sam Y-origin przy każdym viewport |
| `hc.world_renderer.js` | `resize` | 1257-1278 | Three canvas bierze CSS size, DPR i snapshot viewport | sprawdzić/ujednolicić CSS/backing-store/world bounds po live dowodzie |
| `hc.world_renderer.js` | `updateStageSpotForAbsoluteBounds` | 1050-1072 | światło liczone z tych samych bounds co kamera | po naprawie PRG sprawdzić, czy light rect nadal zgodny |
| `hc.world_renderer.js` | `syncPrgIndicatorPass` | 4338-4359 | PRG renderuje indicator.x/y bez korekty Y | nie odwracać na ślepo; najpierw potwierdzić, czy input czy renderer wymaga adaptera |

# Ryzyka poprawki

- Naprawa przez proste `height - y` może wprowadzić podwójne odwrócenie w Canvas2D albo Three.
- Zmiana camera bounds może zmienić oświetlenie, spawn bounds i diagnostykę obiektów.
- Ujednolicenie CSS/backing-store może zmienić promień PRG, bo `View.worldScale` jest backing-store dependent.
- Fix tylko dla 1920×1080 ukryje problem przy innych DPR/aspect/DevTools.

# Minimalny plan naprawczy

1. Najpierw wykonać live matrix A-D i próg z podanym snippetem.
2. Jeżeli runtime URL/BUILD_ID identyczne, utrzymać wykluczenie wersjonowania.
3. Zmierzyć `Input.y`, `Input.wy`, `prgIndicator.y`, `prgIndicatorLine.position.y` przy dwóch ruchach pointera w dół.
4. Jeżeli `Input.wy` rośnie, a visual PRG idzie w górę: poprawka w Three render/projection adapterze.
5. Jeżeli `Input.wy` maleje przy ruchu w dół: poprawka w input/rect/DPR path.
6. Po poprawce porównać `stageSpotSceneRect`, `mainStageSpot.position`, `cameraBounds` A/B/C/D.

# Testy i checks

- `git status --short` przed pracą: clean.
- `npm run dev`: uruchomiony lokalny Vite, predev zsynchronizował runtime do `public/runtime/` bez pozostawienia zmian w git.
- `npm.cmd run test`: nie wykonano w Linux, `npm.cmd: command not found`.
- `npm run test`: 15/15 pass.
- `node --check game.boot.js`: pass.
- `node --check cards.js`: pass.
- `node --check hc.prg_frame_probe.js`: pass.
- `node --check hc.view_input.js`: pass.
- `node --check hc.camera.js`: pass.
- `node --check hc.world_renderer.js`: pass.
- `node --check hc.ui_debug.js`: pass.
- `git diff --check`: pass.
