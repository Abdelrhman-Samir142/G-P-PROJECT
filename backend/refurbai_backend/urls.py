"""
RefurbAI Backend — Root URL Configuration

All domain apps are mounted under /api/ to maintain backward compatibility
with the frontend. The old monolithic 'marketplace' app is fully replaced.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # ── Domain Apps (all under /api/ prefix) ──────────────────
    path('api/', include('users.urls')),              # auth, profiles, general-stats
    path('api/', include('catalog.urls')),             # products, wishlist
    path('api/', include('auctions.urls')),            # auctions
    path('api/', include('communications.urls')),      # conversations, notifications
    path('api/', include('ai_agents.urls')),            # agents, classify-image, agent-targets

    # ── RAG / Hybrid Search ───────────────────────────────────
    path('api/rag/', include('rag.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
