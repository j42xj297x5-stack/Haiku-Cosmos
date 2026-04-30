# Haiku Cosmos - DEPENDENCY_MAP

> Status: KANON
> Obszar: mapa zależności projektu
> Źródło prawdy: TAK, dla relacji między dokumentami/systemami
> Ostatnia aktualizacja: 2026-04-30
> Powiązane dokumenty: PROJECT_INDEX.md, ../README.md, ../../../AGENTS.md

## 1. Cel dokumentu

`DEPENDENCY_MAP.md` jest kanoniczną mapą relacji między systemami, dokumentami i orientacyjnymi obszarami runtime.

## 2. Kolejność czytania

1. `README.md` w root,
2. `docs/README.md`,
3. `docs/current/README.md`,
4. `docs/current/maps/PROJECT_INDEX.md`,
5. `docs/current/maps/DEPENDENCY_MAP.md`.


## 2A. Szybkie ścieżki czytania wg typu zadania

### A) Zadania systemowe / mechaniczne
1. `README.md`
2. `docs/README.md`
3. `docs/current/README.md`
4. `docs/current/maps/PROJECT_INDEX.md`
5. `docs/current/maps/DEPENDENCY_MAP.md`
6. `docs/current/systems/CARDS_SYSTEM.md`, `ECONOMY_SYSTEM.md`, `SUB_META_SYSTEM.md`
7. `docs/current/systems/PRG_SYSTEM.md`, `I18N_SYSTEM.md`

### B) Zadania UI / HUD / SUB-META
1. Warstwa map jak wyżej
2. `docs/current/ui/UI_WORLD.md`
3. `docs/current/ui/SUB_META_V2_MASTER_SPEC.md` jako główny roboczy master spec layout/design handoff
4. aktywny stack pomocniczy SUB-META v2: `FRAME_COMPOSER_SPEC.md` (active technical contract), `SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` (SUB-META appendix), `SUB_META_V2_LAYOUT_TOKENS.md` (normalized appendix), `SUB_META_MEMORY_PACK.md`
5. history/spec-history (legacy): `docs/legacy/ui/SUB_META_V2_LAYOUT_SPEC.md`, `docs/legacy/ui/SUB_META_V2_WIREFRAME_SPEC.md`
6. `docs/current/technical/SUB_META_LAYOUT_ANCHOR_AUDIT.md` i `SUB_META_V2_BOX_AUDIT.md`

### C) Zadania visual / SVG / Figma
1. `docs/current/visual/README.md`
2. `docs/current/visual/VISUAL_EXECUTION_GUIDE.md`
3. `ART_DIRECTION.md` -> `KOSMOLOGIA_WIZUALNA.md` -> `BIBLIOTEKA_MATERIALOW.md`
4. zaleznie od zadania: `MODULAR_FRAME_KIT.md`, `SVG_ASSET_STANDARDS.md`, `SUB_META_ASSET_PIPELINE.md`
5. raster reference generation (poza repo) + Inkscape vectorization/layered master
6. `FIGMA_WORKFLOW.md` jako optional fitting/review/composition pass po eksporcie ramki lub elementow
7. `MODULAR_FRAME_KIT_FIGMA_PROMPT.md` jako aktualny prompt dla zadan Figma (nie dotyczy raster-first/Inkscape-only design pass)
8. dokumenty Figma evidence (`SUB_META_FIGMA_*`, `MODULAR_FRAME_KIT_ASSET_MANIFEST.md`) czytaj wylacznie jako history/review, nie aktywna produkcje/source-of-truth

### D) Zadania technical / runtime / evidence
1. Warstwa map jak wyżej
2. `docs/current/technical/README.md`
3. `WORLD_FUNCTION_MAP.md`, `FRAME_COMPOSER_SPEC.md`, `SEQUENCE_STATE_CONTRACT.md`, `IMPLEMENTATION_TRACKER.md`, `LIVE_VALIDATION_PACK.md`
4. audyty i handoff traktuj pomocniczo: `docs/audits/`, `docs/handoff/`

## 3. KANON

- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/systems/PRG_SYSTEM.md` (KANON STRUKTURALNY / DO STROJENIA)
- `docs/current/systems/I18N_SYSTEM.md` (KANON STRUKTURALNY / DO WDROŻENIA)
- `docs/current/ui/UI_WORLD.md`
- `docs/current/ui/SUB_META_V2_MASTER_SPEC.md` (ROBOCZY / MASTER SPEC UI-LAYOUT)
- aktywny stack pomocniczy SUB-META v2: `FRAME_COMPOSER_SPEC.md` (active technical contract), `SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` (SUB-META appendix), `SUB_META_V2_LAYOUT_TOKENS.md` (normalized appendix), `SUB_META_MEMORY_PACK.md`
- legacy/history po migracji: `docs/legacy/ui/SUB_META_V2_LAYOUT_SPEC.md`, `docs/legacy/ui/SUB_META_V2_WIREFRAME_SPEC.md` (zastąpione przez `SUB_META_V2_MASTER_SPEC.md`)

## 4. KIERUNEK visual

- `docs/current/visual/README.md`
- `docs/current/visual/VISUAL_EXECUTION_GUIDE.md`
- `docs/current/visual/ART_DIRECTION.md`
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`
- `docs/current/visual/MODULAR_FRAME_KIT.md`
- `docs/current/visual/MODULAR_FRAME_KIT_FIGMA_PROMPT.md`
- `docs/current/visual/SUB_META_COMPONENTS.md`
- `docs/current/visual/SUB_META_ASSET_PIPELINE.md`
- `docs/current/visual/SVG_ASSET_STANDARDS.md`
- `docs/current/visual/FIGMA_WORKFLOW.md`
- `docs/current/visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md`
- `docs/current/visual/SUB_META_LINE_ORNAMENT_LIBRARY.md`

## 5. ROBOCZY / EVIDENCE

- `docs/current/systems/ROADMAP.md`
- `docs/current/technical/README.md`
- `docs/current/technical/WORLD_FUNCTION_MAP.md`
- `docs/current/technical/CARD_VISUAL_ARCHITECTURE.md` (robocza architektura rozdzialu card mechanics vs card visuals / FrameComposer)
- `docs/current/technical/FONT_SYSTEM_SPEC.md` (roboczy kontrakt font systemu UI/kart pod i18n)
- `docs/current/technical/FRAME_COMPOSER_SPEC.md` (roboczy kontrakt layoutu modularnych SVG: anchorOffset, lineInset, ornamentScale)
- `docs/current/technical/SUB_META_LAYOUT_ANCHOR_AUDIT.md` (roboczy audyt obecnego layoutu SUB-META i kontraktu mount points)
- `docs/current/technical/IMPLEMENTATION_TRACKER.md`
- `docs/current/technical/LIVE_VALIDATION_PACK.md`
- `docs/current/visual/SUB_META_FIGMA_ASSET_PASS_01.md` (evidence przebiegu Figma i runtime review)
- `docs/current/visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md` (evidence Figma cleanup + derived modular frame/ornament kit v0.2)
- `docs/current/visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md` (evidence Figma style correction + living ritual line v0.3)
- `docs/current/visual/MODULAR_FRAME_KIT_ASSET_MANIFEST.md` (evidence manifestu legacy SVG)

## 6. LEGACY / HISTORYCZNE

- `docs/legacy/systems/TARGETS_SYSTEM.md`
- `docs/legacy/technical/HAIKU_EDITOR.md`
- `docs/legacy/technical/WORLD_FUNCTION_MAP_OLD.md`
- `docs/legacy/workflow/CODEX_START.md`
- `docs/legacy/workflow/CODEX_PATCHPOINTS.md`
- `docs/legacy/workflow/haiku_cosmos_agents.md`
- `assets/visual/legacy/style_correction_2026_04/` - legacy/evidence obecnego SVG passu SUB-META/HUD.

## 7. Kluczowe relacje

### Systemy

- `CARDS_SYSTEM.md` definiuje typy kart, sekwencje i DS.
- `ECONOMY_SYSTEM.md` definiuje RP i koszty.
- `SUB_META_SYSTEM.md` definiuje strukturę konfiguracji kart w SUB-META.
- `UI_WORLD.md` definiuje sposób prezentacji HUD, SUB-META i META.

### Visual / assets

- `ART_DIRECTION.md`, `KOSMOLOGIA_WIZUALNA.md` i `BIBLIOTEKA_MATERIALOW.md` definiują bazowy kierunek oprawy.
- `MODULAR_FRAME_KIT.md` jest kierunkiem dla nowych frame parts, static/dynamic layers i decyzji o odrzuceniu obecnego passu produkcyjnego.
- `VISUAL_EXECUTION_GUIDE.md` prowadzi execution visual/SVG/Figma.
- `MODULAR_FRAME_KIT_FIGMA_PROMPT.md` jest aktualnym promptem wykonawczym (CURRENT).
- `FIGMA_WORKFLOW.md` opisuje proces od guide do walidacji SVG i osobnego runtime passu.
- `SUB_META_ASSET_PIPELINE.md` jest aktywnym pipeline wykonawczym (CURRENT) od direction/context do production-candidate marking; runtime integration pozostaje osobnym pass.
- `SVG_ASSET_STANDARDS.md` jest standardem wykonawczym SVG (walidacja, naming, warstwy, granice rasterowe).
- `SUB_META_COMPONENTS.md` jest katalogiem komponentow i statusow.
- `MODULAR_FRAME_KIT_ASSET_MANIFEST.md` oraz dokumenty `SUB_META_FIGMA_*` maja status evidence/legacy/review i nie sa production source-of-truth.

