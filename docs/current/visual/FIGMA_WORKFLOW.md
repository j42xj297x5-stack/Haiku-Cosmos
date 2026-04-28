# Haiku Cosmos - Figma Workflow

> Status: KIERUNEK / WORKFLOW WYKONAWCZY
> Obszar: Figma / Codex / visual asset workflow
> Zrodlo prawdy: TAK, dla pracy Codexa z Figma; NIE, dla mechaniki i runtime
> Ostatnia aktualizacja: 2026-04-28
> Powiazane dokumenty: README.md, MODULAR_FRAME_KIT.md, MODULAR_FRAME_KIT_FIGMA_PROMPT.md, SUB_META_ASSET_PIPELINE.md, SUB_META_COMPONENTS.md

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

## 2. Kolejnosc czytania przed Figma

Przed uzyciem Figma przeczytaj:

1. `docs/current/README.md`;
2. `docs/current/maps/PROJECT_INDEX.md`;
3. `docs/current/maps/DEPENDENCY_MAP.md`;
4. `docs/current/visual/README.md`;
5. `MODULAR_FRAME_KIT.md`;
6. `SUB_META_ASSET_PIPELINE.md`;
7. `SUB_META_COMPONENTS.md`;
8. dokument wykonawczy wskazany w zadaniu.

Dla Modular Frame Kit v0.1 prompt wykonawczy znajduje sie w `MODULAR_FRAME_KIT_FIGMA_PROMPT.md`.

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
