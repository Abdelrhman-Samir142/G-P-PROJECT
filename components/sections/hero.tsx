'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
<<<<<<< HEAD
import { useAuth } from '@/components/providers/auth-provider';
=======
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
    const { dict, isRtl } = useLanguage();
<<<<<<< HEAD
    const { user } = useAuth();
=======
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883

    return (
        <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: isRtl ? 50 : -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
<<<<<<< HEAD
=======
                        {/* Badge */}
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-xs font-bold mb-6"
                        >
                            {dict.hero.badge}
                        </motion.span>

>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
                        {/* Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight"
                        >
                            {dict.hero.title}
                            <br />
                            <span className="text-primary bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                                {dict.hero.titleHighlight}
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-600 dark:text-slate-400 mb-8 text-lg leading-relaxed"
                        >
                            {dict.hero.description}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
<<<<<<< HEAD
                            <Link href={user ? "/dashboard" : "/login?redirect=/dashboard"}>
=======
                            <Link href="/dashboard">
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
                                <button className="w-full sm:w-auto bg-primary hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group">
                                    {dict.hero.browseProducts}
                                    <ArrowRight
                                        size={20}
                                        className={`group-hover:translate-x-1 transition-transform ${isRtl ? 'rotate-180' : ''}`}
                                    />
                                </button>
                            </Link>

<<<<<<< HEAD
                            <Link href={user ? "/sell" : "/login?redirect=/sell"}>
=======
                            <Link href="/sell">
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
                                <button className="w-full sm:w-auto border-2 border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary px-8 py-4 rounded-xl font-bold transition-all hover:bg-primary-50 dark:hover:bg-primary-900/20">
                                    {dict.hero.addListing}
                                </button>
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, x: isRtl ? -50 : 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1592492159418-39f319320569?auto=format&fit=crop&q=80&w=800"
                                alt="Sustainable marketplace"
                                className="w-full h-auto"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
<<<<<<< HEAD
=======

                        {/* AI Badge Float Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.7, type: 'spring' }}
                            className={`absolute -bottom-6 ${isRtl ? '-left-6' : '-right-6'} bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-xs`}
                        >
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="bg-primary p-3 rounded-xl text-white flex-shrink-0"
                                >
                                    <Sparkles size={24} />
                                </motion.div>

                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">
                                        {dict.hero.aiAnalysis}
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {dict.hero.aiAnalysisDesc}
                                    </p>
                                </div>
                            </div>

                            {/* Animated progress indicator */}
                            <div className="mt-3 flex gap-1">
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="flex-1 h-1 bg-primary-200 dark:bg-primary-900/30 rounded-full overflow-hidden"
                                    >
                                        <motion.div
                                            className="h-full bg-primary rounded-full"
                                            initial={{ width: '0%' }}
                                            animate={{ width: '100%' }}
                                            transition={{
                                                duration: 0.8,
                                                delay: 0.9 + i * 0.1,
                                                ease: 'easeOut',
                                            }}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
