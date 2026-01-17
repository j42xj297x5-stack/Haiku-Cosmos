# Haiku Cosmos — SUB META SYSTEM

## System SUB-META: decyzje, oddech i konfiguracja RUN (KANON)

SUB-META jest warstwą pomiędzy RUN a META końcowym.
Nie resetuje świata — umożliwia **świadome ingerencje** w jego reguły.

SUB-META to miejsce:

- wydawania Punktów Rezonansu (RP),
- przypisywania kart do slotów Świata i PRG,
- zarządzania PRG (Programami Reakcji Gracza),
- przygotowania konfiguracji na dalszy przebieg RUN.

---

## 1. Pozycja SUB-META w strukturze gry

Struktura gry:

RUN  
→ SUB-META (wiele wejść w jednym RUN)  
→ META (koniec cyklu / eonu)

SUB-META:

- nie resetuje RUN,
- nie resetuje świata,
- zatrzymuje symulację,
- pozwala na zmiany konfiguracyjne.

---

## 2. Dostęp do SUB-META

### 2.1. Automatyczne wyzwalanie

SUB-META otwiera się automatycznie:

- po utworzeniu pierwszej planety gazowej w RUN.

Ten trigger:

- występuje tylko raz na RUN,
- ma charakter wprowadzający.

---

### 2.2 Manualny dostęp

SUB-META jest dostępna **zawsze** poprzez przycisk UI:

- przycisk widoczny w RUN (np. krawędź ekranu),
- otwarcie SUB-META pauzuje symulację.

Manualne otwarcie:

- nie resetuje żadnych stanów,
- umożliwia modyfikacje w dowolnym momencie RUN.

---

## 3. Layout UI SUB-META (v1)

SUB-META wyświetla overlay składający się z trzech warstw:

### 3.1. GÓRA — Panel PRG

Na górze panelu znajduje się poziomy pasek z czterema zakładkami - kategoriami PRG:

1. 🔴 Wielkość ringu  
2. 🟡 Glue ↔ Odpychanie  
3. 🟢 Przyśpiesz ↔ Zwolnij  
4. 🔵 Meteory ↔ Planetoidy  

Każda zakładka:

- reprezentuje jedną kategorię PRG,
- zawiera przeciwstawne opcje,
- może być rozwijana poprzez łączenie kategorii (gałęzi).

---

### 3.2 ŚRODEK — Sloty Świat

Cztery sloty Świata ułożone pionowo:

1. Forma (🔴)  
2. Intencja (🟡)  
3. Czas (🟢)  
4. Cisza (🔵)  

Każdy slot:

- posiada miejsca na karty,
- początkowo ma jedno miejsce,
- maksymalnie może mieć trzy miejsca - jedno dla kart R1, dwa dla kart specjalnych.

Kliknięcie slotu:

- wybiera slot,
- wyświetla (poniżej) możliwe karty do przypisania (zgodnie z allowedSlots).

---

### 3.3 PRAWA STRONA — Kolekcja / Magazyn

Prawa kolumna SUB-META pełni rolę magazynu:

- wyświetla zebrane karty,
- pokazuje ich ilość,

### 3.4 PRAWA STRONA dolny róg - Informacje o karcie

Poniżej magazynu mieści się pole wyświetlania informacji o przeglądanych kartach. Podzielone jest na 2 części:

- po lewej widzimy opis karty wraz z jej tytułem oraz możliwościami wpływu na Świat lub PRG
- po prawej wyświetlane jest haiku i graficzna reprezentacja karty

### 3.5 LEWA STRONA dolny róg - Kuźnia

Miejsce podzielone jest horyzontalnie na 2 części:

- na górze mieści się lista dostępnych kart dla wybranego slotu Świata lub PRG,
- na dole pokazane są karty, które można konwertować na inne, modyfikować lub wzmacniać (DR → sDR → PDR).
- na samym dole wyświetlany jest koszt działania w RP (Punkty Rezonansu)

---

## 4. Sloty w META — zasady

### 4.1. Przypisywanie i usuwanie kart

Przypisanie karty do slotu:

- jest akcją płatną,
- usuwa kartę z kolekcji (magazynu),
- zapisuje konfigurację na dalszy RUN.

Usuwanie karty ze slotu:

- jest akcją płatną,
- usuwa kartę ze slotu i przywraca ją do magazynu,
- zapisuje konfigurację na dalszy RUN.

#### 4.2. Koszt przypisania

- 10 RP za każdą operację przypisania,
- 10 RP za usunięcie karty ze slotu.

Jeśli RP są niewystarczające:

- opcja jest zablokowana (wyszarzona),
- UI komunikuje koszt.

---

### 4.3. Odblokowywanie miejsc w slotach Świata

- Każdy slot Świata w META może posiadać maksymalnie 3 miejsca. 1 na kartę typu R1 oraz 1 na kartę Ekspansji oraz 1 na kartę Specjalną.
- Aby odblokować miejsce Ekspansja należy umieścić kartę R1 poziomu pDR,
- Aby odblokować miejsce na dodatową kartę Specjalną należy wykonać w kuźni kartę Dodatkowy Slot, która jest właściwa dla danego slotu (koloru), oraz aktywować ją w wybranym slocie.

---

### 4.4 Wiązanie slotów (gałęzi) w META-Świat

Pomiędzy 4 slotami Świata istnieją 3 miejsca na karty R2, które łączą przyległe do siebie gałęzie.

Rodzaje wiązań gałęzi ŚWIAT

1) 🔴🟡 Forma - Intencja
2) 🟡🟢 Intencja - Czas
3) 🟢🔵 Czas - Cisza

UI wyświetla miejsce w postaci pustego prostokąta znajdującego się pomiędzy 2 slotami

---

### 4.5 Dozwolone sloty (allowedSlots)

Każda karta definiuje listę allowedSlots.

Jeśli karta:

- nie pasuje do slotu → nie jest wyświetlana,
- nie może być przypisana.

---

## 5. PRG i kategorie (gałęzie) — Programy Reakcji Gracza

PRG są systemem aktywnym, niezależnym od slotów Świata.

Istnieją cztery kategorie PRG, odpowiadające kolorom i aspektom:

1. 🔴 Wielkość ringu
2. 🟡 Glue ↔ Odpychanie
3. 🟢 Przyśpiesz ↔ Zwolnij
4. 🔵 Wpływ na obiekty Meteory ↔ Komety ↔ Planetoidy ↔ Planety

Każda kategoria:

- zawiera przeciwstawne opcje,
- pozwala na wybór stylu gry / reakcji gracza na świat.

---

## 7. Pauza i zamykanie SUB-META

Otwarcie SUB-META:

- zatrzymuje symulację świata.

Zamknięcie SUB-META:

- przyciskiem „Wróć”,
- wznawia symulację bez resetów.

---

## 8. Relacja z META końcowym

SUB-META:

- przygotowuje konfigurację RUN,
- umożliwia wielokrotne ingerencje.

META końcowe:

- finalizuje RUN i jeden cykl (EON) świata,
- resetuje RUN,
- umożliwia rozpoczęcie cyklu z nową wiedzą i zasobami.

---

## 9. Status dokumentu

KANON v1.
Zgodny z ECONOMY_SYSTEM.md.
SUB-META jest miejscem decyzji, nie resetu.
