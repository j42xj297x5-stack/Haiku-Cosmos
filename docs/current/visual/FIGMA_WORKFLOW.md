<<<<<<< Updated upstream
# Haiku Cosmos — FIGMA WORKFLOW

> Status: KIERUNEK / WORKFLOW WYKONAWCZY
> Obszar: Figma / Codex / design workflow
> Źródło prawdy: TAK, dla pracy Codexa z Figma; NIE, dla mechaniki i raster pipeline
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: `docs/current/visual/README.md`, `docs/current/visual/ART_DIRECTION.md`, `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`, `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`, `docs/current/visual/SUB_META_FIGMA_BRIEF.md`, `docs/current/visual/SUB_META_LAYOUT_SPEC.md`, `docs/current/visual/SUB_META_COMPONENTS.md`, `docs/current/visual/SUB_META_ASSET_PIPELINE.md`, `docs/current/visual/SUB_META_TYPOGRAPHY.md`, `docs/current/visual/SUB_META_RESPONSIVE_SCALING.md`, `docs/current/visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md`, `docs/current/systems/SUB_META_SYSTEM.md`, `docs/current/ui/UI_WORLD.md`

## 1. Cel dokumentu

Ujednolicić sposób pracy Codexa z Figma w Haiku Cosmos oraz rozdzielić dwa osobne pipeline’y: **vector/component** i **raster/background**.

## 2. Czym Figma jest w projekcie

Figma jest miejscem projektowania:
- wektorów SVG,
- komponentów UI,
- layoutu,
- typografii,
- wariantów stanów komponentów,
- bibliotek komponentów,
- zasad design system,
- późniejszego mappingu design → code (dopiero na wyraźne polecenie).

## 3. Czym Figma nie jest w projekcie

Figma NIE jest miejscem właściwego tworzenia rasterów PNG/WebP dla:
- tła świata,
- tła paneli,
- tła kart,
- tła buttonów,
- tekstur materiałowych,
- miękkich świateł,
- organicznych / malarskich obrazów premium.

Figma może zawierać placeholdery i podpięte referencje tych rasterów, ale finalne obrazy powstają poza Figmą.

## 4. Podział: Figma pipeline vs raster pipeline

### 4.1. FIGMA VECTOR / COMPONENT PIPELINE

Zakres:
- wektor,
- komponent,
- layout,
- typografia,
- biblioteka,
- SVG,
- design system.

Efekt:
- gotowy system komponentów i zasad,
- mockupy z placeholderami pod rastry,
- przygotowanie do przyszłego mappingu design → code.

### 4.2. RASTER / BACKGROUND PIPELINE

Zakres:
- generowanie i przygotowanie rasterów poza Figmą,
- PNG/WebP,
- tła świata,
- tła paneli,
- tła kart,
- tła buttonów,
- tekstury,
- miękkie światła,
- materiały organiczne.

Efekt:
- finalne raster backgrounds i materiały wizualne dostarczane do użycia w makietach i runtime.

## 5. Kolejność pracy

1. Przeczytaj: `docs/current/README.md`.
2. Przeczytaj: `docs/current/maps/PROJECT_INDEX.md`.
3. Przeczytaj: `docs/current/maps/DEPENDENCY_MAP.md`.
4. Przeczytaj: `docs/current/visual/README.md`.
5. Przeczytaj pakiet visual dla zadania (minimum: `ART_DIRECTION.md`, `KOSMOLOGIA_WIZUALNA.md`, `BIBLIOTEKA_MATERIALOW.md`).
6. Dla SUB-META przeczytaj komplet `SUB_META_*`.
7. Ustal typ zadania (asset/component pass, polished mockup, design system rules, implementacja kodu).
8. Wykonaj tylko zakres zgodny z typem zadania i poleceniem użytkownika.

## 6. Jak wybierać umiejętności Figma

- `Create New Figma File` — gdy trzeba utworzyć nowy plik.
- `Generate Figma Design` — gdy trzeba zaprojektować komponenty lub układ.
- `Generate Figma Library` — gdy celem jest biblioteka komponentów.
- `Create Design System Rules` — gdy celem są reguły design system.
- `Code Connect` — dopiero przy istniejącym mapowaniu komponentów Figma ↔ code.
- `Implement Design` — tylko na wyraźne polecenie implementacji w runtime.
- `use_figma` — zgodnie z wymaganiami narzędzia i zakresem zadania.

## 7. Domyślny pierwszy krok dla SUB-META: asset/component pass

W pierwszym kroku projektujemy:
- ramki SVG,
- glify SVG,
- cienkie linie SVG,
- ornamenty SVG,
- sloty SVG,
- ikony SVG,
- komponenty kart R1 i DS,
- panele i buttony jako struktury/ramy/placeholders,
- typografię testową,
- mini-layout kontekstowy.

Nie tworzymy wtedy finalnych raster backgrounds.

## 8. Kiedy wolno przejść do polished mockup

Dopiero gdy:
- asset/component pass jest gotowy i zatwierdzony,
- komponenty są spójne,
- stany są opisane,
- layout i skala są zweryfikowane,
- nie jest zmieniana mechanika.

## 9. Kiedy wolno przejść do implementacji kodu

