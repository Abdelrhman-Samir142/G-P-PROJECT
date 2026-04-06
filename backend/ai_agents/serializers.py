from rest_framework import serializers
from .models import UserAgent
from users.serializers import UserSerializer

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
