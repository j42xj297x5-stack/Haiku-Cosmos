# 2026-04-24 — Technical docs semantic sync (Krok 9)

## 1. EXECUTIVE SUMMARY

Wykonano audyt i synchronizację semantyczną dokumentów `docs/current/technical/` po migracji dokumentacji do `docs/current/`.

Wynik:
- `WORLD_FUNCTION_MAP.md` utrzymano jako **DO AKTUALIZACJI** (bez przepisywania mapy merytorycznej).
- `IMPLEMENTATION_TRACKER.md` uporządkowano do roli aktywnego trackera i podniesiono do **ROBOCZY**.
- `LIVE_VALIDATION_PACK.md` zsynchronizowano z aktualnym modelem `logs/` + `tests/` + audyty R-track i podniesiono do **ROBOCZY**.
- Zaktualizowano mapy (`docs/current/README.md`, `PROJECT_INDEX.md`, `DEPENDENCY_MAP.md`) pod nowe statusy.

## 2. Zakres sprawdzonych dokumentów

Techniczne:
- `docs/current/technical/README.md`
- `docs/current/technical/WORLD_FUNCTION_MAP.md`
- `docs/current/technical/IMPLEMENTATION_TRACKER.md`
- `docs/current/technical/LIVE_VALIDATION_PACK.md`

Mapy i wejścia:
- `README.md`
- `docs/README.md`
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`

Kanon systemowy i UI (semantyczne odniesienie):
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/systems/I18N_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`

Evidence:
- `logs/README.md`
- `tests/README.md`
- `tests/cards_sequence_three_hit_manual_checklist.md`
- `tests/cards_sequence_rtrack_takeover_smoke.test.js`
- audyty chronologiczne R-track z dnia 2026-04-24.

## 3. Status przed i po

- `technical/README.md`: informacyjny (bez bloku statusu) → uporządkowany status mapy technical.
- `WORLD_FUNCTION_MAP.md`: **DO AKTUALIZACJI** → **DO AKTUALIZACJI** (bez zmiany statusu).
- `IMPLEMENTATION_TRACKER.md`: **DO AKTUALIZACJI** → **ROBOCZY**.
- `LIVE_VALIDATION_PACK.md`: **DO AKTUALIZACJI** → **ROBOCZY**.

## 4. Zmiany w WORLD_FUNCTION_MAP.md

Zakres ograniczony do warstwy semantycznej:
- doprecyzowany blok statusu i obszaru,
- usunięte odwołanie do `md/*.md` jako aktywnego źródła,
- dodana nota ostrzegawcza, że dokument wymaga osobnego audytu runtime i nie jest pełnym źródłem prawdy.

Mapa funkcji świata nie była przepisywana merytorycznie.

## 5. Zmiany w IMPLEMENTATION_TRACKER.md

- Przekształcono dokument do formy roboczego trackera operacyjnego.
- Wprost rozdzielono sekcje:
  - wykonane,
  - historyczne/migracyjne,
  - do weryfikacji,
  - do aktualizacji.
- Usunięto pozór „pełnego kanonu runtime”; dokument jasno deklaruje rolę pomocniczą.

## 6. Zmiany w LIVE_VALIDATION_PACK.md

- Zsynchronizowano dokument z kontraktem `logs/README.md`:
  - `logs/runs/YYYY-MM-DD_HH-MM-SS/`,
  - `run_manifest.json`, `runtime_events.jsonl`, `run_summary.json`.
- Spięto walidację z `tests/README.md` i artefaktami testowymi/checklistami.
- Dodano odniesienia do audytów R-track jako evidence i punktu porównawczego.
- Uporządkowano granice dokumentu: kontrakt roboczy walidacji, nie kanon mechaniki.

## 7. Aktualizacje map

Zaktualizowano:
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`

Zakres:
- nowe statusy `IMPLEMENTATION_TRACKER.md` i `LIVE_VALIDATION_PACK.md` = **ROBOCZY**,
- utrzymane ostrzeżenie, że `WORLD_FUNCTION_MAP.md` pozostaje **DO AKTUALIZACJI** i wymaga osobnego audytu runtime.

## 8. Orientacyjne sprawdzenie runtime/ścieżek

Wykonano orientacyjne sprawdzenie referencji (bez pełnego audytu runtime):
- odniesienia do `cards.js`, `hc.collisions.js`, `hc.debug.js`, `hc.ui_debug.js`,
- zgodność ścieżek `logs/README`, `tests/README`,
- obecność kontraktu `run_manifest` / `runtime_events` / `run_summary` w dokumentacji.

Nie patchowano runtime i nie uruchamiano testów runtime.

## 9. Rozjazdy dokumentacja ↔ dokumentacja

Poprawione:
- odwołania technical do nieaktualnego `md/`,
- brak jasnego rozróżnienia ról dokumentów technical,
- niespójne statusy technical w mapach.

Do dalszego audytu:
- pełna zgodność merytoryczna `WORLD_FUNCTION_MAP.md` z aktualnym kodem runtime,
- starsze audyty tematyczne runtime zawierające historyczne odwołania (`.codex.js`, dawne ścieżki) wymagają osobnego przeglądu porządkującego.

## 10. Czego nie rozstrzygano

- Nie wykonywano pełnego audytu runtime JS.
- Nie zmieniano mechanik, sekwencji ani balansu.
- Nie podnoszono `WORLD_FUNCTION_MAP.md` do ROBOCZY/KANON.
- Nie rozstrzygano dużych konfliktów systemowych PRG/i18n.

## 11. Ryzyka i braki

- `WORLD_FUNCTION_MAP.md` nadal ma status **DO AKTUALIZACJI** i może zawierać rozjazdy wobec runtime.
- Dokumenty `PRG_SYSTEM.md` i `I18N_SYSTEM.md` pozostają **DO AKTUALIZACJI**, co ogranicza pełną spójność przekrojową.
- Część historii w audytach runtime wymaga osobnej normalizacji nazw/ścieżek.

## 12. Rekomendowany następny krok

Zgodnie z decyzją projektową:
**pełny audyt `docs/current/` jako całości**, przed powrotem do projektowania/rozszerzania PRG i i18n.
