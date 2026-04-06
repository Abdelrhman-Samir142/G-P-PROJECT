from rest_framework import serializers
from .models import Conversation, Message, Notification
from users.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    """Serializer for individual chat messages"""
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'sender_name', 'sender_avatar', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender', 'created_at']

    def get_sender_avatar(self, obj):
        from users.models import UserProfile
        try:
            profile = obj.sender.profile
            if profile.avatar:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(profile.avatar.url)
        except UserProfile.DoesNotExist:
            pass
        return None


class ConversationListSerializer(serializers.ModelSerializer):
    """Lightweight conversation serializer for list views"""
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    other_participant = serializers.SerializerMethodField()
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'product', 'product_title', 'product_image',
            'other_participant', 'last_message', 'unread_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'content': last_msg.content[:100],
                'sender_name': last_msg.sender.username,
                'created_at': last_msg.created_at.isoformat(),
                'is_read': last_msg.is_read,
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0

    def get_other_participant(self, obj):
        request = self.context.get('request')
        if request and request.user:
            other_user = obj.seller if request.user == obj.buyer else obj.buyer
            avatar_url = None
            try:
                if other_user.profile.avatar:
                    avatar_url = request.build_absolute_uri(other_user.profile.avatar.url)
            except Exception:
                pass
            return {
                'id': other_user.id,
                'username': other_user.username,
                'avatar': avatar_url,
            }
        return None

    def get_product_image(self, obj):
        primary_img = obj.product.images.filter(is_primary=True).first()
        if primary_img:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_img.image.url)
        return None


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Full conversation serializer with all messages"""
    messages = MessageSerializer(many=True, read_only=True)
    buyer = UserSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    product_title = serializers.CharField(source='product.title', read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'product', 'product_title', 'product_image',
            'buyer', 'seller', 'messages', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_product_image(self, obj):
        primary_img = obj.product.images.filter(is_primary=True).first()
        if primary_img:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_img.image.url)
        return None


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for user notifications"""
    product_title = serializers.CharField(source='related_product.title', read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'related_product', 'product_title', 'created_at']
        read_only_fields = ['id', 'title', 'message', 'related_product', 'created_at']
