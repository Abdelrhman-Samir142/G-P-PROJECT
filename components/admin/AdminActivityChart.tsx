'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
    name: string;
    value: number;
    transactions: number;
}

export default function AdminActivityChart() {
    // Mock data - in production, this would be fetched from the API
    const data: ChartData[] = useMemo(() => {
        return [
            { name: 'Mon', value: 2400, transactions: 24 },
            { name: 'Tue', value: 1398, transactions: 18 },
            { name: 'Wed', value: 9800, transactions: 42 },
            { name: 'Thu', value: 3908, transactions: 31 },
            { name: 'Fri', value: 4800, transactions: 38 },
            { name: 'Sat', value: 3800, transactions: 28 },
            { name: 'Sun', value: 4300, transactions: 35 },
        ];
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 p-6 hover:border-emerald-200/50 transition-colors"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Weekly Activity</h3>
                    <p className="text-sm text-gray-600 mt-1">Transactions and platform engagement</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-emerald-100/50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200/50 transition-colors">
                        This Week
                    </button>
                    <button className="px-4 py-2 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100/50 transition-colors">
                        All Time
                    </button>
                </div>
            </div>

            {/* Chart Container */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full h-64"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="name" stroke="rgba(0,0,0,0.5)" />
                        <YAxis stroke="rgba(0,0,0,0.5)" />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '8px',
                                backdropFilter: 'blur(10px)',
                            }}
                        />
                        <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Legend */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-6 mt-6 pt-6 border-t border-white/30"
            >
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500" />
                    <span className="text-sm text-gray-600">Transactions</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
