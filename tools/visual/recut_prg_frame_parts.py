#!/usr/bin/env python3
import copy, json, pathlib
import xml.etree.ElementTree as ET
SVG_NS='http://www.w3.org/2000/svg'; INK_NS='http://www.inkscape.org/namespaces/inkscape'
ET.register_namespace('',SVG_NS)
REPO=pathlib.Path(__file__).resolve().parents[2]
MASTER=REPO/'svg/PRG-frame.svg'; MANIFEST=REPO/'assets/visual/prg/prg_frame_manifest.json'; OUT=REPO/'assets/visual/prg/svg/frame_parts'

def recut():
    root=ET.parse(MASTER).getroot(); src=None
    for e in root.iter():
        if e.attrib.get(f'{{{INK_NS}}}label')=='sciezka-z-obrazu': src=e; break
    if src is None: raise RuntimeError('Missing source layer: sciezka-z-obrazu')
    data=json.loads(MANIFEST.read_text(encoding='utf-8')); OUT.mkdir(parents=True,exist_ok=True)
    for a in data.get('assets',[]):
        r=a['sourceCutRect']; w=float(r['w']); h=float(r['h']); x=float(r['x']); y=float(r['y'])
        svg=ET.Element(f'{{{SVG_NS}}}svg',{'viewBox':f'0 0 {w:.4f} {h:.4f}','width':f'{w:.4f}','height':f'{h:.4f}'})
        defs=ET.SubElement(svg,f'{{{SVG_NS}}}defs'); cp=ET.SubElement(defs,f'{{{SVG_NS}}}clipPath',{'id':'clip-part'})
        ET.SubElement(cp,f'{{{SVG_NS}}}rect',{'x':'0','y':'0','width':f'{w:.4f}','height':f'{h:.4f}'})
        g=ET.SubElement(svg,f'{{{SVG_NS}}}g',{'clip-path':'url(#clip-part)','transform':f'translate({-x:.6f} {-y:.6f})'})
        g.append(copy.deepcopy(src))
        ET.ElementTree(svg).write(OUT/a['file'],encoding='utf-8',xml_declaration=True)
if __name__=='__main__': recut()
