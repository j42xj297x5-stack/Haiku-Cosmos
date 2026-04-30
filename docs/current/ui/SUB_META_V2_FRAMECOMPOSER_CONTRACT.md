> Status: ROBOCZY / HANDOFF TECHNICZNY
> Obszar: SUB-META v2 / FrameComposer Layout Contract v0.6
> Źródło prawdy: NIE (spec implementacyjny repo-only, zgodny z kanonem systemowym)
> Ostatnia aktualizacja: 2026-04-29
> Powiązane dokumenty: SUB_META_V2_MASTER_SPEC.md (dawny wireframe spec przeniesiony do docs/legacy/ui/), UI_WORLD.md, ../systems/SUB_META_SYSTEM.md, ../systems/CARDS_SYSTEM.md, ../systems/PRG_SYSTEM.md, ../technical/CENTER_BASED_POSITIONING_SPEC.md

# SUB-META v2 FrameComposer Layout Contract v0.6 — anchor/rect handoff

## 1. Zakres i cel

Ten dokument jest **repo-only handoffem layout/contract** dla przyszłej implementacji SUB-META v2 przez FrameComposer/SVG/Figma workflow.

Poza zakresem:
- runtime integration,
- zmiana mechaniki,
- nowe assety,
- implementacja finalnego rendereru.

## 2. Główne strefy layoutu

1. `submeta.root` — root kompozycji (desktop/tablet), parent dla wszystkich stref.
2. `submeta.overlay` — warstwa nakładek (status/identity/navigation + debug).
3. `submeta.prg.wing` — skrzydło PRG.
4. `submeta.world.wing` — skrzydło ŚWIAT.
5. `submeta.core` — resonance core.
6. `submeta.inventory` — magazyn / bank kart, z DS w obrębie banku.
7. `submeta.forge` — kuźnia (łańcuch R1 → sDR1 → pDR1).
8. `submeta.detail` — inspektor karty / reader.
9. `submeta.connectors` — background geometry / connector layer.
10. `submeta.debug.overlay` — optional debug overlay layer.

## 3. Anchor IDs (stabilny naming)

### 3.1 Root / overlay
- `submeta.root.center`
- `submeta.overlay.top.left.center`
- `submeta.overlay.top.center.center`
- `submeta.overlay.top.right.center`

### 3.2 PRG wing
- `submeta.prg.center`
- `submeta.prg.axis.size.center`
- `submeta.prg.axis.glue.center`
- `submeta.prg.axis.speed.center`
- `submeta.prg.axis.objects.center`
- `submeta.prg.r2.bridge.01.center`
- `submeta.prg.r2.bridge.02.center`
- `submeta.prg.r2.bridge.03.center`

### 3.3 WORLD wing
- `submeta.world.center`
- `submeta.world.axis.form.center`
- `submeta.world.axis.intent.center`
- `submeta.world.axis.time.center`
- `submeta.world.axis.silence.center`
- `submeta.world.r2.bridge.01.center`
- `submeta.world.r2.bridge.02.center`
- `submeta.world.r2.bridge.03.center`

### 3.4 Core
- `submeta.core.center`
- `submeta.core.r4.center`
- `submeta.core.r3.left.center`
- `submeta.core.r3.right.center`

### 3.5 Inventory / forge / detail
- `submeta.inventory.center`
- `submeta.inventory.ds.row.center`
- `submeta.forge.center`
- `submeta.forge.chain.r1.center`
- `submeta.forge.chain.sdr1.center`
- `submeta.forge.chain.pdr1.center`
- `submeta.detail.center`
- `submeta.detail.cardPreview.center`
- `submeta.detail.textBlock.center`

## 4. Rect contract per strefa

Każda strefa musi mieć jawnie rozdzielone:
- `layoutRect` — udział w kompozycji,
- `interactiveRect` — hit area (click/hover/focus),
- `visualMountRect` — montaż ram/paneli/SVG,
- `visualBleedRect` — ornament/glow/connectors poza mount,
- `contentSafeRect` — bezpieczna przestrzeń kart i tekstu.

Reguła: `interactiveRect` nigdy nie może być przykryte przez dekoracyjny connector layer.

## 5. Mount center i pivot

1. Pozycjonowanie głównych assetów odbywa się przez center.
2. Domyślny `pivot` = `center`.
3. `left/top` jest wyjątkiem dla list tekstowych i contentu przewijalnego (np. detail text block).
4. FrameComposer dostaje minimum:
   - `anchor`,
   - `mountCenter`,
   - `mountSize`,
   - `visualSize`,
   - `bleed`.

