# docs/current/visual - mapa kierunku wizualnego

> Status: KIERUNEK
> Obszar: mapa kierunku wizualnego
> Źródło prawdy: TAK, dla kolejności czytania i ról dokumentów wizualnych
> Ostatnia aktualizacja: 2026-04-30
> Powiązane dokumenty: ../README.md, ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md

## 1. Cel katalogu

Katalog `docs/current/visual/` zawiera aktualny kierunek wizualny Haiku Cosmos i jest źródłem prawdy dla decyzji dotyczących oprawy graficznej, SUB-META, HUD, kart, ramek, materiałów i asset pipeline. Core visual direction pozostaje w trio: `ART_DIRECTION.md`, `KOSMOLOGIA_WIZUALNA.md`, `BIBLIOTEKA_MATERIALOW.md`.


## 2. Zalecana ścieżka czytania (execution-first)

1. `docs/current/visual/README.md`
2. `VISUAL_EXECUTION_GUIDE.md`
3. core visual direction: `ART_DIRECTION.md`, `KOSMOLOGIA_WIZUALNA.md`, `BIBLIOTEKA_MATERIALOW.md`
4. odpowiedni standard/pipeline zależnie od zadania (`MODULAR_FRAME_KIT.md`, `SVG_ASSET_STANDARDS.md`, `SUB_META_ASSET_PIPELINE.md`, `SUB_META_COMPONENTS.md`, `FIGMA_WORKFLOW.md`)

## 2. Minimalna kolejność czytania

Kierunek bazowy:

1. `ART_DIRECTION.md`
2. `KOSMOLOGIA_WIZUALNA.md`
3. `BIBLIOTEKA_MATERIALOW.md`

Przy pracach nad SUB-META, HUD, ramkami, slotami, ornamentami, glifami, liniami lub assetami:

4. `MODULAR_FRAME_KIT.md`
5. `MODULAR_FRAME_KIT_FIGMA_PROMPT.md` - gdy przygotowujesz nowy pass Figma
6. `SUB_META_COMPONENTS.md`
7. `SUB_META_ASSET_PIPELINE.md`
8. `SVG_ASSET_STANDARDS.md`
9. `FIGMA_WORKFLOW.md` - tylko przed użyciem Figma
10. `SUB_META_FIGMA_ASSET_PASS_01.md` - evidence historycznego passu
11. `SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md` - evidence cleanup + derived kit v0.2
12. `SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md` - evidence style correction + living ritual line v0.3

## 3. Rola dokumentów

- `ART_DIRECTION.md` - główny kierunek artystyczny i zasady wizualne.
- `KOSMOLOGIA_WIZUALNA.md` - porządek sensu, symboliki, materiału i pięciu stanów.
- `BIBLIOTEKA_MATERIALOW.md` - praktyczne zasady koloru, materiału i światła.
- `VISUAL_EXECUTION_GUIDE.md` - główny przewodnik wykonawczy visual/SVG/Figma po przeczytaniu core direction.
- `MODULAR_FRAME_KIT.md` - aktualny kierunek nowego modular frame kit i decyzja o legacy obecnego passu SVG.
- `MODULAR_FRAME_KIT_FIGMA_PROMPT.md` - prompt/spec wykonawczy dla następnego passu Figma.
- `MODULAR_FRAME_KIT_ASSET_MANIFEST.md` - evidence manifestu po audycie i lokalizacja legacy.
- `SUB_META_COMPONENTS.md` - katalog komponentów: frame parts, static base, dynamic accents, new-card marker, slot bridges.
- `SUB_META_ASSET_PIPELINE.md` - struktura katalogów, legacy/evidence policy i docelowy modular pipeline.
- `SVG_ASSET_STANDARDS.md` - roboczy standard wykonawczy SVG/frame parts, anchor metadata, naming, density i raster pipeline, w tym pass center-based dla SUB-META v2.
- `SUB_META_FIGMA_ASSET_PASS_01.md` - evidence poprzednich passów Figma i runtime review.
- `SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md` - evidence passu Figma MCP cleanup + derived modular frame/ornament kit v0.2.
- `SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md` - evidence passu Figma MCP style correction + source re-cut v0.3, przywracajacego zywa rytualna linie przy zachowaniu modularnosci.
- `FIGMA_WORKFLOW.md` - zasady pracy z Figma, gdy Figma jest używana.
- `SUB_META_FIGMA_PROMPT_TEMPLATE.md` - starszy prompt template, pomocniczy względem nowego frame kit promptu.
- `SUB_META_LINE_ORNAMENT_LIBRARY.md` - starsza biblioteka wykonawcza linii/ornamentów, pomocnicza stylistycznie.

