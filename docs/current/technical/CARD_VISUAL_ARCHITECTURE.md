# Haiku Cosmos - Card Visual Architecture

> Status: ROBOCZY / ARCHITEKTURA TECHNICZNA
> Obszar: cards.js / card visuals / FrameComposer / visual assets
> Zrodlo prawdy: NIE dla mechaniki; TAK roboczo dla granic modulow wizualnych
> Ostatnia aktualizacja: 2026-04-28
> Powiazane dokumenty: ../systems/CARDS_SYSTEM.md, ../systems/SUB_META_SYSTEM.md, ../ui/UI_WORLD.md, ../visual/MODULAR_FRAME_KIT.md, ../visual/SUB_META_COMPONENTS.md, ../visual/SUB_META_ASSET_PIPELINE.md

## 1. Cel

Ten dokument przygotowuje rozdzial mechaniki kart od wizualizacji kart przed kolejnymi passami Modular Frame Kit v0.1, card visuals i przyszlym FrameComposerem.

Obecnie `cards.js` jest zbyt szerokim modulem. Obsluguje jednoczesnie:

- mechanike kart i sekwencji;
- pending cards i `cardsPool`;
- SUB-META assign/remove/forge;
- koszty i relacje SUB-META;
- rendering kart, HUD kart i SUB-META;
- fallbackowy loader SVG / Image;
- formatowanie wizualne kart, slotow i overlay.

To bylo uzyteczne dla szybkiej integracji, ale dalszy rozwoj SVG, tintingu, animacji i FrameComposera nie powinien powiekszac `cards.js`.

## 2. Decyzja architektoniczna

Rozdzielamy cztery odpowiedzialnosci:

1. `cards.js` - mechanika kart i decyzje runtime.
2. `hc.card_visuals.js` - rysowanie i formatowanie wizualne kart.
3. `hc.frame_composer.js` - skladanie ramek z modularnych frame parts.
4. `hc.visual_assets.js` - ladowanie manifestow, cache i helpery assetow SVG/Image.

Ten krok nie wykonuje refaktoru. Tworzy tylko kontrakt i bezpieczny scaffolding.

## 3. `cards.js` - mechanika kart

`cards.js` pozostaje wlascicielem logiki mechanicznej do czasu osobnych extraction passow.

Obejmuje:

- typy kart i ich normalizacje;
- sekwencje R1/R2/R3/R4, AA/AAA i pending;
- `cardsPool`, inventory, assign/remove;
- Kuźnie / forge i koszty RP;
- relacje SUB-META i PRG;
- decyzje aktywacji, cash-out, fail i timeout;
- czy dana karta moze byc uzyta, przypisana, usunieta albo przekuta.

`cards.js` moze wywolac helper wizualny, ale nie powinien znac szczegolow SVG, frame parts, tintingu ani animacji.

## 4. `hc.card_visuals.js` - wizualizacja kart

Docelowy modul dla rysowania kart i card preview.

Obejmuje:

- rysowanie bazowej karty;
- rysowanie ramy karty;
- tier badge / type marker;
- kolorowe pola R1/R2/R3/R4;
- DS / ether visual treatment;
- card preview w panelu info;
- wizualne stany `new`, `seen`, `selected`, `locked`, `active`, `disabled`;
- przygotowanie danych rysowania dla canvas/DOM, bez decyzji mechanicznych.

Nie obejmuje:

- tworzenia kart;
- zmiany `cardsPool`;
- liczenia kosztow;
- decyzji, czy karta jest legalna;
- sekwencji i fail/cash-out;
- modyfikacji `World.score`.

## 5. `hc.frame_composer.js` - FrameComposer

Docelowy modul dla skladania ramek z modularnych czesci.

Obejmuje:

- corners + edges + ornaments;
- slot frames, separators, resonance nodes i bridge lines;
- przyszle warianty layoutu dla SUB-META, HUD i card preview;
- pozniejsze wsparcie tinting / state layers jako parametr wizualny;
- fallback, gdy czesc ramy nie jest dostepna.

Nie obejmuje:

- mechaniki kart;
- kosztow RP;
- sekwencji;
- decyzji aktywnego wiazania;
- wyboru, czy slot moze przyjac karte.

FrameComposer dostaje dane wejściowe z zewnatrz, np. rect, typ ramy, stan wizualny i liste assetow. Nie pyta `cards.js`, dlaczego stan istnieje.

