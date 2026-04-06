from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend

from .models import Product, Wishlist
from .serializers import ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer
from .services import ProductService

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
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Use service to handle business logic filtering rules
        if self.action == 'list':
            queryset = ProductService.filter_products(queryset, self.request.query_params)
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Increment views count on product detail view"""
        instance = self.get_object()
        instance = ProductService.increment_views(instance)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def create(self, request, *args, **kwargs):
        """Custom create using service"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # We manually call save/service because the standard Serializer setup is synchronous and monolithic
        product = ProductService.create_product(
            user=request.user,
            validated_data=serializer.validated_data,
            uploaded_images=serializer.validated_data.pop('uploaded_images', [])
        )
        # Return standard response
        response_serializer = ProductDetailSerializer(product, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_listings(self, request):
        """Get current user's products"""
        products = self.queryset.filter(owner=request.user)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_list(request):
    """Get user's wishlist products"""
    wishlist_items = Wishlist.objects.filter(user=request.user).select_related(
        'product', 'product__owner'
    ).prefetch_related('product__images')
    
    products_data = []
    for item in wishlist_items:
        product = item.product
        primary_image = product.images.filter(is_primary=True).first() or product.images.first()
        
        products_data.append({
            'id': product.id,
            'title': product.title,
            'price': str(product.price),
            'category': product.category,
            'condition': product.condition,
            'status': product.status,
            'is_auction': product.is_auction,
            'primary_image': request.build_absolute_uri(primary_image.image.url) if primary_image else None,
            'owner_name': product.owner.username,
            'created_at': product.created_at.isoformat(),
            'wishlisted_at': item.created_at.isoformat(),
        })
    
    return Response(products_data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def wishlist_toggle(request, product_id):
    """Add or remove a product from wishlist"""
    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    wishlist_item, created = Wishlist.objects.get_or_create(user=request.user, product=product)
    
    if not created:
        wishlist_item.delete()
        return Response({'status': 'removed', 'is_wishlisted': False})
    
    return Response({'status': 'added', 'is_wishlisted': True}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_check(request, product_id):
    """Check if a product is in user's wishlist"""
    is_wishlisted = Wishlist.objects.filter(user=request.user, product_id=product_id).exists()
    return Response({'is_wishlisted': is_wishlisted})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wishlist_ids(request):
    """Get all wishlisted product IDs for current user"""
    ids = list(Wishlist.objects.filter(user=request.user).values_list('product_id', flat=True))
    return Response({'product_ids': ids})
