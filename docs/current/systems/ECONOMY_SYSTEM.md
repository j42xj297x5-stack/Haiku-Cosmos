> Status: KANON
> Obszar: Ekonomia RP
> Źródło prawdy: TAK
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: ../maps/PROJECT_INDEX.md, CARDS_SYSTEM.md, SUB_META_SYSTEM.md, ../ui/UI_WORLD.md

# Haiku Cosmos — ECONOMY SYSTEM (KANON)

Ten dokument definiuje **kanoniczny system ekonomii RP (Resonance Points)** w Haiku Cosmos.

Zakres dokumentu:
- koszty operacji META (sloty, Kuźnia),
- zasady naliczania RP w RUN,
- system combo RP oparty o sekwencje R1–R4.

Jeżeli inny dokument lub implementacja są z nim sprzeczne —  
**one są do poprawy**.

---

## 1. Waluta podstawowa — RP

**RP (Resonance Points)** są jedyną walutą ekonomiczną gry.

RP:

- zdobywane są wyłącznie w RUN,
- wydawane są wyłącznie w META (sloty, Kuźnia),
- nie są losowe — wynikają bezpośrednio z jakości sekwencji i koncentracji gracza.

---

## 2. Koszty META (stałe)

### 2.1. Sloty META (ŚWIAT / PRG)

- Włożenie karty do slotu: **10 RP**
- Wyciągnięcie karty ze slotu: **10 RP**

Koszt dotyczy każdej operacji, niezależnie od tieru karty.

---

### 2.2. KUŹNIA — koszty wzmacniania kart

Koszt zależy od **typu karty (R1–R4)** oraz **poziomu wzmacniania**.

#### R1

- DR → sDR: **30 RP**
- sDR → pDR: **90 RP**

#### R2

- DR → sDR: **60 RP**
- sDR → pDR: **180 RP**

#### R3

- DR → sDR: **90 RP**
- sDR → pDR: **270 RP**

#### R4

- DR → sDR: **120 RP**
- sDR → pDR: **360 RP**

Zasady Kuźni (logika kart, wymagane ilości) są opisane w `CARDS_SYSTEM.md`.  
Ten dokument definiuje **wyłącznie koszty RP**.

---

## 3. Naliczanie RP w RUN

### 3.1. Jednostka bazowa

- **Każde harmoniczne trafienie = 1 RP (bazowe)**.
- RP są naliczane w ramach aktualnego ciągu sekwencji.

---

## 4. Mnożniki sekwencji — pierwszy ciąg

Dla pojedynczej sekwencji R1 → R4:

- R1 (Wejście): **×2 RP**
- R2 (Ustabilizowanie): **×3 RP**
- R3 (Uciszenie): **×4 RP**
- R4 (Jedność): **×5 RP**

Mnożnik obowiązuje dla RP zdobytych w ramach **danego poziomu sekwencji**.

---

## 5. Łańcuch sekwencji (kolejne ciągi)

Jeżeli gracz:

- nie aktywuje karty R1,
- nie wykona cash-out (nie zbierze R4),
- nie przerwie sekwencji błędem,

a po zakończeniu R4 rozpocznie nową sekwencję **o tej samej strukturze kolorów**:

> **A → B → C → D**

wówczas rozpoczyna się **kolejny ciąg sekwencji RP**.

---

## 6. Mnożniki RP — drugi ciąg

Dla **drugiego ciągu sekwencji** (ciągłość koncentracji):

- R1: **×6 RP**
- R2: **×7 RP**
- R3: **×8 RP**
- R4: **×9 RP**

Każdy kolejny ciąg:

- wymaga zachowania tej samej struktury kolorów (A → B → C → D),
- zostaje zerwany przy jakimkolwiek błędzie lub decyzji gracza.

---

## 7. Przerwanie ciągu ekonomicznego

Ciąg sekwencji RP zostaje **natychmiast przerwany**, gdy:

1. gracz zbierze inny kolor niż oczekiwany w danym kroku,
2. gracz aktywuje kartę R1,
3. gracz wykona cash-out (zbierze R2,R3,R4),
4. struktura kolorów nowej sekwencji różni się od poprzedniej.

Po przerwaniu:

- mnożnik RP wraca do poziomu bazowego (pierwszy ciąg),
- kolejna sekwencja traktowana jest jako nowa.

Uwaga operacyjna:

- przerwanie atomowego kroku przez inny kolor nie oznacza utraty tego nowego trafienia,
- nowe trafienie ustanawia nowy kierunek jako hit1/3,
- jeżeli przerwanie dotyczy głębszego etapu R-track, fail rozlicza się automatycznie (z nagrodami częściowymi zgodnymi z CARDS),
- po tym rozliczeniu system jest już w nowym kierunku hit1/3 (bez dodatkowego „pustego” trafienia),
- naliczanie RP powinno być spójne z aktualnym stanem sekwencji po tej zmianie kierunku.

---

## 8. Relacja ECONOMY ↔ CARDS SYSTEM

- `CARDS_SYSTEM.md` definiuje **jak powstają karty i sekwencje**.
- `ECONOMY_SYSTEM.md` definiuje **ile RP daje dana jakość sekwencji** oraz **ile RP kosztują operacje META**.

Dokumenty są rozłączne i komplementarne.

---

## 9. Status dokumentu

**KANON OBOWIĄZUJĄCY.**

System RP jest bezpośrednim odzwierciedleniem:

- koncentracji,
- ciągłości,
- ryzyka podejmowanego przez gracza.

---

11 stycznia 2026


## 8. Rozdział decyzji: karta vs combo RP (HUD v2, robocze)

Kierunek do synchronizacji z HUD v2 (`../ui/HUD_SYSTEM.md`):

- Gracz wybiera między materializacją karty sekwencyjnej a utrzymaniem ciągu/combo.
- Zebranie karty sekwencyjnej `R2/R3/R4` nie wypłaca dodatkowego combo punktowego za ten poziom.
- Jeśli gracz kontynuuje i sekwencja zostaje przerwana, wypłacana jest tylko premia combo oraz częściowe karty `R1` zgodnie z poziomem przerwania.
- Finalne liczby i formuły balansu pozostają **DO STROJENIA**.

To jest kierunek roboczy i wymaga osobnego passu runtime/balance.
