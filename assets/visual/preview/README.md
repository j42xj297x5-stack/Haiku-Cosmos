# Modular Frame Kit v0.1 preview

Status: `static visual preview board`.

Source manifest: `assets/visual/modular_frame_kit_v01_manifest.json`.

Run from repo root:

```bash
python -m http.server 8123
```

Open:

```text
http://localhost:8123/assets/visual/preview/modular_frame_kit_v01_preview.html
```

## Scope

- SUB-META modular frame assembly from corners, edges, ornaments, separator, slot frame, resonance node and bridge line.
- HUD minimal kit preview with frame parts, RP mini frame, button frames and sequence markers.
- Card State Accents preview for the 6 exported state layers.
- CSS-only tinting simulation.

## Boundaries

- No runtime integration.
- No FrameComposer.
- No Figma MCP.
- No SVG edits.
- No PNG/WebP/JPG/font assets.

## Tinting limitation

The preview uses external SVG images. CSS filters and overlay colors can suggest red/yellow/green/blue/ether variants, but they do not deeply recolor SVG layers. True runtime tinting needs a later SVG preparation or inline/runtime SVG pass.


## FrameComposer sandbox (v0.1 infrastructure)

Open:

```text
http://localhost:8123/assets/visual/preview/frame_composer_sandbox.html
```

Scope:

- loads `hc.visual_assets.js` and `hc.frame_composer.js`;
- loads manifest `assets/visual/modular_frame_kit_v01_manifest.json`;
- preloads SUB-META astrolabe frame parts;
- computes pure layout and draws one test frame + debug anchors on canvas;
- does not use `cards.js` and does not integrate with production SUB-META rendering.


## SUB-META v2 wireframe preview

Open:

```text
http://localhost:8123/assets/visual/preview/submeta_v2_wireframe/submeta_v2_wireframe.html
```

Scope:

- low-fi desktop/tablet/mobile wireframe pass;
- semantic 9-zone map and center-based positioning legend;
- explicit placement placeholders for R2/R3/R4/DS;
- no runtime integration, no mechanics changes, no new graphic assets.
