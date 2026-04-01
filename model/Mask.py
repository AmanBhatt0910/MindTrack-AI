import torch
import numpy as np
import shap
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline
from scipy.special import softmax
from huggingface_hub import login
import os

os.environ["TRANSFORMERS_NO_ADVISORY_WARNINGS"] = "1"

login("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")


import os
import torch
import numpy as np
import shap
from transformers import AutoModelForSequenceClassification, AutoTokenizer, pipeline
from scipy.special import softmax


class MentalHealthAnalyzer:
    def __init__(self, mh_model_path):
        print(os.listdir(mh_model_path))

        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'

        self.labels = ['Anxiety', 'Stress', 'Depression', 'Suicidal', 'Bipolar']

        # -------- MODEL -------- #
        self.mh_tokenizer = AutoTokenizer.from_pretrained(mh_model_path)
        self.mh_model = AutoModelForSequenceClassification.from_pretrained(
            mh_model_path,
            use_safetensors=True
        ).to(self.device)
        self.mh_model.eval()

        # -------- SENTIMENT -------- #
        self.sentiment_pipe = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment",
            device=0 if self.device == 'cuda' else -1
        )

        # -------- SHAP -------- #
        self.explainer = shap.Explainer(
            self._predict_for_shap,
            shap.maskers.Text(self.mh_tokenizer)
        )

    # ---------------- SHAP MODEL ---------------- #
    def _predict_for_shap(self, texts):
        inputs = self.mh_tokenizer(
            texts,
            return_tensors="pt",
            padding=True,
            truncation=True
        ).to(self.device)

        with torch.no_grad():
            logits = self.mh_model(**inputs).logits.cpu().numpy()

        return softmax(logits)

    # ---------------- FEATURES ---------------- #
    def _detect_features(self, text):
        text_l = text.lower()

        contradiction_words = ["but", "still", "however"]
        fake_positive_words = ["haha", "lol", "fine", "ok", "okay"]

        found_con = [w for w in contradiction_words if w in text_l]
        found_fake = [w for w in fake_positive_words if w in text_l]

        feat_flag = min(1.0, 0.5 * len(found_con) + 0.5 * len(found_fake))

        return feat_flag, found_con, found_fake

    # ---------------- CALIBRATION ---------------- #
    def _calibrate(self, probs):
        calibrated = probs.copy()
        sui_idx = self.labels.index('Suicidal')

        if calibrated[sui_idx] < 0.75:
            calibrated[sui_idx] *= 0.2

        return calibrated

    # ---------------- SHAP WORDS ---------------- #
    def _get_shap_words(self, text):
        shap_values = self.explainer([text])

        tokens = shap_values.data[0]
        values = shap_values.values[0]

        token_scores = np.sum(values, axis=1)

        word_scores = list(zip(tokens, token_scores))
        word_scores_sorted = sorted(word_scores, key=lambda x: abs(x[1]), reverse=True)

        top_positive = [w for w, v in word_scores_sorted if v > 0][:5]
        top_negative = [w for w, v in word_scores_sorted if v < 0][:5]

        return top_positive, top_negative

    # ---------------- MAIN ---------------- #
    def analyze_text(self, text: str) -> dict:

        # -------- MODEL PREDICTION -------- #
        inputs = self.mh_tokenizer(text, return_tensors="pt", padding=True, truncation=True).to(self.device)

        with torch.no_grad():
            logits = self.mh_model(**inputs).logits.cpu().numpy()[0]

        probs = softmax(logits)
        calibrated_probs = self._calibrate(probs)

        # -------- SENTIMENT -------- #
        sent_res = self.sentiment_pipe(text, top_k=None)
        label_map = {item['label']: item['score'] for item in sent_res}

        neg_score = label_map.get('LABEL_0', 0.0)
        pos_score = label_map.get('LABEL_2', 0.0)
        sentiment_score = pos_score - neg_score

        # -------- FEATURE DETECTION -------- #
        feat_flag, found_con, found_fake = self._detect_features(text)

        # -------- FIX OVERCONFIDENCE -------- #
        for i in range(len(calibrated_probs)):
            if calibrated_probs[i] > 0.85 and sentiment_score > 0.5:
                calibrated_probs[i] *= 0.5

        # -------- RISK SCORE -------- #
        weights = np.array([1.0, 1.0, 1.5, 2.0, 1.2])
        risk_score = float(np.dot(calibrated_probs, weights))
        risk_score = min(risk_score, 1.0)

        # -------- FIXED MDS -------- #
        sentiment_component = abs(sentiment_score)

        mds = (
            0.6 * risk_score +
            0.3 * sentiment_component +
            0.1 * feat_flag
        )
        mds = float(np.clip(mds, 0, 1))

        # -------- SEVERITY -------- #
        if mds > 0.7:
            severity = "HIGH"
        elif mds >= 0.4:
            severity = "MODERATE"
        else:
            severity = "LOW"

        # -------- FIXED MASKED DETECTION -------- #
        masked_detected = (
            (sentiment_score > 0.2 and risk_score > 0.25)
            or feat_flag > 0.5
        )

        # -------- SHAP -------- #
        try:
            shap_pos, shap_neg = self._get_shap_words(text)
        except:
            shap_pos, shap_neg = [], []

        # -------- EXPLANATION -------- #
        explanations = []

        if masked_detected:
            explanations.append(
                "Positive tone detected alongside distress indicators, suggesting emotional masking."
            )

        if found_fake:
            explanations.append(f"Fake positivity detected: {found_fake}")

        if found_con:
            explanations.append(f"Contradiction words detected: {found_con}")

        if shap_pos:
            explanations.append(f"Key distress-driving words: {shap_pos}")

        # -------- SUGGESTIONS -------- #
        suggestions = ["Maintain a daily journal to track emotions."]

        if severity == "MODERATE":
            suggestions.append("Consider talking to someone you trust.")
            suggestions.append("Try relaxation or breathing exercises.")

        if severity == "HIGH":
            suggestions.insert(0, "Urgent: Seek help from a mental health professional.")

        # -------- OUTPUT -------- #
        return {
            "mental_health": {
                self.labels[i]: float(calibrated_probs[i])
                for i in range(len(self.labels))
            },
            "sentiment": {
                "positive": float(pos_score),
                "negative": float(neg_score),
                "score": float(sentiment_score)
            },
            "risk_score": round(risk_score, 4),
            "mds_score": round(mds, 4),
            "severity": severity,
            "masked_detected": masked_detected,
            "shap_explanation": {
                "top_positive_words": shap_pos,
                "top_negative_words": shap_neg
            },
            "explanation": explanations,
            "suggestions": suggestions
        }


# ---------------- TEST ---------------- #
if __name__ == "__main__":

    MODEL_PATH = "mental_health_model"

    analyzer = MentalHealthAnalyzer(MODEL_PATH)

    test_sentences = [
        "I am okay but I don't know haha",
        "I feel very sad and hopeless",
        "Everything is fine lol just tired of life",
        "I am happy and doing great"
    ]

    for text in test_sentences:
        print("\n" + "="*60)
        print(f"INPUT: {text}")

        result = analyzer.analyze_text(text)

        import json
        print(json.dumps(result, indent=2))