# Haiku Cosmos — SUB META SYSTEM
## System SUB-META: decyzje, oddech i konfiguracja RUN (KANON)

SUB-META jest warstwą pomiędzy RUN a META końcowym.
Nie resetuje świata — umożliwia **świadome ingerencje** w jego reguły.

SUB-META to miejsce:
- wydawania Punktów Rezonansu (RP),
- przypisywania kart do slotów META,
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
- zatrzymuje lub silnie spowalnia symulację,
- pozwala na zmiany konfiguracyjne.

---

## 2. Dostęp do SUB-META

### Automatyczne wyzwalanie (v1)
SUB-META otwiera się automatycznie:
- po utworzeniu pierwszej planety w RUN.

Ten trigger:
- występuje tylko raz na RUN,
- ma charakter wprowadzający.

---

### Manualny dostęp
SUB-META jest dostępna **zawsze** poprzez przycisk UI:
- przycisk widoczny w RUN (np. krawędź ekranu),
- otwarcie SUB-META pauzuje symulację.

Manualne otwarcie:
- nie resetuje żadnych stanów,
- umożliwia modyfikacje w dowolnym momencie RUN.

---

## 3. Layout UI SUB-META (v1)

SUB-META wyświetla overlay składający się z trzech warstw:

### GÓRA — Panel PRG
Na górze panelu znajduje się pasek z czterema zakładkami PRG:

1. 🔴 Wielkość ringu  
2. 🟡 Glue ↔ Odpychanie  
3. 🟢 Przyśpiesz ↔ Zwolnij  
4. 🔵 Meteory ↔ Planetoidy  

Każda zakładka:
- reprezentuje jedną kategorię PRG,
- zawiera przeciwstawne opcje,
- może być rozwijana w przyszłości (ikony, poziomy).

---

### ŚRODEK — Sloty META
Cztery sloty META ułożone pionowo:

1. Forma (🔴)  
2. Intencja (🟡)  
3. Czas (🟢)  
4. Cisza (🔵)  

Każdy slot:
- posiada miejsca na karty,
- początkowo ma jedno miejsce,
- maksymalnie może mieć trzy miejsca.

Kliknięcie slotu:
- wybiera slot,
- wyświetla możliwe karty do przypisania (zgodnie z allowedSlots).

---

### PRAWA STRONA — Kolekcja / Kuźnia
Prawa kolumna SUB-META pełni rolę kuźni:

- wyświetla zebrane karty kolorów (DR),
- pokazuje ich ilość,
- w przyszłości umożliwia konwersję DR → sDR → PDR.

Na tym etapie:
- kolekcja służy do przypisywania kart do slotów,
- oraz jako koszt odblokowań.

---

## 4. Sloty META — zasady

### Przypisywanie kart
Przypisanie karty do slotu:
- jest akcją płatną,
- zużywa kartę z kolekcji,
- zapisuje konfigurację na dalszy RUN.

#### Koszt przypisania:
- 10 RP za każdą operację.

Operacje płatne:
- wpięcie karty do pustego miejsca,
- podmiana karty w slocie.

Jeśli RP są niewystarczające:
- opcja jest zablokowana,
- UI komunikuje koszt.

---

### Odblokowywanie miejsc w slotach
Każdy slot META może posiadać maksymalnie 3 miejsca.

Odblokowanie nowego miejsca kosztuje:
- 10 RP
- 3 karty DR koloru slotu

UI:
- przy slocie pojawia się mały „+” w kolorze slotu,
- kliknięcie inicjuje zakup miejsca.

---

### Dozwolone sloty (allowedSlots)
Każda karta definiuje listę allowedSlots.

Jeśli karta:
- nie pasuje do slotu → nie jest wyświetlana,
- nie może być przypisana.

Przykład:
- karty rytualne R1/R2:
  - allowedSlots: Czas, Cisza.

---

## 5. PRG — Programy Reakcji Gracza

PRG są systemem aktywnym, niezależnym od slotów META.

PRG:
- są kupowane w SUB-META,
- są używane w RUN,
- działają jako tryby przełączane w locie.

---

### Kategorie PRG
Istnieją cztery kategorie PRG, odpowiadające kolorom i aspektom:

1. 🔴 Wielkość ringu  
2. 🟡 Glue ↔ Odpychanie  
3. 🟢 Przyśpiesz ↔ Zwolnij  
4. 🔵 Meteory ↔ Planetoidy  

Każda kategoria:
- zawiera przeciwstawne opcje,
- pozwala na wybór stylu reakcji gracza.

---

### Miejsca PRG
Każda kategoria PRG:
- posiada maksymalnie 2 miejsca,
- miejsca są droższe niż sloty META.

Koszt odblokowania miejsca PRG:
- 30 RP
- 6 kart DR koloru kategorii

---

## 6. PRG w RUN

Po zakupie:
- PRG są dostępne w trakcie RUN,
- gracz może je przełączać w locie (toggle UI),
- aktywny jest jeden tryb PRG naraz (v1).

Przełączanie:
- jest natychmiastowe,
- nie wymaga powrotu do SUB-META.

---

## 7. Pauza i zamykanie SUB-META

Otwarcie SUB-META:
- zatrzymuje lub silnie spowalnia symulację świata.

Zamknięcie SUB-META:
- przyciskiem „Wróć”,
- wznawia symulację bez resetów.

---

## 8. Relacja z META końcowym

SUB-META:
- przygotowuje konfigurację RUN,
- umożliwia wielokrotne ingerencje.

META końcowe:
- jest pojedynczym, kosztownym zdarzeniem,
- resetuje RUN,
- przekształca zasoby w trwałe zmiany.

---

## 9. Status dokumentu

KANON v1.
Zgodny z ECONOMY_SYSTEM.md.
SUB-META jest miejscem decyzji, nie resetu.
