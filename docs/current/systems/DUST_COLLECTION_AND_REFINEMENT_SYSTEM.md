# Haiku Cosmos — DUST COLLECTION AND REFINEMENT SYSTEM

> Status: ROBOCZY / KANDYDAT DO KANONU / PRZED RUNTIME
> Obszar: pył / HUD collection / Magazyn / Kuźnia / stabilizatory slotów
> Źródło prawdy: NIE, dopóki dokument nie zostanie zatwierdzony i zsynchronizowany z runtime
> Powiązane dokumenty: `CARD_SLOT_NETWORK_SYSTEM.md`, `SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`, `ECONOMY_SYSTEM.md`, `SUB_META_SYSTEM.md`, `../ui/UI_WORLD.md`, `../ui/SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`, `../ui/SUB_META_V2_MASTER_SPEC.md`, `../maps/PROJECT_INDEX.md`, `../maps/DEPENDENCY_MAP.md`

---

## A. Cel dokumentu

Ten dokument doprecyzowuje pętlę zbierania i rafinacji pyłu:

```text
meteor → pył → HUD stosik → depozyt → Magazyn → Kuźnia → flakon/naczynie → kryształ → stabilizator slotu
```

Dokument oddziela cztery obszary, które wcześniej mogły mieszać się w opisach:

* **HUD collection** — zbieranie surowego pyłu do aktualnego stosiku,
* **Magazyn** — przechowywanie zdeponowanych pełnych stosików pyłu,
* **Kuźnię** — alchemiczną rafinację stosików w flakon/naczynie i flakonów/naczyń w kryształ,
* **stabilizatory slotów** — użycie pyłu, flakonu/naczynia albo kryształu przy kartach w slotach.

Dokument jest wyłącznie dokumentacyjny i nie implementuje runtime.

---

## B. Zasada nadrzędna

HUD zbiera tylko surowy pył do stosiku.

Zasady graniczne:

* HUD nie zbiera bezpośrednio do flakonu/naczynia.
* HUD nie zbiera bezpośrednio do kryształu.
* Flakon/naczynie i kryształ są produktami Kuźni.
* Bazowy HUD na początku gry obsługuje zbieranie stosiku pyłu, a nie produkcję stabilizatorów wyższego rzędu.

---

## C. Pętla pyłu

1. Kolizja meteorów generuje chmurkę albo ślad pyłu.
2. Gracz zbiera pył z chmurki.
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

## E. Kolor stosiku

* Stosik może być przypisany do koloru pyłu.
* Na starcie gracz zbiera jeden kolor naraz.
* Aby dokończyć stosik koloru A, gracz musi zebrać pył koloru A.
* Mieszanie kolorów i szary pył pozostają osobnym balansem/ekonomią, jeśli opisują je inne dokumenty.
* Tej decyzji nie należy automatycznie rozszerzać na multi-color HUD bez osobnego passu.

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

## J. Karty specjalne a zbieranie pyłu

Future direction:

* Późniejsze karty specjalne mogą zwiększać ilość zbieranego pyłu.
* Jedna karta specjalna może zwiększać procent przyrostu stosiku.
* Inna karta specjalna może automatycznie zbierać pył, gdy pojawia się chmurka.
* Kolejne warianty mogą umożliwiać auto-zbieranie jednego, dwóch albo trzech kolorów.
* Te efekty nie są bazowym HUD, tylko rozszerzeniami z wiedzy/umiejętności.

---

## K. Granice dokumentu

Ten dokument:

* nie implementuje HUD,
* nie tworzy masek ani assetów,
* nie definiuje finalnych kosztów Kuźni,
* nie zmienia runtime,
* nie zmienia JSON/settings,
* nie rozstrzyga finalnego multi-color collection,
* nie rozstrzyga finalnego visual zasobnika.
