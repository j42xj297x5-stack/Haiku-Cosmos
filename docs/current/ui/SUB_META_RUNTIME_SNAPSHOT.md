# SUB-META Runtime Snapshot

> Status: AKTYWNY SNAPSHOT RUNTIME
> Obszar: SUB-META / DOM UI / settings / debug
> Źródło prawdy: TAK, dla bieżącej ścieżki implementacyjnej SUB-META
> Data snapshotu: 2026-06-12
> Powiązane dokumenty: `UI_WORLD.md`, `../README_ARCHITECT.md`, `../maps/PROJECT_INDEX.md`, `../maps/DEPENDENCY_MAP.md`

## Status

Etap statycznego overlayu, placeholderów gameplayowych, paneli roboczych i debug workflow jest zamknięty. Placeholdery działają i na tym etapie nie wymagają dalszej przebudowy. Ten snapshot ma pierwszeństwo nad wcześniejszymi opisami layoutu i implementacji SUB-META, gdy dotyczą one bieżącego runtime.

## Active runtime path

Aktywna ścieżka to:

- statyczny overlay PNG/CSS;
- runtime settings ładowane z `public/settings/`;
- gameplayowe placeholdery i ich stany;
- panele Magazyn, Możliwości, Kuźnia i Opis;
- karty SVG w roboczym UI oraz PNG w podglądzie Opisu, jeśli istnieje;
- debug Import/Export JSON przez textarea.

## Legacy/reference

W kontekście runtime SUB-META status `legacy/reference` mają:

- stare canvasowe SUB-META jako główny model UI;
- FrameComposer jako aktywny system runtime/layoutu;
- Figma jako źródło prawdy bieżącego layoutu runtime;
- starsze specyfikacje, tokeny i wireframe’y SUB-META v2, jeżeli konfliktują z tym snapshotem.

FrameComposer może pozostać historycznym kontraktem, eksperymentem lub materiałem referencyjnym. Figma może pozostać materiałem wizualnym/reference. Żadne z nich nie jest aktualnym systemem wdrożeniowym ani source-of-truth layoutu runtime SUB-META.

## Settings source of truth

| Zakres | Plik w repo | Runtime URL |
| --- | --- | --- |
| PNG layout | `public/settings/submeta-png-layout.json` | `settings/submeta-png-layout.json` |
| Placeholdery | `public/settings/submeta-placeholders.json` | `settings/submeta-placeholders.json` |
| Panele | `public/settings/submeta-placeholders-panels.json` | `settings/submeta-placeholders-panels.json` |

Zasady:

- runtime URL nie ma prefiksu `public/`;
- `public/png/submeta/` jest katalogiem obrazów PNG, nie settings JSON;
- po odświeżeniu default pochodzi z plików `public/settings/`;
- localStorage nie jest źródłem prawdy dla presetów ani layoutów SUB-META i nie może mieć pierwszeństwa nad settings JSON.

## Modules

- `hc.submeta_png.js` — statyczny overlay PNG/CSS, bazowy layout i akcje Wróć/Potwierdź.
- `hc.submeta_placeholders.js` — gameplayowe sloty PRG/Świata/R2/R3/R4/dust/special/artifact, ich pozycje, `zIndex` i stany `visible`, `active`, `occupied`, `locked`, `pending`.
- `hc.submeta_panels.js` — Magazyn, Możliwości, Kuźnia, Opis, gridy, recty Opisu, karty panelowe oraz panelowy Import/Export JSON.
- `hc.submeta_settings.js` — centralne ścieżki settings, loader JSON i rozwiązywanie URL przez public path helper.
- `hc.ui_debug.js` — debug UI, edycja layoutów, Import/Export JSON, Reset defaults i preset testowy kart.
- `cards.js` — część domeny kart oraz stanu `CardEngine`/`subMeta`, w tym wąski bridge dla DOM SUB-META. Nie wykonywać szerokiego refaktoru bez osobnego zadania.

## Debug workflow

1. Default ładuje się z właściwego pliku `public/settings/`.
2. **Export JSON** wpisuje aktualny stan do textarea.
3. **Import JSON** aplikuje zawartość textarea wyłącznie do bieżącego runtime.
4. Użytkownik ręcznie kopiuje wyeksportowany JSON do odpowiedniego pliku settings.
5. **Reset defaults** ponownie ładuje plik z `public/settings/`.
6. Save/Load localStorage nie należy do workflow layoutów/presetów SUB-META.

