# Haiku Cosmos — SUB-META + HUD Figma Asset Pass 01

> Status: EVIDENCE / FIGMA PASS — COMPONENT PASS COMPLETED + STYLE CORRECTION PASS 01 COMPLETED / SVG EXPORT NOT WRITTEN TO REPO
> Obszar: Figma, SUB-META, HUD, biblioteka komponentów SVG
> Źródło prawdy: TAK, dla evidence tego uruchomienia Figmy. NIE, dla finalnych assetów, runtime i mechaniki.
> Data: 2026-04-26
> Powiązane dokumenty: FIGMA_WORKFLOW.md, SUB_META_LINE_ORNAMENT_LIBRARY.md, SUB_META_FIGMA_PROMPT_TEMPLATE.md, SUB_META_ASSET_PIPELINE.md, SUB_META_COMPONENTS.md

## 1. Link / identyfikator pliku Figma

- Nazwa pliku: `Haiku Cosmos — SUB-META HUD SVG Library v0.1`
- File key: `Mx7U5CRQjz2T1zrLPgJDSm`
- URL: https://www.figma.com/design/Mx7U5CRQjz2T1zrLPgJDSm

## 2. Zakres planowanego passu

Planowany pass miał utworzyć pierwszą bibliotekę wektorowych komponentów:

- ramki SUB-META,
- ramki kart R1 i DS,
- ramki panelu Kuźni i magazynu,
- linie separatorów,
- linie połączeń,
- ornamenty narożne,
- rozety,
- pierścienie astrolabiczne,
- glify osi i stanów,
- sloty,
- gniazda rezonansu,
- placeholdery panelowe i kart,
- podstawowe elementy HUD,
- mini-kompozycję demonstracyjną.

## 3. Co wykonano

Wykonano:

- utworzenie pustego pliku Figma,
- sprawdzenie dostępnych fontów:
  - `Inter`,
  - `Cinzel`,
  - `Noto Sans`,
- sprawdzenie bibliotek dostępnych w pliku,
- sprawdzenie design-system search dla ramek, linii, ornamentów, glifów, slotów, HUD i typografii.

Wynik sprawdzenia:

- dostępne były biblioteki community, m.in. Material 3 Design Kit i Simple Design System,
- wyszukiwania dla kierunku Haiku Cosmos nie zwróciły pasujących komponentów/zmiennych/stylów,
- dlatego plan zakładał stworzenie własnych komponentów wektorowych.

## 4. Blokada

Przy pierwszym zapisie do canvasu narzędzie Figma MCP zwróciło limit planu Starter:

```text
You've reached the Figma MCP tool call limit on the Starter plan.
```

Oznacza to, że biblioteka komponentów nie została utworzona w tym przebiegu.

## 5. Lista planowanych stron / sekcji

Planowana struktura pliku:

- `README / Art Board`
- `SUB-META Frames`
- `Lines / Connectors`
- `Ornaments`
- `Glyphs`
- `Slots / Placeholders`
- `HUD Basics`
- `Mini Composition`

Te strony nie zostały zapisane z powodu limitu MCP.

## 6. Lista planowanych komponentów

Najważniejsze komponenty przewidziane do utworzenia:

- `submeta/frame/panel/astrolabe_01`
- `submeta/frame/panel/armillary_01`
- `submeta/frame/card/r1_01`
- `submeta/frame/card/ds_01`
- `submeta/line/divider/thin_01`
- `submeta/line/connector/orbit_01`
- `submeta/ornament/corner/rosette_01`
- `submeta/ornament/border/girih_01`
- `submeta/glyph/axis/forma_01`
- `submeta/glyph/axis/intencja_01`
- `submeta/glyph/axis/czas_01`
- `submeta/glyph/axis/cisza_01`
- `submeta/slot/empty_01`
- `submeta/slot/selected_01`
- `hud/frame/rp_counter_01`
- `hud/frame/color_counter_01`
- `hud/meter/sequence_01`
- `shared/ornament/rosette_01`
- `shared/line/tick_scale_01`

