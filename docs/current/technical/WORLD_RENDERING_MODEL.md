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
- Debug overlay w trybie debug ma stały przycisk `DEBUG` w lewym górnym rogu; przycisk pokazuje/ukrywa panel debug i pozostaje widoczny po zwinięciu panelu.
- Ukrycie/pokazanie panelu debug nie resetuje `renderMode`, ustawień debug ani diagnostics i nie wpływa na mechanikę/renderer świata.
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


## 16. Etap 2.5 layer/dependency sanity status

Status na **2026-05-17**: sanity pass warstwy renderera został wykonany bez wejścia w gameplay rendering Three.js.

- **Dependency loading:** repo nie ma jeszcze zatwierdzonego, produkcyjnego wzorca podpięcia Three.js jako lokalnego vendora ani aktywnego bundlera dla tego runtime passu; adapter pozostaje przy detekcji `window.THREE`.
- **Decyzja Etap 2.5:** nie dodawano dependency „na siłę”, nie użyto CDN jako production source-of-truth, nie wprowadzano refaktoru build systemu.
- **Rekomendowana ścieżka dependency:** osobny krok projektowy: repo-controlled local vendor (lub formalnie zatwierdzony bundler), z jednoznacznym ownership wersji biblioteki.
- **Realny status Three.js:** w runtime Three.js jest obecnie wykrywane (jeśli istnieje `window.THREE`), ale nie jest gwarantowanie dostarczane przez repo w tym etapie.
- **Warstwa `#hc-three-world-canvas`:** tworzona lazy (tylko przy próbie wejścia w mode `three`), wymuszone `pointer-events: none`, diagnostyka widoczności/z-index/pointer-events, oraz jawne ukrywanie (`display: none`, `visibility: hidden`) po powrocie do `canvas2d`.
- **Fallback i effective mode:** brak dependency lub błąd adaptera nadal prowadzi do bezpiecznego fallbacku na `canvas2d`; diagnostics rozróżnia `requestedMode` i `effectiveMode` oraz trzyma `fallbackReason`.
- **Zakres bez zmian:** meteory, asteroidy, planety, gwiazdy, komety, PRG visuals oraz HUD/SUB-META/META nadal nie są renderowane przez Three.js.

### Warunki wejścia do Etapu 3 (po sanity 2.5)

1. Formalne zatwierdzenie strategii dependency loading (repo-controlled local vendor lub zatwierdzony bundler).
2. Wpięcie dependency do repo zgodnie z wybraną strategią i aktualizacja `threeDependencySource` na ścieżkę produkcyjną (np. `local_vendor`).
3. Pierwszy ograniczony pass gameplay-object mapping do Three (bez zmiany mechaniki), z utrzymaniem fallbacku Canvas2D i kontraktu overlay UI.

## 17. Etap 2.75 dependency delivery status

Status na **2026-05-17**: Etap 2.75 został wykonany jako repo-controlled integration point dla Three.js dependency, bez gameplay render pass w Three.js.

- **Wybrany model delivery:** projekt działa jako runtime oparty o static HTML + script tags (bez bundlera i bez `package.json`), więc użyto lokalnego punktu podpięcia vendora: `./vendor/three/three.module.min.js` w `index.codex.html`.
- **Ładowanie dependency:** script vendora jest ładowany przed `hc.world_renderer.js`, a następnie ładowany jest mały marker `hc.three_vendor_marker.js` ustawiający `window.HC_THREE_SOURCE = "local_vendor"` jeśli `window.THREE` istnieje.
- **Diagnostyka source:** `HC.WorldRenderer` raportuje `threeDependencySource = "local_vendor"` gdy wykryje marker; bez markera i z obecnym `window.THREE` raportuje `"window.THREE"`; przy braku dependency raportuje `"missing"`.
- **CDN policy:** CDN nie jest używany jako production source-of-truth w runtime. Repo utrzymuje lokalny, jawny punkt podpięcia zależności.
- **Fallback contract:** przy braku local vendora lub błędzie inicjalizacji adapter nadal przechodzi bez crasha do `canvas2d` (`requestedMode` vs `effectiveMode` pozostaje rozdzielone w diagnostics).
- **Zakres bez zmian:** gameplay objects (`meteory/asteroidy/planety/gwiazdy/PRG`) nadal nie są renderowane przez Three.js; HUD/SUB-META/META pozostają poza rendererem świata.
- **Gate do Etapu 3:** pierwszy minimalny object render pass może ruszyć dopiero po manualnym smoke teście 2.75 (canvas2d -> three -> canvas2d + resize + diagnostics stability).

