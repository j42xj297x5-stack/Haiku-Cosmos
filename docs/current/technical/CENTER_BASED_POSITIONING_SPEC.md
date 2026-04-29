> Status: ROBOCZY / KONTRAKT TECHNICZNY VISUAL LAYOUT
> Obszar: visual layout / mount contract / anchors
> Źródło prawdy: TAK roboczo dla przyszłego pozycjonowania visual layer
> Ostatnia aktualizacja: 2026-04-29
> Powiązane dokumenty: FRAME_COMPOSER_SPEC.md, SUB_META_V2_BOX_AUDIT.md, ../ui/SUB_META_V2_LAYOUT_SPEC.md, ../visual/SVG_ASSET_STANDARDS.md

# Center-based positioning spec

## 1. Cel

Ustalić wspólny standard pozycjonowania warstwy visual (assety, ramki, ornamenty, linie, sockety) oparty o środek montażu, a nie o ręczne korekty lewy-górny narożnik.

## 2. Canonical model elementu visual

```json
{
  "id": "...",
  "zone": "...",
  "role": "...",
  "mountCenter": { "x": 0, "y": 0 },
  "mountSize": { "w": 0, "h": 0 },
  "visualSize": { "w": 0, "h": 0 },
  "bleed": { "top": 0, "right": 0, "bottom": 0, "left": 0 },
  "pivot": "center",
  "anchorPoints": {
    "center": { "x": 0, "y": 0 },
    "top": { "x": 0, "y": 0 },
    "bottom": { "x": 0, "y": 0 },
    "left": { "x": 0, "y": 0 },
    "right": { "x": 0, "y": 0 },
    "lineTop": { "x": 0, "y": 0 },
    "lineBottom": { "x": 0, "y": 0 },
    "socketIn": { "x": 0, "y": 0 },
    "socketOut": { "x": 0, "y": 0 }
  },
  "zLayer": 0,
  "density": "small|medium|large",
  "stateType": "static_base|tintable_accent|animatable_state_layer",
  "tintMode": "none|slot|tier|status",
  "animationRole": "none|pulse|bridge_flow|highlight"
}
```

## 3. Definicje kluczowe

1. `mountCenter`
- Semantyczny punkt montażu komponentu.
- To wokół niego ustawiane są pozycja, skala i obrót.

2. `mountSize`
- Obszar layoutu zarezerwowany na komponent.
- Służy do kolizji layoutowych i responsywności.

3. `visualSize`
- Faktyczny obszar rysowanego assetu.
- Może przekraczać `mountSize` przez kontrolowany bleed.

4. `bleed`
- Dozwolone wystawanie visual poza mount box.
- Używane dla cieni, poświat, ornamentów i nakładających się detali.

5. `pivot: center`
- Domyślny pivot dla skali/animacji/montażu.
- Zapobiega driftowi przy różnych density i proporcjach.

6. `anchorPoints`
- Named anchors dla łączenia frame parts, linii, socketów, bridge’y.
- Eliminują zgadywanie offsetów i ręczne korekty per element.

## 4. Cztery rodzaje rectów (rozdzielenie kontraktów)

1. `layout rect`
- Geometria systemowa sekcji/strefy.
- Używana do kompozycji UI.

2. `interactive rect`
- Obszar hit-test dla klik/tap.
- Musi być stabilny i przewidywalny.

3. `visual mount rect`
- Obszar montażu assetu (wynik `mountCenter + mountSize`).

4. `visual bleed rect`
- Obszar finalnego rysunku (`visualSize + bleed`).
- Może wychodzić poza interactive rect bez łamania UX.

## 5. Reguły praktyczne

- Center-based positioning **nie zastępuje** named anchors; oba są obowiązkowe.
- Frame parts mogą mieć corners/edges, ale ich mount points muszą wynikać z `pivot center + anchor metadata`.
- Dla przycisków `interactive rect` pozostaje stabilny, a visual może mieć bleed.
- Asset nie wymusza layoutu: layout wyznacza montaż, asset dostarcza formę.
- Zmiana density wpływa najpierw na visual detail i scale, nie na semantykę strefy.

## 6. Zakres wdrożenia

- Dokument ustanawia kontrakt dla przyszłego passu layout/render.
- Nie wprowadza runtime integration w tej iteracji.
- Nie zmienia mechaniki kart, PRG ani kosztów RP.
