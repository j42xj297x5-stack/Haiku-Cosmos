# assets/visual

> Status: STRUKTURA ROBOCZA
> Obszar: assety wizualne

Katalog bazowy dla assetów wizualnych Haiku Cosmos.

## Podział

- `submeta/` — elementy dla SUB-META.
- `hud/` — elementy dla podstawowego HUD.
- `shared/` — elementy współdzielone między SUB-META, HUD i późniejszymi widokami.

## Zasady

- pierwszy realny asset pass ma produkować SVG,
- raster pipeline pozostaje osobny,
- realne SVG z lokalnego eksportu `Figma/style_correction` zostały przeniesione do `assets/visual/submeta/svg/*` i `assets/visual/hud/svg/frames/*`,
- manifest logiczny znajduje się w `assets/visual/submeta/submeta_svg_manifest.json`,
- demo board `submeta_hud_style_board_01.svg` pozostaje assetem referencyjnym (placeholder/evidence),
- finalny polish live-coloring i animacje pozostają osobnym krokiem po review projektanta.
