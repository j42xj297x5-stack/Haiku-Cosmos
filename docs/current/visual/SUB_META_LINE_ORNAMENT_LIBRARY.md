# Haiku Cosmos — SUB-META / HUD Line & Ornament Library

> Status: KIERUNEK / BIBLIOTEKA WYKONAWCZA
> Obszar: SUB-META, HUD, linie, ornamenty, ramki, sloty, placeholdery, glify, SVG
> Źródło prawdy: TAK, dla kierunku projektowania linii/ornamentów/ramek/placeholderów SUB-META i HUD. NIE, dla mechaniki i finalnych assetów.
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: ART_DIRECTION.md, KOSMOLOGIA_WIZUALNA.md, BIBLIOTEKA_MATERIALOW.md, FIGMA_WORKFLOW.md, SUB_META_ASSET_PIPELINE.md, SUB_META_COMPONENTS.md, SUB_META_FIGMA_PROMPT_TEMPLATE.md, ../ui/UI_WORLD.md, ../systems/SUB_META_SYSTEM.md, ../systems/PRG_SYSTEM.md

## 1. Cel dokumentu

Ten dokument definiuje kierunek biblioteki linii, ornamentów, ramek, slotów, placeholderów i glifów dla pierwszego realnego passu wizualnego SUB-META + HUD.

Biblioteka ma przygotować język, w którym SUB-META wygląda jak kosmiczny instrument konfiguracji: spokojny, czytelny, geometryczny i rytualny.

## 2. Zakres

Dokument obejmuje:

- SUB-META,
- podstawowy HUD,
- SVG,
- ramki,
- linie,
- ornamenty,
- glify,
- sloty,
- placeholdery.

## 3. Czego dokument nie robi

Ten dokument:

- nie tworzy finalnych assetów,
- nie opisuje rastrów jako głównego pipeline,
- nie zmienia runtime,
- nie definiuje mechaniki,
- nie zastępuje `SUB_META_SYSTEM.md`, `UI_WORLD.md` ani `PRG_SYSTEM.md`.

## 4. Filary inspiracji

### Astrolabium

Inspiracje:

- mater / rama główna,
- tympanum / siatka projekcyjna,
- rete / ażurowa siatka nieba,
- podziałki,
- wskaźniki gwiazd,
- stereograficzna projekcja,
- okręgi wysokości i azymutów.

Użycie w Haiku Cosmos:

- główne ramy paneli,
- okrągłe diagramy,
- sloty koncentryczne,
- wskaźniki aktywnego stanu,
- ramy SUB-META,
- subtelne skale i ticki HUD.

### Sfera armilarna

Inspiracje:

- przecinające się pierścienie,
- ekliptyka,
- równik,
- meridiany,
- półokręgi,
- instrument kosmiczny.

Użycie:

- wektorowe tła SUB-META,
- ramy dużych paneli,
- dekoracyjne kręgi w rogach,
- HUD jako instrument, nie belka.

### Geometria islamska / kompas i liniał

Inspiracje:

- rozety 8/10/12,
- gwiazdy,
- narożniki,
- pasy graniczne,
- modułowe powtórzenia,
- girih / kratownice,
- symetria i konstrukcja przez podział okręgu.

Użycie:

- narożniki paneli,
- border tiles,
- subtelne ornamenty ramek,
- separatory,
- placeholdery slotów,
- warianty `locked`, `available`, `selected`.

Ornament ma być cienki, spokojny i systemowy. Nie ma tworzyć tapety ani bogatego dywanu.

### Bagua / osiem trygramów

Inspiracje:

- linia pełna / linia przerwana,
- osiem kierunków,
- podział koła,
- opozycja i dopełnianie.

Użycie:

- inspiracja dla glifów,
- inspiracja dla markerów stanu,
- inspiracja dla wariantów slotów.

Nie kopiować dosłownych symboli religijno-ezoterycznych jako głównego UI bez osobnej decyzji projektanta.

### Chińskie 28 mansions

Inspiracje:

- segmentacja cyklu,
- małe ticki,
- punkty na pierścieniu,
- marker nocnego nieba.

Użycie:

