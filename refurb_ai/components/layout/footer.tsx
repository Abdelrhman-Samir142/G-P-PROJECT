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
            className="relative bg-[var(--color-bg)] py-20 mt-0 border-t border-[var(--color-border)] overflow-hidden"
        >
            {/* REDESIGN: Subtle footer glow */}
            <div className="absolute bottom-[-50%] left-[50%] -translate-x-1/2 w-[600px] h-[200px] bg-[var(--color-primary)]/10 rounded-t-full blur-[80px] pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center">
                    <motion.div variants={staggerItem}>
                        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-8 group">
                            <motion.span
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                className="font-[900] text-[2rem] tracking-[-0.03em] text-[var(--color-text-primary)]"
                            >
                                <span className="text-gradient">4</span>Sale
                            </motion.span>
                        </Link>
                    </motion.div>
                    <motion.div
                        variants={staggerItem}
                        className="w-8 h-[2px] gradient-accent rounded-full mx-auto mb-6 opacity-40"
                    />
                    <motion.p
                        variants={staggerItem}
                        className="text-[var(--color-text-muted)] text-[13px] font-[500] tracking-[0.08em] uppercase"
                    >
                        {dict.footer.rights}
                    </motion.p>
                </div>
            </div>
        </motion.footer>
    );
}
