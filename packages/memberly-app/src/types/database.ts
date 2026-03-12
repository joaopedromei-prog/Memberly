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
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          title: string;
          description?: string;
          banner_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          title?: string;
          description?: string;
          banner_url?: string | null;
          sort_order?: number;
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
        };
        Insert: {
          id?: string;
          profile_id: string;
          lesson_id: string;
          completed?: boolean;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          lesson_id?: string;
          completed?: boolean;
          completed_at?: string | null;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
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
