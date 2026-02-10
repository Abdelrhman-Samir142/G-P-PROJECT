'use client';

import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIPricingProps {
    productPrice: number;
    productCategory: string;
}

export function AIPricing({ productPrice, productCategory }: AIPricingProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [analysis, setAnalysis] = useState<any>(null);

    useEffect(() => {
        // Simulate AI analysis
        const timer = setTimeout(() => {
            const marketAvg = productPrice * (0.9 + Math.random() * 0.2);
            const difference = ((productPrice - marketAvg) / marketAvg) * 100;

            setAnalysis({
                marketAverage: Math.round(marketAvg),
                yourPrice: productPrice,
                difference: Math.round(difference),
                recommendation: Math.abs(difference) < 5 ? 'excellent' : difference < 0 ? 'good' : 'high',
                similarProducts: Math.floor(Math.random() * 50) + 20,
                confidence: 85 + Math.floor(Math.random() * 15),
            });
            setIsAnalyzing(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, [productPrice]);

    if (isAnalyzing) {
        return (
            <div className="relative bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-primary-200 dark:border-primary-800 overflow-hidden">
                {/* Glassmorphism Effect */}
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-sm" />

                {/* Scanning Animation */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                        animate={{
                            y: [0, 200, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center py-8">
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                        }}
                        className="mb-4"
                    >
                        <Sparkles className="text-primary" size={40} />
                    </motion.div>

                    <h3 className="font-bold text-lg mb-2">جاري تحليل السعر بالذكاء الاصطناعي</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">يتم مقارنة السعر مع السوق المحلي...</p>

                    {/* Progress Dots */}
                    <div className="flex gap-2 mt-4">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-primary rounded-full"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-6 rounded-2xl border border-primary-200 dark:border-primary-800 overflow-hidden"
        >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-md" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-primary p-2 rounded-lg text-white">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">تحليل السعر بالذكاء الاصطناعي</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                            تم التحليل بناءً على {analysis.similarProducts} منتج مشابه
                        </p>
                    </div>
                </div>

                {/* Price Comparison */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl backdrop-blur-sm">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">متوسط السوق</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">
                            {analysis.marketAverage.toLocaleString()} <span className="text-xs">ج.م</span>
                        </p>
                    </div>

                    <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl backdrop-blur-sm">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">سعرك</p>
                        <p className="text-xl font-black text-primary">
                            {analysis.yourPrice.toLocaleString()} <span className="text-xs">ج.م</span>
                        </p>
                    </div>
                </div>

                {/* Recommendation */}
                <div className={`p-4 rounded-xl ${analysis.recommendation === 'excellent'
                        ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                        : analysis.recommendation === 'good'
                            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                            : 'bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700'
                    }`}>
                    <div className="flex items-start gap-3">
                        {analysis.recommendation === 'excellent' ? (
                            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                        ) : analysis.difference < 0 ? (
                            <TrendingDown className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                        ) : (
                            <TrendingUp className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                        )}

                        <div className="flex-1">
                            <p className="font-bold text-sm mb-1">
                                {analysis.recommendation === 'excellent'
                                    ? '✨ سعر ممتاز! تنافسي جداً'
                                    : analysis.recommendation === 'good'
                                        ? '👍 سعر جيد - أقل من السوق بـ ' + Math.abs(analysis.difference) + '%'
                                        : '⚠️ السعر أعلى من السوق بـ ' + analysis.difference + '%'
                                }
                            </p>
                            <p className="text-xs opacity-80">
                                {analysis.recommendation === 'excellent'
                                    ? 'السعر مثالي مقارنة بالسوق، احتمالية البيع السريع عالية جداً'
                                    : analysis.recommendation === 'good'
                                        ? 'سعر جذاب للمشترين، متوقع بيع سريع'
                                        : 'قد يتطلب وقت أطول للبيع. ننصح بخفض السعر قليلاً'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Confidence Bar */}
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">دقة التحليل</span>
                        <span className="text-xs font-bold text-primary">{analysis.confidence}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${analysis.confidence}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
