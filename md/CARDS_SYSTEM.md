# Haiku Cosmos — CARDS SYSTEM (KANON)

Ten dokument definiuje **obowiązujący kanon systemu kart** w Haiku Cosmos.
Jest nadrzędny wobec:

- wcześniejszych wersji `CARDS_SYSTEM.md`,
- plików roboczych i koncepcyjnych,
- implementacji historycznych.

Jeśli kod nie zgadza się z tym dokumentem — **kod jest do poprawy**.

---

## 1. Definicje podstawowe kart R1 i R2

### Karta R1 i R2

Karta R1 i R2 jest efektem sekwencji harmonicznych połączeń w RUNIE.
R1 i R2 są rdzeniem systemu kart: definiują logikę sekwencji, ekonomię RP,
podstawowe targety i rozwój ŚWIAT/PRG. Wszystkie przyszłe karty są dodatkami,
które wchodzą z nimi w interakcje.

**Każda karta R1 i R2** :

- Posiada kolor (R1) lub parę kolorów (R2), być kartą trzy kolorową (R3 TODO) lub kartą cztero kolorową (R4 TODO)
- posiada poziom mocy:
  - DR - Doświadczenie Rezonansu,
  - sDR - sublimowane Doświadczenie Rezonansu,
  - pDR - pierwotne Doświadczenie Rezonansu.
- może zostać:
  - **aktywowane w RUNIE** (efekt runtime),
  - **zebrane do magazynu** 

### Kolekcjonowanie kart - MAGAZYN

Istnieje **jedna pula kart (magazyn)**.

- Każda karta, która nie została aktywowana w oknie 3 sekund (ze znikającym paskiem czasu),
  **trafia do magazynu**.
- Nie istnieje osobny „pool”, bufor czy ręka kart.
- Magazyn jest źródłem dla:
  - META-magazyn - miejsce gdzie przechowuje się nieużywane karty,
  - META-PRG - sloty zmieniające możliwości gracza podczas runtime,
  - META-Świat - sloty zmieniające mechanikę świata,
  - META-Kuźni - miejsce, gdzie przekształca się karty (np 3 karty R1 DR tworzą 1 kartę R1 sDR),

---

## 2. Kolory i gałęzie

### 2.1 META-Świat — wpływ na świat

| Kolor | Slot Świat | Znaczenie |
|---|---|---|
| 🔴 | FORMA | geometria i rozmiar orbit |
| 🟡 | INTENCJA | odbicia i interakcje z orbitami |
| 🟢 | CZAS | czas trwania efektów |
| 🔵 | CISZA | tempo i gęstość świata |

### 2.2 META-PRG — wpływ na gracza

| Kolor | Slot PRG | Znaczenie |
|---|---|---|
| 🔴 | WIELKOŚĆ | skala działania |
| 🟡 | KLEJ | siła przyciągania |
| 🟢 | PRĘDKOŚĆ | tempo reakcji |
| 🔵 | OBIEKTY | wpływ na większe byty |

---

## 3. RP i zasady globalne

### 3.1. 1 harmoniczne trafienie = **1 RP** czyli Punkt Rezonansu

### 3.2. Aktywowanie karty:

- zużywa kartę,
- **nie przerywa sekwencji R2**.
- W RUNIE istnieją wyłącznie sekwencje:
  - **R1 DR**
  - **R2 DR**
  - **R3 DR** (TODO)
  - **R4 DR** (TODO)

### 3.3 Poziomy **sDR / pDR** są osiągane **poza RUNEM**

  (META / kuźnia), nigdy przez sekwencję w trakcie gry.

---

## 4. KARTA R1 — JEDNOKOLOROWA

### ID
`CARD_R1_SINGLE_COLOR`

---

### 4.1 Powstawanie R1 DR (RUN)

Sekwencja:

- **3 harmoniczne trafienia tego samego koloru z rzędu**
→ **1 karta R1 DR**

Przerwanie sekwencji:

- trafienie innego koloru przed 3. trafieniem:
- RP z trafień ×2
- sekwencja resetuje się.

---

### 4.2 R1 — tryb AKTYWOWANY (RUN)

Czas bazowy: **180 sekund**

Efekt (KANON):
Aktywny kolor R1 staje się **GHOST**:

1) nie wchodzi na orbity grawitacyjne innych obiektów (planetoidy, planety, gwiazdy),
2) nie jest przechwytywany przez bezpośrednie trafienie w planetoidę, planetę, gwiazdę,
3) nie tworzy planetoid,
4) wchodzi w interakcje **wyłącznie z tym samym kolorem** (harmonicznie).

Aktywowanie moze zostać wykonane od razu po 3 trafieniach harmonicznych (3sekundowe okno), po tym czasie karta zostaje zebrana:

- zużywa kartę,
- **nie przerywa R2, R3, R4** jeśli sekwencja została uruchumiona,
- karta użyta w runtime **nie wchodzi w sekwencję R2, R3, R4**.

---

### 4.3 R1 — tryb ZEBRANY (MAGAZYN)

Zebrana karta R1:

