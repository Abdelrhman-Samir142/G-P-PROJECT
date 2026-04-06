from django.contrib import admin
from .models import UserAgent


@admin.register(UserAgent)
class UserAgentAdmin(admin.ModelAdmin):
    list_display = ['user', 'target_item', 'max_budget', 'is_active', 'created_at']
    list_filter = ['is_active', 'target_item']
    search_fields = ['user__username', 'target_item']
    readonly_fields = ['created_at', 'updated_at']
