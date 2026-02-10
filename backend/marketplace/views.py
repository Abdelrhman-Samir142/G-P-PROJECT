from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from decimal import Decimal
import random

from .models import Product, ProductImage, Auction, Bid, UserProfile, AIPriceAnalysis
from .serializers import (
    ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer,
    AuctionSerializer, BidSerializer, UserProfileSerializer, UserSerializer,
    RegisterSerializer, AIPriceAnalysisSerializer
)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """User registration endpoint"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
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
        profile = UserProfileSerializer(request.user.profile, context={'request': request})
        return Response(profile.data)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product CRUD operations
    List, Create, Retrieve, Update, Delete products
    """
    queryset = Product.objects.select_related('owner', 'owner__profile').prefetch_related('images', 'auction')
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'condition', 'status', 'is_auction']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at', 'price', 'views_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action == 'create' or self.action == 'update':
            return ProductCreateSerializer
        return ProductDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter active auctions only
        if self.request.query_params.get('auctions_only') == 'true':
            queryset = queryset.filter(is_auction=True, auction__is_active=True)
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Increment views count on product detail view"""
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Set owner to current user when creating product"""
        product = serializer.save(owner=self.request.user)
        
        # Generate AI price analysis
        self.generate_ai_analysis(product)
        
        # Create auction if requested
        if product.is_auction and 'auction_end_time' in self.request.data:
            end_time = self.request.data.get('auction_end_time')
            Auction.objects.create(
                product=product,
                starting_bid=product.price,
                current_bid=product.price,
                end_time=end_time
            )
    
    def generate_ai_analysis(self, product):
        """Generate AI price analysis for a product"""
        # Simulate AI analysis (in production, this would call actual AI model)
        similar_products = Product.objects.filter(
            category=product.category,
            status='sold'
        ).exclude(id=product.id)[:20]
        
        if similar_products.exists():
            avg_price = similar_products.aggregate(models.Avg('price'))['price__avg']
            market_avg = Decimal(str(avg_price)) if avg_price else product.price
        else:
            market_avg = product.price * Decimal('0.95')
        
        difference = ((product.price - market_avg) / market_avg) * 100
        
        if abs(difference) < 5:
            recommendation = 'excellent'
        elif difference < 0:
            recommendation = 'good'
        else:
            recommendation = 'high'
        
        AIPriceAnalysis.objects.create(
            product=product,
            market_average=market_avg,
            price_difference=difference,
            recommendation=recommendation,
            similar_products_count=similar_products.count() or random.randint(15, 50),
            confidence_score=random.randint(85, 98)
        )
    
    @action(detail=True, methods=['get'])
    def ai_analysis(self, request, pk=None):
        """Get or generate AI price analysis for a product"""
        product = self.get_object()
        
        try:
            analysis = product.ai_analysis
        except AIPriceAnalysis.DoesNotExist:
            self.generate_ai_analysis(product)
            analysis = product.ai_analysis
        
        serializer = AIPriceAnalysisSerializer(analysis)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_listings(self, request):
        """Get current user's products"""
        products = self.queryset.filter(owner=request.user)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


class AuctionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing auctions"""
    queryset = Auction.objects.select_related('product', 'highest_bidder').prefetch_related('bids')
    serializer_class = AuctionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Only active auctions
        if self.request.query_params.get('active_only') == 'true':
            queryset = queryset.filter(is_active=True, end_time__gt=timezone.now())
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def place_bid(self, request, pk=None):
        """Place a bid on an auction"""
        auction = self.get_object()
        
        # Validation
        if not auction.is_active:
            return Response({'error': 'Auction is not active'}, status=status.HTTP_400_BAD_REQUEST)
        
        if auction.end_time < timezone.now():
            auction.is_active = False
            auction.save()
            return Response({'error': 'Auction has ended'}, status=status.HTTP_400_BAD_REQUEST)
        
        if auction.product.owner == request.user:
            return Response({'error': 'Cannot bid on your own auction'}, status=status.HTTP_400_BAD_REQUEST)
        
        amount = Decimal(str(request.data.get('amount', 0)))
        
        if amount <= auction.current_bid:
            return Response({
                'error': f'Bid must be higher than current bid of {auction.current_bid}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create bid
        bid = Bid.objects.create(
            auction=auction,
            bidder=request.user,
            amount=amount
        )
        
        # Update auction
        auction.current_bid = amount
        auction.highest_bidder = request.user
        auction.save()
        
        return Response(BidSerializer(bid).data, status=status.HTTP_201_CREATED)


class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for user profiles"""
    queryset = UserProfile.objects.select_related('user')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        # Only allow users to edit their own profile
        if self.action in ['update', 'partial_update', 'destroy']:
            return self.queryset.filter(user=self.request.user)
        return self.queryset
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user's profile"""
        profile = get_object_or_404(UserProfile, user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
