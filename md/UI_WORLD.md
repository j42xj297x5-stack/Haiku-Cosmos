# Haiku Cosmos — UI WORLD (KANON)

Dokument definiuje **strukturę interfejsu użytkownika oraz flow UI**
w grze Haiku Cosmos.

UI WORLD:

- opisuje *jak* gracz widzi i obsługuje system,
- nie definiuje kart, kosztów ani logiki mechanicznej,
- jest spójny z CARDS / ECONOMY / SUB META.

Jeżeli inny dokument opisuje *co* lub *ile* —  
UI WORLD opisuje *gdzie*, *kiedy* i *w jakiej formie*.

---

## 1. Warstwy UI

UI gry składa się z trzech warstw:

1) **RUN HUD** — interfejs podczas aktywnej gry  
2) **SUB-META Overlay** — panel konfiguracyjny dostępny w trakcie RUN  
3) **META Overlay** — panel końca cyklu (EONU)

SUB-META i META:

- są overlayami nad canvasem (lub osobną warstwą DOM),
- muszą wizualnie pozostać „częścią świata gry”.

---

## 2. RUN HUD (w trakcie gry)

RUN HUD jest **minimalistyczny** i **nie zasłania świata**.

### 2.1. RP — Punkty Rezonansu

- widoczne stale w prawym górnym rogu,
- prezentowane jako liczba,
- format: `RP: <wartość>`.

RP są:

- walutą decyzji,
- sygnałem gotowości do zmian w SUB-META i META.

---

### 2.2. Kolekcja kart kolorów (DR)

W prawym górnym rogu:

- cztery wąskie pionowe prostokąty z licznikami,
- kolejność od góry:
  1) 🔴 czerwony
  2) 🟡 żółty
  3) 🟢 zielony
  4) 🔵 niebieski

Zasady:

- `count > 1` → mała cyfra ilości,
- `count == 0` → prostokąt wyszarzony lub niewidoczny.

Jest to szybka informacja o zasobach do:

- slotów ŚWIAT,
- konfiguracji PRG,
- Kuźni.

---

### 2.3. Panel przełączania PRG (RUN toggle)

Po skonfigurowaniu PRG w SUB-META, gracz musi móc **zmieniać aktywny tryb w RUN**.

- po lewej stronie ekranu: pionowy pasek przycisków PRG,
- pojawia się **tylko jeśli istnieje co najmniej jedno wiązanie PRG (R2)**,
- każdy przycisk reprezentuje jedno aktywne połączenie gałęzi.

Obsługiwane połączenia:

- 🔴🟢 Wielkość – Prędkość  
- 🔴🔵 Wielkość – Obiekty  
- 🟡🔵 Klej – Obiekty  

Zasady:

- w danym momencie aktywny jest **jeden tryb PRG**,
- klik zmienia aktywne wiązanie,
- wszystkie obsadzone kategorie PRG wpływają na ring gracza niezależnie.

---

### 2.4. Przycisk SUB-META

SUB-META jest **zawsze dostępna**.

- mały, dyskretny przycisk UI (np. górna krawędź ekranu, środek),
- klik otwiera SUB-META,
- otwarcie **pauzuje lub silnie spowalnia świat**.

---

### 2.5. Sekwencje i komunikaty akcji

Informacje o sekwencjach i kartach:

- nie są stałym HUD,
- pojawiają się jako krótkie overlaye,
- znikają automatycznie.

Zasada:
> UI informuje, ale nie spamuje.

---

## 3. SUB-META Overlay (panel konfiguracyjny)

SUB-META jest **panelem taktycznym**.

Otwierany:

- automatycznie po pierwszej planecie,
- manualnie przez przycisk.

Po otwarciu:

- świat jest zatrzymany lub spowolniony.

---

### 3.1. Układ SUB-META

#### 3.1.1. GÓRA — Panel PRG (4 zakładki)

Poziomy pasek zakładek:

1) 🔴 Wielkość ringu  
2) 🟡 Glue ↔ Odpychanie  
3) 🟢 Przyśpiesz ↔ Zwolnij  
4) 🔵 Meteory ↔ Planetoidy  

Każda zakładka:

- 1 slot na kartę R1,
- 1 slot ODB (początkowo wyszarzony).

Pod zakładkami:

- 3 centralne sloty na karty R2 (wiązania PRG),
- aktywne połączenie podświetla obie kategorie.

---

### 3.1.2. ŚRODEK — Sloty ŚWIATA

Po lewej stronie:

1) 🔴 Forma  
2) 🟡 Intencja  
3) 🟢 Czas  
4) 🔵 Cisza  

Każdy slot:

- maks. 3 miejsca:
  - do 2 kart R1,
  - 1 karta Ekspansji (EKS).

UI:

- pusty / zajęty stan,
- mały „+” gdy możliwe dokupienie miejsca (karta DS).

Klik w slot:

- pokazuje dozwolone karty,
- pokazuje podgląd efektu i koszt RP.

---

### 3.1.3. PRAWA — Magazyn / Kolekcja

- lista wszystkich posiadanych kart,
- źródło kart do slotów i Kuźni.

---

### 3.1.4. PRAWA DÓŁ — Opis karty

Panel podzielony pionowo:

**Lewa strona**

- tytuł + tier (R1 sDR itd.),
- cechy podstawowe (biały),
- cechy dodatkowe (niebieski),
- cechy wyjątkowe (złoty).

**Prawa strona**

- grafika karty,
- haiku (3 wersy).

---

### 3.1.5. LEWA DÓŁ — Dostępne karty dla slotu

- pojedynczy rząd kart,
- filtr: only allowedSlots,
- służy do szybkiego przypinania kart.

---

### 3.1.6. LEWA DÓŁ — Kuźnia

Kuźnia pokazuje:

- wszystkie możliwe do wykonania karty,
- tylko gdy spełnione są warunki kart + RP.

UI Kuźni:

- pokazuje koszt przed wykonaniem,
- blokuje niedostępne opcje,
- nie używa agresywnych alertów.

---

### 3.2. Koszty w SUB-META (UI)

Wszystkie akcje:

- są płatne RP,
- koszt musi być widoczny **przed kliknięciem**,
- brak RP → czytelna blokada.

Zasady kosztów są w `ECONOMY_SYSTEM.md`.

---

### 3.3. Zamknięcie SUB-META

- przycisk „Wróć” (prawy górny róg),
- zamknięcie wznawia RUN bez resetów.

---

## 4. META Overlay (koniec cyklu / EON)

META:

- zamyka RUN,
- obsługuje reset świata / nowy eon,
- umożliwia tworzenie kart Specjalnych.

META:

- zajmuje całe okno gry,
- ma bogatszą oprawę wizualną niż SUB-META,
- używa RP oraz kart jakościowych.

---

## 5. Kolory jako logika UI

Kolor = semantyka systemu:

- 🔴 Forma / wielkość
- 🟡 Intencja / glue–repel
- 🟢 Czas / tempo
- 🔵 Cisza / skala obiektów

Mapa kolorów musi być spójna:

- w HUD,
- w SUB-META,
- w PRG,
- w kartach i kosztach.

---

## 6. Status dokumentu

**KANON UI WORLD v1**

Zgodny z:
- CARDS_SYSTEM.md
- ECONOMY_SYSTEM.md
- SUB_META_SYSTEM.md
- TARGETS_SYSTEM.md

Dokument opisuje UI i flow,
bez wchodzenia w implementację techniczną.

---
