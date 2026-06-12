# Haiku Cosmos - PROJECT_INDEX

> Status: KANON
> Obszar: mapa projektu / indeks dokumentacji aktualnej
> Źródło prawdy: TAK
> Ostatnia aktualizacja: 2026-06-12
> Powiązane dokumenty: ../../README.md, ../README.md, DEPENDENCY_MAP.md

## Rola dokumentu

`PROJECT_INDEX.md` jest indeksem aktualnego kanonu w ramach `docs/current/`.

Kanon jest mapowany warstwowo przez:

1. `README.md` w root,
2. `docs/README.md`,
3. `docs/current/README.md`,
4. `docs/current/maps/PROJECT_INDEX.md`,
5. `docs/current/maps/DEPENDENCY_MAP.md`.

## Mapy

- `docs/current/README.md` - mapa warstwy `docs/current/`.
- `docs/current/README_ARCHITECT.md` - **ARCHITECT MEMORY / CURRENT** - skondensowany entrypoint pamięci dla ChatGPT-architekta.
- `docs/current/maps/PROJECT_INDEX.md` - główny indeks bieżącego kanonu.
- `docs/current/maps/DEPENDENCY_MAP.md` - mapa relacji między systemami, dokumentami i orientacyjnymi obszarami kodu.

## Systemy gry

- `docs/current/systems/CARDS_SYSTEM.md` (KANON)
- `docs/current/systems/ECONOMY_SYSTEM.md` (KANON)
- `docs/current/systems/SUB_META_SYSTEM.md` (KANON)
- `docs/current/systems/PRG_SYSTEM.md` (KANON STRUKTURALNY / DO STROJENIA)
- `docs/current/systems/I18N_SYSTEM.md` (KANON STRUKTURALNY / DO WDROŻENIA)
- `docs/current/systems/ROADMAP.md` (ROBOCZY)

## UI / flow

- `docs/current/ui/UI_WORLD.md` (KANON)
- `docs/current/ui/HUD_SYSTEM.md` (ROBOCZY / KIERUNEK HUD v2)
- `docs/current/ui/SUB_META_RUNTIME_SNAPSHOT.md` (AKTYWNY SNAPSHOT RUNTIME / PNG + SETTINGS + PLACEHOLDERS + PANELS + DEBUG)
- `docs/current/ui/SUB_META_V2_MASTER_SPEC.md` (LEGACY/REFERENCE DLA RUNTIME / HISTORYCZNY DESIGN HANDOFF)
- `docs/current/ui/SUB_META_V2_LAYOUT_TOKENS.md` (ROBOCZY / SPEC-HISTORY INPUT)
- `docs/current/ui/SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` (ROBOCZY / SPEC-HISTORY INPUT)
- `docs/current/ui/SUB_META_MEMORY_PACK.md` (ROBOCZY / HANDOFF / SPEC-HISTORY INPUT)

## Visual

- `docs/current/visual/README.md` (KIERUNEK)
- `docs/current/visual/VISUAL_EXECUTION_GUIDE.md` (KIERUNEK / PRZEWODNIK WYKONAWCZY)
- `docs/current/visual/ART_DIRECTION.md` (KIERUNEK)
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md` (KIERUNEK)
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md` (KIERUNEK)
- `docs/current/visual/MODULAR_FRAME_KIT.md` (KIERUNEK / RESET PO AUDYCIE)
- `docs/current/visual/MODULAR_FRAME_KIT_FIGMA_PROMPT.md` (CURRENT / PROMPT WYKONAWCZY)
- `docs/current/visual/MODULAR_FRAME_KIT_ASSET_MANIFEST.md` (EVIDENCE / MANIFEST LEGACY / NOT PRODUCTION SOURCE-OF-TRUTH)
- `docs/current/visual/SUB_META_COMPONENTS.md` (KATALOG KOMPONENTOW / STATUSY)
- `docs/current/visual/SUB_META_ASSET_PIPELINE.md` (STANDARD PIPELINE / CURRENT)
- `docs/current/visual/SVG_ASSET_STANDARDS.md` (ROBOCZY / STANDARD WYKONAWCZY)
- `docs/current/visual/SUB_META_FIGMA_ASSET_PASS_01.md` (EVIDENCE / HISTORY / REVIEW)
- `docs/current/visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md` (EVIDENCE / HISTORY / REVIEW)
- `docs/current/visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md` (EVIDENCE / HISTORY / REVIEW)
- `docs/current/visual/SUB_META_FIGMA_BRIEF.md` (BRIEF POMOCNICZY / KONTEKSTOWY, czytać po guide + current prompt)
- `docs/current/visual/FIGMA_WORKFLOW.md` (KIERUNEK / WORKFLOW)
- `docs/current/visual/FIGMA_FRAME_CUTTING_GUIDE.md` (ROBOCZY / STANDARD WYKONAWCZY) - standard cięcia ramek w Figmie na modularne części SVG
- `docs/current/visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md` (REFERENCE TEMPLATE / POMOCNICZY, NIE CURRENT EXECUTION)
- `docs/current/visual/SUB_META_LINE_ORNAMENT_LIBRARY.md` (KIERUNEK / BIBLIOTEKA POMOCNICZA)

