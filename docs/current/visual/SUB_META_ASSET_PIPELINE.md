<<<<<<< Updated upstream
# SUB-META — asset pipeline (Figma → runtime)

> Status: KIERUNEK / SPECYFIKACJA WYKONAWCZA
> Obszar: SUB-META / Figma / asset pipeline / eksporty
> Źródło prawdy: TAK, dla zasad assetów SUB-META; NIE, dla implementacji runtime
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: `docs/current/visual/SUB_META_FIGMA_BRIEF.md`, `docs/current/visual/SUB_META_LAYOUT_SPEC.md`, `docs/current/visual/SUB_META_COMPONENTS.md`, `docs/current/visual/SUB_META_RESPONSIVE_SCALING.md`, `docs/current/visual/SUB_META_TYPOGRAPHY.md`, `docs/current/ui/UI_WORLD.md`, `docs/current/systems/SUB_META_SYSTEM.md`, `docs/current/systems/CARDS_SYSTEM.md`

## 1. Cel dokumentu

Ten dokument definiuje **pierwszy wykonawczy pass Figmy** dla SUB-META:
- ramki,
- placeholdery,
- sloty,
- glify,
- cienkie linie,
- komponenty bazowe,
- warianty paneli,
- warianty kart R1 i DS,
- podstawową typografię testową.

To **nie jest** etap finalnego polished mockupu całego ekranu.
Najpierw budujemy skalowalny system assetów i komponentów, który może zostać użyty w runtime.

## 2. SVG jako format domyślny dla elementów geometrycznych

Domyślnie stosujemy SVG dla:
- ramek,
- glifów,
- cienkich linii,
- ornamentów geometrycznych,
- slotów,
- znaczników,
- ikon,
- komponentów opartych na geometrii.

Powód: ostrość, skalowalność i kontrola jakości od mobile po 4K.

## 3. PNG/WebP jako warstwa raster pipeline (poza Figmą)

Raster (PNG/WebP) jest przygotowywany poza Figmą w osobnym raster pipeline dla:
- tła świata,
- tła paneli,
- tła przycisków,
- tła kart,
- tekstur materiałowych,
- miękkiego światła i warstw głębi.

Figma w tym zakresie definiuje miejsca użycia rastra:
- placeholdery,
- maski,
- proporcje,
- ramy i obszary kompozycji.

Finalne rastry są podpinane do layoutu dopiero po ich dostarczeniu poza Figmą.

## 4. Czego nie eksportować jako raster

Nie rasteryzujemy:
- cienkich linii,
- ram,
- slotów,
- glifów,
- markerów,
- ornamentów liniowych.

Te elementy powinny pozostać SVG (anty-rozmycie).

## 5. Czego nie robić jako SVG

Nie wymuszamy SVG dla:
- malarskich teł,
- bogatych tekstur materiałowych,
- miękkich gradientów tła wymagających warstw rastra,
- gotowych kompozycji premium, które są z natury bitmapowe.

## 6. Skalowanie od smartfona do 4K

Zasada nadrzędna:
- jeden skalowalny system SVG dla geometrii,
- warianty rozdzielczości tylko dla rastrów.

Anty-rozmycie:
- cienkie linie jako SVG,
- glify jako SVG,
- ramki jako SVG,
- sloty jako SVG,
- ornament jako SVG,
- raster tylko tam, gdzie naprawdę jest materiał, tło, tekstura, miękkie światło lub malarska głębia.

## 7. Eksporty i nazewnictwo assetów (propozycja dokumentacyjna)

Proponowana konwencja (bez wdrażania runtime w tym kroku):

- `submeta/frame/<name>.svg`
- `submeta/glyph/<name>.svg`
- `submeta/slot/<name>.svg`
- `submeta/card/r1/<color>/<state>.svg` (rama / glif / linie / sloty)
- `submeta/card/ds/<color>/<state>.svg` (rama / glif / linie / sloty)
- `submeta/card/raster/<name>@1x.webp`
- `submeta/card/raster/<name>@2x.webp`
- `submeta/card/raster/<name>@4x.webp`
- `submeta/panel/raster/<name>@1x.webp`
- `submeta/panel/raster/<name>@2x.webp`
- `submeta/panel/raster/<name>@4x.webp`
- `submeta/button/raster/<name>@1x.webp`
- `submeta/button/raster/<name>@2x.webp`
- `submeta/button/raster/<name>@4x.webp`

To jest **propozycja dokumentacyjna**. Nazwy runtime i mapowanie loadera wymagają osobnego kroku.

## 8. Warianty rozmiaru — decyzja kierunkowa

Decyzja kierunkowa:
- preferujemy **jeden skalowalny system SVG** dla ramek, glifów, linii i slotów,
- zamiast osobnych bitmap dla mały/średni/duży.

Dla rastrów dopuszczamy warianty rozdzielczości:
- `1x/2x/4x` lub `small/medium/large`,
- bez ustalania jeszcze finalnych nazw runtime.

## 9. Granice tego etapu

