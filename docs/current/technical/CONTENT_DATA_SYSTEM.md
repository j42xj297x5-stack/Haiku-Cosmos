# Haiku Cosmos — CONTENT DATA SYSTEM

> Status: ROBOCZY / KONTRAKT TECHNICZNO-DANYCH
> Obszar: dane treści, haiku, opisy, mechanika elementów, balans, lokalny edytor JSON
> Źródło prawdy:
>
> * NIE dla kanonu mechaniki kart,
> * NIE dla finalnych wartości balansu,
> * TAK roboczo dla struktury plików treści, powiązań ID, kierunku loadera i przyszłego edytora danych.
>   Proponowana lokalizacja: `docs/current/technical/CONTENT_DATA_SYSTEM.md`
>   Powiązane dokumenty:
> * `docs/current/systems/CARDS_SYSTEM.md`
> * `docs/current/systems/SUB_META_SYSTEM.md`
> * `docs/current/systems/PRG_SYSTEM.md`
> * `docs/current/systems/CARD_SLOT_NETWORK_SYSTEM.md`
> * `docs/current/systems/DUST_COLLECTION_AND_REFINEMENT_SYSTEM.md`
> * `docs/current/ui/SUB_META_V2_MASTER_SPEC.md`
> * `docs/current/ui/UI_WORLD.md`
> * `docs/current/technical/FONT_SYSTEM_SPEC.md`

## 1. Cel dokumentu

Ten dokument definiuje roboczy kierunek systemu danych treści dla Haiku Cosmos.

System danych treści ma obsługiwać:

* haiku kart,
* opisy kart,
* krótkie opisy działania dla gracza,
* słowa-klucze i nici symboliczne,
* przypisanie treści do ID elementów gry,
* przypisanie elementów gry do efektów mechanicznych,
* parametry balansowe możliwe do edycji lokalnie,
* przyszły lokalny edytor JSON z prostym GUI,
* eksport danych do runtime gry.

Dokument nie tworzy jeszcze implementacji.
Dokument nie zmienia zasad systemu kart.
Dokument nie zastępuje mechaniki opisanej w dokumentach systemowych.

Najważniejsza zasada:

Dane tekstowe, definicja elementu gry i parametry mechaniki powinny być rozdzielone, ale połączone przez stabilne ID.

## 2. Problem projektowy

Haiku Cosmos będzie mieć coraz więcej elementów:

* karty R1–R4,
* karty specjalne,
* DS / karty naprawcze,
* pyły,
* flakony / naczynia,
* kryształy,
* glify,
* artefakty,
* komety,
* efekty świata,
* efekty PRG,
* stabilizatory,
* elementy slotów,
* przyszłe elementy eventowe.

Każdy z tych elementów może potrzebować:

* nazwy,
* haiku,
* opisu poetyckiego,
* opisu mechanicznego,
* przypisania do kolorów,
* przypisania do rzędu albo typu,
* przypisania do gałęzi PRG / ŚWIAT / GLOBAL / RESOURCE,
* przypisania do assetu,
* przypisania do działania mechanicznego,
* parametrów balansowych,
* statusu roboczego.

Trzymanie wszystkiego w jednym dużym pliku szybko stanie się nieczytelne.

Dlatego system powinien używać wielu małych plików tematycznych oraz jednego rejestru/indexu.

## 3. Zasada nadrzędna danych

System używa trzech warstw:

1. Warstwa treści
   Haiku, opisy, nazwy, słowa-klucze, nici symboliczne.

2. Warstwa elementu gry
   Czym jest element: karta, pył, glif, artefakt, karta specjalna itd.

3. Warstwa mechaniki i balansu
   Jakie efekty runtime element uruchamia lub modyfikuje oraz z jakimi parametrami.

Te warstwy nie powinny się mieszać.

Haiku nie steruje mechaniką.
Mechanika nie powinna przechowywać poetyckich opisów.
Element gry łączy obie warstwy przez stabilne ID.

## 4. Stabilne ID jako główny klucz

Każdy element gry ma stabilne ID.

Przykłady:

