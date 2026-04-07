'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Store, TrendingUp, DollarSign, AlertCircle, Zap } from 'lucide-react';
import AdminStatsWidget from '@/components/admin/AdminStatsWidget';
import AdminQuickActions from '@/components/admin/AdminQuickActions';
import AdminActivityChart from '@/components/admin/AdminActivityChart';
import AdminRecentActivity from '@/components/admin/AdminRecentActivity';
import { api } from '@/lib/api';

interface PlatformStats {
    total_users: number;
    active_users: number;
    total_escrow_locked: number;
    total_held_funds: number;
    active_auctions: number;
    total_products: number;
    pending_approvals: number;
    total_transactions: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await api.get('/ai_agents/admin/platform_stats/');
                setStats(response.data);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to load platform statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    if (error && !loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 bg-red-50/50 backdrop-blur-xl rounded-2xl border border-red-200/50 flex items-start gap-4"
            >
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold text-red-900">Error Loading Dashboard</h3>
                    <p className="text-red-700 mt-1">{error}</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Page Title */}
            <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Dashboard Overview
                </h1>
                <p className="text-gray-600 mt-2">
                    Welcome back! Here's what's happening on your platform today.
                </p>
            </motion.div>

            {/* Stats Grid */}
            {stats && (
                <motion.div variants={itemVariants}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Total Users */}
                        <AdminStatsWidget
                            label="Total Users"
                            value={stats.total_users}
                            icon={Users}
                            color="from-blue-400 to-blue-600"
                            delay={0}
                        />

                        {/* Active Auctions */}
                        <AdminStatsWidget
                            label="Active Auctions"
                            value={stats.active_auctions}
                            icon={TrendingUp}
                            color="from-purple-400 to-purple-600"
                            delay={0.1}
                        />

                        {/* Escrow Locked */}
                        <AdminStatsWidget
                            label="Escrow Locked"
                            value={`$${(stats.total_escrow_locked / 1000).toFixed(1)}K`}
                            icon={DollarSign}
                            color="from-green-400 to-green-600"
                            delay={0.2}
                        />

                        {/* Pending Approvals */}
                        <AdminStatsWidget
                            label="Pending Approvals"
                            value={stats.pending_approvals}
                            icon={AlertCircle}
                            color="from-orange-400 to-orange-600"
                            delay={0.3}
                        />
                    </div>
                </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
                <AdminQuickActions />
            </motion.div>

            {/* Charts and Activity */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity Chart - 2 columns */}
                <div className="lg:col-span-2">
                    <AdminActivityChart />
                </div>

                {/* Recent Activity - 1 column */}
                <div>
                    <AdminRecentActivity />
                </div>
            </motion.div>

            {/* Additional Stats */}
            {stats && (
                <motion.div variants={itemVariants}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-6 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Products</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_products}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400/30 to-indigo-600/30 rounded-xl flex items-center justify-center">
                                    <Store className="w-6 h-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-6 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Active Users</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.active_users}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-green-400/30 to-green-600/30 rounded-xl flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-6 hover:border-emerald-200 transition-colors">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Total Transactions</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total_transactions}</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-br from-teal-400/30 to-teal-600/30 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-teal-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
