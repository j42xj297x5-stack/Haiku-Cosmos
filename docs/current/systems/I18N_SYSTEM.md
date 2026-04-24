> Status: KANON STRUKTURALNY / DO WDROŻENIA
> Obszar: system językowy / i18n
> Źródło prawdy: TAK, dla zasad językowych i struktury i18n; NIE, dla gotowej implementacji
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: ../ui/UI_WORLD.md, CARDS_SYSTEM.md, PRG_SYSTEM.md, ECONOMY_SYSTEM.md, SUB_META_SYSTEM.md

# Haiku Cosmos — I18N SYSTEM

## 1. Cel dokumentu

Ten dokument definiuje **kanon strukturalny** systemu językowego Haiku Cosmos.

Zakres dokumentu:
- język główny projektu,
- zakres tłumaczeń,
- relacja UI ↔ karty ↔ haiku,
- strategia wielojęzyczności kart,
- zasada adaptacji poetyckiej haiku,
- koncepcyjny model rodzin kluczy,
- model fallbacku językowego,
- relacje i18n z UI, kartami, PRG, ekonomią i SUB-META,
- granice między kanonem a przyszłym wdrożeniem runtime.

Dokument **nie** jest implementacją i18n i **nie** definiuje finalnego formatu plików tłumaczeń.

---

## 2. Język główny projektu

1. Podstawowym językiem projektu jest **polski**.
2. Dokumentacja projektowa powstaje po polsku.
3. Nazwy znaczeniowe systemów i treści gry projektujemy po polsku.
4. UI startuje w języku polskim jako locale domyślnym.
5. Język **angielski** jest pierwszym językiem alternatywnym.
6. Angielski nie zastępuje polskiego jako języka projektowania i nie nadpisuje sensu polskiego kanonu.

---

## 3. Zakres tłumaczeń

Zakres i18n obejmuje warstwy, w których użytkownik widzi tekst.

### 3.1 UI systemowe

Do tłumaczenia kwalifikują się w szczególności:
- przyciski,
- nagłówki,
- komunikaty stanu,
- krótkie podpowiedzi,
- etykiety slotów,
- komunikaty RUN,
- komunikaty i etykiety SUB-META,
- komunikaty i etykiety META.

### 3.2 Karty

Do tłumaczenia kwalifikują się:
- tytuł karty,
- opis funkcjonalny (jeśli występuje),
- haiku / treść poetycka.

Ten dokument definiuje **zakres**, nie pełny katalog wszystkich napisów.

---

## 4. UI systemowe a i18n

I18N_SYSTEM określa strukturę językową tekstów UI, a dokument `UI_WORLD.md` określa, gdzie i kiedy te teksty są widoczne.

Zasada projektowa:
- teksty UI traktujemy jako zasób językowy,
- logika UI i runtime nie powinna opierać się na hardkodowanych frazach po wdrożeniu i18n.

---

## 5. Karty: tytuły, opisy, haiku

Treść karty ma dwa rejestry:
1. rejestr systemowy (tytuł, opis funkcjonalny),
2. rejestr poetycki (haiku).

Oba rejestry podlegają i18n, ale mają różną naturę:
- rejestr systemowy dąży do stabilności semantycznej,
- rejestr poetycki dopuszcza adaptację i różne brzmienie między językami.

---

## 6. Strategia locales w kartach

Karta może posiadać pole `locales` z wersjami językowymi treści.

Przykład koncepcyjny:

```json
{
  "locales": {
    "pl": {
      "title": "...",
      "description": "...",
      "haiku": ["...", "...", "..."]
    },
    "en": {
      "title": "...",
      "description": "...",
      "haiku": ["...", "...", "..."]
    }
  }
}
```

Zasady:
- `locales` jest modelem docelowym, nie wymuszeniem natychmiastowej kompletności,
- karta nie musi od razu posiadać wszystkich języków,
- brak locale nie może prowadzić do awarii UI.

---

## 7. Haiku jako adaptacja poetycka

Haiku nie musi być tłumaczeniem 1:1.

