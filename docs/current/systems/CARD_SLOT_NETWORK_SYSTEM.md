# Haiku Cosmos — CARD SLOT NETWORK SYSTEM

> Status: ROBOCZY / KANDYDAT DO KANONU
> Obszar: sieć slotów kart / aktywacja slotów / wzmocnienia / trwałość / pył / napięcie / blizny / naprawa slotów
> Źródło prawdy: NIE, dopóki dokument nie zostanie zatwierdzony i zsynchronizowany z dokumentami kanonicznymi
> Proponowana lokalizacja: `docs/current/systems/CARD_SLOT_NETWORK_SYSTEM.md`
> Powiązane dokumenty: `CARDS_SYSTEM.md`, `SUB_META_SYSTEM.md`, `ECONOMY_SYSTEM.md`, `PRG_SYSTEM.md`, `SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`, `UI_WORLD.md`, `SUB_META_V2_MASTER_SPEC.md`

---

## 1. Cel dokumentu

Ten dokument definiuje nowy system kart osadzanych w slotach SUB-META.

Zakres dokumentu:

* zasady aktywacji slotów R1 → R2 → R3 → R4,
* lokalność R2 dla ŚWIATA i PRG,
* globalność R3 i R4,
* warunki wkładania kart według kolorów,
* sieć wzmacniania kart niższego rzędu przez karty wyższego rzędu,
* trwałość kart osadzonych w slotach,
* stabilizację kart przez pył, naczynia pyłowe i kryształy,
* napięcia powstające przy usuwaniu lub pękaniu kart,
* blizny slotów i ich naprawę,
* zmianę roli DS / karty dodatkowego slotu w kartę naprawczą,
* podstawowy system powstawania, zbierania i deponowania pyłu,
* parametry, które muszą być dostępne w debug do strojenia.

Dokument nie definiuje finalnych wartości balansu.

Wszystkie liczby startowe są wartościami roboczymi i muszą być skalowalne w debug.

---

## 1A. Nota synchronizacyjna — DS i struktura slotu

- DS jest interpretowana jako karta naprawcza zdobywana przez AAA.
- Karta naprawcza nie jest osobnym nowym typem obok DS bez osobnej decyzji projektowej.
- Szczegóły struktury slotu, kart specjalnych, artefaktów i pamięci eonów opisuje `SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`.

---

## 1B. Nota synchronizacyjna — HUD zbiera tylko stosik pyłu

- HUD zbiera tylko surowy pył do stosiku.
- HUD nie zbiera bezpośrednio do flakonu/naczynia ani do kryształu.
- Flakon/naczynie i kryształ powstają w Kuźni.
- Stabilizatory slotów nadal mają formy: pył, flakon/naczynie i kryształ.
- Szczegóły pętli zbierania i rafinacji opisuje `DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`.

---


## 2. Zasada nadrzędna

Karty w slotach tworzą sieć zależności:

```text
R4 → R3 → R2 → R1
```

Niższe poziomy są fundamentem działania.

Wyższe poziomy:

* wzmacniają niższe poziomy,
* stabilizują układ,
* integrują konfigurację,
* zwiększają ryzyko napięcia, jeśli fundament zostanie uszkodzony.

Kolor jest nośnikiem linii zależności.

Tier karty nie zmienia zasad legalności osadzania, ale wpływa na:

* moc,
* siłę wzmocnienia,
* trwałość,
* koszt operacji,
* rodzaj odzysku,
* wartość stabilizacji.

Slot nie jest tylko miejscem na kartę.

Slot jest trwałym miejscem konfiguracji, które może zostać uszkodzone i zapamiętać bliznę.

---

## 3. Kolory bazowe

System używa czterech kolorów bazowych:

1. RED
2. YELLOW
3. GREEN
4. BLUE

Karty zawierają zestaw kolorów:

* R1: 1 kolor,
* R2: 2 kolory,
* R3: 3 kolory,
* R4: 4 kolory.

Kolejność kolorów w logice mechanicznej nie ma znaczenia.

Liczy się zbiór kolorów.

Przykład:

```text
RED_GREEN = GREEN_RED
```

---

## 4. Rzędy kart

### 4.1. R1 — fundament

R1 są kartami jednokolorowymi.

R1 definiują podstawowe działanie lokalnego slotu lub osi.

R1 są fundamentem dla R2.

Na początku gry aktywne są wyłącznie sloty R1.

### 4.2. R2 — lokalne wiązania

R2 są kartami dwukolorowymi.

R2 działają lokalnie:

* osobno dla ŚWIATA,
* osobno dla PRG.

R2 w ŚWIECIE wzmacnia i wiąże wyłącznie sloty ŚWIATA.

R2 w PRG wzmacnia i wiąże wyłącznie sloty PRG.

R2 nie wzmacnia bezpośrednio R1 z drugiej gałęzi.

### 4.3. R3 — globalna stabilizacja

R3 są kartami trójkolorowymi.

R3 działają globalnie.

