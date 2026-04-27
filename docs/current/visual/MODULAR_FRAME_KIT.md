# Haiku Cosmos — Modular Frame Kit / Język Ramek UI v0.1

> Status: PROJEKTOWY / DO ZATWIERDZENIA
> Obszar: visual / HUD / SUB-META / META / karty
> Źródło prawdy: jeszcze NIE, kandydat do dokumentu kanonicznego visual
> Zakres: ramki, ornamenty liniowe, narożniki, gniazda, panele, skalowanie SVG
> Nie obejmuje: mechaniki, kosztów RP, logiki sekwencji, balansu

## 1. Cel

Celem systemu ramek jest stworzenie **cienkiego, czytelnego, skalowalnego języka obramowań** dla Haiku Cosmos.

Ramki mają wspierać:

* czytelność UI,
* poczucie rytuału,
* subtelną geometrię kosmiczną,
* rozpoznawalność warstw gry,
* spójność HUD / SUB-META / META / kart.

Nie mają być ciężkimi dekoracyjnymi obrazkami. To ma być **system składanych elementów**, zgodny z kierunkiem „rytualnego minimalizmu kosmicznego”, gdzie UI pozostaje częścią świata, a nie osobnym menu narzędziowym. Ten kierunek jest już zgodny z aktualnym ART_DIRECTION: cienkie linie, łuki, kręgi, osie, rezonans i cisza wizualna są tam opisane jako preferowany język formy. 

---

## 2. Główna decyzja projektowa

Pełne monolityczne ramki SVG jako jeden overlay są **niepreferowane**.

Docelowo każda rama powinna być składana z modułów:

1. **4 narożniki**

   * top-left
   * top-right
   * bottom-left
   * bottom-right

2. **4 krawędzie**

   * top
   * bottom
   * left
   * right

3. **opcjonalne ornamenty środka krawędzi**

   * top-center ornament
   * bottom-center ornament
   * left-center ornament
   * right-center ornament

4. **opcjonalne elementy pomocnicze**

   * separator
   * badge
   * anchor dot
   * inner corner mark
   * sequence marker
   * slot marker

Czyli praktycznie: **modular frame kit**, a nie „jeden obrazek ramki”.

---

## 3. Dlaczego nie monolityczna rama

Monolityczna rama źle działa w Haiku Cosmos, bo:

* skaluje wszystko naraz,
* pogrubia linie,
* deformuje ornament,
* nie pozwala osobno kontrolować narożników i krawędzi,
* utrudnia responsywność paneli,
* źle reaguje na różne proporcje okien,
* wymusza kompromis między cienką linią a dekoracją.

W Haiku Cosmos UI ma być minimalistyczne, semantyczne i niezasłaniające świata; RUN HUD jest opisany jako warstwa minimalistyczna, a SUB-META i META mają pozostawać częścią świata gry.  Dlatego ramka nie może być ciężkim „obrazkiem nałożonym na panel”. Musi być cienką, reagującą strukturą.

---

# 4. Architektura ramki

## 4.1. Model podstawowy

Każda rama składa się z:

```text
corner_tl          edge_top_left        ornament_top_center        edge_top_right          corner_tr

edge_left_top                                                                           edge_right_top

ornament_left_center                                                               ornament_right_center

edge_left_bottom                                                                        edge_right_bottom

corner_bl          edge_bottom_left     ornament_bottom_center     edge_bottom_right       corner_br
```

W praktyce runtime może to uprościć do:

* narożniki: fixed size,
* krawędzie: stretch tylko w jednej osi,
* ornamenty: anchorowane do środka krawędzi,
* efekty: osobna warstwa nad bazą.

---

## 4.2. Narożniki

Narożniki mogą być najbardziej ozdobne.

Ich rola:

* definiują styl ramki,
* niosą główną tożsamość ornamentu,
* stabilizują kompozycję,
* mogą mieć małe glify,
* mogą wskazywać stan panelu.

