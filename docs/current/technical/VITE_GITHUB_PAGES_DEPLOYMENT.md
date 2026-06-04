# Vite + GitHub Pages deployment

> Status: CURRENT
> Obszar: techniczny deployment runtime Haiku Cosmos
> Repozytorium: `j42xj297x5-stack/Haiku-Cosmos`
> Branch publikujący: `Haiku-Cosmos`

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

Workflow ma także `workflow_dispatch`, więc deployment można uruchomić ręcznie. Workflow nie publikuje z `pull_request`.

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

Publiczne URL-e do assetów należy budować przez helper `publicPath` / `publicAssetPath` z `hc.public_path.js`. Helper używa `import.meta.env.BASE_URL`, więc działa lokalnie i na GitHub Pages z base path `/Haiku-Cosmos/`.

Przykłady logicznych ścieżek, bez tworzenia tych plików w repo:

```js
publicPath("models/world/nazwa_modelu.glb")
publicPath("/models/world/nazwa_modelu.glb")
publicPath("png/nazwa_pliku.png")
publicPath("svg/nazwa_pliku.svg")
publicPath("textures/nazwa_tekstury.webp")
```

Na GitHub Pages wynik zaczyna się od:

```text
/Haiku-Cosmos/
```

Nie należy hardkodować absolutnych URL-i do raw GitHub ani ścieżek zależnych od lokalnego dysku.

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

Obecny Three.js runtime pozostaje przy lokalnie vendored Three (`vendor/three`) i nie przełącza się automatycznie na npm `three`; dodanie GLTFLoadera lub render passu GLB wymaga osobnej decyzji, żeby nie mieszać runtime vendored/npm bez kontroli wersji.

## Legacy runtime JS w buildzie Vite

Runtime gry nadal używa klasycznych globalnych skryptów JS (`hc.*.js`, `cards.js`, `game.boot.js`) ładowanych przez `<script src="...">`. Nie są one w tym pass przerabiane na moduły ES.

Źródła tych plików pozostają w root repozytorium, a lista plików do publikacji jest jawnie utrzymywana w `scripts/legacy-runtime-files.mjs`. Przed `npm run dev` i `npm run build` skrypt `scripts/sync-legacy-runtime.mjs` kopiuje je do `public/runtime/`. Podczas buildu Vite kopiuje zawartość `public/` do `dist/`, więc finalnie skrypty są dostępne jako:

```text
dist/runtime/hc.core.js
dist/runtime/cards.js
dist/runtime/game.boot.js
```

oraz pozostałe pliki z listy runtime.

HTML musi ładować klasyczne skrypty przez ścieżki świadome `base`, np.:

```html
<script src="%BASE_URL%runtime/hc.core.js"></script>
<script src="%BASE_URL%runtime/cards.js"></script>
<script src="%BASE_URL%runtime/game.boot.js"></script>
```

Dla GitHub Pages daje to URL-e pod `/Haiku-Cosmos/runtime/...`. Zachowuj kolejność `<script>` z `index.html`: `cards.js` musi pozostać przed modułami, które korzystają z kart, a `game.boot.js` po modułach świata.

Po buildzie `postbuild` uruchamia `scripts/verify-legacy-runtime-dist.mjs`, który przerywa build, jeśli którykolwiek wymagany legacy script nie istnieje w `dist/runtime/`.
