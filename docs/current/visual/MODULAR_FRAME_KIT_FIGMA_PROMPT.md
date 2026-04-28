# Haiku Cosmos - Modular Frame Kit Figma Prompt

> Status: KIERUNEK / PROMPT WYKONAWCZY
> Obszar: Figma / SUB-META / HUD / modular frame kit
> Źródło prawdy: TAK, dla następnego passu Figma frame parts
> Ostatnia aktualizacja: 2026-04-27
> Nie obejmuje: runtime, mechaniki, FrameComposer implementation, raster pipeline

## 1. Cel passu

Zaprojektuj od zera czysty modular frame kit dla SUB-META i HUD Haiku Cosmos.

Nie używaj obecnych `style_correction` SVG jako bazy produkcyjnej. Traktuj je wyłącznie jako legacy/evidence oraz negatywną lekcję audytu: monolityczne ramy, baked filters i stałe kolory nie są docelowym kierunkiem.

## 2. Zakazy projektowe

Nie projektować:

- pełnych monolitycznych ramek;
- full-frame overlayów;
- finalnych raster backgrounds;
- bitmap;
- base64;
- embedded fonts;
- ciężkich wypalonych shadows/glows;
- assetów, które wymagają ręcznego skalowania jako jeden duży obraz.

## 3. Projektować wyłącznie modular parts

Zakres komponentów:

- corners;
- edges;
- center ornaments;
- slot frames;
- resonance nodes;
- bridge / connection lines;
- card state accents;
- new-card marker;
- sequence marker.

Każdy komponent powinien być samodzielnym SVG-friendly part, możliwym do późniejszego złożenia w runtime.

## 4. Linie

Linie powinny być:

- cienkie;
- skalowalne;
- czytelne w małej skali;
- bez pogrubiania przy rozciąganiu;
- przygotowane pod `vector-effect="non-scaling-stroke"` albo pod łatwy post-process po eksporcie.

## 5. Kolory

Zasady koloru:

- bazowe elementy neutralne;
- accent layers przygotowane pod runtime tinting;
- nie bake'ować na stałe wszystkich kolorów;
- kolory osi traktować jako warstwę akcentu/stanu, nie jako pełne zalanie ramy.

Neutral base: grafit, perła, przygaszone złoto, ciemny panel substrate.

Accent: RED/YELLOW/GREEN/BLUE oraz piąty stan dla DS/specjalnych warstw.

## 6. Efekty

Nie bake'ować ciężkiego glow/shadow.

Figma może pokazać wariant poglądowy z glow/pulse/shimmer, ale źródłowy SVG part ma pozostać czysty.

Docelowo:

- glow = runtime effect layer;
- pulse = runtime effect layer;
- shimmer = runtime effect layer;
- draw-in = runtime animation hook.

## 7. Rodziny stylu

Główna rodzina:

- astrolabe / alchemical.

Gniazda i relacje:

- sacred / eldritch subtle.

Kuźnia:

- forge / brass jako osobny przyszły zestaw, bez pełnej produkcji w tym passie.

HUD:

- minimal / sequence.

## 8. Minimalny zestaw pierwszego nowego passu

### A. SUB-META astrolabe modular frame kit

- 4 corners;
- 4 edges;
- top-center ornament;
- bottom-center ornament;
- 1 separator;
- 1 slot frame;
- 1 resonance socket;
- 1 bridge line.

### B. HUD minimal sequence kit

- 4 corners;
- 4 edges;
- 1 sequence marker;
- 1 RP mini frame;
- 1 SUB-META button frame.

### C. Card state accents

- R1 slot active accent;
- DS slot active accent;
- new-card pulse layer;
- seen-card stable layer.

## 9. SVG-friendly component rules

Każdy component/layer:

- clean name;
- grouped layers;
- transparent background;
- no embedded fonts;
- no bitmap;
- no base64;
- no baked heavy shadows;
- no final raster background;
- predictable bounds;
- source part oddzielony od preview/effect variant.

## 10. Naming direction

Preferowane nazwy logiczne:

```text
submeta/frame_part/astrolabe/corner_tl_01
submeta/frame_part/astrolabe/edge_top_01
submeta/frame_part/astrolabe/ornament_top_center_01
submeta/slot_frame/astrolabe/base_01
submeta/resonance_socket/sacred/base_01
submeta/bridge_line/sacred/base_01
hud/frame_part/minimal/corner_tl_01
hud/sequence_marker/minimal/base_01
card_state/r1/active_accent_01
card_state/ds/active_accent_01
card_state/new/pulse_layer_01
card_state/seen/stable_layer_01
```

## 11. Acceptance checklist

Pass jest akceptowalny dopiero gdy:

- nie ma full-frame overlayów jako głównego deliverable;
- corners/edges/ornaments da się składać niezależnie;
- base i accent layers są rozdzielone;
- SVG nie zawiera bitmap, base64 ani fontów;
- source SVG nie ma ciężkich baked effects;
- minimalny zestaw A/B/C jest kompletny.
