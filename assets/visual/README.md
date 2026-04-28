# assets/visual

## Modular Frame Kit v0.1

Status: `exported_review_ready`.

Zrodlo: Figma file key `1KsSouDlvB24HznqRPXUf5`.

Manifest: `assets/visual/modular_frame_kit_v01_manifest.json`.

Static preview board: `assets/visual/preview/modular_frame_kit_v01_preview.html`.

Local preview URL after running `python -m http.server 8123` from repo root:
`http://localhost:8123/assets/visual/preview/modular_frame_kit_v01_preview.html`.

Zestaw zawiera `35` czystych SVG:

- `14` SUB-META frame parts w `assets/visual/submeta/svg/frame_parts/`;
- `15` HUD frame parts w `assets/visual/hud/svg/frame_parts/`;
- `6` Card State Accents w `assets/visual/cards/svg/state_accents/`.

Runtime integration: `not_integrated`. FrameComposer, live-coloring i animacje pozostaja osobnym przyszlym krokiem.

Legacy `style_correction_2026_04` pozostaje w `assets/visual/legacy/` jako evidence i nie jest produkcyjnym source-of-truth.

> Status: STRUKTURA ROBOCZA
> Obszar: assety wizualne

Katalog bazowy dla assetów wizualnych Haiku Cosmos.

## Podział

- `submeta/` — elementy dla SUB-META.
- `hud/` — elementy dla podstawowego HUD.
- `shared/` — elementy współdzielone między SUB-META, HUD i późniejszymi widokami.
- `legacy/` - evidence i historyczne assety, które nie są aktywnym zestawem produkcyjnym.

## Zasady

- nowy produkcyjny asset pass ma produkować modularne SVG frame parts,
- raster pipeline pozostaje osobny,
- SVG z lokalnego eksportu `style_correction_2026_04` są legacy/evidence w `assets/visual/legacy/style_correction_2026_04/`,
- manifest runtime `assets/visual/submeta/submeta_svg_manifest.json` moze byc pusty/neutralny do czasu FrameComposer/runtime integration pass,
- finalny FrameComposer, live-coloring i animacje pozostają osobnym krokiem po nowym modular asset passie.
