> Status: DO AKTUALIZACJI
> Obszar: techniczne / walidacja
> Źródło prawdy: CZĘŚCIOWO
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: ../../../logs/README.md, ../maps/DEPENDENCY_MAP.md

# Live Validation Pack (Krok 5)

## Cel
Jedna sesja debug (`sessionId`) ma generować jeden porównywalny pakiet dowodowy:

- `session_meta`
- `events_jsonl`
- `final_snapshot`
- `summary`
- `notes`
- `issues` (issue ledger powiązany z sesją)

## Jak uruchomić sesję
1. Start overlay → **Debug Mode**.
2. W sekcji **Scenario** wybierz preset:
   - `r1_success`
   - `sequence_fail`
   - `cashout_r2`
   - `aa_aaa_ds`
   - `asteroid_to_planet`
   - `planet_to_star`
   - `normal_regression`
3. (Opcjonalnie) ustaw `Custom label`.
4. Kliknij **Start Debug Session**.

## Jak zebrać evidence pack
1. W runtime overlay wpisz notatkę w polu **Session note**.
2. Kliknij **Export evidence**.
3. Przeglądarka pobierze:
   - `hc_evidence_<sessionId>.json`
   - `hc_evidence_<sessionId>.events.jsonl`

Dodatkowo pack jest zapisywany w `localStorage` pod kluczem:
- `hc_evidence_pack_<sessionId>`

## Jak zapisać issue record
1. Kliknij **Mark issue**.
2. Wypełnij prompty (`title`, `category`, `severity`, `expected`, `observed`, `reproSteps`).
3. Record zapisuje się:
   - w pamięci sesji (`issues` w evidence packu),
   - globalnie w `localStorage` pod `hc_issue_ledger_v1`.

Model:

```json
{
  "issueId": "issue_*",
  "sessionId": "s_*",
  "scenarioLabel": "r1_success",
  "title": "string",
  "category": "sequence|reward|transform|ui|logging|regression",
  "severity": "low|medium|high|critical",
  "expected": "string",
  "observed": "string",
  "reproSteps": "string",
  "timestamp": "ISO-8601",
  "relatedEventIds": [],
  "relatedSnapshot": "runtime_snapshot"
}
```

## Manual checklist runner
Dla każdego scenariusza uruchom osobną sesję i zapisz PASS/FAIL:

1. `r1_success`
2. `sequence_fail`
3. `cashout_r2` (lub `cashout_r3` jako custom label)
4. `aa_aaa_ds`
5. `asteroid_to_planet`
6. `planet_to_star`
7. `normal_regression`

Wynik scenariusza powinien zawierać:
- `sessionId`
- `scenarioLabel`
- PASS/FAIL
- ścieżkę do evidence (`hc_evidence_<sessionId>.json`)
- listę issueId (jeśli wystąpiły)
