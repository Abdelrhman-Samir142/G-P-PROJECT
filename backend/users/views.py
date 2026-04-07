from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views.decorators.cache import cache_page

from .models import UserProfile
from .serializers import UserSerializer, UserProfileSerializer, RegisterSerializer
from .services import WalletService
from catalog.models import Product


# ──────────────────────────────────────────────────────────────
# AUTHENTICATION
# ──────────────────────────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT serializer to include is_staff in token claims"""
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims to the token
        token['is_staff'] = user.is_staff
        token['is_admin'] = user.is_staff  # Alias for frontend convenience
        token['user_id'] = user.id
        return token
    
    def validate(self, attrs):
        login_input = attrs.get('username')
        password = attrs.get('password')

        if login_input and password:
            if '@' in login_input:
                try:
                    user = User.objects.get(email=login_input)
                    attrs['username'] = user.username
                except User.DoesNotExist:
                    pass

        return super().validate(attrs)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """User registration endpoint"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        # Add custom claims to token
        refresh['is_staff'] = user.is_staff
        refresh['is_admin'] = user.is_staff

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """Get current authenticated user with profile"""
    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        # Create profile if it doesn't exist
        profile = UserProfile.objects.create(user=request.user)
    
    serializer = UserProfileSerializer(profile, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recharge_wallet_view(request):
    """Dummy wallet recharge endpoint for testing purposes."""
    amount = request.data.get('amount')
    try:
        profile = WalletService.recharge_wallet(request.user, amount)
    except UserProfile.DoesNotExist:
        return Response({'detail': 'User profile not found.'}, status=status.HTTP_404_NOT_FOUND)
    except ValueError as exc:
        return Response({'amount': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    serializer = UserProfileSerializer(profile, context={'request': request})
    return Response({
        'wallet_balance': serializer.data.get('wallet_balance'),
        'held_balance': serializer.data.get('held_balance')
    }, status=status.HTTP_200_OK)


# ──────────────────────────────────────────────────────────────
# PROFILES
# ──────────────────────────────────────────────────────────────

class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for user profiles"""
    queryset = UserProfile.objects.select_related('user')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return self.queryset.filter(user=self.request.user)
        return self.queryset

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user's profile"""
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


# ──────────────────────────────────────────────────────────────
# GENERAL STATS (landing page)
# ──────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
@cache_page(60 * 5)
def get_general_stats(request):
    """Get general statistics for the landing page"""
    total_users = User.objects.count()
    products_sold = Product.objects.filter(status='sold').count()
    scrap_count = Product.objects.filter(category='scrap').count()

    user_locations = UserProfile.objects.values_list('city', flat=True).distinct()
    product_locations = Product.objects.values_list('location', flat=True).distinct()

    locations = set([loc.lower().strip() for loc in user_locations if loc])
    locations.update([loc.lower().strip() for loc in product_locations if loc])

    active_governorates = len(locations)

    return Response({
        'total_users': total_users,
        'products_sold': products_sold,
        'scrap_count': scrap_count,
        'active_governorates': active_governorates
    })
