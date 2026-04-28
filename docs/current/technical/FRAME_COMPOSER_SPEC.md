# Haiku Cosmos - FrameComposer v0.1 Spec

> Status: ROBOCZY / KONTRAKT TECHNICZNY
> Obszar: Modular Frame Kit v0.1 / SVG layout / card visuals / SUB-META / HUD
> Zrodlo prawdy: TAK roboczo dla kontraktu layoutu FrameComposera; NIE dla mechaniki
> Ostatnia aktualizacja: 2026-04-28
> Powiazane dokumenty: ../visual/MODULAR_FRAME_KIT.md, ../visual/SUB_META_ASSET_PIPELINE.md, ../visual/SUB_META_COMPONENTS.md, CARD_VISUAL_ARCHITECTURE.md

## 1. Cel FrameComposera

FrameComposer ma skladac modularne ramki z SVG frame parts eksportowanych w Modular Frame Kit v0.1.

Zakres:

- skladanie narochnikow, krawedzi, center ornaments, separatorow i state/accent layers;
- layout visual dla SUB-META, HUD i przyszlych card visuals;
- oddzielenie static base od dynamic accent layers;
- debugowanie anchorow, line anchors i brakujacych assetow.

Poza zakresem:

- mechanika kart;
- decyzje gameplayowe;
- koszty RP;
- sekwencje R/AA/AAA/DS;
- przypisywanie kart do slotow;
- zmiana `cardsPool` albo `World.score`.

FrameComposer jest rendererem/layout helperem. Dostaje juz przygotowane dane wizualne i nie decyduje, dlaczego dany stan istnieje.

## 2. Dane wejsciowe

Docelowy kontrakt API moze wygladac tak:

```js
FrameComposer.drawFrame(ctx, {
  rect,
  kitId,
  layer,
  style,
  parts,
  anchors,
  scales,
  state,
  accentColor,
  debug
});
```

Minimalne znaczenie pol:

- `ctx` - docelowy kontekst canvas albo adapter DOM/SVG;
- `rect` - docelowy prostokat konstrukcyjny ramy `{ x, y, width, height }`;
- `kitId` - np. `modular_frame_kit_v01`;
- `layer` - `submeta`, `hud`, `cards`;
- `style` - np. `astrolabe`, `minimal`, `r1`, `ds`;
- `parts` - mapa logicalName lub resolved assetow z manifestu;
- `anchors` - parametry konstrukcyjne, w tym `anchorOffset`, `lineInset`, `cornerRun`;
- `scales` - skale layoutowe, np. `cornerScale`, `edgeScale`, `ornamentScale`;
- `state` - juz obliczony stan wizualny, np. `neutral`, `active`, `selected`, `locked`;
- `accentColor` - kolor akcentu, jesli warstwa go wspiera;
- `debug` - flagi debug overlay i warningow.

Przyklad danych layoutowych dla SUB-META v0.1:

```js
{
  rect: { x: 0, y: 0, width: 900, height: 506 },
  kitId: "modular_frame_kit_v01",
  layer: "submeta",
  style: "astrolabe",
  parts: {
    cornerTl: "submeta.frame.corner.tl.astrolabe_01",
    edgeTop: "submeta.frame.edge.top_thin.astrolabe_01",
    ornamentTop: "submeta.frame.center_ornament.top.astrolabe_01"
  },
  anchors: {
    frameInset: 32,
    cornerOffset: { near: 16, far: 17 },
    edgeLineInset: 14,
    edgeEndCompensation: 92.4
  },
  scales: {
    ornamentTop: 0.78,
    ornamentBottom: 0.84
  },
  state: "neutral",
  debug: { anchors: false, bounds: false, missingAssets: true }
}
```

Te liczby pochodza z preview board v0.1 i sa evidence startowym, nie kanonem matematycznym.

## 3. Regula `anchorOffset`

FrameComposer nie sklada ramek po samym `viewBox`.

Powod:

- corner i edge SVG moga miec wewnetrzny padding;
- widoczna geometria nie musi zaczynac sie przy `x=0` / `y=0`;
- rozne elementy maja rozne optyczne linie konstrukcyjne;
- edge powinien laczyc sie z widoczna linia cornera, nie z pudelkiem obrazka.

Kazdy part moze miec `anchorOffset`, czyli punkt zaczepienia w lokalnym ukladzie assetu. Ten punkt ma trafic na konstrukcyjna linie ramy w `rect`.

