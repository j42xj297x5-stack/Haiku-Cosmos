# Haiku Cosmos — SUB-META + HUD Figma Asset Pass 01

> Status: EVIDENCE / FIGMA PASS / STYLE CORRECTION LEGACY AFTER RUNTIME REVIEW
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


## 13. Real Figma SVG local migration pass

> Data: 2026-04-26
> Tryb: repo-only (bez Figma MCP), integracja realnych lokalnych eksportów SVG

### 13.1. Źródło lokalne

Źródłem był lokalny katalog `Figma/` zawierający eksporty `style_correction` oraz board demonstracyjny.

- Liczba SVG wykryta w `Figma/`: **30**.
- Walidacja techniczna SVG: wszystkie pliki posiadają `viewBox`; nie wykryto `base64`, `<image>`, `data:image`, `@font-face`, embed fontów.

### 13.2. Migracja do `assets/visual`

Skopiowano **20** realnych SVG do runtime assetów:

- `assets/visual/submeta/svg/frames/` — 7 plików (panel + card frames),
- `assets/visual/submeta/svg/glyphs/` — 4 pliki (glify osi),
- `assets/visual/submeta/svg/lines/` — 3 pliki (connectors + separator),
- `assets/visual/hud/svg/frames/` — 5 plików (frame/button HUD),
- `assets/visual/submeta/svg/placeholders/` — 1 plik (`submeta_hud_style_board_01.svg`) jako evidence/reference, bez podpinania jako runtime frame.

### 13.3. Manifest i priorytet realnych assetów

Dodano `assets/visual/submeta/submeta_svg_manifest.json` (płaski JSON `logicalName -> path`) z wpisami dla SUB-META i HUD.

Realne assety `style_correction` mają pierwszeństwo w runtime. Jeśli dany SVG nie załaduje się lub manifest jest niedostępny, pozostaje dotychczasowy rendering/fallback bez crasha.

### 13.4. Runtime integration (reprezentatywnie)

Podłączone realne SVG:

- SUB-META:
  - panel frame: `submeta.frame.panel.ritual_gate_01`,
  - separator: `submeta.line.separator.altar_scale_01`,
  - glify osi: `submeta.glyph.forma_01`, `submeta.glyph.intencja_01`, `submeta.glyph.czas_01`, `submeta.glyph.cisza_01`,
  - card frames: `submeta.frame.card.r1_ritual_red_01` i `submeta.frame.card.ds_ether_plus_01` (socket frame overlay).
- HUD:
  - frame licznika kolorów: `hud.frame.color_counter_axis_01`,
  - frame RP: `hud.frame.rp_counter_ritual_01`,
  - przyciski: `hud.button.submeta_gate_01`, `hud.button.back_ritual_01`.

### 13.5. Fallback / pozostałe braki

- Brak manifestu lub brak pojedynczego SVG nie wyłącza HUD/SUB-META — działa poprzedni rendering canvas/DOM.
- `submeta_hud_style_board_01.svg` pozostaje materiałem referencyjnym i nie jest używany jako runtime board.
- Część slotów/ornamentów z paczki 30 SVG nie była celem tego passu runtime i pozostaje do osobnego etapu polish/live-coloring/animation.

### 13.6. Review projektanta

Do review projektanta pozostaje:

- tuning czytelności ramek w małej skali,
- decyzja między wariantami rodzin (`r1_ritual_red_01` vs `r1_orbit_blue_02`, `ds_ether_plus_01` vs `ds_crystal_gate_02`),
- decyzja o stopniu live-coloring i animacji (osobny pass po akceptacji runtime integration).

## 14. Post-runtime review: legacy current SVG pass and restart with modular frame kit

> Data: 2026-04-27
> Tryb: repo-only, bez Figma MCP, bez generowania nowych grafik

Po integracji runtime obecny pass SVG został oceniony ponownie z perspektywy kompozycji, skalowania i przygotowania pod przyszły FrameComposer.

Wnioski:

- obecne SVG działały technicznie jako ładowane assety;
- fallback runtime pozostawał defensywny;
- wizualnie pass nie spełnił wymagań produkcyjnych;
- pełne ramki jako overlay źle skalowały się względem layoutu i potrafiły przecinać układ;
- audyt wykazał monolityczność, duplikaty Figma/assets, baked filters/glow/shadow, brak `non-scaling-stroke`, niespójne grupy i stałe kolory.

Decyzja:

- obecny pass przeniesiono do `assets/visual/legacy/style_correction_2026_04/`;
- `figma_export/` zachowuje lokalny eksport Figma jako evidence;
- `runtime_test_assets/` zachowuje kopie, które były testowo podpięte w runtime;
- aktywny manifest SVG został wyczyszczony;
- nowe ramki mają powstać od zera w Figmie jako modular frame kit.

Nowy pass ma projektować części, nie pełne overlaye:

- corners;
- edges;
- center ornaments;
- slot frames;
- resonance nodes;
- bridge/connection lines;
- sequence markers;
- card state accents.

Runtime cleanup i pełna integracja FrameComposer są osobnymi etapami. Ten review nie zmienia mechaniki kart, sekwencji, kosztów RP ani PRG behavior.

## 15. Modular Frame Kit Figma pass v0.1

> Data: 2026-04-27
> Tryb: Figma design/library pass
> File key: `1KsSouDlvB24HznqRPXUf5`
> URL: https://www.figma.com/design/1KsSouDlvB24HznqRPXUf5

Utworzono nowy plik Figma:

- `Haiku Cosmos — Modular Frame Kit v0.1`

To jest nowy, czysty pass modularnych komponentów SVG-ready. Nie bazuje na `STYLE_CORRECTION_PASS_01` ani na lokalnych SVG przeniesionych do legacy/evidence.

### 15.1. Strony utworzone w Figmie

- `README / Rules`
- `SUB-META Astrolabe Kit`
- `HUD Minimal Sequence Kit`
- `Card State Accents`
- `Runtime Tinting Notes`
- `Mini Assembly Board`

### 15.2. Utworzone komponenty

Łącznie utworzono `35` komponentów.

SUB-META Astrolabe Kit:

- `submeta/frame_parts/corner_tl_astrolabe_01`
- `submeta/frame_parts/corner_tr_astrolabe_01`
- `submeta/frame_parts/corner_bl_astrolabe_01`
- `submeta/frame_parts/corner_br_astrolabe_01`
- `submeta/frame_parts/edge_top_thin_astrolabe_01`
- `submeta/frame_parts/edge_bottom_thin_astrolabe_01`
- `submeta/frame_parts/edge_left_thin_astrolabe_01`
- `submeta/frame_parts/edge_right_thin_astrolabe_01`
- `submeta/frame_parts/ornament_top_center_astrolabe_01`
- `submeta/frame_parts/ornament_bottom_center_astrolabe_01`
- `submeta/frame_parts/separator_altar_scale_01`
- `submeta/slot_frame/r1_socket_01`
- `submeta/resonance_node/r2_socket_01`
- `submeta/bridge_line/resonance_bridge_01`

HUD Minimal Sequence Kit:

- `hud/frame_parts/corner_tl_minimal_01`
- `hud/frame_parts/corner_tr_minimal_01`
- `hud/frame_parts/corner_bl_minimal_01`
- `hud/frame_parts/corner_br_minimal_01`
- `hud/frame_parts/edge_top_minimal_01`
- `hud/frame_parts/edge_bottom_minimal_01`
- `hud/frame_parts/edge_left_minimal_01`
- `hud/frame_parts/edge_right_minimal_01`
- `hud/sequence_marker/r1_01`
- `hud/sequence_marker/r2_01`
- `hud/sequence_marker/aa_01`
- `hud/sequence_marker/aaa_01`
- `hud/rp_mini_frame_01`
- `hud/button_submeta_frame_01`
- `hud/button_back_frame_01`

Card State Accents:

- `card_state/r1_slot_active_accent_01`
- `card_state/ds_slot_active_accent_01`
- `card_state/new_card_pulse_layer_01`
- `card_state/seen_card_stable_layer_01`
- `card_state/locked_slot_accent_01`
- `card_state/selected_slot_accent_01`

### 15.3. Runtime tinting / animation readiness

Przyjęto podział warstw w komponentach:

- `frame-base` — stabilna geometria bazowa;
- `frame-secondary` — drugi plan, niski kontrast, opcjonalny delikatny tint;
- `ticks` — podziałka, indeksy, kalibracja;
- `ornament` — astrolabiczne i rytualne detale;
- `accent` — warstwa runtime tinting;
- `state-layer` — przyszły target dla pulse, draw-in, shimmer i stanów aktywnych.

Plansza `Runtime Tinting Notes` opisuje kontrakt:

- `frame-base: static`
- `frame-secondary: static/tintable low`
- `accent: tintable`
- `state-layer: tintable + animatable`
- `glow-guide: runtime effect only`

Nie dodano animacji runtime. To wyłącznie gotowość projektowa pod przyszły pass.

### 15.4. Mini Assembly Board

