# Haiku Cosmos — Cards Pack 02

**Epoki · Spawn · Ekspansja · Komety (strefy)**

> Cel pakietu: żeby gracz **nie wisiał** w jednej epoce oraz miał narzędzia do **oddychania spawnu** bez psucia filozofii gry.
> Karty są nadal efemeryczne: **klik = użycie**, **brak kliknięcia = kolekcja**.

---

## Zasady globalne (systemowe) — w tym packu

### G1) Auto-ramp spawnu meteorów w obrębie epoki

* Co **120 sekund** w trakcie epoki: `mps += 1` (do końca epoki).
* Ramp nie przekracza limitu epoki (opcjonalnie `epochMpsCap`, jeśli chcesz).

**Haiku sygnału (opcjonalne, bez karty)**

> Epoka podnosi rytm
> Pył gęstnieje bez pytania
> Skala szuka progu

---

### G2) Cofnięcie spawnu przy wejściu w nową epokę

Na `onEpochChange(from,to)`:

* jeśli `mps >= 4` → `mps -= 2`
* jeśli `mps <= 3` → `mps -= 1`
* mps nigdy nie spada poniżej 1.

**Intencja:** gdy rośnie liczba planetoid/planet, trudniej „celować w kolor”. Krótkie cofnięcie spawnu daje znów przestrzeń na harmonię.

---

### G3) Skalowanie siły kart ±m/s

Każda karta `+mps` / `-mps` ma *bazowo* 1, ale rośnie “inteligentnie”:

**Proponowany model (opisowo, bez kodu):**

* **moc = 1 + bonus**, gdzie bonus zależy od:

  * epoki (im wyższa, tym większy)
  * aktualnego mps (im wyższy, tym większy)

Przykład (czytelny dla testów):

* Epoka 1: `±1`
* Epoka 2: `±1` (lub `±2`, gdy `mps >= 6`)
* Epoka 3+: `±2` (lub `±3`, gdy `mps >= 8`)

To daje “większy hamulec i większy gaz” tam, gdzie faktycznie tego potrzebujesz.

---

# Karty operacyjne (spawn control)

## 🟦 Przyspiesz — 1 krok w stronę progu

**ID:** `CARD_MPS_STEP_UP`
**Typ:** DIRECT
**Target:** METEOR_SPAWN_RATE

### Trigger

* pojawia się jako “narzędzie”:

  * gdy `mps <= 3` i epoka trwa dłużej niż 60s
  * lub po dłuższym braku struktur (opcjonalnie)

### Efekt

* `mps += step` (step wg G3)

### Haiku

> Z ciemności rodzi się szum
> Więcej pyłu na jeden oddech
> I szybciej dojrzewa kadr

---

## 🟩 Zwolnij — 1 krok w stronę harmonii

**ID:** `CARD_MPS_STEP_DOWN`
**Typ:** DIRECT
**Target:** METEOR_SPAWN_RATE

### Trigger

* pojawia się:

  * gdy `mps >= 4`
  * albo gdy wykryjemy “chaos strukturalny” (dużo planetoid)

### Efekt

* `mps -= step` (step wg G3)
* mps nie spada poniżej 1

### Haiku

> Próżnia robi miejsce
> Pył nie musi wygrywać
> Żeby świat się ułożył

---

# Karty progowe epok/struktur (nagrody za milestone)

## 🟨 Pierwsza Planeta — Hamulec orbit

**ID:** `CARD_MPS_BRAKE_FIRST_PLANET`
**Typ:** DIRECT
**Target:** METEOR_SPAWN_RATE

### Trigger

* utworzenie **pierwszej planety** w runie

### Efekt

* `mps -= strongStep`
* `strongStep` = co najmniej `step` z G3, zwykle o 1 większy (np. 2 w epoce 2)

### Haiku

> Pierwsza masa ma cień
> Krąg zamyka się w ciszy
> I zwalnia pył

---

## 🟧 Pierwsza Gwiazda — Mocniejszy hamulec

**ID:** `CARD_MPS_BRAKE_FIRST_STAR`
**Typ:** DIRECT
**Target:** METEOR_SPAWN_RATE

### Trigger

* utworzenie **pierwszej gwiazdy** w runie

### Efekt

* `mps -= starStep`
* `starStep` jest większy niż dla planety (np. 3, a przy wysokim mps nawet 4)

### Haiku

> Zrodziło się światło
> A z nim ciężar skali
> Niech pył odpocznie

---

# Karty kometowe (strefy, wąski pas)

> Uwaga: tu mówimy o **kometach** (nie “deszczu meteorów”).
> Kometowy “shower” w tym packu jest celowo **nieintensywny** i **kierunkowy**, żeby dawał kontrolę, a nie zalew.

## 🟪 Deszcz Komet — Pas z jednego rejonu

**ID:** `CARD_COMET_STREAM_ZONE`
**Typ:** DIRECT (event)
**Target:** COMETS

### Trigger

* po wejściu w wyższą epokę (np. 2+) lub po progu rezonansu
* rzadko (to ma być “moment”)

### Efekt (czasowy)

