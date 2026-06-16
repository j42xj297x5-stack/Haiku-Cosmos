> Status: KANON
> Obszar: UI / flow świata i overlaye
> Źródło prawdy: TAK
> Ostatnia aktualizacja: 2026-06-12
> Powiązane dokumenty: ../maps/PROJECT_INDEX.md, ../systems/CARDS_SYSTEM.md, ../systems/ECONOMY_SYSTEM.md, ../systems/SUB_META_SYSTEM.md, ../systems/PRG_SYSTEM.md, ../systems/I18N_SYSTEM.md

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

> Aktualizacja 2026-05-03: stary model czterech prawych prostokątów DR jako liczników magazynu jest **zdeprecjonowany jako główny kierunek**.
> Roboczym źródłem kierunku RUN HUD v2 jest `HUD_SYSTEM.md` (prawy panel rombów sekwencji + dolne sloty kart specjalnych/eventowych).


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

- [DEPRECATED jako kierunek HUD] cztery wąskie pionowe prostokąty z licznikami,
- [HUD v2] kierunek zastępczy: cztery pionowe wyciągnięte romby kolorów opisane w `HUD_SYSTEM.md`,
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

### 2.6. Pamięć sekwencji — pulsowanie prostokątów DR (RUN HUD)

Podczas budowania sekwencji gracz może „zgubić” to, jaki kolor powinien zbierać dalej.
Zamiast dodatkowych komunikatów tekstowych, RUN HUD używa istniejących prostokątów DR (prawy górny róg)
jako **wskaźnika pamięci sekwencji**.

Zasada:

- jeśli sekwencja jest aktywna, prostokąty kolorów biorących udział w aktualnym łańcuchu **pulsują** (powoli).

Pulsowanie:

- po zamknięciu kroku A (R1) pulsuje kolor A,
- po zamknięciu kroku B (R2) pulsują kolory A i B,
- po zamknięciu kroku C (R3) pulsują kolory A, B, C,
- po zamknięciu kroku D (R4) pulsują kolory A, B, C, D,
- w trakcie kroku (gdy jest wybrany `currentColor`) dopuszczalne jest pulsowanie także koloru w trakcie zbierania.

Wizualnie:

- puls jest subtelny i nie “miga agresywnie”,

- preferowane: pulsowanie obwódki (białej) lub lekkie rozjaśnienie wypełnienia,
- tempo: ok. 2 sekundy na pełny cykl (narastanie + opadanie).

Zasady spójności:

- pulsowanie działa niezależnie od liczników ilości (count może być 0, a kolor nadal pulsuje jako wskaźnik sekwencji),
- pasek czasu aktywacji (timer) pozostaje bez zmian i nadal pokazuje czas działania efektu aktywacji.

Pulsowanie uruchamia się dopiero w momencie otwarcia kroku sekwencji (po 2. harmonicznym trafieniu), nie przy pierwszym trafieniu.

I dopisz regułę stylu:

count==0 → czarny→kolor

count>0 → kolor→biały

### 2.7. Sekwencje twarde 3–3–3… oraz pętla R1 (AA → AAA)

Sekwencje są komunikowane poprzez sygnały HUD, a nie teksty.

#### 2.7.1. Ustanowienie kierunku (hit1)

- biała ramka wokół prostokąta DR odpowiadającego aktualnemu kolorowi kroku,
- brak overlay tekstowego.

#### 2.7.2. Rozpoczęcie kroku (hit2)

- uruchamia się pulsowanie prostokąta koloru (zgodnie z zasadą pulsowania sekwencji),
- brak overlay tekstowego.

#### 2.7.3. Zakończenie kroku (hit3)

- krótki rozbłysk/halo na prostokątach biorących udział,
- następnie pojawia się okno decyzji (jeśli krok jest decyzyjny).

Pętla R1 po ukończeniu R1(A):

- **AA** kończy się overlayem decyzji (Aktywuj / Kolekcja 2×R1A / brak kliknięcia → AAA),
- **AAA** kończy się automatycznie przyznaniem DS(A) i krótką wizualną informacją o karcie DS (bez okna decyzji).

#### Przerwanie (fail)

- brak komunikatów tekstowych typu „Niepowodzenie sekwencji”,
- UI pokazuje jedynie:
  - przyznane punkty (+RP),
  - prostokąty kart, które zostały przyznane w wyniku przerwania (jeśli dotyczy).

Przy atomowym zbieraniu koloru:

- trafienie obcym kolorem przerywa poprzedni kierunek,
- to samo trafienie ustanawia nowy kierunek jako **hit1/3** (bez „martwego resetu”).
- dotyczy to także dalszych etapów R-track (R2/R3/R4): fail rozlicza się w tle, a HUD od razu pokazuje nowy kierunek.

---

## 3. SUB-META Overlay (panel konfiguracyjny)

> **Snapshot implementacyjny:** bieżący runtime opisuje `SUB_META_RUNTIME_SNAPSHOT.md`. Obecny etap używa PNG/settings/placeholders/panels i finalizacji przez pending + Potwierdź; nie implementuje jeszcze kosztów RP, wyjmowania/podmiany, pyłu ani pełnej Kuźni. Poniższe wymagania systemowe pozostają kierunkiem funkcjonalnym, nie opisem kompletności aktualnego runtime.

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

### 3.4. Nota synchronizacyjna — UI struktury slotu i degradacji

- Przyszłe UI musi pokazać strukturę slotu: karta R, stabilizator, karta specjalna, artefakt.
- Karta R może pokazywać trwałość paskiem bocznym albo warstwami degradacji.
- Elementy specjalne i artefakty pozostają widoczne, ale mogą być przyciemnione lub nieaktywne, gdy karta R zniknie.
- Finalny kierunek visual wymaga osobnego passu.
- Szczegóły robocze opisuje `../systems/SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`.

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


## 7. Migracja HUD/SUB-META / DO AKTUALIZACJI względem CARD_SLOT_NETWORK_SYSTEM

- System aktywowania koloru w HUD ma zostać wycofany zgodnie z kierunkiem `CARD_SLOT_NETWORK_SYSTEM.md`; karta staje się aktywna po włożeniu do slotu.
- Stare fragmenty opisujące aktywację koloru przez HUD/sekwencję są **DO AKTUALIZACJI**, ale nie są usuwane przed pełną migracją runtime.
- HUD będzie musiał obsłużyć pył, chmurki pyłu, zasobnik i deponowanie w osobnym kroku projektowym.
- SUB-META będzie musiała pokazywać aktywność slotów, trwałość kart, stabilizatory, napięcia, blizny i naprawę slotów.
- To jest kierunek dokumentacyjny i nie oznacza implementacji ani zmiany działania gry w tym patchu.
