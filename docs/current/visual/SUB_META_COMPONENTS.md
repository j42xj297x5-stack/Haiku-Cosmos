<<<<<<< Updated upstream
# SUB-META — biblioteka komponentów (etap 1)

> Status: KIERUNEK / BIBLIOTEKA KOMPONENTÓW
> Obszar: SUB-META / component sheet dla Figma
> Źródło prawdy: TAK, dla visual component design w Figma; NIE, dla runtime i mechaniki
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: `docs/current/visual/SUB_META_FIGMA_BRIEF.md`, `docs/current/visual/SUB_META_LAYOUT_SPEC.md`, `docs/current/visual/SUB_META_ASSET_PIPELINE.md`, `docs/current/visual/SUB_META_RESPONSIVE_SCALING.md`, `docs/current/visual/SUB_META_TYPOGRAPHY.md`, `docs/current/systems/CARDS_SYSTEM.md`, `docs/current/systems/SUB_META_SYSTEM.md`, `docs/current/systems/PRG_SYSTEM.md`, `docs/current/systems/ECONOMY_SYSTEM.md`, `docs/current/ui/UI_WORLD.md`

## 1. Zakres etapu 1

W tym etapie projektujemy komponenty dla:
- kart R1,
- kart DS,
- stanów slotów i paneli,
- bazowej typografii,
- komponentów potrzebnych do pierwszego component/asset pass.

## 2. Zasady wspólne

Każdy komponent ma być:
- czytelny,
- spójny z rytualnym minimalizmem kosmicznym,
- oparty o cienkie linie i subtelne światło,
- gotowy do skalowania mobile → desktop → 4K.

Stany interakcji modelujemy jako **warianty komponentu**, nie jako przypadkowe osobne style:
- `hover`,
- `selected`,
- `disabled`,
- `locked`.

## 3. Format preferowany i eksport (per komponent)

| Komponent | Preferowany format | Uwagi eksportowe |
|---|---|---|
| Ramki | SVG | Geometria wektorowa, bez rasteryzacji. |
| Glify | SVG | Każdy glif jako osobny asset. |
| Cienkie linie / ornament | SVG | Ostre na każdej skali. |
| Sloty (pusty/zajęty/zablokowany) | SVG | Warianty stanów jako komponenty. |
| Karta R1 | SVG + placeholder rastra | Rama/glif/linie/slot: SVG; tło rasterowe tylko jako placeholder (finalny raster poza Figmą). |
| Karta DS | SVG + placeholder rastra | Plus, rama i znaczniki: SVG; tło rasterowe tylko jako placeholder (finalny raster poza Figmą). |
| Panele | SVG + placeholder rastra | Geometria SVG; tło panelu/tekstura jako placeholder (finalny raster poza Figmą). |
| Przyciski | SVG + placeholder rastra | Kształt i obramowanie SVG; tło rasterowe tylko jako placeholder (finalny raster poza Figmą). |
| Etykiety kosztu/liczników | SVG + tekst | Priorytet czytelności cyfr i kontrastu. |

## 4. Karty — proporcja i skalowalność

- Karty projektujemy w proporcji **1:3 (szerokość:wysokość)**.
- Karty R1 i DS traktujemy jako komponenty skalowalne, nie zestaw sztywnych bitmap.
- Warianty kolorów i stanów utrzymujemy w jednym systemie komponentowym.

## 5. Zasady kluczowe per obiekt

- **Rama: SVG.**
- **Glif: SVG.**
- **Cienka linia: SVG.**
- **Slot: SVG.**
- **Ornament: SVG.**
- **Card frame: SVG.**
- **Card raster background: placeholder, właściwy raster poza Figmą.**
- **Panel raster background: placeholder, właściwy raster poza Figmą.**
- **Button raster background: placeholder, właściwy raster poza Figmą.**

## 6. Opis komponentów bazowych

### 6.1. Karta R1
- Dominanta osiowa RED/YELLOW/GREEN/BLUE.
- Czytelna rama i glif.
- Brak mylenia z DS.

### 6.2. Karta DS
- Charakter „dodatkowego slotu” z wyraźnym znakiem `+`.
- Odróżnialna od R1 już w miniaturze.

### 6.3. Sloty
- `pusty`: gotowość osadzenia,
- `zajęty`: fokus na osadzonej karcie,
- `zablokowany`: czytelna blokada bez agresywnego alarmu.

### 6.4. Panele i przyciski
- Hierarchia: informacja → koszt → akcja.
- Warianty stanów zawsze jako component variants.

## 7. Zasady eksportu

