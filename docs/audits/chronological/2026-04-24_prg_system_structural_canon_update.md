# Audit Chronologiczny — 2026-04-24
## PRG_SYSTEM.md — aktualizacja do statusu „KANON STRUKTURALNY / DO STROJENIA”

## 1. EXECUTIVE SUMMARY

Wykonano audyt i aktualizację dokumentu `docs/current/systems/PRG_SYSTEM.md` z poziomu „DO AKTUALIZACJI” do „KANON STRUKTURALNY / DO STROJENIA”.

Zakres zmiany objął wyłącznie dokumentację strukturalną PRG:
- doprecyzowanie definicji systemu PRG,
- jednoznaczne granice (czym PRG jest i czym nie jest),
- kanoniczne nazwy czterech osi,
- relacje R1/R2/ODB,
- relacje PRG ↔ SUB-META ↔ UI ↔ visual,
- rozdzielenie kanonu strukturalnego od strojenia parametrów.

Nie wykonywano audytu runtime, patchowania JS ani balansu liczbowego.

---

## 2. Zakres sprawdzonych dokumentów

Sprawdzono dokumenty obowiązkowe:
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`
- `docs/current/visual/README.md`
- `docs/current/visual/ART_DIRECTION.md`
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`
- `docs/current/README.md`
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`

Sprawdzono także handoff:
- `docs/handoff/2026-04-24_docs_current_clean_handoff.md` (jako snapshot historyczny po Kroku 10).

---

## 3. Status PRG przed i po

Przed:
- `PRG_SYSTEM.md` miał status **DO AKTUALIZACJI**,
- dokument miał charakter koncepcyjny i nie był wystarczająco domknięty jako kanon strukturalny.

Po:
- `PRG_SYSTEM.md` ma status **KANON STRUKTURALNY / DO STROJENIA**,
- struktura osi i relacje systemowe są obowiązujące,
- wartości liczbowe i feeling parametrów pozostają do kalibracji.

---

## 4. Najważniejsze decyzje strukturalne

1. PRG jest kanonicznie opisany jako **Pole Reakcji Gracza** (Player Reaction Field), nie jako kamera/UI/fizyka globalna.
2. Obowiązują cztery osie PRG:
   - Wielkość,
   - Klej–Odpychanie,
   - Prędkość,
   - Obiekty.
3. R1 w PRG:
   - definiuje podstawowy tryb osi,
   - jest warunkiem aktywacji osi,
   - nie jest opisywana jako jednorazowy efekt RUN.
4. R2 w PRG:
   - nie działa samodzielnie,
   - tworzy wiązania między osiami,
   - aktywuje tryby połączeń zgodne z SUB-META/UI.
5. ODB:
   - nie jest osobną osią,
   - jest miejscem odwrócenia/alternatywy działania osi,
   - bez definiowania kosztów i bez tabel balansu w PRG.
6. Relacje między dokumentami:
   - SUB-META: slotowanie i wiązania,
   - UI: prezentacja i przełączanie,
   - Visual: feeling i język materiałowo-kolorystyczny,
   - Economy: koszty RP poza PRG_SYSTEM.

---

## 5. Zmiany w PRG_SYSTEM.md

W `docs/current/systems/PRG_SYSTEM.md`:
- zaktualizowano blok statusowy i źródło prawdy,
- przebudowano dokument na docelową strukturę kanoniczną,
- dodano sekcje graniczne (co jest kanonem, co jest do strojenia),
- doprecyzowano relacje R1/R2/ODB,
- dodano krótkie profile feelingu osi i odnośniki do dokumentów visual,
- dodano sekcję „Czego nie robić”, aby uniknąć mieszania PRG z ekonomiami/runtime.

---

## 6. Zmiany w mapach

Zaktualizowano:
- `docs/current/README.md` — status PRG na „KANON STRUKTURALNY / DO STROJENIA”,
- `docs/current/maps/PROJECT_INDEX.md` — status i indeks PRG,
- `docs/current/maps/DEPENDENCY_MAP.md` — status PRG oraz ostrzeżenia/relacje PRG ↔ SUB-META ↔ UI ↔ visual.

---

## 7. Czego nie zmieniano

Nie zmieniano:
- runtime JavaScript,
- implementacji mechanik,
- kosztów RP,
- tabel balansu,
- parametrów liczbowych (promienie, siły, mnożniki, timingi),
- pełnego języka wizualnego ringu.

Handoff `docs/handoff/2026-04-24_docs_current_clean_handoff.md` pozostaje poprawnym snapshotem historycznym sprzed aktualizacji PRG.

---

## 8. Ryzyka i obszary do strojenia

1. Brak finalnych wartości liczbowych wymaga osobnego kroku balansu.
2. Feeling osi (szczególnie Klej–Odpychanie i ODB) wymaga kalibracji runtime.
3. Spójność parametrów PRG z rzeczywistą implementacją musi być potwierdzona audytem runtime.
4. Szczegółowe zasady ODB (warunki, limity, wpływ na gameplay) pozostają do doprecyzowania.
5. PRG może wymagać dodatkowej walidacji UX po wdrożeniu strojenia.

---

## 9. Rekomendowany następny krok

Rekomendowane dalsze kroki (jeden do wyboru):
1. audyt i domknięcie `I18N_SYSTEM.md`, albo
2. osobny audyt runtime PRG względem nowego kanonu strukturalnego, albo
3. audyt `docs/current/technical/WORLD_FUNCTION_MAP.md` jako mapy runtime.
