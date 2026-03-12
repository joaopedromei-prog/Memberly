import { requireAdmin } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { supabase } = auth.data;

  const { data, error } = await supabase
    .from('products')
    .select('*, modules(count)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return apiError('NOT_FOUND', 'Product not found', 404);
    }
    return apiError('FETCH_ERROR', error.message, 500);
  }

  return apiSuccess(data);
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { supabase } = auth.data;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_JSON', 'Request body must be valid JSON', 400);
  }

  const updateData: Record<string, unknown> = {};
  if (body.title !== undefined) updateData.title = body.title;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.banner_url !== undefined) updateData.banner_url = body.banner_url;
  if (body.slug !== undefined) updateData.slug = body.slug;
  if (body.is_published !== undefined) updateData.is_published = body.is_published;
  if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;

  if (Object.keys(updateData).length === 0) {
    return apiError('VALIDATION_ERROR', 'No fields to update', 400);
  }

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return apiError('NOT_FOUND', 'Product not found', 404);
    }
    if (error.code === '23505') {
      return apiError('DUPLICATE_SLUG', 'Slug already exists', 409);
    }
    return apiError('UPDATE_ERROR', error.message, 500);
  }

  return apiSuccess(data);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const { supabase } = auth.data;

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    return apiError('DELETE_ERROR', error.message, 500);
  }

  return apiSuccess({ deleted: true });
}
