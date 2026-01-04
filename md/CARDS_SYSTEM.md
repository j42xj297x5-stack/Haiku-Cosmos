# Haiku Cosmos — CARDS SYSTEM
## Fundament kart, sekwencji, targetów, META i PRG (KANON)

R1 i R2 są rdzeniem systemu kart: definiują logikę sekwencji, ekonomię RP,
podstawowe targety i rozwój META/PRG. Wszystkie przyszłe karty są dodatkami,
które wchodzą z nimi w interakcje.

---

## 1. Definicje

### Karta
Karta to narzędzie wpływu na świat i na możliwości gracza.
Każda karta:
- ma kolor (lub parę kolorów),
- ma poziom mocy: DR / sDR / pDR,
- może być:
  - **aktywowane podczas RUNU** (efekt czasowy),
  - **zebrana do kolekcji** (do META/PRG/kuźni).

### Target
Target to konkretna zmiana w fizyce/logice świata lub w parametrach reakcji gracza.

---

## 2. Kolory i gałęzie

### 2.1 Gałęzie ŚWIATA (META) — 4 sloty
| Kolor | Slot META | Co kontroluje |
|---|---|---|
| 🔴 | FORMA | rozmiar orbit grawitacyjnych |
| 🟡 | INTENCJA | odbicia meteorów od orbit |
| 🟢 | CZAS | wydłużenie kart aktywowanych |
| 🔵 | CISZA | respawn kolorów po aktywacji |

### 2.2 Gałęzie GRACZA (PRG) — 4 sloty
| Kolor | Slot PRG | Co kontroluje |
|---|---|---|
| 🔴 | WIELKOŚĆ | rozmiar ringu (mniejszy = precyzja) |
| 🟡 | KLEJ | siła przyciągania |
| 🟢 | PRĘDKOŚĆ | tempo obiektów |
| 🔵 | OBIEKTY | oddziaływanie na planetoidy/planety |

---

## 3. RP i sekwencje — zasady globalne

- 1 harmoniczne połączenie = **1 RP**
- **Przerwanie sekwencji** = *pojedyncze* zebranie innego koloru niż aktualnie sekwencjonowany.
- DR/sDR/pDR to poziomy kart (w kolekcji i w kuźni):
  - **sDR = 3×DR**
  - **pDR = 9×DR = 3×sDR**
- Aktywowanie karty:
  - nie przerywa sekwencji,
  - ale aktywowane R1 **nie mogą** być użyte do tworzenia R2.

---

## 4. KARTA R1 — JEDNOKOLOROWA

### ID
`CARD_R1_SINGLE_COLOR`

### 4.1 Powstawanie (sekwencja R1 — DR)
- 2 harmoniczne połączenia jednego koloru z rzędu → otwarcie okna sekwencji
- 3. połączenie tego samego koloru → **1 karta R1 DR**
- przerwanie po 2 połączeniach (1 zebranie innego koloru):
  - RP z tych 3 zebrań = 3
  - mnożnik ×2
  - **nagroda: 6 RP**

### 4.2 Tworzenie R1 sDR / pDR w RUNIE (bez kuźni)
- **R1 sDR**: uzyskaj **3× R1 DR** tego samego koloru  
  (czyli 3 karty DR sumują się w 1 sDR)
- **R1 pDR**: uzyskaj **9× R1 DR** tego samego koloru  
  (czyli 9 kart DR sumuje się w 1 pDR)

W RUNIE następuje sumowanie:
- DR „wchodzą” w sDR/pDR,
- DR nie tworzą wtedy osobnych wpisów kolekcji (zastępowane wyższym poziomem).

### 4.3 R1 — tryb AKTYWOWANY (RUN)
Czas bazowy: **180 s**

Efekt (targety runtime):
- wybrany kolor:
  1) nie wchodzi na orbity grawitacyjne,
  2) nie tworzy planetoid,
  3) łączy się wyłącznie harmonicznie z tym samym kolorem,
  4) przelatuje swobodnie, jeśli nie jest przechwytywany.

Aktywowanie:
- zużywa kartę,
- nie przerywa sekwencji,
- aktywowana karta nie liczy się do R2.

### 4.4 R1 — tryb ZEBRANY (kolekcja → META/PRG/kuźnia)
Zebrana karta R1 może:
- wejść do slotu META koloru,
- wejść do slotu PRG koloru,
- być kosztem w kuźni,
- być składnikiem sekwencji R2.

---

## 5. KARTA R2 — DUAL (DWUKOLOROWA)

### ID
`CARD_R2_DUAL_COLOR`

### 5.1 Powstawanie R2 DR (sekwencja R2 — kanon)
Sekwencja R2 DR startuje, gdy:
1) gracz ma **2× R1 DR** koloru A (nieaktywowane),
2) następuje *pojedyncze* zebranie innego koloru B (start R2).

Aby zakończyć R2 DR sukcesem:
- gracz musi zebrać **2× R1 DR** koloru B (nieaktywowane),
- bez zebrania trzeciego koloru po drodze.

W praktyce oznacza to:
- 6 harmonicznych połączeń koloru A (→ 2× R1 DR A),
- następnie 6 harmonicznych połączeń koloru B (→ 2× R1 DR B),
→ **1× R2 DR (A+B)**.

### 5.2 Tworzenie R2 sDR / pDR (kanon skalowania)
- **R2 sDR** = **3× R2 DR**
- **R2 pDR** = **9× R2 DR** (= 3× R2 sDR)

