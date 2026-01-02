# Haiku Cosmos — System Językowy (i18n)
## Założenia, cele i zasady wdrożenia

Dokument opisuje koncepcję i zasady wdrożenia
wielojęzyczności w projekcie Haiku Cosmos.

System językowy jest projektowany:
- wcześnie (przed utrwaleniem tekstów w UI),
- minimalistycznie,
- bez naruszania poetyckiego charakteru kart,
- z myślą o dalszej współpracy z Codexem.

---

## 1. Cel systemu językowego

Celem systemu i18n jest:
- umożliwienie wyświetlania interfejsu w wielu językach,
- zachowanie pełnej kontroli nad treścią poetycką kart,
- oddzielenie logiki gry od treści językowej,
- przygotowanie projektu na przyszłą internacjonalizację.

Projekt startuje w języku **polskim**.
Język **angielski** jest pierwszą alternatywą.

---

## 2. Zakres tłumaczeń

### 2.1 Interfejs użytkownika (UI)

Tłumaczeniu podlega **wszystko, co jest tekstem systemowym**, m.in.:

- nazwy slotów meta:
  - Forma
  - Czas
  - Intencja
  - Cisza
- etykiety przycisków
- nagłówki ekranów
- komunikaty stanu (np. „Zablokowane”, „Brak celu”)
- krótkie podpowiedzi i hinty

Teksty UI:
- są stabilne semantycznie,
- nadają się do kluczy słownikowych,
- muszą być łatwe do globalnej edycji.

---

### 2.2 Karty (treść)

Treść kart dzieli się na dwa typy:

1. **Tekst systemowy karty**
   - tytuł
   - opis funkcjonalny (jeśli występuje)

2. **Treść poetycka (haiku)**

Dla kart przyjęta zostaje **strategia A**:
> każda karta może zawierać treści w wielu językach
> bez wymuszania tłumaczenia 1:1.

---

## 3. Strategia językowa — wariant A

### 3.1 Locales w kartach

Karty mogą zawierać opcjonalne pole `locales`,
które przechowuje wersje językowe tytułu i haiku.

Przykład koncepcyjny:

```json
"locales": {
  "pl": {
    "title": "Szerokie Pole",
    "haiku": ["...", "...", "..."]
  },
  "en": {
    "title": "Wide Field",
    "haiku": ["...", "...", "..."]
  }
}
