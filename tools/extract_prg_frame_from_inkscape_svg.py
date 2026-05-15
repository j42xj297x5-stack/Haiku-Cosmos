#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import argparse, copy, datetime as dt, json, re
import xml.etree.ElementTree as ET
from pathlib import Path
SVG_NS='http://www.w3.org/2000/svg'; INK_NS='http://www.inkscape.org/namespaces/inkscape'; XLINK_NS='http://www.w3.org/1999/xlink'
NS={'svg':SVG_NS,'ink':INK_NS}
ET.register_namespace('',SVG_NS); ET.register_namespace('inkscape',INK_NS); ET.register_namespace('xlink',XLINK_NS)

def fmt(v): s=f'{v:.4f}'.rstrip('0').rstrip('.'); return s or '0'
def parse_style(s):
 d={}
 for p in (s or '').split(';'):
  if ':' in p: k,v=p.split(':',1); d[k.strip()]=v.strip()
 return d

def is_hidden(el):
 st=parse_style(el.get('style',''))
 return el.get('display')=='none' or el.get('visibility')=='hidden' or st.get('display')=='none' or st.get('visibility')=='hidden'

def label(el): return el.get(f'{{{INK_NS}}}label') or el.get('id') or 'unnamed'
def norm(s):
 s=(s or 'unnamed').lower().strip(); s=re.sub(r'^(cut|rect|box|slice|clip)[_\-:. ]+','',s); s=re.sub(r'[^a-z0-9]+','_',s).strip('_'); return s or 'unnamed'
def layer_map(root):
 m={}
 for g in root.findall('.//svg:g',NS):
  if g.get(f'{{{INK_NS}}}groupmode')=='layer': m[(g.get(f'{{{INK_NS}}}label') or '').strip().lower().replace(' ','-')]=g
 return m

def center(el):
 t=el.tag.split('}')[-1]
 if t in ('circle','ellipse'): return float(el.get('cx',0)),float(el.get('cy',0))
 if t=='rect':
  x,y,w,h=map(float,[el.get('x',0),el.get('y',0),el.get('width',0),el.get('height',0)]); return x+w/2,y+h/2
 return None

def cls(n):
 n=n.lower()
 if n.startswith('corner'): return 'corner','none'
 if n.startswith('line'): return 'edge',('x' if 'line-h' in n else 'y' if 'line-v' in n else 'none')
 if n.startswith('ornament') or 'center' in n or n.startswith('fill'): return 'center','none'
 return 'rect','none'

def contains(r,p): return r['x']<=p[0]<=r['x']+r['w'] and r['y']<=p[1]<=r['y']+r['h']

