import requests
import json
import time

BASE_URL = "http://localhost:8001"

def test_ranking():
    print("Step 1: Resetting system to healthy state...")
    services = ["frontend", "auth-service", "payment-service", "database"]
    for svc in services:
        requests.post(f"{BASE_URL}/incident/inject", json={
            "service": svc,
            "error_rate": 0.01,
            "latency": 50,
            "cpu": 20,
            "downstream": 0
        })
    time.sleep(1)

    print("\nStep 2: Injecting Frontend Anomaly (60% error rate)...")
    payload = {
        "service": "frontend",
        "error_rate": 0.6,
        "latency": 400,
        "cpu": 30,
        "downstream": 0
    }
    requests.post(f"{BASE_URL}/incident/inject", json=payload)
    time.sleep(1)

    print("\nStep 3: Triggering Analysis...")
    # Fetch current state to send to analyze
    # (In real app, dashboard sends its current state)
    graph_res = requests.get(f"{BASE_URL}/incident/graph")
    nodes = graph_res.json().get("nodes", [])
    
    analyze_payload = {"services": {}}
    for n in nodes:
        analyze_payload["services"][n["id"]] = {
            "error_rate": n["error_rate"],
            "latency": n["latency"],
            "cpu_usage": n["cpu_usage"],
            "downstream_failures": n["downstream_failures"]
        }
    
    res = requests.post(f"{BASE_URL}/incident/analyze", json=analyze_payload)
    data = res.json()
    
    print("\nAnalysis Result:")
    hypotheses = data.get("ai_hypotheses", [])
    for i, h in enumerate(hypotheses):
        print(f"#{i+1}: {h['service']} - {h['confidence']}% confidence")

    top_suspect = hypotheses[0]['service'] if hypotheses else None
    if top_suspect == "frontend":
        print("\nSUCCESS: Frontend is the top suspect!")
    else:
        print(f"\nFAILURE: {top_suspect} is the top suspect. Expected frontend.")

if __name__ == "__main__":
    try:
        test_ranking()
    except Exception as e:
        print(f"Error: {e}")
