from celery import shared_task
from django.utils import timezone
import logging
from catalog.models import Product
from auctions.models import Auction
from .services import AutoBiddingService

logger = logging.getLogger(__name__)


@shared_task
def poll_active_auctions():
    """
    Periodic task: Find active auctions and trigger agent checks.
    Replaces the old run_agents management command.
    """
    now = timezone.now()
    active_auctions = Auction.objects.filter(
        is_active=True,
        end_time__gt=now
    ).select_related('product')

    count = 0
    for auction in active_auctions:
        detected_item = auction.product.detected_item
        if not detected_item:
            continue

        try:
            AutoBiddingService.process_auto_bidding(auction.id, detected_item)
            count += 1
        except Exception as e:
            logger.error(f"[Agent] Error processing polling for auction {auction.id}: {e}")
    if count > 0:
        logger.info(f"[Agent] Polled {count} active auctions.")
    return count


@shared_task
def trigger_auto_bidding(auction_id, product_id, image_path):
    """
    Asynchronous task: classify image + run auto-bidding.
    Called by catalog.services after product creation.
    """
    logger.info(f"[Agent] trigger_auto_bidding for auction {auction_id} with image {image_path}")
    from ai.classifier import classify_image # Inside to prevent circular/startup imports if classifier is heavy
    try:
        result = classify_image(image_path)
        detected_item = result.get('detected_class')
        if detected_item:
            logger.info(f"[Agent] Classified '{detected_item}'")
            product = Product.objects.get(id=product_id)
            product.detected_item = detected_item
            product.save(update_fields=['detected_item'])

            AutoBiddingService.process_auto_bidding(auction_id, detected_item)
    except Exception as e:
        logger.error(f"[Agent] Error during classification/bidding: {e}")


@shared_task
def trigger_counter_bid(auction_id, manual_bidder_id):
    """
    Asynchronous task: run counter-bidding after a manual bid.
    Called by auctions.services after a user places a bid.
    """
    logger.info(f"[Agent] trigger_counter_bid for auction {auction_id} by user {manual_bidder_id}")
    try:
        AutoBiddingService.process_counter_bid(auction_id, manual_bidder_id)
    except Exception as e:
        logger.error(f"[Agent] Error during counter bidding: {e}")
