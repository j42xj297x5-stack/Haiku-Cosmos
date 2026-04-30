# SUB-META Figma Derived Frame Kit v0.3

> Status: EVIDENCE / FIGMA STYLE CORRECTION PASS
> Obszar: visual / Figma / modular frame kit / SUB-META v2
> Zrodlo prawdy: TAK dla evidence passu v0.3; NIE dla runtime asset manifestu
> Data: 2026-04-29
> Powiazane dokumenty: MODULAR_FRAME_KIT.md, SVG_ASSET_STANDARDS.md, FIGMA_WORKFLOW.md, ../technical/FRAME_COMPOSER_SPEC.md, ../technical/CENTER_BASED_POSITIONING_SPEC.md, ../ui/SUB_META_V2_MASTER_SPEC.md (dawny layout spec przeniesiony do docs/legacy/ui/)

## 1. Executive summary

Wykonano `Style correction + source cleanup pass v0.3` w Figmie dla pliku `ramka-v1`.

Charakter passu:

- Figma MCP: TAK.
- Implement Design: NIE.
- Code Connect: NIE.
- Runtime integration: NIE.
- Zmiany mechaniki: NIE.
- Eksport SVG do repo: NIE.
- Repo changes: docs-only.

Pass v0.3 jest korekta stylu wzgledem v0.2. v0.2 pozostaje evidence/technical baseline, ale nowy zestaw wraca blizej pierwszego zrodla: cienka zywa linia, rytualna geometria, os, astrolabialne markery, tick marks, trailing strokes i male gwiezdne znaczniki. Cleanup oznaczal usuniecie technicznego brudu i re-cut na moduly, nie sterylizacje do CAD/wireframe.

## 2. Figma source

- File: `ramka-v1`
- File key: `HSAtk0l6Udl5XZp28Ijesl`
- URL: https://www.figma.com/design/HSAtk0l6Udl5XZp28Ijesl/ramka-v1
- MAIN / BIG source: `node-id=0-1`, traced vector reference `2:10`
- SMALL source: `node-id=3-11`, traced vector reference `3:19`
- Working stroke used for v0.3 review: `#B8DDF0`
- Working background: dark review pages, not product palette
- Metadata namespace: `haiku.framekit.v03`

## 3. Pages created

Created v0.3 pages:

1. `README — Style Correction v0.3`
2. `SOURCE RE-CUT / CLEANED — BIG`
3. `SOURCE RE-CUT / CLEANED — SMALL`
4. `DERIVED KIT — MAIN FRAME v0.3`
5. `DERIVED KIT — SMALL PANEL v0.3`
6. `DERIVED KIT — SLOT / NODE / CONNECTOR v0.3`
7. `DERIVED KIT — CARD / FORGE / DETAIL SUPPORT v0.3`
8. `OPTIONAL COMPOSITION TESTS v0.3`
9. `EXPORT / INVENTORY NOTES v0.3`

v0.2 pages were not removed or overwritten.

## 4. What was cleaned / re-cut

BIG source was treated as the ceremonial language source:

- main corners;
- long living edges;
- top/bottom astrolabe ornaments;
- side-axis ornaments;
- central nodes and divider scales;
- larger panel boundaries.

SMALL source was treated as the compact utility language source:

- small corners;
- compact panel frames;
- button/capsule frames;
- horizontal and vertical separators;
- mini slots and sockets;
- node rings;
- mini connectors;
- resource/unlock marker patterns.

The pass did not preserve the raw traces as final assets. Instead, it re-cut the sources into modular vocabulary fragments and rebuilt derived parts with controlled bounds, center anchors and metadata.

## 5. Diagnosis of v0.2

v0.2 was useful as a technical baseline:

- it established page structure;
- it split the material into reusable families;
- it added anchor/mount metadata;
- it validated docs-only workflow without runtime integration.

But visually it moved too far toward:

- clean UI parts;
- technical wireframe;
- too-even lines;
- too-empty components;
- sterile panel boundaries.

v0.3 corrects this by restoring a living ritual line while keeping the component/anchor discipline from v0.2.

## 6. What changed in v0.3

Style correction:

- added echo-lines, trailing strokes, tick marks and small star markers;
- kept main geometry readable and centered;
- gave corners visible node/axis rhythm instead of plain UI corners;
- gave edges micro-rhythm and caps instead of single straight lines;
- made center ornaments feel like instruments/axis marks, not decoration for decoration.

