# Haiku Cosmos — DUST COLLECTION AND REFINEMENT SYSTEM

> Status: ROBOCZY / KANDYDAT DO KANONU / PRZED RUNTIME
> Obszar: pył / HUD collection / Magazyn / Kuźnia / stabilizatory slotów
> Źródło prawdy: TAK ROBOCZO, dla kontraktu jednego zbieralnego kolorowego pyłu; NIE dla kompletności runtime
> Powiązane dokumenty: `CARD_SLOT_NETWORK_SYSTEM.md`, `SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`, `ECONOMY_SYSTEM.md`, `SUB_META_SYSTEM.md`, `../ui/UI_WORLD.md`, `../ui/SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`, `../ui/SUB_META_V2_MASTER_SPEC.md`, `../maps/PROJECT_INDEX.md`, `../maps/DEPENDENCY_MAP.md`

---

## A. Cel dokumentu

Ten dokument doprecyzowuje pętlę zbierania i rafinacji pyłu:

```text
meteor same-color harmonic collision → harmonicDust / kolorowy pył → ręczne zebranie PRG → HUD reservoir / stosik → depozyt → Magazyn → Kuźnia → flakon/naczynie → kryształ → stabilizator slotu
```

Dokument oddziela cztery obszary, które wcześniej mogły mieszać się w opisach:

* **HUD collection** — zbieranie surowego pyłu do aktualnego stosiku,
* **Magazyn** — przechowywanie zdeponowanych pełnych stosików pyłu,
* **Kuźnię** — alchemiczną rafinację stosików w flakon/naczynie i flakonów/naczyń w kryształ,
* **stabilizatory slotów** — użycie pyłu, flakonu/naczynia albo kryształu przy kartach w slotach.

Dokument jest wyłącznie dokumentacyjny i nie implementuje runtime.

---

## B. Zasada nadrzędna

Istnieje tylko jeden typ zbieralnego kolorowego pyłu: **kolorowy pył / `harmonicDust`**. Nie istnieje osobny drugi zbieralny typ „ordinary colored dust clouds” obok `harmonicDust`.

Zasady graniczne:

* Kolorowy pył / `harmonicDust` powstaje po harmonicznym zderzeniu meteorów tego samego koloru.
* Kolorowy pył pojawia się w świecie jako chmura/obiekt pyłu.
* `harmonicDust` jest wysokoenergetyczny: jest materiałem zbieralnym i rezonansowym, ale nie jest fizycznym hamulcem świata.
* Docelowo gracz zbiera ten pył ręcznie przez PRG; auto/test collection jest domyślnie wyłączone i nie jest docelowym modelem.
* `harmonicDust` nie spowalnia, nie zatrzymuje i nie wywołuje drag na obiektach świata.
* HUD reservoir / stosik przyjmuje zebrany kolorowy pył i pokazuje postęp `0–100%`.
* HUD nie zbiera bezpośrednio do flakonu/naczynia ani kryształu.
* Jeśli gracz zbiera pył innego koloru niż aktywny kolor zasobnika, zasobnik przechodzi w `GRAY/mixed reservoir`.
* `GRAY/mixed reservoir` może być błędem gracza albo celową decyzją przy zbieraniu kolorowego pyłu.
* `GRAY/mixed reservoir` jest stanem zasobnika HUD; nie jest `cosmic dust` i nie jest fizyczną chmurą kosmicznego pyłu.
* Flakon/naczynie i kryształ są produktami Kuźni.
* Bazowy HUD obsługuje surowy kolorowy pył / `harmonicDust`, a nie produkcję stabilizatorów wyższego rzędu.

---

## C. Pętla pyłu

