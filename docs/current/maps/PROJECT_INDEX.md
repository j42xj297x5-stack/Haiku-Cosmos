# Haiku Cosmos — PROJECT_INDEX

> Status: KANON
> Obszar: Mapa projektu / indeks dokumentacji aktualnej
> Źródło prawdy: TAK
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: ../../README.md, ../README.md, ../systems/CARDS_SYSTEM.md, ../systems/ECONOMY_SYSTEM.md, ../systems/SUB_META_SYSTEM.md, ../ui/UI_WORLD.md

## Rola dokumentu

`PROJECT_INDEX.md` jest indeksem aktualnego kanonu w ramach struktury `docs/current/`.
Nie jest już „jedynym miejscem definiującym kanon” — kanon jest mapowany warstwowo przez:

1. `README.md` (root) — mapa całego repozytorium,
2. `docs/README.md` — mapa dokumentacji,
3. `docs/current/README.md` — mapa aktualnej dokumentacji kanonicznej,
4. `docs/current/maps/PROJECT_INDEX.md` (ten plik) — indeks dokumentów kanonicznych i roboczych w `docs/current/`.

## Indeks aktualnych dokumentów (krok 2 migracji)

### Mapy

- `docs/current/maps/PROJECT_INDEX.md` — główny indeks bieżącego kanonu.
- `docs/current/maps/DEPENDENCY_MAP.md` — **brak / do utworzenia** (zaplanować w kolejnym kroku).

### Systemy gry

- `docs/current/systems/CARDS_SYSTEM.md` (KANON)
- `docs/current/systems/ECONOMY_SYSTEM.md` (KANON)
- `docs/current/systems/SUB_META_SYSTEM.md` (KANON)
- `docs/current/systems/PRG_SYSTEM.md` (DO AKTUALIZACJI)
- `docs/current/systems/I18N_SYSTEM.md` (DO AKTUALIZACJI)
- `docs/current/systems/ROADMAP.md` (ROBOCZY)

### UI / flow

- `docs/current/ui/UI_WORLD.md` (KANON)

## Poza bieżącą paczką migracji

Poniższe dokumenty pozostają poza tym krokiem (do kolejnych etapów):

- dokumentacja wizualna (np. art direction, kosmologia wizualna, biblioteka materiałów),
- techniczne mapy implementacyjne i workflow z `md/`,
- historyczne/robocze audyty poza zakresem map + systems + UI/I18N.

## Zasady użycia indeksu

- Przy konflikcie między kodem a dokumentacją kanoniczną, dokumentacja w `docs/current/` ma pierwszeństwo projektowe.
- Przy konflikcie między dokumentami kanonicznymi i roboczymi, konflikt wpisujemy do audytu (bez agresywnego rozstrzygania w tym kroku).
- `docs/legacy/` nie jest źródłem prawdy i czytamy je wyłącznie na wyraźne polecenie.