Wersja haiku w innym języku powinna zachować:
- nastrój,
- obraz,
- funkcję karty,
- rytm ciszy,
- intencję poetycką.

Dopuszczalne jest inne brzmienie i inny układ frazy, jeżeli sens poetycki i rola karty pozostają zgodne.

---

## 8. Koncepcyjny model kluczy

I18N_SYSTEM definiuje rodziny kluczy na poziomie koncepcyjnym:

- `ui.*` — ogólny interfejs,
- `run.*` — komunikaty i etykiety RUN,
- `cards.*` — tytuły/opisy kart lub referencje do treści kart,
- `meta.*` — META / SUB-META / sloty / overlaye,
- `prg.*` — osie PRG i komunikaty pola gracza,
- `economy.*` — RP, koszty i komunikaty ekonomiczne,
- `common.*` — akcje powtarzalne (np. wróć, zamknij, potwierdź, anuluj).

Model rodzin kluczy jest obowiązujący strukturalnie.
Ten dokument nie tworzy pełnej tabeli kluczy i nie narzuca finalnego formatu plików tłumaczeń.

---

## 9. Fallback językowy

Model fallbacku:
1. domyślny locale: `pl`,
2. brak tłumaczenia dla wybranego języka → fallback do `pl`,
3. brak `pl` → bezpieczny fallback do surowego klucza albo neutralnego placeholdera,
4. brak tłumaczenia nie może blokować działania UI.

W przyszłym wdrożeniu fallback ma być widoczny w debug/evidence, ale szczegóły runtime nie są częścią tego dokumentu.

---

## 10. Relacje z UI / kartami / PRG / ekonomią / SUB-META / visual

- `UI_WORLD.md` definiuje, gdzie teksty są widoczne i w jakim flow.
- `CARDS_SYSTEM.md` definiuje typy kart i ich role; I18N definiuje strukturę językową ich treści.
- `PRG_SYSTEM.md` definiuje osie PRG; I18N definiuje etykiety i komunikaty językowe dla tych osi.
- `ECONOMY_SYSTEM.md` definiuje RP i koszty; I18N definiuje warstwę tekstową ekonomii.
- `SUB_META_SYSTEM.md` definiuje sloty i strukturę SUB-META; I18N definiuje nazwy i etykiety tych elementów.
- Dokumenty visual (`ART_DIRECTION.md`, `KOSMOLOGIA_WIZUALNA.md`, `BIBLIOTEKA_MATERIALOW.md`) definiują ton i ciszę wizualną, co wpływa na długość, rytm i ekspozycję tekstów UI oraz kart.

---

## 11. Granice kanonu i wdrożenia

### KANON STRUKTURALNY

Obowiązujące są:
- polski jako język główny,
- angielski jako pierwsza alternatywa,
- zakres tłumaczeń (UI + karty + haiku),
- strategia `locales` w kartach,
- zasada adaptacji poetyckiej haiku,
- fallback do `pl` i bezpieczny fallback końcowy,
- rodziny kluczy koncepcyjnych.

### DO WDROŻENIA

Do implementacji pozostają:
- konkretne pliki językowe,
- loader tłumaczeń,
- przełącznik języka,
- finalny format runtime,
- testy fallbacku,
- kompletne słowniki.

---

## 12. Czego nie robić

- Nie mieszać języków w UI bez uzasadnienia systemowego.
- Nie zastępować polskiego kanonu językiem angielskim.
- Nie tłumaczyć haiku mechanicznie 1:1.
- Nie hardcodować docelowo tekstów UI w logice gry po wdrożeniu i18n.
- Nie tworzyć pełnej tabeli kluczy bez aktualnego kontekstu UI/runtime.
- Nie traktować brakującego tłumaczenia jako błędu krytycznego runtime.

---

## 13. Status dokumentu

**Status: KANON STRUKTURALNY / DO WDROŻENIA**

To oznacza, że:
- zasady językowe i struktura i18n są obowiązujące,
- implementacja i18n pozostaje osobnym krokiem wdrożeniowym,
- dokument nie zastępuje specyfikacji runtime.
