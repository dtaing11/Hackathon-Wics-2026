"""Load bird species class names from Hugging Face dataset"""
from datasets import load_dataset
import json
from pathlib import Path

# Cache file to avoid downloading dataset every startup
CACHE_FILE = Path(__file__).parent / ".bird_classes_cache.json"

def get_bird_classes():
    """Get list of bird species names in order (index = class ID)"""
    # Try loading from cache first
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE, 'r') as f:
                print("✓ Loaded bird classes from cache")
                return json.load(f)
        except Exception as e:
            print(f"Warning: Cache corrupted, redownloading: {e}")
    
    # Download from Hugging Face
    try:
        print("⏳ Downloading bird species names from Hugging Face...")
        dataset = load_dataset("yashikota/birds-525-species-image-classification", split="train", trust_remote_code=True)
        class_names = dataset.features["label"].names
        
        # Save to cache
        with open(CACHE_FILE, 'w') as f:
            json.dump(class_names, f)
        print(f"✓ Cached {len(class_names)} bird species")
        return class_names
    except Exception as e:
        print(f"❌ Error loading bird classes: {e}")
        return None

# Pre-load on startup
BIRD_CLASSES = get_bird_classes()

def get_bird_name(class_id):
    """Get bird species name from class ID"""
    if BIRD_CLASSES and 0 <= class_id < len(BIRD_CLASSES):
        return BIRD_CLASSES[class_id]
    return f"Unknown Species (Class {class_id})"
