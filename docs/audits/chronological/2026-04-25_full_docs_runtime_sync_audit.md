# 2026-04-25 — Full docs/runtime sync audit (pre-design gate)

## 1. EXECUTIVE SUMMARY

**Ocena ogólna: PARTIAL**

### Najważniejsze wnioski
- Kanon dokumentacji jest formalnie dobrze zdefiniowany (root README → docs README → docs/current README → PROJECT_INDEX/DEPENDENCY_MAP), ale runtime nie pokrywa pełnego zakresu kanonu systemowego (zwłaszcza R2 runtime activation, pełna ekonomia RP wg mnożników, część SUB-META/PRG). 
- Sekwencyjny silnik 3-hit (hit1/hit2/hit3) i takeover kierunku po failu jest zaimplementowany w `cards.js` i ma podstawowe evidence (test smoke + fallback evidence pack z 2026-04-24). 
- Debugger/evidence jest używalny i zawiera eventy sequence/fail/takeover, ale final snapshot jest „stanem końcowym” i bywa mylący dla analizy momentu zdarzenia; odtworzenie scenariuszy wymaga JSONL event streamu.
- Techniczne mapy w `docs/current/technical/*` są poprawnie oznaczone jako ROBOCZE, ale częściowo zaniżają skalę braków (np. sugerują większą gotowość PRG/SUB-META niż wynika z runtime).

### Co jest kanonem
- **KANON:** `docs/current/systems/CARDS_SYSTEM.md`, `ECONOMY_SYSTEM.md`, `SUB_META_SYSTEM.md`, `ui/UI_WORLD.md`, mapy `PROJECT_INDEX.md`, `DEPENDENCY_MAP.md`.
- **KANON STRUKTURALNY / DO STROJENIA:** `PRG_SYSTEM.md`.
- **ROBOCZY:** `docs/current/technical/*`, `systems/ROADMAP.md`.
- **KIERUNEK:** `docs/current/visual/*`.
- **LEGACY/EVIDENCE:** `docs/legacy/*`, `docs/audits/*` historyczne, `logs/*`.

### Co faktycznie działa (runtime)
- Loop init/update/render/reset, kolizje meteorów i przekazywanie hitów do sekwencji.
- Sequence core: 3-hit, close step, fail resolution, takeover po mismatch, R-track (R1..R4) i A-loop (AA/AAA) w logice `cards.js`.
- Pending decision overlay (lewa/prawa/brak kliknięcia) i cash-out path.
- Debug session + event logger + export evidence.

### Czego nie stroić bez patcha mechaniki
- Mnożniki ekonomii ciągów (ECONOMY §4–§6) nie są pełnie odwzorowane deklaratywnie w runtime.
- R2 jako aktywacja runtime (dedykowany efekt) jest stubem (`onRunActivateR2` zwraca false).
- PRG toggle jako mechanika runtime oparta o aktywne wiązanie nie jest kompletna (UI sygnalizuje, runtime nie konsumuje pełnego modelu).

---

## 2. SOURCE OF TRUTH MAP

