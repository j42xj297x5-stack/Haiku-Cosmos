# SUB-META — biblioteka komponentów (etap 1)

> Status: KIERUNEK / BIBLIOTEKA KOMPONENTÓW
> Obszar: SUB-META / component sheet dla Figma
> Źródło prawdy: TAK, dla visual component design w Figma; NIE, dla runtime i mechaniki
> Ostatnia aktualizacja: 2026-04-26
> Powiązane dokumenty: `docs/current/visual/SUB_META_FIGMA_BRIEF.md`, `docs/current/visual/SUB_META_LAYOUT_SPEC.md`, `docs/current/systems/CARDS_SYSTEM.md`, `docs/current/systems/SUB_META_SYSTEM.md`, `docs/current/systems/PRG_SYSTEM.md`, `docs/current/systems/ECONOMY_SYSTEM.md`, `docs/current/ui/UI_WORLD.md`

## 1. Zakres etapu 1

W tym etapie projektujemy komponenty tylko dla:
- kart R1,
- kart DS,
- stanów slotów i paneli potrzebnych do pierwszego polished mockupu SUB-META.

## 2. Zasada wspólna dla komponentów

Każdy komponent ma być:
- czytelny,
- osadzony w rytualnym minimalizmie kosmicznym,
- spójny z ciemną, półprzezroczystą bazą,
- oparty na cienkich liniach i subtelnym świetle.

---

## 3. Karta R1

**Rola:** podstawowa karta systemu w SUB-META.

**Wygląd:**
- dominanta kolorystyczna zgodna z osią,
- prosta rama,
- subtelny glif,
- ciemna baza,
- kolor jako akcent/rdzeń/światło, nie płaska farba.

**Stan aktywny:**
- wyraźniejszy rdzeń koloru,
- delikatne podbicie kontrastu ramy,
- subtelna poświata.

**Stan nieaktywny:**
- przygaszony rdzeń,
- mniejszy kontrast,
- nadal czytelna tożsamość osi.

**Stan zablokowany:**
- przyciemnienie,
- jasny sygnał blokady (bez agresji),
- brak efektu aktywnej poświaty.

**Relacja z kolorem systemowym:** ścisła zgodność z RED/YELLOW/GREEN/BLUE.

**Relacja z materiałem:** materiał osiowy (żar/spoiwo/przepływ/chłód).

**Czego unikać:**
- fantasy ornamentu,
- neonowej płaskości,
- mylenia R1 z DS.

---

## 4. Karta DS

**Rola:** karta specjalna otwierająca dodatkowe miejsce (Dodatkowy Slot).

**Wygląd:**
- biała/perłowa/eterowa rama,
- znak „+” w kolorze osi,
- charakter „klucz/otwarcie/dodatkowe miejsce”,
- wyraźnie inna od R1.

**Stan aktywny:**
- czytelny znak plus,
- subtelny eteryczny glow,
- akcent osiowy utrzymany w znaku.

**Stan nieaktywny:**
- spokojniejsza biel/perła,
- słabsze światło,
- nadal natychmiast rozpoznawalna jako DS.

**Stan zablokowany:**
- matowe przygaszenie,
- sygnał blokady,
- brak „żywego” rdzenia.

**Relacja z kolorem systemowym:** kolor osi obecny punktowo (znak +, drobne akcenty), nie jako dominanta tła.

**Relacja z materiałem:** eter/perła + subtelny kryształ.

**Czego unikać:**
- robienia DS jako „mocniejszej R1”,
- zlewania się DS z kartami osiowymi,
- przesadnych efektów premium.

---

## 5. Slot pusty

**Rola:** miejsce gotowe na osadzenie karty.

**Wygląd:** gniazdo z cienką ramą i delikatnym sygnałem gotowości.

**Stan aktywny:** obwódka lekko rozświetlona przy hover/wyborze.

**Stan nieaktywny:** spokojna, ciemna wnęka.

**Stan zablokowany:** nie dotyczy (osobny komponent „slot zablokowany”).

**Relacja z kolorem systemowym:** neutralna baza, kolor pojawia się dopiero przy kontekście osi.

