# Haiku Cosmos — Figma Frame Cutting Guide

Status: ROBOCZY / STANDARD WYKONAWCZY
Obszar: visual / Figma / SVG / modular frame cutting
Źródło prawdy: TAK roboczo dla sposobu cięcia ramek w Figmie; NIE dla mechaniki; NIE dla runtime implementation
Powiązane dokumenty:
- docs/current/visual/VISUAL_EXECUTION_GUIDE.md
- docs/current/visual/FIGMA_WORKFLOW.md
- docs/current/visual/MODULAR_FRAME_KIT.md
- docs/current/visual/SVG_ASSET_STANDARDS.md
- docs/current/visual/SUB_META_ASSET_PIPELINE.md
- docs/current/technical/FRAME_COMPOSER_SPEC.md
- docs/current/technical/CENTER_BASED_POSITIONING_SPEC.md
- docs/current/ui/SUB_META_V2_MASTER_SPEC.md

## 1. Cel dokumentu

Ten dokument opisuje bezpieczny sposób cięcia ramek i ornamentów w Figmie na modularne części SVG dla Haiku Cosmos.

Problem, który rozwiązuje:
- Codex/Figma nie może zgadywać, jak ciąć ramę.
- Nie wolno tworzyć przypadkowych kopii pełnych ramek ukrytych pod maskami.
- Nie wolno układać wyciętych fragmentów tak blisko siebie, że nachodzą na siebie i powodują błędne kopiowanie całych grup.
- Każda część ramy musi mieć własny, przewidywalny bounding box, nazwę, anchor metadata i status.

Docelowo ramka ma być rozbita na części:
- corner_tl
- corner_tr
- corner_bl
- corner_br
- edge_top
- edge_bottom
- edge_left
- edge_right
- ornament_top_center
- ornament_bottom_center
- optional slot frames
- optional bridge lines
- optional resonance nodes
- optional state/accent layers

## 2. Zasada nadrzędna

Nie tniemy ramek „wizualnie”.
Tniemy je kontraktowo.

Każdy element musi odpowiedzieć na pytania:

1. Czym jest?
   corner / edge / ornament / slot_frame / bridge_line / resonance_node / state_layer

2. Jak się montuje?
   anchorType / anchorPoint / anchorOffset / lineInset / stretchAxis

3. Czy może być skalowany?
   none / x / y / bounded

4. Czy ma warstwę dynamiczną?
   static_base / tintable_accent / animatable_state_layer

5. Czy ma osobny bounding box?
   Tak. Każdy eksportowany komponent musi mieć własny frame eksportowy.

## 3. Co w Figmie jest prawdziwym cięciem, a co tylko pozorem cięcia

### 3.1. Maski

Maska ukrywa część obiektu, ale nie usuwa źródłowej geometrii.

Dozwolone użycie masek:
- review,
- szybkie sprawdzenie kadru,
- tymczasowy fitting,
- pokazanie projektantowi, jak wygląda fragment.

Zakazane użycie masek:
- jako finalnego sposobu cięcia produkcyjnych SVG,
- jako metody tworzenia modular frame parts,
- jako ukrycia pełnej ramki w każdym eksporcie.

Jeżeli komponent eksportowy zawiera pełną ramę schowaną pod maską, jest niepoprawny.

### 3.2. Crop

Crop jest użyteczny dla obrazów/rasterów, ale nie jest produkcyjnym cięciem wektorowej ramki.

Dozwolone:
- crop rastra referencyjnego,
- crop preview image,
- crop do porównania proporcji.

Zakazane:
- crop jako finalna metoda cięcia wektorowego SVG.

### 3.3. Boolean operations

Boolean operations są główną metodą prawdziwego cięcia geometrii wektorowej w Figmie.

Używać:
- Intersect — do wycinania fragmentu ramy w obrębie okna cięcia.
- Subtract — do usuwania fragmentów pomocniczych.
- Union — do scalania elementów, które mają być jedną geometrią.
- Exclude — tylko ostrożnie, gdy potrzebne są otwory/negatywy.

