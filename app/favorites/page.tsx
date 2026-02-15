'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ProductCard } from '@/components/ui/product-card';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { Loader2, Heart } from 'lucide-react';
import { productsAPI } from '@/lib/api';

export default function FavoritesPage() {
    const { dict } = useLanguage();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/favorites');
        } else if (user) {
            fetchFavorites();
        }
    }, [authLoading, user, router]);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.listFavorites();
            setProducts(response || []);
        } catch (err: any) {
            console.error('Error fetching favorites:', err);
            setError('Failed to load favorites');
        } finally {
            setLoading(false);
        }
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
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500">
                            <Heart size={28} fill="currentColor" />
                        </div>
                        <h1 className="text-3xl font-bold">المفضلة</h1>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={40} />
                        </div>
                    ) : (
                        <>
                            {products.length === 0 ? (
                                <div className="text-center py-24 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="inline-flex p-6 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-6">
                                        <Heart size={48} className="text-slate-300 dark:text-slate-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">لا توجد منتجات مفضلة</h2>
                                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                                        لم تقم بإضافة أي منتجات إلى المفضلة بعد. تصفح المتجر وأضف المنتجات التي تعجبك!
                                    </p>
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="bg-primary hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
                                    >
                                        تصفح المنتجات
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                        />
                                    ))}
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
