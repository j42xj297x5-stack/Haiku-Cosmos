# 2026-04-24 — Sequence R-track Direction Takeover Audit

## 1. EXECUTIVE SUMMARY

Wykonano audyt dokumentacji i runtime dla kontraktu „obcy kolor nie jest martwym resetem” w całym R-track.

W runtime (`cards.js`) wykryto, że przejęcie kierunku było wdrożone tylko dla `stepIndex === 0` (R1). Dla głębszych etapów (`stepIndex > 0`) mismatch kończył się `failSequence()` i utratą bieżącego trafienia jako hit1 nowej sekwencji.

Wprowadzono minimalny patch: po failu na głębszym etapie to samo trafienie obcego koloru natychmiast ustanawia nowy kierunek jako hit1/3.

Dopisano doprecyzowania w CARDS/UI/ECONOMY oraz dodano katalog `tests/` z checklistą manualną przypadków granicznych.

## 2. Sprawdzone dokumenty

- `AGENTS.md`
- `README.md`
- `docs/README.md`
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/visual/README.md`

## 3. Sprawdzone miejsca w kodzie

- `cards.js`
  - `onHitColor(...)` — obsługa hitów, mismatch i przejść DIR/OPEN/CLOSE.
  - `canStartStepWithColor(...)` — walidacja wejścia na kolejny krok.
  - `closeSequenceStep(...)` — zamknięcie kroku i przejście poziomu.
  - `failSequence(...)` — rozliczenie faila i reset sekwencji.
  - `resetSequenceState(...)` — reset runtime sekwencji.
- `hc.collisions.js`
  - `notifyHitColor(...)` — przekazanie hitu koloru do CardEngine.
  - `resolveMeteorCollisionsSafe(...)` — źródło zdarzeń koloru z kolizji meteorów.

## 4. Kontrakt R-track po decyzji projektowej

Kontrakt potwierdzony/skorygowany:

- krok atomowy to zawsze 3 trafienia (`hit1` kierunek, `hit2` otwarcie, `hit3` zamknięcie),
- obcy kolor przerywa aktualny kierunek,
- na głębszych etapach R-track fail rozlicza się automatycznie z nagrodami częściowymi,
- obcy kolor nie przepada: to samo trafienie jest od razu `hit1/3` nowej sekwencji,
- gameplay i HUD mają kontynuować bez pauzy wymagającej dodatkowego trafienia.

## 5. Wynik porównania dokumentacja ↔ implementacja

Przed patchem:
- dokumentacja wskazywała zasadę „obcy kolor nie przepada”,
- runtime realizował ją pewnie tylko dla pierwszego kroku (`stepIndex === 0`),
- runtime na głębszych krokach wykonywał fail/reset bez natychmiastowego przejęcia trafienia.

Po patchu:
- runtime realizuje przejęcie kierunku po failu także dla głębszych etapów R-track,
- to samo trafienie mismatch jest mapowane na `DIR` nowej sekwencji (hit1).

## 6. Zmiany w dokumentacji

- `docs/current/systems/CARDS_SYSTEM.md`
  - doprecyzowano, że zasada działa w całym R-track (R1/R2/R3/R4) oraz że fail na głębszym etapie rozlicza się automatycznie, a mismatch staje się hit1 nowej sekwencji.
- `docs/current/ui/UI_WORLD.md`
  - doprecyzowano, że HUD po failu na R2/R3/R4 ma od razu pokazać nowy kierunek.
- `docs/current/systems/ECONOMY_SYSTEM.md`
  - dopisano notę operacyjną o automatycznym rozliczeniu faila i zachowaniu hit1 nowego kierunku.

## 7. Zmiany w kodzie

- `cards.js` (`onHitColor`):
  - dla mismatch przy `stepIndex > 0` wykonuje się `failSequence(World)`,
  - następnie bez utraty bieżącego trafienia uruchamiany jest nowy kierunek (`currentColor = incoming`, `hits = 1`, `phase = DIR`),
  - naliczanie punktów dla nowego hit1 pozostaje spójne z istniejącym liczeniem hitów.

## 8. Testy / checklisty

- Utworzono katalog `tests/`.
- Dodano `tests/README.md`.
- Dodano checklistę manualną `tests/cards_sequence_three_hit_manual_checklist.md`.
- Checklista pokrywa przypadki:
  - `A B B B`,
  - `A A B B B`,
  - `A A A B B C C C`,
  - `A A A B B B C C D D D`,
  - oraz dodatkowe przypadki bazowe/przerywane.

## 9. Ryzyka i pytania otwarte

- Brak lekkiego, istniejącego harnessu testów automatycznych dla runtime sekwencji (bez budowy nowej infrastruktury).
- `PRG_SYSTEM.md` ma status „DO AKTUALIZACJI”, więc część opisów powiązań systemowych jest nadal niespójna formalnie (poza zakresem tego kroku).
- Warto osobno zweryfikować, czy eventy debugowe dla fail+restart są konsumowane przez wszystkie narzędzia telemetryczne bez regresji.

## 10. Rekomendowany następny krok

1. Osobny audyt pełnej zgodności R2/R3/R4 (runtime + eventy + HUD debug).
2. Po domknięciu pełnej zgodności dopiero utworzenie `docs/current/maps/DEPENDENCY_MAP.md`.