* `CARD_R1_RED`
* `CARD_R1_YELLOW`
* `CARD_R1_GREEN`
* `CARD_R1_BLUE`
* `CARD_R2_RED_YELLOW`
* `CARD_R3_RED_YELLOW_GREEN`
* `CARD_R4_RED_YELLOW_GREEN_BLUE`
* `DUST_RED`
* `DUST_BLUE`
* `CRYSTAL_GREEN`
* `GLYPH_BLUE_ORBIT`
* `ARTIFACT_RED_CORE`
* `SPECIAL_DS_RED`

Każde haiku ma osobne ID.

Przykłady:

* `HAIKU_CARD_R1_RED`
* `HAIKU_CARD_R2_RED_YELLOW`
* `HAIKU_DUST_BLUE`
* `HAIKU_GLYPH_BLUE_ORBIT`
* `HAIKU_SPECIAL_DS_RED`

Każdy efekt mechaniczny ma osobne ID.

Przykłady:

* `EFFECT_PRG_SIZE_MODIFIER`
* `EFFECT_PRG_ATTRACTION_REPULSION`
* `EFFECT_PRG_SPEED_MODIFIER`
* `EFFECT_PRG_OBJECT_SCOPE`
* `EFFECT_WORLD_FORM_MODIFIER`
* `EFFECT_WORLD_INTENTION_MODIFIER`
* `EFFECT_WORLD_TIME_MODIFIER`
* `EFFECT_WORLD_SILENCE_MODIFIER`
* `EFFECT_SLOT_STABILIZATION`
* `EFFECT_CARD_DURABILITY_MODIFIER`

Element gry łączy te ID.

Przykład logiczny:

`CARD_R1_RED`

* używa `HAIKU_CARD_R1_RED`,
* używa `DESC_CARD_R1_RED`,
* może używać `EFFECT_PRG_SIZE_MODIFIER`,
* może używać `EFFECT_WORLD_FORM_MODIFIER`,
* ma kolory `RED`,
* ma rząd `R1`,
* może działać w PRG i ŚWIECIE.

## 5. Proponowana struktura katalogów danych

Docelowo dane źródłowe powinny być trzymane w katalogu roboczym poza `public/`, a eksport runtime powinien trafiać do `public/data/`.

Proponowana struktura źródłowa:

```text
content/
  haiku/
    haiku.registry.json
    haiku.cards.r.json
    haiku.resources.json
    haiku.glyphs.json
    haiku.artifacts.json
    haiku.special_cards.json
    haiku.lexicon.pl.json

  elements/
    elements.registry.json
    elements.cards.r.json
    elements.resources.dust.json
    elements.resources.crystals.json
    elements.glyphs.json
    elements.artifacts.json
    elements.special_cards.json

  mechanics/
    effects.registry.json
    effects.prg.json
    effects.world.json
    effects.cards.json
    effects.slots.json
    balance.defaults.json

  schemas/
    haiku.schema.json
    element.schema.json
    effect.schema.json
    balance.schema.json
```

Proponowana struktura runtime:

```text
public/data/
  haiku/
    haiku.registry.json
    haiku.cards.r.json
    haiku.resources.json
    haiku.glyphs.json
    haiku.artifacts.json
    haiku.special_cards.json

  elements/
    elements.registry.json
    elements.cards.r.json
    elements.resources.dust.json
    elements.resources.crystals.json
    elements.glyphs.json
    elements.artifacts.json
    elements.special_cards.json

  mechanics/
    effects.registry.json
    effects.prg.json
    effects.world.json
    effects.cards.json
    effects.slots.json
    balance.defaults.json
```

Na początku można uprościć i użyć tylko:

```text
public/data/haiku/haiku.cards.r.json
public/data/elements/elements.cards.r.json
public/data/mechanics/effects.registry.json
```

Pełny podział może powstać stopniowo.

## 6. Dlaczego nie jeden wielki plik

Nie rekomenduje się jednego pliku typu:

```text
all_content.json
```

Powody:

* plik szybko stanie się zbyt duży,
* trudniej będzie analizować zmiany w git diff,
* łatwiej o konflikt przy edycji,
* trudniej będzie filtrować dane w edytorze,
* trudniej będzie utrzymać różne typy elementów,
* runtime będzie ładował dane, których nie potrzebuje.

