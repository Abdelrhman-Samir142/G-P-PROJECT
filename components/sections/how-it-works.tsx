'use client';

import { motion } from 'framer-motion';
import { Search, ShieldCheck, Handshake, Rocket } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

const steps = [
    {
        icon: Search,
        number: '01',
        title: 'تصفح المنتجات',
        desc: 'اكتشف آلاف المنتجات والإعلانات المتنوعة في مختلف الفئات بسهولة تامة.',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        icon: ShieldCheck,
        number: '02',
        title: 'تحقق من البائع',
        desc: 'اطلع على تقييمات البائع ودرجة الموثوقية قبل اتخاذ قرار الشراء.',
        color: 'from-emerald-500 to-green-500',
    },
    {
        icon: Handshake,
        number: '03',
        title: 'تواصل وتفاوض',
        desc: 'تواصل مباشرة مع البائع عبر نظام المراسلة الفوري وتفاوض على السعر.',
        color: 'from-orange-500 to-amber-500',
    },
    {
        icon: Rocket,
        number: '04',
        title: 'أتمم الصفقة',
        desc: 'ادفع بأمان عبر المحفظة الإلكترونية واستلم منتجك بثقة كاملة.',
        color: 'from-purple-500 to-pink-500',
    },
];

export function HowItWorks() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto relative">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-20"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.span
                        variants={staggerItem}
                        className="text-primary font-bold uppercase tracking-wider text-sm mb-2 block"
                    >
                        كيف يعمل؟
                    </motion.span>
                    <motion.h2
                        variants={staggerItem}
                        className="text-3xl md:text-5xl font-black mb-4"
                    >
                        خطوات بسيطة للبدء
                    </motion.h2>
                    <motion.p
                        variants={staggerItem}
                        className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-lg"
                    >
                        من التصفح إلى إتمام الصفقة، كل شيء سهل وسريع
                    </motion.p>
                    <motion.div
                        variants={staggerItem}
                        className="w-16 h-1 bg-gradient-to-r from-primary to-green-400 rounded-full mx-auto mt-4"
                    />
                </motion.div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -8 }}
                            className="group relative"
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-lg shadow-slate-200/30 dark:shadow-none h-full flex flex-col items-center text-center transition-shadow hover:shadow-xl relative overflow-hidden">
                                {/* Large step number */}
                                <span className="absolute top-4 right-4 text-6xl font-black text-slate-100 dark:text-slate-800/60 select-none leading-none">
                                    {step.number}
                                </span>

                                {/* Icon */}
                                <div className={`relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <step.icon className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-lg font-bold mb-3 relative z-10 group-hover:text-primary transition-colors">
                                    {step.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed relative z-10">
                                    {step.desc}
                                </p>
                            </div>

                            {/* Connector line (hidden on last item & on mobile) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-slate-300 dark:border-slate-600 z-20" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
