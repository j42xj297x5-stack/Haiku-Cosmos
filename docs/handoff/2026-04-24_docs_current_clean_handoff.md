# Handoff — docs/current clean (2026-04-24)

## Stan dokumentacji

Warstwa `docs/current/` jest po audycie spójna dokumentacja↔dokumentacja i nie ma rozjazdów krytycznych.

## Gdzie jest kanon

- Wejście repo: `README.md`
- Wejście dokumentacji: `docs/README.md`
- Wejście warstwy current: `docs/current/README.md`
- Indeks kanonu: `docs/current/maps/PROJECT_INDEX.md`
- Mapa zależności: `docs/current/maps/DEPENDENCY_MAP.md`

## Klasy statusów

### KANON
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`

### KIERUNEK
- `docs/current/visual/README.md`
- `docs/current/visual/ART_DIRECTION.md`
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`

### ROBOCZY
- `docs/current/systems/ROADMAP.md`
- `docs/current/technical/README.md`
- `docs/current/technical/IMPLEMENTATION_TRACKER.md`
- `docs/current/technical/LIVE_VALIDATION_PACK.md`

### DO AKTUALIZACJI
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/systems/I18N_SYSTEM.md`
- `docs/current/technical/WORLD_FUNCTION_MAP.md`

## Co uporządkowano

- Ujednolicono statusy map i README warstwowych.
- Domknięto brakujące wpisy dokumentów w mapach.
- Doprecyzowano relację `logs/` i `tests/` do `LIVE_VALIDATION_PACK.md`.

## Czego nie traktować jako source of truth

- `docs/legacy/` (historia),
- `docs/audits/` (evidence i przebieg zmian),
- dokumenty DO AKTUALIZACJI jako pełny kanon.

## Następny sensowny krok

Osobny krok merytoryczny dla dokumentów DO AKTUALIZACJI (`PRG_SYSTEM.md`, `I18N_SYSTEM.md`, `WORLD_FUNCTION_MAP.md`) bez mieszania z porządkowaniem map.
