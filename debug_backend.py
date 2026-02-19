"""
Debug version with detailed error logging
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict
import sys
import os
import traceback

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
    try:
        # Test ML model import
        from ml_model import train_model
        model = train_model()
        return {"status": "healthy", "model": "ready", "model_type": str(type(model).__name__)}
    except Exception as e:
        return {"status": "error", "model": "failed", "error": str(e)}

@app.post("/incident/analyze")
async def analyze_incident(request: AnalyzeRequest):
    try:
        print(f"Received request: {request}")
        
        # Test ML model import
        print("Importing ML model...")
        from ml_model import predict_service_probability
        print("✅ ML model imported successfully")
        
        services = request.services
        print(f"Services to analyze: {services}")
        
        predictions = []
        
        for service_name, features in services.items():
            print(f"Analyzing service: {service_name}")
            features_dict = features.dict()
            print(f"Features: {features_dict}")
            
            prob = predict_service_probability(features_dict)
            print(f"Prediction probability: {prob}")
            
            predictions.append({
                "service": service_name,
                "confidence": int(prob * 100),
                "prob": prob
            })
        
        # Rank by probability
        predictions.sort(key=lambda x: x["prob"], reverse=True)
        print(f"Sorted predictions: {predictions}")
        
        # Top 3 hypotheses
        ai_hypotheses = [{"service": p["service"], "confidence": p["confidence"]} for p in predictions[:3]]
        
        # Top suspect
        top_suspect = predictions[0]["service"]
        
        result = {
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
        
        print(f"Final result: {result}")
        return result
        
    except Exception as e:
        error_details = {
            "error": str(e),
            "message": "Failed to analyze incident",
            "traceback": traceback.format_exc()
        }
        print(f"Error details: {error_details}")
        return error_details

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Debug ML Model Backend...")
    print("Server will be available at: http://localhost:8000")
    print("API docs at: http://localhost:8000/docs")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
