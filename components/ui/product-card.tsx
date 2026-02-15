'use client';

import Link from 'next/link';
<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/providers/language-provider';

const categoryLabels: Record<string, { label: string; color: string; bg: string }> = {
    scrap_metals: { label: 'خردة ومعادن', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' },
    electronics: { label: 'إلكترونيات وأجهزة', color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' },
    books: { label: 'كتب', color: 'text-amber-800 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' },
    furniture: { label: 'أثاث وديكور', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800' },
    real_estate: { label: 'عقارات', color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' },
    other: { label: 'أخرى', color: 'text-slate-700 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800' },
};

=======
import { Product } from '@/lib/types';
import { Plus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/providers/language-provider';

>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { dict } = useLanguage();
<<<<<<< HEAD
    const catInfo = categoryLabels[product.category] || categoryLabels.other;

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Optimistic UI update could happen here, but for now we'll wait for API integration in the parent or context
        // This button will just visually toggle if we had local state, but since we rely on props, 
        // we'd need a callback or use the API directly here. 
        // For this task, we'll implement the UI logic.
    };

    const [imgSrc, setImgSrc] = useState<string>('');
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        // Priority: product.image -> primary_image -> images[0] -> placeholder
        let source = product.image || product.primary_image || product.images?.[0]?.image;

        if (!source) {
            setImgSrc('/placeholder.png');
            return;
        }

        // Handle relative URLs from Django
        if (source.startsWith('/media/')) {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
            source = `${baseUrl}${source}`;
        } else if (source.startsWith('/') && !source.startsWith('/placeholder')) {
            // Other relative paths (e.g. static)
            // leave as is or prepend if needed? usually public folder
        }

        setImgSrc(source);
        setImgError(false);
    }, [product]);

    const handleImgError = () => {
        if (!imgError) {
            setImgSrc('/placeholder.png');
            setImgError(true);
        }
    };
=======
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
<<<<<<< HEAD
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className={`group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 dark:border-slate-700/60 ${product.status === 'sold' ? 'opacity-75 grayscale-[0.5]' : ''}`}
        >
            <Link href={`/product/${product.id}`}>
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                        src={imgSrc || '/placeholder.png'}
                        alt={product.title}
                        onError={handleImgError}
                        className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500 ease-out"
                    />

                    {/* Top badges row */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 items-start z-10">
                        {/* Owner Badge */}
                        {product.is_owner && (
                            <div className="bg-primary text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-md">
                                إعلانك
                            </div>
                        )}
                        {/* Status Badge */}
                        {product.status === 'sold' && (
                            <div className="bg-slate-800 text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-md">
                                تم البيع
                            </div>
                        )}
                    </div>

                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                        {/* Favorite Button */}
                        <button
                            onClick={toggleFavorite}
                            className={`p-2 rounded-full backdrop-blur-md shadow-sm transition-all ${product.is_favorited ? 'bg-red-50 text-red-500' : 'bg-white/80 text-slate-600 hover:bg-white'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={product.is_favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                            </svg>
                        </button>

                        {/* Auction Badge */}
                        {product.isAuction && (
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-md flex items-center gap-1">
                                <Clock size={11} />
                                {dict.dashboard.activeAuction}
                            </div>
                        )}
                    </div>

                    {/* Category badge - bottom left of image */}
                    <div className="absolute bottom-3 right-3 z-10">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ${catInfo.bg} ${catInfo.color}`}>
                            {catInfo.label}
                        </span>
                    </div>

                    {/* Time Badge - bottom left */}
                    {product.time_since_posted && (
                        <div className="absolute bottom-3 left-3 z-10">
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                                {product.time_since_posted}
                            </span>
                        </div>
                    )}

                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
=======
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
        >
            <Link href={`/product/${product.id}`}>
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Auction Badge */}
                    {product.isAuction && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
                            <Clock size={12} />
                            {dict.dashboard.activeAuction}
                        </div>
                    )}

                    {/* Glassmorphism Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
                </div>

                {/* Content */}
                <div className="p-4">
<<<<<<< HEAD
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-[15px] line-clamp-1 leading-relaxed group-hover:text-primary transition-colors duration-200">
                            {product.title}
                        </h3>
                    </div>

                    {/* Seller Info */}
                    <div className="flex items-center gap-2 mb-3">
                        {product.owner_avatar ? (
                            <img src={product.owner_avatar} alt={product.owner_name} className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                {product.owner_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                            {product.owner_name || 'بائع مجهول'}
                        </span>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[11px] text-slate-400 font-medium mb-0.5">السعر</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-primary font-black text-xl leading-none">
                                    {product.price.toLocaleString()}
                                </span>
                                <span className="text-slate-400 text-xs font-semibold">{dict.currency}</span>
                            </div>
                        </div>

                        <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-200">
                            عرض التفاصيل
                        </div>
=======
                    <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {product.title}
                    </h3>

                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-primary font-black text-lg">
                                {product.price.toLocaleString()}
                            </span>
                            <span className="text-slate-500 text-xs mr-1">{dict.currency}</span>
                        </div>

                        <button
                            className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg hover:bg-primary hover:text-white transition-all group/btn"
                            onClick={(e) => {
                                e.preventDefault();
                                // Add to cart logic
                            }}
                        >
                            <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" />
                        </button>
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
