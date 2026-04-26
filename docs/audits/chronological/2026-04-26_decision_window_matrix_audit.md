# 2026-04-26 — Decision window matrix audit (R1/R2/R3/R4/AA + click-after-TTL)

## 1. EXECUTIVE SUMMARY

**Verdict: PARTIAL**

- Pokrycie testowe decision-window matrix zostało rozszerzone o nowy test automatyczny obejmujący R1/R2/R3/R4/AA/AAA oraz telemetryczne eventy decision window.
- Wykryto **jednoznaczne rozjazdy kontraktu** na ścieżce R1:
  1. Left click po R1(A) aktywuje R1, ale karta R1(A) pozostaje w magazynie (kontrakt oczekuje aktywacji bez kolekcji).
  2. Cashout emituje `sequence.reset_to_idle`, ale `reason` nie jest `cashout` (obecnie reset domyślny).
- Click-after-TTL jest walidowany testem i zachowanie jest implementacyjnie zabezpieczone przez warunek widoczności overlay + timeout close.
- AAA pozostaje bez decision window (zgodnie z kontraktem), z auto DS i resetem do IDLE.

## 2. COVERAGE BEFORE

Przed dodaniem nowego testu:

- `tests/cards_sequence_a_loop_aa_aaa_ds.test.js`
  - pokrywa timeout routing (`R1 -> AA`, `AA -> AAA`, `R1 -> R2`) i AAA->DS->IDLE,
  - **nie pokrywa** left/right klików decision window,
  - **nie pokrywa** click-after-TTL.
- `tests/cards_sequence_rtrack_takeover_smoke.test.js`
  - pokrywa takeover/fail na hitach (R-track),
  - **nie pokrywa** okien decyzji.
- `tests/cards_sequence_diagnostic_events.test.js`
  - pokrywa obecność kluczowych eventów timeout/AAA,
  - **nie pokrywa** pełnej matrycy left/right/timeout/click-after-TTL per stage.

Wniosek: przed tym krokiem coverage decision-window matrix był **niepełny** (brak pełnej matrycy R1/R2/R3/R4/AA).

## 3. TEST MATRIX

| stage | left click | right click | timeout | click after TTL | status |
|---|---|---|---|---|---|
| R1 | test added (activate + reset) | test added (cashout + reset) | test added (continue) | test added | **FAIL (2 issues)** |
| AA | test added | test added (2xR1) | test added (`AA -> AAA`) | test added | PASS (w ramach obecnych asercji) |
| R2 | - | test added (`R2AB`) | test added (`R2 -> R3`) | test added | PASS (w ramach obecnych asercji) |
| R3 | - | test added (`R3ABC`) | test added (`R3 -> R4`) | - | PASS (w ramach obecnych asercji) |
| R4 | - | test added (`R4ABCD`) | (kontynuacja runtime) | - | PASS (w ramach obecnych asercji) |
| AAA | n/a | n/a | auto path | n/a | PASS (brak decision window) |

## 4. EVENT / DEBUG COVERAGE

Nowy test potwierdza i/lub asertuje obecność:

- `sequence.decision_window_opened`
- `sequence.decision_window_timeout`
- `sequence.decision_window_closed` (+ `clickedSide`, `selectedAction`)
- `sequence.continuation_resolved` (route m.in. `A_LOOP_AAA`, `R_TRACK_R3`, `R_TRACK_R4`)
- `sequence.ds_granted` (AAA)
- `sequence.reset_to_idle` (z reason)

Ocena: coverage diagnostyczny decision window jest wystarczający do evidence review.

## 5. ISSUES FOUND

### HC-DM-2026-04-26-001
- expected:
  - po R1(A) left click: aktywacja R1(A), **bez dodania karty do magazynu**, reset do IDLE.
- observed:
  - po left click karta R1(A) jest obecna w `World.cardsPool`.
- severity: HIGH
- class: sequence/reward
- patch needed: **yes** (minimalny patch mechaniki aktywacji/pending reward commit).

### HC-DM-2026-04-26-002
- expected:
  - po cashout `sequence.reset_to_idle.reason = "cashout"`.
- observed:
  - ścieżka cashout kończy się `resetSequenceState()` bez reason (`"reset"`).
- severity: MEDIUM
- class: logging/diagnostic-contract
- patch needed: **yes** (minimalny patch telemetryczny: jawny reason `cashout`).

## 6. FILES CHANGED

- `tests/cards_sequence_decision_window_matrix.test.js`
- `docs/audits/chronological/2026-04-26_decision_window_matrix_audit.md`

## 7. TESTING

Uruchomiono:

- `node tests/cards_sequence_rtrack_takeover_smoke.test.js` -> PASS
- `node tests/cards_sequence_a_loop_aa_aaa_ds.test.js` -> PASS
- `node tests/cards_sequence_diagnostic_events.test.js` -> PASS
- `node tests/cards_sequence_decision_window_matrix.test.js` -> FAIL (kontraktowe asercje dla R1 left/cashout reason)

## 8. NEXT STEP

Status PARTIAL:

1. przygotować **osobny minimalny patch** decision-window:
   - naprawa braku „no-collect” dla left activate po R1/AA,
   - doprecyzowanie `reset_to_idle.reason="cashout"` na ścieżce cashout.
2. po patchu powtórzyć matrix + replay evidence.

Po domknięciu: przejść do economy focus / RP multipliers.
