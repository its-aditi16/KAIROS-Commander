from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from app.engines.graph_engine import build_graph, graph_to_json
from app.routes.incident import router as incident_router

app = FastAPI()

app.include_router(incident_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent

# ✅ JSON API
@app.get("/incident/graph")
def get_graph():
    G = build_graph()
    return graph_to_json(G)

# ✅ UI PAGE
@app.get("/graph")
def serve_graph():
    return FileResponse(BASE_DIR / "graph.html")
