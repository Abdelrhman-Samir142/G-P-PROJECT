"""
Marketplace signals.
Triggers agent discovery when a new direct-sale product is created.
"""

import logging
import threading
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import connection

logger = logging.getLogger(__name__)


def _run_discovery_in_background(product_id):
    """Run agent discovery in a background thread."""
    try:
        from marketplace.serializers import run_agent_discovery_async
        run_agent_discovery_async(product_id)
    except Exception as e:
        logger.error(f"[Marketplace/Signal] Discovery failed for product #{product_id}: {e}")
    finally:
        connection.close()


@receiver(post_save, sender='marketplace.Product')
def trigger_agent_discovery(sender, instance, created, **kwargs):
    """
    When a NEW active, non-auction product is created,
    check if any agents are interested in it.
    """
    if not created:
        return

    if instance.status != 'active':
        return

    if instance.is_auction:
        return  # Auctions are handled by run_auto_bidding

    if not instance.detected_item:
        return  # No YOLO classification = can't match agents

    logger.info(f"[Marketplace/Signal] New product #{instance.id} detected as '{instance.detected_item}', triggering agent discovery")

    threading.Thread(
        target=_run_discovery_in_background,
        args=(instance.id,),
        daemon=True,
    ).start()
