# assets/visual

> Status: STRUKTURA ROBOCZA
> Obszar: assety wizualne

Katalog bazowy dla assetów wizualnych Haiku Cosmos.

## Podział

- `submeta/` — elementy dla SUB-META.
- `hud/` — elementy dla podstawowego HUD.
- `shared/` — elementy współdzielone między SUB-META, HUD i późniejszymi widokami.

## Zasady

- pierwszy realny asset pass ma produkować SVG,
- raster pipeline pozostaje osobny,
- lokalny testowy zestaw SVG został dodany do assets/visual (runtime proof-of-integration),
- komponenty source-of-truth dla passu v0.1 istnieją w Figmie: `Mx7U5CRQjz2T1zrLPgJDSm`,
- finalne grafiki nie są jeszcze zatwierdzone jako kanon,
- assety nadal wymagają review projektanta; runtime używa tylko reprezentatywnego zestawu + fallback renderingu.
