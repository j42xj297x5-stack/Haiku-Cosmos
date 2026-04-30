> Uwaga (2026-04-30): Ten prompt dotyczy zadan Figma-generated/fitting. Dla recznie rysowanych assetow Inkscape-first obowiazuje `VISUAL_EXECUTION_GUIDE.md` + `SVG_ASSET_STANDARDS.md`.

# Haiku Cosmos - Modular Frame Kit Figma Prompt

> Status: PROMPT WYKONAWCZY / CURRENT
> Obszar: visual / Figma / modular frame kit / SVG preparation
> Źródło prawdy:
> - TAK, jako aktualna instrukcja wykonawcza dla kolejnego passu Figma modular frame kit,
> - NIE, dla kanonu mechaniki,
> - NIE, dla finalnych assetów runtime.
> Ostatnia aktualizacja: 2026-04-30
> Powiązane dokumenty: VISUAL_EXECUTION_GUIDE.md, MODULAR_FRAME_KIT.md, SVG_ASSET_STANDARDS.md, SUB_META_ASSET_PIPELINE.md, FIGMA_WORKFLOW.md, ART_DIRECTION.md, KOSMOLOGIA_WIZUALNA.md, BIBLIOTEKA_MATERIALOW.md

## A) Zadanie dla Figma

Przygotuj **kolejny pass komponentów modular frame kit** jako source design do przyszłego eksportu SVG.

Zakres:
- modular parts, nie pełne overlaye;
- przygotowanie pod review i przyszły FrameComposer;
- bez integracji runtime.

## B) Zakazy

- Nie twórz monolitycznych full-frame overlayów jako głównego deliverable.
- Nie dodawaj rasterów, `<image>`, base64 ani embedded fontów.
- Nie bake'uj ciężkiego glow/shadow jako warstwy bazowej.
- Nie traktuj evidence (`SUB_META_FIGMA_*`, legacy passów) jako production source-of-truth.
- Nie implementuj runtime, mechaniki, FrameComposer integration ani Code Connect.

## C) Wymagane komponenty

### 1) SUB-META astrolabe kit
- `corner_tl/tr/bl/br`
- `edge_top/bottom/left/right`
- `ornament_top_center`, `ornament_bottom_center`
- `divider_h`
- `slot_frame`
- `resonance_socket`
- `bridge_line`

### 2) HUD minimal/sequence kit
- `corner_tl/tr/bl/br`
- `edge_top/bottom/left/right`
- `sequence_marker`
- `rp_mini_frame`
- `submeta_button_frame`

### 3) Card state accents
- `r1_active_accent`
- `ds_active_accent`
- `new_card_pulse_layer`
- `seen_card_stable_layer`

## D) Zasady stylu

- Rytualny minimalizm kosmiczny: cienka, żywa linia i czytelna geometria.
- Dużo oddechu, bez ciężkiego fantasy border i bez agresywnego neonu.
- Rozdziel warstwy na: `static_base`, `accent`, `state_layer`.
- Bazę utrzymuj neutralną; kolor osi traktuj jako accent/state (runtime tinting readiness).

## E) Zasady techniczne SVG-ready

- transparent background;
- clean layer/group names;
- predictable bounds + viewBox readiness;
- preferowane przygotowanie pod `vector-effect="non-scaling-stroke"`;
- brak raster/base64/fonts;
- brak baked heavy glow/shadow;
- anchor/mount metadata readiness (`anchorType`, `anchorOffset`, `lineInset`, `safeMinSize`, `densityBehavior`).

## F) Output / expected report

Raport po passie ma zawierać:
1. Executive summary.
2. File key + URL.
3. Listę stron i listę komponentów (z podziałem na rodziny).
4. Potwierdzenie rozdziału `static_base` / `accent` / `state_layer`.
5. Potwierdzenie zakazów technicznych (no raster/base64/fonts, no heavy baked effects).
6. Status komponentów: `review_ready`, `evidence`, `needs_cleanup`.
7. Czego nie wykonano (np. runtime integration, eksport SVG, FrameComposer).
8. Następny krok: SVG export validation i manifest/pipeline update.
