# Haiku Cosmos — SUB META SYSTEM (KANON)

Ten dokument definiuje **warstwę SUB META** w Haiku Cosmos.

SUB META to poziom:

- pomiędzy **CARDS SYSTEM** a **UI / ŚWIAT / RUN**,
- w którym karty stają się **stałymi trybami działania**,
- bez bezpośredniego opisu procentów, animacji i UI.

Jeżeli inny dokument opisuje *jak dokładnie* coś działa —  
ten dokument opisuje *dlaczego* i *w jakiej strukturze*.

---

## 1. Czym jest SUB META

SUB META to **warstwa konfiguracji świadomości gracza**.

Nie jest to:

- ekonomia (RP),
- ani aktywna mechanika RUN,
- ani wizualny UI.

SUB META:

- określa **jak karty są osadzane**,
- określa **jak wpływają na tryb gry**,
- definiuje **relacje między gałęziami** (PRG / ŚWIAT).

---

## 2. Gałęzie SUB META

SUB META składa się z dwóch głównych drzew:

1. **ŚWIAT** — wpływ kart na zachowanie świata gry  
2. **PRG** — wpływ kart na reakcje i możliwości gracza  

Każda gałąź:

- posiada własne sloty,
- przyjmuje tylko określone typy kart,
- może być modyfikowana przez wiązania (R2).

---

## 3. Karty w SUB META — role systemowe

### 3.1. R1 — tryby podstawowe

- R1 są **jedynymi kartami aktywowalnymi w RUN**.
- W SUB META R1:
  - definiują **podstawowy tryb działania** danej gałęzi,
  - są wymagane do odblokowania dalszych struktur (np. wiązań).

R1:

- są osadzane bezpośrednio w slotach PRG i ŚWIAT,
- ich tier (DR / sDR / pDR) wpływa na **siłę i zakres trybu**,
- stanowią fundament całego META.

---

### 3.2. R2 — wiązania (relacje)

- R2 **nie działają samodzielnie**.
- R2 pełnią rolę **kluczy relacyjnych** pomiędzy gałęziami.

R2 w SUB META:

- umożliwiają **połączenie dwóch gałęzi** (PRG–PRG lub ŚWIAT–ŚWIAT),
- wzmacniają i synchronizują ich działanie,
- nigdy nie istnieją bez aktywnych kart R1 w połączonych gałęziach.

Bez R2:

- każda gałąź działa **izolowanie**.

---

### 3.3. R3 — stabilizacja trybów (rezerwacja)

- R3 są kartami **wysokiego poziomu META**.
- Ich rola polega na:
  - utrwalaniu konfiguracji,
  - zmniejszaniu kosztów zmiany,
  - stabilizowaniu wybranych trybów.

R3:

- nie są wymagane do podstawowej gry,
- umożliwiają długoterminowe strategie,
- są przeznaczone dla graczy świadomie budujących konfiguracje.

(Szczegółowe efekty R3 są definiowane w osobnych dokumentach META.)

---

### 3.4. R4 — jedność konfiguracji

- R4 reprezentują **pełną integrację systemu**.
- Są kartami rzadkimi i meta-strukturalnymi.

R4 w SUB META:

- działają na **całe drzewo**, nie pojedynczy slot,
- umożliwiają globalne modyfikacje zasad,
- są projektowane jako fundament pod przyszłe systemy endgame.

R4 nie są wymagane do ukończenia gry podstawowej.

---

## 4. Sloty i konfiguracja

### 4.1. Sloty PRG

- Sloty PRG definiują **jak gracz oddziałuje na świat**.
- Przyjmują wyłącznie karty R1.
- Dodatkowe sloty mogą zostać odblokowane przez:
  - wyższy tier R1,
  - aktywne wiązania R2.

PRG jest **aktywną stroną META** — wpływa bezpośrednio na RUN.

---

### 4.2. Sloty ŚWIAT

- Sloty ŚWIAT definiują **jak świat reaguje na działania gracza**.
- Przyjmują wyłącznie karty R1.
- Są modyfikowane przez:
  - tier karty,
  - wiązania R2.

ŚWIAT jest **reaktywną stroną META**.

---

## 5. Wiązania (R2) w SUB META

1. Wiązania są zawsze:
   - jawne,
   - wybierane przez gracza,
   - ograniczone do **jednego aktywnego naraz**.
2. R2 nie tworzy efektu bez obecnych kart R1.
3. Usunięcie R2:
   - natychmiast zrywa wiązanie,
   - nie usuwa kart R1.

Wiązania:

- wzmacniają współdziałanie,
- nie zastępują indywidualnych efektów gałęzi.

---

## 6. Koszty i ekonomia

SUB META **nie definiuje kosztów**.

- Koszty RP są opisane w `ECONOMY_SYSTEM.md`.
- Logika tworzenia i wzmacniania kart jest opisana w `CARDS_SYSTEM.md`.

Ten dokument opisuje **strukturę i relacje**, nie liczby.

---

## 7. Relacja z UI i ŚWIATEM

- SUB META **nie definiuje UI**.
- SUB META **nie definiuje procentów ani timingów**.
- SUB META definiuje:
  - *co* jest możliwe,
  - *co* jest połączone,
  - *co* zależy od czego.

UI oraz reakcje świata są opisane w `UI_WORLD.md` i dokumentach świata.

---

## 8. Status dokumentu

**KANON OBOWIĄZUJĄCY.**

SUB META jest:

- warstwą spajającą system kart,
- językiem konfiguracji gry,
- pomostem między koncentracją a mechaniką.

---

11 stycznia 2026