Technical correction:

- all v0.3 components use vector strokes;
- no image paints inside v0.3 components;
- no effects/glow/shadows/gradients;
- no text nodes inside components;
- no black working stroke in v0.3 components;
- transparent component roots;
- shared metadata for center-based positioning, named anchors, bleed and export readiness.

## 7. Component count

Total v0.3 components: `76`.

Family counts:

- `main`: `20`
- `small`: `27`
- `slot`: `6`
- `node`: `7`
- `connector`: `9`
- `card`: `3`
- `detail`: `3`
- `forge`: `1`

## 8. Component inventory / export plan

Legend:

- `static_base`: stable base part.
- `tintable_accent`: future runtime tint layer candidate.
- `animatable_state_layer`: future animation/state layer candidate.
- Export status is `SVG candidate after design review` unless marked otherwise.

### Main frame kit

| Component | Family | Intended use | Anchor type | Layer type | Export readiness |
|---|---|---|---|---|---|
| `frame/main/corner/tl/v03` | main | main ceremonial frame corner | corner + center | static_base | SVG candidate after review |
| `frame/main/corner/tr/v03` | main | main ceremonial frame corner | corner + center | static_base | SVG candidate after review |
| `frame/main/corner/bl/v03` | main | main ceremonial frame corner | corner + center | static_base | SVG candidate after review |
| `frame/main/corner/br/v03` | main | main ceremonial frame corner | corner + center | static_base | SVG candidate after review |
| `frame/main/edge/top/v03` | main | living top edge | line + start/end | static_base | SVG candidate after review |
| `frame/main/edge/bottom/v03` | main | living bottom edge | line + start/end | static_base | SVG candidate after review |
| `frame/main/edge/left/v03` | main | living left edge | line + start/end | static_base | SVG candidate after review |
| `frame/main/edge/right/v03` | main | living right edge | line + start/end | static_base | SVG candidate after review |
| `frame/main/ornament/top-center/v03-a` | main | top ceremonial ornament | center + top line | static_base | SVG candidate after review |
| `frame/main/ornament/top-center/v03-b` | main | top ceremonial ornament | center + top line | static_base | SVG candidate after review |
| `frame/main/ornament/top-center/v03-c` | main | top ceremonial ornament | center + top line | static_base | SVG candidate after review |
| `frame/main/ornament/bottom-center/v03-a` | main | bottom stabilizer ornament | center + bottom line | static_base | SVG candidate after review |
| `frame/main/ornament/bottom-center/v03-b` | main | bottom stabilizer ornament | center + bottom line | static_base | SVG candidate after review |
| `frame/main/ornament/bottom-center/v03-c` | main | bottom stabilizer ornament | center + bottom line | static_base | SVG candidate after review |
| `frame/main/ornament/side-axis/v03-a` | main | side-axis ornament | center + vertical line | static_base | SVG candidate after review |
| `frame/main/ornament/side-axis/v03-b` | main | side-axis ornament | center + vertical line | static_base | SVG candidate after review |
| `frame/main/divider/h/v03-a` | main | horizontal divider | line + center | static_base | SVG candidate after review |
| `frame/main/divider/h/v03-b` | main | horizontal divider | line + center | static_base | SVG candidate after review |
| `frame/main/panel/v03-a` | main | large panel frame | center + corners + lines | static_base | SVG candidate after review |
| `frame/main/panel/v03-b` | main | large panel/core/detail frame | center + corners + lines | static_base | SVG candidate after review |

### Small panel kit

