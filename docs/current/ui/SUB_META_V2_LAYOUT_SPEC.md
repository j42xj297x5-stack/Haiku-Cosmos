> Status: ROBOCZY / SPEC PROJEKTOWY UI
> Obszar: SUB-META v2 / cockpit resonance layout
> Źródło prawdy: NIE (spec projektowy przed implementacją runtime)
> Ostatnia aktualizacja: 2026-04-29
> Powiązane dokumenty: UI_WORLD.md, ../systems/SUB_META_SYSTEM.md, ../systems/PRG_SYSTEM.md, ../technical/SUB_META_V2_BOX_AUDIT.md, ../technical/CENTER_BASED_POSITIONING_SPEC.md, ../visual/SUB_META_COMPONENTS.md

# SUB-META v2 — 9-zone cockpit resonance system

## 1. Cel

SUB-META v2 definiuje semantyczny układ 9 stref jako cockpit rezonansu: nie jako sztywną siatkę 3x3, ale jako mapę funkcji i relacji PRG↔ŚWIAT↔operacje.

## 2. Architektura 9 stref

### Górny rząd — orientacja / status / nawigacja

1. `top_left_status`
- RP, wskaźniki rezonansu, status konfiguracji.
- Priorytet: wysoki (czytelność liczb).
- Mobile: krytyczne (zawsze widoczne).
- Może być kompaktowe, nie zwijane całkowicie.
- Ramki: micro HUD frame + lekki separator.
- Future hooks: mini alerty kosztów, sygnały lock/unlock.

2. `top_center_identity`
- Tytuł SUB-META, glif aktywnej konfiguracji, oś/korona panelu.
- Priorytet: średni-wysoki (tożsamość, nie akcja).
- Mobile: może być skrócone.
- Może być minimalizowane typograficznie.
- Ramki: ornament center, thin edge, ceremonial header.
- Future hooks: konfiguracja presetów/seedów układu.

3. `top_right_navigation`
- Wróć, przełączniki trybu, przyszłe zakładki.
- Priorytet: wysoki (nawigacja i bezpieczeństwo operacji).
- Mobile: krytyczne.
- Może przejść w ikonowy tryb kompaktowy.
- Ramki: button frames + tab rail.
- Future hooks: quick mode switch (Assign/Forge/Inspect).

### Środkowy rząd — rdzeń działania

4. `middle_left_prg`
- PRG (R1 PRG), osie wpływu, ODB, PRG branch sockets.
- Priorytet: krytyczny.
- Mobile: widoczne w trybie core view.
- Częściowo zwijane (detale osi), nie całość.
- Ramki: slot groups, axis columns, socket nodes.
- Future hooks: branch diagnostics, axis emphasis, ODB state ring.

5. `middle_center_resonance_core`
- Serce SUB-META: most PRG↔ŚWIAT, R2/R3/R4, aktywne wiązania, resonance bus.
- Priorytet: krytyczny najwyższy.
- Mobile: zawsze obecny jako centrum (co najmniej skrócone).
- Niezwijalne logicznie; wizualnie może mieć tryb compact.
- Ramki: central core frame, bridge lines, resonance sockets.
- Future hooks: aktywne linie wiązań, slot R4, strefa rezerwacji R3.

6. `middle_right_world`
- Sloty świata: Forma/Intencja/Czas/Cisza, R1 świata, DS i branch sockets.
- Priorytet: krytyczny.
- Mobile: pokazywany w core/workspace.
- Może mieć collapsed labels przy zachowaniu dotykowej czytelności.
- Ramki: category frames, DS socket frame, world branch accents.
- Future hooks: world branch expansions, DS augmentation cues.

### Dolny rząd — zasoby / operacje / inspekcja

7. `bottom_left_inventory`
- Magazyn, kolekcja kart, filtrowanie, szybki wybór.
- Priorytet: wysoki operacyjnie.
- Mobile: przełączany panel/drawer.
- Może być zwijany i tabowany.
- Ramki: list frame, filter rail, card grid separators.
- Future hooks: quick filters, rarity/tier view, saved views.

8. `bottom_center_forge`
- Kuźnia: transformacje, koszty, potwierdzenia.
- Priorytet: wysoki, ale kontekstowy.
- Mobile: osobny workspace/tab.
- Może być zwijana gdy nieaktywna.
- Ramki: craft frame, action confirmation rail.
- Future hooks: wejście do deeper forge panel, recipe chains.

9. `bottom_right_card_detail`
- Podgląd karty, opis, haiku, grafika, statystyki, lore/funkcja.
- Priorytet: średni-wysoki (inspekcja, decyzja jakościowa).
- Mobile: jako tab/modal/drawer inspect.
- Może być przełączane na żądanie.
- Ramki: detail frame, text compartments, glyph anchors.
- Future hooks: compare mode, relation preview, lore depth.