### Uwagi operacyjne (manual vendor provisioning)

Jeśli `./vendor/three/three.module.min.js` nie jest jeszcze fizycznie dostarczony w repo (np. ograniczenia środowiska CI/sandbox), runtime zachowuje bezpieczny fallback i należy ręcznie dodać jeden stabilny build Three.js do wskazanej ścieżki bez modyfikacji pliku minifikowanego.

## ESM vendor loading diagnostics (update 2026-05-17)

- `hc.three_module_bridge.js` ustawia globalne statusy ładowania dependency Three ESM: `HC_THREE_LOAD_STATUS` (`loading`/`ready`/`failed`), `HC_THREE_READY`, `HC_THREE_SOURCE`, `HC_THREE_LOAD_ERROR`.
- Local ESM vendor wymaga poprawnej ścieżki relatywnej do bridge (`./vendor/three/three.module.min.js`) i powinien być uruchamiany przez lokalny dev server.
- Tryb `file://` może blokować import ESM; diagnostyka bridge zwraca wtedy czytelny błąd (`ESM Three vendor requires local dev server, not file://`).
- Fallback `canvas2d` pozostaje obowiązkowy przy statusach `loading`/`failed`/`missing`; runtime nie może crashować przy braku Three.


- Bridge ESM (`hc.three_module_bridge.js`) zapisuje `HC_THREE_MODULE_URL` i wykonuje preflight `fetch()` przed `import()`, aby jednoznacznie odróżnić błąd HTTP (np. 404) od błędu ładowania modułu/MIME.

## ESM bridge browser smoke fix (2026-05-17)

- W środowisku przeglądarkowym wykryto przypadek: `fetch` do lokalnego vendora Three ESM zwracał HTTP 200, ale `import()` dynamiczny nadal kończył się błędem `Failed to fetch dynamically imported module`.
- Dla stabilizacji smoke testu browser bridge został uproszczony do statycznego importu ESM z lokalnego vendora (`./vendor/three/three.module.min.js`) w `hc.three_module_bridge.js`.
- Bridge publikuje `window.HC_THREE_BRIDGE_VERSION` (aktualnie `esm_static_import_v1`), żeby w DevTools szybko potwierdzić, że przeglądarka widzi najnowszy plik bridge (a nie cache).
- `window.HC_THREE_MODULE_URL` pozostaje diagnostycznym źródłem canonical URL modułu.
- Canvas2D fallback pozostaje obowiązkowy: nawet przy błędach ładowania/initializacji Three runtime musi umożliwiać dalszą grę przez `HC.Render`.

### Smoke QA (cache / browser)

1. Uruchom lokalny serwer z root repo (np. `python -m http.server 8123`).
2. Otwórz `http://localhost:8123/index.codex.html`.
3. W DevTools ustaw **Network → Disable cache**.
4. Wykonaj twarde odświeżenie (`Ctrl+F5`).
5. Sprawdź bezpośrednio URL vendora: `http://localhost:8123/vendor/three/three.module.min.js`.
6. Zweryfikuj w konsoli: `window.HC_THREE_BRIDGE_VERSION`, `window.HC_THREE_MODULE_URL`, `window.HC_THREE_LOAD_STATUS`, `window.HC_THREE_READY`, `window.HC_THREE_SOURCE`, `window.HC_THREE_LOAD_ERROR`.

## ESM bridge diagnostics v3

- Wariant ze statycznym importem (`import * as THREE from ...`) został odrzucony jako kontrakt bootstrapu, ponieważ przy błędzie importu kod bridge nie wykonuje się wcale i pola diagnostyczne pozostają `missing`.
- Bridge v3 (`esm_dynamic_diagnostic_v3`) najpierw ustawia globalną diagnostykę (`HC_THREE_BRIDGE_VERSION`, `HC_THREE_MODULE_URL`, `HC_THREE_LOAD_STATUS=loading`, `HC_THREE_LOAD_ERROR`), a dopiero potem wykonuje preflight `fetch` i `dynamic import()`.
- Debug renderera rozróżnia teraz stany: `bridge_missing`, `local_vendor_esm_loading`, `local_vendor_esm_failed`, `local_vendor_esm` (ready).
- Local vendor ESM Three może wymagać pełnego zestawu plików z `build/` tej samej wersji (jeśli `three.module.min.js` zawiera importy względne, np. do `./three.core.min.js`), a nie pojedynczego pliku modułu.
- Fallback `canvas2d` pozostaje obowiązkowy i jest aktywowany zawsze, gdy tryb `three` nie osiągnie stanu `ready`.


