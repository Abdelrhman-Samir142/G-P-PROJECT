'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

const testimonials = [
    {
        name: 'أحمد محمد',
        role: 'بائع إلكترونيات',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed',
        rating: 5,
        text: 'منصة رائعة جداً! بعت أجهزتي القديمة بسعر ممتاز والتعامل كان سلس وآمن. المحفظة الإلكترونية سهّلت كل شيء.',
    },
    {
        name: 'فاطمة علي',
        role: 'مشترية',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatma',
        rating: 5,
        text: 'لقيت كل اللي كنت بدور عليه! التصنيف الذكي والبحث المتقدم ساعدني ألاقي المنتجات بسرعة. أنصح الجميع بالتجربة.',
    },
    {
        name: 'محمود سالم',
        role: 'تاجر أثاث',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mahmoud',
        rating: 4,
        text: 'كمنصة بيع وشراء أونلاين، 4Sale غيّرت شكل التجارة بالنسبة لي. نظام التقييمات بيدي ثقة كبيرة للعملاء.',
    },
    {
        name: 'سارة أحمد',
        role: 'مشترية',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sara',
        rating: 5,
        text: 'تجربتي مع المزادات كانت ممتعة جداً! قدرت أشتري عربية بسعر أقل من السوق بكتير. شكراً 4Sale!',
    },
    {
        name: 'خالد يوسف',
        role: 'بائع خردة',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=khaled',
        rating: 5,
        text: 'أفضل منصة لبيع الخردة والمعادن. التسعير الذكي بيساعدني أحدد سعر عادل والمشترين بيوصلوني بسرعة.',
    },
    {
        name: 'نورا حسن',
        role: 'مشترية',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noura',
        rating: 4,
        text: 'المراسلة الفورية مع البائع مريحة وسهلة، وحاسة إني محمية بنظام الحماية المتقدم. تجربة ممتازة!',
    },
];

export function Testimonials() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
            <div className="absolute top-1/2 left-0 w-60 h-60 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
            <div className="absolute top-1/2 right-0 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />

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
                        آراء العملاء
                    </motion.span>
                    <motion.h2
                        variants={staggerItem}
                        className="text-3xl md:text-5xl font-black mb-4"
                    >
                        ماذا يقول عملاؤنا؟
                    </motion.h2>
                    <motion.p
                        variants={staggerItem}
                        className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-lg"
                    >
                        آلاف المستخدمين يثقون بنا يومياً
                    </motion.p>
                    <motion.div
                        variants={staggerItem}
                        className="w-16 h-1 bg-gradient-to-r from-primary to-green-400 rounded-full mx-auto mt-4"
                    />
                </motion.div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ y: -6, transition: { duration: 0.25 } }}
                            className="group"
                        >
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-7 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col relative">
                                {/* Quote icon */}
                                <Quote className="absolute top-5 left-5 w-8 h-8 text-primary/10 dark:text-primary/5" />

                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={16}
                                            className={i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-700'}
                                        />
                                    ))}
                                </div>

                                {/* Text */}
                                <p className="text-slate-600 dark:text-slate-300 mb-6 flex-1 text-sm leading-relaxed">
                                    "{testimonial.text}"
                                </p>

                                {/* User info */}
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                                    <img
                                        src={testimonial.avatar}
                                        alt={testimonial.name}
                                        className="w-11 h-11 rounded-full border-2 border-primary/20"
                                    />
                                    <div>
                                        <p className="font-bold text-sm">{testimonial.name}</p>
                                        <p className="text-xs text-slate-400">{testimonial.role}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
