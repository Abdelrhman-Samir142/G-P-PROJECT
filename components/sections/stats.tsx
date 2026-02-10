'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/language-provider';
import { Users, Package, Leaf, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { generalAPI } from '@/lib/api';

export function Stats() {
    const { dict } = useLanguage();
    const [statsData, setStatsData] = useState({
        total_users: 0,
        products_sold: 0,
        scrap_count: 0,
        active_governorates: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await generalAPI.getGeneralStats();
                setStatsData(data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        {
            icon: Users,
            label: dict.stats.activeUsers,
            value: statsData.total_users || '0',
            color: 'text-blue-600'
        },
        {
            icon: Package,
            label: dict.stats.productsSold,
            value: statsData.products_sold || '0',
            color: 'text-emerald-600'
        },
        {
            icon: Leaf,
            label: dict.stats.scrapTons,
            value: statsData.scrap_count || '0',
            color: 'text-green-600'
        },
        {
            icon: MapPin,
            label: dict.stats.governorates,
            value: statsData.active_governorates || '0',
            color: 'text-orange-600'
        },
    ];

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="relative group"
                        >
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
                                {/* Icon */}
                                <div className={`${stat.color} mb-3`}>
                                    <stat.icon size={32} strokeWidth={2.5} />
                                </div>

                                {/* Value */}
                                <h3 className="text-3xl font-black text-primary mb-1">
                                    {stat.value}
                                </h3>

                                {/* Label */}
                                <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">
                                    {stat.label}
                                </p>

                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
