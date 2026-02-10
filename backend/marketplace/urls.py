from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    ProductViewSet,
    AuctionViewSet,
    UserProfileViewSet,
    register_view,
    current_user_view
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'auctions', AuctionViewSet, basename='auction')
router.register(r'profiles', UserProfileViewSet, basename='profile')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register_view, name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', current_user_view, name='current_user'),
    
    # Router URLs
    path('', include(router.urls)),
]
