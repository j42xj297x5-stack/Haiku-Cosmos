> Status: ROBOCZY / AUDYT PROJEKTOWO-TECHNICZNY
> Obszar: SUB-META / audit layoutu i kontraktu stref
> Źródło prawdy: NIE (audit roboczy pod przyszły pass projektowy)
> Ostatnia aktualizacja: 2026-04-29
> Powiązane dokumenty: ../systems/SUB_META_SYSTEM.md, ../systems/CARDS_SYSTEM.md, ../systems/PRG_SYSTEM.md, ../ui/UI_WORLD.md, ../technical/SUB_META_LAYOUT_ANCHOR_AUDIT.md, ../ui/SUB_META_V2_LAYOUT_SPEC.md, ../technical/CENTER_BASED_POSITIONING_SPEC.md

# SUB-META v2 — audit obecnego boxu

## 1. Cel audytu

Celem audytu jest opisanie obecnego SUB-META overlay jako punktu wyjścia do architektury v2 (cockpit resonance system), bez zmiany mechaniki kart, PRG, kosztów RP ani runtime behavior.

## 2. Obecny stan SUB-META (snapshot)

- Layout jest policzony głównie w `getSubMetaLayout()` (`cards.js`) i zduplikowany jako extraction contract w `HC.SubMetaLayout.compute(...)` (`hc.submeta_layout.js`).
- Render i interakcja są spięte bezpośrednio z rectami layoutu w `renderSubMetaOverlay(...)` oraz `handleSubMetaPointerDown(...)`.
- Overlay już zawiera większość przyszłych domen (PRG, świat, inventory, picker, forge, detail), ale ich semantyka i wizualny hierarchy są jeszcze proof-of-concept.
- R2/R3/R4/DS są częściowo obecne w strukturze i opisach, ale nie mają jeszcze docelowego cockpitowego osadzenia 9-strefowego.

## 3. Funkcje odpowiedzialne za layout/render/interakcję

### Layout / anchor contract
- `getSubMetaLayout(screenW, screenH)` (`cards.js`) — źródło rectów paneli, slotów i przycisków.
- `HC.SubMetaLayout.compute(screenW, screenH, options)` (`hc.submeta_layout.js`) — extraction pass v0.1 zgodny geometrycznie z `getSubMetaLayout`.
- `HC.SubMetaLayout.computeAnchors(layout, options)` (`hc.submeta_layout.js`) — named anchors dla frame/slot/socket/button.
- `HC.SubMetaLayout.computeWithAnchors(...)` (`hc.submeta_layout.js`) — paczka layout + anchors + diagnostics.

### Render
- `renderSubMetaOverlay(ctx, screenW, screenH)` (`cards.js`) — główny renderer panelu.
- `renderSubMetaSlotFrame(...)`, `renderSubMetaButton(...)`, `renderSubMetaCardMini(...)`, `renderSubMetaCardDetail(...)` (`cards.js`) — render slotów, przycisków, mini-kart i panelu opisu.
- Logika list/grid: `getSubMetaCardGrid(...)`, `getSubMetaCardRect(...)`, render inventory/picker/forge w obrębie `renderSubMetaOverlay(...)`.

### Interakcja
- `handleSubMetaPointerDown(mx,my,screenW,screenH)` (`cards.js`) — click handling slotów, inventory, picker, forge, przycisków.
- Funkcje akcji (bez zmiany mechaniki w tym audycie): `assignSubMetaCardToSlot`, `removeSubMetaCardFromSlot`, `craftSubMetaForge`, `canCraftForge`.

## 4. Tabela elementów obecnego SUB-META

