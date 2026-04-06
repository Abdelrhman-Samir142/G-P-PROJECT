import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productsAPI, authAPI, chatAPI } from '@/lib/api';
import { useAuctionBidding } from '@/features/auctions/hooks/useAuctionBidding';

export function useProductDetails(productId: string) {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(0);

    const { data: user } = useQuery({
        queryKey: ['me'],
        queryFn: () => authAPI.getCurrentUser().catch(() => null),
        staleTime: Infinity // User object barely updates without interactions
    });

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productsAPI.get(productId),
        enabled: !!productId
    });

    // Delegate bidding state to the auctions feature hook
    const {
        setProduct,
        bidAmount,
        setBidAmount,
        bidding,
        bidError,
        bidSuccess,
        placeBid
    } = useAuctionBidding(null, productId);

    // Sync React Query product into useAuctionBidding natively
    useEffect(() => {
        if (product) setProduct(product);
    }, [product, setProduct]);

    const deleteMutation = useMutation({
        mutationFn: () => productsAPI.delete(product.id),
        onSuccess: () => router.push('/dashboard')
    });

    const handleDelete = async () => {
        if (!product) return;
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.')) return;
        deleteMutation.mutate();
    };

    const chatMutation = useMutation({
        mutationFn: () => chatAPI.startConversation(product.id),
        onSuccess: () => router.push('/messages')
    });

    const startChat = async () => {
        if (!product) return;
        if (!user) { 
            router.push('/login'); 
            return; 
        }
        chatMutation.mutate();
    };

    return {
        product,
        user,
        loading: isLoading,
        error: error ? (error as any).message : null,
        selectedImage,
        setSelectedImage,
        deleting: deleteMutation.isPending,
        chatLoading: chatMutation.isPending,
        handleDelete,
        startChat,
        // Auctions specific fields natively merged
        bidAmount,
        setBidAmount,
        bidding,
        bidError,
        bidSuccess,
        placeBid
    };
}
