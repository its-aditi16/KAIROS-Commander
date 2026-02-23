import json
import numpy as np
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from app.engines.similarity_engine import similarity_engine

def test_similarity_weighting():
    # Setup mock history
    similarity_engine.history = [
        {
            "incident_id": "INC-001",
            "name": "High Latency Spike",
            "service": "payments",
            "error_rate": 0.01,
            "latency": 4500,
            "cpu": 20,
            "downstream": 0,
            "impact_score": 0.1
        },
        {
            "incident_id": "INC-002",
            "name": "High Error Burst",
            "service": "auth",
            "error_rate": 0.45,
            "latency": 200,
            "cpu": 30,
            "downstream": 0,
            "impact_score": 0.2
        }
    ]
    
    # Current incident: high error
    current_error = {
        "error_rate": 0.40,
        "latency": 150,
        "cpu": 25,
        "downstream": 0,
        "impact_score": 0.15
    }
    
    print("--- Testing Similarity Weighting (Current: High Error) ---")
    matches = similarity_engine.find_similar_incidents(current_error)
    for m in matches:
        print(f"Match: {m['name']} ({m['similarity']}%)")
    
    # High error match should be top since error is weighted 0.30 vs latency 0.25
    assert matches[0]["incident_id"] == "INC-002"
    
    print("\n✅ Similarity weighting verified!")

if __name__ == "__main__":
    test_similarity_weighting()
