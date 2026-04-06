from django.db import models
from django.contrib.auth.models import User

class Product(models.Model):
    """Main product model for marketplace listings"""
    
    CATEGORY_CHOICES = [
        ('scrap_metals', 'خردة ومعادن'),
        ('electronics', 'إلكترونيات وأجهزة'),
        ('furniture', 'أثاث وديكور'),
        ('cars', 'سيارات للبيع'),
        ('real_estate', 'عقارات'),
        ('books', 'كتب'),
        ('other', 'أخرى'),
    ]
    
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('like-new', 'Like New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('sold', 'Sold'),
        ('pending', 'Pending'),
        ('inactive', 'Inactive'),
    ]
    
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='good')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    location = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=20, blank=True, default='')
    is_auction = models.BooleanField(default=False)
    detected_item = models.CharField(max_length=100, blank=True, default='', help_text='YOLO detected class name for agent matching')
    auction_end_time = models.DateTimeField(null=True, blank=True)
    views_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'status']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return self.title


class ProductImage(models.Model):
    """Product images - supporting multiple images per product"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_primary = models.BooleanField(default=False)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'product_images'
        ordering = ['order', '-is_primary']
    
    def __str__(self):
        return f"Image for {self.product.title}"


class Wishlist(models.Model):
    """User's favorite/saved products"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wishlists'
        unique_together = ['user', 'product']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.product.title}"
