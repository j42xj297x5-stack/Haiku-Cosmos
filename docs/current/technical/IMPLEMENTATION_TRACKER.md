> Status: ROBOCZY
> Obszar: techniczne / tracker wdrożenia
> Źródło prawdy: NIE (tracker operacyjny)
> Ostatnia aktualizacja: 2026-04-25
> Powiązane dokumenty: WORLD_FUNCTION_MAP.md, SEQUENCE_STATE_CONTRACT.md, LIVE_VALIDATION_PACK.md, ../maps/DEPENDENCY_MAP.md, ../../audits/chronological/2026-04-24_technical_docs_semantic_sync.md, ../../audits/chronological/2026-04-25_full_docs_runtime_sync_audit.md

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
- Core sequence logic 3-hit + takeover + R-track (R1..R4) działa logicznie i ma smoke evidence (`tests/cards_sequence_rtrack_takeover_smoke.test.js` + fallback evidence pack 2026-04-24).

## 2. Historyczne / migracyjne odniesienia

- Dawne odniesienia do plików i dokumentów z `md/` zostały wycofane (katalog nieaktywny po migracji 2026-04-24).
- Starsze nazwy dokumentów typu `MAP_FUNCTIONS_WORLD_vNEXT.md` traktujemy jako historyczne nazewnictwo względem `WORLD_FUNCTION_MAP.md`.
- Szczegółowe audyty historyczne znajdują się w `docs/audits/chronological/`.

## 3. Do weryfikacji (runtime ↔ kanon)

- AA/AAA/DS: logika jest obecna, ale wymaga świeżego runtime evidence (dedykowane sesje debug + JSONL replay).
- Decision window (left/right/timeout) dla R2/R3/R4: potrzebna pełna matryca evidence na aktualnym HEAD.
- Zakres produkcyjnego użycia eventów debugowych i snapshotów (`hc.debug.js`, `hc.ui_debug.js`).
- Pokrycie kontraktu SUB-META (sloty/wiązania) względem aktualnych dokumentów systemowych.

## 4. Do aktualizacji (otwarte obszary)

- R2 runtime activation: `onRunActivateR2` pozostaje stubem (niegotowe do strojenia bez osobnego patcha mechaniki).
- PRG toggle/runtime binding: status PARTIAL/MISMATCH (UI sygnalizuje tryby, runtime binding path nie pokrywa pełnego kanonu).
- Economy chain multipliers (x2..x9): status PARTIAL/MISMATCH, wymagany osobny patch mechaniki + testy ekonomii.
- Rozszerzenia i18n (kanon strukturalny, osobny etap wdrożenia).
- `WORLD_FUNCTION_MAP.md` została zsynchronizowana orientacyjnie do statusu ROBOCZY; pełny audyt runtime funkcja-po-funkcji pozostaje osobnym zadaniem.
- Uporządkowanie starszych bloków „plan/propozycja” tam, gdzie zostały już zastąpione audytami z 2026-04-24.

## 5. Uwagi operacyjne

- Ten tracker ma status **ROBOCZY**: jest użyteczny do planowania i audytu, ale nie jest kanonem.
- Decyzje systemowe należy zatwierdzać w `docs/current/systems/*` i `docs/current/ui/UI_WORLD.md`.
