import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { requireAdmin } from '@/lib/utils/auth-guard';
import type { NextRequest } from 'next/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id: productId } = await params;
  const supabase = auth.data.supabase;

  const { data, error } = await supabase
    .from('modules')
    .select('*, lessons(count)')
    .eq('product_id', productId)
    .order('sort_order');

  if (error) {
    return apiError('FETCH_ERROR', error.message, 500);
  }

  return apiSuccess(data);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id: productId } = await params;
  const supabase = auth.data.supabase;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return apiError('INVALID_JSON', 'Request body must be valid JSON', 400);
  }

  const title = body.title as string | undefined;
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return apiError('VALIDATION_ERROR', 'Title is required', 400);
  }

  // Get next sort_order
  const { data: existing } = await supabase
    .from('modules')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder =
    existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from('modules')
    .insert({
      product_id: productId,
      title: title.trim(),
      description: (body.description as string) ?? '',
      banner_url: (body.banner_url as string) ?? null,
      sort_order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    return apiError('CREATE_ERROR', error.message, 500);
  }

  return apiSuccess(data, 201);
}
