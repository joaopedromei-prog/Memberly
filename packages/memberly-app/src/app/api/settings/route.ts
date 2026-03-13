import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/utils/api-response';

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', 'Not authenticated', 401);

  const { data: settings, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) return apiError('SERVER_ERROR', error.message, 500);

  const result: Record<string, unknown> = {};
  for (const s of settings ?? []) {
    result[s.key] = s.value;
  }

  return apiSuccess(result);
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return apiError('UNAUTHORIZED', 'Not authenticated', 401);

  const body = await request.json();

  const updates = Object.entries(body as Record<string, unknown>);
  if (updates.length === 0) {
    return apiError('VALIDATION_ERROR', 'No settings to update', 400);
  }

  for (const [key, value] of updates) {
    const { error } = await supabase
      .from('site_settings')
      .update({ value: JSON.parse(JSON.stringify(value)), updated_at: new Date().toISOString() })
      .eq('key', key);

    if (error) return apiError('SERVER_ERROR', `Failed to update ${key}: ${error.message}`, 500);
  }

  return apiSuccess({ updated: updates.map(([k]) => k) });
}