Zasada:
Przed boolean operation zawsze wykonaj duplikat źródła. Nigdy nie niszcz master source.

### 3.4. Flatten

Flatten może połączyć zaznaczone elementy w jeden vector layer.

Używać dopiero po:
- wykonaniu kopii źródła,
- ustaleniu finalnego fragmentu,
- sprawdzeniu, że nie zgubiliśmy warstw static/accent/state,
- sprawdzeniu, że fragment nie zawiera niepotrzebnej pełnej ramy.

Nie używać Flatten jako pierwszego kroku.

### 3.5. Outline stroke

Outline stroke zamienia stroke na wypełnioną geometrię wektorową.

Używać, gdy:
- stroke ma być realną geometrią po eksporcie,
- Figma/SVG export źle interpretuje stroke,
- potrzebne jest stałe cięcie po kształcie stroke.

Nie używać automatycznie na wszystkim, bo zwiększa złożoność SVG i utrudnia późniejszy cleanup.

## 4. Przygotowanie pliku Figma przed cięciem

Utwórz osobne strony:

1. README / Rules
2. Source Master — DO NOT EDIT
3. Cutting Windows
4. Cut Parts — Working
5. Components — Clean
6. Assembly Test
7. Export Staging
8. Notes / Manifest Draft

## 5. Source Master — zasady

Na stronie Source Master trzymamy oryginalną ramkę lub wektor po cleanupie.

Zasady:
- Nie edytować bezpośrednio.
- Nie flattenować.
- Nie outline stroke globalnie.
- Nie maskować jako finalny output.
- Nie eksportować bezpośrednio jako production candidate.
- Źródło służy wyłącznie do kopiowania fragmentów.

Każdy kolejny pass zaczyna się od duplikatu Source Master.

## 6. Cutting Windows — zasady okien cięcia

Okna cięcia muszą być zwykłymi prostokątami lub frame’ami o jawnych wymiarach.

Każde okno ma nazwę:

cut.corner_tl
cut.corner_tr
cut.corner_bl
cut.corner_br
cut.edge_top
cut.edge_bottom
cut.edge_left
cut.edge_right
cut.ornament_top_center
cut.ornament_bottom_center

Zasady:
- Okna narożników muszą mieć równe proporcje.
- Jeśli narożniki są lustrzane, użyj jednego master corner i wykonaj mirror/rotate dla pozostałych.
- Nie stosuj różnych przypadkowych crop boxów dla podobnych narożników.
- Okno cięcia musi obejmować tylko potrzebny fragment + kontrolowany bleed.
- Okno nie może obejmować sąsiedniego ornamentu, jeśli ornament jest osobnym komponentem.
- Okno edge nie może zawierać cornera.
- Okno ornamentu nie może zawierać edge jako własnej części, chyba że ornament jest świadomie zintegrowanym elementem.

## 7. Procedura cięcia narożnika

Dla `corner_tl`:

1. Skopiuj Source Master na stronę Cut Parts — Working.
2. Nałóż prostokąt `cut.corner_tl` na lewy górny narożnik.
3. Ustaw prostokąt cięcia jako zwykły shape bez efektów.
4. Zduplikuj fragment źródła razem z prostokątem cięcia.
5. Wykonaj Intersect selection.
6. Sprawdź, czy wynik zawiera tylko geometrię narożnika.
7. Usuń wszystkie ukryte pełne ramy, maski i pozostałości źródła.
8. Nadaj nazwę warstw:
   - frame-base
   - frame-secondary
   - ticks
   - ornament
   - accent
   - state-layer
   jeśli dana warstwa istnieje.
9. Utwórz frame eksportowy:
   `submeta_frame_corner_tl_astrolabe_01`
