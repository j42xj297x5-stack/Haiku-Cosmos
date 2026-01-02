# Haiku Cosmos — DEPENDENCY_MAP.md
## Mapa zależności: Meta ↔ Karty ↔ Epoki ↔ UI ↔ Świat

Dokument porządkuje zależności pomiędzy systemami Haiku Cosmos.
To jest mapa architektury koncepcyjnej, używana jako:
- przewodnik przy projektowaniu nowych kart i zasad,
- kontrakt komunikacyjny dla Codexa,
- lista źródeł prawdy (source of truth).

---

## 1. Systemy i ich rola (skrót)

- Świat (World / mechanika)
  - fizyka, obiekty, kolizje, orbity, progi przejść
- Epoki (Epochs)
  - skala, priorytety sterowania, LOD i odczucie rozgrywki
- Karty (Cards)
  - decyzje runtime oraz impulsy meta
- Meta (Slots / Ekspansja / Wiązania)
  - długofalowa ewolucja stylu gry i „bohatera”
- UI (World UI / Cards UI / Meta UI)
  - prezentacja stanów, minimalizm, i18n

---

## 2. Źródła prawdy (source of truth)

Jeśli pojawia się konflikt w interpretacji, obowiązuje kolejność:

1) Mechanika świata (World)
- prawa i limity fizyki, obiekty, ich relacje

2) Epoki (Epochs)
- skala, priorytety interakcji, LOD

3) System kart (Cards)
- co karta robi w runtime, jak zasila meta

4) Meta (Bindings + Ekspansja)
- jak interpretować skutki kart w długim okresie

5) UI (UI_WORLD)
- jak to pokazać, bez zmiany mechaniki

Uwaga:
- UI nigdy nie narzuca mechaniki.
- Meta nigdy nie łamie praw świata, tylko zmienia interpretację i zasięg.

---

## 3. Schemat zależności (główna oś)

Świat → Epoki → (Sterowanie + LOD) → Karty → Meta → UI

Interpretacja:
- Świat określa co jest możliwe.
- Epoka określa jak to jest odczuwane.
- Karty dają decyzje.
- Meta utrwala styl.
- UI pokazuje wynik bez tłumaczenia.

---

## 4. Świat (World) i jego zależności

### 4.1 Świat jest fundamentem
Świat definiuje:
- obiekty: meteory, planetoidy, planety, gwiazdy
- przejścia fazowe (kolapsy)
- reguły kolizji i orbit
- progi jakościowe i masowe

### 4.2 Świat nie zależy od UI
UI może tylko wizualizować.
Nie może zmieniać praw fizyki.

### 4.3 Świat jest konsumowany przez Epoki
Epoki nie zmieniają ontologii świata.
Epoki zmieniają:
- skalę percepcji,
- priorytety sterowania,
- LOD wizualny.

---

## 5. Epoki (Epochs) jako warstwa skali

### 5.1 Epoki zależą od Świata
Epoki nie mogą łamać progów i zasad Świata.

### 5.2 Epoki wpływają na Karty i PRG
Epoka może zmieniać:
- priorytety działania PRG (co jest głównym celem sterowania),
- czytelność obiektów (LOD),
- rytm wydarzeń (presja).

### 5.3 Epoka Gwiazd (kluczowy przykład)
W Epoce Gwiazd:
- meteory pozostają atomem mechaniki,
- meteory są mniej widoczne (LOD),
- planetoidy stają się głównym uchwytem interakcji,
- orbity mogą być eliptyczne (render),
- roje są wydarzeniami, nie domyślną reprezentacją.

---

## 6. Karty (Cards): runtime i meta

### 6.1 Karty zależą od Świata
Karta nie może wprowadzać efektu sprzecznego z fizyką świata.
Karta może:
- chwilowo zmienić parametry,
- uruchomić zdarzenie,
- narzucić ograniczenie czasowe.

### 6.2 Karty zależą od Epoki
Epoka może wpływać na:
- częstotliwość dropu kart,
- sensowność użycia kart,
- priorytety sterowania (np. PRG).

### 6.3 Karty zasilają Meta
Zasada:
- kliknięcie = efekt runtime
- brak kliknięcia = impuls meta (Ekspansja)

### 6.4 Packi kart jako moduły
Przykłady modułów:
- Pack 04 PRG: kontrola reakcji świata na kursor
- Pack 05 planety gazowe: warunki jakościowe + cooldown

---

## 7. Meta (Slots / Ekspansja / Wiązania)

### 7.1 Meta zależy od Kart
Meta nie działa bez kart lub zdarzeń.
Meta jest pamięcią decyzji.

### 7.2 Sloty meta
- Forma: trajektorie, struktury, przechwyty
- Intencja: warunki jakościowe, sens decyzji
- Czas: cooldowny, rytm, tempo
- Cisza: negacja, przerwania, brak jako mechanika

### 7.3 Ekspansja
Ekspansja działa wewnątrz jednego slotu:
- DR / sDR / PDR
Rozszerza zasięg działania efektu w przyszłych runach.

### 7.4 Wiązania v1
Wiązania są ograniczone do dwóch relacji:
- Czas + Cisza (kontrola eskalacji, defensywa)
- Forma + Intencja (kształtowanie świata przez decyzje)

Wiązania:
- nie dodają nowych efektów runtime,
- zmieniają interpretację.

---

## 8. UI (World UI / Cards UI / Meta UI)

### 8.1 UI zależy od wszystkiego, ale niczego nie kontroluje
UI jest końcową warstwą prezentacji.

### 8.2 Meta UI
Meta UI wizualizuje:
- sloty (Forma, Intencja, Czas, Cisza)
- stany slotów:
  - zablokowany (wyszarzony)
  - odblokowany
  - cel aktywny (delikatna poświata)

UI pokazuje gdzie gracz zmierza, ale nie wymusza ścieżki.

### 8.3 UI kart
UI kart:
- nie może blokować widoku świata,
- powinno wspierać zasadę:
  - klik = użyj
  - brak kliknięcia = zbierz (meta)

### 8.4 i18n (wielojęzyczność)
- UI korzysta ze słownika (klucze → wartości)
- Karty używają wariantu A: `locales` w kartach
- Brak klucza nie może crashować gry (fallback do pl)

---

## 9. Test spójności (checklist)

Przy każdej nowej zmianie sprawdzamy:

1) Czy zmiana łamie prawa Świata?
- jeśli tak: stop

2) Czy zmiana jest epokowa czy ogólna?
- epokowa: tylko w danej epoce
- ogólna: musi być neutralna dla wcześniejszych epok

3) Czy karta ma jasny cel runtime i meta?
- jeśli nie: doprecyzować

4) Czy meta tylko interpretuje i rozszerza, a nie zastępuje rozgrywkę?
- jeśli nie: uprościć

5) Czy UI pokazuje stan bez narzucania mechaniki?
- jeśli nie: minimalizować

---

## 10. Status dokumentu

Dokument systemowy.
Służy jako mapa architektury i zależności.
Aktualizowany tylko, gdy zmienia się model systemów.