| Component | Family | Intended use | Anchor type | Layer type | Export readiness |
|---|---|---|---|---|---|
| `frame/small/corner/tl/v03` | small | compact corner | corner + center | static_base | SVG candidate after review |
| `frame/small/corner/tr/v03` | small | compact corner | corner + center | static_base | SVG candidate after review |
| `frame/small/corner/bl/v03` | small | compact corner | corner + center | static_base | SVG candidate after review |
| `frame/small/corner/br/v03` | small | compact corner | corner + center | static_base | SVG candidate after review |
| `frame/small/panel/v03-a` | small | small info panel | center + corners | static_base | SVG candidate after review |
| `frame/small/panel/v03-b` | small | square/utility panel | center + corners | static_base | SVG candidate after review |
| `frame/small/panel/v03-c` | small | low compact panel | center + corners | static_base | SVG candidate after review |
| `frame/small/panel/v03-d` | small | compact support panel | center + corners | static_base | SVG candidate after review |
| `frame/small/capsule/v03-a` | small | button/capsule frame | center + interactive rect | static_base | SVG candidate after review |
| `frame/small/capsule/v03-b` | small | button/capsule frame | center + interactive rect | static_base | SVG candidate after review |
| `frame/small/capsule/v03-c` | small | button/capsule frame | center + interactive rect | static_base | SVG candidate after review |
| `frame/small/separator/h/v03-a` | small | horizontal separator | line + center | static_base | SVG candidate after review |
| `frame/small/separator/h/v03-b` | small | horizontal separator | line + center | static_base | SVG candidate after review |
| `frame/small/separator/h/v03-c` | small | horizontal separator | line + center | static_base | SVG candidate after review |
| `frame/small/separator/h/v03-d` | small | horizontal separator | line + center | static_base | SVG candidate after review |
| `frame/small/separator/v/v03-a` | small | vertical separator | line + center | static_base | SVG candidate after review |
| `frame/small/separator/v/v03-b` | small | vertical separator | line + center | static_base | SVG candidate after review |
| `frame/small/separator/v/v03-c` | small | vertical separator | line + center | static_base | SVG candidate after review |
| `frame/small/ornament/center/v03-a` | small | small center ornament | center | static_base | SVG candidate after review |
| `frame/small/ornament/center/v03-b` | small | small center ornament | center | static_base | SVG candidate after review |
| `frame/small/ornament/center/v03-c` | small | small center ornament | center | static_base | SVG candidate after review |
| `frame/small/axis-marker/v03-a` | small | axis marker/cap | center + line | static_base | SVG candidate after review |
| `frame/small/axis-marker/v03-b` | small | axis marker/cap | center + line | static_base | SVG candidate after review |
| `frame/small/axis-marker/v03-c` | small | axis marker/cap | center + line | static_base | SVG candidate after review |
| `frame/small/mini-socket/v03-a` | small | mini socket | socket + card center | static_base | SVG candidate after review |
| `frame/small/mini-socket/v03-b` | small | mini socket | socket + card center | static_base | SVG candidate after review |
| `frame/small/mini-socket/v03-c` | small | mini socket | socket + card center | static_base | SVG candidate after review |

### Slot / node / connector kit

| Component | Family | Intended use | Anchor type | Layer type | Export readiness |
|---|---|---|---|---|---|
| `slot/socket/card/v03` | slot | card socket | socket + card center | static_base | SVG candidate after review |
| `slot/socket/core/v03` | slot | R4/core socket | socket + card center | static_base | SVG candidate after review |
| `slot/socket/resource/v03` | slot | resource socket | socket + card center | static_base | SVG candidate after review |
| `slot/ornament/micro/v03-a` | slot | micro slot ornament | center | tintable_accent | SVG candidate after review |
| `slot/ornament/micro/v03-b` | slot | micro slot ornament | center | tintable_accent | SVG candidate after review |
| `slot/ornament/micro/v03-c` | slot | micro slot ornament | center | tintable_accent | SVG candidate after review |
| `slot/node/ring/v03-a` | node | node ring | center + socket | tintable_accent | SVG candidate after review |
| `slot/node/ring/v03-b` | node | node ring | center + socket | tintable_accent | SVG candidate after review |
| `slot/node/ring/v03-c` | node | node ring | center + socket | tintable_accent | SVG candidate after review |
| `slot/bridge/short/v03` | connector | short R2 bridge | start/end + center | animatable_state_layer | SVG candidate after review |
| `slot/bridge/arc/v03` | connector | curved bridge | start/end + center | animatable_state_layer | SVG candidate after review |
| `slot/bridge/resonance/v03` | connector | resonance bridge | start/end + center | animatable_state_layer | SVG candidate after review |
| `slot/cap/start/v03` | connector | line start cap | start/end | tintable_accent | SVG candidate after review |
| `slot/cap/end/v03` | connector | line end cap | start/end | tintable_accent | SVG candidate after review |
| `slot/cap/axis/v03` | connector | axis cap | start/end | tintable_accent | SVG candidate after review |
| `slot/resonance/marker/v03-a` | node | resonance marker | center + core | tintable_accent | SVG candidate after review |
| `slot/resonance/marker/v03-b` | node | resonance marker | center + core | tintable_accent | SVG candidate after review |
| `slot/connector/mini/v03-a` | connector | mini connector | start/end + center | animatable_state_layer | SVG candidate after review |
| `slot/connector/mini/v03-b` | connector | mini connector | start/end + center | animatable_state_layer | SVG candidate after review |
| `slot/connector/mini/v03-c` | connector | mini connector | start/end + center | animatable_state_layer | SVG candidate after review |
| `slot/resource-marker/pattern/v03-a` | node | unlock/resource marker pattern | center + resource | tintable_accent | SVG candidate after review |
| `slot/resource-marker/pattern/v03-b` | node | unlock/resource marker pattern | center + resource | tintable_accent | SVG candidate after review |

