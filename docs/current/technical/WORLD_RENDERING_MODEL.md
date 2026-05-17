> Status: ROBOCZY / KONTRAKT TECHNICZNY RENDERINGU ŚWIATA
> Obszar: model renderowania świata RUN (warstwa renderingu, bez zmian mechaniki)
> Źródło prawdy: NIE (dokument roboczy do migracji etapowej)
> Ostatnia aktualizacja: 2026-05-17
> Powiązane dokumenty: WORLD_FUNCTION_MAP.md, ../ui/UI_WORLD.md, ../systems/PRG_SYSTEM.md, ../visual/ART_DIRECTION.md, ../visual/KOSMOLOGIA_WIZUALNA.md, ../visual/BIBLIOTEKA_MATERIALOW.md

# Haiku Cosmos — WORLD RENDERING MODEL

## 1. Cel nowego modelu renderowania

Celem jest wprowadzenie nowego modelu renderowania świata RUN, docelowo opartego o Three.js/WebGL, przy zachowaniu aktualnej mechaniki gry, ekonomii RP, sekwencji kart oraz logiki PRG/SUB-META.

Nowy model ma:
- oddzielić renderowanie od symulacji świata,
- umożliwić GPU-first warstwy tła/pyłu/glow/rezonansu,
- zachować kompatybilność z aktualnym runtime i fallbackiem do Canvas2D.

## 2. Dlaczego zmiana dotyczy renderingu, a nie mechaniki

Zakres tej migracji obejmuje wyłącznie warstwę prezentacji świata (render pipeline). Nie obejmuje zmian logiki w:
- `cards.js` (CardEngine, sekwencje, decyzje, timery),
- ekonomii RP,
- regułach capture/collision/spawn,
- zachowaniu PRG jako systemu mechanicznego,
- SUB-META/META jako overlayów UI.

Mechanika pozostaje source-of-truth. Renderer otrzymuje dane i rysuje ich aktualny stan.

## 3. Aktualny model runtime (init → update → render → UI)

Obecny loop runtime (stan na 2026-05-17):

1. **Init/boot** (`index.codex.html` + `game.boot.js`):
   - ładowanie modułów,
   - init `View/Input/Camera/World`,
   - bind `CardEngine` do `World`,
   - init modułów `HC.*`,
   - `resetWorld()`.

2. **Update** (`game.boot.js`):
   - `Camera.update`,
   - mapowanie inputu screen→world,
   - update modułów świata (`Meteors`, `Comets`, `Collisions`, `Asteroids`, `Planets`, `Stars`),
   - `CardEngine.update`.

3. **Render**:
   - `HC.Render.frame(now, dt)` rysuje świat na canvasie 2D.

4. **UI overlay**:
   - `HC.UI.update(dt, now)`,
   - `CardEngine.render(ctx, view.w, view.h)` rysuje HUD/karty/SUB-META.

## 4. Obecne źródła danych runtime dla renderingu

Warstwa renderingu świata i powiązane wejścia aktualnie czytają/przetwarzają głównie:

- **World collections:**
  - `World.meteors`,
  - `World.asteroids`,
  - `World.planets`,
  - `World.stars`,
  - `World.comets`.

- **Camera/View/Input:**
  - `Camera` (`zoom`, `x`, `y`, `target`, `epochZoom`),
  - `View` (`w`, `h`, `worldScale`),
  - `Input` (`x`, `y`, `wx`, `wy`, `pointerDown`).

- **CardEngine / UI signals (powiązane, ale nie własność renderera świata):**
  - sekwencje i ich stan (źródło prawdy w `CardEngine.state.sequence`),
  - stany overlay/HUD/SUB-META,
  - timery, które wpływają na mechanikę i pośrednio na wygląd (np. aktywacje kolorów).

## 5. Docelowy podział odpowiedzialności

### 5.1. Poza Three.js (bez zmian odpowiedzialności)
- `World` + mechanika/fizyka (`hc.*` update/capture/collisions/spawn),
- `CardEngine` i ekonomia,
- sekwencje, decyzje, timery,
- logika PRG jako system gameplayowy.

