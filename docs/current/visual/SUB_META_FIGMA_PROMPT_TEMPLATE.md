<<<<<<< Updated upstream
# SUB-META — Figma prompt template (component/asset pass)

> Status: KIERUNEK / SZABLON PROMPTU
> Obszar: SUB-META / Figma / prompt workflow
> Źródło prawdy: TAK, dla przygotowania promptu do Figmy w zakresie visual direction i layoutu; NIE, dla mechaniki i runtime
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: `docs/current/visual/SUB_META_FIGMA_BRIEF.md`, `docs/current/visual/SUB_META_LAYOUT_SPEC.md`, `docs/current/visual/SUB_META_COMPONENTS.md`, `docs/current/visual/SUB_META_ASSET_PIPELINE.md`, `docs/current/visual/SUB_META_TYPOGRAPHY.md`, `docs/current/visual/SUB_META_RESPONSIVE_SCALING.md`, `docs/current/visual/ART_DIRECTION.md`, `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`, `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`, `docs/current/systems/SUB_META_SYSTEM.md`, `docs/current/systems/CARDS_SYSTEM.md`, `docs/current/systems/PRG_SYSTEM.md`, `docs/current/systems/ECONOMY_SYSTEM.md`, `docs/current/ui/UI_WORLD.md`

## Szablon do użycia — krok 1 (component/asset pass)

### 1) Nazwa zadania

Zaprojektuj pierwszy pass SUB-META: asset/component pass oparty o wektor i komponenty (nie finalny polished ekran).

### 2) Cel

Przygotuj bibliotekę wykonawczą Figmy obejmującą:
- ramki,
- placeholdery,
- sloty,
- glify,
- cienkie linie,
- przyciski,
- panele jako struktury/ramy/placeholders,
- buttony jako struktury/ramy/placeholders,
- karty R1 i DS,
- testową typografię,
- mini-layout pokazujący komponenty w kontekście.

To jest krok przygotowawczy do runtime i późniejszego polished mockupu.

### 3) Wejściowe dokumenty do przeczytania

Przeczytaj i stosuj:
- `docs/current/visual/SUB_META_FIGMA_BRIEF.md`
- `docs/current/visual/SUB_META_LAYOUT_SPEC.md`
- `docs/current/visual/SUB_META_COMPONENTS.md`
- `docs/current/visual/SUB_META_ASSET_PIPELINE.md`
- `docs/current/visual/SUB_META_TYPOGRAPHY.md`
- `docs/current/visual/SUB_META_RESPONSIVE_SCALING.md`
- `docs/current/visual/ART_DIRECTION.md`
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`

### 4) Opis stylu

- Rytualny minimalizm kosmiczny.
- SUB-META jako astrolabium konfiguracji, nie zwykły ekwipunek.
- Ciemna, półprzezroczysta baza.
- Cienkie linie prowadzące geometrię.
- Subtelne światło, brak agresywnego neonu.
- Świat kosmosu ma pozostać odczuwalny pod i wokół panelu.

### 5) Zakres komponentów

Zaprojektuj jako komponenty i warianty:
- karty R1 (stany: hover/selected/disabled/locked),
- karty DS (stany: hover/selected/disabled/locked),
- sloty (pusty/zajęty/zablokowany),
- glify i znaczniki osi,
- ramki i cienkie linie,
- panele (magazyn, opis, operacje),
- przyciski (Wróć, Potwierdź) z wariantami,
- etykiety kosztu RP i liczników,
- placeholdery pod rastry tła (bez tworzenia finalnych teł).

### 6) Zasady formatów i eksportów

- Geometria: SVG.
- Raster (PNG/WebP) w Figmie: wyłącznie placeholder lub referencja.
- Finalne rastry (tła świata/paneli/kart/buttonów, tekstury, miękkie światła) powstają poza Figmą.
- Nie przygotowuj finalnych raster backgrounds w Figma.
- Nie twórz finalnej struktury runtime; nazewnictwo traktuj roboczo wg dokumentacji.

### 7) Mini-layout kontekstowy

Dodaj jedną mini-kompozycję 16:9 pokazującą komponenty w użyciu:
- bez pełnego polished wykończenia,
- bez głównego scrolla,
- z lokalnym miejscem na ewentualny scroll kolekcji kart po wierszu.

### 8) Zakazy

- Nie projektować nowych mechanik.
- Nie dodawać nowych typów kart.
- Nie tworzyć finalnego polished mockupu jako głównego rezultatu kroku 1.
- Nie projektować właściwych raster backgrounds w Figma.
- Nie generować PNG/WebP tekstur jako finalnych assetów.
- Nie malować tła świata w Figma.
- Nie tworzyć materiałowych teł kart/buttonów/paneli jako finalnych assetów.
- Używać placeholderów dla rastrów.
- Nie robić fantasy deckbuildera.
- Nie robić agresywnego neon sci-fi.
- Nie robić technicznego debug UI.
- Nie zasłaniać świata całkowicie.
- Nie łamać kanonicznych kolorów RED/YELLOW/GREEN/BLUE.
- Nie mieszać DS z R1 (DS musi być od razu odróżnialna).

### 9) Oczekiwany wynik kroku 1

Dostarcz bibliotekę komponentów i assetów SUB-META gotową do walidacji skalowania (mobile → desktop → 4K) i do kolejnego kroku polished.

### 10) Checklista jakości kroku 1

- Czy komponenty bazowe są gotowe jako warianty?
- Czy geometria jest zaprojektowana pod SVG?
- Czy karta zachowuje proporcję 1:3 (szerokość:wysokość)?
- Czy stany hover/selected/disabled/locked są spójne?
- Czy mini-layout trzyma 16:9 i brak głównego scrolla?
- Czy kolekcja kart ma lokalny model scrolla po wierszu?
- Czy typografia testowa zawiera walidację polskich znaków?

## Wariant późniejszy: polished mockup całego ekranu SUB-META

Po zatwierdzeniu component/asset pass wykonujemy krok 2:
- pełny polished mockup SUB-META 16:9,
- oparty wyłącznie o zatwierdzone komponenty,
- z zachowaniem zasad skalowania i formatów assetów.
=======
# Haiku Cosmos — SUB-META Figma Prompt Template

> Status: KIERUNEK / PROMPT TEMPLATE
> Obszar: Figma, SUB-META, HUD, komponenty SVG
> Źródło prawdy: TAK, dla promptowania pierwszego passu komponentów SVG. NIE, dla mechaniki, runtime i finalnych assetów.
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: FIGMA_WORKFLOW.md, SUB_META_LINE_ORNAMENT_LIBRARY.md, SUB_META_ASSET_PIPELINE.md, SUB_META_COMPONENTS.md

## Prompt 1 — SUB-META + HUD line/ornament asset pass

Użyj tego promptu dopiero w osobnym zadaniu, gdy użytkownik wyraźnie poprosi o uruchomienie Figmy.

```text
Create the first Haiku Cosmos SUB-META + HUD line/ornament asset pass in Figma.

