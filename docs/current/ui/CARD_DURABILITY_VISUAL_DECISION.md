# Card durability visual decision — karta R

> Status: ROBOCZY / DOKUMENT DECYZYJNY UI-VISUAL / PRZED WIREFRAME / PRZED RUNTIME
> Obszar: UI / SUB-META / trwałość karty R / visual states
> Źródło prawdy: NIE dla mechaniki, NIE dla runtime, NIE dla finalnego wyglądu; TAK roboczo dla porównania wariantów przed wireframe/layout pass
> Powiązane dokumenty: `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`, `../systems/SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`, `../systems/CARD_SLOT_NETWORK_SYSTEM.md`, `SUB_META_V2_MASTER_SPEC.md`, `UI_WORLD.md`, `../visual/VISUAL_EXECUTION_GUIDE.md`, `../visual/MODULAR_FRAME_KIT.md`, `../visual/SVG_ASSET_STANDARDS.md`

## 1. Cel dokumentu

Ten dokument porządkuje decyzję, jak pokazywać trwałość i degradację karty R w czteroelementowym slocie SUB-META.

Celem jest porównanie trzech wariantów visual trwałości karty R przed przyszłym wireframe/layout pass:

- **Wariant A — pasek boczny**,
- **Wariant B — warstwy degradacji**,
- **Wariant C — hybryda paska i warstw degradacji**.

Dokument przygotowuje rekomendację projektową do zatwierdzenia przez projektanta. Nie zamyka finalnego wyglądu, nie przesądza runtime i nie zmienia mechaniki trwałości.

## 2. Granice

Ten dokument:

- nie implementuje runtime,
- nie tworzy assetów,
- nie zmienia layout tokens,
- nie rozstrzyga finalnego wyglądu,
- nie zastępuje `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`,
- nie definiuje balansu trwałości.

Dokument jest decyzją roboczą UI-visual przed wireframe. Nie należy na jego podstawie zmieniać JS, CSS, JSON, settings, placeholderów ani assetów bez osobnego zadania implementacyjnego.

## 3. Wymagania czytelności

Visual trwałości karty R musi pokazać:

- czy karta R jest świeża,
- czy karta R się zużywa,
- czy karta R zbliża się do progu usunięcia/zniszczenia,
- czy karta R jest pod napięciem,
- czy karta R już pękła,
- różnicę między uszkodzeniem karty a blizną slotu,
- stan czytelny w małej skali SUB-META.

Czytelność ma pierwszeństwo przed ornamentem. Karta R pozostaje rdzeniem slotu, więc informacja o jej stanie nie może zostać przykryta przez stabilizator, kartę specjalną, artefakt, napięcie ani bliznę slotu.

## 4. Wariant A — pasek boczny

Opis:

- pasek przy krawędzi karty R schodzi w dół wraz ze zużyciem,
- może mieć kolor karty albo neutralny kolor statusu,
- może być bardzo subtelny i cienki,
- można go łatwo debugować.

### Zalety

- najwyższa czytelność,
- łatwy do implementacji,
- łatwy do skalowania,
- dobry dla debug/evidence,
- nie wymaga wielu assetów.

### Wady

- ryzyko technicznego / aplikacyjnego wyglądu,
- może zaburzać rytualny klimat karty,
- pokazuje procent, ale słabiej pokazuje „ranę”.

### Ryzyka visual

- pasek może wyglądać jak healthbar,
- trzeba uniknąć arcade/HUD feelingu.

Wariant A jest najbezpieczniejszy dla odczytu i przyszłego debugowania, ale wymaga stylizacji zgodnej z rytualnym minimalizmem kosmicznym: cienka linia, niski kontrast w normalnym UI, brak agresywnej animacji i brak skojarzenia z klasycznym paskiem zdrowia.

## 5. Wariant B — warstwy degradacji

Opis:

- karta R otrzymuje kolejne warstwy wizualnego zużycia,
- warstwy mogą być SVG albo PNG z przezroczystością,
- etapy:
  1. lekkie zabrudzenie,
  2. rysy,
  3. pęknięcia,
  4. czarne wżery / głębokie uszkodzenia.

### Zalety

- najbardziej eleganckie i zgodne z klimatem,
- dobrze pokazuje kartę jako obiekt rytualny,
- może wspierać poczucie ciężaru decyzji,
- dobrze rozdziela trwałość od zwykłego UI.

### Wady

- mniej precyzyjne,
- trudniejsze do debugowania,
- wymaga assetów albo warstw proceduralnych,
- może być słabo czytelne przy małej skali.

### Ryzyka visual

- zbyt ciemne warstwy mogą zakryć kolor i tier,
- degradacja może mylić się z blizną slotu,
- potrzebny osobny standard assetów.

Wariant B najlepiej wspiera odczucie karty jako obiektu, który się zużywa, ale samodzielnie może nie wystarczyć do szybkiego odczytu poziomu trwałości w małym slocie SUB-META.

## 6. Wariant C — hybryda

Opis:

- bardzo subtelny pasek boczny daje szybki odczyt poziomu trwałości,
- warstwy degradacji pokazują stan jakościowy,
- pasek może być bardziej widoczny w debug, a delikatniejszy w normalnym UI,
- degradacja może pojawiać się progowo, a pasek działać płynnie.

### Zalety

- łączy czytelność z klimatem,
- pozwala debugować wartości,
- pozwala graczowi czuć zużycie jako proces,
- można wdrażać etapami: najpierw pasek, potem warstwy.

### Wady

- więcej elementów do utrzymania,
- ryzyko przeładowania slotu,
- wymaga dobrego rozdziału visual priority.

