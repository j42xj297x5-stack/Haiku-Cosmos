# Haiku Cosmos - SUB-META Layout Anchor Audit

> Status: ROBOCZY / AUDYT LAYOUTU
> Obszar: SUB-META / layout anchors / FrameComposer preparation
> Zrodlo prawdy: NIE dla mechaniki; TAK roboczo dla mapy obecnego layoutu i przyszlych mount points
> Ostatnia aktualizacja: 2026-04-28
> Powiazane dokumenty: ../systems/SUB_META_SYSTEM.md, ../systems/CARDS_SYSTEM.md, ../systems/ECONOMY_SYSTEM.md, ../ui/UI_WORLD.md, ../visual/SVG_ASSET_STANDARDS.md, FRAME_COMPOSER_SPEC.md, CARD_VISUAL_ARCHITECTURE.md

## 1. Cel audytu

FrameComposer sandbox sklada juz rame po `line-anchor to line-anchor`, ale produkcyjny SUB-META layout w `cards.js` nie ma jeszcze jawnych mount points.

Ten dokument mapuje obecny runtime layout i proponuje przyszly kontrakt anchorow dla FrameComposera.

Zakres:

- analiza obecnego `cards.js`;
- nazwy logicznych mount points;
- proponowany kontrakt `SubMetaLayoutAnchors`;
- standard przejscia do przyszlej integracji.

Poza zakresem:

- implementacja ramek w produkcyjnym SUB-META;
- zmiana mechaniki kart;
- zmiana kosztow RP;
- zmiana sekwencji;
- zmiana PRG behavior;
- redesign layoutu w kodzie.

## 2. Funkcje i odpowiedzialnosci w `cards.js`

Glowna sciezka renderowania:

- `render(ctx, screenW, screenH)` wywoluje HUD, sequence overlay, card HUD i `renderSubMetaOverlay`.
- `renderPack01Collection(ctx, screenW, screenH)` rysuje HUD kart/kolorow w prawym gornym rogu.
- `getSubMetaLayout(screenW, screenH)` liczy wszystkie recty SUB-META.
- `renderSubMetaOverlay(ctx, screenW, screenH)` rysuje overlay, panele, sloty, inventory, picker, forge, card info i buttons.
- `handleSubMetaPointerDown(mx, my, screenW, screenH)` przelicza pointer przez `SUB_META_SCALE`, czyta hit rects i wykonuje akcje UI/mechaniki.

Funkcje danych i mechaniki dotykane przez layout:

- `ensureSubMetaPrg(World)` i `ensureSubMetaWorld(World)` inicjalizuja stan SUB-META.
- `assignPrgBranchCard`, `assignPrgBindingCard`, `assignWorldSlotCard`, `assignWorldBindingCard` przypisuja karty i pobieraja RP.
- `unlockWorldDsSlot` odblokowuje trzeci world socket przez DS.
- `removeWorldSlotCard` usuwa karte ze slotu.
- `getSubMetaInventoryEntries` buduje inventory.
- `getWorldAvailableCards`, `getWorldBindingAvailableCards`, `getPrgAvailableCards` buduja picker.
- `getSubMetaForgeList`, `craftSubMetaForge` obsluguja Kuznie.
- `renderMetaCard` rysuje mini karty w inventory, pickerach, slotach i HUD.

## 3. Obecny layout: recty i zaleznosci

`getSubMetaLayout(screenW, screenH)` jest jedynym miejscem, ktore liczy wiekszosc rectow SUB-META.

Root panel:

- `panelW = min(780, floor(screenW * 0.94))`;
- `panelH = min(640, floor(screenH * 0.92))`;
- `panelX/Y` centruja panel na ekranie;
- `pad = 18`, `headerH = 28`;
- `SUB_META_SCALE = 1.0`.

Kolumny:

- `contentW = panelW - pad * 2`;
- `leftW = floor(contentW * 0.48)`;
- `rightW = contentW - leftW - columnGap`;
- `columnGap = 16`;
- lewa kolumna: PRG, R2 PRG, R2 WORLD, WORLD slots;
- prawa kolumna: inventory, picker assign, picker forge, card detail.

PRG panel:

