> Status: KANON
> Obszar: System kart
> Źródło prawdy: TAK
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: ../maps/PROJECT_INDEX.md, ECONOMY_SYSTEM.md, SUB_META_SYSTEM.md, ../ui/UI_WORLD.md

# Haiku Cosmos — CARDS SYSTEM (KANON)

Ten dokument definiuje **kanoniczny system kart** w Haiku Cosmos.

Jeżeli implementacja gry lub inne dokumenty są z nim sprzeczne —  
**to implementacja lub dokumenty pomocnicze są do poprawy**.

---

## 1. Zasady nadrzędne

1. System kart jest podstawowym językiem progresji gry.
2. Karty powstają wyłącznie w trakcie RUN (gry).
3. Wzmacnianie kart odbywa się wyłącznie w META (KUŹNIA).
4. Tylko karty **R1** mogą być aktywowane w RUN.
5. Karty **R2 / R3 / R4** są kartami sekwencyjnymi i systemowymi (nieaktywne w RUN).
6. Sekwencje są procesem **ryzyka**: gracz decyduje, czy iść wyżej, czy przerwać.

---

## 2. Kolory bazowe

System używa **4 kolorów bazowych**, w stałej, kanonicznej kolejności:

1. 🔴 RED  
2. 🟡 YELLOW  
3. 🟢 GREEN  
4. 🔵 BLUE  

Kolejność ta jest używana do:

- budowy ID kart,
- renderingu kart wielokolorowych,
- unifikacji kombinacji (AB = BA).

---

## 3. Etapy sekwencji (nazwa + sens)

Sekwencje R1–R4 są strukturalnie analogiczne do przechodzenia przez kolejne „pokoje”.
Każdy kolejny etap wymaga przejścia przez poprzedni.

- **R1 — Wejście**
- **R2 — Ustabilizowanie**
- **R3 — Uciszenie**
- **R4 — Jedność**

Nazwy mają charakter opisowy (UI / META).
Mechanicznie system operuje na oznaczeniach R1–R4.

---

## 4. Typy kart i ID (R1–R4)

### 4.1. R1 — karta podstawowa (1 kolor)

- Powstaje po zamknięciu pierwszego kroku sekwencji.
- Jedyny typ karty możliwy do **aktywacji w RUN**.
- Aktywacja R1 **zawsze przerywa sekwencję** i resetuje ją do IDLE.

**ID (4):**

- `CARD_R1_RED`
- `CARD_R1_YELLOW`
- `CARD_R1_GREEN`
- `CARD_R1_BLUE`

**Wygląd:** jednokolorowy prostokąt.

---

### 4.2. R2 — karta kombinacyjna (2 kolory)

- Powstaje wyłącznie jako **cash-out sekwencji R2**.
- Jedna karta = jedna para kolorów (kolejność nie ma znaczenia).

**ID (6):**

- `CARD_R2_RED_YELLOW`
- `CARD_R2_RED_GREEN`
- `CARD_R2_RED_BLUE`
- `CARD_R2_YELLOW_GREEN`
- `CARD_R2_YELLOW_BLUE`
- `CARD_R2_GREEN_BLUE`

**Wygląd:** prostokąt podzielony poziomo:

- góra: kolor A
- dół: kolor B

---

### 4.3. R3 — karta kombinacyjna (3 kolory)

- Powstaje wyłącznie jako **cash-out sekwencji R3**.

**ID (4):**

- `CARD_R3_RED_YELLOW_GREEN`
- `CARD_R3_RED_YELLOW_BLUE`
- `CARD_R3_RED_GREEN_BLUE`
- `CARD_R3_YELLOW_GREEN_BLUE`

**Wygląd:** prostokąt podzielony na 3 poziome pasy (A / B / C).

---

### 4.4. R4 — karta pełnej sekwencji (4 kolory)

- Powstaje wyłącznie jako **cash-out sekwencji R4**.

**ID (1):**

- `CARD_R4_RED_YELLOW_GREEN_BLUE`

**Wygląd:** prostokąt podzielony na siatkę 2×2:

- góra: A | B
- dół: C | D

---

## 5. Sekwencje RUN (R1 → R4)

### 5.1. Zasada ogólna

1. Każda sekwencja **zawsze zaczyna się od R1**.
2. Sekwencja kolorów: **A → B → C → D**.
3. Każdy krok atomowy wymaga **3 harmonicznych trafień** tego samego koloru.