Goal:
Build a vector component library, not a full screen mockup.

The library should include scalable SVG-ready components for:
- SUB-META panel frames,
- R1 card frames,
- DS card frames,
- slots,
- divider lines,
- connector/orbit lines,
- corner ornaments,
- subtle rosettes,
- astrolabe-like rings,
- HUD counter frames,
- HUD RP/meter frames,
- axis/state glyphs,
- panel/card/slot placeholders.

Visual direction:
Ritual cosmic minimalism, sacred geometry, astronomical instrument, quiet UI readability.
The result should feel like a cosmic configuration instrument, not decorative esoteric poster art.

Use these inspirations structurally, not literally:
- astrolabe: circles, arcs, scale ticks, projection grids, star-point indicators,
- armillary sphere: intersecting rings, meridians, ecliptic/equator logic,
- Islamic compass-and-straightedge geometry: 8/10/12 modules, rosettes, corners, border rhythm,
- eastern 8-direction divisions: solid/broken line logic, directional balance,
- subtle 28 mansions divisions: small ticks and ring segmentation,
- western cosmographic wheels: concentric rings, orbits, cyclic composition.

Create components as variants where useful:
- default,
- hover,
- selected,
- active,
- disabled,
- locked,
- available,
- insufficient RP,
- special / DS.

Prepare a small demo composition only to show scale, relationships and states.
Do not create a full SUB-META screen.

SVG requirements:
- clean vector geometry,
- scalable strokes,
- no bitmap backgrounds,
- no raster textures,
- no embedded images,
- component names compatible with later export naming.

Do not:
- copy literal religious or sacred symbols,
- create a full mandala,
- create tarot visuals,
- create fantasy TCG card frames,
- create cyberpunk neon UI,
- create a full SUB-META screen at this stage,
- generate raster backgrounds,
- add fonts or runtime implementation.

Use the direction from:
- docs/current/visual/ART_DIRECTION.md,
- docs/current/visual/KOSMOLOGIA_WIZUALNA.md,
- docs/current/visual/BIBLIOTEKA_MATERIALOW.md,
- docs/current/visual/SUB_META_LINE_ORNAMENT_LIBRARY.md,
- docs/current/visual/SUB_META_ASSET_PIPELINE.md.
```

## Oczekiwane artefakty w Figmie

Figma powinna przygotować bibliotekę komponentów i wariantów oraz mini-kompozycję demonstracyjną. Eksport do repo wykonuje się dopiero po osobnej decyzji i według `SUB_META_ASSET_PIPELINE.md`.
>>>>>>> Stashed changes
