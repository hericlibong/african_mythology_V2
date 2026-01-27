import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
import sys
import os
from google.api_core.exceptions import ResourceExhausted

# Add engine directory to sys.path so we can import api
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from api import app

client = TestClient(app)

@pytest.fixture
def mock_vertex():
    """Mocks Vertex AI initialization and ImageModel."""
    with patch("api.vertexai") as mock_v, \
         patch("api.ImageGenerationModel") as mock_model_class:
        
        # Mock vertexai.init
        mock_v.init.return_value = None
        
        # Mock the model instance and generate_images
        mock_model_instance = MagicMock()
        mock_model_class.from_pretrained.return_value = mock_model_instance
        
        yield mock_model_instance

@pytest.fixture
def mock_loader():
    """Mocks the save_mythology_data function to prevent writing to disk."""
    with patch("api.save_mythology_data") as mock_save:
        yield mock_save

def test_generate_image_success(mock_vertex, mock_loader):
    """
    Test 1: Backend Integration POST /generate (Success case)
    Verifies that the API returns 200 and a valid JSON URL when Vertex AI returns an image.
    """
    # Setup the mock response
    mock_image = MagicMock()
    
    # Create a proper response object mock with .images attribute
    mock_response = MagicMock()
    mock_response.images = [mock_image]
    
    # Configure the generate_images method to return our mock response
    mock_vertex.generate_images.return_value = mock_response

    # Payload
    payload = {"entity_name": "Shango"}
    
    # Make request
    response = client.post("/generate", json=payload)
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    # The URL should look like /generated_images/shango.png
    assert "/generated_images/shango.png" in data["image_url"]
    
    # Verify Vertex AI was called correctly
    mock_vertex.generate_images.assert_called_once()
    
    # Verify Image.save was called (this 'saves' the image to disk, but it's a mock)
    # We check that .save() was called on the image object returned by the generated list
    mock_image.save.assert_called_once()
    
    # Verify database update was triggered
    mock_loader.assert_called_once()

def test_generate_image_safety_filter(mock_vertex, mock_loader):
    """
    Test 2: Backend Integration POST /generate (Safety Filter/Empty case)
    Verifies that the API returns 502 when Vertex AI returns an empty list (Safety Filter).
    """
    # Setup mock response with empty images list
    mock_response = MagicMock()
    mock_response.images = [] # Empty list simulates safety filter trigger
    
    mock_vertex.generate_images.return_value = mock_response

    payload = {"entity_name": "Shango"}
    response = client.post("/generate", json=payload)

    # Assertions for Safety Filter handling
    assert response.status_code == 502
    data = response.json()
    assert data["status"] == "error"
    assert "safety filter" in data["message"]
    
    # Verify save wasn't called since no image
    mock_loader.assert_not_called()

def test_generate_image_quota_exceeded(mock_vertex, mock_loader):
    """
    Test 3: Backend Integration POST /generate (Quota Exceeded case)
    Verifies that the API returns 429 when Vertex AI raises ResourceExhausted.
    """
    # Configure mock to raise ResourceExhausted
    # We need to provide a message to the exception, usually it takes a message
    mock_vertex.generate_images.side_effect = ResourceExhausted("Quota exceeded")

    payload = {"entity_name": "Shango"}
    response = client.post("/generate", json=payload)

    # Assertions
    assert response.status_code == 429
    data = response.json()
    assert data["status"] == "error"
    assert data["error"] == "quota_exceeded"
    assert "Quota reached" in data["message"]
    
    # Verify save wasn't called
    mock_loader.assert_not_called()
