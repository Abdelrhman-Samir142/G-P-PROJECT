from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from decimal import Decimal

from .models import Auction
from .serializers import AuctionSerializer, BidSerializer
from .services import AuctionService

class AuctionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing auctions"""
    queryset = Auction.objects.select_related(
        'product', 'product__owner', 'highest_bidder'
    ).prefetch_related('bids', 'product__images')
    serializer_class = AuctionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # Auto-close expired auctions first
        AuctionService.close_expired_auctions()
        
        queryset = super().get_queryset()
        
        # Only filter active auctions if explicitly requested
        active_only = self.request.query_params.get('active_only', 'false')
        if active_only == 'true':
            queryset = queryset.filter(is_active=True, end_time__gt=timezone.now())
        
        return queryset.order_by('-is_active', '-end_time')
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def place_bid(self, request, pk=None):
        """Place a bid on an auction"""
        auction = self.get_object()
        
        try:
            bid = AuctionService.place_bid(
                auction=auction, 
                user=request.user, 
                amount=request.data.get('amount', 0)
            )
            return Response(BidSerializer(bid).data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
