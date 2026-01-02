# Haiku Cosmos — UI_WORLD.md
## Filozofia i zasady interfejsu

UI w Haiku Cosmos:
- nie konkuruje z rozgrywką,
- nie tłumaczy świata wprost,
- jest ciche, kontekstowe i reaktywne.

Interfejs nie jest HUD-em.
Jest ramą percepcji.

---

## 1. Zasada minimalizmu

UI:
- pokazuje tylko to, co konieczne,
- unika nadmiaru tekstu,
- preferuje stan wizualny zamiast opisów.

Decyzje gracza:
- wynikają z obserwacji,
- nie z checklisty komunikatów.

---

## 2. Warstwy UI

UI dzieli się na:

1. UI świata
- kursor,
- reakcje obiektów,
- subtelne wskaźniki stanu.

2. UI kart
- pojawiają się kontekstowo,
- znikają po decyzji,
- nie blokują widoku świata.

3. UI meta
- oddzielny ekran / warstwa,
- refleksja po runie,
- bez presji czasowej.

---

## 3. Meta UI — sloty i postęp

Meta UI wizualizuje cztery sloty:
- Forma
- Intencja
- Czas
- Cisza

### 3.1 Stany slotów

Każdy slot może być w jednym ze stanów:

- Zablokowany
  - wyszarzony,
  - obniżona opacity (np. 25–35%).

- Odblokowany
  - pełna widoczność,
  - brak dodatkowych efektów.

- Cel aktywny
  - delikatna poświata,
  - subtelny puls lub akcent.

UI:
- pokazuje gdzie gracz zmierza,
- nie wymusza ścieżki.

---

## 4. Wizualizacja bez tekstu

UI unika:
- tooltipów jako obowiązku,
- długich opisów.

Zamiast tego:
- kolor,
- rytm,
- ruch,
- cisza.

Tekst pojawia się tylko wtedy,
gdy brak go powodowałby nieczytelność.

---

## 5. Karty w UI

Karty:
- pojawiają się równolegle (jeśli to możliwe),
- nie blokują się wzajemnie,
- pozwalają na zbieranie bez użycia.

Decyzja:
- kliknięcie = efekt runtime,
- brak kliknięcia = impuls meta.

UI nie ocenia decyzji gracza.

---

## 6. Wielojęzyczność UI (i18n)

UI jest przygotowane na wiele języków.

Zasady:
- teksty UI nie są zapisane na sztywno,
- UI korzysta ze słownika językowego,
- język domyślny: polski,
- język alternatywny: angielski.

Zmiana języka:
- nie resetuje świata,
- nie zmienia mechaniki,
- dotyczy wyłącznie warstwy prezentacji.

Brak klucza:
- nie może powodować crasha,
- stosowany jest fallback do języka domyślnego.

---

## 7. UI a epoki

UI reaguje na epokę:
- wczesne epoki: większa czytelność obiektów,
- Epoka Gwiazd: większy minimalizm i LOD.

UI nie „tłumaczy” epoki tekstem.
Epoka jest odczuwana wizualnie.

---

## 8. Zasada projektowa końcowa

UI:
- nie prowadzi gracza za rękę,
- nie karze za brak wiedzy,
- wspiera uważność i obserwację.

Świat jest nauczycielem.
UI jest ciszą pomiędzy zdarzeniami.

---

## 9. Status dokumentu

Dokument systemowy.
Obowiązuje dla całego projektu.
Stanowi podstawę do implementacji UI i meta UI.
