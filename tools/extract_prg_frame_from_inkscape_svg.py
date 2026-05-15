#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import argparse, copy, datetime as dt, json, re
import xml.etree.ElementTree as ET
from pathlib import Path

SVG_NS = 'http://www.w3.org/2000/svg'
INK_NS = 'http://www.inkscape.org/namespaces/inkscape'
XLINK_NS = 'http://www.w3.org/1999/xlink'
NS = {'svg': SVG_NS, 'ink': INK_NS}
ET.register_namespace('', SVG_NS)
ET.register_namespace('inkscape', INK_NS)
ET.register_namespace('xlink', XLINK_NS)


def fmt(v):
    s = f'{v:.4f}'.rstrip('0').rstrip('.')
    return s or '0'


def parse_style(s):
    d = {}
    for p in (s or '').split(';'):
        if ':' in p:
            k, v = p.split(':', 1)
            d[k.strip()] = v.strip()
    return d


def is_hidden(el):
    st = parse_style(el.get('style', ''))
    return el.get('display') == 'none' or el.get('visibility') == 'hidden' or st.get('display') == 'none' or st.get('visibility') == 'hidden'


def label(el):
    return el.get(f'{{{INK_NS}}}label') or el.get('id') or 'unnamed'


def norm(s):
    s = (s or 'unnamed').lower().strip()
    s = re.sub(r'^(cut|rect|box|slice|clip)[_\-:. ]+', '', s)
    s = re.sub(r'[^a-z0-9]+', '_', s).strip('_')
    return s or 'unnamed'


def layer_map(root):
    m = {}
    for g in root.findall('.//svg:g', NS):
        if g.get(f'{{{INK_NS}}}groupmode') == 'layer':
            m[(g.get(f'{{{INK_NS}}}label') or '').strip().lower().replace(' ', '-')] = g
    return m


def center(el):
    t = el.tag.split('}')[-1]
    if t in ('circle', 'ellipse'):
        return float(el.get('cx', 0)), float(el.get('cy', 0))
    if t == 'rect':
        x, y, w, h = map(float, [el.get('x', 0), el.get('y', 0), el.get('width', 0), el.get('height', 0)])
        return x + w / 2, y + h / 2
    return None


def contains(r, p):
    return r['x'] <= p[0] <= r['x'] + r['w'] and r['y'] <= p[1] <= r['y'] + r['h']


def logical_owner_and_role(anchor_name):
    n = norm(anchor_name)
    parts = n.split('_')
    if len(parts) <= 1:
        return n, ''
    return '_'.join(parts[:-1]), parts[-1]




def owner_aliases(asset_id):
    aliases = {asset_id}
    if asset_id == 'center':
        aliases.add('fill_center')
    if asset_id == 'fill_center':
        aliases.add('center')
    return aliases

def asset_contract(asset_id):
    if asset_id.startswith('ornament_'):
        return 3
    if asset_id.startswith('center') or asset_id.startswith('fill'):
        return 4
    if asset_id.startswith('line_'):
        return 2
    if asset_id.startswith('corner_'):
        return 2
    return 0


def cls(n):
    n = n.lower()
    if n.startswith('corner'):
        return 'corner', 'none'
    if n.startswith('line'):
        return 'edge', ('x' if 'line_h' in n else 'y' if 'line_v' in n else 'none')
    if n.startswith('ornament') or 'center' in n or n.startswith('fill'):
        return 'center', 'none'
    return 'rect', 'none'


def role_dir(role):
    m = {'u': 'u', 'up': 'u', 'top': 'u', 'd': 'd', 'down': 'd', 'bottom': 'd', 'l': 'l', 'left': 'l', 'r': 'r', 'right': 'r'}
    return m.get(role, role)


def expected_corner_roles(asset_id):
    m = {'corner_lu': {'r', 'd'}, 'corner_ru': {'l', 'd'}, 'corner_ld': {'r', 'u'}, 'corner_rd': {'l', 'u'}}
    return m.get(asset_id, set())


