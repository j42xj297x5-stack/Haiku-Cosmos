# Haiku Cosmos — SUB META SYSTEM
## System SUB-META: oddechy, decyzje i ekonomia

SUB-META to warstwa pomiędzy RUN a META końcowym.
Jest miejscem:
- taktycznych decyzji,
- wydawania punktów score,
- przypisywania kart do slotów,
- zarządzania PRG.

---

## 1. Pozycja SUB-META w strukturze gry

RUN  
→ SUB-META (wiele razy w runie)  
→ META (koniec eonu / reset)

SUB-META:
- nie resetuje świata,
- nie resetuje runu,
- zatrzymuje lub silnie spowalnia symulację.

---

## 2. Wyzwalanie SUB-META (v1)

SUB-META otwiera się automatycznie:
- po utworzeniu pierwszej planety w runie.

W v1:
- tylko jeden automatyczny trigger,
- kolejne triggery (eventy, akcje) pojawią się później.

SUB-META otwiera się maksymalnie raz na run (v1).

---

## 3. UI SUB-META (v1)

SUB-META wyświetla overlay z dwoma kolumnami:

### Lewa kolumna — Sloty META
Cztery sloty w kolejności:
1. Forma
2. Intencja
3. Czas
4. Cisza

Sloty mogą być:
- puste,
- zajęte kartą.

Kliknięcie slotu:
- wybiera slot,
- wyświetla możliwe karty do przypisania.

---

### Prawa kolumna — Kolekcja kart
Wyświetlane są zebrane karty:
- w formie wąskich prostokątów kolorów,
- z licznikami ilości.

Kolekcja jest źródłem kart do przypisywania w slotach.

---

## 4. Przypisywanie kart do slotów

Przypisanie karty do slotu:
- jest akcją płatną,
- zużywa kartę z kolekcji,
- zapisuje konfigurację META na resztę runu.

### Koszt
- koszt bazowy: 10 punktów score za każdą operację przypisania.

Operacje płatne:
- wpięcie karty do pustego slotu,
- podmiana karty w slocie.

Jeśli gracz nie ma wystarczającej liczby punktów:
- opcja jest zablokowana,
- UI pokazuje koszt i brak środków.

---

## 5. Dozwolone sloty (allowedSlots)

Każda karta definiuje listę allowedSlots.

Jeśli karta nie pasuje do danego slotu:
- NIE jest wyświetlana w pickerze,
- NIE może być przypisana.

Dla rytuałów R1/R2 (v1):
- allowedSlots: Czas, Cisza.

---

## 6. PRG w SUB-META

SUB-META zawiera sekcję PRG:
- służącą do zakupu ulepszeń PRG,
- opartą o punkty score i wymagania kart.

Zakup PRG:
- odbywa się wyłącznie w SUB-META,
- jest permanentny na czas runu.

---

## 7. PRG w RUN (toggle)

Ulepszenia PRG zakupione w SUB-META:
- są dostępne w RUN,
- mogą być przełączane w locie (toggle UI).

Zasady:
- aktywny jest jeden tryb PRG naraz,
- przełączanie jest natychmiastowe,
- nie wymaga powrotu do SUB-META.

Przykładowe tryby (do zaprojektowania):
- większy glue,
- mniejszy / większy promień,
- przyśpieszanie meteorów,
- odpychanie zamiast przyciągania.

---

## 8. Zamykanie SUB-META

SUB-META zamykane jest świadomie przez gracza:
- przyciskiem „Wróć”,
- po zamknięciu symulacja świata zostaje wznowiona.

---

## 9. Status dokumentu

Kanon v1.
Ekonomia slotów i PRG wprowadzona.
SUB-META jest miejscem decyzji, nie resetu.
