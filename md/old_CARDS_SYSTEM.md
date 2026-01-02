# Haiku Cosmos — CARDS_SYSTEM.md

> Ten dokument opisuje **system kart** jako mechanikę decyzji, nauki i pamięci.
> Karty w Haiku Cosmos nie są talią do zarządzania — są **oknami możliwości**.

---

## 1. Rola kart w grze

Karty w Haiku Cosmos:
- **nie są stale widoczne**
- **nie są zasobem do wydawania**
- **nie zatrzymują czasu**

Karta pojawia się jako **impuls świata**, na który gracz może odpowiedzieć — albo nie.

Zasada nadrzędna:
> karta to pytanie, nie polecenie

---

## 2. Moment pojawienia się karty

Karty pojawiają się w wyniku:
- określonych **zdarzeń mechanicznych** (np. punkty z kolizji harmonijnych)
- przekroczenia progów (np. pierwsze pary punktów)
- rzadkich eventów zewnętrznych

Pojawienie się karty:
- jest krótkie
- nie przerywa rozgrywki
- nie gwarantuje komfortowego wyboru

---

## 3. Decyzja gracza (okno wyboru)

Każda karta tworzy **krótkie okno decyzji**.

Gracz może:

### 3.1 Aktywować kartę (klik)
- karta **działa natychmiast** lub przez określony czas
- efekt może być:
  - bezpośredni (np. zmiana zachowania kursora)
  - pośredni (zmiana parametrów świata)

Po użyciu:
- karta **znika z UI**
- zostaje tylko **pamięć użycia** (ślad w runie / profilu)

### 3.2 Nie aktywować karty (brak kliknięcia)
- karta znika
- zostaje **skolekcjonowana** jako wiedza

Możliwe konsekwencje kolekcji:
- odblokowanie pasywnego efektu w przyszłych runach
- zwiększenie puli kart
- zmiana prawdopodobieństw

Brak kliknięcia **nie jest stratą**.

---

## 4. Nauka przez doświadczenie

- karta może być:
  - niekorzystna w danym momencie
  - korzystna w innym kontekście

System kart wspiera:
- eksperyment
- błędy
- zapamiętywanie relacji przyczynowo-skutkowych

Gracz uczy się:
> *kiedy* i *gdzie* dana karta ma sens

---

## 5. Typy kart

### 5.1 Karty bezpośrednie (aktywne)
- działają przez krótki czas (np. 5 s)
- zmieniają lokalne reguły
- przykład: wzmocnienie meteorów w regionie kursora (większa prędkość + większy „glue”)

### 5.2 Karty pośrednie (warunkowe)
- zmieniają parametry świata
- wpływają na przyszłe zdarzenia
- przykład: tempo spawnu meteorów, rozmiar stref grawitacyjnych

### 5.3 Karty pamięci (meta)
- wynik kolekcjonowania
- działają poza pojedynczym runem
- nie są aktywowane manualnie

---

## 6. Rytuały (sekwencje i przetrwanie)

Rytuał to karta, która **nie daje efektu natychmiast**. Zamiast tego tworzy **okno trwania** i zestaw warunków.

Rytuał może:
- **zakończyć się sukcesem** → uruchamia nagrodę
- **złamać się** → nic się nie dzieje albo uruchamia się efekt uboczny

To wspiera Twoje pomysły typu „przetrwaj” / „utrzymaj” / „sekwencja” bez robienia z gry panelu.

### 6.1 Model deklaratywny (dane, nie kod)

Karta może zawierać opcjonalny blok `ritual`:
- `durationMs` — jak długo trzeba wytrwać
- `conditions[]` — warunki
- `onComplete[]` — efekty po spełnieniu
- `onFail[]` — efekty po złamaniu (opcjonalnie)

Przykładowe warunki (roboczo):
- `SURVIVE`
- `BH_BELOW(x)`
- `NO_COLLAPSE`
- `KEEP_TARGET_ALIVE`

### 6.2 UI rytuału
- minimalny sygnał „trwasz / pękło”
- bez arcade’owego timera (możliwy subtelny puls/oddech)

### 6.3 Rytuały a wiązania
Rytuały są naturalnym kandydatem do Slotu Intencji:
- zwiększają tolerancję czasu
- gwarantują pojawienie się pierwszego rytuału
- zmieniają pulę rytuałów w runie

---

## 7. Tryby wpływu kart

System wspiera trzy tryby:
- `INDIRECT` — tylko wpływ pośredni
- `DIRECT` — tylko aktywacje sytuacyjne
- `MIXED` — oba tryby współistnieją

Tryb może być:
- ustawiony globalnie
- modyfikowany przez epoki

---

## 8. Powiązanie z punktami

- punkty powstają z **harmonijnych kolizji** (ten sam kolor)
- pierwsze punkty odblokowują karty
- dalsze punkty regulują tempo ich pojawiania się

Punkty:
- nie są walutą
- są miarą rezonansu świata

---

## 9. Brak talii i kontroli

Świadome decyzje:
- brak ekranu talii w trakcie runu
- brak ręcznego zagrywania w dowolnym momencie
- brak cofania decyzji

Karty są:
- efemeryczne
- sytuacyjne
- nieodwracalne

---

## 10. Spójność z UI i światem

- system kart jest zsynchronizowany z `UI_WORLD.md`
- efekty kart są zawsze **czytelne w świecie**, nie w ikonach
- karta nigdy nie zastępuje obserwacji

---

## 11. Notatki do dalszej iteracji

- [ ] ustalić dokładny czas „okna decyzji”
- [ ] zdefiniować, jak zapisywana jest „pamięć użycia”
- [ ] powiązać karty pamięci z epokami
- [ ] doprecyzować listę warunków rytuałów

---

> Karty w Haiku Cosmos nie mówią: „zrób to”.
> Mówią: **„to może się wydarzyć — czy chcesz to zobaczyć?”**
