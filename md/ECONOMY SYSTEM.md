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

1. Punkty Rezonansu (RP)
2. Karty kolorów R1, R2, R3(TODO), R4(TODO) o mocach DR → sDR → PDR
3. Karty jakościowe (modyfikujące właściwości gałęzi)

Każda z nich pełni inną funkcję i NIE jest wymienna 1:1.

---

## 2. Punkty Rezonansu (RP)

### 2.1. Definicja

Punkty Rezonansu (RP) są globalną walutą decyzyjną.
Reprezentują zdolność gracza do ingerencji w porządek świata oraz w swoje możliwości wpływu na niego.

RP:

- są zdobywane w RUN,
- są wydawane w SUB-META i META,
- nie są kartami,

RP są „tlenem spalania zmian”.

---

### 2.2 Źródła RP

RP są przyznawane za:

- sekwencje harmoniczne (połączenie 2 meteorów o tym samym kolorze = 1RP),
- combo punktowe gdy wykonywane złożone sekwencje harmoniczne (R1 R2 R3 R4) są nieudane,
- określone eventy świata,
- specjalne zdarzenia epokowe.
- Po zakończeniu RUN w META przed rozpoczęciem nowego cyklu (EON)

Źródła RP będą się zmieniać wraz z epokami.

---

### 2.3. Wydatki RP

RP są wymagane do:

- przypisywania kart do slotów PRG i ŚWIAT,
- usuwaniu kart ze slotów PRG i ŚWIAT,
- odblokowywania dodatkowych miejsc w slotach,
- modyfikacji kart - kuźnia (DR - sDR - pDR).
- tworzeniu nowych kart - kuźnia.

Im poważniejsza ingerencja — tym wyższy koszt RP.

---

## 3. Karty kolorów (zasób strukturalny)

### 3.1. Karty podstawowe R1

Istnieją cztery kolory podstawowe dla kart R1:

- 🔴 Czerwony — Forma
- 🟡 Żółty — Intencja
- 🟢 Zielony — Czas
- 🔵 Niebieski — Cisza

Kolory są bezpośrednio powiązane z:

- czterema slotami META,
- czterema kategoriami PRG.

---

### 3.1. Karty podstawowe dwukolorowe R2

Istnieje sześć kart dwukolorowych R2:

- 🔴🟡 Czerwono - Żółta dla Świata i gałęzi Forma - Intencja
- 🟡🟢 Żółto - Zielona dla Świata i gałęzi Intencja - Czas
- 🟢🔵 Zielono - Niebieska dla Świata i gałęzi Czas - Cisza
- 🔴🟢 Czerwono - Zielona dla PRG i gałęzi Wielkość - Prędkość
- 🔴🔵 Czerwono - Niebieska dla PRG i gałęzi Wielkość - Obiekty
- 🟡🔵 Żółto - Niebieska dla PRG i gałęzi Klej - Obiekty

Kolory są bezpośrednio powiązane z:

- czterema slotami META,
- czterema kategoriami PRG.

### 3.2. Karty Trzykolorowe R3 (TODO)

### 3.3. Karty Czterokolorowe R4 (TODO)

### 3.4. Typy kart kolorów

#### 3.4.1. DR (Doświadczenie Rezonansu)

- karty podstawowe,
- zdobywane podczas RUN,
- nie można ich wykonać w META - kuźni

#### 3.4.2. sDR (sublimowane Doświadczenie Rezonansu)

- karty skondensowane,
- nie można ich zdobyć w RUN,
- powstają w META kuźni z kart DR, 3 x DR = 1 sDR
- podczas tworzenia kart sDR zużywane są karty DR tego samego koloru (lub kolorów)
- używane do silniejszych modyfikacji, odblokowywania dodatkowych możliwości.

#### 3.4.3. PDR (pierwotne Doświadczenie Rezonansu)

- karty pierwotne,
- są najwyższym możliwym poziomem skondensowania mocy
- umożliwiają odblokowywanie dodatkowych slotów i miejsc na karty oraz dalsze modyfikacje
- są używane do tworzenia **KART SPECJALNYCH** w kuźni.

Proces konwersji:
DR → sDR → PDR  
(jest kosztowny i kontrolowany)

### 3.5. Koszty przekształceń kart

Aby przekształcić karty z DR do sDR a sDR do pDR wymagane są PR (Punkty Rezonansu)

Koszty dla R1:

- DR → sDR = 10 PR
- sDR → PDR = 30 PR

Koszty dla R2:

- DR → sDR = 30 PR
- sDR → PDR = 90 PR

Koszty dla R3 (TODO)
Koszty dla R4 (TODO)

---

## 4. Sloty w META - ŚWIAT i kolory

### 4.1. Sloty Świata

Istnieją cztery sloty w META dla Świata:

1. Forma (🔴)
2. Intencja (🟡)
3. Czas (🟢)
4. Cisza (🔵)

Tylko karty w kolorze slotu mogą być przypisane do danego slotu.

---

### 4.2. Miejsca w slotach

#### 4.2.1. Każdy slot posiada miejsca na karty R1

- początkowo: 1 miejsce,
- maksimum: 3 miejsca na slot.

Miejsca reprezentują głębokość ingerencji w dany aspekt świata.

#### 4.2.2. Dodatkowe miejsca na karty

- sloty Świata można łączyć za pomocą kart R2
- istnieją trzy miejsca na karty R2:
    -- 🔴🟡 Czerwono - Żółta dla Świata i gałęzi Forma - Intencja
    -- 🟡🟢 Żółto - Zielona dla Świata i gałęzi Intencja - Czas
    -- 🟢🔵 Zielono - Niebieska dla Świata i gałęzi Czas - Cisza
