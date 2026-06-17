> Status: ROBOCZY / SYSTEM ŚWIATA
> Obszar: komety / przemiany świata / stany obiektów
> Źródło prawdy: TAK ROBOCZO, dla projektowego kontraktu systemu komet; NIE dla finalnych wartości balansu; NIE dla gotowej implementacji runtime
> Ostatnia aktualizacja: 2026-06-17
> Powiązane dokumenty: ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md, CARDS_SYSTEM.md, SUB_META_SYSTEM.md, PRG_SYSTEM.md, ROADMAP.md, ../technical/WORLD_FUNCTION_MAP.md, ../visual/ART_DIRECTION.md, ../visual/KOSMOLOGIA_WIZUALNA.md, ../visual/BIBLIOTEKA_MATERIALOW.md

# Haiku Cosmos — COMETS SYSTEM

## 1. Cel i granice dokumentu

Ten dokument opisuje roboczy kontrakt projektowy systemu komet w Haiku Cosmos.

Zakres:
- typy komet i ich znaczenia kolorystyczne,
- wpływ komet na obiekty świata,
- roboczy model stanów obiektów,
- konflikty między efektami,
- relacje z pyłem, kartami, SUB-META, PRG i przyszłym debugiem.

Ten dokument nie jest:
- finalną tabelą balansu,
- gotową specyfikacją implementacji runtime,
- zmianą systemu kart R1–R4,
- zmianą ekonomii RP,
- poleceniem do edycji `hc.comets.js`.

## 2. Zasada nadrzędna

Komety są rzadkimi obiektami wysokiego wpływu. Nie są zwykłymi pociskami ani meteorami. Są zdarzeniami przemiany świata.

Każda kometa ma:
- typ,
- kolor dominujący,
- masę,
- prędkość,
- trajektorię,
- zestaw efektów zależnych od obiektu, w który uderzy lub przez który przejdzie.

Kometa powinna być traktowana jak kosmiczny event zmieniający stan świata, a nie jak kolejny wariant meteoru do rutynowego zbierania.

## 3. Typy komet, kolory i sensy

| Typ komety | Kolor / oś | Sens projektowy |
| --- | --- | --- |
| Kometa podstawowa | neutralna / fizyczna / bez dominującego żywiołu | neutralne uderzenie kosmiczne, masa, impakt, przemiana fizyczna |
| Kometa lodowa | BLUE | chłód, cisza, skala, zamrożenie, kondensacja |
| Kometa ognista | RED | żar, zapłon, spalanie, wysoka energia |
| Kometa życia | GREEN | przepływ, wzrost, leczenie, oddech |
| Kometa transformująca | YELLOW + ETER | alchemia, spoiwo, relacja, mutacja, przepisanie stanu |

Kolory komet muszą pozostać spójne z czterema kolorami bazowymi i piątym stanem eterycznym opisanym w dokumentach visual. Kometa transformująca nie jest czystym chaosem; jest alchemicznym wydarzeniem relacji, przepisania i zmiany formy.

## 4. Kometa podstawowa

Kometa podstawowa zachowuje obecną lub bazową rolę komety w świecie gry.

Robocze efekty:
- może uczestniczyć w przemianie asteroidy w planetę skalistą,
- może rozbijać meteor na cząstki,
- działa jako neutralne uderzenie kosmiczne,
- nie nakłada żywiołowego stanu,
- nie zmienia koloru meteoru na kolor bazowy wynikający z żywiołu.

Jej rola to fizyczny impakt, masa i neutralna dynamika kosmiczna.

## 5. Kometa lodowa — BLUE

### 5.1. Wejście w chmurę pyłu

Kometa lodowa:
- zamraża chmurę pyłu,
- zagęszcza ją,
- powoduje, że obiekty wchodzące w tę chmurę są zatrzymywane lub spowalniane 2x szybciej,
- nadaje chmurze stan roboczy `frozenDustCloud`.

Mnożnik `2x` jest intencją projektową efektu i wymaga późniejszego strojenia.

### 5.2. Uderzenie w planetę skalistą

Kometa lodowa:
- zostawia wodę,
- nadaje planecie stan `water_seeded`,
- przygotowuje planetę do późniejszego powstania życia,
- sama nie tworzy życia.