## Techniczne

- `docs/current/technical/README.md` (ROBOCZY)
- `docs/current/technical/WORLD_FUNCTION_MAP.md` (ROBOCZY)
- `docs/current/technical/WORLD_RENDERING_MODEL.md` (ROBOCZY / KONTRAKT TECHNICZNY RENDERINGU ŚWIATA; zawiera checkpoint 2026-06-05: Three jako domyślny renderer gry/debug, Canvas2D legacy/fallback, `stage_normalized` camera, `stage_spot_v1` lighting z `mainStageSpot`, debug overlay/global helpers, compact evidence logging, SUB-META logging contract `future_event_based_v1` oraz snapshot Three GLB + external meteor textures: aktywny lokalny `GLTFLoader` dla meteorów/asteroid, cache template/clone GLB, cache PNG `map`/`emissiveMap` red/yellow przez `TextureLoader`, no-overwrite imported GLB materials i runtime asset policy)
- `docs/current/technical/CARD_VISUAL_ARCHITECTURE.md` (ROBOCZY / ARCHITEKTURA TECHNICZNA)
- `docs/current/technical/FONT_SYSTEM_SPEC.md` (ROBOCZY / DO WDROZENIA)
- `docs/current/technical/FRAME_COMPOSER_SPEC.md` (LEGACY/REFERENCE DLA SUB-META; może być używany poza tym runtime tylko po osobnej decyzji)
- `docs/current/technical/SUB_META_LAYOUT_ANCHOR_AUDIT.md` (ROBOCZY / AUDYT LAYOUTU)
- `docs/current/technical/SUB_META_V2_BOX_AUDIT.md` (ROBOCZY / AUDYT PROJEKTOWO-TECHNICZNY)
- `docs/current/technical/CENTER_BASED_POSITIONING_SPEC.md` (ROBOCZY / KONTRAKT TECHNICZNY VISUAL LAYOUT)
- `docs/current/technical/IMPLEMENTATION_TRACKER.md` (ROBOCZY)
- `docs/current/technical/LIVE_VALIDATION_PACK.md` (ROBOCZY)
- `docs/current/technical/HUD_V2_RUNTIME_CONTRACT.md` (ROBOCZY / KONTRAKT TECHNICZNY HUD v2)

## Aktywna ścieżka runtime SUB-META

- Source-of-truth: `docs/current/ui/SUB_META_RUNTIME_SNAPSHOT.md`.
- Runtime: `hc.submeta_png.js`, `hc.submeta_placeholders.js`, `hc.submeta_panels.js`, `hc.submeta_settings.js`, `hc.ui_debug.js`.
- Settings: `public/settings/submeta-png-layout-export.json`, `public/settings/submeta-placeholders.json`, `public/settings/submeta-placeholders-panels.json`.
- Assets kart: `public/svg/` oraz `public/png/cards/`.
- Stare canvasowe SUB-META, FrameComposer, Figma oraz konfliktujące specy/wireframe’y są legacy/reference dla bieżącego runtime.

## Zasady użycia indeksu

