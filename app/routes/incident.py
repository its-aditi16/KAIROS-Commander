from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from engines.ml_model import predict_service_probability
from engines.explainability import generate_explainability
from engines.timeline_engine import generate_timeline

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


# ---------------------------------------------------------------------------
# GET /incident/timeline
# ---------------------------------------------------------------------------
# Demo endpoint: uses hardcoded sample telemetry events.
# Later, replace SAMPLE_TELEMETRY_EVENTS with real telemetry data from ingestion.

SAMPLE_TELEMETRY_EVENTS = [
    {
        "timestamp": "2026-02-21T12:03:00",
        "service": "Payment Gateway",
        "metric": "latency",
        "value": 1500,
        "threshold": 800,
    },
    {
        "timestamp": "2026-02-21T12:07:00",
        "service": "Auth Service",
        "metric": "retry_rate",
        "value": 40,
        "threshold": 20,
    },
    {
        "timestamp": "2026-02-21T12:12:00",
        "service": "Frontend",
        "metric": "error_rate",
        "value": 15,
        "threshold": 5,
    },
    {
        "timestamp": "2026-02-21T12:25:00",
        "service": "Database",
        "metric": "cpu_usage",
        "value": 95,
        "threshold": 80,
    },
]


@router.get("/incident/timeline")
async def get_incident_timeline():
    """
    Returns a structured incident timeline derived from telemetry events.

    Each entry includes:
      - time    : HH:MM display string
      - type    : "first_anomaly" | "cascade_failure" | "user_impact" | "normal"
      - service : originating service name
      - event   : human-readable description

    Badge colour guidance for frontend:
      first_anomaly   → yellow
      cascade_failure → red
      user_impact     → purple
      normal          → grey
    """
    try:
        timeline = generate_timeline(SAMPLE_TELEMETRY_EVENTS)
        return {"timeline": timeline}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Timeline generation failed: {str(e)}")
