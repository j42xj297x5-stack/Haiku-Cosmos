Świetnie. Poniżej masz **README / SPEC projektu “Haiku Cosmos”** w formie **jednego, spójnego dokumentu**, gotowego do wklejenia do repozytorium (np. `README.md`).
Jest napisany tak, żeby:

* **utrwalić wszystkie decyzje**, które już zapadły
* umożliwić **rozbijanie pracy na nowe wątki** bez utraty koncepcji
* służyć jako punkt odniesienia przy dalszym kodowaniu (mechanika, karty, UX)

---

# Haiku Cosmos — README / SPEC (WIP)

## 1. Idea gry (high-level)

**Haiku Cosmos** to medytacyjno-strategiczna gra kosmiczna typu *sandbox / skill-based*, w której gracz wpływa na ewolucję kosmosu poprzez subtelne oddziaływanie (wskaźnik/kursor), a rozwój rozgrywki jest modulowany przez **karty haiku**.

Gra nie polega na szybkim refleksie, lecz na:

* wyczuciu fizyki,
* planowaniu,
* pracy z ograniczeniami,
* akceptacji nieodwracalnych procesów (entropia, kolaps, czarna dziura).

---

## 2. Pętla rozgrywki (core loop)

1. Na ekran napływają **meteory** z losowych kierunków.
2. Gracz za pomocą **kursora (obszaru wpływu)** kieruje meteorami.
3. Kolizje meteorów:

   * **ten sam kolor** → punkty / zasób
   * **różne kolory** → powstaje **planetoida**
4. Planetoida:

   * przechwytuje kolejne meteory w swojej **orbicie grawitacyjnej**
   * meteory stają się **orbiterami** (krążą wokół planetoidy)
5. Po **13 przechwyconych meteorach**:

   * następuje **kolaps**
   * orbitery wpadają do środka i **znikają**
   * powstaje **planeta**
6. Planety → gwiazdy → czarna dziura (BH).
7. **Koniec gry**: czarna dziura zajmuje ~80% ekranu.

---

## 3. Obiekty świata

### 3.1 Meteory

* mają:

  * pozycję, prędkość, promień
  * kolor (`blue`, `green`, `red`, `yellow`)
* napływają **z krawędzi ekranu**, nie w kierunku środka
* odbijają się od ścian
* mogą być sterowane kursorem

### 3.2 Planetoidy

* powstają z kolizji **dwóch meteorów różnych kolorów**
* cechy:

  * **wielokąt foremny** (liczba boków zależna od pary kolorów)
  * **dryf** (vx, vy) wynikający z zachowania pędu meteorów
  * obrót (spin)
* posiadają:

  * **zewnętrzną orbitę grawitacyjną** (widoczny ring)
  * listę **orbiterów**
* orbita:

  * rośnie o **promień przechwyconego meteoru**
  * jest parametryczna (może być modyfikowana kartami)

### 3.3 Orbitery

* są **pełnymi meteorami** (zachowują swój promień i kolor)
* krążą po **niewidocznych orbitach** wokół planetoidy
* prędkość kątowa:

  * im bliżej środka, tym szybsza
* **brak kolizji orbiter–orbiter** (świadoma decyzja wydajnościowa)

### 3.4 Kolaps planetoidy → planeta

* po 13 przechwytach:

  * orbitery są przyciągane do środka
  * **znikają** (wchodzą w masę planety)
* kolaps jest procesem czasowym (animacja)

### 3.5 Planety

* mają:

  * promień wynikający z **sumy promieni i masy przechwyconych meteorów**
  * orbitę grawitacyjną
* kolor:

  * gradient z **dwóch najliczniejszych kolorów meteorów**
  * (możliwość planet jednokolorowych – sterowane kartami)
* wizualnie:

  * prosty gradient (na razie Canvas 2D)
  * planowany upgrade: terminator, pasy/plamy, atmosfera

### 3.6 Gwiazdy / Czarna dziura (future)

