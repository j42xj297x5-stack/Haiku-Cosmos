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

- **2026-06-04** — snapshot dokumentacyjny Three GLB/PBR material pipeline po naprawie: runtime zachowuje PBR/`MeshStandardMaterial`, a aktualne `public/glb/*.glb` mają 21 materiałów, 12 z metalicznością, 0 tekstur i 0 normalMap; kolejny pass Blendera powinien eksportować mapy.
- **2026-04-27** — reset visual SVG pipeline dla SUB-META/HUD: obecny pass `style_correction` przeniesiony do legacy/evidence, aktywny manifest SVG wyczyszczony, dodany prompt pod nowy modular frame kit Figma.

## Vite / GitHub Pages deployment

Projekt jest konfigurowany jako vanilla JS + Vite dla GitHub Pages project site.

- Lokalny start: `npm install`, potem `npm run dev`.
- Build produkcyjny: `npm run build` tworzy `dist/`.
- Preview produkcyjnego buildu: `npm run preview`.
- Deployment: push na branch `Haiku-Cosmos` uruchamia GitHub Actions i publikuje `dist/` na GitHub Pages.
- URL docelowy: `https://j42xj297x5-stack.github.io/Haiku-Cosmos/`.
- Wymagany Vite base: `/Haiku-Cosmos/`.
- Publiczne assety PNG/SVG/GLB/tekstury należy ładować przez `publicPath` / `publicAssetPath` z `hc.public_path.js`.
- Legacy/global runtime JS (`hc.*.js`, `cards.js`, `game.boot.js`) pozostaje źródłowo w root repozytorium, a przed dev/build jest synchronizowany przez `scripts/sync-legacy-runtime.mjs` do `public/runtime/`, skąd Vite publikuje go jako `dist/runtime/`.
- Katalogi przyszłych assetów publicznych: `public/models/world/`, `public/png/`, `public/svg/`, `public/textures/`.
- Prawdziwe assety są wgrywane ręcznie przez projektanta; w repo nie dodajemy binarnych placeholderów GLB/PNG/SVG ani przykładowych modeli/tekstur tylko po to, żeby katalog istniał.
- Puste katalogi utrzymujemy wyłącznie przez `.gitkeep`.

Szczegóły techniczne: [`docs/current/technical/VITE_GITHUB_PAGES_DEPLOYMENT.md`](docs/current/technical/VITE_GITHUB_PAGES_DEPLOYMENT.md).