- subtelne podziałki na ramkach,
- pierścienie HUD,
- znaczniki kolekcji,
- ornamentalne podziały tła wektorowego.

### Zachodnie koła zodiakalne i średniowieczne diagramy kosmograficzne

Inspiracje:

- koncentryczne pierścienie,
- centrum i orbity,
- cykliczny czas,
- znaki jako delikatne markery.

Użycie:

- kompozycja SUB-META,
- skale,
- rytm paneli,
- diagramy stanu.

## 5. Zasada transformacji

Historyczne wzory są inspiracją, nie kopią.

Haiku Cosmos tworzy własny alfabet inspirowany:

- antyczną matematyką,
- geometrią sakralną,
- instrumentami astronomicznymi,
- astrologią wschodu i zachodu,
- rytualną ciszą,
- czytelnością UI.

Każdy element musi przejść transformację do własnego języka gry. Forma ma wyglądać jak część systemu Haiku Cosmos, a nie jak cytat z atlasu historycznego.

## 6. Rodziny komponentów liniowych

Pierwsza biblioteka powinna operować następującymi rodzinami:

- `frame.main` — główna rama obszaru SUB-META.
- `frame.panel` — ramy paneli bocznych, opisów i sekcji.
- `frame.card` — ramy kart R1/DS używane w SUB-META.
- `frame.slot` — ramy gniazd i pól osadzenia.
- `line.divider` — separatory sekcji.
- `line.connector` — połączenia i mosty między slotami/osiami.
- `line.scale_tick` — ticki skali, małe znaczniki pierścieni i liczników.
- `ornament.corner` — narożniki paneli i kart.
- `ornament.border` — cienkie pasy graniczne i powtórzenia.
- `ornament.rosette` — subtelne rozety 8/10/12.
- `ornament.orbit` — kręgi, łuki i orbity relacyjne.
- `glyph.axis` — znaki osi systemowych.
- `glyph.state` — znaki stanów UI.
- `glyph.card_r1` — glify kart bazowych R1.
- `glyph.card_ds` — glify kart DS.
- `placeholder.panel` — placeholder panelu.
- `placeholder.card` — placeholder karty.
- `placeholder.slot` — placeholder slotu.
- `hud.meter_frame` — ramy metrów HUD.
- `hud.counter_frame` — ramy liczników HUD.

## 7. Zasady dla astrolabium

- Używać okręgów, łuków, podziałek, osi i punktów.
- Traktować podziałkę jako informację o stanie, nie czystą dekorację.
- Używać pierścieni koncentrycznych dla paneli, slotów i metrów.
- Unikać dosłownego kopiowania historycznych rete.
- Nie robić z UI muzealnego eksponatu.
- Zachować czytelność, ciszę i mały ciężar wizualny.

## 8. Zasady dla sfery armilarnej

- Pierścienie są subtelnym układem relacji.
- Przecięcia pierścieni mogą oznaczać punkty aktywacji.
- Kręgi są logiką, nie dekoracją.
- Półokręgi mogą porządkować przejścia między panelami.
- Nie budować ciężkiej, realistycznej maszyny 3D w UI.

## 9. Zasady dla geometrii islamskiej

- Używać modułów 8/10/12 jako punktów startowych.
- Budować narożniki, pasy graniczne i małe rozety przez konstrukcję geometryczną.
- Ornament ma być cienki, spokojny i systemowy.
- Używać powtórzeń oszczędnie, głównie jako rytmu i ramy.
- Nie przeładowywać powierzchni.
- Nie robić tapety, dywanu ani mandali pełnoekranowej.

## 10. Zasady dla wschodniej astrologii/kosmologii

- Linia ciągła i przerwana może inspirować stany, blokady, dostępność i warianty slotu.
- Osiem kierunków może inspirować rozmieszczenie glifów i markerów.
- Podział 28 może inspirować subtelne ticki na pierścieniach.
- Wschodnia inspiracja ma działać strukturalnie: przez rytm, opozycję, kierunek i cykl.
- Nie kopiować dosłownych symboli sakralnych jako dekoracji bez decyzji projektanta.

## 11. Zasady dla zachodnich diagramów

