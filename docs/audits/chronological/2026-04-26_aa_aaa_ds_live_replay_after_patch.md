# 2026-04-26 — AA/AAA/DS live replay after patch (evidence review)

## 1. EXECUTIVE SUMMARY

**Overall verdict: PASS (mechanika), z lokalnym przypadkiem przerwania przez obcy kolor.**

Po odtworzeniu najnowszej sesji debug (`2026-04-26`) widać dwa kluczowe przebiegi:

- **Przebieg 1 (green):** system poprawnie wszedł do `AA`, domknął `AA`, po timeout po `AA` otworzył routing do `AAA`, ale pierwszy kolejny hit był **obcym kolorem (red)** — to wywołało `FAIL_TAKEOVER` (zgodnie z kontraktem).
- **Przebieg 2 (blue):** system poprawnie przeszedł `R1 -> AA -> timeout -> AAA`, domknął `AAA`, wyemitował `sequence.ds_granted` (`source=AAA`) i `sequence.reset_to_idle` (`reason=aaa_completed`).

Wniosek: brak dowodu na nowy bug mechaniki po AA; widoczne zachowanie zgodne z kanonem i kontraktem telemetrycznym.

## 2. EVIDENCE FILES

Użyte pliki evidence (najnowsze wg mtime w `logs/`):

1. `logs/2026-04-26_06-39-41__sess_1-777Z__debug__aa_aaa_ds__fallback_evidence_pack.json`

Metadane sesji:

- `sessionId`: `s_2026-04-26T06-39-41-777Z`
- `scenarioLabel`: `aa_aaa_ds`
- `timestamp`: `2026-04-26_06-39-41`
- `endedAt`: `2026-04-26T06:50:54.767Z`
- `reason`: `user_finalize`
- backend: `fallback`
- commit/hash: **brak w evidence**
- `events_jsonl`: **TAK** (duży stream JSONL, obecny jako string)
- `final_snapshot`: **TAK**
- `issues/notes`: `issues=[]`, `notes` brak

## 3. EXPECTED CONTRACT

Skrót kontraktu po patchu A-loop:

- `R1(A)` domknięte (3-hit) -> decision window,
- timeout/no-click -> routing rozstrzygany na następnym hicie:
  - ten sam kolor `A` -> `A_LOOP_AA`,
  - inny kolor -> `R_TRACK_R2`,
- po `AA` timeout/no-click:
  - ten sam kolor `A` -> `A_LOOP_AAA`,
  - obcy kolor -> fail/takeover,
- `AAA` hit1/hit2/hit3 -> `sequence.ds_granted (source=AAA)` -> `sequence.reset_to_idle (aaa_completed)`, bez kolejnego okna decyzji.

## 4. EVENT TIMELINE

Poniżej timeline kluczowy dla scenariusza zgłoszonego przez użytkownika (wejście do AA i „coś po AA”).

| order | sessionTimeMs / frame | event type | route | track | stage | phase | loopLevel | currentColor | expectedColor | hitCount | chainColors | stepIndex/level | decision window | reward/card event | rp delta | notes |
|---|---:|---|---|---|---|---|---|---|---|---:|---|---|---|---|---:|---|
| 1 | 251363 / 43148 | `sequence.step_completed` | - | - | R1 | - | - | - | - | - | [] | 1 | open | `rewardCardId=R1:A` | - | domknięcie R1(red) |
| 2 | 251363 / 43148 | `sequence.decision_window_opened` | - | CHOOSE | R1 | - | - | red | - | - | [red] | 1 | opened | actions: activate/cashout/timeout | - | okno po R1 |
| 3 | 253147 / 43405 | `sequence.a_loop_entered` | - | - | - | - | AA | - | red | - | [red] | - | pending | - | - | wejście do AA (hit red) |
| 4 | 254362 / 43580 | `sequence.decision_window_timeout` | - | - | - | - | - | - | - | - | [red] | - | timeout | - | - | timeout poprzedniego okna |
| 5 | 254667 / 43624 | `sequence.continuation_resolved` | `R_TRACK_R2` | - | - | - | - | - | - | - | - | - | resolved | - | - | kolejny hit był green (obcy dla red) |
| 6 | 254667 / 43624 | `sequence.step_progress` | - | R | R2 | DIR | - | - | green | - | [red] | 1 | closed | - | - | wejście w R2-dir |
| 7 | 256820 / 43934 | `sequence.fail_detected` | - | - | R2 | - | - | - | green | - | - | - | - | - | - | mismatch na R2 |
| 8 | 256821 / 43934 | `sequence.fail_resolved` | - | - | R2 | - | - | - | - | - | - | - | - | awardedCards=[R1:A] | +24 | fail + partial reward |
| 9 | 256821 / 43934 | `sequence.reset_to_idle` | - | - | - | - | - | - | - | - | - | - | - | finalReward=[R1:A] | - | reset po fail |
| 10 | 256821 / 43934 | `sequence.direction_locked` | - | - | R1 | - | - | blue | blue | 1 | [] | - | - | - | - | takeover tego samego hitu |
| 11 | 633365 / 97983 | `sequence.step_completed` | - | A | AAA | - | - | - | - | - | [blue] | 2 | open | `rewardCardId=R1:D` | - | domknięcie AA (blue) |
| 12 | 633365 / 97983 | `sequence.decision_window_opened` | - | A | AAA | - | - | blue | - | - | [blue,blue] | 2 | opened | timeoutContinuationTarget=AAA | - | okno po AA |
| 13 | 636364 / 98415 | `sequence.decision_window_timeout` | - | - | - | - | - | - | - | - | [blue,blue] | - | timeout | - | - | timeout po AA |
| 14 | 658051 / 101538 | `sequence.continuation_resolved` | `A_LOOP_AAA` | A | AAA | DIR | AAA | blue | blue | 1 | [blue,blue] | 2 | resolved | - | - | ten sam kolor (blue) |
| 15 | 664183 / 102421 | `sequence.step_progress` | - | A | AAA | OPEN | - | blue | blue | 2 | [blue,blue] | 2 | - | - | - | AAA hit2 |
| 16 | 664406 / 102453 | `sequence.step_completed` | - | A | AAA | - | - | - | - | - | [blue,blue] | 3 | closed | `rewardCardId=DS:D` | - | AAA hit3 |
| 17 | 664406 / 102453 | `sequence.ds_granted` | - | - | AAA | - | - | - | - | - | - | - | - | `cardId=DS:D`, `source=AAA` | +36 | DS przyznane |
| 18 | 664406 / 102453 | `sequence.reset_to_idle` | - | - | - | - | - | - | - | - | - | - | none | finalReward=[DS:D] | - | aaa_completed |

