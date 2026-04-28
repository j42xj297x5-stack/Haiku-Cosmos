# assets/visual/submeta

## Modular Frame Kit v0.1

Nowe modularne assety SUB-META znajduja sie w `svg/frame_parts/`.

Status: `exported_review_ready`, ale runtime integration nadal nie jest wykonana.

Legacy overlaye `style_correction_2026_04` nie sa aktywnym source-of-truth. FrameComposer integration bedzie osobnym krokiem po review assetow.

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

Stan po reset review i eksporcie v0.1 (2026-04-28):

- SVG z `style_correction_2026_04` zostały przeniesione do `assets/visual/legacy/style_correction_2026_04/`,
- aktywne `svg/frames`, `svg/glyphs`, `svg/lines` i `svg/placeholders` nie zawierają produkcyjnych SVG z tego passu,
- `submeta_svg_manifest.json` jest pusty/neutralny do czasu FrameComposer/runtime integration pass,
- nowy zestaw v0.1 istnieje jako modular frame parts w `svg/frame_parts/`, a nie pelne monolityczne overlaye.
