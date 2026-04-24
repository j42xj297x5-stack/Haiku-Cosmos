# Checklista manualna — przejęcie kierunku przez obcy kolor (R-track)

Cel: potwierdzić kontrakt „obcy kolor nie przepada” dla atomowych kroków 3-hit w całym R-track.

## 1) A A A
- Oczekiwane: hit1 A → hit2 A → hit3 A → sukces R1(A).

## 2) A B B B
- Oczekiwane:
  - A = hit1,
  - B przerywa A i jest hit1 nowego kierunku,
  - kolejne B = hit2 i hit3,
  - wynik: sukces R1(B).

## 3) A A B B B
- Oczekiwane:
  - A = hit1, hit2,
  - B przerywa A i jest hit1,
  - kolejne B = hit2 i hit3,
  - wynik: sukces R1(B).

## 4) A A A B B C C C
- Oczekiwane:
  - A zamyka R1,
  - B, B zaczyna kolejny krok,
  - C przerywa próbę B,
  - fail i nagrody częściowe rozliczają się automatycznie,
  - to samo C jest hit1 nowej sekwencji,
  - kolejne C = hit2 i hit3,
  - wynik: sukces R1(C).

## 5) A A A B B C D D D
- Oczekiwane:
  - C przerywa B i staje się hit1,
  - D przerywa C i staje się hit1,
  - kolejne D = hit2 i hit3,
  - wynik: sukces R1(D).

## 6) A A A B B B C C D D D
- Oczekiwane:
  - A zamyka pierwszy krok,
  - B zamyka drugi krok,
  - C rozpoczyna trzeci krok,
  - D przerywa C,
  - fail rozlicza się automatycznie zgodnie z poziomem,
  - to samo D jest hit1 nowej sekwencji,
  - kolejne D = hit2 i hit3,
  - wynik: sukces R1(D).

## Kryterium zaliczenia
- Brak „martwego resetu” po obcym kolorze.
- Brak konieczności dodatkowego trafienia po failu.
- HUD od razu pokazuje nowy kierunek (hit1/3) po obcym kolorze.
