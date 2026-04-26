# AGENTS.md — Haiku Cosmos

Minimalna kolejność czytania dla Codexa:

1. `README.md` w root,
2. `docs/README.md`,
3. `docs/current/README.md`.

Dokumenty kanoniczne znajdują się w `docs/current/`.

`docs/legacy/` nie jest źródłem prawdy i należy je czytać tylko na wyraźne polecenie.

Przy pracach dotyczących oprawy wizualnej, kart, PRG, HUD, SUB-META, META, materiałów, kolorów lub agentów graficznych:
- zacznij od `docs/current/visual/README.md`,
- potem przeczytaj właściwy dokument wskazany przez README,
- nie projektuj wizualiów w oderwaniu od aktualnego kierunku wizualnego.

Przy zadaniach systemowych, mechanicznych, UI lub takich, które dotykają kilku obszarów naraz, Codex powinien po `docs/current/README.md` i `docs/current/maps/PROJECT_INDEX.md` przeczytać także:
- `docs/current/maps/DEPENDENCY_MAP.md`.


Dodatkowa zasada po migracji 2026-04-24:
- Dokumenty robocze/historyczne z migracji znajdują się w `docs/legacy/` i `docs/audits/`; katalog `md/` nie jest już używany.

## Praca z Figma / use_figma — Haiku Cosmos

Przy zadaniach dotyczących Figma, design systemu, komponentów UI, assetów, ramek, glifów, ikon, slotów, kart, SUB-META, META, HUD lub implementacji projektu z Figmy Codex musi najpierw rozpoznać typ zadania.

### 1. Kolejność czytania przed użyciem Figma

Przed wywołaniem narzędzi Figma przeczytaj:

1. `docs/current/README.md`
2. `docs/current/maps/PROJECT_INDEX.md`
3. `docs/current/maps/DEPENDENCY_MAP.md`
4. `docs/current/visual/README.md`
5. właściwe dokumenty visual dla zadania, w szczególności:
   - `docs/current/visual/ART_DIRECTION.md`
   - `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`
   - `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`
   - `docs/current/visual/SUB_META_FIGMA_BRIEF.md`
   - `docs/current/visual/SUB_META_LAYOUT_SPEC.md`
   - `docs/current/visual/SUB_META_COMPONENTS.md`
   - `docs/current/visual/SUB_META_ASSET_PIPELINE.md`
   - `docs/current/visual/SUB_META_TYPOGRAPHY.md`
   - `docs/current/visual/SUB_META_RESPONSIVE_SCALING.md`
   - `docs/current/visual/SUB_META_FIGMA_PROMPT_TEMPLATE.md`

Jeżeli któryś z dokumentów nie istnieje, nie zgaduj jego treści. Zgłoś brak w summary i oprzyj pracę na istniejących dokumentach.

### 2. Rozróżnienie typów zadań Figma

Codex nie może traktować każdego zadania Figma jako implementacji kodu.

Rozróżniaj:

1. Asset/component pass
   - ramki,
   - placeholdery,
   - sloty,
   - glify,
   - cienkie linie,
   - przyciski,
   - panele,
   - karty R1/DS,
   - typografia testowa,
   - mini-layout pokazujący komponenty w kontekście.

2. Polished mockup
   - pełny ekran lub wybrany flow,
   - używa wcześniej zatwierdzonych komponentów,
   - nie wymyśla nowych mechanik.

3. Design system rules
   - reguły dla repo,
   - tokeny,
   - nazewnictwo,
   - komponenty,
   - zakazy,
   - mapping Figma ↔ runtime.

4. Figma to code / Implement Design
   - używać dopiero, gdy użytkownik wyraźnie poprosi o implementację projektu z Figmy w kodzie.
   - przed implementacją sprawdzić dokumenty, design context, screenshot i istniejące komponenty.

### 3. Domyślny tryb dla Haiku Cosmos

Dla aktualnego etapu SUB-META domyślnym trybem jest:

Asset/component pass, nie pełny mockup i nie implementacja kodu.

Najpierw projektujemy system komponentów:
- SVG ramki,
- SVG glify,
- SVG sloty,
- SVG cienkie linie,
- SVG ornamenty,
- komponenty kart R1 i DS,
- panele,
- przyciski,
- typografię,
- stany komponentów.

