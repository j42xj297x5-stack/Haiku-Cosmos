# Haiku Cosmos - DEPENDENCY_MAP

> Status: KANON
> Obszar: mapa zależności projektu
> Źródło prawdy: TAK, dla relacji między dokumentami/systemami
> Ostatnia aktualizacja: 2026-06-12
> Powiązane dokumenty: PROJECT_INDEX.md, ../README.md, ../../../AGENTS.md

## 1. Cel dokumentu

`DEPENDENCY_MAP.md` jest kanoniczną mapą relacji między systemami, dokumentami i orientacyjnymi obszarami runtime.

## 2. Kolejność czytania

0. (dla pracy z ChatGPT-architektem) `docs/current/README_ARCHITECT.md` jako skondensowany start memory,
1. `README.md` w root,
2. `docs/README.md`,
3. `docs/current/README.md`,
4. `docs/current/maps/PROJECT_INDEX.md`,
5. `docs/current/maps/DEPENDENCY_MAP.md`.

`README_ARCHITECT.md` przyspiesza start rozmowy, ale pełne dokumenty kanoniczne pozostają source-of-truth.


## 2A. Szybkie ścieżki czytania wg typu zadania

### A) Zadania systemowe / mechaniczne
1. `README.md`
2. `docs/README.md`
3. `docs/current/README.md`
4. `docs/current/maps/PROJECT_INDEX.md`
5. `docs/current/maps/DEPENDENCY_MAP.md`
6. `docs/current/systems/CARDS_SYSTEM.md`, `CARD_SLOT_NETWORK_SYSTEM.md`, `ECONOMY_SYSTEM.md`, `SUB_META_SYSTEM.md`
7. `docs/current/systems/PRG_SYSTEM.md`, `I18N_SYSTEM.md`

### B) Zadania UI / HUD / SUB-META
1. Warstwa map jak wyżej.
2. Dla runtime SUB-META: `docs/current/ui/SUB_META_RUNTIME_SNAPSHOT.md` jako aktywny source-of-truth.
3. `docs/current/ui/UI_WORLD.md` dla nadrzędnego flow UI oraz `docs/current/ui/HUD_SYSTEM.md` dla HUD.
4. `SUB_META_V2_MASTER_SPEC.md` czytaj jako aktywny roboczy master spec UI/layout dla SUB-META v2; FrameComposer, Figma, tokeny, stare canvasowe SUB-META i wireframe’y czytaj jako reference/history, gdy nie konfliktują ze snapshotem runtime.

### C) Zadania visual / SVG / Figma
1. `docs/current/visual/README.md`
2. `docs/current/visual/VISUAL_EXECUTION_GUIDE.md`
3. `ART_DIRECTION.md` -> `KOSMOLOGIA_WIZUALNA.md` -> `BIBLIOTEKA_MATERIALOW.md`
4. zaleznie od zadania: `MODULAR_FRAME_KIT.md`, `SVG_ASSET_STANDARDS.md`, `SUB_META_ASSET_PIPELINE.md`
5. raster reference generation (poza repo) + Inkscape vectorization/layered master
6. `FIGMA_WORKFLOW.md` jako optional fitting/review/composition pass po eksporcie ramki lub elementow
7. `FIGMA_FRAME_CUTTING_GUIDE.md` obowiązkowo przy Figma cutting/recut/cleanup ramek i SVG frame parts
8. `MODULAR_FRAME_KIT_FIGMA_PROMPT.md` jako aktualny prompt dla zadan Figma (nie dotyczy raster-first/Inkscape-only design pass)
9. dokumenty Figma evidence (`SUB_META_FIGMA_*`, `MODULAR_FRAME_KIT_ASSET_MANIFEST.md`) czytaj wylacznie jako history/review, nie aktywna produkcje/source-of-truth

