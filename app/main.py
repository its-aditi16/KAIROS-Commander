from fastapi import FastAPI
from routes.incident import router as incident_router

app = FastAPI(title="AI Incident Commander Backend")

app.include_router(incident_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)