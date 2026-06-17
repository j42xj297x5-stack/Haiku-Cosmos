# Haiku Cosmos — CARD SLOT NETWORK MIGRATION CHECKLIST

> Status: ROBOCZY / CHECKLISTA MIGRACYJNA / PRZED RUNTIME
> Obszar: CARD SLOT NETWORK / przygotowanie migracji runtime
> Źródło prawdy: NIE, lista decyzji i zależności przed implementacją
> Ostatnia aktualizacja: 2026-06-16
> Powiązane dokumenty: CARD_SLOT_NETWORK_SYSTEM.md, CARDS_SYSTEM.md, SUB_META_SYSTEM.md, ECONOMY_SYSTEM.md, PRG_SYSTEM.md, ../ui/UI_WORLD.md, ../ui/SUB_META_V2_MASTER_SPEC.md, ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md

## 1. Cel checklisty

Ta checklista ma zostać zamknięta przed pierwszym runtime pass systemu `CARD_SLOT_NETWORK_SYSTEM.md`.

Jej celem jest przygotowanie przyszłych promptów implementacyjnych przez zebranie decyzji projektowych, zależności dokumentacyjnych i minimalnych modeli, które muszą być doprecyzowane zanim powstanie kod.

## 2. Granice

- Ten dokument nie jest implementacją.
- Ten dokument samodzielnie nie zmienia kanonu mechaniki.
- Ten dokument nie zastępuje `CARD_SLOT_NETWORK_SYSTEM.md`.
- Ten dokument służy jako lista decyzji i zależności przed kodem.
- Wszystkie punkty poniżej są pytaniami do zamknięcia, a nie finalnymi rozstrzygnięciami balansu.

## 3. Decyzje projektowe do zamknięcia

### 3.1. Finalna rola DS

Decyzja DS została częściowo zamknięta:

- [x] DS = karta naprawcza zdobywana przez AAA.
- [x] Nie tworzymy osobnej nowej karty naprawczej obok DS bez osobnej decyzji.

Pozostają otwarte:

- [ ] finalna nazwa UI,
- [ ] dokładny model craftingu kart specjalnych,
- [ ] finalny model artefaktów,
- [ ] finalny model przenoszenia wiedzy między eonami,
- [ ] finalna wizualizacja trwałości/uszkodzeń.

### 3.2. Karta naprawcza

- [ ] Czy jest kartą kolorową?
- [ ] Ile kolorów może mieć?
- [ ] Czy pochodzi z pętli AAA?
- [ ] Czy jest craftowana?
- [ ] Czy jest zużywana po naprawie?

### 3.3. Koszt slotów

- [ ] Jakie są finalne koszty R1/R2/R3/R4?
- [ ] Czy koszt dotyczy tylko włożenia?
- [ ] Czy koszt dotyczy także wyjęcia lub wymiany?
- [ ] Czy koszt rośnie od blizn?

### 3.4. Ekonomia pyłu

- [ ] Jaki jest koszt deponowania pyłu?
- [ ] Jaki jest koszt deponowania naczynia?
- [ ] Jaki jest koszt deponowania kryształu?
- [ ] Jaki jest koszt szarego pyłu?
- [ ] Jak działa craft naczynia z szarego pyłu?
- [ ] Jak działa craft kryształu z szarego pyłu?

### 3.5. Stabilizatory

- [ ] Jakie są bazowe mnożniki pył/naczynie/kryształ?
- [ ] Jak działają zasady pełnej i niepełnej zgodności kolorystycznej?
- [ ] Jaka jest kara szarego pyłu?
- [ ] Jak działa odgórna stabilizacja R4→R3→R2→R1?

### 3.6. Napięcie

- [ ] Jakie są mnożniki napięcia?
- [ ] Jak działają kaskady pęknięć?
- [ ] Kiedy napięcie się kończy?
- [ ] Co dokładnie znaczy odbudowanie linii?

### 3.7. Blizny

- [ ] Czy wartości -3% / -10% / -25% są właściwym kierunkiem balansu?
- [ ] Czy slot może mieć więcej niż 3 blizny?
- [ ] Jak pokazywać blizny w UI?
- [ ] Czy utrwalone blizny po eonie są absolutnie trwałe?
- [ ] Czy endgame może kiedyś naprawiać utrwalone blizny?

### 3.8. HUD pyłu

Model HUD pyłu częściowo zamknięty:

- [x] HUD zbiera tylko surowy pył do stosiku.
- [x] Flakon/naczynie i kryształ powstają w Kuźni, nie w bazowym HUD collection.

Nadal otwarte:

- [ ] finalny visual maski stosiku co 10%,
- [ ] finalny multi-color collection,
- [ ] auto-collection z kart specjalnych,
- [ ] finalne koszty i balans Kuźni.


- [ ] Jak pokazać chmurkę pyłu po kolizji?
- [ ] Jak działa zbieranie jednego koloru naraz na początku?
- [ ] Jak działa zasobnik 100%?
- [ ] Jak działa przycisk `Zdeponuj`?
- [ ] Jak pokazać mieszanie do szarego pyłu?
- [ ] Kiedy i jak pojawiają się późniejsze multi-color containers?

### 3.9. SUB-META UI

- [ ] Gdzie pokazać trwałość karty?
- [ ] Gdzie pokazać stabilizator?
- [ ] Gdzie pokazać napięcie?
- [ ] Gdzie pokazać bliznę slotu?
- [ ] Gdzie osadzić kartę naprawczą?
- [ ] Jak odróżnić slot aktywny, nieaktywny, napięty, uszkodzony i naprawiany?

### 3.10. Debug/balans

- [ ] Jaka jest lista grup debug do późniejszej implementacji?
- [ ] `boost`
- [ ] `durability`
- [ ] `stabilizers`
- [ ] `strain`
- [ ] `scars`
- [ ] `dust`
- [ ] `slot costs`

## 4. Kolejność przyszłych runtime passów

Rekomendowana kolejność po zamknięciu minimalnych decyzji:

1. Data model slotów i stanów bez UI.
2. Legalność wkładania R1/R2/R3/R4.
3. Lokalność R2 i globalność R3/R4.
4. Trwałość kart.
5. Stabilizatory przy kartach.
6. Napięcia i pęknięcia.
7. Blizny slotów.
8. Karta naprawcza.
9. Pył z kolizji meteorów.
10. HUD zasobników pyłu.
11. Debug/strojenie.
12. Dopiero potem pełna integracja UI/SUB-META.

## 5. Dokumenty do aktualizacji po zamknięciu decyzji

- `CARD_SLOT_NETWORK_SYSTEM.md`
- `CARDS_SYSTEM.md`
- `SUB_META_SYSTEM.md`
- `ECONOMY_SYSTEM.md`
- `PRG_SYSTEM.md`
- `UI_WORLD.md`
- `SUB_META_V2_MASTER_SPEC.md`
- `PROJECT_INDEX.md`
- `DEPENDENCY_MAP.md`

## 6. Blokery przed runtime

Runtime pass nie powinien ruszyć, dopóki nie ma decyzji przynajmniej w sprawach:

- finalna nazwa UI dla DS/karty naprawczej oraz szczegóły użycia w UI,
- minimalny model kosztów slotowych,
- minimalny model trwałości,
- minimalny model stabilizatorów,
- minimalny model napięcia,
- minimalny model blizn,
- minimalny model HUD pyłu.
