from fastapi import APIRouter, HTTPException

from app.schemas.incident_schema import CustomIncidentRequest
from app.engines.incident_simulator import generate_telemetry, run_pipeline
from app.engines.graph_engine import GraphEngine
from app.engines.ml_engine import rank_services

router = APIRouter()

def apply_rule_boost(service_metrics, base_score):
    """Apply hackathon-ready heuristic boosts for critical anomalies."""
    boost = 0
    # Severe latency boost
    if service_metrics.get("latency", 0) > 2500:
        boost += 0.20
    # CPU saturation boost
    if service_metrics.get("cpu_usage", 0) > 85:
        boost += 0.15
    # Cascading impact boost
    if service_metrics.get("downstream_failures", 0) >= 2:
        boost += 0.15
    return min(base_score + boost, 0.95)

# Global state for dynamic timeline
from datetime import datetime

SAMPLE_TELEMETRY_EVENTS = [
    {"timestamp": "2026-02-21T12:03:00", "service": "Payment Gateway", "metric": "latency", "value": 1500, "threshold": 800},
    {"timestamp": "2026-02-21T12:07:00", "service": "Auth Service", "metric": "retry_rate", "value": 0.4, "threshold": 0.2},
    {"timestamp": "2026-02-21T12:12:00", "service": "Frontend", "metric": "error_rate", "value": 0.15, "threshold": 0.05},
    {"timestamp": "2026-02-21T12:25:00", "service": "Database", "metric": "cpu_usage", "value": 0.95, "threshold": 0.8},
]

_global_events = list(SAMPLE_TELEMETRY_EVENTS)


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
    
    # Check for explicit reset flag
    if request.reset_scenario:
        global _global_events
        _global_events = []
        graph_engine.reset_telemetry()
        # If it's just a reset request, we return after clearing
        if request.error_rate <= 0.05 and request.latency <= 200:
             return {"status": "Timeline and system state reset"}

    result = run_pipeline(telemetry, graph_engine, ml_engine)

    # 2. Add to dynamic timeline if it's an anomaly
    thresholds = {'error_rate': 0.1, 'latency': 800, 'cpu_usage': 80, 'downstream_failures': 2}
    now_ts = datetime.now().isoformat()
    
    # Check each metric and log if it's an anomaly
    for key, threshold in thresholds.items():
        val = telemetry.get(key, 0)
        if val > threshold:
            event_to_log = {
                "timestamp": now_ts,
                "service": telemetry["service"],
                "metric": key,
                "value": val,
                "threshold": threshold
            }
            _global_events.append(event_to_log)

    return result


# ---------------------------------------------------------------------------
# From main: analyze + timeline endpoints (lazy imports to allow app to start)
# ---------------------------------------------------------------------------
from pydantic import BaseModel
from typing import Dict


class ServiceFeatures(BaseModel):
    error_rate: float
    latency: float
    cpu_usage: float
    downstream_failures: int


class AnalyzeRequest(BaseModel):
    services: Dict[str, ServiceFeatures]


@router.post("/incident/retrain")
async def retrain_model():
    from app.engines.ml_model import train_model
    try:
        train_model(force_retrain=True)
        return {"status": "Model retrained successfully", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")

@router.post("/incident/reset")
async def reset_system():
    global _global_events
    try:
        _global_events = []
        ge = GraphEngine()
        ge.reset_telemetry()
        return {"status": "System state and timeline reset successfully", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Reset failed: {str(e)}")

@router.post("/incident/analyze")
async def analyze_incident(request: AnalyzeRequest):
    import pandas as pd
    from app.engines.ml_model import train_model
    from app.engines.explainability import generate_explainability

    try:
        model = train_model()
        
        # 1. Update GraphEngine with current request metrics for context-aware ranking
        graph_engine = GraphEngine()
        for service_name, features in request.services.items():
            # Sync graph engine with request telemetry before impact calculation
            graph_engine.attach_telemetry({
                "service": service_name,
                "error_rate": features.error_rate,
                "latency": features.latency,
                "cpu": features.cpu_usage,
                "downstream_failures": features.downstream_failures
            })
            
        impact_scores = graph_engine.calculate_impact()

        # 2. Rank services to find the top suspect
        predictions = []
        from app.engines.ml_model import predict_service_probability
        
        for service_name, features in request.services.items():
            fd = features.dict()
            fd["impact_score"] = impact_scores.get(service_name, 0)
            
            # Use unified prediction function for capping and normalization
            base_prob = predict_service_probability(fd)
            # 🚀 Apply "Hackathon-Ready" Heuristic Boost
            boosted_prob = apply_rule_boost(fd, base_prob)
            
            predictions.append({
                "service": service_name, 
                "prob": boosted_prob, 
                "features": fd
            })

        # ⚖️ Re-normalize probabilities so they sum to 1.0 (Dominance logic)
        total_prob = sum(p["prob"] for p in predictions)
        if total_prob > 0:
            for p in predictions:
                p["prob"] /= total_prob
                p["confidence"] = int(p["prob"] * 100)

        predictions.sort(key=lambda x: x["prob"], reverse=True)
        top = predictions[0]

        # 3. Generate SHAP-based explainability for the top suspect
        # Use our normalized relative confidence for the explanation section
        explain_result = generate_explainability(top["service"], top["features"], confidence=top["confidence"])

        # 4. Build final response - Show all ranked services with their relative confidence
        ai_hypotheses = []
        for p in predictions:
            ai_hypotheses.append({"service": p["service"], "confidence": p["confidence"]})
        
        return {
            "ai_hypotheses": ai_hypotheses,
            "root_cause_analysis": explain_result
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/incident/timeline")
async def get_incident_timeline():
    try:
        from app.engines.timeline_engine import generate_timeline
    except ImportError as e:
        raise HTTPException(501, f"Timeline engine unavailable: {e}")
    try:
        # Use dynamic events if available, otherwise fallback to sample for initial state
        events = _global_events if _global_events else SAMPLE_TELEMETRY_EVENTS
        timeline = generate_timeline(events)
        return {"timeline": timeline}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Timeline generation failed: {str(e)}")
