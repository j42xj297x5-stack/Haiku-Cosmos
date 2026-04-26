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
