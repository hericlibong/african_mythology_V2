import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import sys
import os

# Add engine directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from api import app
from domain import MythologicalEntity, Appearance

client = TestClient(app)

# -----------------------------------------------------------------------------
# Mocks & Fixtures
# -----------------------------------------------------------------------------

@pytest.fixture
def mock_vertex():
    """Mocks Vertex AI initialization and ImageModel."""
    with patch("api.vertexai") as mock_v, \
         patch("api.ImageGenerationModel") as mock_model_class:
        
        mock_v.init.return_value = None
        mock_model_instance = MagicMock()
        mock_model_class.from_pretrained.return_value = mock_model_instance
        
        # Setup default successful response
        mock_image = MagicMock()
        mock_response = MagicMock()
        mock_response.images = [mock_image]
        mock_model_instance.generate_images.return_value = mock_response
        
        yield mock_model_instance

@pytest.fixture
def mock_loader():
    """Mocks the save_mythology_data function."""
    with patch("api.save_mythology_data") as mock_save:
        yield mock_save

@pytest.fixture
def mock_orchestrator_data():
    """
    Injects controlled test data into the orchestrator.
    We need:
    1. 'CanonEntity': Has rendering.prompt_canon
    2. 'LegacyEntity': Has NO rendering, only appearance.prompt
    3. 'MangaEntity': Has rendering.prompt_variants with 'manga'
    """
    from domain import Origin, Identity, Attributes, Appearance, Story, Relations

    def make_entity(name, appearance_kwargs, rendering=None):
        return MythologicalEntity(
            entity_type="Divinity",
            name=name,
            category="Test",
            origin=Origin(country="Test", ethnicity="Test", pantheon="Test"),
            identity=Identity(gender="Test", cultural_role="Test", alignment="Test"),
            attributes=Attributes(domains=[], symbols=[], power_objects=[], symbolic_animals=[]),
            appearance=Appearance(
                physical_signs=[],
                manifestations="Test Manifestation",
                **appearance_kwargs
            ),
            story=Story(description="Test Story", characteristics=[]),
            relations=Relations(parents=[], conjoint=[], descendants=[]),
            rendering=rendering,
            type_specific={}
        )

    canon_entity = make_entity(
        name="CanonEntity",
        appearance_kwargs={"imageUrl": "", "image_generation_prompt": "Legacy Prompt"},
        rendering={
            "prompt_canon": "Canonical Photoreal Prompt",
            "images": {}
        }
    )

    legacy_entity = make_entity(
        name="LegacyEntity",
        appearance_kwargs={"imageUrl": "", "image_generation_prompt": "Legacy Only Prompt"},
        rendering={} # Empty rendering
    )

    manga_entity = make_entity(
        name="MangaEntity",
        appearance_kwargs={"imageUrl": "", "image_generation_prompt": "..."},
        rendering={
            "prompt_variants": [
                {"style_id": "manga", "prompt": "Manga Style Prompt"},
                {"style_id": "clay", "prompt": "Clay Style Prompt"}
            ],
            "images": {}
        }
    )

    # Patch the orchestrator's data directly
    with patch("api.orchestrator.data", [canon_entity, legacy_entity, manga_entity]):
        yield

# -----------------------------------------------------------------------------
# Preview Tests
# -----------------------------------------------------------------------------

def test_preview_photoreal_canon(mock_orchestrator_data):
    """
    Test 1: Preview 'photoreal' prioritizes rendering.prompt_canon if present.
    """
    response = client.get("/preview/CanonEntity?style_id=photoreal")
    assert response.status_code == 200
    data = response.json()
    assert data["prompt"] == "Canonical Photoreal Prompt"

def test_preview_photoreal_legacy_fallback(mock_orchestrator_data):
    """
    Test 2: Preview 'photoreal' falls back to appearance.image_generation_prompt if canon missing.
    """
    response = client.get("/preview/LegacyEntity?style_id=photoreal")
    assert response.status_code == 200
    data = response.json()
    assert data["prompt"] == "Legacy Only Prompt"

def test_preview_specific_style_variant(mock_orchestrator_data):
    """
    Test 3: Preview specific style (manga) retrieves correct variant.
    """
    response = client.get("/preview/MangaEntity?style_id=manga")
    assert response.status_code == 200
    data = response.json()
    assert data["prompt"] == "Manga Style Prompt"

def test_preview_unknown_style(mock_orchestrator_data):
    """
    Test 4: Preview unknown style returns 200 but empty prompt (Current Behavior).
    """
    # 'cyberpunk' does not exist on MangaEntity
    response = client.get("/preview/MangaEntity?style_id=cyberpunk")
    assert response.status_code == 200
    data = response.json()
    assert data["prompt"] == ""  # Logic returns empty string

# -----------------------------------------------------------------------------
# Generate Tests
# -----------------------------------------------------------------------------

def test_generate_unknown_style_error(mock_vertex, mock_orchestrator_data):
    """
    Test 5: Generate with unknown/empty style returns 400.
    """
    payload = {"entity_name": "MangaEntity", "style_id": "cyberpunk"}
    response = client.post("/generate", json=payload)
    assert response.status_code == 400
    assert "No prompt available" in response.json()["detail"]

def test_generate_photoreal_persistence(mock_vertex, mock_loader, mock_orchestrator_data):
    """
    Test 6: Generate 'photoreal' saves as 'name.png' and updates legacy field.
    """
    payload = {"entity_name": "CanonEntity", "style_id": "photoreal"}
    response = client.post("/generate", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    # Check Response
    image_url = data["image_url"]
    assert image_url.endswith("/generated_images/canonentity.png")
    
    # Check Persistence (Legacy Sync)
    # We inspect the arguments passed to save_mythology_data
    saved_data = mock_loader.call_args[0][0] # First arg of first call
    target = next(e for e in saved_data if e.name == "CanonEntity")
    
    # 1. Updates rendering
    assert target.rendering["images"]["photoreal"] == image_url
    # 2. Updates legacy appearance.imageUrl
    assert target.appearance.imageUrl == image_url

def test_generate_style_persistence(mock_vertex, mock_loader, mock_orchestrator_data):
    """
    Test 7: Generate 'manga' saves as 'name_manga.png' and DOES NOT touch legacy field.
    """
    payload = {"entity_name": "MangaEntity", "style_id": "manga"}
    response = client.post("/generate", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    # Check Response
    image_url = data["image_url"]
    assert image_url.endswith("/generated_images/mangaentity_manga.png")
    
    # Check Persistence
    saved_data = mock_loader.call_args[0][0]
    target = next(e for e in saved_data if e.name == "MangaEntity")
    
    # 1. Updates rendering
    assert target.rendering["images"]["manga"] == image_url
    # 2. DOES NOT Update legacy appearance.imageUrl (should remain empty as init in fixture)
    assert target.appearance.imageUrl == "" 