Sumowanie zachodzi w RUNIE (bez kuźni), jeśli gracz nie aktywuje tych kart.

### 5.3 R2 — tryb AKTYWOWANY (RUN)
R2 można aktywować w RUNIE.

Efekt:
- działa tak, jakby aktywowano **dwie karty R1 równolegle**:
  - kolor A i kolor B jednocześnie,
  - bez interakcji między nimi.

Aktywowanie:
- zużywa kartę R2,
- nie przerywa sekwencji,
- nie resetuje postępu zbierania (poza faktem zużycia karty).

### 5.4 R2 — tryb ZEBRANY (kolekcja → połączenia)
Zebrana R2 służy do łączenia gałęzi:
- w świecie (META) oraz
- w mocy gracza (PRG),
a jej poziom DR/sDR/pDR wzmacnia efekt połączenia.

---

## 6. KANONICZNE EFEKTY META (świat) dla kart zebranych

Włożenie karty do META jest płatne RP (koszty z economy system; tu opisujemy tylko efekty).

### 6.1 META 🔴 FORMA — redukcja orbit
Po włożeniu czerwonej karty:
- **R1 DR**: planetoidy + planety → orbity **-15%**
- **R1 sDR**: planetoidy + planety **-30%**, gwiazdy **-15%**
- **R1 pDR**: wszystkie obiekty **-30%** + możliwość utworzenia podslotu **Ekspansja**

R2 w META (połączenia):
- zebrana R2 umożliwia aktywne połączenie dwóch gałęzi świata (tylko jedno aktywne naraz),
- wzmacnia karty Ekspansji w aktywnym połączeniu:
  - **R2 DR**: +5%
  - **R2 sDR**: +10%
  - **R2 pDR**: +15%

### 6.2 META 🟡 INTENCJA — odbicia od orbit
Po włożeniu żółtej karty:
- **R1 DR**: odbicie od planetoid **15%**, od planet **10%**
- **R1 sDR**: planetoidy **30%**, planety **15%**
- **R1 pDR**: planetoidy+planety **35%** + podslot Ekspansja

R2 w META: jak w 6.1 (połączenia świata i wzmacnianie Ekspansji).

### 6.3 META 🟢 CZAS — wydłużenie kart aktywowanych w RUNIE
Po włożeniu zielonej karty:
- **R1 DR**: +1 minuta do czasu kart aktywowanych
- **R1 sDR**: +2 minuty
- **R1 pDR**: +3 minuty + podslot Ekspansja

R2 w META: jak w 6.1 (połączenia świata i wzmacnianie Ekspansji).

### 6.4 META 🔵 CISZA — okno „tylko kolory aktywowane”
Po włożeniu niebieskiej karty:
- po aktywacji karty w RUNIE respawnują tylko jej kolory przez:
  - **R1 DR**: 5 s
  - **R1 sDR**: 10 s
  - **R1 pDR**: 15 s + podslot Ekspansja

R2 w META: jak w 6.1 (połączenia świata i wzmacnianie Ekspansji).

---

## 7. KANONICZNE EFEKTY PRG (moc gracza) dla kart zebranych

PRG to stałe wzmocnienia reakcji gracza, dostępne w RUN jako przełączniki/tryby.
Koszty i UI PRG są w economy/submeta docs; tu opisujemy tylko efekty.

### 7.1 PRG 🔴 WIELKOŚĆ — ring mniejszy (precyzja)
- **R1 DR**: ring **-15%**
- **R1 sDR**: **-30%**
- **R1 pDR**: **-50%** + możliwość połączenia z innym slotem (wymaga aktywnego połączenia R2)

### 7.2 PRG 🟡 KLEJ — siła przyciągania
- **R1 DR**: +15%
- **R1 sDR**: +25%
- **R1 pDR**: +35% + możliwość połączenia (R2)

### 7.3 PRG 🟢 PRĘDKOŚĆ — spowolnienie świata
- **R1 DR**: -5%
- **R1 sDR**: -10%
- **R1 pDR**: -15% + możliwość połączenia (R2)

### 7.4 PRG 🔵 OBIEKTY — oddziaływanie na większe obiekty
(oddziaływanie = przyciąganie/odpychanie; inne karty mogą zmienić jego rodzaj)
- **R1 DR**: +5% oddziaływania na planetoidy
- **R1 sDR**: +10% planetoidy, +5% planety skaliste
- **R1 pDR**: +15% planetoidy i wszystkie planety + możliwość połączenia (R2)

---

## 8. Połączenia PRG przez R2 (odbicie refleksyjne)

Po ustanowieniu połączenia przez kartę R2:
- powstaje dodatkowe miejsce („odbicie”) pozwalające osadzić właściwość z innej gałęzi,
- tylko jedno odbicie może być aktywne na raz.

Wzmocnienie efektu karty w slocie odbicia przez R2:
- **R2 DR**: 0%
- **R2 sDR**: +15%
- **R2 pDR**: +30%

---

## 9. Status

KANON.
Ten dokument opisuje:
- R1 i R2 (powstawanie, aktywacja, kolekcja),
- podstawowe targety runtime,
- podstawowe efekty META i PRG (DR/sDR/pDR),
- oraz logikę połączeń przez R2.

Wszystkie kolejne karty (milestones, triale, eventy) są dodatkami, które muszą być zgodne z tym fundamentem.