R3 mogą korzystać z aktywnych R2:

* tylko ze ŚWIATA,
* tylko z PRG,
* albo z obu gałęzi jednocześnie.

R3 wzmacniają zgodne kolorystycznie R2 w całym układzie.

### 4.4. R4 — globalna jedność

R4 jest kartą czterokolorową.

R4 działa globalnie.

R4 nie należy ani do ŚWIATA, ani do PRG.

R4 reprezentuje jedność konfiguracji i wzmacnia globalnie R3, a przez nie całe drzewo niższych poziomów.

---

## 5. Sloty startowe

Na początku gry / przy pustej konfiguracji aktywne są wyłącznie sloty R1.

Gracz może włożyć kartę R1 do odpowiedniego slotu ŚWIATA albo PRG.

Sloty R2, R3 i R4 pozostają nieaktywne, dopóki nie zostaną spełnione ich warunki kolorystyczne.

---

## 6. Warunki aktywacji slotów wyższego rzędu

### 6.1. Warunek R2

Slot R2 staje się aktywny dla danej karty R2, jeśli w tej samej gałęzi istnieją aktywne R1 zawierające oba kolory R2.

Przykład dla ŚWIATA:

Aby włożyć kartę:

```text
CARD_R2_RED_GREEN
```

w slotach R1 ŚWIATA muszą być aktywne:

* R1 RED,
* R1 GREEN.

Przykład dla PRG:

Aby włożyć kartę:

```text
CARD_R2_YELLOW_BLUE
```

w slotach R1 PRG muszą być aktywne:

* R1 YELLOW,
* R1 BLUE.

Tier kart R1 nie ma znaczenia dla legalności osadzenia.

### 6.2. Warunek R3

Slot R3 staje się aktywny dla danej karty R3, jeśli w aktywnych slotach R2 istnieją co najmniej dwie karty R2, których suma kolorów pokrywa kolory karty R3.

R3 może korzystać z R2 z obu gałęzi.

Przykład:

Aby włożyć kartę:

```text
CARD_R3_RED_YELLOW_GREEN
```

gracz może mieć:

```text
R2 RED_YELLOW + R2 YELLOW_GREEN
```

albo:

```text
R2 RED_GREEN + R2 RED_YELLOW
```

albo:

```text
R2 RED_GREEN + R2 YELLOW_GREEN
```

Te R2 mogą znajdować się:

* oba w ŚWIECIE,
* oba w PRG,
* jeden w ŚWIECIE i jeden w PRG.

### 6.3. Warunek R4

Slot R4 staje się aktywny, jeśli w aktywnych slotach R3 istnieją co najmniej dwie karty R3, których suma kolorów pokrywa wszystkie cztery kolory systemu.

Przykład:

Aby włożyć kartę:

```text
CARD_R4_RED_YELLOW_GREEN_BLUE
```

gracz może mieć:

```text
R3 RED_YELLOW_GREEN + R3 YELLOW_GREEN_BLUE
```

albo:

```text
R3 RED_YELLOW_BLUE + R3 RED_GREEN_BLUE
```

albo dowolną inną parę R3, której suma kolorów zawiera:

```text
RED + YELLOW + GREEN + BLUE
```

---

## 7. Niezależność legalności od tieru

Legalność wkładania kart do slotów zależy wyłącznie od:

* rzędu karty,
* kolorów karty,
* aktywnych kart niższego rzędu,
* lokalności lub globalności danego poziomu.

Tier nie decyduje o tym, czy karta może zostać włożona do slotu.

Tier wpływa na:

* moc,
* wzmocnienie,
* trwałość,
* odzysk zasobu,
* koszt operacji,
* stabilność układu.

Tiery:

```text
DR
sDR
pDR
```

Startowe przeliczniki tierów:

```text
DR  = 1
sDR = 3
pDR = 9
```

Interpretacja:

```text
1 sDR = 3 DR
1 pDR = 9 DR
```

Wartości muszą być dostępne w debug.

---

## 8. Moc kart

### 8.1. Moc bazowa

Każda karta włożona do slotu ma bazową moc startową:

```text
basePower = 100
```

Wartość bazowa musi być parametrem debug.

### 8.2. Moc efektywna

Moc efektywna karty wynika z:

* mocy bazowej,
* tieru,
* trwałości,
* wzmocnień z kart wyższego rzędu,
* blizn slotu,
* napięć,
* kar stabilizacji.

Roboczy model:

```text
effectivePower =
  basePower
  × tierPowerMultiplier
  × durabilityPowerFactor
  × networkBoostFactor
  × scarPenaltyFactor
  × strainPenaltyFactor
```

Wzór jest kontraktem roboczym.

Implementacja może rozbić go na mniejsze funkcje, ale musi zachować możliwość debugowania każdej składowej.

---

## 9. Wzmacnianie R4 → R3 → R2 → R1

### 9.1. Zasada ogólna