1. Harmoniczne zderzenie meteorów tego samego koloru generuje chmurę/obiekt kolorowego pyłu / `harmonicDust`.
2. Docelowo gracz zbiera kolorowy pył ręcznie przez PRG; aktualne automatyczne/testowe zbieranie jest tylko tymczasowym modelem runtime.
3. Pył trafia do aktualnego HUD stosiku.
4. HUD stosik ma postęp `0–100%`.
5. Po osiągnięciu `100%` gracz może zdeponować stosik.
6. Po zdeponowaniu pełny stosik trafia do Magazynu.
7. Stosiki w Magazynie mogą być użyte w Kuźni.
8. Kuźnia przekształca:
   * `3 stosiki pyłu` w `1 flakon/naczynie`,
   * `3 flakony/naczynia` w `1 kryształ`.
9. Pył, flakon/naczynie i kryształ mogą potem działać jako stabilizatory slotów zgodnie z `CARD_SLOT_NETWORK_SYSTEM.md` i `SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`.

---

## D. Postęp stosiku w HUD

* Jedna ukończona sekwencja daje `80%` stosiku.
* Aby uzyskać `100%`, trzeba jeszcze przynajmniej raz zebrać pył danego koloru.
* Postęp stosiku jest pokazywany procentowo.
* Roboczy visual step to co `10%`.
* Postęp może być pokazany maską albo warstwą visual na ikonie stosiku.
* Finalna ikonografia, maska i warstwa visual wymagają osobnego visual/UI passu.

Ta sekcja nie tworzy layout tokens, masek, assetów ani finalnego HUD.

---

## E. Kolor stosiku i `GRAY/mixed reservoir`

* HUD reservoir / stosik ma aktywny kolor: `RED`, `YELLOW`, `GREEN` albo `BLUE`.
* Aby dokończyć stosik koloru A, gracz musi zebrać pył koloru A.
* Model przyrostu `10/20/50` pozostaje aktualnym modelem reservoir: pierwsze zgodne zebranie daje `10%`, drugie `20%`, trzecie i kolejne `50%`.
* Jedna pełna sekwencja daje `80%` stosiku; dalsze zebranie tego samego koloru może dokończyć stosik do `100%`.
* Po `100%` możliwy jest depozyt pełnego stosiku.
* Jeśli gracz zbiera kolorowy pył innego koloru niż aktywny kolor zasobnika, zasobnik przechodzi w `GRAY/mixed reservoir`.
* `GRAY/mixed reservoir` jest skutkiem błędu albo celowej decyzji gracza przy zbieraniu kolorowego pyłu.
* `GRAY/mixed reservoir` pozostaje stanem HUD reservoir / stosiku, nie osobną chmurą świata.
* `GRAY/mixed reservoir` nie jest `cosmic dust`, nie jest fizyczną chmurą kosmicznego pyłu i nie może być mylony z przyszłym niezbieralnym pyłem świata.
* Nie wolno rozdzielać `harmonicDust` i „zwykłego” kolorowego pyłu na dwa różne zbieralne zasoby.

---

## F. Magazyn

* Magazyn przechowuje pełne stosiki pyłu.
* Stosik pojawia się w Magazynie dopiero po depozycie z HUD.
* Magazyn nie musi pokazywać częściowych stosików HUD.
* Pełny stosik jest jednostką wejściową dla Kuźni.

---

## G. Kuźnia

* Kuźnia tworzy flakon/naczynie z `3 pełnych stosików pyłu`.
* Kuźnia tworzy kryształ z `3 flakonów/naczyń`.
* Te wartości są robocze i powinny być debug/balance tunable w przyszłości.
* Kuźnia jest miejscem alchemicznej rafinacji, nie HUD.

---

## H. Flakon / naczynie

* Flakon/naczynie jest drugą formą stabilizatora.
* Nie powstaje w HUD.
* Powstaje z `3 stosików pyłu` w Kuźni.
* Może później stabilizować kartę w slocie.

---

## I. Kryształ

* Kryształ jest trzecią formą stabilizatora.
* Nie powstaje w HUD.
* Powstaje z `3 flakonów/naczyń` w Kuźni.
* Jest najbardziej skondensowaną formą stabilizacji.

---

## J. Elastic gray shift — odwracalne szarzenie `harmonicDust`