Woda jest warunkiem przygotowawczym, nie końcowym efektem biologicznym.

### 5.3. Uderzenie w asteroidę

Kometa lodowa:
- rozbija asteroidę,
- tworzy niebieski pył,
- uwalnia meteory wyłącznie koloru BLUE,
- powinna skalować ilość pyłu, liczbę meteorów i ich masę według masy asteroidy.

Finalne wzory skalowania pozostają do balansu.

### 5.4. Uderzenie w księżyc

Kometa lodowa:
- zamraża księżyc,
- nadaje mu stan `frozen`,
- do momentu uderzenia innej komety sprawia, że wszystkie obiekty uderzające w księżyc są przekształcane w niebieskie pierścienie,
- nadaje księżycowi roboczy stan `ring_generator_blue`.

### 5.5. Uderzenie w meteor

Kometa lodowa zmienia meteor dowolnego koloru w meteor BLUE.

## 6. Kometa ognista — RED

### 6.1. Wejście w chmurę pyłu

Kometa ognista:
- rozpala chmurę pyłu,
- nadaje jej stan `ignitedDustCloud`,
- jeśli chmura była zamrożona, topi ją i nadpisuje stan ogniem.

### 6.2. Uderzenie w planetę z życiem

Kometa ognista:
- spopiela planetę,
- usuwa życie,
- nadaje stan `scorched`,
- nie musi niszczyć całej planety.

Priorytetem jest utrata życia i ślad po spaleniu, nie automatyczna destrukcja obiektu.

### 6.3. Uderzenie w planetę skalistą

Kometa ognista:
- rozpala planetę,
- nadaje stan `ignited`,
- od tego momentu wszystkie obiekty uderzające w planetę płoną,
- masa tych obiektów tworzy warstwę czerwonego pyłu wokół planety,
- po wygaśnięciu planety czerwony pył stabilizuje się jako pierścienie.

### 6.4. Uderzenie w planetę gazową

Kometa ognista:
- rozpala planetę gazową,
- powoduje, że wszystkie orbitery zaczynają wchodzić do jej masy,
- sprawia, że planeta gazowa rośnie,
- może przygotować planetę gazową do późniejszej przemiany w gwiazdę, jeżeli spełni warunki i zostanie trafiona kometą życia.

Roboczym stanem pośrednim może być `gas_star_ready`, jeśli masa i zapłon spełniają warunki.

### 6.5. Uderzenie w meteor

Kometa ognista zmienia meteor dowolnego koloru w meteor RED.

### 6.6. Uderzenie w księżyc

Kometa ognista:
- rozpala księżyc,
- sprawia, że każdy obiekt napotkany przez księżyc lub uderzający w księżyc jest zmieniany w czerwoną chmurę pyłu,
- nadaje księżycowi roboczy stan `ring_generator_red` lub `ignited_moon_dust_generator`.

## 7. Kometa życia — GREEN

### 7.1. Specjalna zasada sterowania

Kometa życia jest jedyną kometą, którą gracz może nakierowywać po uzyskaniu odpowiedniej karty.

Ograniczenia sterowania:
- gracz nie zmienia jej prędkości,
- gracz nie może jej zatrzymać,
- gracz nie może jej przeciągnąć jak zwykłego obiektu,
- gracz może jedynie zakrzywiać lub nakierować trajektorię.

Sterowanie kometą życia powinno być wyjątkiem wysokiej wagi, a nie zwykłym trybem manipulacji obiektami.

### 7.2. Uderzenie w planetę z wodą

Kometa życia:
- nadaje życie,
- zmienia planetę ze stanem `water_seeded` w planetę ze stanem `life_seeded`.

Jeżeli planeta nie ma przygotowania wodnego, efekt życia wymaga osobnej decyzji balansowej i nie jest tu kanonizowany.

### 7.3. Uderzenie w meteor

Kometa życia zmienia meteor dowolnego koloru w meteor GREEN.

### 7.4. Wejście w chmurę pyłu

Kometa życia:
- zmniejsza gęstość chmury,
- zmniejsza jej wielkość,
- działa zależnie od czasu przebywania komety w chmurze,
- może całkowicie wygasić chmurę.

### 7.5. Uderzenie w spopielony, rozpalony albo zamrożony obiekt

