# SUB-META V2 MASTER SPEC

> Status: ROBOCZY / MASTER SPEC UI-LAYOUT
> Obszar: SUB-META v2 / cockpit resonance layout / UI handoff
> Źródło prawdy:
> - TAK, jako roboczy nadrzędny dokument dla SUB-META v2 layout/design handoff,
> - NIE, dla kanonu mechaniki,
> - NIE, dla runtime implementation,
> - NIE, dla finalnych assetów visual.
> Ostatnia aktualizacja: 2026-06-12
> Powiązane dokumenty: `../systems/SUB_META_SYSTEM.md`, `UI_WORLD.md`, `../systems/PRG_SYSTEM.md`, `../systems/CARDS_SYSTEM.md`, `../visual/VISUAL_EXECUTION_GUIDE.md`, `../technical/FRAME_COMPOSER_SPEC.md`, `SUB_META_V2_LAYOUT_TOKENS.md`

> **Decyzja runtime 2026-06-12:** aktywnym source-of-truth implementacji jest `SUB_META_RUNTIME_SNAPSHOT.md` (PNG/CSS + `public/settings` + placeholdery + panele + SVG/PNG + debug Import/Export JSON). Ten master spec pozostaje aktywnym roboczym master specem UI/layout dla SUB-META v2, ale nie może nadpisywać snapshotu runtime.

## 1. Cel dokumentu

Ten dokument jest roboczym **master specem SUB-META v2**. Jego rolą jest zastąpienie potrzeby równoległego czytania wielu rozproszonych speców podczas prac layout/design handoff.

## 2. Granice odpowiedzialności

- `SUB_META_SYSTEM.md` definiuje sens i kanon systemowy SUB-META.
- `UI_WORLD.md` definiuje nadrzędny flow UI.
- Ten dokument definiuje roboczy układ, strefy, relacje i handoff layoutowy SUB-META v2.
- Dokumenty visual definiują styl, rodziny komponentów i pipeline assetów.
- Dokumenty technical definiują przyszłą implementację FrameComposer/runtime.

## 3. Current SUB-META v2 truth

- SUB-META jest warstwą konfiguracji, nie mechaniką RUN.
- Główne gałęzie konfiguracji: **PRG** i **ŚWIAT**.
- PRG jest po lewej stronie layoutu.
- ŚWIAT jest po prawej stronie layoutu.
- Resonance core jest centralnym rdzeniem układu.
- Inventory/forge/detail zajmują dolną strefę roboczą.
- DS nie jest centrum rdzenia; jest zasobem/slotem specjalnym w obszarze magazynu/zasobów.
- 9 stref jest semantyką relacji, nie tabelą wizualną 3×3.
- Layout ma mieć charakter organiczny, relacyjny i cockpit-resonance.

## 4. Architektura 9 stref

### 4.1 `top_left_status`
- Rola: status globalny, skrót kondycji i sygnałów systemowych.
- Priorytet: średni (czytelność stale dostępna).
- Zawartość: status labels, lightweight indicators.
- Relacja z systemami: wspiera kontekst kart i konfiguracji bez wchodzenia w mechanikę.
- Mobile/tablet note: kompresja treści i priorytet ikon.
- Visual/FrameComposer note: rama statyczna, brak dominacji nad rdzeniem.

### 4.2 `top_center_identity`
- Rola: tożsamość aktualnej konfiguracji/sub-meta profile.
- Priorytet: średni-wysoki.
- Zawartość: nazwa/seed konfiguracji, sygnatura resonansu.
- Relacja: czytelny punkt orientacyjny dla całego cockpitu.
- Mobile/tablet note: skrócona forma, zachowany anchor centralny.
- Visual/FrameComposer note: centralne osadzenie ornamentu osiowego.

### 4.3 `top_right_navigation`
- Rola: nawigacja i kontekstowe przełączniki.
- Priorytet: średni.
- Zawartość: wejścia do podwidoków/zakładek.
- Relacja: przejścia kontekstowe bez zmiany mechaniki.
- Mobile/tablet note: możliwe grupowanie w compact switcher.
- Visual/FrameComposer note: edge-mounted moduły, bez nachodzenia na core.

