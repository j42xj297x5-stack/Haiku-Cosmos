> Status: ROBOCZY
> Obszar: techniczne / tracker wdrożenia
> Źródło prawdy: NIE (tracker operacyjny)
> Ostatnia aktualizacja: 2026-04-26 (sync: sequence core handoff)
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

## 3. Zweryfikowane w etapie 2026-04-26 (runtime ↔ kanon)

- A-loop AA/AAA/DS:
  - mechanika: **TESTED AUTOMATED PASS** (`tests/cards_sequence_a_loop_aa_aaa_ds.test.js`),
  - live evidence: **TESTED LIVE EVIDENCE PASS** (`logs/2026-04-26_08-10-08__sess_8-101Z__debug__aa_aaa_ds__fallback_evidence_pack.json`, audyt 2026-04-26).
- Decision window matrix (R1/R2/R3/R4/AA + click-after-TTL):
  - mechanika/testy: **TESTED AUTOMATED PASS** (`tests/cards_sequence_decision_window_matrix.test.js`),
  - status scenariuszy: left/right/timeout/click-after-TTL potwierdzone testem + audytem 2026-04-26.
- Zakres produkcyjnego użycia eventów debugowych i snapshotów (`hc.debug.js`, `hc.ui_debug.js`) pozostaje obszarem operacyjnym (bez nowego patcha runtime).
- Pokrycie kontraktu SUB-META (sloty/wiązania) względem aktualnych dokumentów systemowych: bez zmian mechaniki w tym etapie.

## 4. Do aktualizacji (otwarte obszary)

- HUD clarity: **NEXT / OUT_OF_SCOPE_UI_CLARITY** (brak czytelnego znacznika etapu R1/R2/AA/AAA w HUD; osobny wątek UI, bez ruszania mechaniki).
- R2 runtime activation: `onRunActivateR2` pozostaje stubem (niegotowe do strojenia bez osobnego patcha mechaniki).
- PRG runtime binding/toggle: status PARTIAL/MISMATCH (UI sygnalizuje tryby, runtime binding path nie pokrywa pełnego kanonu).
- Economy chain multipliers (x2..x9): status PARTIAL/MISMATCH, wymagany osobny patch mechaniki + testy ekonomii.
- SUB-META / PRG gapy integracyjne: pozostają osobne względem domknięcia sequence core.
- Rozszerzenia i18n (kanon strukturalny, osobny etap wdrożenia).
- `WORLD_FUNCTION_MAP.md` pozostaje mapą ROBOCZĄ; pełny audyt runtime funkcja-po-funkcji to osobny backlog.

## 5. Uwagi operacyjne

- Ten tracker ma status **ROBOCZY**: jest użyteczny do planowania i audytu, ale nie jest kanonem.
- Decyzje systemowe należy zatwierdzać w `docs/current/systems/*` i `docs/current/ui/UI_WORLD.md`.


## 6. HUD v2 Etap 1 (2026-05-03)

- Status: **DONE (techniczny adapter runtime, bez zmian visual/mechaniki)**.
- Dodano `hc.hud_v2.js` (`HC.HUDV2.buildViewModel`) i podpięto w aktywnym entrypoincie `index.html`.
- Dodano smoke test `tests/hud_v2_view_model_smoke.test.js`.
- Zakres ograniczeń: pending collect opiera się na obecnym single-slot `World.pendingCard` (`R2/R3/R4` rozdzielane po `kind`, bez nowych kanałów runtime).
