# Slot loadout — visual/UI checklist

> Status: ROBOCZY / CHECKLISTA UI-VISUAL / PRZED LAYOUT TOKENS / PRZED RUNTIME
> Obszar: UI / SUB-META / sloty / visual states
> Źródło prawdy: NIE dla mechaniki, NIE dla layout tokens, TAK roboczo dla checklisty czytelności visual/UI przed kolejnymi passami
> Powiązane dokumenty: ../systems/SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md, ../systems/CARD_SLOT_NETWORK_SYSTEM.md, SUB_META_V2_MASTER_SPEC.md, UI_WORLD.md, ../visual/VISUAL_EXECUTION_GUIDE.md

## 1. Cel dokumentu

Ten dokument porządkuje visual/UI dla slotu składającego się z czterech elementów:

- karty R,
- stabilizatora,
- karty specjalnej,
- artefaktu.

Celem jest przygotowanie przyszłych prac nad:

- SUB-META placeholderami,
- layout tokens,
- assetami,
- stanami UI,
- runtime visual states.

Dokument opisuje, co UI powinno umieć pokazać i jakie decyzje pozostają otwarte przed jakimkolwiek layout-token albo runtime pass. Nie projektuje finalnego układu slotu.

## 2. Granice

Ten dokument:

- nie zmienia runtime,
- nie zmienia layout tokens,
- nie definiuje finalnych assetów,
- nie zastępuje `SUB_META_V2_MASTER_SPEC.md`,
- nie zastępuje `SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`,
- nie definiuje balansu ani kosztów.

Checklistę należy traktować jako kontrakt czytelności i listę przyszłych stanów visual/UI, a nie jako kanon mechaniki ani instrukcję implementacyjną.

## 3. Czteroelementowy slot — model visual

Slot należy traktować jak mały ekosystem: karta R daje aktywność, a pozostałe elementy osadzają stabilność, wiedzę i ślad świata wokół rdzenia.

### A. Karta R

- Największy i najważniejszy element slotu.
- Rdzeń aktywności slotu.
- Pokazuje kolor, rząd, tier i trwałość.
- Jeśli znika lub pęka, reszta elementów slotu pozostaje, ale zasypia.

### B. Stabilizator

- Mały element przy karcie R.
- Pokazuje pył, naczynie albo kryształ.
- Może mieć kolor lub mieszankę kolorów.
- Pokazuje, że czas/trwałość karty R jest stabilizowana.

### C. Karta specjalna

- Element wiedzy albo umiejętności.
- Nie jest kartą R.
- Nie powinna wizualnie konkurować z kartą R.
- Powinna wyglądać jak „wiedza osadzona w slocie”, nie jak zwykły bonus.

### D. Artefakt

- Element jakości albo śladu świata.
- Zasadniczo ważniejszy dla ŚWIATA niż PRG.
- Powinien wyglądać bardziej materialnie/cząstkowo niż karta specjalna.
- Może być nośnikiem pamięci eonu.

## 4. Priorytet czytelności

UI slotu powinno odpowiadać na pytania w tej kolejności:

1. Czy slot ma aktywną kartę R?
2. Jaka jest trwałość karty R?
3. Czy slot jest stabilizowany?
4. Czy slot ma napięcie?
5. Czy slot ma bliznę?
6. Czy karta specjalna/artefakt są aktywne czy śpiące?
7. Czy slot może być naprawiony DS?

Czytelność tych informacji ma pierwszeństwo przed ornamentem, detalem materiałowym i efektami dynamicznymi.

## 5. Stany slotu

Visual/UI powinno docelowo rozróżniać następujące stany slotu:

- **Pusty** — gniazdo nie zawiera karty R ani aktywnych elementów pomocniczych; może pokazywać neutralny socket.
- **Gotowy / może przyjąć kartę** — slot jest dostępny i powinien komunikować możliwość osadzenia karty R.
- **Nieaktywny / zablokowany** — slot istnieje w układzie, ale nie może być użyty; nie powinien wyglądać jak pusty slot gotowy do akcji.
- **Aktywny** — karta R jest osadzona i pracuje jako rdzeń slotu.
- **Aktywny ze stabilizatorem** — karta R działa, a stabilizator komunikuje wydłużanie/stabilizację trwałości.
- **Aktywny z kartą specjalną** — karta R aktywuje wiedzę/umiejętność osadzoną w slocie.
- **Aktywny z artefaktem** — karta R aktywuje materialny ślad świata albo jakość artefaktu.
- **Pełny slot 4-elementowy** — karta R, stabilizator, karta specjalna i artefakt są osadzone; karta R nadal pozostaje najwyższym priorytetem czytelności.
- **Karta R zużywa się** — trwałość spada; stan powinien być odczytywalny bez otwierania debug UI.
- **Karta R pod napięciem** — slot sygnalizuje ryzyko lub presję dynamicznym stanem visual.
- **Karta R pęknięta** — karta R przestaje pełnić rolę aktywnego rdzenia; elementy pomocnicze przechodzą w sen.
- **Slot z blizną** — slot nosi statyczny ślad po uszkodzeniu lub historii użycia.
- **Slot w trakcie naprawy DS** — UI pokazuje proces naprawy albo gotowość do finalizacji naprawy zasobem DS.
- **Slot po naprawie** — slot wraca do użycia, ale może zachować subtelny ślad historii, jeśli system tak zdecyduje.
- **Slot z utrwaloną blizną po eonie** — blizna jest częścią pamięci eonu, odróżnioną od świeżego uszkodzenia.
- **Slot śpiący** — brak karty R, ale pozostają karta specjalna, artefakt lub stabilizator; elementy są widoczne, lecz nieaktywne.

