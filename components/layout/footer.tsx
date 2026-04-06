'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, staggerItem } from '@/lib/animations';

export function Footer() {
    const { dict } = useLanguage();

    return (
        <motion.footer
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="bg-slate-50 dark:bg-slate-800 py-10 mt-20 border-t border-slate-200 dark:border-slate-700"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <motion.div variants={staggerItem}>
                        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4 group">
                            <motion.span
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                className="font-bold text-xl"
                            >
                                <span className="text-primary">4</span>Sale
                            </motion.span>
                        </Link>
                    </motion.div>
                    <motion.p
                        variants={staggerItem}
                        className="text-slate-500 dark:text-slate-400 text-sm"
                    >
                        {dict.footer.rights}
                    </motion.p>
                </div>
            </div>
        </motion.footer>
    );
}
