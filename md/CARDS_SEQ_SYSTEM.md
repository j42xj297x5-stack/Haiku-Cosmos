# Haiku Cosmos — CARDS SYSTEM (KANON)

Ten dokument definiuje **kanoniczny system kart** w Haiku Cosmos.

Jeżeli implementacja gry lub inne dokumenty są z nim sprzeczne —  
**to implementacja lub dokumenty pomocnicze są do poprawy**.

---

## 1. Zasady nadrzędne

1. System kart jest podstawowym językiem progresji gry.
2. Karty powstają w trakcie RUN (gry) oraz w Kuźni (META).
3. Wzmacnianie kart odbywa się wyłącznie w META (KUŹNIA).
4. Karty **R1** mogą być aktywowane w RUN.
5. Karty powstające w wyniku sekwencji **R2 / R3 / R4** oraz karta **DS** powstająca w wyniku sekwencji **A > AA > AAA**są kartami  systemowymi (nieaktywne w RUN).
6. Sekwencje są procesem **ryzyka**: gracz decyduje, czy kontynuować sekwencję, czy przerwać i zebrać kartę.

### 1.1. Definicja sekwencji harmonicznej

Sekwencją harmoniczną nazywamy proces 3 połączeń /zderzeń dwóch meteorów tego samego kolory:

- pierwsze połączenie - wybranie kierunku (koloru sekwencji)
- drugie połączenie - wejście w sekwencję (kontynuacja koloru sekwencji)
- trzecie połączenie - zakończenie sekwencji sukcesem

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

## 3. Rodzaje sekwencji

Podczas gry istnieją dwie podstawowe sekwencje:

   1) typu R1–R4 gdzie:
      - R1 to sekwencja trzech uderzeń harmonicznych koloru A
      - R2 to sekwencja trzech uderzeń harmonicznych koloru A oraz sekwencja trzech uderzeń harmonicznych koloru B
      - R3 to sekwencja trzech uderzeń harmonicznych koloru A oraz sekwencja trzech uderzeń harmonicznych koloru B oraz sekwencja trzech uderzeń harmonicznych koloru C
      - R4 to sekwencja trzech uderzeń harmonicznych koloru A oraz sekwencja trzech uderzeń harmonicznych koloru B oraz sekwencja trzech uderzeń harmonicznych koloru C oraz sekwencja trzech uderzeń harmonicznych koloru D

   2) typu A > AA > AAA gdzie:
      - A jest analogiczna do sekwencji R1 dla koloru A
      - AA jest analogiczna do sekwencji R1 dla koloru A
      - AAA jest analogiczna do sekwencji R1 dla koloru A
   
      Wynikiem pełnej ukończonej sekwencji AAA jest karta **Dodatkowego slotu** DS

---

## 4. Typy kart i ID (R1–R4)

### 4.1. R1 — karta podstawowa (1 kolor)

- Powstaje po zakończeniu sukcesem trzy krokowej sekwencji harmonicznej dla jednogo koloru A.
- Jedyny typ karty sekwencyjnej możliwy do **aktywacji w RUN**.
- Aktywacja R1 **zawsze przerywa sekwencję** i resetuje ją do IDLE.
- Kolekcja karty R1 **zawsze przerywa sekwencję** i resetuje ją do IDLE

**ID (4):**

- `CARD_R1_RED`
- `CARD_R1_YELLOW`
- `CARD_R1_GREEN`
- `CARD_R1_BLUE`

**Wygląd:** jednokolorowy prostokąt.

---

### 4.2. R2 — karta kombinacyjna (2 kolory)

- Powstaje tylko po udanym wykonaniu sekwencji R2 jako **cash-out sekwencji R2**, gdy gracz zdecyduje się na zebranie tej karty.
- Jedna karta = jedna para kolorów A i B (kolejność sekwencji A i B nie ma znaczenia).

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

- Powstaje tylko tylko po udanym wykonaniu sekwencji R3 jako **cash-out sekwencji R3**, gdy gracz zdecyduje się na zebranie karty.

**ID (4):**

- `CARD_R3_RED_YELLOW_GREEN`
- `CARD_R3_RED_YELLOW_BLUE`
- `CARD_R3_RED_GREEN_BLUE`
- `CARD_R3_YELLOW_GREEN_BLUE`

