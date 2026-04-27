# Haiku Cosmos — MODULAR FRAME KIT (AUDYT 2026-04-27)

> Status: KIERUNEK / AUDYT ASSETÓW
> Obszar: visual / assets / Figma / SVG (HUD, SUB-META, shared)
> Źródło prawdy: TAK, dla porządku katalogowego i zasad przygotowania frame kitu do kolejnego kroku
> Nie obejmuje: runtime, mechaniki, sekwencji, implementacji FrameComposer

## 1. Cel systemu

Celem Modular Frame Kit jest przygotowanie cienkiego, modułowego języka ramek zgodnego z kierunkiem **rytualnego minimalizmu kosmicznego**: lekka geometria, czytelność, cisza wizualna, brak ciężkich fantasy borderów i brak agresywnego neonu.

W tym kroku wykonano wyłącznie audyt i uporządkowanie dokumentacyjne.

## 2. Zasady modułowości

Docelowy kit ma być składany z części:

- `corner_tl`, `corner_tr`, `corner_bl`, `corner_br`
- `edge_top`, `edge_bottom`, `edge_left`, `edge_right`
- `ornament_top_center`, `ornament_bottom_center`
- `marker_sequence`, `slot_frame`, `separator`

Stan obecny (na dzień **2026-04-27**): w `assets/visual/*/svg/frames/` dominują **monolityczne ramy** eksportowane 1:1 z Figmy (niepartycjonowane na corner/edge). To jest dobry materiał referencyjny stylistycznie, ale wymaga dalszego cleanupu pod modular composition.

## 3. Rodziny stylu

Do utrzymania i porządkowania używamy rodzin:

- `astrolabe` (domyślna baza)
- `ritual`
- `eldritch`
- `forge`
- `ether`
- `sequence`
- `minimal`

Aktualny zestaw realnie pokrywa głównie: `astrolabe`, `ritual`, `ether`, `sequence`; warianty `eldritch` i `forge` są na razie śladowe/eksperymentalne.

## 4. Zasady techniczne SVG (wynik audytu)

Przeskanowano wszystkie SVG z obszaru `assets/visual/**` i `Figma/**` powiązane z frame kitem.

### 4.1. Co jest OK

- wszystkie audytowane pliki mają `viewBox`;
- nie wykryto osadzonych bitmap `<image>` ani `base64`;
- brak osadzonych fontów;
- brak pełnych nieprzezroczystych teł typu „tapeta” poza kontrolowanymi wypełnieniami panelowymi.

### 4.2. Co wymaga cleanupu

- prawie wszystkie assety mają baked-in `filter` (drop shadow/glow), co utrudnia runtime sterowanie stanami;
- brak `vector-effect="non-scaling-stroke"` w kitach liniowych (ryzyko pogrubiania stroke przy skalowaniu);
- nazwy grup/layerów są eksportowe i niespójne z docelową strukturą (`base-line`, `secondary-line`, `ornament`, `accent` itd.);
- część ramek panelowych zawiera ciemny fill panelu w tym samym pliku co obrys (to utrudnia użycie jako czysty frame-part).

## 5. Mapa katalogów (stan faktyczny)

- `Figma/submeta/style_correction/*` — eksport źródłowy style-correction (frames/lines/ornaments/slots/glyph).
- `Figma/hud/style_correction/*` — eksport źródłowy HUD style-correction.
- `Figma/demo/style_correction/*` — demo/style board.
- `assets/visual/submeta/svg/{frames,lines,glyphs,placeholders}` — docelowe kopie eksportów do repo.
- `assets/visual/hud/svg/frames` — docelowe kopie eksportów HUD.
- `assets/visual/submeta/svg/{ornaments,slots,hud}` — katalogi istnieją, obecnie puste.

## 6. Manifest assetów

Pełny manifest (50 pozycji, z klasyfikacją `type/layer/style/status`) znajduje się w:

- `docs/current/visual/MODULAR_FRAME_KIT_ASSET_MANIFEST.md`

## 7. Assety gotowe do użycia (w zakresie dokumentacyjnym / preview)

- `assets/visual/submeta/svg/placeholders/submeta_hud_style_board_01.svg` (`demo`, `ready`)
- skopiowane do `assets/visual` ramy HUD i SUB-META można używać jako **statyczne preview/evidence**, ale nie jako finalne moduły composera.

## 8. Assety eksperymentalne

Eksperymentalne (jeszcze nieprzeniesione do `assets/visual`) pozostają w `Figma/submeta/style_correction/`:

- ornamenty (`ornament/*`),
- sloty (`slot/*`),
- separator `celestial_bridge_02.svg`.

To jest materiał do selekcji i cleanupu przed etapem modularizacji.

## 9. Lista problemów

1. Duplikaty 1:1 między `Figma/*/style_correction` a `assets/visual/*` (potrzebna jawna polityka: source vs deliverable).
2. Brak rozbicia monolitycznych ramek na `corner/edge/ornament`.
3. Baked-in filtry i stałe kolory ograniczają runtime recolor/state pipeline.
4. Niespójność coverage: ornaments/slots są w Figmie, ale nie są jeszcze przeniesione do `assets/visual/submeta/svg/ornaments|slots`.

## 10. Rekomendowany następny krok

**Jeden krok:** wykonać dedykowany **cleanup assetów SVG (non-runtime)**:

- wybrać zestaw v1 do modularizacji,
- usunąć baked-in glow/shadow z wersji runtime-ready,
- rozciąć 2–3 kluczowe ramy na `corner/edge/ornament`,
- zachować równolegle wariant `style_correction` jako evidence.

Dopiero po tym kroku warto pisać spec i implementację `FrameComposer`.
