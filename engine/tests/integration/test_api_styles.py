import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import os

os.environ.setdefault("GCP_SERVICE_ACCOUNT_JSON", "{}")

from engine.api import app
from engine.domain import MythologicalEntity, Appearance

client = TestClient(app)

# -----------------------------------------------------------------------------
# Mocks & Fixtures
# -----------------------------------------------------------------------------

@pytest.fixture
def mock_vertex():
    """Mocks Vertex AI initialization and ImageModel."""
    with patch("engine.api.vertexai") as mock_v, \
         patch("engine.api.ImageGenerationModel") as mock_model_class:
        
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
    with patch("engine.api.save_mythology_data") as mock_save:
        yield mock_save

@pytest.fixture
def mock_orchestrator_data():
    """
    Injects controlled test data into the orchestrator.
    We need:
    1. 'CanonEntity': Has rendering.prompt_canon
    2. 'LegacyEntity': Has NO rendering, only appearance.prompt
    3. 'MangaEntity': Has rendering.prompt_variants with 'manga'
    4. 'Shango': Covered ethnicity for PromptBuilder + legacy regional prompt to ignore
    5. 'UnmappedRegionalEntity': Uncovered ethnicity + legacy regional prompt to ignore
    6. 'NoEthnicityEntity': Empty ethnicity + legacy regional prompt to ignore
    """
    from engine.domain import Origin, Identity, Attributes, Appearance, Story, Relations

    def make_entity(name, appearance_kwargs, rendering=None, origin=None, attributes=None):
        return MythologicalEntity(
            entity_type="Divinity",
            name=name,
            category="Test",
            origin=origin or Origin(country="Test", ethnicity="Test", pantheon="Test"),
            identity=Identity(gender="Test", cultural_role="Test", alignment="Test"),
            attributes=attributes or Attributes(domains=[], symbols=[], power_objects=[], symbolic_animals=[]),
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

    shango_entity = make_entity(
        name="Shango",
        appearance_kwargs={"imageUrl": "", "image_generation_prompt": "Legacy Shango Prompt"},
        origin=Origin(country="Nigeria", ethnicity="Yoruba", pantheon="Orisha"),
        attributes=Attributes(
            domains=[],
            symbols=["Double-headed axe", "Red and White Beads"],
            power_objects=["Oshe Shango"],
            symbolic_animals=[],
        ),
        rendering={
            "prompt_variants": [
                {"style_id": "regional_or_ethnic", "prompt": "LEGACY REGIONAL PROMPT SHOULD BE IGNORED"}
            ],
            "images": {}
        }
    )

    unmapped_regional_entity = make_entity(
        name="UnmappedRegionalEntity",
        appearance_kwargs={"imageUrl": "", "image_generation_prompt": "Legacy Regional Prompt"},
        origin=Origin(country="Tanzania", ethnicity="Swahili", pantheon="Test"),
        attributes=Attributes(
            domains=[],
            symbols=["Crescent"],
            power_objects=["Ritual Staff"],
            symbolic_animals=[],
        ),
        rendering={
            "prompt_variants": [
                {"style_id": "regional_or_ethnic", "prompt": "LEGACY REGIONAL PROMPT SHOULD BE IGNORED"}
            ],
            "images": {}
        }
    )

    no_ethnicity_entity = make_entity(
        name="NoEthnicityEntity",
        appearance_kwargs={"imageUrl": "", "image_generation_prompt": "Legacy Regional Prompt"},
        origin=Origin(country="Test", ethnicity="", pantheon="Test"),
        attributes=Attributes(
            domains=[],
            symbols=["Bell"],
            power_objects=["Staff"],
            symbolic_animals=[],
        ),
        rendering={
            "prompt_variants": [
                {"style_id": "regional_or_ethnic", "prompt": "LEGACY REGIONAL PROMPT SHOULD BE IGNORED"}
            ],
            "images": {}
        }
    )

    # Patch the orchestrator's data directly
    with patch(
        "engine.api.orchestrator.data",
        [
            canon_entity,
            legacy_entity,
            manga_entity,
            shango_entity,
            unmapped_regional_entity,
            no_ethnicity_entity,
        ],
    ):
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


def test_preview_regional_or_ethnic_uses_prompt_builder_and_ignores_legacy_prompt(mock_orchestrator_data):
    response = client.get("/preview/Shango?style_id=regional_or_ethnic")
    assert response.status_code == 200
    data = response.json()
    assert "Classical Yoruba sacred sculpture" in data["prompt"]
    assert "Double-headed axe" in data["prompt"]
    assert "LEGACY REGIONAL PROMPT SHOULD BE IGNORED" not in data["prompt"]


def test_preview_regional_or_ethnic_unmapped_ethnicity_returns_empty_prompt(mock_orchestrator_data):
    response = client.get("/preview/UnmappedRegionalEntity?style_id=regional_or_ethnic")
    assert response.status_code == 200
    data = response.json()
    assert data["prompt"] == ""


def test_preview_regional_or_ethnic_empty_ethnicity_returns_empty_prompt(mock_orchestrator_data):
    response = client.get("/preview/NoEthnicityEntity?style_id=regional_or_ethnic")
    assert response.status_code == 200
    data = response.json()
    assert data["prompt"] == ""

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


def test_generate_regional_or_ethnic_uses_dynamic_prompt_and_persists(mock_vertex, mock_loader, mock_orchestrator_data):
    payload = {"entity_name": "Shango", "style_id": "regional_or_ethnic"}
    response = client.post("/generate", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["image_url"].endswith("/generated_images/shango_regional_or_ethnic.png")
    assert "Classical Yoruba sacred sculpture" in data["prompt_used"]
    assert "Double-headed axe" in data["prompt_used"]
    assert "LEGACY REGIONAL PROMPT SHOULD BE IGNORED" not in data["prompt_used"]
    assert "Classical Yoruba sacred sculpture" in mock_vertex.generate_images.call_args.kwargs["prompt"]

    saved_data = mock_loader.call_args[0][0]
    target = next(e for e in saved_data if e.name == "Shango")
    assert target.rendering["images"]["regional_or_ethnic"] == data["image_url"]
    assert target.appearance.imageUrl == ""


def test_generate_regional_or_ethnic_unmapped_ethnicity_returns_400(mock_vertex, mock_orchestrator_data):
    payload = {"entity_name": "UnmappedRegionalEntity", "style_id": "regional_or_ethnic"}
    response = client.post("/generate", json=payload)
    assert response.status_code == 400
    assert "No prompt available" in response.json()["detail"]
    mock_vertex.generate_images.assert_not_called()


def test_generate_regional_or_ethnic_empty_ethnicity_returns_400(mock_vertex, mock_orchestrator_data):
    payload = {"entity_name": "NoEthnicityEntity", "style_id": "regional_or_ethnic"}
    response = client.post("/generate", json=payload)
    assert response.status_code == 400
    assert "No prompt available" in response.json()["detail"]
    mock_vertex.generate_images.assert_not_called()
