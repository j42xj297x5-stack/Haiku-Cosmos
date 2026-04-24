# Haiku Cosmos — DEPENDENCY_MAP

> Status: KANON
> Obszar: mapa zależności projektu
> Źródło prawdy: TAK, dla relacji między dokumentami/systemami
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: PROJECT_INDEX.md, ../README.md, ../../../AGENTS.md

## 1. Cel dokumentu

`DEPENDENCY_MAP.md` jest szybką mapą roboczą zależności między systemami gry, dokumentami i orientacyjnymi obszarami runtime.

## 2. Kolejność czytania

1. `README.md` (root),
2. `docs/README.md`,
3. `docs/current/README.md`,
4. `docs/current/maps/PROJECT_INDEX.md`,
5. `docs/current/maps/DEPENDENCY_MAP.md`.

## 3. Dokumenty wg statusu

### KANON
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

### DO AKTUALIZACJI
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/systems/I18N_SYSTEM.md`
- `docs/current/technical/WORLD_FUNCTION_MAP.md`
- `docs/current/technical/IMPLEMENTATION_TRACKER.md`
- `docs/current/technical/LIVE_VALIDATION_PACK.md`

### LEGACY / HISTORYCZNE (nie kanon)
- `docs/legacy/systems/TARGETS_SYSTEM.md`
- `docs/legacy/technical/HAIKU_EDITOR.md`
- `docs/legacy/technical/WORLD_FUNCTION_MAP_OLD.md`
- `docs/legacy/workflow/CODEX_START.md`
- `docs/legacy/workflow/CODEX_PATCHPOINTS.md`
- `docs/legacy/workflow/haiku_cosmos_agents.md`

## 4. Evidence / audyty

- `docs/audits/chronological/` — audyty etapowe.
- `docs/audits/thematic/runtime/AUDIT_DEAD_CODE.md` — historyczny evidence.
- `docs/audits/thematic/runtime/AUDIT_SEQUENCE_ENGINE.md` — historyczny evidence.

## 5. Ostrzeżenia

- Dokumenty w `docs/current/technical/` mają status DO AKTUALIZACJI i wymagają późniejszego audytu merytorycznego.
- Audyty w `docs/audits/thematic/runtime/` zawierają stare założenia (m.in. ścieżki `.codex.js` i `md/`).
- `docs/legacy/` nie jest źródłem prawdy.
