'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { Search, Loader2, Clock, Gavel } from 'lucide-react';
import { motion } from 'framer-motion';
import { productsAPI } from '@/lib/api';

export default function AuctionsPage() {
    const { dict } = useLanguage();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAuctions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params: any = { auctions_only: true };
            if (searchQuery) params.search = searchQuery;

            const response = await productsAPI.list(params);
            setAuctions(response.results || []);
        } catch (err: any) {
            console.error('Error fetching auctions:', err);
            setError(err.message || 'فشل في تحميل المزادات');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/auctions');
        } else if (user) {
            fetchAuctions();
        }
    }, [authLoading, user, router, fetchAuctions]);

    const handleSearch = () => {
        fetchAuctions();
    };

    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <main className="pt-24 pb-12 min-h-screen px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl text-white">
                                    <Gavel size={24} />
                                </div>
                                المزادات النشطة
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                                زايد على المنتجات المميزة واحصل على أفضل الأسعار
                            </p>
                        </div>

                        <div className="flex gap-2 max-w-md w-full">
                            <input
                                type="text"
                                placeholder="ابحث في المزادات..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-800 transition-all"
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-3 rounded-xl transition-colors shadow-sm hover:shadow-md"
                            >
                                <Search size={20} />
                            </button>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    )}

                    {error && !loading && (
                        <div className="text-center py-20">
                            <p className="text-red-500 text-lg mb-4">{error}</p>
                            <button
                                onClick={fetchAuctions}
                                className="bg-primary hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {auctions.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.3 }}
                                        className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-xl transition-all"
                                    >
                                        <Link href={`/product/${product.id}`}>
                                            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-700">
                                                <img
                                                    src={product.primary_image || product.images?.[0]?.image || '/placeholder.png'}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                                <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg flex items-center gap-1">
                                                    <Clock size={12} />
                                                    مزاد نشط
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            <div className="p-4">
                                                <h3 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                    {product.title}
                                                </h3>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-xs text-slate-500 block mb-1">السعر المبدئي</span>
                                                        <span className="text-orange-600 font-black text-lg">
                                                            {parseFloat(product.price).toLocaleString()}
                                                        </span>
                                                        <span className="text-slate-500 text-xs mr-1">{dict.currency}</span>
                                                    </div>
                                                    <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                                                        <Gavel size={16} className="text-orange-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {auctions.length === 0 && (
                                <div className="text-center py-20">
                                    <div className="bg-slate-100 dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Gavel size={32} className="text-slate-400" />
                                    </div>
                                    <p className="text-slate-400 text-lg mb-2">لا توجد مزادات نشطة حالياً</p>
                                    <p className="text-slate-400 text-sm mb-6">يمكنك إضافة منتج كمزاد من صفحة البيع</p>
                                    <Link href="/sell">
                                        <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg">
                                            أضف مزاد جديد
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