## 4. Decyzja o aktualnym SVG pass

Pass `style_correction` z 2026-04 ma status:

- `LEGACY / EVIDENCE / STYLE EXPLORATION`;
- nie jest kanonem;
- nie jest produkcyjnym zestawem runtime;
- nie jest bazą dla FrameComposera.

Evidence znajduje się w `assets/visual/legacy/style_correction_2026_04/`.

Legacy SVG frame assets sa wylaczone jako produkcyjne assety. Modular Frame Kit v0.1 zostal wyeksportowany do repo, ale runtime integration i FrameComposer pozostaja osobnym future pass.

## 5. Aktualny Figma pass v0.1

Nowy modularny pass Figmy powstał w osobnym pliku:

- `Haiku Cosmos — Modular Frame Kit v0.1`
- File key: `1KsSouDlvB24HznqRPXUf5`
- URL: https://www.figma.com/design/1KsSouDlvB24HznqRPXUf5

Zawiera strony:

- `README / Rules`
- `SUB-META Astrolabe Kit`
- `HUD Minimal Sequence Kit`
- `Card State Accents`
- `Runtime Tinting Notes`
- `Mini Assembly Board`

Szczegóły evidence znajdują się w `SUB_META_FIGMA_ASSET_PASS_01.md`, sekcja `15. Modular Frame Kit Figma pass v0.1`.

SVG zostaly wyeksportowane do repo w trzech batchach:

- `assets/visual/submeta/svg/frame_parts/`
- `assets/visual/hud/svg/frame_parts/`
- `assets/visual/cards/svg/state_accents/`

Manifest zbiorczy: `assets/visual/modular_frame_kit_v01_manifest.json`.

Status: `exported_review_ready`; runtime integration i FrameComposer pozostaja osobnym future pass.

## 6. Figma cleanup + derived kit v0.2

Pass v0.2 powstal w pliku `ramka-v1` jako cleanup dwoch traced vector bases i derived component kit pod SUB-META v2.

- File key: `HSAtk0l6Udl5XZp28Ijesl`
- URL: https://www.figma.com/design/HSAtk0l6Udl5XZp28Ijesl/ramka-v1?node-id=3-19&t=2BKRKd76WaKHgSSE-0
- Evidence: `SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md`

Zakres:

- `70` komponentow Figma draft/evidence;
- `9` stron roboczych: README, source cleaned BIG/SMALL, derived kits, composition tests i inventory notes;
- neutral black stroke components bez image paints, effects i tekstu wewnatrz komponentow;
- metadata `haiku.framekit.v02` dla anchorow, mount sizes, bleed i rect contract.

Nie wykonano eksportu SVG do repo, runtime integration, Implement Design ani Code Connect.

## 7. Figma style correction + derived kit v0.3

Pass v0.3 powstal w tym samym pliku `ramka-v1` jako osobny style correction pass. v0.2 pozostaje evidence/technical baseline.

- File key: `HSAtk0l6Udl5XZp28Ijesl`
- URL: https://www.figma.com/design/HSAtk0l6Udl5XZp28Ijesl/ramka-v1
- Evidence: `SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md`

Zakres:

- `76` komponentow Figma draft/evidence;
- `9` nowych stron roboczych v0.3;
- roboczy stroke `#B8DDF0` na ciemnym tle review;
- zywsza linia: echo-lines, trailing strokes, tick marks, node rings i male gwiezdne markery;
- metadata `haiku.framekit.v03` dla center-based positioning, anchors, mount sizes, bleed i rect contract.

Nie wykonano eksportu SVG do repo, runtime integration, Implement Design ani Code Connect.

## 8. Czego nie robić

- Nie projektować wizualiów w oderwaniu od tych dokumentów.
- Nie zmieniać mechaniki systemów na podstawie dokumentów visual.
- Nie ratować obecnych monolitycznych ramek kosmetycznym przesuwaniem lub skalowaniem.
- Nie podpinać legacy SVG jako produkcyjnych assetów.
- Nie generować pełnych rasterów ani fontów w ramach frame kit.
- Nie robic pelnego FrameComposera przed review preview board i osobnym pure layout implementation pass.
