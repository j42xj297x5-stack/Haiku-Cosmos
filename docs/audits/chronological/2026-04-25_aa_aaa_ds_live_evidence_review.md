# 2026-04-25 — AA/AAA/DS live evidence review (A -> AA -> AAA)

## 1. EXECUTIVE SUMMARY

**Overall verdict: INCONCLUSIVE (with FAIL signals for AA/AAA path).**

Jednozdaniowy werdykt: w dostępnym, najnowszym evidence streamie nie udało się potwierdzić kanonicznej ścieżki **A -> AA -> AAA** (widać głównie cykl **R1(A) -> R2 fail/takeover**), więc scenariusz A-loop nie jest potwierdzony runtime evidence.

- Czy DS(A) został przyznany w tej sesji jako efekt AAA: **INCONCLUSIVE / brak dowodu eventowego**.
- Czy sekwencja wróciła do IDLE po AAA: **INCONCLUSIVE / brak AAA w streamie**.
- Najbardziej prawdopodobne źródło problemu: **jakość/zakres debug evidence + możliwe uruchomienie innej ścieżki (R-track) zamiast A-loop**, nie da się jednoznacznie przesądzić samej mechaniki AAA bez nowego runu.

## 2. EVIDENCE FILES

Użyte pliki:

1. `logs/2026-04-24_16-00-56__sess_6-669Z__debug__aa_aaa_ds__fallback_evidence_pack.json`
   - zawiera: `session_meta`, `summary`, `final_snapshot`, `issues`, `events_jsonl`.

Session metadata (z pakietu):

- `sessionId`: `s_2026-04-24T16-00-56-669Z`
- `scenarioLabel`: `aa_aaa_ds`
- zakończenie sesji (`summary.endedAt`): `2026-04-24T16:03:40.950Z`
- reason: `user_finalize`

Uwaga o świeżości:

- W `logs/` dostępny jest tylko powyższy fallback pack (data 2026-04-24), brak świeższego runu z 2026-04-25.

## 3. EXPECTED CONTRACT (KANON)

Wg kanonu (`CARDS_SYSTEM` + `UI_WORLD`) dla scenariusza A-loop:

1. Pierwsze `A A A` zamyka `R1(A)`.
2. Po `R1(A)` pojawia się decision window (3s).
3. Brak kliknięcia/timeout kontynuuje pętlę R1 do `AA`.
4. Drugie `A A A` zamyka `AA`.
5. Po `AA` pojawia się decision window: aktywacja `R1A` / kolekcja `2×R1A` / timeout -> `AAA`.
6. Trzecie `A A A` zamyka `AAA`.
7. `AAA` automatycznie przyznaje `DS(A)`.
8. Po `DS(A)` sekwencja automatycznie wraca do `IDLE`.
9. `AAA` nie otwiera kolejnego decision window.
10. Podstawa oceny: event stream (`events_jsonl`), nie sam `final_snapshot`.

## 4. EVENT TIMELINE (rekonstrukcja)

Poniżej zdarzenia sekwencyjne kluczowe dla przebiegu (kolor A = `red`):