def score_anchor(asset, anchor):
    owner, role = logical_owner_and_role(anchor['name'])
    a_id = asset['id']
    score = 0
    if owner == a_id:
        score += 100
    elif owner.startswith(a_id) or a_id.startswith(owner):
        score += 60
    if a_id.startswith('line_h'):
        if role_dir(role) in ('l', 'r'):
            score += 20
    elif a_id.startswith('line_v'):
        if role_dir(role) in ('u', 'd'):
            score += 20
    elif a_id.startswith('corner_'):
        if role_dir(role) in expected_corner_roles(a_id):
            score += 20
    elif a_id.startswith('center') or a_id.startswith('fill'):
        if role_dir(role) in ('u', 'd', 'l', 'r'):
            score += 15
    elif a_id.startswith('ornament_'):
        if role_dir(role) in ('u', 'd', 'l', 'r', 'start', 'end', 'side'):
            score += 10
    return score


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--source', required=True)
    ap.add_argument('--out')
    ap.add_argument('--manifest')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--extract', action='store_true')
    a = ap.parse_args()
    if not (a.dry_run or a.extract):
        raise SystemExit('Use --dry-run or --extract')

    src = Path(a.source)
    root = ET.parse(src).getroot()
    layers = layer_map(root)
    req = ['grafika', 'kotwice-srodki', 'punkty-zaczepienia', 'ciecie']
    miss = [x for x in req if x not in layers]
    if miss:
        raise SystemExit(f'Missing layers: {miss}')

    warns = []
    cuts = []
    for el in layers['ciecie'].iter():
        if el.tag == f'{{{SVG_NS}}}rect' and not is_hidden(el):
            x, y, w, h = map(float, [el.get('x', 0), el.get('y', 0), el.get('width', 0), el.get('height', 0)])
            if w > 0 and h > 0:
                n = label(el)
                cuts.append({'name': n, 'id': norm(n), 'x': x, 'y': y, 'w': w, 'h': h})

    centers, joins = [], []
    for ln, dst in [('kotwice-srodki', centers), ('punkty-zaczepienia', joins)]:
        for el in layers[ln].iter():
            if is_hidden(el):
                continue
            c = center(el)
            if c:
                dst.append({'name': label(el), 'x': c[0], 'y': c[1], 'source': ln})

    used_join = set()
    assets, no_pivot = [], []
    rejected_by_asset = {}
    for r in cuts:
        a_id = r['id']
        expected = asset_contract(a_id)
        asset_warnings = []

        c_exact = [c for c in centers if norm(c['name']) == a_id]
        c_inside = [c for c in centers if contains(r, (c['x'], c['y']))]
        if c_exact:
            piv = min(c_exact, key=lambda c: abs(c['x'] - (r['x'] + r['w'] / 2)) + abs(c['y'] - (r['y'] + r['h'] / 2)))
        elif c_inside:
            piv = min(c_inside, key=lambda c: abs(c['x'] - (r['x'] + r['w'] / 2)) + abs(c['y'] - (r['y'] + r['h'] / 2)))
            asset_warnings.append('Center pivot via inside-rect fallback')
        else:
            piv = {'x': r['x'] + r['w'] / 2, 'y': r['y'] + r['h'] / 2, 'name': 'rect_center_fallback'}
            no_pivot.append(r['name'])
            asset_warnings.append('Missing center pivot; fallback to rect center')

        strict = []
        accepted_owners = owner_aliases(a_id)
        for j in joins:
            owner, role = logical_owner_and_role(j['name'])
            if owner in accepted_owners:
                strict.append((j, role, 'exact_owner'))
        picked = [x[0] for x in strict]

        if len(picked) > expected:
            scored = sorted(picked, key=lambda j: score_anchor(r, j), reverse=True)
            kept = scored[:expected]
            rejected = [x['name'] for x in scored[expected:]]
            picked = kept
            rejected_by_asset[a_id] = rejected
            asset_warnings.append(f'Rejected extra anchors: {", ".join(rejected)}')

        if len(picked) < expected:
            need = expected - len(picked)
            candidates = []
            for j in joins:
                if id(j) in used_join or j in picked:
                    continue
                owner, role = logical_owner_and_role(j['name'])
                if owner and owner not in accepted_owners:
                    continue
                if contains(r, (j['x'], j['y'])):
                    candidates.append(j)
            candidates = sorted(candidates, key=lambda j: score_anchor(r, j), reverse=True)
            picked.extend(candidates[:need])
            if candidates[:need]:
                asset_warnings.append(f'Geometry fallback used: {", ".join(x["name"] for x in candidates[:need])}')

        if len(picked) < expected:
            asset_warnings.append(f'missing_join_anchor_count:{expected - len(picked)}')

        for j in picked:
            used_join.add(id(j))

        at, sa = cls(a_id)
        anchors = {'pivot': {'x': round(piv['x'] - r['x'], 4), 'y': round(piv['y'] - r['y'], 4)}}
        for j in picked:
            owner, role = logical_owner_and_role(j['name'])
            role_key = role_dir(role or 'join')
            k = f'join_{role_key}'
            idx = 2
            while k in anchors:
                k = f'join_{role_key}_{idx}'
                idx += 1
            anchors[k] = {'x': round(j['x'] - r['x'], 4), 'y': round(j['y'] - r['y'], 4), 'sourceName': j['name']}

        assets.append({'id': a_id, 'logicalName': a_id, 'file': f'{a_id}.svg', 'type': 'frame_part', 'status': 'static_base',
                       'sourceCutRect': {'x': r['x'], 'y': r['y'], 'w': r['w'], 'h': r['h'], 'name': r['name']},
                       'viewBox': f"0 0 {fmt(r['w'])} {fmt(r['h'])}", 'anchorType': at,
                       'anchorPoint': {'x': round(piv['x'] - r['x'], 4), 'y': round(piv['y'] - r['y'], 4)},
                       'anchorOffset': {'x': round((piv['x'] - r['x']) - r['w'] / 2, 4), 'y': round((piv['y'] - r['y']) - r['h'] / 2, 4)},
                       'stretchAxis': sa, 'anchors': anchors, 'warnings': asset_warnings, 'expectedJoinAnchors': expected})

    unmatched = [j['name'] for j in joins if id(j) not in used_join]
    print('=== DRY RUN SUMMARY ===')
    print(f'Source: {src}')
    print(f'Cut rect count: {len(cuts)}')
    print(f'Center anchors: {len(centers)}')
    print(f'Join anchors: {len(joins)}')
    print(f'Anchors without match: {len(unmatched)}')
    print('Cut rects without pivot:', no_pivot)

    if not a.extract:
        return

    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    vis, skipped = [], []
    for ch in list(layers['grafika']):
        tag = ch.tag.split('}')[-1]
        if is_hidden(ch):
            skipped.append(f'hidden:{label(ch)}')
            continue
        if tag == 'image':
            skipped.append(f'image:{label(ch)}')
            continue
        vis.append(copy.deepcopy(ch))

    for it in assets:
        r = it['sourceCutRect']
        svg = ET.Element(f'{{{SVG_NS}}}svg', {'version': '1.1', 'viewBox': f"0 0 {fmt(r['w'])} {fmt(r['h'])}", 'width': fmt(r['w']), 'height': fmt(r['h'])})
        defs = ET.SubElement(svg, f'{{{SVG_NS}}}defs')
        cp = ET.SubElement(defs, f'{{{SVG_NS}}}clipPath', {'id': 'clip'})
        ET.SubElement(cp, f'{{{SVG_NS}}}rect', {'x': '0', 'y': '0', 'width': fmt(r['w']), 'height': fmt(r['h'])})
        g = ET.SubElement(svg, f'{{{SVG_NS}}}g', {'clip-path': 'url(#clip)', 'transform': f"translate({fmt(-r['x'])},{fmt(-r['y'])})"})
        for n in vis:
            g.append(copy.deepcopy(n))
        ET.ElementTree(svg).write(out / it['file'], encoding='utf-8', xml_declaration=True)

    mp = Path(a.manifest)
    mp.parent.mkdir(parents=True, exist_ok=True)
    mani = {'sourceFile': str(src), 'generatedAt': dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z'),
            'outputDir': str(out), 'extractionMode': 'clipPath', 'anchorMatchingPolicy': 'name_first_strict_anchor_count_v3', 'assetCount': len(assets), 'assets': assets}
    mp.write_text(json.dumps(mani, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    rep = mp.parent / 'prg_frame_extraction_report.md'
    lines = ['# PRG Frame Extraction Report', '', f'- Source: `{src}`', f'- Cut rect count: **{len(cuts)}**', f'- Generated SVG: **{len(assets)}**',
             f'- Center anchors: **{len(centers)}**', f'- Join anchors: **{len(joins)}**', '', '## Anchor count contract:', '- ornament: 4', '- center/fill: 5', '- line: 3', '- corner: 3', '',
             '## Assets', '', '| name | output file | cut rect | anchors count | expected anchors count | warnings |', '|---|---|---|---:|---:|---|']
    below, above = [], []
    for it in assets:
        r = it['sourceCutRect']
        cnt = len(it['anchors'])
        exp = it['expectedJoinAnchors'] + 1
        if cnt < exp:
            below.append(it['id'])
        if cnt > exp:
            above.append(it['id'])
        lines.append(f"| {it['id']} | `{it['file']}` | ({fmt(r['x'])},{fmt(r['y'])},{fmt(r['w'])},{fmt(r['h'])}) | {cnt} | {exp} | {'; '.join(it['warnings']) or '-'} |")
    lines += ['', '## Rejected anchors per asset', '']
    lines += [f"- {k}: {', '.join(v)}" for k, v in rejected_by_asset.items()] or ['- none']
    lines += ['', '## Unmatched anchors after cleanup', ''] + ([f'- {x}' for x in unmatched] or ['- none'])
    lines += ['', '## Assets below expected count', ''] + ([f'- {x}' for x in below] or ['- none'])
    lines += ['', '## Assets above expected count', ''] + ([f'- {x}' for x in above] or ['- none'])
    lines += ['', '## Cut rects without pivot/center', ''] + ([f'- {x}' for x in no_pivot] or ['- none'])
    lines += ['', '## Skipped bitmap/hidden objects', ''] + ([f'- {x}' for x in skipped] or ['- none'])
    rep.write_text('\n'.join(lines) + '\n', encoding='utf-8')

if __name__ == '__main__':
    main()
