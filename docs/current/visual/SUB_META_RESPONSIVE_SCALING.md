# SUB-META — responsive scaling

> Status: KIERUNEK / SPECYFIKACJA RESPONSYWNOŚCI
> Obszar: SUB-META / skalowanie / mobile / desktop / 4K
> Źródło prawdy: TAK, dla zasad projektowania responsywnego; NIE, dla kodu runtime
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: `docs/current/visual/SUB_META_LAYOUT_SPEC.md`, `docs/current/visual/SUB_META_COMPONENTS.md`, `docs/current/visual/SUB_META_ASSET_PIPELINE.md`, `docs/current/visual/SUB_META_TYPOGRAPHY.md`, `docs/current/ui/UI_WORLD.md`, `docs/current/systems/SUB_META_SYSTEM.md`, `docs/current/systems/CARDS_SYSTEM.md`

## 1. Cel dokumentu

Opisać zasady skalowania i responsywności SUB-META, tak aby layout i komponenty były spójne od smartfona przez desktop do 4K, bez zmiany mechaniki.

## 2. Zasada główna

- Głównym targetem kompozycji pozostaje **jeden ekran 16:9**.
- SUB-META nie ma głównego scrolla całego ekranu.
- Scroll może pojawić się lokalnie tylko tam, gdzie jest to konieczne (kolekcja kart).

## 3. Zakresy ekranów (kierunkowo)

- **Mały ekran / smartfon:** ograniczona przestrzeń, priorytet czytelności i podstawowych akcji.
- **Średni ekran / laptop-desktop:** bazowy układ docelowy.
- **Duży ekran / 4K:** zachowanie proporcji i jakości bez rozmycia.

## 4. Zasady skalowania ramek SVG

- Ramki, sloty, glify i cienkie linie skalujemy jako SVG.
- Nie zamieniamy geometrii na raster tylko dlatego, że ekran jest większy.
- Zachowujemy spójny rytm linii i marginesów.

## 5. Zasady skalowania tekstu

- Tekst skaluje się razem z layoutem, ale z ochroną minimalnej czytelności.
- Wagi i kontrast muszą utrzymać hierarchię informacji.
- Tytuły mogą rosnąć mocniej niż etykiety robocze.

## 6. Zasady minimalnej czytelności

Nie wolno zmniejszać poniżej czytelności:
- etykiet slotów,
- kosztu RP,
- przycisków akcji,
- liczników kart,
- tekstów krytycznych dla decyzji.

## 7. Zasady gęstości komponentów

- W ciasnych układach redukujemy ornament i oddech pomocniczy, nie sens informacji.
- Grupy funkcjonalne pozostają czytelnie rozdzielone.
- Nie budujemy „ściany miniatur” bez hierarchii.

## 8. Kolekcja kart i przewijanie

- Karty zachowują proporcję **1:3 (szerokość:wysokość)**.
- Jeśli kolekcja się nie mieści, przewijanie projektujemy **po całym wierszu kart**.
- Unikamy chaotycznego scrolla pojedynczych elementów.
- Nadal brak głównego scrolla całego ekranu SUB-META.

## 9. Co wolno zmniejszać

- Ornament,
- oddech pomocniczy,
- puste przestrzenie drugorzędne,
- dekoracyjne warstwy niekrytyczne.

## 10. Czego nie wolno zmniejszać poniżej czytelności

- Interaktywnych targetów slotów i przycisków,
- tekstu operacyjnego,
- liczników i kosztów,
- sygnałów stanów (hover/selected/disabled/locked).

## 11. Safe area i marginesy

- Zewnętrzny margines świata musi pozostać czytelny (panel nie „przykleja się” do krawędzi).
- Wewnętrzne marginesy między sekcjami zachowują hierarchię.
- Krytyczne akcje nie mogą wpadać w strefy ryzyka krawędzi.

## 12. Bitmapy i jakość

- Zakaz rozciągania bitmap bez wariantu wysokiej rozdzielczości.
- Dla rastrów stosujemy warianty rozdzielczości (np. 1x/2x/4x).
- Elementy geometryczne trzymamy w SVG, aby uniknąć rozmycia.

## 13. Granice tego etapu

Dokument określa kierunek projektowy.
Weryfikacja jakości responsywności w runtime wymaga osobnego kroku implementacyjno-testowego.
