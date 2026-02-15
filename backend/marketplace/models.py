from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class UserProfile(models.Model):
    """Extended user profile with verification and location"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=15, blank=True)
    city = models.CharField(max_length=100)
    trust_score = models.IntegerField(
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    is_verified = models.BooleanField(default=False)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_sales = models.IntegerField(default=0)
    seller_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Product(models.Model):
    """Main product model for marketplace listings"""
    
    CATEGORY_CHOICES = [
        ('electronics', 'أجهزة وإلكترونيات'),
        ('scrap_metals', 'خردة ومعادن'),
        ('books', 'كتب'),
        ('furniture', 'أثاث وديكور'),
        ('real_estate', 'عقارات'),
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
    auction_start_time = models.DateTimeField(null=True, blank=True)
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


class Favorite(models.Model):
    """User favorite products"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'favorites'
        unique_together = ['user', 'product']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} likes {self.product.title}"


class Auction(models.Model):
    """Auction model linked to products"""
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='auction')
    starting_bid = models.DecimalField(max_digits=10, decimal_places=2)
    current_bid = models.DecimalField(max_digits=10, decimal_places=2)
    highest_bidder = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_auctions')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'auctions'
        ordering = ['end_time']
    
    def __str__(self):
        return f"Auction for {self.product.title}"


class Bid(models.Model):
    """Individual bids on auctions"""
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name='bids')
    bidder = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bids')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'bids'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['auction', '-amount']),
        ]
    
    def __str__(self):
        return f"Bid of {self.amount} by {self.bidder.username}"


class AIPriceAnalysis(models.Model):
    """AI-generated price analysis for products"""
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='ai_analysis')
    market_average = models.DecimalField(max_digits=10, decimal_places=2)
    price_difference = models.DecimalField(max_digits=5, decimal_places=2)  # Percentage
    recommendation = models.CharField(max_length=20, choices=[
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('high', 'High'),
    ])
    similar_products_count = models.IntegerField()
    confidence_score = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'ai_price_analyses'
    
    def __str__(self):
        return f"AI Analysis for {self.product.title}"
