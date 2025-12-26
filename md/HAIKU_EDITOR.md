# Haiku Cosmos — HAIKU_EDITOR.md

> Ten dokument opisuje **edytor haiku / kart** oraz **kanoniczny format danych kart**.
> Edytor jest kluczowym narzędziem rozwoju gry: pozwala dodawać karty w dowolnym momencie,
> bez naruszania stabilnej mechaniki świata.

---

## 1. Rola edytora (dlaczego jest osobnym systemem)

Edytor Haiku **nie jest tylko edytorem tekstu**.
To narzędzie do:

* rozwijania zawartości gry w czasie
* testowania zależności karta → świat
* budowania biblioteki kart bez refaktorów silnika

Zasada nadrzędna:

> **mechanika świata jest stabilna, karty są danymi**

---

## 2. Zakres edytora (MVP → wersja docelowa)

### 2.1 MVP (pierwsza wersja)

* dodawanie / edycja kart
* podgląd karty (jak pojawi się w runie)
* filtrowanie po klasach i tagach
* eksport / import `cards.json`

### 2.2 Wersja rozwijana (później)

* walidacja kart (czy używają istniejących parametrów)
* statystyki użycia kart
* grupowanie kart w paczki

---

## 3. Kanoniczny format karty

Każda karta jest **obiektem danych**, niezależnym od UI.

### 3.1 Pola podstawowe (core)

* `id` — unikalny identyfikator
* `schemaVersion` — wersja formatu
* `title` — krótki tytuł
* `haiku` — tablica 3 linii tekstu
* `class` — klasa karty (UX)
* `tags[]` — lekkie etykiety semantyczne
* `rarity` — opcjonalnie

---

## 4. Klasy kart (robocze, 5)

Klasa **nie determinuje mechaniki** — służy orientacji.

Propozycja robocza:

1. **USER** — haiku gracza (główna pula)
2. **MASTERS** — karty mistrzowskie
3. **FATE** — los, kosmos, eventy
4. **TOOL** — narzędzia sytuacyjne (DIRECT)
5. **MEMORY** — meta / pamięć

> Jeśli finalne 5 klas będą inne — zmieniamy tylko listę, nie format.

---

## 5. Tagi (ważniejsze niż klasy)

Tagi opisują **z czym karta wchodzi w interakcję**.

Przykłady:

* `cursor`
* `meteor`
* `gravity`
* `rings`
* `epoch`
* `event`
* `resonance`
* `ritual`
* `binding`

Tagi służą do:

* filtrowania w edytorze
* kontroli balansu (np. limit kart typu `cursor`)
* budowania paczek kart

---

## 6. Efekty kart (warstwa wykonawcza)

Karta **nie wywołuje funkcji bezpośrednio**.
Deklaruje efekty, które silnik interpretuje.

### 6.1 Lista operacji (rozszerzalna)

* `SET` — ustaw parametr
* `ADD` — dodaj wartość
* `MUL` — pomnóż parametr
* `PULSE` — efekt czasowy
* `SPAWN_EVENT` — wywołaj event

### 6.2 Zakres (scope)

* `GLOBAL`
* `CURSOR_REGION`
* `TARGET_PLANET`
* `TARGET_STAR`

### 6.3 Przykład efektu

```json
{ "op": "MUL", "param": "pointerStrength", "value": 1.8, "scope": "CURSOR_REGION", "durationMs": 5000 }
```

---

## 7. Rytuały (blok opcjonalny)

Rytuał opisuje **efekt odroczony w czasie**.

### 7.1 Struktura `ritual`

* `durationMs` — czas trwania
* `conditions[]` — warunki
* `onComplete[]` — efekty po sukcesie
* `onFail[]` — efekty po porażce (opcjonalnie)

Przykładowe warunki:

* `SURVIVE`
* `BH_BELOW(x)`
* `NO_COLLAPSE`
* `KEEP_TARGET_ALIVE`

Efekty w `onComplete/onFail` używają **tego samego formatu co `effects[]`**.

---

## 8. Tryb karty i czas trwania

* `mode`: `DIRECT | INDIRECT | MEMORY`
* `durationMs`: dla kart DIRECT (opcjonalnie)

Rytuał **nie zastępuje trybu** — jest nadbudową.

---

## 9. Powiązanie z Wiązaniami (Bindings)

Karta może mieć metadane:

* `bindable: true/false`
* `allowedSlots[]` (Forma, Intencja, Czas, Cisza)
* `conflicts[]`

Edytor:

* **nie wykonuje wiązania**
* tylko opisuje, że karta *może* być związana

---

## 10. Mapa parametrów świata (kontrakt)

Edytor korzysta z jednego źródła prawdy:

* `PARAMS_WORLD.json`

Każdy parametr ma:

* nazwę
* typ
* opis
* zakres

Dodanie nowego parametru świata = automatycznie dostępny w edytorze.

---

## 11. Integracja z runem i meta

* użyta karta → zapis do „pamięci użycia"
* nieużyta → kolekcja
* po runie → możliwe wiązanie
* koniec runu → generacja **Haiku Card** (meta zapis)

---

## 12. Ewolucja formatu

Każda karta ma `schemaVersion`.

Nowe pomysły:

* dodajemy nowe pola
* stare karty nadal działają
* opcjonalny migrator danych

---

## 13. Zasada końcowa

> Jeśli karta nie mieści się w tym formacie,
> to znaczy, że **mechanika świata wymaga doprecyzowania**, a nie edytor.
