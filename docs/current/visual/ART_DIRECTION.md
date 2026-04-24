# Haiku Cosmos — ART DIRECTION v0.1
## Kierunek oprawy graficznej i zasady wizualne projektu

> Status: KIERUNEK
> Obszar: oprawa wizualna
> Źródło prawdy: TAK, dla aktualnego kierunku wizualnego w swoim zakresie
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: `docs/current/visual/README.md`, `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`, `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`

Dokument znajduje się w `docs/current/visual/` i definiuje główny kierunek artystyczny dla świata gry, kart, PRG, SUB-META i META.

## 1. CEL DOKUMENTU

Ten dokument definiuje kierunek oprawy graficznej Haiku Cosmos.

Nie jest to:
- finalna specyfikacja assetów,
- lista wszystkich grafik do wykonania,
- opis implementacji shaderów linia po linii.

Ten dokument jest:
- art-direction source of truth,
- podstawą dla dalszych decyzji projektowych,
- punktem odniesienia dla Codexa przy implementacji UI i renderingu,
- wspólnym językiem dla świata, kart i overlayów.

---

## 2. GŁÓWNE ZAŁOŻENIE STYLU

Haiku Cosmos nie powinno wyglądać jak:
- arcade shooter,
- typowy deckbuilder fantasy,
- „kosmiczne UI sci-fi” z przeładowanym neonem,
- sterylna infografika.

Haiku Cosmos powinno wyglądać jak:

RYTUALNY MINIMALIZM KOSMICZNY

czyli połączenie:
- czytelności gameplayowej,
- kontemplacyjnej przestrzeni,
- subtelnej sakralności form,
- geometrii i rezonansu,
- oszczędnej, ale dopracowanej symboliki.

Świat ma pozostać żywy.
UI ma być częścią świata.
Karty mają wyglądać jak nośniki znaczenia, nie jak losowe itemy.
Meta ma wyglądać jak pamięć decyzji, nie jak panel statystyk.

---

## 3. FILARY ESTETYKI

### 3.1. Minimalizm
Forma ma być oszczędna.
Nie przeładowujemy ekranu ornamentem, efektami i ramkami.

### 3.2. Czytelność
Gracz ma od razu widzieć:
- obiekty aktywne,
- kolory systemowe,
- ważne zmiany stanu,
- aktywne połączenia,
- różnicę między światem, kartą i overlayem.

### 3.3. Rytuał
Elementy interfejsu i karty mają sprawiać wrażenie osadzonych w większym porządku.
Wizualnie preferowane są:
- symetria,
- subtelne osie,
- cienkie linie,
- łuki,
- kręgi,
- pola rezonansu,
- świetlne połączenia.

### 3.4. Cisza wizualna
Gra nie powinna krzyczeć.
Nawet kiedy coś jest ważne, efekt powinien być:
- czytelny,
- wyraźny,
- ale nie agresywny.

### 3.5. Kosmos jako proces
Tło, ruch, światło i obiekty mają sugerować, że kosmos trwa i oddycha.
Nie statyczna plansza, tylko żywe pole.

---

## 4. STRUKURA JĘZYKA WIZUALNEGO

Gra powinna operować trzema powiązanymi rejestrami wizualnymi.

### 4.1. RUN
Charakter:
- żywy,
- dynamiczny,
- oszczędny,
- czytelny,
- skupiony na obiektach i ruchu.

Priorytet:
- gameplay,
- odczyt ruchu,
- odczyt koloru,
- feeling PRG.

### 4.2. SUB-META
Charakter:
- spokojniejszy,
- bardziej geometryczny,
- półprzezroczysty,
- taktyczny,
- nadal osadzony w świecie.

Priorytet:
- konfiguracja,
- czytelność relacji,
- odczucie „panelu rezonansu”, nie zwykłego menu.

### 4.3. META / EON
Charakter:
- bardziej ceremonialny,
- bardziej monumentalny,
- bogatszy niż RUN i SUB-META,
- silniej symboliczny.

Priorytet:
- domknięcie cyklu,
- poczucie przejścia,
- waga decyzji,
- pamięć i transformacja.

---

## 5. PALETA SYSTEMOWA

Kolory bazowe pozostają kanoniczne i są traktowane jako semantyka systemu.

- RED    = forma / wielkość / wejście / nacisk
- YELLOW = intencja / glue / relacja / kierunek
- GREEN  = czas / tempo / przepływ / rozwój
- BLUE   = cisza / skala / obiekty / dystans

Kolory te muszą być spójne:
- w HUD,
- w kartach,
- w PRG,
- w SUB-META,
- w komunikatach,
- w efektach wizualnych.

