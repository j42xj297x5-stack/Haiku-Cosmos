> Status: HISTORYCZNY / SUPERSEDED (evidence)
> Źródło prawdy: NIE
> Powód przeniesienia: stary audyt runtime zachowany jako materiał dowodowy.
> Aktualne źródło prawdy: docs/current/ + bieżące audyty w docs/audits/chronological/.

# AUDIT — Sequence Engine (cards.codex.js)

## Scope + canon

Sources (canon):
- `CARDS_SYSTEM.md`
- `ECONOMY SYSTEM.md`

Implementation scope: `cards.codex.js` sequence engine and pending pipeline.

> Note: The canon doc states “2 harmonic hits” per step in section 5.1, but the current implementation uses **3 hits** per step (`seq.hits === 3` closes). This audit follows the task rules and current code behavior, and flags the discrepancy for later resolution.

---

## 1) Current state machine diagram (as implemented)

```
IDLE
  | (first valid hit)
  v
BUILD_STEP (seq.active=true, currentColor set, hits=1..3)
  | (hits==3)
  v
STEP_CLOSED (handleSequenceStepClosed)
  | (colorsClosed.len==2) -> BRANCH_DECIDED (track=A or R)
  v
BRANCH_DECIDED
  |-> R_TRACK (R1 -> R2 -> R3 -> R4)
  |-> A_TRACK (A -> AA -> AAA)
  v
TERMINAL (cashOutSequence)  OR  FAIL (failSequence)
  v
RESET (resetSequenceState)
```

**Key transitions / locations in code:**
- **IDLE → BUILD_STEP:** `onHitColor` calls `startSequenceWithColor` when `seq.active` is false.
- **BUILD_STEP (hits increment):** `onHitColor` increments hits and calls `handleSequenceStepClosed` when `hits === 3`.
- **STEP_CLOSED:** `handleSequenceStepClosed` pushes `currentColor` into `colorsClosed`, determines `track`, assigns temp rewards, and may commit immediately.
- **BRANCH_DECIDED:** when `colorsClosed.length === 2`, `track` set to `A` or `R`.
- **TERMINAL:** `cashOutSequence` executes when terminal level reached; sequence resets.
- **FAIL:** `failSequence` executes for invalid hits; sequence resets.
- **RESET:** `resetSequenceState` clears sequence data and overlay/toast flags.

Overlay note: after `handleSequenceStepClosed`, the code shows an overlay (3s) and `handleSequenceOverlayTimeout` can re-initialize sequence state after timeout if no explicit action is taken.

---

## 2) Sources of reward truth + double-commit surfaces

**Reward truth sources:**
1) **`seq.tempCards`** — temporary earned cards for the current sequence.
   - Filled in `handleSequenceStepClosed` via `pushTempCard`.
   - Cleared in `cashOutSequence` after commit, and in `rewardSequenceFail`.
2) **`World.pendingCard`** — a short-lived “decision/pending” card displayed in the UI.
   - Set in `handleSequenceStepClosed` (R1) and elsewhere (`setPendingChoiceCard`).
   - Cleared in `consumePendingCard`, `flushPendingCard`, and `onCardCollected`.
3) **`World.cardsPool`** — committed, persistent card inventory.
   - Written in `commitSequenceRewards` and `onCardCollected`.

**Potential double-commit surfaces:**
- `commitSequenceRewards` is invoked from **multiple pathways**:
  - `handleSequenceStepClosed` (R-track steps + R1 level 1)
  - `rewardSequenceFail` (commits `seq.tempCards` on fail)
  - `cashOutSequence` (commits `seq.tempCards` on terminal)
- Because `seq.tempCards` persists until reset, there is a risk of
  re-committing the same card if `_committed` flags or dedupe keys are not
  consistently used.
- `World.pendingCard` is set from `seq.tempCards` but can also be created as a
  new entity; if it is later “collected” through a different pipeline, it can
  land in `World.cardsPool` outside the `commitSequenceRewards` flow.

---

## 3) Reasons a hit may be ignored or delayed

Within `cards.codex.js`, `onHitColor` **exits early** only for:
- **Invalid world or color** (`World` missing or `normalizePack01Color` returns null).

Other *apparent* gating factors:
- **Overlay or pending visible**: code logs their presence but does not block
  `onHitColor` processing. Any hit suppression would have to occur **outside**
  this file (e.g., in collision code).
- **`seq.active` false**: first hit starts a sequence and returns, so a hit
  always counts when valid.
- **`seq.currentColor` null**: hit establishes a new current color and returns.

**Delays based on UI:**
- `handleSequenceStepClosed` shows a 3s overlay. While this file keeps accepting
  hits, other modules might choose to ignore hits when overlays are visible.

---

