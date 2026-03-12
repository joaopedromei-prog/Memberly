import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import type { NextRequest } from 'next/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const body = await request.json();

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return apiError('VALIDATION_ERROR', 'Items array is required', 400);
  }

  for (const item of body.items) {
    const { error } = await supabase
      .from('lessons')
      .update({ sort_order: item.sort_order })
      .eq('id', item.id);

    if (error) return apiError('REORDER_ERROR', error.message, 500);
  }

  return apiSuccess({ reordered: true });
}