## 6. `hc.visual_assets.js` - visual asset loader

Docelowy modul dla assetow wizualnych.

Obejmuje:

- ladowanie manifestow visual;
- cache `Image` / SVG;
- helpery typu `loadManifest`, `getAssetPath`, `getImage`, `drawImageAsset`;
- walidacje obecnosci assetu;
- fallback techniczny dla brakujacych assetow.

Nie obejmuje:

- decyzji, ktory card state jest aktywny;
- mechaniki SUB-META;
- layoutu FrameComposera;
- pelnej transformacji SVG lub tintingu warstw.

Pierwszym manifestem do obslugi bedzie `assets/visual/modular_frame_kit_v01_manifest.json`, ale integracja runtime jest osobnym etapem.

## 7. Czego nie wolno przenosic do visual

Do modulow visual nie wolno przenosic:

- sekwencji R-track / A-loop;
- `pendingCard`, `pendingCardUntilMs` i decyzji timeout;
- zasad award/cash-out/fail;
- kosztow RP i forge;
- przypisywania/usuwania kart ze slotow;
- walidacji allowed slots;
- aktywacji R1/R2;
- efektow mechanicznych na swiat;
- source of truth dla `cardsPool`.

Visual moze dostac juz obliczony stan i go narysowac.

## 8. Czego nie wolno zostawiac w `cards.js` w kolejnych passach

Przy kolejnych passach nie powiekszac `cards.js` o:

- szczegolowe SVG drawing;
- frame parts assembly;
- live-coloring/tinting logic;
- animacje state layers;
- duze funkcje renderujace karty;
- style preview i ornamenty;
- cache obrazow i manifest loader;
- jeden wielki renderer calej SUB-META.

Jesli nowy kod dotyczy wygladu, powinien trafic do `hc.card_visuals.js`, `hc.frame_composer.js` albo `hc.visual_assets.js`.

## 9. Plan migracji etapowej

### Etap 0 - obecny stan

`cards.js` zawiera mechanike i rendering:

- sequence engine;
- inventory / forge / SUB-META interactions;
- HUD card counters;
- `renderMetaCard`;
- `renderSubMetaOverlay`;
- fallbackowy loader SVG.

### Etap 1 - scaffolding

Dodać minimalne moduly:

- `hc.visual_assets.js`;
- `hc.frame_composer.js`;
- `hc.card_visuals.js`.

Bez zmiany runtime behavior. Pliki moga byc no-op namespaces i nie musza byc jeszcze podlaczone do `index.codex.html`.

### Etap 2 - extraction

Przeniesc czyste funkcje rysowania kart do `hc.card_visuals.js`, zaczynajac od:

- `renderMetaCard`;
- helperow tier/type/state drawing;
- helperow card preview.

`cards.js` powinien przekazywac dane karty i opcje rysowania, ale nie rysowac detalu.

### Etap 3 - visual asset loader

Przeniesc manifest/cache/draw SVG do `hc.visual_assets.js`:

- obecny `ensureSvgManifestLoaded`;
- `getSvgPath`;
- `drawManifestSvg`;
- `svgImageCache`.

Przejsc z legacy manifestu na nowy manifest dopiero w osobnym runtime integration pass.

### Etap 4 - FrameComposer

Dodać realny `hc.frame_composer.js` i wykorzystac Modular Frame Kit v0.1:

- corners;
- edges;
- center ornaments;
- slot frames;
- resonance nodes;
- bridge lines;
- HUD minimal frame parts.

To nadal nie moze zmienic mechaniki kart.

### Etap 5 - card visual states

Dodać wizualne stany:

- `new`;
- `seen` / `touched`;
- `selected`;
- `locked`;
- `active`;
- `disabled`.

Te stany sa interpretacja UX/visual istniejacego stanu. Nie zmieniaja typu karty ani reguly mechanicznej.

### Etap 6 - animations

Dodać subtelne animacje state layers:

- new card pulse;
- active slot line;
- bridge line pulse;
- selected shimmer;
- DS / ether accent.

Animacje sa warstwa akcentu, nie zrodlem prawdy.

## 10. Static vs Dynamic Card Visual States

### STATIC

Warstwy statyczne:

- bazowa karta;
- bazowa rama;
- tier badge;
- type marker;
- slot placeholder;
- seen-card stable layer.

