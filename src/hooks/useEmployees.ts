
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Employee = Tables<'employees'>;
type Company = Tables<'companies'>;

export interface EmployeeWithCompany extends Employee {
  companies: Company;
}

// Interface for form data with Indonesian property names
export interface EmployeeFormData {
  employeeId: string; // This is the employee_id string like "EMP001"
  nama: string;
  email: string;
  phone: string;
  tanggalBergabung: string;
  departemen: string;
  posisi: string;
  grade?: string;
  status: 'Aktif' | 'Tidak Aktif';
  namaPerusahaan: string;
  supervisorId?: string;
  fotoUrl?: string;
  // User account fields
  userUsername?: string;
  userPassword?: string;
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
    mutationFn: async (employee: EmployeeFormData) => {
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

      // Map form data to database schema
      const employeeData: TablesInsert<'employees'> = {
        employee_id: employee.employeeId,
        name: employee.nama,
        email: employee.email,
        phone: employee.phone,
        department: employee.departemen,
        position: employee.posisi,
        grade: employee.grade,
        company_id: companies.id,
        supervisor_id: employee.supervisorId || null,
        photo_url: employee.fotoUrl || null
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

      // Auto-create user account for the new employee
      const username = employee.userUsername || employee.email;
      const password = employee.userPassword || '12345';

      // Call edge function to set password (which hashes it)
      const userInsert = await supabase
        .from('users')
        .insert([{
          email: employee.email,
          username: username,
          employee_id: data.id,
          role: 'user',
          is_active: true,
        }])
        .select()
        .single();

      if (userInsert.error) {
        console.error('Error creating user account:', userInsert.error);
      } else {
        // Set password via edge function
        const { error: pwError } = await supabase.functions.invoke('auth-set-password', {
          body: { user_id: userInsert.data.id, password },
        });
        if (pwError) {
          console.error('Error setting user password:', pwError);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<EmployeeFormData>) => {
      console.log('Updating employee:', id, 'with data:', updates);
      
      // Find company_id if namaPerusahaan is provided
      let company_id;
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

      // Map form data to database schema
      const updateData: TablesUpdate<'employees'> = {};
      if (updates.nama) updateData.name = updates.nama;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.departemen) updateData.department = updates.departemen;
      if (updates.posisi) updateData.position = updates.posisi;
      if (updates.grade) updateData.grade = updates.grade;
      if (company_id) updateData.company_id = company_id;
      if (updates.supervisorId !== undefined) updateData.supervisor_id = updates.supervisorId || null;
      if (updates.fotoUrl !== undefined) updateData.photo_url = updates.fotoUrl || null;

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
