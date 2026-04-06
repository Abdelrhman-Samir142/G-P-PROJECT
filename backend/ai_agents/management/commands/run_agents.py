"""
Management command: run_agents
Polls active auctions and triggers AI agent auto-bidding.
Migrated from marketplace.management.commands.run_agents to the ai_agents domain.
"""
import time
import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from auctions.models import Auction
from ai_agents.services import AutoBiddingService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Runs the AI Agent polling loop to monitor all active auctions.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=60,
            help='Seconds to wait between loops (default: 60)'
        )

    def handle(self, *args, **options):
        interval = options['interval']
        self.stdout.write(self.style.SUCCESS(f"🚀 AI Agent Loop started (Interval: {interval}s)"))
        self.stdout.write("Press Ctrl+C to stop.")

        try:
            while True:
                self.process_auctions()
                time.sleep(interval)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("\n👋 Agent loop stopped."))

    def process_auctions(self):
        """Find active auctions and trigger agent check for each."""
        now = timezone.now()
        active_auctions = Auction.objects.filter(
            is_active=True,
            end_time__gt=now
        ).select_related('product')

        if not active_auctions.exists():
            return

        for auction in active_auctions:
            detected_item = auction.product.detected_item
            if not detected_item:
                continue

            try:
                AutoBiddingService.process_auto_bidding(auction.id, detected_item)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error processing auction {auction.id}: {e}"))
