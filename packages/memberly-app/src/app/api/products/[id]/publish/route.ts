import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { requireAdmin } from '@/lib/utils/auth-guard';
import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const supabase = auth.data.supabase;

  // Fetch current state
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('is_published')
    .eq('id', id)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      return apiError('NOT_FOUND', 'Product not found', 404);
    }
    return apiError('FETCH_ERROR', fetchError.message, 500);
  }

  // Toggle
  const { data, error } = await supabase
    .from('products')
    .update({ is_published: !product.is_published })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return apiError('UPDATE_ERROR', error.message, 500);
  }

  return apiSuccess(data);
}