Zasada:

* narożnik może mieć ornament,
* ale nie może wyglądać jak ciężki metalowy klocek,
* nie może dominować nad treścią panelu.

---

## 4.3. Krawędzie

Krawędzie mają być bardzo cienkie.

Ich rola:

* wyznaczają granicę,
* utrzymują panel w przestrzeni,
* nie konkurują z tekstem ani kartami,
* mogą zawierać drobne skale, tick marks, mikro-podziały.

Zasada krytyczna:

**krawędź nie może się pogrubiać przy skalowaniu.**

Preferowane:

* 1–2 px stroke w renderze bazowym,
* podwójna cienka linia,
* delikatna linia wewnętrzna,
* punktowe mikroznaczniki,
* brak masywnego wypełnienia.

---

## 4.4. Ornament środka

Ornament środka krawędzi powinien być **osobnym elementem**, a nie częścią jednej długiej krawędzi.

Dlaczego:

* można go łatwo ukryć,
* można go animować,
* można go wymienić zależnie od panelu,
* nie deformuje linii,
* nie wymusza grubej krawędzi.

Przykłady ornamentów:

* małe astrolabium,
* oko / słońce / księżyc,
* znak osi,
* znak slotu,
* mały pierścień rezonansu,
* skala stopniowa,
* glif sekwencji,
* znak piątego stanu.

---

# 5. Trzy rodziny stylistyczne ramek

Twoje trzy inspiracje warto potraktować jako **rodziny ram**, nie jako jedną wymieszaną zupę. Każda ma inne miejsce w grze.

---

## 5.1. Rodzina A — Ramki Alchemiczno-Astrologiczne

### Charakter

Najbliższe głównemu językowi Haiku Cosmos.

Inspiracja:

* astrolabia,
* mapy nieba,
* sfery,
* skale stopniowe,
* łacińskie / pseudo-łacińskie inskrypcje,
* zodiakalna geometria,
* kręgi i osie.

Uwaga: nie kopiujemy dosłownie historycznych tablic. Bierzemy **logikę sfer, podziałów i precyzyjnej linii**.

### Cechy

* podwójne lub potrójne cienkie linie,
* bardzo delikatne znaczniki stopni,
* subtelne punkty na osi,
* małe glify kierunków,
* elegancka asymetria tylko w detalach,
* mikroornament na środku górnej lub dolnej krawędzi.

### Zastosowanie

Najlepsze dla:

* głównych paneli SUB-META,
* ramek opisu karty,
* paneli mapy relacji,
* głównych okien META,
* ramek o statusie „systemowym”.

### Feeling

Ciche, precyzyjne, rytualne, „kosmos jako mapa”.

To powinien być **domyślny język ramek Haiku Cosmos**.

---

## 5.2. Rodzina B — Geometria Sakralna / Eldritch

### Charakter

Bardziej mroczna, gęstsza, symboliczna.

Inspiracja:

* kręgi rytualne,
* heksagony,
* pentagonalne / wielokątne relacje,
* oko,
* słońce,
* księżyc,
* ciemna geometria,
* „tablica mistrzowska” / gotycki UI,
* eldritch bez przesadnego horroru.

### Cechy

* więcej przenikających się okręgów,
* linie mogą tworzyć układy zależności,
* narożniki mogą mieć oko / półksiężyc / gwiazdę,
* ornament może sugerować obserwację albo otwarcie bramy,
* delikatne złamanie symetrii dopuszczalne przy elementach specjalnych.

### Zastosowanie

Najlepsze dla:

* gniazd rezonansu,
* slotów artefaktów,
* slotów R2,
* PRG,
* wiązań,
* aktywnych konfiguracji,
* kart specjalnych,
* eventów.

SUB-META jest według dokumentacji warstwą konfiguracji świadomości gracza, relacji i osadzania kart, więc rodzina B pasuje szczególnie do gniazd i wiązań, ale niekoniecznie do wszystkich paneli naraz. 