- `prgPanelH = min(160, max(130, floor(contentH * 0.26)))`;
- `prgRect` zajmuje gorna czesc lewej kolumny;
- 4 branch columns sa dzielone rowno;
- kazda branch ma `r1Slot` i `odbSlot`;
- `prgR2Rect` jest osobnym pasem pod PRG branches;
- `prgR2Slots` to 3 rowne sloty R2.

WORLD panel:

- `worldR2Rect` jest pasem R2 nad gridem WORLD;
- `worldRect` zajmuje dolna czesc lewej kolumny;
- `worldSlots` tworza grid 2x2 dla `forma`, `intencja`, `czas`, `cisza`;
- kazdy world slot ma 3 sockety: dwa R1 i jeden DS/EKS/extra;
- trzeci socket jest locked, jesli `entry.dsUnlocked` jest false.

Prawa kolumna:

- `inventoryRect` jest na wysokosci PRG panelu;
- `pickerRect` i `pickerForgeFrameRect` dziela pas miedzy `prgR2Rect` i `worldR2Rect`;
- `pickerAssignRect` i `pickerForgeRect` sa rectami wewnetrznymi z `pickerInset = 8`;
- `cardInfoRect` zajmuje wysokosc `worldRect`;
- `assignButton`, `activateButton`, `infoBackButton`, `closeButton` sa wyliczane jako stale rozmiary w rectach panelu.

Grids:

- mini karta ma stale `SUB_META_CARD_W = 20`, `SUB_META_CARD_H = 26`;
- grid inventory/picker liczy kolumny z `SUB_META_CARD_GAP_X = 12`, `SUB_META_CARD_GAP_Y = 10`, `SUB_META_COUNT_PAD = 8`;
- rozmiary kart sa stale na desktop i mobile.

## 4. Hardcoded vs responsive

Responsive/proporcjonalne:

- root panel skaluje sie do `94%` szerokosci i `92%` wysokosci viewportu;
- kolumny dziela `contentW` w proporcji ok. `48% / rest`;
- PRG panel bierze ok. `26%` content height z clampem;
- world grid 2x2 rozklada sie w dostepnym `worldInner`;
- inventory/picker grid liczy liczbe kolumn z dostepnej szerokosci.

Hardcoded:

- max panel `780 x 640`;
- `pad`, `headerH`, `columnGap`, `rowGap`, `worldPad`, `pickerInset`;
- mini card size `20 x 26`;
- slot paddings, gaps i button sizes;
- `closeButton 88 x 26`, `assignButton 100 x 26`, `infoBackButton 70 x 26`;
- fallback colors i alpha;
- legacy manifest logical names w kilku miejscach renderowania;
- text labels i fonty `system-ui`.

Mobile/desktop:

- nie ma osobnego mobile layout contract;
- layout uzywa clampow i proporcji, ale zachowuje te same panele i stale mini card sizes;
- przy malych viewportach ryzykiem sa zbyt ciasne picker/forge grids, card info text i button labels;
- obecny kod nie ma density (`small|medium|large`) ani uproszczen ornamentow.

## 5. Mieszanie layoutu, renderingu i mechaniki

Obecnie:

- `getSubMetaLayout` liczy recty i hit rects, ale nie eksportuje semantycznego anchor contractu.
- `renderSubMetaOverlay` rysuje, pobiera stan mechaniczny, sprawdza RP, dobiera listy kart i buduje card detail.
- `handleSubMetaPointerDown` uzywa tych samych rectow, ale od razu wykonuje akcje mechaniczne: assign, remove, unlock DS, forge, active binding toggle.
- `cards.js` nadal ma fallbackowy SVG loader i `drawManifestSvg`.
- `renderMetaCard` jest wspolnym rendererem dla inventory, pickerow, slotow i HUD.

To jest funkcjonalne jako probe UI, ale przed FrameComposer integration potrzebny jest extraction/anchor pass:

```text
cards.js / World state
  -> SubMeta view model
  -> SubMetaLayoutAnchors
  -> HC.CardVisuals / HC.FrameComposer
  -> HC.VisualAssets
```

## 6. Proponowane mount points