### 5.1. Zasada użycia koloru
Kolor nie powinien zalewać całego ekranu.
Preferowane użycie:
- akcent,
- rdzeń,
- poświata,
- cienka linia,
- segment,
- aura,
- oznaczenie aktywności.

### 5.2. Baza neutralna
Tło i struktury bazowe powinny opierać się na:
- czerni,
- bardzo ciemnym granacie,
- ciemnym fiolecie,
- grafitach,
- przygaszonych szarościach.

Kolor systemowy ma świecić na tle ciszy, a nie walczyć z innym kolorem.

---

## 6. TECHNOLOGIA RENDERINGU — DECYZJA KIERUNKOWA

Dla Haiku Cosmos preferowany kierunek to:

HYBRYDA WEBGL + SPRITES + OVERLAY UI

### 6.1. WebGL / GPU powinno obsługiwać
- tło świata,
- mgławice,
- pył,
- warstwy głębi,
- światło i glow,
- efekty rezonansu,
- ring PRG,
- subtelne deformacje pola,
- masowe rysowanie obiektów,
- eventowe efekty wizualne.

### 6.2. Sprites / atlasy powinny obsługiwać
- planetoidy,
- planety,
- gwiazdy,
- specjalne warianty obiektów,
- karty,
- ikony i glify,
- elementy HUD.

### 6.3. Overlay UI powinien obsługiwać
- SUB-META,
- META,
- opisy kart,
- listy i kolekcje,
- koszty,
- wybory i przyciski.

### 6.4. Zasada wydajności
Nie należy robić pełnej „premium ilustracji” dla każdego obiektu latającego w RUN.
Premium jakość ma pojawiać się:
- punktowo,
- w momentach skupienia,
- w ważnych obiektach,
- w podglądzie karty,
- w momentach rytualnych,
- w META / EON,
- w specjalnych eventach.

---

## 7. ŚWIAT RUN — KIERUNEK WIZUALNY

### 7.1. Zasada ogólna
RUN ma być bardziej żywy niż ozdobny.

### 7.2. Tło
Tło powinno być:
- głębokie,
- organiczno-kosmiczne,
- warstwowe,
- spokojne,
- nieprzesadnie jasne.

Tło nie może konkurować z obiektami aktywnymi.

Preferowane elementy:
- delikatne mgławice,
- pył kosmiczny,
- subtelne smugi,
- bardzo lekkie warstwy paralaksy,
- rozproszone światło.

### 7.3. Planetoidy
Planetoidy mają być:
- czytelne z dystansu,
- lekkie renderowo,
- zróżnicowane sylwetką,
- spójne stylistycznie.

Preferowane:
- kilka bazowych shape families,
- rotacja,
- delikatny highlight,
- subtelna tekstura,
- kolor jako akcent, nie pełny chaos powierzchni.

### 7.4. Planety
Planety mogą być bardziej dopieszczone niż planetoidy.
Powinny mieć:
- mocniejszą tożsamość wizualną,
- większą skalę odczuwalności,
- wyraźniejszą aurę,
- klasowy charakter.

Preferowane:
- lekka atmosfera,
- subtelne pasy lub warstwy,
- zgaszona elegancja,
- brak przesadnego realizmu.

### 7.5. Gwiazdy
Gwiazdy muszą być:
- bardzo czytelne,
- świetliste,
- natychmiast rozpoznawalne jako obiekty wyższego rzędu.

Powinny mieć:
- rdzeń,
- aureolę,
- oddech światła,
- klasę barwną zgodną z typem.

### 7.6. Ruch
Ruch ma budować kontemplację, nie chaos.
Duża liczba obiektów nie powinna oznaczać:
- agresywnego migania,
- przesadnych particle burstów,
- przypadkowych smug wszędzie.

Ruch ma być:
- płynny,
- miękki,
- czytelny,
- zrozumiały.

---

## 8. PRG — GŁÓWNY PODPIS WIZUALNY GRY

PRG powinno być jednym z najbardziej dopracowanych wizualnie elementów całej gry.

To nie ma być zwykłe kółko lub debug ring.
To ma być pole intencji gracza.

### 8.1. Ring PRG
Ring powinien być zbudowany z kilku warstw:
- cienka linia bazowa,
- subtelna poświata,
- delikatna mgiełka / halo,
- miękki puls,
- lekka reakcja na aktywny tryb.

### 8.2. Charakter zależny od konfiguracji
PRG powinno zmieniać feeling zależnie od aktywnej konfiguracji:
- RED  = bardziej stanowczy, zwarty, precyzyjny
- YELLOW = bardziej lepki, miękki, relacyjny
- GREEN = bardziej płynny, temporalny, falowy
- BLUE = bardziej chłodny, rozległy, „głębszy”

