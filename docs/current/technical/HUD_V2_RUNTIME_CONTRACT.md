# Haiku Cosmos - HUD_V2_RUNTIME_CONTRACT

> Status: ROBOCZY / KONTRAKT TECHNICZNY HUD v2
> Obszar: runtime HUD/sekwencje/view-model
> Źródło prawdy: NIE dla finalnej mechaniki; TAK roboczo dla mapowania runtime -> HUD v2 implementation pass
> Ostatnia aktualizacja: 2026-05-03
> Powiązane dokumenty: ../ui/HUD_SYSTEM.md, ../ui/UI_WORLD.md, ../systems/CARDS_SYSTEM.md, ../systems/ECONOMY_SYSTEM.md, ../systems/SUB_META_SYSTEM.md, WORLD_FUNCTION_MAP.md, IMPLEMENTATION_TRACKER.md, LIVE_VALIDATION_PACK.md

## 1. Cel kontraktu

Celem dokumentu jest przygotowanie bezpiecznego passu implementacyjnego HUD v2 bez zmiany mechaniki runtime.

HUD v2 ma zastąpić stary prawy panel prostokątów DR jako główny kierunek runtime HUD.
Najpierw musi powstać czytelny model stanów (view-model), a dopiero potem docelowa warstwa visual.

Zakres:
- TAK: mapowanie runtime, kontrakt danych i plan etapowania.
- NIE: finalna mechanika, finalny balans, finalne assety visual.

## 2. Obecny stan runtime (audit)

### 2.1 Gdzie dziś renderowany jest HUD i sekwencja

- Główne wejście renderu kart/HUD: `CardEngine.render(ctx, view.w, view.h)` wywoływane z `HC.UI.update(...)` w `hc.ui_debug.js`.
- W `cards.js` funkcja `render()` wywołuje kolejno:
  - `renderSequenceOverlay(...)` (duże centralne okno decyzji),
  - `renderSequenceToast(...)` (krótkie toasty),
  - `renderPack01Collection(...)` (prawy pion prostokątów DR + liczniki + pulsy),
  - `renderSubMetaOverlay(...)` (overlay SUB-META).

### 2.2 Gdzie jest prawy panel prostokątów / liczniki / pulsy

`renderPack01Collection(...)` w `cards.js` renderuje obecny fallback HUD:
- 4 pionowe prostokąty (red/yellow/green/blue),
- licznik R1 DR per kolor (`getCardCount(..., "R1", ..., { availableOnly: true })`),
- pulsy sekwencji z `World.sequencePulseColors`,
- flash/halo z `World.sequenceFlashColors`,
- sygnał kierunku z `World.sequenceDirectionColor`,
- legacy pulse R1 z `World.r1HudPulse`,
- paski timerów aktywacji z `World.runColorTimers` + `World.runColorDurations`.

### 2.3 Gdzie jest pending card / decision window

- Decision window: `state.sequenceOverlay` + `renderSequenceOverlay(...)`.
- Pending karta runtime: `World.pendingCard` + `World.pendingCardUntilMs`.
- Obsługa pending i timeout:
  - `setPendingChoiceCard(...)`,
  - `flushPendingCard(...)`,
  - `consumePendingCard(...)`.

### 2.4 Gdzie obsługiwane są kliknięcia aktywacji/kolekcji

- Kliki decision window są obsługiwane przez pointer-path w `cards.js` (layout przycisków z `getSequenceOverlayLayout(...)`) i zamykają się przez logikę sekwencji.
- Aktywacja R1 jest spięta przez `activateSequenceR1(...)` -> `onRunActivateR1(...)`.
- Cashout/collect flow używa `cashoutSequence(...)` + reward commit/reset.

### 2.5 cardsPool/cardBank/timery R1

- Canonical magazyn kart: `World.cardsPool[]`.
- Licznik pochodny: `World.totalCards` (recompute helper).
- `World.cardBank` istnieje głównie jako migracyjny/legacy reset compatibility.
- Timery aktywacji:
  - lokalny timer R1: `World.r1ColorTimers` przez `startR1TimerForColor(...)`,
  - runtime timer używany przez HUD/spawn: `World.runColorTimers`, `World.runColorDurations` (RunTimers / slot effects integration).

### 2.6 Canonical state vs derived visual state

Canonical (mechanika):
- `CardEngine.state.sequence` (track, stage, step, chain, resolution),
- `World.cardsPool`,
- `World.pendingCard`, `World.pendingCardUntilMs`,
- `state.sequenceOverlay` (okno decyzji),
- `World.runColorTimers`, `World.runColorDurations`.

Derived (visual sygnały HUD):
- `World.sequencePulseColors`,
- `World.sequenceFlashColors`,
- `World.sequenceDirectionColor`,
- `World.r1HudPulse`,
- etykiety etapu z helperów (`getSequenceStage(...)`, label mapping).

## 3. Runtime vs HUD_SYSTEM.md (delta)

### 3.1 Co da się wykorzystać

- Istniejący SoT sekwencji (`CardEngine.state.sequence`) i event timeline.
- Istniejące dane kart (pool + pending + tier/kind/colors).
- Istniejące timery RUN (`runColorTimers`, `runColorDurations`).
- Istniejące reguły A-loop/R-track/decision window (bez zmiany mechaniki).

### 3.2 Co jest legacy i powinno być zastąpione

- Główny prawy HUD oparty o 4 wąskie prostokąty DR (`renderPack01Collection`) jako primary UX.
- Monolityczne centralne decision window jako główny nośnik decyzji.
- Sygnały `sequencePulseColors/flash` traktowane jako final UI, zamiast jako wejście do nowego view-modelu.

