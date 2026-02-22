import requests
import json

def test_inject():
    url = "http://localhost:8001/incident/inject"
    payload = {
        "service": "database",
        "error_rate": 0.05,
        "latency": 200,
        "cpu": 60,
        "downstream": 0,
        "reset_scenario": False
    }
    print(f"Testing POST {url}...")
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_inject()
