'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { staggerContainer, staggerItem } from '@/lib/animations';

const faqs = [
    {
        question: 'كيف أبدأ البيع على 4Sale؟',
        answer: 'ببساطة، سجّل حساباً مجانياً، ثم اضغط على "أضف إعلان" وأدخل تفاصيل منتجك مع صور واضحة. يمكنك اختيار البيع المباشر أو عرضه كمزاد.',
    },
    {
        question: 'هل المحفظة الإلكترونية آمنة؟',
        answer: 'نعم، المحفظة الإلكترونية مؤمنة بالكامل بأحدث تقنيات التشفير. جميع المعاملات المالية محمية ومسجلة في سجل المعاملات الخاص بك.',
    },
    {
        question: 'كيف يعمل نظام المزادات؟',
        answer: 'يمكنك إنشاء مزاد لمنتجك بتحديد سعر البداية ومدة المزاد. المشترون يزايدون على المنتج، والفائز يحصل عليه عند انتهاء المزاد. المبلغ يُخصم تلقائياً من محفظة الفائز ويُضاف لمحفظة البائع.',
    },
    {
        question: 'هل يمكنني إرجاع المنتج بعد الشراء؟',
        answer: 'سياسة الإرجاع تعتمد على الاتفاق بين البائع والمشتري. ننصح دائماً بالتواصل مع البائع قبل الشراء ومراجعة تفاصيل المنتج جيداً. يمكنك أيضاً الاطلاع على تقييمات البائع لضمان الجودة.',
    },
    {
        question: 'كيف أشحن محفظتي الإلكترونية؟',
        answer: 'يمكنك شحن محفظتك بسهولة من صفحة "المحفظة" في حسابك. أدخل بيانات الدفع واختر المبلغ المطلوب. الرصيد يظهر فوراً بعد إتمام العملية.',
    },
    {
        question: 'ما هو نظام التقييم والموثوقية؟',
        answer: 'كل بائع ومشتري لديه درجة موثوقية تُحسب تلقائياً بناءً على عدد المعاملات الناجحة والتقييمات. كلما زاد تقييمك، زادت ثقة الآخرين بك وظهرت علامة "موثوق" على حسابك.',
    },
];

function FaqItem({ item, index }: { item: typeof faqs[0]; index: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
        >
            <div
                className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                        ? 'border-primary/30 shadow-lg shadow-primary/5'
                        : 'border-slate-100 dark:border-slate-700 hover:border-primary/20 shadow-sm'
                }`}
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-6 text-right gap-4"
                >
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{item.question}</span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex-shrink-0 p-1.5 rounded-full transition-colors ${isOpen ? 'bg-primary/10 text-primary' : 'text-slate-400'}`}
                    >
                        <ChevronDown size={20} />
                    </motion.div>
                </button>

                <AnimatePresence initial={false}>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <div className="px-6 pb-6 pt-0">
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-700 mb-4" />
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {item.answer}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

export function FAQ() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="max-w-3xl mx-auto relative">
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
                        الأسئلة الشائعة
                    </motion.span>
                    <motion.h2
                        variants={staggerItem}
                        className="text-3xl md:text-5xl font-black mb-4"
                    >
                        هل لديك سؤال؟
                    </motion.h2>
                    <motion.p
                        variants={staggerItem}
                        className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-lg"
                    >
                        إليك إجابات لأكثر الأسئلة شيوعاً
                    </motion.p>
                    <motion.div
                        variants={staggerItem}
                        className="w-16 h-1 bg-gradient-to-r from-primary to-green-400 rounded-full mx-auto mt-4"
                    />
                </motion.div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FaqItem key={index} item={faq} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
}
