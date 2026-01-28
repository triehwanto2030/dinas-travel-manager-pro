import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmployeeDepartment {
  id: string;
  company_id: string | null;
  name: string;
  created_at: string;
  updated_at: string;
  companies?: { id: string; name: string } | null;
}

export const useEmployeeDepartments = () => {
  return useQuery({
    queryKey: ['employee_departments'],
    queryFn: async (): Promise<EmployeeDepartment[]> => {
      const { data, error } = await supabase
        .from('employee_departments')
        .select(`
          *,
          companies:company_id (id, name)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching employee departments:', error);
        throw new Error(error.message);
      }

      return data as EmployeeDepartment[];
    },
  });
};

export const useCreateEmployeeDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, company_id }: { name: string; company_id?: string | null }) => {
      const { data, error } = await supabase
        .from('employee_departments')
        .insert([{ name, company_id: company_id || null }])
        .select(`
          *,
          companies:company_id (id, name)
        `)
        .single();

      if (error) {
        console.error('Error creating employee department:', error);
        if (error.code === '23505') {
          throw new Error('Departemen sudah ada');
        }
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_departments'] });
    },
  });
};

export const useUpdateEmployeeDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, company_id }: { id: string; name: string; company_id?: string | null }) => {
      const { data, error } = await supabase
        .from('employee_departments')
        .update({ name, company_id: company_id || null })
        .eq('id', id)
        .select(`
          *,
          companies:company_id (id, name)
        `)
        .single();

      if (error) {
        console.error('Error updating employee department:', error);
        if (error.code === '23505') {
          throw new Error('Departemen sudah ada');
        }
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_departments'] });
    },
  });
};

export const useDeleteEmployeeDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_departments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting employee department:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_departments'] });
    },
  });
};
