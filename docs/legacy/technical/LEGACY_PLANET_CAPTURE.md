# Legacy planet capture — historyczny opis

> Status: LEGACY / HISTORIA
> Obszar: planety / capture
> Source of truth: NIE
> Aktualny runtime: `HC.Impact.resolvePlanetImpact`

Ten dokument zachowuje krótki opis starej mechaniki planet capture po Patch C1. Nie jest aktywną specyfikacją gry i nie powinien być używany do odtwarzania fallbacku runtime.

## Dawny model

W starszej ścieżce planety mogły przechwytywać meteory i asteroidy bez bezpośredniego kontaktu brył. Decyzja była oparta o pola i relacje takie jak:

- `orbitPx` jako bazowy promień orbity planety,
- `gravityR` jako promień wpływu/grawitacji,
- lokalnie wyliczane `capR` jako zasięg przechwycenia,
- `orbiters[]` jako lista planetarnych orbiterów,
- asteroidowe `parentKind = "planet"`, `parentRef`, `orbitR`, `theta`, `omega` po przechwyceniu przez planetę,
- historyczne statystyki `captureCount`, `captureSumR`, `captureSumMass`, `captureColorCounts`.

## Status po Patch C1

Legacy planet capture został odłączony i fizycznie usunięty z live runtime `hc.planets.js`. Tryby `legacy_capture` i `hybrid_debug` nie są dopuszczonymi trybami gry.

Aktualna ścieżka planet impact/capture to direct impact przez `HC.Impact.resolvePlanetImpact`, wywoływany dla fizycznego kontaktu meteor/asteroida → planeta. Obiekt znajdujący się tylko w dawnym zasięgu `capR` / `orbitPx`, ale bez direct impact, nie jest przechwytywany przez planetę.

Jeżeli część pól legacy nadal pojawia się w obiektach, snapshotach lub debug helperach, należy traktować je jako compatibility/deprecated. Nie są one równoległą mechaniką capture i nie mogą decydować o przechwyceniu w live runtime.
