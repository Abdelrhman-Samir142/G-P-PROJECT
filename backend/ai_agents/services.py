"""
AI Agents Domain — Service Layer
Encapsulates YOLO classification, Hybrid RAG/LLM evaluation,
and the auto-bidding/counter-bidding engine.
"""
from django.db import transaction
from decimal import Decimal
import logging

from catalog.models import Product
from auctions.models import Auction, Bid
from communications.services import NotificationService, ChatService
from .models import UserAgent

logger = logging.getLogger(__name__)


class AutoBiddingService:
    BID_INCREMENT = Decimal('50.00')

    @staticmethod
    def evaluate_agents(prompt, product):
        """Invoke LangChain graph to evaluate the product against user prompt."""
        from ai.agent_graph import smart_agent_evaluator
        if not prompt.strip():
            return True

        logger.info(f"[AgentGraph] Evaluating product '{product.title}' against agent requirements...")
        try:
            eval_result = smart_agent_evaluator.invoke({
                "product_title": product.title,
                "product_desc": product.description,
                "product_condition": product.condition,
                "product_price": str(product.price),
                "agent_requirements": prompt,
            })
            is_match = eval_result.get("is_match", False)
            if is_match:
                logger.info(f"[AgentGraph] MATCH: {eval_result.get('reasoning')}")
            else:
                logger.info(f"[AgentGraph] REJECT: {eval_result.get('reasoning')}")
            return is_match
        except Exception as e:
            logger.error(f"[AgentGraph] Error evaluating agent requirement: {e}")
            return False

    @staticmethod
    def notify_agent_bid(agent, auction, amount, detected_item, outbid=False):
        """
        Send notification and chat message to agent's owner about a bid.
        Delegates to communications domain services.
        """
        from ai.classifier import YOLO_CLASS_LABELS
        item_label = YOLO_CLASS_LABELS.get(detected_item, detected_item)
        product = auction.product

        if outbid:
            title = "🤖 الوكيل الذكي خسر المزايدة"
            message = (
                f"الوكيل الذكي بتاعك زايد بمبلغ {amount} جنيه على \"{product.title}\" ({item_label}) "
                f"لكن فيه مزايد تاني كسب. ميزانيتك القصوى كانت {agent.max_budget} جنيه."
            )
        else:
            title = "🤖 الوكيل الذكي زايد بنجاح!"
            message = (
                f"الوكيل الذكي بتاعك لسه حاطط مزايدة بقيمة {amount} جنيه "
                f"على \"{product.title}\" ({item_label})! ✅"
            )

        # Notification via communications service
        NotificationService.create_notification(
            user=agent.user,
            title=title,
            message=message,
            related_product=product
        )

        # Chat message via communications service
        ChatService.send_system_message(
            product=product,
            recipient=agent.user,
            sender=product.owner,
            content=message
        )

    @staticmethod
    @transaction.atomic
    def process_auto_bidding(auction_id, detected_item):
        """Logic triggered right after a product classification."""
        try:
            auction = Auction.objects.get(id=auction_id)
        except Auction.DoesNotExist:
            return

        seller = auction.product.owner
        starting_bid = auction.starting_bid

        min_required_budget = auction.current_bid + AutoBiddingService.BID_INCREMENT
        if auction.highest_bidder is None:
            min_required_budget = starting_bid

        potential_agents = list(
            UserAgent.objects.filter(
                target_item=detected_item,
                is_active=True,
                max_budget__gte=min_required_budget
            ).exclude(user=seller)
             .exclude(user=auction.highest_bidder)
             .select_related('user')
        )

        matching_agents = []
        for agent in potential_agents:
            if AutoBiddingService.evaluate_agents(agent.requirements_prompt, auction.product):
                matching_agents.append(agent)

        matching_agents.sort(key=lambda a: a.max_budget, reverse=True)

        if not matching_agents:
            logger.info(f"[Agent] No matching agents for '{detected_item}'")
            return

        if len(matching_agents) == 1:
            agent = matching_agents[0]
            bid_amount = starting_bid

            Bid.objects.create(auction=auction, bidder=agent.user, amount=bid_amount)
            auction.current_bid = bid_amount
            auction.highest_bidder = agent.user
            auction.save(update_fields=['current_bid', 'highest_bidder'])

            AutoBiddingService.notify_agent_bid(agent, auction, bid_amount, detected_item)
            logger.info(f"[Agent] ✅ Single agent bid {bid_amount}")
        else:
            winner = matching_agents[0]
            runner_up = matching_agents[1]

            winning_bid = min(winner.max_budget, runner_up.max_budget + AutoBiddingService.BID_INCREMENT)
            runner_up_bid_amount = runner_up.max_budget

            Bid.objects.create(auction=auction, bidder=runner_up.user, amount=runner_up_bid_amount)
            AutoBiddingService.notify_agent_bid(runner_up, auction, runner_up_bid_amount, detected_item, outbid=True)

            Bid.objects.create(auction=auction, bidder=winner.user, amount=winning_bid)
            auction.current_bid = winning_bid
            auction.highest_bidder = winner.user
            auction.save(update_fields=['current_bid', 'highest_bidder'])

            AutoBiddingService.notify_agent_bid(winner, auction, winning_bid, detected_item)
            logger.info(f"[Agent] ✅ Bidding war won by {winner.user.username} at {winning_bid}")

    @staticmethod
    @transaction.atomic
    def process_counter_bid(auction_id, manual_bidder_id):
        """Logic triggered after a manual bid."""
        try:
            auction = Auction.objects.get(id=auction_id)
        except Auction.DoesNotExist:
            return

        product = auction.product
        detected_item = product.detected_item

        if not detected_item:
            return

        potential_agents = list(
            UserAgent.objects
            .filter(target_item=detected_item, is_active=True)
            .exclude(user_id=manual_bidder_id)
            .exclude(user=product.owner)
            .select_related('user')
        )

        matching_agents = []
        for agent in potential_agents:
            if AutoBiddingService.evaluate_agents(agent.requirements_prompt, product):
                matching_agents.append(agent)

        for agent in matching_agents:
            auction.refresh_from_db(fields=['current_bid'])
            counter_amount = auction.current_bid + AutoBiddingService.BID_INCREMENT

            if counter_amount > agent.max_budget:
                logger.info(f"[Agent] ⛔ Budget exceeded for {agent.user.username}")
                AutoBiddingService.notify_agent_bid(agent, auction, auction.current_bid, detected_item, outbid=True)
                continue

            Bid.objects.create(auction=auction, bidder=agent.user, amount=counter_amount)
            auction.current_bid = counter_amount
            auction.highest_bidder = agent.user
            auction.save(update_fields=['current_bid', 'highest_bidder'])

            logger.info(f"[Agent] 🤖 Counter bid placed: {counter_amount}")
            AutoBiddingService.notify_agent_bid(agent, auction, counter_amount, detected_item)