Dla zadan Figma zwiazanych z cieciem ramek czytaj: `docs/current/visual/README.md` -> `VISUAL_EXECUTION_GUIDE.md` -> `MODULAR_FRAME_KIT.md` -> `SVG_ASSET_STANDARDS.md` -> `FIGMA_WORKFLOW.md` -> `FIGMA_FRAME_CUTTING_GUIDE.md`.
Przy recut/cutting ramek maski i crop sa tylko do review/fittingu, a finalne SVG frame parts musza byc modularne, miec osobne export frames oraz anchor/metadata zgodne z FrameComposer/SVG.

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
- `docs/current/ui/SUB_META_RUNTIME_SNAPSHOT.md` (AKTYWNY SNAPSHOT RUNTIME SUB-META)
- `docs/current/ui/SUB_META_V2_MASTER_SPEC.md` (ROBOCZY / MASTER SPEC UI-LAYOUT dla SUB-META v2; nie kanon mechaniki i nie source-of-truth runtime)
- legacy/history po migracji: `docs/legacy/ui/SUB_META_V2_LAYOUT_SPEC.md`, `docs/legacy/ui/SUB_META_V2_WIREFRAME_SPEC.md` (zastąpione przez `SUB_META_V2_MASTER_SPEC.md`)

## 3A. Zależności aktywnego runtime SUB-META

- Runtime: `hc.submeta_png.js` -> `hc.submeta_placeholders.js` + `hc.submeta_panels.js`; wszystkie trzy korzystają z `hc.submeta_settings.js`, a kontrolki debug integruje `hc.ui_debug.js`.
- Domena kart/state bridge: `cards.js` (`CardEngine.subMetaView`); bez szerokiego refaktoru w ramach prac layoutowych.
- Settings source-of-truth: `public/settings/submeta-png-layout-export.json`, `public/settings/submeta-placeholders.json`, `public/settings/submeta-placeholders-panels.json`.
- Runtime URL: odpowiednio `settings/submeta-png-layout-export.json`, `settings/submeta-placeholders.json`, `settings/submeta-placeholders-panels.json`.
- Assety: `public/svg/` dla roboczych kart oraz `public/png/cards/` dla podglądu Opisu; `public/png/submeta/` zawiera obrazy overlayu, nie settings.
- Legacy/reference: stare canvasowe SUB-META, FrameComposer, Figma i konfliktujące specy/wireframe’y SUB-META v2.

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
- `docs/current/systems/CARD_SLOT_NETWORK_SYSTEM.md` (ROBOCZY / KANDYDAT DO KANONU)
- `docs/current/systems/CARD_SLOT_NETWORK_MIGRATION_CHECKLIST.md` (ROBOCZY / CHECKLISTA MIGRACYJNA) - nie jest kanonem mechaniki, tylko listą decyzji przed runtime dla `CARD_SLOT_NETWORK_SYSTEM.md`.
- `docs/current/systems/SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md` (ROBOCZY / KANDYDAT DO KANONU / PRZED RUNTIME) - roboczy system struktury slotu, DS jako karty naprawczej, kart specjalnych, artefaktów i pamięci eonów.
- `docs/current/ui/SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md` (ROBOCZY / CHECKLISTA UI-VISUAL / PRZED LAYOUT TOKENS) - checklista UI/visual dla czteroelementowego slotu; nie jest kanonem mechaniki ani layout tokens.
- `docs/current/ui/CARD_DURABILITY_VISUAL_DECISION.md` (ROBOCZY / DOKUMENT DECYZYJNY UI-VISUAL / PRZED WIREFRAME / PRZED RUNTIME) - rozstrzyga kierunek przed wireframe dla visual trwałości karty R opisanej w `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`; nie jest kanonem mechaniki ani runtime.
- `docs/current/ui/CARD_DURABILITY_WIREFRAME_PASS.md` (ROBOCZY / WIREFRAME UI / WARIANT C / PRZED LAYOUT TOKENS / PRZED RUNTIME) - rozwija `CARD_DURABILITY_VISUAL_DECISION.md` w minimalny wireframe wariantu C; nie jest layout tokenem, mechaniką ani runtime.
- `docs/current/technical/README.md`
- `docs/current/technical/WORLD_FUNCTION_MAP.md`
- `docs/current/technical/WORLD_RENDERING_MODEL.md`
- `docs/current/technical/CARD_VISUAL_ARCHITECTURE.md` (robocza architektura rozdzialu card mechanics vs card visuals / FrameComposer)
- `docs/current/technical/FONT_SYSTEM_SPEC.md` (roboczy kontrakt font systemu UI/kart pod i18n)
- `docs/current/technical/FRAME_COMPOSER_SPEC.md` (roboczy kontrakt layoutu modularnych SVG: anchorOffset, lineInset, ornamentScale)
- `docs/current/technical/SUB_META_LAYOUT_ANCHOR_AUDIT.md` (roboczy audyt obecnego layoutu SUB-META i kontraktu mount points)
- `docs/current/technical/IMPLEMENTATION_TRACKER.md`
- `docs/current/technical/LIVE_VALIDATION_PACK.md`
- `docs/current/technical/HUD_V2_RUNTIME_CONTRACT.md` (roboczy kontrakt implementacyjny HUD v2: mapowanie runtime, view-model, etapowanie bez zmiany mechaniki)
- `docs/current/visual/FIGMA_FRAME_CUTTING_GUIDE.md` (roboczy standard wykonawczy Figma frame cutting)
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

