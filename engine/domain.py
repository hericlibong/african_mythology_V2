from typing import List, Optional
from pydantic import BaseModel, Field

class Origin(BaseModel):
    country: str
    ethnicity: str
    pantheon: str

class Identity(BaseModel):
    gender: str
    cultural_role: str
    alignment: str

class Attributes(BaseModel):
    domains: List[str]
    symbols: List[str]
    power_objects: List[str]
    symbolic_animals: List[str]

class Appearance(BaseModel):
    physical_signs: List[str]
    manifestations: str
    image_generation_prompt: str
    imageUrl: str = ""

class Story(BaseModel):
    description: str
    characteristics: List[str]

class Relations(BaseModel):
    parents: List[str]
    conjoint: List[str]
    descendants: List[str]

class MythologicalEntity(BaseModel):
    entity_type: str
    name: str
    category: str
    origin: Origin
    identity: Identity
    attributes: Attributes
    appearance: Appearance
    story: Story
    relations: Relations

class ImageGenerationRequest(BaseModel):
    entity_name: str
    prompt: str
    status: str = "pending"  # pending, generating, done, error