| # | sessionTimeMs / frame | event type | category | stage/phase/track | currentColor | expectedColor | hitCount | chainColors | stepIndex/level | decision window | rewards/cards | rp delta | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 7347 / 3599 | `sequence.direction_locked` | sequence | `R1 / DIR / -` | red | red | 1 | [] | 0 | brak eventu | - | - | hit1 ustanawia kierunek |
| 2 | 25604 / 6228 | `sequence.step_progress` | sequence | `R1 / OPEN / -` | red | red | 2 | [] | 0 | brak eventu | - | - | hit2 otwarcie kroku |
| 3 | 34314 / 7482 | `sequence.step_completed` | sequence | `R1 / CLOSE / -` | - | - | - | [] | 1 | brak eventu | `R1:A` | - | hit3 domyka R1(A) |
| 4 | 48167 / 9477 | `sequence.step_progress` | sequence | `R2 / DIR / R` | red | red | 1 | [red] | 1 | brak eventu | - | - | zamiast jawnego AA runtime idzie do R2 |
| 5 | 51931 / 10019 | `sequence.fail_resolved` | sequence | `R2 / fail / R` | - | - | - | [red] | 1 | brak eventu | `[R1:A]` | +9 | mismatch na R2, fail auto-resolved |
| 6 | 51931 / 10019 | `sequence.direction_locked` | sequence | `R1 / DIR / -` | yellow | yellow | 1 | [] | 0 | brak eventu | - | - | takeover: nowy hit1 po failu |
| 7 | 52201 / 10058 | `sequence.direction_locked` | sequence | `R1 / DIR / -` | red | red | 1 | [] | 0 | brak eventu | - | - | przełączenie kierunku na red |
| 8 | 68056 / 12341 | `sequence.step_completed` | sequence | `R1 / CLOSE / -` | - | - | - | [] | 1 | brak eventu | `R1:A` | - | kolejne zamknięcie R1(A) |
| 9 | 89438 / 15420 | `sequence.step_progress` | sequence | `R2 / DIR / R` | red | red | 1 | [red] | 1 | brak eventu | - | - | ponownie wejście w R2 |
| 10 | 97868 / 16634 | `sequence.fail_resolved` | sequence | `R2 / fail / R` | - | - | - | [red] | 1 | brak eventu | `[R1:A]` | +14 | drugi fail R2 |
| 11 | 97869 / 16634 | `sequence.direction_locked` | sequence | `R1 / DIR / -` | blue | blue | 1 | [] | 0 | brak eventu | - | - | takeover po failu |
| 12 | 108001 / 18093 | `sequence.direction_locked` | sequence | `R1 / DIR / -` | red | red | 1 | [] | 0 | brak eventu | - | - | powrót do red |
| 13 | 135321 / 22027 | `sequence.step_completed` | sequence | `R1 / CLOSE / -` | - | - | - | [] | 1 | brak eventu | `R1:A` | - | trzecie domknięcie R1(A) w sesji |
| 14 | 151577 / 24368 | `sequence.step_progress` | sequence | `R2 / DIR / R` | red | red | 1 | [red] | 1 | brak eventu | - | - | znów R2 |
| 15 | 159466 / 25504 | `sequence.fail_resolved` | sequence | `R2 / fail / R` | - | - | - | [red] | 1 | brak eventu | `[R1:A]` | +14 | trzeci fail R2 |
| 16 | 159466 / 25504 | `sequence.direction_locked` | sequence | `R1 / DIR / -` | green | green | 1 | [] | 0 | brak eventu | - | - | takeover po failu |

Wnioski z timeline:

- Widzimy wielokrotnie: `R1(A)` domknięte -> próba `R2` -> fail -> takeover.
- **Nie ma** jawnej sekwencji eventów, które potwierdzałyby wejście w `AA` i `AAA`.
- **Nie ma** eventów decision window (`opened`/`timeout`/`closed`) ani jawnego eventu DS grant.

## 5. STAGE VERDICT

| Etap | Verdict | Uzasadnienie |
|---|---|---|
| R1(A) | PASS | Trzykrotnie występuje pełny 3-hit i `sequence.step_completed` dla `R1:A`. |
| decision after R1 | INCONCLUSIVE | Brak eventów decision window; po R1 runtime przechodzi w `R2`, ale nie da się dowieść czy to timeout path AA czy inny flow. |
| AA | FAIL (evidence) | W streamie brak rozpoznawalnego etapu `AA` (brak osobnych eventów AA i brak 3-hit domknięcia AA). |
| decision after AA | INCONCLUSIVE | Brak dowodu, bo AA nie zostało wykazane eventowo. |
| AAA | FAIL (evidence) | Brak eventów potwierdzających krok AAA i jego domknięcie. |
| DS grant | INCONCLUSIVE | DS występuje tylko jako initial cards z bootstrapu sesji; brak runtime eventu przyznania DS po AAA. |
| reset to IDLE | INCONCLUSIVE | Widać `sequence.reset` po failach R2, ale nie ma ścieżki AAA->DS->IDLE do walidacji. |

## 6. DEBUG QUALITY

Ocena jakości debug evidence dla tego scenariusza: **niewystarczająca do potwierdzenia AA/AAA/DS**.