Komponenty nie zostały zapisane w Figmie w tym przebiegu.

## 7. Decyzje projektowe przygotowane przed blokadą

Założenia projektowe dla passu:

- astrolabium traktować jako logikę okręgów, łuków, ticków i punktów gwiazd,
- sferę armilarną traktować jako system przecinających się pierścieni i relacji,
- geometrię islamską traktować jako metodę konstrukcji narożników, rozet i pasów granicznych,
- Bagua / trygramy traktować wyłącznie jako inspirację linii pełnych/przerwanych i ośmiu kierunków,
- 28 mansions traktować jako inspirację drobnych ticków i segmentów,
- zachodnie koła kosmograficzne traktować jako zasadę koncentrycznych porządków.

Wszystkie inspiracje miały być przetworzone w autorski alfabet Haiku Cosmos, bez kopiowania dosłownych symboli religijnych, zodiakalnych lub historycznych.

## 8. Czego nie zrobiono

Nie wykonano:

- komponentów Figma,
- wariantów stanów,
- mini-kompozycji demonstracyjnej,
- eksportu SVG,
- rastrów PNG/WebP,
- fontów,
- zmian runtime,
- implementacji UI,
- Code Connect,
- Implement Design.

## 9. Ryzyka

- Plik Figma istnieje, ale nie zawiera jeszcze właściwej biblioteki.
- Pass wymaga ponowienia po odblokowaniu limitu MCP lub na planie z większym limitem.
- Brak screenshotów i metadanych finalnych komponentów, bo komponenty nie powstały.
- Brak eksportu SVG do `assets/visual`.
- Brak oceny projektanta, ponieważ nie ma jeszcze komponentów do przeglądu.

## 10. Następny krok

Po odblokowaniu możliwości zapisu w Figmie należy ponowić pass:

1. otworzyć istniejący plik `Mx7U5CRQjz2T1zrLPgJDSm` albo utworzyć nowy,
2. użyć `FIGMA_WORKFLOW.md` i `SUB_META_FIGMA_PROMPT_TEMPLATE.md`,
3. zbudować strony/sekcje biblioteki,
4. utworzyć komponenty wektorowe,
5. wykonać screenshot/metadata validation,
6. dopiero potem rozważyć eksport SVG do `assets/visual`.

## 11. Completed component pass / export attempt

> Data: 2026-04-26
> File key: `Mx7U5CRQjz2T1zrLPgJDSm`
> URL: https://www.figma.com/design/Mx7U5CRQjz2T1zrLPgJDSm

Po podniesieniu planu/seat canvas-write w istniejącym pliku zaczął działać. Nie utworzono nowego pliku Figma.

### 11.1. Strony / sekcje zapisane w Figmie

- `README / Art Board`
- `SUB-META Frames`
- `Lines / Connectors`
- `Ornaments`
- `Glyphs`
- `Slots / Placeholders`
- `HUD Basics`
- `Mini Composition`

Walidacja inventory zwróciła komplet: `60 / 60` komponentów.

### 11.2. Utworzone komponenty

SUB-META Frames:

- `submeta/frame/panel/astrolabe_01`
- `submeta/frame/panel/armillary_01`
- `submeta/frame/panel/sacred_geometry_minimal_01`
- `submeta/frame/card/r1_01`
- `submeta/frame/card/r1_02`
- `submeta/frame/card/r1_03`
- `submeta/frame/card/ds_01`
- `submeta/frame/card/ds_02`
- `submeta/frame/card/ds_03`
- `submeta/frame/panel/forge_01`
- `submeta/frame/panel/forge_02`
- `submeta/frame/panel/inventory_01`
- `submeta/frame/panel/inventory_02`

Lines / Connectors:

