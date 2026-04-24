> Status: LEGACY / HISTORYCZNY
> Źródło prawdy: NIE
> Powód przeniesienia: dokument historyczny po migracji do docs/current/.
> Aktualne źródło prawdy: docs/current/README.md oraz docs/current/maps/PROJECT_INDEX.md

# Haiku Cosmos — Codex patchpoints

Poniższe kotwice (anchors) są miejscami, do których “doklejamy” nowe mechaniki bez demolki monolitu.

## Anchory w monolicie
- **[ANCHOR:CODEX_API]**  
  Stabilne API pod patche: `window.HC.get()` zwraca referencje do World/state/config/CardEngine.

## Kontrakty (nie łamać)
- Kolejność update/render: zmieniamy tylko gdy jest jasny powód i testy.
- Karty: “okno decyzji” (klik = użycie, brak kliku = kolekcja) — bez stałych paneli HUD.
- Parametry świata: efekty kart/rytuałów powinny modulować parametry (a nie hard-code w logice).

## Jak dopinać nową mechanikę
1) Najpierw zidentyfikuj miejsce w kodzie (anchor lub unikalny komentarz).  
2) Dodaj mały hook/event (1–3 linijki).  
3) Logikę nowej mechaniki trzymaj w osobnym pliku patcha, który wywołuje się po starcie gry.

## SOURCE vs GENERATED (ważne dla patchy)

Codex edytuje tylko pliki SOURCE:
- `*.codex.js`, `*.codex.html`, `md/*.md`

Pliki bez `.codex.` są traktowane jako GENERATED (mirror/runtime).
Nie należy ich edytować bezpośrednio w ramach patchy.

Jeśli patch wymaga zmiany zachowania gry:
- zmiany wprowadzamy w `.codex.js`,
- a plik runtime `.js` jest synchronizowany po zmianach.
