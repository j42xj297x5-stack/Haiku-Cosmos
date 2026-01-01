# Haiku Cosmos — Cards Pack 03
## Gwiazdy · Zapłon · Przerwanie

Ten pakiet dotyczy wyłącznie stanu pre-gwiazdy i kolapsu.
Karty nie tworzą gwiazd automatycznie —
pozwalają je opóźnić, ustabilizować, przerwać lub świadomie uruchomić.

---

## 🟨 Odłóż zapłon

**ID:** `CARD_STAR_DELAY`  
**Typ:** DIRECT  
**Target:** PRE_STAR_STATE

### Trigger
- pojawia się po utworzeniu **planety skalistej**
- wyjątek:
  - jeśli to **pierwsza planeta w runie**,
    pojawia się wariant „wydłużenie +1 min”

### Efekt
- wydłuża stan pre-gwiazdy o **+60 sekund**

### Meta
- **1 karta:** +20 s do wszystkich przyszłych stanów pre-gwiazdy
- **sDR:** +1 minuta
- **PDR:** modyfikuje slot Ekspansja (szczegóły później)

### Haiku
> Jeszcze nie teraz  
> Jądro drży, ale czeka  
> Skala oddycha

---

## 🟧 Stabilna orbita

**ID:** `CARD_STAR_STABLE_ORBIT`  
**Typ:** DIRECT  
**Target:** PLANET_ORBITERS

### Efekt (20 s)
- planeta zbiera **wyłącznie meteory dominującego koloru**
- **planetoidy nie mogą wejść na orbitę**

Cel:
- umożliwić doprowadzenie planety do gwiazdy
- wzmocnić warunek jakościowy

### Meta
- analogiczna progresja jak „Odłóż zapłon”
  (czas + wpływ na przyszłe pre-gwiazdy)

### Haiku
> Krąg nie przyjmuje wszystkiego  
> Jeden kolor trzyma jądro  
> Reszta odpływa

---

## 🟥 Nie teraz

**ID:** `CARD_STAR_ABORT`  
**Typ:** DIRECT  
**Target:** PRE_STAR_STATE

### Trigger
- pojawia się, gdy gracz **skutecznie przerwie stan pre-gwiazdy**

### Efekt
- jeśli **inna planeta** jest w stanie pre-gwiazdy:
  - natychmiast przerywa jej stan
- użycie karty **nie spełnia warunków**
  dla kolejnej pre-gwiazdy

### Meta (kolekcja)
- **1 DR:** ~10% szansy na samoistne przerwanie stanu pre-gwiazdy
- **1 sDR:** ~20% szansy
- **PDR:** modyfikuje slot Ekspansja

### Haiku
> Iskra gaśnie  
> Próg zostaje nieprzekroczony  
> Ciężar trwa

---

## 🟦 Rozbłysk kontrolowany

**ID:** `CARD_STAR_IGNITION`  
**Typ:** DIRECT  
**Target:** PRE_STAR_STATE

### Trigger
- pojawia się, gdy **dwie planety** są w stanie pre-gwiazdy
- po kolapsie pierwszej

### Efekt
- natychmiastowy kolaps w gwiazdę
- czysty zapłon (bez dodatkowej eskalacji)

### Meta
- odwrotność karty „Nie teraz”
  (zwiększa szansę samoistnego zapłonu)

### Haiku
> Decyzja zapada  
> Dwa jądra — jeden błysk  
> Światło wybiera

---

## 🟪 Cisza kolapsu

**ID:** `CARD_STAR_SILENCE`  
**Typ:** DIRECT (czasowa)  
**Target:** STAR_FORMATION

### Trigger
- pojawia się po zebraniu **3 kart „Nie teraz”**

### Efekt
- przez **2 minuty**:
  - żadne planety nie mogą wejść w stan pre-gwiazdy

### Meta
- **1 DR:** +5% do liczby meteorów potrzebnych do utworzenia planety
- **1 sDR:** +15%
- **PDR:** modyfikuje slot Ekspansja

### Haiku
> Po świetle cisza  
> Gwiazdy nie spieszą się dalej  
> Epoka milknie

---

## Uwagi końcowe

- Pack 03 wymaga zasad z `stars_rules_v1.md`
- karty są narzędziami decyzji, nie automatyki
- gwiazda staje się wydarzeniem, nie skutkiem ubocznym
