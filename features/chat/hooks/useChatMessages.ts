import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '@/lib/api';
import { Conversation, ChatMessage } from '@/lib/types';

export function useChatMessages() {
    const queryClient = useQueryClient();
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [showMobileChat, setShowMobileChat] = useState(false);
    
    // We export this ref so the view can attach it
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // 1. Fetch Conversations via React Query
    const { data: rawConversations, isLoading: loadingConversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: () => chatAPI.getConversations()
    });
    const conversations = Array.isArray(rawConversations) ? rawConversations : (rawConversations as any)?.results || [];

    // 2. Fetch Selected Conversation Details via React Query
    const { data: selectedConversation, isLoading: loadingMessages } = useQuery({
        queryKey: ['conversation', selectedConversationId],
        queryFn: () => chatAPI.getConversation(selectedConversationId!),
        enabled: !!selectedConversationId,
    });

    const messages = selectedConversation?.messages || [];

    // Scroll to bottom when messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 3. Setup Django Channels WebSocket Integration
    useEffect(() => {
        if (!selectedConversationId) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        const ws = new WebSocket(`${wsUrl}/ws/chat/${selectedConversationId}/`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // Handle real-time incoming messages
            if (data.type === 'chat_message') {
                const newMsg = data.data;
                const msgObject: Partial<ChatMessage> = {
                    id: newMsg.message_id,
                    sender_name: newMsg.sender,     
                    content: newMsg.content,
                    created_at: newMsg.timestamp,
                    is_read: false
                };

                // Manually update the query cache to skip HTTP refetching
                queryClient.setQueryData(['conversation', selectedConversationId], (oldData: any) => {
                    if (!oldData) return oldData;
                    
                    // Prevent duplicate injections
                    if (oldData.messages.find((m: any) => m.id === msgObject.id)) return oldData;
                    
                    return {
                        ...oldData,
                        messages: [...oldData.messages, msgObject]
                    };
                });
            }
        };

        return () => {
            ws.close();
        };
    }, [selectedConversationId, queryClient]);


    const selectConversation = (conv: Conversation) => {
        setSelectedConversationId(conv.id);
        setShowMobileChat(true);

        // Optimistically clear unread count in conversations list
        queryClient.setQueryData(['conversations'], (oldData: any) => {
            if (!oldData) return oldData;
            const targetArray = Array.isArray(oldData) ? oldData : oldData.results;
            if (!targetArray) return oldData;
            const newArray = targetArray.map((c: any) => 
                c.id === conv.id ? { ...c, unread_count: 0 } : c
            );
            return Array.isArray(oldData) ? newArray : { ...oldData, results: newArray };
        });
    };

    // 4. Send Message Mutation via React Query
    const sendMessageMutation = useMutation({
        mutationFn: (content: string) => chatAPI.sendMessage(selectedConversationId!, content),
        onSuccess: (newMsg) => {
            setNewMessage('');
            // We do not need to push to cache manually on success because the WebSocket
            // pushes the message to all clients in the room (including this sender) globally!
        }
    });

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversationId || sendMessageMutation.isPending) return;
        sendMessageMutation.mutate(newMessage.trim());
    };

    return {
        conversations,
        selectedConversation,
        messages,
        newMessage,
        setNewMessage,
        loading: loadingConversations || loadingMessages,
        sending: sendMessageMutation.isPending,
        showMobileChat,
        setShowMobileChat,
        messagesEndRef,
        selectConversation,
        sendMessage
    };
}
