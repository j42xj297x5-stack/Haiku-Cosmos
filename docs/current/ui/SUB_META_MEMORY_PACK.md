# Haiku Cosmos — SUB_META_MEMORY_PACK

> Status: ROBOCZY / HANDOFF PROJEKTOWY / MEMORY PACK (POMOCNICZY)
> Obszar: SUB-META / working memory / design handoff
> Źródło prawdy: NIE, to nie jest kanon systemowy ani główny entrypoint layoutu; TAK, jako operacyjny memory pack do kolejnych passów projektowych
> Ostatnia aktualizacja: 2026-04-30
> Powiązane dokumenty: `../maps/PROJECT_INDEX.md`, `../maps/DEPENDENCY_MAP.md`, `SUB_META_V2_MASTER_SPEC.md`, `SUB_META_V2_FRAMECOMPOSER_CONTRACT.md`, `SUB_META_V2_LAYOUT_TOKENS.md`, `../visual/README.md`, `../../legacy/ui/SUB_META_V2_WIREFRAME_SPEC.md`

## 1. PURPOSE

**Główny entrypoint layout/design handoff SUB-META v2:** `docs/current/ui/SUB_META_V2_MASTER_SPEC.md`.

Ten memory pack jest dokumentem pomocniczym i nie zastępuje master spec.


Ten dokument istnieje po to, żeby przed kolejnymi pracami nad SUB-META szybko załadować **minimalny, poprawny kontekst**.

To nie jest kanon mechaniczny. To jest **harness pamięci projektowej**: co czytać, czego nie mieszać i jakie granice respektować.

## 2. MUST LOAD BEFORE SUB-META DESIGN

### A) Core mandatory

1. `docs/current/maps/PROJECT_INDEX.md` — **KANON** — mapa statusów dokumentów; uwaga: najpierw filtruj kanon/kierunek/evidence.
2. `docs/current/maps/DEPENDENCY_MAP.md` — **KANON** — relacje system↔UI↔visual↔runtime; uwaga: używaj jako mapy zależności, nie jako specu szczegółów.
3. `docs/current/systems/SUB_META_SYSTEM.md` — **KANON** — definicja SUB-META i ról R1/R2/R3/R4; uwaga: to baza znaczenia, nie layout.
4. `docs/current/systems/CARDS_SYSTEM.md` — **KANON** — reguły kart/sekwencji/DS; uwaga: visual nie może zmieniać tych zasad.
5. `docs/current/systems/PRG_SYSTEM.md` — **KANON STRUKTURALNY / DO STROJENIA** — semantyka PRG; uwaga: traktuj jako obowiązujący szkielet.
6. `docs/current/systems/ECONOMY_SYSTEM.md` — **KANON** — koszty RP i granice ekonomii; uwaga: nie zgaduj kosztów w dokumencie visual.
7. `docs/current/ui/UI_WORLD.md` — **KANON** — rola SUB-META/HUD/META w UI; uwaga: spina system i prezentację.

### B) Technical layout mandatory

8. `docs/current/ui/SUB_META_V2_WIREFRAME_SPEC.md` — **ROBOCZY / SPEC WIREFRAME** — Composition v0.5 i semantyka stref; uwaga: to struktura, nie final styl artystyczny.
9. `docs/current/ui/SUB_META_V2_FRAMECOMPOSER_CONTRACT.md` — **ROBOCZY / KONTRAKT** — anchor/rect handoff v0.6 i stable IDs; uwaga: obowiązuje separacja rectów.
10. `docs/current/ui/SUB_META_V2_LAYOUT_TOKENS.md` — **ROBOCZY / KONTRAKT** — tokens v0.7, normalized centers/sizes/connectors; uwaga: traktuj jako aktualne dane layoutowe.

### C) Visual mandatory

11. `docs/current/visual/README.md` — **KIERUNEK** — mapa visual i statusów; uwaga: odcina evidence od aktywnego kierunku.
12. `docs/current/visual/ART_DIRECTION.md` — **KIERUNEK** — ritual cosmic minimalism; uwaga: anty-wzorzec to neon/fantasy/ciężkie sci-fi.
13. `docs/current/visual/KOSMOLOGIA_WIZUALNA.md` — **KIERUNEK** — kosmologia 5 stanów; uwaga: symbolika ma wynikać ze struktury, nie dekoracji.
14. `docs/current/visual/BIBLIOTEKA_MATERIALOW.md` — **KIERUNEK** — logika materiału/koloru/światła; uwaga: kolor to nośnik sensu systemowego.
15. `docs/current/visual/MODULAR_FRAME_KIT.md` — **KIERUNEK / RESET** — zasady slotów/mostów/gniazd i modular parts; uwaga: nie wracać do monolitycznych ramek.
16. `docs/current/visual/FIGMA_WORKFLOW.md` — **KIERUNEK / WORKFLOW** — granice pracy Figma; uwaga: bez Implement Design/Code Connect, jeśli nie ma explicit tasku.

