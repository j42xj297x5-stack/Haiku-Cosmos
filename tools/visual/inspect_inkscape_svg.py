#!/usr/bin/env python3
"""Inkscape-aware SVG structure inspector for PRG/frame diagnostics."""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass
from pathlib import Path
import xml.etree.ElementTree as ET

INKSCAPE_NS = "http://www.inkscape.org/namespaces/inkscape"
SVG_NS = "http://www.w3.org/2000/svg"
XLINK_NS = "http://www.w3.org/1999/xlink"

GEOMETRY_TAGS = {"path", "line", "polyline", "polygon", "rect", "circle", "ellipse", "use"}
GROUP_TAGS = {"g", "svg"}
KEYWORDS = ["grafika", "sciezka", "ścieżka", "obraz"]
FIGMA_ID_PATTERN = re.compile(r"(^|[-_:])(figma|vector|node|frame|group)([-_:]|$)", re.IGNORECASE)


@dataclass
class GroupInfo:
    depth: int
    path: str
    tag: str
    element_id: str | None
    label: str | None
    groupmode: str | None
    transform: str | None
    display: str | None
    visibility: str | None
    opacity: str | None
    hidden: bool
    direct_geometry_count: int
    recursive_geometry_count: int
    bbox_estimate: dict[str, float] | None


def local_name(tag: str) -> str:
    return tag.split("}", 1)[1] if tag.startswith("{") else tag


def parse_style_attr(style_val: str | None) -> dict[str, str]:
    if not style_val:
        return {}
    parts = [p.strip() for p in style_val.split(";") if p.strip()]
    out: dict[str, str] = {}
    for item in parts:
        if ":" not in item:
            continue
        k, v = item.split(":", 1)
        out[k.strip()] = v.strip()
    return out


def is_hidden(el: ET.Element) -> bool:
    style = parse_style_attr(el.attrib.get("style"))
    display = el.attrib.get("display", style.get("display", "")).strip().lower()
    visibility = el.attrib.get("visibility", style.get("visibility", "")).strip().lower()
    opacity_raw = el.attrib.get("opacity", style.get("opacity", "")).strip()
    if display == "none" or visibility == "hidden":
        return True
    if opacity_raw:
        try:
            return float(opacity_raw) == 0.0
        except ValueError:
            return False
    return False


def extract_numeric_values(el: ET.Element) -> list[float]:
    nums: list[float] = []
    for key in ("x", "y", "x1", "y1", "x2", "y2", "width", "height", "cx", "cy", "r", "rx", "ry", "d", "points"):
        v = el.attrib.get(key)
        if not v:
            continue
        nums.extend(float(m.group(0)) for m in re.finditer(r"[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?", v))
    return nums


def estimate_bbox(el: ET.Element) -> dict[str, float] | None:
    nums = extract_numeric_values(el)
    if len(nums) < 2:
        return None
    return {"min": min(nums), "max": max(nums)}


def inspect_groups(root: ET.Element) -> tuple[list[GroupInfo], dict[str, bool], list[dict[str, str | int | None]]]:
    groups: list[GroupInfo] = []
    geometry_nodes: list[dict[str, str | int | None]] = []
    has_label = False
    figma_like = False
    hidden_groups_present = False

    def walk(node: ET.Element, depth: int, path: str) -> int:
        nonlocal has_label, figma_like, hidden_groups_present
        tag = local_name(node.tag)
        nid = node.attrib.get("id")
        label = node.attrib.get(f"{{{INKSCAPE_NS}}}label")
        groupmode = node.attrib.get(f"{{{INKSCAPE_NS}}}groupmode")
        if label:
            has_label = True
        if (nid and FIGMA_ID_PATTERN.search(nid)) or (label and FIGMA_ID_PATTERN.search(label)):
            figma_like = True

        direct = 0
        recursive = 0
        for child in list(node):
            ctag = local_name(child.tag)
            child_path = f"{path}/{ctag}:{child.attrib.get('id', '(no-id)')}"
            child_recursive = walk(child, depth + 1, child_path)
            recursive += child_recursive
            if ctag in GEOMETRY_TAGS:
                direct += 1
                geometry_nodes.append({
                    "tag": ctag,
                    "id": child.attrib.get("id"),
                    "label": child.attrib.get(f"{{{INKSCAPE_NS}}}label"),
                    "depth": depth + 1,
                    "parent": path,
                })

        recursive += direct

        if tag in GROUP_TAGS:
            style = parse_style_attr(node.attrib.get("style"))
            display = node.attrib.get("display", style.get("display"))
            visibility = node.attrib.get("visibility", style.get("visibility"))
            opacity = node.attrib.get("opacity", style.get("opacity"))
            hidden = is_hidden(node)
            if hidden:
                hidden_groups_present = True
            groups.append(
                GroupInfo(
                    depth=depth,
                    path=path,
                    tag=tag,
                    element_id=nid,
                    label=label,
                    groupmode=groupmode,
                    transform=node.attrib.get("transform"),
                    display=display,
                    visibility=visibility,
                    opacity=opacity,
                    hidden=hidden,
                    direct_geometry_count=direct,
                    recursive_geometry_count=recursive,
                    bbox_estimate=estimate_bbox(node),
                )
            )
        return recursive

    walk(root, 0, f"{local_name(root.tag)}:{root.attrib.get('id', '(no-id)')}")
    return groups, {
        "has_inkscape_label": has_label,
        "has_figma_like_names": figma_like,
        "has_hidden_groups": hidden_groups_present,
    }, geometry_nodes


