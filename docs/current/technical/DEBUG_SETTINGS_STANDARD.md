# DEBUG_SETTINGS_STANDARD

> Status: ROBOCZY / STANDARD TECHNICZNY DEBUG SETTINGS
> Obszar: runtime/debug/settings
> Źródło prawdy: TAK, dla ładowania, importu i exportu ustawień debug/layout
> Ostatnia aktualizacja: 2026-06-17
> Powiązane dokumenty: ../README.md, ../maps/PROJECT_INDEX.md, ../maps/DEPENDENCY_MAP.md, ./README.md, ../ui/SUB_META_RUNTIME_SNAPSHOT.md

## Cel

Ten dokument definiuje wspólny standard dla ustawień debug/layout/UI, które projektant lub użytkownik może stroić poza kodem i potem wgrać do repozytorium.

## Standard plików `public/settings/*.json`

1. Edytowalne ustawienia debug/layout/UI mają swoje domyślne źródło w `public/settings/*.json`.
2. Kod może mieć bezpieczny fallback na wypadek braku pliku lub błędnego JSON, ale fallback nie jest źródłem prawdy do strojenia.
3. Nazwy plików mają być neutralne i opisowe, np. `submeta-png-layout.json`, `submeta-placeholders.json`, `submeta-placeholders-panels.json`, `hud-top-layout.json`.
4. Pliki źródłowe ustawień nie powinny mieć w nazwie słowa `export`, bo export jest akcją debug UI, a nie rolą pliku źródłowego.
5. JSON nie może być minifikowany; powinien pozostać czytelny i stabilny dla ręcznej edycji oraz review w diffie.

## Standard ładowania runtime

1. Runtime ładuje ustawienia przez logiczne ścieżki `settings/*.json`, które wskazują na fizyczne pliki `public/settings/*.json`.
2. URL musi być rozwiązywany przez `HC.publicPath` / `HC.publicAssetPath`, aby działać lokalnie, w Vite i na GitHub Pages.
3. Nie wolno hardcodować `/Haiku-Cosmos/` w loaderach ustawień.
4. Loader powinien raportować co najmniej: `logicalPath`, `resolvedUrl`, `status` i `fallbackUsed`.
5. Jeżeli plik nie istnieje, fetch się nie powiedzie albo JSON jest niepoprawny, runtime używa fallbacku z kodu i loguje ten fakt.

## Standard mini panelu debug

1. Panel debug, który zmienia ustawienia layout/UI, powinien mieć import i export w tym samym mini panelu.
2. `Export JSON` powinien wpisywać aktualny stan do textarea lub równoważnego pola w panelu.
3. `Import JSON` powinien czytać JSON z tego samego pola i aplikować go do bieżącego runtime.
4. Nie należy dodawać osobnych, przypadkowych mechanizmów exportu poza mini panelem dla tego samego ustawienia.
5. `Reset defaults` powinien wracać do ustawień z `public/settings/*.json`, a dopiero awaryjnie do fallbacku w kodzie.

## Aktualne pliki ustawień objęte standardem

| Obszar | Plik źródłowy | Runtime logical path | Panel debug |
| --- | --- | --- | --- |
| SUB-META PNG layout | `public/settings/submeta-png-layout.json` | `settings/submeta-png-layout.json` | SUB-META PNG Layout |
| SUB-META placeholders | `public/settings/submeta-placeholders.json` | `settings/submeta-placeholders.json` | SUB-META Placeholders |
| SUB-META panels | `public/settings/submeta-placeholders-panels.json` | `settings/submeta-placeholders-panels.json` | SUB-META Panels |
| HUD TOP layout | `public/settings/hud-top-layout.json` | `settings/hud-top-layout.json` | HUD Top Layout |

## Zasada dla nowych paneli

Nowe panele debug zmieniające layout, placeholdery, pozycje elementów UI lub inne ręcznie strojone ustawienia powinny od początku używać tego wzorca: plik w `public/settings/*.json`, loader przez `publicPath`, import/export w mini panelu i fallback w kodzie.
