# Haiku Cosmos - FrameComposer v0.1 Spec

> Status: ROBOCZY / AKTYWNY KONTRAKT TECHNICZNY
> Obszar: FrameComposer / SVG modular layout / anchors / rects
> Zrodlo prawdy: TAK, dla ogolnego kontraktu technicznego przyszlego FrameComposera; NIE, dla mechaniki; NIE, dla runtime implementation juz wykonanego; NIE, dla finalnych assetow visual
> Ostatnia aktualizacja: 2026-05-01
> Powiazane dokumenty: ../ui/SUB_META_V2_MASTER_SPEC.md, ../ui/SUB_META_V2_FRAMECOMPOSER_CONTRACT.md, ../ui/SUB_META_V2_LAYOUT_TOKENS.md, CENTER_BASED_POSITIONING_SPEC.md, ../visual/SVG_ASSET_STANDARDS.md, ../visual/SUB_META_ASSET_PIPELINE.md


## 0. Source documents i hierarchy

Hierarchy po cleanupie kontraktu:

1. `docs/current/ui/SUB_META_V2_MASTER_SPEC.md` - master spec UI/layout (entrypoint semantyczny SUB-META).
2. `docs/current/technical/FRAME_COMPOSER_SPEC.md` - aktywny nadrzedny technical contract dla future FrameComposer handoff.
3. `docs/current/ui/SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` - SUB-META-specific appendix (anchor/rect handoff zgodny z master spec i tym kontraktem).
4. `docs/current/ui/SUB_META_V2_LAYOUT_TOKENS.md` - normalized layout data appendix v0.7.
5. `docs/current/technical/CENTER_BASED_POSITIONING_SPEC.md` - ogolny standard center-based positioning.
6. `docs/current/technical/SUB_META_LAYOUT_ANCHOR_AUDIT.md` i `SUB_META_V2_BOX_AUDIT.md` - audit/evidence, nie active source-of-truth.

Ten dokument nie implementuje runtime i nie zastępuje visual asset pipeline.

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

## 12. Line-anchor layout correction

Status korekty na 2026-04-28: FrameComposer sandbox sklada SUB-META astrolabe frame po zasadzie `line-anchor to line-anchor`.

Previous issue:

- assety SVG ladowaly sie poprawnie, ale layout skladal je jak osobne obrazki ustawione wzgledem ogolnego `rect`;
- corners trafialy w target rect innym punktem niz widoczny pivot linii;
- edge top/bottom/left/right byly rozciagane po runie wynikajacym z bbox/corner size, a nie po realnych anchorach cornerow;
- center ornaments byly pozycjonowane wzgledem rect/insetu, nie wzgledem srodka konstrukcyjnej krawedzi.

Nowy model wprowadza jawny `frameLineRect`.

```js
{
  targetRect: rect,
  frameLineRect: {
    x: rect.x + frameLineInsetX,
    y: rect.y + frameLineInsetY,
    w: rect.w - frameLineInsetX * 2,
    h: rect.h - frameLineInsetY * 2
  }
}
```

`rect` pozostaje targetem sandboxu/panelu. `frameLineRect` jest realna linia konstrukcyjna ramy. Dla SUB-META astrolabe sandbox v0.1 defaulty wynikaja z preview board i SVG geometry:

- `cornerSize: 80`;
- `cornerAnchorOffset: { x: 16, y: 16 }`;
- `edgeThickness: 28`;
- `edgeLineInset: 10`;
- `cornerJoinInset: 52`;
- `frameLineInsetX/Y: 32`;
- `topOrnamentScale: 0.78`;
- `bottomOrnamentScale: 0.84`.

Corner formulas:

```text
TL bbox.x = frameLineRect.x - cornerAnchorOffset.x
TL bbox.y = frameLineRect.y - cornerAnchorOffset.y

TR bbox.x = frameLineRect.x + frameLineRect.w - (cornerSize - cornerAnchorOffset.x)
TR bbox.y = frameLineRect.y - cornerAnchorOffset.y

BL bbox.x = frameLineRect.x - cornerAnchorOffset.x
BL bbox.y = frameLineRect.y + frameLineRect.h - (cornerSize - cornerAnchorOffset.y)

BR bbox.x = frameLineRect.x + frameLineRect.w - (cornerSize - cornerAnchorOffset.x)
BR bbox.y = frameLineRect.y + frameLineRect.h - (cornerSize - cornerAnchorOffset.y)
```

W ten sposob lokalny anchor assetu trafia w corner `frameLineRect`, zamiast przypadkowo wyrownywac caly viewBox do recta.

Edge line-anchor logic:

