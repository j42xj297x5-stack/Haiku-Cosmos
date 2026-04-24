> Status: LEGACY / HISTORYCZNY
> Źródło prawdy: NIE
> Powód przeniesienia: dokument historyczny po migracji do docs/current/.
> Aktualne źródło prawdy: docs/current/README.md oraz docs/current/maps/PROJECT_INDEX.md

# Haiku Cosmos — CODEX_START.md
## Instrukcja pracy dla Codexa (kanon workflow)

Ten dokument opisuje zasady pracy Codexa z repo Haiku Cosmos.
Cel: szybkie iteracje bez demolki i bez konfliktów „source vs generated”.

---

## 1) Zasada nadrzędna: SOURCE vs GENERATED

### SOURCE (edytowalne przez Codex)
- `*.codex.js`
- `*.codex.html`
- dokumentacja `md/*.md`
- patche: `codex_patch*.js` (jeśli używane)

### GENERATED (mirror / runtime)
- `game.js` (oraz inne `*.js` bez `.codex.`)

Reguła:
- Codex NIE edytuje plików GENERATED.
- Codex edytuje wyłącznie SOURCE.

Uwaga:
- Pliki GENERATED mogą być nadpisywane (synchronizowane) z `.codex.*`.
- Nigdy nie blokujemy Codexa zdaniem „JS są nietykalne” – zamiast tego rozróżniamy SOURCE/GENERATED.

---

## 2) Uruchamianie lokalne

- Otwieramy `index.html` lub `index.codex.html` (w zależności od tego, co jest runtime).
- Jeśli runtime używa plików GENERATED (`game.js`) → po zmianach w `.codex.js` wykonujemy synchronizację (patrz rozdział 3).

---

## 3) Synchronizacja `.codex.js` → `*.js` (runtime)

Jeśli runtime ładuje `game.js`, a zmiany są w `game.codex.js`:

- źródło prawdy: `game.codex.js`
- mirror runtime: `game.js`

Zasada:
- po zmianach w `.codex.js` kopiujemy/aktualizujemy odpowiadający plik `.js`.

Ważne:
- jeśli Codex musi zmienić zachowanie gry, robi to w `.codex.js`.
- `.js` traktujemy jak build output.

---

## 4) Anchory i patchowanie (preferowany styl)

Preferujemy dopinanie zmian przez:
- anchory w kodzie (np. `[ANCHOR:CODEX_API]`)
- małe hooki + logika w osobnym pliku patcha

Jeśli potrzebujesz nowego hooka:
- dopisz go w `[ANCHOR:CODEX_API]` jako stabilne API (`window.HC.get()`),
- albo dodaj nowy anchor o unikalnej nazwie.

Patrz: `CODEX_PATCHPOINTS.md`.

---

## 5) Zasady zmian (kontrakty)

- Nie zmieniamy kolejności update/render bez jasnego powodu i testów.
- Karty: okno decyzji (klik = użycie, brak kliku = kolekcja).
- Efekty kart/rytuałów modulują parametry, nie hard-code w logice.

---

## 6) Workflow gałęzi (branching)

### Branch kanoniczny
- `codex/stable` = jedyny branch bazowy (działający)

### Branch roboczy
- Każdy task Codexa powstaje z `codex/stable`, np.:
  - `codex/feat-prestar`
  - `codex/feat-i18n-ui`
  - `codex/fix-camera`

### Jak “wprowadzić wynik”
Jeśli wynik jest OK:
- merge/PR do `codex/stable`
- dopiero potem kolejne zadania startują z aktualnego stable

Nie kopiujemy ręcznie plików do stable — robimy merge.

---

## 7) Minimalne wymagania w PR / zmianach

- Krótkie podsumowanie: co zmienia patch
- Informacja: które pliki SOURCE zmieniono
- Jak przetestowano (manualnie OK)

---

## 8) Status dokumentu

Dokument kanoniczny dla workflow Codexa.
