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
            ease: [0.22, 1, 0.36, 1],
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
            color: 'text-primary',
            bg: 'bg-primary-50 dark:bg-primary-900/10',
            glow: 'group-hover:shadow-primary/20',
        },
        {
            icon: Sparkles,
            title: dict.features.smartSearch.title,
            desc: dict.features.smartSearch.desc,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/10',
            glow: 'group-hover:shadow-purple-500/20',
        },
        {
            icon: ShieldCheck,
            title: dict.features.secure.title,
            desc: dict.features.secure.desc,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/10',
            glow: 'group-hover:shadow-green-500/20',
        }
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.span
                        variants={staggerItem}
                        className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block"
                    >
                        {dict.features.title}
                    </motion.span>
                    <motion.h2
                        variants={staggerItem}
                        className="text-3xl md:text-5xl font-black mb-6"
                    >
                        {dict.features.subtitle}
                    </motion.h2>
                    <motion.div
                        variants={staggerItem}
                        className="w-16 h-1 bg-gradient-to-r from-primary to-green-400 rounded-full mx-auto"
                    />
                </motion.div>

                {/* Cards */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            whileHover={{ y: -8, transition: { duration: 0.25, ease: 'easeOut' } }}
                            className={`group p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl ${feature.glow} transition-shadow duration-300 cursor-default`}
                        >
                            <motion.div
                                className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6`}
                                whileHover={{ scale: 1.15, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                            >
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </motion.div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-200">
                                {feature.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
