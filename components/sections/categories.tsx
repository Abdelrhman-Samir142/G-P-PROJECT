'use client';

import { useLanguage } from '@/components/providers/language-provider';
import { motion } from 'framer-motion';
import { Laptop, Sofa, Recycle, Car, Building2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { staggerContainer, staggerItem } from '@/lib/animations';

const cardVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.45,
            delay: i * 0.08,
            ease: [0.22, 1, 0.36, 1],
        },
    }),
};

export function Categories() {
    const { dict } = useLanguage();
    const router = useRouter();
    const { user } = useAuth();

    const categories = [
        { id: 'scrap_metals', name: 'خردة ومعادن', icon: Recycle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', ring: 'hover:ring-green-400/40' },
        { id: 'electronics', name: 'إلكترونيات وأجهزة', icon: Laptop, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', ring: 'hover:ring-blue-400/40' },
        { id: 'furniture', name: 'أثاث وديكور', icon: Sofa, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', ring: 'hover:ring-amber-400/40' },
        { id: 'cars', name: 'سيارات للبيع', icon: Car, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', ring: 'hover:ring-red-400/40' },
        { id: 'real_estate', name: 'عقارات', icon: Building2, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', ring: 'hover:ring-purple-400/40' },
        { id: 'other', name: 'أخرى', icon: Package, color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-900/20', ring: 'hover:ring-slate-400/40' },
    ];

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="text-center mb-16"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.h2
                        variants={staggerItem}
                        className="text-3xl md:text-4xl font-bold mb-4"
                    >
                        {dict.categories.title}
                    </motion.h2>
                    <motion.p
                        variants={staggerItem}
                        className="text-slate-600 dark:text-slate-400 text-lg"
                    >
                        {dict.categories.subtitle}
                    </motion.p>
                    <motion.div
                        variants={staggerItem}
                        className="w-12 h-1 bg-gradient-to-r from-primary to-green-400 rounded-full mx-auto mt-4"
                    />
                </motion.div>

                {/* Category Cards */}
                <div className="flex flex-wrap justify-center gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="w-[calc(50%-12px)] sm:w-48 lg:w-56"
                        >
                            <motion.div
                                onClick={() => {
                                    const targetUrl = `/dashboard?category=${category.id}`;
                                    if (user) router.push(targetUrl);
                                    else router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
                                }}
                                whileHover={{ y: -6, scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                                className={`group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow text-center cursor-pointer border border-transparent hover:border-primary ring-2 ring-transparent ${category.ring} hover:ring-2`}
                            >
                                <motion.div
                                    className={`w-16 h-16 mx-auto rounded-full ${category.bg} flex items-center justify-center mb-4`}
                                    whileHover={{ scale: 1.18, rotate: 8 }}
                                    transition={{ type: 'spring', stiffness: 350, damping: 16 }}
                                >
                                    <category.icon className={`w-8 h-8 ${category.color}`} />
                                </motion.div>
                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors duration-200">
                                    {category.name}
                                </h3>
                                {/* Animated underline */}
                                <motion.div
                                    className="h-0.5 bg-primary rounded-full mx-auto mt-2"
                                    initial={{ width: 0 }}
                                    whileHover={{ width: '70%' }}
                                    transition={{ duration: 0.25 }}
                                />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
