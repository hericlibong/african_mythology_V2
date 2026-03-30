import json
from pathlib import Path


STYLE_MATRIX_PATH = Path(__file__).parent.parent / "src" / "data" / "styles_matrix.json"
EXPECTED_BLOCKS = {
    "visual_signature",
    "visual_philosophy",
    "material_science",
    "surface_and_finish",
    "atmosphere",
    "constraints",
}
EXPECTED_NESTED_KEYS = {
    "visual_philosophy": {"concept", "geometry", "proportions"},
    "material_science": {"primary", "textiles", "rituals"},
    "surface_and_finish": {"technique", "finish", "tactile_feel"},
    "atmosphere": {"lighting", "context", "color_palette"},
    "constraints": {"forbidden", "mandatory"},
}


def load_style_matrix():
    with open(STYLE_MATRIX_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


def test_style_matrix_json_is_valid():
    matrix = load_style_matrix()
    assert isinstance(matrix, dict)
    assert matrix


def test_style_matrix_has_default_entry():
    matrix = load_style_matrix()
    assert "DEFAULT" in matrix
    assert isinstance(matrix["DEFAULT"], dict)


def test_style_matrix_entries_have_expected_structure():
    matrix = load_style_matrix()

    for key, entry in matrix.items():
        assert isinstance(entry, dict), f"{key}: entry must be an object"
        assert set(entry).issubset(EXPECTED_BLOCKS | {"inherits"}), (
            f"{key}: unexpected keys {set(entry) - (EXPECTED_BLOCKS | {'inherits'})}"
        )

        for block in EXPECTED_BLOCKS:
            assert block in entry, f"{key}: missing block {block}"

        assert isinstance(entry["visual_signature"], str)
        assert entry["visual_signature"].strip(), f"{key}: visual_signature must be non-empty"

        for block, nested_keys in EXPECTED_NESTED_KEYS.items():
            nested = entry[block]
            assert isinstance(nested, dict), f"{key}: {block} must be an object"
            assert set(nested) == nested_keys, f"{key}: {block} must contain {nested_keys}"

            for nested_key in nested_keys:
                value = nested[nested_key]
                if isinstance(value, list):
                    assert value, f"{key}: {block}.{nested_key} must not be empty"
                    assert all(isinstance(item, str) and item.strip() for item in value), (
                        f"{key}: {block}.{nested_key} must contain non-empty strings"
                    )
                else:
                    assert isinstance(value, str) and value.strip(), (
                        f"{key}: {block}.{nested_key} must be a non-empty string"
                    )


def test_style_matrix_inheritance_targets_exist():
    matrix = load_style_matrix()

    for key, entry in matrix.items():
        inherits = entry.get("inherits")
        if not inherits:
            continue

        assert isinstance(inherits, str), f"{key}: inherits must be a string"
        assert inherits in matrix, f"{key}: inherits unknown key {inherits}"
        assert inherits != key, f"{key}: inherits cannot point to itself"
