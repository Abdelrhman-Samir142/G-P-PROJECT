import os
import sys
import django
import logging

sys.stdout.reconfigure(encoding='utf-8')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "refurbai_backend.settings")
django.setup()

from marketplace.models import Product, UserAgent, Auction, Notification
from marketplace.serializers import run_auto_bidding
from ai.agent_graph import smart_agent_evaluator

print("=== AGENTS FOR BED ===")
agents = UserAgent.objects.filter(is_active=True)
for a in agents:
    if "bed" in a.target_item.lower() or "سرير" in a.target_item.lower():
        print(f"AgentID: {a.id} | User: {a.user.username} | Target: '{a.target_item}' | Req: '{a.requirements_prompt}' | Budget: {a.max_budget}")

print("\n=== LATEST PRODUCTS ===")
products = Product.objects.all().order_by('-id')[:3]
for p in products:
    auc_id = p.auction.id if hasattr(p, 'auction') else None
    print(f"ProductID: {p.id} | Title: {p.title} | Detected: '{p.detected_item}' | Price: {p.price} | Auction: {auc_id} | Owner: {p.owner.username}")

# Let's try to run auto-bidding manually on the latest product if it's an auction
latest_auction = None
for p in products:
    if hasattr(p, 'auction'):
        latest_auction = p.auction
        break

if latest_auction:
    print(f"\n=== TESTING AUTO-BIDDING FOR AUCTION {latest_auction.id} ({latest_auction.product.title}) ===")
    detected = latest_auction.product.detected_item
    print(f"Detected item: '{detected}'")
    
    # Simulate the query run_auto_bidding uses:
    from decimal import Decimal
    
    BID_INCREMENT = max(Decimal('50.00'), min(latest_auction.current_bid * Decimal('0.05'), Decimal('500.00'))).quantize(Decimal('1.00'))
    starting_bid = latest_auction.starting_bid
    
    min_required_budget = latest_auction.current_bid + BID_INCREMENT
    if latest_auction.highest_bidder is None:
        min_required_budget = starting_bid

    seller = latest_auction.product.owner
    
    print(f"Min required budget: {min_required_budget}, Current bid: {latest_auction.current_bid}")
    
    potential_agents = list(
        UserAgent.objects.filter(
            target_item=detected,
            is_active=True,
            max_budget__gte=min_required_budget
        ).exclude(user=seller)
         .exclude(user=latest_auction.highest_bidder)
    )
    
    print(f"Potential agents matched by DB: {[a.user.username for a in potential_agents]}")
    
    for agent in potential_agents:
        print(f"\nTesting LLM for agent {agent.user.username}...")
        try:
            eval_result = smart_agent_evaluator.invoke({
                "product_title": latest_auction.product.title,
                "product_desc": latest_auction.product.description,
                "product_condition": latest_auction.product.condition,
                "product_price": str(latest_auction.product.price),
                "agent_requirements": agent.requirements_prompt,
            })
            print(f"Match: {eval_result.get('is_match')}, Reason: {eval_result.get('reason')}")
        except Exception as e:
            print(f"LLM Error: {e}")
            import traceback
            traceback.print_exc()

print("\n=== LATEST NOTIFICATIONS ===")
for n in Notification.objects.all().order_by("-id")[:5]:
    pid = n.related_product_id if n.related_product else 'None'
    print(f"Notif: {n.title} | User: {n.user.username} | ProductID: {pid} | Reasoning: {n.reasoning}")
