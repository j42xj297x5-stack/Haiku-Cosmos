# Haiku Cosmos
## Index dokumentacji i kanon projektu

Haiku Cosmos to kontemplacyjna gra-system,
w której kosmos jest procesem,
a decyzje gracza mają charakter rytualny, nie optymalizacyjny.

Ten plik jest **główną mapą dokumentacji** oraz
**jedynym miejscem definiującym kanon projektu**.

---

## 🔒 KANON DOKUMENTACJI (SOURCE OF TRUTH)

Poniższe pliki stanowią **obowiązującą prawdę projektu**.
Jeśli w repo istnieją pliki o podobnych nazwach,
kopie historyczne lub wersje `old_*` — **nie są kanoniczne**.

### 📌 Pliki kanoniczne

1. **haiku_cosmos_index.md**  
   Ten plik. Punkt wejścia i mapa dokumentacji.

2. **DEPENDENCY_MAP.md**  
   Mapa zależności:
   Świat ↔ Epoki ↔ Karty ↔ Meta ↔ UI.

3. **TARGETS_SYSTEM.md**  
   Kanoniczny katalog targetów:
   - stany świata
   - akcje
   - parametry
   - triale
   - wydarzenia epokowe  
   *(Target = adres wpływu na świat, nie karta)*

4. **CARDS_SYSTEM.md**  
   System kart:
   - karta jako decyzja runtime
   - karta jako impuls meta
   - packi kart
   - relacja kart do meta

5. **BINDINGS_SYSTEM.md**  
   System Wiązań v1:
   - sloty: Forma / Intencja / Czas / Cisza
   - dokładnie 2 wiązania kanoniczne
   - brak duplikatów pojęciowych

6. **EPOCHS_SYSTEM.md**  
   System Epok:
   - skala świata
   - zmiana sterowania i percepcji
   - Epoka Gwiazd jako zmiana paradygmatu

7. **UI_WORLD.md**  
   Interfejs jako warstwa percepcji:
   - World UI
   - Cards UI
   - Meta UI
   - wizualizacja postępu
   - i18n UI

8. **I18N_SYSTEM.md**  
   System językowy:
   - słownik UI
   - fallback
   - wariant A dla kart (locales)

9. **STARS_EPOCH_LOD_AND_CONTROL.md**  
   Specyfikacja Epoki Gwiazd:
   - LOD meteorów
   - priorytety PRG
   - planetoidy jako główny uchwyt
   - roje jako wydarzenia

---

## 📂 Konwencja repozytorium

- `old_*` / `archive/`  
  → pliki historyczne, niekanoniczne

- `exp/*`  
  → eksperymenty i proof-of-concept

- pliki bez prefiksów  
  → obowiązujący kanon

---

## 🧭 Filozofia projektu (skrót)

- Gra nie nagradza optymalizacji.
- Gra nagradza **uważność i decyzję**.
- Karty są impulsami, nie perkami.
- Meta jest pamięcią decyzji, nie drzewkiem statystyk.
- Epoki zmieniają **skalę percepcji**, nie prawa świata.
- UI nie tłumaczy — UI pokazuje.

---

## 🧩 Jak czytać dokumentację

Jeśli:
- projektujesz nową kartę → **CARDS_SYSTEM.md**
- projektujesz nowy target / stan → **TARGETS_SYSTEM.md**
- zmieniasz skalę lub feeling epoki → **EPOCHS_SYSTEM.md**
- dotykasz progresji meta → **BINDINGS_SYSTEM.md**
- zastanawiasz się „co na co wpływa” → **DEPENDENCY_MAP.md**
- projektujesz UI → **UI_WORLD.md**
- dotykasz języków → **I18N_SYSTEM.md**

---

## ⚙️ Relacja z Codexem

- Dokumenty kanoniczne są kontraktem projektowym.
- Codex implementuje zgodnie z dokumentami.
- Zmiana dokumentów = zmiana prawdy projektu.
- Kod może się zmieniać często, dokumentacja rzadko.

---

## 📌 Status

Plik kanoniczny.
Zmiany tylko przy zmianie modelu systemu,
nie przy pojedynczych pomysłach.
