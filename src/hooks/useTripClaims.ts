import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type TripClaim = Tables<'trip_claims'>;
type ClaimExpense = Tables<'claim_expenses'>;
type Employee = Tables<'employees'>;
type BusinessTrip = Tables<'business_trips'>;

export interface TripClaimWithDetails extends TripClaim {
  employees: Employee;
  business_trips: BusinessTrip;
}

export const useTripClaims = () => {
  return useQuery({
    queryKey: ['trip_claims'],
    queryFn: async (): Promise<TripClaimWithDetails[]> => {
      console.log('Fetching trip claims...');
      const { data, error } = await supabase
        .from('trip_claims')
        .select(`
          *,
          employees (*),
          business_trips (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trip claims:', error);
        throw new Error(error.message);
      }

      console.log('Trip claims fetched:', data);
      return data as TripClaimWithDetails[];
    },
  });
};

export const useCreateTripClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claim: TablesInsert<'trip_claims'>) => {
      console.log('Creating trip claim with data:', claim);
      
      // Ensure all required fields are present
      const claimData = {
        employee_id: claim.employee_id,
        trip_id: claim.trip_id,
        total_amount: claim.total_amount || 0,
        status: claim.status || 'Submitted',
        submitted_at: claim.submitted_at || new Date().toISOString(),
      };

      console.log('Processed claim data:', claimData);
      
      const { data, error } = await supabase
        .from('trip_claims')
        .insert([claimData])
        .select(`
          *,
          employees (*),
          business_trips (*)
        `)
        .single();

      if (error) {
        console.error('Error creating trip claim:', error);
        throw new Error(`Failed to create trip claim: ${error.message}`);
      }

      console.log('Trip claim created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Trip claim creation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['trip_claims'] }); // Fixes the issue by invalidating the correct query
      queryClient.invalidateQueries({ queryKey: ['business_trips'] }); // In case business trips data is affected
    },
    onError: (error) => {
      console.error('Trip claim creation failed:', error);
    },
  });
};

export const useUpdateTripClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'trip_claims'> & { id: string }) => {
      console.log('Updating trip claim:', id, 'with data:', updates);
      
      const { data, error } = await supabase
        .from('trip_claims')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          employees (*),
          business_trips (*)
        `)
        .single();

      if (error) {
        console.error('Error updating trip claim:', error);
        throw new Error(error.message);
      }

      console.log('Trip claim updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip_claims'] });
    },
  });
};

export const useDeleteTripClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting trip claim:', id);
      
      const { error } = await supabase
        .from('trip_claims')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting trip claim:', error);
        throw new Error(error.message);
      }

      console.log('Trip claim deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip_claims'] });
    },
  });
};

export const useTripClaimExpenses = (tripClaimId?: string) => {
  return useQuery({
    queryKey: ['claim_expenses', tripClaimId],
    queryFn: async ({ queryKey }): Promise<ClaimExpense[]> => {
      const [, tripClaimId] = queryKey;
      console.log('Fetching trip claims...');
      
      const query = supabase
        .from('claim_expenses')
        .select(`*`);

      if (tripClaimId) {
        query.eq('trip_claim_id', tripClaimId); // Add this line to filter by trip_claim_id
      }
      
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching expenses:', error);
        throw new Error(error.message);
      }

      console.log('Claim expenses fetched:', data);
      return data as ClaimExpense[];
    },
  });
};

export const useCreateTripClaimExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenses: TablesInsert<'claim_expenses'>[]) => {
      console.log('Creating claim expense with data:', expenses);
      
      // Ensure all required fields are present
      const expenseData = expenses.map(expense => ({
        expense_date: expense.expense_date,
        expense_type: expense.expense_type || 'other',
        expense_amount: expense.expense_amount || 0,
        description: expense.description || '',
        trip_claim_id: expense.trip_claim_id,
      }));

      console.log('Processed expense data:', expenseData);
      
      const { data, error } = await supabase
        .from('claim_expenses')
        .insert(expenseData);

      if (error) {
        console.error('Error creating trip claim:', error);
        throw new Error(`Failed to create trip claim: ${error.message}`);
      }

      console.log('Expenses created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Expense successfully stored! Invalidating queries.');
      queryClient.invalidateQueries({ queryKey: ['claim_expenses'] });
    },
    onError: (error) => {
      console.error('Trip claim creation failed:', error);
    },
  });
};