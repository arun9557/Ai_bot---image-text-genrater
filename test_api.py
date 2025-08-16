import requests
import json

try:
    # Test the chat API
    response = requests.post('http://localhost:5000/api/chat', 
                           json={'message': 'hello'})
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
