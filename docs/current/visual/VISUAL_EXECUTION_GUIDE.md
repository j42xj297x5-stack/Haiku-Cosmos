# VISUAL EXECUTION GUIDE

> Status: KIERUNEK / PRZEWODNIK WYKONAWCZY
> Obszar: visual / SVG / Figma / FrameComposer preparation
> Źródło prawdy:
> - TAK, dla kolejności pracy i zasad wykonawczych visual pipeline,
> - NIE, dla kanonu mechaniki,
> - NIE, dla finalnych assetów.
> Ostatnia aktualizacja: 2026-04-30
> Powiązane dokumenty: README.md, ART_DIRECTION.md, KOSMOLOGIA_WIZUALNA.md, BIBLIOTEKA_MATERIALOW.md, MODULAR_FRAME_KIT.md, SVG_ASSET_STANDARDS.md, SUB_META_ASSET_PIPELINE.md, SUB_META_COMPONENTS.md, FIGMA_WORKFLOW.md, ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md

## 1. Cel dokumentu

Ten dokument jest praktycznym przewodnikiem wykonawczym dla prac visual/SVG/Figma. Ma ułatwiać pracę:

- Codexowi,
- Figma MCP i agentom graficznym,
- osobom przygotowującym SVG,
- przyszłej integracji FrameComposer,
- projektowaniu ramek, gniazd, bridge lines, sequence markers i card state accents.

Dokument **nie zastępuje** rdzenia kierunku artystycznego (`ART_DIRECTION`, `KOSMOLOGIA_WIZUALNA`, `BIBLIOTEKA_MATERIALOW`) — porządkuje wykonanie i handoff.

## 2. Minimalna ścieżka czytania przed pracami visual

### A) Ogólny kierunek visual
1. `docs/current/visual/README.md`
2. `ART_DIRECTION.md`
3. `KOSMOLOGIA_WIZUALNA.md`
4. `BIBLIOTEKA_MATERIALOW.md`

### B) SVG / modular frame kit
1. `MODULAR_FRAME_KIT.md`
2. `SVG_ASSET_STANDARDS.md`
3. `SUB_META_ASSET_PIPELINE.md`
4. `SUB_META_COMPONENTS.md`

### C) Figma
1. `FIGMA_WORKFLOW.md`
2. `MODULAR_FRAME_KIT_FIGMA_PROMPT.md`
3. `SUB_META_FIGMA_*` i `MODULAR_FRAME_KIT_ASSET_MANIFEST.md` wyłącznie jako evidence/history/review

### D) SUB-META layout visual
1. stack `docs/current/ui/SUB_META_V2_*`
2. dokumenty technical dot. anchor/layout/FrameComposer
3. ten przewodnik jako zasady wykonania visual

### E) HUD / sequence markers
1. `docs/current/ui/UI_WORLD.md`
2. `MODULAR_FRAME_KIT.md`
3. `SVG_ASSET_STANDARDS.md`
4. technical runtime/evidence tylko gdy zadanie obejmuje implementację

## 3. Co jest kierunkiem, a co evidence

### Core visual direction (kierunek)
- `ART_DIRECTION.md`
- `KOSMOLOGIA_WIZUALNA.md`
- `BIBLIOTEKA_MATERIALOW.md`

### Standard wykonawczy / pipeline
- `MODULAR_FRAME_KIT.md`
- `SVG_ASSET_STANDARDS.md`
- `SUB_META_ASSET_PIPELINE.md`
- `SUB_META_COMPONENTS.md`

### Evidence / history / review
- `SUB_META_FIGMA_ASSET_PASS_01.md`
- `SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md`
- `SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md`
- `MODULAR_FRAME_KIT_ASSET_MANIFEST.md` (manifest istniejącego passu, nie finalny production source-of-truth)
- legacy style-correction (`assets/visual/legacy/style_correction_2026_04`) jako evidence/legacy, nie runtime production kit

## 4. Zasady projektowania nowych SVG (skrót wykonawczy)

Pełny standard: `SVG_ASSET_STANDARDS.md`.

Checklist skrótowa:
- tło transparentne,
- wymagany `viewBox`,
- brak bitmap/base64/embedded fonts,
- bez baked heavy glow/shadow,
- cienkie kreski,
- `vector-effect="non-scaling-stroke"` lub przygotowanie do post-processingu,
- rozdział warstw: `static_base` / `accent` / `state_layer`,
- anchor metadata (lub przygotowanie pod manifest anchorów),
- logiczne nazewnictwo komponentów,
- gotowość do runtime tinting,
- zachowanie pod różnymi gęstościami (density behavior).

## 5. Zasady projektowania ramek i ornamentów

