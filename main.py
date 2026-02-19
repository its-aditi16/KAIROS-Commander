from fastapi import FastAPI
from app.engines.graph_engine import build_graph, graph_to_json

app = FastAPI()


@app.get("/incident/graph")
def get_incident_graph():
    """
    Retrieve the service dependency graph with telemetry and impact scores.

    Returns:
        dict: JSON representation of the graph (nodes and edges)
    """
    G = build_graph()
    graph_json = graph_to_json(G)
    return graph_json
