# README_ARCHITECT — Haiku Cosmos

> Status: ARCHITECT MEMORY / CURRENT  
> Obszar: skondensowana mapa projektu dla ChatGPT-architekta  
> Źródło prawdy:  
> - TAK, jako skrócony entrypoint pamięci architekta,  
> - NIE, jako zastępstwo pełnych dokumentów kanonicznych,  
> - NIE, jako runtime spec,  
> - NIE, jako dokument historyczny.  
> Ostatnia aktualizacja: 2026-06-12
> Powiązane: `../../README.md`, `../README.md`, `README.md`, `maps/PROJECT_INDEX.md`, `maps/DEPENDENCY_MAP.md`

## 1) Cel dokumentu

Ten plik służy do **szybkiego startu rozmowy z ChatGPT-architektem**.  
Kompresuje sens map, systemów, UI, visual i technical, żeby nie ładować 20+ plików na wejściu.  
Nie zastępuje dokumentów źródłowych — wskazuje, co doładować warunkowo.

## SUB-META runtime snapshot (2026-06-12)

Aktywną ścieżką runtime SUB-META jest statyczny overlay PNG/CSS + settings z `public/settings/` + gameplayowe placeholdery + panele robocze + render kart SVG/PNG + debug Import/Export JSON. Pełny bieżący kontrakt: `ui/SUB_META_RUNTIME_SNAPSHOT.md`.

Stare canvasowe SUB-META, FrameComposer, Figma oraz wcześniejsze specyfikacje/wireframe’y mają status legacy/reference dla SUB-META. Nie są źródłem prawdy bieżącego layoutu ani aktywnym systemem wdrożeniowym. Default po odświeżeniu pochodzi z plików settings; localStorage nie może mieć pierwszeństwa nad JSON.

## 2) Jak używać

1. Na start rozmowy wrzuć `docs/current/README_ARCHITECT.md`.  
2. Do konkretnego zadania doładuj tylko właściwą paczkę zadaniową (sekcja 12).  
3. `docs/legacy/`, `docs/audits/`, `docs/handoff/` ładuj tylko na wyraźną potrzebę.  
4. Jeśli ten skrót jest sprzeczny z pełnym SoT, **pełny SoT wygrywa**.

## 3) Hierarchia source-of-truth (skrót)

1. `README.md` (root) — mapa repo.  
2. `docs/README.md` — mapa dokumentacji.  
3. `docs/current/README.md` — mapa aktualnego kanonu.  
4. `docs/current/maps/PROJECT_INDEX.md` — indeks aktualnych dokumentów i statusów.  
5. `docs/current/maps/DEPENDENCY_MAP.md` — relacje i ścieżki czytania.  
6. `docs/current/systems/*` — kanon mechaniki/systemów.  
7. `docs/current/ui/UI_WORLD.md` — kanon flow UI.  
8. `docs/current/ui/SUB_META_RUNTIME_SNAPSHOT.md` — aktywny source-of-truth bieżącego runtime SUB-META.
9. `SUB_META_V2_MASTER_SPEC.md`, FrameComposer i Figma — legacy/reference dla runtime SUB-META.
10. `docs/current/visual/*` (core + execution) — kierunek i wykonanie visual.  
11. `docs/legacy/`, `docs/audits/`, `docs/handoff/` — nie domyślny SoT (history/evidence/handoff).

## 4) Kanon systemów — skrót architekta

### CARDS_SYSTEM
- 4 kolory bazowe: RED, YELLOW, GREEN, BLUE.
- Struktura R1–R4, model 3-hit, decyzje po domknięciu kroku.
- Decyzje: aktywuj / kolekcja / brak kliknięcia (timeout).
- Pętla A: `R1(A) -> AA -> AAA -> DS`.
- DS jest elementem sekwencyjnym/systemowym.
- Zasada RUN: aktywowalne są tylko karty R1.

### ECONOMY_SYSTEM
- RP to jedyna waluta.
- RP zdobywane w RUN, wydawane w META.
- Sloty i Kuźnia mają koszty RP.
- Ekonomia nie definiuje logiki kart (to domena systemu kart).

### SUB_META_SYSTEM
- SUB-META = warstwa konfiguracji, nie ekonomia, nie RUN, nie sam UI.
- Dwie gałęzie: PRG i ŚWIAT.
- R1 = tryby bazowe, R2 = wiązania, R3 = stabilizacja, R4 = jedność.

