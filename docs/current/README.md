# docs/current — mapa aktualnej dokumentacji

> Status: KANON
> Obszar: mapa aktualnej dokumentacji
> Źródło prawdy: TAK, dla struktury i statusów dokumentów w `docs/current/`
> Ostatnia aktualizacja: 2026-04-26
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
- `visual/FIGMA_WORKFLOW.md` — KIERUNEK / WORKFLOW WYKONAWCZY
- `visual/SUB_META_FIGMA_BRIEF.md` — KIERUNEK / BRIEF WYKONAWCZY
- `visual/SUB_META_LAYOUT_SPEC.md` — KIERUNEK / SPECYFIKACJA LAYOUTU
- `visual/SUB_META_COMPONENTS.md` — KIERUNEK / BIBLIOTEKA KOMPONENTÓW
- `visual/SUB_META_ASSET_PIPELINE.md` — KIERUNEK / SPECYFIKACJA WYKONAWCZA
- `visual/SUB_META_TYPOGRAPHY.md` — KIERUNEK / TYPOGRAFIA
- `visual/SUB_META_RESPONSIVE_SCALING.md` — KIERUNEK / SPECYFIKACJA RESPONSYWNOŚCI
- `visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md` — KIERUNEK / SZABLON PROMPTU

## Dokumentacja techniczna

- `technical/README.md` — ROBOCZY (mapa warstwy technicznej)
- `technical/WORLD_FUNCTION_MAP.md` — ROBOCZY (mapa orientacyjna runtime; nie jest kanonem technicznym funkcja-po-funkcji)
- `technical/IMPLEMENTATION_TRACKER.md` — ROBOCZY
- `technical/LIVE_VALIDATION_PACK.md` — ROBOCZY

## Zasady

1. `docs/current/` jest źródłem prawdy dla aktualnego kanonu.
2. `docs/legacy/` nie jest źródłem prawdy (użycie wyłącznie na wyraźne polecenie).
3. Po każdej paczce migracji aktualizuj: `README.md` (root), `docs/README.md`, `docs/current/README.md`, `docs/current/maps/PROJECT_INDEX.md`.


## Snapshot operacyjny (2026-04-26)

- Sequence core: PASS (testy + evidence), szczegóły w `docs/current/technical/*` i audytach z 2026-04-26.
- HUD clarity: pozostaje kolejnym wątkiem (OUT_OF_SCOPE w etapie mechaniki).
- Handoff: `docs/handoff/2026-04-26_sequence_core_handoff.md`.
