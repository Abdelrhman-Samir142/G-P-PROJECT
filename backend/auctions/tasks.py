from celery import shared_task
import logging
from .services import AuctionService

logger = logging.getLogger(__name__)

@shared_task
def auto_close_auctions():
    """
    Periodic task to check for expired auctions and close them.
    If there is a winner, triggers the notification sequence.
    """
    try:
        AuctionService.close_expired_auctions()
        logger.info("[Auction] Successfully ran auto_close_auctions task.")
    except Exception as e:
        logger.error(f"[Auction] Error inside auto_close_auctions: {e}")
