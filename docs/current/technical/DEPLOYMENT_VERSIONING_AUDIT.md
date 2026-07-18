# Executive Summary
The confirmed defect was a URL-to-bytes mismatch: a rerun used the commit SHA as `BUILD_ID` while embedding a new `builtAt` timestamp under the same `/builds/<sha>/` URL.

# Potwierdzona wada starego modelu
Vite set `id` from `VITE_BUILD_SHA`; GitHub Pages could therefore serve changed files at a previously cacheable URL. Root redirected to the stable `latest/?v=<sha>` application document. `no-store` applied only to the metadata fetch, not that HTML document.

# Dlaczego samo github.sha nie było bezpiecznym BUILD_ID
A SHA identifies source, not a deployment execution. Reruns may differ through `builtAt`, generated public copies, synchronization order, and the old `npm install` resolution behavior.

# Dlaczego builtAt łamał pozorną niezmienność URL-a
`builtAt` is embedded in `HC_BUILD_INFO`; it changes bytes even for identical source. Reusing the SHA URL made cache divergence legal. A repeated `?v=` is not unique.

# Wpływ npm install
`npm install` may update the lockfile or resolve according to current package metadata; deployment now uses lockfile-enforcing `npm ci`.

# Stabilny latest kontra immutable app document
`/latest/` is now only a compatibility redirect shell. It has no game markup, manifest, or runtime. The app document is immutable.

# Nowy model BUILD_ID
**ONE DEPLOYMENT RUN = ONE IMMUTABLE BUILD ID.** Workflow uses `${github.sha}-${github.run_id}-${github.run_attempt}`. Vite validates URL-safe IDs and local builds use a timestamp ID.

# Nowy przepływ root → build-meta → immutable appPath
Root fetches `build-meta.json?t=<timestamp>` with `cache: no-store` and same-origin credentials, validates it, and replaces location with `/Haiku-Cosmos/builds/<BUILD_ID>/index.html`.

# Zakres zasobów objętych BUILD_ID
The immutable directory contains runtime, assets, settings, data, PNG/SVG, textures, GLB, fonts, vendor, models and the Vite asset output. Runtime URL helpers use embedded `assetBase`.

# Build integrity manifest
`build-integrity.json` records sorted relative paths, SHA-256, and byte size for every build file except itself. The verifier recalculates every entry.

# Test dwóch wykonań tego samego commita
`tests/deployment-versioning.test.mjs` builds one SHA twice with attempt IDs `...-1` and `...-2`, proving distinct app paths and no reference from build B to A.

# Browser cache probe
Paste `tools/deployment/browser-cache-probe.js` into DevTools on the running game. It compares default/reload/no-store SHA-256 values and the integrity manifest without changing storage or reloading.

# Ryzyka i ograniczenia GitHub Pages
The root and metadata remain intentionally stable and must be revalidated. Pages deployment is an artifact replacement, so old immutable paths are not retained across separate deployments; no URL within one published artifact maps to changing bytes.

# Kryteria akceptacji
A rerun changes `BUILD_ID`, appPath, assetBase, and integrityPath; the immutable app has no `/latest/` dependency; all listed artifacts pass SHA-256 verification.
