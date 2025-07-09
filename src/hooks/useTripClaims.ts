
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type TripClaim = Tables<'trip_claims'>;
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
      const { data, error } = await supabase
        .from('trip_claims')
        .select(`
          *,
          employees (*),
          business_trips (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as TripClaimWithDetails[];
    },
  });
};

export const useCreateTripClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (claim: TablesInsert<'trip_claims'>) => {
      console.log('Creating trip claim with data:', claim);
      
      const { data, error } = await supabase
        .from('trip_claims')
        .insert([claim])
        .select(`
          *,
          employees (*),
          business_trips (*)
        `)
        .single();

      if (error) {
        console.error('Error creating trip claim:', error);
        throw new Error(error.message);
      }

      console.log('Trip claim created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip_claims'] });
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