| Dokument | Status | Zakres prawdy | Zgodność z runtime | Uwagi |
|---|---|---|---|---|
| `README.md` | mapa repo | wysoka | OK | wskazuje `docs/current` jako źródło prawdy |
| `docs/README.md` | mapa dokumentacji | wysoka | OK | rozdziela current/legacy/audits |
| `docs/current/README.md` | KANON | statusy i struktura | OK | poprawnie klasyfikuje technical jako ROBOCZY |
| `docs/current/maps/PROJECT_INDEX.md` | KANON | indeks kanonu | OK | spójny z `docs/current/README.md` |
| `docs/current/maps/DEPENDENCY_MAP.md` | KANON | relacje systemów i dokumentów | PARTIAL | relacje poprawne, ale runtime coverage PRG/R2 optymistyczny |
| `docs/current/systems/CARDS_SYSTEM.md` | KANON | mechanika kart/sekwencji | PARTIAL | R-track/3-hit zgodny; część operacyjna DS/AA wymaga większego live evidence |
| `docs/current/systems/ECONOMY_SYSTEM.md` | KANON | RP i koszty | MISMATCH | koszty slotów/forge są obecne, ale mnożniki i chain economy niepełne |
| `docs/current/systems/SUB_META_SYSTEM.md` | KANON | struktura SUB-META | PARTIAL | struktura slotów jest częściowo; R2 relational runtime niepełny |
| `docs/current/systems/PRG_SYSTEM.md` | KANON STRUKTURALNY | osie/wiązania PRG | PARTIAL | struktura osi jest, ale runtime toggle/wiązania ograniczone |
| `docs/current/ui/UI_WORLD.md` | KANON | UI flow i komunikacja | PARTIAL | wiele elementów istnieje, część HUD/overlay zgodna, część layoutu SUB-META różni się |
| `docs/current/technical/WORLD_FUNCTION_MAP.md` | ROBOCZY | orientacyjna mapa runtime | PARTIAL | część trafna, ale ma nieaktualny komentarz o `/md` w HTML i drobne przesunięcia |
| `docs/current/technical/IMPLEMENTATION_TRACKER.md` | ROBOCZY | status prac | PARTIAL | prawidłowo oznacza „do weryfikacji”, ale zbyt ogólnie o PRG/R-track completeness |
| `docs/current/technical/LIVE_VALIDATION_PACK.md` | ROBOCZY | kontrakt evidence | PARTIAL | kontrakt sensowny, lecz repo ma fallback pack zamiast `logs/runs/*` |
| `docs/audits/chronological/*2026-04-24*` | evidence | historyczny kontekst | PARTIAL | wartościowe, ale nie zastępują bieżącej walidacji na aktualnym HEAD |
| `docs/legacy/*` | legacy | brak prawdy projektowej | N/A | używać tylko jako kontekst historyczny |

---

## 3. RUNTIME ENTRYPOINT MAP

### Kolejność ładowania modułów (`index.codex.html`)
`hc.debug.js` → `cards.js` → `hc.core.js` → `hc.util.js` → `hc.world.js` → `hc.view_input.js` → `hc.camera.js` → `hc.comets.js` → `hc.meteors.js` → `hc.render.js` → `hc.collisions.js` → `hc.asteroids.js` → `hc.planets.js` → `hc.stars_epoch.js` → `hc.ui_debug.js` → `game.boot.js`.

### Init → update → render → reset
- **Init:** `game.boot.js` buduje World/View/Input/Camera, inicjuje moduły `HC.init*`, UI i binduje CardEngine.
- **Update:** Camera → Input world coords → Meteors → Comets → Collisions → Asteroids capture/update → Planets capture/update → Stars update → CardEngine.update.
- **Render:** `HC.Render.frame`, potem `HC.UI.update` i `CardEngine.render`.
- **Reset:** `resetWorld` w `game.boot.js`, dodatkowo wrapped przez `hc.world.js` (reset timerów/slot effects/cardsPool/pending).

### Główne zależności
- `hc.collisions.js` jest źródłem hitów kolorów (`CardEngine.onHitColor`).
- `cards.js` jest jedynym realnym silnikiem sekwencji i SUB-META state.
- `hc.debug.js` jest wspólnym backendem telemetrycznym, konsumowanym przez `cards.js`, `hc.ui_debug.js`, światowe moduły.

---

## 4. SEQUENCE ENGINE AUDIT

### 4.1 Atomowy kontrakt 3-hit
| Punkt | Expected (KANON) | Observed (runtime) | Evidence | Status | Ryzyko | Next step |
|---|---|---|---|---|---|---|
| hit1/hit2/hit3 | hit1=dir, hit2=open, hit3=close | `onHitColor` realizuje `DIR/OPEN/CLOSE`; `closeSequenceStep` domyka krok | `cards.js` (`onHitColor`, `closeSequenceStep`) | OK | niskie | utrzymać test smoke + live replay |

### 4.2 Takeover obcego koloru
| Punkt | Expected | Observed | Evidence | Status | Ryzyko | Next step |
|---|---|---|---|---|---|---|
| obcy kolor przerywa i staje się hit1 | brak martwego resetu | mismatch przy `mode=IN_STEP` uruchamia fail + restart i natychmiastowe `DIR` na tym samym hicie | `cards.js:onHitColor`, eventy `sequence.fail_*`, `sequence.direction_locked` | OK | średnie (regresja przy refaktorze) | dodać więcej automatycznych scenariuszy AA/AAA |

