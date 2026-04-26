# Haiku Cosmos — DEPENDENCY_MAP

> Status: KANON
> Obszar: mapa zależności projektu
> Źródło prawdy: TAK, dla relacji między dokumentami/systemami
> Ostatnia aktualizacja: 2026-04-26
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
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/systems/PRG_SYSTEM.md` (KANON STRUKTURALNY / DO STROJENIA)
- `docs/current/systems/I18N_SYSTEM.md` (KANON STRUKTURALNY / DO WDROŻENIA)
- `docs/current/ui/UI_WORLD.md`

### KIERUNEK
- `docs/current/visual/README.md`
- `docs/current/visual/ART_DIRECTION.md`
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`
- `docs/current/visual/SUB_META_FIGMA_BRIEF.md` (KIERUNEK / BRIEF WYKONAWCZY)
- `docs/current/visual/SUB_META_LAYOUT_SPEC.md` (KIERUNEK / SPECYFIKACJA LAYOUTU)
- `docs/current/visual/SUB_META_COMPONENTS.md` (KIERUNEK / BIBLIOTEKA KOMPONENTÓW)
- `docs/current/visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md` (KIERUNEK / SZABLON PROMPTU)

### ROBOCZY
- `docs/current/systems/ROADMAP.md`
- `docs/current/technical/README.md`
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

- `docs/current/technical/WORLD_FUNCTION_MAP.md` ma status ROBOCZY i służy jako mapa orientacyjna runtime; nie zastępuje audytu funkcja-po-funkcji.
- `docs/current/systems/PRG_SYSTEM.md` ma status KANON STRUKTURALNY / DO STROJENIA: struktura osi i relacje R1/R2/ODB są kanoniczne, ale wartości liczbowe i feeling runtime wymagają dalszego strojenia.
- Relacja PRG ↔ SUB-META ↔ UI ↔ visual jest obowiązująca kierunkowo: struktura i slotowanie (`SUB_META_SYSTEM.md`), prezentacja i przełączanie (`UI_WORLD.md`), feeling i materiał (`docs/current/visual/*`).
- Relacja I18N ↔ UI ↔ CARDS ↔ PRG ↔ ECONOMY ↔ SUB-META jest obowiązująca strukturalnie: I18N definiuje warstwę językową i fallback (`I18N_SYSTEM.md`), a systemy domenowe definiują sens i miejsce użycia tekstów (`UI_WORLD.md`, `CARDS_SYSTEM.md`, `PRG_SYSTEM.md`, `ECONOMY_SYSTEM.md`, `SUB_META_SYSTEM.md`).
- `docs/current/systems/I18N_SYSTEM.md` ma status KANON STRUKTURALNY / DO WDROŻENIA: zasady językowe, zakres tłumaczeń, model kluczy i fallback są kanoniczne, ale implementacja runtime (pliki locale, loader, przełącznik języka, testy) pozostaje do wdrożenia.
- `docs/current/technical/IMPLEMENTATION_TRACKER.md` i `docs/current/technical/LIVE_VALIDATION_PACK.md` mają status ROBOCZY (operacyjny, niekanoniczny).
- Audyty w `docs/audits/thematic/runtime/` zawierają stare założenia (m.in. ścieżki `.codex.js` i `md/`).
- `docs/legacy/` nie jest źródłem prawdy.
- Pakiet SUB-META + Figma w `docs/current/visual/` definiuje kierunek i ramę wykonawczą, ale nie zmienia mechaniki systemów.
