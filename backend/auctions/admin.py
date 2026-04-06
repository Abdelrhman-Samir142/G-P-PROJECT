from django.contrib import admin
from .models import Auction, Bid


@admin.register(Auction)
class AuctionAdmin(admin.ModelAdmin):
    list_display = ['product', 'current_bid', 'highest_bidder', 'end_time', 'is_active']
    list_filter = ['is_active', 'end_time']
    search_fields = ['product__title']
    readonly_fields = ['created_at']


@admin.register(Bid)
class BidAdmin(admin.ModelAdmin):
    list_display = ['auction', 'bidder', 'amount', 'created_at']
    list_filter = ['created_at']
    search_fields = ['auction__product__title', 'bidder__username']
    readonly_fields = ['created_at']