**Wygląd:** prostokąt podzielony na 3 poziome pasy (A / B / C).

---

### 4.4. R4 — karta pełnej sekwencji (4 kolory)

- Powstaje tylko po udanym wykonaniu sekwencji R4 jako **cash-out sekwencji R4**, gdy gracz zdecyduje się na zebranie karty.

**ID (1):**

- `CARD_R4_RED_YELLOW_GREEN_BLUE`

**Wygląd:** prostokąt podzielony na siatkę 2×2:

- góra: A | B
- dół: C | D

---

## 5. Sekwencje w RUN (R1 → R4) oraz (A > AA > AAA)

### 5.1. Zasada ogólna

1. Każda sekwencja **zawsze zaczyna się od R1 A**.
2. Sekwencja kolorów: **A → B → C → D** lub **A → AA → AAA** 
3. Każdy krok wymaga **3 harmonicznych trafień** tego samego koloru.
4. Jeśli podczas wykonywania sekwencji zebrany zostanie inny kolor niż aktualnie zbierany sekwencja zostaje przerwana jako **fail**.
   Poniżej przedstawiono schemat działania sekwencji R1 > R2 > R3 > R4:
   - Hit A > Hit A > Hit A = R1 > Hit B > Hit B > Hit B = R2 > Hit C > Hit C > Hit C = R3 > Hit D > Hit D > > Hit D = R4
   Poniżej przedstawiono schemat działania sekwencji A > AA > AAA
   - Hit A > Hit A > Hit A = R1 > Hit A > Hit A > Hit A = R1 > Hit A > Hit A > Hit A = R1
---

### 5.2. Okno decyzyjne (ryzyko) — 3 sekundy

Po zamknięciu kroku (trzecie trafienie koloru):

- **Lewa połowa:** Aktywuj `R1{kolor}`
- **Prawa połowa:** Kolekcja (cash-out)
- **Brak kliknięcia:** kontynuacja sekwencji (ryzyko)

---

### 5.3. Poziomy sekwencji R1-R4
 
- Po A → `Aktywuj R1A` | `Kolekcja R1A`
- Po B → `Kolekcja R2AB`
- Po C → `Kolekcja R3ABC`
- Po D → `Kolekcja R4ABCD`

**Kolekcja:**

- tworzy **jedną kartę R1 lub R2 lub R3 lub R4**,
- resetuje sekwencję do IDLE.

**Brak kliknięcia:**

- sekwencja trwa dalej aż do R4, wtedy automatycznie karta zostaje zebrana i sekwencja R4 kończy się sukcesem.

---

### 5.4. Przerwanie sekwencji (FAIL)

KAżda sekwencja harmoniczna przerywa się natychmiast, gdy:

- w trakcie zbierania aktualnego kroku pojawi się inny kolor.

Sekwencja resetuje się do IDLE. W zależności od kroku sekwencji gracz zdobywa dodatkowe combo punkty RP. 

---

## 5.5. Pętla R1 po ukończeniu R1(A): AA → AAA oraz karta Specjalna DS

Po ukończeniu podstawowej karty **R1(A)** (3 trafienia tego samego koloru),
system dopuszcza wejście w krótką pętlę R1 dla tego samego koloru A. Aby wejść w sekwencję A > AA > AAA należy po zebraniu karty R1 koloru A od razu zacząć zbierać kolor A

- **A** - Hit A > Hit A > Hit A = R1 A
- **AA**  - Hit A > Hit A > Hit A = R1 A > Hit A > Hit A > Hit A = R1 A
- **AAA** - Hit A > Hit A > Hit A = R1 A > Hit A > Hit A > Hit A = R1 A > Hit A > Hit A > Hit A = R1 A 

Trafienie harmoniczne innego koloru automatycznie przerywa sekwencję - **Fail**

Gdy sekwencja AAA jest ukończona sukcesem, automatycznie się zamyka i tworzy kartę DS o kolorze A.


## 6. R2 jako zasób systemowy — wiązania META

1. Karta R2 jest **kluczem do wiązań gałęzi w META** (ŚWIAT i PRG).
2. Bez karty R2 **nie istnieją żadne wiązania między gałęziami**.
3. Karta R2 może być:
   - osadzona w META (tworzy wiązanie),
   - wyciągnięta (wiążanie znika),
   - wzmocniona w Kuźni i użyta ponownie jako silniejsze wiązanie.
