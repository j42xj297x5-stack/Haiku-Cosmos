> Status: ROBOCZY
> Obszar: Roadmapa / planowanie
> Źródło prawdy: NIE
> Ostatnia aktualizacja: 2026-06-20
> Powiązane dokumenty: ../maps/PROJECT_INDEX.md, CARDS_SYSTEM.md, ECONOMY_SYSTEM.md, SUB_META_SYSTEM.md, ../ui/UI_WORLD.md

# Haiku Cosmos — TODO / ROADMAP

## Post-legacy-cut stabilization — SPACE runtime baseline

Status: NEXT MECHANICS PATCH SEQUENCE / po `SPACE_RUNTIME_BASELINE_AFTER_LEGACY_CUT.md`.

Cel: ustabilizować aktywny kosmos po wycięciu legacy runtime, bez przywracania starych komet, stars/epoch, gas planets ani capture/orbit.

Kolejność:

1. Fix moon -> rocky planet cooldown/failure semantics: rozróżnić temporary progression block od real creation failure i nie logować optymistycznego threshold success przed faktycznym creation.
2. Threshold pass: zmienić implemented baseline `10/20` na design target `5/10` dopiero po naprawie moon progression.
3. Radius scale pass: zmniejszyć asteroid baseR / moon inherited base / rocky start scale bez zmiany renderer-side gameplay.
4. Compact mechanics export: odchudzić full/collisions evidence dla testów progression.
5. Debug naming cleanup: historyczne `asteroidToPlanet` przemianować lub oznaczyć jako deprecated alias dla `asteroidToMoon`.
6. Future systems only after stabilization: comets/orbits/stars/gas planets wracają wyłącznie jako nowe systemy z nowymi kontraktami, nie przez restore `legacy/runtime/*`.

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


## Etapy robocze po 2026-05-03 (HUD v2 / sloty / trwałość)

- HUD v2 (prawy panel rombów sekwencji + mikrodecyzje) — **DO ZAPROJEKTOWANIA / DO ZAIMPLEMENTOWANIA**.
- Dolny panel 3 slotów kart specjalnych/eventowych (pinning z SUB-META) — **DO ZAPROJEKTOWANIA / DO ZAIMPLEMENTOWANIA**.
- System trwałości i stabilizacji kart slotowanych (`R2->R1`, `R3->R2`, `R4->R3`) — **DO ZAPROJEKTOWANIA / DO ZAIMPLEMENTOWANIA**.
