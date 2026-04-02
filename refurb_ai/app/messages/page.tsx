'use client';

import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '@/lib/api';
import { Conversation, ChatMessage } from '@/lib/types';
import { MessageCircle, Send, ArrowLeft, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

import { useLanguage } from '@/components/providers/language-provider';

export default function MessagesPage() {
    const { isRtl } = useLanguage();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showMobileChat, setShowMobileChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load conversations
    useEffect(() => {
        loadConversations();
    }, []);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await chatAPI.getConversations();
            setConversations(Array.isArray(data) ? data : (data as any)?.results || []);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const selectConversation = async (conv: Conversation) => {
        try {
            const data = await chatAPI.getConversation(conv.id);
            setSelectedConversation(data);
            setMessages(data.messages || []);
            setShowMobileChat(true);

            // Update unread count in list
            setConversations(prev =>
                prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c)
            );
        } catch (err) {
            console.error('Failed to load conversation:', err);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || sending) return;

        try {
            setSending(true);
            const msg = await chatAPI.sendMessage(selectedConversation.id, newMessage.trim());
            setMessages(prev => [...prev, msg]);
            setNewMessage('');

            // Update last message in conversation list
            setConversations(prev =>
                prev.map(c => c.id === selectedConversation.id
                    ? { ...c, last_message: { content: msg.content, sender_name: msg.sender_name, created_at: msg.created_at, is_read: false }, updated_at: msg.created_at }
                    : c
                ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            );
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'أمس';
        } else if (days < 7) {
            return date.toLocaleDateString('ar-EG', { weekday: 'long' });
        }
        return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    };

    const getCurrentUserId = () => {
        if (!selectedConversation) return null;
        // The current user is either buyer or seller
        return selectedConversation.buyer?.id || null;
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-[var(--color-bg)] pt-20 pb-12 relative overflow-hidden">
                {/* REDESIGN: Ambient Mesh Background */}
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-50/50 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-teal-50/40 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 relative z-10" style={{ height: 'calc(100vh - 10rem)' }}>
                    <div className="glass-surface rounded-[var(--radius-2xl)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] h-full overflow-hidden flex">

                        {/* Conversations List */}
                        <div className={`w-full md:w-96 border-r border-[var(--color-border)] flex flex-col bg-white/40 ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                            {/* Header */}
                            <div className="p-5 border-b border-[var(--color-border)] bg-emerald-50/30">
                                <h1 className="text-[1.3rem] font-[900] flex items-center gap-3 text-[var(--color-text-primary)]">
                                    <div className="bg-emerald-100 text-[var(--color-accent)] p-2 rounded-[var(--radius-md)]">
                                        <MessageCircle size={24} strokeWidth={2.5}/>
                                    </div>
                                    المحادثات
                                </h1>
                            </div>

                            {/* Conversation List */}
                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="flex items-center justify-center h-40">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--color-accent)] border-t-transparent"></div>
                                    </div>
                                ) : conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                                            <MessageCircle size={32} strokeWidth={2} className="text-[var(--color-accent)]" />
                                        </div>
                                        <h3 className="font-[800] text-[1.1rem] text-[var(--color-text-primary)] mb-2">لا توجد محادثات</h3>
                                        <p className="text-[13px] font-[500] text-[var(--color-text-secondary)]">ابدأ محادثة مع بائع من صفحة أي منتج</p>
                                    </div>
                                ) : (
                                    conversations.map(conv => (
                                        <motion.div
                                            key={conv.id}
                                            whileHover={{ backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                                            onClick={() => selectConversation(conv)}
                                            className={`p-4 border-b border-[var(--color-border)] cursor-pointer transition-all duration-300 ${selectedConversation?.id === conv.id ? 'bg-emerald-50/80 border-l-4 border-l-[var(--color-accent)]' : 'hover:bg-white/60'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {/* Avatar */}
                                                <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-white font-[800] text-lg shrink-0 shadow-[var(--shadow-sm)]">
                                                    {conv.other_participant?.username?.[0]?.toUpperCase() || '?'}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-[800] text-[14px] text-[var(--color-text-primary)] truncate">
                                                            {conv.other_participant?.username || 'Unknown'}
                                                        </h3>
                                                        <span className="text-[11px] font-[600] text-[var(--color-text-muted)] shrink-0 ml-2">
                                                            {conv.last_message ? formatTime(conv.last_message.created_at) : ''}
                                                        </span>
                                                    </div>

                                                    <p className="text-[11px] font-[700] text-[var(--color-accent)] flex items-center gap-1.5 mt-1">
                                                        <Package size={12} strokeWidth={2.5}/>
                                                        <span className="truncate">{conv.product_title}</span>
                                                    </p>

                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="text-[13px] font-[500] text-[var(--color-text-secondary)] truncate">
                                                            {conv.last_message?.content || 'ابدأ المحادثة...'}
                                                        </p>
                                                        {conv.unread_count > 0 && (
                                                            <span className="bg-[var(--color-accent)] text-white text-[10px] font-[800] rounded-full w-5 h-5 flex items-center justify-center shrink-0 ml-2 shadow-sm">
                                                                {conv.unread_count}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat Area */}
                        <div className={`flex-1 flex flex-col ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
                            {selectedConversation ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-[var(--color-border)] flex items-center gap-4 bg-white/60 backdrop-blur-md z-10">
                                        <button
                                            onClick={() => setShowMobileChat(false)}
                                            className="md:hidden p-2 hover:bg-slate-100 rounded-full transition-colors"
                                        >
                                            <ArrowLeft size={20} className="text-[var(--color-text-primary)]" />
                                        </button>
                                        <div className="w-11 h-11 rounded-full gradient-accent flex items-center justify-center text-white font-[800] shadow-[var(--shadow-sm)]">
                                            {selectedConversation.buyer?.username?.[0]?.toUpperCase() || selectedConversation.seller?.username?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-[800] text-[15px] text-[var(--color-text-primary)]">
                                                {selectedConversation.buyer?.username || selectedConversation.seller?.username}
                                            </h3>
                                            <p className="text-[12px] font-[700] text-[var(--color-accent)] flex items-center gap-1.5 mt-0.5">
                                                <Package size={12} strokeWidth={2.5} />
                                                {selectedConversation.product_title}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent relative">
                                        {messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
                                                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                                                    <MessageCircle size={24} className="text-[var(--color-accent)]" strokeWidth={2} />
                                                </div>
                                                <p className="text-[var(--color-text-secondary)] text-[14px] font-[500]">ابدأ المحادثة الآن!</p>
                                            </div>
                                        ) : (
                                            <AnimatePresence>
                                                {messages.map((msg) => {
                                                    const isMine = msg.sender_name === selectedConversation.buyer?.username
                                                        ? selectedConversation.buyer?.id === getCurrentUserId()
                                                        : selectedConversation.seller?.id === getCurrentUserId();
                                                    // Simpler: check if sender_name matches the buyer
                                                    const isFromBuyer = msg.sender === selectedConversation.buyer?.id;

                                                    return (
                                                        <motion.div
                                                            key={msg.id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className={`flex ${isFromBuyer ? 'justify-start' : 'justify-end'}`}
                                                        >
                                                            <div className={`max-w-[75%] px-5 py-3 shadow-[var(--shadow-xs)] relative z-10 ${isFromBuyer
                                                                ? 'bg-white rounded-[var(--radius-xl)] rounded-bl-[4px] border border-[var(--color-border)]'
                                                                : 'gradient-accent text-white rounded-[var(--radius-xl)] rounded-br-[4px]'
                                                                }`}>
                                                                <p className={`text-[14px] font-[500] leading-relaxed ${isFromBuyer ? 'text-[var(--color-text-primary)]' : 'text-white'}`}>{msg.content}</p>
                                                                <div className={`flex justify-end items-center gap-1 mt-1 font-[600] ${isFromBuyer ? 'text-[var(--color-text-muted)]' : 'text-emerald-50/80'}`}>
                                                                    <span className="text-[10px] tracking-wide">
                                                                        {formatTime(msg.created_at)}
                                                                    </span>
                                                                    {!isFromBuyer && msg.is_read && (
                                                                        <span className="text-[11px] ml-1">✓✓</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message Input */}
                                    <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--color-border)] bg-white/60 backdrop-blur-md relative z-10">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder="اكتب رسالتك..."
                                                className="flex-1 bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] rounded-[var(--radius-pill)] px-5 py-3.5 text-[14px] font-[500] focus:outline-none focus:border-[var(--color-accent)] focus:ring-4 focus:ring-emerald-500/10 transition-all text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
                                                disabled={sending}
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                type="submit"
                                                disabled={!newMessage.trim() || sending}
                                                className="gradient-accent text-white p-3.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-glow)] shrink-0"
                                            >
                                                <Send size={20} strokeWidth={2.5} className={isRtl ? 'rotate-180' : ''}/>
                                            </motion.button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-transparent">
                                    <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6 shadow-[var(--shadow-sm)]">
                                        <MessageCircle size={40} strokeWidth={1.5} className="text-[var(--color-accent)]" />
                                    </div>
                                    <h2 className="text-[1.5rem] font-[900] mb-3 text-[var(--color-text-primary)] tracking-[-0.02em]">مرحباً بك في المحادثات</h2>
                                    <p className="text-[var(--color-text-secondary)] text-[14px] font-[500] max-w-sm leading-relaxed">
                                        اختر محادثة من القائمة أو ابدأ محادثة جديدة من صفحة أي منتج
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
