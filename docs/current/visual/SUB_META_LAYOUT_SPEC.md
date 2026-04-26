# SUB-META — specyfikacja layoutu

> Status: KIERUNEK / SPECYFIKACJA LAYOUTU
> Obszar: SUB-META / układ ekranu
> Źródło prawdy: TAK, dla układu projektowanego w Figma; NIE, dla runtime
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: `docs/current/ui/UI_WORLD.md`, `docs/current/systems/SUB_META_SYSTEM.md`, `docs/current/systems/PRG_SYSTEM.md`, `docs/current/systems/CARDS_SYSTEM.md`, `docs/current/systems/ECONOMY_SYSTEM.md`, `docs/current/visual/ART_DIRECTION.md`, `docs/current/visual/SUB_META_FIGMA_BRIEF.md`, `docs/current/visual/SUB_META_COMPONENTS.md`

## 1. Zasada główna

SUB-META projektujemy jako jeden ekran 16:9, bez głównego scrolla.

Jeżeli jakaś część treści nie mieści się wygodnie, traktujemy to jako osobny problem projektowy na kolejny etap (np. warianty filtrowania, paginacji, zagęszczenia), ale nie dodajemy teraz głównego scrolla.

## 2. Podział ekranu

### 2.1. Tło świata / kosmos

- Tło RUN pozostaje widoczne.
- SUB-META jest nałożoną warstwą półprzezroczystą.
- Po bokach i w oddechach układu nadal czuć świat.

### 2.2. Centralna rama SUB-META

- Główny panel zajmuje większość szerokości i wysokości.
- Nie dochodzi jednak „na styk” do krawędzi ekranu.
- Zostawia czytelny margines świata po bokach.

### 2.3. Górny pasek

- Tytuł SUB-META (centrum lub lekko lewa strona).
- Przycisk „Wróć” po prawej stronie.
- Ewentualne przełączniki trybu jako element pomocniczy, nie dominujący.

### 2.4. Lewa kolumna (konfiguracja)

- Sekcja PRG / ustawienia osi.
- Gniazda rezonansu.
- Gniazda pomocnicze.
- Cztery pola ŚWIAT.

Lewa strona komunikuje „co konfiguruję”.

### 2.5. Prawa kolumna (zasoby)

- Magazyn kart.
- Sekcja „w użyciu”.
- Sekcja „rezerwa”.

Prawa strona komunikuje „z czego korzystam”.

### 2.6. Dolny panel operacyjny

- Kuźnia.
- Opis wybranej operacji.
- Koszt (RP).
- Potwierdzenie akcji.

Dolny panel domyka przepływ decyzji: wybór → wgląd → koszt → potwierdzenie.

### 2.7. Boczny HUD

- RP i liczniki kolorów pozostają elementem świata (po bokach / górnych strefach).
- Nie wtapiamy ich całkowicie w centralną ramę.

## 3. Proporcje opisowe (bez twardych pikseli)

- Centralny panel: dominujący, ale z wyraźnym oddechem tła świata.
- Lewa i prawa kolumna: zbliżona waga, z lekkim priorytetem lewej przy konfiguracji.
- Dolny panel: niższy niż kolumny, ale wystarczająco wysoki do czytelnego opisu i przycisków.
- Górny pasek: smukły, funkcjonalny, nie „belka aplikacyjna”.

## 4. Hierarchia ważności wizualnej

1. Aktywny kontekst konfiguracji (co jest wybrane).
2. Gniazda i relacje (co można osadzić / co jest zajęte / co zablokowane).
3. Koszt i potwierdzenie (co się stanie po kliknięciu).
4. Magazyn i liczność zasobów.
5. Ornament i tło.

## 5. Zasady marginesów i oddechu

- Utrzymuj wewnętrzne marginesy między sekcjami.
- Nie dociskaj komponentów do ramek.
- Zachowuj „ciszę” wokół najważniejszych akcji.
- Pomiędzy grupami funkcjonalnymi stosuj większy odstęp niż między elementami w obrębie jednej grupy.

## 6. Zasady zagęszczenia informacji

- Unikaj stanu „ściany kart i etykiet”.
- Pokazuj tylko to, co konieczne do podjęcia decyzji.
- Detale pogłębione (np. rozbudowany opis) kieruj do panelu opisu.
- W stanie spoczynku interfejs ma być spokojny i czytelny.

## 7. Zasady minimalnej responsywności

- Priorytetem jest kompozycja 16:9.
- Przy ciaśniejszym obszarze najpierw redukuj ornament i oddech pomocniczy, nie czytelność informacji kluczowej.
- Nie chowaj krytycznych elementów kosztu i potwierdzenia.
- Nie wprowadzaj głównego scrolla jako rozwiązania bazowego.

## 8. Czego nie robić

- Nie projektować layoutu jak pełnoekranowy sklep lub debug panel.
- Nie zasłaniać świata w 100% nieprzezroczystą planszą.
- Nie budować układu, który wymaga głównego scrolla do podstawowych operacji.
- Nie mieszać stref funkcjonalnych bez jasnej hierarchii.
- Nie projektować teraz rozwiązania scroll dla nadmiaru kart; to temat na osobny etap.