| Mount point | Rola | Miejsce | Typ | Renderer | Status | Mobile |
| --- | --- | --- | --- | --- | --- | --- |
| `submeta.root_frame` | glowna rama overlay | `panel` | panel | FrameComposer full frame | static_base | widoczny, small bez ornamentow |
| `submeta.header_frame` | naglowek SUB-META/RP | `headerY` band | panel/ornament | FrameComposer lub separator SVG | static_base | uproszczony na small |
| `submeta.prg_panel_frame` | kontener PRG branches | `prgGroupRect` | panel | FrameComposer full frame | static_base/tintable accents | widoczny |
| `submeta.prg_branch_frame` | pojedyncza galaz PRG | `prgBranches[].column` | slot group | FrameComposer small/slot frame | tintable_accent | moze byc compact |
| `submeta.prg_r1_slot_frame` | slot R1 PRG | `prgBranches[].r1Slot` | slot | single SVG slot frame | static + selected accent | widoczny |
| `submeta.prg_odb_slot_frame` | przyszly ODB slot | `prgBranches[].odbSlot` | slot | single SVG/debug locked | static/locked | moze byc ukryty/compact |
| `submeta.prg_binding_socket_frame` | R2 PRG binding | `prgR2Slots[]` | socket | single SVG resonance socket | tintable/dynamic | widoczny jako compact |
| `submeta.world_slots_panel_frame` | kontener WORLD grid | `worldGroupRect` lub `worldRect` | panel | FrameComposer full frame | static_base | widoczny |
| `submeta.world_category_frame` | kategoria Forma/Intencja/Czas/Cisza | `worldSlots[]` | slot group | FrameComposer small/slot frame | tintable_accent | compact |
| `submeta.slot_frame` | pojedynczy R1/DS socket | `worldSlots[].sockets[]` | slot | single SVG slot frame | static/selected/locked | widoczny |
| `submeta.resonance_socket_frame` | socket R2 WORLD | `worldR2Slots[]` | socket | single SVG resonance socket | tintable/dynamic | widoczny |
| `submeta.bridge_line` | relacje R2 PRG/WORLD | between branch/socket anchors | line | bridge SVG/FrameComposer line | dynamic/animatable future | moze byc uproszczony |
| `submeta.inventory_panel_frame` | magazyn/kolekcja | `inventoryRect` | panel | FrameComposer or static panel frame | static_base | widoczny, mniej detalu |
| `submeta.inventory_card_frame` | mini karta w magazynie | inventory grid rects | card | CardVisuals/card state accent | static/tintable | compact |
| `submeta.active_cards_panel_frame` | aktywne/wybrane karty | future split of inventory/picker | panel | FrameComposer | static_base | optional |
| `submeta.reserve_panel_frame` | rezerwa/future cards | future | panel | FrameComposer | static_base | optional/hidden |
| `submeta.picker_panel_frame` | dostepne karty dla slotu | `pickerRect` | panel | FrameComposer or simple frame | static_base | compact |
| `submeta.forge_panel_frame` | Kuznia candidates | `pickerForgeFrameRect` | panel | FrameComposer or forge style SVG | static/tintable | compact/scroll future |
| `submeta.card_detail_panel_frame` | opis karty/forge | `cardInfoRect` | panel | FrameComposer full/ornament | static_base | widoczny, text-first |
| `submeta.card_preview_frame` | grafika karty w detail | future inside `cardInfoRect` | card | CardVisuals | static/tintable | optional |
| `submeta.button.back` | zamkniecie/powrot | `closeButton`, `infoBackButton` | button | button frame SVG | static/hover future | widoczny |
| `submeta.button.confirm` | potwierdz assign/forge | `assignButton` | button | button frame SVG | static/disabled/active | widoczny |
| `submeta.separator.header` | podzial naglowka | line under header | separator | single SVG | static_base | optional |

## 7. Proponowany kontrakt `SubMetaLayoutAnchors`

Kontrakt powinien byc produkowany przez przyszla warstwe layoutu, a nie przez FrameComposer.

Przyklad:

```js
const SubMetaLayoutAnchors = {
  version: 1,
  density: "medium",
  viewport: { w: screenW, h: screenH },
  rootFrame: { x, y, w, h, density: "medium" },
  header: { x, y, w, h },
  prgPanel: { x, y, w, h },
  prgBranches: [
    {
      key: "radius",
      color: "red",
      rect: { x, y, w, h },
      r1Slot: { x, y, w, h },
      odbSlot: { x, y, w, h }
    }
  ],
  prgBindings: [
    {
      index: 0,
      rect: { x, y, w, h },
      fromBranchKey: "radius",
      toBranchKey: "speed",
      bridge: {
        start: { x, y },
        end: { x, y },
        state: "inactive"
      }
    }
  ],
  worldSlotsPanel: { x, y, w, h },
  worldCategories: [
    {
      key: "forma",
      color: "red",
      rect: { x, y, w, h },
      sockets: [
        { index: 0, role: "r1", rect: { x, y, w, h }, state: "empty" },
        { index: 1, role: "r1", rect: { x, y, w, h }, state: "empty" },
        { index: 2, role: "ds", rect: { x, y, w, h }, state: "locked" }
      ]
    }
  ],
  worldBindings: [
    {
      index: 0,
      rect: { x, y, w, h },
      fromSlotKey: "forma",
      toSlotKey: "intencja",
      bridge: {
        start: { x, y },
        end: { x, y },
        state: "inactive"
      }
    }
  ],
  inventoryPanel: { x, y, w, h },
  inventoryCards: [
    { key: "inventory:0", rect: { x, y, w, h }, state: "available" }
  ],
  pickerPanel: { x, y, w, h },
  pickerCards: [
    { key: "picker:0", rect: { x, y, w, h }, state: "available" }
  ],
  forgePanel: { x, y, w, h },
  forgeCards: [
    { key: "forge:0", rect: { x, y, w, h }, state: "available" }
  ],
  cardDetailPanel: { x, y, w, h },
  buttons: {
    back: { x, y, w, h, state: "enabled" },
    infoBack: { x, y, w, h, state: "enabled" },
    confirm: { x, y, w, h, state: "disabled" }
  }
};
```

Dozwolone pola:

- recty i punkty montazowe;
- density;
- visual state (`empty`, `occupied`, `selected`, `locked`, `disabled`, `active`);
- kolory osi jako visual hints;
- stable ids do debug overlay.

Niedozwolone pola:

- koszt RP jako source of truth;
- decyzja, czy klik jest legalny;
- modyfikacja `World.score`;
- struktura sekwencji;
- efekty PRG/runtime.

## 8. Mobile i density considerations

Przyszly layout powinien miec density:

- `small` - panel mniej ozdobny, center ornaments off, mniejsze bridge detale, priorytet tekstu i tap targets.
- `medium` - obecny desktop/tablet baseline.
- `large` - pelniejsze ramy, center ornaments, wiecej tickow i separatorow.

Minimalne zasady:

- tap target slot/button nie powinien wynikac z samego rozmiaru mini karty;
- mini karta moze byc mniejsza niz target interakcji;
- frame ornament nie moze zjadac miejsca tekstu;
- `cardDetailPanel` na small powinien byc text-first;
- `forgePanel` i `pickerPanel` moga byc uproszczone lub zamienione w tabs/scroll w osobnym pass.

## 9. Problemy do rozwiazania przed integracja FrameComposera

- Brak jawnego `SubMetaLayoutAnchors` jako return contract.
- Brak rozdzialu view modelu od rysowania i mechaniki.
- `renderSubMetaOverlay` jest zbyt duzy i laczy panele, karty, tekst, legacy SVG i stany mechaniczne.
- `handleSubMetaPointerDown` wykonuje akcje mechaniczne na bazie rectow z layoutu.
- Brak density/mobile presetow.
- Brak osobnego adaptera `HC.CardVisuals` dla mini kart i card detail.
- Legacy manifest calls (`drawManifestSvg`) pozostaja fallbackiem, nie docelowa integracja Modular Frame Kit.

## 10. Extraction pass v0.1

Status na 2026-04-28: wykonany zostal bezpieczny extraction pass layoutu SUB-META.

Dodany modul runtime:

- `hc.submeta_layout.js`
- namespace: `HC.SubMetaLayout`
- status: `extracted_not_integrated`

Publiczne API:

```js
HC.SubMetaLayout.compute(width, height, options)
HC.SubMetaLayout.computeAnchors(layout, options)
HC.SubMetaLayout.computeWithAnchors(width, height, options)
HC.SubMetaLayout.getDiagnostics(layout, anchors)
```

