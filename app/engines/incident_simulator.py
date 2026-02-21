import random

from app.engines.graph_engine import GraphEngine
from app.engines.ml_engine import rank_services


def generate_telemetry(service, error_rate, latency, cpu, downstream):
    return {
        "service": service,
        "error_rate": error_rate,
        "latency": latency,
        "cpu": cpu,
        "downstream_failures": downstream,
        "timestamp": random.randint(100000, 999999),
    }


def run_pipeline(telemetry, graph_engine, ml_engine):
    # Attach telemetry to graph
    graph_engine.attach_telemetry(telemetry)

    # Recalculate impact
    impact_scores = graph_engine.calculate_impact()

    # Rank root causes
    ranking = ml_engine.rank_services(impact_scores)

    return {
        "telemetry": telemetry,
        "impact_scores": dict(impact_scores),
        "ranking": [{"service": s, "impact_score": score} for s, score in ranking],
    }
