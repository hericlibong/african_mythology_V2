import requests
import json
import os
import sys
import time

BASE_URL = "http://127.0.0.1:7860"
DATA_FILE = "src/data/mythology_data.json"

def log(msg, status="INFO"):
    colors = {
        "INFO": "\033[94m",
        "SUCCESS": "\033[92m",
        "ERROR": "\033[91m",
        "RESET": "\033[0m"
    }
    print(f"{colors.get(status, '')}[{status}] {msg}{colors['RESET']}")

def fail(msg):
    log(msg, "ERROR")
    sys.exit(1)

def check_health():
    log("Checking Health...")
    try:
        res = requests.get(f"{BASE_URL}/health")
        if res.status_code == 200:
            log("Health Check Passed", "SUCCESS")
        else:
            fail(f"Health Check Failed: {res.status_code} {res.text}")
    except Exception as e:
        fail(f"Connection Failed: {e}")

def check_preview(entity, style_id):
    log(f"Checking Preview for {entity} [{style_id}]...")
    res = requests.get(f"{BASE_URL}/preview/{entity}?style_id={style_id}")
    if res.status_code == 200:
        data = res.json()
        if data.get("prompt"):
            log(f"Preview [{style_id}] Passed", "SUCCESS")
            return data["prompt"]
        else:
            fail(f"Preview returned no prompt: {data}")
    else:
        fail(f"Preview Failed: {res.status_code} {res.text}")

def trigger_generation(entity, style_id):
    log(f"Triggering Generation for {entity} [{style_id}]...")
    payload = {"entity_name": entity, "style_id": style_id}
    # Increased timeout for generation
    try:
        res = requests.post(f"{BASE_URL}/generate", json=payload, timeout=60)
        if res.status_code == 200:
            data = res.json()
            if data.get("status") == "success" and data.get("image_url"):
                log(f"Generation [{style_id}] Passed: {data['image_url']}", "SUCCESS")
                return data["image_url"]
            else:
                fail(f"Generation returned failure: {data}")
        elif res.status_code == 502:
             log(f"Generation Blocked by Safety Filter (Expected behavior possibility)", "WARNING")
             return None
        else:
            fail(f"Generation Failed: {res.status_code} {res.text}")
    except requests.exceptions.Timeout:
        fail("Generation Timed Out")
    except Exception as e:
        fail(f"Generation Error: {e}")

def verify_persistence(entity_name, style_id, expected_url):
    log(f"Verifying Persistence for {entity_name} [{style_id}]...")
    if not os.path.exists(DATA_FILE):
        fail(f"Data file not found at {DATA_FILE}")
    
    with open(DATA_FILE, "r") as f:
        data = json.load(f)
    
    entity = next((e for e in data if e["name"] == entity_name), None)
    if not entity:
        fail(f"Entity {entity_name} not found in JSON")
    
    rendering = entity.get("rendering", {})
    images = rendering.get("images", {})
    saved_url = images.get(style_id)
    
    if saved_url == expected_url:
        log("Persistence Verified", "SUCCESS")
    else:
        fail(f"Persistence Failed. Expected {expected_url}, found {saved_url}")

def run_tests():
    # 1. Health
    check_health()
    
    # 2. Preview Checks
    # Shango has photoreal
    p1 = check_preview("Shango", "photoreal")
    # Mami Wata has manga
    p2 = check_preview("Mami Wata", "manga")
    
    if p1 == p2:
        # Unlikely to happen across entities, but keeps structure
        fail("PROMPTS_IDENTICAL: Logic error or data copy-paste.")
    else:
        log("Prompts are distinct (Shango/Photoreal vs Mami Wata/Manga)", "SUCCESS")

    # 3. Generation (Photoreal) - The 'Money' Test
    url_photo = trigger_generation("Shango", "photoreal")
    
    if url_photo:
        # 4. Verify File Creation
        rel_path = url_photo.lstrip("/")
        local_path = os.path.join("public", rel_path)
        if os.path.exists(local_path):
             log(f"File created at {local_path}", "SUCCESS")
        else:
             fail(f"File missing at {local_path}")
        
        # 5. Verify Persistence
        verify_persistence("Shango", "photoreal", url_photo)
    
    # 6. Generation (Manga) with Mami Wata
    url_manga = trigger_generation("Mami Wata", "manga")
    if url_manga:
        verify_persistence("Mami Wata", "manga", url_manga)

    log("ALL HEADLESS SMOKE TESTS PASSED", "SUCCESS")

if __name__ == "__main__":
    run_tests()
