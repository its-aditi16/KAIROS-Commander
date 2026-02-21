from fastapi import APIRouter, HTTPException

from app.schemas.incident_schema import CustomIncidentRequest
from app.engines.incident_simulator import generate_telemetry, run_pipeline
from app.engines.graph_engine import GraphEngine
from app.engines.ml_engine import rank_services

router = APIRouter()

# ML engine (stateless)
ml_engine = type("MLEngine", (), {"rank_services": staticmethod(rank_services)})()


@router.post("/incident/inject")
def inject_incident(request: CustomIncidentRequest):
    telemetry = generate_telemetry(
        request.service,
        request.error_rate,
        request.latency,
        request.cpu,
        request.downstream,
    )

    graph_engine = GraphEngine()
    result = run_pipeline(telemetry, graph_engine, ml_engine)

    return result


# ---------------------------------------------------------------------------
# From main: analyze + timeline endpoints
# ---------------------------------------------------------------------------
from pydantic import BaseModel
from typing import Dict
from app.engines.ml_model import predict_service_probability
from app.engines.explainability import generate_explainability
from app.engines.timeline_engine import generate_timeline


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

    predictions = []
    for service_name, features in services.items():
        features_dict = features.dict()
        prob = predict_service_probability(features_dict)
        predictions.append({
            "service": service_name,
            "confidence": int(prob * 100),
            "prob": prob
        })

    predictions.sort(key=lambda x: x["prob"], reverse=True)
    ai_hypotheses = [{"service": p["service"], "confidence": p["confidence"]} for p in predictions[:3]]
    top_suspect = predictions[0]["service"]
    top_features = services[top_suspect].dict()
    root_cause_analysis = generate_explainability(top_suspect, top_features)

    return {
        "ai_hypotheses": ai_hypotheses,
        "root_cause_analysis": root_cause_analysis
    }


SAMPLE_TELEMETRY_EVENTS = [
    {"timestamp": "2026-02-21T12:03:00", "service": "Payment Gateway", "metric": "latency", "value": 1500, "threshold": 800},
    {"timestamp": "2026-02-21T12:07:00", "service": "Auth Service", "metric": "retry_rate", "value": 40, "threshold": 20},
    {"timestamp": "2026-02-21T12:12:00", "service": "Frontend", "metric": "error_rate", "value": 15, "threshold": 5},
    {"timestamp": "2026-02-21T12:25:00", "service": "Database", "metric": "cpu_usage", "value": 95, "threshold": 80},
]


@router.get("/incident/timeline")
async def get_incident_timeline():
    try:
        timeline = generate_timeline(SAMPLE_TELEMETRY_EVENTS)
        return {"timeline": timeline}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Timeline generation failed: {str(e)}")