## 6. Stany elementów pomocniczych

### Stabilizator

- **Brak** — slot nie ma osadzonego ani dostępnego stabilizatora.
- **Dostępny** — stabilizator może zostać użyty, ale nie jest osadzony.
- **Osadzony** — stabilizator znajduje się przy karcie R, ale nie musi jeszcze pracować aktywnie.
- **Aktywny** — stabilizator realnie wspiera trwałość/czas karty R.
- **Zużywany** — zasób stabilizacji spada; UI może pokazywać osypywanie pyłu, słabnięcie kryształu albo ubytek naczynia.
- **Wyczerpany** — stabilizator pozostaje jako ślad, ale nie stabilizuje.
- **Niezgodny kolorystycznie** — stabilizator nie pasuje do koloru slotu/karty R i wymaga ostrzeżenia bez agresywnego alarmu.
- **Szary pył / awaryjna stabilizacja** — fallback/awaryjna forma stabilizacji, mniej szlachetna i mniej kolorystyczna.

### Karta specjalna

- **Brak** — slot nie ma karty specjalnej.
- **Osadzona** — karta specjalna jest w slocie, ale jej aktywność zależy od karty R.
- **Aktywna** — karta R działa, więc wiedza/umiejętność jest aktywna.
- **Śpiąca** — karta specjalna pozostaje widoczna, ale nie działa bez aktywnej karty R.
- **Gotowa do przeniesienia między eonami** — UI może oznaczyć potencjalny transfer bez obiecywania mechaniki przeniesienia.
- **Nieprzenoszona / zostaje w eonie** — karta specjalna jest powiązana z bieżącym eonem i nie przechodzi dalej.

### Artefakt

- **Brak** — slot nie ma artefaktu.
- **Osadzony** — artefakt jest umieszczony w slocie.
- **Aktywny** — artefakt działa dzięki aktywnej karcie R.
- **Śpiący** — artefakt pozostaje widoczny jako materialny ślad, ale nie wpływa aktywnie bez karty R.
- **Wpływa na slot ŚWIATA** — artefakt wzmacnia albo zmienia jakość świata, nie tylko lokalny bonus UI.
- **Kandydat do pamięci eonu** — artefakt może stać się nośnikiem pamięci eonu.
- **Utracony / pozostawiony** — artefakt nie przechodzi dalej albo zostaje w historii eonu.

### DS

- **Dostępna** — karta naprawcza DS istnieje jako zasób możliwy do użycia.
- **Zgodna z kolorem slotu** — DS pasuje do slotu i może wspierać naprawę.
- **Niezgodna** — DS nie pasuje kolorystycznie albo systemowo; UI powinno jasno odróżnić brak zasobu od zasobu niezgodnego.
- **Gotowa do naprawy** — slot spełnia warunki użycia DS.
- **Zużyta przy naprawie** — DS została skonsumowana w procesie naprawy.
- **Brak zasobu naprawczego** — slot wymaga naprawy, ale gracz nie ma używalnej DS.

## 7. Trwałość karty R — warianty visual

Ta checklista nie rozstrzyga finalnej formy trwałości. Do dalszych testów pozostają trzy warianty.

### Wariant A — pasek boczny

- Pasek schodzi w dół wraz ze zużyciem.
- Bardzo czytelny.
- Dobry do debug i szybkiego odczytu.
- Ryzyko: może wyglądać zbyt technicznie.

### Wariant B — warstwy degradacji

- Karta ciemnieje i dostaje warstwy uszkodzeń.
- Bardziej eleganckie i zgodne z klimatem.
- Etapy:
  1. lekkie zabrudzenie,
  2. rysy,
  3. pęknięcia,
  4. czarne wżery.
- Ryzyko: mniej precyzyjne dla gracza.

### Wariant C — hybryda

- Subtelny pasek boczny jako czytelność.
- Warstwy degradacji jako klimat.
- Debug może pokazywać procenty.
- Finalny UI może pokazywać tylko symboliczny stan.

Rekomendacja robocza: **Wariant C jest najlepszy do dalszych testów, ale wymaga osobnego visual passu.**

## 8. Napięcie i blizny — visual