Te elementy moga byc stale, bez animacji. Ich celem jest czytelnosc typu, tieru i przynaleznosci systemowej.

### DYNAMIC

Warstwy dynamiczne:

- new-card pulse layer;
- active slot accent;
- selected slot accent;
- locked / disabled accent;
- DS / ether accent;
- bridge / connection line;
- sequence marker.

Dynamic state nie definiuje mechaniki. Jest tylko sposobem pokazania, ze mechanika juz ustawila stan lub ze UI zna aktualny kontekst.

## 11. Data flow docelowy

Docelowy przeplyw:

```text
cards.js / World state
  -> view model / draw options
  -> HC.CardVisuals
  -> HC.FrameComposer
  -> HC.VisualAssets
  -> canvas / DOM
```

Zasada:

- mechanika decyduje;
- visual interpretuje;
- asset loader dostarcza material;
- renderer rysuje.

## 12. Rules for future Codex tasks

- Nowe assety visual nie trafiaja bezposrednio do `cards.js`.
- FrameComposer nie zna mechaniki kart.
- Card visuals dostaja dane wejsciowe, nie decyduja o logice.
- `new` / `seen` / `touched` to stan UX/visual, nie zmiana typu karty.
- Animacje sa warstwa akcentu, nie zrodlem prawdy.
- Jesli funkcja renderujaca przekracza rozsadna dlugosc, wydzielic helper.
- Unikac jednego wielkiego pliku renderujacego cala SUB-META.
- Integracja nowych SVG wymaga osobnego passu runtime integration.
- Kazdy visual pass musi zachowac zgodnosc z `CARDS_SYSTEM.md`, `SUB_META_SYSTEM.md` i `UI_WORLD.md`.

## 13. Status tego kroku

Ten dokument nie zmienia runtime behavior.

Dodanie no-op namespace plikow jest bezpiecznym scaffoldingiem, ale ich podpiecie do `index.codex.html` powinno nastapic dopiero wtedy, gdy pierwszy extraction pass bedzie gotowy i testowany.

## 14. Font relation (card visuals vs mechanika)

Warstwa visual kart ma uzywac wspolnych tokenow typografii, a nie lokalnych ad-hoc fontow.

Zasady:

- `HC.CardVisuals` korzysta z tokenow font systemu (`--hc-font-ui`, `--hc-font-display`, `--hc-font-mono`);
- tytul karty i etykiety UI pozostaja w rejestrze UI/body;
- haiku / tekst poetycki moze miec spokojniejszy rejestr niz label techniczny;
- renderowanie tekstu musi dopuszczac dluzsze tlumaczenia (pl/en i kolejne locale), bez zakladania stalej dlugosci stringa;
- decyzja o konkretnym loaderze fontow pozostaje osobnym passsem.

## 15. I18N note dla visual architecture

- UI text i card text powinny docelowo przejsc na locale keys.
- Ten krok nie wdraza loadera i18n.
- Nie przenosimy masowo tekstow z runtime do slownikow.
- Polski pozostaje jezykiem glownym, angielski pierwszym jezykiem alternatywnym.
- Brak tlumaczen nie moze zablokowac UI; visual ma umiec pokazac bezpieczny fallback.

Dodatkowe doprecyzowanie stanu kart:

- `new-card pulse` jest stanem visual/UX;
- `seen` / `touched` wygasza ruch i stabilizuje karte;
- powyzsze stany nie zmieniaja mechaniki, typu karty ani zasad sekwencji.
## 11. Update status — infrastructure modules available (2026-04-28)

Wykonany zostal bezpieczny krok infrastrukturalny bez zmiany mechaniki:

- `hc.visual_assets.js`: loader/cache/lookup dla `modular_frame_kit_v01_manifest.json`;
- `hc.frame_composer.js`: pure layout calculations i debug helpers bez decyzji gameplayowych;
- `hc.card_visuals.js`: pozostaje modułem scaffolding/no-op (integracja extraction pass).

Zasady utrzymane:

- `cards.js` nie powinien bezposrednio ladowac nowych modularnych SVG jako docelowego renderingu;
- integracja produkcyjna SUB-META pozostaje osobnym pass;
- FrameComposer moze byc podpinany etapowo przez `HC.CardVisuals`, nie przez rozszerzanie mechaniki `cards.js`.

