from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

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

# Get the correct model path
current_dir = Path(__file__).parent.absolute()
MODEL_PATH = current_dir / "mental_health_model"

# Verify model exists
if not MODEL_PATH.exists():
    raise Exception(f"Model not found at {MODEL_PATH}")

print(f"📁 Loading model from: {MODEL_PATH}")

tokenizer = None
model = None
device = None

# 🔹 Labels (must match training)
label_cols = ["Anxiety", "Stress", "Depression", "Suicidal", "Bipolar"]

class InputText(BaseModel):
    text: str


# Helper function to convert numpy types to Python native types
def convert_to_native(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, np.float32) or isinstance(obj, np.float64):
        return float(obj)
    elif isinstance(obj, np.int32) or isinstance(obj, np.int64):
        return int(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: convert_to_native(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_to_native(item) for item in obj]
    return obj


# 🔥 Long text chunking (for prediction)
def split_text(text, tokenizer, max_length=512, stride=50):
    inputs = tokenizer(
        text,
        return_overflowing_tokens=True,
        max_length=max_length,
        stride=stride,
        truncation=True
    )
    
    chunks = []
    for ids in inputs["input_ids"]:
        chunks.append(tokenizer.decode(ids, skip_special_tokens=True))
    
    return chunks


def predict_long_text(text):
    chunks = split_text(text, tokenizer)
    
    all_probs = []
    
    for chunk in chunks:
        inputs = tokenizer(
            chunk,
            return_tensors="pt",
            truncation=True,
            padding=True,
            max_length=512
        ).to(device)
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        probs = torch.sigmoid(outputs.logits)
        all_probs.append(probs.cpu().numpy())
    
    # 🔥 Use MAX to capture strongest signal
    return np.max(all_probs, axis=0)[0]


# 🔹 Main prediction function (following the original format)
def predict_text(text, threshold=0.5, min_conf=0.3):
    probs = predict_long_text(text)
    
    predicted_labels = [
        label_cols[i] for i, p in enumerate(probs) if p > threshold
    ]
    
    if len(predicted_labels) == 0 or max(probs) < min_conf:
        return {
            "labels": ["Normal"],
            "probabilities": dict(zip(label_cols, probs))
        }
    
    return {
        "labels": predicted_labels,
        "probabilities": dict(zip(label_cols, probs))
    }


def load_model():
    global tokenizer, model, device

    if tokenizer is None or model is None:
        print(f"🚀 Loading model from: {MODEL_PATH}")
        
        try:
            # Load tokenizer and model
            tokenizer = AutoTokenizer.from_pretrained(str(MODEL_PATH))
            model = AutoModelForSequenceClassification.from_pretrained(
                str(MODEL_PATH),
                ignore_mismatched_sizes=True
            )
            
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            model.to(device)
            model.eval()
            torch.set_num_threads(1)
            
            print(f"✅ Model loaded successfully on {device}")
            print(f"📊 Model has {model.config.num_labels} output labels")
            print(f"🏷️  Labels: {label_cols}")
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise


# Health check
@app.get("/")
def health():
    return {"status": "ML API running 🚀"}


@app.get("/warmup")
def warmup():
    try:
        load_model()
        return {"status": "model warmed up 🔥"}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.post("/predict")
def predict(data: InputText):
    try:
        load_model()
        
        print(f"\n📝 Analyzing text: {data.text[:100]}...")
        
        # 🔹 Use the original prediction function
        result = predict_text(data.text, threshold=0.5, min_conf=0.3)
        
        # Convert numpy types to Python native types
        probabilities = convert_to_native(result["probabilities"])
        
        # Get all predictions with their probabilities
        all_predictions = []
        for label, prob in probabilities.items():
            all_predictions.append({
                "label": label.lower(),
                "confidence": float(prob)  # Ensure it's a Python float
            })
        
        # Sort by confidence descending
        all_predictions.sort(key=lambda x: x["confidence"], reverse=True)
        
        # Get the top prediction (for backward compatibility)
        top_prediction = all_predictions[0] if all_predictions else {"label": "normal", "confidence": 0.0}
        
        # Get all predicted labels (for multi-label support)
        predicted_labels = result["labels"]
        
        # Generate explanation based on predictions
        significant = [p for p in all_predictions if p["confidence"] > 0.3]
        
        if len(predicted_labels) == 1 and predicted_labels[0] == "Normal":
            explanation = "No significant mental health indicators detected in this text."
        else:
            explanation_parts = []
            for pred in significant[:3]:
                explanation_parts.append(
                    f"{pred['label'].title()}: {pred['confidence']*100:.1f}%"
                )
            explanation = f"Detected: {', '.join(explanation_parts)}"
        
        # Prepare comprehensive response with all values converted to native types
        response = {
            # Original format fields
            "labels": predicted_labels,
            "probabilities": probabilities,
            
            # Additional fields for frontend compatibility
            "label": top_prediction["label"],
            "confidence": float(top_prediction["confidence"]),
            "all_predictions": all_predictions,
            "explanation": explanation,
            "raw_probs": [float(probabilities[label]) for label in label_cols]
        }
        
        # Debug print
        print(f"📊 Results:")
        print(f"  Predicted Labels: {result['labels']}")
        print(f"  Probabilities:")
        for k, v in probabilities.items():
            print(f"    {k}: {v:.3f}")
        print(f"  Explanation: {explanation}")
        
        return response

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return a safe error response matching the format
        return {
            "labels": ["Normal"],
            "probabilities": {
                "Anxiety": 0.0,
                "Stress": 0.0,
                "Depression": 0.0,
                "Suicidal": 0.0,
                "Bipolar": 0.0
            },
            "label": "neutral",
            "confidence": 0.0,
            "all_predictions": [],
            "explanation": f"Error: {str(e)}",
            "raw_probs": [0.0] * len(label_cols),
            "error": str(e)
        }