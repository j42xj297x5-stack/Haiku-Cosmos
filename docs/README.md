# Dokumentacja Haiku Cosmos

Ten katalog jest główną mapą dokumentacji projektu.

## Struktura

- [`current/`](current/README.md) — aktualna dokumentacja kanoniczna (źródło prawdy).
- [`legacy/`](legacy/README.md) — dokumenty nieaktualne, zastąpione lub mylące względem aktualnego stanu.
- [`audits/`](audits/README.md) — audyty projektu (chronologiczne i tematyczne).
- [`handoff/`](handoff/README.md) — krótkie dokumenty przekazania stanu po większych zmianach.

## Aktualne snapshoty techniczne

- Snapshot techniczny GLB/PBR po naprawie Three material pipeline znajduje się w [`current/technical/WORLD_RENDERING_MODEL.md`](current/technical/WORLD_RENDERING_MODEL.md); krótka notka materiałowa jest w [`current/visual/BIBLIOTEKA_MATERIALOW.md`](current/visual/BIBLIOTEKA_MATERIALOW.md).

## Zasady

1. `docs/current/` jest źródłem prawdy dla decyzji projektowych i implementacyjnych.
2. Dla pracy z ChatGPT-architektem używaj startowo `docs/current/README_ARCHITECT.md` (skrót pamięci; nie zastępuje pełnego kanonu).
3. `docs/legacy/` czytaj tylko na wyraźne polecenie (kontekst historyczny).
4. Po większych zmianach aktualizuj mapy README (`README.md`, `docs/README.md`, `docs/current/README.md`).