- trafia do magazynu,
- może być użyta w:
  - META/Świat,
  - META/PRG,
  - META/kuźni.

---

## 5. KARTA R2 — DWUKOLOROWA (ZDARZENIE I ZASÓB)

### ID
`CARD_R2_DUAL_COLOR`

R2 moze być **jednocześnie zdarzeniem runtime i zasobem magazynowym**.
Jest kluczem do **wiązania gałęzi META i PRG**.

---

### 5.1 Definicja R2

R2 to **jedna długa sekwencja**:

- 2 × R1 koloru **A**,
- 2 × R1 koloru **B**.

Łącznie:

- **12 harmonicznych trafień**.

---

### 5.2 Start sekwencji R2

Sekwencja R2 startuje automatycznie, gdy:

- gracz zbierze **drugą kartę R1 DR tego samego koloru (A) w ramach jednego ciągu harmonicznych połączeń (6)**.

UI:

- komunikat 2s (bez paska):
  „Rozpoczęcie sekwencji R2”
- wizualnie:
  - prostokąt koloru A,
  - pusty prostokąt (B nieustalony).

Od tego momentu:

- `r2HitsTotal = 6`.

---

### 5.3 Drugi kolor B

- Kolor B to **pierwszy inny kolor trafiony po starcie R2**.
- Aby zakończyć R2 sukcesem:
  - należy wykonać **6 trafień jednego koloru B w jednym ciągu harmonicznym**
  → **2 karty R1 DR B**.

Po każdej karcie R1 B:

- normalne okno aktywacji (3s).

Aktywacja R1 B:

- **nie przerywa R2**
- resetuje wybór koloru B (umożliwia wybór innego B).

---

### 5.4 PORAŻKA R2

R2 kończy się porażką, jeśli:

- po ustaleniu koloru B
  nastąpi trafienie **jakiegokolwiek innego koloru**
  (w tym także koloru A).

Efekt porażki:

- wszystkie zebrane karty **pozostają w magazynie**,
- gracz otrzymuje bonus:
  **RP = r2HitsTotal × 3**,
- sekwencja R2 resetuje się całkowicie.

---

### 5.5 SUKCES R2

Sukces następuje, gdy:

- zebrane są:
  - 2 × R1 A,
  - 2 × R1 B,
  w ramach jednej sekwencji (12 harmonicznych trafień).

W momencie sukcesu:

1) Tworzona jest karta **R2 DR** jako `pending` (okno 3s).
2) **Natychmiast usuwane są z magazynu**:
   - 2 konkretne karty R1 A,
   - 2 konkretne karty R1 B.
   (to jest koszt R2)

Decyzja gracza (3s):

- **Aktywacja R2**:
  - R2 jest zużyta runtime,
  - nie trafia do magazynu,
  - 4 karty R1 pozostają skasowane.
  - użyta podczas RUN karta R2 aktywuje efekty dla dwóch kolorów jednocześnie (R1 A i R1B). Moc efektów jest podwojona. 
- **Brak aktywacji**:
  - R2 trafia do magazynu jako zasób,
  - 4 karty R1 pozostają skasowane.

---

## 6. R2 JAKO ZASÓB — WIĄZANIA GAŁĘZI w META

Zebrana karta R2 (w magazynie):

- jest **kluczem do wiązań gałęzi PRG i ŚWIAT**,
- może być włozona w META-ŚWIAT lub META-PRG, aby:
  - połączyć dwie gałęzie,
  - umożliwić hybrydowe efekty (np. FORMA+INTENCJA),
- może być wyciągnięta usuwając wiązanie (np. aby w kuźni podnieść tier do sDR lub pDR by ponownie stworzyć - tym razem silniejsze wiązanie)

Bez karty R2:

- **nie istnieją połączenia między gałęziami**.

### 6.1. Rodzaje wiązań gałęzi ŚWIAT

1) 🔴🟡 Forma - Intencja
2) 🟡🟢 Intencja - Czas
3) 🟢🔵 Czas - Cisza

### 6.2. Siła wzmocnienia wiązania

- R2 DR +15% dla połączonych gałęzi oraz karty slotu Ekspansja,
- R2 sDR +30% dla połączonych gałęzi oraz karty slotu Ekspansja,
- R2 pDR +50% dla połączonych gałęzi oraz karty slotu Ekspansja.

### 6.3. Wybór wiązań gałęzi

- tylko jedno wiązanie moze być aktywne,
- gracz ma wybór wybrać, które wiązanie jest w danej chwili aktywne (kliknięcie w kartę R2 w slocie oraz potwierdzenie aktywacji),

---

## 7. Świat — efekty kart zebranych

Do slotów wchodzą tylko karty tego samego koloru co slot.


### 🔴 FORMA

- DR: planetoidy −20%, planety −10%
- sDR: planetoidy −40%, planety/gwiazdy −20%
- pDR: planetoidy −60%, planety/gwiazdy −40%

### 🟡 INTENCJA

Odbicia od orbit (globalnie):

- DR: 30%
- sDR: 60%
- pDR: 80%

### 🟢 CZAS

