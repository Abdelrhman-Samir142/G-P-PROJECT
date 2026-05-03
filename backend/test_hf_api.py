import os
import sys
import django

sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "refurbai_backend.settings")
django.setup()

from ai.classifier import classify_image

# Use a random public image of a bed to test
test_url = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"

print("Testing HF Space with test URL...")
result = classify_image(test_url)
print(f"Result: {result}")
