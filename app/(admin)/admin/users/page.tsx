'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    MoreVertical,
    Ban,
    Shield,
    AlertCircle,
} from 'lucide-react';
import { api } from '@/lib/api';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
    date_joined: string;
    profile: {
        phone: string;
        city: string;
        trust_score: number;
        is_verified: boolean;
        wallet_balance: number;
        held_balance: number;
        total_sales: number;
        seller_rating: number;
    };
}

interface UsersResponse {
    count: number;
    page: number;
    page_size: number;
    results: User[];
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showBanModal, setShowBanModal] = useState(false);
    const [banReason, setBanReason] = useState('');

    const pageSize = 20;
    const totalPages = Math.ceil(totalCount / pageSize);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await api.get('/ai_agents/admin/users/', {
                    params: { page, page_size: pageSize },
                });
                const data: UsersResponse = response.data;
                setUsers(data.results);
                setTotalCount(data.count);
                setError(null);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [page]);

    const handleBanUser = async () => {
        if (!selectedUser) return;

        try {
            await api.post(`/ai_agents/admin/${selectedUser.id}/ban-user/`, {
                reason: banReason,
            });

            // Update local state
            setUsers(users.map(u => (u.id === selectedUser.id ? { ...u, is_active: false } : u)));
            setShowBanModal(false);
            setBanReason('');
            setSelectedUser(null);
        } catch (err: any) {
            setError('Failed to ban user');
        }
    };

    const handleUnbanUser = async (userId: number) => {
        try {
            await api.post(`/ai_agents/admin/${userId}/unban-user/`);
            setUsers(users.map(u => (u.id === userId ? { ...u, is_active: true } : u)));
        } catch (err: any) {
            setError('Failed to unban user');
        }
    };

    const filteredUsers = users.filter(
        u =>
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    User Management
                </h1>
                <p className="text-gray-600 mt-2">Manage and moderate platform users</p>
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={itemVariants}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/40 backdrop-blur-xl rounded-xl border border-white/50 focus:border-emerald-200 focus:outline-none transition-colors"
                    />
                </div>
            </motion.div>

            {/* Users Table */}
            {error && (
                <motion.div
                    variants={itemVariants}
                    className="p-4 bg-red-50/50 backdrop-blur-xl rounded-xl border border-red-200/50 flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700">{error}</p>
                </motion.div>
            )}

            {loading ? (
                <motion.div
                    variants={itemVariants}
                    className="p-12 text-center bg-white/40 backdrop-blur-xl rounded-xl"
                >
                    <p className="text-gray-600">Loading users...</p>
                </motion.div>
            ) : (
                <motion.div variants={itemVariants} className="overflow-x-auto">
                    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/30">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Trust Score
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Joined
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/30">
                                {filteredUsers.map((user, index) => (
                                    <motion.tr
                                        key={user.id}
                                        variants={itemVariants}
                                        custom={index}
                                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                        className="transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                                                    {user.username[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <p className="text-sm text-gray-600">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {user.is_active ? (
                                                    <>
                                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                                        <span className="text-sm font-medium text-green-700">
                                                            Active
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                                        <span className="text-sm font-medium text-red-700">
                                                            Banned
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1">
                                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${user.profile?.trust_score || 50}%`,
                                                        }}
                                                        transition={{ duration: 0.5 }}
                                                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 w-8">
                                                    {user.profile?.trust_score || 50}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() =>
                                                        setActiveDropdown(
                                                            activeDropdown === user.id ? null : user.id
                                                        )
                                                    }
                                                    className="p-2 hover:bg-gray-200/30 rounded-lg transition-colors"
                                                >
                                                    <MoreVertical className="w-5 h-5 text-gray-600" />
                                                </motion.button>

                                                {activeDropdown === user.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-lg border border-white/50 shadow-lg z-10"
                                                    >
                                                        {user.is_active ? (
                                                            <motion.button
                                                                whileHover={{
                                                                    backgroundColor:
                                                                        'rgba(239, 68, 68, 0.1)',
                                                                }}
                                                                onClick={() => {
                                                                    setSelectedUser(user);
                                                                    setShowBanModal(true);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:text-red-700 flex items-center gap-2 transition-colors"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                                Ban User
                                                            </motion.button>
                                                        ) : (
                                                            <motion.button
                                                                whileHover={{
                                                                    backgroundColor:
                                                                        'rgba(34, 197, 94, 0.1)',
                                                                }}
                                                                onClick={() => {
                                                                    handleUnbanUser(user.id);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-green-600 hover:text-green-700 flex items-center gap-2 transition-colors"
                                                            >
                                                                <Shield className="w-4 h-4" />
                                                                Unban User
                                                            </motion.button>
                                                        )}
                                                    </motion.div>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Pagination */}
            {!loading && (
                <motion.div
                    variants={itemVariants}
                    className="flex items-center justify-between py-4"
                >
                    <p className="text-sm text-gray-600">
                        Showing {(page - 1) * pageSize + 1} to{' '}
                        {Math.min(page * pageSize, totalCount)} of {totalCount} users
                    </p>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="p-2 bg-white/40 hover:bg-white/60 rounded-lg border border-white/50 disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                        <span className="text-sm font-medium text-gray-700">
                            Page {page} of {totalPages}
                        </span>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="p-2 bg-white/40 hover:bg-white/60 rounded-lg border border-white/50 disabled:opacity-50 transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>
                </motion.div>
            )}

            {/* Ban Modal */}
            {showBanModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowBanModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 p-6 max-w-md w-full mx-4 shadow-2xl"
                    >
                        <h3 className="text-lg font-bold text-gray-900">
                            Ban User: {selectedUser?.username}
                        </h3>
                        <p className="text-gray-600 mt-2">
                            Are you sure you want to ban this user? They will be unable to access the
                            platform.
                        </p>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                                Reason (optional)
                            </label>
                            <textarea
                                value={banReason}
                                onChange={e => setBanReason(e.target.value)}
                                placeholder="Enter reason for banning..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 resize-none"
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowBanModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-200/50 hover:bg-gray-300/50 text-gray-900 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleBanUser}
                                className="flex-1 px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                            >
                                Ban User
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </motion.div>
    );
}