- `assets/visual/modular_frame_kit_v01_manifest.json` opisuje wyeksportowany Modular Frame Kit v0.1 (`35` SVG) jako `exported_review_ready`; runtime uzywa go tylko dla `submeta.root_frame` probe za flaga.
- `SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md` opisuje Figma-only cleanup dwoch traced vector bases i derived kit v0.2 (`70` komponentow), bez eksportu SVG i bez runtime integration.
- `SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md` opisuje Figma-only style correction + source re-cut v0.3 (`76` komponentow), z roboczym stroke `#B8DDF0`, zywa rytualna linia, bez eksportu SVG i bez runtime integration.
- `FRAME_COMPOSER_SPEC.md` definiuje roboczy kontrakt przyszlego skladania modularnych SVG po anchorach, nie po samym `viewBox`.
- `SUB_META_LAYOUT_ANCHOR_AUDIT.md` mapuje obecny canvas layout SUB-META w `cards.js` oraz proponuje `SubMetaLayoutAnchors` przed integracja FrameComposera.
- `hc.submeta_layout.js` jest extraction pass v0.1 dla `SubMetaLayoutAnchors`: liczy ten sam layout co `getSubMetaLayout()` i zwraca semantyczne mount points bez renderingu.

### Runtime

- `CARD_VISUAL_ARCHITECTURE.md` wyznacza przyszly rozdzial: `cards.js` jako mechanika, `hc.card_visuals.js` jako rysowanie kart, `hc.frame_composer.js` jako skladanie ramek i `hc.visual_assets.js` jako loader/cache assetow.
- `FRAME_COMPOSER_SPEC.md` precyzuje kontrakt `hc.frame_composer.js`: `anchorOffset`, `lineInset`, `ornamentScale`, debug anchors oraz static/dynamic layers; zawiera tez status v0.1 implementation.
- `SUB_META_LAYOUT_ANCHOR_AUDIT.md` opisuje warstwe layout anchors, ktora przekazuje recty/mount points do przyszlego `HC.FrameComposer` zamiast hardcodowania layoutu w composerze.
- `hc.submeta_layout.js` tworzy namespace `HC.SubMetaLayout`; `cards.js` korzysta z niego przez wrapper `getSubMetaLayout()` i zachowuje defensywny fallback.
- `cards.js` ma minimalny runtime probe root frame: `FRAME_COMPOSER_SUBMETA_ROOT_ENABLED`, `HC.VisualAssets` preload i `HC.FrameComposer.drawFrameParts` tylko dla glownej ramy SUB-META.
- `assets/visual/preview/frame_composer_sandbox.html` testuje repo-only wspolprace `hc.visual_assets.js` + `hc.frame_composer.js` poza runtime gry.
- `FONT_SYSTEM_SPEC.md` porzadkuje tokeny typografii i rejestry tekstu dla HUD/SUB-META/kart bez zmiany mechaniki.
- `cards.js` renderuje SUB-META i HUD kart oraz ma defensywny loader manifestu SVG.
- `hc.ui_debug.js` buduje DOM HUD i przycisk SUB-META.
- Aktywny manifest `assets/visual/submeta/submeta_svg_manifest.json` może być pusty; runtime musi zachować funkcjonalny fallback.

## 8. Ostrzeżenia

- Dokumenty visual nie zmieniają mechaniki kart, sekwencji, kosztów RP ani PRG behavior.
- Obecne SVG `style_correction_2026_04` nie są kanonem i nie są bazą dla FrameComposera.
- Nowe ramki v0.1 powstaly od zera w Figmie jako modular parts i zostaly wyeksportowane do `assets/visual/...`; runtime integration pozostaje future pass.
- Derived kit v0.2 powstal w Figmie jako evidence/design source; nie jest jeszcze aktywnym asset manifestem runtime.
- Derived kit v0.3 powstal w Figmie jako style correction evidence/design source; nie jest aktywnym asset manifestem runtime.
- FrameComposer, live-coloring, new/seen-card state i animacje to osobne future pass.
- `docs/legacy/` nie jest źródłem prawdy.


## 8. Aktualizacja visual workflow (2026-04-30)

- Warstwa visual execution wspiera **raster reference -> Inkscape layered master -> optional Figma fitting**.
- `SVG_ASSET_STANDARDS.md` pozostaje wymaganym standardem dla obu sciezek, gdy assety trafiaja do repo/production-candidate flow.
- Runtime integration pozostaje osobnym passsem po walidacji i aktualizacji manifestu.
