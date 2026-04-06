from django.contrib import admin
from .models import Product, ProductImage, Wishlist


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


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    search_fields = ['user__username', 'product__title']
    readonly_fields = ['created_at']
