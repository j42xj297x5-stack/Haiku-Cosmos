# Haiku Cosmos - HUD_SYSTEM

> Status: ROBOCZY / KIERUNEK HUD v2
> Obszar: UI / RUN HUD / sekwencje / decyzje mikro
> Źródło prawdy: TAK roboczo dla nowego kierunku HUD v2; NIE dla runtime implementation; NIE dla finalnego balansu
> Ostatnia aktualizacja: 2026-05-03
> Powiązane dokumenty: UI_WORLD.md, ../systems/CARDS_SYSTEM.md, ../systems/ECONOMY_SYSTEM.md, ../systems/SUB_META_SYSTEM.md, ../visual/MODULAR_FRAME_KIT.md, ../visual/SVG_ASSET_STANDARDS.md

## 1. Cel dokumentu

Ten dokument definiuje roboczy kierunek **RUN HUD v2**.

HUD v2 **zastępuje** stary koncept prawych prostokątów DR jako prostych liczników magazynu i traktuje prawą stronę HUD jako panel:
- sekwencji,
- aktywacji,
- mikrodecyzji.

HUD pozostaje minimalistyczny i nie zasłania świata.

## 2. Prawy panel sekwencji i decyzji (HUD v2)

Przy prawej krawędzi ekranu znajdują się **cztery pionowe wyciągnięte romby kolorów**:
- RED,
- YELLOW,
- GREEN,
- BLUE.

Proporcja robocza pojedynczego rombu/karty: około **1:3**.

Każdy romb:
1. jest aktywatorem koloru/karty **R1** (jeśli karta jest w magazynie),
2. pokazuje stan sekwencji dla danego koloru,
3. jest nośnikiem mikrodecyzji (aktywacja vs kontynuacja sekwencji / zbieranie R2-R4).

## 3. Warstwy znaczenia rombu

Każdy romb komunikuje stan wielowarstwowo:
- **wnętrze rombu** = stan posiadanej karty/aktywatora,
- **obwódka rombu** = stan aktualnej sekwencji,
- **pipsy/kropki** = postęp `hit1/3`, `hit2/3`, `hit3/3`,
- **ikona karty obok** = możliwa karta do zebrania,
- **label etapu** = `R1 / AA / AAA / R2 / R3 / R4`.

## 4. Stany rombu (roboczy katalog)

HUD v2 przewiduje następujące stany:
- brak karty i brak sekwencji,
- ustanowienie kierunku (`hit1/3`),
- otwarcie kroku (`hit2/3`),
- zamknięcie kroku (`hit3/3`),
- `R1` gotowe,
- `AA` gotowe,
- `AAA / DS`,
- `R2` gotowe do zebrania,
- `R3` gotowe do zebrania,
- `R4` gotowe do zebrania,
- karta `R1` w magazynie i równoczesne zbieranie tego samego koloru,
- aktywna karta `R1` / timer działania,
- `disabled / locked / brak aktywacji`.

## 5. Model decyzji HUD v2

Rezygnujemy z dużego modelu „ekran pokazujący zebraną kartę i możliwość kolekcji lub uruchomienia” jako głównej formy HUD.

Nowy kierunek:
- decyzje są małe, kontekstowe i osadzone przy prawym HUD,
- `R1` może być aktywowana bezpośrednio z rombu, jeśli jest w magazynie,
- `R2/R3/R4` nie są aktywowane w RUN,
- `R2/R3/R4` mogą być jedynie zebrane przyciskiem **„Zbierz”**,
- przy ikonach kart `R2/R3/R4` pojawia się mikroprzycisk **„Zbierz”**,
- brak zebrania oznacza kontynuację sekwencji i ryzyko.

## 6. Zasada ekonomiczno-decyzyjna (do synchronizacji z ECONOMY_SYSTEM)

