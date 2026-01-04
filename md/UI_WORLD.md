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

### 2.1. RP / Score (Punkty Rezonansu)
- widoczne stale jako liczba (np. w rogu),
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
- jeśli count == 0: prostokąt niewidoczny lub wyszarzony (preferowane: wyszarzony w v1).

To jest szybka informacja o zasobach do slotów i PRG.

---

### 2.3. Panel przełączania PRG (RUN toggle)
Po zakupie PRG w SUB-META, gracz musi mieć możliwość używania PRG w locie.

- po lewej stronie ekranu: pionowy pasek przycisków / ikon PRG,
- 4 kategorie PRG (kolor = aspekt):
  1) 🔴 Ring size
  2) 🟡 Glue ↔ Repel
  3) 🟢 Speed up ↔ Slow down
  4) 🔵 Meteors ↔ Asteroids
- klik w przycisk zmienia aktywny tryb (toggle),
- w danym momencie aktywny jest jeden tryb PRG naraz (v1),
- zakupione opcje są dostępne stale podczas RUN.

W v1 przyciski mogą być placeholderami (tekst/znak), później zastąpione ikonami.

---

### 2.4. Przycisk SUB-META (zawsze dostępny)
SUB-META ma być dostępna zawsze, nie tylko po epokach.

- mały przycisk/znak UI w RUN (np. krawędź ekranu),
- klik otwiera SUB-META,
- otwarcie pauzuje świat.

Przycisk powinien być dyskretny, ale zauważalny.

---

### 2.5. Trial / Karty akcji (overlay informacyjny)
Trial i komunikaty kart:
- nie są stałym HUD,
- pojawiają się jako krótkie overlaye,
- haiku i pełna karta pojawiają się wyłącznie przy sukcesie.

Zasada:
- UI informuje, ale nie spamuje.

---

## 3. SUB-META Overlay (panel konfiguracyjny)

SUB-META jest panelem taktycznym.
Otwierany:
- automatycznie po pierwszej planecie (v1),
- manualnie przyciskiem (zawsze).

Po otwarciu:
- świat jest zatrzymany lub silnie spowolniony.

### 3.1. Układ SUB-META (v1)
Overlay jest wyśrodkowany i składa się z:

#### GÓRA — Panel PRG (4 zakładki)
Na samej górze panelu:
- pasek z czterema zakładkami PRG:

1) 🔴 Wielkość ringu  
2) 🟡 Glue ↔ Odpychanie  
3) 🟢 Przyśpiesz ↔ Zwolnij  
4) 🔵 Meteory ↔ Planetoidy  

Każda zakładka:
- prezentuje dostępne do kupienia opcje,
- pokazuje koszt RP i wymagane karty,
- pozwala odblokowywać maks. 2 miejsca (v1).

W przyszłości:
- zakładki będą ikonami,
- opcje będą rozwijane o poziomy i warianty.

---

#### ŚRODEK — Sloty META (4)
Po lewej stronie środka panelu:
- pionowa lista slotów META:

1) Forma (🔴)  
2) Intencja (🟡)  
3) Czas (🟢)  
4) Cisza (🔵)  

Każdy slot:
- ma miejsca na karty,
- start: 1 miejsce,
- max: 3 miejsca.

UI slotu:
- pokazuje czy slot jest pusty / zajęty,
- pokazuje małe “+” jeśli można dokupić miejsce (warunki spełnione).

Klik w slot:
- pokazuje picker kart pasujących do slotu (allowedSlots),
- przed przypięciem pokazuje podgląd efektu i koszt.

---

#### PRAWA — Kuźnia / Kolekcja
Prawa kolumna SUB-META:
- pokazuje zebrane karty DR,
- pozwala nimi zarządzać.

W v1:
- wyświetlamy prostokąty/ilości (to samo co w RUN),
- dodatkowo pełni to rolę magazynu do kosztów zakupów.

W przyszłości:
- kuźnia umożliwi konwersję DR → sDR → PDR.

---

### 3.2. Koszty w SUB-META (UI)
Wszystkie akcje w SUB-META są kosztowne:

- przypisanie karty do slotu: 10 RP
- odblokowanie miejsca slotu: 10 RP + 3 DR koloru slotu
- odblokowanie miejsca PRG: 30 RP + 6 DR koloru PRG

UI musi:
- wyświetlać koszt przed kliknięciem (podgląd),
- blokować opcje, gdy brak RP/kart,
- nie frustrować: blokada czytelna, bez agresywnych alertów.

---

### 3.3. Zamknięcie SUB-META
SUB-META zamykane jest przez:
- przycisk “Wróć” (np. prawy dół panelu),
- zamknięcie wznawia świat bez resetów.

---

## 4. META Overlay (koniec cyklu)

META to panel kończący RUN:
- reset świata / nowy eon,
- najdroższe decyzje,
- używa RP + PDR + kart jakościowych (później).

META jest rzadsze i cięższe niż SUB-META.
W v1 META może być placeholderem (tylko podsumowanie).

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
- TARGETS_SYSTEM.md (bez Slotu Rytuał)

Dokument opisuje UI i flow,
bez wchodzenia w implementację.
