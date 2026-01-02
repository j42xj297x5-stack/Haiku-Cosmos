# Haiku Cosmos — UI_WORLD.md

> Ten dokument opisuje **interfejs użytkownika jako mechanikę poznawczą świata**.
> UI w Haiku Cosmos nie jest HUD-em ani panelem sterowania — jest sposobem patrzenia na kosmos.

---

## 1. Rola UI w Haiku Cosmos

- UI **nie tłumaczy świata wprost**
- UI **odsłania skalę i znaczenie** zdarzeń poprzez percepcję
- UI reaguje na **epoki, eventy i tempo kosmosu**

Zasada nadrzędna:
> gracz nie kontroluje świata — gracz uczy się go widzieć

---

## 2. Kamera jako element mechaniki

### 2.1 Kamera ≠ obiektyw stały
- kamera nie ma jednej skali
- skala widzenia jest **funkcją epoki i stanu świata**
- brak manualnego zoomu (domyślnie)

### 2.2 Wejście w nową epokę (zoom-out)
- każda nowa epoka powoduje **automatyczne oddalenie kamery**
- oddalenie jest:
  - płynne
  - spokojne
  - nieprzerywające rozgrywki

Efekt poznawczy:
- to, co było „całym światem”, staje się **lokalnym układem**
- gracz doświadcza relatywizacji skali

To jest **mechanika egzystencjalna gry**, nie efekt wizualny.

### 2.3 Skala a znaczenie
- wczesne epoki: bliski plan, chaos meteorów, pojedyncze zdarzenia „ważą” więcej
- późniejsze epoki: dalszy plan, struktury, eventy z zewnątrz, lokalne zdarzenia „ważą” mniej

UI komunikuje to **skalą i ruchem**, nie tekstem.

---

## 3. Epoki a interfejs

### 3.1 Epoka jako zmiana perspektywy
- epoka **nie jest levelem**
- epoka **nie resetuje świata**
- epoka zmienia:
  - skalę widzenia
  - rytm postrzegania
  - częstość eventów

### 3.2 Komunikacja zmiany epoki
- brak tekstu typu „Epoka II”
- brak popupów
- zmiana epoki jest odczuwana poprzez:
  - zoom-out
  - subtelną zmianę tła
  - zmianę rytmu świata

---

## 4. Informacje, punkty, karty

### 4.1 Punkty
- brak stałego licznika punktów
- punkty są **doświadczane**, nie monitorowane
- sygnał punktu:
  - krótkie, delikatne zdarzenie wizualne
  - znika

### 4.2 Karty (efemeryczne)
**Założenie UI:** karty **nie mieszkają na ekranie**.

- karta pojawia się **na chwilę** i znika
- gracz musi szybko zdecydować:
  - kliknąć i aktywować
  - zignorować i pozwolić jej odejść

Konsekwencje:

1) **Użycie w trakcie runu**
- karta uruchamia bonus/zmianę (czasową lub sytuacyjną)
- na ekranie zostaje tylko **pamięć użycia** (ślad, nie przycisk)
- gracz uczy się działania przez doświadczenie

2) **Nieużycie**
- jeśli gracz nie kliknie, karta zostaje **skolekcjonowana**
- może zasilić meta (np. pasywnie w następnym runie)

Cel:
- UI nie zamienia gry w panel zarządzania talią

---

## 5. Kursor jako fokus uwagi

- kursor nie jest bronią
- kursor jest **ogniskiem uwagi gracza**

Może zmieniać:
- promień
- charakter wpływu
- zachowanie meteorów

Ale:
- nigdy nie „strzela”
- nie staje się agresywnym narzędziem

---

## 6. UI a eventy

- UI sygnalizuje eventy poprzez:
  - zmianę ruchu kamery
  - napięcie w obrazie
  - zaburzenie rytmu
- brak ostrzeżeń tekstowych typu:
  > „Uwaga! Nadchodzi kometa!”

Gracz **zauważa**, zanim **zrozumie**.

---

## 7. Minimalizm i cisza

- UI zostawia przestrzeń pustą
- cisza wizualna jest zasobem
- brak ikon ≠ brak informacji

To, czego UI **nie pokazuje**, jest równie ważne jak to, co pokazuje.

---

## 8. Notatki do iteracji
- doprecyzować zachowanie kamery przy bardzo dużych eventach (BH, neutron star)
- ustalić, czy epoki mają subtelne różnice kolorystyczne
- powiązać zmiany kursora z kartami bezpośrednimi
