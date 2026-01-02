# Haiku Cosmos — Meta: System Wiązań (Bindings) v1

Ten dokument definiuje system Wiązań (Bindings) jako trzecią,
najwyższą warstwę meta w Haiku Cosmos.

Wiązania umożliwiają sprzężenie dwóch gałęzi meta
w celu budowania stylu gry i „bohatera”
bez klas, perków i stałych buildów.

## 1. Architektura meta

System meta Haiku Cosmos składa się z trzech poziomów.

### Poziom 1 — Sloty meta (fundament)
- Forma  
- Intencja  
- Czas  
- Cisza  

### Poziom 2 — Ekspansja
- meta-modyfikator pojedynczego slotu  
- rozszerza zasięg działania efektu w czasie i skali  
- nie działa samodzielnie  

### Poziom 3 — Wiązania (Bindings)
- sprzęgają dwa różne sloty  
- zmieniają interpretację efektów  
- nie wprowadzają nowych efektów runtime  

Schemat:

Slot → Ekspansja → Wiązanie

## 2. Definicja Wiązania

Wiązanie to reguła współdziałania dwóch slotów meta.

Wiązanie:
- nie jest osobnym slotem  
- nie jest kartą  
- nie działa bez kart lub zdarzeń  
- nie zwiększa mocy liczbowej efektów  

Wiązanie określa relację:
„Gdy działa A, to B reaguje inaczej”.

## 3. Aktywacja Wiązań

Wiązania:
- nie są dostępne na starcie gry  
- nie są wybierane z menu  
- nie są stałymi perkami  

Aktywują się przez meta-doświadczenie, na przykład:
- DR w dwóch różnych slotach  
- PDR w jednym slocie i DR w drugim  
- określoną sekwencję kart lub zdarzeń  

Wiązanie może być:
- aktywne tylko w danym runie  
- odblokowane na przyszłość, ale nie zawsze włączone  

## 4. Wiązania kanoniczne v1

W wersji v1 systemu dostępne są dokładnie dwa Wiązania.
Jest to świadome ograniczenie projektowe.

### 4.1 Wiązanie: Czas + Cisza

Nazwa robocza: Ścieżka Wycofania  
Styl gry: kontemplacyjny, defensywny  

Charakter:
- świat reaguje na brak zdarzeń  
- cisza wpływa na tempo przyszłych wydarzeń  
- eskalacja jest hamowana przez nie-działanie  

Przykłady interpretacji:
- karta „Nie teraz” wpływa na przyszłe timingi pre-gwiazd  
- „Cisza kolapsu” wydłuża cooldowny w kolejnych epokach  
- brak kliknięcia karty zmienia tempo ofert kart  

Rola:
- stabilizacja świata  
- kontrola eskalacji  
- wydłużenie faz kontemplacyjnych  

### 4.2 Wiązanie: Forma + Intencja

Nazwa robocza: Ścieżka Kształtowania  
Styl gry: architekt, alchemik struktur  

Charakter:
- decyzje wpływają trwale na strukturę świata  
- intencja nie tylko uruchamia efekt, ale zmienia naturę obiektów  

Przykłady interpretacji:
- dominujący kolor wpływa na zachowanie planety, nie tylko gwiazdy  
- rytuał Puszczania modyfikuje sposób przechwytu struktur  
- „Stabilna orbita” zmienia długofalowe zachowanie planet  

Rola:
- świadome kształtowanie kosmosu  
- czytelna przyczynowość decyzji  
- świat „pamięta dlaczego coś się wydarzyło”  

## 5. Relacja Wiązań do Ekspansji

Ekspansja działa wewnątrz jednego slotu.  
Wiązanie działa pomiędzy dwoma slotami.

Ekspansja:
- określa, jak daleko w czasie i skali działa efekt  

Wiązanie:
- określa, jak różne aspekty świata reagują na ten efekt  

Oba systemy:
- mogą działać jednocześnie  
- nie są od siebie zależne  
- nie nadpisują się wzajemnie  

## 6. Zasada projektowa

Jedna karta oznacza jeden efekt runtime.  
Ekspansja wpływa na przyszłość tego efektu.  
Wiązanie definiuje relację pomiędzy aspektami świata.

Każda nowa karta:
- nie musi wspierać Wiązań  
- musi być neutralna, jeśli Wiązanie nie jest aktywne  

## 7. Status dokumentu

Dokument kanoniczny (v1).  
Obowiązuje od pierwszej implementacji meta.  
Rozszerzenie systemu Wiązań wymaga osobnej decyzji projektowej.
