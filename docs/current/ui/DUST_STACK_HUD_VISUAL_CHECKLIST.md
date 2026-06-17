# Haiku Cosmos — DUST STACK HUD VISUAL CHECKLIST

> Status: ROBOCZY / CHECKLISTA UI-VISUAL / HUD PYŁU / PRZED ASSETAMI / PRZED RUNTIME
> Obszar: HUD / stosik pyłu / maska napełnienia / depozyt
> Źródło prawdy: NIE, checklista przygotowawcza przed asset pass i runtime
> Powiązane dokumenty: `../systems/DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`, `../systems/ECONOMY_SYSTEM.md`, `../systems/CARD_SLOT_NETWORK_SYSTEM.md`, `../systems/SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`, `UI_WORLD.md`, `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`, `SUB_META_V2_MASTER_SPEC.md`, `../visual/VISUAL_EXECUTION_GUIDE.md`, `../visual/SVG_ASSET_STANDARDS.md`

---

## 1. Cel dokumentu

Ten dokument przygotowuje visual/UI dla HUD stosiku pyłu zgodnie z `../systems/DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`.

Celem jest opisanie, jak bazowy HUD ma komunikować:

* ikonę aktualnego stosiku surowego pyłu,
* kolor pyłu aktualnie zbieranego do stosiku,
* postęp napełnienia `0–100%`,
* roboczą maskę albo warstwę visual w krokach co `10%`,
* odczyt procentowy,
* szczególny stan `80%` po ukończonej sekwencji,
* stan `100%` i gotowość do depozytu,
* relację stosiku HUD do Magazynu i Kuźni.

Dokument nie jest assetem, layout tokenem, runtime contract ani finalnym projektem HUD. Jest checklistą decyzji i stanów przed przyszłym asset pass.

---

## 2. Granice

Ten dokument:

* nie implementuje HUD,
* nie tworzy assetów,
* nie tworzy masek PNG/SVG,
* nie zmienia layout tokens,
* nie zmienia runtime,
* nie zmienia JS, CSS, JSON ani settings,
* nie definiuje finalnego stylu ikony,
* nie projektuje finalnego HUD,
* nie obejmuje flakonu/naczynia ani kryształu jako celów HUD collection,
* nie tworzy flakonu/naczynia ani kryształu jako HUD collection target,
* nie rozstrzyga multi-color collection jako bazowego modelu,
* nie zmienia kosztów ani balansu Kuźni,
* nie oznacza tej checklisty jako kanonu.

Flakon/naczynie i kryształ należą do Kuźni, Magazynu i slotu jako stabilizatory wyższego poziomu. Nie należą do bazowego HUD zbierania surowego pyłu.

---

## 3. Model HUD stosiku

Bazowy model HUD stosiku:

* HUD pokazuje tylko aktualny stosik surowego pyłu.
* Stosik ma kolor aktualnie zbieranego pyłu.
* Stosik ma postęp `0–100%`.
* Pełny stosik może zostać zdeponowany do Magazynu.
* Po depozycie HUD stosik wraca do pustego albo do stanu gotowości na kolejny kolor.
* HUD nie pokazuje rafinacji do flakonu/naczynia ani do kryształu.

Przepływ visual/UI pozostaje prosty:

```text
pył w świecie → aktualny stosik w HUD → 100% → depozyt → Magazyn → Kuźnia
```

---

## 4. Stany stosiku

Lista stanów visual do uwzględnienia przed asset pass:

* **Brak aktywnego stosiku** — HUD nie ma przypisanego koloru albo nie rozpoczęto zbierania pyłu.
* **Aktywny pusty stosik `0%`** — istnieje slot/ikona stosiku, ale nie ma jeszcze widocznego napełnienia.
* **Częściowy stosik `10–70%`** — stosik rośnie w czytelnych krokach, bez sygnału finalności.
* **Stosik po ukończonej sekwencji `80%`** — sekwencja została zakończona, ale stosik nie jest pełny.
* **Stosik prawie pełny `90%`** — ostatni etap przed pełnym stosikiem.
* **Pełny stosik `100%`** — stosik jest gotowy jako pełna jednostka pyłu.
* **Gotowy do depozytu** — `100%` może otrzymać spokojny sygnał gotowości i/lub akcję `Zdeponuj`.
* **Zdeponowany** — pełny stosik został przeniesiony do Magazynu.
* **Reset po depozycie** — HUD nie pokazuje już częściowego stosiku po depozycie; wraca do pustego lub neutralnego stanu.
* **Niezgodny kolor / próba zebrania innego koloru** — future stan ostrzegawczy albo blokujący, gdy aktywny stosik ma już przypisany kolor.
* **Future: auto-collection z karty specjalnej** — dodatkowy stan aktywności efektu karty, poza bazowym modelem HUD stosiku.

