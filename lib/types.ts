export interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    isAuction: boolean;
<<<<<<< HEAD
    category: 'scrap_metals' | 'electronics' | 'furniture' | 'cars' | 'real_estate' | 'other';
=======
    category: 'electronics' | 'furniture' | 'scrap' | 'other';
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
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
<<<<<<< HEAD
    owner_name?: string;
    owner_avatar?: string;
    is_owner?: boolean;
    is_favorited?: boolean;
    time_since_posted?: string;
    status?: 'active' | 'sold' | 'pending' | 'inactive';
    views_count?: number;
    primary_image?: string;
    images?: { id: number; image: string; is_primary: boolean }[];
=======
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
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
