# Haiku Cosmos - Figma Workflow

> Status: KIERUNEK / WORKFLOW WYKONAWCZY
> Obszar: Figma / Codex / visual asset workflow
> Zrodlo prawdy: TAK, dla pracy Codexa z Figma; NIE, dla mechaniki i runtime
> Ostatnia aktualizacja: 2026-05-01
> Powiazane dokumenty: README.md, MODULAR_FRAME_KIT.md, MODULAR_FRAME_KIT_FIGMA_PROMPT.md, FIGMA_FRAME_CUTTING_GUIDE.md, SUB_META_ASSET_PIPELINE.md, SUB_META_COMPONENTS.md

## 1. Cel dokumentu

Ten dokument opisuje zasady pracy z Figma dla visual assetow Haiku Cosmos.

Figma sluzy do:

- projektowania wektorowych komponentow;
- przygotowania SVG-friendly frame parts;
- projektowania layoutow i mini assembly boards;
- opisu warstw static/dynamic;
- eksportu SVG po osobnym poleceniu.

Figma nie jest zrodlem:

- mechaniki kart;
- kosztow RP;
- sekwencji;
- PRG behavior;
- finalnych raster backgrounds;
- runtime integration.

## 2. Kolejnosc czytania i pracy (current)

1. `docs/current/visual/README.md`
2. `docs/current/visual/VISUAL_EXECUTION_GUIDE.md`
3. core visual docs: `ART_DIRECTION.md`, `KOSMOLOGIA_WIZUALNA.md`, `BIBLIOTEKA_MATERIALOW.md`
4. `MODULAR_FRAME_KIT.md`
5. `SVG_ASSET_STANDARDS.md`
6. `FIGMA_FRAME_CUTTING_GUIDE.md` - obowiązkowo przy cięciu/recut/cleanup ramek i modular frame parts
7. `MODULAR_FRAME_KIT_FIGMA_PROMPT.md`
8. Figma work / review
9. SVG export validation
10. manifest / pipeline update
11. osobny technical/runtime pass

Dodatkowe zasady:
- dokumenty Figma evidence to historia/review, nie automatyczne źródło produkcyjne;
- traced vector bases nie mogą wejść do production kit bez cleanupu;
- maski/crop służą do review lub fittingu, nie jako finalne production cutting;
- finalne SVG frame parts muszą mieć osobne export frames i anchor metadata pod FrameComposer/SVG;
- eksport SVG wymaga walidacji zgodnej z `SVG_ASSET_STANDARDS.md`.

## 3. Podzial pipeline

### Figma vector/component pipeline

Zakres:

- SVG;
- components;
- variants;
- mini assembly boards;
- static/dynamic layer notes;
- export-ready naming.

### Raster/background pipeline

Raster pipeline pozostaje osobny.

Nie generuj w Figmie produkcyjnych:

- PNG;
- WebP;
- JPG;
- fontow;
- tekstur materialowych;
- finalnych malarskich tla.

## 4. Zasady pracy

- Uzywaj Figma tylko na wyrazne polecenie uzytkownika.
- Domyslnie zaczynaj od asset/component pass, nie od runtime implementation.
- `Implement Design` tylko na wyrazne polecenie.
- `Code Connect` tylko na wyrazne polecenie.
- Nie zmieniaj mechaniki na podstawie projektu Figma.
- Nie podpinaj assetow do runtime w tym samym passie, jesli zadanie tego nie wymaga.
- Nie traktuj legacy `style_correction_2026_04` jako produkcyjnej bazy.

## 5. Status Modular Frame Kit v0.1

Modular Frame Kit v0.1 zostal utworzony w Figmie i wyeksportowany do repo jako `35` SVG.

Manifest export/evidence:

```text
assets/visual/modular_frame_kit_v01_manifest.json
```

Status: `exported_review_ready`.

Runtime integration: `not_integrated`.

FrameComposer, live-coloring i animacje sa osobnymi future pass.

## 6. Raport po pracy z Figma

Raport po zadaniu Figma powinien zawierac:

1. executive summary;
2. file key / URL;
3. liste stron i komponentow;
4. eksporty i formaty;
5. walidacje;
6. czego nie wykonano;
7. ryzyka / ograniczenia;
8. nastepny krok.


## Figma as optional fitting board after raster/Inkscape

Figma jest **opcjonalna**, a nie obowiazkowa po kazdym passie raster/Inkscape.

Figma fitting startuje dopiero, gdy projektant dostarczy:
- pelny eksport warstwowej ramki glownej, albo
- wybrane czesci ramki do modularnego dopasowania.

Zakres zadania Codex/Figma na tym etapie:
1. crop/fit i alignment,
2. check bounds,
3. assign/verify anchors,
4. prepare mount points,
5. test against layout board,
6. rekomendacja modular split pod FrameComposer (jesli potrzebna),
7. export/review po walidacji zgodnosci ze `SVG_ASSET_STANDARDS.md`.

Figma nie redesignuje stylu linii ani charakteru ornamentu, chyba ze jest to jawnie zlecone.

`MODULAR_FRAME_KIT_FIGMA_PROMPT.md` pozostaje aktywny dla zadan Figma-generated lub Figma-fitting, ale nie wymusza Figma-first dla recznie rysowanych assetow Inkscape.