* przez `T` (np. 30–60s):

  * komety spawnują się co **1–3 s**
  * startują z **podobnej strefy mapy** (spójny rejon)
  * lecą **wąskim pasem** (mała wariancja kąta)

### Haiku

> Z jednego brzegu kosmosu
> Przychodzi wąski strumień lodu
> I tnie kadr jak pióro

---

## 🟦 Zawężenie strumienia (precyzja)

**ID:** `CARD_COMET_STREAM_NARROW`
**Typ:** DIRECT
**Target:** COMETS

### Trigger

* tylko gdy aktywny jest `CARD_COMET_STREAM_ZONE` (stream trwa)

### Efekt

* jeszcze mniejsza wariancja kierunku i startu (bardziej “wąski pas”)
* bez zwiększania liczby komet

### Haiku

> Pas się zaciska
> Lodowe ciała idą jednym śladem
> Jakby ktoś pisał znak

---

# Transformacje kolorów (4 narożniki świata)

## 🟥🟩🟦🟪 Deszcz Transformacji — kolorowy narożnik (4 warianty)

**ID (szablon):** `CARD_TRANSFORMATION_SHOWER_<COLOR>`
Np. `CARD_TRANSFORMATION_SHOWER_RED` / `GREEN` / `BLUE` / `VIOLET`
**Typ:** DIRECT (event)
**Target:** COMETS (kolorowe komety/meteory-eventy, zależnie od Twojej implementacji)

### Warunek odblokowania (nagroda za kolekcję)

* gracz zdobywa **3 karty R1 tego samego koloru** (kolekcja, niekoniecznie użyte)
* wtedy odblokowuje się odpowiedni wariant transformacji

### Efekt

* event trwa `T` (np. 20–40s):

  * “ciała transformacji” pojawiają się z **narożnika świata** przypisanego do koloru:

    * RED → lewy górny
    * GREEN → prawy górny
    * BLUE → lewy dolny
    * VIOLET → prawy dolny
  * lecą **wąskim pasem** ku środkowi / w poprzek układu
  * tempo: **1–3 s** między spawnami

### Haiku (wspólne)

> Narożnik ma swój znak
> Kolor wraca jak wiatr z krawędzi
> I zmienia tor świata

*(Jeśli chcesz, dopiszę osobne haiku dla każdego koloru — na razie wspólne, żeby nie mnożyć.)*

---

# Meta-progres (DR / sDR / PDR) — sterowanie spawnem

> To jest opis docelowy do meta-huba / slotów. Runtime może na razie tylko “zliczać”.

## DR — Doświadczenie Spawnu (3× ta sama karta)

**Nazwa robocza:** `DR_MPS_STEP`
**Warunek:** 3× kolekcja tej samej karty (`CARD_MPS_STEP_UP` albo `CARD_MPS_STEP_DOWN`)
**Efekt meta:** w następnym runie:

* pasywny wpływ na mps: `±1 m/s` (zgodnie z kartą)
* slot sugerowany: **Ekspansja**

## sDR — Sublimowane Doświadczenie (3× DR)

**Nazwa robocza:** `sDR_MPS_STEP`
**Warunek:** 3× DR
**Efekt meta:** w następnym runie:

* pasywnie `±1 m/s` **+** łagodniejszy auto-ramp (np. wolniej rośnie) *albo* większy hamulec na epokach
  *(wybierzesz jeden z wariantów po testach)*

## PDR — Jakość slotu (9× ta sama karta)

**Nazwa robocza:** `PDR_SLOT_EXPANSION_MPS`
**Warunek:** 9× tej samej karty w kolekcji
**Efekt:** modyfikuje działanie slotu Ekspansja:

* slot wpływa nie tylko na startowy mps, ale też na auto-ramp / epoch reset

---

# Kontrakt UI (ważne, bo chcesz “zbieranie”)

## UI-01: Równoległe oferty kart (stack)

Obecnie karta jest “jedna po drugiej”, co zabija kolekcję.
W tym packu zakładamy:

* system może trzymać **kilka ofert naraz** (np. max 3)
* każda ma własny timer znikania (okno decyzji)
* gracz może:

  * kliknąć jedną (użycie)
  * nie kliknąć żadnej (kolekcja)
* UI układa je np. pionowo (stack), z lekkim offsetem.

## UI-02: Kolekcja = brak kliknięcia

* jeśli timer minie → karta trafia do kolekcji (log)
* nie blokuje pojawienia się kolejnej karty

---

# Minimalny plan testów (manual, 5–10 min)

1. Epoka trwa >2 min → mps rośnie automatycznie o 1
2. Wejście w następną epokę → mps spada zgodnie z regułą (−2 lub −1)
3. `CARD_MPS_STEP_UP` i `CARD_MPS_STEP_DOWN` zmieniają mps o step (skalowanie widoczne w wyższych epokach)
4. Pierwsza planeta → pojawia się brake i realnie zwalnia “chaos kolorów”
5. Kometowy stream: komety lecą spójnie z jednej strefy, wąskim pasem, co 1–3 s
6. UI: mogą wisieć 2–3 karty naraz i “nie kliknięcie” faktycznie zbiera

