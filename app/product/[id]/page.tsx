'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuctionTimer } from '@/components/ui/auction-timer';
import { AIPricing } from '@/components/ui/ai-pricing';
import { useLanguage } from '@/components/providers/language-provider';
import { ArrowRight, ShoppingCart, MapPin, Star, Loader2, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { productsAPI, auctionsAPI, authAPI } from '@/lib/api';

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
                <main className="pt-24 pb-12 min-h-screen px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto text-center py-20">
                        <p className="text-red-500 text-lg mb-4">{error || 'Product not found'}</p>
                        <Link href="/dashboard">
                            <button className="bg-primary hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all">
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
            <main className="pt-24 pb-12 min-h-screen px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Back Button */}
                    <Link href="/dashboard">
                        <button className="mb-6 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-700 transition-colors">
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
                                className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800"
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
                                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index
                                                ? 'border-primary shadow-lg'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                                }`}
                                        >
                                            <img src={image} alt={`${product.title} ${index + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Title & Category */}
                            <div>
                                <span className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-lg text-xs font-bold mb-3">
                                    {product.category}
                                </span>
                                <div className="flex justify-between items-start gap-4">
                                    <h1 className="text-3xl md:text-4xl font-black mb-3">{product.title}</h1>
                                    {isOwner && (
                                        <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-md font-bold border border-amber-200">
                                            منتجك
                                        </span>
                                    )}
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <MapPin size={16} />
                                    <span className="text-sm font-semibold">{product.location || 'غير محدد'}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{product.description}</p>

                            {/* Condition */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">الحالة</p>
                                    <p className="font-bold">{product.condition}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">التصنيف</p>
                                    <p className="font-bold">{product.category}</p>
                                </div>
                            </div>

                            {/* Price or Auction */}
                            {product.is_auction && product.auction ? (
                                <>
                                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold mb-2">
                                            المزايدة الحالية
                                        </p>
                                        <p className="text-4xl md:text-5xl font-black text-primary">
                                            {parseFloat(product.auction.current_bid || product.price).toLocaleString()}
                                            <span className="text-lg mr-2">{dict.currency}</span>
                                        </p>
                                    </div>

                                    {/* Auction Timer */}
                                    <AuctionTimer endTime={product.auction.end_time} />

                                    {/* Bid Form (Only show if NOT owner) */}
                                    {!isOwner && (
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
                                                    className="flex-1 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900"
                                                />
                                                <button
                                                    onClick={handlePlaceBid}
                                                    disabled={bidding}
                                                    className="bg-primary hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {bidding && <Loader2 className="animate-spin" size={18} />}
                                                    {bidding ? 'جار المزایدة...' : 'زايد الآن'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                                        <p className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold mb-2">
                                            {dict.product.requestedPrice}
                                        </p>
                                        <p className="text-4xl md:text-5xl font-black text-primary">
                                            {parseFloat(product.price).toLocaleString()}
                                            <span className="text-lg mr-2">{dict.currency}</span>
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* AI Pricing Analysis */}
                            <div className="relative">
                                <AIPricing productPrice={parseFloat(product.price)} productCategory={product.category} />
                                {isOwner && (
                                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300">
                                        💡 نصيحة المالك: {parseFloat(product.price) > 1000 ? 'السعر يبدو مرتفعاً قليلاً مقارنة بالسوق، قد ترغب في تخفيضه.' : 'سعرك ممتاز ومنافس جداً!'}
                                    </div>
                                )}
                            </div>

                            {/* Seller Info */}
                            {product.seller && !isOwner && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-3">البائع</p>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={product.seller.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.seller.username}`}
                                            alt={product.seller.username}
                                            className="w-12 h-12 rounded-full border-2 border-primary"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold">{product.seller.username}</p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                    <span className="font-semibold">4.8</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {isOwner ? (
                                <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => router.push(`/sell?edit=${product.id}`)} // Assuming edit flow exists or reused sell page
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Edit size={20} />
                                        تعديل الإعلان
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {deleting ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                                        حذف المنتج
                                    </button>
                                </div>
                            ) : (
                                !product.is_auction && (
                                    <div className="flex gap-4">
                                        <button className="flex-1 bg-primary hover:bg-primary-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg">
                                            {dict.product.contactSeller}
                                        </button>
                                        <button className="px-6 py-4 border-2 border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary rounded-xl transition-all hover:bg-primary-50 dark:hover:bg-primary-900/20">
                                            <ShoppingCart size={20} />
                                        </button>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
