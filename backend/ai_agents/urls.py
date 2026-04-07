from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserAgentViewSet, AdminViewSet, get_agent_targets, classify_image_view

router = DefaultRouter()
router.register(r'agents', UserAgentViewSet, basename='agent')
router.register(r'admin', AdminViewSet, basename='admin')

urlpatterns = [
    path('', include(router.urls)),
    path('agent-targets/', get_agent_targets, name='agent-targets'),
    path('classify-image/', classify_image_view, name='classify-image'),
]