## ESM vendor minimal runtime set (update 2026-05-17)

- Minimalny lokalny zestaw runtime Three ESM w repo to:
  - `vendor/three/three.module.min.js`
  - `vendor/three/three.core.min.js`
- `three.module.min.js` w aktualnych wersjach Three może importować relatywnie `./three.core.min.js`, więc brak pliku core powoduje błąd importu mimo obecności pliku module.
- Oba pliki (`three.module.min.js` i `three.core.min.js`) muszą pochodzić z tej samej wersji Three.js.
- CDN nie jest production source-of-truth dla dependency ładowanych przez bridge.
- Fallback `canvas2d` pozostaje obowiązkowy przy każdym błędzie preflight/importu.

## Three ESM vendor final build set

- Pelny build Three.js jest lokalnie w `vendor/three/` (w tym `three.module*`, `three.core*`, `three.webgpu*`, `three.tsl*`, `three.webgpu.nodes*`).
- Aktualny runtime HC dla WebGL lifecycle uzywa minimalnego lokalnego zestawu ESM:
  - `vendor/three/three.module.min.js`
  - `vendor/three/three.core.min.js`
- `three.module.min.js` i `three.core.min.js` musza pochodzic z tej samej wersji builda Three.
- Pliki WebGPU/TSL/nodes pozostaja poza zakresem obecnego etapu i nie sa czescia aktywnego runtime path.
- Fallback `canvas2d` pozostaje obowiazkowy i musi dzialac przy braku gotowosci bridge/dependency.
- Gameplay objects (meteory, asteroidy, planety, gwiazdy, PRG) nadal nie sa renderowane przez Three w tym etapie; aktywny jest jedynie bazowy lifecycle renderera.


## Etap 3 meteor render pass status (2026-05-17)

- Three world adapter renderuje teraz **meteory jako pierwszy gameplay object**.
- Pass meteorów czyta wyłącznie `renderSnapshot.world.meteors` (bez bezpośredniego odczytu `World`).
- Mechanika, fizyka, kolizje i input/hit-test pozostają poza Three (runtime gameplay bez zmian).
- HUD, debug overlay, SUB-META i META pozostają warstwami overlay poza sceną Three.
- Pozostałe obiekty świata (asteroidy, planety, gwiazdy, PRG) nadal nie są objęte passami Three w tym etapie.
- Fallback do canvas2d pozostaje aktywnym i bezpiecznym mechanizmem pracy renderera.

## Etap 3.1 meteor visibility calibration status (2026-05-17)

- Diagnostyka potwierdziła, że pipeline Etapu 3 był częściowo poprawny: snapshot meteorów i mesh cache działały (liczby meteorów i meshy rosły), ale widoczność w scenie Three była niestabilna przez kalibrację mapowania kamera/skala/material.
- Najważniejsze poprawki dotyczyły warstwy prezentacji, bez zmian mechaniki:
  - kalibracja promienia meteorów przez stałe `THREE_METEOR_RADIUS_SCALE = 1.8` i `THREE_METEOR_MIN_RADIUS = 2.4`,
  - wymuszenie czytelności materiału debugowego (`MeshBasicMaterial`, `DoubleSide`, `depthTest=false`, `depthWrite=false`, `opacity` fallback),
  - poprawka mapowania kamery ortograficznej: gdy `worldBounds` nie są dostępne, bounds są liczone z `camera center + zoom + viewport`,
  - pozycja kamery jest ustawiana na środek aktualnych bounds (`cx`,`cy`) zamiast stałego `(0,0)`.
