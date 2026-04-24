> Status: LEGACY / HISTORYCZNY
> Źródło prawdy: NIE
> Powód przeniesienia: dokument historyczny po migracji do docs/current/.
> Aktualne źródło prawdy: docs/current/README.md oraz docs/current/maps/PROJECT_INDEX.md

# AGENTS.md — Haiku Cosmos (instrukcje dla Codex)

> Ten plik to **project-specific guidance** dla Codex.
> Cel: żeby każde zadanie Codex startowało od tych samych założeń.

---

## 0) Zasady pracy

1. **Najpierw zrozumienie, potem zmiany.**
   - Jeśli proszę o analizę → nie edytuj plików.
   - Jeśli proszę o patch → edytuj minimalnie.

2. **Minimalne diffs.**
   - Unikaj „przemeblowania” bez potrzeby.
   - Preferuj małe, izolowane commity.

3. **Nie psuj feelingu UI.**
   - UI ma pozostać minimalistyczne.
   - Karty pojawiają się i znikają (bez stałego HUD).

4. **Mechanika świata jest rdzeniem.**
   - Parametry świata traktuj jak API (`World.*`).
   - Karty/rytuały/wiązania mają być deklaratywne.

---

## 1) Kontekst gry (skrót)

- Kosmos nie jest pudełkiem: odbicia od ścian są wyjątkiem (test / karta / epoka).
- Punkty = rezonans (kolizje tego samego koloru), nie waluta.
- Epoki = warstwa czasu (czas + progi; hybryda).
- Karty = impulsy: użycie (pamięć użycia) vs brak kliknięcia (kolekcja).
- Rytuały = odroczone efekty (przetrwanie/sekwencje/warunki).
- Meta = Haiku Card (zapis historii runu).
- Wiązania = tożsamość „bohatera” (Forma/Intencja/Czas/Cisza).

---

## 2) Jak raportować wynik

Zawsze zwracaj:
- **co zmieniłeś** (lista)
- **dlaczego** (1–2 zdania na punkt)
- **jak przetestować** (krótka instrukcja)

Jeśli zadanie dotyczy bugfix:
- opisz repro
- wskaż root-cause
- dodaj minimalny test/manual checklist

---

## 3) Bezpieczne punkty zaczepu w kodzie

Preferowane miejsca do zmian:
- `update(dt)` (global) — multipliery parametrów `World.*`
- `resolveMeteorCollisionsSafe()` — punkty / trigger kart
- `updateSpawner()` / `Comets.CONFIG.spawn` — tempo i eventy
- docelowo `onEpochChange(from,to)` — profile epok

---

## 4) Styl kodu

- JavaScript bez zbędnych frameworków.
- Komentarze krótkie, po polsku (jak w pliku).
- Nazwy funkcji w stylu istniejącego kodu.

---

## 5) Co jest poza zakresem (na razie)

- Pełny system gwiazd (jeszcze nie ma).
- Rozbudowany UI talii / deckbuilder (nie chcemy).
- „Duże refaktory” bez uzasadnienia.