Zalecany model:

* kilka plików tematycznych,
* wspólne ID,
* rejestr plików,
* walidator spójności.

## 7. Dlaczego nie plik per karta

Nie rekomenduje się też jednego pliku na jedną kartę.

Przykład niezalecany:

```text
CARD_R1_RED.json
CARD_R1_BLUE.json
CARD_R2_RED_YELLOW.json
```

Powody:

* przy większej liczbie elementów powstanie zbyt dużo mikroplików,
* katalog stanie się trudny do przeglądania,
* edytor i loader będą musiały wykonywać dużo małych odczytów,
* ręczne zarządzanie będzie męczące.

Najlepszy kompromis:

* plik na rodzinę elementów,
* np. wszystkie karty R w jednym pliku,
* pyły i kryształy w osobnych plikach,
* karty specjalne w osobnym pliku.

## 8. Podział plików haiku

Rekomendowany podział:

```text
haiku.cards.r.json
```

Zawiera haiku kart R1–R4.

```text
haiku.resources.json
```

Zawiera haiku pyłów, flakonów/naczyń, kryształów i innych zasobów.

```text
haiku.glyphs.json
```

Zawiera haiku albo krótkie teksty glifów.

```text
haiku.artifacts.json
```

Zawiera haiku artefaktów.

```text
haiku.special_cards.json
```

Zawiera haiku kart specjalnych, DS, kart eventowych i naprawczych.

```text
haiku.lexicon.pl.json
```

Zawiera słownik nici, słów-kluczy, obrazów, cięć i ruchów.
Ten plik nie musi być używany bezpośrednio przez runtime.
Może służyć edytorowi i pracy projektowej.

## 9. Format wpisu haiku

Każdy wpis haiku powinien mieć:

* `id`,
* `entityId`,
* `locale`,
* `status`,
* `type`,
* `rank`,
* `colors`,
* `tone`,
* `threads`,
* `mechanicHints`,
* `title`,
* `lines`,
* `notes`.

Przykład:

```json
{
  "id": "HAIKU_CARD_R1_RED",
  "entityId": "CARD_R1_RED",
  "locale": "pl",
  "status": "draft",
  "type": "card",
  "rank": "R1",
  "colors": ["RED"],
  "tone": "pierwotny",
  "threads": ["forma", "żar", "wejście", "wielkość"],
  "mechanicHints": ["activation", "shape", "prg_size"],
  "title": "Ślad Żaru",
  "lines": [
    "Żar śpi pod kamieniem",
    "w pierwszej rysie",
    "krąg zaczyna rosnąć"
  ],
  "notes": "Haiku sugeruje aktywację, formę i powiększenie wpływu bez opisu statystyk."
}
```

Pole `lines` powinno mieć dokładnie 3 wersy dla haiku kart.
Dla opisów innych elementów można dopuścić inne formaty, ale domyślnie trzymać 3 wersy.

## 10. Statusy treści

Każdy wpis treści powinien mieć status.

Dozwolone statusy:

```text
draft
review
approved
deprecated
legacy
```

Znaczenie:

`draft`

* tekst roboczy,
* może być zmieniany swobodnie.

`review`

* tekst gotowy do przeglądu projektowego.

`approved`

* tekst zatwierdzony do użycia w runtime.

`deprecated`

* tekst nieużywany, ale pozostawiony tymczasowo.

`legacy`

* tekst historyczny, nie powinien być ładowany przez runtime.

Runtime powinien domyślnie używać tylko treści o statusie:

```text
approved
```

W trybie debug można pozwolić na podgląd `draft` i `review`.

## 11. Format definicji elementu gry

Element gry opisuje, czym jest obiekt, jakie ma powiązania i czego runtime ma szukać.

Przykład karty:

```json
{
  "id": "CARD_R1_RED",
  "type": "card",
  "rank": "R1",
  "tierMode": "DR_SDR_PDR",
  "colors": ["RED"],
  "branchCompatibility": ["PRG", "WORLD"],
  "haikuId": "HAIKU_CARD_R1_RED",
  "descriptionId": "DESC_CARD_R1_RED",
  "visualId": "CARD_VISUAL_R1_RED",
  "mechanics": {
    "effectIds": [
      "EFFECT_PRG_SIZE_MODIFIER",
      "EFFECT_WORLD_FORM_MODIFIER"
    ],
    "defaultProfileId": "PROFILE_CARD_R1_RED_DEFAULT"
  },
  "editor": {
    "group": "cards/r",
    "label": "R1 RED",
    "visible": true
  }
}
```

Element nie powinien przechowywać pełnej treści haiku.
Element nie powinien przechowywać pełnej definicji efektu.
Element przechowuje referencje.

## 12. Format definicji efektu mechanicznego

Efekt mechaniczny opisuje dozwolony typ działania i parametry, które mogą być edytowane.

Przykład:

```json
{
  "id": "EFFECT_PRG_SIZE_MODIFIER",
  "label": "Wielkość ringu PRG",
  "category": "PRG",
  "axis": "SIZE",
  "runtimeHandler": "prg.sizeModifier",
  "allowedModes": ["increase", "decrease"],
  "params": {
    "mode": "increase",
    "radiusMultiplier": 1.15,
    "durationSeconds": 30,
    "stacking": "replace"
  },
  "editor": {
    "group": "PRG / Wielkość",
    "controlType": "numeric_with_mode",
    "showAsCheckbox": true,
    "description": "Modyfikuje rozmiar pola oddziaływania gracza."
  }
}
```

Ważna zasada bezpieczeństwa:

Edytor może zmieniać parametry istniejących efektów, ale nie powinien pozwalać na wpisywanie dowolnych nazw funkcji runtime.

Pole `runtimeHandler` powinno pochodzić z zamkniętej listy obsługiwanej przez kod gry.

Nowe typy efektów powinny być dodawane przez zmianę kodu i rejestru efektów, nie przez dowolne wpisanie tekstu w edytorze.

## 13. Kategorie efektów

Startowe kategorie efektów:

```text
PRG
WORLD
CARD
SLOT
RESOURCE
SPECIAL
EVENT
VISUAL_ONLY
TEXT_ONLY
```

Znaczenie:

`PRG`

* efekty wpływające na Pole Reakcji Gracza.

`WORLD`

* efekty wpływające na zachowanie świata gry.

`CARD`

* efekty dotyczące kart, sekwencji, tierów, kolekcji.

`SLOT`

* efekty dotyczące slotów, stabilizacji, trwałości, napięć i blizn.

`RESOURCE`

* efekty dotyczące pyłu, flakonów/naczyń, kryształów i stabilizatorów.

`SPECIAL`

* efekty kart specjalnych, DS, kart naprawczych i artefaktów specjalnych.

`EVENT`

* efekty eventowe.

`VISUAL_ONLY`

* efekt czysto wizualny, bez wpływu na mechanikę.

`TEXT_ONLY`

* element opisowy, bez aktywnej mechaniki.

## 14. Efekty PRG — startowy katalog edytora

PRG ma cztery główne osie:

* Wielkość,
* Klej–Odpychanie,
* Prędkość,
* Obiekty.

W edytorze powinny być przedstawione przystępnie jako grupy.

Przykład panelu:

```text
PRG / Wielkość
[ ] Aktywny
Tryb: powiększ / pomniejsz
Mnożnik promienia: 1.15
Czas działania: 30 s
Stackowanie: replace / add / multiply
Opis dla gracza: Krąg wpływu zmienia rozmiar.

PRG / Klej–Odpychanie
[ ] Aktywny
Tryb: przyciąganie / odpychanie
Siła: 0.8
Promień: 220
Wygładzenie: 0.4
Opis dla gracza: Pole przyciąga albo odpycha obiekty.

PRG / Prędkość
[ ] Aktywny
Tryb: spowolnij / przyspiesz
Mnożnik prędkości: 0.75
Czas działania: 30 s
Opis dla gracza: Ruch obiektów zmienia tempo.

PRG / Obiekty
[ ] Aktywny
Meteory: tak/nie
Asteroidy: tak/nie
Księżyce: tak/nie
Planety: tak/nie
Opis dla gracza: Pole obejmuje wybrane klasy obiektów.
```