### Ryzyka visual

- hybryda może być zbyt bogata w pełnym slocie 4-elementowym,
- trzeba ograniczyć intensywność, żeby nie konkurowała ze stabilizatorem, DS, artefaktem i blizną.

Wariant C najlepiej odpowiada na potrzebę jednoczesnej czytelności i klimatu, pod warunkiem że pasek pozostanie bardzo dyskretny w normalnym UI, a degradacja nie zakryje semantyki karty.

## 7. Rekomendacja robocza

**Wariant C jest rekomendowany jako kierunek docelowy**, ale etap wdrożenia powinien być rozdzielony:

### Etap 1

- cienki pasek boczny jako czytelny, debugowalny wskaźnik trwałości.

### Etap 2

- proste progi degradacji bez finalnych assetów, np. klasy/stany.

### Etap 3

- docelowe warstwy degradacji SVG/PNG zgodne ze stylem.

### Etap 4

- oddzielenie degradacji karty od blizn slotu i napięcia.

Ta rekomendacja jest **DO ZATWIERDZENIA PRZEZ PROJEKTANTA** i nie jest jeszcze kanonem. Wariant C jest kierunkiem do dalszych testów, nie finalną decyzją produkcyjną.

## 8. Proponowane progi visual

Robocze progi visual, nie finalny balans:

- **100–80%**: karta czysta / stabilna,
- **79–60%**: lekkie zabrudzenie,
- **59–40%**: rysy,
- **39–30%**: pęknięcia, karta zbliża się do progu usunięcia,
- **poniżej 30%**: ciężkie uszkodzenie / wżery / można usunąć lub zniszczyć,
- **0%**: pęknięcie / karta znika lub przechodzi w stan pęknięcia zgodnie z mechaniką.

Progi muszą być zsynchronizowane z `CARD_SLOT_NETWORK_SYSTEM.md` i przyszłym debug/balansem. Nie należy traktować ich jako finalnych wartości systemowych.

## 9. Rozdzielenie pojęć visual

Ważne rozróżnienie:

- **trwałość karty R** = stan karty,
- **napięcie** = dynamiczny nacisk sieci,
- **pęknięcie karty** = moment zniszczenia karty,
- **blizna slotu** = trwały ślad na slocie po pęknięciu,
- **utrwalona blizna eonu** = pamięć slotu przeniesiona dalej.

Nie wolno mieszać visual degradacji karty z visual blizny slotu. Degradacja należy do obiektu karty R, a blizna należy do gniazda/slotu. Napięcie jest stanem dynamicznym i nie powinno wyglądać jak stałe uszkodzenie materiału.

## 10. Minimalny kontrakt dla przyszłego wireframe

Przyszły wireframe musi pokazać:

- miejsce paska bocznego,
- obszar nakładki degradacji,
- relację do ramki karty,
- relację do stabilizatora,
- relację do blizny slotu,
- stan debug z procentem,
- stan normalny bez liczby procentowej.

Wireframe powinien sprawdzić wariant w małej skali SUB-META oraz w pełnym slocie 4-elementowym, gdzie karta R konkuruje o uwagę ze stabilizatorem, kartą specjalną, artefaktem, napięciem i ewentualną blizną slotu.

## 11. Konsekwencje dla assetów

- pasek boczny może być runtime shape, nie asset,
- warstwy degradacji mogą być SVG/PNG overlay,
- warstwy muszą mieć przezroczystość,
- nie powinny zawierać baked heavy glow,
- muszą nie zakrywać całkowicie koloru i tieru,
- powinny być zgodne z `SVG_ASSET_STANDARDS.md` i visual direction.

Warstwy degradacji powinny działać jako state/accent overlay, a nie jako nowa pełna karta. Jeśli powstaną SVG, powinny zachować transparent background, czytelny `viewBox`, logiczne warstwy i brak ciężkich wypalonych filtrów. Jeśli powstaną PNG/WebP, powinny być traktowane jako rasterowe overlaye z jasnym statusem i transparentnością.

## 12. Decyzje do zatwierdzenia

- [ ] Czy zatwierdzamy wariant C jako kierunek docelowy?
- [ ] Czy etap 1 runtime może użyć samego paska bocznego?
- [ ] Czy degradacja ma być progowa czy płynna?
- [ ] Czy procent trwałości ma być widoczny tylko w debug?
- [ ] Czy warstwy degradacji mają być SVG, PNG czy obie opcje do testów?
- [ ] Czy pęknięcie karty ma mieć osobny stan visual?
- [ ] Jak odróżniamy bliznę slotu od degradacji karty?

## 13. Dokumenty powiązane

- `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`,
- `SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`,
- `CARD_SLOT_NETWORK_SYSTEM.md`,
- `SUB_META_V2_MASTER_SPEC.md`,
- `UI_WORLD.md`,
- `VISUAL_EXECUTION_GUIDE.md`,
- `MODULAR_FRAME_KIT.md`,
- `SVG_ASSET_STANDARDS.md`.

## Nota synchronizacyjna — wireframe wariantu C

- Wariant C został zatwierdzony roboczo jako kierunek przed layout-token pass.
- Minimalny wireframe wariantu C oraz zatwierdzone decyzje robocze są rozwinięte w `CARD_DURABILITY_WIREFRAME_PASS.md`.
- Ten dokument decyzyjny pozostaje źródłem porównania wariantów A/B/C.
- Finalne assety i runtime pozostają poza zakresem tej decyzji.
- Wireframe pass nie oznacza jeszcze finalnego layoutu ani layout tokens.
