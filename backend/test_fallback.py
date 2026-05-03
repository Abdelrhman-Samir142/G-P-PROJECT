import os
import sys
import django

sys.stdout.reconfigure(encoding='utf-8')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "refurbai_backend.settings")
django.setup()

from ai.classifier import guess_item_from_text
from marketplace.models import Product

print("Testing fallback on recent products:")
products = Product.objects.all().order_by('-id')[:5]
for p in products:
    guessed = guess_item_from_text(p.title)
    print(f"Title: '{p.title}' -> Guessed: '{guessed}'")