4. W danym momencie **aktywne może być tylko jedno wiązanie dla Świata i jedno dla PRG**.

### 6.1. Rodzaje wiązań R2 

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

- ukończenie sekwencji **AAA**.

### 6.2.3. Użycie

DS(A) jest wymagana do:

- rozszerzenia slotu danego koloru o dodatkowe miejsce (Dodatkowy Slot),
- odblokowania miejsc specjalnych w slotach tego koloru (ODB / EKS / MET) — wymagają DS jako koszt wejścia.

### 6.2.4. Wygląd (UI)

- biała ramka
- wewnątrz znak „+” w kolorze A

---

## 7. R3 — ROZPRYSK HARMONICZNY (MUTATOR PRG I ŚWIATA)

### 7.1. Pozycja systemowa

R3 jest kartą wysokiego poziomu META.

- nie działa jako aktywowalna karta R1 w RUN,
- nie zmienia globalnie parametrów świata,
- działa wyłącznie poprzez modyfikację efektu harmonicznego trafienia.

R3:
- modyfikuje chwilowo parametry PRG,
- wywołuje lokalny stan przemiany obiektów świata,
- umożliwia tworzenie kart specjalnych z obiektów.

W danym momencie aktywna może być tylko jedna karta R3.

---

### 7.2. Aktywacja w RUN

- R3 jest osadzana w SUB META.
- Wszystkie posiadane R3 mogą być umieszczone w slotach META (Rozprysk harmoniczny).
- W RUN aktywna jest tylko jedna R3.
- Zmiana aktywnej R3 odbywa się poprzez przyciski w lewej części HUD (analogicznie do przełączania PRG) oraz w META.

Zmiana aktywnej R3:
- nie resetuje świata,
- nie resetuje sekwencji,
- nie zmienia tieru kart,
- zmienia jedynie charakter przyszłych rozprysków harmonicznych.

---

### 7.3. Zasada działania

Bez aktywnej R3:

Harmoniczne trafienie = RP + progres sekwencji.

Z aktywną R3:

Harmoniczne trafienie = RP + progres sekwencji + Rozprysk.

Rozprysk:
- posiada promień zależny od tieru R3,
- chwilowo nadpisuje wybrane parametry PRG,
- wpływa na obiekty świata i wprowadza niektóre z nich w stan „pulsacji”,
- umożliwia ich przemianę lub kondensację.

Rozprysk nie zatrzymuje eonu ani nie zmienia globalnych praw świata.

---

### 7.4. Tier R3 a zakres oddziaływania

#### R3 DR
- mały promień rozprysku,
- działa na: meteory i orbitery, 
- czas działania na obiekty, które wejdą w zasięg rozprysku jest ograniczony do 10s. 
- chwilowo nadpisuje jeden parametr PRG, który jest w aktywnej gałęzi.

#### R3 sDR
- średni promień rozprysku,
- działa na: meteory, orbitery, planetoidy, planety,
- chwilowo nadpisuje dwa parametry PRG w dwóch gałęziach PRG w ramach aktywacji (po jednym na gałąź),
- wprowadza stan pulsacji dla meteorów i planetoid, które znajdą się w promieniu rozprysku (30 s).

#### R3 pDR
- duży promień rozprysku,
- działa również na gwiazdy,
- chwilowo nadpisuje trzy parametry PRG w dwóch gałęziach PRG w ramach aktywacji (po jednym na gałąź) oraz jeden parametr karty ODB,
- umożliwia generowanie kart specjalnych wysokiego poziomu.
- umożliwia "Akretację energii harmonicznej" z gwiazd aktywując na 10 s efekt jak po zastosowaniu karty R1 o danym kolorze (zależne od koloru gwiazdy)

Tier zwiększa:
- promień,
- zakres ontologiczny,
- głębokość przemiany.

Tier nie zwiększa bezpośrednio RP.

---

### 7.5. Cztery archetypy R3

#### 7.5.1. R3 RED_YELLOW_GREEN  
(brak 🔵)

Styl: Rezonator Materii

PRG override:
- 🔴 Radius ↑
- 🟡 Glue zmienny
- 🟢 Prędkość modulowana

