# SUB-META Design Memory Audit (2026-04-30)

## 1. EXECUTIVE SUMMARY
- Dokumentacja ma wyraźny podział na: **KANON systemowy** (`systems/`, `ui/UI_WORLD.md`), **KIERUNEK visual** (`docs/current/visual/*`) oraz **EVIDENCE Figma/frame-kit** (`SUB_META_FIGMA_*`, manifesty, preview).
- Projektowanie SUB-META można kontynuować, ale obecna pamięć robocza bywa przeciążona przez równoległe źródła (wireframe v2, layout tokens v0.7, evidence v0.2/v0.3).
- Największe ryzyko: traktowanie dokumentów evidence jako źródła finalnego stylu/assetów runtime.

## 2. MUST HAVE — PROJECT MEMORY PACK
| Plik | Status | Po co potrzebny | Jak często ładować | Uwagi |
|---|---|---|---|---|
| `docs/current/maps/PROJECT_INDEX.md` | KANON | punkt wejścia i statusy dokumentów | zawsze na start | rozdziela kanon/kierunek/evidence |
| `docs/current/maps/DEPENDENCY_MAP.md` | KANON | relacje system↔UI↔visual↔runtime | zawsze na start | kluczowy przy zadaniach cross-area |
| `docs/current/systems/SUB_META_SYSTEM.md` | KANON | definicja SUB-META, role R1/R2/R3/R4, PRG/ŚWIAT | zawsze dla SUB-META | źródło modelu systemowego |
| `docs/current/systems/CARDS_SYSTEM.md` | KANON | reguły kart i sekwencji (granice mechaniki) | zawsze dla designu kart/sub-meta | zapobiega zmianie mechaniki przez visual |
| `docs/current/systems/PRG_SYSTEM.md` | KANON strukturalny | semantyka PRG i relacje do RUN | zawsze przy osi PRG | „do strojenia”, ale nadal bazowy |
| `docs/current/systems/ECONOMY_SYSTEM.md` | KANON | granice ekonomii RP i kosztów | przy decyzjach o slotach/kuźni/magazynie | nie mieszać z visual |
| `docs/current/ui/UI_WORLD.md` | KANON | rola SUB-META/HUD/META w UI | zawsze | spina system i prezentację |
| `docs/legacy/ui/SUB_META_V2_WIREFRAME_SPEC.md` | LEGACY / history evidence | historyczny model layoutu v2 (kompozycja); nie jest current source-of-truth | kontekst migracji / audit | finalny entrypoint: `docs/current/ui/SUB_META_V2_MASTER_SPEC.md` |
| `docs/current/ui/SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` | ROBOCZY kontrakt | anchor/rect handoff, stable IDs | każda sesja implementacyjno-layoutowa | kontrakt techniczny layoutu |
| `docs/current/ui/SUB_META_V2_LAYOUT_TOKENS.md` | ROBOCZY kontrakt | tokens v0.7, normalized centers/sizes/connectors | każda sesja token/layout | podstawowe dane do spójności |
| `docs/current/visual/README.md` | KIERUNEK | mapa visual i statusy | zawsze przy visual | filtruje co jest evidence |
| `docs/current/visual/ART_DIRECTION.md` | KIERUNEK | ritual minimalism / ton wizualny | zawsze przy projektowaniu | nadrzędny kierunek estetyczny |
| `docs/current/visual/KOSMOLOGIA_WIZUALNA.md` | KIERUNEK | pięć stanów i semantyka kosmologii | zawsze przy symbolice | unika przypadkowych motywów |
| `docs/current/visual/BIBLIOTEKA_MATERIALOW.md` | KIERUNEK | materiały, kolor, faktury | zawsze przy stylu | baza palety i materiałów |
| `docs/current/visual/MODULAR_FRAME_KIT.md` | KIERUNEK | zasady slotów/mostów/gniazd/frame parts | zawsze przy frame design | nie mylić z evidence v0.2/v0.3 |
| `docs/current/visual/FIGMA_WORKFLOW.md` | KIERUNEK workflow | granice Figma i kolejność pracy | zawsze przed Figmą | blokuje błędny „implement-first” flow |

## 3. SHOULD HAVE — SUPPORTING PACK
| Plik | Status | Po co | Kiedy czytać |
|---|---|---|---|
| `docs/current/visual/SVG_ASSET_STANDARDS.md` | ROBOCZY standard | nazewnictwo, anchors, warstwy, eksport | przy przygotowaniu export candidate |
| `docs/current/visual/SUB_META_COMPONENTS.md` | KIERUNEK | katalog komponentów SUB-META | przy komponowaniu bibliotek |
| `docs/current/visual/SUB_META_ASSET_PIPELINE.md` | KIERUNEK pipeline | flow active vs legacy/evidence | przy planowaniu passów |
| `assets/visual/preview/submeta_v2_wireframe/README.md` | ROBOCZY preview | szybki kontekst debug overlay/preview | przy ręcznym review layoutu |
| `assets/visual/README.md` | ROBOCZY assets map | status modular kit v0.1 i legacy | przy decyzjach o źródłach assetów |

