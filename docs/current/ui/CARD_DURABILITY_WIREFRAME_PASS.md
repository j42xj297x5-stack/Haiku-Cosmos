# Card durability wireframe pass — wariant C

> Status: ROBOCZY / WIREFRAME UI / WARIANT C / PRZED LAYOUT TOKENS / PRZED RUNTIME
> Obszar: UI / SUB-META / czteroelementowy slot / trwałość karty R
> Źródło prawdy: NIE dla finalnego layoutu, NIE dla runtime, NIE dla mechaniki, NIE dla assetów; TAK roboczo dla minimalnego układu wireframe wariantu C
> Powiązane dokumenty: `CARD_DURABILITY_VISUAL_DECISION.md`, `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`, `../systems/SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`, `../systems/CARD_SLOT_NETWORK_SYSTEM.md`, `SUB_META_V2_MASTER_SPEC.md`, `UI_WORLD.md`, `../visual/VISUAL_EXECUTION_GUIDE.md`, `../visual/SVG_ASSET_STANDARDS.md`

## 1. Cel dokumentu

Ten dokument przekłada decyzję z `CARD_DURABILITY_VISUAL_DECISION.md` na minimalny wireframe UI wariantu C dla trwałości karty R w czteroelementowym slocie.

Wireframe opisuje wyłącznie relacje i priorytety elementów:

- gdzie znajduje się cienki pasek boczny trwałości,
- gdzie znajduje się obszar degradacji karty R,
- gdzie może pojawiać się procent trwałości w trybie debug,
- jak wygląda stan normalny bez liczby procentowej,
- jak nie pomylić degradacji karty R z blizną slotu.

Dokument ma ułatwić kolejny, osobny etap projektowy przed layout tokens, assetami i runtime.

## 2. Granice

Ten dokument:

- nie jest finalnym layoutem,
- nie zmienia `SUB_META_V2_MASTER_SPEC.md` jako master spec,
- nie zmienia layout tokens,
- nie tworzy placeholderów,
- nie tworzy assetów,
- nie implementuje runtime,
- nie rozstrzyga finalnego stylu degradacji.

Nie należy na jego podstawie zmieniać JS, CSS, JSON, settings, placeholderów ani katalogów assetów. Wireframe nie oznacza kanonu visual ani finalnej ramki slotu.

## 3. Minimalny model karty R w slocie

Karta R jest traktowana jako prostokątny obszar roboczy osadzony wewnątrz slotu. Minimalny model warstw karty R, od spodu do góry:

1. baza karty / grafika karty,
2. warstwa degradacji,
3. pasek trwałości,
4. ewentualne akcenty napięcia,
5. ewentualny overlay debug.

Ważne rozdzielenie:

- blizna slotu nie jest warstwą karty R,
- blizna należy do slotu/gniazda i powinna znajdować się poza obszarem degradacji karty,
- degradacja znika razem z kartą R,
- blizna slotu może pozostać po usunięciu lub pęknięciu karty R.

## 4. Pasek boczny — pozycja

Rekomendacja wireframe:

- pasek trwałości znajduje się przy prawej krawędzi karty R,
- pasek jest bardzo cienki,
- pasek działa pionowo,
- pasek nie wchodzi w obszar stabilizatora,
- pasek nie zasłania tieru ani koloru karty,
- w małej skali pasek może być jedynym precyzyjnym sygnałem trwałości.

Dwa warianty odczytu kierunku zużycia:

- **wariant 1 — wypełnienie maleje od góry do dołu**: pełny stan pokazuje wypełniony pasek; wraz ze zużyciem widoczny segment skraca się ku dołowi,
- **wariant 2 — pustka rośnie od góry ku dołowi**: górna część zaczyna zanikać jako „utracona trwałość”, a dolny fragment zostaje jako ostatni sygnał niskiego stanu.

Robocza rekomendacja: preferowany kierunek to pasek przy prawej krawędzi, wypełnienie maleje od góry do dołu albo pustka rośnie od góry, tak aby dół oznaczał niski stan / zbliżanie się do pęknięcia.

## 5. Obszar degradacji

Degradacja jest nakładką na powierzchnię karty R.

Zasady wireframe:

- degradacja nie powinna przekraczać ramki karty,
- degradacja nie powinna zasłaniać całkowicie kolorów ani tieru,
- intensywność degradacji jest progowa,
- degradacja może być w przyszłości SVG lub PNG z przezroczystością,
- degradacja nie zawiera ciężkiego glow,
- degradacja idzie raczej w ciemność, zabrudzenie, rysy, pęknięcia i wżery.

Ten dokument nie rozstrzyga, czy przyszła degradacja będzie proceduralna, SVG, PNG/WebP, czy mieszana. Opisuje tylko obszar i priorytet czytelności.

## 6. Stan normalny bez debug

W normalnym UI:

- nie pokazujemy liczby procentowej,
- gracz widzi pasek trwałości i degradację,
- sygnał ma być czytelny, ale spokojny,
- karta nie może wyglądać jak techniczny healthbar,
- przy 100–80% karta może wyglądać prawie czysto.

