export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type AppRole = 'admin' | 'customer';

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.5" };
  public: {
    Tables: {
      services: {
        Row: { id: string; slug: string; name: string; price: number; currency: string; description: string | null; icon: string | null; created_at: string };
        Insert: { id?: string; slug: string; name: string; price: number; currency?: string; description?: string | null; icon?: string | null; created_at?: string };
        Update: Partial<{ slug: string; name: string; price: number; currency: string; description: string | null; icon: string | null }>;
        Relationships: [];
      };
      bookings: {
        Row: { id: string; user_id: string; service_slug: string; service_name: string; price: number; booking_date: string; booking_time: string; address: string; phone: string; customer_name: string | null; notes: string | null; status: BookingStatus; created_at: string };
        Insert: { id?: string; user_id: string; service_slug: string; service_name: string; price: number; booking_date: string; booking_time: string; address: string; phone: string; customer_name?: string | null; notes?: string | null; status?: BookingStatus; created_at?: string };
        Update: Partial<{ status: BookingStatus; notes: string | null }>;
        Relationships: [];
      };
      profiles: {
        Row: { id: string; full_name: string | null; phone: string | null; created_at: string };
        Insert: { id: string; full_name?: string | null; phone?: string | null; created_at?: string };
        Update: Partial<{ full_name: string | null; phone: string | null }>;
        Relationships: [];
      };
      user_roles: {
        Row: { id: string; user_id: string; role: AppRole; created_at: string };
        Insert: { id?: string; user_id: string; role: AppRole; created_at?: string };
        Update: Partial<{ role: AppRole }>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      has_role: { Args: { _user_id: string; _role: AppRole }; Returns: boolean };
    };
    Enums: { app_role: AppRole; booking_status: BookingStatus };
    CompositeTypes: { [_ in never]: never };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> = DefaultSchema["Tables"][T]["Update"];
export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T];
export type CompositeTypes<T extends keyof DefaultSchema["CompositeTypes"]> = DefaultSchema["CompositeTypes"][T];

export const Constants = {
  public: {
    Enums: {
      app_role: ['admin', 'customer'] as const,
      booking_status: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const,
    },
  },
} as const;
