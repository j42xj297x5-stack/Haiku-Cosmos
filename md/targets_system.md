# Haiku Cosmos — TARGETS v1 (Rytuały)

> Ten plik definiuje **pierwszą, minimalną pulę targetów** dla systemu kart i rytuałów.
> Na tym etapie **nie implementujemy innych kart** — skupiamy się wyłącznie na rytuałach typu *Puszczanie*.

---

## Zasada ogólna

- Target ≠ karta
- Target = **adres wpływu na świat**
- Karta = **nośnik decyzji** (może, ale nie musi być użyta)

Rytuały są **stanami świata w czasie**, nie impulsami.

---

# R1 — Rytuał „Puszczanie” (pojedynczy kolor)

**ID:** `RITUAL_RELEASE_SINGLE_COLOR`

### Intencja
Uwolnienie materii jednego koloru z logiki struktur i orbit.
Świat na chwilę upraszcza się i oddycha.

---

### Start rytuału

- **2× harmonijna kolizja** tego samego koloru meteoru
- rozpoczyna się **stan rytualny (TRWA)**

---

### Ukończenie rytuału

- **3× harmonijna kolizja** tego samego koloru
- pojawia się **karta R1 (kolorowa)**

Karta:
- może zostać **użyta w runie**
- albo **zignorowana** i trafić do kolekcji

---

### Przerwanie rytuału

Rytuał zostaje przerwany, jeśli:
- w trakcie trwania stanu rytualnego
- gracz wykona harmonijną kolizję **innego koloru**

**Nie przerywa rytuału:**
- tworzenie planetoid
- wchodzenie na orbity
- kolapsy i struktury

**Efekt przerwania:**
- brak kary
- **Rezonans Points ×2** (COMBO, natychmiastowo)

---

### Efekt świata (po użyciu karty)

- Czas trwania: **3 minuty (bazowo)**
- wszystkie **wolne meteory danego koloru**:
  - nie mogą wchodzić na orbity
  - zachowują prędkość
  - opuszczają obszar świata

- meteory już orbitujące: **nietknięte**
- struktury: **nietknięte**

---

### Wizualny sygnał

- meteory objęte rytuałem:
  - biały ring
  - aktywacja sekwencyjna co 0.5 s

---

### Slot Rytuał — wzmocnienie

- użyta karta R1 w runie:
  - **+1 minuta** jeśli istnieje wpis w slocie Rytuał

---

### Doświadczenia

**DR (podstawowe):**
- 3× ta sama karta R1
- efekt: pamięć koloru

**sDR:**
- 3× DR
- efekt: **+1 minuta ×2** do podstawy użytej karty

---

# R2 — Rytuał „Puszczanie Złączone” (dual)

**ID:** `RITUAL_RELEASE_DUAL_COLOR`

---

## Zasada nadrzędna

R2 **nie może powstać bez ukończenia R1**.
Jest nadbudową konsekwencji, nie alternatywą.

---

### Warunek powstania

1. Gracz kończy R1 koloru A → karta A (nieużyta, trafia do kolekcji)
2. Bez przerwania ciągu rytualnego:
   - gracz kończy R1 koloru B → karta B

---

### Okno decyzji (łączenie)

- pojawia się karta-decyzja
- czas: **~5 sekund**

**Użycie:**
- 2 karty kolorowe → 1 karta R2 (dual)

**Brak reakcji:**
- zachowane zostają 2 osobne karty

---

### Efekt świata (po użyciu R2)

- Czas trwania: **2 minuty (bazowo)**
- działanie analogiczne do R1
- obejmuje **oba kolory jednocześnie**

---

### Slot Rytuał

- R1 i R2 korzystają z **tego samego slotu**
- gracz decyduje:
  - silniejszy, stabilny R1
  - czy krótszy, trudniejszy, ale bardziej medytacyjny R2

---

### Doświadczenia

**sDR (dual):**
- 3× ta sama karta R2
- możliwość sublimacji (opcjonalna)

**PDR (dual):**
- 9× kart R2 tego samego zestawu kolorów

---

# PDR — Przenikające Doświadczenie Rytuału

PDR działa jako **jakość świata**, nie bonus czasu.

### Efekty globalne

- spowolnienie spawnu wszystkich meteorów
- co **3 sekundy**:
  - losowy kolor **nie pojawia się** przez krótki moment

Efekt:
- świat przestaje eskalować gwałtownie
- ekspansja struktur zostaje wyhamowana
- umożliwia długą, medytacyjną grę

---

## Uwagi implementacyjne (na teraz)

- Na tym etapie:
  - **usuwamy wszystkie inne karty**
  - rytuały są jedyną aktywną mechaniką kart
- Haiku teksty:
  - będą pisane **pod konkretne, sprawdzone efekty**

Ten plik jest **punktem wyjścia**.
Nic więcej nie powinno być aktywne, dopóki te rytuały nie będą w pełni czytelne w świecie.

Pewnie. Poniżej masz **gotowy opis TARGETU + KARTY** w formie, którą możesz wkleić do repo (np. `targets.md` + `cards.md` albo jeden plik). Trzymam się Twoich założeń: **brak natywnego wyrzutu orbiterów po uderzeniu komety w planetę**; wyrzut dopiero jako *zdarzenie/rytuał* i/lub aktywacja karty.

---

# TARGET: Kometa → Planeta gazowa (Halo Trial)

## Nazwa robocza

