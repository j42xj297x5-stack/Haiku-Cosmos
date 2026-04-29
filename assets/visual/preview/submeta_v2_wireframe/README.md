# SUB-META v2 low-fi wireframe preview

Status: `ROBOCZY / PREVIEW SPEC`.

URL lokalny:
`http://localhost:8123/assets/visual/preview/submeta_v2_wireframe/submeta_v2_wireframe.html`

Aktywny tryb domyślny:
- `SUB-META v2 Layout Tokens v0.7 — normalized contract data pass`.

Zakres:
- repo-only desktop/tablet/mobile composition pass,
- 9 stref jako semantyka layoutu (nie wizualny grid 3×3),
- wszystkie sloty kart jako pionowe placeholdery,
- PRG jako pionowe skrzydło (4 osie: R1 + ODB, 3xR2 po stronie wewnętrznej),
- ŚWIAT jako bardziej poziome skrzydło (4 osie: R1 + R1 + EXT, 3xR2 po stronie wewnętrznej),
- rdzeń resonance: R4 centralnie, 2 sloty R3 jako orbiter cards,
- DS usunięte z centrum i osadzone w magazynie zasobów,
- dół: szeroki inventory bank + funkcjonalna mini Kuźnia + duży card detail reader,
- anchor-aware opis stref i mount logic pod przyszłe ramki/ornamenty/SVG.

Poza zakresem:
- runtime integration,
- zmiany mechaniki,
- Figma MCP,
- nowe assety SVG/PNG/fonty.


Contract pass v0.6 (anchor/rect handoff):
- doprecyzowany model anchor IDs zgodny z `docs/current/ui/SUB_META_V2_FRAMECOMPOSER_CONTRACT.md`,
- debug overlay z etykietami anchor IDs i prostym podglądem warstw rect,
- nadal repo-only: bez runtime integration i bez zmian mechaniki.


Layout tokens v0.7:
- preview JS zawiera obiekt `SUBMETA_LAYOUT_TOKENS_V07` (repo-only),
- dodana jest funkcja `validateSubmetaLayoutTokens(tokens)` uruchamiana przy starcie preview,
- debug overlay pozostaje aktywny i działa bez runtime integration.
