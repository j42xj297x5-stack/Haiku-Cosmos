# Haiku Cosmos - SVG Asset Standards

> Status: ROBOCZY / STANDARD WYKONAWCZY
> Obszar: visual / SVG / frame parts / raster pipeline / asset metadata
> Zrodlo prawdy: TAK roboczo dla standardu wykonawczego nowych assetow; NIE dla mechaniki
> Ostatnia aktualizacja: 2026-04-29
> Powiazane dokumenty: ART_DIRECTION.md, KOSMOLOGIA_WIZUALNA.md, BIBLIOTEKA_MATERIALOW.md, MODULAR_FRAME_KIT.md, SUB_META_COMPONENTS.md, SUB_META_ASSET_PIPELINE.md, ../technical/FRAME_COMPOSER_SPEC.md

## 1. Cel

Ten dokument opisuje standard projektowania nowych SVG i raster assets dla Haiku Cosmos.

Ma pomoc tworzyc assety, ktore:

- da sie skladac przewidywalnie przez FrameComposer;
- maja jasne punkty anchor / mount;
- nie wymagaja recznego pozycjonowania przy kazdym uzyciu;
- pozostaja zgodne z rytualnym minimalizmem kosmicznym;
- nie mieszaja visual layer z mechanika kart, RP, sekwencji ani PRG behavior.

## 2. Ogolne zasady SVG

Kazdy aktywny SVG powinien spelniac:

- transparent background;
- wymagany `viewBox`;
- brak bitmap (`<image>`);
- brak base64;
- brak osadzonych fontow;
- brak ciezkich baked filters;
- brak baked glow/shadow jako default;
- preferowane cienkie stroke;
- preferowane `vector-effect="non-scaling-stroke"` albo przygotowanie do post-processingu;
- logiczne layer/group names, jesli eksport pozwala;
- przewidywalny bounding box;
- oddzielenie static base od accent/state layer, jesli asset ma przyszle tinting/animation.

SVG nie powinien byc gotowa, pelna bitmapowa rama panelu. Ramy powstaja z modularnych czesci albo z osobnego, jawnie oznaczonego substrate.

## 3. Anchor metadata

Kazdy asset typu `frame_part` powinien miec metadata w manifeście lub w dokumentacji asset passu.

Minimalne pola:

```json
{
  "anchorType": "corner|edge|center|rect|point|line",
  "anchorPoint": { "x": 16, "y": 16 },
  "anchorOffset": { "x": 16, "y": 16 },
  "lineInset": 10,
  "stretchAxis": "x|y|none",
  "defaultScale": 1,
  "safeMinSize": { "w": 120, "h": 48 },
  "densityBehavior": "small|medium|large"
}
```

Znaczenie:

- `anchorType` - jak asset montuje sie do layoutu.
- `anchorPoint` - lokalny punkt lub os linii w viewBox.
- `anchorOffset` - odleglosc od local `{0,0}` do widocznego punktu zaczepienia.
- `lineInset` - pusty margines lokalny dla linii edge/bridge, kompensowany przez layout.
- `stretchAxis` - jedyna os, w ktorej asset moze byc rozciagany.
- `defaultScale` - skala bazowa dla standard density.
- `safeMinSize` - minimalny rozmiar bez utraty czytelnosci.
- `densityBehavior` - jak asset redukuje detal na malych panelach.

Metadata nie jest mechanika. To czysta informacja layout/render.

## 4. Kategorie assetow

### Frame corner

- Anchor: local line pivot.
- Stretch: `none`.
- Uzycie: naroza paneli, kart, HUD micro frames.
- Wymaga: `anchorOffset`, `safeMinSize`, opis `cornerJoinInset`.

### Frame edge

- Anchor: line segment.
- Stretch: `x` dla top/bottom, `y` dla left/right.
- Uzycie: krawedzie ram.
- Wymaga: `lineInset`, `stretchAxis`, `edgeThickness`.

### Center ornament

- Anchor: center point na osi krawedzi.
- Stretch: `none`, skala przez `ornamentScale`.
- Uzycie: top/bottom panel emphasis.
- Wymaga: `defaultScale`, `safeMinSize`, mobile behavior.

### Separator

- Anchor: line center albo rect.
- Stretch: zwykle `x`.
- Uzycie: podzialy paneli, altar scale, section separators.

### Slot frame

- Anchor: rect.
- Stretch: zwykle `none` albo bounded scale.
- Uzycie: gniazda kart R1/DS/R2.
- Wymaga: stany `static_base`, `selected`, `locked`, `active`.

### Resonance node

- Anchor: center point.
- Stretch: `none`.
- Uzycie: wezly relacji, sockety R2.

### Bridge line

- Anchor: line start/end.
- Stretch: `x` albo custom path.
- Uzycie: relacje PRG/WORLD, aktywne wiazania.
- Wymaga: `lineInset`, endpoint rules, status active/inactive.

### Card state accent

- Anchor: card rect.
- Stretch: bounded rect.
- Uzycie: new/seen/selected/locked/active.
- Nie moze zmieniac typu karty ani reguly mechanicznej.

### HUD micro frame

- Anchor: rect or point.
- Stretch: minimalny, czytelny w malej skali.
- Uzycie: RP, counters, SUB-META button.

### Button frame

