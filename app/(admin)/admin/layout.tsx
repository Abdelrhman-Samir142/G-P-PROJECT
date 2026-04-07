'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    LogOut,
    Menu,
    X,
    Settings,
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const router = useRouter();

    const handleLogout = () => {
        // Clear auth tokens
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        router.push('/');
    };

    const sidebarItems = [
        { label: 'Dashboard', icon: LayoutDashboard, href: '/admin', id: 'dashboard' },
        { label: 'User Management', icon: Users, href: '/admin/users', id: 'users' },
        { label: 'Moderation Queue', icon: ShoppingBag, href: '/admin/moderation', id: 'moderation' },
        { label: 'Settings', icon: Settings, href: '/admin/settings', id: 'settings' },
    ];

    const sidebarVariants = {
        open: { x: 0, opacity: 1 },
        closed: { x: -280, opacity: 0 },
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
            {/* Background gradient orbs - Glassmorphic effect */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-green-200/20 to-emerald-200/10 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-cyan-200/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-cyan-200/10 to-green-200/10 rounded-full blur-3xl" />
            </div>

            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        variants={sidebarVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        transition={{ type: 'spring', stiffness: 300, damping: 40 }}
                        className="w-64 bg-white/40 backdrop-blur-2xl border-r border-white/30 shadow-lg flex flex-col relative z-20"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/20">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                                    A
                                </div>
                                <div>
                                    <h1 className="font-bold text-lg text-gray-900">Admin</h1>
                                    <p className="text-xs text-gray-600">Dashboard</p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 p-4 space-y-2">
                            {sidebarItems.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                >
                                    <Link href={item.href}>
                                        <motion.div
                                            whileHover={{
                                                x: 8,
                                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                            }}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:text-emerald-600 transition-colors"
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            ))}
                        </nav>

                        {/* Logout */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-4 border-t border-white/20"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50/50 hover:bg-red-100/50 text-red-600 font-medium transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </motion.button>
                        </motion.div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white/30 backdrop-blur-xl border-b border-white/30 shadow-sm px-6 py-4 flex items-center justify-between relative z-10">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="text-gray-700 hover:text-emerald-600 transition-colors"
                    >
                        {sidebarOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </motion.button>

                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                    >
                        RefurbAI Admin Panel
                    </motion.h1>

                    <div className="w-10" /> {/* Spacer for alignment */}
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto relative z-0">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="p-8"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Close sidebar on mobile when clicking outside */}
            {sidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
                />
            )}
        </div>
    );
}