Edytor nie musi pokazywać nazw funkcji runtime.
Edytor powinien pokazywać nazwy projektowe.

## 15. Efekty ŚWIATA — startowy katalog edytora

ŚWIAT ma cztery główne osie:

* Forma,
* Intencja,
* Czas,
* Cisza.

Startowo można je przedstawić jako grupy:

```text
ŚWIAT / Forma
[ ] Aktywny
Wpływ na tworzenie obiektów
Wpływ na progi progresji
Wpływ na rozmiar / masę / narodziny ciał

ŚWIAT / Intencja
[ ] Aktywny
Wpływ na kierunek zdarzeń
Wpływ na relacje obiektów
Wpływ na wybór efektów

ŚWIAT / Czas
[ ] Aktywny
Wpływ na tempo procesów
Wpływ na trwanie efektów
Wpływ na sekwencje świata

ŚWIAT / Cisza
[ ] Aktywny
Wpływ na stabilizację
Wpływ na spowolnienie / wyciszenie
Wpływ na kondensację / zatrzymanie
```

Finalne parametry osi ŚWIATA wymagają osobnego strojenia.
Na początku edytor może pokazywać puste lub częściowo zablokowane grupy.

## 16. Efekty slotu

Docelowy slot może mieć kilka miejsc:

* karta R,
* stabilizator,
* karta specjalna,
* artefakt.

W edytorze efektów slotu powinny istnieć grupy:

```text
SLOT / Trwałość
[ ] Karta traci trwałość
Czas bazowy: ...
Mnożnik tieru: ...
Próg ostrzeżenia: ...
Próg pęknięcia: ...

SLOT / Stabilizacja
[ ] Może używać stabilizatora
Typy stabilizatorów: pył / flakon / kryształ
Kolor wymagany: zgodny / częściowo zgodny / dowolny
Mnożnik spowolnienia zużycia: ...

SLOT / Napięcie
[ ] Może przyjąć napięcie
Kierunek napięcia: w górę sieci
Mnożnik napięcia: ...

SLOT / Blizna
[ ] Slot może dostać bliznę
Kara pierwszej blizny: ...
Kara drugiej blizny: ...
Kara trzeciej blizny: ...
```

Ten dokument nie przesądza finalnych wartości.
Edytor powinien pozwalać na zmianę wartości dopiero po wdrożeniu obsługi danego parametru w runtime.

## 17. Warstwa opisów

Oprócz haiku system powinien obsługiwać zwykłe opisy.

Proponowane typy opisów:

```text
shortDescription
longDescription
mechanicDescription
debugDescription
loreNote
```

Znaczenie:

`shortDescription`

* krótki opis dla panelu karty.

`longDescription`

* dłuższy opis w czytniku szczegółów.

`mechanicDescription`

* zrozumiały opis działania dla gracza.

`debugDescription`

* opis techniczny dla edytora i debug panelu.

`loreNote`

* opcjonalna notatka świata.

## 18. Format opisu

Przykład:

```json
{
  "id": "DESC_CARD_R1_RED",
  "entityId": "CARD_R1_RED",
  "locale": "pl",
  "status": "draft",
  "shortDescription": "Pierwszy impuls formy. Wzmacnia czerwony tryb działania.",
  "longDescription": "Karta czerwonego wejścia niesie żar formy i pierwszy nacisk konfiguracji.",
  "mechanicDescription": "Może modyfikować Wielkość PRG albo Formę ŚWIATA, zależnie od osadzenia w slocie.",
  "debugDescription": "Referencja do efektów: EFFECT_PRG_SIZE_MODIFIER, EFFECT_WORLD_FORM_MODIFIER.",
  "loreNote": "Czerwony rdzeń jest pierwszym odciskiem działania."
}
```

## 19. Rejestr haiku

Plik `haiku.registry.json` powinien opisywać, jakie pliki haiku istnieją i w jakiej kolejności są ładowane.

Przykład:

```json
{
  "schemaVersion": 1,
  "locale": "pl",
  "files": [
    "haiku.cards.r.json",
    "haiku.resources.json",
    "haiku.glyphs.json",
    "haiku.artifacts.json",
    "haiku.special_cards.json"
  ]
}
```

