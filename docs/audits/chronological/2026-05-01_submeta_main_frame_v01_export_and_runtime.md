# 2026-05-01 - SUB-META Main Frame v01 Export And Runtime

## Scope

Export and runtime integration pass for the accepted SUB-META main frame from Figma.

Source:

- Figma URL: https://www.figma.com/design/r8qnYkRWULXAQ8wungoepR/Ramka-submeta-main?node-id=0-1&p=f&t=0W5ZdTrStLH5BLpL-0
- Page: `06_SEGMENTED_EDGE_FIX`
- Frame: `FRAME_REVIEW_SEGMENTED_STRUCTURE_CLEAN`

Accepted structure:

- 4 corners
- 4 center ornaments
- 8 connector segments
- 16 total runtime assets

## Export

New SVG directory:

- `assets/visual/submeta/svg/main_frame_v01/`

The SVG export uses transparent static-base vectors. Technical Figma anchor/debug layers were not exported as final art. The right center ornament is a separate handoff SVG with a mirror-X wrapper derived from the accepted Figma transform.

Validation target:

- each SVG has `viewBox`
- no `<image>`
- no `base64`
- no embedded font
- no baked filter
- no `__TECH` / `__DEBUG` markers

## Manifest

New manifest:

- `assets/visual/submeta/submeta_main_frame_v01_manifest.json`

Status:

- `runtime_candidate`

The manifest records logical names, file paths, categories, stretch axes, source Figma node IDs, anchor metadata and accepted bleed.

## Legacy Move

Legacy evidence directory:

- `assets/visual/legacy/submeta_frame_replaced_2026_05_01/`

Copied there:

- previous 4 astrolabe SUB-META root corners
- previous 4 astrolabe full edges
- previous 2 astrolabe center ornaments
- previous shared `modular_frame_kit_v01_manifest.json` snapshot

Not moved:

- HUD assets
- card assets
- slot/separator/bridge/resonance node assets
- old preview files

Reason: those assets are not replaced by `submeta_main_frame_v01` and some old preview/sandbox paths still reference the shared v0.1 kit.

## Runtime Integration

Changed modules:

- `hc.visual_assets.js`
- `hc.frame_composer.js`
- `cards.js`

Runtime path:

```text
renderSubMetaOverlay
  -> getSubMetaLayout()
  -> HC.SubMetaLayout.computeAnchors(layout)
  -> submeta.root_frame rect
  -> HC.FrameComposer.computeSubmetaMainFrameV01Layout(rect)
  -> HC.FrameComposer.drawSegmentedFrameParts(...)
```

`cards.js` now preloads the v01 manifest and a 16-part segmented part map. The old astrolabe composer functions remain available for sandbox/reference compatibility.

Gameplay boundaries:

- no card mechanics changes
- no RP cost changes
- no sequence changes
- no PRG behavior changes
- no hit rect changes

## Preview

New preview:

- `assets/visual/preview/submeta_main_frame_v01_preview.html`

It renders:

- clean frame variant
- debug frame variant
- frameLineRect
- contentSafeRect
- corner pivots
- ornament centers
- segment join points
- 16 asset status summary

## Tests

Commands run with bundled Node runtime:

```text
node --check hc.frame_composer.js
node --check cards.js
node --check hc.visual_assets.js
node tests/visual_validate_submeta_main_frame_v01.js
node tests/cards_sequence_a_loop_aa_aaa_ds.test.js
node tests/cards_sequence_decision_window_matrix.test.js
node tests/cards_sequence_diagnostic_events.test.js
node tests/cards_sequence_rtrack_takeover_smoke.test.js
```

Additional checks:

- FrameComposer v01 layout computed 8 segments, 4 corners, 4 ornaments and 16 join points.
- Local static server returned HTTP 200 for all 16 manifest asset paths.

Browser limitation:

- Playwright package was present, but Chromium binary was not installed.
- In-app browser runtime could not launch its Node bridge due OS access denial in this environment.
- Manual browser review should use the local preview URL.

## Risks

- Source vectors are traced/filled paths from an Inkscape/Figma cleanup chain.
- Corner bleed is accepted but not raster-shadow/glow final.
- Right center ornament uses a mirror-X handoff SVG wrapper.
- No final raster shadow/glow pass is included.
- Dynamic tinting/state layers are not part of this pass.
- Status is `runtime_candidate`, not final production lock.

## Next Step

Designer/runtime visual review in the app, then optional micro cleanup in SVG/Inkscape, then a separate raster shadow/glow pass or dynamic tint/state layer pass.