- `submeta/line/divider/thin_01`
- `submeta/line/divider/double_ritual_01`
- `submeta/line/divider/tick_scale_01`
- `submeta/line/divider/broken_trigram_inspired_01`
- `submeta/line/connector/orbit_arc_01`
- `submeta/line/connector/armillary_curve_01`
- `submeta/line/connector/subtle_pulse_path_01`
- `submeta/line/connector/locked_relation_01`

Ornaments:

- `submeta/ornament/corner/rosette_8_01`
- `submeta/ornament/corner/rosette_10_01`
- `submeta/ornament/corner/armillary_01`
- `submeta/ornament/corner/astrolabe_tick_01`
- `submeta/ornament/rosette/subtle_8_01`
- `submeta/ornament/rosette/subtle_12_01`
- `submeta/ornament/orbit/astrolabe_ring_01`
- `submeta/ornament/orbit/armillary_ring_01`
- `submeta/ornament/border/girih_minimal_01`
- `submeta/ornament/border/tick_scale_01`

Glyphs:

- `submeta/glyph/axis/forma_01`
- `submeta/glyph/axis/intencja_01`
- `submeta/glyph/axis/czas_01`
- `submeta/glyph/axis/cisza_01`
- `submeta/glyph/prg/wielkosc_01`
- `submeta/glyph/prg/klej_odpychanie_01`
- `submeta/glyph/prg/predkosc_01`
- `submeta/glyph/prg/obiekty_01`

Slots / Placeholders:

- `submeta/slot/empty_01`
- `submeta/slot/available_01`
- `submeta/slot/selected_01`
- `submeta/slot/locked_01`
- `submeta/slot/resonance_socket_01`
- `submeta/slot/resonance_socket_02`
- `submeta/slot/aux_socket_01`
- `submeta/slot/aux_socket_02`
- `submeta/placeholder/panel_raster_mask_01`
- `submeta/placeholder/panel_raster_mask_02`
- `submeta/placeholder/card_raster_mask_01`
- `submeta/placeholder/card_raster_mask_02`

HUD Basics:

- `hud/frame/rp_counter_01`
- `hud/frame/rp_counter_02`
- `hud/frame/color_counter_01`
- `hud/frame/color_counter_02`
- `hud/meter/sequence_01`
- `hud/meter/sequence_02`
- `hud/button/submeta_01`
- `hud/button/back_01`

Mini Composition:

- `demo/submeta_hud_component_composition_01`

### 11.3. Decyzje projektowe

- Astrolabium potraktowano jako język ramek, ticków, okręgów, osi i punktów aktywacji.
- Sferę armilarną potraktowano jako logikę przecinających się pierścieni i relacji, nie jako dekoracyjny model 3D.
- Geometrię sakralną / islamską potraktowano jako cienką konstrukcję narożników, rozet i pasów granicznych.
- Bagua, trygramy, 28 mansions i kosmografia zachodnia zostały użyte wyłącznie jako inspiracje strukturalne.
- Nie skopiowano dosłownych symboli religijnych, zodiakalnych ani historycznych.
- Komponenty są vector/component-only: proste stroke/fill, bez bitmap, bez raster backgrounds i bez font files w repo.
- Wszystkie komponenty eksportowe ustawiono z `clipsContent = true`, aby bounds SVG odpowiadały wymiarom komponentu.

### 11.4. Export attempt

Wykonano próbę eksportu SVG z Figmy:

- eksport pojedynczego komponentu (`submeta/glyph/axis/forma_01`) przez `exportAsync({ format: 'SVG' })` zakończył się sukcesem,
- pełna paczka eksportowa dla 59 priorytetowych komponentów została przygotowana w Figmie,
- pełny payload został jednak ucięty przez limit wyniku narzędzia Codex/Figma, zanim dało się go bezpiecznie zapisać do lokalnego repo.

Zgodnie z zasadą zadania nie utworzono ręcznych zamienników SVG poza Figmą.

### 11.5. Eksport do repo

SVG nie zostały zapisane do repo w tym przebiegu.

Brak lokalnych plików:

