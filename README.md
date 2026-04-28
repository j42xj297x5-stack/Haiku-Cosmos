# Haiku Cosmos

> Visual checkpoint 2026-04-28: Modular Frame Kit v0.1 is exported to repo as 35 SVG with `assets/visual/modular_frame_kit_v01_manifest.json`, static preview board, and `docs/current/technical/FRAME_COMPOSER_SPEC.md`. Runtime integration is not implemented.

Haiku Cosmos to kontemplacyjna gra-system, w której decyzje gracza wpływają na stan świata i przebieg epok.

## Mapa wejściowa repozytorium

- Kod gry (runtime): pliki `game*.js`, `hc.*.js`, `cards.js`, `index.codex.html`.
- Dokumentacja projektowa: katalog [`docs/`](docs/README.md).
- Logi uruchomień: katalog [`logs/`](logs/README.md).

## Gdzie jest aktualny kanon

- Źródłem prawdy jest dokumentacja w [`docs/current/`](docs/current/README.md).
- Indeks kanonu znajduje się w [`docs/current/maps/PROJECT_INDEX.md`](docs/current/maps/PROJECT_INDEX.md).
- Mapa zależności systemów/dokumentów/kodu znajduje się w [`docs/current/maps/DEPENDENCY_MAP.md`](docs/current/maps/DEPENDENCY_MAP.md).
- Dokumenty techniczne robocze są w [`docs/current/technical/`](docs/current/technical/README.md).
- `docs/legacy/` nie jest źródłem prawdy i służy dokumentom historycznym/zastąpionym.

## Audyty i przekazania

- Audyty: [`docs/audits/`](docs/audits/README.md)
- Krótkie przekazania stanu po większych zmianach: [`docs/handoff/`](docs/handoff/README.md)

## Punkt startowy dla Codexa

1. Ten plik (`README.md`) jako mapa repo.
2. [`docs/README.md`](docs/README.md) jako mapa dokumentacji.
3. [`docs/current/README.md`](docs/current/README.md) jako mapa aktualnego kanonu.
4. [`docs/current/maps/PROJECT_INDEX.md`](docs/current/maps/PROJECT_INDEX.md) jako indeks dokumentów kanonicznych i roboczych.

## Ostatnia większa aktualizacja dokumentacji

- **2026-04-27** — reset visual SVG pipeline dla SUB-META/HUD: obecny pass `style_correction` przeniesiony do legacy/evidence, aktywny manifest SVG wyczyszczony, dodany prompt pod nowy modular frame kit Figma.