- Anchor: rect.
- Stretch: `x` albo 9-slice/future segmented model.
- Uzycie: back, confirm, small actions.

### Glyph

- Anchor: center point or rect.
- Stretch: `none`.
- Uzycie: osie koloru, DS plus, event marker, PRG category.

## 5. Zasady nazw

Nazwy plikow i logicalName:

- lowercase;
- snake_case dla plikow;
- kropki segmentuja logicalName w manifeście;
- bez spacji;
- bez polskich znakow;
- prefix warstwy: `submeta`, `hud`, `card_state`, `shared`;
- typ w nazwie;
- styl/wariant;
- numer dwucyfrowy lub `01`.

Przyklady plikow:

```text
submeta_frame_corner_tl_astrolabe_01.svg
submeta_frame_edge_top_thin_astrolabe_01.svg
submeta_slot_frame_r1_socket_01.svg
card_state_new_card_pulse_layer_01.svg
```

Przyklady logicalName:

```text
submeta.frame.corner.tl.astrolabe_01
submeta.frame.edge.top_thin.astrolabe_01
submeta.slot_frame.r1_socket_01
cards.state_accent.new_card_pulse_01
```

## 6. Asset status

Kazdy asset powinien miec jeden status wykonawczy:

- `static_base` - stabilny element bazowy, bez animacji.
- `tintable_accent` - moze przyjac kolor runtime.
- `animatable_state_layer` - moze byc poruszany/pulsowany jako stan visual.
- `debug/reference_only` - tylko do review, nie do runtime.
- `legacy/evidence` - historia lub evidence, nie aktywne source of truth.

Status musi byc jawny w manifeście, doc asset passu albo review boardzie.

## 7. Mobile/detail levels

Kazdy asset uzywany w panelach powinien miec opis zachowania dla density:

- `small` - ukrywa center ornaments, skraca ticki, zachowuje czytelnosc.
- `medium` - standardowy layout desktop/tablet.
- `large` - pelniejszy ornament, wiecej tickow, spokojniejszy oddech.

FrameComposer moze uzywac `density` do wyboru presetow:

```js
{
  density: "small",
  showCenterOrnaments: false,
  cornerJoinInset: 40,
  ornamentScale: 0
}
```

Density nadal jest layout/render, nie mechanika.

## 8. Zasada designerskiego zlota

Asset ma byc piekny jako czesc systemu, ale nie moze dominowac nad trescia.

Zasady:

- rama ma wspierac decyzje gracza, nie grac pierwszych skrzypiec;
- cienka linia jest domyslna;
- subtelne swiatlo jest lepsze niz agresywny glow;
- materialnosc ma byc wyczuwalna, ale nie ciezka;
- relief jest kierunkiem plastycznym, nie baked shadow default;
- unikac ciezkiego fantasy borderu;
- SUB-META ma czuc sie jak mapa relacji i gniazd, nie sklepowy inventory UI.

## 9. Raster pipeline

PNG/WebP sa dozwolone tylko tam, gdzie raster daje wartosc, ktorej SVG nie powinien udawac.

Dozwolone zastosowania:

- tla swiata;
- tla panelu/substrate;
- tekstury materialowe;
- premium card preview / ilustracyjne skupienie;
- wybrane event/premium moments.

Niedozwolone zastosowania:

- tekst UI jako obrazek;
- skalowalne ramy paneli;
- standardowe slot frames;
- frame corners/edges/ornaments;
- glify, ktore musza sie skalowac lub tintowac.

Zasady laczenia:

- raster daje glebie/substrate/material;
- SVG daje konstrukcje/linie/rame/glify;
- tekst zostaje tekstem;
- raster nie zastepuje modularnych frame parts;
- rastery musza miec warianty rozmiarowe albo bezpieczne skalowanie;
- raster assets musza miec opis safe crop/safe area, jesli sa uzywane pod panel.

## 10. Runtime boundary

Asset nie moze wymuszac mechaniki.

SVG/raster moze opisac:

- gdzie ma byc anchor;
- jaki jest status visual;
- jakie ma density behavior;
- czy jest static/tintable/animatable;
- jaka jest relacja z FrameComposerem.

SVG/raster nie moze opisac:

- kosztow RP;
- legalnosci przypisania karty;
- efektow PRG;
- sekwencji R1/R2/R3/R4;
- stanu gry jako source of truth.



## 9. SUB-META v2 center-based asset standard

Dla nowych assetow SUB-META v2 obowiazuje:

- kazdy nowy SVG ma `viewBox` i jawna referencyjna wielkosc (dokumentowana w manifeście/specu);
- kazdy `frame_part` ma anchor metadata (minimum: center/top/bottom/left/right + lokalne line/socket anchors, gdy dotyczy);
- kazdy ornament ma pivot center jako domyslna os montazu/skalowania;
- kazdy socket ma jawny `socket center` i semantyke `socketIn/socketOut`;
- kazda bridge line ma `start/end anchors` i reguly zachowania dla density;
- cienie/poswiaty realizujemy jako `bleed`, nie jako reczne przesuniecia assetow;
- asset nie wymusza layoutu (brak hardcodu pozycji panelu w assetcie);
- layout decyduje o montazu, asset dostarcza forme i detal.

Notatka: ten standard wspiera future pass SUB-META v2 i nie oznacza automatycznej integracji runtime w tym kroku.
