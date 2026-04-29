> Status: ROBOCZY / SPEC WIREFRAME
> Obszar: SUB-META v2 / low-fi layout preview
> Źródło prawdy: NIE (roboczy etap przed polished design i runtime)
> Ostatnia aktualizacja: 2026-04-29 (composition v0.5)
> Powiązane dokumenty: UI_WORLD.md, SUB_META_V2_LAYOUT_SPEC.md, ../technical/SUB_META_V2_BOX_AUDIT.md, ../technical/CENTER_BASED_POSITIONING_SPEC.md

# SUB-META v2 — Wireframe spec (desktop/tablet/mobile)

## Cel

Wireframe repo-only weryfikuje układ 9 stref jako cockpit resonance system bez zmiany mechaniki, kosztów RP i runtime behavior.

## Preview

- Ścieżka: `assets/visual/preview/submeta_v2_wireframe/submeta_v2_wireframe.html`
- URL lokalny: `http://localhost:8123/assets/visual/preview/submeta_v2_wireframe/submeta_v2_wireframe.html`

## Composition v0.5 — anchor-aware concept pass

- 9 stref pozostaje semantyką architektury, ale layout nie czyta się jako tabela 3×3.
- Kompozycja utrzymuje symetrię skrzydeł: PRG po lewej i ŚWIAT po prawej, z silnym resonance core między nimi.
- Wszystkie główne sloty kart są pionowe; magazyn używa mniejszych, cieńszych placeholderów dla gęstszego banku zasobów.
- PRG: 4 osie `R1 + ODB` oraz 3 sloty `R2` po wewnętrznej stronie skrzydła.
- ŚWIAT: 4 osie `R1 + R1 + EXT` oraz 3 sloty `R2` po stronie wewnętrznej przy rdzeniu.
- Rdzeń: `R4` centralnie + 2x`R3` jako boczne orbiter cards; DS nie jest elementem centrum.
- DS pojawia się w `inventory bank` jako zasób, zgodnie z nowym rozdziałem semantycznym.
- Kuźnia jest funkcjonalnym mini-workspace i pokazuje 3:1 chain placeholderów (`R1`, `sDR1`, `pDR1`).
- Card detail działa jako czytnik: duży pionowy placeholder karty, obszar glifu, metadata, opis i sekcja haiku.

## Kontrakt wdrożeniowy (future implementation aware)

Preview i spec jawnie utrzymują kierunek pod dalszą implementację:

1. **Center-based positioning**
   - kluczowe strefy mają czytelne `mountCenter`, `pivot:center`, docelowe `mountSize` i miejsce na `visual bleed`.
2. **Named anchors**
   - strefy i elementy rdzenia mają konsekwentne anchor logic (np. `core.r4`, `prg.wing.inner`, `world.wing.inner`, `detail.card`).
3. **Rozdzielenie rectów**
   - layout rect, interactive rect, visual mount rect i bleed rect pozostają rozdzielone koncepcyjnie.
4. **FrameComposer / SVG / Figma readiness**
   - koncepcja zakłada osadzanie ramek, ornamentów i connectorów przez anchors/centers, bez ręcznego repinowania layoutu.
5. **Repo-only scope**
   - bez runtime integration, bez zmian mechaniki, bez nowych assetów i bez Figma MCP.

## Tryby

1. **Desktop / large**
   - pełny widok 9 stref jednocześnie.
2. **Tablet / medium**
   - ten sam model semantyczny, większa kompresja paneli.
3. **Mobile / small**
   - `core + workspace selector` (PRG / ŚWIAT / INVENTORY / FORGE / DETAIL).

## Czego wireframe jeszcze nie robi

- nie implementuje mechaniki SUB-META v2,
- nie integruje się z runtime gry,
- nie używa FrameComposer w produkcyjnym rendererze,
- nie zawiera finalnego art direction polish,
- nie używa Figma MCP ani nowych assetów.
