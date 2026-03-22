"""Load bird species class names from the bundled cache file."""

import json
from pathlib import Path

CACHE_FILE = Path(__file__).parent / ".bird_classes_cache.json"


def get_bird_classes():
    """Get the bird species list where index = class ID."""
    if not CACHE_FILE.exists():
        raise FileNotFoundError(f"Missing bird class cache: {CACHE_FILE}")

    with CACHE_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


BIRD_CLASSES = get_bird_classes()


def get_bird_name(class_id):
    """Get the bird species name from a predicted class ID."""
    if 0 <= class_id < len(BIRD_CLASSES):
        return BIRD_CLASSES[class_id]
    return f"Unknown Species (Class {class_id})"
