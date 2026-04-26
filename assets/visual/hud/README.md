# assets/visual/hud

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

Stan po local migration pass (2026-04-26):

- realne SVG z `Figma/hud/style_correction` zostały skopiowane do `svg/frames`,
- runtime HUD używa reprezentatywnie: `hud_frame_rp_counter_ritual_01.svg`, `hud_frame_color_counter_axis_01.svg`, `hud_button_submeta_gate_01.svg`, `hud_button_back_ritual_01.svg` (z fallbackiem do dotychczasowego renderingu),
- dodatkowe warianty (`rp_counter_orbit_02`) są zachowane jako alternatywa do kolejnych passów.
