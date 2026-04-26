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
