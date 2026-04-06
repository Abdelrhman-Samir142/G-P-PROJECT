import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { auctionsAPI, productsAPI } from '@/lib/api';

export function useAuctionBidding(initialProduct: any, paramsId: string) {
    const queryClient = useQueryClient();
    // Default fallback to internal state until useProductDetails resolves
    const [product, setProduct] = useState<any>(initialProduct);
    const [bidAmount, setBidAmount] = useState('');
    const [bidSuccess, setBidSuccess] = useState(false);

    // Sync product when it changes externally (hydration from useProductDetails)
    const handleProductChange = (newProduct: any) => {
        setProduct(newProduct);
        if (newProduct?.is_auction && newProduct?.auction) {
            setBidAmount((parseFloat(newProduct.auction.current_bid || newProduct.price) + 10).toString());
        }
    };

    // WebSocket Integration for Live Bidding
    useEffect(() => {
        if (!product?.is_auction || !product?.auction?.id) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        const ws = new WebSocket(`${wsUrl}/ws/auctions/${product.auction.id}/`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'auction_update') {
                const update = data.data; // { bid_id, amount, bidder, current_bid }
                
                // Directly mutate the React Query Cache for the Product Details
                queryClient.setQueryData(['product', paramsId], (oldProduct: any) => {
                    if (!oldProduct || !oldProduct.auction) return oldProduct;

                    const newBids = oldProduct.auction.bids || [];
                    const bidExists = newBids.some((b: any) => String(b.id) === String(update.bid_id));

                    if (!bidExists) {
                        newBids.unshift({
                            id: update.bid_id,
                            amount: update.amount,
                            bidder_name: update.bidder,
                            created_at: new Date().toISOString()
                        });
                    }

                    return {
                        ...oldProduct,
                        auction: {
                            ...oldProduct.auction,
                            current_bid: update.current_bid,
                            bids: newBids,
                            total_bids: bidExists ? oldProduct.auction.total_bids : (oldProduct.auction.total_bids + 1)
                        }
                    };
                });
            }
        };

        return () => {
            ws.close();
        };
    }, [product?.auction?.id, paramsId, queryClient, product?.is_auction]);

    const bidMutation = useMutation({
        mutationFn: (amount: number) => auctionsAPI.placeBid(product.auction.id, amount),
        onSuccess: async () => {
            setBidSuccess(true);
            setTimeout(() => setBidSuccess(false), 3000);
            // WebSocket naturally broadcasts the new bid for both this client and everyone else,
            // which the useEffect catches to update the cache instantly.
        }
    });

    const placeBid = async () => {
        if (!product?.is_auction || !product?.auction || bidMutation.isPending) return;
        bidMutation.mutate(parseFloat(bidAmount));
    };

    return {
        product,
        setProduct: handleProductChange,
        bidAmount,
        setBidAmount,
        bidding: bidMutation.isPending,
        bidError: bidMutation.error?.message || null,
        bidSuccess,
        placeBid
    };
}