### 4.3 R-track R1/R2/R3/R4
| Punkt | Expected | Observed | Evidence | Status | Ryzyko | Next step |
|---|---|---|---|---|---|---|
| R1 A | 3 trafienia A | działa | `cards.js`, test smoke | OK | niskie | - |
| R2 AB | A zamknięte, B krok 3-hit | działa; B mismatch -> fail + takeover | `cards.js`, smoke scenario 2 | OK | średnie | dodać regression test dla cashout R2 |
| R3 ABC | analogicznie | działa logicznie | smoke scenario 3 | OK | średnie | live run evidence |
| R4 ABCD | analogicznie | działa logicznie | smoke scenario 4 | OK | średnie | live run z pełnym event trail |
| fail partial rewards | R2/R3/R4 zwraca częściowe karty | `failSequence` commituje `tempCards` | `cards.js:rewardSequenceFail/failSequence` | PARTIAL | średnie | dopiąć jawny test asercji kart, nie tylko akcji |

### 4.4 Pętla R1: AA/AAA/DS
| Punkt | Expected | Observed | Evidence | Status | Ryzyko | Next step |
|---|---|---|---|---|---|---|
| AA = 3 trafienia + decyzja | po R1(A) krok AA decyzyjny | logika track A i overlay jest obecna | `cards.js:handleSequenceStepClosed`, eventy loop | PARTIAL | wysokie (mało testów autom.) | nagrać dedykowaną sesję debug AA/AAA |
| AAA = DS auto | auto DS + reset do IDLE | `finalizeSequence` dla A-level>=3 przyznaje DS i resetuje | `cards.js:finalizeSequence` | PARTIAL | średnie | dodać smoke test AAA -> DS count |
| przerwanie AA/AAA | obcy kolor przejmuje | wspierane przez ogólną logikę mismatch | `onHitColor` | PARTIAL | średnie | live evidence wymagane |

### 4.5 Decyzje po kroku (3s)
| Punkt | Expected | Observed | Evidence | Status |
|---|---|---|---|---|
| lewa połowa = aktywacja R1 | aktywacja efektu, konsumuje pending | `handlePointerDown` -> `activateSequenceR1` -> `onRunActivateR1` | `cards.js` | OK |
| prawa połowa = cash-out | kolekcja i reset | `cashOutSequence` (wywołanie z overlay) | `cards.js` | PARTIAL (brak full evidence dla R3/R4 cashout) |
| brak kliknięcia = kontynuacja | sekwencja idzie dalej | overlay TTL, dalsze hity działają | `cards.js` | PARTIAL |

### 4.6 Stary model 2-hit/3-hit konflikt
- **Observed:** runtime używa 3-hit; brak aktywnego 2-hit sequence engine.
- **Status:** OK.

### 4.7 Potencjalne stare stany (`World.r1Seq` / `World.r2Seq`)
- W runtime reset inicjuje historyczne struktury (`cardBank`, część pól legacy), ale aktywny sequence source-of-truth jest w `CardEngine.state.sequence`.
- **Status:** DEAD_CODE_CANDIDATE (dla części historycznych struktur i komentarzy), lecz nieusuwane na tym etapie.

### 4.8 Wiele źródeł prawdy sekwencji
- Faktyczny SoT: `CardEngine.state.sequence`.
- Dodatkowe pochodne: `World.sequencePulseColors`, `World.sequenceFlashColors`, `World.pendingCard`.
- **Status:** PARTIAL (brak formalnego dokumentu „single sequence state contract”).

---

## 5. DEBUG / EVIDENCE AUDIT

### 5.1 Czy debuger widzi prawdziwy stan sekwencji?
- Tak, snapshot zawiera `active/stage/phase/track/stepIndex/currentColor/expectedColor/hitCount/chainColors`.
- Event stream rejestruje `hit_registered`, `direction_locked`, `step_progress`, `step_completed`, `fail_detected`, `fail_resolved`.
- **Status:** PARTIAL (stan „na moment snapshotu”, niekoniecznie „na moment eventu”; trzeba analizować JSONL).

### 5.2 Granularność eventów dla hit1/hit2/hit3
- hit1: `sequence.direction_locked`
- hit2: `sequence.step_progress` (`phase=OPEN`)
- hit3: `sequence.step_completed`
- **Status:** OK.