def build_report(svg_path: Path, source_label: str | None, source_id: str | None) -> dict:
    tree = ET.parse(svg_path)
    root = tree.getroot()
    txt = svg_path.read_text(encoding="utf-8", errors="ignore")
    has_inkscape_ns = "xmlns:inkscape" in txt
    has_base64 = "base64," in txt
    has_image = "<image" in txt or f"{{{SVG_NS}}}image" in txt

    groups, flags, geometry_nodes = inspect_groups(root)

    candidates_keyword = []
    for g in groups:
        hay = f"{(g.label or '').lower()} {(g.element_id or '').lower()}"
        if any(k in hay for k in KEYWORDS):
            candidates_keyword.append(g)

    top_geometry = sorted(groups, key=lambda x: x.recursive_geometry_count, reverse=True)[:20]
    source_label_match = [g for g in groups if source_label and (g.label or "") == source_label]
    source_id_match = [g for g in groups if source_id and (g.element_id or "") == source_id]

    warnings = []
    if flags["has_inkscape_label"] and any((not g.element_id and g.label) or (g.label and g.label != g.element_id) for g in groups):
        warnings.append("Wykryto inkscape:label rozne od id; Plain SVG moze utracic nazwy robocze warstw.")
    if has_inkscape_ns and not flags["has_inkscape_label"]:
        warnings.append("Namespace Inkscape istnieje, ale brak inkscape:label.")
    if flags["has_hidden_groups"]:
        warnings.append("Wykryto ukryte grupy/layers (display:none/visibility:hidden/opacity:0).")

    return {
        "svgPath": str(svg_path),
        "summary": {
            "hasInkscapeNamespace": has_inkscape_ns,
            "hasInkscapeLabel": flags["has_inkscape_label"],
            "hasFigmaLikeNames": flags["has_figma_like_names"],
            "hasImageTag": has_image,
            "hasBase64": has_base64,
            "hasHiddenGroups": flags["has_hidden_groups"],
            "groupCount": len(groups),
            "geometryElementCount": len(geometry_nodes),
            "sourceLabelRequested": source_label,
            "sourceLabelFound": len(source_label_match) > 0,
            "sourceIdRequested": source_id,
            "sourceIdFound": len(source_id_match) > 0,
        },
        "warnings": warnings,
        "topGroupsByGeometry": [g.__dict__ for g in top_geometry],
        "keywordCandidates": [g.__dict__ for g in sorted(candidates_keyword, key=lambda x: x.recursive_geometry_count, reverse=True)],
        "sourceLabelMatches": [g.__dict__ for g in source_label_match],
        "sourceIdMatches": [g.__dict__ for g in source_id_match],
    }


def print_report(report: dict) -> None:
    s = report["summary"]
    print("=== Inkscape-aware SVG inspection report ===")
    for k in [
        "hasInkscapeNamespace",
        "hasInkscapeLabel",
        "hasFigmaLikeNames",
        "hasImageTag",
        "hasBase64",
        "hasHiddenGroups",
        "groupCount",
        "geometryElementCount",
        "sourceLabelRequested",
        "sourceLabelFound",
        "sourceIdRequested",
        "sourceIdFound",
    ]:
        print(f"- {k}: {s.get(k)}")

    print("\nTOP 20 groups by recursive geometry:")
    for i, g in enumerate(report["topGroupsByGeometry"], 1):
        print(
            f"{i:2d}. depth={g['depth']} tag={g['tag']} id={g['element_id']} label={g['label']} "
            f"groupmode={g['groupmode']} direct={g['direct_geometry_count']} rec={g['recursive_geometry_count']} "
            f"hidden={g['hidden']}"
        )

    print("\nTOP keyword candidates:")
    for i, g in enumerate(report["keywordCandidates"][:20], 1):
        print(f"{i:2d}. id={g['element_id']} label={g['label']} rec={g['recursive_geometry_count']} path={g['path']}")

    if report["warnings"]:
        print("\nWarnings:")
        for w in report["warnings"]:
            print(f"- {w}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspect Inkscape SVG layers/groups for reliable source extraction.")
    parser.add_argument("svg", type=Path, help="Path to source SVG file")
    parser.add_argument("--source-label", dest="source_label", help="Exact inkscape:label to verify")
    parser.add_argument("--source-id", dest="source_id", help="Exact id to verify")
    parser.add_argument("--json-report", dest="json_report", type=Path, help="Path to write JSON report")
    args = parser.parse_args()

    report = build_report(args.svg, args.source_label, args.source_id)
    print_report(report)

    if args.json_report:
        args.json_report.parent.mkdir(parents=True, exist_ok=True)
        args.json_report.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"\nJSON report saved: {args.json_report}")


if __name__ == "__main__":
    main()