Przyklady:

- corner TL: lokalny anchor widocznego zalamania linii trafia w `{ rect.x + frameInset, rect.y + frameInset }`;
- corner TR: lokalny anchor trafia w `{ rect.x + rect.width - frameInset, rect.y + frameInset }`;
- corner BL: lokalny anchor trafia w `{ rect.x + frameInset, rect.y + rect.height - frameInset }`;
- corner BR: lokalny anchor trafia w `{ rect.x + rect.width - frameInset, rect.y + rect.height - frameInset }`.

Edge ma dodatkowy `lineInset`, ktory kompensuje pusty margines i wysokosc/szerokosc optycznej linii. `lineInset` nie jest gameplayem; to czysta korekta layoutu.

Ornament ma `centerAnchor`, zwykle w osi srodka krawedzi:

- top-center: `{ rect.centerX, rect.y + frameInset }`;
- bottom-center: `{ rect.centerX, rect.y + rect.height - frameInset }`.

## 4. Regula `ornamentScale`

Center ornaments maja osobna skale kompozycyjna.

Preview v0.1 uzywa:

- top-center ornament: `0.78`;
- bottom-center ornament: `0.84`.

Reguly:

- `ornamentScale` jest parametrem layoutu, nie zmiana SVG source;
- top-center i bottom-center moga miec rozne wartosci;
- ornament ma wspierac rytm ramy, ale nie dominowac cienkiej linii;
- skala musi byc liczona wzgledem center anchor, z zachowaniem osi srodka;
- przy malych rozmiarach ramy ornament moze byc ukryty albo zastapiony wariantem minimalnym.

## 5. Corners

Corners sa stabilnymi punktami konstrukcyjnymi ramy.

Reguly:

- uzywac fixed-size albo responsive bounded size;
- pozycjonowac wzgledem `rect` + `anchorOffset`;
- nie rozciagac agresywnie;
- nie traktowac calego viewBox jako widocznej geometrii;
- dopuszczac osobne offsety dla `near` i `far`, jesli eksport SVG ma asymetryczny padding;
- przy debug mode pokazywac local bounds i realny anchor point.

Corner powinien wyznaczac optyczny start/end krawedzi. Edge ma dojsc do niego przez `lineInset` i `cornerRun`, zamiast nachodzic przypadkowo na viewBox.

## 6. Edges

Edges sa rozciagane tylko w jednej osi.

Reguly:

- edge top/bottom rozciagac w osi X;
- edge left/right rozciagac w osi Y;
- druga os utrzymywac jako bounded thickness;
- `lineInset` kompensuje padding SVG i optyczna pozycje linii;
- edge start/end ma respektowac corner run, zeby nie zalewac naroznika;
- optyczna grubosc linii nie powinna rosnac przy dlugim panelu.

Preferowany model:

```text
edgeTop.x = rect.x + frameInset + cornerRun - edgeStartPadding
edgeTop.y = rect.y + frameInset - edgeLineInset
edgeTop.width = rect.width - (2 * frameInset) - (2 * cornerRun) + edgeEndCompensation
edgeTop.height = edgeNaturalThickness
```

Canvas implementation powinna uzywac `drawImage` z kontrolowanym dest rect albo dziewieciopolowego/segmentowego modelu, jesli przyszle assety beda tego wymagaly.

## 7. Center ornaments

Center ornaments sa oddzielone od edge.

Reguly:

- nie sa czescia rozciaganego edge;
- sa anchorowane do srodka gornej lub dolnej krawedzi;
- uzywaja osobnego `ornamentScale`;
- moga miec `anchorOffset` dla osi Y, jesli widoczna geometria nie siedzi centralnie w viewBox;
- moga byc ukrywane przy malych rozmiarach;
- nie powinny konkurowac z trescia panelu.

Docelowo spec layoutu powinien rozroznic:

- `ornamentScale`;
- `ornamentAnchorOffset`;
- `ornamentMaxWidth`;
- `ornamentMinVisibleFrameWidth`.

## 8. Static vs Dynamic layers

### Static

Static layers buduja stabilna baze:

- base frame;
- neutral corners;
- neutral edges;
- center ornaments;
- separators;
- neutral slot frames;
- stable HUD frames.

Static layers moga byc renderowane bez animacji i bez zaleznosci od mechaniki.

### Dynamic

Dynamic layers pokazuja juz istniejacy stan visual/UX:

