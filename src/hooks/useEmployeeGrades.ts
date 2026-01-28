import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EmployeeGrade {
  id: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export const useEmployeeGrades = () => {
  return useQuery({
    queryKey: ['employee_grades'],
    queryFn: async (): Promise<EmployeeGrade[]> => {
      const { data, error } = await supabase
        .from('employee_grades')
        .select('*')
        .order('code');

      if (error) {
        console.error('Error fetching employee grades:', error);
        throw new Error(error.message);
      }

      return data as EmployeeGrade[];
    },
  });
};

export const useCreateEmployeeGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .from('employee_grades')
        .insert([{ code }])
        .select()
        .single();

      if (error) {
        console.error('Error creating employee grade:', error);
        if (error.code === '23505') {
          throw new Error('Grade sudah ada');
        }
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_grades'] });
    },
  });
};

export const useUpdateEmployeeGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, code }: { id: string; code: string }) => {
      const { data, error } = await supabase
        .from('employee_grades')
        .update({ code })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating employee grade:', error);
        if (error.code === '23505') {
          throw new Error('Grade sudah ada');
        }
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_grades'] });
    },
  });
};

export const useDeleteEmployeeGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_grades')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting employee grade:', error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_grades'] });
    },
  });
};
