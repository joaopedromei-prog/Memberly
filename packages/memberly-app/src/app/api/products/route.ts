import { requireAdmin } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { slugify } from '@/lib/utils/slugify';
import type { NextRequest } from 'next/server';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { supabase } = auth.data;

  const { data, error } = await supabase
    .from('products')
    .select('*, modules(count)')
    .order('sort_order');

  if (error) {
    return apiError('FETCH_ERROR', error.message, 500);
  }

  return apiSuccess(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { supabase } = auth.data;

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

  const slug = (body.slug as string) || slugify(title);

  const { data, error } = await supabase
    .from('products')
    .insert({
      title: title.trim(),
      description: (body.description as string) ?? '',
      banner_url: (body.banner_url as string) ?? null,
      slug,
      is_published: (body.is_published as boolean) ?? false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return apiError('DUPLICATE_SLUG', `Slug "${slug}" already exists`, 409);
    }
    return apiError('CREATE_ERROR', error.message, 500);
  }

  return apiSuccess(data, 201);
}