Kierunek roboczy:
- gracz wybiera między **materializacją karty** a **utrzymaniem ciągu/combo**,
- zebranie karty `R2/R3/R4` nie wypłaca dodatkowego combo punktowego za ten poziom,
- jeśli gracz idzie wyżej i sekwencja zostanie przerwana, wypłacana jest tylko premia combo oraz częściowe karty `R1` zgodnie z poziomem przerwania.

To jest nowy kierunek i wymaga osobnego passu runtime/balance.

## 7. Dolny panel: sloty kart specjalnych/eventowych

Pod rombami znajdują się **3 sloty kart specjalnych/eventowych**.

Zasady robocze:
- sloty pokazują karty wybrane w SUB-META jako szybkie aktywatory HUD,
- jeśli gracz ma więcej kart specjalnych, wybiera w SUB-META, które 3 są przypięte do HUD,
- przyszłe centrum rezonansu SUB-META powinno zawierać miejsce/sloty do zarządzania tym zestawem,
- finalne cooldowny, zużycie i balans nie są jeszcze definiowane.

## 8. Kierunek visual dla HUD v2

HUD v2 podlega rodzinie **minimal / sequence**:
- cienka linia,
- brak agresywnego neonu,
- runtime tinting,
- warstwy `static_base / accent / state_layer`,
- romby techniczne, ale spójne z rytualnym minimalizmem kosmicznym.

Przyszłe assety wymagane pod HUD v2:
- `hud_sequence_diamond`,
- `hud_sequence_pips`,
- `hud_collect_button_micro`,
- `hud_special_card_slot`.

## 9. Granice dokumentu

Ten dokument:
- nie zmienia runtime,
- nie zmienia JS/HTML/CSS,
- nie zmienia assetów,
- nie definiuje finalnych wartości balansu,
- nie zmienia zasady, że tylko `R1` są aktywowalne w RUN.

## 10. Snapshot runtime HUD raster top layer — 2026-06-04

Runtime top HUD używa trzech natywnie renderowanych rasterów z `public/png/`:
- `hud_haiku_cosmos_logo.png` — identyfikacja gry w lewym górnym narożniku; element nieklikalny.
- `hud_submeta_top.png` — przycisk wejścia do SUB-META wyśrodkowany na górze ekranu; tekst jest częścią grafiki, a runtime zachowuje dotychczasową logikę otwierania SUB-META.
- `hud_rp.png` — panel RP w prawym górnym narożniku; grafika zawiera napis RP, więc runtime renderuje na niej wyłącznie wartość punktów w złotym kolorze.

Pozycje runtime dla tego snapshotu:
- logo: lewy górny narożnik HUD, natywny rozmiar `261x130`;
- SUB-META: środek górnej krawędzi, natywny rozmiar `195x130`, hitbox zgodny z grafiką;
- RP: prawy górny narożnik HUD, natywny rozmiar `279x130`.

Debug UI (`DEBUG`, FPS i `Restart`) zostało przeniesione z lewego górnego rogu na lewy dół ekranu, żeby nie kolidować z logo. Tymczasowe prostokąty stanu sekwencji po prawej stronie zaczynają się poniżej wysokości nowego HUD-u (`130px`) z bezpiecznym marginesem, żeby nie nachodziły na panel RP. Ten snapshot nie zmienia mechaniki RP, SUB-META, PRG ani sekwencji.

## 11. Nota synchronizacyjna: pył HUD/PRG vs future `cosmic dust`

- HUD/PRG zbiera tylko `harmonicDust`, czyli jedyny zbieralny kolorowy pył świata.
- `cosmic dust` nie jest zasobem HUD, nie trafia do reservoir i nie powinien pojawić się jako stosik/depozyt.
- `GRAY/mixed reservoir` to stan zasobnika po pomieszaniu kolorów, nie fizyczny `cosmic dust`.
- `gray_locked harmonicDust` w świecie wymaga osobnej decyzji: albo reguły collection dla zablokowanej chmury, albo przyszłej konwersji do niezbieralnego `cosmic dust`.
