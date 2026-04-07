'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, FileText, AlertCircle, TrendingUp } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'user' | 'product' | 'alert' | 'transaction';
    title: string;
    description: string;
    timestamp: string;
}

export default function AdminRecentActivity() {
    const activities: ActivityItem[] = [
        {
            id: '1',
            type: 'user',
            title: 'New User Signup',
            description: 'Ahmed Mohamed registered',
            timestamp: '2 minutes ago',
        },
        {
            id: '2',
            type: 'product',
            title: 'Product Listed',
            description: 'iPhone 13 Pro listed for auction',
            timestamp: '15 minutes ago',
        },
        {
            id: '3',
            type: 'alert',
            title: 'Suspicious Activity',
            description: 'Multiple bids from same IP',
            timestamp: '1 hour ago',
        },
        {
            id: '4',
            type: 'transaction',
            title: 'Escrow Released',
            description: 'Auction #2024-001 completed',
            timestamp: '3 hours ago',
        },
        {
            id: '5',
            type: 'user',
            title: 'User Verification',
            description: 'Fatima Hassan verified ID',
            timestamp: '4 hours ago',
        },
    ];

    const getIcon = (type: ActivityItem['type']) => {
        switch (type) {
            case 'user':
                return <UserPlus className="w-4 h-4" />;
            case 'product':
                return <FileText className="w-4 h-4" />;
            case 'alert':
                return <AlertCircle className="w-4 h-4" />;
            case 'transaction':
                return <TrendingUp className="w-4 h-4" />;
        }
    };

    const getColor = (type: ActivityItem['type']) => {
        switch (type) {
            case 'user':
                return 'from-blue-400 to-blue-600';
            case 'product':
                return 'from-green-400 to-green-600';
            case 'alert':
                return 'from-orange-400 to-orange-600';
            case 'transaction':
                return 'from-purple-400 to-purple-600';
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.3 },
        },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-6 hover:border-emerald-200/50 transition-colors h-full"
        >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>

            <motion.div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id}
                        variants={itemVariants}
                        custom={index}
                        whileHover={{ x: 4 }}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/30 transition-colors cursor-pointer group"
                    >
                        {/* Icon */}
                        <motion.div
                            className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${getColor(
                                activity.type
                            )} flex items-center justify-center text-white mt-0.5 group-hover:shadow-md transition-shadow`}
                            whileHover={{ scale: 1.1 }}
                        >
                            {getIcon(activity.type)}
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                {activity.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5">{activity.description}</p>
                        </div>

                        {/* Time */}
                        <p className="text-xs text-gray-500 flex-shrink-0 text-right">
                            {activity.timestamp}
                        </p>
                    </motion.div>
                ))}
            </motion.div>

            {/* View All Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50/50 rounded-lg transition-colors"
            >
                View All Activity
            </motion.button>
        </motion.div>
    );
}
