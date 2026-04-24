# HAIKU COSMOS — Audyt kontraktu atomowych 3 trafień sekwencji

Data: 2026-04-24  
Zakres: dokumentacja `docs/current/` + runtime sekwencji w `cards.js`

## 1. EXECUTIVE SUMMARY

- Przeprowadzono audyt kontraktu „3 trafienia tego samego koloru” i zachowania przy trafieniu obcego koloru w trakcie kroku.
- Dokumentacja była częściowo niespójna (w `CARDS_SYSTEM.md` pozostawał zapis o 2 trafieniach).
- Runtime w `cards.js` dla przypadku koloru obcego podczas pierwszego kroku zwracał FAIL zamiast natychmiastowego przejęcia trafienia jako hit1 nowego kierunku.
- Wprowadzono minimalny patch runtime i minimalne doprecyzowania dokumentów kanonicznych.

## 2. Sprawdzone dokumenty

- `README.md`
- `docs/README.md`
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/systems/PRG_SYSTEM.md`
- `AGENTS.md`

Wnioski:
- Mapy README i index poprawnie prowadzą do dokumentów kanonicznych.
- SUB_META i PRG nie definiują kontraktu atomowego 3-hit w sposób konfliktowy.
- `CARDS_SYSTEM.md`, `UI_WORLD.md`, `ECONOMY_SYSTEM.md` wymagały doprecyzowania pod kątem „obcy kolor = nowy hit1”.

## 3. Sprawdzone miejsca w kodzie

- `cards.js`
  - `onHitColor(...)` — rdzeń obsługi hitów i przejść `IDLE` / `IN_STEP`.
  - `canStartStepWithColor(...)` — walidacja startu kroku po zamknięciu poprzednich etapów.
  - `failSequence(...)`, `resetSequenceState(...)` — zachowanie fail/reset.
  - `closeSequenceStep(...)` — domknięcie hit3/3.
- `hc.collisions.js`
  - `notifyHitColor(...)` / `resolveMeteorCollisionsSafe()` — źródło przekazania hitów do CardEngine.

## 4. Aktualny kontrakt 3 trafień

Kontrakt atomowego kroku:
- hit1/3: ustanowienie kierunku,
- hit2/3: otwarcie kroku sekwencji,
- hit3/3: zamknięcie kroku sukcesem.

Kontrakt przerwania przez obcy kolor:
- poprzedni kierunek zostaje przerwany,
- poprzedni licznik nie jest kontynuowany,
- trafienie obcego koloru nie przepada,
- to trafienie staje się hit1/3 nowego kierunku.

## 5. Wynik porównania dokumentacja ↔ implementacja

Przed zmianą:
- Dokumentacja: niespójna (2-hit vs 3-hit, brak jednoznacznego opisu natychmiastowego hit1 nowego koloru).
- Implementacja: w `onHitColor` trafienie obcego koloru podczas zbierania kroku kończyło się fail/resetem (dla pierwszego kroku), więc nowe trafienie było tracone jako hit1.

Po zmianie:
- Dokumentacja i runtime są spójne dla atomowego kroku: obcy kolor przejmuje kierunek jako hit1/3.

## 6. Zmiany w dokumentacji

- `docs/current/systems/CARDS_SYSTEM.md`
  - korekta 5.1 z 2-hit na 3-hit,
  - dopisanie formalnego kontraktu hit1/hit2/hit3,
  - doprecyzowanie reguły obcego koloru jako nowego hit1.
- `docs/current/ui/UI_WORLD.md`
  - dopisanie zasady UI: obcy kolor podczas zbierania = zmiana kierunku i hit1/3 nowego koloru.
- `docs/current/systems/ECONOMY_SYSTEM.md`
  - dopisanie krótkiej noty operacyjnej o naliczaniu RP zgodnym z nowym kierunkiem po przerwaniu.

## 7. Zmiany w kodzie

- `cards.js`
  - w `onHitColor(...)` dla przypadku mismatch koloru podczas `IN_STEP` na pierwszym kroku (`stepIndex === 0`) zamiast fail/reset:
    - ustawiany jest nowy `currentColor`,
    - hit liczy się jako `1/3`,
    - faza przechodzi do `DIR`,
    - RP naliczane jak dla hit1 bieżącego kroku,
    - zwracana akcja `dir`.

## 8. Testy / checklisty

Brak dedykowanej infrastruktury testów automatycznych dla tej ścieżki w repo.

Manualna checklista audytowa (scenariusze kontraktowe):
1. `A → A → A` → sukces kroku A (hit3/3 zamyka).
2. `A → B → B → B` → B sukces po 3 trafieniach B, gdzie pierwsze B to hit1 po przerwaniu A.
3. `A → A → B → B → B` → A przerwane na 2/3, B przejęte jako hit1 i domknięte.
4. `A → B → A → A → A` → B przerwane przez A, następnie A domknięte jako nowy kierunek.

## 9. Ryzyka i pytania otwarte

- Obecny patch celowo dotyczy atomowego kroku pierwszego etapu (`stepIndex === 0`), aby uniknąć niekontrolowanej zmiany pełnej logiki R2/R3/R4.
- W kolejnym kroku warto formalnie rozstrzygnąć, czy analogiczne „przejęcie hit1” ma obowiązywać również na dalszych etapach R-track.
- Istnieją starsze sekcje dokumentacji o failach sekwencji; wymagają dalszego porządkowania, ale poza zakresem minimalnego patcha.

## 10. Rekomendowany następny krok

- Utworzyć `docs/current/maps/DEPENDENCY_MAP.md` i wpisać jawnie zależność runtime `cards.js` ↔ dokumenty `CARDS_SYSTEM.md`, `UI_WORLD.md`, `ECONOMY_SYSTEM.md`.
- Alternatywnie: wykonać osobny audyt zgodności całego R-track (R2/R3/R4) między implementacją a kanonem `docs/current/`.
