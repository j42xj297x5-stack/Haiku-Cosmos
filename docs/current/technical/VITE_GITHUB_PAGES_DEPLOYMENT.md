# Vite + GitHub Pages deployment

> Status: CURRENT
> Obszar: techniczny deployment runtime Haiku Cosmos
> Repozytorium: `j42xj297x5-stack/Haiku-Cosmos`
> Branch publikujący: `Haiku-Cosmos`
> Snapshot: 2026-06-04 po naprawie lokalnego i publicznego uruchamiania przez Vite + GitHub Pages

## Snapshot statusu 2026-06-04

Potwierdzony baseline po naprawie uruchamiania:

- lokalny runtime przez Vite działa;
- publiczny runtime na GitHub Pages działa;
- runtime JS ładują się poprawnie;
- runtime JS nie ładują się już z błędnego, podwójnego pathu `/Haiku-Cosmos/Haiku-Cosmos/runtime/...`;
- obowiązujący publiczny model URL dla runtime to `/Haiku-Cosmos/runtime/nazwa_pliku.js`;
- automatyczny deploy po merge/push do brancha `Haiku-Cosmos` działa przez GitHub Actions;
- wcześniejszy błąd GitHub Actions `sh: 1: vite: Permission denied` został przypisany do śledzonego `node_modules` / błędnych uprawnień zależności w środowisku Linux i rozwiązany przez usunięcie zależności z repo oraz poprawne ignorowanie dependency artifacts.

## Aktualny model uruchamiania

- Vite jest lokalną warstwą dev/build dla vanilla JS runtime.
- GitHub Pages jest publicznym deploymentem projektu.
- Base path projektu pozostaje `/Haiku-Cosmos/`.
- `dist/` jest artefaktem build/deploy, nie źródłem runtime do edycji.

## Lokalny start

```bash
npm install
npm run dev
```

Dev server Vite zwykle jest dostępny pod adresem:

```text
http://localhost:5173/Haiku-Cosmos/
```

Jeżeli Vite wypisze inny host albo port, należy użyć adresu z konsoli.

## Build produkcyjny

```bash
npm run build
```

Build produkcyjny powstaje w katalogu `dist/`.

## Preview produkcyjnego buildu

```bash
npm run preview
```

Preview służy do lokalnego sprawdzenia zawartości `dist/` z tym samym base path, którego używa GitHub Pages.

## GitHub Pages deployment

Deployment jest skonfigurowany w `.github/workflows/deploy-pages.yml`.

Po każdym pushu na branch `Haiku-Cosmos` GitHub Actions:

1. pobiera repozytorium,
2. instaluje zależności przez `npm ci`,
3. buduje projekt przez `npm run build`,
4. publikuje katalog `dist/` na GitHub Pages.

Workflow ma także `workflow_dispatch`, więc deployment można uruchomić ręcznie. Workflow nie publikuje z `pull_request`. Po merge/pushu do brancha `Haiku-Cosmos` nie trzeba uruchamiać deploya ręcznie, jeżeli push/merge uruchomił workflow; GitHub Pages odświeża się po poprawnym buildzie i deployu.

Docelowy URL GitHub Pages:

```text
https://j42xj297x5-stack.github.io/Haiku-Cosmos/
```

## Vite base

Wartość `base` w `vite.config.js` musi wynosić:

```text
/Haiku-Cosmos/
```

To jest project site GitHub Pages dla repozytorium `Haiku-Cosmos`, a nie user site i nie konfiguracja portfolio.

## Publiczne assety

Publiczne URL-e do assetów należy budować przez globalny helper `HC.publicPath` / `HC.publicAssetPath` z `hc.public_path.js`. Helper jest klasycznym skryptem legacy i wyznacza base path z własnego URL `runtime/hc.public_path.js`, dzięki czemu jest dostępny synchronicznie przed pozostałym runtime zarówno lokalnie, jak i na GitHub Pages.

Przykłady logicznych ścieżek, bez tworzenia tych plików w repo:

```js
publicPath("models/world/nazwa_modelu.glb")
publicPath("/models/world/nazwa_modelu.glb")
publicPath("png/nazwa_pliku.png")
publicPath("svg/nazwa_pliku.svg")
publicPath("textures/nazwa_tekstury.webp")
publicPath("vendor/loaders/GLTFLoader.js")
```

Na GitHub Pages wynik zaczyna się od:

```text
/Haiku-Cosmos/
```

Fizyczny prefiks `public/` nie należy do browser-visible URL. Helper usuwa go defensywnie, ale kanoniczne metadane przechowują logical paths bez `public/`. Nie należy hardkodować nazwy repozytorium, absolutnych URL-i do raw GitHub ani ścieżek zależnych od lokalnego dysku.

## Katalogi przyszłych assetów publicznych

Struktura przygotowana wyłącznie pod przyszłe ręczne wgranie assetów przez projektanta:

