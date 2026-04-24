# logs

Katalog `logs/` służy do logów uruchomień (runtime).

## Struktura runów

Każde uruchomienie powinno tworzyć katalog:

`logs/runs/YYYY-MM-DD_HH-MM-SS/`

Minimalny kontrakt plików runu:

- `run_manifest.json`
- `runtime_events.jsonl`
- `run_summary.json`

## Zasady

- Surowe logi runtime nie są dokumentacją projektową.
- Katalog `logs/runs/` nie powinien być commitowany do repozytorium.
- Kontrakt użycia logów i evidence jest opisany w `docs/current/technical/LIVE_VALIDATION_PACK.md` (status: ROBOCZY).
