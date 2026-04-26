# Haiku Cosmos — SUB-META + HUD Figma Asset Pass 01

> Status: EVIDENCE / FIGMA PASS — COMPONENT PASS COMPLETED / SVG EXPORT NOT WRITTEN TO REPO
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
