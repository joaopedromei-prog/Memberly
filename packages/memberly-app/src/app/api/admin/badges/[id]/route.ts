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
    .from('badges')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return apiError('NOT_FOUND', 'Badge not found', 404);
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

  if (body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      return apiError('VALIDATION_ERROR', 'Name cannot be empty', 400);
    }
    updateData.name = (body.name as string).trim();
  }
  if (body.description !== undefined) updateData.description = body.description;
  if (body.icon_url !== undefined) updateData.icon_url = body.icon_url;
  if (body.active !== undefined) updateData.active = body.active;

  if (body.criteria_type !== undefined || body.threshold !== undefined) {
    // If updating criteria, we need to build the full criteria object
    // First fetch current badge to merge
    const { data: current, error: fetchError } = await supabase
      .from('badges')
      .select('criteria')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return apiError('NOT_FOUND', 'Badge not found', 404);
      }
      return apiError('FETCH_ERROR', fetchError.message, 500);
    }

    const currentCriteria = current.criteria as Record<string, unknown>;
    const criteriaType = (body.criteria_type as string) ?? currentCriteria.type;
    const threshold = typeof body.threshold === 'number' ? body.threshold : (currentCriteria.threshold as number);

    const validCriteria = [
      'FIRST_LESSON',
      'COURSE_COMPLETE',
      'STREAK_7',
      'STREAK_30',
      'COMMENTS_10',
      'EXPLORER_3',
      'LESSONS_50',
    ];
    if (!validCriteria.includes(criteriaType as string)) {
      return apiError('VALIDATION_ERROR', `Invalid criteria type: ${criteriaType}`, 400);
    }

    updateData.criteria = { type: criteriaType, threshold };
  }

  if (Object.keys(updateData).length === 0) {
    return apiError('VALIDATION_ERROR', 'No fields to update', 400);
  }

  const { data, error } = await supabase
    .from('badges')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return apiError('NOT_FOUND', 'Badge not found', 404);
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

  // Count members who have this badge for informational purposes
  const { count: memberCount } = await supabase
    .from('member_badges')
    .select('id', { count: 'exact', head: true })
    .eq('badge_id', id);

  const { error } = await supabase.from('badges').delete().eq('id', id);

  if (error) {
    return apiError('DELETE_ERROR', error.message, 500);
  }

  return apiSuccess({ deleted: true, members_affected: memberCount ?? 0 });
}
