# Haiku Cosmos — SLOT LOADOUT AND EON MEMORY SYSTEM

> Status: ROBOCZY / KANDYDAT DO KANONU / PRZED RUNTIME
> Obszar: struktura slotu / DS jako karta naprawcza / karty specjalne / artefakty / pamięć eonów
> Źródło prawdy: NIE, dopóki dokument nie zostanie zatwierdzony i zsynchronizowany z runtime
> Powiązane dokumenty: `CARD_SLOT_NETWORK_SYSTEM.md`, `CARD_SLOT_NETWORK_MIGRATION_CHECKLIST.md`, `CARDS_SYSTEM.md`, `SUB_META_SYSTEM.md`, `ECONOMY_SYSTEM.md`, `PRG_SYSTEM.md`, `../ui/UI_WORLD.md`, `../ui/SUB_META_V2_MASTER_SPEC.md`

---

## A. Cel dokumentu

Ten dokument jest roboczym rozszerzeniem `CARD_SLOT_NETWORK_SYSTEM.md` przed pierwszym runtime pass.

Opisuje kierunek projektowy dla:

* struktury slotu,
* DS jako karty naprawczej,
* kart specjalnych,
* artefaktów,
* pamięci między eonami.

Dokument nie zastępuje `CARD_SLOT_NETWORK_SYSTEM.md`. Doprecyzowuje elementy slotu i długoterminową pamięć konfiguracji, aby przyszłe prace systemowe, UI i visual nie projektowały tych obszarów w oderwaniu od decyzji o DS i pamięci eonów.

---

## B. Struktura slotu

Docelowy slot ŚWIATA lub PRG może być strukturą złożoną z czterech miejsc:

1. slot karty R,
2. slot stabilizatora / pyłu / naczynia / kryształu,
3. slot karty specjalnej,
4. slot artefaktu.

Znaczenie miejsc:

* karta R jest rdzeniem aktywności slotu,
* stabilizator wpływa na trwałość, czas działania albo napięcie slotu,
* karta specjalna rozszerza moc, wiedzę albo funkcję slotu,
* artefakt niesie jakość lub parametr zdobyty w świecie.

Karta R pozostaje bazowym warunkiem działania standardowego slotu. Pozostałe miejsca są traktowane jako warstwy loadoutu slotu, a nie jako zamienniki karty R.

---

## C. Zasada nieaktywności

Jeśli karta R zostanie usunięta albo pęknie, pozostałe elementy slotu nie znikają automatycznie.

Zasada robocza:

* stabilizator, karta specjalna i artefakt pozostają na swoich miejscach,
* elementy te nie tracą trwałości tak jak karta R tylko dlatego, że karta R wypadła lub została usunięta,
* stają się nieaktywne, dopóki slot nie ma aktywnej karty R albo nie spełnia minimalnego warunku działania.

W UI oznacza to potrzebę stanu „widoczne, ale nieaktywne” dla elementów pobocznych slotu.

---

## D. DS jako karta naprawcza

Decyzja projektowa:

* DS jest kartą naprawczą,
* DS nadal jest zdobywana przez system AAA,
* funkcja DS zmienia się z rozszerzania lub aktywowania nowych slotów na naprawę slotów,
* DS może tymczasowo pozostać nazwą techniczną,
* znaczeniowo DS oznacza kartę naprawczą slotu.

Zasady migracyjne:

* nie tworzyć nowego typu karty naprawczej obok DS bez osobnej decyzji,
* nie usuwać pętli AAA z `CARDS_SYSTEM.md`,
* AAA pozostaje źródłem zdobywania DS.

Dotychczasowy sens DS jako „Dodatkowego Slotu” jest historycznym/technicznym punktem wyjścia. Nowy kierunek znaczeniowy to naprawa slotu.

---

## E. Naprawa slotu przez DS

### E1. Nota synchronizacyjna — stabilizator a HUD collection

- Slot stabilizatora może przyjmować pył, flakon/naczynie albo kryształ.
- HUD zbiera tylko surowy pył do stosiku.
- Flakon/naczynie i kryształ są rafinowane w Kuźni, nie zbierane bezpośrednio w HUD.
- Karty specjalne mogą w przyszłości rozszerzać sposób zbierania pyłu.
- Szczegóły pętli opisuje `DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`.


Model naprawy pozostaje zgodny z kierunkiem `CARD_SLOT_NETWORK_SYSTEM.md`:

* DS jest używana do naprawy blizny slotu,
* do naprawy potrzebny jest odpowiedni zasób: pył, naczynie albo kryształ,
* zasób musi odpowiadać rzędowi i kolorom slotu,
* DS jest zużywana przy naprawie,
* naprawa dotyczy blizn z aktualnego eonu,
* utrwalone blizny po eonie pozostają poza zwykłą naprawą DS.

