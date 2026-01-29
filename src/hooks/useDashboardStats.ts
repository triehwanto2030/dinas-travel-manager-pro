import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalTrips: number;
  pendingClaims: number;
  activeEmployees: number;
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
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch total business trips
      const { count: totalTrips, error: tripsError } = await supabase
        .from('business_trips')
        .select('*', { count: 'exact', head: true });

      if (tripsError) throw new Error(tripsError.message);

      // Fetch pending claims (status = 'Submitted')
      const { count: pendingClaims, error: claimsError } = await supabase
        .from('trip_claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Submitted');

      if (claimsError) throw new Error(claimsError.message);

      // Fetch active employees
      const { count: activeEmployees, error: employeesError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

      if (employeesError) throw new Error(employeesError.message);

      // Calculate budget used (total cash advance from all trips)
      const { data: budgetData, error: budgetError } = await supabase
        .from('business_trips')
        .select('cash_advance');

      if (budgetError) throw new Error(budgetError.message);

      const totalCashAdvance = budgetData?.reduce((sum, trip) => sum + (Number(trip.cash_advance) || 0), 0) || 0;
      
      // Assuming a monthly budget of 50,000,000 (50 juta) - this can be made configurable
      const monthlyBudget = 50000000;
      const budgetUsed = monthlyBudget > 0 ? Math.round((totalCashAdvance / monthlyBudget) * 100) : 0;

      return {
        totalTrips: totalTrips || 0,
        pendingClaims: pendingClaims || 0,
        activeEmployees: activeEmployees || 0,
        budgetUsed: Math.min(budgetUsed, 100), // Cap at 100%
      };
    },
  });
};

export const useRecentTrips = () => {
  return useQuery({
    queryKey: ['recent-trips'],
    queryFn: async (): Promise<RecentTrip[]> => {
      const { data, error } = await supabase
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

      if (error) throw new Error(error.message);

      return (data || []).map((trip) => ({
        id: trip.id,
        name: trip.employees?.name || 'Unknown',
        destination: trip.destination,
        date: trip.start_date,
        amount: `Rp ${(trip.cash_advance || 0).toLocaleString('id-ID')}`,
        status: trip.status.toLowerCase() as RecentTrip['status'],
      }));
    },
  });
};
