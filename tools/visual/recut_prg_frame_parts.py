#!/usr/bin/env python3
"""Recut PRG frame parts from Inkscape source layer by cut rectangles."""

from __future__ import annotations

import argparse
import json
import re
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
import xml.etree.ElementTree as ET

SVG_NS = "http://www.w3.org/2000/svg"
INK_NS = "http://www.inkscape.org/namespaces/inkscape"
GEOM_TAGS = {"path", "line", "polyline", "polygon", "rect", "circle", "ellipse", "use"}

ET.register_namespace("", SVG_NS)


def ln(tag: str) -> str:
    return tag.split("}", 1)[1] if tag.startswith("{") else tag


def parse_transform(transform: str | None) -> list[float]:
    # affine matrix [a,b,c,d,e,f]
    m = [1.0, 0.0, 0.0, 1.0, 0.0, 0.0]
    if not transform:
        return m
    for name, args in re.findall(r"(matrix|translate|scale)\s*\(([^\)]*)\)", transform):
        vals = [float(v) for v in re.findall(r"[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?", args)]
        if name == "matrix" and len(vals) == 6:
            n = vals
        elif name == "translate" and vals:
            tx = vals[0]
            ty = vals[1] if len(vals) > 1 else 0.0
            n = [1.0, 0.0, 0.0, 1.0, tx, ty]
        elif name == "scale" and vals:
            sx = vals[0]
            sy = vals[1] if len(vals) > 1 else sx
            n = [sx, 0.0, 0.0, sy, 0.0, 0.0]
        else:
            continue
        a, b, c, d, e, f = m
        a2, b2, c2, d2, e2, f2 = n
        m = [
            a * a2 + c * b2,
            b * a2 + d * b2,
            a * c2 + c * d2,
            b * c2 + d * d2,
            a * e2 + c * f2 + e,
            b * e2 + d * f2 + f,
        ]
    return m


def apply_mat(m: list[float], x: float, y: float) -> tuple[float, float]:
    a, b, c, d, e, f = m
    return (a * x + c * y + e, b * x + d * y + f)


def find_layer_by_label(root: ET.Element, label: str) -> ET.Element | None:
    for g in root.findall(f".//{{{SVG_NS}}}g"):
        if g.attrib.get(f"{{{INK_NS}}}label") == label:
            return g
    return None


def rect_bbox(rect: ET.Element, inherited_matrix: list[float]) -> dict:
    x = float(rect.attrib.get("x", "0"))
    y = float(rect.attrib.get("y", "0"))
    w = float(rect.attrib.get("width", "0"))
    h = float(rect.attrib.get("height", "0"))
    local_m = parse_transform(rect.attrib.get("transform"))
    # inherited then local
    m = [
        inherited_matrix[0] * local_m[0] + inherited_matrix[2] * local_m[1],
        inherited_matrix[1] * local_m[0] + inherited_matrix[3] * local_m[1],
        inherited_matrix[0] * local_m[2] + inherited_matrix[2] * local_m[3],
        inherited_matrix[1] * local_m[2] + inherited_matrix[3] * local_m[3],
        inherited_matrix[0] * local_m[4] + inherited_matrix[2] * local_m[5] + inherited_matrix[4],
        inherited_matrix[1] * local_m[4] + inherited_matrix[3] * local_m[5] + inherited_matrix[5],
    ]
    pts = [apply_mat(m, x, y), apply_mat(m, x + w, y), apply_mat(m, x, y + h), apply_mat(m, x + w, y + h)]
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return {
        "x": min(xs),
        "y": min(ys),
        "w": max(xs) - min(xs),
        "h": max(ys) - min(ys),
        "id": rect.attrib.get("id"),
        "label": rect.attrib.get(f"{{{INK_NS}}}label"),
        "transform": rect.attrib.get("transform"),
    }