- active slot accent;
- bridge line;
- sequence marker;
- new-card pulse;
- selected state;
- locked / disabled state;
- DS / ether accent.

Dynamic layer nie definiuje mechaniki. Nie decyduje, czy slot jest aktywny, karta nowa albo sekwencja poprawna. Dostaje stan wejscia i renderuje akcent.

## 9. Debug mode

FrameComposer powinien docelowo umiec pokazac:

- target `rect`;
- frame construction line / `frameInset`;
- corner anchor points;
- line anchors dla edges;
- local bounding boxes kazdego partu;
- computed destination rectangles;
- missing asset warnings;
- fallback markers dla assetow, ktore nie zostaly zaladowane.

Debug mode nie powinien byc czescia finalnego UI. Ma sluzyc preview, testom i visual review.

## 10. Relacja z card visuals

FrameComposer nie zna mechaniki kart.

Docelowy przeplyw:

```text
cards.js / World state
  -> view model / draw options
  -> HC.CardVisuals
  -> HC.FrameComposer
  -> HC.VisualAssets
  -> canvas / DOM
```

Zasady:

- `cards.js` nie sklada bezposrednio ramek z corners/edges/ornaments;
- `HC.CardVisuals` moze poprosic FrameComposer o rame karty lub slotu;
- `HC.FrameComposer` dostaje resolved parts, rect i visual state;
- `HC.VisualAssets` laduje manifest i cache obrazow;
- zadna warstwa visual nie zmienia typu karty, kosztu, sekwencji ani stanu gry.

## 11. Plan implementacji etapowej

### Etap 1 - loader + pure layout calculations

- przygotowac `HC.VisualAssets` do ladowania manifestu;
- przygotowac czyste funkcje layoutu bez rysowania;
- dodac testy obliczen rect/anchor dla SUB-META preview values.

### Etap 2 - static canvas draw for preview/runtime

- narysowac static frame parts na canvas/adapterze DOM;
- zachowac fallback, jesli asset nie istnieje;
- wlaczyc debug overlay tylko w trybie review.

### Etap 3 - SUB-META panel frame only

- uzyc FrameComposera dla jednej ramy SUB-META;
- bez zmiany mechaniki SUB-META;
- bez podlaczania state layers.

### Etap 4 - card frames/state accents

- dodac card frame i state accent layout;
- wciaz trzymac stan jako wejscie visual;
- nie zmieniac zasad kart.

### Etap 5 - dynamic tinting

- dodac tinting jako warstwe visual;
- rozroznic external SVG filter fallback od inline/runtime SVG;
- zachowac neutralny fallback.

### Etap 6 - subtle animation hooks

- przygotowac hooki animacji dla new-card pulse, active slot line, bridge line pulse, selected shimmer i DS/ether accent;
- animacje nie sa zrodlem prawdy i nie definiuja mechaniki.

## 12. v0.1 implementation status

Status na 2026-04-28 (repo-only infrastructure pass):

- `HC.VisualAssets` zaimplementowany jako bezpieczny loader/cache/lookup dla manifestu `assets/visual/modular_frame_kit_v01_manifest.json`;
- `HC.FrameComposer` zaimplementowany dla pure layout calculations (`corners`, `edges`, `center ornaments`, `anchorOffset`, `lineInset`, `ornamentScale`) + debug helper;
- dodano sandbox review `assets/visual/preview/frame_composer_sandbox.html` (manifest + preload + pojedynczy frame draw + debug anchors);
- runtime integration pozostaje `not_integrated`;
- produkcyjny rendering SUB-META nadal nie uzywa FrameComposera;
- depth/relief, live-coloring i animation hooks pozostaja future pass.

## 13. Zakazy

FrameComposer nie moze:

- zawierac mechaniki kart;
- liczyc kosztow RP;
- decydowac o sekwencjach;
- wywolywac cash-out/fail/forge;
- hardcodowac pelnego layoutu SUB-META jako jedynego monolitu;
- wracac do monolitycznych ramek jako aktywnej produkcji;
- wpisywac nowych SVG bezposrednio do `cards.js`;
- wymagac Figma MCP w runtime;
- generowac rasterow, fontow albo nowych assetow.

Kazdy przyszly pass implementacyjny musi utrzymac zasade: mechanika decyduje, card visuals interpretuja, FrameComposer uklada, VisualAssets dostarcza material.
