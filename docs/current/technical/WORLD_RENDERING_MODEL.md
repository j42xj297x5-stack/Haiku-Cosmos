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

## 8. Etapowanie migracji

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

## 9. Ryzyka

1. Rozjazd układów współrzędnych screen/world.
2. Inny model kamery i projekcji vs. aktualne `screenToWorld`/`getWorldViewBounds`.
3. Rozjazd hit-test/input względem renderu.
4. Ryzyko wciągnięcia UI overlay do renderera świata (naruszenie kontraktu UI).
5. Performance przy dużej liczbie obiektów.
6. Kolejność renderowania i przezroczystości (alpha/blending/depth).
7. Dependency/loading Three.js (bundle, cache, awarie ładowania, fallback path).

## 10. Kryteria akceptacji przed implementacją runtime

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

## 11. Nota audytowa: `tree.js` vs `Three.js`

W ramach audytu repo nie znaleziono lokalnego modułu/pliku `tree.js` powiązanego z runtime renderingu świata. Kierunek dokumentu interpretuje więc „tree.js” jako bibliotekę **Three.js**.
