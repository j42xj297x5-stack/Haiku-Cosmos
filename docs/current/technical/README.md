# docs/current/technical

> Status: ROBOCZY
> Obszar: mapa dokumentów technicznych
> Źródło prawdy: NIE (warstwa pomocnicza do kanonu)
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: ../README.md, ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md

Katalog `docs/current/technical/` zawiera dokumenty techniczne używane do pracy operacyjnej,
audytów i synchronizacji dokumentacji z runtime.

## Status dokumentów

- `WORLD_FUNCTION_MAP.md` — **ROBOCZY** (aktywna mapa techniczna orientacyjna; nie zastępuje pełnego audytu runtime)
- `SEQUENCE_STATE_CONTRACT.md` — **ROBOCZY / KONTRAKT TECHNICZNY** (single source-of-truth sekwencji + zasady evidence timeline)
- `IMPLEMENTATION_TRACKER.md` — **ROBOCZY** (tracker wdrożeń i obszarów do weryfikacji)
- `LIVE_VALIDATION_PACK.md` — **ROBOCZY** (roboczy kontrakt walidacji runów i evidence)

## Zasady

1. Dokumenty techniczne nie nadpisują kanonu z `docs/current/systems/` i `docs/current/ui/`.
2. Status **DO AKTUALIZACJI** oznacza, że dokument nie może być traktowany jako pełne źródło prawdy.
3. Status **ROBOCZY** oznacza dokument operacyjny, utrzymywany na bieżąco, ale nadal niekanoniczny.
4. Dokumenty historyczne i migracyjne znajdują się w `docs/legacy/` oraz `docs/audits/`.


## Snapshot status (2026-04-26)

- Sequence core (3-hit, takeover, R-track, A-loop AA/AAA/DS) ma status PASS na testach i live evidence.
- Decision-window matrix ma status TESTED AUTOMATED PASS (audyt potwierdzony).
- HUD clarity pozostaje **NEXT / OUT_OF_SCOPE_UI_CLARITY** dla osobnego wątku UI.
