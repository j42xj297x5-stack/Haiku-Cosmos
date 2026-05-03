# docs/current - mapa aktualnej dokumentacji

> Status: KANON
> Obszar: mapa aktualnej dokumentacji
> Źródło prawdy: TAK, dla struktury i statusów dokumentów w `docs/current/`
> Ostatnia aktualizacja: 2026-05-01
> Powiązane dokumenty: maps/PROJECT_INDEX.md, maps/DEPENDENCY_MAP.md, ../README.md, ../../README.md

Ten katalog zawiera aktualną dokumentację projektu.

## Warstwy dokumentacji `docs/current/`

### 1) maps
- `maps/PROJECT_INDEX.md` - **KANON** - główny indeks aktualnego kanonu i statusów dokumentów.
- `maps/DEPENDENCY_MAP.md` - **KANON** - kanoniczna mapa relacji między systemami, dokumentami i orientacyjnymi obszarami runtime.
- `README_ARCHITECT.md` - **ARCHITECT MEMORY / CURRENT** - skondensowany start rozmowy dla ChatGPT-architekta (entrypoint pamięci, nie zastępuje pełnego SoT).

### 2) systems
- `systems/CARDS_SYSTEM.md` - **KANON** - system kart, sekwencji i DS.
- `systems/ECONOMY_SYSTEM.md` - **KANON** - ekonomia RP i koszty działań.
- `systems/SUB_META_SYSTEM.md` - **KANON** - logika SUB-META i konfiguracja gałęzi.
- `systems/PRG_SYSTEM.md` - **KANON STRUKTURALNY** - struktura PRG (wymaga dalszego strojenia balansu).
- `systems/I18N_SYSTEM.md` - **KANON STRUKTURALNY** - zasady i18n (wdrożenie w toku).
- `systems/ROADMAP.md` - **ROBOCZY** - planowanie kolejnych etapów.

### 3) ui
- `ui/UI_WORLD.md` - **KANON** - nadrzędny kontrakt UI/HUD/SUB-META/META.
- `ui/HUD_SYSTEM.md` - **ROBOCZY / KIERUNEK HUD v2** - roboczy kierunek prawego panelu sekwencji, aktywacji i mikrodecyzji RUN.
- `ui/SUB_META_V2_MASTER_SPEC.md` - **ROBOCZY / MASTER SPEC UI-LAYOUT** - nadrzędny roboczy dokument SUB-META v2 dla layout/design handoff.
- `ui/SUB_META_V2_LAYOUT_TOKENS.md` - **ROBOCZY / SPEC-HISTORY INPUT** - źródło wejściowe do master spec.
- `ui/SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` - **ROBOCZY / SPEC-HISTORY INPUT** - źródło wejściowe do master spec.
- `ui/SUB_META_MEMORY_PACK.md` - **HANDOFF / ROBOCZY / SPEC-HISTORY INPUT** - pomocniczy handoff, nie główny master spec layoutu.

> Uwaga: `SUB_META_V2_LAYOUT_SPEC.md` i `SUB_META_V2_WIREFRAME_SPEC.md` zostały przeniesione do `docs/legacy/ui/` jako historyczne (zastąpione przez `SUB_META_V2_MASTER_SPEC.md`).
> `FRAME_COMPOSER_SPEC.md` jest aktywnym technical contractem dla future FrameComposer handoff.
> `SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` i `SUB_META_V2_LAYOUT_TOKENS.md` pozostają appendiksami SUB-META/data.
> Ten cleanup kontraktu nie zmienia runtime implementation.

