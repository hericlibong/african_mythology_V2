from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
import os
import json

import logging
import vertexai
from vertexai.preview.vision_models import ImageGenerationModel
from google.oauth2 import service_account
from google.api_core.exceptions import ResourceExhausted, TooManyRequests

from orchestrator import ImageOrchestrator
from loader import save_mythology_data  # Ensure loader exports this



# -----------------------------
# Logger
# -----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="L'Esprit - African Mythology Engine API")


# -----------------------------
# CORS (dev + prod)
# -----------------------------
# En local: React dev server => http://localhost:3000
# En prod (HF): si le frontend est servi par FastAPI, tu peux aussi mettre "*"
cors_origins_env = os.environ.get("CORS_ORIGINS", "")
if cors_origins_env.strip():
    allow_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()]
else:
    allow_origins = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# Orchestrator + config
# -----------------------------
orchestrator = ImageOrchestrator()

PROJECT_ID = os.environ.get("GCP_PROJECT_ID", "livingafricanpantheon")
LOCATION = os.environ.get("GCP_LOCATION", "us-central1")

# -----------------------------
# Vertex AI init (HF-friendly)
# -----------------------------
# Sur HF, on passera un secret JSON dans GCP_SERVICE_ACCOUNT_JSON
# En local, ton init peut continuer à marcher via ADC si tu veux.
try:
    gcp_sa_json = os.environ.get("GCP_SERVICE_ACCOUNT_JSON")
    if gcp_sa_json:
        info = json.loads(gcp_sa_json)
        credentials = service_account.Credentials.from_service_account_info(info)
        vertexai.init(project=PROJECT_ID, location=LOCATION, credentials=credentials)
        print("Vertex AI initialized with service account from env.")
    else:
        vertexai.init(project=PROJECT_ID, location=LOCATION)
        print("Vertex AI initialized (default credentials).")
except Exception as e:
    print(f"Warning: Failed to initialize Vertex AI: {e}")


class GenerateRequest(BaseModel):
    entity_name: str
    style_id: str = "photoreal"


# -----------------------------
# Health + API routes
# -----------------------------
@app.get("/health")
def health_check():
    total, missing = orchestrator.analyze_status()
    return {
        "status": "alive",
        "engine": "L'Esprit",
        "version": "1.0.0",
        "stats": {
            "total_entities": total,
            "missing_images": missing,
        },
    }


@app.get("/preview/{entity_name}")
def get_prompt_preview(entity_name: str, style_id: str = "photoreal"):
    prompt = orchestrator.get_prompt_preview(entity_name, style_id)
    if prompt == "Entity not found.":
        raise HTTPException(status_code=404, detail="Entity not found")

    return {
        "entity": entity_name,
        "style_id": style_id,
        "prompt": prompt,
    }


@app.post("/generate")
def generate_image(request: GenerateRequest):
    entity_name = request.entity_name
    style_id = request.style_id

    # 1) Prompt
    prompt = orchestrator.get_prompt_preview(entity_name, style_id)
    if prompt == "Entity not found.":
        raise HTTPException(status_code=404, detail="Entity not found")
    if not prompt:
        raise HTTPException(status_code=400, detail=f"No prompt available for style '{style_id}'")

    logger.info(f"Generating image for {entity_name} [{style_id}] with prompt: {prompt}")

    try:
        # 2) Call Vertex AI (Imagen)
        model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-002")

        response = model.generate_images(
            prompt=prompt,
            number_of_images=1,
            language="en",
            aspect_ratio="3:4",
            safety_filter_level="block_some",
            person_generation="allow_adult",
        )

        images = response.images if hasattr(response, "images") else []

        if not images or len(images) == 0:
            logger.warning("Error: No images returned from Vertex AI (possible safety filter).")
            return JSONResponse(
                status_code=502,
                content={
                    "status": "error",
                    "message": "No image returned from generation service. The prompt may have triggered a safety filter.",
                    "details": str(response),
                },
            )

        # 3) Save Image => /app/public/generated_images
        root_public_dir = Path(__file__).resolve().parent.parent / "public"
        output_dir = root_public_dir / "generated_images"
        output_dir.mkdir(parents=True, exist_ok=True)

        safe_name = entity_name.lower().replace(" ", "_").replace("/", "-")
        # Filename: entity.png for photoreal, entity_style.png for others
        if style_id == "photoreal":
            filename = f"{safe_name}.png"
        else:
            filename = f"{safe_name}_{style_id}.png"
        file_path = output_dir / filename

        generated_image = images[0]
        generated_image.save(location=str(file_path), include_generation_parameters=False)
        logger.info(f"Image saved to {file_path}")

        # 4) Update JSON DB (via orchestrator + loader)
        image_url = f"/generated_images/{filename}"

        updated = False
        for entity in orchestrator.data:
            if entity.name.lower() == entity_name.lower():
                # Ensure rendering.images exists
                if not entity.rendering:
                    entity.rendering = {}
                if "images" not in entity.rendering:
                    entity.rendering["images"] = {}
                
                # Store URL by style
                entity.rendering["images"][style_id] = image_url
                
                # Legacy sync for photoreal
                if style_id == "photoreal":
                    entity.appearance.imageUrl = image_url
                
                updated = True
                break

        if updated:
            save_mythology_data(orchestrator.data)
            logger.info("Database updated.")

        return {
            "status": "success",
            "image_url": image_url,
            "style_id": style_id,
            "prompt_used": prompt,
        }

    except (ResourceExhausted, TooManyRequests) as e:
        logger.error(f"Quota Exceeded: {e}")
        return JSONResponse(
            status_code=429,
            content={
                "status": "error",
                "error": "quota_exceeded",
                "message": "Quota reached. Try again later."
            },
        )

    except Exception as e:
        logger.error(f"Generation Error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


# -----------------------------
# Static serving (frontend + images)
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent  # /app
DIST_DIR = BASE_DIR / "dist"
ASSETS_DIR = DIST_DIR / "assets"
PUBLIC_DIR = BASE_DIR / "public"
GENERATED_DIR = PUBLIC_DIR / "generated_images"

# 1) Expose generated images
if GENERATED_DIR.exists():
    app.mount("/generated_images", StaticFiles(directory=str(GENERATED_DIR)), name="generated_images")

# 2) Expose frontend assets
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

# 3) SPA index + fallback (only if dist exists)
if (DIST_DIR / "index.html").exists():
    @app.get("/")
    async def index():
        return FileResponse(str(DIST_DIR / "index.html"))

    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        return FileResponse(str(DIST_DIR / "index.html"))


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "7860"))
    uvicorn.run(app, host="0.0.0.0", port=port)
