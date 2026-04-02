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
            className="inline-block w-[2px] h-[1.1em] bg-[var(--color-accent)] align-middle ml-1 rounded-full"
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

    // Dark Premium particles (Oranges and Golds)
    const particles = [
        { x: '8%', y: '15%', size: 8, color: 'rgba(255, 107, 53, 0.4)', delay: 0 },
        { x: '90%', y: '10%', size: 16, color: 'rgba(255, 215, 0, 0.2)', delay: 0.7 },
        { x: '75%', y: '70%', size: 24, color: 'rgba(255, 107, 53, 0.15)', delay: 1.1 },
        { x: '15%', y: '80%', size: 12, color: 'rgba(255, 215, 0, 0.3)', delay: 0.4 },
        { x: '50%', y: '5%', size: 10, color: 'rgba(255, 107, 53, 0.25)', delay: 1.6 },
        { x: '35%', y: '90%', size: 14, color: 'rgba(255, 215, 0, 0.2)', delay: 2.0 },
    ];

    const textSide = {
        hidden: { opacity: 0, x: isRtl ? 40 : -40 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        },
    };

    const imageSide = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                delay: 0.15,
            },
        },
    };

    return (
        <section className="relative min-h-[92vh] flex items-center pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[var(--color-bg)]">
            {/* Absolute Background Aurora Gradients */}
            <div className="absolute top-0 inset-x-0 h-full w-full overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[var(--color-primary)]/20 rounded-full blur-[100px] mix-blend-screen"
                    animate={{ x: [0, 30, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] bg-[var(--color-accent)]/10 rounded-full blur-[100px] mix-blend-screen"
                    animate={{ x: [0, -30, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                />
            </div>

            {/* Floating Particles */}
            {particles.map((p, i) => (
                <Particle key={i} {...p} />
            ))}

            <div className="max-w-7xl mx-auto relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Text Content */}
                    <motion.div variants={textSide} initial="hidden" animate="visible" className="max-w-2xl">
                        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                            {/* Glassmorphic Badge */}
                            <motion.div
                                variants={staggerItem}
                                className="inline-flex items-center gap-2.5 glass-surface px-5 py-2.5 rounded-[var(--radius-pill)] text-[13px] font-[600] mb-10 text-[var(--color-accent)] tracking-[0.02em] border-[var(--color-border-active)] shadow-[0_0_20px_var(--color-accent)]/20"
                            >
                                <motion.span
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                    className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_12px_var(--color-primary)] relative"
                                >
                                    <motion.span 
                                        className="absolute inset-0 rounded-full border border-[var(--color-primary)]"
                                        animate={{ scale: [1, 2], opacity: [1, 0] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                                    />
                                </motion.span>
                                مرحباً بك في 4Sale
                            </motion.div>

                            {/* Heading */}
                            <motion.h1
                                variants={staggerItem}
                                className="text-[3.2rem] md:text-[4rem] lg:text-[5rem] font-[900] mb-8 leading-[1.05] tracking-[-0.035em] text-[var(--color-text-primary)]"
                            >
                                <span>
                                    {titleText}
                                    {!titleDone && <BlinkCursor visible={true} />}
                                </span>
                                <br />
                                <span className="text-gradient leading-normal">
                                    {titleDone && highlightText}
                                    {titleDone && !highlightDone && <BlinkCursor visible={true} />}
                                </span>
                            </motion.h1>

                            {/* Description */}
                            <motion.p
                                variants={staggerItem}
                                initial={{ opacity: 0, y: 15 }}
                                animate={highlightDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                className="text-[var(--color-text-secondary)] mb-12 text-lg md:text-xl leading-[1.7] md:pr-12 font-[400] tracking-[0.005em]"
                            >
                                {dict.hero.description}
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={highlightDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                                transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                className="flex flex-col sm:flex-row gap-5"
                            >
                                <Link href={user ? '/dashboard' : '/login?redirect=/dashboard'}>
                                    <motion.button
                                        whileHover={{ scale: 1.03, y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full sm:w-auto relative group overflow-hidden gradient-primary text-white px-9 py-4 rounded-[var(--radius-xl)] font-[700] shadow-[var(--shadow-glow)] flex items-center justify-center gap-3 transition-all duration-400 border border-white/10"
                                    >
                                        <div className="absolute inset-0 bg-[var(--color-accent)]/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out rounded-[1.25rem] pointer-events-none" />
                                        <span className="relative z-10 text-lg tracking-wide">{dict.hero.browseProducts}</span>
                                        <motion.span
                                            className={`relative z-10 ${isRtl ? 'rotate-180' : ''}`}
                                            whileHover={{ x: isRtl ? -6 : 6 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        >
                                            <ArrowRight size={22} strokeWidth={2.5} />
                                        </motion.span>
                                    </motion.button>
                                </Link>

                                <Link href={user ? '/sell' : '/login?redirect=/sell'}>
                                    <motion.button
                                        whileHover={{ scale: 1.03, y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="w-full sm:w-auto glass-surface text-[var(--color-text-primary)] px-9 py-4 rounded-[var(--radius-xl)] font-[700] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:text-[var(--color-accent)] transition-all duration-400 text-lg tracking-[0.01em] flex items-center justify-center"
                                    >
                                        {dict.hero.addListing}
                                    </motion.button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Hero Image / Abstract Visual */}
                    <motion.div variants={imageSide} initial="hidden" animate="visible" className="relative hidden lg:block">
                        <div className="relative z-10 p-3 glass-surface rounded-[var(--radius-2xl)] shadow-[var(--shadow-lg)] border-[var(--color-border)]">
                            <motion.div
                                className="relative rounded-[1.75rem] overflow-hidden bg-white/5 aspect-square sm:aspect-[4/3] flex items-center justify-center border border-white/5"
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                            >
                                <img src="/hero-bg.jpg" alt="4Sale marketplace" className="w-full h-full object-cover rounded-[1.75rem] opacity-80 mix-blend-luminosity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-transparent to-transparent" />
                            </motion.div>
                        </div>

                        {/* Extra Decorative floating blobs near image */}
                        <motion.div
                            className="absolute -top-10 -right-10 w-48 h-48 bg-[var(--color-primary)]/20 rounded-full blur-[60px] mix-blend-screen z-0"
                            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5], rotate: [0, 90, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                            className="absolute -bottom-10 -left-10 w-56 h-56 bg-[var(--color-accent)]/15 rounded-full blur-[70px] mix-blend-screen z-0"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4], rotate: [0, -90, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
