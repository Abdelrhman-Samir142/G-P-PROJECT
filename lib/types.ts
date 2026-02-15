export interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    isAuction: boolean;
    category: 'scrap_metals' | 'electronics' | 'furniture' | 'cars' | 'real_estate' | 'other';
    description?: string;
    condition?: string;
    location?: string;
    seller?: {
        name: string;
        avatar: string;
        rating: number;
    };
    biddingHistory?: Bid[];
    endTime?: string;
    owner_name?: string;
    owner_avatar?: string;
    is_owner?: boolean;
    is_favorited?: boolean;
    time_since_posted?: string;
    status?: 'active' | 'sold' | 'pending' | 'inactive';
    views_count?: number;
    primary_image?: string;
    images?: { id: number; image: string; is_primary: boolean }[];
}

export interface Bid {
    userId: string;
    userName: string;
    amount: number;
    timestamp: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    location: string;
    walletBalance: number;
    sellerRating: number;
    trustScore: number;
    activeListings: number;
    totalSales: number;
}

export interface Category {
    id: string;
    name: string;
    icon: any;
    count: number;
}