## 4. EVIDENCE ONLY / HISTORY
| Plik | Dlaczego evidence | Czego nie brać jako kanon |
|---|---|---|
| `docs/current/visual/SUB_META_FIGMA_ASSET_PASS_01.md` | zapis przebiegu i ograniczeń passu | nie traktować jako final asset spec |
| `docs/current/visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md` | Figma-derived cleanup pass v0.2 | nie traktować jako produkcyjny manifest runtime |
| `docs/current/visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md` | Figma style-correction evidence v0.3 | nie traktować jako finalny styl obowiązujący |
| `docs/current/visual/MODULAR_FRAME_KIT_ASSET_MANIFEST.md` | manifest legacy/evidence | nie traktować jako aktywny standard |
| `assets/visual/legacy/style_correction_2026_04/` | archiwalny pass SVG | nie brać jako active source-of-truth |

## 5. DO NOT LOAD BY DEFAULT
| Obszar | Dlaczego | Ryzyko pomyłki |
|---|---|---|
| `docs/legacy/**` | zgodnie z mapami to nie-kanon | cofnięcie decyzji do przestarzałych założeń |
| `docs/audits/**` (poza bieżącym audytem) | dokumenty historyczne i punktowe | nadpisanie aktualnego kierunku przez stare wnioski |
| szczegółowe listy komponentów z `SUB_META_FIGMA_DERIVED_*` | to evidence przebiegu, nie final | traktowanie szkiców jako final assets |

## 6. CONFLICTS / DUPLICATES / CONFUSION POINTS
- **Konflikt statusowy w praktyce:** dokumenty `SUB_META_FIGMA_DERIVED_FRAME_KIT_V02/V03` są rozbudowane i „brzmią finalnie”, mimo statusu evidence.
- **Duplikacja orientacji:** część zasad visual powtarza się między `visual/README.md`, `MODULAR_FRAME_KIT.md`, `SUB_META_ASSET_PIPELINE.md` i `FIGMA_WORKFLOW.md` — bez jednego krótkiego handoffu łatwo o przeciążenie.
- **Mieszanie poziomów:** wireframe/layout token docs opisują strukturę panelu, ale mogą być mylone z final direction artystycznym.
- **Ryzyko terminologiczne:** „frame kit v0.1 exported”, „derived v0.2”, „style correction v0.3” — numeracja sugeruje liniowy upgrade, podczas gdy v0.2/v0.3 są evidence, a nie automatycznie „nowszy kanon”.

## 7. CURRENT SUB-META DESIGN TRUTH
- SUB-META to warstwa konfiguracji między systemem kart a UI/runtime; definiuje relacje PRG/ŚWIAT i role R1/R2/R3/R4/DS, nie definiuje mechaniki szczegółowej ani kosztów.
- Model UI v2 jest opisany kontraktowo przez wireframe + framecomposer handoff + layout tokens (composition v0.5, anchor/rect v0.6, token contract v0.7).
- Kierunek visual to ritual cosmic minimalism, pięć stanów kosmologii, spójne materiały/kolor i modularne myślenie o slotach-gniazdach-mostach.
- Figma/frame-kit v0.2/v0.3 są evidence i źródłem odniesienia, ale nie finalnym aktywnym assetem runtime.
- Czego nie robić: nie projektować na podstawie legacy/evidence jako kanonu, nie zmieniać mechaniki przez decyzje visual, nie traktować preview/wireframe jako final art.

## 8. RECOMMENDED NEXT ACTION
**Najlepszy kolejny krok: (a) zrobić krótki handoff doc „SUB_META_MEMORY_PACK.md”.**

Powinien zawierać:
1. 12–15 linków MUST HAVE,
2. 1 stronę „current truth” (system + UI + visual),
3. sekcję „Evidence boundaries” (v0.2/v0.3/legacy),
4. checklistę „before new Figma pass”.

To najmocniej ograniczy mieszanie źródeł w kolejnych iteracjach.

## 9. CHANGED FILES
- Added: `docs/audits/2026-04-30_submeta_design_memory_audit.md`.

## 10. TESTS / CHECKLISTA
- `git status --short` — sprawdzenie zakresu zmian.
- Audyt wykonany jako analiza dokumentacji; brak zmian runtime/mechaniki.
