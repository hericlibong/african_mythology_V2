from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from orchestrator import ImageOrchestrator

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