- Dodano diagnostykę first-sample dla Etapu 3.1:
  - pierwszy meteor ze snapshotu (`firstMeteor`),
  - pierwszy mesh (`firstMeteorMesh`: position + scale),
  - `cameraBounds`, `rendererSize`, `sceneChildrenCount`,
  - parametry kalibracji (`threeMeteorRadiusScale`, `threeMeteorMinRadius`).
- Dodano prosty marker debug środka kamery (`threeDebugMarker`) do szybkiej walidacji, czy scena renderuje przewidywany obszar.
- Zakres Three pozostaje ograniczony tylko do meteorów; asteroidy, planety, gwiazdy i PRG visual pozostają poza passami Three.
- Fallback canvas2d (w tym HUD/SUB-META/META) pozostaje bez zmian funkcjonalnych i nadal jest obowiązkową ścieżką awaryjną.

## Etap 3.1 camera/frustum fix

- Potwierdzono, że mesh cache i pass meteorów działały poprawnie (snapshot zawierał meteory, a renderer tworzył mesh-e), ale obiekty pozostawały poza frustum kamery Three.
- Przyczyna: niespójny model kamery między Canvas2D i Three. Canvas2D renderuje świat przez transform `translate(viewCenter) -> scale(zoom) -> translate(-cameraCenter)`, więc meteory pozostają w world-space, a kamera definiuje widoczny world-bounds.
- W Three wybrano model **`absolute_bounds`**:
  - `OrthographicCamera.left/right/top/bottom` ustawiane bezpośrednio z `camera.worldBounds` snapshotu,
  - `camera.position` ustawione na `(0, 0, 10)` (bez dodatkowego przesunięcia na center),
  - `mesh.position.x/y` pozostaje w world-space (`meteor.x`, `meteor.y`).
- Dodano diagnostykę mapowania kamera↔świat (`cameraSnapshotCenter`, `cameraSnapshotZoom`, `cameraSnapshotWorldBounds`, `worldBoundsSource`, `threeCameraModel`, `meteorGroupChildrenCount`, `firstMeteorScreenEstimate`, `firstMeteorInCameraBounds`) oraz marker debug dla pozycji pierwszego meteoru.
- Zakres fixu dotyczy wyłącznie warstwy renderingu Three świata; mechanika, fizyka, input, kolizje, ekonomia RP, HUD/SUB-META/META i logika kart pozostają poza Three i bez zmian.

## Etap 3.1 canvas layer composition fix (2026-05-17)

- Diagnostyka potwierdziła, że runtime Three działał (initialized + meteor meshes > 0), ale finalny obraz świata mógł pozostać niewidoczny przez kompozycję warstw canvas.
- Główny problem: `gameCanvas` (warstwa 2D) mógł pozostać nad `hc-three-world-canvas` z nieprzezroczystym tłem/ostatnią czarną klatką, więc zasłaniał Three world.
- Przyjęty model warstw dla trybu `three`:
  - `hc-three-world-canvas` = world layer (pod spodem),
  - `gameCanvas` = transparentny overlay 2D dla UI/input (nad warstwą Three),
  - HUD/SUB-META/META/debug overlay pozostają poza sceną Three.
- Implementacja fixu:
  - `gameCanvas` jest czyszczony transparentnie (`ctx.clearRect(...)`) w każdej klatce, gdy `effectiveMode === "three"`,
  - CSS `gameCanvas` jest przełączane na transparentne tło w trybie Three (bez black fill),
  - w trybie `canvas2d` canvas wraca do normalnego czarnego tła i standardowego renderingu świata.
- Rozszerzono diagnostykę renderera o dane kompozycji warstw:
  - `canvasLayerMode` (`canvas2d` lub `three_with_transparent_2d_overlay`),
  - style `gameCanvas` i `threeCanvas` (display/visibility/opacity/z-index/pointer-events),
  - `layerProbe` z `document.elementFromPoint(center)` do szybkiej walidacji, który element leży na wierzchu.
- Fallback `canvas2d` pozostał bez zmian kontraktowych i nadal jest ścieżką awaryjną.

## Etap 3.1 working checkpoint — Three meteor pass visible

### A. Dependency model
- Three.js jest lokalnym vendorem ESM.
- Runtime nie używa CDN.
- Legacy `three.min.js` nie jest kierunkiem tej migracji.
- Minimalny runtime vendor set dla klasycznego WebGL:
  - `vendor/three/three.module.min.js`
  - `vendor/three/three.core.min.js`