Kometa życia:
- usuwa nałożone efekty,
- niweluje `frozen`, `ignited` i `scorched`,
- przywraca obiekt do pierwotnego stanu bazowego.

To jest oczyszczenie i leczenie stanu, nie alchemiczna mutacja.

### 7.6. Uderzenie w planetę gazową

Kometa życia:
- może zmienić kolor planety gazowej na zielony,
- jeśli planeta gazowa ma odpowiednią masę i jest rozpalona po komecie ognistej, zmienia ją w gwiazdę o wielkości tej planety gazowej.

Warunki masy i zapłonu są do późniejszego audytu i strojenia.

## 8. Kometa transformująca — YELLOW + ETER

Kometa transformująca jest kometą alchemiczną. Zmienia relacje, stany, kolory i efekty. Nie powinna być opisywana jako czysty chaos.

### 8.1. Uderzenie w meteor

Kometa transformująca zmienia meteor w losowy kolor bazowy:
- RED,
- YELLOW,
- GREEN,
- BLUE.

Losowanie może być ważone, jeżeli późniejszy balans tego wymaga.

### 8.2. Uderzenie w obiekt bez efektu

Kometa transformująca może:
- zmienić wariant obiektu,
- zmienić kolor,
- przekształcić obiekt w stan sąsiedni,
- uruchomić efekt `transformed`.

Szczegóły pozostają do balansu i osobnej tabeli transformacji.

### 8.3. Uderzenie w obiekt z efektem

Kometa transformująca nie czyści efektu prosto jak kometa życia. Przekształca stan według tabeli transformacji zależnej od aktualnego efektu.

Przykłady kierunkowe:
- `frozen` może dać wodę, pierścień niebieski albo kryształowy pył,
- `ignited` może dać czerwony pierścień, stan gwiazdowy albo spopielenie,
- `scorched` może dać popiół lub szary pył, oczyszczenie albo stan jałowy.

Tabela transformacji musi być jawna przed implementacją, ponieważ będzie źródłem konfliktów z balansem, debugiem i czytelnością stanów.

### 8.4. Wejście w chmurę pyłu

Kometa transformująca:
- zmienia kolor i właściwości chmury,
- może tworzyć pył żółty, losowy, mieszany, szary albo alchemiczny,
- traktuje mieszanie pyłów jako temat SUB-META / Kuźni, a nie zwykłe zbieranie HUD.

## 9. Robocze stany obiektów

To jest model projektowy. Finalne nazwy w kodzie mogą być inne, ale implementacja powinna mieć jawne i debugowalne stany.

| Stan roboczy | Znaczenie |
| --- | --- |
| `frozen` | Obiekt jest zamrożony; zachowanie zależy od klasy obiektu. |
| `ignited` | Obiekt jest rozpalony; może podpalać lub przetwarzać kolizje. |
| `scorched` | Obiekt został spopielony; życie zostało usunięte albo powierzchnia jest jałowa. |
| `water_seeded` | Planeta skalista ma wodę i jest przygotowana do późniejszego życia. |
| `life_seeded` | Planeta ma życie nadane przez kometę życia. |
| `transformed` | Obiekt został przepisany przez kometę transformującą lub czeka na wynik tabeli transformacji. |
| `frozenDustCloud` | Chmura pyłu jest zamrożona, zagęszczona i silniej spowalnia obiekty. |
| `ignitedDustCloud` | Chmura pyłu jest rozpalona. |
| `ring_generator_blue` | Księżyc zamienia uderzające obiekty w niebieskie pierścienie. |
| `ring_generator_red` | Księżyc lub obiekt księżycowy generuje czerwony pył / czerwone pierścienie. |
| `gas_star_ready` | Rozpalona, masywna planeta gazowa spełnia warunki wstępne do przemiany w gwiazdę po komecie życia. |

## 10. Priorytety konfliktów

Robocze priorytety konfliktów:
- kometa życia usuwa `frozen`, `ignited` i `scorched`,
- kometa ognista nadpisuje `frozen` stanem `ignited`,
- kometa lodowa może wygaszać `ignited` albo nadpisywać go stanem `frozen`, zależnie od klasy obiektu,
- kometa transformująca nie nadpisuje prosto, tylko przekształca według tabeli transformacji,
- ogień uderzający w planetę z życiem najpierw niszczy życie, potem nakłada `scorched`,
- życie uderzające w rozpaloną dużą planetę gazową może mieć specjalny priorytet przemiany w gwiazdę.

