'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useAuth } from '@/components/providers/auth-provider';
import { productsAPI } from '@/lib/api';
import { Loader2, Plus, Package, Edit, Trash2, MapPin, Eye, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/components/providers/language-provider';

export default function MyListingsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { dict } = useLanguage();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const effectRan = useRef(false);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            router.push('/login?redirect=/my-listings');
            return;
        }

        if (effectRan.current) return;
        effectRan.current = true;

        const fetchListings = async () => {
            try {
                const data = await productsAPI.getMyListings();
                setListings(data);
            } catch (error) {
                console.error('Failed to fetch listings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [user, authLoading, router]);

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

        try {
            await productsAPI.delete(id);
            setListings(listings.filter(item => item.id !== id));
        } catch (error) {
            alert('حدث خطأ أثناء الحذف');
        }
    };

    if (authLoading || loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen pt-32 flex justify-center items-start">
                    <Loader2 className="animate-spin text-primary" size={40} />
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => router.back()}
                                className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                                aria-label="Back"
                            >
                                <ArrowRight size={20} className="text-slate-600 dark:text-slate-400" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">إعلاناتي</h1>
                                <p className="text-slate-600 dark:text-slate-400">
                                    إدارة إعلاناتك الحالية وإضافة إعلانات جديدة
                                </p>
                            </div>
                        </div>
                        <Link href="/sell">
                            <button className="bg-primary hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                                <Plus size={20} />
                                إضافة إعلان جديد
                            </button>
                        </Link>
                    </div>

                    {/* Listings Grid */}
                    {listings.length > 0 ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {listings.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group flex flex-col"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
                                        {item.primary_image || item.images?.[0]?.image ? (
                                            <img
                                                src={item.primary_image || item.images?.[0]?.image}
                                                alt={item.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-slate-400">
                                                <Package size={40} />
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'active'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                                }`}>
                                                {item.status === 'active' ? 'نشط' : item.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg mb-1 truncate">{item.title}</h3>
                                        <p className="text-primary font-black text-xl mb-3">
                                            {item.price} {dict.currency}
                                        </p>

                                        <div className="flex items-center gap-1 text-slate-500 text-xs mb-4">
                                            <MapPin size={14} />
                                            <span>{item.location || 'غير محدد'}</span>
                                        </div>

                                        <div className="flex-1"></div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                                            <Link href={`/product/${item.id}`} className="flex-1">
                                                <button className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                                    <Eye size={16} />
                                                    عرض
                                                </button>
                                            </Link>
                                            <Link href={`/sell?edit=${item.id}`} className="flex-1">
                                                <button className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                                                    <Edit size={16} />
                                                    تعديل
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                                                title="حذف"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                                <Package size={40} className="text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">لا توجد إعلانات حتى الآن</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center">
                                لم تقم بإضافة أي إعلانات للبيع بعد. ابدأ الآن واعرض منتجاتك للآلاف من المشترين.
                            </p>
                            <Link href="/sell">
                                <button className="bg-primary hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                                    <Plus size={20} />
                                    أضف أول إعلان لك
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
