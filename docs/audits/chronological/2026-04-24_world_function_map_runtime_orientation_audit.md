# 2026-04-24 — WORLD_FUNCTION_MAP runtime orientation audit

## 1. EXECUTIVE SUMMARY

Wykonano audyt orientacyjny dokumentu `docs/current/technical/WORLD_FUNCTION_MAP.md` oraz jego synchronizację z aktualnym runtime (bez patchowania JS i bez uruchamiania gry).

Wynik: dokument został uporządkowany do statusu **ROBOCZY** jako mapa techniczna orientacyjna. Zaktualizowano nazwy plików (`*.js` zamiast historycznych `*.codex.js`), doprecyzowano granice źródła prawdy i oznaczono obszary wymagające pełnej walidacji runtime jako **DO WERYFIKACJI**.

## 2. Zakres sprawdzonych dokumentów

Sprawdzono:
- `docs/current/technical/WORLD_FUNCTION_MAP.md`
- `docs/current/technical/IMPLEMENTATION_TRACKER.md`
- `docs/current/technical/README.md`
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/systems/I18N_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`
- `tests/README.md`
- `tests/cards_sequence_three_hit_manual_checklist.md`
- `tests/cards_sequence_rtrack_takeover_smoke.test.js`
- `logs/README.md`
- `docs/audits/chronological/2026-04-24_docs_current_full_consistency_audit.md`
- `docs/audits/chronological/2026-04-24_prg_system_structural_canon_update.md`
- `docs/audits/chronological/2026-04-24_i18n_system_structural_canon_update.md`
- `docs/handoff/2026-04-24_docs_current_clean_handoff.md`

## 3. Status WORLD_FUNCTION_MAP przed i po

Przed:
- `DO AKTUALIZACJI`
- niejednoznaczne granice source of truth
- historyczne odwołania do `*.codex.js`

Po:
- `ROBOCZY`
- jawny status: „Źródło prawdy: CZĘŚCIOWO — robocza mapa orientacyjna; NIE zastępuje audytu kodu”
- zaktualizowane odwołania do aktualnych plików runtime (`cards.js`, `game.boot.js`, `hc.*.js`)

## 4. Zakres orientacyjnego porównania z runtime

Wykonano tylko:
- sprawdzenie istnienia plików runtime wymienionych w mapie,
- sprawdzenie obecności głównych funkcji/nazw (orientacyjnie, przez `rg`),
- identyfikację oczywistych historycznych nazw.

Nie wykonywano:
- uruchamiania runtime,
- testów JS,
- walidacji linia-po-linii każdej funkcji.

## 5. Potwierdzone pliki/funkcje

### Potwierdzone pliki runtime
- `cards.js`
- `game.boot.js`
- `hc.world.js`
- `hc.meteors.js`
- `hc.collisions.js`
- `hc.asteroids.js`
- `hc.planets.js`
- `hc.comets.js`
- `hc.stars_epoch.js`
- `hc.render.js`
- `hc.ui_debug.js`
- `hc.debug.js`
- `index.codex.html`

### Potwierdzone nazwy/funkcje (próbka orientacyjna)
- `spawnMeteor`, `spawnStreamMeteor`, `updateMeteors`
- `resolveMeteorCollisionsSafe`
- `spawnAsteroidFromCollision`, `captureMeteorsByAsteroids`, `startAsteroidCollapse`, `finishCollapseToPlanet`
- `captureMeteorsByPlanets`, `transformGasPlanetIntoStar`
- `startStarEpochZoomOut`, `captureBodiesByStars`
- `addScore`, `HC.UI.init`, `HC.UI.update`, `HC.Render.frame`
- `bindWorld`, `onCardCollected`, `flushPendingCard`, `onRunActivateR1`, `onRunActivateR2`, `renderSubMetaOverlay`, `handlePointerDown`
- `HC.RunTimers.*`, `HC.WorldEvents.*`

## 6. Poprawione ścieżki/nazwy/statusy

- Zmieniono status `WORLD_FUNCTION_MAP.md` z `DO AKTUALIZACJI` na `ROBOCZY`.
- Ujednolicono odniesienia plikowe z historycznych `*.codex.js` do aktualnych `*.js`.
- Doprecyzowano notę o ograniczeniach dokumentu (mapa orientacyjna, nie kanon funkcja-po-funkcji).
- Sekcję rozjazdów utrzymano jako `DO WERYFIKACJI` zamiast „rozstrzygnięte”.

## 7. Fragmenty oznaczone DO WERYFIKACJI

- `World.r1Seq` / `World.r2Seq` vs aktualny runtime `World.r1`.
- Zachowanie `pack01ReleaseBlockColor`/`pack01ReleaseBlockUntilMs` w przepływie aktywacji.
- Relacja `RunTimers.isColorDisabled` do intencji aktywacji kolorów.
- Faktyczny przepływ R2 i jego sprzężenie z overlayem/UI.
- Użycie `EffectTimers` w produkcyjnym flow.
- Zakres aktywacji SUB-META z perspektywy runtime.
- Zakres sprzężenia „offers/ritual” z R-track.

## 8. Zmiany w IMPLEMENTATION_TRACKER.md

- Dodano informację, że `WORLD_FUNCTION_MAP.md` została zsynchronizowana orientacyjnie do statusu `ROBOCZY`.
- Doprecyzowano otwarty obszar PRG/i18n (kanon strukturalny, dalsze strojenie/wdrożenie), bez cofania statusów do `DO AKTUALIZACJI`.
- Pozostawiono zadanie przyszłego pełnego audytu runtime funkcja-po-funkcji jako osobny krok.

## 9. Zmiany w mapach

Zaktualizowano status i opis `WORLD_FUNCTION_MAP.md` w:
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`
- `docs/current/technical/README.md`

W `DEPENDENCY_MAP.md` dokument został też dopisany do listy `ROBOCZY`.

## 10. Handoff — utworzony / nieutworzony i dlaczego

**Utworzony**: `docs/handoff/2026-04-24_docs_current_post_world_map_handoff.md`.

Powód: po zmianie statusu `WORLD_FUNCTION_MAP.md` warstwa `docs/current/` nie zawiera już dokumentów ze statusem `DO AKTUALIZACJI`.

## 11. Czego nie robiono

- Nie patchowano runtime.
- Nie modyfikowano plików JS.
- Nie zmieniano mechanik gry.
- Nie robiono pełnego audytu funkcja-po-funkcji.
- Nie uruchamiano runtime ani testów JS.

## 12. Ryzyka i braki

- `WORLD_FUNCTION_MAP.md` nadal nie jest kanonem technicznym implementacji.
- Część sekcji mapy pozostaje orientacyjna i wymaga pełnego audytu runtime.
- Rozbieżności R-track/SUB-META/PRG między dokumentami systemowymi a implementacją pozostają obszarem walidacji technicznej.

## 13. Rekomendowany następny krok

Przy braku dokumentów `DO AKTUALIZACJI` w `docs/current/` rekomendowane są dwa równorzędne kierunki:
1. powrót do projektowania/implementacji PRG,
2. start kroku wdrożeniowego i18n (locale, loader, fallback, testy).

Jeśli potrzebny jest twardy kontrakt runtime, najpierw wykonać osobny pełny audyt funkcja-po-funkcji dla `WORLD_FUNCTION_MAP.md`.