Szarzenie `harmonicDust` przed wejściem w `cosmic dust` jest procesem elastycznym, a nie natychmiastową konwersją zasobu HUD w fizyczny pył świata.

* Przechodzące obiekty mogą zakłócać harmoniczną formę chmury `harmonicDust`.
* Zakłócenie zależy od `dust.density`, `body.speed`, `overlapRatio` i `exposureTime`.
* `grayMixRatio` w zakresie `0..1` opisuje stopień utraty harmoniczności chmury.
* Jeśli obiekt wyjdzie z chmury przed progiem pełnej przemiany, pył powinien wrócić do pierwotnej harmonicznej formy.
* Recovery trwa około `2× exposureTime`, czyli krótka ekspozycja daje krótki powrót, a długa ekspozycja wymaga dłuższego uspokojenia formy.
* Jeśli `grayMixRatio` osiągnie próg pełnej przemiany, chmura może zostać oznaczona jako `gray_locked` / `futureCosmicCandidate`.
* `gray_locked` nadal ma `type:"harmonic_dust"` / `dustKind:"harmonic"` i nadal nie jest `cosmic dust`, dopóki przyszły patch jawnie go nie przekonwertuje.
* `harmonicDust`, także podczas `gray_shifting`, `recovering` albo `gray_locked`, nie spowalnia i nie zatrzymuje obiektów.

Bezpieczny słownik stanów chmury `harmonicDust`:

* `harmonic` — bazowy kolorowy, wysokoenergetyczny, zbieralny stan pyłu.
* `gray_shifting` — aktywne zakłócanie chmury przez przechodzące ciało.
* `recovering` — odwracalny powrót do pierwotnej formy po zbyt krótkiej ekspozycji.
* `gray_locked` — zablokowany szary stan chmury harmonicznej po osiągnięciu progu.
* `futureCosmicCandidate` — znacznik przyszłej kwalifikacji do konwersji; nie jest osobnym typem pyłu runtime.

Nie mieszać pojęć:

* `GRAY/mixed reservoir` to stan zasobnika HUD po pomieszaniu kolorów.
* `gray_shifting` / `gray_locked harmonicDust` to stan chmury pyłu w świecie.
* `cosmic dust` to przyszły niezbieralny pył fizyczny świata.

## K. Cosmic dust — rozdział pojęć

* `cosmic dust` jest drugim, osobnym typem pyłu świata kosmosu.
* `cosmic dust` jest niezbieralny i nie trafia do HUD reservoir.
* `cosmic dust` wpływa tylko na obiekty świata, np. przez spowolnienie, kondensację albo inne przyszłe efekty fizyczne.
* `cosmic dust` nie jest `GRAY/mixed reservoir`.
* `cosmic dust` nie jest kolorowym pyłem / `harmonicDust` zbieranym ręcznie przez PRG.
* Fundament `cosmic dust` wymaga osobnego przyszłego patcha runtime.

## L. Karty specjalne a zbieranie pyłu

Future direction:

* Późniejsze karty specjalne mogą zwiększać ilość zbieranego pyłu.
* Jedna karta specjalna może zwiększać procent przyrostu stosiku.
* Inna karta specjalna może automatycznie zbierać pył, gdy pojawia się chmurka.
* Kolejne warianty mogą pomagać w wyborze albo automatycznym zebraniu właściwego pojedynczego koloru; auto-collection wielu kolorów naraz jest future/legacy idea i nie należy do bazowego HUD.
* Te efekty nie są bazowym HUD, tylko rozszerzeniami z wiedzy/umiejętności.

---

## M. Granice dokumentu

Ten dokument:

* nie implementuje HUD,
* nie tworzy masek ani assetów,
* nie definiuje finalnych kosztów Kuźni,
* nie zmienia runtime,
* nie zmienia JSON/settings,
* nie rozstrzyga finalnego UI mieszania kolorów w SUB-META / Kuźni,
* nie rozstrzyga finalnego visual zasobnika.