### 4.4 `middle_left_prg`
- Rola: skrzydło PRG (lewy filar konfiguracji).
- Priorytet: wysoki.
- Zawartość: osie PRG, sloty R1, bridge R2.
- Relacja: bezpośrednie mapowanie semantyki `PRG_SYSTEM.md`.
- Mobile/tablet note: ten sam model semantyczny, mniejszy gap.
- Visual/FrameComposer note: lewy cluster z własnymi anchorami.

### 4.5 `middle_center_resonance_core`
- Rola: rdzeń relacyjny i stabilizacja konfiguracji.
- Priorytet: krytyczny.
- Zawartość: centrum resonansu, warstwa relacji R2/R3/R4.
- Relacja: agreguje połączenia PRG ↔ WORLD.
- Mobile/tablet note: zachować centrum jako stały punkt osiowy.
- Visual/FrameComposer note: geometria osiowa, nie losowy ornament.

### 4.6 `middle_right_world`
- Rola: skrzydło ŚWIAT (prawy filar konfiguracji).
- Priorytet: wysoki.
- Zawartość: osie świata, sloty R1, bridge R2.
- Relacja: mapowanie na `SUB_META_SYSTEM.md` i `UI_WORLD.md`.
- Mobile/tablet note: kompresja odstępów przy zachowaniu kolejności osi.
- Visual/FrameComposer note: prawy cluster lustrzany semantycznie, nie 1:1 graficznie.

### 4.7 `bottom_left_inventory`
- Rola: bank kart/zasobów i punkt wejścia do operacji.
- Priorytet: wysoki.
- Zawartość: inventory, zasoby, sloty pomocnicze (w tym DS jako zasób specjalny).
- Relacja: styk z `CARDS_SYSTEM.md` i ekonomią bez zmiany zasad.
- Mobile/tablet note: możliwy tryb paginowany/stackowany.
- Visual/FrameComposer note: panel modułowy z czytelnymi frame parts.

### 4.8 `bottom_center_forge`
- Rola: mini-workspace transformacji kart.
- Priorytet: średni-wysoki.
- Zawartość: przepływ R1 → sDR1 → pDR1.
- Relacja: wizualna reprezentacja procesu zgodnego z cards/economy.
- Mobile/tablet note: compact workflow, bez zmiany logiki procesu.
- Visual/FrameComposer note: dedykowane anchor group dla mini-sekwencji.

### 4.9 `bottom_right_card_detail`
- Rola: czytnik szczegółów.
- Priorytet: wysoki dla decyzji gracza.
- Zawartość: duża karta, glif, metadata, haiku.
- Relacja: czytelnik treści kart (cards/i18n), bez redefinicji systemów.
- Mobile/tablet note: możliwy tryb overlay/detail drawer.
- Visual/FrameComposer note: stabilna bezpieczna strefa contentowa.

## 5. PRG wing

- 4 osie PRG pozostają podstawą lewego skrzydła.
- W osi występuje logika `R1 + ODB/alternatywa` zgodnie z roboczym stackiem v2 (layoutowo/roboczo, bez zmiany mechaniki PRG).
- Dostępne są 3 sloty R2 bridge dla relacji.
- Znaczenie osi i typów kart pozostaje zgodne z `PRG_SYSTEM.md`.
- Ograniczenie: ten dokument definiuje layout/config, nie runtime behavior.

## 6. WORLD wing

- 4 osie świata pozostają podstawą prawego skrzydła.
- Na oś przypada układ `2×R1 + EXT` jako wizualny model strefy (bez redefinicji mechaniki).
- Dostępne są 3 sloty R2 bridge.
- DS jest traktowany jako rozszerzenie/zasób specjalny poza centrum rdzenia.
- Relacje semantyczne pozostają zgodne z `SUB_META_SYSTEM.md` i `UI_WORLD.md`.

### 6A. Nota synchronizacyjna — DS i czteroelementowy slot

- Master spec musi uwzględnić czteroelementową strukturę slotu: karta R, stabilizator, karta specjalna, artefakt.
- DS jest interpretowany jako karta naprawcza zdobywana przez AAA.
- Karty specjalne i artefakty wymagają przyszłych placeholderów lub stref w slotach.
- Nie zmieniać layout tokens ani JSON na podstawie tej noty.
- Szczegóły robocze opisuje `../systems/SLOT_LOADOUT_AND_EON_MEMORY_SYSTEM.md`.


