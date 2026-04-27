# docs/current/visual — mapa kierunku wizualnego

> Status: KIERUNEK
> Obszar: mapa kierunku wizualnego
> Źródło prawdy: TAK, dla kolejności czytania i ról dokumentów wizualnych
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: ../README.md, ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md

## 1. Cel katalogu

Katalog `docs/current/visual/` zawiera aktualny kierunek wizualny Haiku Cosmos i jest źródłem prawdy dla decyzji dotyczących oprawy graficznej.

## 2. Jak czytać dokumenty

<<<<<<< Updated upstream
### 2.1. Kierunek bazowy (obowiązkowo)
=======
Minimalna kolejność dla ogólnego kierunku wizualnego:
>>>>>>> Stashed changes

1. `ART_DIRECTION.md`
2. `KOSMOLOGIA_WIZUALNA.md`
3. `BIBLIOTEKA_MATERIALOW.md`

<<<<<<< Updated upstream
### 2.2. Pakiet wykonawczy SUB-META / Figma

4. `FIGMA_WORKFLOW.md`
5. `SUB_META_FIGMA_BRIEF.md`
6. `SUB_META_LAYOUT_SPEC.md`
7. `SUB_META_COMPONENTS.md`
8. `SUB_META_ASSET_PIPELINE.md`
9. `SUB_META_TYPOGRAPHY.md`
10. `SUB_META_RESPONSIVE_SCALING.md`
11. `SUB_META_FIGMA_PROMPT_TEMPLATE.md`
=======
Przy pracach nad SUB-META, HUD, ramkami, liniami, ornamentami, slotami, placeholderami lub glifami czytaj dalej:

4. `SUB_META_LINE_ORNAMENT_LIBRARY.md`
5. `SUB_META_COMPONENTS.md`
6. `SUB_META_ASSET_PIPELINE.md`
7. `FIGMA_WORKFLOW.md`
8. `SUB_META_FIGMA_PROMPT_TEMPLATE.md`
>>>>>>> Stashed changes

## 3. Rola dokumentów

- `ART_DIRECTION.md` — główny kierunek artystyczny i zasady wizualne.
- `KOSMOLOGIA_WIZUALNA.md` — porządek sensu, symboliki, materiału i pięciu stanów.
- `BIBLIOTEKA_MATERIALOW.md` — praktyczne zasady koloru, materiału i światła w warstwach gry.
<<<<<<< Updated upstream
- `FIGMA_WORKFLOW.md` — workflow pracy Codexa z Figma oraz podział Figma pipeline vs raster pipeline.
- `SUB_META_FIGMA_BRIEF.md` — brief wykonawczy dla kierunku wizualnego SUB-META.
- `SUB_META_LAYOUT_SPEC.md` — wykonawcza specyfikacja układu SUB-META (16:9, bez głównego scrolla).
- `SUB_META_COMPONENTS.md` — biblioteka komponentów visual (etap 1: R1 + DS + sloty + panele).
- `SUB_META_ASSET_PIPELINE.md` — wykonawcza specyfikacja formatów i eksportów assetów (SVG/raster).
- `SUB_META_TYPOGRAPHY.md` — kierunek typografii (Inter/Cinzel/Noto Sans + fallbacki).
- `SUB_META_RESPONSIVE_SCALING.md` — zasady skalowania mobile → desktop → 4K.
- `SUB_META_FIGMA_PROMPT_TEMPLATE.md` — szablon promptu: krok 1 component/asset pass, krok 2 polished mockup.
=======
- `SUB_META_LINE_ORNAMENT_LIBRARY.md` — kierunek wykonawczy dla linii, ornamentów, ramek, slotów, placeholderów i glifów SUB-META + HUD.
- `SUB_META_COMPONENTS.md` — katalog rodzin komponentów SVG dla SUB-META, HUD i elementów współdzielonych.
- `SUB_META_ASSET_PIPELINE.md` — struktura katalogów, zasady eksportu SVG i nazewnictwo przyszłych assetów.
- `FIGMA_WORKFLOW.md` — workflow pracy w Figmie dla pierwszego passu komponentów.
- `SUB_META_FIGMA_PROMPT_TEMPLATE.md` — prompt do późniejszego zlecenia Figmie passu `SUB-META + HUD line/ornament asset pass`.
- `SUB_META_FIGMA_ASSET_PASS_01.md` — evidence pierwszego passu Figmy; komponenty SVG powstały w pliku Figma, ale lokalny eksport SVG do repo pozostaje osobnym krokiem.
- `MODULAR_FRAME_KIT.md` — audyt i zasady porządkowania modular frame kitu (SVG, katalogi, statusy).
- `MODULAR_FRAME_KIT_ASSET_MANIFEST.md` — manifest assetów frame kitu (type/layer/style/status).
>>>>>>> Stashed changes

## 4. Zasada statusu KIERUNEK

Status `KIERUNEK` oznacza obowiązujący kierunek projektowy. Nie jest to twarda specyfikacja mechaniki. Przy implementacji wizualnej Codex ma traktować te dokumenty jako podstawę.

## 5. Czego nie robić

- Nie projektować wizualiów w oderwaniu od tych dokumentów.
- Nie zmieniać stylu gry na agresywny neon / plastikowe sci-fi / typowy deckbuilder.
- Nie usuwać ciszy wizualnej.
- Nie rozdzielać kart, UI i świata na obce sobie style.
<<<<<<< Updated upstream
- Nie używać dokumentów visual do zmiany mechaniki systemów.
=======
- Nie generować pełnego mockupu SUB-META, rastrów ani runtime zmian w pierwszym pass komponentów SVG.
>>>>>>> Stashed changes