### 5.3 Braki / mylące pola
- `final_snapshot.sequence` to stan końcowy sesji, nie timeline — może wyglądać sprzecznie z bugiem zgłoszonym wcześniej.
- `interruptedColor` w fail eventach reprezentuje aktualny kolor kroku przerwanego, nie kolor przychodzący — wymaga świadomości analityka.
- `lastByCategory.sequence` bywa `null`, jeśli ostatnie eventy były ze świata.

### 5.4 Czy można odtworzyć scenariusz z logów?
- Tak, jeśli użyjemy `events_jsonl` i kluczy `sessionTimeMs/frame`.
- Fallback evidence pack zawiera komplet (`session_meta`, `summary`, `final_snapshot`, `events_jsonl`, `issues`).
- Brakuje natomiast repozytoryjnych `logs/runs/*` zgodnie z roboczym kontraktem LIVE_VALIDATION_PACK.

### 5.5 Scenariusze problemowe (A->AA->AAA itd.)
- Obecny evidence lokalny 2026-04-24 potwierdza fail+takeover R-track.
- Nie ma pełnego świeżego, dedykowanego zestawu event replay dla wszystkich 10 scenariuszy obowiązkowych.
- **Status:** NEEDS_RUNTIME_EVIDENCE.

### 5.6 Lista brakujących eventów/debug pól
1. Jawny `decision_window_opened/closed/timeout` z `level` i `color set`.
2. Jawny event `cashout_requested` z decyzją użytkownika i target level.
3. Snapshot delta „pre-event vs post-event” dla fail/takeover.
4. Jawny `active_binding_changed` dla PRG (runtime toggle).

### 5.7 Miejsca, gdzie debug może „kłamać” (po transformacji)
- Snapshot attachowany do eventu może być już po częściowych mutacjach kolejnych funkcji (asynchroniczność flush/snapshot write).
- `final_snapshot` może pokazać aktywne R1 w trakcie sesji, mimo że bug wystąpił wcześniej.

---

## 6. ECONOMY AUDIT

### RP runtime vs ECONOMY_SYSTEM
| Obszar | KANON | Runtime | Status |
|---|---|---|---|
| +1 RP za harmoniczne trafienie (bazowe) | tak | score rośnie na hitach przez `addScoreToWorld` / `addScore` | OK |
| mnożniki R1..R4 x2..x5 | wymagane | runtime używa `getSequenceMultiplier`, ale brak jednoznacznego odwzorowania pełnego kanonu ciągów w dokumentacji kodu | PARTIAL |
| drugi ciąg x6..x9 | wymagane | brak jednoznacznego evidence, chain index logika jest uproszczona | MISMATCH/PARTIAL |
| reset ciągu ekonomicznego | wymagany przy fail/activate/cashout | częściowo przez reset sekwencji i chainPattern | PARTIAL |
| RP przy fail | częściowe nagrody | `failSequence` liczy `rpDelta` i przyznaje temp cards | PARTIAL |
| RP przy AA/AAA | wymagane kanonicznie | logika AA/AAA istnieje, ale brak jawnej tabeli RP wg kanonu | NEEDS_RUNTIME_EVIDENCE |
| koszty slotów (10/10) | wymagane | `SUB_META_ASSIGN_COST=10` przy assign/remove | OK |
| koszty kuźni | wymagane (R1..R4) | koszty forge obecne; potrzebna pełna tabela porównawcza przy R3/R4 | PARTIAL |
| koszt DS use | kanon tymczasowy | runtime ma DS jako karta, ale koszt użycia DS jako gate nie jest pełnie jawny | PARTIAL |

### Miejsca w kodzie liczące RP
- `hc.ui_debug.js:addScore` (mutacja `World.score`).
- `cards.js:addScoreToWorld` + logowanie `RP_GAINED/RP_SPENT` w `CardEngine.update`.
- operacje SUB-META/forge odejmują RP w `cards.js`.

### Debug eventy potrzebne do walidacji ekonomii
- event `rp.multiplier_applied` z `level`, `chainIndex`, `multiplier`.
- event `rp.chain_reset` z `reason`.
- event `rp.partial_fail_reward` z listą kart i RP.

---

## 7. SUB-META / PRG AUDIT

