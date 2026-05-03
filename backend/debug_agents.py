import os
import sys
import django

sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "refurbai_backend.settings")
django.setup()

from marketplace.models import Product, UserAgent, Auction, Notification, WalletTransaction

print("\n--- AGENTS ---")
for a in UserAgent.objects.all().order_by("-id")[:10]:
    print(f"AgentID: {a.id} | User: {a.user.username} | Target: {a.target_item} | Budget: {a.max_budget} | Active: {a.is_active}")

print("\n--- PRODUCTS ---")
for p in Product.objects.all().order_by("-id")[:5]:
    is_auc = hasattr(p, 'auction')
    print(f"ProductID: {p.id} | Title: {p.title} | Owner: {p.owner.username} | Detected: {p.detected_item} | Price: {p.price} | IsAuction: {is_auc}")

print("\n--- NOTIFICATIONS ---")
for n in Notification.objects.all().order_by("-id")[:10]:
    pid = n.related_product_id if n.related_product else 'None'
    print(f"Notif: {n.title} | User: {n.user.username} | ProductID: {pid} | Reasoning: {n.reasoning}")
    
print("\n--- WALLET TRANSACTIONS ---")
for w in WalletTransaction.objects.all().order_by("-id")[:5]:
    print(f"User: {w.user.username} | Type: {w.transaction_type} | Amount: {w.amount}")
