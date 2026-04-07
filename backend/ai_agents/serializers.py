from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Sum, Q
from .models import UserAgent
from users.models import UserProfile
from users.serializers import UserSerializer
from catalog.models import Product
from auctions.models import Auction

class UserAgentSerializer(serializers.ModelSerializer):
    """Serializer for AI Auto-Bidder agent configuration"""
    user_name = serializers.CharField(source='user.username', read_only=True)
    target_label = serializers.SerializerMethodField()

    class Meta:
        model = UserAgent
        fields = [
            'id', 'user', 'user_name', 'target_item', 'target_label',
            'max_budget', 'requirements_prompt', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_name', 'created_at', 'updated_at']

    def get_target_label(self, obj):
        """Return the human-readable Arabic label for the target item."""
        from ai.classifier import YOLO_CLASS_LABELS, CATEGORY_MAP
        item_label = YOLO_CLASS_LABELS.get(obj.target_item, obj.target_item)
        category_label = CATEGORY_MAP.get(obj.target_item, '')
        if category_label:
            return f"{item_label} ({category_label})"
        return item_label


# ──────────────────────────────────────────────────────────────
# ADMIN SERIALIZERS
# ──────────────────────────────────────────────────────────────

class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for user management in admin panel"""
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_active', 'is_staff', 'is_superuser', 'date_joined', 'profile'
        ]
        read_only_fields = ['id', 'date_joined']
    
    def get_profile(self, obj):
        try:
            profile = obj.profile
            return {
                'phone': profile.phone,
                'city': profile.city,
                'trust_score': profile.trust_score,
                'is_verified': profile.is_verified,
                'wallet_balance': float(profile.wallet_balance),
                'held_balance': float(profile.held_balance),
                'total_sales': profile.total_sales,
                'seller_rating': float(profile.seller_rating) if profile.seller_rating else 0,
            }
        except:
            return None


class AdminPlatformStatsSerializer(serializers.Serializer):
    """Serializer for overall platform statistics"""
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    total_escrow_locked = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_held_funds = serializers.DecimalField(max_digits=15, decimal_places=2)
    active_auctions = serializers.IntegerField()
    total_products = serializers.IntegerField()
    pending_approvals = serializers.IntegerField()
    total_transactions = serializers.IntegerField()


class AdminProductSerializer(serializers.ModelSerializer):
    """Serializer for moderation queue products"""
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner_email = serializers.CharField(source='owner.email', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'owner', 'owner_username', 'owner_email', 'title', 'description',
            'price', 'category', 'status', 'created_at', 'detected_item'
        ]
        read_only_fields = ['id', 'owner', 'created_at']


class AdminBanUserSerializer(serializers.Serializer):
    """Serializer for banning/suspending users"""
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)
    days = serializers.IntegerField(default=0, help_text="0 = permanent ban")

