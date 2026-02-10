'use client';

import { useLanguage } from '@/components/providers/language-provider';
import { motion } from 'framer-motion';
import { Brain, Sparkles, ShieldCheck } from 'lucide-react';

export function Features() {
    const { dict } = useLanguage();

    const features = [
        {
            icon: Brain,
            title: dict.features.aiPricing.title,
            desc: dict.features.aiPricing.desc,
            color: 'text-primary',
            bg: 'bg-primary-50 dark:bg-primary-900/10'
        },
        {
            icon: Sparkles,
            title: dict.features.smartSearch.title,
            desc: dict.features.smartSearch.desc,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/10'
        },
        {
            icon: ShieldCheck,
            title: dict.features.secure.title,
            desc: dict.features.secure.desc,
            color: 'text-green-500',
            bg: 'bg-green-50 dark:bg-green-900/10'
        }
    ];

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block"
                    >
                        {dict.features.title}
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-black mb-6"
                    >
                        {dict.features.subtitle}
                    </motion.h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
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