Na stronie `Mini Assembly Board` złożono demonstracyjnie jedną ramkę SUB-META z instancji komponentów:

- 4 narożniki;
- 4 krawędzie;
- ornament górny i dolny;
- separator;
- slot frame;
- resonance node;
- bridge line.

To jest proof of assembly, nie pełny mockup SUB-META i nie implementacja FrameComposera.

### 15.5. Walidacja Figma

Walidacja struktury zwróciła:

- liczba komponentów: `35`;
- image paints: `0`;
- baked effects: `0`;
- największy komponent: `submeta/frame_parts/ornament_top_center_astrolabe_01` (`220 x 64`);
- brak monolitycznego full overlay component.

### 15.6. Czego nie zrobiono

Nie wykonano:

- eksportu SVG do repo;
- PNG/WebP/JPG;
- dodawania fontów;
- runtime integration;
- FrameComposera;
- Implement Design;
- Code Connect;
- zmian mechaniki, kosztów RP, sekwencji albo PRG behavior.

### 15.7. Co wymaga review projektanta

Do review projektanta pozostaje:

- czy poziom ornamentu narożników SUB-META jest wystarczająco bogaty bez wejścia w fantasy border;
- czy krawędzie są wystarczająco neutralne i rozciągalne;
- czy HUD sequence markers są czytelne w małej skali;
- czy DS/perła/eter ma właściwy poziom jasności;
- czy `new_card_pulse_layer_01` jest wystarczająco subtelny;
- czy Mini Assembly Board dobrze pokazuje kierunek przyszłego FrameComposera.

## 16. Modular Frame Kit v0.1 - SVG export completed

> Data: 2026-04-27
> Tryb: repo export sync, bez runtime integration
> File key: `1KsSouDlvB24HznqRPXUf5`

SVG z pliku `Haiku Cosmos - Modular Frame Kit v0.1` zostaly wyeksportowane do repo w trzech batchach:

- Batch 01 / SUB-META: `14` SVG w `assets/visual/submeta/svg/frame_parts/`;
- Batch 02 / HUD: `15` SVG w `assets/visual/hud/svg/frame_parts/`;
- Batch 03 / Card State Accents: `6` SVG w `assets/visual/cards/svg/state_accents/`.

Razem: `35` SVG.

Manifest zbiorczy:

- `assets/visual/modular_frame_kit_v01_manifest.json`

Walidacja lokalna: PASS.

- `viewBox`: PASS;
- embedded raster/base64/image: PASS;
- embedded fonts/font-family: PASS;
- baked filters / `fe*`: PASS.

Nie wykonano:

- runtime integration;
- FrameComposera;
- globalnego manifestu runtime;
- Code Connect;
- Implement Design;
- PNG/WebP/JPG/fontow.

Nastepny krok: review assetow oraz osobny FrameComposer spec / integration pass.

## 17. Modular Frame Kit v0.1 - static preview board

> Data: 2026-04-28
> Tryb: repo-only visual preview, bez runtime integration

Dodano statyczny preview board:

- `assets/visual/preview/modular_frame_kit_v01_preview.html`
- `assets/visual/preview/modular_frame_kit_v01_preview.css`
- `assets/visual/preview/modular_frame_kit_v01_preview.js`

Preview laduje `assets/visual/modular_frame_kit_v01_manifest.json` i pokazuje:

- SUB-META modular frame assembly;
- HUD minimal kit preview;
- Card State Accents preview;
- CSS-only tinting simulation.

Preview nie wykonuje:

- runtime integration;
- FrameComposera;
- zmian mechaniki;
- edycji SVG;
- eksportu nowych grafik.

Tinting jest tylko symulacja CSS przez filtry i overlay. Poniewaz SVG sa ladowane jako zewnetrzne obrazy, glebokie kolorowanie warstw wymaga osobnego przygotowania SVG albo przyszlego inline/runtime SVG pass.

## 18. Preview tuning: center ornament scale

> Data: 2026-04-28
> Tryb: repo-only preview tuning, bez Figma MCP

Manual review wykazal, ze SUB-META top/bottom center ornaments w preview board byly zbyt dominujace wzgledem cienkiej ramy.

Zmieniono tylko osadzenie w preview board:

- `--submeta-top-ornament-scale: 0.78`;
- `--submeta-bottom-ornament-scale: 0.84`.

Nie edytowano SVG source, manifestu ani runtime. Figma MCP nie byla uzyta.

Docelowo FrameComposer powinien traktowac `ornamentScale` i `anchorOffset` jako parametry layoutowe, a nie jako zmiane assetu.