| Obszar | KANON | Runtime/UI | Debug | Status |
|---|---|---|---|---|
| PRG góra / 4 zakładki | wymagane | obecne branch tabs (`radius/glue/speed/objects`) | brak szczegółowego eventu przełączeń | PARTIAL |
| sloty R1 PRG | wymagane | obecne (assign/remove) | pośrednio widoczne przez karty | PARTIAL |
| ODB | strukturalnie wymagane | sloty/pola UI istnieją, brak pełnej mechaniki osi | brak dedykowanych eventów | MISSING/PARTIAL |
| 3 sloty R2 wiązań PRG | wymagane | definicje bindingów są, ale runtime aktywacja ograniczona | brak pełnego telemetry contract | PARTIAL |
| tylko jedno aktywne wiązanie | wymagane | UI oblicza `activeBindingIndex`; runtime effect coupling ograniczony | brak event `binding_changed` | PARTIAL |
| RUN PRG toggle | wymagany w UI_WORLD | część UI istnieje, brak pełnego gameplay path | brak evidence | MISMATCH |
| R1 slot influence on runtime | wymagane | częściowo przez slot effects/timers | częściowo | PARTIAL |
| R2 jako runtime zasób | wymagane | `onRunActivateR2` = stub false | brak | MISMATCH (critical for canon coverage) |
| ODB/EKS/DS runtime | strukturalnie | DS istnieje jako karta; ODB/EKS głównie UI placeholder | brak pełnej telemetrii | PARTIAL/MISSING |

---

## 8. UI / HUD AUDIT

### Zgodności
- Runtime debug overlay, top bar, SUB-META button, restart, evidence actions są obecne.
- Sequence HUD ma sygnały `DIR/OPEN/CLOSE` i pulse/flash danych kolorów.

### Rozjazdy względem UI_WORLD
- `index.codex.html` zawiera historyczny komentarz „source of truth in /md”, sprzeczny z migracją do `docs/current`.
- Część opisu SUB-META layout (np. pełna semantyka paneli ODB/EKS) jest w runtime uproszczona.
- PRG toggle w RUN nie ma pełnego, kanonicznego behavior pipeline.

### Pulsowanie/overlay
- pulse uruchamiany po hit2 (zgodnie z UI_WORLD), flash po close kroku.
- potrzeba świeżego evidence video/log dla potwierdzenia percepcji gracza w wszystkich ścieżkach (AA/AAA/fail/cashout).

---

## 9. OPEN GAPS / MISMATCH REGISTER

| ID | Obszar | Expected | Observed | Evidence | Severity | Class | Next step | Patch code? | Docs-only? |
|---|---|---|---|---|---|---|---|---|---|
| G-001 | PRG runtime | R2 activation istnieje | `onRunActivateR2` stub false | `cards.js` | CRITICAL | sequence/ui | zaprojektować minimalny patch R2 runtime | yes | no |
| G-002 | Economy chain | x2..x9 wg ciągów | brak pełnego potwierdzenia runtime | `ECONOMY_SYSTEM` + `cards.js` | HIGH | reward | audyt formuł + testy ekonomii | yes | no |
| G-003 | Evidence contract | logs/runs with manifest/events/summary | repo ma fallback bundle single file | `logs/README.md`, `logs/*.json` | MEDIUM | logging | dodać workflow eksportu do `logs/runs` (local, gitignored) | no | yes |
| G-004 | UI canonical note | source-of-truth docs/current | HTML komentarz mówi o `/md` | `index.codex.html` | MEDIUM | docs | korekta komentarza technicznego | no | yes |
| G-005 | SUB-META ODB/EKS | strukturalnie obecne | głównie placeholder UI | `cards.js`, UI doc | MEDIUM | ui/regression | oznaczyć zakres implementation gap | yes | yes |
| G-006 | AA/AAA hard evidence | komplet 10 scenariuszy | częściowe (smoke+1 fallback session) | tests + logs | HIGH | sequence/logging | nagrać dedykowane sesje debug | no | no |
| G-007 | Multi-source state clarity | single source kontrakt | rozproszone pochodne na World + CardEngine | `cards.js`, `hc.world.js` | LOW | regression | dopisać technical contract doc | no | yes |

---

## 10. FUNCTION-BY-FUNCTION MAP

