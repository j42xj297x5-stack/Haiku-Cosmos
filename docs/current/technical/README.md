> Update 2026-06-19: `SPACE_MECHANICS_CONTRACT.md` dodaje roboczy kontrakt techniczny ciał kosmicznych dla Canvas2D/Three.js: direct planet impact przez `HC.Impact.resolvePlanetImpact`, wspólny snapshot/view-model oraz klasyfikację pól canonical/render-only/compatibility/deprecated.
> Update 2026-06-05: `WORLD_RENDERING_MODEL.md` zawiera snapshot Three GLB + external meteor textures: lokalny `GLTFLoader` jest aktywną ścieżką GLB dla meteorów/asteroid, cache przechowuje template per URL i klonuje instancje, zewnętrzne PNG `map`/`emissiveMap` dla `red`/`yellow` są cache’owane przez `TextureLoader`, imported GLB maps nie są nadpisywane, a fallback visual pozostaje tylko dla `loading`/`failed`.
> Update 2026-06-05: `WORLD_RENDERING_MODEL.md` zawiera checkpoint Three renderer + `stage_normalized` camera + `stage_spot_v1` lighting: Three jest domyślnym rendererem gry/debug, Canvas2D pozostaje legacy/fallback/mechanics verification, `mainStageSpot` jest jedynym głównym światłem scenicznym, legacy corner PointLight są usunięte z aktywnego runtime, debug overlay ma zwijane sekcje/global helpers, a evidence logging działa w trybie compact.
> Update 2026-06-04: `WORLD_RENDERING_MODEL.md` zawiera snapshot Three GLB PBR material pipeline po naprawie: `MeshStandardMaterial`/PBR zamiast `MeshBasicMaterial` dla obiektów światłoczułych, audyt 21 GLB bez tekstur/normalMap oraz wymagania bake/eksportu map z Blendera.
> Update 2026-06-04: `WORLD_RENDERING_MODEL.md` zawiera snapshot Three GLB meteor pass v0.1: aktywne pule 4x5 GLB, stabilny wariant per wrapper, GLB cache per URL, fallback circle, rotacja XYZ, live debug scale `0.25`-`4.0` i granice visual-only.
> Update 2026-06-04: `VITE_GITHUB_PAGES_DEPLOYMENT.md` zawiera snapshot po naprawie lokalnego Vite, GitHub Pages, base path `/Haiku-Cosmos/`, runtime script loading i hygiene zależności.
> Update 2026-04-29: `SUB_META_V2_BOX_AUDIT.md` dodaje pelny audit obecnego SUB-META boxu i mapowanie do 9 stref v2.
> Update 2026-04-29: `CENTER_BASED_POSITIONING_SPEC.md` definiuje kontrakt center-based positioning (mountCenter/mountSize/visualSize/bleed + named anchors).
# docs/current/technical

> Update 2026-04-28: `CARD_VISUAL_ARCHITECTURE.md` dodaje robocza architekture rozdzialu mechaniki kart, card visuals, FrameComposera i visual asset loadera.
> Update 2026-04-28: `FRAME_COMPOSER_SPEC.md` dodaje roboczy kontrakt techniczny dla anchorOffset, ornamentScale i modular SVG layout.
> Update 2026-04-28: `FONT_SYSTEM_SPEC.md` dodaje roboczy kontrakt typografii UI/kart pod i18n i mobile/desktop.
> Update 2026-04-28: `hc.visual_assets.js` i `hc.frame_composer.js` maja v0.1 implementation (repo-only, bez runtime integration) oraz sandbox review `assets/visual/preview/frame_composer_sandbox.html`.
> Update 2026-04-28: `SUB_META_LAYOUT_ANCHOR_AUDIT.md` mapuje obecny layout SUB-META i proponuje mount points / `SubMetaLayoutAnchors` przed integracja FrameComposera.
> Update 2026-04-28: `hc.submeta_layout.js` dodaje extraction pass v0.1: `HC.SubMetaLayout.compute(...)`, `computeAnchors(...)`, `computeWithAnchors(...)` i diagnostics bez zmiany mechaniki/renderingu.
> Update 2026-04-28: `cards.js` ma minimalny runtime probe `submeta.root_frame` przez `HC.FrameComposer` za flaga `FRAME_COMPOSER_SUBMETA_ROOT_ENABLED`.

