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
/Haiku-Cosmos/latest/?v=<BUILD_ID>
```

Root projektu nie uruchamia runtime gry. `dist/index.html` jest minimalnym bootstrapem, który pobiera `/Haiku-Cosmos/build-meta.json?t=<Date.now()>` z `cache: "no-store"` i `credentials: "same-origin"`, a następnie wykonuje `location.replace` do:

```text
/Haiku-Cosmos/latest/?v=<BUILD_ID>
```

`latest/index.html` jest inline bootstrapem release: nie ma statycznych skryptów runtime ani statycznych stylesheetów aplikacji. Zawiera markup strony, `startOverlay`, minimalny styl loadera/błędu, osadzone `window.HC_BUILD_INFO`, manifest uporządkowanych plików runtime/modułów/stylów oraz inline preflight. Parametr `?v=<BUILD_ID>` pozostaje w pasku adresu przez cały czas działania gry; produkcyjny bootstrap nie usuwa go przez `history.replaceState`.

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

`latest/index.html` nie wskazuje statycznych `src`/`href` runtime. Po preflighcie ładuje style, klasyczne skrypty i moduły dynamicznie z `window.HC_BUILD_INFO.assetBase`; klasyczne skrypty są dodawane sekwencyjnie z `async = false`, a moduły również blokują dalszą kolejność do zdarzenia `load`. `dist/latest/` nie zawiera aktywnych assetów aplikacji poza dokumentem wejściowym.

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


## Preflight release i czyszczenie storage

Przed załadowaniem jakiegokolwiek runtime `latest/index.html`:

1. odczytuje parametr `v` z `location.search`,
2. pobiera `/Haiku-Cosmos/build-meta.json?t=<Date.now()>` przez `cache: "no-store"` i `credentials: "same-origin"`,
3. sprawdza kompletność `id`, `sha`, `shortSha`, `builtAt`, `assetBase`, `latestPath`,
4. porównuje `v`, pobrane `meta.id` i osadzony `window.HC_BUILD_INFO.id`,
5. przy różnicy wykonuje `location.replace(meta.latestPath + "?v=" + encodeURIComponent(meta.id))`, z ochroną przed pętlą,
6. dopiero po zgodności ustawia `window.HC_RELEASE_BOOTSTRAP = { buildId, storageResetPerformed, preflightComplete: true }` i ładuje manifest runtime.

Trwały marker aktualnego stanu przeglądarki to `hc:release-build-id`. Jeżeli marker nie istnieje albo różni się od `window.HC_BUILD_INFO.id`, bootstrap jednorazowo czyści dane Haiku Cosmos przed runtime: klucze `localStorage`/`sessionStorage` o prefiksach `hc:`, `hc.`, `haiku-cosmos`, cache projektu i wpisy cache z URL zawierającym `/Haiku-Cosmos/`, IndexedDB projektu oraz Service Workery o scope obejmującym `/Haiku-Cosmos/`. Nie wolno używać `localStorage.clear()` ani `sessionStorage.clear()`, bo origin GitHub Pages może przechowywać dane innych projektów. Ręcznie pobrane pliki save na dysku użytkownika nie są usuwane; nadal działają ścieżki import/export pliku save.

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

`postbuild` uruchamia przygotowanie układu release i weryfikator `scripts/verify-legacy-runtime-dist.mjs`, który sprawdza bootstrap root, kompletność metadanych, dynamiczny `latest/index.html` bez statycznego runtime, zgodność `HC_BUILD_INFO`, preflight aktualizacji, trwały parametr `?v`, marker `hc:release-build-id`, scoped storage reset bez czyszczenia całego originu, immutable katalog buildu, kolejność manifestu runtime, Three bridge, brak nierozwiązanych tokenów i brak aktywnej rejestracji Service Workera.

## GitHub Pages deployment

Workflow `.github/workflows/deploy_pages.yml` buduje projekt przez `npm run build` z `VITE_BUILD_SHA=${{ github.sha }}` i publikuje `dist/` przez GitHub Pages. Nie należy modyfikować branchy deploymentowych w lokalnym zadaniu ani wykonywać pushu bez osobnego polecenia.
