from django.db import transaction
from django.utils import timezone
from catalog.models import Product, ProductImage
from auctions.models import Auction
from ai_agents.tasks import trigger_auto_bidding

class ProductService:
    @staticmethod
    def filter_products(queryset, query_params):
        """Apply business rules for querying products"""
        min_price = query_params.get('min_price')
        max_price = query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        auctions_only = query_params.get('auctions_only')
        is_auction_param = query_params.get('is_auction')

        if auctions_only == 'true':
            queryset = queryset.filter(is_auction=True, auction__is_active=True)
        elif is_auction_param is None:
            # Default to not showing auctions in standard list unless requested
            queryset = queryset.filter(is_auction=False)
            
        return queryset

    @staticmethod
    @transaction.atomic
    def create_product(user, validated_data, uploaded_images):
        """Complex business logic for creating a product and side effects"""
        # Create base product
        product = Product.objects.create(owner=user, **validated_data)
        
        # Create auction if required
        auction = None
        if product.is_auction and product.auction_end_time:
            auction = Auction.objects.create(
                product=product,
                starting_bid=product.price,
                current_bid=product.price,
                start_time=timezone.now(),
                end_time=product.auction_end_time,
                is_active=True
            )
            
        # Handle images
        for idx, image in enumerate(uploaded_images):
            ProductImage.objects.create(
                product=product,
                image=image,
                is_primary=(idx == 0),
                order=idx
            )
            
        # Trigger async ML processing
        if auction and uploaded_images:
            first_image = product.images.filter(is_primary=True).first()
            if first_image and first_image.image:
                image_path = first_image.image.path
                trigger_auto_bidding.delay(auction.id, product.id, image_path)
                
        return product
        
    @staticmethod
    def increment_views(product):
        """Increment product views atomically"""
        product.views_count += 1
        product.save(update_fields=['views_count'])
        return product
