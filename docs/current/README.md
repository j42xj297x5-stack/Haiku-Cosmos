# docs/current - mapa aktualnej dokumentacji

> Status: KANON
> Obszar: mapa aktualnej dokumentacji
> Źródło prawdy: TAK, dla struktury i statusów dokumentów w `docs/current/`
> Ostatnia aktualizacja: 2026-04-28
> Powiązane dokumenty: maps/PROJECT_INDEX.md, maps/DEPENDENCY_MAP.md, ../README.md, ../../README.md

Ten katalog zawiera aktualną dokumentację projektu.

## Mapy i indeksy

- `maps/PROJECT_INDEX.md` - główny indeks aktualnego kanonu.
- `maps/DEPENDENCY_MAP.md` - mapa zależności systemów, dokumentów i orientacyjnych plików kodu.

## Systemy gry

- `systems/CARDS_SYSTEM.md` - KANON
- `systems/ECONOMY_SYSTEM.md` - KANON
- `systems/SUB_META_SYSTEM.md` - KANON
- `systems/PRG_SYSTEM.md` - KANON STRUKTURALNY / DO STROJENIA
- `systems/I18N_SYSTEM.md` - KANON STRUKTURALNY / DO WDROŻENIA
- `systems/ROADMAP.md` - ROBOCZY

## UI i flow

- `ui/UI_WORLD.md` - KANON

## Oprawa wizualna

- `visual/README.md` - mapa dokumentów wizualnych
- `visual/ART_DIRECTION.md` - KIERUNEK
- `visual/KOSMOLOGIA_WIZUALNA.md` - KIERUNEK
- `visual/BIBLIOTEKA_MATERIALOW.md` - KIERUNEK
- `visual/MODULAR_FRAME_KIT.md` - KIERUNEK / RESET PO AUDYCIE
- `visual/MODULAR_FRAME_KIT_FIGMA_PROMPT.md` - KIERUNEK / PROMPT WYKONAWCZY
- `visual/MODULAR_FRAME_KIT_ASSET_MANIFEST.md` - EVIDENCE / MANIFEST LEGACY
- `visual/SUB_META_COMPONENTS.md` - KIERUNEK / KATALOG KOMPONENTÓW
- `visual/SUB_META_ASSET_PIPELINE.md` - KIERUNEK / PIPELINE WYKONAWCZY
- `visual/SUB_META_FIGMA_ASSET_PASS_01.md` - EVIDENCE / FIGMA + RUNTIME REVIEW
- `visual/FIGMA_WORKFLOW.md` - KIERUNEK / WORKFLOW
- `visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md` - KIERUNEK / STARSZY PROMPT TEMPLATE
- `visual/SUB_META_LINE_ORNAMENT_LIBRARY.md` - KIERUNEK / BIBLIOTEKA POMOCNICZA

## Dokumentacja techniczna

- `technical/README.md` - ROBOCZY
- `technical/WORLD_FUNCTION_MAP.md` - ROBOCZY
- `technical/CARD_VISUAL_ARCHITECTURE.md` - ROBOCZY / ARCHITEKTURA TECHNICZNA
- `technical/FONT_SYSTEM_SPEC.md` - ROBOCZY / DO WDROZENIA
- `technical/FRAME_COMPOSER_SPEC.md` - ROBOCZY / KONTRAKT TECHNICZNY
- `technical/IMPLEMENTATION_TRACKER.md` - ROBOCZY
- `technical/LIVE_VALIDATION_PACK.md` - ROBOCZY

## Zasady

1. `docs/current/` jest źródłem prawdy dla aktualnego kanonu.
2. `docs/legacy/` nie jest źródłem prawdy.
3. Po większych zmianach aktualizuj: `README.md`, `docs/README.md`, `docs/current/README.md`, `docs/current/maps/PROJECT_INDEX.md`.

## Snapshot operacyjny (2026-04-28)

- Sequence core: PASS.
- HUD/SUB-META legacy SVG pass: przeniesiony do `assets/visual/legacy/style_correction_2026_04/`.
- Legacy SVG `style_correction_2026_04`: przeniesione do evidence; aktywny `submeta_svg_manifest.json` jest pusty/neutralny.
- Modular Frame Kit v0.1: `35` SVG exported_review_ready, manifest `assets/visual/modular_frame_kit_v01_manifest.json`.
- Static preview board: `assets/visual/preview/modular_frame_kit_v01_preview.html`.
- Runtime integration: not_integrated; `HC.VisualAssets` + `HC.FrameComposer` sa wdrozone jako repo-only infrastruktura v0.1 (loader/cache + pure layout), bez podpiecia produkcyjnego SUB-META.
- FrameComposer v0.1 infrastructure sandbox: `assets/visual/preview/frame_composer_sandbox.html`.
