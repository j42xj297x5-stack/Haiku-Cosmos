# Haiku Cosmos - Font System Spec

> Status: ROBOCZY / DO WDROZENIA
> Obszar: typografia UI, karty, SUB-META, przygotowanie pod i18n
> Zrodlo prawdy: TAK roboczo dla decyzji typograficznych; NIE dla finalnego loadera fontow
> Ostatnia aktualizacja: 2026-04-28
> Powiazane dokumenty: ../systems/I18N_SYSTEM.md, ../ui/UI_WORLD.md, ../visual/ART_DIRECTION.md, ../technical/CARD_VISUAL_ARCHITECTURE.md

## 1. Cel systemu fontow

System fontow ma zapewnic:

- czytelnosc na mobile i desktop;
- poprawna obsluge polskich znakow jako domyslnego jezyka projektu;
- bezpieczny foundation pod przyszle i18n (pl -> en -> kolejne locale);
- spojnosc miedzy HUD, SUB-META, META, przyciskami i tekstami kart;
- spokojny charakter zgodny z "rytualnym minimalizmem kosmicznym".

Ten krok nie dodaje plikow fontow do repo i nie wdraza runtime loadera fontow.

## 2. Rejestry typografii

System rozroznia nastepujace rejestry:

1. UI/body font
   - glowny tekst interfejsu, przyciski, etykiety HUD/SUB-META.
2. Display/ceremonial font
   - naglowki paneli, tytuly sekcji, akcenty ceremonialne (bez malych labeli).
3. Numeric/counter text
   - RP, liczniki, wartosci debug/telemetrii; priorytetem jest czytelnosc cyfr.
4. Card title
   - tytuly kart, czytelne i zwarte.
5. Card haiku / poetic text
   - spokojniejszy rejestr i oddech typograficzny, nadal czytelny.
6. Debug text
   - techniczne logi/overlaye, preferowany rejestr mono.

## 3. Rekomendowane rodziny i stacki

### 3.1 UI / body (rekomendacja)

Kandydat bazowy: **Noto Sans** (preferowany) lub **Inter**.

Powody:

- dobra czytelnosc w malych rozmiarach;
- obsluga polskich znakow;
- szerokie wsparcie jezykowe dla kolejnych locale;
- neutralny, nienachalny charakter.

Token bazowy:

```css
font-family: "Noto Sans", "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### 3.2 Display / ceremonial (opcjonalny)

Kandydat akcentowy: **Cinzel** (lub podobny spokojny serif).

Uzycie:

- panel titles;
- naglowki ceremonialne;
- wybrane akcenty wysokiego poziomu.

Nie uzywac do drobnych labeli i tekstow operacyjnych.

Token display:

```css
font-family: "Cinzel", "Noto Serif", Georgia, serif;
```

### 3.3 Monospace / debug

Token debug/mono:

```css
font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
```

## 4. Zasady typograficzne

1. Nie mnozyc rodzin bez potrzeby (maks. UI + display + mono).
2. Display font tylko dla naglowkow i akcentow, nie dla malych labeli.
3. Utrzymac wysoka czytelnosc na smartfonach i mniejszych viewportach.
4. Teksty UI przeznaczone do tlumaczen nie moga byc obrazkami.
5. Button labels docelowo powinny pochodzic z i18n keys, nie z hardcodu.
6. Tytuly kart i tresc haiku powinny miec odrebny rejestr, ale wspolna spojnosc.
7. Debug text ma byc funkcjonalny, nie ceremonialny.

## 5. Future i18n i kierunek jezykowy

Zgodnie z `I18N_SYSTEM.md`:

- `pl` pozostaje jezykiem domyslnym;
- `en` jest pierwszym alternatywnym locale;
- kolejne jezyki maja wejsc bez lamania layoutu i bez awarii UI;
- fallback jezykowy musi utrzymac czytelnosc nawet przy brakach tlumaczen.

Notatka wdrozeniowa:

- w tym kroku nie wdrazamy loadera i18n;
- nie przenosimy masowo tekstow do locale files;
- nie zmieniamy polskiego jako jezyka glownego;
- nie blokujemy UI brakiem tlumaczen.

## 6. Zakres tego passu

W zakresie:

- dokumentacja font systemu;
- bezpieczne tokeny CSS (`--hc-font-ui`, `--hc-font-display`, `--hc-font-mono`);
- przygotowanie pod przyszly rozdzial visual/mechanika i i18n.

Poza zakresem:

- download/import fontow do repo;
- dodawanie `.ttf`, `.otf`, `.woff`, `.woff2`;
- runtime WebFont loader;
- decyzja o hostingu fontow (local vs remote) - osobny pass decyzyjny.
