from django.db import models
from django.contrib.auth.models import User
from catalog.models import Product

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
