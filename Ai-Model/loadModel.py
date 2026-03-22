from fastapi import FastAPI, UploadFile, File
from contextlib import asynccontextmanager
from PIL import Image
import torch
import torchvision.transforms as transforms
import io

from ResNet18.modelResnet import BirdResNet18
from gcp.bird_classes import get_bird_name

model = None
device = None


def load_model():
    global device, model
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    model = BirdResNet18(num_classes=526)
    state_dict = torch.load("ResNet18/bird_resnet18.pth", map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    print("Model loaded!")
    yield
    print("Shutting down...")


app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "message": "Bird species prediction API is running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "device": str(device),
        "model_loaded": model is not None
    }


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    input_tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probabilities, dim=1)

        confidence = confidence.item()
        predicted = predicted.item()

    species_name = get_bird_name(predicted)
    confidence_percent = round(confidence * 100, 2)

    return {
        "prediction": int(predicted),
        "species": species_name,
        "confidence": confidence_percent,
        "note": f"Detected: {species_name} ({confidence_percent}% confidence)"
    }