### 10.1 Tabela funkcji kluczowych runtime

| Plik | Funkcja | Czyta | Zapisuje | Emity/Side effects | Ryzyko |
|---|---|---|---|---|---|
| `game.boot.js` | `update(dt, nowMs)` | World/Input/Camera/HC.* | World.nowMs, moduły świata | orchestracja całej pętli | wysokie (centralny scheduler) |
| `game.boot.js` | `resetWorld()` | World | World lists/score/flags/cardBank/meta/pause | global reset | wysokie |
| `hc.collisions.js` | `resolveMeteorCollisionsSafe()` | `World.meteors` | usuwa meteory; spawn asteroid | `METEOR_*` + `CardEngine.onHitColor` | wysokie (wejście sekwencji) |
| `cards.js` | `onHitColor()` | `state.sequence`, World | sequence state, RP, overlay/pulse | sequence events | krytyczne |
| `cards.js` | `failSequence()` | seq, World.score/tempCards | reset sequence, reward fail | `sequence.fail_*` | krytyczne |
| `cards.js` | `closeSequenceStep()` | seq current step | stepIndex, rewards | `sequence.step_completed` | krytyczne |
| `cards.js` | `finalizeSequence()` | seq/world/cards | DS/cashout/reset | toasty, DS grant event | wysokie |
| `cards.js` | `handlePointerDown()` | Input/UI rects | activation/cashout decisions | user decisions | wysokie |
| `cards.js` | `onRunActivateR1()` | pending/meta slots | timers/effects/pending consume | R1 activation path | wysokie |
| `cards.js` | `onRunActivateR2()` | payload | brak | stub | krytyczny gap |
| `hc.world.js` | `RunTimers.startOrRefresh` | World timers | runColorTimers/durations | wpływ spawn disable | średnie |
| `hc.ui_debug.js` | `addScore()` | points | `World.score` | global RP mutation | wysokie |
| `hc.debug.js` | `Session.getRuntimeSnapshot()` | World/CardEngine/logger | none | snapshot for overlay/evidence | średnie |
| `hc.debug.js` | `Session.exportEvidence()` | events+snapshot+issues | localStorage/download files | evidence export | średnie |

### 10.2 Graf przepływu init/update/render/reset
1. HTML ładuje skrypty.
2. `game.boot.js` tworzy World + inicjuje moduły.
3. `requestAnimationFrame(frame)` uruchamia loop.
4. `frame` -> `update` (world logic) -> `HC.Render.frame` -> `HC.UI.update` -> `CardEngine.render`.
5. `resetWorld` (manual/session bootstrap) czyści runtime i sequence.

### 10.3 Graf przepływu sekwencji kart
`meteor collision(same color)` → `notifyHitColor` → `CardEngine.onHitColor`:
- hit1: lock direction (`DIR`)
- hit2: open step (`OPEN`)
- hit3: close step (`CLOSE`) → `closeSequenceStep` → reward/overlay
- mismatch on deep step: `failSequence` + immediate restart as hit1
- decyzja overlay: activate R1 / cashout / timeout continue.

### 10.4 Graf debug events
`runtime action` → `logRuntimeEvent/emitSequenceEvent` → `Session.emit` → `RuntimeEventLogger` buffer → flush to localStorage/filesystem backend → `buildEvidencePack/exportEvidence` (`final_snapshot`, `summary`, `events_jsonl`, `issues`).

---

## 11. TEST / CHECKLIST COVERAGE

### Pokryte
- Automatyczny smoke takeover/fail R1–R4 (`tests/cards_sequence_rtrack_takeover_smoke.test.js`).
- Manual checklist dla R-track i AA/AAA (`tests/cards_sequence_three_hit_manual_checklist.md`).
- Historyczne audyty 2026-04-24 dla 3-hit/takeover/events HUD.

### Niepokryte / słabo pokryte
- Automatyczne asercje kart/RP po fail i po cashout R2/R3/R4.
- Automatyczne scenariusze AA/AAA (decyzja, timeout, DS grant count).
- Integracyjne testy PRG toggle + aktywne wiązanie + wpływ na runtime.
- Pełny kontrakt evidence `logs/runs/*` na aktualnym HEAD.