### Card / forge / detail support kit

| Component | Family | Intended use | Anchor type | Layer type | Export readiness |
|---|---|---|---|---|---|
| `card/support/slot-frame/v03-a` | card | vertical card slot | card + socket center | static_base | SVG candidate after review |
| `card/support/slot-frame/v03-b` | card | taller card slot | card + socket center | static_base | SVG candidate after review |
| `card/support/detail-frame/v03` | detail | card detail preview frame | center + contentSafeRect | static_base | SVG candidate after review |
| `inventory/support/bank-frame/v03` | card | mini-card bank frame | center + contentSafeRect | static_base | SVG candidate after review |
| `forge/support/chain-frame/v03` | forge | forge chain/refinement support | center + slot centers | static_base | SVG candidate after review |
| `card/support/haiku-separator/v03` | detail | haiku/text separator | line + center | static_base | SVG candidate after review |
| `detail/support/info-frame/v03` | detail | detail/info support area | center + contentSafeRect | static_base | SVG candidate after review |

## 9. Composition tests

Created non-final assembly checks:

- `composition/info-panel-small/v03`
- `composition/button-capsule/v03`
- `composition/slot-bridge-test/v03`
- `composition/medium-submeta-panel/v03`
- `composition/card-detail-mini/v03`

These are only modularity/style tests. They are not a full SUB-META screen, not production layout, and not runtime integration.

## 10. Figma validation

Validation scope: v0.3 component set.

- v0.3 pages created: `9`
- v0.3 components: `76`
- image paints inside v0.3 components: `0`
- effects inside v0.3 components: `0`
- text nodes inside v0.3 components: `0`
- missing `haiku.framekit.v03` metadata: `0`
- black strokes inside v0.3 components: `0`
- non-vector image nodes inside v0.3 components: `0`

Notes:

- Original source pages in `ramka-v1` were left as source/evidence material.
- v0.3 components are vector-only and use the temporary cool review stroke `#B8DDF0`.
- No final product color palette was introduced.

## 11. Export status

SVG export to repo was intentionally not performed.

Current status:

- design-source status: `figma_review_ready`
- export status: `deferred_until_designer_review`
- runtime status: `not_integrated`
- mechanics status: `unchanged`

Future export should:

- export only reviewed components;
- preserve transparent backgrounds;
- check `viewBox`;
- reject bitmap `<image>`, `base64`, `data:image`, `@font-face`, baked filters/glow/shadows and embedded fonts;
- add or post-process `vector-effect="non-scaling-stroke"` where needed;
- map metadata into a manifest for FrameComposer.

## 12. Risks / further tuning

Remaining risks:

- some living-line variants may still need designer tuning for density at very small sizes;
- connector curvature and node ring weights should be reviewed in context with real SUB-META density;
- `#B8DDF0` is only a review color and must not be treated as final palette;
- components need SVG export QA before they can become runtime assets;
- FrameComposer mapping will need a separate manifest/pass.

## 13. Next logical step

Next pass should be a designer review of the v0.3 Figma pages followed by a small SVG export candidate batch, preferably:

1. main frame corners/edges;
2. one main panel frame;
3. one slot/socket;
4. one node ring;
5. one bridge/cap pair;
6. one card/detail support frame.

Only after that should repo SVG export, manifest work and any FrameComposer integration be considered.
