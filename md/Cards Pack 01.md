# Haiku Cosmos — Cards Pack 01

**Puszczanie · Percepcja · Cisza**

> Ten pakiet zawiera **kanoniczne karty startowe**:
>
> * wszystkie karty wynikające z `targets_system.md`
> * * 8 kart rozszerzających (percepcja, czas, komety, cisza)
>
> Pakiet jest zaprojektowany do wdrożenia **jednym patchem** i testowania iteracyjnego.

---

## 🟦 R1 — Puszczanie (pojedynczy kolor)

**ID:** `RITUAL_RELEASE_SINGLE_COLOR`
**Typ:** RITUAL → karta wykonawcza
**Target:** COLOR_SINGLE

### Trigger (rytuał)

* Start: **2× harmonijna kolizja** tego samego koloru
* Ukończenie: **3× harmonijna kolizja** tego samego koloru

### Efekt po użyciu (bazowo 3 min)

* wolne meteory danego koloru **nie mogą wchodzić na orbity**
* meteory już orbitujące: **bez zmian**
* sygnał wizualny: biały ring, aktywacja sekwencyjna co 0.5 s

### Haiku

> Próżnia ma barwę
> Kolor odrywa się od kręgu
> I leci poza kadr

---

## 🟪 R2 — Puszczanie Złączone (dual)

**ID:** `RITUAL_RELEASE_DUAL_COLOR`
**Typ:** RITUAL (karta łączenia)
**Target:** COLOR_DUAL

### Trigger

1. Ukończenie R1 koloru **A** (karta A trafia do kolekcji)
2. Bez przerwania ciągu: ukończenie R1 koloru **B**
3. Pojawia się karta decyzji (okno ~5 s)

### Efekt po użyciu (bazowo 2 min)

* efekt R1, ale **dla obu kolorów jednocześnie**

### Haiku

> Dwa chłodne widma
> Splatają ogony na granicy
> I znikają razem

---

## 🟫 PDR — Przenikające Doświadczenie Rytuału

**ID:** `PDR_WORLD_BREATH`
**Typ:** MEMORY / Jakość świata
**Target:** GLOBAL

### Warunek

* **9×** karta R2 tego samego zestawu kolorów

### Efekt globalny

* spowolnienie spawnu meteorów
* co 3 sekundy: losowy kolor **nie pojawia się** przez krótki moment
* świat “oddycha”, eskalacja zostaje wyhamowana

### Haiku

> Kosmos zwalnia puls
> Jeden kolor milknie na moment
> I słychać oddech

---

## 🟨 EVENT — Halo Trial (planeta gazowa)

**ID:** `HALO_TRIAL_GAS_PLANET`
**Typ:** EVENT / TRIAL
**Status:** v2 — **domyślnie wyłączony (flaga)**

### Trigger

* kometa uderza w **planetę gazową**
  (planeta z ≥2 kolorami orbiterów)

### Warunek sukcesu

* **20 s** bez dołączenia nowego orbitera do tej planety

### Sukces

* planeta **traci połowę orbiterów**
  (usuwane, nie wyrzucane do świata)
* korekta orbity grawitacyjnej
* drop karty „Rozpuszczenie Ego”

---

## 🟨 Karta — Rozpuszczenie Ego

**ID:** `CARD_DISSOLVE_EGO`
**Typ:** RITUAL (2 s)
**Target:** TARGET_PLANET

### Efekt

* po 2 sekundach:

  * planeta traci połowę orbiterów
  * orbita grawitacyjna zostaje skorygowana

### Haiku

> W jądrze bez imienia
> Krąg puszcza własny cień
> I zostaje cisza

---

# Pack 01 — karty rozszerzające (8)

---

## 🟦 Dopalacz czasu rytuału

**ID:** `CARD_RELEASE_EXTEND`
**Typ:** DIRECT (warunkowa)
**Target:** ACTIVE_RITUAL

### Trigger

* tylko gdy aktywny jest efekt R1 lub R2

### Efekt

* **+60 s** do czasu trwania rytuału
* limit: 1× na aktywację

### Haiku

> Sekunda jest pyłem
> Wciągam ją w orbitę dłoni
> I puszczam wolniej

---

## 🟩 Oddalenie bez ucieczki

**ID:** `CARD_CAMERA_EASE_OUT`
**Typ:** DIRECT (czasowa)
**Target:** CAMERA

### Efekt

* płynny zoom-out przez 10–20 s
* po czasie powrót do normalnej skali

### Haiku

> Układ był całym niebem
> Teraz jest tylko wyspą
> W większej ciemności

---

## 🟥 Bliskość chaosu

**ID:** `CARD_CAMERA_EASE_IN`
**Typ:** DIRECT (czasowa)
**Target:** CAMERA

### Efekt

* płynny zoom-in przez 10–20 s
* po czasie powrót

### Haiku

> Ziarno meteoru
> Jest jak słońce z bliska
> I parzy wzrok

---

## 🟪 Deszcz z daleka (soft)

**ID:** `CARD_COMET_SHOWER_SOFT`
**Typ:** DIRECT (event)
**Target:** COMETS

### Efekt

* uruchamia „miękki” deszcz komet
  (mniej obiektów, większe odstępy)

### Haiku

> Zewnętrzny pył nadchodzi
> Nie jak kara — jak przypomnienie
> Że kadr jest chwilą

---

## 🟦 Zimny ogon

**ID:** `CARD_COMET_TAIL_DIM`
**Typ:** DIRECT (wizualna)
**Target:** COMETS_VISUAL

### Efekt

* ogony komet krótsze i słabsze przez 20 s
* brak wpływu na fizykę

### Haiku

> Ogon to oddech lodu
> W próżni zostaje kreska
> I zaraz gaśnie

---

## 🟫 Czysty Rezonans

**ID:** `CARD_RESONANCE_SILENCE`
**Typ:** DIRECT (czasowa)
**Target:** SCORE / UI

### Efekt

* przez X sekund:

  * harmonijne kolizje **nie otwierają ofert kart**
* świat działa normalnie, UI milknie

### Haiku

> Punkt nie musi świecić
> Harmonia nie prosi o znak
> Tylko trwa

---

## 🟩 Nie reaguj

**ID:** `CARD_SILENCE_NO_CLICK`
**Typ:** DIRECT / kolekcja
**Target:** RUN_PROFILE

### Efekt

* jeśli karta **nie zostanie kliknięta**:

  * w tym runie spada częstotliwość ofert kart

### Haiku

> Nie dotykaj gwiazdy
> Zobacz, jak sama przechodzi
> Przez ciemny ekran

---

## 🟦 Zawieszenie przechwytu

**ID:** `CARD_CAPTURE_PAUSE_SOFT`
**Typ:** DIRECT (czasowa)
**Target:** PLANET_CAPTURE

### Efekt

* przez 8–12 s:

  * przechwyty planet są osłabione
* struktury nie są niszczone

### Haiku

> Grawitacja przymyka oczy
> Na jedną krótką epokę
> I znów otwiera

---

## Uwagi końcowe

* Pakiet zaprojektowany do **jednego patcha**
* Halo Trial + Dissolve Ego: **pod flagą**
* Wszystkie karty są:

  * deklaratywne
  * testowalne wizualnie
  * spójne z filozofią „karta = pytanie”

---

Jeśli chcesz, w kolejnym kroku mogę:

* przygotować **drugi pack** (Struktura / Epoki / Gwiazdy),
* albo rozpisać **minimalny plan testów (QA)** pod ten pakiet,
* albo zrobić **wersję skróconą pod README / roadmapę**.