### Obowiązkowe scenariusze walidacji — status
1. `A A A = R1(A)` — **covered** (smoke/manual).
2. `A A B` takeover B hit1 — **covered** (manual + engine path).
3. `A A A` + brak kliknięcia + `A A A = AA` — **NEEDS_RUNTIME_EVIDENCE**.
4. `R1(A) -> AA -> AAA = DS(A)` — **PARTIAL** (logika jest, brak świeżego pełnego evidence).
5. `R1(A), potem B B B` — **covered** logicznie, **needs replay evidence**.
6. A-track/R-track mismatch deep stage — **covered** (smoke fail/takeover).
7. Pending decision 3s (left/right/timeout) — **PARTIAL** (runtime jest, brak pełnego log pakietu).
8. Cash-out R2/R3/R4 — **PARTIAL** (mechanika jest, brak pełnego testu autom.).
9. Fail rewards — **PARTIAL** (logika jest, brak asercji ilości kart w smoke).
10. Debug export + odtworzenie scenariuszy — **PARTIAL** (działa fallback evidence pack, brak pełnej serii scenariuszy).

---

## 12. RECOMMENDED NEXT PHASE

### Faza 1 — dokumentacja sync (bez zmiany mechaniki)
- skorygować komentarze i statusy techniczne, zwłaszcza miejsca mogące sugerować `md/` jako SoT.
- dopisać kontrakt „single sequence source of truth + derived fields”.

### Faza 2 — minimalny patch mechaniki sekwencji
- domknąć brak `onRunActivateR2` i spójność runtime PRG binding->effect.
- doprecyzować ekonomię chain multipliers wg kanonu.

### Faza 3 — debug/evidence hardening
- dodać eventy decision window i rp multiplier context.
- wprowadzić automatyczny eksport do kontraktu `logs/runs/<timestamp>/` (lokalnie).

### Faza 4 — strojenie runtime
- dopiero po domknięciu gapów strukturalnych i telemetrycznych.

### Faza 5 — oprawa graficzna/PRG visual
- uruchamiać po potwierdzeniu mechaniki i telemetrycznej reprodukcji scenariuszy.

---

## Załącznik A — lista plików przeczytanych
- `README.md`
- `docs/README.md`
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`
- `docs/current/technical/WORLD_FUNCTION_MAP.md`
- `docs/current/technical/IMPLEMENTATION_TRACKER.md`
- `docs/current/technical/LIVE_VALIDATION_PACK.md`
- `docs/audits/chronological/2026-04-24_sequence_three_hit_contract_audit.md`
- `docs/audits/chronological/2026-04-24_sequence_rtrack_direction_takeover_audit.md`
- `docs/audits/chronological/2026-04-24_rtrack_events_hud_audit.md`
- `index.codex.html`
- `game.boot.js`
- `hc.core.js`
- `hc.util.js`
- `hc.world.js`
- `hc.view_input.js`
- `hc.camera.js`
- `hc.comets.js`
- `hc.meteors.js`
- `hc.collisions.js`
- `hc.asteroids.js`
- `hc.planets.js`
- `hc.stars_epoch.js`
- `hc.render.js`
- `hc.ui_debug.js`
- `hc.debug.js`
- `cards.js`
- `logs/README.md`
- `logs/2026-04-24_16-00-56__sess_6-669Z__debug__aa_aaa_ds__fallback_evidence_pack.json`
- `tests/README.md`
- `tests/cards_sequence_three_hit_manual_checklist.md`
- `tests/cards_sequence_rtrack_takeover_smoke.test.js`

## Załącznik B — instrukcja nagrań debug (co nagrać teraz)
Nagrać 3 nowe sesje debug (z eksportem evidence):
1. **AA/AAA/DS focus**: `A A A` -> timeout -> `A A A` -> timeout -> `A A A` (weryfikacja DS i eventów loop).
2. **Decision window matrix**: na R1 i R2 osobno wykonać left click / right click / no click (9 podscenariuszy).
3. **Economy focus**: pełny R1->R4 cashout + fail na R3 i R4, z porównaniem RP delty i przyznanych kart.

Każda sesja powinna zawierać: `sessionId`, label scenariusza, kroki wejściowe, eksport `hc_evidence_<sessionId>.json` oraz `*.events.jsonl`, i wpisy issue ledger dla każdego rozjazdu.
