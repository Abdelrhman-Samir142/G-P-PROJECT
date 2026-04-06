'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAllAsRead, isMarkingRead } = useNotifications();

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-slate-700 dark:text-slate-200" />
                {unreadCount > 0 && (
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center"
                    >
                        <span className="text-[9px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </motion.div>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute left-0 mt-2 w-80 sm:w-96 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 origin-top-left"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/60 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Sparkles className="text-primary" size={16} />
                                الإشعارات
                            </h3>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    disabled={isMarkingRead}
                                    className="text-xs font-bold text-primary hover:text-primary-700 disabled:opacity-50 flex items-center gap-1"
                                >
                                    <Check size={14} />
                                    تحديد كمقروء
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                        <Bell size={24} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">لا توجد إشعارات جديدة</p>
                                    <p className="text-xs text-slate-500 mt-1">سنخبرك بكل جديد فور وصوله</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {notifications.map((notif: any) => (
                                        <motion.div 
                                            key={notif.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default ${!notif.is_read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!notif.is_read ? 'bg-primary animate-pulse' : 'bg-transparent'}`} />
                                                <div>
                                                    <p className={`text-sm ${!notif.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-200'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-2">
                                                        {formatTime(notif.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-800/30 text-center">
                           <button className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                               عرض كل الإشعارات
                           </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