### 5.2. W Three.js (nowa odpowiedzialność renderera)
- render świata RUN na podstawie danych wejściowych (snapshot),
- warstwy GPU/WebGL: tło, pył, parallax, glow, resonance FX,
- rysowanie obiektów świata (meteory/asteroidy/planety/gwiazdy/komety) bez przejmowania ich logiki.

### 5.3. Overlayy poza rendererem świata
- HUD, SUB-META, META pozostają overlayem (DOM/canvas UI),
- brak przenoszenia SUB-META/HUD do Three.js.

### 5.4. PRG jako warstwa premium visual
- PRG behavior mechaniczny bez zmian,
- ewentualna warstwa wizualna PRG ring/resonance może być renderowana jako osobny visual layer (GPU),
- bez zmiany reguł osi PRG ani kosztów.

## 6. Proponowana architektura adaptera

### 6.1. Interfejs
Wprowadzić adapter renderera świata:
- `HC.WorldRenderer` (interfejs), lub
- `HC.ThreeWorldRenderer` (implementacja Three.js),
- z kompatybilnym legacy adapterem do `HC.Render`.

### 6.2. Feature flag
Wprowadzić globalny tryb np.:

```js
RENDER_MODE = "canvas2d" | "three"
```

- `canvas2d` → obecny `HC.Render` (fallback/default),
- `three` → nowy adapter Three.js.

### 6.3. Fallback i niezmienność gameplay
- fallback do starego `HC.Render` pozostaje dostępny,
- brak zmian: sekwencje, karty, ekonomia, SUB-META flow, PRG behavior.

## 7. Model danych wejściowych dla renderera

Renderer świata nie powinien czytać bezpośrednio całego global state „na żywo”, tylko otrzymywać uporządkowane wejście:

1. **World snapshot**
   - listy obiektów renderowalnych + pola potrzebne do wizualizacji,
   - bez mutowania logiki przez renderer.

2. **Camera snapshot**
   - pozycja/zoom/projekcja,
   - mapowanie world↔screen spójne z inputem.

3. **Render settings**
   - quality/perf tier,
   - toggles warstw (tło, pył, glow, resonance),
   - ewentualne parametry materiałów/shaderów.

4. **Debug settings**
   - wizualizacja bounds/anchors,
   - diagnostyka warstw, draw calls, fallback state.


## 8. Render snapshot contract (Etap 0.5)

### 8.1. Ogólna zasada snapshotu
- Snapshot jest **read-only** dla renderera.
- Renderer świata **nie mutuje** `World` ani żadnych struktur gameplay.
- Snapshot jest budowany **przed renderem** i przekazywany do adaptera jako wejście.
- Snapshot stanowi **granicę symulacja ↔ prezentacja**: update/mechanika po jednej stronie, draw/FX po drugiej.

### 8.2. CameraSnapshot
Minimalny kontrakt kamery dla renderera:
- `center`: pozycja środka kamery w world-space (`x`, `y`),
- `zoom`: aktualna skala,
- `viewport`: szerokość/wysokość viewportu renderera,
- `worldBounds`: aktualne granice widoku świata (`l`, `r`, `t`, `b`, `cx`, `cy`),
- kompatybilność transformacji `screen↔world` z istniejącym `screenToWorld` / `getWorldViewBounds`.

Uwaga krytyczna: CameraSnapshot musi pozostać spójny z inputem i hit-testem, żeby klik/drag trafiał w te same obiekty, które użytkownik widzi.

### 8.3. WorldRenderSnapshot (top-level)
Minimalna struktura wejścia renderera świata:
- `meteors[]`
- `comets[]`
- `asteroids[]`
- `planets[]`
- `stars[]`
- `prg`
- `background`
- `sequenceVisualSignals` (tylko jeśli potrzebne jako sygnały wizualne)
- `debug`

