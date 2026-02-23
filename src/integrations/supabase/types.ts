export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      business_trips: {
        Row: {
          accommodation: string | null
          bod_approved_at: string | null
          bod_approved_by: string | null
          cash_advance: number | null
          cost_center: string | null
          created_at: string
          current_approval_step: string | null
          destination: string
          employee_id: string | null
          end_date: string
          hr_manager_approved_at: string | null
          hr_manager_approved_by: string | null
          id: string
          notes: string | null
          purpose: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          staff_fa_approved_at: string | null
          staff_fa_approved_by: string | null
          spv_ga_approved_at: string | null
          spv_ga_approved_by: string | null
          staff_ga_approved_at: string | null
          staff_ga_approved_by: string | null
          start_date: string
          status: string
          supervisor_approved_at: string | null
          supervisor_approved_by: string | null
          transportation: string | null
          trip_number: string
          updated_at: string
        }
        Insert: {
          accommodation?: string | null
          bod_approved_at?: string | null
          bod_approved_by?: string | null
          cash_advance?: number | null
          cost_center?: string | null
          created_at?: string
          current_approval_step?: string | null
          destination: string
          employee_id?: string | null
          end_date: string
          hr_manager_approved_at?: string | null
          hr_manager_approved_by?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          staff_fa_approved_at?: string | null
          staff_fa_approved_by?: string | null
          spv_ga_approved_at?: string | null
          spv_ga_approved_by?: string | null
          staff_ga_approved_at?: string | null
          staff_ga_approved_by?: string | null
          start_date: string
          status?: string
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          transportation?: string | null
          trip_number: string
          updated_at?: string
        }
        Update: {
          accommodation?: string | null
          bod_approved_at?: string | null
          bod_approved_by?: string | null
          cash_advance?: number | null
          cost_center?: string | null
          created_at?: string
          current_approval_step?: string | null
          destination?: string
          employee_id?: string | null
          end_date?: string
          hr_manager_approved_at?: string | null
          hr_manager_approved_by?: string | null
          id?: string
          notes?: string | null
          purpose?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          staff_fa_approved_at?: string | null
          staff_fa_approved_by?: string | null
          spv_ga_approved_at?: string | null
          spv_ga_approved_by?: string | null
          staff_ga_approved_at?: string | null
          staff_ga_approved_by?: string | null
          start_date?: string
          status?: string
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          transportation?: string | null
          trip_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_trips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_expenses: {
        Row: {
          created_at: string
          description: string | null
          expense_amount: number | null
          expense_date: string | null
          expense_type: string | null
          id: string
          trip_claim_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expense_amount?: number | null
          expense_date?: string | null
          expense_type?: string | null
          id?: string
          trip_claim_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expense_amount?: number | null
          expense_date?: string | null
          expense_type?: string | null
          id?: string
          trip_claim_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          code: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          code?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          code?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_departments: {
        Row: {
          company_id: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_grades: {
        Row: {
          code: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          company_id: string | null
          created_at: string
          department: string | null
          email: string | null
          employee_id: string
          grade: string | null
          id: string
          name: string
          phone: string | null
          photo_url: string | null
          position: string | null
          supervisor_id: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id: string
          grade?: string | null
          id?: string
          name: string
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          supervisor_id?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id?: string
          grade?: string | null
          id?: string
          name?: string
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          supervisor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      line_approvals: {
        Row: {
          bod_id: string | null
          company_id: string | null
          created_at: string
          hr_manager_id: string | null
          id: string
          spv_ga_id: string | null
          staff_fa_id: string | null
          staff_ga_id: string | null
          updated_at: string
        }
        Insert: {
          bod_id?: string | null
          company_id?: string | null
          created_at?: string
          hr_manager_id?: string | null
          id?: string
          spv_ga_id?: string | null
          staff_fa_id?: string | null
          staff_ga_id?: string | null
          updated_at?: string
        }
        Update: {
          bod_id?: string | null
          company_id?: string | null
          created_at?: string
          hr_manager_id?: string | null
          id?: string
          spv_ga_id?: string | null
          staff_fa_id?: string | null
          staff_ga_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_approvals_bod_id_fkey"
            columns: ["bod_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_approvals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_approvals_hr_manager_id_fkey"
            columns: ["hr_manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_approvals_spv_ga_id_fkey"
            columns: ["spv_ga_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_approvals_staff_fa_id_fkey"
            columns: ["staff_fa_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "line_approvals_staff_ga_id_fkey"
            columns: ["staff_ga_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      trip_claims: {
        Row: {
          bod_approved_at: string | null
          bod_approved_by: string | null
          claim_number: string | null
          created_at: string
          current_approval_step: string | null
          employee_id: string | null
          hr_manager_approved_at: string | null
          hr_manager_approved_by: string | null
          id: string
          notes: string | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          staff_fa_approved_at: string | null
          staff_fa_approved_by: string | null
          staff_ga_approved_at: string | null
          staff_ga_approved_by: string | null
          spv_ga_approved_at: string | null
          spv_ga_approved_by: string | null
          status: string
          submitted_at: string | null
          supervisor_approved_at: string | null
          supervisor_approved_by: string | null
          total_amount: number | null
          trip_id: string | null
          updated_at: string
        }
        Insert: {
          bod_approved_at?: string | null
          bod_approved_by?: string | null
          claim_number?: string | null
          created_at?: string
          current_approval_step?: string | null
          employee_id?: string | null
          hr_manager_approved_at?: string | null
          hr_manager_approved_by?: string | null
          id?: string
          notes?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          staff_fa_approved_at?: string | null
          staff_fa_approved_by?: string | null
          staff_ga_approved_at?: string | null
          staff_ga_approved_by?: string | null
          spv_ga_approved_at?: string | null
          spv_ga_approved_by?: string | null
          status?: string
          submitted_at?: string | null
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          total_amount?: number | null
          trip_id?: string | null
          updated_at?: string
        }
        Update: {
          bod_approved_at?: string | null
          bod_approved_by?: string | null
          claim_number?: string | null
          created_at?: string
          current_approval_step?: string | null
          employee_id?: string | null
          hr_manager_approved_at?: string | null
          hr_manager_approved_by?: string | null
          id?: string
          notes?: string | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          staff_fa_approved_at?: string | null
          staff_fa_approved_by?: string | null
          staff_ga_approved_at?: string | null
          staff_ga_approved_by?: string | null
          spv_ga_approved_at?: string | null
          spv_ga_approved_by?: string | null
          status?: string
          submitted_at?: string | null
          supervisor_approved_at?: string | null
          supervisor_approved_by?: string | null
          total_amount?: number | null
          trip_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_claims_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_claims_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "business_trips"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          employee_id: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          password_hash: string | null
          role: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email: string
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string | null
          role?: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          password_hash?: string | null
          role?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
