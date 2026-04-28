# docs/current/visual - mapa kierunku wizualnego

> Status: KIERUNEK
> Obszar: mapa kierunku wizualnego
> Źródło prawdy: TAK, dla kolejności czytania i ról dokumentów wizualnych
> Ostatnia aktualizacja: 2026-04-28
> Powiązane dokumenty: ../README.md, ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md

## 1. Cel katalogu

Katalog `docs/current/visual/` zawiera aktualny kierunek wizualny Haiku Cosmos i jest źródłem prawdy dla decyzji dotyczących oprawy graficznej, SUB-META, HUD, kart, ramek, materiałów i asset pipeline.

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
8. `FIGMA_WORKFLOW.md` - tylko przed użyciem Figma
9. `SUB_META_FIGMA_ASSET_PASS_01.md` - evidence historycznego passu

## 3. Rola dokumentów

- `ART_DIRECTION.md` - główny kierunek artystyczny i zasady wizualne.
- `KOSMOLOGIA_WIZUALNA.md` - porządek sensu, symboliki, materiału i pięciu stanów.
- `BIBLIOTEKA_MATERIALOW.md` - praktyczne zasady koloru, materiału i światła.
- `MODULAR_FRAME_KIT.md` - aktualny kierunek nowego modular frame kit i decyzja o legacy obecnego passu SVG.
- `MODULAR_FRAME_KIT_FIGMA_PROMPT.md` - prompt/spec wykonawczy dla następnego passu Figma.
- `MODULAR_FRAME_KIT_ASSET_MANIFEST.md` - evidence manifestu po audycie i lokalizacja legacy.
- `SUB_META_COMPONENTS.md` - katalog komponentów: frame parts, static base, dynamic accents, new-card marker, slot bridges.
- `SUB_META_ASSET_PIPELINE.md` - struktura katalogów, legacy/evidence policy i docelowy modular pipeline.
- `SUB_META_FIGMA_ASSET_PASS_01.md` - evidence poprzednich passów Figma i runtime review.
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

## 6. Czego nie robić

- Nie projektować wizualiów w oderwaniu od tych dokumentów.
- Nie zmieniać mechaniki systemów na podstawie dokumentów visual.
- Nie ratować obecnych monolitycznych ramek kosmetycznym przesuwaniem lub skalowaniem.
- Nie podpinać legacy SVG jako produkcyjnych assetów.
- Nie generować pełnych rasterów ani fontów w ramach frame kit.
- Nie robic pelnego FrameComposera przed review preview board i osobnym pure layout implementation pass.
