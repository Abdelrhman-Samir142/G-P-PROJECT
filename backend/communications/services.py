"""
Communications Domain — Service Layer
All chat management and notification generation logic lives here.
"""
from django.db import models
from .models import Conversation, Message, Notification
import logging

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────
# CHAT SERVICE
# ──────────────────────────────────────────────────────────────

class ChatService:
    """Encapsulates all business logic for the chat/conversation system."""

    @staticmethod
    def get_user_conversations(user):
        """Return all conversations for a user (as buyer or seller)."""
        return Conversation.objects.filter(
            models.Q(buyer=user) | models.Q(seller=user)
        ).select_related(
            'product', 'buyer', 'seller', 'buyer__profile', 'seller__profile'
        ).prefetch_related('messages', 'product__images')

    @staticmethod
    def mark_conversation_read(conversation, user):
        """Mark all messages from the other participant as read."""
        conversation.messages.filter(
            is_read=False
        ).exclude(sender=user).update(is_read=True)

    @staticmethod
    def start_conversation(product, buyer):
        """
        Start a new conversation or return existing one.
        Raises ValueError if buyer == seller.
        """
        if product.owner == buyer:
            raise ValueError('Cannot start a conversation with yourself')

        conversation, created = Conversation.objects.get_or_create(
            product=product,
            buyer=buyer,
            defaults={'seller': product.owner}
        )
        return conversation, created

    @staticmethod
    def send_message(conversation, sender, content):
        """
        Send a message in a conversation.
        Raises PermissionError if sender is not a participant.
        Raises ValueError if content is empty.
        """
        if not content:
            raise ValueError('Message content is required')

        if sender not in [conversation.buyer, conversation.seller]:
            raise PermissionError('You are not a participant in this conversation')

        message = Message.objects.create(
            conversation=conversation,
            sender=sender,
            content=content
        )
        # Touch updated_at on the conversation
        conversation.save()

        # Dispatch chat to websocket
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'chat_{conversation.id}',
                {
                    'type': 'chat_message',
                    'message': {
                        'message_id': message.id,
                        'sender': sender.username,
                        'content': message.content,
                        'timestamp': message.timestamp.isoformat()
                    }
                }
            )

        return message

    @staticmethod
    def get_unread_count(user):
        """Return total unread message count for a user."""
        return Message.objects.filter(
            conversation__in=Conversation.objects.filter(
                models.Q(buyer=user) | models.Q(seller=user)
            ),
            is_read=False
        ).exclude(sender=user).count()

    @staticmethod
    def send_system_message(product, recipient, sender, content):
        """
        Send a system/automated message (e.g. from an AI agent or auction winner notification).
        Creates or fetches the conversation and posts the message.
        """
        try:
            conversation, _ = Conversation.objects.get_or_create(
                product=product,
                buyer=recipient,
                defaults={'seller': product.owner}
            )
            msg = Message.objects.create(
                conversation=conversation,
                sender=sender,
                content=content
            )

            # Dispatch system chat message to websocket
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f'chat_{conversation.id}',
                    {
                        'type': 'chat_message',
                        'message': {
                            'message_id': msg.id,
                            'sender': sender.username,
                            'content': msg.content,
                            'timestamp': msg.timestamp.isoformat()
                        }
                    }
                )

        except Exception as e:
            logger.error(f"[ChatService] Failed to send system message: {e}")


# ──────────────────────────────────────────────────────────────
# NOTIFICATION SERVICE
# ──────────────────────────────────────────────────────────────

class NotificationService:
    """Encapsulates all notification generation and querying logic."""

    @staticmethod
    def create_notification(user, title, message, related_product=None):
        """
        Create a notification record.
        This is the single entry-point for any domain that needs to notify a user.
        """
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            related_product=related_product
        )

        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'notify_{user.id}',
                {
                    'type': 'system_notification',
                    'message': {
                        'id': notification.id,
                        'title': notification.title,
                        'message': notification.message,
                        'created_at': notification.created_at.isoformat()
                    }
                }
            )

        return notification

    @staticmethod
    def notify_auction_winner(auction):
        """Send a congratulations message + notification to the auction winner via the chat system."""
        if not auction.highest_bidder:
            return

        product = auction.product
        winner = auction.highest_bidder

        # Chat message
        ChatService.send_system_message(
            product=product,
            recipient=winner,
            sender=product.owner,
            content=(
                f'🎉 تهانينا! لقد فزت بالمزاد على "{product.title}" '
                f'بمبلغ {auction.current_bid} جنيه. '
                f'تواصل مع البائع لإتمام عملية الشراء.'
            )
        )

        # Notification record
        NotificationService.create_notification(
            user=winner,
            title='🎉 فزت بالمزاد!',
            message=(
                f'تهانينا! لقد فزت بالمزاد على "{product.title}" '
                f'بمبلغ {auction.current_bid} جنيه.'
            ),
            related_product=product
        )

    @staticmethod
    def get_user_notifications(user, limit=50):
        """Return latest notifications for a user."""
        return Notification.objects.filter(user=user)[:limit]

    @staticmethod
    def mark_all_read(user):
        """Mark all of a user's notifications as read."""
        Notification.objects.filter(user=user, is_read=False).update(is_read=True)

    @staticmethod
    def get_unread_count(user):
        """Return unread notification count for a user."""
        return Notification.objects.filter(user=user, is_read=False).count()
