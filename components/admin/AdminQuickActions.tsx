'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, ShoppingCart, AlertTriangle, Send } from 'lucide-react';
import Link from 'next/link';

interface ActionButton {
    label: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: string;
}

export default function AdminQuickActions() {
    const actions: ActionButton[] = [
        {
            label: 'User Management',
            description: 'View & manage users',
            icon: <UserPlus className="w-5 h-5" />,
            href: '/admin/users',
            color: 'from-blue-400 to-blue-600',
        },
        {
            label: 'Approve Products',
            description: 'Review pending listings',
            icon: <ShoppingCart className="w-5 h-5" />,
            href: '/admin/moderation',
            color: 'from-emerald-400 to-emerald-600',
        },
        {
            label: 'Suspicious Activity',
            description: 'Check flagged items',
            icon: <AlertTriangle className="w-5 h-5" />,
            href: '/admin/moderation?filter=flagged',
            color: 'from-orange-400 to-orange-600',
        },
        {
            label: 'Send Announcement',
            description: 'Notify users',
            icon: <Send className="w-5 h-5" />,
            href: '/admin/announcements',
            color: 'from-purple-400 to-purple-600',
        },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.4 },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
        >
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>

            <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {actions.map((action, index) => (
                    <motion.div
                        key={action.label}
                        variants={itemVariants}
                        custom={index}
                    >
                        <Link href={action.href}>
                            <motion.div
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.98 }}
                                className="h-full bg-white/40 backdrop-blur-xl rounded-xl border border-white/40 p-4 hover:border-emerald-200/50 transition-all duration-300 cursor-pointer group"
                            >
                                <motion.div
                                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 group-hover:shadow-lg transition-shadow`}
                                    whileHover={{ rotate: 12, scale: 1.1 }}
                                >
                                    {action.icon}
                                </motion.div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                    {action.label}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
}