DS nie jest więc darmowym cofnięciem konsekwencji. Jest rytualnym narzędziem naprawy bieżących uszkodzeń slotu, zależnym od zgodnego zasobu stabilizującego.

---

## F. Karty specjalne

Karty specjalne są roboczo odrębną kategorią od kart R.

Zasady:

* karty specjalne nie są kartami R1/R2/R3/R4,
* karty specjalne reprezentują wiedzę, doświadczenie, umiejętność albo rozpoznanie zdobyte przez gracza,
* karty specjalne mogą rozszerzać moc ŚWIATA i PRG,
* karty specjalne mogą być tworzone w Kuźni z dostępnych elementów magazynu,
* karty specjalne nie tracą trwałości tak jak karty R,
* jeśli karta R wypada ze slotu, karta specjalna pozostaje na miejscu, ale jest nieaktywna.

Karty specjalne powinny być projektowane jako doświadczenie gracza zapisane w formie karty, nie jako kolejny wariant standardowej karty R.

---

## G. Karty specjalne a R4

Karty specjalne powiązane z R4 mogą wpływać na parametry całego drzewa.

R4 oddziałuje globalnie na całość konfiguracji, dlatego specjalna wiedza przy R4 może być jednym z narzędzi zmiany całego drzewa w późnej grze.

Ten kierunek nie definiuje finalnych efektów R4. Wskazuje jedynie, że specjalna wiedza osadzona przy poziomie R4 powinna mieć potencjał globalny, a nie wyłącznie lokalny.

---

## H. Artefakty

Artefakty są roboczo odrębną kategorią od kart R i kart specjalnych.

Zasady:

* artefakty to różne cząstki, jakości albo ślady, które pojawiają się w grze,
* artefakty są zasadniczo związane głównie ze ŚWIATEM,
* artefakty mogą dawać dodatkowe opcje slotom ŚWIATA,
* artefakty nie są zwykłymi kartami R,
* artefakty mogą być nośnikami parametrów, które przy zamknięciu eonu zmieniają slot ŚWIATA.

Artefakt jest śladem świata, a nie standardową kartą sekwencji.

---

## I. Artefakty i eon

Artefakty w zamykającym eonie mogą mieć siłę zmiany parametrów slotu ŚWIATA.

Wybrane jakości mogą przejść jako pamięć do kolejnego eonu. Nie jest to zwykły bonus liczbowy, tylko pamięć doświadczenia albo karmiczny ślad konfiguracji.

Oznacza to, że artefakt może pełnić podwójną rolę:

* w trakcie eonu: wpływa na opcje i jakość slotu ŚWIATA,
* przy zamknięciu eonu: może pozostawić ślad w pamięci kolejnego eonu.

---

## J. Pamięć eonów

Kierunek projektowy:

* nowy eon zaczyna się jak nowe narodziny,
* gracz zaczyna od nowa, ale nie całkiem od zera,
* część wiedzy lub umiejętności może zostać przeniesiona,
* gracz z czasem odkrywa, że pewne zdolności zostały już zdobyte wcześniej,
* karty specjalne są formą doświadczenia, które można przenieść,
* gracz nie może przenieść wszystkiego,
* wybór przenoszonych kart specjalnych i artefaktów jest strategiczną decyzją końca eonu,
* kolejne eony mają coraz większe wyzwania, więc wybór pamięci ma rosnące znaczenie.

Pamięć eonów ma uczyć selekcji. Gracz nie powinien mechanicznie zachowywać całego dorobku, tylko rozpoznawać, które doświadczenia są naprawdę istotne dla następnego narodzenia świata.

---

## K. Wizualizacja zużycia karty R

Roboczy kierunek visual/UI, bez implementacji:

* trwałość karty R można pokazywać przez pasek boczny schodzący w dół,
* alternatywnie przez przyciemnianie albo nakładkę degradacji,
* możliwy model warstw degradacji:
  1. lekkie zabrudzenie,
  2. rysy,
  3. mocniejsze pęknięcia,
  4. wżery / czarne uszkodzenia,
* warstwy mogą być PNG albo SVG z przezroczystością,
* pasek boczny jest bardziej czytelny,
* przyciemnianie i warstwy degradacji są bardziej eleganckie,
* finalna forma wymaga osobnego visual/UI passu.

Ten dokument nie rozstrzyga finalnej wizualizacji trwałości. Zapisuje tylko kierunek do przyszłego passu UI/visual.

---

## L. Granice dokumentu

Ten dokument:

* nie implementuje slotów,
* nie definiuje finalnych kosztów,
* nie definiuje finalnych kart specjalnych,
* nie definiuje finalnych artefaktów,
* nie zmienia runtime,
* jest roboczym kandydatem do kanonu.

Nie należy na podstawie tego dokumentu zmieniać JS, CSS, JSON, settings, assetów ani placeholderów bez osobnego zadania implementacyjnego.
