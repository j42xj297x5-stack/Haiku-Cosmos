# Haiku Cosmos — DEPENDENCY_MAP

> Status: KANON
> Obszar: mapa zależności projektu
> Źródło prawdy: TAK, dla relacji między dokumentami/systemami
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: PROJECT_INDEX.md, ../README.md, ../../../AGENTS.md

## 1. Cel dokumentu

`DEPENDENCY_MAP.md` jest szybką mapą roboczą zależności między:
- systemami gry,
- dokumentami kanonicznymi i kierunkowymi,
- orientacyjnymi obszarami runtime.

Dokument **nie zastępuje** specyfikacji źródłowych (`systems/`, `ui/`, `visual/`).
Ma pomóc dobrać właściwe konteksty przed zmianami w kodzie lub dokumentacji.

## 2. Zasada czytania (kolejność)

1. `README.md` (root),
2. `docs/README.md`,
3. `docs/current/README.md`,
4. `docs/current/maps/PROJECT_INDEX.md`,
5. `docs/current/maps/DEPENDENCY_MAP.md` (ten plik) przy zadaniach systemowych,
6. właściwe dokumenty systemowe/UI/visual dla konkretnego zadania.

## 3. Mapa głównych systemów

### 3.1. Karty / R-track

**Dokumenty:**
- `docs/current/systems/CARDS_SYSTEM.md` — **KANON**
- `docs/current/systems/ECONOMY_SYSTEM.md` — **KANON**
- `docs/current/ui/UI_WORLD.md` — **KANON**
- `tests/cards_sequence_three_hit_manual_checklist.md` — checklista manualna
- `tests/cards_sequence_rtrack_takeover_smoke.test.js` — smoke test takeover/fail

**Kod runtime (orientacyjnie):**
- `cards.js` (silnik sekwencji, hit1/hit2/hit3, fail, takeover)
- `hc.collisions.js` (wejście hitów kolizji do CardEngine)
- `hc.debug.js` (snapshot/eventy debug sekwencji)
- `hc.ui_debug.js` (overlay debug sekwencji)

**Zależności:**
- Karty definiują przebieg sekwencji i generowanie kart.
- Ekonomia rozlicza RP oraz koszty powiązane z decyzjami kart.
- UI komunikuje stan sekwencji (kierunek, progres, fail/takeover).
- Debug musi odzwierciedlać prawdę runtime.

**Kontrakt R-track (skrót):**
- krok atomowy = **3 trafienia**,
- `hit1` blokuje kierunek, `hit2` otwiera krok, `hit3` zamyka krok,
- obcy kolor **nie przepada**,
- fail na głębszych etapach rozlicza się automatycznie,
- to samo trafienie obcego koloru staje się `hit1` nowej sekwencji.

**Nie ruszaj bez czytania:** `CARDS_SYSTEM.md` + `ECONOMY_SYSTEM.md` + `UI_WORLD.md` + audyty R-track + checklisty testowe.

### 3.2. Ekonomia RP

**Dokumenty:**
- `docs/current/systems/ECONOMY_SYSTEM.md` — **KANON**
- `docs/current/systems/CARDS_SYSTEM.md` — **KANON**
- `docs/current/ui/UI_WORLD.md` — **KANON**

**Kod runtime (orientacyjnie):**
- `cards.js` (naliczanie RP i konsekwencje sekwencji)
- `hc.debug.js` / `hc.ui_debug.js` (podgląd ekonomii i kart w debug overlay)

**Ostrzeżenie:** nie zmieniaj RP/kosztów bez jednoczesnej weryfikacji CARDS + UI.

### 3.3. SUB META

**Dokumenty:**
- `docs/current/systems/SUB_META_SYSTEM.md` — **KANON**
- `docs/current/systems/CARDS_SYSTEM.md` — **KANON**
- `docs/current/systems/ECONOMY_SYSTEM.md` — **KANON**
- `docs/current/ui/UI_WORLD.md` — **KANON**

**Kod runtime (orientacyjnie):**
- `cards.js` (powiązanie kart i stanów silnika)
- `hc.world.js` (warstwa świata i stan globalny)

**Ostrzeżenie:** SUB META definiuje strukturę i relacje; nie definiuje kosztów RP ani procentów.

### 3.4. PRG

