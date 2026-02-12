import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";

type User = Tables<'users'>;
// type Employee = Tables<'employees'>;

export interface UserFormData {
    email: string
    employee_id: string | null
    is_active: boolean
    last_login: string | null
    password_hash: string | null
    role: string
    username: string
}

export interface UserWithEmployee extends User {
  employees: { name: string } | null;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserWithEmployee[]> => {
      const { data, error } = await supabase
        .from('users')
        .select(`*, employees(name)`);

      if (error) {
        throw new Error(error.message);
      }

      return data as UserWithEmployee[];
    },
  });
};