## 3. Jawne osadzenie R2/R3/R4/DS

- **R2**: most/wiązanie w `middle_center_resonance_core`, między PRG i ŚWIAT, jedno aktywne naraz (zgodnie z mechaniką).
- **R3**: strefa stabilizacji/rezerwacji w resonance core (lub pomocniczo przy forge), bez wymuszania slotów R1.
- **R4**: karta meta-strukturalna jedności konfiguracji; slot centralny lub specjalny slot rdzenia.
- **DS**: dodatkowy slot powiązany czytelnie z gałęziami świata; nie traktowany jak zwykły R1.

## 4. Content model v0.2 — decyzje projektanta

- **PRG**: 4 osie. Każda oś zawiera 2 sloty (`R1` + rozszerzenie/ODB/alternatywne działanie). Dodatkowo PRG ma 3 sloty `R2`; wszystkie trzy mogą być osadzone, ale tylko jedna karta `R2` aktywuje jedną parę slotów PRG naraz.
- **ŚWIAT**: 4 osie świata. Każda oś zawiera 3 sloty (2 sloty `R1` + 1 slot rozszerzenia). Dodatkowo ŚWIAT ma 3 sloty `R2`; wszystkie trzy mogą być osadzone, ale tylko jedna karta `R2` aktywuje jedną parę slotów ŚWIAT naraz.
- **Centrum (resonance core)**: rdzeń łączący PRG i ŚWIAT. Ma być geometrycznie specjalny (koło/wielokąt/pierścień), z jawnym miejscem dla: `R2 bridges` i aktywnego wiązania, `R3` jako stabilizacji/rezerwacji konfiguracji, jednej karty `R4` jako jedności PRG–ŚWIAT oraz modułu `DS` jako rozszerzenia.
- **Dół kokpitu**: magazyn jako szeroki bank wielu kart; mini Kuźnia jako mały panel/portal wejścia do głębszego panelu tworzenia i modyfikacji; card detail po prawej wielkościowo zbliżony do magazynu (balans dołu).
- **Symetria PRG ↔ ŚWIAT**: obie strefy mają podobny ciężar kompozycyjny i porównywalną rangę informacyjną.
- **9 stref**: pozostają semantyką architektury, ale nie mogą być prezentowane jako wizualna tabela 3×3; finalny układ ma być organiczny i relacyjny.
- **Future resources**: layout zostawia przestrzeń dla przyszłych bytów (kryształy, materiały, mini-łączniki, zasoby integrowane w Kuźni).
- **Unlock behavior**: warstwa odblokowań jest traktowana tu jako future UX/visual signaling; w tym kroku nie definiuje ani nie zmienia mechaniki.

## 5. Tryby density / urządzenia

### Desktop / large
- Pełny cockpit 9 stref jednocześnie.
- Widoczne kluczowe relacje PRG↔CORE↔WORLD.
- Więcej ornamentów i relacji linii.

### Tablet / medium
- 9 stref pozostaje logicznie pełne.
- Mniejsze odstępy i ograniczone ornamenty.
- Inventory/detail/forge bardziej kompaktowe.

### Mobile / small
- 9 stref to model logiczny, nie pełna jednoczesna ekspozycja.
- Oś priorytetu: `status -> resonance_core -> selected_workspace`.
- Inventory/forge/detail jako tabs/drawer/panele przełączane.
- Minimalne ornamenty, maksymalna czytelność dotyku.

## 6. Future visual depth layers

To future visual pass (bez implementacji teraz):

1. substrate panel,
2. inner shadow,
3. edge highlight,
4. SVG construction lines,
5. tintable accents,
6. active bridge light,
7. animatable state layer.

Zasada: najpierw zatwierdzenie layoutu 9 stref i kontraktu mount/anchors, potem dopiero depth pass i ewentualne rastry.

## 7. Zakres i granice

- Ten dokument nie zmienia mechaniki, kosztów RP, sekwencji ani PRG runtime.
- Nie implementuje SUB-META v2 w kodzie.
- Nie podłącza nowych assetów i nie wymaga Figma w tym kroku.

## 8. Composition principle

Zasada kompozycyjna dla SUB-META v2:

- zawartość i ciężar informacji decydują o wielkości oraz proporcji stref,
- symetria PRG ↔ ŚWIAT ma wyższy priorytet niż równa tabela,
- `middle_center_resonance_core` jest formą wyjątkową geometrycznie,
- layout projektujemy jako jeden cockpit resonance system, nie 9 identycznych paneli.
