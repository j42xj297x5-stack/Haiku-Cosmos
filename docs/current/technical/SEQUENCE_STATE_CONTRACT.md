> Status: ROBOCZY / KONTRAKT TECHNICZNY
> Obszar: sekwencja runtime (source-of-truth contract)
> Źródło prawdy: NIE (dokument pomocniczy do walidacji technicznej)
> Ostatnia aktualizacja: 2026-04-25
> Powiązane dokumenty: WORLD_FUNCTION_MAP.md, IMPLEMENTATION_TRACKER.md, LIVE_VALIDATION_PACK.md, ../systems/CARDS_SYSTEM.md, ../systems/ECONOMY_SYSTEM.md, ../ui/UI_WORLD.md

# Sequence State Contract

## 1. Cel

Ten dokument techniczny porządkuje **runtime source-of-truth sekwencji** oraz zasady czytania evidence.
Nie zmienia kanonu mechaniki (kanon pozostaje w `docs/current/systems/*` i `docs/current/ui/*`).

## 2. Single source of truth

Aktywnym source-of-truth sekwencji runtime jest:

- **`CardEngine.state.sequence`** (`cards.js`).

To pole opisuje aktualny stan automatu sekwencji (track, step, phase, hity, chain itd.).

## 3. Derived runtime fields (niekanoniczne źródła sekwencji)

Pola poniżej są **pochodne** (UI/HUD/pomocnicze) i nie zastępują SoT:

- `World.sequencePulseColors`,
- `World.sequenceFlashColors`,
- `World.pendingCard`,
- `World.pendingCardUntilMs`,
- `World.r1HudPulse`.

Zasada: jeżeli pola pochodne są niespójne z `CardEngine.state.sequence`, prawdą runtime jest `CardEngine.state.sequence`.

## 4. Evidence timeline: event stream > final snapshot

Do analizy przebiegu sekwencji używamy:

- `events_jsonl` jako timeline zdarzeń (kolejność, frame, sessionTimeMs).

`final_snapshot`:
- jest stanem końcowym sesji,
- nie jest osią czasu.

## 5. Czego nie wolno wyciągać z samego `final_snapshot`

Bez odczytu JSONL nie wolno rozstrzygać:

- czy fail i takeover nastąpiły na tym samym hicie,
- czy decyzja była left/right/timeout,
- czy chain multiplier RP zadziałał na właściwym etapie,
- czy sekwencja weszła/opuściła AA/AAA w oczekiwanym momencie.

## 6. Relacje do dokumentów kanonicznych

- `CARDS_SYSTEM.md` — definiuje oczekiwany kontrakt sekwencji i reward logic.
- `ECONOMY_SYSTEM.md` — definiuje oczekiwane zasady RP/mnożników.
- `UI_WORLD.md` — definiuje oczekiwane sygnały HUD/overlay i flow decyzji.

Ten kontrakt techniczny tylko mapuje, **gdzie w runtime i evidence** te reguły mają być obserwowalne.

## 7. Required diagnostic events for A-loop evidence

Dla diagnostyki pętli A (`A -> AA -> AAA -> DS -> IDLE`) wymagane są eventy:

- `sequence.decision_window_opened` (payload okna decyzji i offeredActions),
- `sequence.decision_window_timeout` (jawna kontynuacja po TTL),
- `sequence.decision_window_closed` (powód i wybrana akcja),
- `sequence.a_loop_entered` lub diagnostycznie `sequence.continuation_resolved`,
- `sequence.ds_granted` (source=`AAA`, delta kart, kontekst sekwencji),
- `sequence.reset_to_idle` (powód + snapshot po resecie).

Bez tych eventów analiza timeline może pozostać nierozstrzygająca, ponieważ sam `final_snapshot` nie pokazuje przebiegu decyzji i timeoutów.

## 8. Routing kontraktowy po timeout po R1(A) i AA

Po zamknięciu `R1(A)` i timeout/no-click:

- runtime nie powinien z góry wymuszać `R-track`,
- routing rozstrzyga się dopiero na **następnym hit1**:
  - ten sam kolor `A` => `A-loop` (`AA`),
  - inny kolor => `R-track` (`R2`).

Po zamknięciu `AA` i timeout/no-click:

- ten sam kolor `A` => `AAA`,
- inny kolor => fail A-loop + takeover tego trafienia jako hit1 nowego kierunku.

W obu przypadkach nie może występować „martwe trafienie”; hit rozstrzygający routing liczy się jako hit1 kroku docelowego.
