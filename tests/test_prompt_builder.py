import json
from pathlib import Path

from engine.domain import Appearance, Attributes, Identity, MythologicalEntity, Origin, Relations, Story
from engine.prompt_builder import build_prompt, build_subject_description, load_style_matrix, resolve_style_rules


DATA_PATH = Path(__file__).parent.parent / "src" / "data" / "mythology_data.json"


def make_entity(
    *,
    name: str = "Test Entity",
    category: str = "Test Category",
    ethnicity: str = "Yoruba",
    symbols=None,
    power_objects=None,
    physical_signs=None,
):
    return MythologicalEntity(
        entity_type="Divinity",
        name=name,
        category=category,
        origin=Origin(country="Test Country", ethnicity=ethnicity, pantheon="Test Pantheon"),
        identity=Identity(gender="Other", cultural_role="Test Role", alignment="Neutral"),
        attributes=Attributes(
            domains=[],
            symbols=symbols or [],
            power_objects=power_objects or [],
            symbolic_animals=[],
        ),
        appearance=Appearance(
            physical_signs=physical_signs or [],
            manifestations="Test manifestation",
            image_generation_prompt="Legacy prompt",
            imageUrl="",
        ),
        story=Story(description="Test story", characteristics=[]),
        relations=Relations(parents=[], conjoint=[], descendants=[]),
        rendering={},
        type_specific={},
    )


def test_build_prompt_for_shango_uses_yoruba_style_and_subject_markers():
    entities = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    shango_data = next(entity for entity in entities if entity["name"] == "Shango")
    shango = MythologicalEntity(**shango_data)

    prompt = build_prompt(shango)

    assert prompt is not None
    assert "Classical Yoruba sacred sculpture" in prompt
    assert "historical realism" in prompt
    assert "Double-headed axe" in prompt
    assert "Depicting Shango" in prompt


def test_build_prompt_returns_none_when_ethnicity_is_present_but_unmapped():
    entity = make_entity(
        ethnicity="Swahili",
        symbols=["Crescent"],
        power_objects=["Ritual Staff"],
        physical_signs=["White robes"],
    )

    assert build_prompt(entity) is None


def test_build_prompt_returns_none_when_ethnicity_is_empty():
    entity = make_entity(
        ethnicity="",
        symbols=["Double-headed axe"],
        power_objects=["Oshe Shango"],
        physical_signs=["Regal red robes"],
    )

    assert build_prompt(entity) is None


def test_build_prompt_returns_none_when_ethnicity_is_none():
    entity = make_entity(
        symbols=["Double-headed axe"],
        power_objects=["Oshe Shango"],
        physical_signs=["Regal red robes"],
    )
    entity.origin.ethnicity = None

    assert build_prompt(entity) is None


def test_resolve_style_rules_merges_default_and_specific_entry():
    matrix = {
        "DEFAULT": {
            "visual_signature": "Base signature",
            "visual_philosophy": {
                "concept": "Base concept",
                "geometry": "Base geometry",
                "proportions": "Base proportions",
            },
            "material_science": {
                "primary": ["wood", "bronze"],
                "textiles": ["woven cloth"],
                "rituals": ["kaolin"],
            },
            "surface_and_finish": {
                "technique": ["carving"],
                "finish": ["aged patina"],
                "tactile_feel": ["textured"],
            },
            "atmosphere": {
                "lighting": ["museum light"],
                "context": ["shrine"],
                "color_palette": ["earth tones"],
            },
            "constraints": {
                "forbidden": ["cartoon"],
                "mandatory": ["material truth"],
            },
        },
        "Child": {
            "inherits": "DEFAULT",
            "visual_signature": "Child signature",
            "visual_philosophy": {
                "concept": "Child concept",
                "geometry": "Child geometry",
                "proportions": "Child proportions",
            },
            "material_science": {
                "primary": ["bronze", "cowrie"],
                "textiles": ["indigo cloth"],
                "rituals": ["palm oil"],
            },
            "surface_and_finish": {
                "technique": ["polishing"],
                "finish": ["glossy"],
                "tactile_feel": ["alive"],
            },
            "atmosphere": {
                "lighting": ["oil lamps"],
                "context": ["altar"],
                "color_palette": ["deep red"],
            },
            "constraints": {
                "forbidden": ["sci-fi armor"],
                "mandatory": ["regal dignity"],
            },
        },
    }

    resolved = resolve_style_rules(matrix, "Child")

    assert resolved is not None
    assert resolved["visual_signature"] == "Child signature"
    assert resolved["material_science"]["primary"] == ["wood", "bronze", "cowrie"]
    assert resolved["constraints"]["forbidden"] == ["cartoon", "sci-fi armor"]
    assert resolved["constraints"]["mandatory"] == ["material truth", "regal dignity"]


def test_build_subject_description_is_short_deterministic_and_prioritized():
    entity = make_entity(
        name="Shango",
        category="Orisha of Lightning",
        symbols=["Double-headed axe", "Red and White Beads", "Ignored Symbol"],
        power_objects=["Oshe Shango", "Ignored Object"],
        physical_signs=["Regal red robes", "Eyes glowing like embers", "Ignored Sign"],
    )

    description = build_subject_description(entity)

    assert description == (
        "Shango, orisha of lightning, with Double-headed axe and Red and White Beads, "
        "holding Oshe Shango, showing Regal red robes and Eyes glowing like embers"
    )


def test_load_style_matrix_returns_expected_entries():
    matrix = load_style_matrix()

    assert "DEFAULT" in matrix
    assert "Yoruba" in matrix
    assert "Akan" in matrix
    assert "Kongo" in matrix
