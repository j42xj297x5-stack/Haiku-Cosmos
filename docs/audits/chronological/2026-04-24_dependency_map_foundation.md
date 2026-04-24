# 2026-04-24 — Dependency map foundation (Krok 7)

## 1. EXECUTIVE SUMMARY

Utworzono `docs/current/maps/DEPENDENCY_MAP.md` jako praktyczną mapę zależności między systemami gry, dokumentami (z podziałem statusów) i orientacyjnymi obszarami runtime.

Krok był dokumentacyjny: bez zmian mechaniki, runtime i UI.

## 2. Zakres mapy zależności

Mapa obejmuje trzy warstwy:
1. zależności według systemów,
2. zależności według statusów dokumentów,
3. zależności według typów zadań Codexa.

Dodatkowo zawiera:
- ostrzeżenia „nie ruszaj bez czytania X”,
- skrót kontraktu R-track (3-hit + takeover + auto-fail rozliczany w tle),
- sekcję evidence z kluczowymi audytami.

## 3. Dokumenty sprawdzone

- `README.md`
- `docs/README.md`
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/systems/I18N_SYSTEM.md`
- `docs/current/systems/ROADMAP.md`
- `docs/current/ui/UI_WORLD.md`
- `docs/current/visual/README.md`
- `docs/current/visual/ART_DIRECTION.md`
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`
- `tests/README.md`
- `tests/cards_sequence_three_hit_manual_checklist.md`
- `tests/cards_sequence_rtrack_takeover_smoke.test.js`
- `docs/audits/chronological/2026-04-24_docs_logs_foundation.md`
- `docs/audits/chronological/2026-04-24_docs_current_migration_step_1.md`
- `docs/audits/chronological/2026-04-24_sequence_three_hit_contract_audit.md`
- `docs/audits/chronological/2026-04-24_sequence_rtrack_direction_takeover_audit.md`
- `docs/audits/chronological/2026-04-24_rtrack_events_hud_audit.md`
- `AGENTS.md`

Uwaga: nie znaleziono osobnego audytu migracji visual w `docs/audits/chronological/`.

## 4. Kod zmapowany orientacyjnie

W mapie zależności uwzględniono orientacyjne powiązania runtime:
- `cards.js`
- `hc.collisions.js`
- `hc.debug.js`
- `hc.ui_debug.js`

Dodatkowo (orientacyjnie, bez głębokiego audytu funkcja-po-funkcji):
- `hc.render.js`
- `hc.view_input.js`
- `hc.meteors.js`
- `hc.world.js`

## 5. Utworzone / zmienione pliki

Utworzone:
- `docs/current/maps/DEPENDENCY_MAP.md`
- `docs/audits/chronological/2026-04-24_dependency_map_foundation.md`

Zmienione:
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `README.md`
- `AGENTS.md`

## 6. Najważniejsze zależności opisane

- Karty / R-track ↔ Ekonomia RP ↔ UI/HUD ↔ debug/runtime.
- SUB META ↔ CARDS ↔ ECONOMY ↔ UI.
- PRG ↔ SUB META ↔ UI ↔ visual (kierunek).
- Visual ↔ UI ↔ spójność kart i świata.
- i18n ↔ UI (+ CARDS dla treści kart).
- ROADMAP jako warstwa robocza, bez możliwości nadpisania kanonu.

## 7. Evidence / audyty podlinkowane

W mapie podlinkowano:
- `2026-04-24_docs_logs_foundation.md`
- `2026-04-24_docs_current_migration_step_1.md`
- `2026-04-24_sequence_three_hit_contract_audit.md`
- `2026-04-24_sequence_rtrack_direction_takeover_audit.md`
- `2026-04-24_rtrack_events_hud_audit.md`

Status migracji visual audytem: brak osobnego audytu w tym kroku.

## 8. Ryzyka i braki

- `PRG_SYSTEM.md` i `I18N_SYSTEM.md` pozostają w statusie `DO AKTUALIZACJI`.
- Mapa kodu jest celowo orientacyjna (to nie pełny audyt runtime).
- Brak osobnego audytu „visual migration” utrudnia pełną ścieżkę dowodową dla tego obszaru.

## 9. Rekomendowany następny krok

Najbardziej wartościowe kolejne kroki:
1. audyt i aktualizacja `PRG_SYSTEM.md` oraz `I18N_SYSTEM.md` do poziomu zgodności z runtime,
2. następnie audyt pełnej zgodności `docs/current/` ↔ implementacja runtime (system po systemie).