### 8.4. Object snapshot fields (minimum)
Dla każdego typu obiektu (meteor/kometa/asteroida/planeta/gwiazda):
- `id` lub inny stabilny `renderKey` (jeśli brak, temat do dopięcia przed etapem 1),
- `kind` / `class` obiektu,
- pozycja `x`, `y`,
- `radius` i/lub `scale`,
- `color` i/lub `colorKey`,
- `velocity` / `direction` (jeśli renderer potrzebuje do smug/interpolacji/afterimage),
- `visualWeight` (np. do glow/intensywności warstw),
- `alpha` / `life` / `state` (jeśli istnieją w runtime i są potrzebne wizualnie),
- `flags` / `state` wyłącznie jako **visual state**, bez przejmowania mechaniki.

### 8.5. PRG snapshot
Warstwa visual PRG może otrzymać:
- `pointer` / world center,
- `radius`,
- aktywny tryb i oś kolorystyczną (`activeMode`, `colorAxis`),
- `strength` / `intensity`,
- `visualMood`.

Kontrakt graniczny: PRG visual **nie decyduje** o zachowaniu obiektów — tylko reprezentuje aktualny stan mechaniki.

### 8.6. Sequence/UI signals boundary
Renderer świata może czytać tylko sygnały wizualne, np.:
- resonance pulse,
- flash / halo,
- active color accents.

Granica obowiązkowa:
- brak rysowania HUD,
- brak rysowania kart,
- brak rysowania SUB-META/META.

### 8.7. RenderSettings
Minimalne ustawienia renderingu:
- `qualityTier` (np. low/medium/high),
- `enabledLayers`: background, dust, glow, objects, prg, debug,
- `fallbackBehavior` (jak renderer reaguje na brak warstw/assetów/shaderów i kiedy przełącza tryb).

### 8.8. DebugSettings
Minimalny zakres debug overlay dla renderera świata:
- world bounds,
- world grid,
- camera bounds,
- object ids / render keys,
- draw-call / perf info,
- marker fallback mode (`canvas2d` vs `three`).

### 8.9. Open questions przed Etapem 1
- Czy snapshot builder powinien być osobnym modułem (np. `hc.world_render_snapshot.js`)?
- Czy interfejs adaptera trzymać w `hc.world_renderer.js`?
- Gdzie trzymać feature flag (`RENDER_MODE`) — config globalny, bootstrap, czy osobny runtime config?
- Jak ładować Three.js: lokalnie/vendor czy CDN (dev-only)?
- Czy canvas Three.js zastępuje obecny canvas świata, czy działa jako drugi canvas pod overlay UI?

## 9. Adapter bootstrap contract (Etap 0.75)

### 9.1. Cel adapter bootstrap contract
Celem Etapu 0.75 jest zamknięcie decyzji architektonicznych otwartych po Etapie 0.5 i przygotowanie bezpiecznego wejścia w Etap 1 bez zmian mechaniki oraz bez zmian zachowania runtime gameplay.

Kontrakt Etapu 0.75:
- definiuje granicę snapshot builder ↔ renderer adapter,
- definiuje minimalny interfejs renderera świata,
- utrzymuje obowiązkowy fallback `canvas2d`,
- utrzymuje separację świata RUN od overlay UI (HUD/SUB-META/META).

### 9.2. Snapshot builder module
Docelowy moduł: `hc.world_render_snapshot.js`.

Rola modułu:
- buduje **read-only** `RenderSnapshot` przed renderem,
- jest granicą między symulacją a prezentacją,
- nie mutuje `World`,
- nie zmienia `CardEngine`,
- nie liczy mechaniki (sekwencje/RP/PRG rules/collision/spawn),
- normalizuje dane wejściowe dla renderera świata (`canvas2d` lub `three`).

Status decyzji: moduł snapshot builder jest wymaganym elementem bootstrapu Etapu 1.

### 9.3. Renderer adapter module
Docelowy moduł: `hc.world_renderer.js`.

