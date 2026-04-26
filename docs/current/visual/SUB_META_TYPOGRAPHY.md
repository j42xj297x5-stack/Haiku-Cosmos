# SUB-META — typografia

> Status: KIERUNEK / TYPOGRAFIA
> Obszar: fonty / UI / SUB-META / wielojęzyczność
> Źródło prawdy: TAK, dla kierunku typografii; NIE, dla finalnego loadera fontów
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: `docs/current/visual/SUB_META_FIGMA_BRIEF.md`, `docs/current/visual/SUB_META_LAYOUT_SPEC.md`, `docs/current/visual/SUB_META_COMPONENTS.md`, `docs/current/visual/SUB_META_RESPONSIVE_SCALING.md`, `docs/current/ui/UI_WORLD.md`, `docs/current/systems/I18N_SYSTEM.md`

## 1. Cel dokumentu

Zdefiniować bezpieczny, czytelny i skalowalny kierunek typografii dla SUB-META oraz przyszłych ekranów META/UI, z uwzględnieniem polskich znaków i rozszerzalności językowej.

## 2. Rekomendacja fontów

### 2.1. Font bazowy UI — Inter

Rola:
- UI,
- etykiety,
- liczby,
- koszty RP,
- krótkie opisy,
- panele,
- przyciski.

Powód:
- wysoka czytelność ekranowa,
- dojrzałe użycie w interfejsach,
- dostępność jako variable font.

### 2.2. Font ceremonialny / nagłówkowy — Cinzel

Rola:
- tytuły ekranów,
- SUB-META,
- META,
- nazwy rytualne,
- krótkie etykiety premium (oszczędnie).

Powód:
- charakter inskrypcyjny i ceremonialny,
- spójność z astrolabium, geometrią i językiem rytualnym projektu.

### 2.3. Fallback wielojęzyczny — Noto Sans

Rola:
- fallback dla języków, których Inter/Cinzel nie pokrywają wystarczająco.

Powód:
- szerokie pokrycie językowe,
- bezpieczny kierunek dla rozwoju i18n.

## 3. Zasada latin-ext dla polskiego UI

Dla fontów z Google Fonts wymagamy wariantu/pokrycia `latin-ext` tam, gdzie dotyczy polskiego UI.

Tekst walidacyjny:

`Zażółć gęślą jaźń — SUB-META / ŚWIAT / Wróć / Potwierdź / Cisza / Prędkość`

## 4. Hierarchia typograficzna (kierunkowa)

- **Tytuł ekranu:** Cinzel, wyraźny rytualny nagłówek.
- **Nagłówki paneli:** Inter semibold (opcjonalnie Cinzel w krótkich etykietach ceremonialnych).
- **Etykiety slotów:** Inter medium.
- **Tekst kart:** Inter regular/medium (czytelność ponad dekorację).
- **Koszt RP:** Inter semibold/medium, cyfry czytelne.
- **Licznik kart:** Inter semibold, wysoki kontrast cyfr.
- **Przyciski:** Inter medium/semibold.
- **Tekst pomocniczy:** Inter regular, umiarkowany kontrast.

## 5. Zasady czytelności na małym ekranie

- Priorytet: czytelność etykiet i kosztów nad dekoracją.
- Ograniczyć drobny tracking i zbyt cienkie odmiany fontu.
- Nie używać Cinzel do małych etykiet roboczych.
- Zachować wyraźny kontrast tekst/tło.

## 6. Zasady czytelności na 4K

- Nie polegać wyłącznie na „automatycznym skalu”; kontrolować realną percepcję rozmiaru.
- Utrzymać hierarchię wag (nagłówek/panel/etykieta/liczby).
- Unikać przesadnie cienkich odmian, które znikają na jasnych akcentach.

## 7. Zakazy

- Nie używać fontów bez polskich znaków.
- Nie używać ozdobnego fontu do małych etykiet.
- Nie mieszać więcej niż 2 głównych rodzin fontów bez powodu.
- Nie commitować plików fontów do repo w tym kroku.
- Nie polegać na fontach systemowych bez fallbacku.

## 8. Granice tego etapu

To dokument kierunkowy.
Nie definiuje jeszcze:
- finalnego loadera fontów,
- hostingu fontów,
- technicznych decyzji runtime dla i18n/font delivery.
