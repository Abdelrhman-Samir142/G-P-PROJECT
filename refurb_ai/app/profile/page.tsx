'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useLanguage } from '@/components/providers/language-provider';
import { Plus, ShoppingCart, LogOut, Star, TrendingUp, Package, Loader2, Heart, Pencil, Camera, X, CreditCard, Smartphone, QrCode, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { profilesAPI, productsAPI, authAPI, wishlistAPI } from '@/lib/api';
import { staggerContainer, staggerItem, fadeUp, scaleIn } from '@/lib/animations';

export default function ProfilePage() {
    const router = useRouter();
    const { dict } = useLanguage();
    const [profile, setProfile] = useState<any>(null);
    const [myListings, setMyListings] = useState<any[]>([]);
    const [wishlistItems, setWishlistItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [savedAvatar, setSavedAvatar] = useState<string | null>(null);
    const [hasUnsavedChange, setHasUnsavedChange] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [chargeAmount, setChargeAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const storedAvatar = localStorage.getItem('refurbai_avatar');
        if (storedAvatar) {
            setSavedAvatar(storedAvatar);
        }
        const fetchData = async () => {
            try {
                const [profileData, listingsData, wishlistData] = await Promise.all([
                    profilesAPI.getMe(),
                    productsAPI.getMyListings(),
                    wishlistAPI.list().catch(() => []),
                ]);
                setProfile(profileData);
                setMyListings(listingsData);
                setWishlistItems(wishlistData || []);
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        authAPI.logout();
        router.push('/login');
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen pt-32 flex justify-center items-start">
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </motion.div>
                </div>
                <Footer />
            </>
        );
    }

    if (!profile) return null;

    const user = profile.user || {};
    const trustScore = profile.trust_score || 50;

    const statCards = [
        {
            gradient: 'bg-gradient-to-br from-primary to-green-600',
            icon: Package,
            label: dict.profile.walletBalance,
            value: `${profile.wallet_balance || 0} ${dict.currency}`,
            delay: 0.1,
        },
        {
            gradient: 'bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800',
            icon: Star,
            iconClass: 'fill-yellow-400 text-yellow-400',
            label: dict.profile.sellerRating,
            value: profile.seller_rating || 0,
            isRating: true,
            delay: 0.2,
        },
        {
            gradient: 'bg-white dark:bg-slate-800',
            icon: TrendingUp,
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            label: 'إجمالي المبيعات',
            value: profile.total_sales || 0,
            light: true,
            delay: 0.3,
        },
        {
            gradient: 'bg-white dark:bg-slate-800',
            icon: Package,
            iconBg: 'bg-orange-100 dark:bg-orange-900/30',
            iconColor: 'text-orange-600 dark:text-orange-400',
            label: 'الإعلانات النشطة',
            value: myListings.filter(i => i.status === 'active').length,
            light: true,
            delay: 0.4,
        },
    ];

    return (
        <>
            <Navbar />
            <main className="pt-24 pb-12 min-h-screen px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)] relative">
                {/* Ambient Glow */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
                <div className="absolute top-40 left-[-10%] w-[400px] h-[400px] bg-[var(--color-accent)]/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
                
                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Sidebar */}
                        <motion.div
                            className="md:col-span-1"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="glass-surface p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] sticky top-24 shadow-[var(--shadow-sm)]">
                                {/* User Info */}
                                <div className="flex flex-col items-center mb-6 pb-6 border-b border-[var(--color-border)]">
                                    <div className="relative group">
                                        <motion.div
                                            initial={{ scale: 0.7, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.2 }}
                                            whileHover={{ scale: 1.02 }}
                                            className="w-[120px] h-[120px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] rounded-full mb-4 border-2 border-[var(--color-primary)] overflow-hidden cursor-pointer shadow-lg transition-all relative flex items-center justify-center text-white text-4xl font-bold"
                                        >
                                            {avatarPreview || savedAvatar || profile.avatar ? (
                                                <img
                                                    src={avatarPreview || savedAvatar || profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                                    alt="avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                (user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()
                                            )}
                                            
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                                                <Camera size={24} className="text-white mb-1" />
                                                <span className="text-[11px] text-white font-bold tracking-wide">تغيير الصورة</span>
                                            </div>
                                            
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                title=""
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                                                        setHasUnsavedChange(true);
                                                    }
                                                }}
                                            />
                                        </motion.div>
                                        
                                        {(avatarPreview || savedAvatar) && (
                                            <button 
                                                onClick={() => {
                                                    setAvatarPreview(null);
                                                    setHasUnsavedChange(true);
                                                }}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform z-10"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>

                                    {/* SAVE/CANCEL BAR */}
                                    <AnimatePresence>
                                        {hasUnsavedChange && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, height: 0 }}
                                                animate={{ opacity: 1, y: 0, height: 'auto' }}
                                                exit={{ opacity: 0, y: -10, height: 0 }}
                                                className="w-full mt-2 mb-4 bg-amber-500/15 border border-amber-500/30 p-3 rounded-[var(--radius-lg)] flex flex-col gap-2 overflow-hidden"
                                            >
                                                <p className="text-amber-500 text-xs text-center font-bold tracking-wide">📸 لديك صورة جديدة غير محفوظة</p>
                                                <div className="flex gap-2 w-full mt-1">
                                                    <button
                                                        onClick={() => {
                                                            setAvatarPreview(savedAvatar);
                                                            setHasUnsavedChange(false);
                                                        }}
                                                        className="flex-1 text-xs py-1.5 rounded-md hover:bg-black/20 text-[var(--color-text-secondary)] hover:text-white font-bold transition-colors"
                                                    >
                                                        تجاهل
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSavedAvatar(avatarPreview);
                                                            setHasUnsavedChange(false);
                                                            if (avatarPreview) {
                                                                localStorage.setItem('refurbai_avatar', avatarPreview);
                                                            } else {
                                                                localStorage.removeItem('refurbai_avatar');
                                                            }
                                                            window.dispatchEvent(new Event('avatarUpdated'));
                                                        }}
                                                        className="flex-1 text-xs py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-bold transition-colors shadow-sm"
                                                    >
                                                        حفظ الصورة ✓
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <motion.h3
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="font-[900] text-[1.2rem] text-[var(--color-text-primary)] mb-1 text-center"
                                    >
                                        {user.first_name} {user.last_name || ''} (@{user.username})
                                    </motion.h3>
                                    <motion.p
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                        className="text-[var(--color-text-muted)] text-[13px] font-[500]"
                                    >
                                        {profile.city || 'العنوان غير محدد'}
                                    </motion.p>

                                    {/* Trust Score */}
                                    <div className="mt-4 w-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">نقاط الثقة</span>
                                            <motion.span
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.7 }}
                                                className="text-sm font-black text-primary"
                                            >
                                                {trustScore}%
                                            </motion.span>
                                        </div>
                                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${trustScore}%` }}
                                                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Navigation */}
                                <motion.div
                                    className="space-y-2"
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {[
                                        { icon: Plus, bg: 'bg-primary-100 dark:bg-primary-900/30 group-hover:bg-primary', label: `${dict.profile.myListings}`, badge: myListings.length },
                                        { icon: ShoppingCart, bg: 'bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-500', label: dict.profile.myPurchases },
                                        { icon: Heart, bg: 'bg-red-100 dark:bg-red-900/30 group-hover:bg-red-500', label: 'المفضلة', badge: wishlistItems.length },
                                    ].map((item, i) => (
                                        <motion.button
                                            key={i}
                                            variants={staggerItem}
                                            whileHover={{ x: -4 }}
                                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                            className="w-full text-right p-3 hover:bg-[var(--color-primary)]/5 rounded-[var(--radius-xl)] text-[14px] font-[700] text-[var(--color-text-primary)] flex items-center gap-3 transition-colors group"
                                        >
                                            <div className={`${item.bg} group-hover:text-white p-2 rounded-lg transition-colors`}>
                                                <item.icon size={16} />
                                            </div>
                                            {item.label}
                                            {item.badge !== undefined && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 400, delay: 0.5 + i * 0.1 }}
                                                    className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full"
                                                >
                                                    {item.badge}
                                                </motion.span>
                                            )}
                                        </motion.button>
                                    ))}
                                    <motion.button
                                        variants={staggerItem}
                                        whileHover={{ x: -4 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        onClick={handleLogout}
                                        className="w-full text-right p-3 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 rounded-[var(--radius-xl)] text-[14px] font-[700] flex items-center gap-3 transition-colors group"
                                    >
                                        <div className="bg-[var(--color-danger)]/20 group-hover:bg-[var(--color-danger)] py-2 px-2.5 rounded-lg transition-colors group-hover:text-white">
                                            <LogOut size={16} />
                                        </div>
                                        {dict.profile.logout}
                                    </motion.button>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Main Content */}
                        <motion.div
                            className="md:col-span-2 space-y-6"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                        >
                            <h2 className="text-2xl md:text-3xl font-bold">{dict.profile.accountStats}</h2>

                            {/* Stats Grid */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Wallet */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    className="gradient-accent p-6 rounded-[var(--radius-2xl)] text-white shadow-[var(--shadow-glow)] cursor-default"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <motion.div
                                            whileHover={{ rotate: 10, scale: 1.1 }}
                                            className="bg-white/20 p-3 rounded-xl backdrop-blur-sm shadow-sm"
                                        >
                                            <Package size={24} />
                                        </motion.div>
                                        <button 
                                            onClick={() => setIsWalletModalOpen(true)}
                                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
                                        >
                                            + شحن الرصيد
                                        </button>
                                    </div>
                                    <p className="text-[13px] font-[500] opacity-90 mb-1">{dict.profile.walletBalance}</p>
                                    <p className="text-[2.2rem] font-[900] tracking-[-0.02em] leading-none drop-shadow-md">
                                        {profile.wallet_balance || 0} <span className="text-[1.2rem] font-[700]">{dict.currency}</span>
                                    </p>
                                </motion.div>

                                {/* Seller Rating */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    className="glass-surface p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] cursor-default text-[var(--color-text-primary)]"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <motion.div
                                            whileHover={{ rotate: -10, scale: 1.1 }}
                                            className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] p-3 rounded-[var(--radius-xl)]"
                                        >
                                            <Star className="fill-current text-current" size={24} />
                                        </motion.div>
                                    </div>
                                    <p className="text-[13px] font-[600] text-[var(--color-text-muted)] mb-1">{dict.profile.sellerRating}</p>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[2.2rem] font-[900] tracking-[-0.02em]">{profile.seller_rating || 0}</p>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ type: 'spring', stiffness: 400, delay: 0.3 + i * 0.05 }}
                                                >
                                                    <Star
                                                        size={16}
                                                        className={i <= Math.round(Number(profile.seller_rating || 0)) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}
                                                    />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Total Sales */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    className="glass-surface p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] cursor-default text-[var(--color-text-primary)]"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <motion.div whileHover={{ rotate: 8 }} className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] p-3 rounded-[var(--radius-xl)]">
                                            <TrendingUp size={24} strokeWidth={2.5} />
                                        </motion.div>
                                    </div>
                                    <p className="text-[13px] font-[600] text-[var(--color-text-muted)] mb-1">إجمالي المبيعات</p>
                                    <p className="text-[2.2rem] font-[900] tracking-[-0.02em]">{profile.total_sales || 0}</p>
                                </motion.div>

                                {/* Active Listings */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    className="glass-surface p-6 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)] cursor-default text-[var(--color-text-primary)]"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <motion.div whileHover={{ rotate: -8 }} className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] p-3 rounded-[var(--radius-xl)]">
                                            <Package size={24} strokeWidth={2.5} />
                                        </motion.div>
                                    </div>
                                    <p className="text-[13px] font-[600] text-[var(--color-text-muted)] mb-1">الإعلانات النشطة</p>
                                    <p className="text-[2.2rem] font-[900] tracking-[-0.02em]">{myListings.filter((i: any) => i.status === 'active').length}</p>
                                </motion.div>
                            </div>

                            {/* My Listings */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="glass-surface p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
                            >
                                <h3 className="font-[900] text-[1.4rem] tracking-[-0.02em] mb-6 flex items-center gap-2 text-[var(--color-text-primary)]">
                                    <Package size={22} className="text-[var(--color-accent)]" /> {dict.profile.myListings} ({myListings.length})
                                </h3>
                                {myListings.length > 0 ? (
                                    <motion.div
                                        className="space-y-3"
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {myListings.slice(0, 5).map((item, i) => (
                                            <motion.div
                                                key={item.id || i}
                                                variants={staggerItem}
                                                whileHover={{ x: -4, backgroundColor: 'rgba(255,255,255,0.02)' }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                                className="flex items-center gap-4 p-4 hover:bg-[var(--color-primary)]/5 rounded-[var(--radius-xl)] border border-transparent hover:border-[var(--color-border)] transition-all cursor-pointer"
                                                onClick={() => router.push(`/product/${item.id}`)}
                                            >
                                                <div className="w-14 h-14 bg-black/20 border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                    {item.images?.[0]?.image ? (
                                                        <img src={item.images[0].image} alt={item.title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={24} className="text-[var(--color-text-muted)]" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-[800] text-[14px] text-[var(--color-text-primary)] mb-1">{item.title}</p>
                                                    <p className="text-[12px] text-[var(--color-accent)] font-[700]">{item.price} {dict.currency}</p>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-[var(--radius-pill)] text-[11px] font-[800] tracking-wide ${item.status === 'active' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20' : 'bg-black/20 text-[var(--color-text-muted)] border border-[var(--color-border)]'}`}>
                                                    {item.status === 'active' ? 'نشط' : item.status}
                                                </div>
                                                <motion.button
                                                    onClick={(e) => { e.stopPropagation(); router.push(`/product/edit/${item.id}`); }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded-lg transition-colors border border-transparent hover:border-[var(--color-accent)]/20"
                                                    title="تعديل الإعلان"
                                                >
                                                    <Pencil size={16} />
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <p className="text-slate-500 text-sm py-4 text-center">لا توجد إعلانات حتى الآن</p>
                                )}
                            </motion.div>

                            {/* Wishlist */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="glass-surface p-6 sm:p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
                            >
                                <h3 className="font-[900] text-[1.4rem] tracking-[-0.02em] mb-6 flex items-center gap-2 text-[var(--color-text-primary)]">
                                    <motion.span
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                    >
                                        <Heart size={20} className="text-[var(--color-danger)]" fill="currentColor" />
                                    </motion.span>
                                    المفضلة ({wishlistItems.length})
                                </h3>
                                {wishlistItems.length > 0 ? (
                                    <motion.div
                                        className="space-y-3"
                                        variants={staggerContainer}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        {wishlistItems.map((item: any, i: number) => (
                                            <motion.div
                                                key={item.id || i}
                                                variants={staggerItem}
                                                whileHover={{ x: -4 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                                                className="flex items-center gap-4 p-4 hover:bg-[var(--color-danger)]/5 rounded-[var(--radius-xl)] border border-transparent hover:border-[var(--color-danger)]/20 transition-all cursor-pointer group"
                                            >
                                                <div className="flex-1 flex items-center gap-4" onClick={() => router.push(`/product/${item.id}`)}>
                                                    <div className="w-14 h-14 bg-black/20 border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {item.primary_image ? (
                                                            <img src={item.primary_image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        ) : (
                                                            <Package size={24} className="text-[var(--color-text-muted)]" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-[800] text-[14px] text-[var(--color-text-primary)] mb-1 group-hover:text-[var(--color-danger)] transition-colors">{item.title}</p>
                                                        <p className="text-[12px] text-[var(--color-accent)] font-[700]">{item.price} {dict.currency}</p>
                                                    </div>
                                                </div>
                                                <motion.button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            await wishlistAPI.toggle(item.id);
                                                            setWishlistItems(prev => prev.filter(w => w.id !== item.id));
                                                        } catch (err) {
                                                            console.error(err);
                                                        }
                                                    }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    transition={{ type: 'spring', stiffness: 400 }}
                                                    className="text-[var(--color-danger)]/70 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 p-2.5 rounded-lg transition-colors border border-transparent hover:border-[var(--color-danger)]/20"
                                                    title="إزالة من المفضلة"
                                                >
                                                    <Heart size={18} fill="currentColor" />
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <p className="text-slate-500 text-sm py-4 text-center">لسه مضفتش حاجة للمفضلة ❤️</p>
                                )}
                            </motion.div>

                            {/* Quick Action */}
                            <Link href="/sell">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                                    className="w-full gradient-accent text-white py-4 rounded-[var(--radius-xl)] font-[800] shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] flex items-center justify-center gap-2 mt-8"
                                >
                                    <Plus size={22} strokeWidth={3} />
                                    أضف إعلان جديد
                                </motion.button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Wallet Charge Modal */}
            <AnimatePresence>
                {isWalletModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60"
                        onClick={(e) => {
                            if (e.target === e.currentTarget && !isSuccess) setIsWalletModalOpen(false);
                        }}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] w-full max-w-md rounded-[var(--radius-2xl)] p-6 shadow-2xl relative overflow-hidden"
                        >
                            {!isSuccess ? (
                                <>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-black text-[var(--color-text-primary)]">شحن المحفظة</h3>
                                        <button onClick={() => setIsWalletModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-white transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Amount */}
                                        <div>
                                            <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-3">المبلغ (ج.م)</label>
                                            <div className="flex gap-2 flex-wrap mb-3">
                                                {['50', '100', '200', '500'].map(amt => (
                                                    <button
                                                        key={amt}
                                                        onClick={() => setChargeAmount(amt)}
                                                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${chargeAmount === amt ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-glow)]' : 'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)]/50'}`}
                                                    >
                                                        {amt}
                                                    </button>
                                                ))}
                                            </div>
                                            <input 
                                                type="number" 
                                                value={chargeAmount}
                                                onChange={(e) => setChargeAmount(e.target.value)}
                                                placeholder="مبلغ مخصص..."
                                                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] outline-none"
                                            />
                                        </div>

                                        {/* Method */}
                                        <div>
                                            <label className="block text-sm font-bold text-[var(--color-text-secondary)] mb-3">طريقة الدفع</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div 
                                                    onClick={() => setPaymentMethod('cc')}
                                                    className={`cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'cc' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-slate-500'}`}
                                                >
                                                    <CreditCard size={20} />
                                                    <span className="text-xs font-bold text-center">بطاقة بنكية</span>
                                                </div>
                                                <div 
                                                    onClick={() => setPaymentMethod('vc')}
                                                    className={`cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'vc' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-slate-500'}`}
                                                >
                                                    <Smartphone size={20} />
                                                    <span className="text-xs font-bold text-center">فودافون كاش</span>
                                                </div>
                                                <div 
                                                    onClick={() => setPaymentMethod('ip')}
                                                    className={`cursor-pointer flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${paymentMethod === 'ip' ? 'border-purple-500 bg-purple-500/10 text-purple-500' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-slate-500'}`}
                                                >
                                                    <QrCode size={20} />
                                                    <span className="text-xs font-bold text-center">إنستاباي</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Dynamic Forms */}
                                        <AnimatePresence mode="wait">
                                            {paymentMethod === 'cc' && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                                                    <input type="text" placeholder="رقم البطاقة (مثال: **** **** **** 1234)" className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary)] text-left dir-ltr font-mono text-sm" />
                                                    <div className="flex gap-3">
                                                        <input type="text" placeholder="MM/YY" className="w-1/2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 outline-none focus:border-[var(--color-primary)] text-center text-[var(--color-text-primary)]" />
                                                        <input type="password" placeholder="CVV" maxLength={3} className="w-1/2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 outline-none focus:border-[var(--color-primary)] text-center text-[var(--color-text-primary)]" />
                                                    </div>
                                                </motion.div>
                                            )}
                                            {paymentMethod === 'vc' && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                    <input type="tel" placeholder="رقم الهاتف (010...)" className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-[var(--color-text-primary)] outline-none focus:border-red-500 text-left dir-ltr font-mono" />
                                                </motion.div>
                                            )}
                                            {paymentMethod === 'ip' && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex justify-center py-2">
                                                    <div className="w-32 h-32 bg-[var(--color-bg)] border-2 border-dashed border-purple-500/50 rounded-xl flex items-center justify-center text-purple-500">
                                                        <QrCode size={40} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <button 
                                            onClick={() => {
                                                if (!chargeAmount || !paymentMethod) return;
                                                setIsSuccess(true);
                                                setTimeout(() => {
                                                    setIsSuccess(false);
                                                    setIsWalletModalOpen(false);
                                                }, 2000);
                                            }}
                                            disabled={!chargeAmount || !paymentMethod}
                                            className="w-full mt-4 bg-[var(--color-primary)] hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--shadow-glow)]"
                                        >
                                            تأكيد الدفع
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="py-12 flex flex-col items-center justify-center text-center"
                                >
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                                        className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4"
                                    >
                                        <CheckCircle2 size={40} />
                                    </motion.div>
                                    <h3 className="text-2xl font-black text-white mb-2">تم شحن رصيدك!</h3>
                                    <p className="text-[var(--color-text-muted)]">تم إضافة {chargeAmount} ج.م بنجاح لمحفظتك.</p>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