### 3.3 Co wymaga nowego view-modelu

- Spięcie etapów sekwencji z per-kolorowym stanem rombu.
- Mikrodecyzje osadzone przy kolorze (aktywowalność R1 vs collect-ready R2/R3/R4).
- Jawny status `diamondState`/`hitProgress`/`pendingDecisionUntilMs` per kolor.
- Rozdział panelu sekwencji od przyszłych slotów specjalnych.

### 3.4 Co zależy od ekonomii karta vs combo

- Reguła: collect R2/R3/R4 vs kontynuacja chain/combo (zależne od `ECONOMY_SYSTEM.md` pass runtime).
- Sposób naliczania i moment wypłat RP przy decyzji collect/continue.
- W tym kontrakcie: tylko miejsca integracji, bez zmiany mechaniki.

### 3.5 Co zależy od trwałości/stabilizacji kart

- Pola i UI dla durability/stabilization kart w HUD/SUB-META sync.
- W tym kontrakcie: tylko rezerwacja pól modelu i etap planu.

## 4. Docelowy HUD v2 view-model (render-agnostic)

## HUDV2ViewModel

- `rp: number`
- `sequenceRows: SequenceRowVM[4]`
- `activeColor: ColorKey | null`
- `sequenceLevel: number`
- `sequencePath: "R_TRACK" | "A_LOOP" | "IDLE"`
- `pendingCollect: PendingCollectVM | null`
- `pendingActivation: PendingActivationVM | null`
- `specialSlots: SpecialSlotVM[3]`
- `timers: HudTimerVM`
- `warnings: string[]`
- `debug: Record<string, unknown>`

## SequenceRowVM (dla każdego koloru)

- `colorKey`
- `hasR1Card`
- `r1Count`
- `isCollecting`
- `hitProgress` (0/1/2/3)
- `stageLabel` (`IDLE`/`R1`/`AA`/`AAA`/`R2`/`R3`/`R4`)
- `diamondState` (`empty`/`collecting`/`ready`/`active`/`disabled`/`locked`)
- `canActivateR1`
- `canCollectCard`
- `collectCardId`
- `collectTier`
- `pendingDecisionUntilMs`
- `timerRatio`
- `pulseState`
- `flashState`

Kontrakt mapowania:
- SoT pozostaje w `CardEngine.state.sequence` + `World.cardsPool` + `state.sequenceOverlay/pending`.
- View-model jest wyłącznie adapterem danych na potrzeby HUD v2.
- Fallback render (etap 2) i asset render (etap 7) czytają ten sam view-model.

## 5. Rozdział zasad (HUD v2)

1. R1 activation z rombu: dozwolone tylko jeśli karta R1 istnieje w puli i spełnia warunki runtime.
2. R2/R3/R4 collect-only: brak aktywacji RUN; tylko collect decision.
3. Special slots: osobny dolny panel (3 sloty), niezależny od panelu 4 kolorów.
4. Karta vs combo: osobny economy sync pass; nie implementować w tym etapie.
5. Trwałość/stabilizacja: future pass; nie zmieniać teraz runtime.

## 6. Plan implementacji etapowej

1. Etap 1 — view-model bez zmiany visual.
2. Etap 2 — fallback render HUD v2 prostymi shape'ami canvas/DOM, bez assetów.
3. Etap 3 — mikrointerakcje: pipsy, pulsy, flash, timer.
4. Etap 4 — collect button R2/R3/R4.
5. Etap 5 — sloty specjalne.
6. Etap 6 — trwałość/stabilizacja kart.
7. Etap 7 — visual asset integration / FrameComposer / SVG.

## 7. Ryzyka

- Rozjazd między `CardEngine.state.sequence` a polami pochodnymi `World.*`.
- Obecny pending/decision window jest monolityczny i centralny; trudniejsza ekstrakcja.
- Ryzyko mieszania `cardsPool` (mechaniczny magazyn) z czysto visual state.
- Ryzyko przypadkowej zmiany ekonomii przy patchu HUD.
- Brak finalnych assetów rombów i przycisków micro.

## 8. Minimalne testy przyszłego patcha

- hit1/hit2/hit3 dla jednego koloru,
- R1 -> AA -> AAA -> DS,
- R2 collect-ready,
- R3 collect-ready,
- R4 collect-ready,
- przerwanie sekwencji przez obcy kolor,
- R1 activation z posiadanej karty,
- HUD nie pokazuje starego modelu jako głównego.

## 9. Granice kontraktu

Ten dokument nie implementuje HUD v2 i nie zmienia runtime behavior.
To przygotowanie pod przyszły patch implementacyjny.


## 10. Etap 1 status (2026-05-03)

- Status: **implemented (partial)**.
- Dodano runtime adapter `hc.hud_v2.js` z API `HC.HUDV2.buildViewModel(World, CardEngine, nowMs)`.
- Adapter jest render-agnostic i read-only wobec `World`/`CardEngine` (bez akcji, eventów i mutacji `cardsPool`).
- `specialSlots[3]` są placeholderami: `empty`, `locked`, `unavailable`.
- Ograniczenie: runtime ma pojedynczy `World.pendingCard`/`pendingCardUntilMs`, więc rozdział collect-ready R2/R3/R4 jest semantyczny (per `kind`) bez osobnych kanałów per-tier/per-kolor.
- Ograniczenie: `pendingCard` jest centralnym decision window contractem; pełna ekstrakcja pod per-row mikrodecyzje wymaga osobnego passu runtime.
