import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Role = Tables<'roles'>;

export interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
  page_access: string[];
}

export const useRoles = () => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: async (): Promise<Role[]> => {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
};

export const useRoleUserCounts = () => {
  return useQuery({
    queryKey: ['role-user-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('role');

      if (error) throw new Error(error.message);

      const counts: Record<string, number> = {};
      data.forEach((u) => {
        const r = (u.role || '').toLowerCase();
        counts[r] = (counts[r] || 0) + 1;
      });
      return counts;
    },
  });
};

export const useCreateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: RoleFormData) => {
      const { data, error } = await supabase
        .from('roles')
        .insert({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
          page_access: formData.page_access,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
};

export const useUpdateRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: RoleFormData }) => {
      const { data, error } = await supabase
        .from('roles')
        .update({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
          page_access: formData.page_access,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles'] }),
  });
};

export const useDeleteRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('roles').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roles'] });
      qc.invalidateQueries({ queryKey: ['role-user-counts'] });
    },
  });
};