- WebGPU/TSL/nodes pozostają poza zakresem aktualnego etapu.

### B. Bridge model
- `hc.three_module_bridge.js` jest jedynym miejscem importu Three.
- Bridge ustawia `HC_THREE`, `HC_THREE_READY`, `HC_THREE_SOURCE`.
- Bridge version: `esm_vendor_probe_v4`.
- Bridge wykonuje preflight vendor URLs przed importem modułu.

### C. Renderer model
- `HC.WorldRenderer` zarządza trybem `canvas2d | three`.
- `canvas2d` pozostaje fallbackiem.
- `three` używa osobnego canvas: `#hc-three-world-canvas`.
- `gameCanvas` pozostaje transparentnym 2D overlayem dla UI/input w trybie three.

### D. Snapshot model
- Three render pass nie czyta `World` bezpośrednio.
- Dane meteorów przechodzą przez `renderSnapshot.world.meteors`.
- Snapshot jest granicą symulacja → prezentacja.

### E. Current object coverage
- Three renderuje po Etapie 4 meteory oraz asteroidy.
- Planety, gwiazdy, PRG ring/resonance effects nie są jeszcze renderowane przez Three.
- HUD/SUB-META/META nie są przeniesione do Three.

### F. Layer composition
- Three world layer jest pod spodem.
- `gameCanvas` działa jako transparentny 2D overlay UI/input nad Three.
- Debug overlay DOM pozostaje nad całością.
- `canvas2d` mode przywraca klasyczny `HC.Render.frame` path.

### G. Manual QA result
Manualny screen/test potwierdził:
- `effectiveMode=three`,
- `fallback=none`,
- `Three visible=yes`,
- meteory są widoczne,
- debug overlay działa.

## Etap 4 asteroid render pass checkpoint (2026-06-04)

### A. Zakres Three po Etapie 4
- Three renderuje teraz meteory oraz **asteroidy** jako drugi gameplay object pass.
- Pass asteroidów czyta wyłącznie `renderSnapshot.world.asteroids`; renderer Three nie czyta bezpośrednio `World.asteroids`.
- Asteroidy używają podstawowej low-poly geometrii `CircleGeometry` z liczbą boków pobraną ze snapshotu (`sides`) oraz podstawowego materiału w skali szarości z `grayLight`.
- Mesh cache asteroidów jest indeksowany po `renderKey` / `id` fallback i aktualizuje pozycję, skalę, rotację, materiał oraz widoczność z aktualnego snapshotu.
- Cleanup usuwa ze sceny Three meshe asteroidów, których nie ma już w `renderSnapshot.world.asteroids`.

### B. Obiekty nadal poza Three
- Planety, gwiazdy, komety, PRG ring/resonance effects oraz premium visual polish pozostają poza passami Three.
- HUD, debug overlay, SUB-META i META pozostają warstwami overlay poza sceną Three.
- `gameCanvas` pozostaje transparentnym overlayem UI/input nad `#hc-three-world-canvas` w trybie `three`.
- `canvas2d` pozostaje pełnym fallbackiem i nadal renderuje klasyczną ścieżkę świata.

### C. Snapshot-only / no-mechanics-change
- Snapshot asteroidów zawiera minimalne pola renderowe: `renderKey`, `id`, `x`, `y`, `radius`, `scale`, `color`, `colorKey` oraz bezpieczne pola wizualne istniejące w runtime (`sides`, `angle`, `grayLight`, orbit/collapse metadata).
- Snapshot pozostaje read-only: budowanie snapshotu mapuje dane do nowych obiektów prezentacyjnych i nie mutuje `World`.
- Nie zmieniono mechaniki, fizyki, inputu, kolizji, sekwencji, ekonomii RP ani powstawania/przechwytywania asteroidów.

### D. Diagnostics / QA
- Diagnostyka `HC.WorldRenderer.getDiagnostics()` raportuje `threeAsteroidCount`, `threeAsteroidMeshes`, `asteroidMeshCount`, `threeAsteroidLastError` i `asteroidGroupChildrenCount`.
- Debug overlay pokazuje liczby asteroidów/meshy Three oraz błąd passu asteroidów bez dodawania nowego panelu.
- QA automatyczne dla checkpointu: syntax check plików runtime i prosty test snapshot buildera w Node.
- Wynik manualnego QA w tym środowisku: **pending / wymagany w przeglądarce**, ponieważ środowisko repo nie udostępnia lokalnej przeglądarki do uruchomienia runtime.
- Checklist manualny do wykonania w przeglądarce: `canvas2d` działa jak wcześniej; w trybie `three` `effectiveMode=three`, `fallback=none`, meteory pozostają widoczne, a asteroidy po kolizjach meteorów pojawiają się w Three; brak Three lub błąd init/render zachowuje fallback `canvas2d`.

