# Haiku Cosmos - SUB-META Figma Derived Frame Kit v0.2

> Status: EVIDENCE / FIGMA CLEANUP + DERIVED KIT PASS
> Obszar: Figma / SUB-META v2 / modular frame kit / source cleanup
> Zrodlo prawdy: TAK, dla evidence tego passu Figma. NIE, dla runtime, mechaniki i finalnego eksportu SVG.
> Data: 2026-04-29
> Powiazane dokumenty: FIGMA_WORKFLOW.md, MODULAR_FRAME_KIT.md, SVG_ASSET_STANDARDS.md, ../ui/SUB_META_V2_MASTER_SPEC.md (dawny layout/wireframe spec przeniesiony do docs/legacy/ui/), ../technical/CENTER_BASED_POSITIONING_SPEC.md, ../technical/FRAME_COMPOSER_SPEC.md

## 1. Cel passu

Ten pass wykonal cleanup dwoch istniejacych baz wektorowych i przygotowal nowy, uporzadkowany zestaw komponentow ramek, ornamentow, gniazd i lacznikow dla przyszlego SUB-META v2.

Zakres:

- Figma cleanup + derived kit pass;
- source vectors traktowane jako reference material, nie finalne assety;
- rebuild jako modular parts, nie monolityczne overlaye;
- zgodnosc z center-based positioning, named anchors, rect separation i przyszlym FrameComposer/SVG workflow;
- repo sync tylko dokumentacyjny.

Poza zakresem:

- runtime integration;
- zmiany mechaniki;
- Implement Design;
- Code Connect;
- eksport SVG do repo;
- finalne raster assets.

## 2. Figma source

- Plik: `ramka-v1`
- File key: `HSAtk0l6Udl5XZp28Ijesl`
- URL: https://www.figma.com/design/HSAtk0l6Udl5XZp28Ijesl/ramka-v1?node-id=3-19&t=2BKRKd76WaKHgSSE-0
- Figma MCP: TAK
- Narzedzia Figma: `search_design_system`, `use_figma`
- Implement Design: NIE
- Code Connect: NIE

## 3. Zrodla oczyszczone

### BIG FRAME LANGUAGE

- Source page: `Page 1`
- Source node: `2:10`, `image 1 (Traced)`
- Charakter: duzy traced vector, jedna sciezka `EVENODD`, ok. `389728` znakow path data.
- Uzycie: wieksze ramy, glowne naroza, ornamenty centralne, card detail, resonance core.

Cleanup:

- usunieto zaleznosc od gesto-traced krzywej jako finalnego materialu;
- przerysowano gramatyke na cienkie linie, luki, osie i powtarzalne punkty;
- znormalizowano stroke weight i marginesy;
- rozbito jezyk na naroza, krawedzie, ornamenty, dividers i wieksze panel frames.

### SMALL PANEL LANGUAGE

- Source page: `Page 2`
- Source node: `3:19`, `image 1 (Traced)`
- Charakter: mniejszy traced vector, jedna sciezka `EVENODD`, ok. `125221` znakow path data.
- Uzycie: male panele, separatory, button/capsule frames, micro sockets, mini markers.

Cleanup:

- zachowano lekki rytm malych paneli;
- odrzucono incidental raster-trace jaggies;
- przerysowano elementy jako male slot frames, separators, capsules i axis markers;
- uproszczono geometrię pod czytelnosc w malej skali.

## 4. Struktura stron w Figmie

Utworzono `9` nowych stron:

1. `README / Rules`
2. `SOURCE CLEANED - BIG`
3. `SOURCE CLEANED - SMALL`
4. `DERIVED KIT - MAIN FRAME`
5. `DERIVED KIT - SMALL PANELS`
6. `DERIVED KIT - SLOT NODE CONNECTOR`
7. `DERIVED KIT - CARD FORGE DETAIL SUPPORT`
8. `OPTIONAL COMPOSITION TESTS`
9. `EXPORT / INVENTORY NOTES`

Nazwy stron w pliku Figma uzywaja dlugiej pauzy zgodnie z briefem.

## 5. Wynik component pass

Walidacja Figma MCP:

- page count: `9`;
- component count: `70`;
- metadata namespace: `haiku.framekit.v02`;
- image paints w komponentach: `0`;
- effects w komponentach: `0`;
- text nodes wewnatrz komponentow: `0`;
- component fills na root component: `0`;
- missing metadata: `0`.

Rozklad rodzin:

- `main`: `20`;
- `small`: `27`;
- `slot`: `6`;
- `node`: `5`;
- `connector`: `6`;
- `card`: `3`;
- `forge`: `1`;
- `detail`: `2`.

## 6. Zasady wykonawcze v0.2

Kazdy komponent zostal opisany przez `sharedPluginData`:

- `mountCenter`;
- `mountSize`;
- `visualSize`;
- `bleed`;
- `pivot: center`;
- `anchorType`;
- `stateType`;
- `rectContract`: `layoutRect`, `interactiveRect`, `visualMountRect`, `visualBleedRect`, `contentSafeRect`;
- `exportReady`;
- `needsCleanup`.

Komponenty sa neutralnymi, czarnymi, stroke-only Figma components. Nie sa finalnym SVG runtime.

## 7. Inventory / export plan

| Component | Family | Intended use | Anchor type | Layer | SVG ready | Cleanup |
|---|---|---|---|---|---|---|
| `frame/main/corner/tl/v1` | main | main SUB-META/card detail/panel corner | corner anchor | static_base | yes | no |
| `frame/main/corner/tr/v1` | main | main SUB-META/card detail/panel corner | corner anchor | static_base | yes | no |
| `frame/main/corner/bl/v1` | main | main SUB-META/card detail/panel corner | corner anchor | static_base | yes | no |
| `frame/main/corner/br/v1` | main | main SUB-META/card detail/panel corner | corner anchor | static_base | yes | no |
| `frame/main/edge/top/v1` | main | stretchable main frame edge | line anchor | static_base | yes | no |
| `frame/main/edge/bottom/v1` | main | stretchable main frame edge | line anchor | static_base | yes | no |
| `frame/main/edge/left/v1` | main | stretchable main frame edge | line anchor | static_base | yes | no |
| `frame/main/edge/right/v1` | main | stretchable main frame edge | line anchor | static_base | yes | no |
| `frame/main/ornament/top-center/v1` | main | top-center ceremonial ornament | center anchor | static_base | yes | no |
| `frame/main/ornament/top-center/v2` | main | top-center ceremonial ornament | center anchor | static_base | yes | no |
| `frame/main/ornament/top-center/v3` | main | top-center ceremonial ornament | center anchor | tintable_accent | yes | no |
| `frame/main/ornament/bottom-center/v1` | main | bottom-center ceremonial ornament | center anchor | static_base | yes | no |
| `frame/main/ornament/bottom-center/v2` | main | bottom-center ceremonial ornament | center anchor | static_base | yes | no |
| `frame/main/ornament/bottom-center/v3` | main | bottom-center ceremonial ornament | center anchor | tintable_accent | yes | no |
| `frame/main/ornament/side-axis/v1` | main | side axis ornament / wing marker | line anchor | static_base | yes | no |
| `frame/main/ornament/side-axis/v2` | main | side axis ornament / wing marker | line anchor | tintable_accent | yes | no |
| `frame/main/divider/h/v1` | main | main horizontal divider | line anchor | static_base | yes | no |
| `frame/main/divider/h/v2` | main | main horizontal divider | line anchor | static_base | yes | no |
| `frame/main/panel/v1` | main | large panel/card detail/inventory surface frame | rect anchor | static_base | yes | no |
| `frame/main/panel/v2` | main | large panel/card detail/inventory surface frame | rect anchor | static_base | review | no |
| `frame/small/corner/tl/v1` | small | small panel corner | corner anchor | static_base | yes | no |
| `frame/small/corner/tr/v1` | small | small panel corner | corner anchor | static_base | yes | no |
| `frame/small/corner/bl/v1` | small | small panel corner | corner anchor | static_base | yes | no |
| `frame/small/corner/br/v1` | small | small panel corner | corner anchor | static_base | yes | no |
| `frame/small/panel/v1` | small | small panel / label / compact support frame | rect anchor | static_base | yes | no |
| `frame/small/panel/v2` | small | small panel / label / compact support frame | rect anchor | static_base | yes | no |
| `frame/small/panel/v3` | small | small panel / label / compact support frame | rect anchor | static_base | yes | no |
| `frame/small/panel/v4` | small | small panel / label / compact support frame | rect anchor | static_base | review | yes |
| `frame/small/capsule/v1` | small | button / capsule frame | rect anchor | static_base | yes | no |
| `frame/small/capsule/v2` | small | button / capsule frame | rect anchor | static_base | yes | no |
| `frame/small/capsule/v3` | small | button / capsule frame | rect anchor | tintable_accent | yes | no |
| `frame/small/separator/h/v1` | small | small horizontal separator | line anchor | static_base | yes | no |
| `frame/small/separator/h/v2` | small | small horizontal separator | line anchor | static_base | yes | no |
| `frame/small/separator/h/v3` | small | small horizontal separator | line anchor | static_base | yes | no |
| `frame/small/separator/h/v4` | small | small horizontal separator | line anchor | tintable_accent | yes | no |
| `frame/small/separator/v/v1` | small | small vertical separator | line anchor | static_base | yes | no |
| `frame/small/separator/v/v2` | small | small vertical separator | line anchor | static_base | yes | no |
| `frame/small/separator/v/v3` | small | small vertical separator | line anchor | tintable_accent | yes | no |
| `frame/small/ornament/center/v1` | small | small center ornament | center anchor | static_base | yes | no |
| `frame/small/ornament/center/v2` | small | small center ornament | center anchor | static_base | yes | no |
| `frame/small/ornament/center/v3` | small | small center ornament | center anchor | tintable_accent | yes | no |
| `frame/small/axis-marker/v1` | small | axis marker / cap / compact status sign | center anchor | tintable_accent | yes | no |
| `frame/small/axis-marker/v2` | small | axis marker / cap / compact status sign | center anchor | tintable_accent | yes | no |
| `frame/small/axis-marker/v3` | small | axis marker / cap / compact status sign | center anchor | tintable_accent | yes | no |
| `frame/small/slot-frame/v1` | small | light slot-frame / mini socket | socket center | static_base | yes | no |
| `frame/small/slot-frame/v2` | small | light slot-frame / mini socket | socket center | static_base | yes | no |
| `frame/small/slot-frame/v3` | small | light slot-frame / mini socket | socket center | tintable_accent | yes | no |
| `slot/socket/card/v1` | slot | card socket / R1-R2 mount | socket center | static_base | yes | no |
| `slot/socket/mini/v1` | slot | mini card/resource socket | socket center | static_base | yes | no |
| `slot/socket/core/v1` | slot | R4/core socket / resonance center | core center | static_base | yes | no |
| `slot/ornament/micro/v1` | slot | micro ornament for slot face | center anchor | tintable_accent | yes | no |
| `slot/ornament/micro/v2` | slot | micro ornament for slot face | center anchor | tintable_accent | yes | no |
| `slot/ornament/micro/v3` | slot | micro ornament for slot face | center anchor | tintable_accent | yes | no |
| `slot/node/marker/v1` | node | node marker / future unlock marker | center anchor | tintable_accent | yes | no |
| `slot/node/marker/v2` | node | node marker / future unlock marker | center anchor | tintable_accent | yes | no |
| `slot/node/marker/v3` | node | node marker / future unlock marker | center anchor | animatable_state_layer | yes | no |
| `slot/bridge/short/v1` | connector | R2 bridge / connector line | start/end anchor | tintable_accent | yes | no |
| `slot/bridge/arc/v1` | connector | R2 bridge / connector line | start/end anchor | animatable_state_layer | yes | no |
| `slot/bridge/fork/v1` | connector | R2 bridge / connector line | start/end anchor | animatable_state_layer | yes | no |
| `slot/cap/start/v1` | connector | line cap / connector endpoint | start/end anchor | tintable_accent | yes | no |
| `slot/cap/end/v1` | connector | line cap / connector endpoint | start/end anchor | tintable_accent | yes | no |
| `slot/cap/joint/v1` | connector | line cap / connector endpoint | center anchor | tintable_accent | yes | no |
| `slot/node/ring/v1` | node | light node ring / resonance marker | center anchor | tintable_accent | yes | no |
| `slot/node/ring/v2` | node | light node ring / resonance marker | center anchor | animatable_state_layer | yes | no |
| `card/support/slot-frame/v1` | card | vertical card slot frame | card center | static_base | yes | no |
| `card/support/slot-frame/v2` | card | large vertical card support frame | card center | static_base | yes | no |
| `inventory/support/bank-frame/v1` | card | mini-card inventory bank frame | rect anchor | static_base | yes | no |
| `forge/support/chain-frame/v1` | forge | forge refinement row / chain frame | line anchor | static_base | yes | no |
| `card/support/detail-frame/v1` | detail | card detail preview frame | rect anchor | static_base | review | yes |
| `card/support/haiku-separator/v1` | detail | haiku/text separator | line anchor | static_base | yes | no |