### PRG_SYSTEM
- PRG = Player Reaction Field.
- 4 osie: Wielkość, Klej–Odpychanie, Prędkość, Obiekty.
- ODB = odwrócenie/alternatywa osi.
- R2 obsługuje wiązania PRG.
- Brak finalnych wartości balansu (kanon strukturalny, strojenie później).

## 5) UI / SUB-META — skrót architekta

- `UI_WORLD.md` to kanon flow: **RUN HUD**, **SUB-META Overlay**, **META Overlay**.
- SUB-META v2 master:
  - PRG po lewej,
  - ŚWIAT po prawej,
  - resonance core w centrum,
  - inventory/forge/detail na dole,
  - DS poza centrum rdzenia,
  - 9 stref = semantyka relacji (nie tabela 3×3).
- `SUB_META_V2_LAYOUT_SPEC.md` i `SUB_META_V2_WIREFRAME_SPEC.md` są w `docs/legacy/ui/` (zastąpione).
- `SUB_META_V2_LAYOUT_TOKENS.md` i `SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` zostają jako appendiksy/handoffy.

## 6) Visual — skrót architekta

- Styl bazowy: rytualny minimalizm kosmiczny.
- Core docs: `ART_DIRECTION.md`, `KOSMOLOGIA_WIZUALNA.md`, `BIBLIOTEKA_MATERIALOW.md`.
- Semantyka stanów: 5 stanów / 4 kolory + eter.
- SUB-META ma być “astrolabialnym cockpitem rezonansu”, nie inventory-app UI.
- HUD ma być minimalistyczny.
- Ramki/ornamenty: cienkie, modularne, żywe; unikać fantasy-neon i CAD-sterile.

## 7) Aktualny realny workflow visual (ważne)

1. ChatGPT generuje **raster reference** (kierunek/forma).
2. Projektant wektoryzuje i czyści w **Inkscape**.
3. Projektant składa **layered master frame** w Inkscape.
4. Decyzja:
   - A) merged frame asset, albo
   - B) modular export do **optional Figma fitting**.
5. Figma = fitting/review/composition board (opcjonalnie).
6. Figma nie redesignuje stylu bez explicit requestu.
7. Przy wejściu assetów do repo/production-candidate obowiązują `SVG_ASSET_STANDARDS.md`.

## 8) SVG / asset standards — skrót

- Spójny `viewBox`, transparent background.
- Brak bitmap/base64/embed fontów w final SVG.
- Brak baked heavy glow.
- Cienkie stroke, separacja warstw (`static` / `accent` / `state`).
- Anchor metadata + naming conventions + density behavior.
- Asset statusy (np. planned/review/production_candidate/evidence_only).
- Raster traktować jako reference/source, nie runtime SVG.

## 9) FrameComposer — legacy/reference dla runtime SUB-META

### Hierarchia dokumentów
1. `SUB_META_RUNTIME_SNAPSHOT.md` — aktywny runtime entrypoint.
2. `SUB_META_V2_MASTER_SPEC.md` i `FRAME_COMPOSER_SPEC.md` — historyczny design/technical reference.
3. `SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` — SUB-META appendix.
4. `SUB_META_V2_LAYOUT_TOKENS.md` — normalized data appendix.
5. `CENTER_BASED_POSITIONING_SPEC.md` — ogólny standard visual layout.
6. Audyty technical (`*_AUDIT`) — evidence, nie SoT.

### Kluczowe pojęcia
- center-based positioning,
- `mountCenter` / `mountSize`,
- named anchors,
- anchor-level ID vs node-level ID,
- rozdział rectów: `layoutRect`, `interactiveRect`, `visualMountRect`, `visualBleedRect`, `contentSafeRect`,
- `anchorOffset`, `lineInset`, `ornamentScale`,
- connector layer,
- `avoidsInteractiveRects`,
- debug overlay.

## 10) Runtime / debug — skrót

