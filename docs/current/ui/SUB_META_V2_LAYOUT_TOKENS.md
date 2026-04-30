> Status: ROBOCZY / APPENDIX DANYCH (NORMALIZED TOKENS)
> Obszar: SUB-META v2 / Layout Tokens v0.7
> Źródło prawdy: TAK, jako normalized layout data appendix v0.7; NIE, jako pełny master spec ani runtime integration
> Ostatnia aktualizacja: 2026-04-30
> Powiązane dokumenty: SUB_META_V2_FRAMECOMPOSER_CONTRACT.md, SUB_META_V2_MASTER_SPEC.md (dawny wireframe spec przeniesiony do docs/legacy/ui/), UI_WORLD.md, ../systems/SUB_META_SYSTEM.md, ../systems/CARDS_SYSTEM.md, ../systems/PRG_SYSTEM.md

# SUB-META v2 Layout Tokens v0.7 — normalized contract data

## 1. Cel

Dokument opisuje **znormalizowaną warstwę danych** dla layout contractu SUB-META v2.

Entrypoint semantyczny/layout pozostaje w `SUB_META_V2_MASTER_SPEC.md`. Active technical contract dla future FrameComposer pozostaje w `../technical/FRAME_COMPOSER_SPEC.md`. Ten dokument to appendix danych v0.7 (nie pełny master).

To jest pass repo-only:
- bez runtime integration,
- bez zmiany mechaniki,
- bez finalnego renderera.

v0.7 przepisuje opisowy handoff v0.6 na model tokenów gotowy do dalszego konsumowania przez future FrameComposer/SVG/Figma workflow.

## 2. Relacja do v0.6

- v0.6: opis anchor/rect handoff i stref.
- v0.7: ten sam sens layoutu, ale jako bardziej wykonawcze, znormalizowane dane.

Kompatybilność semantyczna:
- zachowane `submeta.*` stable IDs,
- zachowane role stref (PRG, ŚWIAT, core, inventory, forge, detail),
- zachowany rozdział mechaniki i warstwy prezentacji.

## 3. Coordinate system i jednostki

System znormalizowany:
- root width = `1.0`
- root height = `1.0`
- `x/y` liczone od lewego górnego rogu root layoutu.

Główny zapis geometryczny (preferowany):

```json
{
  "center": { "x": 0.50, "y": 0.50 },
  "size": { "w": 0.20, "h": 0.10 }
}
```

Dodatkowe zasady:
- wszystkie `center` i `size` używają zakresu `0..1`,
- rect tokeny są pochodne od center+size,
- recty są jawne dla czytelnego handoffu.

## 4. Struktura danych

Minimalny model:

```json
{
  "version": "0.7",
  "space": "root-normalized",
  "root": { "id": "submeta.root", "center": { "x": 0.5, "y": 0.5 }, "size": { "w": 1, "h": 1 } },
  "anchors": ["..."],
  "nodes": [
    {
      "id": "submeta.prg.axis.size",
      "parentId": "submeta.prg",
      "anchorId": "submeta.prg.axis.size.center",
      "center": { "x": 0.17, "y": 0.44 },
      "size": { "w": 0.09, "h": 0.25 },
      "rects": {
        "layoutRect": { "center": { "x": 0.17, "y": 0.44 }, "size": { "w": 0.09, "h": 0.25 } },
        "interactiveRect": { "center": { "x": 0.17, "y": 0.44 }, "size": { "w": 0.08, "h": 0.23 } },
        "visualMountRect": { "center": { "x": 0.17, "y": 0.44 }, "size": { "w": 0.10, "h": 0.27 } },
        "visualBleedRect": { "center": { "x": 0.17, "y": 0.44 }, "size": { "w": 0.12, "h": 0.30 } },
        "contentSafeRect": { "center": { "x": 0.17, "y": 0.44 }, "size": { "w": 0.07, "h": 0.20 } }
      }
    }
  ],
  "groups": ["..."],
  "connectors": ["..."]
}
```

## 5. Stable IDs i strefy

Minimum IDs utrzymane w v0.7:
- `submeta.root`
- `submeta.prg`
- `submeta.prg.axis.size`
- `submeta.prg.axis.glue`
- `submeta.prg.axis.speed`
- `submeta.prg.axis.objects`
- `submeta.prg.bridge.01`
- `submeta.prg.bridge.02`
- `submeta.prg.bridge.03`
- `submeta.world`
- `submeta.world.axis.form`
- `submeta.world.axis.intent`
- `submeta.world.axis.time`
- `submeta.world.axis.silence`
- `submeta.world.bridge.01`
- `submeta.world.bridge.02`
- `submeta.world.bridge.03`
- `submeta.core`
- `submeta.core.r4`
- `submeta.core.r3.left`
- `submeta.core.r3.right`
- `submeta.inventory`
- `submeta.inventory.ds`
- `submeta.forge`
- `submeta.detail`
- `submeta.detail.cardPreview`
- `submeta.detail.metadata`
- `submeta.detail.haiku`

## 6. Card group tokens

Każda grupa ma:
- `groupId`
- `parentId`
- `anchorId`
- `defaultOrientation`
- `childOrder`
- `cardAspectPolicy`
- `minGap`
- `scalePolicy`

Grupy:
1. PRG axis group — 4 osie (`R1 + ODB`),
2. PRG bridge group — `3xR2`,
3. WORLD axis group — 4 osie (`R1 + R1 + EXT`),
4. WORLD bridge group — `3xR2`,
5. CORE group — `R4 center`, `R3 left`, `R3 right`,
6. INVENTORY group — bank kart + DS,
7. FORGE group — `R1`, `sDR1`, `pDR1`,
8. DETAIL group — card preview + glyph + metadata + haiku.

## 7. Connector tokens

Minimalny model:
- `connectorId`
- `fromAnchor`
- `toAnchor`
- `kind`: `semantic | decorative | debug`
- `layer`: `connector`
- `avoidsInteractiveRects`: `true|false`
- `preferredPath`: `line | arc | bezier | radial`
- `state`: `inactive | available | active | blocked`

Minimum relacji:
- PRG bridge connectory,
- WORLD bridge connectory,
- PRG ↔ core,
- WORLD ↔ core,
- core ↔ inventory,
- inventory ↔ detail,
- forge ↔ inventory.

## 8. Skalowanie i polityki

- Layout skaluje się proporcjonalnie w przestrzeni `0..1`.
- Densyfikacja na mniejszych viewportach dotyczy gap/padding, nie semantyki stref.
- `cardAspectPolicy` pilnuje pionowych proporcji slotów kart.

## 9. Reguły walidacji

`validateSubmetaLayoutTokens(tokens)` powinno sprawdzać minimalnie:
1. Każdy node ma `id`.
2. Każdy node ma `anchorId` lub `center`.
3. Wszystkie liczby `center/size` i rect są w zakresie `0..1`.
4. `parentId` wskazuje istniejący parent (poza root).
5. `connector.fromAnchor` i `connector.toAnchor` istnieją w mapie anchorów.

## 10. Status

Ten kontrakt jest **repo-only normalized data handoff**.
Tokeny v0.7 nie są same w sobie runtime integration.
Aliasing/naming cleanup v0.6/v0.7 może wymagać osobnego future technical pass, jeśli będzie potrzebny w implementacji runtime.