Rola modułu:
- definiuje neutralną fasadę renderera świata,
- umożliwia przełączanie implementacji `canvas2d` / `three`,
- nie zna mechaniki kart i nie dotyka `CardEngine` logic,
- nie renderuje HUD/SUB-META/META.

Warianty implementacji pod tym samym kontraktem:
- `canvas2d` → adapter legacy oparty o obecny `HC.Render`,
- `three` → przyszły `HC.ThreeWorldRenderer`.

### 9.4. Minimal renderer interface
Minimalny kontrakt adaptera renderera świata:
- `init(options)`
- `resize(viewport)`
- `render(renderSnapshot, nowMs, dt)`
- `destroy()`
- `getDiagnostics()`

Zasady interfejsu:
- `render(...)` przyjmuje wyłącznie snapshot i parametry czasu,
- brak side-effectów w warstwie mechaniki,
- `getDiagnostics()` służy observability/debug (np. mode, layer state, fallback state).

### 9.5. Render mode / feature flag
Docelowy tryb:
- `renderMode: "canvas2d" | "three"`

Zasady:
- default: `"canvas2d"`,
- `"canvas2d"` używa obecnego `HC.Render` jako bezpiecznego fallbacku,
- `"three"` używa przyszłego `HC.ThreeWorldRenderer`,
- brak/niepoprawny tryb nie może blokować uruchomienia gry,
- fallback `canvas2d` musi być dostępny na każdym etapie migracji.

Rekomendowane lokalizacje flagi (do audytu w Etapie 1):
- `HC.RENDER_MODE`,
- `World.renderMode`,
- runtime/debug config.

Decyzja implementacyjna o finalnym miejscu flagi zostaje domknięta w Etapie 1 po krótkim audycie boot/runtime.

### 9.6. Three.js loading strategy
Decyzja kierunkowa:
- docelowo Three.js jest ładowany lokalnie, jako repo-controlled dependency,
- CDN jest dopuszczalny wyłącznie jako jawnie oznaczony fallback dev/prototype,
- runtime production nie może zależeć od zewnętrznego CDN.

Ryzyka adresowane przez strategię:
- stabilność offline/dev,
- kontrola wersjonowania i reprodukowalność,
- cache invalidation i deterministyczność build/run,
- różnice środowiskowe (lokalnie/CI/hosting),
- kolejność ładowania skryptów w `index.codex.html` (szczególnie przy bootstrapie adaptera).

### 9.7. Canvas/layer strategy
Decyzja dla Etapu 1/2:
- preferowany jest osobny canvas/layer dla Three.js **albo** kontrolowany world-render canvas pod overlay UI,
- HUD/SUB-META/META pozostają nad warstwą świata,
- overlay UI nie może zostać wciągnięty do Three.js,
- fallback `canvas2d` pozostaje aktywną ścieżką.

Finalne zastąpienie obecnego canvasu świata może zostać rozważone dopiero po walidacji Etapu 2/3.

### 9.8. Fallback and rollback rules
Reguły bezpieczeństwa migracji:
- `canvas2d` jest zawsze ścieżką startową i rollbackową,
- awaria inicjalizacji `three` automatycznie przełącza render na `canvas2d`,
- brak assetu/warstwy/shadera nie może zatrzymać loopa gry,
- rollback dotyczy wyłącznie warstwy renderingu świata (bez zmian mechaniki i UI overlay),
- każda iteracja Etapu 1+ musi być odwracalna do stanu `canvas2d`.

### 9.9. Etap 1 readiness checklist
Warunki wejścia do Etapu 1:
- [x] snapshot builder opisany,
- [x] adapter interface opisany,
- [x] `renderMode` opisany,
- [x] fallback `canvas2d` opisany,
- [x] Three.js loading strategy opisana,
- [x] overlay boundary opisana,
- [x] brak zmian w mechanice,
- [x] brak przejęcia HUD/SUB-META/META przez renderer świata.

## 10. Etapowanie migracji

