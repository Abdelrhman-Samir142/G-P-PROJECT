from rest_framework import serializers
from .models import Auction, Bid

class BidSerializer(serializers.ModelSerializer):
    """Bid serializer with bidder info"""
    bidder_name = serializers.CharField(source='bidder.username', read_only=True)
    bidder_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = Bid
        fields = ['id', 'auction', 'bidder', 'bidder_name', 'bidder_avatar', 'amount', 'created_at']
        read_only_fields = ['id', 'created_at']
        
    def get_bidder_avatar(self, obj):
        from users.models import UserProfile
        try:
            profile = obj.bidder.profile
            if profile.avatar:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profile.avatar.url)
        except UserProfile.DoesNotExist:
            return None

class AuctionSerializer(serializers.ModelSerializer):
    """Auction serializer with bidding history"""
    bids = BidSerializer(many=True, read_only=True)
    highest_bidder_name = serializers.CharField(source='highest_bidder.username', read_only=True, allow_null=True)
    total_bids = serializers.SerializerMethodField()
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Auction
        fields = [
            'id', 'product', 'product_title', 'product_image',
            'starting_bid', 'current_bid', 'highest_bidder', 
            'highest_bidder_name', 'start_time', 'end_time', 
            'is_active', 'total_bids', 'bids'
        ]
        read_only_fields = ['id', 'current_bid', 'highest_bidder']

    def get_total_bids(self, obj):
        return obj.bids.count()

    def get_product_image(self, obj):
        primary_img = obj.product.images.filter(is_primary=True).first()
        if primary_img:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_img.image.url)
        return None
