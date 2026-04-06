import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';

export function useNotifications() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // 1. Fetch Notifications
    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationsAPI.list(),
        enabled: !!user,
    });

    // 2. Fetch Unread Count natively
    const { data: unreadCountData } = useQuery({
        queryKey: ['notifications', 'unread'],
        queryFn: () => notificationsAPI.unreadCount(),
        enabled: !!user,
        refetchInterval: 60000 // Fallback polling just in case WebSocket disconnects
    });
    const unreadCount = unreadCountData?.unread_count || 0;

    // 3. Setup Django Channels WebSocket Integration for Notifications
    useEffect(() => {
        if (!user) return;

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
        const ws = new WebSocket(`${wsUrl}/ws/notifications/${user.user?.id || user.id}/`);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'system_notification') {
                const newNotification = data.data; // { id, title, message, created_at }
                
                // Manually inject into notifications list cache
                queryClient.setQueryData(['notifications'], (old: any) => {
                    const current = Array.isArray(old) ? old : [];
                    if (current.find((n: any) => n.id === newNotification.id)) return current;
                    return [newNotification, ...current];
                });

                // Optimistically increment unread count
                queryClient.setQueryData(['notifications', 'unread'], (old: any) => {
                    return { unread_count: (old?.unread_count || 0) + 1 };
                });
            }
        };

        return () => {
            ws.close();
        };
    }, [user, queryClient]);

    // 4. Mark all as read mutation
    const markReadMutation = useMutation({
        mutationFn: () => notificationsAPI.markAllRead(),
        onSuccess: () => {
            // Optimistically update counts and statuses
            queryClient.setQueryData(['notifications', 'unread'], { unread_count: 0 });
            queryClient.setQueryData(['notifications'], (old: any) => {
                if (!old) return old;
                return old.map((n: any) => ({ ...n, is_read: true }));
            });
        }
    });

    const markAllAsRead = () => {
        if (unreadCount === 0 || markReadMutation.isPending) return;
        markReadMutation.mutate();
    };

    return {
        notifications,
        unreadCount,
        loading: isLoading,
        markAllAsRead,
        isMarkingRead: markReadMutation.isPending
    };
}