Dopiero po zatwierdzeniu component/asset pass wolno przejść do polished mockupu całego ekranu.

### 4. Zasady formatów assetów

Domyślnie:
- SVG dla ramek, glifów, cienkich linii, ornamentów, ikon, slotów i geometrii.
- PNG/WebP dla tła świata, tła paneli, tła kart, tła przycisków i materiałowych tekstur.
- Nie używać rastra dla cienkich linii, jeśli element może być SVG.
- Nie rozciągać bitmap bez wariantu wysokiej rozdzielczości.
- Nie dodawać font files do repo bez osobnej decyzji projektanta.

### 5. Skalowanie

Projektuj z myślą o skali:
- smartfon,
- desktop/laptop,
- 4K.

Preferuj skalowalne komponenty SVG.
Dla rastrów dokumentuj potrzebę wariantów 1x/2x/4x albo small/medium/large, ale nie twórz ich bez osobnego zadania.

Grafika nie może być rozmyta.
Cienkie linie muszą pozostać ostre.
Glify muszą pozostać czytelne.

### 6. Karty

Dla etapu SUB-META/Figma projektuj wyłącznie:
- R1,
- DS.

Nie projektuj R2/R3/R4, eventówek ani nowych typów kart bez osobnej decyzji.

Proporcja kart:
- szerokość : wysokość = 1 : 3.

Jeśli kolekcja kart nie mieści się w przeznaczonej przestrzeni:
- dopuszczalny jest lokalny scroll kolekcji,
- scroll ma działać po całym wierszu kart,
- nie dodawać głównego scrolla całego ekranu SUB-META.

### 7. Typografia

Domyślny kierunek:
- Inter jako font bazowy UI,
- Cinzel jako font ceremonialny/nagłówkowy,
- Noto Sans jako fallback wielojęzyczny.

Wymagane polskie znaki.
Test tekstu:
“Zażółć gęślą jaźń — SUB-META / ŚWIAT / Wróć / Potwierdź / Cisza / Prędkość”

Nie używać fontów bez obsługi polskich znaków.
Nie używać fontu ozdobnego do małych etykiet.
Nie mnożyć rodzin fontów bez powodu.

### 8. Czego Figma/Codex nie może robić samodzielnie

Nie wolno:
- zmieniać mechaniki,
- wymyślać nowych slotów,
- wymyślać nowych kosztów,
- zmieniać kanonu kart,
- zmieniać systemu PRG,
- traktować obrazu referencyjnego jako blueprintu 1:1,
- robić fantasy deckbuildera,
- robić agresywnego neon sci-fi,
- robić technicznego debug UI,
- zasłaniać całkowicie świata tłem menu,
- mieszać DS z R1,
- implementować kodu, jeśli użytkownik prosi tylko o projekt Figmy,
- tworzyć pełnego polished mockupu, jeśli zadanie dotyczy component/asset pass.

### 9. Wybór umiejętności Figma

Używaj odpowiedniej umiejętności do zadania:

- `Create New Figma File` — gdy trzeba utworzyć nowy plik Figma.
- `Generate Figma Design` — gdy trzeba wygenerować projekt lub komponenty w Figma.
- `Generate Figma Library` — gdy trzeba stworzyć lub rozbudować bibliotekę komponentów.
- `Create Design System Rules` — gdy trzeba wygenerować reguły design systemu dla repo i agentów.
- `Code Connect` — dopiero gdy istnieją komponenty Figma i odpowiadające im komponenty w kodzie.
- `Implement Design` — tylko gdy użytkownik wyraźnie poprosi o implementację projektu Figma w runtime.
- `use_figma` — stosuj zgodnie z wymaganiami narzędzia, gdy praca wymaga dostępu do pliku Figma.

### 10. Oczekiwany raport po pracy z Figma

Po zadaniu Figma Codex ma zwrócić:

1. EXECUTIVE SUMMARY
2. LINK / IDENTYFIKATOR PLIKU FIGMA, jeśli powstał
3. LISTA UTWORZONYCH ELEMENTÓW
4. DECYZJE PROJEKTOWE
5. EKSPORTY / FORMATY, jeśli dotyczy
6. CO NIE ZOSTAŁO ZROBIONE
7. RYZYKA / OGRANICZENIA
8. NASTĘPNY KROK
