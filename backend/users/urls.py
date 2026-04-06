"""
Users Domain — URL Configuration
Auth endpoints, profile management, and general stats.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserProfileViewSet,
    CustomTokenObtainPairView,
    register_view,
    current_user_view,
    recharge_wallet_view,
    get_general_stats,
)

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet, basename='profile')

urlpatterns = [
    # Authentication
    path('auth/register/', register_view, name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', current_user_view, name='current_user'),
    path('users/wallet/recharge/', recharge_wallet_view, name='wallet-recharge'),

    # General stats (landing page)
    path('general-stats/', get_general_stats, name='general-stats'),

    # Router (profiles)
    path('', include(router.urls)),
]
