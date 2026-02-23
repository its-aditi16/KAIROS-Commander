import requests
import json

url = "http://localhost:8001/incident/inject"
payload = {
    "service": "frontend",
    "error_rate": 0.15,
    "latency": 1500,
    "cpu": 85,
    "downstream": 2,
    "reset_scenario": False
}

try:
    response = requests.post(url, json=payload)
    print(f"Status: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
