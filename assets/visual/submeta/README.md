# assets/visual/submeta

> Status: STRUKTURA ROBOCZA
> Obszar: SUB-META

Tu trafią assety wizualne przeznaczone dla SUB-META: ramy paneli, sloty, linie, ornamenty, glify i placeholdery.

## Co tu trafia

- eksporty SVG z pierwszego passu Figma,
- robocze placeholdery zgodne z pipeline,
- elementy potrzebne tylko warstwie SUB-META.

## Czego tu nie wrzucać

- finalnych rastrów,
- assetów HUD, jeśli nie są osadzone w SUB-META,
- plików runtime,
- grafik spoza własnego języka Haiku Cosmos.

Stan po local migration pass (2026-04-26):

- realne SVG z `Figma/submeta/style_correction` zostały skopiowane do `svg/frames`, `svg/glyphs` i `svg/lines`,
- `submeta_svg_manifest.json` mapuje logicalName -> path dla runtime loadera/fallbacku,
- `svg/placeholders/submeta_hud_style_board_01.svg` służy jako evidence/reference i nie jest podpięty jako runtime frame,
- ewentualny polish (skalowanie, live-coloring, animacje) wymaga osobnego passu po review projektanta.
