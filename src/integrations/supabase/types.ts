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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      apartments: {
        Row: {
          assigned_client_ids: string[]
          created_at: string
          description: string | null
          id: string
          link: string
        }
        Insert: {
          assigned_client_ids?: string[]
          created_at?: string
          description?: string | null
          id?: string
          link: string
        }
        Update: {
          assigned_client_ids?: string[]
          created_at?: string
          description?: string | null
          id?: string
          link?: string
        }
        Relationships: []
      }
      case_documents: {
        Row: {
          case_id: string
          created_at: string
          document_type: string
          file_url: string | null
          id: string
          label: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["document_status"]
          validated_at: string | null
        }
        Insert: {
          case_id: string
          created_at?: string
          document_type: string
          file_url?: string | null
          id?: string
          label: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          validated_at?: string | null
        }
        Update: {
          case_id?: string
          created_at?: string
          document_type?: string
          file_url?: string | null
          id?: string
          label?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_staff_notes: {
        Row: {
          case_id: string
          created_at: string
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          case_id: string
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          case_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_staff_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_status_history: {
        Row: {
          case_id: string
          changed_by: string | null
          created_at: string
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["case_status"]
        }
        Insert: {
          case_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status: Database["public"]["Enums"]["case_status"]
        }
        Update: {
          case_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["case_status"]
        }
        Relationships: [
          {
            foreignKeyName: "case_status_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          client_id: string
          close_reason: string | null
          closed_at: string | null
          contract_data: Json | null
          created_at: string
          id: string
          initial_criteria: Json | null
          status: Database["public"]["Enums"]["case_status"]
          updated_at: string
        }
        Insert: {
          client_id: string
          close_reason?: string | null
          closed_at?: string | null
          contract_data?: Json | null
          created_at?: string
          id?: string
          initial_criteria?: Json | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Update: {
          client_id?: string
          close_reason?: string | null
          closed_at?: string | null
          contract_data?: Json | null
          created_at?: string
          id?: string
          initial_criteria?: Json | null
          status?: Database["public"]["Enums"]["case_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_stage_views: {
        Row: {
          case_id: string
          id: string
          last_viewed_at: string
          stage: number
          user_id: string
        }
        Insert: {
          case_id: string
          id?: string
          last_viewed_at?: string
          stage: number
          user_id: string
        }
        Update: {
          case_id?: string
          id?: string
          last_viewed_at?: string
          stage?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_stage_views_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signatures: {
        Row: {
          case_id: string
          client_date_of_birth: string | null
          client_full_name: string | null
          client_initials: string | null
          client_nationality: string | null
          device_info: Json | null
          id: string
          ip_address: string | null
          signature_image: string
          signed_at: string
          user_agent: string | null
        }
        Insert: {
          case_id: string
          client_date_of_birth?: string | null
          client_full_name?: string | null
          client_initials?: string | null
          client_nationality?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: string | null
          signature_image: string
          signed_at?: string
          user_agent?: string | null
        }
        Update: {
          case_id?: string
          client_date_of_birth?: string | null
          client_full_name?: string | null
          client_initials?: string | null
          client_nationality?: string | null
          device_info?: Json | null
          id?: string
          ip_address?: string | null
          signature_image?: string
          signed_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      housing_applications: {
        Row: {
          budget: string | null
          created_at: string
          duration: string | null
          email: string
          furnished: boolean | null
          id: string
          moving_date: string | null
          name: string
          near_transport: boolean | null
          neighbourhood: string | null
          notes: string | null
          pets_allowed: boolean | null
          phone: string | null
          privacy_accepted: boolean | null
          property_type: string | null
          roommate_preference: string | null
          rooms: string | null
          smoking_allowed: boolean | null
          university: string | null
        }
        Insert: {
          budget?: string | null
          created_at?: string
          duration?: string | null
          email: string
          furnished?: boolean | null
          id?: string
          moving_date?: string | null
          name: string
          near_transport?: boolean | null
          neighbourhood?: string | null
          notes?: string | null
          pets_allowed?: boolean | null
          phone?: string | null
          privacy_accepted?: boolean | null
          property_type?: string | null
          roommate_preference?: string | null
          rooms?: string | null
          smoking_allowed?: boolean | null
          university?: string | null
        }
        Update: {
          budget?: string | null
          created_at?: string
          duration?: string | null
          email?: string
          furnished?: boolean | null
          id?: string
          moving_date?: string | null
          name?: string
          near_transport?: boolean | null
          neighbourhood?: string | null
          notes?: string | null
          pets_allowed?: boolean | null
          phone?: string | null
          privacy_accepted?: boolean | null
          property_type?: string | null
          roommate_preference?: string | null
          rooms?: string | null
          smoking_allowed?: boolean | null
          university?: string | null
        }
        Relationships: []
      }
      key_handover: {
        Row: {
          case_id: string
          confirmed_by_client: boolean | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          id: string
          location: string | null
          notes: string | null
          scheduled_date: string | null
          scheduled_time: string | null
        }
        Insert: {
          case_id: string
          confirmed_by_client?: boolean | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
        }
        Update: {
          case_id?: string
          confirmed_by_client?: boolean | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "key_handover_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: true
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          additional_notes: string | null
          budget_max: number | null
          budget_min: number | null
          city: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          move_in_date: string | null
          phone: string | null
          rooms: string | null
        }
        Insert: {
          additional_notes?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          move_in_date?: string | null
          phone?: string | null
          rooms?: string | null
        }
        Update: {
          additional_notes?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          move_in_date?: string | null
          phone?: string | null
          rooms?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          client_type: Database["public"]["Enums"]["client_type"] | null
          company_school: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          client_type?: Database["public"]["Enums"]["client_type"] | null
          company_school?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          user_id: string
        }
        Update: {
          client_type?: Database["public"]["Enums"]["client_type"] | null
          company_school?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      property_proposals: {
        Row: {
          address: string | null
          agency_info: string | null
          case_id: string
          charges: number | null
          client_status: Database["public"]["Enums"]["proposal_status"] | null
          client_visit_questions: string | null
          created_at: string
          description: string | null
          id: string
          listing_status: Database["public"]["Enums"]["listing_status"]
          neighbourhood: string | null
          photo_positions: Json | null
          photos: string[] | null
          property_type: string | null
          rejection_notes: string | null
          rejection_reasons: string[] | null
          rent: number | null
          rooms: number | null
          size_sqm: number | null
          tags: string[] | null
          visit_cons: string[] | null
          visit_photos: string[] | null
          visit_pros: string[] | null
          visit_published: boolean | null
        }
        Insert: {
          address?: string | null
          agency_info?: string | null
          case_id: string
          charges?: number | null
          client_status?: Database["public"]["Enums"]["proposal_status"] | null
          client_visit_questions?: string | null
          created_at?: string
          description?: string | null
          id?: string
          listing_status?: Database["public"]["Enums"]["listing_status"]
          neighbourhood?: string | null
          photo_positions?: Json | null
          photos?: string[] | null
          property_type?: string | null
          rejection_notes?: string | null
          rejection_reasons?: string[] | null
          rent?: number | null
          rooms?: number | null
          size_sqm?: number | null
          tags?: string[] | null
          visit_cons?: string[] | null
          visit_photos?: string[] | null
          visit_pros?: string[] | null
          visit_published?: boolean | null
        }
        Update: {
          address?: string | null
          agency_info?: string | null
          case_id?: string
          charges?: number | null
          client_status?: Database["public"]["Enums"]["proposal_status"] | null
          client_visit_questions?: string | null
          created_at?: string
          description?: string | null
          id?: string
          listing_status?: Database["public"]["Enums"]["listing_status"]
          neighbourhood?: string | null
          photo_positions?: Json | null
          photos?: string[] | null
          property_type?: string | null
          rejection_notes?: string | null
          rejection_reasons?: string[] | null
          rent?: number | null
          rooms?: number | null
          size_sqm?: number | null
          tags?: string[] | null
          visit_cons?: string[] | null
          visit_photos?: string[] | null
          visit_pros?: string[] | null
          visit_published?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "property_proposals_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_submissions: {
        Row: {
          created_at: string
          id: string
          ip_address: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      stage_notifications: {
        Row: {
          case_id: string
          id: string
          metadata: Json | null
          notification_type: string
          stage: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          case_id: string
          id?: string
          metadata?: Json | null
          notification_type?: string
          stage: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          case_id?: string
          id?: string
          metadata?: Json | null
          notification_type?: string
          stage?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stage_notifications_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visit_videos: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          proposal_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          proposal_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          proposal_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_videos_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "property_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          id: string
          phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          phone: string
        }
        Update: {
          created_at?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      waitlist_tokens: {
        Row: {
          created_at: string
          id: string
          name: string | null
          phone: string | null
          token: string
          url: string | null
          used: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          token?: string
          url?: string | null
          used?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          phone?: string | null
          token?: string
          url?: string | null
          used?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      client_update_document_file: {
        Args: { p_document_id: string; p_file_url: string }
        Returns: undefined
      }
      client_update_proposal_feedback: {
        Args: {
          p_client_status: Database["public"]["Enums"]["proposal_status"]
          p_client_visit_questions?: string
          p_proposal_id: string
          p_rejection_notes?: string
          p_rejection_reasons?: string[]
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      sign_contract: {
        Args: { p_case_id: string; p_contract_data: Json }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
      case_status:
        | "request_received"
        | "search_in_progress"
        | "proposals_available"
        | "visit_in_progress"
        | "documents_preparation"
        | "application_review"
        | "key_handover_scheduled"
        | "closed"
      client_type: "student" | "employee" | "other"
      document_status: "missing" | "uploaded" | "validated" | "rejected"
      listing_status: "research" | "viewings" | "documents" | "completed"
      proposal_status: "pending" | "liked" | "rejected"
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
      app_role: ["admin", "user"],
      case_status: [
        "request_received",
        "search_in_progress",
        "proposals_available",
        "visit_in_progress",
        "documents_preparation",
        "application_review",
        "key_handover_scheduled",
        "closed",
      ],
      client_type: ["student", "employee", "other"],
      document_status: ["missing", "uploaded", "validated", "rejected"],
      listing_status: ["research", "viewings", "documents", "completed"],
      proposal_status: ["pending", "liked", "rejected"],
    },
  },
} as const
