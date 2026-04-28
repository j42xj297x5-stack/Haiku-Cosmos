# Haiku Cosmos - SUB-META Figma Prompt Template

> Status: KIERUNEK / STARSZY PROMPT TEMPLATE
> Obszar: Figma / SUB-META / HUD / SVG components
> Zrodlo prawdy: POMOCNICZO dla starszych asset/component passow; NIE dla runtime i mechaniki
> Ostatnia aktualizacja: 2026-04-28
> Powiazane dokumenty: FIGMA_WORKFLOW.md, MODULAR_FRAME_KIT.md, MODULAR_FRAME_KIT_FIGMA_PROMPT.md, SUB_META_ASSET_PIPELINE.md, SUB_META_COMPONENTS.md

## 1. Status

Ten dokument jest starszym prompt template dla SUB-META/HUD asset pass.

Dla Modular Frame Kit v0.1 aktualny prompt/spec wykonawczy znajduje sie w:

```text
docs/current/visual/MODULAR_FRAME_KIT_FIGMA_PROMPT.md
```

Ten template moze byc nadal uzyty pomocniczo przy przyszlych Figma passach, ale nie nadpisuje decyzji Modular Frame Kit v0.1.

## 2. Prompt bazowy

```text
Create a Haiku Cosmos SUB-META + HUD vector asset pass in Figma.

Goal:
Build a vector component library, not a full runtime implementation and not a polished full-screen mockup.

The library should include scalable SVG-ready components for:
- SUB-META panel frame parts,
- card frame parts,
- slots,
- divider lines,
- connector / bridge lines,
- corner ornaments,
- center ornaments,
- subtle rosettes,
- astrolabe-like rings,
- HUD counter / button / sequence frame parts,
- axis / state glyphs,
- panel / card / slot placeholders.

Visual direction:
Ritual cosmic minimalism, astronomical instrument, quiet UI readability.
The result should feel like a cosmic configuration instrument, not decorative poster art.

Use inspirations structurally, not literally:
- astrolabe: circles, arcs, scale ticks, projection grids, star-point indicators,
- armillary sphere: intersecting rings and relationship logic,
- compass-and-straightedge geometry: modular corners, rosettes and border rhythm,
- subtle directional divisions and ring segmentation.

SVG requirements:
- clean vector geometry,
- transparent backgrounds,
- no bitmap backgrounds,
- no embedded images,
- no base64,
- no embedded fonts,
- no baked heavy glow/shadow,
- names compatible with later export and manifest mapping.

Do not:
- copy literal religious or historical symbols,
- create a full mandala,
- create tarot / fantasy card visuals,
- create cyberpunk neon UI,
- create a full SUB-META screen at this stage,
- generate raster backgrounds,
- add fonts,
- implement runtime,
- change mechanics.
```

## 3. Boundaries

- Figma pass tworzy komponenty i evidence.
- Eksport do repo jest osobnym krokiem.
- Runtime integration jest osobnym krokiem.
- FrameComposer, live-coloring i animacje sa future pass.