**Relacja z materiałem:** ciemny panel + subtelny relief.

**Czego unikać:** zwykłego „pustego prostokąta z bordurem”.

---

## 6. Slot zajęty

**Rola:** miejsce z osadzoną kartą.

**Wygląd:** gniazdo podkreślające obecność karty i stan połączenia.

**Stan aktywny:** czytelna ramka aktywności, subtelne światło relacyjne.

**Stan nieaktywny:** karta czytelna, ale bez aktywnego podświetlenia.

**Stan zablokowany:** nie dotyczy.

**Relacja z kolorem systemowym:** aktywna oś karty prowadzi akcent.

**Relacja z materiałem:** panel rezonansu + materiał karty.

**Czego unikać:** nadmiaru efektów, które „przepalają” kartę.

---

## 7. Slot zablokowany

**Rola:** miejsce chwilowo niedostępne.

**Wygląd:** przygaszona wnęka + czytelny znak blokady.

**Stan aktywny:** brak.

**Stan nieaktywny:** standard blokady.

**Stan zablokowany:** domyślny.

**Relacja z kolorem systemowym:** minimalna, stonowana.

**Relacja z materiałem:** matowy, chłodny materiał bazowy.

**Czego unikać:** agresywnych czerwonych alertów i ostrzegawczego „error UI”.

---

## 8. Gniazdo rezonansu

**Rola:** główne miejsce osadzania i łączenia konfiguracji.

**Wygląd:** geometryczne gniazdo z osiami/łukami, czytelne centrum.

**Stan aktywny:** miękki impuls światła i podkreślenie połączeń.

**Stan nieaktywny:** statyczne, czytelne kontury.

**Stan zablokowany:** przygaszone osie + sygnał braku dostępu.

**Relacja z kolorem systemowym:** oś koloru zgodna z kategorią PRG/ŚWIAT.

**Relacja z materiałem:** ciemna baza + linie metaliczno-świetlne.

**Czego unikać:** losowej dekoracji bez funkcji orientacyjnej.

---

## 9. Gniazdo pomocnicze

**Rola:** miejsce wsparcia dla konfiguracji (np. dodatkowe miejsce / kontekst).

**Wygląd:** lżejsze niż gniazdo rezonansu, ale stylistycznie spójne.

**Stan aktywny:** delikatne podświetlenie pomocnicze.

**Stan nieaktywny:** spokojny, cienki kontur.

**Stan zablokowany:** czytelna blokada bez dominacji wizualnej.

**Relacja z kolorem systemowym:** akcent punktowy, nie dominujący.

**Relacja z materiałem:** neutralny panel + subtelny eter przy DS.

**Czego unikać:** wizualnej rywalizacji z gniazdami głównymi.

---

## 10. Panel Kuźni

**Rola:** obszar operacji wzmacniania i decyzji kosztowej.

**Wygląd:** stabilny blok operacyjny w dolnym panelu, z czytelną hierarchią.

**Stan aktywny:** podświetlenie wybranej operacji + wyraźny koszt.

**Stan nieaktywny:** wyciszone opcje, nadal czytelne.

**Stan zablokowany:** przygaszenie + jasna przyczyna (np. brak RP/warunku).

**Relacja z kolorem systemowym:** kolor osi tylko tam, gdzie dotyczy wybranej karty/operacji.

**Relacja z materiałem:** ciemny panel operacyjny, mało ornamentu.

**Czego unikać:** wyglądu sklepu, listy debugowej, jaskrawych alertów.

---

## 11. Panel magazynu

**Rola:** przegląd dostępnych kart i ich liczności.

**Wygląd:** uporządkowana siatka/lista, czytelne grupowanie bez bałaganu.

**Stan aktywny:** wybrana karta ma wyraźny fokus.

**Stan nieaktywny:** spokojna prezentacja kart.

**Stan zablokowany:** jeśli dotyczy filtra/stanu, lekki sygnał niedostępności.

**Relacja z kolorem systemowym:** kolory kart prowadzą wzrok, tło neutralne.

