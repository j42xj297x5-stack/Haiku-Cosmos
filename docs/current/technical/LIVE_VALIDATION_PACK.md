> Status: ROBOCZY
> Obszar: techniczne / walidacja live + evidence
> Źródło prawdy: CZĘŚCIOWO (kontrakt roboczy evidence)
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: ../../../logs/README.md, ../../../tests/README.md, ../../audits/chronological/2026-04-24_sequence_three_hit_contract_audit.md, ../../audits/chronological/2026-04-24_sequence_rtrack_direction_takeover_audit.md, ../../audits/chronological/2026-04-24_rtrack_events_hud_audit.md

# Live Validation Pack

Dokument definiuje **roboczy kontrakt walidacji uruchomień** (run + evidence).
Nie jest to pełny kanon mechaniki — to praktyczny standard zbierania dowodów do audytów.

## 1. Kontrakt minimalny runu (repo)

Każdy run powinien mieć katalog:

- `logs/runs/YYYY-MM-DD_HH-MM-SS/`

Minimalny zestaw plików:

- `run_manifest.json`
- `runtime_events.jsonl`
- `run_summary.json`

Zgodnie z `logs/README.md`, katalog `logs/runs/` nie powinien być commitowany do repo.

## 2. Evidence z sesji debug (runtime)

Dla sesji debug (`sessionId`) zbieramy pakiet porównywalny między runami:

- `session_meta`
- `events_jsonl`
- `final_snapshot`
- `summary`
- `notes`
- `issues`

Eksport runtime może dodatkowo generować pliki lokalne typu:

- `hc_evidence_<sessionId>.json`
- `hc_evidence_<sessionId>.events.jsonl`

oraz wpisy `localStorage` (sesyjne i ledger issue).

## 3. Kontrakt testowo-audytowy

Punkt odniesienia dla walidacji R-track:

- `tests/cards_sequence_three_hit_manual_checklist.md`
- `tests/cards_sequence_rtrack_takeover_smoke.test.js`
- `tests/cards_sequence_a_loop_aa_aaa_ds.test.js` (regresja routingu A-loop: `R1(A) -> timeout -> AA/AAA/DS`)
- audyty chronologiczne z 2026-04-24 (three-hit, direction takeover, events/HUD)

Minimalny opis wyniku scenariusza:

- `sessionId`
- `scenarioLabel`
- PASS/FAIL
- referencja do evidence (`run_manifest` lub eksport `hc_evidence_*`)
- lista `issueId` (jeśli dotyczy)

### 3.1 Wymagane nowe sesje debug (po audycie 2026-04-25)

Checklisty obowiązkowe na aktualnym HEAD:

A. **AA/AAA/DS focus**
- [x] wejście w A-track i domknięcie R1(A),
- [x] przejście AA (kolekcja 2×R1A),
- [x] przejście AA (aktywacja R1A),
- [x] przejście AA bez kliknięcia → AAA,
- [x] AAA auto-grant DS(A) i reset do IDLE,
- [x] przypadek przerwania AA/AAA obcym kolorem (takeover).

B. **Decision window matrix**
- [x] R1: left / right / timeout,
- [x] R2: left / right / timeout,
- [x] R3: left / right / timeout,
- [x] R4: left / right / timeout,
- [x] potwierdzenie, że klik po TTL nie aktywuje starego pending decision.

C. **Economy focus**
- [ ] RP bazowe per harmonic hit,
- [ ] mnożniki dla pierwszego ciągu (x2..x5),
- [ ] próba ciągu drugiego (x6..x9),
- [ ] reset chain po fail,
- [ ] reset chain po activate/cashout,
- [ ] częściowe nagrody RP/kart po fail R2/R3/R4.

### 3.3 Required diagnostic events for AA/AAA/DS evidence

Dla scenariusza `A A A -> timeout -> A A A -> timeout -> A A A -> DS(A) -> IDLE`
evidence jest uznawany za rozstrzygający tylko jeśli `events_jsonl` zawiera:

- `sequence.decision_window_opened`
- `sequence.decision_window_timeout`
- `sequence.decision_window_closed` (dla wariantów z kliknięciem)
- `sequence.a_loop_entered` **albo** `sequence.continuation_resolved`
- `sequence.ds_granted`
- `sequence.reset_to_idle`

Brak powyższych eventów może utrzymać review AA/AAA/DS w statusie **INCONCLUSIVE** nawet przy poprawnym `final_snapshot`.

### 3.4 Confirmed evidence pack (A -> AA -> AAA -> DS)

Potwierdzony pakiet evidence na aktualnym etapie:

- `logs/2026-04-26_08-10-08__sess_8-101Z__debug__aa_aaa_ds__fallback_evidence_pack.json`
- `sessionId`: `s_2026-04-26T08-10-08-101Z`
- `scenarioLabel`: `aa_aaa_ds`
- wynik: `PASS`

Wymagane eventy potwierdzone w timeline:

- `sequence.continuation_resolved`
- `sequence.a_loop_entered`
- `sequence.ds_granted` (`source=AAA`)
- `sequence.reset_to_idle` (`reason=aaa_completed`)

Uwaga metodologiczna: `final_snapshot` nie zastępuje timeline eventów i nie może samodzielnie rozstrzygać przebiegu timeout/route/fail.

### 3.5 Closed evidence gaps

Zamknięte luki evidence po audytach z 2026-04-26:

- AA/AAA/DS: **CLOSED (AUTOMATED + LIVE EVIDENCE PASS)**
- Decision-window matrix: **CLOSED (AUTOMATED PASS + audit confirmation)**

Otwarte luki (poza tym etapem):

- economy multipliers (x2..x9),
- PRG runtime binding/toggle i R2 runtime activation,
- HUD clarity (UI-only wątek, bez zmiany mechaniki).

### 3.2 Format nazewnictwa sesji

Dla porównywalności evidence używamy formatu:

- `YYYY-MM-DD_HH-MM-SS__<focus>__<scenario>`

Gdzie:
- `<focus>` ∈ `aa-aaa-ds` | `decision-matrix` | `economy`,
- `<scenario>` = krótki slug (`r2-right-cashout`, `aaa-autods`, `chain-reset-fail` itd.).

Przykład:
- `2026-04-25_18-10-22__decision-matrix__r3-timeout`

## 4. Klasy ryzyk i rozjazdów

W trakcie walidacji oznaczamy rozjazdy co najmniej w klasach:

- `sequence`
- `reward`
- `transform`
- `ui`
- `logging`
- `regression`

Każdy issue powinien wskazywać: `expected`, `observed`, `reproSteps`, timestamp i powiązany `sessionId`.

## 5. Granice dokumentu

## 6. Odczyt evidence: timeline vs stan końcowy

**Ostrzeżenie kluczowe:** `final_snapshot` pokazuje wyłącznie stan końcowy sesji, a nie timeline zdarzeń.

Konsekwencje:
- `final_snapshot` nie wystarcza do diagnozy momentu fail/takeover,
- decyzje o zgodności mechaniki wymagają analizy `events_jsonl`,
- wnioski „co się stało najpierw” wolno wyciągać tylko z event stream (`sessionTimeMs`/`frame`), nie ze snapshotu końcowego.

Nie wolno wnioskować z samego `final_snapshot`:
- czy takeover nastąpił poprawnie „na tym samym hicie”,
- czy decision window zamknęło się timeoutem czy kliknięciem,
- czy RP chain multiplier został zastosowany w odpowiednim kroku.

- Dokument nie zastępuje `docs/current/systems/*` ani `docs/current/ui/*`.
- Dokument nie wymusza konkretnego narzędzia eksportu; opisuje wspólny format evidence.
- Szczegóły runtime/debug mogą ewoluować, ale kontrakt plików runu i spójność evidence muszą zostać zachowane.