### 8.3. Reakcja na obiekty
Obiekty w polu PRG mogą otrzymywać subtelne sygnały:
- halo,
- przesunięcie światła,
- delikatne zagięcie ruchu,
- minimalne ripple.

Bez przesady.
Efekt ma być odczuwalny, nie głośny.

---

## 9. RUN HUD — ZASADY ESTETYCZNE

HUD ma być:
- cienki,
- dyskretny,
- semantyczny,
- osadzony w świecie.

Nie budujemy „grubej belki HUD”.

### 9.1. RP
RP powinno być czytelne, ale nie dominujące.
Forma:
- mały blok,
- subtelna typografia,
- delikatna rama lub linia,
- dyskretna obecność.

### 9.2. Prostokąty DR
To ważny element języka gry.
Powinny być:
- proste,
- mocne semantycznie,
- dobrze widoczne.

Zasada stylu:
- count == 0  -> czarny do koloru
- count > 0   -> kolor do bieli

Pulsowanie:
- subtelne,
- spokojne,
- bez agresywnego migania.

### 9.3. Overlaye akcji
Komunikaty akcji mają być:
- krótkie,
- lekkie,
- półprzezroczyste,
- znikające automatycznie.

Nie robimy spamującego feedu tekstowego.

---

## 10. SUB-META — OPRAWA GRAFICZNA

SUB-META nie powinno wyglądać jak zwykłe menu ekwipunku.
Powinno wyglądać jak panel konfiguracji kosmicznego rezonansu.

### 10.1. Forma panelu
Preferowany kierunek:
- półprzezroczysta warstwa nad światem,
- świat nadal lekko widoczny pod spodem,
- subtelna geometra,
- cienkie linie,
- kręgi,
- osie,
- połączenia.

### 10.2. Sloty
Sloty kart nie powinny być zwykłymi prostokątami z obramowaniem.
Powinny wyglądać jak:
- gniazda,
- wnęki,
- pola osadzenia,
- miejsca aktywacji.

### 10.3. Wiązania R2
Połączenia R2 powinny być czytelne i piękne.
Preferowane:
- świetlne mosty,
- aktywne linie,
- miękkie impulsy,
- wspólne podświetlenie obu połączonych kategorii.

### 10.4. Kolekcja
Kolekcja po prawej nie może wchodzić w klimat „surowej listy z toola”.
Musi być użytkowa, ale estetyczna.
Priorytet:
- czytelne rozróżnienie typów kart,
- szybkie filtrowanie wzrokowe,
- brak bałaganu.

### 10.5. Opis karty
Opis karty to jedno z miejsc, gdzie można pozwolić sobie na bardziej dopieszczoną grafikę.
To miejsce skupienia.
Tu asset może być bogatszy niż w samym RUN.

---

## 11. META / EON — OPRAWA GRAFICZNA

META / EON powinno mieć najmocniejszy ciężar ceremonialny.

To przestrzeń:
- przejścia,
- domknięcia,
- wyboru,
- pamięci,
- transformacji.

### 11.1. Charakter
Bardziej monumentalny niż SUB-META.
Bardziej uporządkowany niż RUN.
Bogatszy wizualnie, ale nadal czysty.

### 11.2. Możliwe elementy
- większe osie symetrii,
- rytualne kręgi,
- warstwy świetlnych map,
- spokojne animacje,
- bardziej „sakralny” feeling niż w RUN.

### 11.3. Zasada
META ma robić wrażenie wagi decyzji, nie „nagrody lootboxowej”.

---

## 12. KARTY — ZASADY OGÓLNE

Karty są jednym z głównych nośników tożsamości gry.
Ich wygląd musi łączyć:
- systemowość,
- czytelność,
- poetyckość,
- wagę.

Karty nie powinny wyglądać jak:
- fantasy TCG,
- błyszczące loot-cards,
- aplikacyjne badge.

Karty powinny wyglądać jak:
- tablice rezonansu,
- nośniki pamięci,
- obiekty rytualne,
- fragmenty większego porządku.

---

## 13. SYSTEM RAM KART

Nie należy tworzyć osobnej stylistyki od zera dla każdej karty.
Potrzebny jest wspólny system.

### 13.1. Stałe elementy wspólne
Każda karta powinna mieć:
- bazową ciemną powierzchnię,
- wyraźny kontur / ramę,
- pole koloru systemowego,
- miejsce na symbol / glif,
- miejsce na obraz / motyw,
- miejsce na tekst / haiku / opis.

