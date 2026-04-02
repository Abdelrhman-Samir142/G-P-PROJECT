'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuctionTimer } from '@/components/ui/auction-timer';
import { useLanguage } from '@/components/providers/language-provider';
import { ArrowRight, ShoppingCart, MapPin, Star, Loader2, Edit, Trash2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { productsAPI, auctionsAPI, authAPI, chatAPI } from '@/lib/api';

const categoryLabels: Record<string, string> = {
    scrap_metals: 'خردة ومعادن',
    electronics: 'إلكترونيات وأجهزة',
    furniture: 'أثاث وديكور',
    cars: 'سيارات للبيع',
    real_estate: 'عقارات',
    books: 'كتب',
    other: 'أخرى',
};

const conditionLabels: Record<string, string> = {
    'new': 'جديد',
    'like-new': 'كالجديد',
    'good': 'جيد',
    'fair': 'مقبول',
};

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const { dict, isRtl } = useLanguage();
    const [selectedImage, setSelectedImage] = useState(0);
    const [product, setProduct] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bidAmount, setBidAmount] = useState('');
    const [bidding, setBidding] = useState(false);
    const [bidError, setBidError] = useState<string | null>(null);
    const [bidSuccess, setBidSuccess] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [chatLoading, setChatLoading] = useState(false);

    // Fetch product and user details
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch product and user in parallel
                const [productData, userData] = await Promise.all([
                    productsAPI.get(params.id as string),
                    authAPI.getCurrentUser().catch(() => null) // Allow 401 (guest)
                ]);

                setProduct(productData);
                setUser(userData);

                // Set default bid amount for auctions
                if (productData.is_auction && productData.auction) {
                    setBidAmount((parseFloat(productData.auction.current_bid || productData.price) + 10).toString());
                }
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchData();
        }
    }, [params.id]);

    const handlePlaceBid = async () => {
        if (!product?.is_auction || !product?.auction) return;

        setBidding(true);
        setBidError(null);
        setBidSuccess(false);

        try {
            await auctionsAPI.placeBid(product.auction.id, parseFloat(bidAmount));
            setBidSuccess(true);
            // Refresh product data to get updated bid
            const updatedProduct = await productsAPI.get(params.id as string);
            setProduct(updatedProduct);
        } catch (err: any) {
            console.error('Error placing bid:', err);
            setBidError(err.message || 'Failed to place bid');
        } finally {
            setBidding(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.')) return;

        setDeleting(true);
        try {
            await productsAPI.delete(product.id);
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Error deleting product:', err);
            alert('Fشل في حذف المنتج: ' + (err.message || 'Error occurred'));
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="pt-24 pb-12 min-h-screen px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary" size={40} />
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                <Navbar />
                <main className="pt-24 pb-12 min-h-screen px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)]">
                    <div className="max-w-7xl mx-auto text-center py-20">
                        <p className="text-red-500 text-[1.2rem] font-[600] mb-6">{error || 'Product not found'}</p>
                        <Link href="/dashboard">
                            <button className="gradient-accent text-white px-8 py-3.5 rounded-[var(--radius-lg)] font-[700] hover:shadow-[var(--shadow-glow)] transition-all duration-300">
                                العودة للمتجر
                            </button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const images = product.images?.map((img: any) => img.image) || [product.image || '/placeholder.png'];

    // Check ownership: handle both Profile response (user.user.id) and User response (user.id)
    const currentUserId = user?.user?.id || user?.id;
    const isOwner = currentUserId && product.owner && currentUserId === product.owner.id;

    return (
        <>
            <Navbar />
            <main className="pt-24 pb-12 min-h-screen px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)] relative">
                {/* REDESIGN: Ambient mesh gradient */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--color-primary)]/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
                
                <div className="max-w-7xl mx-auto relative z-10">
                    {/* Back Button */}
                    <Link href="/dashboard">
                        <button className="mb-8 flex items-center gap-2 text-[13px] font-[700] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors duration-300">
                            <ArrowRight size={16} className={isRtl ? '' : 'rotate-180'} />
                            {dict.product.backToShop}
                        </button>
                    </Link>

                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-2 gap-10">
                        {/* Image Gallery */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <motion.div
                                key={selectedImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="relative aspect-square rounded-[var(--radius-2xl)] overflow-hidden bg-slate-50/50 shadow-[var(--shadow-md)]"
                            >
                                <img
                                    src={images[selectedImage]}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* Thumbnail Gallery */}
                            {images.length > 1 && (
                                <div className="grid grid-cols-3 gap-3">
                                    {images.map((image: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`relative aspect-square rounded-[var(--radius-lg)] overflow-hidden border-2 transition-all duration-300 ${selectedImage === index
                                                ? 'border-[var(--color-accent)] shadow-[var(--shadow-glow)]'
                                                : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
                                                }`}
                                        >
                                            <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-8">
                            {/* Title & Category */}
                            <div>
                                <span className="inline-block bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 px-3 py-1.5 rounded-[var(--radius-sm)] text-[12px] font-[700] mb-4 shadow-[var(--shadow-glow)]">
                                    {categoryLabels[product.category] || product.category}
                                </span>
                                <div className="flex justify-between items-start gap-4">
                                    <h1 className="text-[2.2rem] md:text-[2.8rem] font-[900] mb-4 text-[var(--color-text-primary)] tracking-[-0.02em]">{product.title}</h1>
                                    {isOwner && (
                                        <span className="bg-amber-50 text-amber-600 text-[11px] px-2.5 py-1 rounded-[var(--radius-sm)] font-[700] border border-amber-200/50 mt-2">
                                            منتجك
                                        </span>
                                    )}
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-2 text-[var(--color-text-muted)] mt-2">
                                    <MapPin size={18} strokeWidth={2} className="text-[var(--color-accent)]" />
                                    <span className="text-[14px] font-[600]">{product.location || 'غير محدد'}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-[var(--color-text-secondary)] text-[1.1rem] leading-[1.8] font-[400] bg-white/40 p-5 rounded-[var(--radius-xl)] border border-[var(--color-border)]">{product.description}</p>

                            {/* Condition */}
                            <div className="flex items-center gap-4 p-5 glass-surface rounded-[var(--radius-xl)] shadow-[var(--shadow-xs)]">
                                <div className="flex-1">
                                    <p className="text-[12px] text-[var(--color-text-muted)] font-[700] mb-1.5 uppercase">الحالة</p>
                                    <p className="font-[800] text-[1.1rem] text-[var(--color-text-primary)]">{conditionLabels[product.condition] || product.condition}</p>
                                </div>
                                <div className="flex-1 border-r border-[var(--color-border)] pr-4">
                                    <p className="text-[12px] text-[var(--color-text-muted)] font-[700] mb-1.5 uppercase">التصنيف</p>
                                    <p className="font-[800] text-[1.1rem] text-[var(--color-text-primary)]">{categoryLabels[product.category] || product.category}</p>
                                </div>
                            </div>

                            {/* Price or Auction */}
                            {product.is_auction && product.auction ? (
                                <>
                                    <div className="glass-surface p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-md)]">
                                        <p className="text-[var(--color-text-muted)] text-[12px] uppercase font-[800] tracking-[0.05em] mb-3">
                                            {product.auction.is_active ? 'المزايدة الحالية' : 'السعر النهائي'}
                                        </p>
                                        <p className="text-[3rem] md:text-[3.5rem] font-[900] text-[var(--color-accent)] leading-none tracking-[-0.03em]">
                                            {parseFloat(product.auction.current_bid || product.price).toLocaleString()}
                                            <span className="text-[1.2rem] mr-3 font-[600] text-[var(--color-text-secondary)] tracking-normal">{dict.currency}</span>
                                        </p>
                                        {product.auction.total_bids !== undefined && (
                                            <p className="text-xs text-slate-500 mt-2">
                                                {product.auction.total_bids} مزايدة
                                            </p>
                                        )}
                                    </div>

                                    {/* Auction Timer or Ended State */}
                                    {product.auction.is_active ? (
                                        <AuctionTimer endTime={product.auction.end_time} />
                                    ) : (
                                        <div className="p-5 glass-surface border border-[var(--color-danger)]/40 rounded-[var(--radius-xl)] text-center shadow-[var(--shadow-glow)]">
                                            <p className="text-[var(--color-danger)] font-[800] text-xl mb-2 flex items-center justify-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-danger)]" />
                                                المزاد انتهى
                                            </p>
                                            {product.auction.highest_bidder_name && (
                                                <p className="text-[14px] text-[var(--color-text-secondary)] font-[500]">
                                                    الفائز: <span className="font-[800] text-[var(--color-accent)]">{product.auction.highest_bidder_name}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Bid Form (Only show if NOT owner AND auction is active) */}
                                    {!isOwner && product.auction.is_active && (
                                        <div className="space-y-3">
                                            {bidSuccess && (
                                                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                                    <p className="text-green-600 dark:text-green-400 text-sm text-center font-bold">
                                                        تم تقديم المزايدة بنجاح! ✓
                                                    </p>
                                                </div>
                                            )}
                                            {bidError && (
                                                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                                    <p className="text-red-600 dark:text-red-400 text-sm text-center">{bidError}</p>
                                                </div>
                                            )}
                                            <div className="flex gap-3">
                                                <input
                                                    type="number"
                                                    value={bidAmount}
                                                    onChange={(e) => setBidAmount(e.target.value)}
                                                    placeholder="أدخل قيمة المزايدة"
                                                    className="flex-1 glass-surface border border-[var(--color-border)] rounded-[var(--radius-lg)] px-5 py-4 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 text-[var(--color-text-primary)] font-[500]"
                                                />
                                                <button
                                                    onClick={handlePlaceBid}
                                                    disabled={bidding}
                                                    className="gradient-accent text-white px-8 py-4 rounded-[var(--radius-lg)] font-[800] transition-all duration-300 shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {bidding && <Loader2 className="animate-spin" size={18} />}
                                                    {bidding ? 'جار المزایدة...' : 'زايد الآن'}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bid History */}
                                    {product.auction.bids && product.auction.bids.length > 0 && (
                                        <div className="glass-surface border border-[var(--color-border)] rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-xs)]">
                                            <div className="p-4 border-b border-[var(--color-border)] bg-black/10">
                                                <h3 className="font-[800] text-[14px] text-[var(--color-text-primary)] flex items-center gap-2">
                                                    سجل المزايدات ({product.auction.bids.length})
                                                </h3>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto custom-scroll">
                                                {product.auction.bids
                                                    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                                                    .map((bid: any, index: number) => (
                                                        <div
                                                            key={bid.id || index}
                                                            className={`flex items-center justify-between p-4 ${index === 0 ? 'bg-[var(--color-primary)]/5' : ''} ${index !== product.auction.bids.length - 1 ? 'border-b border-[var(--color-border)]/50' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-[800] ${index === 0 ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-glow)]' : 'bg-black/20 text-[var(--color-text-secondary)] border border-[var(--color-border)]'}`}>
                                                                    {index === 0 ? '★' : index + 1}
                                                                </div>
                                                                <div>
                                                                    <p className={`text-[13px] font-[800] ${index === 0 ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-primary)]'}`}>
                                                                        {bid.bidder_name || 'مستخدم'}
                                                                    </p>
                                                                    <p className="text-[11px] text-[var(--color-text-muted)] font-[500] mt-0.5">
                                                                        {new Date(bid.created_at).toLocaleString('ar-EG', {
                                                                            month: 'short', day: 'numeric',
                                                                            hour: '2-digit', minute: '2-digit'
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className={`font-[900] text-[15px] ${index === 0 ? 'text-[var(--color-accent)] tracking-[0.02em] drop-shadow-[0_0_4px_rgba(255,215,0,0.5)]' : 'text-[var(--color-text-primary)]'}`}>
                                                                {parseFloat(bid.amount).toLocaleString()} {dict.currency}
                                                            </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="glass-surface p-8 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-[var(--shadow-md)]">
                                        <p className="text-[var(--color-text-muted)] text-[12px] uppercase font-[800] tracking-[0.05em] mb-3">
                                            {dict.product.requestedPrice}
                                        </p>
                                        <p className="text-[3rem] md:text-[3.5rem] font-[900] text-[var(--color-accent)] leading-none tracking-[-0.03em]">
                                            {parseFloat(product.price).toLocaleString()}
                                            <span className="text-[1.2rem] mr-3 font-[600] text-[var(--color-text-secondary)] tracking-normal">{dict.currency}</span>
                                        </p>
                                    </div>
                                </>
                            )}


                            {/* Seller Info */}
                            {product.owner && !isOwner && (
                                <div className="p-5 glass-surface border border-[var(--color-border)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xs)]">
                                    <p className="text-[12px] text-[var(--color-text-secondary)] font-[800] mb-4 uppercase tracking-widest">البائع</p>
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={product.owner_profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.owner.username}`}
                                            alt={product.owner.username}
                                            className="w-12 h-12 rounded-full border-2 border-[var(--color-primary)] shadow-[var(--shadow-glow)]"
                                        />
                                        <div className="flex-1">
                                            <p className="font-[800] text-[15px] text-[var(--color-text-primary)]">{product.owner.first_name || product.owner.username}</p>
                                            <div className="flex items-center gap-2 text-[13px] mt-1 text-[var(--color-text-muted)] font-[500]">
                                                {product.owner_profile && (
                                                    <div className="flex items-center gap-1 bg-[var(--color-accent)]/10 px-2 py-0.5 rounded-[var(--radius-sm)] text-[var(--color-accent)]">
                                                        <Star size={12} className="fill-current" />
                                                        <span className="font-[800]">{product.owner_profile.seller_rating || 0}</span>
                                                    </div>
                                                )}
                                                {product.owner_profile?.city && (
                                                    <span>• {product.owner_profile.city}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {isOwner ? (
                                <div className="flex gap-4 pt-6 border-t border-[var(--color-border)]">
                                    <button
                                        onClick={() => router.push(`/product/edit/${product.id}`)}
                                        className="flex-1 glass-surface border border-[var(--color-primary)]/50 text-[var(--color-primary)] py-4 rounded-[var(--radius-xl)] font-[800] transition-all hover:bg-[var(--color-primary)] hover:text-white flex items-center justify-center gap-2 shadow-[var(--shadow-sm)]"
                                    >
                                        <Edit size={20} />
                                        تعديل الإعلان
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex-1 bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/30 hover:bg-[var(--color-danger)] hover:text-white py-4 rounded-[var(--radius-xl)] font-[800] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-[var(--shadow-sm)]"
                                    >
                                        {deleting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                        حذف المنتج
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-4 pt-6 border-t border-[var(--color-border)]">
                                    <button
                                        onClick={async () => {
                                            if (!user) { router.push('/login'); return; }
                                            setChatLoading(true);
                                            try {
                                                await chatAPI.startConversation(product.id);
                                                router.push('/messages');
                                            } catch (err) {
                                                console.error('Failed to start conversation:', err);
                                                setChatLoading(false);
                                            }
                                        }}
                                        disabled={chatLoading}
                                        className="flex-1 gradient-accent text-white py-4 rounded-[var(--radius-lg)] font-[700] transition-all shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {chatLoading ? <Loader2 className="animate-spin" size={22} /> : <MessageCircle size={22} strokeWidth={2.5} />}
                                        <span className="text-[15px]">{dict.product.contactSeller}</span>
                                    </button>
                                    <button className="px-8 py-4 glass-surface border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] rounded-[var(--radius-lg)] transition-all duration-300 shadow-[var(--shadow-sm)] text-[var(--color-text-primary)]">
                                        <ShoppingCart size={22} strokeWidth={2.5} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