10. Ustaw transparent background.
11. Zostaw kontrolowany padding tylko wtedy, gdy jest opisany jako `anchorOffset`.
12. Dodaj notatkę manifestową:
   anchorType: corner
   stretchAxis: none
   anchorOffset: { x: ..., y: ... }
   safeMinSize: { w: ..., h: ... }

Dla pozostałych narożników:
- Preferuj transformację master corner przez mirror/rotate, jeśli styl na to pozwala.
- Jeśli każdy narożnik ma osobną geometrię, nadal użyj identycznych wymiarów okien cięcia.
- Nie wolno mieć czterech narożników z losowo różnymi crop/bounding boxami.

## 8. Procedura cięcia edge

Dla `edge_top`:

1. Skopiuj Source Master.
2. Użyj prostokąta `cut.edge_top`, który obejmuje wyłącznie prosty odcinek krawędzi.
3. Nie obejmuj narożników.
4. Nie obejmuj ornamentu środkowego.
5. Wykonaj Intersect selection.
6. Oczyść wynik.
7. Utwórz frame eksportowy:
   `submeta_frame_edge_top_thin_astrolabe_01`
8. Dodaj metadata:
   anchorType: edge
   stretchAxis: x
   lineInset: ...
   edgeThickness: ...
   safeMinSize: ...

Dla `edge_bottom`:
- Analogicznie, stretchAxis: x.

Dla `edge_left` i `edge_right`:
- stretchAxis: y.
- Upewnij się, że edge nie zawiera ornamentu bocznego, jeśli ornament ma być osobnym komponentem.
- Jeżeli ornament boczny jest potrzebny, wytnij go jako `ornament_side_center` lub `edge_left_center_ornament`, nie jako część rozciąganego edge.

## 9. Procedura cięcia ornamentu centralnego

Dla `ornament_top_center`:

1. Skopiuj Source Master.
2. Użyj prostokąta cięcia obejmującego tylko ornament.
3. Nie włączaj całej górnej krawędzi jako tła.
4. Wykonaj Intersect selection.
5. Oczyść wynik.
6. Utwórz frame eksportowy:
   `submeta_frame_ornament_top_center_astrolabe_01`
7. Dodaj metadata:
   anchorType: center
   stretchAxis: none
   defaultScale: ...
   ornamentScale: controlled by FrameComposer
   centerAnchor: top_center
   safeMinSize: ...

Ornament nie jest częścią rozciąganego edge.
Ornament jest osobnym assetem, osadzanym na środku konstrukcyjnej krawędzi.

## 10. Jak uniknąć problemu kopiowania całej ramki

Jeżeli kliknięcie pionowej linii kopiuje całą ramkę, prawdopodobne przyczyny są takie:

1. Linia jest częścią dużej grupy.
2. Linia jest ukryta pod maską razem z pełną ramą.
3. Linia jest instancją komponentu zawierającego całą ramę.
4. Linia jest wynikiem boolean group, która nadal trzyma pełne źródło.
5. Fragmenty są ułożone zbyt blisko siebie i Figma łapie parent frame/group zamiast sublayer.

Naprawa:

1. Wybieraj warstwę z panelu Layers, nie przez kliknięcie na canvasie.
2. Wejdź do grupy / boolean group / vector edit mode.
3. Sprawdź, czy sublayer nie zawiera pełnego źródła.
4. Jeśli zawiera, wykonaj prawdziwe cięcie przez Intersect na duplikacie.
5. Każdy finalny element przenieś do osobnego frame eksportowego.
6. Rozstaw komponenty na stronie roboczej z dużym marginesem:
   minimum 80–160 px między export frames.
7. Nie nakładaj export frames na siebie.
8. Nie trzymaj kilku wariantów tej samej części w jednym frame eksportowym.

## 11. Bounding box i export frame

Każdy asset eksportowy musi mieć własny frame.