- Eksporty grupować według klas (`frame`, `glyph`, `slot`, `card`, `panel`, `button`).
- Nie tworzyć jeszcze runtime folderów ani map loadera.
- Dla rastrów dopuszczalne warianty 1x/2x/4x.
- Dla geometrii priorytet SVG (pojedynczy skalowalny system).

## 8. Czego unikać

- Losowego miksu formatów bez uzasadnienia.
- Wypalania cienkich linii do bitmap.
- Tworzenia osobnych styli stanów poza systemem wariantów.
- Ozdobnego fontu w małych etykietach operacyjnych.
=======
# Haiku Cosmos — SUB-META Components

> Status: KIERUNEK / KATALOG KOMPONENTÓW
> Obszar: SUB-META, HUD, komponenty wizualne SVG
> Źródło prawdy: TAK, dla rodzin komponentów wizualnych SUB-META/HUD. NIE, dla mechaniki i implementacji runtime.
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: SUB_META_LINE_ORNAMENT_LIBRARY.md, SUB_META_ASSET_PIPELINE.md, FIGMA_WORKFLOW.md, SUB_META_FIGMA_PROMPT_TEMPLATE.md, ../ui/UI_WORLD.md, ../systems/SUB_META_SYSTEM.md

## 1. Cel dokumentu

Ten dokument porządkuje pierwsze rodziny komponentów wizualnych dla SUB-META i podstawowego HUD.

Szczegółowy kierunek linii, ornamentów i inspiracji historyczno-matematycznych znajduje się w `SUB_META_LINE_ORNAMENT_LIBRARY.md`.

## 2. Podział obszarów

### SUB-META

Elementy używane w overlayu konfiguracji:

- ramy paneli,
- sloty,
- ramy kart R1/DS,
- linie połączeń R2,
- separatory,
- placeholdery paneli/kart/slotów,
- glify osi i stanów.

### HUD

Elementy używane w podstawowym HUD:

- ramy liczników RP,
- ramy liczników kolorów,
- metry sekwencji,
- małe glify stanu,
- ticki i subtelne skale.

### Shared

Elementy neutralne, używane przez więcej niż jedną warstwę:

- bazowe linie,
- neutralne ramy,
- proste ornamenty,
- glify osiowe bez przypisania do jednego widoku.

## 3. Rodziny komponentów liniowych

Pierwszy katalog komponentów obejmuje:

- `frame.main`
- `frame.panel`
- `frame.card`
- `frame.slot`
- `line.divider`
- `line.connector`
- `line.scale_tick`
- `ornament.corner`
- `ornament.border`
- `ornament.rosette`
- `ornament.orbit`
- `glyph.axis`
- `glyph.state`
- `glyph.card_r1`
- `glyph.card_ds`
- `placeholder.panel`
- `placeholder.card`
- `placeholder.slot`
- `hud.meter_frame`
- `hud.counter_frame`

Nazwy rodzin są logiczne. Konkretne nazwy plików eksportu opisuje `SUB_META_ASSET_PIPELINE.md`.

## 4. Pierwszy zestaw komponentów SVG

Pierwszy asset/component pass powinien dostarczyć:

- 3 warianty ram paneli SUB-META,
- 3 warianty ramek kart R1,
- 3 warianty ramek DS,
- 4 warianty slotów,
- 4 typy linii separatorów,
- 4 typy linii połączeń,
- 8 glifów osi/stanów inspirowanych geometrią,
- 4 narożniki ornamentowe,
- 2 rozety subtelne,
- 2 pierścienie astrolabiczne,
- 2 ramki HUD liczników,
- 2 ramki HUD RP/metrów.

To jest biblioteka komponentów, nie pełny ekran SUB-META.

## 5. Stany komponentów

Komponenty powinny mieć warianty lub style pozwalające odróżnić:

- `default`,
- `hover`,
- `selected`,
- `active`,
- `disabled`,
- `locked`,
- `available`,
- `insufficient RP`,
- `special / DS`.

Stany muszą wzmacniać czytelność, a nie dekoracyjność.

## 6. Relacja do folderów assetów

Eksporty trafiają do:

- `assets/visual/submeta/svg/...` dla komponentów SUB-META,
- `assets/visual/hud/svg/...` dla komponentów HUD,
- `assets/visual/shared/svg/...` dla komponentów współdzielonych.

Katalogi `raster_placeholders/` są poza pierwszym pass SVG.

## 7. Granice

Ten dokument nie definiuje:

- mechaniki kart,
- kosztów RP,
- zachowania runtime,
- layoutu finalnego ekranu,
- finalnych grafik.

Komponenty mają przygotować język wizualny, który później może zostać wdrożony bez zmiany kanonu mechanicznego.
>>>>>>> Stashed changes
