> Status: ROBOCZY
> Obszar: techniczne / walidacja live + evidence
> Źródło prawdy: CZĘŚCIOWO (kontrakt roboczy evidence)
> Ostatnia aktualizacja: 2026-04-24
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

- Dokument nie zastępuje `docs/current/systems/*` ani `docs/current/ui/*`.
- Dokument nie wymusza konkretnego narzędzia eksportu; opisuje wspólny format evidence.
- Szczegóły runtime/debug mogą ewoluować, ale kontrakt plików runu i spójność evidence muszą zostać zachowane.
