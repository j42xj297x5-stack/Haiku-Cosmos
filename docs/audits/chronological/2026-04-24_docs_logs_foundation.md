# 2026-04-24 — Audyt fundamentu docs/logs

## EXECUTIVE SUMMARY

Wykonano bezpieczny krok fundamentowy: przygotowano strukturę `docs/` i `logs/`, dodano mapy README oraz zasady źródła prawdy (`current`) i archiwizacji (`legacy`). Nie zmieniano mechaniki gry ani kodu UI.

## Co sprawdzono

- Katalog główny repo i istniejący `README.md`.
- Istnienie indeksów dokumentacji (`md/README.md`, `md/haiku_cosmos_index.md`).
- Obecne miejsca dokumentacji (głównie katalog `md/`).
- Brak katalogu `docs/` przed zmianą.
- Brak katalogu `logs/` przed zmianą.
- Brak pliku `.gitignore` przed zmianą.
- Brak katalogów `archive/`, `old/`, `legacy/`, `exp/` w drzewie projektu (poza `.git/logs`).

## Co utworzono

- Strukturę katalogów `docs/`:
  - `docs/current/{maps,systems,ui,visual,technical,workflow}`
  - `docs/legacy/`
  - `docs/audits/{chronological,thematic}`
  - `docs/handoff/`
- Strukturę katalogów `logs/`:
  - `logs/README.md`
  - `logs/runs/.gitkeep`

## Co zmieniono

- Zaktualizowano root `README.md` do roli mapy wejścia repo.
- Dodano mapy i zasady w:
  - `docs/README.md`
  - `docs/current/README.md`
  - `docs/legacy/README.md`
  - `docs/audits/README.md`
  - `docs/handoff/README.md`
- Dodano `.gitignore` z regułami dla `logs/runs/`.

## Czego nie ruszano

- Nie zmieniano mechaniki gry, UI i kodu runtime (`game*.js`, `hc.*.js`, `cards.js`).
- Nie przenoszono masowo dokumentów z `md/` do `docs/current/`.
- Nie usuwano żadnych dokumentów.
- Nie przenoszono niczego do `docs/legacy/`.

## Znalezione ryzyka

1. Rozproszenie kanonu: dokumenty kanoniczne i robocze nadal znajdują się głównie w `md/`.
2. Niespójności nazewnicze plików (spacje, różne konwencje, mieszany język), np. `ECONOMY SYSTEM.md`, `SUB META SYSTEM.md`.
3. Istnieje więcej niż jeden punkt wejścia do dokumentacji (`README.md`, `md/README.md`, `md/haiku_cosmos_index.md`), co może powodować rozjazdy interpretacyjne.
4. Brak formalnego rejestru statusu dokumentów (kanoniczny/roboczy/do migracji) poza mapami README.

## Rekomendowany następny krok

Wykonać krok 2: audyt i kontrolowana migracja dokumentów kanonicznych z `md/` do `docs/current/` (obszarami), z równoległą aktualizacją map oraz jednoznacznym oznaczeniem statusu każdego dokumentu.
