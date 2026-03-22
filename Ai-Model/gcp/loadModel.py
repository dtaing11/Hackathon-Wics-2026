from fastapi import FastAPI, UploadFile, File, HTTPException
from contextlib import asynccontextmanager
from PIL import Image
import torch
import torchvision.transforms as transforms
import io
import os

from google.cloud import storage

from bird_classes import get_bird_name
from model_resnet import BirdResNet18

model = None
device = None

GCS_BUCKET_NAME = os.getenv("GCS_BUCKET_NAME")
GCS_MODEL_BLOB = os.getenv("GCS_MODEL_BLOB")
LOCAL_MODEL_PATH = "/tmp/bird_resnet18.pth"

def download_model_from_gcs(bucket_name: str, blob_name: str, destination_file: str):
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob(blob_name)
    blob.download_to_filename(destination_file)

def load_model():
    global device, model

    if not GCS_BUCKET_NAME:
        raise RuntimeError("Missing GCS_BUCKET_NAME")
    if not GCS_MODEL_BLOB:
        raise RuntimeError("Missing GCS_MODEL_BLOB")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    if not os.path.exists(LOCAL_MODEL_PATH):
        download_model_from_gcs(GCS_BUCKET_NAME, GCS_MODEL_BLOB, LOCAL_MODEL_PATH)

    model = BirdResNet18(num_classes=526)
    state_dict = torch.load(LOCAL_MODEL_PATH, map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield

app = FastAPI(lifespan=lifespan)

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

@app.get("/")
async def root():
    return {"status": "ok"}

@app.get("/health")
async def health():
    return {
        "model_loaded": model is not None,
        "device": str(device)
    }

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probabilities, dim=1)

    predicted_idx = predicted.item()
    confidence_percent = round(confidence.item() * 100, 2)
    species_name = get_bird_name(predicted_idx)

    return {
        "prediction": predicted_idx,
        "species": species_name,
        "confidence": confidence_percent
    }
