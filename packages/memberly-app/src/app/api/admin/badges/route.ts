import { requireAdmin } from '@/lib/utils/auth-guard';
import { apiError, apiSuccess } from '@/lib/utils/api-response';
import type { NextRequest } from 'next/server';

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { supabase } = auth.data;

  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('created_at', { ascending: false });

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

  const name = body.name as string | undefined;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return apiError('VALIDATION_ERROR', 'Name is required', 400);
  }

  const criteriaType = body.criteria_type as string | undefined;
  if (!criteriaType) {
    return apiError('VALIDATION_ERROR', 'Criteria type is required', 400);
  }

  const validCriteria = [
    'FIRST_LESSON',
    'COURSE_COMPLETE',
    'STREAK_7',
    'STREAK_30',
    'COMMENTS_10',
    'EXPLORER_3',
    'LESSONS_50',
  ];
  if (!validCriteria.includes(criteriaType)) {
    return apiError('VALIDATION_ERROR', `Invalid criteria type: ${criteriaType}`, 400);
  }

  const threshold = typeof body.threshold === 'number' ? body.threshold : 1;

  const iconUrl = body.icon_url as string | undefined;
  if (iconUrl && typeof iconUrl === 'string') {
    try {
      new URL(iconUrl);
    } catch {
      // Allow relative paths (e.g., /icons/badge.png)
      if (!iconUrl.startsWith('/')) {
        return apiError('VALIDATION_ERROR', 'icon_url must be a valid URL or relative path', 400);
      }
    }
  }

  const { data, error } = await supabase
    .from('badges')
    .insert({
      name: name.trim(),
      description: (body.description as string) ?? '',
      icon_url: iconUrl ?? null,
      criteria: { type: criteriaType, threshold },
      active: (body.active as boolean) ?? true,
    })
    .select()
    .single();

  if (error) {
    return apiError('CREATE_ERROR', error.message, 500);
  }

  return apiSuccess(data, 201);
}