Kontrakt atomowego kroku (3 trafienia):

- **hit1/3** — ustanowienie kierunku koloru (bez zamknięcia kroku),
- **hit2/3** — otwarcie kroku sekwencji,
- **hit3/3** — zamknięcie kroku sukcesem.

Jeżeli w trakcie zbierania kroku (przed hit3) pojawi się inny kolor:

- poprzedni kierunek zostaje przerwany,
- licznik poprzedniego koloru nie jest kontynuowany,
- trafienie nowego koloru **nie przepada** i staje się natychmiast **hit1/3** nowego kierunku.

---

### 5.2. Okno decyzyjne (ryzyko) — 3 sekundy

Po zamknięciu kroku (trzecie trafienie koloru):

- **Lewa połowa:** Aktywuj `R1{kolor}`
- **Prawa połowa:** Kolekcja (cash-out)
- **Brak kliknięcia:** kontynuacja sekwencji (ryzyko)

---

### 5.3. Poziomy sekwencji

- Po A → `Aktywuj R1A` | `Kolekcja R1A`
- Po B → `Aktywuj R1B` | `Kolekcja R2AB`
- Po C → `Aktywuj R1C` | `Kolekcja R3ABC`
- Po D → `Aktywuj R1D` | `Kolekcja R4ABCD`

**Kolekcja:**

- tworzy **jedną kartę Rk**,
- resetuje sekwencję do IDLE.

**Brak kliknięcia:**

- sekwencja trwa dalej.

---

### 5.4. Przerwanie sekwencji (FAIL)

Sekwencja przerywa się natychmiast, gdy:

- pojawi się kolor niedozwolony dla aktualnego etapu ścieżki (np. złamanie reguł po zamknięciu wcześniejszych kroków),
- albo gracz złamie warunek aktywnej ścieżki A-track / R-track.

Uwaga: dla atomowego kroku zbierania koloru (hit1→hit2→hit3) obowiązuje zasada:
obcy kolor przerywa poprzedni kierunek i jednocześnie staje się hit1 nowego kierunku
(nie jest to „martwy reset” z utratą trafienia).

Nagrody przy FAIL:

- FAIL na R2 → `R1A`
- FAIL na R3 → `R1A + R1B`
- FAIL na R4 → `R1A + R1B + R1C`

Sekwencja resetuje się do IDLE.

---

## 5.5. Pętla R1 po ukończeniu R1(A): AA → AAA oraz karta Specjalna DS

Po ukończeniu podstawowej karty **R1(A)** (twarde 3 trafienia tego samego koloru),
system dopuszcza wejście w krótką pętlę R1 dla tego samego koloru A:

- **AA** (decyzja, nagroda 2×R1A)
- **AAA** (auto-nagroda DS(A), auto-zamknięcie)

Pętla ta:

- umożliwia **normalne farmienie kart R1** bez przechodzenia do R2,
- jest kompatybilna z zasadą „twardych trafień” (3–3–3–…),
- jest niezależna od tierów (tier podnosi wyłącznie KUŹNIA).

### 5.5.1. Zasada twarda

W pętli R1:

- po ustaleniu kierunku (pierwszy hit A) każdy inny kolor przerywa (fail),
- kroki AA i AAA są liczone jako **3 trafienia koloru A**.

### 5.5.2. AA — krok decyzyjny (2×R1A)

AA jest krokiem 3-hit dla koloru A:

- hit1: ustanowienie kierunku A
- hit2: start AA
- hit3: koniec AA

Po zakończeniu AA pojawia się okno decyzji (3s):

- **Aktywuj R1A** (bez dodania karty do magazynu, tylko efekt RUN)
- **Kolekcja**: dodaje do magazynu **2× R1A DR**
- brak kliknięcia: kontynuacja do AAA

AA może zostać przerwane innym kolorem:

- nagroda: +RP (combo dla R1) oraz **1× R1A**
- bez tekstu „niepowodzenie” (komunikacja poprzez punkty i karty)

### 5.5.3. AAA — krok auto-nagrody (DS)

AAA jest krokiem 3-hit dla koloru A:

- hit1: kierunek A
- hit2: start AAA
- hit3: koniec AAA

Po ukończeniu AAA:

- gracz otrzymuje automatycznie **kartę Specjalną DS(A)**,
- pętla kończy się automatycznie i system wraca do IDLE,
- brak okna decyzji.

AAA może zostać przerwane innym kolorem:

- nagroda: +RP (combo dla R1) oraz **2× R1A**
- bez tekstu „niepowodzenie” (komunikacja poprzez punkty i karty)

---

## 6. R2 jako zasób systemowy — wiązania META

1. Karta R2 jest **kluczem do wiązań gałęzi w META** (ŚWIAT i PRG).
2. Bez karty R2 **nie istnieją żadne wiązania między gałęziami**.
3. Karta R2 może być:
   - osadzona w META (tworzy wiązanie),
   - wyciągnięta (wiążanie znika),
   - wzmocniona w Kuźni i użyta ponownie jako silniejsze wiązanie.
4. W danym momencie **aktywne może być tylko jedno wiązanie**.

### 6.1. Rodzaje wiązań (systemowe)

#### ŚWIAT

- 🔴🟡 Forma — Intencja
- 🟡🟢 Intencja — Czas
- 🟢🔵 Czas — Cisza

#### PRG

- 🔴🟢 Wielkość — Prędkość
- 🔴🔵 Wielkość — Obiekty
- 🟡🔵 Klej — Obiekty

Szczegółowe efekty wiązań są opisane w dokumentach META.

---

## 6.2. Karta Specjalna DS (Dodatkowy Slot)

### 6.2.1. Definicja

**DS** to karta Specjalna powiązana z kolorem.

- DS(A) odpowiada kolorowi A (🔴/🟡/🟢/🔵).
- DS jest zużywana przy rozszerzaniu slotów w META.

### 6.2.2. Pozyskiwanie

Podstawowe źródło DS(A):

- ukończenie sekwencji **AAA** po wcześniejszym R1(A).

W przyszłości DS może pojawiać się także w innych kontekstach (eventy / nagrody), ale kanon bazowy to AAA.

### 6.2.3. Użycie

DS(A) jest wymagana do:

- rozszerzenia slotu danego koloru o dodatkowe miejsce (Dodatkowy Slot),
- odblokowania miejsc specjalnych w slotach tego koloru (ODB / EKS) — wymagają DS jako koszt wejścia.

Koszt RP użycia DS (tymczasowo):

- **30 RP** za rozszerzenie miejsca.

### 6.2.4. Wygląd (UI)

- biała ramka
- wewnątrz znak „+” w kolorze A

### 6.2.5. Tier i barwienie (kierunek rozwoju)

DS jest kartą Specjalną niezależną od tierów R1–R4.
W przyszłości karta Specjalna może być „barwiona” i przekuwana do slotów (np. przez użycie pDR R1 koloru slotu),
ale nie jest to wymagane dla podstawowego działania DS jako Dodatkowego Slotu.

## 7. KUŹNIA (META) — wzmocnienia kart

### 7.1. Zasady ogólne

1. Karty **DR** powstają wyłącznie w RUN.
2. Kuźnia:
   - podnosi tier kart (sDR / pDR),
   - **nie tworzy kart R2/R3/R4 od zera**.
3. Każde ID wzmacniane jest **niezależnie**.

---

### 7.2. Wzmocnienia R1

- `3× R1 DR` (ten sam kolor) → `1× R1 sDR`
- `3× R1 sDR` (ten sam kolor) → `1× R1 pDR`

---

### 7.3. Wzmocnienia R2

- `3× R2 DR` (ta sama para kolorów) → `1× R2 sDR`
- `3× R2 sDR` (ta sama para kolorów) → `1× R2 pDR`

---

### 7.4. Wzmocnienia R3

- `3× R3 DR` (ta sama trójka kolorów) → `1× R3 sDR`
- `3× R3 sDR` (ta sama trójka kolorów) → `1× R3 pDR`

---

### 7.5. Wzmocnienia R4

- `3× R4 DR` → `1× R4 sDR`
- `3× R4 sDR` → `1× R4 pDR`

---

## 8. Integracja z META

1. Karty R1 mogą być osadzane w slotach META jako aktywne modyfikatory.
2. Karty R2 umożliwiają wiązania gałęzi META.
3. Karty R3 i R4 są kartami wysokiego poziomu, przeznaczonymi do przyszłych systemów META.
4. Szczegółowe efekty kart są definiowane w osobnych dokumentach META.

---

## 9. Status dokumentu

**KANON OBOWIĄZUJĄCY.**

Wszystkie wcześniejsze definicje:

- R2 jako „drugiej R1”,
- sekwencji bez ryzyka,
- wiązań bez kart

są **nieaktualne**.

---

11 stycznia 2026
