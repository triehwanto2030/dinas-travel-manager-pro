
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Employee = Tables<'employees'>;
type Company = Tables<'companies'>;

export interface EmployeeWithCompany extends Employee {
  companies: Company;
}

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async (): Promise<EmployeeWithCompany[]> => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          companies (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as EmployeeWithCompany[];
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: TablesInsert<'employees'>) => {
      console.log('Creating employee with data:', employee);
      
      const { data, error } = await supabase
        .from('employees')
        .insert([employee])
        .select(`
          *,
          companies (*)
        `)
        .single();

      if (error) {
        console.error('Error creating employee:', error);
        throw new Error(error.message);
      }

      console.log('Employee created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'employees'> & { id: string }) => {
      console.log('Updating employee:', id, 'with data:', updates);
      
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          companies (*)
        `)
        .single();

      if (error) {
        console.error('Error updating employee:', error);
        throw new Error(error.message);
      }

      console.log('Employee updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting employee:', id);
      
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting employee:', error);
        throw new Error(error.message);
      }

      console.log('Employee deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