## Three GLB meteor pass v0.1 snapshot (2026-06-04)

### A. Cel passu
- Snapshot zamyka aktualny etap wdrożenia meteorów GLB w Three rendererze jako **visual-only layer**.
- Pass dokumentuje stan po technicznym wdrożeniu; nie uruchamia nowego zadania runtime i nie rozszerza mechaniki świata.
- Three renderer nadal korzysta z granicy `renderSnapshot.world.meteors`, więc meteory poruszają się po XY zgodnie ze snapshotem symulacji.

### B. Aktualny model renderowania GLB meteorów
- Three meteor visual pass ma centralną konfigurację `METEOR_GLB_ASSETS` dla czterech kolorów meteorów: `red`, `yellow`, `green`, `blue`.
- Każdy aktywny kolor ma dokładnie 5 wariantów GLB ładowanych z `public/glb/`; ścieżki są rozwiązywane przez deployment-safe helper public path (`publicAssetPath` / `publicPath`) zamiast hardcodowanych absolutnych URL.
- Wrapper wizualny meteoru dostaje stabilny wariant GLB na czas życia wrappera; indeks wariantu wynika z `visualId`, a nie z losowania per frame.
- Wariant GLB nie jest zmieniany co klatkę. Reassignment jest liczony diagnostycznie tylko przy zmianie URL wariantu dla istniejącego wrappera.
- Cache modeli GLB działa per URL (`meteorGlbCache`), a gotowy template jest klonowany do instancji wizualnych.
- Fallback circle pozostaje widoczny podczas loadingu, po błędzie ładowania i wtedy, gdy asset nie istnieje; po gotowym GLB fallback dla danego meteoru jest ukrywany.
- Modele GLB obracają się wizualnie po osiach XYZ. Bazowa rotacja, dominująca oś i prędkości osi są losowane raz na życie wrappera/visual lifetime, a potem aktualizowane deterministycznie z upływem czasu.
- Skala GLB jest liczona jako visual transform child modelu na podstawie promienia ze snapshotu oraz live debug scale; nie zmienia logicznego promienia meteoru.

### C. Aktywna lista assetów GLB per kolor

**BLUE**
- `public/glb/meteor_blue_silence_crystal_01.glb`
- `public/glb/meteor_blue_silence_crystal_02.glb`
- `public/glb/meteor_blue_silence_crystal_03.glb`
- `public/glb/meteor_blue_silence_crystal_04.glb`
- `public/glb/meteor_blue_silence_crystal_05.glb`

**GREEN**
- `public/glb/meteor_green_flow_shard_01.glb`
- `public/glb/meteor_green_flow_shard_02.glb`
- `public/glb/meteor_green_flow_shard_03.glb`
- `public/glb/meteor_green_flow_shard_04.glb`
- `public/glb/meteor_green_flow_shard_05.glb`

**RED**
- `public/glb/meteor_red_form_core_01.glb`
- `public/glb/meteor_red_form_core_02.glb`
- `public/glb/meteor_red_form_core_03.glb`
- `public/glb/meteor_red_form_core_04.glb`
- `public/glb/meteor_red_form_core_05.glb`

**YELLOW**
- `public/glb/meteor_yellow_bond_resin_01.glb`
- `public/glb/meteor_yellow_bond_resin_02.glb`
- `public/glb/meteor_yellow_bond_resin_03.glb`
- `public/glb/meteor_yellow_bond_resin_04.glb`
- `public/glb/meteor_yellow_bond_resin_05.glb`