### 6B. Nota synchronizacyjna — visual/UI czteroelementowego slotu

- Czteroelementowy slot wymaga osobnego visual/UI passu.
- `SLOT_LOADOUT_VISUAL_UI_CHECKLIST.md` opisuje stany i czytelność przed layout tokens.
- Master spec nie powinien jeszcze przyjmować finalnego układu slotu bez decyzji visual.

### 6C. Nota synchronizacyjna — trwałość karty R / wariant C

- Dla trwałości karty R w przyszłych layout-tokenach należy uwzględnić zatwierdzony roboczo model wariantu C opisany w `CARD_DURABILITY_WIREFRAME_PASS.md`.
- Model oznacza hybrydę: pasek boczny po prawej krawędzi karty R oraz jakościową, progową degradację karty.
- Ta nota nie oznacza jeszcze finalnego layoutu całego czteroelementowego slotu.
- Ta nota nie zmienia runtime.

### 6D. Nota synchronizacyjna — scoped ID paska trwałości karty R

- Przyszłe layout tokens dla SUB-META powinny uwzględnić scoped ID `submeta.slot.card_r.durability_bar` jako roboczy identyfikator paska trwałości karty R.
- ID pochodzi z readiness opisanej w `CARD_DURABILITY_LAYOUT_TOKEN_READINESS.md`.
- Ta nota nie oznacza zmiany runtime ani finalnego layoutu slotu.

## 7. Resonance core

- Rdzeń jest centralnym punktem konfiguracji SUB-META v2.
- R4 reprezentuje jedność konfiguracji całego układu.
- R3 reprezentuje warstwę stabilizacji/rezerwacji.
- R2 bridges są relacyjnymi połączeniami między skrzydłami i rdzeniem.
- DS nie jest częścią centrum rdzenia.
- Visual note: geometria osiowa i funkcjonalna, nie ornament losowy/dekoracyjny.

## 8. Inventory / Forge / Detail

- Inventory działa jako bank kart i zasobów.
- Forge jest mini-workspace procesu R1 → sDR1 → pDR1 jako schemat UI workspace; koszty i reguły pozostają wg `CARDS_SYSTEM.md` i `ECONOMY_SYSTEM.md`.
- Detail działa jako reader: duża karta, glif, metadata, haiku.
- Relacje z economy/cards/i18n są zachowane, ale bez przepisywania tych systemów.

## 9. Layout contract

Zasady roboczego kontraktu layoutowego:

- center-based positioning,
- named anchors,
- root-normalized space,
- stable IDs,
- `layoutRect`,
- `interactiveRect`,
- `visualMountRect`,
- `visualBleedRect`,
- `contentSafeRect`.

Reguły warstw:

- connector layer jest oddzielony od card layer,
- connector layer nie może blokować `interactiveRect` kart,
- desktop/tablet są primary,
- mobile jest future compact/workspace model.

## 10. Minimum stable IDs / anchors

Minimalny zestaw stable IDs wymagany do spójnego handoffu:

- root: `submeta.root`.
- strefy główne: `submeta.prg`, `submeta.core`, `submeta.world`, `submeta.inventory`, `submeta.forge`, `submeta.detail`.
- PRG: `submeta.prg.axis.1..4`, `submeta.prg.r2.bridge.1..3`.
- WORLD: `submeta.world.axis.1..4`, `submeta.world.r2.bridge.1..3`.
- CORE: `submeta.core.r4`, `submeta.core.r3`, `submeta.core.r2.hub`.
- resource/DS: `submeta.inventory.ds_slot`.

### 10.1 Canonical aliasing / naming compatibility

Do czasu osobnego technical cleanupu kontraktów v0.6/v0.7, master spec traktuje poniższe warianty nazewnictwa jako **kompatybilne aliasy**:

| Canonical (master) | Compatible alias (v0.6/v0.7) | Note |
| --- | --- | --- |
| `submeta.prg` | `submeta.prg.wing` | node-level zone/wing alias |
| `submeta.world` | `submeta.world.wing` | node-level zone/wing alias |
| `submeta.prg.r2.bridge.*` | `submeta.prg.bridge.*` | v0.6 używa wariantu `r2.bridge.*`, v0.7 używa skrótu `bridge.*` |
| `submeta.world.r2.bridge.*` | `submeta.world.bridge.*` | v0.6 używa wariantu `r2.bridge.*`, v0.7 używa skrótu `bridge.*` |

