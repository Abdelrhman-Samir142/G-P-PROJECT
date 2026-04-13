'use client';

import { motion } from 'framer-motion';
import { Zap, Shield, TrendingUp, Headphones, Wallet, Globe } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

const reasons = [
    {
        icon: Zap,
        title: 'سرعة فائقة',
        desc: 'واجهة سريعة وسلسة مبنية بأحدث التقنيات لتجربة شراء وبيع بدون أي تأخير.',
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
        icon: Shield,
        title: 'أمان وخصوصية',
        desc: 'نظام حماية متقدم لبياناتك ومعاملاتك المالية مع تشفير كامل لجميع البيانات الحساسة.',
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
        icon: TrendingUp,
        title: 'ذكاء اصطناعي',
        desc: 'تسعير ذكي وتصنيف تلقائي للمنتجات باستخدام أحدث تقنيات الذكاء الاصطناعي.',
        color: 'text-purple-500',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
        icon: Headphones,
        title: 'دعم مباشر',
        desc: 'فريق دعم متاح على مدار الساعة لمساعدتك في أي استفسار أو مشكلة.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
        icon: Wallet,
        title: 'محفظة إلكترونية',
        desc: 'نظام محفظة متكامل يتيح لك الشراء والبيع بسهولة مع متابعة جميع معاملاتك.',
        color: 'text-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
        icon: Globe,
        title: 'مزادات حية',
        desc: 'نظام مزادات متطور يتيح لك المنافسة والحصول على أفضل الأسعار في الوقت الحقيقي.',
        color: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-900/20',
    },
];

export function WhyFourSale() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background accents */}
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto relative">
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
                        لماذا تختارنا؟
                    </motion.span>
                    <motion.h2
                        variants={staggerItem}
                        className="text-3xl md:text-5xl font-black mb-4"
                    >
                        لماذا <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">4Sale</span>؟
                    </motion.h2>
                    <motion.p
                        variants={staggerItem}
                        className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-lg"
                    >
                        نقدم لك تجربة تسوق وبيع لا مثيل لها
                    </motion.p>
                    <motion.div
                        variants={staggerItem}
                        className="w-16 h-1 bg-gradient-to-r from-primary to-green-400 rounded-full mx-auto mt-4"
                    />
                </motion.div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reasons.map((reason, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -6, transition: { duration: 0.25 } }}
                            className="group"
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex gap-5">
                                {/* Icon */}
                                <div className={`w-14 h-14 ${reason.bg} rounded-xl flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <reason.icon className={`w-7 h-7 ${reason.color}`} />
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                                        {reason.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                                        {reason.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
