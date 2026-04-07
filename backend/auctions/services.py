from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from auctions.models import Auction, Bid
from communications.services import NotificationService
from users.services import WalletService

class AuctionService:
    BID_INCREMENT = Decimal('50.00')

    @staticmethod
    @transaction.atomic
    def place_bid(auction, user, amount):
        """Core business logic for placing a bid by a user"""
        # Lock the auction row to prevent race conditions
        auction = Auction.objects.select_for_update().get(id=auction.id)

        amount = Decimal(str(amount))
        
        # Validation checks
        if not auction.is_active:
            raise ValueError('Auction is not active')
            
        if auction.end_time < timezone.now():
            AuctionService.close_auction(auction)
            raise ValueError('Auction has ended')
            
        if auction.product.owner == user:
            raise ValueError('You cannot bid on your own auction')
            
        if amount <= auction.current_bid:
            raise ValueError(f'Bid must be higher than current price ({auction.current_bid})')

        # Hold funds for the new bidder (will raise ValueError if insufficient available balance)
        WalletService.hold_funds(user, amount)

        # Release funds for the previous highest bidder
        if auction.highest_bidder and auction.highest_bidder != user:
            WalletService.release_funds(auction.highest_bidder, auction.current_bid)
            
        # Create bid
        bid = Bid.objects.create(
            auction=auction,
            bidder=user,
            amount=amount
        )
        
        # Update auction state
        auction.current_bid = amount
        auction.highest_bidder = user
        auction.save(update_fields=['current_bid', 'highest_bidder'])
        
        # Trigger agents counter-bidding asynchronously
        from ai_agents.tasks import trigger_counter_bid
        trigger_counter_bid.delay(auction.id, user.id)
        
        # Dispatch bid update to WebSocket connected clients
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'auction_{auction.id}',
                {
                    'type': 'auction_update',
                    'message': {
                        'bid_id': bid.id,
                        'amount': str(bid.amount),
                        'bidder': user.username,
                        'current_bid': str(auction.current_bid)
                    }
                }
            )
        
        return bid

    @staticmethod
    @transaction.atomic
    def close_auction(auction):
        """Close an auction and notify winners"""
        # Lock the auction row
        auction = Auction.objects.select_for_update().get(id=auction.id)

        if not auction.is_active:
            return
            
        auction.is_active = False
        auction.save(update_fields=['is_active'])
        
        # Mark product as sold
        auction.product.status = 'sold'
        auction.product.save(update_fields=['status'])
        
        # Notify winner and commit funds
        if auction.highest_bidder:
            WalletService.commit_funds(auction.highest_bidder, auction.current_bid)
            NotificationService.notify_auction_winner(auction)

    @staticmethod
    def close_expired_auctions():
        """Find and close all expired auctions"""
        expired = Auction.objects.filter(is_active=True, end_time__lte=timezone.now())
        for auction in expired:
            AuctionService.close_auction(auction)