```text
top/bottom startX = frameLineRect.x + cornerJoinInset
top/bottom endX   = frameLineRect.x + frameLineRect.w - cornerJoinInset
assetWidth        = (endX - startX) + edgeLineInset * 2
assetX            = startX - edgeLineInset
assetY            = frameLineY - edgeThickness / 2

left/right startY = frameLineRect.y + cornerJoinInset
left/right endY   = frameLineRect.y + frameLineRect.h - cornerJoinInset
assetHeight       = (endY - startY) + edgeLineInset * 2
assetY            = startY - edgeLineInset
assetX            = frameLineX - edgeThickness / 2
```

`cornerJoinInset` jest dystansem od corner anchora do miejsca, w ktorym edge zaczyna widoczny przebieg linii. Dla obecnego SUB-META SVG wartosc `52` odpowiada dlugosci widocznego corner runu i ogranicza chaotyczne wejscie edge pod ornament naroznika.

Center ornaments:

- top-center anchor: `{ x: frameLineRect.x + frameLineRect.w / 2, y: frameLineRect.y + topOrnamentOffsetY }`;
- bottom-center anchor: `{ x: frameLineRect.x + frameLineRect.w / 2, y: frameLineRect.y + frameLineRect.h + bottomOrnamentOffsetY }`;
- `ornamentScale` pozostaje parametrem layoutu, liczonym wzgledem naturalnego rozmiaru ornamentu `220 x 64`;
- offsety domyslnie wynosza `0`, czyli ornament siedzi blisko osi krawedzi.

Debug overlay pokazuje:

- target rect;
- `frameLineRect`;
- corner anchor points;
- edge line start/end points;
- corner, edge i ornament bounding boxes;
- ornament center points.

Ta korekta nie zmienia SVG, manifestu, mechaniki, `cards.js`, `hc.ui_debug.js`, ani nie wlacza production SUB-META integration.

## 13. SUB-META mount point preparation

FrameComposer nie powinien znac produkcyjnego layoutu SUB-META na sztywno.

Zasada przyszlej integracji:

```text
cards.js / World state
  -> SUB-META view model
  -> SubMetaLayoutAnchors
  -> HC.CardVisuals
  -> HC.FrameComposer
  -> HC.VisualAssets
```

FrameComposer dostaje:

- mount point rect, np. `submeta.root_frame`, `submeta.world_slots_panel_frame`, `submeta.slot_frame`;
- style preset, np. `astrolabe`, `forge`, `minimal`;
- density, np. `small`, `medium`, `large`;
- visual state, np. `static`, `selected`, `locked`, `active`, `disabled`;
- resolved parts lub logicalName map.

FrameComposer nie dostaje:

- kosztow RP jako reguly;
- decyzji, czy karta moze byc przypisana;
- sekwencji R1/R2/R3/R4;
- PRG behavior;
- mutacji `World.score`, `cardsPool` albo slotow.

Aktualny SUB-META layout w `cards.js` wymaga osobnego extraction/anchor pass przed integracja runtime. `getSubMetaLayout(screenW, screenH)` liczy dzis recty, ale `renderSubMetaOverlay` i `handleSubMetaPointerDown` mieszaja layout, rysowanie, selection state, assign/remove/forge i legacy SVG fallback. Przed podpieciem ramek nalezy wytworzyc czysty kontrakt `SubMetaLayoutAnchors`, opisany w `SUB_META_LAYOUT_ANCHOR_AUDIT.md`.

Minimalny przyszly integration path:

1. Wydzielic pure anchor layout bez mutacji mechaniki.
2. Zmapowac mount points i density.
3. Podpiac pojedynczy frame za flaga visual.
4. Zachowac obecny fallback, gdy manifest lub asset nie jest gotowy.

Extraction pass v0.1:

- `hc.submeta_layout.js` udostepnia `HC.SubMetaLayout.computeWithAnchors(width, height, options)`;
- `cards.js` uzywa `HC.SubMetaLayout.compute(...)` przez kompatybilny wrapper `getSubMetaLayout()`;
- `HC.SubMetaLayout.computeAnchors(layout)` zwraca mount points, ktore FrameComposer bedzie mogl konsumowac w przyszlym pass;
- FrameComposer nadal nie liczy layoutu SUB-META i nie powinien przejmowac tej odpowiedzialnosci;
- production SUB-META FrameComposer integration pozostaje `not_integrated`.

## 14. Runtime path: SUB-META root frame behind flag

Status na 2026-05-01: `submeta.root_frame` uzywa segmented main frame v01 za flaga w `cards.js`.

Zakres probe:

- tylko `submeta.root_frame`;
- tylko glowna rama overlay SUB-META;
- brak ramek slotow, paneli wewnetrznych, kart, pickerow, Kuzni i buttonow;
- brak depth/relief, animation i live-coloring;
- brak zmian mechaniki, kosztow RP, sekwencji, PRG behavior i hit rectow.

Flaga:

```js
const FRAME_COMPOSER_SUBMETA_ROOT_ENABLED = true;
```

Przeplyw:

```text
renderSubMetaOverlay
  -> getSubMetaLayout()
  -> HC.SubMetaLayout.computeAnchors(layout)
  -> submeta.root_frame rect
  -> HC.FrameComposer.computeSubmetaMainFrameV01Layout(rect)
  -> HC.FrameComposer.drawSegmentedFrameParts(ctx, HC.VisualAssets, frameLayout, partMap)
```

`HC.VisualAssets` laduje manifest `/assets/visual/submeta/submeta_main_frame_v01_manifest.json` i preloaduje 16 assetow root frame: 4 corners, 4 center ornaments i 8 connector segments.

Poprzedni astrolabe path (`computeSubmetaAstrolabeLayout`, `drawFrameParts`) zostaje w kodzie jako sandbox/reference compatibility, ale nie jest aktywnym SUB-META root frame path.

Fallback:

- jesli flaga jest `false`, uzywany jest stary render;
- jesli `HC.VisualAssets`, `HC.FrameComposer` albo `HC.SubMetaLayout` sa niedostepne, uzywany jest stary render;
- jesli manifest/preload nie sa gotowe w pierwszej klatce, render przechodzi fallbackiem i probe probuje narysowac frame w kolejnych klatkach po zakonczeniu preload;
- jesli `drawSegmentedFrameParts` nie narysuje pelnego zestawu root frame, stary fallback zostaje zachowany.

Ten path nie oznacza pelnej produkcyjnej integracji SUB-META. To minimalna integracja runtime dla jednego mount pointu. Ramki slotow, panele wewnetrzne, depth/relief, live-coloring, animation hooks i raster shadow/glow pass pozostaja przyszlymi krokami.

## 15. v0.1 implementation status

Status na 2026-05-01 (SUB-META main frame v01 export/runtime pass):

- `HC.VisualAssets` default manifest wskazuje `assets/visual/submeta/submeta_main_frame_v01_manifest.json`;
- `HC.FrameComposer` ma osobne funkcje `computeSubmetaMainFrameV01Layout()` i `drawSegmentedFrameParts()` dla 16-czesciowej struktury segmented edge;
- `cards.js` uzywa segmented part map: 4 corners, 4 center ornaments, 8 connector segments;
- fallback proceduralny SUB-META root frame pozostaje aktywny, jesli manifest/preload/draw nie przejdzie;
- mechanika kart, RP, sekwencje i PRG behavior nie zostaly zmienione;
- dodano preview `assets/visual/preview/submeta_main_frame_v01_preview.html`;
- status assetow: `runtime_candidate`, nie finalny raster/glow/shadow production pass.

Status na 2026-04-28 (repo-only infrastructure pass):

- `HC.VisualAssets` zaimplementowany jako bezpieczny loader/cache/lookup dla manifestu `assets/visual/modular_frame_kit_v01_manifest.json`;
- `HC.FrameComposer` zaimplementowany dla pure layout calculations (`frameLineRect`, `corners`, `edges`, `center ornaments`, `anchorOffset`, `lineInset`, `cornerJoinInset`, `ornamentScale`) + debug helper;
- `HC.SubMetaLayout` zaimplementowany jako extraction pass v0.1 dla obecnego SUB-META layoutu i semantycznych mount points;
- SUB-META ma runtime probe dla `submeta.root_frame` za flaga; pelna production visual integration nadal wymaga osobnego passu;
- dodano sandbox review `assets/visual/preview/frame_composer_sandbox.html` (manifest + preload + pojedynczy frame draw + debug anchors);
- runtime integration pozostaje czesciowe/probe-only;
- produkcyjny rendering SUB-META uzywa FrameComposera tylko dla root frame, a reszta overlay pozostaje legacy/procedural canvas;
- depth/relief, live-coloring i animation hooks pozostaja future pass.

## 16. What this spec does not implement

Ten kontrakt nie jest implementacja runtime. Nie dostarcza gotowego API produkcyjnego, nie uruchamia integracji z `cards.js` i nie dostarcza finalnych assetow.

W szczegolnosci nie implementuje:

- mechaniki kart, PRG i sekwencji;
- produkcyjnego fitting pass dla wszystkich stref SUB-META;
- automatycznego resolvingu aliasow naming v0.6/v0.7 w runtime;
- finalnej polityki fallbackow assets po stronie runtime.

## 17. Zakazy

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