Karta wyższego rzędu wzmacnia kartę niższego rzędu, jeśli dzielą odpowiednią linię kolorystyczną.

* R2 wzmacnia R1 w tej samej gałęzi, jeśli zawiera kolor R1.
* R3 wzmacnia zgodne kolorystycznie R2 globalnie.
* R4 wzmacnia R3 globalnie.

Kierunek wzmocnienia:

```text
R4 → R3 → R2 → R1
```

### 9.2. Lokalność R2

R2 ŚWIATA wzmacnia tylko R1 ŚWIATA.

R2 PRG wzmacnia tylko R1 PRG.

R2 nie przechodzi między gałęziami.

### 9.3. Globalność R3

R3 wzmacnia wszystkie R2 zawierające zgodne kolory, niezależnie od tego, czy R2 znajduje się w ŚWIECIE czy PRG.

### 9.4. Globalność R4

R4 wzmacnia wszystkie R3.

Wzmocnienie R4 spływa pośrednio przez R3 do R2, a dalej przez R2 do R1.

### 9.5. Propagacja wzmocnienia

Wzmocnienie powinno propagować w dół sieci.

Przykład:

* R4 wzmacnia R3,
* wzmocniona R3 wzmacnia R2,
* wzmocniona R2 wzmacnia R1.

To oznacza, że moc R1 może wzrosnąć nie tylko przez bezpośrednią obecność R2, ale także przez to, że R2 została wzmocniona przez R3 i R4.

### 9.6. Tryby liczenia wzmocnienia

Ponieważ nie jest jeszcze przesądzone, czy lepsze będą procenty, punkty czy model mieszany, system musi obsługiwać trzy tryby debug:

```text
percent
flat
mixed
```

#### Tryb procentowy

Wzmocnienie liczone jako procent mocy karty niższego rzędu.

Przykład:

```text
R1 = 100
R2 boost = +10%
R1 effective = 110
```

Zaleta:

* łatwo skalować,
* dobrze reaguje na tiery.

Ryzyko:

* może prowadzić do zbyt dużego wzrostu przy wielu poziomach.

#### Tryb punktowy

Wzmocnienie liczone jako płaska wartość punktowa.

Przykład:

```text
R1 = 100
R2 boost = +10 pkt
R1 effective = 110
```

Zaleta:

* łatwiejsza kontrola propagacji.

Ryzyko:

* może być mniej satysfakcjonujące przy wysokich tierach.

#### Tryb mieszany

Wzmocnienie składa się z płaskiej wartości i procentu.

Roboczo:

```text
effectiveBoost = flatBoost + percentBoost
```

To główny kandydat do testów.

### 9.7. Startowe wartości wzmocnienia

Startowe wartości robocze:

```text
DR  = +10% / +10 pkt
sDR = +30% / +30 pkt
pDR = +90% / +90 pkt
```

Wartości nie są finalne.

Muszą być dostępne w debug.

### 9.8. Ograniczenie wzrostu

Aby uniknąć niekontrolowanej eksplozji mocy, debug musi zawierać:

* maksymalny boost bezpośredni,
* maksymalny boost sieciowy,
* tłumienie propagacji,
* osobne mnożniki dla DR/sDR/pDR,
* osobne mnożniki dla R2/R3/R4.

Roboczy model:

```text
downstreamBoost =
  parentEffectivePower
  × parentBoostRate
  × propagationFalloff
```

---

## 10. Trwałość kart

### 10.1. Startowa trwałość

Po włożeniu do slotu karta ma:

```text
durability = 100%
```

Startowy czas bazowy dla DR:

```text
baseDurationDR = 10 minut
```

Wartość musi być dostępna w debug.

### 10.2. Zakres normalnej pracy

Karta w normalnej pracy traci trwałość z:

```text
100% → 80%
```

W tym zakresie karta działa stabilnie.

Spadek poniżej 80% może oznaczać:

* słabszą moc,
* większą podatność na napięcie,
* sygnał UI, że karta wchodzi w stan zużycia.

### 10.3. Próg usunięcia / zniszczenia

Kartę można wyciągnąć lub zniszczyć dopiero, gdy jej trwałość spadnie poniżej:

```text
destroyThreshold = 30%
```

Próg musi być parametrem debug.

### 10.4. Zużycie od momentu osadzenia

Czas trwałości karty rozpoczyna się w momencie włożenia karty do slotu.

Karta aktywna w slocie:

* działa,
* wzmacnia lub jest wzmacniana,
* traci trwałość,
* zużywa stabilizator, jeśli go posiada.

---

## 11. Stabilizatory czasu

### 11.1. Typy stabilizatorów

Istnieją trzy podstawowe stabilizatory:

1. pył,
2. naczynie pyłowe,
3. kryształ.

Stabilizator wkłada się do slotu pomocniczego przy karcie.

### 11.2. Efekt stabilizacji

Stabilizator zwalnia utratę trwałości karty.

Startowe wartości:

```text
pył              = 5× wolniejsze zużycie
naczynie pyłowe  = 7× wolniejsze zużycie
kryształ         = 10× wolniejsze zużycie
```

Wartości muszą być dostępne w debug.

### 11.3. Stabilizator zużywa się przed kartą

Jeśli karta posiada stabilizator, jako pierwszy zużywa się stabilizator.

Dopiero po zużyciu stabilizatora zużywa się sama karta.

### 11.4. Usunięcie stabilizatora

Gracz może usunąć stabilizator z karty.

Usunięcie stabilizatora jest bezpowrotne i niszczy stabilizator.

Po usunięciu stabilizatora karta zaczyna zużywać się z normalną prędkością albo z prędkością wynikającą z napięcia sieci.

---

## 12. Kolor stabilizatora a kolor karty

### 12.1. R1

Karta R1 wymaga stabilizatora w kolorze tej karty.

Zasada:

```text
jeden kolor karty = jeden kolor pyłu
```

### 12.2. R2

Karta R2 wymaga minimalnie jednego koloru pyłu należącego do kolorów tej karty.

Pełna stabilizacja R2 wymaga zasobu dwukolorowego zgodnego z kolorami karty.

Jeśli mieszanka jest niepełna:

```text
stabilizator zużywa się 2× szybciej
```

### 12.3. R3

Karta R3 wymaga minimalnie dwóch kolorów pyłu należących do kolorów tej karty.

Pełna stabilizacja R3 wymaga zasobu trójkolorowego zgodnego z kolorami karty.

Jeśli mieszanka jest niepełna:

```text
stabilizator zużywa się 3× szybciej
```

### 12.4. R4

Karta R4 wymaga minimalnie dwóch kolorów pyłu należących do kolorów tej karty.

Pełna stabilizacja R4 wymaga zasobu czterokolorowego zgodnego z kolorami karty.

Jeśli mieszanka jest niepełna:

```text
stabilizator zużywa się 4× szybciej
```

---

## 13. Szary pył jako stabilizator awaryjny

Szary pył powstaje z mieszania kolorów albo ze zderzenia meteorów różnych kolorów.

Szary pył pozostaje przede wszystkim materiałem Kuźni.

Może jednak działać jako awaryjny stabilizator.

### 13.1. Zasada

Szary pył może zostać użyty do stabilizacji dowolnej karty, ale działa gorzej niż pył kolorystycznie zgodny.

### 13.2. Kara szarego pyłu

Startowa kara:

```text
greyDustPenalty = 3× szybsze zużycie
```

Szary pył:

* nie daje pełnej stabilizacji,
* opóźnia rozpad,
* zmniejsza napięcie tymczasowo,
* kupuje graczowi czas na zdobycie właściwego pyłu.

Wartość musi być dostępna w debug.

---

## 14. Stabilizacja odgórna

### 14.1. Zasada

Stabilizator karty wyższego rzędu może częściowo stabilizować karty niższego rzędu w tej samej linii kolorystycznej.

* stabilizator R2 może zasilać czasowo R1,
* stabilizator R3 może zasilać czasowo R2 i R1,
* stabilizator R4 może zasilać czasowo R3, R2 i R1.

### 14.2. Cel projektowy

Odgórna stabilizacja pozwala graczowi stabilizować cały układ bez konieczności zasilania każdej karty osobno.

Nie jest to jednak stabilizacja darmowa.

Stabilizator wyższego rzędu zużywa się szybciej, jeśli zasila wiele kart niższego rzędu.

### 14.3. Proponowany model

Każdy stabilizator posiada pulę stabilizacji.

Karta, do której stabilizator jest przypisany bezpośrednio, zużywa tę pulę najwolniej.

Karty niższego rzędu pobierają stabilizację pośrednio.

Roboczy wzór:

```text
stabilizerDrain =
  baseDrain
  × directCardCost
  × networkLoadMultiplier
  × colorMatchPenalty
```

### 14.4. Tłumienie stabilizacji po poziomach

Startowe wartości robocze:

```text
R2 → R1 = 100%
R3 → R2 = 100%
R3 → R1 = 60%
R4 → R3 = 100%
R4 → R2 = 60%
R4 → R1 = 35%
```

Wartości muszą być skalowalne w debug.

---

## 15. Odzysk zasobów ze zniszczonych kart

Kartę można zniszczyć po spadku trwałości poniżej progu zniszczenia.

Odzysk zależy od tieru karty:

```text
DR  → pył
sDR → naczynie pyłowe
pDR → kryształ
```

Odzyskany zasób może zostać ponownie użyty.

Do debug:

* próg zniszczenia,
* szansa odzysku,
* ilość odzyskanego zasobu,
* zachowanie koloru odzyskanego zasobu,
* szansa na szary pył przy karcie uszkodzonej przez napięcie.

---

## 16. Napięcie sieci

### 16.1. Definicja

Napięcie powstaje, gdy karta niższego rzędu zostanie:

* usunięta,
* zniszczona,
* pęknięta,
* pozbawiona warunku kolorystycznego wymaganego przez wyższe karty.

Napięcie działa tylko w górę:

```text
R1 → R2 → R3 → R4
```

Nie działa w dół.

### 16.2. Kolor jako nośnik napięcia

Napięcie dotyczy tylko kart wyższego rzędu, które zawierają kolor usuwanej lub brakującej karty niższego rzędu.

Przykład:

Usunięcie R1 RED wpływa na:

* R2 zawierające RED,
* R3 zawierające RED,
* R4.

Nie wpływa na karty, które nie są połączone przez RED.

### 16.3. Trwanie napięcia

Napięcie trwa, dopóki gracz nie odbuduje brakującej linii.

Odbudowanie oznacza:

* włożenie nowej karty zgodnej kolorystycznie,
* przywrócenie minimalnego warunku aktywacji dla kart wyższego rzędu,
* ustabilizowanie linii, jeśli napięcie zdążyło uszkodzić wyższe poziomy.

### 16.4. Mnożniki napięcia

Startowe wartości przy usuwaniu R1, gdy istnieją karty wyższego rzędu:

```text
R2 = 2× szybsze starzenie
R3 = 4× szybsze starzenie
R4 = 8× szybsze starzenie
```

Wartości muszą być skalowalne w debug.

### 16.5. Stabilizator przyjmuje napięcie jako pierwszy

Jeśli karta objęta napięciem posiada stabilizator, napięcie zużywa stabilizator.

Dopiero po zużyciu stabilizatora napięcie zużywa samą kartę.

### 16.6. Kaskada napięcia

Jeśli karta zniszczy się z powodu napięcia, może zwiększyć napięcie dla wyższych kart w linii.

Przykład:

* usunięcie R1 zwiększa napięcie R2/R3/R4,
* jeśli R2 pęknie, napięcie R3/R4 rośnie,
* jeśli R3 pęknie, napięcie R4 rośnie.

---

## 17. Pęknięcia kart

### 17.1. Definicja

Pęknięcie karty następuje, gdy karta zostanie zużyta przez napięcie albo utraci trwałość w warunkach niestabilnej sieci.

Pęknięcie:

* niszczy kartę,
* zostawia bliznę na slocie,
* może przenieść napięcie wyżej.

### 17.2. Pęknięcie R2

Jeśli pęknie R2, a nad nią istnieje R3 lub R4, napięcie przechodzi na R3/R4.

Blizna pojawia się na slocie R2.

### 17.3. Pęknięcie R3

Jeśli pęknie R3, a istnieje R4, napięcie przechodzi na R4.

Blizna pojawia się na slocie R3.

### 17.4. Pęknięcie R4

Jeśli pęknie R4, blizna pojawia się na slocie R4.

Pęknięcie R4 jest uszkodzeniem globalnego rdzenia konfiguracji.

---

## 18. Blizny slotów

### 18.1. Definicja

Blizna to trwałe uszkodzenie slotu powstałe po pęknięciu karty w tym slocie.

Blizna nie jest stanem karty.

Blizna należy do slotu.

### 18.2. Poziomy blizny

Slot może mieć kolejne poziomy blizny.

Startowe wartości kar:

```text
pierwsza blizna = -3% skuteczności slotu
druga blizna    = -10% skuteczności slotu
trzecia blizna  = -25% skuteczności slotu
```

Wartości muszą być dostępne w debug.

### 18.3. Działanie blizny

Blizna może wpływać na:

* moc karty włożonej do slotu,
* tempo zużywania stabilizatora,
* tempo zużywania karty,
* siłę napięcia przenoszonego przez slot,
* koszt naprawy.

Startowo głównym efektem blizny jest kara do skuteczności slotu.

### 18.4. Blizna w aktualnym eonie

Blizna powstała w aktualnym eonie może zostać naprawiona.

Naprawa wymaga:

* karty naprawczej,
* odpowiedniego pyłu / naczynia / kryształu,
* zgodności kolorystycznej z naprawianym slotem.

### 18.5. Blizna po końcu eonu

Jeśli gracz nie naprawi blizny przed końcem eonu, blizna zostaje utrwalona.

Utrwalona blizna przechodzi do kolejnego eonu.

Utrwalonej blizny nie można naprawić zwykłą kartą naprawczą z pyłem.

Taka blizna staje się częścią długoterminowej pamięci konfiguracji.

---

## 19. Karta naprawcza

### 19.1. Zmiana roli DS

Dotychczasowa karta dodatkowego slotu zmienia funkcję.

Nowa rola:

```text
karta naprawcza slotu
```

Techniczne oznaczenie `DS` może zostać zachowane tymczasowo jako legacy alias, ale znaczeniowo karta nie służy już do dodawania zwykłego slotu.

### 19.2. Robocze nazwy

Możliwe nazwy:

* Karta Naprawcza,
* Karta Rezonansu Slotu,
* Karta Zabliźnienia,
* Karta Splotu,
* RS — Repair Slot,
* DS — legacy alias.

