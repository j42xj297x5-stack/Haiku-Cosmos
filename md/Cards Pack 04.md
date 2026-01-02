# Haiku Cosmos — Cards Pack 04
## Pole Reakcji Gracza (PRG)

Pack kart modyfikujących **Pole Reakcji Gracza (PRG)**,
czyli sposób, w jaki świat fizycznie reaguje na kursor.

Karty PRG:
- są czasowe,
- silnie zmieniają charakter interakcji,
- po zebraniu zasilają meta (Ekspansja),
- wzmacniają styl gry, nie automatyzują rozgrywki.

---

## CARD_PRG_WIDE_FIELD
### Szerokie Pole

**Efekt (runtime):**
- zwiększa promień PRG o +X%
- ułatwia przechwytywanie meteorów

**Czas trwania:** krótki / średni

**Zastosowanie:**
- kontrola chaosu
- łagodzenie wysokiego spawnu

**Meta (Ekspansja – Czas):**
- DR: większy startowy promień PRG w kolejnym runie
- sDR: wolniejszy spadek promienia przy wysokim m/s
- PDR: reguła – zwiększony promień tylko dla dominującego koloru

---

## CARD_PRG_NARROW_FIELD
### Wąskie Pole

**Efekt (runtime):**
- zmniejsza promień PRG
- zwiększa precyzję kolizji

**Czas trwania:** krótki

**Zastosowanie:**
- świadome ryzyko
- precyzyjne łączenie kolorów

**Meta (Ekspansja – Czas):**
- DR: mniejszy, ale stabilniejszy promień PRG
- sDR: bonus precyzji przy wysokiej prędkości
- PDR: reguła – wąskie pole wzmacnia efekt glue

---

## CARD_PRG_ACCELERATE
### Katalizator Ruchu

**Efekt (runtime):**
- meteory przyśpieszają w obszarze PRG
- brak spowolnienia przy przechwycie

**Czas trwania:** krótki

**Zastosowanie:**
- agresywny styl gry
- szybkie kolizje i eskalacja

**Meta (Ekspansja – Czas):**
- DR: krótszy cooldown efektu
- sDR: przyśpieszenie zależne od epoki
- PDR: reguła – przyśpieszenie aktywne tylko powyżej określonego m/s

---

## CARD_PRG_GLUE_BOOST
### Lepkość Trajektorii

**Efekt (runtime):**
- zwiększa „glue”
- meteory silniej skręcają w stronę kursora

**Czas trwania:** średni

**Zastosowanie:**
- precyzja przy wysokim spawnie
- kontrola chaosu bez zmiany prędkości

**Meta (Ekspansja – Forma):**
- DR: bazowy glue lekko zwiększony
- sDR: glue rośnie wraz z prędkością świata
- PDR: reguła – glue działa tylko dla wybranego koloru

---

## CARD_PRG_REPULSE
### Odpychanie

**Efekt (runtime):**
- PRG odpycha obiekty zamiast przyciągać

**Czas trwania:** krótki

**Zastosowanie:**
- ochrona planet
- przerywanie kolapsów
- defensywne reagowanie

**Meta (Ekspansja – Cisza / Czas):**
- DR: krótszy cooldown
- sDR: większy zasięg odpychania
- PDR: reguła – szansa na samoistne odpychanie w krytycznych momentach

---

## CARD_PRG_CONDENSATION
### Kondensacja Świata

**Efekt (runtime):**
- włącza odbicia od krawędzi ekranu
- obiekty nie mogą opuścić obszaru gry

**Czas trwania:** krótki / rytualny

**Zastosowanie:**
- zagęszczenie
- wymuszenie kolizji
- presja decyzyjna

**Meta (Ekspansja – Czas):**
- DR: dłuższy czas kondensacji
- sDR: kondensacja tylko dla wybranych obiektów
- PDR: reguła – kondensacja aktywna przy określonych zdarzeniach

---

## CARD_PRG_STASIS_OBJECT
### Stabilizacja Obiektu

**Efekt (runtime):**
- zatrzymuje jeden obiekt w oknie gry:
  - planetę lub gwiazdę
- mniejsze obiekty ignorowane

**Czas trwania:** średni

**Zastosowanie:**
- ochrona kluczowych struktur
- stabilizacja świata

**Meta (Ekspansja – Forma / Czas):**
- DR: dłuższy czas stabilizacji
- sDR: możliwość stabilizacji większych obiektów
- PDR: reguła – pierwsza planeta w runie stabilizowana automatycznie

---

## CARD_PRG_EARLY_ROTATION
### Wczesna Rotacja

**Efekt (runtime):**
- globalna rotacja obiektów wokół wspólnego środka
- efekt znany z zachowania świata przy czarnej dziurze

**Czas trwania:** krótki, intensywny

**Zastosowanie:**
- rytuał wysokiego poziomu
- chaos kontrolowany

**Meta (Ekspansja – Forma):**
- DR: mniejsza amplituda rotacji
- sDR: dłuższy czas efektu
- PDR: reguła – rotacja aktywuje się w określonych epokach

---

## Status Packa

Pack koncepcyjny.
Gotowy do:
- implementacji w jednym patchu Codexa
- testów balansu PRG
- integracji z Ekspansją i Wiązaniami
