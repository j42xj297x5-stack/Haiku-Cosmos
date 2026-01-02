# Haiku Cosmos — TARGETS v2
## Targety, stany, triale i wydarzenia (adresy wpływu na świat)

Ten plik definiuje **kanoniczny katalog targetów**:
- stanów świata,
- adresów modyfikacji parametrów,
- triali i wydarzeń epokowych,
- rytuałów (stany w czasie).

Zasada:
- **Target ≠ karta**
- **Target = adres wpływu na świat**
- **Karta = nośnik decyzji**, który:
  - albo uruchamia target (klik),
  - albo zasila meta (brak kliknięcia).

Packi kart nie powinny dublować opisów targetów.
Packi kart odwołują się do targetów przez ID.

---

## 0. Taksonomia targetów

### TARGET_TYPE: STATE
Stan świata w czasie (np. pre-gwiazda, rytuał).

### TARGET_TYPE: ACTION
Jednorazowa akcja wywołana kartą (np. przerwanie stanu, stabilizacja).

### TARGET_TYPE: PARAM
Modyfikacja parametru systemowego (np. PRG radius, meteor spawn rate).

### TARGET_TYPE: TRIAL
Zdarzenie z oknem czasowym i wynikiem (sukces/porażka).

### TARGET_TYPE: EVENT
Wydarzenie epokowe (np. rój meteorów) — zawsze sygnalizowane.

---

## 1. Zasady ogólne

1) Target ma zawsze:
- ID (stabilne),
- typ (STATE/ACTION/PARAM/TRIAL/EVENT),
- trigger (kiedy może wejść),
- zakres (na co działa),
- czas trwania (jeśli dotyczy),
- warunki sukcesu/porażki (jeśli TRIAL),
- sygnał wizualny.

2) Targety nie zawierają szczegółów kart ani meta (DR/sDR/PDR).
To opisuje system kart i meta.

3) Targety są kanoniczne niezależnie od języka.
Tekst UI jest tłumaczony osobno.

---

# 2. Rytuały (STATE)

## RITUAL_RELEASE_SINGLE (R1)
**Typ:** STATE  
**Nazwa:** Rytuał „Puszczanie” (pojedynczy kolor)

### Intencja
Gracz wybiera puszczanie (odpuszczenie) jednego koloru jako decyzję rytualną.

### Trigger / start
- gracz aktywuje kartę rytuału lub target zostaje zaoferowany przez system kart,
- startuje timer stanu rytuału.

### Ukończenie
- rytuał kończy się po spełnieniu warunku (np. czas, sekwencja zdarzeń, brak eskalacji).

### Przerwanie
- rytuał przerywa zdarzenie krytyczne (np. kolaps), lub akcja gracza (jeśli istnieje).

### Efekt świata
- rytuał wpływa na zachowanie świata wobec wskazanego koloru (interpretacja w kartach/packach).

### Sygnał wizualny
- subtelny znacznik rytualny w świecie (aura/tonacja) bez dominowania UI.

---

## RITUAL_RELEASE_DUAL (R2)
**Typ:** STATE  
**Nazwa:** Rytuał „Puszczanie Złączone” (dual)

### Zasada nadrzędna
To rytuał łączący dwa kolory jako jeden proces.

### Warunek wejścia
- dostępny dopiero po spełnieniu warunku progresji (np. po R1 lub po sekwencji trafień).

### Okno decyzji
- krótkie okno na wybór pary kolorów.

### Efekt świata
- świat interpretuje parę jako jeden kanał rytualny.

### Slot rytuał
- rytuał zasila odpowiedni slot meta przez system kart (poza targetami).

---

## RITUAL_PDR (Przenikające Doświadczenie Rytuału)
**Typ:** STATE  
**Nazwa:** PDR — Przenikające Doświadczenie Rytuału

### Efekt globalny
- po odpowiedniej liczbie ukończeń rytuałów uruchamia się stan PDR,
- PDR jest globalnym „oddechem systemu”, który wpływa na kolejne decyzje.

---

# 3. Planety gazowe — warunki i cooldown (PARAM/STATE)

## PARAM_GAS_PLANET_DOMINANCE
**Typ:** PARAM  
**Cel:** Warunek jakościowy powstania planety gazowej

### Opis
Planeta gazowa może powstać tylko jeśli:
- **dominujący kolor ≥ 60%** (wartość bazowa).

### Zakres
- dotyczy tylko formowania planet gazowych.

### Uwagi
Próg może być modulowany kartami i meta, ale kanon bazowy jest tu.

---

## STATE_PLANET_COOLDOWN_ORBITERS
**Typ:** STATE  
**Cel:** Cooldown planet po narodzinach (blokada przechwytywania)

### Opis
Po utworzeniu planety (min. gazowej):
- planeta **nie może zbierać orbiterów** przez bazowo **20 sekund**.

### Zakres
- blokada dotyczy przechwytywania / dołączania orbiterów,
- nie zmienia renderu, tylko zachowanie.

### Sygnał wizualny
- subtelna „cisza” planety (np. uspokojony ring, brak efektów wciągania).

---

# 4. Gwiazdy — stan pre-gwiazdy i kontrola eskalacji (STATE/ACTION)

## STATE_PRESTAR
**Typ:** STATE  
**Nazwa:** Stan pre-gwiazdy (pulsacja / dojrzewanie)

### Trigger
- planeta spełnia warunki przejścia w gwiazdę (masa + dominacja),
- zamiast natychmiastowego kolapsu wchodzi w PRESTAR.

