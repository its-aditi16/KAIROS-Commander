import requests
import json

def test_reset():
    url = "http://localhost:8001/incident/reset"
    print(f"Testing POST {url}...")
    try:
        response = requests.post(url)
        print(f"Status: {response.status_code}")
        print(f"Body: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_reset()