- Projektuj modularne części, nie monolityczne pełne overlaye.
- Buduj słownik części: corners, edges, center ornaments, slot frames, bridge lines, resonance nodes.
- Preferuj cienką, żywą linię.
- Trzymaj rytualny minimalizm kosmiczny.
- SUB-META: rodzina astrolabialna/alchemiczna.
- HUD/sequence: rodzina minimal/sequence.
- Unikaj ciężkiego fantasy border.
- Unikaj agresywnego neonowego UI.
- Ornament ma wspierać decyzję i czytelność, nie dominować kompozycji.

## 6. Zasady Figma workflow

- Figma służy do projektowania źródłowych komponentów i review.
- Export SVG przechodzi walidację wykonawczą.
- Figma evidence nie jest automatycznie production source-of-truth.
- Prompt wykonawczy ma być oddzielony od evidence.
- Starsze prompt templates traktuj jako pomocnicze, nie jako aktualną instrukcję, jeśli ten guide i aktywne standardy je zastępują.
- Nie mieszaj traced vector bases z produkcyjnym kitem bez cleanupu.

## 7. Granice runtime / FrameComposer

Ten dokument:
- nie implementuje FrameComposer,
- nie zmienia runtime,
- nie zmienia mechaniki kart ani SUB-META,
- definiuje wymagania assetów i handoffu.

Integracja FrameComposer wymaga osobnego kroku technicznego i osobnej walidacji runtime.

## 8. Anti-patterns

Zakazane praktyki:
- monolityczna pełna rama jako jedyny asset,
- baked glow/shadow jako podstawowy efekt,
- raster w SVG,
- nieczytelne nazwy warstw,
- hardcoded kolory tam, gdzie wymagany jest runtime tinting,
- traktowanie evidence jako finalnego kanonu,
- projektowanie SUB-META jak zwykłego inventory UI,
- generic fantasy frame,
- agresywny neon sci-fi,
- CAD-owa sterylność bez rytmu i semantyki.

## 9. Output checklist dla nowego passu visual/SVG

- [ ] Czy asset jest modularny?
- [ ] Czy ma `viewBox`?
- [ ] Czy ma transparent background?
- [ ] Czy rozdziela `static` / `accent` / `state`?
- [ ] Czy ma anchor metadata lub przygotowane miejsce na manifest?
- [ ] Czy jest tintable?
- [ ] Czy nie zawiera bitmap/base64/fontów?
- [ ] Czy ma sensowną nazwę?
- [ ] Czy jest zgodny z ritual cosmic minimalism?
- [ ] Czy jasno oznaczono status: production candidate / evidence / legacy?

## 10. Statusy nowych visual docs/assets

Rekomendowane krótkie statusy:
- `KIERUNEK`
- `STANDARD WYKONAWCZY`
- `PROMPT WYKONAWCZY`
- `EVIDENCE`
- `REVIEW_READY`
- `PRODUCTION_CANDIDATE`
- `LEGACY / EVIDENCE`
- `NOT_INTEGRATED`
- `RUNTIME_INTEGRATED`

## 11. Następne kroki

Po tym przewodniku logiczna kolejność to:
1. cleanup promptów Figma,
2. uporządkowanie asset pipeline,
3. osobny `SUB_META_V2_MASTER_SPEC`,
4. osobny cleanup FrameComposer contract,
5. dopiero potem migracja zastąpionych dokumentów do `docs/legacy/`.


## Inkscape-first workflow

Aktualny workflow wykonawczy wspiera tryb **Inkscape-first**.

- **Inkscape** jest glownym narzedziem projektowania ornamentow, ramek i czystych krzywych SVG.
- **Figma** jest passsem nastepnym: fitting/review/composition (crop, alignment, bounds, layout board).
- Nie nalezy zakladac, ze wszystkie assety powstaja od zera w Figmie.
- Dla obu sciezek (Inkscape-first oraz Figma-generated) obowiazuja `SVG_ASSET_STANDARDS.md`: `viewBox`, transparent background, clean layers/groups, brak bitmap/base64/fontow, brak baked heavy glow, przygotowanie pod tinting i anchor metadata.

### Zalecana sciezka pracy

1. `visual/README.md`
2. `VISUAL_EXECUTION_GUIDE.md`
3. core visual docs (`ART_DIRECTION.md`, `KOSMOLOGIA_WIZUALNA.md`, `BIBLIOTEKA_MATERIALOW.md`, + dokument domenowy np. `MODULAR_FRAME_KIT.md`)
4. `SVG_ASSET_STANDARDS.md`
5. Inkscape design pass
6. SVG cleanup/export
7. Figma fitting/review pass
8. manifest/pipeline update
9. optional FrameComposer/runtime pass jako osobny etap
