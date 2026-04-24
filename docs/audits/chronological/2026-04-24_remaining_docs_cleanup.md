# Audyt kroku — remaining docs cleanup (2026-04-24)

## 1. EXECUTIVE SUMMARY

Wykonano końcowe porządkowanie pozostałych dokumentów z root i `md/` po migracji do `docs/current/`.
Aktywna dokumentacja została domknięta w `docs/current/`, audyty historyczne trafiły do `docs/audits/thematic/runtime/`, a dokumenty nieaktualne do `docs/legacy/`.
Katalog `md/` został usunięty jako nieaktywny.

## 2. Zakres sprawdzonych plików

- `md/`: `AUDIT_DEAD_CODE.md`, `AUDIT_SEQUENCE_ENGINE.md`, `FUNCTION_MAP_IMPLEMENTATION_TRACKER.md`, `haiku_cosmos_agents.md`, `haiku_cosmos_map_functions_world_v2.md`, `HAIKU_EDITOR.md`, `LIVE_VALIDATION_PACK.md`, `targets_system.md`, `README.md`.
- root: `MAP_FUNCTIONS_WORLD_vNEXT.md`, `CODEX_START.md`, `CODEX_PATCHPOINTS.md`, `README.md`, `AGENTS.md`.
- mapy: `docs/current/README.md`, `docs/current/maps/PROJECT_INDEX.md`, `docs/current/maps/DEPENDENCY_MAP.md`, `docs/legacy/README.md`, `docs/audits/README.md`, `logs/README.md`.

## 3. Dokumenty przeniesione do docs/current/

- `MAP_FUNCTIONS_WORLD_vNEXT.md` → `docs/current/technical/WORLD_FUNCTION_MAP.md`.
- `md/FUNCTION_MAP_IMPLEMENTATION_TRACKER.md` → `docs/current/technical/IMPLEMENTATION_TRACKER.md`.
- `md/LIVE_VALIDATION_PACK.md` → `docs/current/technical/LIVE_VALIDATION_PACK.md`.

## 4. Dokumenty przeniesione do docs/audits/

- `md/AUDIT_DEAD_CODE.md` → `docs/audits/thematic/runtime/AUDIT_DEAD_CODE.md`.
- `md/AUDIT_SEQUENCE_ENGINE.md` → `docs/audits/thematic/runtime/AUDIT_SEQUENCE_ENGINE.md`.

## 5. Dokumenty przeniesione do docs/legacy/

- `md/targets_system.md` → `docs/legacy/systems/TARGETS_SYSTEM.md`.
- `md/HAIKU_EDITOR.md` → `docs/legacy/technical/HAIKU_EDITOR.md`.
- `md/haiku_cosmos_map_functions_world_v2.md` → `docs/legacy/technical/WORLD_FUNCTION_MAP_OLD.md`.
- `CODEX_START.md` → `docs/legacy/workflow/CODEX_START.md`.
- `CODEX_PATCHPOINTS.md` → `docs/legacy/workflow/CODEX_PATCHPOINTS.md`.
- `md/haiku_cosmos_agents.md` → `docs/legacy/workflow/haiku_cosmos_agents.md`.

## 6. Dokumenty usunięte / katalogi usunięte

- Usunięto `md/README.md`.
- Usunięto plik systemowy `md/.DS_Store`.
- Usunięto pusty katalog `md/`.

## 7. Statusy nadane dokumentom

- `docs/current/technical/WORLD_FUNCTION_MAP.md` — DO AKTUALIZACJI.
- `docs/current/technical/IMPLEMENTATION_TRACKER.md` — DO AKTUALIZACJI.
- `docs/current/technical/LIVE_VALIDATION_PACK.md` — DO AKTUALIZACJI.
- `docs/audits/thematic/runtime/*.md` — HISTORYCZNY / SUPERSEDED (evidence).
- `docs/legacy/**/*` przeniesione w tym kroku — LEGACY / HISTORYCZNY.

## 8. Rozjazdy dokumentacja ↔ dokumentacja

### Poprawione w tym kroku

- Odwołania do `md/` jako aktywnego katalogu dokumentacji.
- Duplikacja map funkcji świata (`MAP_FUNCTIONS_WORLD_vNEXT.md` vs `haiku_cosmos_map_functions_world_v2.md`) — zostawiono jedną aktywną mapę w `docs/current/technical/`.
- Luźne dokumenty workflow w root (`CODEX_START`, `CODEX_PATCHPOINTS`) przeniesione do legacy.

### Wypisane do późniejszej decyzji

- Dokumenty techniczne w `docs/current/technical/` nadal zawierają historyczne odniesienia do `md/` i nazw plików `.codex.js`.
- Rozjazdy merytoryczne między starymi audytami runtime a obecnym kanonem systemowym (`docs/current/systems/*`) nie były rozstrzygane.

## 9. Czego nie rozstrzygano w tym kroku

- Nie wykonywano audytu dokumentacja ↔ runtime.
- Nie patchowano kodu gry.
- Nie rozstrzygano dużych konfliktów mechaniki.

## 10. Aktualizacje map README / PROJECT_INDEX / DEPENDENCY_MAP / AGENTS

Zaktualizowano:
- `README.md` (root),
- `docs/current/README.md`,
- `docs/current/maps/PROJECT_INDEX.md`,
- `docs/current/maps/DEPENDENCY_MAP.md`,
- `docs/legacy/README.md`,
- `docs/audits/README.md`,
- `AGENTS.md`.

Dodatkowo utworzono:
- `docs/current/technical/README.md`.

## 11. Ryzyka i braki

- `docs/current/technical/*` ma status DO AKTUALIZACJI i wymaga osobnego audytu merytorycznego.
- Audyty historyczne w `docs/audits/thematic/runtime/` mogą wprowadzać w błąd, jeśli zostaną potraktowane jako kanon.
- Legacy workflow może zawierać przydatne praktyki, ale nie jest aktywną instrukcją.

## 12. Rekomendowany następny krok

Wykonać dedykowany audyt dokumentów `docs/current/technical/` (WORLD_FUNCTION_MAP, IMPLEMENTATION_TRACKER, LIVE_VALIDATION_PACK) i zsynchronizować je semantycznie z kanonem `docs/current/systems/` oraz mapami `PROJECT_INDEX/DEPENDENCY_MAP`.
