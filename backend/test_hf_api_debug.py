import requests
import json
import os

DEFAULT_HF_URL = "https://omarh353111-khorda-yolo.hf.space"
image_path = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"

predict_url = f"{DEFAULT_HF_URL}/gradio_api/call/predict"
payload = {"data": [{"url": image_path, "meta": {"_type": "gradio.FileData"}}]}

print(f"Calling {predict_url}...")
resp = requests.post(predict_url, json=payload, headers={"Content-Type": "application/json"})
print(f"POST Status: {resp.status_code}")
event_id = resp.json().get("event_id")
print(f"Event ID: {event_id}")

result_url = f"{DEFAULT_HF_URL}/gradio_api/call/predict/{event_id}"
print(f"Calling GET {result_url}...")
result_resp = requests.get(result_url, stream=True)
print(f"GET Status: {result_resp.status_code}")

for line in result_resp.iter_lines(decode_unicode=True):
    print(f"SSE LINE: {line}")
