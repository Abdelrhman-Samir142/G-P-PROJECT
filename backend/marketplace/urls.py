from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    ProductViewSet,
    AuctionViewSet,
    UserProfileViewSet,
    register_view,
<<<<<<< HEAD
    current_user_view,
    get_general_stats,
    CustomTokenObtainPairView
=======
    current_user_view
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'auctions', AuctionViewSet, basename='auction')
router.register(r'profiles', UserProfileViewSet, basename='profile')

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register_view, name='register'),
<<<<<<< HEAD
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', current_user_view, name='current_user'),
    path('general-stats/', get_general_stats, name='general-stats'),
=======
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', current_user_view, name='current_user'),
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
    
    # Router URLs
    path('', include(router.urls)),
]
