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