---

## 5. Maska `0–100%` co `10%`

Roboczy model napełnienia:

* Visual napełnienia jest roboczo podzielony na `10` kroków między pustym a pełnym stosikiem.
* Każdy krok odpowiada `10%`.
* Maska może odsłaniać coraz większą część stosiku.
* Alternatywnie może rosnąć ilość cząstek albo ziaren pyłu.
* Na tym etapie nie wybieramy finalnej techniki.
* Maska musi być czytelna w małej skali HUD.
* Wariant finalny wymaga osobnego asset/readiness/token pass.

Robocza tabela stanów napełnienia:

| Procent | Roboczy opis visual |
| --- | --- |
| `0%` | pusty / kontur / cień stosiku |
| `10%` | minimalny pył |
| `20%` | niski stosik |
| `30%` | wyraźny zaczątek |
| `40%` | mały stosik |
| `50%` | połowa |
| `60%` | ponad połowa |
| `70%` | prawie sekwencja |
| `80%` | ukończona sekwencja |
| `90%` | prawie pełny |
| `100%` | pełny stosik / gotowy do depozytu |

---

## 6. Stan `80%`

`80%` wymaga osobnego rozpoznania visual, bo jest stanem ważnym mechanicznie i komunikacyjnie:

* `80%` oznacza ukończoną sekwencję.
* `80%` nie jest jeszcze pełnym stosikiem.
* Gracz musi zebrać pył tego samego koloru jeszcze przynajmniej raz.
* Visual `80%` powinien być rozpoznawalny jako „sekwencja zakończona, ale stosik niepełny”.
* Visual `80%` nie powinien wyglądać jak finalny stan depozytu.
* `80%` nie powinno używać tego samego sygnału gotowości co `100%`.

Przykładowy kierunek do późniejszego passu: `80%` może mieć spokojny akcent potwierdzenia sekwencji, ale bez pełnego obramowania, bez przycisku `Zdeponuj` i bez sygnału finalnej pełności.

---

## 7. Stan `100%` i depozyt

`100%` oznacza pełny stosik pyłu:

* `100%` oznacza pełny stosik.
* Pełny stosik może pokazać spokojny sygnał gotowości.
* Może pojawić się akcja albo przycisk `Zdeponuj`.
* Po depozycie pełny stosik trafia do Magazynu.
* HUD nie pokazuje już częściowego stosiku po depozycie.
* Visual depozytu powinien być czytelny, ale nie agresywny.
* Depozyt nie jest rafinacją i nie tworzy flakonu/naczynia ani kryształu.

Stan `100%` powinien odróżniać się od `80%` przede wszystkim komunikatem kompletności i gotowości do przeniesienia pełnej jednostki do Magazynu.

---

## 8. Kolor pyłu

Zasady koloru stosiku:

* Stosik przyjmuje kolor zbieranego pyłu.
* Kolory bazowe: `RED` / `YELLOW` / `GREEN` / `BLUE`.
* Szary pył, jeśli występuje, jest osobnym stanem albo typem.
* Mieszanie i multi-color collection nie są bazowym modelem tej checklisty.
* Próba zebrania innego koloru przy aktywnym stosiku powinna mieć future stan ostrzegawczy albo blokujący.
* Ten dokument nie rozstrzyga, czy szary pył używa osobnej ikony, osobnego materiału, czy wariantu koloru.

Kolor ma wspierać szybkie rozpoznanie, który stosik gracz aktualnie wypełnia. Nie powinien sugerować, że HUD miesza kolory w jednym bazowym stosiku.

