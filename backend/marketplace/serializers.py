from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Product, ProductImage, Auction, Bid, AIPriceAnalysis


class UserSerializer(serializers.ModelSerializer):
    """User serializer for authentication responses"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class UserProfileSerializer(serializers.ModelSerializer):
    """User profile serializer"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'phone', 'city', 'trust_score', 
            'is_verified', 'avatar', 'wallet_balance', 
            'total_sales', 'seller_rating', 'created_at'
        ]
        read_only_fields = ['id', 'trust_score', 'wallet_balance', 'total_sales', 'seller_rating', 'created_at']


class ProductImageSerializer(serializers.ModelSerializer):
    """Product image serializer"""
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'order']
        read_only_fields = ['id']


class BidSerializer(serializers.ModelSerializer):
    """Bid serializer with bidder info"""
    bidder_name = serializers.CharField(source='bidder.username', read_only=True)
    bidder_avatar = serializers.ImageField(source='bidder.profile.avatar', read_only=True)
    
    class Meta:
        model = Bid
        fields = ['id', 'auction', 'bidder', 'bidder_name', 'bidder_avatar', 'amount', 'created_at']
        read_only_fields = ['id', 'created_at']


class AuctionSerializer(serializers.ModelSerializer):
    """Auction serializer with bidding history"""
    bids = BidSerializer(many=True, read_only=True)
    highest_bidder_name = serializers.CharField(source='highest_bidder.username', read_only=True, allow_null=True)
    
    class Meta:
        model = Auction
        fields = [
            'id', 'starting_bid', 'current_bid', 'highest_bidder', 
            'highest_bidder_name', 'end_time', 'is_active', 'bids'
        ]
        read_only_fields = ['id', 'current_bid', 'highest_bidder']


class AIPriceAnalysisSerializer(serializers.ModelSerializer):
    """AI price analysis serializer"""
    class Meta:
        model = AIPriceAnalysis
        fields = [
            'id', 'market_average', 'price_difference', 'recommendation',
            'similar_products_count', 'confidence_score', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight product serializer for list views"""
    owner_name = serializers.CharField(source='owner.username', read_only=True)
<<<<<<< HEAD
    owner_avatar = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    is_auction = serializers.BooleanField(read_only=True)
    is_owner = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    time_since_posted = serializers.SerializerMethodField()
=======
    primary_image = serializers.SerializerMethodField()
    is_auction = serializers.BooleanField(read_only=True)
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
    
    class Meta:
        model = Product
        fields = [
            'id', 'title', 'price', 'category', 'condition', 'status',
<<<<<<< HEAD
            'location', 'phone_number', 'is_auction', 'auction_start_time',
            'auction_end_time', 'primary_image', 'owner_name', 'owner_avatar',
            'is_owner', 'is_favorited', 'time_since_posted', 'views_count', 'created_at'
=======
            'location', 'is_auction', 'primary_image', 'owner_name',
            'views_count', 'created_at'
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
        ]
        read_only_fields = ['id', 'owner_name', 'views_count', 'created_at']
    
    def get_primary_image(self, obj):
        primary_img = obj.images.filter(is_primary=True).first()
<<<<<<< HEAD
        if not primary_img:
             primary_img = obj.images.order_by('order').first()
        
=======
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
        if primary_img:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_img.image.url)
        return None

<<<<<<< HEAD
    def get_owner_avatar(self, obj):
        try:
            if hasattr(obj.owner, 'profile') and obj.owner.profile.avatar:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.owner.profile.avatar.url)
        except Exception:
            pass
        return None

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.owner == request.user
        return False

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Optimize this with prefetch_related in ViewSet if possible, 
            # but for now efficient enough for small pages
            return obj.favorited_by.filter(user=request.user).exists()
        return False

    def get_time_since_posted(self, obj):
        from django.utils.timesince import timesince
        from django.utils import timezone
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff.days == 0:
            if diff.seconds < 3600:
                minutes = diff.seconds // 60
                return f"منذ {minutes} دقيقة" if minutes > 0 else "الآن"
            hours = diff.seconds // 3600
            return f"منذ {hours} ساعة"
        elif diff.days < 7:
            return f"منذ {diff.days} يوم"
        elif diff.days < 30:
            weeks = diff.days // 7
            return f"منذ {weeks} أسبوع"
        elif diff.days < 365:
             months = diff.days // 30
             return f"منذ {months} شهر"
        else:
            years = diff.days // 365
            return f"منذ {years} سنة"

=======
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883

class ProductDetailSerializer(serializers.ModelSerializer):
    """Detailed product serializer with all relations"""
    owner = UserSerializer(read_only=True)
    owner_profile = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    auction = AuctionSerializer(read_only=True)
    ai_analysis = AIPriceAnalysisSerializer(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'owner', 'owner_profile', 'title', 'description', 
            'price', 'category', 'condition', 'status', 'location',
<<<<<<< HEAD
            'phone_number', 'is_auction', 'auction_start_time', 'auction_end_time', 
            'views_count', 'images', 'auction', 'ai_analysis', 'created_at', 'updated_at'
=======
            'is_auction', 'views_count', 'images', 'auction', 
            'ai_analysis', 'created_at', 'updated_at'
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
        ]
        read_only_fields = ['id', 'owner', 'views_count', 'created_at', 'updated_at']
    
    def get_owner_profile(self, obj):
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
<<<<<<< HEAD
            'id', 'title', 'description', 'price', 'category', 'condition', 
            'location', 'phone_number', 'is_auction', 'auction_start_time', 
            'auction_end_time', 'images', 'uploaded_images'
=======
            'id', 'title', 'description', 'price', 'category', 
            'condition', 'location', 'is_auction', 'images', 'uploaded_images'
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
<<<<<<< HEAD
        try:
            uploaded_images = validated_data.pop('uploaded_images', [])
            product = Product.objects.create(**validated_data)
            
            # Create Auction if is_auction and end_time provided
            if product.is_auction and product.auction_end_time:
                Auction.objects.create(
                    product=product,
                    starting_bid=product.price,
                    current_bid=product.price,
                    start_time=product.auction_start_time,
                    end_time=product.auction_end_time,
                    is_active=True
                )
            
            # Create product images
            for idx, image in enumerate(uploaded_images):
                ProductImage.objects.create(
                    product=product,
                    image=image,
                    is_primary=(idx == 0),
                    order=idx
                )
            
            return product
        except Exception as e:
            if 'product' in locals():
                product.delete()
            # Log error for server-side debugging
            import traceback
            traceback.print_exc()
            # Return error to client
            raise serializers.ValidationError({"detail": f"Server Error: {str(e)}"})

    def to_representation(self, instance):
        try:
            return super().to_representation(instance)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return {
                "id": instance.id, 
                "title": instance.title, 
                "warning": "Product created but failed to serialize response",
                "error": str(e)
            }
=======
        uploaded_images = validated_data.pop('uploaded_images', [])
        product = Product.objects.create(**validated_data)
        
        # Create product images
        for idx, image in enumerate(uploaded_images):
            ProductImage.objects.create(
                product=product,
                image=image,
                is_primary=(idx == 0),
                order=idx
            )
        
        return product
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)
    city = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name', 'city', 'phone']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        city = validated_data.pop('city')
        phone = validated_data.pop('phone', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Create user profile
        UserProfile.objects.create(user=user, city=city, phone=phone)
        
        return user
