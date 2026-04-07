from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from django.contrib.auth.models import User
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta

from .models import UserAgent
from .serializers import (
    UserAgentSerializer, AdminUserSerializer, AdminPlatformStatsSerializer,
    AdminProductSerializer, AdminBanUserSerializer
)
from .permissions import IsAdminUser, IsSuperAdminUser
from .throttles import AIUserRateThrottle, AIAnonRateThrottle
from users.models import UserProfile
from catalog.models import Product
from auctions.models import Auction

class UserAgentViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for AI Auto-Bidder agents.
    Users can create, view, update, and delete their own agents.
    """
    serializer_class = UserAgentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserAgent.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ──────────────────────────────────────────────────────────────
# ADMIN VIEWSET
# ──────────────────────────────────────────────────────────────

class AdminViewSet(viewsets.ViewSet):
    """
    Admin-only endpoints for platform management.
    CRITICAL: Requires is_staff=True permission.
    """
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def platform_stats(self, request):
        """
        Get overall platform statistics.
        Returns: Total users, active auctions, locked escrow funds, etc.
        """
        total_users = User.objects.filter(is_active=True).count()
        active_users = User.objects.filter(
            is_active=True,
            last_login__gte=timezone.now() - timedelta(days=30)
        ).count()

        # Calculate total held/escrow funds
        held_balance = UserProfile.objects.aggregate(
            total=Sum('held_balance', default=0)
        )['total']

        # Count active auctions
        active_auctions = Auction.objects.filter(
            is_active=True,
            end_time__gt=timezone.now()
        ).count()

        # Count total products
        total_products = Product.objects.count()

        # Count pending product approvals (status='pending')
        pending_approvals = Product.objects.filter(status='pending').count()

        # For transaction count, we'll use bid count as proxy
        total_transactions = Auction.objects.aggregate(
            count=Count('bids', distinct=True)
        )['count']

        stats = {
            'total_users': total_users,
            'active_users': active_users,
            'total_escrow_locked': float(held_balance),
            'total_held_funds': float(held_balance),
            'active_auctions': active_auctions,
            'total_products': total_products,
            'pending_approvals': pending_approvals,
            'total_transactions': total_transactions,
        }

        serializer = AdminPlatformStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def users(self, request):
        """
        List all users with pagination for admin management.
        """
        queryset = User.objects.all().order_by('-date_joined')

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size

        total_count = queryset.count()
        users = queryset[start:end]

        serializer = AdminUserSerializer(users, many=True)
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'results': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='ban-user')
    def ban_user(self, request, pk=None):
        """
        Ban or suspend a user from the platform.
        """
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AdminBanUserSerializer(data=request.data)
        if serializer.is_valid():
            reason = serializer.validated_data.get('reason', 'No reason provided')
            days = serializer.validated_data.get('days', 0)

            # Deactivate user
            user.is_active = False
            user.save()

            # TODO: Log ban reason and duration to audit log
            # TODO: Send notification email to user

            return Response({
                'detail': f'User {user.username} has been banned',
                'reason': reason,
                'permanent': days == 0,
                'duration_days': days if days > 0 else None
            })

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='unban-user')
    def unban_user(self, request, pk=None):
        """
        Unban/reactivate a suspended user.
        """
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        user.is_active = True
        user.save()

        return Response({
            'detail': f'User {user.username} has been reactivated'
        })

    @action(detail=False, methods=['get'])
    def moderation_queue(self, request):
        """
        Get products pending approval or flagged by AI.
        Shows newly uploaded products for admin review.
        """
        # Get products with 'pending' status
        queryset = Product.objects.filter(status='pending').order_by('-created_at')

        # Support filtering by category
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        start = (page - 1) * page_size
        end = start + page_size

        total_count = queryset.count()
        products = queryset[start:end]

        serializer = AdminProductSerializer(products, many=True)
        return Response({
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'results': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='approve-product')
    def approve_product(self, request, pk=None):
        """
        Approve a product for listing.
        """
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response(
                {'detail': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        product.status = 'active'
        product.save()

        # TODO: Send notification to product owner

        serializer = AdminProductSerializer(product)
        return Response({
            'detail': f'Product "{product.title}" has been approved',
            'product': serializer.data
        })

    @action(detail=True, methods=['post'], url_path='reject-product')
    def reject_product(self, request, pk=None):
        """
        Reject a product.
        """
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response(
                {'detail': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        reason = request.data.get('reason', 'No reason provided')
        product.status = 'inactive'
        product.save()

        # TODO: Send notification to product owner with rejection reason

        serializer = AdminProductSerializer(product)
        return Response({
            'detail': f'Product "{product.title}" has been rejected',
            'reason': reason,
            'product': serializer.data
        })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_agent_targets(request):
    """
    Return all available YOLO target items for the agent dropdown.
    """
    from ai.classifier import get_available_targets
    targets = get_available_targets()
    return Response(targets)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([AIUserRateThrottle, AIAnonRateThrottle])
def classify_image_view(request):
    """
    Accept an image file and return the predicted product category
    using the YOLO model.
    """
    image_file = request.FILES.get('image')
    if not image_file:
        return Response(
            {'error': 'No image file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    import tempfile
    import os
    from ai.classifier import classify_image

    # Save to temp file for YOLO inference
    suffix = os.path.splitext(image_file.name)[1] or '.jpg'
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, mode='wb') as tmp:
        for chunk in image_file.chunks():
            tmp.write(chunk)
        tmp_path = tmp.name

    try:
        result = classify_image(tmp_path)
        return Response(result)
    finally:
        os.unlink(tmp_path)
