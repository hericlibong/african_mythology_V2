import json
from pathlib import Path

DATA_PATH = Path("src/data/mythology_data.json")

STYLES = [
    {"style_id": "regional_or_ethnic", "label": "Regional/Ethnic Style"},
    {"style_id": "manga", "label": "Manga Style"},
    {"style_id": "comic_marvel", "label": "Comic Book Style"},
    {"style_id": "modern_african_painting", "label": "Modern African Art"}
]

def normalize_entity(entity):
    # 1. Ensure type_specific block
    if "type_specific" not in entity:
        entity["type_specific"] = {}
        
    # Migrate legacy root-level type fields if they exist (handling transitional state)
    # The current code might have some entities with 'divinity' at root but no 'type_specific' wrapper if manual edits happened,
    # but based on previous turns we added them inside or at root? 
    # Contract V2 types says: type_specific?: { divinity?: ... } AND divinity?: ...
    # But for CLEAN normalization, we should prefer the container user structure if that's the canonical V2 target.
    # The previous implementation plan showed nested: "type_specific": { "divinity": ... }
    
    e_type = entity.get("entity_type", "Unknown")
    type_key = e_type.lower() # divinity, hero, creature

    # If the specific block doesn't exist in type_specific, create it
    if type_key not in entity["type_specific"]:
        # Check if it exists at root (legacy/transitional) and move it? 
        # Or just create empty structure.
        # User said "même si certaines valeurs restent vides".
        
        specific_data = {}
        
        # Move specific root fields if they happen to exist (unlikely for pure V1, but good for safety)
        if type_key in entity:
             specific_data = entity.pop(type_key)
        
        # Populate skeleton based on type
        if type_key == "divinity":
            if "cult" not in specific_data: specific_data["cult"] = {"offerings": [], "taboos": []}
            if "domains" not in specific_data: specific_data["domains"] = []
        elif type_key == "hero":
            if "titles" not in specific_data: specific_data["titles"] = []
            if "achievements" not in specific_data: specific_data["achievements"] = []
            if "weapons_or_artifacts" not in specific_data: specific_data["weapons_or_artifacts"] = []
            if "legacy" not in specific_data: specific_data["legacy"] = ""
        elif type_key == "creature":
            if "habitat" not in specific_data: specific_data["habitat"] = []
            if "powers" not in specific_data: specific_data["powers"] = []
            if "size" not in specific_data: specific_data["size"] = ""
            
        entity["type_specific"][type_key] = specific_data

    # 2. Ensure rendering block
    if "rendering" not in entity:
        # Use existing image prompt as canon default if available
        existing_prompt = entity.get("appearance", {}).get("image_generation_prompt", "")
        
        entity["rendering"] = {
            "prompt_canon": existing_prompt,
            "prompt_variants": []
        }

    # 3. Ensure prompt_variants has 4 styles
    # We don't overwrite existing variants, just ensure the list exists and has the required styles if missing
    existing_styles = {v["style_id"] for v in entity["rendering"]["prompt_variants"]}
    
    for style in STYLES:
        if style["style_id"] not in existing_styles:
            # Add skeletal variant
            entity["rendering"]["prompt_variants"].append({
                "style_id": style["style_id"],
                "label": style["label"],
                "prompt": "" # Start empty as requested
            })

    return entity

def main():
    if not DATA_PATH.exists():
        print(f"Error: {DATA_PATH} not found.")
        return

    print("Loading data...")
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Normalizing {len(data)} entities...")
    normalized_data = [normalize_entity(item) for item in data]

    print("Saving normalized data...")
    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(normalized_data, f, indent=2, ensure_ascii=False)
    
    print("Done.")

if __name__ == "__main__":
    main()
