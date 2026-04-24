# Checklista manualna — przejęcie kierunku przez obcy kolor (R-track + AA/AAA)

Cel: potwierdzić kontrakt „obcy kolor nie przepada” dla atomowych kroków 3-hit w R1/R2/R3/R4 oraz w pętli AA/AAA.

## 1) R1 bazowy sukces — A A A
- Oczekiwane: hit1 A → hit2 A → hit3 A → sukces R1(A).

## 2) R1 przejęcie kierunku — A B B B
- Oczekiwane:
  - A = hit1,
  - B przerywa A i jest hit1 nowego kierunku,
  - kolejne B = hit2 i hit3,
  - wynik: sukces R1(B).

## 3) R1 przejęcie po hit2 — A A B B B
- Oczekiwane:
  - A = hit1, hit2,
  - B przerywa A i jest hit1,
  - kolejne B = hit2 i hit3,
  - wynik: sukces R1(B).

## 4) R2 fail + natychmiastowy nowy hit1 — A A A B B C C C
- Oczekiwane:
  - A zamyka R1,
  - B rozpoczyna próbę R2,
  - C przerywa próbę B,
  - fail rozlicza się automatycznie,
  - to samo C jest hit1 nowej sekwencji,
  - kolejne C = hit2 i hit3,
  - wynik: sukces R1(C).

## 5) R2 podwójne przejęcie — A A A B B C D D D
- Oczekiwane:
  - C przerywa B i staje się hit1,
  - D przerywa C i staje się hit1,
  - kolejne D = hit2 i hit3,
  - wynik: sukces R1(D).

## 6) R3 fail + natychmiastowy nowy hit1 — A A A B B B C C D D D
- Oczekiwane:
  - A zamyka R1,
  - B zamyka R2,
  - C rozpoczyna próbę R3,
  - D przerywa C,
  - fail R3 rozlicza się automatycznie,
  - to samo D jest hit1 nowej sekwencji,
  - kolejne D = hit2 i hit3,
  - wynik: sukces R1(D).

## 7) R4 fail + natychmiastowy nowy hit1 — A A A B B B C C C D D E E E
- Oczekiwane:
  - A zamyka R1,
  - B zamyka R2,
  - C zamyka R3,
  - D rozpoczyna próbę R4,
  - E przerywa D,
  - fail R4 rozlicza się automatycznie,
  - to samo E jest hit1 nowej sekwencji,
  - kolejne E = hit2 i hit3,
  - wynik: sukces R1(E).
- Uwaga: przy 4 kolorach użyj powrotu do koloru startowego jako E (np. RED).

## 8) AA (pętla R1) — A A A A A B B B
- Oczekiwane:
  - po R1(A) działa krok AA na 3-hit,
  - B przerywa AA i jest hit1 nowego kierunku,
  - komunikacja fail bez tekstu „niepowodzenie” (punkty + ewentualne karty).

## 9) AAA (pętla R1 / DS) — A A A A A A B B B
- Oczekiwane:
  - AAA kończy się DS(A) i auto-zamknięciem,
  - po nowej sekwencji B działa standardowy model hit1/hit2/hit3,
  - brak „martwego resetu” po zmianie koloru.

## Oczekiwane eventy debugowe
- Przy hit1: `sequence.direction_locked` z `currentColor`, `hitCount=1`, etapem (`stage`).
- Przy hit2: `sequence.step_progress` (`phase=OPEN`, `hitCount=2`).
- Przy hit3: `sequence.step_completed`.
- Przy failu:
  - `sequence.fail_detected` (z `stage`, `interruptedColor`, `interruptedStepIndex`),
  - `sequence.fail_resolved` (z `autoResolved=true`),
  - `sequence.direction_locked` z `reason=post-fail-direction-takeover` i nowym `currentColor`.

## Oczekiwany HUD / overlay
- hit1: biały obrys dla nowego koloru (kierunek).
- hit2: puls koloru kroku.
- hit3: flash koloru i ewentualny overlay decyzji.
- Po failu na R2/R3/R4: HUD od razu przechodzi na nowy kierunek (bez pustego resetu i bez dodatkowego trafienia).

## Kryterium zaliczenia
- Brak „martwego resetu” po obcym kolorze.
- Brak konieczności dodatkowego trafienia po failu.
- Eventy debugowe i HUD opisują ten sam stan runtime.