> Status: ROBOCZY
> Obszar: mapa dokumentów technicznych
> Źródło prawdy: NIE (warstwa pomocnicza do kanonu)
> Ostatnia aktualizacja: 2026-06-19
> Powiązane dokumenty: ../README.md, ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md

Katalog `docs/current/technical/` zawiera dokumenty techniczne używane do pracy operacyjnej,
audytów i synchronizacji dokumentacji z runtime.

## Status dokumentów

- `DEBUG_SETTINGS_STANDARD.md` — **ROBOCZY / STANDARD TECHNICZNY DEBUG SETTINGS** (standard ładowania, importu i exportu ustawień debug/layout przez `public/settings/*.json` oraz mini panele debug)

- `WORLD_FUNCTION_MAP.md` — **ROBOCZY** (aktywna mapa techniczna orientacyjna; nie zastępuje pełnego audytu runtime)
- `SPACE_MECHANICS_CONTRACT.md` — **ROBOCZY / KONTRAKT TECHNICZNY** (kontrakt nowej mechaniki ciał kosmicznych: typy live, pola canonical/render-only/compatibility/deprecated, zakaz legacy planet capture oraz wspólny snapshot/view-model dla Canvas2D i Three.js)
- `WORLD_RENDERING_MODEL.md` — **ROBOCZY / KONTRAKT TECHNICZNY RENDERINGU ŚWIATA** (Three.js adapter, domyślny renderer Three dla gry/debug, Canvas2D jako legacy/fallback/mechanics verification, `stage_normalized` camera, `stage_spot_v1` lighting, debug overlay, compact evidence logging; obejmuje GLTFLoader jako aktywną ścieżkę GLB dla meteorów/asteroid, GLB template/clone cache, zewnętrzne palety PNG `map`/`emissiveMap` red/yellow przez `TextureLoader`, no-overwrite imported materials oraz fallback visual tylko dla `loading`/`failed`)
- `SEQUENCE_STATE_CONTRACT.md` — **ROBOCZY / KONTRAKT TECHNICZNY** (single source-of-truth sekwencji + zasady evidence timeline)
- `IMPLEMENTATION_TRACKER.md` — **ROBOCZY** (tracker wdrożeń i obszarów do weryfikacji)
- `LIVE_VALIDATION_PACK.md` — **ROBOCZY** (roboczy kontrakt walidacji runów i evidence)
- `HUD_V2_RUNTIME_CONTRACT.md` — **ROBOCZY / KONTRAKT TECHNICZNY HUD v2** (audyt runtime HUD/sekwencji, view-model i etapowanie wdrożenia bez zmiany mechaniki)
- `FRAME_COMPOSER_SPEC.md` - **ROBOCZY / KONTRAKT TECHNICZNY** (anchorOffset, ornamentScale, root frame runtime probe i layout modularnych SVG bez mechaniki; sekcja v0.1 implementation status)
- `CARD_VISUAL_ARCHITECTURE.md` - **ROBOCZY / ARCHITEKTURA TECHNICZNA** (rozdzial mechaniki kart, card visuals, FrameComposera i visual assets)
- `FONT_SYSTEM_SPEC.md` - **ROBOCZY / DO WDROZENIA** (font stack, rejestry typografii, przygotowanie pod i18n)
- `SUB_META_LAYOUT_ANCHOR_AUDIT.md` - **ROBOCZY / AUDYT LAYOUTU** (obecny layout SUB-META, extraction pass v0.1, mount points, `SubMetaLayoutAnchors`, mobile/density considerations)
- `SUB_META_V2_BOX_AUDIT.md` - **ROBOCZY / AUDYT PROJEKTOWO-TECHNICZNY** (pelny audit obecnego SUB-META boxu i mapowanie elementow do cockpit 9 stref)
- `CENTER_BASED_POSITIONING_SPEC.md` - **ROBOCZY / KONTRAKT TECHNICZNY VISUAL LAYOUT** (mountCenter/mountSize/visualSize/bleed + named anchors)