Do czasu decyzji nazewniczej dokument używa nazwy:

```text
karta naprawcza
```

### 19.3. Funkcja

Karta naprawcza pozwala naprawić bliznę slotu, jeśli zostanie użyta z odpowiednim zasobem stabilizującym.

### 19.4. Warunek koloru karty naprawczej

Karta naprawcza musi posiadać przynajmniej jeden kolor zgodny z naprawianym slotem.

Dla slotów wielokolorowych pełna zgodność kolorystyczna jest wymagana od zasobu naprawczego, niekoniecznie od samej karty naprawczej.

---

## 20. Naprawa slotu

### 20.1. Naprawa pierwszej blizny

Pierwszą bliznę naprawia:

* karta naprawcza,
* pył odpowiedni dla slotu.

Efekt:

```text
usuwa poziom blizny -3%
```

### 20.2. Naprawa drugiej blizny

Drugą bliznę naprawia:

* karta naprawcza,
* naczynie pyłowe odpowiednie dla slotu.

Efekt:

```text
usuwa poziom blizny -10%
```

### 20.3. Naprawa trzeciej blizny

Trzecią bliznę naprawia:

* karta naprawcza,
* kryształ odpowiedni dla slotu.

Efekt:

```text
usuwa poziom blizny -25%
```

### 20.4. Kolory zasobu naprawczego

Wymagania kolorystyczne zasobu zależą od rzędu slotu:

```text
slot R1 = zasób jednokolorowy zgodny z kolorem slotu
slot R2 = zasób dwukolorowy zgodny z kolorami slotu
slot R3 = zasób trójkolorowy zgodny z kolorami slotu
slot R4 = zasób czterokolorowy zgodny z kolorami slotu
```

Dla R4 wymagany jest zasób zawierający wszystkie cztery kolory.

### 20.5. Naprawa a eon

Naprawa działa tylko dla blizn powstałych w aktualnym eonie.

Po zakończeniu eonu nienaprawione blizny zostają utrwalone.

---

## 21. Usuwanie kart z ustabilizowanego układu

Gracz nie musi od razu niszczyć całej linii, aby wymienić kartę niższego rzędu.

Może:

1. usunąć stabilizator z danej karty,
2. pozwolić karcie szybciej tracić trwałość,
3. zniszczyć ją po zejściu poniżej progu,
4. włożyć nową kartę,
5. odbudować linię przed pęknięciem kart wyższego rzędu.

To tworzy świadomą procedurę wymiany elementu w aktywnej sieci.

---

## 22. Koszty slotów zależne od rzędu

Koszt operacji slotowej nie jest już stały dla wszystkich kart.

Koszt zależy od rzędu karty:

```text
R1
R2
R3
R4
```

Startowe wartości robocze:

```text
R1 = 10 RP
R2 = 20 RP
R3 = 40 RP
R4 = 80 RP
```

Wartości muszą być dostępne w debug.

Do decyzji implementacyjnej:

* czy koszt dotyczy wyłącznie włożenia karty,
* czy dotyczy także próby usunięcia,
* czy naprawa slotu ma osobny koszt RP,
* czy koszt rośnie przy bliznach.

---

## 23. Zniknięcie systemu aktywowania koloru w HUD

Dotychczasowy system aktywowania danego koloru w HUD zostaje usunięty.

Karta staje się aktywna po włożeniu do slotu.

Od momentu włożenia:

* rozpoczyna się jej czas trwałości,
* jej moc zaczyna wpływać na system,
* może być wzmacniana przez karty wyższego rzędu,
* może zużywać stabilizator,
* może uczestniczyć w napięciu sieci.

RUN HUD nie służy już do aktywowania kolorów kart.

HUD nadal może pokazywać:

* zasoby,
* pył,
* RP,
* stan zbierania,
* komunikaty,
* skróty SUB-META.

---

## 24. Zmiana układu PRG

W PRG docelowo pozostaje jedna standardowa karta dla danej osi / funkcji.

Druga karta, która wcześniej była przewidziana jako dodatkowy slot, zostaje przekształcona w kartę naprawczą.

To oznacza, że layout PRG musi zostać uporządkowany:

* główny slot karty funkcjonalnej,
* miejsce / mechanika karty naprawczej jako osobny system,
* bez traktowania drugiego slotu jako zwykłej równorzędnej karty PRG.

Zmiana wymaga aktualizacji:

* `SUB_META_SYSTEM.md`,
* `PRG_SYSTEM.md`,
* `UI_WORLD.md`,
* `SUB_META_V2_MASTER_SPEC.md`,
* runtime placeholderów SUB-META.

---

## 25. Pył z kolizji meteorów

### 25.1. Źródło pyłu

Pył powstaje podczas zderzenia dwóch meteorów.

Typy pyłu:

