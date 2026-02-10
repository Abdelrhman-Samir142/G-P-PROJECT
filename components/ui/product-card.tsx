'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { Plus, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/providers/language-provider';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { dict } = useLanguage();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
                </div>

                {/* Content */}
                <div className="p-4">
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
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