## 6. Grupy kart

1. **PRG axis group**: 4 osie × (`R1` + `ODB`).
2. **PRG R2 bridge group**: 3 × `R2` po wewnętrznej stronie skrzydła.
3. **WORLD axis group**: 4 osie × (`R1` + `R1` + `EXT`).
4. **WORLD R2 bridge group**: 3 × `R2` po stronie wewnętrznej.
5. **CORE group**: `R4` centralnie + `R3` lewo/prawo.
6. **INVENTORY group**: bank kart zasobów, w tym `DS`.
7. **FORGE group**: chain `R1` → `sDR1` → `pDR1`.
8. **DETAIL group**: duża karta + glif + metadata + haiku.

## 7. Relacje parent/child

- `submeta.root`
  - `submeta.overlay`
  - `submeta.connectors`
  - `submeta.prg.wing`
    - `submeta.prg.axis.*`
    - `submeta.prg.r2.bridge.*`
  - `submeta.world.wing`
    - `submeta.world.axis.*`
    - `submeta.world.r2.bridge.*`
  - `submeta.core`
    - `submeta.core.r4`
    - `submeta.core.r3.left`
    - `submeta.core.r3.right`
  - `submeta.inventory`
  - `submeta.forge`
  - `submeta.detail`
  - `submeta.debug.overlay` (opcjonalnie)

## 8. Connectory

- Semantyczne connectory:
  - `PRG axis ↔ PRG R2`
  - `WORLD axis ↔ WORLD R2`
  - `PRG inner ↔ CORE ↔ WORLD inner`
- Dekoracyjne connectory:
  - tło geometryczne i resonance arcs, bez semantyki mechaniki.
- R2 tworzy **visual bridge** po stronie wewnętrznej skrzydeł.
- Connector layer jest oddzielony od card layer i nie może blokować `interactiveRect`.

## 9. Zasady skalowania

1. **Desktop wide** = primary preview.
2. **Tablet** = ten sam model semantyczny, większa kompresja stref.
3. **Mobile** = osobny future pass (nie w tym kroku).
4. Karty zachowują pionowe proporcje i nie są rozciągane losowo.
5. Ścieśnianie dotyczy gapów, marginesów i panel paddings, nie kształtu kart.
6. Minimalny odstęp między sąsiednimi `interactiveRect`: 8 px (preview baseline).

## 10. Minimalny model danych (JSON-like)

```json
{
  "id": "submeta.prg.axis.size",
  "kind": "zone",
  "parent": "submeta.prg.wing",
  "anchor": "submeta.prg.axis.size.center",
  "pivot": "center",
  "mountCenter": { "x": 0.17, "y": 0.44, "space": "root-normalized" },
  "mountSize": { "w": 0.07, "h": 0.25, "space": "root-normalized" },
  "visualSize": { "w": 0.08, "h": 0.28 },
  "bleed": { "top": 0.01, "right": 0.012, "bottom": 0.014, "left": 0.012 },
  "layoutRect": "rect(submeta.prg.axis.size.layout)",
  "interactiveRect": "rect(submeta.prg.axis.size.hit)",
  "visualMountRect": "rect(submeta.prg.axis.size.mount)",
  "visualBleedRect": "rect(submeta.prg.axis.size.bleed)",
  "contentSafeRect": "rect(submeta.prg.axis.size.safe)",
  "children": ["submeta.prg.axis.size.r1", "submeta.prg.axis.size.odb"]
}
```

## 11. Konflikty / doprecyzowania v0.5

- Preview v0.5 zawierała mieszane, krótkie chipy anchorów (`named:*`) — w v0.6 kontrakt stabilizuje pełne, hierarchiczne IDs.
- Preview v0.5 nie rozdzielała jawnie wszystkich rect typów per strefa — v0.6 wprowadza jednoznaczny rect handoff.
- Brak konfliktu z kanonem mechaniki: DS pozostaje w inventory, R4+R3 pozostają w core, R2 pozostają relacyjne.


## 12. Powiązanie z Layout Tokens v0.7

- Ten dokument (v0.6) pozostaje opisowym handoffem anchor/rect.
- Znormalizowana warstwa danych jest opisana w: `docs/current/ui/SUB_META_V2_LAYOUT_TOKENS.md`.
- v0.7 nie zmienia mechaniki ani runtime sequence; porządkuje tylko kontrakt danych pod future FrameComposer.
