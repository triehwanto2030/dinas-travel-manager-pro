export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      business_trips: {
        Row: {
          company_id: string
          created_at: string
          destination: string
          employee_id: string
          end_date: string
          estimated_budget: number | null
          id: string
          purpose: string
          start_date: string
          status: Database["public"]["Enums"]["status_perjalanan"]
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          destination: string
          employee_id: string
          end_date: string
          estimated_budget?: number | null
          id?: string
          purpose: string
          start_date: string
          status?: Database["public"]["Enums"]["status_perjalanan"]
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          destination?: string
          employee_id?: string
          end_date?: string
          estimated_budget?: number | null
          id?: string
          purpose?: string
          start_date?: string
          status?: Database["public"]["Enums"]["status_perjalanan"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_trips_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_trips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          department: string
          email: string
          grade: Database["public"]["Enums"]["grade_karyawan"]
          id: string
          join_date: string
          name: string
          phone: string | null
          position: string
          status: Database["public"]["Enums"]["status_karyawan"]
          supervisor_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          department: string
          email: string
          grade: Database["public"]["Enums"]["grade_karyawan"]
          id: string
          join_date: string
          name: string
          phone?: string | null
          position: string
          status?: Database["public"]["Enums"]["status_karyawan"]
          supervisor_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          department?: string
          email?: string
          grade?: Database["public"]["Enums"]["grade_karyawan"]
          id?: string
          join_date?: string
          name?: string
          phone?: string | null
          position?: string
          status?: Database["public"]["Enums"]["status_karyawan"]
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
          company_id: string
          created_at: string
          hr_manager_id: string | null
          id: string
          spv_ga_id: string | null
          staff_fa_id: string | null
          staff_ga_id: string | null
          supervisor_id: string | null
          updated_at: string
        }
        Insert: {
          bod_id?: string | null
          company_id: string
          created_at?: string
          hr_manager_id?: string | null
          id?: string
          spv_ga_id?: string | null
          staff_fa_id?: string | null
          staff_ga_id?: string | null
          supervisor_id?: string | null
          updated_at?: string
        }
        Update: {
          bod_id?: string | null
          company_id?: string
          created_at?: string
          hr_manager_id?: string | null
          id?: string
          spv_ga_id?: string | null
          staff_fa_id?: string | null
          staff_ga_id?: string | null
          supervisor_id?: string | null
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
            isOneToOne: true
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
          {
            foreignKeyName: "line_approvals_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_claims: {
        Row: {
          approved_at: string | null
          created_at: string
          employee_id: string
          id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["status_claim"]
          submitted_at: string | null
          total_amount: number
          trip_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          created_at?: string
          employee_id: string
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["status_claim"]
          submitted_at?: string | null
          total_amount?: number
          trip_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          created_at?: string
          employee_id?: string
          id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["status_claim"]
          submitted_at?: string | null
          total_amount?: number
          trip_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      grade_karyawan:
        | "1A"
        | "1B"
        | "2A"
        | "2B"
        | "2C"
        | "3A"
        | "3B"
        | "3C"
        | "4A"
        | "4B"
        | "4C"
        | "5A"
        | "5B"
        | "5C"
        | "6A"
        | "6B"
      status_claim: "Draft" | "Submitted" | "Approved" | "Rejected" | "Paid"
      status_karyawan: "Aktif" | "Tidak Aktif"
      status_perjalanan:
        | "Draft"
        | "Submitted"
        | "Approved"
        | "Rejected"
        | "Completed"
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
    Enums: {
      grade_karyawan: [
        "1A",
        "1B",
        "2A",
        "2B",
        "2C",
        "3A",
        "3B",
        "3C",
        "4A",
        "4B",
        "4C",
        "5A",
        "5B",
        "5C",
        "6A",
        "6B",
      ],
      status_claim: ["Draft", "Submitted", "Approved", "Rejected", "Paid"],
      status_karyawan: ["Aktif", "Tidak Aktif"],
      status_perjalanan: [
        "Draft",
        "Submitted",
        "Approved",
        "Rejected",
        "Completed",
      ],
    },
  },
} as const
