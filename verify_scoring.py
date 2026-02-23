import asyncio
import json
import networkx as nx
from app.engines.blast_radius import estimate_blast_radius

def test_severity_scoring():
    # Setup mock graph
    G = nx.DiGraph()
    # Mock data for checkout service
    G.add_node("checkout-service", 
               error_rate=0.25, 
               latency=3500, 
               cpu_usage=88, 
               downstream_failures=2, 
               impact_score=0.4,
               traffic_volume=5000,
               business_criticality_score=5)
    
    # Test High-Impact Scenario
    print("--- Testing High-Impact Scenario ---")
    res = estimate_blast_radius(G, "checkout-service")
    print(f"Severity Score: {res['severity_score']}")
    print(f"Severity Level: {res['severity_level']}")
    print(f"Explanation: {res['explanation']}")
    
    # Check if critical (as per requirements: high error, high latency, multiple downstream)
    # Score = (0.25 * 0.35) + (3500/5000 * 0.30) + (2 * 0.20) + (88/100 * 0.10) + (0.4 * 0.05) + (0.10 boost for CPU > 85) + (0.05 boost if CPU > 75 and error > 15)
    # Score = 0.0875 + 0.21 + 0.40 + 0.088 + 0.02 + 0.10 + 0.05 = 0.9555
    assert res['severity_level'] == "Critical"
    
    print("\n✅ Severity classification verified!")

if __name__ == "__main__":
    test_severity_scoring()