**Relacja z materiałem:** ograniczony ornament, priorytet czytelności.

**Czego unikać:** „ściany miniatur” bez hierarchii.

---

## 12. Panel opisu

**Rola:** kontekst i zrozumienie wybranej operacji/karty.

**Wygląd:** spokojny obszar tekstu + miejsce na kluczowy wizual karty.

**Stan aktywny:** czytelny tytuł, koszt, efekt i warunki.

**Stan nieaktywny:** placeholder informacyjny.

**Stan zablokowany:** jeśli brak wyboru, delikatna informacja prowadząca.

**Relacja z kolorem systemowym:** kolor używany oszczędnie dla semantyki.

**Relacja z materiałem:** półprzezroczysta baza z lekkim reliefem.

**Czego unikać:** przeładowania tekstem i małych, trudnych etykiet.

---

## 13. Przycisk „Wróć”

**Rola:** zamknięcie SUB-META i powrót do RUN.

**Wygląd:** prosty, czytelny, osadzony w górnym pasku.

**Stan aktywny:** subtelny hover/focus.

**Stan nieaktywny:** standardowy.

**Stan zablokowany:** raczej nie dotyczy; jeśli wystąpi, czytelne przygaszenie.

**Relacja z kolorem systemowym:** neutralna baza, bez silnej dominacji osi.

**Relacja z materiałem:** cienka rama, spokojny kontrast.

**Czego unikać:** ciężkiego, masywnego CTA dominującego nad tytułem.

---

## 14. Przycisk „Potwierdź”

**Rola:** finalizacja operacji.

**Wygląd:** najważniejszy przycisk akcyjny dolnego panelu.

**Stan aktywny:** czytelny kontrast + subtelny sygnał gotowości.

**Stan nieaktywny:** przygaszony, ale zrozumiały.

**Stan zablokowany:** jasna blokada (np. brak RP), bez agresji.

**Relacja z kolorem systemowym:** może używać koloru kontekstu operacji, ale bez łamania semantyki osi.

**Relacja z materiałem:** stabilny materiał panelowy + lekki akcent światła.

**Czego unikać:** „gamingowego” neonowego CTA.

---

## 15. Koszt RP

**Rola:** informacja ekonomiczna przed decyzją.

**Wygląd:** czytelna etykieta liczby + jednostki RP, blisko akcji.

**Stan aktywny:** mocniejsza czytelność przy wybranej operacji.

**Stan nieaktywny:** neutralna prezentacja.

**Stan zablokowany:** sygnał niedostępności kosztu/środków.

**Relacja z kolorem systemowym:** neutralna baza + oszczędny akcent semantyczny.

**Relacja z materiałem:** prosty element informacyjny, bez ornamentu.

**Czego unikać:** ukrywania kosztu w małym tekście.

---

## 16. Licznik kart

**Rola:** szybka informacja o ilości.

**Wygląd:** mały, czytelny licznik przy karcie/sekcji.

**Stan aktywny:** wyraźniejszy przy wybranym kontekście.

**Stan nieaktywny:** spokojny, nadal czytelny.

**Stan zablokowany:** jeśli dotyczy, wyciszony.

**Relacja z kolorem systemowym:** akcent pomocniczy, nie dominujący.

**Relacja z materiałem:** lekka etykieta w stylu panelu.

**Czego unikać:** zbyt małego kontrastu i nieczytelnych cyfr.

---

## 17. Stany globalne: aktywny / wybrany / nieaktywny / zablokowany

**Aktywny:**
- delikatnie większy kontrast,
- subtelna poświata,
- czytelne prowadzenie wzroku.

**Wybrany:**
- wyraźna ramka/fokus,
- najwyższa czytelność kontekstowa,
- spójność między panelem źródłowym i panelem opisu.

**Nieaktywny:**
- pełna czytelność,
- niższy kontrast,
- brak impulsów świetlnych.

**Zablokowany:**
- przygaszenie + informacja o blokadzie,
- bez krzykliwych sygnałów błędu,
- bez mylenia z „uszkodzonym UI”.
