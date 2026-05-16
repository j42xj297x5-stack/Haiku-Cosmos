#!/usr/bin/env python3
from __future__ import annotations
import argparse, re, json
from pathlib import Path

GOLD = "#d8b54a"
ROOT = Path(__file__).resolve().parents[2]
FRAME_PARTS_DIR = ROOT / "assets/visual/prg/svg/frame_parts"
TARGET_FILES = [
"ornament_l.svg","ornament_u.svg","ornament_r.svg","ornament_d.svg",
"corner_lu.svg","corner_ru.svg","corner_ld.svg","corner_rd.svg",
"line_hlu.svg","line_hru.svg","line_hld.svg","line_hrd.svg",
"line_vlu.svg","line_vru.svg","line_vld.svg","line_vrd.svg","fill_center.svg"
]
BLACK = re.compile(r'^(#000|#000000|black|rgb\(0\s*,\s*0\s*,\s*0\s*\))$', re.I)
ATTR_RE = re.compile(r'\b(fill|stroke)\s*=\s*"([^"]*)"', re.I)
STYLE_RE = re.compile(r'\bstyle\s*=\s*"([^"]*)"', re.I)
STYLE_BLOCK_RE = re.compile(r'(<style\b[^>]*>)(.*?)(</style>)', re.I|re.S)
CSS_COLOR_RE = re.compile(r'(?P<prop>fill|stroke)\s*:\s*(?P<val>#000000|#000|black|rgb\(0\s*,\s*0\s*,\s*0\s*\))', re.I)

def swap_color(value:str)->str:
    return GOLD if BLACK.match(value.strip()) else value

def process_text(text:str):
    changes=[]
    def repl_attr(m):
        prop,val=m.group(1),m.group(2)
        if val.strip().lower()=="none":
            return m.group(0)
        new=swap_color(val)
        if new!=val: changes.append(f"attr:{prop}:{val}->{new}")
        return f'{prop}="{new}"'
    text=ATTR_RE.sub(repl_attr,text)

    def repl_style_attr(m):
        raw=m.group(1)
        def repl_css(cm):
            nv=GOLD
            ov=cm.group('val')
            if ov.strip().lower()=="none":
                return cm.group(0)
            changes.append(f"style:{cm.group('prop')}:{ov}->{nv}")
            return f"{cm.group('prop')}:{nv}"
        new=CSS_COLOR_RE.sub(repl_css,raw)
        return f'style="{new}"'
    text=STYLE_RE.sub(repl_style_attr,text)

    def repl_style_block(m):
        head,css,tail=m.group(1),m.group(2),m.group(3)
        def repl_css(cm):
            ov=cm.group('val')
            changes.append(f"styleblock:{cm.group('prop')}:{ov}->{GOLD}")
            return f"{cm.group('prop')}:{GOLD}"
        new_css=CSS_COLOR_RE.sub(repl_css,css)
        return head+new_css+tail
    text=STYLE_BLOCK_RE.sub(repl_style_block,text)
    return text,changes

def audit(text:str):
    return {
      "hasBlackFill": bool(re.search(r'fill\s*=\s*"\s*(#000000|#000|black)\s*"',text,re.I)),
      "hasBlackStroke": bool(re.search(r'stroke\s*=\s*"\s*(#000000|#000|black)\s*"',text,re.I)),
      "hasStyleBlack": bool(re.search(r'(<style\b[^>]*>.*?(#000000|#000|black).*?</style>)|style\s*=\s*"[^"]*(#000000|#000|black)',text,re.I|re.S)),
      "pathCount": len(re.findall(r'<path\b',text,re.I)),
      "fillCount": len(re.findall(r'\bfill\s*=',text,re.I)),
      "strokeCount": len(re.findall(r'\bstroke\s*=',text,re.I)),
      "noneCount": len(re.findall(r'"none"',text,re.I)),
      "hasInlineStyleColor": bool(re.search(r'style\s*=\s*"[^"]*(fill|stroke)\s*:',text,re.I)),
      "hasStyleBlock": bool(re.search(r'<style\b',text,re.I)),
    }

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--check',action='store_true')
    ap.add_argument('--apply',action='store_true')
    args=ap.parse_args()
    rows=[]; modified=[]
    for name in TARGET_FILES:
        path=FRAME_PARTS_DIR/name
        text=path.read_text(encoding='utf-8')
        before=audit(text)
        new,changes=process_text(text)
        after=audit(new)
        rec={"file":name,**after,"recommendedFix":"replace black fill/stroke/style -> #d8b54a" if (before['hasBlackFill'] or before['hasBlackStroke'] or before['hasStyleBlack']) else "none","changed":len(changes)}
        rows.append(rec)
        if args.apply and new!=text:
            path.write_text(new,encoding='utf-8')
            modified.append(name)
    print(json.dumps({"mode":"apply" if args.apply else "check","files":len(rows),"modified":modified,"rows":rows},indent=2))

if __name__=='__main__':
    main()