* gwiazdy powstają z planet (warunki masy/energii)
* typy:

  * zwykłe
  * białe karły
  * gwiazdy neutronowe
* supernova → czarna dziura
* BH:

  * rośnie
  * zmienia strukturę ruchu
  * kończy grę po osiągnięciu progu

---

## 4. Kursor (interakcja gracza)

Kursor to **obszar wpływu**, nie bezpośrednie sterowanie.

Parametry bazowe:

* `pointerRadius`
* `pointerStrength`

Dodatkowe mechaniki:

* **klejenie (pointerGlueDamp)**:

  * tłumienie prędkości meteorów w obrębie ring-u
  * ułatwia precyzyjne kolizje
* wszystkie parametry:

  * mogą być modyfikowane przez **karty** i **trudność runa**

---

## 5. System kart (Haiku Cards)

### 5.1 Rola kart

Karty:

* **nie zatrzymują czasu**
* **nie są aktywowane manualnie**
* **modyfikują parametry świata**

Są formą “wpływu karmicznego”, a nie bezpośredniej kontroli.

### 5.2 Pozyskiwanie kart

* karta dobierana **co 13 meteorów**
* limit ręki (np. 3)
* brak discard – wybory są trwałe

### 5.3 Typy kart

* **Haiku użytkownika (główna pula)**

  * inspirowane CAD / techniką / codziennością
* **Karty Mistrzowskie**

  * klasyczne haiku japońskie / chińskie
  * bardzo silne, rzadkie
* potencjalnie:

  * karty wyzwań
  * karty losu

### 5.4 Co mogą robić karty (przykłady)

* zmieniać:

  * `asteroidDriftMul`
  * `pointerRadius / Strength`
  * tempo spawnu meteorów
* modyfikować orbity:

  * powiększanie / zmniejszanie
  * odejmowanie orbiterów
* wpływać na kolory:

  * preferencje kolorów
  * jednokolorowe planety
* przyszłe:

  * komety (ilość fragmentów)
  * pierścienie planet
  * tempo wzrostu BH

### 5.5 Filozofia kart

* karty **nie cofają decyzji**
* raczej:

  * wzmacniają trendy
  * przesuwają balans
  * zwiększają lub zmniejszają chaos

---

## 6. Komety i fragmenty (planned)

* komety:

  * rzadkie
  * szybkie
  * rozbijają meteory
* fragmentacja:

  * meteor → N kawałków (N sterowane kartą)
  * masa zachowana (r²)
* fragmenty:

  * jeśli trafią w orbitę planety:

    * zasilają **pierścień planety (szary)**
    * masa wpływa na przyszłą gwiazdę
* pierścienie:

  * wizualne
  * tanie wydajnościowo
  * nie są symulacją pojedynczych cząstek

---

## 7. Wydajność i technologia

* **Canvas 2D**, bez WebGL (na razie)
* brak:

  * kolizji orbiter–orbiter
  * pełnej symulacji N²
* mobile-friendly:

  * uproszczona fizyka
  * ograniczona liczba obiektów
* WebGL możliwy **dopiero na końcu**, jako upgrade wizualny

---

## 8. Struktura repozytorium (propozycja)

```
HaikuCosmos/
├── index.html
├── game.js          # główna mechanika świata
├── cards.js         # definicje kart
├── haiku/
│   ├── user.json
│   ├── masters.json
├── README.md
```

---

## 9. Status projektu

* [x] meteory
* [x] planetoidy
* [x] orbitery
* [x] kolaps → planeta
* [x] parametry sterowane kartami
* [ ] wizual planet (lepsze)
* [ ] komety + fragmenty
* [ ] pierścienie planet
* [ ] gwiazdy
* [ ] czarna dziura
* [ ] edytor haiku

---

Jeśli chcesz:

* mogę teraz **rozbić README na krótszą wersję “START HERE”**
* albo przygotować **osobny README tylko dla kart**
* albo **CHECKLISTĘ implementacyjną** (kolejne kroki w kodzie)

Daj znać, co będzie najbardziej pomocne na następny etap.