- `assets/visual/submeta/svg/frames/*.svg`
- `assets/visual/submeta/svg/lines/*.svg`
- `assets/visual/submeta/svg/ornaments/*.svg`
- `assets/visual/submeta/svg/glyphs/*.svg`
- `assets/visual/submeta/svg/slots/*.svg`
- `assets/visual/submeta/svg/placeholders/*.svg`
- `assets/visual/hud/svg/frames/*.svg`
- `assets/visual/hud/svg/meters/*.svg`

Nie utworzono `assets/visual/SVG_ASSET_MANIFEST.md`, ponieważ manifest ma powstać dopiero po skutecznym zapisie SVG do repo.

### 11.6. Ryzyka / ograniczenia

- Komponenty są pierwszym passem i wymagają review projektanta.
- Komponenty nie są finalnym kanonem wizualnym.
- Lokalny eksport SVG wymaga osobnego, mniejszego lub bezpośredniego przepływu exportu z Figmy.
- Po skutecznym eksporcie SVG będzie potrzebne czyszczenie/optymalizacja plików.
- Potrzebny będzie drugi pass stylistyczny po wyborze najlepszej rodziny ramek i ornamentów.

### 11.7. Następny krok

Następny krok to osobny `Figma SVG export`:

1. wyeksportować komponenty z istniejącego pliku Figma,
2. zapisać tylko SVG do `assets/visual/...`,
3. utworzyć `assets/visual/SVG_ASSET_MANIFEST.md`,
4. przeprowadzić review projektanta,
5. dopiero po review wybierać rodzinę do integracji z HUD/SUB-META runtime.

## 12. Style correction pass 01

> Data: 2026-04-26
> File key: `Mx7U5CRQjz2T1zrLPgJDSm`
> URL: https://www.figma.com/design/Mx7U5CRQjz2T1zrLPgJDSm

Wykonano stylistyczny pass korekcyjny SUB-META / HUD na bazie dostarczonej referencji graficznej SUB-META oraz aktualnych dokumentów visual. Celem nie była pełna przebudowa biblioteki 60 komponentów, tylko mały proof of direction dla nowego języka formy.

### 12.1. Dlaczego wykonano pass korekcyjny

Poprzedni pass został potraktowany jako roboczy / niekanoniczny stylistycznie. Struktura rodzin komponentów pozostała użyteczna, ale język wizualny był zbyt techniczny i za słabo zintegrowany z referencją SUB-META.

Najważniejsze problemy poprzedniego passu:

- zbyt płaski i schematyczny charakter ramek,
- zbyt cienko-konstrukcyjna geometria bez ornamentalnego oddechu,
- HUD czytany bardziej jako neutralny panel UI niż element świata,
- sloty i placeholdery zbyt bliskie zwykłym polom technicznym,
- glify za słabo powiązane z ramami i gniazdami,
- separatory oraz łączniki bez dostatecznie rozpoznawalnego charakteru.

### 12.2. Wykorzystane referencje

Primary style reference:

- dostarczony obraz referencyjny SUB-META / HUD: `ChatGPT Image 24 kwi 2026, 18_42_09.png`.

Reference została potraktowana jako wzorzec atmosfery, rytmu linii, relacji rama / ornament / negatyw / światło oraz integracji prostokąta z okręgiem. Nie kopiowano jej 1:1.

Dokumenty kierunkowe użyte przy pass:

- `FIGMA_WORKFLOW.md`,
- `SUB_META_LINE_ORNAMENT_LIBRARY.md`,
- `SUB_META_FIGMA_PROMPT_TEMPLATE.md`,
- `SUB_META_ASSET_PIPELINE.md`,
- `SUB_META_COMPONENTS.md`,
- `SUB_META_LAYOUT_SPEC.md`,
- `SUB_META_TYPOGRAPHY.md`,
- `SUB_META_RESPONSIVE_SCALING.md`,
- `ART_DIRECTION.md`,
- `KOSMOLOGIA_WIZUALNA.md`,
- `BIBLIOTEKA_MATERIALOW.md`.