def count_geom(root: ET.Element) -> int:
    return sum(1 for el in root.iter() if ln(el.tag) in GEOM_TAGS)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("svg", type=Path)
    args = parser.parse_args()

    repo = Path(__file__).resolve().parents[2]
    manifest_path = repo / "assets/visual/prg/prg_frame_manifest.json"
    metadata_path = repo / "assets/visual/prg/prg_frame_layout_metadata.json"
    parts_dir = repo / "assets/visual/prg/svg/frame_parts"

    tree = ET.parse(args.svg)
    root = tree.getroot()

    layer_source = find_layer_by_label(root, "grafika")
    layer_cut = find_layer_by_label(root, "ciecie")
    layer_center = find_layer_by_label(root, "kotwice-srodki")
    layer_anchor = find_layer_by_label(root, "punkty zaczepienia")

    if any(x is None for x in [layer_source, layer_cut, layer_center, layer_anchor]):
        raise SystemExit("STOP: missing required layers by label")

    cut_transform = parse_transform(layer_cut.attrib.get("transform"))
    cut_rects = []
    for child in list(layer_cut):
        tag = ln(child.tag)
        if tag == "rect":
            cut_rects.append(rect_bbox(child, cut_transform))
        elif tag == "path":
            raise SystemExit("PARTIAL: cut layer contains path; this tool requires rect cuts")

    if len(cut_rects) != 17:
        raise SystemExit(f"STOP: expected 17 cut rects, got {len(cut_rects)}")

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    assets = manifest.get("assets", [])
    if len(assets) != len(cut_rects):
        raise SystemExit(f"STOP: manifest asset count {len(assets)} != cut rect count {len(cut_rects)}")

    # map cuts to manifest assets by existing sourceCutRect.name when possible; fallback to geometry order
    name_to_rect = { (r.get("label") or "").strip().lower(): r for r in cut_rects if (r.get("label") or "").strip() }
    used = set()
    ordered_rects = []
    fallback_pool = sorted(cut_rects, key=lambda r: (round(r["y"], 3), round(r["x"], 3)))
    for asset in assets:
        target_name = ((asset.get("sourceCutRect") or {}).get("name") or "").strip().lower()
        matched = name_to_rect.get(target_name)
        if matched and id(matched) not in used:
            ordered_rects.append(matched)
            used.add(id(matched))
        else:
            nxt = next(r for r in fallback_pool if id(r) not in used)
            ordered_rects.append(nxt)
            used.add(id(nxt))
    cut_rects = ordered_rects

    source_children = [deepcopy(ch) for ch in list(layer_source) if ln(ch.tag) in GEOM_TAGS]
    if not source_children:
        raise SystemExit("STOP: source layer 'grafika' has no geometry")

    validation = []
    mapping = []
    for asset, rect in zip(assets, cut_rects):
        w = rect["w"]
        h = rect["h"]
        x = rect["x"]
        y = rect["y"]
        out_root = ET.Element(f"{{{SVG_NS}}}svg", {
            "width": f"{w:.6f}",
            "height": f"{h:.6f}",
            "viewBox": f"{x:.6f} {y:.6f} {w:.6f} {h:.6f}",
            "version": "1.1",
        })
        for ch in source_children:
            out_root.append(deepcopy(ch))
        out_path = parts_dir / asset["file"]
        ET.indent(out_root, space="  ")
        ET.ElementTree(out_root).write(out_path, encoding="utf-8", xml_declaration=True)

        txt = out_path.read_text(encoding="utf-8", errors="ignore")
        geom_count = count_geom(out_root)
        has_image = "<image" in txt
        has_base64 = "base64," in txt or "data:image" in txt
        has_hidden = any((el.attrib.get("display") == "none" or "display:none" in (el.attrib.get("style") or "")) for el in out_root.iter())
        status = "OK" if geom_count > 0 and not has_image and not has_base64 and w > 0 and h > 0 else "FAIL"
        validation.append({
            "file": asset["file"], "sourceCutRect": rect, "viewBox": out_root.attrib["viewBox"],
            "geometryElementCount": geom_count, "hasImage": has_image, "hasBase64": has_base64,
            "hasHiddenGeometry": has_hidden, "outputModel": "source-space-viewBox", "status": status, "notes": ""
        })
        mapping.append({"file": asset["file"], **rect})
        asset["sourceCutRect"] = {
            "x": round(x, 6), "y": round(y, 6), "w": round(w, 6), "h": round(h, 6),
            "id": rect.get("id"), "label": rect.get("label")
        }

    manifest["sourceFile"] = "svg/PRG-frame1.svg"
    manifest["sourceLayerId"] = layer_source.attrib.get("id")
    manifest["sourceLayerLabel"] = "grafika"
    manifest["cutLayerId"] = layer_cut.attrib.get("id")
    manifest["cutLayerLabel"] = "ciecie"
    manifest["assetCount"] = len(assets)
    manifest["generatedAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    manifest["status"] = "runtime_probe_recut_review"
    manifest["notes"] = ["Rect-to-file mapping used geometric order (top-to-bottom, left-to-right). Review in runtime probe."]
    manifest_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    metadata["status"] = "runtime_probe_recut_review"
    metadata.setdefault("notes", [])
    if "Recut based on layer1:grafika + layer2:ciecie (source-space viewBox)." not in metadata["notes"]:
        metadata["notes"].append("Recut based on layer1:grafika + layer2:ciecie (source-space viewBox).")
    metadata_path.write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print("SOURCE STRUCTURE")
    print(f"- source: id={layer_source.attrib.get('id')} label=grafika geom={sum(1 for e in layer_source.iter() if ln(e.tag) in GEOM_TAGS)}")
    print(f"- cut: id={layer_cut.attrib.get('id')} label=ciecie geom={sum(1 for e in layer_cut.iter() if ln(e.tag) in GEOM_TAGS)}")
    print(f"- center: id={layer_center.attrib.get('id')} label=kotwice-srodki geom={sum(1 for e in layer_center.iter() if ln(e.tag) in GEOM_TAGS)}")
    print(f"- anchor: id={layer_anchor.attrib.get('id')} label=punkty zaczepienia geom={sum(1 for e in layer_anchor.iter() if ln(e.tag) in GEOM_TAGS)}")
    print("\nRECT->FILE MAPPING")
    for row in mapping:
        print(f"{row['id']}|{row['label']}|{row['x']:.4f}|{row['y']:.4f}|{row['w']:.4f}|{row['h']:.4f} -> {row['file']}")
    print("\nVALIDATION")
    for row in validation:
        print(json.dumps(row, ensure_ascii=False))


if __name__ == "__main__":
    main()