### 13.2. Zmienność powinna wynikać z
- typu karty,
- rangi / tieru,
- koloru,
- funkcji systemowej.

### 13.3. Zasada
Mechanika najpierw.
Estetyka wzmacnia odczyt.
Grafika nie może zniszczyć rozpoznawalności typu karty.

---

## 14. KARTY PODSTAWOWE R1

R1 muszą być najszybciej rozpoznawalne.
To podstawowy język systemu.

### 14.1. Charakter
- proste,
- czytelne,
- mocne kolorystycznie,
- rytualne, ale nie przesadzone.

### 14.2. Forma
- jednokolorowa dominanta zgodna z systemem,
- prosta rama,
- subtelny glif,
- niewielki motyw centralny,
- czystość formy.

### 14.3. Zasada
R1 ma być bardziej „fundamentalne” niż „ozdobne”.

---

## 15. KARTY TIERÓW sDR i pDR

sDR i pDR nie powinny zmieniać całej tożsamości karty.
Powinny wyglądać jak:
- uszlachetniona forma tej samej karty,
- wyższy stopień zagęszczenia,
- bardziej dojrzały stan rezonansu.

### 15.1. sDR
Powinno sygnalizować:
- większą stabilność,
- większe nasycenie,
- drobne wzbogacenie ramy,
- lekko głębsze światło lub dodatkowy detal.

### 15.2. pDR
Powinno sygnalizować:
- najwyższy poziom wyostrzenia,
- pełnię,
- większą precyzję ornamentu,
- bardziej szlachetny detal,
- mocniejszy, ale nadal elegancki akcent.

### 15.3. Zasada
Tier nie może robić z karty „odpustu”.
Wzrost jakości ma być subtelny i godny, nie krzykliwy.

---

## 16. KARTY DS (DODATKOWY SLOT)

DS są kartami specjalnymi i muszą wizualnie odróżniać się od zwykłych R1.

Z kanonu wynika:
- biała ramka,
- znak „+” w kolorze A.

To należy zachować jako rdzeń rozpoznawalności.

### 16.1. Charakter wizualny DS
DS powinny wyglądać jak:
- karta otwarcia,
- klucz,
- znak rozszerzenia pola,
- narzędzie odblokowania.

### 16.2. Proponowany feeling
- jaśniejsza rama niż R1,
- bardziej „czysta” przestrzeń,
- mniej masy koloru,
- więcej bieli i światła,
- symbol plus jako centrum.

### 16.3. Zasada
DS nie jest „silniejszą R1”.
DS jest innym rodzajem działania.
To ma być widoczne od razu.

---

## 17. KARTY EVENTOWE — OSOBNA KLASA WIZUALNA

Karty eventowe muszą być odróżnialne od:
- R1,
- DS,
- sDR / pDR,
- zwykłych kart systemowych.

Ich rola jest inna:
- są czasowe,
- sytuacyjne,
- wyjątkowe,
- związane z konkretnym stanem świata lub wydarzeniem.

Dlatego potrzebują własnej klasy wizualnej.

### 17.1. Zasada nadrzędna
Karta eventowa nie powinna mylić się z kartą bazowej progresji.

Gracz musi od razu widzieć:
„to nie jest zwykła karta systemowa — to jest karta zdarzenia / interwencji / wyjątku”.

### 17.2. Charakter wizualny
Karty eventowe powinny wyglądać jak:
- anomalia,
- pieczęć wydarzenia,
- sygnał czasowy,
- karta spoza normalnego rytmu.

### 17.3. Elementy odróżniające
Preferowane wyróżniki:
- osobny typ ramy,
- niestandardowa aura,
- inna geometria akcentu,
- wyraźny znacznik czasu / eventowości,
- bardziej nieregularne lub „przychodzące z zewnątrz” światło.

### 17.4. Czego nie robić
Nie robić eventówek jako:
- zwykłe R1 z innym kolorem,
- karta z doklejoną ikonką błyskawicy,
- karta z przypadkowo mocniejszym glowem.

To za mało.

### 17.5. Proponowany kierunek
Zwykłe karty systemowe:
- stabilne,
- osadzone,
- uporządkowane.

Karty eventowe:
- bardziej „przerywające porządek”,
- bardziej temporalne,
- bardziej sygnalizujące obecność chwili / zjawiska.

Przykładowe środki:
- przerywana rama,
- podwójna niestandardowa obwódka,
- delikatne pęknięcie symetrii,
- aura jak zjawisko atmosferyczne / kosmiczne,
- mały znacznik eventu w osobnym miejscu karty.

