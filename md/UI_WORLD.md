# Haiku Cosmos — UI WORLD

## Interfejs świata, HUD i panele (KANON)

Ten dokument opisuje UI w RUN oraz panele konfiguracyjne SUB-META / META.
Celem UI jest:

- minimalizm,
- czytelność,
- brak „ciężkiego HUD”,
- szybka decyzja bez przerywania flow.

UI jest kosmiczne, zen, lekkie.

---

## 1. Warstwy UI

UI składa się z trzech warstw:

1) RUN HUD (na ekranie gry, zawsze widoczny)  
2) SUB-META Overlay (panel konfiguracyjny dostępny w trakcie RUN)  
3) META Overlay (panel końca cyklu / eonu)

SUB-META i META to overlay na canvas (lub dedykowana warstwa DOM), ale muszą wyglądać jak część gry.

---

## 2. RUN HUD (w trakcie gry)

RUN HUD jest minimalistyczny i nie zasłania świata.

### 2.1. RP (Punkty Rezonansu)

- widoczne stale jako liczba (u góry w prawym rogu),
- traktowane jako podstawowa waluta decyzji (tlen zmian),
- format: `RP: <liczba>`

RP jest używane do:

- działań w SUB-META (sloty, PRG),
- działań META końcowego.

---

### 2.2. Kolekcja kart kolorów (DR)

- w prawym górnym rogu: wąskie prostokąty z licznikami,
- kolejność od góry:
  1) czerwony
  2) żółty
  3) zielony
  4) niebieski
- jeśli count > 1: mała cyferka ilości,
- jeśli count == 0: prostokąt niewidoczny lub wyszarzony.

To jest szybka informacja o zasobach do slotów i PRG.

---

### 2.3. Panel przełączania PRG (RUN toggle)

Po uzupełnieniu PRG w SUB-META, gracz musi mieć możliwość używania PRG w locie.

- po lewej stronie ekranu: pionowy pasek przycisków / ikon PRG,
- 3 wiązania kategorii (gałęzi) PRG (jeśli istnieją) - karta prostokątna pionowa dwukolorowa (jak w subMETA)
- wyświetla się w momencie gdy istnieje choć jedno połączenie kategorii (gałęzi):

  -- 🔴🟢 Wielkość - Prędkość
  -- 🔴🔵 Wielkość - Obiekty
  -- 🟡🔵 Klej - Obiekty

- klik w przycisk zmienia aktywny tryb (toggle),
- w danym momencie aktywny jest jeden tryb (połączenie) PRG naraz,
- WAŻNE: wszystkie kategorie obsadzone kartami wpływają na ring gracza podczas RUN.

Przyciski mogą być placeholderami (tekst/znak), później zastąpione ikonami.

---

### 2.4. Przycisk SUB-META (zawsze dostępny)

SUB-META ma być dostępna zawsze.

- mały przycisk/znak UI w RUN (np. górna krawędź ekranu na środku),
- klik otwiera SUB-META,
- otwarcie pauzuje świat.

Przycisk powinien być dyskretny, ale zauważalny.

---

### 2.5. Sekwencje / Karty akcji (overlay informacyjny)

Sekwencje i komunikaty kart:

- nie są stałym HUD,
- są zminimalizowane do podstawowych treści, aby nie zasłaniać ekranu, 
- pojawiają się jako krótkie overlaye,

Zasada:

- UI informuje, ale nie spamuje.

---

## 3. SUB-META Overlay (panel konfiguracyjny)

SUB-META jest panelem taktycznym.
Otwierany:

- automatycznie po pierwszej planecie,
- manualnie przyciskiem (zawsze).

Po otwarciu:

- świat jest zatrzymany lub silnie spowolniony.

### 3.1. Układ SUB-META

Overlay jest wyśrodkowany i składa się z:

#### 3.1.1 GÓRA — Panel PRG (4 zakładki)

Na samej górze panelu:

- poziomy pasek z czterema zakładkami (kategorie - gałęzie) PRG:

1) 🔴 Wielkość ringu  
2) 🟡 Glue ↔ Odpychanie  
3) 🟢 Przyśpiesz ↔ Zwolnij  
4) 🔵 Meteory ↔ Planetoidy  

Każda zakładka:

- prezentuje możliwe do obsadzenia kartami miejsca - 1 karta R1, 1 karta ODB (początkowo wyszarzona)
- pozwala odblokowywać jedno miejsce na Odbicia (ODB).

Pod głównymi kategoriami istnieje dodatkowe poziome miejsce na karty R2 (3 miejsca) tworzące połączenia. Są one wyśrodkowane względem całego pola.
Gdy aktywowane jest dane połączenie kategorii (gałęzi), obie kategorie podświetlają się w swoim kolorze.

---

#### 3.1.2. ŚRODEK po lewej — Sloty ŚWIATA (4)

Po lewej stronie środka panelu:

- pionowa lista slotów META:

1) Forma (🔴)  
2) Intencja (🟡)  
3) Czas (🟢)  
4) Cisza (🔵)  

Każdy slot:

- ma miejsca na 3 karty,
- start: 1 miejsce puste (lub z kartą danego koloru typu R1)
- można wykupić dodatkowy slot na kartę R1 za pomocą karty Dodatkowy Slot, koło aktywnej karty R1 pojawia się wtedy mały plusik danego koloru. Jego kliknięcie dodaje slot, wykorzystując kartę DS (jej usunięcie)
- max: 2 miejsca na karty R1 i jedno na kartę Ekspancji (EKS).

UI slotu:

- pokazuje czy slot jest pusty (prostokąt pionowy pusty)/ zajęty (prostokąt wypełniony kolorem z opisem),
- pokazuje małe “+” jeśli można dokupić miejsce (warunki spełnione).

Klik w slot:

- pokazuje picker kart pasujących do slotu (allowedSlots),
- przed przypięciem pokazuje podgląd efektu i koszt.

---

#### 3.1.3. PRAWA — Magazyn / Kolekcja

Prawa kolumna SUB-META:

- pokazuje zebrane karty (wszystkie),
- pozwala nimi zarządzać.

---

#### 3.1.4. PRAWA - Dolny róg - OPIS Karty

W dolnym prawym rogu pod Magazynem znajduje się okno wyświetlania informacji o karcie. Jest ono podzielone na 2 części (pionowo):

Po lewej znajduje się okno podstawowych informacji:

- Tutył karty oraz jej moc (np. R1 sDR) - kolor biały,
- Podstawowe atrybuty / cechy / możliwości kolorem białym,
- Dodatkowe możliwości (dla sDR) - kolorem niebieskim,
- Wyjątkowe możliwości (dla pDR lub innego typu rozszerzenia (TODO)) - kolorem złotym.

Po prawej znajduje się okno wyświetlania Haiku wraz z grafiką karty (TODO)

- grafika / logo na górze
- haiku w formie 3 wersów poniżej

#### 3.1.5. LEWA - pod slotami świata Pole informacji o slocie - Możliwe do obsadzenia karty

Pod slotami Świata znajduje się niewielkie okno pokazujące dostępne karty dla danego slotu (allowedSlots).
Jest to pojedyńczy rząd wysokości karty, szerokość całego pola Sloty Świata. 
Jeśli gracz kliknie w Kategorię PRG lub slot Świata, zostaną pokazane dostępne dla slotu karty. 
Z tego miejsca można wybierać karty do danego miejsca. 

#### 3.1.6. LEWA pod Polem informacji o slocie - Kuźnia

Kuźnia to miejsce gdzie wyświetlane są możliwe do wykonania karty z zasobów zgromadzonych w Magazynie.
Kuźnia wyświetla wszystkie dostępne karty, które można wykonać w danej chwili. Warunkiem koniecznym pokazania i wykonania danej karty jest dostępność zasobów (inne karty, punkty rezonansu RP).
Podstawowe karty do wykonania (więcej w ECONOMY SYSTEM)
R1 sDR = 3 x R1 DR + RP
R1 pDR = 3 x R1 sDR + RP
R2 sDR = 3 x R2 DR + RP
R2 pDR = 3 x R2 sDR + RP

W kuźni będzie można też dostosować zdobytą kartę do slotu (ODB) lub (EKS)
Aby móc zastosować zdobytą podczas gry kartę w odpowiednim slocie trzeba ją nasycić kolorem tego slotu:
np:

- 1 karta Specjalna + 1 karta sDR R1 koloru czerwonego = 1 karta Ekspancji dla slotu czerwonego,
- 1 karta Specjalna + 1 karta pDR R1 koloru niebieskiego = 1 karta Ekspancji dla slotu niebieskiego.

### 3.2. Koszty w SUB-META (UI)

Wszystkie akcje w SUB-META są płatne, a o zasadach mówi dokument ECONOMY SYSTEM.

przykłady:

- przypisanie karty do slotu,
- usunięcie karty ze sloty,
- odblokowanie miejsca slotu.

UI musi:

- wyświetlać koszt przed kliknięciem (podgląd),
- blokować opcje, gdy brak RP/kart,
- nie frustrować: blokada czytelna, bez agresywnych alertów.

---

### 3.3. Zamknięcie SUB-META

SUB-META zamykane jest przez:

- przycisk “Wróć” (prawy górny róg panelu),
- zamknięcie wznawia świat bez resetów.

---

## 4. META Overlay (koniec cyklu - EONU)

META to panel kończący RUN:

- reset świata / nowy eon,
- możliwe do wykonania w kuźni karty Specjalne z pozyskanych podczas RUN kart,
- używa RP + sDR + PDR + kart jakościowych.

META jest rzadsze i cięższe niż SUB-META. Ma dodatkową grafikę i zajmuje całe okno gry.

---

## 5. Kolory jako logika UI

Kolory nie są ozdobą.
Kolor = semantyka systemu:

- 🔴 Forma / ring size
- 🟡 Intencja / glue vs repel
- 🟢 Czas / speed up vs slow down
- 🔵 Cisza / meteors vs asteroids

UI ma tę mapę utrzymywać wszędzie:

- w slotach,
- w PRG,
- w kosztach i ikonach,
- w kolekcji.

---

## 6. Status dokumentu

KANON v1.
Zgodny z:
- ECONOMY_SYSTEM.md
- SUB_META_SYSTEM.md
- TARGETS_SYSTEM.md

Dokument opisuje UI i flow,
bez wchodzenia w implementację.
