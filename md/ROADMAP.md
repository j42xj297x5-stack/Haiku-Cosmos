# Haiku Cosmos — TODO / ROADMAP
## Eventy, systemy specjalne, progresja (WIP)

Statusy:
- 🟡 POMYSŁ — koncepcja, brak zasad
- 🟠 DO ZAPROJEKTOWANIA — wymagane reguły / balans
- 🔵 DO ZAIMPLEMENTOWANIA — projekt gotowy, czeka na kod
- 🟢 ZROBIONE — zaimplementowane i przetestowane

---

## 1. SYSTEM EVENTÓW CZASOWYCH (RUN)

### 1.1 Deszcz Meteorów (Meteor Shower)
**Status:** 🟠 DO ZAPROJEKTOWANIA  
**Istniejące zalążki:** funkcje + event hooki już są w kodzie

**Opis:**
Czasowy event zwiększonego spawnu meteorów.

**Zasady (do doprecyzowania):**
- Event trwa określony czas
- Podczas eventu:
  - celem gracza jest **NIE dopuścić do powstawania nowych obiektów**
- Monitorowane progi:
  - liczba asteroid
  - liczba planet skalistych
  - liczba planet gazowych
  - liczba gwiazd

**Nagrody:**
- karty specjalne
- RP (Resonance Points)
- potencjalnie karty eventowe (jednorazowe)

**Uwagi implementacyjne:**
- Event jako `WorldEvent`
- Progi liczone na końcu eventu
- Brak UI ciągłego → tylko komunikat START / END

---

### 1.2 Odbijanie Meteorów od Ścian
**Status:** 🟠 DO ZAPROJEKTOWANIA

**Opis:**
Czasowy event, w którym meteory odbijają się od krawędzi świata.

**Warunek sukcesu:**
- podczas trwania eventu **nie powstaje żaden nowy obiekt wyższego rzędu**

**Nagrody:**
- karta specjalna (eventowa)

**Uwagi:**
- normalnie kosmos ≠ pudełko
- odbijanie tylko jako:
  - event
  - efekt karty
  - efekt epoki

---

### 1.3 Globalne Czyszczenie Pola (Exit Objects)
**Status:** 🟡 POMYSŁ

**Opis:**
Tymczasowe wyłączenie odbijania dla:
- asteroid
- planet
- gwiazd

Obiekty:
- wylatują poza ekran
- czyszczą pole gry

**Aktywacja:**
- karta specjalna
- slot aktywacyjny (już istnieje w UI, brak logiki)

---

## 2. KARTY CZASOWE / EFEKTY AKTYWNE

### 2.1 Slot Aktywacji Kart Efektowych
**Status:** 🔵 DO ZAIMPLEMENTOWANIA

**Opis:**
Dedykowane miejsce w UI:
- wkładasz kartę
- zatwierdzasz
- efekt uruchamia się natychmiast

**Cechy:**
- efekt czasowy
- karta zużywana lub blokowana
- brak stałego HUD

---

### 2.2 Karty Efektów Świata
**Status:** 🟡 POMYSŁ

Przykłady efektów:
- wyłączenie odbić
- zwiększenie prędkości wszystkich obiektów
- lokalna anihilacja meteorów
- destabilizacja orbit

---

## 3. SYSTEM KART OBIEKTÓW (PROGRESJA)

### 3.1 Karty jako „materiał bazowy”
**Status:** 🟠 DO ZAPROJEKTOWANIA

**Zasada:**
- za **utworzenie obiektu** gracz dostaje kartę

| Obiekt | Typ kart |
|------|--------|
| Planetoida | karta powszechna |
| Planeta skalista | karta planety skalistej |
| Planeta gazowa | karta planety gazowej |
| Gwiazda | karta gwiazdy |
| Czarna dziura | karta unikalna |

---

### 3.2 Kolory Kart Obiektów
**Status:** 🟠 DO ZAPROJEKTOWANIA

- Połączenie karty obiektu + R1 (kolor)
- Powstają:
  - 4 kolory planetoid
  - 4 kolory planet skalistych
  - 4 kolory planet gazowych

---

## 4. SYSTEM MAHJONG / UKŁADY KART

### 4.1 Zestawy Podstawowe
**Status:** 🟡 POMYSŁ

**Kolory:** 🔴🟡🟢🔵

Kategorie:
- Asteroidy
- Planety skaliste
- Planety gazowe

Minimalny zestaw:
- 3 różne kolory  
Opcjonalny:
- 4 różne kolory

---

### 4.2 Gwiazdy jako Smoki i Wiatry
**Status:** 🟡 POMYSŁ

Typy gwiazd:
- żółta (mała)
- zielona
- niebieska
- czerwony olbrzym

Ewolucja:
- żółta → brązowy karzeł
- zielona → supernowa → biały karzeł
- niebieska → supernowa → gwiazda neutronowa
- czerwona → kolaps → czarna dziura

---

### 4.3 Czarna Dziura jako „Kwiat”
**Status:** 🟡 POMYSŁ

- karta specjalna
- dodatkowy mnożnik
- unikalna rola w układach

---

## 5. FIZYKA WYSOKIEGO POZIOMU

### 5.1 Zderzenia Gwiazd
**Status:** 🟠 DO ZAPROJEKTOWANIA

Efekty:
- przyspieszone powstawanie czarnej dziury
- supernowe czyszczące orbity

---

### 5.2 Układy Podwójne
**Status:** 🟡 POMYSŁ

- podwójne gwiazdy
- podwójne czarne dziury
- nieuchronny kolaps → jedna ogromna czarna dziura

Efekt globalny:
- fale grawitacyjne
- destabilizacja sąsiednich pól gry

---

## 6. SYSTEM WIELOPOLA / MULTIPLAYER (DALKA PRZYSZŁOŚĆ)

### 6.1 Czarne i Białe Dziury
**Status:** 🟡 POMYSŁ (LONG-TERM)

- każde pole = osobny gracz
- czarna dziura u jednego:
  - zasysa materię
- biała dziura u innego:
  - wyrzuca materię

Event:
- asynchroniczny
- czasowy
- destabilizujący

---

## 7. ŻYCIE NA PLANETACH

### 7.1 Warunek Powstania Życia
**Status:** 🟠 DO ZAPROJEKTOWANIA

- planeta skalista
- orbita wokół gwiazdy

---

### 7.2 Eventy Utrzymania Życia
**Status:** 🟡 POMYSŁ

- kryzysy
- wybory
- warunki środowiskowe
- wpływ gwiazd i sąsiadów

---

## 8. UWAGI OGÓLNE

- Wszystkie eventy:
  - bez stałego HUD
  - tylko sygnały START / END
- Priorytet:
  1. Eventy czasowe
  2. Karty efektowe
  3. Fizyka gwiazd
  4. Mahjong / meta-układy
- Dokument żywy — zasady dopisywane przy projektowaniu

---

## Status dokumentu
WERSJA ROBOCZA / ROZWOJOWA  
Data: 2026-01
