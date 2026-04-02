'use client';

import { useLanguage } from '@/components/providers/language-provider';
import { motion } from 'framer-motion';
import { Laptop, Sofa, Recycle, Car, Building2, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { staggerContainer, staggerItem } from '@/lib/animations';

const cardVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.45,
            delay: i * 0.08,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
    }),
};

export function Categories() {
    const { dict } = useLanguage();
    const router = useRouter();
    const { user } = useAuth();

    const categories = [
        { id: 'scrap_metals', name: 'خردة ومعادن', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
        { id: 'electronics', name: 'إلكترونيات وأجهزة', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80' },
        { id: 'furniture', name: 'أثاث وديكور', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80' },
        { id: 'cars', name: 'سيارات للبيع', image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&q=80' },
        { id: 'real_estate', name: 'عقارات', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80' },
        { id: 'other', name: 'أخرى', image: 'https://images.unsplash.com/photo-1523575166741-7aa885f65f76?w=400&q=80' },
    ];

    return (
        <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[var(--color-bg)] overflow-hidden">
            {/* Ambient Aurora Glow */}
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[var(--color-primary)]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[var(--color-accent)]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div
                    className="text-center mb-20"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                >
                    <motion.h2
                        variants={staggerItem}
                        className="text-[2.2rem] md:text-[3rem] font-[900] mb-6 tracking-[-0.03em] text-[var(--color-text-primary)]"
                    >
                        {dict.categories.title}
                    </motion.h2>
                    <motion.p
                        variants={staggerItem}
                        className="text-[var(--color-text-secondary)] text-lg font-[400] tracking-[0.005em]"
                    >
                        {dict.categories.subtitle}
                    </motion.p>
                    <motion.div
                        variants={staggerItem}
                        className="w-12 h-[3px] gradient-accent rounded-full mx-auto mt-6 shadow-[0_0_12px_var(--color-accent-glow)]"
                    />
                </motion.div>

                {/* Category Cards */}
                <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            custom={index}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            className="w-[calc(50%-12px)] sm:w-48 lg:w-56"
                        >
                            <motion.div
                                onClick={() => {
                                    const targetUrl = `/dashboard?category=${category.id}`;
                                    if (user) router.push(targetUrl);
                                    else router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
                                }}
                                whileHover={{ y: -6 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="group relative w-full sm:w-[200px] h-[240px] rounded-[20px] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-glow)] border border-[var(--color-border)]/50 cursor-pointer overflow-hidden flex flex-col bg-[var(--color-surface-elevated)]"
                            >
                                {/* Top 65% Image */}
                                <div className="h-[65%] w-full relative overflow-hidden">
                                    <img 
                                        src={category.image} 
                                        alt={category.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {/* Dark gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
                                </div>
                                
                                {/* Bottom 35% Label */}
                                <div className="h-[35%] w-full flex items-center justify-center bg-[#0d0d12] relative z-10 border-t border-[var(--color-border)]/50">
                                    <h3 className="font-[800] text-white text-[1.05rem] tracking-wide group-hover:text-[var(--color-accent)] transition-colors duration-300">
                                        {category.name}
                                    </h3>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
