# Vite + GitHub Pages deployment

> Status: CURRENT — immutable deployment model

## ONE DEPLOYMENT RUN = ONE IMMUTABLE BUILD ID

GitHub Actions provides separate source and execution identifiers:

```text
VITE_BUILD_SHA=${{ github.sha }}
VITE_BUILD_ID=${{ github.sha }}-${{ github.run_id }}-${{ github.run_attempt }}
```

A rerun of the same commit therefore has a different immutable URL. `npm ci` is required in CI.

## Canonical URLs

Only the root and metadata are stable:

```text
/Haiku-Cosmos/
/Haiku-Cosmos/build-meta.json
```

The root fetches metadata with timestamp, `cache: "no-store"`, and same-origin credentials, then performs `location.replace(meta.appPath)`. The canonical application document is:

```text
/Haiku-Cosmos/builds/<BUILD_ID>/index.html
```

`assetBase` is `/Haiku-Cosmos/builds/<BUILD_ID>/`; `integrityPath` is its `build-integrity.json`. `/latest/index.html` is only a compatibility redirect shell and never loads the game.

## Layout and integrity

Every local runtime, Vite asset, settings/data JSON, PNG/SVG, textures, GLB, font, vendor, and model is inside `builds/<BUILD_ID>/`. The app embeds its own `HC_BUILD_INFO` and ordered relative release manifest. `build-integrity.json` contains SHA-256 and size for every build file except itself; `verify-legacy-runtime-dist.mjs` recalculates all hashes.

## Build, test, preview

```bash
npm ci
npm run validate:content
npm run test
npm run build
npm run preview
```

Use `tools/deployment/browser-cache-probe.js` by pasting it into Chrome DevTools while the immutable app document is open. It makes default, reload, and no-store requests, compares SHA-256 hashes to each other and to the integrity manifest, displays `console.table`, and does not mutate storage or reload.
