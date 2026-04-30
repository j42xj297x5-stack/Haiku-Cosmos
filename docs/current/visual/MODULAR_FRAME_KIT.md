# Haiku Cosmos - Modular Frame Kit

> Status: KIERUNEK / RESET PO AUDYCIE
> Obszar: visual / assets / Figma / SVG / HUD / SUB-META
> Źródło prawdy: TAK, dla kierunku nowego modular frame kit
> Ostatnia aktualizacja: 2026-04-29
> Nie obejmuje: mechaniki, sekwencji, kosztów RP, implementacji FrameComposer

## 1. Decyzja po audycie

Audyt aktualnego passu SVG wykazał, że zestaw `style_correction` nie nadaje się jako baza produkcyjna dla FrameComposera.

Najważniejsze problemy:

- dominują pełne, monolityczne ramy zamiast modułów corner/edge/ornament;
- występują duplikaty między lokalnym eksportem Figma i `assets/visual`;
- wiele plików ma baked-in filtry glow/shadow;
- brakuje `vector-effect="non-scaling-stroke"`;
- grupy/layer names są niespójne;
- kolory są wypalone w źródłach i utrudniają runtime tinting.

Decyzja:

- obecny pass SVG ma status `LEGACY / EVIDENCE / STYLE EXPLORATION`;
- nie jest kanonem wizualnym;
- nie jest produkcyjnym zestawem runtime;
- nie jest bazą do FrameComposera;
- nowe ramki powstają od zera w Figmie jako modular frame kit.

Legacy evidence znajduje się w:

- `assets/visual/legacy/style_correction_2026_04/figma_export/`
- `assets/visual/legacy/style_correction_2026_04/runtime_test_assets/`

## 2. Docelowa modularność

Nowy kit ma składać się wyłącznie z części, nie z pełnych overlayów:

- corners: `corner_tl`, `corner_tr`, `corner_bl`, `corner_br`;
- edges: `edge_top`, `edge_bottom`, `edge_left`, `edge_right`;
- center ornaments: `ornament_top_center`, `ornament_bottom_center`;
- neutral panel frames;
- slot frames;
- resonance sockets/nodes;
- bridge/connection lines;
- sequence markers;
- card state accents.

FrameComposer lub podobny moduł ma później składać te części w runtime. Ten dokument nie definiuje jeszcze implementacji.

## 3. Rodziny stylu

Główne rodziny nowego passu:

- `astrolabe / alchemical` - główna rodzina SUB-META;
- `sacred / eldritch subtle` - gniazda, relacje, mosty i resonance nodes;
- `forge / brass` - osobny przyszły zestaw dla Kuźni;
- `minimal / sequence` - HUD i sekwencje.

Styl ma pozostać zgodny z rytualnym minimalizmem kosmicznym: cienka linia, dużo oddechu, brak ciężkich fantasy ramek i brak agresywnego neonu.

## 4. Zasady SVG

Nowe źródła SVG powinny być przygotowane tak, aby dało się je składać i kolorować w runtime:

- transparent background;
- grouped layers with clean names;
- no embedded fonts;
- no bitmap;
- no base64;
- no baked heavy shadows;
- no final raster backgrounds;
- thin strokes;
- `vector-effect="non-scaling-stroke"` albo eksport z myślą o takim post-processingu;
- neutral base layers oddzielone od accent/state layers.

Glows, pulse, shimmer i draw-in powinny być traktowane jako runtime effect layer, nie jako ciężko wypalony filtr w źródle SVG.

## 5. Static vs Dynamic Layers

### A. Warstwy statyczne

Warstwy statyczne to elementy stabilne, zwykle bez animacji:

- bazowe narożniki paneli;
- bazowe cienkie krawędzie;
- neutralne ramy paneli;
- neutralne ramy HUD;
- nieaktywne separatory;
- nieaktywne slot frames;
- podstawowy dark/panel substrate.

Zasady:

- cienka linia;
- brak agresywnego glow;
- neutralne złoto, perła, grafit lub ciemny materiał panelowy;
- przygotowanie pod tinting, ale domyślnie stabilny, spokojny wygląd.

### B. Warstwy dynamiczne

Warstwy dynamiczne mogą być kolorowane i animowane live:

- karta osadzona w slocie;
- aktywna obwódka slotu;
- aktywne połączenie między slotami;
- resonance line / bridge;
- sekwencyjny marker `R1` / `R2` / `AA` / `AAA`;
- nowa karta w magazynie;
- karta nietknięta / nieotwarta;
- hover / focus / selected;
- DS / piąty stan;
- aktywny koszt / brak kosztu;
- aktywna Kuźnia.

