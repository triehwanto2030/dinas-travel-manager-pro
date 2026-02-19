
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type BusinessTrip = Tables<'business_trips'>;
type Employee = Tables<'employees'>;
type Company = Tables<'companies'>;
type DynamicFilter = [fField: string, fVal: string, opr?: FilterOperator][];

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'notIn';

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
  status?: string;
  department: string;
  notes?: string;
  created_at?: string;
  current_approval_step?: string | null;
  rejection_reason?: string;
  supervisor_approved_at?: string | null;
  staff_ga_approved_at?: string | null;
  spv_ga_approved_at?: string | null;
  hr_manager_approved_at?: string | null;
  bod_approved_at?: string | null;
  staff_fa_approved_at?: string | null;
  supervisor_approved_by?: string | null;
  staff_ga_approved_by?: string | null;
  spv_ga_approved_by?: string | null;
  hr_manager_approved_by?: string | null;
  bod_approved_by?: string | null;
  staff_fa_approved_by?: string | null;
  rejected_at?: string | null;
  rejected_by?: string | null;
}

export const useBusinessTrips = (filters?: DynamicFilter) => {
  return useQuery({
    queryKey: ['business_trips', filters],
    queryFn: async (): Promise<BusinessTripWithRelations[]> => {
      console.log('Fetching business trips... filter:', filters); 
      
      let query: any = supabase
        .from('business_trips')
        .select(`
          *,
          employees (
            *,
            companies (*)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.length) {
        filters.forEach(([field, value, operator]) => {
          if (operator && operator !== 'like' && operator !== 'in' && operator !== 'notIn') {
            query = query[operator](field, value);
          } else if (operator === 'in' || operator === 'notIn') {
            query = query[operator](field, Array.isArray(value) ? value : [value]);
          } else if (operator === 'like') {
            query = query.ilike(field, `%${value}%`);
          } else {
            query = query.eq(field, value);
          }
        });
      }
      
      const { data, error } = await query;

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

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return useMutation({
    mutationFn: async (tripData: BusinessTripFormData) => {
      console.log('Creating business trip with data:', tripData);
      
      // Map form data to database schema
      const businessTripData: TablesInsert<'business_trips'> = {
        trip_number: `TRIP-${Date.now()}`,
        employee_id: tripData.employee_id,
        destination: tripData.destination,
        start_date: formatLocalDate(tripData.start_date),
        end_date: formatLocalDate(tripData.end_date),
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

      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const updateData: TablesUpdate<'business_trips'> = {};
      
      // Handle status update
      if (status) {
        updateData.status = status as any;
      }
      
      // Handle other updates
      if (updates.destination) updateData.destination = updates.destination;
      if (updates.start_date) updateData.start_date = formatLocalDate(updates.start_date);
      if (updates.end_date) updateData.end_date = formatLocalDate(updates.end_date);
      if (updates.purpose) updateData.purpose = updates.purpose;
      if (updates.cash_advance !== undefined) updateData.cash_advance = updates.cash_advance;
      if (updates.accommodation) updateData.accommodation = updates.accommodation;
      if (updates.transportation) updateData.transportation = updates.transportation;
      if (updates.notes) updateData.notes = updates.notes;
      if (updates.current_approval_step !== undefined) updateData.current_approval_step = updates.current_approval_step;
      if (updates.supervisor_approved_at) updateData.supervisor_approved_at = updates.supervisor_approved_at;
      if (updates.staff_ga_approved_at) updateData.staff_ga_approved_at = updates.staff_ga_approved_at;
      if (updates.spv_ga_approved_at) updateData.spv_ga_approved_at = updates.spv_ga_approved_at;
      if (updates.hr_manager_approved_at) updateData.hr_manager_approved_at = updates.hr_manager_approved_at;
      if (updates.bod_approved_at) updateData.bod_approved_at = updates.bod_approved_at;
      if (updates.staff_fa_approved_at) updateData.staff_fa_approved_at = updates.staff_fa_approved_at;
      if (updates.supervisor_approved_by) updateData.supervisor_approved_by = updates.supervisor_approved_by;
      if (updates.staff_ga_approved_by) updateData.staff_ga_approved_by = updates.staff_ga_approved_by;
      if (updates.spv_ga_approved_by) updateData.spv_ga_approved_by = updates.spv_ga_approved_by;
      if (updates.hr_manager_approved_by) updateData.hr_manager_approved_by = updates.hr_manager_approved_by;
      if (updates.bod_approved_by) updateData.bod_approved_by = updates.bod_approved_by;
      if (updates.staff_fa_approved_by) updateData.staff_fa_approved_by = updates.staff_fa_approved_by;
      if (updates.rejected_at) updateData.rejected_at = updates.rejected_at;
      if (updates.rejected_by) updateData.rejected_by = updates.rejected_by;
      if (updates.rejection_reason) updateData.rejection_reason = updates.rejection_reason;

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

// export const useUpdateTripApproval = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async ({ id, status, ...updates }: { id: string; status?: string } & Partial<BusinessTripFormData>) => {
//       console.log('Updating business trip:', id, 'with status:', status, 'and data:', updates);

//       const formatLocalDate = (date: Date) => {
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         return `${year}-${month}-${day}`;
//       };
      
//       const updateData: TablesUpdate<'business_trips'> = {};
      
//       // Handle status update
//       if (status) {
//         updateData.status = status as any;
//       }
      
//       // Handle other updates
//       if (updates.destination) updateData.destination = updates.destination;
//       if (updates.start_date) updateData.start_date = formatLocalDate(updates.start_date);
//       if (updates.end_date) updateData.end_date = formatLocalDate(updates.end_date);
//       if (updates.purpose) updateData.purpose = updates.purpose;
//       if (updates.cash_advance !== undefined) updateData.cash_advance = updates.cash_advance;
//       if (updates.accommodation) updateData.accommodation = updates.accommodation;
//       if (updates.transportation) updateData.transportation = updates.transportation;
//       if (updates.notes) updateData.notes = updates.notes;
//       if (updates.rejection_reason) updateData.rejection_reason = updates.rejection_reason;

//       const { data, error } = await supabase
//         .from('business_trips')
//         .update(updateData)
//         .eq('id', id)
//         .select(`
//           *,
//           employees (
//             *,
//             companies (*)
//           )
//         `)
//         .single();

//       if (error) {
//         console.error('Error updating business trip:', error);
//         throw new Error(error.message || 'Gagal mengupdate perjalanan dinas');
//       }

//       console.log('Business trip updated successfully:', data);
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['business_trips'] });
//     },
//   });
// };

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