Frame eksportowy:
- ma transparent background,
- ma nazwę zgodną z plikiem,
- obejmuje tylko dany asset + kontrolowany bleed,
- nie zawiera pełnej ramy,
- nie zawiera obrazów,
- nie zawiera base64,
- nie zawiera fontów,
- nie zawiera baked heavy glow/shadow,
- nie zawiera nieużytych warstw źródłowych.

Dobra praktyka:
- `visualMountRect` to obszar montażu.
- `visualBleedRect` to dozwolone wystawanie ornamentu/cienia.
- `contentSafeRect` nie jest naruszany przez ornament.

## 12. Stroke rules

Stroke powinien być cienki i przygotowany pod SVG/runtime.

Zasady:
- Preferuj center stroke dla przewidywalnego SVG.
- Jeżeli użyto inside/outside stroke, sprawdź eksport SVG, bo Figma może uprościć stroke.
- Stroke weight nie powinien być traktowany jako część wymiaru layera.
- Jeżeli stroke musi być geometrią, użyj Outline stroke na kopii finalnej.
- Nie outline’uj całego źródła na początku pracy.
- Dla linii rozciąganych unikaj geometrii o zmiennej grubości, jeśli utrudnia stretchAxis.

## 13. Effects, highlights, glow, shimmer

Efekty w Figmie można stosować do review, ale nie powinny być wypalone w produkcyjnym SVG.

Zasada Haiku:
- static_base: czysta cienka rama bez ciężkich efektów,
- tintable_accent: osobna warstwa koloru,
- animatable_state_layer: osobna warstwa pod pulse/shimmer/draw-in.

Dozwolone:
- lekki highlight jako osobna warstwa `accent`,
- osobna linia aktywna,
- osobny ornament shimmer target,
- osobna warstwa DS/ether accent.

Zakazane:
- baked heavy glow jako część base frame,
- blur/shadow zapisany jako finalny filtr SVG bez decyzji,
- jeden efekt scalony z całą ramą,
- rasterowy highlight w SVG.

## 14. Naming

Nazwy plików:
- lowercase,
- snake_case,
- bez polskich znaków,
- bez spacji.

Przykłady:

submeta_frame_corner_tl_astrolabe_01.svg
submeta_frame_corner_tr_astrolabe_01.svg
submeta_frame_edge_top_thin_astrolabe_01.svg
submeta_frame_edge_left_thin_astrolabe_01.svg
submeta_frame_ornament_top_center_astrolabe_01.svg
submeta_slot_frame_r1_socket_01.svg
submeta_bridge_line_prg_world_01.svg
card_state_new_card_pulse_layer_01.svg

Logical names:

submeta.frame.corner.tl.astrolabe_01
submeta.frame.corner.tr.astrolabe_01
submeta.frame.edge.top_thin.astrolabe_01
submeta.frame.edge.left_thin.astrolabe_01
submeta.frame.ornament.top_center.astrolabe_01
submeta.slot_frame.r1_socket_01
submeta.bridge_line.prg_world_01
cards.state_accent.new_card_pulse_01

## 15. Metadata manifest draft

Dla każdego assetu przygotuj wpis manifestowy:

{
  "logicalName": "submeta.frame.corner.tl.astrolabe_01",
  "file": "assets/visual/submeta/svg/frame_parts/submeta_frame_corner_tl_astrolabe_01.svg",
  "category": "frame_part",
  "role": "corner_tl",
  "status": "review_ready",
  "stateType": "static_base",
  "anchorType": "corner",
  "anchorPoint": { "x": 16, "y": 16 },
  "anchorOffset": { "x": 16, "y": 16 },
  "stretchAxis": "none",
  "lineInset": 0,
  "defaultScale": 1,
  "safeMinSize": { "w": 120, "h": 120 },
  "densityBehavior": "medium"
}

Dla edge:

{
  "logicalName": "submeta.frame.edge.top_thin.astrolabe_01",
  "category": "frame_part",
  "role": "edge_top",
  "status": "review_ready",
  "stateType": "static_base",
  "anchorType": "edge",
  "stretchAxis": "x",
  "lineInset": 10,
  "edgeThickness": 28,
  "safeMinSize": { "w": 160, "h": 28 },
  "densityBehavior": "small|medium|large"
}

Dla ornamentu:

{
  "logicalName": "submeta.frame.ornament.top_center.astrolabe_01",
  "category": "frame_part",
  "role": "ornament_top_center",
  "status": "review_ready",
  "stateType": "static_base",
  "anchorType": "center",
  "stretchAxis": "none",
  "defaultScale": 0.78,
  "safeMinSize": { "w": 160, "h": 48 },
  "densityBehavior": "hide_on_small"
}

## 16. Assembly Test

Po wycięciu części utwórz stronę Assembly Test.

Test musi pokazać:
- złożenie ramki z 4 narożników,
- 4 krawędzi,
- 2 ornamentów centralnych,
- bez monolitycznej pełnej ramy,
- bez ukrytych masek,
- bez nachodzenia edge na corner,
- bez przerw między corner i edge,
- z debug anchor points,
- z frameLineRect,
- z widocznym target rect.

Jeżeli edge nachodzi na corner:
- popraw `cornerJoinInset`,
- popraw `lineInset`,
- nie przesuwaj ręcznie assetów bez wpisania korekty do metadata.

Jeżeli ornament zjada linię:
- zmniejsz `ornamentScale`,
- zwiększ jego osobny bleed,
- nie włączaj ornamentu do edge.

## 17. Export rules

Przed eksportem SVG sprawdź:

- Czy frame ma transparent background?
- Czy jest viewBox?
- Czy nie ma bitmap?
- Czy nie ma base64?
- Czy nie ma embedded fonts?
- Czy nie ma baked heavy glow/shadow?
- Czy nazwy warstw są czytelne?
- Czy asset jest osobnym komponentem?
- Czy metadata opisuje anchor?
- Czy status jest jawny?
- Czy export nie zawiera pełnej ramy ukrytej pod maską?

Statusy:
- review_ready — nadaje się do review.
- production_candidate — po walidacji SVG i assembly test.
- legacy/evidence — historia, nie używać w runtime.
- debug/reference_only — nie używać w runtime.

## 18. Czego Codex nie może robić

Codex nie może:
- traktować maski jako finalnego cięcia,
- eksportować pełnej ramy ukrytej pod clipem,
- tworzyć przypadkowych cropów o różnych proporcjach,
- mieszać corners, edges i ornaments w jednym assetcie,
- zostawiać komponentów bez nazw,
- układać wyciętych elementów tak blisko siebie, że selection łapie parent/group,
- wypalać glow/shadow w static_base,
- zmieniać mechaniki kart, RP, SUB-META ani FrameComposer runtime przy tym zadaniu,
- integrować assetów z runtime bez osobnego promptu.

## 19. Expected Codex output

Po wykonaniu zadania Codex ma zwrócić:

1. EXECUTIVE SUMMARY
   Co zostało zrobione i jaki jest status.

2. LISTA ZMIENIONYCH / UTWORZONYCH ELEMENTÓW
   Strony Figma, komponenty, manifest draft, preview.

3. CUTTING REPORT
   Dla każdego assetu:
   - nazwa,
   - kategoria,
   - metoda cięcia,
   - anchor metadata,
   - status,
   - ryzyka.

4. VALIDATION CHECKLIST
   - maski usunięte z finalnych assetów,
   - brak pełnych ramek ukrytych w komponentach,
   - równe proporcje narożników,
   - edge nie zawiera cornerów,
   - ornament jest osobny,
   - assembly test działa.

5. RYZYKA / OGRANICZENIA
   Co nadal wymaga ręcznej weryfikacji.

6. NASTĘPNY KROK
   Czy można robić eksport SVG, czy trzeba poprawić cięcia.
