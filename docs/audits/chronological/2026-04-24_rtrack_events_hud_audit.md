# 2026-04-24 — R-track events/HUD audit (Krok 6)

## 1. EXECUTIVE SUMMARY

Przeprowadzono audyt runtime, eventów debugowych i HUD dla kontraktu R-track po krokach 4/5.

Wynik:
- logika przejęcia kierunku po obcym kolorze działa spójnie dla R1/R2/R3/R4 (ten sam hit obcego koloru staje się hit1 nowej sekwencji),
- fail głębszych etapów rozlicza się automatycznie, bez zatrzymania strumienia gameplay,
- HUD pokazuje nowy kierunek natychmiast po failu (bez „martwego resetu”),
- dodano lekki test automatyczny smoke dla scenariuszy takeover/fail R1–R4,
- doprecyzowano payloady eventów fail/takeover i debug overlay, by łatwiej odczytać „fail + nowy hit1”.

## 2. Sprawdzone dokumenty

- `AGENTS.md`
- `README.md`
- `docs/README.md`
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/systems/PRG_SYSTEM.md`
- `tests/README.md`
- `tests/cards_sequence_three_hit_manual_checklist.md`

Weryfikacja dokumentacji:
- CARDS/UI/ECONOMY opisują już kontrakt „obcy kolor nie przepada” i auto-fail na głębszych etapach.
- checklista manualna była niepełna dla R4 oraz części eventów/HUD; została rozszerzona.

## 3. Sprawdzone miejsca w kodzie

- `cards.js`
  - `onHitColor(...)`
  - `canStartStepWithColor(...)`
  - `closeSequenceStep(...)`
  - `failSequence(...)`
  - `resetSequenceState(...)`
  - emiter eventów sekwencyjnych (`emitSequenceEvent(...)`)
- `hc.collisions.js`
  - `notifyHitColor(...)`
  - `resolveMeteorCollisionsSafe(...)`
- `hc.debug.js`
  - snapshot runtime debug (`Session.getRuntimeSnapshot()`)
- `hc.ui_debug.js`
  - render sekcji „Sequence” w runtime debug overlay

## 4. Scenariusze R1/R2/R3/R4/AA/AAA

### R1
- `A A A` — zgodne (hit1/hit2/hit3 i zamknięcie kroku).
- `A B B B` — zgodne (B przejmuje kierunek jako hit1 bez straty hitu).
- `A A B B B` — zgodne (B przejmuje kierunek po hit2 A).

### R2
- `A A A B B C C C` — zgodne: C przerywa B, fail rozliczony automatycznie, C = hit1 nowej sekwencji.
- `A A A B B C D D D` — zgodne: podwójne przejęcie C→D bez „pustego” resetu.

### R3
- `A A A B B B C C D D D` — zgodne: D po przerwaniu C jest natychmiast hit1 nowej sekwencji.

### R4
- `A A A B B B C C C D D E E E` (E jako powrót do dostępnego koloru) — zgodne: fail R4 auto-rozliczony, E = hit1 nowej sekwencji.

### AA / AAA
- runtime wspiera pętlę AA/AAA i eventy loop (`sequence.loop_aa_*`, `sequence.loop_aaa_*`, `sequence.ds_granted`).
- checklista została rozszerzona o przypadki przerwania AA/AAA przez obcy kolor.

## 5. Wynik runtime

- Przepływ `onHitColor(...)` po mismatch na głębszym etapie:
  1) emituje odrzucenie/mismatch,
  2) wywołuje `failSequence(...)`,
  3) natychmiast startuje nowy kierunek na tym samym hicie (`hits=1`, `phase=DIR`).
- Brak konieczności dodatkowego trafienia po failu.
- `canStartStepWithColor(...)` oraz `closeSequenceStep(...)` pozostają spójne z kontraktem 3-hit.

## 6. Wynik eventów debugowych

Przed poprawką w tym kroku eventy miały mniej kontekstu dla automatycznego faila.

W tym kroku doprecyzowano payloady:
- `sequence.fail_detected`: dodano `interruptedColor`, `interruptedStepIndex`.
- `sequence.fail_resolved`: dodano `stage`, `interruptedColor`, `interruptedStepIndex`, `autoResolved=true`.
- `sequence.direction_locked` po failu (`reason=post-fail-direction-takeover`): dodano `takeoverFromStage`, `takeoverFromStepIndex`, `takeoverAfterFail=true`.

Dzięki temu debug jednoznacznie pokazuje:
- który kolor/etap został przerwany,
- że fail został rozliczony automatycznie,
- który kolor natychmiast przejął kierunek jako hit1.

## 7. Wynik HUD / overlay

- HUD RUN utrzymuje zgodność z runtime:
  - po hit1 pokazuje kierunek (`sequenceDirectionColor` / obrys),
  - po hit2 uruchamia puls,
  - po hit3 działa flash + logika overlay kroku.
- Po failu głębszego etapu, nowy kierunek pojawia się od razu (bez oczekiwania na dodatkowe trafienie).

Dodatkowo rozszerzono runtime debug overlay o pola:
- `phase`, `track`, `stepIndex`, `current`,
co ułatwia audyt spójności HUD/event/runtime.

## 8. Test automatyczny — czy dodany / dlaczego nie

Dodano lekki test automatyczny:
- `tests/cards_sequence_rtrack_takeover_smoke.test.js`

Zakres testu:
- `A B B B`,
- `A A A B B C C C`,
- `A A A B B B C C D D D`,
- scenariusz fail R4 z natychmiastowym nowym hit1.

Test działa bez budowy nowej infrastruktury (Node + `assert`, minimalny bootstrap `window`).

## 9. Zmiany w plikach

- `cards.js`
  - doprecyzowane payloady eventów fail/takeover.
- `hc.debug.js`
  - rozszerzony snapshot sekwencji (`phase`, `track`, `stepIndex`, `currentColor`).
- `hc.ui_debug.js`
  - rozszerzona sekcja „Sequence” overlay o dodatkowe pola stanu.
- `tests/cards_sequence_rtrack_takeover_smoke.test.js`
  - nowy test smoke dla takeover/fail.
- `tests/cards_sequence_three_hit_manual_checklist.md`
  - rozszerzenie scenariuszy o R4/AA/AAA + oczekiwane eventy debugowe + oczekiwany HUD.
- `tests/README.md`
  - dopisanie nowego testu smoke.

## 10. Ryzyka i pytania otwarte

- Test smoke opiera się na lekkim bootstrapie `window` w Node (dobry do regresji logiki sekwencji, ale nie zastępuje testu integracyjnego renderu).
- Dla pełnego potwierdzenia UX nadal potrzebna okresowa walidacja manualna HUD w aktywnym RUN.

## 11. Rekomendowany następny krok

Brak dużych rozjazdów w audytowanym zakresie.

Rekomendacja:
- utworzenie `docs/current/maps/DEPENDENCY_MAP.md` w następnym kroku.
