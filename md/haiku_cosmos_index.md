# Haiku Cosmos — Dokumentacja Projektu (INDEX)

Ten plik zbiera i porządkuje **wszystkie ustalenia z bieżącej konwersacji** oraz wskazuje **kanoniczne pliki `.md`**, które razem opisują pełny system gry *Haiku Cosmos*.

> Zasada: **mechanika świata jest stabilna**, a wszystko co rośnie (karty, rytuały, wiązania, meta) rośnie **deklaratywnie**.

---

## Struktura dokumentacji (kanon)

Poniższe pliki stanowią komplet i są ze sobą spójne:

1. **README.md**  
   Wizja projektu, decyzje wysokiego poziomu, Archive Point.

2. **MECHANICS_WORLD.md**  
   Reguły świata i fizyka gameplayu.
   - meteory (bez „pudełka”, odbicia tylko jako wyjątek)
   - planetoidy (dryf, elipsy)
   - fragmenty → pierścienie
   - punkty z kolizji tego samego koloru
   - parametry świata jako API pod karty

3. **UI_WORLD.md**  
   UI jako **mechanika percepcji**.
   - kamera jako część gameplayu
   - zoom-out przy zmianie epoki
   - brak HUD-u, brak liczników
   - karty jako impulsy (pojawiają się i znikają)

4. **CARDS_SYSTEM.md**  
   System kart jako decyzje, nauka i pamięć.
   - karty efemeryczne
   - użycie vs kolekcja
   - brak talii
   - **Rytuały** (przetrwanie, sekwencje, warunki)

5. **EPOCHS_SYSTEM.md**  
   Epoki jako **warstwa czasu**.
   - czasowe i progowe (hybryda)
   - profile epok
   - epoka = zmiana perspektywy i praw świata

6. **META_SAVE_HAIKU.md**  
   Meta-hub i ciągłość gracza.
   - „Nowy świat” / „Załaduj Haiku Card”
   - Haiku Card jako zapis historii runu
   - powrót po dniu / miesiącu bez zaczynania od zera

7. **HAIKU_EDITOR.md**  
   Edytor kart / haiku (klucz do rozwoju contentu).
   - format karty (deklaratywny)
   - `effects[]`
   - `ritual{}`
   - tagi zamiast komplikacji
   - wersjonowanie schematu

8. **BINDINGS_SYSTEM.md**  
   System Wiązań (tożsamość „bohatera”).
   - sloty: Forma / Intencja / Czas / Cisza
   - rytuał wiązania po runie
   - konflikty pojęciowe zamiast balansu liczbami

---

## Najważniejsze decyzje projektowe (esencja)

- **Kosmos nie jest pudełkiem** — obiekty przelatują, nie odbijają się domyślnie.
- **Punkty = rezonans**, nie waluta.
- **Karty są pytaniami**, nie przyciskami.
- **UI pokazuje, nie tłumaczy**.
- **Epoki zmieniają perspektywę**, nie resetują świata.
- **Rytuały nagradzają trwanie**, nie refleks.
- **Bohater = pamięć decyzji**, nie postać.

---

## Kontrakt techniczny (stabilny rdzeń)

- Parametry świata są zdefiniowane w jednym miejscu (np. `PARAMS_WORLD.json`).
- Karty opisują **co** się zmienia, nie **jak**.
- Rytuały i wiązania są warstwami danych nad tym samym silnikiem.
- Payload (Haiku Card) **może ewoluować**, format kart musi być wersjonowany.

---

## Status

Ten INDEX jest punktem odniesienia.
Każda nowa mechanika powinna:
- wskazać, **który plik `.md` rozszerza**,
- nie łamać istniejących kontraktów.

> Jeśli ten plik jest spójny — projekt jest spójny.

