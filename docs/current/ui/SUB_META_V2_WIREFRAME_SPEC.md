> Status: ROBOCZY / SPEC WIREFRAME
> Obszar: SUB-META v2 / low-fi layout preview
> Źródło prawdy: NIE (roboczy etap przed polished design i runtime)
> Ostatnia aktualizacja: 2026-04-29
> Powiązane dokumenty: UI_WORLD.md, SUB_META_V2_LAYOUT_SPEC.md, ../technical/SUB_META_V2_BOX_AUDIT.md, ../technical/CENTER_BASED_POSITIONING_SPEC.md

# SUB-META v2 — Wireframe spec (desktop/tablet/mobile)

## Cel

Wireframe repo-only weryfikuje układ 9 stref jako cockpit resonance system bez zmiany mechaniki, kosztów RP i runtime behavior.

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

- Desktop/Tablet: kompozycja 3x3 z semantycznie uprzywilejowanym środkiem.
- Mobile: stałe sekcje krytyczne + 1 aktywny workspace.

## Decyzje projektanta przed kolejnym krokiem

1. Czy `middle_center_resonance_core` ma być największym punktem ciężkości SUB-META?
2. Czy Kuźnia ma być zawsze widoczna, czy jako głębszy panel / drawer?
3. Czy card detail ma być stałe na desktopie, a przełączane na mobile?
4. Czy inventory ma być dolnym pasem, czy osobną szufladą?
5. Czy R4 ma być centralnym slotem rdzenia, czy specjalnym slotem nad/poniżej rdzenia?
6. Czy DS ma być pokazywane przy gniazdach, czy w osobnym module rozszerzeń?
7. Czy mobile ma być jednym ekranem przewijanym, czy systemem zakładek/workspace?

## Czego wireframe jeszcze nie robi

- nie implementuje mechaniki SUB-META v2,
- nie integruje się z runtime gry,
- nie używa FrameComposer w produkcyjnym rendererze,
- nie zawiera finalnego art direction polish,
- nie używa Figma MCP ani nowych assetów.
