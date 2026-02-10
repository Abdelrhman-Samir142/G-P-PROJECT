'use client';

import { useLanguage } from '@/components/providers/language-provider';
import { motion } from 'framer-motion';
import { Laptop, Sofa, Recycle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

export function Categories() {
    const { dict } = useLanguage();
    const router = useRouter();
    const { user } = useAuth();

    const categories = [
        {
            id: 'electronics',
            name: dict.categories.electronics,
            icon: Laptop,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            id: 'furniture',
            name: dict.categories.furniture,
            icon: Sofa,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            id: 'scrap',
            name: dict.categories.scrap,
            icon: Recycle,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/20',
        },
    ];

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-4"
                    >
                        {dict.categories.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-600 dark:text-slate-400 text-lg"
                    >
                        {dict.categories.subtitle}
                    </motion.p>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="w-[calc(50%-12px)] sm:w-48 lg:w-56"
                        >
                            <div
                                onClick={() => {
                                    const targetUrl = `/dashboard?category=${category.id}`;
                                    if (user) {
                                        router.push(targetUrl);
                                    } else {
                                        router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
                                    }
                                }}
                                className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-center cursor-pointer border border-transparent hover:border-primary"
                            >
                                <div className={`w-16 h-16 mx-auto rounded-full ${category.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <category.icon className={`w-8 h-8 ${category.color}`} />
                                </div>
                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                    {category.name}
                                </h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