Świat:
- puls wszystkich obiektów w aktualnym zakresie PRG,
- meteory mogą łączyć się niezależnie od koloru,
- planetoidy szybciej rosną.

---

#### 7.5.2. R3 RED_YELLOW_BLUE  
(brak 🟢)

Styl: Archiwista (Stabilizacja Stanu)

PRG override:
- 🔴 Radius ↑
- 🟡 Glue ↑
- 🔵 rozszerzenie klasy obiektów

Świat:
- obiekty w rozprysku przechodzą w stan pulsacji,
- planetoida może zostać wyjęta jako karta,
- gwiazda może oddać fragment energii.

---

#### 7.5.3. R3 RED_GREEN_BLUE  
(brak 🟡)

Styl: Kondensator Materii

PRG override:
- 🔴 Radius ↑
- 🟢 Prędkość modulowana
- 🔵 rozszerzenie klasy obiektów

Świat:
- orbiter → pył koloru,
- pył wzmacnia meteory tego samego koloru,
- pulsujące meteory → karta „Meteor”,
- 2 pulsujące planetoidy → karta „Asteroida”.

---

#### 7.5.4. R3 YELLOW_GREEN_BLUE  
(brak 🔴)

Styl: Wędrowiec (Manipulator Trajektorii)

PRG override:
- 🟡 Glue zmienny
- 🟢 Prędkość ↑ / ↓
- 🔵 rozszerzenie klasy obiektów

Świat:
- brak odbicia od ścian (czasowo),
- planetoidy mogą opuścić system,
- meteory zmieniają trajektorie.

---

### 7.6. Stan pulsacji

Obiekt objęty rozpryskiem może wejść w stan pulsacji:

- czas trwania zależny od tieru,
- obiekt może łączyć się w kartę specjalną,
- zmieniać trajektorię,
- zostać wyjęty jako karta,
- utracić masę.

Stan pulsacji jest warunkiem tworzenia kart specjalnych.

---

### 7.7. Slot modyfikacyjny R3

Każda karta R3 posiada 1 slot modyfikacyjny.

Do slotu można włożyć kartę specjalną wykutą w Kuźni.

Karta modyfikacyjna:
- nie zwiększa promienia,
- nie daje bonusu procentowego,
- odblokowuje dodatkową właściwość danego archetypu R3.

---

### 7.8. Relacja z ekonomią i eonem

R3:
- nie zwiększa bezpośrednio RP,
- nie zatrzymuje eonu,
- nie zmienia globalnych praw świata.

R3 umożliwia:
- kontrolę gęstości świata,
- zwiększenie szans na karty specjalne,
- głębsze zarządzanie przestrzenią.

---

## 8. R4 — ZAPIS EONU (ESSENCE TRANSFER)

### 8.1. Definicja

Karta R4 reprezentuje zakończenie pełnej sekwencji czterech kolorów  
oraz możliwość zapisania esencji wybranych slotów META  
na potrzeby następnego eonu.

R4:
- nie działa w RUN,
- nie wpływa bezpośrednio na świat w trakcie gry,
- aktywuje się wyłącznie w momencie przejścia do nowego eonu.

---

### 8.2. Tier R4 a zakres zapisu

| Tier | Liczba slotów możliwych do zapisu |
|------|-----------------------------------|
| R4 DR  | 1 slot |
| R4 sDR | 2 sloty |
| R4 pDR | 3 sloty |

---

### 8.3. Co jest zapisywane

Zapis dotyczy esencji slotu, nie kart jako obiektów.

---

### 8.4. Efekt w nowym eonie

- karty i RP są resetowane,
- zapisane sloty posiadają podwyższony parametr bazowy.

---

### 8.5. Zasady ogólne

R4:
- nie zatrzymuje eonu,
- nie zwiększa RP,
- nie omija progresji.

---

### 8.6. Relacja z systemem eonów

Gracz nie kontroluje czasu eonu.  
R4 pozwala jedynie przenieść jakość konfiguracji do kolejnego cyklu.

---

## 9. KUŹNIA (META) — wzmocnienia kart

### 9.1.
### 9.2.
### 9.3.
### 9.4.
### 9.5.

---

## 10. Integracja z META

1. Karty R1  
2. Karty R2  
3. Karty R3  

---

## 11. Status dokumentu

Sekcja aktualizowana wraz z rozwojem systemu.

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
3. Karty R3 .
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