Rejestr ułatwia loaderowi ładowanie wielu plików bez hardkodowania całej listy w kodzie.

## 20. Rejestr elementów

Plik `elements.registry.json` powinien opisywać, jakie pliki elementów istnieją.

Przykład:

```json
{
  "schemaVersion": 1,
  "files": [
    "elements.cards.r.json",
    "elements.resources.dust.json",
    "elements.resources.crystals.json",
    "elements.glyphs.json",
    "elements.artifacts.json",
    "elements.special_cards.json"
  ]
}
```

## 21. Rejestr efektów

Plik `effects.registry.json` powinien opisywać dozwolone efekty i pliki mechaniki.

Przykład:

```json
{
  "schemaVersion": 1,
  "files": [
    "effects.prg.json",
    "effects.world.json",
    "effects.cards.json",
    "effects.slots.json"
  ],
  "runtimeHandlers": [
    "prg.sizeModifier",
    "prg.attractionRepulsion",
    "prg.speedModifier",
    "prg.objectScope",
    "world.formModifier",
    "world.intentionModifier",
    "world.timeModifier",
    "world.silenceModifier",
    "slot.stabilization",
    "slot.durabilityModifier"
  ]
}
```

## 22. Loader runtime — kierunek

Runtime powinien dostać prosty adapter danych.

Proponowane API:

```text
HC.Content.load()
HC.Content.getElement(id)
HC.Content.getHaiku(id)
HC.Content.getHaikuForElement(elementId)
HC.Content.getDescriptionForElement(elementId)
HC.Content.getEffectsForElement(elementId)
HC.Content.getEffect(effectId)
HC.Content.getBalanceProfile(profileId)
```

Zasada:

* runtime nie powinien sam szukać po wszystkich plikach,
* loader powinien zbudować indeksy po ID,
* brakujący wpis powinien dawać czytelny fallback,
* błędy danych powinny być widoczne w debug.

## 23. Fallbacki runtime

Jeśli brakuje haiku:

```text
[brak haiku]
```

Jeśli brakuje opisu:

```text
[brak opisu]
```

Jeśli brakuje efektu:

* runtime nie powinien się wysypać,
* debug powinien zgłosić brak `effectId`,
* element powinien działać bez tego efektu albo zostać oznaczony jako niekompletny.

Jeśli wpis ma status `draft`, a runtime nie jest w trybie debug:

* można go ukryć,
* albo pokazać tylko wtedy, gdy nie istnieje zatwierdzony wpis.

Decyzja wymaga osobnego passu runtime.

## 24. Walidator danych

Przed użyciem danych w runtime powinien istnieć walidator.

Proponowany skrypt:

```text
tools/content_editor/validate_content.py
```

Walidator powinien sprawdzać:

* czy każde `entityId` z haiku istnieje w elementach,
* czy każde `haikuId` z elementu istnieje w haiku,
* czy każde `descriptionId` istnieje,
* czy każde `effectId` istnieje w rejestrze efektów,
* czy każde `runtimeHandler` jest na liście dozwolonych handlerów,
* czy kolory należą do dozwolonej listy,
* czy R1 ma dokładnie 1 kolor,
* czy R2 ma dokładnie 2 kolory,
* czy R3 ma dokładnie 3 kolory,
* czy R4 ma dokładnie 4 kolory,
* czy R4 zawiera wszystkie cztery kolory,
* czy `lines` w haiku karty ma 3 wersy,
* czy status wpisu jest dozwolony,
* czy nie ma duplikatów ID,
* czy pliki JSON są poprawne składniowo.

Walidator powinien zwracać:

```text
OK
WARNINGS
ERRORS
```

Błędy krytyczne powinny blokować eksport danych.

## 25. Lokalny edytor danych

Docelowo powstanie lokalny edytor JSON.

Proponowana nazwa:

```text
Haiku Cosmos Content Editor
```

Polska nazwa robocza:

```text
Edytor Treści i Balansu Haiku Cosmos
```

Edytor powinien być osobnym narzędziem lokalnym, a nie częścią runtime gry.