- **Etap 0 — docs/audit**
  - audyt runtime i kontrakt dokumentacyjny (ten dokument).

- **Etap 1 — pusty adapter + feature flag**
  - integracja interfejsu renderera,
  - wybór trybu `canvas2d|three`,
  - bez zmiany outputu gameplayowego.

- **Etap 2 — Three.js scene/camera/renderer (bez obiektów gameplay)**
  - init sceny, render loop, lifecycle,
  - pusta scena + test fallbacku.

- **Etap 3 — tło/pył/parallax**
  - GPU background layers,
  - bez obiektów mechanicznych.

- **Etap 4 — meteory**
  - render meteorów ze snapshotu.

- **Etap 5 — asteroidy/planety/gwiazdy**
  - stopniowe odwzorowanie obiektów świata,
  - zachowanie kolejności i czytelności.

- **Etap 6 — PRG ring i resonance effects**
  - warstwa premium visual,
  - bez zmiany zachowania osi PRG.

- **Etap 7 — optymalizacja/fallback/testy**
  - profilowanie,
  - testy kompatybilności,
  - walidacja regressions i plan rollbacku.

## 11. Ryzyka

1. Rozjazd układów współrzędnych screen/world.
2. Inny model kamery i projekcji vs. aktualne `screenToWorld`/`getWorldViewBounds`.
3. Rozjazd hit-test/input względem renderu.
4. Ryzyko wciągnięcia UI overlay do renderera świata (naruszenie kontraktu UI).
5. Performance przy dużej liczbie obiektów.
6. Kolejność renderowania i przezroczystości (alpha/blending/depth).
7. Dependency/loading Three.js (bundle, cache, awarie ładowania, fallback path).

## 12. Kryteria akceptacji przed implementacją runtime

Przed wejściem w implementację Three.js należy zatwierdzić:

1. **Kontrakt granic odpowiedzialności**:
   - mechanika poza rendererem,
   - renderer bez side-effectów gameplay.

2. **Kontrakt danych wejściowych**:
   - zdefiniowany snapshot world/camera/render/debug.

3. **Kontrakt feature flag + fallback**:
   - gwarantowany tryb `canvas2d` jako bezpieczny rollback.

4. **Kontrakt overlay**:
   - HUD/SUB-META/META pozostają poza rendererem świata.

5. **Plan testów i walidacji**:
   - porównanie wizualne trybów,
   - sanity check input/hit-test,
   - profil wydajności dla gęstych scen.

6. **Brak zmian w systemach gameplay**:
   - sekwencje, karty, ekonomia RP, PRG behavior bez modyfikacji.

---

## 13. Nota audytowa: `tree.js` vs `Three.js`

W ramach audytu repo nie znaleziono lokalnego modułu/pliku `tree.js` powiązanego z runtime renderingu świata. Kierunek dokumentu interpretuje więc „tree.js” jako bibliotekę **Three.js**.


## 10. Etap 1 implementation status

Status na **2026-05-17**: etap 1 został wdrożony jako minimalna infrastruktura bez wdrażania Three.js i bez zmiany gameplay.

- Dodano `hc.world_render_snapshot.js` z namespace `HC.WorldRenderSnapshot` i API `build(options)` tworzącym minimalny, defensywny snapshot danych renderingu świata.
- Dodano `hc.world_renderer.js` z namespace `HC.WorldRenderer` i API: `init`, `resize`, `render`, `destroy`, `getDiagnostics`, `setMode`, `getMode`.
- `renderMode` działa w trybach `"canvas2d" | "three"`, z domyślnym `canvas2d` i bezpiecznym fallbackiem do `HC.Render.frame(now, dt)`.
- Tryb `three` pozostaje placeholderem diagnostycznym; implementacja Three.js nadal **nie** istnieje (`hasThreeImplementation: false`).
- Boot flow używa snapshot buildera i adaptera tylko jako cienkiej fasady; przy braku adaptera/błędzie pozostaje legacy render path Canvas2D.
- UI/HUD/SUB-META/META pozostają poza rendererem świata (bez przenoszenia odpowiedzialności do adaptera).

