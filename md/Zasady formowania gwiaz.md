# Haiku Cosmos — Zasady formowania gwiazd (v1)

Ten dokument definiuje nowe zasady powstawania gwiazd.
Celem jest zatrzymanie nagłej eskalacji planeta → gwiazda
oraz przywrócenie czytelnej, długiej fazy planetarnej.

Dokument jest przeznaczony do wdrożenia jednym patchem Codexa.

---

## 1. Zasada nadrzędna

> Gwiazda nie powstaje wyłącznie przez masę.

Masa jest warunkiem koniecznym, ale niewystarczającym.
Do powstania gwiazdy wymagane są warunki ilościowe, jakościowe
oraz przejście przez stan pre-gwiazdy.

---

## 2. Warunek ilościowy — próg masy (zależny od koloru)

Każda planeta akumuluje masę gwiazdową
(`starMassScore`), liczona jako suma:
- meteorów przechwyconych bezpośrednio
- planetoid (przeliczanych przez promień / masę)

### Progi bazowe (kanoniczne)

- **ŻÓŁTY:** 60 meteorów  
- **ZIELONY:** 130 meteorów  
- **NIEBIESKI:** 230 meteorów  
- **CZERWONY:** 360 meteorów  

> Próg masy nie zależy bezpośrednio od spawnu.
> Spawn wpływa jedynie na tempo dochodzenia do progu.

---

## 3. Warunek jakościowy — dominujący kolor

Aby planeta mogła wejść w stan pre-gwiazdy:

- jeden kolor musi stanowić określony procent wszystkich orbiterów

### Zakres progu jakościowego
- minimalnie: **50%**
- maksymalnie: **80%**

### Zasada progresji
- w pierwszych runach próg jest niski (bliżej 50%)
- wraz z postępem meta próg może rosnąć
- karty i sloty mogą modyfikować wymagany procent


Efekt:
- gwiazdy mają wyraźny charakter kolorystyczny
- zanika losowa, „przypadkowa” gwiazda

---

## 4. Okno planetarne (cooldown gwiazdy)

Po utworzeniu planety:

- przez **45 sekund (domyślnie)**:
  - planeta nie może wejść w stan pre-gwiazdy
  - nawet jeśli spełnia warunki masy i koloru

Cel:
- wizualna czytelność planety
- czas na pierścienie, decyzje, karty

---

## 5. Stan pre-gwiazdy

Jeśli planeta spełnia:
- próg masy
- próg dominującego koloru
- cooldown wygasł

→ planeta wchodzi w **stan pre-gwiazdy**

### Właściwości stanu pre-gwiazdy
- powolna, rytmiczna **pulsacja** (wolne tempo)
- wyraźny sygnał wizualny (zmiana światła / gęstości)
- stan trwa kilka sekund i może zostać przerwany

---

## 6. Rozstrzygnięcie stanu pre-gwiazdy

### A Stan NIE zostaje przerwany (kolaps)

- następuje kolaps do gwiazdy
- **wszystkie orbitery rotują do środka**
- **wszystkie orbitery znikają**
  (nie zostają ani meteory, ani planetoidy)
- efekt wizualny:
  - przyspieszająca rotacja
  - skupienie do jądra
  - zapłon gwiazdy

---

### B Stan ZOSTAJE przerwany

Jeśli stan pre-gwiazdy zostanie przerwany:

- planeta wraca do stanu planetarnego
- zgromadzona masa gwiazdowa **nie zeruje się**
- dodatkowy efekt:
  - **tempo zbierania meteorów rośnie o 30%**
    (tymczasowy bonus po „nieudanym zapłonie”)

Cel:
- nagrodzić aktywne przerwanie
- przyspieszyć kolejną próbę bez eskalacji

---

## 7. Ograniczenie kaskady przechwytów

Po powstaniu planety:
- przez pierwsze **15–20 sekund**:
  - przechwyty planetoid są ograniczone
  - planety nie mogą natychmiast „wciągnąć wszystkiego”

Cel:
- zapobieganie instant-gwieździe
- zachowanie dynamiki bez skoku skali

---

## 8. Integracja z kartami i meta

- karty z Pack 03 bezpośrednio wpływają na:
  - stan pre-gwiazdy
  - jego przerwanie lub wydłużenie
- meta może:
  - podnosić wymagany próg dominującego koloru
  - zmieniać czas cooldownu
  - modyfikować zachowanie stanu pre-gwiazdy

---

## 9. Status

- dokument systemowy (bez kart runtime)
- powinien zostać wdrożony **przed Pack 03**
