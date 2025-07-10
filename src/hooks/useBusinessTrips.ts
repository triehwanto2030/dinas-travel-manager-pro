
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
        throw new Error(error.message);
      }

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
        employee_id: tripData.employee_id,
        company_id: tripData.cost_center,
        destination: tripData.destination,
        start_date: tripData.start_date.toISOString().split('T')[0],
        end_date: tripData.end_date.toISOString().split('T')[0],
        purpose: tripData.purpose,
        estimated_budget: tripData.cash_advance,
        status: 'Submitted' as any
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
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<BusinessTripFormData>) => {
      console.log('Updating business trip:', id, 'with data:', updates);
      
      const updateData: TablesUpdate<'business_trips'> = {};
      if (updates.destination) updateData.destination = updates.destination;
      if (updates.start_date) updateData.start_date = updates.start_date.toISOString().split('T')[0];
      if (updates.end_date) updateData.end_date = updates.end_date.toISOString().split('T')[0];
      if (updates.purpose) updateData.purpose = updates.purpose;
      if (updates.cash_advance) updateData.estimated_budget = updates.cash_advance;
      if (updates.cost_center) updateData.company_id = updates.cost_center;

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
