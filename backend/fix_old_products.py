import os
import sys
import django

sys.stdout.reconfigure(encoding='utf-8')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "refurbai_backend.settings")
django.setup()

from ai.classifier import guess_item_from_text
from marketplace.models import Product, Auction
from marketplace.serializers import run_auto_bidding

print("Fixing old products and triggering auto-bidding...")
products = Product.objects.filter(detected_item__in=['', 'other', None])
fixed_count = 0

for p in products:
    guessed = guess_item_from_text(p.title)
    if guessed:
        print(f"Fixed Product {p.id} ('{p.title}') -> '{guessed}'")
        p.detected_item = guessed
        p.save(update_fields=['detected_item'])
        fixed_count += 1
        
        # If it's in an active auction, trigger the agent!
        try:
            auc = p.auction
            if auc.status == 'active':
                print(f"Triggering Agent for Auction {auc.id}...")
                run_auto_bidding(auc, guessed)
        except Exception as e:
            # hasattr doesn't always work nicely with related names in django if they don't exist
            pass

print(f"\nSuccessfully fixed {fixed_count} old products!")