### Opis zachowania
- wolna pulsacja (spowolniona względem obecnej “przyśpieszającej”),
- jeśli nieprzerwany: następuje kolaps z efektem rotujących orbiterów do środka,
- w kolapsie znikają wszystkie orbitery (nie zostają planetoidy jako resztki).

### Przerwanie
- możliwe przez akcję/target przerwania (karty typu „Nie teraz”),
- przerwanie zwiększa przyszły próg (patrz: ACTION_PRESTAR_INTERRUPT).

---

## ACTION_PRESTAR_INTERRUPT
**Typ:** ACTION  
**Nazwa:** Przerwanie pre-gwiazdy

### Efekt
- natychmiastowe wyjście obiektu ze stanu PRESTAR.

### Konsekwencja systemowa
- jeśli PRESTAR przerwany:
  - próg zbieranych meteorów rośnie o **+30%** dla kolejnego PRESTAR w tym runie
    (wartość bazowa do dalszego balansu).

### Uwagi
Ta akcja nie “spełnia warunku” dla kolejnej pre-gwiazdy.
To jest przerwanie, nie cheat.

---

# 5. Epoka Gwiazd — LOD i priorytety interakcji (PARAM/EVENT)

## PARAM_STARS_EPOCH_CONTROL_PRIORITY
**Typ:** PARAM  
**Cel:** Priorytet sterowania w Epoce Gwiazd

### Opis
W Epoce Gwiazd:
- PRG działa najsilniej na planetoidy,
- meteory reagują minimalnie (LOD i szum).

Priorytet:
1) planetoidy
2) większe orbitery
3) meteory (minimalny wpływ)

---

## PARAM_METEOR_LOD_MODE
**Typ:** PARAM  
**Cel:** Tryb LOD meteorów w Epoce Gwiazd

### Opis
Meteory są mniej widoczne:
- kropki,
- przerywane smugi przy dużej prędkości.

Meteory nie znikają całkowicie.

---

## EVENT_METEOR_SWARM
**Typ:** EVENT  
**Nazwa:** Rój meteorów

### Zasada
Roje nie są domyślną reprezentacją meteorów.
Występują tylko jako wydarzenia.

### Opis
- nieregularna chmura meteorów z jednego sektora mapy,
- czasowe zagęszczenie i presja.

### Sygnał wizualny
- wyraźny znak, że to EVENT (żeby gracz wiedział, że to wyjątek).

---

# 6. Deszcze (EVENT)

## EVENT_COMET_SHOWER
**Typ:** EVENT  
**Nazwa:** Deszcz komet

### Opis
- komety lecą wąskim pasem z jednego sektora,
- częstotliwość: np. 1 co 1–3 sekundy (bazowo),
- wydarzenie jako narzędzie manipulacji światem.

---

## EVENT_METEOR_SHOWER
**Typ:** EVENT  
**Nazwa:** Deszcz meteorów

### Opis
- intensywny napływ meteorów (inny charakter niż komety),
- może być używany jako “próba kontroli” dla gracza.

---

# 7. PRG — adresy modyfikacji (PARAM)

Poniższe targety są adresami dla kart PRG (Pack 04).

## PARAM_PRG_RADIUS
**Typ:** PARAM  
**Opis:** promień pola reakcji gracza

## PARAM_PRG_POLARITY
**Typ:** PARAM  
**Opis:** znak reakcji (przyciąganie/odpychanie)

## PARAM_PRG_GLUE
**Typ:** PARAM  
**Opis:** lepkość trajektorii (skręt do kursora)

## PARAM_PRG_SPEED_RESPONSE
**Typ:** PARAM  
**Opis:** reakcja prędkościowa (zwalnianie/przyśpieszanie)

## EVENT_WORLD_CONDENSATION
**Typ:** EVENT  
**Opis:** czasowe odbicia od krawędzi (kondensacja świata)

## ACTION_OBJECT_STASIS
**Typ:** ACTION  
**Opis:** stabilizacja jednego obiektu w oknie (planeta/gwiazda)

## EVENT_EARLY_ROTATION
**Typ:** EVENT  
**Opis:** globalna rotacja obiektów (wysoki poziom)

---

# 8. TRIAL: Halo Trial (kometa → planeta gazowa)

## TRIAL_HALO_GAS_PLANET
**Typ:** TRIAL  
**Nazwa robocza:** Halo Trial

### Trigger
- kometa uderza w planetę / obiekt planetarny w odpowiednich warunkach.

### Feedback natychmiastowy
- pojawia się halo / sygnał triala.

### Okno czasowe
- trial trwa określony czas (np. 30–60 s bazowo).

### Warunek sukcesu
- planeta “przetrwa” trial bez wejścia w stan gwiazdy,
- zachowuje stabilność (interpretacja: brak przekroczenia progów eskalacji).

### Warunek porażki
- kolaps do gwiazdy lub utrata stabilności w oknie triala.

### Rezultat: SUKCES
- planeta przechodzi w stabilną planetę gazową (z uwzględnieniem cooldownu).

### Rezultat: PORAŻKA
- eskalacja zgodnie z prawami świata.

---

## 9. Uwagi implementacyjne (kontrakt)

- Targety są kanoniczne i stabilne.
- Karty odwołują się do targetów przez ID.
- Progi bazowe są tu zapisane jako prawda startowa:
  - dominacja gazowych ≥ 60%
  - cooldown planet 20 s
  - przerwanie pre-gwiazdy: +30% przyszłego progu (bazowo)

Balans tych wartości może być zmieniany kartami i meta, ale nie przez UI.