### D. Granice odpowiedzialności
- Pass jest **visual-only**: nie zmienia mechaniki świata, update loop, spawnu, kolizji ani hit-testów.
- Kolizje nadal działają na logicznych danych meteoru, a nie na meshach GLB.
- Canvas2D fallback pozostaje bez zmian i nadal jest obowiązkową ścieżką awaryjną.
- HUD, SUB-META, META, karty i ekonomia RP pozostają poza tym passem oraz poza sceną Three.
- Asteroidy pozostają osobnym Etapem 4; ten snapshot nie miesza meteorów GLB z FrameComposer/SUB-META visual pipeline.

### E. Debug controls
- Debug overlay ma live kontrolkę `Meteor GLB scale`, która zapisuje `WorldRendererDebug.meteorGlbVisualScale` / `Session.debugConfig.visual.meteorGlbVisualScale`.
- Zakres wartości z runtime: `0.25`–`4.0`; domyślnie `1.0`.
- Zmiana skali działa live bez reloadu strony.
- Zmiana skali nie przebudowuje cache GLB, nie wymusza rekonstrukcji loadera i nie losuje ponownie wariantów; aktualizuje tylko `scale` child modelu w render pass.
- Skala debugowa jest visual-only: nie zmienia logicznego promienia, kolizji, spawnu, RP ani sekwencji.

### F. Diagnostyka runtime
- `HC.WorldRenderer.getDiagnostics()` raportuje m.in. `meteorGlbAssets`, `meteorGlbVisualScale`, `meteorGlbScaleLiveControl`, `meteorGlbCacheStats`, `meteorGlbAssignmentsCount`, `meteorGlbCacheSize`, `activeGlbInstances`, `activeFallbackMeteorVisuals`, `activeGlbInstancesByColor`, `fallbackVisualsByColor`, `glbVariantReassignments` i `meteorGlbInstanceCreates`.
- Diagnostyka first sample obejmuje `firstMeteor` oraz `firstMeteorMesh` z informacją o URL assetu, wariancie, widoczności GLB/fallbacku i aktualnej skali.

### G. Manual QA checklist
1. Uruchomić Vite po restarcie dev servera.
2. Włączyć Three renderer.
3. Sprawdzić po 5 wariantów dla RED/YELLOW/GREEN/BLUE.
4. Potwierdzić, że wariant nie zmienia się w locie.
5. Potwierdzić, że rotacja XYZ działa.
6. Potwierdzić, że debug scale działa live bez reloadu.
7. Potwierdzić, że fallback circle pojawia się przy loading/failed.
8. Potwierdzić, że canvas2d fallback działa nadal.
9. Potwierdzić, że kolizje, spawn, RP, karty, HUD i SUB-META są bez zmian.
10. Potwierdzić reset świata bez zostawiania starych instancji GLB.

### H. Znane ograniczenia
- Loader GLB w `hc.world_renderer.js` jest lightweight loaderem pod obecne lekkie, self-contained GLB; nie jest pełnym upstreamowym `GLTFLoader`.
- Obecny loader zakłada GLB v2 z JSON + BIN chunk i nie jest kontraktem dla pełnego spektrum glTF.
- Jeśli przyszłe assety dostaną tekstury, kompresję, DRACO, Meshopt, animacje albo zewnętrzne pliki, trzeba rozważyć vendored `GLTFLoader` zamiast rozbudowy lightweight loadera ad hoc.
- Vite/cache dev server może wymagać restartu po zmianach modułów lub assetów publicznych.

### I. Następny krok
- Dostroić domyślną skalę GLB meteorów po visual QA.
- Dostroić światło/materiały sceny Three dla czytelności modeli.
- Opcjonalnie wykonać snapshot visual QA z porównaniem wariantów per kolor.
- Później rozważyć analogiczny pass dla asteroid/planetoid, jeśli projektant zatwierdzi kierunek.

## Plan kolejnych etapów po checkpointcie 4

### Etap 5 — planety render pass
- Planety gas/rocky.
- Nadal snapshot-only.
- Podstawowe materiały.
- Bez finalnych shaderów.

### Etap 6 — gwiazdy render pass
- Rdzeń + proste halo.
- Bez finalnych efektów premium.

### Etap 7 — PRG / resonance layer
- Osobny premium visual layer.
- Ring, halo, resonance effects.
- Bez zmiany PRG behavior.

### Etap 8 — visual polish / performance
- Instancing tam, gdzie potrzebne.
- Glow/particles/shaders dopiero po stabilnym object coverage.
- Fallback `canvas2d` pozostaje.
