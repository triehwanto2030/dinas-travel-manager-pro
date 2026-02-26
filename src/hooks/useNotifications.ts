import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_id: string | null;
  related_type: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<Notification[]> => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw new Error(error.message);
      return (data || []) as unknown as Notification[];
    },
    enabled: !!user?.id,
  });
};

export const useUnreadCount = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['notifications-unread', user?.id],
    queryFn: async (): Promise<number> => {
      if (!user?.id) return 0;
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw new Error(error.message);
      return (data || []).length;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Poll every 30s
  });
};

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications' as any)
        .update({ is_read: true } as any)
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useMarkAllRead = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from('notifications' as any)
        .update({ is_read: true } as any)
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};

export const useCreateNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notification: { user_id: string; title: string; message: string; type?: string; related_id?: string; related_type?: string }) => {
      const { error } = await supabase
        .from('notifications' as any)
        .insert({
          user_id: notification.user_id,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          related_id: notification.related_id || null,
          related_type: notification.related_type || null,
        } as any);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });
};