W tym kroku:
- nie tworzymy lokalnych assetów,
- nie zapisujemy grafik do repo,
- nie zmieniamy runtime,
- nie pobieramy i nie commitujemy font files,
- nie generujemy finalnych rasterów (PNG/WebP) w Figma,
- nie generujemy tła świata.

Efektem ma być gotowa specyfikacja wykonawcza dla pierwszego passu Figmy.
=======
# Haiku Cosmos — SUB-META Asset Pipeline

> Status: KIERUNEK / PIPELINE WYKONAWCZY
> Obszar: SUB-META, HUD, eksport assetów, SVG
> Źródło prawdy: TAK, dla organizacji przyszłych assetów SUB-META/HUD. NIE, dla runtime, mechaniki i finalnych grafik.
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: FIGMA_WORKFLOW.md, SUB_META_LINE_ORNAMENT_LIBRARY.md, SUB_META_COMPONENTS.md, SUB_META_FIGMA_PROMPT_TEMPLATE.md

## 1. Cel dokumentu

Ten dokument opisuje strukturę katalogów i zasady nazewnictwa dla przyszłych assetów SUB-META + HUD.

Na tym etapie pipeline przygotowuje repozytorium pod pierwszy pass SVG. Nie dodaje finalnych grafik i nie zmienia runtime.

## 2. Struktura katalogów assetów

Assety wizualne znajdują się w:

```text
assets/
  visual/
    submeta/
      svg/
        frames/
        lines/
        ornaments/
        glyphs/
        slots/
        placeholders/
        hud/
      raster_placeholders/
    hud/
      svg/
        frames/
        glyphs/
        meters/
      raster_placeholders/
    shared/
      svg/
        frames/
        lines/
        ornaments/
        glyphs/
      raster_placeholders/
```

Każdy katalog ma `README.md`, aby struktura była utrzymywana przez Git.

## 3. Pierwsze assety: SVG

Pierwszy asset/component pass produkuje SVG:

- cienkie linie,
- ramki,
- sloty,
- ornamenty,
- glify,
- placeholdery,
- małe ramy i metry HUD.

Nie produkuje:

- PNG,
- WebP,
- finalnych raster backgrounds,
- fontów,
- importów runtime,
- pełnych mockupów ekranu.

## 4. Relacja Figma export → repo

Eksport z Figmy powinien trafiać do:

- `assets/visual/submeta/svg/frames/`
- `assets/visual/submeta/svg/lines/`
- `assets/visual/submeta/svg/ornaments/`
- `assets/visual/submeta/svg/glyphs/`
- `assets/visual/submeta/svg/slots/`
- `assets/visual/submeta/svg/placeholders/`
- `assets/visual/submeta/svg/hud/`
- `assets/visual/hud/svg/frames/`
- `assets/visual/hud/svg/glyphs/`
- `assets/visual/hud/svg/meters/`
- `assets/visual/shared/svg/frames/`
- `assets/visual/shared/svg/lines/`
- `assets/visual/shared/svg/ornaments/`
- `assets/visual/shared/svg/glyphs/`

Zasada:

- element tylko SUB-META trafia do `submeta/`,
- element tylko HUD trafia do `hud/`,
- element używany w więcej niż jednej warstwie trafia do `shared/`.

## 5. Raster pipeline

Raster pipeline pozostaje osobny.

Katalogi `raster_placeholders/` są zarezerwowane dla przyszłych roboczych placeholderów lub testów układu. Nie są częścią pierwszego passu SVG i nie powinny zawierać finalnych PNG/WebP bez osobnej decyzji projektowej.

## 6. Zasady nazewnictwa

Nazwy plików:

- małe litery,
- słowa rozdzielane `_`,
- prefiks obszaru: `submeta_`, `hud_` albo `shared_`,
- rodzina komponentu po prefiksie,
- wariant inspiracji lub funkcji,
- numer wariantu dwucyfrowy na końcu.

Format:

```text
<area>_<family>_<role>_<variant>_<nn>.svg
```

## 7. Proponowane nazwy przyszłych plików

Nie tworzyć tych plików teraz. To konwencja dla późniejszego eksportu:

```text
submeta_frame_panel_astrolabe_01.svg
submeta_frame_panel_armillary_01.svg
submeta_frame_card_r1_red_01.svg
submeta_frame_card_ds_red_01.svg
submeta_line_divider_thin_01.svg
submeta_line_connector_orbit_01.svg
submeta_ornament_corner_rosette_01.svg
submeta_ornament_border_girih_01.svg
submeta_glyph_axis_form_01.svg
submeta_glyph_axis_intention_01.svg
submeta_glyph_axis_time_01.svg
submeta_glyph_axis_silence_01.svg
hud_frame_counter_rp_01.svg
hud_frame_counter_color_01.svg
hud_meter_sequence_01.svg
```

## 8. Kontrola przed importem do runtime

Przed jakimkolwiek runtime import należy osobno sprawdzić:

- czystość SVG,
- skalowanie stroke,
- rozmiar pliku,
- zgodność nazw,
- brak embedded raster images,
- brak fontów,
- zgodność z `SUB_META_LINE_ORNAMENT_LIBRARY.md`.

Ten krok nie jest częścią obecnego etapu.
>>>>>>> Stashed changes