- `CARDS_SYSTEM.md` definiuje typy kart, ID i sekwencje RUN.
- `CARD_SLOT_NETWORK_SYSTEM.md` definiuje osadzanie kart w slotach, sieć wzmocnień, trwałość, pył, napięcie, blizny i naprawę slotów; status: ROBOCZY / KANDYDAT DO KANONU.
- `SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md` rozszerza `CARD_SLOT_NETWORK_SYSTEM.md` o strukturę slotu, DS jako kartę naprawczą, karty specjalne, artefakty i pamięć eonów.
- `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md` jest checklistą UI/visual dla `SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md` i `CARD_SLOT_NETWORK_SYSTEM.md`; nie jest kanonem mechaniki ani layout tokens.
- `CARD_DURABILITY_VISUAL_DECISION.md` rozstrzyga kierunek przed wireframe dla visual trwałości karty R opisanej w `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`. Nie jest kanonem mechaniki ani runtime.
- `CARD_DURABILITY_WIREFRAME_PASS.md` rozwija `CARD_DURABILITY_VISUAL_DECISION.md` w minimalny wireframe wariantu C. Nie jest layout tokenem, mechaniką ani runtime.
- `CARD_SLOT_NETWORK_MIGRATION_CHECKLIST.md` nie jest kanonem mechaniki, tylko listą decyzji i zależności, które trzeba zamknąć przed pierwszym runtime pass `CARD_SLOT_NETWORK_SYSTEM.md`.
- `SUB_META_SYSTEM.md` definiuje sens konfiguracji SUB-META oraz gałęzie ŚWIAT/PRG.
- `ECONOMY_SYSTEM.md` definiuje RP i koszty, które muszą zostać dostosowane do kosztów slotowych R1/R2/R3/R4 oraz kosztów pyłu/stabilizacji.
- `PRG_SYSTEM.md` definiuje strukturę PRG, którą trzeba zsynchronizować z decyzją, że R2 PRG jest lokalne, a jedna z wcześniejszych pozycji dodatkowego slotu przechodzi w kartę naprawczą.
- `UI_WORLD.md` i `SUB_META_V2_MASTER_SPEC.md` opisują prezentację logiki slotów, aktywności, trwałości, stabilizatorów, napięć, blizn i naprawy w HUD/SUB-META.
- `HUD_SYSTEM.md` definiuje roboczy kierunek RUN HUD v2: romby sekwencji, mikrodecyzje i dolne sloty kart specjalnych/eventowych.

### Visual / assets