---

## 9. Procentowy odczyt

Ten dokument dopuszcza pokazanie procentu, ale nie zamyka finalnej decyzji:

* Normalny HUD może pokazywać procent albo tylko maskę — do decyzji visual.
* Debug powinien pokazywać procent jednoznacznie.
* Jeśli normal HUD pokazuje procent, powinien być mały i nie dominować ikony.
* Procent nie powinien zastępować czytelności maski w małej skali.
* Finalna decyzja wymaga osobnego readiness/token pass.

Minimalny wymóg komunikacyjny: `80%` i `100%` muszą być jednoznaczne w debug, a w normalnym HUD muszą być rozpoznawalne co najmniej przez maskę/warstwę visual.

---

## 10. Relacja do Magazynu

Relacja HUD stosiku do Magazynu:

* Magazyn przechowuje tylko pełne stosiki po depozycie.
* HUD pokazuje stosik w trakcie zbierania.
* Po depozycie Magazyn dostaje pełną jednostkę.
* Magazyn nie musi pokazywać częściowego postępu HUD.
* Depozyt jest granicą między tymczasowym stanem HUD a przechowywaną jednostką zasobu.

Magazyn nie przejmuje maski `0–100%` z HUD jako obowiązkowego elementu visual. Może pokazywać liczbę pełnych stosików lub osobne stany magazynowe w przyszłym dokumencie.

---

## 11. Relacja do Kuźni

Relacja HUD stosiku do Kuźni:

* Kuźnia używa pełnych stosików z Magazynu.
* `3 stosiki pyłu = 1 flakon/naczynie`.
* `3 flakony/naczynia = 1 kryształ`.
* HUD nie tworzy flakonu/naczynia ani kryształu.
* HUD collection kończy się na pełnym stosiku i depozycie.
* Rafinacja jest osobną czynnością Kuźni, a nie stanem ikony stosiku HUD.

Ta checklista nie zmienia kosztów Kuźni ani balansu rafinacji.

---

## 12. Karty specjalne — future visual

Future direction dla kart specjalnych:

* Karta specjalna może zwiększać ilość zbieranego pyłu.
* Karta specjalna może automatycznie zbierać pył po pojawieniu się chmurki.
* Karta specjalna może umożliwiać auto-zbieranie `1` / `2` / `3` kolorów.
* Future UI będzie musiało pokazać aktywność takich efektów.
* Nie jest to bazowy stan HUD stosiku.
* Auto-collection nie powinna być projektowana jako domyślne zachowanie stosiku bez osobnego passu mechaniki, visual i runtime.

Future visual może potrzebować osobnych znaczników aktywności, zasięgu kolorów, automatycznego pobrania i konfliktu koloru, ale ten dokument ich nie projektuje.

---

## 13. Decyzje do zamknięcia przed asset pass

Checklist przed asset pass:

- [ ] Czy stosik ma być ikoną pyłu jako mały kopczyk?
- [ ] Czy maska odsłania kopczyk od dołu do góry?
- [ ] Czy maska jest clip-maską, alpha-maską czy warstwą?
- [ ] Czy normal HUD pokazuje procent liczbowy?
- [ ] Jak wygląda `80%`?
- [ ] Jak wygląda `100%`?
- [ ] Jak wygląda `Zdeponuj`?
- [ ] Jak pokazać próbę zebrania innego koloru?
- [ ] Czy szary pył używa osobnej ikony czy wariantu koloru?
- [ ] Czy kroki co `10%` wymagają `11` assetów, jednej maski runtime, czy SVG z kontrolą wypełnienia?

---

## 14. Dokumenty powiązane

* `../systems/DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`
* `../systems/ECONOMY_SYSTEM.md`
* `../systems/CARD_SLOT_NETWORK_SYSTEM.md`
* `../systems/SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`
* `UI_WORLD.md`
* `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`
* `SUB_META_V2_MASTER_SPEC.md`
* `../visual/VISUAL_EXECUTION_GUIDE.md`
* `../visual/SVG_ASSET_STANDARDS.md`
