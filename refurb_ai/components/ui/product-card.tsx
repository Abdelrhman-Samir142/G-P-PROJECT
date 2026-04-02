'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/providers/language-provider';
import { wishlistAPI } from '@/lib/api';
import { useState } from 'react';

const categoryLabels: Record<string, { label: string; color: string; bg: string }> = {
    scrap_metals: { label: 'خردة ومعادن', color: 'text-amber-500', bg: 'bg-[var(--color-surface)] border-[var(--color-border)]' },
    electronics: { label: 'إلكترونيات وأجهزة', color: 'text-blue-400', bg: 'bg-[var(--color-surface)] border-[var(--color-border)]' },
    furniture: { label: 'أثاث وديكور', color: 'text-orange-400', bg: 'bg-[var(--color-surface)] border-[var(--color-border)]' },
    cars: { label: 'سيارات للبيع', color: 'text-red-400', bg: 'bg-[var(--color-surface)] border-[var(--color-border)]' },
    real_estate: { label: 'عقارات', color: 'text-purple-400', bg: 'bg-[var(--color-surface)] border-[var(--color-border)]' },
    books: { label: 'كتب', color: 'text-teal-400', bg: 'bg-[var(--color-surface)] border-[var(--color-border)]' },
    other: { label: 'أخرى', color: 'text-[var(--color-text-secondary)]', bg: 'bg-[var(--color-surface)] border-[var(--color-border)]' },
};

// ── Arabic relative time ─────────────────────────────────────────────────────
function timeAgo(dateStr?: string): string | null {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'منذ لحظات';
    if (seconds < 120) return 'منذ دقيقة';
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
    if (seconds < 7200) return 'منذ ساعة';
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعات`;
    if (seconds < 172800) return 'منذ يوم';
    if (seconds < 2592000) return `منذ ${Math.floor(seconds / 86400)} أيام`;
    if (seconds < 5184000) return 'منذ شهر';
    if (seconds < 31536000) return `منذ ${Math.floor(seconds / 2592000)} أشهر`;
    if (seconds < 63072000) return 'منذ سنة';
    return `منذ ${Math.floor(seconds / 31536000)} سنوات`;
}

interface ProductCardProps {
    product: Product;
    isWishlisted?: boolean;
    onWishlistChange?: (productId: string, isWishlisted: boolean) => void;
    isLoggedIn?: boolean;
    /** If true, the wishlist heart button is hidden (product owner can't wishlist their own product) */
    isOwner?: boolean;
}

export function ProductCard({
    product,
    isWishlisted = false,
    onWishlistChange,
    isLoggedIn = false,
    isOwner = false,
}: ProductCardProps) {
    const { dict } = useLanguage();
    const catInfo = categoryLabels[product.category] || categoryLabels.other;
    const [wishlisted, setWishlisted] = useState(isWishlisted);
    const [toggling, setToggling] = useState(false);

    const relativeTime = timeAgo(product.createdAt);

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isLoggedIn || toggling || isOwner) return;

        setToggling(true);
        try {
            const result = await wishlistAPI.toggle(parseInt(product.id));
            setWishlisted(result.is_wishlisted);
            onWishlistChange?.(product.id, result.is_wishlisted);
        } catch (err) {
            console.error('Error toggling wishlist:', err);
        } finally {
            setToggling(false);
        }
    };

    const showWishlistBtn = isLoggedIn && !isOwner;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative glass-surface rounded-[20px] overflow-hidden shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-glow)] transition-all duration-400"
        >
            {/* Wishlist heart button */}
            {showWishlistBtn && (
                <motion.button
                    onClick={handleToggleWishlist}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.88 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                    className={`absolute top-3 left-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${wishlisted
                            ? 'bg-[var(--color-danger)] text-white scale-110'
                            : 'bg-white/10 backdrop-blur-md border border-white/20 text-white/70 hover:text-[var(--color-danger)] hover:bg-white/20'
                        }`}
                    disabled={toggling}
                    title={wishlisted ? 'إزالة من المفضلة' : 'أضف للمفضلة'}
                >
                    <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                </motion.button>
            )}

            <Link href={`/product/${product.id}`}>
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500 ease-out"
                    />

                    {/* Auction badge */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                        {product.isAuction && (
                            <div className="bg-[var(--color-danger)] text-white text-[11px] px-2.5 py-1 rounded-full font-bold shadow-[var(--shadow-glow)] border border-white/20 flex items-center gap-1.5 animate-[glowPulse_2s_ease-in-out_infinite]">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                {dict.dashboard.activeAuction}
                            </div>
                        )}
                    </div>

                    {/* Price badge (bottom-left) */}
                    <div className="absolute bottom-3 left-3">
                        <div className="gradient-primary text-white text-[12px] font-[800] px-3 py-1.5 rounded-full shadow-[var(--shadow-md)] flex items-baseline gap-1 border border-white/10">
                            <span className="text-[14px]">{product.price.toLocaleString()}</span>
                            <span className="text-[10px] font-[500] opacity-80">{dict.currency}</span>
                        </div>
                    </div>

                    {/* Category badge */}
                    <div className="absolute bottom-3 right-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${catInfo.bg} ${catInfo.color}`}>
                            {catInfo.label}
                        </span>
                    </div>

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-[700] text-[15px] mb-3 line-clamp-2 leading-[1.5] group-hover:text-[var(--color-primary)] transition-colors duration-300 text-[var(--color-text-primary)]">
                        {product.title}
                    </h3>

                    <div className="flex justify-between items-end">
                        {/* Time + Details */}
                        <div className="flex flex-col flex-1 items-start gap-1">
                            {/* Relative time */}
                            {relativeTime && (
                                <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                                    <Clock size={10} />
                                    {relativeTime}
                                </span>
                            )}
                        </div>
                        
                        <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[12px] font-[700] px-4 py-2 rounded-full border border-[var(--color-primary)]/20 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300 shadow-sm flex items-center justify-center">
                            التفاصيل
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
