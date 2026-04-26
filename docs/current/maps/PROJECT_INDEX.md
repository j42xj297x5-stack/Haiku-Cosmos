# Haiku Cosmos — PROJECT_INDEX

> Status: KANON
> Obszar: Mapa projektu / indeks dokumentacji aktualnej
> Źródło prawdy: TAK
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: ../../README.md, ../README.md, DEPENDENCY_MAP.md

## Rola dokumentu

`PROJECT_INDEX.md` jest indeksem aktualnego kanonu w ramach struktury `docs/current/`.
Kanon jest mapowany warstwowo przez:

1. `README.md` (root),
2. `docs/README.md`,
3. `docs/current/README.md`,
4. `docs/current/maps/PROJECT_INDEX.md` (ten plik).

## Indeks aktualnych dokumentów

### Mapy

- `docs/current/README.md` — mapa warstwy `docs/current/` (KANON)
- `docs/current/maps/PROJECT_INDEX.md` — główny indeks bieżącego kanonu.
- `docs/current/maps/DEPENDENCY_MAP.md` — mapa relacji między systemami, dokumentami i orientacyjnymi obszarami kodu.

### Systemy gry

- `docs/current/systems/CARDS_SYSTEM.md` (KANON)
- `docs/current/systems/ECONOMY_SYSTEM.md` (KANON)
- `docs/current/systems/SUB_META_SYSTEM.md` (KANON)
- `docs/current/systems/PRG_SYSTEM.md` (KANON STRUKTURALNY / DO STROJENIA)
- `docs/current/systems/I18N_SYSTEM.md` (KANON STRUKTURALNY / DO WDROŻENIA)
- `docs/current/systems/ROADMAP.md` (ROBOCZY)

### UI / flow

- `docs/current/ui/UI_WORLD.md` (KANON)

### Visual

- `docs/current/visual/README.md` (KIERUNEK)
- `docs/current/visual/ART_DIRECTION.md` (KIERUNEK)
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md` (KIERUNEK)
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md` (KIERUNEK)
- `docs/current/visual/SUB_META_FIGMA_BRIEF.md` (KIERUNEK / BRIEF WYKONAWCZY)
- `docs/current/visual/SUB_META_LAYOUT_SPEC.md` (KIERUNEK / SPECYFIKACJA LAYOUTU)
- `docs/current/visual/SUB_META_COMPONENTS.md` (KIERUNEK / BIBLIOTEKA KOMPONENTÓW)
- `docs/current/visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md` (KIERUNEK / SZABLON PROMPTU)

### Techniczne (aktywnie utrzymywane, ale niekanoniczne)

- `docs/current/technical/README.md` (ROBOCZY; mapa warstwy technicznej)
- `docs/current/technical/WORLD_FUNCTION_MAP.md` (ROBOCZY; mapa orientacyjna runtime, nie kanon techniczny funkcja-po-funkcji)
- `docs/current/technical/IMPLEMENTATION_TRACKER.md` (ROBOCZY)
- `docs/current/technical/LIVE_VALIDATION_PACK.md` (ROBOCZY)

## Zasady użycia indeksu

- `docs/current/` ma pierwszeństwo projektowe względem dokumentów historycznych.
- `docs/legacy/` i audyty historyczne są evidence, nie kanonem.
- `targets_system`, `HAIKU_EDITOR`, `CODEX_START`, `CODEX_PATCHPOINTS`, `haiku_cosmos_agents` są dokumentami legacy i nie są aktywną specyfikacją.
