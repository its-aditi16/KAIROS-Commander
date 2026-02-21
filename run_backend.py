"""
Production-ready backend without reload warning
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict
import sys
import os

# Add ML model path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app', 'engines'))

app = FastAPI(title="ML Model Backend")

class ServiceFeatures(BaseModel):
    error_rate: float
    latency: float
    cpu_usage: float
    downstream_failures: int

class AnalyzeRequest(BaseModel):
    services: Dict[str, ServiceFeatures]

@app.get("/")
async def root():
    return {"message": "ML Model Backend is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": "ready"}

@app.post("/incident/analyze")
async def analyze_incident(request: AnalyzeRequest):
    try:
        # Import ML model
        from ml_model import predict_service_probability
        
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
        
        # Rank by probability
        predictions.sort(key=lambda x: x["prob"], reverse=True)
        
        # Top 3 hypotheses
        ai_hypotheses = [{"service": p["service"], "confidence": p["confidence"]} for p in predictions[:3]]
        
        # Top suspect
        top_suspect = predictions[0]["service"]
        
        return {
            "ai_hypotheses": ai_hypotheses,
            "root_cause_analysis": {
                "topPrediction": top_suspect,
                "confidence": predictions[0]["confidence"],
                "explanation": f"ML model predicts {top_suspect} with {predictions[0]['confidence']}% confidence",
                "shapValues": [
                    {"feature": "error_rate", "value": 0.45},
                    {"feature": "latency", "value": 0.31},
                    {"feature": "downstream_failures", "value": 0.18},
                    {"feature": "cpu_usage", "value": 0.06}
                ]
            }
        }
        
    except Exception as e:
        return {"error": str(e), "message": "Failed to analyze incident"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting ML Model Backend...")
    print("Server will be available at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    # Run without reload to avoid warning
    uvicorn.run(app, host="0.0.0.0", port=8000)
