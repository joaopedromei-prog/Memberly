import { apiError, apiSuccess } from '@/lib/utils/api-response';
import { requireAdmin } from '@/lib/utils/auth-guard';
import type { NextRequest } from 'next/server';

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const supabase = auth.data.supabase;
  const body = await request.json();

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return apiError('VALIDATION_ERROR', 'Items array is required', 400);
  }

  const results = await Promise.all(
    body.items.map((item: { id: string; sort_order: number }) =>
      supabase
        .from('lessons')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id)
    )
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) {
    return apiError('REORDER_ERROR', failed.error.message, 500);
  }

  return apiSuccess({ reordered: true });
}
