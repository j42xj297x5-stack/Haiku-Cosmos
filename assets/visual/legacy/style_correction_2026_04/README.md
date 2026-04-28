# style_correction_2026_04 legacy evidence

> Status: LEGACY / EVIDENCE / STYLE EXPLORATION
> Data decyzji: 2026-04-27
> Zakres: SUB-META/HUD SVG style_correction pass oraz runtime test assets

Ten katalog zachowuje obecny pass SVG po audycie Modular Frame Kit.

Decyzja projektowa:

- pliki sa evidence i materialem porownawczym,
- nie sa kanonem wizualnym,
- nie sa produkcyjnymi assetami runtime,
- nie sa baza dla przyszlego FrameComposera.

## Struktura

- `figma_export/` - lokalny eksport z `Figma/*/style_correction`.
- `runtime_test_assets/` - kopie, ktore byly podlaczone testowo w `assets/visual/submeta/svg/*` i `assets/visual/hud/svg/frames/*`.

## Powod wycofania

Audyt wykazal, ze zestaw sklada sie glownie z monolitycznych ramek i duplikatow Figma/assets, z baked-in filtrami glow/shadow, stalymi kolorami, niespojnymi grupami warstw i bez `vector-effect="non-scaling-stroke"`.

Nowe ramki maja powstac od zera w Figmie jako modular frame kit: corners, edges, center ornaments, slot frames, resonance nodes, bridge/connection lines, sequence markers i card state accents.
