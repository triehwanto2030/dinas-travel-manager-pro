
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type LineApproval = Tables<'line_approvals'>;
type Company = Tables<'companies'>;
type Employee = Tables<'employees'>;

export interface LineApprovalWithDetails extends LineApproval {
  companies: Company;
  supervisor: Employee | null;
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
          supervisor:employees!line_approvals_supervisor_id_fkey(id, name, email, position, department, grade),
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