- `WORLD_FUNCTION_MAP.md` jest mapą orientacyjną runtime (roboczą).
- `WORLD_RENDERING_MODEL.md` jest aktualnym entrypointem dla snapshotu renderera świata: Three.js jest domyślnym rendererem gry/debug, Canvas2D zostaje legacy/fallback/mechanics verification, rekomendowany model kamery to `stage_normalized`, aktywny model światła to `stage_spot_v1`, a snapshot Three GLB + external meteor textures potwierdza lokalny `GLTFLoader` dla meteorów/asteroid, cache template/clone GLB, cache PNG `map`/`emissiveMap` red/yellow przez `TextureLoader` oraz zasadę nienadpisywania imported GLB materials.
- Debug/evidence checkpoint 2026-06-05: legacy corner `PointLight` są usunięte z aktywnego runtime, ambient jest fill-only i domyślnie `0`/low, debug overlay ma zwijane sekcje + global helpers control, a compact event-based logging jest domyślnym modelem evidence.
- `SEQUENCE_STATE_CONTRACT.md`, `IMPLEMENTATION_TRACKER.md`, `LIVE_VALIDATION_PACK.md` ładuj przy debugowaniu i walidacji.
- Dla sekwencji aktywny runtime SoT: `CardEngine.state.sequence` (zgodnie z aktualnymi docs technical).
- Runtime docs nie zastępują kanonu mechaniki z `docs/current/systems/*`.

## 11) Paczki zadaniowe (praktycznie)

### A) Mechanika
- `README_ARCHITECT.md`
- `systems/CARDS_SYSTEM.md`
- `systems/ECONOMY_SYSTEM.md`
- `systems/SUB_META_SYSTEM.md`
- `systems/PRG_SYSTEM.md`
- opcjonalnie: `technical/SEQUENCE_STATE_CONTRACT.md`

### B) SUB-META runtime/layout
- `README_ARCHITECT.md`
- `ui/SUB_META_RUNTIME_SNAPSHOT.md`
- `ui/UI_WORLD.md`
- master spec, layout tokens i FrameComposer contract tylko jako legacy/reference

### C) Visual / raster / Inkscape
- `README_ARCHITECT.md`
- `visual/VISUAL_EXECUTION_GUIDE.md`
- `visual/ART_DIRECTION.md`
- `visual/KOSMOLOGIA_WIZUALNA.md`
- `visual/BIBLIOTEKA_MATERIALOW.md`
- `visual/SVG_ASSET_STANDARDS.md`

### D) Figma fitting
- `README_ARCHITECT.md`
- `visual/FIGMA_WORKFLOW.md`
- `visual/MODULAR_FRAME_KIT_FIGMA_PROMPT.md`
- `visual/SVG_ASSET_STANDARDS.md`
- `visual/SUB_META_ASSET_PIPELINE.md`
- opcjonalnie: `ui/SUB_META_V2_MASTER_SPEC.md`

### E) FrameComposer (legacy/reference dla SUB-META)
- `README_ARCHITECT.md`
- `technical/FRAME_COMPOSER_SPEC.md`
- `technical/CENTER_BASED_POSITIONING_SPEC.md`
- `ui/SUB_META_V2_FRAMECOMPOSER_CONTRACT.md`
- `ui/SUB_META_V2_LAYOUT_TOKENS.md`
- `ui/SUB_META_V2_MASTER_SPEC.md`

### F) Runtime/debug
- `README_ARCHITECT.md`
- `technical/WORLD_FUNCTION_MAP.md`
- `technical/SEQUENCE_STATE_CONTRACT.md`
- `technical/IMPLEMENTATION_TRACKER.md`
- `technical/LIVE_VALIDATION_PACK.md`
- + właściwy system canon (np. `systems/CARDS_SYSTEM.md`)

## 12) Czego NIE ładować domyślnie

- `docs/legacy/**`
- `docs/audits/**`
- `docs/handoff/**`
- `visual/SUB_META_FIGMA_ASSET_PASS_01.md`
- `visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md`
- `visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md`
- `visual/MODULAR_FRAME_KIT_ASSET_MANIFEST.md`
- `visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md`
- legacy: `docs/legacy/ui/SUB_META_V2_LAYOUT_SPEC.md`, `docs/legacy/ui/SUB_META_V2_WIREFRAME_SPEC.md`

Ładować tylko do porównań, audytu, historii lub odzyskiwania decyzji.

## 13) Ostrzeżenia o nazwach