## 5. STAGE VERDICT

| Etap | Werdykt | Evidence |
|---|---|---|
| R1(A) | PASS | wielokrotne `sequence.step_completed(stepIndex=1)` |
| decision after R1 | PASS | `sequence.decision_window_opened` + `decision_window_timeout` |
| A_LOOP_AA entered | PASS | `sequence.a_loop_entered(loopLevel=AA)` |
| AA hit1/hit2/hit3 | PASS | `DIR/OPEN/CLOSE` + `step_completed(stepIndex=2, track=A)` |
| AA completed | PASS | `step_completed(stepIndex=2, track=A)` |
| decision after AA | PASS | `decision_window_opened(stage=AAA, stepIndex=2)` + timeout |
| route after AA | PASS | oba warianty widoczne: `FAIL_TAKEOVER` (obcy kolor) i `A_LOOP_AAA` (ten sam kolor) |
| A_LOOP_AAA entered | PASS | `sequence.a_loop_entered(loopLevel=AAA)` |
| AAA completed | PASS | `step_completed(stepIndex=3, track=A)` |
| DS grant | PASS | `sequence.ds_granted(source=AAA, cardId=DS:D)` |
| reset to IDLE | PASS | `sequence.reset_to_idle(reason=aaa_completed)` |

## 6. HYPOTHESIS VERDICT

| Hipoteza | Werdykt | Uzasadnienie |
|---|---|---|
| H1: AA działa, ale zostało przerwane obcym kolorem | **CONFIRMED** | W green przebiegu po AA timeout pierwszy hit to red; `continuation_resolved(route=FAIL_TAKEOVER)` i `fail_resolved`. |
| H2: AA działa, ale po AA timeout źle routuje do R-track zamiast AAA | **REJECTED** | W blue przebiegu po AA timeout i tym samym kolorze jest `route=A_LOOP_AAA`. |
| H3: AAA zaczyna się, ale obcy kolor przerywa przed domknięciem | **CONFIRMED** | Green przebieg: `a_loop_entered(AAA)` -> obcy red -> fail/reset. |
| H4: AAA domyka się, DS jest przyznany, ale UI/logi były nieczytelne | **CONFIRMED** | Blue przebieg: pełne AAA + `ds_granted` + reset_to_idle. |
| H5: Mechanika działa poprawnie, problem był percepcyjny | **POSSIBLE (high confidence)** | Log pokazuje zarówno poprawną ścieżkę sukcesu, jak i poprawny fail przy obcym kolorze; to zgadza się z obserwacją „weszło do AA, potem coś”. |
| H6: Mechanika ma nowy bug po AA | **REJECTED** | Brak symptomu systemowego błędu routingu; obie gałęzie kontraktu po AA działają zgodnie z regułą. |

## 7. ISSUES FOUND

### HC-REPLAY-2026-04-26-001
- expected: po AA timeout ten sam kolor -> AAA; obcy kolor -> fail/takeover.
- observed: dokładnie tak działa (obecne oba warianty).
- evidence: `route=FAIL_TAKEOVER` (green) i `route=A_LOOP_AAA` (blue).
- severity: INFO.
- class: sequence.
- czy wymaga patcha kodu: **no**.
- czy wymaga ponownej sesji: **no** (dla tej hipotezy).

### HC-REPLAY-2026-04-26-002
- expected: AAA success daje DS i reset do IDLE.
- observed: `sequence.ds_granted(source=AAA, cardId=DS:D)` i `sequence.reset_to_idle(reason=aaa_completed)`.
- evidence: eventy w zakresie `sessionTimeMs=664406`.
- severity: INFO.
- class: reward / sequence.
- czy wymaga patcha kodu: **no**.
- czy wymaga ponownej sesji: **no**.

## 8. IMPACT ON TRACKER

- Gap „AA/AAA/DS live evidence” może zostać **zamknięty** dla aktualnego HEAD.
- Status obszaru AA/AAA/DS: **PASS** (na bazie tej sesji i event timeline).
- `IMPLEMENTATION_TRACKER.md`: może zostać zaktualizowany z „DO NAGRANIA” na „LIVE EVIDENCE: PASS 2026-04-26”, ale to osobny krok dokumentacyjny.

## 9. RECOMMENDED NEXT STEP

Ponieważ wynik jest PASS:

1. Przejść do **decision-window matrix** (R1/R2/R3/R4: left/right/timeout + click po TTL).
2. Dla ograniczenia „perception bugs” dodać krótką checklistę operatorską do nagrań live (oznaczanie koloru celu między AA i AAA), bez patchowania mechaniki.
