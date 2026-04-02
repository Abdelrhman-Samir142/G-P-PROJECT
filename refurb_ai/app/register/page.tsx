'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { Leaf, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const { dict } = useLanguage();
    const { refreshUser } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        city: '',
        phone: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (formData.password !== formData.password2) {
            setError('كلمات المرور غير متطابقة');
            setLoading(false);
            return;
        }

        try {
            await authAPI.register(formData);
            // Successful registration - authAPI.register automatically sets tokens
            // Refresh the auth context so the user state is populated
            await refreshUser();
            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Registration error:', err);
            // Handle specific field errors if possible, simplified here
            setError(err.message || 'فشل إنشاء الحساب. تأكد من أن اسم المستخدم والبريد الإلكتروني غير مستخدمين من قبل.');
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
                className="w-full max-w-[600px] relative z-10"
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

                {/* Register Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="glass-surface p-8 sm:p-10 rounded-[var(--radius-2xl)] shadow-[var(--shadow-glow)] relative overflow-hidden border border-[var(--color-border)]/50"
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-surface)]/40 to-transparent pointer-events-none" />
                    
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative z-10 text-center mb-8"
                    >
                        <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-[var(--color-text-primary)] mb-2 tracking-[-0.02em]">إنشاء حساب جديد</h2>
                        <p className="text-[var(--color-text-secondary)] font-[400] text-[15px]">خطوة واحدة تفصلك عن تجربة فريدة</p>
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

                    <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* First Name */}
                            <div>
                                <label className="block text-[13px] font-[600] text-[var(--color-text-primary)] mb-2 ml-1">الاسم الأول</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="أحمد"
                                    className="w-full glass-surface border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all font-[500] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-xs)] text-[14px]"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2 ml-1">الاسم الأخير</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="حسن"
                                    className="w-full glass-surface border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all font-[500] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-xs)] text-[14px]"
                                />
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2 ml-1">اسم المستخدم</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="ahmed_hassan"
                                className="w-full glass-surface border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all font-[500] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-xs)] text-[14px]"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2 ml-1">البريد الإلكتروني</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@example.com"
                                className="w-full glass-surface border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all font-[500] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-xs)] text-[14px]"
                                required
                            />
                        </div>

                        {/* Password & Confirm */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2 ml-1">
                                    {dict.login?.password || 'كلمة المرور'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full glass-surface border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all font-[500] text-[var(--color-text-primary)] tracking-wider placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-xs)] text-[14px]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2 ml-1">تأكيد كلمة المرور</label>
                                <input
                                    type="password"
                                    name="password2"
                                    value={formData.password2}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full glass-surface border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all font-[500] text-[var(--color-text-primary)] tracking-wider placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-xs)] text-[14px]"
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        {/* City & Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2 ml-1">المدينة</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="القاهرة"
                                    className="w-full glass-surface border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all font-[500] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-xs)] text-[14px]"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-[var(--color-text-primary)] mb-2 ml-1">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="01xxxxxxxxx"
                                    className="w-full glass-surface border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-[var(--color-accent)]/10 transition-all font-[500] text-[var(--color-text-primary)] tracking-wider placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-xs)] text-[14px]"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                            whileTap={!loading ? { scale: 0.98 } : {}}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            className="w-full gradient-accent text-white py-4 rounded-[var(--radius-lg)] font-[700] shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-glow-lg)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8 transition-all duration-300"
                        >
                            {loading && <Loader2 className="animate-spin" size={20} strokeWidth={3} />}
                            {loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب جديد'}
                        </motion.button>
                    </form>

                    {/* Login Link */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-center mt-8 relative z-10"
                    >
                        <p className="text-[13px] font-[500] text-[var(--color-text-secondary)]">
                            لديك حساب بالفعل؟{' '}
                            <Link href="/login" className="text-[var(--color-primary)] hover:text-white font-[700] transition-colors underline decoration-2 underline-offset-4 decoration-[var(--color-primary)]/50 hover:decoration-[var(--color-primary)]">
                                {dict.login?.submit || 'تسجيل الدخول'}
                            </Link>
                        </p>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