- `ART_DIRECTION.md`, `KOSMOLOGIA_WIZUALNA.md` i `BIBLIOTEKA_MATERIALOW.md` definiują bazowy kierunek oprawy.
- `MODULAR_FRAME_KIT.md` jest kierunkiem dla nowych frame parts, static/dynamic layers i decyzji o odrzuceniu obecnego passu produkcyjnego.
- `VISUAL_EXECUTION_GUIDE.md` prowadzi execution visual/SVG/Figma.
- `MODULAR_FRAME_KIT_FIGMA_PROMPT.md` jest aktualnym promptem wykonawczym (CURRENT).
- `FIGMA_WORKFLOW.md` opisuje proces od guide do walidacji SVG i osobnego runtime passu.
- `FIGMA_FRAME_CUTTING_GUIDE.md` jest praktycznym standardem dla recut/cutting ramek w Figmie i uzupelnia `FIGMA_WORKFLOW.md`, `MODULAR_FRAME_KIT.md` oraz `SVG_ASSET_STANDARDS.md`; nie jest kanonem mechaniki, runtime implementation ani finalnym manifestem assetow.
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
- `WORLD_RENDERING_MODEL.md` definiuje roboczy kontrakt migracji renderingu świata (Three.js adapter + feature flag + fallback), bez zmian mechaniki/ekonomii/sekwencji/UI overlay; zawiera też adapter bootstrap contract, checkpoint Three renderer/`stage_spot_v1` oraz aktualny snapshot Three GLB + external meteor textures.
- Runtime relacja assetów GLB: `hc.world_renderer.js` korzysta z aktywnych puli meteorów i asteroid w `public/glb/` przez `publicAssetPath` / `publicPath`; assety GLB są warstwą prezentacyjną Three i nie są zależnością mechaniki, kolizji, kart, RP, HUD ani SUB-META. Lokalne `GLTFLoader` jest aktywną ścieżką runtime, cache GLB przechowuje template per URL i klonuje instancje, custom parser nie jest aktywną ścieżką, a fallback visual służy tylko stanom `loading`/`failed`.
- Runtime relacja tekstur meteorów: zewnętrzne PNG palety `red`/`yellow` (`map` i `emissiveMap`) są ładowane osobno przez `THREE.TextureLoader`, cache’owane i przypisywane stabilnie per instancja. Zewnętrzne mapy uzupełniają wyłącznie brakujące sloty materiału GLB; imported `material.map` lub `material.emissiveMap` z obrazem nie są nadpisywane. `green`/`blue` nie mają jeszcze palet i brak palety nie jest błędem.
- `SUB_META_LAYOUT_ANCHOR_AUDIT.md` opisuje warstwe layout anchors, ktora przekazuje recty/mount points do przyszlego `HC.FrameComposer` zamiast hardcodowania layoutu w composerze.
- `hc.submeta_layout.js` tworzy namespace `HC.SubMetaLayout`; `cards.js` korzysta z niego przez wrapper `getSubMetaLayout()` i zachowuje defensywny fallback.
- `cards.js` zawiera historyczny/minimalny probe FrameComposer root frame; nie należy go traktować jako aktywnej ścieżki runtime SUB-META.
- `assets/visual/preview/frame_composer_sandbox.html` testuje repo-only wspolprace `hc.visual_assets.js` + `hc.frame_composer.js` poza runtime gry.
- `FONT_SYSTEM_SPEC.md` porzadkuje tokeny typografii i rejestry tekstu dla HUD/SUB-META/kart bez zmiany mechaniki.
- `cards.js` renderuje SUB-META i HUD kart oraz ma defensywny loader manifestu SVG.
- `hc.ui_debug.js` buduje DOM HUD i przycisk SUB-META.
- Aktywny manifest `assets/visual/submeta/submeta_svg_manifest.json` może być pusty; runtime musi zachować funkcjonalny fallback.

## 8. Ostrzeżenia

- Dokumenty visual nie zmieniają mechaniki kart, sekwencji, kosztów RP ani PRG behavior.
- Maski/crop w Figmie nie sa finalnym cieciem produkcyjnym; ukryta pelna rama pod maska nie jest poprawnym SVG frame part.
- Obecne SVG `style_correction_2026_04` nie są kanonem i nie są bazą dla FrameComposera.
- Nowe ramki v0.1 powstaly od zera w Figmie jako modular parts i zostaly wyeksportowane do `assets/visual/...`; runtime integration pozostaje future pass.
- Derived kit v0.2 powstal w Figmie jako evidence/design source; nie jest jeszcze aktywnym asset manifestem runtime.
- Derived kit v0.3 powstal w Figmie jako style correction evidence/design source; nie jest aktywnym asset manifestem runtime.
- FrameComposer nie jest planowanym aktywnym runtime SUB-META; ewentualny powrót wymaga osobnej decyzji architektonicznej. Live-coloring, new/seen-card state i animacje pozostają poza tym snapshotem.
- `docs/legacy/` nie jest źródłem prawdy.


## 8. Aktualizacja visual workflow (2026-04-30)

- Warstwa visual execution wspiera **raster reference -> Inkscape layered master -> optional Figma fitting**.
- `SVG_ASSET_STANDARDS.md` pozostaje wymaganym standardem dla obu sciezek, gdy assety trafiaja do repo/production-candidate flow.
- Runtime integration pozostaje osobnym passsem po walidacji i aktualizacji manifestu.