Proponowany katalog:

```text
tools/content_editor/
```

Proponowana technologia:

* Python,
* PySide6 jako preferowany GUI,
* Tkinter jako prostsza alternatywa startowa.

PySide6 jest rekomendowany dla dłuższego rozwoju, ponieważ edytor będzie miał wiele paneli, filtrów i formularzy.

## 26. Główne panele edytora

Edytor powinien mieć układ:

```text
LEWA KOLUMNA
Lista elementów
Filtry:
- typ: karty / pyły / glify / artefakty / specjalne
- rząd: R1 / R2 / R3 / R4
- kolor: RED / YELLOW / GREEN / BLUE
- status: draft / review / approved
- szukaj po ID / nazwie

ŚRODEK
Podgląd elementu
- ID
- typ
- kolory
- rząd
- tier
- gałąź
- asset preview, jeśli dostępny
- podstawowy opis

PRAWA GÓRA
Treść
- tytuł
- haiku, 3 wersy
- opis krótki
- opis długi
- nici / tagi / słownik
- status

PRAWA DÓŁ
Mechanika
- checkboxy efektów
- parametry efektów
- opis działania
- debug opis
- walidacja elementu
```

Edytor powinien być czytelny, a nie dekoracyjny.
Najważniejsze są szybkość edycji i bezpieczeństwo danych.

## 27. Edytor — zasady bezpieczeństwa

Edytor może:

* zmieniać haiku,
* zmieniać opisy,
* przypisywać istniejące haiku do elementu,
* przypisywać istniejące efekty do elementu,
* zmieniać parametry istniejących efektów,
* zmieniać status wpisów,
* eksportować dane do runtime.

Edytor nie powinien:

* tworzyć dowolnych nazw funkcji runtime,
* usuwać ID bez ostrzeżenia,
* zapisywać niepoprawnego JSON bez backupu,
* automatycznie zmieniać kanonicznych ID kart,
* zmieniać mechaniki, której runtime jeszcze nie obsługuje,
* mieszać danych draft z approved bez oznaczenia.

Każdy zapis powinien tworzyć backup albo umożliwiać cofnięcie.

## 28. Upload / eksport konfiguracji

Docelowo projektant powinien móc:

1. Edytować dane lokalnie.
2. Uruchomić walidację.
3. Wyeksportować pliki JSON do `public/data/`.
4. Uruchomić grę lokalnie.
5. Sprawdzić efekt w runtime.
6. Wrzucić zmienione pliki do repo.

Edytor powinien mieć przyciski:

```text
Waliduj
Zapisz
Eksportuj do public/data
Utwórz backup
Otwórz katalog
```

Eksport powinien być jawny.
Edytor nie powinien po cichu nadpisywać plików runtime.

## 29. Mechanika a edytor

Edytor nie jest miejscem projektowania nowych funkcji runtime.

Edytor jest miejscem:

* parametryzowania istniejących funkcji,
* przypisywania efektów do elementów,
* opisywania elementów,
* strojenia wartości,
* przygotowania danych do testów.

Nowe funkcje runtime powinny być dodawane osobnym patchem.

Po dodaniu nowej funkcji Codex powinien:

* dodać runtime handler,
* dodać wpis w `effects.registry.json`,
* dodać obsługę walidatora,
* dodać pola GUI w edytorze,
* dodać przykładowy wpis danych.

## 30. Minimalny pierwszy etap wdrożenia

Pierwszy etap powinien być mały.

Zakres:

1. Utworzyć katalogi:

```text
public/data/haiku/
public/data/elements/
public/data/mechanics/
```

2. Utworzyć pliki:

```text
public/data/haiku/haiku.registry.json
public/data/haiku/haiku.cards.r.json
public/data/elements/elements.registry.json
public/data/elements/elements.cards.r.json
public/data/mechanics/effects.registry.json
public/data/mechanics/effects.prg.json
public/data/mechanics/effects.world.json
```

3. Dodać przykładowe dane dla:

```text
CARD_R1_RED
CARD_R1_BLUE
CARD_R2_RED_YELLOW
```

4. Dodać loader:

```text
HC.Content.load()
HC.Content.getElement(id)
HC.Content.getHaikuForElement(id)
```

