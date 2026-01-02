# Haiku Cosmos — BINDINGS_SYSTEM.md
## System Wiązań (Bindings) v1

System Wiązań (Bindings) to warstwa meta, która pozwala graczowi budować styl gry.
Wiązania nie są perkami ani klasą postaci. To reguły współdziałania slotów meta.

Wiązania:
- sprzęgają dwa różne sloty meta,
- zmieniają sposób interpretacji efektów,
- nie dodają nowych efektów runtime.

W wersji v1 obowiązują dokładnie dwa Wiązania.

## 1. Architektura meta w skrócie

Meta Haiku Cosmos ma trzy poziomy:

1. Sloty meta (fundament)
- Forma
- Intencja
- Czas
- Cisza

2. Ekspansja
- modyfikator pojedynczego slotu
- rozszerza zasięg działania efektu w czasie i skali

3. Wiązania (Bindings)
- relacje pomiędzy slotami
- definiują styl gry

Schemat:
Slot → Ekspansja → Wiązanie

## 2. Definicja Wiązania

Wiązanie to reguła współdziałania dwóch slotów meta.

Wiązanie:
- nie jest osobnym slotem,
- nie jest kartą,
- nie działa bez kart lub zdarzeń,
- nie zwiększa “mocy” liczbowej efektów.

Wiązanie określa relację:
„Gdy działa A, to B reaguje inaczej”.

## 3. Aktywacja Wiązań

Wiązania:
- nie są dostępne na starcie,
- nie są wybierane z menu,
- nie są stałymi perkami.

Aktywacja następuje przez meta-doświadczenie, np.:
- DR w dwóch różnych slotach,
- PDR w jednym slocie + DR w drugim,
- określoną sekwencję kart lub zdarzeń.

Wiązanie może być:
- aktywne tylko w danym runie,
- odblokowane na przyszłość, ale nie zawsze aktywne.

## 4. Wiązania kanoniczne v1

### 4.1 Wiązanie: Czas + Cisza

Nazwa robocza: Ścieżka Wycofania  
Styl gry: kontemplacyjny, defensywny

Charakter:
- świat reaguje na brak zdarzeń,
- cisza wpływa na tempo przyszłych wydarzeń,
- eskalacja jest hamowana przez nie-działanie.

Przykłady interpretacji:
- „Nie teraz” wpływa na przyszłe timingi stanów krytycznych,
- „Cisza kolapsu” wydłuża cooldowny w kolejnych epokach,
- brak kliknięcia karty zmienia tempo ofert kart.

Rola:
- stabilizacja świata,
- kontrola eskalacji,
- wydłużenie faz kontemplacyjnych.

### 4.2 Wiązanie: Forma + Intencja

Nazwa robocza: Ścieżka Kształtowania  
Styl gry: architekt, alchemik struktur

Charakter:
- decyzje wpływają trwale na strukturę świata,
- intencja nie tylko uruchamia efekt, ale zmienia naturę obiektów.

Przykłady interpretacji:
- dominujący kolor wpływa na zachowanie planet i procesy przejść,
- rytuały modyfikują sposób przechwytywania struktur,
- stabilizacja / zamknięcie składu wzmacnia kontrolę jakości.

Rola:
- świadome kształtowanie kosmosu,
- czytelna przyczynowość decyzji,
- świat “pamięta dlaczego”.

## 5. Relacja Wiązań do Ekspansji

Ekspansja działa wewnątrz jednego slotu.
Wiązanie działa pomiędzy dwoma slotami.

Ekspansja:
- określa jak daleko w czasie i skali działa efekt.

Wiązanie:
- określa jak różne aspekty świata reagują na ten efekt.

## 6. Zasada projektowa

- Jedna karta = jeden efekt runtime.
- Ekspansja = wpływ na przyszłość tego efektu.
- Wiązanie = relacja pomiędzy aspektami świata.

Każda karta:
- jest neutralna, jeśli Wiązanie nie jest aktywne,
- może mieć interpretację rozszerzoną, jeśli Wiązanie jest aktywne,
- nie dostaje “bonusowego efektu”, tylko inną interpretację.

## 7. Kierunki przyszłe i odrzucone (pamięć projektowa)

Odłożone (v2+):
- Intencja + Czas  
Powód: zbyt łatwo rozmywa timingi epok i napięcie; wymaga precyzyjnego balansu.

- Forma + Czas  
Powód: wymaga pamięci historii obiektów (liczniki wieku, inercja); ryzyko nieczytelności.

Odrzucone:
- Intencja + Cisza  
Powód: zbyt abstrakcyjne i mało czytelne w gameplayu.

- Forma + Cisza  
Powód: ryzyko “martwego świata” i blokad bez jasnego feedbacku.

## 8. Status dokumentu

Dokument kanoniczny (v1).
Obowiązuje od pierwszej implementacji meta.
Rozszerzenie systemu Wiązań wymaga osobnej decyzji projektowej.