### 4) visual
- `visual/README.md` - **KIERUNEK** - mapa czytania dokumentów wizualnych.
- `visual/ART_DIRECTION.md` - **KIERUNEK** - główna linia estetyczna.
- `visual/KOSMOLOGIA_WIZUALNA.md` - **KIERUNEK** - semantyka wizualna świata.
- `visual/BIBLIOTEKA_MATERIALOW.md` - **KIERUNEK** - materiały, faktury, palety.
- `visual/MODULAR_FRAME_KIT.md` - **KIERUNEK** - kierunek modular frame kit.
- `visual/SUB_META_COMPONENTS.md` - **KIERUNEK** - katalog rodzin komponentów.
- `visual/SUB_META_ASSET_PIPELINE.md` - **KIERUNEK** - docelowa organizacja aktywnych assetów.
- `visual/SVG_ASSET_STANDARDS.md` - **ROBOCZY** - standard wykonawczy SVG/raster.
- `visual/FIGMA_WORKFLOW.md` - **KIERUNEK** - workflow pracy Figma/Codex.
- `visual/FIGMA_FRAME_CUTTING_GUIDE.md` - **ROBOCZY / STANDARD WYKONAWCZY** - standard wykonawczy cięcia ramek w Figmie.
- `visual/MODULAR_FRAME_KIT_FIGMA_PROMPT.md` - **KIERUNEK** - prompt wykonawczy pod kolejne passy.
- `visual/SUB_META_FIGMA_BRIEF.md` - **KIERUNEK** - brief Figma dla SUB-META.
- `visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md` - **KIERUNEK** - starszy template promptowy.
- `visual/SUB_META_LINE_ORNAMENT_LIBRARY.md` - **KIERUNEK** - biblioteka linii/ornamentów.
- `visual/SUB_META_LAYOUT_SPEC.md` - **KIERUNEK** - layout projektowany pod Figma (nie runtime).
- `visual/SUB_META_RESPONSIVE_SCALING.md` - **KIERUNEK** - zasady skali i responsywności.
- `visual/SUB_META_TYPOGRAPHY.md` - **KIERUNEK** - kierunek typograficzny.
- `visual/MODULAR_FRAME_KIT_ASSET_MANIFEST.md` - **EVIDENCE** - manifest legacy/evidence.
- `visual/SUB_META_FIGMA_ASSET_PASS_01.md` - **EVIDENCE** - zapis passu Figma.
- `visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md` - **EVIDENCE** - cleanup/derived kit pass.
- `visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md` - **EVIDENCE** - style-correction pass.

### 5) technical
- `technical/README.md` - **ROBOCZY** - mapa dokumentów technicznych.
- `technical/WORLD_FUNCTION_MAP.md` - **ROBOCZY** - orientacyjna mapa runtime.
- `technical/CARD_VISUAL_ARCHITECTURE.md` - **ROBOCZY** - architektura card visuals i granic runtime.
- `technical/FONT_SYSTEM_SPEC.md` - **ROBOCZY** - kontrakt font systemu pod i18n/UI.
- `technical/FRAME_COMPOSER_SPEC.md` - **ROBOCZY** - kontrakt techniczny FrameComposer.
- `technical/SEQUENCE_STATE_CONTRACT.md` - **ROBOCZY** - kontrakt techniczny sekwencji.
- `technical/SUB_META_LAYOUT_ANCHOR_AUDIT.md` - **ROBOCZY / EVIDENCE** - audyt anchorów layoutu.
- `technical/CENTER_BASED_POSITIONING_SPEC.md` - **ROBOCZY** - kontrakt pozycjonowania visual layer.
- `technical/SUB_META_V2_BOX_AUDIT.md` - **ROBOCZY / EVIDENCE** - audyt stref i boxów SUB-META v2.
- `technical/IMPLEMENTATION_TRACKER.md` - **ROBOCZY** - tracker wdrożenia.
- `technical/LIVE_VALIDATION_PACK.md` - **ROBOCZY / EVIDENCE** - pakiet walidacji live.
- `technical/HUD_V2_RUNTIME_CONTRACT.md` - **ROBOCZY / KONTRAKT TECHNICZNY HUD v2** - mapowanie runtime HUD/sekwencji i plan etapowej implementacji.

### 6) workflow / handoff (poza `current/`)
- `../handoff/README.md` - **HANDOFF** - krótkie przekazania stanu po większych zmianach.
- `../audits/README.md` - **EVIDENCE** - audyty projektu (chronologiczne i tematyczne).
- `../legacy/README.md` - **LEGACY** - dokumenty historyczne/zastąpione.

## Zasady interpretacji

1. `docs/current/` = aktualne dokumenty projektowe i operacyjne.
2. `docs/legacy/` = historia, nie źródło prawdy.
3. `docs/audits/` = evidence/audyty, nie kanon.
4. `docs/handoff/` = krótkie przekazania stanu, nie pełna specyfikacja.
5. Evidence Figma i legacy manifesty assetów nie są aktywnym produkcyjnym source-of-truth dla runtime.
