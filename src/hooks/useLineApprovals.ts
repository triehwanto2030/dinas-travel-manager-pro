
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
          companies (*),
          supervisor:supervisor_id (id, name),
          staff_ga:staff_ga_id (id, name),
          spv_ga:spv_ga_id (id, name),
          hr_manager:hr_manager_id (id, name),
          bod:bod_id (id, name),
          staff_fa:staff_fa_id (id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as LineApprovalWithDetails[];
    },
  });
};
