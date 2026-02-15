'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
<<<<<<< HEAD
import { useAuth } from '@/components/providers/auth-provider';
import { Leaf, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
=======
import { Leaf, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883

export default function LoginPage() {
    const router = useRouter();
    const { dict } = useLanguage();
<<<<<<< HEAD
    const { login } = useAuth();
=======
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
<<<<<<< HEAD
            await login(username, password);
            // Successful login - redirect to homepage or dashboard
            // Check if there's a redirect query param
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect') || '/dashboard';
            router.push(redirectUrl);
            router.refresh();
=======
            await authAPI.login(username, password);
            // Successful login - redirect to dashboard
            router.push('/dashboard');
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'فشل تسجيل الدخول. تحقق من بيانات الاعتماد الخاصة بك.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-2 mb-8">
                    <div className="bg-primary p-3 rounded-xl text-white">
                        <Leaf size={28} />
                    </div>
                    <span className="text-2xl font-bold">
                        Refurb<span className="text-primary">AI</span>
                    </span>
                </Link>

                {/* Login Card */}
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">{dict.login.title}</h2>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
<<<<<<< HEAD
                                اسم المستخدم أو البريد الإلكتروني
=======
                                {dict.login.email || 'اسم المستخدم'}
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
<<<<<<< HEAD
                                placeholder="username or email"
=======
                                placeholder="username"
>>>>>>> 015db9240893bec0dddc862319a27d07dfebd883
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900 transition-all"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                {dict.login.password}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white dark:bg-slate-900 transition-all"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Forgot Password */}
                        <div className="text-left">
                            <button type="button" className="text-sm text-primary hover:text-primary-700 font-semibold">
                                نسيت كلمة المرور؟
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary-700 text-white py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={20} />}
                            {loading ? 'جار تسجيل الدخول...' : dict.login.submit}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 font-semibold">
                        {dict.login.noAccount}{' '}
                        <Link href="/register" className="text-primary hover:text-primary-700 font-bold">
                            {dict.login.createAccount || 'سجل حساب جديد'}
                        </Link>
                    </p>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary font-semibold">
                        ← العودة للرئيسية
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
