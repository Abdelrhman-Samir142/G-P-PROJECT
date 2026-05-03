import os
from gradio_client import Client, handle_file

try:
    client = Client("Omarh353111/khorda_yolo")
    filepath = os.path.abspath("bed.jpg")
    print(f"Uploading file {filepath}...")
    result = client.predict(
        handle_file(filepath),
        api_name="/predict"
    )
    print("Result:", result)
except Exception as e:
    print(f"Error: {e}")
