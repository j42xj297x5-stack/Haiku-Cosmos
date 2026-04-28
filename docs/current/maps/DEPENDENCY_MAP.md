# Haiku Cosmos - DEPENDENCY_MAP

> Status: KANON
> Obszar: mapa zależności projektu
> Źródło prawdy: TAK, dla relacji między dokumentami/systemami
> Ostatnia aktualizacja: 2026-04-28
> Powiązane dokumenty: PROJECT_INDEX.md, ../README.md, ../../../AGENTS.md

## 1. Cel dokumentu

`DEPENDENCY_MAP.md` jest roboczą mapą zależności między systemami gry, dokumentami i orientacyjnymi obszarami runtime.

## 2. Kolejność czytania

1. `README.md` w root,
2. `docs/README.md`,
3. `docs/current/README.md`,
4. `docs/current/maps/PROJECT_INDEX.md`,
5. `docs/current/maps/DEPENDENCY_MAP.md`.

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

## 4. KIERUNEK visual

- `docs/current/visual/README.md`
- `docs/current/visual/ART_DIRECTION.md`
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`
- `docs/current/visual/MODULAR_FRAME_KIT.md`
- `docs/current/visual/MODULAR_FRAME_KIT_FIGMA_PROMPT.md`
- `docs/current/visual/SUB_META_COMPONENTS.md`
- `docs/current/visual/SUB_META_ASSET_PIPELINE.md`
- `docs/current/visual/FIGMA_WORKFLOW.md`
- `docs/current/visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md`
- `docs/current/visual/SUB_META_LINE_ORNAMENT_LIBRARY.md`

## 5. ROBOCZY / EVIDENCE

- `docs/current/systems/ROADMAP.md`
- `docs/current/technical/README.md`
- `docs/current/technical/WORLD_FUNCTION_MAP.md`
- `docs/current/technical/CARD_VISUAL_ARCHITECTURE.md` (robocza architektura rozdzialu card mechanics vs card visuals / FrameComposer)
- `docs/current/technical/FRAME_COMPOSER_SPEC.md` (roboczy kontrakt layoutu modularnych SVG: anchorOffset, lineInset, ornamentScale)
- `docs/current/technical/IMPLEMENTATION_TRACKER.md`
- `docs/current/technical/LIVE_VALIDATION_PACK.md`
- `docs/current/visual/SUB_META_FIGMA_ASSET_PASS_01.md` (evidence przebiegu Figma i runtime review)
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
- `MODULAR_FRAME_KIT_FIGMA_PROMPT.md` jest promptem wykonawczym dla następnego passu Figma.
- `SUB_META_ASSET_PIPELINE.md` definiuje docelową organizację aktywnych modular assets oraz legacy/evidence policy.
- `SUB_META_COMPONENTS.md` definiuje komponenty frame parts, dynamic state layers, new-card marker i slot bridges.

- `assets/visual/modular_frame_kit_v01_manifest.json` opisuje wyeksportowany Modular Frame Kit v0.1 (`35` SVG) jako `exported_review_ready`, bez runtime integration.
- `FRAME_COMPOSER_SPEC.md` definiuje roboczy kontrakt przyszlego skladania modularnych SVG po anchorach, nie po samym `viewBox`.

### Runtime

- `CARD_VISUAL_ARCHITECTURE.md` wyznacza przyszly rozdzial: `cards.js` jako mechanika, `hc.card_visuals.js` jako rysowanie kart, `hc.frame_composer.js` jako skladanie ramek i `hc.visual_assets.js` jako loader/cache assetow.
- `FRAME_COMPOSER_SPEC.md` precyzuje przyszly kontrakt `hc.frame_composer.js`: `anchorOffset`, `lineInset`, `ornamentScale`, debug anchors oraz static/dynamic layers.
- `cards.js` renderuje SUB-META i HUD kart oraz ma defensywny loader manifestu SVG.
- `hc.ui_debug.js` buduje DOM HUD i przycisk SUB-META.
- Aktywny manifest `assets/visual/submeta/submeta_svg_manifest.json` może być pusty; runtime musi zachować funkcjonalny fallback.

## 8. Ostrzeżenia

- Dokumenty visual nie zmieniają mechaniki kart, sekwencji, kosztów RP ani PRG behavior.
- Obecne SVG `style_correction_2026_04` nie są kanonem i nie są bazą dla FrameComposera.
- Nowe ramki v0.1 powstaly od zera w Figmie jako modular parts i zostaly wyeksportowane do `assets/visual/...`; runtime integration pozostaje future pass.
- FrameComposer, live-coloring, new/seen-card state i animacje to osobne future pass.
- `docs/legacy/` nie jest źródłem prawdy.
