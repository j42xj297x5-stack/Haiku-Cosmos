> Status: KANON STRUKTURALNY / DO STROJENIA
> Obszar: Player Reaction Field / Pole Reakcji Gracza
> Źródło prawdy: TAK, dla struktury PRG i relacji systemowych; NIE, dla finalnych wartości balansu
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: SUB_META_SYSTEM.md, ../ui/UI_WORLD.md, CARDS_SYSTEM.md, ECONOMY_SYSTEM.md, ../visual/ART_DIRECTION.md, ../visual/KOSMOLOGIA_WIZUALNA.md, ../visual/BIBLIOTEKA_MATERIALOW.md

# Haiku Cosmos — PRG SYSTEM

## 1. Cel dokumentu

Ten dokument definiuje **kanon strukturalny** systemu **Player Reaction Field (PRG)** / **Pola Reakcji Gracza**.

Zakres dokumentu:
- definicja PRG jako systemu projektowego,
- osie PRG i ich role,
- relacje PRG z kartami R1/R2 oraz miejscem ODB,
- osadzenie PRG w SUB-META,
- relacja PRG z UI i kierunkiem wizualnym,
- granice między kanonem strukturalnym a strojeniem parametrów.

Ten dokument **nie** jest tabelą balansu i **nie** definiuje finalnych wartości liczbowych.

---

## 2. Definicja PRG

**PRG (Player Reaction Field / Pole Reakcji Gracza)** to system pola wpływu gracza na obiekty świata.

PRG określa:
- jaki jest charakter oddziaływania gracza,
- jakie osie działania są aktywne,
- jak osie łączą się między sobą,
- jak konfiguracja PRG jest osadzana w SUB-META,
- jak aktywne tryby PRG są komunikowane w UI.

PRG jest warstwą pomiędzy decyzją gracza a zachowaniem obiektów w świecie RUN.

---

## 3. Czym PRG nie jest

PRG **nie jest**:
- kamerą,
- globalną fizyką świata,
- systemem kosztów RP,
- samodzielnym systemem UI,
- pełną specyfikacją balansu.

PRG nie zastępuje dokumentów:
- `ECONOMY_SYSTEM.md` (koszty i ekonomia),
- `UI_WORLD.md` (struktura i przepływ interfejsu),
- dokumentów visual (język oprawy i materiału).

---

## 4. Cztery osie PRG

### 4.1. Wielkość (dawniej: zasięg / radius)

- Definiuje rozmiar pola oddziaływania gracza.
- Wpływa na relację między precyzją a skalą wpływu.
- Strukturalnie odpowiada za to, „jak duży” jest aktywny obszar PRG.

### 4.2. Klej–Odpychanie (dawniej: glue / attraction / repulsion)

- Definiuje relacyjny charakter oddziaływania na obiekty.
- Obejmuje kierunki działania: przyciąganie i odpychanie.
- Strukturalnie odpowiada za to, „jak” obiekty zachowują się względem pola gracza.

### 4.3. Prędkość

- Definiuje wpływ PRG na tempo ruchu obiektów w polu.
- Obejmuje warianty spowalniania i przyspieszania.
- Strukturalnie odpowiada za to, „w jakim tempie” przebiega reakcja obiektów.

### 4.4. Obiekty

- Definiuje klasy i skalę obiektów podatnych na wpływ PRG.
- Nie jest globalną fizyką świata.
- Strukturalnie odpowiada za to, „na co” PRG może skutecznie oddziaływać.

Nazwy osi są obowiązujące i muszą pozostać spójne z `SUB_META_SYSTEM.md` oraz `UI_WORLD.md`.

---

## 5. R1 w PRG

R1 w PRG pełni rolę podstawową i konfiguracyjną:
- R1 osadzona w osi PRG definiuje podstawowy tryb działania tej osi.
- R1 jest warunkiem podstawowej aktywacji osi w konfiguracji PRG.
- R1 w PRG nie jest opisywana tutaj jako jednorazowy efekt RUN.
- Siła i zakres działania mogą zależeć od tieru, ale finalne liczby pozostają do strojenia.

R1 jest częścią konfiguracji SUB-META i stanowi fundament działania osi PRG.

---

## 6. R2 jako wiązania PRG

R2 w PRG pełni rolę relacyjną:
- R2 nie działa samodzielnie.
- R2 tworzy wiązanie między dwiema osiami PRG.
- Wiązanie R2 pozwala graczowi używać aktywnego trybu połączenia.
- Aktywne połączenia PRG muszą być spójne z `SUB_META_SYSTEM.md` i `UI_WORLD.md`.