## 3. CURRENT SUB-META TRUTH

- SUB-META jest **warstwą konfiguracji**, nie mechaniką RUN.
- Główne gałęzie to **PRG** i **ŚWIAT**.
- **R1** to podstawowe tryby.
- **R2** to wiązania/mosty między gałęziami.
- **R3** to stabilizacja (wyższy poziom META; szczegóły mechaniczne nadal do doprecyzowania).
- **R4** to jedność konfiguracji.
- **DS** to karta specjalna/dodatkowy slot; aktualnie nie jest centrum rdzenia, tylko obszar magazyn/zasoby.
- Magazyn pokazuje karty i zasoby.
- Kuźnia jest mini-workspace dla refinement/upgrade.
- Card detail to duża karta + glif + metadata + haiku.
- SUB-META v2 layout: **PRG left, WORLD right, resonance core center, bottom inventory/forge/detail**.
- 9 stref to **semantyka**, nie widoczna tabela 3×3.

## 4. CURRENT VISUAL TRUTH

- Kierunek: **ritual cosmic minimalism**.
- Cienkie linie, żywa rytualna linia, ale bez chaosu.
- Sloty czytamy jako gniazda; R2 jako mosty/wiązania.
- Resonance core ma geometrię osiową, nie „losowy ornament”.
- Zakazy: generic fantasy UI, tłuste sci-fi, sterylny CAD UI, agresywny neon.
- Figma v0.2: technical baseline (za sterylny jako final kierunek).
- Figma v0.3: living ritual line (lepszy kierunek), ale nadal **evidence**, nie final canon.

## 5. LAYOUT / IMPLEMENTATION TRUTH

- Composition v0.5 opisuje aktualną kompozycję.
- Contract v0.6 opisuje anchors/rect separation.
- Tokens v0.7 opisują normalized layout data.
- Center-based positioning obowiązuje.
- Named anchors obowiązują.
- Rect separation obowiązuje:
  - `layoutRect`
  - `interactiveRect`
  - `visualMountRect`
  - `visualBleedRect`
  - `contentSafeRect`
- Każdy przyszły pass FrameComposer/Figma/SVG musi respektować te warstwy.

## 6. EVIDENCE BOUNDARIES

- `docs/current/visual/SUB_META_FIGMA_ASSET_PASS_01.md` = evidence/history.
- `docs/current/visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V02.md` = technical baseline/evidence, nie final style.
- `docs/current/visual/SUB_META_FIGMA_DERIVED_FRAME_KIT_V03.md` = style correction evidence, kierunkowo cenne, ale nie final production asset.
- `docs/current/visual/MODULAR_FRAME_KIT_ASSET_MANIFEST.md` = manifest evidence/legacy, nie aktywny production manifest.
- `assets/visual/legacy/**` = nie ładować jako source-of-truth.

## 7. BEFORE NEW FIGMA PASS — CHECKLIST

- Czy zadanie czyta `SUB_META_MEMORY_PACK.md`?
- Czy zadanie odróżnia kanon od evidence?
- Czy zadanie wskazuje: layout / frame kit / export / runtime?
- Czy zadanie zakazuje Implement Design / Code Connect, jeśli niepotrzebne?
- Czy zadanie potwierdza brak zmian mechaniki?
- Czy zadanie wskazuje źródło Figma i dokładny zakres?
- Czy zadanie mówi, co ma być eksportowane, a co nie?
- Czy zadanie respektuje center-based positioning i named anchors?
- Czy zadanie nie traktuje v0.2/v0.3 jako final canon?

## 8. DO NOT DO

- Nie czytać legacy domyślnie.
- Nie projektować z evidence jako kanonu.
- Nie zmieniać mechaniki przez visual.
- Nie eksportować wszystkiego naraz.
- Nie podłączać assetów do runtime bez osobnego passu.
- Nie robić pełnego SUB-META screen w frame kit pass.
- Nie sterylizować „żywej linii”.
- Nie robić generic fantasy/sci-fi UI.

## 9. NEXT DESIGN DECISION NEEDED

- Które komponenty v0.3 są export candidates?
- Czy robić od razu export batch, czy jeszcze jeden mikro-pass stylu?
- Czy v0.3 wymaga jeszcze jednej korekty stylu przed eksportem?
- Jak dokładnie domykamy mechaniczną definicję R3?
- Jaki subset ramek obsługuje card detail / forge / inventory w pierwszym wdrożeniu?
