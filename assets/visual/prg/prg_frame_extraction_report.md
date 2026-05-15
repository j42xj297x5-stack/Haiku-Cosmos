# PRG Frame Extraction Report

- Source: `svg/PRG-ramka-archive.svg`
- Cut rect count: **17**
- Generated SVG: **17**
- Center anchors: **17**
- Join anchors: **39**

## Anchor count contract:
- ornament: 4
- center/fill: 5
- line: 3
- corner: 3

## Assets

| name | output file | cut rect | anchors count | expected anchors count | warnings |
|---|---|---|---:|---:|---|
| corner_lu | `corner_lu.svg` | (76.3333,9.3815,44.8575,44.8154) | 3 | 3 | - |
| corner_ld | `corner_ld.svg` | (76.3374,334.4829,44.7542,44.8164) | 3 | 3 | - |
| corner_rd | `corner_rd.svg` | (179.8501,334.5321,44.372,44.7624) | 3 | 3 | - |
| corner_ru | `corner_ru.svg` | (179.6382,9.3848,44.5831,44.8116) | 3 | 3 | - |
| ornament_u | `ornament_u.svg` | (130.371,9.3863,40.0796,31.5209) | 4 | 4 | - |
| ornament_d | `ornament_d.svg` | (130.3826,347.8305,40.068,31.4639) | 4 | 4 | - |
| ornament_l | `ornament_l.svg` | (76.3374,182.0122,18.5009,25.5024) | 4 | 4 | - |
| ornament_r | `ornament_r.svg` | (206.2658,181.8483,17.9547,25.499) | 4 | 4 | - |
| line_hlu | `line_hlu.svg` | (121.1909,18.9263,9.1877,13.5933) | 3 | 3 | - |
| line_hru | `line_hru.svg` | (170.4504,18.3243,9.1877,13.5933) | 1 | 3 | missing_join_anchor_count:2 |
| line_vlu | `line_vlu.svg` | (76.3374,54.1969,18.5438,127.8153) | 3 | 3 | - |
| line_vld | `line_vld.svg` | (76.3374,207.5146,18.5017,126.9683) | 3 | 3 | - |
| line_vru | `line_vru.svg` | (206.2659,54.1965,17.9546,127.6476) | 3 | 3 | Rejected extra anchors: line-vru-r |
| line_vrd | `line_vrd.svg` | (206.2678,207.3493,17.9522,127.1827) | 3 | 3 | - |
| line_hld | `line_hld.svg` | (121.0913,356.8644,9.2911,11.4999) | 3 | 3 | - |
| line_hrd | `line_hrd.svg` | (170.4506,355.8732,9.3995,13.9226) | 3 | 3 | - |
| center | `center.svg` | (94.839,40.9307,111.4344,306.8998) | 5 | 5 | Center pivot via inside-rect fallback |

## Rejected anchors per asset

- line_vru: line-vru-r

## Unmatched anchors after cleanup

- line-vru-r

## Assets below expected count

- line_hru

## Assets above expected count

- none

## Cut rects without pivot/center

- none

## Skipped bitmap/hidden objects

- hidden:image1