Te priorytety muszą być testowalne i widoczne w debug state przed pełnym balansem.

## 11. Pyły, chmury pyłu i HUD

Zasady pyłów:
- kometa lodowa tworzy niebieski pył,
- kometa ognista tworzy czerwony pył,
- kometa życia raczej wygasza i oczyszcza chmury, opcjonalnie zostawia zielony ślad,
- kometa transformująca może tworzyć żółty, szary, mieszany albo losowy pył,
- HUD nadal powinien zbierać tylko jeden kolor bazowy naraz,
- mieszanie pyłów i szary lub alchemiczny pył powinny pozostać po stronie SUB-META / Kuźni albo stanów świata, a nie zwykłego zasobnika HUD.

To utrzymuje rozdział między szybkim odczytem RUN HUD a głębszym przetwarzaniem pyłów w SUB-META.

## 12. Powiązanie z kartami i SUB-META

Komety nie są zwykłymi kartami R1–R4.

Mogą być powiązane z:
- kartami specjalnymi,
- kartami eventowymi,
- przyszłymi slotami efektów świata,
- konfiguracją ŚWIAT w SUB-META,
- wybranymi osiami PRG, jeśli dotyczą nakierowywania trajektorii.

Możliwe role kart:
- karta może odblokowywać sterowanie kometą życia,
- karta może zwiększać kontrolę nad transformacją,
- karta może pokazywać wcześniej typ nadchodzącej komety,
- karta może subtelnie wpływać na trajektorię komety.

Te powiązania nie zmieniają kanonu kart R1–R4. Wymagają osobnego projektu kart specjalnych lub eventowych.

## 13. Debug i balans — robocze parametry

Parametry, które powinny być później widoczne w debug lub łatwe do strojenia:

- `cometsEnabled`
- `baseCometSpawnChance`
- `iceCometChance`
- `fireCometChance`
- `lifeCometChance`
- `transformCometChance`
- `cometMinMass`
- `cometMaxMass`
- `cometMinSpeed`
- `cometMaxSpeed`
- `frozenDustSlowdownMultiplier`
- `frozenDustDensityMultiplier`
- `lifeCloudDissolveRate`
- `fireDustIgnitionDuration`
- `transformCloudMutationChance`
- `iceWaterSeedChance`
- `lifeSeedRequiresWater`
- `fireScorchLifeAlways`
- `ignitedPlanetDuration`
- `redDustToRingDelay`
- `gasStarMassThreshold`
- `lifeCometTurnsIgnitedGasToStar`
- `transformUseWeightedRandom`
- `transformCanChangeObjectClass`
- `transformCanCreateMixedDust`

Nazwy są robocze. Nie są jeszcze API runtime.

## 14. Rekomendowana kolejność implementacji

1. Etap 1: dokument i model stanów.
2. Etap 2: audyt obecnego `hc.comets.js`.
3. Etap 3: typy komet bez pełnych efektów.
4. Etap 4: interakcje meteorów i chmur pyłu.
5. Etap 5: asteroidy i księżyce.
6. Etap 6: planety skaliste, woda, życie, planety gazowe i gwiazdy.
7. Etap 7: karta sterowania kometą życia.

Każdy etap po dokumencie powinien mieć osobny audyt runtime, checklistę konfliktów i minimalny debug widocznych stanów.

## 15. Otwarte ryzyka przed implementacją

Do późniejszego audytu wymagane są:
- aktualny stan `hc.comets.js` i jego relacja z meteorami, asteroidami, pyłem oraz planetami,
- sposób przechowywania stanów świata i ich serializacji/debugowania,
- tabela transformacji dla komety transformującej,
- warunki masy planety gazowej i przemiany w gwiazdę,
- rozdział efektów świata od HUD zbierającego jeden kolor bazowy naraz,
- relacja sterowania kometą życia z PRG i kartą specjalną,
- czytelność visual dla stanów `frozen`, `ignited`, `scorched`, `water_seeded`, `life_seeded` i `transformed`.
