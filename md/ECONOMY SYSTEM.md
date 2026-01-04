# Haiku Cosmos — ECONOMY SYSTEM
## System walut, kosztów i zasobów (KANON)

Ten dokument definiuje ekonomię Haiku Cosmos:
- waluty,
- zasoby,
- koszty decyzji,
- zależności między RUN, SUB-META i META.

Ekonomia nie jest systemem „nagród”.
Jest systemem **ograniczeń sensownych decyzji**.

---

## 1. Trzy podstawowe waluty gry

W Haiku Cosmos istnieją trzy klasy zasobów ekonomicznych:

1. Punkty Rezonansu (RP / score)
2. Karty kolorów (DR → sDR → PDR)
3. Karty jakościowe (późne epoki)

Każda z nich pełni inną funkcję i NIE jest wymienna 1:1.

---

## 2. Punkty Rezonansu (RP)

### Definicja
Punkty Rezonansu (RP) są globalną walutą decyzyjną.
Reprezentują zdolność gracza do ingerencji w porządek świata.

RP:
- są zdobywane w RUN,
- są wydawane w SUB-META i META,
- nie są kartami,
- nie są lootem.

RP są „tlenem spalania zmian”.

---

### Źródła RP
RP są przyznawane za:
- rytuały (sukcesy i porażki),
- combo punktowe,
- określone eventy świata,
- później: specjalne zdarzenia epokowe.

Źródła RP będą się zmieniać wraz z epokami.

---

### Wydatki RP
RP są wymagane do:
- przypisywania kart do slotów META,
- odblokowywania dodatkowych miejsc w slotach,
- zakupu ulepszeń PRG,
- decyzji META końcowego (reset / eon).

Im poważniejsza ingerencja — tym wyższy koszt RP.

---

## 3. Karty kolorów (zasób strukturalny)

### Kolory podstawowe
Istnieją cztery kolory podstawowe:

- 🔴 Czerwony — Forma
- 🟡 Żółty — Intencja
- 🟢 Zielony — Czas
- 🔵 Niebieski — Cisza

Kolory są bezpośrednio powiązane z:
- czterema slotami META,
- czterema kategoriami PRG.

---

### Typy kart kolorów

#### DR (Default Resonance)
- karty podstawowe,
- najczęściej zdobywane,
- dominują w Epokach 1–2.

#### sDR (Secondary Resonance)
- karty skondensowane,
- powstają w kuźni z DR,
- używane do silniejszych modyfikacji.

#### PDR (Primary Resonance)
- karty pierwotne,
- rzadkie,
- wpływają na META i sloty wysokiego poziomu.

Proces konwersji:
DR → sDR → PDR  
(jest kosztowny i kontrolowany)

---

## 4. Sloty META i kolory

### Sloty META
Istnieją cztery sloty META:
1. Forma (🔴)
2. Intencja (🟡)
3. Czas (🟢)
4. Cisza (🔵)

Tylko karty w kolorze slotu mogą być przypisane do danego slotu.

---

### Miejsca w slotach
Każdy slot posiada miejsca na karty:

- początkowo: 1 miejsce,
- maksimum: 3 miejsca na slot.

Miejsca reprezentują głębokość ingerencji w dany aspekt świata.

---

### Odblokowywanie dodatkowych miejsc
Odblokowanie nowego miejsca w slocie kosztuje:

- 10 RP
- 3 karty DR koloru slotu

UI:
- przy slocie pojawia się mały „+” w kolorze slotu,
- kliknięcie uruchamia próbę zakupu miejsca.

---

## 5. Koszt przypisywania kart do slotów

Każde przypisanie karty do slotu jest akcją płatną.

### Koszt bazowy
- 10 RP za każdą operację przypisania.

Operacje płatne:
- wpięcie karty do pustego miejsca,
- podmiana karty w slocie.

Jeśli RP są niewystarczające:
- operacja jest zablokowana,
- UI informuje o koszcie.

---

## 6. PRG — Programy Reakcji Gracza

PRG to osobna warstwa ekonomii.

PRG:
- są kupowane w SUB-META,
- są używane w RUN,
- działają jako aktywne tryby (toggle).

---

### Kategorie PRG (kolor = aspekt)

1. 🔴 Wielkość ringu
2. 🟡 Glue ↔ Odpychanie
3. 🟢 Przyśpiesz ↔ Zwolnij
4. 🔵 Meteory ↔ Planetoidy

Każda kategoria posiada przeciwstawne opcje.

---

### Miejsca PRG
- każda kategoria PRG posiada maksymalnie 2 miejsca,
- miejsca są droższe niż sloty META.

### Koszt odblokowania miejsca PRG
- 30 RP
- 6 kart DR koloru kategorii

PRG są kosztowne, bo dają wpływ bezpośredni w RUN.

---

## 7. PRG w RUN

Po zakupie:
- PRG są dostępne w trakcie RUN,
- gracz może je przełączać w locie (toggle UI),
- aktywny jest jeden tryb PRG naraz (v1).

PRG nie wymagają powrotu do SUB-META.

---

## 8. Kuźnia kart (kolekcja)

Prawa strona SUB-META pełni rolę kuźni:

- przechowuje karty DR,
- umożliwia ich konwersję do sDR i PDR,
- jest miejscem zarządzania zasobami strukturalnymi.

Kuźnia jest dostępna w SUB-META.

---

## 9. Epoki a ekonomia

### Epoki 1–2
- dominują karty DR,
- RP zdobywane głównie przez rytuały,
- ekonomia jest szybka i płynna.

### Epoka Gwiazd i dalej
- DR stają się rzadkie,
- RP zdobywane innymi mechanizmami,
- pojawiają się karty jakościowe i legendy.

Ekonomia zmienia się wraz ze skalą świata.

---

## 10. META końcowe

META końcowe:
- jest najdroższą decyzją ekonomiczną,
- resetuje RUN,
- przekształca zasoby w trwałe zmiany.

Koszty META:
- wysokie RP,
- PDR,
- specjalne karty jakościowe (później).

---

## 11. Status dokumentu

KANON.
Obowiązuje dla całej gry.
Jest podstawą projektowania:
- slotów,
- PRG,
- SUB-META,
- META końcowego.