### Feeling

Mroczniejsze, głębsze, bardziej „otwieram coś, czego nie powinienem rozumieć do końca”.

Ale uwaga: to nadal Haiku Cosmos, nie gotycki lootbox.

---

## 5.3. Rodzina C — Steampunkowo-Mechaniczna / Złoty Detal

### Charakter

Najbardziej materialna i techniczna z trzech rodzin.

Inspiracja:

* mosiądz,
* ciemny metal,
* nity,
* mikromechanizmy,
* pierścienie zegarowe,
* cienkie druty energii,
* mechanika astronomiczna.

### Cechy

* złoty detal,
* drobne śruby / nity tylko jako mikroakcent,
* segmenty jak w instrumencie pomiarowym,
* cienkie przerwane linie,
* małe koła zębate tylko w narożnikach,
* mosiężny ornament jako punkt, nie masa.

### Zastosowanie

Najlepsze dla:

* Kuźni,
* paneli craftingu,
* paneli kosztów,
* upgrade tierów,
* elementów „warsztatowych”,
* opisów przedmiotów,
* może części META związanej z przemianą materiału.

Nie używałbym tej rodziny jako głównej dla całego UI, bo może za bardzo skręcić w „mechaniczne fantasy”. Ale dla Kuźni — złoto, mosiądz, mechanika, rytuał przemiany — to może być sztos.

### Feeling

Instrument, kuźnia, mechanizm, pomiar, materialna alchemia.

---

# 6. Hierarchia rodzin w grze

Proponowana hierarchia:

| Warstwa                  | Rodzina główna | Rodzina pomocnicza       | Uwagi                                  |
| ------------------------ | -------------- | ------------------------ | -------------------------------------- |
| RUN HUD                  | A minimalna    | B lekka                  | ekstremalnie cienko, bez przeładowania |
| SUB-META panel główny    | A              | B                        | mapa rezonansu, osie, gniazda          |
| SUB-META sloty / gniazda | B              | A                        | sloty mogą być bardziej sakralne       |
| PRG                      | B              | A                        | pole intencji, geometryczne i żywe     |
| Kuźnia                   | C              | A                        | mosiądz + rytualna precyzja            |
| Karty R1                 | A prosta       | brak / minimal B         | czytelność ponad ornament              |
| Karty DS                 | A + piąty stan | B                        | biel, eter, krystaliczność             |
| Eventówki                | B              | A / C zależnie od eventu | zaburzenie porządku                    |
| META / EON               | A monumentalna | B + piąty stan           | ceremonialne centrum                   |

To trzyma porządek i nie robi z UI „Pinterestowego patchworku”.

---

# 7. Zasady cienkiej linii

## 7.1. Grubość

Bazowo:

* linia główna: cienka,
* linia pomocnicza: jeszcze cieńsza,
* glow: oddzielna warstwa, nie pogrubienie stroke,
* ornament: detal, nie blok.

Nie wolno udawać światła przez pogrubianie linii. Światło ma być poświatą, nie masą.

---

## 7.2. Skala

Przy skalowaniu panelu:

* narożniki zachowują rozmiar,
* krawędzie wydłużają się tylko w jednej osi,
* stroke pozostaje optycznie ten sam,
* ornament środka pozostaje centralny,
* tick marks mogą się powtarzać albo być rozstawiane proceduralnie.

---

## 7.3. Kontrast

Na ciemnym tle:

* baza ramy: przygaszone złoto / perła / zimny grafit,
* aktywny stan: kolor osi,
* specjalny stan: biały / perła / eter,
* hover: delikatne rozjaśnienie,
* disabled: bardzo przygaszona linia.

Haiku Cosmos ma już opisaną zasadę, że kolor nie powinien zalewać ekranu; najlepsze użycia to akcent, cienka linia, segment, aura i oznaczenie aktywności. 