5. Podpiąć haiku do panelu opisu karty.

6. Dodać bezpieczny fallback, jeśli haiku nie istnieje.

Ten etap nie powinien jeszcze tworzyć pełnego edytora Python.

## 31. Drugi etap wdrożenia

Drugi etap:

1. Dodać walidator Python:

```text
tools/content_editor/validate_content.py
```

2. Dodać proste raporty:

```text
OK
WARNINGS
ERRORS
```

3. Dodać walidację ID, kolorów, rządów, haiku i efektów.

4. Dodać testowe dane dla wszystkich R1.

5. Dodać możliwość podglądu statusu danych w debug.

## 32. Trzeci etap wdrożenia

Trzeci etap:

1. Dodać prosty edytor GUI.

Minimalny zakres GUI:

* lista elementów,
* edycja tytułu,
* edycja 3 wersów haiku,
* edycja krótkiego opisu,
* wybór statusu,
* zapis JSON,
* walidacja.

Na tym etapie GUI nie musi jeszcze obsługiwać pełnej mechaniki.

## 33. Czwarty etap wdrożenia

Czwarty etap:

1. Rozszerzyć GUI o mechanikę.

Zakres:

* checkboxy efektów,
* edycja parametrów,
* grupy PRG,
* grupy ŚWIAT,
* grupy SLOT,
* walidacja wartości,
* eksport do runtime.

Ten etap wymaga wcześniejszego uporządkowania runtime handlerów.

## 34. Piąty etap wdrożenia

Piąty etap:

1. Rozszerzyć dane poza karty R.

Zakres:

* pyły,
* kryształy,
* flakony/naczynia,
* glify,
* artefakty,
* karty specjalne,
* DS,
* przyszłe eventy.

Dopiero wtedy rozbudowywać `haiku.resources.json`, `haiku.glyphs.json`, `haiku.artifacts.json` i `haiku.special_cards.json`.

## 35. Zasady nazw plików

Nazwy plików powinny być małymi literami, z kropkami jako separatorami zakresu:

```text
haiku.cards.r.json
haiku.resources.json
haiku.special_cards.json
elements.cards.r.json
effects.prg.json
balance.defaults.json
```

Nazwy ID pozostają wielkimi literami i underscore:

```text
CARD_R1_RED
HAIKU_CARD_R1_RED
EFFECT_PRG_SIZE_MODIFIER
```

To rozdziela:

* nazwy plików,
* ID danych,
* nazwy runtime handlerów.

## 36. Lokalizacja dokumentacji

Ten dokument powinien trafić do:

```text
docs/current/technical/CONTENT_DATA_SYSTEM.md
```

Po zatwierdzeniu dokumentu należy później dopisać go do:

```text
docs/current/README.md
docs/current/maps/PROJECT_INDEX.md
docs/current/maps/DEPENDENCY_MAP.md
```

Nie jest to wymagane w momencie ręcznego dodania szkicu, ale powinno być wykonane przed pierwszym większym promptem dla Codexa.

## 37. Granice dokumentu

Ten dokument nie definiuje:

* finalnych wartości balansu,
* pełnej listy efektów mechanicznych,
* finalnego GUI edytora,
* finalnej struktury wszystkich zasobów,
* kompletnego systemu i18n,
* sposobu generowania haiku,
* finalnego formatu runtime handlerów.

Ten dokument definiuje:

* kierunek podziału danych,
* stabilne ID jako klucz,
* rozdział treści od mechaniki,
* rekomendowaną strukturę plików,
* podstawowy format haiku,
* podstawowy format elementu,
* podstawowy format efektu,
* kierunek walidatora,
* kierunek lokalnego edytora.

## 38. Zasada końcowa

Karta nie powinna czytać poezji jako mechaniki.

Karta powinna mieć ID.

Po ID system znajduje:

* haiku,
* opis,
* asset,
* efekty,
* parametry,
* stan edytorski.

Dzięki temu tekst może rosnąć organicznie, a mechanika pozostaje kontrolowana.

Najpierw ID.
Potem treść.
Potem efekt.
Potem balans.
Potem runtime.