## Zasady

1. Dokumenty techniczne nie nadpisują kanonu z `docs/current/systems/` i `docs/current/ui/`.
2. Status **DO AKTUALIZACJI** oznacza, że dokument nie może być traktowany jako pełne źródło prawdy.
3. Status **ROBOCZY** oznacza dokument operacyjny, utrzymywany na bieżąco, ale nadal niekanoniczny.
4. Dokumenty historyczne i migracyjne znajdują się w `docs/legacy/` oraz `docs/audits/`.


## Snapshot status (2026-04-26)

- Sequence core (3-hit, takeover, R-track, A-loop AA/AAA/DS) ma status PASS na testach i live evidence.
- Decision-window matrix ma status TESTED AUTOMATED PASS (audyt potwierdzony).
- HUD clarity pozostaje **NEXT / OUT_OF_SCOPE_UI_CLARITY** dla osobnego wątku UI.


- 2026-05-17: `WORLD_RENDERING_MODEL.md` rozszerzono o status Etapu 2.75 (repo-controlled delivery point dla Three.js dependency, diagnostyka `threeDependencySource`, manualny fallback provisioning local vendor).

- 2026-05-17: WORLD_RENDERING_MODEL Etap 3 wdrożony — minimalny pass meteorów w Three.js działa na bazie snapshotu, przy zachowaniu fallbacku canvas2d.

- 2026-06-04: WORLD_RENDERING_MODEL Etap 4 wdrożony — pass asteroidów w Three.js działa na bazie `renderSnapshot.world.asteroids`, z cache meshów, diagnostyką liczników i bez zmian mechaniki.

- 2026-06-04: WORLD_RENDERING_MODEL utrwala snapshot Three GLB PBR material pipeline po commicie `f07c617`: runtime czyta PBR factory materiały GLB i debug controls, a aktualne `public/glb/*.glb` mają 21 materiałów, 12 z metalicznością, 0 tekstur i 0 normal map.

- 2026-06-05: WORLD_RENDERING_MODEL utrwala checkpoint po stabilizacji Three renderer / `stage_spot_v1` / compact logging: evidence final snapshot potwierdza `renderer effective=three`, `cameraModel=stage_normalized`, `lightingModelVersion=stage_spot_v1`, `mainStageSpot` jako jedyne główne światło, `removedLegacyCornerLights=true`, `activeLightCount=1`, `ambientEffectiveIntensity≈0.13`, `activeFallbackMeteorVisuals=0`, `globalHelpersEnabled=false`, `loggingMode=compact` i SUB-META logging contract `future_event_based_v1`.

- 2026-06-05: WORLD_RENDERING_MODEL utrwala snapshot Three GLB + external meteor textures: meteory i asteroidy GLB ładują się przez lokalny `GLTFLoader`, custom parser nie jest aktywną ścieżką runtime, GLB cache ma lifecycle `loading`/`ready`/`failed`, palety PNG `red`/`yellow` mają `map` i `emissiveMap`, a zewnętrzne mapy uzupełniają tylko brakujące sloty imported materiałów GLB.

## Deployment

- `VITE_GITHUB_PAGES_DEPLOYMENT.md` - **CURRENT** - konfiguracja Vite, base path `/Haiku-Cosmos/`, lokalny build/preview, legacy runtime sync do `public/runtime/`, poprawny URL `/Haiku-Cosmos/runtime/nazwa_pliku.js`, hygiene `node_modules`/`dist` i automatyczny deployment GitHub Pages z brancha `Haiku-Cosmos`.
