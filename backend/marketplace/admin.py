from django.contrib import admin
from .models import UserProfile, Product, ProductImage, Auction, Bid, AIPriceAnalysis


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'trust_score', 'is_verified', 'total_sales', 'created_at']
    list_filter = ['is_verified', 'city']
    search_fields = ['user__username', 'user__email', 'phone']
    readonly_fields = ['created_at', 'updated_at']


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'category', 'price', 'status', 'is_auction', 'created_at']
    list_filter = ['category', 'condition', 'status', 'is_auction', 'created_at']
    search_fields = ['title', 'description', 'owner__username']
    readonly_fields = ['views_count', 'created_at', 'updated_at']
    inlines = [ProductImageInline]


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


@admin.register(AIPriceAnalysis)
class AIPriceAnalysisAdmin(admin.ModelAdmin):
    list_display = ['product', 'recommendation', 'market_average', 'price_difference', 'confidence_score']
    list_filter = ['recommendation']
    search_fields = ['product__title']
    readonly_fields = ['created_at']
