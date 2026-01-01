# Haiku Cosmos — Meta: System Ekspansji

Dokument opisuje system Ekspansji jako meta-modyfikatora slotów.
Ekspansja nie jest osobnym slotem ani kartą runtime.

---

## 1. Definicja

Ekspansja to meta-warstwa, która:
- powstaje przez kolekcjonowanie kart
- modyfikuje zachowanie kart w slotach meta
- działa wyłącznie w połączeniu z aktywną kartą lub zdarzeniem

---

## 2. Relacja do slotów

Sloty bazowe:
- Forma
- Intencja
- Czas
- Cisza

Ekspansja:
- nie tworzy nowego slotu
- jest przypisana do jednego z powyższych
- najczęściej modyfikuje slot Czas

---

## 3. Poziomy Ekspansji

- DR — lokalna trwałość efektu
- sDR — systemowe rozszerzenie
- PDR — zmiana reguły slotu

---

## 4. Wzorce działania

Ekspansja może:
- wydłużać przyszłe stany
- wpływać na kolejne epoki
- wprowadzać pasywne szanse zdarzeń
- zmieniać warunki progowe

Ekspansja nie:
- zwiększa bezpośrednio mocy liczbowej
- nie działa bez karty lub zdarzenia

---

## 5. Przykłady przypisań

- Spawn meteorów → Czas (Ekspansja)
- Zapłon gwiazdy → Czas
- Przerwanie zapłonu → Cisza → Czas
- Cisza kolapsu → Cisza + Czas

---

## 6. Zasada projektowa

Jedna karta = jeden efekt runtime  
Ekspansja = wpływ na przyszłość tego efektu

---

## 7. Status

Dokument kanoniczny.
Każda nowa karta wpływająca na skalę lub tempo
musi określić relację z Ekspansją.
