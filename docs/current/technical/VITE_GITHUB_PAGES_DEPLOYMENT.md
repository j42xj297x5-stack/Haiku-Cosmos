# Vite + GitHub Pages deployment

> Status: CURRENT
> Obszar: techniczny deployment runtime Haiku Cosmos
> Repozytorium: `j42xj297x5-stack/Haiku-Cosmos`
> Branch roboczy: `CODEX-STARTING-POINT`
> Branch deploymentowy: `HAIKU-COSMOS-DEPLOY-CLEAN`
> Workflow: `.github/workflows/deploy_pages.yml`
> Snapshot: produkcyjny model publikacji z immutable buildami

## Publiczny model URL

Publiczny adres aktualnej gry jest stały:

```text
/Haiku-Cosmos/latest/
```

Root projektu nie uruchamia runtime gry. `dist/index.html` jest minimalnym bootstrapem, który pobiera `/Haiku-Cosmos/build-meta.json` z `cache: "no-store"` i parametrem opartym o `Date.now()`, a następnie wykonuje `location.replace` do:

```text
/Haiku-Cosmos/latest/?v=<BUILD_ID>
```

`latest/index.html` przed uruchomieniem runtime pobiera aktualne metadane, porównuje je z osadzonym `window.HC_BUILD_INFO`, przekierowuje przez `location.replace` przy różnicy oraz usuwa query string przez `history.replaceState` po zgodnym starcie.

## Układ `dist/`

Build produkcyjny ma układ:

```text
dist/
  index.html              # bootstrap root, bez runtime gry
  build-meta.json         # źródło aktualnego buildu
  latest/
    index.html            # dokument wejściowy aktualnej gry
  builds/
    <BUILD_ID>/           # niezmienne drzewo plików aplikacji i assetów
```

Wszystkie runtime JS, moduły Vite, vendor, CSS, fonty, PNG/SVG/WEBP/JPG, GLB/GLTF/BIN, tekstury, mapy emisji, JSON settings/content i manifesty są publikowane pod:

```text
/Haiku-Cosmos/builds/<BUILD_ID>/
```

`assetBase` w metadanych ma wartość:

```text
/Haiku-Cosmos/builds/<BUILD_ID>/
```

`latest/index.html` wskazuje lokalne `src`/`href` właśnie do tego immutable katalogu. `dist/latest/` nie zawiera aktywnych assetów aplikacji poza dokumentem wejściowym.

## `build-meta.json`

`build-meta.json` jest źródłem aktualnego buildu dla root bootstrapu i preflightu `latest`. Zawiera co najmniej:

```json
{
  "id": "<BUILD_ID>",
  "sha": "<SHA lub lokalny identyfikator>",
  "shortSha": "<krótki identyfikator>",
  "builtAt": "<ISO UTC>",
  "mode": "production",
  "latestPath": "/Haiku-Cosmos/latest/",
  "assetBase": "/Haiku-Cosmos/builds/<BUILD_ID>/"
}
```

W GitHub Actions `BUILD_ID` pochodzi z `VITE_BUILD_SHA`. Lokalnie Vite tworzy jeden identyfikator `dev-*` albo `local-*` na start procesu, a nie przy każdym żądaniu.

## Publiczne assety i `HC.publicPath`

Publiczne URL-e do assetów należy budować przez `HC.publicPath` / `HC.publicAssetPath`; `HC.withBuildVersion` pozostaje publicznym API. W produkcji bazą helperów jest `window.HC_BUILD_INFO.assetBase`, a w lokalnym dev zachowane są ścieżki Vite pod `/Haiku-Cosmos/`.

JSON nadal przechowuje ścieżki logiczne, np. `png/foo.png`, `settings/foo.json`, `glb/foo.glb`. Nie zapisujemy w JSON pełnych browser URL-i. Zewnętrzne `http/https`, inne originy oraz `data:` i `blob:` nie są przepisywane.

Relatywne zależności GLTF/GLB, takie jak BIN i tekstury, muszą znajdować się w tym samym immutable drzewie buildu, aby otrzymywały URL z tym samym `BUILD_ID` w ścieżce.

## Build i preview

```bash
npm install
npm run validate:content
npm run build
npm run preview
```

`postbuild` uruchamia przygotowanie układu release i weryfikator `scripts/verify-legacy-runtime-dist.mjs`, który sprawdza bootstrap root, kompletność metadanych, `latest/index.html`, zgodność `HC_BUILD_INFO`, preflight aktualizacji, immutable katalog buildu, kolejność klasycznych skryptów, Three bridge, brak nierozwiązanych tokenów i brak aktywnej rejestracji Service Workera.

## GitHub Pages deployment

Workflow `.github/workflows/deploy_pages.yml` buduje projekt przez `npm run build` z `VITE_BUILD_SHA=${{ github.sha }}` i publikuje `dist/` przez GitHub Pages. Nie należy modyfikować branchy deploymentowych w lokalnym zadaniu ani wykonywać pushu bez osobnego polecenia.
