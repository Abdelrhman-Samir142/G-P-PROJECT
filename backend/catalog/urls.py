from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, wishlist_list, wishlist_toggle, wishlist_check, wishlist_ids

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
    path('wishlist/', wishlist_list, name='wishlist-list'),
    path('wishlist/toggle/<int:product_id>/', wishlist_toggle, name='wishlist-toggle'),
    path('wishlist/check/<int:product_id>/', wishlist_check, name='wishlist-check'),
    path('wishlist/ids/', wishlist_ids, name='wishlist-ids'),
]
