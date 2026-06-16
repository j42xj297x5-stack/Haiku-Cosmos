# Card durability layout-token readiness — karta R

> Status: ROBOCZY / CHECKLISTA GOTOWOŚCI / PRZED LAYOUT TOKENS / PRZED RUNTIME
> Obszar: UI / SUB-META / czteroelementowy slot / trwałość karty R
> Źródło prawdy: NIE dla layout tokens, NIE dla JSON/settings, NIE dla placeholderów, NIE dla runtime, NIE dla mechaniki, NIE dla assetów; TAK roboczo jako checklista gotowości przed przyszłym layout-token pass
> Powiązane dokumenty: `CARD_DURABILITY_WIREFRAME_PASS.md`, `CARD_DURABILITY_VISUAL_DECISION.md`, `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`, `../systems/SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`, `../systems/CARD_SLOT_NETWORK_SYSTEM.md`, `SUB_META_V2_MASTER_SPEC.md`, `UI_WORLD.md`, `../technical/CENTER_BASED_POSITIONING_SPEC.md`, `../technical/FRAME_COMPOSER_SPEC.md`

## 1. Cel dokumentu

Ten dokument przygotowuje przyszły layout-token pass dla visual trwałości karty R opisanej w `CARD_DURABILITY_WIREFRAME_PASS.md`.

Jego celem jest wypisanie minimalnych danych, decyzji, nazw roboczych, stanów i zależności, które muszą być gotowe zanim powstaną właściwe layout tokens, placeholdery albo JSON.

Dokument sam nie tworzy tokenów. Jest checklistą gotowości i materiałem wejściowym dla osobnego przyszłego passu layoutowego.

## 2. Granice

Ten dokument:

- nie jest layout tokenem,
- nie zmienia JSON/settings,
- nie zmienia placeholderów,
- nie implementuje runtime,
- nie tworzy assetów,
- nie generuje SVG/PNG/WebP,
- nie zmienia layout tokens,
- nie rozstrzyga finalnego layoutu całego czteroelementowego slotu,
- dotyczy tylko gotowości dla visual trwałości karty R.

Nie należy na jego podstawie zmieniać JS, CSS, JSON, settings, placeholderów ani katalogów assetów. Dokument nie oznacza kanonu finalnego layoutu ani mechaniki trwałości.

## 3. Zatwierdzony roboczy kierunek wejściowy

Wejściowy kierunek z `CARD_DURABILITY_WIREFRAME_PASS.md`:

- wariant C: hybryda paska trwałości i progowej degradacji,
- pasek trwałości przy prawej krawędzi karty R,
- normal UI bez procentu,
- debug UI z procentem,
- degradacja progowa,
- blizna slotu poza kartą R,
- stabilizator ma osobny wskaźnik zużycia.

## 4. Minimalne elementy, które przyszłe tokeny muszą opisać

### A. `cardDurabilityBar`

Przyszły token lub zestaw tokenów musi opisać:

- pozycję względem karty R,
- krawędź: `right`,
- szerokość,
- wysokość,
- inset od krawędzi karty,
- margines górny/dolny,
- kierunek odczytu,
- warstwę `z-index` / `zLayer`,
- widoczność w normal/debug.

### B. `cardDegradationOverlay`

Przyszły token lub zestaw tokenów musi opisać:

- obszar nakładki na kartę R,
- granice wewnątrz ramki karty,
- safe inset,
- `z-index` / `zLayer` względem grafiki karty i paska,
- warianty progowe,
- `opacity` / intensity per próg,
- placeholder dla przyszłego SVG/PNG overlay.

### C. `cardDurabilityDebugLabel`

Przyszły token lub zestaw tokenów musi opisać:

- pozycję tekstu procentowego,
- widoczność tylko debug,
- rozmiar,
- safe area,
- relację do paska i degradacji.

### D. `cardCrackState`

Przyszły token lub zestaw tokenów musi zostawić miejsce na:

- przyszły visual pęknięcia karty,
- jasne rozdzielenie pęknięcia karty od blizny slotu,
- status: future / not implemented.

### E. `slotScarVisualArea`

