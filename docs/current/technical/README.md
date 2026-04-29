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
> Ostatnia aktualizacja: 2026-04-28
> Powiązane dokumenty: ../README.md, ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md

Katalog `docs/current/technical/` zawiera dokumenty techniczne używane do pracy operacyjnej,
audytów i synchronizacji dokumentacji z runtime.

## Status dokumentów

- `WORLD_FUNCTION_MAP.md` — **ROBOCZY** (aktywna mapa techniczna orientacyjna; nie zastępuje pełnego audytu runtime)
- `SEQUENCE_STATE_CONTRACT.md` — **ROBOCZY / KONTRAKT TECHNICZNY** (single source-of-truth sekwencji + zasady evidence timeline)
- `IMPLEMENTATION_TRACKER.md` — **ROBOCZY** (tracker wdrożeń i obszarów do weryfikacji)
- `LIVE_VALIDATION_PACK.md` — **ROBOCZY** (roboczy kontrakt walidacji runów i evidence)
- `FRAME_COMPOSER_SPEC.md` - **ROBOCZY / KONTRAKT TECHNICZNY** (anchorOffset, ornamentScale, root frame runtime probe i layout modularnych SVG bez mechaniki; sekcja v0.1 implementation status)
- `CARD_VISUAL_ARCHITECTURE.md` - **ROBOCZY / ARCHITEKTURA TECHNICZNA** (rozdzial mechaniki kart, card visuals, FrameComposera i visual assets)
- `FONT_SYSTEM_SPEC.md` - **ROBOCZY / DO WDROZENIA** (font stack, rejestry typografii, przygotowanie pod i18n)
- `SUB_META_LAYOUT_ANCHOR_AUDIT.md` - **ROBOCZY / AUDYT LAYOUTU** (obecny layout SUB-META, extraction pass v0.1, mount points, `SubMetaLayoutAnchors`, mobile/density considerations)

## Zasady

1. Dokumenty techniczne nie nadpisują kanonu z `docs/current/systems/` i `docs/current/ui/`.
2. Status **DO AKTUALIZACJI** oznacza, że dokument nie może być traktowany jako pełne źródło prawdy.
3. Status **ROBOCZY** oznacza dokument operacyjny, utrzymywany na bieżąco, ale nadal niekanoniczny.
4. Dokumenty historyczne i migracyjne znajdują się w `docs/legacy/` oraz `docs/audits/`.


## Snapshot status (2026-04-26)

- Sequence core (3-hit, takeover, R-track, A-loop AA/AAA/DS) ma status PASS na testach i live evidence.
- Decision-window matrix ma status TESTED AUTOMATED PASS (audyt potwierdzony).
- HUD clarity pozostaje **NEXT / OUT_OF_SCOPE_UI_CLARITY** dla osobnego wątku UI.