---

# 8. Zasady ornamentu

## 8.1. Ornament nie jest dekoracją dla dekoracji

Ornament musi mieć funkcję:

* wskazuje typ panelu,
* wskazuje status,
* wskazuje aktywną oś,
* wskazuje warstwę gry,
* wzmacnia rytuał,
* stabilizuje kompozycję.

Jeśli ornament nie niesie sensu, trzeba go usunąć.

---

## 8.2. Ornament ma być skalowalny

Ornamenty dzielimy na:

* **micro** — mały znak przy linii,
* **center** — ornament środka krawędzi,
* **corner** — detal narożnika,
* **seal** — większy znak panelu,
* **slot glyph** — znak gniazda,
* **state marker** — znak stanu aktywnego.

---

## 8.3. Ornamenty dopuszczalne

Dobre motywy:

* krąg,
* półkrąg,
* łuk,
* skala stopniowa,
* gwiazda punktowa,
* oko,
* księżyc,
* słońce,
* mały znak orbity,
* punkt kotwiczący,
* glif osi,
* delikatny znak plus dla DS,
* mikropodziały jak w mapach nieba.

Ryzykowne motywy:

* zbyt dosłowne zodiaki,
* ciężkie pentagramy,
* duże tryby mechaniczne,
* nadmiar napisów,
* pseudo-mistyczny chaos.

---

# 9. Linie, ornamenty i efekty jako osobne warstwy

Każda rama powinna mieć warstwy:

1. **Base line**

   * cienka struktura ramy.

2. **Secondary line**

   * linia wewnętrzna / zewnętrzna / skala.

3. **Ornament**

   * narożniki, środek, glify.

4. **State accent**

   * kolor aktywności / osi.

5. **Light effect**

   * glow, pulse, shimmer.

6. **Debug / layout guide**

   * tylko dev, niewidoczne w normalnej grze.

Efekt nie powinien być baked-in w głównym SVG. Lepiej, żeby runtime mógł go kontrolować.

---

# 10. Stany ramki

Każdy typ ramki powinien przewidywać stany:

## 10.1. Idle

* bardzo cienka,
* spokojna,
* niski kontrast,
* brak animacji albo minimalny oddech.

## 10.2. Hover / focus

* delikatne rozjaśnienie,
* subtelna poświata narożników,
* brak agresywnego migania.

## 10.3. Active

* kolor osi / systemu,
* lekki pulse,
* ornament środka może się rozświetlić.

## 10.4. Locked / disabled

* przygaszenie,
* niższy kontrast,
* brak glow,
* możliwe przerwanie linii.

## 10.5. Special / DS / piąty stan

* biel / perła / srebro / subtelne złoto,
* krystaliczny feeling,
* jaśniejsza ramka,
* bardziej „otwarcie” niż „moc”.

Piąty stan w dokumentach visual nie jest zwykłym piątym kolorem, tylko jakością jedności, pamięci, przejścia i eteru, więc dla DS i ramek specjalnych powinien być subtelny, jasny i szlachetny, a nie krzykliwy. 

## 10.6. Warning / fail / interruption

* krótkie zerwanie ciągłości,
* szybki błysk,
* chwilowe przygaszenie,
* bez czerwonego alarmowego UI, chyba że dotyczy czerwonej osi.

---

# 11. Spec dla SVG

## 11.1. Wymagania techniczne

Każdy asset SVG powinien mieć:

* transparent background,
* czysty `viewBox`,
* brak bitmap/base64,
* brak osadzonych fontów,
* brak losowych warstw z Figmy,
* logiczne nazwy grup,
* stroke możliwy do kontroli,
* najlepiej `vector-effect="non-scaling-stroke"` tam, gdzie ma to sens,
* brak ciężkiego baked-in glow,
* brak tła panelu, jeśli asset jest tylko ramką.

---

## 11.2. Preferowane grupy w SVG

Przykład struktury:

```text
<g id="base-line">
<g id="secondary-line">
<g id="ticks">
<g id="ornament">
<g id="accent">
<g id="glow-guide">
```

`glow-guide` może być tylko warstwą pomocniczą albo usuniętą przy eksporcie.

---

## 11.3. Kolorowanie

Najlepiej, żeby assety bazowe były przygotowane pod runtime coloring:

* `currentColor`,
* CSS variables,
* klasy SVG,
* albo neutralny stroke, który runtime może tintować.

Przykład klas:

```text
.frame-base
.frame-secondary
.frame-ornament
.frame-accent
.frame-special
```

---

# 12. Nazewnictwo assetów

## 12.1. Schemat

```text
<layer>_frame_<part>_<position>_<style>_<variant>.svg
```

Przykłady:

```text
submeta_frame_corner_tl_astrolabe_01.svg
submeta_frame_corner_tr_astrolabe_01.svg
submeta_frame_edge_top_thin_astrolabe_01.svg
submeta_frame_edge_bottom_thin_astrolabe_01.svg
submeta_frame_ornament_top_center_astrolabe_01.svg

hud_frame_corner_tl_minimal_01.svg
hud_frame_edge_right_thin_minimal_01.svg
hud_frame_ornament_top_center_sequence_01.svg

forge_frame_corner_bl_brass_01.svg
forge_frame_edge_top_thin_brass_01.svg
forge_frame_ornament_bottom_center_gearseal_01.svg
```

---

## 12.2. Style keywords

Proponowane słowa stylu:

* `astrolabe`
* `star_map`
* `sacred`
* `eldritch`
* `ritual`
* `brass`
* `forge`
* `minimal`
* `ether`
* `sequence`
* `slot`
* `prg`

---

# 13. Struktura katalogów

Proponowana struktura:

```text
assets/visual/shared/svg/frame_parts/
  corners/
  edges/
  center_ornaments/
  separators/
  badges/
  markers/

assets/visual/hud/svg/frame_parts/
  corners/
  edges/
  center_ornaments/
  sequence_markers/

assets/visual/submeta/svg/frame_parts/
  corners/
  edges/
  center_ornaments/
  slot_frames/
  resonance_nodes/
  separators/

assets/visual/meta/svg/frame_parts/
  corners/
  edges/
  center_ornaments/
  seals/

assets/visual/cards/svg/frame_parts/
  r1/
  r2/
  r3/
  r4/
  ds/
  event/
```

---

# 14. Runtime frame composer — model docelowy

Nie trzeba tego od razu implementować, ale spec powinien założyć docelowy system:

```text
FrameComposer({
  targetRect,
  style: "astrolabe",
  layer: "submeta",
  state: "active",
  accentColor: "blue",
  showCenterOrnaments: true,
  showTicks: true,
  density: "light"
})
```

Renderer powinien:

* osadzić narożniki w stałej wielkości,
* rozciągnąć krawędzie tylko w jednej osi,
* zakotwiczyć ornamenty na środku,
* utrzymać cienki stroke,
* dodać efekty jako warstwę,
* umożliwić zmianę akcentu koloru,
* umożliwić wyłączenie ornamentów przy małym rozmiarze.

---

# 15. Zasady dla konkretnych warstw

## 15.1. RUN HUD

Ramki HUD:

* najcieńsze,
* najmniej ozdobne,
* bez bogatych ornamentów,
* szybkie do odczytu.

Użycie:

* RP counter,
* prostokąty DR,
* małe oznaczenie etapu sekwencji,
* marker R1 / R2 / AA / AAA.

Dla HUD najważniejsze jest, żeby nie zasłaniał świata i nie produkował hałasu wizualnego.

---

## 15.2. SUB-META

Ramki SUB-META:

* mogą być bogatsze niż HUD,
* powinny wspierać układ relacji,
* mogą mieć ornamenty osi,
* mogą mieć gniazda i połączenia.