- `visual/SUB_META_LAYOUT_SPEC.md` ≠ `legacy/ui/SUB_META_V2_LAYOUT_SPEC.md`.
- `technical/FRAME_COMPOSER_SPEC.md` ≠ `ui/SUB_META_V2_FRAMECOMPOSER_CONTRACT.md`.
- `visual/MODULAR_FRAME_KIT_FIGMA_PROMPT.md` = current prompt, `visual/SUB_META_FIGMA_*` = evidence.
- `visual/MODULAR_FRAME_KIT_ASSET_MANIFEST.md` = evidence/legacy manifest, nie production manifest.
- README o tej samej nazwie występują w różnych katalogach; zawsze podawaj pełną ścieżkę.

## 14) Zasady pracy z Codexem (skrót protokołu)

- Najpierw sens/decyzje, potem prompt wykonawczy.
- Prompt w plain text i z jasnym zakresem.
- Zawsze wskazuj konkretne pliki do przeczytania.
- Dopisuj zakazy (czego nie ruszać).
- Oczekuj: summary, testy/checki, ryzyka.
- Duże zadania dziel na kroki.
- Po każdym kroku: summary → analiza → kolejny prompt.

## 15) Snapshot po cleanupie

- `docs/current/` jest uporządkowaną warstwą kanoniczną.
- `ui/SUB_META_RUNTIME_SNAPSHOT.md` ma pierwszeństwo dla bieżącego runtime SUB-META; wcześniejsze master specy, layouty i wireframe’y są reference, jeśli nie konfliktują ze snapshotem.
- Visual workflow jest ustawiony na raster-first/Inkscape (+ optional Figma fitting).
- FrameComposer i Figma są legacy/reference dla runtime SUB-META; nie planować ich integracji jako aktywnej ścieżki bez nowej decyzji architektonicznej.
- Snapshot renderer/debug 2026-06-05 utrwala Three + `stage_normalized` + `stage_spot_v1` + compact logging oraz snapshot Three GLB + external meteor textures; nie zmienia mechaniki, kolizji, asteroid mechanics, PRG, SUB-META ani ekonomii.
- `SUB_META_MEMORY_PACK.md` istnieje jako helper, ale ten plik jest głównym startem rozmowy z architektem.

## Runtime continuity: loader, offline save, renderer defaults (2026-06-17)

- Runtime start uses `HC.AssetLoader` as a central asset registry with two phases. Phase 1 (`critical`) is blocking and preloads HUD TOP, runtime SUB-META PNG/settings/placeholders/panels, R1 SVG/PNG cards, meteor GLB/texture assets, comet assets when present, and the first asteroid GLB set. Missing critical assets are logged as visible console/debug evidence and the game continues with defensive runtime fallbacks where existing systems support them.
- Phase 2 (`background`) starts after the player enters a session and loads non-blocking assets: remaining/background celestial bodies, planets/moons, R2/R3/R4 card SVG/PNG assets, and extra SUB-META assets. The loader keeps an in-memory `Map` cache keyed by asset id and never starts duplicate loads for the same id.
- Offline continuity is browser-only. `HC.SaveSystem` exports a downloaded encrypted JSON envelope using Web Crypto PBKDF2 + AES-GCM. The player alias/imię/ksywa is the passphrase; the alias itself and the derived key are not stored in the save file or localStorage. localStorage may remember only the last alias text for convenience.
- Save encryption is a casual anti-edit layer, not security-grade anti-cheat. A technical user with runtime access can still inspect or alter client state before saving.
- Import reads a local file via browser file input/FileReader and decrypts with the current alias. Wrong alias or invalid file must show: `Nie udało się odczytać pliku. Sprawdź alias/imię albo plik save.` and must not crash the game.
- Alias exactly `debug` enters the debug flow without requiring a save file. Debug remains gated by the start overlay alias and may load/test selected asset groups through the loader/debug controls; normal players do not see the debug panel.
- Default renderer for normal and debug sessions is Three.js. Canvas2D remains a manual/legacy fallback via settings/debug only.
- Default SUB-META runtime is the new PNG v2 path. Legacy/canvas SUB-META is fallback/debug/reference only and must not become the desktop or mobile GitHub Pages default.
- Runtime public assets must continue to resolve through `HC.publicPath` / `HC.publicAssetPath`, preserving both Vite local paths and the GitHub Pages `/Haiku-Cosmos/` base.
