import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface UserFormData {
  email: string;
  username: string;
  role: string;
  employee_id: string | null;
  is_active: boolean;
  password?: string;
}

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: UserFormData) => {
      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          email: data.email,
          username: data.username,
          role: data.role,
          employee_id: data.employee_id,
          is_active: data.is_active,
        }])
        .select()
        .single();
      if (error) throw new Error(error.message);

      // Set password if provided
      if (data.password && user) {
        await supabase.functions.invoke('auth-set-password', {
          body: { user_id: user.id, password: data.password },
        });
      }
      return user;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<UserFormData>) => {
      const updateData: Record<string, any> = {};
      if (data.email !== undefined) updateData.email = data.email;
      if (data.username !== undefined) updateData.username = data.username;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.employee_id !== undefined) updateData.employee_id = data.employee_id;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;

      const { data: user, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);

      // Set new password if provided
      if (data.password) {
        await supabase.functions.invoke('auth-set-password', {
          body: { user_id: id, password: data.password },
        });
      }
      return user;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useToggleUserActive = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('users')
        .update({ is_active })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
};