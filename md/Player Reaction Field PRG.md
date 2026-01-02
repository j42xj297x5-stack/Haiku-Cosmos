# Haiku Cosmos — Player Reaction Field (PRG)

Dokument opisuje system **Pola Reakcji Gracza (PRG)** —
czyli sposób, w jaki świat fizycznie reaguje
na obecność i ruch kursora gracza.

PRG jest kluczowym interfejsem pomiędzy graczem a kosmosem
i stanowi obszar największej ekspresji stylu gry.

---

## 1. Definicja

**Pole Reakcji Gracza (PRG)** to zbiór reguł określających:
- jak obiekty świata reagują na kursor,
- w jakim zasięgu,
- z jaką siłą i charakterem,
- oraz w jakich warunkach reakcja może być zmieniona lub odwrócona.

PRG nie jest:
- kamerą,
- UI,
- globalną fizyką świata.

PRG jest:
- intencjonalnym narzędziem gracza,
- warstwą pośrednią między decyzją a fizyką,
- mechaniką wysokiego wpływu, ale ograniczonego czasu.

---

## 2. Parametry PRG

Poniższe parametry definiują Pole Reakcji
i mogą być modyfikowane kartami oraz meta.

### 2.1 Zasięg (Radius)

- promień obszaru reakcji wokół kursora
- wpływa na łatwość przechwytywania meteorów

Uwagi projektowe:
- powiększenie zasięgu istniało we wcześniejszych wersjach
- przywracane jako efekt czasowy kart
- brak użycia karty może wpływać na meta kolejnych runów

---

### 2.2 Znak reakcji (Attraction / Repulsion)

- tryb domyślny: przyciąganie
- tryb alternatywny: odpychanie

Zastosowania:
- ochrona planet przed kolapsem
- rozpraszanie deszczy meteorów
- defensywne reagowanie na eskalację

Odwrócenie znaku:
- nie zwiększa mocy
- zmienia charakter decyzji gracza

---

### 2.3 Siła i tempo reakcji

Obecny stan:
- meteory zwalniają w polu reakcji

Rozszerzenie:
- możliwość przyśpieszania obiektów w PRG

Znaczenie:
- agresywny, ryzykowny styl gry
- szybkie kolizje
- większe wymagania precyzji

Meta:
- wpływ na kolejne runy poprzez Ekspansję

---

### 2.4 Glue (lepkość trajektorii)

Glue określa:
- jak silnie trajektorie obiektów zakrzywiają się w stronę kursora

Znaczenie:
- kluczowy parametr przy wysokiej prędkości świata
- umożliwia precyzyjne kolizje mimo chaosu

Niski glue:
- ruch balistyczny
- większy chaos

Wysoki glue:
- kontrola
- precyzja

---

## 3. Stany świata wpływające na PRG

Poniższe efekty nie są parametrami kursora,
lecz czasowymi zmianami warunków świata.

---

### 3.1 Kondensacja świata (zamknięte pole)

- czasowe włączenie odbić od krawędzi ekranu
- obiekty nie mogą opuścić obszaru gry

Efekt:
- wzrost gęstości
- presja i chaos
- możliwość rytualnej kondensacji materii

Interpretacja:
- utrudnienie i szansa jednocześnie

---

### 3.2 Zatrzymanie obiektów w oknie

- jedna karta stabilizuje jeden obiekt:
  - planetę lub gwiazdę
- mniejsze obiekty nie są objęte efektem

Zastosowania:
- ochrona kluczowych struktur
- stabilizacja świata
- decyzja punktowa, nie globalna

---

### 3.3 Globalna rotacja (wczesna rotacja)

- rotacyjny ruch wszystkich obiektów
- efekt znany z zachowania świata przy czarnej dziurze

Charakter:
- silnie wizualny
- rytualny
- używany rzadko

Zastosowanie:
- karta wysokiego poziomu
- nagroda za meta-progresję

---

## 4. PRG a sloty meta

PRG nie tworzy nowego slotu meta.
Jest interpretowane przez istniejące osie.

### Forma
- trajektorie
- glue
- znak reakcji
- rotacja

### Czas
- czas trwania efektów PRG
- cooldowny
- wpływ na kolejne runy (Ekspansja)

### Intencja
- kontekst użycia:
  - ochrona
  - przygotowanie rytuału
  - kontrolowana kondensacja

### Cisza (pośrednio)
- brak reakcji
- neutralizacja pola
- odwrócenie działania

---

## 5. PRG a karty

- większość efektów PRG jest czasowa
- aktywowane poprzez karty
- brak użycia karty:
  - zasila meta
  - modyfikuje przyszłe runy

PRG jest w pełni zgodne z filozofią kart Haiku Cosmos:
- decyzja teraz
- konsekwencja później

---

## 6. PRG a Ekspansja

PRG naturalnie korzysta z Ekspansji slotu Czas.

Poziomy:
- DR: niewielka zmiana parametru
- sDR: zależność od epoki lub prędkości świata
- PDR: zmiana reguły reakcji

Ekspansja:
- nie zwiększa mocy
- rozszerza zasięg, czas lub warunki działania

---

## 7. PRG a Wiązania (v1)

### Czas + Cisza
- odwrócenie reakcji
- brak przyciągania
- defensywna kontrola eskalacji

### Forma + Intencja
- świadome kształtowanie trajektorii
- wybór między precyzją a chaosem

PRG jest jednym z głównych obszarów,
w których Wiązania są odczuwalne w gameplayu.

---

## 8. Granice systemu

PRG:
- nie działa stale
- nie automatyzuje gry
- nie przejmuje kontroli nad światem

PRG:
- tworzy krótkie, intensywne momenty decyzji
- wzmacnia styl gry
- pozostawia odpowiedzialność po stronie gracza

---

## 9. Status dokumentu

Dokument koncepcyjny.
Stanowi podstawę do:
- projektowania kart PRG
- implementacji w Codexie
- testów balansu i odczuwalności
