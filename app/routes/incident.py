from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from engines.ml_model import predict_service_probability
from engines.explainability import generate_explainability

router = APIRouter()

class ServiceFeatures(BaseModel):
    error_rate: float
    latency: float
    cpu_usage: float
    downstream_failures: int

class AnalyzeRequest(BaseModel):
    services: Dict[str, ServiceFeatures]

@router.post("/incident/analyze")
async def analyze_incident(request: AnalyzeRequest):
    services = request.services

    # Predict probabilities
    predictions = []
    for service_name, features in services.items():
        features_dict = features.dict()
        prob = predict_service_probability(features_dict)
        predictions.append({
            "service": service_name,
            "confidence": int(prob * 100),
            "prob": prob
        })

    # Rank by probability descending
    predictions.sort(key=lambda x: x["prob"], reverse=True)

    # Top 3 hypotheses
    ai_hypotheses = [{"service": p["service"], "confidence": p["confidence"]} for p in predictions[:3]]

    # Top suspect
    top_suspect = predictions[0]["service"]
    top_features = services[top_suspect].dict()

    # Generate explainability for top suspect
    root_cause_analysis = generate_explainability(top_suspect, top_features)

    return {
        "ai_hypotheses": ai_hypotheses,
        "root_cause_analysis": root_cause_analysis
    }