import pytest
import json
import shutil
from pathlib import Path
from engine.domain import MythologicalEntity
from engine.loader import load_mythology_data, save_mythology_data

# Mock data path to avoid overwriting real data
TEST_DATA_PATH = Path("tests/fixtures/test_mythology_data.json")
BACKUP_PATH = Path("tests/fixtures/test_mythology_data.backup")

@pytest.fixture
def mock_loader_data_path(monkeypatch, tmp_path):
    """Mocks the DATA_PATH in engine.loader to use a temp file."""
    # Create a temp file with V2 content
    v2_entity = {
        "entity_type": "Divinity",
        "name": "TestEntityV2",
        "category": "Test God",
        "origin": {
            "country": "TestCountry",
            "ethnicity": "TestEthnicity",
            "pantheon": "TestPantheon"
        },
        "identity": {
            "gender": "Other",
            "cultural_role": "Tester",
            "alignment": "Neutral"
        },
        "attributes": {
            "domains": ["Testing"],
            "symbols": ["Checkmark"],
            "power_objects": ["Pytest"],
            "symbolic_animals": ["Bug"]
        },
        "appearance": {
            "physical_signs": ["Glowing"],
            "manifestations": "Code",
            "image_generation_prompt": "Legacy Prompt"
        },
        "story": {
            "description": "A test entity.",
            "characteristics": ["Persistent"]
        },
        "relations": {
            "parents": [],
            "conjoint": [],
            "descendants": []
        },
        # --- Contract V2 Fields (Extras) ---
        "type_specific": {
            "divinity": {
                "cult": {
                    "offerings": ["Logs"],
                    "taboos": ["Bugs"]
                }
            }
        },
        "rendering": {
            "prompt_canon": "V2 Canon Prompt",
            "prompt_variants": [
                {"style_id": "manga", "prompt": "Manga Prompt"},
                {"style_id": "oil", "prompt": "Oil Prompt"}
            ]
        },
        "sources": [
             {"label": "Future Field", "url": "http://example.com"}
        ]
    }
    
    test_file = tmp_path / "mythology_data.json"
    with open(test_file, 'w') as f:
        json.dump([v2_entity], f)
        
    # Monkeypatch the DATA_PATH in engine.loader
    monkeypatch.setattr("engine.loader.DATA_PATH", test_file)
    return test_file

def test_round_trip_preserves_extras(mock_loader_data_path):
    """
    Verifies that load_mythology_data() -> save_mythology_data() 
    preserves 'type_specific', 'rendering', and 'sources' fields.
    """
    # 1. Load data
    loaded_entities = load_mythology_data()
    assert len(loaded_entities) == 1
    entity = loaded_entities[0]
    
    # 2. Save data (this is where data loss happens if model is strict)
    save_mythology_data(loaded_entities)
    
    # 3. Reload from file to verify persistence
    with open(mock_loader_data_path, 'r') as f:
        saved_data = json.load(f)
        
    saved_entity = saved_data[0]
    
    # 4. Assertions
    # Check regular fields
    assert saved_entity["name"] == "TestEntityV2"
    
    # Check Extra Fields
    assert "type_specific" in saved_entity, "type_specific field was dropped!"
    assert saved_entity["type_specific"]["divinity"]["cult"]["offerings"] == ["Logs"]
    
    assert "rendering" in saved_entity, "rendering field was dropped!"
    assert saved_entity["rendering"]["prompt_canon"] == "V2 Canon Prompt"
    
    assert "sources" in saved_entity, "sources (future field) was dropped!"
    assert saved_entity["sources"][0]["label"] == "Future Field"

if __name__ == "__main__":
    # Allow running directly without pytest for quick check if needed
    pass