```text
RED    = zderzenie dwóch czerwonych meteorów
YELLOW = zderzenie dwóch żółtych meteorów
GREEN  = zderzenie dwóch zielonych meteorów
BLUE   = zderzenie dwóch niebieskich meteorów
GREY   = zderzenie meteorów różnych kolorów albo future mieszanie pyłu w SUB-META / Kuźni; nie bazowe mieszanie w HUD
```

### 25.2. Chmurka pyłu

Po zderzeniu powstaje mała chmurka pyłu w miejscu kolizji.

Gracz może kliknąć chmurkę, aby zebrać pył.

Chmurka ma:

* kolor,
* intensywność,
* gęstość,
* wartość procentową.

### 25.3. Sekwencja intensywności pyłu

Dla kolejnych uderzeń tego samego koloru:

```text
pierwsze uderzenie = 10%
drugie uderzenie   = 30%
trzecie uderzenie  = 50%
każde następne     = 50%
```

Wartości muszą być skalowalne w debug.

---

## 26. Zbieranie pyłu w HUD

### 26.1. Faza początkowa

Na początku gry gracz może zbierać tylko jeden kolor pyłu naraz.

Jeśli gracz zbiera kolor A, bazowy HUD nie przyjmuje koloru B do tego samego stosiku; próba innego koloru wymaga ostrzeżenia, blokady albo osobnej przyszłej decyzji, ale nie miesza stosiku w HUD.

### 26.2. Zasobnik HUD

Gracz może zdeponować pył do zasobnika po prawej stronie ekranu.

Każdy zasobnik ma pojemność:

```text
100%
```

Gdy zasobnik jest pełen, pojawia się przycisk:

```text
Zdeponuj
```

### 26.3. Koszt deponowania / DO AKTUALIZACJI

DO AKTUALIZACJI względem `DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`: bazowy HUD deponuje pełny stosik surowego pyłu, a nie naczynie ani kryształ.

Dawne startowe koszty deponowania naczynia/kryształu pozostają historycznym zapisem roboczym i wymagają synchronizacji z Kuźnią oraz ekonomią RP.

Wartości deponowania pyłu, jeśli wrócą do runtime, muszą być skalowalne w debug.

### 26.4. Mieszanie pyłu

DO AKTUALIZACJI / LEGACY IDEA względem `DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`: bazowy HUD nie miesza kolorów i nie zamienia częściowego stosiku w szary stosik po dodaniu innego koloru. Mieszanie kolorów pyłu jest przeniesione do SUB-META / Kuźni.

Szary pył, jeśli zostanie utrzymany w przyszłym balansie Kuźni, służy do:

* tworzenia naczyń pyłowych,
* tworzenia kryształów,
* awaryjnej stabilizacji.

---

## 27. Kuźnia zasobników

W późniejszej grze gracz może tworzyć lepsze stabilizatory z szarego pyłu.

Startowe koszty:

```text
DO AKTUALIZACJI: `DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md` przyjmuje roboczo 3 stosiki pyłu = 1 flakon/naczynie oraz 3 flakony/naczynia = 1 kryształ. Koszty RP i wariant szarego pyłu wymagają osobnego balansu.
```

Wartości muszą być skalowalne w debug.

---

## 28. Wielokolorowe zasobniki

Na wyższych poziomach rozwoju gracz może odblokować separację / filtrowanie pyłu do wielu kolorów.

Poziomy:

```text
1 kolor
2 kolory
3 kolory
4 kolory
```

DO AKTUALIZACJI względem `DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`: bazowy HUD nie wybiera typu zasobnika flakon/naczynie/kryształ. HUD zbiera wyłącznie surowy pył do stosiku; ewentualny multi-color HUD i automatyczne zbieranie wymagają osobnego passu.

W przyszłym, niebazowym modelu gracz może wybierać liczbę kolorów:

   * 1,
   * 2,
   * 3,
   * 4.

Dostępność wyborów zależy od:

* zasobów w magazynie,
* poziomu odblokowania,
* dostępności odpowiedniego zasobnika.

---

## 29. Debug / balans

Wszystkie poniższe parametry muszą być dostępne w debug.

### 29.1. Sloty i legalność

* włącz/wyłącz wymogi kolorystyczne R2,
* włącz/wyłącz wymogi kolorystyczne R3,
* włącz/wyłącz wymogi kolorystyczne R4,
* wymagane pokrycie kolorów dla R2/R3/R4,
* lokalność R2 ŚWIAT/PRG,
* globalność R3,
* globalność R4.

### 29.2. Moc

* `basePower`,
* `tierPowerMultiplier.DR`,
* `tierPowerMultiplier.sDR`,
* `tierPowerMultiplier.pDR`,
* `boostMode`,
* `boostFlat.R2toR1`,
* `boostFlat.R3toR2`,
* `boostFlat.R4toR3`,
* `boostPercent.R2toR1`,
* `boostPercent.R3toR2`,
* `boostPercent.R4toR3`,
* `boostPropagationFalloff`,
* `boostMaxDirect`,
* `boostMaxNetwork`.

