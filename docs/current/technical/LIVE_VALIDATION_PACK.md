> Status: ROBOCZY
> Obszar: techniczne / walidacja live + evidence
> Źródło prawdy: CZĘŚCIOWO (kontrakt roboczy evidence)
> Ostatnia aktualizacja: 2026-04-25
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
- [ ] wejście w A-track i domknięcie R1(A),
- [ ] przejście AA (kolekcja 2×R1A),
- [ ] przejście AA (aktywacja R1A),
- [ ] przejście AA bez kliknięcia → AAA,
- [ ] AAA auto-grant DS(A) i reset do IDLE,
- [ ] przypadek przerwania AA/AAA obcym kolorem (takeover).

B. **Decision window matrix**
- [ ] R1: left / right / timeout,
- [ ] R2: left / right / timeout,
- [ ] R3: left / right / timeout,
- [ ] R4: left / right / timeout,
- [ ] potwierdzenie, że klik po TTL nie aktywuje starego pending decision.

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