**HALO_TRIAL_GAS_PLANET**

## Warunek wejścia (trigger)

Zdarzenie uruchamia się, gdy:

1. **Kometa uderza w planetę**, oraz
2. planeta jest typu **gazowego**, czyli powstała z **orbiterów różnych kolorów**.

> Definicja “gazowa” (logiczna):

* `planet.isGasGiant === true`
  albo (jeśli nie ma flagi) heurystyka:
* `planet` ma w historii/lub stanie co najmniej 2 kolory orbiterów (`uniqueColors >= 2`).

## Efekt natychmiastowy (feedback wizualny)

Po kolizji:

* planeta dostaje **halo + poświatę** (glow/atmosphere).
* halo może **delikatnie pulsować** (ale sama mechanika triala nie wymaga pulsowania — to tylko “czytelność”).

## Trial / okno czasowe

* startuje timer: **T = 20 sekund** (`HALO_TRIAL_DURATION_MS = 20000`)

### Warunek “przetrwania”

Jeżeli przez 20 sekund **do orbity grawitacyjnej tej planety nie dołączy żaden obiekt**, trial jest “zdany”.

**Co znaczy “dołączy do orbity grawitacyjnej”** (kontrakt mechaniczny):

* dowolny nowy orbiter zostaje przypisany do tej planety (np. meteor wchodzi w orbitę / staje się orbiterem planety).
* nie liczymy “wewnętrznych przetasowań” starych orbiterów; tylko *nowe dołączenia*.

### Co jeśli w tym czasie dołączy obiekt?

* Trial **jest przerwany / nieudany**.
* Nie dzieje się nic poza standardem: planeta przyjęła masę komety zgodnie z normalną mechaniką uderzenia.
* Halo/poświata może zgasnąć po chwili (opcjonalne).

## Rezultat triala: SUKCES

Gdy timer dojdzie do końca i warunek spełniony:

1. planeta **odrzuca połowę orbiterów**:

   * orbiterów **nie wyrzucamy do świata**, nie ma dryfu.
   * one **znikają** (usuwane z listy orbiterów).
2. planeta ma **zmniejszoną orbitę grawitacyjną** o wkład tych orbiterów (czyli “oddaje” masę/orbitę wynikającą z posiadania połowy orbiterów).

> Ważne: to jest “czyste skasowanie połowy orbiterów” + dostosowanie parametru orbity grawitacyjnej.

3. Gracz uzyskuje kartę: **Rozpuszczenie Ego**.

## Rezultat triala: PORAŻKA

* Brak kary.
* Brak auto-wyrzutu orbiterów.
* Halo może zniknąć.
* Planeta zostaje po prostu “po kolizji komety” (zwiększona masa/orbita tak jak normalnie).

---

# KARTA: Rozpuszczenie Ego

## Typ

* **Karta zdarzeniowa / rytuał** (aktywna)
* Drop: tylko z **HALO_TRIAL_GAS_PLANET (SUKCES)**

## Nazwa

**Rozpuszczenie Ego**

## Efekt po aktywacji (in-run)

Po aktywacji, wskazana planeta (domyślnie ta z eventu; ewentualnie “najbliższa gazowa” jeśli event już minął) wykonuje proces:

1. Przez **2 sekundy** zachodzi powolne “rozpuszczanie”:

   * wizualnie: halo + poświata **pulsują** / “rozrzedzają się”.
2. Finalnie:

   * planeta **traci połowę orbiterów** (usuwamy je, bez dryfu).
   * planeta jest **pomniejszona o ich masę** (oraz odpowiednio **zmniejsza się orbita grawitacyjna**).
   * proces jest “powolny”, ale mechanicznie kończy się po 2s.

## Warunki użycia (propozycja minimalna)

* można aktywować tylko, gdy istnieje co najmniej 1 planeta gazowa z ≥2 orbiterami.
* jeśli planeta ma 0–1 orbiter: karta nie ma celu (w UI można ją wyszarzyć).

## “Kolekcjonowanie” (meta)

Jeśli gracz nie użyje karty w runie:

* karta jest zachowana jako “kolekcjonowana” do meta-huba.
* można ją wkładać do slotu (roboczo: **Ekspansja**).

### Slot: Ekspansja — efekt pasywny

Jeśli karta **Rozpuszczenie Ego** jest włożona do slotu Ekspansja:

* **-30% do masy i orbity grawitacyjnej** obiektów typu **planeta gazowa** na starcie i przez cały run.

### Prog esencji

Po zebraniu **3 kart Rozpuszczenie Ego**:

* można w meta-hubie wydobyć esencję: **Sublimacja Ego (sE)**

Efekt **Sublimacji Ego (sE)** (meta):

* ograniczenie ekspansji działa również dla **planetoid** (rozszerza pasywkę na planetoidy).

  * (Dokładną wartość możemy ustalić później; na razie: “tak jak dla gazowych” lub mniejszy procent.)

---

# Zmiana bazowa w mechanice komet vs planety (ważne dla kodu)

**Po uderzeniu komety w planetę nie ma natywnego wyrzutu orbiterów**.
Czyli:

* brak `releaseHalfOrbitersFromPlanet()` w samym impakcie,
* wyrzut/utrata orbiterów zachodzi wyłącznie przez:

  1. **SUKCES HALO_TRIAL** (po 20s bez nowych dołączeń),
  2. **Aktywację karty Rozpuszczenie Ego** (2s rytuał).

---