Przyszły token lub zestaw tokenów musi rozróżnić:

- obszar poza kartą R,
- przynależność do gniazda/slotu,
- fakt, że blizna slotu nie jest częścią degradacji karty,
- status: future visual pass.

### F. `stabilizerWearIndicator`

Przyszły token lub zestaw tokenów musi rozróżnić:

- osobny wskaźnik stabilizatora,
- zakaz używania paska trwałości karty R jako wskaźnika stabilizatora,
- status: future checklist.

## 5. Minimalne stable IDs / nazewnictwo robocze

Robocze ID do potwierdzenia przed tokenami:

- `card.r.durability.bar`
- `card.r.degradation.overlay`
- `card.r.durability.debug_label`
- `card.r.crack_state`
- `slot.scar.visual_area`
- `stabilizer.wear.indicator`

Jeżeli przyszła dokumentacja layoutowa będzie używać stylu `submeta.*`, warianty scoped do potwierdzenia:

- `submeta.slot.card_r.durability_bar`
- `submeta.slot.card_r.degradation_overlay`
- `submeta.slot.card_r.debug_durability_label`
- `submeta.slot.card_r.crack_state`
- `submeta.slot.scar_visual_area`
- `submeta.slot.stabilizer_wear_indicator`

Nazwy są robocze i nie tworzą jeszcze kontraktu runtime. Nie należy ich traktować jako finalnych ID JSON, selectorów CSS ani nazw placeholderów.

## 6. Minimalne pola przyszłego tokenu

Przyszły token lub zestaw tokenów prawdopodobnie będzie wymagać pól:

- `id`,
- `role`,
- `parent`,
- `anchor`,
- `edge`,
- `rectMode`,
- `mountCenter`,
- `mountSize`,
- `inset`,
- `zLayer`,
- `visibilityMode`,
- `debugOnly`,
- `normalOnly`,
- `stateBinding`,
- `thresholdBinding`,
- `opacity`,
- `minSize`,
- `densityBehavior`,
- `notes`.

To jest lista gotowości, nie finalny schema. Pola muszą zostać zweryfikowane względem center-based positioning, aktualnego master spec SUB-META i przyszłego formatu tokenów.

## 7. Stany, które tokeny muszą obsłużyć

Robocze nazwy stanów do obsłużenia przez przyszły layout-token pass:

- `durability_100_80_clean`,
- `durability_79_60_dirty`,
- `durability_59_40_scratched`,
- `durability_39_30_cracked`,
- `durability_below_30_critical`,
- `durability_0_break`,
- `tension_active`,
- `debug_visible`,
- `normal_visible`,
- `card_missing`,
- `slot_sleeping`.

Nazwy stanów są robocze. Nie są finalnym kontraktem mechaniki, runtime ani balansu.

## 8. Relacje warstw

Przyszłe tokeny powinny zachować minimalną kolejność warstw na karcie R:

1. card base,
2. card color/tier visual,
3. degradation overlay,
4. durability bar,
5. tension accent,
6. debug label.

Dodatkowe rozdzielenie:

- scar visual nie jest na karcie,
- scar visual należy do slot frame / socket layer,
- stabilizer wear ma osobną warstwę.

## 9. Gęstości i skalowanie

Readiness przed layout-token pass musi uwzględnić:

- small density: pasek może być jedynym czytelnym wskaźnikiem,
- medium density: pasek + subtelna degradacja,
- large density: pasek + pełniejsze warstwy degradacji,
- debug może być czytelny tylko w medium/large,
- mobile/compact pozostaje future.

Decyzje density muszą zachować semantykę elementów nawet wtedy, gdy część warstw wizualnych zostanie ukryta albo uproszczona.

## 10. Decyzje wymagane przed właściwym layout-token pass

Przed utworzeniem właściwych layout tokens trzeba potwierdzić:

- [ ] finalną nazwę ID dla durability bar,
- [ ] czy pasek jest wewnątrz karty czy na jej krawędzi/ramce,
- [ ] minimalną szerokość paska,
- [ ] czy debug label siedzi na karcie czy poza kartą,
- [ ] czy degradation overlay ma jeden rect czy kilka warstw,
- [ ] czy threshold states są nazwane po procentach czy po nazwach jakościowych,
- [ ] czy tension accent ma osobny token,
- [ ] czy scar visual area będzie częścią slot frame,
- [ ] czy stabilizer wear dostaje osobny token już w pierwszym passie.

