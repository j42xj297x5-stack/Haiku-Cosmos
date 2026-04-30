# Haiku Cosmos - Modular Frame Kit Asset Manifest

> Status: EVIDENCE / MANIFEST LEGACY PASS / NOT PRODUCTION SOURCE-OF-TRUTH
> Zakres: SVG powiazane z audytem frame kitu `style_correction_2026_04`
> Ostatnia aktualizacja: 2026-04-30
> Źródło prawdy: TAK, dla lokalizacji legacy/evidence. NIE, dla aktywnego production manifestu.

## 0. WAŻNE OSTRZEŻENIE

- Ten dokument **nie jest aktywnym production manifestem**.
- Ten dokument **nie jest podstawa do runtime integration** bez osobnego review i pipeline cleanup.
- Aktywny pipeline wykonawczy opisuje `SUB_META_ASSET_PIPELINE.md`.
- Aktualny prompt wykonawczy opisuje `MODULAR_FRAME_KIT_FIGMA_PROMPT.md`.
- Runtime integration wymaga osobnego kroku technicznego.

## 1. Podsumowanie po reset review

Audyt objął 50 SVG:

- 30 lokalnych eksportów Figma `style_correction`;
- 20 runtime test assets z aktywnego `assets/visual`.

Po decyzji projektowej cały zestaw ma status:

- `LEGACY / EVIDENCE / STYLE EXPLORATION`;
- nie kanon;
- nie produkcja;
- nie baza do FrameComposera.

## 2. Aktualna lokalizacja

Wszystkie SVG z audytu przeniesiono do:

```text
assets/visual/legacy/style_correction_2026_04/
  figma_export/
  runtime_test_assets/
  README.md
```

Aktywne katalogi legacy `assets/visual/submeta/svg/frames`, `assets/visual/submeta/svg/glyphs`, `assets/visual/submeta/svg/lines`, `assets/visual/submeta/svg/placeholders` i `assets/visual/hud/svg/frames` nie zawieraja obecnie produkcyjnych SVG z passu `style_correction_2026_04`.

Modular Frame Kit v0.1 ma osobny manifest evidence/export:

```text
assets/visual/modular_frame_kit_v01_manifest.json
```

Ten manifest opisuje `35` nowych SVG jako `exported_review_ready`, ale runtime integration pozostaje niewykonana.

## 3. Grupy legacy

| grupa | lokalizacja | liczba SVG | status |
|---|---:|---:|---|
| Figma demo export | `assets/visual/legacy/style_correction_2026_04/figma_export/demo/style_correction/` | 1 | evidence |
| Figma HUD export | `assets/visual/legacy/style_correction_2026_04/figma_export/hud/style_correction/` | 5 | evidence |
| Figma SUB-META export | `assets/visual/legacy/style_correction_2026_04/figma_export/submeta/style_correction/` | 24 | evidence |
| Runtime HUD test assets | `assets/visual/legacy/style_correction_2026_04/runtime_test_assets/hud/svg/frames/` | 5 | evidence |
| Runtime SUB-META frame test assets | `assets/visual/legacy/style_correction_2026_04/runtime_test_assets/submeta/svg/frames/` | 7 | evidence |
| Runtime SUB-META glyph test assets | `assets/visual/legacy/style_correction_2026_04/runtime_test_assets/submeta/svg/glyphs/` | 4 | evidence |
| Runtime SUB-META line test assets | `assets/visual/legacy/style_correction_2026_04/runtime_test_assets/submeta/svg/lines/` | 3 | evidence |
| Runtime SUB-META placeholder evidence | `assets/visual/legacy/style_correction_2026_04/runtime_test_assets/submeta/svg/placeholders/` | 1 | evidence |

## 4. Problemy wykazane przez audyt

- Większość assetów to pełne monolityczne ramy.
- Duża część plików była duplikatem między Figma export i runtime assets.
- Wiele plików zawierało baked-in `filter`, glow lub shadow.
- Brakowało `vector-effect="non-scaling-stroke"`.
- Grupy i warstwy były niespójne.
- Stałe kolory utrudniały runtime tinting.

## 5. Aktywny manifest

`assets/visual/submeta/submeta_svg_manifest.json` jest obecnie pusty:

```json
{}
```

Runtime ma zachować fallback canvas/DOM i nie ładować legacy SVG jako produkcyjnych assetów.

## 6. Nastepny produkcyjny manifest

Nastepny manifest produkcyjny powinien powstac dopiero w osobnym FrameComposer/runtime integration pass. Nie nalezy podmieniac pustego `assets/visual/submeta/submeta_svg_manifest.json` na legacy SVG.

Nowy manifest ma mapować modular parts, np.:

- `submeta.frame_part.astrolabe.corner_tl_01`;
- `submeta.frame_part.astrolabe.edge_top_01`;
- `submeta.slot_frame.astrolabe.base_01`;
- `submeta.resonance_socket.sacred.base_01`;
- `submeta.bridge_line.sacred.base_01`;
- `hud.sequence_marker.minimal.base_01`;
- `card_state.new.pulse_layer_01`.