- sloty Świata (gałęzie) posiadają dodatkowe miejsce Ekspansja (EKS)
- EKS zostaje odblokowana gdy w slocie danego koloru jest zainstalowana karta pDR

---

### 4.3. Odblokowywanie dodatkowych miejsc

- można wykupić dodatkowy miejsce w slocie za pomocą karty Dodatkowego Slotu (DS),
- Kartę DS można wykonać w kuźni,
- koszt karty DS: pDR danego koloru+ karty specjalna + 100PR,  

UI:

- gdy istnieje w magazynie karta DS dla danego slotu to przy slocie pojawia się mały „+” w kolorze slotu,
- kliknięcie uruchamia próbę zakupu miejsca.
- potwierdzenie wstawia nowe miejsce w slocie jednocześnie usuwając kartę DS z magazynu.

---

## 5. Koszt przypisywania kart do slotów

Każde przypisanie karty do slotu jest akcją płatną.

### 5.1. Koszt bazowy

- 10 RP za każdą operację przypisania: karta zostaje przypisana do slotu, jednocześnie znika z magazynu,
- 10 RP za każdą operację usunięcia karty ze slotu: karta zostaje usunięta ze slotu, jednocześnie trafia z powrotem do magazynu,
- wpięcie karty do pustego miejsca,
- podmiana karty w slocie.

Jeśli RP są niewystarczające:

- operacja jest zablokowana (karty możliwe do przypisania do slotu są wyszarzone),
- UI informuje o koszcie.

---

## 6. PRG w META — Programy Reakcji Gracza i kolory

PRG to osobna warstwa ekonomii, która kształtuje styl gry. Bazuje na podobnej mechanice kart i rozwoju jak w przypadku Świata. Różnica polega na zmienie wpływu gracza na mechanikę oddziaływań z obiektami.

### 6.1. Kategorie (gałęzie) PRG (kolor = aspekt)

1. 🔴 Wielkość ringu
2. 🟡 Glue ↔ Odpychanie
3. 🟢 Przyśpiesz ↔ Zwolnij
4. 🔵 Wpływ na obiekty Meteory ↔ Komety ↔ Planetoidy ↔ Planety

Każda kategoria posiada przeciwstawne opcje.

---

### 6.2. Kategorie PRG

- każda kategoria (gałąź) PRG posiada 1 miejsce na kartę typu R1 oraz jedno dodatkowe miejsce na kartę specjalną - Odbicie (ODB),
- kategorie (gałęzie) można łączyć za pomocą kart R2.
- istnieją trzy miejsca na karty R2:
    -- 🔴🟢 Czerwono - Zielona dla PRG i gałęzi Wielkość - Prędkość
    -- 🔴🔵 Czerwono - Niebieska dla PRG i gałęzi Wielkość - Obiekty
    -- 🟡🔵 Żółto - Niebieska dla PRG i gałęzi Klej - Obiekty

### 6.3. Łączenie kategorii (gałęzi)

- aby umożliwić połączenie dwóch kategorii obie muszą mieć zainstalowaną kartę sDR lub pDR danego koloru,
- gdy odpowiednie kategorie mają zainstalowane karty sDR lub pDR i w magazynie istnieje odpowiednia karta R2, wyświetla się aktywne miejsce łączenia gałęzi. Jeśli użytkownik w nie kliknie (wskaże), wyświetli się właściwa karta (lub karty) w oknie informacyjnym. Po zaznaczeniu jednej użytkownik może potwierdzić instalację karty w miejscu łączenia gałęzi,
- po zatwierdzeniu dane połączenie zostaje automatycznie aktywowane oraz wyświetlają się miejsca na karty ODB,
- gracz może stworzyć wszystkie dostępne połączenia kategorii w PRG.

### 6.4. Odblokowania miejsca Odbicie (ODB) w kategoriach PRG

- aby odblokować miejsce Odbicie (ODB) na kartę specjalną w kategorii (gałęzi) należy połączyć daną kategorię z inną za pomocą karty R2,

### 6.5. Aktywowanie jednego połączenia Kategorii

- możliwe jest aktywowanie tylko jednego połączenia gałęzi.
- jeśli użytkownik aktywował połączenie dwóch kategorii, to gdy chce aktywować inne połączenie (które już jest dostępne), wskazuje kursorem (zaznacza) kartę R2 i zatwierdza aktywację. Poprzednie połączenie automatycznie przestaje być aktywne.

---

## 7. PRG w RUN

- kategorie PRG działają aktywnie w  RUN (wpływ na ring, jego wielkość, przyciąganie itp),
- jeśli są utworzone połączenia za pomocą kart R2 gracz może je przełączać w locie podczas RUN (toggle UI),
- wybór połączenia kategorii PRG nie wymagają powrotu do SUB-META.

---

## 8. Kuźnia kart przekształcanie i modyfikacja

Lewa strona pod slotami Świata w SUB-META pełni rolę kuźni:

- umożliwia konwersję kart R1, R2, R3(TODO) oraz R4(TODO) do sDR i pDR,
- jest miejscem przekształcania zasobów.

Kuźnia jest dostępna w SUB-META i META.

---

## 9. META końcowe

META końcowe:

- finalizuje decyzje w ramach jednego RUN
- resetuje RUN,
- przekształca zasoby w trwałe zmiany.

Koszty META:

- wysokie RP,
- specjalne karty jakościowe (TODO).

---

## 10. Status dokumentu

KANON.
Obowiązuje dla całej gry.
Jest podstawą projektowania:

- slotów,
- PRG,
- SUB-META,
- META końcowego.
