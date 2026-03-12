export interface CreateProductRequest {
  title: string;
  description?: string;
  banner_url?: string | null;
  slug?: string;
  is_published?: boolean;
}

export interface UpdateProductRequest {
  title?: string;
  description?: string;
  banner_url?: string | null;
  slug?: string;
  is_published?: boolean;
  sort_order?: number;
}

export interface ProductWithModuleCount {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  slug: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  modules: { count: number }[];
}

export interface CreateModuleRequest {
  title: string;
  description?: string;
  banner_url?: string | null;
}

export interface UpdateModuleRequest {
  title?: string;
  description?: string;
  banner_url?: string | null;
}

export interface ReorderRequest {
  items: { id: string; sort_order: number }[];
}

export interface ModuleWithLessonCount {
  id: string;
  product_id: string;
  title: string;
  description: string;
  banner_url: string | null;
  sort_order: number;
  created_at: string;
  lessons: { count: number }[];
}

// === Lessons ===

export interface CreateLessonRequest {
  title: string;
  description?: string;
  video_provider: 'youtube' | 'pandavideo';
  video_id?: string;
  pdf_url?: string | null;
  duration_minutes?: number | null;
}

export interface UpdateLessonRequest {
  title?: string;
  description?: string;
  video_provider?: 'youtube' | 'pandavideo';
  video_id?: string;
  pdf_url?: string | null;
  duration_minutes?: number | null;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// === Members ===

export interface MemberWithAccessCount {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'member' | 'admin';
  created_at: string;
  updated_at: string;
  member_access: { count: number }[];
}

export interface MemberAccessWithProduct {
  id: string;
  profile_id: string;
  product_id: string;
  granted_at: string;
  granted_by: 'webhook' | 'manual';
  transaction_id: string | null;
  products: {
    id: string;
    title: string;
    slug: string;
    banner_url: string | null;
  };
}

export interface MemberListParams {
  search?: string;
  product_id?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GrantAccessRequest {
  product_id: string;
}
