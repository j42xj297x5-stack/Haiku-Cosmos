# Haiku Cosmos — CODEX_START.md
## Kanoniczna instrukcja pracy dla Codexa

Ten dokument jest **jedyną instrukcją** opisującą:
- jak Codex ma pracować z repozytorium,
- które pliki są źródłem prawdy,
- jak wygląda workflow gałęzi.

Jeśli inne pliki lub komentarze sugerują coś innego — **ten dokument ma pierwszeństwo**.

---

## 1. Zasada nadrzędna: ŹRÓDŁO PRAWDY

### Źródłem prawdy projektu są WYŁĄCZNIE pliki:

- `*.codex.js`
- `*.codex.html`
- dokumentacja `*.md`

Projekt **uruchamiany jest wyłącznie** na plikach `*.codex.js`.

Pliki bez sufiksu `.codex` (np. `game.js`) mogą:
- istnieć historycznie,
- być archiwum,
- być pozostałością po starym monolicie,

ale **NIE SĄ częścią workflow** i **NIE SĄ edytowane ani synchronizowane**.

Codex:
- **nie edytuje**
- **nie generuje**
- **nie synchronizuje**

plików bez `.codex`.

---

## 2. Runtime

- Runtime ładuje tylko `index.codex.html`.
- `index.codex.html` ładuje wyłącznie pliki `*.codex.js`.
- Nie utrzymujemy żadnego mirrora runtime (`*.js`).

Jeśli w repo istnieją inne pliki JS:
- są ignorowane przez Codexa,
- nie biorą udziału w uruchamianiu gry.

---

## 3. Zakres odpowiedzialności Codexa

Codex może:
- modyfikować logikę gry w `*.codex.js`,
- dodawać nowe moduły `hc.*.codex.js`,
- zmieniać CardEngine (`cards.codex.js`),
- aktualizować dokumentację `.md`.

Codex NIE MOŻE:
- refaktorować struktury repo bez wyraźnego polecenia,
- przenosić plików kanonicznych do `old_*`,
- dotykać legacy JS,
- zmieniać loadera bez uzgodnienia.

---

## 4. Styl zmian (ważne)

- Preferujemy **dopisywanie logiki przez stabilne punkty integracji**:
  - CardEngine (targety, efekty, rytuały),
  - parametry `World`,
  - EventBus (`Events.emit / Events.on`).

- Unikamy:
  - rozbijania pętli `update()` bez potrzeby,
  - „sprytnych” skrótów,
  - ukrytej logiki w renderze.

Logika → update / systemy  
Render → wizualizacja  
UI → percepcja, nie mechanika

---

## 5. Workflow gałęzi (branching)

### Gałąź kanoniczna
- `codex/stable`  
  Jedyny branch uznawany za **aktualny stan prawdy**.

### Gałęzie robocze
Każde zadanie Codexa powstaje z `codex/stable` jako **osobna gałąź**, np.:

- `codex/feat-prestar`
- `codex/feat-i18n-ui`
- `codex/fix-camera`
- `codex/refactor-prg`

Gałęzie robocze:
- mogą być porzucane,
- mogą być usuwane,
- nie muszą być idealne.

### Wprowadzanie zmian
Jeśli zmiany działają:
- wykonujemy **merge do `codex/stable`**.

Nie kopiujemy plików ręcznie.  
Nie nadpisujemy historii.

---

## 6. Testowanie

- Testowanie jest manualne (uruchomienie w przeglądarce).
- Wystarczy potwierdzenie:
  - brak crashy,
  - mechanika działa zgodnie z dokumentacją.

Nie wymagamy testów automatycznych.

---

## 7. Dokumentacja jako kontrakt

Pliki `.md` są **kontraktem projektowym**.

Zmiana dokumentacji oznacza:
- zmianę prawdy projektu,
- zgodę na dostosowanie kodu.

Kod może się zmieniać często.  
Dokumentacja — tylko świadomie.

---

## 8. Status dokumentu

Plik kanoniczny.  
Zmienia się tylko przy zmianie zasad workflow lub struktury projektu.
