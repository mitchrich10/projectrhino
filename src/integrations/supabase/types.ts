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
      approved_domains: {
        Row: {
          company_name: string
          created_at: string
          domain: string
          id: string
          logo_key: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          domain: string
          id?: string
          logo_key?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          domain?: string
          id?: string
          logo_key?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          id: string
          location: string | null
          recording_path: string | null
          rsvp_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          location?: string | null
          recording_path?: string | null
          rsvp_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          location?: string | null
          recording_path?: string | null
          rsvp_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      founder_onboarding: {
        Row: {
          additional_contacts: Json | null
          announcing_raise: string | null
          batch_id: string
          brand_guidelines_path: string | null
          completed: boolean | null
          created_at: string
          feature_company: boolean | null
          id: string
          logo_path: string | null
          primary_color: string | null
          priorities: string[] | null
          priorities_notes: string | null
          priorities_other: string | null
          priority_context: Json | null
          rhino_assistance: string | null
          secondary_color: string | null
          tagline: string | null
          tech_stack: Json | null
          updated_at: string
        }
        Insert: {
          additional_contacts?: Json | null
          announcing_raise?: string | null
          batch_id: string
          brand_guidelines_path?: string | null
          completed?: boolean | null
          created_at?: string
          feature_company?: boolean | null
          id?: string
          logo_path?: string | null
          primary_color?: string | null
          priorities?: string[] | null
          priorities_notes?: string | null
          priorities_other?: string | null
          priority_context?: Json | null
          rhino_assistance?: string | null
          secondary_color?: string | null
          tagline?: string | null
          tech_stack?: Json | null
          updated_at?: string
        }
        Update: {
          additional_contacts?: Json | null
          announcing_raise?: string | null
          batch_id?: string
          brand_guidelines_path?: string | null
          completed?: boolean | null
          created_at?: string
          feature_company?: boolean | null
          id?: string
          logo_path?: string | null
          primary_color?: string | null
          priorities?: string[] | null
          priorities_notes?: string | null
          priorities_other?: string | null
          priority_context?: Json | null
          rhino_assistance?: string | null
          secondary_color?: string | null
          tagline?: string | null
          tech_stack?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      founder_onboarding_shares: {
        Row: {
          batch_id: string
          created_at: string
          created_by: string
          id: string
          target_step: number | null
          token: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          created_by: string
          id?: string
          target_step?: number | null
          token?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          created_by?: string
          id?: string
          target_step?: number | null
          token?: string
        }
        Relationships: []
      }
      founder_onboarding_step_completions: {
        Row: {
          batch_id: string
          completed_at: string
          id: string
          step_number: number
          user_email: string
          user_id: string
          user_name: string | null
        }
        Insert: {
          batch_id: string
          completed_at?: string
          id?: string
          step_number: number
          user_email: string
          user_id: string
          user_name?: string | null
        }
        Update: {
          batch_id?: string
          completed_at?: string
          id?: string
          step_number?: number
          user_email?: string
          user_id?: string
          user_name?: string | null
        }
        Relationships: []
      }
      notification_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          subscribed: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          subscribed?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          subscribed?: boolean
          user_id?: string
        }
        Relationships: []
      }
      onboarding_invites: {
        Row: {
          batch_id: string
          created_at: string
          email: string
          id: string
          invited_by: string
          note: string | null
        }
        Insert: {
          batch_id?: string
          created_at?: string
          email: string
          id?: string
          invited_by: string
          note?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          note?: string | null
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          batch_id: string | null
          completed_at: string
          created_at: string
          id: string
          step_id: string
          user_id: string
        }
        Insert: {
          batch_id?: string | null
          completed_at?: string
          created_at?: string
          id?: string
          step_id: string
          user_id: string
        }
        Update: {
          batch_id?: string | null
          completed_at?: string
          created_at?: string
          id?: string
          step_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "onboarding_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_steps: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order: number
          resource_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order?: number
          resource_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order?: number
          resource_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_submissions: {
        Row: {
          additional_notes: string | null
          announcing_raise: boolean | null
          company_name: string
          created_at: string
          id: string
          logo_path: string | null
          logo_permission: boolean | null
          needs: string[]
          needs_other: string | null
          team_members: Json
          updated_at: string
          user_email: string
          user_id: string
          wants_rhino_support: boolean | null
        }
        Insert: {
          additional_notes?: string | null
          announcing_raise?: boolean | null
          company_name: string
          created_at?: string
          id?: string
          logo_path?: string | null
          logo_permission?: boolean | null
          needs?: string[]
          needs_other?: string | null
          team_members?: Json
          updated_at?: string
          user_email: string
          user_id: string
          wants_rhino_support?: boolean | null
        }
        Update: {
          additional_notes?: string | null
          announcing_raise?: boolean | null
          company_name?: string
          created_at?: string
          id?: string
          logo_path?: string | null
          logo_permission?: boolean | null
          needs?: string[]
          needs_other?: string | null
          team_members?: Json
          updated_at?: string
          user_email?: string
          user_id?: string
          wants_rhino_support?: boolean | null
        }
        Relationships: []
      }
      partner_requests: {
        Row: {
          company_name: string
          created_at: string
          id: string
          item_id: string | null
          item_name: string
          item_type: string
          notes: string | null
          response: string | null
          status: string
          updated_at: string
          user_email: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          item_id?: string | null
          item_name: string
          item_type: string
          notes?: string | null
          response?: string | null
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          item_id?: string | null
          item_name?: string
          item_type?: string
          notes?: string | null
          response?: string | null
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          approval_required: boolean
          category: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          logo_key: string | null
          logo_url: string | null
          name: string
          promo_code: string | null
          redemption_url: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          approval_required?: boolean
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          logo_key?: string | null
          logo_url?: string | null
          name: string
          promo_code?: string | null
          redemption_url?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          approval_required?: boolean
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          logo_key?: string | null
          logo_url?: string | null
          name?: string
          promo_code?: string | null
          redemption_url?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resources: {
        Row: {
          approval_required: boolean
          category: string
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          approval_required?: boolean
          category?: string
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          approval_required?: boolean
          category?: string
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
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
