import os
import sys
import django

sys.stdout.reconfigure(encoding='utf-8')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "refurbai_backend.settings")
django.setup()

from marketplace.models import Product, Auction, Notification, UserAgent

print("=== LATEST PRODUCT ===")
p = Product.objects.order_by('-id').first()
if p:
    auc_id = p.auction.id if hasattr(p, 'auction') else None
    print(f"ID: {p.id} | Title: {p.title} | Detected: '{p.detected_item}' | Owner: {p.owner.username} | Auction: {auc_id}")
    if hasattr(p, 'auction'):
        print(f"Auction Bids: {p.auction.bids.count()} | Current Bid: {p.auction.current_bid}")

print("\n=== AGENTS ===")
agents = UserAgent.objects.filter(is_active=True, target_item='bed')
for a in agents:
    print(f"AgentID: {a.id} | User: {a.user.username} | Target: {a.target_item} | Budget: {a.max_budget}")

print("\n=== LATEST NOTIFICATIONS ===")
for n in Notification.objects.all().order_by("-id")[:5]:
    pid = n.related_product_id if n.related_product else 'None'
    print(f"Notif: {n.title} | User: {n.user.username} | ProductID: {pid} | Reasoning: {n.reasoning}")