- Napięcie powinno być sygnałem dynamicznym.
- Blizna powinna być śladem statycznym slotu.
- Napięcie może pulsować, drżeć albo ciemnieć.
- Blizna powinna zostać na slocie jako znak pamięci.
- Utrwalona blizna po eonie powinna wyglądać inaczej niż świeża blizna.
- Nie należy mylić pęknięcia karty z blizną slotu.

Praktyczna granica visual: pęknięcie karty dotyczy obiektu R; blizna slotu dotyczy gniazda/naczynia, w którym karta była osadzona.

## 9. Aktywność i sen elementów

- Gdy karta R jest aktywna, elementy pomocnicze mogą działać.
- Gdy karta R znika, elementy pomocnicze pozostają widoczne, ale śpią.
- Stan śpiący może być pokazany przez przyciemnienie, matową warstwę, wygaszenie obwódki albo brak pulsu.
- Nie należy usuwać wizualnie kart specjalnych/artefaktów tylko dlatego, że karta R wypadła.

Sen elementów jest istotny dla pamięci i czytelności: gracz powinien widzieć, że slot ma historię i osadzone rzeczy, nawet jeśli chwilowo nie ma aktywnego rdzenia.

## 10. Różnice ŚWIAT / PRG

- ŚWIAT może mocniej eksponować artefakt.
- PRG może mocniej eksponować kartę specjalną, wiedzę albo umiejętność.
- Stabilizator jest wspólny.
- Karta R pozostaje rdzeniem w obu gałęziach.
- Artefakty PRG są poza zakresem domyślnym, chyba że późniejsza decyzja rozszerzy ich rolę.

Różnice gałęzi nie powinny prowadzić do dwóch niespójnych języków UI. Układ może mieć warianty, ale hierarchia: karta R → stabilizacja → wiedza/artefakt musi pozostać czytelna.

## 11. R4 i globalny slot

- Slot R4 może mieć specjalną odmianę czteroelementowej struktury.
- Karta specjalna R4 może wpływać na całe drzewo.
- Artefakt R4, jeśli kiedyś powstanie, powinien być traktowany jako jakość globalna, nie lokalna.
- R4 wymaga osobnego visual passu.

Na tym etapie nie należy kopiować lokalnego layoutu slotu na R4 bez sprawdzenia skali, hierarchii i globalnego znaczenia.

## 12. Zgodność ze stylem Haiku Cosmos

- UI nie może wyglądać jak surowe inventory.
- Slot ma wyglądać jak gniazdo, naczynie albo miejsce osadzenia.
- Visual powinien być zgodny z rytualnym minimalizmem kosmicznym.
- Unikać agresywnego neonu.
- Unikać ciężkiego fantasy border.
- Czytelność ma wygrać z dekoracją.
- Ornament ma wspierać decyzję gracza, nie dominować.

Dopuszczalne są subtelne warstwy materiału, oddech linii, ślady pyłu, ciemne naczynia i spokojne akcenty kolorystyczne. Niedopuszczalny kierunek to panel inventory z czterema równorzędnymi ikonami bez semantycznej hierarchii.

## 13. Decyzje do zamknięcia przed layout pass

Przed layout pass trzeba rozstrzygnąć:

- czy slot 4-elementowy ma być układany pionowo, radialnie, narożnikowo czy warstwowo,
- czy stabilizator jest przy karcie R czy jako osobny mikro-slot,
- czy karta specjalna i artefakt są stale widoczne czy w trybie rozwijanym,
- czy trwałość pokazuje pasek, warstwa degradacji czy hybryda,
- jak pokazać napięcie,
- jak pokazać świeżą bliznę,
- jak pokazać utrwaloną bliznę,
- jak pokazać stan śpiący,
- jak pokazać naprawę DS,
- czy PRG i ŚWIAT mają ten sam layout slotu, czy warianty.

## 14. Kolejność przyszłych passów

Rekomendowana kolejność przyszłych prac:

1. **Decision pass** — wybór wariantu visual trwałości.
2. **Wireframe pass** — bez assetów, tylko rozmieszczenie elementów slotu.
3. **Placeholder pass** — aktualizacja placeholderów / tokens.
4. **Visual asset pass** — degradacja, blizny, stabilizatory, DS.
5. **Runtime state pass** — podpięcie stanów.
6. **Debug evidence pass** — udokumentowanie stanów, screenów i wyników walidacji.

Każdy pass powinien mieć osobny zakres i nie powinien mieszać decyzji layoutowych z implementacją mechaniki.

## 15. Dokumenty powiązane

- `SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`
- `CARD_SLOT_NETWORK_SYSTEM.md`
- `CARD_SLOT_NETWORK_MIGRATION_CHECKLIST.md`
- `SUB_META_V2_MASTER_SPEC.md`
- `UI_WORLD.md`
- `SUB_META_SYSTEM.md`
- `PRG_SYSTEM.md`
- `VISUAL_EXECUTION_GUIDE.md`
- `MODULAR_FRAME_KIT.md`
- `SVG_ASSET_STANDARDS.md`
