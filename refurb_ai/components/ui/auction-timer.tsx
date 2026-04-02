'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuctionTimerProps {
    endTime: string;
}

export function AuctionTimer({ endTime }: AuctionTimerProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft('انتهى المزاد');
                setProgress(100);
                clearInterval(timer);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days} يوم ${hours} ساعة`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }

            // Calculate progress (assuming 7 days auction)
            const totalTime = 7 * 24 * 60 * 60 * 1000;
            const elapsed = totalTime - distance;
            setProgress((elapsed / totalTime) * 100);
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    return (
        <div className="relative overflow-hidden p-5 rounded-[var(--radius-2xl)] glass-surface border border-[var(--color-danger)]/30 shadow-[var(--shadow-sm)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-danger)]/10 to-transparent pointer-events-none" />
            
            <div className="relative flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[var(--color-danger)]/20 flex items-center justify-center border border-[var(--color-danger)]/50">
                    <Clock className="text-[var(--color-danger)] animate-pulse" size={16} />
                </div>
                <span className="font-[800] text-[13px] text-[var(--color-text-primary)]">المتبقي على انتهاء المزاد</span>
            </div>

            <div className="relative text-3xl font-[900] text-[var(--color-danger)] mb-4 tracking-wider" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                <span className="drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">{timeLeft}</span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-[var(--color-danger)] rounded-full shadow-[0_0_10px_var(--color-danger)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}
