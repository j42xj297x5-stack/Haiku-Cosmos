# docs/current — mapa aktualnej dokumentacji

> Status: KANON
> Obszar: mapa aktualnej dokumentacji
> Źródło prawdy: TAK, dla struktury i statusów dokumentów w `docs/current/`
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: maps/PROJECT_INDEX.md, maps/DEPENDENCY_MAP.md, ../README.md, ../../README.md

Ten katalog zawiera aktualną dokumentację projektu.

## Mapy i indeksy

- `maps/PROJECT_INDEX.md` — główny indeks aktualnego kanonu.
- `maps/DEPENDENCY_MAP.md` — mapa zależności systemów, dokumentów i orientacyjnych plików kodu.

## Systemy gry

- `systems/CARDS_SYSTEM.md` — KANON
- `systems/ECONOMY_SYSTEM.md` — KANON
- `systems/SUB_META_SYSTEM.md` — KANON
- `systems/PRG_SYSTEM.md` — KANON STRUKTURALNY / DO STROJENIA
- `systems/I18N_SYSTEM.md` — KANON STRUKTURALNY / DO WDROŻENIA
- `systems/ROADMAP.md` — ROBOCZY

## UI i flow

- `ui/UI_WORLD.md` — KANON

## Oprawa wizualna

- `visual/README.md` — mapa dokumentów wizualnych
- `visual/ART_DIRECTION.md` — KIERUNEK
- `visual/KOSMOLOGIA_WIZUALNA.md` — KIERUNEK
- `visual/BIBLIOTEKA_MATERIALOW.md` — KIERUNEK

## Dokumentacja techniczna

- `technical/README.md` — ROBOCZY (mapa warstwy technicznej)
- `technical/WORLD_FUNCTION_MAP.md` — DO AKTUALIZACJI (mapa aktywna, nadal wymaga osobnego audytu runtime)
- `technical/IMPLEMENTATION_TRACKER.md` — ROBOCZY
- `technical/LIVE_VALIDATION_PACK.md` — ROBOCZY

## Zasady

1. `docs/current/` jest źródłem prawdy dla aktualnego kanonu.
2. `docs/legacy/` nie jest źródłem prawdy (użycie wyłącznie na wyraźne polecenie).
3. Po każdej paczce migracji aktualizuj: `README.md` (root), `docs/README.md`, `docs/current/README.md`, `docs/current/maps/PROJECT_INDEX.md`.
