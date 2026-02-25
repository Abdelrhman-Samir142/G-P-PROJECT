'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/components/providers/language-provider';
import { Users, Package, Leaf, MapPin } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { generalAPI } from '@/lib/api';
import { staggerContainer, staggerItem } from '@/lib/animations';

// Hook: animate a number counting up when in view
function useCountUp(target: number, duration = 1.5, inView = false) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!inView || target === 0) return;
        let startTime: number | null = null;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            // easeOut cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [target, duration, inView]);
    return count;
}

function StatCard({ icon: Icon, label, value, color, index }: any) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    const numericValue = typeof value === 'number' ? value : parseInt(value) || 0;
    const count = useCountUp(numericValue, 1.6, inView);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -6, transition: { duration: 0.22, ease: 'easeOut' } }}
            className="relative group cursor-default"
        >
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                {/* Animated background glow */}
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                    style={{ background: 'radial-gradient(circle at 50% 50%, var(--color-primary, #16a34a) 0%, transparent 70%)', opacity: 0 }}
                    whileHover={{ opacity: 0.05 }}
                />

                {/* Icon */}
                <motion.div
                    className={`${color} mb-3`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: index * 0.12 + 0.25, type: 'spring', stiffness: 300 }}
                >
                    <Icon size={32} strokeWidth={2.5} />
                </motion.div>

                {/* Value with count-up */}
                <h3 className="text-3xl font-black text-primary mb-1">
                    {count.toLocaleString()}
                </h3>

                {/* Label */}
                <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">{label}</p>
            </div>
        </motion.div>
    );
}

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
        { icon: Users, label: dict.stats.activeUsers, value: statsData.total_users || 0, color: 'text-blue-600' },
        { icon: Package, label: dict.stats.productsSold, value: statsData.products_sold || 0, color: 'text-emerald-600' },
        { icon: Leaf, label: dict.stats.scrapTons, value: statsData.scrap_count || 0, color: 'text-green-600' },
        { icon: MapPin, label: dict.stats.governorates, value: statsData.active_governorates || 0, color: 'text-orange-600' },
    ];

    return (
        <section className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