- `docs/current/` ma pierwszeństwo projektowe względem dokumentów historycznych.
- `docs/legacy/` i audyty historyczne są evidence, nie kanonem.
- `targets_system`, `HAIKU_EDITOR`, `CODEX_START`, `CODEX_PATCHPOINTS`, `haiku_cosmos_agents` są dokumentami legacy i nie są aktywną specyfikacją.
- Obecny pass SVG `style_correction_2026_04` jest evidence w `assets/visual/legacy/`, nie aktywnym zestawem produkcyjnym.
- Modular Frame Kit v0.1 ma manifest evidence/export w `assets/visual/modular_frame_kit_v01_manifest.json`; runtime integration pozostaje future pass.
- Modular Frame Kit v0.2 ma evidence w `docs/current/visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md`; to Figma-only cleanup + derived kit pass bez eksportu SVG i bez runtime integration.
- Modular Frame Kit v0.3 ma evidence w `docs/current/visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md`; to Figma-only style correction + source re-cut pass z zywa rytualna linia, bez eksportu SVG i bez runtime integration.
- `FRAME_COMPOSER_SPEC.md` opisuje historyczny kontrakt modularnych SVG (`anchorOffset`, `lineInset`, `ornamentScale`); dla SUB-META jest legacy/reference, nie aktywnym runtime.
- `SVG_ASSET_STANDARDS.md` opisuje standard wykonawczy dla przyszlych SVG/rastrow: anchor metadata, nazewnictwo, statusy static/tintable/animatable i density.
- `SUB_META_LAYOUT_ANCHOR_AUDIT.md` mapuje obecny layout SUB-META w `cards.js` i opisuje extraction pass v0.1 / kontrakt `SubMetaLayoutAnchors`.
- `hc.submeta_layout.js` udostepnia runtime namespace `HC.SubMetaLayout` dla czystego layoutu SUB-META, density i mount points; produkcyjny FrameComposer jest podlaczony tylko jako `submeta.root_frame` probe za flaga.
- `assets/visual/preview/frame_composer_sandbox.html` to manualny sandbox review dla `HC.VisualAssets` + `HC.FrameComposer` bez integracji runtime.
- `SUB_META_V2_MASTER_SPEC.md` jest historycznym dokumentem layout/design handoff; aktywny runtime opisuje `SUB_META_RUNTIME_SNAPSHOT.md`.
- `SUB_META_V2_LAYOUT_SPEC.md` i `SUB_META_V2_WIREFRAME_SPEC.md` zostały przeniesione do `docs/legacy/ui/` jako dokumenty historyczne zastąpione przez `SUB_META_V2_MASTER_SPEC.md`.
- `FRAME_COMPOSER_SPEC.md`, `SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` i `SUB_META_V2_LAYOUT_TOKENS.md` pozostają legacy/reference dla SUB-META i nie wyznaczają bieżącej implementacji runtime.
- `SUB_META_MEMORY_PACK.md` pozostaje w `docs/current/ui/` jako pomocniczy handoff/memory pack (nie główny entrypoint layoutu).
- Dokumenty evidence Figma (`SUB_META_FIGMA_*`) oraz manifesty legacy/evidence (`MODULAR_FRAME_KIT_ASSET_MANIFEST.md`) nie są aktywnym produkcyjnym source-of-truth dla runtime.


## Aktualizacja workflow visual (2026-04-30)

- `VISUAL_EXECUTION_GUIDE.md` obsluguje wariant **raster-first -> Inkscape layered master -> optional Figma fitting/review**.
- Sciezka visual dopuszcza decyzje po zlozeniu ramki glownej: merged asset albo modular export do Figma fitting/anchors.
- `MODULAR_FRAME_KIT_FIGMA_PROMPT.md` jest current dla zadan Figma i nie jest wymagany dla raster-first/Inkscape-only design pass.
- `FIGMA_FRAME_CUTTING_GUIDE.md` jest obowiązkowy dla recut/cutting ramek w Figmie; uzupełnia `FIGMA_WORKFLOW.md`, `MODULAR_FRAME_KIT.md` i `SVG_ASSET_STANDARDS.md`, ale nie jest kanonem mechaniki, runtime implementation ani finalnym manifestem assetów.
- `SVG_ASSET_STANDARDS.md` pozostaje obowiazkowym standardem, gdy assety trafiaja do repo/production-candidate flow.
