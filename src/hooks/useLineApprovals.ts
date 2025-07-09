
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type LineApproval = Tables<'line_approvals'>;
type Company = Tables<'companies'>;
type Employee = Tables<'employees'>;

export interface LineApprovalWithDetails extends LineApproval {
  companies: Company;
  staff_ga: Employee | null;
  spv_ga: Employee | null;
  hr_manager: Employee | null;
  bod: Employee | null;
  staff_fa: Employee | null;
}

export const useLineApprovals = () => {
  return useQuery({
    queryKey: ['line_approvals'],
    queryFn: async (): Promise<LineApprovalWithDetails[]> => {
      const { data, error } = await supabase
        .from('line_approvals')
        .select(`
          *,
          companies!inner(*),
          staff_ga:employees!line_approvals_staff_ga_id_fkey(id, name, email, position, department, grade),
          spv_ga:employees!line_approvals_spv_ga_id_fkey(id, name, email, position, department, grade),
          hr_manager:employees!line_approvals_hr_manager_id_fkey(id, name, email, position, department, grade),
          bod:employees!line_approvals_bod_id_fkey(id, name, email, position, department, grade),
          staff_fa:employees!line_approvals_staff_fa_id_fkey(id, name, email, position, department, grade)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching line approvals:', error);
        throw new Error(error.message);
      }

      return data as LineApprovalWithDetails[];
    },
  });
};

export const useCreateLineApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lineApproval: TablesInsert<'line_approvals'>) => {
      console.log('Creating line approval with data:', lineApproval);
      
      const { data, error } = await supabase
        .from('line_approvals')
        .insert([lineApproval])
        .select(`
          *,
          companies(*),
          staff_ga:employees!line_approvals_staff_ga_id_fkey(id, name, email, position, department, grade),
          spv_ga:employees!line_approvals_spv_ga_id_fkey(id, name, email, position, department, grade),
          hr_manager:employees!line_approvals_hr_manager_id_fkey(id, name, email, position, department, grade),
          bod:employees!line_approvals_bod_id_fkey(id, name, email, position, department, grade),
          staff_fa:employees!line_approvals_staff_fa_id_fkey(id, name, email, position, department, grade)
        `)
        .single();

      if (error) {
        console.error('Error creating line approval:', error);
        throw new Error(error.message);
      }

      console.log('Line approval created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['line_approvals'] });
    },
  });
};

export const useUpdateLineApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'line_approvals'> & { id: string }) => {
      console.log('Updating line approval:', id, 'with data:', updates);
      
      const { data, error } = await supabase
        .from('line_approvals')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          companies(*),
          staff_ga:employees!line_approvals_staff_ga_id_fkey(id, name, email, position, department, grade),
          spv_ga:employees!line_approvals_spv_ga_id_fkey(id, name, email, position, department, grade),
          hr_major:employees!line_approvals_hr_manager_id_fkey(id, name, email, position, department, grade),
          bod:employees!line_approvals_bod_id_fkey(id, name, email, position, department, grade),
          staff_fa:employees!line_approvals_staff_fa_id_fkey(id, name, email, position, department, grade)
        `)
        .single();

      if (error) {
        console.error('Error updating line approval:', error);
        throw new Error(error.message);
      }

      console.log('Line approval updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['line_approvals'] });
    },
  });
};

export const useDeleteLineApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting line approval:', id);
      
      const { error } = await supabase
        .from('line_approvals')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting line approval:', error);
        throw new Error(error.message);
      }

      console.log('Line approval deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['line_approvals'] });
    },
  });
};
