# Haiku Cosmos - SUB-META Asset Pipeline

> Status: STANDARD PIPELINE / CURRENT
> Obszar: visual assets (SUB-META / HUD / cards) - Figma -> SVG -> validation -> manifest -> review
> Źródło prawdy: TAK, dla organizacji przyszlych visual assets i przeplywu wykonawczego. NIE, dla mechaniki. NIE, dla runtime integration.
> Ostatnia aktualizacja: 2026-04-30
> Powiązane dokumenty: `VISUAL_EXECUTION_GUIDE.md`, `MODULAR_FRAME_KIT_FIGMA_PROMPT.md`, `SVG_ASSET_STANDARDS.md`, `SUB_META_COMPONENTS.md`, `MODULAR_FRAME_KIT_ASSET_MANIFEST.md`, `SUB_META_FIGMA_ASSET_PASS_01.md`, `SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md`, `SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md`

## 1. Rola dokumentu

Ten dokument jest aktywnym pipeline wykonawczym dla przyszlych passow visual/SVG.

Nie jest to dokument do:

- projektowania mechaniki,
- runtime integration,
- automatycznego uznawania evidence za produkcje.

## 2. Pipeline wykonawczy (CURRENT)

1. **Direction/context load**  
   Przeczytaj `visual/README.md`, `VISUAL_EXECUTION_GUIDE.md`, core direction i mapy projektu.
2. **Execution guide alignment**  
   Zweryfikuj zakres passu i granice (bez runtime/mechaniki) wedlug `VISUAL_EXECUTION_GUIDE.md`.
3. **Current Figma prompt**  
   Uzyj `MODULAR_FRAME_KIT_FIGMA_PROMPT.md` jako aktualnego promptu wykonawczego.
4. **Figma design/review**  
   Wykonaj pass komponentow i review w Figmie; nie wykonuj jeszcze integracji runtime.
5. **SVG export**  
   Eksportuj wybrane komponenty do odpowiednich katalogow `assets/visual/...`.
6. **SVG validation**  
   Waliduj eksport wg `SVG_ASSET_STANDARDS.md` (m.in. viewBox, clean layers, brak bitmap/base64/font embed).
7. **Manifest update**  
   Zaktualizuj manifest evidence/passu i opisz status komponentow.
8. **Preview board/review**  
   Przeprowadz review wizualne i techniczne (preview/manual checks).
9. **Production candidate marking**  
   Oznacz komponenty jako production candidate dopiero po review i zgodnosci ze standardem.
10. **Osobny technical/runtime integration pass**  
   Integracja runtime (FrameComposer, mount contracts, fallback behavior) jest osobnym krokiem technicznym.

## 3. Active vs Evidence vs Legacy

- **Active (CURRENT)**: ten pipeline + `MODULAR_FRAME_KIT_FIGMA_PROMPT.md` + `SVG_ASSET_STANDARDS.md` + `SUB_META_COMPONENTS.md`.
- **Evidence/Review**: `SUB_META_FIGMA_ASSET_PASS_01.md`, `SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md`, `SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md` oraz odpowiadajace im notatki passow.
- **Legacy**: historyczne eksporty i audyty (np. `assets/visual/legacy/...`).

Figma evidence docs i legacy exports **nie sa aktywnym production kit** oraz **nie sa runtime source-of-truth**.

## 4. Zasady aktualizacji manifestu po przyszlym passie

Po kazdym nowym passie Figma/SVG:

1. Zaktualizuj wpisy komponentow i statusy (draft / review / production_candidate).
2. Oznacz pochodzenie passu (data, plik Figma, zakres zmian).
3. Rozdziel warstwy static base vs dynamic accents.
4. Potwierdz zgodnosc z `SVG_ASSET_STANDARDS.md`.
5. Nie oznaczaj komponentu jako production candidate bez preview/review.
6. Nie traktuj manifestow evidence jako runtime production manifestu bez osobnego passu integracyjnego.

## 5. Struktura katalogowa (referencyjna)

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
    cards/
      svg/
        state_accents/
    legacy/
```

## 6. Granice odpowiedzialnosci

- Ten dokument nie zmienia mechaniki kart, RP, sekwencji ani PRG.
- Ten dokument nie uruchamia runtime integration.
- Ten dokument porzadkuje pipeline dokumentacyjny przed kolejnym realnym passem Figma/SVG.


## Pipeline wariant: raster reference -> Inkscape master -> optional Figma fitting

Pipeline CURRENT nie wymusza Figma-first. Dopuszczona i wspierana jest sciezka:

1. raster reference generation (poza repo, np. ChatGPT) jako source/reference, nie runtime asset,
2. Inkscape vectorization + curve cleanup,
3. layered master frame assembly w Inkscape jako design source,
4. decyzja pipeline:
   - A) merged frame asset, albo
   - B) modular export do opcjonalnego Figma fitting,
5. (wariant B) Figma fitting: crop/fit, bounds, anchors, mount points, layout-board test,
6. SVG validation (`SVG_ASSET_STANDARDS.md`),
7. manifest/status update,
8. production_candidate marking po review,
9. future runtime/FrameComposer integration pass jako osobny etap.

FrameComposer modularization moze byc domknieta pozniej, gdy design sie ustabilizuje. Ta sciezka nie zmienia mechaniki i nie uruchamia runtime integration w tym samym kroku dokumentacyjnym.