## 8. Co nie zostalo zrobione

- Nie eksportowano SVG do repo.
- Nie dodano PNG/WebP/JPG/fontow.
- Nie podlaczono runtime.
- Nie zmieniono mechaniki kart, PRG, kosztow RP ani sekwencji.
- Nie uzyto Implement Design.
- Nie uzyto Code Connect.
- Nie projektowano pelnego ekranu SUB-META.

## 9. Ryzyka i dalszy krok

Ryzyka:

- `card/support/detail-frame/v1`, `frame/small/panel/v4` i `frame/main/panel/v2` wymagaja dodatkowego designerskiego strojenia przed eksportem.
- Stroke z Figma po eksporcie moze wymagac post-processingu pod `vector-effect="non-scaling-stroke"`.
- Czesci `animatable_state_layer` sa tylko hookami projektowymi; nie zawieraja runtime animacji.
- W Figma komponenty sa draft/evidence; eksport produkcyjny wymaga osobnej walidacji SVG.

Nastepny krok:

1. Review projektanta w pliku Figma.
2. Wybor wariantow export-ready.
3. Osobny, maly SVG export pass do repo jako draft albo review-ready.
4. Walidacja SVG wedlug `SVG_ASSET_STANDARDS.md`.
5. Dopiero pozniej decyzja o manifest/runtime FrameComposer integration.
