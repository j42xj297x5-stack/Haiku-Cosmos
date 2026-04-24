# Handoff — docs/current po synchronizacji WORLD_FUNCTION_MAP (2026-04-24)

## Aktualny stan docs/current

Warstwa `docs/current/` jest uporządkowana statusowo po orientacyjnej synchronizacji `WORLD_FUNCTION_MAP.md`.

## Dokumenty DO AKTUALIZACJI

Brak dokumentów `DO AKTUALIZACJI` w `docs/current/` (stan na 2026-04-24).

## KANON

- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`

## KANON STRUKTURALNY / DO STROJENIA

- `docs/current/systems/PRG_SYSTEM.md`

## KANON STRUKTURALNY / DO WDROŻENIA

- `docs/current/systems/I18N_SYSTEM.md`

## KIERUNEK

- `docs/current/visual/README.md`
- `docs/current/visual/ART_DIRECTION.md`
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`

## ROBOCZY

- `docs/current/systems/ROADMAP.md`
- `docs/current/technical/README.md`
- `docs/current/technical/WORLD_FUNCTION_MAP.md`
- `docs/current/technical/IMPLEMENTATION_TRACKER.md`
- `docs/current/technical/LIVE_VALIDATION_PACK.md`

## Techniczne robocze — ważna granica

Następujących dokumentów nie wolno traktować jako pełnego source of truth runtime:
- `docs/current/technical/WORLD_FUNCTION_MAP.md`
- `docs/current/technical/IMPLEMENTATION_TRACKER.md`
- `docs/current/technical/LIVE_VALIDATION_PACK.md`

## Następne sensowne kroki

1. Wrócić do projektowania/implementacji PRG (strojenie osi i wiązań).
2. Albo rozpocząć wdrożenie i18n (locale + loader + fallback + testy).
3. Jeśli potrzebna jest specyfikacja implementacyjna runtime, wykonać pełny audyt funkcja-po-funkcji dla mapy świata.
