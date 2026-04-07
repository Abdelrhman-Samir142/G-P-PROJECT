'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface AdminStatsWidgetProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color: string;
    delay?: number;
}

/**
 * Animated counter component
 */
const AnimatedCounter: React.FC<{ from: number; to: number; duration?: number }> = ({
    from = 0,
    to,
    duration = 2,
}) => {
    const [count, setCount] = useState(from);

    useEffect(() => {
        let animationFrameId: number;
        let startTime: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

            const currentCount = Math.floor(from + (to - from) * progress);
            setCount(currentCount);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [from, to, duration]);

    return <>{count}</>;
};

export default function AdminStatsWidget({
    label,
    value,
    icon: Icon,
    color,
    delay = 0,
}: AdminStatsWidgetProps) {
    const isNumeric = typeof value === 'number';

    const containerVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                type: 'spring' as const,
                stiffness: 100,
            },
        },
    };

    const hoverVariants = {
        hover: {
            y: -10,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            whileHover={hoverVariants}
            className="group relative"
        >
            {/* Gradient background with blur */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-white/20 rounded-2xl backdrop-blur-xl border border-white/40 group-hover:border-white/60 transition-colors duration-300 shadow-lg" />

            {/* Animated gradient overlay */}
            <motion.div
                className={`absolute inset-0 rounded-2xl backdrop-blur-xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-all duration-300`}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.1 }}
            />

            {/* Content */}
            <div className="relative p-6 space-y-3">
                {/* Header with icon */}
                <div className="flex items-start justify-between">
                    <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + delay }}
                        className="text-gray-600 font-medium text-sm"
                    >
                        {label}
                    </motion.h3>
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3 + delay, type: 'spring' as const, stiffness: 200 }}
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}
                    >
                        <Icon className="w-5 h-5" />
                    </motion.div>
                </div>

                {/* Value with animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + delay }}
                >
                    <p className="text-4xl font-bold text-gray-900 tracking-tight">
                        {isNumeric ? <AnimatedCounter from={0} to={value} /> : value}
                    </p>
                </motion.div>

                {/* Trend indicator */}
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + delay }}
                    className="flex items-center gap-2 text-emerald-600 text-xs font-semibold"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h8m0 0v8m0-8L5.257 19.643M13 17v4"
                        />
                    </svg>
                    <span>+12% from last month</span>
                </motion.div>
            </div>

            {/* Animated border glow */}
            <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 blur-xl group-hover:opacity-20 transition-all duration-300 -z-10`}
                whileHover={{ scale: 1.1 }}
            />
        </motion.div>
    );
}