### 17.6. Kolorystyka eventówek
Eventówki mogą nadal korzystać z kolorów systemowych, jeśli event dotyczy konkretnej osi.
Ale muszą mieć dodatkowy kod wizualny, np.:
- biel / srebro / popiół / złoto jako znacznik wyjątkowości,
- chłodny lub niestandardowy połysk,
- osobny typ poświaty.

### 17.7. Zasada praktyczna
Jeśli karta ma znaczenie eventowe, to:
- jej typ musi być widoczny szybciej niż jej kolor,
- jej wyjątkowość musi być widoczna szybciej niż jej tier.

---

## 18. TYPOGRAFIA

Typografia powinna być:
- czytelna,
- oszczędna,
- spokojna,
- bez przesadnego futurystycznego stylu.

### 18.1. UI
Preferowane:
- prosta, elegancka, lekko techniczna typografia,
- dobra czytelność w małym rozmiarze.

### 18.2. Karty / haiku
Treści poetyckie powinny mieć:
- więcej oddechu,
- spokojniejszą kompozycję,
- mniej „systemowego” feelingu niż etykiety UI.

### 18.3. Zasada
Nie mieszać zbyt wielu stylów fontów.
Lepiej jedna rodzina lub dwa bardzo blisko współpracujące rejestry.

---

## 19. IKONY I GLIFY

Gra powinna używać prostych glifów systemowych.

Glify powinny:
- być czytelne,
- być oszczędne,
- wzmacniać rozpoznanie kategorii,
- nie konkurować z głównym obrazem.

Preferowane:
- znak kierunku,
- znak przyciągania,
- znak czasu / fali,
- znak skali / orbity,
- znak rozszerzenia,
- znak eventu.

---

## 20. PREMIUM GRAPHICS — GDZIE WARTO INWESTOWAĆ

Najbardziej dopieszczona grafika powinna pojawiać się w miejscach skupienia.

### 20.1. Wysoki priorytet
- podgląd karty,
- ważne planety i gwiazdy,
- PRG,
- META / EON,
- aktywacja wyjątkowego efektu,
- ważny event,
- moment narodzin obiektu wyższego rzędu.

### 20.2. Średni priorytet
- SUB-META,
- kolekcja,
- tło świata,
- komunikaty specjalne.

### 20.3. Niski priorytet
- zwykłe planetoidy w dużej liczbie,
- standardowe elementy list i utility UI,
- drobne obiekty spamujące ekran.

---

## 21. CZEGO UNIKAĆ

Nie iść w:
- przeładowany neon,
- plastikowe sci-fi,
- „mobile premium fantasy card frame”,
- zbyt realistyczne malarstwo wszędzie,
- zbyt techniczny debug-look,
- przesadne bloom / glare / particles,
- chaos kolorystyczny,
- zbyt agresywne animacje.

---

## 22. ZASADA KOŃCOWA

Docelowa tożsamość wizualna Haiku Cosmos powinna spełniać trzy warunki jednocześnie:

1. Świat jest czytelny podczas gry.
2. UI i karty są częścią tego samego kosmosu.
3. Gra ma aurę rytuału, pamięci i rezonansu.

Skrót kierunku:

RUN jest bardziej żywy niż ozdobny.
SUB-META jest bardziej geometryczna niż ilustracyjna.
META jest bardziej ceremonialna niż użytkowa.
Karty systemowe są stabilne i kanoniczne.
Karty eventowe są wyjątkami i muszą być natychmiast rozpoznawalne.
Całość opiera się na rytualnym minimalizmie kosmicznym.

---

## 23. REKOMENDACJA IMPLEMENTACYJNA DLA CODEXA

Przy pracach wizualnych i UI Codex powinien pilnować następujących zasad:

- nie przeciążać RUN HUD,
- nie robić ciężkich ilustracji dla masowych obiektów,
- budować świat na lekkich, powtarzalnych assetach + efektach GPU,
- traktować PRG jako element premium,
- utrzymać spójny system ram kart,
- oddzielić wizualnie:
  - R1,
  - sDR / pDR,
  - DS,
  - karty eventowe,
- projektować overlaye jako część świata, nie oderwane okna narzędziowe,
- preferować subtelną elegancję nad efektowność „na siłę”.

---

## 24. STATUS

Dokument roboczy.
Może zostać rozwinięty o kolejne załączniki:

- ART_BIBLE_COLOR_AND_MATERIALS.md
- CARD_VISUAL_SYSTEM.md
- PRG_VISUAL_LANGUAGE.md
- UI_THEME_RULES.md
- EVENT_CARD_VISUAL_RULES.md

Na tym etapie dokument ustala główny kierunek i wspólny język wizualny projektu.