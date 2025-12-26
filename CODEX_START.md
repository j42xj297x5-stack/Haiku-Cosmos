# Haiku Cosmos — Codex repo (starter)

Ten projekt utrzymuje **jeden działający monolit** (game.js) i buduje rozwój przez **patche** oraz pliki danych.
Nie rozbijamy runtime na moduły dopóki nie będzie potrzeby — priorytetem jest stabilność.

## Uruchamianie lokalnie (z dysku)
- `index.html` ładuje `cards_preset_run1_3.v1.js` oraz `game.monolith.codex.js`.
- Uruchamiasz przez otwarcie `index.html` w przeglądarce (file://).

## Zasady patchowania
1. Patche NIE grzebią w pętli gry “na czuja”.
2. Wszystkie patche startują od `window.HC.get()` (zdefiniowane w [ANCHOR:CODEX_API]).
3. Jeśli potrzebujesz nowego hooka:
   - dopisz go w sekcji [ANCHOR:CODEX_API] (eksport referencji),
   - albo dodaj nowy anchor (np. [ANCHOR:RITUAL_HOOK]) w miejscu, które już rozumiesz.

## Minimalny szablon patcha
Zobacz `codex_patch.template.js`.
