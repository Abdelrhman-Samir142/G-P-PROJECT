'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';
import { useState, useEffect, useRef } from 'react';

// ─── Typewriter Hook ────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 45, startDelay = 0) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        let i = 0;
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                i++;
                setDisplayed(text.slice(0, i));
                if (i >= text.length) {
                    clearInterval(interval);
                    setDone(true);
                }
            }, speed);
            return () => clearInterval(interval);
        }, startDelay);
        return () => clearTimeout(timeout);
    }, [text, speed, startDelay]);

    return { displayed, done };
}

// ─── Cursor Blink ────────────────────────────────────────────────────────────
function BlinkCursor({ visible }: { visible: boolean }) {
    return (
        <motion.span
            className="inline-block w-[3px] h-[1em] bg-primary align-middle ml-1 rounded-sm"
            animate={visible ? { opacity: [1, 0, 1] } : { opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
    );
}

// ─── Floating Particle ────────────────────────────────────────────────────────
function Particle({ x, y, size, color, delay }: { x: string; y: string; size: number; color: string; delay: number }) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{ left: x, top: y, width: size, height: size, background: color }}
            animate={{
                y: [0, -18, 0],
                opacity: [0.4, 0.9, 0.4],
                scale: [1, 1.2, 1],
            }}
            transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay,
            }}
        />
    );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
export function Hero() {
    const { dict, isRtl } = useLanguage();
    const { user } = useAuth();

    // Typewriter: first type the title, then after it's done type the highlight
    const { displayed: titleText, done: titleDone } = useTypewriter(dict.hero.title, 50, 700);
    const { displayed: highlightText, done: highlightDone } = useTypewriter(
        titleDone ? dict.hero.titleHighlight : '',
        55,
        titleDone ? 120 : 999999
    );

    const particles = [
        { x: '8%', y: '15%', size: 8, color: 'rgba(22,163,74,0.5)', delay: 0 },
        { x: '90%', y: '10%', size: 6, color: 'rgba(52,211,153,0.4)', delay: 0.7 },
        { x: '75%', y: '70%', size: 10, color: 'rgba(22,163,74,0.3)', delay: 1.1 },
        { x: '15%', y: '80%', size: 7, color: 'rgba(74,222,128,0.4)', delay: 0.4 },
        { x: '50%', y: '5%', size: 5, color: 'rgba(22,163,74,0.35)', delay: 1.6 },
        { x: '35%', y: '90%', size: 9, color: 'rgba(52,211,153,0.3)', delay: 2.0 },
    ];

    const textSide = {
        hidden: { opacity: 0, x: isRtl ? 50 : -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
        },
    };

    const imageSide = {
        hidden: { opacity: 0, x: isRtl ? -50 : 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.65,
                ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
                delay: 0.1,
            },
        },
    };

    return (
        <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
            {/* Floating Particles */}
            {particles.map((p, i) => (
                <Particle key={i} {...p} />
            ))}

            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
                    {/* Text Content */}
                    <motion.div variants={textSide} initial="hidden" animate="visible">
                        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                            {/* Badge */}
                            <motion.div
                                variants={staggerItem}
                                className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-6 border border-primary/20"
                            >
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                    className="w-2 h-2 rounded-full bg-primary"
                                />
                                مرحباً بك في 4Sale
                            </motion.div>

                            {/* Heading with Typewriter */}
                            <motion.h1
                                variants={staggerItem}
                                className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight min-h-[1.2em]"
                            >
                                {/* Line 1: title typed */}
                                <span>
                                    {titleText}
                                    {!titleDone && <BlinkCursor visible={true} />}
                                </span>

                                <br />

                                {/* Line 2: highlight typed after first line done */}
                                <span className="bg-gradient-to-r from-primary to-green-400 bg-clip-text text-transparent">
                                    {titleDone && highlightText}
                                    {titleDone && !highlightDone && <BlinkCursor visible={true} />}
                                </span>
                            </motion.h1>

                            {/* Description — fades in only after both lines typed */}
                            <motion.p
                                variants={staggerItem}
                                initial={{ opacity: 0, y: 8 }}
                                animate={highlightDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                                transition={{ duration: 0.5, delay: 0.15 }}
                                className="text-slate-600 dark:text-slate-400 mb-8 text-lg leading-relaxed"
                            >
                                {dict.hero.description}
                            </motion.p>

                            {/* CTA Buttons — appear after description */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={highlightDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <Link href={user ? '/dashboard' : '/login?redirect=/dashboard'}>
                                    <motion.button
                                        whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(22,163,74,0.35)' }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                                        className="w-full sm:w-auto bg-primary hover:bg-primary-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2 group"
                                    >
                                        {dict.hero.browseProducts}
                                        <motion.span
                                            className={isRtl ? 'rotate-180' : ''}
                                            whileHover={{ x: isRtl ? -4 : 4 }}
                                            transition={{ type: 'spring', stiffness: 400 }}
                                        >
                                            <ArrowRight size={20} />
                                        </motion.span>
                                    </motion.button>
                                </Link>

                                <Link href={user ? '/sell' : '/login?redirect=/sell'}>
                                    <motion.button
                                        whileHover={{ scale: 1.03, borderColor: 'var(--color-primary, #16a34a)' }}
                                        whileTap={{ scale: 0.97 }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                                        className="w-full sm:w-auto border-2 border-slate-300 dark:border-slate-700 hover:border-primary dark:hover:border-primary px-8 py-4 rounded-xl font-bold transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                    >
                                        {dict.hero.addListing}
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div variants={imageSide} initial="hidden" animate="visible" className="relative">
                        <motion.div
                            className="relative rounded-3xl overflow-hidden shadow-2xl"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                        >
                            <img src="/hero-bg.jpg" alt="4Sale marketplace" className="w-full h-auto" />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </motion.div>

                        {/* Decorative floating blobs */}
                        <motion.div
                            className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="absolute -bottom-6 -left-6 w-28 h-28 bg-green-400/10 rounded-full blur-xl"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
