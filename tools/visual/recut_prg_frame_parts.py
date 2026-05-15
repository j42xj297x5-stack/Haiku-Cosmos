#!/usr/bin/env python3
import json, re
import xml.etree.ElementTree as ET
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'svg/PRG-frame1.svg'
MANIFEST = ROOT / 'assets/visual/prg/prg_frame_manifest.json'
PARTS_DIR = ROOT / 'assets/visual/prg/svg/frame_parts'

SVG_NS='http://www.w3.org/2000/svg'
INK_NS='http://www.inkscape.org/namespaces/inkscape'
ET.register_namespace('', SVG_NS)
ET.register_namespace('inkscape', INK_NS)

GEOM={'path','line','polyline','polygon','rect','circle','ellipse','use'}

def ln(tag): return tag.split('}')[-1]

def parse_path_bbox(d):
    nums=[float(x) for x in re.findall(r'[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?', d or '')]
    if len(nums)<2: return None
    xs=nums[0::2]; ys=nums[1::2]
    if not xs or not ys: return None
    return (min(xs),min(ys),max(xs),max(ys))

def rect_intersects(a,b):
    ax,ay,aw,ah=a; bx,by,bw,bh=b
    return not (ax+aw<=bx or bx+bw<=ax or ay+ah<=by or by+bh<=ay)

root=ET.parse(SRC).getroot()
viewbox=root.get('viewBox')
groups=[]
for g in root.findall('.//{*}g'):
    gid=g.get('id','')
    lab=g.get(f'{{{INK_NS}}}label','')
    ctr={k:0 for k in GEOM}
    for e in g.iter():
        t=ln(e.tag)
        if t in GEOM: ctr[t]+=1
    if gid or lab:
        groups.append((gid,lab,{k:v for k,v in ctr.items() if v}))

layer1=next(g for g in root.findall('.//{*}g') if g.get('id')=='layer1')
source_geom=[e for e in layer1 if ln(e.tag) in GEOM]
if not source_geom:
    raise SystemExit('No geometry in source layer1')

# collect rough bboxes of source geometry
source_bboxes=[]
for e in source_geom:
    t=ln(e.tag)
    bbox=None
    if t=='path':
        bbox=parse_path_bbox(e.get('d',''))
    elif t in {'rect','image'}:
        x=float(e.get('x','0')); y=float(e.get('y','0')); w=float(e.get('width','0')); h=float(e.get('height','0')); bbox=(x,y,x+w,y+h)
    if bbox:
        source_bboxes.append((bbox[0],bbox[1],bbox[2]-bbox[0],bbox[3]-bbox[1]))

m=json.loads(MANIFEST.read_text())
audit=[]
for a in m['assets']:
    r=a['sourceCutRect']; rect=(float(r['x']),float(r['y']),float(r['w']),float(r['h']))
    intersects=sum(1 for b in source_bboxes if rect_intersects(rect,b))
    status='usable' if intersects>0 else 'empty_rect'
    audit.append((a['file'],a.get('logicalName',''),rect,intersects,status))

for a in m['assets']:
    r=a['sourceCutRect']; x,y,w,h=[float(r[k]) for k in ('x','y','w','h')]
    svg=ET.Element(f'{{{SVG_NS}}}svg',{
                'viewBox':f'0 0 {w:.4f} {h:.4f}',
        'width':f'{w:.4f}','height':f'{h:.4f}'
    })
    defs=ET.SubElement(svg,f'{{{SVG_NS}}}defs')
    cp=ET.SubElement(defs,f'{{{SVG_NS}}}clipPath',{'id':'cut'})
    ET.SubElement(cp,f'{{{SVG_NS}}}rect',{'x':'0','y':'0','width':f'{w:.4f}','height':f'{h:.4f}'})
    g=ET.SubElement(svg,f'{{{SVG_NS}}}g',{'clip-path':'url(#cut)','transform':f'translate({-x:.4f},{-y:.4f})'})
    for e in source_geom:
        g.append(deepcopy(e))
    ET.indent(ET.ElementTree(svg),space='  ')
    out=PARTS_DIR/a['file']
    ET.ElementTree(svg).write(out,encoding='utf-8',xml_declaration=True)

m['sourceFile']='svg/PRG-frame1.svg'
m['sourceName']='PRG-frame1.svg'
m['status']='review_probe'
MANIFEST.write_text(json.dumps(m,indent=2,ensure_ascii=False)+"\n")

print('SVG groups:')
for gid,lab,ctr in groups: print(gid,lab,ctr)
print('Audit rows:')
for row in audit: print(row)
print('Done',len(m['assets']))
