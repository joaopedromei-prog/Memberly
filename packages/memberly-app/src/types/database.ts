export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface LessonAttachment {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          role: 'member' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: 'member' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: 'member' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          description: string;
          banner_url: string | null;
          slug: string;
          is_published: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          banner_url?: string | null;
          slug: string;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          banner_url?: string | null;
          slug?: string;
          is_published?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          product_id: string;
          title: string;
          description: string;
          banner_url: string | null;
          sort_order: number;
          drip_days: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          title: string;
          description?: string;
          banner_url?: string | null;
          sort_order?: number;
          drip_days?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          title?: string;
          description?: string;
          banner_url?: string | null;
          sort_order?: number;
          drip_days?: number | null;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          description: string;
          video_provider: 'youtube' | 'pandavideo';
          video_id: string;
          pdf_url: string | null;
          attachments: LessonAttachment[];
          sort_order: number;
          duration_minutes: number | null;
          drip_days: number | null;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          description?: string;
          video_provider: 'youtube' | 'pandavideo';
          video_id?: string;
          pdf_url?: string | null;
          attachments?: LessonAttachment[];
          sort_order?: number;
          duration_minutes?: number | null;
          drip_days?: number | null;
          is_published?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          module_id?: string;
          title?: string;
          description?: string;
          video_provider?: 'youtube' | 'pandavideo';
          video_id?: string;
          pdf_url?: string | null;
          attachments?: LessonAttachment[];
          sort_order?: number;
          duration_minutes?: number | null;
          drip_days?: number | null;
          is_published?: boolean;
          created_at?: string;
        };
      };
      member_access: {
        Row: {
          id: string;
          profile_id: string;
          product_id: string;
          granted_at: string;
          granted_by: 'webhook' | 'manual';
          transaction_id: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          product_id: string;
          granted_at?: string;
          granted_by?: 'webhook' | 'manual';
          transaction_id?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          product_id?: string;
          granted_at?: string;
          granted_by?: 'webhook' | 'manual';
          transaction_id?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          lesson_id: string;
          profile_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          profile_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          profile_id?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          profile_id: string;
          lesson_id: string;
          completed: boolean;
          completed_at: string | null;
          last_watched_at: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          lesson_id: string;
          completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          lesson_id?: string;
          completed?: boolean;
          completed_at?: string | null;
          last_watched_at?: string | null;
        };
      };
      lesson_bookmarks: {
        Row: {
          id: string;
          profile_id: string;
          lesson_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          lesson_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          lesson_id?: string;
          created_at?: string;
        };
      };
      product_mappings: {
        Row: {
          id: string;
          external_product_id: string;
          product_id: string;
          gateway: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          external_product_id: string;
          product_id: string;
          gateway?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          external_product_id?: string;
          product_id?: string;
          gateway?: string;
          created_at?: string;
        };
      };
      webhook_logs: {
        Row: {
          id: string;
          gateway: string;
          event_type: string;
          payload: Record<string, unknown>;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gateway?: string;
          event_type: string;
          payload: Record<string, unknown>;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gateway?: string;
          event_type?: string;
          payload?: Record<string, unknown>;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          profile_id: string;
          product_id: string;
          certificate_url: string | null;
          hash: string;
          issued_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          product_id: string;
          certificate_url?: string | null;
          hash: string;
          issued_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          product_id?: string;
          certificate_url?: string | null;
          hash?: string;
          issued_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      set_user_role: {
        Args: { user_id: string; new_role: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
}

// Video provider type
export type VideoProvider = 'youtube' | 'pandavideo';

// Convenience types
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Module = Database['public']['Tables']['modules']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type MemberAccess = Database['public']['Tables']['member_access']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type LessonProgress = Database['public']['Tables']['lesson_progress']['Row'];
export type ProductMapping = Database['public']['Tables']['product_mappings']['Row'];
export type LessonBookmark = Database['public']['Tables']['lesson_bookmarks']['Row'];
export type Certificate = Database['public']['Tables']['certificates']['Row'];
export type CertificateInsert = Database['public']['Tables']['certificates']['Insert'];
export type CertificateUpdate = Database['public']['Tables']['certificates']['Update'];