## 4) Concrete race/edge conditions behind reported symptoms

### A) “Sequence start requires extra hit”
- After `handleSequenceStepClosed`, `currentColor` is cleared and `hits` reset.
  If upstream code suppresses collisions while the overlay is visible, the
  first hit after a step closure may be ignored or delayed until the overlay
  times out. In that case, the user experiences an “extra hit” to resume.
- The overlay timeout handler (`handleSequenceOverlayTimeout`) re-enables
  sequence state after TTL, which can delay the ability to start a new step
  depending on external collision handling.

### B) “Fail requires extra hit”
- When `seq.currentColor` is set but `seq.colorsClosed.length === 0` and
  `seq.hits === 1`, a **mismatched color re-targets** instead of failing:
  ```
  if (seq.colorsClosed.length === 0 && seq.hits === 1) {
    seq.currentColor = normalized;
    seq.hits = 1;
    return;
  }
  ```
  This means the first wrong hit in the opening step does **not** fail the
  sequence, matching the “needs 2 wrong hits to fail” symptom.

### C) “Rewards can duplicate”
- Reward creation is split across `seq.tempCards` and `World.pendingCard`. If
  a card is created twice (e.g., due to track transitions or replaying
  `handleSequenceStepClosed` with the same color set), it can appear in both
  temp and pending pipelines and later be committed twice unless dedupe keys
  match and `_committed` is set.
- `commitSequenceRewards` relies on both `_committed` and dedupe keys; any
  mismatch (e.g., missing `id`, inconsistent color normalization) can bypass
  dedupe and allow duplicates in `World.cardsPool`.

---

## 5) Gold standard invariants (target state)

> These are the explicit invariants the code should satisfy.

1) **Hit processing**
   - Every collision hit calls `onHitColor(color)` exactly once, or is
     explicitly filtered with a documented reason.
   - IDLE: first valid hit starts sequence and counts as hit #1 immediately.
   - `hits === 3` closes the step in the **same call** (no extra hit needed).
   - Any wrong hit breaks immediately (same call), not on the next hit.

2) **Rewards**
   - Each step yields **at most 1 new reward** unless canon explicitly says
     otherwise (AA yields 2×R1A, AAA yields DS).
   - No previously earned reward can be re-committed later.
   - Single source of truth for card rewards: pending is UI only.

3) **Refunds**
   - On fail: refund correct earned cards and RP delta **exactly once**.
   - On success: commit correct cards **exactly once**.

4) **Track rules**
   - **R-track**: repeat of a closed color breaks immediately (if canon).
   - **A-track**: baseColor must repeat; AA/AAA cannot spam extra R1 unless
     canon explicitly allows it.

---

## 6) Proposal plan — 3-step patch series to reach gold standard

### Step 1 — Safety: eliminate double-source rewards
**Goal:** one reward pipeline, no duplicate commits.

Checklist:
- Make `seq.tempCards` the only source of earned rewards.
- Treat `World.pendingCard` as a **pointer** to `seq.tempCards` entries (no new
  entity creation), or ensure it never commits independently.
- Enforce “commit only new reward,” never commit history. Add a per-sequence
  commit-dedupe key set to prevent re-commit across fail/cashout.

Repro tests:
- R1 -> R2 fail: verify only one R1A committed.
- R1 -> R2 -> R3 fail: verify R1A + R1B committed exactly once.

### Step 2 — Correctness: unify hit handling
**Goal:** deterministic handling of hits and failures.

Checklist:
- Wrong hit must fail in the same call, even on the first step.
- Step closure must occur **exactly at hit #3**, no extra hit.
- Remove or consolidate early returns in `onHitColor` that prevent closure
  or fail in the same call.

Repro tests:
- A-track: A A B should fail immediately on B.
- R-track: A A B should close R1 on 3rd A only; B before that fails.

### Step 3 — Clarity: isolate SequenceEngine block
**Goal:** isolate state transitions for maintainability.

Checklist:
- Organize sequence logic into a local `SequenceEngine` object or section:
  - `reset`, `start`, `handleHit`, `closeStep`, `commit`, `refund`
- Centralize RP delta calculation in one place.
- Add internal assertions / invariants for debug mode.

Repro tests:
- Full R-track: A A A → B B B → C C C → D D D
- Full A-track: A A A → A A A → A A A (DS), ensure no extra R1

---

## 7) Immediate debug instrumentation added (this patch)

- **`window.HC.debugSeq`** enables trace logging for `onHitColor`.
- Each hit logs: normalized color, sequence state, and action.
- `commitSequenceRewards` logs reward keys and dedupe flag.
- `window.HC.seqSim(hitsArray)` runs a deterministic sequence simulation and
  returns `{ cardsPool, trace }` for repros.
