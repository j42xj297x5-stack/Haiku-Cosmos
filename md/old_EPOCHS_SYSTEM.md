# Haiku Cosmos — EPOCHS_SYSTEM.md

> Ten dokument opisuje **epoki** jako warstwę czasu i zmiennych globalnych.
> Epoka nie jest levelem ani resetem. Epoka jest **zmianą perspektywy i praw świata**.

---

## 1. Definicja epoki

Epoka to:
- przedział czasu w runie
- zestaw globalnych ustawień (parametrów świata i UI)
- rytm zdarzeń

Zasada:
> epoki zmieniają warunki, a nie przepisują historię

---

## 2. Co epoka zmienia

### 2.1 Percepcję (UI)
- skala kamery (**zoom-out przy zmianie epoki**) — zgodnie z `UI_WORLD.md`
- subtelny rytm i „oddech” świata

### 2.2 Parametry świata (API pod karty)
Przykładowe przełączniki/gałki:
- `meteorWallBounce` (odbicia ścian) — wyjątek/test/karta/epoka
- `meteorSpawnRate`
- `meteorMaxSpeed`
- `asteroidDriftMul`
- `asteroidTrajectoryMode` (`FREE | ELLIPTIC`)
- `eventFrequency`
- `pointerRadius / pointerStrength / pointerGlueDamp`

### 2.3 System kart
- tryb kart: `INDIRECT | DIRECT | MIXED`
- częstotliwość pojawiania się kart
- dominujące typy kart w epoce (np. więcej rytuałów)

---

## 3. Zmiana epoki (wyzwalanie)

Zmiana epoki może być wyzwalana **czasowo i progowo** — jednocześnie.

### A) Czas (`epochDuration`)
- klasyczny zegar epoki
- dobre dla trybu „skill” (czytelny rytm, presja czasu)

### B) Progi strukturalne (stan świata)
- liczba i masa struktur (np. planetoidy/planety)
- suma punktów (rezonansu)
- pojawienie się pierścieni / eventów
- dobre dla trybu „medytacyjnego” (świat sam „dojrzewa”)

### C) Hybryda (zalecana)
- epoka zmienia się, gdy spełniony jest warunek progowy
- ale ma też „bezpiecznik czasu” (max duration), żeby run nie utknął

---

## 4. Przejście epoki (co się dzieje)

Przejście epoki:
- **nie zatrzymuje** rozgrywki
- jest odczuwane poprzez:
  - zoom-out
  - zmianę rytmu
  - zmianę „temperatury chaosu”

Opcjonalnie (delikatnie):
- krótkie uspokojenie spawnu
- subtelne przestawienie parametrów kursora

---

## 5. Profile epok (robocze szkice)

### 5.1 Epoka 1 — Chaos Materii
- kamera blisko
- meteory dominują
- eventy rzadkie

### 5.2 Epoka 2 — Stabilizacja Struktur
- lekkie oddalenie
- planetoidy stają się osiami układu
- pierścienie zaczynają być widoczną pamięcią

### 5.3 Epoka 3 — Zewnętrzne Zakłócenia
- kolejne oddalenie
- eventy z zewnątrz częstsze
- układ zaczyna czuć „większy kosmos”

> Profile są kierunkiem, nie dogmatem.

---

## 6. Epoki a „kosmos nie jest pudełkiem”

Epoki wzmacniają założenie, że ekran to fragment przestrzeni:
- domyślnie meteory przelatują przez ekran
- odbicia od ścian są:
  - trybem testowym
  - albo czasowym wyjątkiem (karta/epoka/event)

Planetoidy:
- nie odbijają się
- dryfują po powolnych trajektoriach
- wariant: elipsy (parametryzowane)

---

## 7. Epoki a eventy

Epoka może:
- zwiększać prawdopodobieństwo eventów
- definiować pulę możliwych eventów
- zmieniać czas trwania eventów (`eventDuration`)

Przykład:
- epoka 3 odblokowuje przelot neutron star (gdy dojdzie)

---

## 8. Epoki a zapis pamięci (meta)

Epoki wpływają na:
- to, jakie „ślady” zostają po kartach
- jakie elementy meta-progresu są dostępne

Zasada:
> epoka jest ramą dla pamięci, nie tylko zegarem

---

## 9. Minimalne parametry do implementacji

- `epochIndex`
- `epochStartTime`
- `epochDuration`
- `epochMaxDuration` (dla hybrydy)
- `onEpochChange(from, to)`
- `EpochProfile = { ... }`

---

## 10. Notatki do iteracji
- ustalić: czy epoki są wyłącznie czasowe, progowe, czy hybrydowe (domyślnie hybryda)
- doprecyzować: czy przejście epoki może wywołać event
- spiąć profile epok z `MECHANICS_WORLD.md` i `MAP_FUNCTIONS_WORLD.md`
