# Haiku Cosmos - SUB-META Components

## Modular Frame Kit v0.1 exported components

Eksport v0.1 dostarcza nowe komponenty frame parts i state accents:

- SUB-META: corners, edges, center ornaments, separator, slot frame, resonance node i bridge line;
- HUD: corners, edges, sequence markers, RP mini frame i button frames;
- Cards: R1 active accent, DS active accent, new-card pulse layer, seen stable layer, locked accent i selected accent.

Static/base relation:

- corners, edges, ornaments, separators, slot frames i HUD frames sa stabilnymi frame parts;
- state accents, sequence markers, bridge/resonance akcenty i new-card pulse sa warstwami dynamicznymi przygotowanymi pod przyszly tinting/animation.

Ten eksport nie implementuje runtime, statusow kart ani FrameComposera.

> Status: KIERUNEK / KATALOG KOMPONENTÓW
> Obszar: SUB-META / HUD / frame parts / dynamic state layers
> Źródło prawdy: TAK, dla rodzin komponentów wizualnych. NIE, dla mechaniki i runtime.
> Ostatnia aktualizacja: 2026-04-28
> Powiązane dokumenty: `MODULAR_FRAME_KIT.md`, `MODULAR_FRAME_KIT_FIGMA_PROMPT.md`, `SUB_META_ASSET_PIPELINE.md`, `SUB_META_FIGMA_ASSET_PASS_01.md`

## 1. Cel dokumentu

Ten dokument porządkuje rodziny komponentów wizualnych dla SUB-META i HUD po decyzji o resecie obecnego SVG passu.

Nowy kierunek:

- frame parts zamiast monolitycznych ramek;
- static base oddzielone od dynamic accent;
- czyste SVG source;
- runtime tinting i animacje jako future pass.

## 2. Static base components

Komponenty stabilne, zwykle bez animacji:

- `frame_part.corner`;
- `frame_part.edge`;
- `frame_part.center_ornament`;
- `panel_frame.neutral`;
- `hud_frame.neutral`;
- `separator.inactive`;
- `slot_frame.inactive`;
- `panel_substrate.dark`.

Zasady:

- cienka linia;
- neutralny materiał;
- brak ciężkiego glow;
- czytelność w małej skali;
- przygotowanie do składania przez FrameComposer.

## 3. Dynamic state layers

Komponenty, które mogą być kolorowane lub animowane live:

- `slot_accent.active`;
- `slot_accent.selected`;
- `slot_accent.hover`;
- `slot_accent.locked`;
- `slot_accent.disabled`;
- `connection_line.active`;
- `connection_line.inactive`;
- `resonance_bridge.active`;
- `sequence_marker.R1`;
- `sequence_marker.R2`;
- `sequence_marker.AA`;
- `sequence_marker.AAA`;
- `cost_state.available`;
- `cost_state.insufficient`;
- `forge_state.active`;
- `ds_state.active`;

Dynamic layer ma wzmacniać odczyt stanu, nie dekorować wszystkiego naraz.

## 4. New-card marker

Nowa karta w magazynie może dostać osobny component/layer:

- `card_state.new_pulse_line`;
- `card_state.new_shimmer_ornament`;
- `card_state.new_draw_in_outline`;
- `card_state.seen_stable`.

Zasada:

- `new` / `untouched` może subtelnie oddychać;
- po obejrzeniu, wyborze albo interakcji karta przechodzi do `seen/touched`;
- `seen/touched` jest stabilne i bez animacji nowości.

To jest kierunek component/UX. Implementacja statusu `seen/touched` jest future pass.

## 5. Slot connection / bridge line

Połączenia slotów powinny mieć własne komponenty:

- `bridge_line.base`;
- `bridge_line.active`;
- `bridge_line.locked`;
- `bridge_line.draw_in`;
- `resonance_node.base`;
- `resonance_node.active`.

Zasady:

- cienka linia;
- subtelny pulse tylko w aktywnym stanie;
- kolor osi lub relacji;
- bez agresywnego neonu;
- brak zmiany mechaniki połączeń w samym design passie.

## 6. Karty w slotach

Karta osadzona w slocie składa się z:

- stabilnej bazy karty;
- czytelnego koloru osi;
- opcjonalnej aktywnej obwódki;
- dynamic accent layer dla `active`, `hover`, `selected`, `locked`, `disabled`.

Bazowy frame karty pozostaje stabilny. Animacje dotyczą wyłącznie warstwy state/accent.

## 7. HUD components

HUD powinien używać prostszego zestawu:

- `hud_frame_part.corner`;
- `hud_frame_part.edge`;
- `hud_sequence_marker`;
- `hud_rp_mini_frame`;
- `hud_submeta_button_frame`;
- `hud_color_counter_frame`;
- `hud_sequence_pulse_accent`.

HUD ma pozostać minimalny i nie zasłaniać świata.

## 8. Figma component rules

Każdy komponent:

- clean name;
- grouped layers;
- transparent background;
- no embedded fonts;
- no bitmap;
- no base64;
- no baked heavy shadow/glow;
- predictable bounds;
- base/static i accent/dynamic jako osobne warstwy lub warianty.

## 9. Granice

Ten dokument nie definiuje:

- mechaniki kart;
- kosztów RP;
- zasad sekwencji;
- implementacji FrameComposer;
- statusu `seen/touched` w runtime.

To katalog komponentów pod przyszły Figma pass i późniejszą integrację runtime.
