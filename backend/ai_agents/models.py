from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator

class UserAgent(models.Model):
    """
    AI Auto-Bidder agent configuration.
    Each user can set up agents that watch for specific YOLO-detected items
    and automatically bid on auctions matching that item.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='agents')
    target_item = models.CharField(
        max_length=50,
        help_text="Raw YOLO class name to watch for (e.g., 'washing_machine', 'scrap_metal')"
    )
    max_budget = models.DecimalField(
        max_digits=10, decimal_places=2,
        validators=[MinValueValidator(1)],
        help_text="Maximum amount the agent is allowed to bid"
    )
    requirements_prompt = models.TextField(
        blank=True, default='',
        help_text="User's natural language requirements (e.g., 'Toshiba 10kg good condition')"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_agents'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['target_item', 'is_active']),
        ]

    def __str__(self):
        status = '✅' if self.is_active else '❌'
        return f"{status} {self.user.username} → {self.target_item} (max {self.max_budget})"
