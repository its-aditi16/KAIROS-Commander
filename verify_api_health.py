import asyncio
import json
from app.routes.incident import analyze_incident, AnalyzeRequest, ServiceFeatures

async def test():
    # Use real services from the new graph engine
    req = AnalyzeRequest(services={
        "frontend": ServiceFeatures(error_rate=0.15, latency=1500, cpu_usage=85, downstream_failures=2),
        "auth-service": ServiceFeatures(error_rate=0.01, latency=80, cpu_usage=40, downstream_failures=0)
    })
    result = await analyze_incident(req)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(test())
