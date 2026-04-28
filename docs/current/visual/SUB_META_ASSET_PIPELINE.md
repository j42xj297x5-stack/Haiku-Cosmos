# Haiku Cosmos - SUB-META Asset Pipeline

## Modular Frame Kit v0.1 export status

Modular Frame Kit v0.1 jest pierwszym czystym eksportem modularnych frame parts po resecie legacy `style_correction`.

Lokalizacje:

- `assets/visual/submeta/svg/frame_parts/` - SUB-META frame parts;
- `assets/visual/hud/svg/frame_parts/` - HUD frame parts;
- `assets/visual/cards/svg/state_accents/` - Card State Accents.

Manifest zbiorczy: `assets/visual/modular_frame_kit_v01_manifest.json`.

Ten eksport nie zastepuje jeszcze runtime. FrameComposer, manifest runtime i live-coloring sa nastepnym osobnym etapem.

> Status: KIERUNEK / PIPELINE WYKONAWCZY
> Obszar: SUB-META / HUD / SVG / modular frame kit / legacy evidence
> Źródło prawdy: TAK, dla organizacji assetów SUB-META/HUD. NIE, dla mechaniki i implementacji runtime.
> Ostatnia aktualizacja: 2026-04-28
> Powiązane dokumenty: `MODULAR_FRAME_KIT.md`, `MODULAR_FRAME_KIT_FIGMA_PROMPT.md`, `SUB_META_COMPONENTS.md`, `SUB_META_FIGMA_ASSET_PASS_01.md`

## 1. Decyzja po reset review

Obecny `style_correction` SVG pass ma status:

- `LEGACY / EVIDENCE / STYLE EXPLORATION`;
- niekanoniczny;
- nieprodukcyjny;
- niebędący bazą dla FrameComposera.

Pliki zostały przeniesione do:

- `assets/visual/legacy/style_correction_2026_04/figma_export/`;
- `assets/visual/legacy/style_correction_2026_04/runtime_test_assets/`.

Aktywny manifest runtime `assets/visual/submeta/submeta_svg_manifest.json` pozostaje pusty/neutralny do czasu osobnego FrameComposer/runtime integration pass. Wyeksportowany Modular Frame Kit v0.1 ma osobny manifest evidence/export: `assets/visual/modular_frame_kit_v01_manifest.json`.

## 2. Docelowy pipeline

Docelowy pipeline przechodzi z pełnych overlayów na modular frame kit:

1. Figma projektuje czyste frame parts.
2. SVG są eksportowane do aktywnego `assets/visual`.
3. SVG przechodzą walidację i ewentualny post-process.
4. Manifest produkcyjny mapuje modular parts, nie legacy full-frame overlays.
5. Runtime używa FrameComposera albo podobnego modułu do składania ramek.
6. Live-coloring i animacje są osobnym future pass.

## 3. Co Figma ma produkować

Figma ma produkować:

- corners;
- edges;
- center ornaments;
- slot frames;
- resonance nodes/sockets;
- bridge / connection lines;
- sequence markers;
- card state accents;
- new-card markers.

Figma nie ma produkować jako głównego deliverable:

- pełnych monolitycznych ramek;
- finalnych raster backgrounds;
- ciężko wypalonych glow/shadow;
- bitmap/base64/fontów.

## 4. Aktywna struktura katalogów

Aktywne produkcyjne assety, po nowym passu, powinny trafiać do:

```text
assets/
  visual/
    submeta/
      svg/
        frame_parts/
        slot_frames/
        resonance_nodes/
        bridge_lines/
        ornaments/
        glyphs/
        state_accents/
      submeta_svg_manifest.json
    hud/
      svg/
        frame_parts/
        sequence_markers/
        counters/
        buttons/
    shared/
      svg/
        frame_parts/
        ornaments/
        glyphs/
    legacy/
      style_correction_2026_04/
```

Istniejące katalogi `frames/`, `lines/`, `glyphs/`, `slots/`, `placeholders/` mogą pozostać jako struktura robocza, ale nie powinny sugerować, że legacy SVG jest aktywną produkcją.

## 5. Legacy / evidence

Legacy/evidence pozostaje w `assets/visual/legacy/`.

Zasady:

- nie podpinać legacy do aktywnego manifestu;
- nie używać legacy jako produkcyjnej ramy;
- nie wykonywać kosmetycznego ratowania monolitycznych ramek;
- używać legacy tylko do audytu, porównania i decyzji stylistycznych.

## 6. SVG rules before runtime

Przed importem produkcyjnym sprawdzić:

- `viewBox`;
- brak `<image>`;
- brak `base64`;
- brak fontów;
- brak ciężkich baked filters;
- obecność lub możliwość dodania `vector-effect="non-scaling-stroke"`;
- clean layer/group naming;
- rozdzielenie base/static i accent/dynamic layers.

## 7. Raster pipeline

Raster pipeline pozostaje osobny.

PNG/WebP nie powstają w tym kroku i nie powinny być dodawane do aktywnego frame kit. Figma może wskazywać obszary pod raster, ale właściwe bitmapy powstają poza Figma w osobnym etapie.

## 8. Runtime boundary

Ten dokument nie implementuje runtime.

Oczekiwany przyszły etap:

- FrameComposer składa corners/edges/ornaments;
- static layers renderują stabilne ramy;
- dynamic layers obsługują tinting, selected/hover/locked/active, new-card marker i subtelne animacje;
- fallback SUB-META pozostaje funkcjonalny, jeśli manifest lub asset nie załaduje się poprawnie.