Dopiero gdy:
- użytkownik wyraźnie zleci implementację,
- istnieje zaakceptowany kontekst dokumentacyjny i projektowy,
- zakres implementacji jest jawny,
- wiadomo, które elementy są placeholderem, a które finalnym assetem.

## 10. Raport po pracy z Figma

Po zadaniu Figma raport obejmuje:
1. EXECUTIVE SUMMARY,
2. LINK / IDENTYFIKATOR PLIKU FIGMA (jeśli powstał),
3. LISTA UTWORZONYCH ELEMENTÓW,
4. DECYZJE PROJEKTOWE,
5. EKSPORTY / FORMATY (jeśli dotyczy),
6. CO NIE ZOSTAŁO ZROBIONE,
7. RYZYKA / OGRANICZENIA,
8. NASTĘPNY KROK.

## 11. Zakazy

- Nie zmieniać mechaniki systemów.
- Nie wymyślać nowych slotów, kosztów, typów kart i kanonu kart.
- Nie traktować referencji jako blueprintu 1:1.
- Nie przechodzić do `Implement Design` bez wyraźnego polecenia.
- Nie projektować finalnych rasterów PNG/WebP w Figma.
- Nie traktować placeholderów rasterowych z Figmy jako finalnych grafik produkcyjnych.
=======
# Haiku Cosmos — Figma Workflow

> Status: KIERUNEK / WORKFLOW
> Obszar: Figma, asset pass, komponenty wizualne
> Źródło prawdy: TAK, dla workflow przygotowania assetów wizualnych w Figmie. NIE, dla runtime i mechaniki.
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: ART_DIRECTION.md, KOSMOLOGIA_WIZUALNA.md, BIBLIOTEKA_MATERIALOW.md, SUB_META_LINE_ORNAMENT_LIBRARY.md, SUB_META_ASSET_PIPELINE.md, SUB_META_FIGMA_PROMPT_TEMPLATE.md

## 1. Cel dokumentu

Ten dokument opisuje sposób pracy z Figmą dla wizualnych assetów Haiku Cosmos.

Figma jest narzędziem projektowym i eksportowym. Nie jest źródłem mechaniki, runtime ani balansu.

## 2. Zasada ogólna

Przed uruchomieniem Figmy dla SUB-META/HUD należy czytać:

1. `ART_DIRECTION.md`
2. `KOSMOLOGIA_WIZUALNA.md`
3. `BIBLIOTEKA_MATERIALOW.md`
4. `SUB_META_LINE_ORNAMENT_LIBRARY.md`
5. `SUB_META_ASSET_PIPELINE.md`
6. `SUB_META_FIGMA_PROMPT_TEMPLATE.md`

Codex nie uruchamia Figmy bez osobnego zadania użytkownika.

## 3. Pierwszy asset/component pass — linie i ornamenty SUB-META + HUD

Pierwszy pass Figmy ma stworzyć bazę SVG, a nie pełny ekran.

### Zakres

Figma tworzy bibliotekę:

- ramek,
- slotów,
- linii,
- ornamentów,
- glifów,
- placeholderów,
- małych ramek i metrów HUD.

### Źródło inspiracji

Wynik ma być inspirowany `SUB_META_LINE_ORNAMENT_LIBRARY.md`, czyli:

- astrolabium,
- sferą armilarną,
- geometrią islamską,
- wschodnimi podziałami 8-kierunkowymi,
- subtelnymi podziałami 28 mansions,
- zachodnimi kołami kosmograficznymi.

Inspiracje są transformowane do własnego alfabetu Haiku Cosmos.

### Czego pass nie robi

Ten pass:

- nie generuje finalnych rastrów,
- nie generuje pełnego ekranu SUB-META,
- nie implementuje UI,
- nie zmienia runtime,
- nie tworzy nowych mechanik,
- nie tworzy fontów,
- nie importuje assetów do builda.

### Oczekiwany wynik

Wynikiem jest biblioteka komponentów i wariantów w Figmie:

- panel frame variants,
- card frame variants R1/DS,
- slot variants,
- divider line variants,
- connector line variants,
- corner ornament variants,
- rosette variants,
- orbit/astrolabe ring variants,
- HUD counter/meter frame variants,
- glyph variants for axes/states.

Figma może przygotować jedną mini-kompozycję demonstracyjną pokazującą skalę i relację elementów, ale nie pełny mockup SUB-META.

## 4. Eksport

Eksport z Figmy powinien kierować pliki do struktury opisanej w `SUB_META_ASSET_PIPELINE.md`:

- `assets/visual/submeta/svg/...`
- `assets/visual/hud/svg/...`
- `assets/visual/shared/svg/...`

Raster pipeline pozostaje osobny.

## 5. Kontrola jakości

Przed akceptacją passu należy sprawdzić:

- czy komponenty są czytelne w małej skali,
- czy stroke nie znika po skalowaniu,
- czy ornament nie dominuje nad funkcją UI,
- czy elementy nie kopiują dosłownych symboli sakralnych,
- czy pliki nadają się do eksportu jako czyste SVG,
- czy nazewnictwo odpowiada pipeline.
>>>>>>> Stashed changes
