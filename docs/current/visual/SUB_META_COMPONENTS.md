# Haiku Cosmos - SUB-META Components

> Status: KATALOG KOMPONENTOW / CURRENT DLA STATUSOW
> Obszar: SUB-META / HUD / cards - rodziny komponentow i ich statusy
> Źródło prawdy: TAK, dla katalogu komponentow i statusow pipeline. NIE, dla mechaniki i runtime integration.
> Ostatnia aktualizacja: 2026-04-30
> Powiązane dokumenty: `SUB_META_ASSET_PIPELINE.md`, `MODULAR_FRAME_KIT_FIGMA_PROMPT.md`, `SVG_ASSET_STANDARDS.md`, `SUB_META_FIGMA_ASSET_PASS_01.md`, `SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md`, `SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md`

## 1. Rola dokumentu

Ten dokument dziala jako katalog rodzin komponentow i statusow (planowane / production_candidate / evidence).

Nie jest to raport jednego passu evidence i nie zastępuje manifestow runtime.

## 2. Rodziny komponentow planowane/aktywne (pipeline CURRENT)

- frame parts: corners, edges, center ornaments, separators;
- slot frames i slot accents;
- resonance nodes i bridge lines;
- HUD frame parts, sequence markers, mini-frame counters/buttons;
- card state accents (`active`, `selected`, `locked`, `seen/new` warstwa wizualna).

## 3. Production candidates (po review)

Za production candidate mozna uznac tylko komponent, ktory:

1. ma czyste SVG zgodne ze standardem,
2. przeszedl review (preview + dokumentacja),
3. ma status jawnie oznaczony w katalogu/manifestach passu.

Na etapie obecnego cleanupu dokumentacji status `production_candidate` jest przygotowany proceduralnie, a nie rozszerzany o nowe projektowane assety.

## 4. Evidence / review only

Do evidence/review nalezy dokumentacja passow:

- `SUB_META_FIGMA_ASSET_PASS_01.md`,
- `SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md`,
- `SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md`.

Te passy dokumentuja przebieg projektowy i decyzje review, ale nie sa samodzielnym aktywnym katalogiem produkcyjnym runtime.

## 5. Oznaczanie statusu komponentu

Kazdy komponent/familia powinien miec jawny status:

- `planned` - rodzina potwierdzona kierunkowo, bez finalnej walidacji exportu,
- `review` - komponent wyeksportowany i oczekujacy na finalny przeglad,
- `production_candidate` - komponent po review, gotowy do osobnego passu integracyjnego,
- `evidence_only` - komponent/notatka historyczna, bez statusu produkcyjnego.

## 6. Granice

- Brak dopisywania nowych komponentow bez podstawy w istniejacej dokumentacji.
- Brak projektowania nowych assetow w tym kroku.
- Brak zmian runtime/mechaniki.
