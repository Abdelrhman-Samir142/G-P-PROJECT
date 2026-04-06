from rest_framework import serializers
from .models import Product, ProductImage, Wishlist
from users.serializers import UserSerializer
from auctions.serializers import AuctionSerializer

class ProductImageSerializer(serializers.ModelSerializer):
    """Product image serializer"""
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'order']
        read_only_fields = ['id']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight product serializer for list views"""
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    primary_image = serializers.SerializerMethodField()
    is_auction = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'price', 'category', 'condition', 'status',
            'location', 'phone_number', 'is_auction',
            'auction_end_time', 'primary_image', 'owner_name', 'owner_id', 'views_count', 'created_at'
        ]
        read_only_fields = ['id', 'owner_name', 'owner_id', 'views_count', 'created_at']
    
    def get_primary_image(self, obj):
        primary_img = obj.images.filter(is_primary=True).first()
        if primary_img:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_img.image.url)
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    """Detailed product serializer with all relations"""
    owner = UserSerializer(read_only=True)
    owner_profile = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    auction = AuctionSerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'owner', 'owner_profile', 'title', 'description', 
            'price', 'category', 'condition', 'status', 'location',
            'phone_number', 'is_auction', 'auction_end_time', 
            'views_count', 'images', 'auction', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'views_count', 'created_at', 'updated_at']
    
    def get_owner_profile(self, obj):
        from users.models import UserProfile
        try:
            profile = obj.owner.profile
            return {
                'trust_score': profile.trust_score,
                'seller_rating': float(profile.seller_rating),
                'total_sales': profile.total_sales,
                'city': profile.city,
                'avatar': self.context['request'].build_absolute_uri(profile.avatar.url) if profile.avatar else None
            }
        except UserProfile.DoesNotExist:
            return None


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating products"""
    images = ProductImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'description', 'price', 'category', 'condition', 
            'location', 'phone_number', 'is_auction',
            'auction_end_time', 'images', 'uploaded_images'
        ]
        read_only_fields = ['id']
