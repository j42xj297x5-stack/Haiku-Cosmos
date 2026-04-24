# Audit chronologiczny — I18N_SYSTEM jako kanon strukturalny

> Data: 2026-04-24
> Zakres: dokumentacja `docs/current/` + audyt chronologiczny
> Typ zmiany: porządkowanie kanonu i18n (bez runtime)

## 1. EXECUTIVE SUMMARY

Wykonano audyt i pełną aktualizację `docs/current/systems/I18N_SYSTEM.md`, zmieniając status z **DO AKTUALIZACJI** na **KANON STRUKTURALNY / DO WDROŻENIA**.

Ustalono obowiązujące zasady:
- polski jako język główny projektu,
- angielski jako pierwsza alternatywa,
- zakres tłumaczeń: UI + karty + haiku,
- adaptacyjny model haiku,
- koncepcyjne rodziny kluczy,
- fallback do `pl` i bezpieczny fallback końcowy.

Zaktualizowano mapy (`docs/current/README.md`, `PROJECT_INDEX.md`, `DEPENDENCY_MAP.md`) tak, aby status i relacje I18N były spójne z nowym kanonem.

## 2. Zakres sprawdzonych dokumentów

### I18N
- `docs/current/systems/I18N_SYSTEM.md`

### Powiązane systemy i UI
- `docs/current/ui/UI_WORLD.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`

### Visual (kontekst tonu i długości tekstów)
- `docs/current/visual/README.md`
- `docs/current/visual/ART_DIRECTION.md`
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`

### Mapy
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`

### Handoff (historyczny snapshot)
- `docs/handoff/2026-04-24_docs_current_clean_handoff.md`

## 3. Status I18N przed i po

### Przed
- `DO AKTUALIZACJI`
- dokument był niepełny i urywał się w sekcji przykładu `locales`
- brak pełnego domknięcia zasad kanonu strukturalnego

### Po
- `KANON STRUKTURALNY / DO WDROŻENIA`
- dokument zawiera kompletny zestaw zasad strukturalnych i granic wdrożenia
- jednoznacznie rozdzielono kanon językowy od implementacji runtime

## 4. Najważniejsze decyzje strukturalne

1. Polski pozostaje językiem głównym projektowania, dokumentacji i startowego UI.
2. Angielski jest pierwszą alternatywą, bez nadrzędności nad polskim kanonem.
3. Zakres tłumaczeń obejmuje UI, tytuły/opisy kart oraz haiku.
4. Karty mogą mieć `locales`; pełna kompletność językowa nie jest wymuszana od razu.
5. Haiku w innych językach może być adaptacją poetycką (nie 1:1), przy zachowaniu sensu i funkcji.
6. Rodziny kluczy i18n: `ui.*`, `run.*`, `cards.*`, `meta.*`, `prg.*`, `economy.*`, `common.*`.
7. Fallback: wybrany język → `pl` → surowy klucz/placeholder; brak tłumaczenia nie może wywalać UI.

## 5. Zmiany w I18N_SYSTEM.md

- Przepisano dokument do pełnej, spójnej wersji kanonu strukturalnego.
- Dodano docelowy blok statusu i źródła prawdy.
- Dodano sekcje: cel, język główny, zakres tłumaczeń, UI/karty/haiku, strategie `locales`, adaptacja haiku, model kluczy, fallback, relacje między dokumentami, granice wdrożenia i antywzorce.
- Zachowano granicę: brak implementacji runtime, brak plików tłumaczeń, brak pełnej tabeli kluczy.

## 6. Zmiany w mapach

- `docs/current/README.md`: status `I18N_SYSTEM.md` zmieniony na `KANON STRUKTURALNY / DO WDROŻENIA`.
- `docs/current/maps/PROJECT_INDEX.md`: status I18N zaktualizowany zgodnie z nowym kanonem.
- `docs/current/maps/DEPENDENCY_MAP.md`:
  - I18N przeniesiono z sekcji `DO AKTUALIZACJI` do sekcji `KANON` jako status strukturalny,
  - dopisano relację I18N ↔ UI ↔ CARDS ↔ PRG ↔ ECONOMY ↔ SUB-META,
  - dopisano ostrzeżenie, że runtime i18n pozostaje do wdrożenia.

## 7. Czego nie zmieniano

- Nie zmieniano runtime.
- Nie tworzono plików tłumaczeń (JSON/YAML/TS).
- Nie wdrażano loadera i18n.
- Nie wdrażano przełącznika języka.
- Nie modyfikowano UI runtime.
- Nie wykonywano audytu kodu.
- Nie aktualizowano handoff — pozostaje historycznym snapshotem sprzed aktualizacji I18N.

## 8. Ryzyka i obszary do wdrożenia

1. Brak fizycznych słowników locale.
2. Brak loadera tłumaczeń i mapowania kluczy na runtime.
3. Brak runtime-owej ścieżki fallback (z widocznością braków w debug/evidence).
4. Ryzyko niespójności nazewnictwa kluczy bez oddzielnego kroku implementacyjnego.
5. Brak testów i18n (fallback, kompletność krytycznych tekstów, stabilność UI przy brakach tłumaczeń).

## 9. Rekomendowany następny krok

Dwie bezpieczne ścieżki po tym kroku:
1. **Audit runtime** (`WORLD_FUNCTION_MAP.md`) lub audyt runtime PRG, aby domknąć dokumenty o statusie do aktualizacji/strojenia.
2. **Start wdrożenia i18n** jako osobny krok techniczny: projekt plików locale, loader, przełącznik języka, mechanizm fallback i pakiet testów.
