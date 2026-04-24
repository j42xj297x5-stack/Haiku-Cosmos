> Status: LEGACY / HISTORYCZNY
> Źródło prawdy: NIE
> Powód przeniesienia: dokument historyczny po migracji do docs/current/.
> Aktualne źródło prawdy: docs/current/README.md oraz docs/current/maps/PROJECT_INDEX.md

# Haiku Cosmos — TARGETS SYSTEM

System targetów, sekwencji i efektów świata (kanon)

Ten dokument opisuje:

- czym są targety,
- czym są sekwencje,
- jak karty wpływają na świat,
- oraz jak NIE są realizowane sloty (ważne).

---

## 1. Definicje podstawowe

### 1.1 Target

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

### 1.1 Sekwencja harmoniczna

Sekwencja harmoniczna jest działaniem gracza w RUN, która spełnia określone warunki (np. połączenie dwóch meteorów tego samego koloru).

Sekwencja harmoniczna:

- może zakończyć się sukcesem lub porażką,
- może wygenerować kartę,
- może przyznać punkty lub modyfikator punktowy.

Sekwencja harmoniczna NIE jest slotem.
Sekwencja harmoniczna NIE jest elementem META.

---

## 2. Karty sekwencji harmonicznych R1, R2, R3(TODO), R4(TODO)

Karty zdobyte w wyniku sekwencji:

- są związane z kolorami meteorów,
- trafiają do kolekcji,
- mogą być używane w SUB-META lub META.

Każda karta posiada:

- typ (np. R1, R2),
- kolor oraz zestaw parametrów,
- listę dozwolonych slotów zależną od koloru (allowedSlots),
- koszt przypisania do slotu (opisany w ECONOMY SYSTEM.md),
- definicję targetu, który uruchamia po aktywacji.

---

## 3. Sloty META-ŚWIAT I META-PRG — KANON

W grze istnieją cztery sloty(gałęzie) META-ŚWIAT i cztery kategorie (gałęzie) META-PRG:

Dla Świata:

1. 🔴 Forma  
2. 🟡 Intencja  
3. 🟢 Czas  
4. 🔵 Cisza  

Dla PRG

1. 🔴 Wielkość ringu
2. 🟡 Glue ↔ Odpychanie
3. 🟢 Przyśpiesz ↔ Zwolnij
4. 🔵 Wpływ na obiekty Meteory ↔ Komety ↔ Planetoidy ↔ Planety

---

## 4. Sekwencje a sloty Świata i kategorie PRG

Sekwencja harmoniczna:

- jest procesem w RUN,
- generuje kartę jeśli sukces,
- generuje combo punktowe jeśli porażka (dla karty R1),
- generuje combo punktowe i karty jeśli porażka (dla kart R2, R3, R4),
- nie przypisuje automatycznie wygenerowanej karty do slotu.

Karta R1, R2, R3, R4:

- jest wynikiem sekwencji,
- może być przypisana do jednego z czterech slotów Świata lub jednego z czterech kategorii PRG,
- po przypisaniu modyfikuje działanie targetów.

Wzmocnienia typu:

- wydłużenie czasu działania,
- zmiana zakresu,
- zmiana intensywności,

są realizowane przez SLOTY, a nie przez sekwencję.

---

## 5. Typy i rodzaje kart

Wszelkie dane dotyczące kart są zamieszczone w plikach:

- CARDS_SYSTEM.md
- ECONOMY SYSTEM.md

## 6. Status dokumentu

Kanon obowiązujący.
Slot Rytuał usunięty.
Rytuały i sloty są rozdzielone konceptualnie i technicznie.
