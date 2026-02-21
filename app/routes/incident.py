from fastapi import APIRouter

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
