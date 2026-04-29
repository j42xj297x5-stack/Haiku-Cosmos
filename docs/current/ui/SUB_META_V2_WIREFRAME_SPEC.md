> Status: ROBOCZY / SPEC WIREFRAME
> Obszar: SUB-META v2 / low-fi layout preview
> Źródło prawdy: NIE (roboczy etap przed polished design i runtime)
> Ostatnia aktualizacja: 2026-04-29 (composition v0.4)
> Powiązane dokumenty: UI_WORLD.md, SUB_META_V2_LAYOUT_SPEC.md, ../technical/SUB_META_V2_BOX_AUDIT.md, ../technical/CENTER_BASED_POSITIONING_SPEC.md

# SUB-META v2 — Wireframe spec (desktop/tablet/mobile)

## Cel

Wireframe repo-only weryfikuje układ 9 stref jako cockpit resonance system bez zmiany mechaniki, kosztów RP i runtime behavior. Low-fi v0.1 był diagramem stref, a nie finalnym layoutem produkcyjnym.

## Preview

- Ścieżka: `assets/visual/preview/submeta_v2_wireframe/submeta_v2_wireframe.html`
- URL lokalny: `http://localhost:8123/assets/visual/preview/submeta_v2_wireframe/submeta_v2_wireframe.html`

## Tryby

1. **Desktop / large**
   - pełny widok 9 stref jednocześnie,
   - `middle_center_resonance_core` jako główny punkt ciężkości,
   - R2/R3/R4/DS jako jawne segmenty rdzenia,
   - dolny rząd: inventory / forge / card detail.

2. **Tablet / medium**
   - ten sam model 9 stref,
   - większa kompresja paneli,
   - zachowanie czytelnych hit-area i semantyki stref.

3. **Mobile / small**
   - model logiczny 9 stref,
   - układ pionowy: status+identity+nav → resonance core → selected workspace,
   - workspace przełączane: PRG / WORLD / INVENTORY / FORGE / DETAIL.

## Mapa 9 stref

1. `top_left_status`
2. `top_center_identity`
3. `top_right_navigation`
4. `middle_left_prg`
5. `middle_center_resonance_core`
6. `middle_right_world`
7. `bottom_left_inventory`
8. `bottom_center_forge`
9. `bottom_right_card_detail`

## R2/R3/R4/DS placement

- R2: bridge slot i active binding pomiędzy PRG i WORLD.
- R3: stabilization/reserve jako sekcja rdzenia.
- R4: unity slot jako wyróżniony element rdzenia.
- DS: oddzielny special slot / expansion relation, odróżniony od zwykłych R1.

## Center-based positioning w praktyce

Wireframe pokazuje:
- center point/pivot dla każdej strefy,
- `mountSize` jako visual mount rect,
- optional visual bleed rect (linia przerywana),
- interactive rect oddzielony od layout rect,
- named anchors (top/right/bottom/left) jako future hooks.

## Proporcje robocze

- Desktop/Tablet: content-driven cockpit o nierównych proporcjach paneli; 9 stref pozostaje semantyką ukrytą, a nie wizualną tabelą 3x3.
- Mobile: stałe sekcje krytyczne + 1 aktywny workspace.

## Decyzje projektanta przed kolejnym krokiem

1. PRG i ŚWIAT mają już potwierdzoną podstawową zawartość slotową (4 osie; PRG: 2 sloty/axis, ŚWIAT: 2xR1 + extension/axis; po 3 sloty R2).
2. R3 pozostaje do mechanicznego doprecyzowania, ale layoutowo działa jako stabilizator/rezerwa resonance core.
3. R4 layoutowo jest centralną jednością PRG–ŚWIAT i nie jest traktowana jak zwykły slot boczny.
4. Kuźnia w v0.2 jest mini wejściem do głębszego panelu (nie pełnym dużym panelem).
5. Magazyn i card detail powinny balansować dół kompozycji przy zachowaniu asymetrii funkcjonalnej.

## Czego wireframe jeszcze nie robi

- nie implementuje mechaniki SUB-META v2,
- nie integruje się z runtime gry,
- nie używa FrameComposer w produkcyjnym rendererze,
- nie zawiera finalnego art direction polish,
- nie używa Figma MCP ani nowych assetów.


## Kierunek kompozycyjny v0.2

- Następny wireframe ma być content-driven: pokazuje realną zawartość PRG/WORLD/core, a nie abstrakcyjne placeholdery.
- 9 stref pozostaje mapą semantyczną i nie może być wizualizowane jako równa tabela.
- `middle_center_resonance_core` powinno mieć kołowy lub wielokątny rdzeń z relacjami R2/R3/R4/DS.
- PRG i ŚWIAT mają podobny ciężar wizualny oraz czytelną parę „świat wewnętrzny ↔ świat zewnętrzny”.
- Dół: inventory (szeroki bank kart) + mini Kuźnia (portal) + card detail (duży czytnik) mają tworzyć zbalansowaną bazę kokpitu.

## Composition v0.4 — content-driven cockpit

- 9 stref pozostaje semantyką architektury, ale układ nie jest widoczną tabelą 3×3.
- `top band` jest celowo niski i nie dominuje przestrzeni.
- `middle cockpit` jest największym obszarem i niesie główny ciężar decyzji.
- PRG i ŚWIAT są traktowane jako symetryczne skrzydła (wewnętrzne vs zewnętrzne), z zachowaniem różnic semantycznych.
- `resonance core` ma formę geometryczną (koło/pierścień/węzły), a nie prostokątny panel.
- `bottom operations` balansuje magazyn i card detail, z mini Kuźnią jako małym portalem wejściowym.
- mini connectors / unlockables są pokazane jako future UX/visual layer; nie jest to implementacja mechaniki runtime.
- mobile jest opisywany jako `core + workspace selector`, a nie pełny cockpit naraz.


## Composition v0.4 — content-driven cockpit (repo-only)

- Preview odchodzi od czytelnego odczytu 3×3 panel table; 9 stref pozostaje semantyką architektury.
- Wszystkie placeholdery kart mają pionową orientację i wysoki card ratio (R1/R2/R3/R4/DS/EXT/ODB).
- PRG (lewe skrzydło) ma charakter pionowy: 4 osie, każda `R1 + ODB`, z osobną kolumną 3 slotów R2 blisko środka.
- ŚWIAT (prawe skrzydło) ma charakter bardziej poziomy: 4 osie, każda `R1 + R1 + EXT`, z R2 przy wewnętrznej krawędzi i porównywalnym ciężarem do PRG.
- Resonance core (środek) jest najmocniejszy wizualnie: centralne `R4`, dwa boczne sloty `R3` (lewy bliżej PRG, prawy bliżej Świata), plus osobny moduł `DS` przy rdzeniu.
- Dodane są subtelne mini connectory i placeholdery unlockable/future resource nodes jako future visual/UX cues, bez runtime behavior.
- Dół kompozycji zachowuje balans: szeroki inventory bank (mini pionowe karty), mały portal Kuźni, duży card detail reader.
- Pass jest wyłącznie repo-only preview HTML/CSS/JS; brak runtime integration, brak zmian mechaniki i brak nowych assetów.
