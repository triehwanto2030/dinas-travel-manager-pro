import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLineApprovals } from '@/hooks/useLineApprovals';

export interface DashboardStats {
  totalTrips: number;
  totalClaims: number;
  pendingClaims: number;
  pendingApprovals: number;
  budgetUsed: number;
}

export interface RecentTrip {
  id: string;
  name: string;
  destination: string;
  date: string;
  amount: string;
  status: 'approved' | 'submitted' | 'rejected' | 'completed';
}

export const useDashboardStats = () => {
  const { user, employee } = useAuth();
  const isAdmin = user?.role === 'admin';
  const employeeId = employee?.id;

  return useQuery({
    queryKey: ['dashboard-stats', isAdmin, employeeId],
    queryFn: async (): Promise<DashboardStats> => {
      // Total business trips (user's own or all for admin)
      let tripsQuery = supabase
        .from('business_trips')
        .select('*', { count: 'exact', head: true });
      if (!isAdmin && employeeId) {
        tripsQuery = tripsQuery.eq('employee_id', employeeId);
      }
      const { count: totalTrips, error: tripsError } = await tripsQuery;
      if (tripsError) throw new Error(tripsError.message);

      // Total claims (user's own or all for admin)
      let claimsAllQuery = supabase
        .from('trip_claims')
        .select('*', { count: 'exact', head: true });
      if (!isAdmin && employeeId) {
        claimsAllQuery = claimsAllQuery.eq('employee_id', employeeId);
      }
      const { count: totalClaims, error: claimsAllError } = await claimsAllQuery;
      if (claimsAllError) throw new Error(claimsAllError.message);

      // Pending claims (user's own or all for admin)
      let pendingQuery = supabase
        .from('trip_claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Submitted');
      if (!isAdmin && employeeId) {
        pendingQuery = pendingQuery.eq('employee_id', employeeId);
      }
      const { count: pendingClaims, error: claimsError } = await pendingQuery;
      if (claimsError) throw new Error(claimsError.message);

      // Pending approvals: count trips + claims where current step matches this user
      let pendingApprovals = 0;
      if (!isAdmin && employeeId) {
        // Trips needing approval by this user (supervisor step)
        const { count: supervisorTrips } = await supabase
          .from('business_trips')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Submitted')
          .eq('current_approval_step', 'supervisor');

        // Claims needing approval by this user (supervisor step)
        const { count: supervisorClaims } = await supabase
          .from('trip_claims')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Submitted')
          .eq('current_approval_step', 'supervisor');

        // We can't easily count line-approval-based pending items without fetching all,
        // so we approximate with submitted items count
        pendingApprovals = (supervisorTrips || 0) + (supervisorClaims || 0);
      }

      // Budget used
      let budgetQuery = supabase.from('business_trips').select('cash_advance');
      if (!isAdmin && employeeId) {
        budgetQuery = budgetQuery.eq('employee_id', employeeId);
      }
      const { data: budgetData, error: budgetError } = await budgetQuery;
      if (budgetError) throw new Error(budgetError.message);

      const totalCashAdvance = budgetData?.reduce((sum, trip) => sum + (Number(trip.cash_advance) || 0), 0) || 0;
      const monthlyBudget = 50000000;
      const budgetUsed = monthlyBudget > 0 ? Math.round((totalCashAdvance / monthlyBudget) * 100) : 0;

      return {
        totalTrips: totalTrips || 0,
        totalClaims: totalClaims || 0,
        pendingClaims: pendingClaims || 0,
        pendingApprovals,
        budgetUsed: Math.min(budgetUsed, 100),
      };
    },
    enabled: !!user,
  });
};

export const useRecentTrips = () => {
  const { user, employee } = useAuth();
  const isAdmin = user?.role === 'admin';
  const employeeId = employee?.id;

  return useQuery({
    queryKey: ['recent-trips', isAdmin, employeeId],
    queryFn: async (): Promise<RecentTrip[]> => {
      let query = supabase
        .from('business_trips')
        .select(`
          id,
          destination,
          start_date,
          cash_advance,
          status,
          employees (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!isAdmin && employeeId) {
        query = query.eq('employee_id', employeeId);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      return (data || []).map((trip) => ({
        id: trip.id,
        name: (trip.employees as any)?.name || 'Unknown',
        destination: trip.destination,
        date: trip.start_date,
        amount: `Rp ${(trip.cash_advance || 0).toLocaleString('id-ID')}`,
        status: trip.status.toLowerCase() as RecentTrip['status'],
      }));
    },
    enabled: !!user,
  });
};
