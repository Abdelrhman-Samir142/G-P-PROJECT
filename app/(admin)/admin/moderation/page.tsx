'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    X,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Filter,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Product {
    id: number;
    owner: number;
    owner_username: string;
    owner_email: string;
    title: string;
    description: string;
    price: number;
    category: string;
    status: string;
    created_at: string;
    detected_item: string;
}

interface ModerationResponse {
    count: number;
    page: number;
    page_size: number;
    results: Product[];
}

export default function ModerationQueuePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    const pageSize = 12;
    const totalPages = Math.ceil(totalCount / pageSize);

    useEffect(() => {
        const fetchPendingProducts = async () => {
            try {
                setLoading(true);
                const response = await api.get('/ai_agents/admin/moderation_queue/', {
                    params: { page, page_size: pageSize },
                });
                const data: ModerationResponse = response.data;
                setProducts(data.results);
                setTotalCount(data.count);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchPendingProducts();
    }, [page]);

    const handleApprove = async (productId: number) => {
        try {
            await api.post(`/ai_agents/admin/${productId}/approve-product/`);
            setProducts(products.filter(p => p.id !== productId));
            if (products.length === 1 && page > 1) {
                setPage(page - 1);
            }
        } catch (err: any) {
            setError('Failed to approve product');
        }
    };

    const handleReject = async () => {
        if (!selectedProduct) return;

        try {
            await api.post(`/ai_agents/admin/${selectedProduct.id}/reject-product/`, {
                reason: rejectReason,
            });
            setProducts(products.filter(p => p.id !== selectedProduct.id));
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedProduct(null);
            if (products.length === 1 && page > 1) {
                setPage(page - 1);
            }
        } catch (err: any) {
            setError('Failed to reject product');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Moderation Queue
                </h1>
                <p className="text-gray-600 mt-2">Review and approve/reject pending products</p>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="flex items-center gap-4">
                <div className="bg-white/40 backdrop-blur-xl rounded-lg border border-white/50 px-4 py-2">
                    <p className="text-sm text-gray-600">Pending Review</p>
                    <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                </div>
                <div className="bg-white/40 backdrop-blur-xl rounded-lg border border-white/50 px-4 py-2">
                    <p className="text-sm text-gray-600">Current Page</p>
                    <p className="text-2xl font-bold text-gray-900">{page}</p>
                </div>
            </motion.div>

            {/* Error Message */}
            {error && (
                <motion.div
                    variants={itemVariants}
                    className="p-4 bg-red-50/50 backdrop-blur-xl rounded-xl border border-red-200/50 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                </motion.div>
            )}

            {/* Products Grid */}
            {loading ? (
                <motion.div
                    variants={itemVariants}
                    className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-xl"
                >
                    <p className="text-gray-600">Loading products...</p>
                </motion.div>
            ) : products.length === 0 ? (
                <motion.div
                    variants={itemVariants}
                    className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-xl border border-emerald-200/50"
                >
                    <Check className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                    <p className="text-lg font-semibold text-gray-900">All caught up!</p>
                    <p className="text-gray-600 mt-1">There are no pending products to review.</p>
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.1 }}
                                className="group"
                            >
                                <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 overflow-hidden hover:border-emerald-200/50 transition-colors h-full flex flex-col"
                                >
                                    {/* Image Placeholder */}
                                    <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-400 font-semibold">
                                        <p className="text-sm">{product.category.toUpperCase()}</p>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="mb-3">
                                            <h3 className="font-bold text-gray-900 line-clamp-2">
                                                {product.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                by <span className="font-medium">{product.owner_username}</span>
                                            </p>
                                        </div>

                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {product.description}
                                        </p>

                                        {product.detected_item && (
                                            <div className="mb-3 inline-block">
                                                <span className="px-2 py-1 bg-blue-100/50 text-blue-700 text-xs font-medium rounded">
                                                    🤖 {product.detected_item}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between mb-3 mt-auto">
                                            <p className="text-lg font-bold text-emerald-600">${product.price}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(product.created_at).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleApprove(product.id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/80 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                                            >
                                                <Check className="w-4 h-4" />
                                                Approve
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setShowRejectModal(true);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                                Reject
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && (
                <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-between py-4"
                >
                    <p className="text-sm text-gray-600">
                        Showing {(page - 1) * pageSize + 1} to{' '}
                        {Math.min(page * pageSize, totalCount)} of {totalCount} products
                    </p>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="p-2 bg-white/40 hover:bg-white/60 rounded-lg border border-white/50 disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                        <span className="text-sm font-medium text-gray-700">
                            Page {page} of {totalPages}
                        </span>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="p -2 bg-white/40 hover:bg-white/60 rounded-lg border border-white/50 disabled:opacity-50 transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowRejectModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 p-6 max-w-md w-full mx-4 shadow-2xl"
                        >
                            <h3 className="text-lg font-bold text-gray-900">Reject Product</h3>
                            <p className="text-gray-600 mt-2">
                                "{selectedProduct?.title}"
                            </p>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Reason for Rejection
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 px-4 py-2 bg-gray-200/50 hover:bg-gray-300/50 text-gray-900 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleReject}
                                    className="flex-1 px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Reject Product
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