Zasady poziomów ID:
- anchor-level IDs używają postfixu `.center`, gdy wskazują punkt montażu (np. `submeta.root.center`, `submeta.prg.axis.size.center`, `submeta.world.axis.form.center`, `submeta.core.r4.center`, `submeta.inventory.ds.row.center`).
- node-level IDs nie muszą mieć postfixu `.center`, gdy oznaczają byt/strefę (np. `submeta.root`, `submeta.prg.wing`, `submeta.world.wing`, `submeta.core`, `submeta.inventory`).

Reguła kompatybilności:
- jeśli dokumenty v0.6 i v0.7 używają wariantów nazw, master spec traktuje je jako aliasy kompatybilności do czasu technicznego cleanupu,
- nowe prace powinny preferować naming wskazany w master spec albo w późniejszym active technical contract,
- aliasing nie zmienia mechaniki ani runtime behavior.

Pełne listy i mapowania anchorów pozostają w dokumentach token/contract do czasu późniejszego cleanupu legacy/appendix.

## 11. Layout tokens / normalized data

Aktualny model tokenów roboczych: v0.7.

Kontrakt danych:

- root = `1.0 × 1.0` (root-normalized space),
- każdy element: `center(x,y)` + `size(w,h)`,
- recty pochodne liczone z center/size,
- elementy grupowane semantycznie (zones, wings, bridges, utility),
- connectors jako osobna grupa danych/warstwa.

Minimum groups (v0.7 skrót operacyjny):
1. PRG axis group — 4 osie (`R1 + ODB`),
2. PRG bridge group — `3×R2`,
3. WORLD axis group — 4 osie (`R1 + R1 + EXT`),
4. WORLD bridge group — `3×R2`,
5. CORE group — `R4 center` + `R3 left/right` + `R2 relation zone`,
6. INVENTORY group — bank kart + DS,
7. FORGE group — `R1 → sDR1 → pDR1`,
8. DETAIL group — card preview + glyph + metadata + haiku.

Pełny schema tokenów/grup/relacji pozostaje w `SUB_META_V2_LAYOUT_TOKENS.md` do czasu decyzji appendix/legacy.

Przykład (skrót):

```json
{
  "id": "submeta.core",
  "center": { "x": 0.5, "y": 0.5 },
  "size": { "w": 0.18, "h": 0.22 },
  "layoutRect": "derived",
  "interactiveRect": "derived",
  "visualMountRect": "derived",
  "visualBleedRect": "derived",
  "contentSafeRect": "derived"
}
```

## 12. Connectors

- Typy: semantic, decorative, debug.
- Stany: active / inactive / available / blocked (stany prezentacji/layout review, nie runtime logic).
- Główna relacja przepływu: PRG ↔ core ↔ WORLD.
- Minimum relacji connectorów:
  - PRG axis ↔ PRG bridge,
  - WORLD axis ↔ WORLD bridge,
  - PRG bridge ↔ resonance core,
  - WORLD bridge ↔ resonance core,
  - core R4/R3 relation zone ↔ active bridge state,
  - inventory/DS ↔ world/resource context,
  - forge ↔ selected card/resource context,
  - detail ↔ selected card/context.
- Connector layer musi być oddzielony od card layer.
- Semantic i decorative connectors domyślnie muszą mieć `avoidsInteractiveRects=true`.
- Connectory wspierają czytelność relacji, nie zastępują semantyki kart.
- Debug connectors mogą istnieć wyłącznie jako review/debug layer, nie jako final visual.

## 13. Responsywność

- Desktop wide jest primary layout.
- Tablet to compressed wariant tego samego modelu semantycznego.
- Mobile jest future pass (compact/workspace selector), nie primary target tej specyfikacji.
- Karty nie mogą być deformowane przez stretching.
- Adaptacja powinna iść przez kompresję gapów/marginesów, nie deformację kart.

## 14. Visual handoff

Ten master spec definiuje **gdzie** i **po co** są elementy layoutu.

Sposób projektowania assetów i stylu definiują:

- `../visual/VISUAL_EXECUTION_GUIDE.md`,
- `../visual/MODULAR_FRAME_KIT.md`,
- `../visual/SUB_META_ASSET_PIPELINE.md`,
- `../visual/SVG_ASSET_STANDARDS.md`.

## 15. FrameComposer handoff

Powiązane kontrakty techniczne:

- `../technical/FRAME_COMPOSER_SPEC.md`,
- `../technical/CENTER_BASED_POSITIONING_SPEC.md`,
- `SUB_META_V2_FRAMECOMPOSER_CONTRACT.md`.

Granice:

- ten dokument nie implementuje FrameComposer,
- runtime integration jest osobnym krokiem,
- master spec dostarcza strukturę i kontrakt layoutowy do przyszłej integracji.

## 16. Evidence boundaries

Po tym kroku poniższe dokumenty są traktowane jako input history/evidence/appendix i kandydaci do dalszego porządkowania po review:

- `SUB_META_V2_LAYOUT_SPEC.md`,
- `SUB_META_V2_WIREFRAME_SPEC.md`,
- `SUB_META_V2_LAYOUT_TOKENS.md`,
- `SUB_META_V2_FRAMECOMPOSER_CONTRACT.md`,
- `SUB_META_MEMORY_PACK.md`,
- `../technical/SUB_META_LAYOUT_ANCHOR_AUDIT.md`,
- `../technical/SUB_META_V2_BOX_AUDIT.md`.

Uwaga porządkowa:
- `SUB_META_V2_LAYOUT_TOKENS.md` i `SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` pozostają ważnymi technical/appendix candidates do czasu osobnego cleanupu kontraktu FrameComposer.
- Nie należy przenosić ich do `legacy` bez decyzji projektanta albo osobnego patcha.

## 17. Anti-patterns

- Traktowanie 9 stref jak literalnej tabeli 3×3.
- Umieszczanie DS jako centrum rdzenia.
- Mieszanie layout spec z mechaniką kart.
- Traktowanie wireframe preview jako finalnego stylu.
- Projektowanie monolitycznego overlayu zamiast modularnych części.
- Mieszanie visual evidence z runtime contract.

## 18. Checklist dla przyszłego design pass

- [ ] Czy układ respektuje PRG left / WORLD right / core center?
- [ ] Czy DS jest poza centrum rdzenia?
- [ ] Czy inventory/forge/detail są czytelne?
- [ ] Czy rozdział rect (`layout`/`interactive`/`mount`/`bleed`/`safe`) jest zachowany?
- [ ] Czy connector layer nie blokuje interakcji?
- [ ] Czy stable IDs są zachowane?
- [ ] Czy visual assety mogą być montowane przez anchors?
- [ ] Czy design nie wygląda jak tabela 3×3?
- [ ] Czy nie zmieniono mechaniki?

## 19. Następne kroki

1. Review master spec przez design + system owner.
2. Ewentualne przeniesienie redundantnych speców do `docs/legacy/` w osobnym kroku.
3. Właściwy pass Figma/SVG oparty o master spec + visual pipeline.
4. FrameComposer contract cleanup.
5. Runtime integration pass.


## Nota: FrameComposer handoff hierarchy

- active technical contract: `docs/current/technical/FRAME_COMPOSER_SPEC.md`;
- SUB-META appendix: `SUB_META_V2_FRAMECOMPOSER_CONTRACT.md`;
- normalized data appendix: `SUB_META_V2_LAYOUT_TOKENS.md`.


## 20. Migracja / CARD_SLOT_NETWORK_SYSTEM reference

- Master layout musi uwzględnić `CARD_SLOT_NETWORK_SYSTEM.md` przy przyszłych pracach projektowych, bez zmiany runtime w tym kroku.
- R2 bridge rozdziela się lokalnie na PRG i ŚWIAT; R2 PRG nie wzmacnia bezpośrednio R1 ŚWIATA i odwrotnie.
- R3/R4 są globalne w resonance core i powinny być prezentowane jako warstwa ponad gałęziami.
- DS / specjalny zasób w inventory wymaga reinterpretacji jako karta naprawcza albo mechanika naprawy slotu.
- Przyszłe placeholdery muszą uwzględnić stabilizatory przy kartach, blizny slotów i napięcia.
- Nie zmieniać layout tokens, JSON ani runtime na podstawie tej noty bez osobnego zadania implementacyjnego.
