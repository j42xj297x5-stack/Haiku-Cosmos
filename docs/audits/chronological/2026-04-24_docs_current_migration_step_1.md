# Audyt chronologiczny — 2026-04-24 — docs/current migration step 1

## 1. EXECUTIVE SUMMARY

Wykonano kontrolowaną migrację pierwszej paczki dokumentów z `md/` do `docs/current/`.
Zakres objął mapy/indeksy oraz kluczowe systemy gry (cards, economy, sub meta, PRG, i18n, roadmap) i dokument UI (`UI_WORLD`).
Migracja została wykonana jako fizyczne przeniesienie plików (bez aktywnych duplikatów w `md/`).

## 2. Zakres migracji

### Objęte obszary
- mapy / indeksy,
- podstawowe systemy gry,
- UI WORLD,
- i18n,
- aktualizacja map README i AGENTS.

### Poza zakresem
- pełna dokumentacja wizualna,
- rozstrzyganie konfliktów mechanicznych,
- zmiany kodu gry, mechaniki i UI runtime.

## 3. Lista przeniesionych dokumentów

- `md/haiku_cosmos_index.md` → `docs/current/maps/PROJECT_INDEX.md`
- `md/CARDS_SYSTEM.md` → `docs/current/systems/CARDS_SYSTEM.md`
- `md/ECONOMY SYSTEM.md` → `docs/current/systems/ECONOMY_SYSTEM.md`
- `md/SUB META SYSTEM.md` → `docs/current/systems/SUB_META_SYSTEM.md`
- `md/Player Reaction Field PRG.md` → `docs/current/systems/PRG_SYSTEM.md`
- `md/System Językowy (i18n).md` → `docs/current/systems/I18N_SYSTEM.md`
- `md/ROADMAP.md` → `docs/current/systems/ROADMAP.md`
- `md/UI_WORLD.md` → `docs/current/ui/UI_WORLD.md`

## 4. Lista dokumentów pozostawionych poza migracją

Pozostawione w `md/` (poza zakresem kroku):
- `md/haiku_cosmos_map_functions_world_v2.md`
- `md/targets_system.md`
- `md/FUNCTION_MAP_IMPLEMENTATION_TRACKER.md`
- `md/LIVE_VALIDATION_PACK.md`
- `md/AUDIT_DEAD_CODE.md`
- `md/AUDIT_SEQUENCE_ENGINE.md`
- `md/HAIKU_EDITOR.md`
- `md/haiku_cosmos_agents.md`

Braki wymagające utworzenia:
- `docs/current/maps/DEPENDENCY_MAP.md` — brak / do utworzenia.

## 5. Statusy nadane dokumentom

### KANON
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`

### ROBOCZY
- `docs/current/systems/ROADMAP.md`

### DO AKTUALIZACJI
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/systems/I18N_SYSTEM.md`

## 6. Zaktualizowane mapy / README

- `README.md` (root) — aktualna ścieżka do indeksu kanonu i punktu startowego.
- `docs/current/README.md` — aktualna mapa dokumentów po migracji kroku 1.
- `docs/current/maps/PROJECT_INDEX.md` — nowa rola indeksu w strukturze wielomapowej.
- `md/README.md` — doprecyzowanie, że `md/` nie jest źródłem prawdy.
- `AGENTS.md` (root) — minimalna aktualizacja kolejności czytania i statusu `docs/legacy/`.

## 7. Ryzyka i konflikty

1. Historyczne odwołania w treści dokumentów mogą nadal wskazywać nazwy bez nowej struktury katalogów (ryzyko niespójnych linków kontekstowych).
2. `PRG_SYSTEM.md` ma charakter koncepcyjny i nie jest jeszcze pełną specyfikacją kanoniczną.
3. `I18N_SYSTEM.md` opisuje strategię, ale wymaga doprecyzowania docelowego kontraktu implementacyjnego.
4. Brak `DEPENDENCY_MAP.md` utrudnia szybkie mapowanie relacji cross-systemowych.

## 8. Rekomendowany następny krok

Krok 3:
- migracja dokumentacji wizualnej do `docs/current/visual/`,
- utworzenie `docs/current/maps/DEPENDENCY_MAP.md`,
- audyt konfliktów między kanonem `docs/current/` a implementacją runtime (bez agresywnej zmiany mechaniki).