- Używać koncentrycznych pierścieni jako zasady kompozycyjnej.
- Używać orbit i osi dla relacji między elementami.
- Zodiakalny podział koła może inspirować rytm i segmentację.
- Nie używać dosłownych znaków zodiaku w podstawowym HUD/SUB-META.
- Średniowieczny diagram ma inspirować porządek, nie styl ilustracji.

## 12. Zasady grubości linii

Grubości linii są kierunkiem optycznym, nie finalną prawdą pikselową.

Rodziny:

- cienka linia bazowa — standard dla ramek, podziałek i ornamentu,
- linia aktywna — lekko mocniejsza lub jaśniejsza, ale nadal spokojna,
- linia `selected` — wyraźniejszy kontur plus subtelne światło,
- linia `locked` — przygaszona, przerywana lub zredukowana,
- linia `disabled` — niska energia, niski kontrast, brak poświaty,
- linia specjalna / DS — czystsza, bardziej eteryczna, bliżej bieli/srebra.

Orientacyjne zakresy robocze:

- mały ekran: linia nie może zejść poniżej czytelności optycznej,
- desktop: cienka linia jest standardem,
- 4K: skalowanie optyczne, nie tylko matematyczne; cienka linia może wymagać korekty, aby nie zniknęła.

SVG powinny być projektowane tak, aby można było kontrolować stroke i skalowanie bez utraty ostrości.

## 13. Zasady stanów

Podstawowe stany:

- `default` — cicha obecność, niski kontrast, brak dominacji.
- `hover` — delikatne rozjaśnienie lub aktywny tick.
- `selected` — czytelna rama, podświetlenie osi, spokojny akcent.
- `active` — wyraźny stan działania, możliwy impuls lub żywsza linia.
- `disabled` — niski kontrast i brak sygnału działania.
- `locked` — blokada przez strukturę: przerwa, zamknięcie, zimny kontur.
- `available` — subtelne zaproszenie, nie agresywny call to action.
- `insufficient RP` — czytelna odmowa przez przygaszenie/koszt, bez alarmu.
- `special / DS` — biel, eter, kryształ, znak plus i jakość przejścia.

## 14. Czego unikać

Nie robić:

- agresywnego neonu,
- zbyt gęstego ornamentu,
- kopiowania gotowych symboli bez przetworzenia,
- fantasy deckbuildera,
- tarotowego layoutu,
- plastikowego sci-fi,
- muzealnego realizmu,
- bitmapowych cienkich linii,
- pełnej mandali jako podstawy UI,
- dekoracji, która konkuruje z funkcją slotów i kosztów.

## 15. Pierwszy zestaw do Figmy

Pierwszy pass Figma ma później przygotować dokładnie:

- 3 warianty ram paneli SUB-META,
- 3 warianty ramek kart R1,
- 3 warianty ramek DS,
- 4 warianty slotów,
- 4 typy linii separatorów,
- 4 typy linii połączeń,
- 8 glifów osi/stanów inspirowanych geometrią,
- 4 narożniki ornamentowe,
- 2 rozety subtelne,
- 2 pierścienie astrolabiczne,
- 2 ramki HUD liczników,
- 2 ramki HUD RP/metrów.

Ten zestaw nie jest pełnym ekranem SUB-META. To biblioteka komponentów SVG i mała kompozycja demonstracyjna.

## 16. Relacja do asset folders

Po eksporcie z Figmy pliki trafiają do:

- `assets/visual/submeta/svg/frames/`
- `assets/visual/submeta/svg/lines/`
- `assets/visual/submeta/svg/ornaments/`
- `assets/visual/submeta/svg/glyphs/`
- `assets/visual/submeta/svg/slots/`
- `assets/visual/submeta/svg/placeholders/`
- `assets/visual/hud/svg/frames/`
- `assets/visual/hud/svg/glyphs/`
- `assets/visual/hud/svg/meters/`
- `assets/visual/shared/svg/frames/`
- `assets/visual/shared/svg/lines/`
- `assets/visual/shared/svg/ornaments/`
- `assets/visual/shared/svg/glyphs/`

Element trafia do `shared/` tylko wtedy, gdy jest neutralny i ma być używany przez więcej niż jedną warstwę.
