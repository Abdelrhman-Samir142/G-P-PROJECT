from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/auctions/<int:auction_id>/', consumers.AuctionConsumer.as_asgi()),
]
