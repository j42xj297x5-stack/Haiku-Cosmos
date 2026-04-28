# assets/visual/hud

## Modular Frame Kit v0.1

Nowe modularne assety HUD znajduja sie w `svg/frame_parts/`.

Status: `exported_review_ready`, ale runtime integration nadal nie jest wykonana.

Legacy overlaye `style_correction_2026_04` nie sa aktywnym source-of-truth. FrameComposer integration bedzie osobnym krokiem po review assetow.

> Status: STRUKTURA ROBOCZA
> Obszar: HUD

Tu trafią assety podstawowego HUD: ramki liczników, glify i metry.

## Co tu trafia

- SVG z pierwszego asset/component pass,
- elementy HUD niezależne od pełnego ekranu SUB-META,
- robocze placeholdery opisane w pipeline.

## Czego tu nie wrzucać

- pełnych mockupów ekranu,
- finalnych rastrów bez osobnego raster pipeline,
- plików runtime,
- cudzych grafik.

Stan po reset review i eksporcie v0.1 (2026-04-28):

- SVG z `style_correction_2026_04` zostały przeniesione do `assets/visual/legacy/style_correction_2026_04/`,
- runtime HUD nie używa już DOM `background-image` z legacy SVG,
- aktywne legacy `svg/frames` nie zawiera produkcyjnych ramek z tego passu,
- nowy HUD kit v0.1 istnieje jako minimalny modular sequence kit w `svg/frame_parts/`.