Wiązania PRG (kanon strukturalny):
- **Wielkość – Prędkość**,
- **Wielkość – Obiekty**,
- **Klej–Odpychanie – Obiekty**.

---

## 7. ODB jako odwrócenie / alternatywne działanie osi

ODB w kontekście PRG:
- ODB nie jest osobną osią.
- ODB jest miejscem odwrócenia lub alternatywnego działania w ramach osi.
- ODB należy strukturalnie do konfiguracji PRG/SUB-META i wymaga dalszego doprecyzowania w osobnym kroku strojenia.
- PRG_SYSTEM nie definiuje kosztów ODB.

Przykłady strukturalne (bez liczb):
- Wielkość: wariant powiększania / zmniejszania zakresu oddziaływania,
- Klej–Odpychanie: wariant przyciągania / odpychania,
- Prędkość: wariant spowalniania / przyspieszania,
- Obiekty: wariant wpływu na inne klasy obiektów.

---

## 8. Relacja PRG ↔ SUB-META

`SUB_META_SYSTEM.md` definiuje:
- sloty PRG,
- zasady osadzania R1,
- zasady wiązań R2,
- relacje konfiguracji między gałęziami.

PRG jest w SUB-META gałęzią konfiguracji wpływu gracza na świat i działa jako struktura wyboru trybu oddziaływania.

---

## 9. Relacja PRG ↔ UI

`UI_WORLD.md` definiuje:
- gdzie PRG jest widoczne,
- jak gracz przełącza aktywne wiązania PRG,
- jak PRG jest komunikowane w RUN HUD i SUB-META Overlay.

PRG_SYSTEM definiuje strukturę systemu, a UI_WORLD definiuje formę prezentacji tej struktury.

---

## 10. Relacja PRG ↔ oprawa wizualna

Feeling osi PRG (skrót kierunkowy):
- **Wielkość**: zwarta / precyzyjna / stanowcza,
- **Klej–Odpychanie**: lepka / relacyjna / miękka,
- **Prędkość**: falowa / czasowa / płynna,
- **Obiekty**: chłodna / przestrzenna / skalująca.

Szczegółowy język wizualny i materiałowy jest definiowany w:
- `docs/current/visual/ART_DIRECTION.md`,
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`,
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`.

PRG_SYSTEM nie projektuje pełnego visual language ringu.

---

## 11. Granice kanonu i strojenia

### KANON STRUKTURALNY

Obowiązujące są:
- cztery osie PRG,
- relacje R1 / R2 / ODB,
- definicja PRG jako pola wpływu gracza,
- relacja PRG z SUB-META / UI / visual,
- wiązania PRG opisane w tym dokumencie.

### DO STROJENIA

Do późniejszej kalibracji pozostają:
- konkretne wartości,
- promienie,
- mnożniki,
- tempo,
- siły,
- czas trwania efektów,
- dokładny feeling na poziomie parametrów.

---

## 12. Czego nie robić

- Nie traktować PRG jako kamery.
- Nie traktować PRG jako globalnej fizyki świata.
- Nie mieszać PRG z ekonomią RP.
- Nie zmieniać kosztów w `PRG_SYSTEM.md`.
- Nie projektować PRG wizualnie bez dokumentów visual.
- Nie implementować nowych parametrów bez osobnego audytu runtime i balansu.

---

## 13. Status dokumentu

**Status: KANON STRUKTURALNY / DO STROJENIA**

To oznacza, że:
- struktura PRG i relacje systemowe są obowiązujące,
- nazwy osi są obowiązujące,
- dokument nie jest jeszcze finalną specyfikacją balansu,
- dalsze strojenie wymaga osobnych kroków runtime/balans.


## 14. Migracja PRG / DO SYNCHRONIZACJI Z CARD_SLOT_NETWORK_SYSTEM

- R2 PRG działa lokalnie w obrębie gałęzi PRG.
- R3/R4 są globalnym rdzeniem ponad PRG i ŚWIATEM.
- Układ PRG musi zostać zsynchronizowany z decyzją, że w PRG docelowo pozostaje jedna standardowa karta funkcjonalna, a wcześniejszy drugi/dodatkowy slot przechodzi w rolę karty naprawczej albo systemu naprawy slotów.
- Szczegóły aktywacji slotów, trwałości, napięć, blizn i naprawy opisuje `CARD_SLOT_NETWORK_SYSTEM.md`. Ten krok nie projektuje nowego layoutu PRG i nie zmienia runtime.