### 12.3. Struktura Figmy po pass

Stary pass został zachowany jako materiał porównawczy:

- strona: `EXPLORATION_V0`,
- sekcje archiwalne:
  - `EXPLORATION_V0 / README / Art Board`,
  - `EXPLORATION_V0 / SUB-META Frames`,
  - `EXPLORATION_V0 / Lines / Connectors`,
  - `EXPLORATION_V0 / Ornaments`,
  - `EXPLORATION_V0 / Glyphs`,
  - `EXPLORATION_V0 / Slots / Placeholders`,
  - `EXPLORATION_V0 / HUD Basics`,
  - `EXPLORATION_V0 / Mini Composition`.

Nowy pass znajduje się na stronie:

- `STYLE_CORRECTION_PASS_01`.

Sekcje nowego passu:

- `STYLE_CORRECTION_PASS_01 / README + diagnosis`,
- `STYLE_CORRECTION_PASS_01 / 01 Frame Family`,
- `STYLE_CORRECTION_PASS_01 / 02 Slots + Ornaments`,
- `STYLE_CORRECTION_PASS_01 / 04 Lines + 05 HUD + 06 Glyphs`,
- `STYLE_CORRECTION_PASS_01 / 07 Mini Style Board`.

### 12.4. Utworzone rodziny komponentów

Łącznie utworzono `30` komponentów.

Frame Family:

- `submeta/style_correction/frame/panel/ritual_gate_01`,
- `submeta/style_correction/frame/panel/armillary_shrine_02`,
- `submeta/style_correction/frame/panel/cosmogram_table_03`,
- `submeta/style_correction/frame/card/r1_ritual_red_01`,
- `submeta/style_correction/frame/card/r1_orbit_blue_02`,
- `submeta/style_correction/frame/card/ds_ether_plus_01`,
- `submeta/style_correction/frame/card/ds_crystal_gate_02`.

Slot Family:

- `submeta/style_correction/slot/empty_orbit_01`,
- `submeta/style_correction/slot/empty_recess_02`,
- `submeta/style_correction/slot/resonance_socket_01`,
- `submeta/style_correction/slot/aux_socket_01`.

Ornament Family:

- `submeta/style_correction/ornament/corner/threshold_01`,
- `submeta/style_correction/ornament/corner/armillary_knot_02`,
- `submeta/style_correction/ornament/rosette/axis_bloom_01`,
- `submeta/style_correction/ornament/orbit/sacred_ring_01`,
- `submeta/style_correction/ornament/border/girih_breath_01`.

Line Family:

- `submeta/style_correction/line/separator/altar_scale_01`,
- `submeta/style_correction/line/separator/celestial_bridge_02`,
- `submeta/style_correction/line/connector/orbit_thread_01`,
- `submeta/style_correction/line/connector/resonance_arc_02`.

HUD Family:

- `hud/style_correction/frame/rp_counter_ritual_01`,
- `hud/style_correction/frame/rp_counter_orbit_02`,
- `hud/style_correction/frame/color_counter_axis_01`,
- `hud/style_correction/button/back_ritual_01`,
- `hud/style_correction/button/submeta_gate_01`.

Glyph Family:

- `submeta/style_correction/glyph/axis/forma_01`,
- `submeta/style_correction/glyph/axis/intencja_01`,
- `submeta/style_correction/glyph/axis/czas_01`,
- `submeta/style_correction/glyph/axis/cisza_01`.

Mini Style Board:

- `demo/style_correction/submeta_hud_style_board_01`.

### 12.5. Różnice względem poprzedniego passu

Nowy pass:

- wzmacnia warstwowość ramek przez podwójne i potrójne kontury,
- integruje narożniki z rytmem panelu zamiast doklejać je jako osobny detal,
- częściej łączy prostokąt z kręgiem, łukiem, tickami i punktem aktywacji,
- traktuje HUD jako mały instrument świata, nie neutralną belkę,
- dodaje cięższe akcenty w narożnikach i centrach bez przeładowania całej powierzchni,
- buduje glify jako część geometrii osi, a nie jako niezależne ikonki,
- zostawia więcej kontrolowanego negatywu, żeby ornament nie konkurował z funkcją.

