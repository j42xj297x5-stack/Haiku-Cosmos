# AUDIT_NAV_READINESS (NO LOGIC CHANGES)

## Scope and evidence

This audit was executed against the current repository snapshot at `/workspace/Haiku-Cosmos` without changing runtime logic.

Evidence-gathering commands:

- `rg --files`
- `rg -n "\b(exit\(|sys\.exit|SystemExit|process\.exit|quit\()" -S`
- `rg -n "requestAnimationFrame|setInterval|setTimeout|while \(|for \(|addEventListener\(" game.js game.codex.js index.html index.codex.html`

Key context: the expected monolithic Python CLI (Spotify + Discogs) is not present in this repo snapshot (same finding as Phase 1).

---

## 1) Exit points

### Requested patterns
- `exit()`
- `sys.exit()`
- `raise SystemExit`

### Findings
No matches found for any requested Python exit patterns in the current repository.

- No Python source files are present.
- Therefore, there are no `exit()` / `sys.exit()` / `SystemExit` callsites to enumerate by file+line.

### How termination happens today (as implemented in this repo)
This repository is browser-JS based (`game.js`, `game.codex.js`) and does not expose a Python CLI process lifecycle.
There are no explicit process-termination calls (`process.exit`, `quit`) in JS either.
Runtime continuity is maintained by animation loop scheduling with `requestAnimationFrame(frame)`.

Relevant locations:
- `game.js:2551`, `game.js:2553`
- `game.codex.js:2560`, `game.codex.js:2562`

---

## 2) Mode completion

Because no CLI modes are implemented in this snapshot, there is no mode-to-main return path to audit in Python terms.

### As-is
- No detectable CLI “mode handlers” with `input()`-driven dispatch.
- No main/hub loop in Python to return to.

### Minimal change concept for future HUB-loop readiness (no implementation here)
When/if the Python CLI is restored, the minimal pattern would be:
1. Replace hard exits in mode handlers with `return` status values.
2. Introduce a top-level `while True` hub loop that dispatches by user choice.
3. Reserve `0` (or one canonical command) for back-to-hub from non-root modes.
4. Keep only one true process-exit action in the hub itself.

No code changes were made; this is a readiness recommendation only.

---

## 3) Long-running processes

No CLI batch/API/index loops are present in the current Python scope (because Python CLI is absent).

In the existing JS runtime, long-running behavior exists primarily in the frame/update loop and world-iteration loops:

- perpetual frame loop via `requestAnimationFrame(frame)`:
  - `game.js:2551`, `game.js:2553`
  - `game.codex.js:2560`, `game.codex.js:2562`
- repeated world update iteration patterns (examples):
  - `game.js:1006-1272`, `1961-2405`
  - `game.codex.js:1007-1273`, `1970-2414`
- timed spawn while-loop:
  - `game.js:2387`
  - `game.codex.js:2396`

### Future cancellation insertion points (conceptual, no implementation)
- Gate the frame loop with a `running` flag checked before scheduling next frame.
- Add cancellable guards in heavy update sections (world/entity iteration).
- Introduce user-driven pause/stop state transitions that short-circuit update passes.

---

## 4) Table selectors

Requested target: numeric selectors (e.g., genre/tag tables) in CLI flows.

Findings in current repository snapshot:
- No CLI numeric table selectors were found.
- No `input()`-driven selector contexts are implemented.

Therefore, there are no concrete selector callsites to mark as LOCAL-only at this time.

### Future rule mapping (preparedness only)
When CLI selectors are available, tag selector contexts as **LOCAL-only** and enforce:
- only `0 = back` in selector scope,
- no global exit semantics inside selector tables.

---

## Conclusion

Phase 2 navigation-readiness audit is blocked by missing target implementation (Python monolithic CLI with Spotify/Discogs).

What is currently available is a browser JS game loop architecture with no Python exit/routing/input surfaces to audit for menu-return behavior.
