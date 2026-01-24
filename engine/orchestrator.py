from typing import List, Tuple
from domain import MythologicalEntity
from loader import load_mythology_data

class ImageOrchestrator:
    def __init__(self):
        try:
            self.data: List[MythologicalEntity] = load_mythology_data()
        except Exception as e:
            print(f"Failed to load data: {e}")
            self.data = []

    def get_missing_images(self) -> List[MythologicalEntity]:
        """Returns a list of entities that have no imageUrl."""
        return [
            entity for entity in self.data 
            if not entity.appearance.imageUrl or entity.appearance.imageUrl.strip() == ""
        ]

    def analyze_status(self) -> Tuple[int, int]:
        """Returns (total_entities, missing_images_count)."""
        missing = self.get_missing_images()
        return len(self.data), len(missing)
    
    def get_prompt_preview(self, entity_name: str) -> str:
        """Returns the prompt for a specific entity."""
        for entity in self.data:
            if entity.name.lower() == entity_name.lower():
                return entity.appearance.image_generation_prompt
        return "Entity not found."
