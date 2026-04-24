> Status: DO AKTUALIZACJI
> Obszar: techniczne / tracker wdrożenia
> Źródło prawdy: NIE
> Ostatnia aktualizacja: 2026-04-24
> Powiązane dokumenty: WORLD_FUNCTION_MAP.md, ../maps/DEPENDENCY_MAP.md, ../../audits/chronological/2026-04-24_remaining_docs_cleanup.md

# Haiku Cosmos — Tracker wdrożeń (Mapa Funkcji vs Kod)

Stan na: aktualny build po META + R1  
Źródła: pełny audyt `*.codex.js` (obie paczki)

---

## Legenda statusów

- [x] WDROŻONE — działa w kodzie
- [ ] DO WDROŻENIA — decyzja projektowa, brak w kodzie
- [~] CZĘŚCIOWO — działa, ale niekompletnie
- [!] BLOKER — uniemożliwia dalsze etapy

---

## 1. RUN / LOOP

- [x] Init → Update → Render → Reset
- [x] Pauza świata przez `World.paused`
- [x] Reset przez `resetWorld()`

---

## 2. SUB-META

- [x] Otwarcie po `PLANET_CREATED`
- [x] UI SUB-META
- [~] META jako system:
  - [ ] punktacja
  - [ ] zapis decyzji
  - [ ] wpływ na kolejny RUN

Status: **UI gotowe, system nie**

---

## 3. R1 / Trial

- [x] Trial harmoniczny
- [x] Kolekcja karty
- [x] Runtime effect karty
- [ ] Integracja z SUB-META (punkty / slot)

---

## 4. PRG

- [x] PRG przez `World.pointer*`
- [x] Modyfikatory kart
- [ ] Odwrócenie znaku
- [ ] PRG zależne od epoki

---

## 5. Meteory

- [x] Spawn globalny
- [x] Kolizje harmoniczne
- [x] Fallback → asteroida

---

## 6. Asteroidy

- [x] Powstawanie z kolizji
- [x] Orbity
- [x] Kolaps → planeta

---

## 7. Planety

- [x] Planety skaliste
- [x] Planety gazowe
- [x] PreStar
- [ ] Znacznik życia jako jawny stan

---

## 8. Komety

### Obecny stan
- [x] Spawn komet
- [x] Kometa → meteor (fragmentacja)
- [x] Kometa → asteroida → planeta skalista
- [x] Ringi wizualne

### Nowa fizyka (PLAN)
- [ ] Rozróżnienie: wolny meteor vs orbiter
- [ ] Kometa → orbiter planety → ring
- [ ] Kometa → planeta skalista → life marker
- [ ] Kometa → planeta gazowa → -30% masy/orbiterów
- [ ] Cooldown orbitera (60s)
- [ ] Eventy `COMET_IMPACT_*`

Status: **duży blok prac**

---

## 9. Epoki

- [x] Epoka gwiazd
- [ ] Epoka planetarna jako paradygmat
  - [ ] reguła orbitowania
  - [ ] zmiana percepcji / kamery

---

## 10. Dokumentacja

- [x] MAP_FUNCTIONS_WORLD_vNEXT.md
- [ ] TARGETS_SYSTEM.md (czeka na komety + epokę planetarną)
- [ ] EPOCHS_SYSTEM.md (czeka na epokę planetarną)
- [ ] META scoring doc

---

## 11. BLOKERY

- [!] Brak punktacji w SUB-META
- [!] Brak epoki planetarnej
- [!] Brak nowej fizyki komet

---

## 12. Kolejność wdrażania (propozycja)

1. Komety (bez META)
2. Epoka planetarna
3. Punktacja SUB-META
4. Integracja R1 → META
5. Aktualizacja TARGETS_SYSTEM.md
6. Aktualizacja EPOCHS_SYSTEM.md
