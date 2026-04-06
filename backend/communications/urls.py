from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConversationViewSet,
    notifications_list,
    notifications_mark_read,
    notifications_unread_count
)

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')

urlpatterns = [
    path('', include(router.urls)),
    path('notifications/', notifications_list, name='notifications-list'),
    path('notifications/mark-read/', notifications_mark_read, name='notifications-mark-read'),
    path('notifications/unread-count/', notifications_unread_count, name='notifications-unread-count'),
]
