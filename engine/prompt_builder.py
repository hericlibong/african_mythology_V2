import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from engine.domain import MythologicalEntity


STYLE_MATRIX_PATH = Path(__file__).parent.parent / "src" / "data" / "styles_matrix.json"


def load_style_matrix() -> Dict[str, Dict[str, Any]]:
    with open(STYLE_MATRIX_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def resolve_style_rules(
    style_matrix: Dict[str, Dict[str, Any]],
    ethnicity: str,
) -> Optional[Dict[str, Any]]:
    if not ethnicity or ethnicity not in style_matrix:
        return None

    return _resolve_entry(style_matrix, ethnicity)


def build_subject_description(entity: MythologicalEntity) -> str:
    parts = [f"{entity.name}, {entity.category.lower()}"]

    symbols = _take_items(entity.attributes.symbols, 2)
    power_objects = _take_items(entity.attributes.power_objects, 1)
    physical_signs = _take_items(entity.appearance.physical_signs, 2)

    if symbols:
        parts.append(f"with {_join_items(symbols)}")
    if power_objects:
        parts.append(f"holding {_join_items(power_objects)}")
    if physical_signs:
        parts.append(f"showing {_join_items(physical_signs)}")

    return ", ".join(parts)


def build_prompt(
    entity: MythologicalEntity,
    style_matrix: Optional[Dict[str, Dict[str, Any]]] = None,
) -> Optional[str]:
    ethnicity = (entity.origin.ethnicity or "").strip()
    if not ethnicity:
        return None

    matrix = style_matrix or load_style_matrix()
    resolved_style = resolve_style_rules(matrix, ethnicity)
    if not resolved_style:
        return None

    prompt_parts = [
        resolved_style["visual_signature"],
        f"Concept: {resolved_style['visual_philosophy']['concept']}.",
        f"Geometry: {resolved_style['visual_philosophy']['geometry']}.",
        f"Proportions: {resolved_style['visual_philosophy']['proportions']}.",
        f"Materials: {_join_items(resolved_style['material_science']['primary'])}.",
        f"Textiles: {_join_items(resolved_style['material_science']['textiles'])}.",
        f"Ritual elements: {_join_items(resolved_style['material_science']['rituals'])}.",
        f"Techniques: {_join_items(resolved_style['surface_and_finish']['technique'])}.",
        f"Finish: {_join_items(resolved_style['surface_and_finish']['finish'])}.",
        f"Tactile feel: {_join_items(resolved_style['surface_and_finish']['tactile_feel'])}.",
        f"Lighting: {_join_items(resolved_style['atmosphere']['lighting'])}.",
        f"Context: {_join_items(resolved_style['atmosphere']['context'])}.",
        f"Palette: {_join_items(resolved_style['atmosphere']['color_palette'])}.",
        f"Required: {_join_items(resolved_style['constraints']['mandatory'])}.",
        f"Depicting {build_subject_description(entity)}.",
    ]

    forbidden = resolved_style["constraints"].get("forbidden", [])
    if forbidden:
        prompt_parts.append(f"Avoid: {_join_items(forbidden)}.")

    return " ".join(prompt_parts)


def _resolve_entry(
    style_matrix: Dict[str, Dict[str, Any]],
    key: str,
) -> Dict[str, Any]:
    entry = style_matrix[key]
    parent_key = entry.get("inherits")
    if not parent_key:
        return dict(entry)

    parent = _resolve_entry(style_matrix, parent_key)
    child = {k: v for k, v in entry.items() if k != "inherits"}
    merged = _merge_values(parent, child)
    return merged


def _merge_values(base: Any, specific: Any) -> Any:
    if isinstance(base, dict) and isinstance(specific, dict):
        merged = dict(base)
        for key, value in specific.items():
            if key in merged:
                merged[key] = _merge_values(merged[key], value)
            else:
                merged[key] = value
        return merged

    if isinstance(base, list) and isinstance(specific, list):
        merged: List[Any] = []
        for item in base + specific:
            if item not in merged:
                merged.append(item)
        return merged

    return specific


def _take_items(values: List[str], limit: int) -> List[str]:
    return [value.strip() for value in values if value and value.strip()][:limit]


def _join_items(items: List[str]) -> str:
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return f"{', '.join(items[:-1])}, and {items[-1]}"
