# SUB-META — specyfikacja layoutu

> Status: KIERUNEK / SPECYFIKACJA LAYOUTU
> Obszar: SUB-META / układ ekranu
> Źródło prawdy: TAK, dla układu projektowanego w Figma; NIE, dla runtime
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: `docs/current/ui/UI_WORLD.md`, `docs/current/systems/SUB_META_SYSTEM.md`, `docs/current/systems/PRG_SYSTEM.md`, `docs/current/systems/CARDS_SYSTEM.md`, `docs/current/systems/ECONOMY_SYSTEM.md`, `docs/current/visual/ART_DIRECTION.md`, `docs/current/visual/SUB_META_FIGMA_BRIEF.md`, `docs/current/visual/SUB_META_COMPONENTS.md`, `docs/current/visual/SUB_META_RESPONSIVE_SCALING.md`, `docs/current/visual/SUB_META_ASSET_PIPELINE.md`

## 1. Zasada główna

SUB-META projektujemy jako jeden ekran 16:9, bez głównego scrolla.

Jeżeli część treści nie mieści się wygodnie:
- nie dodajemy scrolla całego ekranu,
- dopuszczamy lokalny scroll tylko tam, gdzie to konieczne (kolekcja kart),
- scroll kolekcji projektujemy po całym wierszu kart.

## 2. Podział ekranu

### 2.1. Tło świata / kosmos
- Tło RUN pozostaje widoczne.
- SUB-META jest półprzezroczystą warstwą na świecie.
- Figma określa miejsca, maski i proporcje dla rastrów.
- Finalne tła i tekstury są dostarczane później z raster pipeline (poza Figmą).
- W mockupach Figma rastry mogą być neutralnymi placeholderami.
- Placeholderów Figma nie traktujemy jako finalnych grafik produkcyjnych.

### 2.2. Centralna rama SUB-META
- Główny panel zajmuje większość ekranu, ale zostawia oddech po bokach.
- Rama i linie geometryczne projektowane pod SVG.

### 2.3. Górny pasek
- Tytuł SUB-META.
- Przycisk „Wróć”.
- Ewentualne przełączniki pomocnicze.

### 2.4. Lewa kolumna (konfiguracja)
- Sekcja PRG / osie.
- Gniazda rezonansu.
- Gniazda pomocnicze.
- Cztery pola ŚWIAT.

### 2.5. Prawa kolumna (zasoby)
- Magazyn kart.
- Sekcje „w użyciu” i „rezerwa”.
- Lokalny scroll tylko jeśli kolekcja przekracza dostępną przestrzeń.

### 2.6. Dolny panel operacyjny
- Kuźnia.
- Opis wybranej operacji.
- Koszt RP.
- Potwierdzenie akcji.

### 2.7. Boczny HUD
- RP i liczniki kolorów pozostają elementem świata.
- Nie wtapiamy ich całkowicie w centralną ramę.

## 3. Proporcje i skalowanie (16:9 i większe)

- Kompozycja bazowa: 16:9.
- Dla większych rozdzielczości (w tym 4K) zachowujemy hierarchię i marginesy, zamiast przypadkowego rozciągania.
- Geometria (ramki/sloty/linie) skaluje się jako SVG.
- Bitmap nie rozciągamy bez wariantów wysokiej rozdzielczości.

## 4. Zasady kolekcji kart

- Karty zachowują proporcję **1:3 (szerokość:wysokość)**.
- Dla nadmiaru kart: przewijanie po całym wierszu kart, nie pojedynczych elementach.
- To lokalny mechanizm layoutu, nie globalny scroll ekranu.

## 5. Hierarchia ważności wizualnej

1. Aktywny kontekst konfiguracji.
2. Gniazda i relacje.
3. Koszt i potwierdzenie.
4. Magazyn i liczność zasobów.
5. Ornament i tło.

## 6. Zasady marginesów i oddechu

- Utrzymuj wewnętrzne marginesy między sekcjami.
- Nie dociskaj komponentów do ramek.
- Zachowuj ciszę wokół kluczowych akcji.
- Większy odstęp między grupami funkcjonalnymi niż wewnątrz grupy.

## 7. Czego nie robić

- Nie projektować layoutu jak sklep lub debug panel.
- Nie zasłaniać świata w 100% nieprzezroczystą planszą.
- Nie budować układu wymagającego głównego scrolla.
- Nie łamać modelu lokalnego scrolla kolekcji po wierszu.