Normalny stan ma wspierać klimat rytualnego obiektu, a nie aplikacyjny wskaźnik zasobu. Pasek pozostaje dyskretny, a degradacja pełni rolę jakościowego odczytu zużycia.

## 7. Stan debug

W trybie debug:

- procent trwałości może być widoczny jako mały tekst,
- tekst powinien być poza główną grafiką karty albo w rogu debug overlay,
- debug może pokazywać też progi: `stable` / `worn` / `cracked` / `critical`,
- debug może chwilowo pogrubić pasek,
- debug nie jest finalnym UI.

Debug służy walidacji i przyszłemu balansowi. Nie powinien być podstawą docelowego wyglądu karty R.

## 8. Progi visual w wireframe

Robocze progi visual przeniesione z `CARD_DURABILITY_VISUAL_DECISION.md`:

- **100–80%**: czysta / stabilna,
- **79–60%**: lekkie zabrudzenie,
- **59–40%**: rysy,
- **39–30%**: pęknięcia,
- **poniżej 30%**: wżery / ciężkie uszkodzenie / próg usunięcia,
- **0%**: pęknięcie / karta znika albo przechodzi w stan pęknięcia zgodnie z przyszłą mechaniką.

To są progi visual robocze, nie finalny balans.

## 9. Relacja do stabilizatora

Stabilizator powinien być czytelny jako osobny mikro-element czteroelementowego slotu.

Zasady rozdzielenia:

- pasek trwałości nie powinien być mylony ze stanem stabilizatora,
- jeśli stabilizator ma własne zużycie, musi dostać osobny sygnał,
- pasek karty R pokazuje trwałość karty, nie pojemność stabilizatora,
- stabilizator nie powinien przykrywać paska ani obszaru degradacji karty R.

## 10. Relacja do napięcia

Napięcie jest dynamicznym akcentem sieci, a nie trwałością karty.

Zasady rozdzielenia:

- napięcie może być pokazane jako puls, drżenie albo ciemny nacisk,
- napięcie nie powinno zastąpić paska trwałości,
- napięcie może chwilowo wzmacniać visual degradacji,
- napięcie nie jest tym samym co degradacja i nie powinno wyglądać jak stałe uszkodzenie materiału.

## 11. Relacja do blizny slotu

Rozdzielenie blizny slotu i degradacji karty R jest obowiązkowe:

- blizna slotu należy do gniazda/ramy slotu,
- degradacja karty należy do karty R,
- blizna powinna być widoczna nawet po usunięciu karty R,
- degradacja znika razem z kartą R,
- świeża blizna i utrwalona blizna wymagają osobnego future visual pass.

Wariant C nie może mieszać tych pojęć. Degradacja opisuje stan obiektu karty, a blizna opisuje pamięć/uszkodzenie miejsca w slocie.

## 12. ASCII / tekstowy schemat wireframe

```text
[ SLOT / GNIAZDO ]
+--------------------------------+
| [card R area]             |dur| |
|                            |bar| |
| [degradation overlay]      |   | |
+--------------------------------+
| stabilizer | special | artifact |
+--------------------------------+
```

To nie jest finalny layout, tylko relacyjny schemat warstw i priorytetów. Schemat pokazuje, że pasek należy do karty R, degradacja mieści się w obszarze karty R, a stabilizator / karta specjalna / artefakt pozostają osobnymi elementami slotu.

## 13. Warianty ustawienia paska do przetestowania później

Warianty do późniejszego testu:

- prawa krawędź karty R,
- lewa krawędź karty R,
- wewnętrzna krawędź przy centrum slotu,
- zewnętrzna krawędź zależna od gałęzi PRG/ŚWIAT,
- mikro-ring zamiast paska — tylko jako odległy wariant, nie główny kierunek.

Rekomendacja: prawa krawędź jako default dla pierwszego wireframe.

## 14. Decyzje do zatwierdzenia przed layout tokens

Checklist przed layout-token pass:

- [ ] Czy pasek zostaje przy prawej krawędzi?
- [ ] Czy pasek maleje od góry do dołu?
- [ ] Czy normalny UI nie pokazuje procentu?
- [ ] Czy debug pokazuje procent?
- [ ] Czy degradacja jest progowa?
- [ ] Czy degradacja jest przyciemnieniem + rysy/pęknięcia, a nie kolorem?
- [ ] Czy blizna slotu jest poza kartą R?
- [ ] Czy stabilizator ma osobny wskaźnik zużycia?

## 15. Dokumenty powiązane

- `CARD_DURABILITY_VISUAL_DECISION.md`,
- `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md`,
- `../systems/SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`,
- `../systems/CARD_SLOT_NETWORK_SYSTEM.md`,
- `SUB_META_V2_MASTER_SPEC.md`,
- `UI_WORLD.md`,
- `../visual/VISUAL_EXECUTION_GUIDE.md`,
- `../visual/SVG_ASSET_STANDARDS.md`.