## 10A. Zatwierdzone decyzje readiness przed layout-token pass

Projektant zatwierdza poniższy minimalny zestaw decyzji jako roboczą gotowość przed przyszłym layout-token pass. Zatwierdzenie nie tworzy layout tokens, JSON/settings, placeholderów, assetów ani runtime i nie oznacza finalnego kanonu mechaniki.

### 10A.1. Scoped ID paska trwałości

- Finalny roboczy scoped ID dla paska trwałości karty R to `submeta.slot.card_r.durability_bar`.
- ID jest wejściem do przyszłych layout tokens.
- ID nie jest jeszcze selektorem CSS, kluczem JSON/settings, placeholderem ani bindingiem runtime.

### 10A.2. Pozycja paska trwałości

- Pasek jest wewnętrznym elementem karty R.
- Pasek znajduje się przy prawej krawędzi karty R.
- Pasek nie należy do ramy slotu.
- Pasek nie jest częścią slot scar visual.
- Pasek nie jest wskaźnikiem stabilizatora.

### 10A.3. Szerokość paska

- Roboczy zakres szerokości paska to 2–4 px zależnie od density/skali.
- Dokładna wartość zostanie wybrana dopiero w przyszłym token/layout pass.
- Readiness zatwierdza tylko zakres, nie finalny rect ani finalny token.

### 10A.4. Debug label

- Procent trwałości jest widoczny tylko w debug.
- Debug label nie należy do normal UI.
- Preferowane położenie debug label: poza główną grafiką karty albo w debug overlay.
- Debug label nie może zasłaniać koloru, tieru ani znaku karty.

### 10A.5. Degradation overlay

- Startowo degradation overlay jest jednym rectem obejmującym powierzchnię karty R.
- Rect mieści się wewnątrz ramki karty.
- Rect używa safe inset.
- Overlay może później zostać rozbity na kilka warstw.
- Overlay nie jest blizną slotu.

### 10A.6. Threshold states

- Nazwy jakościowe pozostają preferowane dla visual.
- Zakresy procentowe opisują progi, ale nie są nazwą mechaniki.
- Używać nazw jakościowych typu `clean`, `dirty`, `scratched`, `cracked`, `critical`, `break`.
- Nie wiązać tych nazw jeszcze z finalnym balansem runtime.

### 10A.7. Tension accent

- Tension accent wymaga osobnego future token.
- Tension accent nie może być mieszany z durability bar.
- Readiness rezerwuje tylko relację warstw względem paska i degradacji.

### 10A.8. Scar visual

- Scar visual jest częścią slot frame / socket layer.
- Scar visual nie należy do card R degradation overlay.
- Scar visual wymaga osobnego future visual/token pass.

### 10A.9. Stabilizer wear

- Stabilizer wear dostanie osobny future token.
- Stabilizer wear nie należy do pierwszego durability-only token pass.
- Readiness rezerwuje nazwę i relację, żeby nie pomylić stabilizer wear z `submeta.slot.card_r.durability_bar`.

## 11. Kolejność przyszłych prac

Proponowana kolejność po tym dokumencie:

1. zatwierdzić readiness checklist,
2. przygotować layout-token draft bez runtime,
3. przygotować placeholder/token JSON pass,
4. przygotować debug preview / evidence pass,
5. dopiero potem runtime binding.

## 12. Dokumenty powiązane

- `CARD_DURABILITY_WIREFRAME_PASS.md`,
- `CARD_DURABILITY_VISUAL_DECISION.md`,
- `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`,
- `../systems/SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`,
- `../systems/CARD_SLOT_NETWORK_SYSTEM.md`,
- `SUB_META_V2_MASTER_SPEC.md`,
- `../technical/CENTER_BASED_POSITIONING_SPEC.md`,
- `../technical/FRAME_COMPOSER_SPEC.md`.