Wydłużenie aktywacji:

- DR: +30 s
- sDR: +1 min
- pDR: +2 min

### 🔵 CISZA

Globalne zmniejszenie respawnu:

- DR: −20%
- sDR: −40%
- pDR: −60%

---

## 8. PRG (moc gracza) efekty kart zebranych

PRG to stałe wzmocnienia reakcji gracza, działające w RUN i aktywowane w META jako przełączniki/tryby.
Koszty i UI PRG są w economy/submeta docs; tu opisujemy tylko efekty.

### 8.1 PRG 🔴 WIELKOŚĆ — ring mniejszy lub większy (precyzja / zasięg)

- **R1 DR**:  **-20%**
- **R1 sDR**: **-40%** + możliwość połączenia gałęzi (R2) + dodatkowy slot Odbicie
- **R1 pDR**: **-60%** + możliwość połączenia gałęzi (R2) + dodatkowy slot Odbicie

### 8.2 PRG 🟡 KLEJ — siła przyciągania lub odpychania

- **R1 DR**: +20%
- **R1 sDR**: +40% + możliwość połączenia gałęzi (R2) + dodatkowy slot Odbicie
- **R1 pDR**: +60% + możliwość połączenia gałęzi (R2) + dodatkowy slot Odbicie

### 8.3 PRG 🟢 PRĘDKOŚĆ — spowolnienie lub przyśpieszenie wpływu na obiekty

- **R1 DR**: -20%
- **R1 sDR**: -40% + możliwość połączenia gałęzi (R2) + dodatkowy slot Odbicie
- **R1 pDR**: -60% + możliwość połączenia gałęzi (R2) + dodatkowy slot Odbicie

### 8.4 PRG 🔵 OBIEKTY — oddziaływanie na większe obiekty

(oddziaływanie = przyciąganie/odpychanie; inne karty mogą zmienić jego rodzaj)

- **R1 DR**: +20% oddziaływania na planetoidy
- **R1 sDR**: +40% planetoidy, +10% planety skaliste + możliwość połączenia gałęzi (R2) + dodatkowy slot Odbicie
- **R1 pDR**: +60% planetoidy, +40% na planety skaliste, +20% na planety gazowe + możliwość połączenia gałęzi (R2) + dodatkowy slot Odbicie

### 8.5. Połączenia PRG przez R2 sDR/pDR (odbicie refleksyjne)

#### 8.5.1. Istnieją 3 połączenia kartą R2

- 🔴🟢 Wielkość - Prędkość
- 🔴🔵 Wielkość - Obiekty
- 🟡🔵 Klej - Obiekty

#### 8.5.2. Moc połączeń R2

Gdy gałązie posiadają osadzoną kartę R1 typu sDR lub pDR odblokowuje się dla nich wiązanie przez kartę R2 (odpowiedni slot)

1) Karta R2 wzmacnia łączone gałęzie

- DR +10%,
- sDR +30%,
- pDR +60%.

2) tylko jedno odbicie może być aktywne na raz. Gracz wybiera je poprzez kliknięcie karty R2 w slocie i zatwierdzenie.

3) wzmocnienia gałęzi PGR 

### 8.6. Slot Odbicie w PRG

- Jest dodatkowym miejscem na kartę, która modyfikuje właściwości gałęzi (TODO). Np. zamiast pomniejszenia ringu moze być powiększony, zamiast przyciągania ring moze odpychać obiekty. 
- Slot pojawia się dopiero gdy w gałęzi jest karta poziomu minimalnie sDR R1

## 9. KUŹNIA (KANON)

- R1 DR i R2 DR **mogą powstać wyłącznie w RUNIE**.
- Kuźnia:
  - podnosi poziomy kart (sDR / pDR),
  - **nie tworzy R2 od zera**.

### 9.1. Tworzneie kart R1

- **R1 sDR**: gdy w magazynie znajdują się **3× R1 DR** tego samego koloru  
  (czyli 3 karty DR sumują się w 1 sDR - karty DR po sumowaniu zostają usunięte z magazynu)
- **R1 pDR**: gdy w magazynie znajdują się  **3× R1 sDR** tego samego koloru  
  (czyli 3 karty sDR sumuje się w 1 pDR - karty sDR po sumowaniu zostają usunięte z magazynu)

### 9.2. Tworzenie kart R2

- **R2 sDR**: gdy w magazynie znajdują się **3× R2 DR** tej samej pary kolorów  
  (czyli 3 karty DR sumują się w 1 sDR - karty DR po sumowaniu zostają usunięte z magazynu)
- **R2 pDR**: gdy w magazynie znajdują się  **3× R2 sDR** tej samej pary kolorów
  (czyli 3 karty sDR sumuje się w 1 pDR - karty sDR po sumowaniu zostają usunięte z magazynu)

---

## 10. STATUS

KANON OBOWIĄZUJĄCY.

R1 i R2 definiują:
- trudność,
- ekonomię,
- strukturę drzewka ŚWIAT/PRG.

Każda przyszła karta lub system
musi być z nimi zgodny.

--- 11 stycznia 2025