| id robocze | nazwa w kodzie | typ | rola | current rect source | interaktywność | problemy obecne | strefa v2 |
|---|---|---|---|---|---|---|---|
| sm_root | `panel` | panel | kontener overlay | `getSubMetaLayout().panel` | niebezpośrednia | brak semantycznych stref | whole cockpit envelope |
| sm_header | `titleY` + header separator | info/text | tytuł + status run/meta | pochodne z `panel` | częściowo (nawigacja obok) | header nie jest osobną strefą kontraktową | top_center_identity |
| sm_back_btn | `closeButton` | button | wyjście z SUB-META | layout button rect | tak | obok innych akcji bez pełnej hierarchii nav | top_right_navigation |
| sm_confirm_btn | `assignButton` | button | akcja osadzenia/przypisania | layout button rect | tak | semantyka zależna od kontekstu, brak osobnej warstwy workflow | bottom_center_forge (action rail) |
| sm_info_back_btn | `infoBackButton` | button | powrót z detail view | layout button rect | tak | tryb detail miesza nawigację z operacją | top_right_navigation |
| sm_prg_group | `prgGroupRect` | panel | obszar PRG (R1/ODB/R2 sockets) | layout panel rect | pośrednia | mieszanie prezentacji osi + slotów + wiązań w jednym passie | middle_left_prg |
| sm_prg_branches | `prgBranches[]` | slot_group | kolumny osi PRG | z layout branch columns | tak | brak standaryzacji mount center dla slotów | middle_left_prg |
| sm_prg_r1 | `branch.r1Slot` | slot | sloty R1 PRG | branch slot rect | tak | różne offsety ręczne | middle_left_prg |
| sm_prg_odb | `branch.odbSlot` | slot | miejsca ODB | branch slot rect | tak | brak spójnej warstwy stanu i znaczenia osi | middle_left_prg |
| sm_prg_r2_sockets | `prgR2Slots[]` | socket | wiązania R2 po stronie PRG | layout sockets | tak | sockety nie są sklejone przez formalny bridge model | middle_center_resonance_core |
| sm_world_group | `worldGroupRect` | panel | obszar slotów świata | layout panel rect | pośrednia | semantyka slot category + DS + R2 w jednym klocku | middle_right_world |
| sm_world_slots | `worldSlots[]` | slot_group | Forma/Intencja/Czas/Cisza + DS socket | layout slots | tak | DS istnieje, ale bez dedykowanego bridge semantics | middle_right_world |
| sm_world_r2_sockets | `worldR2Slots[]` | socket | wiązania R2 po stronie świata | layout sockets | tak | brak jawnego centrum rezonansu PRG↔WORLD | middle_center_resonance_core |
| sm_inventory | `inventoryRect`,`inventoryInnerRect` | list/panel | magazyn i kolekcja kart | layout rect + inset | tak | duża gęstość informacji, konkurencja z picker/forge | bottom_left_inventory |
| sm_picker_assign | `pickerRect`,`pickerAssignRect` | list/panel | wybór kart do slotu | layout rect + inset | tak | semantyka „assign” i „forge” zbyt blisko w jednej taśmie | bottom_left_inventory / bottom_center_forge |
| sm_forge_panel | `pickerForgeFrameRect`,`pickerForgeRect` | panel/list | Kuźnia i craft opcje | layout rect + inset | tak | dzieli przestrzeń z pickerem ad hoc | bottom_center_forge |
| sm_card_detail | `cardInfoRect` | info/card panel | podgląd/opis/haiku/statystyki | layout rect | częściowo (przyciski/selection) | detail nie ma wyraźnej rangi strefy krytycznej | bottom_right_card_detail |
| sm_bridges_future | anchor names `binding_socket`, `resonance_socket` | bridge/future hook | przyszłe linie i aktywne wiązania | `computeAnchors` metadata | nie (na razie) | brak runtime bridge bus w centrum | middle_center_resonance_core |

## 5. Problemy architektoniczne

1. Mieszanie layout/render/mechanika:
   - `cards.js` łączy obliczenia rectów, render i click handling.
2. Brak pełnego center-based positioning:
   - dominują recty `x/y/w/h`, a nie semantyczne mount center + visual bleed.
3. Brak jednego modelu visual mount:
   - anchors istnieją (v0.1), ale nie są jeszcze pełnym kontraktem visual layer.
4. Brak semantycznego miejsca dla R2/R3/R4:
   - R2 sockety są rozdzielone po bokach, bez jawnego resonance core.
   - R3/R4 nie mają dedykowanego „rdzenia konfiguracji”.
5. Układ obecny jako proof-of-concept:
   - działa operacyjnie, ale nie jest finalnym cockpitem o klarownej hierarchii stref.

## 6. Wnioski do SUB-META v2

- Przejść z modelu „panel + sekcje” na model „9 semantycznych stref cockpitowych”.
- Ustanowić rozdzielenie kontraktów:
  - mechanika (bez zmian),
  - layout geometry,
  - interactive rect,
  - visual mount/bleed.
- Umieścić R2 jako bridge w `middle_center_resonance_core` (jedno aktywne wiązanie naraz).
- Dać przestrzeń dla R3 (stabilizacja/rezerwacja) i R4 (meta-jedność konfiguracji) jako elementów rdzenia.
- Zachować DS jako czytelnie odrębny slot dodatkowy, nie jako zwykły R1.


## 7. Designer content clarification 2026-04-29

- Aktualny layout proof-of-concept nie ma jeszcze pełnego, jawnego miejsca na wszystkie byty rdzenia (`R2`/`R3`/`R4`/`DS`) w jednym resonance core.
- W wersji v2 te elementy muszą być projektowane jako jawne byty kompozycyjne i informacyjne, a nie tylko rozproszone sockety po bokach.
- Obecny proof-of-concept nie oddaje docelowej gęstości informacji wynikającej z modelu: PRG 4x2 + 3 R2, ŚWIAT 4x(2R1+ext) + 3 R2, oraz centralny rdzeń z R4 i stabilizacją R3.
- Konsekwencja dla kolejnego passu: wireframe/content preview ma odchodzić od wyglądu tabeli i pokazywać relacyjny, content-driven cockpit.