- Event stream zawiera dobry sygnał dla atomowego 3-hit i fail/takeover (`direction_locked`, `step_progress`, `step_completed`, `fail_*`).
- Brakuje eventów semantycznych dla decision window i AAA/DS:
  - brak `decision_window_opened`, `decision_window_timeout`, `decision_window_closed`,
  - brak jawnego `ds_granted` / `sequence.finalized_to_idle`.
- `final_snapshot` jest mylący jako źródło oceny scenariusza (pokazuje jedynie stan końcowy: aktywna sekwencja `R1`, `hitCount=1`, kolor `green`).

## 7. ISSUES FOUND

### ISSUE HC-EVID-AAA-001
- **expected:** pełna ścieżka A->AA->AAA widoczna w eventach.
- **observed:** po `R1(A)` widać przejścia do `R2` i fail/takeover; brak identyfikowalnych eventów `AA`/`AAA`.
- **evidence:** wielokrotne `sequence.step_progress(stage=R2, track=R)` po `sequence.step_completed(R1:A)`.
- **severity:** HIGH
- **class:** sequence / logging
- **czy wymaga patcha kodu:** unknown (na tym etapie nie)
- **czy wymaga lepszego debug evidence:** yes

### ISSUE HC-EVID-AAA-002
- **expected:** decyzje po R1 i AA (open/timeout/close) jawnie logowane.
- **observed:** brak jakichkolwiek eventów decision window.
- **evidence:** brak typów eventów zawierających `decision`, `timeout`, `window`.
- **severity:** HIGH
- **class:** logging
- **czy wymaga patcha kodu:** no (mechanika nie była patchowana w tym etapie)
- **czy wymaga lepszego debug evidence:** yes

### ISSUE HC-EVID-AAA-003
- **expected:** DS(A) po AAA potwierdzony eventowo.
- **observed:** DS pojawia się wyłącznie jako stan początkowy (`initialCards`), brak runtime grant eventu.
- **evidence:** `card.created/card.collected DS:A` tylko na `sessionTimeMs=8` (bootstrap), brak późniejszych DS eventów.
- **severity:** MEDIUM
- **class:** reward / logging
- **czy wymaga patcha kodu:** unknown
- **czy wymaga lepszego debug evidence:** yes

## 8. IMPACT ON EXISTING AUDIT

- **G-006 (AA/AAA hard evidence) z audytu 2026-04-25 nie jest zamknięty.**
- Status obszaru AA/AAA/DS pozostaje: **NEEDS_RUNTIME_EVIDENCE**.
- Na podstawie tego pakietu nie rekomenduję zmiany statusu na PASS.
- `LIVE_VALIDATION_PACK` może wymagać doprecyzowania o obowiązkowe eventy decision/AAA/DS, ale to osobny krok dokumentacyjny.

## 9. RECOMMENDED NEXT STEP

Ponieważ wynik jest **INCONCLUSIVE z fail-sygnałami w evidence**, rekomenduję:

1. Nagrać nową sesję debug dedykowaną dokładnie scenariuszowi:
   - `A A A` -> timeout/no click,
   - `A A A` -> timeout/no click,
   - `A A A`.
2. Upewnić się, że event stream zawiera (minimum):
   - `sequence.direction_locked`, `sequence.step_progress`, `sequence.step_completed`,
   - `decision_window_opened`, `decision_window_timeout`, `decision_window_closed`,
   - `reward/card grant` dla AA,
   - `ds_granted` dla AAA,
   - `sequence.reset_to_idle`/równoważny event końca.
3. Dopiero po takim runie przejść do werdyktu patch/no-patch dla mechaniki.

## 10. VALIDATION (wykonane checki)

- `node tests/cards_sequence_rtrack_takeover_smoke.test.js` -> PASS
- Analiza checklisty manualnej: `tests/cards_sequence_three_hit_manual_checklist.md` -> odniesiona w ocenie takeover i atomowego 3-hit.

## Follow-up (telemetry hardening)

Po tym review wymagane jest telemetry hardening (bez zmiany mechaniki): jawne eventy decision window, przejść A-loop, DS grant i reset-to-idle, aby kolejny run AA/AAA/DS dał werdykt rozstrzygający.
