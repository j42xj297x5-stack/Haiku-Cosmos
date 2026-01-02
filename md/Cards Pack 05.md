# Haiku Cosmos — Cards Pack 05
## Planety Gazowe: Warunki i Stabilizacja

Pack kart regulujących **powstawanie planet gazowych**,
ich stabilność oraz tempo eskalacji świata.
Celem packa jest:
- ograniczenie nagłej ekspansji do gwiazd,
- wprowadzenie fazy „dojrzewania” planety,
- zwiększenie czytelności decyzji gracza.

---

## Zasady bazowe (wprowadzane przez pack)

1. Planeta gazowa może powstać tylko, jeśli:
   - jeden kolor meteorów ≥ 60% udziału jakościowego

2. Po powstaniu planety gazowej:
   - obowiązuje cooldown zbierania orbiterów (domyślnie 20 s)
   - planeta nie może przechwytywać nowych obiektów

Karty poniżej:
- modyfikują te warunki,
- pozwalają je opóźniać, wzmacniać lub omijać,
- zasilają meta po zebraniu.

---

## CARD_GAS_DOMINANT_COLOR
### Dominujący Skład

**Efekt (runtime):**
- planeta gazowa może powstać tylko,
  jeśli dominujący kolor ≥ 60%

**Charakter:**
- dodatkowy warunek jakościowy
- zwiększa przewidywalność świata

**Meta (Ekspansja – Intencja):**
- DR: próg obniżony do 55%
- sDR: próg zależny od epoki
- PDR: reguła – pierwszy gazowy obiekt w runie ignoruje próg

---

## CARD_GAS_COOLDOWN
### Okres Chłodzenia

**Efekt (runtime):**
- po utworzeniu planety gazowej:
  - brak zbierania orbiterów przez 20 s

**Charakter:**
- bufor bezpieczeństwa
- zapobiega natychmiastowemu kolapsowi do gwiazdy

**Meta (Ekspansja – Czas):**
- DR: skrócenie cooldownu
- sDR: cooldown zależny od masy planety
- PDR: reguła – pierwsza planeta zawsze ma wydłużony cooldown

---

## CARD_GAS_STABILIZATION
### Stabilizacja Atmosfery

**Efekt (runtime):**
- w czasie cooldownu:
  - planeta odpycha meteory
  - brak przyrostu masy

**Zastosowanie:**
- ochrona nowo powstałej planety
- kontrola eskalacji

**Meta (Ekspansja – Forma / Czas):**
- DR: krótszy cooldown
- sDR: większy zasięg odpychania
- PDR: reguła – stabilizacja aktywuje się automatycznie przy pierwszej planecie

---

## CARD_GAS_DELAY_COLLAPSE
### Odłożony Kolaps

**Efekt (runtime):**
- po zakończeniu cooldownu:
  - planeta zbiera orbiterów wolniej

**Charakter:**
- wydłużenie fazy planetarnej
- więcej czasu na decyzje

**Meta (Ekspansja – Czas):**
- DR: dłuższy efekt spowolnienia
- sDR: zależność od epoki
- PDR: reguła – spowolnienie działa tylko dla dominującego koloru

---

## CARD_GAS_ABORT_FORMATION
### Nie Teraz (Planetarne)

**Efekt (runtime):**
- przerywa proces formowania planety gazowej
- zebrane meteory zostają rozproszone

**Zastosowanie:**
- cofnięcie błędnej decyzji
- przygotowanie lepszego układu jakościowego

**Meta (Ekspansja – Cisza / Czas):**
- DR: krótszy cooldown użycia
- sDR: częściowe zachowanie struktury
- PDR: reguła – szansa samoistnego przerwania formowania

---

## CARD_GAS_LOCK_COMPOSITION
### Zamknięty Skład

**Efekt (runtime):**
- w czasie cooldownu:
  - planeta reaguje tylko na dominujący kolor
  - inne kolory są ignorowane

**Charakter:**
- czysta kontrola jakości
- precyzyjne kształtowanie świata

**Meta (Ekspansja – Forma + Intencja):**
- DR: dłuższy czas zamknięcia
- sDR: większa tolerancja jakościowa
- PDR: reguła – pierwszy skład w runie zawsze zamknięty

---

## Status Packa

Pack koncepcyjny.
Zapewnia:
- analogię do kart gwiazdowych,
- kontrolę eskalacji,
- wyraźną fazę planetarną,
- zgodność z meta (Sloty, Ekspansja, Wiązania).

Gotowy do:
- implementacji w jednym patchu Codexa,
- testów balansu planet → gwiazda,
- dalszego rozszerzania (np. planety skaliste).
