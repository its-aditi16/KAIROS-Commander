
import pandas as pd
import numpy as np
from app.engines.ml_model import train_model, predict_service_probability, FEATURE_COLUMNS
from app.engines.explainability import generate_explainability
from app.engines.graph_engine import GraphEngine

def test_frontend_anomaly():
    print("--- Testing Frontend Anomaly Ranker ---")
    
    # 1. Setup mock features for a system state where only frontend is abnormal
    # Using the same data the user reported
    service_states = {
        "frontend": {
            "error_rate": 0.06, # Testing with 6% as reported by user
            "latency": 400,
            "cpu_usage": 30,
            "downstream_failures": 0
        },
        "auth-service": {
            "error_rate": 0.01,
            "latency": 50,
            "cpu_usage": 20,
            "downstream_failures": 0
        },
        "payment-service": {
            "error_rate": 0.01,
            "latency": 50,
            "cpu_usage": 20,
            "downstream_failures": 0
        },
        "database": {
            "error_rate": 0.01,
            "latency": 50,
            "cpu_usage": 20,
            "downstream_failures": 0
        }
    }

    # 2. Re-calculate impact scores using request data (simulating fixed incident.py logic)
    ge = GraphEngine()
    for svc, metrics in service_states.items():
        ge.attach_telemetry({
            "service": svc,
            "error_rate": metrics["error_rate"],
            "latency": metrics["latency"],
            "cpu": metrics["cpu_usage"],
            "downstream_failures": metrics["downstream_failures"]
        })
    
    impact_scores = ge.calculate_impact()
    print(f"Calculated Impact Scores: {impact_scores}")

    # 3. Predict probabilities for each service
    predictions = []
    for svc, metrics in service_states.items():
        feat = metrics.copy()
        feat["impact_score"] = impact_scores.get(svc, 0)
        
        prob = predict_service_probability(feat)
        predictions.append({"service": svc, "prob": prob, "features": feat})
        print(f"Service: {svc:15} | Prob: {prob:.4f} | Impact: {feat['impact_score']:.2f}")

    # Sort results
    predictions.sort(key=lambda x: x["prob"], reverse=True)
    top = predictions[0]

    print(f"\nTop Suspect: {top['service']} (Prob: {top['prob']:.4f})")
    
    # Assertions
    if top['service'] == "frontend":
        print("✅ SUCCESS: Frontend correctly identified as root cause.")
    else:
        print(f"❌ FAILURE: {top['service']} identified instead of frontend.")

    # 4. Verify Explainability mapping
    print("\n--- Verifying Explainability Mapping ---")
    explain_result = generate_explainability(top["service"], top["features"])
    print(f"Summary: {explain_result['summary']}")
    
    print("\nFeature Importance:")
    for feat in explain_result['feature_importance']:
        print(f"- {feat['feature']}: {feat['impact_percent']:.1f}% impact (SHAP: {feat['shap_value']:.4f})")

    # Check if Error Rate is the top driver for frontend
    top_driver = explain_result['feature_importance'][0]['feature']
    if top_driver == "Error Rate" and top['service'] == "frontend":
         print("✅ SUCCESS: Error Rate identified as primary driver for frontend anomaly.")
    else:
         print(f"⚠️ NOTE: Top driver is {top_driver}. Check if this makes sense for the injected metrics.")

if __name__ == "__main__":
    test_frontend_anomaly()