### 29.3. Trwałość

* `baseDuration.DR`,
* `baseDuration.sDR`,
* `baseDuration.pDR`,
* `durabilityMinStable`,
* `destroyThreshold`,
* `durabilityPowerCurve`,
* `durabilityPowerMin`,
* `durabilityPowerMax`.

### 29.4. Stabilizatory

* `dustSlowdown`,
* `vesselSlowdown`,
* `crystalSlowdown`,
* `stabilizerCapacity`,
* `stabilizerDrainRate`,
* `networkStabilizationFalloff`,
* `colorMatchPenalty.R2`,
* `colorMatchPenalty.R3`,
* `colorMatchPenalty.R4`,
* `greyDustPenalty`.

### 29.5. Napięcie

* `strain.R1toR2`,
* `strain.R1toR3`,
* `strain.R1toR4`,
* `strain.R2toR3`,
* `strain.R2toR4`,
* `strain.R3toR4`,
* `cascadeStrainMultiplier`,
* `strainRecoveryMode`,
* `strainRequiresLineRebuild`.

### 29.6. Blizny

* `scarPenalty.level1`,
* `scarPenalty.level2`,
* `scarPenalty.level3`,
* `scarPersistsAcrossEon`,
* `scarRepairAllowedCurrentEonOnly`,
* `scarRepairCostDust`,
* `scarRepairCostVessel`,
* `scarRepairCostCrystal`.

### 29.7. Pył

* `dustCloudValue.first`,
* `dustCloudValue.second`,
* `dustCloudValue.third`,
* `dustCloudValue.next`,
* `dustPickupRadius`,
* `dustCloudLifetime`,
* `dustContainerCapacity`,
* `depositCost.dust`,
* `depositCost.vessel`,
* `depositCost.crystal`,
* `depositCost.grey`,
* `forgeCost.vesselGreyDust`,
* `forgeCost.vesselRP`,
* `forgeCost.crystalGreyDust`,
* `forgeCost.crystalRP`,
* `maxSimultaneousDustColors`.

### 29.8. Koszty slotów

* `slotCost.R1`,
* `slotCost.R2`,
* `slotCost.R3`,
* `slotCost.R4`,
* `repairCost.R1`,
* `repairCost.R2`,
* `repairCost.R3`,
* `repairCost.R4`,
* `scarCostMultiplier`.

---

## 30. Otwarte decyzje projektowe

Poniższe decyzje pozostają do doprecyzowania po pierwszych testach:

1. Czy trybem domyślnym wzmocnienia będzie `mixed`, czy tylko opcją debug?
2. Czy koszt slotu dotyczy wyłącznie włożenia karty, czy także operacji wymiany?
3. Czy naprawa blizny kosztuje dodatkowe RP poza kartą naprawczą i pyłem?
4. Czy utrwalone blizny po eonie będą możliwe do naprawy przez późniejszy, specjalny system endgame?
5. Czy szary pył może być użyty do naprawy blizny jako awaryjny zamiennik, czy tylko do stabilizacji?
6. Jak nazwać kartę naprawczą w UI i dokumentacji kanonicznej?
7. Czy pęknięcie R4 powinno wywoływać dodatkowy event eonu?

---

## 31. Status wdrożenia

Ten dokument jest roboczym kandydatem do kanonu.

Po zatwierdzeniu należy wykonać osobne kroki:

### Krok 1 — zapis dokumentu

Dodać plik:

```text
docs/current/systems/CARD_SLOT_NETWORK_SYSTEM.md
```

Bez zmian runtime.

### Krok 2 — aktualizacja map dokumentacji

Zaktualizować:

* `docs/current/README.md`,
* `docs/current/maps/PROJECT_INDEX.md`,
* `docs/current/maps/DEPENDENCY_MAP.md`,
* ewentualnie `docs/current/systems/README.md`, jeśli istnieje.

### Krok 3 — aktualizacja dokumentów kanonicznych

Zsynchronizować:

* `CARDS_SYSTEM.md`,
* `SUB_META_SYSTEM.md`,
* `ECONOMY_SYSTEM.md`,
* `PRG_SYSTEM.md`,
* `UI_WORLD.md`,
* `SUB_META_V2_MASTER_SPEC.md`.

### Krok 4 — model danych

Dopiero po dokumentacji przygotować model danych dla:

* slotów,
* trwałości,
* stabilizatorów,
* blizn,
* napięcia,
* pyłu,
* kosztów debug.

### Krok 5 — implementacja etapowa

Implementować w kolejności:

1. legalność slotów R1/R2/R3/R4,
2. lokalność R2 i globalność R3/R4,
3. debug parametrów,
4. moc i wzmocnienia,
5. trwałość,
6. stabilizatory,
7. napięcie,
8. blizny,
9. karta naprawcza,
10. pył z kolizji,
11. HUD zasobników,
12. Kuźnia zasobników.

Nie implementować wszystkiego jednym patchem.