### 12.6. Czego nie zrobiono

Nie wykonano:

- pełnej biblioteki 60 komponentów w nowym stylu,
- pełnego ekranu SUB-META,
- polished mockupu,
- eksportu SVG do repo,
- finalnych PNG/WebP,
- fontów,
- runtime zmian,
- Code Connect,
- Implement Design,
- nowych mechanik.

### 12.7. Co wymaga decyzji projektanta

Do review projektanta pozostaje:

- wybór jednej z trzech rodzin ram panelu jako kierunku głównego,
- decyzja, czy R1 ma iść bardziej w kierunku `ritual_red_01`, czy `orbit_blue_02`,
- decyzja, jak jasna i eteryczna ma być rodzina DS,
- wybór poziomu gęstości narożników i border fragmentów,
- potwierdzenie, czy HUD ma pozostać bardziej ceremonialny, czy wrócić bliżej minimalnego world-HUD,
- decyzja, czy glify osi są wystarczająco odróżnialne w małej skali.

### 12.8. Checklist

- Brak zmian runtime: TAK.
- Brak eksportu finalnych PNG/WebP do repo: TAK.
- Brak fontów dodanych do repo: TAK.
- Brak użycia Implement Design: TAK.
- Brak użycia Code Connect: TAK.
- Evidence zaktualizowane: TAK.

### 12.9. Następny krok

Następny krok to review projektanta na stronie `STYLE_CORRECTION_PASS_01`, wybór jednej rodziny stylistycznej i dopiero potem rozwinięcie pełnej biblioteki SUB-META / HUD w wybranym kierunku.


## 12. Repo SVG copy + runtime visual integration pass

> Data: 2026-04-26
> Tryb: repo-only (bez użycia Figmy/MCP)

- W tym passie **nie używano Figmy**, Implement Design ani Code Connect.
- Wykonano audyt repo pod kątem katalogu Figma/SVG: nie znaleziono lokalnego katalogu z gotowymi eksportami `.svg`.
- W oparciu o listę komponentów z sekcji 11 utworzono reprezentatywny zestaw runtime-safe SVG (czyste SVG z `viewBox`, bez bitmap/base64 i bez osadzonych fontów).
- Assety zapisano w `assets/visual/submeta/svg/*` i `assets/visual/hud/svg/frames/*` oraz dodano manifest `assets/visual/submeta/submeta_svg_manifest.json`.
- Runtime integration pass podpiął część SVG do SUB-META/HUD z fallbackiem do dotychczasowego renderingu canvas/DOM.

### 12.1. Zakres przeniesionych / dodanych SVG (testowy zestaw)

- SUB-META: panel frame, frame R1, frame DS, slot empty, slot resonance, ornament corner, separator line, 4 glify osi.
- HUD: frame RP counter, frame przycisku SUB-META, frame przycisku Back, frame color counter (biblioteka).

### 12.2. Runtime integration

- `cards.js`:
  - dodano lekki loader manifestu SVG,
  - dodano render `drawImage` dla panelu SUB-META, ornamentu/separatora, slotów empty/resonance, glifów osi oraz ramek kart R1/DS,
  - zachowano poprzednie rysowanie canvas jako fallback, gdy SVG nie jest dostępne.
- `hc.ui_debug.js`:
  - dodano podpięcie ramek SVG do elementów DOM HUD (`RP`, `META`, `Restart/Back`) jako warstwa wizualna bez zmiany mechaniki.

### 12.3. Ograniczenia

- To jest proof-of-direction, nie finalny polish.
- Brakuje pełnej biblioteki SVG z eksportu Figma pass 01/Style Correction pass.
- Wymagany jest review projektanta dla proporcji, rytmu linii, kontrastu i spójności wariantów.
