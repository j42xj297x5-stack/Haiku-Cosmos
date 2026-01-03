# Haiku Cosmos — TARGETS SYSTEM
## System targetów, rytuałów i efektów świata (kanon)

Ten dokument opisuje:
- czym są targety,
- czym są rytuały,
- jak karty wpływają na świat,
- oraz jak NIE są realizowane sloty (ważne).

---

## 1. Definicje podstawowe

### Target
Target to konkretny efekt w świecie gry, który:
- modyfikuje zachowanie obiektów (meteory, planetoidy, planety, gwiazdy),
- działa w czasie lub jednorazowo,
- jest uruchamiany przez:
  - kartę,
  - event,
  - stan świata.

Target NIE jest UI i NIE jest kartą.
Jest czysto mechanicznym efektem runtime.

---

### Rytuał
Rytuał to sekwencja akcji gracza w RUN,
która spełnia określone warunki (np. streak koloru, harmonia, kolejność zdarzeń).

Rytuał:
- może zakończyć się sukcesem lub porażką,
- może wygenerować kartę,
- może przyznać punkty lub modyfikator punktowy.

Rytuał NIE jest slotem.
Rytuał NIE jest elementem META.

---

## 2. Karty rytualne

Karty zdobyte w wyniku rytuałów:
- są normalnymi kartami,
- trafiają do kolekcji,
- mogą być używane w SUB-META lub META.

Każda karta posiada:
- typ (np. R1, R2),
- kolor lub zestaw parametrów,
- listę dozwolonych slotów (allowedSlots),
- koszt przypisania do slotu (opisany w SUB_META_SYSTEM.md),
- definicję targetu, który uruchamia po aktywacji.

---

## 3. Sloty META — KANON

W grze istnieją WYŁĄCZNIE cztery sloty META:

1. Forma  
2. Intencja  
3. Czas  
4. Cisza  

Nie istnieje „Slot Rytuał”.

Jeśli w starszych wersjach dokumentacji pojawiało się pojęcie „Slot Rytuał”,
należy je uznać za nieaktualne i archiwalne.

---

## 4. Rytuały a sloty

Rytuał:
- jest procesem w RUN,
- generuje kartę,
- NIE jest przypisywany do slotu.

Karta:
- jest wynikiem rytuału,
- może być przypisana do jednego lub kilku z czterech slotów,
- po przypisaniu modyfikuje działanie targetów.

Wzmocnienia typu:
- wydłużenie czasu działania,
- zmiana zakresu,
- zmiana intensywności,

są realizowane przez SLOTY, a nie przez rytuał.

---

## 5. Przykład: R1 „Puszczanie” (kanon)

Rytuał R1:
- warunek: sekwencja zdarzeń jednego koloru,
- sukces: karta R1 danego koloru,
- porażka: punktowe combo (np. x2).

Karta R1:
- allowedSlots: Czas, Cisza,
- efekt bazowy:
  „wolne meteory danego koloru nie mogą wchodzić na orbity”,
- czas bazowy: 3 minuty.

Sloty:
- Slot Czas: wydłuża czas działania targetu,
- Slot Cisza: również wydłuża czas (inna semantyka, ten sam efekt v1).

---

## 6. Status dokumentu

Kanon obowiązujący.
Slot Rytuał usunięty.
Rytuały i sloty są rozdzielone konceptualnie i technicznie.
