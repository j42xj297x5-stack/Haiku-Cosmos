# Haiku Cosmos — CARDS_SYSTEM.md
## System Kart, Packi i relacja do meta

Ten dokument opisuje rolę kart w runtime i w meta.
Karta nie jest tylko nagrodą lub buffem. Karta jest narzędziem decyzji.

## 1. Zasada decyzji karty

Każda karta w runie ma dwa tryby:

1) Kliknięcie karty:
- karta uruchamia efekt runtime (tu i teraz).

2) Brak kliknięcia (zebranie / pozostawienie):
- karta staje się impulsem meta (Ekspansja),
- wpływa na kolejne runy.

To rozdziela:
- decyzje taktyczne (runtime),
- decyzje strategiczne (meta).

## 2. Typy kart (kategoryzacja)

Karty dzielą się na:
- karty sterowania i interakcji (np. PRG),
- karty stabilizacji i eskalacji (cooldowny, progi),
- karty epokowe i wydarzenia (zmieniają odczucie epoki),
- karty rytualne (sekwencje, warunki jakościowe).

Każda karta powinna mieć jasno określony:
- cel użycia (po co kliknąć),
- cel meta (po co zebrać),
- przynależność do slotu meta (Forma / Intencja / Czas / Cisza).

## 3. Relacja kart do meta

Slot główny:
- jest właścicielem ekspansji karty,
- definiuje DR / sDR / PDR.

Sloty wtórne:
- modulują interpretację,
- nie tworzą nowych reguł.

Wiązania (Bindings) mogą zmieniać interpretację,
ale nie dodają nowych efektów runtime.

## 4. Packi kart (stan projektowy)

### 4.1 Pack 04 — Pole Reakcji Gracza (PRG)

Pack kart modyfikujących sposób, w jaki świat reaguje na kursor:
- zasięg PRG (szersze / węższe pole),
- znak reakcji (przyciąganie / odpychanie),
- tempo reakcji (zwalnianie / przyśpieszanie),
- glue (lepkość trajektorii),
- stany świata wspierające PRG (kondensacja, stabilizacja obiektu),
- globalne zdarzenie kontrolowane (wczesna rotacja).

Cel packa:
- umożliwić styl gry bez automatyzacji,
- wesprzeć rozgrywkę przy wysokich prędkościach,
- dać narzędzia obrony (np. ochrona planety przed eskalacją).

### 4.2 Pack 05 — Planety gazowe: warunki i stabilizacja

Pack kart regulujących powstawanie planet gazowych i ich przechwyty:

Zasady bazowe:
- planeta gazowa może powstać tylko, jeśli dominujący kolor ≥ 60%,
- po powstaniu planety obowiązuje cooldown zbierania orbiterów (np. 20 s).

Cel packa:
- zapobiec natychmiastowej eskalacji do gwiazdy,
- wprowadzić okno decyzyjne w fazie planetarnej,
- zwiększyć czytelność procesu powstawania.

## 5. Języki (i18n) a karty

Projekt jest przygotowywany jako wielojęzyczny.

Strategia dla kart: wariant A (locales w kartach)
- karta może zawierać pole `locales`,
- `locales[lang]` przechowuje tytuł i haiku w danym języku,
- jeśli brak `locales[lang]`, stosowany jest fallback do polskiego.

Poezja (haiku) nie musi być tłumaczona 1:1.
Dopuszczalne są wersje równoległe.

## 6. Języki (i18n) a UI

UI nie trzyma tekstów na sztywno w kodzie.
UI korzysta ze słownika językowego (klucze → wartości).

Zasady:
- język domyślny: pl,
- alternatywa: en,
- brak klucza nie może crashować gry (fallback).

## 7. Status dokumentu

Dokument systemowy.
Jest źródłem prawdy dla:
- projektowania nowych kart,
- przypisywania kart do slotów meta,
- interpretacji kart w kontekście Ekspansji i Wiązań.
