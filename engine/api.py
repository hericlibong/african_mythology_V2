from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import os
import vertexai
from vertexai.preview.vision_models import ImageGenerationModel
from orchestrator import ImageOrchestrator
from loader import save_mythology_data # Ensure loader exports this
from pathlib import Path

app = FastAPI(title="L'Esprit - African Mythology Engine API")

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = ImageOrchestrator()
PROJECT_ID = "livingafricanpantheon" # TODO: Make this configurable if needed
LOCATION = "us-central1"

# Initialize Vertex AI
try:
    vertexai.init(project=PROJECT_ID, location=LOCATION)
except Exception as e:
    print(f"Warning: Failed to initialize Vertex AI: {e}")

class GenerateRequest(BaseModel):
    entity_name: str

@app.get("/health")
def health_check():
    """Simple health check to verify the engine is reachable."""
    total, missing = orchestrator.analyze_status()
    return {
        "status": "alive",
        "engine": "L'Esprit",
        "version": "1.0.0",
        "stats": {
            "total_entities": total,
            "missing_images": missing
        }
    }

@app.get("/preview/{entity_name}")
def get_prompt_preview(entity_name: str):
    """Returns the image generation prompt for a specific entity."""
    prompt = orchestrator.get_prompt_preview(entity_name)
    if prompt == "Entity not found.":
        raise HTTPException(status_code=404, detail="Entity not found")
    
    return {
        "entity": entity_name,
        "prompt": prompt
    }

@app.post("/generate")
def generate_image(request: GenerateRequest):
    """Generates an image for the given entity using Vertex AI."""
    entity_name = request.entity_name
    
    # 1. Get the prompt
    prompt = orchestrator.get_prompt_preview(entity_name)
    if prompt == "Entity not found.":
        raise HTTPException(status_code=404, detail="Entity not found")

    print(f"Generating image for {entity_name} with prompt: {prompt}")

    try:
        # 2. Call Vertex AI (Imagen)
        model = ImageGenerationModel.from_pretrained("imagegeneration@006")
        
        response = model.generate_images(
            prompt=prompt,
            number_of_images=1,
            language="en",
            aspect_ratio="3:4", 
            safety_filter_level="block_some",
            person_generation="allow_adult"
        )
        
        # --- DEBUG / INSPECTION ---
        print(f"DEBUG: Response type: {type(response)}")
        print(f"DEBUG: Response content: {response}")
        # --------------------------

        # FIX: Access the 'images' attribute of the response object
        images = response.images if hasattr(response, 'images') else []
        
        # Robust check: Ensure images is a list-like object and has at least one element
        if not images or len(images) == 0:
             print("Error: No images returned from Vertex AI. This usually means the prompt triggered a Safety Filter.")
             # Return a clean 502 error instead of crashing
             return JSONResponse(
                 status_code=502,
                 content={
                     "status": "error", 
                     "message": "No image returned from generation service. The prompt may have triggered a safety filter.",
                     "details": str(response)
                 }
             )

        # 3. Save Image
        # Define path: public/generated_images/
        # api.py is in engine/, so public is at ../public
        
        # Using correct resolution for public directory relative to engine/api.py
        # Current file: /home/hericdev/AfricanPantheon/african_mythology_V2/engine/api.py
        # Public dir: /home/hericdev/AfricanPantheon/african_mythology_V2/public
        root_public_dir = Path(__file__).parent.parent / "public"
        
        output_dir = root_public_dir / "generated_images"
        output_dir.mkdir(parents=True, exist_ok=True)
        
        safe_name = entity_name.lower().replace(" ", "_").replace("/", "-")
        filename = f"{safe_name}.png"
        file_path = output_dir / filename
        
        # Safely access the first image
        generated_image = images[0]
        generated_image.save(location=str(file_path), include_generation_parameters=False)
        print(f"Image saved to {file_path}")

        # 4. Update Database (JSON)
        # Relative URL for frontend: /generated_images/filename.png
        image_url = f"/generated_images/{filename}"
        
        # Find and update entity in orchestrator data
        updated = False
        for entity in orchestrator.data:
            if entity.name.lower() == entity_name.lower():
                entity.appearance.imageUrl = image_url
                updated = True
                break
        
        if updated:
             save_mythology_data(orchestrator.data)
             print("Database updated.")

        return {
            "status": "success",
            "image_url": image_url,
            "prompt_used": prompt
        }

    except Exception as e:
        print(f"Generation Error: {e}")
        # If it's a known API error, we might want to pass it through, otherwise 500
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
