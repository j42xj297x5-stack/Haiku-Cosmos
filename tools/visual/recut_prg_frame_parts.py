#!/usr/bin/env python3
from __future__ import annotations
import argparse, json
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
import xml.etree.ElementTree as ET
SVG_NS='http://www.w3.org/2000/svg'; INK_NS='http://www.inkscape.org/namespaces/inkscape'
GEOM={'path','line','polyline','polygon','rect','circle','ellipse','use'}
ET.register_namespace('',SVG_NS)

def ln(t:str)->str:return t.split('}',1)[1] if t.startswith('{') else t

def parse_num(v:str|None, d:float=0.0)->float:
    try:return float(v or d)
    except:return d

def find_layer(root:ET.Element, lid:str, label:str)->ET.Element:
    for g in root.findall(f".//{{{SVG_NS}}}g"):
        if g.attrib.get('id')==lid:return g
    for g in root.findall(f".//{{{SVG_NS}}}g"):
        if g.attrib.get(f"{{{INK_NS}}}label")==label:return g
    raise SystemExit(f"Missing layer {lid}/{label}")

def main():
    p=argparse.ArgumentParser()
    p.add_argument('--source',required=True,type=Path)
    p.add_argument('--order-map',required=True,type=Path)
    p.add_argument('--local-space-output',action='store_true')
    a=p.parse_args()
    repo=Path(__file__).resolve().parents[2]
    manifest_p=repo/'assets/visual/prg/prg_frame_manifest.json'
    meta_p=repo/'assets/visual/prg/prg_frame_layout_metadata.json'
    out_dir=repo/'assets/visual/prg/svg/frame_parts'; out_dir.mkdir(parents=True,exist_ok=True)
    om=json.loads(a.order_map.read_text(encoding='utf-8'))
    parts=sorted(om['parts'], key=lambda x:x['index'])
    tree=ET.parse(a.source); root=tree.getroot()
    layer1=find_layer(root,'layer1','grafika'); layer2=find_layer(root,'layer2','ciecie'); layer3=find_layer(root,'layer3','kotwice-srodki'); layer4=find_layer(root,'layer4','punkty zaczepienia')
    source_path=next((c for c in list(layer1) if ln(c.tag)=='path' and c.attrib.get('id')=='path1'),None)
    if source_path is None: raise SystemExit('Missing layer1/path1 source geometry')
    cut=[c for c in list(layer2) if ln(c.tag)=='rect']; centers=[c for c in list(layer3) if ln(c.tag) in {'path','circle'}]; anchors=[c for c in list(layer4) if ln(c.tag) in {'path','circle'}]
    if not (len(parts)==17 and len(cut)>=17 and len(centers)>=17 and len(anchors)>=40): raise SystemExit('Invalid layer counts')
    manifest={'sourceFile':'svg/PRG-plain.svg','sourceGeometryLayer':'layer1/path1','cutLayer':'layer2','centerLayer':'layer3','anchorLayer':'layer4','assetCount':17,'generatedAt':datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ'),'status':'review/runtime_probe_recut','assets':[]}
    meta={'schemaVersion':'prg_frame_layout_metadata_v0.1','sourceManifest':'assets/visual/prg/prg_frame_manifest.json','metadataStatus':'manual_order_mapping','notes':['Mapping based on designer-provided Inkscape layer order and PRG-plain.svg technical ids.'],'parts':{}}
    val=[]
    idx2anchors={
      1:[1,2,3],2:[4,5,6],3:[7,8,9],4:[10,11,12],5:[13,14],6:[15,16],7:[17,18],8:[19,20],9:[21,22],10:[23,24],11:[25,26],12:[27,28],13:[29,30],14:[31,32],15:[33,34],16:[35,36],17:[37,38,39,40]
    }
    for i,part in enumerate(parts, start=1):
      r=cut[i-1]; c=centers[i-1];
      x,y,w,h=[parse_num(r.attrib.get(k)) for k in ('x','y','width','height')]
      root_out=ET.Element(f"{{{SVG_NS}}}svg",{'version':'1.1','width':f'{w:.6f}','height':f'{h:.6f}'})
      if a.local_space_output:
        root_out.attrib['viewBox']=f'0 0 {w:.6f} {h:.6f}'; g=ET.SubElement(root_out,f"{{{SVG_NS}}}g",{'transform':f'translate({-x:.6f},{-y:.6f})'}); g.append(deepcopy(source_path)); model='local-space-viewBox'
      else:
        root_out.attrib['viewBox']=f'{x:.6f} {y:.6f} {w:.6f} {h:.6f}'; root_out.append(deepcopy(source_path)); model='source-space-viewBox'
      out=out_dir/part['outputFile']; ET.indent(root_out,space='  '); ET.ElementTree(root_out).write(out,encoding='utf-8',xml_declaration=True)
      anchor_names=[anchors[j-1].attrib.get(f'{{{INK_NS}}}label','') for j in idx2anchors[i]]
      manifest['assets'].append({'index':i,'file':part['outputFile'],'role':part['role'],'sourceCutRect':{'x':x,'y':y,'w':w,'h':h,'id':r.attrib.get('id')},'cutRectPlainId':part['cutRectPlainId'],'centerPlainId':part['centerPlainId'],'joinAnchors':anchor_names,'status':'review/runtime_probe_recut'})
      cx=parse_num(c.attrib.get('cx')); cy=parse_num(c.attrib.get('cy'))
      meta['parts'][part['outputFile']]={'role':part['role'],'pivot':{'x':cx,'y':cy},'joinAnchors':anchor_names,'metadataStatus':'manual_order_mapping'}
      txt=out.read_text(encoding='utf-8',errors='ignore')
      val.append({'file':part['outputFile'],'viewBox':root_out.attrib['viewBox'],'outputModel':model,'geometryElementCount':sum(1 for e in root_out.iter() if ln(e.tag) in GEOM),'hasImage':'<image' in txt,'hasBase64':('base64,' in txt or 'data:image' in txt),'status':'OK' if w>0 and h>0 else 'FAIL'})
    manifest_p.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    meta_p.write_text(json.dumps(meta,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print('VALIDATION')
    for row in val: print(json.dumps(row,ensure_ascii=False))

if __name__=='__main__': main()