```text
public/
  models/
    world/
  png/
  svg/
  textures/
```

Puste katalogi są utrzymywane przez `.gitkeep`. W tym pass nie dodaje się żadnych placeholderów binarnych ani przykładowych assetów: GLB, GLTF, BIN, FBX, OBJ, BLEND, PNG, JPG, JPEG, WEBP ani SVG.

Three.js i `GLTFLoader` pozostają lokalnie vendored w root `vendor/`. Przed dev/build `scripts/sync-public-vendor.mjs` tworzy generowaną kopię `public/vendor/`, dzięki czemu Vite serwuje ten sam kontrakt jako `BASE_URL + vendor/...` lokalnie i kopiuje go do `dist/vendor/`. `hc.three_module_bridge.js` rozwiązuje oba dynamiczne importy wyłącznie przez `publicPath()`; zależność `../three/three.module.min.js` wewnątrz vendored `GLTFLoader.js` pozostaje dostępna w tym samym drzewie.

## Legacy runtime JS w buildzie Vite

Runtime gry nadal używa klasycznych globalnych skryptów JS (`hc.*.js`, `cards.js`, `game.boot.js`) ładowanych przez `<script src="...">`. Nie są one w tym pass przerabiane na moduły ES.

Źródła tych plików pozostają w root repozytorium, a lista plików do publikacji jest jawnie utrzymywana w `scripts/legacy-runtime-files.mjs`. Przed `npm run dev` i `npm run build` skrypt `scripts/sync-legacy-runtime.mjs` kopiuje je do `public/runtime/`. Podczas buildu Vite kopiuje zawartość `public/` do `dist/`, więc finalnie skrypty są dostępne jako:

```text
dist/runtime/hc.core.js
dist/runtime/cards.js
dist/runtime/game.boot.js
```

oraz pozostałe pliki z listy runtime.

HTML ładuje klasyczne runtime skrypty przez ścieżki względne względem dokumentu, np.:

```html
<script src="./runtime/hc.core.js"></script>
<script src="./runtime/cards.js"></script>
<script src="./runtime/game.boot.js"></script>
```

W aktualnym `index.html` zapis może być znormalizowany przez przeglądarkę/narzędzia jako `runtime/nazwa_pliku.js`; istotny jest model względny, bez prefiksowania klasycznych globalnych skryptów przez `%BASE_URL%`. Dla GitHub Pages daje to poprawny URL pod `/Haiku-Cosmos/runtime/...`. Zachowuj kolejność `<script>` z `index.html`: `cards.js` musi pozostać przed modułami, które korzystają z kart, a `game.boot.js` po modułach świata.

Powód tego rozdziału: przy klasycznych scriptach wariant `%BASE_URL%runtime/...` powodował w dev/build błędny, podwójny path `/Haiku-Cosmos/Haiku-Cosmos/runtime/...`. `hc.public_path.js` oraz `hc.submeta_settings.js` są klasycznymi skryptami w `runtime/` i muszą wykonać się przed konsumentami legacy. `hc.three_module_bridge.js` pozostaje modułem, ale korzysta z wcześniej zarejestrowanego globalnego `HC.publicPath`.

Po buildzie `postbuild` uruchamia `scripts/verify-legacy-runtime-dist.mjs`, który przerywa build, jeśli brakuje wymaganego legacy scriptu w `dist/runtime/` albo publicznych entry modules `dist/vendor/three/three.module.min.js` i `dist/vendor/loaders/GLTFLoader.js`.

## Wersjonowanie deploymentu

Workflow przekazuje `github.sha` jako `VITE_BUILD_SHA`. Plugin `transformIndexHtml` dopisuje ten sam parametr `?v=<build-id>` do wszystkich klasycznych skryptów `runtime/` oraz osadza diagnostyczne `window.HC_BUILD_INFO`. Lokalny dev/build tworzy jeden identyfikator `dev-<timestamp>` albo `local-<timestamp>` na start procesu Vite. Moduł `hc.three_module_bridge.js` pozostaje przetwarzany i hashowany przez Vite w `dist/assets/`.

`HC.withBuildVersion(url)` dodaje ten sam identyfikator do lokalnych żądań JSON settings/data bez zmiany ścieżek logicznych. Weryfikator postbuild kontroluje wspólny Build ID, kolejność i kompletność runtime, BuildInfo, fizyczne pliki oraz hashowany bridge ESM.

## Dependency hygiene

- `node_modules` nie może być śledzone przez git.
- `node_modules/` jest ignorowane w `.gitignore`.
- `dist/` pozostaje artefaktem build/deploy, nie źródłem runtime.
- Wcześniejszy błąd GitHub Actions `sh: 1: vite: Permission denied` wynikał ze śledzonego `node_modules` / błędnych uprawnień zależności w środowisku Linux.
