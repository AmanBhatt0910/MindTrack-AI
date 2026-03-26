from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://mind-track-ai-gamma.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = "amanbhatt0910/mindtrack-mental-model"

tokenizer = None
model = None

labels = [
    "anxiety",
    "stress",
    "depression",
    "normal",
    "suicidal",
    "bipolar",
    "personality disorder"
]

class InputText(BaseModel):
    text: str


def load_model():
    global tokenizer, model

    if tokenizer is None or model is None:
        print("🚀 Loading model from HuggingFace...")

        tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_PATH,
            cache_dir="./cache"
        )

        model.eval()
        torch.set_num_threads(1)

        print("Model loaded successfully")


# Health check
@app.get("/")
def health():
    return {"status": "ML API running 🚀"}


@app.get("/warmup")
def warmup():
    load_model()
    return {"status": "model warmed up 🔥"}


@app.post("/predict")
def predict(data: InputText):
    try:
        load_model()

        inputs = tokenizer(
            data.text,
            return_tensors="pt",
            truncation=True,
            padding=True
        )

        with torch.no_grad():
            outputs = model(**inputs)

        probs = torch.softmax(outputs.logits, dim=1)
        pred = torch.argmax(probs, dim=1).item()

        return {
            "label": labels[pred],
            "confidence": float(probs[0][pred])
        }

    except Exception as e:
        return {
            "error": str(e)
        }