Nie przywracać pierwszeństwa localStorage nad settings JSON: poprzednio powodowało ono fałszywą diagnozę, że plik settings się nie ładuje.

Kontrakt debug UI dla tego etapu: sekcje ustawień są domyślnie zwinięte, długie ścieżki/statusy są zawijane, a Import/Export JSON odbywa się przez textarea w każdej sekcji. Nie przywracać przycisków **Show PNG layout preview**, **Close SUB-META** ani **Save/Load localStorage**.

Debug preset kart jest zaimplementowany: ustawia po 13 sztuk obsługiwanych stosów kart i 500 RP. Służy wyłącznie do testów/debugu i nie definiuje balansu ani normalnej mechaniki.

## Placeholder layer

Zamknięty zakres obejmuje PRG R1, PRG R2, gniazda R3/R4, Świat R1, Świat R2 oraz przygotowane gniazda special/dust/artifact. Obejmuje też stany placeholderów, debugowe strojenie oraz konfigurację w `public/settings/submeta-placeholders.json`.

## Panels layer

- **Magazyn** pokazuje karty z puli.
- **Możliwości** pokazują karty pasujące do wybranego placeholdera.
- **Opis** pokazuje wybraną kartę, placeholder albo stan pending.
- **Kuźnia** ma roboczy layout, ale nie jest jeszcze pełnym systemem craftingu.

Konfiguracja paneli znajduje się w `public/settings/submeta-placeholders-panels.json`.

## Card rendering

Karty w Magazynie, Możliwościach, slotach PRG, slotach Świata, pending preview i Kuźni renderują assety z `public/svg/`. Panel Opis używa PNG z `public/png/cards/`, jeśli odpowiedni plik jest dostępny, a w przeciwnym razie wraca do SVG. Wszystkie publiczne URL-e kart przechodzą przez `HC.publicPath` / `HC.publicAssetPath`; błąd ładowania zachowuje proceduralny fallback i emituje pojedynczy warning dla danego assetu.

Obsługiwane są R1 RED/YELLOW/GREEN/BLUE oraz wszystkie sześć kanonicznych, nieuporządkowanych par R2 w tierach DR/sDR/pDR. Resolver normalizuje pary R2 według kolejności RED, YELLOW, GREEN, BLUE, więc dane `yellow/red` wskazują `card_r2_red_yellow_<tier>.svg`.

- standardowy ratio karty: `9:16`;
- tier jest częścią assetu SVG/PNG;
- kod nie dodaje zewnętrznej ramki tieru;
- kodowy outline służy tylko stanom hover/selected/pending/focus;
- licznik w Magazynie ma tło koloru karty i wysokość około 25% wysokości karty.

## Assignment flow

1. Klik placeholdera wybiera cel.
2. Możliwości pokazują pasujące karty.
3. Klik karty tworzy `pendingAssignment`; nie zapisuje karty do slotu.
4. Karta pojawia się jako preview nad slotem.
5. Przycisk Potwierdź przechodzi w stan aktywny.
6. Dopiero klik Potwierdź finalizuje przypisanie.
7. Po sukcesie pending jest czyszczony, slot przechodzi w `occupied`, a widoki są odświeżane.

Potwierdź jest jedynym momentem finalizacji. Ten etap nie obejmuje kosztów RP, wyjmowania, podmiany, pyłu ani craftingu.

## Do not regress

Nie przywracać:

- localStorage jako źródła presetów/layoutów SUB-META;
- `public/png/submeta/` jako katalogu settings;
- natychmiastowego przypisywania kart bez Potwierdź;
- zewnętrznej ramki tieru generowanej przez kod;
- kwadratowych kart w panelach;
- Figma jako source-of-truth layoutu runtime;
- FrameComposer jako aktywnego runtime/layout systemu SUB-META;
- starego canvasowego SUB-META jako głównej ścieżki;
- mieszania PNG/settings workflow ze starym SUB-META.

Bez osobnego zadania nie implementować kosztów RP, wyjmowania/podmiany kart, pyłu, pełnej Kuźni/craftingu, mechaniki R4, refaktoru `cards.js` ani trwałego save gracza.

## Next possible steps

Planowane osobno: wyjmowanie/podmiana kart, koszty RP, pył i utrzymanie kart, Kuźnia/crafting, mechanika R4, dalsze assety SVG/PNG, porządkowanie `cards.js` oraz testy runtime/debug.
