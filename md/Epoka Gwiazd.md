# Haiku Cosmos — Epoka Gwiazd
## LOD, Sterowanie i Zmiana Skali Rozgrywki

Dokument opisuje **zmiany w odczuciu sterowania i prezentacji świata**
w Epoce Gwiazd, przy zachowaniu spójności istniejącej mechaniki
(planety, gwiazdy, progi jakościowe, meta).

Celem jest zmiana **skali percepcji i sprawczości gracza**,
a nie zmiana ontologii świata.

---

## 1. Cel projektowy

W Epoce Gwiazd:
- świat oddala się wizualnie (wejście w „3D”),
- meteory stają się mniej czytelne,
- planetoidy stają się głównym „uchwytem” interakcji,
- gracz przestaje rzeźbić z pyłu, a zaczyna kierować bryłami.

Zmiana ma:
- zwiększyć poczucie skali,
- odróżnić Epokę Gwiazd od wcześniejszych epok,
- nie łamać ustalonych praw fizyki i progresji.

---

## 2. Zasada nadrzędna (bardzo ważna)

**Nie zmieniamy praw świata.  
Zmieniamy warstwę sterowania i prezentacji.**

Oznacza to:
- meteory nadal istnieją,
- meteory nadal budują masę, kolory i progi,
- planety i gwiazdy działają według tych samych zasad co wcześniej.

Zmienia się:
- priorytet reakcji,
- czytelność wizualna,
- sposób interakcji gracza z materią.

---

## 3. Meteory w Epoce Gwiazd (LOD)

### 3.1 Rola mechaniczna

- meteory pozostają podstawowym „atomem” systemu,
- z nich nadal liczone są:
  - masa,
  - dominacja kolorów,
  - przejścia planet → gwiazda.

Nie wprowadzamy alternatywnej waluty ani nowego budulca.

---

### 3.2 Prezentacja wizualna (LOD)

W Epoce Gwiazd meteory:
- są mniej widoczne,
- pełnią rolę tła i szumu ruchu.

Dopuszczalne formy:
- drobne kropki,
- przerywane linie przy większej prędkości,
- bardzo subtelne smugi ruchu.

Meteory **nie znikają całkowicie**.

---

## 4. Planetoidy jako główny obiekt interakcji

### 4.1 Zmiana sprawczości gracza

W Epoce Gwiazd:
- Pole Reakcji Gracza (PRG) działa najsilniej na planetoidy,
- meteory reagują słabiej (minimalny dryf, brak precyzyjnego sterowania).

Planetoidy stają się:
- głównym „uchwytem” decyzji,
- reprezentacją większych mas materii.

---

### 4.2 Planetoida jako kontener składu

Planetoida w Epoce Gwiazd:
- reprezentuje zbiór meteorów,
- posiada skład jakościowy (np. 70% żółte, 30% zielone),
- posiada masę efektywną odpowiadającą liczbie meteorów.

To jest **interpretacja**, nie nowy byt mechaniczny.

---

### 4.3 Interakcje z planetami i gwiazdami

- planeta nie zbiera „planetoid” jako nowych atomów,
- planeta zbiera **to, co planetoida reprezentuje** (meteory/orbitery),
- planetoida może:
  - rozpaść się na meteory (LOD → szczegół),
  - zostać wciągnięta jako pakiet, z zachowaniem składu.

Wszystkie istniejące:
- progi,
- cooldowny,
- warunki jakościowe
pozostają bez zmian.

---

## 5. Pole Reakcji Gracza (PRG) w Epoce Gwiazd

- kursor pozostaje bez zmian wizualnych,
- zmienia się priorytet reakcji:

Priorytet:
1. planetoidy
2. większe orbitery
3. meteory (minimalny wpływ)

Efekt:
- gracz operuje bryłami,
- pył kosmiczny staje się kontekstem, nie celem.

---

## 6. Geometria orbit (wejście w „3D”)

### 6.1 Zmiana geometrii

W Epoce Gwiazd:
- orbity renderowane są jako elipsy zamiast okręgów,
- możliwy jest lekki tilt płaszczyzny orbity.

### 6.2 Zasada bezpieczeństwa

- zmiana dotyczy renderu i parametrów orbity,
- nie wprowadzamy nowych praw grawitacji,
- nie zmieniamy zasad kolizji.

Efekt:
- poczucie głębi,
- większa skala,
- brak wpływu na balans.

---

## 7. Roje meteorów jako wydarzenia

### 7.1 Status rojów

Roje:
- **nie są domyślną reprezentacją meteorów**,
- występują wyłącznie jako wydarzenia lub karty.

### 7.2 Charakter wydarzenia

Rój meteorów:
- jest nieregularną chmurą,
- ma własny rytm i kierunek,
- wprowadza chwilowy chaos.

Dzięki temu:
- gracz zawsze wie, że to wyjątek,
- czytelność świata zostaje zachowana.

---

## 8. Ryzyka i zabezpieczenia

### Ryzyko: utrata czytelności przyczyn
Zabezpieczenie:
- zachowanie widocznych wskaźników składu planetoidy,
- brak zmiany progów mechanicznych.

### Ryzyko: rozjechanie progresji planet → gwiazda
Zabezpieczenie:
- planetoidy nie zastępują meteorów,
- tylko je reprezentują.

### Ryzyko: zbyt duża rewolucja
Zabezpieczenie:
- zmiana wprowadzana tylko w Epoce Gwiazd,
- brak wpływu na wcześniejsze epoki.

---

## 9. Status dokumentu

Dokument koncepcyjny.
Stanowi podstawę do:
- modyfikacji sterowania w Epoce Gwiazd,
- zmian wizualnych (LOD, orbity),
- projektowania kart i wydarzeń epokowych.

Nie zawiera implementacji.
