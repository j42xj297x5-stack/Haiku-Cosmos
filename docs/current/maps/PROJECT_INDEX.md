# Haiku Cosmos - PROJECT_INDEX

> Status: KANON
> Obszar: mapa projektu / indeks dokumentacji aktualnej
> Źródło prawdy: TAK
> Ostatnia aktualizacja: 2026-04-28
> Powiązane dokumenty: ../../README.md, ../README.md, DEPENDENCY_MAP.md

## Rola dokumentu

`PROJECT_INDEX.md` jest indeksem aktualnego kanonu w ramach `docs/current/`.

Kanon jest mapowany warstwowo przez:

1. `README.md` w root,
2. `docs/README.md`,
3. `docs/current/README.md`,
4. `docs/current/maps/PROJECT_INDEX.md`,
5. `docs/current/maps/DEPENDENCY_MAP.md`.

## Mapy

- `docs/current/README.md` - mapa warstwy `docs/current/`.
- `docs/current/maps/PROJECT_INDEX.md` - główny indeks bieżącego kanonu.
- `docs/current/maps/DEPENDENCY_MAP.md` - mapa relacji między systemami, dokumentami i orientacyjnymi obszarami kodu.

## Systemy gry

- `docs/current/systems/CARDS_SYSTEM.md` (KANON)
- `docs/current/systems/ECONOMY_SYSTEM.md` (KANON)
- `docs/current/systems/SUB_META_SYSTEM.md` (KANON)
- `docs/current/systems/PRG_SYSTEM.md` (KANON STRUKTURALNY / DO STROJENIA)
- `docs/current/systems/I18N_SYSTEM.md` (KANON STRUKTURALNY / DO WDROŻENIA)
- `docs/current/systems/ROADMAP.md` (ROBOCZY)

## UI / flow

- `docs/current/ui/UI_WORLD.md` (KANON)

## Visual

- `docs/current/visual/README.md` (KIERUNEK)
- `docs/current/visual/ART_DIRECTION.md` (KIERUNEK)
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md` (KIERUNEK)
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md` (KIERUNEK)
- `docs/current/visual/MODULAR_FRAME_KIT.md` (KIERUNEK / RESET PO AUDYCIE)
- `docs/current/visual/MODULAR_FRAME_KIT_FIGMA_PROMPT.md` (KIERUNEK / PROMPT WYKONAWCZY)
- `docs/current/visual/MODULAR_FRAME_KIT_ASSET_MANIFEST.md` (EVIDENCE / MANIFEST LEGACY)
- `docs/current/visual/SUB_META_COMPONENTS.md` (KIERUNEK / KATALOG KOMPONENTÓW)
- `docs/current/visual/SUB_META_ASSET_PIPELINE.md` (KIERUNEK / PIPELINE WYKONAWCZY)
- `docs/current/visual/SUB_META_FIGMA_ASSET_PASS_01.md` (EVIDENCE / FIGMA + RUNTIME REVIEW)
- `docs/current/visual/FIGMA_WORKFLOW.md` (KIERUNEK / WORKFLOW)
- `docs/current/visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md` (KIERUNEK / STARSZY PROMPT TEMPLATE)
- `docs/current/visual/SUB_META_LINE_ORNAMENT_LIBRARY.md` (KIERUNEK / BIBLIOTEKA POMOCNICZA)

## Techniczne

- `docs/current/technical/README.md` (ROBOCZY)
- `docs/current/technical/WORLD_FUNCTION_MAP.md` (ROBOCZY)
- `docs/current/technical/CARD_VISUAL_ARCHITECTURE.md` (ROBOCZY / ARCHITEKTURA TECHNICZNA)
- `docs/current/technical/FONT_SYSTEM_SPEC.md` (ROBOCZY / DO WDROZENIA)
- `docs/current/technical/FRAME_COMPOSER_SPEC.md` (ROBOCZY / KONTRAKT TECHNICZNY)
- `docs/current/technical/IMPLEMENTATION_TRACKER.md` (ROBOCZY)
- `docs/current/technical/LIVE_VALIDATION_PACK.md` (ROBOCZY)

## Zasady użycia indeksu

- `docs/current/` ma pierwszeństwo projektowe względem dokumentów historycznych.
- `docs/legacy/` i audyty historyczne są evidence, nie kanonem.
- `targets_system`, `HAIKU_EDITOR`, `CODEX_START`, `CODEX_PATCHPOINTS`, `haiku_cosmos_agents` są dokumentami legacy i nie są aktywną specyfikacją.
- Obecny pass SVG `style_correction_2026_04` jest evidence w `assets/visual/legacy/`, nie aktywnym zestawem produkcyjnym.
- Modular Frame Kit v0.1 ma manifest evidence/export w `assets/visual/modular_frame_kit_v01_manifest.json`; runtime integration pozostaje future pass.
- `FRAME_COMPOSER_SPEC.md` opisuje przyszly kontrakt layoutu modularnych SVG (`anchorOffset`, `lineInset`, `ornamentScale`) bez implementacji runtime.
