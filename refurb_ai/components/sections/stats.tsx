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
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' } }}
            className="relative group cursor-default"
        >
            <div className="relative glass-surface p-8 rounded-[var(--radius-2xl)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-glow)] border border-[var(--color-border)]/50 transition-all duration-500 overflow-hidden text-center z-10">
                {/* Stunning Glowing Inner Orb */}
                <motion.div
                    className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-[30px] pointer-events-none"
                    style={{ background: 'var(--color-primary, #10b981)' }}
                />

                {/* Icon wrapper */}
                <motion.div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-3xl ${color.bg} border border-[var(--color-border)] mb-5 relative z-10 shadow-[var(--shadow-glow)] backdrop-blur-md`}
                    initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                    animate={inView ? { scale: 1, opacity: 1, rotate: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.15 + 0.3, type: 'spring', stiffness: 300 }}
                    whileHover={{ scale: 1.15, rotate: 10 }}
                >
                    <Icon size={28} className={color.text} strokeWidth={2.5} />
                </motion.div>

                {/* Value */}
                <h3 className="text-[2.5rem] lg:text-[3rem] font-[900] text-[var(--color-text-primary)] mb-2 relative z-10 tracking-[-0.03em]">
                    {count.toLocaleString()}
                </h3>

                {/* Label */}
                <p className="text-[var(--color-text-muted)] text-[13px] lg:text-sm font-[600] relative z-10 uppercase tracking-[0.1em]">
                    {label}
                </p>
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
        { icon: Users, label: dict.stats.activeUsers, value: statsData.total_users || 0, color: { text: 'text-cyan-400', bg: 'bg-cyan-500/10' } },
        { icon: Package, label: dict.stats.productsSold, value: statsData.products_sold || 0, color: { text: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' } },
        { icon: Leaf, label: dict.stats.scrapTons, value: statsData.scrap_count || 0, color: { text: 'text-[var(--color-primary)]', bg: 'bg-[var(--color-primary)]/10' } },
        { icon: MapPin, label: dict.stats.governorates, value: statsData.active_governorates || 0, color: { text: 'text-[var(--color-accent)]', bg: 'bg-[var(--color-accent)]/10' } },
    ];

    return (
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)] overflow-hidden">
            {/* Soft backdrop blur line separator */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
