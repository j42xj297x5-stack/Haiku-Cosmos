# docs/current - mapa aktualnej dokumentacji

> Status: KANON
> Obszar: mapa aktualnej dokumentacji
> Źródło prawdy: TAK, dla struktury i statusów dokumentów w `docs/current/`
> Ostatnia aktualizacja: 2026-04-29
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

## UI i flow

- `ui/UI_WORLD.md` - KANON
- `ui/SUB_META_V2_LAYOUT_SPEC.md` - ROBOCZY / SPEC PROJEKTOWY UI
- `ui/SUB_META_V2_WIREFRAME_SPEC.md` - ROBOCZY / SPEC WIREFRAME
- `ui/SUB_META_MEMORY_PACK.md` - ROBOCZY / HANDOFF PROJEKTOWY

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
- `visual/SVG_ASSET_STANDARDS.md` - ROBOCZY / STANDARD WYKONAWCZY
- `visual/SUB_META_FIGMA_ASSET_PASS_01.md` - EVIDENCE / FIGMA + RUNTIME REVIEW
- `visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md` - EVIDENCE / FIGMA CLEANUP + DERIVED KIT
- `visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md` - EVIDENCE / FIGMA STYLE CORRECTION + LIVING RITUAL LINE
- `visual/FIGMA_WORKFLOW.md` - KIERUNEK / WORKFLOW
- `visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md` - KIERUNEK / STARSZY PROMPT TEMPLATE
- `visual/SUB_META_LINE_ORNAMENT_LIBRARY.md` - KIERUNEK / BIBLIOTEKA POMOCNICZA

## Dokumentacja techniczna

- `technical/README.md` - ROBOCZY
- `technical/WORLD_FUNCTION_MAP.md` - ROBOCZY
- `technical/CARD_VISUAL_ARCHITECTURE.md` - ROBOCZY / ARCHITEKTURA TECHNICZNA
- `technical/FONT_SYSTEM_SPEC.md` - ROBOCZY / DO WDROZENIA
- `technical/FRAME_COMPOSER_SPEC.md` - ROBOCZY / KONTRAKT TECHNICZNY
- `technical/SUB_META_LAYOUT_ANCHOR_AUDIT.md` - ROBOCZY / AUDYT LAYOUTU
- `technical/CENTER_BASED_POSITIONING_SPEC.md` - ROBOCZY / KONTRAKT TECHNICZNY VISUAL LAYOUT
- `technical/SUB_META_V2_BOX_AUDIT.md` - ROBOCZY / AUDYT PROJEKTOWO-TECHNICZNY
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
- Modular Frame Kit v0.2 Figma cleanup/derived kit: `70` Figma components draft/evidence in `ramka-v1` (`HSAtk0l6Udl5XZp28Ijesl`), no SVG export/runtime integration.
- Modular Frame Kit v0.3 Figma style correction/source re-cut: `76` Figma components draft/evidence in `ramka-v1` (`HSAtk0l6Udl5XZp28Ijesl`), living ritual line, no SVG export/runtime integration.
- Static preview board: `assets/visual/preview/modular_frame_kit_v01_preview.html`.
- Runtime integration: root frame probe only; `HC.VisualAssets` + `HC.FrameComposer` sa wdrozone jako infrastruktura v0.1, a produkcyjny SUB-META uzywa ich tylko dla glownej ramy za flaga.
- SUB-META layout extraction: `hc.submeta_layout.js` udostepnia `HC.SubMetaLayout.computeWithAnchors(...)` jako czysty kontrakt layout + anchors, bez produkcyjnego FrameComposera.
- FrameComposer v0.1 infrastructure sandbox: `assets/visual/preview/frame_composer_sandbox.html`.
