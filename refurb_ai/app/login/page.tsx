'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { Leaf, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/lib/animations';

export default function LoginPage() {
    const router = useRouter();
    const { dict } = useLanguage();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login(username, password);
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect') || '/dashboard';
            router.push(redirectUrl);
            router.refresh();
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'فشل تسجيل الدخول. تحقق من بيانات الاعتماد الخاصة بك.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-[var(--color-bg)] overflow-hidden relative">
            {/* Ambient Aurora Background */}
            <motion.div
                className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-[var(--color-primary)]/15 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.8, 0.6] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[var(--color-accent)]/15 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px] relative z-10"
            >
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                >
                    <Link href="/" className="flex items-center justify-center gap-3 mb-10 group">
                        <motion.div
                            whileHover={{ scale: 1.1, rotate: 10 }}
                            transition={{ type: 'spring', stiffness: 360, damping: 18 }}
                            className="gradient-accent p-3 rounded-[var(--radius-lg)] text-white shadow-[var(--shadow-glow)] group-hover:shadow-[var(--shadow-glow-lg)] transition-all duration-300"
                        >
                            <Leaf size={28} strokeWidth={2.5} />
                        </motion.div>
                        <span className="text-[1.8rem] font-[900] tracking-[-0.03em] text-[var(--color-text-primary)]">
                            Refurb<span className="text-gradient">AI</span>
                        </span>
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="glass-surface p-10 rounded-[var(--radius-2xl)] shadow-[var(--shadow-glow)] relative overflow-hidden border border-[var(--color-border)]/50"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface)]/40 to-transparent pointer-events-none" />
                    
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative z-10 text-center mb-8"
                    >
                        <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-[var(--color-text-primary)] mb-2 tracking-[-0.02em]">
                            {dict.login.title || 'مرحباً بعودتك!'}
                        </h2>
                        <p className="text-[var(--color-text-secondary)] font-[400] text-[15px]">سجل دخولك لمتابعة الاستكشاف</p>
                    </motion.div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="mb-6 overflow-hidden relative z-10"
                            >
                                <div className="p-4 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-[var(--radius-lg)] flex items-start gap-3 shadow-[var(--shadow-glow)]">
                                    <AlertCircle size={20} className="text-[var(--color-danger)] shrink-0 mt-0.5" />
                                    <p className="text-[var(--color-danger)] text-[13px] font-[600] leading-relaxed">{error}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-5 relative z-10"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {/* Username */}
                        <motion.div variants={staggerItem}>
                            <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-2 ml-1">
                                اسم المستخدم أو البريد الإلكتروني
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="example@email.com"
                                className="w-full glass-surface border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all font-[500] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-xs)] text-[14px]"
                                required
                                disabled={loading}
                            />
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={staggerItem}>
                            <div className="flex justify-between items-center mb-2 px-1">
                                <label className="block text-[13px] font-[600] text-[var(--color-text-primary)]">
                                    {dict.login.password}
                                </label>
                                <button type="button" className="text-[12px] text-[var(--color-primary)] hover:text-white font-[600] transition-colors">
                                    نسيت الكلمة؟
                                </button>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full glass-surface border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all font-[500] text-[var(--color-text-primary)] tracking-wider placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-xs)] text-[14px]"
                                required
                                disabled={loading}
                            />
                        </motion.div>

                        {/* Submit */}
                        <motion.div variants={staggerItem} className="pt-2">
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                                whileTap={!loading ? { scale: 0.98 } : {}}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className="w-full gradient-accent text-white py-4 rounded-[var(--radius-lg)] font-[700] shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300"
                            >
                                {loading && <Loader2 className="animate-spin" size={20} strokeWidth={3} />}
                                {loading ? 'جاري الدخول...' : dict.login.submit}
                            </motion.button>
                        </motion.div>
                    </motion.form>

                    {/* Sign Up Link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center mt-8 relative z-10"
                    >
                        <p className="text-[13px] font-[500] text-[var(--color-text-secondary)]">
                            {dict.login.noAccount}{' '}
                            <Link href="/register" className="text-[var(--color-primary)] hover:text-white font-[700] transition-colors underline decoration-2 underline-offset-4 decoration-[var(--color-primary)]/50 hover:decoration-[var(--color-primary)]">
                                {dict.login.createAccount || 'سجل حساب جديد'}
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>

                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center mt-8"
                >
                    <Link href="/" className="inline-flex items-center gap-1 text-[13px] font-[600] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-all duration-300 glass-surface px-5 py-2.5 rounded-[var(--radius-pill)] shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]">
                        <span className="text-lg leading-none mb-0.5">←</span> العودة للرئيسية
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
