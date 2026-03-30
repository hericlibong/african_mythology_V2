"""
Tests for issue #24: Cultural schema validation.
Validates that mythology_data.json conforms to the cultural trigger fields
defined in Contract V2 (origin.cultural_region, type_specific alignment, etc.).
"""
import json
import pytest
from pathlib import Path

DATA_PATH = Path(__file__).parent.parent / "src" / "data" / "mythology_data.json"

@pytest.fixture(scope="module")
def entities():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_all_entities_have_cultural_region_field(entities):
    """Every entity must have origin.cultural_region (can be empty)."""
    for e in entities:
        assert "cultural_region" in e["origin"], (
            f'{e["name"]}: missing origin.cultural_region'
        )


def test_cultural_region_is_string(entities):
    """cultural_region must be a string, never null or other type."""
    for e in entities:
        cr = e["origin"]["cultural_region"]
        assert isinstance(cr, str), (
            f'{e["name"]}: cultural_region is {type(cr).__name__}, expected str'
        )


def test_type_specific_matches_entity_type(entities):
    """The key inside type_specific must match the lowercase entity_type."""
    for e in entities:
        ts = e.get("type_specific", {})
        if not ts:
            continue
        et_lower = e["entity_type"].lower()
        assert et_lower in ts, (
            f'{e["name"]}: entity_type is {e["entity_type"]} but type_specific '
            f'has keys {list(ts.keys())}'
        )


def test_origin_required_fields(entities):
    """Every entity must have country, ethnicity, pantheon in origin."""
    for e in entities:
        origin = e["origin"]
        for field in ("country", "ethnicity", "pantheon"):
            assert field in origin and isinstance(origin[field], str), (
                f'{e["name"]}: origin.{field} missing or not a string'
            )


def test_no_truncated_pantheons(entities):
    """Pantheon values should not be single generic words like 'East' or 'Southern'."""
    disallowed = {"East", "Southern", "West", "North"}
    for e in entities:
        pantheon = e["origin"]["pantheon"]
        assert pantheon not in disallowed, (
            f'{e["name"]}: pantheon "{pantheon}" looks truncated'
        )
