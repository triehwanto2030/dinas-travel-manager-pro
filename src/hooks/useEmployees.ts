
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Employee = Tables<'employees'>;
type Company = Tables<'companies'>;

export interface EmployeeWithCompany extends Employee {
  companies: Company;
}

export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async (): Promise<EmployeeWithCompany[]> => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          companies (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data as EmployeeWithCompany[];
    },
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: TablesInsert<'employees'>) => {
      console.log('Creating employee with data:', employee);
      
      // Find company_id based on company name
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('name', employee.namaPerusahaan)
        .single();

      if (companyError) {
        console.error('Error finding company:', companyError);
        throw new Error('Perusahaan tidak ditemukan');
      }

      // Prepare employee data for database
      const employeeData = {
        id: employee.id,
        name: employee.nama,
        email: employee.email,
        phone: employee.phone,
        join_date: employee.tanggalBergabung,
        department: employee.departemen,
        position: employee.posisi,
        grade: employee.grade,
        status: employee.status as 'Aktif' | 'Tidak Aktif',
        company_id: companies.id,
        supervisor_id: employee.supervisorId || null,
        avatar_url: employee.fotoUrl || null
      };

      const { data, error } = await supabase
        .from('employees')
        .insert([employeeData])
        .select(`
          *,
          companies (*)
        `)
        .single();

      if (error) {
        console.error('Error creating employee:', error);
        if (error.code === '23505') {
          if (error.message.includes('email')) {
            throw new Error('Email sudah digunakan oleh karyawan lain');
          } else if (error.message.includes('id')) {
            throw new Error('ID Karyawan sudah digunakan');
          }
        }
        throw new Error(error.message);
      }

      console.log('Employee created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'employees'> & { id: string }) => {
      console.log('Updating employee:', id, 'with data:', updates);
      
      // Find company_id if namaPerusahaan is provided
      let company_id = updates.company_id;
      if (updates.namaPerusahaan) {
        const { data: companies, error: companyError } = await supabase
          .from('companies')
          .select('id')
          .eq('name', updates.namaPerusahaan)
          .single();

        if (companyError) {
          console.error('Error finding company:', companyError);
          throw new Error('Perusahaan tidak ditemukan');
        }
        company_id = companies.id;
      }

      // Prepare update data
      const updateData: any = {};
      if (updates.nama) updateData.name = updates.nama;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.tanggalBergabung) updateData.join_date = updates.tanggalBergabung;
      if (updates.departemen) updateData.department = updates.departemen;
      if (updates.posisi) updateData.position = updates.posisi;
      if (updates.grade) updateData.grade = updates.grade;
      if (updates.status) updateData.status = updates.status;
      if (company_id) updateData.company_id = company_id;
      if (updates.supervisorId !== undefined) updateData.supervisor_id = updates.supervisorId || null;
      if (updates.fotoUrl !== undefined) updateData.avatar_url = updates.fotoUrl || null;

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          companies (*)
        `)
        .single();

      if (error) {
        console.error('Error updating employee:', error);
        if (error.code === '23505') {
          if (error.message.includes('email')) {
            throw new Error('Email sudah digunakan oleh karyawan lain');
          }
        }
        throw new Error(error.message);
      }

      console.log('Employee updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting employee:', id);
      
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting employee:', error);
        throw new Error(error.message);
      }

      console.log('Employee deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
};
