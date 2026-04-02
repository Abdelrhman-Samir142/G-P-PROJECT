'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { Search, Loader2, Clock, Gavel, Users, TrendingUp, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { auctionsAPI } from '@/lib/api';

function CountdownTimer({ endTime }: { endTime: string }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const update = () => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('انتهى');
                setIsUrgent(true);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setIsUrgent(diff < 1000 * 60 * 60); // Less than 1 hour

            if (days > 0) {
                setTimeLeft(`${days}ي ${hours}س ${minutes}د`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}س ${minutes}د ${seconds}ث`);
            } else {
                setTimeLeft(`${minutes}د ${seconds}ث`);
            }
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className={`flex items-center gap-1.5 text-[12px] font-[700] ${isUrgent ? 'text-red-500' : 'text-amber-500'}`}>
            <Clock size={14} className={isUrgent ? 'animate-pulse' : ''} />
            <span className="tracking-wide">{timeLeft}</span>
        </div>
    );
}

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

            const response = await auctionsAPI.list(false);
            // Handle both paginated and non-paginated responses
            const results = Array.isArray(response) ? response : (response as any).results || [];
            setAuctions(results);
        } catch (err: any) {
            console.error('Error fetching auctions:', err);
            setError(err.message || 'فشل في تحميل المزادات');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login?redirect=/auctions');
        } else if (user) {
            fetchAuctions();
        }
    }, [authLoading, user, router, fetchAuctions]);

    // Filter auctions by search query (client side)
    const filteredAuctions = auctions.filter((auction) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return auction.product_title?.toLowerCase().includes(q);
    });

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
            <main className="pt-24 pb-12 min-h-screen px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)] relative">
                {/* REDESIGN: Ambient Mesh Background */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/15 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
                <div className="absolute top-40 left-[-10%] w-[400px] h-[400px] bg-[var(--color-accent)]/15 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-[2rem] md:text-[2.5rem] font-[900] flex items-center gap-3 text-[var(--color-text-primary)] tracking-[-0.02em]">
                                <div className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] p-2.5 rounded-[var(--radius-lg)] shadow-[var(--shadow-glow)] border border-[var(--color-accent)]/20">
                                    <Gavel size={26} strokeWidth={2.5} />
                                </div>
                                المزادات النشطة
                            </h2>
                            <p className="text-[var(--color-text-secondary)] mt-2 text-[14px] font-[500]">
                                زايد على المنتجات المميزة واحصل على أفضل الأسعار
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/sell">
                                <button className="gradient-accent text-white px-6 py-3 rounded-[var(--radius-lg)] font-[700] text-[14px] transition-all duration-300 shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] flex items-center gap-2">
                                    <Plus size={18} strokeWidth={3} />
                                    أضف مزاد جديد
                                </button>
                            </Link>
                        </div>

                        <div className="flex gap-2 max-w-md w-full">
                            <input
                                type="text"
                                placeholder="ابحث في المزادات..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 glass-surface border border-[var(--color-border)] rounded-[var(--radius-pill)] px-5 py-3 text-[14px] font-[500] outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-emerald-500/10 transition-all text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-xs)]"
                            />
                            <button
                                onClick={fetchAuctions}
                                className="gradient-accent text-white p-3.5 rounded-full transition-all duration-300 shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)]"
                            >
                                <Search size={20} strokeWidth={2.5} />
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
                            <p className="text-[var(--color-danger)] text-[1.1rem] font-[700] mb-6">{error}</p>
                            <button
                                onClick={fetchAuctions}
                                className="gradient-accent text-white px-8 py-3.5 rounded-[var(--radius-lg)] font-[700] transition-all duration-300 shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)]"
                            >
                                إعادة المحاولة
                            </button>
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredAuctions.map((auction) => (
                                    <motion.div
                                        key={auction.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.3 }}
                                        className="group glass-surface border border-[var(--color-border)] rounded-[var(--radius-2xl)] overflow-hidden shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300"
                                    >
                                        <Link href={`/product/${auction.product}`}>
                                            <div className={`relative h-48 overflow-hidden bg-slate-50 ${!auction.is_active ? 'grayscale-[50%]' : ''}`}>
                                                <img
                                                    src={auction.product_image || '/placeholder.png'}
                                                    alt={auction.product_title}
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                />
                                                {auction.is_active ? (
                                                    <div className="absolute top-3 right-3 bg-[var(--color-accent)] text-[var(--color-bg)] text-[11px] px-3 py-1.5 rounded-[var(--radius-pill)] font-[800] shadow-[var(--shadow-glow)] flex items-center gap-1.5 tracking-wide">
                                                        <Gavel size={14} />
                                                        مزاد نشط
                                                    </div>
                                                ) : (
                                                    <div className="absolute top-3 right-3 bg-[var(--color-danger)] text-white text-xs px-3 py-1.5 rounded-[var(--radius-pill)] font-[800] shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-white" /> المزاد انتهى
                                                    </div>
                                                )}
                                                {auction.is_active && (
                                                    <div className="absolute top-3 left-3 bg-[var(--color-surface)]/80 backdrop-blur-md text-[var(--color-text-primary)] text-[11px] px-3 py-1.5 rounded-[var(--radius-pill)] shadow-sm flex items-center gap-1.5 border border-[var(--color-border)]">
                                                        <CountdownTimer endTime={auction.end_time} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            <div className="p-6">
                                                <h3 className="font-[800] text-[1.1rem] mb-4 line-clamp-2 text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors duration-300 tracking-[-0.01em]">
                                                    {auction.product_title}
                                                </h3>

                                                <div className="flex justify-between items-end border-t border-[var(--color-border)] pt-4">
                                                    <div>
                                                        <span className="text-[11px] font-[700] text-[var(--color-text-muted)] block mb-1 uppercase tracking-wide">السعر الحالي</span>
                                                        <span className="text-[var(--color-accent)] font-[900] text-[1.4rem] tracking-[-0.02em]">
                                                            {parseFloat(auction.current_bid).toLocaleString()}
                                                        </span>
                                                        <span className="text-[var(--color-text-secondary)] text-[12px] mr-1.5 font-[600]">{dict.currency}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-1.5 text-[13px] font-[700] text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-1 rounded-md border border-[var(--color-primary)]/20 shadow-[var(--shadow-glow)]">
                                                            <Users size={14} />
                                                            <span>{auction.total_bids}</span>
                                                        </div>
                                                        {auction.is_active ? (
                                                            <div className="bg-[var(--color-accent)]/10 p-2 rounded-[var(--radius-sm)] text-[var(--color-accent)] border border-[var(--color-accent)]/20">
                                                                <TrendingUp size={16} strokeWidth={2.5}/>
                                                            </div>
                                                        ) : (
                                                            auction.highest_bidder_name && (
                                                                <span className="text-[12px] text-[var(--color-accent)] font-[800]">الفائز: {auction.highest_bidder_name}</span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {filteredAuctions.length === 0 && (
                                <div className="text-center py-20 px-4 glass-surface rounded-[var(--radius-2xl)] max-w-2xl mx-auto mt-10 shadow-[var(--shadow-glow)] border border-[var(--color-border)]">
                                    <div className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[var(--shadow-glow)] border border-[var(--color-accent)]/20">
                                        <Gavel size={36} strokeWidth={2} />
                                    </div>
                                    <p className="text-[var(--color-text-primary)] text-[1.3rem] font-[800] mb-3">لا توجد مزادات نشطة حالياً</p>
                                    <p className="text-[var(--color-text-secondary)] text-[14px] font-[500] mb-8">يمكنك إضافة منتج كمزاد من صفحة البيع</p>
                                    <Link href="/sell">
                                        <button className="gradient-accent text-white px-8 py-3.5 rounded-[var(--radius-lg)] font-[700] transition-all duration-300 shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)]">
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