**Dokumenty:**
- `docs/current/systems/PRG_SYSTEM.md` — **DO AKTUALIZACJI**
- `docs/current/systems/SUB_META_SYSTEM.md` — **KANON**
- `docs/current/ui/UI_WORLD.md` — **KANON**
- `docs/current/visual/ART_DIRECTION.md` — **KIERUNEK**
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md` — **KIERUNEK**

**Kod runtime (orientacyjnie):**
- `hc.view_input.js` (wejście gracza)
- `hc.meteors.js` (wpływ parametrów CardEngine na sterowanie)
- `hc.render.js` (wizualizacja ringa/parametrów PRG)

**Ostrzeżenie:** PRG to mechanika wpływu gracza na świat, nie kamera i nie globalna fizyka.

### 3.5. UI / HUD / Overlay

**Dokumenty:**
- `docs/current/ui/UI_WORLD.md` — **KANON**
- `docs/current/systems/CARDS_SYSTEM.md` — **KANON**
- `docs/current/systems/ECONOMY_SYSTEM.md` — **KANON**
- `docs/current/visual/README.md` — **KIERUNEK**

**Kod runtime (orientacyjnie):**
- `hc.ui_debug.js` (runtime debug overlay)
- `hc.debug.js` (eventy/snapshot do overlayów)
- `cards.js` (panel kart i sygnały sekwencji)
- `hc.render.js` (warstwa HUD/canvas render)

**Ostrzeżenie:** UI pokazuje prawdę runtime; UI nie definiuje własnej mechaniki.

### 3.6. Oprawa wizualna

**Dokumenty:**
- `docs/current/visual/README.md` — **KIERUNEK**
- `docs/current/visual/ART_DIRECTION.md` — **KIERUNEK**
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md` — **KIERUNEK**
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md` — **KIERUNEK**

**Zależności:** UI, PRG, karty i świat muszą utrzymywać wspólny język wizualny.

**Ostrzeżenie:** nie projektować agresywnego neonu, plastikowego sci-fi ani stylu typowego deckbuildera.

### 3.7. Język / i18n

**Dokumenty:**
- `docs/current/systems/I18N_SYSTEM.md` — **DO AKTUALIZACJI**
- `docs/current/ui/UI_WORLD.md` — **KANON**

**Kod runtime (orientacyjnie):**
- `hc.ui_debug.js` (słowniki tekstów overlay i klucze UI)

**Ostrzeżenie:** projekt startuje po polsku; angielski to pierwsza alternatywa.

### 3.8. Roadmapa

**Dokumenty:**
- `docs/current/systems/ROADMAP.md` — **ROBOCZY**

**Zależności:**
- Roadmapa nie nadpisuje kanonu.
- Pomysły z roadmapy wymagają osobnej specyfikacji przed implementacją.

## 4. Mapa dokumentów według statusu

### KANON
- `docs/current/maps/PROJECT_INDEX.md`
- `docs/current/maps/DEPENDENCY_MAP.md`
- `docs/current/systems/CARDS_SYSTEM.md`
- `docs/current/systems/ECONOMY_SYSTEM.md`
- `docs/current/systems/SUB_META_SYSTEM.md`
- `docs/current/ui/UI_WORLD.md`

### KIERUNEK
- `docs/current/visual/README.md`
- `docs/current/visual/ART_DIRECTION.md`
- `docs/current/visual/KOSMOLOGIA_WIZUALNA.md`
- `docs/current/visual/BIBLIOTEKA_MATERIALOW.md`

### ROBOCZY
- `docs/current/systems/ROADMAP.md`

### DO AKTUALIZACJI
- `docs/current/systems/PRG_SYSTEM.md`
- `docs/current/systems/I18N_SYSTEM.md`

## 5. Mapa według typów zadań Codexa

### Zmiana sekwencji kart
Czytaj:
- `CARDS_SYSTEM.md`
- `ECONOMY_SYSTEM.md`
- `UI_WORLD.md`
- `DEPENDENCY_MAP.md`
- audyty R-track
- `tests/cards_sequence_three_hit_manual_checklist.md`

### Zmiana RP / nagród
Czytaj:
- `ECONOMY_SYSTEM.md`
- `CARDS_SYSTEM.md`
- `UI_WORLD.md`

### Zmiana HUD / overlay
Czytaj:
- `UI_WORLD.md`
- `CARDS_SYSTEM.md`
- `visual/README.md`
- audyt eventy/HUD R-track

### Zmiana PRG
Czytaj:
- `PRG_SYSTEM.md`
- `SUB_META_SYSTEM.md`
- `UI_WORLD.md`
- `visual/README.md`

### Zmiana oprawy wizualnej
Czytaj:
- `visual/README.md`
- `ART_DIRECTION.md`
- `KOSMOLOGIA_WIZUALNA.md`
- `BIBLIOTEKA_MATERIALOW.md`
- `UI_WORLD.md` (jeśli dotyczy UI)

### Zmiana języków
Czytaj:
- `I18N_SYSTEM.md`
- `UI_WORLD.md`
- `CARDS_SYSTEM.md` (jeśli dotyczy kart)

### Zmiana roadmapy
Czytaj:
- `ROADMAP.md`
- `PROJECT_INDEX.md`
- odpowiednie dokumenty systemowe

## 6. Ostrzeżenia projektowe

- Nie zmieniaj mechaniki sekwencji bez: CARDS + ECONOMY + UI + testy.
- Nie zmieniaj kosztów RP bez: ECONOMY + CARDS.
- Nie projektuj UI bez: UI_WORLD + visual.
- Nie projektuj PRG bez: PRG + SUB_META + visual.
- Nie traktuj ROADMAP jako kanonu.
- Nie czytaj `docs/legacy/` jako źródła prawdy bez wyraźnego polecenia.
- Nie zostawiaj aktywnych duplikatów dokumentacji.

## 7. Evidence / audyty decyzyjne

- Fundament docs/logs: `docs/audits/chronological/2026-04-24_docs_logs_foundation.md`
- Migracja current (krok 1): `docs/audits/chronological/2026-04-24_docs_current_migration_step_1.md`
- Migracja visual: **brak / nie utworzono w tamtym kroku**
- 3-hit contract: `docs/audits/chronological/2026-04-24_sequence_three_hit_contract_audit.md`
- R-track direction takeover: `docs/audits/chronological/2026-04-24_sequence_rtrack_direction_takeover_audit.md`
- R-track events/HUD: `docs/audits/chronological/2026-04-24_rtrack_events_hud_audit.md`

## 8. Zasady aktualizacji DEPENDENCY_MAP.md

Aktualizujemy mapę, gdy:
- zmienia się zależność między systemami,
- dokument zmienia status,
- dochodzi nowy system,
- zmienia się główny plik kodu odpowiedzialny za system,
- zmienia się kontrakt runtime ↔ dokumentacja.

Nie trzeba aktualizować mapy przy drobnych poprawkach stylistycznych.
