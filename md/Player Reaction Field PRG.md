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
- mechaniką wysokiego wpływu.

---

## 2. Parametry PRG

Poniższe parametry definiują Pole Reakcji
i mogą być modyfikowane kartami.

### 2.1 🔴 Zasięg (Radius)

- czerwony kolor kategorii,
- definiuje wielkość ringu (obszaru), którym gracz oddziaływuje na świat,
- wpływa na precyzję lub jej brak,
- korzystając z podstawowych kart R1 można Ring pomniejszyć (zwiększyć precyzję),
- korzystając z karty pasującej do miejsca Odbicie (ODB) można ring powiększyć,

---

### 2.2 🟡 Glue - odpychanie (Attraction / Repulsion)

- żółty kolor kategorii,
- definiuje moc przyciągania lub odpychania na obszarze ringu.
- korzystając z podstawowych kart R1 można zwiększyć przyciąganie,
- korzystając z karty pasującej do miejsca Odbicie (ODB) można obiekty od ringu odpychać. 

---

### 2.3 🟢 PRĘDKOŚĆ — spowolnienie lub przyśpieszenie wpływu na obiekty

- zielony kolor kategorii,
- definiuje prędkość obiektów na obszarze ringu.
- korzystając z podstawowych kart R1 można zpowolnić obiekty,
- korzystając z karty pasującej do miejsca Odbicie (ODB) można obiekty przyśpieszać.

---

### 2.4 🔵 OBIEKTY — oddziaływanie na większe obiekty

- niebieski kolor kategorii,
- definiuje na które obiekty gracz ma wpływ w obszarze ringu.
- korzystając z podstawowych kart R1 można zwiększać wpływ na obiekty,
- korzystając z karty pasującej do miejsca Odbicie (ODB) można zmieniać możliwości wpływu na obiekty.

---

## 3. Status dokumentu

Dokument koncepcyjny.
Stanowi podstawę do:
- projektowania kart PRG
- implementacji w Codexie
- testów balansu i odczuwalności
