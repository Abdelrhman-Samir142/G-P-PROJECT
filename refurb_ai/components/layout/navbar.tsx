'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/components/providers/language-provider';
import { Moon, Sun, Menu, X, LogOut, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, profilesAPI, chatAPI } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

export function Navbar() {
    const { theme, setTheme } = useTheme();
    const { dict, toggleLanguage, isRtl } = useLanguage();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [navAvatar, setNavAvatar] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem('refurbai_avatar');
        if (saved) setNavAvatar(saved);

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'refurbai_avatar') setNavAvatar(e.newValue);
        };
        window.addEventListener('storage', handleStorage);
        
        const handleCustomUpdate = () => {
            setNavAvatar(localStorage.getItem('refurbai_avatar'));
        };
        window.addEventListener('avatarUpdated', handleCustomUpdate);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('avatarUpdated', handleCustomUpdate);
        };
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                try {
                    const profileData = await profilesAPI.getMe();
                    setUser({
                        ...profileData.user,
                        profile: profileData
                    });
                } catch (e) {
                    const userData = await authAPI.getCurrentUser();
                    setUser(userData);
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();

        const fetchUnread = async () => {
            try {
                const data = await chatAPI.getUnreadCount();
                setUnreadCount(data.unread_count);
            } catch (e) { }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        authAPI.logout();
        setUser(null);
        router.push('/');
    };

    const isLoggedIn = !!user;

    const navLinks = [
        { name: dict.nav.home, path: '/' },
        { name: dict.nav.shop, path: isLoggedIn ? '/dashboard' : '/login?redirect=/dashboard' },
        { name: dict.nav.auctions, path: isLoggedIn ? '/auctions' : '/login?redirect=/auctions' },
        ...(isLoggedIn ? [{ name: 'الرسائل', path: '/messages', badge: unreadCount }] : [])
    ];

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`fixed top-4 left-1/2 z-50 w-[calc(100%-32px)] md:w-max min-w-[min(700px,100%)] h-[52px] rounded-full px-3 flex items-center justify-between transition-all duration-300
                bg-white/75 dark:bg-[#0f0f14]/80 backdrop-blur-[24px] saturate-200
                border border-white/25 dark:border-white/10
                ${scrolled 
                    ? 'shadow-[0_12px_40px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.15)]' 
                    : 'shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]'}
            `}
        >
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-1 group pl-2 md:pl-0 rtl:pr-2 md:rtl:pr-0">
                <Sparkles size={16} className="text-[var(--color-primary)] group-hover:shadow-[var(--shadow-glow)] transition-all duration-300 rounded-full" strokeWidth={2.5} />
                <span className="text-[18px] font-bold tracking-tight text-[var(--color-text-primary)] transition-all duration-300 drop-shadow-sm group-hover:drop-shadow-md">
                    <span className="text-[var(--color-primary)]">4</span>Sale
                </span>
            </Link>

            {/* NAV LINKS (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
                {navLinks.map((link) => {
                    const isActive = pathname === link.path;
                    return (
                        <Link
                            key={link.path}
                            href={link.path}
                            className={`relative text-[14px] font-[500] px-[14px] py-[6px] rounded-full flex items-center gap-1.5 transition-all duration-250
                                ${isActive 
                                    ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_12px_var(--color-primary)]' 
                                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]'}
                            `}
                        >
                            {link.name}
                            {link.badge !== undefined && link.badge > 0 && (
                                <span className={`text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1
                                    ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-primary)] text-white'}
                                `}>
                                    {link.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* DIVIDER */}
            <div className="hidden md:block w-px h-[20px] bg-black/15 dark:bg-white/15"></div>

            {/* ACTIONS RIGHT */}
            <div className="flex items-center gap-2">
                {/* Language Toggle */}
                <button
                    onClick={toggleLanguage}
                    className="w-[34px] h-[34px] flex items-center justify-center rounded-[10px] bg-white/10 border border-white/15 backdrop-blur-[8px] text-[var(--color-text-primary)] active:scale-[0.92] hover:scale-[1.08] hover:bg-[var(--color-primary)]/15 hover:border-[var(--color-primary)]/40 transition-all duration-250 cursor-pointer text-[13px] font-[700]"
                    aria-label="Toggle Language"
                >
                    {isRtl ? 'EN' : 'ع'}
                </button>

                {/* Theme Toggle */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-[34px] h-[34px] flex items-center justify-center rounded-[10px] bg-white/10 border border-white/15 backdrop-blur-[8px] text-[var(--color-text-primary)] active:scale-[0.92] hover:scale-[1.08] hover:bg-[var(--color-primary)]/15 hover:border-[var(--color-primary)]/40 transition-all duration-250 cursor-pointer"
                    aria-label="Toggle Theme"
                >
                    {theme === 'dark' ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
                </button>

                {!loading && (
                    <>
                        {isLoggedIn ? (
                            <div className="hidden md:flex items-center gap-2">
                                {/* User Pill Button */}
                                <Link href="/profile">
                                    <div className={`flex items-center h-[34px] bg-[var(--color-primary)]/12 border border-[var(--color-primary)]/25 rounded-full ${isRtl ? 'pr-1 pl-2.5' : 'pl-1 pr-2.5'} cursor-pointer transition-all duration-200 hover:border-[var(--color-primary)] hover:shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.3)] group select-none`}>
                                        <div className={`w-[28px] h-[28px] flex-shrink-0 rounded-full overflow-hidden ${isRtl ? 'ml-2' : 'mr-2'} bg-white/5`}>
                                            {navAvatar || user.profile?.avatar ? (
                                                <img
                                                    src={navAvatar || user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                                    alt={user.first_name || 'User'}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[var(--color-primary)]">
                                                    <User size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[13px] font-[600] text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1 max-w-[80px]">
                                            {user.first_name || user.username?.split('@')[0]}
                                        </span>
                                    </div>
                                </Link>

                                {/* Logout Button */}
                                <div className="relative group/logout flex items-center">
                                    <button
                                        onClick={handleLogout}
                                        className="w-[34px] h-[34px] flex items-center justify-center rounded-full text-[var(--color-text-muted)] bg-transparent hover:text-[#ef4444] hover:bg-[#ef4444]/10 active:scale-[0.92] hover:scale-[1.05] transition-all duration-200"
                                    >
                                        <LogOut size={16} strokeWidth={2.5} />
                                    </button>
                                    <div className="absolute top-10 w-max right-1/2 translate-x-1/2 opacity-0 group-hover/logout:opacity-100 bg-[#ef4444] text-white text-[11px] font-bold py-1 px-2.5 rounded-lg shadow-lg transition-opacity pointer-events-none">
                                        {isRtl ? "خروج" : "Logout"}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/login" className="text-[13px] font-[600] px-3 py-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                    {dict.nav.login}
                                </Link>
                                <Link href="/register">
                                    <button className="bg-[var(--color-primary)] text-white px-4 py-1.5 rounded-full text-[13px] font-[600] hover:shadow-[0_2px_12px_var(--color-primary)] hover:-translate-y-[1px] active:scale-95 transition-all">
                                        {dict.nav.register}
                                    </button>
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {/* Mobile Hamburger */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden w-[34px] h-[34px] flex items-center justify-center rounded-[10px] bg-white/10 border border-white/15 backdrop-blur-[8px] text-[var(--color-text-primary)] active:scale-[0.92] hover:scale-105 transition-all duration-200 ml-1"
                >
                    {mobileMenuOpen ? <X size={18} strokeWidth={2.5} /> : <Menu size={18} strokeWidth={2.5} />}
                </button>
            </div>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: -10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-[60px] left-0 w-full rounded-[20px] bg-white/80 dark:bg-[#0f0f14]/85 backdrop-blur-[24px] saturate-200 border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden md:hidden z-50 p-3 flex flex-col gap-2"
                    >
                        {navLinks.map((link) => {
                            const isActive = pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    href={link.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`h-[48px] flex items-center px-4 rounded-xl text-[15px] font-[600] transition-all
                                        ${isActive ? 'bg-[var(--color-primary)] text-white shadow-[0_2px_12px_var(--color-primary)]' : 'text-[var(--color-text-secondary)] bg-white/40 dark:bg-black/20 hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]'}
                                    `}
                                >
                                    {link.name}
                                    {link.badge !== undefined && link.badge > 0 && (
                                        <span className={`ml-auto mr-auto text-[11px] font-bold rounded-full px-2 py-0.5 ${isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-primary)] text-white'}`}>
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        {!loading && (
                            <div className="mt-2 flex flex-col gap-2">
                                {!isLoggedIn ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="h-[44px] flex items-center justify-center rounded-xl font-[600] text-[var(--color-text-primary)] bg-white/30 dark:bg-black/30 border border-white/20">
                                            {dict.nav.login}
                                        </Link>
                                        <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="h-[44px] flex items-center justify-center rounded-xl font-[600] text-white bg-[var(--color-primary)] shadow-md">
                                            {dict.nav.register}
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="h-[52px] flex items-center px-4 rounded-xl bg-white/30 dark:bg-black/30 border border-white/20 gap-3 group">
                                            <div className="w-[32px] h-[32px] rounded-full overflow-hidden bg-white/10">
                                                <img src={navAvatar || user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Avatar" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-[600] text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">{user.username}</span>
                                        </Link>
                                        <button
                                            onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                                            className="h-[44px] w-full flex items-center justify-center gap-2 rounded-xl font-[600] text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                                        >
                                            <LogOut size={18} strokeWidth={2.5} />
                                            {isRtl ? 'تسجيل الخروج' : 'Logout'}
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
