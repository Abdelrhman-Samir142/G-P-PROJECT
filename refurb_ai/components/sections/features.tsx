'use client';

import { useLanguage } from '@/components/providers/language-provider';
import { motion } from 'framer-motion';
import { Brain, Sparkles, ShieldCheck } from 'lucide-react';
import { staggerContainer, staggerItem, fadeUp } from '@/lib/animations';

const cardVariants = {
    hidden: { opacity: 0, y: 36, scale: 0.96 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.55,
            delay: i * 0.15,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
    }),
};

export function Features() {
    const { dict } = useLanguage();

    const features = [
        {
            icon: Brain,
            title: dict.features.aiPricing.title,
            desc: dict.features.aiPricing.desc,
            color: 'text-[var(--color-accent)]',
            bg: 'bg-[var(--color-accent)]/10',
            glow: 'group-hover:shadow-[var(--shadow-glow)]',
        },
        {
            icon: Sparkles,
            title: dict.features.smartSearch.title,
            desc: dict.features.smartSearch.desc,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            glow: 'group-hover:shadow-[0_0_20px_theme(colors.purple.500/20)]',
        },
        {
            icon: ShieldCheck,
            title: dict.features.secure.title,
            desc: dict.features.secure.desc,
            color: 'text-[var(--color-primary)]',
            bg: 'bg-[var(--color-primary)]/10',
            glow: 'group-hover:shadow-[var(--shadow-glow)]',
        }
    ];

    return (
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)] overflow-hidden">
            {/* Background Blob Effects */}
            <div className="absolute top-[30%] left-[-15%] w-[800px] h-[800px] bg-[var(--color-primary)]/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-[var(--color-accent)]/10 rounded-full blur-[140px] pointer-events-none mix-blend-screen" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-24"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.span
                        variants={staggerItem}
                        className="inline-block px-4 py-1.5 rounded-[var(--radius-pill)] bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-[700] uppercase tracking-[0.1em] text-[12px] mb-6 border border-[var(--color-accent)]/30 shadow-[var(--shadow-glow)]"
                    >
                        {dict.features.title}
                    </motion.span>
                    <motion.h2
                        variants={staggerItem}
                        className="text-[2.2rem] md:text-[3.5rem] font-[900] mb-8 text-[var(--color-text-primary)] tracking-[-0.03em]"
                    >
                        {dict.features.subtitle}
                    </motion.h2>
                    <motion.div
                        variants={staggerItem}
                        className="w-16 h-[3px] gradient-accent rounded-full mx-auto shadow-[0_0_12px_var(--color-accent-glow)]"
                    />
                </motion.div>

                {/* Cards */}
                <div className="grid lg:grid-cols-3 gap-10 mb-16">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            whileHover={{ y: -12, transition: { duration: 0.4, ease: 'easeOut' } }}
                            className="group relative p-10 lg:p-12 rounded-[var(--radius-2xl)] glass-surface shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-glow)] transition-all duration-500 cursor-default overflow-hidden border border-[var(--color-border)]/50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            <motion.div
                                className={`relative z-10 w-20 h-20 ${feature.bg} rounded-3xl flex items-center justify-center mb-8 shadow-sm border border-[var(--color-border)]`}
                                whileHover={{ scale: 1.1, rotate: 8 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                            >
                                <feature.icon className={`w-10 h-10 ${feature.color} drop-shadow-md`} />
                                <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.div>
                            <h3 className="relative z-10 text-[1.3rem] font-[800] mb-4 text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors duration-300">
                                {feature.title}
                            </h3>
                            <p className="relative z-10 text-[var(--color-text-secondary)] text-[1.05rem] leading-[1.7] font-[400]">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
