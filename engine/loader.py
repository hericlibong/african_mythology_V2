import json
from pathlib import Path
from typing import List
from domain import MythologicalEntity

# Path resolution: engine/loader.py -> parent -> parent -> src/data/mythology_data.json
DATA_PATH = Path(__file__).parent.parent / "src" / "data" / "mythology_data.json"

def load_mythology_data() -> List[MythologicalEntity]:
    """Loads the mythology data from the JSON file and validates it against the usage model."""
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Database file not found at {DATA_PATH.resolve()}")
    
    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        raw_data = json.load(f)
    
    return [MythologicalEntity(**item) for item in raw_data]

def save_mythology_data(data: List[MythologicalEntity]):
    """Saves the mythology data back to the JSON file."""
    # Convert Pydantic models to dicts
    dict_data = [entity.model_dump() for entity in data]
    
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(dict_data, f, indent=2, ensure_ascii=False)