Zakres modulu:

- `compute(...)` odtwarza obecny layout zgodny z `getSubMetaLayout()` w `cards.js`;
- `computeAnchors(...)` tworzy semantyczne mount points dla przyszlego FrameComposera;
- `computeWithAnchors(...)` zwraca `{ layout, anchors }`;
- `getDiagnostics(...)` zwraca density, liczbe anchorow, brakujace wazne anchory i klucze layoutu;
- `density` jest liczony jako `small`, `medium` albo `large` na podstawie rozmiaru viewportu.

Zmiana w `cards.js`:

- `getSubMetaLayout(screenW, screenH)` pozostaje kompatybilnym wrapperem;
- jesli `HC.SubMetaLayout.compute` istnieje, wrapper korzysta z nowego modulu;
- jesli modul nie istnieje albo zwroci nieprawidlowy wynik, obecny kod layoutu w `cards.js` pozostaje defensywnym fallbackiem;
- `renderSubMetaOverlay()` i `handleSubMetaPointerDown()` dalej uzywaja tego samego API layoutu, wiec wyglad i mechanika nie powinny sie zmienic.

Anchors v0.1:

- `submeta.root_frame`;
- `submeta.header_frame` - rect pochodny z obecnego header band, oznaczony jako `derived`;
- `submeta.prg_panel_frame`;
- `submeta.world_slots_panel_frame`;
- `submeta.inventory_panel_frame`;
- `submeta.picker_panel_frame`;
- `submeta.forge_panel_frame`;
- `submeta.card_detail_panel_frame`;
- `submeta.button.back`;
- `submeta.button.confirm`;
- `submeta.button.info_back`;
- `anchors.slots[]` dla PRG branch/slotow, R2 sockets, WORLD categories i WORLD sockets;
- `anchors.bridges = []` pozostaje puste jako future hook.

Runtime visual integration:

- `FrameComposer` nadal jest `not_integrated` dla produkcyjnego SUB-META;
- `HC.SubMetaLayout` nie rysuje, nie laduje assetow i nie zmienia mechaniki;
- mount points sa przygotowana warstwa semantyczna dla przyszlego passu visual.

## 11. Runtime probe: `submeta.root_frame`

Status na 2026-04-28: `submeta.root_frame` jest pierwszym mount point uzytym w runtime probe.

Zakres:

- tylko glowny root panel SUB-META;
- probe jest za flaga `FRAME_COMPOSER_SUBMETA_ROOT_ENABLED` w `cards.js`;
- `renderSubMetaOverlay()` nadal rysuje tlo, teksty, sloty, panele wewnetrzne, karty, picker i Kuznie starym sposobem;
- `HC.SubMetaLayout.computeAnchors(layout)` dostarcza anchor `submeta.root_frame`;
- `HC.FrameComposer` sklada tylko astrolabe root frame;
- `HC.VisualAssets` laduje/preloaduje tylko assety root frame.

Fallback:

- przy fladze `false` wraca stary render;
- przy braku modulow visual/layout wraca stary render;
- przy braku manifestu, preloadu albo pelnego draw summary wraca stary render.

Reszta mount points pozostaje future:

- `submeta.prg_panel_frame`;
- `submeta.world_slots_panel_frame`;
- `submeta.inventory_panel_frame`;
- `submeta.picker_panel_frame`;
- `submeta.forge_panel_frame`;
- `submeta.card_detail_panel_frame`;
- `submeta.slot_frame`;
- `submeta.resonance_socket_frame`;
- `submeta.bridge_line`;
- button frames.

Ten probe nie zmienia mechaniki, hit rectow, kosztow RP, sekwencji ani PRG behavior.

## 12. Rekomendowany nastepny krok

Najbezpieczniejszy kolejny pass:

1. Wykonac manualny smoke test SUB-META z flaga root frame `true`.
2. Porownac screenshot root frame z fallbackiem po ustawieniu flagi `false`.
3. Dopiero potem podpiac kolejne panel frames za osobna flaga visual.
4. Utrzymac fallback bez assetow.

Alternatywny krok projektowy:

- Figma/design pass dla docelowego SUB-META layoutu z anchor metadata, jesli obecny probny layout nie jest juz dobra baza.