Dynamic layer nie powinien zamieniać UI w neon. Ruch ma być subtelny, czytelny i osadzony w systemie koloru.

### C. Zasada "new / untouched card"

Nowa karta, która trafia do magazynu, może mieć subtelny ruch:

- delikatny pulse linii;
- lekki shimmer ornamentu;
- mały oddech glow;
- spokojny draw-in obwódki.

Po otwarciu, obejrzeniu albo wybraniu karty:

- karta dostaje status `seen/touched`;
- traci animację nowości;
- pozostaje normalnym, stabilnym elementem.

To jest kierunek visual/UX i future pass. Nie wymaga implementacji teraz, jeśli runtime nie ma bezpiecznego statusu `seen/touched`.

### D. Slot connections

Połączenia między slotami, jeśli powstaną, powinny być projektowane jako dynamiczne:

- cienkie linie;
- aktywne mosty;
- subtelny pulse;
- możliwy draw-in;
- kolor osi albo relacji;
- bez agresywnego neonu.

Ten kierunek nie implementuje mechaniki połączeń. To visual direction i przyszły hook animacyjny.

### E. Karty w slotach

Karty w slotach mogą mieć:

- aktywną linię obwódki;
- subtelny pulse w aktywnym stanie;
- kolor osi;
- delikatny stan `locked` / `disabled` / `active`.

Bazowy frame karty pozostaje stabilny. Ruch dotyczy tylko state/accent layer.

## 6. Minimalny zakres nowego passu

Pierwszy nowy pass powinien dostarczyć:

- SUB-META astrolabe modular frame kit;
- HUD minimal sequence kit;
- card state accents.

Szczegółowy prompt/spec dla Figmy znajduje się w `MODULAR_FRAME_KIT_FIGMA_PROMPT.md`.

## 7. Figma pass v0.1

Nowy plik Figma dla pierwszego modularnego passu:

- Nazwa: `Haiku Cosmos — Modular Frame Kit v0.1`
- File key: `1KsSouDlvB24HznqRPXUf5`
- URL: https://www.figma.com/design/1KsSouDlvB24HznqRPXUf5

Utworzono sześć stron:

- `README / Rules`
- `SUB-META Astrolabe Kit`
- `HUD Minimal Sequence Kit`
- `Card State Accents`
- `Runtime Tinting Notes`
- `Mini Assembly Board`

Pass v0.1 zawiera `35` modularnych komponentów:

- `14` części SUB-META astrolabe kit;
- `15` części HUD minimal sequence kit;
- `6` warstw card state accents.

Najważniejsze zasady wykonania:

- komponenty są częściami ram, nie pełnymi overlayami;
- komponenty mają transparentne tła;
- warstwy są rozdzielone na `frame-base`, `frame-secondary`, `ticks`, `ornament`, `accent`, `state-layer`;
- akcenty są przygotowane pod runtime tinting;
- `state-layer` jest przyszłym targetem animacji;
- glow/pulse/shimmer pozostają runtime effect layer, nie baked SVG.

SVG zostaly wyeksportowane do repo w trzech batchach technicznych. Zestaw ma status `exported_review_ready`, ale nie jest jeszcze zintegrowany z runtime.

Szczegóły passu i lista komponentów są zapisane w `SUB_META_FIGMA_ASSET_PASS_01.md`, sekcja `15. Modular Frame Kit Figma pass v0.1`.

## 8. Status eksportu v0.1

Manifest: `assets/visual/modular_frame_kit_v01_manifest.json`.

Asset count: `35` SVG:

- `14` SUB-META frame parts;
- `15` HUD frame parts;
- `6` Card State Accents.

Runtime integration: `not_integrated`.

Legacy `style_correction_2026_04` pozostaje evidence w `assets/visual/legacy/` i nie jest produkcyjnym source-of-truth.

## 9. Static preview board

Statyczny preview board znajduje sie w:

- `assets/visual/preview/modular_frame_kit_v01_preview.html`

To narzedzie review przed FrameComposerem. Pokazuje proof of assembly dla SUB-META, HUD, Card State Accents i CSS-only tinting simulation. Nie podlacza assetow do runtime i nie definiuje implementacji FrameComposera.

Preview tuning note:

- center ornaments powinny miec osobne parametry `ornamentScale`;
- top-center moze byc minimalnie mocniejszy niz bottom-center, ale nie moze dominowac cienkiej ramy;
- skala ornamentu jest parametrem kompozycyjnym layoutu, nie zmiana assetu SVG.

Szczegoly przyszlego kontraktu technicznego FrameComposera sa w `../technical/FRAME_COMPOSER_SPEC.md`. Spec opisuje `anchorOffset`, `lineInset`, `ornamentScale`, debug anchors oraz static/dynamic layers bez implementacji runtime.

## 10. Runtime follow-up

Po nowym eksporcie SVG potrzebny będzie osobny etap:

- walidacja SVG;
- post-processing pod `non-scaling-stroke`, jeśli Figma nie wyeksportuje tego poprawnie;
- manifest produkcyjnych modular assets;
- integracja FrameComposer;
- dopiero później live-coloring i animacje.

## 11. Figma cleanup + derived frame kit v0.2

> Data: 2026-04-29
> Tryb: Figma MCP cleanup + derived component kit
> File key: `HSAtk0l6Udl5XZp28Ijesl`
> URL: https://www.figma.com/design/HSAtk0l6Udl5XZp28Ijesl/ramka-v1?node-id=3-19&t=2BKRKd76WaKHgSSE-0

Pass v0.2 uzyl dwoch traced vector bases jako materialu referencyjnego:

- `Page 1 / image 1 (Traced)` jako `BIG FRAME LANGUAGE`;
- `Page 2 / image 1 (Traced)` jako `SMALL PANEL LANGUAGE`.

Zrodla nie zostaly potraktowane jako finalne assety. Zamiast tego wykonano cleanup przez przerysowanie i normalizacje do modularnych czesci.

Utworzono w Figmie:

- `9` stron roboczych;
- `70` komponentow draft/evidence;
- rodziny: `main`, `small`, `slot`, `node`, `connector`, `card`, `forge`, `detail`;
- shared metadata namespace: `haiku.framekit.v02`;
- neutral black stroke components, bez gradientow, glow, rasterow, image paints, effects i tekstu w komponentach.

Walidacja Figma MCP:

- image paints: `0`;
- effects: `0`;
- component text nodes: `0`;
- missing metadata: `0`;
- root component fills/effects: `0`.

Ten pass jest zgodny z przyszlym FrameComposer/SVG workflow:

- center-based positioning;
- named anchors;
- rozdzial `layoutRect`, `interactiveRect`, `visualMountRect`, `visualBleedRect`, `contentSafeRect`;
- jawny `bleed`;
- `static_base`, `tintable_accent`, `animatable_state_layer`.

Nie wykonano:

- eksportu SVG do repo;
- runtime integration;
- zmian mechaniki;
- Implement Design;
- Code Connect.

Evidence znajduje sie w:

- `SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md`.

## 12. Style correction + derived frame kit v0.3

> Data: 2026-04-29
> Tryb: Figma MCP style correction + source re-cut
> File key: `HSAtk0l6Udl5XZp28Ijesl`
> URL: https://www.figma.com/design/HSAtk0l6Udl5XZp28Ijesl/ramka-v1

Pass v0.3 jest korekta stylu wzgledem v0.2. v0.2 pozostaje evidence i technical baseline, ale nie powinien byc traktowany jako docelowy charakter linii.

Najwazniejsza decyzja v0.3:

- cleanup nie oznacza sterylizacji;
- zachowac zywa, rytualna, kosmologiczna linie z pierwszego zrodla;
- utrzymac komponentowosc, center-based positioning, named anchors i rect separation;
- pracowac roboczym chlodnym stroke `#B8DDF0` na ciemnym tle review, bez finalnej palety produktu.

Utworzono w Figmie:

- `9` nowych stron v0.3;
- `76` komponentow;
- rodziny: `main`, `small`, `slot`, `node`, `connector`, `card`, `forge`, `detail`;
- shared metadata namespace: `haiku.framekit.v03`;
- optional composition tests dla malego panelu, kapsuly, slot/bridge, sredniego panelu i card detail mini.

Walidacja v0.3 component set:

- image paints: `0`;
- effects: `0`;
- component text nodes: `0`;
- missing metadata: `0`;
- black strokes: `0`.

Nie wykonano:

- eksportu SVG do repo;
- runtime integration;
- zmian mechaniki;
- Implement Design;
- Code Connect.

Evidence znajduje sie w:

- `SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md`.