def main():
 ap=argparse.ArgumentParser(); ap.add_argument('--source',required=True); ap.add_argument('--out'); ap.add_argument('--manifest'); ap.add_argument('--dry-run',action='store_true'); ap.add_argument('--extract',action='store_true'); a=ap.parse_args()
 if not(a.dry_run or a.extract): raise SystemExit('Use --dry-run or --extract')
 src=Path(a.source); root=ET.parse(src).getroot(); layers=layer_map(root)
 req=['grafika','kotwice-srodki','punkty-zaczepienia','ciecie']; miss=[x for x in req if x not in layers]
 if miss: raise SystemExit(f'Missing layers: {miss}')
 warns=[]; cuts=[]
 for el in layers['ciecie'].iter():
  if el.tag==f'{{{SVG_NS}}}rect' and not is_hidden(el):
   x,y,w,h=map(float,[el.get('x',0),el.get('y',0),el.get('width',0),el.get('height',0)])
   if w>0 and h>0:
    n=label(el); cuts.append({'name':n,'id':norm(n),'x':x,'y':y,'w':w,'h':h})
  tr=el.get('transform');
  if tr and any(k in tr for k in ('rotate','skew')): warns.append(f'Complex transform on {label(el)}: {tr}')
 centers=[]; joins=[]
 for ln,dst in [('kotwice-srodki',centers),('punkty-zaczepienia',joins)]:
  for el in layers[ln].iter():
   if is_hidden(el): continue
   c=center(el)
   if c: dst.append({'name':label(el),'x':c[0],'y':c[1],'source':ln})
 alla=centers+joins; assets=[]; no_pivot=[]
 for r in cuts:
  stem=re.sub(r'(_(u|d|l|r))+$','',r['id'])
  byn=[x for x in alla if stem and stem in norm(x['name'])]; byg=[x for x in alla if contains(r,(x['x'],x['y']))]; sel=byn if byn else byg
  piv=next((x for x in centers if x in sel),None); aw=[]
  if not sel: aw.append('No anchors matched')
  if not piv: no_pivot.append(r['name']); aw.append('Missing center pivot; fallback to rect center'); piv={'x':r['x']+r['w']/2,'y':r['y']+r['h']/2,'name':'rect_center_fallback'}
  at,sa=cls(r['id']); anch={norm(x['name']):{'x':round(x['x']-r['x'],4),'y':round(x['y']-r['y'],4)} for x in sel}
  assets.append({'id':r['id'],'logicalName':r['id'],'file':f"{r['id']}.svg",'type':'frame_part','status':'static_base','sourceCutRect':{'x':r['x'],'y':r['y'],'w':r['w'],'h':r['h']},'viewBox':f"0 0 {fmt(r['w'])} {fmt(r['h'])}",'anchorType':at,'anchorPoint':{'x':round(piv['x']-r['x'],4),'y':round(piv['y']-r['y'],4)},'anchorOffset':{'x':round((piv['x']-r['x'])-r['w']/2,4),'y':round((piv['y']-r['y'])-r['h']/2,4)},'stretchAxis':sa,'anchors':anch,'warnings':aw})
 unmatched=[x['name'] for x in alla if not any(contains(r,(x['x'],x['y'])) for r in cuts)]
 print('=== DRY RUN SUMMARY ==='); print(f'Source: {src}'); print(f'Cut rect count: {len(cuts)}'); print('Cut rects:',', '.join(x['id'] for x in cuts)); print(f'Center anchors: {len(centers)}'); print(f'Join anchors: {len(joins)}'); print(f'Elements without match: {sum(1 for a in assets if not a["anchors"])}'); print(f'Anchors without match: {len(unmatched)}'); print('Cut rects without pivot:', no_pivot); [print('WARN:',w) for w in warns]
 if not a.extract: return
 out=Path(a.out); out.mkdir(parents=True,exist_ok=True); vis=[]; skipped=[]
 for ch in list(layers['grafika']):
  tag=ch.tag.split('}')[-1]
  if is_hidden(ch): skipped.append(f'hidden:{label(ch)}'); continue
  if tag=='image': skipped.append(f'image:{label(ch)}'); continue
  vis.append(copy.deepcopy(ch))
 for it in assets:
  r=next(x for x in cuts if x['id']==it['id'])
  svg=ET.Element(f'{{{SVG_NS}}}svg',{'version':'1.1','viewBox':f"0 0 {fmt(r['w'])} {fmt(r['h'])}",'width':fmt(r['w']),'height':fmt(r['h'])})
  defs=ET.SubElement(svg,f'{{{SVG_NS}}}defs'); cp=ET.SubElement(defs,f'{{{SVG_NS}}}clipPath',{'id':'clip'}); ET.SubElement(cp,f'{{{SVG_NS}}}rect',{'x':'0','y':'0','width':fmt(r['w']),'height':fmt(r['h'])})
  g=ET.SubElement(svg,f'{{{SVG_NS}}}g',{'clip-path':'url(#clip)','transform':f"translate({fmt(-r['x'])},{fmt(-r['y'])})"})
  for n in vis: g.append(copy.deepcopy(n))
  ET.ElementTree(svg).write(out/it['file'],encoding='utf-8',xml_declaration=True)
 mp=Path(a.manifest); mp.parent.mkdir(parents=True,exist_ok=True)
 mani={'sourceFile':str(src),'generatedAt':dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z'),'outputDir':str(out),'extractionMode':'clipPath','assetCount':len(assets),'assets':assets}
 mp.write_text(json.dumps(mani,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 rep=mp.parent/'prg_frame_extraction_report.md'
 lines=['# PRG Frame Extraction Report','',f'- Source: `{src}`',f'- Cut rect count: **{len(cuts)}**',f'- Generated SVG: **{len(assets)}**',f'- Center anchors: **{len(centers)}**',f'- Join anchors: **{len(joins)}**','','## Assets','','| name | output file | cut rect | anchors count | warnings |','|---|---|---|---:|---|']
 for it in assets:
  r=it['sourceCutRect']; lines.append(f"| {it['id']} | `{it['file']}` | ({fmt(r['x'])},{fmt(r['y'])},{fmt(r['w'])},{fmt(r['h'])}) | {len(it['anchors'])} | {'; '.join(it['warnings']) or '-'} |")
 lines+=['','## Unmatched anchors','']+([f"- {x}" for x in unmatched] or ['- none'])+['','## Cut rects without pivot/center','']+([f'- {x}' for x in no_pivot] or ['- none'])+['','## Skipped bitmap/hidden objects','']+([f'- {x}' for x in skipped] or ['- none'])+['','## Known limitations','- ClipPath/viewBox extraction, bez boolean/path cutting.','- Wsparcie transformacji ograniczone; complex rotate/skew tylko jako warning.']
 rep.write_text('\n'.join(lines)+'\n',encoding='utf-8')
 svgs=list(out.glob('*.svg')); assert len(svgs)==len(assets)
 for p in svgs:
  t=p.read_text(encoding='utf-8'); assert 'viewBox' in t and '<image' not in t
 assert mani['assetCount']==len(svgs)
 for it in assets: assert 'sourceCutRect' in it and (it['anchors'] or it['warnings'])

if __name__=='__main__': main()