## 14. Etap 1.5 validation/debug status

Status na **2026-05-17**: Etap 1.5 został wdrożony jako warstwa debug/diagnostics, bez zmiany mechaniki i bez implementacji Three.js.

- Dodano debug toggle `renderMode` (canvas2d/three) w istniejącym runtime debug overlay (bez nowego dużego panelu).
- Dodano usability toggle debug overlay: klik nagłówka `DEBUG` zwija/rozwija panel bez resetu `renderMode`, ustawień debug ani diagnostics; funkcja służy testom canvas2d/three i obserwacji świata bez zasłaniania ekranu.
- `canvas2d` pozostaje trybem domyślnym (`HC.RENDER_MODE = "canvas2d"` po starcie/odświeżeniu).
- `three` pozostaje placeholderem: `requestedMode="three"`, `effectiveMode="canvas2d"`, `fallbackUsed=true`, `fallbackReason="three_not_implemented"`.
- Rozdzielono diagnostycznie `requestedMode` od `effectiveMode` w `HC.WorldRenderer.getDiagnostics()`.
- Potwierdzono ścieżkę render flow bez obowiązkowego podwójnego renderu: adapter renderuje świat, a bezpośredni fallback `HC.Render.frame(...)` uruchamia się tylko gdy adapter jest niedostępny lub rzuci wyjątek.
- Rozszerzono diagnostics o: `renderCalls`, `fallbackCalls`, `snapshotVersion`, `fallbackReason`, `hasThreeImplementation`.
- Snapshot renderingu świata zawiera diagnostics (`version`, `objectCounts`, flagi dostępności kamery i worldBounds).
- `worldBounds` w snapshot korzysta z helpera `getWorldViewBounds()` jeśli jest dostępny; przy błędzie/braku pozostaje fallback `null` z oznaczeniem źródła w diagnostics snapshotu.
- Three.js nadal nie jest zaimplementowane (brak sceny, brak CDN, brak integracji runtime 3D).


## 15. Etap 2 implementation status

Status na **2026-05-17**: Etap 2 został wdrożony jako minimalny lifecycle adaptera Three.js, bez renderowania obiektów gameplay.

- `HC.WorldRenderer` posiada aktywny lifecycle Three adaptera: `init`, `resize`, `render`, `destroy`, `getDiagnostics`.
- Detekcja dependency działa przez `window.THREE`; loader zależności nie został wymuszony (brak CDN, brak nowego bundlera, brak vendor injection na siłę).
- W trybie `requestedMode = "three"` adapter próbuje uruchomić pustą scenę (`Scene + PerspectiveCamera + WebGLRenderer`) i renderuje neutralne tło testowe.
- Strategia canvas/layer: adapter tworzy osobny `canvas` (`#hc-three-world-canvas`) tylko dla Three mode; warstwa jest `pointer-events: none` i pozostaje pod overlay UI/debug.
- W razie braku dependency lub błędu init/render następuje bezpieczny fallback do `canvas2d` (`fallbackReason: "three_missing"`) bez crasha runtime.
- `HUD/SUB-META/META` pozostają poza rendererem świata; adapter świata nie przejmuje odpowiedzialności za te warstwy.
- Obiekty gameplay (`meteory/asteroidy/planety/gwiazdy/komety`, PRG visuals) nadal **nie** są renderowane przez Three.js.

### Warunki wejścia do Etapu 3

1. Zatwierdzenie docelowego modelu dostarczania dependency Three.js (repo-controlled vendor lub bundler zgodny z polityką repo).
2. Zdefiniowanie minimalnego mapowania pierwszej klasy obiektów świata (np. meteory) ze snapshotu na prymitywy/meshe Three.
3. Utrzymanie kontraktu: brak zmian mechaniki, brak przenoszenia HUD/SUB-META/META do renderera świata, bezpieczny fallback Canvas2D przy każdej awarii.
