> Status: ROBOCZY
> Obszar: techniczne / tracker wdrożenia
> Źródło prawdy: NIE (tracker operacyjny)
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: WORLD_FUNCTION_MAP.md, LIVE_VALIDATION_PACK.md, ../maps/DEPENDENCY_MAP.md, ../../audits/chronological/2026-04-24_technical_docs_semantic_sync.md

# Haiku Cosmos — IMPLEMENTATION TRACKER

Ten dokument jest **trackerem roboczym** i nie udaje pełnego kanonu runtime.
Służy do szybkiego rozróżnienia: co działa, co jest historyczne, co wymaga weryfikacji i co wymaga aktualizacji.

## 1. Wykonane (potwierdzone roboczo)

- RUN loop: init → update → render → reset.
- Pauza świata przez `World.paused`.
- R1 (3-hit), kolekcja i aktywacja karty R1.
- Podstawowe działanie SUB-META overlay.
- PRG bazowe przez `World.pointer*` + modyfikatory kart.
- Meteory: spawn i kolizje.
- Asteroidy: powstawanie i kolaps do planety.
- Planety: rocky/gas + etap pre-star.
- Epoka gwiazd (STAR).

## 2. Historyczne / migracyjne odniesienia

- Dawne odniesienia do plików i dokumentów z `md/` zostały wycofane (katalog nieaktywny po migracji 2026-04-24).
- Starsze nazwy dokumentów typu `MAP_FUNCTIONS_WORLD_vNEXT.md` traktujemy jako historyczne nazewnictwo względem `WORLD_FUNCTION_MAP.md`.
- Szczegółowe audyty historyczne znajdują się w `docs/audits/chronological/`.

## 3. Do weryfikacji (runtime ↔ kanon)

- Spójność pełnego R-track (R2/R3/R4) z kanonem CARDS/ECONOMY/UI.
- Zakres produkcyjnego użycia eventów debugowych i snapshotów (`hc.debug.js`, `hc.ui_debug.js`).
- Pokrycie kontraktu SUB-META (sloty/wiązania) względem aktualnych dokumentów systemowych.

## 4. Do aktualizacji (otwarte obszary)

- Rozszerzenia PRG i i18n (systemy mają status kanonu strukturalnego i wymagają kolejnych kroków wdrożenia/strojenia).
- `WORLD_FUNCTION_MAP.md` została zsynchronizowana orientacyjnie do statusu ROBOCZY; pełny audyt runtime funkcja-po-funkcji pozostaje osobnym zadaniem.
- Uporządkowanie starszych bloków „plan/propozycja” tam, gdzie zostały już zastąpione audytami z 2026-04-24.

## 5. Uwagi operacyjne

- Ten tracker ma status **ROBOCZY**: jest użyteczny do planowania i audytu, ale nie jest kanonem.
- Decyzje systemowe należy zatwierdzać w `docs/current/systems/*` i `docs/current/ui/UI_WORLD.md`.
