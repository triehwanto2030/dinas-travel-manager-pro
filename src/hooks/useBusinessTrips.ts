
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type BusinessTrip = Tables<'business_trips'>;
type Employee = Tables<'employees'>;
type Company = Tables<'companies'>;

export interface BusinessTripWithRelations extends BusinessTrip {
  employees: Employee & {
    companies: Company;
  };
}

export interface BusinessTripFormData {
  employee_id: string;
  supervisor_id?: string;
  destination: string;
  start_date: Date;
  end_date: Date;
  purpose: string;
  accommodation: string;
  transportation: string;
  cash_advance: number;
  cost_center: string;
  department: string;
  notes?: string;
}

export const useBusinessTrips = () => {
  return useQuery({
    queryKey: ['business_trips'],
    queryFn: async (): Promise<BusinessTripWithRelations[]> => {
      console.log('Fetching business trips...');
      
      const { data, error } = await supabase
        .from('business_trips')
        .select(`
          *,
          employees (
            *,
            companies (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching business trips:', error);
        throw new Error(error.message);
      }

      console.log('Business trips fetched:', data);
      return data as BusinessTripWithRelations[];
    },
  });
};

export const useCreateBusinessTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tripData: BusinessTripFormData) => {
      console.log('Creating business trip with data:', tripData);
      
      // Map form data to database schema
      const businessTripData: TablesInsert<'business_trips'> = {
        trip_number: `TRIP-${Date.now()}`,
        employee_id: tripData.employee_id,
        destination: tripData.destination,
        start_date: tripData.start_date.toISOString().split('T')[0],
        end_date: tripData.end_date.toISOString().split('T')[0],
        purpose: tripData.purpose,
        accommodation: tripData.accommodation,
        transportation: tripData.transportation,
        cash_advance: tripData.cash_advance,
        notes: tripData.notes || null,
        status: 'Submitted'
      };

      const { data, error } = await supabase
        .from('business_trips')
        .insert([businessTripData])
        .select(`
          *,
          employees (
            *,
            companies (*)
          )
        `)
        .single();

      if (error) {
        console.error('Error creating business trip:', error);
        throw new Error(error.message || 'Gagal membuat perjalanan dinas');
      }

      console.log('Business trip created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_trips'] });
    },
  });
};

export const useUpdateBusinessTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, ...updates }: { id: string; status?: string } & Partial<BusinessTripFormData>) => {
      console.log('Updating business trip:', id, 'with status:', status, 'and data:', updates);
      
      const updateData: TablesUpdate<'business_trips'> = {};
      
      // Handle status update
      if (status) {
        updateData.status = status as any;
      }
      
      // Handle other updates
      if (updates.destination) updateData.destination = updates.destination;
      if (updates.start_date) updateData.start_date = updates.start_date.toISOString().split('T')[0];
      if (updates.end_date) updateData.end_date = updates.end_date.toISOString().split('T')[0];
      if (updates.purpose) updateData.purpose = updates.purpose;
      if (updates.cash_advance !== undefined) updateData.cash_advance = updates.cash_advance;
      if (updates.accommodation) updateData.accommodation = updates.accommodation;
      if (updates.transportation) updateData.transportation = updates.transportation;
      if (updates.notes) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('business_trips')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          employees (
            *,
            companies (*)
          )
        `)
        .single();

      if (error) {
        console.error('Error updating business trip:', error);
        throw new Error(error.message || 'Gagal mengupdate perjalanan dinas');
      }

      console.log('Business trip updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_trips'] });
    },
  });
};

export const useDeleteBusinessTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting business trip:', id);
      
      const { error } = await supabase
        .from('business_trips')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting business trip:', error);
        throw new Error(error.message || 'Gagal menghapus perjalanan dinas');
      }

      console.log('Business trip deleted successfully');
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business_trips'] });
    },
  });
};