Użycie:

* panel główny,
* sekcje slotów,
* opis karty,
* magazyn,
* kuźnia,
* gniazda R2,
* osie PRG.

SUB-META według dokumentów visual ma wyglądać jak mapa relacji, panel rezonansu, układ osi i gniazd, a nie zwykłe menu. 

---

## 15.3. META / EON

Ramki META:

* bardziej ceremonialne,
* większe,
* spokojniejsze,
* bardziej centralne,
* mogą używać piątego stanu.

Tu dopuszczalne są:

* większe pieczęcie,
* większe kręgi,
* wyraźniejsza symetria,
* jaśniejsze eteryczne linie.

---

## 15.4. Karty

Ramki kart muszą być osobnym podsystemem, ale zgodnym z całością.

Zasada:

* typ karty rozpoznawalny szybciej niż ornament,
* kolor rozpoznawalny szybciej niż detal,
* tier nie może zamieniać karty w odpust.

Karty w Haiku Cosmos mają wyglądać jak tablice rezonansu / nośniki pamięci / rytualne obiekty systemu, więc ramka karty musi wspierać rozpoznanie typu, a nie dominować nad sensem. 

---

# 16. Efekty przyszłe

Efekty są **future pass**, po modularizacji.

Dopuszczalne efekty:

* subtle pulse,
* breathing glow,
* line draw-in,
* corner ignition,
* shimmer ornamentu,
* state color accent,
* active bridge glow,
* tick marks awaken,
* short halo on step completion.

Zakazy:

* mocny neon,
* ciągłe świecenie wszystkiego,
* agresywne miganie,
* grube glow udające linię,
* bloom niszczący czytelność.

---

# 17. Kryteria jakości

Ramka jest dobra, jeśli:

1. działa w małym i dużym rozmiarze,
2. nie pogrubia się przy skalowaniu,
3. nie zasłania treści,
4. ma czytelną strukturę,
5. ornament nie dominuje,
6. wygląda dobrze bez efektów,
7. wygląda lepiej z efektami,
8. można ją pokolorować runtime,
9. da się użyć jej w kilku panelach,
10. pasuje do rytualnego minimalizmu kosmicznego.

Ramka jest zła, jeśli:

* wygląda jak ciężki fantasy border,
* przypomina mobile premium item frame,
* ma za grube linie,
* jest jednym pełnym obrazkiem,
* nie skaluje się,
* ornament jest ważniejszy niż treść,
* glow jest baked-in i brudzi UI,
* robi chaos zamiast porządku.

---

# 18. Minimalny zestaw assetów do pierwszego passu

Na pierwszy pass nie robimy wszystkiego.

Robimy tylko:

## A. SUB-META astrolabe frame kit

* 4 narożniki,
* 4 cienkie krawędzie,
* top-center ornament,
* bottom-center ornament,
* separator poziomy,
* slot mini-frame.

## B. HUD minimal sequence frame kit

* 4 mini narożniki,
* 4 cienkie krawędzie,
* mały marker sekwencji,
* wariant active / inactive.

## C. Forge brass detail kit

* 4 narożniki,
* 4 krawędzie,
* mały ornament mechaniczny,
* separator kosztu.

Bez pełnego redesignu. Bez nowych mechanik. Bez wielkiego eksportu PNG.

---

# 19. Moja rekomendacja decyzji

Najmocniejszy kierunek dla Haiku Cosmos:

**70% alchemiczno-astrologiczne astrolabium**
**20% geometria sakralna / eldritch dla gniazd i PRG**
**10% steampunk / złoty detal tylko dla Kuźni i materiałowej przemiany**

Czyli:

* główny język: cienka mapa nieba,
* aktywne gniazda: rytualna geometria,
* kuźnia: mosiężny instrument.

To zachowa własny styl i nie zrobi z gry ani Diablo, ani steampunka, ani generycznego fantasy UI.

---
